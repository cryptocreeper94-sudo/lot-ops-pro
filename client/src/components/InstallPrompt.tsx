import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Download, X, Smartphone } from "lucide-react";

interface InstallPromptProps {
  phoneLastFour: string;
  onDismiss: () => void;
}

export function InstallPrompt({ phoneLastFour, onDismiss }: InstallPromptProps) {
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [showManualInstructions, setShowManualInstructions] = useState(false);

  useEffect(() => {
    const handler = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e);
    };

    window.addEventListener('beforeinstallprompt', handler);
    return () => window.removeEventListener('beforeinstallprompt', handler);
  }, []);

  const handleInstall = async () => {
    if (deferredPrompt) {
      deferredPrompt.prompt();
      const { outcome } = await deferredPrompt.userChoice;
      if (outcome === 'accepted') {
        onDismiss();
      }
      setDeferredPrompt(null);
    } else {
      setShowManualInstructions(true);
    }
  };

  const isIOS = /iPhone|iPad|iPod/.test(navigator.userAgent);
  const isAndroid = /Android/.test(navigator.userAgent);

  return (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-in fade-in">
      <Card className="max-w-md w-full bg-gradient-to-br from-blue-600 to-purple-700 border-0 shadow-2xl">
        <CardContent className="p-8 relative">
          <Button
            variant="ghost"
            size="icon"
            className="absolute top-2 right-2 text-white/80 hover:text-white hover:bg-white/20"
            onClick={onDismiss}
            data-testid="button-dismiss-install"
          >
            <X className="h-5 w-5" />
          </Button>

          <div className="text-center space-y-6">
            {/* Logo */}
            <div className="flex justify-center">
              <div className="w-24 h-24 bg-white rounded-full p-4 shadow-xl">
                <img 
                  src="/icon-512x512.png" 
                  alt="Lot Ops Pro" 
                  className="w-full h-full object-contain"
                />
              </div>
            </div>

            {/* Title */}
            <div>
              <h2 className="text-3xl font-bold text-white mb-2">
                Add to Home Screen
              </h2>
              <p className="text-blue-100 text-lg">
                Your phone: •••• {phoneLastFour}
              </p>
            </div>

            {/* Instructions */}
            {!showManualInstructions ? (
              <div className="space-y-4">
                <p className="text-white/90 text-base">
                  Install Lot Ops Pro for quick access from your home screen - no app store needed!
                </p>
                
                <div className="bg-white/10 rounded-lg p-4 text-left space-y-2">
                  <div className="flex items-start gap-3">
                    <Smartphone className="h-5 w-5 text-green-300 mt-0.5 flex-shrink-0" />
                    <div className="text-white/90 text-sm">
                      <strong>Fast Access:</strong> Launch from your home screen like any other app
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <Download className="h-5 w-5 text-green-300 mt-0.5 flex-shrink-0" />
                    <div className="text-white/90 text-sm">
                      <strong>No Downloads:</strong> Works instantly - no app store required
                    </div>
                  </div>
                </div>

                <Button
                  size="lg"
                  className="w-full bg-white text-blue-700 hover:bg-blue-50 font-bold text-lg py-6"
                  onClick={handleInstall}
                  data-testid="button-install-app"
                >
                  <Download className="h-5 w-5 mr-2" />
                  Install Now
                </Button>

                <button
                  onClick={onDismiss}
                  className="text-white/70 hover:text-white text-sm underline"
                  data-testid="button-skip-install"
                >
                  Skip for now
                </button>
              </div>
            ) : (
              <div className="space-y-4 text-left">
                <div className="bg-white/10 rounded-lg p-4 space-y-3">
                  {isIOS && (
                    <>
                      <p className="text-white font-bold text-sm">iPhone/iPad Instructions:</p>
                      <ol className="text-white/90 text-sm space-y-2 list-decimal list-inside">
                        <li>Tap the Share button <span className="inline-block">📤</span> at the bottom</li>
                        <li>Scroll down and tap "Add to Home Screen"</li>
                        <li>Tap "Add" in the top right</li>
                      </ol>
                    </>
                  )}
                  {isAndroid && (
                    <>
                      <p className="text-white font-bold text-sm">Android Instructions:</p>
                      <ol className="text-white/90 text-sm space-y-2 list-decimal list-inside">
                        <li>Tap the menu (⋮) in the top right</li>
                        <li>Tap "Add to Home screen" or "Install app"</li>
                        <li>Tap "Add" or "Install"</li>
                      </ol>
                    </>
                  )}
                  {!isIOS && !isAndroid && (
                    <p className="text-white/90 text-sm">
                      Look for the "Install" or "Add to Home Screen" option in your browser menu.
                    </p>
                  )}
                </div>

                <Button
                  variant="outline"
                  className="w-full bg-white/20 text-white border-white/30 hover:bg-white/30"
                  onClick={onDismiss}
                >
                  Got it!
                </Button>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
