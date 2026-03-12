import { useState, useEffect, useRef, useCallback } from "react";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Loader2, X, Download, Maximize2, Minimize2, Upload } from "lucide-react";
import { cn } from "@/lib/utils";

interface FloatingEmblemProps {
  src: string;
  alt?: string;
  className?: string;
  size?: "sm" | "md" | "lg" | "xl";
  position?: "top-left" | "top-right" | "bottom-left" | "bottom-right" | "center";
  adaptiveMode?: "auto" | "light" | "dark" | "blend";
  showControls?: boolean;
  watermark?: boolean;
  opacity?: number;
  onClick?: () => void;
  onBackgroundRemoved?: (newSrc: string) => void;
}

const sizeClasses = {
  sm: "w-12 h-12",
  md: "w-20 h-20",
  lg: "w-32 h-32",
  xl: "w-48 h-48"
};

const positionClasses = {
  "top-left": "top-4 left-4",
  "top-right": "top-4 right-4",
  "bottom-left": "bottom-4 left-4",
  "bottom-right": "bottom-4 right-4",
  "center": "top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2"
};

export function FloatingEmblem({
  src,
  alt = "Emblem",
  className,
  size = "md",
  position,
  adaptiveMode = "auto",
  showControls = false,
  watermark = false,
  opacity = 1,
  onClick,
  onBackgroundRemoved
}: FloatingEmblemProps) {
  const [processedSrc, setProcessedSrc] = useState(src);
  const [isProcessing, setIsProcessing] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);
  const [backgroundType, setBackgroundType] = useState<"light" | "dark">("light");
  const containerRef = useRef<HTMLDivElement>(null);

  // Detect background color behind the emblem
  useEffect(() => {
    if (adaptiveMode === "auto" && containerRef.current) {
      const detectBackground = () => {
        const parent = containerRef.current?.parentElement;
        if (parent) {
          const computedStyle = window.getComputedStyle(parent);
          const bgColor = computedStyle.backgroundColor;
          
          // Parse RGB values
          const match = bgColor.match(/\d+/g);
          if (match) {
            const [r, g, b] = match.map(Number);
            const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255;
            setBackgroundType(luminance > 0.5 ? "light" : "dark");
          }
        }
      };
      
      detectBackground();
      const observer = new MutationObserver(detectBackground);
      observer.observe(document.body, { attributes: true, subtree: true });
      
      return () => observer.disconnect();
    } else if (adaptiveMode === "light") {
      setBackgroundType("light");
    } else if (adaptiveMode === "dark") {
      setBackgroundType("dark");
    }
  }, [adaptiveMode]);

  // Remove background using rembg API
  const removeBackground = useCallback(async () => {
    if (!src || isProcessing) return;
    
    setIsProcessing(true);
    
    try {
      let base64: string;
      
      // Check if already a data URL
      if (src.startsWith('data:image/')) {
        base64 = src;
      } else {
        // Convert image URL to base64
        const response = await fetch(src);
        if (!response.ok) {
          throw new Error(`Failed to fetch image: ${response.status}`);
        }
        const blob = await response.blob();
        
        base64 = await new Promise<string>((resolve, reject) => {
          const reader = new FileReader();
          reader.onloadend = () => resolve(reader.result as string);
          reader.onerror = () => reject(new Error('Failed to read image'));
          reader.readAsDataURL(blob);
        });
      }
      
      const apiResponse = await fetch("/api/remove-background", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ image: base64 })
      });
      
      if (!apiResponse.ok) {
        const errorData = await apiResponse.json().catch(() => ({}));
        throw new Error(errorData.message || `API error: ${apiResponse.status}`);
      }
      
      const result = await apiResponse.json();
      
      if (result.success && result.image) {
        setProcessedSrc(result.image);
        onBackgroundRemoved?.(result.image);
      } else {
        throw new Error(result.message || 'Background removal failed');
      }
    } catch (error) {
      console.error("Background removal failed:", error);
      // Keep original image on failure
    } finally {
      setIsProcessing(false);
    }
  }, [src, isProcessing, onBackgroundRemoved]);

  // Get adaptive styles based on background
  const getAdaptiveStyles = () => {
    if (adaptiveMode === "blend") {
      return {
        mixBlendMode: "multiply" as const,
        filter: "none"
      };
    }
    
    if (backgroundType === "dark") {
      return {
        filter: "drop-shadow(0 0 8px rgba(255,255,255,0.3))",
        mixBlendMode: "normal" as const
      };
    }
    
    return {
      filter: "drop-shadow(0 2px 4px rgba(0,0,0,0.2))",
      mixBlendMode: "normal" as const
    };
  };

  const adaptiveStyles = getAdaptiveStyles();

  // Watermark mode styling
  const watermarkStyles: React.CSSProperties = watermark ? {
    opacity: opacity * 0.15,
    pointerEvents: "none",
    userSelect: "none",
    position: "fixed",
    zIndex: 1
  } : {};

  // Position styling for fixed/absolute positioning
  const positionStyles: React.CSSProperties = position ? {
    position: watermark ? "fixed" : "absolute",
  } : {};

  return (
    <>
      <div
        ref={containerRef}
        data-testid="floating-emblem"
        className={cn(
          "relative inline-block transition-all duration-300",
          position && positionClasses[position],
          sizeClasses[size],
          !watermark && "cursor-pointer hover:scale-105",
          className
        )}
        style={{
          ...positionStyles,
          ...watermarkStyles,
          opacity: watermark ? opacity * 0.15 : opacity
        }}
        onClick={onClick || (showControls ? () => setIsExpanded(true) : undefined)}
      >
        {/* Main Image */}
        <img
          src={processedSrc}
          alt={alt}
          className={cn(
            "w-full h-full object-contain",
            isProcessing && "opacity-50"
          )}
          style={{
            filter: adaptiveStyles.filter,
            mixBlendMode: adaptiveStyles.mixBlendMode
          }}
          draggable={false}
        />
        
        {/* Processing Indicator */}
        {isProcessing && (
          <div className="absolute inset-0 flex items-center justify-center bg-black/20 rounded-lg">
            <Loader2 className="w-6 h-6 animate-spin text-white" />
          </div>
        )}
        
        {/* Quick Controls (on hover) */}
        {showControls && !watermark && !isProcessing && (
          <div className="absolute inset-0 flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity bg-black/40 rounded-lg">
            <Button
              size="sm"
              variant="ghost"
              className="text-white hover:bg-white/20"
              onClick={(e) => {
                e.stopPropagation();
                setIsExpanded(true);
              }}
            >
              <Maximize2 className="w-4 h-4" />
            </Button>
          </div>
        )}
      </div>

      {/* Expanded View Dialog */}
      <Dialog open={isExpanded} onOpenChange={setIsExpanded}>
        <DialogContent className="max-w-2xl bg-gradient-to-br from-slate-900 to-slate-800 border-slate-700">
          <div className="space-y-4">
            {/* Large Preview */}
            <div className="relative bg-checkered rounded-lg p-8 flex items-center justify-center min-h-[300px]">
              <img
                src={processedSrc}
                alt={alt}
                className="max-w-full max-h-[400px] object-contain"
                style={{
                  filter: adaptiveStyles.filter
                }}
              />
              
              {isProcessing && (
                <div className="absolute inset-0 flex items-center justify-center bg-black/50 rounded-lg">
                  <div className="text-center text-white">
                    <Loader2 className="w-12 h-12 animate-spin mx-auto mb-2" />
                    <p>Removing background...</p>
                  </div>
                </div>
              )}
            </div>
            
            {/* Controls */}
            <div className="flex flex-wrap gap-2 justify-center">
              <Button
                onClick={removeBackground}
                disabled={isProcessing}
                className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700"
              >
                {isProcessing ? (
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                ) : (
                  <Upload className="w-4 h-4 mr-2" />
                )}
                Remove Background
              </Button>
              
              <Button
                onClick={() => {
                  const link = document.createElement('a');
                  link.download = `${alt.replace(/\s+/g, '-').toLowerCase()}-transparent.png`;
                  link.href = processedSrc;
                  link.click();
                }}
                variant="outline"
                className="border-slate-600 text-slate-200 hover:bg-slate-700"
              >
                <Download className="w-4 h-4 mr-2" />
                Download PNG
              </Button>
              
              <Button
                onClick={() => setIsExpanded(false)}
                variant="ghost"
                className="text-slate-400 hover:text-white hover:bg-slate-700"
              >
                <X className="w-4 h-4 mr-2" />
                Close
              </Button>
            </div>
            
            {/* Background Preview Options */}
            <div className="flex gap-2 justify-center pt-2 border-t border-slate-700">
              <span className="text-slate-400 text-sm mr-2 self-center">Preview on:</span>
              <button
                className="w-8 h-8 rounded bg-white border-2 border-slate-600 hover:border-blue-400"
                onClick={() => setBackgroundType("light")}
                title="Light background"
              />
              <button
                className="w-8 h-8 rounded bg-slate-900 border-2 border-slate-600 hover:border-blue-400"
                onClick={() => setBackgroundType("dark")}
                title="Dark background"
              />
              <button
                className="w-8 h-8 rounded bg-gradient-to-br from-blue-500 to-purple-500 border-2 border-slate-600 hover:border-blue-400"
                title="Gradient background"
              />
            </div>
          </div>
        </DialogContent>
      </Dialog>
      
      {/* Checkered background pattern for transparency preview */}
      <style>{`
        .bg-checkered {
          background-image: 
            linear-gradient(45deg, #374151 25%, transparent 25%),
            linear-gradient(-45deg, #374151 25%, transparent 25%),
            linear-gradient(45deg, transparent 75%, #374151 75%),
            linear-gradient(-45deg, transparent 75%, #374151 75%);
          background-size: 20px 20px;
          background-position: 0 0, 0 10px, 10px -10px, -10px 0px;
          background-color: #1f2937;
        }
      `}</style>
    </>
  );
}

