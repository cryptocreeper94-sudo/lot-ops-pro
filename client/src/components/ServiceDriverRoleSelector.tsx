import { useState } from "react";
import { useLocation } from "wouter";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Truck, Wrench, Briefcase, ArrowRight } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

export default function ServiceDriverRoleSelector() {
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const [showRoleDialog, setShowRoleDialog] = useState(true);
  const [selectedRole, setSelectedRole] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const roles = [
    {
      id: "service_truck",
      title: "Service Truck Driver",
      description: "Perform vehicle maintenance and repairs",
      icon: <Wrench className="h-8 w-8" />,
      color: "from-amber-600 to-amber-500",
      route: "/service-driver"
    },
    {
      id: "inventory_driver",
      title: "Inventory Driver",
      description: "Scan and move vehicles in inventory",
      icon: <Briefcase className="h-8 w-8" />,
      color: "from-blue-600 to-blue-500",
      route: "/scanner"
    },
    {
      id: "van_driver",
      title: "Van Driver",
      description: "Transport and route management",
      icon: <Truck className="h-8 w-8" />,
      color: "from-green-600 to-green-500",
      route: "/crew-manager"
    }
  ];

  const handleSelectRole = async (roleId: string) => {
    setSelectedRole(roleId);
    setIsLoading(true);

    // Store role preference in localStorage
    localStorage.setItem("service_driver_role_today", roleId);

    const role = roles.find(r => r.id === roleId);
    if (role) {
      toast({ 
        title: `✓ ${role.title}`, 
        description: "Your role has been set for today"
      });

      // Small delay for visual feedback
      setTimeout(() => {
        setShowRoleDialog(false);
        setLocation(role.route);
      }, 500);
    }
  };

  if (!showRoleDialog) return null;

  return (
    <Dialog open={showRoleDialog} onOpenChange={setShowRoleDialog}>
      <DialogContent className="bg-gradient-to-br from-slate-950 via-slate-900 to-slate-800 border-2 border-purple-500/50 max-w-3xl">
        <DialogHeader>
          <DialogTitle className="text-3xl bg-gradient-to-r from-purple-400 to-blue-400 bg-clip-text text-transparent">
            Choose Your Role Today
          </DialogTitle>
          <DialogDescription className="text-slate-300 text-lg">
            Select which role you'll be performing today
          </DialogDescription>
        </DialogHeader>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 py-6">
          {roles.map((role) => (
            <Card
              key={role.id}
              className={`relative cursor-pointer transition-all duration-300 overflow-hidden group ${
                selectedRole === role.id
                  ? `border-2 border-green-500 bg-gradient-to-br from-green-950 to-slate-900`
                  : "border-slate-700 bg-slate-800/50 hover:border-purple-500/50 hover:bg-slate-800"
              } ${selectedRole !== role.id ? "hover:shadow-lg hover:shadow-purple-500/20" : ""}`}
            >
              {/* Animated background glow */}
              <div className={`absolute inset-0 bg-gradient-to-r ${role.color} opacity-0 group-hover:opacity-10 transition-opacity duration-300`} />
              
              <CardHeader className="relative z-10 pb-3">
                <div className={`w-12 h-12 rounded-lg bg-gradient-to-r ${role.color} flex items-center justify-center text-white mb-2 shadow-lg group-hover:scale-110 transition-transform duration-300`}>
                  {role.icon}
                </div>
                <CardTitle className="text-white text-lg">{role.title}</CardTitle>
              </CardHeader>

              <CardContent className="relative z-10 space-y-4">
                <p className="text-slate-300 text-sm">{role.description}</p>

                <button
                  onClick={() => handleSelectRole(role.id)}
                  disabled={isLoading}
                  className={`w-full py-2 px-4 rounded-lg font-bold transition-all duration-300 flex items-center justify-center gap-2 ${
                    selectedRole === role.id
                      ? `bg-gradient-to-r ${role.color} text-white shadow-lg scale-105`
                      : `bg-slate-700 hover:bg-slate-600 text-white hover:shadow-lg hover:shadow-purple-500/30 active:scale-95`
                  } ${isLoading ? "opacity-50 cursor-not-allowed" : ""}`}
                  data-testid={`button-select-${role.id}`}
                >
                  <ArrowRight className="h-4 w-4" />
                  {selectedRole === role.id ? "Selected" : "Choose"}
                </button>
              </CardContent>
            </Card>
          ))}
        </div>

        <DialogFooter>
          <Button
            onClick={() => setShowRoleDialog(false)}
            disabled={!selectedRole || isLoading}
            className="w-full bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white font-bold py-3 rounded-lg shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed"
            data-testid="button-confirm-role"
          >
            Continue to Dashboard
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
