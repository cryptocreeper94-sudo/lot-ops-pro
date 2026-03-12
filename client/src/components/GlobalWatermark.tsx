import { useSkyCondition } from "./DynamicSkyBackground";

export function GlobalWatermark() {
  const { condition, isLightBackground } = useSkyCondition();
  
  // Dynamic opacity based on sky condition
  // Light backgrounds (sunny, cloudy, fog) need more opacity to be visible
  // Dark backgrounds (night, storm) already show it well
  const getOpacity = () => {
    switch (condition) {
      case 'sunny':
      case 'cloudy':
      case 'overcast':
      case 'fog':
        return 0.18; // 18% for light backgrounds
      case 'dusk':
      case 'dawn':
        return 0.14; // 14% for transitional times
      case 'rain':
      case 'snow':
        return 0.12; // 12% for weather conditions
      case 'night-clear':
      case 'night-cloudy':
      case 'storm':
      default:
        return 0.08; // 8% for dark backgrounds (original)
    }
  };

  return (
    <div 
      className="fixed inset-0 flex items-center justify-center pointer-events-none select-none z-[1]"
      data-testid="global-watermark"
    >
      <img
        src="/lotops-lp-watermark.png"
        alt="LP"
        className="w-64 h-64 sm:w-80 sm:h-80 md:w-96 md:h-96 lg:w-[28rem] lg:h-[28rem] object-contain transition-opacity duration-1000"
        style={{
          opacity: getOpacity(),
          filter: "drop-shadow(0 0 15px rgba(120,220,200,0.3))",
        }}
        draggable={false}
      />
    </div>
  );
}

export default GlobalWatermark;
