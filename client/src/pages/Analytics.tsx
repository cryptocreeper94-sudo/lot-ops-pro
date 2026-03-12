import { useQuery } from "@tanstack/react-query";
import { Badge } from "@/components/ui/badge";
import { Download, TrendingUp, TrendingDown, AlertCircle, CheckCircle2, Activity, Car, Users, ClipboardCheck, Clock } from "lucide-react";
import { BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import { LiveDriverMap } from "@/components/LiveDriverMap";
import { FacilityMapNavigator } from "@/components/FacilityMapNavigator";
import { PageHeader } from "@/components/NavigationControl";
import { BentoGrid, BentoTile } from "@/components/ui/bento-grid";
import { PremiumAccordion, PremiumAccordionItem, PremiumAccordionTrigger, PremiumAccordionContent } from "@/components/ui/premium-accordion";
import { SwipeCarousel } from "@/components/ui/premium-carousel";
import { PremiumButton } from "@/components/ui/premium-button";

const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6'];

export default function Analytics() {
  const { data: analytics, isLoading } = useQuery<{ overview?: any; workOrders?: any[] }>({
    queryKey: ["/api/analytics/dashboard"],
    refetchInterval: 60000,
  });

  const handleExport = (type: string) => {
    window.location.href = `/api/analytics/export/csv?type=${type}`;
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900 flex items-center justify-center">
        <div className="text-white text-xl">Loading Analytics...</div>
      </div>
    );
  }

  const overview: any = analytics?.overview || {};
  const workOrders: any[] = analytics?.workOrders || [];

  const driverStatusData = [
    { name: 'Active', value: overview.activeDrivers || 0 },
    { name: 'Idle', value: (overview.totalDrivers || 0) - (overview.activeDrivers || 0) }
  ];

  const workOrderStatusData = [
    { name: 'Pending', value: overview.pendingWorkOrders || 0 },
    { name: 'Completed', value: overview.completedWorkOrders || 0 }
  ];

  const generateInsights = () => {
    const insights = [];
    
    if (overview.completionRate < 70) {
      insights.push({
        type: 'warning',
        title: 'Work Order Completion Below Target',
        message: `Current completion rate is ${overview.completionRate}%. Consider reallocating resources or extending deadlines.`,
        improvement: 'Assign additional drivers to pending work orders or break large orders into smaller tasks.'
      });
    } else if (overview.completionRate >= 90) {
      insights.push({
        type: 'success',
        title: 'Excellent Work Order Performance',
        message: `${overview.completionRate}% completion rate exceeds expectations.`,
        improvement: 'Team is performing optimally. Consider increasing throughput targets.'
      });
    }

    const idleDriverPercent = ((overview.totalDrivers - overview.activeDrivers) / overview.totalDrivers) * 100;
    if (idleDriverPercent > 50) {
      insights.push({
        type: 'warning',
        title: 'High Driver Idle Time',
        message: `${idleDriverPercent.toFixed(0)}% of drivers are currently idle.`,
        improvement: 'Create additional work orders or redistribute tasks to maximize driver utilization.'
      });
    }

    if (overview.totalVehiclesScanned > 0 && overview.totalWorkOrders === 0) {
      insights.push({
        type: 'info',
        title: 'Vehicles Scanned Without Work Orders',
        message: `${overview.totalVehiclesScanned} vehicles scanned but no work orders created.`,
        improvement: 'Consider creating work orders from scanned vehicles to improve workflow efficiency.'
      });
    }

    if (insights.length === 0) {
      insights.push({
        type: 'success',
        title: 'Operations Running Smoothly',
        message: 'All key metrics are within optimal ranges.',
        improvement: 'Continue monitoring performance for any emerging trends.'
      });
    }

    return insights;
  };

  const insights = generateInsights();

  return (
    <div className="min-h-screen dashboard-premium p-4 md:p-8 scrollbar-premium page-enter">
      <div className="max-w-7xl mx-auto space-y-6">
        <PageHeader title="Analytics Dashboard" navigationVariant="back" fallbackRoute="/dashboard" />
        
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div>
            <p className="text-slate-400 mt-1">Boardroom-quality insights and performance metrics</p>
          </div>
          <div className="flex flex-wrap gap-2">
            <PremiumButton
              variant="glass"
              size="sm"
              icon={<Download className="h-4 w-4" />}
              onClick={() => handleExport('drivers')}
              data-testid="button-export-drivers"
            >
              Drivers CSV
            </PremiumButton>
            <PremiumButton
              variant="glass"
              size="sm"
              icon={<Download className="h-4 w-4" />}
              onClick={() => handleExport('vehicles')}
              data-testid="button-export-vehicles"
            >
              Vehicles CSV
            </PremiumButton>
            <PremiumButton
              variant="glass"
              size="sm"
              icon={<Download className="h-4 w-4" />}
              onClick={() => handleExport('work-orders')}
              data-testid="button-export-workorders"
            >
              Work Orders CSV
            </PremiumButton>
          </div>
        </div>

        <BentoGrid columns={4} gap="md">
          <BentoTile
            variant="glow"
            sparkle
            icon={<Car className="h-5 w-5" />}
            title="Total Vehicles Scanned"
            data-testid="tile-vehicles-scanned"
          >
            <div className="text-3xl font-bold text-white" data-testid="metric-vehicles-scanned">
              {overview.totalVehiclesScanned}
            </div>
            <p className="text-xs text-slate-400 mt-1">Smart scanner autonomous tracking</p>
          </BentoTile>

          <BentoTile
            variant="gradient"
            sparkle
            icon={<Users className="h-5 w-5" />}
            title="Active Drivers"
            data-testid="tile-active-drivers"
          >
            <div className="text-3xl font-bold text-white" data-testid="metric-active-drivers">
              {overview.activeDrivers}/{overview.totalDrivers}
            </div>
            <p className="text-xs text-slate-400 mt-1">
              {((overview.activeDrivers / overview.totalDrivers) * 100).toFixed(0)}% utilization
            </p>
          </BentoTile>

          <BentoTile
            variant="glow"
            sparkle
            icon={<ClipboardCheck className="h-5 w-5" />}
            title="Work Order Completion"
            data-testid="tile-completion-rate"
          >
            <div className="text-3xl font-bold text-white" data-testid="metric-completion-rate">
              {overview.completionRate}%
            </div>
            <p className="text-xs text-slate-400 mt-1">
              {overview.completedWorkOrders}/{overview.totalWorkOrders} completed
            </p>
          </BentoTile>

          <BentoTile
            variant="gradient"
            sparkle
            icon={<Clock className="h-5 w-5" />}
            title="Pending Work Orders"
            data-testid="tile-pending-orders"
          >
            <div className="text-3xl font-bold text-white" data-testid="metric-pending-orders">
              {overview.pendingWorkOrders}
            </div>
            <p className="text-xs text-slate-400 mt-1">Awaiting assignment or completion</p>
          </BentoTile>
        </BentoGrid>

        <BentoTile
          size="wide"
          variant="premium"
          sparkle
          icon={<Activity className="h-5 w-5" />}
          title="AI-Powered Insights & Recommendations"
          description="Intelligent analysis of operational performance with actionable suggestions"
          data-testid="tile-ai-insights"
          interactive={false}
        >
          <SwipeCarousel itemWidth="320px" gap={16} showPeek>
            {insights.map((insight, idx) => (
              <div 
                key={idx} 
                className="bg-white/10 rounded-xl p-4 border border-white/20 h-full min-h-[160px]"
                data-testid={`insight-card-${idx}`}
              >
                <div className="flex items-start gap-3">
                  {insight.type === 'success' && <CheckCircle2 className="h-5 w-5 text-green-400 mt-0.5 flex-shrink-0" />}
                  {insight.type === 'warning' && <AlertCircle className="h-5 w-5 text-yellow-400 mt-0.5 flex-shrink-0" />}
                  {insight.type === 'info' && <Activity className="h-5 w-5 text-blue-400 mt-0.5 flex-shrink-0" />}
                  <div className="flex-1">
                    <h4 className="text-white font-semibold text-sm">{insight.title}</h4>
                    <p className="text-slate-300 text-xs mt-1">{insight.message}</p>
                    <div className="mt-2 bg-black/20 rounded p-2 border-l-4 border-amber-400">
                      <p className="text-xs text-amber-200">
                        <strong>💡 Recommendation:</strong> {insight.improvement}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </SwipeCarousel>
        </BentoTile>

        <PremiumAccordion type="multiple" defaultValue={["live-map", "facility"]}>
          <PremiumAccordionItem value="live-map" variant="glass">
            <PremiumAccordionTrigger 
              icon={<Users className="h-4 w-4" />}
              description="Real-time GPS positions of active drivers"
            >
              Live Driver Map
            </PremiumAccordionTrigger>
            <PremiumAccordionContent>
              <LiveDriverMap />
            </PremiumAccordionContent>
          </PremiumAccordionItem>

          <PremiumAccordionItem value="facility" variant="glass">
            <PremiumAccordionTrigger
              icon={<Car className="h-4 w-4" />}
              description="Navigate facility zones and parking areas"
            >
              Facility Navigator
            </PremiumAccordionTrigger>
            <PremiumAccordionContent>
              <FacilityMapNavigator />
            </PremiumAccordionContent>
          </PremiumAccordionItem>
        </PremiumAccordion>

        <BentoGrid columns={2} gap="lg">
          <BentoTile
            size="md"
            variant="glass"
            title="Driver Status Distribution"
            description="Active vs Idle drivers"
            data-testid="tile-driver-chart"
            interactive={false}
            className="min-h-[380px]"
          >
            <ResponsiveContainer width="100%" height={280}>
              <PieChart>
                <Pie
                  data={driverStatusData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {driverStatusData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </BentoTile>

          <BentoTile
            size="md"
            variant="glass"
            title="Work Order Progress"
            description="Pending vs Completed orders"
            data-testid="tile-workorder-chart"
            interactive={false}
            className="min-h-[380px]"
          >
            <ResponsiveContainer width="100%" height={280}>
              <BarChart data={workOrderStatusData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#ffffff20" />
                <XAxis dataKey="name" stroke="#fff" />
                <YAxis stroke="#fff" />
                <Tooltip contentStyle={{ backgroundColor: '#1e293b', border: '1px solid #475569' }} />
                <Bar dataKey="value" fill="#3b82f6" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </BentoTile>
        </BentoGrid>

        <BentoTile
          size="wide"
          variant="glass"
          title="Recent Work Orders"
          description="Latest assignments and completions"
          data-testid="tile-recent-workorders"
          interactive={false}
        >
          <div className="overflow-x-auto">
            <table className="w-full text-sm" data-testid="table-workorders">
              <thead>
                <tr className="border-b border-white/20">
                  <th className="text-left text-slate-300 font-medium p-2">ID</th>
                  <th className="text-left text-slate-300 font-medium p-2">Title</th>
                  <th className="text-left text-slate-300 font-medium p-2">Assigned To</th>
                  <th className="text-left text-slate-300 font-medium p-2">Progress</th>
                  <th className="text-left text-slate-300 font-medium p-2">Status</th>
                </tr>
              </thead>
              <tbody>
                {workOrders.slice(0, 5).map((wo: any) => (
                  <tr 
                    key={wo.id} 
                    className="border-b border-white/10 hover:bg-white/5 transition-colors"
                    data-testid={`row-workorder-${wo.id}`}
                  >
                    <td className="text-white p-2">{wo.id}</td>
                    <td className="text-white p-2">{wo.title}</td>
                    <td className="text-slate-300 p-2">{wo.assignedTo || 'Unassigned'}</td>
                    <td className="text-slate-300 p-2">
                      {wo.completedCars}/{wo.totalCars}
                    </td>
                    <td className="p-2">
                      <Badge variant={wo.status === 'completed' ? 'default' : 'secondary'}>
                        {wo.status}
                      </Badge>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </BentoTile>
      </div>
    </div>
  );
}
