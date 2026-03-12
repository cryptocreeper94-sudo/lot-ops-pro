import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Shield, ExternalLink, Copy, Check, X, ZoomIn } from "lucide-react";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { QRCodeSVG } from "qrcode.react";
import { useToast } from "@/hooks/use-toast";

const SYSTEM_SERIAL = "000000000-01";
const SYSTEM_HASH = "LOTOPS-2024-ALPHA-7F3A9C2B";
const VERIFICATION_URL = "https://lotopspro.io/verify";

export function BlockchainCertifiedBadge() {
  const [isExpanded, setIsExpanded] = useState(false);
  const [copied, setCopied] = useState(false);
  const [qrExpanded, setQrExpanded] = useState(false);
  const { toast } = useToast();

  const copySerial = async () => {
    await navigator.clipboard.writeText(SYSTEM_SERIAL);
    setCopied(true);
    toast({ title: "Copied!", description: "Serial number copied to clipboard." });
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <>
      <motion.button
        onClick={() => setIsExpanded(true)}
        className="flex items-center gap-1.5 px-2 py-1 rounded-lg bg-gradient-to-r from-emerald-900/80 to-teal-900/80 border border-emerald-500/30 hover:border-emerald-400/50 transition-all"
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
        data-testid="button-blockchain-certified"
      >
        <Shield className="w-3.5 h-3.5 text-emerald-400" />
        <span className="text-[10px] font-bold text-emerald-300 uppercase tracking-wide hidden sm:inline">
          Certified
        </span>
        <span className="text-[9px] font-mono text-emerald-400/80 hidden md:inline">
          {SYSTEM_SERIAL}
        </span>
      </motion.button>

      <Dialog open={isExpanded} onOpenChange={setIsExpanded}>
        <DialogContent className="max-w-md p-0 overflow-hidden bg-gradient-to-br from-slate-950 via-emerald-950 to-teal-950 border-emerald-700/50">
          <div className="relative">
            <button
              onClick={() => setIsExpanded(false)}
              className="absolute top-3 right-3 z-10 p-1 rounded-full bg-white/10 hover:bg-white/20 transition-colors"
              data-testid="button-close-certification"
            >
              <X className="w-4 h-4 text-white/70" />
            </button>

            <div className="p-6 space-y-5">
              <div className="flex items-center gap-2">
                <div className="p-2 rounded-lg bg-emerald-500/20 border border-emerald-500/30">
                  <Shield className="w-5 h-5 text-emerald-400" />
                </div>
                <div>
                  <h2 className="text-lg font-bold text-white">Blockchain Certified</h2>
                  <p className="text-xs text-emerald-400">Lot Ops Pro Verified System</p>
                </div>
              </div>

              <div className="flex gap-4">
                <div className="flex-shrink-0">
                  <motion.img
                    src="/lotbuddy_catalog/lotbuddy_avatar_01_mixed_male_brown_average.png"
                    alt="Lot Buddy"
                    className="w-28 h-36 object-contain"
                    initial={{ x: -20, opacity: 0 }}
                    animate={{ x: 0, opacity: 1 }}
                    transition={{ delay: 0.2, type: "spring" }}
                  />
                </div>

                <div className="flex-1 space-y-2">
                  <motion.button
                    className="relative cursor-pointer"
                    initial={{ scale: 0.8, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    transition={{ delay: 0.3 }}
                    onClick={() => setQrExpanded(true)}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    data-testid="button-expand-qr"
                  >
                    <div className="absolute -inset-0.5 rounded-lg bg-gradient-to-r from-emerald-400 via-cyan-400 to-teal-400 opacity-60" />
                    <div className="relative bg-slate-900 p-1.5 rounded-lg">
                      <QRCodeSVG
                        value={`${VERIFICATION_URL}?serial=${SYSTEM_SERIAL}&hash=${SYSTEM_HASH}`}
                        size={80}
                        level="H"
                        includeMargin={false}
                        fgColor="#10b981"
                        bgColor="#0f172a"
                      />
                    </div>
                    <div className="absolute bottom-1 right-1 p-0.5 rounded bg-black/50">
                      <ZoomIn className="w-3 h-3 text-emerald-400" />
                    </div>
                  </motion.button>
                  
                  <p className="text-[10px] text-center text-emerald-300/70">
                    Tap to enlarge
                  </p>
                </div>
              </div>

              <div className="space-y-3">
                <div className="p-3 rounded-lg bg-black/40 border border-emerald-500/20">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-[10px] font-semibold text-emerald-400 uppercase">System Serial</span>
                    <span className="text-[9px] text-emerald-500/60">OFFICIAL</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <code className="flex-1 text-lg font-mono font-bold text-white tracking-wider">
                      {SYSTEM_SERIAL}
                    </code>
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={copySerial}
                      className="text-emerald-400 hover:bg-emerald-900/50 h-7 w-7 p-0"
                      data-testid="button-copy-serial"
                    >
                      {copied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                    </Button>
                  </div>
                </div>

                <div className="p-3 rounded-lg bg-black/40 border border-emerald-500/20">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-[10px] font-semibold text-emerald-400 uppercase">Hallmark Hash</span>
                    <span className="text-[9px] text-emerald-500/60">SOLANA VERIFIED</span>
                  </div>
                  <code className="text-xs font-mono text-white/80 break-all">
                    {SYSTEM_HASH}
                  </code>
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div className="p-2 rounded-lg bg-emerald-900/30 text-center">
                    <div className="text-lg font-bold text-white">v2.1</div>
                    <div className="text-[9px] text-emerald-400/70 uppercase">Version</div>
                  </div>
                  <div className="p-2 rounded-lg bg-emerald-900/30 text-center">
                    <div className="text-lg font-bold text-white">2024</div>
                    <div className="text-[9px] text-emerald-400/70 uppercase">Issued</div>
                  </div>
                </div>
              </div>

              <div className="flex items-center justify-center gap-4 pt-2">
                <img
                  src="/lotops-emblem-transparent.png"
                  alt="Lot Ops Pro"
                  className="w-12 h-12 object-contain"
                />
                <div className="text-center">
                  <div className="text-sm font-bold text-white">Lot Ops Pro</div>
                  <div className="text-[10px] text-emerald-400">Autonomous Lot Management</div>
                </div>
              </div>

              <Button
                className="w-full bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white font-semibold"
                onClick={() => window.open(VERIFICATION_URL, "_blank")}
                data-testid="button-verify-online"
              >
                <ExternalLink className="w-4 h-4 mr-2" />
                Verify Online
              </Button>

              <p className="text-center text-[10px] text-emerald-400/50">
                This system is registered on Solana blockchain for authenticity verification
              </p>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Expanded QR Code Overlay */}
      <AnimatePresence>
        {qrExpanded && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 backdrop-blur-sm"
            onClick={() => setQrExpanded(false)}
            data-testid="overlay-qr-expanded"
          >
            <motion.div
              initial={{ scale: 0.5, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.5, opacity: 0 }}
              transition={{ type: "spring", damping: 20 }}
              className="relative"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="absolute -inset-1 rounded-xl bg-gradient-to-r from-emerald-400 via-cyan-400 to-teal-400 opacity-70" />
              <div className="relative bg-slate-900 p-3 rounded-xl">
                <QRCodeSVG
                  value={`${VERIFICATION_URL}?serial=${SYSTEM_SERIAL}&hash=${SYSTEM_HASH}`}
                  size={220}
                  level="H"
                  includeMargin={false}
                  fgColor="#10b981"
                  bgColor="#0f172a"
                />
              </div>
              <p className="mt-3 text-center text-sm text-emerald-300">
                Scan to verify on Solana
              </p>
              <p className="text-center text-xs text-emerald-400/60 mt-1">
                Tap anywhere to close
              </p>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}

export default BlockchainCertifiedBadge;