// Pre-configured watermark component
export function FloatingWatermark({
  src,
  position = "bottom-right",
  opacity = 0.15,
  size = "lg",
  ...props
}: Omit<FloatingEmblemProps, "watermark">) {
  return (
    <FloatingEmblem
      src={src}
      position={position}
      opacity={opacity}
      size={size}
      watermark
      adaptiveMode="blend"
      {...props}
    />
  );
}

// Background removal utility hook
export function useBackgroundRemoval() {
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const removeBackground = async (imageSource: string): Promise<string | null> => {
    setIsProcessing(true);
    setError(null);
    
    try {
      // Handle data URLs directly
      let base64 = imageSource;
      
      // If it's a URL, fetch and convert to base64
      if (!imageSource.startsWith('data:')) {
        const response = await fetch(imageSource);
        const blob = await response.blob();
        base64 = await new Promise<string>((resolve) => {
          const reader = new FileReader();
          reader.onloadend = () => resolve(reader.result as string);
          reader.readAsDataURL(blob);
        });
      }
      
      const apiResponse = await fetch("/api/remove-background", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ image: base64 })
      });
      
      const result = await apiResponse.json();
      
      if (result.success && result.image) {
        setIsProcessing(false);
        return result.image;
      } else {
        throw new Error(result.message || "Background removal failed");
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unknown error");
      setIsProcessing(false);
      return null;
    }
  };
  
  return { removeBackground, isProcessing, error };
}

export default FloatingEmblem;
