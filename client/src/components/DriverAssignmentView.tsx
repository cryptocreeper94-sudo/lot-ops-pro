import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import { 
  ClipboardList, CheckCircle2, Clock, MapPin, Send, 
  AlertCircle, RefreshCw, PlayCircle, ChevronDown, ChevronUp
} from "lucide-react";
import { apiRequest } from "@/lib/queryClient";

interface Assignment {
  id: number;
  assignedBy: string;
  assignedByRole: string;
  assignedTo: string;
  assignedToName: string | null;
  assignmentType: string;
  title: string | null;
  content: string;
  laneGroup: string | null;
  lanes: string[] | null;
  status: string;
  completedAt: string | null;
  completedNote: string | null;
  createdAt: string;
}

interface DriverAssignmentViewProps {
  driverId: string;
  driverName: string;
}

export function DriverAssignmentView({ driverId, driverName }: DriverAssignmentViewProps) {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  
  const [showCompleteDialog, setShowCompleteDialog] = useState(false);
  const [selectedAssignment, setSelectedAssignment] = useState<Assignment | null>(null);
  const [completedNote, setCompletedNote] = useState("");
  const [expandedAssignments, setExpandedAssignments] = useState<number[]>([]);

  const { data: assignments = [], isLoading } = useQuery<Assignment[]>({
    queryKey: ["/api/driver-assignments", { driverId, status: 'pending' }],
    queryFn: async () => {
      const res = await fetch(`/api/driver-assignments?driverId=${driverId}&status=pending`);
      if (!res.ok) throw new Error('Failed to fetch assignments');
      return res.json();
    },
    refetchInterval: 5000,
  });

  const updateStatusMutation = useMutation({
    mutationFn: async ({ id, status, note }: { id: number; status: string; note?: string }) => {
      const res = await apiRequest("PATCH", `/api/driver-assignments/${id}/status`, {
        status,
        completedNote: note,
        driverName,
        assignedBy: selectedAssignment?.assignedBy,
      });
      return res.json();
    },
    onSuccess: (data, variables) => {
      queryClient.invalidateQueries({ queryKey: ["/api/driver-assignments"] });
      queryClient.invalidateQueries({ queryKey: ["/api/messages"] });
      
      if (variables.status === 'completed') {
        toast({
          title: "Assignment Complete!",
          description: "Your supervisor has been notified.",
        });
        setShowCompleteDialog(false);
        setSelectedAssignment(null);
        setCompletedNote("");
      } else if (variables.status === 'in_progress') {
        toast({
          title: "Assignment Started",
          description: "Keep up the good work!",
        });
      }
    },
    onError: (error) => {
      toast({
        title: "Failed to update assignment",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const toggleExpand = (id: number) => {
    setExpandedAssignments(prev => 
      prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]
    );
  };

  const openCompleteDialog = (assignment: Assignment) => {
    setSelectedAssignment(assignment);
    setCompletedNote("");
    setShowCompleteDialog(true);
  };

  const handleStartAssignment = (assignment: Assignment) => {
    updateStatusMutation.mutate({ id: assignment.id, status: 'in_progress' });
  };

  const handleCompleteAssignment = () => {
    if (!selectedAssignment) return;
    updateStatusMutation.mutate({
      id: selectedAssignment.id,
      status: 'completed',
      note: completedNote || 'Ready for next task.',
    });
  };

  const getAssignmentIcon = (type: string) => {
    switch (type) {
      case 'crunch_lanes': return <MapPin className="h-4 w-4 text-green-600" />;
      case 'list': return <ClipboardList className="h-4 w-4 text-blue-600" />;
      default: return <AlertCircle className="h-4 w-4 text-purple-600" />;
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'in_progress':
        return <Badge className="bg-blue-100 text-blue-700 border-blue-300">Working</Badge>;
      case 'pending':
        return <Badge className="bg-amber-100 text-amber-700 border-amber-300">New</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  if (assignments.length === 0 && !isLoading) {
    return null;
  }

  return (
    <Card className="border-amber-200 shadow-lg">
      <CardHeader className="pb-2 bg-gradient-to-r from-amber-50 to-orange-50">
        <div className="flex items-center gap-2">
          <ClipboardList className="h-5 w-5 text-amber-600" />
          <CardTitle className="text-lg font-bold text-amber-900">
            Your Assignments ({assignments.length})
          </CardTitle>
        </div>
      </CardHeader>
      
      <CardContent className="p-3">
        {isLoading ? (
          <div className="flex items-center justify-center py-8">
            <RefreshCw className="h-6 w-6 animate-spin text-amber-600" />
          </div>
        ) : (
          <ScrollArea className="max-h-96">
            <div className="space-y-3">
              {assignments.map(assignment => {
                const isExpanded = expandedAssignments.includes(assignment.id);
                const isInProgress = assignment.status === 'in_progress';
                
                return (
                  <div 
                    key={assignment.id}
                    className={`border rounded-lg overflow-hidden transition-all ${
                      isInProgress 
                        ? 'border-blue-300 bg-blue-50' 
                        : 'border-amber-200 bg-white'
                    }`}
                  >
                    <div 
                      className="p-3 cursor-pointer"
                      onClick={() => toggleExpand(assignment.id)}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          {getAssignmentIcon(assignment.assignmentType)}
                          <span className="font-medium text-slate-900">
                            {assignment.title || assignment.assignmentType.replace('_', ' ')}
                          </span>
                          {getStatusBadge(assignment.status)}
                        </div>
                        <div className="flex items-center gap-2">
                          {assignment.laneGroup && (
                            <Badge variant="outline" className="text-xs bg-green-50 text-green-700 border-green-200">
                              {assignment.laneGroup}
                            </Badge>
                          )}
                          {isExpanded ? (
                            <ChevronUp className="h-4 w-4 text-slate-400" />
                          ) : (
                            <ChevronDown className="h-4 w-4 text-slate-400" />
                          )}
                        </div>
                      </div>
                      <p className="text-xs text-slate-500 mt-1">
                        From: {assignment.assignedBy} • {new Date(assignment.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </p>
                    </div>
                    
                    {isExpanded && (
                      <div className="border-t border-slate-200 p-3 bg-slate-50">
                        <div className="bg-white border border-slate-200 rounded-lg p-3 mb-3">
                          <p className="text-sm text-slate-800 whitespace-pre-wrap font-mono">
                            {assignment.content}
                          </p>
                        </div>
                        
                        {assignment.lanes && assignment.lanes.length > 0 && (
                          <div className="mb-3">
                            <p className="text-xs text-slate-600 mb-1">Lanes:</p>
                            <div className="flex flex-wrap gap-1">
                              {assignment.lanes.map(lane => (
                                <Badge 
                                  key={lane} 
                                  variant="outline" 
                                  className="text-xs bg-green-50 text-green-700 border-green-200"
                                >
                                  {lane}
                                </Badge>
                              ))}
                            </div>
                          </div>
                        )}
                        
                        <div className="flex gap-2">
                          {!isInProgress && (
                            <Button
                              variant="outline"
                              className="flex-1 border-blue-300 text-blue-700 hover:bg-blue-50"
                              onClick={(e) => {
                                e.stopPropagation();
                                handleStartAssignment(assignment);
                              }}
                              disabled={updateStatusMutation.isPending}
                              data-testid={`button-start-assignment-${assignment.id}`}
                            >
                              <PlayCircle className="h-4 w-4 mr-2" />
                              Start Working
                            </Button>
                          )}
                          <Button
                            className={`flex-1 ${isInProgress 
                              ? 'bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700' 
                              : 'bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600'
                            }`}
                            onClick={(e) => {
                              e.stopPropagation();
                              openCompleteDialog(assignment);
                            }}
                            disabled={updateStatusMutation.isPending}
                            data-testid={`button-complete-assignment-${assignment.id}`}
                          >
                            <CheckCircle2 className="h-4 w-4 mr-2" />
                            Mark Complete
                          </Button>
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </ScrollArea>
        )}
      </CardContent>

      <Dialog open={showCompleteDialog} onOpenChange={setShowCompleteDialog}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <CheckCircle2 className="h-5 w-5 text-green-600" />
              Complete Assignment
            </DialogTitle>
          </DialogHeader>
          
          {selectedAssignment && (
            <div className="space-y-4">
              <div className="bg-slate-50 border border-slate-200 rounded-lg p-3">
                <p className="text-sm font-medium text-slate-800">{selectedAssignment.title}</p>
                <p className="text-xs text-slate-500 mt-1">From: {selectedAssignment.assignedBy}</p>
              </div>

              <div>
                <p className="text-sm font-medium mb-2">Add a note (optional)</p>
                <Textarea
                  placeholder="e.g., All done! Lane 503 had a couple tight spots..."
                  value={completedNote}
                  onChange={(e) => setCompletedNote(e.target.value)}
                  className="min-h-[80px]"
                  data-testid="textarea-completed-note"
                />
              </div>
            </div>
          )}

          <DialogFooter className="gap-2">
            <Button variant="outline" onClick={() => setShowCompleteDialog(false)}>
              Cancel
            </Button>
            <Button
              onClick={handleCompleteAssignment}
              disabled={updateStatusMutation.isPending}
              className="bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700"
              data-testid="button-confirm-complete"
            >
              {updateStatusMutation.isPending ? (
                <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
              ) : (
                <Send className="h-4 w-4 mr-2" />
              )}
              Complete & Notify
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </Card>
  );
}
