import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { Copy, CheckCircle, ChevronDown, MessageSquare, Phone } from "lucide-react";
import { useState } from "react";
import { useToast } from "@/hooks/use-toast";

interface FeatureSection {
  title: string;
  items: string[];
}

const FEATURE_CATEGORIES: FeatureSection[] = [
  {
    title: "Core Authentication & Roles",
    items: [
      "PIN-based authentication (4-digit secure access)",
      "6 role-based dashboards: Operations Manager, Supervisors, Safety Advisor, Van Drivers, Inventory Drivers, Developer",
      "Demo Mode (30-min sandbox for all roles, no database writes)",
      "Live Mode (12-hour session persistence with PostgreSQL)",
      "Automatic role-based routing on login",
      "Temporary employee badging system (1 week to 2 months duration)",
      "Full employee/temp integration with permanent phone last 4 IDs"
    ]
  },
  {
    title: "GPS & Navigation",
    items: [
      "Real-time GPS tracking (60-second auto-refresh)",
      "Live facility map with driver positions",
      "Google Maps satellite overlay integration",
      "Interactive 326-acre lot map with all sections labeled",
      "Zoom controls (50% to 300%) and fullscreen landscape view",
      "GPS overlay toggle for driver positions",
      "Turn-by-turn serpentine routing",
      "Distance calculator (pickup to dropoff in yards)",
      "Zone-based navigation (Sale Lanes, Dirtside, Cleanside, Inventory, Cage, PSI, etc.)",
      "Geofencing (1200m radius - auto-enables Demo Mode outside facility)",
      "Simulated GPS for testing and training"
    ]
  },
  {
    title: "Camera Scanner & OCR",
    items: [
      "Live camera preview with rear/front camera toggle",
      "VIN and lot code OCR (Optical Character Recognition)",
      "Manual entry fallback for reliability",
      "Smart parsing (auto-detects VIN, Work Order, lot codes)",
      "Autonomous operation mode for high-volume scanning",
      "Post-scan confirmation with edit options",
      "Scan-first database building (Work Order numbers as primary keys)",
      "Vehicle record creation with editable fields"
    ]
  },
  {
    title: "Performance Tracking & Metrics",
    items: [
      "Real-time MPH (Moves Per Hour) calculation",
      "Quota alerts and warnings",
      "Weekly and monthly statistics",
      "Bonus estimation calculator",
      "Efficiency scoring system (0-100 algorithm): MPH Performance (40%), GPS Routing Efficiency (30%), Attendance Rate (20%), Punctuality & Discipline (10%)",
      "Trip counter with GPS odometer",
      "Mileage tracking (Haversine formula for distance)",
      "Auto-saved mileage statistics and aggregated performance data",
      "Leaderboard rankings with driver comparisons"
    ]
  },
  {
    title: "Shift & Time Management",
    items: [
      "Configurable shift schedules with digital clock-in/clock-out",
      "Break timer system (driver-controlled)",
      "Lunch and break tracking with database logging",
      "Supervisor override controls",
      "Grace period for tardiness (5 minutes)",
      "Shift history and attendance logs",
      "Retroactive logging for operational modes",
      "Real-time shift status indicators"
    ]
  },
  {
    title: "Operational Modes",
    items: [
      "Bulk Move Mode for high-volume operations",
      "EV Ops Mode (electric vehicle operations)",
      "Crunch Mode (high-intensity workflows)",
      "Retroactive logging for all modes",
      "Mode-specific performance tracking"
    ]
  },
  {
    title: "Messaging & Communication",
    items: [
      "Floating message button (always accessible)",
      "Real-time driver-supervisor messaging",
      "Supervisor-to-supervisor communication",
      "Unread message indicators and quick reply templates",
      "Official/Private message toggle: Private (default - not stored long-term, sender/recipient only), Official (company-logged, tracked by management)",
      "Developer lockout from private messages (privacy-first architecture)",
      "Safety disclaimer: Do not text while driving",
      "Message history with timestamps"
    ]
  },
  {
    title: "Email & Contact Management",
    items: [
      "Save frequently-used email addresses with name and category tagging",
      "Autocomplete search for quick access",
      "One-click mailto: link generation",
      "Contact export capabilities"
    ]
  },
  {
    title: "Document Storage & Retrieval",
    items: [
      "Local file storage for reports, PDFs, spreadsheets",
      "Up to 10MB per file with base64 encoding",
      "Document categorization and search system",
      "Retrieval and download capabilities"
    ]
  },
  {
    title: "Web Research Tool",
    items: [
      "Direct website navigation (www.manheim.com, www.darkwave.com, etc.)",
      "Web search functionality via Google",
      "Smart URL detection (navigates directly if URL, searches otherwise)"
    ]
  },
  {
    title: "Safety & Incident Reporting",
    items: [
      "Floating safety button for comprehensive incident reporting",
      "Photo capture (multiple images)",
      "Video capture (up to 10 seconds, 10MB max)",
      "Incident categorization (vehicle damage, injury, near-miss, etc.)",
      "Witness information collection",
      "GPS location tagging",
      "Timestamp and user identification",
      "Supervisor notification system"
    ]
  },
  {
    title: "Speed Detection & Monitoring",
    items: [
      "Real-time GPS speedometer",
      "Color-coded alerts (Green <5 mph, Yellow 5-8 mph, Red >8 mph)",
      "Two-tier violation system: Minor (8-10 mph), Major (>10 mph)",
      "Automatic violation logging with GPS coordinates",
      "Supervisor notification for major violations",
      "Speed history tracking"
    ]
  },
  {
    title: "Lot Space Tracking & AI Suggestions",
    items: [
      "Real-time lot capacity monitoring",
      "AI-powered placement suggestions based on sale day, seller code, vehicle type",
      "Available spot count by zone",
      "Lot congestion alerts",
      "Optimal routing to available spaces"
    ]
  },
  {
    title: "Weekly Lane Configuration",
    items: [
      "Dynamic map uploads for weekly lane changes",
      "Active week indicator",
      "Comparison view (current vs previous week)",
      "Spot count tracking per lane",
      "Admin controls for map management"
    ]
  },
  {
    title: "Weather System",
    items: [
      "Live weather widget with current conditions",
      "Animated weather radar (RainViewer integration)",
      "5-day forecast with hourly breakdown",
      "NWS alerts for severe weather",
      "Temperature, precipitation, wind speed data"
    ]
  },
  {
    title: "Corporate Resources Portal",
    items: [
      "Accurate Cox Enterprises organizational hierarchy",
      "Real provider links (UHC, Fidelity, Empower, etc.)",
      "Employee handbook access",
      "Benefits information",
      "Training resources and safety materials"
    ]
  },
  {
    title: "Management Tools",
    items: [
      "Comprehensive employee review templates (daily, weekly, monthly, quarterly, yearly, lifetime)",
      "Downloadable/printable/PDF report generation",
      "Editable company news section",
      "System Health Monitor (Developer dashboard - 27 automated tests)",
      "User management with role assignments",
      "Lot configuration controls"
    ]
  },
  {
    title: "Fun & Engagement",
    items: [
      "Hide & Seek easter eggs (always enabled for drivers)",
      "Fun Pop-ups toggle for management/supervisors (default off)",
      "One-time personalized welcome popup for management",
      "Avatar customization prompts"
    ]
  },
  {
    title: "Intellectual Property Protection",
    items: [
      "Terms of Service with digital signature acceptance",
      "Database tracking of TOS acceptance (timestamp, user ID)",
      "Downloadable 'Certificate of Intellectual Honesty' (fun but legally binding)",
      "Copyright footer on every page (© 2025 DarkWave Studios)",
      "IP protection enforced on first login for all new users",
      "Legal framework for enterprise licensing and white-label deployments"
    ]
  },
  {
    title: "Business Documentation & Transparency",
    items: [
      "Development efficiency: Purpose-built system vs traditional 4-6 month enterprise projects",
      "Cost savings calculator: $161,800 vs traditional software development",
      "Comprehensive Feature List (current production features)",
      "Version 2.0 Roadmap (Q1-Q4 2026 + 2027 enterprise features)",
      "Barcode Integration Guide (UPCM opportunity for Manheim)",
      "Contact methods for management/ownership discussions",
      "Copy-to-clipboard functionality for executive presentations"
    ]
  },
  {
    title: "Developer Dashboard Exclusives",
    items: [
      "System Health Check (27 automated tests)",
      "User management with role assignments",
      "Lot configuration controls (weekly maps, AI testing)",
      "Performance Reports (daily, weekly, monthly, quarterly, yearly, lifetime)",
      "Shift Management configuration",
      "Unrestricted access to all operational data and analytics",
      "Direct access to Terms of Service acceptance logs"
    ]
  }
];

