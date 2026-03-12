import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { Users, UserPlus, Trash2, Calendar, Truck, Package } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { NavigationControl } from "@/components/NavigationControl";

interface CrewAssignment {
  id?: number;
  date: string;
  phoneLastFour: string;
  name: string;
  assignedRole: string;
  assignedBy: string;
  notes?: string;
}

export default function CrewSetup() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const today = new Date().toISOString().split('T')[0];

  const [newPerson, setNewPerson] = useState({
    phoneLastFour: "",
    name: "",
    assignedRole: "van_driver",
    notes: ""
  });

  // Fetch today's crew
  const { data: crew = [], isLoading } = useQuery<CrewAssignment[]>({
    queryKey: ["crew", "today"],
    queryFn: async () => {
      const res = await fetch("/api/crew/today");
      return res.json();
    }
  });

  // Add/Update crew member
  const saveMutation = useMutation({
    mutationFn: async (assignment: Omit<CrewAssignment, 'id'>) => {
      const res = await fetch("/api/crew", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(assignment)
      });
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["crew"] });
      toast({ title: "Saved!", description: "Crew member added successfully." });
      setNewPerson({ phoneLastFour: "", name: "", assignedRole: "van_driver", notes: "" });
    },
    onError: () => {
      toast({ title: "Error", description: "Failed to save crew member.", variant: "destructive" });
    }
  });

  // Delete crew member
  const deleteMutation = useMutation({
    mutationFn: async (id: number) => {
      const res = await fetch(`/api/crew/${id}`, { method: "DELETE" });
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["crew"] });
      toast({ title: "Removed", description: "Crew member removed from today's list." });
    }
  });

  const handleAdd = () => {
    if (!newPerson.phoneLastFour || !newPerson.name) {
      toast({ title: "Missing Info", description: "Please enter phone last 4 and name.", variant: "destructive" });
      return;
    }

    saveMutation.mutate({
      date: today,
      phoneLastFour: newPerson.phoneLastFour,
      name: newPerson.name,
      assignedRole: newPerson.assignedRole,
      assignedBy: "Teresa",
      notes: newPerson.notes
    });
  };

  const handleDelete = (id: number) => {
    deleteMutation.mutate(id);
  };

  const handleRoleChange = (assignment: CrewAssignment, newRole: string) => {
    saveMutation.mutate({
      ...assignment,
      assignedRole: newRole
    });
  };

  const vanDrivers = crew.filter(c => c.assignedRole === "van_driver");
  const inventoryDrivers = crew.filter(c => c.assignedRole === "inventory_driver");
  const offDuty = crew.filter(c => c.assignedRole === "off_duty");

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 p-4">
      <div className="max-w-6xl mx-auto">
        <NavigationControl variant="back" fallbackRoute="/developer" />
        {/* Header */}
        <Card className="bg-slate-900/80 border-slate-700 mb-6">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-3xl text-white flex items-center gap-3">
                  <Users className="h-8 w-8 text-blue-400" />
                  Today's Crew Setup
                </CardTitle>
                <CardDescription className="text-slate-400 mt-2">
                  Assign daily roles - controls who can log in and what they can access
                </CardDescription>
              </div>
              <div className="flex items-center gap-2">
                <Calendar className="h-5 w-5 text-blue-400" />
                <span className="text-white font-bold">{new Date().toLocaleDateString()}</span>
              </div>
            </div>
          </CardHeader>
        </Card>

        {/* Add New Person */}
        <Card className="bg-slate-900/80 border-slate-700 mb-6">
          <CardHeader>
            <CardTitle className="text-white flex items-center gap-2">
              <UserPlus className="h-5 w-5 text-green-400" />
              Add Person to Today's Crew
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div>
                <Label className="text-slate-300">Phone Last 4</Label>
                <Input
                  placeholder="7777"
                  value={newPerson.phoneLastFour}
                  onChange={(e) => setNewPerson({...newPerson, phoneLastFour: e.target.value})}
                  maxLength={4}
                  className="bg-slate-800 border-slate-600 text-white"
                  data-testid="input-phone-last-four"
                />
              </div>
              <div>
                <Label className="text-slate-300">Name</Label>
                <Input
                  placeholder="John Smith"
                  value={newPerson.name}
                  onChange={(e) => setNewPerson({...newPerson, name: e.target.value})}
                  className="bg-slate-800 border-slate-600 text-white"
                  data-testid="input-name"
                />
              </div>
              <div>
                <Label className="text-slate-300">Role</Label>
                <Select value={newPerson.assignedRole} onValueChange={(val) => setNewPerson({...newPerson, assignedRole: val})}>
                  <SelectTrigger className="bg-slate-800 border-slate-600 text-white">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="van_driver">Van Driver</SelectItem>
                    <SelectItem value="inventory_driver">Inventory Driver</SelectItem>
                    <SelectItem value="off_duty">Off Duty</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="flex items-end">
                <Button
                  onClick={handleAdd}
                  className="w-full bg-green-600 hover:bg-green-700"
                  data-testid="button-add-crew"
                >
                  <UserPlus className="h-4 w-4 mr-2" />
                  Add
                </Button>
              </div>
            </div>
            <div>
              <Label className="text-slate-300">Notes (Optional)</Label>
              <Input
                placeholder="Fill-in for Mike, etc."
                value={newPerson.notes}
                onChange={(e) => setNewPerson({...newPerson, notes: e.target.value})}
                className="bg-slate-800 border-slate-600 text-white"
                data-testid="input-notes"
              />
            </div>
          </CardContent>
        </Card>

        {/* Crew Lists */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Van Drivers */}
          <Card className="bg-slate-900/80 border-blue-500">
            <CardHeader className="bg-blue-900/20">
              <CardTitle className="text-white text-lg flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Truck className="h-5 w-5 text-blue-400" />
                  Van Drivers
                </div>
                <Badge className="bg-blue-600">{vanDrivers.length}</Badge>
              </CardTitle>
            </CardHeader>
            <CardContent className="p-3 space-y-2 max-h-96 overflow-y-auto">
              {vanDrivers.length === 0 ? (
                <div className="text-center text-slate-400 text-sm py-8">No van drivers assigned</div>
              ) : (
                vanDrivers.map((member) => (
                  <CrewCard
                    key={member.id}
                    member={member}
                    onDelete={handleDelete}
                    onRoleChange={handleRoleChange}
                  />
                ))
              )}
            </CardContent>
          </Card>

          {/* Inventory Drivers */}
          <Card className="bg-slate-900/80 border-green-500">
            <CardHeader className="bg-green-900/20">
              <CardTitle className="text-white text-lg flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Package className="h-5 w-5 text-green-400" />
                  Inventory Drivers
                </div>
                <Badge className="bg-green-600">{inventoryDrivers.length}</Badge>
              </CardTitle>
            </CardHeader>
            <CardContent className="p-3 space-y-2 max-h-96 overflow-y-auto">
              {inventoryDrivers.length === 0 ? (
                <div className="text-center text-slate-400 text-sm py-8">No inventory drivers assigned</div>
              ) : (
                inventoryDrivers.map((member) => (
                  <CrewCard
                    key={member.id}
                    member={member}
                    onDelete={handleDelete}
                    onRoleChange={handleRoleChange}
                  />
                ))
              )}
            </CardContent>
          </Card>

          {/* Off Duty */}
          <Card className="bg-slate-900/80 border-slate-600">
            <CardHeader className="bg-slate-800/50">
              <CardTitle className="text-white text-lg flex items-center justify-between">
                <div className="flex items-center gap-2">
                  Off Duty
                </div>
                <Badge variant="outline" className="border-slate-500">{offDuty.length}</Badge>
              </CardTitle>
            </CardHeader>
            <CardContent className="p-3 space-y-2 max-h-96 overflow-y-auto">
              {offDuty.length === 0 ? (
                <div className="text-center text-slate-400 text-sm py-8">No one off duty</div>
              ) : (
                offDuty.map((member) => (
                  <CrewCard
                    key={member.id}
                    member={member}
                    onDelete={handleDelete}
                    onRoleChange={handleRoleChange}
                  />
                ))
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}

function CrewCard({ member, onDelete, onRoleChange }: {
  member: CrewAssignment;
  onDelete: (id: number) => void;
  onRoleChange: (member: CrewAssignment, newRole: string) => void;
}) {
  return (
    <div className="bg-slate-800 rounded-lg p-3 border border-slate-700 hover:border-slate-600 transition-colors">
      <div className="flex items-center justify-between mb-2">
        <div>
          <div className="text-white font-bold">{member.name}</div>
          <div className="text-slate-400 text-xs">Last 4: {member.phoneLastFour}</div>
        </div>
        <Button
          variant="ghost"
          size="icon"
          className="h-7 w-7 text-red-400 hover:text-red-300 hover:bg-red-900/20"
          onClick={() => member.id && onDelete(member.id)}
          data-testid={`button-delete-${member.phoneLastFour}`}
        >
          <Trash2 className="h-4 w-4" />
        </Button>
      </div>
      {member.notes && (
        <div className="text-xs text-slate-400 italic mb-2 border-l-2 border-blue-500 pl-2">
          {member.notes}
        </div>
      )}
      <Select value={member.assignedRole} onValueChange={(val) => onRoleChange(member, val)}>
        <SelectTrigger className="h-7 text-xs bg-slate-700 border-slate-600 text-white">
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="van_driver">Van Driver</SelectItem>
          <SelectItem value="inventory_driver">Inventory Driver</SelectItem>
          <SelectItem value="off_duty">Off Duty</SelectItem>
        </SelectContent>
      </Select>
    </div>
  );
}
