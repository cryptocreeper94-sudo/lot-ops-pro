import { useState, useEffect } from "react";
import { useLocation } from "wouter";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Printer, Bluetooth, Check, X, RefreshCw, Smartphone, Wifi } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { NavigationControl } from "@/components/NavigationControl";

interface PrinterDevice {
  id: string;
  name: string;
  status: "available" | "connecting" | "connected";
  signal: number; // 1-3 bars
}

export default function PrinterConnect() {
  const [isScanning, setIsScanning] = useState(true);
  const [devices, setDevices] = useState<PrinterDevice[]>([]);
  const [connectedDevice, setConnectedDevice] = useState<string | null>(null);
  const [_, setLocation] = useLocation();

  // Simulate scanning for devices
  useEffect(() => {
    const timer = setTimeout(() => {
      setDevices([
        { id: "P1", name: "Zebra ZQ630 (Lane 1)", status: "available", signal: 3 },
        { id: "P2", name: "Zebra ZQ630 (Lane 2)", status: "available", signal: 2 },
        { id: "P3", name: "Mobile Printer #442", status: "available", signal: 1 },
      ]);
      setIsScanning(false);
    }, 2000);
    return () => clearTimeout(timer);
  }, []);

  const handleConnect = (deviceId: string) => {
    // Update status to connecting
    setDevices(prev => prev.map(d => d.id === deviceId ? { ...d, status: "connecting" } : d));
    
    // Simulate connection success
    setTimeout(() => {
      setDevices(prev => prev.map(d => d.id === deviceId ? { ...d, status: "connected" } : d));
      setConnectedDevice(deviceId);
    }, 1500);
  };

  const handleContinue = () => {
    setLocation("/dashboard");
  };

  return (
    <div className="min-h-screen w-full flex flex-col items-center justify-center bg-slate-950 p-4">
      <NavigationControl variant="back" fallbackRoute="/crew-manager" />
      <motion.div 
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="w-full max-w-md"
      >
        <Card className="border-slate-800 bg-slate-900 shadow-2xl overflow-hidden">
          {/* Header Area */}
          <div className="bg-blue-600 p-6 text-white text-center relative overflow-hidden">
            <div className="absolute top-0 left-0 w-full h-full bg-white/10 opacity-20" style={{ backgroundImage: 'radial-gradient(circle, #fff 1px, transparent 1px)', backgroundSize: '10px 10px' }}></div>
            <div className="relative z-10">
               <div className="w-16 h-16 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center mx-auto mb-3">
                 <Printer className="h-8 w-8 text-white" />
               </div>
               <h2 className="text-2xl font-bold">Equipment Setup</h2>
               <p className="text-blue-100 text-sm">Connect thermal printer for sticker ops</p>
            </div>
          </div>

          <CardContent className="p-6 space-y-6">
            
            {/* Scan Status */}
            <div className="flex items-center justify-between">
              <h3 className="text-slate-400 text-xs font-bold uppercase tracking-wider">
                {isScanning ? "Scanning for devices..." : "Nearby Printers"}
              </h3>
              {isScanning ? (
                <RefreshCw className="h-4 w-4 text-blue-500 animate-spin" />
              ) : (
                <Button 
                  variant="ghost" 
                  size="sm" 
                  className="h-6 text-xs text-blue-400 hover:text-blue-300 p-0"
                  onClick={() => { setIsScanning(true); setDevices([]); }}
                >
                  Scan Again
                </Button>
              )}
            </div>

            {/* Device List */}
            <div className="space-y-3 min-h-[200px]">
              {isScanning ? (
                // Pulse Animation for Scanning
                <div className="flex flex-col items-center justify-center py-12 space-y-4">
                  <div className="relative">
                    <div className="absolute inset-0 bg-blue-500 rounded-full animate-ping opacity-20"></div>
                    <div className="relative w-12 h-12 bg-slate-800 rounded-full flex items-center justify-center border border-slate-700">
                      <Bluetooth className="h-6 w-6 text-blue-500" />
                    </div>
                  </div>
                  <p className="text-slate-500 text-sm">Looking for Bluetooth devices...</p>
                </div>
              ) : (
                // Device List
                devices.map((device) => (
                  <button
                    key={device.id}
                    onClick={() => handleConnect(device.id)}
                    disabled={!!connectedDevice && connectedDevice !== device.id}
                    className={`w-full flex items-center justify-between p-4 rounded-xl border transition-all duration-300 ${
                      device.status === 'connected' 
                        ? 'bg-green-500/10 border-green-500/50' 
                        : device.status === 'connecting'
                        ? 'bg-blue-500/10 border-blue-500/50'
                        : 'bg-slate-800 border-slate-700 hover:border-slate-600'
                    } ${connectedDevice && connectedDevice !== device.id ? 'opacity-50 cursor-not-allowed' : ''}`}
                  >
                    <div className="flex items-center gap-3">
                      <div className={`p-2 rounded-lg ${device.status === 'connected' ? 'bg-green-500' : 'bg-slate-700'}`}>
                         <Printer className={`h-5 w-5 ${device.status === 'connected' ? 'text-white' : 'text-slate-400'}`} />
                      </div>
                      <div className="text-left">
                        <p className={`font-bold text-sm ${device.status === 'connected' ? 'text-green-400' : 'text-white'}`}>
                          {device.name}
                        </p>
                        <div className="flex items-center gap-2">
                          <div className="flex gap-0.5">
                            {[1, 2, 3].map(bar => (
                              <div key={bar} className={`w-1 h-2 rounded-sm ${bar <= device.signal ? 'bg-blue-500' : 'bg-slate-600'}`} />
                            ))}
                          </div>
                          <span className="text-xs text-slate-500">Signal Strength</span>
                        </div>
                      </div>
                    </div>

                    {device.status === 'connecting' && <RefreshCw className="h-5 w-5 text-blue-500 animate-spin" />}
                    {device.status === 'connected' && <Check className="h-5 w-5 text-green-500" />}
                    {device.status === 'available' && <div className="px-3 py-1 bg-slate-700 rounded-full text-xs text-slate-300 font-medium">Pair</div>}
                  </button>
                ))
              )}
            </div>

            {/* Action Footer */}
            <div className="space-y-3 pt-4 border-t border-slate-800">
              <Button 
                className={`w-full h-12 font-bold text-lg transition-all ${
                  connectedDevice 
                    ? 'bg-green-600 hover:bg-green-700 shadow-lg shadow-green-900/20' 
                    : 'bg-slate-800 hover:bg-slate-700 text-slate-400'
                }`}
                onClick={handleContinue}
                disabled={!connectedDevice}
              >
                {connectedDevice ? "Continue to Dashboard" : "Connect a Printer"}
              </Button>
              
              <Button 
                variant="ghost" 
                className="w-full text-slate-500 hover:text-white"
                onClick={handleContinue}
              >
                Skip Setup (View Only)
              </Button>
            </div>

          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}
