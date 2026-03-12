import { useState } from "react";
import { Button } from "@/components/ui/button";
import { HelpCircle } from "lucide-react";
import { SandboxGuideOverlay } from "./SandboxGuideOverlay";
import { isSandboxMode } from "@/utils/sandboxSimulation";

interface SandboxHelpButtonProps {
  role: string;
  page: string;
  size?: "sm" | "md" | "lg";
}

export function SandboxHelpButton({ role, page, size = "sm" }: SandboxHelpButtonProps) {
  const [showGuide, setShowGuide] = useState(false);

  if (!isSandboxMode()) return null;

  const buttonClass = size === "sm" 
    ? "px-2.5 py-1.5" 
    : size === "lg" 
    ? "px-6 py-3" 
    : "px-4 py-2";

  return (
    <>
      <Button
        onClick={() => setShowGuide(true)}
        className={`bg-gradient-to-br from-cyan-400 via-blue-500 to-purple-600 hover:from-cyan-300 hover:to-purple-700 text-white font-semibold gap-2 transform hover:scale-110 active:scale-95 transition-all duration-200 shadow-lg hover:shadow-2xl ${buttonClass}`}
        size={size === "sm" ? "sm" : size === "lg" ? "lg" : "default"}
        data-testid="button-sandbox-help"
        style={{
          boxShadow: "0 0 15px rgba(59, 130, 246, 0.5), 0 4px 12px rgba(0,0,0,0.15)"
        }}
      >
        <HelpCircle className={`${size === "sm" ? "h-3.5 w-3.5" : size === "lg" ? "h-5 w-5" : "h-4 w-4"}`} />
        {size !== "sm" && "Sandbox Guide"}
      </Button>

      <SandboxGuideOverlay
        role={role}
        page={page}
        isOpen={showGuide}
        onClose={() => setShowGuide(false)}
      />
    </>
  );
}
