import { useState } from "react";
import { motion } from "framer-motion";
import { BookOpen, X, Search, ChevronRight, Play, FileText, Video } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { LotBuddy } from "./LotBuddy";
import { useTour, getTourStepsForRole } from "./InteractiveTour";

interface GuideSection {
  id: string;
  title: string;
  description: string;
  duration: string;
  steps: string[];
  forRoles: string[];
}

const guideSections: GuideSection[] = [
  {
    id: "getting-started",
    title: "Getting Started",
    description: "Learn the basics of navigating Lot Ops Pro",
    duration: "2 min",
    steps: [
      "Log in with your PIN",
      "Understand your dashboard",
      "Check your assignments",
      "Navigate between screens"
    ],
    forRoles: ["driver", "inventory", "supervisor", "operations_manager", "developer"]
  },
  {
    id: "vehicle-moves",
    title: "Moving Vehicles",
    description: "Complete your assignments with GPS guidance",
    duration: "3 min",
    steps: [
      "View your assignment list",
      "Tap a vehicle to see details",
      "Use GPS navigation to find it",
      "Mark as complete when done"
    ],
    forRoles: ["driver"]
  },
  {
    id: "scanning-vehicles",
    title: "Scanning & Logging",
    description: "Use the OCR camera to scan VINs and work orders",
    duration: "3 min",
    steps: [
      "Open the scanner from the menu",
      "Point camera at VIN or barcode",
      "Select the routing code",
      "Confirm the location"
    ],
    forRoles: ["inventory", "driver"]
  },
  {
    id: "managing-drivers",
    title: "Managing Your Crew",
    description: "Assign work and monitor driver progress",
    duration: "4 min",
    steps: [
      "View active drivers on the map",
      "Create or modify assignments",
      "Send messages to drivers",
      "Review completion status"
    ],
    forRoles: ["supervisor"]
  },
  {
    id: "lane-management",
    title: "Lane Configuration",
    description: "Set up lanes and manage sale day traffic",
    duration: "4 min",
    steps: [
      "Access lane settings",
      "Configure rows and capacity",
      "Set up blockoffs for repairs",
      "Manage overflow zones"
    ],
    forRoles: ["supervisor", "operations_manager"]
  },
  {
    id: "ai-optimization",
    title: "AI Lot Optimization",
    description: "Use AI suggestions to improve lot efficiency",
    duration: "3 min",
    steps: [
      "View AI-generated suggestions",
      "Understand priority levels",
      "Apply recommendations",
      "Track improvements"
    ],
    forRoles: ["operations_manager"]
  },
  {
    id: "performance-reports",
    title: "Performance Analytics",
    description: "Review metrics and generate reports",
    duration: "4 min",
    steps: [
      "Access the analytics dashboard",
      "Filter by date range",
      "Export reports",
      "Share with stakeholders"
    ],
    forRoles: ["supervisor", "operations_manager"]
  },
  {
    id: "safety-reporting",
    title: "Safety & Incidents",
    description: "Report and track safety incidents",
    duration: "3 min",
    steps: [
      "Report an incident",
      "Upload photos or videos",
      "Track resolution status",
      "Review safety metrics"
    ],
    forRoles: ["driver", "supervisor", "safety_advisor"]
  }
];

interface HowToGuideButtonProps {
  userRole?: string;
  className?: string;
}

