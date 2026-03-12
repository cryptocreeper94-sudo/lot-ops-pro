import { useState, useEffect } from "react";
import { useLocation } from "wouter";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Users, 
  UserPlus, 
  Search, 
  QrCode, 
  Trash2, 
  ChevronRight, 
  UserCircle,
  Check,
  AlertCircle,
  Briefcase,
  Truck,
  Battery,
  Radio,
  Flashlight,
  ClipboardCheck,
  ScanBarcode,
  ArrowLeftRight,
  ClipboardList,
  Sparkles,
  Zap,
  Shield
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { Label } from "@/components/ui/label";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription } from "@/components/ui/sheet";
import { BetaWelcomeModal } from "@/components/BetaWelcomeModal";
import { AvatarPromptBanner } from "@/components/AvatarPromptBanner";
import { DemoStorage } from "@/lib/demoStorage";
import { setActiveRole, getCanonicalRole } from "@/utils/roleManager";
import { EquipmentCheckoutLog } from "@/components/EquipmentCheckoutLog";
import { NavigationControl } from "@/components/NavigationControl";
import { BentoGrid, BentoTile } from "@/components/ui/bento-grid";
import { SwipeCarousel, HorizontalScroll } from "@/components/ui/premium-carousel";
import { PremiumButton } from "@/components/ui/premium-button";

interface CrewMember {
  id: string;
  name: string;
  role: string;
  status: "active" | "break";
  avatarInitials: string;
}

const employeeDatabase = [
  { id: "E001", name: "Sarah Jenkins", role: "Driver", avatarInitials: "SJ" },
  { id: "E002", name: "Marcus O'Neil", role: "Helper", avatarInitials: "MO" },
  { id: "E003", name: "David Chen", role: "Trainee", avatarInitials: "DC" },
  { id: "E004", name: "Elena Rodriguez", role: "Driver", avatarInitials: "ER" },
  { id: "E005", name: "James Wilson", role: "Helper", avatarInitials: "JW" },
];

