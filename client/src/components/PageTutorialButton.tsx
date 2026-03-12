import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { BookOpen, ChevronLeft, ChevronRight, X, Lightbulb, ExternalLink } from "lucide-react";
import { useLocation } from "wouter";

export interface TutorialSlide {
  title: string;
  content: string;
  tip?: string;
  visualHint?: string;
  link?: {
    route: string;
    label: string;
    tabName?: string;
  };
}

interface PageTutorialButtonProps {
  slides: TutorialSlide[];
  pageTitle: string;
  className?: string;
  buttonSize?: "sm" | "md" | "lg";
  showLabel?: boolean;
}

export function PageTutorialButton({ 
  slides, 
  pageTitle, 
  className = "",
  buttonSize = "md",
  showLabel = true
}: PageTutorialButtonProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [currentSlide, setCurrentSlide] = useState(0);
  const [, setLocation] = useLocation();

  const sizeClasses = {
    sm: "h-7 px-2 text-xs",
    md: "h-9 px-3 text-sm",
    lg: "h-11 px-4 text-base"
  };

  const handleNext = () => {
    if (currentSlide < slides.length - 1) {
      setCurrentSlide(prev => prev + 1);
    }
  };

  const handlePrev = () => {
    if (currentSlide > 0) {
      setCurrentSlide(prev => prev - 1);
    }
  };

  const handleLinkClick = (link: TutorialSlide['link']) => {
    if (!link) return;
    
    if (link.tabName) {
      sessionStorage.setItem('tutorial_target_tab', link.tabName);
    }
    
    setIsOpen(false);
    setLocation(link.route);
  };

  const handleClose = () => {
    setIsOpen(false);
    setCurrentSlide(0);
  };

  const slide = slides[currentSlide];

  return (
    <>
      <button
        onClick={() => setIsOpen(true)}
        className={`
          inline-flex items-center gap-2 rounded-lg font-medium
          bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500
          hover:from-indigo-600 hover:via-purple-600 hover:to-pink-600
          text-white shadow-md hover:shadow-lg transition-all duration-200
          ${sizeClasses[buttonSize]}
          ${className}
        `}
        data-testid="button-page-tutorial"
      >
        <BookOpen className="w-4 h-4" />
        {showLabel && <span>Tutorial</span>}
      </button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm"
            onClick={handleClose}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.9, opacity: 0, y: 20 }}
              transition={{ type: "spring", damping: 25, stiffness: 300 }}
              className="relative w-full max-w-md bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 rounded-2xl shadow-2xl overflow-hidden"
              onClick={e => e.stopPropagation()}
            >
              <div className="absolute inset-0 bg-gradient-to-br from-indigo-500/10 via-purple-500/10 to-pink-500/10" />
              
              <div className="relative">
                <div className="flex items-center justify-between p-4 border-b border-white/10">
                  <div>
                    <h3 className="text-lg font-bold text-white">{pageTitle}</h3>
                    <p className="text-xs text-purple-300">
                      Step {currentSlide + 1} of {slides.length}
                    </p>
                  </div>
                  <button
                    onClick={handleClose}
                    className="p-2 rounded-full hover:bg-white/10 transition-colors"
                    data-testid="button-close-tutorial"
                  >
                    <X className="w-5 h-5 text-white" />
                  </button>
                </div>

                <div className="flex gap-1 px-4 pt-4">
                  {slides.map((_, idx) => (
                    <motion.div
                      key={idx}
                      className={`h-1 flex-1 rounded-full ${
                        idx <= currentSlide ? 'bg-gradient-to-r from-purple-400 to-pink-400' : 'bg-white/20'
                      }`}
                      animate={{ scaleX: idx <= currentSlide ? 1 : 0.8 }}
                    />
                  ))}
                </div>

                <div className="p-6 min-h-[250px]">
                  <motion.div
                    key={currentSlide}
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    transition={{ duration: 0.2 }}
                  >
                    <h4 className="text-xl font-bold text-white mb-3 flex items-center gap-2">
                      <span className="w-8 h-8 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center text-sm">
                        {currentSlide + 1}
                      </span>
                      {slide.title}
                    </h4>
                    
                    <p className="text-purple-100 mb-4 leading-relaxed">
                      {slide.content}
                    </p>

                    {slide.visualHint && (
                      <div className="bg-white/5 rounded-lg p-3 mb-4 border border-purple-500/20">
                        <p className="text-sm text-purple-200 italic">
                          {slide.visualHint}
                        </p>
                      </div>
                    )}

                    {slide.tip && (
                      <div className="flex items-start gap-3 p-3 bg-gradient-to-r from-amber-500/20 to-orange-500/20 rounded-lg border border-amber-500/30">
                        <Lightbulb className="w-5 h-5 text-amber-400 flex-shrink-0 mt-0.5" />
                        <p className="text-sm text-amber-100">
                          <span className="font-semibold">Pro tip:</span> {slide.tip}
                        </p>
                      </div>
                    )}

                    {slide.link && (
                      <button
                        onClick={() => handleLinkClick(slide.link)}
                        className="mt-4 inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 rounded-lg text-white font-medium transition-all shadow-lg hover:shadow-xl"
                        data-testid="button-tutorial-link"
                      >
                        <ExternalLink className="w-4 h-4" />
                        {slide.link.label}
                      </button>
                    )}
                  </motion.div>
                </div>

                <div className="flex items-center justify-between p-4 border-t border-white/10">
                  <button
                    onClick={handlePrev}
                    disabled={currentSlide === 0}
                    className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-all ${
                      currentSlide === 0
                        ? 'text-white/30 cursor-not-allowed'
                        : 'text-white hover:bg-white/10'
                    }`}
                    data-testid="button-tutorial-prev"
                  >
                    <ChevronLeft className="w-5 h-5" />
                    Back
                  </button>

                  {currentSlide === slides.length - 1 ? (
                    <button
                      onClick={handleClose}
                      className="flex items-center gap-2 px-6 py-2 bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 rounded-lg text-white font-medium transition-all shadow-lg"
                      data-testid="button-tutorial-finish"
                    >
                      Got it!
                    </button>
                  ) : (
                    <button
                      onClick={handleNext}
                      className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 rounded-lg text-white font-medium transition-all shadow-lg"
                      data-testid="button-tutorial-next"
                    >
                      Next
                      <ChevronRight className="w-5 h-5" />
                    </button>
                  )}
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}

export const pageTutorialContent: Record<string, { title: string; slides: TutorialSlide[] }> = {
  "/": {
    title: "Home Dashboard Guide",
    slides: [
      {
        title: "Welcome to Lot Ops Pro!",
        content: "This is your command center. Everything starts here - from checking lot status to managing your team.",
        tip: "The dashboard updates in real-time, so you always see the latest info.",
        visualHint: "Look for the status cards at the top showing active drivers, pending tasks, and lot capacity."
      },
      {
        title: "Quick Navigation",
        content: "Use the navigation menu to access different areas. Each section is designed for specific tasks.",
        tip: "On mobile, swipe left/right to see more options!",
        visualHint: "The menu icon in the top corner opens the full navigation panel."
      },
      {
        title: "Real-Time Updates",
        content: "All data on this page refreshes automatically. You'll see driver movements, new assignments, and alerts as they happen.",
        tip: "Green indicators mean everything's running smoothly. Yellow means attention needed."
      }
    ]
  },
  "/resource-allocation": {
    title: "Supervisor Dashboard Guide",
    slides: [
      {
        title: "Managing Your Drivers",
        content: "The Roster tab shows all your active drivers. You can see who's clocked in, their current status, and what they're working on.",
        tip: "Green = Available, Yellow = On task, Red = Need attention",
        link: { route: "/resource-allocation", label: "View Roster", tabName: "roster" }
      },
      {
        title: "Sending Assignments",
        content: "Use the Assignment Panel to dispatch tasks to your drivers. They'll receive notifications instantly on their devices!",
        tip: "Save frequently used task lists as templates to save time.",
        link: { route: "/resource-allocation", label: "Open Assignments", tabName: "assignments" }
      },
      {
        title: "Lane Operations",
        content: "The Lane Crunch feature helps you consolidate vehicles efficiently. Select which lane groups need work and let the system guide you.",
        tip: "Lane groups: 501-505, 513-515, 516-518, 591-599",
        visualHint: "Look for the 'Crunch Lanes' button in the operations section."
      },
      {
        title: "Performance Tracking",
        content: "Monitor your team's efficiency in real-time. See moves completed, average times, and quota progress.",
        tip: "Aim for 85%+ efficiency rating for optimal performance!",
        link: { route: "/resource-allocation", label: "View Stats", tabName: "performance" }
      }
    ]
  },
  "/operations-manager": {
    title: "Operations Manager Guide",
    slides: [
      {
        title: "Your Command Center",
        content: "This dashboard gives you full visibility across the entire operation. Monitor all teams, zones, and performance metrics from one place.",
        tip: "Start each shift by reviewing the daily access code and sharing it at pre-shift meetings.",
        visualHint: "The overview cards at the top show key metrics at a glance."
      },
      {
        title: "Weather Intelligence",
        content: "Monitor real-time weather conditions with animated radar. Weather data is logged with each shift for performance analysis.",
        tip: "Tap the weather button to see conditions and animated radar with playback controls.",
        visualHint: "The floating weather icon shows current temperature and conditions."
      },
      {
        title: "Team Communication",
        content: "Send announcements to your entire team or target specific groups. Important messages can be flagged as priority.",
        tip: "Use @mentions to notify specific supervisors or drivers.",
        link: { route: "/operations-manager", label: "Open Messages", tabName: "messages" }
      },
      {
        title: "Hands-Free Compliance",
        content: "All drivers must acknowledge the hands-free policy daily. View compliance reports to ensure everyone is following safety protocols.",
        tip: "Check acknowledgment logs to verify all drivers have confirmed for the day."
      },
      {
        title: "Reports & Analytics",
        content: "Access detailed performance reports, efficiency trends, and comparative analytics across shifts and teams.",
        tip: "Export reports as PDF for management meetings!",
        link: { route: "/operations-manager", label: "View Reports", tabName: "reports" }
      },
      {
        title: "AI Optimization",
        content: "Our AI analyzes lot conditions and suggests improvements for traffic flow, lane utilization, and driver routing.",
        tip: "Review AI suggestions daily - they learn from your lot's unique patterns!",
        link: { route: "/operations-manager", label: "AI Insights", tabName: "ai-suggestions" }
      }
    ]
  },
  "/van-driver": {
    title: "Van Driver Guide",
    slides: [
      {
        title: "Hands-Free Policy",
        content: "Safety first! You must acknowledge the hands-free driving policy before starting your shift. This is required daily for compliance.",
        tip: "Simply tap 'I Acknowledge' to confirm you understand safe driving practices.",
        visualHint: "A popup will appear when you first log in - acknowledge it to proceed."
      },
      {
        title: "Your Assignments",
        content: "This is where you'll see all your current tasks. Each assignment shows pickup location, destination, and any special instructions.",
        tip: "Tap on any assignment to see the full route details.",
        visualHint: "New assignments appear at the top with a notification badge."
      },
      {
        title: "Completing Tasks",
        content: "When you finish moving a vehicle, tap 'Complete' to log it. Your supervisor gets notified automatically!",
        tip: "If you encounter an issue, use the 'Report Problem' button instead of just skipping."
      },
      {
        title: "Weather & Radar",
        content: "Check weather conditions anytime by tapping the floating weather button. View animated radar to see incoming storms!",
        tip: "The radar tab shows real-time precipitation with playback controls.",
        visualHint: "Look for the weather icon in the corner - tap it to see current conditions and radar."
      },
      {
        title: "GPS & Navigation",
        content: "The built-in GPS shows you the optimal route across the lot. The blue line guides you to your destination.",
        tip: "Speed is tracked automatically - stay within limits for safety and efficiency scores!"
      },
      {
        title: "Meet Lot Buddy",
        content: "Your personal mascot guide can help you navigate the app! Choose from 41 unique avatars and give your buddy a custom name.",
        tip: "Lot Buddy learns your communication style and adapts to how you prefer information.",
        visualHint: "Tap the mascot icon to customize your buddy or get helpful tips!"
      }
    ]
  },
  "/crew-manager": {
    title: "Crew Manager Guide",
    slides: [
      {
        title: "Crew Dashboard",
        content: "Manage your assigned crew members from this dashboard. See everyone's status and current workload at a glance.",
        tip: "Use the filter options to focus on specific crew members or tasks."
      },
      {
        title: "Task Distribution",
        content: "Assign tasks to crew members based on their skills and availability. The system suggests optimal assignments.",
        tip: "Balance workload evenly to maintain high team morale!"
      },
      {
        title: "Real-Time Tracking",
        content: "Monitor your crew's progress in real-time. See who's ahead of quota and who might need assistance.",
        tip: "Tap on a crew member's card to see their detailed stats."
      }
    ]
  },
  "/nft-badge": {
    title: "NFT Badge Guide",
    slides: [
      {
        title: "Your Digital Employee Badge",
        content: "Your NFT Hallmark Badge is a unique digital collectible that displays your stats, achievements, and team info.",
        tip: "Beta testers get exclusive limited-edition badges!",
        visualHint: "Your badge shows your avatar, role, and key performance metrics."
      },
      {
        title: "Badge Stats",
        content: "Your badge displays real-time stats including total moves, efficiency rating, and team ranking.",
        tip: "Stats are captured at the time of minting - they're a snapshot of your achievements!"
      },
      {
        title: "Downloading Your Badge",
        content: "Beta users can download their badge for free as a collectible. Public users can purchase for $2.99.",
        tip: "Connect a Solana wallet to mint your badge on the blockchain for permanent ownership!"
      }
    ]
  },
  "/staking": {
    title: "Staking Guide",
    slides: [
      {
        title: "What is Staking?",
        content: "Staking lets you earn rewards by holding your NFT badges. The longer you stake, the more rewards you accumulate.",
        tip: "Start with a small stake to get familiar with the process.",
        visualHint: "Look for the 'Stake' button on your NFT badge card."
      },
      {
        title: "Staking Rewards",
        content: "Earn points and unlock exclusive perks by staking your badges. Rewards vary based on badge rarity and stake duration.",
        tip: "Rare beta badges often earn higher staking rewards!"
      },
      {
        title: "Managing Your Stakes",
        content: "View all your active stakes, pending rewards, and unstaking options in one place.",
        tip: "Consider the unstaking period before withdrawing - early unstaking may reduce rewards."
      }
    ]
  }
};

export function getPageTutorial(path: string): { title: string; slides: TutorialSlide[] } | null {
  const normalizedPath = path.split('?')[0].split('#')[0];
  return pageTutorialContent[normalizedPath] || null;
}
