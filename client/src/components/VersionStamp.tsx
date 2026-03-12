import { APP_VERSION } from "@shared/version";
import { Badge } from "@/components/ui/badge";
import { Info } from "lucide-react";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

interface VersionStampProps {
  variant?: "minimal" | "badge" | "full";
  className?: string;
}

export function VersionStamp({ variant = "minimal", className = "" }: VersionStampProps) {
  const { full, label, buildDate, codename } = APP_VERSION;

  if (variant === "minimal") {
    return (
      <span className={`text-[10px] text-slate-500 font-mono ${className}`} data-testid="version-stamp-minimal">
        {full}
      </span>
    );
  }

  if (variant === "badge") {
    return (
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <Badge 
              variant="outline" 
              className={`text-[10px] font-mono bg-slate-800/50 border-slate-600 text-slate-400 cursor-help ${className}`}
              data-testid="version-stamp-badge"
            >
              {full}
            </Badge>
          </TooltipTrigger>
          <TooltipContent className="bg-slate-800 border-slate-700">
            <div className="text-xs space-y-1">
              <p className="font-semibold text-white">Lot Ops Pro {full}</p>
              <p className="text-slate-400">Codename: {codename}</p>
              <p className="text-slate-400">Build: {buildDate}</p>
              <p className="text-slate-400">Status: {label}</p>
            </div>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
    );
  }

  return (
    <div className={`flex items-center gap-2 text-xs text-slate-400 ${className}`} data-testid="version-stamp-full">
      <Info className="w-3 h-3" />
      <span className="font-mono">{full}</span>
      <span className="text-slate-600">•</span>
      <span>{codename}</span>
      <span className="text-slate-600">•</span>
      <span>{buildDate}</span>
    </div>
  );
}

export default VersionStamp;
