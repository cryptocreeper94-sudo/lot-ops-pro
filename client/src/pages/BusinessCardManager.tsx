import { useState, useEffect } from "react";
import { useLocation } from "wouter";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Download, Send, Eye, ImagePlus, Trash2, User, Building2, Mail, Phone, Globe, Palette, FileText, ArrowLeft, Sparkles } from "lucide-react";
import { toast } from "sonner";
import { BentoGrid, BentoTile } from "@/components/ui/bento-grid";
import { PremiumAccordion, PremiumAccordionItem, PremiumAccordionTrigger, PremiumAccordionContent } from "@/components/ui/premium-accordion";
import { SwipeCarousel } from "@/components/ui/premium-carousel";
import { PremiumButton } from "@/components/ui/premium-button";

export default function BusinessCardManager() {
  const [_, setLocation] = useLocation();
  const [user, setUser] = useState<any>(null);
  const [hallmarks, setHallmarks] = useState<any[]>([]);
  const [preview, setPreview] = useState(true);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const [card, setCard] = useState({
    title: "Sales Representative",
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    company: "Lot Ops Pro",
    website: "lotopspro.io",
    logoUrl: "",
    hallmarkTheme: "Lot Ops Pro",
    notes: "",
  });

  useEffect(() => {
    const userStr = localStorage.getItem("vanops_user");
    if (!userStr) {
      setLocation("/");
      return;
    }

    const userData = JSON.parse(userStr);
    if (!["developer", "operations_manager", "sales_person"].includes(userData.role)) {
      toast.error("Access denied. CRM is for sales team only.");
      setLocation("/dashboard");
      return;
    }

    setUser(userData);
    if (userData.name) {
      const nameParts = userData.name.split(" ");
      setCard((prev) => ({
        ...prev,
        firstName: nameParts[0],
        lastName: nameParts.slice(1).join(" ") || "",
        email: userData.email || "",
      }));
    }
    fetchHallmarks();
  }, []);

  const fetchHallmarks = async () => {
    try {
      const res = await fetch("/api/crm/hallmarks");
      if (res.ok) {
        const data = await res.json();
        setHallmarks(data);
        if (data.length > 0) {
          setCard((prev) => ({ ...prev, hallmarkTheme: data[0].name }));
        }
      }
    } catch (error) {
      console.error("Failed to fetch hallmarks:", error);
    }
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        const dataUrl = event.target?.result as string;
        setImagePreview(dataUrl);
        setCard((prev) => ({ ...prev, logoUrl: dataUrl }));
        toast.success("Logo uploaded");
      };
      reader.readAsDataURL(file);
    }
  };

  const handleDownload = () => {
    try {
      const hallmark = hallmarks.find((h) => h.name === card.hallmarkTheme) || {
        primaryColor: "#0f172a",
        secondaryColor: "#1e293b",
      };

      const cardHTML = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <title>${card.firstName} ${card.lastName} - Business Card</title>
  <style>
    body {
      margin: 0;
      padding: 40px;
      font-family: 'DM Sans', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
      background: #f5f5f5;
    }
    .page {
      display: flex;
      gap: 20px;
      flex-wrap: wrap;
    }
    .card {
      width: 500px;
      height: 300px;
      background: linear-gradient(135deg, ${hallmark.primaryColor} 0%, ${hallmark.secondaryColor} 100%);
      color: white;
      padding: 30px;
      border-radius: 8px;
      box-shadow: 0 10px 40px rgba(0,0,0,0.3);
      display: flex;
      flex-direction: column;
      justify-content: space-between;
      font-size: 14px;
      page-break-inside: avoid;
    }
    .header {
      display: flex;
      justify-content: space-between;
      align-items: flex-start;
      margin-bottom: 20px;
    }
    .logo {
      width: 60px;
      height: 60px;
      object-fit: contain;
    }
    .company {
      font-size: 16px;
      font-weight: bold;
      margin-bottom: 5px;
    }
    .name {
      font-size: 18px;
      font-weight: bold;
      margin-top: 15px;
      margin-bottom: 5px;
    }
    .title {
      font-size: 13px;
      opacity: 0.9;
      margin-bottom: 10px;
    }
    .contact {
      font-size: 12px;
      line-height: 1.6;
      opacity: 0.85;
    }
    .contact-line {
      margin: 3px 0;
    }
    .divider {
      height: 1px;
      background: rgba(255,255,255,0.3);
      margin: 15px 0;
    }
    @media print {
      body { padding: 0; background: none; }
      .page { gap: 0; }
      .card { margin: 0; }
    }
  </style>
</head>
<body>
  <div class="page">
    <div class="card">
      <div>
        <div class="header">
          <div>
            <div class="company">${card.company}</div>
          </div>
          ${card.logoUrl ? `<img src="${card.logoUrl}" alt="Logo" class="logo">` : ""}
        </div>
        <div class="name">${card.firstName} ${card.lastName}</div>
        <div class="title">${card.title}</div>
        <div class="divider"></div>
        <div class="contact">
          ${card.email ? `<div class="contact-line">📧 ${card.email}</div>` : ""}
          ${card.phone ? `<div class="contact-line">📱 ${card.phone}</div>` : ""}
          ${card.website ? `<div class="contact-line">🌐 ${card.website}</div>` : ""}
        </div>
      </div>
    </div>
    <div class="card">
      <div>
        <div class="header">
          <div>
            <div class="company">${card.company}</div>
          </div>
          ${card.logoUrl ? `<img src="${card.logoUrl}" alt="Logo" class="logo">` : ""}
        </div>
        <div class="name">${card.firstName} ${card.lastName}</div>
        <div class="title">${card.title}</div>
        <div class="divider"></div>
        <div class="contact">
          ${card.email ? `<div class="contact-line">📧 ${card.email}</div>` : ""}
          ${card.phone ? `<div class="contact-line">📱 ${card.phone}</div>` : ""}
          ${card.website ? `<div class="contact-line">🌐 ${card.website}</div>` : ""}
        </div>
      </div>
    </div>
  </div>
  <script>
    window.print();
  </script>
</body>
</html>
      `;

      const blob = new Blob([cardHTML], { type: "text/html" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `${card.firstName}-${card.lastName}-business-card.html`;
      a.click();
      URL.revokeObjectURL(url);
      toast.success("Business card ready to print");
    } catch (error) {
      toast.error("Failed to download card");
    }
  };

  const handleSend = async () => {
    if (!card.email) {
      toast.error("Please enter your email address");
      return;
    }

    setLoading(true);
    try {
      const res = await fetch("/api/crm/business-cards/send", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(card),
      });

      if (res.ok) {
        toast.success(`Business card sent to ${card.email}`);
      } else {
        toast.error("Failed to send card");
      }
    } catch (error) {
      toast.error("Failed to send card");
    } finally {
      setLoading(false);
    }
  };

  if (!user) return <div className="p-4 text-white">Loading...</div>;

  const selectedHallmark = hallmarks.find((h) => h.name === card.hallmarkTheme) || {
    primaryColor: "#0f172a",
    secondaryColor: "#1e293b",
  };

  return (
    <div className="min-h-screen bg-slate-900 p-4 md:p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl md:text-3xl font-bold text-white flex items-center gap-3">
            <Sparkles className="h-7 w-7 text-amber-400" />
            Business Card Creator
          </h1>
          <PremiumButton
            variant="glass"
            onClick={() => setLocation("/sales")}
            icon={<ArrowLeft className="h-4 w-4" />}
            data-testid="button-back"
          >
            Back to Sales
          </PremiumButton>
        </div>

        <BentoGrid columns={3} gap="md">
          <BentoTile
            size="tall"
            variant="glass"
            sparkle
            title="Personal Details"
            icon={<User className="h-5 w-5" />}
            data-testid="tile-personal-details"
          >
            <div className="space-y-3 mt-2">
              <div>
                <Label className="text-white/80 text-sm">First Name *</Label>
                <Input
                  value={card.firstName}
                  onChange={(e) => setCard({ ...card, firstName: e.target.value })}
                  className="bg-white/10 border-white/20 text-white mt-1"
                  data-testid="input-first-name"
                />
              </div>
              <div>
                <Label className="text-white/80 text-sm">Last Name *</Label>
                <Input
                  value={card.lastName}
                  onChange={(e) => setCard({ ...card, lastName: e.target.value })}
                  className="bg-white/10 border-white/20 text-white mt-1"
                  data-testid="input-last-name"
                />
              </div>
              <div>
                <Label className="text-white/80 text-sm">Title</Label>
                <Input
                  value={card.title}
                  onChange={(e) => setCard({ ...card, title: e.target.value })}
                  placeholder="Sales Representative"
                  className="bg-white/10 border-white/20 text-white mt-1"
                  data-testid="input-title"
                />
              </div>
            </div>
          </BentoTile>

          <BentoTile
            size="tall"
            variant="gradient"
            title="Contact Information"
            icon={<Mail className="h-5 w-5" />}
            data-testid="tile-contact-info"
          >
            <div className="space-y-3 mt-2">
              <div>
                <Label className="text-white/80 text-sm">Email *</Label>
                <Input
                  type="email"
                  value={card.email}
                  onChange={(e) => setCard({ ...card, email: e.target.value })}
                  className="bg-white/10 border-white/20 text-white mt-1"
                  data-testid="input-email"
                />
              </div>
              <div>
                <Label className="text-white/80 text-sm">Phone</Label>
                <Input
                  value={card.phone}
                  onChange={(e) => setCard({ ...card, phone: e.target.value })}
                  placeholder="+1 (555) 123-4567"
                  className="bg-white/10 border-white/20 text-white mt-1"
                  data-testid="input-phone"
                />
              </div>
              <div>
                <Label className="text-white/80 text-sm">Website</Label>
                <Input
                  value={card.website}
                  onChange={(e) => setCard({ ...card, website: e.target.value })}
                  className="bg-white/10 border-white/20 text-white mt-1"
                  data-testid="input-website"
                />
              </div>
            </div>
          </BentoTile>

          <BentoTile
            size="tall"
            variant="premium"
            sparkle
            title="Live Preview"
            badge="PREVIEW"
            icon={<Eye className="h-5 w-5" />}
            data-testid="tile-preview"
          >
            <div className="flex flex-col h-full">
              <div className="flex justify-end mb-2">
                <PremiumButton
                  variant="glass"
                  size="sm"
                  onClick={() => setPreview(!preview)}
                  data-testid="button-toggle-preview"
                >
                  {preview ? "Hide" : "Show"}
                </PremiumButton>
              </div>
              {preview && (
                <div className="flex-1 flex items-center justify-center">
                  <div
                    className="w-full max-w-[280px] h-44 p-4 rounded-lg text-white flex flex-col justify-between shadow-xl transform hover:scale-105 transition-transform"
                    style={{
                      background: `linear-gradient(135deg, ${selectedHallmark.primaryColor} 0%, ${selectedHallmark.secondaryColor} 100%)`,
                    }}
                    data-testid="card-preview"
                  >
                    <div>
                      {imagePreview && (
                        <img
                          src={imagePreview}
                          alt="Logo"
                          className="h-8 mb-1 object-contain"
                          data-testid="preview-logo"
                        />
                      )}
                      <div className="text-sm font-bold">{card.company}</div>
                    </div>
                    <div>
                      <div className="text-base font-semibold">
                        {card.firstName} {card.lastName}
                      </div>
                      <div className="text-xs opacity-90 mb-2">{card.title}</div>
                      <div className="text-[10px] opacity-80 border-t border-white/30 pt-2">
                        {card.email && <div>📧 {card.email}</div>}
                        {card.phone && <div>📱 {card.phone}</div>}
                        {card.website && <div>🌐 {card.website}</div>}
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </BentoTile>

          <BentoTile
            size="md"
            variant="glass"
            title="Company"
            icon={<Building2 className="h-5 w-5" />}
            data-testid="tile-company"
          >
            <div className="mt-2">
              <Label className="text-white/80 text-sm">Company Name</Label>
              <Input
                value={card.company}
                onChange={(e) => setCard({ ...card, company: e.target.value })}
                className="bg-white/10 border-white/20 text-white mt-1"
                data-testid="input-company"
              />
            </div>
          </BentoTile>

          <BentoTile
            size="md"
            variant="glow"
            title="Brand Logo"
            icon={<ImagePlus className="h-5 w-5" />}
            data-testid="tile-logo"
          >
            <div className="mt-2 space-y-2">
              <div className="flex gap-2">
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleImageUpload}
                  className="flex-1 text-xs text-white/70 file:mr-2 file:py-1 file:px-2 file:rounded file:border-0 file:text-xs file:bg-primary/20 file:text-primary"
                  data-testid="input-logo"
                />
                {imagePreview && (
                  <PremiumButton
                    variant="danger"
                    size="sm"
                    icon={<Trash2 className="h-3 w-3" />}
                    onClick={() => {
                      setImagePreview(null);
                      setCard((prev) => ({ ...prev, logoUrl: "" }));
                    }}
                    data-testid="button-remove-logo"
                  >
                    Remove
                  </PremiumButton>
                )}
              </div>
              {imagePreview && (
                <img src={imagePreview} alt="Logo preview" className="h-12 rounded" data-testid="logo-preview" />
              )}
            </div>
          </BentoTile>

          <BentoTile
            size="md"
            variant="glass"
            title="Notes"
            icon={<FileText className="h-5 w-5" />}
            data-testid="tile-notes"
          >
            <div className="mt-2">
              <Textarea
                value={card.notes}
                onChange={(e) => setCard({ ...card, notes: e.target.value })}
                placeholder="Personal notes..."
                className="bg-white/10 border-white/20 text-white min-h-[60px]"
                data-testid="textarea-notes"
              />
            </div>
          </BentoTile>
        </BentoGrid>

        <PremiumAccordion type="single" collapsible defaultValue="themes">
          <PremiumAccordionItem value="themes" variant="premium">
            <PremiumAccordionTrigger
              icon={<Palette className="h-5 w-5" />}
              badge={`${hallmarks.length} Themes`}
              description="Choose a brand theme for your card"
            >
              Brand Themes
            </PremiumAccordionTrigger>
            <PremiumAccordionContent>
              {hallmarks.length > 0 ? (
                <SwipeCarousel itemWidth="200px" gap={12} showPeek>
                  {hallmarks.map((h) => (
                    <div
                      key={h.id}
                      onClick={() => setCard({ ...card, hallmarkTheme: h.name })}
                      className={`p-4 rounded-xl cursor-pointer transition-all duration-300 ${
                        card.hallmarkTheme === h.name
                          ? "ring-2 ring-amber-400 scale-105"
                          : "hover:scale-102"
                      }`}
                      style={{
                        background: `linear-gradient(135deg, ${h.primaryColor} 0%, ${h.secondaryColor} 100%)`,
                      }}
                      data-testid={`theme-card-${h.id}`}
                    >
                      <div className="text-white font-medium text-sm">{h.name}</div>
                      <div className="text-white/70 text-xs mt-1">Click to select</div>
                    </div>
                  ))}
                </SwipeCarousel>
              ) : (
                <div className="text-center text-white/60 py-4">
                  <select
                    value={card.hallmarkTheme}
                    onChange={(e) => setCard({ ...card, hallmarkTheme: e.target.value })}
                    className="w-full max-w-md px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-white"
                    data-testid="select-hallmark"
                  >
                    <option value="Lot Ops Pro">Lot Ops Pro (Default)</option>
                  </select>
                </div>
              )}
            </PremiumAccordionContent>
          </PremiumAccordionItem>
        </PremiumAccordion>

        <BentoGrid columns={2} gap="md">
          <BentoTile
            size="md"
            variant="gradient"
            interactive
            onClick={handleDownload}
            title="Download for Print"
            description="Generate a print-ready HTML file"
            icon={<Download className="h-5 w-5" />}
            data-testid="tile-download"
            action={
              <PremiumButton
                variant="primary"
                shine
                icon={<Download className="h-4 w-4" />}
                onClick={(e) => {
                  e?.stopPropagation();
                  handleDownload();
                }}
                data-testid="button-download"
              >
                Download Card
              </PremiumButton>
            }
          />

          <BentoTile
            size="md"
            variant="premium"
            sparkle
            interactive
            onClick={handleSend}
            title="Send to Email"
            description="Email the business card directly"
            icon={<Send className="h-5 w-5" />}
            data-testid="tile-send"
            action={
              <PremiumButton
                variant="premium"
                shine
                pulse
                loading={loading}
                icon={<Send className="h-4 w-4" />}
                onClick={(e) => {
                  e?.stopPropagation();
                  handleSend();
                }}
                data-testid="button-send"
              >
                {loading ? "Sending..." : "Send Card"}
              </PremiumButton>
            }
          />
        </BentoGrid>
      </div>
    </div>
  );
}
