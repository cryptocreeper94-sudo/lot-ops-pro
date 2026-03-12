import { useState, useRef } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { Shield, ChevronDown, ChevronUp, Download, Award } from "lucide-react";

interface TermsOfServiceProps {
  open: boolean;
  onAccept: () => void;
  userName: string;
}

export function TermsOfService({ open, onAccept, userName }: TermsOfServiceProps) {
  const [agreed, setAgreed] = useState(false);
  const [showDetails, setShowDetails] = useState(false);
  const [showCertificate, setShowCertificate] = useState(false);
  const certificateRef = useRef<HTMLDivElement>(null);

  const handleAccept = () => {
    if (agreed) {
      setShowCertificate(true);
      // Give them 3 seconds to enjoy the certificate, then continue
      setTimeout(() => {
        onAccept();
      }, 3000);
    }
  };

  const downloadCertificate = () => {
    // Simple text version download
    const currentDate = new Date().toLocaleDateString('en-US', { 
      month: 'long', 
      day: 'numeric', 
      year: 'numeric' 
    });
    
    const certificateText = `
╔═══════════════════════════════════════════════════════════════════╗
║                                                                   ║
║          🏆 OFFICIAL CERTIFICATE OF INTELLECTUAL HONESTY 🏆       ║
║                                                                   ║
║                     Presented to: ${userName.toUpperCase()}                     
║                                                                   ║
║   This certifies that the above individual has SUCCESSFULLY      ║
║   agreed not to copy, steal, reverse-engineer, or otherwise      ║
║   mess with Lot Ops Pro.                                         ║
║                                                                   ║
║   In today's world, we need signatures for everything. Yes,      ║
║   even agreeing not to steal software. Wild times we live in.    ║
║                                                                   ║
║   But hey - you didn't have to give us your children's blood     ║
║   type, social security number, or first-born child. Just a      ║
║   simple "I won't copy this app." That's progress!               ║
║                                                                   ║
║   Congratulations! You're now authorized to use Lot Ops Pro      ║
║   without any weird legal drama. Let's get to work.              ║
║                                                                   ║
║   ────────────────────────────────────────────────────────       ║
║   Signed: DarkWave Studios                                       ║
║   Date: ${currentDate}                                           ║
║   Status: Officially Not a Code Thief ✓                          ║
║                                                                   ║
╚═══════════════════════════════════════════════════════════════════╝

© 2025 DarkWave Studios • Lot Ops Pro
This certificate has no actual legal value, but it sure is fun.
The checkbox you clicked? THAT was the legally binding part.
`;

    const blob = new Blob([certificateText], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `Lot_Ops_Pro_Certificate_${userName.replace(/\s/g, '_')}.txt`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  return (
    <Dialog open={open} onOpenChange={() => {}}>
      <DialogContent 
        className="max-w-lg" 
        onEscapeKeyDown={(e) => e.preventDefault()} 
        onPointerDownOutside={(e) => e.preventDefault()}
      >
        {!showCertificate ? (
          <>
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2 text-lg">
                <Shield className="h-5 w-5 text-blue-600" />
                Quick Agreement
              </DialogTitle>
            </DialogHeader>

        <div className="space-y-4">
          {/* Simple Summary */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <p className="text-sm text-slate-700 leading-relaxed">
              Hey {userName}! Before you start using Lot Ops Pro, we just need you to agree to one thing:
            </p>
            <p className="text-base font-semibold text-slate-900 mt-3">
              This protects the intellectual property inside this app.
            </p>
            <p className="text-sm text-slate-600 mt-2">
              Basically: Don't copy the app, don't share the code, keep it confidential. That's it.
            </p>
          </div>

          {/* Agreement Checkbox */}
          <div className="flex items-start gap-3 bg-white border border-slate-200 rounded-lg p-4">
            <Checkbox 
              id="terms-agree" 
              checked={agreed}
              onCheckedChange={(checked) => setAgreed(checked === true)}
              className="mt-1"
            />
            <label
              htmlFor="terms-agree"
              className="text-sm font-medium leading-relaxed cursor-pointer select-none"
            >
              I understand and agree to protect the intellectual property in this app. I won't copy, share, or reverse-engineer it.
            </label>
          </div>

          {/* Optional Details */}
          <Collapsible open={showDetails} onOpenChange={setShowDetails}>
            <CollapsibleTrigger asChild>
              <Button variant="ghost" size="sm" className="w-full gap-2 text-slate-600">
                {showDetails ? (
                  <>
                    <ChevronUp className="h-4 w-4" />
                    Hide Details
                  </>
                ) : (
                  <>
                    <ChevronDown className="h-4 w-4" />
                    Want to read the full details? (Optional)
                  </>
                )}
              </Button>
            </CollapsibleTrigger>
            <CollapsibleContent className="mt-3">
              <div className="bg-slate-50 border border-slate-200 rounded-lg p-4 space-y-3 text-sm text-slate-700">
                <p>
                  <strong>What this means in plain English:</strong>
                </p>
                
                <div>
                  <p className="font-semibold text-slate-900">You get to USE the app</p>
                  <p className="text-slate-600">
                    Track your performance, use GPS navigation, message supervisors, all the features.
                  </p>
                </div>

                <div>
                  <p className="font-semibold text-slate-900">You can't COPY the app</p>
                  <p className="text-slate-600">
                    Don't try to rebuild it, reverse-engineer it, or share the code with anyone. This software belongs to DarkWave Studios.
                  </p>
                </div>

                <div>
                  <p className="font-semibold text-slate-900">Keep it confidential</p>
                  <p className="text-slate-600">
                    The features, roadmap, and how it works are confidential. Don't share screenshots of future plans or technical details with competitors.
                  </p>
                </div>

                <div>
                  <p className="font-semibold text-slate-900">If someone steals it, we can take action</p>
                  <p className="text-slate-600">
                    If the app gets copied or shared without permission, we have legal protection. That's what this agreement does.
                  </p>
                </div>

                <div className="pt-2 border-t border-slate-300">
                  <p className="text-xs text-slate-500">
                    Effective Date: November 21, 2025<br />
                    DarkWave Studios • Lot Ops Pro<br />
                    © 2025 All Rights Reserved
                  </p>
                </div>
              </div>
            </CollapsibleContent>
          </Collapsible>

          {/* Accept Button */}
          <Button 
            onClick={handleAccept}
            disabled={!agreed}
            className="w-full"
            size="lg"
            data-testid="button-accept-terms"
          >
            Got it - Let's Go
          </Button>

          <p className="text-xs text-slate-500 text-center">
            By clicking above, you're digitally agreeing to these terms. This is legally binding.
          </p>
        </div>
      </>
        ) : (
          <>
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2 text-lg">
                <Award className="h-5 w-5 text-yellow-600" />
                Congratulations!
              </DialogTitle>
            </DialogHeader>

            <div className="space-y-4" ref={certificateRef}>
              {/* Certificate */}
              <div className="bg-gradient-to-br from-yellow-50 to-amber-50 border-4 border-yellow-600 rounded-lg p-6 text-center space-y-3">
                <Award className="h-12 w-12 mx-auto text-yellow-600" />
                
                <h2 className="text-xl font-bold text-yellow-900">
                  Official Certificate of<br />Intellectual Honesty
                </h2>
                
                <div className="py-3">
                  <p className="text-sm text-slate-600">Presented to</p>
                  <p className="text-2xl font-bold text-slate-900">{userName}</p>
                </div>

                <div className="text-sm text-slate-700 space-y-2 bg-white/60 rounded p-3">
                  <p>
                    This certifies that you've <strong>successfully agreed</strong> not to copy, 
                    steal, or reverse-engineer Lot Ops Pro.
                  </p>
                  <p className="text-xs italic text-slate-600">
                    In today's world, we need signatures for everything. Yes, even agreeing not to 
                    steal software. Wild times we live in.
                  </p>
                  <p className="text-xs text-slate-600">
                    Good news: You didn't have to give us your children's blood type, social security 
                    number, or first-born child. Just a simple "I won't copy this app." That's progress!
                  </p>
                </div>

                <div className="pt-3 border-t border-yellow-300">
                  <p className="text-xs text-slate-500">
                    Signed: DarkWave Studios<br />
                    Date: {new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}<br />
                    <strong className="text-green-700">Status: Officially Not a Code Thief ✓</strong>
                  </p>
                </div>
              </div>

              {/* Download Button */}
              <Button 
                onClick={downloadCertificate}
                variant="outline"
                className="w-full gap-2"
              >
                <Download className="h-4 w-4" />
                Download Your Certificate (For Fun)
              </Button>

              <p className="text-xs text-slate-500 text-center leading-relaxed">
                This certificate has no actual legal value, but it sure is fun. 
                The checkbox you clicked? <strong>THAT</strong> was the legally binding part. 
                Welcome to Lot Ops Pro! 🎉
              </p>

              <p className="text-xs text-slate-400 text-center">
                Redirecting to dashboard in 3 seconds...
              </p>
            </div>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
}
