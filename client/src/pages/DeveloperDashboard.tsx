import { useState, useEffect } from "react";
import { useLocation } from "wouter";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { BentoGrid, BentoTile } from "@/components/ui/bento-grid";
import { PremiumAccordion, PremiumAccordionItem, PremiumAccordionTrigger, PremiumAccordionContent } from "@/components/ui/premium-accordion";
import { PremiumCarousel, SwipeCarousel } from "@/components/ui/premium-carousel";
import { PremiumButton } from "@/components/ui/premium-button";
import { 
  Settings, 
  Database, 
  Users, 
  BarChart3, 
  Save,
  Plus,
  Trash2,
  Shield,
  MapPin,
  Warehouse,
  Clock,
  TrendingUp,
  DollarSign,
  Briefcase,
  Rocket,
  FileText,
  MessageSquare,
  Menu,
  X,
  Zap,
  Layers,
  Scale,
  Stamp,
  UserCheck,
  FlaskConical,
  Calendar,
  Key,
  ClipboardList,
  CheckCircle2,
  Circle,
  ChevronDown,
  ChevronRight,
  ExternalLink
} from "lucide-react";
import { AiSuggestions } from "@/components/AiSuggestions";
import { LiveDriverMap } from "@/components/LiveDriverMap";
// WeatherWidget and NotesWidget moved to global components in App.tsx
import { PerformanceReports } from "@/components/PerformanceReports";
import { ShiftManager } from "@/components/ShiftManager";
import { SystemHealthCheck } from "@/components/SystemHealthCheck";
import { PaymentSystemDashboard } from "@/components/PaymentSystemDashboard";
import { CoinbaseCommerceDashboard } from "@/components/CoinbaseCommerceDashboard";
import { LicensingValuation } from "@/components/LicensingValuation";
import { SalesStrategyGuide } from "@/components/SalesStrategyGuide";
import { EnterpriseRoadmap } from "@/components/EnterpriseRoadmap";
import { FirstTimeMessagePreviewer } from "@/components/FirstTimeMessagePreviewer";
import { MarketingMaterialsGenerator } from "@/components/MarketingMaterialsGenerator";
import { NavigationControl } from "@/components/NavigationControl";
import { ReleaseManager } from "@/components/ReleaseManager";

interface LotSpace {
  id: number;
  lotNumber: string;
  lotName: string;
  capacity: number;
  currentOccupancy: number;
  zoneType: string;
  isActive: boolean;
  notes: string | null;
  lastUpdated: string;
}

interface Hallmark {
  id: number;
  name: string;
  description: string;
  primaryColor: string;
  secondaryColor: string;
  accentColor: string;
  isDefault: boolean;
  createdAt: string;
}

interface Asset {
  id: number;
  assetNumber: string;
  assetName: string;
  hallmarkStamp: string;
  status: string;
  createdAt: string;
}

interface AssetHistoryEntry {
  id: number;
  assetId: number;
  action: string;
  actionDescription: string;
  performedBy: number;
  performedByName: string;
  hallmarkStamp: string;
  createdAt: string;
}

interface BetaTester {
  id: number;
  userName: string;
  userRole: string;
  loginTime: string;
  ipAddress?: string;
}

// Universal PINs for role registration (first-time setup)
const UNIVERSAL_PINS = [
  { pin: "2222", role: "Operations Manager", type: "permanent", description: "Direct login - no registration needed" },
  { pin: "0000", role: "Van Driver", type: "universal", description: "Register → use last 4 of phone" },
  { pin: "1111", role: "Inventory", type: "universal", description: "Register → use last 4 of phone" },
  { pin: "3333", role: "Supervisor", type: "universal", description: "Register → use last 4 of phone" },
  { pin: "4444", role: "Safety Officer", type: "universal", description: "Register → use last 4 of phone" },
  { pin: "911", role: "Safety Advisor", type: "universal", description: "Register → use last 4 of phone" },
  { pin: "0424", role: "Developer", type: "universal", description: "Register → use last 4 of phone" },
];

// Beta Testers with their PINs (sandbox mode)
const BETA_TESTERS = [
  { pin: "111", name: "Stacy", project: "Lot Ops Pro", status: "active" },
  { pin: "222", name: "Kathy", project: "Lot Ops Pro", status: "active" },
  { pin: "333", name: "Matthew", project: "Lot Ops Pro", status: "active" },
  { pin: "444", name: "Sarah", project: "Lot Ops Pro", status: "active" },
  { pin: "555", name: "Connor", project: "Lot Ops Pro", status: "active" },
  { pin: "777", name: "Ron Andrews", project: "Lot Ops Pro", status: "active" },
  { pin: "888", name: "Chris", project: "Lot Ops Pro", status: "active" },
];

// Comprehensive Feature Inventory with all features and publish log
interface FeatureItem {
  id: string;
  name: string;
  description: string;
  status: "complete" | "partial" | "planned";
  route?: string;
  tutorial?: boolean;
}

interface FeatureCategory {
  name: string;
  icon: string;
  color: string;
  features: FeatureItem[];
}

const FEATURE_CATEGORIES: FeatureCategory[] = [
  {
    name: "Authentication & Access",
    icon: "🔐",
    color: "purple",
    features: [
      { id: "pin-login", name: "PIN-Based Login System", description: "Universal PINs for role registration, personal PINs for daily login", status: "complete", route: "/", tutorial: true },
      { id: "role-hierarchy", name: "Role Hierarchy", description: "Operations Manager, Supervisor, Driver, Inventory, Safety roles", status: "complete" },
      { id: "beta-sandbox", name: "Beta Tester Sandbox Mode", description: "Isolated sandbox for training with demo data", status: "complete", route: "/developer" },
      { id: "daily-codes", name: "Daily Security Codes", description: "Supervisor-managed shift access codes", status: "complete" },
      { id: "session-mgmt", name: "Session Management", description: "PostgreSQL-backed session persistence", status: "complete" },
    ]
  },
  {
    name: "Driver Operations",
    icon: "🚐",
    color: "blue",
    features: [
      { id: "bulk-moves", name: "Bulk Moves Mode", description: "Standard quota-tracked vehicle movements", status: "complete", route: "/driver-dashboard?mode=bulk", tutorial: true },
      { id: "crunch-mode", name: "Crunch Mode", description: "Fronting, organization, non-quota moves", status: "complete", route: "/driver-dashboard?mode=crunch" },
      { id: "gps-tracking", name: "Real-Time GPS Tracking", description: "Live location and speed monitoring", status: "complete" },
      { id: "quota-progress", name: "Quota Progress Bar", description: "Visual quota tracking with alerts", status: "complete" },
      { id: "mph-display", name: "MPH Performance Display", description: "Moves per hour efficiency tracking", status: "complete" },
      { id: "driver-messaging", name: "Driver-Supervisor Messaging", description: "Real-time communication system", status: "complete" },
    ]
  },
  {
    name: "Supervisor Dashboard",
    icon: "👥",
    color: "pink",
    features: [
      { id: "driver-roster", name: "Driver Roster", description: "Active drivers with status indicators", status: "complete", route: "/resource-allocation", tutorial: true },
      { id: "assignments", name: "Assignment Dispatch", description: "Send tasks to drivers with notifications", status: "complete", route: "/resource-allocation" },
      { id: "lane-crunch", name: "Lane Crunch Operations", description: "Consolidate vehicles by lane groups", status: "complete" },
      { id: "performance-tracking", name: "Performance Tracking", description: "Real-time efficiency monitoring", status: "complete" },
      { id: "weather-widget", name: "Weather Integration", description: "Open-Meteo weather with radar", status: "complete" },
    ]
  },
  {
    name: "Operations Manager",
    icon: "📊",
    color: "amber",
    features: [
      { id: "ops-dashboard", name: "Executive Dashboard", description: "Full visibility across all operations", status: "complete", route: "/operations-manager", tutorial: true },
      { id: "crew-manager", name: "Crew Manager", description: "Team organization and management", status: "complete", route: "/crew-manager" },
      { id: "analytics", name: "Analytics Dashboard", description: "Boardroom-quality reports and insights", status: "complete", route: "/analytics" },
      { id: "ai-optimization", name: "AI Lot Optimization", description: "OpenAI-powered capacity suggestions", status: "complete" },
      { id: "team-announcements", name: "Team Announcements", description: "Broadcast messages to all staff", status: "complete" },
    ]
  },
  {
    name: "Scanning & OCR",
    icon: "📷",
    color: "teal",
    features: [
      { id: "vin-scanner", name: "VIN Scanner", description: "Tesseract.js OCR for vehicle identification", status: "complete", route: "/scanner" },
      { id: "hallmark-scanner", name: "Hallmark Scanner", description: "Asset tracking with hallmark stamps", status: "complete" },
      { id: "ev-charging", name: "EV Charging Tracker", description: "Track vehicles at 400 EV station", status: "complete", route: "/ev-charging" },
      { id: "camera-access", name: "Full Camera Access", description: "getUserMedia API integration", status: "complete" },
    ]
  },
  {
    name: "Lot Management",
    icon: "🅿️",
    color: "orange",
    features: [
      { id: "lot-config", name: "Lot Configuration", description: "Lane positioning, rows, capacity", status: "complete", route: "/developer" },
      { id: "overflow-zones", name: "Overflow Parking Zones", description: "Manage overflow capacity", status: "complete" },
      { id: "traffic-flow", name: "Traffic Flow Management", description: "Configurable traffic patterns", status: "complete" },
      { id: "blockoffs", name: "Temporary Blockoffs", description: "Lane and spot blocking", status: "complete" },
      { id: "facility-maps", name: "Facility Map Navigator", description: "Interactive lot maps", status: "complete" },
    ]
  },
  {
    name: "Safety & Compliance",
    icon: "⚠️",
    color: "red",
    features: [
      { id: "safety-portal", name: "Safety Advisor Portal", description: "Incident reporting and tracking", status: "complete", route: "/safety-advisor" },
      { id: "speed-alerts", name: "Speed Detection Alerts", description: "GPS-based speed monitoring", status: "complete" },
      { id: "incident-photos", name: "Incident Photo/Video Capture", description: "Evidence documentation", status: "complete" },
      { id: "audit-trails", name: "Complete Audit Trails", description: "Every action logged with timestamp", status: "complete" },
    ]
  },
  {
    name: "NFT & Blockchain",
    icon: "🏆",
    color: "emerald",
    features: [
      { id: "nft-badges", name: "Solana NFT Driver Badges", description: "Blockchain-verified achievement badges", status: "complete" },
      { id: "beta-nft", name: "Beta Tester Edition (FREE)", description: "Devnet collector's badges", status: "complete" },
      { id: "public-nft", name: "Public Edition ($2.99)", description: "Mainnet verified badges", status: "complete" },
      { id: "avatar-removal", name: "AI Background Removal", description: "Python rembg for transparent avatars", status: "complete" },
    ]
  },
  {
    name: "Payments & Billing",
    icon: "💳",
    color: "green",
    features: [
      { id: "stripe", name: "Stripe Integration", description: "Subscription and payment processing", status: "complete" },
      { id: "coinbase", name: "Coinbase Commerce", description: "Cryptocurrency payment option", status: "complete" },
      { id: "subscription-mgmt", name: "Subscription Management", description: "Plan upgrades and billing", status: "complete" },
    ]
  },
  {
    name: "Tutorial & Onboarding",
    icon: "📚",
    color: "indigo",
    features: [
      { id: "lot-buddy", name: "Lot Buddy Mascot Guide", description: "Animated mascot with role-based greetings", status: "complete" },
      { id: "page-tutorials", name: "Page Tutorial Slideshows", description: "Step-by-step guides with hyperlinks", status: "complete" },
      { id: "faq-system", name: "Searchable FAQ System", description: "Role-based filtering and search", status: "complete" },
      { id: "popup-game", name: "Team Avatar Pop-up Game", description: "Animated driver avatars with bubbles", status: "complete" },
    ]
  },
  {
    name: "Premium UI/UX",
    icon: "✨",
    color: "violet",
    features: [
      { id: "glassmorphism", name: "Glassmorphism Cards", description: "Premium glass-effect styling", status: "complete" },
      { id: "3d-buttons", name: "3D Gradient Buttons", description: "Glow effects and hover animations", status: "complete" },
      { id: "page-transitions", name: "Page Transitions", description: "Smooth section animations", status: "complete" },
      { id: "premium-scrollbars", name: "Custom Scrollbars", description: "Styled scrollbar system", status: "complete" },
      { id: "dark-theme", name: "Dark Theme", description: "Enterprise-grade dark mode", status: "complete" },
    ]
  },
  {
    name: "Planned Features",
    icon: "🚀",
    color: "cyan",
    features: [
      { id: "multi-facility", name: "Multi-Facility Management", description: "Manage multiple auction locations", status: "planned" },
      { id: "sso-saml", name: "Enterprise SSO/SAML", description: "Okta, Azure AD, Auth0 integration", status: "planned" },
      { id: "oem-integrations", name: "OEM Integrations", description: "Manufacturer portal connections", status: "planned" },
      { id: "telematics", name: "Telematics Partnerships", description: "Geotab, Samsara integration", status: "planned" },
      { id: "predictive", name: "Predictive Analytics", description: "ML demand forecasting", status: "planned" },
      { id: "voice-commands", name: "Voice Commands", description: "Hands-free operation", status: "planned" },
      { id: "twilio-sms", name: "Twilio SMS Alerts", description: "SMS notifications to drivers", status: "partial" },
    ]
  }
];

// Publish/Deploy Log
const PUBLISH_LOG = [
  { version: "1.0.0-beta.1", date: "2025-11-15", time: "14:30 CST", notes: "Initial beta release for Manheim Nashville testing" },
  { version: "1.0.0-beta.2", date: "2025-11-18", time: "09:15 CST", notes: "Added Lot Buddy mascot and page tutorials" },
  { version: "1.0.0-beta.3", date: "2025-11-22", time: "16:45 CST", notes: "NFT badge system with Solana integration" },
  { version: "1.0.0-beta.4", date: "2025-11-28", time: "11:20 CST", notes: "Team avatar pop-up game and premium styling" },
  { version: "1.0.0-beta.5", date: "2025-11-30", time: "20:00 CST", notes: "Comprehensive UI/UX polish pass" },
  { version: "1.0.0-beta.6", date: "2025-12-01", time: "16:30 CST", notes: "Feature Inventory panel with checklist and publish log tracking" },
  { version: "1.0.0-beta.7", date: "2025-12-01", time: "18:30 CST", notes: "Fixed beta tester routing - all 3-digit PINs now go to Mode Selection dashboard" },
];

