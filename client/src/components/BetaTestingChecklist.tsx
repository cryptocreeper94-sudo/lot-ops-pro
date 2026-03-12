import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { ScrollArea } from "@/components/ui/scroll-area";
import { 
  CheckCircle2, 
  XCircle, 
  Camera, 
  Send, 
  ClipboardCheck,
  AlertTriangle,
  ShieldCheck,
  Truck,
  MessageSquare,
  Sparkles,
  Music,
  Newspaper,
  Map,
  BarChart3,
  Users,
  Calendar,
  Lock
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface TestItem {
  id: string;
  category: string;
  feature: string;
  description: string;
  icon: any;
  roles: string[];
}

const TEST_ITEMS: TestItem[] = [
  // Authentication & Security
  {
    id: "two_factor_auth",
    category: "Authentication",
    feature: "Two-Factor Authentication",
    description: "Daily access code + PIN login for drivers (supervisors bypass daily code)",
    icon: ShieldCheck,
    roles: ["all"]
  },
  {
    id: "pin_login",
    category: "Authentication",
    feature: "PIN-Based Login",
    description: "4-digit PIN login with 12-hour session persistence",
    icon: Lock,
    roles: ["all"]
  },
  {
    id: "demo_mode",
    category: "Authentication",
    feature: "Demo Mode",
    description: "30-minute sandbox with role selection and no database writes",
    icon: ClipboardCheck,
    roles: ["all"]
  },
  
  // Driver Features
  {
    id: "ocr_scanner",
    category: "Driver Tools",
    feature: "OCR Camera Scanner",
    description: "Live camera preview, VIN/lot code scanning, post-scan confirmation",
    icon: Camera,
    roles: ["driver", "inventory"]
  },
  {
    id: "gps_navigation",
    category: "Driver Tools",
    feature: "GPS Navigation & Routing",
    description: "Auto-GPS waypoints, serpentine lane routing, distance calculation",
    icon: Map,
    roles: ["driver", "inventory"]
  },
  {
    id: "shift_management",
    category: "Driver Tools",
    feature: "Shift Clock In/Out",
    description: "Clock in/out, lunch breaks, grace periods, shift cycle UX",
    icon: Calendar,
    roles: ["driver", "inventory"]
  },
  {
    id: "performance_tracking",
    category: "Driver Tools",
    feature: "Performance Tracking",
    description: "Real-time MPH, quota alerts, bonus estimation, efficiency scoring",
    icon: BarChart3,
    roles: ["driver", "inventory"]
  },
  
  // Communication
  {
    id: "messaging_system",
    category: "Communication",
    feature: "Driver-Supervisor Messaging",
    description: "Floating button, real-time messaging, unread indicators, quick replies",
    icon: MessageSquare,
    roles: ["all"]
  },
  {
    id: "supervisor_messaging",
    category: "Communication",
    feature: "Supervisor-to-Supervisor Chat",
    description: "Direct communication between supervisors and operations manager",
    icon: Users,
    roles: ["supervisor", "operations_manager"]
  },
  
  // Advanced Features
  {
    id: "ai_assistant",
    category: "AI Features",
    feature: "AI Assistant",
    description: "Conversational AI with voice input/output, navigation assistance",
    icon: Sparkles,
    roles: ["all"]
  },
  {
    id: "media_player",
    category: "Entertainment",
    feature: "Media Player with GPS Safety",
    description: "YouTube/Facebook/TikTok playback disabled while driving",
    icon: Music,
    roles: ["driver", "inventory"]
  },
  {
    id: "news_widget",
    category: "Information",
    feature: "Fox 17 Nashville News",
    description: "Live news button widget above weather",
    icon: Newspaper,
    roles: ["all"]
  },
  
  // Management Features
  {
    id: "daily_code_display",
    category: "Management",
    feature: "Daily Access Code Display",
    description: "Auto-generated 6-digit code shown on supervisor/manager dashboards",
    icon: ShieldCheck,
    roles: ["supervisor", "operations_manager"]
  },
  {
    id: "roster_management",
    category: "Management",
    feature: "Crew Roster Management",
    description: "Assign drivers to crews, manage designations, track assignments",
    icon: Users,
    roles: ["supervisor", "operations_manager"]
  },
  {
    id: "performance_reports",
    category: "Management",
    feature: "Performance Reports",
    description: "Daily/weekly/monthly/quarterly/yearly employee reviews",
    icon: BarChart3,
    roles: ["supervisor", "operations_manager"]
  }
];

export function BetaTestingChecklist() {
  const { toast } = useToast();
  const [checkedItems, setCheckedItems] = useState<Set<string>>(new Set());
  const [bugReportDialog, setBugReportDialog] = useState(false);
  const [selectedFeature, setSelectedFeature] = useState<TestItem | null>(null);
  const [bugDescription, setBugDescription] = useState("");
  const [screenshot, setScreenshot] = useState<string>("");
  
  // Get user role
  const userStr = localStorage.getItem("vanops_user");
  const user = userStr ? JSON.parse(userStr) : null;
  const userRole = user?.role || "driver";

  // Load saved progress
  useEffect(() => {
    const saved = localStorage.getItem("beta_testing_progress");
    if (saved) {
      setCheckedItems(new Set(JSON.parse(saved)));
    }
  }, []);

  const saveProgress = (items: Set<string>) => {
    localStorage.setItem("beta_testing_progress", JSON.stringify(Array.from(items)));
  };

  const toggleCheck = (itemId: string) => {
    const newChecked = new Set(checkedItems);
    if (newChecked.has(itemId)) {
      newChecked.delete(itemId);
    } else {
      newChecked.add(itemId);
    }
    setCheckedItems(newChecked);
    saveProgress(newChecked);
    
    toast({
      title: newChecked.has(itemId) ? "✓ Marked as Working" : "Unmarked",
      description: TEST_ITEMS.find(i => i.id === itemId)?.feature,
    });
  };

  const captureScreenshot = async () => {
    try {
      // Use HTML2Canvas or similar - for now, just simulate
      const canvas = document.createElement('canvas');
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
      const ctx = canvas.getContext('2d');
      
      if (ctx) {
        ctx.fillStyle = '#1e293b';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        ctx.fillStyle = '#fff';
        ctx.font = '20px Arial';
        ctx.fillText('Screenshot captured at ' + new Date().toLocaleString(), 50, 50);
        
        const dataUrl = canvas.toDataURL('image/png');
        setScreenshot(dataUrl);
      }
      
      toast({
        title: "📸 Screenshot Captured",
        description: "Screenshot attached to bug report",
      });
    } catch (error) {
      toast({
        title: "Screenshot Failed",
        description: "Could not capture screenshot",
        variant: "destructive"
      });
    }
  };

  const openBugReport = (item: TestItem) => {
    setSelectedFeature(item);
    setBugDescription("");
    setScreenshot("");
    setBugReportDialog(true);
    
    // Auto-capture screenshot
    setTimeout(() => captureScreenshot(), 100);
  };

  const submitBugReport = () => {
    if (!selectedFeature) return;
    
    const bugReport = {
      feature: selectedFeature.feature,
      category: selectedFeature.category,
      description: bugDescription,
      screenshot: screenshot,
      userRole: userRole,
      timestamp: new Date().toISOString(),
      userName: user?.name || "Unknown"
    };

    // Save to localStorage (in production, would send to backend)
    const existingBugs = JSON.parse(localStorage.getItem("beta_bug_reports") || "[]");
    existingBugs.push(bugReport);
    localStorage.setItem("beta_bug_reports", JSON.stringify(existingBugs));
    
    toast({
      title: "🐛 Bug Report Submitted",
      description: `Report for "${selectedFeature.feature}" has been logged`,
    });
    
    setBugReportDialog(false);
  };

  // Filter items by user role
  const filteredItems = TEST_ITEMS.filter(item => 
    item.roles.includes("all") || item.roles.includes(userRole)
  );

  const categories = Array.from(new Set(filteredItems.map(i => i.category)));
  const completedCount = filteredItems.filter(i => checkedItems.has(i.id)).length;
  const totalCount = filteredItems.length;
  const progressPercent = totalCount > 0 ? Math.round((completedCount / totalCount) * 100) : 0;

  return (
    <div className="space-y-4">
      {/* Header Stats */}
      <Card className="border-blue-200 bg-gradient-to-br from-blue-50 to-white">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-base flex items-center gap-2">
                <ClipboardCheck className="w-5 h-5 text-blue-600" />
                Beta Testing Checklist
              </CardTitle>
              <CardDescription className="text-xs mt-1">
                Test features and report bugs with one click
              </CardDescription>
            </div>
            <div className="text-right">
              <div className="text-3xl font-black text-blue-900">{progressPercent}%</div>
              <div className="text-xs text-slate-600">{completedCount}/{totalCount} tested</div>
            </div>
          </div>
        </CardHeader>
      </Card>

      {/* Testing Items by Category */}
      <ScrollArea className="h-[600px]">
        <div className="space-y-6 pr-4">
          {categories.map(category => {
            const categoryItems = filteredItems.filter(i => i.category === category);
            const categoryCompleted = categoryItems.filter(i => checkedItems.has(i.id)).length;
            
            return (
              <div key={category}>
                <div className="flex items-center justify-between mb-3">
                  <h3 className="font-bold text-slate-900">{category}</h3>
                  <Badge variant="outline" className="text-xs">
                    {categoryCompleted}/{categoryItems.length}
                  </Badge>
                </div>
                
                <div className="space-y-2">
                  {categoryItems.map(item => {
                    const Icon = item.icon;
                    const isChecked = checkedItems.has(item.id);
                    
                    return (
                      <Card 
                        key={item.id} 
                        className={`transition-all ${
                          isChecked 
                            ? 'border-green-300 bg-green-50/50' 
                            : 'border-slate-200 hover:border-slate-300'
                        }`}
                      >
                        <CardContent className="p-4">
                          <div className="flex items-start gap-3">
                            <div className="flex items-center gap-3 flex-1">
                              <Checkbox
                                checked={isChecked}
                                onCheckedChange={() => toggleCheck(item.id)}
                                className="mt-1"
                                data-testid={`checkbox-test-${item.id}`}
                              />
                              
                              <Icon className={`w-5 h-5 flex-shrink-0 mt-0.5 ${
                                isChecked ? 'text-green-600' : 'text-slate-400'
                              }`} />
                              
                              <div className="flex-1">
                                <div className="font-semibold text-sm text-slate-900">
                                  {item.feature}
                                </div>
                                <div className="text-xs text-slate-600 mt-0.5">
                                  {item.description}
                                </div>
                              </div>
                            </div>
                            
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => openBugReport(item)}
                              className="border-orange-300 text-orange-700 hover:bg-orange-50 flex-shrink-0"
                              data-testid={`button-report-${item.id}`}
                            >
                              <AlertTriangle className="w-3.5 h-3.5 mr-1.5" />
                              Report Bug
                            </Button>
                          </div>
                        </CardContent>
                      </Card>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>
      </ScrollArea>

      {/* Bug Report Dialog */}
      <Dialog open={bugReportDialog} onOpenChange={setBugReportDialog}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <AlertTriangle className="w-5 h-5 text-orange-600" />
              Report Bug: {selectedFeature?.feature}
            </DialogTitle>
            <DialogDescription>
              Describe the issue you encountered. Screenshot automatically captured.
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4">
            <div>
              <label className="text-sm font-semibold text-slate-700">Bug Description</label>
              <Textarea
                value={bugDescription}
                onChange={(e) => setBugDescription(e.target.value)}
                placeholder="Describe what went wrong, what you expected to happen, and steps to reproduce..."
                className="mt-1.5 min-h-[120px]"
                data-testid="textarea-bug-description"
              />
            </div>
            
            {screenshot && (
              <div>
                <label className="text-sm font-semibold text-slate-700 flex items-center gap-2">
                  <Camera className="w-4 h-4" />
                  Screenshot Attached
                </label>
                <div className="mt-1.5 border border-slate-200 rounded-lg p-2 bg-slate-50">
                  <img src={screenshot} alt="Screenshot" className="w-full rounded" />
                </div>
              </div>
            )}
          </div>
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setBugReportDialog(false)}>
              Cancel
            </Button>
            <Button 
              onClick={submitBugReport}
              disabled={!bugDescription.trim()}
              className="bg-orange-600 hover:bg-orange-700"
              data-testid="button-submit-bug"
            >
              <Send className="w-4 h-4 mr-2" />
              Submit Bug Report
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
