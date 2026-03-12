import { useState } from "react";
import { useLocation } from "wouter";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";
import { BentoGrid, BentoTile } from "@/components/ui/bento-grid";
import { PremiumAccordion, PremiumAccordionItem, PremiumAccordionTrigger, PremiumAccordionContent } from "@/components/ui/premium-accordion";
import { PremiumButton } from "@/components/ui/premium-button";
import { 
  Car, 
  Wrench, 
  PaintBucket, 
  Camera, 
  MapPin, 
  Calendar, 
  Clock, 
  AlertTriangle, 
  CheckCircle2, 
  Truck, 
  QrCode,
  Search,
  ArrowRight,
  History,
  Smartphone,
  UserCircle,
  Gavel,
  LayoutDashboard,
  Settings
} from "lucide-react";
import VanRouting from "@/components/VanRouting";
import LotMap from "@/components/LotMap";
import { NavigationControl } from "@/components/NavigationControl";

type VehicleStatus = "intake" | "mechanical" | "body_shop" | "paint" | "photo" | "sale_ready" | "sold";
type ProblemSeverity = "low" | "medium" | "high";

interface Problem {
  id: string;
  type: string;
  severity: ProblemSeverity;
  reportedBy: string;
  reportedAt: string;
  status: "open" | "in_progress" | "resolved";
  resolvedBy?: string;
  resolvedAt?: string;
}

interface Vehicle {
  id: string;
  vin: string;
  make: string;
  model: string;
  year: number;
  color: string;
  status: VehicleStatus;
  location: string;
  saleDate: string;
  intakeDate: string;
  problems: Problem[];
}

const vehicles: Vehicle[] = [
  {
    id: "V001",
    vin: "1G1...4582",
    make: "Ford",
    model: "F-150",
    year: 2021,
    color: "Oxford White",
    status: "mechanical",
    location: "Mech Shop B",
    saleDate: "Ford Sale",
    intakeDate: "2025-11-10 08:30 AM",
    problems: [
      {
        id: "P1",
        type: "Check Engine Light",
        severity: "medium",
        reportedBy: "J. Doe (Intake)",
        reportedAt: "2025-11-10 08:45 AM",
        status: "in_progress"
      }
    ]
  },
  {
    id: "V002",
    vin: "JN1...9921",
    make: "Nissan",
    model: "Altima",
    year: 2019,
    color: "Gun Metallic",
    status: "photo",
    location: "Photo Booth 1",
    saleDate: "Wednesday",
    intakeDate: "2025-11-12 09:15 AM",
    problems: []
  },
  {
    id: "V003",
    vin: "5XY...3321",
    make: "Kia",
    model: "Sorento",
    year: 2022,
    color: "Ebony Black",
    status: "intake",
    location: "Drop Lot C",
    saleDate: "Tuesday",
    intakeDate: "2025-11-18 07:00 AM",
    problems: [
      {
        id: "P2",
        type: "Dead Battery",
        severity: "low",
        reportedBy: "Transport Driver",
        reportedAt: "2025-11-18 07:05 AM",
        status: "open"
      },
      {
        id: "P3",
        type: "Front Bumper Scratch",
        severity: "medium",
        reportedBy: "Intake Insp.",
        reportedAt: "2025-11-18 07:15 AM",
        status: "open"
      }
    ]
  }
];

