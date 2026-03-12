import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Coffee, UtensilsCrossed, Clock, AlertCircle, Check } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface BreakManagerProps {
  driverNumber: string;
  driverName: string;
  readOnly?: boolean; // Inventory drivers can only view, not control
}

interface BreakState {
  isOnBreak: boolean;
  breakType: 'break1' | 'lunch' | 'break2' | null;
  startTime: Date | null;
  duration: number; // in minutes
  warningShown: boolean;
}

interface BreakUsage {
  break1Used: boolean;
  lunchUsed: boolean;
  break2Used: boolean;
}

export function BreakManager({ driverNumber, driverName, readOnly = false }: BreakManagerProps) {
  const [breakState, setBreakState] = useState<BreakState>({
    isOnBreak: false,
    breakType: null,
    startTime: null,
    duration: 0,
    warningShown: false,
  });
  
  const [breakUsage, setBreakUsage] = useState<BreakUsage>({
    break1Used: false,
    lunchUsed: false,
    break2Used: false,
  });
  
  const [timeRemaining, setTimeRemaining] = useState(0);
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);
  const [selectedBreakType, setSelectedBreakType] = useState<'break1' | 'lunch' | 'break2' | null>(null);
  const { toast } = useToast();

  // Timer countdown
  useEffect(() => {
    if (!breakState.isOnBreak || !breakState.startTime) return;

    const interval = setInterval(() => {
      const now = new Date();
      const elapsedMs = now.getTime() - breakState.startTime!.getTime();
      const elapsedMinutes = Math.floor(elapsedMs / 60000);
      const remaining = breakState.duration - elapsedMinutes;
      
      setTimeRemaining(remaining);

      // 5-minute warning
      if (remaining === 5 && !breakState.warningShown) {
        setBreakState(prev => ({ ...prev, warningShown: true }));
        toast({
          title: "⏰ 5 Minutes Left!",
          description: "Your break ends in 5 minutes. Time to wrap up!",
          variant: "destructive",
          duration: 10000,
        });
      }

      // Break is over
      if (remaining <= 0) {
        toast({
          title: "🔴 BREAK OVER",
          description: "Time to get back to work!",
          variant: "destructive",
          duration: 15000,
        });
        
        // Auto-end break after overtime
        if (remaining <= -2) {
          endBreak();
        }
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [breakState, toast]);

  // Load break usage from localStorage on mount
  useEffect(() => {
    const today = new Date().toISOString().split('T')[0];
    const savedUsage = localStorage.getItem(`break_usage_${driverNumber}_${today}`);
    
    if (savedUsage) {
      setBreakUsage(JSON.parse(savedUsage));
    }
  }, [driverNumber]);

  const startBreak = async (type: 'break1' | 'lunch' | 'break2') => {
    const duration = type === 'lunch' ? 30 : 15;
    const isDemoMode = localStorage.getItem('vanops_demo_mode') === 'true';
    
    const now = new Date();
    setBreakState({
      isOnBreak: true,
      breakType: type,
      startTime: now,
      duration,
      warningShown: false,
    });
    
    setTimeRemaining(duration);

    // Update usage
    const newUsage = {
      ...breakUsage,
      [type === 'break1' ? 'break1Used' : type === 'lunch' ? 'lunchUsed' : 'break2Used']: true,
    };
    setBreakUsage(newUsage);
    
    // Save to localStorage
    const today = new Date().toISOString().split('T')[0];
    localStorage.setItem(`break_usage_${driverNumber}_${today}`, JSON.stringify(newUsage));

    // Log to database (skip if demo mode)
    if (!isDemoMode) {
      try {
        await fetch('/api/breaks/start', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            driverNumber,
            breakType: type === 'lunch' ? 'lunch' : 'break',
            startTime: now.toISOString(),
            duration,
            date: today,
          }),
        });
      } catch (error) {
        console.error('Failed to log break start:', error);
      }
    }

    toast({
      title: `✓ ${getBreakLabel(type)} Started`,
      description: `${duration}-minute break. Timer running!`,
    });
    
    setShowConfirmDialog(false);
  };

  const endBreak = async () => {
    if (!breakState.breakType || !breakState.startTime) return;

    const isDemoMode = localStorage.getItem('vanops_demo_mode') === 'true';
    const now = new Date();
    const elapsedMs = now.getTime() - breakState.startTime.getTime();
    const elapsedMinutes = Math.floor(elapsedMs / 60000);

    // Log to database (skip if demo mode)
    if (!isDemoMode) {
      try {
        await fetch('/api/breaks/end', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            driverNumber,
            breakType: breakState.breakType === 'lunch' ? 'lunch' : 'break',
            endTime: now.toISOString(),
            duration: `${elapsedMinutes} minutes`,
          }),
        });
      } catch (error) {
        console.error('Failed to log break end:', error);
      }
    }

    setBreakState({
      isOnBreak: false,
      breakType: null,
      startTime: null,
      duration: 0,
      warningShown: false,
    });
    
    setTimeRemaining(0);

    toast({
      title: "✓ Break Ended",
      description: `Back to work! Break lasted ${elapsedMinutes} minutes.`,
    });
  };

  const confirmStartBreak = (type: 'break1' | 'lunch' | 'break2') => {
    setSelectedBreakType(type);
    setShowConfirmDialog(true);
  };

  const getBreakLabel = (type: 'break1' | 'lunch' | 'break2') => {
    if (type === 'lunch') return 'Lunch Break';
    if (type === 'break1') return '15-Min Break (Morning)';
    return '15-Min Break (Afternoon)';
  };

  const formatTime = (minutes: number) => {
    const absMinutes = Math.abs(minutes);
    const isOvertime = minutes < 0;
    const mins = Math.floor(absMinutes);
    const secs = Math.floor((absMinutes - mins) * 60);
    
    return {
      display: `${isOvertime ? '+' : ''}${mins}:${secs.toString().padStart(2, '0')}`,
      isOvertime,
    };
  };

  const time = formatTime(timeRemaining);

  return (
    <>
      <Card className="border-blue-200 bg-gradient-to-br from-blue-50 to-white shadow-sm">
        <CardHeader className="pb-3">
          <CardTitle className="text-base flex items-center gap-2">
            <Clock className="w-4 h-4 text-blue-600" />
            Break Manager
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          {readOnly && (
            <div className="mb-3 p-2 bg-slate-100 rounded border border-slate-300 text-xs text-slate-700 flex items-center gap-2">
              <AlertCircle className="w-3 h-3" />
              <span>View Only - Break controls managed by van drivers</span>
            </div>
          )}
          
          {!breakState.isOnBreak ? (
            readOnly ? (
              <div className="text-center py-8 text-slate-500">
                <Clock className="w-8 h-8 mx-auto mb-2 opacity-50" />
                <p className="text-sm">No active break</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 gap-2">
                {/* Morning 15-min Break */}
                <Button
                  onClick={() => confirmStartBreak('break1')}
                  disabled={breakUsage.break1Used}
                  className="h-12 bg-blue-600 hover:bg-blue-700"
                  data-testid="button-start-break1"
                >
                  <Coffee className="w-4 h-4 mr-2" />
                  {breakUsage.break1Used ? (
                    <><Check className="w-4 h-4 mr-1" /> Break 1 Used</>
                  ) : (
                    '15-Min Break (Morning)'
                  )}
                </Button>

                {/* 30-min Lunch */}
                <Button
                  onClick={() => confirmStartBreak('lunch')}
                  disabled={breakUsage.lunchUsed}
                  className="h-12 bg-orange-600 hover:bg-orange-700"
                  data-testid="button-start-lunch"
                >
                  <UtensilsCrossed className="w-4 h-4 mr-2" />
                  {breakUsage.lunchUsed ? (
                    <><Check className="w-4 h-4 mr-1" /> Lunch Used</>
                  ) : (
                    '30-Min Lunch'
                  )}
                </Button>

                {/* Afternoon 15-min Break (Optional) */}
                <Button
                  onClick={() => confirmStartBreak('break2')}
                  disabled={breakUsage.break2Used}
                  variant="outline"
                  className="h-12 border-blue-300"
                  data-testid="button-start-break2"
                >
                  <Coffee className="w-4 h-4 mr-2" />
                  {breakUsage.break2Used ? (
                    <><Check className="w-4 h-4 mr-1" /> Break 2 Used</>
                  ) : (
                    '15-Min Break (Afternoon) - Optional'
                  )}
                </Button>
              </div>
            )
          ) : (
            <div className="space-y-3">
              {/* Active Break Display */}
              <div className="text-center p-4 bg-blue-100 rounded-lg border-2 border-blue-400">
                <div className="text-sm text-blue-700 font-medium mb-1">
                  {getBreakLabel(breakState.breakType!)}
                </div>
                <div className={`text-5xl font-bold font-mono ${time.isOvertime ? 'text-red-600 animate-pulse' : 'text-blue-900'}`}>
                  {time.display}
                </div>
                {time.isOvertime && (
                  <div className="text-red-600 font-bold text-sm mt-2 animate-pulse">
                    OVERTIME - RETURN TO WORK
                  </div>
                )}
                {!time.isOvertime && timeRemaining <= 5 && (
                  <div className="text-orange-600 font-bold text-sm mt-2">
                    ⚠️ {timeRemaining} {timeRemaining === 1 ? 'MINUTE' : 'MINUTES'} LEFT
                  </div>
                )}
              </div>

              {/* End Break Button (only for non-read-only mode) */}
              {!readOnly && (
                <Button
                  onClick={endBreak}
                  className="w-full h-12 bg-green-600 hover:bg-green-700"
                  data-testid="button-end-break"
                >
                  End Break Early
                </Button>
              )}
            </div>
          )}

          {/* Usage Summary */}
          <div className="flex gap-2 pt-2 border-t">
            <Badge variant={breakUsage.break1Used ? "default" : "outline"} className="text-xs">
              Break 1: {breakUsage.break1Used ? 'Used' : 'Available'}
            </Badge>
            <Badge variant={breakUsage.lunchUsed ? "default" : "outline"} className="text-xs">
              Lunch: {breakUsage.lunchUsed ? 'Used' : 'Available'}
            </Badge>
            <Badge variant={breakUsage.break2Used ? "secondary" : "outline"} className="text-xs">
              Break 2: {breakUsage.break2Used ? 'Used' : 'Optional'}
            </Badge>
          </div>
        </CardContent>
      </Card>

      {/* Confirmation Dialog */}
      <Dialog open={showConfirmDialog} onOpenChange={setShowConfirmDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Start {selectedBreakType && getBreakLabel(selectedBreakType)}?</DialogTitle>
            <DialogDescription>
              {selectedBreakType === 'lunch' && (
                <>You'll have 30 minutes. You'll get a 5-minute warning at 25 minutes.</>
              )}
              {selectedBreakType !== 'lunch' && (
                <>You'll have 15 minutes. You'll get a 5-minute warning at 10 minutes.</>
              )}
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowConfirmDialog(false)}>
              Cancel
            </Button>
            <Button 
              onClick={() => selectedBreakType && startBreak(selectedBreakType)}
              className="bg-blue-600 hover:bg-blue-700"
            >
              Start Break
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
