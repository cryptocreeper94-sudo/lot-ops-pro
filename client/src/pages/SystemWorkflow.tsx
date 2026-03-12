import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Smartphone, LogIn, MapPin, Camera, MessageSquare, AlertTriangle, TrendingUp, Users, FileText, ArrowRight, CheckCircle } from "lucide-react";
import { useLocation } from "wouter";
import { NavigationControl } from "@/components/NavigationControl";

export default function SystemWorkflow() {
  const [_, setLocation] = useLocation();

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900 p-4">
      <div className="max-w-6xl mx-auto space-y-4">
        <div className="flex items-center gap-3 mb-4">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setLocation("/developer")}
            className="text-white hover:bg-white/10"
          >
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div>
            <h1 className="text-2xl font-bold text-white">System Workflow Diagram</h1>
            <p className="text-sm text-blue-200">Technical overview of user flows and system operations</p>
          </div>
        </div>

        {/* Authentication Flow */}
        <Card className="bg-white/10 border-white/20 backdrop-blur">
          <CardHeader className="pb-3">
            <CardTitle className="text-white flex items-center gap-2">
              <LogIn className="h-5 w-5 text-green-400" />
              1. Authentication & Role Routing
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              <div className="bg-slate-800/50 p-4 rounded-lg border border-slate-700">
                <div className="flex items-center gap-2 mb-2">
                  <Smartphone className="h-5 w-5 text-blue-400" />
                  <span className="font-semibold text-white">Mobile Login</span>
                </div>
                <div className="text-sm text-slate-300 space-y-1">
                  <p>• 4-digit PIN entry</p>
                  <p>• GPS check (auto-detect location)</p>
                  <p>• Role identification</p>
                </div>
              </div>
              <div className="bg-slate-800/50 p-4 rounded-lg border border-slate-700">
                <div className="flex items-center gap-2 mb-2">
                  <MapPin className="h-5 w-5 text-yellow-400" />
                  <span className="font-semibold text-white">Geofencing Check</span>
                </div>
                <div className="text-sm text-slate-300 space-y-1">
                  <p>• Within 1200m of facility: Live Mode</p>
                  <p>• Outside facility: Demo Mode</p>
                  <p>• GPS unavailable: Demo Mode</p>
                </div>
              </div>
              <div className="bg-slate-800/50 p-4 rounded-lg border border-slate-700">
                <div className="flex items-center gap-2 mb-2">
                  <CheckCircle className="h-5 w-5 text-green-400" />
                  <span className="font-semibold text-white">Session Start</span>
                </div>
                <div className="text-sm text-slate-300 space-y-1">
                  <p>• Live: 12-hour session (DB)</p>
                  <p>• Demo: 30-min session (local)</p>
                  <p>• Auto-route to role dashboard</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Role-Based Workflows */}
        <Card className="bg-white/10 border-white/20 backdrop-blur">
          <CardHeader className="pb-3">
            <CardTitle className="text-white flex items-center gap-2">
              <Users className="h-5 w-5 text-purple-400" />
              2. Role-Based Dashboards & Features
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {/* Operations Manager */}
              <div className="bg-gradient-to-br from-orange-900/30 to-orange-800/20 p-4 rounded-lg border border-orange-500/30">
                <h3 className="font-bold text-orange-300 mb-2 flex items-center gap-2">
                  <TrendingUp className="h-4 w-4" />
                  Operations Manager
                </h3>
                <div className="text-sm text-slate-300 space-y-1">
                  <p>→ Performance reports & analytics</p>
                  <p>→ Shift instructions management</p>
                  <p>→ Crew setup & assignments</p>
                  <p>→ System-wide oversight</p>
                </div>
              </div>

              {/* Supervisor */}
              <div className="bg-gradient-to-br from-blue-900/30 to-blue-800/20 p-4 rounded-lg border border-blue-500/30">
                <h3 className="font-bold text-blue-300 mb-2 flex items-center gap-2">
                  <Users className="h-4 w-4" />
                  Supervisor
                </h3>
                <div className="text-sm text-slate-300 space-y-1">
                  <p>→ Resource allocation & routing</p>
                  <p>→ Real-time driver messaging</p>
                  <p>→ Performance monitoring</p>
                  <p>→ Crew management tools</p>
                </div>
              </div>

              {/* Van Driver */}
              <div className="bg-gradient-to-br from-green-900/30 to-green-800/20 p-4 rounded-lg border border-green-500/30">
                <h3 className="font-bold text-green-300 mb-2 flex items-center gap-2">
                  <MapPin className="h-4 w-4" />
                  Van Driver
                </h3>
                <div className="text-sm text-slate-300 space-y-1">
                  <p>→ GPS navigation & routing</p>
                  <p>→ Pickup request system</p>
                  <p>→ Quota tracking (real-time MPH)</p>
                  <p>→ Break management</p>
                </div>
              </div>

              {/* Inventory Driver */}
              <div className="bg-gradient-to-br from-purple-900/30 to-purple-800/20 p-4 rounded-lg border border-purple-500/30">
                <h3 className="font-bold text-purple-300 mb-2 flex items-center gap-2">
                  <Camera className="h-4 w-4" />
                  Inventory Driver
                </h3>
                <div className="text-sm text-slate-300 space-y-1">
                  <p>→ Camera scanner with OCR</p>
                  <p>→ Vehicle location tracking</p>
                  <p>→ Work order processing</p>
                  <p>→ Lot navigation</p>
                </div>
              </div>

              {/* Safety Advisor */}
              <div className="bg-gradient-to-br from-red-900/30 to-red-800/20 p-4 rounded-lg border border-red-500/30">
                <h3 className="font-bold text-red-300 mb-2 flex items-center gap-2">
                  <AlertTriangle className="h-4 w-4" />
                  Safety Advisor
                </h3>
                <div className="text-sm text-slate-300 space-y-1">
                  <p>→ Incident report review</p>
                  <p>→ Speed violation tracking</p>
                  <p>→ Safety material distribution</p>
                  <p>→ Compliance monitoring</p>
                </div>
              </div>

              {/* Developer */}
              <div className="bg-gradient-to-br from-slate-900/30 to-slate-800/20 p-4 rounded-lg border border-slate-500/30">
                <h3 className="font-bold text-slate-300 mb-2 flex items-center gap-2">
                  <FileText className="h-4 w-4" />
                  Developer
                </h3>
                <div className="text-sm text-slate-300 space-y-1">
                  <p>→ System health monitoring</p>
                  <p>→ All feature access (testing)</p>
                  <p>→ Database configuration</p>
                  <p>→ Performance analytics</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Key Feature Workflows */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Camera Scanner Flow */}
          <Card className="bg-white/10 border-white/20 backdrop-blur">
            <CardHeader className="pb-3">
              <CardTitle className="text-white text-base flex items-center gap-2">
                <Camera className="h-5 w-5 text-blue-400" />
                Camera Scanner Workflow
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2 text-sm text-slate-300">
                <div className="flex items-start gap-2">
                  <span className="text-blue-400 font-bold">1.</span>
                  <span>Driver opens camera scanner</span>
                </div>
                <div className="flex items-start gap-2">
                  <span className="text-blue-400 font-bold">2.</span>
                  <span>Points camera at work order sticker</span>
                </div>
                <div className="flex items-start gap-2">
                  <span className="text-blue-400 font-bold">3.</span>
                  <span>OCR extracts: VIN, Work Order, Lane, Year/Make/Model</span>
                </div>
                <div className="flex items-start gap-2">
                  <span className="text-blue-400 font-bold">4.</span>
                  <span>Post-scan confirmation dialog (edit if needed)</span>
                </div>
                <div className="flex items-start gap-2">
                  <span className="text-blue-400 font-bold">5.</span>
                  <span>Creates vehicle record in database</span>
                </div>
                <div className="flex items-start gap-2">
                  <span className="text-blue-400 font-bold">6.</span>
                  <span>Updates lot tracking & routing</span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* GPS Tracking Flow */}
          <Card className="bg-white/10 border-white/20 backdrop-blur">
            <CardHeader className="pb-3">
              <CardTitle className="text-white text-base flex items-center gap-2">
                <MapPin className="h-5 w-5 text-green-400" />
                GPS Tracking Workflow
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2 text-sm text-slate-300">
                <div className="flex items-start gap-2">
                  <span className="text-green-400 font-bold">1.</span>
                  <span>App requests GPS permission on login</span>
                </div>
                <div className="flex items-start gap-2">
                  <span className="text-green-400 font-bold">2.</span>
                  <span>Geofencing check (1200m radius)</span>
                </div>
                <div className="flex items-start gap-2">
                  <span className="text-green-400 font-bold">3.</span>
                  <span>GPS updates sent to server every 60 seconds</span>
                </div>
                <div className="flex items-start gap-2">
                  <span className="text-green-400 font-bold">4.</span>
                  <span>Supervisor sees live driver positions on map</span>
                </div>
                <div className="flex items-start gap-2">
                  <span className="text-green-400 font-bold">5.</span>
                  <span>Trip counter calculates mileage (Haversine)</span>
                </div>
                <div className="flex items-start gap-2">
                  <span className="text-green-400 font-bold">6.</span>
                  <span>Speed monitoring detects violations</span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Messaging Flow */}
          <Card className="bg-white/10 border-white/20 backdrop-blur">
            <CardHeader className="pb-3">
              <CardTitle className="text-white text-base flex items-center gap-2">
                <MessageSquare className="h-5 w-5 text-purple-400" />
                Messaging System Workflow
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2 text-sm text-slate-300">
                <div className="flex items-start gap-2">
                  <span className="text-purple-400 font-bold">1.</span>
                  <span>Driver/Supervisor taps floating message button</span>
                </div>
                <div className="flex items-start gap-2">
                  <span className="text-purple-400 font-bold">2.</span>
                  <span>Chat overlay opens (real-time polling every 3s)</span>
                </div>
                <div className="flex items-start gap-2">
                  <span className="text-purple-400 font-bold">3.</span>
                  <span>Unread count badge shows new messages</span>
                </div>
                <div className="flex items-start gap-2">
                  <span className="text-purple-400 font-bold">4.</span>
                  <span>Messages saved to database instantly</span>
                </div>
                <div className="flex items-start gap-2">
                  <span className="text-purple-400 font-bold">5.</span>
                  <span>Read receipts update automatically</span>
                </div>
                <div className="flex items-start gap-2">
                  <span className="text-purple-400 font-bold">6.</span>
                  <span>Privacy-first: No AI monitoring, human-to-human only</span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Safety Reporting Flow */}
          <Card className="bg-white/10 border-white/20 backdrop-blur">
            <CardHeader className="pb-3">
              <CardTitle className="text-white text-base flex items-center gap-2">
                <AlertTriangle className="h-5 w-5 text-red-400" />
                Safety Incident Workflow
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2 text-sm text-slate-300">
                <div className="flex items-start gap-2">
                  <span className="text-red-400 font-bold">1.</span>
                  <span>Driver taps red floating safety button</span>
                </div>
                <div className="flex items-start gap-2">
                  <span className="text-red-400 font-bold">2.</span>
                  <span>Form opens: incident type, urgency, location</span>
                </div>
                <div className="flex items-start gap-2">
                  <span className="text-red-400 font-bold">3.</span>
                  <span>Optional photo capture (10MB max)</span>
                </div>
                <div className="flex items-start gap-2">
                  <span className="text-red-400 font-bold">4.</span>
                  <span>Optional video capture (10s, 10MB max)</span>
                </div>
                <div className="flex items-start gap-2">
                  <span className="text-red-400 font-bold">5.</span>
                  <span>Incident saved to database with timestamp</span>
                </div>
                <div className="flex items-start gap-2">
                  <span className="text-red-400 font-bold">6.</span>
                  <span>Safety Advisor receives notification & reviews</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Data Flow Architecture */}
        <Card className="bg-white/10 border-white/20 backdrop-blur">
          <CardHeader className="pb-3">
            <CardTitle className="text-white flex items-center gap-2">
              <ArrowRight className="h-5 w-5 text-cyan-400" />
              3. Data Flow & Persistence
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
              <div className="bg-slate-800/50 p-4 rounded-lg border border-slate-700 text-center">
                <Smartphone className="h-8 w-8 text-blue-400 mx-auto mb-2" />
                <div className="font-semibold text-white mb-1">Mobile App</div>
                <div className="text-xs text-slate-400">React + TypeScript</div>
                <div className="text-xs text-slate-400">PWA-ready</div>
              </div>
              <div className="bg-slate-800/50 p-4 rounded-lg border border-slate-700 text-center">
                <ArrowRight className="h-8 w-8 text-green-400 mx-auto mb-2" />
                <div className="font-semibold text-white mb-1">API Layer</div>
                <div className="text-xs text-slate-400">Express.js REST</div>
                <div className="text-xs text-slate-400">Session Auth</div>
              </div>
              <div className="bg-slate-800/50 p-4 rounded-lg border border-slate-700 text-center">
                <FileText className="h-8 w-8 text-purple-400 mx-auto mb-2" />
                <div className="font-semibold text-white mb-1">Database</div>
                <div className="text-xs text-slate-400">PostgreSQL</div>
                <div className="text-xs text-slate-400">Drizzle ORM</div>
              </div>
              <div className="bg-slate-800/50 p-4 rounded-lg border border-slate-700 text-center">
                <CheckCircle className="h-8 w-8 text-yellow-400 mx-auto mb-2" />
                <div className="font-semibold text-white mb-1">Persistence</div>
                <div className="text-xs text-slate-400">12hr sessions</div>
                <div className="text-xs text-slate-400">Real-time sync</div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Technical Specifications */}
        <Card className="bg-white/10 border-white/20 backdrop-blur">
          <CardHeader className="pb-3">
            <CardTitle className="text-white flex items-center gap-2">
              <FileText className="h-5 w-5 text-slate-400" />
              4. Technical Specifications
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
              <div className="space-y-2">
                <h4 className="font-semibold text-white">Frontend</h4>
                <div className="text-slate-300 space-y-1">
                  <p>• React 18 with TypeScript</p>
                  <p>• Tailwind CSS v4 styling</p>
                  <p>• Wouter routing</p>
                  <p>• TanStack Query (data fetching)</p>
                  <p>• shadcn/ui components</p>
                </div>
              </div>
              <div className="space-y-2">
                <h4 className="font-semibold text-white">Backend</h4>
                <div className="text-slate-300 space-y-1">
                  <p>• Express.js REST API</p>
                  <p>• Session-based auth</p>
                  <p>• PostgreSQL (Neon serverless)</p>
                  <p>• Drizzle ORM</p>
                  <p>• 20+ normalized tables</p>
                </div>
              </div>
              <div className="space-y-2">
                <h4 className="font-semibold text-white">Mobile Optimization</h4>
                <div className="text-slate-300 space-y-1">
                  <p>• PWA capabilities</p>
                  <p>• Touch-friendly controls</p>
                  <p>• Offline-capable (Demo Mode)</p>
                  <p>• GPS & Camera APIs</p>
                  <p>• Responsive design (mobile-first)</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="text-center text-xs text-slate-400 pb-4">
          © 2025 DarkWave Studios • Lot Ops Pro Version 1.0 • Technical Workflow Documentation
        </div>
      </div>
    </div>
  );
}
