import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Camera, Plug, PlugZap, CheckCircle2, BatteryCharging, Zap, X, Loader2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { DemoModeBanner, isDemoMode } from "@/components/DemoModeBanner";

export default function EvChargingTracker() {
  const { toast } = useToast();
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  
  const [currentVin, setCurrentVin] = useState<string | null>(null);
  const [isCharging, setIsCharging] = useState(false);
  const [scanStep, setScanStep] = useState<"idle" | "camera" | "processing" | "success">("idle");
  const [cameraStream, setCameraStream] = useState<MediaStream | null>(null);
  const [cameraError, setCameraError] = useState<string | null>(null);

  // Start camera when entering camera mode
  useEffect(() => {
    if (scanStep === "camera") {
      startCamera();
    } else {
      stopCamera();
    }
    return () => {
      stopCamera();
    };
  }, [scanStep]);

  const startCamera = async () => {
    try {
      setCameraError(null);
      
      // Guard for SSR/non-browser environments
      if (typeof navigator === 'undefined' || !navigator.mediaDevices?.getUserMedia) {
        setCameraError("Camera not available in this environment.");
        return;
      }
      
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: "environment", width: { ideal: 1280 }, height: { ideal: 720 } }
      });
      setCameraStream(stream);
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }
    } catch (err) {
      console.error("Camera error:", err);
      setCameraError("Unable to access camera. Please grant camera permissions.");
      toast({
        title: "Camera Error",
        description: "Could not access camera. Using demo mode.",
        variant: "destructive",
      });
    }
  };

  const stopCamera = () => {
    if (cameraStream) {
      cameraStream.getTracks().forEach(track => track.stop());
      setCameraStream(null);
    }
  };

  const captureAndScan = () => {
    setScanStep("processing");
    
    // Capture frame from video (for future OCR integration)
    if (videoRef.current && canvasRef.current) {
      const video = videoRef.current;
      const canvas = canvasRef.current;
      canvas.width = video.videoWidth || 640;
      canvas.height = video.videoHeight || 480;
      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.drawImage(video, 0, 0);
      }
    }

    // Simulate OCR scan result (in production, would process captured image)
    setTimeout(() => {
      const mockVin = `1HGBH41JXMN${Math.floor(Math.random() * 900000 + 100000)}`;
      setCurrentVin(mockVin);
      setScanStep("success");
      stopCamera();
      
      toast({
        title: "VIN Scanned Successfully",
        description: `Vehicle ${mockVin.slice(-6)} detected`,
        duration: 3000,
      });
    }, 1500);
  };

  const handlePlugIn = async () => {
    if (!currentVin) return;

    if (!isDemoMode()) {
      await fetch("/api/ev-charging", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          vin: currentVin,
          status: "plugged",
          location: "400 EV",
        }),
      });
    }

    setIsCharging(true);
    toast({
      title: "Charging Started",
      description: `Vehicle ${currentVin.slice(-6)} is now charging`,
      duration: 3000,
    });
  };

  const handleUnplug = async () => {
    if (!currentVin) return;

    if (!isDemoMode()) {
      await fetch("/api/ev-charging", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          vin: currentVin,
          status: "unplugged",
          location: "400 EV",
        }),
      });
    }

    toast({
      title: "Charging Complete",
      description: `Vehicle ${currentVin.slice(-6)} removed from charger`,
      duration: 3000,
    });

    // Reset
    setTimeout(() => {
      setCurrentVin(null);
      setIsCharging(false);
      setScanStep("idle");
    }, 1500);
  };

  const cancelScan = () => {
    stopCamera();
    setScanStep("idle");
    setCameraError(null);
  };

  return (
    <div className="min-h-screen dashboard-premium-teal p-4 pb-[40px] scrollbar-premium page-enter">
      <DemoModeBanner />
      <div className="absolute inset-0 opacity-20 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-cyan-500 via-transparent to-transparent pointer-events-none" />
      <div className="absolute inset-0 opacity-10 bg-[radial-gradient(ellipse_at_bottom_left,_var(--tw-gradient-stops))] from-teal-400 via-transparent to-transparent pointer-events-none" />
      
      <div className="max-w-md mx-auto pt-4 space-y-4 relative z-10">
        {/* Title Header */}
        <div className="text-center mb-6 section-enter">
          <div className="inline-flex p-4 bg-gradient-to-br from-teal-500/30 to-cyan-500/30 rounded-2xl mb-4 glow-green border border-teal-400/30">
            <PlugZap className="h-12 w-12 text-teal-200" />
          </div>
          <h1 className="text-3xl font-bold text-gradient-teal">EV Charging</h1>
          <p className="text-teal-200/80 mt-2">Track electric vehicles at 400 EV</p>
        </div>

        {/* Camera Viewfinder - When scanning */}
        {scanStep === "camera" && (
          <Card className="card-glass border-teal-500/50 overflow-hidden">
            <CardContent className="p-0 relative">
              {/* Close button */}
              <Button
                size="icon"
                variant="ghost"
                onClick={cancelScan}
                className="absolute top-2 right-2 z-20 bg-black/50 hover:bg-black/70 text-white"
                data-testid="button-cancel-scan"
              >
                <X className="h-5 w-5" />
              </Button>
              
              {/* Video preview */}
              <div className="relative aspect-[4/3] bg-black">
                {cameraError ? (
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="text-center p-4">
                      <Camera className="h-12 w-12 text-red-400 mx-auto mb-3 opacity-50" />
                      <p className="text-red-300 text-sm">{cameraError}</p>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => captureAndScan()}
                        className="mt-3 border-teal-500 text-teal-300"
                      >
                        Use Demo Mode
                      </Button>
                    </div>
                  </div>
                ) : (
                  <>
                    <video
                      ref={videoRef}
                      autoPlay
                      playsInline
                      muted
                      className="w-full h-full object-cover"
                    />
                    {/* Scanning overlay with target box */}
                    <div className="absolute inset-0 pointer-events-none">
                      {/* Darkened edges */}
                      <div className="absolute inset-0 bg-gradient-to-b from-black/40 via-transparent to-black/40" />
                      {/* Target rectangle */}
                      <div className="absolute inset-x-8 top-1/4 bottom-1/3 border-2 border-teal-400 rounded-lg">
                        <div className="absolute -top-6 left-0 right-0 text-center">
                          <span className="text-xs text-teal-300 bg-black/60 px-2 py-1 rounded">
                            Position VIN plate in frame
                          </span>
                        </div>
                        {/* Corner markers */}
                        <div className="absolute -top-0.5 -left-0.5 w-4 h-4 border-t-3 border-l-3 border-teal-400" />
                        <div className="absolute -top-0.5 -right-0.5 w-4 h-4 border-t-3 border-r-3 border-teal-400" />
                        <div className="absolute -bottom-0.5 -left-0.5 w-4 h-4 border-b-3 border-l-3 border-teal-400" />
                        <div className="absolute -bottom-0.5 -right-0.5 w-4 h-4 border-b-3 border-r-3 border-teal-400" />
                      </div>
                    </div>
                  </>
                )}
              </div>
              
              {/* Hidden canvas for capture */}
              <canvas ref={canvasRef} className="hidden" />
              
              {/* Capture button */}
              {!cameraError && (
                <div className="p-4 bg-black/80">
                  <Button
                    size="lg"
                    className="w-full h-14 btn-premium btn-premium-teal text-base font-bold"
                    onClick={captureAndScan}
                    data-testid="button-capture-vin"
                  >
                    <Camera className="h-5 w-5 mr-2" />
                    Capture VIN
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        )}

        {/* Processing State */}
        {scanStep === "processing" && (
          <Card className="card-glass border-teal-500/40">
            <CardContent className="p-8 text-center">
              <div className="inline-flex p-4 bg-gradient-to-br from-teal-500/30 to-cyan-500/30 rounded-full mb-4 glow-green">
                <Loader2 className="h-10 w-10 text-teal-300 animate-spin" />
              </div>
              <p className="text-teal-200 font-semibold">Processing VIN...</p>
              <p className="text-slate-400 text-sm mt-1">Running OCR on captured image</p>
            </CardContent>
          </Card>
        )}

        {/* Current Status Card - Premium Glass */}
        {(scanStep === "idle" || scanStep === "success") && (
          <Card className="card-glass border-teal-500/40 card-hover-lift">
            <CardHeader className="py-3 px-4">
              <CardTitle className="text-sm text-center flex items-center justify-center gap-2">
                {isCharging ? (
                  <>
                    <BatteryCharging className="h-5 w-5 text-green-400 animate-pulse" />
                    <span className="text-green-300 font-semibold">Charging in Progress</span>
                  </>
                ) : currentVin ? (
                  <>
                    <Zap className="h-5 w-5 text-teal-400" />
                    <span className="text-teal-300">Ready to Charge</span>
                  </>
                ) : (
                  <>
                    <Plug className="h-5 w-5 text-slate-400" />
                    <span className="text-slate-300">No Vehicle Scanned</span>
                  </>
                )}
              </CardTitle>
            </CardHeader>
            <CardContent className="p-4 space-y-3">
              {/* VIN Display - Premium */}
              {currentVin && (
                <div className="bg-gradient-to-r from-teal-900/50 to-cyan-900/50 p-3 rounded-xl border border-teal-500/40">
                  <div className="text-[10px] text-teal-400 font-bold uppercase tracking-wider">VIN</div>
                  <div className="font-mono text-lg font-bold text-white">{currentVin}</div>
                </div>
              )}

              {/* Scan Button - Premium */}
              {scanStep === "idle" && (
                <Button
                  size="lg"
                  className="w-full h-14 btn-premium btn-premium-teal text-base font-bold"
                  onClick={() => setScanStep("camera")}
                  data-testid="button-scan-vin"
                >
                  <Camera className="h-5 w-5 mr-2" />
                  Scan Vehicle VIN
                </Button>
              )}

              {/* Action Buttons - Premium */}
              {scanStep === "success" && !isCharging && (
                <div className="space-y-3">
                  <Button
                    size="lg"
                    className="w-full h-12 btn-premium btn-premium-green text-sm font-bold"
                    onClick={handlePlugIn}
                    data-testid="button-plug-in"
                  >
                    <PlugZap className="h-5 w-5 mr-2" />
                    Plug In & Start Charging
                  </Button>

                  <Button
                    size="sm"
                    variant="ghost"
                    className="w-full text-slate-400 hover:text-white hover:bg-slate-800/50"
                    onClick={() => {
                      setCurrentVin(null);
                      setScanStep("idle");
                    }}
                    data-testid="button-rescan"
                  >
                    Cancel / Re-scan
                  </Button>
                </div>
              )}

              {isCharging && (
                <div className="space-y-3">
                  <div className="bg-gradient-to-r from-green-900/50 to-emerald-900/50 p-3 rounded-xl border border-green-500/40 text-center">
                    <BatteryCharging className="h-8 w-8 text-green-400 mx-auto mb-2 animate-pulse" />
                    <p className="text-sm font-bold text-green-300">Charging at 400 EV</p>
                  </div>

                  <Button
                    size="lg"
                    className="w-full h-12 btn-premium text-sm font-bold"
                    onClick={handleUnplug}
                    data-testid="button-unplug"
                  >
                    <CheckCircle2 className="h-5 w-5 mr-2" />
                    Remove from Charger
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        )}

        {/* Instructions - Premium Glass */}
        <Card className="card-glass border-teal-500/30">
          <CardContent className="p-3">
            <h3 className="font-bold text-xs text-teal-300 mb-2">How to Use:</h3>
            <ol className="text-xs text-slate-300 space-y-1">
              <li className="flex gap-2">
                <span className="font-bold text-teal-400">1.</span>
                <span>Scan VIN plate with camera</span>
              </li>
              <li className="flex gap-2">
                <span className="font-bold text-teal-400">2.</span>
                <span>Tap "Plug In" to start charging</span>
              </li>
              <li className="flex gap-2">
                <span className="font-bold text-teal-400">3.</span>
                <span>When done, tap "Remove from Charger"</span>
              </li>
            </ol>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
