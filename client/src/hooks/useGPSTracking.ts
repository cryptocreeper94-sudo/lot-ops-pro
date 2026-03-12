import { useEffect, useRef } from 'react';

interface UseGPSTrackingProps {
  driverNumber: string;
  enabled: boolean;
  interval?: number; // milliseconds, default 60000 (1 minute)
}

export function useGPSTracking({ driverNumber, enabled, interval = 60000 }: UseGPSTrackingProps) {
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  const sendGPSUpdate = async () => {
    if (!navigator.geolocation) {
      console.warn('GPS not available');
      return;
    }

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        try {
          await fetch(`/api/drivers/${driverNumber}/gps`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              latitude: position.coords.latitude.toString(),
              longitude: position.coords.longitude.toString(),
            }),
          });
        } catch (error) {
          console.error('Failed to send GPS update:', error);
        }
      },
      (error) => {
        console.error('GPS error:', error);
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 0,
      }
    );
  };

  useEffect(() => {
    if (!enabled || !driverNumber) return;

    // Send initial GPS update
    sendGPSUpdate();

    // Set up interval for periodic updates
    intervalRef.current = setInterval(sendGPSUpdate, interval);

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [driverNumber, enabled, interval]);

  return { sendGPSUpdate };
}
