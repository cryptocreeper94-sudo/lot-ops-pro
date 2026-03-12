import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useQuery } from '@tanstack/react-query';
import { Users, MapPin, Clock, Activity, Phone, Coffee, Truck, CheckCircle2, AlertCircle } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';

interface ActiveDriver {
  id: number;
  name: string;
  phoneLast4: string;
  status: 'idle' | 'busy' | 'break' | 'offline';
  currentZone?: string;
  lastActive?: string;
  profilePhoto?: string;
  vanNumber?: string;
  todayMoves?: number;
  quota?: number;
}

const STATUS_CONFIG = {
  idle: { label: 'Available', icon: CheckCircle2, color: 'bg-emerald-500', textColor: 'text-emerald-400' },
  busy: { label: 'Moving', icon: Truck, color: 'bg-blue-500', textColor: 'text-blue-400' },
  break: { label: 'On Break', icon: Coffee, color: 'bg-amber-500', textColor: 'text-amber-400' },
  offline: { label: 'Offline', icon: AlertCircle, color: 'bg-slate-500', textColor: 'text-slate-400' }
};

export function SupervisorLiveWall() {
  const [lastUpdate, setLastUpdate] = useState(new Date());

  const { data: drivers = [], isLoading } = useQuery<ActiveDriver[]>({
    queryKey: ['/api/drivers/active'],
    queryFn: async () => {
      const res = await fetch('/api/drivers/active');
      if (!res.ok) throw new Error('Failed to fetch active drivers');
      return res.json();
    },
    refetchInterval: 10000
  });

  useEffect(() => {
    setLastUpdate(new Date());
  }, [drivers]);

  const statusCounts = {
    idle: drivers.filter(d => d.status === 'idle').length,
    busy: drivers.filter(d => d.status === 'busy').length,
    break: drivers.filter(d => d.status === 'break').length,
    offline: drivers.filter(d => d.status === 'offline').length
  };

  const totalMoves = drivers.reduce((acc, d) => acc + (d.todayMoves || 0), 0);

  return (
    <Card className="bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 border-cyan-500/30 shadow-xl shadow-cyan-500/10">
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-gradient-to-br from-cyan-500 to-blue-600 shadow-lg shadow-cyan-500/30">
              <Users className="w-5 h-5 text-white" />
            </div>
            <div>
              <CardTitle className="text-lg text-white">Live Driver Wall</CardTitle>
              <p className="text-xs text-slate-400">
                Updated {lastUpdate.toLocaleTimeString()}
              </p>
            </div>
          </div>
          
          <div className="flex gap-2">
            {Object.entries(statusCounts).map(([status, count]) => {
              const config = STATUS_CONFIG[status as keyof typeof STATUS_CONFIG];
              return (
                <div key={status} className="flex items-center gap-1 px-2 py-1 rounded-full bg-slate-800/60">
                  <div className={`w-2 h-2 rounded-full ${config.color}`} />
                  <span className="text-xs text-slate-300">{count}</span>
                </div>
              );
            })}
          </div>
        </div>

        <div className="flex gap-4 mt-3 pt-3 border-t border-slate-700/50">
          <div className="flex items-center gap-2">
            <Activity className="w-4 h-4 text-cyan-400" />
            <span className="text-sm text-slate-300">
              <span className="font-bold text-white">{drivers.length}</span> Active
            </span>
          </div>
          <div className="flex items-center gap-2">
            <Truck className="w-4 h-4 text-emerald-400" />
            <span className="text-sm text-slate-300">
              <span className="font-bold text-white">{totalMoves}</span> Moves Today
            </span>
          </div>
        </div>
      </CardHeader>

      <CardContent className="pt-2">
        <ScrollArea className="h-[300px] pr-2">
          {isLoading ? (
            <div className="flex items-center justify-center h-full">
              <div className="animate-spin w-8 h-8 border-2 border-cyan-500 border-t-transparent rounded-full" />
            </div>
          ) : drivers.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-slate-400">
              <Users className="w-12 h-12 mb-2 opacity-50" />
              <p>No active drivers</p>
            </div>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2">
              <AnimatePresence mode="popLayout">
                {drivers.map((driver, index) => {
                  const config = STATUS_CONFIG[driver.status] || STATUS_CONFIG.offline;
                  const Icon = config.icon;
                  const progress = driver.quota ? Math.min((driver.todayMoves || 0) / driver.quota * 100, 100) : 0;

                  return (
                    <motion.div
                      key={driver.id}
                      initial={{ opacity: 0, scale: 0.8 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.8 }}
                      transition={{ delay: index * 0.03 }}
                      className="relative bg-slate-800/60 rounded-xl p-3 border border-slate-700/50 hover:border-cyan-500/50 transition-colors"
                    >
                      <div className={`absolute top-2 right-2 w-2.5 h-2.5 rounded-full ${config.color}`} />
                      
                      <div className="flex items-center gap-2 mb-2">
                        {driver.profilePhoto ? (
                          <img 
                            src={driver.profilePhoto} 
                            alt={driver.name}
                            className="w-10 h-10 rounded-full object-cover border-2 border-slate-600"
                          />
                        ) : (
                          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-cyan-500 to-blue-600 flex items-center justify-center text-white font-bold text-sm">
                            {driver.name.charAt(0)}
                          </div>
                        )}
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-white truncate">{driver.name}</p>
                          <p className="text-[10px] text-slate-400 flex items-center gap-1">
                            <Phone className="w-2.5 h-2.5" />
                            {driver.phoneLast4}
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center justify-between text-[10px]">
                        <span className={`flex items-center gap-1 ${config.textColor}`}>
                          <Icon className="w-3 h-3" />
                          {config.label}
                        </span>
                        {driver.vanNumber && (
                          <Badge variant="outline" className="text-[9px] px-1.5 py-0 border-slate-600">
                            {driver.vanNumber}
                          </Badge>
                        )}
                      </div>

                      {driver.currentZone && (
                        <div className="mt-1.5 flex items-center gap-1 text-[10px] text-slate-400">
                          <MapPin className="w-2.5 h-2.5" />
                          {driver.currentZone}
                        </div>
                      )}

                      {driver.quota && (
                        <div className="mt-2">
                          <div className="flex justify-between text-[9px] text-slate-400 mb-0.5">
                            <span>Progress</span>
                            <span>{driver.todayMoves || 0}/{driver.quota}</span>
                          </div>
                          <div className="h-1 bg-slate-700 rounded-full overflow-hidden">
                            <motion.div
                              className={`h-full ${progress >= 100 ? 'bg-emerald-500' : 'bg-cyan-500'}`}
                              initial={{ width: 0 }}
                              animate={{ width: `${progress}%` }}
                              transition={{ duration: 0.5 }}
                            />
                          </div>
                        </div>
                      )}
                    </motion.div>
                  );
                })}
              </AnimatePresence>
            </div>
          )}
        </ScrollArea>
      </CardContent>
    </Card>
  );
}

export default SupervisorLiveWall;
