import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import { 
  ClipboardList, Send, CheckCircle2, Clock, ChevronDown, MapPin, 
  ListPlus, Layers, Edit3, User, AlertCircle, RefreshCw, X
} from "lucide-react";
import { apiRequest } from "@/lib/queryClient";

interface Driver {
  id: number;
  phoneLast4: string;
  name: string;
  status: string;
  vanNumber?: string;
}

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
  responseType: string | null;
  responseContent: string | null;
  responseSentAt: string | null;
  createdAt: string;
}

interface SupervisorAssignmentPanelProps {
  userName: string;
  userRole: "supervisor" | "operations_manager";
}

const INVENTORY_LANE_GROUPS = [
  { id: "501-505", label: "Lanes 501-505", lanes: ["501", "502", "503", "504", "505"] },
  { id: "513-515", label: "Lanes 513-515", lanes: ["513", "514", "515"] },
  { id: "516-518", label: "Lanes 516-518", lanes: ["516", "517", "518"] },
  { id: "591-599", label: "Lanes 591-599", lanes: ["591", "592", "593", "594", "595", "596", "597", "598", "599"] },
];

export function SupervisorAssignmentPanel({ userName, userRole }: SupervisorAssignmentPanelProps) {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  
  const [showNewAssignment, setShowNewAssignment] = useState(false);
  const [showResponseDialog, setShowResponseDialog] = useState(false);
  const [selectedAssignment, setSelectedAssignment] = useState<Assignment | null>(null);
  
  const [selectedDriver, setSelectedDriver] = useState<string>("");
  const [assignmentType, setAssignmentType] = useState<string>("list");
  const [assignmentTitle, setAssignmentTitle] = useState("");
  const [assignmentContent, setAssignmentContent] = useState("");
  const [selectedLaneGroup, setSelectedLaneGroup] = useState<string>("");
  const [selectedLanes, setSelectedLanes] = useState<string[]>([]);
  
  const [responseType, setResponseType] = useState<string>("another_list");
  const [responseContent, setResponseContent] = useState("");
  const [responseLaneGroup, setResponseLaneGroup] = useState<string>("");
  const [responseLanes, setResponseLanes] = useState<string[]>([]);

  const { data: drivers = [] } = useQuery<Driver[]>({
    queryKey: ["/api/drivers"],
    refetchInterval: 10000,
  });

  const { data: activeAssignments = [] } = useQuery<Assignment[]>({
    queryKey: ["/api/driver-assignments"],
    refetchInterval: 5000,
  });

  const completedAssignments = activeAssignments.filter(a => a.status === 'completed' && !a.responseType);
  const pendingAssignments = activeAssignments.filter(a => a.status === 'pending' || a.status === 'in_progress');

  const createAssignmentMutation = useMutation({
    mutationFn: async (data: any) => {
      const res = await apiRequest("POST", "/api/driver-assignments", data);
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/driver-assignments"] });
      queryClient.invalidateQueries({ queryKey: ["/api/messages"] });
      toast({
        title: "Assignment Sent!",
        description: "The driver has been notified.",
      });
      resetForm();
      setShowNewAssignment(false);
    },
    onError: (error) => {
      toast({
        title: "Failed to send assignment",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const respondToAssignmentMutation = useMutation({
    mutationFn: async ({ id, data }: { id: number; data: any }) => {
      const res = await apiRequest("POST", `/api/driver-assignments/${id}/respond`, data);
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/driver-assignments"] });
      queryClient.invalidateQueries({ queryKey: ["/api/messages"] });
      toast({
        title: "Response Sent!",
        description: "New assignment sent to driver.",
      });
      setShowResponseDialog(false);
      setSelectedAssignment(null);
      resetResponseForm();
    },
    onError: (error) => {
      toast({
        title: "Failed to send response",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const resetForm = () => {
    setSelectedDriver("");
    setAssignmentType("list");
    setAssignmentTitle("");
    setAssignmentContent("");
    setSelectedLaneGroup("");
    setSelectedLanes([]);
  };

  const resetResponseForm = () => {
    setResponseType("another_list");
    setResponseContent("");
    setResponseLaneGroup("");
    setResponseLanes([]);
  };

  const handleLaneGroupChange = (groupId: string, isResponse = false) => {
    const group = INVENTORY_LANE_GROUPS.find(g => g.id === groupId);
    if (isResponse) {
      setResponseLaneGroup(groupId);
      setResponseLanes(group?.lanes || []);
      setResponseContent(`Crunch lanes ${groupId}. Make sure all vehicles are properly aligned and spaces are maximized.`);
    } else {
      setSelectedLaneGroup(groupId);
      setSelectedLanes(group?.lanes || []);
      setAssignmentContent(`Crunch lanes ${groupId}. Make sure all vehicles are properly aligned and spaces are maximized.`);
    }
  };

  const toggleLane = (lane: string, isResponse = false) => {
    if (isResponse) {
      setResponseLanes(prev => 
        prev.includes(lane) ? prev.filter(l => l !== lane) : [...prev, lane]
      );
    } else {
      setSelectedLanes(prev => 
        prev.includes(lane) ? prev.filter(l => l !== lane) : [...prev, lane]
      );
    }
  };

  const handleSendAssignment = () => {
    const driver = drivers.find(d => d.phoneLast4 === selectedDriver);
    if (!driver) {
      toast({ title: "Please select a driver", variant: "destructive" });
      return;
    }
    if (!assignmentContent.trim()) {
      toast({ title: "Please enter assignment content", variant: "destructive" });
      return;
    }

    createAssignmentMutation.mutate({
      assignedBy: userName,
      assignedByRole: userRole,
      assignedTo: driver.phoneLast4,
      assignedToName: driver.name,
      assignmentType,
      title: assignmentTitle || (assignmentType === 'crunch_lanes' ? `Crunch ${selectedLaneGroup}` : 'Assignment'),
      content: assignmentContent,
      laneGroup: assignmentType === 'crunch_lanes' ? selectedLaneGroup : null,
      lanes: assignmentType === 'crunch_lanes' ? selectedLanes : null,
    });
  };

  const handleSendResponse = () => {
    if (!selectedAssignment) return;
    if (!responseContent.trim()) {
      toast({ title: "Please enter response content", variant: "destructive" });
      return;
    }

    respondToAssignmentMutation.mutate({
      id: selectedAssignment.id,
      data: {
        responseType,
        responseContent,
        assignedTo: selectedAssignment.assignedTo,
        assignedToName: selectedAssignment.assignedToName,
        assignedBy: userName,
        assignedByRole: userRole,
        laneGroup: responseType === 'crunch_lanes' ? responseLaneGroup : null,
        lanes: responseType === 'crunch_lanes' ? responseLanes : null,
      },
    });
  };

  const openResponseDialog = (assignment: Assignment) => {
    setSelectedAssignment(assignment);
    resetResponseForm();
    setShowResponseDialog(true);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'bg-green-100 text-green-800 border-green-300';
      case 'in_progress': return 'bg-blue-100 text-blue-800 border-blue-300';
      case 'pending': return 'bg-amber-100 text-amber-800 border-amber-300';
      default: return 'bg-slate-100 text-slate-800 border-slate-300';
    }
  };

  const roleLabel = userRole === 'operations_manager' ? 'Operations Manager' : 'Supervisor';

  return (
    <Card className="border-blue-200 shadow-lg">
      <CardHeader className="pb-2 bg-gradient-to-r from-blue-50 to-indigo-50">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <ClipboardList className="h-5 w-5 text-blue-600" />
            <CardTitle className="text-lg font-bold text-blue-900">Driver Assignments</CardTitle>
          </div>
          <Button
            onClick={() => setShowNewAssignment(true)}
            className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white shadow-lg"
            data-testid="button-new-assignment"
          >
            <ListPlus className="h-4 w-4 mr-2" />
            New Assignment
          </Button>
        </div>
      </CardHeader>
      
      <CardContent className="p-4 space-y-4">
        {completedAssignments.length > 0 && (
          <div className="bg-green-50 border border-green-200 rounded-lg p-3">
            <div className="flex items-center gap-2 mb-2">
              <CheckCircle2 className="h-4 w-4 text-green-600" />
              <span className="font-bold text-green-900 text-sm">Awaiting Your Response ({completedAssignments.length})</span>
            </div>
            <ScrollArea className="max-h-48">
              <div className="space-y-2">
                {completedAssignments.map(assignment => (
                  <div 
                    key={assignment.id}
                    className="bg-white border border-green-300 rounded-lg p-3 flex items-center justify-between"
                  >
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <User className="h-4 w-4 text-slate-500" />
                        <span className="font-medium text-slate-900">{assignment.assignedToName || assignment.assignedTo}</span>
                        <Badge variant="outline" className="text-xs bg-green-100 text-green-700 border-green-300">
                          Done
                        </Badge>
                      </div>
                      <p className="text-xs text-slate-600 mt-1">{assignment.title || assignment.assignmentType}</p>
                      {assignment.completedNote && (
                        <p className="text-xs text-green-700 mt-1 italic">"{assignment.completedNote}"</p>
                      )}
                    </div>
                    <Button
                      onClick={() => openResponseDialog(assignment)}
                      className="bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white"
                      size="sm"
                      data-testid={`button-respond-${assignment.id}`}
                    >
                      <Send className="h-3 w-3 mr-1" />
                      Respond
                    </Button>
                  </div>
                ))}
              </div>
            </ScrollArea>
          </div>
        )}

        {pendingAssignments.length > 0 && (
          <div>
            <div className="flex items-center gap-2 mb-2">
              <Clock className="h-4 w-4 text-amber-600" />
              <span className="font-medium text-slate-700 text-sm">Active Assignments ({pendingAssignments.length})</span>
            </div>
            <ScrollArea className="max-h-48">
              <div className="space-y-2">
                {pendingAssignments.map(assignment => (
                  <div 
                    key={assignment.id}
                    className="bg-white border border-slate-200 rounded-lg p-3"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <User className="h-4 w-4 text-slate-500" />
                        <span className="font-medium text-slate-900">{assignment.assignedToName || assignment.assignedTo}</span>
                        <Badge variant="outline" className={`text-xs ${getStatusColor(assignment.status)}`}>
                          {assignment.status === 'in_progress' ? 'Working' : 'Pending'}
                        </Badge>
                      </div>
                      {assignment.laneGroup && (
                        <Badge variant="outline" className="text-xs bg-blue-50 text-blue-700 border-blue-200">
                          <MapPin className="h-3 w-3 mr-1" />
                          {assignment.laneGroup}
                        </Badge>
                      )}
                    </div>
                    <p className="text-xs text-slate-600 mt-1 line-clamp-2">{assignment.content}</p>
                    <p className="text-[10px] text-slate-400 mt-1">
                      Sent {new Date(assignment.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </p>
                  </div>
                ))}
              </div>
            </ScrollArea>
          </div>
        )}

        {activeAssignments.length === 0 && (
          <div className="text-center py-8 text-slate-400">
            <ClipboardList className="h-12 w-12 mx-auto mb-3 opacity-50" />
            <p className="text-sm">No active assignments</p>
            <p className="text-xs mt-1">Create a new assignment to get started</p>
          </div>
        )}
      </CardContent>

      <Dialog open={showNewAssignment} onOpenChange={setShowNewAssignment}>
        <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <ListPlus className="h-5 w-5 text-blue-600" />
              New Driver Assignment
            </DialogTitle>
          </DialogHeader>
          
          <div className="space-y-4">
            <div>
              <Label className="text-sm font-medium">Select Driver</Label>
              <Select value={selectedDriver} onValueChange={setSelectedDriver}>
                <SelectTrigger data-testid="select-driver">
                  <SelectValue placeholder="Choose a driver..." />
                </SelectTrigger>
                <SelectContent>
                  {drivers.filter(d => d.status !== 'idle').map(driver => (
                    <SelectItem key={driver.phoneLast4} value={driver.phoneLast4}>
                      <div className="flex items-center gap-2">
                        <span>{driver.name}</span>
                        <Badge variant="outline" className="text-xs">{driver.phoneLast4}</Badge>
                        {driver.vanNumber && (
                          <Badge variant="outline" className="text-xs bg-blue-50">{driver.vanNumber}</Badge>
                        )}
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label className="text-sm font-medium">Assignment Type</Label>
              <Select value={assignmentType} onValueChange={setAssignmentType}>
                <SelectTrigger data-testid="select-assignment-type">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="list">
                    <div className="flex items-center gap-2">
                      <ClipboardList className="h-4 w-4 text-blue-600" />
                      <span>Send List</span>
                    </div>
                  </SelectItem>
                  <SelectItem value="crunch_lanes">
                    <div className="flex items-center gap-2">
                      <Layers className="h-4 w-4 text-green-600" />
                      <span>Crunch Lanes</span>
                    </div>
                  </SelectItem>
                  <SelectItem value="custom">
                    <div className="flex items-center gap-2">
                      <Edit3 className="h-4 w-4 text-purple-600" />
                      <span>Custom Instructions</span>
                    </div>
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>

            {assignmentType === 'crunch_lanes' && (
              <div className="bg-green-50 border border-green-200 rounded-lg p-3 space-y-3">
                <Label className="text-sm font-medium text-green-800">Select Inventory Lanes</Label>
                <div className="grid grid-cols-2 gap-2">
                  {INVENTORY_LANE_GROUPS.map(group => (
                    <Button
                      key={group.id}
                      variant={selectedLaneGroup === group.id ? "default" : "outline"}
                      className={`text-xs h-auto py-2 ${selectedLaneGroup === group.id ? 'bg-green-600 hover:bg-green-700' : 'border-green-300 text-green-700 hover:bg-green-100'}`}
                      onClick={() => handleLaneGroupChange(group.id)}
                      data-testid={`button-lane-group-${group.id}`}
                    >
                      <MapPin className="h-3 w-3 mr-1" />
                      {group.label}
                    </Button>
                  ))}
                </div>
                
                {selectedLaneGroup && (
                  <div className="pt-2 border-t border-green-200">
                    <Label className="text-xs text-green-700 mb-2 block">Individual Lanes (click to toggle)</Label>
                    <div className="flex flex-wrap gap-1">
                      {INVENTORY_LANE_GROUPS.find(g => g.id === selectedLaneGroup)?.lanes.map(lane => (
                        <Button
                          key={lane}
                          variant={selectedLanes.includes(lane) ? "default" : "outline"}
                          size="sm"
                          className={`h-7 text-xs ${selectedLanes.includes(lane) ? 'bg-green-600 hover:bg-green-700' : 'border-green-300 text-green-700'}`}
                          onClick={() => toggleLane(lane)}
                          data-testid={`button-lane-${lane}`}
                        >
                          {lane}
                        </Button>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}

            <div>
              <Label className="text-sm font-medium">Title (Optional)</Label>
              <Input
                placeholder="e.g., Morning List #1, Urgent Crunch..."
                value={assignmentTitle}
                onChange={(e) => setAssignmentTitle(e.target.value)}
                data-testid="input-assignment-title"
              />
            </div>

            <div>
              <Label className="text-sm font-medium">
                {assignmentType === 'list' ? 'Paste List / Instructions' : 'Instructions'}
              </Label>
              <Textarea
                placeholder={assignmentType === 'list' 
                  ? "Paste your list here...\n\nVIN 1234 → Lane 501\nVIN 5678 → Lane 502"
                  : "Enter your instructions..."
                }
                value={assignmentContent}
                onChange={(e) => setAssignmentContent(e.target.value)}
                className="min-h-[120px] font-mono text-sm"
                data-testid="textarea-assignment-content"
              />
            </div>
          </div>

          <DialogFooter className="gap-2">
            <Button variant="outline" onClick={() => setShowNewAssignment(false)}>
              Cancel
            </Button>
            <Button
              onClick={handleSendAssignment}
              disabled={createAssignmentMutation.isPending || !selectedDriver || !assignmentContent.trim()}
              className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700"
              data-testid="button-send-assignment"
            >
              {createAssignmentMutation.isPending ? (
                <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
              ) : (
                <Send className="h-4 w-4 mr-2" />
              )}
              Send Assignment
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={showResponseDialog} onOpenChange={setShowResponseDialog}>
        <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <CheckCircle2 className="h-5 w-5 text-green-600" />
              Respond to {selectedAssignment?.assignedToName || selectedAssignment?.assignedTo}
            </DialogTitle>
          </DialogHeader>
          
          {selectedAssignment && (
            <div className="space-y-4">
              <div className="bg-slate-50 border border-slate-200 rounded-lg p-3">
                <p className="text-xs text-slate-500 mb-1">Completed Assignment:</p>
                <p className="text-sm font-medium text-slate-800">{selectedAssignment.title}</p>
                {selectedAssignment.completedNote && (
                  <p className="text-xs text-green-700 mt-2 italic bg-green-50 p-2 rounded">
                    Driver Note: "{selectedAssignment.completedNote}"
                  </p>
                )}
              </div>

              <div>
                <Label className="text-sm font-medium">What's Next?</Label>
                <Select value={responseType} onValueChange={setResponseType}>
                  <SelectTrigger data-testid="select-response-type">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="another_list">
                      <div className="flex items-center gap-2">
                        <ClipboardList className="h-4 w-4 text-blue-600" />
                        <span>Send Another List</span>
                      </div>
                    </SelectItem>
                    <SelectItem value="crunch_lanes">
                      <div className="flex items-center gap-2">
                        <Layers className="h-4 w-4 text-green-600" />
                        <span>Crunch Lanes</span>
                      </div>
                    </SelectItem>
                    <SelectItem value="custom">
                      <div className="flex items-center gap-2">
                        <Edit3 className="h-4 w-4 text-purple-600" />
                        <span>Custom Instructions</span>
                      </div>
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {responseType === 'crunch_lanes' && (
                <div className="bg-green-50 border border-green-200 rounded-lg p-3 space-y-3">
                  <Label className="text-sm font-medium text-green-800">Select Inventory Lanes</Label>
                  <div className="grid grid-cols-2 gap-2">
                    {INVENTORY_LANE_GROUPS.map(group => (
                      <Button
                        key={group.id}
                        variant={responseLaneGroup === group.id ? "default" : "outline"}
                        className={`text-xs h-auto py-2 ${responseLaneGroup === group.id ? 'bg-green-600 hover:bg-green-700' : 'border-green-300 text-green-700 hover:bg-green-100'}`}
                        onClick={() => handleLaneGroupChange(group.id, true)}
                        data-testid={`button-response-lane-group-${group.id}`}
                      >
                        <MapPin className="h-3 w-3 mr-1" />
                        {group.label}
                      </Button>
                    ))}
                  </div>
                  
                  {responseLaneGroup && (
                    <div className="pt-2 border-t border-green-200">
                      <Label className="text-xs text-green-700 mb-2 block">Individual Lanes (click to toggle)</Label>
                      <div className="flex flex-wrap gap-1">
                        {INVENTORY_LANE_GROUPS.find(g => g.id === responseLaneGroup)?.lanes.map(lane => (
                          <Button
                            key={lane}
                            variant={responseLanes.includes(lane) ? "default" : "outline"}
                            size="sm"
                            className={`h-7 text-xs ${responseLanes.includes(lane) ? 'bg-green-600 hover:bg-green-700' : 'border-green-300 text-green-700'}`}
                            onClick={() => toggleLane(lane, true)}
                            data-testid={`button-response-lane-${lane}`}
                          >
                            {lane}
                          </Button>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}

              <div>
                <Label className="text-sm font-medium">
                  {responseType === 'another_list' ? 'Paste New List' : 'Instructions'}
                </Label>
                <Textarea
                  placeholder={responseType === 'another_list' 
                    ? "Paste your next list here..."
                    : "Enter your instructions..."
                  }
                  value={responseContent}
                  onChange={(e) => setResponseContent(e.target.value)}
                  className="min-h-[120px] font-mono text-sm"
                  data-testid="textarea-response-content"
                />
              </div>
            </div>
          )}

          <DialogFooter className="gap-2">
            <Button variant="outline" onClick={() => setShowResponseDialog(false)}>
              Cancel
            </Button>
            <Button
              onClick={handleSendResponse}
              disabled={respondToAssignmentMutation.isPending || !responseContent.trim()}
              className="bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700"
              data-testid="button-send-response"
            >
              {respondToAssignmentMutation.isPending ? (
                <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
              ) : (
                <Send className="h-4 w-4 mr-2" />
              )}
              Send Next Task
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </Card>
  );
}
