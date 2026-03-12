import { useState, useEffect, useRef } from "react";
import { useLocation } from "wouter";
import { motion, AnimatePresence } from "framer-motion";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { useTheme } from "@/contexts/ThemeContext";
import { BentoGrid, BentoTile } from "@/components/ui/bento-grid";
import { 
  PremiumAccordion, 
  PremiumAccordionItem, 
  PremiumAccordionTrigger, 
  PremiumAccordionContent 
} from "@/components/ui/premium-accordion";
import { PremiumButton } from "@/components/ui/premium-button";
import { 
  User, 
  Bell, 
  HelpCircle, 
  LogOut, 
  Camera, 
  Save,
  Volume2,
  VolumeX,
  Smartphone,
  ChevronRight,
  Palette,
  Sparkles,
  Crown,
  CheckCircle2,
  Settings as SettingsIcon,
  Shield,
  Edit3,
  ExternalLink,
  MapPin,
  FileCheck,
  AlertTriangle,
  Car,
  Monitor,
  Moon,
  Sun,
  Zap,
  Gift,
  Star,
  Heart
} from "lucide-react";
import { Checkbox } from "@/components/ui/checkbox";
import { Footer } from "@/components/Footer";
import { NavigationControl } from "@/components/NavigationControl";
import { LotBuddyAvatarSelector } from "@/components/LotBuddyAvatarSelector";
import { VehicleSelector } from "@/components/VehicleSelector";
import { ThemeRequestDialog } from "@/components/ThemeRequestDialog";
import { Button } from "@/components/ui/button";

const categoryLabels: Record<string, { label: string; icon: string; color: string }> = {
  classic: { label: "Classic", icon: "🎨", color: "from-slate-600 to-slate-800" },
  nfl: { label: "NFL", icon: "🏈", color: "from-green-600 to-green-800" },
  mlb: { label: "MLB", icon: "⚾", color: "from-red-600 to-red-800" },
  nba: { label: "NBA", icon: "🏀", color: "from-orange-600 to-orange-800" },
  nhl: { label: "NHL", icon: "🏒", color: "from-blue-600 to-blue-800" },
  mls: { label: "MLS", icon: "⚽", color: "from-emerald-600 to-emerald-800" },
  wsl: { label: "WSL", icon: "⚽", color: "from-pink-600 to-pink-800" },
  epl: { label: "EPL", icon: "🏴󠁧󠁢󠁥󠁮󠁧󠁿", color: "from-purple-600 to-purple-800" },
  laliga: { label: "La Liga", icon: "🇪🇸", color: "from-yellow-600 to-red-700" },
  bundesliga: { label: "Bundesliga", icon: "🇩🇪", color: "from-black to-red-800" },
  seriea: { label: "Serie A", icon: "🇮🇹", color: "from-green-700 to-red-700" },
  ligue1: { label: "Ligue 1", icon: "🇫🇷", color: "from-blue-700 to-red-700" },
  college: { label: "NCAA", icon: "🎓", color: "from-amber-600 to-amber-800" },
  golf: { label: "Golf", icon: "⛳", color: "from-green-500 to-green-700" },
  nature: { label: "Nature", icon: "🌿", color: "from-teal-600 to-teal-800" }
};

