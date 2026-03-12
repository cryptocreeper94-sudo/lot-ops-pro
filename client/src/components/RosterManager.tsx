import { useState, useEffect } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from "@/components/ui/dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { UserPlus, Users, PlayCircle, Search } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { Employee, Driver } from "@shared/schema";
import { DemoStorage } from "@/lib/demoStorage";

export function RosterManager() {
  const { toast } = useToast();
  const isDemoMode = DemoStorage.isDemoMode();
  
  const [showAddEmployee, setShowAddEmployee] = useState(false);
  const [showAddDriver, setShowAddDriver] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  
  // Forms
  const [newEmployeeName, setNewEmployeeName] = useState("");
  const [newEmployeeBadge, setNewEmployeeBadge] = useState("");
  const [newEmployeeType, setNewEmployeeType] = useState("permanent");
  const [tempDurationWeeks, setTempDurationWeeks] = useState(1); // Default: 1 week
  const [newDriverName, setNewDriverName] = useState("");
  const [newDriverPhone, setNewDriverPhone] = useState("");
  const [newDriverRole, setNewDriverRole] = useState("van_driver");
  const [newDriverType, setNewDriverType] = useState("permanent");
  const [newDriverAvatar, setNewDriverAvatar] = useState("");
  const [driverSearchResult, setDriverSearchResult] = useState<"searching" | "found" | "not_found" | null>(null);
  
  // Demo Mode State
  const [demoEmployees, setDemoEmployees] = useState<any[]>([]);
  const [demoDrivers, setDemoDrivers] = useState<any[]>([]);
  
  // Reload demo data when needed
  const refreshDemoData = () => {
    if (isDemoMode) {
      setDemoEmployees(DemoStorage.getEmployees());
      setDemoDrivers(DemoStorage.getDrivers());
    }
  };
  
  useEffect(() => {
    if (isDemoMode) {
      refreshDemoData();
    }
  }, [isDemoMode]);

  // Data Fetching (only if NOT in demo mode)
  const { data: employees = [] } = useQuery<Employee[]>({
    queryKey: ["/api/employees"],
    enabled: !isDemoMode,
  });

  const { data: drivers = [] } = useQuery<Driver[]>({
    queryKey: ["/api/drivers"],
    enabled: !isDemoMode,
  });

  // Mutations
  const addEmployeeMutation = useMutation({
    mutationFn: async (data: { name: string, badgeNumber: string, type: string, tempDurationWeeks?: number }) => {
      // Calculate temp dates if temporary employee
      let employeeData: any = { ...data };
      if (data.type === "temporary" && data.tempDurationWeeks) {
        const startDate = new Date();
        const endDate = new Date();
        endDate.setDate(endDate.getDate() + (data.tempDurationWeeks * 7));
        
        employeeData = {
          ...data,
          tempStartDate: startDate.toISOString().split('T')[0],
          tempEndDate: endDate.toISOString().split('T')[0],
        };
      }
      
      const res = await apiRequest("POST", "/api/employees", employeeData);
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/employees"] });
      setShowAddEmployee(false);
      setNewEmployeeName("");
      setNewEmployeeBadge("");
      setNewEmployeeType("permanent");
      setTempDurationWeeks(1);
      toast({ title: "Employee Added", description: "Added to employee roster." });
    },
    onError: () => {
      toast({ title: "Error", description: "Failed to add employee. Badge number might be duplicate.", variant: "destructive" });
    }
  });

  const addDriverMutation = useMutation({
    mutationFn: async (data: { phoneLast4: string, name: string, profilePhoto?: string | null }) => {
      const res = await apiRequest("POST", "/api/drivers", {
        phoneLast4: data.phoneLast4,
        name: data.name,
        status: "idle",
        isOnRoster: true,
        profilePhoto: data.profilePhoto || null
      });
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/drivers"] });
      resetDriverForm();
      toast({ 
        title: "✓ Driver Added", 
        description: `${newDriverName} added to roster` 
      });
    },
    onError: () => {
      toast({ title: "Error", description: "Failed to add driver", variant: "destructive" });
    }
  });

  const removeDriverMutation = useMutation({
    mutationFn: async (id: number) => {
      const res = await apiRequest("DELETE", `/api/drivers/${id}`);
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/drivers"] });
      toast({ title: "✓ Driver Removed", description: "Driver removed from roster" });
    },
    onError: () => {
      toast({ title: "Error", description: "Failed to remove driver", variant: "destructive" });
    }
  });


  // Handlers - Demo Mode or Live Mode
  const handleSearchDriver = () => {
    if (!newDriverName.trim()) {
      setDriverSearchResult(null);
      return;
    }
    
    setDriverSearchResult("searching");
    
    // Simulate search delay for better UX
    setTimeout(() => {
      if (isDemoMode) {
        const found = DemoStorage.findDriverByName(newDriverName);
        setDriverSearchResult(found ? "found" : "not_found");
      } else {
        // Live Mode - Check against actual drivers
        const found = drivers.find(d => d.name.toLowerCase().includes(newDriverName.toLowerCase()));
        setDriverSearchResult(found ? "found" : "not_found");
      }
    }, 300);
  };

  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    
    // Convert to base64 for storage
    const reader = new FileReader();
    reader.onloadend = () => {
      setNewDriverAvatar(reader.result as string);
    };
    reader.readAsDataURL(file);
  };

  const handleAddDriver = () => {
    if (!newDriverName || !newDriverPhone) {
      toast({ title: "Missing Info", description: "Enter driver name and last 4 of phone", variant: "destructive" });
      return;
    }
    
    if (newDriverPhone.length !== 4 || !/^\d+$/.test(newDriverPhone)) {
      toast({ title: "Invalid Phone", description: "Must be exactly 4 digits", variant: "destructive" });
      return;
    }
    
    if (isDemoMode) {
      // Demo Mode - Add to localStorage
      DemoStorage.addDriver({
        phoneLast4: newDriverPhone,
        name: newDriverName,
        status: "idle",
        isOnRoster: true,
        role: newDriverRole,
        type: newDriverType,
        avatarUrl: newDriverAvatar || undefined
      });
      refreshDemoData();
      resetDriverForm();
      toast({ 
        title: "✓ Driver Registered (Demo)", 
        description: `${newDriverName} added as ${newDriverType === 'temporary' ? 'Temporary' : 'Permanent'} ${getRoleLabel(newDriverRole)}` 
      });
    } else {
      // Live Mode - Call mutation
      addDriverMutation.mutate({ 
        phoneLast4: newDriverPhone, 
        name: newDriverName,
        profilePhoto: newDriverAvatar || null
      });
    }
  };

  const resetDriverForm = () => {
    setShowAddDriver(false);
    setNewDriverName("");
    setNewDriverPhone("");
    setNewDriverRole("van_driver");
    setNewDriverType("permanent");
    setNewDriverAvatar("");
    setDriverSearchResult(null);
  };

  const getRoleLabel = (role: string) => {
    const labels: Record<string, string> = {
      van_driver: "Van Driver",
      inventory_driver: "Inventory Driver",
      service_truck: "Service Truck Driver",
      supervisor: "Supervisor"
    };
    return labels[role] || role;
  };

  const handleRemoveDriver = (id: number, name: string) => {
    if (!confirm(`Remove ${name} from roster?`)) return;
    
    if (isDemoMode) {
      DemoStorage.deleteDriver(id);
      refreshDemoData();
      toast({ title: "✓ Removed (Demo)", description: `${name} removed from demo roster` });
    } else {
      // Live Mode - Call mutation
      removeDriverMutation.mutate(id);
    }
  };

  const handleAddEmployee = () => {
    if (!newEmployeeName || !newEmployeeBadge) return;
    
    if (isDemoMode) {
      // Demo Mode - Add to localStorage
      const startDate = new Date();
      const endDate = new Date();
      if (newEmployeeType === "temporary") {
        endDate.setDate(endDate.getDate() + (tempDurationWeeks * 7));
      }
      
      DemoStorage.addEmployee({
        name: newEmployeeName,
        badgeNumber: newEmployeeBadge,
        department: "Transport",
        role: "driver",
        type: newEmployeeType,
        isActive: true,
        tempStartDate: newEmployeeType === "temporary" ? startDate.toISOString().split('T')[0] : undefined,
        tempEndDate: newEmployeeType === "temporary" ? endDate.toISOString().split('T')[0] : undefined,
        tempDurationWeeks: newEmployeeType === "temporary" ? tempDurationWeeks : undefined,
      });
      refreshDemoData();
      setShowAddEmployee(false);
      setNewEmployeeName("");
      setNewEmployeeBadge("");
      setTempDurationWeeks(1);
      toast({ title: "✓ Employee Added (Demo)", description: "Added to demo employee roster" });
    } else {
      // Live Mode - API call
      addEmployeeMutation.mutate({ 
        name: newEmployeeName, 
        badgeNumber: newEmployeeBadge,
        type: newEmployeeType,
        tempDurationWeeks: newEmployeeType === "temporary" ? tempDurationWeeks : undefined
      });
    }
  };

  // Derived State - Use demo or live data
  const actualDrivers = isDemoMode ? demoDrivers : drivers;
  const actualEmployees = isDemoMode ? demoEmployees : employees;
  
  const filteredDrivers = actualDrivers.filter((d: any) => 
    d.name?.toLowerCase().includes(searchQuery.toLowerCase()) || 
    d.phoneLast4?.includes(searchQuery)
  );
  
  const filteredEmployees = actualEmployees.filter((e: any) => 
    e.name?.toLowerCase().includes(searchQuery.toLowerCase()) || 
    e.badgeNumber?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="space-y-6 animate-in fade-in">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold text-slate-900">Daily Roster {isDemoMode && <Badge variant="outline" className="ml-2 bg-purple-100 text-purple-700">Demo Mode</Badge>}</h2>
          <p className="text-slate-500">Add drivers by name or last 4 of phone number</p>
        </div>
        <div className="flex gap-2">
          <Button onClick={() => setShowAddDriver(true)} className="bg-green-600 hover:bg-green-700">
            <UserPlus className="mr-2 h-4 w-4" /> Add Driver
          </Button>
          {!isDemoMode && (
            <Button onClick={() => setShowAddEmployee(true)} className="bg-blue-600 hover:bg-blue-700">
              <UserPlus className="mr-2 h-4 w-4" /> Add Employee
            </Button>
          )}
        </div>
      </div>

      <div className="flex items-center space-x-2 bg-white p-2 rounded-lg border border-slate-200 shadow-sm max-w-md">
        <Search className="h-4 w-4 text-slate-400" />
        <Input 
          placeholder="Search by name or badge..." 
          className="border-0 focus-visible:ring-0"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
      </div>

      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Driver Name</TableHead>
                <TableHead>Role</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Driver ID</TableHead>
                <TableHead className="text-right">Action</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredDrivers.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5} className="text-center py-8 text-slate-500">
                    No drivers on roster. Click "Add Driver" to add {isDemoMode && "Kathy Grader or any driver to practice!"}
                  </TableCell>
                </TableRow>
              ) : (
                filteredDrivers.map((driver: any) => {
                  return (
                    <TableRow key={driver.id}>
                      <TableCell className="font-medium">
                        <div className="flex items-center gap-3">
                          {driver.avatarUrl ? (
                            <img 
                              src={driver.avatarUrl} 
                              alt={driver.name}
                              className="h-10 w-10 rounded-full object-cover border-2 border-green-200"
                            />
                          ) : (
                            <div className="h-10 w-10 rounded-full bg-green-100 flex items-center justify-center text-xs font-bold text-green-700">
                              {driver.name.substring(0, 2).toUpperCase()}
                            </div>
                          )}
                          {driver.name}
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline" className="bg-slate-50 text-slate-700">
                          {getRoleLabel(driver.role || 'van_driver')}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        {driver.type === 'temporary' ? (
                          <Badge variant="outline" className="bg-amber-50 text-amber-700 border-amber-300">
                            Temporary
                          </Badge>
                        ) : (
                          <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-300">
                            Permanent
                          </Badge>
                        )}
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline" className="font-mono text-base">
                          {driver.phoneLast4}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        <Button 
                          size="sm" 
                          variant="outline" 
                          className="text-red-600 border-red-300 hover:bg-red-50"
                          onClick={() => handleRemoveDriver(driver.id, driver.name)}
                        >
                          Remove
                        </Button>
                      </TableCell>
                    </TableRow>
                  );
                })
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* ADD EMPLOYEE DIALOG */}
      <Dialog open={showAddEmployee} onOpenChange={setShowAddEmployee}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add New Employee</DialogTitle>
            <DialogDescription>Add a staff member to the roster. Scan temp badge or enter manually.</DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label>Full Name</Label>
              <Input placeholder="e.g. Sarah Johnson" value={newEmployeeName} onChange={e => setNewEmployeeName(e.target.value)} />
            </div>
            <div className="space-y-2">
              <Label>Badge Number</Label>
              <Input 
                placeholder="Scan badge or type number (e.g. 7348)" 
                value={newEmployeeBadge} 
                onChange={e => setNewEmployeeBadge(e.target.value)}
                autoFocus
                data-testid="input-badge-scan"
              />
              <p className="text-xs text-slate-500">Scan barcode badge or manually enter badge number</p>
            </div>
            <div className="space-y-2">
              <Label>Employment Type</Label>
              <Select value={newEmployeeType} onValueChange={setNewEmployeeType}>
                <SelectTrigger>
                  <SelectValue placeholder="Select type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="permanent">Permanent Employee</SelectItem>
                  <SelectItem value="temporary">Temporary / Agency</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            {/* Temp Duration - Only show for temporary employees */}
            {newEmployeeType === "temporary" && (
              <div className="space-y-2 bg-amber-50 p-3 rounded-lg border border-amber-200">
                <Label>Assignment Duration</Label>
                <Select value={String(tempDurationWeeks)} onValueChange={(val) => setTempDurationWeeks(parseInt(val))}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select duration" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="1">1 Week</SelectItem>
                    <SelectItem value="2">2 Weeks</SelectItem>
                    <SelectItem value="3">3 Weeks</SelectItem>
                    <SelectItem value="4">1 Month (4 Weeks)</SelectItem>
                    <SelectItem value="8">2 Months (8 Weeks)</SelectItem>
                  </SelectContent>
                </Select>
                <p className="text-xs text-amber-700">
                  Temp will expire in {tempDurationWeeks} week{tempDurationWeeks !== 1 ? 's' : ''}. You can extend later.
                </p>
              </div>
            )}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowAddEmployee(false)}>Cancel</Button>
            <Button onClick={handleAddEmployee} disabled={!isDemoMode && addEmployeeMutation.isPending}>
              {(!isDemoMode && addEmployeeMutation.isPending) ? "Adding..." : "Add Employee"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* ADD DRIVER DIALOG - Smart Search Flow */}
      <Dialog open={showAddDriver} onOpenChange={(open) => { if (!open) resetDriverForm(); setShowAddDriver(open); }}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Add Driver to Roster {isDemoMode && <Badge variant="outline" className="ml-2 bg-purple-100 text-purple-700">Demo</Badge>}</DialogTitle>
            <DialogDescription>
              Search by name first. If not registered, complete their registration below.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            {/* Step 1: Name Search */}
            <div className="space-y-2">
              <Label>Driver Name</Label>
              <div className="flex gap-2">
                <Input 
                  placeholder="e.g. Kathy Grader" 
                  value={newDriverName} 
                  onChange={(e) => {
                    setNewDriverName(e.target.value);
                    setDriverSearchResult(null);
                  }}
                  onKeyDown={(e) => e.key === 'Enter' && handleSearchDriver()}
                  data-testid="input-driver-name"
                  className="flex-1"
                />
                <Button onClick={handleSearchDriver} variant="outline" disabled={!newDriverName.trim()}>
                  Search
                </Button>
              </div>
              
              {/* Search Result Status */}
              {driverSearchResult === "searching" && (
                <p className="text-sm text-blue-600">Searching...</p>
              )}
              {driverSearchResult === "found" && (
                <div className="p-3 bg-green-50 border border-green-200 rounded-lg">
                  <p className="text-sm text-green-700 font-medium">✓ Driver already registered</p>
                  <p className="text-xs text-green-600 mt-1">This driver is already in the system</p>
                </div>
              )}
              {driverSearchResult === "not_found" && (
                <div className="p-3 bg-amber-50 border border-amber-200 rounded-lg">
                  <p className="text-sm text-amber-700 font-medium">⚠ Not Registered</p>
                  <p className="text-xs text-amber-600 mt-1">Complete registration below to add this driver</p>
                </div>
              )}
            </div>

            {/* Step 2: Registration Fields (only shown if not found) */}
            {driverSearchResult === "not_found" && (
              <>
                <div className="h-px bg-slate-200" />
                
                <div className="space-y-2">
                  <Label>Driver Photo (Optional)</Label>
                  <div className="flex items-center gap-4">
                    {newDriverAvatar ? (
                      <div className="relative">
                        <img 
                          src={newDriverAvatar} 
                          alt="Driver preview" 
                          className="h-20 w-20 rounded-full object-cover border-2 border-slate-200"
                        />
                        <button
                          onClick={() => setNewDriverAvatar("")}
                          className="absolute -top-1 -right-1 h-6 w-6 rounded-full bg-red-500 text-white text-xs flex items-center justify-center hover:bg-red-600"
                        >
                          ✕
                        </button>
                      </div>
                    ) : (
                      <div className="h-20 w-20 rounded-full bg-slate-100 flex items-center justify-center text-slate-400">
                        <Users className="h-8 w-8" />
                      </div>
                    )}
                    <div className="flex-1">
                      <Input 
                        type="file" 
                        accept="image/*"
                        capture="environment"
                        onChange={handlePhotoUpload}
                        className="cursor-pointer"
                        data-testid="input-driver-photo"
                      />
                      <p className="text-xs text-slate-500 mt-1">
                        Take photo or upload - helps Teresa identify drivers
                      </p>
                    </div>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label>Last 4 of Phone Number</Label>
                  <Input 
                    placeholder="e.g. 1234" 
                    value={newDriverPhone} 
                    onChange={e => setNewDriverPhone(e.target.value.replace(/\D/g, '').slice(0, 4))}
                    maxLength={4}
                    className="font-mono text-lg"
                    data-testid="input-driver-phone"
                  />
                  <p className="text-xs text-slate-500">This becomes their permanent driver ID</p>
                </div>

                <div className="space-y-2">
                  <Label>Job Role</Label>
                  <Select value={newDriverRole} onValueChange={setNewDriverRole}>
                    <SelectTrigger data-testid="select-driver-role">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="van_driver">Van Driver</SelectItem>
                      <SelectItem value="inventory_driver">Inventory Driver</SelectItem>
                      <SelectItem value="service_truck">Service Truck Driver</SelectItem>
                      <SelectItem value="supervisor">Supervisor</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label>Employee Type</Label>
                  <Select value={newDriverType} onValueChange={setNewDriverType}>
                    <SelectTrigger data-testid="select-driver-type">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="permanent">Permanent Employee</SelectItem>
                      <SelectItem value="temporary">Temporary / Agency Worker</SelectItem>
                    </SelectContent>
                  </Select>
                  <p className="text-xs text-slate-500">
                    {newDriverType === 'temporary' 
                      ? "Temp workers use same system - last 4 of phone as driver ID" 
                      : "Regular full-time employee"
                    }
                  </p>
                </div>
              </>
            )}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={resetDriverForm}>Cancel</Button>
            {driverSearchResult === "not_found" && (
              <Button onClick={handleAddDriver} className="bg-green-600 hover:bg-green-700">
                Register Driver
              </Button>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>

    </div>
  );
}
