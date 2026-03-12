import { useState } from "react";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { Palette, Loader2 } from "lucide-react";

interface ThemeRequestDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  userId: string;
  userName: string;
}

export function ThemeRequestDialog({ open, onOpenChange, userId, userName }: ThemeRequestDialogProps) {
  const { toast } = useToast();
  const [submitting, setSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    teamName: "",
    sport: "",
    primaryColor: "",
    secondaryColor: "",
    logoUrl: "",
    notes: ""
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.teamName || !formData.sport) {
      toast({
        title: "Missing Information",
        description: "Please tell us your team name and which sport",
        variant: "destructive"
      });
      return;
    }

    setSubmitting(true);

    try {
      const response = await fetch("/api/theme-requests", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId,
          userName,
          ...formData
        })
      });

      if (!response.ok) throw new Error("Failed to submit request");

      toast({
        title: "✓ Got it!",
        description: `Your ${formData.teamName} theme request has been submitted. We'll get it added soon!`
      });

      // Reset form
      setFormData({
        teamName: "",
        sport: "",
        primaryColor: "",
        secondaryColor: "",
        logoUrl: "",
        notes: ""
      });

      onOpenChange(false);
    } catch (error) {
      console.error("Failed to submit theme request:", error);
      toast({
        title: "Submission Failed",
        description: "Please try again later",
        variant: "destructive"
      });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Palette className="h-5 w-5 text-blue-600" />
            Request Custom Theme
          </DialogTitle>
          <DialogDescription>
            Tell us your favorite team and we'll add it to your theme options!
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 mb-2">
            <p className="text-sm text-blue-900 font-medium">📝 Just tell us your team and colors!</p>
            <p className="text-xs text-blue-700 mt-1">
              We'll handle the rest. Examples: "USC Trojans - Red and Gold" or "Ole Miss - Navy and Red"
            </p>
          </div>

          <div>
            <Label htmlFor="teamName">What's your team? *</Label>
            <Input
              id="teamName"
              value={formData.teamName}
              onChange={(e) => setFormData({ ...formData, teamName: e.target.value })}
              placeholder="Mississippi State Bulldogs"
              className="mt-1"
              required
              data-testid="input-team-name"
            />
          </div>

          <div>
            <Label htmlFor="sport">Which sport? *</Label>
            <Select value={formData.sport} onValueChange={(value) => setFormData({ ...formData, sport: value })}>
              <SelectTrigger className="mt-1" data-testid="select-sport">
                <SelectValue placeholder="Pick one" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="CFB">🏈 College Football</SelectItem>
                <SelectItem value="CBB">🏀 College Basketball</SelectItem>
                <SelectItem value="NFL">🏈 NFL</SelectItem>
                <SelectItem value="MLB">⚾ MLB</SelectItem>
                <SelectItem value="NBA">🏀 NBA</SelectItem>
                <SelectItem value="NHL">🏒 NHL</SelectItem>
                <SelectItem value="Golf">⛳ Golf</SelectItem>
                <SelectItem value="Soccer">⚽ Soccer</SelectItem>
                <SelectItem value="Other">🎯 Other</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label htmlFor="primaryColor">What are the team colors?</Label>
            <Input
              id="primaryColor"
              value={formData.primaryColor}
              onChange={(e) => setFormData({ ...formData, primaryColor: e.target.value })}
              placeholder="Maroon and White"
              className="mt-1"
              data-testid="input-primary-color"
            />
            <p className="text-xs text-slate-500 mt-1">
              Just type them in plain English - we'll figure it out!
            </p>
          </div>

          <div>
            <Label htmlFor="notes">Anything else we should know? (Optional)</Label>
            <Textarea
              id="notes"
              value={formData.notes}
              onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
              placeholder="Example: 'Use the bulldog logo' or 'Make it really dark'"
              className="mt-1 h-16"
              data-testid="textarea-notes"
            />
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={submitting}
              data-testid="button-cancel"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={submitting}
              data-testid="button-submit-request"
            >
              {submitting && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
              Submit Request
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
