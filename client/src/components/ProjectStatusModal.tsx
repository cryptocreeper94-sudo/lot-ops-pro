import { useState, useEffect } from "react";
import { 
  CheckCircle2, 
  Circle, 
  ListChecks, 
  X,
  ClipboardList,
  LayoutDashboard,
  Truck,
  Database,
  MapPin
} from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

export function ProjectStatusModal() {
  const [isOpen, setIsOpen] = useState(true);

  // Prevent it from being annoying if they just closed it?
  // For now, per request "when I log back into this project", we just show it on mount.
  // In a real app we might use localStorage to session-gate it.

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogContent className="max-w-4xl h-[85vh] flex flex-col p-0 overflow-hidden">
        <div className="p-6 pb-2 border-b bg-slate-50">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-2xl">
              <ClipboardList className="h-6 w-6 text-blue-600" /> 
              Project Status & Checklist
            </DialogTitle>
            <DialogDescription>
              Review completed features and remaining tasks for VanOps Pro.
            </DialogDescription>
          </DialogHeader>
        </div>
        
        <ScrollArea className="flex-1 p-6 bg-slate-50/50">
          <div className="space-y-8">
            
            {/* Section 1: Core Architecture */}
            <section className="space-y-4">
              <h3 className="text-lg font-bold flex items-center gap-2 text-slate-800">
                <LayoutDashboard className="h-5 w-5 text-slate-500" /> 1. Core System Architecture
              </h3>
              <div className="grid md:grid-cols-2 gap-4">
                <StatusItem completed text="Mobile-First Design (Driver Phone Optimized)" />
                <StatusItem completed text="Role-Based Access (Logistics, Merch, Admin)" />
                <StatusItem completed text="Simple Login (ID 8842 + Passcode)" />
              </div>
            </section>

            {/* Section 2: Driver Dashboard */}
            <section className="space-y-4">
              <h3 className="text-lg font-bold flex items-center gap-2 text-slate-800">
                <Truck className="h-5 w-5 text-slate-500" /> 2. Driver Dashboard (The App)
              </h3>
              <div className="grid gap-4">
                <Card>
                  <CardHeader className="pb-2 bg-blue-50/50">
                    <CardTitle className="text-sm uppercase tracking-wider text-blue-700">Operational Modes</CardTitle>
                  </CardHeader>
                  <CardContent className="pt-4 grid md:grid-cols-2 gap-2">
                    <StatusItem completed text="Bulk Move (Standard Quota)" />
                    <StatusItem completed text="EV Ops (Charging Workflow)" />
                    <StatusItem completed text="Crunch Mode (Non-Quota Work)" />
                    <StatusItem completed text="Retroactive Logging (Safety Net)" subtext="Fix logs after forgetting to switch modes" />
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="pb-2 bg-blue-50/50">
                     <CardTitle className="text-sm uppercase tracking-wider text-blue-700">Scanning & Routing</CardTitle>
                  </CardHeader>
                  <CardContent className="pt-4 grid md:grid-cols-2 gap-2">
                    <StatusItem completed text="QR/VIN Scanner (Simulated)" />
                    <StatusItem completed text="Smart Routing (Pickup -> Dropoff)" />
                    <StatusItem completed text="GPS Guidance (Compass + Distance)" subtext="Simulated satellite lock & navigation" />
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="pb-2 bg-blue-50/50">
                     <CardTitle className="text-sm uppercase tracking-wider text-blue-700">Performance & Issues</CardTitle>
                  </CardHeader>
                  <CardContent className="pt-4 grid md:grid-cols-2 gap-2">
                    <StatusItem completed text="Live MPH Gauge vs Goal (4.5)" />
                    <StatusItem completed text="Performance Alerts (Falling Behind)" />
                    <StatusItem completed text="Driver Profile (Bonus/History)" />
                    <StatusItem completed text="Problem Reporting (Skip Logic)" />
                    <StatusItem completed text="Jump Start Workflow (Timer)" />
                  </CardContent>
                </Card>
              </div>
            </section>

            {/* Section 3: Supervisor Console */}
            <section className="space-y-4">
              <h3 className="text-lg font-bold flex items-center gap-2 text-slate-800">
                <MapPin className="h-5 w-5 text-slate-500" /> 3. Supervisor Console (The Brain)
              </h3>
              <div className="grid gap-4">
                <div className="grid md:grid-cols-2 gap-4">
                   <StatusItem completed text="Dynamic Facility Config (Lanes 1-55)" />
                   <StatusItem completed text="Weekly Workflow Selector (Mon-Thu)" />
                   <StatusItem completed text="Efficiency Calculator (Physics-based)" />
                   <StatusItem completed text="Live Monitoring & Activity Feed" />
                </div>
              </div>
            </section>

            {/* Section 4: Future / Backend */}
            <section className="space-y-4">
              <h3 className="text-lg font-bold flex items-center gap-2 text-slate-800">
                <Database className="h-5 w-5 text-slate-500" /> 4. Future Implementation Needs
              </h3>
              <div className="bg-slate-100 rounded-xl p-4 border border-slate-200">
                <div className="grid md:grid-cols-2 gap-4">
                  <StatusItem text="Database Integration (Persist Data)" />
                  <StatusItem text="Real GPS Integration (Geolocation API)" />
                  <StatusItem text="Auth System (Company Directory)" />
                  <StatusItem text="Printing Integration (Merch Stickers)" />
                </div>
              </div>
            </section>

          </div>
        </ScrollArea>

        <div className="p-4 border-t bg-white flex justify-between items-center">
          <div className="text-xs text-slate-500">
            Last Updated: Nov 19, 2025
          </div>
          <Button onClick={() => setIsOpen(false)} className="bg-blue-600 hover:bg-blue-700">
            Close Checklist
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}

function StatusItem({ completed, text, subtext }: { completed?: boolean, text: string, subtext?: string }) {
  return (
    <div className={`flex items-start gap-2 p-2 rounded ${completed ? 'bg-green-50/50' : 'bg-slate-50'} border ${completed ? 'border-green-100' : 'border-slate-200'}`}>
      {completed ? (
        <CheckCircle2 className="h-5 w-5 text-green-600 shrink-0 mt-0.5" />
      ) : (
        <Circle className="h-5 w-5 text-slate-300 shrink-0 mt-0.5" />
      )}
      <div>
        <div className={`font-medium ${completed ? 'text-slate-900' : 'text-slate-500'}`}>
          {text}
        </div>
        {subtext && <div className="text-xs text-slate-500">{subtext}</div>}
      </div>
    </div>
  );
}
