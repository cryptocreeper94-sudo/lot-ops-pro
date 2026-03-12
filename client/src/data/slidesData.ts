// Lot Ops Pro - 38-Slide Presentation Data
// Based on SLIDESHOW_SPECIFICATION.md

export interface Slide {
  id: number;
  section: string;
  title: string;
  subtitle?: string;
  duration: number; // seconds for auto-play
  content: SlideContent;
}

export interface SlideContent {
  type: 'hero' | 'problem' | 'solution' | 'feature' | 'comparison' | 'cta' | 'closing';
  headline: string;
  subheadline?: string;
  bullets?: string[];
  features?: Array<{ icon: string; title: string; description: string }>;
  stats?: Array<{ value: string; label: string; trend?: string }>;
  comparison?: { left: string[]; right: string[] };
  note?: string;
  image?: string;
}

export const slidesData: Slide[] = [
  // SECTION 1: OPENING & HOOK (Slides 1-3)
  {
    id: 1,
    section: "Opening & Hook",
    title: "LOT OPS PRO",
    subtitle: "Autonomous Lot Management System",
    duration: 8,
    content: {
      type: 'hero',
      headline: "LOT OPS PRO",
      subheadline: "Transforming vehicle lot operations with mobile-first technology"
    }
  },
  {
    id: 2,
    section: "Opening & Hook",
    title: "The Problem",
    subtitle: "Traditional lot operations are broken",
    duration: 8,
    content: {
      type: 'problem',
      headline: "Manual Lot Operations Across Dealerships, Auctions, and Manufacturers",
      bullets: [
        "Manual handheld scanners requiring external database connections are unreliable and slow",
        "No performance tracking - supervisors cannot monitor driver productivity in real-time",
        "Inefficient routing - drivers waste time searching for vehicles and destinations",
        "Communication gaps - critical information delays between drivers and supervisors",
        "Safety concerns - no speed monitoring or incident reporting systems",
        "Data gaps - limited historical performance data for bonus calculations and accountability"
      ],
      stats: [
        { value: "$50,000-$150,000", label: "Annual cost to any facility in lost productivity" }
      ]
    }
  },
  {
    id: 3,
    section: "Opening & Hook",
    title: "The Solution",
    subtitle: "Complete Solution for Vehicle Lot Management",
    duration: 8,
    content: {
      type: 'solution',
      headline: "Lot Ops Pro: For Any Organization Managing Vehicle Inventory",
      features: [
        {
          icon: "✅",
          title: "Autonomous OCR Scanning",
          description: "Live camera-based ticket scanning, no external database dependency"
        },
        {
          icon: "✅",
          title: "Real-Time GPS Guidance",
          description: "Visual compass and distance countdown to every destination"
        },
        {
          icon: "✅",
          title: "Live Performance Analytics",
          description: "Moves Per Hour tracking against 4.5 MPH quota with instant alerts"
        },
        {
          icon: "✅",
          title: "Mobile-First Progressive Web App",
          description: "Works on any smartphone, zero hardware costs"
        },
        {
          icon: "✅",
          title: "Enterprise Security & Workflow",
          description: "Multi-tenant architecture, hallmark stamping, complete audit trails"
        }
      ]
    }
  },

  // SECTION 2: CORE FEATURES (Slides 4-15)
  {
    id: 4,
    section: "Core Features",
    title: "Secure, Simple Login",
    subtitle: "No Passwords",
    duration: 8,
    content: {
      type: 'feature',
      headline: "Secure, Simple Login - No Passwords",
      features: [
        {
          icon: "Lock",
          title: "Universal PIN System",
          description: "Simple 3-4 digit codes assigned by role (911=Safety, 1111=Inventory, 2222=Van Driver, 3333=Supervisor, 4444=Ops Manager)"
        },
        {
          icon: "Target",
          title: "Smart Role Detection",
          description: "System auto-routes to appropriate dashboard based on PIN"
        },
        {
          icon: "Shield",
          title: "Two-Factor for Drivers",
          description: "Drivers require PIN + daily access code for security"
        },
        {
          icon: "ClipboardList",
          title: "Daily Roster Validation",
          description: "NEW: Drivers not on roster are automatically rejected"
        },
        {
          icon: "Clock",
          title: "12-Hour Session Persistence",
          description: "Drivers stay logged in throughout entire shift"
        }
      ]
    }
  },
  {
    id: 5,
    section: "Core Features",
    title: "Autonomous OCR Scanning",
    subtitle: "No Scanners. No Database. Just Your Phone.",
    duration: 8,
    content: {
      type: 'feature',
      headline: "Autonomous OCR Scanning",
      subheadline: "No Scanners. No Database. Just Your Phone.",
      features: [
        {
          icon: "Camera",
          title: "Camera OCR",
          description: "Point camera at windshield VIN or work order ticket"
        },
        {
          icon: "Keyboard",
          title: "Text Entry",
          description: "Manually type VIN if needed"
        },
        {
          icon: "FileText",
          title: "Full Manual Form",
          description: "Complete vehicle details manually"
        }
      ],
      bullets: [
        "VIN extracted in <2 seconds using Tesseract.js",
        "Work order numbers automatically recognized",
        "Routing calculated instantly from VIN/group code",
        "Zero external database calls - completely autonomous"
      ]
    }
  },
  {
    id: 6,
    section: "Core Features",
    title: "Intelligent GPS Routing",
    subtitle: "Never Search. Always Know Where to Go.",
    duration: 8,
    content: {
      type: 'feature',
      headline: "Intelligent GPS Routing",
      subheadline: "Never Search. Always Know Where to Go.",
      bullets: [
        "Service zones → Routing areas (configurable by facility)",
        "Delivery areas → Designated zones (rotating assignments)",
        "Customer lots → Assigned sections (dealer, rental, fleet)",
        "Inspection areas → Staging zones (condition reports, processing)",
        "Processing centers → Target locations (custom workflows)"
      ],
      features: [
        {
          icon: "Compass",
          title: "Compass Visualization",
          description: "Real-time heading to destination"
        },
        {
          icon: "Ruler",
          title: "Distance Countdown",
          description: "'850 FT TO SPOT' updates live"
        },
        {
          icon: "BarChart",
          title: "Dynamic Progress Bar",
          description: "Visual representation of distance remaining"
        },
        {
          icon: "Map",
          title: "Interactive Facility Map",
          description: "Zoom 50-300%, pan to any lot"
        }
      ]
    }
  },
  {
    id: 7,
    section: "Core Features",
    title: "Live Performance Tracking",
    subtitle: "Accountability Meets Real-Time Data",
    duration: 8,
    content: {
      type: 'feature',
      headline: "Live Performance Tracking",
      subheadline: "Accountability Meets Real-Time Data",
      stats: [
        { value: "5.2 MPH", label: "Current", trend: "+16% vs target" },
        { value: "4.5 MPH", label: "Goal", trend: "" },
        { value: "37", label: "Moves Today", trend: "" },
        { value: "7.1", label: "Hours Worked", trend: "" },
        { value: "+$42", label: "Bonus Estimate", trend: "up" }
      ],
      features: [
        {
          icon: "BarChart",
          title: "MPH System",
          description: "Industry-standard Moves Per Hour productivity metric"
        },
        {
          icon: "AlertTriangle",
          title: "Alert System",
          description: "Red banner warning when falling behind quota"
        },
        {
          icon: "TrendingUp",
          title: "Historical Data",
          description: "Complete records for bonus calculations"
        }
      ]
    }
  },
  {
    id: 8,
    section: "Core Features",
    title: "Van Driver Mode",
    subtitle: "Elite Operations with Approval Workflow",
    duration: 8,
    content: {
      type: 'feature',
      headline: "Van Driver Mode - Elite Operations",
      subheadline: "Server-Backed Approval Workflow for Security",
      features: [
        {
          icon: "Users",
          title: "Crew Assignments",
          description: "Manage multiple inventory drivers simultaneously"
        },
        {
          icon: "Key",
          title: "Exotic Key Tracking",
          description: "Real-time accountability for high-value vehicles"
        },
        {
          icon: "Zap",
          title: "Priority Routing",
          description: "Advanced GPS waypoints for complex multi-stop routes"
        },
        {
          icon: "📍",
          title: "Equipment Checkout",
          description: "Track radios, keys, scanners with timestamp logging"
        }
      ],
      bullets: [
        "Permanent drivers request van mode access through app",
        "System automatically generates approval message to supervisors",
        "Supervisors approve/deny via API with one click",
        "Complete audit trail of all approvals maintained",
        "Temporary employees automatically blocked from van features"
      ]
    }
  },
  {
    id: 9,
    section: "Core Features",
    title: "Supervisor Command Center",
    subtitle: "Complete Operational Visibility & Control",
    duration: 8,
    content: {
      type: 'feature',
      headline: "Supervisor Command Center",
      subheadline: "Complete Operational Visibility & Control",
      features: [
        {
          icon: "📊",
          title: "Live Performance Metrics",
          description: "See every driver's MPH, moves, and current status"
        },
        {
          icon: "🗺️",
          title: "GPS Location Tracking",
          description: "Real-time map showing all active drivers"
        },
        {
          icon: "💬",
          title: "Two-Way Messaging",
          description: "Instant communication with drivers in the field"
        },
        {
          icon: "🔑",
          title: "Exotic Key Accountability",
          description: "Monitor all high-value vehicle key movements"
        },
        {
          icon: "✅",
          title: "Van Driver Approvals",
          description: "Authority to grant/revoke elevated permissions"
        },
        {
          icon: "📋",
          title: "Roster Management",
          description: "Control who can access the system each day"
        }
      ]
    }
  },
  {
    id: 10,
    section: "Core Features",
    title: "Operations Manager Dashboard",
    subtitle: "Full System Control & Analytics",
    duration: 8,
    content: {
      type: 'feature',
      headline: "Operations Manager Dashboard",
      subheadline: "Full System Control & Analytics",
      features: [
        {
          icon: "📅",
          title: "Shift Management",
          description: "Create daily rosters, assign drivers to shifts"
        },
        {
          icon: "📊",
          title: "Performance Reports",
          description: "Weekly/monthly analytics, export capabilities"
        },
        {
          icon: "🔧",
          title: "Equipment Logging",
          description: "Track all radios, keys, and devices"
        },
        {
          icon: "👥",
          title: "Employee Management",
          description: "Add/remove drivers, assign roles and permissions"
        },
        {
          icon: "🏢",
          title: "Facility Configuration",
          description: "Manage lot numbers, lanes, parking areas"
        },
        {
          icon: "📈",
          title: "Business Intelligence",
          description: "ROI tracking, cost savings, efficiency gains"
        }
      ]
    }
  },
  {
    id: 11,
    section: "Core Features",
    title: "Safety & Compliance",
    subtitle: "Comprehensive Safety Management",
    duration: 8,
    content: {
      type: 'feature',
      headline: "Safety & Compliance",
      subheadline: "Comprehensive Safety Management",
      features: [
        {
          icon: "🚨",
          title: "Incident Reporting",
          description: "Photo/video capture, GPS location, timestamp"
        },
        {
          icon: "📸",
          title: "Evidence Collection",
          description: "Multiple photos per incident, automatic metadata"
        },
        {
          icon: "🎓",
          title: "Safety Training",
          description: "Topic library, tracking, certification management"
        },
        {
          icon: "🚗",
          title: "Speed Monitoring",
          description: "GPS-based speed tracking, alerts for violations"
        },
        {
          icon: "📋",
          title: "Compliance Reports",
          description: "Automated OSHA/DOT documentation"
        }
      ]
    }
  },
  {
    id: 12,
    section: "Core Features",
    title: "Real-Time Messaging",
    subtitle: "Instant Communication Across All Roles",
    duration: 8,
    content: {
      type: 'feature',
      headline: "Real-Time Messaging",
      subheadline: "Instant Communication Across All Roles",
      features: [
        {
          icon: "💬",
          title: "Driver ↔ Supervisor",
          description: "Two-way chat for field questions and updates"
        },
        {
          icon: "🚐",
          title: "Van Driver Communications",
          description: "Coordinate crew assignments and equipment"
        },
        {
          icon: "📱",
          title: "Push Notifications",
          description: "Real-time alerts for new messages"
        },
        {
          icon: "📊",
          title: "Message History",
          description: "Complete audit trail of all communications"
        },
        {
          icon: "🔔",
          title: "Priority Alerts",
          description: "Flag urgent messages for immediate attention"
        }
      ]
    }
  },
  {
    id: 13,
    section: "Core Features",
    title: "Event Staging & Logistics",
    subtitle: "High-Volume Operations Support",
    duration: 8,
    content: {
      type: 'feature',
      headline: "Event Staging & Logistics Operations",
      subheadline: "Coordinate High-Volume Vehicle Flow",
      features: [
        {
          icon: "🏟️",
          title: "Staging Queue Management",
          description: "Track vehicles in staging areas (auctions, deliveries, transfers)"
        },
        {
          icon: "🎯",
          title: "Event Sequence Integration",
          description: "Sync with auction run lists, delivery schedules, or processing workflows"
        },
        {
          icon: "🚚",
          title: "Post-Event Routing",
          description: "Immediate destination assignment after sale, inspection, or delivery"
        },
        {
          icon: "⏱️",
          title: "Timing Coordination",
          description: "Ensure vehicles arrive precisely when needed"
        },
        {
          icon: "📊",
          title: "Live Statistics",
          description: "Monitor throughput, delays, and bottlenecks"
        }
      ]
    }
  },
  {
    id: 14,
    section: "Core Features",
    title: "Mobile-First Design",
    subtitle: "Built for Drivers in the Field",
    duration: 8,
    content: {
      type: 'feature',
      headline: "Mobile-First Design",
      subheadline: "Optimized for Single-Hand Operation",
      features: [
        {
          icon: "📱",
          title: "Touch-Optimized UI",
          description: "Large buttons, easy navigation while driving"
        },
        {
          icon: "🌞",
          title: "Sunlight Readability",
          description: "High-contrast displays work in bright outdoor conditions"
        },
        {
          icon: "🔋",
          title: "Battery Efficient",
          description: "Optimized to last full 8-12 hour shifts"
        },
        {
          icon: "📶",
          title: "Offline Capability",
          description: "Core features work without internet connection"
        },
        {
          icon: "🎨",
          title: "Intuitive Interface",
          description: "Minimal training required, instant productivity"
        }
      ]
    }
  },
  {
    id: 15,
    section: "Core Features",
    title: "Developer Dashboard",
    subtitle: "Complete System Control",
    duration: 8,
    content: {
      type: 'feature',
      headline: "Developer Dashboard - Complete System Control",
      subheadline: "Enterprise Configuration & Analytics",
      features: [
        {
          icon: "🏢",
          title: "Lot Configuration",
          description: "Manage hundreds of lot numbers with capacities"
        },
        {
          icon: "💳",
          title: "Payment Integration",
          description: "Stripe subscription management"
        },
        {
          icon: "📊",
          title: "System Health",
          description: "Real-time performance tracking"
        },
        {
          icon: "🏷️",
          title: "Hallmark Tracking",
          description: "Complete asset audit trail and stamping"
        },
        {
          icon: "📈",
          title: "Business Analytics",
          description: "Executive summaries, ROI calculators"
        }
      ]
    }
  },

  // SECTION 3: ADVANCED FEATURES (Slides 16-22)
  {
    id: 16,
    section: "Advanced Features",
    title: "Weather Intelligence",
    subtitle: "Real-Time Weather Tracking & Analytics",
    duration: 8,
    content: {
      type: 'feature',
      headline: "Weather Intelligence",
      subheadline: "Performance Tracking with Weather Context",
      features: [
        {
          icon: "🌡️",
          title: "Live Conditions",
          description: "Real-time temperature, humidity, and conditions for any location"
        },
        {
          icon: "📡",
          title: "Animated Radar",
          description: "RainViewer integration with playback controls for storm tracking"
        },
        {
          icon: "📊",
          title: "Shift Weather Logs",
          description: "Every shift logged with weather data for performance analysis"
        },
        {
          icon: "🎯",
          title: "Location-Based",
          description: "Weather syncs to zip code - works at any facility"
        },
        {
          icon: "⚡",
          title: "Severe Weather Alerts",
          description: "Instant notifications for dangerous conditions"
        }
      ]
    }
  },
  {
    id: 17,
    section: "Advanced Features",
    title: "Lot Buddy Mascot Guide",
    subtitle: "AI-Powered Interactive Assistant",
    duration: 8,
    content: {
      type: 'feature',
      headline: "Lot Buddy - Your Personal Guide",
      subheadline: "AI-Powered Adaptive Assistance",
      features: [
        {
          icon: "🤖",
          title: "41 Unique Avatars",
          description: "Choose your perfect buddy from our diverse 3D avatar gallery"
        },
        {
          icon: "✏️",
          title: "Custom Naming",
          description: "Name your Lot Buddy anything you want - it remembers!"
        },
        {
          icon: "🗣️",
          title: "Voice Synthesis",
          description: "Lot Buddy speaks to you with configurable voice settings"
        },
        {
          icon: "🧠",
          title: "Adaptive Personality",
          description: "AI learns your communication style and mirrors it"
        },
        {
          icon: "📖",
          title: "Contextual Help",
          description: "Page-specific tutorials and tips based on your role"
        }
      ]
    }
  },
  {
    id: 18,
    section: "Advanced Features",
    title: "Hands-Free Compliance",
    subtitle: "Safety Policy Enforcement",
    duration: 8,
    content: {
      type: 'feature',
      headline: "Hands-Free Compliance System",
      subheadline: "Daily Safety Acknowledgment & Reporting",
      features: [
        {
          icon: "✋",
          title: "Daily Acknowledgment",
          description: "Drivers must confirm hands-free policy before each shift"
        },
        {
          icon: "📋",
          title: "Compliance Logging",
          description: "Every acknowledgment logged with timestamp for audits"
        },
        {
          icon: "📊",
          title: "Manager Reports",
          description: "View which drivers have acknowledged for any given day"
        },
        {
          icon: "🔒",
          title: "Unique Constraint",
          description: "One acknowledgment per driver per day - no duplicates"
        },
        {
          icon: "⚖️",
          title: "Legal Protection",
          description: "Documentation supports safety compliance requirements"
        }
      ]
    }
  },
  {
    id: 19,
    section: "Advanced Features",
    title: "Hallmark Stamping & Asset Tracking",
    subtitle: "Enterprise-Grade Audit & Accountability",
    duration: 8,
    content: {
      type: 'feature',
      headline: "Hallmark Stamping & Asset Tracking",
      subheadline: "Enterprise-Grade Audit & Accountability",
      features: [
        {
          icon: "🏷️",
          title: "Auto-Stamping",
          description: "Every asset auto-stamped on creation with 'Lot Ops Pro' hallmark"
        },
        {
          icon: "📝",
          title: "Action Logging",
          description: "Created, assigned, transferred, modified - all tracked"
        },
        {
          icon: "👤",
          title: "User Attribution",
          description: "Performed by (user ID and name) for accountability"
        },
        {
          icon: "⏰",
          title: "Timestamp & Location",
          description: "IP address, user agent, exact time"
        },
        {
          icon: "🔐",
          title: "Immutable History",
          description: "Cannot be deleted or modified, compliance ready"
        }
      ]
    }
  },
  {
    id: 20,
    section: "Advanced Features",
    title: "Daily Roster Management",
    subtitle: "Complete Access Control & Shift Scheduling",
    duration: 8,
    content: {
      type: 'feature',
      headline: "Daily Roster Management",
      subheadline: "Complete Access Control & Shift Scheduling",
      bullets: [
        "Operations Manager creates daily roster for each shift",
        "Drivers enter 3-digit PIN first",
        "System checks if driver is on today's roster",
        "If NOT on roster → Login rejected with clear message",
        "If on roster → 6-digit shift code revealed",
        "Shift code validation → Login successful"
      ],
      features: [
        {
          icon: "✅",
          title: "Shift Code Gating",
          description: "6-digit code hidden until driver verified"
        },
        {
          icon: "🔒",
          title: "Temporary Restrictions",
          description: "Auto-detected via scanner, blocked from van/exotic features"
        },
        {
          icon: "📋",
          title: "Complete Audit",
          description: "Full log of roster creation, modifications, login attempts"
        }
      ]
    }
  },
  {
    id: 21,
    section: "Advanced Features",
    title: "Van Driver Approval Workflow",
    subtitle: "Server-Backed Authorization System",
    duration: 8,
    content: {
      type: 'feature',
      headline: "Van Driver Approval Workflow",
      subheadline: "Server-Backed Authorization System",
      bullets: [
        "Step 1: Driver Request - Permanent driver submits request for van mode access",
        "Step 2: Auto-Message - System automatically generates approval message to supervisors",
        "Step 3: Supervisor Review - Supervisors see pending requests with driver details",
        "Step 4: One-Click Approval - Approve/deny via API endpoint with full audit trail",
        "Step 5: Notification - Driver receives instant notification of decision"
      ],
      features: [
        {
          icon: "🔐",
          title: "Security",
          description: "Only permanent employees can request access, temporary blocked"
        },
        {
          icon: "📊",
          title: "Audit Trail",
          description: "All requests logged with timestamp, IP, and user details"
        }
      ]
    }
  },
  {
    id: 22,
    section: "Advanced Features",
    title: "Equipment Checkout Logging",
    subtitle: "Complete Accountability & Loss Prevention",
    duration: 8,
    content: {
      type: 'feature',
      headline: "Equipment Checkout Logging",
      subheadline: "Complete Accountability & Loss Prevention",
      features: [
        {
          icon: "📻",
          title: "Radios & Communication",
          description: "Track all portable communication equipment"
        },
        {
          icon: "🔑",
          title: "Vehicle Keys",
          description: "Both exotic and standard vehicle key accountability"
        },
        {
          icon: "📱",
          title: "Handheld Devices",
          description: "Any mobile technology"
        },
        {
          icon: "🔦",
          title: "Safety Equipment",
          description: "Vests, flashlights, first aid kits"
        },
        {
          icon: "⏰",
          title: "Timestamp Tracking",
          description: "Exact check-out/check-in times"
        },
        {
          icon: "🚨",
          title: "Overdue Alerts",
          description: "Automatic reminders for unreturned equipment"
        }
      ]
    }
  },
  {
    id: 23,
    section: "Advanced Features",
    title: "Exotic Car Key Tracking",
    subtitle: "High-Value Vehicle Accountability",
    duration: 8,
    content: {
      type: 'feature',
      headline: "Exotic Car Key Tracking",
      subheadline: "High-Value Vehicle Accountability",
      bullets: [
        "Step 1: Inventory Driver - Confirms key handoff to van driver (driver ID, timestamp)",
        "Step 2: Van Driver - Acknowledges receipt of exotic vehicle keys (confirmation timestamp)",
        "Step 3: Patrol/Supervisor - Verifies final key security and location (verification timestamp)"
      ],
      features: [
        {
          icon: "🔍",
          title: "Real-Time Status",
          description: "See all exotic keys in transit"
        },
        {
          icon: "📊",
          title: "Dashboard Access",
          description: "Monitor all exotic key movements"
        },
        {
          icon: "📝",
          title: "Complete Audit",
          description: "Every handoff logged permanently"
        },
        {
          icon: "🚗",
          title: "VIN Details",
          description: "Full vehicle information attached to each key"
        }
      ]
    }
  },

  // SECTION 4: TECHNICAL EXCELLENCE (Slides 24-26)
  {
    id: 24,
    section: "Technical Excellence",
    title: "OCR Technology",
    subtitle: "Eliminate Hardware Costs Completely",
    duration: 8,
    content: {
      type: 'comparison',
      headline: "OCR Technology - Eliminate Hardware Costs",
      subheadline: "Tesseract.js Replaces $1,200 Scanners",
      bullets: [
        "VIN Extraction Speed - <2 seconds from camera to text",
        "Accuracy Rate - 95%+ on clear VINs, 85%+ on dirty windshields",
        "Offline Capability - No internet required for OCR processing",
        "Universal Compatibility - Works on any smartphone with camera"
      ],
      stats: [
        { value: "$1,200", label: "Traditional Scanner Cost" },
        { value: "$900/yr", label: "Connectivity Fees" },
        { value: "$0", label: "Lot Ops Pro Cost" },
        { value: "$2,100", label: "Savings Per Driver/Year" },
        { value: "$63,000", label: "30-Driver Facility Savings" }
      ]
    }
  },
  {
    id: 25,
    section: "Technical Excellence",
    title: "Multi-Tenant Architecture",
    subtitle: "Enterprise Security & White-Label Ready",
    duration: 8,
    content: {
      type: 'feature',
      headline: "Multi-Tenant Architecture",
      subheadline: "Enterprise Security & White-Label Ready",
      features: [
        {
          icon: "🏢",
          title: "Complete Data Isolation",
          description: "Each customer = separate database. No shared data, ever."
        },
        {
          icon: "🔐",
          title: "Zero Cross-Tenant Access",
          description: "Messages, vehicles, employees never mix"
        },
        {
          icon: "🎨",
          title: "Custom Hallmark Branding",
          description: "Each customer can brand their assets"
        },
        {
          icon: "📊",
          title: "Independent Analytics",
          description: "Performance data stays private"
        }
      ],
      bullets: [
        "Tier 1: Lot Ops Pro Internal - First deployment facility operations",
        "Tier 2: Franchisee Deployment - Own database, manage their own support",
        "Tier 3: Monthly Subscriber - Managed database, Lot Ops Pro handles maintenance"
      ]
    }
  },
  {
    id: 26,
    section: "Technical Excellence",
    title: "Progressive Web App (PWA)",
    subtitle: "Modern Technology, Zero Installation",
    duration: 8,
    content: {
      type: 'feature',
      headline: "Progressive Web App (PWA)",
      subheadline: "Modern Technology, Zero Installation",
      features: [
        {
          icon: "✅",
          title: "No App Store Approval",
          description: "Deploy updates instantly"
        },
        {
          icon: "✅",
          title: "Automatic Updates",
          description: "Users always on latest version"
        },
        {
          icon: "✅",
          title: "Cross-Platform",
          description: "Same code, iOS and Android"
        },
        {
          icon: "✅",
          title: "Add to Home Screen",
          description: "Feels like native app"
        },
        {
          icon: "✅",
          title: "Offline Capability",
          description: "Core features work without internet"
        }
      ],
      bullets: [
        "Frontend: React 18 + TypeScript + Vite",
        "UI: Tailwind CSS v4 + shadcn/ui + Radix UI",
        "Backend: Express.js + Node.js",
        "Database: PostgreSQL (Neon serverless)",
        "OCR: Tesseract.js"
      ]
    }
  },

  // SECTION 5: FUTURE VISION (Slides 27-30)
  {
    id: 27,
    section: "Future Vision",
    title: "AI-Powered Features",
    subtitle: "Coming in Version 2.0",
    duration: 8,
    content: {
      type: 'feature',
      headline: "AI-Powered Features (Version 2.0 Roadmap)",
      subheadline: "Intelligent Automation for Maximum Efficiency",
      features: [
        {
          icon: "🤖",
          title: "Smart Route Optimization",
          description: "AI suggests most efficient pickup/dropoff sequences"
        },
        {
          icon: "📊",
          title: "Predictive Analytics",
          description: "Forecast busy periods, recommend staffing levels"
        },
        {
          icon: "🎯",
          title: "Intelligent Assignment",
          description: "Auto-assign drivers to vehicles based on performance and location"
        },
        {
          icon: "📸",
          title: "Computer Vision",
          description: "Auto-detect vehicle damage from photos, classify severity"
        },
        {
          icon: "💬",
          title: "Natural Language Chat",
          description: "Ask questions in plain English: 'Where is VIN 12345?'"
        }
      ]
    }
  },
  {
    id: 28,
    section: "Future Vision",
    title: "White-Label Licensing",
    subtitle: "Your Brand, Our Technology",
    duration: 8,
    content: {
      type: 'feature',
      headline: "White-Label Licensing",
      subheadline: "Your Brand, Our Technology",
      features: [
        {
          icon: "🎨",
          title: "Custom Branding",
          description: "Your logo, colors, company name throughout app"
        },
        {
          icon: "🌐",
          title: "Custom Domain",
          description: "yourcompany.com instead of lotopspro.io"
        },
        {
          icon: "🏢",
          title: "Multi-Facility Support",
          description: "Manage multiple locations under one account"
        },
        {
          icon: "⚙️",
          title: "Custom Workflows",
          description: "Tailor features to your specific processes"
        },
        {
          icon: "🔌",
          title: "API Access",
          description: "Integrate with your existing systems"
        }
      ],
      bullets: [
        "Target Markets: Auto auctions • Car dealerships • Vehicle manufacturers",
        "Rental car companies • Fleet management • Any lot inventory operation",
        "Reseller Program: Earn recurring revenue selling to other facilities",
        "Franchisee Model: Get your own deployment, you manage support",
        "Enterprise License: Complete source code access"
      ]
    }
  },
  {
    id: 29,
    section: "Future Vision",
    title: "Multi-Facility Management",
    subtitle: "Scale Across Locations",
    duration: 8,
    content: {
      type: 'feature',
      headline: "Multi-Facility Management",
      subheadline: "Manage Multiple Locations from One Dashboard",
      features: [
        {
          icon: "🗺️",
          title: "Central Dashboard",
          description: "View performance across all facilities at once"
        },
        {
          icon: "📊",
          title: "Comparative Analytics",
          description: "Benchmark facilities against each other"
        },
        {
          icon: "👥",
          title: "Shared Resources",
          description: "Move drivers between facilities as needed"
        },
        {
          icon: "🏢",
          title: "Location-Specific Config",
          description: "Each facility maintains its own lot numbering"
        },
        {
          icon: "📈",
          title: "Aggregate Reporting",
          description: "Executive-level insights across entire operation"
        }
      ]
    }
  },
  {
    id: 30,
    section: "Future Vision",
    title: "Integration Ecosystem",
    subtitle: "Connect with Your Existing Tools",
    duration: 8,
    content: {
      type: 'feature',
      headline: "Integration Ecosystem",
      subheadline: "Seamless Connections with Your Tools",
      features: [
        {
          icon: "🚗",
          title: "Industry Software Platforms",
          description: "Sync with auction platforms, DMS systems, dealer management tools, run lists"
        },
        {
          icon: "💼",
          title: "Fleet & Inventory Management",
          description: "Connect to existing inventory systems (Reynolds & Reynolds, CDK, DealerSocket)"
        },
        {
          icon: "📊",
          title: "Business Intelligence",
          description: "Export to Tableau, Power BI, Google Data Studio"
        },
        {
          icon: "💰",
          title: "Accounting Systems",
          description: "QuickBooks/Xero integration for payroll"
        },
        {
          icon: "📧",
          title: "Communication",
          description: "Slack/Teams notifications for critical events"
        }
      ]
    }
  },

  // SECTION 6: BUSINESS CASE (Slides 31-35)
  {
    id: 31,
    section: "Business Case",
    title: "ROI Calculator",
    subtitle: "See Your Exact Savings",
    duration: 8,
    content: {
      type: 'feature',
      headline: "ROI Calculator - See Your Exact Savings",
      subheadline: "Customize Based on Your Facility Size",
      features: [
        {
          icon: "👥",
          title: "Driver Count",
          description: "Scale calculations to your team size"
        },
        {
          icon: "💰",
          title: "Current Costs",
          description: "Input your existing scanner and connectivity expenses"
        },
        {
          icon: "📊",
          title: "Efficiency Gains",
          description: "Estimate productivity improvements from GPS routing"
        },
        {
          icon: "🚗",
          title: "Damage Reduction",
          description: "Calculate savings from speed monitoring and safety features"
        },
        {
          icon: "📈",
          title: "Projected Savings",
          description: "See Year 1, Year 2, and 5-year total ROI"
        }
      ],
      stats: [
        { value: "3-6 months", label: "Typical Payback Period" },
        { value: "$150,000", label: "Avg Annual Savings (30 drivers)" },
        { value: "400%", label: "5-Year ROI" }
      ]
    }
  },
  {
    id: 32,
    section: "Business Case",
    title: "Pricing Tiers",
    subtitle: "Flexible Plans for Every Scale",
    duration: 8,
    content: {
      type: 'feature',
      headline: "Pricing Tiers - Flexible Plans for Every Scale",
      features: [
        {
          icon: "🚀",
          title: "Pilot Program (1-10 drivers)",
          description: "$499/month - Perfect for testing at single facility"
        },
        {
          icon: "🏢",
          title: "Regional Deployment (11-50 drivers)",
          description: "$1,499/month - Best for medium-sized operations"
        },
        {
          icon: "🌍",
          title: "National Enterprise (51+ drivers)",
          description: "Custom Pricing - Multi-facility, white-label, dedicated support"
        }
      ],
      bullets: [
        "All tiers include: Unlimited scans, GPS routing, performance tracking, messaging",
        "No hardware costs - works on existing smartphones",
        "No per-user fees - flat monthly rate",
        "Cancel anytime - no long-term contracts required"
      ]
    }
  },
  {
    id: 33,
    section: "Business Case",
    title: "Annual Cost Savings",
    subtitle: "Where the Money Goes Back in Your Pocket",
    duration: 8,
    content: {
      type: 'feature',
      headline: "Annual Cost Savings Breakdown",
      subheadline: "30-Driver Facility Example",
      stats: [
        { value: "$63,000", label: "Hardware Elimination" },
        { value: "$45,000", label: "Productivity Gains (15%)" },
        { value: "$18,000", label: "Reduced Vehicle Damage" },
        { value: "$27,000", label: "Labor Optimization" },
        { value: "$153,000", label: "TOTAL ANNUAL SAVINGS" }
      ]
    }
  },
  {
    id: 34,
    section: "Business Case",
    title: "Success Metrics",
    subtitle: "Proven at Major Facilities",
    duration: 8,
    content: {
      type: 'feature',
      headline: "Success Metrics",
      subheadline: "Proven at Major Facilities",
      stats: [
        { value: "5.2 MPH", label: "Avg Driver Performance", trend: "+16% vs 4.5 target" },
        { value: "1,200+", label: "Daily Vehicle Moves", trend: "+22% output" },
        { value: "$0", label: "Hardware Investment", trend: "" },
        { value: "99.8%", label: "System Uptime", trend: "" },
        { value: "94%", label: "Driver Satisfaction", trend: "" },
        { value: "100%", label: "Incident Reporting Compliance", trend: "" }
      ]
    }
  },
  {
    id: 35,
    section: "Business Case",
    title: "Competitive Advantage",
    subtitle: "Why Lot Ops Pro Wins",
    duration: 8,
    content: {
      type: 'comparison',
      headline: "Competitive Advantage",
      subheadline: "Why Lot Ops Pro Wins",
      comparison: {
        left: [
          "❌ Hardware required",
          "❌ $2,100/driver cost",
          "❌ Manual routing",
          "❌ Paper logs",
          "❌ Limited analytics",
          "❌ Single location",
          "❌ No customization",
          "❌ Slow updates"
        ],
        right: [
          "✅ Zero hardware",
          "✅ Included in subscription",
          "✅ GPS guidance",
          "✅ Digital audit trails",
          "✅ Real-time data",
          "✅ Multi-facility ready",
          "✅ White-label licensing",
          "✅ Instant PWA updates"
        ]
      },
      note: "The choice is clear."
    }
  },

  // SECTION 7: CALL TO ACTION (Slides 36-38)
  {
    id: 36,
    section: "Call to Action",
    title: "Try the Live Demo",
    subtitle: "Experience Lot Ops Pro Right Now",
    duration: 8,
    content: {
      type: 'cta',
      headline: "Try the Live Demo",
      subheadline: "Experience Lot Ops Pro Right Now - No Signup Required",
      features: [
        {
          icon: "👤",
          title: "Inventory Driver (PIN: 1111)",
          description: "Scanner, GPS routing, performance tracking"
        },
        {
          icon: "🚐",
          title: "Van Driver (PIN: 2222)",
          description: "Crew management, equipment checkout"
        },
        {
          icon: "👔",
          title: "Supervisor (PIN: 3333)",
          description: "Resource allocation, exotic keys, messaging"
        },
        {
          icon: "🏢",
          title: "Operations Manager (PIN: 4444)",
          description: "Full dashboard, shift management"
        },
        {
          icon: "💻",
          title: "Developer (PIN: 0424)",
          description: "System configuration, hallmark tracking"
        }
      ],
      bullets: [
        "No signup required • Instant access",
        "Fully interactive • Real app experience",
        "darkwavestudios.io/demo"
      ]
    }
  },
  {
    id: 37,
    section: "Call to Action",
    title: "Request Enterprise Demo",
    subtitle: "See Lot Ops Pro Customized for Your Facility",
    duration: 8,
    content: {
      type: 'cta',
      headline: "Request Enterprise Demo",
      subheadline: "See Lot Ops Pro Customized for Your Facility",
      features: [
        {
          icon: "📋",
          title: "Custom Facility Walkthrough",
          description: "We configure the demo with your lot numbering system"
        },
        {
          icon: "📊",
          title: "ROI Analysis",
          description: "Calculate exact savings based on your current operations"
        },
        {
          icon: "🎨",
          title: "White-Label Preview",
          description: "See the app with your company branding"
        },
        {
          icon: "💬",
          title: "Q&A with Product Team",
          description: "Direct access to developers and operations experts"
        },
        {
          icon: "📈",
          title: "Integration Planning",
          description: "Discuss connections to your existing systems"
        }
      ],
      bullets: [
        "📧 enterprise@darkwavestudios.io",
        "📞 Schedule: calendly.com/lotopspro",
        "30-minute consultation • No obligation"
      ]
    }
  },
  {
    id: 38,
    section: "Call to Action",
    title: "Ready to Transform?",
    subtitle: "Contact Dark Wave Studios",
    duration: 8,
    content: {
      type: 'closing',
      headline: "Ready to Transform Your Operations?",
      subheadline: "Lot Ops Pro - Autonomous Lot Management System",
      bullets: [
        "🌐 darkwavestudios.io",
        "📧 hello@darkwavestudios.io",
        "💼 enterprise@darkwavestudios.io",
        "",
        "Built by Dark Wave Studios",
        "Enterprise Software Solutions",
        "",
        "Thank you for your time.",
        "Questions?"
      ]
    }
  }
];
