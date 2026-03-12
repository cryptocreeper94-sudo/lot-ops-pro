import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { AlertCircle, CheckCircle2, Clock } from "lucide-react";

interface Integration {
  name: string;
  status: "configured" | "pending";
  requiredKey?: string;
  requiredKeys?: string[];
}

export function IntegrationStatus() {
  const [integrations, setIntegrations] = useState<Record<string, Integration>>({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/integrations/status")
      .then(res => res.json())
      .then(data => {
        setIntegrations(data);
        setLoading(false);
      })
      .catch(err => {
        console.error("Failed to fetch integration status:", err);
        setLoading(false);
      });
  }, []);

  if (loading) {
    return <div className="text-slate-500">Loading integrations...</div>;
  }

  return (
    <div className="space-y-3">
      <h3 className="text-lg font-semibold text-white mb-4">🔗 Integration Status</h3>
      
      {Object.entries(integrations).map(([key, integration]) => (
        <Card 
          key={key}
          className={`bg-white/5 border ${
            integration.status === "configured" 
              ? "border-green-500/50" 
              : "border-yellow-500/50"
          }`}
        >
          <CardContent className="p-4 flex items-center justify-between">
            <div className="flex items-center gap-3">
              {integration.status === "configured" ? (
                <CheckCircle2 className="h-5 w-5 text-green-500" />
              ) : (
                <Clock className="h-5 w-5 text-yellow-500" />
              )}
              <div>
                <p className="text-white font-medium">{integration.name}</p>
                <p className="text-xs text-slate-400">
                  {integration.requiredKey || integration.requiredKeys?.join(", ")}
                </p>
              </div>
            </div>
            <Badge 
              variant={integration.status === "configured" ? "default" : "secondary"}
              className={
                integration.status === "configured"
                  ? "bg-green-600 hover:bg-green-700"
                  : "bg-yellow-600 hover:bg-yellow-700"
              }
            >
              {integration.status === "configured" ? "Active" : "Pending Keys"}
            </Badge>
          </CardContent>
        </Card>
      ))}

      <div className="bg-blue-500/10 border border-blue-500/50 rounded-lg p-4 mt-4">
        <div className="flex gap-2">
          <AlertCircle className="h-5 w-5 text-blue-400 flex-shrink-0 mt-0.5" />
          <div>
            <p className="text-sm text-blue-300 font-medium">See INTEGRATION_KEYS_CHECKLIST.md</p>
            <p className="text-xs text-blue-200 mt-1">
              Check the file in your Replit repository for instructions on getting API keys
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
