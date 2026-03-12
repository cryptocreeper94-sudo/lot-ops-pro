import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Key, CheckCircle2, Clock, AlertTriangle, Shield, MapPin } from "lucide-react";
import { toast } from "sonner";

interface ExoticKeyTracking {
  id: number;
  workOrder: string;
  vin: string | null;
  lotNumber: string;
  assignedBy: string;
  assignedAt: string;
  keyDeliveryLocation: string;
  inventoryDriverId: string | null;
  inventoryDriverName: string | null;
  inventoryDriverConfirmedAt: string | null;
  vanDriverId: string | null;
  vanDriverName: string | null;
  vanDriverConfirmedAt: string | null;
  status: string;
  patrolVerifiedBy: string | null;
  patrolVerifiedAt: string | null;
  notes: string | null;
}

export function ExoticKeyDashboard() {
  const { data: trackingRecords = [] } = useQuery<ExoticKeyTracking[]>({
    queryKey: ["/api/exotic-key-tracking"],
  });

  const pending = trackingRecords.filter(r => r.status !== 'key_secured' && r.status !== 'verified_by_patrol');
  const secured = trackingRecords.filter(r => r.status === 'key_secured');
  const verified = trackingRecords.filter(r => r.status === 'verified_by_patrol');

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'pending':
        return <Badge variant="destructive" className="gap-1"><AlertTriangle className="w-3 h-3" />Key Not Removed</Badge>;
      case 'key_with_van_driver':
        return <Badge variant="default" className="bg-yellow-500 gap-1"><Clock className="w-3 h-3" />With Van Driver</Badge>;
      case 'key_secured':
        return <Badge variant="default" className="bg-green-600 gap-1"><CheckCircle2 className="w-3 h-3" />Key Secured</Badge>;
      case 'verified_by_patrol':
        return <Badge variant="default" className="bg-blue-600 gap-1"><Shield className="w-3 h-3" />Patrol Verified</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  const getDeliveryLocation = (location: string) => {
    return location === 'clean_side_desk' ? 'Clean Side Supervisor Desk' : 'Assigning Supervisor';
  };

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="border-l-4 border-l-red-500">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm">Pending Action</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-red-600">{pending.length}</div>
            <p className="text-xs text-muted-foreground mt-1">Keys need attention</p>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-green-500">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm">Secured</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-green-600">{secured.length}</div>
            <p className="text-xs text-muted-foreground mt-1">Keys at desk</p>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-blue-500">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm">Patrol Verified</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-blue-600">{verified.length}</div>
            <p className="text-xs text-muted-foreground mt-1">Double-checked</p>
          </CardContent>
        </Card>
      </div>

      {pending.length > 0 && (
        <Card className="border-l-4 border-l-red-500">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <AlertTriangle className="w-5 h-5 text-red-600" />
              Pending Action Required
            </CardTitle>
            <CardDescription>These exotics need key removal and delivery</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {pending.map((record) => (
                <div key={record.id} className="p-4 border rounded-lg bg-red-50">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <MapPin className="w-4 h-4 text-slate-600" />
                        <span className="font-mono font-bold text-lg">Work Order: {record.workOrder}</span>
                        <Badge variant="outline">Lot {record.lotNumber}</Badge>
                      </div>
                      {record.vin && (
                        <p className="text-sm text-slate-600 mb-1">VIN: {record.vin}</p>
                      )}
                      <p className="text-sm text-slate-600">
                        Deliver key to: <strong>{getDeliveryLocation(record.keyDeliveryLocation)}</strong>
                      </p>
                      <p className="text-xs text-slate-500 mt-2">
                        Assigned by {record.assignedBy} • {new Date(record.assignedAt).toLocaleString()}
                      </p>
                    </div>
                    <div className="text-right">
                      {getStatusBadge(record.status)}
                      {record.inventoryDriverName && (
                        <p className="text-xs text-slate-600 mt-2">
                          Inventory: {record.inventoryDriverName}
                        </p>
                      )}
                      {record.vanDriverName && (
                        <p className="text-xs text-slate-600">
                          Van: {record.vanDriverName}
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {secured.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CheckCircle2 className="w-5 h-5 text-green-600" />
              Keys Secured
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {secured.map((record) => (
                <div key={record.id} className="p-3 border rounded-lg bg-green-50/50 flex items-center justify-between">
                  <div>
                    <span className="font-mono font-semibold">WO: {record.workOrder}</span>
                    <span className="text-xs text-slate-600 ml-3">
                      → {getDeliveryLocation(record.keyDeliveryLocation)}
                    </span>
                  </div>
                  <div className="text-xs text-slate-600 text-right">
                    <p>{record.vanDriverName}</p>
                    <p>{record.vanDriverConfirmedAt && new Date(record.vanDriverConfirmedAt).toLocaleTimeString()}</p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

interface ExoticKeyPopupProps {
  workOrder: string;
  lotNumber: string;
  assignedBy: string;
  keyDeliveryLocation: string;
  onConfirm: () => void;
}

export function ExoticKeyAlertPopup({ 
  workOrder, 
  lotNumber, 
  assignedBy, 
  keyDeliveryLocation, 
  onConfirm 
}: ExoticKeyPopupProps) {
  const deliveryLocationText = keyDeliveryLocation === 'clean_side_desk' 
    ? 'Clean Side Supervisor Desk' 
    : assignedBy;

  return (
    <Dialog open={true}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-red-600">
            <Key className="w-6 h-6" />
            EXOTIC CAR - KEY SECURITY PROTOCOL
          </DialogTitle>
          <DialogDescription className="text-base pt-2">
            This vehicle is high-value and requires key removal.
          </DialogDescription>
        </DialogHeader>
        
        <div className="space-y-4 py-4">
          <div className="p-4 bg-yellow-50 border-2 border-yellow-400 rounded-lg">
            <p className="font-mono text-lg font-bold mb-1">Work Order: {workOrder}</p>
            <p className="text-sm text-slate-700">Location: Lot {lotNumber}</p>
          </div>

          <div className="space-y-2">
            <p className="font-semibold text-slate-900">Required Actions:</p>
            <ol className="list-decimal list-inside space-y-1 text-sm text-slate-700">
              <li>Remove key from vehicle</li>
              <li>Lock all doors</li>
              <li>Give key to van driver</li>
              <li>Van driver delivers key to: <strong>{deliveryLocationText}</strong></li>
            </ol>
          </div>

          <div className="text-xs text-slate-500 bg-slate-50 p-3 rounded">
            Assigned by {assignedBy}
          </div>
        </div>

        <DialogFooter>
          <Button onClick={onConfirm} className="w-full bg-red-600 hover:bg-red-700" data-testid="button-confirm-exotic-alert">
            <Key className="w-4 h-4 mr-2" />
            I Understand - Key Will Be Removed
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

interface InventoryKeyHandoffProps {
  trackingId: number;
  workOrder: string;
  inventoryDriverId: string;
  inventoryDriverName: string;
  onComplete: () => void;
}

export function InventoryKeyHandoffDialog({ 
  trackingId, 
  workOrder, 
  inventoryDriverId, 
  inventoryDriverName,
  onComplete 
}: InventoryKeyHandoffProps) {
  const [vanDriverId, setVanDriverId] = useState("");
  const queryClient = useQueryClient();

  const confirmMutation = useMutation({
    mutationFn: async () => {
      const response = await fetch(`/api/exotic-key-tracking/${trackingId}/inventory-confirm`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          inventoryDriverId,
          inventoryDriverName,
          vanDriverId,
          vanDriverName: `Van Driver ${vanDriverId}`
        })
      });
      if (!response.ok) throw new Error('Failed to confirm key handoff');
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/exotic-key-tracking"] });
      toast.success("Key handoff confirmed");
      onComplete();
    }
  });

  return (
    <Dialog open={true}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Confirm Key Handoff</DialogTitle>
          <DialogDescription>
            Work Order: {workOrder}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label>Which van driver are you giving the key to?</Label>
            <Select value={vanDriverId} onValueChange={setVanDriverId}>
              <SelectTrigger data-testid="select-van-driver">
                <SelectValue placeholder="Select van driver..." />
              </SelectTrigger>
              <SelectContent>
                {['1', '2', '3', '4', '5', '6', '7', '8', '9', '10'].map(num => (
                  <SelectItem key={num} value={num}>Van Driver {num}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="p-3 bg-blue-50 border border-blue-200 rounded text-sm">
            <p className="font-semibold mb-1">Confirmation:</p>
            <ul className="list-disc list-inside space-y-1 text-slate-700">
              <li>Key has been removed from vehicle</li>
              <li>All doors are locked</li>
              <li>Key given to van driver</li>
            </ul>
          </div>
        </div>

        <DialogFooter>
          <Button 
            onClick={() => confirmMutation.mutate()} 
            disabled={!vanDriverId || confirmMutation.isPending}
            data-testid="button-confirm-handoff"
          >
            <CheckCircle2 className="w-4 h-4 mr-2" />
            Confirm Key Handoff
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

interface VanKeyDeliveryProps {
  trackingId: number;
  workOrder: string;
  deliveryLocation: string;
  onComplete: () => void;
}

export function VanKeyDeliveryDialog({ 
  trackingId, 
  workOrder, 
  deliveryLocation,
  onComplete 
}: VanKeyDeliveryProps) {
  const queryClient = useQueryClient();

  const confirmMutation = useMutation({
    mutationFn: async () => {
      const response = await fetch(`/api/exotic-key-tracking/${trackingId}/van-confirm`, {
        method: 'PATCH'
      });
      if (!response.ok) throw new Error('Failed to confirm key delivery');
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/exotic-key-tracking"] });
      toast.success("Key delivery confirmed");
      onComplete();
    }
  });

  const locationText = deliveryLocation === 'clean_side_desk' 
    ? 'Clean Side Supervisor Desk' 
    : 'Assigning Supervisor';

  return (
    <Dialog open={true}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Confirm Key Delivery</DialogTitle>
          <DialogDescription>
            Work Order: {workOrder}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <div className="p-4 bg-green-50 border-2 border-green-400 rounded-lg">
            <p className="text-sm text-slate-600 mb-2">Deliver key to:</p>
            <p className="text-lg font-bold text-green-800">{locationText}</p>
          </div>

          <p className="text-sm text-slate-600">
            Confirm that you have delivered the key to the correct location.
          </p>
        </div>

        <DialogFooter>
          <Button 
            onClick={() => confirmMutation.mutate()} 
            disabled={confirmMutation.isPending}
            className="bg-green-600 hover:bg-green-700"
            data-testid="button-confirm-delivery"
          >
            <CheckCircle2 className="w-4 h-4 mr-2" />
            Key Delivered to {locationText}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

export function SupervisorKeyPreferences() {
  const [keyDeliveryPreference, setKeyDeliveryPreference] = useState<string>(() => {
    return localStorage.getItem('exoticKeyDeliveryPreference') || 'clean_side_desk';
  });

  const handleSave = () => {
    localStorage.setItem('exoticKeyDeliveryPreference', keyDeliveryPreference);
    toast.success("Exotic key delivery preference saved");
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base flex items-center gap-2">
          <Key className="w-5 h-5" />
          Exotic Car Key Delivery Settings
        </CardTitle>
        <CardDescription>
          Choose where drivers should deliver exotic car keys by default
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <RadioGroup value={keyDeliveryPreference} onValueChange={setKeyDeliveryPreference}>
          <div className="flex items-center space-x-2">
            <RadioGroupItem value="clean_side_desk" id="clean-desk" data-testid="radio-clean-desk" />
            <Label htmlFor="clean-desk" className="font-normal cursor-pointer">
              Clean Side Supervisor Desk (Default)
            </Label>
          </div>
          <div className="flex items-center space-x-2">
            <RadioGroupItem value="assigning_supervisor" id="bring-to-me" data-testid="radio-bring-me" />
            <Label htmlFor="bring-to-me" className="font-normal cursor-pointer">
              Bring Key to Me (Assigning Supervisor)
            </Label>
          </div>
        </RadioGroup>

        <Button onClick={handleSave} size="sm" data-testid="button-save-preference">
          Save Preference
        </Button>

        <div className="text-xs text-slate-500 bg-slate-50 p-3 rounded">
          This setting controls the default destination for all exotic car keys you assign. 
          You can override this on individual assignments if needed.
        </div>
      </CardContent>
    </Card>
  );
}