export function HowToGuideButton({ userRole = "driver", className = "" }: HowToGuideButtonProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedGuide, setSelectedGuide] = useState<GuideSection | null>(null);
  const { startTour } = useTour();

  const filteredGuides = guideSections.filter(guide => {
    const matchesRole = guide.forRoles.includes(userRole) || guide.forRoles.includes("developer");
    const matchesSearch = searchQuery === "" || 
      guide.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      guide.description.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesRole && matchesSearch;
  });

  const handleStartTour = () => {
    const steps = getTourStepsForRole(userRole);
    startTour(steps);
    setIsOpen(false);
  };

  return (
    <>
      <Button
        variant="outline"
        size="sm"
        onClick={() => setIsOpen(true)}
        className={`gap-2 ${className}`}
        data-testid="button-how-to-guide"
      >
        <BookOpen className="w-4 h-4" />
        <span className="hidden sm:inline">How-To Guide</span>
      </Button>

      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogContent className="max-w-lg max-h-[80vh] p-0 overflow-hidden">
          <DialogHeader className="p-4 pb-0">
            <DialogTitle className="flex items-center gap-3">
              <LotBuddy expression="speaking" size="sm" animated={false} />
              <span>How-To Guide</span>
            </DialogTitle>
            <DialogDescription>
              Learn how to use all the features of Lot Ops Pro
            </DialogDescription>
          </DialogHeader>

          <Tabs defaultValue="guides" className="flex-1">
            <TabsList className="w-full justify-start px-4 bg-transparent border-b rounded-none">
              <TabsTrigger value="guides" className="data-[state=active]:bg-orange-50">
                <FileText className="w-4 h-4 mr-2" />
                Guides
              </TabsTrigger>
              <TabsTrigger value="tour" className="data-[state=active]:bg-orange-50">
                <Play className="w-4 h-4 mr-2" />
                Interactive Tour
              </TabsTrigger>
            </TabsList>

            <TabsContent value="guides" className="p-4 pt-2 m-0">
              <div className="relative mb-4">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-slate-400" />
                <Input
                  placeholder="Search guides..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                  data-testid="input-search-guides"
                />
              </div>

              <ScrollArea className="h-[50vh]">
                {selectedGuide ? (
                  <motion.div
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    className="space-y-4"
                  >
                    <button
                      onClick={() => setSelectedGuide(null)}
                      className="text-sm text-orange-600 hover:text-orange-700 flex items-center gap-1"
                      data-testid="button-back-to-guides"
                    >
                      ← Back to guides
                    </button>

                    <div>
                      <h3 className="text-lg font-bold text-slate-800">{selectedGuide.title}</h3>
                      <p className="text-sm text-slate-500">{selectedGuide.duration} read</p>
                    </div>

                    <p className="text-slate-600">{selectedGuide.description}</p>

                    <div className="space-y-3">
                      <h4 className="font-medium text-slate-700">Steps:</h4>
                      {selectedGuide.steps.map((step, idx) => (
                        <div key={idx} className="flex items-start gap-3 p-3 bg-slate-50 rounded-lg">
                          <div className="w-6 h-6 rounded-full bg-orange-500 text-white flex items-center justify-center text-sm font-bold flex-shrink-0">
                            {idx + 1}
                          </div>
                          <p className="text-slate-600">{step}</p>
                        </div>
                      ))}
                    </div>
                  </motion.div>
                ) : (
                  <div className="space-y-2">
                    {filteredGuides.map((guide) => (
                      <motion.button
                        key={guide.id}
                        onClick={() => setSelectedGuide(guide)}
                        className="w-full p-3 bg-slate-50 hover:bg-orange-50 rounded-lg text-left transition-colors group"
                        whileHover={{ scale: 1.01 }}
                        data-testid={`button-guide-${guide.id}`}
                      >
                        <div className="flex items-center justify-between">
                          <div>
                            <h4 className="font-medium text-slate-800 group-hover:text-orange-600">
                              {guide.title}
                            </h4>
                            <p className="text-sm text-slate-500">{guide.description}</p>
                          </div>
                          <div className="flex items-center gap-2">
                            <span className="text-xs text-slate-400">{guide.duration}</span>
                            <ChevronRight className="w-4 h-4 text-slate-400 group-hover:text-orange-500" />
                          </div>
                        </div>
                      </motion.button>
                    ))}

                    {filteredGuides.length === 0 && (
                      <div className="text-center py-8 text-slate-500">
                        No guides found matching your search
                      </div>
                    )}
                  </div>
                )}
              </ScrollArea>
            </TabsContent>

            <TabsContent value="tour" className="p-4 m-0">
              <div className="text-center py-8 space-y-4">
                <div className="flex justify-center">
                  <LotBuddy expression="pointing" size="lg" animated />
                </div>
                
                <h3 className="text-lg font-bold text-slate-800">Interactive Tour</h3>
                <p className="text-slate-600">
                  Let me show you around! I'll highlight each feature and explain what it does.
                </p>
                
                <div className="bg-amber-50 p-3 rounded-lg text-sm text-amber-700">
                  Estimated time: 2-4 minutes based on your role
                </div>

                <Button
                  onClick={handleStartTour}
                  className="bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600"
                  data-testid="button-start-interactive-tour"
                >
                  <Play className="w-4 h-4 mr-2" />
                  Start Tour
                </Button>
              </div>
            </TabsContent>
          </Tabs>
        </DialogContent>
      </Dialog>
    </>
  );
}
