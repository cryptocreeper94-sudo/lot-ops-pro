import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { ClipboardCheck, CheckCircle2, Circle, Clock, FileText, Send, Download, AlertTriangle, Key } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { useToast } from '@/hooks/use-toast';

interface ChecklistItem {
  id: string;
  label: string;
  required: boolean;
  checked: boolean;
  category: 'vehicle' | 'equipment' | 'safety' | 'admin';
}

interface ShiftSummary {
  totalMoves: number;
  quota: number;
  hoursWorked: number;
  breaksTaken: number;
  incidentsReported: number;
}

const DEFAULT_CHECKLIST: ChecklistItem[] = [
  { id: 'van_returned', label: 'Van returned to designated spot', required: true, checked: false, category: 'vehicle' },
  { id: 'van_clean', label: 'Van interior cleaned', required: false, checked: false, category: 'vehicle' },
  { id: 'fuel_check', label: 'Fuel level checked/reported', required: true, checked: false, category: 'vehicle' },
  { id: 'damage_reported', label: 'Any damage reported to supervisor', required: true, checked: false, category: 'vehicle' },
  { id: 'keys_returned', label: 'Keys returned to key box', required: true, checked: false, category: 'equipment' },
  { id: 'exotic_keys_secured', label: 'All exotic keys secured/delivered', required: true, checked: false, category: 'equipment' },
  { id: 'radio_charged', label: 'Radio placed on charger', required: true, checked: false, category: 'equipment' },
  { id: 'scanner_returned', label: 'Scanner returned/charged', required: false, checked: false, category: 'equipment' },
  { id: 'safety_vest', label: 'Safety vest stored properly', required: false, checked: false, category: 'safety' },
  { id: 'incidents_logged', label: 'All incidents logged in app', required: true, checked: false, category: 'safety' },
  { id: 'timecard_punched', label: 'Punched out in UKG Pro (reminder)', required: true, checked: false, category: 'admin' },
  { id: 'tomorrow_assignment', label: 'Tomorrow\'s assignment reviewed', required: false, checked: false, category: 'admin' }
];

interface ExoticKeyStatus {
  id: number;
  workOrder: string;
  status: string;
  vanDriverName: string | null;
}

interface EndOfShiftReportProps {
  driverName?: string;
  shiftSummary?: ShiftSummary;
  onSubmit?: (report: any) => void;
}

