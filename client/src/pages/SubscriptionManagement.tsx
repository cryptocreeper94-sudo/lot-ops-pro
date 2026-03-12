import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { AlertCircle, CreditCard, Calendar, LogOut } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { NavigationControl } from "@/components/NavigationControl";

export default function SubscriptionManagement() {
  const { toast } = useToast();
  const [subscription, setSubscription] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchSubscription();
  }, []);

  const fetchSubscription = async () => {
    try {
      const response = await fetch("/api/subscription");
      const data = await response.json();
      setSubscription(data.subscription);
    } catch (error) {
      console.error("Failed to fetch subscription:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleManagePortal = async () => {
    try {
      const response = await fetch("/api/customer-portal", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ returnUrl: window.location.href })
      });

      const data = await response.json();
      if (data.url) {
        window.location.href = data.url;
      }
    } catch (error) {
      toast({ title: "Error", description: "Could not open billing portal" });
    }
  };

  if (loading) {
    return <div className="p-4">Loading subscription info...</div>;
  }

  if (!subscription) {
    return (
      <div className="p-4 space-y-4 max-w-2xl mx-auto">
        <Card className="bg-blue-50 border-blue-200">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-blue-900">
              <AlertCircle className="h-5 w-5" />
              No Active Subscription
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-blue-800 mb-4">
              You're currently using the free demo mode. To unlock all features, choose a subscription plan.
            </p>
            <Button onClick={() => window.location.href = "/pricing"}>
              View Pricing Plans
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  const getTierColor = (status: string) => {
    switch (status) {
      case "active": return "bg-green-600";
      case "past_due": return "bg-orange-600";
      case "canceled": return "bg-red-600";
      default: return "bg-slate-600";
    }
  };

  const formatDate = (timestamp: number) => {
    return new Date(timestamp * 1000).toLocaleDateString();
  };

  return (
    <div className="p-4 space-y-4 max-w-2xl mx-auto">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Your Subscription</CardTitle>
            <Badge className={getTierColor(subscription.status)}>
              {subscription.status.toUpperCase()}
            </Badge>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-sm text-slate-600">Plan</p>
              <p className="text-lg font-semibold">{subscription.plan?.product?.name || 'Standard'}</p>
            </div>
            <div>
              <p className="text-sm text-slate-600">Billing Cycle</p>
              <p className="text-lg font-semibold">
                ${(subscription.plan?.amount / 100).toFixed(2)} / {subscription.plan?.interval}
              </p>
            </div>
            <div>
              <p className="text-sm text-slate-600">Current Period</p>
              <p className="text-sm font-mono">
                {formatDate(subscription.current_period_start)} - {formatDate(subscription.current_period_end)}
              </p>
            </div>
            <div>
              <p className="text-sm text-slate-600">Next Billing Date</p>
              <p className="text-sm font-mono">{formatDate(subscription.current_period_end)}</p>
            </div>
          </div>

          <div className="border-t pt-4 space-y-2">
            <Button onClick={handleManagePortal} className="w-full" variant="outline">
              <CreditCard className="h-4 w-4 mr-2" />
              Manage Billing
            </Button>
            <p className="text-xs text-slate-500 text-center">
              Update payment method, download invoices, or cancel subscription
            </p>
          </div>
        </CardContent>
      </Card>

      {subscription.status === "past_due" && (
        <Card className="bg-orange-50 border-orange-200">
          <CardContent className="pt-6">
            <p className="text-orange-900">
              Your payment failed. Please update your billing information to avoid service interruption.
            </p>
            <Button onClick={handleManagePortal} className="mt-4" variant="outline">
              Update Payment Method
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
