import { useState } from "react";
import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowLeft, Copy, CheckCircle2 } from "lucide-react";
import { NavigationControl } from "@/components/NavigationControl";

export default function TeresaMessage() {
  const [_, setLocation] = useLocation();
  const [copied, setCopied] = useState(false);

  const message = `Hey Teresa, it's Jason!

So I built a mobile app for tracking our moves and I've been using it myself - thought it might help make our day a little easier. Would love if you and the team could try it out alongside the handhelds (keep using those as normal) and just let me know if it's actually useful or not.

QUICK RUNDOWN:
Drivers get: GPS routing, real-time MPH tracking, camera VIN scanner, direct messaging, performance stats
You get: Live map of all drivers, detailed stats on each van, broadcast messaging, lot capacity alerts, reports

HOW TO USE:
Log in with last 4 of phone number, you assign daily driver numbers like usual, use it alongside handhelds, app tracks everything automatically

WHAT I NEED:
Just have the team try it out and see if it helps. If you spot bugs or something's confusing, shoot me a text so I can fix it. Your feedback helps make this better for everyone.

Thanks for giving it a shot!
- Jason`;

  const handleCopy = () => {
    navigator.clipboard.writeText(message);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900 p-2">
      <div className="max-w-2xl mx-auto space-y-2 py-2">
        <NavigationControl variant="back" fallbackRoute="/developer" />

        <Card className="bg-white/10 border-white/20 backdrop-blur-lg">
          <CardHeader className="pb-2 pt-3 px-3">
            <CardTitle className="text-white text-lg">Message for Teresa</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 p-3 pt-0">
            <div className="bg-slate-800/50 rounded p-3 border border-slate-600/30">
              <pre className="text-white text-xs whitespace-pre-wrap font-sans leading-snug">
                {message}
              </pre>
            </div>

            <Button
              onClick={handleCopy}
              className="w-full bg-green-600 hover:bg-green-700 text-white py-4"
              data-testid="button-copy-message"
            >
              {copied ? (
                <>
                  <CheckCircle2 className="h-4 w-4 mr-2" />
                  Copied!
                </>
              ) : (
                <>
                  <Copy className="h-4 w-4 mr-2" />
                  Copy Message
                </>
              )}
            </Button>

            <p className="text-white/70 text-xs text-center">
              Copy and paste into text message
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
