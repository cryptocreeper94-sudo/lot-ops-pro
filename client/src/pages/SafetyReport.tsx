import { useState, useRef } from "react";
import { useLocation } from "wouter";
import { BentoGrid, BentoTile } from "@/components/ui/bento-grid";
import { PremiumButton } from "@/components/ui/premium-button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Camera, AlertTriangle, Send, Image as ImageIcon, X, Video, MapPin, User, Users, Shield } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { QuickHelpPanel } from "@/components/ui/help-tooltip";
import { NavigationControl } from "@/components/NavigationControl";
import { CameraPreviewModal } from "@/components/CameraPreviewModal";

export default function SafetyReport() {
  const [_, setLocation] = useLocation();
  const { toast } = useToast();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const videoInputRef = useRef<HTMLInputElement>(null);
  
  const [incidentType, setIncidentType] = useState<string>("");
  const [urgency, setUrgency] = useState<string>("general");
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [lotLocation, setLotLocation] = useState("");
  const [location, setLocationText] = useState("");
  const [vin, setVin] = useState("");
  const [badgeNumber, setBadgeNumber] = useState("");
  const [employeeType, setEmployeeType] = useState<string>("permanent");
  const [witnessed, setWitnessed] = useState(false);
  const [witnessNames, setWitnessNames] = useState("");
  const [witnessCount, setWitnessCount] = useState<number>(0);
  const [photo, setPhoto] = useState<string | null>(null);
  const [video, setVideo] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showPhotoCamera, setShowPhotoCamera] = useState(false);
  const [showVideoCamera, setShowVideoCamera] = useState(false);

  const userStr = localStorage.getItem("vanops_user");
  const user = userStr ? JSON.parse(userStr) : null;

  const handlePhotoCapture = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setPhoto(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleVideoCapture = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 10 * 1024 * 1024) {
        toast({
          title: "Video too large",
          description: "Video must be smaller than 10MB (10 seconds max)",
          variant: "destructive",
        });
        return;
      }

      const reader = new FileReader();
      reader.onloadend = () => {
        setVideo(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async () => {
    if (!incidentType || !title || !description) {
      toast({
        title: "Missing Information",
        description: "Please fill out all required fields",
        variant: "destructive"
      });
      return;
    }

    setIsSubmitting(true);

    try {
      const response = await fetch('/api/safety/incidents', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          reportedBy: user?.driverNumber || user?.pin || 'unknown',
          reporterName: user?.name || 'Unknown',
          reporterBadgeNumber: badgeNumber || user?.badgeNumber,
          reporterEmployeeType: employeeType,
          incidentType,
          urgency,
          title,
          description,
          lotLocation,
          location,
          vin,
          witnessed,
          witnessNames,
          witnessCount: witnessed ? witnessCount : 0,
          photoUrl: photo,
          videoUrl: video
        })
      });

      if (!response.ok) throw new Error('Failed to submit report');

      toast({
        title: "Report Submitted",
        description: urgency === 'urgent' 
          ? "Teresa, Supervisor, and Safety Representative notified - URGENT"
          : "Sent to Supervisor, Operations Manager, and Safety Representative",
      });

      window.history.back();
    } catch (error) {
      toast({
        title: "Submission Failed",
        description: "Please try again",
        variant: "destructive"
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 text-white pb-20" data-testid="page-safety-report">
      <div className="sticky top-0 z-50 bg-gradient-to-r from-red-600 to-orange-600 shadow-xl">
        <div className="flex items-center justify-between px-4 py-4">
          <NavigationControl variant="back" fallbackRoute="/safety-dashboard" data-testid="button-back" />
          <div className="flex items-center gap-2">
            <AlertTriangle className="h-6 w-6" />
            <h1 className="text-xl font-bold" data-testid="text-page-title">Safety Report</h1>
          </div>
          <div className="w-10" />
        </div>
      </div>

      <div className="max-w-4xl mx-auto p-4">
        <QuickHelpPanel 
          title="How to File a Safety Report"
          tips={[
            "🚨 URGENT: Select for immediate safety concerns requiring immediate response",
            "📸 Photos/Video: Optional but helpful - use camera to capture evidence",
            "🏥 Injuries: Always report any injuries, no matter how minor",
            "📍 Location: Be specific - include lot/lane numbers if applicable",
            "👥 Witnesses: List anyone who saw the incident happen"
          ]}
          data-testid="panel-help"
        />

        <BentoGrid columns={2} gap="md" className="mt-4">
          <BentoTile
            size="wide"
            variant={urgency === 'urgent' ? 'glow' : 'gradient'}
            icon={<Shield className="h-5 w-5" />}
            title="Report Priority"
            description={urgency === 'urgent' ? "Management will be notified immediately" : "Select urgency level"}
            interactive={false}
            className={urgency === 'urgent' ? 'border-red-500 shadow-red-500/30' : ''}
            data-testid="tile-priority"
          >
            <Select value={urgency} onValueChange={setUrgency}>
              <SelectTrigger className="bg-slate-900/50 border-slate-700 mt-2" data-testid="select-urgency">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="urgent">🚨 URGENT - Immediate Attention Required</SelectItem>
                <SelectItem value="general">⚠️ General - Important but not critical</SelectItem>
                <SelectItem value="low">ℹ️ Low - For documentation only</SelectItem>
              </SelectContent>
            </Select>
            {urgency === 'urgent' && (
              <p className="text-xs text-red-400 mt-2">
                Teresa (Operations Manager), Supervisor, and Safety Representative will be notified immediately
              </p>
            )}
          </BentoTile>

          <BentoTile
            size="tall"
            variant="glow"
            icon={<AlertTriangle className="h-5 w-5" />}
            title="Incident Details"
            description="Describe what happened"
            interactive={false}
            data-testid="tile-incident-details"
          >
            <div className="space-y-3">
              <div>
                <Label>Incident Type *</Label>
                <Select value={incidentType} onValueChange={setIncidentType}>
                  <SelectTrigger className="bg-slate-900/50 border-slate-700 mt-1" data-testid="select-incident-type">
                    <SelectValue placeholder="Select type..." />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="accident">🚗 Vehicle Accident</SelectItem>
                    <SelectItem value="near_miss">⚡ Near Miss</SelectItem>
                    <SelectItem value="safety_violation">⚠️ Safety Violation</SelectItem>
                    <SelectItem value="hazard">☢️ Hazard / Unsafe Condition</SelectItem>
                    <SelectItem value="equipment_damage">🔧 Equipment Damage</SelectItem>
                    <SelectItem value="injury">🏥 Personal Injury</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="title">Short Description *</Label>
                <Input
                  id="title"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="e.g., Transmission fell out in Lane 42"
                  className="bg-slate-900/50 border-slate-700 mt-1"
                  data-testid="input-title"
                />
              </div>

              <div>
                <Label htmlFor="description">Full Details *</Label>
                <Textarea
                  id="description"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Describe what happened, when, and any immediate actions taken..."
                  className="bg-slate-900/50 border-slate-700 mt-1 min-h-24"
                  data-testid="textarea-description"
                />
              </div>
            </div>
          </BentoTile>

          <BentoTile
            size="md"
            variant="gradient"
            icon={<User className="h-5 w-5" />}
            title="Reporter Information"
            description="Your employment details"
            interactive={false}
            data-testid="tile-reporter-info"
          >
            <div className="space-y-3">
              <div>
                <Label htmlFor="badgeNumber">Badge Number</Label>
                <Input
                  id="badgeNumber"
                  value={badgeNumber}
                  onChange={(e) => setBadgeNumber(e.target.value)}
                  placeholder="e.g., EMP001, 12345"
                  className="bg-slate-900/50 border-slate-700 mt-1"
                  data-testid="input-badge-number"
                />
              </div>

              <div>
                <Label>Employment Type</Label>
                <Select value={employeeType} onValueChange={setEmployeeType}>
                  <SelectTrigger className="bg-slate-900/50 border-slate-700 mt-1" data-testid="select-employee-type">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="permanent">Permanent Employee</SelectItem>
                    <SelectItem value="temporary">Temporary/Seasonal Worker</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </BentoTile>

          <BentoTile
            size="md"
            variant="gradient"
            icon={<MapPin className="h-5 w-5" />}
            title="Location & Vehicle"
            description="Where did this happen?"
            interactive={false}
            data-testid="tile-location"
          >
            <div className="space-y-3">
              <div>
                <Label htmlFor="lotLocation">Lot/Section *</Label>
                <Input
                  id="lotLocation"
                  value={lotLocation}
                  onChange={(e) => setLotLocation(e.target.value)}
                  placeholder="e.g., 515, DSC, Lane 42"
                  className="bg-slate-900/50 border-slate-700 mt-1"
                  data-testid="input-lot-location"
                />
              </div>

              <div>
                <Label htmlFor="location">Additional Details</Label>
                <Input
                  id="location"
                  value={location}
                  onChange={(e) => setLocationText(e.target.value)}
                  placeholder="e.g., Row 15, near LP section"
                  className="bg-slate-900/50 border-slate-700 mt-1"
                  data-testid="input-location"
                />
              </div>

              <div>
                <Label htmlFor="vin">VIN (if applicable)</Label>
                <Input
                  id="vin"
                  value={vin}
                  onChange={(e) => setVin(e.target.value)}
                  placeholder="Last 6 digits or full VIN"
                  className="bg-slate-900/50 border-slate-700 mt-1"
                  data-testid="input-vin"
                />
              </div>
            </div>
          </BentoTile>

          <BentoTile
            size="md"
            variant="glass"
            icon={<Users className="h-5 w-5" />}
            title="Witness Information"
            description="Did anyone else see what happened?"
            interactive={false}
            data-testid="tile-witnesses"
          >
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <Label>Were there witnesses?</Label>
                <Switch 
                  checked={witnessed} 
                  onCheckedChange={setWitnessed}
                  data-testid="switch-witnessed"
                />
              </div>
              
              {witnessed && (
                <>
                  <div>
                    <Label htmlFor="witnessCount">How many witnesses?</Label>
                    <Input
                      id="witnessCount"
                      type="number"
                      min="0"
                      value={witnessCount}
                      onChange={(e) => setWitnessCount(parseInt(e.target.value) || 0)}
                      placeholder="e.g., 2"
                      className="bg-slate-900/50 border-slate-700 mt-1"
                      data-testid="input-witness-count"
                    />
                  </div>
                  
                  <div>
                    <Label htmlFor="witnesses">Witness Names</Label>
                    <Textarea
                      id="witnesses"
                      value={witnessNames}
                      onChange={(e) => setWitnessNames(e.target.value)}
                      placeholder="List names (e.g., John Smith, Jane Doe)"
                      className="bg-slate-900/50 border-slate-700 mt-1 min-h-16"
                      data-testid="input-witnesses"
                    />
                  </div>
                </>
              )}
            </div>
          </BentoTile>

          <BentoTile
            size="md"
            variant="glow"
            icon={<Camera className="h-5 w-5" />}
            title="Evidence Capture"
            description="Photo or video of incident"
            interactive={false}
            data-testid="tile-evidence"
          >
            <div className="space-y-3">
              {!photo ? (
                <PremiumButton
                  onClick={() => setShowPhotoCamera(true)}
                  variant="primary"
                  className="w-full"
                  icon={<Camera className="h-4 w-4" />}
                  data-testid="button-capture-photo"
                >
                  Take Photo
                </PremiumButton>
              ) : (
                <div className="relative">
                  <img 
                    src={photo} 
                    alt="Captured evidence" 
                    className="w-full rounded-lg border-2 border-green-500 max-h-32 object-cover"
                    data-testid="img-photo-preview"
                  />
                  <PremiumButton
                    variant="danger"
                    size="sm"
                    onClick={() => setPhoto(null)}
                    className="absolute top-1 right-1"
                    icon={<X className="h-3 w-3" />}
                    data-testid="button-remove-photo"
                  >
                    Remove
                  </PremiumButton>
                  <Badge className="absolute bottom-1 left-1 bg-green-600">
                    <ImageIcon className="h-3 w-3 mr-1" />
                    Attached
                  </Badge>
                </div>
              )}

              {!video ? (
                <PremiumButton
                  onClick={() => setShowVideoCamera(true)}
                  variant="glass"
                  className="w-full"
                  icon={<Video className="h-4 w-4" />}
                  data-testid="button-capture-video"
                >
                  Record Video (10 sec)
                </PremiumButton>
              ) : (
                <div className="relative">
                  <video 
                    src={video} 
                    controls
                    className="w-full rounded-lg border-2 border-green-500 max-h-32"
                    data-testid="video-preview"
                  />
                  <PremiumButton
                    variant="danger"
                    size="sm"
                    onClick={() => setVideo(null)}
                    className="absolute top-1 right-1"
                    icon={<X className="h-3 w-3" />}
                    data-testid="button-remove-video"
                  >
                    Remove
                  </PremiumButton>
                </div>
              )}
              
              <p className="text-xs text-slate-400 text-center">
                💡 Capture speeding vehicles or ongoing hazards
              </p>
            </div>
          </BentoTile>

          <BentoTile
            size="wide"
            variant={urgency === 'urgent' ? 'premium' : 'glow'}
            sparkle={urgency === 'urgent'}
            interactive={false}
            className={urgency === 'urgent' ? 'border-red-500' : ''}
            data-testid="tile-submit"
          >
            <div className="flex flex-col items-center justify-center h-full gap-3">
              <PremiumButton
                onClick={handleSubmit}
                disabled={isSubmitting || !incidentType || !title || !description}
                loading={isSubmitting}
                variant={urgency === 'urgent' ? 'danger' : 'premium'}
                size="lg"
                shine
                icon={<Send className="h-5 w-5" />}
                className="w-full max-w-md"
                data-testid="button-submit-report"
              >
                {urgency === 'urgent' ? '🚨 SEND URGENT REPORT' : 'Submit Safety Report'}
              </PremiumButton>
              <p className="text-xs text-slate-400">
                Report will be sent directly to Teresa Perry
              </p>
            </div>
          </BentoTile>
        </BentoGrid>
      </div>

      <CameraPreviewModal
        isOpen={showPhotoCamera}
        mode="photo"
        title="Capture Evidence Photo"
        description="Take photo of incident, damage, or hazard"
        onClose={() => setShowPhotoCamera(false)}
        onCapture={(dataUrl) => {
          if (!dataUrl) {
            toast({
              title: "Capture Failed",
              description: "Could not capture photo. Please try again.",
              variant: "destructive"
            });
            return;
          }
          setPhoto(dataUrl);
          toast({
            title: "Photo Captured",
            description: "Evidence photo attached to report",
          });
          setShowPhotoCamera(false);
        }}
        showScanFrame={false}
      />

      <CameraPreviewModal
        isOpen={showVideoCamera}
        mode="video"
        title="Record Evidence Video"
        description="Record video (max 10 seconds)"
        onClose={() => setShowVideoCamera(false)}
        onCapture={(dataUrl) => {
          if (!dataUrl) {
            toast({
              title: "Recording Failed",
              description: "Could not record video. Please try again.",
              variant: "destructive"
            });
            return;
          }
          setVideo(dataUrl);
          toast({
            title: "Video Recorded",
            description: "Evidence video attached to report",
          });
          setShowVideoCamera(false);
        }}
        showScanFrame={false}
      />
    </div>
  );
}
