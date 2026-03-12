import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { 
  ChevronRight, 
  ChevronLeft,
  Crown, 
  Users, 
  Mail,
  Key,
  BarChart3,
  Lightbulb,
  CheckCircle2,
  Shield,
  AlertCircle
} from "lucide-react";

interface OperationsManagerOnboardingProps {
  open: boolean;
  onClose: () => void;
}

export function OperationsManagerOnboarding({ open, onClose }: OperationsManagerOnboardingProps) {
  const [currentSlide, setCurrentSlide] = useState(0);

  const slides = [
    {
      title: "Welcome to Full System Control! 👑",
      subtitle: "Operations Manager Dashboard",
      icon: <Crown className="h-16 w-16 text-purple-400" />,
      content: (
        <div className="space-y-4">
          <p className="text-base text-gray-700 leading-relaxed">
            You have the highest level of access in Lot Ops Pro. Your role is to oversee all operations, manage staff, and provide strategic direction.
          </p>
          <div className="bg-purple-50 p-4 rounded-lg border border-purple-200">
            <p className="font-semibold text-purple-900 mb-3">Your Key Responsibilities:</p>
            <ul className="text-sm text-purple-800 space-y-2">
              <li className="flex items-center gap-2"><CheckCircle2 className="h-4 w-4 text-green-600" /> Send daily shift instructions to supervisors</li>
              <li className="flex items-center gap-2"><CheckCircle2 className="h-4 w-4 text-green-600" /> Manage PIN access for all team members</li>
              <li className="flex items-center gap-2"><CheckCircle2 className="h-4 w-4 text-green-600" /> View system-wide analytics and metrics</li>
              <li className="flex items-center gap-2"><CheckCircle2 className="h-4 w-4 text-green-600" /> Send company-wide communications</li>
              <li className="flex items-center gap-2"><CheckCircle2 className="h-4 w-4 text-green-600" /> Override any supervisor decisions when needed</li>
            </ul>
          </div>
        </div>
      )
    },
    {
      title: "Your Dashboard Overview",
      subtitle: "Five Main Sections",
      icon: <BarChart3 className="h-16 w-16 text-blue-400" />,
      content: (
        <div className="space-y-3">
          <div className="bg-gradient-to-r from-purple-50 to-indigo-50 p-3 rounded-lg border border-purple-200">
            <p className="font-bold text-purple-900 mb-1">📋 Overview</p>
            <p className="text-sm text-purple-800">System status, key metrics, alerts, and daily summary.</p>
          </div>
          <div className="bg-gradient-to-r from-blue-50 to-cyan-50 p-3 rounded-lg border border-blue-200">
            <p className="font-bold text-blue-900 mb-1">💬 Shift Instructions</p>
            <p className="text-sm text-blue-800">Send daily instructions to Supervisor. Set priorities and expectations for the shift.</p>
          </div>
          <div className="bg-gradient-to-r from-green-50 to-emerald-50 p-3 rounded-lg border border-green-200">
            <p className="font-bold text-green-900 mb-1">📧 Email System</p>
            <p className="text-sm text-green-800">Send company-wide emails to all staff, supervisors, drivers, or specific groups.</p>
          </div>
          <div className="bg-gradient-to-r from-yellow-50 to-orange-50 p-3 rounded-lg border border-yellow-200">
            <p className="font-bold text-yellow-900 mb-1">🔑 PIN Management</p>
            <p className="text-sm text-yellow-800">Create, change, or reset PINs for supervisors, drivers, and safety advisors.</p>
          </div>
          <div className="bg-gradient-to-r from-pink-50 to-red-50 p-3 rounded-lg border border-pink-200">
            <p className="font-bold text-pink-900 mb-1">📊 Full Analytics</p>
            <p className="text-sm text-pink-800">Access all system data: performance, safety incidents, compliance, audit logs.</p>
          </div>
        </div>
      )
    },
    {
      title: "Step 1: Daily Shift Instructions",
      subtitle: "Communicate with Your Supervisor",
      icon: <Mail className="h-16 w-16 text-blue-400" />,
      content: (
        <div className="space-y-4">
          <ol className="space-y-3 text-sm">
            <li className="flex gap-3">
              <span className="font-bold bg-blue-100 text-blue-900 px-2.5 py-0.5 rounded-full min-w-fit">1</span>
              <span>Go to <strong>"Shift Instructions"</strong> section</span>
            </li>
            <li className="flex gap-3">
              <span className="font-bold bg-blue-100 text-blue-900 px-2.5 py-0.5 rounded-full min-w-fit">2</span>
              <span>Click <strong>"New Instructions"</strong> to compose message</span>
            </li>
            <li className="flex gap-3">
              <span className="font-bold bg-blue-100 text-blue-900 px-2.5 py-0.5 rounded-full min-w-fit">3</span>
              <span>Set <strong>Date & Time</strong> instructions take effect</span>
            </li>
            <li className="flex gap-3">
              <span className="font-bold bg-blue-100 text-blue-900 px-2.5 py-0.5 rounded-full min-w-fit">4</span>
              <span>Type your priorities: staffing needs, lot locations, special projects, etc.</span>
            </li>
            <li className="flex gap-3">
              <span className="font-bold bg-blue-100 text-blue-900 px-2.5 py-0.5 rounded-full min-w-fit">5</span>
              <span>Click <strong>"Send"</strong> - Supervisor sees it on login</span>
            </li>
          </ol>
          <div className="bg-blue-50 p-3 rounded border border-blue-200">
            <p className="text-xs text-blue-800"><Lightbulb className="inline h-3 w-3 mr-1" /><strong>Tip:</strong> Clear instructions = more efficient operations. Be specific about priorities!</p>
          </div>
        </div>
      )
    },
    {
      title: "Step 2: Send Company-Wide Emails",
      subtitle: "Staff Communication & Documentation",
      icon: <Mail className="h-16 w-16 text-green-400" />,
      content: (
        <div className="space-y-4">
          <ol className="space-y-3 text-sm">
            <li className="flex gap-3">
              <span className="font-bold bg-green-100 text-green-900 px-2.5 py-0.5 rounded-full min-w-fit">1</span>
              <span>Go to <strong>"Email System"</strong> tab</span>
            </li>
            <li className="flex gap-3">
              <span className="font-bold bg-green-100 text-green-900 px-2.5 py-0.5 rounded-full min-w-fit">2</span>
              <span>Choose recipient group: <strong>All Staff</strong>, <strong>Supervisors Only</strong>, <strong>Drivers Only</strong>, or <strong>Custom</strong></span>
            </li>
            <li className="flex gap-3">
              <span className="font-bold bg-green-100 text-green-900 px-2.5 py-0.5 rounded-full min-w-fit">3</span>
              <span>Write <strong>Subject Line</strong> and <strong>Message Body</strong></span>
            </li>
            <li className="flex gap-3">
              <span className="font-bold bg-green-100 text-green-900 px-2.5 py-0.5 rounded-full min-w-fit">4</span>
              <span>Attach documents if needed (supply orders, policies, schedules)</span>
            </li>
            <li className="flex gap-3">
              <span className="font-bold bg-green-100 text-green-900 px-2.5 py-0.5 rounded-full min-w-fit">5</span>
              <span>Click <strong>"Send"</strong> - Emails logged and stored in database</span>
            </li>
          </ol>
          <div className="bg-green-50 p-3 rounded border border-green-200">
            <p className="text-xs text-green-800"><Lightbulb className="inline h-3 w-3 mr-1" /><strong>Use For:</strong> Supply orders, policy updates, schedule changes, emergency communications, compliance notices</p>
          </div>
        </div>
      )
    },
    {
      title: "Step 3: Manage PIN Access",
      subtitle: "Security & Team Access",
      icon: <Key className="h-16 w-16 text-yellow-400" />,
      content: (
        <div className="space-y-4">
          <ol className="space-y-3 text-sm">
            <li className="flex gap-3">
              <span className="font-bold bg-yellow-100 text-yellow-900 px-2.5 py-0.5 rounded-full min-w-fit">1</span>
              <span>Go to <strong>"PIN Management"</strong> tab</span>
            </li>
            <li className="flex gap-3">
              <span className="font-bold bg-yellow-100 text-yellow-900 px-2.5 py-0.5 rounded-full min-w-fit">2</span>
              <span>Search for an employee or select from list</span>
            </li>
            <li className="flex gap-3">
              <span className="font-bold bg-yellow-100 text-yellow-900 px-2.5 py-0.5 rounded-full min-w-fit">3</span>
              <span>Click <strong>"Reset PIN"</strong> or <strong>"Create PIN"</strong> for new staff</span>
            </li>
            <li className="flex gap-3">
              <span className="font-bold bg-yellow-100 text-yellow-900 px-2.5 py-0.5 rounded-full min-w-fit">4</span>
              <span>Enter new 4-digit PIN and confirm</span>
            </li>
            <li className="flex gap-3">
              <span className="font-bold bg-yellow-100 text-yellow-900 px-2.5 py-0.5 rounded-full min-w-fit">5</span>
              <span>System notifies user of new PIN via message/notification</span>
            </li>
          </ol>
          <div className="bg-yellow-50 p-3 rounded border border-yellow-200">
            <p className="text-xs text-yellow-800"><Lightbulb className="inline h-3 w-3 mr-1" /><strong>When to Reset:</strong> Employee termination, lost PIN, security concerns, or temporary access changes</p>
          </div>
        </div>
      )
    },
    {
      title: "Step 4: Full System Analytics",
      subtitle: "View All Operational Data",
      icon: <BarChart3 className="h-16 w-16 text-purple-400" />,
      content: (
        <div className="space-y-4">
          <ol className="space-y-3 text-sm">
            <li className="flex gap-3">
              <span className="font-bold bg-purple-100 text-purple-900 px-2.5 py-0.5 rounded-full min-w-fit">1</span>
              <span>Go to <strong>"Analytics"</strong> tab</span>
            </li>
            <li className="flex gap-3">
              <span className="font-bold bg-purple-100 text-purple-900 px-2.5 py-0.5 rounded-full min-w-fit">2</span>
              <span>View <strong>System-Wide Performance:</strong> All drivers, all vans, all supervisors</span>
            </li>
            <li className="flex gap-3">
              <span className="font-bold bg-purple-100 text-purple-900 px-2.5 py-0.5 rounded-full min-w-fit">3</span>
              <span>Check <strong>Safety Incidents:</strong> Speed violations, accidents, near-misses</span>
            </li>
            <li className="flex gap-3">
              <span className="font-bold bg-purple-100 text-purple-900 px-2.5 py-0.5 rounded-full min-w-fit">4</span>
              <span>Review <strong>Compliance Data:</strong> Audit logs, consent tracking, policy violations</span>
            </li>
            <li className="flex gap-3">
              <span className="font-bold bg-purple-100 text-purple-900 px-2.5 py-0.5 rounded-full min-w-fit">5</span>
              <span>Export reports for executive meetings or compliance audits</span>
            </li>
          </ol>
          <div className="bg-purple-50 p-3 rounded border border-purple-200">
            <p className="text-xs text-purple-800"><Lightbulb className="inline h-3 w-3 mr-1" /><strong>You See Everything:</strong> All performance data, all messages, all incidents - total visibility!</p>
          </div>
        </div>
      )
    },
    {
      title: "Special Authorities You Have 👑",
      subtitle: "Unique Operations Manager Powers",
      icon: <Shield className="h-16 w-16 text-red-400" />,
      content: (
        <div className="space-y-3">
          <div className="bg-red-50 p-3 rounded-lg border border-red-200">
            <p className="font-bold text-red-900 mb-2">🔓 Override Authority</p>
            <p className="text-sm text-red-800">You can override any Supervisor decision. Your authority is final for all operational matters.</p>
          </div>
          <div className="bg-orange-50 p-3 rounded-lg border border-orange-200">
            <p className="font-bold text-orange-900 mb-2">🔐 Universal Access</p>
            <p className="text-sm text-orange-800">You have access to EVERY section of the system. No content is hidden from you.</p>
          </div>
          <div className="bg-yellow-50 p-3 rounded-lg border border-yellow-200">
            <p className="font-bold text-yellow-900 mb-2">⚡ Real-Time Control</p>
            <p className="text-sm text-yellow-800">Send emergency broadcasts, reset any PIN, change driver assignments, redirect vans immediately.</p>
          </div>
          <div className="bg-green-50 p-3 rounded-lg border border-green-200">
            <p className="font-bold text-green-900 mb-2">📊 Full Reporting</p>
            <p className="text-sm text-green-800">Generate compliance reports, audit trails, performance reviews, and executive summaries anytime.</p>
          </div>
        </div>
      )
    },
    {
      title: "Daily Workflow for You 🎯",
      subtitle: "Recommended Order of Operations",
      icon: <Lightbulb className="h-16 w-16 text-yellow-400" />,
      content: (
        <div className="space-y-3">
          <div className="bg-gradient-to-r from-blue-50 to-purple-50 p-3 rounded-lg border border-purple-200">
            <p className="font-bold text-purple-900 mb-3">📅 Start of Shift:</p>
            <ol className="text-sm text-purple-800 space-y-1 list-decimal list-inside">
              <li>Review overnight emails and alerts</li>
              <li>Send shift instructions to Supervisor</li>
              <li>Check system health & any incidents</li>
            </ol>
          </div>
          <div className="bg-gradient-to-r from-green-50 to-emerald-50 p-3 rounded-lg border border-green-200">
            <p className="font-bold text-green-900 mb-3">⏰ Throughout Shift:</p>
            <ol className="text-sm text-green-800 space-y-1 list-decimal list-inside">
              <li>Monitor performance metrics</li>
              <li>Watch for safety incidents</li>
              <li>Respond to supervisor questions</li>
              <li>Send urgent communications as needed</li>
            </ol>
          </div>
          <div className="bg-gradient-to-r from-orange-50 to-red-50 p-3 rounded-lg border border-red-200">
            <p className="font-bold text-red-900 mb-3">📊 End of Shift:</p>
            <ol className="text-sm text-red-800 space-y-1 list-decimal list-inside">
              <li>Review daily performance summary</li>
              <li>Note any issues for next day</li>
              <li>Generate reports if needed</li>
            </ol>
          </div>
        </div>
      )
    },
    {
      title: "You're Ready to Lead! 🎉",
      subtitle: "Questions? Click Help Button Anytime",
      icon: <CheckCircle2 className="h-16 w-16 text-green-400" />,
      content: (
        <div className="space-y-4">
          <div className="text-center space-y-2">
            <p className="text-lg font-semibold text-gray-800">You have full command of Lot Ops Pro!</p>
            <p className="text-sm text-gray-600">This tutorial is always available for quick reference.</p>
          </div>
          <div className="bg-purple-50 p-4 rounded-lg border border-purple-200">
            <p className="font-semibold text-purple-900 mb-2">🎯 Quick Reference Checklist:</p>
            <ul className="text-sm text-purple-800 space-y-1">
              <li>✓ Send shift instructions to Supervisor</li>
              <li>✓ Email system for all communications</li>
              <li>✓ PIN management for access control</li>
              <li>✓ Full analytics for all operations</li>
              <li>✓ Override any decision when needed</li>
              <li>✓ Export reports for compliance</li>
            </ul>
          </div>
          <div className="bg-gradient-to-r from-cyan-50 to-blue-50 p-4 rounded-lg border border-cyan-200">
            <p className="font-semibold text-cyan-900 mb-2">📽️ View Complete Presentation</p>
            <p className="text-sm text-cyan-800 mb-3">Watch the 35-slide interactive presentation to see all Lot Ops Pro capabilities, features, and business impact.</p>
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
                    ? "bg-purple-500 w-6"
                    : "bg-slate-600 w-2"
                }`}
              />
            ))}
          </div>

          <Button
            onClick={nextSlide}
            disabled={currentSlide === slides.length - 1}
            className="bg-gradient-to-r from-purple-600 to-purple-700 hover:from-purple-500 hover:to-purple-600"
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
