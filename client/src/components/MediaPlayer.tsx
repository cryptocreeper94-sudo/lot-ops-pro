import { useState, useEffect, useRef } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Tv, Play, AlertTriangle, Loader2, X } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface MediaInfo {
  platform: "youtube" | "facebook" | "tiktok" | "unknown";
  embedUrl: string;
  title?: string;
}

interface MediaPlayerProps {
  role?: "driver" | "supervisor" | "manager" | "developer";
}

export function MediaPlayer({ role = "driver" }: MediaPlayerProps) {
  const [open, setOpen] = useState(false);
  const [urlInput, setUrlInput] = useState("");
  const [currentMedia, setCurrentMedia] = useState<MediaInfo | null>(null);
  const [isMoving, setIsMoving] = useState(false);
  const [speed, setSpeed] = useState(0);
  const [lastPosition, setLastPosition] = useState<{lat: number, lon: number, timestamp: number} | null>(null);
  const [showRoleInfo, setShowRoleInfo] = useState(true);
  const { toast } = useToast();
  const watchIdRef = useRef<number | null>(null);
  
  // Only allow supervisors, managers, and developers to access YouTube/TikTok
  const isRestricted = role === "driver";
  
  // Show role info on first open only for restricted access
  useEffect(() => {
    if (!isRestricted && open && showRoleInfo) {
      toast({
        title: "Media Player",
        description: "This feature is available for your convenience during breaks. Drivers do not have access to video streaming for safety and focus.",
        variant: "default"
      });
      setShowRoleInfo(false);
    }
  }, [open, isRestricted, showRoleInfo]);

  // Parse URL and extract platform-specific embed info
  const parseMediaUrl = (url: string): MediaInfo | null => {
    try {
      const urlObj = new URL(url);
      
      // YouTube
      if (urlObj.hostname.includes("youtube.com") || urlObj.hostname.includes("youtu.be")) {
        let videoId = "";
        
        if (urlObj.hostname.includes("youtu.be")) {
          videoId = urlObj.pathname.slice(1);
        } else {
          videoId = urlObj.searchParams.get("v") || "";
        }
        
        if (videoId) {
          return {
            platform: "youtube",
            embedUrl: `https://www.youtube.com/embed/${videoId}`,
            title: "YouTube Video"
          };
        }
      }
      
      // Facebook
      if (urlObj.hostname.includes("facebook.com") || urlObj.hostname.includes("fb.watch")) {
        return {
          platform: "facebook",
          embedUrl: `https://www.facebook.com/plugins/video.php?href=${encodeURIComponent(url)}&show_text=0&width=560`,
          title: "Facebook Video"
        };
      }
      
      // TikTok
      if (urlObj.hostname.includes("tiktok.com")) {
        const videoIdMatch = url.match(/\/video\/(\d+)/);
        if (videoIdMatch) {
          return {
            platform: "tiktok",
            embedUrl: `https://www.tiktok.com/embed/v3/${videoIdMatch[1]}`,
            title: "TikTok Video"
          };
        }
      }
      
      return null;
    } catch (error) {
      return null;
    }
  };

  // Calculate speed from GPS positions (in MPH)
  const calculateSpeed = (
    lat1: number, lon1: number, 
    lat2: number, lon2: number, 
    timeDiff: number
  ): number => {
    const R = 3959; // Earth radius in miles
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLon = (lon2 - lon1) * Math.PI / 180;
    const a = 
      Math.sin(dLat/2) * Math.sin(dLat/2) +
      Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
      Math.sin(dLon/2) * Math.sin(dLon/2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    const distance = R * c; // Distance in miles
    const hours = timeDiff / 3600000; // Convert ms to hours
    return distance / hours;
  };

  // GPS motion detection
  useEffect(() => {
    if (open && "geolocation" in navigator) {
      watchIdRef.current = navigator.geolocation.watchPosition(
        (position) => {
          const currentPos = {
            lat: position.coords.latitude,
            lon: position.coords.longitude,
            timestamp: position.timestamp
          };

          if (lastPosition) {
            const timeDiff = currentPos.timestamp - lastPosition.timestamp;
            if (timeDiff > 0) {
              const calculatedSpeed = calculateSpeed(
                lastPosition.lat,
                lastPosition.lon,
                currentPos.lat,
                currentPos.lon,
                timeDiff
              );
              
              setSpeed(calculatedSpeed);
              // Consider moving if speed > 3 MPH
              setIsMoving(calculatedSpeed > 3);
            }
          }

          setLastPosition(currentPos);
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
    }

    return () => {
      if (watchIdRef.current !== null) {
        navigator.geolocation.clearWatch(watchIdRef.current);
      }
    };
  }, [open, lastPosition]);

  // Stop playback when moving
  useEffect(() => {
    if (isMoving && currentMedia) {
      setCurrentMedia(null);
      toast({
        title: "Playback Stopped",
        description: "Media playback disabled while vehicle is moving for safety.",
        variant: "destructive"
      });
    }
  }, [isMoving]);

  const handleLoadMedia = () => {
    if (!urlInput.trim()) {
      toast({
        title: "No URL",
        description: "Please enter a video URL",
        variant: "destructive"
      });
      return;
    }

    if (isMoving) {
      toast({
        title: "Vehicle Moving",
        description: "Media can only be played when stationary for safety.",
        variant: "destructive"
      });
      return;
    }

    const media = parseMediaUrl(urlInput.trim());
    
    if (media) {
      setCurrentMedia(media);
      toast({
        title: "Loading Media",
        description: `Playing ${media.platform} video`,
      });
    } else {
      toast({
        title: "Unsupported URL",
        description: "Please use a YouTube, Facebook, or TikTok link",
        variant: "destructive"
      });
    }
  };

  const clearMedia = () => {
    setCurrentMedia(null);
    setUrlInput("");
  };

  // Don't render media player for drivers
  if (isRestricted) {
    return null;
  }
  
  return (
    <>
      {/* Floating Media Button - positioned above News button */}
      <Button
        onClick={() => setOpen(true)}
        className="fixed bottom-36 left-4 bg-red-600/90 hover:bg-red-700 text-white rounded-xl px-3 py-2 shadow-lg z-50 flex items-center gap-2"
        data-testid="button-media-player"
        title="Media Player - Supervisors & Managers Only"
      >
        <Tv className="h-5 w-5" />
        <div className="text-left">
          <div className="text-sm font-bold">Media</div>
          <div className="text-[10px] text-red-200">Player</div>
        </div>
      </Button>

      {/* Media Player Dialog */}
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-4xl h-[700px] flex flex-col">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Tv className="h-5 w-5 text-red-600" />
              Media Player
              {isMoving && (
                <Badge variant="destructive" className="ml-auto flex items-center gap-1">
                  <AlertTriangle className="h-3 w-3" />
                  Vehicle Moving ({speed.toFixed(1)} MPH)
                </Badge>
              )}
              {!isMoving && (
                <Badge variant="outline" className="ml-auto">
                  Stationary - Safe to Play
                </Badge>
              )}
            </DialogTitle>
            <DialogDescription className="sr-only">
              Watch YouTube, Facebook, and TikTok videos. Playback automatically stops when vehicle is in motion for safety.
            </DialogDescription>
          </DialogHeader>
          
          {/* Feature Availability Notice */}
          <div className="bg-blue-600/10 border border-blue-600/30 rounded-lg p-3 flex items-start gap-3">
            <AlertTriangle className="h-5 w-5 text-blue-600 flex-shrink-0 mt-0.5" />
            <div className="flex-1 text-sm">
              <p className="font-semibold text-blue-600">For Supervisors & Managers Only</p>
              <p className="text-muted-foreground mt-1">
                This media player is available for your convenience during breaks and downtime. Van drivers do not have access to video streaming to maintain focus and safety on operations.
              </p>
            </div>
          </div>

          {/* Safety Warning Banner */}
          <div className="bg-red-600/10 border border-red-600/30 rounded-lg p-3 flex items-start gap-3">
            <AlertTriangle className="h-5 w-5 text-red-600 flex-shrink-0 mt-0.5" />
            <div className="flex-1 text-sm">
              <p className="font-semibold text-red-600">Safety Notice</p>
              <p className="text-muted-foreground mt-1">
                Media playback is disabled while driving. The player will automatically stop if vehicle motion is detected.
              </p>
            </div>
          </div>

          {/* URL Input */}
          <div className="flex gap-2">
            <Input
              value={urlInput}
              onChange={(e) => setUrlInput(e.target.value)}
              placeholder="Paste YouTube, Facebook, or TikTok URL (When vehicle is stationary)..."
              disabled={isMoving}
              onKeyDown={(e) => e.key === "Enter" && handleLoadMedia()}
              className="flex-1"
              data-testid="input-media-url"
            />
            <Button
              onClick={handleLoadMedia}
              disabled={!urlInput.trim() || isMoving}
              data-testid="button-load-media"
            >
              <Play className="h-4 w-4 mr-2" />
              Load
            </Button>
            {currentMedia && (
              <Button
                variant="destructive"
                onClick={clearMedia}
                data-testid="button-clear-media"
              >
                <X className="h-4 w-4" />
              </Button>
            )}
          </div>

          {/* Player Area */}
          <div className="flex-1 bg-slate-900 rounded-lg overflow-hidden flex items-center justify-center">
            {!currentMedia && !isMoving && (
              <div className="text-center text-slate-400 p-8">
                <Tv className="h-16 w-16 mx-auto mb-4 opacity-50" />
                <p className="font-semibold mb-2">Ready to Play</p>
                <p className="text-sm">Paste a video URL above to get started</p>
                <div className="mt-4 text-xs space-y-1">
                  <p>✓ YouTube videos</p>
                  <p>✓ Facebook videos</p>
                  <p>✓ TikTok videos</p>
                </div>
              </div>
            )}
            
            {!currentMedia && isMoving && (
              <div className="text-center text-red-400 p-8">
                <AlertTriangle className="h-16 w-16 mx-auto mb-4 animate-pulse" />
                <p className="font-semibold mb-2">Vehicle in Motion</p>
                <p className="text-sm">Media playback disabled for safety</p>
                <p className="text-xs mt-4">Current speed: {speed.toFixed(1)} MPH</p>
                <p className="text-xs text-slate-400 mt-2">Come to a complete stop to watch media</p>
              </div>
            )}

            {currentMedia && !isMoving && (
              <div className="w-full h-full">
                {currentMedia.platform === "youtube" && (
                  <iframe
                    src={currentMedia.embedUrl}
                    className="w-full h-full"
                    frameBorder="0"
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    allowFullScreen
                    title="YouTube Video"
                  />
                )}
                
                {currentMedia.platform === "facebook" && (
                  <iframe
                    src={currentMedia.embedUrl}
                    className="w-full h-full"
                    frameBorder="0"
                    allow="autoplay; clipboard-write; encrypted-media; picture-in-picture; web-share"
                    allowFullScreen
                    title="Facebook Video"
                  />
                )}
                
                {currentMedia.platform === "tiktok" && (
                  <div className="w-full h-full flex items-center justify-center bg-black">
                    <iframe
                      src={currentMedia.embedUrl}
                      className="max-w-[325px] max-h-[575px]"
                      frameBorder="0"
                      allow="encrypted-media;"
                      allowFullScreen
                      title="TikTok Video"
                      style={{ width: "325px", height: "575px" }}
                    />
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Safety Notice */}
          <div className="text-xs text-muted-foreground text-center pt-2 border-t">
            <AlertTriangle className="h-3 w-3 inline mr-1" />
            For your safety, media automatically stops when vehicle motion is detected
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
