// GPS Geofencing for Manheim Nashville (263 acres)
// Prevents live data entry when outside facility boundaries

interface Coordinates {
  lat: number;
  lng: number;
}

// Manheim Nashville Auto Auction - 5400 County Hospital Rd, Nashville, TN 37218
// Approximate facility boundaries (263 acres ≈ 1.06 km²)
const MANHEIM_NASHVILLE_BOUNDS = {
  // Center point of facility
  center: { lat: 36.2089, lng: -86.7425 },
  
  // Boundary polygon (rough rectangle covering 263 acres)
  polygon: [
    { lat: 36.2150, lng: -86.7500 }, // Northwest corner
    { lat: 36.2150, lng: -86.7350 }, // Northeast corner
    { lat: 36.2028, lng: -86.7350 }, // Southeast corner
    { lat: 36.2028, lng: -86.7500 }, // Southwest corner
  ],
  
  // Generous radius buffer to cover entire property including perimeter areas
  // 1200m (~0.75 miles) ensures workers near gates/fences aren't flagged as outside
  radiusMeters: 1200, // 263 acres base + large buffer for GPS accuracy & perimeter work
};

/**
 * Calculate distance between two GPS coordinates using Haversine formula
 * Returns distance in meters
 */
function getDistanceInMeters(point1: Coordinates, point2: Coordinates): number {
  const R = 6371e3; // Earth's radius in meters
  const φ1 = (point1.lat * Math.PI) / 180;
  const φ2 = (point2.lat * Math.PI) / 180;
  const Δφ = ((point2.lat - point1.lat) * Math.PI) / 180;
  const Δλ = ((point2.lng - point1.lng) * Math.PI) / 180;

  const a =
    Math.sin(Δφ / 2) * Math.sin(Δφ / 2) +
    Math.cos(φ1) * Math.cos(φ2) * Math.sin(Δλ / 2) * Math.sin(Δλ / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

  return R * c;
}

/**
 * Check if a point is inside a polygon using ray-casting algorithm
 */
function isPointInPolygon(point: Coordinates, polygon: Coordinates[]): boolean {
  let inside = false;
  for (let i = 0, j = polygon.length - 1; i < polygon.length; j = i++) {
    const xi = polygon[i].lat, yi = polygon[i].lng;
    const xj = polygon[j].lat, yj = polygon[j].lng;

    const intersect =
      yi > point.lng !== yj > point.lng &&
      point.lat < ((xj - xi) * (point.lng - yi)) / (yj - yi) + xi;
    if (intersect) inside = !inside;
  }
  return inside;
}

/**
 * Check if user is within Manheim Nashville facility boundaries
 * Returns true if inside facility, false if outside
 */
export function isWithinFacilityBounds(lat: number, lng: number): boolean {
  const userLocation = { lat, lng };
  
  // Method 1: Check if within radius from center point
  const distanceFromCenter = getDistanceInMeters(
    userLocation,
    MANHEIM_NASHVILLE_BOUNDS.center
  );
  
  if (distanceFromCenter <= MANHEIM_NASHVILLE_BOUNDS.radiusMeters) {
    return true;
  }
  
  // Method 2: Check if within polygon boundary
  return isPointInPolygon(userLocation, MANHEIM_NASHVILLE_BOUNDS.polygon);
}

/**
 * Get current GPS position
 * Returns promise with coordinates or null if unavailable
 */
export function getCurrentPosition(): Promise<Coordinates | null> {
  return new Promise((resolve) => {
    if (!navigator.geolocation) {
      console.warn("Geolocation not supported by browser");
      resolve(null);
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        resolve({
          lat: position.coords.latitude,
          lng: position.coords.longitude,
        });
      },
      (error) => {
        console.error("Geolocation error:", error);
        resolve(null);
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 0,
      }
    );
  });
}

/**
 * Check if user should be forced into Demo Mode
 * Returns true if outside facility OR if GPS unavailable
 */
export async function shouldForceDemoMode(): Promise<{
  forceDemoMode: boolean;
  reason: string;
  location?: Coordinates;
}> {
  const position = await getCurrentPosition();
  
  if (!position) {
    return {
      forceDemoMode: true,
      reason: "GPS unavailable - Demo Mode required for safety",
    };
  }
  
  const withinBounds = isWithinFacilityBounds(position.lat, position.lng);
  
  if (!withinBounds) {
    const distance = getDistanceInMeters(
      position,
      MANHEIM_NASHVILLE_BOUNDS.center
    );
    
    return {
      forceDemoMode: true,
      reason: `Outside facility (${Math.round(distance)}m away) - Demo Mode only`,
      location: position,
    };
  }
  
  return {
    forceDemoMode: false,
    reason: "Within facility boundaries",
    location: position,
  };
}

/**
 * Get distance from facility center (for display purposes)
 */
export async function getDistanceFromFacility(): Promise<number | null> {
  const position = await getCurrentPosition();
  if (!position) return null;
  
  return getDistanceInMeters(position, MANHEIM_NASHVILLE_BOUNDS.center);
}