const SCALING_ROADMAP = [
  {
    title: "Q1 2026 - AI Query System",
    items: [
      "Natural language vehicle lookup: 'Where is the red Ford in Lane 210?'",
      "Predictive routing based on historical data",
      "Intelligent work prioritization"
    ]
  },
  {
    title: "Q2 2026 - Unlimited Role Hierarchy",
    items: [
      "Support for Assistant Managers, Crew Chiefs, Team Leads",
      "Custom permission levels per role",
      "Hierarchical reporting structure"
    ]
  },
  {
    title: "Q2 2026 - Barcode Integration",
    items: [
      "One-scan vehicle intake (VIN, Work Order, Sale Day, Seller, Lane)",
      "Smart routing based on barcode data",
      "95% reduction in data entry errors",
      "Estimated savings: $10K-$26K annually at Nashville alone"
    ]
  },
  {
    title: "Q3 2026 - Lot Ops Pro Visa Card Program",
    items: [
      "Branded Visa debit cards for instant bonus payments and wage distribution",
      "Simple web interface for payroll administrators (no complex agency menus)",
      "Partnership model: Facilities recommend cards to temp agency partners",
      "Same-day pay for temps and drivers - improves retention and satisfaction",
      "API integration for existing payroll systems",
      "Revenue from transaction fees and card issuance"
    ]
  },
  {
    title: "Q3 2026 - Executive Analytics",
    items: [
      "Cross-auction performance comparisons",
      "Predictive staffing models",
      "Revenue impact analysis"
    ]
  },
  {
    title: "Q4 2026 - White Label Platform",
    items: [
      "Deployment to other Manheim auctions nationwide",
      "Configurable lot layouts and GPS coordinates",
      "Custom branding per location"
    ]
  },
  {
    title: "2027+ - Enterprise Security",
    items: [
      "SSO integration with Cox Enterprises",
      "Advanced audit logging",
      "Compliance reporting for corporate requirements"
    ]
  }
];

