import { useState, useEffect } from "react";
import { useLocation } from "wouter";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { UserPlus, Users, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { NavigationControl } from "@/components/NavigationControl";

export default function SalesForceAssignment() {
  const [_, setLocation] = useLocation();
  const [user, setUser] = useState<any>(null);
  const [salesPeople, setSalesPeople] = useState<any[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    territory: "",
    commission: "",
  });

  useEffect(() => {
    const userStr = localStorage.getItem("vanops_user");
    if (!userStr) {
      setLocation("/");
      return;
    }

    const userData = JSON.parse(userStr);
    // Only developers and operations managers can assign sales people
    if (!["developer", "operations_manager"].includes(userData.role)) {
      toast.error("Access denied. Only developers and operations managers can manage sales team.");
      setLocation("/dashboard");
      return;
    }

    setUser(userData);
    fetchSalesPeople();
  }, []);

  const fetchSalesPeople = async () => {
    try {
      const res = await fetch("/api/crm/sales-people");
      if (res.ok) setSalesPeople(await res.json());
    } catch (error) {
      console.error("Failed to fetch sales people:", error);
    }
  };

  const handleAddSalesPerson = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch("/api/crm/sales-people", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...formData,
          userId: user.id,
          assignedBy: user.id,
        }),
      });

      if (res.ok) {
        toast.success("Sales person added successfully");
        setFormData({ name: "", email: "", phone: "", territory: "", commission: "" });
        setShowForm(false);
        fetchSalesPeople();
      }
    } catch (error) {
      toast.error("Failed to add sales person");
    }
  };

  const handleDeleteSalesPerson = async (id: number) => {
    if (!confirm("Are you sure?")) return;

    try {
      const res = await fetch(`/api/crm/sales-people/${id}`, { method: "DELETE" });
      if (res.ok) {
        toast.success("Sales person removed");
        fetchSalesPeople();
      }
    } catch (error) {
      toast.error("Failed to remove sales person");
    }
  };

  if (!user) return <div className="p-4">Loading...</div>;

  return (
    <div className="min-h-screen bg-slate-900 p-4 md:p-8">
      <div className="max-w-4xl mx-auto space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold text-white">Manage Sales Force</h1>
          <Button onClick={() => setLocation("/sales")} variant="outline" data-testid="button-back-to-sales">
            ← Back to Sales
          </Button>
        </div>

        {/* Add Sales Person Form */}
        {!showForm ? (
          <Button
            onClick={() => setShowForm(true)}
            className="bg-green-600 hover:bg-green-700 w-full md:w-auto"
            data-testid="button-add-sales-person"
          >
            <UserPlus className="h-4 w-4 mr-2" />
            Add Sales Person
          </Button>
        ) : (
          <Card className="bg-white/5 border-slate-700">
            <CardHeader>
              <CardTitle className="text-white">New Sales Team Member</CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleAddSalesPerson} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label className="text-white">Name *</Label>
                    <Input
                      required
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      placeholder="Full name"
                      data-testid="input-name"
                    />
                  </div>
                  <div>
                    <Label className="text-white">Email *</Label>
                    <Input
                      required
                      type="email"
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      placeholder="Email"
                      data-testid="input-email"
                    />
                  </div>
                  <div>
                    <Label className="text-white">Phone</Label>
                    <Input
                      value={formData.phone}
                      onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                      placeholder="Phone number"
                      data-testid="input-phone"
                    />
                  </div>
                  <div>
                    <Label className="text-white">Territory</Label>
                    <Input
                      value={formData.territory}
                      onChange={(e) => setFormData({ ...formData, territory: e.target.value })}
                      placeholder="Geographic or account-based"
                      data-testid="input-territory"
                    />
                  </div>
                  <div>
                    <Label className="text-white">Commission %</Label>
                    <Input
                      type="number"
                      value={formData.commission}
                      onChange={(e) => setFormData({ ...formData, commission: e.target.value })}
                      placeholder="5"
                      data-testid="input-commission"
                    />
                  </div>
                </div>

                <div className="flex gap-2">
                  <Button type="submit" className="bg-blue-600 hover:bg-blue-700" data-testid="button-save">
                    Save
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setShowForm(false)}
                    data-testid="button-cancel"
                  >
                    Cancel
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        )}

        {/* Sales Team List */}
        <Card className="bg-white/5 border-slate-700">
          <CardHeader>
            <CardTitle className="text-white flex items-center gap-2">
              <Users className="h-5 w-5" />
              Sales Team ({salesPeople.length})
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {salesPeople.length === 0 ? (
                <p className="text-slate-400 text-center py-8">No sales people assigned yet</p>
              ) : (
                salesPeople.map((person) => (
                  <div
                    key={person.id}
                    className="bg-slate-800/50 p-4 rounded-lg flex items-center justify-between"
                  >
                    <div>
                      <p className="text-white font-semibold" data-testid={`text-name-${person.id}`}>
                        {person.name}
                      </p>
                      <p className="text-slate-400 text-sm">{person.email}</p>
                      {person.territory && (
                        <p className="text-slate-400 text-xs">Territory: {person.territory}</p>
                      )}
                      {person.commission && (
                        <p className="text-slate-400 text-xs">Commission: {person.commission}%</p>
                      )}
                    </div>
                    <Button
                      variant="destructive"
                      size="sm"
                      onClick={() => handleDeleteSalesPerson(person.id)}
                      data-testid={`button-delete-${person.id}`}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                ))
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
