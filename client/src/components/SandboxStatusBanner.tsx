import { PlayCircle, Key, Sparkles } from "lucide-react";
import { isInSandboxMode } from "@/utils/roleManager";

export function SandboxStatusBanner() {
  const isSandbox = isInSandboxMode();
  
  if (!isSandbox) return null;

  return (
    <div className="w-full bg-gradient-to-r from-purple-600 via-indigo-600 to-purple-600 text-white py-2 px-4 shadow-lg">
      <div className="max-w-4xl mx-auto">
        <div className="flex items-center gap-2 flex-wrap justify-center text-center">
          <div className="flex items-center gap-1.5">
            <PlayCircle className="h-4 w-4 text-yellow-300" />
            <span className="font-bold text-xs">SANDBOX</span>
          </div>
          <span className="text-purple-300 text-xs">•</span>
          <p className="text-purple-100 text-xs">
            Learning mode - no real data affected
          </p>
          <span className="text-purple-300 text-xs hidden sm:inline">•</span>
          <div className="hidden sm:flex items-center gap-1.5 bg-white/15 rounded-full px-2 py-0.5">
            <Key className="h-3 w-3 text-green-300" />
            <p className="text-green-200 text-[10px] font-medium">
              Get shift code to go live
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

export function SandboxStatusCard() {
  const isSandbox = isInSandboxMode();
  
  if (!isSandbox) return null;

  return (
    <div className="relative overflow-hidden bg-gradient-to-r from-purple-900/80 via-indigo-900/80 to-purple-900/80 backdrop-blur-md border border-purple-500/60 rounded-xl p-3 shadow-xl mb-4">
      {/* Animated glow effect */}
      <div className="absolute inset-0 bg-gradient-to-r from-purple-500/10 via-indigo-400/10 to-purple-500/10 animate-pulse pointer-events-none" />
      
      <div className="relative flex items-center gap-3">
        {/* Icon with glow */}
        <div className="relative flex-shrink-0">
          <div className="absolute inset-0 bg-yellow-400/30 rounded-full blur-md animate-pulse" />
          <div className="relative bg-purple-500/40 p-2 rounded-full">
            <PlayCircle className="h-5 w-5 text-yellow-300" />
          </div>
        </div>
        
        {/* Content - centered text */}
        <div className="flex-1 text-center">
          <div className="flex items-center justify-center gap-1.5 mb-0.5">
            <Sparkles className="h-3.5 w-3.5 text-yellow-400 animate-pulse" />
            <p className="font-bold text-white text-sm">Sandbox Mode</p>
            <Sparkles className="h-3.5 w-3.5 text-yellow-400 animate-pulse" />
          </div>
          <p className="text-purple-200 text-xs">
            Play around freely • No real data affected
          </p>
        </div>

        {/* Shift code badge with glow */}
        <div className="relative flex-shrink-0">
          <div className="absolute inset-0 bg-green-400/20 rounded-lg blur-sm" />
          <div className="relative flex items-center gap-1.5 bg-green-900/60 border border-green-500/40 rounded-lg px-2.5 py-1.5">
            <Key className="h-4 w-4 text-green-400" />
            <div className="text-center">
              <p className="text-green-300 text-[10px] font-bold leading-tight">Go Live?</p>
              <p className="text-green-400/80 text-[8px] leading-tight">Get shift code</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export function SandboxStatusCompact() {
  const isSandbox = isInSandboxMode();
  
  if (!isSandbox) return null;

  return (
    <div className="relative inline-flex items-center gap-2 bg-gradient-to-r from-purple-900/90 to-indigo-900/90 backdrop-blur-sm border border-purple-500/50 rounded-full px-3 py-1.5 shadow-lg">
      <div className="absolute inset-0 bg-purple-500/10 rounded-full animate-pulse pointer-events-none" />
      <PlayCircle className="h-3.5 w-3.5 text-yellow-300 relative" />
      <span className="font-semibold text-white text-xs relative">Sandbox</span>
      <div className="h-3 w-px bg-purple-400/40" />
      <Key className="h-3 w-3 text-green-400 relative" />
      <span className="text-green-300 text-[10px] font-medium relative">Need code</span>
    </div>
  );
}
