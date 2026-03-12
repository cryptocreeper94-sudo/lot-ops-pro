import { useState, useEffect } from "react";
import { useLocation } from "wouter";
import { 
  QrCode, 
  ListTodo, 
  Coffee, 
  Minimize2, 
  AlertTriangle, 
  Navigation,
  HelpCircle,
  ShieldCheck,
  MessageCircle,
  BookOpen
} from "lucide-react";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useToast } from "@/hooks/use-toast";
import { NavigationControl } from "@/components/NavigationControl";
import { BentoGrid, BentoTile } from "@/components/ui/bento-grid";
import { 
  PremiumAccordion, 
  PremiumAccordionItem, 
  PremiumAccordionTrigger, 
  PremiumAccordionContent 
} from "@/components/ui/premium-accordion";
import { PremiumButton } from "@/components/ui/premium-button";

export default function HelpGuide() {
  const [location, setLocation] = useLocation();
  const { toast } = useToast();
  
  useEffect(() => {
    const userStr = localStorage.getItem("vanops_user");
    if (userStr) {
      const user = JSON.parse(userStr);
      if (user.employeeType === "temporary") {
        toast({
          title: "Access Restricted",
          description: "Temporary employees cannot access Help",
          variant: "destructive",
        });
        setTimeout(() => setLocation("/scanner"), 500);
      }
    }
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex flex-col">
      <div className="bg-slate-900/80 backdrop-blur-xl text-white p-4 sticky top-0 z-10 shadow-lg border-b border-white/10">
        <div className="flex items-center gap-3">
          <NavigationControl variant="back" fallbackRoute="/driver-dashboard" />
          <h1 className="text-xl font-bold flex items-center gap-2" data-testid="text-help-title">
            <HelpCircle className="h-6 w-6 text-blue-400" /> Driver Manual
          </h1>
        </div>
      </div>

      <ScrollArea className="flex-1 p-4">
        <div className="max-w-4xl mx-auto space-y-6 pb-10">
          
          <BentoTile 
            size="wide" 
            variant="premium" 
            sparkle 
            interactive={false}
            className="text-center"
            data-testid="tile-header"
          >
            <div className="space-y-2">
              <h2 className="text-2xl font-bold text-white">VanOps Pro Guide</h2>
              <p className="text-amber-200/80">Official procedures for Manheim Nashville (326 Acres).</p>
            </div>
          </BentoTile>

          <BentoGrid columns={2} gap="md">
            <BentoTile 
              variant="glass" 
              size="md"
              interactive={false}
              icon={<BookOpen className="h-5 w-5" />}
              title="4 Topics"
              description="Core procedures covered"
              data-testid="tile-topics-count"
            />
            <BentoTile 
              variant="glass" 
              size="md"
              interactive={false}
              icon={<MessageCircle className="h-5 w-5" />}
              title="Live Support"
              description="Chat with dispatch anytime"
              data-testid="tile-support-info"
            />
          </BentoGrid>

          <PremiumAccordion type="single" collapsible defaultValue="item-1">
            
            <PremiumAccordionItem value="item-1" variant="gradient">
              <PremiumAccordionTrigger 
                icon={<ShieldCheck className="h-5 w-5" />}
                badge="Step 1"
                description="Driver Numbers & Roles"
                data-testid="accordion-trigger-starting-shift"
              >
                Starting Your Shift
              </PremiumAccordionTrigger>
              <PremiumAccordionContent>
                <div className="text-slate-300 space-y-3" data-testid="accordion-content-starting-shift">
                  <p>Every shift begins with a new assignment.</p>
                  <ul className="list-disc pl-5 space-y-1">
                    <li><strong className="text-white">Driver Number:</strong> Enter the 2-3 digit number assigned by your supervisor for <em>today only</em>. Do not use your employee ID.</li>
                    <li><strong className="text-white">Select Role:</strong> Choose your primary zone (e.g., "The Chute" or "Clean Side"). This helps dispatch know where you are.</li>
                    <li><strong className="text-white">GPS Lock:</strong> Wait for the satellite icon to turn <span className="text-green-400 font-bold">GREEN</span> before starting.</li>
                  </ul>
                </div>
              </PremiumAccordionContent>
            </PremiumAccordionItem>

            <PremiumAccordionItem value="item-2" variant="gradient">
              <PremiumAccordionTrigger 
                icon={<QrCode className="h-5 w-5" />}
                badge="Step 2"
                description="QR Codes & Special Logic"
                data-testid="accordion-trigger-scanning"
              >
                Scanning & Routing
              </PremiumAccordionTrigger>
              <PremiumAccordionContent>
                <div className="text-slate-300 space-y-3" data-testid="accordion-content-scanning">
                  <p>The primary way to work is by scanning the vehicle tag.</p>
                  <div className="bg-slate-800/50 p-3 rounded-lg border border-slate-700">
                    <span className="font-bold text-white">The "DLR" Rule:</span>
                    <p className="text-sm mt-1">If you scan a code and see "DLR", the app will ask: <strong className="text-amber-400">"Is ARS on the windshield?"</strong></p>
                    <ul className="list-disc pl-5 mt-2 text-sm">
                      <li><strong className="text-green-400">YES:</strong> Take unit to Lane 215/225.</li>
                      <li><strong className="text-red-400">NO:</strong> Take unit to Lot 520.</li>
                    </ul>
                  </div>
                  <p><strong className="text-white">Codes & Destinations:</strong></p>
                  <ul className="list-disc pl-5 space-y-1 text-sm">
                    <li><strong className="text-blue-400">DSC:</strong> Lane 257</li>
                    <li><strong className="text-blue-400">REG:</strong> Lane 227</li>
                    <li><strong className="text-blue-400">FOR:</strong> Section 516 (Ford Motor Credit)</li>
                    <li><strong className="text-blue-400">SOLD:</strong> Lot 801</li>
                  </ul>
                </div>
              </PremiumAccordionContent>
            </PremiumAccordionItem>

            <PremiumAccordionItem value="item-3" variant="gradient">
              <PremiumAccordionTrigger 
                icon={<ListTodo className="h-5 w-5" />}
                badge="Step 3"
                description="When Scanner Fails"
                data-testid="accordion-trigger-manual"
              >
                Manual Code Entry
              </PremiumAccordionTrigger>
              <PremiumAccordionContent>
                <div className="text-slate-300 space-y-3" data-testid="accordion-content-manual">
                  <p>If the QR code is damaged or missing, use the <strong className="text-amber-400">"Manual Code Entry"</strong> button.</p>
                  <ul className="list-disc pl-5 space-y-1">
                    <li><strong className="text-white">Type the Abbreviation:</strong> Enter "DSC" → App shows "Lane 257".</li>
                    <li><strong className="text-white">Type the Lot:</strong> Enter "257" → App shows "DSC".</li>
                    <li>Tap <strong className="text-green-400">"Start Route"</strong> to begin guidance just like a scan.</li>
                  </ul>
                </div>
              </PremiumAccordionContent>
            </PremiumAccordionItem>

            <PremiumAccordionItem value="item-4" variant="gradient">
              <PremiumAccordionTrigger 
                icon={<Coffee className="h-5 w-5" />}
                badge="Step 4"
                description="Time Management"
                data-testid="accordion-trigger-breaks"
              >
                Breaks & Crunch Mode
              </PremiumAccordionTrigger>
              <PremiumAccordionContent>
                <div className="text-slate-300 space-y-3" data-testid="accordion-content-breaks">
                  <p><strong className="text-white">Breaks:</strong> You have two 15-minute breaks and one 30-minute break per shift. Use the "BREAK" button in the top header. A large timer will appear.</p>
                  <div className="border-t border-slate-700 my-2"></div>
                  <div className="flex items-start gap-2">
                    <Minimize2 className="h-5 w-5 text-blue-400 mt-0.5 flex-shrink-0" />
                    <div>
                      <span className="font-bold text-white">Crunch Mode:</span>
                      <p className="text-sm">Use this for non-driving tasks like Fronting Lines or Jump Starting. It pauses your "Moves Per Hour" quota so your stats don't drop.</p>
                    </div>
                  </div>
                </div>
              </PremiumAccordionContent>
            </PremiumAccordionItem>

          </PremiumAccordion>

          <BentoTile 
            variant="glow" 
            size="wide" 
            interactive={false}
            className="text-center"
            sparkle
            data-testid="tile-supervisor-help"
          >
            <div className="space-y-3">
              <h3 className="font-bold text-lg text-white">Need Supervisor Help?</h3>
              <p className="text-sm text-blue-200">Use the Chat Bubble in the bottom right corner to message dispatch directly.</p>
              <PremiumButton 
                variant="primary" 
                size="md"
                icon={<MessageCircle className="h-4 w-4" />}
                onClick={() => toast({ title: "Chat Feature", description: "Look for the chat bubble in the corner!" })}
                data-testid="button-open-chat"
              >
                Open Chat
              </PremiumButton>
            </div>
          </BentoTile>

        </div>
      </ScrollArea>
    </div>
  );
}
