import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { 
  Sparkles, 
  Users, 
  Brain, 
  BarChart3, 
  Shield, 
  Zap,
  Calendar,
  CheckCircle2,
  Clock,
  TrendingUp,
  Building2,
  Briefcase,
  X,
  Award,
  Coins
} from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { useState } from "react";

interface Version2RoadmapProps {
  open: boolean;
  onClose: () => void;
}

export function Version2Roadmap({ open, onClose }: Version2RoadmapProps) {
  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex items-center justify-between">
            <DialogTitle className="text-2xl font-bold flex items-center gap-2">
              <Sparkles className="h-6 w-6 text-purple-500" />
              Version 2.0 Roadmap
            </DialogTitle>
            <Button variant="ghost" size="sm" onClick={onClose}>
              <X className="h-4 w-4" />
            </Button>
          </div>
          <div className="flex items-center gap-2 text-sm text-slate-600">
            <Calendar className="h-4 w-4" />
            <span>Version 2.0 Official Release: March 31, 2026</span>
          </div>
        </DialogHeader>

        <div className="space-y-6 py-4">
          {/* Hero Banner */}
          <div className="bg-gradient-to-br from-purple-500/10 to-blue-500/10 border border-purple-500/20 rounded-lg p-6">
            <h3 className="text-xl font-bold text-slate-800 mb-2">
              The Future of Autonomous Lot Management
            </h3>
            <p className="text-slate-600 leading-relaxed">
              Version 2.0 transforms Lot Ops Pro into a complete enterprise platform with AI-powered insights, 
              blockchain NFT achievements, expanded role hierarchy, and company-wide integrations. Built to scale 
              with your operation—from small dealerships to multi-facility enterprises.
            </p>
          </div>

          {/* NEW: Current Features - NFT & Engagement */}
          <div className="space-y-4">
            <h4 className="font-bold text-lg text-slate-800 flex items-center gap-2">
              <Award className="h-5 w-5 text-emerald-600" />
              Now Available: NFT Driver Badges & Team Engagement
            </h4>

            {/* Solana NFT Badges */}
            <Card className="border-emerald-200 bg-gradient-to-br from-emerald-50 to-cyan-50">
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-gradient-to-br from-emerald-500 to-cyan-500 rounded-lg shadow-lg">
                      <Coins className="h-5 w-5 text-white" />
                    </div>
                    <div>
                      <CardTitle className="text-base">Solana NFT Driver Badges</CardTitle>
                      <p className="text-xs text-slate-600 mt-1">Blockchain-verified achievement credentials</p>
                    </div>
                  </div>
                  <Badge className="bg-gradient-to-r from-emerald-500 to-cyan-500 text-white">LIVE</Badge>
                </div>
              </CardHeader>
              <CardContent className="space-y-2 text-sm text-slate-700">
                <p>• <strong>Beta Testers:</strong> FREE collectible NFT badges on Solana Mainnet</p>
                <p>• <strong>Public Users:</strong> Purchase verified badges for $1.99 via Stripe + Solana Mainnet</p>
                <p>• <strong>Driver Stats:</strong> Performance metrics, team rank, achievements embedded</p>
                <p>• <strong>Transparent Avatars:</strong> AI-powered background removal for silhouette effect</p>
              </CardContent>
            </Card>

            {/* Team Avatar Pop-up Game */}
            <Card className="border-purple-200 bg-gradient-to-br from-purple-50 to-pink-50">
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-gradient-to-br from-purple-500 to-pink-500 rounded-lg shadow-lg">
                      <Users className="h-5 w-5 text-white" />
                    </div>
                    <div>
                      <CardTitle className="text-base">Team Avatar Pop-up Game</CardTitle>
                      <p className="text-xs text-slate-600 mt-1">Fun team engagement feature</p>
                    </div>
                  </div>
                  <Badge className="bg-gradient-to-r from-purple-500 to-pink-500 text-white">LIVE</Badge>
                </div>
              </CardHeader>
              <CardContent className="space-y-2 text-sm text-slate-700">
                <p>• <strong>Animated Silhouettes:</strong> Driver avatars pop up with transparent backgrounds</p>
                <p>• <strong>Comic Speech Bubbles:</strong> Fun motivational messages and stats</p>
                <p>• <strong>Multi-Direction:</strong> Pop-ups animate from 8 directions to center screen</p>
                <p>• <strong>Toggle Control:</strong> Enable/disable in dashboard navigation</p>
              </CardContent>
            </Card>
          </div>

          {/* Core Features */}
          <div className="space-y-4">
            <h4 className="font-bold text-lg text-slate-800 flex items-center gap-2">
              <CheckCircle2 className="h-5 w-5 text-green-600" />
              Enhanced Features
            </h4>

            {/* AI-Powered HR & Analytics */}
            <Card className="border-blue-200 bg-blue-50/50">
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-blue-500 rounded-lg">
                      <Brain className="h-5 w-5 text-white" />
                    </div>
                    <div>
                      <CardTitle className="text-base">AI Query System</CardTitle>
                      <p className="text-xs text-slate-600 mt-1">Natural language HR and analytics</p>
                    </div>
                  </div>
                  <Badge className="bg-blue-600">Q1 2026</Badge>
                </div>
              </CardHeader>
              <CardContent className="space-y-2 text-sm text-slate-700">
                <p>• <strong>Ask anything in plain English:</strong> "Show me top 5 drivers this month"</p>
                <p>• <strong>HR Insights:</strong> Attendance patterns, efficiency trends, performance comparisons</p>
                <p>• <strong>Predictive Analytics:</strong> Forecast staffing needs, identify training opportunities</p>
                <p>• <strong>Automated Reports:</strong> Generate weekly/monthly summaries with one click</p>
              </CardContent>
            </Card>

            {/* Expanded Role Hierarchy */}
            <Card className="border-purple-200 bg-purple-50/50">
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-purple-500 rounded-lg">
                      <Users className="h-5 w-5 text-white" />
                    </div>
                    <div>
                      <CardTitle className="text-base">Unlimited Role Hierarchy</CardTitle>
                      <p className="text-xs text-slate-600 mt-1">Support for any organizational structure</p>
                    </div>
                  </div>
                  <Badge className="bg-purple-600">Q1 2026</Badge>
                </div>
              </CardHeader>
              <CardContent className="space-y-2 text-sm text-slate-700">
                <p>• <strong>Custom Roles:</strong> Add Regional Managers, District Supervisors, VP of Operations</p>
                <p>• <strong>Permission Levels:</strong> Granular control over who sees what data</p>
                <p>• <strong>Multi-Location Support:</strong> Manage multiple facilities from one dashboard</p>
                <p>• <strong>Delegation Tools:</strong> Assign tasks and authority across your org chart</p>
              </CardContent>
            </Card>

            {/* Advanced Barcode Integration */}
            <Card className="border-green-200 bg-green-50/50">
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-green-500 rounded-lg">
                      <Zap className="h-5 w-5 text-white" />
                    </div>
                    <div>
                      <CardTitle className="text-base">Smart Barcode & API Integration</CardTitle>
                      <p className="text-xs text-slate-600 mt-1">Seamless connection to existing systems</p>
                    </div>
                  </div>
                  <Badge className="bg-green-600">Q1 2026</Badge>
                </div>
              </CardHeader>
              <CardContent className="space-y-2 text-sm text-slate-700">
                <p>• <strong>Auto-Routing:</strong> Scan barcode → instant dealer/lot assignment</p>
                <p>• <strong>API Connections:</strong> Pull vehicle data from Manheim, AutoIMS, any system</p>
                <p>• <strong>Zero Manual Entry:</strong> Complete automation from scan to completion</p>
                <p>• <strong>Real-Time Sync:</strong> Bidirectional data flow with your existing platforms</p>
              </CardContent>
            </Card>

            {/* Enterprise Analytics Dashboard */}
            <Card className="border-orange-200 bg-orange-50/50">
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-orange-500 rounded-lg">
                      <BarChart3 className="h-5 w-5 text-white" />
                    </div>
                    <div>
                      <CardTitle className="text-base">Executive Analytics Suite</CardTitle>
                      <p className="text-xs text-slate-600 mt-1">Real-time insights for leadership</p>
                    </div>
                  </div>
                  <Badge className="bg-orange-600">Q1 2026</Badge>
                </div>
              </CardHeader>
              <CardContent className="space-y-2 text-sm text-slate-700">
                <p>• <strong>Live Dashboards:</strong> Monitor all locations in real-time</p>
                <p>• <strong>KPI Tracking:</strong> Moves per hour, efficiency scores, cost per move</p>
                <p>• <strong>Benchmarking:</strong> Compare performance across facilities and time periods</p>
                <p>• <strong>Custom Reports:</strong> Build your own views with drag-and-drop interface</p>
              </CardContent>
            </Card>

            {/* White Label & Multi-Tenant */}
            <Card className="border-slate-200 bg-slate-50/50">
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-slate-700 rounded-lg">
                      <Building2 className="h-5 w-5 text-white" />
                    </div>
                    <div>
                      <CardTitle className="text-base">White Label Ready</CardTitle>
                      <p className="text-xs text-slate-600 mt-1">Your brand, our technology</p>
                    </div>
                  </div>
                  <Badge className="bg-slate-600">Q1 2026</Badge>
                </div>
              </CardHeader>
              <CardContent className="space-y-2 text-sm text-slate-700">
                <p>• <strong>Custom Branding:</strong> Add your logo, colors, and company name</p>
                <p>• <strong>Multi-Location:</strong> Manage 1 facility or 100 from one platform</p>
                <p>• <strong>Franchise Ready:</strong> Deploy across your entire network instantly</p>
                <p>• <strong>"Add Your Footprint":</strong> We handle setup, training, and support</p>
              </CardContent>
            </Card>

            {/* Advanced Security & Compliance */}
            <Card className="border-red-200 bg-red-50/50">
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-red-500 rounded-lg">
                      <Shield className="h-5 w-5 text-white" />
                    </div>
                    <div>
                      <CardTitle className="text-base">Enterprise Security & Compliance</CardTitle>
                      <p className="text-xs text-slate-600 mt-1">Bank-level protection</p>
                    </div>
                  </div>
                  <Badge className="bg-red-600">Q1 2026</Badge>
                </div>
              </CardHeader>
              <CardContent className="space-y-2 text-sm text-slate-700">
                <p>• <strong>SSO Integration:</strong> Microsoft, Google, or custom authentication</p>
                <p>• <strong>Audit Logging:</strong> Complete history of all actions and changes</p>
                <p>• <strong>Role-Based Access:</strong> Lock down sensitive data by department</p>
                <p>• <strong>Compliance Ready:</strong> OSHA reporting, HR documentation, vehicle chain of custody</p>
              </CardContent>
            </Card>

            {/* Payment & Bonus System */}
            <Card className="border-emerald-200 bg-emerald-50/50">
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-emerald-500 rounded-lg">
                      <Briefcase className="h-5 w-5 text-white" />
                    </div>
                    <div>
                      <CardTitle className="text-base">Lot Ops Pro Visa Card Program</CardTitle>
                      <p className="text-xs text-slate-600 mt-1">Branded payment cards + streamlined payroll interface</p>
                    </div>
                  </div>
                  <Badge className="bg-emerald-600">Q3 2026</Badge>
                </div>
              </CardHeader>
              <CardContent className="space-y-3 text-sm text-slate-700">
                <div className="bg-emerald-100/50 border border-emerald-300 rounded p-3">
                  <p className="text-xs font-semibold text-emerald-900 mb-1">Currently exploring partnerships</p>
                  <p className="text-xs text-emerald-800 leading-relaxed">
                    Working with payment processors to launch co-branded Visa debit cards for instant bonus 
                    payments and streamlined wage distribution. Facilities can offer these cards to staffing 
                    agency partners as a preferred payment method.
                  </p>
                </div>
                
                <p className="font-semibold text-slate-800">For Drivers & Temps:</p>
                <p>• <strong>Branded Visa Cards:</strong> Physical and virtual Lot Ops Pro debit cards (works anywhere Visa is accepted)</p>
                <p>• <strong>Instant Bonuses:</strong> Performance rewards hit cards same-day - no waiting for next paycheck</p>
                <p>• <strong>No Bank Required:</strong> Unbanked workers get immediate access to funds</p>
                <p>• <strong>ATM Access:</strong> Withdraw cash or spend via card at millions of locations</p>
                
                <p className="font-semibold text-slate-800 mt-2">For Payroll Administrators:</p>
                <p>• <strong>Simple Web Interface:</strong> Load wages with just hours and approval - no navigating complex agency menus</p>
                <p>• <strong>API Integration:</strong> Staffing agencies can connect existing systems for automatic card loads</p>
                <p>• <strong>Real-Time Tracking:</strong> See exactly when payments hit cards, verify delivery instantly</p>
                <p>• <strong>Compliance Built-In:</strong> Tax reporting, wage statements, and record-keeping handled automatically</p>
                
                <p className="font-semibold text-slate-800 mt-2">Partnership Model:</p>
                <p>• <strong>Facility-to-Agency Adoption:</strong> Facilities using Lot Ops Pro can recommend cards to their temp agency partners</p>
                <p>• <strong>Reduces Admin Burden:</strong> Less check printing, mailing delays, and lost payment issues</p>
                <p>• <strong>Improves Retention:</strong> Temps prefer instant access to earnings vs. traditional payment cycles</p>
                <p>• <strong>Optional Adoption:</strong> Available as a benefit, not a requirement</p>
                
                <div className="bg-blue-50 border border-blue-200 rounded p-3 mt-2">
                  <p className="text-xs text-blue-900">
                    <strong>Note:</strong> Regular wages continue through existing payroll systems. The Lot Ops Pro card 
                    serves as an optional payment method that simplifies distribution and accelerates access to funds. 
                    Particularly valuable for temporary workers who may face delays with traditional payment methods.
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Timeline */}
          <div className="bg-gradient-to-r from-slate-50 to-blue-50 border border-slate-200 rounded-lg p-6">
            <h4 className="font-bold text-lg text-slate-800 flex items-center gap-2 mb-4">
              <Clock className="h-5 w-5 text-blue-600" />
              Development Timeline
            </h4>
            <div className="space-y-3">
              <div className="flex items-center gap-3">
                <Badge className="bg-green-600">January 2026</Badge>
                <span className="text-sm text-slate-700">AI Query System & Advanced Analytics</span>
              </div>
              <div className="flex items-center gap-3">
                <Badge className="bg-blue-600">February 2026</Badge>
                <span className="text-sm text-slate-700">Barcode Integration & Role Hierarchy Expansion</span>
              </div>
              <div className="flex items-center gap-3">
                <Badge className="bg-purple-600">March 2026</Badge>
                <span className="text-sm text-slate-700">White Label Platform & Multi-Tenant Support (Version 2.0 Release)</span>
              </div>
              <div className="flex items-center gap-3">
                <Badge className="bg-emerald-600">Q2 2026</Badge>
                <span className="text-sm text-slate-700">Payment Integration & Automated Bonus System</span>
              </div>
            </div>
            <div className="mt-4 pt-4 border-t border-slate-200">
              <p className="text-xs text-slate-600">
                <strong>Version 2.0 Official Launch:</strong> March 31, 2026 | 
                All features will roll out incrementally starting January 2026.
              </p>
            </div>
          </div>

          {/* CTA */}
          <div className="bg-gradient-to-br from-purple-600 to-blue-600 text-white rounded-lg p-6 text-center">
            <TrendingUp className="h-12 w-12 mx-auto mb-3" />
            <h3 className="text-xl font-bold mb-2">Ready to Scale?</h3>
            <p className="text-purple-100 mb-4">
              Version 2.0 transforms Lot Ops Pro from a single-facility tool into an enterprise platform. 
              Add your footprint, and we'll handle the rest.
            </p>
            <p className="text-sm text-purple-200">
              Questions? Contact us to discuss custom features for your organization.
            </p>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

export function Version2Button() {
  const [showRoadmap, setShowRoadmap] = useState(false);

  return (
    <>
      <Button
        onClick={() => setShowRoadmap(true)}
        className="bg-gradient-to-r from-purple-500 to-blue-600 hover:from-purple-600 hover:to-blue-700 text-white shadow-lg"
        data-testid="button-version2-roadmap"
      >
        <Sparkles className="h-4 w-4 mr-2" />
        What's Next: Version 2.0
      </Button>
      <Version2Roadmap open={showRoadmap} onClose={() => setShowRoadmap(false)} />
    </>
  );
}
