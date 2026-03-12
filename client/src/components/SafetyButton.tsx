import { AlertTriangle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useLocation } from "wouter";

export function SafetyButton() {
  const [_, setLocation] = useLocation();

  return (
    <Button
      onClick={() => setLocation("/safety-report")}
      className="fixed top-20 right-4 bg-red-600 hover:bg-red-700 text-white rounded-full p-4 shadow-2xl z-50 animate-pulse"
      data-testid="button-safety-report"
    >
      <AlertTriangle className="h-6 w-6" />
    </Button>
  );
}
