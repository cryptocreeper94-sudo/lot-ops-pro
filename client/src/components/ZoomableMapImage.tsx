import { useState } from "react";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { X, ZoomIn, ZoomOut, Maximize2 } from "lucide-react";

interface ZoomableMapImageProps {
  src: string;
  alt: string;
  className?: string;
}

export function ZoomableMapImage({ src, alt, className = "" }: ZoomableMapImageProps) {
  const [open, setOpen] = useState(false);
  const [scale, setScale] = useState(1);
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });

  const handleZoomIn = () => setScale(Math.min(scale + 0.5, 5));
  const handleZoomOut = () => setScale(Math.max(scale - 0.5, 1));
  const handleReset = () => {
    setScale(1);
    setPosition({ x: 0, y: 0 });
  };

  const handleMouseDown = (e: React.MouseEvent) => {
    setIsDragging(true);
    setDragStart({ x: e.clientX - position.x, y: e.clientY - position.y });
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (isDragging) {
      setPosition({
        x: e.clientX - dragStart.x,
        y: e.clientY - dragStart.y,
      });
    }
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  const handleTouchStart = (e: React.TouchEvent) => {
    if (e.touches.length === 1) {
      setIsDragging(true);
      setDragStart({
        x: e.touches[0].clientX - position.x,
        y: e.touches[0].clientY - position.y,
      });
    }
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (isDragging && e.touches.length === 1) {
      setPosition({
        x: e.touches[0].clientX - dragStart.x,
        y: e.touches[0].clientY - dragStart.y,
      });
    }
  };

  const handleTouchEnd = () => {
    setIsDragging(false);
  };

  const handleWheel = (e: React.WheelEvent) => {
    e.preventDefault();
    if (e.deltaY < 0) {
      handleZoomIn();
    } else {
      handleZoomOut();
    }
  };

  return (
    <>
      {/* Thumbnail with click to open */}
      <div className={`relative group ${className}`}>
        <img 
          src={src} 
          alt={alt} 
          className="w-full rounded border cursor-pointer transition-all hover:shadow-lg"
          onClick={() => setOpen(true)}
        />
        <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-all flex items-center justify-center opacity-0 group-hover:opacity-100 rounded cursor-pointer" onClick={() => setOpen(true)}>
          <Maximize2 className="h-8 w-8 text-white drop-shadow-lg" />
        </div>
      </div>

      {/* Full screen zoomable view */}
      <Dialog open={open} onOpenChange={(isOpen) => {
        setOpen(isOpen);
        if (!isOpen) handleReset();
      }}>
        <DialogContent className="max-w-full h-screen p-0 bg-black/95 border-none">
          {/* Controls */}
          <div className="absolute top-4 right-4 z-50 flex gap-2">
            <Button
              variant="secondary"
              size="icon"
              onClick={handleZoomOut}
              disabled={scale <= 1}
              className="bg-white/90 hover:bg-white"
              data-testid="button-zoom-out"
            >
              <ZoomOut className="h-4 w-4" />
            </Button>
            <Button
              variant="secondary"
              size="icon"
              onClick={handleZoomIn}
              disabled={scale >= 5}
              className="bg-white/90 hover:bg-white"
              data-testid="button-zoom-in"
            >
              <ZoomIn className="h-4 w-4" />
            </Button>
            <Button
              variant="secondary"
              size="sm"
              onClick={handleReset}
              className="bg-white/90 hover:bg-white"
              data-testid="button-reset-zoom"
            >
              Reset
            </Button>
            <Button
              variant="secondary"
              size="icon"
              onClick={() => setOpen(false)}
              className="bg-white/90 hover:bg-white"
              data-testid="button-close-zoom"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>

          {/* Zoom level indicator */}
          <div className="absolute top-4 left-4 z-50 bg-white/90 px-3 py-1 rounded text-sm font-bold">
            {Math.round(scale * 100)}%
          </div>

          {/* Image container */}
          <div 
            className="w-full h-full overflow-hidden flex items-center justify-center"
            onMouseDown={handleMouseDown}
            onMouseMove={handleMouseMove}
            onMouseUp={handleMouseUp}
            onMouseLeave={handleMouseUp}
            onTouchStart={handleTouchStart}
            onTouchMove={handleTouchMove}
            onTouchEnd={handleTouchEnd}
            onWheel={handleWheel}
            style={{ cursor: isDragging ? 'grabbing' : 'grab' }}
          >
            <img
              src={src}
              alt={alt}
              className="max-w-none select-none"
              style={{
                transform: `translate(${position.x}px, ${position.y}px) scale(${scale})`,
                transformOrigin: 'center center',
                transition: isDragging ? 'none' : 'transform 0.2s ease-out',
              }}
              draggable={false}
            />
          </div>

          {/* Instructions */}
          <div className="absolute bottom-4 left-1/2 -translate-x-1/2 bg-white/90 px-4 py-2 rounded text-xs text-center">
            <p className="font-bold mb-1">📱 Pinch to zoom • Drag to pan • Scroll to zoom</p>
            <p className="text-gray-600">Tap outside or press Close to exit</p>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
