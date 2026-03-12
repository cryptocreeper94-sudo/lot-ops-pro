import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { AlertTriangle, Info, Hammer } from "lucide-react";

interface BetaWelcomeModalProps {
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
}

export function BetaWelcomeModal({ open, onOpenChange }: BetaWelcomeModalProps) {
  const [internalOpen, setInternalOpen] = useState(false);
  
  // Determine if we are in controlled mode (via props) or uncontrolled (auto-show)
  const isControlled = open !== undefined;
  const show = isControlled ? open : internalOpen;
  const setShow = isControlled ? onOpenChange : setInternalOpen;

  useEffect(() => {
    // Only run auto-show logic if NOT controlled
    if (!isControlled) {
      const hasShown = sessionStorage.getItem("vanops_beta_welcome_shown");
      if (!hasShown) {
        const timer = setTimeout(() => setInternalOpen(true), 1000);
        return () => clearTimeout(timer);
      }
    }
  }, [isControlled]);

  const handleClose = () => {
    if (setShow) setShow(false);
    if (!isControlled) {
      sessionStorage.setItem("vanops_beta_welcome_shown", "true");
    }
  };

  return (
    <Dialog open={show} onOpenChange={setShow}>
      <DialogContent className="max-w-lg max-h-[90vh] flex flex-col">
        <div className="overflow-y-auto flex-1 pr-4">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-xl">
              <Hammer className="h-5 w-5 text-orange-500" />
              Welcome to VanOps Pro (Beta)
            </DialogTitle>
            <DialogDescription className="pt-2 space-y-3 text-base">
              <div className="bg-blue-50 p-3 rounded-lg border border-blue-100 text-blue-900 text-sm">
                <p className="font-semibold flex items-center gap-2 mb-1">
                  <Info className="h-4 w-4" /> Quick Instructions
                </p>
                <ul className="list-disc pl-5 space-y-1">
                  <li><strong>Supervisors:</strong> Use the "Roster" tab to assign driver numbers to employees. Use "Dispatch" to monitor activity.</li>
                  <li><strong>Drivers:</strong> Log in with your Badge ID. You will see your assigned van number for the day.</li>
                  <li><strong>Status:</strong> Keep your status updated (Active, Break, etc.) so the team knows your availability.</li>
                </ul>
              </div>

              <div className="bg-orange-50 p-3 rounded-lg border border-orange-100 text-orange-900 text-sm">
                <p className="font-semibold flex items-center gap-2 mb-1">
                  <AlertTriangle className="h-4 w-4" /> Beta Test Mode
                </p>
                <p>
                  This application is currently in <strong>active development</strong>. 
                  We are testing functionality tonight to identify improvements.
                </p>
                <p className="mt-2">
                  Please report any issues or suggestions to Jason. Thank you for helping us build a better system!
                </p>
              </div>
            </DialogDescription>
          </DialogHeader>
        </div>
        <DialogFooter className="mt-4">
          <Button onClick={handleClose} data-testid="button-close-welcome" className="w-full sm:w-auto bg-blue-600 hover:bg-blue-700">
            I Understand - Let's Begin
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
