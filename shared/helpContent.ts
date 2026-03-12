import { ReactNode } from "react";

export interface HelpStep {
  title: string;
  description: string;
  icon?: string;
  keywords: string[];
  steps?: string[];
  tips?: string[];
}

export interface HelpCategory {
  id: string;
  title: string;
  icon: string;
  topics: HelpTopic[];
}

export interface HelpTopic {
  id: string;
  title: string;
  description: string;
  keywords: string[];
  content: HelpStep[];
  role: "van_driver" | "inventory_driver" | "supervisor" | "operations_manager" | "all";
}

export const helpCategories: HelpCategory[] = [
  {
    id: "getting_started",
    title: "Getting Started",
    icon: "Rocket",
    topics: [
      {
        id: "van_driver_welcome",
        title: "Van Driver: Welcome & Setup",
        description: "Your autonomous routing and performance tracking system",
        keywords: ["van driver", "getting started", "welcome", "setup", "first time", "intro"],
        role: "van_driver",
        content: [
          {
            title: "Smart Scanner",
            description: "Point your camera at any car sticker to instantly read VIN, work order, routing codes, and destination. No typing needed!",
            icon: "Camera",
            keywords: ["scan", "camera", "ocr", "vin", "sticker", "barcode"],
            tips: ["Start each shift in Crew Manager - select your van and crew members"]
          },
          {
            title: "GPS Navigation",
            description: "Get turn-by-turn guidance to vehicle pickup locations and drop-off zones. Real-time distance countdown to destination.",
            icon: "Navigation",
            keywords: ["gps", "navigation", "directions", "routing", "waypoint", "location"],
          },
          {
            title: "Performance Tracking",
            description: "Monitor your moves per hour (4.5 MPH target), quota progress, and bonus earnings. Weekly and monthly stats keep you informed.",
            icon: "TrendingUp",
            keywords: ["performance", "mph", "quota", "stats", "bonus", "tracking"],
          },
          {
            title: "Work Orders",
            description: "View assigned work orders from supervisors. Scan cars to mark items complete and track your progress in real-time.",
            icon: "ClipboardList",
            keywords: ["work order", "task", "assignment", "crunch mode", "non-quota"],
            tips: ["Use Bulk Move for quota work, EV Ops for electric vehicles, Crunch Mode for non-quota tasks"]
          }
        ]
      },
      {
        id: "inventory_driver_welcome",
        title: "Inventory Driver: Welcome & Setup",
        description: "Your powerful car scanning and lookup system",
        keywords: ["inventory driver", "getting started", "welcome", "setup", "first time"],
        role: "inventory_driver",
        content: [
          {
            title: "Smart Scanner",
            description: "Scan any sticker on any car - Work Order tags, Routing stickers, or Sale Lane labels. OCR reads all printed text automatically.",
            icon: "Camera",
            keywords: ["scan", "camera", "ocr", "sticker", "work order", "routing"],
            tips: ["System works offline - scans process on your phone, sync when connected"]
          },
          {
            title: "Vehicle Lookup",
            description: "Search by VIN to instantly see vehicle details, current location, next destination, work order info, and sale week/lane.",
            icon: "Search",
            keywords: ["lookup", "search", "vin", "find", "locate", "vehicle"],
            tips: ["Scan routing stickers to see where cars go next (DSC→257, REG→227, etc.)"]
          },
          {
            title: "Location Tracking",
            description: "Every scan updates the vehicle's GPS location and movement history. Find cars easily with stored coordinates.",
            icon: "MapPin",
            keywords: ["location", "gps", "tracking", "history", "coordinates"],
          },
          {
            title: "Pickup Requests",
            description: "Send pickup requests to van drivers when cars need to be moved. Real-time status updates keep everyone coordinated.",
            icon: "Truck",
            keywords: ["pickup", "request", "van driver", "move", "coordinate"],
            tips: ["Sale Lane stickers show week (1-52) and lane assignments for auction day"]
          }
        ]
      },
      {
        id: "supervisor_welcome",
        title: "Supervisor: Command Center Setup",
        description: "Complete overview of Lot Ops Pro management tools",
        keywords: ["supervisor", "getting started", "welcome", "setup", "command center"],
        role: "supervisor",
        content: [
          {
            title: "Dashboard Overview",
            description: "Three main sections: Config & Roster (assign teams), Dispatch (live tracking), Scanner (create work orders), Analytics (performance reports)",
            icon: "BarChart3",
            keywords: ["dashboard", "overview", "tabs", "navigation", "sections"],
            steps: [
              "Config & Roster Tab - Assign your team to vans. Set shifts. Manage today's crew structure.",
              "Dispatch Tab - See LIVE where every driver is. Watch moves happen in real-time on the map.",
              "Scanner Tab - Point camera at car stickers. Auto-read VIN. Create work orders instantly.",
              "Analytics Tab - View performance reports, quotas, efficiency. AI-powered insights for improvements."
            ]
          },
          {
            title: "Create Work Orders",
            description: "Use the smart scanner to photograph car stickers and auto-create work orders. Assign them to drivers and track completion in real-time.",
            icon: "ClipboardList",
            keywords: ["work order", "create", "assign", "scan", "task"],
            tips: ["The system tracks all metrics automatically - moves per hour, completion rates, downtime"]
          },
          {
            title: "Monitor Driver Activity",
            description: "View all active drivers, their current status, and location. GPS tracking shows exactly where drivers are during non-quota work.",
            icon: "Users",
            keywords: ["monitor", "drivers", "tracking", "status", "location", "dispatch"],
            tips: ["Use the messaging system to communicate with drivers instantly"]
          },
          {
            title: "Analytics Dashboard",
            description: "Access professional reports with charts, trends, and AI-powered insights. Export to CSV/Excel or generate PDF reports for meetings.",
            icon: "BarChart3",
            keywords: ["analytics", "reports", "performance", "charts", "export", "pdf"],
            tips: ["AI insights provide actionable recommendations for improving operations"]
          }
        ]
      },
      {
        id: "operations_manager_welcome",
        title: "Operations Manager: Full System Control",
        description: "Highest level of access and oversight",
        keywords: ["operations manager", "getting started", "welcome", "setup", "admin"],
        role: "operations_manager",
        content: [
          {
            title: "Dashboard Overview",
            description: "Five main sections: Overview (system status), Shift Instructions (daily comms), Email System (company-wide), PIN Management (access control), Full Analytics (all data)",
            icon: "Crown",
            keywords: ["dashboard", "overview", "admin", "sections", "control"],
            steps: [
              "Overview - System status, key metrics, alerts, and daily summary",
              "Shift Instructions - Send daily instructions to Supervisor. Set priorities and expectations",
              "Email System - Send company-wide emails to all staff, supervisors, drivers, or specific groups",
              "PIN Management - Create, change, or reset PINs for supervisors, drivers, and safety advisors",
              "Full Analytics - Access all system data: performance, safety incidents, compliance, audit logs"
            ]
          },
          {
            title: "Shift Instructions",
            description: "Create daily shift instructions for the Supervisor. They'll see your recap when they log in each day. Two-way communication keeps everyone aligned.",
            icon: "MessageSquare",
            keywords: ["shift", "instructions", "daily", "supervisor", "communication"],
            tips: ["Shift instructions help keep Supervisor informed of priorities and changes"]
          },
          {
            title: "Email System",
            description: "Send company-wide emails to all staff or specific groups. Order supplies, contact vendors, or communicate important updates. Email history stored in database.",
            icon: "Mail",
            keywords: ["email", "communication", "company-wide", "staff", "vendors"],
            tips: ["Email system is ready for SendGrid/AWS SES integration when configured"]
          },
          {
            title: "PIN Management",
            description: "Change PINs for everyone below you: Supervisor, Safety Advisor, and all drivers. Emergency access for situations like employee termination.",
            icon: "Key",
            keywords: ["pin", "password", "access", "security", "reset", "emergency"],
            tips: ["You can override any Supervisor decisions - you're the highest authority"]
          }
        ]
      }
    ]
  },
  {
    id: "scanning",
    title: "Scanning & OCR",
    icon: "Camera",
    topics: [
      {
        id: "how_to_scan",
        title: "How to Use the Scanner",
        description: "Complete guide to OCR camera scanning",
        keywords: ["scan", "camera", "ocr", "vin", "sticker", "how to"],
        role: "all",
        content: [
          {
            title: "Starting a Scan",
            description: "Tap the camera button on your dashboard. Allow camera permissions when prompted. Hold steady and center the sticker in frame.",
            icon: "Camera",
            keywords: ["start", "begin", "camera", "permissions", "access"],
            steps: [
              "Tap 'Scan with Camera' button",
              "Allow camera access if prompted",
              "Center the sticker in your camera view",
              "Hold steady - OCR reads automatically",
              "Review extracted data before saving"
            ]
          },
          {
            title: "What Can Be Scanned",
            description: "Work Order stickers, Routing labels, Sale Lane tags, VIN plates, and any printed text on vehicles.",
            icon: "FileText",
            keywords: ["what", "types", "stickers", "labels", "vin"],
            tips: [
              "Work Order stickers contain VIN and task details",
              "Routing stickers show destination codes (DSC→257, etc.)",
              "Sale Lane stickers display week (1-52) and lane numbers"
            ]
          },
          {
            title: "Troubleshooting Scan Issues",
            description: "If OCR can't read a sticker, try better lighting, get closer, or manually enter the VIN.",
            icon: "AlertTriangle",
            keywords: ["troubleshoot", "error", "failed", "can't read", "problem"],
            steps: [
              "Ensure good lighting - avoid shadows and glare",
              "Clean the sticker if dirty or damaged",
              "Get closer - fill most of the frame with text",
              "Hold steady - blurry images won't read",
              "Manual entry option available if OCR fails"
            ]
          }
        ]
      }
    ]
  },
  {
    id: "routing",
    title: "Routing & Navigation",
    icon: "Navigation",
    topics: [
      {
        id: "gps_routing",
        title: "GPS Turn-by-Turn Navigation",
        description: "How the autonomous routing system guides you",
        keywords: ["gps", "navigation", "routing", "directions", "waypoint"],
        role: "van_driver",
        content: [
          {
            title: "How GPS Routing Works",
            description: "After scanning a vehicle, the system automatically calculates the fastest route to pickup and drop-off locations using GPS waypoints.",
            icon: "MapPin",
            keywords: ["how", "works", "gps", "waypoint", "routing"],
            steps: [
              "Scan vehicle sticker to capture destination",
              "System looks up GPS coordinates for pickup/dropoff",
              "Turn-by-turn directions appear on your screen",
              "Real-time distance countdown shows progress",
              "Arrival notification when you reach destination"
            ]
          },
          {
            title: "Understanding Lot Codes",
            description: "Routing stickers use codes like DSC→257 (Detail Shop Complete to Lot 257) or REG→227 (Registration to Lot 227)",
            icon: "Map",
            keywords: ["codes", "lots", "destination", "routing codes"],
            tips: [
              "DSC = Detail Shop Complete",
              "REG = Registration",
              "Numbers = Destination lot (e.g., 257, 227)",
              "→ symbol shows the flow direction"
            ]
          }
        ]
      }
    ]
  },
  {
    id: "performance",
    title: "Performance & Quotas",
    icon: "TrendingUp",
    topics: [
      {
        id: "mph_tracking",
        title: "Moves Per Hour (MPH) Tracking",
        description: "Understanding your performance metrics",
        keywords: ["mph", "performance", "quota", "moves", "tracking", "stats"],
        role: "van_driver",
        content: [
          {
            title: "MPH Target",
            description: "The standard quota is 4.5 moves per hour. This is tracked automatically every time you scan and move a vehicle.",
            icon: "Target",
            keywords: ["target", "goal", "4.5", "quota", "standard"],
            tips: ["Focus on consistent steady work rather than rushing - safety first!"]
          },
          {
            title: "Real-Time Dashboard",
            description: "Your dashboard shows current MPH, total moves today, quota progress percentage, and bonus earnings projections.",
            icon: "BarChart3",
            keywords: ["dashboard", "real-time", "stats", "current", "today"],
          },
          {
            title: "Weekly & Monthly Reports",
            description: "View historical performance trends, compare weeks, and track improvement over time.",
            icon: "Calendar",
            keywords: ["weekly", "monthly", "reports", "history", "trends"],
          }
        ]
      }
    ]
  },
  {
    id: "breaks",
    title: "Breaks & Time Tracking",
    icon: "Coffee",
    topics: [
      {
        id: "break_management",
        title: "Taking Breaks & Lunches",
        description: "How to properly clock in/out for breaks",
        keywords: ["break", "lunch", "clock", "time", "tracking"],
        role: "van_driver",
        content: [
          {
            title: "Starting a Break",
            description: "Tap your status indicator and select 'On Break'. This pauses your quota tracking and notifies supervisors.",
            icon: "Coffee",
            keywords: ["start", "begin", "clock in", "break"],
            steps: [
              "Tap your status badge at top of screen",
              "Select 'On Break' from menu",
              "System pauses quota and MPH tracking",
              "Supervisor sees you're unavailable",
              "Return and tap 'Active' to resume work"
            ]
          },
          {
            title: "Break Compliance",
            description: "System automatically tracks break durations and alerts you if breaks exceed allowed times.",
            icon: "Clock",
            keywords: ["compliance", "rules", "duration", "limits", "alerts"],
            tips: ["Lunch breaks are typically 30 minutes, short breaks 15 minutes"]
          }
        ]
      }
    ]
  },
  {
    id: "communication",
    title: "Communication & Messaging",
    icon: "MessageSquare",
    topics: [
      {
        id: "driver_messaging",
        title: "Messaging Supervisors",
        description: "How to communicate with dispatch",
        keywords: ["message", "chat", "communication", "supervisor", "dispatch"],
        role: "all",
        content: [
          {
            title: "Sending Messages",
            description: "Tap the chat bubble icon to open messaging. Type your message and send to supervisors or other drivers.",
            icon: "MessageSquare",
            keywords: ["send", "chat", "message", "communicate"],
            steps: [
              "Tap chat bubble in bottom-right corner",
              "Select recipient (Supervisor, specific driver)",
              "Type your message",
              "Tap send",
              "Receive instant notifications on replies"
            ]
          },
          {
            title: "Emergency Communication",
            description: "For urgent issues (accidents, breakdowns, safety concerns), use the URGENT flag when messaging supervisors.",
            icon: "AlertTriangle",
            keywords: ["emergency", "urgent", "safety", "accident", "help"],
            tips: ["Supervisors get instant alerts for urgent messages"]
          }
        ]
      }
    ]
  },
  {
    id: "work_orders",
    title: "Work Orders & Tasks",
    icon: "ClipboardList",
    topics: [
      {
        id: "completing_work_orders",
        title: "How to Complete Work Orders",
        description: "Managing assigned tasks and crunch mode work",
        keywords: ["work order", "task", "assignment", "crunch mode", "complete"],
        role: "van_driver",
        content: [
          {
            title: "Viewing Your Work Orders",
            description: "Work orders appear in your dashboard under 'Assigned Tasks'. Each shows the vehicle VIN, current location, and destination.",
            icon: "List",
            keywords: ["view", "assigned", "tasks", "list"],
          },
          {
            title: "Completing Tasks",
            description: "Scan the vehicle to mark the work order complete. The system automatically updates the task status and notifies supervisors.",
            icon: "CheckCircle",
            keywords: ["complete", "finish", "scan", "done", "mark"],
            steps: [
              "Navigate to assigned vehicle location",
              "Scan vehicle sticker with camera",
              "System auto-detects work order match",
              "Confirm completion",
              "Task marked complete, supervisor notified"
            ]
          }
        ]
      }
    ]
  },
  {
    id: "safety",
    title: "Safety & Compliance",
    icon: "Shield",
    topics: [
      {
        id: "safety_protocols",
        title: "Safety Guidelines",
        description: "Keeping yourself and others safe",
        keywords: ["safety", "protocol", "guidelines", "rules", "compliance"],
        role: "all",
        content: [
          {
            title: "Speed Monitoring",
            description: "GPS tracks your driving speed. Alerts trigger if speeds exceed safe limits for lot conditions.",
            icon: "Gauge",
            keywords: ["speed", "monitoring", "gps", "limits", "alerts"],
            tips: ["Lot speed limit is typically 10-15 MPH depending on area"]
          },
          {
            title: "Incident Reporting",
            description: "If an accident or safety issue occurs, use the incident report button to document with photos and details immediately.",
            icon: "AlertTriangle",
            keywords: ["incident", "accident", "report", "safety issue", "document"],
            steps: [
              "Tap 'Report Incident' button",
              "Select incident type (accident, near-miss, hazard)",
              "Take photos of scene/damage",
              "Describe what happened",
              "Submit - supervisors get instant alert"
            ]
          }
        ]
      }
    ]
  }
];

