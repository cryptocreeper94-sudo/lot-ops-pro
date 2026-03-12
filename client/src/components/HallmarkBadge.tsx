import { useState } from "react";
import { motion } from "framer-motion";
import { 
  Download, Share2, Trophy, Zap, Clock, Target, 
  Users, Star, Shield, Award, Sparkles, Copy, Check,
  QrCode, ExternalLink, Loader2
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { VisuallyHidden } from "@radix-ui/react-visually-hidden";
import { useToast } from "@/hooks/use-toast";
import { QRCodeSVG } from "qrcode.react";
import { useMutation, useQueryClient } from "@tanstack/react-query";

const LOT_BUDDY_PRESENTERS = [
  '/lotbuddy_catalog/lotbuddy_avatar_01_mixed_male_brown_average.png',
  '/lotbuddy_catalog/lotbuddy_avatar_03_caucasian_female_blonde_slim.png',
  '/lotbuddy_catalog/lotbuddy_avatar_04_black_male_black_average.png',
  '/lotbuddy_catalog/lotbuddy_avatar_17_hispanic_female_black_average.png',
  '/lotbuddy_catalog/lotbuddy_avatar_27_mixed_male_brown_average_curly_young.png',
  '/lotbuddy_catalog/lotbuddy_avatar_28_asian_male_black_slim_glasses.png',
];

interface DriverStats {
  totalMoves: number;
  efficiency: number;
  quotaCompletion: number;
  avgMph: number;
  shiftsWorked: number;
  teamRank: number;
  teamSize: number;
  achievements: string[];
}

interface HallmarkBadgeProps {
  userId?: number;
  driverName: string;
  avatarUrl?: string;
  role: string;
  joinDate: string;
  stats: DriverStats;
  variant: "beta" | "public";
  hallmarkId?: string;
  onDownload?: () => void;
  onPurchase?: () => void;
}

const generateHallmarkHash = (name: string, date: string): string => {
  const data = `${name}-${date}-${Date.now()}`;
  let hash = 0;
  for (let i = 0; i < data.length; i++) {
    const char = data.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash;
  }
  return Math.abs(hash).toString(16).toUpperCase().padStart(12, '0');
};

export function HallmarkBadge({
  userId,
  driverName,
  avatarUrl,
  role,
  joinDate,
  stats,
  variant,
  hallmarkId,
  onDownload,
  onPurchase
}: HallmarkBadgeProps) {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [isExpanded, setIsExpanded] = useState(false);
  const [copied, setCopied] = useState(false);
  const [uniqueHash, setUniqueHash] = useState(() => hallmarkId || generateHallmarkHash(driverName, joinDate));
  const [solanaSignature, setSolanaSignature] = useState<string | null>(null);
  const [explorerUrl, setExplorerUrl] = useState<string | null>(null);
  const [presenter] = useState(() => 
    LOT_BUDDY_PRESENTERS[Math.floor(Math.random() * LOT_BUDDY_PRESENTERS.length)]
  );
  
  const initials = driverName.split(' ').map(n => n[0]).join('').toUpperCase();
  const isBeta = variant === "beta";
  const qrValue = solanaSignature 
    ? `https://explorer.solana.com/tx/${solanaSignature}`
    : `lotops://hallmark/${uniqueHash}`;

  // Mutation for minting NFT on Solana mainnet
  const mintMutation = useMutation({
    mutationFn: async () => {
      const response = await fetch('/api/solana/mint-hallmark', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          driverId: userId?.toString(), // Maps to user.id in backend
          driverName,
          role,
          joinDate,
          totalMoves: stats.totalMoves,
          efficiency: stats.efficiency,
          teamRank: stats.teamRank,
          variant
        })
      });
      
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Failed to mint NFT');
      }
      
      return response.json();
    },
    onSuccess: (data) => {
      if (data.hallmarkHash) {
        setUniqueHash(data.hallmarkHash);
      }
      if (data.signature) {
        setSolanaSignature(data.signature);
        setExplorerUrl(data.explorerUrl);
      }
      
      queryClient.invalidateQueries({ queryKey: ['/api/solana/badges'] });
      
      toast({ 
        title: isBeta ? "🎉 Beta Tester NFT Minted!" : "🎉 NFT Minted Successfully!",
        description: data.signature 
          ? "Your badge is now on Solana blockchain!" 
          : "Your hallmark hash has been generated."
      });
    },
    onError: (error: Error) => {
      toast({ 
        title: "Minting Failed", 
        description: error.message,
        variant: "destructive"
      });
    }
  });

  // Mutation for Stripe checkout (public users - $1.99)
  const checkoutMutation = useMutation({
    mutationFn: async () => {
      const response = await fetch('/api/solana/checkout-badge', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          driverName,
          role,
          joinDate,
          totalMoves: stats.totalMoves,
          efficiency: stats.efficiency,
          teamRank: stats.teamRank,
        })
      });
      
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Failed to create checkout');
      }
      
      return response.json();
    },
    onSuccess: (data) => {
      // Redirect to Stripe Checkout
      if (data.url) {
        window.location.href = data.url;
      }
    },
    onError: (error: Error) => {
      toast({ 
        title: "Checkout Failed", 
        description: error.message,
        variant: "destructive"
      });
    }
  });

  const copyHash = async () => {
    const textToCopy = solanaSignature || uniqueHash;
    await navigator.clipboard.writeText(textToCopy);
    setCopied(true);
    toast({ title: "Copied!", description: solanaSignature ? "Solana signature copied." : "Hallmark hash copied." });
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownload = () => {
    if (isBeta) {
      // Beta users mint for FREE on mainnet
      mintMutation.mutate();
      onDownload?.();
    } else {
      // Public users pay $1.99 - redirect to Stripe Checkout
      checkoutMutation.mutate();
      onPurchase?.();
    }
  };
  
  const isLoading = mintMutation.isPending || checkoutMutation.isPending;
  
  const openExplorer = () => {
    if (explorerUrl) {
      window.open(explorerUrl, '_blank');
    } else if (solanaSignature) {
      window.open(`https://explorer.solana.com/tx/${solanaSignature}`, '_blank');
    }
  };

  return (
    <>
      <motion.div
        className="relative cursor-pointer group"
        whileHover={{ scale: 1.02, rotateY: 5 }}
        whileTap={{ scale: 0.98 }}
        onClick={() => setIsExpanded(true)}
        style={{ perspective: "1000px" }}
      >
        <div 
          className={`relative w-72 rounded-2xl overflow-hidden shadow-2xl ${
            isBeta 
              ? "bg-gradient-to-br from-emerald-900 via-teal-800 to-cyan-900" 
              : "bg-gradient-to-br from-purple-900 via-indigo-800 to-blue-900"
          }`}
          style={{
            background: isBeta
              ? "linear-gradient(135deg, #064e3b 0%, #0f766e 50%, #155e75 100%)"
              : "linear-gradient(135deg, #581c87 0%, #3730a3 50%, #1e40af 100%)"
          }}
        >
          <div 
            className="absolute inset-0 opacity-30"
            style={{
              background: `
                repeating-linear-gradient(
                  45deg,
                  transparent,
                  transparent 10px,
                  rgba(255,255,255,0.03) 10px,
                  rgba(255,255,255,0.03) 20px
                ),
                repeating-linear-gradient(
                  -45deg,
                  transparent,
                  transparent 10px,
                  rgba(255,255,255,0.03) 10px,
                  rgba(255,255,255,0.03) 20px
                )
              `
            }}
          />
          
          <motion.div
            className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none"
            style={{
              background: "linear-gradient(105deg, transparent 40%, rgba(255,255,255,0.4) 45%, rgba(255,255,255,0.8) 50%, rgba(255,255,255,0.4) 55%, transparent 60%)",
              backgroundSize: "200% 100%"
            }}
            animate={{
              backgroundPosition: ["200% 0%", "-100% 0%"]
            }}
            transition={{
              duration: 1.5,
              repeat: Infinity,
              repeatDelay: 2
            }}
          />

          <div className="relative p-4">
            <div className="flex items-center justify-between mb-3">
              <div className={`text-xs font-bold uppercase tracking-wider ${
                isBeta ? "text-emerald-300" : "text-purple-300"
              }`}>
                {isBeta ? "⭐ BETA TESTER EDITION" : "LOT OPS PRO"}
              </div>
              <div className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                isBeta 
                  ? "bg-emerald-500/30 text-emerald-200 border border-emerald-400/50" 
                  : "bg-purple-500/30 text-purple-200 border border-purple-400/50"
              }`}>
                {isBeta ? "COLLECTOR'S" : "VERIFIED"}
              </div>
            </div>

            <div className="flex items-center gap-4 mb-4">
              <div className="relative">
                <div className="relative">
                  <img
                    src="/lotops-emblem-transparent.png"
                    alt="Lot Ops Pro"
                    className="w-20 h-20 object-contain drop-shadow-lg"
                  />
                  <div className="absolute -bottom-1 -right-1 bg-white p-0.5 rounded shadow-lg">
                    <QRCodeSVG 
                      value={qrValue}
                      size={18}
                      level="L"
                      includeMargin={false}
                    />
                  </div>
                </div>
                <div className={`absolute -top-1 -left-1 w-6 h-6 rounded-full flex items-center justify-center ${
                  isBeta ? "bg-emerald-500" : "bg-purple-500"
                }`}>
                  <Shield className="w-3 h-3 text-white" />
                </div>
              </div>
              
              <div className="flex-1">
                <h3 className="text-white font-bold text-lg leading-tight">{driverName}</h3>
                <p className={`text-sm ${isBeta ? "text-emerald-300" : "text-purple-300"}`}>
                  {role}
                </p>
                <p className="text-white/60 text-xs">
                  Since {new Date(joinDate).toLocaleDateString('en-US', { month: 'short', year: 'numeric' })}
                </p>
              </div>
            </div>

            <div className="grid grid-cols-3 gap-2 mb-3">
              <div className={`rounded-lg p-2 text-center ${
                isBeta ? "bg-emerald-800/50" : "bg-purple-800/50"
              }`}>
                <div className="text-white font-bold text-lg">{stats.totalMoves.toLocaleString()}</div>
                <div className="text-white/60 text-[10px] uppercase">Moves</div>
              </div>
              <div className={`rounded-lg p-2 text-center ${
                isBeta ? "bg-emerald-800/50" : "bg-purple-800/50"
              }`}>
                <div className="text-white font-bold text-lg">{stats.efficiency}%</div>
                <div className="text-white/60 text-[10px] uppercase">Efficiency</div>
              </div>
              <div className={`rounded-lg p-2 text-center ${
                isBeta ? "bg-emerald-800/50" : "bg-purple-800/50"
              }`}>
                <div className="text-white font-bold text-lg">#{stats.teamRank}</div>
                <div className="text-white/60 text-[10px] uppercase">Team Rank</div>
              </div>
            </div>

            <div className={`flex items-center justify-between p-2 rounded-lg ${
              isBeta ? "bg-black/30" : "bg-black/30"
            }`}>
              <div className="flex items-center gap-2">
                <QrCode className={`w-4 h-4 ${isBeta ? "text-emerald-400" : "text-purple-400"}`} />
                <code className="text-white/80 text-xs font-mono">{uniqueHash.slice(0, 8)}...</code>
              </div>
              <div className={`text-[10px] ${isBeta ? "text-emerald-400" : "text-purple-400"}`}>
                SOLANA MAINNET
              </div>
            </div>
            
            {solanaSignature && (
              <button 
                onClick={(e) => { e.stopPropagation(); openExplorer(); }}
                className={`mt-2 w-full flex items-center justify-center gap-1 py-1 rounded text-[10px] font-medium ${
                  isBeta ? "bg-emerald-600/30 text-emerald-300 hover:bg-emerald-600/50" : "bg-purple-600/30 text-purple-300 hover:bg-purple-600/50"
                }`}
              >
                <ExternalLink className="w-3 h-3" />
                View on Solana Explorer
              </button>
            )}
          </div>
        </div>
      </motion.div>

      <Dialog open={isExpanded} onOpenChange={setIsExpanded}>
        <DialogContent className={`max-w-lg p-0 overflow-hidden ${
          isBeta 
            ? "bg-gradient-to-br from-emerald-950 via-teal-900 to-cyan-950 border-emerald-700" 
            : "bg-gradient-to-br from-purple-950 via-indigo-900 to-blue-950 border-purple-700"
        }`}>
          <VisuallyHidden>
            <DialogTitle>{driverName}'s Hallmark Badge</DialogTitle>
            <DialogDescription>View detailed stats and download your NFT badge</DialogDescription>
          </VisuallyHidden>
          
          <div className="p-6 space-y-6">
            <div className="flex items-center justify-between">
              <div className={`flex items-center gap-2 text-sm font-bold uppercase tracking-wider ${
                isBeta ? "text-emerald-400" : "text-purple-400"
              }`}>
                <Sparkles className="w-4 h-4" />
                {isBeta ? "BETA TESTER COLLECTOR'S EDITION" : "LOT OPS PRO HALLMARK"}
              </div>
              {isBeta && (
                <div className="px-2 py-1 rounded bg-yellow-500/20 text-yellow-300 text-xs font-bold border border-yellow-500/50">
                  🌟 RARE
                </div>
              )}
            </div>

            <div className="flex items-end gap-4">
              <motion.img
                src={presenter}
                alt="Lot Buddy"
                className="w-24 h-32 object-contain mb-[-6px]"
                initial={{ x: -30, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                transition={{ delay: 0.2, type: 'spring' }}
              />
              
              <div className="flex-1">
                <motion.div 
                  className="relative mb-3"
                  initial={{ scale: 0.8, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={{ delay: 0.3 }}
                >
                  <div className={`absolute -inset-1 rounded-lg blur opacity-75 animate-pulse ${
                    isBeta ? "bg-gradient-to-r from-emerald-400 via-cyan-500 to-teal-500" : "bg-gradient-to-r from-purple-400 via-pink-500 to-blue-500"
                  }`} />
                  <div className="relative bg-white p-3 rounded-lg shadow-2xl flex items-center justify-center">
                    <QRCodeSVG 
                      value={qrValue}
                      size={100}
                      level="H"
                      includeMargin={true}
                      imageSettings={{
                        src: '/lotops-emblem-transparent.png',
                        height: 20,
                        width: 20,
                        excavate: true,
                      }}
                    />
                  </div>
                </motion.div>
                
                <motion.div
                  className={`absolute top-16 left-24 px-3 py-2 rounded-lg shadow-xl max-w-[160px] ${
                    isBeta ? "bg-emerald-800" : "bg-purple-800"
                  }`}
                  initial={{ scale: 0, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={{ delay: 0.5, type: 'spring' }}
                >
                  <p className="text-xs text-white">
                    "Scan this to verify your badge on the blockchain!"
                  </p>
                  <div className={`absolute -bottom-2 left-4 w-0 h-0 border-l-[6px] border-r-[6px] border-t-[6px] border-transparent ${
                    isBeta ? "border-t-emerald-800" : "border-t-purple-800"
                  }`} />
                </motion.div>
              </div>
            </div>

            <div className="flex items-center gap-4 pt-2">
              <div>
                <h2 className="text-white font-bold text-2xl">{driverName}</h2>
                <p className={`text-lg ${isBeta ? "text-emerald-300" : "text-purple-300"}`}>{role}</p>
                <p className="text-white/60 text-sm">Member since {new Date(joinDate).toLocaleDateString()}</p>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <StatCard icon={Target} label="Total Moves" value={stats.totalMoves.toLocaleString()} isBeta={isBeta} />
              <StatCard icon={Zap} label="Efficiency" value={`${stats.efficiency}%`} isBeta={isBeta} />
              <StatCard icon={Trophy} label="Quota Rate" value={`${stats.quotaCompletion}%`} isBeta={isBeta} />
              <StatCard icon={Clock} label="Avg MPH" value={`${stats.avgMph} mph`} isBeta={isBeta} />
              <StatCard icon={Star} label="Shifts Worked" value={stats.shiftsWorked.toString()} isBeta={isBeta} />
              <StatCard icon={Users} label="Team Rank" value={`#${stats.teamRank} of ${stats.teamSize}`} isBeta={isBeta} />
            </div>

            {stats.achievements.length > 0 && (
              <div className={`p-3 rounded-lg ${isBeta ? "bg-emerald-900/50" : "bg-purple-900/50"}`}>
                <div className={`text-sm font-semibold mb-2 ${isBeta ? "text-emerald-300" : "text-purple-300"}`}>
                  <Award className="w-4 h-4 inline mr-2" />
                  Achievements
                </div>
                <div className="flex flex-wrap gap-2">
                  {stats.achievements.map((achievement, i) => (
                    <span 
                      key={i}
                      className={`px-2 py-1 rounded text-xs font-medium ${
                        isBeta 
                          ? "bg-emerald-800/50 text-emerald-200" 
                          : "bg-purple-800/50 text-purple-200"
                      }`}
                    >
                      {achievement}
                    </span>
                  ))}
                </div>
              </div>
            )}

            <div className={`p-3 rounded-lg ${isBeta ? "bg-black/40" : "bg-black/40"}`}>
              <div className="flex items-center justify-between mb-2">
                <span className={`text-xs font-semibold ${isBeta ? "text-emerald-300" : "text-purple-300"}`}>
                  {solanaSignature ? "Solana Signature" : "Hallmark Hash"}
                </span>
                <span className={`text-[10px] ${isBeta ? "text-emerald-400" : "text-purple-400"}`}>
                  SOLANA MAINNET
                </span>
              </div>
              <div className="flex items-center gap-2">
                <code className="flex-1 text-white/80 text-sm font-mono bg-black/30 px-3 py-2 rounded truncate">
                  {solanaSignature || uniqueHash}
                </code>
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={copyHash}
                  className={`${isBeta ? "text-emerald-400 hover:bg-emerald-900/50" : "text-purple-400 hover:bg-purple-900/50"}`}
                  data-testid="button-copy-hash"
                >
                  {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                </Button>
                {solanaSignature && (
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={openExplorer}
                    className={`${isBeta ? "text-emerald-400 hover:bg-emerald-900/50" : "text-purple-400 hover:bg-purple-900/50"}`}
                    data-testid="button-view-explorer"
                  >
                    <ExternalLink className="w-4 h-4" />
                  </Button>
                )}
              </div>
            </div>

            <div className="flex gap-3">
              <Button
                className={`flex-1 ${
                  isBeta 
                    ? "bg-gradient-to-r from-emerald-500 to-cyan-500 hover:from-emerald-600 hover:to-cyan-600" 
                    : "bg-gradient-to-r from-purple-500 to-blue-500 hover:from-purple-600 hover:to-blue-600"
                } text-white font-bold`}
                onClick={handleDownload}
                disabled={isLoading || !!solanaSignature}
                data-testid="button-download-hallmark"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    {isBeta ? "Minting on Solana..." : "Redirecting to checkout..."}
                  </>
                ) : solanaSignature ? (
                  <>
                    <Check className="w-4 h-4 mr-2" />
                    Minted on Blockchain
                  </>
                ) : (
                  <>
                    <Download className="w-4 h-4 mr-2" />
                    {isBeta ? "Mint FREE NFT" : "Mint for $1.99"}
                  </>
                )}
              </Button>
              <Button
                variant="outline"
                className={`${
                  isBeta 
                    ? "border-emerald-500 text-emerald-400 hover:bg-emerald-900/50" 
                    : "border-purple-500 text-purple-400 hover:bg-purple-900/50"
                }`}
              >
                <Share2 className="w-4 h-4" />
              </Button>
            </div>

            {!isBeta && (
              <p className="text-center text-white/40 text-xs">
                NFT minted on Solana Mainnet • Permanently linked to your account
              </p>
            )}
            {isBeta && (
              <p className="text-center text-emerald-400/60 text-xs">
                ⭐ FREE Collector's Edition on Solana Mainnet • Thank you for testing!
              </p>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}

function StatCard({ 
  icon: Icon, 
  label, 
  value, 
  isBeta 
}: { 
  icon: React.ElementType; 
  label: string; 
  value: string;
  isBeta: boolean;
}) {
  return (
    <div className={`p-3 rounded-lg ${isBeta ? "bg-emerald-900/40" : "bg-purple-900/40"}`}>
      <div className="flex items-center gap-2 mb-1">
        <Icon className={`w-4 h-4 ${isBeta ? "text-emerald-400" : "text-purple-400"}`} />
        <span className="text-white/60 text-xs">{label}</span>
      </div>
      <div className="text-white font-bold text-lg">{value}</div>
    </div>
  );
}

export default HallmarkBadge;
