import { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Heart, Sparkles, ChevronRight, ChevronLeft, Gauge, Users, Map, Eye, Clock } from "lucide-react";

interface ManagementWelcomeProps {
  userName: string;
  role: string;
}

interface TourStep {
  title: string;
  description: string;
  icon: JSX.Element;
}

const KRYSTLE_TOUR_STEPS: TourStep[] = [
  {
    title: "Your Dashboard at a Glance",
    description: "The top section shows everything you need: Daily Code, Active Drivers, Moves Today, Current Shift, and Lot Status. Just like a car dashboard - quick and easy to read.",
    icon: <Gauge className="w-8 h-8 text-emerald-500" />
  },
  {
    title: "Quick Actions",
    description: "Send messages, create shift instructions, and access reports with one tap. No digging through menus.",
    icon: <Clock className="w-8 h-8 text-blue-500" />
  },
  {
    title: "Live Driver Wall",
    description: "See who's working, who's on break, and what everyone's doing in real-time.",
    icon: <Users className="w-8 h-8 text-purple-500" />
  },
  {
    title: "Lot Availability",
    description: "Color-coded lot sections show capacity at a glance. Green means space, red means full.",
    icon: <Map className="w-8 h-8 text-amber-500" />
  },
  {
    title: "Role Previews",
    description: "Want to see what Supervisors or Drivers see? Use the Role Preview buttons to see their dashboards.",
    icon: <Eye className="w-8 h-8 text-cyan-500" />
  }
];

