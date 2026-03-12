import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { 
  Brain, Sparkles, TrendingUp, AlertTriangle, CheckCircle2, XCircle, 
  Clock, Target, Zap, CloudSun, RefreshCw, ChevronRight, BarChart3,
  ThumbsUp, ThumbsDown, Loader2, MapPin
} from "lucide-react";

interface LotData {
  lotNumber: string;
  name: string;
  capacity: number;
  occupancy: number;
  utilizationPercent: number;
}

interface LotAnalysis {
  lots: LotData[];
  totalCapacity: number;
  totalOccupancy: number;
  overallUtilization: number;
  congestionZones: string[];
  underutilizedZones: string[];
}

interface AiSuggestion {
  id: number;
  facilityId: string;
  analysisType: string;
  currentUtilization: number;
  peakCapacity: number;
  currentInventory: number;
  congestionZones: string[];
  underutilizedZones: string[];
  suggestionTitle: string;
  suggestionDescription: string;
  expectedImpact: string;
  priority: string;
  confidenceScore: number;
  actionItems: string[];
  estimatedTimeToImplement: string;
  weatherCondition: string | null;
  weatherTemp: string | null;
  status: string;
  implementedBy: string | null;
  implementedAt: string | null;
  rejectionReason: string | null;
  generatedAt: string;
  expiresAt: string;
}