export default function AuctionManager() {
  const [activeTab, setActiveTabState] = useState(() => 
    localStorage.getItem('lotops_auction_tab') || "scan"
  );
  
  const setActiveTab = (tab: string) => {
    localStorage.setItem('lotops_auction_tab', tab);
    setActiveTabState(tab);
  };
  const [scannedVin, setScannedVin] = useState("");
  const [selectedVehicle, setSelectedVehicle] = useState<Vehicle | null>(null);
  const [isSaleDay, setIsSaleDayState] = useState(() => 
    localStorage.getItem('lotops_saleday_mode') === 'true'
  );
  
  const setIsSaleDay = (value: boolean) => {
    localStorage.setItem('lotops_saleday_mode', String(value));
    setIsSaleDayState(value);
  };

  const handleScan = () => {
    const found = vehicles.find(v => v.vin.includes(scannedVin) || v.make.toLowerCase().includes(scannedVin.toLowerCase()));
    if (found) setSelectedVehicle(found);
  };

  return (
    <div className={`min-h-screen pb-20 md:pb-0 transition-colors duration-500 ${isSaleDay ? 'bg-green-50' : 'bg-slate-50'}`}>
      <header className={`text-white p-4 shadow-lg sticky top-0 z-10 transition-colors duration-500 ${isSaleDay ? 'bg-green-900' : 'bg-slate-900'}`}>
        <div className="flex justify-between items-center">
          <div className="flex items-center gap-2">
            <NavigationControl variant="back" fallbackRoute="/developer" />
            <div className={`p-2 rounded-lg ${isSaleDay ? 'bg-green-600' : 'bg-blue-500'}`}>
              {isSaleDay ? <Gavel className="h-5 w-5 text-white" /> : <Car className="h-5 w-5 text-white" />}
            </div>
            <div>
              <h1 className="font-bold text-lg leading-none">AutoTrack Pro</h1>
              <p className="text-[10px] text-white/70 uppercase tracking-wider">
                {isSaleDay ? 'SALE DAY OPERATIONS ACTIVE' : 'Standard Lot Operations'}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-3">
             <PremiumButton 
                variant={isSaleDay ? "premium" : "glass"} 
                size="sm" 
                data-testid="button-toggle-sale-mode"
                onClick={() => setIsSaleDay(!isSaleDay)}
             >
               {isSaleDay ? 'Exit Sale Mode' : 'Start Sale Mode'}
             </PremiumButton>
             <UserCircle className="h-8 w-8 text-white/70" />
          </div>
        </div>
      </header>

      <main className="p-4 max-w-6xl mx-auto space-y-4">
        
        {isSaleDay && (
          <BentoTile 
            variant="glow" 
            size="wide" 
            sparkle 
            interactive={false}
            className="!bg-green-600 !border-green-400 animate-in slide-in-from-top-2"
            data-testid="tile-sale-day-alert"
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <AlertTriangle className="h-4 w-4 text-white" />
                <span className="text-sm font-bold text-white">High Traffic Alert: Sale Lanes 1-4 Active</span>
              </div>
              <span className="text-xs font-mono bg-green-800 px-2 py-1 rounded text-white">VOL: 1,420 CARS</span>
            </div>
          </BentoTile>
        )}

        <BentoTile 
          variant="glass" 
          size="hero" 
          interactive={false}
          className="!bg-white/80 backdrop-blur !min-h-0"
          data-testid="tile-main-interface"
        >
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <div className="border-b border-slate-100 bg-white/50 px-4 pt-2 -mx-4 -mt-4 mb-4">
              <TabsList className="w-full justify-start bg-transparent h-12 p-0 gap-6 overflow-x-auto">
                <TabsTrigger 
                  value="scan" 
                  data-testid="tab-vehicle-lookup"
                  className="data-[state=active]:border-b-2 data-[state=active]:border-blue-600 data-[state=active]:text-blue-600 rounded-none px-0 pb-2 bg-transparent shrink-0"
                >
                  Vehicle Lookup
                </TabsTrigger>
                <TabsTrigger 
                  value="routing" 
                  data-testid="tab-van-routing"
                  className="data-[state=active]:border-b-2 data-[state=active]:border-blue-600 data-[state=active]:text-blue-600 rounded-none px-0 pb-2 bg-transparent shrink-0"
                >
                  Van Routing
                </TabsTrigger>
                <TabsTrigger 
                  value="map" 
                  data-testid="tab-lot-map"
                  className="data-[state=active]:border-b-2 data-[state=active]:border-blue-600 data-[state=active]:text-blue-600 rounded-none px-0 pb-2 bg-transparent shrink-0"
                >
                  Lot Map
                </TabsTrigger>
                {isSaleDay && (
                   <TabsTrigger 
                     value="sale" 
                     data-testid="tab-sale-lane-ops"
                     className="data-[state=active]:border-b-2 data-[state=active]:border-green-600 data-[state=active]:text-green-600 rounded-none px-0 pb-2 bg-transparent shrink-0 font-bold animate-in fade-in"
                   >
                     Sale Lane Ops
                   </TabsTrigger>
                )}
              </TabsList>
            </div>

            <TabsContent value="scan" className="space-y-4 max-w-2xl mx-auto">
              <div className="flex gap-2">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                  <Input 
                    placeholder="Scan VIN or Enter Stock #" 
                    className="pl-9 h-12 text-lg"
                    value={scannedVin}
                    onChange={(e) => setScannedVin(e.target.value)}
                    data-testid="input-vin-search"
                  />
                </div>
                <PremiumButton 
                  variant="primary" 
                  size="lg" 
                  icon={<ArrowRight className="h-5 w-5" />}
                  onClick={handleScan}
                  data-testid="button-search-vehicle"
                >
                  Search
                </PremiumButton>
              </div>

              {selectedVehicle ? (
                <div className="space-y-4 animate-in fade-in slide-in-from-bottom-4 duration-500">
                  <BentoGrid columns={2} gap="md">
                    <BentoTile 
                      variant="gradient" 
                      size="lg" 
                      sparkle
                      interactive={false}
                      data-testid={`tile-vehicle-${selectedVehicle.id}`}
                    >
                      <div className="flex justify-between items-start mb-2">
                        <div>
                          <h2 className="text-xl font-bold text-foreground" data-testid="text-vehicle-title">
                            {selectedVehicle.year} {selectedVehicle.make} {selectedVehicle.model}
                          </h2>
                          <p className="text-sm text-muted-foreground font-mono" data-testid="text-vehicle-vin">
                            VIN: {selectedVehicle.vin}
                          </p>
                        </div>
                        <Badge 
                          className={
                            selectedVehicle.status === 'sale_ready' ? 'bg-green-500' : 
                            selectedVehicle.status === 'mechanical' ? 'bg-amber-500' : 'bg-blue-500'
                          }
                          data-testid="badge-vehicle-status"
                        >
                          {selectedVehicle.status.replace('_', ' ').toUpperCase()}
                        </Badge>
                      </div>
                    </BentoTile>

                    <BentoTile 
                      variant="glass" 
                      size="md"
                      icon={<MapPin className="h-5 w-5" />}
                      title="Current Location"
                      interactive={false}
                      data-testid="tile-vehicle-location"
                    >
                      <p className="text-lg font-semibold text-foreground" data-testid="text-location-value">
                        {selectedVehicle.location}
                      </p>
                    </BentoTile>

                    <BentoTile 
                      variant="glass" 
                      size="md"
                      icon={<Calendar className="h-5 w-5" />}
                      title="Sale Assignment"
                      interactive={false}
                      data-testid="tile-sale-assignment"
                    >
                      <p className="text-lg font-semibold text-foreground" data-testid="text-sale-date">
                        {selectedVehicle.saleDate}
                      </p>
                    </BentoTile>
                  </BentoGrid>

                  <PremiumAccordion type="single" collapsible defaultValue="lifecycle">
                    <PremiumAccordionItem value="lifecycle" variant="gradient">
                      <PremiumAccordionTrigger 
                        icon={<History className="h-5 w-5" />}
                        badge={`${selectedVehicle.problems.length + 1} Events`}
                        description="View complete vehicle history"
                      >
                        Lifecycle Tracking
                      </PremiumAccordionTrigger>
                      <PremiumAccordionContent>
                        <div className="space-y-4 relative before:absolute before:left-2 before:top-2 before:h-full before:w-0.5 before:bg-slate-200 pl-6">
                          <div className="relative">
                            <div className="absolute -left-[29px] top-1 h-3 w-3 rounded-full bg-green-500 ring-4 ring-white" />
                            <p className="text-sm font-medium text-foreground">Intake Scanned</p>
                            <p className="text-xs text-muted-foreground" data-testid="text-intake-date">{selectedVehicle.intakeDate}</p>
                          </div>
                          
                          {selectedVehicle.problems.map((problem) => (
                            <div key={problem.id} className="relative" data-testid={`problem-${problem.id}`}>
                              <div className={`absolute -left-[29px] top-1 h-3 w-3 rounded-full ring-4 ring-white ${
                                problem.status === 'resolved' ? 'bg-green-500' : 'bg-red-500'
                              }`} />
                              <BentoTile 
                                variant="default" 
                                size="sm" 
                                interactive={false}
                                className="!p-3 !min-h-0"
                              >
                                <div className="flex justify-between items-start">
                                  <span className="font-medium text-foreground" data-testid={`text-problem-type-${problem.id}`}>
                                    {problem.type}
                                  </span>
                                  <Badge variant="outline" className="text-[10px] h-5" data-testid={`badge-severity-${problem.id}`}>
                                    {problem.severity.toUpperCase()}
                                  </Badge>
                                </div>
                                <div className="text-xs text-muted-foreground mt-1 flex flex-col gap-1">
                                  <span className="flex items-center gap-1">
                                    <UserCircle className="h-3 w-3"/> {problem.reportedBy}
                                  </span>
                                  <span className="flex items-center gap-1">
                                    <Clock className="h-3 w-3"/> {problem.reportedAt}
                                  </span>
                                </div>
                                {problem.status !== 'resolved' && (
                                  <PremiumButton 
                                    variant="primary" 
                                    size="sm" 
                                    className="w-full mt-3"
                                    data-testid={`button-resolve-${problem.id}`}
                                  >
                                    Mark Resolved
                                  </PremiumButton>
                                )}
                              </BentoTile>
                            </div>
                          ))}
                        </div>
                      </PremiumAccordionContent>
                    </PremiumAccordionItem>
                  </PremiumAccordion>

                  <BentoGrid columns={2} gap="md">
                    <BentoTile 
                      variant="glass" 
                      size="sm"
                      icon={<Camera className="h-5 w-5" />}
                      title="Add Photo"
                      onClick={() => {}}
                      data-testid="button-add-photo"
                    />
                    <BentoTile 
                      variant="glass" 
                      size="sm"
                      icon={<AlertTriangle className="h-5 w-5" />}
                      title="Report Issue"
                      onClick={() => {}}
                      data-testid="button-report-issue"
                    />
                  </BentoGrid>

                  <PremiumButton 
                    variant="glow" 
                    size="lg" 
                    className="w-full" 
                    shine
                    data-testid="button-move-next-stage"
                  >
                    Move to Next Stage
                  </PremiumButton>
                </div>
              ) : (
                <BentoTile 
                  variant="glass" 
                  size="lg" 
                  interactive={false}
                  className="text-center"
                  data-testid="tile-empty-state"
                >
                  <Smartphone className="h-16 w-16 mx-auto mb-4 opacity-20 text-muted-foreground" />
                  <p className="text-muted-foreground">Ready to scan. Use your camera or type a VIN.</p>
                </BentoTile>
              )}
            </TabsContent>

            <TabsContent value="routing" className="max-w-4xl mx-auto">
              <VanRouting />
            </TabsContent>
            
            <TabsContent value="map">
               <LotMap />
            </TabsContent>

            {isSaleDay && (
              <TabsContent value="sale" className="max-w-4xl mx-auto">
                <BentoGrid columns={3} gap="md">
                  <BentoTile 
                    variant="glow" 
                    size="md" 
                    sparkle
                    icon={<Gavel className="h-5 w-5" />}
                    title="Lane 1"
                    description="Ford Consignment"
                    className="!bg-green-50 !border-green-300"
                    interactive={false}
                    data-testid="tile-lane-1"
                  >
                    <div className="text-3xl font-bold text-green-900" data-testid="text-lane-1-count">45</div>
                    <div className="text-xs text-green-600">Cars Queued</div>
                  </BentoTile>
                  
                  <BentoTile 
                    variant="glass" 
                    size="md"
                    icon={<Gavel className="h-5 w-5" />}
                    title="Lane 2"
                    description="Dealer Consignment"
                    interactive={false}
                    data-testid="tile-lane-2"
                  >
                    <div className="text-3xl font-bold text-foreground" data-testid="text-lane-2-count">32</div>
                    <div className="text-xs text-muted-foreground">Cars Queued</div>
                  </BentoTile>
                  
                  <BentoTile 
                    variant="glass" 
                    size="md"
                    icon={<Gavel className="h-5 w-5" />}
                    title="Lane 3"
                    description="Fleet / Lease"
                    interactive={false}
                    data-testid="tile-lane-3"
                  >
                    <div className="text-3xl font-bold text-foreground" data-testid="text-lane-3-count">18</div>
                    <div className="text-xs text-muted-foreground">Cars Queued</div>
                  </BentoTile>
                </BentoGrid>
                <div className="mt-4 text-center text-muted-foreground italic">
                  Real-time sale lane telemetry would go here.
                </div>
              </TabsContent>
            )}
          </Tabs>
        </BentoTile>

      </main>
      
      <div className="fixed bottom-0 left-0 w-full bg-white border-t border-slate-200 p-2 flex justify-around md:hidden pb-safe">
        <Button 
          variant="ghost" 
          className={`flex flex-col items-center gap-1 h-auto py-2 ${activeTab === 'scan' ? 'text-blue-600' : 'text-slate-400'}`} 
          onClick={() => setActiveTab("scan")}
          data-testid="nav-dashboard"
        >
           <LayoutDashboard className="h-5 w-5" />
           <span className="text-[10px]">Dash</span>
        </Button>
        <Button 
          variant="ghost" 
          className={`flex flex-col items-center gap-1 h-auto py-2 ${activeTab === 'routing' ? 'text-blue-600' : 'text-slate-400'}`} 
          onClick={() => setActiveTab("routing")}
          data-testid="nav-vans"
        >
           <Truck className="h-5 w-5" />
           <span className="text-[10px]">Vans</span>
        </Button>
        <Button 
          variant="ghost" 
          className={`flex flex-col items-center gap-1 h-auto py-2 ${activeTab === 'map' ? 'text-blue-600' : 'text-slate-400'}`} 
          onClick={() => setActiveTab("map")}
          data-testid="nav-map"
        >
           <MapPin className="h-5 w-5" />
           <span className="text-[10px]">Map</span>
        </Button>
        <Button 
          variant="ghost" 
          className="flex flex-col items-center gap-1 h-auto py-2 text-slate-400"
          data-testid="nav-config"
        >
           <Settings className="h-5 w-5" />
           <span className="text-[10px]">Config</span>
        </Button>
      </div>
    </div>
  );
}