function PoliciesSection({ userPin, stripeCustomerId }: { userPin: string; stripeCustomerId?: string | null }) {
  const { toast } = useToast();
  const [handsFreeAcknowledged, setHandsFreeAcknowledged] = useState(false);
  const [safetyAcknowledged, setSafetyAcknowledged] = useState(false);
  const [locationStatus, setLocationStatus] = useState<'unknown' | 'granted' | 'denied' | 'prompt'>('unknown');
  const [locationAcknowledged, setLocationAcknowledged] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const checkPolicies = async () => {
      if (!userPin) {
        setLoading(false);
        return;
      }
      try {
        const tenantParam = stripeCustomerId ? `?stripeCustomerId=${encodeURIComponent(stripeCustomerId)}` : '';
        const [handsFreeRes, safetyRes, locationRes] = await Promise.all([
          fetch(`/api/policies/check/${userPin}/hands_free${tenantParam}`),
          fetch(`/api/policies/check/${userPin}/safety_rules${tenantParam}`),
          fetch(`/api/policies/check/${userPin}/location_permission${tenantParam}`)
        ]);
        
        if (handsFreeRes.ok) {
          const data = await handsFreeRes.json();
          setHandsFreeAcknowledged(data.acknowledged);
        }
        if (safetyRes.ok) {
          const data = await safetyRes.json();
          setSafetyAcknowledged(data.acknowledged);
        }
        if (locationRes.ok) {
          const data = await locationRes.json();
          setLocationAcknowledged(data.acknowledged);
        }
      } catch (error) {
        console.error("Failed to check policies:", error);
      } finally {
        setLoading(false);
      }
    };

    checkPolicies();
    
    if (navigator.permissions) {
      navigator.permissions.query({ name: 'geolocation' }).then(permission => {
        setLocationStatus(permission.state as 'granted' | 'denied' | 'prompt');
        permission.onchange = () => {
          setLocationStatus(permission.state as 'granted' | 'denied' | 'prompt');
        };
      }).catch(() => {
        setLocationStatus('unknown');
      });
    }
  }, [userPin]);

  const acknowledgePolicy = async (policyKey: string, extraData?: Record<string, any>) => {
    try {
      const res = await fetch('/api/policies/acknowledge', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userPin, policyKey, stripeCustomerId, ...extraData })
      });
      
      if (res.ok) {
        if (policyKey === 'hands_free') setHandsFreeAcknowledged(true);
        if (policyKey === 'safety_rules') setSafetyAcknowledged(true);
        if (policyKey === 'location_permission') setLocationAcknowledged(true);
        toast({ title: "✓ Policy Acknowledged", description: "Thank you for reviewing this policy" });
      }
    } catch (error) {
      toast({ title: "Error", description: "Failed to save acknowledgment", variant: "destructive" });
    }
  };

  const requestLocationPermission = () => {
    navigator.geolocation.getCurrentPosition(
      () => {
        setLocationStatus('granted');
        acknowledgePolicy('location_permission', { locationPermissionStatus: 'granted' });
      },
      () => {
        setLocationStatus('denied');
        acknowledgePolicy('location_permission', { locationPermissionStatus: 'denied' });
      }
    );
  };

  if (loading) {
    return <div className="text-xs text-slate-400 text-center py-4">Loading policies...</div>;
  }

  return (
    <PremiumAccordion type="multiple" defaultValue={["driving", "location", "safety"]}>
      <PremiumAccordionItem value="driving" variant="glass">
        <PremiumAccordionTrigger 
          icon={<Car className="w-4 h-4" />}
          badge={handsFreeAcknowledged ? "✓" : undefined}
        >
          Handsfree Driving Policy
        </PremiumAccordionTrigger>
        <PremiumAccordionContent>
          <p className="text-xs text-muted-foreground mb-3">
            I acknowledge that I will only use this app hands-free while operating a vehicle. I will pull over safely before interacting with the screen.
          </p>
          {!handsFreeAcknowledged ? (
            <div className="flex items-center gap-2">
              <Checkbox 
                id="hands-free"
                onCheckedChange={(checked) => {
                  if (checked) acknowledgePolicy('hands_free');
                }}
                data-testid="checkbox-hands-free"
              />
              <Label htmlFor="hands-free" className="text-xs text-muted-foreground cursor-pointer">
                I agree to drive hands-free
              </Label>
            </div>
          ) : (
            <Badge className="bg-green-500/20 text-green-400 border-green-500/30">
              <CheckCircle2 className="w-3 h-3 mr-1" /> Acknowledged
            </Badge>
          )}
        </PremiumAccordionContent>
      </PremiumAccordionItem>

      <PremiumAccordionItem value="location" variant="glass">
        <PremiumAccordionTrigger 
          icon={<MapPin className="w-4 h-4" />}
          badge={locationAcknowledged ? "✓" : undefined}
        >
          Location Permission
        </PremiumAccordionTrigger>
        <PremiumAccordionContent>
          <p className="text-xs text-muted-foreground mb-3">
            This app uses GPS for driver tracking, geofence detection, and real-time routing. Location data is only used while the app is active.
          </p>
          <div className="flex items-center gap-2">
            {locationStatus === 'granted' ? (
              <Badge className="bg-green-500/20 text-green-400 border-green-500/30">
                <CheckCircle2 className="w-3 h-3 mr-1" /> Location Enabled
              </Badge>
            ) : locationStatus === 'denied' ? (
              <Badge className="bg-red-500/20 text-red-400 border-red-500/30">
                ✗ Location Denied
              </Badge>
            ) : (
              <PremiumButton
                size="sm"
                variant="primary"
                icon={<MapPin className="w-3 h-3" />}
                onClick={requestLocationPermission}
                data-testid="button-enable-location"
              >
                Enable Location
              </PremiumButton>
            )}
          </div>
        </PremiumAccordionContent>
      </PremiumAccordionItem>

      <PremiumAccordionItem value="safety" variant="glass">
        <PremiumAccordionTrigger 
          icon={<AlertTriangle className="w-4 h-4" />}
          badge={safetyAcknowledged ? "✓" : undefined}
        >
          Safety Rules
        </PremiumAccordionTrigger>
        <PremiumAccordionContent>
          <p className="text-xs text-muted-foreground mb-3">
            I acknowledge that I have read and understand the facility safety rules including speed limits, pedestrian right-of-way, and equipment handling procedures.
          </p>
          {!safetyAcknowledged ? (
            <div className="flex items-center gap-2">
              <Checkbox 
                id="safety-rules"
                onCheckedChange={(checked) => {
                  if (checked) acknowledgePolicy('safety_rules');
                }}
                data-testid="checkbox-safety-rules"
              />
              <Label htmlFor="safety-rules" className="text-xs text-muted-foreground cursor-pointer">
                I acknowledge the safety rules
              </Label>
            </div>
          ) : (
            <Badge className="bg-green-500/20 text-green-400 border-green-500/30">
              <CheckCircle2 className="w-3 h-3 mr-1" /> Acknowledged
            </Badge>
          )}
        </PremiumAccordionContent>
      </PremiumAccordionItem>
    </PremiumAccordion>
  );
}

