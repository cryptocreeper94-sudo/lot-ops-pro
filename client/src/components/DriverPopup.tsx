import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X } from "lucide-react";

type AnimationDirection = "left" | "right" | "top" | "bottom" | "diagonal-tl" | "diagonal-tr" | "diagonal-bl" | "diagonal-br";

interface DriverPopupProps {
  driverName: string;
  avatarUrl?: string;
  message: string;
  onClose?: () => void;
  duration?: number;
  direction?: AnimationDirection;
}

const sarcasticMessages = [
  "Caught ya slacking! Just kidding... or am I?",
  "Legend says they're still looking for parking spot B-47.",
  "Claims to know every lane by heart. Gets lost daily.",
  "Professional at making 3-point turns look like 47-point turns.",
  "Has never met a speed bump they didn't underestimate.",
  "Their GPS recalculates more than their life choices.",
  "Once found a shortcut. It wasn't. Still uses it.",
  "Master of the 'I was here first' parking maneuver.",
  "Believes turn signals are just suggestions.",
  "Has a PhD in creative parking interpretations.",
  "Rumor has it they've never hit a cone. Cones disagree.",
  "Expert at finding the one pothole on a freshly paved lot.",
  "Their van has more stories than a library.",
  "Somehow makes every route scenic.",
  "Professional lane-changer. Amateur direction-follower.",
  "Voted 'Most Likely to Circle the Lot Twice'.",
];

const getRandomDirection = (): AnimationDirection => {
  const directions: AnimationDirection[] = [
    "left", "right", "top", "bottom", 
    "diagonal-tl", "diagonal-tr", "diagonal-bl", "diagonal-br"
  ];
  return directions[Math.floor(Math.random() * directions.length)];
};

const getAnimationVariants = (direction: AnimationDirection) => {
  const offsets: Record<AnimationDirection, { x: number | string; y: number | string }> = {
    "left": { x: "-100vw", y: 0 },
    "right": { x: "100vw", y: 0 },
    "top": { x: 0, y: "-100vh" },
    "bottom": { x: 0, y: "100vh" },
    "diagonal-tl": { x: "-100vw", y: "-100vh" },
    "diagonal-tr": { x: "100vw", y: "-100vh" },
    "diagonal-bl": { x: "-100vw", y: "100vh" },
    "diagonal-br": { x: "100vw", y: "100vh" },
  };

  const offset = offsets[direction];
  
  return {
    initial: { 
      x: offset.x, 
      y: offset.y, 
      opacity: 0,
      scale: 0.5,
      rotate: direction.includes("diagonal") ? (direction.includes("l") ? -15 : 15) : 0
    },
    animate: { 
      x: 0, 
      y: 0, 
      opacity: 1,
      scale: 1,
      rotate: 0,
      transition: {
        type: "spring" as const,
        stiffness: 100,
        damping: 15,
        duration: 0.8
      }
    },
    exit: { 
      x: typeof offset.x === 'string' ? offset.x.replace('-', '') : -offset.x,
      y: typeof offset.y === 'string' ? offset.y.replace('-', '') : -offset.y,
      opacity: 0,
      scale: 0.3,
      rotate: direction.includes("diagonal") ? (direction.includes("l") ? 15 : -15) : 0,
      transition: {
        duration: 0.5,
        ease: [0.4, 0, 1, 1] as const
      }
    }
  };
};