const MANHEIM_PITCH_SECTIONS = [
  {
    title: "The Opportunity: Barcode Integration",
    content: "Right now, Manheim's barcode system already encodes everything we need: VIN (17 characters), Work Order number (6-8 digits), Sale day (T/W/H), Seller code (3-4 characters), and Assigned lane (3 digits). The app I built can scan VINs with OCR, but if we had the barcode format specification from IT, we could decode ALL of that data in one scan. No typing, no errors, instant vehicle records."
  },
  {
    title: "What We Need (From IT)",
    content: "Just the barcode format. That's it. A simple document explaining what's in each field and where - for example: Field 1: VIN (positions 1-17), Field 2: Work Order (positions 18-25), etc. We're NOT asking for database access, API keys, VPN credentials, or system integration. Just the field layout."
  },
  {
    title: "Features We Could Add",
    items: [
      "ONE-SCAN VEHICLE INTAKE: Scan barcode → instant vehicle record with VIN, Work Order, Sale Day, Seller, Lane all populated automatically. Zero manual typing, 95% reduction in data entry errors.",
      "SMART ROUTING BASED ON LANE ASSIGNMENT: Barcode tells us where the vehicle is supposed to go, app calculates optimal route, turn-by-turn directions on driver's phone.",
      "AUTOMATED SALE DAY SORTING: Tuesday cars go to Tuesday zones, Wednesday cars staged separately, Thursday prep work prioritized correctly.",
      "SELLER-SPECIFIC WORKFLOWS: 'This is a Ford Motor Credit vehicle → goes to Lot 516', 'Ally Finance → Dirtside Lot 372' - pre-configured routing based on decoded seller code.",
      "REAL-TIME INVENTORY ACCURACY: Scan on pickup → vehicle marked 'in transit', scan on drop → vehicle confirmed at destination, live lot capacity by sale day and seller.",
      "PRE-POPULATED INSPECTION FORMS: VIN auto-fills from barcode scan, Work Order links to correct sale record, faster inspections, fewer errors.",
      "AUTOMATED LANE STAGING ALERTS: '142 vehicles assigned to Lane 210 need staging by 6 PM' - prioritized work queue based on barcode data."
    ]
  },
  {
    title: "The Numbers (Based on Nashville Data)",
    content: "Current manual process: Average time to log a vehicle is 45 seconds (typing VIN, Work Order, etc.). Typical day: 800-1,200 vehicles processed. Time spent on data entry: 10-15 hours per day (across all drivers). Error rate: ~5% (typos, wrong lot codes, missed fields).\n\nWith barcode integration: Time per vehicle: 5 seconds (scan + confirm). Same 800-1,200 vehicles. Time spent: 1.5-2 hours per day. Error rate: <0.5% (only human confirmation errors).\n\nTime savings: 8-13 hours per day\nCost savings: $10,000-$26,000 annually (labor efficiency)\nError reduction: 90% fewer mistakes"
  },
  {
    title: "Implementation",
    content: "Timeline: 4 weeks after receiving barcode format specs\nCost: $0 (just development time, no licensing or API fees)\nRisk: Minimal (read-only barcode decoding, no system changes)\n\nThe app already works without this. Barcode integration would just make it faster and more accurate. Low-hanging fruit."
  },
  {
    title: "Why I Built This",
    content: "Over the past year at Nashville, I've seen how hard everyone works to keep this 326-acre operation running smoothly. Supervisors juggling schedules, drivers navigating the lot in the dark, everyone manually logging data that's already encoded in barcodes we scan anyway.\n\nLot Ops Pro is my attempt to give back. This isn't about replacing anyone or changing the process - it's about streamlining what's already working and giving everyone back some breathing room to handle the unexpected stuff that actually needs attention.\n\nThe barcode integration would be the cherry on top. We'd go from 'pretty helpful' to 'why did we ever do this manually?'"
  },
  {
    title: "Next Steps (If You're Interested)",
    items: [
      "Quick demo (I can walk through the current app + explain barcode vision)",
      "One email to IT requesting barcode format specs",
      "I build the integration (4 weeks)",
      "Test with a small crew",
      "Roll out if it works"
    ],
    content: "No pressure, no sales pitch. Just wanted to put it on your radar. Happy to collaborate, refine the idea, or answer any questions. This is built for you guys - whatever makes your jobs easier."
  }
];

