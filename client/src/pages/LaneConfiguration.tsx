import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { useToast } from "@/hooks/use-toast";
import { Calendar, Save, RefreshCw, AlertCircle, ShieldAlert, Layers, Clock } from "lucide-react";
import { NavigationControl } from "@/components/NavigationControl";
import { canEditConfiguration, isInSandboxMode } from "@/utils/roleManager";
import { BentoGrid, BentoTile } from "@/components/ui/bento-grid";
import { PremiumAccordion, PremiumAccordionItem, PremiumAccordionTrigger, PremiumAccordionContent } from "@/components/ui/premium-accordion";
import { PremiumButton } from "@/components/ui/premium-button";

interface LaneConfig {
  id?: number;
  weekNumber: number;
  laneNumber: number;
  saleDay: string;
  totalSpots: number;
  isOverflow?: boolean;
  overflowLabel?: string;
  notes?: string;
}

export default function LaneConfiguration() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [selectedWeek, setSelectedWeek] = useState(47);
  const canEdit = canEditConfiguration();
  const isSandbox = isInSandboxMode();

  const { data: currentWeekData } = useQuery({
    queryKey: ["currentWeek"],
    queryFn: async () => {
      const res = await fetch("/api/lanes/current-week");
      return res.json();
    }
  });

  const { data: lanes = [], isLoading } = useQuery<LaneConfig[]>({
    queryKey: ["lanes", selectedWeek],
    queryFn: async () => {
      const res = await fetch(`/api/lanes/${selectedWeek}`);
      return res.json();
    }
  });

  const saveMutation = useMutation({
    mutationFn: async (laneConfig: LaneConfig) => {
      const res = await fetch("/api/lanes", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(laneConfig)
      });
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["lanes"] });
      toast({ title: "Saved!", description: "Lane configuration updated successfully." });
    },
    onError: () => {
      toast({ title: "Error", description: "Failed to save lane configuration.", variant: "destructive" });
    }
  });

  const handleSaveLane = (lane: LaneConfig) => {
    saveMutation.mutate(lane);
  };

  const tuesdayLanes = lanes.filter(l => l.saleDay === "Tuesday");
  const wednesdayLanes = lanes.filter(l => l.saleDay === "Wednesday");
  const thursdayLanes = lanes.filter(l => l.saleDay === "Thursday");

  const tuesdayTotal = tuesdayLanes.reduce((sum, l) => sum + l.totalSpots, 0);
  const wednesdayTotal = wednesdayLanes.reduce((sum, l) => sum + l.totalSpots, 0);
  const thursdayTotal = thursdayLanes.reduce((sum, l) => sum + l.totalSpots, 0);
  const grandTotal = tuesdayTotal + wednesdayTotal + thursdayTotal;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 p-4">
      <div className="max-w-7xl mx-auto space-y-6">
        <NavigationControl variant="back" fallbackRoute="/developer" />
        
        <BentoGrid columns={3} gap="md">
          <BentoTile
            size="wide"
            variant="premium"
            sparkle
            icon={<Calendar className="h-6 w-6" />}
            title="Lane Configuration"
            description="Manage weekly lane assignments, spot counts, and overflow areas"
            data-testid="tile-header"
          >
            <div className="flex items-center gap-3 mt-2">
              <Badge variant="outline" className="text-sm px-3 py-1 bg-blue-600/20 text-blue-300 border-blue-500/50">
                Current Week: {currentWeekData?.weekNumber || "..."}
              </Badge>
              <Badge variant="outline" className="text-sm px-3 py-1 bg-emerald-600/20 text-emerald-300 border-emerald-500/50">
                Total: {grandTotal.toLocaleString()} spots
              </Badge>
            </div>
          </BentoTile>

          <BentoTile
            size="md"
            variant="glass"
            icon={<Clock className="h-5 w-5" />}
            title="Week Selector"
            data-testid="tile-week-selector"
          >
            <div className="flex flex-col gap-3">
              <div className="flex items-center gap-3">
                <Label className="text-slate-300 text-sm whitespace-nowrap">Week:</Label>
                <Input
                  type="number"
                  value={selectedWeek}
                  onChange={(e) => setSelectedWeek(parseInt(e.target.value))}
                  className="w-20 bg-slate-800/50 border-slate-600 text-white"
                  data-testid="input-week-number"
                />
              </div>
              <PremiumButton
                variant="glow"
                size="sm"
                icon={<RefreshCw className="h-4 w-4" />}
                onClick={() => setSelectedWeek(currentWeekData?.weekNumber || 47)}
                data-testid="button-jump-to-current"
              >
                Jump to Current
              </PremiumButton>
            </div>
          </BentoTile>

          {!canEdit && (
            <BentoTile
              size="md"
              variant="gradient"
              icon={<ShieldAlert className="h-5 w-5 text-amber-400" />}
              title={isSandbox ? "Sandbox Mode" : "View Only"}
              description={isSandbox 
                ? "Editing disabled to protect live data" 
                : "Supervisor/Manager access required"}
              data-testid="tile-access-restriction"
            />
          )}

          {canEdit && (
            <BentoTile
              size="md"
              variant="glass"
              icon={<AlertCircle className="h-5 w-5 text-amber-400" />}
              data-testid="tile-info"
            >
              <p className="text-amber-300/80 text-sm">
                Lines can shift a lane or two, add overflow, or adjust spot counts as needed.
              </p>
            </BentoTile>
          )}
        </BentoGrid>

        <div className="space-y-4">
          <PremiumAccordion type="multiple" defaultValue={["tuesday", "wednesday", "thursday"]}>
            <PremiumAccordionItem value="tuesday" variant="gradient">
              <PremiumAccordionTrigger
                icon={<Layers className="h-5 w-5 text-blue-400" />}
                badge={`${tuesdayTotal.toLocaleString()} spots`}
                description={`${tuesdayLanes.length} lanes configured`}
              >
                Tuesday Sale Day
              </PremiumAccordionTrigger>
              <PremiumAccordionContent>
                <LaneGrid lanes={tuesdayLanes} saleDay="Tuesday" weekNumber={selectedWeek} onSave={handleSaveLane} canEdit={canEdit} />
              </PremiumAccordionContent>
            </PremiumAccordionItem>

            <PremiumAccordionItem value="wednesday" variant="gradient">
              <PremiumAccordionTrigger
                icon={<Layers className="h-5 w-5 text-green-400" />}
                badge={`${wednesdayTotal.toLocaleString()} spots`}
                description={`${wednesdayLanes.length} lanes configured`}
              >
                Wednesday Sale Day
              </PremiumAccordionTrigger>
              <PremiumAccordionContent>
                <LaneGrid lanes={wednesdayLanes} saleDay="Wednesday" weekNumber={selectedWeek} onSave={handleSaveLane} canEdit={canEdit} />
              </PremiumAccordionContent>
            </PremiumAccordionItem>

            <PremiumAccordionItem value="thursday" variant="gradient">
              <PremiumAccordionTrigger
                icon={<Layers className="h-5 w-5 text-purple-400" />}
                badge={`${thursdayTotal.toLocaleString()} spots`}
                description={`${thursdayLanes.length} lanes configured`}
              >
                Thursday Sale Day
              </PremiumAccordionTrigger>
              <PremiumAccordionContent>
                <LaneGrid lanes={thursdayLanes} saleDay="Thursday" weekNumber={selectedWeek} onSave={handleSaveLane} canEdit={canEdit} />
              </PremiumAccordionContent>
            </PremiumAccordionItem>
          </PremiumAccordion>
        </div>
      </div>
    </div>
  );
}

