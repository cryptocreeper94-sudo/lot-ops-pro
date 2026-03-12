import { useState } from "react";
import { useLocation } from "wouter";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { BentoGrid, BentoTile } from "@/components/ui/bento-grid";
import { SwipeCarousel } from "@/components/ui/premium-carousel";
import { PremiumButton } from "@/components/ui/premium-button";
import { 
  Sparkles, 
  Bot,
  Globe,
  Users,
  Award,
  MessageSquare,
  Calendar,
  Shield,
  TrendingUp,
  Camera,
  Send,
  CheckCircle
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { NavigationControl } from "@/components/NavigationControl";

export default function FutureFeatures() {
  const [location, setLocation] = useLocation();
  const { toast } = useToast();
  const [suggestion, setSuggestion] = useState("");

  const handleSubmitSuggestion = () => {
    if (!suggestion.trim()) return;
    
    toast({
      title: "✓ Suggestion Submitted",
      description: "Thank you! We'll review your idea for Version 2.",
    });
    setSuggestion("");
  };

  const keyFeatures = [
    {
      icon: Bot,
      title: "AI Company Assistant",
      description: "Ask questions about HR, benefits, 401k, insurance, Manheim policies, and company procedures. Get instant answers from company documentation.",
      color: "from-purple-600 to-pink-600",
      status: "Planned",
      size: "lg" as const
    },
    {
      icon: Users,
      title: "Driver Profile System",
      description: "Click driver avatar to view complete profile with badge number, performance metrics, break patterns, safety record, and all-time statistics.",
      color: "from-blue-600 to-cyan-500",
      status: "Planned",
      size: "md" as const
    },
    {
      icon: Award,
      title: "Performance Reviews",
      description: "Convert performance metrics into formal reviews. Track daily/weekly averages, night-before recaps, and historical data.",
      color: "from-green-600 to-emerald-500",
      status: "Planned",
      size: "md" as const
    },
  ];

  const additionalFeatures = [
    {
      icon: Camera,
      title: "Hide & Seek Game",
      description: "Random driver faces appear with sarcastic comments to make the night go faster. Fun morale booster!",
      color: "from-pink-500 to-rose-500",
      status: "Planned"
    },
    {
      icon: Users,
      title: "Additional Lot Positions",
      description: "Add other facility positions under Operations Manager control with role-based visibility and controls.",
      color: "from-orange-500 to-amber-500",
      status: "Planned"
    },
    {
      icon: MessageSquare,
      title: "Enhanced Messaging",
      description: "Improved chat with service truck driver designation, read receipts, and message history.",
      color: "from-indigo-500 to-violet-500",
      status: "In Progress"
    },
    {
      icon: Calendar,
      title: "Shift Scheduling",
      description: "Advanced scheduling system with shift swaps, time-off requests, and coverage management.",
      color: "from-cyan-500 to-teal-500",
      status: "Planned"
    },
    {
      icon: Shield,
      title: "Advanced Safety Analytics",
      description: "Predictive safety insights, incident trends, and proactive hazard identification.",
      color: "from-red-500 to-rose-500",
      status: "Planned"
    },
    {
      icon: TrendingUp,
      title: "Advanced Analytics",
      description: "Deep dive into performance trends, efficiency patterns, and optimization recommendations.",
      color: "from-yellow-500 to-orange-500",
      status: "Planned"
    },
  ];

  const availableFeatures = [
    { label: "Web Research Tool", description: "Search for gas caps, charging ports, VIN locations, and vehicle specs" },
    { label: "PIN Management", description: "Operations Manager and Supervisor can change PINs" },
    { label: "Email System", description: "Send company-wide emails (SendGrid integration ready)" },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-blue-50 p-4">
      {/* Header */}
      <div className="mb-6">
        <div className="flex items-center gap-3 mb-4">
          <NavigationControl variant="back" fallbackRoute="/dashboard" data-testid="nav-back-button" />
        </div>
        
        <div className="flex items-center gap-3">
          <div className="bg-gradient-to-br from-purple-600 to-pink-600 p-3 rounded-xl shadow-lg">
            <Sparkles className="w-6 h-6 text-white" />
          </div>
          <div>
            <h1 className="text-2xl font-black text-slate-900" data-testid="text-page-title">Version 2 Features</h1>
            <p className="text-sm text-slate-600">Version 2.0 Release Will Include</p>
          </div>
        </div>
      </div>

      {/* Beta Notice Tile */}
      <BentoTile
        variant="gradient"
        size="wide"
        sparkle
        icon={<Sparkles className="w-5 h-5" />}
        title="You're Using Version 1.0 Beta"
        description="This is the first version! We're gathering feedback to make Version 2 even better. Test everything, find bugs, and suggest improvements below."
        className="mb-6 border-purple-200"
        interactive={false}
        data-testid="tile-beta-notice"
      />

      {/* Key Features - Bento Grid */}
      <div className="mb-6">
        <h2 className="text-lg font-bold text-slate-800 mb-3 flex items-center gap-2">
          <Sparkles className="w-5 h-5 text-purple-600" />
          Key Features Coming
        </h2>
        <BentoGrid columns={2} gap="md">
          {keyFeatures.map((feature, index) => (
            <BentoTile
              key={index}
              variant={index === 0 ? "premium" : "gradient"}
              size={feature.size}
              sparkle={index === 0}
              icon={<feature.icon className="w-5 h-5" />}
              title={feature.title}
              badge={feature.status}
              data-testid={`tile-feature-${feature.title.toLowerCase().replace(/\s+/g, '-')}`}
            >
              <p className="text-xs text-muted-foreground leading-relaxed">
                {feature.description}
              </p>
            </BentoTile>
          ))}
        </BentoGrid>
      </div>

      {/* Additional Features - Horizontal Carousel */}
      <div className="mb-6">
        <h2 className="text-lg font-bold text-slate-800 mb-3 flex items-center gap-2">
          <TrendingUp className="w-5 h-5 text-blue-600" />
          More Features in Development
        </h2>
        <SwipeCarousel itemWidth="260px" gap={12} showPeek>
          {additionalFeatures.map((feature, index) => (
            <BentoTile
              key={index}
              variant="glow"
              size="sm"
              className="h-[180px]"
              icon={<feature.icon className="w-4 h-4" />}
              title={feature.title}
              badge={feature.status}
              data-testid={`carousel-feature-${feature.title.toLowerCase().replace(/\s+/g, '-')}`}
            >
              <p className="text-xs text-muted-foreground leading-relaxed line-clamp-3">
                {feature.description}
              </p>
            </BentoTile>
          ))}
        </SwipeCarousel>
      </div>

      {/* Suggestion Box */}
      <BentoTile
        variant="glass"
        size="wide"
        icon={<MessageSquare className="w-5 h-5 text-blue-600" />}
        title="Suggest a Feature"
        description="Have an idea for Version 2? Let us know what would make your job easier!"
        className="mb-6 bg-white/80 border-blue-200"
        interactive={false}
        data-testid="tile-suggestion-box"
      >
        <div className="space-y-3 mt-2">
          <Textarea
            placeholder="Describe your idea... What feature would help you most?"
            rows={4}
            value={suggestion}
            onChange={(e) => setSuggestion(e.target.value)}
            className="text-sm bg-white/50"
            data-testid="input-suggestion"
          />
          <PremiumButton 
            onClick={handleSubmitSuggestion}
            disabled={!suggestion.trim()}
            variant="gradient"
            className="w-full"
            icon={<Send className="w-4 h-4" />}
            shine
            data-testid="button-submit-suggestion"
          >
            Submit Suggestion
          </PremiumButton>
        </div>
      </BentoTile>

      {/* Already Available Features */}
      <BentoTile
        variant="default"
        size="wide"
        icon={<Globe className="w-5 h-5 text-green-600" />}
        title="Already Available in V1"
        className="border-green-200 bg-green-50/50"
        interactive={false}
        data-testid="tile-available-features"
      >
        <div className="space-y-2 mt-2">
          {availableFeatures.map((item, index) => (
            <div 
              key={index} 
              className="flex items-start gap-2 text-green-800"
              data-testid={`feature-available-${index}`}
            >
              <CheckCircle className="w-4 h-4 text-green-600 mt-0.5 shrink-0" />
              <span className="text-sm">
                <strong>{item.label}:</strong> {item.description}
              </span>
            </div>
          ))}
        </div>
      </BentoTile>
    </div>
  );
}