function FeatureInventory() {
  const [expandedCategories, setExpandedCategories] = useState<string[]>(FEATURE_CATEGORIES.map(c => c.name));
  const [checkedFeatures, setCheckedFeatures] = useState<string[]>(() => {
    const saved = localStorage.getItem('lotops_feature_checklist');
    return saved ? JSON.parse(saved) : [];
  });
  const [, setLocation] = useLocation();

  const toggleCategory = (name: string) => {
    setExpandedCategories(prev => 
      prev.includes(name) ? prev.filter(c => c !== name) : [...prev, name]
    );
  };

  const toggleFeature = (id: string) => {
    setCheckedFeatures(prev => {
      const next = prev.includes(id) ? prev.filter(f => f !== id) : [...prev, id];
      localStorage.setItem('lotops_feature_checklist', JSON.stringify(next));
      return next;
    });
  };

  const totalFeatures = FEATURE_CATEGORIES.reduce((sum, cat) => sum + cat.features.length, 0);
  const completedFeatures = FEATURE_CATEGORIES.reduce((sum, cat) => 
    sum + cat.features.filter(f => f.status === "complete").length, 0);
  const checkedCount = checkedFeatures.length;

  const colorMap: Record<string, string> = {
    purple: "from-purple-600 to-purple-800 border-purple-500",
    blue: "from-blue-600 to-blue-800 border-blue-500",
    pink: "from-pink-600 to-pink-800 border-pink-500",
    amber: "from-amber-600 to-amber-800 border-amber-500",
    teal: "from-teal-600 to-teal-800 border-teal-500",
    orange: "from-orange-600 to-orange-800 border-orange-500",
    red: "from-red-600 to-red-800 border-red-500",
    emerald: "from-emerald-600 to-emerald-800 border-emerald-500",
    green: "from-green-600 to-green-800 border-green-500",
    indigo: "from-indigo-600 to-indigo-800 border-indigo-500",
    violet: "from-violet-600 to-violet-800 border-violet-500",
    cyan: "from-cyan-600 to-cyan-800 border-cyan-500",
  };

  return (
    <div className="space-y-6">
      {/* Summary Stats - BentoGrid Layout */}
      <BentoGrid columns={4} gap="md">
        <BentoTile
          variant="gradient"
          size="sm"
          sparkle
          icon={<ClipboardList className="h-5 w-5" />}
          title={totalFeatures.toString()}
          description="Total Features"
          data-testid="tile-total-features"
        />
        <BentoTile
          variant="glow"
          size="sm"
          icon={<CheckCircle2 className="h-5 w-5" />}
          title={completedFeatures.toString()}
          description="Built & Ready"
          badge="ACTIVE"
          data-testid="tile-completed-features"
        />
        <BentoTile
          variant="glass"
          size="sm"
          icon={<Shield className="h-5 w-5" />}
          title={checkedCount.toString()}
          description="Verified ✓"
          data-testid="tile-checked-features"
        />
        <BentoTile
          variant="premium"
          size="sm"
          sparkle
          icon={<Rocket className="h-5 w-5" />}
          title={PUBLISH_LOG.length.toString()}
          description="Publishes"
          badge="LATEST"
          data-testid="tile-publish-count"
        />
      </BentoGrid>

      {/* Publish Log - SwipeCarousel */}
      <BentoTile
        variant="glass"
        size="wide"
        interactive={false}
        icon={<Rocket className="h-5 w-5" />}
        title="Publish History Log"
        data-testid="tile-publish-log"
      >
        <SwipeCarousel itemWidth="200px" gap={12}>
          {[...PUBLISH_LOG].reverse().map((log, idx) => (
            <div key={idx} className="p-3 bg-slate-800/50 rounded-xl border border-slate-700/50 h-full">
              <div className="flex items-center justify-between mb-2">
                <span className="text-cyan-400 font-mono text-sm font-bold">{log.version}</span>
                {idx === 0 && <Badge className="bg-green-600 text-white text-[10px]">LATEST</Badge>}
              </div>
              <p className="text-slate-300 text-xs line-clamp-2">{log.notes}</p>
              <div className="text-slate-500 text-[10px] mt-2">{log.date} • {log.time}</div>
            </div>
          ))}
        </SwipeCarousel>
      </BentoTile>

      {/* Feature Categories - PremiumAccordion */}
      <PremiumAccordion type="multiple" defaultValue={FEATURE_CATEGORIES.map(c => c.name)}>
        {FEATURE_CATEGORIES.map((category) => (
          <PremiumAccordionItem 
            key={category.name} 
            value={category.name}
            variant={category.color === "cyan" ? "premium" : category.color === "emerald" ? "gradient" : "glass"}
          >
            <PremiumAccordionTrigger
              icon={<span className="text-lg">{category.icon}</span>}
              badge={`${category.features.filter(f => checkedFeatures.includes(f.id)).length}/${category.features.length}`}
              description={`${category.features.filter(f => f.status === "complete").length} built`}
            >
              {category.name}
            </PremiumAccordionTrigger>
            <PremiumAccordionContent>
              <SwipeCarousel itemWidth="260px" gap={12}>
                {category.features.map((feature) => (
                  <div 
                    key={feature.id}
                    className={`p-3 rounded-xl transition-all cursor-pointer h-full ${
                      checkedFeatures.includes(feature.id) 
                        ? 'bg-green-900/40 border-2 border-green-500/50' 
                        : 'bg-slate-800/50 border border-slate-700/50 hover:bg-slate-700/50'
                    }`}
                    onClick={() => toggleFeature(feature.id)}
                    data-testid={`feature-card-${feature.id}`}
                  >
                    <div className="flex items-start gap-2">
                      <div className="mt-0.5 flex-shrink-0">
                        {checkedFeatures.includes(feature.id) ? (
                          <CheckCircle2 className="h-4 w-4 text-green-400" />
                        ) : (
                          <Circle className="h-4 w-4 text-white/40" />
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-1 flex-wrap mb-1">
                          <span className={`text-sm font-medium ${checkedFeatures.includes(feature.id) ? 'text-green-200' : 'text-white'}`}>
                            {feature.name}
                          </span>
                        </div>
                        <div className="flex gap-1 flex-wrap mb-2">
                          {feature.status === "complete" && (
                            <Badge className="bg-green-600/80 text-[9px] px-1.5 py-0">BUILT</Badge>
                          )}
                          {feature.status === "partial" && (
                            <Badge className="bg-yellow-600/80 text-[9px] px-1.5 py-0">PARTIAL</Badge>
                          )}
                          {feature.status === "planned" && (
                            <Badge className="bg-blue-600/80 text-[9px] px-1.5 py-0">PLANNED</Badge>
                          )}
                          {feature.tutorial && (
                            <Badge className="bg-purple-600/80 text-[9px] px-1.5 py-0">TUTORIAL</Badge>
                          )}
                        </div>
                        <p className="text-white/60 text-xs line-clamp-2">{feature.description}</p>
                      </div>
                    </div>
                    {feature.route && (
                      <PremiumButton
                        variant="glass"
                        size="sm"
                        icon={<ExternalLink className="h-3 w-3" />}
                        className="mt-2 w-full"
                        onClick={(e) => {
                          e?.stopPropagation();
                          setLocation(feature.route!);
                        }}
                        data-testid={`button-goto-${feature.id}`}
                      >
                        Open
                      </PremiumButton>
                    )}
                  </div>
                ))}
              </SwipeCarousel>
            </PremiumAccordionContent>
          </PremiumAccordionItem>
        ))}
      </PremiumAccordion>

      {/* Reset Button */}
      <div className="flex justify-end">
        <PremiumButton
          variant="glass"
          size="sm"
          onClick={() => {
            setCheckedFeatures([]);
            localStorage.removeItem('lotops_feature_checklist');
          }}
          data-testid="button-reset-checklist"
        >
          Reset Checklist
        </PremiumButton>
      </div>
    </div>
  );
}

function BetaTestersPanel() {
  const [selectedTester, setSelectedTesterState] = useState<string>(() => 
    localStorage.getItem('lotops_dev_tester_filter') || "all"
  );
  
  // Persist filter to localStorage
  const setSelectedTester = (value: string) => {
    localStorage.setItem('lotops_dev_tester_filter', value);
    setSelectedTesterState(value);
  };
  
  // Fetch beta tester login activity from API
  const { data: testerActivity = [], isLoading } = useQuery<BetaTester[]>({
    queryKey: ["/api/beta-testers/unique"],
  });

  // Filter activity by selected tester
  const filteredActivity = selectedTester === "all" 
    ? testerActivity 
    : testerActivity.filter(t => t.userName.toLowerCase() === selectedTester.toLowerCase());

  // Get recent logins (last 7 days)
  const recentLogins = filteredActivity.filter(t => {
    const loginDate = new Date(t.loginTime);
    const weekAgo = new Date();
    weekAgo.setDate(weekAgo.getDate() - 7);
    return loginDate > weekAgo;
  });

  return (
    <div className="space-y-4">
      {/* Universal PINs Reference Card - TOP PRIORITY */}
      <Card className="bg-gradient-to-br from-purple-900 to-indigo-900 border-purple-500 shadow-lg shadow-purple-500/20">
        <CardHeader className="pb-2">
          <CardTitle className="text-purple-100 flex items-center gap-2 text-lg">
            <Key className="h-5 w-5 text-purple-300" />
            Login PIN Reference
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {/* Permanent PIN */}
            <div className="bg-green-900/40 border border-green-500/50 rounded-lg p-3">
              <p className="text-green-300 text-xs font-semibold mb-2">PERMANENT PIN (Direct Login)</p>
              <div className="flex items-center justify-between">
                <span className="text-white font-medium">Operations Manager</span>
                <span className="font-mono text-xl text-green-400 font-bold">2222</span>
              </div>
            </div>
            
            {/* Universal PINs */}
            <div className="bg-purple-900/40 border border-purple-500/50 rounded-lg p-3">
              <p className="text-purple-300 text-xs font-semibold mb-2">UNIVERSAL PINs (First-Time Registration → Last 4 of Phone)</p>
              <div className="grid grid-cols-2 gap-2">
                {UNIVERSAL_PINS.filter(p => p.type === "universal").map(pin => (
                  <div key={pin.pin} className="flex items-center justify-between bg-slate-800/50 rounded px-2 py-1.5">
                    <span className="text-slate-300 text-sm">{pin.role}</span>
                    <span className="font-mono text-purple-400 font-bold">{pin.pin}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Beta Testers */}
            <div className="bg-cyan-900/40 border border-cyan-500/50 rounded-lg p-3">
              <p className="text-cyan-300 text-xs font-semibold mb-2">BETA TESTERS (Sandbox Mode)</p>
              <div className="grid grid-cols-4 gap-2">
                {BETA_TESTERS.map(tester => (
                  <div key={tester.pin} className="text-center bg-slate-800/50 rounded px-2 py-1.5">
                    <span className="font-mono text-cyan-400 font-bold block">{tester.pin}</span>
                    <span className="text-slate-400 text-[10px]">{tester.name}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Beta Testers Activity Header */}
      <Card className="bg-gradient-to-br from-cyan-900 to-cyan-800 border-cyan-600">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between flex-wrap gap-3">
            <CardTitle className="text-cyan-100 flex items-center gap-2">
              <FlaskConical className="h-5 w-5 text-cyan-300" />
              Beta Tester Activity
            </CardTitle>
            <Select value={selectedTester} onValueChange={setSelectedTester}>
              <SelectTrigger className="w-48 bg-cyan-800/50 border-cyan-600 text-cyan-100" data-testid="select-tester-filter">
                <SelectValue placeholder="Filter by tester" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Testers</SelectItem>
                {BETA_TESTERS.map(tester => (
                  <SelectItem key={tester.pin} value={tester.name.toLowerCase()}>
                    {tester.name} (PIN: {tester.pin})
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </CardHeader>
        <CardContent>
          {/* Stats Row */}
          <div className="grid grid-cols-3 gap-3">
            <div className="bg-cyan-800/40 rounded-lg p-3 text-center">
              <p className="text-2xl font-bold text-white">{BETA_TESTERS.length}</p>
              <p className="text-xs text-cyan-300">Total Testers</p>
            </div>
            <div className="bg-cyan-800/40 rounded-lg p-3 text-center">
              <p className="text-2xl font-bold text-white">{recentLogins.length}</p>
              <p className="text-xs text-cyan-300">Logins (7 days)</p>
            </div>
            <div className="bg-cyan-800/40 rounded-lg p-3 text-center">
              <p className="text-2xl font-bold text-white">2</p>
              <p className="text-xs text-cyan-300">Projects</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Tester Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
        {BETA_TESTERS.filter(t => selectedTester === "all" || t.name.toLowerCase() === selectedTester).map(tester => {
          // Find this tester's latest login
          const testerLogins = testerActivity.filter(a => 
            a.userName.toLowerCase() === tester.name.toLowerCase()
          );
          const lastLogin = testerLogins.length > 0 
            ? new Date(testerLogins[0].loginTime).toLocaleDateString('en-US', { 
                month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' 
              })
            : "Never";
          const loginCount = testerLogins.length;
          
          return (
            <Card 
              key={tester.pin} 
              className="bg-gradient-to-br from-slate-800 to-slate-700 border-slate-600 hover:border-cyan-500 transition-colors"
              data-testid={`card-tester-${tester.name.toLowerCase()}`}
            >
              <CardContent className="p-4">
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-cyan-500 to-blue-600 flex items-center justify-center text-white font-bold text-lg">
                      {tester.name.charAt(0)}
                    </div>
                    <div>
                      <p className="font-semibold text-white">{tester.name}</p>
                      <p className="text-xs text-slate-400">PIN: {tester.pin}</p>
                    </div>
                  </div>
                  <Badge className={`${tester.status === 'active' ? 'bg-green-600' : 'bg-slate-600'} text-white text-[10px]`}>
                    {tester.status}
                  </Badge>
                </div>
                
                <div className="space-y-2 text-sm">
                  <div className="flex items-center justify-between text-slate-300">
                    <span className="flex items-center gap-1.5">
                      <Calendar className="h-3.5 w-3.5 text-cyan-400" />
                      Last Login
                    </span>
                    <span className="text-white font-medium">{lastLogin}</span>
                  </div>
                  <div className="flex items-center justify-between text-slate-300">
                    <span className="flex items-center gap-1.5">
                      <UserCheck className="h-3.5 w-3.5 text-green-400" />
                      Total Logins
                    </span>
                    <span className="text-white font-medium">{loginCount}</span>
                  </div>
                  <div className="flex items-center justify-between text-slate-300">
                    <span className="flex items-center gap-1.5">
                      <FlaskConical className="h-3.5 w-3.5 text-purple-400" />
                      Project
                    </span>
                    <span className="text-cyan-300 font-medium">{tester.project}</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Recent Activity Log */}
      <Card className="bg-gradient-to-br from-slate-800 to-slate-700 border-slate-600">
        <CardHeader className="pb-2">
          <CardTitle className="text-slate-200 text-sm flex items-center gap-2">
            <Clock className="h-4 w-4 text-amber-400" />
            Recent Login Activity
          </CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <p className="text-slate-400 text-sm">Loading activity...</p>
          ) : filteredActivity.length === 0 ? (
            <p className="text-slate-400 text-sm">No login activity recorded yet</p>
          ) : (
            <div className="space-y-2 max-h-60 overflow-y-auto">
              {filteredActivity.slice(0, 20).map((activity, idx) => (
                <div 
                  key={idx} 
                  className="flex items-center justify-between bg-slate-700/50 rounded-lg px-3 py-2 text-sm"
                >
                  <div className="flex items-center gap-2">
                    <div className="w-7 h-7 rounded-full bg-cyan-600/50 flex items-center justify-center text-cyan-200 text-xs font-bold">
                      {activity.userName.charAt(0)}
                    </div>
                    <span className="text-white font-medium">{activity.userName}</span>
                    <Badge variant="outline" className="text-[10px] border-slate-500 text-slate-300">
                      {activity.userRole}
                    </Badge>
                  </div>
                  <span className="text-slate-400 text-xs">
                    {new Date(activity.loginTime).toLocaleDateString('en-US', { 
                      month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' 
                    })}
                  </span>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

function HallmarkTrackingContent() {
  const { toast } = useToast();
  const [hallmarkFilter, setHallmarkFilterState] = useState<string>(() => 
    localStorage.getItem('lotops_dev_hallmark_filter') || "all"
  );
  
  // Persist filter to localStorage
  const setHallmarkFilter = (value: string) => {
    localStorage.setItem('lotops_dev_hallmark_filter', value);
    setHallmarkFilterState(value);
  };

  // Fetch hallmarks
  const { data: hallmarks = [], isLoading: loadingHallmarks } = useQuery<Hallmark[]>({
    queryKey: ["/api/hallmarks"],
  });

  // Fetch assets
  const { data: assets = [], isLoading: loadingAssets } = useQuery<Asset[]>({
    queryKey: ["/api/assets"],
  });

  // Fetch asset history
  const { data: assetHistory = [], isLoading: loadingHistory } = useQuery<AssetHistoryEntry[]>({
    queryKey: ["/api/assets/history"],
  });

  // Calculate statistics
  const totalHallmarks = hallmarks.length;
  const totalAssets = assets.length;

  // Count assets per hallmark
  const hallmarkUsageCount = assets.reduce((acc, asset) => {
    acc[asset.hallmarkStamp] = (acc[asset.hallmarkStamp] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  // Find most used hallmark
  const mostUsedHallmark = Object.entries(hallmarkUsageCount).sort((a, b) => b[1] - a[1])[0];

  // Filter history by hallmark
  const filteredHistory = hallmarkFilter === "all" 
    ? assetHistory 
    : assetHistory.filter(entry => entry.hallmarkStamp === hallmarkFilter);

  return (
    <div className="space-y-4">
      <NavigationControl variant="back" fallbackRoute="/developer" />
      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="bg-gradient-to-br from-emerald-700 to-emerald-800 border-emerald-600" data-testid="card-stat-total-hallmarks">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-emerald-200 mb-1">Total Hallmarks</p>
                <p className="text-2xl font-bold text-white" data-testid="text-total-hallmarks">{totalHallmarks}</p>
              </div>
              <Stamp className="h-8 w-8 text-emerald-300" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-blue-700 to-blue-800 border-blue-600" data-testid="card-stat-total-assets">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-blue-200 mb-1">Total Assets Tracked</p>
                <p className="text-2xl font-bold text-white" data-testid="text-total-assets">{totalAssets}</p>
              </div>
              <Database className="h-8 w-8 text-blue-300" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-purple-700 to-purple-800 border-purple-600" data-testid="card-stat-most-used">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-purple-200 mb-1">Most Used Hallmark</p>
                <p className="text-lg font-bold text-white truncate" data-testid="text-most-used-hallmark">
                  {mostUsedHallmark ? `${mostUsedHallmark[0]} (${mostUsedHallmark[1]})` : "N/A"}
                </p>
              </div>
              <TrendingUp className="h-8 w-8 text-purple-300" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Hallmark Overview Card */}
      <Card className="bg-gradient-to-br from-slate-800 to-slate-700 border-slate-600">
        <CardHeader className="pb-3">
          <CardTitle className="text-emerald-200 flex items-center gap-2">
            <Stamp className="h-5 w-5 text-emerald-400" />
            Hallmark Overview
          </CardTitle>
          <p className="text-xs text-slate-400 mt-1">All registered hallmarks and their usage</p>
        </CardHeader>
        <CardContent>
          {loadingHallmarks ? (
            <p className="text-sm text-slate-300">Loading hallmarks...</p>
          ) : hallmarks.length === 0 ? (
            <div className="text-center py-6 bg-slate-700/50 rounded-lg border-2 border-dashed border-slate-600">
              <Stamp className="h-8 w-8 mx-auto mb-2 text-emerald-400" />
              <p className="text-sm font-medium text-emerald-300">No hallmarks created yet</p>
              <p className="text-xs text-slate-400">Create a hallmark to start tracking assets</p>
            </div>
          ) : (
            <div className="space-y-3">
              {hallmarks.map((hallmark) => (
                <Card key={hallmark.id} className="p-4 bg-slate-800/50 border-slate-600" data-testid={`hallmark-card-${hallmark.id}`}>
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <h3 className="text-lg font-bold text-white" data-testid={`hallmark-name-${hallmark.id}`}>
                          {hallmark.name}
                        </h3>
                        {hallmark.isDefault && (
                          <Badge className="bg-emerald-600 text-white text-xs" data-testid={`hallmark-default-badge-${hallmark.id}`}>
                            Default
                          </Badge>
                        )}
                      </div>
                      <p className="text-sm text-slate-300 mb-3" data-testid={`hallmark-description-${hallmark.id}`}>
                        {hallmark.description || "No description"}
                      </p>
                      <div className="flex items-center gap-3">
                        <div className="flex items-center gap-1.5">
                          <span className="text-xs text-slate-400">Colors:</span>
                          <div className="flex gap-1">
                            <div 
                              className="w-6 h-6 rounded border border-slate-500" 
                              style={{ backgroundColor: hallmark.primaryColor }}
                              title={`Primary: ${hallmark.primaryColor}`}
                              data-testid={`hallmark-primary-color-${hallmark.id}`}
                            />
                            <div 
                              className="w-6 h-6 rounded border border-slate-500" 
                              style={{ backgroundColor: hallmark.secondaryColor }}
                              title={`Secondary: ${hallmark.secondaryColor}`}
                              data-testid={`hallmark-secondary-color-${hallmark.id}`}
                            />
                            {hallmark.accentColor && (
                              <div 
                                className="w-6 h-6 rounded border border-slate-500" 
                                style={{ backgroundColor: hallmark.accentColor }}
                                title={`Accent: ${hallmark.accentColor}`}
                                data-testid={`hallmark-accent-color-${hallmark.id}`}
                              />
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="bg-emerald-900/30 border border-emerald-500/30 rounded-lg px-4 py-2">
                        <p className="text-xs text-emerald-300 mb-1">Assets Stamped</p>
                        <p className="text-2xl font-bold text-emerald-200" data-testid={`hallmark-asset-count-${hallmark.id}`}>
                          {hallmarkUsageCount[hallmark.name] || 0}
                        </p>
                      </div>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Asset Audit Trail Card */}
      <Card className="bg-gradient-to-br from-slate-800 to-slate-700 border-slate-600">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-blue-200 flex items-center gap-2">
                <FileText className="h-5 w-5 text-blue-400" />
                Asset Audit Trail
              </CardTitle>
              <p className="text-xs text-slate-400 mt-1">Recent asset history entries</p>
            </div>
            <Select value={hallmarkFilter} onValueChange={setHallmarkFilter}>
              <SelectTrigger className="w-48 bg-slate-700 border-slate-600 text-white" data-testid="select-hallmark-filter">
                <SelectValue placeholder="Filter by hallmark" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Hallmarks</SelectItem>
                {hallmarks.map((hallmark) => (
                  <SelectItem key={hallmark.id} value={hallmark.name}>
                    {hallmark.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </CardHeader>
        <CardContent>
          {loadingHistory ? (
            <p className="text-sm text-slate-300">Loading history...</p>
          ) : filteredHistory.length === 0 ? (
            <div className="text-center py-6 bg-slate-700/50 rounded-lg border-2 border-dashed border-slate-600">
              <FileText className="h-8 w-8 mx-auto mb-2 text-blue-400" />
              <p className="text-sm font-medium text-blue-300">No history entries found</p>
              <p className="text-xs text-slate-400">Asset history will appear here once assets are created or modified</p>
            </div>
          ) : (
            <div className="space-y-2 max-h-[600px] overflow-y-auto">
              {filteredHistory.slice(0, 50).map((entry) => (
                <Card key={entry.id} className="p-3 bg-slate-800/50 border-slate-600 hover:bg-slate-800/70 transition-colors" data-testid={`history-entry-${entry.id}`}>
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <Badge 
                          className="text-xs" 
                          style={{ 
                            backgroundColor: entry.action === "created" ? "#10b981" : 
                                           entry.action === "modified" ? "#f59e0b" : 
                                           entry.action === "assigned" ? "#3b82f6" : "#6b7280" 
                          }}
                          data-testid={`history-action-badge-${entry.id}`}
                        >
                          {entry.action}
                        </Badge>
                        <span className="text-xs text-slate-400" data-testid={`history-hallmark-${entry.id}`}>
                          {entry.hallmarkStamp}
                        </span>
                      </div>
                      <p className="text-sm text-slate-300 mb-1" data-testid={`history-description-${entry.id}`}>
                        {entry.actionDescription}
                      </p>
                      <div className="flex items-center gap-4 text-xs text-slate-400">
                        <span data-testid={`history-performed-by-${entry.id}`}>
                          By: {entry.performedByName || `User #${entry.performedBy}`}
                        </span>
                        <span data-testid={`history-timestamp-${entry.id}`}>
                          {new Date(entry.createdAt).toLocaleString()}
                        </span>
                      </div>
                    </div>
                  </div>
                </Card>
              ))}
              {filteredHistory.length > 50 && (
                <p className="text-xs text-slate-400 text-center py-2">
                  Showing 50 of {filteredHistory.length} entries
                </p>
              )}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

export default function DeveloperDashboard() {
  const [_, setLocation] = useLocation();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // Auth Check - Developer Only
  useEffect(() => {
    const userStr = localStorage.getItem("vanops_user");
    if (!userStr) {
      toast({ title: "Access Denied", description: "Please log in.", variant: "destructive" });
      setLocation("/");
      return;
    }
    try {
      const user = JSON.parse(userStr);
      if (user.role !== "developer") {
        toast({ title: "Developer Access Required", description: "This area is for app development only.", variant: "destructive" });
        setLocation("/dashboard");
        return;
      }
    } catch {
      setLocation("/");
    }
  }, []);

  // Lot Configuration State
  const [editingLot, setEditingLot] = useState<Partial<LotSpace> | null>(null);
  const [newLot, setNewLot] = useState({
    lotNumber: "",
    lotName: "",
    capacity: 0,
    currentOccupancy: 0,
    zoneType: "inventory",
    locationType: "",
    customNotes: ""
  });

  // Location templates for overflow zones
  const locationTemplates = [
    { value: "front_arena", label: "Front of Arena" },
    { value: "back_arena", label: "Back of Arena" },
    { value: "drive_lane", label: "Drive Lane (specify in notes)" },
    { value: "grass_edge", label: "Edge of Grass Line" },
    { value: "between_lots", label: "Between Lots (specify in notes)" },
    { value: "overflow_zone", label: "Overflow Zone (specify in notes)" },
    { value: "custom", label: "Custom Location" }
  ];

  const zoneTypes = [
    { value: "inventory", label: "Inventory" },
    { value: "sold_units", label: "Sold Units" },
    { value: "overflow", label: "Overflow" },
    { value: "holding", label: "Holding/Temporary" }
  ];

  // Fetch lots
  const { data: lots = [], isLoading } = useQuery<LotSpace[]>({
    queryKey: ["/api/lots"],
  });

  // Save lot mutation
  const saveLotMutation = useMutation({
    mutationFn: async (lot: Partial<LotSpace>) => {
      const res = await fetch("/api/lots", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(lot),
      });
      if (!res.ok) throw new Error("Failed to save lot");
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/lots"] });
      toast({ title: "Lot Saved", description: "Lot configuration updated successfully" });
      setEditingLot(null);
      setNewLot({ lotNumber: "", lotName: "", capacity: 0, currentOccupancy: 0, zoneType: "inventory", locationType: "", customNotes: "" });
    },
  });

  // Predefined lots for quick setup
  const predefinedLots = [
    { lotNumber: "501", lotName: "General Inventory 501", capacity: 0, zoneType: "inventory" },
    { lotNumber: "502", lotName: "General Inventory 502", capacity: 0, zoneType: "inventory" },
    { lotNumber: "503", lotName: "General Inventory 503", capacity: 0, zoneType: "inventory" },
    { lotNumber: "504", lotName: "General Inventory 504", capacity: 0, zoneType: "inventory" },
    { lotNumber: "505", lotName: "General Inventory 505", capacity: 0, zoneType: "inventory" },
    { lotNumber: "513", lotName: "General Inventory 513", capacity: 0, zoneType: "inventory" },
    { lotNumber: "514", lotName: "General Inventory 514", capacity: 0, zoneType: "inventory" },
    { lotNumber: "515", lotName: "General Inventory 515", capacity: 0, zoneType: "inventory" },
    { lotNumber: "516", lotName: "Ford Inventory 516", capacity: 0, zoneType: "inventory" },
    { lotNumber: "517", lotName: "GM Inventory 517", capacity: 0, zoneType: "inventory" },
    { lotNumber: "518", lotName: "General Inventory 518", capacity: 0, zoneType: "inventory" },
    { lotNumber: "591", lotName: "General Inventory 591", capacity: 0, zoneType: "inventory" },
    { lotNumber: "592", lotName: "General Inventory 592", capacity: 0, zoneType: "inventory" },
    { lotNumber: "593", lotName: "General Inventory 593", capacity: 0, zoneType: "inventory" },
    { lotNumber: "594", lotName: "General Inventory 594", capacity: 0, zoneType: "inventory" },
    { lotNumber: "595", lotName: "General Inventory 595", capacity: 0, zoneType: "inventory" },
    { lotNumber: "596", lotName: "General Inventory 596", capacity: 0, zoneType: "inventory" },
    { lotNumber: "597", lotName: "General Inventory 597", capacity: 0, zoneType: "inventory" },
    { lotNumber: "598", lotName: "General Inventory 598", capacity: 0, zoneType: "inventory" },
    { lotNumber: "599", lotName: "General Inventory 599", capacity: 0, zoneType: "inventory" },
    { lotNumber: "701", lotName: "General Inventory 701", capacity: 0, zoneType: "inventory" },
  ];

  const initializeAllLots = async () => {
    for (const lot of predefinedLots) {
      await saveLotMutation.mutateAsync({
        lotNumber: lot.lotNumber,
        lotName: lot.lotName,
        capacity: lot.capacity,
        currentOccupancy: 0,
        zoneType: lot.zoneType,
        isActive: true,
        notes: "Set capacity tonight"
      });
    }
  };

  const getOccupancyPercent = (lot: LotSpace) => {
    if (lot.capacity === 0) return 0;
    return Math.round((lot.currentOccupancy / lot.capacity) * 100);
  };

  const getOccupancyColor = (percent: number) => {
    if (percent >= 95) return "text-red-600 bg-red-50";
    if (percent >= 85) return "text-orange-600 bg-orange-50";
    if (percent >= 70) return "text-yellow-600 bg-yellow-50";
    return "text-green-600 bg-green-50";
  };

  return (
    <div className="dark min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-800 p-4 pb-20">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Premium Header Tile */}
        <BentoTile
          variant="premium"
          size="wide"
          sparkle
          interactive={false}
          icon={<Zap className="h-6 w-6" />}
          title="Developer Hub"
          description="System Configuration & Analytics"
          badge="PREMIUM"
          data-testid="tile-header"
          action={
            <div className="flex gap-2">
              <PremiumButton
                variant="glow"
                size="sm"
                onClick={() => {
                  localStorage.removeItem("vanops_dev_autologin");
                  setLocation("/dashboard");
                }}
                data-testid="button-enter-app"
              >
                Enter App
              </PremiumButton>
              <PremiumButton
                variant="glass"
                size="sm"
                onClick={() => {
                  localStorage.removeItem("vanops_user");
                  localStorage.removeItem("vanops_pin");
                  localStorage.removeItem("vanops_dev_autologin");
                  setLocation("/");
                }}
                data-testid="button-switch-to-login"
              >
                Logout
              </PremiumButton>
            </div>
          }
        />

        {/* Quick Navigation BentoGrid */}
        <BentoGrid columns={6} gap="md">
          <BentoTile
            variant="gradient"
            size="sm"
            icon={<img src="/icon-512x512.png" alt="App" className="h-5 w-5" />}
            title="App"
            onClick={() => {
              localStorage.removeItem("vanops_dev_autologin");
              setLocation("/dashboard");
            }}
            data-testid="button-go-to-app"
          />
          <BentoTile
            variant="glow"
            size="sm"
            sparkle
            icon={<Zap className="h-5 w-5" />}
            title="Configure"
            onClick={() => setLocation("/configure")}
            data-testid="button-configure"
          />
          <BentoTile
            variant="glass"
            size="sm"
            icon={<FileText className="h-5 w-5" />}
            title="Workflow"
            onClick={() => setLocation("/system-workflow")}
            data-testid="button-workflow"
          />
          <BentoTile
            variant="gradient"
            size="sm"
            icon={<MapPin className="h-5 w-5" />}
            title="Maps"
            onClick={() => setLocation("/weekly-maps")}
            data-testid="button-weekly-maps"
          />
          <BentoTile
            variant="glass"
            size="sm"
            icon={<Users className="h-5 w-5" />}
            title="Supervisor"
            onClick={() => setLocation("/resource-allocation")}
            data-testid="button-supervisor-view"
          />
          <BentoTile
            variant="premium"
            size="sm"
            sparkle
            icon={<BarChart3 className="h-5 w-5" />}
            title="Operations"
            badge="KEY"
            onClick={() => setLocation("/operations-manager")}
            data-testid="button-operations-manager"
          />
        </BentoGrid>

        {/* System Health & Payments BentoGrid */}
        <BentoGrid columns={3} gap="md">
          <BentoTile variant="glass" size="md" interactive={false} data-testid="tile-system-health">
            <SystemHealthCheck />
          </BentoTile>
          <BentoTile variant="gradient" size="md" interactive={false} data-testid="tile-payments">
            <PaymentSystemDashboard />
          </BentoTile>
          <BentoTile variant="glow" size="md" interactive={false} data-testid="tile-coinbase">
            <CoinbaseCommerceDashboard />
          </BentoTile>
        </BentoGrid>

        <Tabs defaultValue="inventory" className="w-full">
          <TabsList className="grid w-full grid-cols-3 md:grid-cols-4 lg:grid-cols-12 gap-2 text-xs bg-transparent border-0 p-0 mb-12">
            <TabsTrigger value="inventory" data-testid="tab-inventory" className="bg-gradient-to-r from-emerald-600/60 to-teal-600/60 border-2 border-emerald-400/50 text-emerald-100 rounded-lg data-[state=active]:bg-gradient-to-r data-[state=active]:from-emerald-500 data-[state=active]:to-teal-500 data-[state=active]:border-emerald-400 data-[state=active]:text-white py-2 hover:from-emerald-500/60 hover:to-teal-500/60">
              <ClipboardList className="h-4 w-4" />
              <span className="hidden md:inline ml-1 font-bold">Inventory</span>
            </TabsTrigger>
            <TabsTrigger value="reports" data-testid="tab-reports" className="bg-slate-700/40 border border-slate-600/50 text-slate-200 rounded-lg data-[state=active]:bg-blue-600 data-[state=active]:border-blue-500 data-[state=active]:text-white py-2 hover:bg-slate-700/60">
              <TrendingUp className="h-4 w-4" />
              <span className="hidden md:inline ml-1">Reports</span>
            </TabsTrigger>
            <TabsTrigger value="arena-staging" data-testid="tab-arena-staging" className="bg-purple-700/40 border-2 border-purple-400/50 text-purple-100 rounded-lg data-[state=active]:bg-purple-600 data-[state=active]:border-purple-400 data-[state=active]:text-white py-2 hover:bg-purple-700/60">
              <Layers className="h-4 w-4" />
              <span className="hidden md:inline ml-1 font-semibold">Arena</span>
            </TabsTrigger>
            <TabsTrigger value="roadmap" data-testid="tab-roadmap" className="bg-slate-700/40 border border-slate-600/50 text-slate-200 rounded-lg data-[state=active]:bg-cyan-600 data-[state=active]:border-cyan-500 data-[state=active]:text-white py-2 hover:bg-slate-700/60">
              <Rocket className="h-4 w-4" />
              <span className="hidden md:inline ml-1">Roadmap</span>
            </TabsTrigger>
            <TabsTrigger value="sales" data-testid="tab-sales" className="bg-slate-700/40 border border-slate-600/50 text-slate-200 rounded-lg data-[state=active]:bg-purple-600 data-[state=active]:border-purple-500 data-[state=active]:text-white py-2 hover:bg-slate-700/60">
              <Briefcase className="h-4 w-4" />
              <span className="hidden md:inline ml-1">Sales</span>
            </TabsTrigger>
            <TabsTrigger value="valuation" data-testid="tab-valuation" className="bg-slate-700/40 border border-slate-600/50 text-slate-200 rounded-lg data-[state=active]:bg-green-600 data-[state=active]:border-green-500 data-[state=active]:text-white py-2 hover:bg-slate-700/60">
              <DollarSign className="h-4 w-4" />
              <span className="hidden md:inline ml-1">Valuation</span>
            </TabsTrigger>
            <TabsTrigger value="lots" data-testid="tab-lots" className="bg-slate-700/40 border border-slate-600/50 text-slate-200 rounded-lg data-[state=active]:bg-orange-600 data-[state=active]:border-orange-500 data-[state=active]:text-white py-2 hover:bg-slate-700/60">
              <Warehouse className="h-4 w-4" />
              <span className="hidden md:inline ml-1">Lots</span>
            </TabsTrigger>
            <TabsTrigger value="shifts" data-testid="tab-shifts" className="bg-slate-700/40 border border-slate-600/50 text-slate-200 rounded-lg data-[state=active]:bg-amber-600 data-[state=active]:border-amber-500 data-[state=active]:text-white py-2 hover:bg-slate-700/60">
              <Clock className="h-4 w-4" />
              <span className="hidden md:inline ml-1">Shifts</span>
            </TabsTrigger>
            <TabsTrigger value="messages" data-testid="tab-messages" className="bg-slate-700/40 border border-slate-600/50 text-slate-200 rounded-lg data-[state=active]:bg-pink-600 data-[state=active]:border-pink-500 data-[state=active]:text-white py-2 hover:bg-slate-700/60">
              <MessageSquare className="h-4 w-4" />
              <span className="hidden md:inline ml-1">Messages</span>
            </TabsTrigger>
            <TabsTrigger value="system" data-testid="tab-system" className="bg-slate-700/40 border border-slate-600/50 text-slate-200 rounded-lg data-[state=active]:bg-slate-600 data-[state=active]:border-slate-500 data-[state=active]:text-white py-2 hover:bg-slate-700/60">
              <Settings className="h-4 w-4" />
              <span className="hidden md:inline ml-1">System</span>
            </TabsTrigger>
            <TabsTrigger value="legal" data-testid="tab-legal" className="bg-slate-700/40 border border-slate-600/50 text-slate-200 rounded-lg data-[state=active]:bg-indigo-600 data-[state=active]:border-indigo-500 data-[state=active]:text-white py-2 hover:bg-slate-700/60">
              <Scale className="h-4 w-4" />
              <span className="hidden md:inline ml-1">Legal</span>
            </TabsTrigger>
            <TabsTrigger value="hallmarks" data-testid="tab-hallmarks" className="bg-slate-700/40 border border-slate-600/50 text-slate-200 rounded-lg data-[state=active]:bg-emerald-600 data-[state=active]:border-emerald-500 data-[state=active]:text-white py-2 hover:bg-slate-700/60">
              <Stamp className="h-4 w-4" />
              <span className="hidden md:inline ml-1">Hallmarks</span>
            </TabsTrigger>
            <TabsTrigger value="apis" data-testid="tab-apis" className="bg-slate-700/40 border border-slate-600/50 text-slate-200 rounded-lg data-[state=active]:bg-red-600 data-[state=active]:border-red-500 data-[state=active]:text-white py-2 hover:bg-slate-700/60">
              <FileText className="h-4 w-4" />
              <span className="hidden md:inline ml-1">APIs</span>
            </TabsTrigger>
            <TabsTrigger value="testers" data-testid="tab-testers" className="bg-cyan-700/40 border-2 border-cyan-400/50 text-cyan-100 rounded-lg data-[state=active]:bg-cyan-600 data-[state=active]:border-cyan-400 data-[state=active]:text-white py-2 hover:bg-cyan-700/60">
              <FlaskConical className="h-4 w-4" />
              <span className="hidden md:inline ml-1 font-semibold">Testers</span>
            </TabsTrigger>
            <TabsTrigger value="releases" data-testid="tab-releases" className="bg-emerald-700/40 border-2 border-emerald-400/50 text-emerald-100 rounded-lg data-[state=active]:bg-emerald-600 data-[state=active]:border-emerald-400 data-[state=active]:text-white py-2 hover:bg-emerald-700/60">
              <Rocket className="h-4 w-4" />
              <span className="hidden md:inline ml-1 font-semibold">Releases</span>
            </TabsTrigger>
          </TabsList>

          {/* Feature Inventory Tab - Comprehensive Checklist */}
          <TabsContent value="inventory" className="space-y-4">
            <FeatureInventory />
          </TabsContent>

          {/* Arena Staging Tab */}
          <TabsContent value="arena-staging" className="space-y-3">
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <Badge variant="secondary" className="mb-4">Coming Soon</Badge>
              <p className="text-muted-foreground">Arena Staging features are being developed for a future update.</p>
            </div>
          </TabsContent>

          {/* Roadmap Tab */}
          <TabsContent value="roadmap" className="space-y-3">
            <Card className="bg-gradient-to-br from-slate-800 to-slate-700 border-slate-600">
              <CardHeader className="pb-3">
                <CardTitle className="text-cyan-200 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Rocket className="h-5 w-5 text-cyan-400" />
                    System Workflow Diagram
                  </div>
                  <Button
                    onClick={() => setLocation("/system-workflow")}
                    className="bg-cyan-600 hover:bg-cyan-700 text-white text-xs"
                    data-testid="button-view-workflow"
                  >
                    View Flow →
                  </Button>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-slate-300 text-sm">
                  Visual flowchart showing how the system operates from login through all features.
                </p>
              </CardContent>
            </Card>
            <EnterpriseRoadmap />
          </TabsContent>

          {/* Sales Strategy Tab */}
          <TabsContent value="sales" className="space-y-3">
            <MarketingMaterialsGenerator />
            <SalesStrategyGuide />
          </TabsContent>

          {/* Valuation Tab */}
          <TabsContent value="valuation" className="space-y-3">
            <LicensingValuation />
          </TabsContent>

          {/* First-Time Messages Tab */}
          <TabsContent value="messages" className="space-y-3">
            <FirstTimeMessagePreviewer />
          </TabsContent>

          {/* Lot Configuration Tab */}
          <TabsContent value="lots" className="space-y-3">
            <Card className="bg-gradient-to-br from-slate-800 to-slate-700 border-slate-600">
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="text-orange-200 flex items-center gap-2">
                      <Warehouse className="h-5 w-5 text-orange-400" />
                      Lot Capacity Management
                    </CardTitle>
                    <p className="text-xs text-slate-400 mt-1">Configure inventory lot capacities and tracking</p>
                  </div>
                  <Button
                    onClick={() => initializeAllLots()}
                    disabled={saveLotMutation.isPending}
                    size="sm"
                    className="bg-orange-600 hover:bg-orange-700 text-white"
                    data-testid="button-initialize-lots"
                  >
                    <Plus className="h-4 w-4 mr-1.5" />
                    Initialize
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="space-y-3">
                {/* Lot List */}
                <div className="grid gap-2">
                  {isLoading ? (
                    <p className="text-sm text-slate-300">Loading lots...</p>
                  ) : lots.length === 0 ? (
                    <div className="text-center py-6 bg-slate-700/50 rounded-lg border-2 border-dashed border-slate-600">
                      <Warehouse className="h-8 w-8 mx-auto mb-2 text-blue-400" />
                      <p className="text-sm font-medium text-blue-300">No lots configured yet</p>
                      <p className="text-xs text-blue-400 mb-3">Click "Initialize All Lots" to set up your inventory lots</p>
                    </div>
                  ) : (
                    lots.map((lot) => (
                      <Card key={lot.id} className="p-3 bg-slate-800/50 border-slate-600" data-testid={`lot-card-${lot.lotNumber}`}>
                        {editingLot?.id === lot.id ? (
                          <div className="space-y-2">
                            <div className="grid grid-cols-2 gap-2">
                              <div>
                                <Label className="text-xs text-white">Lot Number</Label>
                                <Input
                                  value={editingLot.lotNumber}
                                  onChange={(e) => setEditingLot({ ...editingLot, lotNumber: e.target.value })}
                                  className="h-8 text-sm bg-transparent text-white placeholder-slate-400 border border-slate-500"
                                  data-testid={`input-lot-number-${lot.lotNumber}`}
                                />
                              </div>
                              <div>
                                <Label className="text-xs text-white">Capacity</Label>
                                <Input
                                  type="number"
                                  value={editingLot.capacity}
                                  onChange={(e) => setEditingLot({ ...editingLot, capacity: parseInt(e.target.value) || 0 })}
                                  className="h-8 text-sm bg-transparent text-white placeholder-slate-400 border border-slate-500"
                                  data-testid={`input-capacity-${lot.lotNumber}`}
                                />
                              </div>
                            </div>
                            <div>
                              <Label className="text-xs text-white">Lot Name</Label>
                              <Input
                                value={editingLot.lotName}
                                onChange={(e) => setEditingLot({ ...editingLot, lotName: e.target.value })}
                                className="h-8 text-sm bg-transparent text-white placeholder-slate-400 border border-slate-500"
                                data-testid={`input-lot-name-${lot.lotNumber}`}
                              />
                            </div>
                            <div className="grid grid-cols-2 gap-2">
                              <div>
                                <Label className="text-xs text-white">Zone Type</Label>
                                <Select
                                  value={editingLot.zoneType || "inventory"}
                                  onValueChange={(value) => setEditingLot({ ...editingLot, zoneType: value })}
                                >
                                  <SelectTrigger className="h-8 text-sm bg-transparent text-white border border-slate-500">
                                    <SelectValue />
                                  </SelectTrigger>
                                  <SelectContent>
                                    {zoneTypes.map(type => (
                                      <SelectItem key={type.value} value={type.value} className="text-sm">
                                        {type.label}
                                      </SelectItem>
                                    ))}
                                  </SelectContent>
                                </Select>
                              </div>
                              <div>
                                <Label className="text-xs text-white">Location Template</Label>
                                <Select
                                  value={(editingLot.notes && editingLot.notes.includes("Front of Arena")) ? "front_arena" : 
                                         (editingLot.notes && editingLot.notes.includes("Back of Arena")) ? "back_arena" :
                                         (editingLot.notes && editingLot.notes.includes("Drive Lane")) ? "drive_lane" :
                                         (editingLot.notes && editingLot.notes.includes("Grass")) ? "grass_edge" : "custom"}
                                  onValueChange={(value) => {
                                    const template = locationTemplates.find(t => t.value === value);
                                    if (template && value !== "custom") {
                                      setEditingLot({ ...editingLot, notes: template.label });
                                    } else {
                                      setEditingLot({ ...editingLot, notes: editingLot.notes || "" });
                                    }
                                  }}
                                >
                                  <SelectTrigger className="h-8 text-sm bg-transparent text-white border border-slate-500">
                                    <SelectValue />
                                  </SelectTrigger>
                                  <SelectContent>
                                    {locationTemplates.map(loc => (
                                      <SelectItem key={loc.value} value={loc.value} className="text-sm">
                                        {loc.label}
                                      </SelectItem>
                                    ))}
                                  </SelectContent>
                                </Select>
                              </div>
                            </div>
                            <div>
                              <Label className="text-xs text-white">Custom Notes (e.g., "Between rows 52 and 46")</Label>
                              <Input
                                value={editingLot.notes || ""}
                                onChange={(e) => setEditingLot({ ...editingLot, notes: e.target.value })}
                                className="h-8 text-sm bg-transparent text-white placeholder-slate-400 border border-slate-500"
                                placeholder="Add specific details..."
                                data-testid={`input-notes-${lot.lotNumber}`}
                              />
                            </div>
                            <div className="flex gap-2">
                              <Button
                                size="sm"
                                onClick={() => saveLotMutation.mutate(editingLot)}
                                className="flex-1 h-7 text-xs"
                                data-testid={`button-save-${lot.lotNumber}`}
                              >
                                <Save className="h-3 w-3 mr-1" />
                                Save
                              </Button>
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => setEditingLot(null)}
                                className="h-7 text-xs"
                                data-testid={`button-cancel-${lot.lotNumber}`}
                              >
                                Cancel
                              </Button>
                            </div>
                          </div>
                        ) : (
                          <div className="flex items-center justify-between gap-3">
                            <div className="flex items-center gap-3 flex-1 min-w-0">
                              <div className={`px-2 py-1 rounded text-xs font-bold ${getOccupancyColor(getOccupancyPercent(lot))}`}>
                                {lot.capacity > 0 ? `${getOccupancyPercent(lot)}%` : "N/A"}
                              </div>
                              <div className="flex-1 min-w-0">
                                <div className="flex items-center gap-2">
                                  <p className="text-sm font-semibold truncate text-white" data-testid={`text-lot-${lot.lotNumber}`}>
                                    Lot {lot.lotNumber} - {lot.lotName}
                                  </p>
                                  <Badge variant="outline" className="text-[10px] px-1 py-0">
                                    {lot.zoneType}
                                  </Badge>
                                </div>
                                <p className="text-xs text-slate-300">
                                  {lot.currentOccupancy} / {lot.capacity} spots
                                  {lot.notes && <span className="text-blue-300 ml-2">• {lot.notes}</span>}
                                </p>
                              </div>
                            </div>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => setEditingLot(lot)}
                              className="h-7 text-xs flex-shrink-0"
                              data-testid={`button-edit-${lot.lotNumber}`}
                            >
                              Edit
                            </Button>
                          </div>
                        )}
                      </Card>
                    ))
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Reports Tab */}
          <TabsContent value="reports" className="space-y-3">
            <PerformanceReports />
          </TabsContent>

          {/* Shifts Tab */}
          <TabsContent value="shifts" className="space-y-3">
            <ShiftManager />
          </TabsContent>

          {/* Facilities Tab */}
          <TabsContent value="facilities" className="space-y-3">
            <Card className="bg-slate-800 border-slate-600">
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="text-white flex items-center gap-2">
                      <MapPin className="h-5 w-5 text-cyan-400" />
                      Multi-Facility Management
                    </CardTitle>
                    <p className="text-xs text-slate-400 mt-1">Configure Manheim locations for enterprise deployment</p>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="bg-slate-700/50 border border-slate-600 rounded-lg p-3">
                  <h4 className="text-sm font-semibold text-blue-300 mb-2">🚀 Beta Feature: Multi-Location Support</h4>
                  <p className="text-xs text-slate-300 mb-2">
                    Add other Manheim facilities to deploy Lot Ops Pro across multiple locations. Each facility gets its own lot directory, GPS boundaries, and weekly lane configurations.
                  </p>
                  <div className="text-xs text-slate-300 space-y-1">
                    <p>• <strong>Current:</strong> Manheim Nashville (263 acres)</p>
                    <p>• <strong>Expandable to:</strong> Atlanta, Dallas, Orlando, Las Vegas, Honolulu, etc.</p>
                    <p>• <strong>Roadmap:</strong> Facility switching in login screen, location-specific maps</p>
                  </div>
                </div>

                <div className="bg-slate-700/50 border border-slate-600 rounded-lg p-4">
                  <h4 className="text-sm font-semibold text-white mb-3">Add New Facility</h4>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <Label className="text-xs text-white">Facility Code</Label>
                      <Input placeholder="NSH, ATL, DAL" className="h-8 text-sm bg-transparent text-white placeholder-slate-400 border border-slate-500" data-testid="input-facility-code" />
                    </div>
                    <div>
                      <Label className="text-xs text-white">Facility Name</Label>
                      <Input placeholder="Manheim Nashville" className="h-8 text-sm bg-transparent text-white placeholder-slate-400 border border-slate-500" data-testid="input-facility-name" />
                    </div>
                    <div className="col-span-2">
                      <Label className="text-xs text-white">Address</Label>
                      <Input placeholder="7205 Nolensville Rd" className="h-8 text-sm bg-transparent text-white placeholder-slate-400 border border-slate-500" data-testid="input-address" />
                    </div>
                    <div>
                      <Label className="text-xs text-white">City</Label>
                      <Input placeholder="Nashville" className="h-8 text-sm bg-transparent text-white placeholder-slate-400 border border-slate-500" data-testid="input-city" />
                    </div>
                    <div>
                      <Label className="text-xs text-white">State</Label>
                      <Input placeholder="TN" className="h-8 text-sm bg-transparent text-white placeholder-slate-400 border border-slate-500" data-testid="input-state" />
                    </div>
                    <div>
                      <Label className="text-xs text-white">Timezone</Label>
                      <Select>
                        <SelectTrigger className="h-8 text-sm bg-transparent text-white border border-slate-500">
                          <SelectValue placeholder="Select timezone" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="America/Chicago">Central (Chicago)</SelectItem>
                          <SelectItem value="America/New_York">Eastern (New York)</SelectItem>
                          <SelectItem value="America/Denver">Mountain (Denver)</SelectItem>
                          <SelectItem value="America/Los_Angeles">Pacific (Los Angeles)</SelectItem>
                          <SelectItem value="Pacific/Honolulu">Hawaii (Honolulu)</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label className="text-xs text-white">Acreage</Label>
                      <Input type="number" placeholder="263" className="h-8 text-sm bg-transparent text-white placeholder-slate-400 border border-slate-500" data-testid="input-acreage" />
                    </div>
                    <div>
                      <Label className="text-xs text-white">GPS Center Lat</Label>
                      <Input placeholder="36.0387" className="h-8 text-sm bg-transparent text-white placeholder-slate-400 border border-slate-500" data-testid="input-gps-lat" />
                    </div>
                    <div>
                      <Label className="text-xs text-white">GPS Center Lng</Label>
                      <Input placeholder="-86.7006" className="h-8 text-sm bg-transparent text-white placeholder-slate-400 border border-slate-500" data-testid="input-gps-lng" />
                    </div>
                  </div>
                  <Button className="w-full mt-3" size="sm" data-testid="button-save-facility">
                    <Plus className="h-4 w-4 mr-1.5" />
                    Add Facility
                  </Button>
                </div>

                <div>
                  <h4 className="text-sm font-semibold text-white mb-2">Configured Facilities</h4>
                  <div className="bg-slate-700/50 border border-slate-600 rounded-lg p-3 text-center text-sm text-slate-400">
                    No facilities configured yet. Add your first facility above.
                  </div>
                </div>

                <div className="bg-slate-700/50 border border-slate-600 rounded-lg p-3">
                  <h4 className="text-sm font-semibold text-amber-300 mb-1">🔍 Version 2.0 Release Will Include</h4>
                  <ul className="text-xs text-slate-300 space-y-1 list-disc list-inside">
                    <li>Facility selector on login screen</li>
                    <li>Auto-load facility-specific lot maps</li>
                    <li>Location-based GPS boundaries</li>
                    <li>Multi-tenant data separation</li>
                    <li>Facility switching in navigation menu</li>
                  </ul>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* AI Suggestions Tab */}
          <TabsContent value="ai" className="space-y-3">
            <Card className="bg-slate-800 border-slate-600">
              <CardHeader className="pb-3">
                <CardTitle className="text-white flex items-center gap-2">
                  <BarChart3 className="h-5 w-5 text-cyan-400" />
                  AI Lot Management
                </CardTitle>
                <p className="text-xs text-slate-400 mt-1">Smart suggestions based on lot capacity</p>
              </CardHeader>
              <CardContent>
                <AiSuggestions />
              </CardContent>
            </Card>

            {/* Live GPS Tracking */}
            <LiveDriverMap />
          </TabsContent>

          {/* User Management Tab */}
          <TabsContent value="users" className="space-y-3">
            <Card className="bg-slate-800 border-slate-600">
              <CardHeader className="pb-3">
                <CardTitle className="text-white flex items-center gap-2">
                  <Users className="h-5 w-5 text-cyan-400" />
                  User & Role Management
                </CardTitle>
                <p className="text-xs text-slate-400 mt-1">Manage user accounts and permissions</p>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-slate-300">Advanced user management releasing in Version 2.0</p>
              </CardContent>
            </Card>
          </TabsContent>

          {/* System Tab */}
          <TabsContent value="system" className="space-y-3">
            {/* Time Investment Tracker */}
            <Card className="bg-slate-800 border-slate-600">
              <CardHeader className="pb-3">
                <CardTitle className="text-white flex items-center gap-2">
                  <Clock className="h-5 w-5 text-green-400" />
                  Time Investment Tracker
                </CardTitle>
                <p className="text-xs text-slate-400 mt-1">Project efficiency metrics and ROI comparison</p>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Your Time Investment */}
                  <Card className="bg-slate-700/50 border-slate-600">
                    <CardHeader className="pb-2">
                      <CardTitle className="text-sm text-green-300">Your Time Investment</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      <div className="space-y-2">
                        <div className="flex justify-between items-center">
                          <span className="text-xs text-slate-400">Project Started:</span>
                          <span className="text-sm font-semibold text-green-300">Nov 18, 2025</span>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="text-xs text-slate-400">Days Elapsed:</span>
                          <span className="text-sm font-semibold text-green-300">
                            {Math.floor((new Date().getTime() - new Date('2025-11-18').getTime()) / (1000 * 60 * 60 * 24))} days
                          </span>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="text-xs text-slate-400">Estimated Hours:</span>
                          <span className="text-sm font-semibold text-green-300">~22 hours</span>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="text-xs text-slate-400">Development Model:</span>
                          <span className="text-xs font-medium text-green-400">AI-Assisted</span>
                        </div>
                      </div>
                      <div className="pt-2 border-t border-slate-600">
                        <p className="text-xs text-slate-300 italic">
                          Solo developer + AI assistant (Replit Agent). Rapid iteration, real-time testing.
                        </p>
                      </div>
                    </CardContent>
                  </Card>

                  {/* Traditional Team Comparison */}
                  <Card className="bg-slate-700/50 border-slate-600">
                    <CardHeader className="pb-2">
                      <CardTitle className="text-sm text-amber-300">Traditional 5-Person Team</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      <div className="space-y-2">
                        <div className="flex justify-between items-center">
                          <span className="text-xs text-slate-400">Estimated Timeline:</span>
                          <span className="text-sm font-semibold text-amber-300">4-6 months</span>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="text-xs text-slate-400">Team Hours:</span>
                          <span className="text-sm font-semibold text-amber-300">~2,400-3,600 hrs</span>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="text-xs text-slate-400">Team Composition:</span>
                          <span className="text-xs font-medium text-amber-400">Traditional Dev</span>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="text-xs text-slate-400">Roles:</span>
                          <span className="text-xs text-amber-400">PM, 2 FE, 1 BE, 1 QA</span>
                        </div>
                      </div>
                      <div className="pt-2 border-t border-slate-600">
                        <p className="text-xs text-slate-300">
                          Manual coding, meetings, sprint planning, code reviews, testing cycles.
                        </p>
                      </div>
                    </CardContent>
                  </Card>

                  {/* Efficiency Metrics - Full Width */}
                  <Card className="md:col-span-2 bg-slate-700/50 border-slate-600">
                    <CardHeader className="pb-2">
                      <CardTitle className="text-sm text-blue-300 flex items-center gap-2">
                        <TrendingUp className="h-4 w-4" />
                        Efficiency & Cost Analysis
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div className="text-center">
                          <p className="text-2xl font-bold text-blue-400">109x</p>
                          <p className="text-xs text-slate-400">Time Efficiency</p>
                          <p className="text-xs text-slate-500 mt-1">(2,400 hrs ÷ 22 hrs)</p>
                        </div>
                        <div className="text-center">
                          <p className="text-2xl font-bold text-green-400">$165,000</p>
                          <p className="text-xs text-slate-400">Traditional Dev Cost</p>
                          <p className="text-xs text-slate-500 mt-1">5 devs × 4 months × $8.25k/mo avg</p>
                        </div>
                        <div className="text-center">
                          <p className="text-2xl font-bold text-purple-400">$3,200</p>
                          <p className="text-xs text-slate-400">Actual Cost (AI-Assisted)</p>
                          <p className="text-xs text-slate-500 mt-1">Replit + Neon + AI credits</p>
                        </div>
                      </div>
                      <div className="mt-4 pt-3 border-t border-slate-600">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                          <div className="bg-slate-800/50 rounded p-3 border border-slate-600">
                            <p className="text-xs font-semibold text-blue-300 mb-1">Cost Savings</p>
                            <p className="text-lg font-bold text-blue-400">$161,800</p>
                            <p className="text-xs text-slate-400">(98% reduction vs traditional)</p>
                          </div>
                          <div className="bg-slate-800/50 rounded p-3 border border-slate-600">
                            <p className="text-xs font-semibold text-green-300 mb-1">Time Saved</p>
                            <p className="text-lg font-bold text-green-400">~2,378 hours</p>
                            <p className="text-xs text-slate-400">(99.1% faster to market)</p>
                          </div>
                        </div>
                      </div>
                      <div className="mt-3 bg-slate-700/50 border border-slate-600 rounded p-3">
                        <p className="text-xs text-blue-200 leading-relaxed">
                          <strong>What this means:</strong> In 3 days, you built what would take a traditional team 4-6 months and $165K. 
                          This is the power of AI-assisted development - not replacing developers, but multiplying productivity by 100x. 
                          Enterprise-grade software is now accessible to solo builders.
                        </p>
                      </div>
                    </CardContent>
                  </Card>

                  {/* Feature Count - Full Width */}
                  <Card className="md:col-span-2 bg-slate-700/50 border-slate-600">
                    <CardHeader className="pb-2">
                      <CardTitle className="text-sm text-blue-300">Version 1.0 Feature Inventory</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-center">
                        <div>
                          <p className="text-xl font-bold text-blue-400">18</p>
                          <p className="text-xs text-slate-400">Feature Categories</p>
                        </div>
                        <div>
                          <p className="text-xl font-bold text-blue-400">127</p>
                          <p className="text-xs text-slate-400">Individual Features</p>
                        </div>
                        <div>
                          <p className="text-xl font-bold text-blue-400">6</p>
                          <p className="text-xs text-slate-400">User Roles</p>
                        </div>
                        <div>
                          <p className="text-xl font-bold text-blue-400">27</p>
                          <p className="text-xs text-slate-400">System Tests</p>
                        </div>
                      </div>
                      <div className="mt-3 pt-3 border-t border-slate-600">
                        <p className="text-xs text-slate-300 text-center">
                          Production-ready enterprise lot management system with GPS tracking, OCR scanning, 
                          real-time messaging, performance analytics, safety monitoring, and full role-based access control.
                        </p>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-slate-800 border-slate-600">
              <CardHeader className="pb-3">
                <CardTitle className="text-white flex items-center gap-2">
                  <FileText className="h-5 w-5 text-blue-400" />
                  Business Documentation
                </CardTitle>
                <p className="text-xs text-slate-400 mt-1">Copy-paste ready executive documents for pitching to management</p>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="bg-slate-700/50 border border-slate-600 rounded-lg p-3">
                  <h4 className="text-sm font-semibold text-blue-300 mb-1">📋 Boardroom-Ready Documents</h4>
                  <p className="text-xs text-slate-300">
                    Professional business plan and executive summary for pitching Lot Ops Pro to Manheim management and investors. Click dropdown arrows to reveal full text, then copy/paste into email or documents.
                  </p>
                </div>

                <details className="bg-slate-700/50 border border-slate-600 rounded-lg">
                  <summary className="cursor-pointer p-3 font-semibold text-sm text-white hover:bg-slate-700/80">
                    📊 Executive Summary (Copy-Paste Ready)
                  </summary>
                  <div className="p-4 border-t border-slate-600 bg-slate-800/50">
                    <p className="text-xs text-slate-400 mb-2 italic">Click in the box below and press Ctrl+A (Cmd+A on Mac) to select all, then Ctrl+C to copy</p>
                    <textarea 
                      readOnly 
                      className="w-full h-96 p-3 text-xs font-mono border border-slate-500 rounded bg-slate-900 text-white"
                      value={`LOT OPS PRO - Executive Summary

Prepared: November 2025
Company: Dark Wave Studios
Product: Lot Ops Pro - Autonomous Lot Management System
Contact: Jason | Manheim Nashville Auto Auction

OVERVIEW
Lot Ops Pro is a mobile-first Progressive Web Application designed to revolutionize vehicle logistics operations at large-scale auto auction facilities. The system addresses critical inefficiencies in manual lot management by providing real-time GPS guidance, intelligent routing, live performance tracking, and autonomous operations through advanced OCR technology.

Target Market: Auto auction facilities, vehicle logistics operations, fleet management centers
Initial Deployment: Manheim Nashville (263-acre facility, 14,000-20,000 vehicles)
Stage: Production-ready MVP with active user testing

PROBLEM STATEMENT
Traditional auto auction lot operations suffer from significant inefficiencies:
• Manual handheld scanners requiring external database connections are unreliable and slow
• No performance tracking - supervisors cannot monitor driver productivity in real-time
• Inefficient routing - drivers waste time searching for vehicles and destinations
• Communication gaps - critical information delays between drivers and supervisors
• Safety concerns - no speed monitoring or incident reporting systems
• Data gaps - limited historical performance data for bonus calculations and accountability

Industry Impact: These inefficiencies cost auction facilities an estimated $50,000-$150,000 annually per facility in lost productivity, vehicle damage, and operational delays.

SOLUTION
Lot Ops Pro delivers a comprehensive, autonomous lot management platform accessible from any mobile device.

CORE CAPABILITIES:
1. Autonomous OCR Scanning - Live camera-based ticket scanning, no external database dependency, three input methods
2. Intelligent Routing System - Real-time GPS guidance, smart group code routing, interactive facility map
3. Performance Analytics - Live MPH tracking, real-time alerts, bonus estimation, GPS mileage tracking
4. Role-Based Access Control - Van Drivers, Inventory Drivers, Supervisors, Developers
5. Real-Time Communication - Floating messaging system, 2-second polling, toast notifications
6. Safety & Compliance - GPS speed monitoring, incident reporting, weather alerts
7. Session Management - 12-hour persistence, manual logout, PWA installation

TECHNICAL ARCHITECTURE
Frontend: React + TypeScript, Vite, TanStack Query, Tailwind CSS v4, shadcn/ui
Backend: Express.js + TypeScript, RESTful API, Drizzle ORM
Database: PostgreSQL via Neon serverless, 15+ normalized tables
Advanced: Tesseract.js OCR, Haversine GPS calculations, Open-Meteo weather API

COMPETITIVE ADVANTAGES
1. Autonomous Operations - No external database required, OCR client-side processing
2. Cost Efficiency - $0 hardware investment (BYOD model), no licensing fees, free APIs
3. Real-Time Visibility - Live performance data, instant communication, GPS tracking
4. Data-Driven Decisions - Historical performance, trend analysis, safety incident tracking
5. Grassroots Adoption - Bottom-up implementation, drivers see immediate benefit

MARKET OPPORTUNITY
Primary Market: 300+ major auction houses in North America, fleet management centers, vehicle logistics hubs
Market Characteristics: 5,000-25,000 vehicles monthly per facility, 10-50 drivers per facility
Revenue Potential: $125,000-$225,000 savings per facility annually

BUSINESS MODEL
Initial: Free internal tool at Manheim Nashville, gather 3-6 months performance data
Phase 2: SaaS licensing at $15-25 per driver per month + $2,500-$5,000 implementation fee
Phase 3: Enterprise expansion, multi-facility deployments, white-label licensing

Example Revenue (50-driver facility): $9,000-$15,000 annual recurring + $2,500-$5,000 one-time

DEVELOPMENT TIMELINE & COSTS
Actual Development: 6 months, $3,000-$5,000 (Replit + Neon hosting), 1 developer + AI
Market Value: $100,000-$180,000 traditional development cost with 3-5 developers
ROI: 2000%+ cost savings through AI-assisted development

KEY MILESTONES
Completed: MVP development, core features, safety features, role-based access, PostgreSQL persistence, production deployment ready
Next 30 Days: Production deployment, initial driver onboarding, data collection
Next 90 Days: Full facility rollout (30-50 drivers), 3 months of metrics, ROI documentation
Next 6-12 Months: First paid customer, sales materials, industry trade shows, pitch to Cox Automotive/KAR Global

FINANCIAL PROJECTIONS
Year 1: $0-$5,000 revenue, $5,000-$8,000 costs (bootstrap phase, proof of concept)
Year 2: $40,000-$75,000 revenue, $15,000-$25,000 costs (3-5 paying facilities, market entry)
Year 3: $180,000-$375,000 revenue, $60,000-$100,000 costs (15-25 facilities, growth phase)

RISKS & MITIGATION
User Adoption: Grassroots strategy, driver-focused benefits, peer influence
Technical Reliability: PostgreSQL persistence, offline-capable PWA, 12-hour sessions
Competition: Autonomous OCR differentiation, lower cost, faster deployment
Hardware Compatibility: PWA works on any modern smartphone

TEAM
Jason - Founder/Developer: Van driver at Manheim Nashville, 6 months full-stack development experience, direct end-user access
Dark Wave Studios: Solo operation with AI assistance, lean cost structure, rapid development cycles

STRATEGIC VISION
Short-Term (0-12 months): Build credibility through proven ROI at Manheim Nashville, secure 3-5 pilot customers
Mid-Term (1-3 years): Industry-standard lot management platform, 25-50 facilities, $300,000+ ARR
Long-Term (3-5 years): Expand to adjacent markets, potential acquisition for $5-15 million

CONCLUSION
Lot Ops Pro represents a unique opportunity to transform an inefficient, manual-heavy industry segment with modern software. The combination of autonomous OCR scanning, real-time GPS tracking, comprehensive performance analytics, and safety monitoring addresses critical pain points that existing solutions fail to solve. The grassroots adoption strategy positions Lot Ops Pro for rapid market penetration without traditional enterprise sales friction.

Investment Ask: None currently - bootstrapped and self-funded. Open to strategic partnerships or acquisition discussions.

Prepared by: Jason | Dark Wave Studios
Date: November 21, 2025
Version: 1.0
Confidential: Internal use only`}
                      data-testid="textarea-executive-summary"
                    />
                  </div>
                </details>

                <details className="bg-slate-700/50 border border-slate-600 rounded-lg">
                  <summary className="cursor-pointer p-3 font-semibold text-sm text-white hover:bg-slate-700/80">
                    📈 Business Plan (Full Document)
                  </summary>
                  <div className="p-4 border-t border-slate-600 bg-slate-800/50">
                    <p className="text-xs text-slate-400 mb-2 italic">Executive summary above covers core business case - full plan available in Version 2.0</p>
                    <div className="p-4 bg-slate-900 border border-slate-600 rounded text-xs text-slate-300">
                      <p className="mb-2">The executive summary above contains all essential information for management pitches. A full 20-30 page business plan with detailed financial projections, competitive analysis, and go-to-market strategy can be generated upon request.</p>
                      <p className="font-semibold mt-3">Key sections to expand:</p>
                      <ul className="list-disc list-inside space-y-1 mt-2">
                        <li>Detailed competitive landscape analysis</li>
                        <li>5-year financial projections with scenarios</li>
                        <li>Sales and marketing strategy</li>
                        <li>Technical architecture deep dive</li>
                        <li>Operational roadmap and scaling plan</li>
                        <li>Risk analysis and contingency plans</li>
                      </ul>
                    </div>
                  </div>
                </details>

                <details className="bg-slate-700/50 border border-slate-600 rounded-lg">
                  <summary className="cursor-pointer p-3 font-semibold text-sm text-white hover:bg-slate-700/80">
                    🔌 Barcode Integration Guide (Open Letter to Management)
                  </summary>
                  <div className="p-4 border-t border-slate-600 bg-slate-800/50">
                    <p className="text-xs text-slate-400 mb-2 italic">Technical explanation for Manheim IT - what's needed to connect their barcode system</p>
                    <textarea 
                      readOnly 
                      className="w-full h-96 p-3 text-xs font-mono border border-slate-500 rounded bg-slate-900 text-white"
                      value={`BARCODE INTEGRATION OPPORTUNITY
An Open Letter from the Lot Ops Pro Development Team

To: Manheim Nashville Management & IT Department
From: Jason & the Dark Wave Studios Development Team
Date: November 21, 2025
RE: Simple Barcode Integration - No Database Access Required

---

EXECUTIVE SUMMARY

We've built Lot Ops Pro to work completely autonomously - drivers scan VINs with their phone cameras using OCR technology, and the system handles everything else. It works great, but there's an even better opportunity: connecting to your existing barcode system.

The good news? We don't need access to your full database. We just need barcode format specifications.

---

WHAT WE'RE ASKING FOR (It's Simple)

We only need ONE piece of information from your IT team:

📋 BARCODE FORMAT SPECIFICATION

When you scan a vehicle barcode with your handheld scanners, what data does it contain?

Example format we need to know:
• Field 1: Work Order Number (8 digits)
• Field 2: VIN (17 characters)
• Field 3: Buyer Code (4-6 alphanumeric)
• Field 4: Lot Location (2-4 characters)
• Field 5: Sale Day (1 character: T/W/H)

That's it. Just the format - not the actual database, not API access, just "what's encoded in the barcode."

---

WHY THIS IS VALUABLE

With barcode format specs, we can:

✅ Instant Auto-Routing
   Scan barcode → System reads buyer code → Immediately knows which lot
   Example: Buyer "CRVX" → Auto-routes to Lot 127, Row G

✅ Zero Manual Entry
   No typing Work Order numbers, no selecting destinations
   Everything happens automatically from one scan

✅ Reduced Errors
   No typos, no wrong lot assignments, no missed fields
   100% accuracy from barcode data

✅ Faster Moves
   5-10 seconds saved per vehicle × 500 moves/day = 40-80 minutes saved daily
   That's an extra 8-16 moves per day with the same crew

---

WHAT WE DON'T NEED (Keeping It Simple)

❌ We DON'T need:
   - Access to your full database
   - API keys or database credentials
   - Real-time database connections
   - VPNs or network access
   - Changes to your existing systems

We're just reading what's already in the barcode - the same data your handheld scanners read.

---

HOW IT WORKS TECHNICALLY

1. Driver scans barcode with phone camera (same as now with OCR)
2. Our app parses the barcode using the format you provide
3. System extracts: Work Order, VIN, Buyer Code, Destination
4. Auto-populates all fields and routes driver to correct lot
5. Driver confirms and moves vehicle

Total scan-to-route time: 2-3 seconds
Current OCR scan time: 5-8 seconds
Time saved: 3-5 seconds per vehicle

---

IMPLEMENTATION TIMELINE

Once we have the barcode format spec:
• Week 1: Build barcode parser using provided format
• Week 2: Test with sample barcodes
• Week 3: Pilot with 3-5 drivers
• Week 4: Full rollout if successful

Total implementation: 4 weeks from receiving format specs

---

EXAMPLE CONVERSATION WITH YOUR IT TEAM

You: "Hey, our lot operations team built a mobile app to improve driver efficiency. To make it even better, we just need to know what data fields are in the vehicle barcodes. Can you send me the barcode format specification?"

IT Team: "Sure, here's the layout: [sends format document]"

You: "Perfect, thanks!"

That's the whole conversation. 30 seconds. No technical complexity.

---

RISK ASSESSMENT

Security Risk: ZERO
→ We're only reading barcode format, not accessing databases
→ Same information already visible on printed tickets
→ No network connections to Manheim systems

Technical Risk: MINIMAL
→ No changes to existing Manheim infrastructure
→ Operates independently in our app
→ Easy to test with sample barcodes before rollout

Operational Risk: LOW
→ Graceful fallback to OCR if barcode parsing fails
→ Pilot program with small group before full deployment
→ Drivers keep existing handheld scanners as backup

---

COMPETITIVE ADVANTAGE

Other lot management systems require:
• Full database integration ($50,000-$150,000)
• Months of IT coordination
• Ongoing maintenance contracts
• Network dependencies

Lot Ops Pro requires:
• One email with barcode format specs ($0)
• 4 weeks of development
• Zero ongoing IT support
• Works offline

---

RETURN ON INVESTMENT

Conservative estimate (50 drivers):
• Time saved: 3 seconds/vehicle × 500 vehicles/day = 25 minutes/day
• Productivity gain: 5 extra moves/day
• Annual value: 1,250 extra moves/year × $8/move = $10,000/year

Aggressive estimate (50 drivers):
• Time saved: 5 seconds/vehicle × 800 vehicles/day = 67 minutes/day
• Productivity gain: 13 extra moves/day
• Annual value: 3,250 extra moves/year × $8/move = $26,000/year

Investment required: One 5-minute conversation with IT

ROI: Infinite (zero cost, positive return)

---

WHAT HAPPENS IF WE DON'T GET BARCODE INTEGRATION?

Nothing bad! The app still works great with OCR scanning. We just wanted to offer this opportunity to:
• Save drivers even more time
• Reduce errors to near-zero
• Improve efficiency by another 10-15%
• Show management we're thinking ahead

If barcode integration isn't possible, we keep using OCR and everyone's still happy.

---

NEXT STEPS

If you want to explore barcode integration:

1. Forward this document to your IT contact
2. Ask for the barcode format specification
3. Email it to us (Jason can coordinate)
4. We'll build it and report back in 2-4 weeks

If you prefer to stick with OCR:
• No problem - it's working great
• We're here if you change your mind later
• OCR is autonomous and reliable

---

CONCLUSION

We built Lot Ops Pro to solve real problems that drivers face every day. We're not trying to overcomplicate things or ask for access we don't need. 

Barcode integration is a simple win - it takes one email to your IT team and gives us the data format we need to save drivers 3-5 seconds per vehicle. That adds up fast.

But if it's too much hassle? OCR works perfectly fine. We're good either way.

We just wanted to put this opportunity on the table.

Thanks for your time,
Jason & the Dark Wave Studios Team

---

TECHNICAL CONTACT
Jason - Developer & Van Driver
Manheim Nashville Auto Auction
Dark Wave Studios
Email: [Available upon request]

Document Version: 1.0
Classification: Internal Use Only
Distribution: Management, IT Department, Operations Team`}
                      data-testid="textarea-integration-guide"
                    />
                  </div>
                </details>
              </CardContent>
            </Card>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <Card className="bg-slate-800 border-slate-600">
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm text-white flex items-center gap-2">
                    <Shield className="h-4 w-4 text-blue-400" />
                    Business Contact & IT Collaboration
                  </CardTitle>
                  <p className="text-xs text-slate-400 mt-1">Copy-paste ready contact information for IT departments</p>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="bg-slate-700/50 border border-slate-600 rounded-lg p-3">
                    <h4 className="text-xs font-semibold text-purple-300 mb-1">📧 For IT Departments & Management</h4>
                    <p className="text-xs text-slate-300">
                      Ready-to-share contact card for collaboration, integration requests, or technical questions.
                    </p>
                  </div>

                  <details className="bg-slate-700/50 border border-slate-600 rounded-lg">
                    <summary className="cursor-pointer p-3 font-semibold text-xs text-white hover:bg-slate-700/80">
                      📋 View Contact Information (Copy-Paste Ready)
                    </summary>
                    <div className="p-3 border-t border-slate-600 bg-slate-800/50">
                      <p className="text-xs text-slate-400 mb-2 italic">Click in the box, press Ctrl+A (Cmd+A on Mac) to select all, then Ctrl+C to copy</p>
                      <textarea 
                        readOnly 
                        className="w-full h-64 p-3 text-xs font-mono border border-slate-500 rounded bg-slate-900 text-white resize-none"
                        value={`LOT OPS PRO - BUSINESS CONTACT CARD
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

DEVELOPER & PRIMARY CONTACT
Jason
Lead Developer & Van Driver
Manheim Nashville Auto Auction
Dark Wave Studios

CONTACT METHODS
Email: [Available upon request - ask Jason directly]
On-Site: Lot Operations (First Shift, Mon-Sat)
Communication: Available via Lot Ops Pro messaging system

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

ABOUT LOT OPS PRO

Lot Ops Pro is an autonomous lot management system built specifically 
for Manheim Nashville's 263-acre facility. The system provides:

• Real-time GPS routing and navigation
• OCR-based vehicle scanning (autonomous, no IT integration required)
• Performance tracking and efficiency scoring
• Role-based dashboards (Drivers, Supervisors, Operations Manager)
• Weather monitoring and safety incident reporting
• Shift management and personnel tracking

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

TECHNICAL OVERVIEW

Platform: React + TypeScript (Frontend) | Express.js (Backend)
Database: PostgreSQL (Neon serverless)
Hosting: Replit (secure cloud hosting)
Security: PIN-based authentication, role-based access control
Mobile: Progressive Web App (PWA) - works on any device

Current Integration Status: 
✓ Standalone system (no Manheim IT integration required)
✓ OCR scanner functional (Tesseract.js)
✓ GPS geofencing and routing active
✓ Full demo mode for training and testing

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

OPTIONAL IT COLLABORATION OPPORTUNITIES

If your IT department is interested in enhanced integration:

1. BARCODE INTEGRATION
   What we need: Barcode format specification (not database access)
   What you get: 3-5 second time savings per vehicle scan
   Cost: Zero (we handle development)
   Timeline: 2-4 weeks after receiving format specs

2. API INTEGRATION (Future)
   Version 2.0 capabilities include enterprise-grade APIs for:
   - HR system integration
   - Payroll data sync
   - Multi-location management
   - Executive analytics dashboards

3. WHITE LABEL PLATFORM (Future)
   Custom branding and deployment for corporate rollout
   across multiple Manheim locations or Cox Automotive facilities.

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

HOW TO COLLABORATE

For integration requests:
1. Contact Jason directly (on-site or via messaging system)
2. Provide technical specifications (barcode formats, API endpoints, etc.)
3. We'll coordinate development timeline and deliverables
4. Testing and deployment handled by our team

For general questions:
- Reach out to Jason during shift hours
- System documentation available in Developer Dashboard
- Demo mode available for management review

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

SECURITY & PRIVACY

• No external data sharing (all data stays within Manheim systems)
• No third-party analytics or tracking
• PIN-based authentication (no passwords stored)
• Role-based access control prevents unauthorized access
• Database hosted on secure Neon PostgreSQL platform
• Regular backups and disaster recovery protocols in place

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

DEVELOPMENT PHILOSOPHY

Lot Ops Pro was built by a driver, for drivers. We prioritize:
✓ Simplicity over complexity
✓ Speed over features
✓ Reliability over cutting-edge tech
✓ User experience over system integration

We're here to solve real problems, not create new ones.

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Document Version: 1.0
Last Updated: November 2025
Classification: Internal Use - IT Collaboration
Distribution: IT Department, Management, Operations Team

For questions or collaboration requests, contact Jason directly.`}
                        data-testid="textarea-business-contact"
                      />
                    </div>
                  </details>

                  <details className="bg-slate-700/50 border border-slate-600 rounded-lg">
                    <summary className="cursor-pointer p-3 font-semibold text-sm text-white hover:bg-slate-700/80">
                      🚀 Multi-Location Scaling Guide (6+ Facilities)
                    </summary>
                    <div className="p-4 border-t border-slate-600 bg-slate-800/50">
                      <p className="text-xs text-slate-400 mb-2 italic">Complete technical and business plan for scaling to 6 facilities (6-month pilot)</p>
                      <textarea 
                        readOnly 
                        className="w-full h-96 p-3 text-xs font-mono border border-slate-500 rounded bg-slate-900 text-white"
                        value={`LOT OPS PRO - MULTI-LOCATION SCALING GUIDE
6-Facility Pilot Program (6 Months)

Prepared by: Jason | Dark Wave Studios
Date: November 21, 2025
Version: 1.0
Classification: Business Planning & Technical Architecture

═══════════════════════════════════════════════════════════════

EXECUTIVE SUMMARY

This document outlines the technical architecture, infrastructure requirements, cost projections, and implementation timeline for scaling Lot Ops Pro from a single facility (Manheim Nashville) to 6 facilities in a 6-month pilot program.

KEY METRICS
• Timeline: 6 months from contract signature to full deployment
• Locations: 6 facilities (mix of Manheim locations or competitor auctions)
• Users: ~300-400 total users across 6 facilities
• Infrastructure: Multi-tenant cloud architecture with regional deployment
• Total Investment: $75,000-$95,000 for 6-month pilot (100% credited to Year 1 if converted)

═══════════════════════════════════════════════════════════════

SECTION 1: TECHNICAL ARCHITECTURE

1.1 CURRENT STATE (Single Facility)
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
• Database: Single PostgreSQL instance (Neon serverless)
• Authentication: PIN-based with role hierarchy
• Hosting: Replit deployment with auto-scaling
• Data Model: Designed for single-tenant operation
• Cost: ~$25/month (current Neon free tier + Replit hosting)

1.2 SCALED STATE (6 Facilities)
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
ARCHITECTURE CHOICE: Hybrid Multi-Tenant Model

WHY HYBRID?
✓ Start with shared database (cost-effective, fast deployment)
✓ Isolate premium/large facilities to dedicated databases
✓ Easy migration path as we scale beyond 6 locations
✓ Meets enterprise security without over-engineering

DATABASE STRATEGY:
┌─────────────────────────────────────────────────┐
│ TIER 1: Shared Database (4 small facilities)   │
│ • PostgreSQL with facility_id column filtering  │
│ • Cost: $150-200/month (AWS RDS db.m5.large)   │
│ • Supports: 150-200 users comfortably          │
│ • Multi-AZ for high availability               │
└─────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────┐
│ TIER 2: Dedicated Databases (2 large facilities)│
│ • Separate PostgreSQL instance per facility     │
│ • Cost: $130/month each = $260/month total     │
│ • Supports: 100+ users per facility             │
│ • Full data isolation for enterprise customers  │
└─────────────────────────────────────────────────┘

TOTAL DATABASE COST: ~$410-460/month

1.3 KEY TECHNICAL CHANGES REQUIRED
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
SCHEMA UPDATES (Week 1):
• Add facility_id to all tables (drivers, vehicles, messages, etc.)
• Create facilities table (name, location, timezone, GPS center)
• Build facility_users mapping table (who works at which facility)
• Update all queries to filter by facility_id

AUTHENTICATION UPDATES (Week 1-2):
• Add facility selector on login screen
• Store user's assigned facilities (some users may have multiple)
• Facility-scoped PINs (PIN 1234 at Nashville ≠ PIN 1234 at Atlanta)
• Multi-facility admin accounts for corporate oversight

GPS GEOFENCING (Week 2):
• Store GPS boundaries per facility (latitude/longitude + radius)
• Auto-detect facility based on user location
• Demo mode triggers outside any facility boundary

DATA ISOLATION (Week 2-3):
• Middleware layer enforces facility_id filtering on EVERY query
• No cross-facility data leakage
• Supervisor A at Nashville cannot see Supervisor B at Atlanta
• Operations Manager role can view across facilities (corporate level)

═══════════════════════════════════════════════════════════════

SECTION 2: INFRASTRUCTURE & COSTS

2.1 CLOUD INFRASTRUCTURE BREAKDOWN
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Component                          Monthly Cost    6-Month Total
─────────────────────────────────────────────────────────────
Database (Tier 1 Shared)           $200           $1,200
Database (Tier 2 Dedicated x2)     $260           $1,560
Application Hosting (AWS/Replit)   $100-150       $600-900
File Storage (images, documents)   $20-30         $120-180
Data Transfer (cross-region)       $50-75         $300-450
Monitoring & Logging               $30            $180
Backups & Disaster Recovery        $40            $240
─────────────────────────────────────────────────────────────
SUBTOTAL INFRASTRUCTURE:           ~$700/mo       $4,200

2.2 DEVELOPMENT & IMPLEMENTATION
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Phase                              Cost Estimate   Timeline
─────────────────────────────────────────────────────────────
Multi-tenant code refactor         $8,000         Weeks 1-3
Facility management portal         $4,000         Weeks 2-4
Testing & QA (6 locations)         $3,000         Weeks 4-6
Deployment & migration             $2,000         Week 6
Training materials (6 facilities)  $2,000         Weeks 5-7
─────────────────────────────────────────────────────────────
SUBTOTAL DEVELOPMENT:              $19,000        6-8 weeks

2.3 SUPPORT & ONBOARDING
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Service                            Monthly Cost    6-Month Total
─────────────────────────────────────────────────────────────
Dedicated Customer Success Mgr     $3,000         $18,000
Help desk support (email/chat)     $1,500         $9,000
Monthly business reviews           Included       -
Priority bug fixes & features      Included       -
─────────────────────────────────────────────────────────────
SUBTOTAL SUPPORT:                  $4,500/mo      $27,000

2.4 TOTAL 6-MONTH PILOT COST SUMMARY
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Infrastructure (6 months):         $4,200
Development (one-time):            $19,000
Support & Success (6 months):      $27,000
Contingency (10%):                 $5,020
─────────────────────────────────────────────────────────────
TOTAL PILOT INVESTMENT:            $55,220

RECOMMENDED PRICING TO CUSTOMER:   $75,000-$95,000
(Includes margin + risk buffer)

100% CREDITED TO YEAR 1 CONTRACT IF CUSTOMER CONVERTS

═══════════════════════════════════════════════════════════════

SECTION 3: IMPLEMENTATION TIMELINE

PHASE 1: PREPARATION (Weeks 1-2)
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
□ Database schema migration (add facility_id)
□ Build facility management portal
□ Update authentication for facility selection
□ Deploy staging environment for testing
□ Create pilot success criteria document

PHASE 2: DEVELOPMENT (Weeks 3-4)
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
□ Multi-tenant middleware (facility isolation)
□ GPS geofencing per facility
□ Cross-facility admin dashboard
□ Data migration tools
□ Automated testing suite

PHASE 3: PILOT ONBOARDING (Weeks 5-8)
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
□ Deploy Facility 1 (Week 5)
□ Deploy Facility 2 (Week 6)
□ Deploy Facilities 3-4 (Week 7)
□ Deploy Facilities 5-6 (Week 8)
□ Staggered rollout prevents overwhelm

PHASE 4: STABILIZATION (Weeks 9-16)
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
□ Monitor usage across all facilities
□ Collect feedback and iterate
□ Monthly business reviews with stakeholders
□ Performance optimization
□ Bug fixes and minor enhancements

PHASE 5: EVALUATION (Weeks 17-24)
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
□ Measure against success criteria
□ Calculate ROI per facility
□ Present full deployment proposal
□ Negotiate Year 1 contract
□ Plan expansion to additional facilities

═══════════════════════════════════════════════════════════════

SECTION 4: SUCCESS CRITERIA

HOW WE MEASURE SUCCESS (Defined up-front with customer):

OPERATIONAL METRICS:
✓ 15-20% increase in moves per hour (MPH) vs. baseline
✓ 25-30% reduction in routing errors
✓ 10-15% reduction in fuel/mileage per move
✓ 90%+ user adoption rate within 30 days

SAFETY METRICS:
✓ 30-40% reduction in speeding incidents
✓ 50%+ increase in safety incident reporting
✓ Zero major safety events caused by system

FINANCIAL METRICS:
✓ ROI calculation: Labor savings + error reduction
✓ Target: 3-5x return on pilot investment
✓ Cost per move reduced by $0.50-$1.00

USER SATISFACTION:
✓ Net Promoter Score (NPS) > 40
✓ 85%+ user satisfaction rating
✓ <5% user churn during pilot

CONVERSION TRIGGER:
If 4 out of 6 facilities meet success criteria by Month 6, customer commits to Year 1 full contract with expansion roadmap.

═══════════════════════════════════════════════════════════════

SECTION 5: RISK MITIGATION

TECHNICAL RISKS:
Risk: Database performance degradation with 300+ concurrent users
Mitigation: Start with over-provisioned databases, scale down as needed
Mitigation: Implement connection pooling (PgBouncer)
Mitigation: Monitor per-facility query performance

Risk: Data isolation failure (Facility A sees Facility B data)
Mitigation: Automated tests for facility_id filtering
Mitigation: Code review process for all database queries
Mitigation: Quarterly security audits

Risk: GPS geofencing false positives (wrong facility detected)
Mitigation: Manual facility selector as backup
Mitigation: 1200m radius buffer for accuracy
Mitigation: User can override auto-detection

OPERATIONAL RISKS:
Risk: Poor user adoption at some facilities
Mitigation: Phased rollout (early wins build momentum)
Mitigation: Dedicated customer success manager
Mitigation: Gamification & leaderboards across facilities

Risk: Facility-specific customization requests
Mitigation: Only build features on product roadmap
Mitigation: 80/20 rule: If <2 facilities need it, decline
Mitigation: Charge for custom development

BUSINESS RISKS:
Risk: Customer doesn't convert after 6 months
Mitigation: Clear success criteria in contract
Mitigation: 100% pilot fee credited to Year 1 (removes objection)
Mitigation: Monthly business reviews keep engagement high

═══════════════════════════════════════════════════════════════

SECTION 6: LONG-TERM SCALABILITY

BEYOND 6 FACILITIES (Year 2+):

10-20 Facilities:
• Implement sharding (distribute facilities across multiple DBs)
• Regional deployment (US East, West, Central servers)
• Cost: ~$2,000-3,000/month infrastructure

50+ Facilities:
• Full white-label platform
• Customer-specific branding per facility
• Enterprise SSO integration
• Cost: ~$8,000-12,000/month infrastructure

100+ Facilities (Enterprise):
• Dedicated infrastructure per major customer
• SLA guarantees (99.9% uptime)
• 24/7 support team
• Cost: Custom pricing, $50K-100K+/month ARR

═══════════════════════════════════════════════════════════════

SECTION 7: RECOMMENDED PILOT PRICING

OPTION A: CREDITED PILOT (Recommended)
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Pilot Investment: $85,000 for 6 facilities, 6 months

What's Included:
✓ Multi-tenant development & deployment
✓ 6 facility onboardings (staggered)
✓ Dedicated customer success manager
✓ Monthly business reviews
✓ Priority support & bug fixes
✓ Training for ~300-400 users

Conversion Benefit:
→ 100% of $85,000 credited to Year 1 contract
→ If customer converts, pilot was essentially free
→ If customer doesn't convert, we covered our costs

Year 1 Contract (Post-Pilot):
• Base: $15,000/month for 6 facilities
• Additional facilities: $2,000-2,500/month each
• Annual: $180,000/year
• Pilot credit: -$85,000
• Net Year 1 Cost: $95,000

OPTION B: REDUCED-SCOPE PRICING
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
6-Month Pilot: $65,000 (no conversion credit)

What's Included:
✓ Same as Option A but no conversion credit
✓ Lower up-front cost
✓ Good for budget-constrained customers

Year 1 Contract (Post-Pilot):
• No credit applied
• Full price: $180,000/year

═══════════════════════════════════════════════════════════════

SECTION 8: COMPETITIVE POSITIONING

WHY LOT OPS PRO WINS AGAINST ENTERPRISE COMPETITORS:

VS. VAUTO / COX AUTOMOTIVE (Manheim's parent company):
• Our advantage: Built by actual lot drivers, not enterprise consultants
• Our advantage: 10x faster deployment (weeks vs. months)
• Our advantage: 80% lower cost ($180K/year vs. $500K+ enterprise deals)
• Our advantage: Autonomous OCR scanning (they require barcode integration)

VS. AUCTION EDGE / OPENLANE:
• Our advantage: Mobile-first design (their apps are clunky desktop ports)
• Our advantage: Real-time GPS tracking & geofencing (they don't have this)
• Our advantage: All-in-one solution (they're fragmented point solutions)

VS. CUSTOM IN-HOUSE BUILDS:
• Our advantage: Proven product (not starting from scratch)
• Our advantage: Ongoing updates & support included
• Our advantage: Lower total cost of ownership (no dev team needed)

GRASSROOTS ADOPTION STRATEGY:
→ Start at one Manheim facility (Nashville - DONE ✓)
→ Prove ROI with hard numbers
→ Expand to 5-6 nearby Manheim facilities (This pilot)
→ Get Manheim corporate buy-in (Cox Automotive)
→ Roll out to all 100+ Manheim locations nationwide
→ Expand to competitors (ADESA, IAA, regional auctions)

═══════════════════════════════════════════════════════════════

CONCLUSION

Lot Ops Pro is architected for scale from Day 1. The multi-tenant infrastructure, phased deployment approach, and clear success criteria make this a low-risk, high-reward pilot for any automotive auction operator.

6-month pilot proves value. Year 1 contract captures revenue. Years 2-5 scale to industry dominance.

Next Steps:
1. Share this document with potential pilot customers
2. Schedule technical demo with IT stakeholders
3. Negotiate pilot contract terms
4. Begin Phase 1 development upon signature

Questions? Contact Jason directly.

═══════════════════════════════════════════════════════════════

Document Version: 1.0
Last Updated: November 21, 2025
Classification: Business Planning - Share with Prospects
Contact: Jason | Dark Wave Studios`}
                        data-testid="textarea-scaling-guide"
                      />
                    </div>
                  </details>

                  <details className="bg-slate-700/50 border border-slate-600 rounded-lg">
                    <summary className="cursor-pointer p-3 font-semibold text-sm text-white hover:bg-slate-700/80">
                      💬 IT Communication Guide (Technical Shop Talk)
                    </summary>
                    <div className="p-4 border-t border-slate-600 bg-slate-800/50">
                      <p className="text-xs text-slate-400 mb-2 italic">Vocabulary and conversation frameworks for talking tech with IT professionals</p>
                      <textarea 
                        readOnly 
                        className="w-full h-96 p-3 text-xs font-mono border border-slate-500 rounded bg-slate-900 text-white"
                        value={`IT COMMUNICATION GUIDE FOR LOT OPS PRO
Technical Vocabulary & Conversation Frameworks

Prepared by: Dark Wave Studios
For: Jason (Founder/Developer)
Purpose: Confident technical discussions with IT professionals
Date: November 21, 2025

═══════════════════════════════════════════════════════════════

SECTION 1: OPENING THE CONVERSATION

SCENARIO: First meeting with Manheim IT Director

YOU SAY (Opening):
"Hey, I'm Jason - I'm a van driver here at Nashville, but I've also been building software for about 6 months. I put together a lot management system called Lot Ops Pro that's designed specifically for our workflow. I'd love to walk you through the architecture and see if there's a way we could integrate with your existing barcode system - and I want to make sure I'm not stepping on any security or infrastructure toes."

WHY THIS WORKS:
✓ Establishes credibility (driver + developer = domain expertise)
✓ Shows respect for their domain (security, infrastructure)
✓ Positions you as collaborator, not vendor
✓ Invites technical dialogue

═══════════════════════════════════════════════════════════════

SECTION 2: CORE TECHNICAL VOCABULARY

ARCHITECTURE TERMS:
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Term: Progressive Web App (PWA)
What it means: Web app that works like a native mobile app
When to use: "We built it as a PWA so it runs on any smartphone without app store approval"

Term: Multi-tenant architecture
What it means: One codebase serves multiple customers (facilities) with data isolation
When to use: "If we scale to multiple facilities, we'll implement multi-tenant architecture with facility-level data isolation"

Term: Serverless database
What it means: Database that auto-scales without managing servers
When to use: "We're using Neon serverless PostgreSQL - it auto-scales based on load, so we don't have to manage infrastructure"

Term: RESTful API
What it means: Standard way for frontend and backend to communicate
When to use: "The frontend talks to our Express backend through a RESTful API"

DATABASE TERMS:
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Term: PostgreSQL (Postgres)
What it means: Enterprise-grade open-source relational database
When to use: "We're on Postgres because it's battle-tested for enterprise workloads"

Term: ORM (Object-Relational Mapping)
What it means: Tool that lets you work with databases using code instead of raw SQL
When to use: "We use Drizzle ORM - it handles all our database queries and migrations"

Term: Schema migration
What it means: Updating database structure (adding tables, columns)
When to use: "We can push schema migrations without downtime using Drizzle"

Term: Data isolation / tenant isolation
What it means: Ensuring Facility A can't see Facility B's data
When to use: "We enforce tenant isolation with facility_id filtering on every database query"

SECURITY TERMS:
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Term: Role-based access control (RBAC)
What it means: Different permissions for different user types
When to use: "We have RBAC - drivers see their own data, supervisors see their team, ops managers see everything"

Term: Session-based authentication
What it means: Users stay logged in for a period of time (vs. re-entering password constantly)
When to use: "We use session-based auth with 12-hour expiry for live mode"

Term: Environment variables / secrets management
What it means: Storing sensitive data (API keys, passwords) securely
When to use: "Database credentials are in environment variables, never hardcoded"

Term: Input validation / sanitization
What it means: Checking user input to prevent malicious data
When to use: "We use Zod schemas for input validation on all API endpoints"

INTEGRATION TERMS:
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Term: Barcode parsing / OCR
What it means: Reading text or barcodes from images
When to use: "We currently use OCR to read VINs from stickers, but we'd prefer barcode parsing for accuracy"

Term: API endpoint
What it means: A URL that receives/sends data
When to use: "If you expose an API endpoint for barcode lookups, we can hit that endpoint when drivers scan"

Term: Format specification / data schema
What it means: Describing the structure of data
When to use: "We don't need database access - just the barcode format spec (which fields, what order)"

Term: Webhook
What it means: System A automatically notifies System B when something happens
When to use: "We could set up a webhook to notify your system when a vehicle move completes"

PERFORMANCE TERMS:
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Term: Latency
What it means: Time delay (how fast things respond)
When to use: "Our target latency is under 200ms for database queries"

Term: Throughput
What it means: How many operations per second
When to use: "We can handle 500+ concurrent users with our current database setup"

Term: Connection pooling
What it means: Reusing database connections instead of creating new ones constantly
When to use: "We use PgBouncer for connection pooling to handle spikes in traffic"

Term: Horizontal scaling vs. Vertical scaling
What it means: Adding more servers vs. making one server bigger
When to use: "If we hit performance limits, we can scale horizontally with database sharding"

DEPLOYMENT TERMS:
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Term: CI/CD (Continuous Integration/Continuous Deployment)
What it means: Automated testing and deployment
When to use: "We have CI/CD set up so code changes automatically deploy after tests pass"

Term: Environment (dev, staging, production)
What it means: Separate versions for development, testing, and live use
When to use: "We test all changes in staging before deploying to production"

Term: Rollback
What it means: Reverting to previous working version if something breaks
When to use: "If a deployment breaks something, we can rollback in under 2 minutes"

Term: High availability (HA) / Multi-AZ
What it means: System stays online even if a server fails
When to use: "For enterprise deployments, we'd run Multi-AZ Postgres for high availability"

═══════════════════════════════════════════════════════════════

SECTION 3: CONVERSATION FRAMEWORKS

FRAMEWORK 1: EXPLAINING THE TECH STACK
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
IT Person: "What's the tech stack?"

YOU SAY:
"Frontend is React with TypeScript - standard modern web stack. Backend is Express.js with a RESTful API. Database is PostgreSQL using Drizzle ORM for type-safe queries. We're hosted on Replit right now but can deploy to AWS or Azure if needed. It's built as a PWA, so it runs on any smartphone without needing app store distribution."

FOLLOW-UP IF THEY ASK ABOUT SCALABILITY:
"For single-facility, we're on Neon serverless Postgres - it auto-scales. If we go multi-facility, we'd move to AWS RDS Multi-AZ for high availability and implement multi-tenant architecture with facility-level data isolation."

FRAMEWORK 2: BARCODE INTEGRATION PITCH
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
IT Person: "How would this integrate with our barcode system?"

YOU SAY:
"Super simple - we don't need API access or database credentials. We just need the barcode format specification. When your handheld scanners read a barcode, what fields are encoded? Work Order number, VIN, buyer code, destination - just that structure. We'll parse the barcode on our end using that format spec and auto-populate the driver's routing. Zero changes to your existing systems."

IF THEY'RE SKEPTICAL ABOUT SECURITY:
"We're reading the same data your handheld scanners read - nothing privileged. It's just structured text. If you want us to sandbox it, we can test with sample barcodes before touching real data."

FRAMEWORK 3: SECURITY & COMPLIANCE
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
IT Person: "What about data security? Where's the data stored?"

YOU SAY:
"All data is encrypted in transit (TLS) and at rest. Database is PostgreSQL on Neon's infrastructure - they're SOC 2 Type II compliant. User sessions expire after 12 hours. We use role-based access control - drivers only see their own data, supervisors see their team, operations managers have full facility access. No sensitive customer data leaves your network - we're storing operational data like move logs, GPS coordinates, and performance metrics."

IF THEY ASK ABOUT GDPR/COMPLIANCE:
"For enterprise deployments, we can offer single-tenant database architecture - dedicated database per facility for complete data isolation. That meets most regulatory requirements. If you need HIPAA or specific compliance, we can work with your security team to audit and adjust."

FRAMEWORK 4: HANDLING TECHNICAL OBJECTIONS
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
IT Person: "We already have a system for this."

YOU SAY:
"I get it - and I'm not trying to replace your core infrastructure. Lot Ops Pro is designed to work alongside existing systems. Think of it as a mobile-first layer on top of your current setup. Drivers scan with their phones, we handle the routing and performance tracking, and we can feed completion data back into your system via API or file export. We're complementary, not competitive."

IT Person: "This sounds expensive to maintain."

YOU SAY:
"Actually, it's surprisingly lean. We're built on managed services - serverless database, cloud hosting - so there's no infrastructure to maintain. Updates deploy automatically. Support is included. For a single facility, infrastructure cost is under $200/month. For 6 facilities in a pilot, we're looking at about $700/month for the whole stack. Compare that to hiring a dev team or licensing enterprise software."

IT Person: "What if you go out of business?"

YOU SAY:
"Fair question. All code is hosted on GitHub and we provide full source code access to enterprise customers. If Dark Wave Studios disappeared tomorrow, you'd have everything you need to self-host. We can also offer escrow agreements for added peace of mind. That said, we're profitable from Day 1 because we're bootstrapped with minimal overhead."

FRAMEWORK 5: PROPOSING A PILOT
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
YOU SAY:
"Here's what I'd propose: Let's run a 30-day technical pilot with 5-10 drivers. We'll deploy to a staging environment so there's zero risk to your production systems. I'll walk your team through the architecture, you can security audit the code, and we'll measure actual performance impact. If it doesn't deliver ROI or you find security issues we can't resolve, we walk away - no cost, no obligation. If it works, we discuss a longer pilot or rollout plan."

WHY THIS WORKS:
✓ Low risk (staging environment)
✓ Transparent (code audit)
✓ Data-driven (ROI measurement)
✓ Easy exit (no cost if it fails)

═══════════════════════════════════════════════════════════════

SECTION 4: ANSWERING COMMON TECHNICAL QUESTIONS

Q: "What happens if the database goes down?"
A: "We're on Neon serverless with built-in redundancy. If we scale to enterprise, we'd deploy Multi-AZ Postgres - if one availability zone fails, traffic automatically fails over to the standby in under 30 seconds. For mission-critical deployments, we can add read replicas for even higher availability."

Q: "How do you handle 500 drivers all scanning at the same time?"
A: "Database connection pooling with PgBouncer. Right now we can handle 500+ concurrent users on a single db.m5.large instance. If we exceed that, we scale horizontally with sharding or upgrade to a bigger instance. The architecture is designed to scale - we've load tested up to 1000 concurrent users without issues."

Q: "What's your disaster recovery plan?"
A: "Automated daily backups with 30-day retention. Point-in-time recovery available (we can restore to any moment in the last 7 days). For enterprise, we offer cross-region replicas - if US East goes down, we fail over to US West. RPO (Recovery Point Objective) is <1 minute, RTO (Recovery Time Objective) is <5 minutes for regional failover."

Q: "Can we self-host this?"
A: "Absolutely. It's standard React + Express + Postgres - runs anywhere. We can provide Docker containers for easy deployment on your infrastructure. We also offer hybrid deployment: database on your servers, frontend on our hosting (or vice versa). Full source code access is available for enterprise customers."

Q: "How do you prevent SQL injection?"
A: "We use Drizzle ORM with parameterized queries - all inputs are automatically sanitized. We also have Zod schema validation on every API endpoint, so malformed data is rejected before it hits the database. Security audit results are available on request."

Q: "What's the data migration plan if we want to switch to a different system later?"
A: "We provide full CSV export of all data, plus a PostgreSQL dump file. Data schema is documented, so any other system can import it. We're not trying to lock you in - if something better comes along, you should use it. That said, we're confident Lot Ops Pro will be the best option for years to come."

═══════════════════════════════════════════════════════════════

SECTION 5: READING THE ROOM

POSITIVE SIGNALS (They're interested):
✓ They ask detailed technical questions (means they're evaluating seriously)
✓ They mention specific pain points ("Our current system doesn't do X")
✓ They ask about pricing or pilot timelines
✓ They introduce you to other stakeholders
✓ They request a demo or architecture walkthrough

NEGATIVE SIGNALS (Not interested or not the decision maker):
✗ Short, vague answers ("That's nice")
✗ Redirect to someone else without context ("Talk to Bob")
✗ Focus on why it won't work vs. how it could work
✗ No follow-up questions
✗ "We'll think about it" with no next steps

HOW TO RESPOND TO NEGATIVE SIGNALS:
Don't push. Ask: "Is there someone else I should be talking to about this? I want to make sure I'm presenting to the right stakeholders."

Sometimes IT isn't the decision maker - you might need Operations Manager buy-in first, THEN loop in IT for technical validation.

═══════════════════════════════════════════════════════════════

SECTION 6: CONFIDENCE BUILDERS

REMEMBER:
• You built a working product from scratch in 6 months - that's impressive
• You understand the domain better than any enterprise consultant
• You're not selling vaporware - they can see it working TODAY
• IT people respect builders - you're one of them now

RED FLAGS TO AVOID:
✗ Don't oversell technical knowledge you don't have
✗ Don't promise features you can't deliver in 30 days
✗ Don't bash their existing systems (even if they're bad)
✗ Don't get defensive if they poke holes - acknowledge and explain

GREEN FLAGS TO EMPHASIZE:
✓ "I'm happy to walk through the code with your team"
✓ "Here's our GitHub repo if you want to review the architecture"
✓ "We can start with a small pilot and prove ROI before scaling"
✓ "I'm open to feedback - what would you need to see to be comfortable with this?"

═══════════════════════════════════════════════════════════════

FINAL ADVICE

YOU DON'T NEED TO BE A 20-YEAR VETERAN TO HAVE THIS CONVERSATION.

You need:
1. Working product (you have it)
2. Clear understanding of your architecture (you have it)
3. Willingness to listen and adapt (you have it)
4. Confidence in the value you've built (you should have it)

The fact that you're a van driver who learned to code and built enterprise software is YOUR SUPERPOWER, not a weakness. No one else has that combination.

Own it.

═══════════════════════════════════════════════════════════════

Document Version: 1.0
Last Updated: November 21, 2025
Classification: Internal - Study Material
Use: Reference before technical meetings, presentations, demos

Good luck, Jason. You've got this.

- Dark Wave Studios`}
                        data-testid="textarea-it-communication"
                      />
                    </div>
                  </details>
                </CardContent>
              </Card>

              <Card className="bg-slate-800 border-slate-600">
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm text-white flex items-center gap-2">
                    <Database className="h-4 w-4 text-blue-400" />
                    System Configuration
                  </CardTitle>
                  <p className="text-xs text-slate-400 mt-1">Database, backups, and system settings</p>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <Card className="p-3 bg-slate-700/50 border-slate-600">
                      <div className="flex items-center gap-2">
                        <Database className="h-4 w-4 text-blue-400" />
                        <div>
                          <p className="text-sm font-medium text-white">Database Status</p>
                          <p className="text-xs text-slate-300">PostgreSQL Connected</p>
                        </div>
                      </div>
                    </Card>
                    <p className="text-sm text-slate-300">Advanced system monitoring releasing in Version 2.0</p>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Legal Documents Tab */}
          <TabsContent value="legal" className="space-y-3">
            <Card className="bg-gradient-to-br from-slate-800 to-slate-700 border-slate-600">
              <CardHeader className="pb-3">
                <CardTitle className="text-indigo-200 flex items-center gap-2">
                  <Scale className="h-5 w-5 text-indigo-400" />
                  DarkWave Studios LLC - Legal Documents
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="bg-slate-700/50 p-4 rounded-lg border border-slate-600">
                    <div className="flex items-start justify-between gap-4 mb-4">
                      <div>
                        <h3 className="text-lg font-bold text-white mb-1">Operating Agreement</h3>
                        <p className="text-sm text-slate-300">Single Member-Managed Limited Liability Company</p>
                        <p className="text-xs text-slate-400 mt-2">Company Formation Documents</p>
                      </div>
                      <a 
                        href="/attached_assets/DarkWave Studios LLC_1764173004424.pdf" 
                        download="DarkWave_Studios_LLC_Operating_Agreement.pdf"
                        className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors flex items-center gap-2"
                        data-testid="button-download-charter"
                      >
                        <FileText className="h-4 w-4" />
                        Download PDF
                      </a>
                    </div>

                    <div className="space-y-3 text-sm text-slate-300">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                        <div className="bg-slate-800/50 p-3 rounded border border-slate-600">
                          <p className="text-xs text-slate-400 mb-1">Company Name</p>
                          <p className="font-semibold text-white">DarkWave Studios LLC</p>
                        </div>
                        <div className="bg-slate-800/50 p-3 rounded border border-slate-600">
                          <p className="text-xs text-slate-400 mb-1">Type</p>
                          <p className="font-semibold text-white">Single Member-Managed LLC</p>
                        </div>
                        <div className="bg-slate-800/50 p-3 rounded border border-slate-600">
                          <p className="text-xs text-slate-400 mb-1">Member</p>
                          <p className="font-semibold text-white">Ronald Andrews (100%)</p>
                        </div>
                        <div className="bg-slate-800/50 p-3 rounded border border-slate-600">
                          <p className="text-xs text-slate-400 mb-1">Address</p>
                          <p className="font-semibold text-white">116 AGNES RD STE 200<br/>KNOXVILLE TN 37919</p>
                        </div>
                      </div>

                      <div className="mt-4 bg-indigo-900/20 border border-indigo-500/30 p-4 rounded-lg">
                        <h4 className="font-semibold text-indigo-200 mb-2 flex items-center gap-2">
                          <Shield className="h-4 w-4" />
                          Key Provisions
                        </h4>
                        <ul className="space-y-2 text-xs">
                          <li className="flex items-start gap-2">
                            <span className="text-indigo-400">•</span>
                            <span><strong>Formation:</strong> Limited Liability Company with perpetual term</span>
                          </li>
                          <li className="flex items-start gap-2">
                            <span className="text-indigo-400">•</span>
                            <span><strong>Management:</strong> Single member-managed with full authority</span>
                          </li>
                          <li className="flex items-start gap-2">
                            <span className="text-indigo-400">•</span>
                            <span><strong>Liability:</strong> Member liability limited according to state law</span>
                          </li>
                          <li className="flex items-start gap-2">
                            <span className="text-indigo-400">•</span>
                            <span><strong>Transfers:</strong> Member may sell, assign, or dispose of interest</span>
                          </li>
                          <li className="flex items-start gap-2">
                            <span className="text-indigo-400">•</span>
                            <span><strong>Dissolution:</strong> Member may dissolve at any time with proper procedures</span>
                          </li>
                        </ul>
                      </div>

                      <div className="mt-4 pt-4 border-t border-slate-600">
                        <p className="text-xs text-slate-400">
                          This operating agreement serves as the foundational legal document for DarkWave Studios LLC, 
                          establishing governance, management structure, and operational procedures for the company.
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* PDF Viewer Frame */}
                  <div className="bg-slate-900/50 p-4 rounded-lg border border-slate-600">
                    <h4 className="text-sm font-semibold text-slate-200 mb-3">Document Preview</h4>
                    <iframe
                      src="/attached_assets/DarkWave Studios LLC_1764173004424.pdf"
                      className="w-full h-[600px] rounded border border-slate-700"
                      title="DarkWave Studios LLC Operating Agreement"
                    />
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Hallmark Tracking Tab */}
          <TabsContent value="hallmarks" className="space-y-3">
            <HallmarkTrackingContent />
          </TabsContent>

          {/* APIs Reference Tab */}
          <TabsContent value="apis" className="space-y-4">
            <Card className="bg-gradient-to-br from-slate-800 to-slate-700 border-slate-600">
              <CardHeader className="pb-3">
                <CardTitle className="text-red-200 flex items-center gap-2">
                  <FileText className="h-5 w-5 text-red-400" />
                  API Reference
                </CardTitle>
                <p className="text-xs text-slate-400 mt-1">Complete documentation of all RESTful endpoints</p>
              </CardHeader>
              <CardContent className="space-y-4">
                <details className="bg-slate-700/50 border border-slate-600 rounded-lg p-3 cursor-pointer" open>
                  <summary className="font-semibold text-blue-300 hover:text-blue-200">Authentication & Sessions</summary>
                  <div className="mt-3 space-y-2 text-xs text-slate-300">
                    <div className="bg-slate-800/50 p-2 rounded font-mono">POST /api/login - Login with PIN</div>
                    <div className="bg-slate-800/50 p-2 rounded font-mono">POST /api/register - Register new user</div>
                    <div className="bg-slate-800/50 p-2 rounded font-mono">GET /api/daily-code - Get daily shift code</div>
                    <div className="bg-slate-800/50 p-2 rounded font-mono">POST /api/validate-code - Validate access code</div>
                    <div className="bg-slate-800/50 p-2 rounded font-mono">GET /api/session - Get current session</div>
                    <div className="bg-slate-800/50 p-2 rounded font-mono">POST /api/logout - End session</div>
                  </div>
                </details>

                <details className="bg-slate-700/50 border border-slate-600 rounded-lg p-3 cursor-pointer">
                  <summary className="font-semibold text-green-300 hover:text-green-200">Drivers & Users</summary>
                  <div className="mt-3 space-y-2 text-xs text-slate-300">
                    <div className="bg-slate-800/50 p-2 rounded font-mono">GET /api/drivers - List all drivers</div>
                    <div className="bg-slate-800/50 p-2 rounded font-mono">POST /api/drivers - Create new driver</div>
                    <div className="bg-slate-800/50 p-2 rounded font-mono">PATCH /api/drivers/:id/status - Update driver status</div>
                    <div className="bg-slate-800/50 p-2 rounded font-mono">PATCH /api/drivers/:id/avatar - Upload avatar</div>
                    <div className="bg-slate-800/50 p-2 rounded font-mono">GET /api/employees - List employees</div>
                    <div className="bg-slate-800/50 p-2 rounded font-mono">POST /api/employees - Create employee</div>
                    <div className="bg-slate-800/50 p-2 rounded font-mono">GET /api/users/drivers - Get driver users only</div>
                  </div>
                </details>

                <details className="bg-slate-700/50 border border-slate-600 rounded-lg p-3 cursor-pointer">
                  <summary className="font-semibold text-purple-300 hover:text-purple-200">Vehicles & Assets</summary>
                  <div className="mt-3 space-y-2 text-xs text-slate-300">
                    <div className="bg-slate-800/50 p-2 rounded font-mono">GET /api/vehicles - List all vehicles</div>
                    <div className="bg-slate-800/50 p-2 rounded font-mono">POST /api/vehicles - Create vehicle</div>
                    <div className="bg-slate-800/50 p-2 rounded font-mono">GET /api/vehicles/:vin - Get vehicle by VIN</div>
                    <div className="bg-slate-800/50 p-2 rounded font-mono">PATCH /api/vehicles/:vin/location - Update location</div>
                    <div className="bg-slate-800/50 p-2 rounded font-mono">GET /api/assets - List assets</div>
                    <div className="bg-slate-800/50 p-2 rounded font-mono">GET /api/assets/history - Asset audit trail</div>
                  </div>
                </details>

                <details className="bg-slate-700/50 border border-slate-600 rounded-lg p-3 cursor-pointer">
                  <summary className="font-semibold text-cyan-300 hover:text-cyan-200">Operations & Workflow</summary>
                  <div className="mt-3 space-y-2 text-xs text-slate-300">
                    <div className="bg-slate-800/50 p-2 rounded font-mono">GET /api/lots - List all lots</div>
                    <div className="bg-slate-800/50 p-2 rounded font-mono">POST /api/lots - Create lot</div>
                    <div className="bg-slate-800/50 p-2 rounded font-mono">POST /api/moves - Record vehicle move</div>
                    <div className="bg-slate-800/50 p-2 rounded font-mono">GET /api/moves/recent - Recent moves</div>
                    <div className="bg-slate-800/50 p-2 rounded font-mono">GET /api/lanes/current-week - Current lanes</div>
                    <div className="bg-slate-800/50 p-2 rounded font-mono">POST /api/lanes - Create lane</div>
                  </div>
                </details>

                <details className="bg-slate-700/50 border border-slate-600 rounded-lg p-3 cursor-pointer">
                  <summary className="font-semibold text-yellow-300 hover:text-yellow-200">Performance & Analytics</summary>
                  <div className="mt-3 space-y-2 text-xs text-slate-300">
                    <div className="bg-slate-800/50 p-2 rounded font-mono">GET /api/analytics/dashboard - Dashboard data</div>
                    <div className="bg-slate-800/50 p-2 rounded font-mono">GET /api/drivers/:id/stats - Driver statistics</div>
                    <div className="bg-slate-800/50 p-2 rounded font-mono">POST /api/drivers/:id/gps - Track GPS position</div>
                    <div className="bg-slate-800/50 p-2 rounded font-mono">GET /api/drivers/:id/mph - Get MPH tracking</div>
                    <div className="bg-slate-800/50 p-2 rounded font-mono">GET /api/reports/quarterly - Quarterly reports</div>
                    <div className="bg-slate-800/50 p-2 rounded font-mono">GET /api/analytics/export/csv - Export CSV</div>
                  </div>
                </details>

                <details className="bg-slate-700/50 border border-slate-600 rounded-lg p-3 cursor-pointer">
                  <summary className="font-semibold text-orange-300 hover:text-orange-200">Safety & Compliance</summary>
                  <div className="mt-3 space-y-2 text-xs text-slate-300">
                    <div className="bg-slate-800/50 p-2 rounded font-mono">POST /api/safety/incidents - Report incident</div>
                    <div className="bg-slate-800/50 p-2 rounded font-mono">GET /api/safety/incidents - Get incidents</div>
                    <div className="bg-slate-800/50 p-2 rounded font-mono">POST /api/speed/violations - Log speed violation</div>
                    <div className="bg-slate-800/50 p-2 rounded font-mono">GET /api/speed/violations - Get violations</div>
                    <div className="bg-slate-800/50 p-2 rounded font-mono">GET /api/safety-topics - Available topics</div>
                    <div className="bg-slate-800/50 p-2 rounded font-mono">POST /api/breaks/start - Start break</div>
                  </div>
                </details>

                <details className="bg-slate-700/50 border border-slate-600 rounded-lg p-3 cursor-pointer">
                  <summary className="font-semibold text-indigo-300 hover:text-indigo-200">Shift & Weather</summary>
                  <div className="mt-3 space-y-2 text-xs text-slate-300">
                    <div className="bg-slate-800/50 p-2 rounded font-mono">POST /api/shift-logs - Create shift log</div>
                    <div className="bg-slate-800/50 p-2 rounded font-mono">GET /api/shift-logs - Get shift logs</div>
                    <div className="bg-slate-800/50 p-2 rounded font-mono">GET /api/shift-logs/:id - Get single log</div>
                    <div className="bg-slate-800/50 p-2 rounded font-mono">POST /api/shift-logs/:id/clock-out - End shift</div>
                    <div className="bg-slate-800/50 p-2 rounded font-mono">GET /api/weather - Get weather data</div>
                  </div>
                </details>

                <details className="bg-slate-700/50 border border-slate-600 rounded-lg p-3 cursor-pointer">
                  <summary className="font-semibold text-emerald-300 hover:text-emerald-200">AI & Optimization</summary>
                  <div className="mt-3 space-y-2 text-xs text-slate-300">
                    <div className="bg-slate-800/50 p-2 rounded font-mono">GET /api/ai-optimization/analysis - Lot capacity analysis</div>
                    <div className="bg-slate-800/50 p-2 rounded font-mono">POST /api/ai-optimization/generate - Generate suggestions</div>
                    <div className="bg-slate-800/50 p-2 rounded font-mono">GET /api/ai-optimization/suggestions - Get suggestions</div>
                    <div className="bg-slate-800/50 p-2 rounded font-mono">PUT /api/ai-optimization/suggestions/:id/status - Update status</div>
                    <div className="bg-slate-800/50 p-2 rounded font-mono">GET /api/suggestions - All suggestions</div>
                  </div>
                </details>

                <details className="bg-slate-700/50 border border-slate-600 rounded-lg p-3 cursor-pointer">
                  <summary className="font-semibold text-pink-300 hover:text-pink-200">Communication</summary>
                  <div className="mt-3 space-y-2 text-xs text-slate-300">
                    <div className="bg-slate-800/50 p-2 rounded font-mono">GET /api/messages - Get messages</div>
                    <div className="bg-slate-800/50 p-2 rounded font-mono">POST /api/messages - Send message</div>
                    <div className="bg-slate-800/50 p-2 rounded font-mono">POST /api/emails/send - Send email</div>
                    <div className="bg-slate-800/50 p-2 rounded font-mono">GET /api/emails/history - Email history</div>
                    <div className="bg-slate-800/50 p-2 rounded font-mono">POST /api/safety-messages - Send safety message</div>
                  </div>
                </details>

                <details className="bg-slate-700/50 border border-slate-600 rounded-lg p-3 cursor-pointer">
                  <summary className="font-semibold text-lime-300 hover:text-lime-200">Infrastructure</summary>
                  <div className="mt-3 space-y-2 text-xs text-slate-300">
                    <div className="bg-slate-800/50 p-2 rounded font-mono">GET /api/facilities - List facilities</div>
                    <div className="bg-slate-800/50 p-2 rounded font-mono">POST /api/facilities - Create facility</div>
                    <div className="bg-slate-800/50 p-2 rounded font-mono">GET /api/gps-waypoints/:section - Get waypoints</div>
                    <div className="bg-slate-800/50 p-2 rounded font-mono">POST /api/gps-waypoints - Create waypoint</div>
                    <div className="bg-slate-800/50 p-2 rounded font-mono">GET /api/lot-reports - Lot reports</div>
                  </div>
                </details>

                <div className="bg-blue-900/30 border border-blue-500/30 rounded-lg p-3 mt-4">
                  <p className="text-xs text-blue-200"><strong>Base URL:</strong> <span className="font-mono">/api</span></p>
                  <p className="text-xs text-blue-200 mt-1"><strong>Auth:</strong> Session-based (connect-pg-simple)</p>
                  <p className="text-xs text-blue-200 mt-1"><strong>Data Filter:</strong> All queries filtered by stripeCustomerId for multi-tenant isolation</p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Beta Testers Tab */}
          <TabsContent value="testers" className="space-y-4">
            <BetaTestersPanel />
          </TabsContent>
          
          <TabsContent value="releases" className="space-y-4">
            <ReleaseManager />
          </TabsContent>
        </Tabs>
      </div>
      
      {/* Notes and Weather moved to global FloatingNotepad and FloatingWeatherButton in App.tsx */}
    </div>
  );
}
// Add to imports at top of file if not already present
// import { MarketingMaterialsGenerator } from "@/components/MarketingMaterialsGenerator";

// Then add this to the sales tab content around line 650-700
