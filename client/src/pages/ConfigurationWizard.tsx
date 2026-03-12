import { useState } from "react";
import { useLocation } from "wouter";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";
import {
  Building2,
  MapPin,
  Settings,
  Zap,
  Upload,
  CheckCircle2,
  ArrowRight,
  Rocket,
  Shield
} from "lucide-react";
import { NavigationControl } from "@/components/NavigationControl";

export default function ConfigurationWizard() {
  const [_, setLocation] = useLocation();
  const { toast } = useToast();
  const [step, setStep] = useState(1);
  
  // Facility Info
  const [facilityName, setFacilityName] = useState("");
  const [facilityLocation, setFacilityLocation] = useState("");
  const [logoFile, setLogoFile] = useState<string | null>(null);
  
  // Features
  const [features, setFeatures] = useState({
    ocrScanner: true,
    gpsRouting: true,
    performanceTracking: true,
    speedMonitoring: true,
    exoticKeyTracking: true,
    breakManagement: true,
    weatherWidget: true,
    safetyReporting: true,
    shiftManagement: true,
    lotSpaceTracking: true,
    aiAssistant: true,
    messaging: true,
    documentStorage: true,
    emailContacts: true,
    webResearch: true,
    tripCounter: true,
    themeCustomization: true
  });

  const handleLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    
    const reader = new FileReader();
    reader.onloadend = () => {
      setLogoFile(reader.result as string);
      toast({ title: "Logo Uploaded", description: "Your facility logo has been set" });
    };
    reader.readAsDataURL(file);
  };

  const toggleFeature = (feature: keyof typeof features) => {
    setFeatures(prev => ({ ...prev, [feature]: !prev[feature] }));
  };

  const saveConfiguration = async () => {
    toast({
      title: "Configuration Saved",
      description: `${facilityName} is now configured and ready to use!`,
    });
    
    // Store config in localStorage for now
    localStorage.setItem("facility_config", JSON.stringify({
      name: facilityName,
      location: facilityLocation,
      logo: logoFile,
      features
    }));
    
    setLocation("/");
  };

  const featureList = [
    { key: "ocrScanner", label: "OCR Camera Scanner", description: "Scan work orders with camera" },
    { key: "gpsRouting", label: "GPS Routing & Navigation", description: "Turn-by-turn directions on facility" },
    { key: "performanceTracking", label: "Performance Tracking", description: "MPH, quotas, bonuses" },
    { key: "speedMonitoring", label: "Speed Monitoring", description: "Real-time speedometer with violations" },
    { key: "exoticKeyTracking", label: "Exotic Key Security", description: "Chain of custody for high-value vehicles" },
    { key: "breakManagement", label: "Break Management", description: "Driver-controlled timers with logging" },
    { key: "weatherWidget", label: "Weather Widget", description: "Live weather, radar, NWS alerts" },
    { key: "safetyReporting", label: "Safety Incident Reporting", description: "Photo/video capture with reports" },
    { key: "shiftManagement", label: "Shift Management", description: "Clock in/out, lunch tracking" },
    { key: "lotSpaceTracking", label: "Lot Space Tracking", description: "Capacity monitoring with AI suggestions" },
    { key: "aiAssistant", label: "AI Assistant", description: "Voice I/O for questions and guidance" },
    { key: "messaging", label: "Real-Time Messaging", description: "Driver-supervisor communication" },
    { key: "documentStorage", label: "Document Storage", description: "PDF/file storage up to 10MB" },
    { key: "emailContacts", label: "Email Contact Manager", description: "Quick mailto: link generation" },
    { key: "webResearch", label: "Web Research Tool", description: "Direct website navigation" },
    { key: "tripCounter", label: "Trip Counter & Mileage", description: "GPS odometer with distance tracking" },
    { key: "themeCustomization", label: "Theme Customization", description: "100+ sports team themes" }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900 p-4">
      <div className="max-w-4xl mx-auto space-y-4">
        <NavigationControl variant="back" fallbackRoute="/developer" />
        {/* Header */}
        <div className="text-center space-y-2">
          <div className="flex items-center justify-center gap-2">
            <Rocket className="h-8 w-8 text-cyan-400" />
            <h1 className="text-3xl font-bold text-white">Lot Ops Pro Configuration</h1>
          </div>
          <p className="text-slate-300">Configure your facility in minutes • White-label ready</p>
          <Badge variant="outline" className="bg-cyan-600/20 text-cyan-300 border-cyan-500/30">
            Step {step} of 3
          </Badge>
        </div>

        <Tabs value={`step${step}`} className="w-full">
          <TabsList className="grid w-full grid-cols-3 bg-white/10">
            <TabsTrigger value="step1" onClick={() => setStep(1)}>
              <Building2 className="h-4 w-4 mr-2" />
              Facility Info
            </TabsTrigger>
            <TabsTrigger value="step2" onClick={() => setStep(2)}>
              <Zap className="h-4 w-4 mr-2" />
              Features
            </TabsTrigger>
            <TabsTrigger value="step3" onClick={() => setStep(3)}>
              <CheckCircle2 className="h-4 w-4 mr-2" />
              Review
            </TabsTrigger>
          </TabsList>

          {/* Step 1: Facility Info */}
          <TabsContent value="step1" className="space-y-4">
            <Card className="bg-white/95">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Building2 className="h-5 w-5 text-blue-600" />
                  Facility Information
                </CardTitle>
                <CardDescription>
                  Enter your facility details - this will be shown throughout the app
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="facility-name">Facility Name</Label>
                  <Input
                    id="facility-name"
                    placeholder="e.g., Manheim Atlanta, ADESA Phoenix, etc."
                    value={facilityName}
                    onChange={(e) => setFacilityName(e.target.value)}
                    className="text-lg"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="facility-location">Location</Label>
                  <Input
                    id="facility-location"
                    placeholder="e.g., College Park, GA"
                    value={facilityLocation}
                    onChange={(e) => setFacilityLocation(e.target.value)}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="logo-upload">Facility Logo (Optional)</Label>
                  <div className="flex items-center gap-4">
                    <Input
                      id="logo-upload"
                      type="file"
                      accept="image/*"
                      onChange={handleLogoUpload}
                      className="flex-1"
                    />
                    {logoFile && (
                      <img src={logoFile} alt="Logo preview" className="h-12 w-12 object-contain rounded" />
                    )}
                  </div>
                  <p className="text-xs text-slate-500">Upload your company logo (PNG, JPG, SVG)</p>
                </div>

                <Button 
                  onClick={() => setStep(2)} 
                  className="w-full"
                  disabled={!facilityName || !facilityLocation}
                >
                  Continue to Features
                  <ArrowRight className="h-4 w-4 ml-2" />
                </Button>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Step 2: Features */}
          <TabsContent value="step2" className="space-y-4">
            <Card className="bg-white/95">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Zap className="h-5 w-5 text-blue-600" />
                  Feature Selection
                </CardTitle>
                <CardDescription>
                  Enable or disable features based on your facility's needs
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="grid gap-3">
                  {featureList.map((feature) => (
                    <div
                      key={feature.key}
                      className="flex items-center justify-between p-3 bg-slate-50 rounded-lg hover:bg-slate-100 transition-colors"
                    >
                      <div className="flex-1">
                        <p className="font-medium text-sm">{feature.label}</p>
                        <p className="text-xs text-slate-500">{feature.description}</p>
                      </div>
                      <Switch
                        checked={features[feature.key as keyof typeof features]}
                        onCheckedChange={() => toggleFeature(feature.key as keyof typeof features)}
                      />
                    </div>
                  ))}
                </div>

                <div className="flex gap-2 pt-4">
                  <Button variant="outline" onClick={() => setStep(1)} className="flex-1">
                    Back
                  </Button>
                  <Button onClick={() => setStep(3)} className="flex-1">
                    Review Configuration
                    <ArrowRight className="h-4 w-4 ml-2" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Step 3: Review */}
          <TabsContent value="step3" className="space-y-4">
            <Card className="bg-white/95">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <CheckCircle2 className="h-5 w-5 text-green-600" />
                  Review & Deploy
                </CardTitle>
                <CardDescription>
                  Verify your configuration before deployment
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-3">
                  <div className="flex items-center gap-3">
                    <Building2 className="h-5 w-5 text-blue-600" />
                    <div>
                      <p className="font-bold text-lg">{facilityName || "Not set"}</p>
                      <p className="text-sm text-slate-500">{facilityLocation || "Location not set"}</p>
                    </div>
                  </div>

                  <div className="border-t pt-3">
                    <p className="font-semibold mb-2 text-sm">Enabled Features:</p>
                    <div className="flex flex-wrap gap-2">
                      {Object.entries(features)
                        .filter(([_, enabled]) => enabled)
                        .map(([key, _]) => (
                          <Badge key={key} variant="secondary" className="text-xs">
                            {featureList.find(f => f.key === key)?.label}
                          </Badge>
                        ))}
                    </div>
                  </div>
                </div>

                <div className="bg-blue-50 border-l-4 border-blue-500 p-4 rounded">
                  <div className="flex items-start gap-3">
                    <Shield className="h-5 w-5 text-blue-600 mt-0.5" />
                    <div>
                      <p className="font-semibold text-sm text-blue-900">Ready to Deploy</p>
                      <p className="text-xs text-blue-700 mt-1">
                        Your configuration will be saved and can be modified later from Settings.
                      </p>
                    </div>
                  </div>
                </div>

                <div className="flex gap-2">
                  <Button variant="outline" onClick={() => setStep(2)} className="flex-1">
                    Back to Features
                  </Button>
                  <Button onClick={saveConfiguration} className="flex-1 bg-green-600 hover:bg-green-700">
                    <CheckCircle2 className="h-4 w-4 mr-2" />
                    Deploy Configuration
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        {/* Footer Note */}
        <Card className="bg-gradient-to-r from-cyan-900/40 to-blue-900/40 border-cyan-500/30">
          <CardContent className="p-4">
            <p className="text-sm text-cyan-100 text-center">
              <strong>Need full implementation?</strong> For complete workflow configuration including shops, 
              service centers, custom routing, and onsite consultation - contact DarkWave Studios for enterprise setup.
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
