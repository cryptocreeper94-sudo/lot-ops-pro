import { useState, useEffect, useCallback, useRef } from "react";
import { motion, AnimatePresence, useReducedMotion } from "framer-motion";
import { useLocation } from "wouter";
import { LotBuddy } from "./LotBuddy";
import { X, ArrowRight, Sparkles, MessageCircle } from "lucide-react";
import { Button } from "@/components/ui/button";

interface ActionLink {
  label: string;
  path: string;
}

interface ContextualTip {
  message: string;
  expression?: "idle" | "waving" | "speaking" | "celebrating" | "thinking" | "pointing";
  actionLink?: ActionLink;
}

interface PageTips {
  route: string;
  roles: string[];
  tips: ContextualTip[];
}

const contextualTips: PageTips[] = [
  {
    route: "/resource-allocation",
    roles: ["supervisor", "operations_manager"],
    tips: [
      {
        message: "Ready to assign tasks? The Assignment Panel lets you send task lists directly to your drivers!",
        expression: "pointing"
      },
      {
        message: "Check driver performance in real-time! See who's crushing their quota today.",
        expression: "celebrating"
      },
      {
        message: "Need to crunch lanes? Select lane groups and get vehicles consolidated quickly!",
        expression: "speaking"
      }
    ]
  },
  {
    route: "/crew-manager",
    roles: ["driver", "supervisor"],
    tips: [
      {
        message: "Got a new assignment? Tap on it to see the pickup and dropoff locations with GPS guidance!",
        expression: "pointing"
      },
      {
        message: "Finished a task? Mark it complete and your supervisor will be notified instantly!",
        expression: "celebrating"
      },
      {
        message: "Need help? Use the messaging button in the bottom-right to contact your supervisor!",
        expression: "speaking"
      }
    ]
  },
  {
    route: "/driver-dashboard",
    roles: ["driver"],
    tips: [
      {
        message: "Your GPS is tracking your route! Follow the guidance for the fastest path across the lot.",
        expression: "pointing"
      },
      {
        message: "Check your quota progress at the top! You're doing great - keep those moves coming!",
        expression: "celebrating"
      }
    ]
  },
  {
    route: "/operations-manager",
    roles: ["operations_manager"],
    tips: [
      {
        message: "Start each day by checking and sharing the Daily Access Code at your pre-shift meeting!",
        expression: "pointing"
      },
      {
        message: "The AI has new optimization suggestions! Review them to improve lot efficiency.",
        expression: "thinking"
      },
      {
        message: "Need to send an announcement? Use the Team Messages section to reach everyone at once!",
        expression: "speaking"
      }
    ]
  },
  {
    route: "/dashboard",
    roles: ["driver", "supervisor", "operations_manager", "inventory", "beta_tester"],
    tips: [
      {
        message: "Choose your operation mode to get started! Each mode has different tools for your job.",
        expression: "pointing",
        actionLink: { label: "View All Modes", path: "/dashboard" }
      },
      {
        message: "Need supervisor access? Enter your PIN to unlock advanced features!",
        expression: "speaking"
      }
    ]
  },
  {
    route: "/scanner",
    roles: ["inventory", "driver"],
    tips: [
      {
        message: "Scan a VIN barcode or enter it manually to log a vehicle. Quick and easy!",
        expression: "pointing"
      },
      {
        message: "Use the camera button to capture hallmarks and vehicle condition photos!",
        expression: "speaking"
      }
    ]
  },
  {
    route: "/analytics",
    roles: ["supervisor", "operations_manager"],
    tips: [
      {
        message: "View real-time performance metrics for your entire team! Charts update automatically.",
        expression: "celebrating"
      },
      {
        message: "Export reports to share with management or track trends over time.",
        expression: "pointing"
      }
    ]
  },
  {
    route: "/safety-dashboard",
    roles: ["safety_advisor", "supervisor", "operations_manager"],
    tips: [
      {
        message: "Monitor safety incidents and track your team's safety score in real-time!",
        expression: "pointing"
      },
      {
        message: "Review reported incidents and take action to improve lot safety.",
        expression: "speaking"
      }
    ]
  },
  {
    route: "/",
    roles: ["driver", "supervisor", "operations_manager", "inventory", "beta_tester"],
    tips: [
      {
        message: "Welcome to Lot Ops Pro! Sign in to access your personalized dashboard.",
        expression: "waving"
      },
      {
        message: "I'm Lot Buddy! Click me anytime for help - I know this system inside and out!",
        expression: "celebrating"
      }
    ]
  }
];

