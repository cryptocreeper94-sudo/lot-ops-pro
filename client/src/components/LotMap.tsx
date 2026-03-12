import { useState } from "react";
import { 
  MapPin, 
  Navigation, 
  Users, 
  Car, 
  Calendar, 
  Filter,
  Layers,
  Info
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import auctionMapBg from "@assets/generated_images/Satellite_view_of_large_auto_auction_lot_with_rows_of_cars_a6dffacf.png"; 

// Mock Zones
const zones = [
  { id: "A1", name: "Dealer Consignment A", type: "dealer", count: 142, status: "full" },
  { id: "A2", name: "Dealer Consignment B", type: "dealer", count: 85, status: "open" },
  { id: "F1", name: "Ford Factory Sale", type: "commercial", count: 310, status: "restricted" },
  { id: "S1", name: "Sale Lane 1-4", type: "sale", count: 0, status: "active" },
  { id: "B1", name: "Body Shop", type: "service", count: 45, status: "busy" },
];

export default function LotMap() {
  const [filter, setFilter] = useState("all");
  const [selectedZone, setSelectedZone] = useState<string | null>(null);

  return (
    <div className="flex flex-col h-[calc(100vh-200px)] md:h-[600px] gap-4">
      {/* Map Controls */}
      <div className="flex gap-2 overflow-x-auto pb-2">
        <Select defaultValue="all" onValueChange={setFilter}>
          <SelectTrigger className="w-[150px] bg-white">
            <Filter className="w-4 h-4 mr-2" />
            <SelectValue placeholder="Filter Map" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Zones</SelectItem>
            <SelectItem value="dealer">Dealer Lots</SelectItem>
            <SelectItem value="commercial">Commercial/Fleet</SelectItem>
            <SelectItem value="service">Service Shops</SelectItem>
            <SelectItem value="sale">Sale Lanes</SelectItem>
          </SelectContent>
        </Select>
        
        <Button variant="outline" className="bg-white border-blue-200 text-blue-700">
          <Calendar className="w-4 h-4 mr-2" /> Sale Day Config
        </Button>
        <Button variant="outline" className="bg-white">
          <Layers className="w-4 h-4 mr-2" /> Overlays
        </Button>
      </div>

      <div className="flex flex-1 gap-4 overflow-hidden">
        {/* Interactive Map Container */}
        <Card className="flex-1 relative overflow-hidden border-slate-300 bg-slate-100 shadow-inner group">
          {/* Placeholder Map Image */}
          <div 
            className="absolute inset-0 bg-cover bg-center opacity-90 transition-transform duration-700 group-hover:scale-105"
            style={{ backgroundImage: `url(${auctionMapBg})` }} 
          />
          <div className="absolute inset-0 bg-slate-900/10" /> {/* Overlay */}

          {/* Interactive Zone Pins (Mock Positioning) */}
          {zones.map((zone, i) => (
            (filter === "all" || filter === zone.type) && (
              <div 
                key={zone.id}
                className="absolute cursor-pointer hover:scale-110 transition-transform"
                style={{ 
                  top: `${20 + (i * 15)}%`, 
                  left: `${15 + (i * 18)}%` 
                }}
                onClick={() => setSelectedZone(zone.id)}
              >
                <div className={`
                  flex items-center justify-center px-3 py-1 rounded-full shadow-lg border-2 font-bold text-xs
                  ${zone.type === 'sale' ? 'bg-green-500 border-white text-white animate-pulse' : 
                    zone.type === 'service' ? 'bg-orange-500 border-white text-white' :
                    'bg-white border-slate-900 text-slate-900'}
                `}>
                  {zone.id}
                </div>
              </div>
            )
          ))}

          {/* Map Legend / Info */}
          <div className="absolute bottom-4 right-4 bg-white/90 backdrop-blur p-2 rounded-lg shadow-lg text-xs space-y-1">
             <div className="flex items-center gap-2"><div className="w-2 h-2 bg-green-500 rounded-full"/> Sale Active</div>
             <div className="flex items-center gap-2"><div className="w-2 h-2 bg-orange-500 rounded-full"/> Service Shop</div>
             <div className="flex items-center gap-2"><div className="w-2 h-2 bg-white border border-black rounded-full"/> Parking Zone</div>
          </div>
        </Card>

        {/* Zone Detail Sidebar (Desktop Only) */}
        <Card className="w-80 hidden md:flex flex-col border-l shadow-xl z-10">
          <CardHeader className="pb-3 bg-slate-50 border-b">
            <CardTitle className="text-sm uppercase tracking-wider flex items-center gap-2">
              <MapPin className="w-4 h-4" /> Zone Details
            </CardTitle>
          </CardHeader>
          <CardContent className="flex-1 p-4">
            {selectedZone ? (
              <div className="space-y-4 animate-in fade-in slide-in-from-right-4">
                {zones.filter(z => z.id === selectedZone).map(z => (
                  <div key={z.id} className="space-y-4">
                    <div>
                      <h3 className="text-2xl font-bold text-slate-900">{z.name}</h3>
                      <Badge variant="outline" className="mt-1">{z.type.toUpperCase()}</Badge>
                    </div>
                    
                    <div className="grid grid-cols-2 gap-2 py-4 border-y border-slate-100">
                       <div className="text-center p-2 bg-slate-50 rounded">
                         <div className="text-xl font-bold text-slate-900">{z.count}</div>
                         <div className="text-[10px] text-slate-500 uppercase">Vehicles</div>
                       </div>
                       <div className="text-center p-2 bg-slate-50 rounded">
                         <div className="text-xl font-bold text-slate-900">85%</div>
                         <div className="text-[10px] text-slate-500 uppercase">Capacity</div>
                       </div>
                    </div>

                    <div className="space-y-2">
                      <Button className="w-full justify-start" variant="outline">
                        <Users className="w-4 h-4 mr-2" /> View Assigned Staff
                      </Button>
                      <Button className="w-full justify-start" variant="outline">
                        <Car className="w-4 h-4 mr-2" /> List Inventory
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="h-full flex flex-col items-center justify-center text-slate-400 text-center p-4">
                <Info className="w-12 h-12 mb-2 opacity-20" />
                <p>Select a zone on the map to view real-time capacity and operations.</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
