import { useEffect, useState } from 'react';
import { useLocation } from 'wouter';
import { motion } from 'framer-motion';
import { Check, Loader2, ExternalLink, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function BadgeSuccess() {
  const [, setLocation] = useLocation();
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading');
  const [error, setError] = useState<string | null>(null);
  const [badgeData, setBadgeData] = useState<{
    hallmarkHash?: string;
    signature?: string;
    explorerUrl?: string;
  } | null>(null);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const sessionId = params.get('session_id');

    if (!sessionId) {
      setStatus('error');
      setError('No payment session found');
      return;
    }

    async function completeBadgePurchase() {
      try {
        const response = await fetch('/api/solana/complete-badge-purchase', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          credentials: 'include',
          body: JSON.stringify({ sessionId })
        });

        if (!response.ok) {
          const err = await response.json();
          throw new Error(err.error || 'Failed to complete badge purchase');
        }

        const data = await response.json();
        setBadgeData({
          hallmarkHash: data.hallmarkHash,
          signature: data.signature,
          explorerUrl: data.explorerUrl
        });
        setStatus('success');
      } catch (err: any) {
        setStatus('error');
        setError(err.message);
      }
    }

    completeBadgePurchase();
  }, []);

  if (status === 'loading') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-950 via-indigo-900 to-blue-950 flex items-center justify-center p-4">
        <motion.div
          className="text-center"
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
        >
          <Loader2 className="w-16 h-16 text-purple-400 animate-spin mx-auto mb-4" />
          <h1 className="text-2xl font-bold text-white mb-2">Minting Your NFT Badge...</h1>
          <p className="text-purple-300">Please wait while we mint your badge on Solana Mainnet</p>
        </motion.div>
      </div>
    );
  }

  if (status === 'error') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-red-950 via-red-900 to-red-950 flex items-center justify-center p-4">
        <motion.div
          className="text-center max-w-md"
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
        >
          <AlertCircle className="w-16 h-16 text-red-400 mx-auto mb-4" />
          <h1 className="text-2xl font-bold text-white mb-2">Something Went Wrong</h1>
          <p className="text-red-300 mb-6">{error}</p>
          <Button
            onClick={() => setLocation('/')}
            className="bg-red-600 hover:bg-red-700"
            data-testid="button-go-home"
          >
            Return Home
          </Button>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-950 via-indigo-900 to-blue-950 flex items-center justify-center p-4">
      <motion.div
        className="text-center max-w-md"
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
      >
        <motion.div
          className="w-20 h-20 bg-green-500 rounded-full flex items-center justify-center mx-auto mb-6"
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ delay: 0.2, type: 'spring' }}
        >
          <Check className="w-10 h-10 text-white" />
        </motion.div>
        
        <h1 className="text-3xl font-bold text-white mb-2">NFT Badge Minted!</h1>
        <p className="text-purple-300 mb-6">
          Your verified Hallmark Badge is now permanently recorded on Solana Mainnet
        </p>

        {badgeData?.signature && (
          <div className="bg-black/30 rounded-lg p-4 mb-6">
            <p className="text-sm text-purple-400 mb-2">Transaction Signature</p>
            <code className="text-xs text-white/80 break-all">
              {badgeData.signature}
            </code>
          </div>
        )}

        <div className="flex flex-col gap-3">
          {badgeData?.signature && (
            <Button
              onClick={() => window.open(`https://explorer.solana.com/tx/${badgeData.signature}`, '_blank')}
              className="bg-purple-600 hover:bg-purple-700"
              data-testid="button-view-explorer"
            >
              <ExternalLink className="w-4 h-4 mr-2" />
              View on Solana Explorer
            </Button>
          )}
          
          <Button
            onClick={() => setLocation('/')}
            variant="outline"
            className="border-purple-500 text-purple-300 hover:bg-purple-900/50"
            data-testid="button-return-home"
          >
            Return to Dashboard
          </Button>
        </div>
      </motion.div>
    </div>
  );
}
