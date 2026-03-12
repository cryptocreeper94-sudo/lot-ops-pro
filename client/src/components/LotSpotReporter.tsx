import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import { Warehouse, Send, CheckCircle2, MapPin, Info } from "lucide-react";

interface LotSpotReporterProps {
  reporterName: string;
  reporterRole: "supervisor" | "van_driver" | "inventory_driver" | "operations_manager";
}

export function LotSpotReporter({ reporterName, reporterRole }: LotSpotReporterProps) {
  const [open, setOpen] = useState(false);
  const [section, setSection] = useState("");
  const [row, setRow] = useState("");
  const [availableSpots, setAvailableSpots] = useState("");
  const [notes, setNotes] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();

  const handleSubmit = async () => {
    if (!section.trim() || !row.trim() || !availableSpots.trim()) {
      toast({
        title: "Missing Information",
        description: "Please fill in section, row, and available spots",
        variant: "destructive"
      });
      return;
    }

    const spots = parseInt(availableSpots);
    if (isNaN(spots) || spots < 0) {
      toast({
        title: "Invalid Number",
        description: "Please enter a valid number of available spots",
        variant: "destructive"
      });
      return;
    }

    setIsSubmitting(true);

    try {
      const response = await fetch("/api/lot-reports", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          section: section.trim(),
          row: row.trim(),
          availableSpots: spots,
          reportedBy: reporterName,
          reportedByRole: reporterRole,
          notes: notes.trim() || "Quick field estimate"
        })
      });

      if (!response.ok) throw new Error("Failed to submit report");

      setSubmitted(true);
      toast({
        title: "Report Submitted! 📍",
        description: `Section ${section} Row ${row}: ~${spots} spots available`
      });

      setTimeout(() => {
        setOpen(false);
        setSubmitted(false);
        setSection("");
        setRow("");
        setAvailableSpots("");
        setNotes("");
        setIsSubmitting(false);
      }, 2000);
    } catch (error) {
      toast({
        title: "Submission Failed",
        description: "Could not save lot report. Please try again.",
        variant: "destructive"
      });
      setIsSubmitting(false);
    }
  };

  return (
    <>
      {/* Floating Button */}
      <button
        onClick={() => setOpen(true)}
        className="fixed bottom-24 right-4 bg-green-600 hover:bg-green-700 text-white p-4 rounded-full shadow-lg z-40 transition-all hover:scale-110"
        data-testid="button-lot-reporter"
        title="Report Lot Availability"
      >
        <Warehouse className="h-6 w-6" />
      </button>

      {/* Report Dialog */}
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <MapPin className="h-5 w-5 text-green-600" />
              Inventory Spot Report
            </DialogTitle>
            <p className="text-xs text-orange-600 font-semibold mt-1">
              ⚠️ ESTIMATED ONLY - Your best guess is fine!
            </p>
            <div className="bg-blue-50 rounded-lg p-2 border border-blue-200 mt-2">
              <div className="flex items-start gap-2">
                <Info className="h-3.5 w-3.5 text-blue-600 mt-0.5 flex-shrink-0" />
                <p className="text-[10px] text-blue-900">
                  <strong>How to Report:</strong> Section = Lot number (like 515, 505). Row = Row number within that section (1, 2, 3...). Available Spots = Your best estimate of empty spots.
                </p>
              </div>
            </div>
          </DialogHeader>

          {submitted ? (
            <div className="py-8 text-center space-y-3">
              <CheckCircle2 className="h-16 w-16 text-green-600 mx-auto" />
              <h3 className="text-lg font-semibold">Report Saved!</h3>
              <p className="text-sm text-gray-600">Everyone can now see this update</p>
            </div>
          ) : (
            <div className="space-y-4 py-4">
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-2">
                  <Label htmlFor="section" className="text-xs font-semibold">Inventory Section</Label>
                  <Input
                    id="section"
                    placeholder="515"
                    value={section}
                    onChange={(e) => setSection(e.target.value)}
                    data-testid="input-section"
                    className="h-10 text-base"
                  />
                  <p className="text-[10px] text-gray-500">e.g., 515, 505, 504, 591, etc.</p>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="row" className="text-xs font-semibold">Row #</Label>
                  <Input
                    id="row"
                    placeholder="1"
                    value={row}
                    onChange={(e) => setRow(e.target.value)}
                    data-testid="input-row"
                    className="h-10 text-base"
                  />
                  <p className="text-[10px] text-gray-500">Row within section</p>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="available-spots" className="text-xs font-semibold">Estimated Spots Available</Label>
                <Input
                  id="available-spots"
                  type="number"
                  placeholder="10"
                  value={availableSpots}
                  onChange={(e) => setAvailableSpots(e.target.value)}
                  data-testid="input-available-spots"
                  className="h-10 text-base"
                />
                <p className="text-[10px] text-gray-500">Your best guess is fine</p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="notes" className="text-xs">Notes (optional)</Label>
                <Textarea
                  id="notes"
                  placeholder="Front section, rough count, etc."
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  rows={2}
                  data-testid="textarea-notes"
                  className="text-sm"
                />
              </div>

              <div className="bg-green-50 rounded-lg p-3 border border-green-200">
                <p className="text-xs text-green-900">
                  <strong>Example:</strong> Section 515, Row 2 → ~10 spots available
                </p>
              </div>

              <Button
                onClick={handleSubmit}
                disabled={isSubmitting}
                className="w-full bg-green-600 hover:bg-green-700"
                data-testid="button-submit-report"
              >
                <Send className="h-4 w-4 mr-2" />
                {isSubmitting ? "Saving..." : "Submit Report"}
              </Button>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
}
