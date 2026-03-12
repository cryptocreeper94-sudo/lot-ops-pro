import { useState, useEffect, useMemo } from "react";
import { useLocation } from "wouter";
import { motion, AnimatePresence } from "framer-motion";
import { Menu, X, Settings, Info, FileText, Shield, HelpCircle, LogOut, Copy, Check, FlaskConical, Radio, Building2, Globe, ToggleLeft, ToggleRight, GraduationCap, Loader2, ShieldCheck, Cloud, Droplets, Wind, Eye, Thermometer, MapPin } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { QRCodeSVG } from "qrcode.react";
import { useToast } from "@/hooks/use-toast";
import { useQuery } from "@tanstack/react-query";
import { APP_VERSION } from "@shared/version";
import { useSandboxMode } from "@/components/SandboxModeProvider";
import { useFacilityMode } from "@/hooks/useFacilityMode";
import { useMascot } from "@/components/MascotGuideContext";

interface WeatherData {
  location: { city: string; state?: string; country: string; lat: number; lon: number };
  current: { temp: number; feelsLike: number; humidity: number; windSpeed: number; windDirection: string; description: string; icon: string; visibility: number; pressure: number; isNight?: boolean };
  hourly: Array<{ time: string; temp: number; icon: string; description: string; precipitation: number }>;
  daily: Array<{ date: string; tempHigh: number; tempLow: number; icon: string; description: string; precipitation: number }>;
}

interface ReleaseData {
  id: number;
  version: string;
  codename: string;
  changelog: string;
  notes: string | null;
  isDraft: boolean;
  isBlockchainVerified: boolean;
  blockchainHash: string | null;
  blockchainTxId: string | null;
  publishedAt: string | null;
  createdAt: string;
}

const SYSTEM_SERIAL = "000000000-01";
const SYSTEM_HASH = "LOTOPS-2024-ALPHA-7F3A9C2B";

