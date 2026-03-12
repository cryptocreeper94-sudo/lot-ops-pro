import { useState, useEffect, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  MapPin, 
  Phone, 
  MessageSquare, 
  Search, 
  Eye, 
  EyeOff, 
  Truck, 
  Coffee, 
  Users,
  ChevronDown,
  X
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Switch } from "@/components/ui/switch";
import { 
  Accordion, 
  AccordionContent, 
  AccordionItem, 
  AccordionTrigger 
} from "@/components/ui/accordion";
import {
  Drawer,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
} from "@/components/ui/drawer";
import { useIsMobile } from "@/hooks/use-mobile";
import auctionMapBg from "@assets/generated_images/Satellite_view_of_large_auto_auction_lot_with_rows_of_cars_a6dffacf.png";

interface CrewMember {
  id: string;
  name: string;
  phone: string;
  status: 'active' | 'break' | 'lost';
  position: { x: number; y: number };
}

interface VanDriver {
  id: string;
  name: string;
  phoneLast4: string;
  vanNumber: number;
  status: 'moving' | 'idle' | 'break';
  position: { x: number; y: number };
  crew: CrewMember[];
}

const firstNames = ["John", "Mike", "Sarah", "James", "Maria", "Carlos", "Angela", "David", "Lisa", "Kevin", "Patricia", "Robert", "Linda", "William", "Jennifer", "Thomas", "Elizabeth", "Chris", "Susan", "Daniel"];
const lastNames = ["Smith", "Johnson", "Williams", "Brown", "Jones", "Garcia", "Miller", "Davis", "Rodriguez", "Martinez", "Hernandez", "Lopez", "Gonzalez", "Wilson", "Anderson", "Thomas", "Taylor", "Moore", "Jackson", "Martin"];

function generateMockData(): VanDriver[] {
  const drivers: VanDriver[] = [];
  const usedVanNumbers = new Set<number>();
  
  for (let i = 0; i < 18; i++) {
    let vanNumber: number;
    do {
      vanNumber = Math.floor(Math.random() * 20) + 1;
    } while (usedVanNumbers.has(vanNumber));
    usedVanNumbers.add(vanNumber);
    
    const driverName = `${firstNames[i % firstNames.length]} ${lastNames[i % lastNames.length]}`;
    const crewCount = Math.floor(Math.random() * 3) + 2;
    const crew: CrewMember[] = [];
    
    for (let j = 0; j < crewCount; j++) {
      const isNewDriver = Math.random() < 0.15;
      const crewName = isNewDriver 
        ? "New Driver (Temp)" 
        : `${firstNames[(i * 3 + j) % firstNames.length]} ${lastNames[(i * 2 + j) % lastNames.length]}`;
      
      crew.push({
        id: `crew-${i}-${j}`,
        name: crewName,
        phone: `(615) ${String(Math.floor(Math.random() * 900) + 100).padStart(3, '0')}-${String(Math.floor(Math.random() * 9000) + 1000).padStart(4, '0')}`,
        status: isNewDriver ? 'lost' : (Math.random() < 0.1 ? 'break' : 'active'),
        position: {
          x: Math.random() * 80 + 10,
          y: Math.random() * 80 + 10
        }
      });
    }
    
    drivers.push({
      id: `van-${i}`,
      name: driverName,
      phoneLast4: String(Math.floor(Math.random() * 9000) + 1000),
      vanNumber,
      status: Math.random() < 0.15 ? 'break' : (Math.random() < 0.5 ? 'moving' : 'idle'),
      position: {
        x: Math.random() * 80 + 10,
        y: Math.random() * 80 + 10
      },
      crew
    });
  }
  
  return drivers.sort((a, b) => a.vanNumber - b.vanNumber);
}

const initialMockData = generateMockData();

