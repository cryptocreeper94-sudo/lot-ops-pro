import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Users,
  Eye,
  Scan,
  MapPin,
  Clock,
  Truck,
  Activity,
  CheckCircle2,
  Coffee,
  TrendingUp,
  Key,
  ClipboardList,
  Navigation,
  AlertCircle,
} from "lucide-react";

interface RolePreviewDialogsProps {
  supervisorOpen: boolean;
  driverOpen: boolean;
  onCloseSupervisor: () => void;
  onCloseDriver: () => void;
}

export function RolePreviewDialogs({
  supervisorOpen,
  driverOpen,
  onCloseSupervisor,
  onCloseDriver,
}: RolePreviewDialogsProps) {
  return (
    <>
      <Dialog open={supervisorOpen} onOpenChange={onCloseSupervisor}>
        <DialogContent className="max-w-2xl max-h-[85vh]">
          <DialogHeader>
            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-xl bg-gradient-to-br from-blue-500 to-indigo-600">
                <Users className="w-5 h-5 text-white" />
              </div>
              <div>
                <DialogTitle className="text-xl">Supervisor Dashboard Preview</DialogTitle>
                <DialogDescription>What supervisors see when they start their shift</DialogDescription>
              </div>
            </div>
          </DialogHeader>

          <ScrollArea className="max-h-[60vh] pr-4">
            <div className="space-y-4">
              <Card className="border-blue-200 bg-blue-50/50 dark:bg-blue-950/20 dark:border-blue-900">
                <CardHeader className="pb-2">
                  <CardTitle className="text-base flex items-center gap-2">
                    <Key className="w-4 h-4 text-blue-600" />
                    Daily Access Code
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center gap-3">
                    <div className="text-3xl font-mono font-bold tracking-widest text-blue-700 dark:text-blue-400">
                      DEMO12
                    </div>
                    <Badge variant="secondary">Share with drivers</Badge>
                  </div>
                  <p className="text-xs text-muted-foreground mt-2">
                    Supervisors share this code verbally at pre-shift meetings
                  </p>
                </CardContent>
              </Card>

              <Card className="border-emerald-200 bg-emerald-50/50 dark:bg-emerald-950/20 dark:border-emerald-900">
                <CardHeader className="pb-2">
                  <CardTitle className="text-base flex items-center gap-2">
                    <Activity className="w-4 h-4 text-emerald-600" />
                    Live Driver Wall
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-4 gap-2 text-center">
                    <div className="bg-emerald-100 dark:bg-emerald-900/30 rounded-lg p-2">
                      <div className="text-lg font-bold text-emerald-700 dark:text-emerald-400">8</div>
                      <div className="text-xs text-muted-foreground">Available</div>
                    </div>
                    <div className="bg-blue-100 dark:bg-blue-900/30 rounded-lg p-2">
                      <div className="text-lg font-bold text-blue-700 dark:text-blue-400">12</div>
                      <div className="text-xs text-muted-foreground">Moving</div>
                    </div>
                    <div className="bg-amber-100 dark:bg-amber-900/30 rounded-lg p-2">
                      <div className="text-lg font-bold text-amber-700 dark:text-amber-400">2</div>
                      <div className="text-xs text-muted-foreground">On Break</div>
                    </div>
                    <div className="bg-slate-100 dark:bg-slate-800 rounded-lg p-2">
                      <div className="text-lg font-bold text-slate-700 dark:text-slate-400">3</div>
                      <div className="text-xs text-muted-foreground">Offline</div>
                    </div>
                  </div>
                  <p className="text-xs text-muted-foreground mt-3">
                    Real-time view of all driver statuses, locations, and progress toward quotas
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-base flex items-center gap-2">
                    <ClipboardList className="w-4 h-4 text-purple-600" />
                    Assignment Tools
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                  <div className="flex items-center gap-3 p-2 bg-muted/50 rounded-lg">
                    <Truck className="w-4 h-4 text-muted-foreground" />
                    <span className="text-sm">Create move requests and priority assignments</span>
                  </div>
                  <div className="flex items-center gap-3 p-2 bg-muted/50 rounded-lg">
                    <MapPin className="w-4 h-4 text-muted-foreground" />
                    <span className="text-sm">View lot availability and capacity</span>
                  </div>
                  <div className="flex items-center gap-3 p-2 bg-muted/50 rounded-lg">
                    <Users className="w-4 h-4 text-muted-foreground" />
                    <span className="text-sm">Manage crew roster and van assignments</span>
                  </div>
                </CardContent>
              </Card>

              <div className="bg-gradient-to-r from-blue-100 to-indigo-100 dark:from-blue-950/30 dark:to-indigo-950/30 rounded-lg p-4 border border-blue-200 dark:border-blue-800">
                <p className="text-sm text-blue-800 dark:text-blue-300">
                  <strong>Key Responsibility:</strong> Supervisors manage driver assignments, 
                  monitor real-time progress, and ensure vehicles flow efficiently through the lot.
                </p>
              </div>
            </div>
          </ScrollArea>
        </DialogContent>
      </Dialog>

      <Dialog open={driverOpen} onOpenChange={onCloseDriver}>
        <DialogContent className="max-w-2xl max-h-[85vh]">
          <DialogHeader>
            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-xl bg-gradient-to-br from-green-500 to-emerald-600">
                <Truck className="w-5 h-5 text-white" />
              </div>
              <div>
                <DialogTitle className="text-xl">Driver Dashboard Preview</DialogTitle>
                <DialogDescription>What drivers see when they start their shift</DialogDescription>
              </div>
            </div>
          </DialogHeader>

          <ScrollArea className="max-h-[60vh] pr-4">
            <div className="space-y-4">
              <Card className="border-green-200 bg-green-50/50 dark:bg-green-950/20 dark:border-green-900">
                <CardHeader className="pb-2">
                  <CardTitle className="text-base flex items-center gap-2">
                    <Scan className="w-4 h-4 text-green-600" />
                    Scanner Screen
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="bg-slate-900 rounded-lg p-4 text-center">
                    <div className="w-32 h-24 mx-auto border-2 border-dashed border-green-500 rounded-lg flex items-center justify-center mb-3">
                      <Scan className="w-8 h-8 text-green-500 opacity-50" />
                    </div>
                    <p className="text-xs text-slate-400">Point camera at work order sticker</p>
                  </div>
                  <p className="text-xs text-muted-foreground mt-3">
                    Drivers scan work orders to get instant destination and routing info
                  </p>
                </CardContent>
              </Card>

              <Card className="border-amber-200 bg-amber-50/50 dark:bg-amber-950/20 dark:border-amber-900">
                <CardHeader className="pb-2">
                  <CardTitle className="text-base flex items-center gap-2">
                    <Navigation className="w-4 h-4 text-amber-600" />
                    GPS Navigation
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center gap-4">
                    <div className="flex-1">
                      <div className="text-sm font-semibold">Current Destination</div>
                      <div className="text-lg font-bold text-amber-700 dark:text-amber-400">Lane 24, Spot 15</div>
                      <div className="text-xs text-muted-foreground mt-1">450 ft remaining</div>
                    </div>
                    <div className="w-16 h-16 bg-amber-100 dark:bg-amber-900/30 rounded-lg flex items-center justify-center">
                      <Navigation className="w-8 h-8 text-amber-600 dark:text-amber-400" />
                    </div>
                  </div>
                  <p className="text-xs text-muted-foreground mt-3">
                    Turn-by-turn guidance to pickup and drop-off locations
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-base flex items-center gap-2">
                    <TrendingUp className="w-4 h-4 text-purple-600" />
                    Performance Tracker
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-3 gap-3 text-center">
                    <div className="bg-muted/50 rounded-lg p-2">
                      <div className="text-lg font-bold">18</div>
                      <div className="text-xs text-muted-foreground">Moves Today</div>
                    </div>
                    <div className="bg-muted/50 rounded-lg p-2">
                      <div className="text-lg font-bold">4.2</div>
                      <div className="text-xs text-muted-foreground">MPH Rate</div>
                    </div>
                    <div className="bg-muted/50 rounded-lg p-2">
                      <div className="text-lg font-bold text-green-600">On Track</div>
                      <div className="text-xs text-muted-foreground">Quota Status</div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <div className="grid grid-cols-2 gap-3">
                <div className="flex items-center gap-2 p-3 bg-muted/50 rounded-lg">
                  <Coffee className="w-4 h-4 text-muted-foreground" />
                  <span className="text-sm">Break requests</span>
                </div>
                <div className="flex items-center gap-2 p-3 bg-muted/50 rounded-lg">
                  <AlertCircle className="w-4 h-4 text-muted-foreground" />
                  <span className="text-sm">Safety reports</span>
                </div>
              </div>

              <div className="bg-gradient-to-r from-green-100 to-emerald-100 dark:from-green-950/30 dark:to-emerald-950/30 rounded-lg p-4 border border-green-200 dark:border-green-800">
                <p className="text-sm text-green-800 dark:text-green-300">
                  <strong>Driver Focus:</strong> Scan work orders, follow GPS to destination, 
                  complete moves, track performance toward daily quota.
                </p>
              </div>
            </div>
          </ScrollArea>
        </DialogContent>
      </Dialog>
    </>
  );
}

