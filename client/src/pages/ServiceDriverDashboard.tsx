import { useState, useEffect } from "react";
import { useLocation } from "wouter";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Wrench, AlertCircle, CheckCircle, Clock, MapPin, FileText, Car, Fuel, Battery, Droplets, PaintBucket } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { NavigationControl } from "@/components/NavigationControl";
import { ShiftWeatherCard } from "@/components/ShiftWeatherCard";
import { BentoGrid, BentoTile } from "@/components/ui/bento-grid";
import { PremiumAccordion, PremiumAccordionItem, PremiumAccordionTrigger, PremiumAccordionContent } from "@/components/ui/premium-accordion";
import { SwipeCarousel } from "@/components/ui/premium-carousel";
import { PremiumButton } from "@/components/ui/premium-button";
import { Button } from "@/components/ui/button";

interface WorkOrder {
  id: number;
  vin: string;
  jobType: string;
  vehicleLocation: string;
  status: "pending" | "in_progress" | "completed";
  jobDescription?: string;
  priority: string;
}

export default function ServiceDriverDashboard() {
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const [workOrders, setWorkOrders] = useState<WorkOrder[]>([]);
  
  const userStr = localStorage.getItem("vanops_user");
  const user = userStr ? JSON.parse(userStr) : null;
  const [selectedOrder, setSelectedOrder] = useState<WorkOrder | null>(null);
  const [showCompletionDialog, setShowCompletionDialog] = useState(false);
  const [actionsTaken, setActionsTaken] = useState("");
  const [partsUsed, setPartsUsed] = useState("");
  const [timeSpent, setTimeSpent] = useState("15");
  const [notes, setNotes] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    loadWorkOrders();
  }, []);

  const loadWorkOrders = async () => {
    try {
      const res = await fetch("/api/service-driver/work-orders");
      if (res.ok) {
        const orders = await res.json();
        setWorkOrders(orders.filter((o: any) => o.status !== "completed"));
      }
    } catch (error) {
      console.error("Failed to load work orders:", error);
      toast({ title: "Error", description: "Failed to load work orders", variant: "destructive" });
    }
  };

  const handleCompleteOrder = async () => {
    if (!selectedOrder || !actionsTaken) {
      toast({ title: "Required", description: "Please enter what actions were taken", variant: "destructive" });
      return;
    }

    setIsLoading(true);
    try {
      const res = await fetch("/api/service-driver/completions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          workOrderId: selectedOrder.id,
          serviceDriverId: 1,
          vin: selectedOrder.vin,
          vehicleLocation: selectedOrder.vehicleLocation,
          jobType: selectedOrder.jobType,
          actionsTaken,
          partsUsed: partsUsed || "None",
          timeSpentMinutes: parseInt(timeSpent),
          notesAndObservations: notes
        })
      });

      if (res.ok) {
        await fetch(`/api/service-driver/work-orders/${selectedOrder.id}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ status: "completed" })
        });

        toast({ title: "✓ Work Order Completed", description: "Job marked complete and hallmark stamped" });
        setShowCompletionDialog(false);
        setActionsTaken("");
        setPartsUsed("");
        setTimeSpent("15");
        setNotes("");
        loadWorkOrders();
      }
    } catch (error) {
      toast({ title: "Error", description: "Failed to complete work order", variant: "destructive" });
    } finally {
      setIsLoading(false);
    }
  };

  const handleStartOrder = async (order: WorkOrder) => {
    try {
      await fetch(`/api/service-driver/work-orders/${order.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: "in_progress" })
      });
      loadWorkOrders();
      toast({ title: "Started", description: "Work order marked in progress" });
    } catch (error) {
      toast({ title: "Error", description: "Failed to start work order", variant: "destructive" });
    }
  };

  const getJobIcon = (jobType: string) => {
    switch (jobType) {
      case "tire_pressure": return <Droplets className="h-5 w-5" />;
      case "gas_fill": return <Fuel className="h-5 w-5" />;
      case "battery_jump": return <Battery className="h-5 w-5" />;
      case "detail": return <PaintBucket className="h-5 w-5" />;
      case "damage_repair": return <Wrench className="h-5 w-5" />;
      default: return <Car className="h-5 w-5" />;
    }
  };

  const jobTypeColors: Record<string, string> = {
    "tire_pressure": "bg-blue-500",
    "gas_fill": "bg-green-500",
    "battery_jump": "bg-yellow-500",
    "detail": "bg-purple-500",
    "damage_repair": "bg-red-500"
  };

  const priorityColors: Record<string, string> = {
    "high": "bg-red-600",
    "normal": "bg-blue-600",
    "low": "bg-green-600"
  };

  const pendingOrders = workOrders.filter(o => o.status === "pending");
  const inProgressOrders = workOrders.filter(o => o.status === "in_progress");

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 p-4">
      <div className="max-w-7xl mx-auto">
        <BentoTile
          variant="premium"
          size="wide"
          sparkle
          className="mb-6"
          data-testid="tile-header"
        >
          <div className="flex items-center gap-4">
            <NavigationControl variant="back" fallbackRoute="/dashboard" />
            <Wrench className="h-10 w-10 text-amber-400" />
            <div>
              <h1 className="text-3xl md:text-4xl font-bold text-white">Service Driver Dashboard</h1>
              <p className="text-slate-400 text-sm md:text-base">Manage vehicle service work orders and complete maintenance jobs</p>
            </div>
          </div>
        </BentoTile>

        <BentoGrid columns={3} gap="md" className="mb-6">
          <BentoTile
            variant="glass"
            size="lg"
            className="col-span-1 md:col-span-2"
            data-testid="tile-shift-weather"
          >
            <ShiftWeatherCard 
              userId={user?.id?.toString()}
              userName={user?.name}
              userRole={user?.role}
              compact={true}
              showClockIn={true}
            />
          </BentoTile>

          <BentoTile
            variant="glow"
            size="md"
            icon={<FileText className="h-5 w-5" />}
            title="Work Orders"
            description="Active assignments"
            data-testid="tile-stats"
          >
            <div className="flex items-center justify-between mt-2">
              <div className="text-center">
                <p className="text-2xl font-bold text-amber-400" data-testid="text-pending-count">{pendingOrders.length}</p>
                <p className="text-xs text-slate-400">Pending</p>
              </div>
              <div className="text-center">
                <p className="text-2xl font-bold text-blue-400" data-testid="text-progress-count">{inProgressOrders.length}</p>
                <p className="text-xs text-slate-400">In Progress</p>
              </div>
              <div className="text-center">
                <p className="text-2xl font-bold text-green-400" data-testid="text-total-count">{workOrders.length}</p>
                <p className="text-xs text-slate-400">Total</p>
              </div>
            </div>
          </BentoTile>
        </BentoGrid>

        {inProgressOrders.length > 0 && (
          <div className="mb-6">
            <h2 className="text-lg font-semibold text-amber-400 mb-3 flex items-center gap-2">
              <Clock className="h-5 w-5" />
              In Progress
            </h2>
            <SwipeCarousel itemWidth="320px" gap={16} showPeek>
              {inProgressOrders.map((order) => (
                <BentoTile
                  key={order.id}
                  variant="gradient"
                  size="md"
                  sparkle
                  className="border-amber-500/50 min-h-[200px]"
                  data-testid={`tile-order-progress-${order.id}`}
                >
                  <div className="flex flex-col h-full">
                    <div className="flex items-center gap-2 mb-3">
                      <div className="p-2 rounded-lg bg-amber-500/20 text-amber-400">
                        {getJobIcon(order.jobType)}
                      </div>
                      <div className="flex-1">
                        <Badge className={jobTypeColors[order.jobType] || "bg-slate-600"}>
                          {order.jobType.replace(/_/g, " ").toUpperCase()}
                        </Badge>
                      </div>
                      <Badge className={priorityColors[order.priority] || "bg-slate-600"}>
                        {order.priority.toUpperCase()}
                      </Badge>
                    </div>

                    <div className="space-y-1 text-sm flex-1">
                      <p className="text-slate-300">
                        <span className="text-slate-500">VIN:</span>{" "}
                        <span className="font-mono text-white" data-testid={`text-vin-${order.id}`}>{order.vin}</span>
                      </p>
                      <p className="text-slate-300 flex items-center gap-1">
                        <MapPin className="h-3 w-3 text-slate-500" />
                        <span data-testid={`text-location-${order.id}`}>{order.vehicleLocation}</span>
                      </p>
                      {order.jobDescription && (
                        <p className="text-slate-400 text-xs line-clamp-2">{order.jobDescription}</p>
                      )}
                    </div>

                    <PremiumButton
                      variant="premium"
                      size="sm"
                      icon={<CheckCircle className="h-4 w-4" />}
                      onClick={() => {
                        setSelectedOrder(order);
                        setShowCompletionDialog(true);
                      }}
                      className="mt-3 w-full"
                      data-testid={`button-complete-${order.id}`}
                    >
                      Mark Complete
                    </PremiumButton>
                  </div>
                </BentoTile>
              ))}
            </SwipeCarousel>
          </div>
        )}

        <PremiumAccordion type="single" defaultValue="pending" collapsible>
          <PremiumAccordionItem value="pending" variant="glass">
            <PremiumAccordionTrigger
              icon={<AlertCircle className="h-5 w-5" />}
              badge={pendingOrders.length.toString()}
              description="Work orders awaiting action"
            >
              Pending Work Orders
            </PremiumAccordionTrigger>
            <PremiumAccordionContent>
              {pendingOrders.length === 0 ? (
                <BentoTile variant="glass" className="text-center py-8" interactive={false}>
                  <AlertCircle className="h-12 w-12 text-slate-400 mx-auto mb-3" />
                  <p className="text-slate-400" data-testid="text-no-orders">No pending work orders</p>
                </BentoTile>
              ) : (
                <BentoGrid columns={3} gap="sm">
                  {pendingOrders.map((order) => (
                    <BentoTile
                      key={order.id}
                      variant="default"
                      size="md"
                      className="min-h-[220px]"
                      data-testid={`tile-order-pending-${order.id}`}
                    >
                      <div className="flex flex-col h-full">
                        <div className="flex items-center gap-2 mb-3">
                          <div className="p-2 rounded-lg bg-primary/10 text-primary">
                            {getJobIcon(order.jobType)}
                          </div>
                          <Badge className={priorityColors[order.priority] || "bg-slate-600"}>
                            {order.priority.toUpperCase()}
                          </Badge>
                        </div>

                        <Badge className={`${jobTypeColors[order.jobType] || "bg-slate-600"} w-fit mb-2`}>
                          {order.jobType.replace(/_/g, " ").toUpperCase()}
                        </Badge>

                        <div className="space-y-1 text-sm flex-1">
                          <p className="text-slate-300">
                            <span className="text-slate-500">VIN:</span>{" "}
                            <span className="font-mono text-white" data-testid={`text-vin-${order.id}`}>{order.vin}</span>
                          </p>
                          <p className="text-slate-300 flex items-center gap-1">
                            <MapPin className="h-3 w-3 text-slate-500" />
                            <span data-testid={`text-location-${order.id}`}>{order.vehicleLocation}</span>
                          </p>
                          {order.jobDescription && (
                            <p className="text-slate-400 text-xs line-clamp-2">{order.jobDescription}</p>
                          )}
                        </div>

                        <div className="flex gap-2 mt-3">
                          <PremiumButton
                            variant="gradient"
                            size="sm"
                            icon={<Clock className="h-4 w-4" />}
                            onClick={() => handleStartOrder(order)}
                            className="flex-1"
                            data-testid={`button-start-${order.id}`}
                          >
                            Start
                          </PremiumButton>
                          <PremiumButton
                            variant="primary"
                            size="sm"
                            icon={<CheckCircle className="h-4 w-4" />}
                            onClick={() => {
                              setSelectedOrder(order);
                              setShowCompletionDialog(true);
                            }}
                            className="flex-1"
                            data-testid={`button-complete-${order.id}`}
                          >
                            Complete
                          </PremiumButton>
                        </div>
                      </div>
                    </BentoTile>
                  ))}
                </BentoGrid>
              )}
            </PremiumAccordionContent>
          </PremiumAccordionItem>
        </PremiumAccordion>
      </div>

      <Dialog open={showCompletionDialog} onOpenChange={setShowCompletionDialog}>
        <DialogContent className="bg-slate-900 border-slate-700 max-w-2xl">
          <DialogHeader>
            <DialogTitle className="text-white flex items-center gap-2">
              <CheckCircle className="h-5 w-5 text-green-500" />
              Complete Work Order
            </DialogTitle>
          </DialogHeader>

          {selectedOrder && (
            <div className="space-y-4">
              <BentoTile variant="glass" interactive={false} className="p-3">
                <p className="text-sm text-slate-400">VIN: <span className="text-white font-mono" data-testid="dialog-vin">{selectedOrder.vin}</span></p>
                <p className="text-sm text-slate-400">Location: <span className="text-white" data-testid="dialog-location">{selectedOrder.vehicleLocation}</span></p>
              </BentoTile>

              <div className="space-y-2">
                <label className="text-white text-sm font-bold">Actions Taken *</label>
                <Textarea
                  placeholder="What did you do to the vehicle? (e.g., Filled tire to 32 PSI, Filled fuel tank, etc.)"
                  value={actionsTaken}
                  onChange={(e) => setActionsTaken(e.target.value)}
                  className="bg-slate-800 border-slate-700 text-white"
                  data-testid="textarea-actions"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-white text-sm font-bold">Parts Used</label>
                  <Input
                    placeholder="e.g., Tire sealant, Motor oil"
                    value={partsUsed}
                    onChange={(e) => setPartsUsed(e.target.value)}
                    className="bg-slate-800 border-slate-700 text-white"
                    data-testid="input-parts"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-white text-sm font-bold">Time Spent (minutes)</label>
                  <Input
                    type="number"
                    value={timeSpent}
                    onChange={(e) => setTimeSpent(e.target.value)}
                    className="bg-slate-800 border-slate-700 text-white"
                    data-testid="input-time"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-white text-sm font-bold">Additional Notes</label>
                <Textarea
                  placeholder="Any other observations or issues..."
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  className="bg-slate-800 border-slate-700 text-white"
                  data-testid="textarea-notes"
                />
              </div>
            </div>
          )}

          <DialogFooter>
            <Button variant="outline" onClick={() => setShowCompletionDialog(false)} data-testid="button-cancel">
              Cancel
            </Button>
            <PremiumButton
              variant="premium"
              onClick={handleCompleteOrder}
              loading={isLoading}
              icon={<CheckCircle className="h-4 w-4" />}
              data-testid="button-submit-completion"
            >
              Submit Completion & Hallmark
            </PremiumButton>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