export function DriverPopup({ 
  driverName, 
  avatarUrl, 
  message, 
  onClose,
  duration = 7000,
  direction
}: DriverPopupProps) {
  const [isVisible, setIsVisible] = useState(true);
  const [animDirection] = useState(() => direction || getRandomDirection());
  
  const handleClose = useCallback(() => {
    setIsVisible(false);
    setTimeout(() => onClose?.(), 500);
  }, [onClose]);

  useEffect(() => {
    const timer = setTimeout(() => {
      handleClose();
    }, duration);
    
    return () => clearTimeout(timer);
  }, [duration, handleClose]);

  const variants = getAnimationVariants(animDirection);
  const initials = driverName.split(' ').map(n => n[0]).join('').toUpperCase();

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          className="fixed inset-0 z-50 flex items-center justify-center pointer-events-none"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          <motion.div
            className="relative pointer-events-auto max-w-sm mx-4"
            variants={variants}
            initial="initial"
            animate="animate"
            exit="exit"
          >
            <div className="relative flex flex-col items-center">
              <div className="relative mb-[-20px] z-10">
                {avatarUrl ? (
                  <motion.img
                    src={avatarUrl}
                    alt={driverName}
                    className="w-24 h-24 object-contain drop-shadow-2xl"
                    style={{ 
                      filter: "drop-shadow(0 4px 20px rgba(0,0,0,0.3))"
                    }}
                    animate={{ 
                      y: [0, -5, 0],
                    }}
                    transition={{ 
                      repeat: Infinity, 
                      duration: 2,
                      ease: "easeInOut"
                    }}
                  />
                ) : (
                  <motion.div 
                    className="w-24 h-24 rounded-full bg-gradient-to-br from-purple-500 via-blue-500 to-cyan-500 flex items-center justify-center text-white text-2xl font-bold shadow-2xl border-4 border-white"
                    animate={{ 
                      y: [0, -5, 0],
                    }}
                    transition={{ 
                      repeat: Infinity, 
                      duration: 2,
                      ease: "easeInOut"
                    }}
                  >
                    {initials}
                  </motion.div>
                )}
              </div>
              
              <div className="relative bg-white rounded-2xl shadow-2xl border-2 border-slate-200 p-4 pt-6 max-w-xs">
                <div className="absolute -top-3 left-1/2 -translate-x-1/2 w-6 h-6 bg-white border-l-2 border-t-2 border-slate-200 rotate-45" />
                
                <button
                  onClick={handleClose}
                  className="absolute top-2 right-2 text-slate-400 hover:text-slate-600 transition-colors"
                  data-testid="button-close-popup"
                >
                  <X className="w-4 h-4" />
                </button>
                
                <div className="text-center">
                  <h4 className="font-bold text-slate-900 text-lg mb-1">{driverName}</h4>
                  <p className="text-slate-600 text-sm italic leading-relaxed">"{message}"</p>
                </div>
                
                <motion.div 
                  className="absolute -bottom-1 left-1/2 -translate-x-1/2 flex gap-1"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.5 }}
                >
                  {[...Array(3)].map((_, i) => (
                    <motion.div
                      key={i}
                      className="w-2 h-2 rounded-full bg-slate-300"
                      animate={{ 
                        scale: [1, 1.2, 1],
                        opacity: [0.5, 1, 0.5]
                      }}
                      transition={{ 
                        repeat: Infinity, 
                        duration: 1.5,
                        delay: i * 0.2
                      }}
                    />
                  ))}
                </motion.div>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

export function useDriverPopup() {
  const [popup, setPopup] = useState<{
    driverName: string;
    avatarUrl?: string;
    message: string;
  } | null>(null);

  const showRandomPopup = useCallback((drivers: Array<{ name: string; avatarUrl?: string }>) => {
    if (drivers.length === 0) return;
    
    const randomDriver = drivers[Math.floor(Math.random() * drivers.length)];
    const randomMessage = sarcasticMessages[Math.floor(Math.random() * sarcasticMessages.length)];
    
    setPopup({
      driverName: randomDriver.name,
      avatarUrl: randomDriver.avatarUrl,
      message: randomMessage
    });
  }, []);

  const showPopup = useCallback((driverName: string, message?: string, avatarUrl?: string) => {
    setPopup({
      driverName,
      avatarUrl,
      message: message || sarcasticMessages[Math.floor(Math.random() * sarcasticMessages.length)]
    });
  }, []);

  const hidePopup = useCallback(() => {
    setPopup(null);
  }, []);

  return {
    popup,
    showRandomPopup,
    showPopup,
    hidePopup,
    PopupComponent: popup ? (
      <DriverPopup
        driverName={popup.driverName}
        avatarUrl={popup.avatarUrl}
        message={popup.message}
        onClose={hidePopup}
      />
    ) : null
  };
}

export { sarcasticMessages };
