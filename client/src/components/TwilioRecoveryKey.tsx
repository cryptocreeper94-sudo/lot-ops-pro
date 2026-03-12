import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { AlertCircle, Copy, Eye, EyeOff, Key, Download } from "lucide-react";
import { toast } from "sonner";

interface TwilioRecoveryKeyProps {
  recoveryKey?: string;
  isConfigured?: boolean;
  lastRotated?: string;
}

export function TwilioRecoveryKey({
  recoveryKey = "RECOVERY_KEY_NOT_SET",
  isConfigured = false,
  lastRotated,
}: TwilioRecoveryKeyProps) {
  const [showKey, setShowKey] = useState(false);
  const [copied, setCopied] = useState(false);

  const copyToClipboard = () => {
    navigator.clipboard.writeText(recoveryKey);
    setCopied(true);
    toast.success("Recovery key copied to clipboard");
    setTimeout(() => setCopied(false), 2000);
  };

  const downloadRecoveryKey = () => {
    const element = document.createElement("a");
    const file = new Blob([`TWILIO RECOVERY KEY\n\n${recoveryKey}\n\nGenerated: ${new Date().toISOString()}`], {
      type: "text/plain",
    });
    element.href = URL.createObjectURL(file);
    element.download = `twilio-recovery-key-${Date.now()}.txt`;
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
    toast.success("Recovery key downloaded");
  };

  return (
    <Card className="bg-white/5 border-orange-500/50 shadow-lg">
      <CardHeader className="bg-orange-500/10 border-b border-orange-500/30">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Key className="h-5 w-5 text-orange-400" />
            <CardTitle className="text-white">Twilio Recovery Key</CardTitle>
          </div>
          <Badge
            variant={isConfigured ? "default" : "secondary"}
            className={
              isConfigured
                ? "bg-green-600 hover:bg-green-700"
                : "bg-orange-600 hover:bg-orange-700"
            }
          >
            {isConfigured ? "Configured" : "Backup Access"}
          </Badge>
        </div>
      </CardHeader>

      <CardContent className="p-6 space-y-4">
        <div className="bg-orange-500/10 border border-orange-500/30 rounded-lg p-4 flex gap-3">
          <AlertCircle className="h-5 w-5 text-orange-400 flex-shrink-0 mt-0.5" />
          <div>
            <p className="text-sm text-orange-300 font-medium">Store this key securely</p>
            <p className="text-xs text-orange-200 mt-1">
              Use this recovery key to regain access to your Twilio account if you lose your authentication method. Save it in a secure location.
            </p>
          </div>
        </div>

        <div className="bg-slate-900 border border-slate-700 rounded-lg p-4">
          <div className="flex items-center justify-between mb-3">
            <p className="text-xs text-slate-400 font-medium">RECOVERY KEY</p>
            <button
              onClick={() => setShowKey(!showKey)}
              className="text-slate-400 hover:text-slate-300 transition-colors"
              data-testid="button-toggle-recovery-key"
            >
              {showKey ? (
                <EyeOff className="h-4 w-4" />
              ) : (
                <Eye className="h-4 w-4" />
              )}
            </button>
          </div>
          <div className="font-mono text-sm break-all">
            {showKey ? (
              <p className="text-orange-400 font-semibold" data-testid="text-recovery-key">
                {recoveryKey}
              </p>
            ) : (
              <p className="text-slate-500">
                {recoveryKey.replace(/./g, "•")}
              </p>
            )}
          </div>
        </div>

        <div className="flex gap-2">
          <Button
            onClick={copyToClipboard}
            variant="outline"
            size="sm"
            className="flex-1 bg-slate-800 border-slate-700 hover:bg-slate-700"
            data-testid="button-copy-recovery-key"
          >
            <Copy className="h-4 w-4 mr-2" />
            {copied ? "Copied" : "Copy"}
          </Button>
          <Button
            onClick={downloadRecoveryKey}
            variant="outline"
            size="sm"
            className="flex-1 bg-slate-800 border-slate-700 hover:bg-slate-700"
            data-testid="button-download-recovery-key"
          >
            <Download className="h-4 w-4 mr-2" />
            Download
          </Button>
        </div>

        {lastRotated && (
          <div className="text-xs text-slate-400 border-t border-slate-700 pt-3">
            <p>Last rotated: {new Date(lastRotated).toLocaleDateString()}</p>
          </div>
        )}

        <div className="bg-blue-500/10 border border-blue-500/30 rounded-lg p-3">
          <p className="text-xs text-blue-300">
            💡 <strong>Tip:</strong> Store this key offline in a password manager or secure location. Never share it or commit it to version control.
          </p>
        </div>
      </CardContent>
    </Card>
  );
}
