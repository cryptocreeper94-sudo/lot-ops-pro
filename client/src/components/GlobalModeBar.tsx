import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { AlertTriangle, Shield, GraduationCap, Radio, X } from 'lucide-react';

export type OperationMode = 'normal' | 'emergency' | 'training' | 'maintenance';

interface GlobalModeBarProps {
  className?: string;
}

const MODE_CONFIG = {
  normal: {
    label: 'Normal Operations',
    icon: Shield,
    bgClass: 'bg-gradient-to-r from-slate-700 to-slate-800',
    textClass: 'text-slate-300',
    show: false
  },
  emergency: {
    label: 'EMERGENCY MODE',
    icon: AlertTriangle,
    bgClass: 'bg-gradient-to-r from-red-600 to-orange-600 animate-pulse',
    textClass: 'text-white font-bold',
    show: true
  },
  training: {
    label: 'Training Mode',
    icon: GraduationCap,
    bgClass: 'bg-gradient-to-r from-blue-600 to-indigo-600',
    textClass: 'text-white',
    show: true
  },
  maintenance: {
    label: 'Maintenance Mode',
    icon: Radio,
    bgClass: 'bg-gradient-to-r from-amber-600 to-yellow-600',
    textClass: 'text-black',
    show: true
  }
};

export function GlobalModeBar({ className = '' }: GlobalModeBarProps) {
  const [mode, setMode] = useState<OperationMode>('normal');
  const [message, setMessage] = useState<string>('');
  const [dismissed, setDismissed] = useState(false);

  useEffect(() => {
    const checkMode = async () => {
      try {
        const res = await fetch('/api/system/mode');
        if (res.ok) {
          const data = await res.json();
          setMode(data.mode || 'normal');
          setMessage(data.message || '');
          setDismissed(false);
        }
      } catch (e) {
        console.error('Failed to fetch system mode:', e);
      }
    };

    checkMode();
    const interval = setInterval(checkMode, 30000);
    return () => clearInterval(interval);
  }, []);

  const config = MODE_CONFIG[mode];

  if (dismissed && mode === 'normal') return null;
  if (!config.show) return null;

  const Icon = config.icon;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ y: -50, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        exit={{ y: -50, opacity: 0 }}
        className={`fixed top-10 left-0 right-0 z-40 ${config.bgClass} ${className}`}
      >
        <div className="container mx-auto px-4 py-1.5 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Icon className={`w-4 h-4 ${config.textClass}`} />
            <span className={`text-xs ${config.textClass}`}>
              {config.label}
              {message && ` - ${message}`}
            </span>
          </div>
          
          {mode !== 'emergency' && (
            <button
              onClick={() => setDismissed(true)}
              className="p-0.5 rounded-full hover:bg-white/20 transition-colors"
              data-testid="button-dismiss-mode-bar"
            >
              <X className={`w-3 h-3 ${config.textClass}`} />
            </button>
          )}
        </div>
      </motion.div>
    </AnimatePresence>
  );
}

export function useOperationMode() {
  const [mode, setMode] = useState<OperationMode>('normal');

  const updateMode = async (newMode: OperationMode, message?: string) => {
    try {
      await fetch('/api/system/mode', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ mode: newMode, message })
      });
      setMode(newMode);
    } catch (e) {
      console.error('Failed to update mode:', e);
    }
  };

  return { mode, setMode: updateMode };
}

export default GlobalModeBar;