export default function CrewManager() {
  const [searchQuery, setSearchQuery] = useState("");
  const [crew, setCrew] = useState<CrewMember[]>([]);
  const [isScanning, setIsScanning] = useState(false);
  const [_, setLocation] = useLocation();
  const { toast } = useToast();

  useEffect(() => {
    const canonicalRole = getCanonicalRole();
    if (canonicalRole !== 'driver') {
      toast({
        title: "Access Denied",
        description: "This page is only accessible to van drivers.",
        variant: "destructive",
      });
      const userStr = localStorage.getItem('vanops_user');
      if (userStr) {
        try {
          const user = JSON.parse(userStr);
          if (user.role === 'supervisor') {
            setLocation('/resource-allocation');
          } else if (user.role === 'operations_manager') {
            setLocation('/operations-manager');
          } else if (user.role === 'inventory') {
            setLocation('/scanner');
          } else {
            setLocation('/');
          }
        } catch {
          setLocation('/');
        }
      } else {
        setLocation('/');
      }
    }
  }, [setLocation, toast]);

  const [currentDriver, setCurrentDriver] = useState<any>(null);
  const [showAvatarBanner, setShowAvatarBanner] = useState(false);
  const [showEquipmentLog, setShowEquipmentLog] = useState(false);
  const [vanNumber, setVanNumber] = useState("");
  const [radioId, setRadioId] = useState("");
  const [jumpBoxId, setJumpBoxId] = useState("");
  const [scannerId, setScannerId] = useState("");
  const [flashlightId, setFlashlightId] = useState("");

  useEffect(() => {
    const isDemoMode = DemoStorage.isDemoMode();
    if (isDemoMode) {
      const driverPhone = localStorage.getItem('current_driver_phone');
      if (driverPhone) {
        const driver = DemoStorage.findDriverByPhone(driverPhone);
        setCurrentDriver(driver);
        setShowAvatarBanner(!driver?.avatarUrl);
      }
    } else {
      const mockDriver = { name: "John Driver", avatarUrl: null };
      setCurrentDriver(mockDriver);
      setShowAvatarBanner(!mockDriver.avatarUrl);
    }
  }, []);

  const handleAvatarUpload = async (photoDataUrl: string) => {
    const isDemoMode = DemoStorage.isDemoMode();
    if (isDemoMode && currentDriver) {
      DemoStorage.updateDriver(currentDriver.id, { avatarUrl: photoDataUrl });
      setCurrentDriver({ ...currentDriver, avatarUrl: photoDataUrl });
      setShowAvatarBanner(false);
    } else {
      try {
        const res = await fetch("/api/drivers/" + currentDriver?.id + "/avatar", {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ profilePhoto: photoDataUrl })
        });
        
        if (res.ok) {
          setCurrentDriver({ ...currentDriver, avatarUrl: photoDataUrl });
          setShowAvatarBanner(false);
          toast({ title: "✓ Avatar Updated", description: "Your profile photo has been saved." });
        } else {
          toast({ title: "Error", description: "Failed to upload avatar", variant: "destructive" });
        }
      } catch (error) {
        toast({ title: "Error", description: "Failed to upload avatar", variant: "destructive" });
      }
    }
  };

  const handleSearch = (query: string) => {
    setSearchQuery(query);
  };

  const addMember = (employee: typeof employeeDatabase[0]) => {
    if (crew.find(m => m.id === employee.id)) {
      toast({
        title: "Already in crew",
        description: `${employee.name} is already assigned to your van.`,
        variant: "destructive",
      });
      return;
    }

    const newMember: CrewMember = {
      ...employee,
      status: "active",
      role: employee.role as any
    };

    setCrew([...crew, newMember]);
    setSearchQuery("");
    toast({
      title: "Member Added",
      description: `${employee.name} has been added to your roster.`,
    });
  };

  const removeMember = (id: string) => {
    setCrew(crew.filter(m => m.id !== id));
  };

  const toggleScan = () => {
    setIsScanning(!isScanning);
    if (!isScanning) {
      setTimeout(() => {
        setIsScanning(false);
        const randomEmp = employeeDatabase[Math.floor(Math.random() * employeeDatabase.length)];
        addMember(randomEmp);
      }, 2000);
    }
  };

  const handleStartShift = () => {
    if (!vanNumber) {
      toast({
        title: "Missing Information",
        description: "Please enter your Van Number to start shift.",
        variant: "destructive"
      });
      return;
    }
    setLocation("/dashboard");
  };

  const handleRoleSwitch = () => {
    const success = setActiveRole('inventory', setLocation);
    if (success) {
      toast({
        title: "Switched to Inventory Mode",
        description: "You are now in Inventory Scanner mode. Navigating to Scanner...",
        duration: 3000,
      });
    } else {
      toast({
        title: "Access Denied",
        description: "Role switching is only available for van drivers.",
        variant: "destructive",
      });
    }
  };

  const filteredEmployees = searchQuery.length > 0 
    ? employeeDatabase.filter(e => 
        e.name.toLowerCase().includes(searchQuery.toLowerCase()) && 
        !crew.find(c => c.id === e.id)
      )
    : [];

  const getRoleBadgeVariant = (role: string) => {
    switch (role) {
      case "Driver": return "default";
      case "Helper": return "secondary";
      case "Trainee": return "outline";
      default: return "secondary";
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 flex flex-col">
      <header className="bg-gradient-to-r from-slate-900/95 via-slate-800/95 to-slate-900/95 backdrop-blur-xl text-white p-4 shadow-2xl sticky top-0 z-10 border-b border-slate-700/50">
        <div className="flex justify-between items-center max-w-4xl mx-auto w-full">
          <div className="flex items-center gap-3">
            <NavigationControl variant="back" fallbackRoute="/driver-dashboard" />
            <motion.div 
              className="bg-gradient-to-br from-blue-500 to-indigo-600 p-2.5 rounded-xl shadow-lg shadow-blue-500/30"
              whileHover={{ scale: 1.05, rotate: 5 }}
              transition={{ type: "spring", stiffness: 400 }}
            >
              <ClipboardCheck className="h-6 w-6 text-white" />
            </motion.div>
            <div>
              <h1 className="font-bold text-lg leading-none bg-gradient-to-r from-blue-400 to-indigo-400 bg-clip-text text-transparent">
                Pre-Shift Setup
              </h1>
              <p className="text-[10px] text-slate-400 uppercase tracking-wider flex items-center gap-1">
                <Sparkles className="h-2.5 w-2.5" /> Equipment & Crew
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            {getCanonicalRole() === 'driver' && (
              <>
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={() => setShowEquipmentLog(true)}
                  className="gap-2 h-8 text-xs border-blue-500/50 text-blue-400 hover:bg-blue-950 font-semibold bg-blue-950/30 backdrop-blur"
                  data-testid="button-equipment-log"
                >
                  <ClipboardList className="h-3.5 w-3.5" />
                  <span className="hidden sm:inline">Log</span>
                </Button>
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={handleRoleSwitch}
                  className="gap-2 h-8 text-xs border-cyan-500/50 text-cyan-400 hover:bg-cyan-950 font-semibold bg-cyan-950/30 backdrop-blur"
                  data-testid="button-switch-role"
                >
                  <ArrowLeftRight className="h-3.5 w-3.5" />
                  <span className="hidden sm:inline">Scanner</span>
                </Button>
              </>
            )}
            <motion.div 
              className="text-right bg-gradient-to-br from-slate-800 to-slate-900 px-3 py-1.5 rounded-xl border border-slate-700/50"
              whileHover={{ scale: 1.02 }}
            >
              <div className="text-2xl font-bold font-mono text-blue-400">{crew.length}</div>
              <div className="text-[9px] text-slate-500 uppercase">Crew</div>
            </motion.div>
          </div>
        </div>
      </header>

      <main className="flex-1 p-4 max-w-4xl mx-auto w-full pb-32">
        {showAvatarBanner && currentDriver && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-4"
          >
            <AvatarPromptBanner 
              driverName={currentDriver.name}
              onPhotoUploaded={handleAvatarUpload}
            />
          </motion.div>
        )}

        <BentoGrid columns={3} gap="md" className="mb-6">
          <BentoTile
            size="lg"
            variant="gradient"
            sparkle
            icon={<Briefcase className="h-5 w-5" />}
            title="Equipment Checkout"
            description="Enter asset numbers for your shift"
            badge="Required"
            data-testid="tile-equipment-checkout"
          >
            <div className="grid grid-cols-2 md:grid-cols-3 gap-3 mt-2">
              <div className="space-y-1.5">
                <Label className="text-[10px] uppercase tracking-wider text-muted-foreground font-bold flex items-center gap-1">
                  <Truck className="h-3 w-3" /> Van #
                </Label>
                <Input 
                  placeholder="42" 
                  className="h-11 text-center font-bold text-lg bg-background/50 border-primary/30 focus:border-primary"
                  value={vanNumber}
                  onChange={(e) => setVanNumber(e.target.value)}
                  data-testid="input-van-number"
                />
              </div>

              <div className="space-y-1.5">
                <Label className="text-[10px] uppercase tracking-wider text-muted-foreground font-bold flex items-center gap-1">
                  <Radio className="h-3 w-3" /> Radio
                </Label>
                <Input 
                  placeholder="00" 
                  type="number"
                  className="h-11 text-center font-mono bg-background/50 border-border/50"
                  value={radioId}
                  onChange={(e) => setRadioId(e.target.value)}
                  data-testid="input-radio-id"
                />
              </div>

              <div className="space-y-1.5">
                <Label className="text-[10px] uppercase tracking-wider text-muted-foreground font-bold flex items-center gap-1">
                  <Battery className="h-3 w-3" /> Jump Box
                </Label>
                <Input 
                  placeholder="00" 
                  type="number"
                  className="h-11 text-center font-mono bg-background/50 border-border/50"
                  value={jumpBoxId}
                  onChange={(e) => setJumpBoxId(e.target.value)}
                  data-testid="input-jumpbox-id"
                />
              </div>

              <div className="space-y-1.5">
                <Label className="text-[10px] uppercase tracking-wider text-muted-foreground font-bold flex items-center gap-1">
                  <ScanBarcode className="h-3 w-3" /> Scanner
                </Label>
                <Input 
                  placeholder="00" 
                  type="number"
                  className="h-11 text-center font-mono bg-background/50 border-border/50"
                  value={scannerId}
                  onChange={(e) => setScannerId(e.target.value)}
                  data-testid="input-scanner-id"
                />
              </div>

              <div className="space-y-1.5">
                <Label className="text-[10px] uppercase tracking-wider text-muted-foreground font-bold flex items-center gap-1">
                  <Flashlight className="h-3 w-3" /> Light
                </Label>
                <Input 
                  placeholder="00" 
                  type="number"
                  className="h-11 text-center font-mono bg-background/50 border-border/50"
                  value={flashlightId}
                  onChange={(e) => setFlashlightId(e.target.value)}
                  data-testid="input-flashlight-id"
                />
              </div>

              <div className="flex items-end">
                <Badge 
                  variant={vanNumber ? "default" : "destructive"} 
                  className="h-11 w-full flex items-center justify-center gap-1 text-xs"
                >
                  {vanNumber ? (
                    <>
                      <Check className="h-3.5 w-3.5" /> Ready
                    </>
                  ) : (
                    <>
                      <AlertCircle className="h-3.5 w-3.5" /> Van Required
                    </>
                  )}
                </Badge>
              </div>
            </div>
          </BentoTile>

          <BentoTile
            size="md"
            variant="glass"
            icon={<Users className="h-5 w-5" />}
            title="Add Crew"
            description="Search or scan to add members"
            data-testid="tile-add-crew"
          >
            <div className="flex gap-2 mt-2">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input 
                  placeholder="Search name or ID..." 
                  className="pl-9 bg-background/50 border-border/50"
                  value={searchQuery}
                  onChange={(e) => handleSearch(e.target.value)}
                  data-testid="input-crew-search"
                />
                <AnimatePresence>
                  {filteredEmployees.length > 0 && (
                    <motion.div 
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10 }}
                      className="absolute top-full left-0 right-0 mt-2 bg-card rounded-xl shadow-2xl border border-border overflow-hidden z-50"
                    >
                      {filteredEmployees.map(emp => (
                        <button
                          key={emp.id}
                          onClick={() => addMember(emp)}
                          className="w-full text-left p-3 hover:bg-accent flex items-center gap-3 transition-colors border-b border-border/50 last:border-0"
                          data-testid={`button-add-employee-${emp.id}`}
                        >
                          <Avatar className="h-8 w-8 border-2 border-primary/20">
                            <AvatarFallback className="text-xs bg-primary/10 text-primary">{emp.avatarInitials}</AvatarFallback>
                          </Avatar>
                          <div>
                            <div className="font-bold text-sm">{emp.name}</div>
                            <div className="text-xs text-muted-foreground">{emp.role} • {emp.id}</div>
                          </div>
                          <div className="ml-auto bg-primary/10 p-1.5 rounded-full">
                            <UserPlus className="h-4 w-4 text-primary" />
                          </div>
                        </button>
                      ))}
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={toggleScan}
                className={`shrink-0 h-10 w-10 rounded-xl flex items-center justify-center transition-all ${
                  isScanning 
                    ? 'bg-red-500 text-white shadow-lg shadow-red-500/30 animate-pulse' 
                    : 'bg-primary text-primary-foreground shadow-lg shadow-primary/30'
                }`}
                data-testid="button-scan-badge"
              >
                <QrCode className="h-5 w-5" />
              </motion.button>
            </div>
            
            {isScanning && (
              <motion.div 
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                className="text-center p-4 mt-3 bg-primary/10 rounded-lg border border-dashed border-primary/30"
              >
                <motion.div
                  animate={{ scale: [1, 1.1, 1] }}
                  transition={{ repeat: Infinity, duration: 1 }}
                >
                  <QrCode className="h-8 w-8 mx-auto text-primary mb-2" />
                </motion.div>
                <p className="text-sm text-foreground font-medium">Scanning for badge...</p>
                <p className="text-xs text-muted-foreground mt-1">Hold badge near device</p>
              </motion.div>
            )}
          </BentoTile>

          <BentoTile
            size="md"
            variant="glow"
            icon={<Shield className="h-5 w-5" />}
            title="Shift Status"
            description="Your current shift overview"
            sparkle={!!vanNumber}
            data-testid="tile-shift-status"
          >
            <div className="space-y-3 mt-2">
              <div className="flex items-center justify-between p-2 bg-background/30 rounded-lg">
                <span className="text-xs text-muted-foreground">Van Assignment</span>
                <span className="font-mono font-bold text-primary">{vanNumber || "—"}</span>
              </div>
              <div className="flex items-center justify-between p-2 bg-background/30 rounded-lg">
                <span className="text-xs text-muted-foreground">Crew Members</span>
                <Badge variant="secondary">{crew.length} assigned</Badge>
              </div>
              <div className="flex flex-wrap gap-1.5">
                {radioId && <Badge variant="outline" className="text-[10px]">Radio #{radioId}</Badge>}
                {jumpBoxId && <Badge variant="outline" className="text-[10px]">Box #{jumpBoxId}</Badge>}
                {scannerId && <Badge variant="outline" className="text-[10px]">Scan #{scannerId}</Badge>}
                {flashlightId && <Badge variant="outline" className="text-[10px]">Light #{flashlightId}</Badge>}
              </div>
            </div>
          </BentoTile>
        </BentoGrid>

        <BentoTile
          size="wide"
          variant="glass"
          icon={<Users className="h-5 w-5" />}
          title="Crew Roster"
          description={crew.length > 0 ? `${crew.length} member${crew.length > 1 ? 's' : ''} assigned to your van` : "No crew members assigned yet"}
          badge={crew.length > 0 ? "Active" : undefined}
          className="mb-6"
          data-testid="tile-crew-roster"
        >
          <AnimatePresence mode="popLayout">
            {crew.length > 0 ? (
              <HorizontalScroll gap={12} className="mt-4">
                {crew.map((member) => (
                  <motion.div
                    key={member.id}
                    layout
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.8 }}
                    className="flex-shrink-0 w-[200px] bg-card/80 backdrop-blur-sm p-4 rounded-xl border border-border/50 shadow-lg group hover:border-primary/50 transition-all"
                    data-testid={`card-crew-member-${member.id}`}
                  >
                    <div className="flex flex-col items-center text-center">
                      <div className="relative mb-3">
                        <Avatar className="h-14 w-14 border-2 border-primary/30 shadow-lg shadow-primary/20">
                          <AvatarFallback className="bg-gradient-to-br from-primary/20 to-primary/5 text-primary font-bold">
                            {member.avatarInitials}
                          </AvatarFallback>
                        </Avatar>
                        <div className="absolute -bottom-1 -right-1 h-4 w-4 bg-green-500 rounded-full border-2 border-card" />
                      </div>
                      <h4 className="font-bold text-sm text-foreground truncate w-full">{member.name}</h4>
                      <Badge variant={getRoleBadgeVariant(member.role)} className="mt-1.5 text-[10px]">
                        {member.role}
                      </Badge>
                      <Button 
                        variant="ghost" 
                        size="sm"
                        className="mt-3 h-7 text-xs text-muted-foreground hover:text-destructive hover:bg-destructive/10 opacity-0 group-hover:opacity-100 transition-opacity"
                        onClick={() => removeMember(member.id)}
                        data-testid={`button-remove-crew-${member.id}`}
                      >
                        <Trash2 className="h-3 w-3 mr-1" /> Remove
                      </Button>
                    </div>
                  </motion.div>
                ))}
              </HorizontalScroll>
            ) : (
              <motion.div 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="flex flex-col items-center justify-center py-8 text-center"
              >
                <div className="h-16 w-16 rounded-2xl bg-muted/50 flex items-center justify-center mb-3">
                  <UserCircle className="h-8 w-8 text-muted-foreground" />
                </div>
                <p className="text-sm text-muted-foreground">Search above or scan badges to add crew members</p>
              </motion.div>
            )}
          </AnimatePresence>
        </BentoTile>

        <BentoGrid columns={2} gap="md">
          <BentoTile
            size="sm"
            variant="default"
            icon={<ClipboardList className="h-5 w-5" />}
            title="Equipment Log"
            description="View checkout history"
            onClick={() => setShowEquipmentLog(true)}
            data-testid="tile-equipment-history"
            action={
              <Button variant="ghost" size="sm" className="w-full text-xs">
                View Log <ChevronRight className="h-3 w-3 ml-1" />
              </Button>
            }
          />

          <BentoTile
            size="sm"
            variant="default"
            icon={<ArrowLeftRight className="h-5 w-5" />}
            title="Switch Mode"
            description="Inventory scanner mode"
            onClick={handleRoleSwitch}
            data-testid="tile-switch-mode"
            action={
              <Button variant="ghost" size="sm" className="w-full text-xs">
                Switch <ChevronRight className="h-3 w-3 ml-1" />
              </Button>
            }
          />
        </BentoGrid>
      </main>

      <motion.div 
        initial={{ y: 100 }}
        animate={{ y: 0 }}
        className="fixed bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-slate-950 via-slate-950/95 to-transparent backdrop-blur-xl border-t border-slate-800/50 z-30"
      >
        <div className="max-w-4xl mx-auto flex items-center gap-4">
          <div className="flex-1 min-w-0">
            <p className="text-xs text-slate-500 truncate">
              {vanNumber ? `Ready to start • Van ${vanNumber}` : 'Enter van number to begin'}
            </p>
            <div className="flex flex-wrap gap-1 mt-1">
              {crew.length > 0 && (
                <Badge variant="secondary" className="text-[10px]">
                  {crew.length} crew
                </Badge>
              )}
              {[radioId, jumpBoxId, scannerId, flashlightId].filter(Boolean).length > 0 && (
                <Badge variant="outline" className="text-[10px]">
                  {[radioId, jumpBoxId, scannerId, flashlightId].filter(Boolean).length} items
                </Badge>
              )}
            </div>
          </div>
          <PremiumButton
            variant={vanNumber ? "premium" : "default"}
            size="lg"
            shine={!!vanNumber}
            pulse={!!vanNumber}
            disabled={!vanNumber}
            onClick={handleStartShift}
            icon={<Zap className="h-5 w-5" />}
            iconPosition="right"
            data-testid="button-start-shift"
          >
            Start Shift
          </PremiumButton>
        </div>
      </motion.div>
      
      <BetaWelcomeModal />

      <Sheet open={showEquipmentLog} onOpenChange={setShowEquipmentLog}>
        <SheetContent side="right" className="w-full sm:max-w-2xl overflow-y-auto">
          <SheetHeader>
            <SheetTitle className="flex items-center gap-2">
              <ClipboardList className="h-5 w-5 text-primary" />
              Equipment Checkout Log
            </SheetTitle>
            <SheetDescription>
              Track your daily equipment checkout and report missing items
            </SheetDescription>
          </SheetHeader>
          <div className="mt-6">
            <EquipmentCheckoutLog
              mode="driver"
              driverId={currentDriver?.id || parseInt(localStorage.getItem('user_id') || '0')}
              driverName={currentDriver?.name || localStorage.getItem('user_name') || 'Driver'}
              driverNumber={currentDriver?.number || localStorage.getItem('user_number') || vanNumber || '00'}
            />
          </div>
        </SheetContent>
      </Sheet>
    </div>
  );
}