// Helper function to search help topics
export function searchHelpTopics(query: string, role?: string): HelpTopic[] {
  const searchTerms = query.toLowerCase().split(" ");
  const results: HelpTopic[] = [];

  helpCategories.forEach(category => {
    category.topics.forEach(topic => {
      // Filter by role if specified
      if (role && topic.role !== "all" && topic.role !== role) {
        return;
      }

      // Check if any search term matches keywords
      const matchScore = searchTerms.reduce((score, term) => {
        // Check topic keywords
        const topicMatch = topic.keywords.some(keyword => keyword.includes(term));
        if (topicMatch) score += 3;

        // Check title
        if (topic.title.toLowerCase().includes(term)) score += 5;

        // Check description
        if (topic.description.toLowerCase().includes(term)) score += 2;

        // Check content keywords
        topic.content.forEach(step => {
          if (step.keywords.some(keyword => keyword.includes(term))) score += 1;
          if (step.title.toLowerCase().includes(term)) score += 2;
        });

        return score;
      }, 0);

      if (matchScore > 0) {
        results.push({ ...topic, matchScore } as any);
      }
    });
  });

  // Sort by match score
  return results.sort((a: any, b: any) => b.matchScore - a.matchScore);
}

// Get topics for a specific role
export function getTopicsForRole(role: "van_driver" | "inventory_driver" | "supervisor" | "operations_manager"): HelpTopic[] {
  const topics: HelpTopic[] = [];
  
  helpCategories.forEach(category => {
    category.topics.forEach(topic => {
      if (topic.role === role || topic.role === "all") {
        topics.push(topic);
      }
    });
  });

  return topics;
}