export function AiOptimizationDashboard() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState("overview");
  const [selectedSuggestion, setSelectedSuggestion] = useState<AiSuggestion | null>(null);
  const [showRejectDialog, setShowRejectDialog] = useState(false);
  const [rejectionReason, setRejectionReason] = useState("");

  const { data: analysis, isLoading: loadingAnalysis } = useQuery<LotAnalysis>({
    queryKey: ["/api/ai-optimization/analysis"],
    refetchInterval: 60000,
  });

  const { data: suggestions = [], isLoading: loadingSuggestions } = useQuery<AiSuggestion[]>({
    queryKey: ["/api/ai-optimization/suggestions"],
    refetchInterval: 30000,
  });

  const generateMutation = useMutation({
    mutationFn: async () => {
      const res = await fetch("/api/ai-optimization/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ facilityId: "manheim_nashville", analysisType: "capacity" }),
      });
      if (!res.ok) throw new Error("Failed to generate suggestions");
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/ai-optimization/suggestions"] });
      queryClient.invalidateQueries({ queryKey: ["/api/ai-optimization/analysis"] });
      toast({ title: "AI Analysis Complete", description: "New optimization suggestions generated" });
    },
    onError: () => {
      toast({ title: "Analysis Failed", description: "Could not generate suggestions", variant: "destructive" });
    },
  });

  const updateStatusMutation = useMutation({
    mutationFn: async ({ id, status, rejectionReason }: { id: number; status: string; rejectionReason?: string }) => {
      const res = await fetch(`/api/ai-optimization/suggestions/${id}/status`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status, implementedBy: "supervisor", rejectionReason }),
      });
      if (!res.ok) throw new Error("Failed to update status");
      return res.json();
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ["/api/ai-optimization/suggestions"] });
      const action = variables.status === "implemented" ? "implemented" : "rejected";
      toast({ title: `Suggestion ${action}`, description: `The suggestion has been marked as ${action}` });
      setSelectedSuggestion(null);
      setShowRejectDialog(false);
      setRejectionReason("");
    },
  });

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "critical": return "bg-red-500 text-white";
      case "high": return "bg-orange-500 text-white";
      case "medium": return "bg-yellow-500 text-white";
      default: return "bg-blue-500 text-white";
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "implemented": return <Badge className="bg-green-500 text-white"><CheckCircle2 className="w-3 h-3 mr-1" />Done</Badge>;
      case "rejected": return <Badge className="bg-red-500 text-white"><XCircle className="w-3 h-3 mr-1" />Rejected</Badge>;
      case "in_progress": return <Badge className="bg-blue-500 text-white"><Clock className="w-3 h-3 mr-1" />In Progress</Badge>;
      default: return <Badge className="bg-slate-500 text-white"><Sparkles className="w-3 h-3 mr-1" />Pending</Badge>;
    }
  };

  const getUtilizationColor = (percent: number) => {
    if (percent >= 85) return "text-red-600 bg-red-100";
    if (percent >= 70) return "text-orange-600 bg-orange-100";
    if (percent >= 50) return "text-yellow-600 bg-yellow-100";
    return "text-green-600 bg-green-100";
  };

  const pendingSuggestions = suggestions.filter(s => s.status === "pending" || s.status === "in_progress");
  const completedSuggestions = suggestions.filter(s => s.status === "implemented" || s.status === "rejected");

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Brain className="w-6 h-6 text-purple-600" />
          <div>
            <h2 className="text-lg font-bold text-slate-900">AI Lot Optimization</h2>
            <p className="text-xs text-slate-500">Real-time capacity analysis & smart recommendations</p>
          </div>
        </div>
        <Button
          onClick={() => generateMutation.mutate()}
          disabled={generateMutation.isPending}
          className="bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white shadow-lg"
          data-testid="button-generate-ai-suggestions"
        >
          {generateMutation.isPending ? (
            <><Loader2 className="w-4 h-4 mr-2 animate-spin" />Analyzing...</>
          ) : (
            <><Sparkles className="w-4 h-4 mr-2" />Generate Suggestions</>
          )}
        </Button>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid grid-cols-3 w-full">
          <TabsTrigger value="overview" className="text-xs">
            <BarChart3 className="w-3 h-3 mr-1" />Overview
          </TabsTrigger>
          <TabsTrigger value="suggestions" className="text-xs">
            <Sparkles className="w-3 h-3 mr-1" />Suggestions
            {pendingSuggestions.length > 0 && (
              <Badge className="ml-1 bg-purple-600 text-white text-[10px] px-1.5">{pendingSuggestions.length}</Badge>
            )}
          </TabsTrigger>
          <TabsTrigger value="history" className="text-xs">
            <Clock className="w-3 h-3 mr-1" />History
          </TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4 mt-4">
          {loadingAnalysis ? (
            <Card className="p-6">
              <div className="flex items-center justify-center gap-2">
                <Loader2 className="w-5 h-5 animate-spin text-purple-600" />
                <span className="text-sm text-slate-500">Loading lot analysis...</span>
              </div>
            </Card>
          ) : analysis ? (
            <>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                <Card className="bg-gradient-to-br from-slate-50 to-slate-100 border-slate-200">
                  <CardContent className="p-3">
                    <div className="flex items-center gap-2 mb-1">
                      <Target className="w-4 h-4 text-slate-600" />
                      <span className="text-xs text-slate-500 uppercase">Total Capacity</span>
                    </div>
                    <p className="text-xl font-bold text-slate-900" data-testid="text-total-capacity">{analysis.totalCapacity.toLocaleString()}</p>
                  </CardContent>
                </Card>
                <Card className="bg-gradient-to-br from-blue-50 to-blue-100 border-blue-200">
                  <CardContent className="p-3">
                    <div className="flex items-center gap-2 mb-1">
                      <MapPin className="w-4 h-4 text-blue-600" />
                      <span className="text-xs text-blue-600 uppercase">Current Inventory</span>
                    </div>
                    <p className="text-xl font-bold text-blue-900" data-testid="text-current-inventory">{analysis.totalOccupancy.toLocaleString()}</p>
                  </CardContent>
                </Card>
                <Card className={`bg-gradient-to-br ${analysis.overallUtilization >= 85 ? 'from-red-50 to-red-100 border-red-200' : analysis.overallUtilization >= 70 ? 'from-orange-50 to-orange-100 border-orange-200' : 'from-green-50 to-green-100 border-green-200'}`}>
                  <CardContent className="p-3">
                    <div className="flex items-center gap-2 mb-1">
                      <TrendingUp className="w-4 h-4" />
                      <span className="text-xs uppercase">Utilization</span>
                    </div>
                    <p className="text-xl font-bold" data-testid="text-utilization">{analysis.overallUtilization}%</p>
                  </CardContent>
                </Card>
                <Card className="bg-gradient-to-br from-purple-50 to-purple-100 border-purple-200">
                  <CardContent className="p-3">
                    <div className="flex items-center gap-2 mb-1">
                      <Zap className="w-4 h-4 text-purple-600" />
                      <span className="text-xs text-purple-600 uppercase">AI Suggestions</span>
                    </div>
                    <p className="text-xl font-bold text-purple-900" data-testid="text-pending-suggestions">{pendingSuggestions.length}</p>
                  </CardContent>
                </Card>
              </div>

              {(analysis.congestionZones.length > 0 || analysis.underutilizedZones.length > 0) && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {analysis.congestionZones.length > 0 && (
                    <Card className="border-red-200 bg-red-50">
                      <CardContent className="p-3">
                        <div className="flex items-center gap-2 mb-2">
                          <AlertTriangle className="w-4 h-4 text-red-600" />
                          <span className="text-sm font-medium text-red-800">Congested Zones (&gt;85%)</span>
                        </div>
                        <div className="flex flex-wrap gap-1">
                          {analysis.congestionZones.map(zone => (
                            <Badge key={zone} className="bg-red-600 text-white text-xs">{zone}</Badge>
                          ))}
                        </div>
                      </CardContent>
                    </Card>
                  )}
                  {analysis.underutilizedZones.length > 0 && (
                    <Card className="border-green-200 bg-green-50">
                      <CardContent className="p-3">
                        <div className="flex items-center gap-2 mb-2">
                          <CheckCircle2 className="w-4 h-4 text-green-600" />
                          <span className="text-sm font-medium text-green-800">Available Zones (&lt;30%)</span>
                        </div>
                        <div className="flex flex-wrap gap-1">
                          {analysis.underutilizedZones.map(zone => (
                            <Badge key={zone} className="bg-green-600 text-white text-xs">{zone}</Badge>
                          ))}
                        </div>
                      </CardContent>
                    </Card>
                  )}
                </div>
              )}

              {analysis.lots.length > 0 && (
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm">Zone Utilization</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-2">
                    {analysis.lots.slice(0, 8).map(lot => (
                      <div key={lot.lotNumber} className="flex items-center gap-3">
                        <span className="text-xs font-medium w-16 truncate">{lot.lotNumber}</span>
                        <Progress value={lot.utilizationPercent} className="flex-1 h-2" />
                        <span className={`text-xs font-medium px-2 py-0.5 rounded ${getUtilizationColor(lot.utilizationPercent)}`}>
                          {lot.utilizationPercent}%
                        </span>
                      </div>
                    ))}
                  </CardContent>
                </Card>
              )}
            </>
          ) : (
            <Card className="p-6 text-center">
              <p className="text-sm text-slate-500">No lot data available. Configure your lot zones to enable AI analysis.</p>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="suggestions" className="space-y-3 mt-4">
          {loadingSuggestions ? (
            <Card className="p-6">
              <div className="flex items-center justify-center gap-2">
                <Loader2 className="w-5 h-5 animate-spin text-purple-600" />
                <span className="text-sm text-slate-500">Loading suggestions...</span>
              </div>
            </Card>
          ) : pendingSuggestions.length === 0 ? (
            <Card className="p-6 text-center border-purple-200 bg-purple-50">
              <Brain className="w-10 h-10 text-purple-400 mx-auto mb-3" />
              <p className="text-sm font-medium text-purple-800">No pending suggestions</p>
              <p className="text-xs text-purple-600 mt-1">Click "Generate Suggestions" to analyze current lot capacity</p>
            </Card>
          ) : (
            pendingSuggestions.map(suggestion => (
              <Card 
                key={suggestion.id} 
                className="border-l-4 hover:shadow-md transition-shadow cursor-pointer"
                style={{ borderLeftColor: suggestion.priority === 'critical' ? '#ef4444' : suggestion.priority === 'high' ? '#f97316' : suggestion.priority === 'medium' ? '#eab308' : '#3b82f6' }}
                onClick={() => setSelectedSuggestion(suggestion)}
                data-testid={`suggestion-card-${suggestion.id}`}
              >
                <CardContent className="p-3">
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <Badge className={getPriorityColor(suggestion.priority)} data-testid={`badge-priority-${suggestion.id}`}>
                          {suggestion.priority.toUpperCase()}
                        </Badge>
                        {suggestion.weatherCondition && (
                          <Badge variant="outline" className="text-xs">
                            <CloudSun className="w-3 h-3 mr-1" />
                            {suggestion.weatherCondition}
                          </Badge>
                        )}
                        <span className="text-xs text-slate-400">
                          {suggestion.confidenceScore}% confidence
                        </span>
                      </div>
                      <h4 className="text-sm font-semibold text-slate-900 mb-1" data-testid={`text-suggestion-title-${suggestion.id}`}>
                        {suggestion.suggestionTitle}
                      </h4>
                      <p className="text-xs text-slate-600 line-clamp-2">{suggestion.suggestionDescription}</p>
                      <div className="flex items-center gap-3 mt-2 text-xs text-slate-500">
                        <span className="flex items-center gap-1">
                          <Clock className="w-3 h-3" />
                          {suggestion.estimatedTimeToImplement}
                        </span>
                        <span className="flex items-center gap-1">
                          <Target className="w-3 h-3" />
                          {suggestion.actionItems?.length || 0} steps
                        </span>
                      </div>
                    </div>
                    <ChevronRight className="w-5 h-5 text-slate-400 flex-shrink-0" />
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </TabsContent>

        <TabsContent value="history" className="space-y-3 mt-4">
          {completedSuggestions.length === 0 ? (
            <Card className="p-6 text-center">
              <Clock className="w-10 h-10 text-slate-300 mx-auto mb-3" />
              <p className="text-sm text-slate-500">No completed suggestions yet</p>
            </Card>
          ) : (
            completedSuggestions.map(suggestion => (
              <Card 
                key={suggestion.id} 
                className="opacity-75 hover:opacity-100 transition-opacity"
                onClick={() => setSelectedSuggestion(suggestion)}
                data-testid={`history-card-${suggestion.id}`}
              >
                <CardContent className="p-3">
                  <div className="flex items-center justify-between">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        {getStatusBadge(suggestion.status)}
                        <span className="text-xs text-slate-400">
                          {new Date(suggestion.generatedAt).toLocaleDateString()}
                        </span>
                      </div>
                      <h4 className="text-sm font-medium text-slate-700">{suggestion.suggestionTitle}</h4>
                    </div>
                    <ChevronRight className="w-5 h-5 text-slate-300" />
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </TabsContent>
      </Tabs>

      <Dialog open={!!selectedSuggestion} onOpenChange={() => setSelectedSuggestion(null)}>
        <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
          {selectedSuggestion && (
            <>
              <DialogHeader>
                <div className="flex items-center gap-2 mb-2">
                  <Badge className={getPriorityColor(selectedSuggestion.priority)}>
                    {selectedSuggestion.priority.toUpperCase()}
                  </Badge>
                  {getStatusBadge(selectedSuggestion.status)}
                  <span className="text-xs text-slate-400 ml-auto">
                    {selectedSuggestion.confidenceScore}% confidence
                  </span>
                </div>
                <DialogTitle className="text-lg">{selectedSuggestion.suggestionTitle}</DialogTitle>
                <DialogDescription className="text-sm">
                  {selectedSuggestion.suggestionDescription}
                </DialogDescription>
              </DialogHeader>

              <div className="space-y-4 py-4">
                <div>
                  <h5 className="text-sm font-medium text-slate-700 mb-2 flex items-center gap-2">
                    <Target className="w-4 h-4 text-purple-600" />
                    Expected Impact
                  </h5>
                  <p className="text-sm text-slate-600 bg-purple-50 p-3 rounded-lg">
                    {selectedSuggestion.expectedImpact}
                  </p>
                </div>

                {selectedSuggestion.actionItems && selectedSuggestion.actionItems.length > 0 && (
                  <div>
                    <h5 className="text-sm font-medium text-slate-700 mb-2 flex items-center gap-2">
                      <CheckCircle2 className="w-4 h-4 text-green-600" />
                      Action Items
                    </h5>
                    <ul className="space-y-2">
                      {selectedSuggestion.actionItems.map((item, index) => (
                        <li key={index} className="flex items-start gap-2 text-sm text-slate-600">
                          <span className="bg-green-100 text-green-700 rounded-full w-5 h-5 flex items-center justify-center flex-shrink-0 text-xs font-medium">
                            {index + 1}
                          </span>
                          {item}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                <div className="grid grid-cols-2 gap-3 text-sm">
                  <div className="bg-slate-50 p-3 rounded-lg">
                    <span className="text-slate-500 text-xs uppercase">Time to Implement</span>
                    <p className="font-medium text-slate-900">{selectedSuggestion.estimatedTimeToImplement}</p>
                  </div>
                  <div className="bg-slate-50 p-3 rounded-lg">
                    <span className="text-slate-500 text-xs uppercase">Current Utilization</span>
                    <p className="font-medium text-slate-900">{selectedSuggestion.currentUtilization}%</p>
                  </div>
                </div>

                {selectedSuggestion.weatherCondition && (
                  <div className="flex items-center gap-2 text-sm text-slate-600 bg-blue-50 p-3 rounded-lg">
                    <CloudSun className="w-4 h-4 text-blue-600" />
                    Weather: {selectedSuggestion.weatherCondition} ({selectedSuggestion.weatherTemp})
                  </div>
                )}

                {selectedSuggestion.rejectionReason && (
                  <div className="bg-red-50 p-3 rounded-lg">
                    <span className="text-red-600 text-xs uppercase font-medium">Rejection Reason</span>
                    <p className="text-sm text-red-800 mt-1">{selectedSuggestion.rejectionReason}</p>
                  </div>
                )}
              </div>

              {selectedSuggestion.status === "pending" && (
                <DialogFooter className="flex gap-2">
                  <Button
                    variant="outline"
                    onClick={() => setShowRejectDialog(true)}
                    className="flex-1"
                    data-testid="button-reject-suggestion"
                  >
                    <ThumbsDown className="w-4 h-4 mr-2" />
                    Reject
                  </Button>
                  <Button
                    onClick={() => updateStatusMutation.mutate({ id: selectedSuggestion.id, status: "implemented" })}
                    disabled={updateStatusMutation.isPending}
                    className="flex-1 bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700"
                    data-testid="button-implement-suggestion"
                  >
                    {updateStatusMutation.isPending ? (
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    ) : (
                      <ThumbsUp className="w-4 h-4 mr-2" />
                    )}
                    Mark Implemented
                  </Button>
                </DialogFooter>
              )}
            </>
          )}
        </DialogContent>
      </Dialog>

      <Dialog open={showRejectDialog} onOpenChange={setShowRejectDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Reject Suggestion</DialogTitle>
            <DialogDescription>
              Please provide a reason for rejecting this suggestion. This helps improve future AI recommendations.
            </DialogDescription>
          </DialogHeader>
          <Textarea
            placeholder="Enter rejection reason..."
            value={rejectionReason}
            onChange={(e) => setRejectionReason(e.target.value)}
            className="min-h-[100px]"
            data-testid="input-rejection-reason"
          />
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowRejectDialog(false)}>Cancel</Button>
            <Button
              onClick={() => {
                if (selectedSuggestion) {
                  updateStatusMutation.mutate({ 
                    id: selectedSuggestion.id, 
                    status: "rejected", 
                    rejectionReason 
                  });
                }
              }}
              disabled={!rejectionReason.trim() || updateStatusMutation.isPending}
              className="bg-red-600 hover:bg-red-700"
              data-testid="button-confirm-reject"
            >
              {updateStatusMutation.isPending ? (
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              ) : null}
              Confirm Rejection
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
