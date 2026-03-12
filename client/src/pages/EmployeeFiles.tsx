import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription } from "@/components/ui/sheet";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Skeleton } from "@/components/ui/skeleton";
import { BentoGrid, BentoTile } from "@/components/ui/bento-grid";
import { useToast } from "@/hooks/use-toast";
import { NavigationControl } from "@/components/NavigationControl";
import { 
  Search, 
  UserPlus, 
  FileText, 
  Users, 
  Clock, 
  Calendar, 
  User, 
  Phone, 
  Building2,
  AlertCircle,
  CheckCircle2,
  ChevronRight,
  Filter,
  Badge as BadgeIcon,
  Briefcase,
  History,
  Plus,
  RefreshCw
} from "lucide-react";
import type { Employee, EmployeeRecord } from "@shared/schema";

type DateRange = "today" | "3days" | "7days" | "30days" | "custom" | "all";

export default function EmployeeFiles() {
  const { toast } = useToast();
  const [searchQuery, setSearchQuery] = useState("");
  const [roleFilter, setRoleFilter] = useState<string>("all");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [selectedDateRange, setSelectedDateRange] = useState<DateRange>("7days");
  const [customStartDate, setCustomStartDate] = useState("");
  const [customEndDate, setCustomEndDate] = useState("");
  const [selectedEmployee, setSelectedEmployee] = useState<Employee | null>(null);
  const [showDetailSheet, setShowDetailSheet] = useState(false);
  const [showAddEmployeeDialog, setShowAddEmployeeDialog] = useState(false);
  const [showAddRecordDialog, setShowAddRecordDialog] = useState(false);
  
  const [newEmployee, setNewEmployee] = useState({
    name: "",
    badgeNumber: "",
    phoneLast4: "",
    department: "Transport",
    role: "driver",
    type: "permanent"
  });
  
  const [newRecord, setNewRecord] = useState({
    recordType: "note",
    eventDate: new Date().toISOString().split('T')[0],
    shiftType: "",
    description: ""
  });

  const { data: employees = [], isLoading: loadingEmployees, refetch: refetchEmployees } = useQuery<Employee[]>({
    queryKey: ['/api/employee-files', roleFilter, statusFilter],
    queryFn: async () => {
      const params = new URLSearchParams();
      if (roleFilter !== 'all') params.set('role', roleFilter);
      if (statusFilter !== 'all') params.set('status', statusFilter);
      const url = `/api/employee-files${params.toString() ? `?${params}` : ''}`;
      const res = await fetch(url);
      if (!res.ok) throw new Error('Failed to fetch employees');
      return res.json();
    }
  });

  const { data: searchResults = [], isLoading: loadingSearch } = useQuery<Employee[]>({
    queryKey: ['/api/employee-files/search', searchQuery],
    queryFn: async () => {
      if (!searchQuery.trim()) return [];
      const res = await fetch(`/api/employee-files/search?q=${encodeURIComponent(searchQuery)}`);
      if (!res.ok) throw new Error('Failed to search');
      return res.json();
    },
    enabled: searchQuery.trim().length > 0
  });

  const { data: employeeRecords = [], isLoading: loadingRecords, refetch: refetchRecords } = useQuery<EmployeeRecord[]>({
    queryKey: ['/api/employee-files', selectedEmployee?.id, 'records', selectedDateRange, customStartDate, customEndDate],
    queryFn: async () => {
      if (!selectedEmployee) return [];
      const params = new URLSearchParams();
      params.set('dateRange', selectedDateRange);
      if (selectedDateRange === 'custom') {
        if (customStartDate) params.set('startDate', customStartDate);
        if (customEndDate) params.set('endDate', customEndDate);
      }
      const res = await fetch(`/api/employee-files/${selectedEmployee.id}/records?${params}`);
      if (!res.ok) throw new Error('Failed to fetch records');
      return res.json();
    },
    enabled: !!selectedEmployee && showDetailSheet
  });

  const addEmployeeMutation = useMutation({
    mutationFn: async (data: typeof newEmployee) => {
      return apiRequest('/api/employee-files', {
        method: 'POST',
        body: JSON.stringify(data)
      });
    },
    onSuccess: () => {
      toast({ title: "Employee Added", description: "New employee has been added successfully." });
      setShowAddEmployeeDialog(false);
      setNewEmployee({ name: "", badgeNumber: "", phoneLast4: "", department: "Transport", role: "driver", type: "permanent" });
      queryClient.invalidateQueries({ queryKey: ['/api/employee-files'] });
    },
    onError: (error: any) => {
      toast({ title: "Error", description: error.message || "Failed to add employee", variant: "destructive" });
    }
  });

  const addRecordMutation = useMutation({
    mutationFn: async (data: typeof newRecord) => {
      if (!selectedEmployee) throw new Error("No employee selected");
      return apiRequest(`/api/employee-files/${selectedEmployee.id}/records`, {
        method: 'POST',
        body: JSON.stringify(data)
      });
    },
    onSuccess: () => {
      toast({ title: "Record Added", description: "New record has been added to employee file." });
      setShowAddRecordDialog(false);
      setNewRecord({ recordType: "note", eventDate: new Date().toISOString().split('T')[0], shiftType: "", description: "" });
      refetchRecords();
    },
    onError: (error: any) => {
      toast({ title: "Error", description: error.message || "Failed to add record", variant: "destructive" });
    }
  });

  const displayedEmployees = searchQuery.trim() ? searchResults : employees;

  const getRecordTypeIcon = (type: string) => {
    switch (type) {
      case 'move': return <RefreshCw className="w-4 h-4" />;
      case 'attendance': return <Clock className="w-4 h-4" />;
      case 'incident': return <AlertCircle className="w-4 h-4" />;
      case 'acknowledgment': return <CheckCircle2 className="w-4 h-4" />;
      default: return <FileText className="w-4 h-4" />;
    }
  };

  const getRecordTypeBadge = (type: string) => {
    const variants: Record<string, "default" | "secondary" | "destructive" | "outline"> = {
      'move': 'default',
      'attendance': 'secondary',
      'incident': 'destructive',
      'note': 'outline',
      'acknowledgment': 'default'
    };
    return variants[type] || 'outline';
  };

  const getRoleBadgeVariant = (role: string): "default" | "secondary" | "outline" => {
    switch (role) {
      case 'supervisor': return 'default';
      case 'lead': return 'secondary';
      default: return 'outline';
    }
  };

  const handleEmployeeClick = (employee: Employee) => {
    setSelectedEmployee(employee);
    setShowDetailSheet(true);
  };

  return (
    <div className="min-h-screen bg-background p-4 md:p-6">
      <NavigationControl />
      
      <div className="max-w-7xl mx-auto space-y-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold tracking-tight flex items-center gap-2" data-testid="text-page-title">
              <FileText className="w-7 h-7" />
              Employee Files
            </h1>
            <p className="text-muted-foreground mt-1">Manage and search all personnel records</p>
          </div>
          
          <Button onClick={() => setShowAddEmployeeDialog(true)} data-testid="button-add-employee">
            <UserPlus className="w-4 h-4 mr-2" />
            Add Employee
          </Button>
        </div>

        <Card>
          <CardContent className="pt-6">
            <div className="flex flex-col md:flex-row gap-4">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  placeholder="Search by name, badge number, or phone..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                  data-testid="input-search"
                />
              </div>
              
              <Select value={roleFilter} onValueChange={setRoleFilter}>
                <SelectTrigger className="w-full md:w-40" data-testid="select-role-filter">
                  <SelectValue placeholder="Role" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Roles</SelectItem>
                  <SelectItem value="driver">Drivers</SelectItem>
                  <SelectItem value="supervisor">Supervisors</SelectItem>
                  <SelectItem value="lead">Leads</SelectItem>
                </SelectContent>
              </Select>
              
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-full md:w-44" data-testid="select-status-filter">
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="active">Active</SelectItem>
                  <SelectItem value="temporary">Temporary</SelectItem>
                  <SelectItem value="terminated">Terminated</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between gap-2 pb-4">
            <div>
              <CardTitle className="text-lg flex items-center gap-2">
                <Users className="w-5 h-5" />
                Personnel ({displayedEmployees.length})
              </CardTitle>
              <CardDescription>Click on an employee to view their records</CardDescription>
            </div>
          </CardHeader>
          <CardContent>
            {loadingEmployees || loadingSearch ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {[...Array(6)].map((_, i) => (
                  <Skeleton key={i} className="h-32 rounded-lg" />
                ))}
              </div>
            ) : displayedEmployees.length === 0 ? (
              <div className="text-center py-12 text-muted-foreground">
                <Users className="w-12 h-12 mx-auto mb-4 opacity-50" />
                <p>No employees found</p>
                {searchQuery && <p className="text-sm mt-1">Try a different search term</p>}
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {displayedEmployees.map((employee) => (
                  <Card 
                    key={employee.id}
                    className="cursor-pointer hover-elevate transition-all"
                    onClick={() => handleEmployeeClick(employee)}
                    data-testid={`card-employee-${employee.id}`}
                  >
                    <CardContent className="p-4">
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex-1 min-w-0">
                          <h3 className="font-semibold truncate" data-testid={`text-employee-name-${employee.id}`}>
                            {employee.name}
                          </h3>
                          <div className="flex items-center gap-1 text-sm text-muted-foreground mt-1">
                            <BadgeIcon className="w-3.5 h-3.5" />
                            <span data-testid={`text-badge-${employee.id}`}>{employee.badgeNumber}</span>
                          </div>
                        </div>
                        <ChevronRight className="w-5 h-5 text-muted-foreground flex-shrink-0" />
                      </div>
                      
                      <div className="flex flex-wrap items-center gap-2 mt-3">
                        <Badge variant={getRoleBadgeVariant(employee.role || 'driver')} size="sm">
                          {employee.role || 'driver'}
                        </Badge>
                        {employee.type === 'temporary' && (
                          <Badge variant="outline" size="sm">Temp</Badge>
                        )}
                        {employee.department && (
                          <Badge variant="secondary" size="sm">{employee.department}</Badge>
                        )}
                      </div>
                      
                      {employee.phoneLast4 && (
                        <div className="flex items-center gap-1 text-xs text-muted-foreground mt-2">
                          <Phone className="w-3 h-3" />
                          <span>...{employee.phoneLast4}</span>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      <Sheet open={showDetailSheet} onOpenChange={setShowDetailSheet}>
        <SheetContent className="w-full sm:max-w-lg">
          <SheetHeader>
            <SheetTitle className="flex items-center gap-2">
              <User className="w-5 h-5" />
              {selectedEmployee?.name}
            </SheetTitle>
            <SheetDescription>
              Badge: {selectedEmployee?.badgeNumber} | {selectedEmployee?.role || 'driver'} | {selectedEmployee?.department || 'Transport'}
            </SheetDescription>
          </SheetHeader>
          
          <div className="mt-6 space-y-4">
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-sm font-medium">Date Range:</span>
              {(['today', '3days', '7days', '30days'] as DateRange[]).map((range) => (
                <Button
                  key={range}
                  variant={selectedDateRange === range ? "default" : "outline"}
                  size="sm"
                  onClick={() => setSelectedDateRange(range)}
                  data-testid={`button-daterange-${range}`}
                >
                  {range === 'today' ? 'Today' : 
                   range === '3days' ? '3 Days' :
                   range === '7days' ? '7 Days' : '30 Days'}
                </Button>
              ))}
            </div>
            
            <div className="flex items-center justify-between gap-2">
              <h3 className="font-medium flex items-center gap-2">
                <History className="w-4 h-4" />
                Records ({employeeRecords.length})
              </h3>
              <Button size="sm" onClick={() => setShowAddRecordDialog(true)} data-testid="button-add-record">
                <Plus className="w-4 h-4 mr-1" />
                Add
              </Button>
            </div>
            
            <ScrollArea className="h-[400px]">
              {loadingRecords ? (
                <div className="space-y-3">
                  {[...Array(3)].map((_, i) => (
                    <Skeleton key={i} className="h-20" />
                  ))}
                </div>
              ) : employeeRecords.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  <FileText className="w-10 h-10 mx-auto mb-3 opacity-50" />
                  <p>No records found for this period</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {employeeRecords.map((record) => (
                    <Card key={record.id} data-testid={`card-record-${record.id}`}>
                      <CardContent className="p-3">
                        <div className="flex items-start gap-3">
                          <div className="mt-0.5">
                            {getRecordTypeIcon(record.recordType)}
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 flex-wrap">
                              <Badge variant={getRecordTypeBadge(record.recordType)} size="sm">
                                {record.recordType}
                              </Badge>
                              {record.shiftType && (
                                <Badge variant="outline" size="sm">{record.shiftType}</Badge>
                              )}
                            </div>
                            {record.description && (
                              <p className="text-sm text-muted-foreground mt-1 line-clamp-2">
                                {record.description}
                              </p>
                            )}
                            <div className="flex items-center gap-2 text-xs text-muted-foreground mt-2">
                              <Calendar className="w-3 h-3" />
                              {record.eventDate}
                              {record.createdBy && (
                                <>
                                  <span className="opacity-50">|</span>
                                  <span>by {record.createdBy}</span>
                                </>
                              )}
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </ScrollArea>
          </div>
        </SheetContent>
      </Sheet>

      <Dialog open={showAddEmployeeDialog} onOpenChange={setShowAddEmployeeDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add New Employee</DialogTitle>
            <DialogDescription>Enter the employee details to add them to the system.</DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="name">Full Name *</Label>
              <Input
                id="name"
                value={newEmployee.name}
                onChange={(e) => setNewEmployee({ ...newEmployee, name: e.target.value })}
                placeholder="John Smith"
                data-testid="input-new-employee-name"
              />
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="badgeNumber">Badge Number *</Label>
                <Input
                  id="badgeNumber"
                  value={newEmployee.badgeNumber}
                  onChange={(e) => setNewEmployee({ ...newEmployee, badgeNumber: e.target.value })}
                  placeholder="EMP001"
                  data-testid="input-new-employee-badge"
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="phoneLast4">Phone (Last 4)</Label>
                <Input
                  id="phoneLast4"
                  value={newEmployee.phoneLast4}
                  onChange={(e) => setNewEmployee({ ...newEmployee, phoneLast4: e.target.value.slice(0, 4) })}
                  placeholder="1234"
                  maxLength={4}
                  data-testid="input-new-employee-phone"
                />
              </div>
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="role">Role</Label>
                <Select value={newEmployee.role} onValueChange={(v) => setNewEmployee({ ...newEmployee, role: v })}>
                  <SelectTrigger data-testid="select-new-employee-role">
                    <SelectValue placeholder="Select role" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="driver">Driver</SelectItem>
                    <SelectItem value="supervisor">Supervisor</SelectItem>
                    <SelectItem value="lead">Lead</SelectItem>
                    <SelectItem value="trainee">Trainee</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="type">Employment Type</Label>
                <Select value={newEmployee.type} onValueChange={(v) => setNewEmployee({ ...newEmployee, type: v })}>
                  <SelectTrigger data-testid="select-new-employee-type">
                    <SelectValue placeholder="Select type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="permanent">Permanent</SelectItem>
                    <SelectItem value="temporary">Temporary</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="department">Department</Label>
              <Select value={newEmployee.department} onValueChange={(v) => setNewEmployee({ ...newEmployee, department: v })}>
                <SelectTrigger data-testid="select-new-employee-dept">
                  <SelectValue placeholder="Select department" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Transport">Transport</SelectItem>
                  <SelectItem value="Imaging">Imaging</SelectItem>
                  <SelectItem value="Merch">Merch</SelectItem>
                  <SelectItem value="Condition Report">Condition Report</SelectItem>
                  <SelectItem value="EV Ops">EV Ops</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowAddEmployeeDialog(false)}>Cancel</Button>
            <Button 
              onClick={() => addEmployeeMutation.mutate(newEmployee)}
              disabled={!newEmployee.name || !newEmployee.badgeNumber || addEmployeeMutation.isPending}
              data-testid="button-submit-employee"
            >
              {addEmployeeMutation.isPending ? "Adding..." : "Add Employee"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={showAddRecordDialog} onOpenChange={setShowAddRecordDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add Record</DialogTitle>
            <DialogDescription>Add a new record to {selectedEmployee?.name}'s file.</DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4 py-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="recordType">Record Type *</Label>
                <Select value={newRecord.recordType} onValueChange={(v) => setNewRecord({ ...newRecord, recordType: v })}>
                  <SelectTrigger data-testid="select-record-type">
                    <SelectValue placeholder="Select type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="note">Note</SelectItem>
                    <SelectItem value="attendance">Attendance</SelectItem>
                    <SelectItem value="incident">Incident</SelectItem>
                    <SelectItem value="acknowledgment">Acknowledgment</SelectItem>
                    <SelectItem value="move">Move</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="eventDate">Date *</Label>
                <Input
                  id="eventDate"
                  type="date"
                  value={newRecord.eventDate}
                  onChange={(e) => setNewRecord({ ...newRecord, eventDate: e.target.value })}
                  data-testid="input-record-date"
                />
              </div>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="shiftType">Shift Type</Label>
              <Select value={newRecord.shiftType} onValueChange={(v) => setNewRecord({ ...newRecord, shiftType: v })}>
                <SelectTrigger data-testid="select-record-shift">
                  <SelectValue placeholder="Select shift (optional)" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">None</SelectItem>
                  <SelectItem value="first_shift">First Shift</SelectItem>
                  <SelectItem value="second_shift">Second Shift</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                value={newRecord.description}
                onChange={(e) => setNewRecord({ ...newRecord, description: e.target.value })}
                placeholder="Enter details about this record..."
                rows={3}
                data-testid="input-record-description"
              />
            </div>
          </div>
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowAddRecordDialog(false)}>Cancel</Button>
            <Button 
              onClick={() => addRecordMutation.mutate(newRecord)}
              disabled={!newRecord.recordType || !newRecord.eventDate || addRecordMutation.isPending}
              data-testid="button-submit-record"
            >
              {addRecordMutation.isPending ? "Adding..." : "Add Record"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
