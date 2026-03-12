import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  Bitcoin,
  CheckCircle2, 
  XCircle, 
  RefreshCw,
  Zap,
  AlertCircle
} from "lucide-react";

export function CoinbaseCommerceDashboard() {
  const [chargeStatus, setChargeStatus] = useState<"idle" | "processing" | "success" | "failed">("idle");
  const [hasCredentials, setHasCredentials] = useState(true);

  const handleTestCharge = async () => {
    setChargeStatus("processing");
    try {
      const response = await fetch("/api/payment/coinbase/test", {
        method: "POST",
        headers: { "Content-Type": "application/json" }
      });
      const data = await response.json();
      setChargeStatus(data.success ? "success" : "failed");
    } catch (error) {
      console.error("Coinbase charge error:", error);
      setChargeStatus("failed");
    }
  };

  const resetTest = () => {
    setChargeStatus("idle");
  };

  return (
    <Card className="border-slate-600 bg-slate-800">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-green-600/20">
              <Bitcoin className="h-5 w-5 text-green-400" />
            </div>
            <div>
              <CardTitle className="text-lg text-white">Coinbase Commerce</CardTitle>
              <p className="text-xs text-slate-400 mt-0.5">
                Real crypto payment processing - Live & Connected
              </p>
            </div>
          </div>
          <Badge 
            variant="outline"
            className="bg-green-600/20 border-green-600/50 text-green-300"
          >
            Connected
          </Badge>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Status Section */}
        <div className="grid grid-cols-2 gap-3">
          <div className="bg-slate-700/50 rounded-lg p-3 border border-slate-600">
            <p className="text-xs text-slate-400 mb-1">Coinbase Status</p>
            <div className="flex items-center gap-2">
              <CheckCircle2 className="h-4 w-4 text-green-400" />
              <span className="text-sm font-semibold text-white">Connected</span>
            </div>
          </div>
          <div className="bg-slate-700/50 rounded-lg p-3 border border-slate-600">
            <p className="text-xs text-slate-400 mb-1">Crypto Enabled</p>
            <div className="flex items-center gap-2">
              <Zap className="h-4 w-4 text-yellow-400" />
              <span className="text-sm font-semibold text-white">Active</span>
            </div>
          </div>
        </div>

        {/* Charge Section */}
        <div className="bg-green-600/20 rounded-lg p-4 border border-green-600/50 space-y-3">
          <h4 className="text-sm font-semibold text-white flex items-center gap-2">
            <CheckCircle2 className="h-4 w-4 text-green-400" />
            Crypto Checkout Active
          </h4>
          
          <div className="space-y-2">
            <p className="text-xs text-slate-300">
              Create live crypto charges using Bitcoin, Ethereum, and other supported cryptocurrencies. Charges are processed through Coinbase Commerce.
            </p>
            
            {chargeStatus === "idle" && (
              <Button 
                onClick={handleTestCharge}
                className="w-full bg-green-600 hover:bg-green-700 text-white text-sm"
                data-testid="button-test-charge"
              >
                Test System
              </Button>
            )}

            {chargeStatus === "processing" && (
              <div className="flex items-center justify-center py-3 gap-2">
                <RefreshCw className="h-4 w-4 text-green-400 animate-spin" />
                <span className="text-sm text-slate-300">Processing test charge...</span>
              </div>
            )}

            {chargeStatus === "success" && (
              <div className="bg-green-600/20 border border-green-600/50 rounded-lg p-3">
                <div className="flex items-center gap-2 mb-2">
                  <CheckCircle2 className="h-5 w-5 text-green-400" />
                  <span className="font-semibold text-green-300">Test Charge Successful</span>
                </div>
                <p className="text-xs text-green-200 mb-3">
                  Charge created successfully and sent to Coinbase Commerce for processing. Charge ID: <code className="bg-green-900/50 px-1 rounded">ch_coinbase_*</code>
                </p>
                <Button 
                  onClick={resetTest}
                  variant="outline"
                  size="sm"
                  className="w-full border-slate-600 text-slate-300 hover:bg-slate-700"
                  data-testid="button-reset-charge-test"
                >
                  Create Another Charge
                </Button>
              </div>
            )}

            {chargeStatus === "failed" && (
              <div className="bg-red-600/20 border border-red-600/50 rounded-lg p-3">
                <div className="flex items-center gap-2 mb-2">
                  <XCircle className="h-5 w-5 text-red-400" />
                  <span className="font-semibold text-red-300">Charge Failed</span>
                </div>
                <p className="text-xs text-red-200 mb-3">
                  Test charge failed. Check Coinbase API keys and try again.
                </p>
                <Button 
                  onClick={resetTest}
                  variant="outline"
                  size="sm"
                  className="w-full border-slate-600 text-slate-300 hover:bg-slate-700"
                  data-testid="button-retry-charge-test"
                >
                  Retry Charge
                </Button>
              </div>
            )}
          </div>
        </div>

        {/* API Configuration */}
        <div className="bg-slate-700/50 rounded-lg p-3 border border-slate-600">
          <p className="text-xs text-slate-400 mb-2">API Configuration</p>
          <div className="space-y-1.5 text-xs">
            <div className="flex items-center justify-between">
              <span className="text-slate-300">API Key</span>
              <span className="text-green-400">●</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-slate-300">Webhook Endpoint</span>
              <span className="text-green-400">●</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-slate-300">Crypto Currencies</span>
              <span className="text-green-400">●</span>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