function ThemeMicroGallery({ userId, userName }: { userId: string; userName: string }) {
  const { currentTheme, setTheme, availableThemes } = useTheme();
  const [selectedCategory, setSelectedCategoryState] = useState<string | null>(() => 
    localStorage.getItem('lotops_theme_category') || null
  );
  
  const setSelectedCategory = (value: string | null) => {
    if (value) {
      localStorage.setItem('lotops_theme_category', value);
    } else {
      localStorage.removeItem('lotops_theme_category');
    }
    setSelectedCategoryState(value);
  };
  const [requestDialogOpen, setRequestDialogOpen] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);
  
  const themesByCategory = availableThemes.reduce((acc, theme) => {
    if (!acc[theme.category]) acc[theme.category] = [];
    acc[theme.category].push(theme);
    return acc;
  }, {} as Record<string, typeof availableThemes>);
  
  const categories = Object.keys(themesByCategory).filter(cat => categoryLabels[cat]);
  
  return (
    <div className="space-y-4">
      <motion.div 
        className="flex items-center gap-3 p-3 rounded-xl bg-gradient-to-r from-purple-900/40 via-blue-900/30 to-purple-900/40 border border-purple-500/30 backdrop-blur-sm"
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.3 }}
      >
        <div 
          className={`w-12 h-12 rounded-xl bg-gradient-to-br ${currentTheme.colors.primary} border-2 border-white/20 shadow-lg flex-shrink-0 relative overflow-hidden`}
          style={{
            backgroundImage: currentTheme.watermark ? `url(${currentTheme.watermark})` : undefined,
            backgroundSize: "cover",
            backgroundPosition: "center"
          }}
        >
          <div className="absolute inset-0 bg-gradient-to-t from-black/30 to-transparent" />
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <Crown className="w-4 h-4 text-yellow-400" />
            <span className="text-sm font-bold text-foreground truncate">{currentTheme.name}</span>
          </div>
          <p className="text-xs text-muted-foreground">Active Theme</p>
        </div>
        <CheckCircle2 className="w-5 h-5 text-green-400 flex-shrink-0" />
      </motion.div>
      
      <div 
        ref={scrollRef}
        className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide"
        style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
      >
        {categories.map(cat => {
          const info = categoryLabels[cat];
          const count = themesByCategory[cat]?.length || 0;
          const isActive = selectedCategory === cat;
          const hasCurrentTheme = themesByCategory[cat]?.some(t => t.id === currentTheme.id);
          
          return (
            <motion.button
              key={cat}
              onClick={() => setSelectedCategory(isActive ? null : cat)}
              className={`flex-shrink-0 flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold transition-all ${
                isActive 
                  ? 'bg-gradient-to-r from-purple-500 to-blue-500 text-white shadow-lg shadow-purple-500/30' 
                  : 'bg-card/80 text-muted-foreground hover:bg-accent border border-border/50'
              } ${hasCurrentTheme ? 'ring-2 ring-yellow-400/50' : ''}`}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              data-testid={`category-${cat}`}
            >
              <span>{info.icon}</span>
              <span>{info.label}</span>
              <span className="text-[10px] opacity-70">({count})</span>
            </motion.button>
          );
        })}
      </div>
      
      <AnimatePresence>
        {selectedCategory && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="overflow-hidden"
          >
            <div className="grid grid-cols-4 sm:grid-cols-6 gap-2 p-3 rounded-xl bg-card/50 border border-border/50 backdrop-blur-sm">
              {themesByCategory[selectedCategory]?.map(theme => {
                const isSelected = currentTheme.id === theme.id;
                return (
                  <motion.button
                    key={theme.id}
                    onClick={() => setTheme(theme.id)}
                    className={`relative aspect-square rounded-lg overflow-hidden transition-all ${
                      isSelected 
                        ? 'ring-2 ring-yellow-400 shadow-lg shadow-yellow-400/30 scale-105 z-10' 
                        : 'hover:scale-105 border border-border/30 hover:border-primary/50'
                    }`}
                    whileHover={{ y: -2 }}
                    whileTap={{ scale: 0.95 }}
                    data-testid={`theme-${theme.id}`}
                  >
                    <div 
                      className={`absolute inset-0 bg-gradient-to-br ${theme.colors.primary}`}
                      style={{
                        backgroundImage: theme.watermark ? `url(${theme.watermark})` : undefined,
                        backgroundSize: "cover",
                        backgroundPosition: "center"
                      }}
                    />
                    {isSelected && (
                      <div className="absolute inset-0 flex items-center justify-center bg-black/30">
                        <CheckCircle2 className="w-5 h-5 text-yellow-400" />
                      </div>
                    )}
                    <div className="absolute bottom-0 inset-x-0 bg-gradient-to-t from-black/80 to-transparent p-1">
                      <p className="text-[8px] text-white text-center truncate font-medium">{theme.name.replace(/^(The |)/, '').slice(0, 12)}</p>
                    </div>
                  </motion.button>
                );
              })}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
      
      <PremiumButton
        variant="glass"
        className="w-full"
        icon={<Sparkles className="w-4 h-4" />}
        shine
        onClick={() => setRequestDialogOpen(true)}
        data-testid="button-request-theme"
      >
        Request New Theme
      </PremiumButton>
      
      <ThemeRequestDialog open={requestDialogOpen} onOpenChange={setRequestDialogOpen} userId={userId} userName={userName} />
    </div>
  );
}

