import { useLocation } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { APP_VERSION } from "@shared/version";
import { useFacilityMode } from "@/hooks/useFacilityMode";
import { TrendingUp, Users, Building2, Crown, ArrowRight, Shield, CheckCircle } from "lucide-react";
import { Badge } from "@/components/ui/badge";

interface LatestRelease {
  version: string;
  title: string | null;
  isBlockchainVerified: boolean;
  blockchainTxHash: string | null;
}

export function Footer() {
  const [_, setLocation] = useLocation();
  const { showInvestorContent, showSalesContent } = useFacilityMode();
  
  const { data: latestRelease } = useQuery<LatestRelease | null>({
    queryKey: ['latestRelease'],
    queryFn: async () => {
      const res = await fetch('/api/releases/latest');
      if (!res.ok) return null;
      return res.json();
    },
    staleTime: 1000 * 60 * 5,
  });

  return (
    <footer className="mt-4 relative z-10 pointer-events-auto w-full">
      {showInvestorContent && (
        <div className="w-full bg-gradient-to-r from-violet-950/90 via-purple-950/90 to-indigo-950/90 border-t border-violet-500/20">
          <div className="max-w-6xl mx-auto px-4 py-6">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="md:col-span-2">
                <div className="flex items-center gap-2 mb-2">
                  <Crown className="w-5 h-5 text-amber-400" />
                  <h3 className="text-white font-bold text-sm">Investment Opportunity</h3>
                </div>
                <p className="text-violet-200 text-xs leading-relaxed mb-3">
                  Lot Ops Pro is revolutionizing auto auction operations with AI-powered lot management. 
                  Join us as we scale across the $40B+ vehicle remarketing industry.
                </p>
                <button
                  onClick={() => setLocation("/investors")}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-gradient-to-r from-amber-500 to-orange-500 text-white text-xs font-bold rounded-lg hover:from-amber-400 hover:to-orange-400 transition-all"
                  data-testid="button-investor-cta"
                >
                  Investor Information <ArrowRight className="w-3 h-3" />
                </button>
              </div>
              
              <div className="space-y-2">
                <h4 className="text-violet-300 text-[10px] font-bold uppercase tracking-wide">Revenue Streams</h4>
                <div className="space-y-1.5">
                  <div className="flex items-center gap-2 text-xs text-violet-200">
                    <TrendingUp className="w-3 h-3 text-emerald-400" />
                    SaaS Subscriptions
                  </div>
                  <div className="flex items-center gap-2 text-xs text-violet-200">
                    <Building2 className="w-3 h-3 text-blue-400" />
                    Franchise Licensing
                  </div>
                  <div className="flex items-center gap-2 text-xs text-violet-200">
                    <Users className="w-3 h-3 text-purple-400" />
                    Per-Vehicle Royalties
                  </div>
                </div>
              </div>
              
              <div className="space-y-2">
                <h4 className="text-violet-300 text-[10px] font-bold uppercase tracking-wide">Quick Links</h4>
                <div className="space-y-1.5">
                  <button
                    onClick={() => setLocation("/pricing")}
                    className="block text-xs text-violet-200 hover:text-white transition-colors"
                    data-testid="link-footer-pricing"
                  >
                    Pricing Plans
                  </button>
                  <button
                    onClick={() => setLocation("/franchise")}
                    className="block text-xs text-violet-200 hover:text-white transition-colors"
                    data-testid="link-footer-franchise"
                  >
                    Franchise Opportunities
                  </button>
                  <button
                    onClick={() => setLocation("/slideshow")}
                    className="block text-xs text-violet-200 hover:text-white transition-colors"
                    data-testid="link-footer-demo"
                  >
                    Product Demo
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
      
      <div className="w-full bg-slate-900/80 border-t border-slate-700/30">
        <div className="flex items-center justify-center gap-2 px-3 py-1.5 text-[10px] text-slate-500">
          <a 
            href="https://darkwavestudios.io" 
            target="_blank" 
            rel="noopener noreferrer"
            className="hover:text-white transition-colors"
            data-testid="link-darkwave"
          >
            DarkWave Studios
          </a>
          <span>·</span>
          <button
            type="button"
            onClick={() => setLocation("/privacy")}
            className="hover:text-blue-400 transition-colors"
            data-testid="link-privacy-policy"
          >
            Privacy
          </button>
          <span>·</span>
          <button
            type="button"
            onClick={() => setLocation("/terms")}
            className="hover:text-purple-400 transition-colors"
            data-testid="link-terms-of-service"
          >
            Terms
          </button>
          {showSalesContent && (
            <>
              <span>·</span>
              <button
                type="button"
                onClick={() => setLocation("/investors")}
                className="hover:text-amber-400 transition-colors"
                data-testid="link-footer-investors"
              >
                Investors
              </button>
            </>
          )}
          <span>·</span>
          {latestRelease?.version ? (
            <span className="flex items-center gap-1">
              <Badge 
                variant="outline" 
                className="text-[10px] font-mono px-1.5 py-0 h-4 border-emerald-500/50 text-emerald-400 hover:bg-emerald-500/10 cursor-default"
                data-testid="badge-release-version"
              >
                {latestRelease.version}
                {latestRelease.title && ` "${latestRelease.title}"`}
              </Badge>
              {latestRelease.isBlockchainVerified && (
                <a
                  href={`https://solscan.io/tx/${latestRelease.blockchainTxHash}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-emerald-400 hover:text-emerald-300 transition-colors"
                  title="Verified on Solana Blockchain"
                  data-testid="link-blockchain-verification"
                >
                  <Shield className="w-3 h-3" />
                </a>
              )}
            </span>
          ) : (
            <span className="font-mono">{APP_VERSION.full}</span>
          )}
        </div>
      </div>
    </footer>
  );
}