export function EndOfShiftReport({ driverName = 'Driver', shiftSummary, onSubmit }: EndOfShiftReportProps) {
  const [open, setOpen] = useState(false);
  const [checklist, setChecklist] = useState<ChecklistItem[]>(DEFAULT_CHECKLIST);
  const [notes, setNotes] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();

  const { data: exoticKeys = [] } = useQuery<ExoticKeyStatus[]>({
    queryKey: ["/api/exotic-key-tracking"],
    enabled: open,
  });

  const pendingExoticKeys = exoticKeys.filter(k => k.status !== 'key_secured' && k.status !== 'verified_by_patrol');
  const securedExoticKeys = exoticKeys.filter(k => k.status === 'key_secured' || k.status === 'verified_by_patrol');

  const toggleItem = (id: string) => {
    setChecklist(prev => prev.map(item =>
      item.id === id ? { ...item, checked: !item.checked } : item
    ));
  };

  const requiredComplete = checklist.filter(i => i.required).every(i => i.checked);
  const totalChecked = checklist.filter(i => i.checked).length;
  const progress = (totalChecked / checklist.length) * 100;

  const categoryItems = {
    vehicle: checklist.filter(i => i.category === 'vehicle'),
    equipment: checklist.filter(i => i.category === 'equipment'),
    safety: checklist.filter(i => i.category === 'safety'),
    admin: checklist.filter(i => i.category === 'admin')
  };

  const handleSubmit = async () => {
    if (!requiredComplete) {
      toast({
        title: "Required items incomplete",
        description: "Please complete all required checklist items before submitting.",
        variant: "destructive"
      });
      return;
    }

    setIsSubmitting(true);
    try {
      const report = {
        driverName,
        checklist,
        notes,
        shiftSummary,
        submittedAt: new Date().toISOString(),
        completionRate: progress
      };

      await fetch('/api/shift-reports', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(report)
      });

      onSubmit?.(report);
      toast({
        title: "Shift report submitted",
        description: "Your end-of-shift report has been saved. Have a great rest of your day!",
      });
      setOpen(false);
      setChecklist(DEFAULT_CHECKLIST);
      setNotes('');
    } catch (e) {
      toast({
        title: "Submission failed",
        description: "Please try again or contact your supervisor.",
        variant: "destructive"
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button
          className="bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 shadow-lg"
          data-testid="button-end-of-shift"
        >
          <ClipboardCheck className="w-4 h-4 mr-2" />
          End of Shift
        </Button>
      </DialogTrigger>

      <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto bg-slate-900 border-indigo-500/30">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-white">
            <ClipboardCheck className="w-5 h-5 text-indigo-400" />
            End of Shift Report
          </DialogTitle>
        </DialogHeader>

        {shiftSummary && (
          <Card className="bg-slate-800/60 border-slate-700 mb-4">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm text-slate-300 flex items-center gap-2">
                <FileText className="w-4 h-4 text-indigo-400" />
                Shift Summary
              </CardTitle>
            </CardHeader>
            <CardContent className="grid grid-cols-3 gap-3 text-center">
              <div>
                <p className="text-2xl font-bold text-white">{shiftSummary.totalMoves}</p>
                <p className="text-[10px] text-slate-400">Moves</p>
              </div>
              <div>
                <p className="text-2xl font-bold text-emerald-400">
                  {Math.round((shiftSummary.totalMoves / shiftSummary.quota) * 100)}%
                </p>
                <p className="text-[10px] text-slate-400">Quota</p>
              </div>
              <div>
                <p className="text-2xl font-bold text-cyan-400">{shiftSummary.hoursWorked}h</p>
                <p className="text-[10px] text-slate-400">Worked</p>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Exotic Key Status Section */}
        {exoticKeys.length > 0 && (
          <Card className={`mb-4 ${pendingExoticKeys.length > 0 ? 'bg-red-900/30 border-red-500/50' : 'bg-emerald-900/30 border-emerald-500/50'}`}>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm text-slate-300 flex items-center gap-2">
                <Key className={`w-4 h-4 ${pendingExoticKeys.length > 0 ? 'text-red-400' : 'text-emerald-400'}`} />
                Exotic Key Status
              </CardTitle>
            </CardHeader>
            <CardContent className="grid grid-cols-2 gap-3 text-center">
              <div>
                <p className={`text-2xl font-bold ${pendingExoticKeys.length > 0 ? 'text-red-400' : 'text-slate-400'}`}>
                  {pendingExoticKeys.length}
                </p>
                <p className="text-[10px] text-slate-400">Pending</p>
              </div>
              <div>
                <p className="text-2xl font-bold text-emerald-400">{securedExoticKeys.length}</p>
                <p className="text-[10px] text-slate-400">Secured</p>
              </div>
            </CardContent>
            {pendingExoticKeys.length > 0 && (
              <CardContent className="pt-0">
                <div className="text-xs text-red-300 bg-red-900/40 p-2 rounded-md">
                  <AlertTriangle className="w-3 h-3 inline mr-1" />
                  {pendingExoticKeys.length} exotic key(s) still need to be secured before shift end
                  <div className="mt-1 space-y-1">
                    {pendingExoticKeys.slice(0, 3).map(k => (
                      <div key={k.id} className="text-[10px] text-red-200">
                        WO: {k.workOrder} {k.vanDriverName && `- With ${k.vanDriverName}`}
                      </div>
                    ))}
                    {pendingExoticKeys.length > 3 && (
                      <div className="text-[10px] text-red-200">...and {pendingExoticKeys.length - 3} more</div>
                    )}
                  </div>
                </div>
              </CardContent>
            )}
          </Card>
        )}

        <div className="mb-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-slate-300">Checklist Progress</span>
            <span className="text-sm text-indigo-400 font-bold">{totalChecked}/{checklist.length}</span>
          </div>
          <div className="h-2 bg-slate-700 rounded-full overflow-hidden">
            <motion.div
              className={`h-full ${requiredComplete ? 'bg-gradient-to-r from-emerald-500 to-teal-500' : 'bg-gradient-to-r from-indigo-500 to-purple-500'}`}
              initial={{ width: 0 }}
              animate={{ width: `${progress}%` }}
              transition={{ duration: 0.3 }}
            />
          </div>
          {!requiredComplete && (
            <p className="text-[10px] text-amber-400 mt-1 flex items-center gap-1">
              <AlertTriangle className="w-3 h-3" />
              Complete all required items (marked with *)
            </p>
          )}
        </div>

        <div className="space-y-4 max-h-[300px] overflow-y-auto pr-2">
          {Object.entries(categoryItems).map(([category, items]) => (
            <div key={category}>
              <h4 className="text-xs font-bold text-slate-400 uppercase mb-2 flex items-center gap-2">
                {category === 'vehicle' && '🚐'}
                {category === 'equipment' && '🔧'}
                {category === 'safety' && '⚠️'}
                {category === 'admin' && '📋'}
                {category}
              </h4>
              <div className="space-y-1">
                {items.map(item => (
                  <motion.button
                    key={item.id}
                    onClick={() => toggleItem(item.id)}
                    className={`w-full flex items-center gap-3 p-2 rounded-lg text-left transition-colors ${
                      item.checked
                        ? 'bg-emerald-500/20 border border-emerald-500/40'
                        : 'bg-slate-800/60 border border-slate-700 hover:border-indigo-500/50'
                    }`}
                    whileTap={{ scale: 0.98 }}
                  >
                    {item.checked ? (
                      <CheckCircle2 className="w-5 h-5 text-emerald-400 flex-shrink-0" />
                    ) : (
                      <Circle className="w-5 h-5 text-slate-500 flex-shrink-0" />
                    )}
                    <span className={`text-sm ${item.checked ? 'text-emerald-300 line-through' : 'text-white'}`}>
                      {item.label}
                      {item.required && <span className="text-red-400 ml-1">*</span>}
                    </span>
                  </motion.button>
                ))}
              </div>
            </div>
          ))}
        </div>

        <div className="mt-4">
          <label className="text-sm text-slate-300 mb-2 block">Additional Notes (Optional)</label>
          <Textarea
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="Any issues, suggestions, or notes for the next shift..."
            className="bg-slate-800/60 border-slate-700 text-white placeholder:text-slate-500 min-h-[80px]"
            data-testid="textarea-shift-notes"
          />
        </div>

        <div className="flex gap-2 mt-6">
          <Button
            variant="outline"
            className="flex-1 border-slate-600"
            onClick={() => setOpen(false)}
          >
            Cancel
          </Button>
          <Button
            className="flex-1 bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700"
            onClick={handleSubmit}
            disabled={isSubmitting || !requiredComplete}
            data-testid="button-submit-shift-report"
          >
            {isSubmitting ? (
              <Clock className="w-4 h-4 mr-2 animate-spin" />
            ) : (
              <Send className="w-4 h-4 mr-2" />
            )}
            Submit Report
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}

export default EndOfShiftReport;
