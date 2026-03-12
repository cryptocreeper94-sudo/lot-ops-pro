import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import { ListChecks, CheckCircle2, Circle, Clock, MapPin, ArrowRight, Navigation, AlertCircle, XCircle } from "lucide-react";

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
  inoperable: boolean | null;
}

interface DriverAssignmentsProps {
  driverName: string;
}

export function DriverAssignments({ driverName }: DriverAssignmentsProps) {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [expandedOrders, setExpandedOrders] = useState<number[]>([]);
  const [showMapDialog, setShowMapDialog] = useState(false);
  const [selectedItem, setSelectedItem] = useState<WorkOrderItem | null>(null);
  const [showInoperableDialog, setShowInoperableDialog] = useState(false);
  const [selectedInoperableItem, setSelectedInoperableItem] = useState<WorkOrderItem | null>(null);

  // Fetch work orders assigned to this driver
  const { data: workOrders = [] } = useQuery<WorkOrder[]>({
    queryKey: ["/api/work-orders", { assignedTo: driverName }],
    refetchInterval: 10000,
  });

  // Fetch items for each work order
  const getWorkOrderItems = (workOrderId: number) => {
    return useQuery<WorkOrderItem[]>({
      queryKey: [`/api/work-orders/${workOrderId}/items`],
      enabled: expandedOrders.includes(workOrderId),
    });
  };

  // Complete item mutation
  const completeItemMutation = useMutation({
    mutationFn: async ({ itemId, driverName, workOrderId }: { itemId: number; driverName: string; workOrderId: number }) => {
      const res = await fetch(`/api/work-order-items/${itemId}/complete`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ completedBy: driverName }),
      });
      if (!res.ok) throw new Error("Failed to complete item");
      return { ...await res.json(), workOrderId };
    },
    onSuccess: async (data) => {
      queryClient.invalidateQueries({ queryKey: ["/api/work-orders"] });
      queryClient.invalidateQueries({ queryKey: [`/api/work-orders/${data.workOrderId}/items`] });
      
      // Check if work order is now complete
      const itemsRes = await fetch(`/api/work-orders/${data.workOrderId}/items`);
      const items: WorkOrderItem[] = await itemsRes.json();
      const completed = items.every(i => i.status === 'completed' || i.inoperable);
      
      if (completed) {
        // Auto-notify Teresa
        await fetch("/api/messages", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            fromId: driverName,
            toId: "Teresa",
            content: `✅ Assignment complete! ${driverName} has finished all items.`,
          }),
        });
        
        toast({ 
          title: "🎉 Assignment Complete!", 
          description: "Teresa has been notified",
          duration: 4000,
        });
      } else {
        toast({ 
          title: "Task Complete", 
          description: "Item marked as complete",
          duration: 2000,
        });
      }
    },
  });

  // Report inoperable mutation
  const reportInoperableMutation = useMutation({
    mutationFn: async ({ itemId, workOrderVin }: { itemId: number; workOrderVin: string }) => {
      const res = await fetch(`/api/work-order-items/${itemId}/inoperable`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ inoperable: true }),
      });
      if (!res.ok) throw new Error("Failed to report inoperable");
      return { ...await res.json(), workOrderVin };
    },
    onSuccess: async (data) => {
      queryClient.invalidateQueries({ queryKey: ["/api/work-orders"] });
      workOrders.forEach(wo => {
        queryClient.invalidateQueries({ queryKey: [`/api/work-orders/${wo.id}/items`] });
      });
      
      // Notify Teresa
      await fetch("/api/messages", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          fromId: driverName,
          toId: "Teresa",
          content: `🚫 Work Order ${data.workOrderVin} is inoperable and cannot be moved.`,
        }),
      });
      
      setShowInoperableDialog(false);
      toast({ 
        title: "Reported Inoperable", 
        description: "Teresa has been notified",
        duration: 3000,
      });
    },
  });

  // Manual complete assignment
  const completeAssignmentMutation = useMutation({
    mutationFn: async ({ workOrderId, workOrderTitle }: { workOrderId: number; workOrderTitle: string }) => {
      const res = await fetch(`/api/work-orders/${workOrderId}/complete`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: 'completed' }),
      });
      if (!res.ok) throw new Error("Failed to complete assignment");
      return { ...await res.json(), workOrderTitle };
    },
    onSuccess: async (data) => {
      queryClient.invalidateQueries({ queryKey: ["/api/work-orders"] });
      
      // Notify Teresa
      await fetch("/api/messages", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          fromId: driverName,
          toId: "Teresa",
          content: `✅ ${driverName} manually marked "${data.workOrderTitle}" as complete.`,
        }),
      });
      
      toast({ 
        title: "Assignment Marked Complete", 
        description: "Teresa has been notified",
        duration: 3000,
      });
    },
  });

  const toggleOrderExpand = (orderId: number) => {
    setExpandedOrders(prev => 
      prev.includes(orderId) ? prev.filter(id => id !== orderId) : [...prev, orderId]
    );
  };

  const handleCheckItem = (itemId: number, currentStatus: string, workOrderId: number, e: React.MouseEvent) => {
    e.stopPropagation();
    if (currentStatus === 'pending') {
      completeItemMutation.mutate({ itemId, driverName, workOrderId });
    }
  };

  const handleItemClick = (item: WorkOrderItem) => {
    if (item.status === 'completed') return; // Don't navigate to completed items
    setSelectedItem(item);
    setShowMapDialog(true);
  };

  const handleReportInoperable = (item: WorkOrderItem, e: React.MouseEvent) => {
    e.stopPropagation();
    setSelectedInoperableItem(item);
    setShowInoperableDialog(true);
  };

  const confirmInoperable = () => {
    if (selectedInoperableItem) {
      reportInoperableMutation.mutate({
        itemId: selectedInoperableItem.id,
        workOrderVin: selectedInoperableItem.vin,
      });
    }
  };

  const getJobTypeLabel = (jobType: string | null) => {
    if (!jobType) return null;
    const labels: Record<string, string> = {
      'clean_side': 'Clean Side',
      'sold_lots': 'Sold Lots',
      'sailing_lists': 'Sailing Lists',
      'shops_ready': 'Shops Ready to Go',
    };
    return labels[jobType] || jobType;
  };

  if (workOrders.length === 0) {
    return null;
  }

  return (
    <Card className="border-l-4 border-l-purple-500 bg-purple-50/30">
      <CardHeader className="pb-3">
        <CardTitle className="text-sm flex items-center gap-2">
          <ListChecks className="h-4 w-4 text-purple-600" />
          My Assignments
          <Badge variant="outline" className="ml-auto bg-purple-100 text-purple-700 border-purple-300">
            {workOrders.length} active
          </Badge>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-2">
        {workOrders.map((wo) => {
          const isExpanded = expandedOrders.includes(wo.id);
          const { data: items = [] } = getWorkOrderItems(wo.id);
          const progress = wo.totalCars > 0 ? Math.round((wo.completedCars / wo.totalCars) * 100) : 0;

          return (
            <Card 
              key={wo.id} 
              className="bg-white cursor-pointer hover:shadow-md transition-shadow"
              onClick={() => toggleOrderExpand(wo.id)}
              data-testid={`driver-assignment-${wo.id}`}
            >
              <CardContent className="p-3">
                <div className="flex items-start justify-between gap-2">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <h4 className="font-semibold text-sm">{wo.title}</h4>
                      {wo.priority !== 'normal' && (
                        <Badge variant="destructive" className="text-[10px] h-4">
                          {wo.priority.toUpperCase()}
                        </Badge>
                      )}
                      {wo.jobType && (
                        <Badge variant="outline" className="text-[10px] h-4 bg-blue-50 text-blue-700 border-blue-300">
                          {getJobTypeLabel(wo.jobType)}
                        </Badge>
                      )}
                    </div>
                    <div className="flex items-center gap-3 text-xs text-gray-600">
                      <span className="flex items-center gap-1">
                        <Clock className="h-3 w-3" />
                        {new Date(wo.createdAt).toLocaleDateString()}
                      </span>
                      <span className="font-mono font-semibold">
                        {wo.completedCars}/{wo.totalCars} cars
                      </span>
                      {wo.assignedCrew && (
                        <span className="flex items-center gap-1">
                          👥 {wo.assignedCrew}
                        </span>
                      )}
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-xl font-bold text-purple-600">{progress}%</div>
                    <div className="text-[9px] text-gray-500 uppercase">Done</div>
                  </div>
                </div>

                {isExpanded && items.length > 0 && (
                  <div className="mt-3 pt-3 border-t space-y-3" onClick={(e) => e.stopPropagation()}>
                    <ScrollArea className="max-h-64">
                      {items.map((item) => (
                        <div
                          key={item.id}
                          className={`flex items-center justify-between p-2 rounded hover:bg-blue-50 transition-colors cursor-pointer ${
                            item.status === 'completed' ? 'opacity-60' : ''
                          }`}
                          onClick={() => handleItemClick(item)}
                          data-testid={`assignment-item-${item.id}`}
                        >
                          <div className="flex items-center gap-2 flex-1 min-w-0">
                            <button
                              onClick={(e) => handleCheckItem(item.id, item.status, wo.id, e)}
                              className="flex-shrink-0 hover:scale-110 transition-transform"
                            >
                              {item.status === 'completed' ? (
                                <CheckCircle2 className="h-4 w-4 text-green-600" />
                              ) : item.inoperable ? (
                                <AlertCircle className="h-4 w-4 text-red-600" />
                              ) : (
                                <Circle className="h-4 w-4 text-gray-400 hover:text-green-600" />
                              )}
                            </button>
                            <div className="flex-1 min-w-0">
                              <div className={`font-mono text-sm font-bold truncate ${item.inoperable ? 'line-through text-red-600' : ''}`}>
                                {item.vin}
                                {item.inoperable && <span className="ml-1 text-[9px] text-red-600">(Inoperable)</span>}
                              </div>
                              {(item.fromLocation || item.toLocation) && (
                                <div className="flex items-center gap-1 text-[10px] text-gray-600">
                                  {item.fromLocation && (
                                    <>
                                      <MapPin className="h-2.5 w-2.5 text-blue-600" />
                                      <span className="font-semibold text-blue-600">{item.fromLocation}</span>
                                    </>
                                  )}
                                  {item.fromLocation && item.toLocation && (
                                    <ArrowRight className="h-2.5 w-2.5" />
                                  )}
                                  {item.toLocation && (
                                    <span className="font-semibold">{item.toLocation}</span>
                                  )}
                                </div>
                              )}
                            </div>
                          </div>
                          <div className="flex items-center gap-2">
                            {item.status === 'completed' ? (
                              <div className="text-[9px] text-green-600 font-semibold">
                                ✓ Done
                              </div>
                            ) : item.inoperable ? (
                              <div className="text-[8px] text-red-600 font-semibold">
                                Can't Move
                              </div>
                            ) : (
                              <>
                                {item.fromLocation && <Navigation className="h-3.5 w-3.5 text-blue-600" />}
                                <Button
                                  size="sm"
                                  variant="ghost"
                                  className="h-6 text-[9px] text-red-600 hover:text-red-700 hover:bg-red-50"
                                  onClick={(e) => handleReportInoperable(item, e)}
                                >
                                  <XCircle className="h-3 w-3 mr-1" />
                                  Can't Move
                                </Button>
                              </>
                            )}
                          </div>
                        </div>
                      ))}
                    </ScrollArea>
                    
                    {/* Manual Complete and Clean Side Done buttons */}
                    <div className="flex gap-2 pt-2">
                      <Button
                        size="sm"
                        variant="outline"
                        className="flex-1 bg-green-50 text-green-700 hover:bg-green-100 border-green-300"
                        onClick={(e) => {
                          e.stopPropagation();
                          completeAssignmentMutation.mutate({
                            workOrderId: wo.id,
                            workOrderTitle: wo.title,
                          });
                        }}
                      >
                        <CheckCircle2 className="h-3.5 w-3.5 mr-1.5" />
                        Mark Assignment Complete
                      </Button>
                      
                      {wo.jobType === 'clean_side' && (
                        <Button
                          size="sm"
                          variant="outline"
                          className="flex-1 bg-blue-50 text-blue-700 hover:bg-blue-100 border-blue-300"
                          onClick={async (e) => {
                            e.stopPropagation();
                            await fetch("/api/messages", {
                              method: "POST",
                              headers: { "Content-Type": "application/json" },
                              body: JSON.stringify({
                                fromId: driverName,
                                toId: "Teresa",
                                content: `✅ ${driverName}: Clean Side is DONE!`,
                              }),
                            });
                            toast({
                              title: "Clean Side Done",
                              description: "Teresa has been notified",
                              duration: 3000,
                            });
                          }}
                        >
                          ✓ Clean Side Done
                        </Button>
                      )}
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          );
        })}
      </CardContent>

      {/* Report Inoperable Dialog */}
      <Dialog open={showInoperableDialog} onOpenChange={setShowInoperableDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-red-600">
              <AlertCircle className="h-5 w-5" />
              Report Inoperable Vehicle
            </DialogTitle>
            <DialogDescription>
              This will notify Teresa that this vehicle cannot be moved.
            </DialogDescription>
          </DialogHeader>
          {selectedInoperableItem && (
            <div className="space-y-3">
              <div className="bg-red-50 border border-red-200 rounded-lg p-3">
                <p className="text-sm font-semibold text-red-900">Work Order: {selectedInoperableItem.vin}</p>
                <p className="text-xs text-red-700 mt-1">This vehicle will be marked as inoperable and skipped in your assignment list.</p>
              </div>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowInoperableDialog(false)}>
              Cancel
            </Button>
            <Button 
              className="bg-red-600 hover:bg-red-700 text-white"
              onClick={confirmInoperable}
              disabled={reportInoperableMutation.isPending}
            >
              {reportInoperableMutation.isPending ? "Reporting..." : "Report Inoperable"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* GPS Navigation Dialog */}
      <Dialog open={showMapDialog} onOpenChange={setShowMapDialog}>
        <DialogContent className="max-w-3xl h-[80vh]">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Navigation className="h-5 w-5 text-blue-600" />
              Navigate to Vehicle
            </DialogTitle>
          </DialogHeader>
          {selectedItem && (
            <div className="space-y-3 flex-1 flex flex-col">
              <Card className="bg-blue-50 border-blue-200">
                <CardContent className="p-3">
                  <div className="space-y-1">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-semibold text-gray-600">Work Order</span>
                      <span className="font-mono text-lg font-bold text-blue-700">{selectedItem.vin}</span>
                    </div>
                    {selectedItem.fromLocation && (
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-semibold text-gray-600">Current Location</span>
                        <span className="font-semibold text-blue-700 flex items-center gap-1">
                          <MapPin className="h-3.5 w-3.5" />
                          {selectedItem.fromLocation}
                        </span>
                      </div>
                    )}
                    {selectedItem.toLocation && (
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-semibold text-gray-600">Destination</span>
                        <span className="font-semibold text-green-700">{selectedItem.toLocation}</span>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>

              {/* Facility Map - Placeholder for now */}
              <div className="flex-1 bg-slate-100 rounded-lg border-2 border-dashed border-slate-300 flex items-center justify-center">
                <div className="text-center space-y-3 p-6">
                  <MapPin className="h-16 w-16 mx-auto text-blue-600" />
                  <div>
                    <h3 className="font-bold text-lg">Vehicle Location</h3>
                    <p className="text-sm text-gray-600 mt-1">
                      {selectedItem.fromLocation ? (
                        <>Navigate to <span className="font-bold text-blue-700">{selectedItem.fromLocation}</span> to pick up this vehicle</>
                      ) : (
                        'Location not specified'
                      )}
                    </p>
                  </div>
                  <Button
                    variant="outline"
                    onClick={() => setShowMapDialog(false)}
                    className="mt-4"
                  >
                    Close
                  </Button>
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </Card>
  );
}
