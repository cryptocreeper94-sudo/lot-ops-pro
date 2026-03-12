import { useState, useRef, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import { ClipboardPaste, Plus, CheckCircle2, Clock, ListChecks, Send, Camera, Scan } from "lucide-react";
import { formatLaneForDriver } from "@/utils/laneFormatter";
import Tesseract from 'tesseract.js';

interface WorkOrder {
  id: number;
  title: string;
  description: string | null;
  type: string;
  jobType: string | null;
  assignedCrew: string | null;
  status: string;
  assignedTo: string | null;
  totalCars: number;
  completedCars: number;
  priority: string;
  dueDate: string | null;
  createdBy: string;
  createdAt: string;
  completedAt: string | null;
}

interface WorkOrderItem {
  id: number;
  workOrderId: number;
  vin: string;
  description: string | null;
  fromLocation: string | null;
  toLocation: string | null;
  status: string;
  completedBy: string | null;
  completedAt: string | null;
}

export function AssignmentManager() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [assignmentTitle, setAssignmentTitle] = useState("");
  const [vinList, setVinList] = useState("");
  const [assignedDriver, setAssignedDriver] = useState("");
  const [assignedCrew, setAssignedCrew] = useState("");
  const [jobType, setJobType] = useState("");
  const [defaultToLocation, setDefaultToLocation] = useState("");
  const [priority, setPriority] = useState("normal");
  const [instructions, setInstructions] = useState("");
  
  // Email scanner state
  const [showEmailScanner, setShowEmailScanner] = useState(false);
  const [isScanning, setIsScanning] = useState(false);
  const [scannedText, setScannedText] = useState("");
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const streamRef = useRef<MediaStream | null>(null);

  // Fetch active work orders
  const { data: workOrders = [] } = useQuery<WorkOrder[]>({
    queryKey: ["/api/work-orders"],
    refetchInterval: 10000,
  });

  // Create work order mutation
  const createWorkOrderMutation = useMutation({
    mutationFn: async (data: any) => {
      // First, create the work order
      const woRes = await fetch("/api/work-orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: data.title,
          description: data.instructions,
          type: "assignment_list",
          jobType: data.jobType,
          assignedCrew: data.assignedCrew,
          status: "pending",
          assignedTo: data.assignedTo,
          priority: data.priority,
          createdBy: "Teresa (Supervisor)",
          totalCars: data.vins.length,
        }),
      });
      
      if (!woRes.ok) throw new Error("Failed to create work order");
      const workOrder = await woRes.json();

      // Then, add each VIN as a work order item
      for (const vin of data.vins) {
        await fetch(`/api/work-orders/${workOrder.id}/items`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            vin: vin.trim(),
            toLocation: data.toLocation || null,
            status: "pending",
          }),
        });
      }

      return workOrder;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/work-orders"] });
      toast({ 
        title: "Assignment Created", 
        description: "Work order sent to driver successfully",
        duration: 3000,
      });
      setShowCreateDialog(false);
      setAssignmentTitle("");
      setVinList("");
      setAssignedDriver("");
      setAssignedCrew("");
      setJobType("");
      setDefaultToLocation("");
      setPriority("normal");
      setInstructions("");
    },
    onError: () => {
      toast({ 
        title: "Error", 
        description: "Failed to create assignment list",
        variant: "destructive",
      });
    },
  });

  const handleCreateAssignment = () => {
    if (!assignmentTitle.trim()) {
      toast({ title: "Title Required", description: "Please enter an assignment title", variant: "destructive" });
      return;
    }

    if (!vinList.trim()) {
      toast({ title: "VIN List Required", description: "Please paste a list of VINs", variant: "destructive" });
      return;
    }

    // Parse work order list - support comma, newline, space separated
    // Split into lines first to preserve context
    const lines = vinList.split(/\n/);
    const vins: string[] = [];
    
    lines.forEach(line => {
      // Extract 7-digit work orders from this line
      const workOrders = line.match(/\b\d{7}\b/g);
      if (workOrders) {
        vins.push(...workOrders);
      } else {
        // Fallback: treat whole line as potential work order if it's not empty
        const trimmed = line.trim();
        if (trimmed.length > 0) {
          vins.push(trimmed);
        }
      }
    });

    if (vins.length === 0) {
      toast({ title: "No Valid VINs", description: "Could not parse any VINs from the list", variant: "destructive" });
      return;
    }

    createWorkOrderMutation.mutate({
      title: assignmentTitle,
      vins,
      assignedTo: assignedDriver || null,
      assignedCrew: assignedCrew || null,
      jobType: jobType || null,
      toLocation: defaultToLocation,
      priority,
      instructions: instructions || null,
    });
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'bg-green-100 text-green-800 border-green-200';
      case 'in_progress': return 'bg-blue-100 text-blue-800 border-blue-200';
      default: return 'bg-orange-100 text-orange-800 border-orange-200';
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'urgent': return 'text-red-600';
      case 'high': return 'text-orange-600';
      default: return 'text-gray-600';
    }
  };

  // Email scanner functions
  const startCamera = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'environment' }
      });
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        streamRef.current = stream;
      }
    } catch (error) {
      toast({
        title: "Camera Access Denied",
        description: "Please allow camera access to scan emails",
        variant: "destructive"
      });
    }
  };

  const stopCamera = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }
  };

  useEffect(() => {
    if (showEmailScanner) {
      startCamera();
    } else {
      stopCamera();
    }
    return () => stopCamera();
  }, [showEmailScanner]);

  const captureAndScan = async () => {
    if (!videoRef.current || !canvasRef.current) return;

    setIsScanning(true);
    const canvas = canvasRef.current;
    const video = videoRef.current;
    
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    const ctx = canvas.getContext('2d');
    if (ctx) {
      ctx.drawImage(video, 0, 0);
    }

    try {
      const result = await Tesseract.recognize(canvas, 'eng', {
        logger: (m) => console.log(m)
      });

      const text = result.data.text;
      setScannedText(text);
      parseEmailText(text);
      setShowEmailScanner(false);
      
      toast({
        title: "Email Scanned",
        description: "Extracted information from email",
      });
    } catch (error) {
      toast({
        title: "Scan Failed",
        description: "Could not read email. Try again with better lighting.",
        variant: "destructive"
      });
    } finally {
      setIsScanning(false);
    }
  };

  const parseEmailText = (text: string) => {
    // Extract different number patterns:
    // - 7 digits = Work Order (1234567)
    // - 3 digits in 601-655 range = Sale Lane with Nashville prefix
    // - 3 digits outside that range = Inventory Lot code (514, 643)
    const workOrderMatches = text.match(/\b\d{7}\b/g) || [];
    const threeDigitMatches = text.match(/\b\d{3}\b/g) || [];
    
    // Extract patterns with spot numbers: "Lane 601, Spot 43" or "601 spot 43"
    const laneWithSpotMatches = text.match(/(?:lane\s*)?\b(\d{3})\b[,\s]*(?:spot\s*)?(\d{1,2})\b/gi) || [];
    
    // Extract named locations (Lane XX, Lot XXX patterns)
    const namedLocationMatches = text.match(/(?:lane|lot)\s*\d+/gi) || [];
    
    // Build work order list
    if (workOrderMatches.length > 0) {
      setVinList(workOrderMatches.join('\n'));
    }
    
    // Build location list
    const allLocations = [...namedLocationMatches];
    const processedNumbers = new Set();
    
    // First, process locations with spot numbers
    laneWithSpotMatches.forEach(match => {
      const spotMatch = match.match(/\b(\d{3})\b[,\s]*(?:spot\s*)?(\d{1,2})\b/i);
      if (spotMatch) {
        const laneNum = spotMatch[1];
        const spotNum = spotMatch[2];
        const numValue = parseInt(laneNum);
        
        if (numValue >= 601 && numValue <= 655) {
          // Nashville sale lane with spot
          const actualLane = numValue - 600;
          allLocations.push(`Lane ${actualLane}, Spot ${spotNum}`);
        } else {
          // Lot code with spot
          allLocations.push(`Lot ${laneNum}, Spot ${spotNum}`);
        }
        processedNumbers.add(laneNum);
      }
    });
    
    // Then process remaining 3-digit numbers without spots
    threeDigitMatches.forEach(num => {
      const numValue = parseInt(num);
      
      if (!processedNumbers.has(num) && !allLocations.some(loc => loc.includes(num))) {
        if (numValue >= 601 && numValue <= 655) {
          // Nashville sale lane format: 601 = Lane 1, 602 = Lane 2, etc.
          const actualLane = numValue - 600;
          allLocations.push(`Lane ${actualLane}`);
        } else {
          // Regular inventory lot code
          allLocations.push(`Lot ${num}`);
        }
      }
    });
    
    // If we have at least 2 locations, second one is likely the destination
    if (allLocations.length >= 2) {
      setDefaultToLocation(allLocations[1]);
    }

    // Try to extract instructions
    const instructionKeywords = ['move', 'send', 'route', 'take', 'detail', 'clean', 'transfer'];
    const lines = text.split('\n');
    for (const line of lines) {
      const lowerLine = line.toLowerCase();
      if (instructionKeywords.some(keyword => lowerLine.includes(keyword))) {
        setInstructions(line.trim());
        break;
      }
    }
  };

  return (
    <div className="space-y-4">
      <Card className="border-l-4 border-l-purple-500 bg-purple-50/30">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-base flex items-center gap-2">
                <ListChecks className="h-5 w-5 text-purple-600" />
                Assignment Lists
              </CardTitle>
              <CardDescription className="text-xs">
                Create and manage driver assignments with VIN lists from database
              </CardDescription>
            </div>
            <Button 
              onClick={() => setShowCreateDialog(true)}
              className="bg-purple-600 hover:bg-purple-700"
              size="sm"
              data-testid="button-create-assignment"
            >
              <Plus className="h-4 w-4 mr-1.5" />
              New Assignment
            </Button>
          </div>
        </CardHeader>
        <CardContent className="space-y-3">
          {workOrders.length === 0 ? (
            <div className="text-center py-6 bg-white rounded-lg border-2 border-dashed border-purple-200">
              <ClipboardPaste className="h-8 w-8 mx-auto mb-2 text-purple-400" />
              <p className="text-sm font-medium text-purple-900">No active assignments</p>
              <p className="text-xs text-purple-600 mt-1">Create an assignment list to send tasks to drivers</p>
            </div>
          ) : (
            <div className="space-y-2">
              {workOrders.map((wo) => (
                <Card key={wo.id} className="bg-white hover:shadow-md transition-shadow" data-testid={`work-order-${wo.id}`}>
                  <CardContent className="p-3">
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <h4 className="font-semibold text-sm">{wo.title}</h4>
                          <Badge variant="outline" className={`text-xs ${getStatusColor(wo.status)}`}>
                            {wo.status}
                          </Badge>
                          {wo.priority !== 'normal' && (
                            <Badge variant="outline" className={`text-xs ${getPriorityColor(wo.priority)}`}>
                              {wo.priority}
                            </Badge>
                          )}
                        </div>
                        <div className="flex items-center gap-4 text-xs text-gray-600">
                          <span className="flex items-center gap-1">
                            <Send className="h-3 w-3" />
                            {wo.assignedTo || "Unassigned"}
                          </span>
                          <span className="flex items-center gap-1">
                            <ListChecks className="h-3 w-3" />
                            {wo.completedCars}/{wo.totalCars} cars
                          </span>
                          <span className="flex items-center gap-1">
                            <Clock className="h-3 w-3" />
                            {new Date(wo.createdAt).toLocaleDateString()}
                          </span>
                        </div>
                        {wo.description && (
                          <p className="text-xs text-gray-500 mt-1">{wo.description}</p>
                        )}
                      </div>
                      <div className="text-right">
                        <div className="text-2xl font-bold text-purple-600">
                          {wo.totalCars > 0 ? Math.round((wo.completedCars / wo.totalCars) * 100) : 0}%
                        </div>
                        <div className="text-[10px] text-gray-500 uppercase">Complete</div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Create Assignment Dialog */}
      <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Create Assignment List</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label className="text-sm font-semibold">Assignment Title</Label>
              <Input
                placeholder="e.g., Tuesday Lane 227 Lineup"
                value={assignmentTitle}
                onChange={(e) => setAssignmentTitle(e.target.value)}
                className="mt-1"
                data-testid="input-assignment-title"
              />
            </div>

            <div>
              <Label className="text-sm font-semibold">Instructions (What to do with these vehicles)</Label>
              <Textarea
                placeholder="e.g., Send to clean side, Detail these vehicles, Route to sale lanes, etc."
                value={instructions}
                onChange={(e) => setInstructions(e.target.value)}
                className="mt-1 h-20"
                data-testid="textarea-instructions"
              />
            </div>

            <div>
              <Label className="text-sm">Assign to Driver (Optional)</Label>
              <Input
                placeholder="Driver name or number"
                value={assignedDriver}
                onChange={(e) => setAssignedDriver(e.target.value)}
                className="mt-1"
                data-testid="input-assigned-driver"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label className="text-sm font-semibold">Job Type</Label>
                <Select value={jobType} onValueChange={setJobType}>
                  <SelectTrigger className="mt-1">
                    <SelectValue placeholder="Select job..." />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="clean_side">Clean Side</SelectItem>
                    <SelectItem value="sold_lots">Sold Lots</SelectItem>
                    <SelectItem value="sailing_lists">Sailing Lists</SelectItem>
                    <SelectItem value="shops_ready">Shops Ready to Go</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label className="text-sm">Crew Assignment</Label>
                <Input
                  placeholder="e.g., Crew A, Crew 1"
                  value={assignedCrew}
                  onChange={(e) => setAssignedCrew(e.target.value)}
                  className="mt-1"
                  data-testid="input-assigned-crew"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label className="text-sm">Default Destination</Label>
                <Input
                  placeholder="e.g., Lane 227"
                  value={defaultToLocation}
                  onChange={(e) => setDefaultToLocation(e.target.value)}
                  className="mt-1"
                  data-testid="input-default-destination"
                />
              </div>
              <div>
                <Label className="text-sm">Priority</Label>
                <Select value={priority} onValueChange={setPriority}>
                  <SelectTrigger className="mt-1">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="normal">Normal</SelectItem>
                    <SelectItem value="high">High</SelectItem>
                    <SelectItem value="urgent">Urgent</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-2">
                <Label className="text-sm flex items-center gap-2">
                  <ClipboardPaste className="h-4 w-4" />
                  Paste Work Order List (from database)
                </Label>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => setShowEmailScanner(true)}
                  className="gap-1.5 border-blue-300 text-blue-700 hover:bg-blue-50"
                >
                  <Camera className="h-3.5 w-3.5" />
                  Scan Email
                </Button>
              </div>
              <Textarea
                placeholder="Paste work orders here (one per line, comma-separated, or space-separated)&#10;&#10;Example - Work Orders only:&#10;1234567&#10;1234568&#10;1234569&#10;&#10;Example - With locations:&#10;1234567 Lane 43&#10;1234568 Lot 514&#10;1234569 Lane 27&#10;&#10;Or click 'Scan Email' to use your camera"
                value={vinList}
                onChange={(e) => setVinList(e.target.value)}
                className="mt-1 h-40 font-mono text-xs"
                data-testid="textarea-vin-list"
              />
              <p className="text-xs text-gray-500 mt-1">
                {vinList ? `${vinList.split(/[\n,\s]+/).filter(v => v.trim()).length} work orders detected` : "0 work orders"}
              </p>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowCreateDialog(false)}>
              Cancel
            </Button>
            <Button 
              onClick={handleCreateAssignment}
              disabled={createWorkOrderMutation.isPending}
              className="bg-purple-600 hover:bg-purple-700"
              data-testid="button-submit-assignment"
            >
              {createWorkOrderMutation.isPending ? "Creating..." : "Create Assignment"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Email Scanner Dialog */}
      <Dialog open={showEmailScanner} onOpenChange={setShowEmailScanner}>
        <DialogContent className="max-w-3xl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Scan className="h-5 w-5 text-blue-600" />
              Scan Email or Printed Document
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="bg-gray-900 rounded-lg overflow-hidden aspect-video relative">
              <video
                ref={videoRef}
                autoPlay
                playsInline
                className="w-full h-full object-cover"
              />
              <canvas ref={canvasRef} className="hidden" />
              
              {isScanning && (
                <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                  <div className="text-white text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-4 border-white border-t-transparent mx-auto mb-2" />
                    <p>Scanning email...</p>
                  </div>
                </div>
              )}
            </div>

            <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 text-sm">
              <p className="font-semibold text-blue-900 mb-1">Instructions:</p>
              <ul className="text-blue-700 text-xs space-y-1 list-disc list-inside">
                <li>Hold camera steady over printed email or document</li>
                <li>Ensure good lighting and text is clearly visible</li>
                <li>System will extract work orders, locations, and instructions</li>
                <li>Data will auto-fill the assignment form</li>
              </ul>
            </div>

            <div className="flex gap-2">
              <Button
                onClick={captureAndScan}
                disabled={isScanning}
                className="flex-1 bg-blue-600 hover:bg-blue-700"
              >
                <Camera className="h-4 w-4 mr-2" />
                {isScanning ? "Scanning..." : "Capture & Scan"}
              </Button>
              <Button
                variant="outline"
                onClick={() => setShowEmailScanner(false)}
                disabled={isScanning}
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
