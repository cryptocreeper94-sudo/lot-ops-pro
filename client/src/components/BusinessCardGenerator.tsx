import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Download, Eye } from "lucide-react";
import { toast } from "sonner";

interface BusinessCardGeneratorProps {
  contact: {
    firstName: string;
    lastName: string;
    title?: string;
    email: string;
    phone?: string;
  };
  hallmark?: {
    name: string;
    primaryColor: string;
    secondaryColor: string;
    logoUrl?: string;
  };
}

export function BusinessCardGenerator({ contact, hallmark }: BusinessCardGeneratorProps) {
  const [preview, setPreview] = useState(false);

  const downloadCard = async () => {
    try {
      // In production, would generate PDF via API
      const cardHTML = `
        <html>
          <head>
            <title>Business Card</title>
            <style>
              body { margin: 0; padding: 20px; font-family: 'DM Sans', sans-serif; }
              .card {
                width: 500px;
                height: 300px;
                background: linear-gradient(135deg, ${hallmark?.primaryColor || "#0f172a"} 0%, ${hallmark?.secondaryColor || "#1e293b"} 100%);
                color: white;
                padding: 30px;
                border-radius: 8px;
                box-shadow: 0 10px 40px rgba(0,0,0,0.3);
                display: flex;
                flex-direction: column;
                justify-content: space-between;
              }
              .logo { font-size: 24px; font-weight: bold; margin-bottom: 20px; }
              .info { flex-grow: 1; }
              .name { font-size: 20px; font-weight: bold; margin-bottom: 5px; }
              .title { font-size: 14px; opacity: 0.9; margin-bottom: 15px; }
              .contact { font-size: 12px; line-height: 1.6; opacity: 0.8; }
            </style>
          </head>
          <body>
            <div class="card">
              <div class="logo">${hallmark?.name || "Lot Ops Pro"}</div>
              <div class="info">
                <div class="name">${contact.firstName} ${contact.lastName}</div>
                <div class="title">${contact.title || "Sales Professional"}</div>
                <div class="contact">
                  ${contact.email}<br/>
                  ${contact.phone || ""}
                </div>
              </div>
            </div>
          </body>
        </html>
      `;

      const blob = new Blob([cardHTML], { type: "text/html" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `${contact.firstName}-${contact.lastName}-business-card.html`;
      a.click();
      URL.revokeObjectURL(url);
      toast.success("Business card downloaded");
    } catch (error) {
      toast.error("Failed to download card");
    }
  };

  return (
    <Card className="bg-white/5 border-slate-700">
      <CardHeader>
        <CardTitle className="text-white">Business Card</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {preview && (
          <div className="flex justify-center p-4 bg-slate-800/50 rounded-lg">
            <div
              className="w-96 h-56 p-6 rounded-lg text-white flex flex-col justify-between shadow-lg"
              style={{
                background: `linear-gradient(135deg, ${hallmark?.primaryColor || "#0f172a"} 0%, ${hallmark?.secondaryColor || "#1e293b"} 100%)`,
              }}
            >
              <div>
                <div className="text-xl font-bold mb-4">{hallmark?.name || "Lot Ops Pro"}</div>
                <div className="text-lg font-semibold">{contact.firstName} {contact.lastName}</div>
                <div className="text-sm opacity-90 mb-3">{contact.title || "Sales Professional"}</div>
              </div>
              <div className="text-xs opacity-80">
                <div>{contact.email}</div>
                {contact.phone && <div>{contact.phone}</div>}
              </div>
            </div>
          </div>
        )}

        <div className="flex gap-2">
          <Button
            variant="outline"
            onClick={() => setPreview(!preview)}
            className="flex-1"
            data-testid="button-toggle-preview"
          >
            <Eye className="h-4 w-4 mr-2" />
            {preview ? "Hide" : "Preview"}
          </Button>
          <Button
            onClick={downloadCard}
            className="flex-1 bg-blue-600 hover:bg-blue-700"
            data-testid="button-download-card"
          >
            <Download className="h-4 w-4 mr-2" />
            Download
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
