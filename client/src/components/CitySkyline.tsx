import { cn } from "@/lib/utils";
import nashvilleSkyline from "@assets/generated_images/pixar_nashville_skyline_transparent.png";

interface CitySkylineProps {
  className?: string;
  opacity?: number;
  city?: "nashville" | "generic";
  height?: string;
}

const cityAssets: Record<string, string> = {
  nashville: nashvilleSkyline,
};

export function CitySkyline({ 
  className, 
  opacity = 1,
  city = "nashville",
  height = "380px"
}: CitySkylineProps) {
  const skylineImage = cityAssets[city] || cityAssets.nashville;

  return (
    <div 
      className={cn(
        "absolute inset-x-0 top-0 pointer-events-none overflow-hidden w-full",
        className
      )}
      style={{ height }}
      data-testid={`city-skyline-${city}`}
    >
      {/* Main Nashville skyline */}
      <img 
        src={skylineImage}
        alt={`${city} skyline`}
        className="h-full"
        style={{ 
          opacity: 1,
          objectFit: 'fill',
          width: '120vw',
          marginLeft: '-10vw',
          filter: 'none',
          WebkitFilter: 'none',
          imageRendering: 'auto'
        }}
      />
    </div>
  );
}

export default CitySkyline;
