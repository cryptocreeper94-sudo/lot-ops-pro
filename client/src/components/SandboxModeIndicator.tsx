import { Zap, AlertCircle } from "lucide-react";
import { GPSPermissionNotice } from "./GPSPermissionNotice";

interface SandboxModeIndicatorProps {
  className?: string;
}

export function SandboxModeIndicator({ className = "" }: SandboxModeIndicatorProps) {
  const isSandbox = localStorage.getItem("vanops_demo_mode") === "true";

  if (!isSandbox) return null;

  return (
    <div className="space-y-2">
      <div className={`inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-gradient-to-r from-purple-500 via-purple-600 to-blue-600 text-white font-bold text-sm shadow-lg hover:shadow-2xl transform hover:scale-105 transition-all duration-200 ${className}`}
        style={{
          boxShadow: "0 0 20px rgba(168, 85, 247, 0.6), 0 4px 15px rgba(0,0,0,0.2)"
        }}>
        <Zap className="h-4 w-4 animate-pulse" />
        🎮 SANDBOX MODE
      </div>
      
      {/* GPS Notice - Compact inline version */}
      <GPSPermissionNotice variant="inline" dismissible={false} className="!m-0" />
    </div>
  );
}
