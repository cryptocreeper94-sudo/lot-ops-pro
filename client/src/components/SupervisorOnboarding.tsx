import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { 
  ChevronRight, 
  ChevronLeft,
  Users, 
  Truck, 
  Zap,
  BarChart3,
  MessageSquare,
  AlertTriangle,
  MapPin,
  Clock,
  TrendingUp,
  Lightbulb,
  CheckCircle2,
  HelpCircle
} from "lucide-react";

interface SupervisorOnboardingProps {
  open: boolean;
  onClose: () => void;
}

export function SupervisorOnboarding({ open, onClose }: SupervisorOnboardingProps) {
  const [currentSlide, setCurrentSlide] = useState(0);

  const slides = [
    {
      title: "Welcome to Lot Ops Pro! 🎉",
      subtitle: "Your Supervisor Command Center",
      icon: <Users className="h-16 w-16 text-blue-400" />,
      content: (
        <div className="space-y-4">
          <p className="text-base text-gray-700 leading-relaxed">
            This is your complete command center for managing today's lot operations efficiently and easily.
          </p>
          <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
            <p className="font-semibold text-blue-900 mb-3">What you'll master today:</p>
            <ul className="text-sm text-blue-800 space-y-2">
              <li className="flex items-center gap-2"><CheckCircle2 className="h-4 w-4 text-green-600" /> Assign drivers to vans</li>
              <li className="flex items-center gap-2"><CheckCircle2 className="h-4 w-4 text-green-600" /> Real-time driver tracking</li>
              <li className="flex items-center gap-2"><CheckCircle2 className="h-4 w-4 text-green-600" /> OCR vehicle scanning</li>
              <li className="flex items-center gap-2"><CheckCircle2 className="h-4 w-4 text-green-600" /> Performance analytics</li>
              <li className="flex items-center gap-2"><CheckCircle2 className="h-4 w-4 text-green-600" /> Team communication</li>
            </ul>
          </div>
        </div>
      )
    },
    {
      title: "Understanding Your Dashboard",
      subtitle: "Three Main Sections",
      icon: <BarChart3 className="h-16 w-16 text-purple-400" />,
      content: (
        <div className="space-y-3">
          <div className="bg-gradient-to-r from-purple-50 to-blue-50 p-3 rounded-lg border border-purple-200">
            <p className="font-bold text-purple-900 mb-1">📋 Config & Roster Tab</p>
            <p className="text-sm text-purple-800">Assign your team to vans. Set shifts. Manage today's crew structure.</p>
          </div>
          <div className="bg-gradient-to-r from-green-50 to-emerald-50 p-3 rounded-lg border border-green-200">
            <p className="font-bold text-green-900 mb-1">🗺️ Dispatch Tab</p>
            <p className="text-sm text-green-800">See LIVE where every driver is. Watch moves happen in real-time on the map.</p>
          </div>
          <div className="bg-gradient-to-r from-orange-50 to-yellow-50 p-3 rounded-lg border border-orange-200">
            <p className="font-bold text-orange-900 mb-1">📸 Scanner Tab</p>
            <p className="text-sm text-orange-800">Point camera at car stickers. Auto-read VIN. Create work orders instantly.</p>
          </div>
          <div className="bg-gradient-to-r from-blue-50 to-indigo-50 p-3 rounded-lg border border-blue-200">
            <p className="font-bold text-blue-900 mb-1">📊 Analytics Tab</p>
            <p className="text-sm text-blue-800">View performance reports, quotas, efficiency. AI-powered insights for improvements.</p>
          </div>
        </div>
      )
    },
    {
      title: "Step 1: Set Up Your Roster",
      subtitle: "Assign Team to Vans",
      icon: <Truck className="h-16 w-16 text-green-400" />,
      content: (
        <div className="space-y-4">
          <ol className="space-y-3 text-sm">
            <li className="flex gap-3">
              <span className="font-bold bg-green-100 text-green-900 px-2.5 py-0.5 rounded-full min-w-fit">1</span>
              <span>Go to <strong>"Config & Roster"</strong> tab</span>
            </li>
            <li className="flex gap-3">
              <span className="font-bold bg-green-100 text-green-900 px-2.5 py-0.5 rounded-full min-w-fit">2</span>
              <span>Under <strong>"Roster"</strong>, select employees from your team</span>
            </li>
            <li className="flex gap-3">
              <span className="font-bold bg-green-100 text-green-900 px-2.5 py-0.5 rounded-full min-w-fit">3</span>
              <span>Assign them to specific vans (Van 1, Van 2, Van 3, etc.)</span>
            </li>
            <li className="flex gap-3">
              <span className="font-bold bg-green-100 text-green-900 px-2.5 py-0.5 rounded-full min-w-fit">4</span>
              <span>Set shift: <strong>First</strong>, <strong>Second</strong>, or <strong>Off</strong></span>
            </li>
            <li className="flex gap-3">
              <span className="font-bold bg-green-100 text-green-900 px-2.5 py-0.5 rounded-full min-w-fit">5</span>
              <span>Toggle driver status: <strong>Active</strong>, <strong>Break</strong>, or <strong>End Shift</strong></span>
            </li>
          </ol>
          <div className="bg-yellow-50 p-3 rounded border border-yellow-200">
            <p className="text-xs text-yellow-800"><Lightbulb className="inline h-3 w-3 mr-1" /><strong>Pro Tip:</strong> Bulk-select multiple drivers and assign them all at once!</p>
          </div>
        </div>
      )
    },
    {
      title: "Step 2: Create Work Orders",
      subtitle: "Scan Stickers → Auto-Create Tasks",
      icon: <Zap className="h-16 w-16 text-yellow-400" />,
      content: (
        <div className="space-y-4">
          <ol className="space-y-3 text-sm">
            <li className="flex gap-3">
              <span className="font-bold bg-yellow-100 text-yellow-900 px-2.5 py-0.5 rounded-full min-w-fit">1</span>
              <span>Go to <strong>"Scanner"</strong> tab</span>
            </li>
            <li className="flex gap-3">
              <span className="font-bold bg-yellow-100 text-yellow-900 px-2.5 py-0.5 rounded-full min-w-fit">2</span>
              <span>Click <strong>"📸 Scan with Camera"</strong> button</span>
            </li>
            <li className="flex gap-3">
              <span className="font-bold bg-yellow-100 text-yellow-900 px-2.5 py-0.5 rounded-full min-w-fit">3</span>
              <span>Point camera at car sticker (Work Order, Routing, Sale Lane tag)</span>
            </li>
            <li className="flex gap-3">
              <span className="font-bold bg-yellow-100 text-yellow-900 px-2.5 py-0.5 rounded-full min-w-fit">4</span>
              <span>System auto-reads VIN, work order, and destination code</span>
            </li>
            <li className="flex gap-3">
              <span className="font-bold bg-yellow-100 text-yellow-900 px-2.5 py-0.5 rounded-full min-w-fit">5</span>
              <span>Review and assign task to the right driver</span>
            </li>
          </ol>
          <div className="bg-yellow-50 p-3 rounded border border-yellow-200">
            <p className="text-xs text-yellow-800"><Lightbulb className="inline h-3 w-3 mr-1" /><strong>Note:</strong> If camera fails, just type the Work Order number manually!</p>
          </div>
        </div>
      )
    },
    {
      title: "Step 3: Monitor Drivers in Real-Time",
      subtitle: "Live Map View",
      icon: <MapPin className="h-16 w-16 text-red-400" />,
      content: (
        <div className="space-y-4">
          <ol className="space-y-3 text-sm">
            <li className="flex gap-3">
              <span className="font-bold bg-red-100 text-red-900 px-2.5 py-0.5 rounded-full min-w-fit">1</span>
              <span>Go to <strong>"Dispatch"</strong> tab</span>
            </li>
            <li className="flex gap-3">
              <span className="font-bold bg-red-100 text-red-900 px-2.5 py-0.5 rounded-full min-w-fit">2</span>
              <span>See every driver's live location on the facility map</span>
            </li>
            <li className="flex gap-3">
              <span className="font-bold bg-red-100 text-red-900 px-2.5 py-0.5 rounded-full min-w-fit">3</span>
              <span>Check driver status: <strong>Idle</strong>, <strong>Busy</strong>, or <strong>Break</strong></span>
            </li>
            <li className="flex gap-3">
              <span className="font-bold bg-red-100 text-red-900 px-2.5 py-0.5 rounded-full min-w-fit">4</span>
              <span>See current task and next destination for each driver</span>
            </li>
            <li className="flex gap-3">
              <span className="font-bold bg-red-100 text-red-900 px-2.5 py-0.5 rounded-full min-w-fit">5</span>
              <span>Send instant messages to drivers using chat overlay</span>
            </li>
          </ol>
          <div className="bg-red-50 p-3 rounded border border-red-200">
            <p className="text-xs text-red-800"><Lightbulb className="inline h-3 w-3 mr-1" /><strong>GPS Tip:</strong> Map updates every 30 seconds. Zoom in/out to see detail or full facility.</p>
          </div>
        </div>
      )
    },
    {
      title: "Step 4: Track Performance",
      subtitle: "Analytics & Quotas",
      icon: <TrendingUp className="h-16 w-16 text-purple-400" />,
      content: (
        <div className="space-y-4">
          <ol className="space-y-3 text-sm">
            <li className="flex gap-3">
              <span className="font-bold bg-purple-100 text-purple-900 px-2.5 py-0.5 rounded-full min-w-fit">1</span>
              <span>Go to <strong>"Analytics"</strong> tab</span>
            </li>
            <li className="flex gap-3">
              <span className="font-bold bg-purple-100 text-purple-900 px-2.5 py-0.5 rounded-full min-w-fit">2</span>
              <span>View driver <strong>Moves Per Hour (MPH)</strong> against 4.5 target quota</span>
            </li>
            <li className="flex gap-3">
              <span className="font-bold bg-purple-100 text-purple-900 px-2.5 py-0.5 rounded-full min-w-fit">3</span>
              <span>See daily, weekly, monthly performance breakdowns</span>
            </li>
            <li className="flex gap-3">
              <span className="font-bold bg-purple-100 text-purple-900 px-2.5 py-0.5 rounded-full min-w-fit">4</span>
              <span>Check AI-powered insights and efficiency recommendations</span>
            </li>
            <li className="flex gap-3">
              <span className="font-bold bg-purple-100 text-purple-900 px-2.5 py-0.5 rounded-full min-w-fit">5</span>
              <span>Export reports to CSV/Excel or generate PDF for meetings</span>
            </li>
          </ol>
          <div className="bg-purple-50 p-3 rounded border border-purple-200">
            <p className="text-xs text-purple-800"><Lightbulb className="inline h-3 w-3 mr-1" /><strong>System Tracks Automatically:</strong> Moves, completion rates, downtime, bonus calculations!</p>
          </div>
        </div>
      )
    },
    {
      title: "Step 5: Communicate with Your Team",
      subtitle: "Real-Time Messaging",
      icon: <MessageSquare className="h-16 w-16 text-blue-400" />,
      content: (
        <div className="space-y-4">
          <ol className="space-y-3 text-sm">
            <li className="flex gap-3">
              <span className="font-bold bg-blue-100 text-blue-900 px-2.5 py-0.5 rounded-full min-w-fit">1</span>
              <span>Look for the <strong>messaging icon</strong> or <strong>Chat</strong> button (bottom right)</span>
            </li>
            <li className="flex gap-3">
              <span className="font-bold bg-blue-100 text-blue-900 px-2.5 py-0.5 rounded-full min-w-fit">2</span>
              <span>Send <strong>Broadcast</strong> (all drivers) or <strong>Direct</strong> (specific driver) messages</span>
            </li>
            <li className="flex gap-3">
              <span className="font-bold bg-blue-100 text-blue-900 px-2.5 py-0.5 rounded-full min-w-fit">3</span>
              <span>Messages appear instantly on drivers' screens</span>
            </li>
            <li className="flex gap-3">
              <span className="font-bold bg-blue-100 text-blue-900 px-2.5 py-0.5 rounded-full min-w-fit">4</span>
              <span>See read status and timestamps for every message</span>
            </li>
            <li className="flex gap-3">
              <span className="font-bold bg-blue-100 text-blue-900 px-2.5 py-0.5 rounded-full min-w-fit">5</span>
              <span>Messages are logged and saved in the database for compliance</span>
            </li>
          </ol>
          <div className="bg-blue-50 p-3 rounded border border-blue-200">
            <p className="text-xs text-blue-800"><Lightbulb className="inline h-3 w-3 mr-1" /><strong>Pro Tip:</strong> Use broadcast messages to send updates about lane changes or emergencies!</p>
          </div>
        </div>
      )
    },
    {
      title: "Quick Tips for Efficiency 🚀",
      subtitle: "Best Practices",
      icon: <Lightbulb className="h-16 w-16 text-yellow-400" />,
      content: (
        <div className="space-y-3">
          <div className="bg-yellow-50 p-3 rounded-lg border border-yellow-200">
            <p className="font-bold text-yellow-900 mb-2">⚡ Daily Workflow Order:</p>
            <ol className="text-sm text-yellow-800 space-y-1 list-decimal list-inside">
              <li>Set up Roster in morning</li>
              <li>Scan work orders as they come in</li>
              <li>Assign tasks to drivers immediately</li>
              <li>Monitor dispatch map throughout day</li>
              <li>Check analytics for performance trends</li>
            </ol>
          </div>
          <div className="bg-green-50 p-3 rounded-lg border border-green-200">
            <p className="text-xs text-green-800"><CheckCircle2 className="inline h-4 w-4 mr-1" /> <strong>System tracks everything automatically</strong> - Focus on assignments, let tech handle metrics!</p>
          </div>
          <div className="bg-blue-50 p-3 rounded-lg border border-blue-200">
            <p className="text-xs text-blue-800"><MessageSquare className="inline h-4 w-4 mr-1" /> <strong>Use messaging for urgent changes</strong> - Drivers see it instantly on their phones!</p>
          </div>
        </div>
      )
    },
    {
      title: "You're Ready! 🎯",
      subtitle: "Questions? Click Help Button Anytime",
      icon: <CheckCircle2 className="h-16 w-16 text-green-400" />,
      content: (
        <div className="space-y-4">
          <div className="text-center space-y-2">
            <p className="text-lg font-semibold text-gray-800">You're all set to manage lot operations efficiently!</p>
            <p className="text-sm text-gray-600">This tutorial is always available in the top-right corner.</p>
          </div>
          <div className="bg-green-50 p-4 rounded-lg border border-green-200">
            <p className="font-semibold text-green-900 mb-2">📚 Quick Reference:</p>
            <ul className="text-sm text-green-800 space-y-1">
              <li>✓ Roster setup: Config & Roster tab</li>
              <li>✓ Scanning: Scanner tab with camera</li>
              <li>✓ Live tracking: Dispatch tab map</li>
              <li>✓ Performance data: Analytics tab</li>
              <li>✓ Team comms: Chat overlay</li>
            </ul>
          </div>
          <div className="bg-gradient-to-r from-cyan-50 to-blue-50 p-4 rounded-lg border border-cyan-200">
            <p className="font-semibold text-cyan-900 mb-2">📽️ View Complete Presentation</p>
            <p className="text-sm text-cyan-800 mb-3">Watch the 35-slide interactive presentation to learn about all Lot Ops Pro features and capabilities.</p>
            <Button 
              onClick={() => window.location.href = "/slideshow"}
              className="w-full bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-700 hover:to-blue-700 text-white"
            >
              ▶️ View Full Presentation
            </Button>
          </div>
          <p className="text-xs text-center text-gray-600">Click the <strong>Help</strong> button anytime to review these steps!</p>
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
