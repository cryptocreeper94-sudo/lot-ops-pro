import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Flashlight, Zap, Smartphone, Radio, Check, X, AlertCircle, Calendar, Filter } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { format, subDays } from "date-fns";

interface EquipmentCheckoutLogProps {
  mode: 'driver' | 'manager';
  driverId?: number;
  driverName?: string;
  driverNumber?: string;
}

interface EquipmentLog {
  id: number;
  driverId: number;
  driverName: string;
  driverNumber: string;
  date: string;
  shift: string;
  flashlight: boolean;
  jumpBox: boolean;
  tc75Scanner: boolean;
  twoWayRadio: boolean;
  missingNotes?: string;
  reportedMissing: boolean;
  reportedAt?: string;
}

export function EquipmentCheckoutLog({ mode, driverId, driverName, driverNumber }: EquipmentCheckoutLogProps) {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const today = format(new Date(), 'yyyy-MM-dd');

  // Driver form state
  const [shift, setShift] = useState<'first' | 'second'>('first');
  const [equipment, setEquipment] = useState({
    flashlight: true,
    jumpBox: true,
    tc75Scanner: true,
    twoWayRadio: true,
  });
  const [missingNotes, setMissingNotes] = useState('');
  const [submitted, setSubmitted] = useState(false);

  // Manager filters
  const [dateFilter, setDateFilter] = useState(today);
  const [shiftFilter, setShiftFilter] = useState<string>('all');
  const [driverFilter, setDriverFilter] = useState<string>('all');
  const [missingOnlyFilter, setMissingOnlyFilter] = useState(false);

  // Fetch driver's history (last 7 days)
  const { data: driverHistory = [] } = useQuery<EquipmentLog[]>({
    queryKey: ['equipment-logs', 'driver', driverId],
    queryFn: async () => {
      if (driverId == null) return [];
      const response = await fetch(`/api/equipment-logs/driver/${driverId}`);
      if (!response.ok) throw new Error('Failed to fetch driver logs');
      return response.json();
    },
    enabled: mode === 'driver' && driverId != null,
  });

  // Fetch all logs for manager view
  const { data: allLogs = [] } = useQuery<EquipmentLog[]>({
    queryKey: ['equipment-logs', 'all'],
    queryFn: async () => {
      const response = await fetch('/api/equipment-logs');
      if (!response.ok) throw new Error('Failed to fetch all logs');
      return response.json();
    },
    enabled: mode === 'manager',
  });

  // Submit equipment log mutation
  const submitLogMutation = useMutation({
    mutationFn: async (logData: any) => {
      const response = await fetch('/api/equipment-logs', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(logData),
      });
      if (!response.ok) throw new Error('Failed to submit log');
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['equipment-logs'] });
      setSubmitted(true);
      toast({
        title: "✅ Equipment Log Submitted",
        description: "Your equipment checkout has been recorded.",
      });
    },
    onError: () => {
      toast({
        title: "❌ Submission Failed",
        description: "Could not submit equipment log. Please try again.",
        variant: "destructive",
      });
    },
  });

  const handleSubmit = () => {
    // CRITICAL: Use == null to allow 0 as valid ID (treats null/undefined as invalid, but 0 as valid)
    if (driverId == null || !driverName || !driverNumber) {
      toast({
        title: "Missing Information",
        description: "Driver information is required.",
        variant: "destructive",
      });
      return;
    }

    const anyMissing = !equipment.flashlight || !equipment.jumpBox || !equipment.tc75Scanner || !equipment.twoWayRadio;

    if (anyMissing && !missingNotes.trim()) {
      toast({
        title: "Missing Notes Required",
        description: "Please provide notes about missing equipment.",
        variant: "destructive",
      });
      return;
    }

    submitLogMutation.mutate({
      driverId,
      driverName,
      driverNumber,
      date: today,
      shift,
      flashlight: equipment.flashlight,
      jumpBox: equipment.jumpBox,
      tc75Scanner: equipment.tc75Scanner,
      twoWayRadio: equipment.twoWayRadio,
      missingNotes: anyMissing ? missingNotes : null,
      reportedMissing: anyMissing,
      reportedAt: anyMissing ? new Date().toISOString() : null,
    });
  };

  const anyMissing = !equipment.flashlight || !equipment.jumpBox || !equipment.tc75Scanner || !equipment.twoWayRadio;

  // Check if already submitted today
  const todayLog = driverHistory.find(log => log.date === today && log.shift === shift);

  useEffect(() => {
    if (todayLog) {
      setSubmitted(true);
    }
  }, [todayLog]);

  // Filter logs for manager view
  const filteredLogs = allLogs.filter(log => {
    if (dateFilter && log.date !== dateFilter) return false;
    if (shiftFilter !== 'all' && log.shift !== shiftFilter) return false;
    if (driverFilter !== 'all' && log.driverNumber !== driverFilter) return false;
    if (missingOnlyFilter && !log.reportedMissing) return false;
    return true;
  });

  // Get unique drivers for filter
  const uniqueDrivers = Array.from(new Set(allLogs.map(log => log.driverNumber)))
    .map(num => {
      const log = allLogs.find(l => l.driverNumber === num);
      return { number: num, name: log?.driverName || num };
    });

  // DRIVER MODE
  if (mode === 'driver') {
    return (
      <div className="space-y-4">
        <Card className="border-2 border-slate-700">
          <CardHeader className="pb-3">
            <CardTitle className="text-lg flex items-center gap-2">
              <div className="h-10 w-10 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center">
                <Flashlight className="h-5 w-5 text-white" />
              </div>
              Daily Equipment Checkout
            </CardTitle>
            <CardDescription className="text-xs">
              Verify your equipment before starting your shift
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Date Display */}
            <div className="flex items-center gap-2 p-3 bg-slate-900 rounded-lg">
              <Calendar className="h-4 w-4 text-blue-400" />
              <div>
                <div className="text-xs text-slate-400">Date</div>
                <div className="font-semibold text-white" data-testid="text-checkout-date">
                  {format(new Date(), 'EEEE, MMMM d, yyyy')}
                </div>
              </div>
            </div>

            {/* Shift Selection */}
            <div className="space-y-2">
              <Label className="text-sm font-semibold">Select Your Shift</Label>
              <RadioGroup
                value={shift}
                onValueChange={(value) => setShift(value as 'first' | 'second')}
                className="flex gap-3"
                data-testid="radio-shift-selection"
              >
                <div className="flex-1">
                  <RadioGroupItem
                    value="first"
                    id="first"
                    className="peer sr-only"
                    data-testid="radio-shift-first"
                  />
                  <Label
                    htmlFor="first"
                    className="flex items-center justify-center rounded-lg border-2 border-slate-600 p-3 cursor-pointer hover:bg-slate-800 peer-data-[state=checked]:border-blue-500 peer-data-[state=checked]:bg-blue-900/30"
                  >
                    <span className="font-semibold">First Shift</span>
                  </Label>
                </div>
                <div className="flex-1">
                  <RadioGroupItem
                    value="second"
                    id="second"
                    className="peer sr-only"
                    data-testid="radio-shift-second"
                  />
                  <Label
                    htmlFor="second"
                    className="flex items-center justify-center rounded-lg border-2 border-slate-600 p-3 cursor-pointer hover:bg-slate-800 peer-data-[state=checked]:border-purple-500 peer-data-[state=checked]:bg-purple-900/30"
                  >
                    <span className="font-semibold">Second Shift</span>
                  </Label>
                </div>
              </RadioGroup>
            </div>

            {/* Equipment Checkboxes */}
            <div className="space-y-2">
              <Label className="text-sm font-semibold">Equipment Checklist</Label>
              <div className="grid grid-cols-1 gap-3">
                {/* Flashlight */}
                <div className="flex items-center gap-3 p-3 bg-slate-800 rounded-lg border-2 border-slate-700 hover:border-slate-600">
                  <Checkbox
                    id="flashlight"
                    checked={equipment.flashlight}
                    onCheckedChange={(checked) => setEquipment({ ...equipment, flashlight: checked as boolean })}
                    className="h-5 w-5"
                    data-testid="checkbox-flashlight"
                  />
                  <Label htmlFor="flashlight" className="flex items-center gap-2 flex-1 cursor-pointer">
                    <Flashlight className="h-4 w-4 text-yellow-400" />
                    <span>Flashlight</span>
                  </Label>
                  {equipment.flashlight && <Check className="h-5 w-5 text-green-500" />}
                </div>

                {/* Jump Box */}
                <div className="flex items-center gap-3 p-3 bg-slate-800 rounded-lg border-2 border-slate-700 hover:border-slate-600">
                  <Checkbox
                    id="jumpBox"
                    checked={equipment.jumpBox}
                    onCheckedChange={(checked) => setEquipment({ ...equipment, jumpBox: checked as boolean })}
                    className="h-5 w-5"
                    data-testid="checkbox-jumpbox"
                  />
                  <Label htmlFor="jumpBox" className="flex items-center gap-2 flex-1 cursor-pointer">
                    <Zap className="h-4 w-4 text-orange-400" />
                    <span>Jump Box</span>
                  </Label>
                  {equipment.jumpBox && <Check className="h-5 w-5 text-green-500" />}
                </div>

                {/* TC-75 Scanner */}
                <div className="flex items-center gap-3 p-3 bg-slate-800 rounded-lg border-2 border-slate-700 hover:border-slate-600">
                  <Checkbox
                    id="tc75Scanner"
                    checked={equipment.tc75Scanner}
                    onCheckedChange={(checked) => setEquipment({ ...equipment, tc75Scanner: checked as boolean })}
                    className="h-5 w-5"
                    data-testid="checkbox-tc75"
                  />
                  <Label htmlFor="tc75Scanner" className="flex items-center gap-2 flex-1 cursor-pointer">
                    <Smartphone className="h-4 w-4 text-blue-400" />
                    <span>TC-75 Scanner</span>
                  </Label>
                  {equipment.tc75Scanner && <Check className="h-5 w-5 text-green-500" />}
                </div>

                {/* 2-Way Radio */}
                <div className="flex items-center gap-3 p-3 bg-slate-800 rounded-lg border-2 border-slate-700 hover:border-slate-600">
                  <Checkbox
                    id="twoWayRadio"
                    checked={equipment.twoWayRadio}
                    onCheckedChange={(checked) => setEquipment({ ...equipment, twoWayRadio: checked as boolean })}
                    className="h-5 w-5"
                    data-testid="checkbox-radio"
                  />
                  <Label htmlFor="twoWayRadio" className="flex items-center gap-2 flex-1 cursor-pointer">
                    <Radio className="h-4 w-4 text-green-400" />
                    <span>2-Way Radio</span>
                  </Label>
                  {equipment.twoWayRadio && <Check className="h-5 w-5 text-green-500" />}
                </div>
              </div>
            </div>

            {/* Missing Equipment Notes */}
            {anyMissing && (
              <div className="space-y-2 p-3 bg-red-900/20 border-2 border-red-700 rounded-lg">
                <div className="flex items-center gap-2 text-red-400">
                  <AlertCircle className="h-4 w-4" />
                  <Label htmlFor="missingNotes" className="text-sm font-semibold">
                    Missing Equipment Notes (Required)
                  </Label>
                </div>
                <Textarea
                  id="missingNotes"
                  value={missingNotes}
                  onChange={(e) => setMissingNotes(e.target.value)}
                  placeholder="Describe which items are missing and why..."
                  className="min-h-[80px] bg-slate-900 border-red-700"
                  data-testid="textarea-missing-notes"
                />
              </div>
            )}

            {/* Submit Button */}
            {!submitted && (
              <Button
                onClick={handleSubmit}
                disabled={submitLogMutation.isPending || (anyMissing && !missingNotes.trim())}
                className="w-full h-12 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-bold"
                data-testid="button-submit-equipment"
              >
                {submitLogMutation.isPending ? 'Submitting...' : 'Submit Equipment Log'}
              </Button>
            )}

            {/* Success Message */}
            {submitted && (
              <div className="p-4 bg-green-900/30 border-2 border-green-700 rounded-lg text-center" data-testid="text-success-message">
                <Check className="h-8 w-8 text-green-500 mx-auto mb-2" />
                <div className="text-green-400 font-semibold">Equipment Log Submitted!</div>
                <div className="text-xs text-slate-400 mt-1">Your equipment checkout has been recorded for today.</div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Driver History - Last 7 Days */}
        {driverHistory.length > 0 && (
          <Card className="border-2 border-slate-700">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm">Recent History (Last 7 Days)</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              {driverHistory.slice(0, 7).map((log) => (
                <div
                  key={log.id}
                  className={`p-3 rounded-lg border-2 ${
                    log.reportedMissing ? 'bg-red-900/20 border-red-700' : 'bg-slate-800 border-slate-700'
                  }`}
                  data-testid={`card-history-${log.id}`}
                >
                  <div className="flex items-center justify-between mb-2">
                    <div className="text-sm font-semibold">
                      {format(new Date(log.date), 'MMM d, yyyy')}
                    </div>
                    <Badge variant={log.shift === 'first' ? 'default' : 'secondary'} className="text-xs">
                      {log.shift === 'first' ? 'First Shift' : 'Second Shift'}
                    </Badge>
                  </div>
                  <div className="grid grid-cols-2 gap-2 text-xs">
                    <div className={`flex items-center gap-1 ${!log.flashlight ? 'text-red-400' : 'text-slate-400'}`}>
                      <Flashlight className="h-3 w-3" />
                      {log.flashlight ? <Check className="h-3 w-3" /> : <X className="h-3 w-3" />}
                    </div>
                    <div className={`flex items-center gap-1 ${!log.jumpBox ? 'text-red-400' : 'text-slate-400'}`}>
                      <Zap className="h-3 w-3" />
                      {log.jumpBox ? <Check className="h-3 w-3" /> : <X className="h-3 w-3" />}
                    </div>
                    <div className={`flex items-center gap-1 ${!log.tc75Scanner ? 'text-red-400' : 'text-slate-400'}`}>
                      <Smartphone className="h-3 w-3" />
                      {log.tc75Scanner ? <Check className="h-3 w-3" /> : <X className="h-3 w-3" />}
                    </div>
                    <div className={`flex items-center gap-1 ${!log.twoWayRadio ? 'text-red-400' : 'text-slate-400'}`}>
                      <Radio className="h-3 w-3" />
                      {log.twoWayRadio ? <Check className="h-3 w-3" /> : <X className="h-3 w-3" />}
                    </div>
                  </div>
                  {log.missingNotes && (
                    <div className="mt-2 text-xs text-red-400 bg-red-900/30 p-2 rounded">
                      {log.missingNotes}
                    </div>
                  )}
                </div>
              ))}
            </CardContent>
          </Card>
        )}
      </div>
    );
  }

  // MANAGER MODE
  return (
    <div className="space-y-4">
      <Card className="border-2 border-slate-700">
        <CardHeader className="pb-3">
          <CardTitle className="text-lg flex items-center gap-2">
            <div className="h-10 w-10 rounded-full bg-gradient-to-br from-green-500 to-blue-600 flex items-center justify-center">
              <Filter className="h-5 w-5 text-white" />
            </div>
            Equipment Checkout Logs
          </CardTitle>
          <CardDescription className="text-xs">
            Monitor daily equipment compliance across all drivers
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Filters */}
          <div className="grid md:grid-cols-4 gap-3">
            {/* Date Filter */}
            <div className="space-y-1">
              <Label className="text-xs text-slate-400">Date</Label>
              <Input
                type="date"
                value={dateFilter}
                onChange={(e) => setDateFilter(e.target.value)}
                className="h-9 text-sm bg-slate-900"
                data-testid="input-filter-date"
              />
            </div>

            {/* Shift Filter */}
            <div className="space-y-1">
              <Label className="text-xs text-slate-400">Shift</Label>
              <Select value={shiftFilter} onValueChange={setShiftFilter}>
                <SelectTrigger className="h-9 text-sm bg-slate-900" data-testid="select-filter-shift">
                  <SelectValue placeholder="All Shifts" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Shifts</SelectItem>
                  <SelectItem value="first">First Shift</SelectItem>
                  <SelectItem value="second">Second Shift</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Driver Filter */}
            <div className="space-y-1">
              <Label className="text-xs text-slate-400">Driver</Label>
              <Select value={driverFilter} onValueChange={setDriverFilter}>
                <SelectTrigger className="h-9 text-sm bg-slate-900" data-testid="select-filter-driver">
                  <SelectValue placeholder="All Drivers" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Drivers</SelectItem>
                  {uniqueDrivers.map((driver) => (
                    <SelectItem key={driver.number} value={driver.number}>
                      {driver.name} (#{driver.number})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Missing Only Toggle */}
            <div className="space-y-1 flex items-end">
              <Button
                variant={missingOnlyFilter ? "default" : "outline"}
                onClick={() => setMissingOnlyFilter(!missingOnlyFilter)}
                className="w-full h-9 text-sm"
                data-testid="button-filter-missing"
              >
                <AlertCircle className="h-3 w-3 mr-1" />
                {missingOnlyFilter ? 'Showing Missing' : 'Missing Only'}
              </Button>
            </div>
          </div>

          {/* Results Count */}
          <div className="text-xs text-slate-400">
            Showing {filteredLogs.length} of {allLogs.length} logs
          </div>

          {/* Logs Table */}
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-slate-900 text-xs text-slate-400">
                <tr>
                  <th className="p-2 text-left">Date</th>
                  <th className="p-2 text-left">Shift</th>
                  <th className="p-2 text-left">Driver</th>
                  <th className="p-2 text-center">Flashlight</th>
                  <th className="p-2 text-center">Jump Box</th>
                  <th className="p-2 text-center">TC-75</th>
                  <th className="p-2 text-center">Radio</th>
                  <th className="p-2 text-left">Notes</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-700">
                {filteredLogs.map((log) => (
                  <tr
                    key={log.id}
                    className={`hover:bg-slate-800 ${log.reportedMissing ? 'bg-red-900/10' : ''}`}
                    data-testid={`row-log-${log.id}`}
                  >
                    <td className="p-2">{format(new Date(log.date), 'MMM d, yyyy')}</td>
                    <td className="p-2">
                      <Badge variant={log.shift === 'first' ? 'default' : 'secondary'} className="text-xs">
                        {log.shift === 'first' ? 'First' : 'Second'}
                      </Badge>
                    </td>
                    <td className="p-2">
                      <div className="font-semibold">{log.driverName}</div>
                      <div className="text-xs text-slate-400">#{log.driverNumber}</div>
                    </td>
                    <td className="p-2 text-center">
                      {log.flashlight ? (
                        <Badge variant="default" className="bg-green-600" data-testid={`badge-flashlight-${log.id}`}>
                          <Check className="h-3 w-3" />
                        </Badge>
                      ) : (
                        <Badge variant="destructive" data-testid={`badge-flashlight-${log.id}`}>
                          <X className="h-3 w-3" />
                        </Badge>
                      )}
                    </td>
                    <td className="p-2 text-center">
                      {log.jumpBox ? (
                        <Badge variant="default" className="bg-green-600" data-testid={`badge-jumpbox-${log.id}`}>
                          <Check className="h-3 w-3" />
                        </Badge>
                      ) : (
                        <Badge variant="destructive" data-testid={`badge-jumpbox-${log.id}`}>
                          <X className="h-3 w-3" />
                        </Badge>
                      )}
                    </td>
                    <td className="p-2 text-center">
                      {log.tc75Scanner ? (
                        <Badge variant="default" className="bg-green-600" data-testid={`badge-tc75-${log.id}`}>
                          <Check className="h-3 w-3" />
                        </Badge>
                      ) : (
                        <Badge variant="destructive" data-testid={`badge-tc75-${log.id}`}>
                          <X className="h-3 w-3" />
                        </Badge>
                      )}
                    </td>
                    <td className="p-2 text-center">
                      {log.twoWayRadio ? (
                        <Badge variant="default" className="bg-green-600" data-testid={`badge-radio-${log.id}`}>
                          <Check className="h-3 w-3" />
                        </Badge>
                      ) : (
                        <Badge variant="destructive" data-testid={`badge-radio-${log.id}`}>
                          <X className="h-3 w-3" />
                        </Badge>
                      )}
                    </td>
                    <td className="p-2">
                      {log.missingNotes && (
                        <div className="text-xs text-red-400 max-w-xs truncate" title={log.missingNotes}>
                          {log.missingNotes}
                        </div>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            {filteredLogs.length === 0 && (
              <div className="text-center py-8 text-slate-400" data-testid="text-no-logs">
                No equipment logs found
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
