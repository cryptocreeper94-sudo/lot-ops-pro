import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { 
  MessageSquare, 
  Sparkles, 
  Heart,
  Zap,
  Users,
  BarChart3,
  Clock,
  CheckCircle2,
  Shield,
  Eye
} from "lucide-react";
import { QuickStartGuide } from "@/components/QuickStartGuide";

export function FirstTimeMessagePreviewer() {
  const [selectedPreview, setSelectedPreview] = useState<string>("ops_manager_welcome");

  const previews = {
    ops_manager_welcome: {
      title: "Operations Manager - First Login Welcome",
      description: "Shows once on first login (stored in localStorage: vanops_welcome_operations_manager)",
      component: (
        <div className="max-w-lg mx-auto bg-gradient-to-br from-blue-50 to-slate-50 rounded-lg border border-slate-200 p-6">
          <div className="flex items-center gap-2 mb-4">
            <Sparkles className="h-6 w-6 text-blue-600" />
            <h2 className="text-2xl font-bold text-slate-900">
              Hello to the biggest Tennessee Titans fan this side of the Mississippi River!
            </h2>
          </div>
          <p className="text-base leading-relaxed text-slate-700 mb-6">
            It's Jason - I wanted to reach out personally for a second.
          </p>

          <div className="space-y-4">
            <div className="bg-purple-100 rounded-lg p-4 border border-purple-200 flex items-start gap-3">
              <Heart className="h-5 w-5 text-purple-600 flex-shrink-0 mt-0.5" />
              <div>
                <p className="text-sm leading-relaxed text-slate-800">
                  Me and the drivers - all the Lot Ops employees really - we genuinely appreciate the hard work 
                  you do for us every day. We know you have a tough Daily Grind juggling schedules, managing crews, 
                  and keeping everything running smoothly. <span className="font-bold text-purple-900">Thank you</span> for 
                  everything you do.
                </p>
              </div>
            </div>

            <div className="bg-blue-100 rounded-lg p-4 border border-blue-200">
              <p className="text-sm leading-relaxed text-slate-800">
                I built this app hoping it makes <span className="font-bold text-blue-900">your job easier</span> and 
                helps streamline the daily operations. If it can take even a little stress off your plate, 
                then it's worth it.
              </p>
            </div>

            <div className="bg-green-100 rounded-lg p-4 border border-green-200">
              <p className="text-sm leading-relaxed text-slate-800">
                <span className="font-bold text-green-900">If you have ideas or feedback</span>, please let me know. 
                Document it however works for you - text me, jot it down, whatever - and I'll do my best to 
                implement it as quickly as possible. This is a team effort and I need your input to make it work 
                for everyone. Thanks again for what you do, and I'll see you soon.
              </p>
            </div>

            <p className="text-xs text-slate-500 text-center italic">
              - Jason
            </p>
          </div>

          <div className="mt-6 text-center">
            <Button className="w-full bg-blue-600 hover:bg-blue-700">
              Let's Do This! 🚀
            </Button>
          </div>
        </div>
      )
    },
    supervisor_welcome: {
      title: "Supervisor - First Login Welcome",
      description: "Shows once on first login (stored in localStorage: vanops_welcome_supervisor)",
      component: (
        <div className="max-w-lg mx-auto bg-gradient-to-br from-blue-50 to-slate-50 rounded-lg border border-slate-200 p-6">
          <div className="flex items-center gap-2 mb-4">
            <Sparkles className="h-6 w-6 text-blue-600" />
            <h2 className="text-2xl font-bold text-slate-900">Hey there!</h2>
          </div>
          <p className="text-base leading-relaxed text-slate-700 mb-6">
            It's Jason - I wanted to reach out personally for a second.
          </p>

          <div className="space-y-4">
            <div className="bg-purple-100 rounded-lg p-4 border border-purple-200 flex items-start gap-3">
              <Heart className="h-5 w-5 text-purple-600 flex-shrink-0 mt-0.5" />
              <div>
                <p className="text-sm leading-relaxed text-slate-800">
                  Me and the drivers - all the Lot Ops employees really - we genuinely appreciate the hard work 
                  you do for us every day. We know you have a tough Daily Grind juggling schedules, managing crews, 
                  and keeping everything running smoothly. <span className="font-bold text-purple-900">Thank you</span> for 
                  everything you do.
                </p>
              </div>
            </div>

            <div className="bg-blue-100 rounded-lg p-4 border border-blue-200">
              <p className="text-sm leading-relaxed text-slate-800">
                I built this app hoping it makes <span className="font-bold text-blue-900">your job easier</span> and 
                helps streamline the daily operations. If it can take even a little stress off your plate, 
                then it's worth it.
              </p>
            </div>

            <div className="bg-green-100 rounded-lg p-4 border border-green-200">
              <p className="text-sm leading-relaxed text-slate-800">
                <span className="font-bold text-green-900">If you have ideas or feedback</span>, please let me know. 
                Document it however works for you - text me, jot it down, whatever - and I'll do my best to 
                implement it as quickly as possible. This is a team effort and I need your input to make it work 
                for everyone. Thanks again for what you do, and I'll see you soon.
              </p>
            </div>

            <p className="text-xs text-slate-500 text-center italic">
              - Jason
            </p>
          </div>

          <div className="mt-6 text-center">
            <Button className="w-full bg-blue-600 hover:bg-blue-700">
              Let's Do This! 🚀
            </Button>
          </div>
        </div>
      )
    },
    ops_manager_quickstart: {
      title: "Operations Manager - Quick Start Guide",
      description: "Appears at top of Overview tab (always visible)",
      component: (
        <div className="max-w-4xl mx-auto">
          <QuickStartGuide role="operations_manager" />
        </div>
      )
    },
    supervisor_quickstart: {
      title: "Supervisor - Quick Start Guide",
      description: "Appears at top of Supervisor Overview tab (always visible)",
      component: (
        <div className="max-w-4xl mx-auto">
          <QuickStartGuide role="supervisor" />
        </div>
      )
    },
    van_driver_quickstart: {
      title: "Van Driver - Quick Start Guide",
      description: "Appears at top of Van Driver dashboard (always visible)",
      component: (
        <div className="max-w-4xl mx-auto">
          <QuickStartGuide role="van_driver" />
        </div>
      )
    },
    inventory_driver_quickstart: {
      title: "Inventory Driver - Quick Start Guide",
      description: "Appears at top of Inventory Driver dashboard (always visible)",
      component: (
        <div className="max-w-4xl mx-auto">
          <QuickStartGuide role="inventory_driver" />
        </div>
      )
    },
    safety_advisor_quickstart: {
      title: "Safety Advisor - Quick Start Guide",
      description: "Appears at top of Safety Advisor dashboard (always visible)",
      component: (
        <div className="max-w-4xl mx-auto">
          <QuickStartGuide role="safety_advisor" />
        </div>
      )
    },
  };

  const currentPreview = previews[selectedPreview as keyof typeof previews];

  return (
    <div className="space-y-4">
      <Card className="bg-slate-800 border-slate-600">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between flex-wrap gap-3">
            <div>
              <CardTitle className="text-white flex items-center gap-2">
                <Eye className="h-5 w-5 text-blue-400" />
                First-Time Message Previewer
              </CardTitle>
              <p className="text-xs text-slate-400 mt-1">
                Review all welcome messages and quick start guides before users see them
              </p>
            </div>
            <Badge variant="outline" className="bg-slate-700/50 text-blue-300 border-slate-600">
              {Object.keys(previews).length} Messages
            </Badge>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Selector */}
          <div className="flex items-center gap-3">
            <label className="text-sm font-medium text-slate-300 whitespace-nowrap">
              Select Message:
            </label>
            <Select value={selectedPreview} onValueChange={setSelectedPreview}>
              <SelectTrigger className="flex-1" data-testid="select-preview-message">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="ops_manager_welcome">
                  Operations Manager - Welcome Dialog
                </SelectItem>
                <SelectItem value="supervisor_welcome">
                  Supervisor - Welcome Dialog
                </SelectItem>
                <SelectItem value="ops_manager_quickstart">
                  Operations Manager - Quick Start Guide
                </SelectItem>
                <SelectItem value="supervisor_quickstart">
                  Supervisor - Quick Start Guide
                </SelectItem>
                <SelectItem value="van_driver_quickstart">
                  Van Driver - Quick Start Guide
                </SelectItem>
                <SelectItem value="inventory_driver_quickstart">
                  Inventory Driver - Quick Start Guide
                </SelectItem>
                <SelectItem value="safety_advisor_quickstart">
                  Safety Advisor - Quick Start Guide
                </SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Preview Info */}
          <div className="bg-slate-700/50 rounded-lg p-3 border border-slate-600">
            <div className="flex items-start gap-2">
              <MessageSquare className="h-4 w-4 text-slate-400 mt-0.5 flex-shrink-0" />
              <div>
                <h4 className="font-semibold text-sm text-white">{currentPreview.title}</h4>
                <p className="text-xs text-slate-400 mt-1">{currentPreview.description}</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Preview Container */}
      <Card className="bg-slate-800 border-slate-600">
        <CardHeader className="pb-3">
          <CardTitle className="text-base text-white">Live Preview</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="min-h-[400px] flex items-center justify-center">
            {currentPreview.component}
          </div>
        </CardContent>
      </Card>

      {/* Instructions */}
      <Card className="bg-slate-700/50 border-slate-600">
        <CardContent className="pt-4">
          <div className="flex items-start gap-2">
            <Sparkles className="h-4 w-4 text-blue-400 mt-0.5 flex-shrink-0" />
            <div className="text-xs text-slate-300">
              <p className="font-semibold mb-1">How to Reset Messages:</p>
              <ul className="list-disc list-inside space-y-0.5 text-slate-400">
                <li>Welcome Dialogs: Clear localStorage key (e.g., <code className="bg-slate-900 px-1 rounded">vanops_welcome_operations_manager</code>)</li>
                <li>Quick Start Guides: Always visible on dashboards, no reset needed</li>
                <li>Use browser DevTools → Application → Local Storage to test first-time experiences</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
