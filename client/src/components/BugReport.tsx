import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Bug, Send, CheckCircle2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface BugReportButtonProps {
  variant?: "floating" | "inline";
}

export function BugReportButton({ variant = "inline" }: BugReportButtonProps) {
  const [open, setOpen] = useState(false);
  const [name, setName] = useState("");
  const [issue, setIssue] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();

  const handleSubmit = async () => {
    if (!name.trim() || !issue.trim()) {
      toast({
        title: "Missing Information",
        description: "Please fill in your name and describe the issue",
        variant: "destructive"
      });
      return;
    }

    setIsSubmitting(true);

    // Create mailto link with bug report
    const subject = encodeURIComponent(`[Lot Ops Pro] Bug Report from ${name}`);
    const body = encodeURIComponent(`Name: ${name}\n\nIssue Description:\n${issue}\n\n---\nSubmitted from Lot Ops Pro`);
    const mailtoLink = `mailto:cryptocreeper94@gmail.com?subject=${subject}&body=${body}`;

    // Open mail client
    window.location.href = mailtoLink;

    // Show success message
    setSubmitted(true);
    setTimeout(() => {
      setOpen(false);
      setSubmitted(false);
      setName("");
      setIssue("");
      setIsSubmitting(false);
    }, 2000);
  };

  return (
    <>
      {/* Static inline button for footer */}
      <button
        onClick={() => setOpen(true)}
        className="flex items-center gap-1.5 text-xs text-red-400 hover:text-red-300 transition-colors"
        data-testid="button-bug-report"
        title="Report a Bug"
      >
        <Bug className="h-3 w-3" />
        <span>Report Bug</span>
      </button>

      {/* Bug Report Dialog */}
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Bug className="h-5 w-5 text-red-600" />
              Report a Bug or Issue
            </DialogTitle>
            <DialogDescription>
              Found a problem or error? Let Jason know so he can fix it right away.
            </DialogDescription>
          </DialogHeader>

          {submitted ? (
            <div className="py-8 text-center space-y-3">
              <CheckCircle2 className="h-16 w-16 text-green-600 mx-auto" />
              <h3 className="text-lg font-semibold">Thanks for the Feedback!</h3>
              <p className="text-sm text-gray-600">Your email client should open shortly. Jason will get back to you soon.</p>
            </div>
          ) : (
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="bug-name">Your Name</Label>
                <Input
                  id="bug-name"
                  placeholder="e.g., Teresa, Driver #142"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  data-testid="input-bug-name"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="bug-issue">What's the problem?</Label>
                <Textarea
                  id="bug-issue"
                  placeholder="Describe what went wrong, what you expected to happen, or what feature you'd like to see..."
                  value={issue}
                  onChange={(e) => setIssue(e.target.value)}
                  rows={6}
                  data-testid="textarea-bug-issue"
                />
              </div>

              <div className="bg-blue-50 rounded-lg p-3 border border-blue-200">
                <p className="text-xs text-blue-900">
                  <strong>Note:</strong> This will open your email app to send Jason a message at cryptocreeper94@gmail.com
                </p>
              </div>
            </div>
          )}

          {!submitted && (
            <DialogFooter>
              <Button
                variant="outline"
                onClick={() => setOpen(false)}
                disabled={isSubmitting}
                data-testid="button-cancel-bug"
              >
                Cancel
              </Button>
              <Button
                onClick={handleSubmit}
                disabled={isSubmitting}
                className="bg-red-600 hover:bg-red-700"
                data-testid="button-submit-bug"
              >
                <Send className="h-4 w-4 mr-2" />
                Send Report
              </Button>
            </DialogFooter>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
}
