import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { X, Lightbulb, AlertTriangle, TrendingUp } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface AiSuggestion {
  id: number;
  suggestionType: string;
  priority: string;
  title: string;
  message: string;
  targetLot: string | null;
  isRead: boolean;
  isDismissed: boolean;
  createdAt: string;
  expiresAt: string | null;
}

export function AiSuggestions() {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: suggestions = [], isLoading } = useQuery<AiSuggestion[]>({
    queryKey: ["/api/suggestions"],
    refetchInterval: 30000, // Refresh every 30 seconds
  });

  const generateMutation = useMutation({
    mutationFn: async () => {
      const res = await fetch("/api/suggestions/generate", { method: "POST" });
      if (!res.ok) throw new Error("Failed to generate suggestions");
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/suggestions"] });
      toast({ title: "Suggestions Generated", description: "AI analyzed current lot capacity" });
    },
  });

  const dismissMutation = useMutation({
    mutationFn: async (id: number) => {
      const res = await fetch(`/api/suggestions/${id}/dismiss`, { method: "PATCH" });
      if (!res.ok) throw new Error("Failed to dismiss");
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/suggestions"] });
    },
  });

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "critical":
        return "bg-red-100 text-red-800 border-red-200";
      case "high":
        return "bg-orange-100 text-orange-800 border-orange-200";
      default:
        return "bg-blue-100 text-blue-800 border-blue-200";
    }
  };

  const getIcon = (type: string) => {
    switch (type) {
      case "overflow_alert":
        return <AlertTriangle className="h-4 w-4" />;
      case "efficiency_tip":
        return <TrendingUp className="h-4 w-4" />;
      default:
        return <Lightbulb className="h-4 w-4" />;
    }
  };

  if (isLoading) {
    return (
      <Card className="p-3 bg-white/50">
        <p className="text-xs text-gray-500">Loading suggestions...</p>
      </Card>
    );
  }

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-medium flex items-center gap-1.5">
          <Lightbulb className="h-4 w-4 text-blue-600" />
          AI Lot Suggestions
        </h3>
        <Button
          size="sm"
          variant="outline"
          onClick={() => generateMutation.mutate()}
          disabled={generateMutation.isPending}
          className="h-7 text-xs"
          data-testid="button-generate-suggestions"
        >
          Refresh
        </Button>
      </div>

      {suggestions.length === 0 ? (
        <Card className="p-3 bg-green-50 border-green-200">
          <p className="text-xs text-green-700">All lots operating within optimal capacity</p>
        </Card>
      ) : (
        <div className="space-y-2">
          {suggestions.map((suggestion) => (
            <Card
              key={suggestion.id}
              className={`p-3 ${getPriorityColor(suggestion.priority)}`}
              data-testid={`suggestion-${suggestion.id}`}
            >
              <div className="flex items-start justify-between gap-2">
                <div className="flex items-start gap-2 flex-1 min-w-0">
                  {getIcon(suggestion.suggestionType)}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-1.5 mb-0.5">
                      <p className="text-xs font-semibold truncate" data-testid={`suggestion-title-${suggestion.id}`}>
                        {suggestion.title}
                      </p>
                      {suggestion.priority === "critical" && (
                        <Badge className="h-4 px-1 text-[10px] bg-red-600">URGENT</Badge>
                      )}
                    </div>
                    <p className="text-xs leading-relaxed" data-testid={`suggestion-message-${suggestion.id}`}>
                      {suggestion.message}
                    </p>
                    {suggestion.targetLot && (
                      <p className="text-[10px] text-gray-600 mt-1">
                        Target: Lot {suggestion.targetLot}
                      </p>
                    )}
                  </div>
                </div>
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => dismissMutation.mutate(suggestion.id)}
                  className="h-6 w-6 p-0 flex-shrink-0"
                  data-testid={`button-dismiss-${suggestion.id}`}
                >
                  <X className="h-3 w-3" />
                </Button>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
