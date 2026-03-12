import { useState, useEffect } from "react";
import { useLocation } from "wouter";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Plus, Trash2, Palette, Hash, Sparkles, Layers } from "lucide-react";
import { toast } from "sonner";
import { NavigationControl } from "@/components/NavigationControl";
import { BentoGrid, BentoTile } from "@/components/ui/bento-grid";
import { PremiumAccordion, PremiumAccordionItem, PremiumAccordionTrigger, PremiumAccordionContent } from "@/components/ui/premium-accordion";
import { SwipeCarousel } from "@/components/ui/premium-carousel";
import { PremiumButton } from "@/components/ui/premium-button";

interface Hallmark {
  id: number;
  hallmarkName: string;
  primaryColor: string;
  secondaryColor: string;
  isDefault: boolean;
  isActive: boolean;
}

interface SerialSystem {
  id: number;
  systemName: string;
  prefix: string;
  currentNumber: number;
  separator: string;
  paddingZeros: number;
}

export default function CustomerHallmarkManager() {
  const [_, setLocation] = useLocation();
  const [user, setUser] = useState<any>(null);
  const [hallmarks, setHallmarks] = useState<Hallmark[]>([]);
  const [serialSystems, setSerialSystems] = useState<SerialSystem[]>([]);

  const [hallmarkForm, setHallmarkForm] = useState({
    hallmarkName: "",
    hallmarkDescription: "",
    primaryColor: "#0f172a",
    secondaryColor: "#1e293b",
    accentColor: "#3b82f6",
    tagline: "",
    website: "",
  });

  const [serialForm, setSerialForm] = useState({
    systemName: "",
    prefix: "AST",
    startingNumber: 1,
    separator: "-",
    paddingZeros: 5,
  });

  useEffect(() => {
    const userStr = localStorage.getItem("vanops_user");
    if (!userStr) {
      setLocation("/");
      return;
    }

    const userData = JSON.parse(userStr);
    setUser(userData);
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [hallmarksRes, serialRes] = await Promise.all([
        fetch("/api/customer/hallmarks"),
        fetch("/api/customer/serial-systems"),
      ]);

      if (hallmarksRes.ok) setHallmarks(await hallmarksRes.json());
      if (serialRes.ok) setSerialSystems(await serialRes.json());
    } catch (error) {
      console.error("Failed to fetch data:", error);
    }
  };

  const handleCreateHallmark = async () => {
    if (!hallmarkForm.hallmarkName) {
      toast.error("Hallmark name is required");
      return;
    }

    try {
      const res = await fetch("/api/customer/hallmarks", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(hallmarkForm),
      });

      if (res.ok) {
        toast.success("Hallmark created successfully");
        setHallmarkForm({
          hallmarkName: "",
          hallmarkDescription: "",
          primaryColor: "#0f172a",
          secondaryColor: "#1e293b",
          accentColor: "#3b82f6",
          tagline: "",
          website: "",
        });
        fetchData();
      }
    } catch (error) {
      toast.error("Failed to create hallmark");
    }
  };

  const handleCreateSerialSystem = async () => {
    if (!serialForm.systemName || !serialForm.prefix) {
      toast.error("System name and prefix are required");
      return;
    }

    try {
      const res = await fetch("/api/customer/serial-systems", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(serialForm),
      });

      if (res.ok) {
        toast.success("Serial system created successfully");
        setSerialForm({
          systemName: "",
          prefix: "AST",
          startingNumber: 1,
          separator: "-",
          paddingZeros: 5,
        });
        fetchData();
      }
    } catch (error) {
      toast.error("Failed to create serial system");
    }
  };

  const handleDeleteHallmark = async (id: number) => {
    if (!confirm("Delete this hallmark? Assets already stamped will retain the historical record.")) return;

    try {
      const res = await fetch(`/api/customer/hallmarks/${id}`, { method: "DELETE" });
      if (res.ok) {
        toast.success("Hallmark deleted");
        fetchData();
      }
    } catch (error) {
      toast.error("Failed to delete hallmark");
    }
  };

  if (!user) return <div className="p-4">Loading...</div>;

  return (
    <div className="min-h-screen bg-slate-900 p-4 md:p-8">
      <div className="max-w-6xl mx-auto space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-white" data-testid="text-page-title">Brand & Serial Management</h1>
            <p className="text-slate-400 text-sm mt-1">Create your branded hallmarks and custom serial number systems</p>
          </div>
          <NavigationControl variant="back" fallbackRoute="/dashboard" data-testid="button-back" />
        </div>

        <Tabs defaultValue="hallmarks" className="w-full" data-testid="tabs-main">
          <TabsList className="grid w-full grid-cols-2" data-testid="tabs-list">
            <TabsTrigger value="hallmarks" data-testid="tab-hallmarks">
              <Palette className="h-4 w-4 mr-2" />
              Hallmarks
            </TabsTrigger>
            <TabsTrigger value="serials" data-testid="tab-serials">
              <Hash className="h-4 w-4 mr-2" />
              Serial Systems
            </TabsTrigger>
          </TabsList>

          <TabsContent value="hallmarks" className="space-y-6 mt-6">
            <BentoTile
              variant="premium"
              size="wide"
              sparkle
              icon={<Plus className="h-5 w-5" />}
              title="Create New Hallmark"
              description="Design your custom brand identity"
              data-testid="tile-create-hallmark"
            >
              <PremiumAccordion type="single" collapsible defaultValue="form">
                <PremiumAccordionItem value="form" variant="glass">
                  <PremiumAccordionTrigger icon={<Sparkles className="h-4 w-4" />} data-testid="accordion-hallmark-form">
                    Hallmark Details
                  </PremiumAccordionTrigger>
                  <PremiumAccordionContent>
                    <BentoGrid columns={2} gap="md" className="mt-2">
                      <div>
                        <Label className="text-white">Hallmark Name *</Label>
                        <Input
                          value={hallmarkForm.hallmarkName}
                          onChange={(e) => setHallmarkForm({ ...hallmarkForm, hallmarkName: e.target.value })}
                          placeholder="e.g., Manheim Nashville, Premier Dealership"
                          className="bg-white/10 border-white/20 text-white"
                          data-testid="input-hallmark-name"
                        />
                      </div>

                      <div>
                        <Label className="text-white">Tagline</Label>
                        <Input
                          value={hallmarkForm.tagline}
                          onChange={(e) => setHallmarkForm({ ...hallmarkForm, tagline: e.target.value })}
                          placeholder="Brand tagline"
                          className="bg-white/10 border-white/20 text-white"
                          data-testid="input-tagline"
                        />
                      </div>

                      <div>
                        <Label className="text-white">Primary Color</Label>
                        <div className="flex gap-2">
                          <Input
                            type="color"
                            value={hallmarkForm.primaryColor}
                            onChange={(e) => setHallmarkForm({ ...hallmarkForm, primaryColor: e.target.value })}
                            className="w-16 h-10 p-1 bg-transparent border-white/20"
                            data-testid="input-primary-color"
                          />
                          <Input
                            value={hallmarkForm.primaryColor}
                            onChange={(e) => setHallmarkForm({ ...hallmarkForm, primaryColor: e.target.value })}
                            placeholder="#0f172a"
                            className="flex-1 bg-white/10 border-white/20 text-white"
                            data-testid="input-primary-color-text"
                          />
                        </div>
                      </div>

                      <div>
                        <Label className="text-white">Secondary Color</Label>
                        <div className="flex gap-2">
                          <Input
                            type="color"
                            value={hallmarkForm.secondaryColor}
                            onChange={(e) => setHallmarkForm({ ...hallmarkForm, secondaryColor: e.target.value })}
                            className="w-16 h-10 p-1 bg-transparent border-white/20"
                            data-testid="input-secondary-color"
                          />
                          <Input
                            value={hallmarkForm.secondaryColor}
                            onChange={(e) => setHallmarkForm({ ...hallmarkForm, secondaryColor: e.target.value })}
                            placeholder="#1e293b"
                            className="flex-1 bg-white/10 border-white/20 text-white"
                            data-testid="input-secondary-color-text"
                          />
                        </div>
                      </div>

                      <div className="md:col-span-2">
                        <Label className="text-white">Description</Label>
                        <Textarea
                          value={hallmarkForm.hallmarkDescription}
                          onChange={(e) => setHallmarkForm({ ...hallmarkForm, hallmarkDescription: e.target.value })}
                          placeholder="Describe your brand..."
                          rows={2}
                          className="bg-white/10 border-white/20 text-white"
                          data-testid="textarea-description"
                        />
                      </div>
                    </BentoGrid>

                    <PremiumButton
                      onClick={handleCreateHallmark}
                      variant="premium"
                      className="w-full mt-4"
                      shine
                      icon={<Plus className="h-4 w-4" />}
                      data-testid="button-create-hallmark"
                    >
                      Create Hallmark
                    </PremiumButton>
                  </PremiumAccordionContent>
                </PremiumAccordionItem>
              </PremiumAccordion>
            </BentoTile>

            <div className="space-y-3">
              <h3 className="text-lg font-semibold text-white flex items-center gap-2" data-testid="text-hallmarks-title">
                <Layers className="h-5 w-5 text-amber-400" />
                Your Hallmarks
              </h3>
              
              {hallmarks.length === 0 ? (
                <BentoTile variant="glass" size="lg" data-testid="tile-no-hallmarks">
                  <div className="flex flex-col items-center justify-center h-full text-center">
                    <Palette className="h-12 w-12 text-slate-500 mb-3" />
                    <p className="text-slate-400">No hallmarks yet. Create your first brand above.</p>
                  </div>
                </BentoTile>
              ) : (
                <SwipeCarousel itemWidth="300px" gap={16} showPeek data-testid="carousel-hallmarks">
                  {hallmarks.map((hallmark) => (
                    <BentoTile
                      key={hallmark.id}
                      variant="gradient"
                      size="md"
                      sparkle={hallmark.isDefault}
                      data-testid={`tile-hallmark-${hallmark.id}`}
                    >
                      <div className="space-y-3 h-full flex flex-col">
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <h4 className="text-white font-semibold text-lg" data-testid={`text-name-${hallmark.id}`}>
                              {hallmark.hallmarkName}
                            </h4>
                            {hallmark.isDefault && (
                              <Badge className="mt-1 bg-green-600/80 text-white border-green-500" data-testid={`badge-default-${hallmark.id}`}>
                                Default
                              </Badge>
                            )}
                          </div>
                          <PremiumButton
                            variant="danger"
                            size="icon"
                            onClick={() => handleDeleteHallmark(hallmark.id)}
                            data-testid={`button-delete-${hallmark.id}`}
                          >
                            <Trash2 className="h-4 w-4" />
                          </PremiumButton>
                        </div>

                        <div className="flex gap-3 items-center mt-auto">
                          <div
                            className="h-16 w-20 rounded-lg shadow-lg"
                            style={{
                              background: `linear-gradient(135deg, ${hallmark.primaryColor} 0%, ${hallmark.secondaryColor} 100%)`,
                            }}
                            data-testid={`swatch-${hallmark.id}`}
                          />
                          <div className="text-xs text-slate-300 space-y-1">
                            <p className="flex items-center gap-1">
                              <span className="w-2 h-2 rounded-full" style={{ backgroundColor: hallmark.primaryColor }} />
                              Primary: {hallmark.primaryColor}
                            </p>
                            <p className="flex items-center gap-1">
                              <span className="w-2 h-2 rounded-full" style={{ backgroundColor: hallmark.secondaryColor }} />
                              Secondary: {hallmark.secondaryColor}
                            </p>
                          </div>
                        </div>
                      </div>
                    </BentoTile>
                  ))}
                </SwipeCarousel>
              )}
            </div>
          </TabsContent>

          <TabsContent value="serials" className="space-y-6 mt-6">
            <BentoTile
              variant="premium"
              size="wide"
              sparkle
              icon={<Plus className="h-5 w-5" />}
              title="Create Serial Number System"
              description="Configure custom numbering for your assets"
              data-testid="tile-create-serial"
            >
              <PremiumAccordion type="single" collapsible defaultValue="form">
                <PremiumAccordionItem value="form" variant="glass">
                  <PremiumAccordionTrigger icon={<Hash className="h-4 w-4" />} data-testid="accordion-serial-form">
                    Serial System Configuration
                  </PremiumAccordionTrigger>
                  <PremiumAccordionContent>
                    <BentoGrid columns={2} gap="md" className="mt-2">
                      <div>
                        <Label className="text-white">System Name *</Label>
                        <Input
                          value={serialForm.systemName}
                          onChange={(e) => setSerialForm({ ...serialForm, systemName: e.target.value })}
                          placeholder="e.g., Vehicle Inventory, Equipment"
                          className="bg-white/10 border-white/20 text-white"
                          data-testid="input-system-name"
                        />
                      </div>

                      <div>
                        <Label className="text-white">Prefix *</Label>
                        <Input
                          value={serialForm.prefix}
                          onChange={(e) => setSerialForm({ ...serialForm, prefix: e.target.value.toUpperCase() })}
                          placeholder="AST, VEH, EQP"
                          maxLength={10}
                          className="bg-white/10 border-white/20 text-white"
                          data-testid="input-prefix"
                        />
                      </div>

                      <div>
                        <Label className="text-white">Separator</Label>
                        <Input
                          value={serialForm.separator}
                          onChange={(e) => setSerialForm({ ...serialForm, separator: e.target.value })}
                          placeholder="-"
                          maxLength={2}
                          className="bg-white/10 border-white/20 text-white"
                          data-testid="input-separator"
                        />
                      </div>

                      <div>
                        <Label className="text-white">Padding Zeros</Label>
                        <Input
                          type="number"
                          value={serialForm.paddingZeros}
                          onChange={(e) => setSerialForm({ ...serialForm, paddingZeros: Number(e.target.value) })}
                          placeholder="5"
                          className="bg-white/10 border-white/20 text-white"
                          data-testid="input-padding"
                        />
                      </div>

                      <div>
                        <Label className="text-white">Starting Number</Label>
                        <Input
                          type="number"
                          value={serialForm.startingNumber}
                          onChange={(e) => setSerialForm({ ...serialForm, startingNumber: Number(e.target.value) })}
                          placeholder="1"
                          className="bg-white/10 border-white/20 text-white"
                          data-testid="input-starting"
                        />
                      </div>

                      <div>
                        <Label className="text-white">Preview</Label>
                        <div className="bg-slate-800/80 p-3 rounded-lg text-amber-400 text-lg font-mono border border-amber-500/30" data-testid="text-serial-preview">
                          {serialForm.prefix}
                          {serialForm.separator}
                          {String(serialForm.startingNumber).padStart(serialForm.paddingZeros, "0")}
                        </div>
                      </div>
                    </BentoGrid>

                    <PremiumButton
                      onClick={handleCreateSerialSystem}
                      variant="premium"
                      className="w-full mt-4"
                      shine
                      icon={<Plus className="h-4 w-4" />}
                      data-testid="button-create-serial"
                    >
                      Create Serial System
                    </PremiumButton>
                  </PremiumAccordionContent>
                </PremiumAccordionItem>
              </PremiumAccordion>
            </BentoTile>

            <div className="space-y-3">
              <h3 className="text-lg font-semibold text-white flex items-center gap-2" data-testid="text-serials-title">
                <Hash className="h-5 w-5 text-amber-400" />
                Your Serial Systems
              </h3>
              
              {serialSystems.length === 0 ? (
                <BentoTile variant="glass" size="lg" data-testid="tile-no-serials">
                  <div className="flex flex-col items-center justify-center h-full text-center">
                    <Hash className="h-12 w-12 text-slate-500 mb-3" />
                    <p className="text-slate-400">No serial systems yet. Create your first system above.</p>
                  </div>
                </BentoTile>
              ) : (
                <SwipeCarousel itemWidth="300px" gap={16} showPeek data-testid="carousel-serials">
                  {serialSystems.map((system) => (
                    <BentoTile
                      key={system.id}
                      variant="glow"
                      size="md"
                      data-testid={`tile-serial-${system.id}`}
                    >
                      <div className="space-y-3">
                        <h4 className="text-white font-semibold text-lg" data-testid={`text-serial-${system.id}`}>
                          {system.systemName}
                        </h4>

                        <div className="bg-slate-800/80 p-4 rounded-lg border border-primary/20">
                          <p className="text-primary font-mono text-xl" data-testid={`text-current-serial-${system.id}`}>
                            {system.prefix}
                            {system.separator}
                            {String(system.currentNumber).padStart(system.paddingZeros, "0")}
                          </p>
                          <p className="text-slate-400 text-xs mt-1">
                            Next: {system.currentNumber + 1}
                          </p>
                        </div>

                        <BentoGrid columns={2} gap="sm">
                          <div className="text-xs text-slate-400 bg-slate-800/50 rounded p-2">
                            <span className="text-slate-500">Prefix:</span> {system.prefix}
                          </div>
                          <div className="text-xs text-slate-400 bg-slate-800/50 rounded p-2">
                            <span className="text-slate-500">Padding:</span> {system.paddingZeros}
                          </div>
                          <div className="text-xs text-slate-400 bg-slate-800/50 rounded p-2">
                            <span className="text-slate-500">Separator:</span> "{system.separator}"
                          </div>
                          <div className="text-xs text-slate-400 bg-slate-800/50 rounded p-2">
                            <span className="text-slate-500">Current:</span> {system.currentNumber}
                          </div>
                        </BentoGrid>
                      </div>
                    </BentoTile>
                  ))}
                </SwipeCarousel>
              )}
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
