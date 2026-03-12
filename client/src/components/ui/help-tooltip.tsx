import { HelpCircle } from "lucide-react";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

interface HelpTooltipProps {
  content: string;
  side?: "top" | "right" | "bottom" | "left";
  className?: string;
}

export function HelpTooltip({ content, side = "right", className = "" }: HelpTooltipProps) {
  return (
    <TooltipProvider delayDuration={100}>
      <Tooltip>
        <TooltipTrigger asChild>
          <button
            type="button"
            className={`inline-flex items-center justify-center text-blue-500 hover:text-blue-600 transition-colors ${className}`}
            aria-label="Help"
          >
            <HelpCircle className="h-4 w-4" />
          </button>
        </TooltipTrigger>
        <TooltipContent side={side} className="max-w-xs text-xs bg-slate-900 text-white border-slate-700 p-3">
          <p>{content}</p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}

interface QuickHelpPanelProps {
  title: string;
  tips: string[];
  className?: string;
}

export function QuickHelpPanel({ title, tips, className = "" }: QuickHelpPanelProps) {
  return (
    <div className={`bg-blue-50 border border-blue-200 rounded-lg p-3 ${className}`}>
      <div className="flex items-start gap-2">
        <HelpCircle className="h-4 w-4 text-blue-600 mt-0.5 flex-shrink-0" />
        <div className="space-y-2">
          <p className="font-semibold text-sm text-blue-900">{title}</p>
          <ul className="space-y-1 text-xs text-blue-800">
            {tips.map((tip, i) => (
              <li key={i} className="flex items-start gap-2">
                <span className="text-blue-400 mt-0.5">•</span>
                <span>{tip}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
}