function DriverPopup({ driver, onClose }: { driver: VanDriver; onClose: () => void }) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9, y: 10 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.9, y: 10 }}
      className="absolute z-50 bg-slate-900 border border-cyan-500/50 rounded-xl p-4 shadow-2xl shadow-cyan-500/20 min-w-[200px]"
      style={{ left: `${driver.position.x}%`, top: `${driver.position.y + 5}%` }}
    >
      <Button 
        size="icon" 
        variant="ghost" 
        className="absolute top-1 right-1 h-6 w-6"
        onClick={onClose}
        data-testid={`button-close-popup-${driver.id}`}
      >
        <X className="h-3 w-3" />
      </Button>
      
      <div className="flex items-center gap-2 mb-3">
        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-red-500 to-red-700 flex items-center justify-center text-white font-bold">
          {driver.vanNumber}
        </div>
        <div>
          <h4 className="text-white font-semibold text-sm">{driver.name}</h4>
          <p className="text-slate-400 text-xs">Van #{driver.vanNumber}</p>
        </div>
      </div>
      
      <div className="flex items-center gap-2 mb-3">
        <Badge 
          variant="outline" 
          className={`text-xs ${
            driver.status === 'moving' ? 'border-green-500 text-green-400' :
            driver.status === 'break' ? 'border-amber-500 text-amber-400' :
            'border-slate-500 text-slate-400'
          }`}
        >
          {driver.status === 'moving' ? 'Moving' : driver.status === 'break' ? 'On Break' : 'Idle'}
        </Badge>
        <span className="text-slate-400 text-xs">{driver.crew.length} crew</span>
      </div>
      
      <div className="flex gap-2">
        <Button size="sm" variant="outline" className="flex-1 gap-1 text-xs" data-testid={`button-call-${driver.id}`}>
          <Phone className="h-3 w-3" />
          Call
        </Button>
        <Button size="sm" variant="outline" className="flex-1 gap-1 text-xs" data-testid={`button-message-${driver.id}`}>
          <MessageSquare className="h-3 w-3" />
          Message
        </Button>
      </div>
    </motion.div>
  );
}

function MapDot({ 
  x, 
  y, 
  color, 
  label, 
  isAnimated = false,
  onClick,
  size = 'normal'
}: { 
  x: number; 
  y: number; 
  color: 'red' | 'blue' | 'green' | 'amber';
  label?: string | number;
  isAnimated?: boolean;
  onClick?: () => void;
  size?: 'normal' | 'small';
}) {
  const colorClasses = {
    red: 'bg-red-500 shadow-red-500/50',
    blue: 'bg-blue-500 shadow-blue-500/50',
    green: 'bg-green-500 shadow-green-500/50',
    amber: 'bg-amber-500 shadow-amber-500/50'
  };
  
  const sizeClasses = size === 'small' ? 'w-3 h-3' : 'w-5 h-5';
  
  return (
    <motion.div
      initial={{ scale: 0 }}
      animate={{ scale: 1 }}
      exit={{ scale: 0 }}
      className="absolute z-20 cursor-pointer group"
      style={{ left: `${x}%`, top: `${y}%`, transform: 'translate(-50%, -50%)' }}
      onClick={onClick}
    >
      <div className={`
        ${sizeClasses} rounded-full ${colorClasses[color]} shadow-lg
        flex items-center justify-center text-white text-[10px] font-bold
        ${isAnimated ? 'animate-pulse' : ''}
        transition-transform hover:scale-125
      `}>
        {label && size !== 'small' && <span className="drop-shadow">{label}</span>}
      </div>
      {label && (
        <div className="absolute left-1/2 -translate-x-1/2 -top-6 bg-slate-900/90 text-white text-[10px] px-2 py-0.5 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none">
          Van {label}
        </div>
      )}
    </motion.div>
  );
}

function MapLegend() {
  return (
    <div className="absolute bottom-3 left-3 bg-slate-900/90 backdrop-blur-sm border border-slate-700 rounded-lg p-3 z-30" data-testid="map-legend">
      <h4 className="text-white text-xs font-semibold mb-2">Legend</h4>
      <div className="space-y-1.5 text-[10px]">
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded-full bg-red-500" />
          <span className="text-slate-300">Van Driver (always visible)</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded-full bg-blue-500" />
          <span className="text-slate-300">Crew/Inventory (selected)</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded-full bg-green-500" />
          <span className="text-slate-300">Available</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded-full bg-amber-500" />
          <span className="text-slate-300">On break</span>
        </div>
      </div>
    </div>
  );
}

