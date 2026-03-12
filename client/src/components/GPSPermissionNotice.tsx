import { useState, useEffect } from "react";
import { MapPin, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";

interface GPSPermissionNoticeProps {
  className?: string;
  variant?: "banner" | "card" | "inline";
  dismissible?: boolean;
}

export function GPSPermissionNotice({ 
  className = "", 
  variant = "banner",
  dismissible = true 
}: GPSPermissionNoticeProps) {
  const [dismissed, setDismissed] = useState(false);
  const [hasGPS, setHasGPS] = useState<boolean | null>(null);

  useEffect(() => {
    // Check if browser supports geolocation
    if (navigator.geolocation) {
      navigator.permissions.query({ name: 'geolocation' }).then(permission => {
        setHasGPS(permission.state === 'granted');
      }).catch(() => {
        // Fallback for browsers that don't support permissions API
        setHasGPS(null);
      });
    } else {
      setHasGPS(false);
    }
  }, []);

  if (dismissed || (hasGPS === true && variant !== "banner")) return null;

  const requestGPS = () => {
    navigator.geolocation.getCurrentPosition(
      () => setHasGPS(true),
      () => setHasGPS(false)
    );
  };

  if (variant === "card") {
    return (
      <Card className={`bg-gradient-to-r from-blue-50 to-cyan-50 border-2 border-blue-300 p-4 ${className}`}>
        <div className="flex items-start gap-3">
          <div className="flex-shrink-0 mt-0.5">
            <MapPin className="h-5 w-5 text-blue-600 animate-bounce" />
          </div>
          <div className="flex-1">
            <h3 className="font-bold text-blue-900 mb-1">📍 GPS Required</h3>
            <p className="text-sm text-blue-800 mb-3">
              This app uses GPS to track driver locations, geofence detection, and real-time routing. Please enable location services on your device.
            </p>
            <div className="flex gap-2 flex-wrap">
              <Button 
                onClick={requestGPS}
                className="bg-gradient-to-r from-blue-500 to-cyan-600 hover:from-blue-600 hover:to-cyan-700 text-white font-semibold shadow-lg hover:shadow-xl transform hover:scale-105 active:scale-95 transition-all duration-150"
                size="sm"
              >
                <MapPin className="h-4 w-4 mr-2" />
                Enable GPS
              </Button>
              {dismissible && (
                <Button 
                  onClick={() => setDismissed(true)}
                  variant="outline"
                  size="sm"
                  className="hover:bg-blue-50"
                >
                  Dismiss
                </Button>
              )}
            </div>
          </div>
        </div>
      </Card>
    );
  }

  if (variant === "inline") {
    return (
      <div className={`bg-blue-50 border-l-4 border-blue-500 p-3 rounded mb-4 flex items-start gap-3 ${className}`}>
        <MapPin className="h-5 w-5 text-blue-600 flex-shrink-0 mt-0.5 animate-pulse" />
        <div className="flex-1">
          <p className="text-sm font-semibold text-blue-900">GPS Location Required</p>
          <p className="text-xs text-blue-800 mt-1">
            Enable GPS on your device for real-time driver tracking and route guidance.
          </p>
        </div>
      </div>
    );
  }

  // Default: banner variant
  return (
    <div className={`bg-gradient-to-r from-blue-600 to-cyan-600 text-white px-4 py-3 flex items-center justify-between gap-3 shadow-lg ${className}`}>
      <div className="flex items-center gap-2">
        <MapPin className="h-5 w-5 animate-bounce" />
        <span className="font-semibold text-sm">📍 GPS Location Required for App Operation</span>
      </div>
      <div className="flex gap-2">
        <Button 
          onClick={requestGPS}
          size="sm"
          className="bg-white text-blue-600 font-semibold hover:bg-blue-50 shadow-md hover:shadow-lg transform hover:scale-105 active:scale-95 transition-all duration-150"
        >
          Enable
        </Button>
        {dismissible && (
          <Button 
            onClick={() => setDismissed(true)}
            size="sm"
            variant="outline"
            className="border-white text-white hover:bg-blue-700 hover:text-white"
          >
            ✕
          </Button>
        )}
      </div>
    </div>
  );
}
