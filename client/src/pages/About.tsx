import { useEffect } from "react";
import { useLocation } from "wouter";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  CheckCircle2, 
  DollarSign, 
  Smartphone, 
  Globe, 
  Users, 
  TrendingUp,
  Zap,
  Shield,
  BarChart3
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { NavigationControl } from "@/components/NavigationControl";

export default function About() {
  const [_, setLocation] = useLocation();
  const { toast } = useToast();
  
  useEffect(() => {
    const userStr = localStorage.getItem("vanops_user");
    if (userStr) {
      const user = JSON.parse(userStr);
      // SECURITY: Temporary employees cannot access About/Company info
      if (user.employeeType === "temporary") {
        toast({
          title: "Access Restricted",
          description: "Temporary employees cannot access About",
          variant: "destructive",
        });
        setTimeout(() => setLocation("/scanner"), 500);
      }
    }
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900 p-2">
      <div className="max-w-3xl mx-auto space-y-2 py-2">
        <NavigationControl variant="back" fallbackRoute="/" />

        {/* Hero Section - Driver to Driver */}
        <Card className="bg-gradient-to-br from-blue-600 to-blue-800 border-none text-white">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="bg-white/20 rounded-full p-2">
                <Users className="h-6 w-6" />
              </div>
              <div>
                <h1 className="text-2xl font-bold">Hey Team,</h1>
                <p className="text-sm text-blue-100">A message from Jason - one of your fellow van drivers</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Jason's Message to Drivers */}
        <Card className="bg-white/10 border-white/20 backdrop-blur-lg">
          <CardHeader className="pb-2 pt-3 px-3">
            <CardTitle className="text-white text-lg">I Built This For Us</CardTitle>
          </CardHeader>
          <CardContent className="text-white space-y-3 p-3 pt-0">
            <div className="bg-blue-900/30 rounded p-3 border border-blue-500/30">
              <p className="text-sm leading-snug">
                What's up everyone - <span className="font-bold text-blue-300">Jason here</span>. You know me, I'm out there 
                running vans just like you, dealing with the same daily grind we all face. 
              </p>
              <p className="mt-2 text-sm leading-snug">
                Look, I got tired of the same old problems we deal with every shift: those confusing handheld scanners that 
                do barely anything, not knowing where the hell we're supposed to go half the time, Teresa trying to find us 
                when she needs something, and having zero clue how we're doing on our quota until it's too late.
              </p>
              <p className="mt-2 text-sm leading-snug">
                So I figured... why not build something better? Something that actually helps US get our work done faster and 
                easier. Not some corporate system that makes life harder - a tool made BY a driver, FOR drivers.
              </p>
              <p className="mt-2 text-sm leading-snug text-blue-200 font-semibold">
                This app is for all of us. GPS routing so we're not wandering around the lot, real-time quota tracking so we 
                know if we're on pace, in-app chat so Teresa can reach us instantly, and a scanner that actually works on our 
                own phones. No more $800 handhelds that break every other week.
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Feedback Request - Driver to Driver */}
        <Card className="bg-gradient-to-br from-green-600 to-green-800 border-none text-white">
          <CardContent className="p-4">
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <Zap className="h-6 w-6" />
                <h2 className="text-xl font-bold">I Need Your Input</h2>
              </div>
              <p className="text-sm text-green-100 leading-snug">
                This is OUR tool, so I want to hear from YOU. What's working? What's annoying? What feature would make your 
                job easier? If you've got ideas, complaints, or suggestions - hit me up.
              </p>
              <div className="bg-white/20 rounded p-3 border border-white/30 mt-2">
                <h3 className="font-bold text-sm mb-2 flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4" />
                  How to Send Feedback:
                </h3>
                <ul className="space-y-1 text-xs text-green-100">
                  <li className="flex items-start gap-2">
                    <span className="text-white font-bold">1.</span>
                    <span><strong>Text me directly</strong> with what you're thinking (you know my number)</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-white font-bold">2.</span>
                    <span><strong>Use the in-app messaging</strong> - just send me a message through the chat</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-white font-bold">3.</span>
                    <span><strong>Catch me on the lot</strong> - I'm usually in van 142 or 201</span>
                  </li>
                </ul>
              </div>
              <p className="text-xs text-green-200 italic mt-2">
                If it makes sense and helps the team, I'll add it. If it's not possible, I'll tell you why. Either way, 
                I want to hear what you think because this only works if it actually helps us do our jobs better.
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Why I Built This - Driver Perspective */}
        <Card className="bg-white/10 border-white/20 backdrop-blur-lg">
          <CardHeader className="pb-2 pt-3 px-3">
            <CardTitle className="text-white text-lg flex items-center gap-2">
              <Shield className="h-5 w-5 text-blue-400" />
              Real Talk: Why This Matters
            </CardTitle>
          </CardHeader>
          <CardContent className="text-white space-y-3 p-3 pt-0">
            <p className="text-sm leading-snug">
              You already know the hassles we deal with. Those $800 handhelds they give us? They break all the time, 
              do like three things, and half the time you can't even figure out how to use them. Meanwhile, we all have 
              perfectly good phones in our pockets that can do WAY more.
            </p>
            
            <div className="grid md:grid-cols-2 gap-2 mt-2">
              <div className="bg-white/5 rounded p-2 border border-white/10">
                <h4 className="font-bold text-sm mb-2 text-blue-300">What You Get:</h4>
                <ul className="space-y-1 text-xs">
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="h-4 w-4 text-green-400 mt-0.5 flex-shrink-0" />
                    <span>Use your own phone - no more waiting for equipment</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="h-4 w-4 text-green-400 mt-0.5 flex-shrink-0" />
                    <span>GPS shows you EXACTLY where to go - no more guessing</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="h-4 w-4 text-green-400 mt-0.5 flex-shrink-0" />
                    <span>See your MPH in real-time - know if you're on pace</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="h-4 w-4 text-green-400 mt-0.5 flex-shrink-0" />
                    <span>Teresa can message you instantly instead of calling around</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="h-4 w-4 text-green-400 mt-0.5 flex-shrink-0" />
                    <span>Scanner that actually works - camera reads VINs for you</span>
                  </li>
                </ul>
              </div>

              <div className="bg-white/5 rounded p-2 border border-white/10">
                <h4 className="font-bold text-sm mb-2 text-purple-300">What This Means:</h4>
                <ul className="space-y-1 text-xs">
                  <li className="flex items-start gap-2">
                    <TrendingUp className="h-4 w-4 text-purple-400 mt-0.5 flex-shrink-0" />
                    <span>Less time wandering = more moves = better bonuses</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <TrendingUp className="h-4 w-4 text-purple-400 mt-0.5 flex-shrink-0" />
                    <span>Know your performance before shift end - no surprises</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <TrendingUp className="h-4 w-4 text-purple-400 mt-0.5 flex-shrink-0" />
                    <span>Teresa can see where you are - she stops calling everyone</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <TrendingUp className="h-4 w-4 text-purple-400 mt-0.5 flex-shrink-0" />
                    <span>Make your job easier, not harder</span>
                  </li>
                </ul>
              </div>
            </div>

            <div className="bg-blue-900/30 rounded p-2 border border-blue-500/30 mt-2">
              <p className="text-xs text-blue-200 italic">
                <strong>Bottom line:</strong> This helps us work smarter, hit our numbers, and go home knowing we crushed it. 
                Plus management saves a ton of money on equipment, so everybody wins.
              </p>
            </div>
          </CardContent>
        </Card>

        {/* What Else Can It Do */}
        <Card className="bg-white/10 border-white/20 backdrop-blur-lg">
          <CardHeader className="pb-2 pt-3 px-3">
            <CardTitle className="text-white text-lg">What Else Can It Do?</CardTitle>
          </CardHeader>
          <CardContent className="text-white space-y-2 p-3 pt-0">
            <p className="text-sm leading-snug">
              I packed this thing with stuff I wish we had. Not just the basics - I mean features that actually 
              make the day go smoother.
            </p>
            
            <div className="grid md:grid-cols-2 gap-2 mt-2">
              <div className="bg-white/5 rounded p-2 border border-white/10">
                <h4 className="font-bold text-sm mb-2 text-blue-300 flex items-center gap-2">
                  <Smartphone className="h-4 w-4" />
                  For You (Drivers):
                </h4>
                <ul className="space-y-1 text-xs text-white/80">
                  <li>• Live MPH tracking so you know if you're hitting quota</li>
                  <li>• GPS guidance to every pickup and drop-off</li>
                  <li>• Camera scanner that reads VINs instantly</li>
                  <li>• Direct chat with Teresa when you need her</li>
                  <li>• Performance history to see your bonus potential</li>
                  <li>• Break tracking so you're not guessing time</li>
                </ul>
              </div>

              <div className="bg-white/5 rounded p-2 border border-white/10">
                <h4 className="font-bold text-sm mb-2 text-green-300 flex items-center gap-2">
                  <Users className="h-4 w-4" />
                  For Teresa & Management:
                </h4>
                <ul className="space-y-1 text-xs text-white/80">
                  <li>• Live map showing where every van is right now</li>
                  <li>• Click any van to see detailed stats instantly</li>
                  <li>• Send messages to everyone or specific drivers</li>
                  <li>• Lot capacity tracking with overflow alerts</li>
                  <li>• Quarterly reports they can print</li>
                  <li>• Works at ANY Manheim location (not just Nashville)</li>
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Privacy Policy - Message Privacy */}
        <Card className="bg-gradient-to-br from-green-600 to-emerald-700 border-none text-white">
          <CardHeader className="pb-2 pt-3 px-3">
            <CardTitle className="text-white text-lg flex items-center gap-2">
              <Shield className="h-5 w-5" />
              Your Privacy Matters - For Real
            </CardTitle>
          </CardHeader>
          <CardContent className="text-white space-y-2 p-3 pt-0">
            <div className="bg-white/10 rounded p-3 border border-white/20">
              <p className="text-sm leading-snug font-semibold mb-2">
                🔒 I Can't See Your Messages - And I Don't Want To
              </p>
              <p className="text-sm leading-snug">
                All messages in this app are <span className="font-bold text-green-200">private by default</span>. I literally 
                built the system to block me (and any other developer) from seeing your conversations. Try it yourself in 
                Demo Mode - when you log in as Developer, you'll get "Access Denied" on private messages.
              </p>
              <div className="mt-2 bg-emerald-900/40 rounded p-2 border border-emerald-400/30">
                <p className="text-xs leading-snug">
                  <strong>Official Messages:</strong> If Teresa marks a message as "Official" (for company business, safety 
                  incidents, or lot assignments), those ARE logged for operational purposes. Everything else? Totally private.
                </p>
              </div>
              <p className="text-sm leading-snug mt-2">
                I'm not here to spy on anyone. I just build the tools. Your chats are between you and whoever you're talking to. 
                That's it. Use the app responsibly and professionally, and we're all good.
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Could Work Everywhere */}
        <Card className="bg-white/10 border-white/20 backdrop-blur-lg">
          <CardHeader className="pb-2 pt-3 px-3">
            <CardTitle className="text-white text-lg flex items-center gap-2">
              <Globe className="h-5 w-5 text-blue-400" />
              This Could Help Other Lots Too
            </CardTitle>
          </CardHeader>
          <CardContent className="text-white space-y-2 p-3 pt-0">
            <p className="text-sm leading-snug">
              I built this for Nashville, but I bet drivers in Orlando, Las Vegas, Hawaii - everywhere - deal 
              with the same crap we do. The app is set up so any location can use it with their own lot numbers, 
              GPS coordinates, and lane setups.
            </p>
            <div className="bg-blue-900/30 rounded p-2 border border-blue-500/30 mt-2">
              <p className="text-xs italic">
                If this works for us and makes our lives easier, why shouldn't it work everywhere? Just saying... 
                could be a game changer across the board.
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Closing - Let's Make It Better Together */}
        <Card className="bg-gradient-to-br from-blue-600 to-blue-800 border-none text-white">
          <CardContent className="p-4 space-y-2">
            <div className="flex items-center gap-2">
              <Users className="h-6 w-6" />
              <h2 className="text-xl font-bold">Let's Make This Even Better</h2>
            </div>
            <p className="text-sm text-blue-100 leading-snug">
              This is just the start. I want YOUR input to make this tool work for everyone on the team. 
              Text me, message me in the app, or catch me on the lot. Let's build something that actually 
              makes our jobs easier.
            </p>
            <Button 
              onClick={() => setLocation("/")}
              className="bg-white text-blue-700 hover:bg-blue-50 w-full py-4"
              data-testid="button-try-it"
            >
              Try It Out
            </Button>
          </CardContent>
        </Card>

        {/* Footer Note */}
        <div className="text-center text-white/50 text-xs pb-2 space-y-0.5">
          <p className="text-sm text-white/70">- Jason</p>
          <p>Van Driver #142 / #201 • Manheim Nashville</p>
          <p className="text-[10px]">Built for the team, by the team</p>
        </div>
      </div>
    </div>
  );
}
