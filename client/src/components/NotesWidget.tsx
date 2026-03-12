import { useState } from "react";
import { FileText, Send } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { useToast } from "@/hooks/use-toast";

interface NotesWidgetProps {
  driverNumber?: string;
  driverName?: string;
}

export function NotesWidget({ driverNumber, driverName }: NotesWidgetProps) {
  const [open, setOpen] = useState(false);
  const [noteContent, setNoteContent] = useState("");
  const [noteType, setNoteType] = useState<"personal" | "report_to_supervisor">("personal");
  const [isSaving, setIsSaving] = useState(false);
  const { toast } = useToast();

  const handleSave = async () => {
    if (!noteContent.trim()) {
      toast({
        title: "Note is empty",
        description: "Please write something before saving",
        variant: "destructive"
      });
      return;
    }

    setIsSaving(true);

    try {
      const response = await fetch('/api/notes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          driverNumber: driverNumber || 'unknown',
          driverName: driverName || 'Unknown Driver',
          noteType,
          noteContent: noteContent.trim(),
          location: window.location.pathname // Where they were in the app
        })
      });

      if (!response.ok) throw new Error('Failed to save note');

      toast({
        title: noteType === 'report_to_supervisor' ? "Report Sent" : "Note Saved",
        description: noteType === 'report_to_supervisor' 
          ? "Teresa has been notified" 
          : "Your note has been saved",
      });

      setNoteContent("");
      setOpen(false);
    } catch (error) {
      toast({
        title: "Failed to save",
        description: "Please try again",
        variant: "destructive"
      });
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <>
      <Button
        variant="ghost"
        onClick={() => setOpen(true)}
        className="fixed bottom-4 right-4 bg-amber-600/90 hover:bg-amber-700 text-white rounded-full p-3 shadow-lg z-50"
        data-testid="button-notes"
      >
        <FileText className="h-5 w-5" />
      </Button>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="bg-slate-900 text-white border-slate-800">
          <DialogHeader>
            <DialogTitle>Notes & Reports</DialogTitle>
            <DialogDescription className="text-slate-400">
              Write a personal note or report an issue to Teresa
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label>Note Type</Label>
              <RadioGroup value={noteType} onValueChange={(value) => setNoteType(value as any)}>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="personal" id="personal" />
                  <Label htmlFor="personal" className="cursor-pointer">
                    Personal Note (private)
                  </Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="report_to_supervisor" id="report" />
                  <Label htmlFor="report" className="cursor-pointer">
                    Report to Supervisor (Teresa will be notified)
                  </Label>
                </div>
              </RadioGroup>
            </div>

            <div className="space-y-2">
              <Label htmlFor="note">
                {noteType === 'report_to_supervisor' ? 'Issue Description' : 'Your Note'}
              </Label>
              <Textarea
                id="note"
                placeholder={noteType === 'report_to_supervisor' 
                  ? "Example: Transmission fell out in Lane 42, blocking traffic" 
                  : "Your personal notes..."}
                value={noteContent}
                onChange={(e) => setNoteContent(e.target.value)}
                className="bg-slate-800 border-slate-700 text-white min-h-32"
                data-testid="textarea-note"
              />
              <p className="text-xs text-slate-500">
                {noteType === 'report_to_supervisor' 
                  ? "This will be sent to Teresa immediately" 
                  : "This note is private and only visible to you"}
              </p>
            </div>
          </div>

          <DialogFooter className="flex gap-2">
            <Button
              variant="ghost"
              onClick={() => setOpen(false)}
              data-testid="button-cancel"
            >
              Cancel
            </Button>
            <Button
              onClick={handleSave}
              disabled={isSaving || !noteContent.trim()}
              className={noteType === 'report_to_supervisor' ? "bg-orange-600 hover:bg-orange-700" : ""}
              data-testid="button-save-note"
            >
              {isSaving ? (
                "Saving..."
              ) : (
                <>
                  {noteType === 'report_to_supervisor' ? (
                    <>
                      <Send className="h-4 w-4 mr-2" />
                      Send Report
                    </>
                  ) : (
                    "Save Note"
                  )}
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