export function RolePreviewButtons({
  onOpenSupervisor,
  onOpenDriver,
}: {
  onOpenSupervisor: () => void;
  onOpenDriver: () => void;
}) {
  return (
    <div className="space-y-3">
      <h3 className="text-sm font-semibold text-muted-foreground flex items-center gap-2">
        <Eye className="w-4 h-4" />
        Role Previews
      </h3>
      <p className="text-xs text-muted-foreground">
        See what your team sees when they log in
      </p>
      <div className="grid grid-cols-2 gap-3">
        <Button
          variant="outline"
          className="h-auto py-4 flex flex-col items-center gap-2 border-2 border-blue-200 hover:border-blue-400 hover:bg-blue-50 dark:border-blue-800 dark:hover:border-blue-600 dark:hover:bg-blue-950/30"
          onClick={onOpenSupervisor}
          data-testid="button-preview-supervisor"
        >
          <div className="p-2 rounded-lg bg-gradient-to-br from-blue-500 to-indigo-600">
            <Users className="w-5 h-5 text-white" />
          </div>
          <span className="font-medium">Supervisor View</span>
          <span className="text-xs text-muted-foreground">Daily Code, Driver Wall, Assignments</span>
        </Button>
        <Button
          variant="outline"
          className="h-auto py-4 flex flex-col items-center gap-2 border-2 border-green-200 hover:border-green-400 hover:bg-green-50 dark:border-green-800 dark:hover:border-green-600 dark:hover:bg-green-950/30"
          onClick={onOpenDriver}
          data-testid="button-preview-driver"
        >
          <div className="p-2 rounded-lg bg-gradient-to-br from-green-500 to-emerald-600">
            <Truck className="w-5 h-5 text-white" />
          </div>
          <span className="font-medium">Driver View</span>
          <span className="text-xs text-muted-foreground">Scanner, GPS, Performance</span>
        </Button>
      </div>
    </div>
  );
}
