import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Wrench, Users, Shield, Plus, Edit2, Trash2, Calendar } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

export default function ServiceDriverManagement() {
  const { toast } = useToast();
  const [assignments, setAssignments] = useState<any[]>([]);
  const [showDialog, setShowDialog] = useState(false);
  const [selectedRole, setSelectedRole] = useState("service_driver");
  const [driverPin, setDriverPin] = useState("");
  const [durationWeeks, setDurationWeeks] = useState("1");
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    loadAssignments();
  }, []);

  const loadAssignments = async () => {
    try {
      const res = await fetch("/api/service-driver/assignments");
      if (res.ok) {
        setAssignments(await res.json());
      }
    } catch (error) {
      console.error("Failed to load assignments:", error);
    }
  };

  const handleAssign = async () => {
    if (!driverPin) {
      toast({ title: "Required", description: "Enter driver PIN", variant: "destructive" });
      return;
    }

    setIsLoading(true);
    try {
      const today = new Date().toISOString().split("T")[0];
      const endDate = new Date();
      endDate.setDate(endDate.getDate() + parseInt(durationWeeks) * 7);

      const res = await fetch("/api/service-driver/assignments", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          assignedBy: "Supervisor",
          serviceDriverName: `Driver ${driverPin}`,
          serviceDriverStartDate: today,
          serviceDriverEndDate: endDate.toISOString().split("T")[0],
          serviceDriverDurationWeeks: parseInt(durationWeeks),
          serviceTruckStartDate: today,
          serviceTruckEndDate: endDate.toISOString().split("T")[0],
          serviceTruckDurationWeeks: parseInt(durationWeeks),
          isActive: true
        })
      });

      if (res.ok) {
        toast({ title: "✓ Assignment Created", description: `Service driver assigned for ${durationWeeks} week(s)` });
        setShowDialog(false);
        setDriverPin("");
        setDurationWeeks("1");
        loadAssignments();
      }
    } catch (error) {
      toast({ title: "Error", description: "Failed to create assignment", variant: "destructive" });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div className="flex items-center gap-2">
          <Wrench className="h-6 w-6 text-amber-400" />
          <h2 className="text-2xl font-bold text-white">Service Driver Management</h2>
        </div>
        <button
          onClick={() => setShowDialog(true)}
          className="group relative w-full md:w-auto px-6 py-3 bg-gradient-to-r from-amber-600 via-amber-500 to-amber-400 text-white font-bold rounded-lg overflow-hidden shadow-lg hover:shadow-2xl transition-all duration-300 hover:scale-105 active:scale-95"
          data-testid="button-assign-service-driver"
        >
          <div className="absolute inset-0 bg-gradient-to-r from-amber-400 to-amber-600 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
          <div className="absolute inset-0 rounded-lg blur-lg bg-amber-500 opacity-0 group-hover:opacity-75 -z-10 group-hover:animate-pulse" />
          <div className="relative flex items-center justify-center gap-2">
            <Plus className="h-5 w-5" />
            Assign Service Driver
          </div>
        </button>
      </div>

      {/* Assignments Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {assignments.length === 0 ? (
          <Card className="col-span-full border-slate-700 bg-slate-800/50">
            <CardContent className="p-8 text-center">
              <Wrench className="h-12 w-12 text-slate-400 mx-auto mb-3" />
              <p className="text-slate-400">No active assignments</p>
            </CardContent>
          </Card>
        ) : (
          assignments.map((assignment, idx) => (
            <Card key={idx} className="border-amber-600/30 bg-gradient-to-br from-slate-800 to-slate-900 hover:from-amber-950 hover:to-slate-900 transition-all duration-300 hover:shadow-lg hover:shadow-amber-500/20">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="text-amber-400 flex items-center gap-2">
                    <Wrench className="h-5 w-5" />
                    Service Driver
                  </CardTitle>
                  <Badge className="bg-green-600">Active</Badge>
                </div>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="grid grid-cols-2 gap-3">
                  <div className="bg-slate-900/50 p-2 rounded">
                    <p className="text-xs text-slate-400">Duration</p>
                    <p className="text-white font-bold">{assignment.serviceDriverDurationWeeks}w</p>
                  </div>
                  <div className="bg-slate-900/50 p-2 rounded">
                    <p className="text-xs text-slate-400">Status</p>
                    <p className="text-green-400 font-bold">Active</p>
                  </div>
                </div>
                <div className="flex gap-2">
                  <button className="flex-1 px-3 py-2 bg-slate-700 hover:bg-slate-600 text-slate-200 rounded transition-colors duration-200" data-testid="button-edit-assignment">
                    <Edit2 className="h-4 w-4 inline mr-1" /> Edit
                  </button>
                  <button className="flex-1 px-3 py-2 bg-red-900/30 hover:bg-red-900/50 text-red-300 rounded transition-colors duration-200" data-testid="button-remove-assignment">
                    <Trash2 className="h-4 w-4 inline mr-1" /> Remove
                  </button>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>

      {/* Assignment Dialog */}
      <Dialog open={showDialog} onOpenChange={setShowDialog}>
        <DialogContent className="bg-gradient-to-br from-slate-900 to-slate-800 border-amber-600/50">
          <DialogHeader>
            <DialogTitle className="text-amber-400 flex items-center gap-2">
              <Wrench className="h-5 w-5" />
              Assign Service Driver & Truck
            </DialogTitle>
          </DialogHeader>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Service Driver Section */}
            <div className="space-y-3 p-4 bg-slate-800/50 rounded-lg border border-amber-600/20">
              <h3 className="text-amber-300 font-bold flex items-center gap-2">
                <Users className="h-4 w-4" /> Service Driver
              </h3>
              <div className="space-y-2">
                <Label className="text-slate-300">Driver PIN</Label>
                <Input
                  placeholder="Enter 4-digit PIN"
                  value={driverPin}
                  onChange={(e) => setDriverPin(e.target.value)}
                  className="bg-slate-900 border-slate-700 text-white"
                  data-testid="input-driver-pin"
                />
              </div>
            </div>

            {/* Service Truck Section */}
            <div className="space-y-3 p-4 bg-slate-800/50 rounded-lg border border-amber-600/20">
              <h3 className="text-amber-300 font-bold flex items-center gap-2">
                <Wrench className="h-4 w-4" /> Service Truck
              </h3>
              <div className="space-y-2">
                <Label className="text-slate-300">Duration (Weeks)</Label>
                <Select value={durationWeeks} onValueChange={setDurationWeeks}>
                  <SelectTrigger className="bg-slate-900 border-slate-700 text-white" data-testid="select-duration">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-slate-800 border-slate-700">
                    <SelectItem value="1">1 Week</SelectItem>
                    <SelectItem value="2">2 Weeks</SelectItem>
                    <SelectItem value="4">1 Month</SelectItem>
                    <SelectItem value="12">Ongoing</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>

          <DialogFooter>
            <button
              onClick={() => setShowDialog(false)}
              className="px-4 py-2 text-slate-300 hover:text-white transition-colors"
              data-testid="button-cancel-assign"
            >
              Cancel
            </button>
            <button
              onClick={handleAssign}
              disabled={isLoading}
              className="px-6 py-2 bg-gradient-to-r from-green-600 to-green-500 hover:from-green-700 hover:to-green-600 text-white font-bold rounded transition-all duration-300 hover:shadow-lg hover:shadow-green-500/50 disabled:opacity-50"
              data-testid="button-confirm-assign"
            >
              {isLoading ? "Assigning..." : "Assign"}
            </button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