export function ComprehensiveFeatureList() {
  const { toast } = useToast();
  const [openSections, setOpenSections] = useState<Record<string, boolean>>({});
  const [copiedSection, setCopiedSection] = useState<string | null>(null);

  const toggleSection = (sectionKey: string) => {
    setOpenSections(prev => ({ ...prev, [sectionKey]: !prev[sectionKey] }));
  };

  const copyFullDocument = (type: 'features' | 'roadmap' | 'pitch') => {
    let content = '';
    
    if (type === 'features') {
      content = 'LOT OPS PRO - COMPLETE FEATURE LIST\nVersion 1.0 - Production Ready\n\n';
      FEATURE_CATEGORIES.forEach(cat => {
        content += `\n${cat.title.toUpperCase()}\n${'='.repeat(cat.title.length)}\n`;
        cat.items.forEach(item => {
          content += `• ${item}\n`;
        });
      });
    } else if (type === 'roadmap') {
      content = 'LOT OPS PRO - SCALING ROADMAP\nEnterprise Growth Plan\n\n';
      SCALING_ROADMAP.forEach(phase => {
        content += `\n${phase.title.toUpperCase()}\n${'='.repeat(phase.title.length)}\n`;
        phase.items.forEach(item => {
          content += `• ${item}\n`;
        });
      });
    } else if (type === 'pitch') {
      content = 'TO: Manheim Nashville Leadership\nFROM: Jason (Van Driver)\nSUBJECT: Barcode Integration Opportunity - Simple, Low-Cost Efficiency Boost\n\n';
      content += 'Hey team,\n\nI wanted to reach out about a quick integration opportunity I identified while building Lot Ops Pro. Based on a year of working the Nashville lot and analyzing our daily workflows, I\'ve spotted a straightforward way to eliminate manual data entry and boost efficiency across the board.\n\n';
      
      MANHEIM_PITCH_SECTIONS.forEach(section => {
        content += `\n${section.title.toUpperCase()}\n${'='.repeat(section.title.length)}\n\n`;
        if (section.content) {
          content += `${section.content}\n`;
        }
        if (section.items) {
          section.items.forEach(item => {
            content += `\n• ${item}\n`;
          });
        }
      });
      
      content += '\n\nThanks for everything you do to keep Nashville running.\n\n- Jason\n  Van Driver (currently #142 / #201)\n\nP.S. - The app works great as-is. This barcode thing is just the efficiency nerd in me seeing an obvious optimization. If it\'s not a priority right now, no worries - we\'ve got plenty of other features keeping drivers productive in the meantime.';
    }

    navigator.clipboard.writeText(content);
    setCopiedSection(type);
    toast({
      title: "Copied to Clipboard",
      description: "Document ready to paste into email or Word",
    });
    setTimeout(() => setCopiedSection(null), 2000);
  };

  const handleContact = (method: 'text' | 'call') => {
    if (method === 'text') {
      window.location.href = 'sms:+1234567890?body=Hi Jason, I wanted to reach out about Lot Ops Pro...';
    } else {
      window.location.href = 'tel:+1234567890';
    }
    toast({
      title: method === 'text' ? "Opening Messages..." : "Calling...",
      description: method === 'text' 
        ? "Text message ready - feel free to customize the message" 
        : "Phone app should open shortly",
    });
  };

  return (
    <div className="space-y-6">
      {/* Contact Section */}
      <Card className="bg-gradient-to-br from-blue-900/20 to-purple-900/20 border-blue-400/30">
        <CardHeader>
          <CardTitle className="text-white text-lg">Contact Jason</CardTitle>
          <p className="text-xs text-blue-200 mt-1">
            Questions, feedback, or want to discuss integration opportunities?
          </p>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <Button
              onClick={() => handleContact('text')}
              className="gap-2 bg-blue-600/30 hover:bg-blue-600/50 border border-blue-400/50"
              data-testid="button-contact-text"
            >
              <MessageSquare className="h-4 w-4" />
              Send Text Message
            </Button>
            <Button
              onClick={() => handleContact('call')}
              className="gap-2 bg-purple-600/30 hover:bg-purple-600/50 border border-purple-400/50"
              data-testid="button-contact-call"
            >
              <Phone className="h-4 w-4" />
              Call
            </Button>
          </div>
          <div className="bg-blue-900/30 border border-blue-400/30 rounded p-3">
            <p className="text-xs text-blue-100 leading-relaxed">
              <strong className="text-blue-200">Pro tip:</strong> If you call and I don't recognize your number, 
              I'm probably not going to answer (spam calls, you know how it is). Send a text first so I know 
              it's you - or better yet, do both at the same time. That way I'll definitely see you're trying 
              to reach me.
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Current Features Document */}
      <Card className="bg-white/5 border-white/20">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-white text-lg">
                Complete Feature List - Current Version
              </CardTitle>
              <p className="text-xs text-slate-400 mt-1">
                All operational features currently deployed in Lot Ops Pro
              </p>
            </div>
            <Button
              onClick={() => copyFullDocument('features')}
              variant="outline"
              size="sm"
              className="gap-2 border-white/30 text-white hover:bg-white/20"
              data-testid="button-copy-full-features"
            >
              {copiedSection === 'features' ? (
                <>
                  <CheckCircle className="h-4 w-4" />
                  Copied
                </>
              ) : (
                <>
                  <Copy className="h-4 w-4" />
                  Copy Full Document
                </>
              )}
            </Button>
          </div>
        </CardHeader>
        <CardContent className="space-y-2">
          {FEATURE_CATEGORIES.map((category, idx) => (
            <Collapsible
              key={idx}
              open={openSections[`feature-${idx}`]}
              onOpenChange={() => toggleSection(`feature-${idx}`)}
            >
              <CollapsibleTrigger asChild>
                <Button
                  variant="ghost"
                  className="w-full justify-between text-white hover:bg-white/10 p-3"
                  data-testid={`button-toggle-feature-${idx}`}
                >
                  <span className="font-medium">{category.title}</span>
                  <ChevronDown
                    className={`h-4 w-4 transition-transform ${
                      openSections[`feature-${idx}`] ? 'rotate-180' : ''
                    }`}
                  />
                </Button>
              </CollapsibleTrigger>
              <CollapsibleContent className="px-4 py-3 bg-slate-900/30 rounded-b border border-white/10">
                <ul className="space-y-2 text-sm text-slate-200">
                  {category.items.map((item, itemIdx) => (
                    <li key={itemIdx} className="flex gap-2">
                      <span className="text-blue-400 shrink-0">•</span>
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </CollapsibleContent>
            </Collapsible>
          ))}
        </CardContent>
      </Card>

      {/* Scaling Roadmap Document */}
      <Card className="bg-white/5 border-white/20">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-white text-lg">
                Scaling Roadmap & Business Case
              </CardTitle>
              <p className="text-xs text-slate-400 mt-1">
                Enterprise growth plan and expansion potential
              </p>
            </div>
            <Button
              onClick={() => copyFullDocument('roadmap')}
              variant="outline"
              size="sm"
              className="gap-2 border-white/30 text-white hover:bg-white/20"
              data-testid="button-copy-full-roadmap"
            >
              {copiedSection === 'roadmap' ? (
                <>
                  <CheckCircle className="h-4 w-4" />
                  Copied
                </>
              ) : (
                <>
                  <Copy className="h-4 w-4" />
                  Copy Full Document
                </>
              )}
            </Button>
          </div>
        </CardHeader>
        <CardContent className="space-y-2">
          {SCALING_ROADMAP.map((phase, idx) => (
            <Collapsible
              key={idx}
              open={openSections[`roadmap-${idx}`]}
              onOpenChange={() => toggleSection(`roadmap-${idx}`)}
            >
              <CollapsibleTrigger asChild>
                <Button
                  variant="ghost"
                  className="w-full justify-between text-white hover:bg-white/10 p-3"
                  data-testid={`button-toggle-roadmap-${idx}`}
                >
                  <span className="font-medium">{phase.title}</span>
                  <ChevronDown
                    className={`h-4 w-4 transition-transform ${
                      openSections[`roadmap-${idx}`] ? 'rotate-180' : ''
                    }`}
                  />
                </Button>
              </CollapsibleTrigger>
              <CollapsibleContent className="px-4 py-3 bg-slate-900/30 rounded-b border border-white/10">
                <ul className="space-y-2 text-sm text-slate-200">
                  {phase.items.map((item, itemIdx) => (
                    <li key={itemIdx} className="flex gap-2">
                      <span className="text-purple-400 shrink-0">•</span>
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </CollapsibleContent>
            </Collapsible>
          ))}
        </CardContent>
      </Card>

      {/* Manheim Integration Pitch Document */}
      <Card className="bg-gradient-to-br from-green-900/20 to-teal-900/20 border-green-400/30">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-white text-lg">
                Message to Manheim Leadership
              </CardTitle>
              <p className="text-xs text-green-200 mt-1">
                Personal barcode integration pitch from Jason - ready to send
              </p>
            </div>
            <Button
              onClick={() => copyFullDocument('pitch')}
              variant="outline"
              size="sm"
              className="gap-2 border-green-400/50 text-green-100 hover:bg-green-600/30"
              data-testid="button-copy-full-pitch"
            >
              {copiedSection === 'pitch' ? (
                <>
                  <CheckCircle className="h-4 w-4" />
                  Copied
                </>
              ) : (
                <>
                  <Copy className="h-4 w-4" />
                  Copy Full Document
                </>
              )}
            </Button>
          </div>
        </CardHeader>
        <CardContent className="space-y-2">
          {MANHEIM_PITCH_SECTIONS.map((section, idx) => (
            <Collapsible
              key={idx}
              open={openSections[`pitch-${idx}`]}
              onOpenChange={() => toggleSection(`pitch-${idx}`)}
            >
              <CollapsibleTrigger asChild>
                <Button
                  variant="ghost"
                  className="w-full justify-between text-white hover:bg-white/10 p-3"
                  data-testid={`button-toggle-pitch-${idx}`}
                >
                  <span className="font-medium">{section.title}</span>
                  <ChevronDown
                    className={`h-4 w-4 transition-transform ${
                      openSections[`pitch-${idx}`] ? 'rotate-180' : ''
                    }`}
                  />
                </Button>
              </CollapsibleTrigger>
              <CollapsibleContent className="px-4 py-3 bg-slate-900/30 rounded-b border border-white/10">
                {section.content && (
                  <p className="text-sm text-slate-200 whitespace-pre-line mb-3">
                    {section.content}
                  </p>
                )}
                {section.items && (
                  <ul className="space-y-2 text-sm text-slate-200">
                    {section.items.map((item, itemIdx) => (
                      <li key={itemIdx} className="flex gap-2">
                        <span className="text-green-400 shrink-0">•</span>
                        <span>{item}</span>
                      </li>
                    ))}
                  </ul>
                )}
              </CollapsibleContent>
            </Collapsible>
          ))}
          <div className="mt-3 bg-green-900/30 border border-green-400/30 rounded p-3">
            <p className="text-xs text-green-100 leading-relaxed">
              <strong className="text-green-200">How to use:</strong> Copy the full document and paste 
              into Outlook or Word. Written from your perspective - personal, data-driven, and focused 
              on helping leadership see the barcode integration opportunity. Ready to send to Teresa, 
              supervisors, or Nashville management.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
