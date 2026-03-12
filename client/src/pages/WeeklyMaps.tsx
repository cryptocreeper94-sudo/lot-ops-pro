import { useState } from "react";
import { useLocation } from "wouter";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { ZoomableMapImage } from "@/components/ZoomableMapImage";
import { 
  ArrowLeft, 
  Upload, 
  Check,
  Calendar,
  Image as ImageIcon,
  Trash2,
  GitCompare
} from "lucide-react";
import { NavigationControl } from "@/components/NavigationControl";

interface WeeklyMap {
  id: number;
  weekNumber: number;
  year: number;
  effectiveDate: string | null;
  mapImageUrl: string | null;
  isActive: boolean;
  uploadedBy: string | null;
  notes: string | null;
  createdAt: string;
}

export default function WeeklyMaps() {
  const [_, setLocation] = useLocation();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const [weekNumber, setWeekNumber] = useState("");
  const [year, setYear] = useState(new Date().getFullYear().toString());
  const [effectiveDate, setEffectiveDate] = useState("");
  const [notes, setNotes] = useState("");
  const [mapImage, setMapImage] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string>("");
  
  // Comparison view state
  const [showComparison, setShowComparison] = useState(false);
  const [compareWeek1, setCompareWeek1] = useState<string>("");
  const [compareWeek2, setCompareWeek2] = useState<string>("");

  // Fetch existing weekly maps
  const { data: maps = [] } = useQuery<WeeklyMap[]>({
    queryKey: ["/api/weekly-maps"],
  });

  // Upload new weekly map
  const uploadMapMutation = useMutation({
    mutationFn: async () => {
      if (!weekNumber || !mapImage) {
        throw new Error("Week number and map image are required");
      }

      // Convert image to base64
      const reader = new FileReader();
      const base64Promise = new Promise<string>((resolve) => {
        reader.onload = () => resolve(reader.result as string);
        reader.readAsDataURL(mapImage);
      });
      const base64Image = await base64Promise;

      const res = await fetch("/api/weekly-maps", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          weekNumber: parseInt(weekNumber),
          year: parseInt(year),
          effectiveDate,
          mapImageUrl: base64Image,
          notes
        }),
      });

      if (!res.ok) throw new Error("Failed to upload map");
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/weekly-maps"] });
      toast({ title: "Map Uploaded", description: `Week ${weekNumber} map uploaded successfully` });
      
      // Reset form
      setWeekNumber("");
      setEffectiveDate("");
      setNotes("");
      setMapImage(null);
      setImagePreview("");
    },
  });

  // Set active week
  const setActiveWeekMutation = useMutation({
    mutationFn: async (mapId: number) => {
      const res = await fetch(`/api/weekly-maps/${mapId}/activate`, {
        method: "POST",
      });
      if (!res.ok) throw new Error("Failed to activate week");
      return res.json();
    },
    onSuccess: (_, mapId) => {
      queryClient.invalidateQueries({ queryKey: ["/api/weekly-maps"] });
      const map = maps.find(m => m.id === mapId);
      toast({ 
        title: "Week Activated", 
        description: `Week ${map?.weekNumber} is now active` 
      });
    },
  });

  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setMapImage(file);
      const reader = new FileReader();
      reader.onload = () => setImagePreview(reader.result as string);
      reader.readAsDataURL(file);
    }
  };

  const activeMap = maps.find(m => m.isActive);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900 p-2">
      <div className="max-w-5xl mx-auto space-y-2 py-2">
        <NavigationControl variant="back" fallbackRoute="/developer" />

        <Card className="bg-white/95">
          <CardHeader className="pb-2 pt-3 px-3">
            <CardTitle className="text-lg">Weekly Lane Maps</CardTitle>
            <p className="text-xs text-gray-500">Upload and manage weekly lane configurations</p>
          </CardHeader>
          <CardContent className="p-3 pt-0 space-y-3">
            {/* Current Active Week */}
            {activeMap && (
              <div className="bg-green-50 border border-green-200 rounded p-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Calendar className="h-4 w-4 text-green-600" />
                    <span className="font-bold text-sm text-green-900">
                      Active: Week {activeMap.weekNumber} ({activeMap.year})
                    </span>
                  </div>
                  <Badge variant="outline" className="bg-green-600 text-white border-none text-xs">
                    LIVE
                  </Badge>
                </div>
                {activeMap.effectiveDate && (
                  <p className="text-xs text-green-700 mt-1">Effective: {activeMap.effectiveDate}</p>
                )}
              </div>
            )}

            {/* Upload New Map */}
            <Card className="border-2 border-dashed border-blue-200 bg-blue-50/30">
              <CardHeader className="pb-2 pt-3 px-3">
                <CardTitle className="text-sm flex items-center gap-2">
                  <Upload className="h-4 w-4" />
                  Upload New Weekly Map
                </CardTitle>
              </CardHeader>
              <CardContent className="p-3 pt-0 space-y-2">
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <Label htmlFor="week-number" className="text-xs">Week Number</Label>
                    <Input
                      id="week-number"
                      type="number"
                      placeholder="48"
                      value={weekNumber}
                      onChange={(e) => setWeekNumber(e.target.value)}
                      className="h-8 text-sm"
                      data-testid="input-week-number"
                    />
                  </div>
                  <div>
                    <Label htmlFor="year" className="text-xs">Year</Label>
                    <Input
                      id="year"
                      type="number"
                      value={year}
                      onChange={(e) => setYear(e.target.value)}
                      className="h-8 text-sm"
                      data-testid="input-year"
                    />
                  </div>
                </div>

                <div>
                  <Label htmlFor="effective-date" className="text-xs">Effective Date (optional)</Label>
                  <Input
                    id="effective-date"
                    type="text"
                    placeholder="November 19, 2025"
                    value={effectiveDate}
                    onChange={(e) => setEffectiveDate(e.target.value)}
                    className="h-8 text-sm"
                    data-testid="input-effective-date"
                  />
                </div>

                <div>
                  <Label htmlFor="notes" className="text-xs">Notes (optional)</Label>
                  <Textarea
                    id="notes"
                    placeholder="Wednesday & Tuesday lanes..."
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    rows={2}
                    className="text-sm"
                    data-testid="textarea-notes"
                  />
                </div>

                <div>
                  <Label htmlFor="map-image" className="text-xs">Map Image</Label>
                  <Input
                    id="map-image"
                    type="file"
                    accept="image/*"
                    onChange={handleImageSelect}
                    className="h-8 text-xs"
                    data-testid="input-map-image"
                  />
                </div>

                {imagePreview && (
                  <div className="border rounded p-2 bg-white">
                    <p className="text-xs text-gray-600 mb-1">Preview:</p>
                    <ZoomableMapImage 
                      src={imagePreview} 
                      alt="Map preview" 
                      className=""
                    />
                  </div>
                )}

                <Button
                  onClick={() => uploadMapMutation.mutate()}
                  disabled={!weekNumber || !mapImage || uploadMapMutation.isPending}
                  className="w-full h-8 text-sm"
                  data-testid="button-upload"
                >
                  <Upload className="h-3 w-3 mr-1.5" />
                  {uploadMapMutation.isPending ? "Uploading..." : "Upload Map"}
                </Button>
              </CardContent>
            </Card>

            {/* Comparison View */}
            <Card className="border-2 border-dashed border-orange-200 bg-orange-50/30">
              <CardHeader className="pb-2 pt-3 px-3">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-sm flex items-center gap-2">
                    <GitCompare className="h-4 w-4" />
                    Compare Weeks
                  </CardTitle>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setShowComparison(!showComparison)}
                    className="h-6 text-xs"
                    data-testid="button-toggle-comparison"
                  >
                    {showComparison ? "Hide" : "Show"}
                  </Button>
                </div>
              </CardHeader>
              {showComparison && (
                <CardContent className="p-3 pt-0 space-y-2">
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <Label className="text-xs">Week 1</Label>
                      <Select value={compareWeek1} onValueChange={setCompareWeek1}>
                        <SelectTrigger className="h-8 text-xs" data-testid="select-week-1">
                          <SelectValue placeholder="Select week" />
                        </SelectTrigger>
                        <SelectContent>
                          {maps.map((map) => (
                            <SelectItem key={map.id} value={map.id.toString()}>
                              Week {map.weekNumber} ({map.year})
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label className="text-xs">Week 2</Label>
                      <Select value={compareWeek2} onValueChange={setCompareWeek2}>
                        <SelectTrigger className="h-8 text-xs" data-testid="select-week-2">
                          <SelectValue placeholder="Select week" />
                        </SelectTrigger>
                        <SelectContent>
                          {maps.map((map) => (
                            <SelectItem key={map.id} value={map.id.toString()}>
                              Week {map.weekNumber} ({map.year})
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  
                  {compareWeek1 && compareWeek2 && compareWeek1 !== compareWeek2 && (
                    <div className="grid grid-cols-2 gap-2 mt-3">
                      {[compareWeek1, compareWeek2].map((weekId) => {
                        const map = maps.find(m => m.id.toString() === weekId);
                        if (!map) return null;
                        
                        return (
                          <div key={weekId} className="bg-white rounded border p-2">
                            <div className="flex items-center gap-2 mb-1">
                              <Calendar className="h-3 w-3 text-gray-500" />
                              <span className="font-bold text-xs">
                                Week {map.weekNumber} ({map.year})
                              </span>
                              {map.isActive && (
                                <Badge className="bg-green-600 text-white text-[9px] py-0 px-1">
                                  ACTIVE
                                </Badge>
                              )}
                            </div>
                            {map.effectiveDate && (
                              <p className="text-[10px] text-gray-600 mb-1">
                                {map.effectiveDate}
                              </p>
                            )}
                            {map.mapImageUrl ? (
                              <ZoomableMapImage 
                                src={map.mapImageUrl} 
                                alt={`Week ${map.weekNumber}`} 
                                className=""
                              />
                            ) : (
                              <div className="bg-gray-100 rounded p-4 text-center">
                                <ImageIcon className="h-6 w-6 text-gray-300 mx-auto mb-1" />
                                <p className="text-[10px] text-gray-500">No image</p>
                              </div>
                            )}
                            {map.notes && (
                              <p className="text-[10px] text-gray-500 mt-1 line-clamp-2">
                                {map.notes}
                              </p>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  )}
                  
                  {compareWeek1 && compareWeek2 && compareWeek1 === compareWeek2 && (
                    <p className="text-xs text-orange-600 text-center py-2">
                      Please select two different weeks to compare
                    </p>
                  )}
                </CardContent>
              )}
            </Card>

            {/* Existing Maps */}
            <div className="space-y-2">
              <h3 className="text-sm font-bold">All Weekly Maps</h3>
              {maps.length === 0 ? (
                <p className="text-xs text-gray-500 text-center py-4">No maps uploaded yet</p>
              ) : (
                <div className="space-y-2">
                  {maps.map((map) => (
                    <Card 
                      key={map.id} 
                      className={`${map.isActive ? 'border-green-500 border-2' : 'border-gray-200'}`}
                    >
                      <CardContent className="p-2">
                        <div className="flex items-start justify-between gap-2">
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-1">
                              <Calendar className="h-3 w-3 text-gray-500" />
                              <span className="font-bold text-sm">
                                Week {map.weekNumber} ({map.year})
                              </span>
                              {map.isActive && (
                                <Badge variant="outline" className="bg-green-600 text-white border-none text-[10px] py-0 px-1">
                                  ACTIVE
                                </Badge>
                              )}
                            </div>
                            {map.effectiveDate && (
                              <p className="text-xs text-gray-600">Effective: {map.effectiveDate}</p>
                            )}
                            {map.notes && (
                              <p className="text-xs text-gray-500 mt-1">{map.notes}</p>
                            )}
                            {map.mapImageUrl && (
                              <div className="mt-2">
                                <ZoomableMapImage 
                                  src={map.mapImageUrl} 
                                  alt={`Week ${map.weekNumber} map`} 
                                  className="max-h-40 object-contain"
                                />
                              </div>
                            )}
                          </div>
                          {!map.isActive && (
                            <Button
                              size="sm"
                              onClick={() => setActiveWeekMutation.mutate(map.id)}
                              disabled={setActiveWeekMutation.isPending}
                              className="h-7 text-xs"
                              data-testid={`button-activate-${map.weekNumber}`}
                            >
                              <Check className="h-3 w-3 mr-1" />
                              Set Active
                            </Button>
                          )}
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
