import { useLocation } from "wouter";

export function CompactFooter() {
  const [_, setLocation] = useLocation();

  return (
    <footer className="fixed bottom-0 left-0 right-0 z-40 h-[30px] bg-slate-900/95 backdrop-blur border-t border-slate-700/50 flex items-center justify-center px-3">
      <div className="flex items-center gap-1 text-[10px] text-slate-500">
        <span>Powered by</span>
        <a 
          href="https://darkwavestudios.io" 
          target="_blank" 
          rel="noopener noreferrer"
          className="text-slate-400 hover:text-white transition-colors font-medium"
          data-testid="link-darkwave-footer"
        >
          Darkwave Studios, LLC
        </a>
        <span>Copyright 2025</span>
      </div>
    </footer>
  );
}

export default CompactFooter;
