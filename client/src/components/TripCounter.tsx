import { useState, useEffect, useRef } from "react";
import { Card } from "@/components/ui/card";
import { Navigation } from "lucide-react";

interface TripCounterProps {
  driverNumber: string;
  isActive?: boolean;
}

export function TripCounter({ driverNumber, isActive = true }: TripCounterProps) {
  const [totalMiles, setTotalMiles] = useState(0);
  const [currentSpeed, setCurrentSpeed] = useState(0);
  const lastPositionRef = useRef<{ lat: number; lng: number } | null>(null);
  const lastSaveRef = useRef<number>(0);

  // Save mileage to database every 30 seconds
  useEffect(() => {
    if (!isActive || totalMiles === 0) return;

    const saveInterval = setInterval(async () => {
      try {
        await fetch(`/api/drivers/${driverNumber}/mileage`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ milesDriven: totalMiles })
        });
        lastSaveRef.current = totalMiles;
      } catch (error) {
        console.error("Failed to save mileage:", error);
      }
    }, 30000); // Save every 30 seconds

    return () => clearInterval(saveInterval);
  }, [totalMiles, driverNumber, isActive]);

  useEffect(() => {
    if (!isActive) return;

    const watchId = navigator.geolocation.watchPosition(
      (position) => {
        const currentPos = {
          lat: position.coords.latitude,
          lng: position.coords.longitude
        };

        setCurrentSpeed(position.coords.speed ? position.coords.speed * 2.237 : 0); // m/s to mph

        if (lastPositionRef.current) {
          const distance = calculateDistance(
            lastPositionRef.current.lat,
            lastPositionRef.current.lng,
            currentPos.lat,
            currentPos.lng
          );

          // Only count if distance is reasonable (not GPS jump error)
          if (distance > 0 && distance < 0.5) { // Max 0.5 miles between updates
            setTotalMiles(prev => prev + distance);
          }
        }

        lastPositionRef.current = currentPos;
      },
      (error) => {
        console.error("GPS error:", error);
      },
      {
        enableHighAccuracy: true,
        timeout: 5000,
        maximumAge: 0
      }
    );

    return () => {
      navigator.geolocation.clearWatch(watchId);
    };
  }, [isActive]);

  // Haversine formula to calculate distance between two GPS coordinates in miles
  const calculateDistance = (lat1: number, lon1: number, lat2: number, lon2: number): number => {
    const R = 3959; // Earth's radius in miles
    const dLat = toRad(lat2 - lat1);
    const dLon = toRad(lon2 - lon1);
    
    const a = 
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * 
      Math.sin(dLon / 2) * Math.sin(dLon / 2);
    
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    const distance = R * c;
    
    return distance;
  };

  const toRad = (degrees: number): number => {
    return degrees * (Math.PI / 180);
  };

  return (
    <Card className="bg-gradient-to-br from-purple-950 to-purple-900 border-purple-600 p-3">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Navigation className="h-5 w-5 text-purple-300" />
          <div>
            <div className="text-xs text-purple-300 font-medium">Trip Odometer</div>
            <div className="text-2xl font-bold text-white">
              {totalMiles.toFixed(1)} <span className="text-sm text-purple-300">mi</span>
            </div>
          </div>
        </div>
        
        <div className="text-right">
          <div className="text-xs text-purple-300">Current Speed</div>
          <div className="text-lg font-semibold text-white">
            {Math.round(currentSpeed)} <span className="text-xs text-purple-300">mph</span>
          </div>
        </div>
      </div>
    </Card>
  );
}