export default function Settings() {
  const [_, setLocation] = useLocation();
  const { toast } = useToast();
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const [user, setUser] = useState<any>(null);
  const [displayName, setDisplayName] = useState("");
  const [avatarUrl, setAvatarUrl] = useState("");
  const [notificationsEnabled, setNotificationsEnabled] = useState(true);
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [vibrationEnabled, setVibrationEnabled] = useState(true);
  const [isEditingProfile, setIsEditingProfile] = useState(false);

  useEffect(() => {
    const userStr = localStorage.getItem("vanops_user");
    if (!userStr) {
      setLocation("/");
      return;
    }
    
    const userData = JSON.parse(userStr);
    
    if (userData.employeeType === "temporary") {
      toast({
        title: "Access Restricted",
        description: "Temporary employees cannot access Settings",
        variant: "destructive",
      });
      setTimeout(() => setLocation("/scanner"), 500);
      return;
    }
    
    setUser(userData);
    setDisplayName(userData.name || "");
    setAvatarUrl(userData.avatarUrl || "");
    
    setNotificationsEnabled(localStorage.getItem("pref_notifications") !== "false");
    setSoundEnabled(localStorage.getItem("pref_sound") !== "false");
    setVibrationEnabled(localStorage.getItem("pref_vibration") !== "false");
  }, []);

  const handleAvatarUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 2 * 1024 * 1024) {
      toast({
        title: "File too large",
        description: "Avatar must be smaller than 2MB",
        variant: "destructive",
      });
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      const base64String = event.target?.result as string;
      setAvatarUrl(base64String);
    };
    reader.readAsDataURL(file);
  };

  const saveSettings = () => {
    const updatedUser = { ...user, name: displayName, avatarUrl };
    localStorage.setItem("vanops_user", JSON.stringify(updatedUser));
    localStorage.setItem("pref_notifications", notificationsEnabled.toString());
    localStorage.setItem("pref_sound", soundEnabled.toString());
    localStorage.setItem("pref_vibration", vibrationEnabled.toString());
    
    setIsEditingProfile(false);
    toast({ title: "✓ Settings Saved", description: "Your preferences have been updated" });
  };

  const handleLogout = () => {
    localStorage.removeItem("vanops_user");
    localStorage.removeItem("vanops_demo_mode");
    localStorage.removeItem("vanops_demo_expiry");
    localStorage.removeItem("vanops_pin");
    toast({ title: "Logged Out", description: "You have been successfully logged out" });
    setTimeout(() => setLocation("/"), 500);
  };

  const getRoleLabel = (role: string) => {
    const labels: Record<string, string> = {
      van_driver: "Van Driver", inventory_driver: "Inventory", supervisor: "Supervisor",
      operations_manager: "Ops Manager", safety_advisor: "Safety", developer: "Developer"
    };
    return labels[role] || role;
  };

  const getBackPath = () => {
    if (!user) return "/dashboard";
    const paths: Record<string, string> = {
      van_driver: "/driver-dashboard", inventory_driver: "/scanner", supervisor: "/resource-allocation",
      operations_manager: "/operations-manager", safety_advisor: "/safety-dashboard", developer: "/developer"
    };
    return paths[user.role] || "/dashboard";
  };

  if (!user) return null;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 pb-20">
      <motion.div 
        className="bg-gradient-to-r from-slate-800/90 to-slate-900/90 backdrop-blur-xl text-white px-4 py-3 shadow-2xl sticky top-0 z-50 border-b border-white/10"
        initial={{ y: -20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.3 }}
      >
        <div className="flex items-center justify-between max-w-6xl mx-auto">
          <div className="flex items-center gap-3">
            <NavigationControl variant="back" fallbackRoute={getBackPath()} />
            <div className="p-2 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-500 shadow-lg shadow-emerald-500/25">
              <SettingsIcon className="w-4 h-4 text-white" />
            </div>
            <div>
              <h1 className="text-base font-bold">Settings</h1>
              <p className="text-xs text-white/60">Personalize your experience</p>
            </div>
          </div>
          <PremiumButton
            variant="gradient"
            size="sm"
            icon={<Save className="w-4 h-4" />}
            shine
            onClick={saveSettings}
            data-testid="button-save-settings"
          >
            Save
          </PremiumButton>
        </div>
      </motion.div>

      <div className="max-w-6xl mx-auto p-4">
        <BentoGrid columns={2} gap="md" className="mb-6">
          <BentoTile
            variant="premium"
            size="lg"
            sparkle
            className="relative overflow-visible"
            data-testid="tile-profile"
          >
            <div className="flex items-center gap-4">
              <div className="relative">
                <input ref={fileInputRef} type="file" accept="image/*" capture="environment" onChange={handleAvatarUpload} className="hidden" />
                <motion.div
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <Avatar 
                    className="h-20 w-20 border-3 border-amber-500/50 shadow-xl shadow-amber-500/20 cursor-pointer ring-4 ring-amber-400/20"
                    onClick={() => fileInputRef.current?.click()}
                  >
                    {avatarUrl ? (
                      <AvatarImage src={avatarUrl} alt={displayName} />
                    ) : (
                      <AvatarFallback className="bg-gradient-to-br from-amber-500 to-orange-600 text-white text-2xl font-bold">
                        {displayName.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)}
                      </AvatarFallback>
                    )}
                  </Avatar>
                </motion.div>
                <motion.button 
                  onClick={() => fileInputRef.current?.click()}
                  className="absolute -bottom-1 -right-1 w-7 h-7 rounded-full bg-gradient-to-br from-amber-400 to-orange-500 flex items-center justify-center shadow-lg border-2 border-white/20"
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                  data-testid="button-change-avatar"
                >
                  <Camera className="w-3.5 h-3.5 text-white" />
                </motion.button>
              </div>
              
              <div className="flex-1 min-w-0">
                {isEditingProfile ? (
                  <Input
                    value={displayName}
                    onChange={(e) => setDisplayName(e.target.value)}
                    className="h-9 text-base bg-white/10 border-white/20 text-white font-semibold"
                    autoFocus
                    onBlur={() => setIsEditingProfile(false)}
                    onKeyDown={(e) => e.key === 'Enter' && setIsEditingProfile(false)}
                    data-testid="input-display-name"
                  />
                ) : (
                  <motion.div 
                    className="flex items-center gap-2 cursor-pointer group"
                    onClick={() => setIsEditingProfile(true)}
                  >
                    <h2 className="text-lg font-bold text-white truncate">{displayName}</h2>
                    <Edit3 className="w-4 h-4 text-white/40 group-hover:text-amber-400 transition-colors" />
                  </motion.div>
                )}
                <div className="flex flex-wrap items-center gap-2 mt-2">
                  <Badge className="bg-amber-500/20 text-amber-300 border-amber-500/30 font-semibold">
                    <Star className="w-3 h-3 mr-1" />
                    {getRoleLabel(user.role)}
                  </Badge>
                  {user.isBetaTester && (
                    <Badge className="bg-purple-500/20 text-purple-300 border-purple-500/30">
                      <Zap className="w-3 h-3 mr-1" />
                      Beta Tester
                    </Badge>
                  )}
                </div>
              </div>
              
              <PremiumButton
                variant="danger"
                size="sm"
                icon={<LogOut className="w-4 h-4" />}
                onClick={handleLogout}
                data-testid="button-logout"
              >
                Logout
              </PremiumButton>
            </div>
          </BentoTile>
        </BentoGrid>

        <BentoGrid columns={3} gap="md">
          <BentoTile
            variant="glass"
            size="md"
            icon={<Bell className="w-5 h-5" />}
            title="Notifications"
            badge={notificationsEnabled ? "On" : "Off"}
            sparkle
            data-testid="tile-notifications"
          >
            <div className="space-y-3 mt-2">
              <div className="flex items-center justify-between p-2 rounded-lg bg-white/5 hover:bg-white/10 transition-colors">
                <div className="flex items-center gap-2">
                  <Bell className="w-4 h-4 text-blue-400" />
                  <span className="text-sm text-foreground">Push Alerts</span>
                </div>
                <Switch 
                  checked={notificationsEnabled} 
                  onCheckedChange={setNotificationsEnabled} 
                  data-testid="switch-notifications" 
                />
              </div>
              <div className="flex items-center justify-between p-2 rounded-lg bg-white/5 hover:bg-white/10 transition-colors">
                <div className="flex items-center gap-2">
                  {soundEnabled ? <Volume2 className="w-4 h-4 text-green-400" /> : <VolumeX className="w-4 h-4 text-muted-foreground" />}
                  <span className="text-sm text-foreground">Sound</span>
                </div>
                <Switch 
                  checked={soundEnabled} 
                  onCheckedChange={setSoundEnabled} 
                  data-testid="switch-sound" 
                />
              </div>
              <div className="flex items-center justify-between p-2 rounded-lg bg-white/5 hover:bg-white/10 transition-colors">
                <div className="flex items-center gap-2">
                  <Smartphone className="w-4 h-4 text-purple-400" />
                  <span className="text-sm text-foreground">Vibration</span>
                </div>
                <Switch 
                  checked={vibrationEnabled} 
                  onCheckedChange={setVibrationEnabled} 
                  data-testid="switch-vibration" 
                />
              </div>
            </div>
          </BentoTile>

          <BentoTile
            variant="glass"
            size="md"
            icon={<HelpCircle className="w-5 h-5" />}
            title="Help & Support"
            data-testid="tile-help"
          >
            <div className="space-y-2 mt-2">
              <motion.button
                onClick={() => setLocation("/help")}
                className="w-full flex items-center justify-between p-3 rounded-xl bg-white/5 hover:bg-white/10 transition-all border border-white/5 hover:border-primary/30"
                whileHover={{ x: 4 }}
                data-testid="button-help-guide"
              >
                <div className="flex items-center gap-2">
                  <HelpCircle className="w-4 h-4 text-amber-400" />
                  <span className="text-sm text-foreground">Help Guide</span>
                </div>
                <ChevronRight className="w-4 h-4 text-muted-foreground" />
              </motion.button>
              <motion.button
                onClick={() => setLocation("/about")}
                className="w-full flex items-center justify-between p-3 rounded-xl bg-white/5 hover:bg-white/10 transition-all border border-white/5 hover:border-primary/30"
                whileHover={{ x: 4 }}
                data-testid="button-about"
              >
                <div className="flex items-center gap-2">
                  <ExternalLink className="w-4 h-4 text-blue-400" />
                  <span className="text-sm text-foreground">About Lot Ops Pro</span>
                </div>
                <ChevronRight className="w-4 h-4 text-muted-foreground" />
              </motion.button>
            </div>
          </BentoTile>

          <BentoTile
            variant="glow"
            size="md"
            icon={<Shield className="w-5 h-5" />}
            title="Policies & Permissions"
            badge="Required"
            sparkle
            data-testid="tile-policies"
          >
            <div className="mt-2">
              <PoliciesSection userPin={user.pin || ''} stripeCustomerId={user.stripeCustomerId} />
            </div>
          </BentoTile>

          <BentoTile
            variant="gradient"
            size="wide"
            icon={<Palette className="w-5 h-5" />}
            title="Themes"
            description="Personalize your app appearance"
            badge="300+"
            sparkle
            data-testid="tile-themes"
          >
            <ThemeMicroGallery userId={user.id || user.pin || ''} userName={displayName} />
          </BentoTile>

          <BentoTile
            variant="premium"
            size="wide"
            icon={<Heart className="w-5 h-5" />}
            title="Lot Buddy"
            description="Your virtual assistant companion"
            sparkle
            data-testid="tile-lotbuddy"
          >
            <LotBuddyAvatarSelector />
          </BentoTile>

          <BentoTile
            variant="glow"
            size="wide"
            icon={<Car className="w-5 h-5" />}
            title="Your Ride & Scene"
            description="Choose your vehicle and scene decoration"
            sparkle
            data-testid="tile-vehicle"
          >
            <VehicleSelector />
          </BentoTile>
        </BentoGrid>
      </div>

      <Footer />
      
      <style>{`
        .scrollbar-hide::-webkit-scrollbar { display: none; }
      `}</style>
    </div>
  );
}
