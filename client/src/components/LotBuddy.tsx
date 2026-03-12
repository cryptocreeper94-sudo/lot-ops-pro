import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";

export type MascotExpression = "idle" | "waving" | "speaking" | "celebrating" | "thinking" | "pointing";

interface LotBuddyProps {
  expression?: MascotExpression;
  size?: "sm" | "md" | "lg" | "xl";
  animated?: boolean;
  className?: string;
}

const sizeMap = {
  sm: 48,
  md: 80,
  lg: 120,
  xl: 160,
};

export function LotBuddy({ 
  expression = "idle", 
  size = "md", 
  animated = true,
  className = "" 
}: LotBuddyProps) {
  const [currentExpression, setCurrentExpression] = useState(expression);
  const dimensions = sizeMap[size];

  useEffect(() => {
    setCurrentExpression(expression);
  }, [expression]);

  const getEyePosition = () => {
    switch (currentExpression) {
      case "thinking":
        return { left: "38%", right: "62%" };
      case "pointing":
        return { left: "42%", right: "68%" };
      default:
        return { left: "35%", right: "55%" };
    }
  };

  const getMouthPath = () => {
    switch (currentExpression) {
      case "celebrating":
        return "M 35 55 Q 50 70 65 55";
      case "speaking":
        return "M 40 55 Q 50 60 60 55";
      case "thinking":
        return "M 42 56 Q 50 52 58 56";
      default:
        return "M 38 54 Q 50 62 62 54";
    }
  };

  const eyePos = getEyePosition();

  return (
    <motion.div
      className={`relative ${className}`}
      style={{ width: dimensions, height: dimensions }}
      initial={{ scale: 0.8, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      transition={{ type: "spring", stiffness: 300, damping: 20 }}
    >
      <svg
        viewBox="0 0 100 100"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="w-full h-full"
      >
        <defs>
          <linearGradient id="vestGradient" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#f97316" />
            <stop offset="100%" stopColor="#ea580c" />
          </linearGradient>
          <linearGradient id="helmetGradient" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#fbbf24" />
            <stop offset="100%" stopColor="#f59e0b" />
          </linearGradient>
          <linearGradient id="faceGradient" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#fef3c7" />
            <stop offset="100%" stopColor="#fde68a" />
          </linearGradient>
          <filter id="shadow" x="-20%" y="-20%" width="140%" height="140%">
            <feDropShadow dx="2" dy="3" stdDeviation="3" floodOpacity="0.2"/>
          </filter>
        </defs>

        {/* Body / Safety Vest */}
        <motion.ellipse
          cx="50"
          cy="82"
          rx="28"
          ry="18"
          fill="url(#vestGradient)"
          filter="url(#shadow)"
          animate={animated && currentExpression === "celebrating" ? {
            scaleY: [1, 1.05, 1],
          } : {}}
          transition={{ repeat: Infinity, duration: 0.5 }}
        />
        
        {/* Reflective Stripes on Vest */}
        <rect x="30" y="72" width="40" height="3" rx="1.5" fill="#fef08a" opacity="0.9" />
        <rect x="32" y="78" width="36" height="2" rx="1" fill="#fef08a" opacity="0.7" />

        {/* Face */}
        <motion.circle
          cx="50"
          cy="42"
          r="28"
          fill="url(#faceGradient)"
          filter="url(#shadow)"
          animate={animated ? {
            y: currentExpression === "speaking" ? [0, -1, 0] : 0,
          } : {}}
          transition={{ repeat: Infinity, duration: 0.3 }}
        />

        {/* Hard Hat */}
        <motion.path
          d="M 22 38 Q 22 15 50 12 Q 78 15 78 38 L 75 42 Q 50 38 25 42 Z"
          fill="url(#helmetGradient)"
          filter="url(#shadow)"
          animate={animated && currentExpression === "waving" ? {
            rotate: [-3, 3, -3],
          } : {}}
          style={{ transformOrigin: "50% 30%" }}
          transition={{ repeat: Infinity, duration: 0.8 }}
        />
        
        {/* Hard Hat Brim */}
        <ellipse cx="50" cy="40" rx="30" ry="5" fill="#d97706" />
        
        {/* Hard Hat Logo/Light */}
        <circle cx="50" cy="24" r="4" fill="#fef3c7" />
        <circle cx="50" cy="24" r="2" fill="#facc15" />

        {/* Eyes */}
        <motion.g
          animate={animated ? {
            y: currentExpression === "thinking" ? [-2, 0, -2] : 0,
          } : {}}
          transition={{ repeat: Infinity, duration: 2 }}
        >
          {/* Left Eye */}
          <ellipse cx={eyePos.left} cy="40" rx="5" ry="6" fill="white" />
          <motion.circle
            cx={eyePos.left}
            cy="41"
            r="3"
            fill="#1e293b"
            animate={animated && currentExpression === "speaking" ? {
              cy: [41, 40, 41],
            } : {}}
            transition={{ repeat: Infinity, duration: 0.4 }}
          />
          <circle cx="33" cy="39" r="1" fill="white" />

          {/* Right Eye */}
          <ellipse cx={eyePos.right} cy="40" rx="5" ry="6" fill="white" />
          <motion.circle
            cx={eyePos.right}
            cy="41"
            r="3"
            fill="#1e293b"
            animate={animated && currentExpression === "speaking" ? {
              cy: [41, 40, 41],
            } : {}}
            transition={{ repeat: Infinity, duration: 0.4, delay: 0.1 }}
          />
          <circle cx="53" cy="39" r="1" fill="white" />
        </motion.g>

        {/* Eyebrows */}
        <motion.g
          animate={animated && currentExpression === "celebrating" ? {
            y: [-2, 0, -2],
          } : {}}
          transition={{ repeat: Infinity, duration: 0.5 }}
        >
          <path
            d="M 28 34 Q 35 31 40 34"
            stroke="#92400e"
            strokeWidth="2"
            strokeLinecap="round"
            fill="none"
          />
          <path
            d="M 60 34 Q 65 31 72 34"
            stroke="#92400e"
            strokeWidth="2"
            strokeLinecap="round"
            fill="none"
          />
        </motion.g>

        {/* Mouth */}
        <motion.path
          d={getMouthPath()}
          stroke="#92400e"
          strokeWidth="2.5"
          strokeLinecap="round"
          fill={currentExpression === "celebrating" ? "#fef3c7" : "none"}
          animate={animated && currentExpression === "speaking" ? {
            d: [
              "M 40 55 Q 50 60 60 55",
              "M 40 55 Q 50 65 60 55",
              "M 40 55 Q 50 60 60 55",
            ],
          } : {}}
          transition={{ repeat: Infinity, duration: 0.3 }}
        />

        {/* Cheeks (blush) */}
        <circle cx="28" cy="48" r="4" fill="#fca5a5" opacity="0.5" />
        <circle cx="72" cy="48" r="4" fill="#fca5a5" opacity="0.5" />

        {/* Arms */}
        <AnimatePresence mode="wait">
          {currentExpression === "waving" && (
            <motion.g
              key="waving-arm"
              initial={{ rotate: 0 }}
              animate={{ rotate: [-20, 20, -20] }}
              exit={{ rotate: 0 }}
              transition={{ repeat: Infinity, duration: 0.5 }}
              style={{ transformOrigin: "22px 70px" }}
            >
              <ellipse cx="18" cy="60" rx="6" ry="10" fill="url(#faceGradient)" />
              <ellipse cx="12" cy="50" rx="5" ry="6" fill="url(#faceGradient)" />
            </motion.g>
          )}
          
          {currentExpression === "pointing" && (
            <motion.g
              key="pointing-arm"
              initial={{ x: -10, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              exit={{ x: -10, opacity: 0 }}
            >
              <ellipse cx="82" cy="65" rx="6" ry="10" fill="url(#faceGradient)" transform="rotate(30 82 65)" />
              <ellipse cx="92" cy="58" rx="4" ry="5" fill="url(#faceGradient)" />
            </motion.g>
          )}

          {currentExpression === "celebrating" && (
            <>
              <motion.g
                key="left-celebrate"
                animate={{ rotate: [-15, 15, -15] }}
                transition={{ repeat: Infinity, duration: 0.3 }}
                style={{ transformOrigin: "22px 70px" }}
              >
                <ellipse cx="18" cy="58" rx="6" ry="10" fill="url(#faceGradient)" />
              </motion.g>
              <motion.g
                key="right-celebrate"
                animate={{ rotate: [15, -15, 15] }}
                transition={{ repeat: Infinity, duration: 0.3 }}
                style={{ transformOrigin: "78px 70px" }}
              >
                <ellipse cx="82" cy="58" rx="6" ry="10" fill="url(#faceGradient)" />
              </motion.g>
            </>
          )}

          {currentExpression === "thinking" && (
            <motion.g key="thinking-bubble">
              <circle cx="80" cy="25" r="3" fill="#e2e8f0" />
              <circle cx="86" cy="18" r="4" fill="#e2e8f0" />
              <circle cx="92" cy="10" r="6" fill="#e2e8f0" />
            </motion.g>
          )}
        </AnimatePresence>

        {/* Sparkles for celebrating */}
        {currentExpression === "celebrating" && animated && (
          <motion.g>
            <motion.path
              d="M 15 20 L 17 25 L 22 23 L 17 27 L 19 32 L 15 28 L 11 32 L 13 27 L 8 23 L 13 25 Z"
              fill="#fbbf24"
              animate={{ scale: [1, 1.2, 1], opacity: [1, 0.8, 1] }}
              transition={{ repeat: Infinity, duration: 0.5 }}
            />
            <motion.path
              d="M 85 15 L 87 20 L 92 18 L 87 22 L 89 27 L 85 23 L 81 27 L 83 22 L 78 18 L 83 20 Z"
              fill="#fbbf24"
              animate={{ scale: [1, 1.2, 1], opacity: [1, 0.8, 1] }}
              transition={{ repeat: Infinity, duration: 0.5, delay: 0.2 }}
            />
          </motion.g>
        )}
      </svg>
    </motion.div>
  );
}

export function LotBuddyWithMessage({ 
  message,
  expression = "speaking",
  size = "md",
  position = "right",
  onClose,
  showClose = true,
  className = ""
}: {
  message: string | React.ReactNode;
  expression?: MascotExpression;
  size?: "sm" | "md" | "lg" | "xl";
  position?: "left" | "right" | "top" | "bottom";
  onClose?: () => void;
  showClose?: boolean;
  className?: string;
}) {
  const getBubblePosition = () => {
    switch (position) {
      case "left":
        return "flex-row-reverse";
      case "top":
        return "flex-col-reverse";
      case "bottom":
        return "flex-col";
      default:
        return "flex-row";
    }
  };

  return (
    <motion.div
      className={`flex items-end gap-3 ${getBubblePosition()} ${className}`}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 20 }}
    >
      <LotBuddy expression={expression} size={size} />
      
      <motion.div
        className="relative bg-white rounded-2xl shadow-lg border border-slate-200 p-4 max-w-xs"
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ delay: 0.1 }}
      >
        {/* Speech bubble tail */}
        <div 
          className={`absolute w-4 h-4 bg-white border-l border-b border-slate-200 transform rotate-45 ${
            position === "left" ? "right-[-8px] bottom-4" : "left-[-8px] bottom-4"
          }`}
        />
        
        <div className="relative z-10 text-sm text-slate-700">
          {message}
        </div>

        {showClose && onClose && (
          <button
            onClick={onClose}
            className="absolute top-2 right-2 text-slate-400 hover:text-slate-600 transition-colors"
            data-testid="button-close-mascot-message"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        )}
      </motion.div>
    </motion.div>
  );
}

export default LotBuddy;
