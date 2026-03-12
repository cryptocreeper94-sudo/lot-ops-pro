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
  TrendingUp
} from "lucide-react";

interface TeresaSupervisorOnboardingProps {
  open: boolean;
  onClose: () => void;
}

export function TeresaSupervisorOnboarding({ open, onClose }: TeresaSupervisorOnboardingProps) {
  const [currentSlide, setCurrentSlide] = useState(0);

  const slides = [
    {
      title: "Hi Teresa! 👋",
      subtitle: "Welcome to Your Supervisor Dashboard",
      icon: <Users className="h-16 w-16 text-blue-400" />,
      content: (
        <div className="space-y-4">
          <p className="text-base text-gray-700">
            This is your command center for managing the entire lot operation today.
          </p>
          <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
            <p className="font-semibold text-blue-900 mb-2">What you'll learn:</p>
            <ul className="text-sm text-blue-800 space-y-1">
              <li>✓ How to assign drivers and vans</li>
              <li>✓ How to monitor real-time driver activity</li>
              <li>✓ How to scan work orders and create tasks</li>
              <li>✓ How to track performance and quotas</li>
              <li>✓ How to communicate with your team</li>
            </ul>
          </div>
        </div>
      )
    },
    {
      title: "Your Dashboard Tabs",
      subtitle: "Complete Overview of Everything",
      icon: <BarChart3 className="h-16 w-16 text-purple-400" />,
      content: (
        <div className="space-y-3">
          <div className="bg-gradient-to-r from-purple-50 to-blue-50 p-3 rounded-lg border border-purple-200">
            <p className="font-semibold text-purple-900 mb-1">📊 Config & Roster</p>
            <p className="text-sm text-purple-800">Set up your lot sections, assign drivers to vans, and manage your team structure.</p>
          </div>
          <div className="bg-gradient-to-r from-green-50 to-emerald-50 p-3 rounded-lg border border-green-200">
            <p className="font-semibold text-green-900 mb-1">📍 Dispatch</p>
            <p className="text-sm text-green-800">See where every driver is in real-time. Watch moves happen live on the map.</p>
          </div>
          <div className="bg-gradient-to-r from-orange-50 to-yellow-50 p-3 rounded-lg border border-orange-200">
            <p className="font-semibold text-orange-900 mb-1">📸 Scanner</p>
            <p className="text-sm text-orange-800">Use your camera to scan car stickers and instantly create work orders.</p>
          </div>
          <div className="bg-gradient-to-r from-pink-50 to-red-50 p-3 rounded-lg border border-pink-200">
            <p className="font-semibold text-pink-900 mb-1">📈 Analytics</p>
            <p className="text-sm text-pink-800">View performance reports, quotas, efficiency scores, and AI-powered insights.</p>
          </div>
        </div>
      )
    },
    {
      title: "Getting Started: Roster Setup",
      subtitle: "Assign Your Team to Vans",
      icon: <Truck className="h-16 w-16 text-green-400" />,
      content: (
        <div className="space-y-4">
          <ol className="space-y-2 text-sm">
            <li className="flex gap-3">
              <span className="font-bold bg-green-100 text-green-900 px-2 rounded">1</span>
              <span>Click the <strong>"Config & Roster"</strong> tab</span>
            </li>
            <li className="flex gap-3">
              <span className="font-bold bg-green-100 text-green-900 px-2 rounded">2</span>
              <span>Under the <strong>"Roster"</strong> section, select employees and assign them to vans</span>
            </li>
            <li className="flex gap-3">
              <span className="font-bold bg-green-100 text-green-900 px-2 rounded">3</span>
              <span>Set their daily shift (First Shift / Second Shift) using the toggle at the top</span>
            </li>
            <li className="flex gap-3">
              <span className="font-bold bg-green-100 text-green-900 px-2 rounded">4</span>
              <span>Check their status: <strong>Active</strong>, <strong>Break</strong>, or <strong>End Shift</strong></span>
            </li>
          </ol>
          <div className="bg-yellow-50 p-3 rounded border border-yellow-200">
            <p className="text-xs text-yellow-800"><strong>Pro Tip:</strong> You can quickly assign multiple drivers at once by selecting their names and clicking "Assign to Van"</p>
          </div>
        </div>
      )
    },
    {
      title: "Creating Work Orders",
      subtitle: "Scan Stickers → Auto-Create Tasks",
      icon: <Zap className="h-16 w-16 text-yellow-400" />,
      content: (
        <div className="space-y-4">
          <ol className="space-y-2 text-sm">
            <li className="flex gap-3">
              <span className="font-bold bg-yellow-100 text-yellow-900 px-2 rounded">1</span>
              <span>Open the <strong>"Scanner"</strong> tab</span>
            </li>
            <li className="flex gap-3">
              <span className="font-bold bg-yellow-100 text-yellow-900 px-2 rounded">2</span>
              <span>Point your camera at any car sticker (Work Order tag, Routing label, Sale Lane number)</span>
            </li>
            <li className="flex gap-3">
              <span className="font-bold bg-yellow-100 text-yellow-900 px-2 rounded">3</span>
              <span>The system instantly reads the VIN and creates a work order</span>
            </li>
            <li className="flex gap-3">
              <span className="font-bold bg-yellow-100 text-yellow-900 px-2 rounded">4</span>
              <span>Assign the task to a driver and they'll see it immediately</span>
            </li>
          </ol>
          <div className="bg-blue-50 p-3 rounded border border-blue-200">
            <p className="text-xs text-blue-800"><strong>Note:</strong> Work orders are saved to the database automatically. You can track them in real-time.</p>
          </div>
        </div>
      )
    },
    {
      title: "Monitoring Driver Activity",
      subtitle: "Real-Time Dispatch & Location Tracking",
      icon: <MapPin className="h-16 w-16 text-red-400" />,
      content: (
        <div className="space-y-4">
          <ol className="space-y-2 text-sm">
            <li className="flex gap-3">
              <span className="font-bold bg-red-100 text-red-900 px-2 rounded">1</span>
              <span>Click the <strong>"Dispatch"</strong> tab to see the live facility map</span>
            </li>
            <li className="flex gap-3">
              <span className="font-bold bg-red-100 text-red-900 px-2 rounded">2</span>
              <span>Watch drivers move in real-time as they complete tasks</span>
            </li>
            <li className="flex gap-3">
              <span className="font-bold bg-red-100 text-red-900 px-2 rounded">3</span>
              <span>Click any driver card to see their current van, status, and assigned tasks</span>
            </li>
            <li className="flex gap-3">
              <span className="font-bold bg-red-100 text-red-900 px-2 rounded">4</span>
              <span>Use the messaging feature to communicate with drivers instantly</span>
            </li>
          </ol>
          <div className="bg-green-50 p-3 rounded border border-green-200">
            <p className="text-xs text-green-800"><strong>Live Feature:</strong> The map updates every 5 seconds. You'll see moves as they happen.</p>
          </div>
        </div>
      )
    },
    {
      title: "Performance & Analytics",
      subtitle: "Track Quotas, Efficiency & Team Stats",
      icon: <TrendingUp className="h-16 w-16 text-purple-400" />,
      content: (
        <div className="space-y-4">
          <ol className="space-y-2 text-sm">
            <li className="flex gap-3">
              <span className="font-bold bg-purple-100 text-purple-900 px-2 rounded">1</span>
              <span>Open the <strong>"Analytics"</strong> tab for comprehensive reports</span>
            </li>
            <li className="flex gap-3">
              <span className="font-bold bg-purple-100 text-purple-900 px-2 rounded">2</span>
              <span>View <strong>Moves Per Hour (MPH)</strong> - target is 4.5 MPH for your team</span>
            </li>
            <li className="flex gap-3">
              <span className="font-bold bg-purple-100 text-purple-900 px-2 rounded">3</span>
              <span>Check <strong>Work Order Completion Rate</strong> - see which drivers are hitting quota</span>
            </li>
            <li className="flex gap-3">
              <span className="font-bold bg-purple-100 text-purple-900 px-2 rounded">4</span>
              <span>Export reports to Excel/CSV or share with Teresa's team</span>
            </li>
          </ol>
          <div className="bg-orange-50 p-3 rounded border border-orange-200">
            <p className="text-xs text-orange-800"><strong>AI Insights:</strong> The system provides AI-powered recommendations to improve efficiency and spot issues early.</p>
          </div>
        </div>
      )
    },
    {
      title: "Quick Tips for Success",
      subtitle: "Make the Most of Your System",
      icon: <AlertTriangle className="h-16 w-16 text-blue-400" />,
      content: (
        <div className="space-y-3">
          <div className="bg-gradient-to-r from-blue-50 to-cyan-50 p-3 rounded-lg border border-blue-200">
            <p className="font-semibold text-blue-900 mb-2">💡 Pro Tips:</p>
            <ul className="text-sm text-blue-800 space-y-2">
              <li>• <strong>Bulk Assign:</strong> Use the "Assign Drivers" feature to set multiple vans at once</li>
              <li>• <strong>Daily Code:</strong> Give your team the daily access code for quick login</li>
              <li>• <strong>Messaging:</strong> Send quick messages to drivers without them leaving their app</li>
              <li>• <strong>Break Tracking:</strong> Monitor when drivers are on break vs. actively moving</li>
              <li>• <strong>Safety Incidents:</strong> Drivers can report safety issues directly through the app</li>
            </ul>
          </div>
          <div className="bg-gradient-to-r from-green-50 to-emerald-50 p-3 rounded-lg border border-green-200">
            <p className="font-semibold text-green-900 mb-2">📞 Need Help?</p>
            <p className="text-sm text-green-800">Check the Help icon (?) on any page for quick instructions, or reach out to Jason at any time.</p>
          </div>
        </div>
      )
    },
    {
      title: "You're All Set! 🚀",
      subtitle: "Ready to Manage the Lot Like a Pro",
      icon: <BarChart3 className="h-16 w-16 text-green-400" />,
      content: (
        <div className="space-y-4">
          <div className="bg-gradient-to-r from-green-50 to-emerald-50 p-4 rounded-lg border border-green-200">
            <p className="text-base text-green-900 font-semibold mb-2">Your dashboard is ready to use!</p>
            <p className="text-sm text-green-800">You have all the tools to manage today's operations efficiently:</p>
            <ul className="text-sm text-green-800 mt-3 space-y-1 ml-4">
              <li>✓ Roster & team assignments</li>
              <li>✓ Real-time driver dispatch</li>
              <li>✓ Smart scanner for work orders</li>
              <li>✓ Live performance tracking</li>
              <li>✓ Team messaging & communication</li>
            </ul>
          </div>
          <p className="text-sm text-gray-600 text-center">
            Click <strong>"Start Managing"</strong> to begin, or review any section by going back.
          </p>
        </div>
      )
    }
  ];

  const slide = slides[currentSlide];
  const isFirst = currentSlide === 0;
  const isLast = currentSlide === slides.length - 1;

  const handleNext = () => {
    if (!isLast) setCurrentSlide(currentSlide + 1);
  };

  const handlePrev = () => {
    if (!isFirst) setCurrentSlide(currentSlide - 1);
  };

  const handleClose = () => {
    localStorage.setItem("teresa_onboarding_shown", "true");
    onClose();
  };

  return (
    <Dialog open={open} onOpenChange={(open) => !open && handleClose()}>
      <DialogContent className="max-w-2xl max-h-[90vh] flex flex-col">
        <div className="overflow-y-auto flex-1 pr-4">
          {/* Header */}
          <div className="text-center mb-6">
            <div className="flex justify-center mb-4">
              {slide.icon}
            </div>
            <h2 className="text-2xl font-bold text-gray-900">{slide.title}</h2>
            <p className="text-base text-gray-600 pt-2">{slide.subtitle}</p>
          </div>
          
          {/* Content */}
          <div className="mt-6 mb-6">
            {slide.content}
          </div>

          {/* Slide counter */}
          <div className="text-center text-sm text-gray-500 mt-4">
            Slide {currentSlide + 1} of {slides.length}
          </div>
        </div>

        <DialogFooter className="mt-6 flex justify-between">
          <Button 
            onClick={handlePrev} 
            variant="outline" 
            disabled={isFirst}
            data-testid="button-prev-slide"
            className="gap-2"
          >
            <ChevronLeft className="h-4 w-4" />
            Back
          </Button>
          
          <div className="flex gap-2">
            {isLast && (
              <Button 
                onClick={handleClose} 
                variant="secondary"
                data-testid="button-skip-onboarding"
              >
                Skip to Dashboard
              </Button>
            )}
            <Button 
              onClick={isLast ? handleClose : handleNext}
              className={`gap-2 ${isLast ? 'bg-green-600 hover:bg-green-700' : 'bg-blue-600 hover:bg-blue-700'}`}
              data-testid={isLast ? "button-finish-onboarding" : "button-next-slide"}
            >
              {isLast ? "Let's Begin!" : (
                <>
                  Next
                  <ChevronRight className="h-4 w-4" />
                </>
              )}
            </Button>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