export function GlobalHeader() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [showVersion, setShowVersion] = useState(false);
  const [showCertification, setShowCertification] = useState(false);
  const [showWeatherModal, setShowWeatherModal] = useState(false);
  const [copied, setCopied] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [showSafetyLogin, setShowSafetyLogin] = useState(false);
  const [safetyPin, setSafetyPin] = useState("");
  const [showPinReset, setShowPinReset] = useState(false);
  const [newPin, setNewPin] = useState("");
  const [confirmPin, setConfirmPin] = useState("");
  const [pinError, setPinError] = useState("");
  const [location, setLocation] = useLocation();
  const { toast } = useToast();
  const { isSandboxMode, setSandboxMode } = useSandboxMode();
  const { isBeta, isDeveloper, modeBadgeText, modeBadgeColor, setDevModeOverride } = useFacilityMode();
  const { openTutorial } = useMascot();
  
  // Weather for header (only shown on non-login pages)
  const isLoginPage = location === '/' || location === '/login';
  const [weatherZip] = useState(() => localStorage.getItem('weatherZip') || "37122");
  
  const { data: weather, isLoading: isWeatherLoading } = useQuery<WeatherData>({
    queryKey: ["/api/weather/zip", weatherZip],
    queryFn: async () => { 
      const r = await fetch(`/api/weather/zip/${weatherZip}`); 
      if (!r.ok) throw new Error(); 
      return r.json(); 
    },
    staleTime: 600000,
    enabled: !isLoginPage,
  });

  // Fetch latest published release from API
  const { data: latestRelease, isLoading: isLoadingRelease } = useQuery<ReleaseData | null>({
    queryKey: ["/api/releases/latest"],
    staleTime: 300000, // Cache for 5 minutes
  });

  // Use API version if available, fallback to hardcoded
  const displayVersion = latestRelease?.version || APP_VERSION.full;
  const displayCodename = latestRelease?.codename || APP_VERSION.codename;
  const displayDate = latestRelease?.publishedAt 
    ? new Date(latestRelease.publishedAt).toLocaleDateString() 
    : APP_VERSION.buildDate;

  useEffect(() => {
    const checkLogin = () => {
      const userStr = localStorage.getItem("vanops_user");
      setIsLoggedIn(!!userStr);
    };
    checkLogin();
    window.addEventListener('storage', checkLogin);
    return () => window.removeEventListener('storage', checkLogin);
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("vanops_user");
    setIsLoggedIn(false);
    setLocation("/");
    setMenuOpen(false);
    toast({ title: "Logged out", description: "You have been signed out." });
  };

  const copySerial = async () => {
    await navigator.clipboard.writeText(SYSTEM_SERIAL);
    setCopied(true);
    toast({ title: "Copied!", description: "Serial number copied." });
    setTimeout(() => setCopied(false), 2000);
  };

  const handleSafetyLogin = () => {
    setPinError("");
    const storedEncodedPin = localStorage.getItem("safety_rep_pin");
    const storedPin = storedEncodedPin ? atob(storedEncodedPin) : null;
    const validPin = storedPin || "911";
    
    if (safetyPin !== validPin) {
      setPinError("Invalid PIN. Please try again.");
      return;
    }
    
    if (safetyPin === "911" && !storedPin) {
      setShowSafetyLogin(false);
      setShowPinReset(true);
      setSafetyPin("");
      return;
    }
    
    localStorage.setItem("vanops_user", JSON.stringify({
      name: "Safety Representative",
      role: "safety_advisor",
      pin: "custom"
    }));
    setIsLoggedIn(true);
    setShowSafetyLogin(false);
    setSafetyPin("");
    setMenuOpen(false);
    toast({ title: "Welcome!", description: "Logged in as Safety Representative" });
    setLocation("/safety-dashboard");
  };

  const handlePinReset = () => {
    setPinError("");
    
    if (newPin.length !== 4 || !/^\d{4}$/.test(newPin)) {
      setPinError("PIN must be exactly 4 digits");
      return;
    }
    
    if (newPin !== confirmPin) {
      setPinError("PINs do not match");
      return;
    }
    
    localStorage.setItem("safety_rep_pin", btoa(newPin));
    localStorage.setItem("vanops_user", JSON.stringify({
      name: "Safety Representative",
      role: "safety_advisor",
      pin: "custom"
    }));
    setIsLoggedIn(true);
    setShowPinReset(false);
    setNewPin("");
    setConfirmPin("");
    setMenuOpen(false);
    toast({ title: "PIN Set!", description: "Your new PIN has been saved. Welcome, Safety Representative!" });
    setLocation("/safety-dashboard");
  };

  const handleOpenTutorials = () => {
    openTutorial();
    setMenuOpen(false);
    toast({ title: "Tutorials", description: "Lot Buddy is ready to help!" });
  };

  const menuItems = [
    { icon: GraduationCap, label: "Tutorials", action: handleOpenTutorials, requiresLogin: false },
    { icon: ShieldCheck, label: "Safety Representative", action: () => setShowSafetyLogin(true), requiresLogin: false },
    { icon: Settings, label: "Settings", action: () => { setLocation("/settings"); setMenuOpen(false); }, requiresLogin: true },
    { icon: HelpCircle, label: "Help", action: () => { setLocation("/help"); setMenuOpen(false); }, requiresLogin: false },
    { icon: Info, label: "About", action: () => { setLocation("/about"); setMenuOpen(false); }, requiresLogin: false },
    { icon: FileText, label: "Terms", action: () => { setLocation("/terms"); setMenuOpen(false); }, requiresLogin: false },
    { icon: LogOut, label: "Logout", action: handleLogout, requiresLogin: true },
  ].filter(item => !item.requiresLogin || isLoggedIn);

  return (
    <>
      <header className="fixed top-0 left-0 right-0 z-50 h-10 bg-slate-900/95 backdrop-blur border-b border-slate-700/50 flex items-center justify-between px-3">
        <div className="flex items-center gap-2">
          <button
            onClick={() => setMenuOpen(true)}
            className="p-1.5 rounded-md hover:bg-slate-800 transition-colors"
            data-testid="button-menu"
          >
            <Menu className="w-4 h-4 text-slate-400" />
          </button>
          
          <span className={`px-1.5 py-0.5 rounded text-[8px] font-bold text-white ${modeBadgeColor}`}>
            {modeBadgeText}
          </span>
        </div>

        <div className="flex items-center gap-1.5">
          {/* Weather button - only on non-login pages */}
          {!isLoginPage && (
            <button
              onClick={() => setShowWeatherModal(true)}
              className="flex items-center gap-1 px-1.5 py-0.5 rounded-md bg-cyan-900/40 border border-cyan-600/20 hover:border-cyan-500/40 transition-all"
              data-testid="button-header-weather"
            >
              {isWeatherLoading ? (
                <Loader2 className="w-3 h-3 animate-spin text-cyan-400" />
              ) : (
                <>
                  <Cloud className="w-3 h-3 text-cyan-400" />
                  <span className="text-[10px] font-bold text-cyan-300">
                    {weather?.current?.temp ? `${Math.round(weather.current.temp)}°` : '--°'}
                  </span>
                </>
              )}
            </button>
          )}
          
          <button
            onClick={() => {
              setSandboxMode(!isSandboxMode);
              toast({
                title: isSandboxMode ? "Live Mode" : "Sandbox Mode",
                description: isSandboxMode ? "Switched to production data" : "Switched to demo data",
              });
            }}
            className={`flex items-center gap-1 px-2 py-0.5 rounded-full text-[9px] font-bold uppercase tracking-wide transition-all ${
              isSandboxMode 
                ? "bg-violet-900/60 border border-violet-500/40 text-violet-300 hover:border-violet-400" 
                : "bg-emerald-900/60 border border-emerald-500/40 text-emerald-300 hover:border-emerald-400"
            }`}
            data-testid="button-mode-toggle"
          >
            {isSandboxMode ? <FlaskConical className="w-3 h-3" /> : <Radio className="w-3 h-3" />}
            <span>{isSandboxMode ? "Sandbox" : "Live"}</span>
          </button>

          <button
            onClick={() => setShowCertification(true)}
            className="flex items-center gap-1 px-1.5 py-0.5 rounded-md bg-emerald-900/40 border border-emerald-600/20 hover:border-emerald-500/40 transition-all"
            data-testid="button-certified"
          >
            <Shield className="w-3 h-3 text-emerald-400" />
            <span className="text-[8px] font-bold text-emerald-300 uppercase hidden sm:inline">Cert</span>
          </button>

          <button
            onClick={() => setShowVersion(true)}
            className="px-1.5 py-0.5 rounded-md hover:bg-slate-800 transition-colors"
            data-testid="button-version"
          >
            {isLoadingRelease ? (
              <Loader2 className="w-3 h-3 animate-spin text-slate-500" />
            ) : (
              <span className="text-[9px] font-mono text-slate-500">{displayVersion}</span>
            )}
          </button>
        </div>
      </header>

      <div className="h-10" />

      <AnimatePresence>
        {menuOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/60 z-50"
              onClick={() => setMenuOpen(false)}
            />
            <motion.div
              initial={{ x: -280 }}
              animate={{ x: 0 }}
              exit={{ x: -280 }}
              transition={{ type: "spring", damping: 25 }}
              className="fixed top-0 left-0 bottom-0 w-64 bg-slate-900 border-r border-slate-700 z-50 flex flex-col"
            >
              <div className="flex items-center justify-between p-4 border-b border-slate-700">
                <div className="flex items-center gap-2">
                  <img src="/lotops-emblem-transparent.png" alt="Logo" className="w-8 h-8 object-contain" />
                  <span className="font-bold text-white text-sm">Lot Ops Pro</span>
                </div>
                <button onClick={() => setMenuOpen(false)} className="p-1 hover:bg-slate-800 rounded">
                  <X className="w-4 h-4 text-slate-400" />
                </button>
              </div>

              <nav className="flex-1 p-2">
                {menuItems.map((item, i) => (
                  <button
                    key={i}
                    onClick={item.action}
                    className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-slate-300 hover:bg-slate-800 hover:text-white transition-colors text-sm"
                  >
                    <item.icon className="w-4 h-4" />
                    {item.label}
                  </button>
                ))}
              </nav>

              {isDeveloper && (
                <div className="p-3 border-t border-slate-700 bg-slate-800/50">
                  <div className="text-[10px] text-amber-400 font-bold uppercase mb-2 flex items-center gap-1">
                    <Shield className="w-3 h-3" /> Developer Mode Toggle
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={() => {
                        setDevModeOverride("manheim_beta");
                        setMenuOpen(false);
                      }}
                      className={`flex-1 flex items-center justify-center gap-1.5 px-2 py-2 rounded-lg text-xs font-medium transition-all ${
                        isBeta 
                          ? "bg-violet-600 text-white ring-2 ring-violet-400" 
                          : "bg-slate-700 text-slate-400 hover:bg-slate-600"
                      }`}
                      data-testid="button-dev-beta-mode"
                    >
                      <Building2 className="w-3.5 h-3.5" />
                      Beta
                    </button>
                    <button
                      onClick={() => {
                        setDevModeOverride("public_demo");
                        setMenuOpen(false);
                      }}
                      className={`flex-1 flex items-center justify-center gap-1.5 px-2 py-2 rounded-lg text-xs font-medium transition-all ${
                        !isBeta 
                          ? "bg-emerald-600 text-white ring-2 ring-emerald-400" 
                          : "bg-slate-700 text-slate-400 hover:bg-slate-600"
                      }`}
                      data-testid="button-dev-public-mode"
                    >
                      <Globe className="w-3.5 h-3.5" />
                      Public
                    </button>
                  </div>
                  <p className="text-[9px] text-slate-500 mt-1.5 text-center">
                    Switch view modes for testing
                  </p>
                </div>
              )}

              <div className="p-4 border-t border-slate-700">
                <div className="text-[10px] text-slate-500 text-center">
                  {displayVersion} "{displayCodename}"
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      <Dialog open={showVersion} onOpenChange={setShowVersion}>
        <DialogContent className="max-w-sm bg-slate-900 border-slate-700">
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <img src="/lotops-emblem-transparent.png" alt="Logo" className="w-12 h-12 object-contain" />
              <div>
                <h2 className="text-lg font-bold text-white">Lot Ops Pro</h2>
                <p className="text-sm text-slate-400">{displayVersion} {latestRelease?.isDraft === false ? "Production" : APP_VERSION.label}</p>
              </div>
            </div>

            <div className="p-3 rounded-lg bg-slate-800/50 space-y-2">
              <div className="flex justify-between text-xs">
                <span className="text-slate-400">Codename</span>
                <span className="text-white font-medium">{displayCodename}</span>
              </div>
              <div className="flex justify-between text-xs">
                <span className="text-slate-400">Published</span>
                <span className="text-white font-medium">{displayDate}</span>
              </div>
              {latestRelease?.isBlockchainVerified && (
                <div className="flex justify-between text-xs">
                  <span className="text-slate-400">Blockchain</span>
                  <span className="text-emerald-400 font-medium">Verified</span>
                </div>
              )}
            </div>

            <div className="space-y-2">
              <h3 className="text-xs font-semibold text-slate-400 uppercase">Latest Features</h3>
              <div className="grid grid-cols-1 gap-1 max-h-40 overflow-y-auto">
                {APP_VERSION.buildInfo.features.slice(0, 6).map((feature, i) => (
                  <div key={i} className="text-xs text-slate-300 flex items-center gap-2">
                    <div className="w-1 h-1 rounded-full bg-emerald-400" />
                    {feature}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      <Dialog open={showCertification} onOpenChange={setShowCertification}>
        <DialogContent className="max-w-sm p-0 overflow-hidden bg-gradient-to-br from-slate-950 via-emerald-950 to-teal-950 border-emerald-700/50">
          <div className="p-5 space-y-4">
            <div className="flex items-center gap-2">
              <div className="p-2 rounded-lg bg-emerald-500/20 border border-emerald-500/30">
                <Shield className="w-5 h-5 text-emerald-400" />
              </div>
              <div>
                <h2 className="text-base font-bold text-white">Blockchain Certified</h2>
                <p className="text-[10px] text-emerald-400">Lot Ops Pro Verified System</p>
              </div>
            </div>

            <div className="flex gap-3">
              <div className="flex-shrink-0">
                <img
                  src="/lotbuddy_catalog/lotbuddy_avatar_01_mixed_male_brown_average.png"
                  alt="Lot Buddy"
                  className="w-20 h-28 object-contain"
                />
              </div>

              <div className="flex-1">
                <div className="relative">
                  <div className="absolute -inset-1 rounded-lg bg-gradient-to-r from-emerald-400 to-teal-400 opacity-40 blur animate-pulse" />
                  <div className="relative bg-white p-2 rounded-lg shadow-xl">
                    <QRCodeSVG
                      value={`lotops://verify?s=${SYSTEM_SERIAL}&h=${SYSTEM_HASH}`}
                      size={80}
                      level="H"
                      includeMargin={true}
                    />
                  </div>
                </div>
                <p className="text-[9px] text-center text-emerald-300/60 mt-1">Scan to verify</p>
              </div>
            </div>

            <div className="space-y-2">
              <div className="p-2.5 rounded-lg bg-black/40 border border-emerald-500/20">
                <div className="flex items-center justify-between mb-1">
                  <span className="text-[9px] font-semibold text-emerald-400 uppercase">System Serial</span>
                </div>
                <div className="flex items-center gap-2">
                  <code className="flex-1 text-base font-mono font-bold text-white tracking-wider">
                    {SYSTEM_SERIAL}
                  </code>
                  <Button size="sm" variant="ghost" onClick={copySerial} className="text-emerald-400 h-6 w-6 p-0">
                    {copied ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
                  </Button>
                </div>
              </div>

              <div className="p-2.5 rounded-lg bg-black/40 border border-emerald-500/20">
                <span className="text-[9px] font-semibold text-emerald-400 uppercase">Hash</span>
                <code className="block text-[10px] font-mono text-white/70 mt-1 break-all">{SYSTEM_HASH}</code>
              </div>
            </div>

            <div className="flex items-center justify-center gap-3 pt-1">
              <img src="/lotops-emblem-transparent.png" alt="Logo" className="w-10 h-10 object-contain" />
              <div className="text-center">
                <div className="text-sm font-bold text-white">Lot Ops Pro</div>
                <div className="text-[9px] text-emerald-400">{displayVersion} • Solana Verified</div>
              </div>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      <Dialog open={showSafetyLogin} onOpenChange={(open) => {
        setShowSafetyLogin(open);
        if (!open) {
          setSafetyPin("");
          setPinError("");
        }
      }}>
        <DialogContent className="max-w-sm bg-slate-900 border-slate-700">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-white">
              <ShieldCheck className="w-5 h-5 text-amber-400" />
              Safety Representative Login
            </DialogTitle>
            <DialogDescription className="text-slate-400">
              Enter your 4-digit PIN to access the Safety Dashboard
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 pt-2">
            <div className="space-y-2">
              <Label htmlFor="safety-pin" className="text-slate-300">PIN</Label>
              <Input
                id="safety-pin"
                type="password"
                maxLength={4}
                placeholder="Enter 4-digit PIN"
                value={safetyPin}
                onChange={(e) => {
                  const val = e.target.value.replace(/\D/g, "").slice(0, 4);
                  setSafetyPin(val);
                  setPinError("");
                }}
                className="bg-slate-800 border-slate-600 text-white text-center text-lg tracking-widest"
                data-testid="input-safety-pin"
              />
              {pinError && (
                <p className="text-xs text-red-400">{pinError}</p>
              )}
            </div>
            <Button
              onClick={handleSafetyLogin}
              className="w-full bg-amber-600 hover:bg-amber-700 text-white"
              disabled={safetyPin.length < 3 || safetyPin.length > 4}
              data-testid="button-safety-login"
            >
              <ShieldCheck className="w-4 h-4 mr-2" />
              Login
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      <Dialog open={showPinReset} onOpenChange={(open) => {
        setShowPinReset(open);
        if (!open) {
          setNewPin("");
          setConfirmPin("");
          setPinError("");
        }
      }}>
        <DialogContent className="max-w-sm bg-slate-900 border-slate-700">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-white">
              <ShieldCheck className="w-5 h-5 text-amber-400" />
              Set Your New PIN
            </DialogTitle>
            <DialogDescription className="text-slate-400">
              For security, please set a new 4-digit PIN to replace the default
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 pt-2">
            <div className="space-y-2">
              <Label htmlFor="new-pin" className="text-slate-300">New PIN</Label>
              <Input
                id="new-pin"
                type="password"
                maxLength={4}
                placeholder="Enter new 4-digit PIN"
                value={newPin}
                onChange={(e) => {
                  const val = e.target.value.replace(/\D/g, "").slice(0, 4);
                  setNewPin(val);
                  setPinError("");
                }}
                className="bg-slate-800 border-slate-600 text-white text-center text-lg tracking-widest"
                data-testid="input-new-pin"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="confirm-pin" className="text-slate-300">Confirm PIN</Label>
              <Input
                id="confirm-pin"
                type="password"
                maxLength={4}
                placeholder="Confirm 4-digit PIN"
                value={confirmPin}
                onChange={(e) => {
                  const val = e.target.value.replace(/\D/g, "").slice(0, 4);
                  setConfirmPin(val);
                  setPinError("");
                }}
                className="bg-slate-800 border-slate-600 text-white text-center text-lg tracking-widest"
                data-testid="input-confirm-pin"
              />
              {pinError && (
                <p className="text-xs text-red-400">{pinError}</p>
              )}
            </div>
            <Button
              onClick={handlePinReset}
              className="w-full bg-amber-600 hover:bg-amber-700 text-white"
              disabled={newPin.length !== 4 || confirmPin.length !== 4}
              data-testid="button-save-pin"
            >
              <ShieldCheck className="w-4 h-4 mr-2" />
              Save PIN & Continue
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Weather Modal */}
      <Dialog open={showWeatherModal} onOpenChange={setShowWeatherModal}>
        <DialogContent className="max-w-md bg-slate-900 border-slate-700 max-h-[85vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-white">
              <Cloud className="w-5 h-5 text-cyan-400" />
              Weather & Radar
            </DialogTitle>
            <DialogDescription className="text-slate-400">
              {weather?.location ? `${weather.location.city}, ${weather.location.state || weather.location.country}` : 'Loading...'}
            </DialogDescription>
          </DialogHeader>
          
          {weather ? (
            <Tabs defaultValue="current" className="w-full">
              <TabsList className="grid w-full grid-cols-3 bg-slate-800">
                <TabsTrigger value="current" className="text-xs">Current</TabsTrigger>
                <TabsTrigger value="forecast" className="text-xs">Forecast</TabsTrigger>
                <TabsTrigger value="radar" className="text-xs">Radar</TabsTrigger>
              </TabsList>
              
              <TabsContent value="current" className="space-y-4 mt-4">
                <div className="text-center">
                  <div className="text-5xl font-bold text-white">{Math.round(weather.current.temp)}°F</div>
                  <div className="text-slate-400 capitalize mt-1">{weather.current.description}</div>
                  <div className="text-sm text-slate-500 mt-1">Feels like {Math.round(weather.current.feelsLike)}°F</div>
                </div>
                
                <div className="grid grid-cols-2 gap-3 mt-4">
                  <div className="bg-slate-800/50 rounded-lg p-3 flex items-center gap-2">
                    <Droplets className="w-4 h-4 text-blue-400" />
                    <div>
                      <div className="text-xs text-slate-400">Humidity</div>
                      <div className="text-sm font-medium text-white">{weather.current.humidity}%</div>
                    </div>
                  </div>
                  <div className="bg-slate-800/50 rounded-lg p-3 flex items-center gap-2">
                    <Wind className="w-4 h-4 text-slate-400" />
                    <div>
                      <div className="text-xs text-slate-400">Wind</div>
                      <div className="text-sm font-medium text-white">{Math.round(weather.current.windSpeed)} mph {weather.current.windDirection}</div>
                    </div>
                  </div>
                  <div className="bg-slate-800/50 rounded-lg p-3 flex items-center gap-2">
                    <Eye className="w-4 h-4 text-slate-400" />
                    <div>
                      <div className="text-xs text-slate-400">Visibility</div>
                      <div className="text-sm font-medium text-white">{Math.round(weather.current.visibility / 1000)} mi</div>
                    </div>
                  </div>
                  <div className="bg-slate-800/50 rounded-lg p-3 flex items-center gap-2">
                    <Thermometer className="w-4 h-4 text-orange-400" />
                    <div>
                      <div className="text-xs text-slate-400">Pressure</div>
                      <div className="text-sm font-medium text-white">{weather.current.pressure} hPa</div>
                    </div>
                  </div>
                </div>
              </TabsContent>
              
              <TabsContent value="forecast" className="mt-4">
                <div className="space-y-2">
                  {weather.daily?.slice(0, 5).map((day, i) => (
                    <div key={i} className="flex items-center justify-between bg-slate-800/50 rounded-lg p-3">
                      <div className="text-sm text-slate-300">{new Date(day.date).toLocaleDateString('en-US', { weekday: 'short' })}</div>
                      <div className="text-xs text-slate-400 capitalize flex-1 mx-3 truncate">{day.description}</div>
                      <div className="text-sm font-medium text-white">{Math.round(day.tempHigh)}° / {Math.round(day.tempLow)}°</div>
                    </div>
                  ))}
                </div>
              </TabsContent>
              
              <TabsContent value="radar" className="mt-4">
                <div className="aspect-square bg-slate-800/50 rounded-lg overflow-hidden">
                  <iframe
                    src={`https://www.rainviewer.com/map.html?loc=${weather.location.lat},${weather.location.lon},8&oFa=0&oC=0&oU=0&oCS=1&oF=1&oAP=1&c=3&o=83&lm=1&layer=radar&sm=1&sn=1`}
                    className="w-full h-full border-0"
                    title="Weather Radar"
                    loading="lazy"
                  />
                </div>
                <p className="text-xs text-slate-500 text-center mt-2">Powered by RainViewer</p>
              </TabsContent>
            </Tabs>
          ) : (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="w-6 h-6 animate-spin text-cyan-400" />
            </div>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
}

export default GlobalHeader;
