import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { MapPin, Navigation, Save, X, Check, ChevronDown, ChevronUp, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { getCurrentPosition } from "@/utils/geofencing";

interface LaneCoordinate {
  id: string;
  laneName: string;
  description?: string; // Optional description like "Center, between Row 1 & 2"
  startLat: number;
  startLng: number;
  endLat?: number;
  endLng?: number;
  capturedBy: string;
  capturedAt: string;
}

interface LaneMapperProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function LaneMapper({ isOpen, onClose }: LaneMapperProps) {
  const [section, setSection] = useState("");
  const [lane, setLane] = useState("");
  const [row, setRow] = useState("");
  const [laneNumber, setLaneNumber] = useState("");
  const [locationDescription, setLocationDescription] = useState("");
  const [currentStep, setCurrentStep] = useState<'idle' | 'marking_start' | 'marking_end' | 'complete'>('idle');
  const [currentPosition, setCurrentPosition] = useState<{lat: number, lng: number} | null>(null);
  const [pendingLane, setPendingLane] = useState<Partial<LaneCoordinate> | null>(null);
  const [savedLanes, setSavedLanes] = useState<LaneCoordinate[]>([]);
  const [showSavedLanes, setShowSavedLanes] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [mode, setMode] = useState<'quick' | 'detailed'>('quick');
  const { toast } = useToast();

  useEffect(() => {
    if (isOpen) {
      loadSavedLanes();
      updatePosition();
    }
  }, [isOpen]);

  const loadSavedLanes = async () => {
    try {
      const stored = localStorage.getItem('vanops_lane_coordinates');
      if (stored) {
        setSavedLanes(JSON.parse(stored));
      }
    } catch (error) {
      console.error('Failed to load lane coordinates:', error);
    }
  };

  const saveLanesToStorage = (lanes: LaneCoordinate[]) => {
    localStorage.setItem('vanops_lane_coordinates', JSON.stringify(lanes));
    setSavedLanes(lanes);
  };

  const updatePosition = async () => {
    const pos = await getCurrentPosition();
    if (pos) {
      setCurrentPosition(pos);
    }
  };

  const handleMarkStart = async () => {
    if (!laneNumber.trim()) {
      toast({
        title: "Enter Lane Number",
        description: "Please enter the lane number first",
        variant: "destructive"
      });
      return;
    }

    setIsLoading(true);
    const pos = await getCurrentPosition();
    setIsLoading(false);

    if (!pos) {
      toast({
        title: "GPS Not Available",
        description: "Could not get your current location. Enable GPS and try again.",
        variant: "destructive"
      });
      return;
    }

    const userStr = localStorage.getItem("vanops_user");
    const user = userStr ? JSON.parse(userStr) : null;

    setPendingLane({
      id: `lane-${laneNumber}-${Date.now()}`,
      laneName: `Lane ${laneNumber}`,
      startLat: pos.lat,
      startLng: pos.lng,
      capturedBy: user?.name || 'Unknown',
      capturedAt: new Date().toISOString()
    });

    setCurrentStep('marking_start');
    setCurrentPosition(pos);

    toast({
      title: "Start Point Marked",
      description: `Lane ${laneNumber} start: ${pos.lat.toFixed(5)}, ${pos.lng.toFixed(5)}`,
    });
  };

  const handleMarkEnd = async () => {
    if (!pendingLane) return;

    setIsLoading(true);
    const pos = await getCurrentPosition();
    setIsLoading(false);

    if (!pos) {
      toast({
        title: "GPS Not Available",
        description: "Could not get your current location",
        variant: "destructive"
      });
      return;
    }

    const completeLane: LaneCoordinate = {
      ...pendingLane as LaneCoordinate,
      endLat: pos.lat,
      endLng: pos.lng
    };

    const updatedLanes = [...savedLanes.filter(l => l.laneName !== completeLane.laneName), completeLane];
    saveLanesToStorage(updatedLanes);

    setCurrentStep('complete');
    setCurrentPosition(pos);

    toast({
      title: "Lane Mapped Successfully",
      description: `${completeLane.laneName} coordinates saved`,
    });

    setTimeout(() => {
      setCurrentStep('idle');
      setPendingLane(null);
      setLaneNumber("");
    }, 2000);
  };

  const handleDeleteLane = (laneId: string) => {
    const updatedLanes = savedLanes.filter(l => l.id !== laneId);
    saveLanesToStorage(updatedLanes);
    toast({
      title: "Lane Deleted",
      description: "Lane coordinates removed",
    });
  };

  // QUICK MARK - Single tap to save current location with structured fields
  const handleQuickMark = async () => {
    // Need section OR lane, plus row
    if (!section.trim() && !lane.trim()) {
      toast({
        title: "Enter Location",
        description: "Please enter a Section or Lane number",
        variant: "destructive"
      });
      return;
    }
    
    if (!row.trim()) {
      toast({
        title: "Enter Row",
        description: "Please enter the Row number",
        variant: "destructive"
      });
      return;
    }

    setIsLoading(true);
    const pos = await getCurrentPosition();
    setIsLoading(false);

    if (!pos) {
      toast({
        title: "GPS Not Available",
        description: "Could not get your current location. Enable GPS and try again.",
        variant: "destructive"
      });
      return;
    }

    const userStr = localStorage.getItem("vanops_user");
    const user = userStr ? JSON.parse(userStr) : null;
    
    // Build location label: Section OR Lane + Row
    const locationLabel = section.trim() 
      ? `Section ${section.trim()} Row ${row.trim()}`
      : `Lane ${lane.trim()} Row ${row.trim()}`;

    const newMarker: LaneCoordinate = {
      id: `loc-${Date.now()}`,
      laneName: locationLabel,
      startLat: pos.lat,
      startLng: pos.lng,
      capturedBy: user?.name || 'Unknown',
      capturedAt: new Date().toISOString()
    };

    // Add new marker (don't replace - allow multiple markers)
    const updatedLanes = [...savedLanes, newMarker];
    saveLanesToStorage(updatedLanes);

    toast({
      title: "Tagged!",
      description: `"${locationLabel}" saved`,
    });

    // Reset inputs
    setSection("");
    setLane("");
    setRow("");
  };

  const handleSkipEnd = () => {
    if (!pendingLane) return;

    const partialLane: LaneCoordinate = {
      ...pendingLane as LaneCoordinate,
    };

    const updatedLanes = [...savedLanes.filter(l => l.laneName !== partialLane.laneName), partialLane];
    saveLanesToStorage(updatedLanes);

    toast({
      title: "Start Point Saved",
      description: `${partialLane.laneName} start point saved (no end point)`,
    });

    setCurrentStep('idle');
    setPendingLane(null);
    setLaneNumber("");
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <motion.div
        className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
      >
        <motion.div
          className="w-full max-w-md bg-slate-900 rounded-2xl border border-slate-700 overflow-hidden"
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.9, opacity: 0 }}
          onClick={(e) => e.stopPropagation()}
        >
          <CardHeader className="bg-gradient-to-r from-cyan-900/50 to-blue-900/50 border-b border-slate-700">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-cyan-500/20">
                  <Navigation className="h-5 w-5 text-cyan-400" />
                </div>
                <div>
                  <CardTitle className="text-white text-lg">GPS Lane Mapper</CardTitle>
                  <p className="text-slate-400 text-xs">Mark lane start & end points</p>
                </div>
              </div>
              <Button variant="ghost" size="icon" onClick={onClose} data-testid="button-close-mapper">
                <X className="h-5 w-5 text-slate-400" />
              </Button>
            </div>
          </CardHeader>

          <CardContent className="p-4 space-y-4">
            {currentStep === 'idle' && (
              <>
                {/* STRUCTURED INPUT FIELDS */}
                <div className="grid grid-cols-2 gap-3 mb-3">
                  <div className="space-y-1">
                    <label className="text-slate-400 text-xs text-center block">Section (Inventory)</label>
                    <Input
                      type="text"
                      placeholder="515"
                      value={section}
                      onChange={(e) => {
                        setSection(e.target.value);
                        if (e.target.value) setLane(""); // Clear lane if section entered
                      }}
                      className="bg-slate-800 border-slate-700 text-white text-xl h-14 text-center font-bold"
                      data-testid="input-section"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-slate-400 text-xs text-center block">Lane (Sale)</label>
                    <Input
                      type="text"
                      placeholder="49"
                      value={lane}
                      onChange={(e) => {
                        setLane(e.target.value);
                        if (e.target.value) setSection(""); // Clear section if lane entered
                      }}
                      className="bg-slate-800 border-slate-700 text-white text-xl h-14 text-center font-bold"
                      data-testid="input-lane"
                    />
                  </div>
                </div>
                
                <div className="space-y-1">
                  <label className="text-slate-400 text-xs text-center block">Row (Required)</label>
                  <Input
                    type="text"
                    placeholder="2"
                    value={row}
                    onChange={(e) => setRow(e.target.value)}
                    className="bg-slate-800 border-slate-700 text-white text-xl h-14 text-center font-bold"
                    data-testid="input-row"
                  />
                </div>

                {/* Preview of what will be saved */}
                {(section || lane) && row && (
                  <div className="p-3 rounded-lg bg-green-900/30 border border-green-600/30 text-center">
                    <span className="text-green-300 text-xs">Will tag: </span>
                    <span className="text-green-400 text-lg font-bold">
                      {section ? `Section ${section}` : `Lane ${lane}`} Row {row}
                    </span>
                  </div>
                )}

                <Button
                  className="w-full h-14 bg-green-600 hover:bg-green-500 text-white font-bold text-lg"
                  onClick={handleQuickMark}
                  disabled={isLoading || (!section.trim() && !lane.trim()) || !row.trim()}
                  data-testid="button-tag-here"
                >
                  {isLoading ? (
                    <span className="flex items-center gap-2">
                      <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      Getting GPS...
                    </span>
                  ) : (
                    <span className="flex items-center gap-2">
                      <MapPin className="h-5 w-5" />
                      Tag Here
                    </span>
                  )}
                </Button>

                {currentPosition && (
                  <p className="text-center text-slate-500 text-xs">
                    GPS: {currentPosition.lat.toFixed(5)}, {currentPosition.lng.toFixed(5)}
                  </p>
                )}

                <div className="p-2 rounded-lg bg-blue-900/30 border border-blue-600/30">
                  <p className="text-blue-300 text-[10px]">
                    Enter Section (like 515), Lane (like 49), and/or Row (like 2), then tap Tag Here.
                  </p>
                </div>
              </>
            )}

            {currentStep === 'marking_start' && pendingLane && (
              <>
                <div className="p-4 rounded-xl bg-green-900/30 border-2 border-green-500 text-center">
                  <Check className="h-8 w-8 text-green-400 mx-auto mb-2" />
                  <p className="text-green-400 font-bold text-lg">{pendingLane.laneName} Start Marked</p>
                  <p className="text-green-300/70 text-sm">
                    {pendingLane.startLat?.toFixed(5)}, {pendingLane.startLng?.toFixed(5)}
                  </p>
                </div>

                <div className="p-3 rounded-lg bg-amber-900/30 border border-amber-600/30">
                  <p className="text-amber-300 text-sm font-medium">Next Step:</p>
                  <p className="text-amber-200/70 text-xs">
                    Drive to the END of {pendingLane.laneName}, then tap "Mark End Point"
                  </p>
                </div>

                <Button
                  className="w-full h-14 bg-green-600 hover:bg-green-500 text-white font-bold text-lg"
                  onClick={handleMarkEnd}
                  disabled={isLoading}
                  data-testid="button-mark-end"
                >
                  {isLoading ? (
                    <span className="flex items-center gap-2">
                      <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      Getting GPS...
                    </span>
                  ) : (
                    <span className="flex items-center gap-2">
                      <MapPin className="h-5 w-5" />
                      Mark End Point
                    </span>
                  )}
                </Button>

                <Button
                  variant="outline"
                  className="w-full border-slate-600 text-slate-400"
                  onClick={handleSkipEnd}
                  data-testid="button-skip-end"
                >
                  Save Start Only (Skip End)
                </Button>
              </>
            )}

            {currentStep === 'complete' && (
              <div className="p-6 rounded-xl bg-green-900/40 border-2 border-green-500 text-center">
                <Check className="h-12 w-12 text-green-400 mx-auto mb-3" />
                <p className="text-green-400 font-bold text-xl">Lane Mapped!</p>
                <p className="text-green-300/70 text-sm mt-2">
                  Coordinates saved successfully
                </p>
              </div>
            )}

            {savedLanes.length > 0 && currentStep === 'idle' && (
              <div className="border-t border-slate-700 pt-4">
                <button
                  className="flex items-center justify-between w-full text-left"
                  onClick={() => setShowSavedLanes(!showSavedLanes)}
                  data-testid="button-toggle-saved-lanes"
                >
                  <span className="text-slate-400 text-sm font-medium">
                    Mapped Lanes ({savedLanes.length})
                  </span>
                  {showSavedLanes ? (
                    <ChevronUp className="h-4 w-4 text-slate-500" />
                  ) : (
                    <ChevronDown className="h-4 w-4 text-slate-500" />
                  )}
                </button>

                {showSavedLanes && (
                  <div className="mt-3 space-y-2 max-h-48 overflow-y-auto">
                    {savedLanes.map((lane) => (
                      <div
                        key={lane.id}
                        className="flex items-center justify-between p-2 rounded-lg bg-slate-800/50"
                      >
                        <div>
                          <p className="text-white text-sm font-medium">{lane.laneName}</p>
                          <p className="text-slate-500 text-[10px]">
                            {lane.endLat ? 'Full mapping' : 'Start only'}
                          </p>
                        </div>
                        <div className="flex items-center gap-2">
                          <Badge variant="outline" className="text-green-400 border-green-600/30">
                            <MapPin className="h-3 w-3 mr-1" />
                            Mapped
                          </Badge>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-7 w-7 text-red-400 hover:text-red-300 hover:bg-red-900/20"
                            onClick={() => handleDeleteLane(lane.id)}
                            data-testid={`button-delete-lane-${lane.id}`}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </CardContent>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}

// Calculate direction and distance from current location to a destination
export function getDirectionToLocation(
  fromLat: number, 
  fromLng: number, 
  destinationName: string
): { direction: string; distance: string; found: boolean } | null {
  try {
    const stored = localStorage.getItem('vanops_lane_coordinates');
    if (!stored) return null;

    const lanes: LaneCoordinate[] = JSON.parse(stored);
    
    // Find a matching location (partial match)
    const searchTerm = destinationName.toLowerCase();
    const match = lanes.find(lane => 
      lane.laneName.toLowerCase().includes(searchTerm) ||
      searchTerm.includes(lane.laneName.toLowerCase().replace('lane ', '').replace('lot ', ''))
    );
    
    if (!match) return { direction: '', distance: '', found: false };

    const toLat = match.startLat;
    const toLng = match.startLng;

    // Calculate distance in miles
    const R = 3959; // Earth's radius in miles
    const dLat = (toLat - fromLat) * Math.PI / 180;
    const dLng = (toLng - fromLng) * Math.PI / 180;
    const a = Math.sin(dLat/2) * Math.sin(dLat/2) +
              Math.cos(fromLat * Math.PI / 180) * Math.cos(toLat * Math.PI / 180) *
              Math.sin(dLng/2) * Math.sin(dLng/2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    const distanceMiles = R * c;

    // Format distance
    let distanceStr: string;
    if (distanceMiles < 0.1) {
      const feet = Math.round(distanceMiles * 5280);
      distanceStr = `${feet} ft`;
    } else {
      distanceStr = `${distanceMiles.toFixed(2)} mi`;
    }

    // Calculate bearing/direction
    const y = Math.sin((toLng - fromLng) * Math.PI / 180) * Math.cos(toLat * Math.PI / 180);
    const x = Math.cos(fromLat * Math.PI / 180) * Math.sin(toLat * Math.PI / 180) -
              Math.sin(fromLat * Math.PI / 180) * Math.cos(toLat * Math.PI / 180) * 
              Math.cos((toLng - fromLng) * Math.PI / 180);
    let bearing = Math.atan2(y, x) * 180 / Math.PI;
    bearing = (bearing + 360) % 360;

    // Convert bearing to cardinal direction
    let direction: string;
    if (bearing >= 337.5 || bearing < 22.5) direction = "NORTH";
    else if (bearing >= 22.5 && bearing < 67.5) direction = "NORTHEAST";
    else if (bearing >= 67.5 && bearing < 112.5) direction = "EAST";
    else if (bearing >= 112.5 && bearing < 157.5) direction = "SOUTHEAST";
    else if (bearing >= 157.5 && bearing < 202.5) direction = "SOUTH";
    else if (bearing >= 202.5 && bearing < 247.5) direction = "SOUTHWEST";
    else if (bearing >= 247.5 && bearing < 292.5) direction = "WEST";
    else direction = "NORTHWEST";

    return { direction, distance: distanceStr, found: true };
  } catch (error) {
    console.error('Error calculating direction:', error);
    return null;
  }
}

export function findNearestLane(lat: number, lng: number): string | null {
  try {
    const stored = localStorage.getItem('vanops_lane_coordinates');
    if (!stored) return null;

    const lanes: LaneCoordinate[] = JSON.parse(stored);
    if (lanes.length === 0) return null;

    let nearestLane: string | null = null;
    let minDistance = Infinity;

    for (const lane of lanes) {
      const distToStart = Math.sqrt(
        Math.pow(lat - lane.startLat, 2) + Math.pow(lng - lane.startLng, 2)
      );

      if (distToStart < minDistance) {
        minDistance = distToStart;
        nearestLane = lane.laneName;
      }

      if (lane.endLat && lane.endLng) {
        const distToEnd = Math.sqrt(
          Math.pow(lat - lane.endLat, 2) + Math.pow(lng - lane.endLng, 2)
        );
        if (distToEnd < minDistance) {
          minDistance = distToEnd;
          nearestLane = lane.laneName;
        }
      }
    }

    const PROXIMITY_THRESHOLD = 0.0005;
    if (minDistance < PROXIMITY_THRESHOLD) {
      return nearestLane;
    }

    return null;
  } catch (error) {
    console.error('Error finding nearest lane:', error);
    return null;
  }
}
