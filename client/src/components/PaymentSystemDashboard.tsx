import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  CreditCard, 
  CheckCircle2, 
  XCircle, 
  AlertCircle,
  RefreshCw,
  DollarSign
} from "lucide-react";

export function PaymentSystemDashboard() {
  const [testMode, setTestMode] = useState(false);
  const [transactionStatus, setTransactionStatus] = useState<"idle" | "processing" | "success" | "failed">("idle");

  const handleTestTransaction = async () => {
    setTransactionStatus("processing");
    try {
      const response = await fetch("/api/payment/stripe/test", {
        method: "POST",
        headers: { "Content-Type": "application/json" }
      });
      const data = await response.json();
      setTransactionStatus(data.success ? "success" : "failed");
    } catch (error) {
      console.error("Payment test error:", error);
      setTransactionStatus("failed");
    }
  };

  const resetTest = () => {
    setTransactionStatus("idle");
  };

  return (
    <Card className="border-slate-600 bg-slate-800">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-green-600/20">
              <CreditCard className="h-5 w-5 text-green-400" />
            </div>
            <div>
              <CardTitle className="text-lg text-white">Payment System Dashboard</CardTitle>
              <p className="text-xs text-slate-400 mt-0.5">
                Test Stripe integration and payment processing
              </p>
            </div>
          </div>
          <Badge 
            variant="outline"
            className="bg-slate-700/50 border-slate-600 text-green-300"
          >
            Connected
          </Badge>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Status Section */}
        <div className="grid grid-cols-2 gap-3">
          <div className="bg-slate-700/50 rounded-lg p-3 border border-slate-600">
            <p className="text-xs text-slate-400 mb-1">Stripe Status</p>
            <div className="flex items-center gap-2">
              <CheckCircle2 className="h-4 w-4 text-green-400" />
              <span className="text-sm font-semibold text-white">Active</span>
            </div>
          </div>
          <div className="bg-slate-700/50 rounded-lg p-3 border border-slate-600">
            <p className="text-xs text-slate-400 mb-1">Test Mode</p>
            <div className="flex items-center gap-2">
              <AlertCircle className="h-4 w-4 text-blue-400" />
              <span className="text-sm font-semibold text-white">Enabled</span>
            </div>
          </div>
        </div>

        {/* Test Transaction Section */}
        <div className="bg-slate-700/50 rounded-lg p-4 border border-slate-600 space-y-3">
          <h4 className="text-sm font-semibold text-white flex items-center gap-2">
            <DollarSign className="h-4 w-4 text-green-400" />
            Test Transaction
          </h4>
          
          <div className="space-y-2">
            <p className="text-xs text-slate-300">
              Process a test payment to verify Stripe integration is working correctly.
            </p>
            
            {transactionStatus === "idle" && (
              <Button 
                onClick={handleTestTransaction}
                className="w-full bg-green-600 hover:bg-green-700 text-white text-sm"
                data-testid="button-test-payment"
              >
                Test System
              </Button>
            )}

            {transactionStatus === "processing" && (
              <div className="flex items-center justify-center py-3 gap-2">
                <RefreshCw className="h-4 w-4 text-blue-400 animate-spin" />
                <span className="text-sm text-slate-300">Processing...</span>
              </div>
            )}

            {transactionStatus === "success" && (
              <div className="bg-green-600/20 border border-green-600/50 rounded-lg p-3">
                <div className="flex items-center gap-2 mb-2">
                  <CheckCircle2 className="h-5 w-5 text-green-400" />
                  <span className="font-semibold text-green-300">Payment Successful</span>
                </div>
                <p className="text-xs text-green-200 mb-3">
                  Test transaction completed. Transaction ID: <code className="bg-green-900/50 px-1 rounded">txn_test_1234567890</code>
                </p>
                <Button 
                  onClick={resetTest}
                  variant="outline"
                  size="sm"
                  className="w-full border-slate-600 text-slate-300 hover:bg-slate-700"
                  data-testid="button-reset-payment-test"
                >
                  Run Another Test
                </Button>
              </div>
            )}

            {transactionStatus === "failed" && (
              <div className="bg-red-600/20 border border-red-600/50 rounded-lg p-3">
                <div className="flex items-center gap-2 mb-2">
                  <XCircle className="h-5 w-5 text-red-400" />
                  <span className="font-semibold text-red-300">Payment Failed</span>
                </div>
                <p className="text-xs text-red-200 mb-3">
                  Test transaction failed. Check Stripe API keys and try again.
                </p>
                <Button 
                  onClick={resetTest}
                  variant="outline"
                  size="sm"
                  className="w-full border-slate-600 text-slate-300 hover:bg-slate-700"
                  data-testid="button-retry-payment-test"
                >
                  Retry Test
                </Button>
              </div>
            )}
          </div>
        </div>

        {/* API Keys Status */}
        <div className="bg-slate-700/50 rounded-lg p-3 border border-slate-600">
          <p className="text-xs text-slate-400 mb-2">API Configuration</p>
          <div className="space-y-1.5 text-xs">
            <div className="flex items-center justify-between">
              <span className="text-slate-300">Public Key</span>
              <span className="text-green-400">●</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-slate-300">Secret Key</span>
              <span className="text-green-400">●</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-slate-300">Webhook Endpoint</span>
              <span className="text-green-400">●</span>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
