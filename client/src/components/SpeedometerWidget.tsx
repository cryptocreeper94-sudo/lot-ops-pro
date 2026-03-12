import { useState, useEffect } from "react";
import { Gauge, AlertTriangle } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";

interface SpeedometerWidgetProps {
  onSpeedChange?: (speed: number) => void;
  driverNumber?: string;
  driverName?: string;
}

export function SpeedometerWidget({ onSpeedChange, driverNumber, driverName }: SpeedometerWidgetProps) {
  const [speed, setSpeed] = useState<number>(0);
  const [isTracking, setIsTracking] = useState(false);
  const [lastViolation, setLastViolation] = useState<number | null>(null);
  const [lastEmergencyAlert, setLastEmergencyAlert] = useState<number | null>(null);
  const [currentGPS, setCurrentGPS] = useState<{ lat: number; lng: number } | null>(null);

  useEffect(() => {
    if (!navigator.geolocation) {
      console.log("Geolocation not supported");
      return;
    }

    const watchId = navigator.geolocation.watchPosition(
      (position) => {
        // Speed is in meters/second, convert to MPH
        const speedMPS = position.coords.speed || 0;
        const speedMPH = Math.max(0, speedMPS * 2.237); // m/s to mph
        
        // Store GPS coordinates
        const gps = {
          lat: position.coords.latitude,
          lng: position.coords.longitude
        };
        setCurrentGPS(gps);
        
        setSpeed(Math.round(speedMPH));
        setIsTracking(true);
        
        // Callback for parent component (e.g., to hide Request Pickup)
        if (onSpeedChange) {
          onSpeedChange(speedMPH);
        }

        // 🚨 CRITICAL ALERT: 22mph+ sends immediate alert to Teresa
        if (speedMPH >= 22 && (!lastEmergencyAlert || Date.now() - lastEmergencyAlert > 60000)) {
          // Only send emergency alert once per minute to avoid spam
          setLastEmergencyAlert(Date.now());
          sendEmergencySpeedAlert(speedMPH, gps);
        }

        // Regular logging (>17mph) - database only
        if (speedMPH > 17 && (!lastViolation || Date.now() - lastViolation > 30000)) {
          // Only log once per 30 seconds to avoid spam
          setLastViolation(Date.now());
          logSpeedingViolation(speedMPH, gps);
        }
      },
      (error) => {
        console.error("GPS tracking error:", error);
        setIsTracking(false);
      },
      {
        enableHighAccuracy: true,
        maximumAge: 1000,
        timeout: 5000
      }
    );

    return () => {
      navigator.geolocation.clearWatch(watchId);
    };
  }, [onSpeedChange, lastViolation]);

  const logSpeedingViolation = async (currentSpeed: number, gps: { lat: number; lng: number }) => {
    try {
      await fetch('/api/speed/violations', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          driverNumber: driverNumber || 'unknown',
          driverName: driverName || 'Unknown Driver',
          speed: currentSpeed,
          speedLimit: 15,
          location: `${gps.lat.toFixed(6)}, ${gps.lng.toFixed(6)}`,
          timestamp: new Date().toISOString()
        })
      });
    } catch (error) {
      console.error("Failed to log speeding violation:", error);
    }
  };

  const sendEmergencySpeedAlert = async (currentSpeed: number, gps: { lat: number; lng: number }) => {
    try {
      // Send immediate emergency alert to Teresa
      await fetch('/api/speed/emergency-alert', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          driverNumber: driverNumber || 'unknown',
          driverName: driverName || 'Unknown Driver',
          speed: currentSpeed,
          gpsLat: gps.lat,
          gpsLng: gps.lng,
          timestamp: new Date().toISOString()
        })
      });
      
      console.log(`🚨 EMERGENCY SPEED ALERT sent to Teresa: ${driverName} @ ${currentSpeed}mph`);
    } catch (error) {
      console.error("Failed to send emergency speed alert:", error);
    }
  };

  const getSpeedColor = () => {
    if (speed === 0) return "bg-slate-600";
    if (speed <= 15) return "bg-green-600";
    if (speed <= 17) return "bg-yellow-600";
    return "bg-red-600";
  };

  const getSpeedStatus = () => {
    if (speed === 0) return "Stopped";
    if (speed <= 15) return "Safe";
    if (speed <= 17) return "Caution";
    return "OVER LIMIT!";
  };

  return (
    <Card className={`fixed top-4 right-4 ${getSpeedColor()} border-2 border-white shadow-2xl z-40`}>
      <CardContent className="p-3">
        <div className="flex items-center gap-3">
          <Gauge className="h-6 w-6 text-white" />
          <div className="text-white">
            <div className="text-3xl font-bold leading-none">{speed}</div>
            <div className="text-xs opacity-90">MPH</div>
          </div>
          <div className="border-l border-white/30 pl-3">
            <div className="text-white font-medium text-sm">{getSpeedStatus()}</div>
            <div className="text-xs text-white/70">Limit: 15 MPH</div>
          </div>
        </div>
        
        {speed > 17 && (
          <div className="flex items-center gap-1 mt-2 bg-red-900/50 rounded px-2 py-1">
            <AlertTriangle className="h-3 w-3 text-white animate-pulse" />
            <span className="text-xs text-white font-bold">SLOW DOWN!</span>
          </div>
        )}
        
        {!isTracking && (
          <Badge variant="outline" className="mt-2 text-xs bg-slate-800 text-white border-white/30">
            GPS initializing...
          </Badge>
        )}
      </CardContent>
    </Card>
  );
}