function LaneGrid({ lanes, saleDay, weekNumber, onSave, canEdit }: { 
  lanes: LaneConfig[]; 
  saleDay: string; 
  weekNumber: number;
  onSave: (lane: LaneConfig) => void;
  canEdit: boolean;
}) {
  const [editingLane, setEditingLane] = useState<number | null>(null);
  const [editData, setEditData] = useState<{
    totalSpots: string;
    isOverflow: boolean;
    overflowLabel: string;
    notes: string;
  }>({ totalSpots: "", isOverflow: false, overflowLabel: "", notes: "" });

  const handleEdit = (lane: LaneConfig) => {
    if (!canEdit) return;
    setEditingLane(lane.laneNumber);
    setEditData({
      totalSpots: lane.totalSpots.toString(),
      isOverflow: lane.isOverflow || false,
      overflowLabel: lane.overflowLabel || "",
      notes: lane.notes || ""
    });
  };

  const handleSave = (lane: LaneConfig) => {
    if (!canEdit) return;
    onSave({
      ...lane,
      totalSpots: parseInt(editData.totalSpots) || 0,
      isOverflow: editData.isOverflow,
      overflowLabel: editData.isOverflow ? editData.overflowLabel : undefined,
      notes: editData.notes
    });
    setEditingLane(null);
  };

  const handleQuickAdjust = (lane: LaneConfig, adjustment: number) => {
    if (!canEdit) return;
    const newSpots = lane.totalSpots + adjustment;
    if (newSpots >= 0) {
      onSave({
        ...lane,
        totalSpots: newSpots
      });
    }
  };

  if (lanes.length === 0) {
    return (
      <div className="text-center py-8 text-slate-400">
        No lanes configured for {saleDay}
      </div>
    );
  }

  return (
    <BentoGrid columns={4} gap="md">
      {lanes.map((lane) => (
        <BentoTile
          key={lane.laneNumber}
          size="md"
          variant={lane.isOverflow ? "glow" : "glass"}
          sparkle={lane.isOverflow}
          interactive={canEdit}
          badge={lane.isOverflow ? "OVERFLOW" : undefined}
          data-testid={`tile-lane-${lane.laneNumber}`}
        >
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-xl font-bold text-white">
              Lane {lane.laneNumber}
            </h3>
          </div>
          
          {lane.overflowLabel && (
            <div className="text-sm text-orange-300 font-semibold mb-2">
              {lane.overflowLabel}
            </div>
          )}
          
          {editingLane === lane.laneNumber ? (
            <div className="space-y-3">
              <div>
                <Label className="text-slate-300 text-xs">Total Spots</Label>
                <Input
                  type="number"
                  value={editData.totalSpots}
                  onChange={(e) => setEditData({...editData, totalSpots: e.target.value})}
                  className="bg-slate-700/50 border-slate-600 text-white text-lg"
                  autoFocus
                  data-testid={`input-spots-${lane.laneNumber}`}
                />
              </div>

              <div className="flex items-center justify-between bg-slate-700/30 p-2 rounded-lg">
                <Label className="text-slate-300 text-xs">Overflow Lane?</Label>
                <Switch
                  checked={editData.isOverflow}
                  onCheckedChange={(checked) => setEditData({...editData, isOverflow: checked})}
                  data-testid={`switch-overflow-${lane.laneNumber}`}
                />
              </div>

              {editData.isOverflow && (
                <div>
                  <Label className="text-orange-300 text-xs">Overflow Label</Label>
                  <Input
                    type="text"
                    placeholder="e.g. Overflow 20, Overflow A"
                    value={editData.overflowLabel}
                    onChange={(e) => setEditData({...editData, overflowLabel: e.target.value})}
                    className="bg-slate-700/50 border-orange-500/50 text-white text-sm"
                    data-testid={`input-overflow-label-${lane.laneNumber}`}
                  />
                </div>
              )}

              <div>
                <Label className="text-slate-300 text-xs">Notes (Optional)</Label>
                <Input
                  type="text"
                  placeholder="LP at 100, FH near end"
                  value={editData.notes}
                  onChange={(e) => setEditData({...editData, notes: e.target.value})}
                  className="bg-slate-700/50 border-slate-600 text-white text-sm"
                  data-testid={`input-notes-${lane.laneNumber}`}
                />
              </div>

              <div className="flex gap-2">
                <PremiumButton
                  size="sm"
                  variant="primary"
                  icon={<Save className="h-3 w-3" />}
                  onClick={() => handleSave(lane)}
                  className="flex-1"
                  data-testid={`button-save-${lane.laneNumber}`}
                >
                  Save
                </PremiumButton>
                <PremiumButton
                  size="sm"
                  variant="glass"
                  onClick={() => setEditingLane(null)}
                  className="flex-1"
                  data-testid={`button-cancel-${lane.laneNumber}`}
                >
                  Cancel
                </PremiumButton>
              </div>
            </div>
          ) : (
            <div>
              <div className="text-3xl font-bold text-blue-400 mb-1">
                {lane.totalSpots.toLocaleString()}
              </div>
              <div className="text-sm text-slate-400 mb-3">spots</div>

              {lane.notes && (
                <div className="text-xs text-slate-400 mb-3 italic border-l-2 border-blue-500/50 pl-2">
                  {lane.notes}
                </div>
              )}

              {canEdit && (
                <div className="grid grid-cols-3 gap-1 mb-2">
                  <PremiumButton
                    size="sm"
                    variant="glass"
                    onClick={() => handleQuickAdjust(lane, 50)}
                    className="text-xs text-green-400 border-green-600/30"
                    data-testid={`button-add50-${lane.laneNumber}`}
                  >
                    +50
                  </PremiumButton>
                  <PremiumButton
                    size="sm"
                    variant="glass"
                    onClick={() => handleQuickAdjust(lane, 100)}
                    className="text-xs text-green-400 border-green-600/30"
                    data-testid={`button-add100-${lane.laneNumber}`}
                  >
                    +100
                  </PremiumButton>
                  <PremiumButton
                    size="sm"
                    variant="glass"
                    onClick={() => handleQuickAdjust(lane, -50)}
                    className="text-xs text-red-400 border-red-600/30"
                    data-testid={`button-sub50-${lane.laneNumber}`}
                  >
                    -50
                  </PremiumButton>
                </div>
              )}

              <PremiumButton
                size="sm"
                variant={canEdit ? "default" : "glass"}
                onClick={() => canEdit && handleEdit(lane)}
                disabled={!canEdit}
                className="w-full"
                data-testid={`button-edit-${lane.laneNumber}`}
              >
                {canEdit ? "Full Edit" : "View Only"}
              </PremiumButton>
            </div>
          )}
        </BentoTile>
      ))}
    </BentoGrid>
  );
}