export function ManagementWelcome({ userName, role }: ManagementWelcomeProps) {
  const [showWelcome, setShowWelcome] = useState(false);
  const [showTour, setShowTour] = useState(false);
  const [tourStep, setTourStep] = useState(0);
  const [offerTour, setOfferTour] = useState(false);

  useEffect(() => {
    if (role !== "operations_manager" && role !== "supervisor") {
      return;
    }

    const hasSeenWelcome = localStorage.getItem(`vanops_welcome_${role}`);
    
    if (!hasSeenWelcome) {
      setShowWelcome(true);
    }
  }, [role]);

  const handleClose = () => {
    localStorage.setItem(`vanops_welcome_${role}`, "true");
    setShowWelcome(false);
    
    const isKrystle = userName.toLowerCase().includes("krystle");
    const hasSeenTour = localStorage.getItem('vanops_krystle_tour_seen');
    
    if (isKrystle && !hasSeenTour) {
      setOfferTour(true);
    }
  };

  const handleStartTour = () => {
    setOfferTour(false);
    setTourStep(0);
    setShowTour(true);
  };

  const handleSkipTour = () => {
    localStorage.setItem('vanops_krystle_tour_seen', "true");
    setOfferTour(false);
  };

  const handleTourNext = () => {
    if (tourStep < KRYSTLE_TOUR_STEPS.length - 1) {
      setTourStep(tourStep + 1);
    } else {
      localStorage.setItem('vanops_krystle_tour_seen', "true");
      setShowTour(false);
    }
  };

  const handleTourPrev = () => {
    if (tourStep > 0) {
      setTourStep(tourStep - 1);
    }
  };

  const handleTourClose = () => {
    localStorage.setItem('vanops_krystle_tour_seen', "true");
    setShowTour(false);
  };

  if (!showWelcome && !offerTour && !showTour) return null;

  const isOperationsManager = role === "operations_manager";
  const isKrystle = userName.toLowerCase().includes("krystle");

  if (offerTour) {
    return (
      <Dialog open={offerTour} onOpenChange={handleSkipTour}>
        <DialogContent className="max-w-md bg-gradient-to-br from-slate-900 to-slate-800 border-slate-700">
          <DialogHeader>
            <div className="flex items-center gap-2 mb-2">
              <Sparkles className="h-6 w-6 text-amber-400" />
              <DialogTitle className="text-xl text-white">Quick Tour?</DialogTitle>
            </div>
            <DialogDescription className="text-slate-300">
              Want a quick 30-second tour of your dashboard? I'll show you where everything is.
            </DialogDescription>
          </DialogHeader>

          <DialogFooter className="flex gap-2 sm:gap-2">
            <Button 
              variant="ghost" 
              onClick={handleSkipTour}
              className="text-slate-400"
              data-testid="button-skip-tour"
            >
              Maybe Later
            </Button>
            <Button 
              onClick={handleStartTour}
              className="bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white"
              data-testid="button-start-tour"
            >
              <Sparkles className="w-4 h-4 mr-2" />
              Take a Tour
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    );
  }

  if (showTour) {
    const step = KRYSTLE_TOUR_STEPS[tourStep];
    const isLastStep = tourStep === KRYSTLE_TOUR_STEPS.length - 1;

    return (
      <Dialog open={showTour} onOpenChange={handleTourClose}>
        <DialogContent className="max-w-md bg-gradient-to-br from-slate-900 to-slate-800 border-slate-700">
          <DialogHeader>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                {step.icon}
                <DialogTitle className="text-lg text-white">{step.title}</DialogTitle>
              </div>
              <span className="text-xs text-slate-400">
                {tourStep + 1} / {KRYSTLE_TOUR_STEPS.length}
              </span>
            </div>
          </DialogHeader>

          <div className="py-4">
            <p className="text-slate-300 leading-relaxed">{step.description}</p>
            
            <div className="flex justify-center gap-1 mt-6">
              {KRYSTLE_TOUR_STEPS.map((_, idx) => (
                <div
                  key={idx}
                  className={`w-2 h-2 rounded-full transition-colors ${
                    idx === tourStep ? 'bg-amber-400' : 'bg-slate-600'
                  }`}
                />
              ))}
            </div>
          </div>

          <DialogFooter className="flex justify-between sm:justify-between">
            <Button
              variant="ghost"
              onClick={handleTourPrev}
              disabled={tourStep === 0}
              className="text-slate-400"
              data-testid="button-tour-prev"
            >
              <ChevronLeft className="w-4 h-4 mr-1" />
              Back
            </Button>
            <Button
              onClick={handleTourNext}
              className="bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white"
              data-testid="button-tour-next"
            >
              {isLastStep ? (
                <>
                  Got It!
                  <Sparkles className="w-4 h-4 ml-2" />
                </>
              ) : (
                <>
                  Next
                  <ChevronRight className="w-4 h-4 ml-1" />
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    );
  }

  if (isKrystle) {
    return (
      <Dialog open={showWelcome} onOpenChange={handleClose}>
        <DialogContent className="max-w-lg bg-gradient-to-br from-purple-50 to-pink-50 dark:from-purple-950 dark:to-pink-950">
          <DialogHeader>
            <div className="flex items-center gap-2 mb-2">
              <Sparkles className="h-6 w-6 text-purple-500" />
              <DialogTitle className="text-2xl text-slate-900 dark:text-white">Welcome, Krystle!</DialogTitle>
            </div>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <div className="bg-purple-100 dark:bg-purple-900/50 rounded-lg p-4 border border-purple-200 dark:border-purple-700 flex items-start gap-3">
              <Heart className="h-5 w-5 text-purple-600 dark:text-purple-400 flex-shrink-0 mt-0.5" />
              <div>
                <p className="text-base leading-relaxed text-slate-800 dark:text-slate-200">
                  I'm so glad you're our Lot Operations Manager. You do an amazing job keeping everything 
                  running smoothly - the whole team appreciates your hard work and dedication.
                </p>
              </div>
            </div>

            <div className="bg-amber-100 dark:bg-amber-900/50 rounded-lg p-4 border border-amber-200 dark:border-amber-700">
              <p className="text-sm font-semibold text-amber-800 dark:text-amber-300 mb-2">A Note About This Version:</p>
              <p className="text-sm leading-relaxed text-slate-800 dark:text-slate-200">
                I made this to help make things a little easier out here on the lot. This is still a version 
                I'm building - not the final product. If you get a chance to play around with it and check that 
                the workflow makes sense, I'd really appreciate it. If you see any issues or something doesn't 
                work right, just text me and let me know. Your input helps me make this better for everyone.
              </p>
            </div>

            <div className="bg-slate-100 dark:bg-slate-800 rounded-lg p-4 border border-slate-200 dark:border-slate-700">
              <p className="text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">What's Included So Far:</p>
              <ul className="text-sm text-slate-600 dark:text-slate-400 space-y-1">
                <li><strong>Dashboard Metrics</strong> - All key numbers at the top, like a car dashboard</li>
                <li><strong>Exotic Key Control</strong> - Track exotic car keys front and center</li>
                <li><strong>Lot Vision GPS</strong> - Find vehicles with Manheim's tracking system</li>
                <li><strong>Role Previews</strong> - See what Supervisors and Drivers see</li>
                <li><strong>Employee Files</strong> - Search records by name, badge, date range</li>
              </ul>
            </div>

            <div className="bg-blue-100 dark:bg-blue-900/50 rounded-lg p-4 border border-blue-200 dark:border-blue-700">
              <p className="text-sm leading-relaxed text-slate-800 dark:text-slate-200">
                I'm trying to build something that helps us all be more organized and efficient out here. 
                If there's <strong>anything</strong> you want changed or added to make it work better for you - 
                just let me know and I'll make it happen.
              </p>
            </div>

            <p className="text-xs text-slate-500 text-center italic">
              - Jason
            </p>
          </div>

          <DialogFooter>
            <Button 
              onClick={handleClose} 
              className="w-full bg-purple-600 hover:bg-purple-700"
              data-testid="button-close-welcome"
            >
              Let's Go!
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    );
  }

  const greeting = isOperationsManager 
    ? "Hello to the biggest Tennessee Titans fan this side of the Mississippi River!" 
    : "Hey there!";

  return (
    <Dialog open={showWelcome} onOpenChange={handleClose}>
      <DialogContent className="max-w-lg bg-gradient-to-br from-blue-50 to-slate-50 dark:from-blue-950 dark:to-slate-950">
        <DialogHeader>
          <div className="flex items-center gap-2 mb-2">
            <Sparkles className="h-6 w-6 text-blue-600" />
            <DialogTitle className="text-2xl text-slate-900 dark:text-white">{greeting}</DialogTitle>
          </div>
          <DialogDescription className="text-base leading-relaxed text-slate-700 dark:text-slate-300">
            It's Jason - I wanted to reach out personally for a second.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <div className="bg-purple-100 dark:bg-purple-900/50 rounded-lg p-4 border border-purple-200 dark:border-purple-700 flex items-start gap-3">
            <Heart className="h-5 w-5 text-purple-600 dark:text-purple-400 flex-shrink-0 mt-0.5" />
            <div>
              <p className="text-sm leading-relaxed text-slate-800 dark:text-slate-200">
                Me and the drivers - all the Lot Ops employees really - we genuinely appreciate the hard work 
                you do for us every day. We know you have a tough Daily Grind juggling schedules, managing crews, 
                and keeping everything running smoothly. <span className="font-bold text-purple-900 dark:text-purple-300">Thank you</span> for 
                everything you do.
              </p>
            </div>
          </div>

          <div className="bg-blue-100 dark:bg-blue-900/50 rounded-lg p-4 border border-blue-200 dark:border-blue-700">
            <p className="text-sm leading-relaxed text-slate-800 dark:text-slate-200">
              I built this app hoping it makes <span className="font-bold text-blue-900 dark:text-blue-300">your job easier</span> and 
              helps streamline the daily operations. If it can take even a little stress off your plate, 
              then it's worth it.
            </p>
          </div>

          <div className="bg-green-100 dark:bg-green-900/50 rounded-lg p-4 border border-green-200 dark:border-green-700">
            <p className="text-sm leading-relaxed text-slate-800 dark:text-slate-200">
              <span className="font-bold text-green-900 dark:text-green-300">If you have ideas or feedback</span>, please let me know. 
              Document it however works for you - text me, jot it down, whatever - and I'll do my best to 
              implement it as quickly as possible. This is a team effort and I need your input to make it work 
              for everyone. Thanks again for what you do, and I'll see you soon.
            </p>
          </div>

          <p className="text-xs text-slate-500 text-center italic">
            - Jason
          </p>
        </div>

        <DialogFooter>
          <Button 
            onClick={handleClose} 
            className="w-full bg-blue-600 hover:bg-blue-700"
            data-testid="button-close-welcome"
          >
            Let's Do This!
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
