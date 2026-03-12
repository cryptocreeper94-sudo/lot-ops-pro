import { useState } from "react";
import { useLocation } from "wouter";
import { motion } from "framer-motion";
import { 
  Car, 
  ChevronRight, 
  MapPin, 
  Camera, 
  CheckCircle2, 
  Clock, 
  TrendingUp,
  AlertTriangle,
  Truck,
  Navigation,
  Zap,
  ArrowLeft,
  Map,
  Newspaper,
  ListChecks
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { DynamicSkyBackground } from "@/components/DynamicSkyBackground";
import { BentoGrid, BentoTile } from "@/components/ui/bento-grid";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { CameraPreviewModal } from "@/components/CameraPreviewModal";
import { ListScanner } from "@/components/ListScanner";
import { LotVisionQuickSearch } from "@/components/LotVisionLauncher";
import { useToast } from "@/hooks/use-toast";

const LOT_ZONES = [
  { id: "sale_lanes", name: "Sale Lanes", spots: "210-257", color: "bg-purple-500" },
  { id: "dirtside", name: "Dirtside", spots: "325-372", color: "bg-amber-600" },
  { id: "cleanside", name: "Cleanside", spots: "400-411", color: "bg-green-500" },
  { id: "inventory", name: "Inventory", spots: "501-520", color: "bg-blue-500" },
  { id: "cage", name: "The Cage", spots: "591-599", color: "bg-red-500" },
  { id: "overflow", name: "Overflow", spots: "702+", color: "bg-slate-500" },
  { id: "psi", name: "PSI", spots: "800-860", color: "bg-cyan-500" },
];

export default function DriverSandbox() {
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const [showGoLiveDialog, setShowGoLiveDialog] = useState(false);
  const [showMapsDialog, setShowMapsDialog] = useState(false);
  const [showVinScanner, setShowVinScanner] = useState(false);
  const [showListScanner, setShowListScanner] = useState(false);
  const [lastScannedVin, setLastScannedVin] = useState<string | null>(null);
  
  // Sandbox stats (simulated)
  const sandboxStats = {
    movesToday: 12,
    avgTimePerMove: "4:32",
    efficiency: 94,
    currentZone: "Zone A - Clean Side"
  };

  const handleGoLive = () => {
    setShowGoLiveDialog(false);
    // Clear sandbox mode
    localStorage.removeItem('vanops_sandbox_mode');
    // Redirect to login for real authentication
    setLocation('/');
  };

  return (
    <div className="min-h-screen relative overflow-hidden">
      <DynamicSkyBackground />
      
      {/* Sandbox Mode Banner */}
      <motion.div
        initial={{ y: -100 }}
        animate={{ y: 0 }}
        className="fixed top-0 left-0 right-0 z-50 bg-gradient-to-r from-amber-600 to-orange-600 text-white py-2 px-4 flex flex-wrap items-center justify-between gap-2"
      >
        <div className="flex items-center gap-2 min-w-0">
          <AlertTriangle className="h-5 w-5 flex-shrink-0" />
          <span className="font-bold text-sm sm:text-base">SANDBOX MODE</span>
          <span className="hidden sm:inline text-sm opacity-80">- Practice without affecting live data</span>
        </div>
        <Button
          size="sm"
          onClick={() => setShowGoLiveDialog(true)}
          className="bg-white text-amber-700 hover:bg-amber-100 font-bold min-h-11 flex-shrink-0"
          data-testid="button-go-live-header"
        >
          Go Live
        </Button>
      </motion.div>
      
      {/* Main Content */}
      <div className="relative z-10 pt-16 pb-8 px-4 max-w-4xl mx-auto">
        {/* Back Button */}
        <Button
          variant="ghost"
          onClick={() => setLocation('/')}
          className="mb-4 text-slate-300 hover:text-white min-h-11"
          data-testid="button-back-to-home"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Home
        </Button>

        {/* Driver Dashboard Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-8"
        >
          <h1 className="text-3xl font-bold text-white mb-2">Driver Dashboard</h1>
          <p className="text-slate-300">Practice mode - Your actions won't affect the live system</p>
        </motion.div>

        {/* Quick Stats */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="mb-6"
        >
          <Card className="bg-slate-900/80 border-slate-700/50 backdrop-blur-xl">
            <CardContent className="pt-4">
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                <div className="text-center">
                  <div className="text-2xl font-bold text-blue-400">{sandboxStats.movesToday}</div>
                  <div className="text-xs text-slate-400">Moves Today</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-green-400">{sandboxStats.avgTimePerMove}</div>
                  <div className="text-xs text-slate-400">Avg Time/Move</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-purple-400">{sandboxStats.efficiency}%</div>
                  <div className="text-xs text-slate-400">Efficiency</div>
                </div>
                <div className="text-center col-span-2 sm:col-span-1">
                  <div className="text-lg font-bold text-amber-400 truncate">{sandboxStats.currentZone}</div>
                  <div className="text-xs text-slate-400">Current Zone</div>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Action Buttons - Bento Grid */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <BentoGrid className="grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
            {/* Scan VIN */}
            <BentoTile
              variant="glass"
              className="cursor-pointer"
              data-testid="tile-scan-vin"
              onClick={() => setShowVinScanner(true)}
            >
              <Card className="h-full bg-gradient-to-br from-blue-600/20 to-blue-800/20 border-blue-500/30 hover:border-blue-400/50 transition-all">
                <CardContent className="flex flex-col items-center justify-center h-full py-8">
                  <Camera className="h-12 w-12 text-blue-400 mb-3" />
                  <h3 className="font-bold text-white text-lg">Scan VIN</h3>
                  <p className="text-slate-400 text-sm text-center mt-1">Camera OCR scanning</p>
                  {lastScannedVin && (
                    <Badge className="mt-2 bg-blue-500/20 text-blue-300 border-blue-500/30 text-xs">
                      Last: {lastScannedVin.slice(-6)}
                    </Badge>
                  )}
                </CardContent>
              </Card>
            </BentoTile>

            {/* Scan List - OCR Paper Lists */}
            <BentoTile
              variant="glass"
              className="cursor-pointer"
              data-testid="tile-scan-list"
              onClick={() => setShowListScanner(true)}
            >
              <Card className="h-full bg-gradient-to-br from-orange-600/20 to-orange-800/20 border-orange-500/30 hover:border-orange-400/50 transition-all">
                <CardContent className="flex flex-col items-center justify-center h-full py-8">
                  <ListChecks className="h-12 w-12 text-orange-400 mb-3" />
                  <h3 className="font-bold text-white text-lg">Scan List</h3>
                  <p className="text-slate-400 text-sm text-center mt-1">Paper to checklist</p>
                </CardContent>
              </Card>
            </BentoTile>

            {/* Current Assignment */}
            <BentoTile
              variant="glass"
              className="cursor-pointer"
              data-testid="tile-assignment"
            >
              <Card className="h-full bg-gradient-to-br from-green-600/20 to-green-800/20 border-green-500/30 hover:border-green-400/50 transition-all">
                <CardContent className="flex flex-col items-center justify-center h-full py-8">
                  <Truck className="h-12 w-12 text-green-400 mb-3" />
                  <h3 className="font-bold text-white text-lg">My Assignment</h3>
                  <Badge className="mt-2 bg-green-500/20 text-green-300 border-green-500/30">
                    Clean Side
                  </Badge>
                </CardContent>
              </Card>
            </BentoTile>

            {/* Navigate */}
            <BentoTile
              variant="glass"
              className="cursor-pointer"
              data-testid="tile-navigate"
            >
              <Card className="h-full bg-gradient-to-br from-purple-600/20 to-purple-800/20 border-purple-500/30 hover:border-purple-400/50 transition-all">
                <CardContent className="flex flex-col items-center justify-center h-full py-8">
                  <Navigation className="h-12 w-12 text-purple-400 mb-3" />
                  <h3 className="font-bold text-white text-lg">Navigate</h3>
                  <p className="text-slate-400 text-sm text-center mt-1">GPS guidance</p>
                </CardContent>
              </Card>
            </BentoTile>

            {/* Lot Vision GPS - Manheim Vehicle Tracker */}
            <BentoTile
              variant="glass"
              className="col-span-1 sm:col-span-2 xl:col-span-3 w-full"
              data-testid="tile-lotvision"
            >
              <LotVisionQuickSearch />
            </BentoTile>

            {/* Performance */}
            <BentoTile
              variant="glass"
              className="cursor-pointer"
              data-testid="tile-performance"
            >
              <Card className="h-full bg-gradient-to-br from-amber-600/20 to-amber-800/20 border-amber-500/30 hover:border-amber-400/50 transition-all">
                <CardContent className="flex flex-col items-center justify-center h-full py-8">
                  <TrendingUp className="h-12 w-12 text-amber-400 mb-3" />
                  <h3 className="font-bold text-white text-lg">My Stats</h3>
                  <p className="text-slate-400 text-sm text-center mt-1">Performance metrics</p>
                </CardContent>
              </Card>
            </BentoTile>

            {/* Maps */}
            <BentoTile
              variant="glass"
              className="cursor-pointer col-span-1 sm:col-span-2 xl:col-span-3 w-full"
              data-testid="tile-maps"
              onClick={() => setShowMapsDialog(true)}
            >
              <Card className="h-full bg-gradient-to-br from-cyan-600/20 to-cyan-800/20 border-cyan-500/30 hover:border-cyan-400/50 transition-all">
                <CardContent className="flex flex-col items-center justify-center h-full py-6">
                  <Map className="h-10 w-10 text-cyan-400 mb-2" />
                  <h3 className="font-bold text-white text-lg">Facility Maps</h3>
                  <p className="text-slate-400 text-sm text-center mt-1">Lot footprint & weekly lanes</p>
                </CardContent>
              </Card>
            </BentoTile>

            {/* Employee Portal */}
            <BentoTile
              variant="glass"
              className="cursor-pointer col-span-1 sm:col-span-2 xl:col-span-3 w-full"
              data-testid="tile-employee-portal"
              onClick={() => setLocation("/employee-portal")}
            >
              <Card className="h-full bg-gradient-to-br from-indigo-600/20 to-indigo-800/20 border-indigo-500/30 hover:border-indigo-400/50 transition-all">
                <CardContent className="flex flex-col items-center justify-center h-full py-6">
                  <Newspaper className="h-10 w-10 text-indigo-400 mb-2" />
                  <h3 className="font-bold text-white text-lg">Employee Portal</h3>
                  <p className="text-slate-400 text-sm text-center mt-1">News, links & recognition</p>
                </CardContent>
              </Card>
            </BentoTile>
          </BentoGrid>
        </motion.div>

        {/* Recent Activity */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="mt-6"
        >
          <Card className="bg-slate-900/80 border-slate-700/50 backdrop-blur-xl">
            <CardHeader className="pb-2">
              <CardTitle className="text-lg text-white flex items-center gap-2">
                <Clock className="h-5 w-5 text-blue-400" />
                Recent Activity
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {[
                  { time: "10:32 AM", action: "Moved vehicle", details: "2024 Toyota Camry to Zone B-14", status: "complete" },
                  { time: "10:28 AM", action: "Scanned VIN", details: "1HGCV1F34LA012345", status: "complete" },
                  { time: "10:15 AM", action: "Started shift", details: "Clean Side assignment", status: "complete" },
                ].map((activity, i) => (
                  <div key={i} className="flex items-start gap-3 p-2 rounded-lg bg-slate-800/50">
                    <CheckCircle2 className="h-5 w-5 text-green-400 mt-0.5 flex-shrink-0" />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="font-medium text-white text-sm">{activity.action}</span>
                        <Badge variant="outline" className="text-xs text-slate-400 border-slate-600">
                          {activity.time}
                        </Badge>
                      </div>
                      <p className="text-xs text-slate-400 truncate">{activity.details}</p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Go Live CTA */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="mt-8"
        >
          <Button
            onClick={() => setShowGoLiveDialog(true)}
            className="w-full min-h-14 text-lg font-bold bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-500 hover:to-emerald-500 shadow-xl shadow-green-900/30"
            data-testid="button-go-live"
          >
            <Zap className="h-5 w-5 mr-2" />
            Ready to Go Live
            <ChevronRight className="h-5 w-5 ml-2" />
          </Button>
        </motion.div>
      </div>

      {/* Go Live Confirmation Dialog */}
      <Dialog open={showGoLiveDialog} onOpenChange={setShowGoLiveDialog}>
        <DialogContent className="bg-slate-900 border-slate-700">
          <DialogHeader>
            <DialogTitle className="text-white flex items-center gap-2">
              <Zap className="h-5 w-5 text-green-400" />
              Go Live?
            </DialogTitle>
            <DialogDescription className="text-slate-300">
              You're about to switch to live mode. This means your actions will affect the real system.
            </DialogDescription>
          </DialogHeader>
          <div className="py-4">
            <div className="bg-amber-500/10 border border-amber-500/30 rounded-lg p-4">
              <h4 className="font-semibold text-amber-400 mb-2">Before going live:</h4>
              <ul className="space-y-2 text-sm text-slate-300">
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="h-4 w-4 text-green-400 mt-0.5 flex-shrink-0" />
                  <span>Get your shift code from your supervisor</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="h-4 w-4 text-green-400 mt-0.5 flex-shrink-0" />
                  <span>Confirm your assignment for today</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="h-4 w-4 text-green-400 mt-0.5 flex-shrink-0" />
                  <span>Enable location permissions</span>
                </li>
              </ul>
            </div>
          </div>
          <DialogFooter className="flex-wrap gap-2">
            <Button
              variant="outline"
              onClick={() => setShowGoLiveDialog(false)}
              className="border-slate-600 text-slate-300 w-full sm:w-auto min-h-11"
              data-testid="button-cancel-go-live"
            >
              Stay in Sandbox
            </Button>
            <Button
              onClick={handleGoLive}
              className="bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-500 hover:to-emerald-500 w-full sm:w-auto min-h-11"
              data-testid="button-confirm-go-live"
            >
              <Zap className="h-4 w-4 mr-2" />
              Go Live Now
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Maps Dialog */}
      <Dialog open={showMapsDialog} onOpenChange={setShowMapsDialog}>
        <DialogContent className="bg-slate-900 border-slate-700 max-w-2xl max-h-[85vh]">
          <DialogHeader>
            <DialogTitle className="text-white flex items-center gap-2">
              <Map className="h-5 w-5 text-cyan-400" />
              Facility Maps
            </DialogTitle>
          </DialogHeader>
          <Tabs defaultValue="footprint" className="w-full">
            <TabsList className="w-full bg-slate-800">
              <TabsTrigger value="footprint" className="flex-1">Lot Footprint</TabsTrigger>
              <TabsTrigger value="lanes" className="flex-1">Weekly Lanes</TabsTrigger>
            </TabsList>
            <TabsContent value="footprint" className="mt-4">
              <div className="rounded-lg overflow-hidden">
                <img 
                  src="/attached_assets/image-3705654498381149414_1763515079330.jpg"
                  alt="Manheim Nashville Lot Footprint"
                  className="w-full rounded-lg"
                />
              </div>
              <div className="mt-3 flex flex-wrap gap-2">
                {LOT_ZONES.map(zone => (
                  <Badge key={zone.id} variant="outline" className={`text-xs ${zone.color}/30 border-white/20`}>
                    {zone.name}: {zone.spots}
                  </Badge>
                ))}
              </div>
            </TabsContent>
            <TabsContent value="lanes" className="mt-4">
              <div className="text-center py-8 text-slate-400 bg-slate-800/50 rounded-lg">
                <Map className="h-10 w-10 mx-auto mb-2 opacity-50" />
                <p>Weekly lane map will be shared by your supervisor</p>
                <p className="text-xs mt-2">Check back after the pre-shift meeting</p>
              </div>
            </TabsContent>
          </Tabs>
        </DialogContent>
      </Dialog>

      {/* VIN Scanner with Camera Preview */}
      <CameraPreviewModal
        isOpen={showVinScanner}
        mode="photo"
        title="Scan Vehicle Ticket"
        description="Position the ticket or VIN in frame"
        showScanFrame={true}
        onClose={() => setShowVinScanner(false)}
        onCapture={(dataUrl) => {
          // For sandbox, simulate a successful scan
          const mockVin = "1HGCV1F34LA" + Math.random().toString().slice(2, 8);
          setLastScannedVin(mockVin);
          setShowVinScanner(false);
          toast({
            title: "Scan Successful",
            description: `VIN: ${mockVin} - Ready for move`,
          });
        }}
        onProcessing={async (dataUrl) => {
          // Simulate OCR processing
          await new Promise(resolve => setTimeout(resolve, 1500));
        }}
      />

      {/* List Scanner Dialog */}
      <Dialog open={showListScanner} onOpenChange={setShowListScanner}>
        <DialogContent className="bg-slate-900 border-slate-700 max-w-lg max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-white flex items-center gap-2">
              <ListChecks className="h-5 w-5 text-orange-400" />
              Scan List
            </DialogTitle>
            <DialogDescription className="text-slate-400">
              Take a photo of your paper list to create a digital checklist
            </DialogDescription>
          </DialogHeader>
          <ListScanner 
            driverName="Sandbox Driver" 
            driverPin="0000"
            onComplete={() => {
              setShowListScanner(false);
              toast({
                title: "Assignment Complete!",
                description: "Supervisor has been notified",
              });
            }}
          />
        </DialogContent>
      </Dialog>
    </div>
  );
}
