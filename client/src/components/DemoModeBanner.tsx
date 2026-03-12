import { PlayCircle, AlertCircle } from "lucide-react";
import { Badge } from "@/components/ui/badge";

export function DemoModeBanner() {
  const isDemoMode = localStorage.getItem("vanops_demo_mode") === "true";

  if (!isDemoMode) return null;

  return (
    <div className="fixed top-0 left-0 right-0 z-50 bg-gradient-to-r from-cyan-500 to-blue-500 text-white py-2 px-4 shadow-lg animate-pulse">
      <div className="flex items-center justify-center gap-2 text-sm font-bold">
        <PlayCircle className="h-4 w-4" />
        <span>🎮 DEMO MODE - PRACTICE ONLY</span>
        <AlertCircle className="h-4 w-4" />
      </div>
      <div className="text-center text-xs opacity-90">
        Nothing you do will be saved to the database
      </div>
    </div>
  );
}

export function isDemoMode(): boolean {
  return localStorage.getItem("vanops_demo_mode") === "true";
}
