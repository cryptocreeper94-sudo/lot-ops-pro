import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { Warehouse, MapPin, AlertCircle } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";

interface LotSpace {
  id: number;
  lotNumber: string;
  lotName: string;
  capacity: number;
  currentOccupancy: number;
  zoneType: string;
  isActive: boolean;
  notes: string | null;
  lastUpdated: string;
}

export function LotManager() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [showAssignDialog, setShowAssignDialog] = useState(false);
  const [selectedLot, setSelectedLot] = useState<string>("");
  const [overflowNotes, setOverflowNotes] = useState("");

  const { data: lots = [] } = useQuery<LotSpace[]>({
    queryKey: ["/api/lots"],
    refetchInterval: 30000,
  });

  // Location templates
  const locationTemplates = [
    { value: "front_arena", label: "Front of Arena" },
    { value: "back_arena", label: "Back of Arena" },
    { value: "drive_lane", label: "Drive Lane" },
    { value: "grass_edge", label: "Edge of Grass Line" },
    { value: "between_lots", label: "Between Lots" },
  ];

  const assignOverflowMutation = useMutation({
    mutationFn: async (data: { lotNumber: string; notes: string }) => {
      const res = await fetch("/api/lots", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          lotNumber: data.lotNumber,
          notes: data.notes,
        }),
      });
      if (!res.ok) throw new Error("Failed to update");
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/lots"] });
      toast({ title: "Overflow Assigned", description: "Drivers will be notified of the overflow location" });
      setShowAssignDialog(false);
      setSelectedLot("");
      setOverflowNotes("");
    },
  });

  const getOccupancyPercent = (lot: LotSpace) => {
    if (lot.capacity === 0) return 0;
    return Math.round((lot.currentOccupancy / lot.capacity) * 100);
  };

  const getOccupancyColor = (percent: number) => {
    if (percent >= 95) return "bg-red-600 text-white";
    if (percent >= 85) return "bg-orange-500 text-white";
    if (percent >= 70) return "bg-yellow-500 text-white";
    return "bg-green-600 text-white";
  };

  const getStatusColor = (percent: number) => {
    if (percent >= 95) return "border-red-500 bg-red-50";
    if (percent >= 85) return "border-orange-500 bg-orange-50";
    if (percent >= 70) return "border-yellow-500 bg-yellow-50";
    return "border-green-500 bg-green-50";
  };

  // Group lots by status
  const criticalLots = lots.filter(l => getOccupancyPercent(l) >= 95);
  const warningLots = lots.filter(l => getOccupancyPercent(l) >= 85 && getOccupancyPercent(l) < 95);
  const normalLots = lots.filter(l => getOccupancyPercent(l) < 85);

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Warehouse className="h-5 w-5 text-blue-600" />
          <h3 className="font-semibold text-slate-900">Lot Capacity Status</h3>
        </div>
        <Badge variant="outline" className="text-xs">
          {lots.length} Lots Tracked
        </Badge>
      </div>

      {/* Critical Lots */}
      {criticalLots.length > 0 && (
        <Card className="border-red-500 bg-red-50">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm text-red-900 flex items-center gap-2">
              <AlertCircle className="h-4 w-4" />
              Critical - Nearly Full
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {criticalLots.map((lot) => (
              <Card key={lot.id} className="p-2 bg-white" data-testid={`lot-critical-${lot.lotNumber}`}>
                <div className="flex items-center justify-between gap-2">
                  <div className="flex items-center gap-2 flex-1 min-w-0">
                    <div className={`px-2 py-1 rounded text-xs font-bold ${getOccupancyColor(getOccupancyPercent(lot))}`}>
                      {getOccupancyPercent(lot)}%
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold truncate">Lot {lot.lotNumber}</p>
                      <p className="text-xs text-gray-600">{lot.currentOccupancy} / {lot.capacity}</p>
                    </div>
                  </div>
                  <Button
                    size="sm"
                    onClick={() => {
                      setSelectedLot(lot.lotNumber);
                      setShowAssignDialog(true);
                    }}
                    className="h-7 text-xs bg-red-600 hover:bg-red-700"
                    data-testid={`button-assign-overflow-${lot.lotNumber}`}
                  >
                    Assign Overflow
                  </Button>
                </div>
                {lot.notes && (
                  <p className="text-xs text-blue-600 mt-1 flex items-center gap-1">
                    <MapPin className="h-3 w-3" />
                    Current: {lot.notes}
                  </p>
                )}
              </Card>
            ))}
          </CardContent>
        </Card>
      )}

      {/* Warning Lots */}
      {warningLots.length > 0 && (
        <Card className="border-orange-500 bg-orange-50">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm text-orange-900">High Capacity - Monitor</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {warningLots.map((lot) => (
              <div key={lot.id} className="flex items-center justify-between p-2 bg-white rounded" data-testid={`lot-warning-${lot.lotNumber}`}>
                <div className="flex items-center gap-2">
                  <div className={`px-2 py-1 rounded text-xs font-bold ${getOccupancyColor(getOccupancyPercent(lot))}`}>
                    {getOccupancyPercent(lot)}%
                  </div>
                  <div>
                    <p className="text-sm font-semibold">Lot {lot.lotNumber}</p>
                    <p className="text-xs text-gray-600">{lot.currentOccupancy} / {lot.capacity}</p>
                  </div>
                </div>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => {
                    setSelectedLot(lot.lotNumber);
                    setShowAssignDialog(true);
                  }}
                  className="h-7 text-xs"
                  data-testid={`button-assign-overflow-${lot.lotNumber}`}
                >
                  Set Overflow
                </Button>
              </div>
            ))}
          </CardContent>
        </Card>
      )}

      {/* Normal Lots - Collapsed View */}
      {normalLots.length > 0 && (
        <Card className="bg-green-50 border-green-200">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm text-green-900">Normal Capacity ({normalLots.length} lots)</CardTitle>
          </CardHeader>
        </Card>
      )}

      {/* Assign Overflow Dialog */}
      <Dialog open={showAssignDialog} onOpenChange={setShowAssignDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Assign Overflow Location - Lot {selectedLot}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label className="text-sm">Choose Overflow Location Template</Label>
              <Select
                value={overflowNotes}
                onValueChange={setOverflowNotes}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select location..." />
                </SelectTrigger>
                <SelectContent>
                  {locationTemplates.map((loc) => (
                    <SelectItem key={loc.value} value={loc.label}>
                      {loc.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label className="text-sm">Custom Instructions (optional)</Label>
              <Input
                value={overflowNotes}
                onChange={(e) => setOverflowNotes(e.target.value)}
                placeholder="e.g., Between rows 52 and 46"
                className="text-sm"
              />
            </div>
            <div className="flex gap-2">
              <Button
                onClick={() => assignOverflowMutation.mutate({ lotNumber: selectedLot, notes: overflowNotes })}
                disabled={!overflowNotes || assignOverflowMutation.isPending}
                className="flex-1"
              >
                Assign & Notify Drivers
              </Button>
              <Button
                variant="outline"
                onClick={() => {
                  setShowAssignDialog(false);
                  setSelectedLot("");
                  setOverflowNotes("");
                }}
              >
                Cancel
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
