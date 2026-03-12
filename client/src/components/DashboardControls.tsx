import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Settings2, Eye, EyeOff, RotateCcw, Save, X, Layout, Palette } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

export interface DashboardWidget {
  id: string;
  name: string;
  description: string;
  enabled: boolean;
  category: 'core' | 'analytics' | 'communication' | 'tools';
}

export interface DashboardConfig {
  widgets: DashboardWidget[];
  layout: 'compact' | 'comfortable' | 'spacious';
  alertLevel: 'all' | 'important' | 'critical';
  autoRefresh: boolean;
  refreshInterval: number;
}

const DEFAULT_WIDGETS: DashboardWidget[] = [
  { id: 'weather', name: 'Weather Widget', description: 'Current weather conditions', enabled: true, category: 'core' },
  { id: 'quota', name: 'Quota Tracker', description: 'Daily move quota progress', enabled: true, category: 'core' },
  { id: 'messages', name: 'Messages', description: 'Team communications', enabled: true, category: 'communication' },
  { id: 'live_wall', name: 'Live Driver Wall', description: 'Real-time driver status', enabled: true, category: 'analytics' },
  { id: 'maps', name: 'Lot Maps', description: 'Interactive lot navigation', enabled: true, category: 'tools' },
  { id: 'scanner', name: 'Quick Scanner', description: 'VIN/Hallmark scanner', enabled: true, category: 'tools' },
  { id: 'safety', name: 'Safety Alerts', description: 'Safety reminders and alerts', enabled: true, category: 'core' },
  { id: 'breaks', name: 'Break Timer', description: 'Break tracking', enabled: true, category: 'tools' },
  { id: 'leaderboard', name: 'Leaderboard', description: 'Top performers today', enabled: false, category: 'analytics' },
  { id: 'announcements', name: 'Announcements', description: 'Company announcements', enabled: true, category: 'communication' }
];

const STORAGE_KEY = 'lotops_dashboard_config';

interface DashboardControlsProps {
  onConfigChange?: (config: DashboardConfig) => void;
  triggerClassName?: string;
}

