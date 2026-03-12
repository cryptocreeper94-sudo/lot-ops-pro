import { useState } from "react";
import { Button } from "@/components/ui/button";
import { HelpCircle } from "lucide-react";
import { HelpCenter } from "./HelpCenter";

interface HelpButtonProps {
  role: "van_driver" | "inventory_driver" | "supervisor" | "operations_manager";
  variant?: "floating" | "inline";
  size?: "sm" | "md" | "lg";
}

export function HelpButton({ role, variant = "floating", size = "md" }: HelpButtonProps) {
  const [isOpen, setIsOpen] = useState(false);

  const sizeClasses = {
    sm: "h-10 w-10",
    md: "h-12 w-12",
    lg: "h-14 w-14"
  };

  const iconSizes = {
    sm: "h-5 w-5",
    md: "h-6 w-6",
    lg: "h-7 w-7"
  };

  if (variant === "floating") {
    return (
      <>
        <button
          onClick={() => setIsOpen(true)}
          className={`fixed bottom-20 right-4 ${sizeClasses[size]} rounded-full bg-gradient-to-br from-blue-500 via-purple-500 to-pink-500 hover:from-blue-600 hover:via-purple-600 hover:to-pink-600 text-white shadow-lg hover:shadow-2xl transition-all duration-300 hover:scale-110 active:scale-95 z-50 flex items-center justify-center group`}
          data-testid="button-help-floating"
          style={{
            boxShadow: "0 0 20px rgba(59, 130, 246, 0.5), 0 4px 12px rgba(0,0,0,0.25)"
          }}
        >
          <HelpCircle className={`${iconSizes[size]} group-hover:rotate-12 transition-transform`} />
          
          {/* Pulse animation */}
          <span className="absolute inset-0 rounded-full bg-blue-400 opacity-0 group-hover:opacity-20 animate-ping" />
        </button>

        <HelpCenter isOpen={isOpen} onClose={() => setIsOpen(false)} role={role} />
      </>
    );
  }

  return (
    <>
      <Button
        onClick={() => setIsOpen(true)}
        className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-semibold gap-2 shadow-lg"
        size={size === "sm" ? "sm" : size === "lg" ? "lg" : "default"}
        data-testid="button-help-inline"
      >
        <HelpCircle className={iconSizes[size]} />
        <span>Help Guide</span>
      </Button>

      <HelpCenter isOpen={isOpen} onClose={() => setIsOpen(false)} role={role} />
    </>
  );
}
