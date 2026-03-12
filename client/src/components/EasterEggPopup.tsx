import { useState, useEffect } from "react";
import { X, Camera } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

interface DriverProfile {
  driverNumber: string;
  name: string;
  profilePhoto?: string;
  funnyBio?: string;
}

// Hilarious lot driver bios - customize these for your crew!
const FUNNY_BIOS: Record<string, string> = {
  "142": "The Speed Demon 🏎️ - Stops at stop bars you can't even see. On rainy nights? Forget it, he's counting lane numbers by SMELL.",
  "201": "Mr. Precision 📐 - Parallel parks in the dark, dodges Lot Ninjas, AND stops at invisible stop bars. Overachiever much?",
  "158": "The GPS Whisperer 🧭 - Never gets lost even when it's raining and you can't read the lane numbers. Probably has sonar.",
  "Teresa": "The All-Seeing Eye 👁️ - Knows you're on break before you do. Can count lane spots in a thunderstorm. WITH her eyes closed.",
  "7777": "The Legend 🌟 - Been here so long, he PAINTED the stop bars. On rainy nights, other drivers ask HIM where the lanes are.",
  "5555": "The Wildcard 🃏 - Stops at stop bars that don't exist yet. Avoids Lot Ninjas like they're wearing high-vis. It's a gift.",
  "8842": "The Speedster ⚡ - Hall of Fame Lot Ninja dodger. Treats invisible stop bars like they're outlined in neon. Show-off.",
  "3333": "The Scanner Master 📱 - Scans VINs in the rain, counts invisible lane numbers, sees Transporters in the dark. Basically a superhero.",
  "default": "Future lot legend! 🚗 Already mastering invisible stop bars and dodging Lot Ninjas like a pro!"
};

interface EasterEggProps {
  currentDriverNumber: string;
  userRole?: string;
}

export function EasterEggPopup({ currentDriverNumber, userRole }: EasterEggProps) {
  const [showPopup, setShowPopup] = useState(false);
  const [randomDriver, setRandomDriver] = useState<DriverProfile | null>(null);

  useEffect(() => {
    // Check if easter eggs are enabled for this role
    const isDriver = !userRole || userRole === "van_driver" || userRole === "inventory_driver";
    const managementEnabled = localStorage.getItem("lotops_easter_eggs_enabled") === "true";
    
    // Always enabled for drivers, optional for management/supervisors
    if (!isDriver && !managementEnabled) {
      return; // Don't schedule popups for management unless they've opted in
    }

    // Random popup every 15-30 minutes
    const minInterval = 15 * 60 * 1000; // 15 minutes
    const maxInterval = 30 * 60 * 1000; // 30 minutes
    
    const scheduleNextPopup = () => {
      const randomDelay = Math.random() * (maxInterval - minInterval) + minInterval;
      
      setTimeout(() => {
        fetchRandomDriver();
        scheduleNextPopup(); // Schedule the next one
      }, randomDelay);
    };

    scheduleNextPopup();
  }, [currentDriverNumber, userRole]);

  const fetchRandomDriver = async () => {
    try {
      const response = await fetch("/api/drivers");
      const drivers = await response.json();
      
      // Filter out the current driver (don't show your own face!)
      const otherDrivers = drivers.filter((d: any) => 
        d.driverNumber !== currentDriverNumber && d.profilePhoto
      );
      
      if (otherDrivers.length > 0) {
        const random = otherDrivers[Math.floor(Math.random() * otherDrivers.length)];
        
        setRandomDriver({
          driverNumber: random.driverNumber,
          name: random.name,
          profilePhoto: random.profilePhoto,
          funnyBio: FUNNY_BIOS[random.driverNumber] || FUNNY_BIOS.default
        });
        
        setShowPopup(true);
        
        // Auto-hide after 8 seconds
        setTimeout(() => setShowPopup(false), 8000);
      }
    } catch (error) {
      console.error("Failed to fetch random driver:", error);
    }
  };

  if (!showPopup || !randomDriver) return null;

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm animate-in fade-in duration-300"
      onClick={() => setShowPopup(false)}
      data-testid="easter-egg-popup"
    >
      <Card 
        className="w-80 bg-gradient-to-br from-blue-600 to-purple-600 border-2 border-white/30 shadow-2xl animate-in zoom-in duration-300"
        onClick={(e) => e.stopPropagation()}
      >
        <CardContent className="p-6 text-center">
          <Button
            variant="ghost"
            size="icon"
            className="absolute top-2 right-2 text-white hover:bg-white/20"
            onClick={() => setShowPopup(false)}
            data-testid="button-close-easter-egg"
          >
            <X className="h-4 w-4" />
          </Button>

          {/* Profile Photo */}
          <div className="relative mb-4">
            {randomDriver.profilePhoto ? (
              <img
                src={randomDriver.profilePhoto}
                alt={randomDriver.name}
                className="w-32 h-32 rounded-full mx-auto border-4 border-white shadow-lg object-cover"
                data-testid="img-driver-photo"
              />
            ) : (
              <div className="w-32 h-32 rounded-full mx-auto border-4 border-white shadow-lg bg-gradient-to-br from-slate-700 to-slate-900 flex items-center justify-center">
                <Camera className="h-12 w-12 text-white/50" />
              </div>
            )}
            
            {/* Fun badge */}
            <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 bg-yellow-400 text-yellow-900 px-3 py-1 rounded-full text-xs font-bold shadow-lg">
              #{randomDriver.driverNumber}
            </div>
          </div>

          {/* Driver Name */}
          <h3 className="text-2xl font-bold text-white mb-2">
            {randomDriver.name}
          </h3>

          {/* Funny Bio */}
          <p className="text-white/90 text-sm italic leading-relaxed mb-4">
            "{randomDriver.funnyBio}"
          </p>

          {/* Close button */}
          <Button
            onClick={() => setShowPopup(false)}
            className="bg-white text-blue-600 hover:bg-white/90 font-bold"
            data-testid="button-dismiss-popup"
          >
            Keep Working! 🚗
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
