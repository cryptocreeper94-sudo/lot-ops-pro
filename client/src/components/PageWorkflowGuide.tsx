import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useLocation } from "wouter";
import { 
  BookOpen, 
  ChevronLeft, 
  ChevronRight, 
  X, 
  ExternalLink,
  CheckCircle2,
  ArrowRight,
  Users,
  Truck,
  ClipboardList,
  BarChart3,
  Shield,
  Wrench,
  Camera,
  Navigation,
  Clock,
  Package,
  AlertTriangle,
  Settings,
  Home,
  Eye
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { VisuallyHidden } from "@radix-ui/react-visually-hidden";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { LotBuddy } from "./LotBuddy";

interface SlideLink {
  label: string;
  path: string;
}

interface WorkflowSlide {
  title: string;
  content: string;
  tips?: string[];
  icon?: React.ReactNode;
  link?: SlideLink;
  nextPage?: SlideLink;
}

interface PageWorkflow {
  route: string;
  pageTitle: string;
  roles: string[];
  slides: WorkflowSlide[];
}

const roleHierarchy: Record<string, string[]> = {
  developer: ["developer", "operations_manager", "supervisor", "van_driver", "inventory_driver", "safety_advisor", "maintenance_driver"],
  operations_manager: ["operations_manager", "supervisor", "van_driver", "inventory_driver", "safety_advisor", "maintenance_driver"],
  supervisor: ["supervisor", "van_driver", "inventory_driver", "safety_advisor"],
  van_driver: ["van_driver"],
  inventory_driver: ["inventory_driver"],
  safety_advisor: ["safety_advisor", "van_driver", "inventory_driver"],
  maintenance_driver: ["maintenance_driver"],
  beta_tester: ["beta_tester", "van_driver", "inventory_driver"]
};

const pageWorkflows: PageWorkflow[] = [
  {
    route: "/",
    pageTitle: "Login & Home",
    roles: ["all"],
    slides: [
      {
        title: "Welcome to Lot Ops Pro!",
        content: "This is your starting point. Enter your PIN to access the system. Your role determines what features you'll see.",
        tips: ["Your PIN is provided by your supervisor", "Forgot your PIN? Ask your supervisor to reset it"],
        icon: <Home className="h-8 w-8 text-blue-400" />
      },
      {
        title: "Role-Based Access",
        content: "Once logged in, you'll be taken to your role-specific dashboard. Each role has different responsibilities and tools.",
        tips: ["Operations Manager: Full system control", "Supervisor: Team management & assignments", "Drivers: Task completion & tracking"],
        icon: <Users className="h-8 w-8 text-purple-400" />
      },
      {
        title: "Getting Help",
        content: "Look for this tutorial button on every page! It explains how that specific page works and where to go next.",
        tips: ["I'm Lot Buddy - I'm here to help!", "Each page has its own guide"],
        icon: <BookOpen className="h-8 w-8 text-green-400" />,
        nextPage: { label: "Go to Dashboard", path: "/dashboard" }
      }
    ]
  },
  {
    route: "/dashboard",
    pageTitle: "Main Dashboard",
    roles: ["supervisor", "operations_manager"],
    slides: [
      {
        title: "Your Command Center",
        content: "This dashboard shows you everything happening on the lot at a glance. Active drivers, pending tasks, and real-time stats are all here.",
        tips: ["Cards update in real-time", "Tap any card to see details"],
        icon: <BarChart3 className="h-8 w-8 text-blue-400" />
      },
      {
        title: "Quick Actions",
        content: "From here you can create assignment lists, view driver locations, check performance, and manage your team.",
        tips: ["Use the navigation tabs to switch between sections"],
        icon: <ClipboardList className="h-8 w-8 text-green-400" />,
        link: { label: "Create Assignment List", path: "/resource-allocation" }
      },
      {
        title: "Next Steps",
        content: "Ready to assign work? Head to Resource Allocation to create and dispatch assignment lists to your drivers.",
        icon: <ArrowRight className="h-8 w-8 text-purple-400" />,
        nextPage: { label: "Go to Resource Allocation", path: "/resource-allocation" }
      }
    ]
  },
  {
    route: "/resource-allocation",
    pageTitle: "Resource Allocation",
    roles: ["supervisor", "operations_manager"],
    slides: [
      {
        title: "Assignment List Management",
        content: "This is where you create and manage assignment lists for your drivers. You can create lists for car moves, inventory moves, sold units, and sale lane moves.",
        tips: ["Each list type has its own workflow", "Assign multiple vehicles to one driver"],
        icon: <ClipboardList className="h-8 w-8 text-blue-400" />
      },
      {
        title: "Creating an Assignment List",
        content: "Tap 'Create Assignment' to start a new list. Enter vehicle information manually or use the scanner to capture details from stickers.",
        tips: ["Stock numbers help identify vehicles quickly", "Add pickup and dropoff locations for each vehicle"],
        icon: <Package className="h-8 w-8 text-green-400" />,
        link: { label: "Open Scanner", path: "/scanner" }
      },
      {
        title: "Dispatching to Drivers",
        content: "Once your list is ready, select a driver and tap 'Dispatch'. The driver receives the list instantly on their device.",
        tips: ["Drivers see assignments in order you set", "You can track progress in real-time"],
        icon: <Truck className="h-8 w-8 text-orange-400" />
      },
      {
        title: "Monitoring Progress",
        content: "Watch as drivers complete tasks. Green checkmarks show completed moves. Yellow indicates in-progress.",
        tips: ["Tap a driver to see their current location", "Reassign tasks if needed"],
        icon: <Eye className="h-8 w-8 text-purple-400" />,
        nextPage: { label: "View Crew Manager", path: "/crew-manager" }
      }
    ]
  },
  {
    route: "/crew-manager",
    pageTitle: "Crew Manager",
    roles: ["supervisor", "operations_manager"],
    slides: [
      {
        title: "Team Overview",
        content: "See all your drivers at a glance. Their status, current task, and location are displayed in real-time.",
        tips: ["Green = Active and working", "Yellow = On break", "Gray = Clocked out"],
        icon: <Users className="h-8 w-8 text-blue-400" />
      },
      {
        title: "Driver Details",
        content: "Tap any driver to see their full profile, current assignment list, completed moves, and performance stats.",
        tips: ["Message drivers directly from here", "View their route history"],
        icon: <Truck className="h-8 w-8 text-green-400" />
      },
      {
        title: "Managing Breaks",
        content: "Approve or deny break requests from this screen. Track break duration and ensure coverage.",
        tips: ["Drivers request breaks from their app", "You control when breaks are approved"],
        icon: <Clock className="h-8 w-8 text-orange-400" />,
        nextPage: { label: "View Analytics", path: "/analytics" }
      }
    ]
  },
  {
    route: "/operations-manager",
    pageTitle: "Operations Manager Hub",
    roles: ["operations_manager"],
    slides: [
      {
        title: "Full System Control",
        content: "As Operations Manager, you have complete oversight of the entire operation. This is your command center for managing supervisors, reviewing performance, and setting policies.",
        tips: ["You can override any supervisor decision", "Access all reports and analytics"],
        icon: <BarChart3 className="h-8 w-8 text-purple-400" />
      },
      {
        title: "Daily Access Code",
        content: "Each day, share the Daily Access Code at your pre-shift meeting. This code changes daily and ensures only authorized personnel access the system.",
        tips: ["New code generates at midnight", "Share verbally - never in writing"],
        icon: <Shield className="h-8 w-8 text-blue-400" />
      },
      {
        title: "Shift Instructions",
        content: "Create daily shift instructions for supervisors. They'll see your notes when they log in, keeping everyone aligned on priorities.",
        tips: ["Be specific about daily goals", "Include any special instructions"],
        icon: <ClipboardList className="h-8 w-8 text-green-400" />
      },
      {
        title: "PIN Management",
        content: "You can change PINs for supervisors, drivers, and all staff. Use this for new hires or if someone forgets their PIN.",
        tips: ["Only you and supervisors can reset PINs", "Document PIN changes for security"],
        icon: <Settings className="h-8 w-8 text-orange-400" />,
        link: { label: "Manage PINs", path: "/settings" }
      }
    ]
  },
  {
    route: "/van-driver",
    pageTitle: "Van Driver Dashboard",
    roles: ["van_driver", "supervisor", "operations_manager"],
    slides: [
      {
        title: "Your Driver Dashboard",
        content: "This is your home base as a van driver. Here you'll see your assignment list, quota progress, and shift status.",
        tips: ["Start your shift by tapping 'Clock In'", "Your quota shows at the top"],
        icon: <Truck className="h-8 w-8 text-blue-400" />
      },
      {
        title: "Receiving Assignments",
        content: "When your supervisor sends you an assignment list, it appears here automatically. Each item shows the vehicle to move and where to take it.",
        tips: ["New assignments flash to get your attention", "Tap an assignment to see GPS directions"],
        icon: <ClipboardList className="h-8 w-8 text-green-400" />
      },
      {
        title: "Completing a Move",
        content: "Drive to the pickup location, get in the vehicle, drive it to the dropoff. Then tap 'Complete' to mark it done.",
        tips: ["GPS tracks your route automatically", "Each completed move adds to your quota"],
        icon: <Navigation className="h-8 w-8 text-orange-400" />
      },
      {
        title: "Taking Breaks",
        content: "Need a break? Tap the break request button. Your supervisor will approve it, and your break timer starts.",
        tips: ["Break time doesn't count against your quota", "Return promptly when break ends"],
        icon: <Clock className="h-8 w-8 text-purple-400" />
      },
      {
        title: "End of Shift",
        content: "When your shift ends, tap 'Clock Out'. Your performance summary shows how many moves you completed.",
        tips: ["Check your stats before clocking out", "Great work counts toward bonuses!"],
        icon: <CheckCircle2 className="h-8 w-8 text-green-400" />
      }
    ]
  },
  {
    route: "/driver-dashboard",
    pageTitle: "Driver Dashboard",
    roles: ["van_driver", "inventory_driver", "supervisor", "operations_manager"],
    slides: [
      {
        title: "Active Task View",
        content: "This screen shows your current assignment in detail. Follow the GPS guidance to complete your task efficiently.",
        tips: ["Blue line shows your route", "Distance and ETA update in real-time"],
        icon: <Navigation className="h-8 w-8 text-blue-400" />
      },
      {
        title: "Task Details",
        content: "See all the information about your current task: vehicle stock number, pickup location, dropoff location, and any special notes.",
        tips: ["Swipe up for more details", "Tap the map to expand it"],
        icon: <Package className="h-8 w-8 text-green-400" />
      },
      {
        title: "Marking Complete",
        content: "Once you've completed the move, tap the green 'Complete' button. This updates your quota and notifies your supervisor.",
        tips: ["Double-check you're at the right spot", "Take a photo if required"],
        icon: <CheckCircle2 className="h-8 w-8 text-purple-400" />
      }
    ]
  },
  {
    route: "/inventory-driver",
    pageTitle: "Inventory Driver Dashboard",
    roles: ["inventory_driver", "supervisor", "operations_manager"],
    slides: [
      {
        title: "Inventory Scanning",
        content: "As an inventory driver, you scan and log vehicles on the lot. Your work keeps our database accurate.",
        tips: ["Accuracy is more important than speed", "Report any discrepancies immediately"],
        icon: <Camera className="h-8 w-8 text-blue-400" />
      },
      {
        title: "Using the Scanner",
        content: "Point your camera at the vehicle's sticker. The app reads the information automatically and logs it.",
        tips: ["Hold steady for best results", "Good lighting helps accuracy"],
        icon: <Camera className="h-8 w-8 text-green-400" />,
        link: { label: "Open Scanner", path: "/scanner" }
      },
      {
        title: "Logging Locations",
        content: "After scanning, confirm the vehicle's location. This helps everyone find vehicles quickly.",
        tips: ["Use lane and row numbers", "Update if a vehicle moves"],
        icon: <Navigation className="h-8 w-8 text-orange-400" />
      },
      {
        title: "Inventory Reports",
        content: "Your scans feed into reports that supervisors and managers use for planning. Accurate data = smooth operations.",
        tips: ["Check your scan count periodically", "Quality scans are valued!"],
        icon: <BarChart3 className="h-8 w-8 text-purple-400" />
      }
    ]
  },
  {
    route: "/scanner",
    pageTitle: "Vehicle Scanner",
    roles: ["van_driver", "inventory_driver", "supervisor", "operations_manager"],
    slides: [
      {
        title: "Camera Scanner",
        content: "This scanner reads vehicle stickers using your phone's camera. It captures stock numbers, VINs, and routing information automatically.",
        tips: ["Position the sticker in the frame", "Wait for the green checkmark"],
        icon: <Camera className="h-8 w-8 text-blue-400" />
      },
      {
        title: "Scanning Tips",
        content: "For best results: Hold your phone steady, ensure good lighting, and keep the sticker flat in frame.",
        tips: ["Clean the sticker if dirty", "Try different angles if it won't read"],
        icon: <CheckCircle2 className="h-8 w-8 text-green-400" />
      },
      {
        title: "After Scanning",
        content: "Once scanned, verify the information is correct. You can edit if needed before saving.",
        tips: ["Double-check stock numbers", "Add notes if something looks wrong"],
        icon: <ClipboardList className="h-8 w-8 text-orange-400" />
      }
    ]
  },
  {
    route: "/safety-portal",
    pageTitle: "Safety Portal",
    roles: ["safety_advisor", "supervisor", "operations_manager"],
    slides: [
      {
        title: "Safety First",
        content: "As a Safety Representative, you're our eyes and ears for safety on the lot. This portal is where you report and track safety concerns.",
        tips: ["Report hazards immediately", "No concern is too small"],
        icon: <Shield className="h-8 w-8 text-red-400" />
      },
      {
        title: "Reporting Incidents",
        content: "If you see something unsafe, tap 'Report Incident'. Add photos, location, and description.",
        tips: ["Be specific about what you saw", "Include time and location"],
        icon: <AlertTriangle className="h-8 w-8 text-orange-400" />,
        link: { label: "Report Incident", path: "/safety-report" }
      },
      {
        title: "Daily Safety Checks",
        content: "Complete your daily safety checklist. This ensures all areas are inspected regularly.",
        tips: ["Check high-traffic areas first", "Note any changes since yesterday"],
        icon: <ClipboardList className="h-8 w-8 text-green-400" />
      },
      {
        title: "Your Driver Duties",
        content: "Remember, you're also a driver! Switch between safety duties and driving tasks as needed.",
        tips: ["Safety work is priority", "Coordinate with your supervisor"],
        icon: <Truck className="h-8 w-8 text-blue-400" />
      }
    ]
  },
  {
    route: "/service-driver",
    pageTitle: "Service & Maintenance Driver",
    roles: ["maintenance_driver", "supervisor", "operations_manager"],
    slides: [
      {
        title: "Maintenance Operations",
        content: "As a maintenance/service driver, you handle vehicle repairs, jump starts, tire changes, and other maintenance tasks on the lot.",
        tips: ["Prioritize urgent requests", "Log all work completed"],
        icon: <Wrench className="h-8 w-8 text-orange-400" />
      },
      {
        title: "Receiving Service Requests",
        content: "Service requests come from supervisors and drivers. Check your queue for pending tasks.",
        tips: ["Urgent items are highlighted red", "Tap for full details"],
        icon: <ClipboardList className="h-8 w-8 text-blue-400" />
      },
      {
        title: "Completing Tasks",
        content: "After fixing a vehicle, mark the task complete and add notes about what was done.",
        tips: ["Document parts used", "Note if follow-up needed"],
        icon: <CheckCircle2 className="h-8 w-8 text-green-400" />
      }
    ]
  },
  {
    route: "/mode-selection",
    pageTitle: "Mode Selection",
    roles: ["all"],
    slides: [
      {
        title: "Choose Your Mode",
        content: "This screen lets you select the mode that matches your role for today. Supervisors and drivers see different options.",
        tips: ["Your role determines which modes appear", "Tap your mode to continue"],
        icon: <Users className="h-8 w-8 text-blue-400" />
      },
      {
        title: "Quick Access",
        content: "After selecting your mode, you'll go directly to your dashboard. Your selection is remembered for next time.",
        tips: ["Change modes anytime from settings", "Ask your supervisor if unsure which to pick"],
        icon: <ArrowRight className="h-8 w-8 text-green-400" />
      }
    ]
  },
  {
    route: "/crew-setup",
    pageTitle: "Crew Setup",
    roles: ["supervisor", "operations_manager"],
    slides: [
      {
        title: "Build Your Crew",
        content: "Set up your team for the day. Add drivers, assign roles, and configure shift times.",
        tips: ["Add drivers before the shift starts", "Assign roles based on the day's needs"],
        icon: <Users className="h-8 w-8 text-blue-400" />
      },
      {
        title: "Shift Configuration",
        content: "Set start and end times for the shift. Configure break schedules and quota targets.",
        tips: ["Adjust quotas based on lot volume", "Plan breaks to maintain coverage"],
        icon: <Clock className="h-8 w-8 text-green-400" />
      },
      {
        title: "Ready to Go",
        content: "Once your crew is set up, they'll appear in the Crew Manager. Dispatch assignments from Resource Allocation.",
        tips: ["Crew setup saves automatically", "Make changes anytime during shift"],
        icon: <CheckCircle2 className="h-8 w-8 text-purple-400" />,
        nextPage: { label: "Go to Resource Allocation", path: "/resource-allocation" }
      }
    ]
  },
  {
    route: "/lane-config",
    pageTitle: "Lane Configuration",
    roles: ["supervisor", "operations_manager"],
    slides: [
      {
        title: "Lot Layout Setup",
        content: "Configure your lot's lanes and rows. This defines where vehicles can be parked and how they're organized.",
        tips: ["Match your physical lot layout", "Update when lot changes"],
        icon: <Settings className="h-8 w-8 text-blue-400" />
      },
      {
        title: "Lane Structure",
        content: "Set up lanes with their capacity, type (standard, overflow, sale), and naming convention.",
        tips: ["Use consistent naming", "Mark high-traffic lanes clearly"],
        icon: <ClipboardList className="h-8 w-8 text-green-400" />
      }
    ]
  },
  {
    route: "/auction-manager",
    pageTitle: "Auction Manager",
    roles: ["supervisor", "operations_manager"],
    slides: [
      {
        title: "Auction Day Control",
        content: "Manage auction day operations. Track sale lanes, staging areas, and vehicle flow.",
        tips: ["Monitor lane progress in real-time", "Coordinate with auctioneers"],
        icon: <BarChart3 className="h-8 w-8 text-blue-400" />
      },
      {
        title: "Vehicle Staging",
        content: "Ensure vehicles are staged properly before sale. Track which vehicles are ready and which need attention.",
        tips: ["Start staging early", "Communicate delays immediately"],
        icon: <Truck className="h-8 w-8 text-green-400" />
      }
    ]
  },
  {
    route: "/safety-dashboard",
    pageTitle: "Safety Dashboard",
    roles: ["safety_advisor", "supervisor", "operations_manager"],
    slides: [
      {
        title: "Safety Overview",
        content: "Monitor all safety-related activity on the lot. View reports, track incidents, and ensure compliance.",
        tips: ["Review daily safety reports", "Follow up on open incidents"],
        icon: <Shield className="h-8 w-8 text-red-400" />
      },
      {
        title: "Incident Tracking",
        content: "All reported incidents appear here. Track status from report through resolution.",
        tips: ["Prioritize by severity", "Document all follow-up actions"],
        icon: <AlertTriangle className="h-8 w-8 text-orange-400" />
      }
    ]
  },
  {
    route: "/safety-report",
    pageTitle: "Safety Report",
    roles: ["safety_advisor", "van_driver", "inventory_driver", "supervisor", "operations_manager"],
    slides: [
      {
        title: "Report an Incident",
        content: "Use this form to report any safety concern, near-miss, or incident. Be as detailed as possible.",
        tips: ["Include photos when possible", "Note exact location and time"],
        icon: <AlertTriangle className="h-8 w-8 text-orange-400" />
      },
      {
        title: "What to Report",
        content: "Report hazards, accidents, near-misses, equipment issues, or any unsafe conditions you observe.",
        tips: ["No report is too small", "Safety is everyone's responsibility"],
        icon: <Shield className="h-8 w-8 text-red-400" />
      }
    ]
  },
  {
    route: "/ev-charging",
    pageTitle: "EV Charging Tracker",
    roles: ["van_driver", "inventory_driver", "supervisor", "operations_manager"],
    slides: [
      {
        title: "Electric Vehicle Charging",
        content: "Track EV vehicles that need charging. Scan to log charging status and location.",
        tips: ["Log when you plug in", "Note charging complete"],
        icon: <Package className="h-8 w-8 text-green-400" />
      },
      {
        title: "Charging Stations",
        content: "View available charging stations and their current status. Plan routes to include charging stops.",
        tips: ["Check station availability", "Report broken chargers"],
        icon: <Navigation className="h-8 w-8 text-blue-400" />
      }
    ]
  },
  {
    route: "/driver-profile",
    pageTitle: "Driver Profile",
    roles: ["van_driver", "inventory_driver", "supervisor", "operations_manager"],
    slides: [
      {
        title: "Your Profile",
        content: "View your performance stats, completed moves, and shift history. Track your progress over time.",
        tips: ["Check your stats regularly", "Set personal goals"],
        icon: <Users className="h-8 w-8 text-blue-400" />
      },
      {
        title: "Performance History",
        content: "See your daily, weekly, and monthly performance. Compare to team averages and your personal bests.",
        tips: ["Celebrate improvements", "Learn from top performers"],
        icon: <BarChart3 className="h-8 w-8 text-green-400" />
      }
    ]
  },
  {
    route: "/help",
    pageTitle: "Help Center",
    roles: ["all"],
    slides: [
      {
        title: "Getting Help",
        content: "Find answers to common questions and learn how to use Lot Ops Pro effectively.",
        tips: ["Search for specific topics", "Browse by category"],
        icon: <BookOpen className="h-8 w-8 text-blue-400" />
      }
    ]
  },
  {
    route: "/developer",
    pageTitle: "Developer Hub",
    roles: ["developer"],
    slides: [
      {
        title: "Developer Dashboard",
        content: "Access developer tools, system configuration, and administrative functions.",
        tips: ["Full system access", "Use carefully - changes affect everyone"],
        icon: <Settings className="h-8 w-8 text-purple-400" />
      },
      {
        title: "System Tools",
        content: "View all slideshows, test features, access logs, and configure system-wide settings.",
        tips: ["Review training content regularly", "Keep documentation updated"],
        icon: <Wrench className="h-8 w-8 text-blue-400" />
      }
    ]
  },
  {
    route: "/sales",
    pageTitle: "Sales Dashboard",
    roles: ["supervisor", "operations_manager", "developer"],
    slides: [
      {
        title: "Sales CRM",
        content: "Manage leads, track opportunities, and monitor the sales pipeline.",
        tips: ["Update lead status promptly", "Follow up on hot leads"],
        icon: <BarChart3 className="h-8 w-8 text-green-400" />
      },
      {
        title: "Client Management",
        content: "Track client interactions, meetings, and deals. Keep notes for effective follow-up.",
        tips: ["Log all client contact", "Set reminders for follow-ups"],
        icon: <Users className="h-8 w-8 text-blue-400" />
      }
    ]
  },
  {
    route: "/sales-force",
    pageTitle: "Sales Force Assignment",
    roles: ["supervisor", "operations_manager", "developer"],
    slides: [
      {
        title: "Sales Team Management",
        content: "Assign sales territories and leads to team members. Balance workload across the team.",
        tips: ["Match skills to opportunities", "Review assignments regularly"],
        icon: <Users className="h-8 w-8 text-blue-400" />
      }
    ]
  },
  {
    route: "/business-card",
    pageTitle: "Business Card Manager",
    roles: ["supervisor", "operations_manager", "developer"],
    slides: [
      {
        title: "Digital Business Cards",
        content: "Create and manage digital business cards for your team. Share contact information easily.",
        tips: ["Keep information current", "Use QR codes for quick sharing"],
        icon: <Users className="h-8 w-8 text-blue-400" />
      }
    ]
  },
  {
    route: "/asset-tracking",
    pageTitle: "Asset Tracking",
    roles: ["supervisor", "operations_manager", "developer"],
    slides: [
      {
        title: "Track Assets",
        content: "Monitor all tracked assets including vehicles, equipment, and supplies.",
        tips: ["Scan to update location", "Report missing items immediately"],
        icon: <Package className="h-8 w-8 text-blue-400" />
      },
      {
        title: "Asset History",
        content: "View the complete history of any tracked asset. See movements, maintenance, and status changes.",
        tips: ["Check history for issues", "Maintain accurate records"],
        icon: <ClipboardList className="h-8 w-8 text-green-400" />
      }
    ]
  },
  {
    route: "/hallmark-manager",
    pageTitle: "Hallmark Manager",
    roles: ["supervisor", "operations_manager", "developer"],
    slides: [
      {
        title: "Customer Hallmarks",
        content: "Manage customer-specific hallmarks and serial numbers. Track asset ownership.",
        tips: ["Verify hallmarks carefully", "Update as ownership changes"],
        icon: <Camera className="h-8 w-8 text-blue-400" />
      }
    ]
  },
  {
    route: "/facility-reference",
    pageTitle: "Facility Reference",
    roles: ["all"],
    slides: [
      {
        title: "Facility Information",
        content: "Reference information about the facility including lot maps, key locations, and important contacts.",
        tips: ["Save offline for quick access", "Report outdated information"],
        icon: <Navigation className="h-8 w-8 text-blue-400" />
      }
    ]
  },
  {
    route: "/company-resources",
    pageTitle: "Company Resources",
    roles: ["all"],
    slides: [
      {
        title: "Resources & Documents",
        content: "Access company policies, training materials, and important documents.",
        tips: ["Review policies regularly", "Download for offline access"],
        icon: <BookOpen className="h-8 w-8 text-blue-400" />
      }
    ]
  },
  {
    route: "/weekly-maps",
    pageTitle: "Weekly Maps",
    roles: ["supervisor", "operations_manager"],
    slides: [
      {
        title: "Weekly Lot Maps",
        content: "View and share weekly lot configuration maps. See where vehicles are staged for the week.",
        tips: ["Check updates daily", "Share with your team"],
        icon: <Navigation className="h-8 w-8 text-blue-400" />
      }
    ]
  },
  {
    route: "/pin-tracking",
    pageTitle: "PIN Tracking",
    roles: ["supervisor", "operations_manager", "developer"],
    slides: [
      {
        title: "PIN Activity Monitor",
        content: "Track PIN usage, logins, and access patterns. Monitor security across the system.",
        tips: ["Review suspicious activity", "Reset PINs as needed"],
        icon: <Shield className="h-8 w-8 text-blue-400" />
      }
    ]
  },
  {
    route: "/configure",
    pageTitle: "Configuration Wizard",
    roles: ["operations_manager", "developer"],
    slides: [
      {
        title: "System Configuration",
        content: "Set up and customize Lot Ops Pro for your facility. Configure branding, features, and defaults.",
        tips: ["Test changes before going live", "Document your configuration"],
        icon: <Settings className="h-8 w-8 text-purple-400" />
      }
    ]
  },
  {
    route: "/pricing",
    pageTitle: "Pricing",
    roles: ["all"],
    slides: [
      {
        title: "Subscription Plans",
        content: "View available subscription plans and pricing. Choose the plan that fits your needs.",
        tips: ["Compare features carefully", "Contact sales for custom plans"],
        icon: <BarChart3 className="h-8 w-8 text-green-400" />
      }
    ]
  },
  {
    route: "/subscription",
    pageTitle: "Subscription Management",
    roles: ["operations_manager", "developer"],
    slides: [
      {
        title: "Manage Subscription",
        content: "View and manage your subscription, billing, and payment methods.",
        tips: ["Keep payment info current", "Review invoices regularly"],
        icon: <Settings className="h-8 w-8 text-blue-400" />
      }
    ]
  },
  {
    route: "/about",
    pageTitle: "About",
    roles: ["all"],
    slides: [
      {
        title: "About Lot Ops Pro",
        content: "Learn about Lot Ops Pro, our mission, and the team behind the platform.",
        tips: ["Check for updates", "Contact us with feedback"],
        icon: <BookOpen className="h-8 w-8 text-blue-400" />
      }
    ]
  },
  {
    route: "/printer-connect",
    pageTitle: "Printer Connect",
    roles: ["supervisor", "operations_manager"],
    slides: [
      {
        title: "Connect Printers",
        content: "Set up and manage label printers for printing vehicle tags and tickets.",
        tips: ["Test print before busy times", "Keep supplies stocked"],
        icon: <Settings className="h-8 w-8 text-blue-400" />
      }
    ]
  },
  {
    route: "/slideshow",
    pageTitle: "Full Presentation",
    roles: ["all"],
    slides: [
      {
        title: "Complete System Overview",
        content: "This is the full presentation covering all aspects of Lot Ops Pro. Great for training and demos.",
        tips: ["Use arrow keys to navigate", "Press Space to auto-play"],
        icon: <BookOpen className="h-8 w-8 text-blue-400" />
      }
    ]
  },
  {
    route: "/system-workflow",
    pageTitle: "System Workflow",
    roles: ["supervisor", "operations_manager", "developer"],
    slides: [
      {
        title: "Workflow Overview",
        content: "See how all parts of Lot Ops Pro connect. Understand the complete flow from start to finish.",
        tips: ["Follow the workflow steps", "Identify process improvements"],
        icon: <ArrowRight className="h-8 w-8 text-blue-400" />
      }
    ]
  },
  {
    route: "/future-features",
    pageTitle: "Future Features",
    roles: ["all"],
    slides: [
      {
        title: "Coming Soon",
        content: "See what's coming next to Lot Ops Pro. Preview upcoming features and improvements.",
        tips: ["Share your feature requests", "Vote on priorities"],
        icon: <CheckCircle2 className="h-8 w-8 text-green-400" />
      }
    ]
  },
  {
    route: "/analytics",
    pageTitle: "Analytics & Reports",
    roles: ["supervisor", "operations_manager"],
    slides: [
      {
        title: "Performance Analytics",
        content: "This page shows detailed performance data for your team. Track moves, efficiency, and trends over time.",
        tips: ["Use date filters for specific periods", "Export reports as needed"],
        icon: <BarChart3 className="h-8 w-8 text-blue-400" />
      },
      {
        title: "Driver Comparisons",
        content: "See how each driver performs. Use this data for coaching and recognition.",
        tips: ["Top performers deserve recognition", "Use data for fair evaluations"],
        icon: <Users className="h-8 w-8 text-green-400" />
      },
      {
        title: "Weather Impact",
        content: "Our AI tracks how weather affects performance. See trends and plan accordingly.",
        tips: ["Bad weather = adjusted expectations", "Track patterns over time"],
        icon: <BarChart3 className="h-8 w-8 text-purple-400" />
      }
    ]
  },
  {
    route: "/settings",
    pageTitle: "Settings",
    roles: ["all"],
    slides: [
      {
        title: "Your Settings",
        content: "Customize your experience here. Update preferences, notification settings, and personal information.",
        tips: ["Enable notifications to stay informed", "Set your preferred location"],
        icon: <Settings className="h-8 w-8 text-blue-400" />
      }
    ]
  },
  {
    route: "/change-pin-required",
    pageTitle: "Change PIN",
    roles: ["all"],
    slides: [
      {
        title: "PIN Update Required",
        content: "For security, you need to change your PIN. Create a new 4-digit PIN that you'll remember.",
        tips: ["Don't use obvious patterns like 1234", "Keep your PIN private"],
        icon: <Shield className="h-8 w-8 text-blue-400" />
      }
    ]
  },
  {
    route: "/teresa-message",
    pageTitle: "Management Message",
    roles: ["all"],
    slides: [
      {
        title: "Important Message",
        content: "View important messages from management. Check this regularly for updates and announcements.",
        tips: ["Read all messages carefully", "Follow up on action items"],
        icon: <ClipboardList className="h-8 w-8 text-blue-400" />
      }
    ]
  },
  {
    route: "/web-research",
    pageTitle: "Web Research",
    roles: ["developer", "operations_manager"],
    slides: [
      {
        title: "Research Tools",
        content: "Access web research tools for market analysis and competitive research.",
        tips: ["Use for strategic planning", "Document findings"],
        icon: <BookOpen className="h-8 w-8 text-blue-400" />
      }
    ]
  },
  {
    route: "/investors",
    pageTitle: "Investor Information",
    roles: ["all"],
    slides: [
      {
        title: "Investment Opportunity",
        content: "Learn about investment opportunities with Lot Ops Pro and our vision for the future.",
        tips: ["Review growth metrics", "Contact us for more details"],
        icon: <BarChart3 className="h-8 w-8 text-green-400" />
      }
    ]
  },
  {
    route: "/privacy",
    pageTitle: "Privacy Policy",
    roles: ["all"],
    slides: [
      {
        title: "Your Privacy",
        content: "Read our privacy policy to understand how we protect your data and what information we collect.",
        tips: ["We take privacy seriously", "Contact us with questions"],
        icon: <Shield className="h-8 w-8 text-blue-400" />
      }
    ]
  },
  {
    route: "/terms",
    pageTitle: "Terms of Service",
    roles: ["all"],
    slides: [
      {
        title: "Terms of Service",
        content: "Review the terms of service that govern your use of Lot Ops Pro.",
        tips: ["Read before accepting", "Contact support with questions"],
        icon: <ClipboardList className="h-8 w-8 text-blue-400" />
      }
    ]
  },
  {
    route: "/checkout",
    pageTitle: "Checkout",
    roles: ["all"],
    slides: [
      {
        title: "Complete Your Purchase",
        content: "Review your order and complete payment. Your subscription will be activated immediately.",
        tips: ["Verify plan details", "Payment is secure"],
        icon: <CheckCircle2 className="h-8 w-8 text-green-400" />
      }
    ]
  }
];

function normalizeRole(role: string): string {
  const r = role?.toLowerCase()?.trim() || 'van_driver';
  if (r.includes('operations') || r.includes('manager') || r === 'ops_manager') return 'operations_manager';
  if (r.includes('supervisor') || r === 'sup') return 'supervisor';
  if (r.includes('van') || r === 'driver' || r === 'transport') return 'van_driver';
  if (r.includes('inventory') || r === 'inv') return 'inventory_driver';
  if (r.includes('beta') || r.includes('tester')) return 'beta_tester';
  if (r.includes('safety')) return 'safety_advisor';
  if (r.includes('maintenance')) return 'maintenance_driver';
  if (r.includes('developer') || r === 'dev') return 'developer';
  return 'van_driver';
}

export function PageWorkflowGuide() {
  const [location] = useLocation();
  const [, setCurrentLocation] = useLocation();
  const [isOpen, setIsOpen] = useState(false);
  const [currentSlide, setCurrentSlide] = useState(0);
  const [selectedWorkflow, setSelectedWorkflow] = useState<PageWorkflow | null>(null);
  const [showRoleSelector, setShowRoleSelector] = useState(false);
  const [buddyExpression, setBuddyExpression] = useState<"idle" | "speaking" | "pointing" | "celebrating">("speaking");

  const userRole = (() => {
    try {
      const stored = localStorage.getItem("vanops_user");
      return stored ? normalizeRole(JSON.parse(stored).role) : "van_driver";
    } catch {
      return "van_driver";
    }
  })();

  const accessibleRoles = roleHierarchy[userRole] || [userRole];

  const currentPageWorkflow = pageWorkflows.find(pw => {
    if (location === pw.route) return true;
    if (pw.route !== "/" && location.startsWith(pw.route)) return true;
    return false;
  });

  const availableWorkflows = pageWorkflows.filter(pw => 
    pw.roles.includes("all") || 
    pw.roles.some(r => accessibleRoles.includes(r))
  );

  const openGuide = (workflow?: PageWorkflow) => {
    const wf = workflow || currentPageWorkflow || pageWorkflows[0];
    setSelectedWorkflow(wf);
    setCurrentSlide(0);
    setBuddyExpression("speaking");
    setIsOpen(true);
    setShowRoleSelector(false);
  };

  const nextSlide = () => {
    if (selectedWorkflow && currentSlide < selectedWorkflow.slides.length - 1) {
      setCurrentSlide(prev => prev + 1);
      setBuddyExpression(currentSlide % 2 === 0 ? "pointing" : "speaking");
    }
  };

  const prevSlide = () => {
    if (currentSlide > 0) {
      setCurrentSlide(prev => prev - 1);
      setBuddyExpression("speaking");
    }
  };

  const handleLinkClick = (path: string) => {
    setIsOpen(false);
    setCurrentLocation(path);
  };

  const slide = selectedWorkflow?.slides[currentSlide];
  const progress = selectedWorkflow ? ((currentSlide + 1) / selectedWorkflow.slides.length) * 100 : 0;

  const canViewOtherRoles = accessibleRoles.length > 1;

  return (
    <>
      <Button
        onClick={() => canViewOtherRoles ? setShowRoleSelector(true) : openGuide()}
        variant="ghost"
        size="sm"
        className="gap-2 text-blue-600 hover:text-blue-700 hover:bg-blue-50"
        data-testid="button-page-guide"
      >
        <BookOpen className="h-4 w-4" />
        <span className="hidden sm:inline">How-To Guide</span>
      </Button>

      <Dialog open={showRoleSelector} onOpenChange={setShowRoleSelector}>
        <DialogContent className="max-w-md">
          <VisuallyHidden>
            <DialogTitle>Workflow Guides</DialogTitle>
            <DialogDescription>Select a workflow guide to view</DialogDescription>
          </VisuallyHidden>
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-16 h-16">
                <LotBuddy expression="waving" size="sm" />
              </div>
              <div>
                <h3 className="font-bold text-lg">Workflow Guides</h3>
                <p className="text-sm text-muted-foreground">Choose which guide to view</p>
              </div>
            </div>

            <div className="space-y-2">
              <Button
                onClick={() => openGuide()}
                className="w-full justify-start gap-3"
                variant="outline"
              >
                <BookOpen className="h-5 w-5 text-blue-500" />
                <div className="text-left">
                  <div className="font-medium">This Page</div>
                  <div className="text-xs text-muted-foreground">{currentPageWorkflow?.pageTitle || "Current page guide"}</div>
                </div>
              </Button>

              {canViewOtherRoles && (
                <>
                  <div className="text-xs text-muted-foreground mt-4 mb-2 flex items-center gap-2">
                    <Eye className="h-3 w-3" />
                    You can also view guides for:
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    {accessibleRoles.filter(r => r !== userRole).map(role => (
                      <Button
                        key={role}
                        variant="ghost"
                        size="sm"
                        className="justify-start text-xs"
                        onClick={() => {
                          const roleWorkflows = pageWorkflows.filter(pw => pw.roles.includes(role));
                          if (roleWorkflows.length > 0) {
                            openGuide(roleWorkflows[0]);
                          }
                        }}
                      >
                        {role === "van_driver" && <Truck className="h-3 w-3 mr-1" />}
                        {role === "inventory_driver" && <Camera className="h-3 w-3 mr-1" />}
                        {role === "supervisor" && <Users className="h-3 w-3 mr-1" />}
                        {role === "safety_advisor" && <Shield className="h-3 w-3 mr-1" />}
                        {role === "maintenance_driver" && <Wrench className="h-3 w-3 mr-1" />}
                        {role === "operations_manager" && <BarChart3 className="h-3 w-3 mr-1" />}
                        {role.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}
                      </Button>
                    ))}
                  </div>
                </>
              )}

              <div className="text-xs text-muted-foreground mt-4 mb-2">All Available Guides:</div>
              <div className="max-h-48 overflow-y-auto space-y-1">
                {availableWorkflows.map(wf => (
                  <Button
                    key={wf.route}
                    variant="ghost"
                    size="sm"
                    className="w-full justify-start text-xs"
                    onClick={() => openGuide(wf)}
                  >
                    {wf.pageTitle}
                    <Badge variant="secondary" className="ml-auto text-[10px]">
                      {wf.slides.length} slides
                    </Badge>
                  </Button>
                ))}
              </div>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogContent className="max-w-lg p-0 overflow-hidden">
          <VisuallyHidden>
            <DialogTitle>{selectedWorkflow?.pageTitle} Guide</DialogTitle>
            <DialogDescription>Step-by-step workflow guide for this page</DialogDescription>
          </VisuallyHidden>
          <div className="bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 text-white">
            <div className="flex items-center justify-between p-4 border-b border-slate-700">
              <div className="flex items-center gap-2">
                <BookOpen className="h-5 w-5 text-blue-400" />
                <span className="font-semibold">{selectedWorkflow?.pageTitle}</span>
              </div>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setIsOpen(false)}
                className="text-white hover:bg-white/10"
              >
                <X className="h-5 w-5" />
              </Button>
            </div>

            <div className="p-6">
              <AnimatePresence mode="wait">
                {slide && (
                  <motion.div
                    key={currentSlide}
                    initial={{ opacity: 0, x: 50 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -50 }}
                    transition={{ duration: 0.3 }}
                    className="space-y-4"
                  >
                    <div className="flex items-start gap-4">
                      <div className="w-20 h-20 flex-shrink-0">
                        <LotBuddy expression={buddyExpression} size="sm" />
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          {slide.icon}
                          <h3 className="text-xl font-bold">{slide.title}</h3>
                        </div>
                        <p className="text-slate-300 leading-relaxed">{slide.content}</p>
                      </div>
                    </div>

                    {slide.tips && slide.tips.length > 0 && (
                      <div className="bg-slate-800/50 rounded-lg p-4 space-y-2">
                        <div className="text-sm font-medium text-blue-400 flex items-center gap-2">
                          <CheckCircle2 className="h-4 w-4" />
                          Tips
                        </div>
                        <ul className="space-y-1">
                          {slide.tips.map((tip, i) => (
                            <li key={i} className="text-sm text-slate-400 flex items-start gap-2">
                              <span className="text-blue-400">•</span>
                              {tip}
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}

                    {slide.link && (
                      <Button
                        onClick={() => handleLinkClick(slide.link!.path)}
                        className="w-full bg-blue-600 hover:bg-blue-700"
                      >
                        <ExternalLink className="h-4 w-4 mr-2" />
                        {slide.link.label}
                      </Button>
                    )}

                    {slide.nextPage && (
                      <Button
                        onClick={() => handleLinkClick(slide.nextPage!.path)}
                        variant="outline"
                        className="w-full border-green-500 text-green-400 hover:bg-green-500/10"
                      >
                        <ArrowRight className="h-4 w-4 mr-2" />
                        {slide.nextPage.label}
                      </Button>
                    )}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            <div className="p-4 border-t border-slate-700">
              <Progress value={progress} className="mb-3 h-1" />
              <div className="flex items-center justify-between">
                <Button
                  onClick={prevSlide}
                  disabled={currentSlide === 0}
                  variant="ghost"
                  size="sm"
                  className="text-white hover:bg-white/10"
                >
                  <ChevronLeft className="h-4 w-4 mr-1" />
                  Back
                </Button>
                <span className="text-sm text-slate-400">
                  {currentSlide + 1} / {selectedWorkflow?.slides.length || 0}
                </span>
                <Button
                  onClick={nextSlide}
                  disabled={!selectedWorkflow || currentSlide === selectedWorkflow.slides.length - 1}
                  variant="ghost"
                  size="sm"
                  className="text-white hover:bg-white/10"
                >
                  Next
                  <ChevronRight className="h-4 w-4 ml-1" />
                </Button>
              </div>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}

export function FirstTimeOnboarding() {
  const [isOpen, setIsOpen] = useState(false);
  const [, setLocation] = useLocation();

  useEffect(() => {
    // DISABLED: Auto-show popup removed per user request
    // Users are now directed to Settings for policy acknowledgments
    // and can access tutorials via the "How-To Guide" button on each page
    // Keeping component for future manual triggering if needed
  }, []);

  const handleDismiss = () => {
    localStorage.setItem("vanops_seen_onboarding", "true");
    setIsOpen(false);
  };

  const handleStartTour = () => {
    localStorage.setItem("vanops_seen_onboarding", "true");
    setIsOpen(false);
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => {
      if (!open) handleDismiss();
      setIsOpen(open);
    }}>
      <DialogContent className="max-w-sm p-0 overflow-hidden">
        <VisuallyHidden>
          <DialogTitle>Welcome to Lot Ops Pro</DialogTitle>
          <DialogDescription>First time user onboarding</DialogDescription>
        </VisuallyHidden>
        <div className="bg-gradient-to-br from-blue-600 via-blue-700 to-purple-700 text-white p-6">
          <div className="flex flex-col items-center text-center space-y-4">
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: "spring", delay: 0.2 }}
              className="w-24 h-24"
            >
              <LotBuddy expression="waving" size="md" />
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              className="space-y-2"
            >
              <h2 className="text-2xl font-bold">First time here?</h2>
              <p className="text-blue-100">
                Hi! I'm Lot Buddy, your guide to mastering Lot Ops Pro!
              </p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.6 }}
              className="bg-white/20 rounded-lg p-4 text-sm"
            >
              <div className="flex items-center gap-2 mb-2">
                <BookOpen className="h-5 w-5" />
                <span className="font-semibold">Look for the "How-To Guide" button!</span>
              </div>
              <p className="text-blue-100">
                Every page has a tutorial button at the top. Tap it anytime to learn how that page works and where to go next!
              </p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.8 }}
              className="flex gap-3 w-full"
            >
              <Button
                onClick={handleDismiss}
                variant="ghost"
                className="flex-1 text-white hover:bg-white/20"
              >
                Got it!
              </Button>
              <Button
                onClick={handleStartTour}
                className="flex-1 bg-white text-blue-700 hover:bg-blue-50"
              >
                Start Here
                <ArrowRight className="h-4 w-4 ml-2" />
              </Button>
            </motion.div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

export default PageWorkflowGuide;