export function DashboardControls({ onConfigChange, triggerClassName = '' }: DashboardControlsProps) {
  const [open, setOpen] = useState(false);
  const [config, setConfig] = useState<DashboardConfig>({
    widgets: DEFAULT_WIDGETS,
    layout: 'comfortable',
    alertLevel: 'all',
    autoRefresh: true,
    refreshInterval: 30
  });
  const [hasChanges, setHasChanges] = useState(false);

  useEffect(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        setConfig({
          ...config,
          ...parsed,
          widgets: DEFAULT_WIDGETS.map(w => ({
            ...w,
            enabled: parsed.widgets?.find((pw: DashboardWidget) => pw.id === w.id)?.enabled ?? w.enabled
          }))
        });
      } catch (e) {
        console.error('Failed to load dashboard config:', e);
      }
    }
  }, []);

  const toggleWidget = (id: string) => {
    setConfig(prev => ({
      ...prev,
      widgets: prev.widgets.map(w => 
        w.id === id ? { ...w, enabled: !w.enabled } : w
      )
    }));
    setHasChanges(true);
  };

  const saveConfig = () => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(config));
    onConfigChange?.(config);
    setHasChanges(false);
    setOpen(false);
  };

  const resetToDefaults = () => {
    setConfig({
      widgets: DEFAULT_WIDGETS,
      layout: 'comfortable',
      alertLevel: 'all',
      autoRefresh: true,
      refreshInterval: 30
    });
    setHasChanges(true);
  };

  const widgetsByCategory = {
    core: config.widgets.filter(w => w.category === 'core'),
    analytics: config.widgets.filter(w => w.category === 'analytics'),
    communication: config.widgets.filter(w => w.category === 'communication'),
    tools: config.widgets.filter(w => w.category === 'tools')
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button
          variant="outline"
          size="sm"
          className={`border-slate-600 hover:bg-slate-700 ${triggerClassName}`}
          data-testid="button-dashboard-controls"
        >
          <Settings2 className="w-4 h-4 mr-2" />
          Customize
        </Button>
      </DialogTrigger>

      <DialogContent className="max-w-lg bg-slate-900 border-slate-700">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-white">
            <Settings2 className="w-5 h-5 text-cyan-400" />
            Dashboard Settings
          </DialogTitle>
        </DialogHeader>

        <Tabs defaultValue="widgets" className="mt-4">
          <TabsList className="grid grid-cols-2 bg-slate-800">
            <TabsTrigger value="widgets" className="data-[state=active]:bg-cyan-500/20">
              <Layout className="w-4 h-4 mr-2" />
              Widgets
            </TabsTrigger>
            <TabsTrigger value="preferences" className="data-[state=active]:bg-cyan-500/20">
              <Palette className="w-4 h-4 mr-2" />
              Preferences
            </TabsTrigger>
          </TabsList>

          <TabsContent value="widgets" className="mt-4 space-y-4 max-h-[400px] overflow-y-auto">
            {Object.entries(widgetsByCategory).map(([category, widgets]) => (
              <div key={category}>
                <h4 className="text-xs font-bold text-slate-400 uppercase mb-2 px-1">
                  {category}
                </h4>
                <div className="space-y-2">
                  {widgets.map(widget => (
                    <motion.div
                      key={widget.id}
                      className={`flex items-center justify-between p-3 rounded-lg border transition-colors ${
                        widget.enabled
                          ? 'bg-slate-800/60 border-cyan-500/30'
                          : 'bg-slate-800/30 border-slate-700/50'
                      }`}
                      whileTap={{ scale: 0.98 }}
                    >
                      <div className="flex items-center gap-3">
                        {widget.enabled ? (
                          <Eye className="w-4 h-4 text-cyan-400" />
                        ) : (
                          <EyeOff className="w-4 h-4 text-slate-500" />
                        )}
                        <div>
                          <p className={`text-sm font-medium ${widget.enabled ? 'text-white' : 'text-slate-400'}`}>
                            {widget.name}
                          </p>
                          <p className="text-[10px] text-slate-500">{widget.description}</p>
                        </div>
                      </div>
                      <Switch
                        checked={widget.enabled}
                        onCheckedChange={() => toggleWidget(widget.id)}
                        className="data-[state=checked]:bg-cyan-500"
                      />
                    </motion.div>
                  ))}
                </div>
              </div>
            ))}
          </TabsContent>

          <TabsContent value="preferences" className="mt-4 space-y-4">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <Label className="text-white">Layout Density</Label>
                  <p className="text-[10px] text-slate-400">Adjust spacing between widgets</p>
                </div>
                <Select
                  value={config.layout}
                  onValueChange={(v: 'compact' | 'comfortable' | 'spacious') => {
                    setConfig(prev => ({ ...prev, layout: v }));
                    setHasChanges(true);
                  }}
                >
                  <SelectTrigger className="w-32 bg-slate-800 border-slate-600">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-slate-800 border-slate-600">
                    <SelectItem value="compact">Compact</SelectItem>
                    <SelectItem value="comfortable">Comfortable</SelectItem>
                    <SelectItem value="spacious">Spacious</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <Label className="text-white">Alert Level</Label>
                  <p className="text-[10px] text-slate-400">Which alerts to show</p>
                </div>
                <Select
                  value={config.alertLevel}
                  onValueChange={(v: 'all' | 'important' | 'critical') => {
                    setConfig(prev => ({ ...prev, alertLevel: v }));
                    setHasChanges(true);
                  }}
                >
                  <SelectTrigger className="w-32 bg-slate-800 border-slate-600">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-slate-800 border-slate-600">
                    <SelectItem value="all">All Alerts</SelectItem>
                    <SelectItem value="important">Important Only</SelectItem>
                    <SelectItem value="critical">Critical Only</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <Label className="text-white">Auto-Refresh</Label>
                  <p className="text-[10px] text-slate-400">Automatically update data</p>
                </div>
                <Switch
                  checked={config.autoRefresh}
                  onCheckedChange={(v) => {
                    setConfig(prev => ({ ...prev, autoRefresh: v }));
                    setHasChanges(true);
                  }}
                  className="data-[state=checked]:bg-cyan-500"
                />
              </div>
            </div>
          </TabsContent>
        </Tabs>

        <div className="flex items-center justify-between mt-6 pt-4 border-t border-slate-700">
          <Button
            variant="ghost"
            size="sm"
            onClick={resetToDefaults}
            className="text-slate-400 hover:text-white"
          >
            <RotateCcw className="w-4 h-4 mr-2" />
            Reset
          </Button>
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setOpen(false)}
              className="border-slate-600"
            >
              Cancel
            </Button>
            <Button
              size="sm"
              onClick={saveConfig}
              disabled={!hasChanges}
              className="bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-600 hover:to-blue-700"
            >
              <Save className="w-4 h-4 mr-2" />
              Save
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

export function useDashboardConfig() {
  const [config, setConfig] = useState<DashboardConfig | null>(null);

  useEffect(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      try {
        setConfig(JSON.parse(saved));
      } catch (e) {
        console.error('Failed to load config:', e);
      }
    }
  }, []);

  const isWidgetEnabled = (id: string) => {
    return config?.widgets?.find(w => w.id === id)?.enabled ?? true;
  };

  return { config, isWidgetEnabled };
}

export default DashboardControls;
