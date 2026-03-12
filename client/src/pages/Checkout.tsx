import { useState, useEffect } from "react";
import { useLocation, useRoute } from "wouter";
import { BentoGrid, BentoTile } from "@/components/ui/bento-grid";
import { PremiumButton } from "@/components/ui/premium-button";
import { CheckCircle2, AlertCircle, Loader2, ArrowLeft, Sparkles } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

export default function Checkout() {
  const [_, setLocation] = useLocation();
  const [match, params] = useRoute("/checkout/:status");
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (params?.status === "success") {
      toast({
        title: "Subscription Activated!",
        description: "Your subscription is now active. Welcome to Lot Ops Pro!"
      });
      setTimeout(() => setLocation("/dashboard"), 3000);
    } else if (params?.status === "cancel") {
      toast({
        title: "Checkout Cancelled",
        description: "No charge was made. Feel free to return anytime."
      });
    }
  }, [params?.status]);

  const handleCheckout = async (priceId: string, tierName: string) => {
    setLoading(true);
    try {
      const response = await fetch("/api/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ priceId })
      });

      const data = await response.json();
      if (data.url) {
        window.location.href = data.url;
      } else {
        toast({ title: "Error", description: "Could not start checkout" });
      }
    } catch (error) {
      toast({ title: "Error", description: "Failed to process checkout" });
    } finally {
      setLoading(false);
    }
  };

  if (params?.status === "success") {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-900 to-slate-900 flex items-center justify-center p-4">
        <BentoGrid columns={1} gap="md" className="max-w-md w-full">
          <BentoTile
            variant="gradient"
            size="lg"
            sparkle
            interactive={false}
            data-testid="tile-checkout-success"
          >
            <div className="flex flex-col items-center justify-center text-center space-y-4 py-4">
              <div className="p-4 rounded-full bg-green-500/20 border border-green-500/30">
                <CheckCircle2 className="h-12 w-12 text-green-400" data-testid="icon-success" />
              </div>
              <h1 className="text-2xl font-bold text-white" data-testid="text-success-title">
                Payment Successful!
              </h1>
              <p className="text-green-100/80" data-testid="text-success-message">
                Your subscription has been activated. Redirecting...
              </p>
              <div className="flex items-center gap-2 text-green-300/60 text-sm">
                <Loader2 className="h-4 w-4 animate-spin" />
                <span>Redirecting to dashboard...</span>
              </div>
            </div>
          </BentoTile>
        </BentoGrid>
      </div>
    );
  }

  if (params?.status === "cancel") {
    return (
      <div className="min-h-screen bg-gradient-to-br from-orange-900 to-slate-900 flex items-center justify-center p-4">
        <BentoGrid columns={1} gap="md" className="max-w-md w-full">
          <BentoTile
            variant="premium"
            size="lg"
            sparkle
            interactive={false}
            data-testid="tile-checkout-cancel"
          >
            <div className="flex flex-col items-center justify-center text-center space-y-4 py-4">
              <div className="p-4 rounded-full bg-orange-500/20 border border-orange-500/30">
                <AlertCircle className="h-12 w-12 text-orange-400" data-testid="icon-cancel" />
              </div>
              <h1 className="text-2xl font-bold text-white" data-testid="text-cancel-title">
                Checkout Cancelled
              </h1>
              <p className="text-orange-100/80" data-testid="text-cancel-message">
                No charges have been made. You can try again anytime.
              </p>
              <PremiumButton
                variant="gradient"
                size="lg"
                icon={<ArrowLeft className="h-4 w-4" />}
                onClick={() => setLocation("/pricing")}
                className="w-full mt-2"
                data-testid="button-back-to-pricing"
              >
                Back to Pricing
              </PremiumButton>
            </div>
          </BentoTile>
        </BentoGrid>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 to-blue-900 flex items-center justify-center p-4">
      <BentoGrid columns={1} gap="md" className="max-w-md w-full">
        <BentoTile
          variant="glow"
          size="lg"
          sparkle
          interactive={false}
          data-testid="tile-checkout-processing"
        >
          <div className="flex flex-col items-center justify-center text-center space-y-4 py-6">
            <div className="relative">
              <div className="p-4 rounded-full bg-blue-500/20 border border-blue-500/30">
                <Loader2 className="h-10 w-10 animate-spin text-blue-400" data-testid="icon-processing" />
              </div>
              <Sparkles className="absolute -top-1 -right-1 h-5 w-5 text-amber-400 animate-pulse" />
            </div>
            <h1 className="text-xl font-bold text-white" data-testid="text-processing-title">
              Processing...
            </h1>
            <p className="text-blue-100/80" data-testid="text-processing-message">
              Redirecting to payment processor
            </p>
          </div>
        </BentoTile>
      </BentoGrid>
    </div>
  );
}
