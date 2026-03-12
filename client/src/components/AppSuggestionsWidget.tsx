import { useState } from "react";
import { Lightbulb, Send, Star } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { useToast } from "@/hooks/use-toast";

interface AppSuggestionsWidgetProps {
  driverNumber?: string;
  driverName?: string;
}

export function AppSuggestionsWidget({ driverNumber, driverName }: AppSuggestionsWidgetProps) {
  const [open, setOpen] = useState(false);
  const [suggestion, setSuggestion] = useState("");
  const [category, setCategory] = useState<"feature" | "improvement" | "bug" | "other">("feature");
  const [isSending, setIsSending] = useState(false);
  const { toast } = useToast();

  const handleSend = async () => {
    if (!suggestion.trim()) {
      toast({
        title: "Suggestion is empty",
        description: "Please write your idea before sending",
        variant: "destructive"
      });
      return;
    }

    setIsSending(true);

    try {
      const response = await fetch('/api/suggestions/app', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          driverNumber: driverNumber || 'unknown',
          driverName: driverName || 'Unknown Driver',
          category,
          suggestion: suggestion.trim(),
          submittedFrom: window.location.pathname
        })
      });

      if (!response.ok) throw new Error('Failed to send suggestion');

      toast({
        title: "💡 Suggestion Sent!",
        description: "Thanks for helping make Lot Ops Pro better!",
      });

      setSuggestion("");
      setOpen(false);
    } catch (error) {
      toast({
        title: "Failed to send",
        description: "Please try again",
        variant: "destructive"
      });
    } finally {
      setIsSending(false);
    }
  };

  return (
    <>
      {/* Floating Suggestions Button - Bottom Left */}
      <Button
        variant="ghost"
        onClick={() => setOpen(true)}
        className="fixed bottom-4 left-4 bg-purple-600/90 hover:bg-purple-700 text-white rounded-full p-3 shadow-lg z-40 animate-pulse"
        data-testid="button-app-suggestions"
        title="Suggest App Improvements"
      >
        <Lightbulb className="h-5 w-5" />
      </Button>

      {/* Suggestions Dialog */}
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="bg-gradient-to-br from-purple-950 to-purple-900 border-purple-500">
          <DialogHeader>
            <DialogTitle className="text-white text-xl flex items-center gap-2">
              <Lightbulb className="h-6 w-6 text-yellow-400" />
              Improve Lot Ops Pro
            </DialogTitle>
            <DialogDescription className="text-purple-200">
              Have an idea to make this app better? We want to hear it!
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-2">
            {/* Category Selection */}
            <div className="space-y-2">
              <Label className="text-white">What type of suggestion?</Label>
              <RadioGroup value={category} onValueChange={(val: any) => setCategory(val)}>
                <div className="flex items-center space-x-2 bg-purple-900/30 p-2 rounded">
                  <RadioGroupItem value="feature" id="feature" />
                  <Label htmlFor="feature" className="text-white cursor-pointer flex-1">
                    <Star className="h-4 w-4 inline mr-1 text-yellow-400" />
                    New Feature - Something you'd like to see added
                  </Label>
                </div>
                <div className="flex items-center space-x-2 bg-purple-900/30 p-2 rounded">
                  <RadioGroupItem value="improvement" id="improvement" />
                  <Label htmlFor="improvement" className="text-white cursor-pointer flex-1">
                    ✨ Improvement - Make existing features better
                  </Label>
                </div>
                <div className="flex items-center space-x-2 bg-purple-900/30 p-2 rounded">
                  <RadioGroupItem value="bug" id="bug" />
                  <Label htmlFor="bug" className="text-white cursor-pointer flex-1">
                    🐛 Bug Report - Something's not working right
                  </Label>
                </div>
                <div className="flex items-center space-x-2 bg-purple-900/30 p-2 rounded">
                  <RadioGroupItem value="other" id="other" />
                  <Label htmlFor="other" className="text-white cursor-pointer flex-1">
                    💭 Other - General feedback or ideas
                  </Label>
                </div>
              </RadioGroup>
            </div>

            {/* Suggestion Text */}
            <div className="space-y-2">
              <Label htmlFor="suggestion" className="text-white">Your Idea</Label>
              <Textarea
                id="suggestion"
                placeholder="Example: It would be great if the scanner could also show the car's color..."
                value={suggestion}
                onChange={(e) => setSuggestion(e.target.value)}
                className="min-h-[120px] bg-purple-900/30 border-purple-600 text-white placeholder:text-purple-300"
                disabled={isSending}
              />
              <p className="text-xs text-purple-300">
                No idea is too small! Every suggestion helps make this tool better for everyone.
              </p>
            </div>
          </div>

          <DialogFooter>
            <Button 
              variant="outline" 
              onClick={() => setOpen(false)}
              disabled={isSending}
              className="border-purple-400 text-purple-200 hover:bg-purple-900"
            >
              Cancel
            </Button>
            <Button 
              onClick={handleSend}
              disabled={isSending || !suggestion.trim()}
              className="bg-purple-600 hover:bg-purple-700 text-white font-semibold"
              data-testid="button-send-suggestion"
            >
              {isSending ? (
                <span className="flex items-center gap-2">
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  Sending...
                </span>
              ) : (
                <span className="flex items-center gap-2">
                  <Send className="h-4 w-4" />
                  Send Suggestion
                </span>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
