import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { 
  ChevronRight, 
  ChevronLeft,
  Truck, 
  Navigation,
  TrendingUp,
  MessageSquare,
  Zap,
  Camera,
  MapPin,
  Lightbulb,
  CheckCircle2,
  Clock
} from "lucide-react";

interface DriverOnboardingProps {
  open: boolean;
  onClose: () => void;
}

export function DriverOnboarding({ open, onClose }: DriverOnboardingProps) {
  const [currentSlide, setCurrentSlide] = useState(0);

  const slides = [
    {
      title: "Welcome to Lot Ops Pro! 🎉",
      subtitle: "Van Driver System",
      icon: <Truck className="h-16 w-16 text-blue-400" />,
      content: (
        <div className="space-y-4">
          <p className="text-base text-gray-700 leading-relaxed">
            Your autonomous routing and performance tracking system for efficient lot operations.
          </p>
          <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
            <p className="font-semibold text-blue-900 mb-3">What you'll master today:</p>
            <ul className="text-sm text-blue-800 space-y-2">
              <li className="flex items-center gap-2"><CheckCircle2 className="h-4 w-4 text-green-600" /> Camera scanning & VIN reading</li>
              <li className="flex items-center gap-2"><CheckCircle2 className="h-4 w-4 text-green-600" /> GPS navigation to locations</li>
              <li className="flex items-center gap-2"><CheckCircle2 className="h-4 w-4 text-green-600" /> Performance tracking (MPH quotas)</li>
              <li className="flex items-center gap-2"><CheckCircle2 className="h-4 w-4 text-green-600" /> Real-time team communication</li>
              <li className="flex items-center gap-2"><CheckCircle2 className="h-4 w-4 text-green-600" /> Work order management</li>
            </ul>
          </div>
        </div>
      )
    },
    {
      title: "Your Main Dashboard",
      subtitle: "Three Key Sections",
      icon: <Navigation className="h-16 w-16 text-green-400" />,
      content: (
        <div className="space-y-3">
          <div className="bg-gradient-to-r from-blue-50 to-cyan-50 p-3 rounded-lg border border-blue-200">
            <p className="font-bold text-blue-900 mb-1">🚗 Crew Manager</p>
            <p className="text-sm text-blue-800">Start your shift here. Select your van, crew members, and view assignments.</p>
          </div>
          <div className="bg-gradient-to-r from-green-50 to-emerald-50 p-3 rounded-lg border border-green-200">
            <p className="font-bold text-green-900 mb-1">📍 GPS Navigation</p>
            <p className="text-sm text-green-800">Real-time turn-by-turn guidance to pickup and dropoff locations with distance countdown.</p>
          </div>
          <div className="bg-gradient-to-r from-purple-50 to-indigo-50 p-3 rounded-lg border border-purple-200">
            <p className="font-bold text-purple-900 mb-1">📊 Performance Tracking</p>
            <p className="text-sm text-purple-800">Monitor your moves per hour (target 4.5 MPH), quota progress, and bonus earnings.</p>
          </div>
        </div>
      )
    },
    {
      title: "Step 1: Start Your Shift",
      subtitle: "Crew Manager",
      icon: <Truck className="h-16 w-16 text-blue-400" />,
      content: (
        <div className="space-y-4">
          <ol className="space-y-3 text-sm">
            <li className="flex gap-3">
              <span className="font-bold bg-blue-100 text-blue-900 px-2.5 py-0.5 rounded-full min-w-fit">1</span>
              <span>Look for the <strong>"Crew Manager"</strong> option on your dashboard</span>
            </li>
            <li className="flex gap-3">
              <span className="font-bold bg-blue-100 text-blue-900 px-2.5 py-0.5 rounded-full min-w-fit">2</span>
              <span>Select your assigned van number</span>
            </li>
            <li className="flex gap-3">
              <span className="font-bold bg-blue-100 text-blue-900 px-2.5 py-0.5 rounded-full min-w-fit">3</span>
              <span>Add crew members working with you today</span>
            </li>
            <li className="flex gap-3">
              <span className="font-bold bg-blue-100 text-blue-900 px-2.5 py-0.5 rounded-full min-w-fit">4</span>
              <span>Click <strong>"Start Shift"</strong> to begin receiving assignments</span>
            </li>
          </ol>
          <div className="bg-blue-50 p-3 rounded border border-blue-200">
            <p className="text-xs text-blue-800"><Lightbulb className="inline h-3 w-3 mr-1" /><strong>Tip:</strong> Your supervisor assigns work - you focus on efficient execution!</p>
          </div>
        </div>
      )
    },
    {
      title: "Step 2: Scan & Read Vehicles",
      subtitle: "Camera OCR Scanner",
      icon: <Camera className="h-16 w-16 text-yellow-400" />,
      content: (
        <div className="space-y-4">
          <ol className="space-y-3 text-sm">
            <li className="flex gap-3">
              <span className="font-bold bg-yellow-100 text-yellow-900 px-2.5 py-0.5 rounded-full min-w-fit">1</span>
              <span>When assigned a work order, look for the <strong>📸 Scanner</strong> button</span>
            </li>
            <li className="flex gap-3">
              <span className="font-bold bg-yellow-100 text-yellow-900 px-2.5 py-0.5 rounded-full min-w-fit">2</span>
              <span>Point your camera at the car sticker (Work Order tag, Routing label, or Sale Lane number)</span>
            </li>
            <li className="flex gap-3">
              <span className="font-bold bg-yellow-100 text-yellow-900 px-2.5 py-0.5 rounded-full min-w-fit">3</span>
              <span>System instantly reads the VIN and work order information</span>
            </li>
            <li className="flex gap-3">
              <span className="font-bold bg-yellow-100 text-yellow-900 px-2.5 py-0.5 rounded-full min-w-fit">4</span>
              <span>Confirm details and get your next destination</span>
            </li>
          </ol>
          <div className="bg-yellow-50 p-3 rounded border border-yellow-200">
            <p className="text-xs text-yellow-800"><Lightbulb className="inline h-3 w-3 mr-1" /><strong>No Camera?</strong> Just type the work order manually - system still works perfectly!</p>
          </div>
        </div>
      )
    },
    {
      title: "Step 3: Navigate to Location",
      subtitle: "Real-Time GPS Guidance",
      icon: <MapPin className="h-16 w-16 text-red-400" />,
      content: (
        <div className="space-y-4">
          <ol className="space-y-3 text-sm">
            <li className="flex gap-3">
              <span className="font-bold bg-red-100 text-red-900 px-2.5 py-0.5 rounded-full min-w-fit">1</span>
              <span>After scanning, your destination appears on the map</span>
            </li>
            <li className="flex gap-3">
              <span className="font-bold bg-red-100 text-red-900 px-2.5 py-0.5 rounded-full min-w-fit">2</span>
              <span>Follow the <strong>blue route</strong> with turn-by-turn directions</span>
            </li>
            <li className="flex gap-3">
              <span className="font-bold bg-red-100 text-red-900 px-2.5 py-0.5 rounded-full min-w-fit">3</span>
              <span>Watch the <strong>distance countdown</strong> to destination</span>
            </li>
            <li className="flex gap-3">
              <span className="font-bold bg-red-100 text-red-900 px-2.5 py-0.5 rounded-full min-w-fit">4</span>
              <span>When you arrive, tap <strong>"Completed"</strong> to finish the move</span>
            </li>
          </ol>
          <div className="bg-red-50 p-3 rounded border border-red-200">
            <p className="text-xs text-red-800"><Lightbulb className="inline h-3 w-3 mr-1" /><strong>GPS Tip:</strong> The system guides you - no need to know the lot layout!</p>
          </div>
        </div>
      )
    },
    {
      title: "Step 4: Track Your Performance",
      subtitle: "Moves Per Hour & Quotas",
      icon: <TrendingUp className="h-16 w-16 text-purple-400" />,
      content: (
        <div className="space-y-4">
          <ol className="space-y-3 text-sm">
            <li className="flex gap-3">
              <span className="font-bold bg-purple-100 text-purple-900 px-2.5 py-0.5 rounded-full min-w-fit">1</span>
              <span>System automatically tracks your <strong>Moves Per Hour (MPH)</strong></span>
            </li>
            <li className="flex gap-3">
              <span className="font-bold bg-purple-100 text-purple-900 px-2.5 py-0.5 rounded-full min-w-fit">2</span>
              <span>Your target is <strong>4.5 MPH</strong> - track your progress</span>
            </li>
            <li className="flex gap-3">
              <span className="font-bold bg-purple-100 text-purple-900 px-2.5 py-0.5 rounded-full min-w-fit">3</span>
              <span>Check your daily, weekly, and monthly stats anytime</span>
            </li>
            <li className="flex gap-3">
              <span className="font-bold bg-purple-100 text-purple-900 px-2.5 py-0.5 rounded-full min-w-fit">4</span>
              <span>Bonus calculations happen automatically based on your performance</span>
            </li>
          </ol>
          <div className="bg-purple-50 p-3 rounded border border-purple-200">
            <p className="text-xs text-purple-800"><Lightbulb className="inline h-3 w-3 mr-1" /><strong>System Does the Math:</strong> Focus on efficient moves - we track everything else!</p>
          </div>
        </div>
      )
    },
    {
      title: "Step 5: Communicate with Supervisor",
      subtitle: "Real-Time Messaging",
      icon: <MessageSquare className="h-16 w-16 text-blue-400" />,
      content: (
        <div className="space-y-4">
          <ol className="space-y-3 text-sm">
            <li className="flex gap-3">
              <span className="font-bold bg-blue-100 text-blue-900 px-2.5 py-0.5 rounded-full min-w-fit">1</span>
              <span>Look for the <strong>💬 Chat</strong> button (bottom right of screen)</span>
            </li>
            <li className="flex gap-3">
              <span className="font-bold bg-blue-100 text-blue-900 px-2.5 py-0.5 rounded-full min-w-fit">2</span>
              <span>Send messages to your supervisor anytime</span>
            </li>
            <li className="flex gap-3">
              <span className="font-bold bg-blue-100 text-blue-900 px-2.5 py-0.5 rounded-full min-w-fit">3</span>
              <span>Receive messages and alerts from your supervisor instantly</span>
            </li>
            <li className="flex gap-3">
              <span className="font-bold bg-blue-100 text-blue-900 px-2.5 py-0.5 rounded-full min-w-fit">4</span>
              <span>All messages are logged for your records</span>
            </li>
          </ol>
          <div className="bg-blue-50 p-3 rounded border border-blue-200">
            <p className="text-xs text-blue-800"><Lightbulb className="inline h-3 w-3 mr-1" /><strong>Pro Tip:</strong> Communication keeps everything efficient - speak up if you need help!</p>
          </div>
        </div>
      )
    },
    {
      title: "Quick Tips for Success 🚀",
      subtitle: "Maximize Your Efficiency",
      icon: <Zap className="h-16 w-16 text-yellow-400" />,
      content: (
        <div className="space-y-3">
          <div className="bg-yellow-50 p-3 rounded-lg border border-yellow-200">
            <p className="font-bold text-yellow-900 mb-2">⚡ Daily Workflow:</p>
            <ol className="text-sm text-yellow-800 space-y-1 list-decimal list-inside">
              <li>Start Crew Manager at beginning of shift</li>
              <li>Scan cars as supervisor assigns them</li>
              <li>Navigate using GPS to destination</li>
              <li>Complete move when you arrive</li>
              <li>Repeat - system tracks MPH automatically</li>
            </ol>
          </div>
          <div className="bg-green-50 p-3 rounded-lg border border-green-200">
            <p className="text-xs text-green-800"><CheckCircle2 className="inline h-4 w-4 mr-1" /> <strong>Focus on moving cars efficiently</strong> - the system handles all the tracking!</p>
          </div>
          <div className="bg-blue-50 p-3 rounded-lg border border-blue-200">
            <p className="text-xs text-blue-800"><Clock className="inline h-4 w-4 mr-1" /> <strong>Efficient routing + quick scanning = higher MPH = better bonus!</strong></p>
          </div>
        </div>
      )
    },
    {
      title: "You're Ready! 🎯",
      subtitle: "Questions? Ask Your Supervisor",
      icon: <CheckCircle2 className="h-16 w-16 text-green-400" />,
      content: (
        <div className="space-y-4">
          <div className="text-center space-y-2">
            <p className="text-lg font-semibold text-gray-800">You're all set to drive efficiently!</p>
            <p className="text-sm text-gray-600">The system guides you - just focus on completing moves.</p>
          </div>
          <div className="bg-green-50 p-4 rounded-lg border border-green-200">
            <p className="font-semibold text-green-900 mb-2">📚 Quick Reference:</p>
            <ul className="text-sm text-green-800 space-y-1">
              <li>✓ Crew Manager: Start shift & select van</li>
              <li>✓ Scanner: Scan car stickers</li>
              <li>✓ GPS: Follow map to destination</li>
              <li>✓ Performance: MPH tracked automatically</li>
              <li>✓ Chat: Message supervisor anytime</li>
            </ul>
          </div>
          <div className="bg-gradient-to-r from-cyan-50 to-blue-50 p-4 rounded-lg border border-cyan-200">
            <p className="font-semibold text-cyan-900 mb-2">📽️ View Complete Presentation</p>
            <p className="text-sm text-cyan-800 mb-3">Watch the 35-slide interactive presentation to see how Lot Ops Pro works and all its amazing features.</p>
            <Button 
              onClick={() => window.location.href = "/slideshow"}
              className="w-full bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-700 hover:to-blue-700 text-white"
            >
              ▶️ View Full Presentation
            </Button>
          </div>
          <p className="text-xs text-center text-gray-600">Your supervisor can show you this guide anytime!</p>
        </div>
      )
    }
  ];

  const nextSlide = () => {
    setCurrentSlide((prev) => (prev + 1) % slides.length);
  };

  const prevSlide = () => {
    setCurrentSlide((prev) => (prev - 1 + slides.length) % slides.length);
  };

  const slide = slides[currentSlide];

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-hidden flex flex-col bg-gradient-to-br from-slate-900 to-slate-800 border-slate-700">
        <DialogHeader className="pb-0">
          <div className="flex items-center justify-center mb-4">
            {slide.icon}
          </div>
          <DialogTitle className="text-2xl text-center text-white">{slide.title}</DialogTitle>
          <DialogDescription className="text-center text-slate-300">
            {slide.subtitle}
          </DialogDescription>
        </DialogHeader>

        <div className="flex-1 overflow-y-auto px-6 py-6">
          <div className="text-slate-200">
            {slide.content}
          </div>
        </div>

        <div className="flex items-center justify-between px-6 pb-6 pt-4 border-t border-slate-700">
          <Button
            variant="outline"
            size="sm"
            onClick={prevSlide}
            disabled={currentSlide === 0}
            className="border-slate-600 text-slate-300 hover:bg-slate-700"
          >
            <ChevronLeft className="h-4 w-4 mr-1" />
            Back
          </Button>

          <div className="flex items-center gap-2">
            {slides.map((_, idx) => (
              <div
                key={idx}
                className={`h-2 rounded-full transition-all ${
                  idx === currentSlide
                    ? "bg-blue-500 w-6"
                    : "bg-slate-600 w-2"
                }`}
              />
            ))}
          </div>

          <Button
            onClick={nextSlide}
            disabled={currentSlide === slides.length - 1}
            className="bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-500 hover:to-blue-600"
          >
            Next
            <ChevronRight className="h-4 w-4 ml-1" />
          </Button>
        </div>

        <div className="px-6 pb-4">
          <Button
            onClick={onClose}
            variant="ghost"
            className="w-full text-slate-300 hover:bg-slate-700"
          >
            Done
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
