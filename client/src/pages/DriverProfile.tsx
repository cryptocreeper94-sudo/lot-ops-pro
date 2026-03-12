import { useState } from "react";
import { useLocation } from "wouter";
import { 
  Trophy, 
  TrendingUp, 
  DollarSign, 
  Clock, 
  CheckCircle2,
  Calendar,
  Activity,
  Award,
  Zap
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { NavigationControl } from "@/components/NavigationControl";
import { BentoGrid, BentoTile } from "@/components/ui/bento-grid";
import { PremiumAccordion, PremiumAccordionItem, PremiumAccordionTrigger, PremiumAccordionContent } from "@/components/ui/premium-accordion";
import { PremiumButton } from "@/components/ui/premium-button";
import { PageHelp } from "@/components/PageHelp";

export default function DriverProfile() {
  const [_, setLocation] = useLocation();
  const [activeTab, setActiveTabState] = useState(() => 
    localStorage.getItem('lotops_driverprofile_tab') || "weekly"
  );
  
  const setActiveTab = (tab: string) => {
    localStorage.setItem('lotops_driverprofile_tab', tab);
    setActiveTabState(tab);
  };

  const weeklyStats = {
    moves: 142,
    hours: 38.5,
    mph: 4.8,
    bonus: 120,
    rank: 3
  };

  const monthlyStats = {
    moves: 610,
    hours: 155,
    mph: 4.6,
    bonus: 450,
    rank: 5
  };

  const history = [
    { id: 1, date: "Today", moves: 18, mph: 4.9, status: "On Track" },
    { id: 2, date: "Yesterday", moves: 32, mph: 4.7, status: "Completed" },
    { id: 3, date: "Nov 17", moves: 28, mph: 4.5, status: "Met Goal" },
    { id: 4, date: "Nov 16", moves: 35, mph: 5.1, status: "Exceeded" },
    { id: 5, date: "Nov 15", moves: 29, mph: 4.8, status: "Met Goal" },
  ];

  const getStatusBadgeClass = (status: string) => {
    switch (status) {
      case 'Exceeded':
        return 'text-green-400 border-green-400/20 bg-green-400/10';
      case 'On Track':
        return 'text-blue-400 border-blue-400/20 bg-blue-400/10';
      default:
        return 'text-slate-400 border-slate-700';
    }
  };

  return (
    <div className="min-h-screen dashboard-premium text-white pb-20 scrollbar-premium page-enter">
      {/* Premium Header */}
      <div className="bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 p-6 pb-10 rounded-b-[2rem] shadow-2xl relative overflow-hidden border-b border-slate-700/50">
        <div className="absolute top-0 left-0 w-full h-full opacity-20 bg-[radial-gradient(circle_at_top_right,_var(--tw-gradient-stops))] from-blue-500 via-purple-500/20 to-transparent" />
        <div className="absolute bottom-0 right-0 w-1/2 h-1/2 opacity-10 bg-[radial-gradient(circle_at_bottom_right,_var(--tw-gradient-stops))] from-indigo-500 via-transparent to-transparent" />
        
        <div className="relative z-10">
          <div className="flex items-center gap-4 mb-6">
            <NavigationControl variant="back" fallbackRoute="/dashboard" data-testid="button-back-navigation" />
            <h1 className="text-xl font-bold text-gradient-blue" data-testid="text-page-title">Driver Profile</h1>
          </div>

          <div className="flex items-center gap-4">
            <div className="avatar-ring p-1">
              <Avatar className="h-20 w-20 shadow-xl" data-testid="img-driver-avatar">
                <AvatarImage src="https://github.com/shadcn.png" />
                <AvatarFallback className="bg-gradient-to-br from-blue-500 to-purple-600 text-white text-xl font-bold">JD</AvatarFallback>
              </Avatar>
            </div>
            <div>
              <h2 className="text-2xl font-bold text-white" data-testid="text-driver-name">John Doe</h2>
              <div className="flex items-center gap-2 text-sm mt-1">
                <span className="badge-glass-cyan py-0.5 px-2 text-[10px]" data-testid="text-driver-id">ID: 8842</span>
                <span className="text-slate-500">•</span>
                <span className="text-blue-300" data-testid="text-driver-role">Senior Driver</span>
              </div>
            </div>
          </div>

          {/* Rank Bento Tile */}
          <BentoGrid columns={1} gap="md" className="mt-6">
            <BentoTile
              variant="premium"
              sparkle
              interactive={false}
              data-testid="tile-driver-rank"
              className="!min-h-0"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="p-2.5 bg-gradient-to-br from-yellow-500/30 to-amber-600/30 rounded-xl">
                    <Trophy className="h-6 w-6 text-yellow-400" />
                  </div>
                  <div>
                    <div className="text-sm text-slate-400">Current Rank</div>
                    <div className="font-bold text-lg text-gradient-amber" data-testid="text-rank-tier">Gold Tier</div>
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-sm text-slate-400">Bonus Multiplier</div>
                  <div className="font-bold text-lg text-green-400" data-testid="text-bonus-multiplier">1.2x</div>
                </div>
              </div>
            </BentoTile>
          </BentoGrid>
        </div>
      </div>

      {/* Stats Content */}
      <div className="px-4 -mt-6 relative z-20">
        <Tabs defaultValue="weekly" value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="w-full grid grid-cols-2 tabs-premium h-12 mb-6" data-testid="tabs-stats-period">
            <TabsTrigger 
              value="weekly" 
              className="tab-premium data-[state=active]:bg-gradient-to-r data-[state=active]:from-blue-500 data-[state=active]:to-indigo-600"
              data-testid="tab-weekly-stats"
            >
              Weekly Stats
            </TabsTrigger>
            <TabsTrigger 
              value="monthly" 
              className="tab-premium data-[state=active]:bg-gradient-to-r data-[state=active]:from-purple-500 data-[state=active]:to-indigo-600"
              data-testid="tab-monthly-stats"
            >
              Monthly Stats
            </TabsTrigger>
          </TabsList>

          <TabsContent value="weekly" className="space-y-6 section-enter">
            {/* Stats Bento Grid */}
            <BentoGrid columns={2} gap="md">
              <BentoTile
                variant="glass"
                sparkle
                icon={<Zap className="h-5 w-5" />}
                title="Moves"
                data-testid="tile-weekly-moves"
              >
                <div className="text-3xl font-bold number-display-premium" data-testid="text-weekly-moves-count">
                  {weeklyStats.moves}
                </div>
                <div className="text-xs text-green-400 flex items-center mt-2">
                  <TrendingUp className="h-3 w-3 mr-1" /> +12%
                </div>
              </BentoTile>

              <BentoTile
                variant="gradient"
                sparkle
                icon={<DollarSign className="h-5 w-5" />}
                title="Est. Bonus"
                data-testid="tile-weekly-bonus"
              >
                <div className="text-3xl font-bold text-gradient-green" data-testid="text-weekly-bonus-amount">
                  ${weeklyStats.bonus}
                </div>
                <div className="text-xs text-slate-400 mt-2">Pending Payout</div>
              </BentoTile>

              <BentoTile
                variant="glass"
                icon={<Clock className="h-5 w-5" />}
                title="Hours Worked"
                data-testid="tile-weekly-hours"
              >
                <div className="text-2xl font-bold text-white" data-testid="text-weekly-hours-count">
                  {weeklyStats.hours}h
                </div>
              </BentoTile>

              <BentoTile
                variant="glow"
                icon={<Award className="h-5 w-5" />}
                title="Crew Rank"
                badge={`#${weeklyStats.rank}`}
                data-testid="tile-weekly-rank"
              >
                <div className="text-2xl font-bold text-white" data-testid="text-weekly-rank-position">
                  #{weeklyStats.rank} of 42
                </div>
              </BentoTile>
            </BentoGrid>

            {/* Performance Accordion */}
            <PremiumAccordion type="single" defaultValue="performance" collapsible>
              <PremiumAccordionItem value="performance" variant="gradient">
                <PremiumAccordionTrigger
                  icon={<Activity className="h-5 w-5" />}
                  badge="Above Target"
                  description="Your weekly performance metrics"
                  data-testid="accordion-trigger-performance"
                >
                  Average Performance
                </PremiumAccordionTrigger>
                <PremiumAccordionContent>
                  <div className="space-y-4">
                    <div>
                      <div className="flex justify-between text-sm mb-2">
                        <span className="text-slate-400">Moves Per Hour</span>
                        <span className="text-white font-bold" data-testid="text-mph-value">{weeklyStats.mph} / 4.5</span>
                      </div>
                      <div className="meter-premium">
                        <div className="meter-fill" style={{ width: `${(weeklyStats.mph / 6) * 100}%` }} />
                      </div>
                    </div>
                    
                    <div className="flex justify-between items-center pt-2 border-t border-slate-700/50">
                      <div className="text-sm text-slate-400">Target Achievement</div>
                      <div className="text-green-400 font-bold flex items-center gap-1">
                        <CheckCircle2 className="h-4 w-4" />
                        107%
                      </div>
                    </div>
                  </div>
                </PremiumAccordionContent>
              </PremiumAccordionItem>
            </PremiumAccordion>
          </TabsContent>

          <TabsContent value="monthly" className="space-y-6 animate-in slide-in-from-bottom-4">
            {/* Monthly Stats Bento Grid */}
            <BentoGrid columns={2} gap="md">
              <BentoTile
                variant="glass"
                sparkle
                icon={<Zap className="h-5 w-5" />}
                title="Total Moves"
                size="md"
                data-testid="tile-monthly-moves"
              >
                <div className="text-3xl font-bold text-white" data-testid="text-monthly-moves-count">
                  {monthlyStats.moves}
                </div>
              </BentoTile>

              <BentoTile
                variant="gradient"
                sparkle
                icon={<DollarSign className="h-5 w-5" />}
                title="Total Bonus"
                size="md"
                data-testid="tile-monthly-bonus"
              >
                <div className="text-3xl font-bold text-green-400" data-testid="text-monthly-bonus-amount">
                  ${monthlyStats.bonus}
                </div>
              </BentoTile>

              <BentoTile
                variant="glass"
                icon={<Clock className="h-5 w-5" />}
                title="Hours Logged"
                data-testid="tile-monthly-hours"
              >
                <div className="text-2xl font-bold text-white" data-testid="text-monthly-hours-count">
                  {monthlyStats.hours}h
                </div>
              </BentoTile>

              <BentoTile
                variant="glow"
                icon={<Activity className="h-5 w-5" />}
                title="Avg. MPH"
                data-testid="tile-monthly-mph"
              >
                <div className="text-2xl font-bold text-white" data-testid="text-monthly-mph-value">
                  {monthlyStats.mph}
                </div>
              </BentoTile>
            </BentoGrid>

            {/* Monthly Performance Accordion */}
            <PremiumAccordion type="single" defaultValue="monthly-rank" collapsible>
              <PremiumAccordionItem value="monthly-rank" variant="premium">
                <PremiumAccordionTrigger
                  icon={<Award className="h-5 w-5" />}
                  badge={`#${monthlyStats.rank}`}
                  description="Your monthly ranking in the crew"
                  data-testid="accordion-trigger-monthly-rank"
                >
                  Monthly Ranking
                </PremiumAccordionTrigger>
                <PremiumAccordionContent>
                  <div className="flex justify-between items-center">
                    <div className="text-sm text-slate-400">Position in Crew</div>
                    <div className="text-white font-bold text-lg" data-testid="text-monthly-rank-position">
                      #{monthlyStats.rank} of 42
                    </div>
                  </div>
                </PremiumAccordionContent>
              </PremiumAccordionItem>
            </PremiumAccordion>
          </TabsContent>
        </Tabs>

        {/* History Accordion Section */}
        <div className="mt-8">
          <PremiumAccordion type="single" defaultValue="history" collapsible>
            <PremiumAccordionItem value="history" variant="glass">
              <PremiumAccordionTrigger
                icon={<Calendar className="h-5 w-5" />}
                badge={`${history.length} days`}
                description="View your recent shift performance"
                data-testid="accordion-trigger-history"
              >
                Recent Shift History
              </PremiumAccordionTrigger>
              <PremiumAccordionContent>
                <div className="space-y-3">
                  {history.map((item) => (
                    <BentoTile
                      key={item.id}
                      variant="glass"
                      interactive
                      className="!min-h-0 !p-3"
                      data-testid={`tile-history-${item.id}`}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div className="h-10 w-10 rounded-full bg-blue-500/20 flex items-center justify-center text-blue-400 font-bold text-sm border border-blue-500/30">
                            {item.mph}
                          </div>
                          <div>
                            <div className="text-white font-semibold" data-testid={`text-history-date-${item.id}`}>
                              {item.date}
                            </div>
                            <div className="text-slate-400 text-xs" data-testid={`text-history-moves-${item.id}`}>
                              {item.moves} Moves Completed
                            </div>
                          </div>
                        </div>
                        <Badge 
                          variant="outline" 
                          className={getStatusBadgeClass(item.status)}
                          data-testid={`badge-history-status-${item.id}`}
                        >
                          {item.status}
                        </Badge>
                      </div>
                    </BentoTile>
                  ))}
                </div>

                <div className="mt-4">
                  <PremiumButton
                    variant="glass"
                    className="w-full"
                    data-testid="button-view-full-history"
                  >
                    View Full History
                  </PremiumButton>
                </div>
              </PremiumAccordionContent>
            </PremiumAccordionItem>
          </PremiumAccordion>
        </div>
      </div>

      <PageHelp
        pageName="Driver Profile"
        pageDescription="View your performance stats, rankings, bonuses, and shift history at a glance."
        navigationPath={[
          { name: "Home" },
          { name: "Dashboard" },
          { name: "Driver Profile", current: true }
        ]}
        steps={[
          {
            title: "Check Your Rank",
            description: "View your current tier (Bronze, Silver, Gold) and bonus multiplier in the header section."
          },
          {
            title: "Toggle Stats Period",
            description: "Switch between Weekly and Monthly stats using the tabs to compare performance across time periods."
          },
          {
            title: "Review Key Metrics",
            description: "Check your moves count, estimated bonus, hours worked, and crew rank in the stats grid."
          },
          {
            title: "Analyze Performance",
            description: "Expand the Performance accordion to see your moves per hour and target achievement percentage."
          },
          {
            title: "View Shift History",
            description: "Scroll down to see your recent shift history with daily moves, MPH, and status badges."
          }
        ]}
        quickActions={[
          { label: "Weekly Stats", description: "View performance metrics for the current week" },
          { label: "Monthly Stats", description: "See your accumulated stats for the month" },
          { label: "Performance Details", description: "Expand to see moves per hour and target progress" },
          { label: "Shift History", description: "Review past shifts with completion status" }
        ]}
        tips={[
          "Higher tier ranks unlock better bonus multipliers - aim for Gold!",
          "Moves Per Hour (MPH) above 4.5 helps you exceed targets",
          "Check your monthly stats to track progress toward bonuses",
          "Green status badges mean you exceeded expectations for that shift"
        ]}
      />
    </div>
  );
}
