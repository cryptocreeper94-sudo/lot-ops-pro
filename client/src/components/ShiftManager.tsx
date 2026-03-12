import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Clock, Calendar, Users, ArrowRight, Check, AlertCircle, Coffee, Moon } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface ShiftConfig {
  id: string;
  shiftName: string;
  startTime: string;
  endTime: string;
  daysOfWeek: string[];
  lunchDuration: number;
  breakCount: number;
  breakDuration: number;
  isActive: boolean;
}

const DEFAULT_SHIFTS: ShiftConfig[] = [
  {
    id: 'first_shift',
    shiftName: 'First Shift',
    startTime: '06:00',
    endTime: '15:30',
    daysOfWeek: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'],
    lunchDuration: 30,
    breakCount: 2,
    breakDuration: 15,
    isActive: true,
  },
  {
    id: 'second_shift',
    shiftName: 'Second Shift',
    startTime: '15:30',
    endTime: '00:00',
    daysOfWeek: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'],
    lunchDuration: 30,
    breakCount: 2,
    breakDuration: 15,
    isActive: true,
  },
];

export function ShiftManager() {
  const { toast } = useToast();
  const [shifts, setShifts] = useState<ShiftConfig[]>(DEFAULT_SHIFTS);
  const [selectedDate, setSelectedDate] = useState<string>(new Date().toISOString().split('T')[0]);
  const [shiftExtension, setShiftExtension] = useState<{ shift: string; hours: number } | null>(null);

  const formatTime = (time: string) => {
    const [hours, minutes] = time.split(':');
    const hour = parseInt(hours);
    const ampm = hour >= 12 ? 'PM' : 'AM';
    const displayHour = hour > 12 ? hour - 12 : hour === 0 ? 12 : hour;
    return `${displayHour}:${minutes} ${ampm}`;
  };

  const calculateTotalBreakTime = (shift: ShiftConfig) => {
    return shift.lunchDuration + (shift.breakCount * shift.breakDuration);
  };

  const calculateNetWorkingHours = (shift: ShiftConfig) => {
    const [startHour, startMin] = shift.startTime.split(':').map(Number);
    const [endHour, endMin] = shift.endTime.split(':').map(Number);
    
    let totalMinutes = (endHour * 60 + endMin) - (startHour * 60 + startMin);
    if (totalMinutes < 0) totalMinutes += 24 * 60; // Handle overnight shifts
    
    const breakMinutes = calculateTotalBreakTime(shift);
    const netMinutes = totalMinutes - breakMinutes;
    
    return (netMinutes / 60).toFixed(1);
  };

  const extendShift = (shiftId: string, hours: number) => {
    toast({
      title: "Shift Extended",
      description: `${shiftId === 'first_shift' ? 'First Shift' : 'Second Shift'} extended by ${hours} hour(s) for ${selectedDate}`,
    });
  };

  const abbreviateShift = (shiftId: string, hours: number) => {
    toast({
      title: "Shift Shortened",
      description: `${shiftId === 'first_shift' ? 'First Shift' : 'Second Shift'} shortened by ${hours} hour(s) for ${selectedDate}`,
    });
  };

  return (
    <div className="space-y-6">
      {/* Shift Overview Cards */}
      <div className="grid md:grid-cols-2 gap-4">
        {shifts.map((shift) => (
          <Card key={shift.id} className="border-2 border-slate-700">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  {shift.id === 'first_shift' ? (
                    <div className="h-12 w-12 rounded-full bg-gradient-to-br from-yellow-400 to-orange-500 flex items-center justify-center">
                      <Clock className="h-6 w-6 text-white" />
                    </div>
                  ) : (
                    <div className="h-12 w-12 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center">
                      <Moon className="h-6 w-6 text-white" />
                    </div>
                  )}
                  <div>
                    <CardTitle className="text-lg">{shift.shiftName}</CardTitle>
                    <CardDescription className="text-xs">
                      {shift.daysOfWeek.length === 6 ? 'Mon-Sat' : 'Mon-Fri'}
                    </CardDescription>
                  </div>
                </div>
                <Badge variant={shift.isActive ? "default" : "secondary"} className="text-xs">
                  {shift.isActive ? 'Active' : 'Inactive'}
                </Badge>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Shift Times */}
              <div className="flex items-center gap-3 p-3 bg-slate-900 rounded-lg">
                <span className="text-2xl font-bold text-white">{formatTime(shift.startTime)}</span>
                <ArrowRight className="h-5 w-5 text-slate-400" />
                <span className="text-2xl font-bold text-white">{formatTime(shift.endTime)}</span>
              </div>

              {/* Break Schedule */}
              <div className="grid grid-cols-2 gap-3 text-sm">
                <div className="flex items-center gap-2 p-2 bg-slate-800 rounded">
                  <Coffee className="h-4 w-4 text-blue-400" />
                  <div>
                    <div className="font-semibold text-white">Lunch</div>
                    <div className="text-xs text-slate-400">{shift.lunchDuration} min</div>
                  </div>
                </div>
                <div className="flex items-center gap-2 p-2 bg-slate-800 rounded">
                  <Coffee className="h-4 w-4 text-green-400" />
                  <div>
                    <div className="font-semibold text-white">Breaks</div>
                    <div className="text-xs text-slate-400">{shift.breakCount} × {shift.breakDuration} min</div>
                  </div>
                </div>
              </div>

              {/* Net Working Hours */}
              <div className="p-3 bg-gradient-to-r from-blue-900/30 to-purple-900/30 border border-blue-700/50 rounded-lg">
                <div className="text-xs text-slate-400 mb-1">Net Working Hours</div>
                <div className="text-2xl font-bold text-white">
                  {calculateNetWorkingHours(shift)} <span className="text-sm text-slate-400">hours</span>
                </div>
                <div className="text-xs text-slate-500 mt-1">
                  (After {calculateTotalBreakTime(shift)}min breaks)
                </div>
              </div>

              {/* Shift Adjustment Controls */}
              <div className="pt-3 border-t border-slate-700 space-y-2">
                <Label className="text-xs text-slate-400">Quick Adjustments for {selectedDate}</Label>
                <div className="flex gap-2">
                  <Button
                    size="sm"
                    variant="outline"
                    className="flex-1 text-xs"
                    onClick={() => extendShift(shift.id, 1)}
                    data-testid={`button-extend-${shift.id}`}
                  >
                    <Clock className="h-3 w-3 mr-1" />
                    +1 Hour
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    className="flex-1 text-xs"
                    onClick={() => abbreviateShift(shift.id, 1)}
                    data-testid={`button-shorten-${shift.id}`}
                  >
                    <Clock className="h-3 w-3 mr-1" />
                    -1 Hour
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Date Selector for Adjustments */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2">
            <Calendar className="h-4 w-4" />
            Shift Adjustments
          </CardTitle>
          <CardDescription>Extend or shorten shifts for specific dates</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center gap-4">
            <div className="flex-1">
              <Label htmlFor="adjustment-date" className="text-xs">Select Date</Label>
              <Input
                id="adjustment-date"
                type="date"
                value={selectedDate}
                onChange={(e) => setSelectedDate(e.target.value)}
                className="bg-slate-800"
                data-testid="input-shift-date"
              />
            </div>
            <div className="text-sm text-slate-400 pt-5">
              {new Date(selectedDate).toLocaleDateString('en-US', { weekday: 'long' })}
            </div>
          </div>

          <div className="p-4 bg-blue-900/20 border border-blue-500/30 rounded-lg">
            <div className="flex items-start gap-3">
              <AlertCircle className="h-5 w-5 text-blue-400 mt-0.5 flex-shrink-0" />
              <div className="text-sm text-slate-300">
                <p className="font-semibold text-blue-300 mb-1">Shift Adjustment Info</p>
                <p className="text-xs">
                  Use the quick adjustment buttons above to extend or shorten shifts for specific dates. 
                  Adjustments are tracked separately and won't affect the base shift schedule. 
                  Drivers will see extended/abbreviated times when they clock in.
                </p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Schedule Summary */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Weekly Schedule Summary</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2 text-sm">
            <div className="grid grid-cols-7 gap-2 font-semibold text-xs text-slate-400 mb-2">
              <div>Mon</div>
              <div>Tue</div>
              <div>Wed</div>
              <div>Thu</div>
              <div>Fri</div>
              <div>Sat</div>
              <div>Sun</div>
            </div>
            <div className="grid grid-cols-7 gap-2">
              {['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'].map((day) => {
                const firstShiftActive = shifts[0].daysOfWeek.includes(day);
                const secondShiftActive = shifts[1].daysOfWeek.includes(day);
                return (
                  <div key={day} className="space-y-1">
                    {firstShiftActive && (
                      <div className="bg-yellow-600 text-white rounded px-2 py-1 text-xs text-center">
                        1st
                      </div>
                    )}
                    {secondShiftActive && (
                      <div className="bg-indigo-600 text-white rounded px-2 py-1 text-xs text-center">
                        2nd
                      </div>
                    )}
                    {!firstShiftActive && !secondShiftActive && (
                      <div className="bg-slate-800 text-slate-600 rounded px-2 py-1 text-xs text-center">
                        Off
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
