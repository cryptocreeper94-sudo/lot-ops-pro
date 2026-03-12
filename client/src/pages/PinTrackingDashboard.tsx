import { useState, useEffect } from "react";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Users, LogIn, Calendar, Award, TrendingUp, X } from "lucide-react";
import { NavigationControl } from "@/components/NavigationControl";
import { BentoGrid, BentoTile } from "@/components/ui/bento-grid";
import { PremiumAccordion, PremiumAccordionItem, PremiumAccordionTrigger, PremiumAccordionContent } from "@/components/ui/premium-accordion";
import { SwipeCarousel } from "@/components/ui/premium-carousel";
import { PremiumButton } from "@/components/ui/premium-button";

interface PinLogin {
  id: number;
  pin: string;
  userName: string;
  userRole: string;
  loginTimestamp: string;
  loginDate: string;
  loginTime: string;
}

interface BetaTester {
  pin: string;
  userName: string;
  userRole: string;
  loginCount: number;
  firstLogin: string;
  lastLogin: string;
}

export default function PinTrackingDashboard() {
  const [pinLogins, setPinLogins] = useState<PinLogin[]>([]);
  const [betaTesters, setBetaTesters] = useState<BetaTester[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedPin, setSelectedPin] = useState<string | null>(null);

  useEffect(() => {
    loadData();
    const interval = setInterval(loadData, 10000);
    return () => clearInterval(interval);
  }, []);

  const loadData = async () => {
    try {
      const [loginsRes, testersRes] = await Promise.all([
        fetch("/api/pin-logins"),
        fetch("/api/pin-logins/testers")
      ]);

      if (loginsRes.ok && testersRes.ok) {
        const logins = await loginsRes.json();
        const testers = await testersRes.json();
        setPinLogins(logins);
        setBetaTesters(testers);
      }
      setLoading(false);
    } catch (error) {
      console.error("Failed to load PIN tracking data:", error);
      setLoading(false);
    }
  };

  const getRoleColor = (role: string) => {
    const colors: Record<string, string> = {
      driver: "bg-blue-100 text-blue-800",
      inventory: "bg-green-100 text-green-800",
      supervisor: "bg-purple-100 text-purple-800",
      operations_manager: "bg-red-100 text-red-800",
      developer: "bg-yellow-100 text-yellow-800",
      safety_advisor: "bg-pink-100 text-pink-800",
    };
    return colors[role] || "bg-gray-100 text-gray-800";
  };

  const filteredLogins = selectedPin
    ? pinLogins.filter((login) => login.pin === selectedPin)
    : pinLogins.slice(0, 50);

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 p-4 flex items-center justify-center">
        <BentoTile variant="glass" sparkle className="p-8">
          <div className="flex flex-col items-center">
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            <p className="mt-4 text-slate-300">Loading PIN tracking data...</p>
          </div>
        </BentoTile>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 p-4">
      <div className="max-w-7xl mx-auto">
        <NavigationControl variant="back" fallbackRoute="/developer" />
        
        <div className="mb-6">
          <div className="flex items-center gap-3 mb-3">
            <Award className="w-8 h-8 text-amber-500" />
            <h1 className="text-3xl font-bold text-white" data-testid="text-page-title">Beta Tester Tracking</h1>
          </div>
          <p className="text-slate-400" data-testid="text-page-description">Monitor all PIN logins issued for beta testing and track contributors</p>
        </div>

        <BentoGrid columns={3} gap="md" className="mb-6">
          <BentoTile 
            variant="glow" 
            sparkle 
            icon={<Users className="w-5 h-5" />}
            title="Unique Beta Testers"
            data-testid="tile-unique-testers"
          >
            <div className="flex items-center justify-between mt-2">
              <p className="text-4xl font-bold text-primary" data-testid="text-testers-count">{betaTesters.length}</p>
              <Users className="w-12 h-12 text-primary/20" />
            </div>
          </BentoTile>

          <BentoTile 
            variant="gradient" 
            icon={<LogIn className="w-5 h-5" />}
            title="Total PIN Logins"
            data-testid="tile-total-logins"
          >
            <div className="flex items-center justify-between mt-2">
              <p className="text-4xl font-bold text-green-400" data-testid="text-logins-count">{pinLogins.length}</p>
              <LogIn className="w-12 h-12 text-green-400/20" />
            </div>
          </BentoTile>

          <BentoTile 
            variant="glass" 
            icon={<TrendingUp className="w-5 h-5" />}
            title="Avg Logins per Tester"
            data-testid="tile-avg-logins"
          >
            <div className="flex items-center justify-between mt-2">
              <p className="text-4xl font-bold text-purple-400" data-testid="text-avg-count">
                {betaTesters.length > 0 ? (pinLogins.length / betaTesters.length).toFixed(1) : 0}
              </p>
              <TrendingUp className="w-12 h-12 text-purple-400/20" />
            </div>
          </BentoTile>
        </BentoGrid>

        <div className="hidden md:block mb-6">
          <h3 className="text-lg font-semibold text-white mb-3">Top Contributors</h3>
          <SwipeCarousel itemWidth="280px" gap={16} showPeek>
            {betaTesters.slice(0, 10).map((tester, index) => (
              <BentoTile
                key={tester.pin}
                variant={index === 0 ? "premium" : "glass"}
                sparkle={index < 3}
                onClick={() => setSelectedPin(tester.pin === selectedPin ? null : tester.pin)}
                className={selectedPin === tester.pin ? "ring-2 ring-primary" : ""}
                data-testid={`carousel-tester-${tester.pin}`}
              >
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary/30 to-secondary/30 flex items-center justify-center text-white font-bold">
                    #{index + 1}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-white truncate" data-testid={`text-tester-name-${tester.pin}`}>
                      {tester.userName || "Unknown"}
                    </p>
                    <p className="text-xs text-slate-400">PIN: {tester.pin}</p>
                  </div>
                </div>
                <div className="flex items-center justify-between">
                  <Badge className={getRoleColor(tester.userRole)} data-testid={`badge-role-${tester.pin}`}>
                    {tester.userRole}
                  </Badge>
                  <div className="text-right">
                    <p className="font-bold text-lg text-primary" data-testid={`text-login-count-${tester.pin}`}>{tester.loginCount}</p>
                    <p className="text-xs text-slate-400">logins</p>
                  </div>
                </div>
              </BentoTile>
            ))}
          </SwipeCarousel>
        </div>

        <BentoGrid columns={2} gap="lg" className="mb-6">
          <BentoTile variant="gradient" size="tall" className="p-0 overflow-hidden" data-testid="tile-beta-testers">
            <div className="bg-gradient-to-r from-blue-600 to-blue-700 p-4">
              <h3 className="text-lg font-semibold text-white flex items-center gap-2">
                <Users className="w-5 h-5" />
                Active Beta Testers
              </h3>
              <p className="text-blue-100 text-sm">Sorted by activity</p>
            </div>
            <ScrollArea className="h-[360px]">
              <PremiumAccordion type="single" collapsible className="divide-y divide-white/10">
                {betaTesters.map((tester) => (
                  <PremiumAccordionItem 
                    key={tester.pin} 
                    value={tester.pin}
                    variant="glass"
                    className="rounded-none border-0"
                  >
                    <PremiumAccordionTrigger
                      icon={<Users className="w-4 h-4" />}
                      badge={`${tester.loginCount} logins`}
                      description={`PIN: ${tester.pin}`}
                    >
                      <span data-testid={`text-accordion-tester-${tester.pin}`}>{tester.userName || "Unknown"}</span>
                    </PremiumAccordionTrigger>
                    <PremiumAccordionContent>
                      <div className="space-y-3">
                        <div className="flex items-center justify-between">
                          <span className="text-slate-400">Role:</span>
                          <Badge className={getRoleColor(tester.userRole)}>
                            {tester.userRole}
                          </Badge>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-slate-400">First Login:</span>
                          <span className="text-white">{new Date(tester.firstLogin).toLocaleDateString()}</span>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-slate-400">Last Login:</span>
                          <span className="text-white">{new Date(tester.lastLogin).toLocaleDateString()}</span>
                        </div>
                        <PremiumButton
                          variant="primary"
                          size="sm"
                          className="w-full mt-2"
                          onClick={() => setSelectedPin(tester.pin === selectedPin ? null : tester.pin)}
                          data-testid={`button-filter-${tester.pin}`}
                        >
                          {selectedPin === tester.pin ? "Clear Filter" : "View Logins"}
                        </PremiumButton>
                      </div>
                    </PremiumAccordionContent>
                  </PremiumAccordionItem>
                ))}
              </PremiumAccordion>
            </ScrollArea>
          </BentoTile>

          <BentoTile variant="glow" size="tall" className="p-0 overflow-hidden" data-testid="tile-recent-logins">
            <div className="bg-gradient-to-r from-green-600 to-green-700 p-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-lg font-semibold text-white flex items-center gap-2">
                    <LogIn className="w-5 h-5" />
                    {selectedPin ? `Logins for PIN ${selectedPin}` : "Recent PIN Logins"}
                  </h3>
                  <p className="text-green-100 text-sm">
                    {filteredLogins.length} records
                  </p>
                </div>
                {selectedPin && (
                  <PremiumButton
                    variant="glass"
                    size="sm"
                    icon={<X className="w-4 h-4" />}
                    onClick={() => setSelectedPin(null)}
                    data-testid="button-clear-filter"
                  >
                    Clear
                  </PremiumButton>
                )}
              </div>
            </div>
            <ScrollArea className="h-[360px]">
              <div className="divide-y divide-white/10">
                {filteredLogins.length === 0 ? (
                  <div className="p-8 text-center text-slate-400">
                    No logins found
                  </div>
                ) : (
                  filteredLogins.map((login) => (
                    <div
                      key={login.id}
                      data-testid={`row-login-${login.id}`}
                      className="p-4 hover:bg-white/5 transition-colors"
                    >
                      <div className="flex items-center justify-between gap-4 mb-2">
                        <div className="flex-1 min-w-0">
                          <p className="font-semibold text-white truncate" data-testid={`text-login-user-${login.id}`}>
                            {login.userName}
                          </p>
                          <p className="text-sm text-slate-400">PIN: {login.pin}</p>
                        </div>
                        <Badge className={getRoleColor(login.userRole)} data-testid={`badge-login-role-${login.id}`}>
                          {login.userRole}
                        </Badge>
                      </div>
                      <div className="flex items-center gap-4 text-xs text-slate-400">
                        <span className="flex items-center gap-1">
                          <Calendar className="w-3 h-3" />
                          {login.loginDate} {login.loginTime}
                        </span>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </ScrollArea>
          </BentoTile>
        </BentoGrid>

        <div className="block md:hidden mb-6">
          <h3 className="text-lg font-semibold text-white mb-3">Top Contributors</h3>
          <SwipeCarousel itemWidth="260px" gap={12} showPeek>
            {betaTesters.slice(0, 10).map((tester, index) => (
              <BentoTile
                key={tester.pin}
                variant={index === 0 ? "premium" : "glass"}
                sparkle={index < 3}
                onClick={() => setSelectedPin(tester.pin === selectedPin ? null : tester.pin)}
                className={selectedPin === tester.pin ? "ring-2 ring-primary" : ""}
                data-testid={`mobile-carousel-tester-${tester.pin}`}
              >
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-8 h-8 rounded-full bg-gradient-to-br from-primary/30 to-secondary/30 flex items-center justify-center text-white font-bold text-sm">
                    #{index + 1}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-white truncate text-sm">
                      {tester.userName || "Unknown"}
                    </p>
                    <p className="text-xs text-slate-400">PIN: {tester.pin}</p>
                  </div>
                </div>
                <div className="flex items-center justify-between">
                  <Badge className={`${getRoleColor(tester.userRole)} text-xs`}>
                    {tester.userRole}
                  </Badge>
                  <div className="text-right">
                    <p className="font-bold text-primary">{tester.loginCount}</p>
                    <p className="text-xs text-slate-400">logins</p>
                  </div>
                </div>
              </BentoTile>
            ))}
          </SwipeCarousel>
        </div>
      </div>
    </div>
  );
}
