import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import { PremiumAccordion, PremiumAccordionItem, PremiumAccordionTrigger, PremiumAccordionContent } from "@/components/ui/premium-accordion";
import { 
  HelpCircle, Map, Lightbulb, ChevronRight, 
  Home, ArrowRight, CheckCircle, BookOpen
} from "lucide-react";

export interface HelpStep {
  title: string;
  description: string;
  icon?: React.ReactNode;
}

export interface NavigationPath {
  name: string;
  path?: string;
  current?: boolean;
}

export interface PageHelpProps {
  pageName: string;
  pageDescription: string;
  steps: HelpStep[];
  navigationPath: NavigationPath[];
  tips?: string[];
  quickActions?: { label: string; description: string }[];
}

export function PageHelp({ 
  pageName, 
  pageDescription, 
  steps, 
  navigationPath,
  tips = [],
  quickActions = []
}: PageHelpProps) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      <Button
        size="icon"
        variant="ghost"
        onClick={() => setIsOpen(true)}
        className="fixed bottom-20 right-4 z-40 h-12 w-12 rounded-full bg-gradient-to-br from-blue-600 to-indigo-600 text-white shadow-lg shadow-blue-500/30 hover:from-blue-500 hover:to-indigo-500 border-2 border-blue-400/50"
        data-testid="button-page-help"
      >
        <HelpCircle className="h-6 w-6" />
      </Button>

      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogContent className="bg-gradient-to-br from-slate-900 via-blue-950 to-indigo-950 border-blue-500/50 max-w-lg max-h-[85vh]">
          <DialogHeader>
            <DialogTitle className="text-xl font-bold text-white flex items-center gap-2" data-testid="text-help-title">
              <BookOpen className="h-5 w-5 text-blue-400" />
              {pageName} Guide
            </DialogTitle>
            <p className="text-sm text-blue-200/80 mt-1">{pageDescription}</p>
          </DialogHeader>

          <ScrollArea className="max-h-[60vh] pr-2">
            <div className="space-y-4 py-2">
              <div className="bg-blue-900/30 rounded-lg p-3 border border-blue-500/30">
                <div className="flex items-center gap-2 mb-2">
                  <Map className="h-4 w-4 text-blue-400" />
                  <p className="text-xs font-bold text-blue-300 uppercase tracking-wide">You Are Here</p>
                </div>
                <div className="flex items-center flex-wrap gap-1">
                  {navigationPath.map((item, index) => (
                    <div key={index} className="flex items-center gap-1">
                      {index > 0 && <ChevronRight className="h-3 w-3 text-blue-400/50" />}
                      <span 
                        className={`text-xs px-2 py-1 rounded ${
                          item.current 
                            ? "bg-blue-500 text-white font-bold" 
                            : "bg-blue-900/50 text-blue-300"
                        }`}
                      >
                        {item.name}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              <PremiumAccordion type="single" collapsible defaultValue="steps">
                <PremiumAccordionItem value="steps" variant="glass">
                  <PremiumAccordionTrigger
                    icon={<CheckCircle className="h-4 w-4" />}
                    badge={`${steps.length} steps`}
                  >
                    How to Use This Page
                  </PremiumAccordionTrigger>
                  <PremiumAccordionContent>
                    <div className="space-y-3">
                      {steps.map((step, index) => (
                        <div 
                          key={index} 
                          className="flex items-start gap-3 p-3 bg-white/5 rounded-lg"
                        >
                          <div className="w-8 h-8 rounded-full bg-blue-500/20 flex items-center justify-center flex-shrink-0 text-blue-400 font-bold text-sm">
                            {index + 1}
                          </div>
                          <div>
                            <p className="text-sm font-semibold text-white">{step.title}</p>
                            <p className="text-xs text-blue-200/70 mt-0.5">{step.description}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </PremiumAccordionContent>
                </PremiumAccordionItem>

                {quickActions.length > 0 && (
                  <PremiumAccordionItem value="actions" variant="gradient">
                    <PremiumAccordionTrigger
                      icon={<ArrowRight className="h-4 w-4" />}
                      badge={`${quickActions.length}`}
                    >
                      Available Actions
                    </PremiumAccordionTrigger>
                    <PremiumAccordionContent>
                      <div className="space-y-2">
                        {quickActions.map((action, index) => (
                          <div 
                            key={index}
                            className="p-3 bg-white/5 rounded-lg"
                          >
                            <p className="text-sm font-semibold text-white">{action.label}</p>
                            <p className="text-xs text-blue-200/70">{action.description}</p>
                          </div>
                        ))}
                      </div>
                    </PremiumAccordionContent>
                  </PremiumAccordionItem>
                )}

                {tips.length > 0 && (
                  <PremiumAccordionItem value="tips" variant="premium">
                    <PremiumAccordionTrigger
                      icon={<Lightbulb className="h-4 w-4 text-yellow-400" />}
                      badge={`${tips.length} tips`}
                    >
                      Helpful Tips
                    </PremiumAccordionTrigger>
                    <PremiumAccordionContent>
                      <div className="space-y-2">
                        {tips.map((tip, index) => (
                          <div 
                            key={index}
                            className="flex items-start gap-2 p-2 bg-yellow-500/10 rounded-lg border border-yellow-500/20"
                          >
                            <Lightbulb className="h-4 w-4 text-yellow-400 flex-shrink-0 mt-0.5" />
                            <p className="text-xs text-yellow-100">{tip}</p>
                          </div>
                        ))}
                      </div>
                    </PremiumAccordionContent>
                  </PremiumAccordionItem>
                )}
              </PremiumAccordion>

              <div className="bg-gradient-to-r from-emerald-900/40 to-teal-900/40 rounded-lg p-3 border border-emerald-500/30">
                <div className="flex items-center gap-2">
                  <Home className="h-4 w-4 text-emerald-400" />
                  <p className="text-xs text-emerald-200">
                    <span className="font-semibold">Need more help?</span> Tap the menu icon and select "Tutorials" for guided walkthroughs.
                  </p>
                </div>
              </div>
            </div>
          </ScrollArea>

          <div className="pt-2">
            <Button
              onClick={() => setIsOpen(false)}
              className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white"
              data-testid="button-close-help"
            >
              Got It
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
