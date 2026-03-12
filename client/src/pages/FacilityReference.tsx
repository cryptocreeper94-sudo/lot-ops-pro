import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Search, MapPin, Home, X } from "lucide-react";
import { NavigationControl } from "@/components/NavigationControl";

interface LotInfo {
  lot_number: string;
  lot_name: string;
  zone_type: string;
  category: string;
  capacity?: number;
  note?: string;
}

export default function FacilityReference() {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedLot, setSelectedLot] = useState<LotInfo | null>(null);
  const [allLots, setAllLots] = useState<LotInfo[]>([]);
  const [filteredLots, setFilteredLots] = useState<LotInfo[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadLotData = async () => {
      try {
        const response = await fetch("/LOT_CAPACITY_CONFIG.json");
        const data = await response.json();
        const lots = data.manheim_nashville_facility.complete_lot_listing_from_map;
        setAllLots(lots);
        setFilteredLots(lots);
        setLoading(false);
      } catch (error) {
        console.error("Failed to load lot data:", error);
        setLoading(false);
      }
    };
    
    loadLotData();
  }, []);

  useEffect(() => {
    if (!searchTerm.trim()) {
      setFilteredLots(allLots);
      return;
    }

    const search = searchTerm.toLowerCase();
    const filtered = allLots.filter(
      (lot) =>
        lot.lot_number.toLowerCase().includes(search) ||
        lot.lot_name.toLowerCase().includes(search) ||
        lot.category.toLowerCase().includes(search)
    );
    setFilteredLots(filtered);
  }, [searchTerm, allLots]);

  const getCategoryColor = (category: string) => {
    const colors: Record<string, string> = {
      "Gravel": "bg-green-100 text-green-800",
      "INOP": "bg-red-100 text-red-800",
      "TRA": "bg-blue-100 text-blue-800",
      "Shops": "bg-purple-100 text-purple-800",
      "Shops & Detail": "bg-purple-100 text-purple-800",
      "Detail Sections": "bg-purple-100 text-purple-800",
      "Inventory": "bg-amber-100 text-amber-800",
      "Clean Side": "bg-cyan-100 text-cyan-800",
      "VIP": "bg-yellow-100 text-yellow-800",
      "Dealer": "bg-indigo-100 text-indigo-800",
      "Cage": "bg-stone-100 text-stone-800",
      "Arena": "bg-orange-100 text-orange-800",
      "Staging": "bg-lime-100 text-lime-800",
      "Post-Sale": "bg-pink-100 text-pink-800",
      "Sold": "bg-gray-100 text-gray-800",
      "CHUTE Overflow": "bg-red-200 text-red-900",
      "Exotic": "bg-rose-100 text-rose-800",
      "Sign-Off": "bg-slate-100 text-slate-800",
      "Overflow": "bg-orange-200 text-orange-900",
      "Redemption": "bg-emerald-100 text-emerald-800",
      "Turn Age": "bg-teal-100 text-teal-800",
      "TRA Sales": "bg-blue-200 text-blue-900",
      "Fleet Lease": "bg-gray-200 text-gray-900"
    };
    return colors[category] || "bg-slate-100 text-slate-800";
  };

  const getZoneTypeIcon = (zoneType: string) => {
    switch (zoneType) {
      case "gravel":
        return "🚗";
      case "inop":
        return "⛔";
      case "inventory":
        return "📦";
      case "shop":
        return "🔧";
      case "detail":
        return "✨";
      case "sale_lane":
        return "🎯";
      case "overflow":
        return "⬆️";
      case "holding":
        return "⏳";
      case "sold":
        return "✅";
      default:
        return "📍";
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 p-4">
        <NavigationControl variant="back" fallbackRoute="/developer" />
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-6">
          <div className="flex items-center gap-3 mb-3">
            <MapPin className="w-8 h-8 text-blue-600" />
            <h1 className="text-3xl font-bold text-slate-900">Facility Reference</h1>
          </div>
          <p className="text-slate-600">Search for lots and find their details, capacity, and location</p>
        </div>

        {/* Search Bar */}
        <div className="mb-6">
          <div className="relative">
            <Search className="absolute left-3 top-3 w-5 h-5 text-slate-400" />
            <Input
              placeholder="Search by lot number (e.g., 305, 702) or name..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              data-testid="input-lot-search"
              className="pl-10 py-6 text-lg rounded-lg border-2 border-slate-300 focus:border-blue-500"
            />
          </div>
          <p className="text-sm text-slate-500 mt-2">
            {filteredLots.length} lots found
          </p>
        </div>

        {loading ? (
          <Card className="border-0 shadow-lg">
            <CardContent className="p-8 text-center">
              <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
              <p className="mt-4 text-slate-600">Loading facility data...</p>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Lots Grid */}
            <div className="lg:col-span-2">
              <ScrollArea className="h-[600px] rounded-lg border-2 border-slate-200 bg-white p-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pr-4">
                  {filteredLots.length === 0 ? (
                    <div className="col-span-full text-center py-12">
                      <p className="text-slate-500 text-lg">No lots found matching your search</p>
                    </div>
                  ) : (
                    filteredLots.map((lot) => (
                      <button
                        key={lot.lot_number}
                        onClick={() => setSelectedLot(lot)}
                        data-testid={`card-lot-${lot.lot_number}`}
                        className={`p-4 rounded-lg border-2 text-left transition-all ${
                          selectedLot?.lot_number === lot.lot_number
                            ? "border-blue-500 bg-blue-50 shadow-lg"
                            : "border-slate-200 bg-white hover:border-blue-300 hover:shadow-md"
                        }`}
                      >
                        <div className="flex items-start justify-between gap-2 mb-2">
                          <div className="text-2xl">{getZoneTypeIcon(lot.zone_type)}</div>
                          <span className="text-xl font-bold text-blue-600">{lot.lot_number}</span>
                        </div>
                        <p className="font-semibold text-slate-900 text-sm mb-2 truncate">
                          {lot.lot_name}
                        </p>
                        <Badge variant="outline" className={`text-xs ${getCategoryColor(lot.category)}`}>
                          {lot.category}
                        </Badge>
                      </button>
                    ))
                  )}
                </div>
              </ScrollArea>
            </div>

            {/* Detail Panel */}
            <div>
              {selectedLot ? (
                <Card className="border-0 shadow-lg sticky top-4">
                  <CardHeader className="bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-t-lg">
                    <div className="flex items-start justify-between">
                      <div>
                        <div className="text-4xl font-bold mb-2">{selectedLot.lot_number}</div>
                        <CardTitle className="text-lg">{selectedLot.lot_name}</CardTitle>
                      </div>
                      <button
                        onClick={() => setSelectedLot(null)}
                        data-testid="button-close-lot-detail"
                        className="p-1 hover:bg-white/20 rounded-lg transition-colors"
                      >
                        <X className="w-5 h-5" />
                      </button>
                    </div>
                  </CardHeader>
                  <CardContent className="pt-6 space-y-4">
                    {/* Category */}
                    <div>
                      <p className="text-sm text-slate-600 mb-1">Category</p>
                      <Badge className={getCategoryColor(selectedLot.category)}>
                        {selectedLot.category}
                      </Badge>
                    </div>

                    {/* Zone Type */}
                    <div>
                      <p className="text-sm text-slate-600 mb-1">Type</p>
                      <p className="font-semibold capitalize text-slate-900">
                        {selectedLot.zone_type.replace("_", " ")}
                      </p>
                    </div>

                    {/* Capacity if available */}
                    {selectedLot.capacity !== undefined && (
                      <div>
                        <p className="text-sm text-slate-600 mb-1">Capacity</p>
                        <p className="font-semibold text-lg text-emerald-600">
                          ~{selectedLot.capacity} cars
                        </p>
                      </div>
                    )}

                    {/* Notes if available */}
                    {selectedLot.note && (
                      <div>
                        <p className="text-sm text-slate-600 mb-1">Notes</p>
                        <p className="text-sm text-slate-700 bg-slate-50 p-3 rounded-lg">
                          {selectedLot.note}
                        </p>
                      </div>
                    )}

                    {/* Map Button */}
                    <Button
                      onClick={() => window.location.href = "/weekly-maps"}
                      data-testid="button-view-map"
                      className="w-full bg-blue-600 hover:bg-blue-700"
                    >
                      <MapPin className="w-4 h-4 mr-2" />
                      View on Map
                    </Button>
                  </CardContent>
                </Card>
              ) : (
                <Card className="border-0 shadow-lg border-2 border-dashed border-slate-300">
                  <CardContent className="p-8 text-center">
                    <Home className="w-12 h-12 text-slate-300 mx-auto mb-3" />
                    <p className="text-slate-500 text-sm">
                      Tap a lot to see details
                    </p>
                  </CardContent>
                </Card>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