function CrewPanel({ 
  drivers, 
  searchTerm, 
  setSearchTerm, 
  visibleCrew, 
  toggleCrewVisibility 
}: { 
  drivers: VanDriver[];
  searchTerm: string;
  setSearchTerm: (v: string) => void;
  visibleCrew: Set<string>;
  toggleCrewVisibility: (id: string) => void;
}) {
  const filteredDrivers = useMemo(() => {
    if (!searchTerm) return drivers;
    const term = searchTerm.toLowerCase();
    return drivers.filter(d => 
      d.name.toLowerCase().includes(term) ||
      d.crew.some(c => c.name.toLowerCase().includes(term))
    ).map(d => ({
      ...d,
      crew: d.crew.filter(c => c.name.toLowerCase().includes(term) || d.name.toLowerCase().includes(term))
    }));
  }, [drivers, searchTerm]);

  return (
    <div className="h-full flex flex-col">
      <div className="p-3 border-b border-slate-700">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
          <Input
            placeholder="Search crew members..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-9 bg-slate-800/50 border-slate-600 text-white placeholder:text-slate-500"
            data-testid="input-search-crew"
          />
        </div>
        <div className="flex items-center gap-2 mt-2 text-xs text-slate-400">
          <Users className="h-3 w-3" />
          <span>{drivers.reduce((acc, d) => acc + d.crew.length, 0)} crew members</span>
        </div>
      </div>
      
      <ScrollArea className="flex-1">
        <Accordion type="multiple" className="px-2 py-1">
          {filteredDrivers.map((driver) => (
            <AccordionItem 
              key={driver.id} 
              value={driver.id}
              className="border-slate-700"
            >
              <AccordionTrigger className="text-white hover:no-underline py-2" data-testid={`accordion-trigger-${driver.id}`}>
                <div className="flex items-center gap-2">
                  <div className={`w-6 h-6 rounded-full flex items-center justify-center text-white text-[10px] font-bold ${
                    driver.status === 'break' ? 'bg-amber-500' : 'bg-red-500'
                  }`}>
                    {driver.vanNumber}
                  </div>
                  <div className="text-left">
                    <div className="text-sm font-medium">{driver.name}'s Crew</div>
                    <div className="text-[10px] text-slate-400">{driver.crew.length} members</div>
                  </div>
                </div>
              </AccordionTrigger>
              <AccordionContent className="pb-2">
                <div className="space-y-2 pl-8">
                  {driver.crew.map((crew) => (
                    <div 
                      key={crew.id}
                      className="flex items-center justify-between gap-2 p-2 rounded-lg bg-slate-800/50 border border-slate-700/50"
                      data-testid={`crew-item-${crew.id}`}
                    >
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <span className="text-white text-sm truncate">{crew.name}</span>
                          {crew.status === 'lost' && (
                            <Badge variant="destructive" className="text-[9px] px-1 py-0">LOST</Badge>
                          )}
                          {crew.status === 'break' && (
                            <Badge variant="secondary" className="text-[9px] px-1 py-0">
                              <Coffee className="h-2 w-2 mr-0.5" />
                              Break
                            </Badge>
                          )}
                        </div>
                        <div className="text-slate-400 text-xs">{crew.phone}</div>
                      </div>
                      
                      <div className="flex items-center gap-2">
                        <Button 
                          size="icon" 
                          variant="ghost" 
                          className="h-7 w-7"
                          data-testid={`button-call-crew-${crew.id}`}
                        >
                          <Phone className="h-3 w-3" />
                        </Button>
                        <div className="flex items-center gap-1">
                          <Switch
                            checked={visibleCrew.has(crew.id)}
                            onCheckedChange={() => toggleCrewVisibility(crew.id)}
                            className="data-[state=checked]:bg-blue-500"
                            data-testid={`switch-show-${crew.id}`}
                          />
                          {visibleCrew.has(crew.id) ? (
                            <Eye className="h-3 w-3 text-blue-400" />
                          ) : (
                            <EyeOff className="h-3 w-3 text-slate-500" />
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      </ScrollArea>
    </div>
  );
}

export function LiveDriverMap() {
  const [drivers, setDrivers] = useState<VanDriver[]>(initialMockData);
  const [selectedDriver, setSelectedDriver] = useState<VanDriver | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [visibleCrew, setVisibleCrew] = useState<Set<string>>(new Set());
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const isMobile = useIsMobile();

  useEffect(() => {
    const interval = setInterval(() => {
      setDrivers(prev => prev.map(driver => ({
        ...driver,
        position: {
          x: Math.max(5, Math.min(95, driver.position.x + (Math.random() - 0.5) * 2)),
          y: Math.max(5, Math.min(95, driver.position.y + (Math.random() - 0.5) * 2))
        },
        crew: driver.crew.map(c => ({
          ...c,
          position: {
            x: Math.max(5, Math.min(95, c.position.x + (Math.random() - 0.5) * 1.5)),
            y: Math.max(5, Math.min(95, c.position.y + (Math.random() - 0.5) * 1.5))
          }
        }))
      })));
    }, 3000);
    
    return () => clearInterval(interval);
  }, []);

  const toggleCrewVisibility = (crewId: string) => {
    setVisibleCrew(prev => {
      const next = new Set(prev);
      if (next.has(crewId)) {
        next.delete(crewId);
      } else {
        next.add(crewId);
      }
      return next;
    });
  };

  const allVisibleCrew = useMemo(() => {
    const crewList: (CrewMember & { vanNumber: number })[] = [];
    drivers.forEach(driver => {
      driver.crew.forEach(crew => {
        if (visibleCrew.has(crew.id)) {
          crewList.push({ ...crew, vanNumber: driver.vanNumber });
        }
      });
    });
    return crewList;
  }, [drivers, visibleCrew]);

  const crewPanelContent = (
    <CrewPanel
      drivers={drivers}
      searchTerm={searchTerm}
      setSearchTerm={setSearchTerm}
      visibleCrew={visibleCrew}
      toggleCrewVisibility={toggleCrewVisibility}
    />
  );

  return (
    <div className="flex h-[calc(100vh-120px)] md:h-[700px] gap-0 md:gap-4" data-testid="live-driver-map">
      <Card className="flex-1 relative overflow-hidden border-slate-700 bg-slate-900">
        <CardHeader className="py-2 px-3 bg-slate-800/50 border-b border-slate-700 z-40 relative">
          <div className="flex items-center justify-between gap-2">
            <div className="flex items-center gap-2">
              <div className="p-1.5 rounded-lg bg-gradient-to-br from-cyan-500 to-blue-600">
                <Truck className="w-4 h-4 text-white" />
              </div>
              <div>
                <CardTitle className="text-sm text-white">Live Driver Map</CardTitle>
                <p className="text-[10px] text-slate-400">{drivers.length} vans active</p>
              </div>
            </div>
            
            <div className="flex items-center gap-2">
              <Badge variant="outline" className="text-[10px] border-green-500/50 text-green-400 animate-pulse">
                LIVE
              </Badge>
              
              {isMobile && (
                <Drawer open={isDrawerOpen} onOpenChange={setIsDrawerOpen}>
                  <DrawerTrigger asChild>
                    <Button size="sm" variant="outline" className="gap-1" data-testid="button-open-crew-drawer">
                      <Users className="h-3 w-3" />
                      Crew
                      <ChevronDown className="h-3 w-3" />
                    </Button>
                  </DrawerTrigger>
                  <DrawerContent className="h-[70vh] bg-slate-900 border-slate-700">
                    <DrawerHeader className="border-b border-slate-700">
                      <DrawerTitle className="text-white">Crew Members</DrawerTitle>
                    </DrawerHeader>
                    {crewPanelContent}
                  </DrawerContent>
                </Drawer>
              )}
            </div>
          </div>
        </CardHeader>
        
        <CardContent className="p-0 h-full relative">
          <div 
            className="absolute inset-0 bg-cover bg-center"
            style={{ backgroundImage: `url(${auctionMapBg})` }}
          />
          <div className="absolute inset-0 bg-slate-900/40" />
          
          <div className="absolute inset-0 grid-background opacity-20" style={{
            backgroundImage: `
              linear-gradient(rgba(100,200,255,0.1) 1px, transparent 1px),
              linear-gradient(90deg, rgba(100,200,255,0.1) 1px, transparent 1px)
            `,
            backgroundSize: '50px 50px'
          }} />

          <AnimatePresence>
            {drivers.map((driver) => (
              <MapDot
                key={driver.id}
                x={driver.position.x}
                y={driver.position.y}
                color={driver.status === 'break' ? 'amber' : 'red'}
                label={driver.vanNumber}
                isAnimated={driver.status === 'moving'}
                onClick={() => setSelectedDriver(driver)}
              />
            ))}

            {allVisibleCrew.map((crew) => (
              <MapDot
                key={crew.id}
                x={crew.position.x}
                y={crew.position.y}
                color={crew.status === 'break' ? 'amber' : crew.status === 'lost' ? 'amber' : 'blue'}
                size="small"
              />
            ))}

            {selectedDriver && (
              <DriverPopup 
                driver={selectedDriver} 
                onClose={() => setSelectedDriver(null)} 
              />
            )}
          </AnimatePresence>

          <MapLegend />
        </CardContent>
      </Card>

      {!isMobile && (
        <Card className="w-80 border-slate-700 bg-slate-900 flex flex-col" data-testid="crew-panel-desktop">
          <CardHeader className="py-2 px-3 bg-slate-800/50 border-b border-slate-700">
            <div className="flex items-center gap-2">
              <Users className="w-4 h-4 text-cyan-400" />
              <CardTitle className="text-sm text-white">Crew Directory</CardTitle>
            </div>
          </CardHeader>
          <CardContent className="p-0 flex-1 overflow-hidden">
            {crewPanelContent}
          </CardContent>
        </Card>
      )}
    </div>
  );
}

export default LiveDriverMap;
