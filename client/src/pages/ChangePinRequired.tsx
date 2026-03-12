import { useState } from "react";
import { useLocation } from "wouter";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { Lock, Shield, CheckCircle2 } from "lucide-react";
import { NavigationControl } from "@/components/NavigationControl";

export default function ChangePinRequired() {
  const [_, setLocation] = useLocation();
  const { toast } = useToast();
  const [newPin, setNewPin] = useState("");
  const [confirmPin, setConfirmPin] = useState("");
  const [isChanging, setIsChanging] = useState(false);

  const userStr = localStorage.getItem("vanops_user");
  const user = userStr ? JSON.parse(userStr) : null;

  if (!user) {
    setLocation("/");
    return null;
  }

  const handleChangePin = async () => {
    if (!newPin || newPin.length !== 4 || !/^\d{4}$/.test(newPin)) {
      toast({
        title: "Invalid PIN",
        description: "PIN must be exactly 4 digits",
        variant: "destructive",
      });
      return;
    }

    if (newPin === confirmPin && newPin.length === 4) {
      toast({
        title: "PIN cannot be the same",
        description: "Your new PIN must be different from your temporary PIN",
        variant: "destructive",
      });
      return;
    }

    if (newPin !== confirmPin) {
      toast({
        title: "PINs Don't Match",
        description: "Please make sure both PINs are identical",
        variant: "destructive",
      });
      return;
    }

    setIsChanging(true);

    try {
      const res = await fetch(`/api/users/${user.id}/change-pin`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          newPin,
          isInitialChange: true,
        }),
      });

      if (!res.ok) {
        const error = await res.json();
        throw new Error(error.message || "Failed to change PIN");
      }

      const updatedUser = await res.json();

      // Update local storage with new user data
      localStorage.setItem("vanops_user", JSON.stringify({
        ...user,
        mustChangePin: false,
      }));

      toast({
        title: "✓ PIN Changed Successfully",
        description: "Your personal PIN has been set. Logging you in...",
      });

      setTimeout(() => {
        // Redirect based on role
        if (user.role === "operations_manager") {
          setLocation("/operations-manager");
        } else if (user.role === "supervisor") {
          setLocation("/resource-allocation");
        } else if (user.role === "safety_advisor") {
          setLocation("/safety-dashboard");
        } else if (user.role === "developer") {
          setLocation("/developer");
        } else {
          setLocation("/driver-dashboard");
        }
      }, 1500);
    } catch (error: any) {
      toast({
        title: "PIN Change Failed",
        description: error.message || "Unable to update PIN. Please try again.",
        variant: "destructive",
      });
      setIsChanging(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 via-white to-red-50 flex items-center justify-center p-4">
      <Card className="w-full max-w-md border-orange-200 shadow-xl">
        <CardHeader className="pb-4">
          <div className="flex items-center gap-3 mb-3">
            <div className="bg-orange-100 p-3 rounded-full">
              <Shield className="h-8 w-8 text-orange-600" />
            </div>
            <div>
              <CardTitle className="text-2xl text-slate-900">Change Your PIN</CardTitle>
              <p className="text-sm text-slate-500 mt-1">Security Requirement</p>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="bg-orange-50 border border-orange-200 rounded-lg p-4 space-y-2">
            <div className="flex items-start gap-2">
              <Lock className="h-5 w-5 text-orange-600 shrink-0 mt-0.5" />
              <div>
                <p className="text-sm font-semibold text-orange-900">Temporary PIN Detected</p>
                <p className="text-xs text-orange-700 leading-relaxed mt-1">
                  You're logging in with a temporary PIN. For security, you must create your own personal 4-digit PIN before accessing the system.
                </p>
              </div>
            </div>
          </div>

          <div className="space-y-3">
            <div>
              <Label htmlFor="newPin" className="text-sm font-semibold text-slate-700">
                New PIN (4 digits)
              </Label>
              <Input
                id="newPin"
                type="password"
                inputMode="numeric"
                maxLength={4}
                value={newPin}
                onChange={(e) => setNewPin(e.target.value.replace(/\D/g, ""))}
                placeholder="Enter new 4-digit PIN"
                className="mt-1.5 text-center text-2xl tracking-widest font-mono"
                data-testid="input-new-pin"
              />
            </div>

            <div>
              <Label htmlFor="confirmPin" className="text-sm font-semibold text-slate-700">
                Confirm New PIN
              </Label>
              <Input
                id="confirmPin"
                type="password"
                inputMode="numeric"
                maxLength={4}
                value={confirmPin}
                onChange={(e) => setConfirmPin(e.target.value.replace(/\D/g, ""))}
                placeholder="Re-enter new PIN"
                className="mt-1.5 text-center text-2xl tracking-widest font-mono"
                data-testid="input-confirm-pin"
              />
            </div>
          </div>

          <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
            <div className="flex items-start gap-2">
              <CheckCircle2 className="h-4 w-4 text-blue-600 shrink-0 mt-0.5" />
              <div>
                <p className="text-xs font-semibold text-blue-900">Emergency Access</p>
                <p className="text-[10px] text-blue-700 leading-relaxed">
                  The Operations Manager can reset your PIN if you forget it. Your new PIN is secure and only you know it.
                </p>
              </div>
            </div>
          </div>

          <Button
            onClick={handleChangePin}
            disabled={isChanging || newPin.length !== 4 || confirmPin.length !== 4}
            className="w-full bg-gradient-to-r from-orange-600 to-red-600 hover:from-orange-700 hover:to-red-700 text-white"
            data-testid="button-change-pin"
          >
            {isChanging ? "Changing PIN..." : "Set My Personal PIN"}
          </Button>

          <p className="text-[10px] text-slate-500 text-center">
            After setting your PIN, you'll be logged in and can access all features.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