const normalizeRole = (role: string): string => {
  const r = role?.toLowerCase()?.trim() || 'driver';
  if (r.includes('operations') || r.includes('manager') || r === 'ops_manager') return 'operations_manager';
  if (r.includes('supervisor') || r === 'sup') return 'supervisor';
  if (r.includes('driver') || r === 'van' || r === 'transport') return 'driver';
  if (r.includes('inventory') || r === 'inv') return 'inventory';
  if (r.includes('beta') || r.includes('tester')) return 'beta_tester';
  if (r.includes('safety')) return 'safety_advisor';
  if (r.includes('developer') || r === 'dev') return 'developer';
  return 'driver';
};

const getRandomDirection = () => {
  const directions = [
    { x: -300, y: 0 },
    { x: 300, y: 0 },
    { x: 0, y: -300 },
    { x: 0, y: 300 },
    { x: -200, y: -200 },
    { x: 200, y: -200 },
    { x: -200, y: 200 },
    { x: 200, y: 200 },
  ];
  return directions[Math.floor(Math.random() * directions.length)];
};

export function LotBuddyPopup() {
  const [location, navigate] = useLocation();
  const [isVisible, setIsVisible] = useState(false);
  const [isMinimized, setIsMinimized] = useState(true);
  const [showIntro, setShowIntro] = useState(false);
  const [currentTip, setCurrentTip] = useState<ContextualTip | null>(null);
  const [userName, setUserName] = useState("there");
  const [userRole, setUserRole] = useState("driver");
  const [tipIndex, setTipIndex] = useState(0);
  const [showCount, setShowCount] = useState(0);
  const [animDirection, setAnimDirection] = useState({ x: 0, y: 0 });
  const modalRef = useRef<HTMLDivElement>(null);
  const closeButtonRef = useRef<HTMLButtonElement>(null);
  const prefersReducedMotion = useReducedMotion();

  const MAX_SHOWS_PER_PAGE = 2;
  const AUTO_DISMISS_MS = 6000;
  const INTRO_DISMISS_MS = 3000;

  useEffect(() => {
    try {
      const stored = localStorage.getItem("vanops_user");
      if (stored) {
        const user = JSON.parse(stored);
        setUserName(user.name?.split(' ')[0] || "there");
        setUserRole(normalizeRole(user.role || "driver"));
      }
    } catch {
      setUserName("there");
      setUserRole("driver");
    }

    const hasSeenIntro = localStorage.getItem("lotbuddy_intro_seen");
    if (!hasSeenIntro) {
      setTimeout(() => {
        setShowIntro(true);
        localStorage.setItem("lotbuddy_intro_seen", "true");
        setTimeout(() => {
          setShowIntro(false);
        }, INTRO_DISMISS_MS);
      }, 1500);
    }
  }, []);

  useEffect(() => {
    setShowCount(0);
    setTipIndex(0);
  }, [location]);

  const getPageTips = useCallback(() => {
    const pageTips = contextualTips.find(p => location.startsWith(p.route));
    if (!pageTips) return [];
    return pageTips.tips.filter(t => pageTips.roles.includes(userRole));
  }, [location, userRole]);

  const showNextTip = useCallback(() => {
    if (showCount >= MAX_SHOWS_PER_PAGE) return;
    
    const tips = getPageTips();
    if (tips.length === 0) return;

    const tip = tips[tipIndex % tips.length];
    setCurrentTip(tip);
    setAnimDirection(getRandomDirection());
    setIsVisible(true);
    setIsMinimized(false);
    setShowCount(prev => prev + 1);
    setTipIndex(prev => prev + 1);
  }, [showCount, tipIndex, getPageTips]);

  const dismissPopup = useCallback(() => {
    setIsVisible(false);
    setCurrentTip(null);
    setIsMinimized(true);
  }, []);

  const handleMinimizedClick = useCallback(() => {
    showNextTip();
  }, [showNextTip]);

  useEffect(() => {
    if (!isVisible) return;
    
    const timer = setTimeout(() => {
      dismissPopup();
    }, AUTO_DISMISS_MS);

    return () => clearTimeout(timer);
  }, [isVisible, dismissPopup]);

  useEffect(() => {
    if (!isVisible) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        e.preventDefault();
        dismissPopup();
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    closeButtonRef.current?.focus();

    return () => {
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [isVisible, dismissPopup]);

  const handleActionClick = useCallback((path: string) => {
    dismissPopup();
    if (path.includes('#')) {
      const [route, hash] = path.split('#');
      if (route && route !== location) {
        navigate(route);
      }
      setTimeout(() => {
        const element = document.getElementById(hash);
        if (element) {
          element.scrollIntoView({ behavior: 'smooth', block: 'center' });
          element.classList.add('ring-2', 'ring-orange-400', 'ring-offset-2');
          setTimeout(() => {
            element.classList.remove('ring-2', 'ring-orange-400', 'ring-offset-2');
          }, 2000);
        }
      }, 300);
    } else {
      navigate(path);
    }
  }, [dismissPopup, location, navigate]);

  const personalizedMessage = currentTip?.message
    ? `Hi ${userName}! ${currentTip.message}`
    : null;

  return (
    <>
      <AnimatePresence>
        {isVisible && currentTip && (
          <motion.div
            className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/20 backdrop-blur-[2px]"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={dismissPopup}
          >
            <motion.div
              ref={modalRef}
              role="dialog"
              aria-modal="true"
              aria-labelledby="lotbuddy-tip-title"
              className="relative max-w-sm w-full"
              initial={prefersReducedMotion ? { opacity: 0 } : { 
                opacity: 0, 
                scale: 0.5,
                x: animDirection.x,
                y: animDirection.y,
                rotate: animDirection.x > 0 ? 15 : -15
              }}
              animate={prefersReducedMotion ? { opacity: 1 } : { 
                opacity: 1, 
                scale: 1,
                x: 0,
                y: 0,
                rotate: 0
              }}
              exit={prefersReducedMotion ? { opacity: 0 } : { 
                opacity: 0, 
                scale: 0.5,
                y: 50
              }}
              transition={prefersReducedMotion ? { duration: 0.15 } : { 
                type: "spring", 
                stiffness: 300, 
                damping: 25 
              }}
              onClick={(e) => e.stopPropagation()}
            >
              <div className="relative">
                <motion.div 
                  className="bg-white rounded-2xl shadow-2xl border-2 border-orange-300 p-4 mb-2"
                  initial={{ scale: 0.9 }}
                  animate={{ scale: 1 }}
                  transition={{ delay: 0.1 }}
                >
                  <button
                    ref={closeButtonRef}
                    onClick={dismissPopup}
                    aria-label="Close tip"
                    className="absolute top-2 right-2 w-6 h-6 flex items-center justify-center rounded-full bg-slate-100 hover:bg-slate-200 text-slate-500 hover:text-slate-700 transition-colors"
                    data-testid="button-close-popup"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>

                  <div className="flex items-center gap-2 mb-3 pr-6">
                    <Sparkles className="w-4 h-4 text-orange-500" />
                    <span id="lotbuddy-tip-title" className="text-xs font-semibold text-orange-600 uppercase tracking-wide">
                      Lot Buddy Tip
                    </span>
                  </div>

                  <p className="text-sm text-slate-700 leading-relaxed mb-3">
                    {personalizedMessage}
                  </p>

                  {currentTip.actionLink && (
                    <Button
                      size="sm"
                      onClick={() => handleActionClick(currentTip.actionLink!.path)}
                      className="w-full bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 text-white text-xs h-8 gap-1"
                      data-testid="button-popup-action"
                    >
                      {currentTip.actionLink.label}
                      <ArrowRight className="w-3 h-3" />
                    </Button>
                  )}

                  <div className="flex justify-center gap-1 mt-3">
                    {Array.from({ length: MAX_SHOWS_PER_PAGE }).map((_, i) => (
                      <div
                        key={i}
                        className={`w-1.5 h-1.5 rounded-full transition-colors ${
                          i < showCount ? 'bg-orange-400' : 'bg-slate-200'
                        }`}
                      />
                    ))}
                  </div>
                </motion.div>

                <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 w-4 h-4 bg-white border-r-2 border-b-2 border-orange-300 transform rotate-45" />
              </div>

              <motion.div 
                className="flex justify-center -mt-1"
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.2, type: "spring" }}
                style={{ filter: "drop-shadow(0 4px 8px rgba(0,0,0,0.15))" }}
              >
                <LotBuddy 
                  expression={currentTip.expression || "speaking"} 
                  size="lg" 
                  animated={true} 
                />
              </motion.div>

              <motion.div 
                className="absolute bottom-0 left-0 right-0 h-1 bg-orange-200 rounded-full overflow-hidden mx-auto"
                style={{ width: '80%', left: '10%' }}
              >
                <motion.div
                  className="h-full bg-gradient-to-r from-orange-400 to-amber-400"
                  initial={{ width: '100%' }}
                  animate={{ width: '0%' }}
                  transition={{ duration: AUTO_DISMISS_MS / 1000, ease: 'linear' }}
                />
              </motion.div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <TriggerListener onTrigger={showNextTip} />
    </>
  );
}

function TriggerListener({ onTrigger }: { onTrigger: () => void }) {
  useEffect(() => {
    const handler = () => onTrigger();
    window.addEventListener('lotbuddy-show-tip', handler);
    return () => window.removeEventListener('lotbuddy-show-tip', handler);
  }, [onTrigger]);
  return null;
}

export function triggerLotBuddyTip() {
  window.dispatchEvent(new CustomEvent('lotbuddy-show-tip'));
}

export default LotBuddyPopup;
