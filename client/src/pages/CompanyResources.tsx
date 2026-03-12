import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { 
  ExternalLink, 
  DollarSign, 
  Heart, 
  Briefcase, 
  FileText, 
  CreditCard,
  Building2,
  Users,
  Shield,
  Calendar,
  Stethoscope,
  GraduationCap,
  FileSpreadsheet,
  Database,
  Video,
  BookOpen,
  Edit,
  Plus,
  Newspaper,
  Image,
  Save
} from "lucide-react";
import { Footer } from "@/components/Footer";
import { PageHeader } from "@/components/NavigationControl";

interface ResourceLink {
  id: string;
  title: string;
  description: string;
  url: string;
  icon: any;
  category: "benefits" | "payroll" | "company";
  status: "active" | "demo";
}

const COMPANY_RESOURCES: ResourceLink[] = [
  {
    id: "401k",
    title: "Vanguard 401(k) - Login",
    description: "Access your retirement account, check balance, adjust contributions",
    url: "https://my.vanguardplan.com/",
    icon: DollarSign,
    category: "benefits",
    status: "active"
  },
  {
    id: "hsa",
    title: "Optum Financial HSA - Login",
    description: "Health Savings Account balance, pay medical bills, submit claims",
    url: "https://www.optumbank.com/sign-in.html",
    icon: Heart,
    category: "benefits",
    status: "active"
  },
  {
    id: "benefits",
    title: "Cox Added Benefits Portal",
    description: "Medical, dental, vision insurance enrollment and management",
    url: "https://www.coxaddedbenefits.com/",
    icon: Shield,
    category: "benefits",
    status: "active"
  },
  {
    id: "payroll",
    title: "UKG Pro Payroll",
    description: "Pay stubs, W2s, 1099s, direct deposit settings, tax documents",
    url: "https://login.ultipro.com/",
    icon: CreditCard,
    category: "payroll",
    status: "active"
  },
  {
    id: "insite",
    title: "Cox InSite Portal",
    description: "Employee portal for company news, HR info, password resets",
    url: "https://insite.coxenterprises.com",
    icon: Users,
    category: "company",
    status: "active"
  },
  {
    id: "workday",
    title: "Workday (Inside Cox)",
    description: "Time tracking, schedules, employee self-service, HR requests",
    url: "https://insidecox.coxenterprises.com/",
    icon: Briefcase,
    category: "payroll",
    status: "active"
  },
  {
    id: "learnatcox",
    title: "Learn@Cox Training Portal",
    description: "Employee training, courses, LinkedIn Learning, skill development",
    url: "https://lms.coxcampus.org/",
    icon: GraduationCap,
    category: "company",
    status: "active"
  },
  {
    id: "cox-enterprises",
    title: "Cox Enterprises",
    description: "Parent company portal - Cox family of businesses (since 1898)",
    url: "https://www.coxenterprises.com",
    icon: Building2,
    category: "company",
    status: "active"
  },
  {
    id: "cox-auto",
    title: "Cox Automotive",
    description: "Cox Automotive family portal - Manheim, AutoTrader, KBB, and 20+ brands",
    url: "https://www.coxautoinc.com",
    icon: Briefcase,
    category: "company",
    status: "active"
  },
  {
    id: "manheim",
    title: "Manheim Corporate",
    description: "Manheim-specific resources, auction news, and location information",
    url: "https://www.manheim.com",
    icon: Building2,
    category: "company",
    status: "active"
  },
  {
    id: "hr",
    title: "HR Department Contact",
    description: "Direct contact for HR questions, issues, and support",
    url: "mailto:hr@manheim.com",
    icon: Users,
    category: "company",
    status: "demo"
  }
];

interface CompanyNews {
  message: string;
  imageUrl?: string;
  updatedBy?: string;
  updatedAt?: string;
}

export default function CompanyResources() {
  const { toast } = useToast();
  const [userRole, setUserRole] = useState<string>("");
  const [canEdit, setCanEdit] = useState(false);
  const [showNewsEditor, setShowNewsEditor] = useState(false);
  
  // Company News state
  const [companyNews, setCompanyNews] = useState<CompanyNews>({
    message: "Welcome to the new Corporate Portal! Access all your employee resources in one place.",
    imageUrl: "",
  });
  
  const [editNews, setEditNews] = useState<CompanyNews>(companyNews);

  useEffect(() => {
    const userStr = localStorage.getItem("vanops_user");
    if (userStr) {
      try {
        const user = JSON.parse(userStr);
        
        // SECURITY: Temporary employees cannot access Company Resources
        if (user.employeeType === "temporary") {
          toast({
            title: "Access Restricted",
            description: "Temporary employees cannot access Company Resources",
            variant: "destructive",
          });
          setTimeout(() => window.location.href = "/scanner", 500);
          return;
        }
        
        setUserRole(user.role || "");
        // Only supervisors, operations_manager, and developer can edit
        setCanEdit(["supervisor", "operations_manager", "developer"].includes(user.role));
      } catch {
        setCanEdit(false);
      }
    }
    
    // Load saved company news from localStorage
    const savedNews = localStorage.getItem("company_news");
    if (savedNews) {
      try {
        const newsData = JSON.parse(savedNews);
        setCompanyNews(newsData);
        setEditNews(newsData);
      } catch {
        // Use default
      }
    }
  }, []);

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Check file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      toast({
        title: "Image too large",
        description: "Please use an image smaller than 5MB",
        variant: "destructive",
      });
      return;
    }

    // Check file type
    if (!file.type.startsWith('image/')) {
      toast({
        title: "Invalid file type",
        description: "Please upload an image file (JPEG, PNG, GIF, etc.)",
        variant: "destructive",
      });
      return;
    }

    // Convert to base64
    const reader = new FileReader();
    reader.onload = (event) => {
      const base64String = event.target?.result as string;
      setEditNews({ ...editNews, imageUrl: base64String });
    };
    reader.readAsDataURL(file);
  };

  const handleSaveNews = () => {
    const newsData = {
      ...editNews,
      updatedBy: userRole,
      updatedAt: new Date().toISOString(),
    };
    
    localStorage.setItem("company_news", JSON.stringify(newsData));
    setCompanyNews(newsData);
    setShowNewsEditor(false);
    
    toast({
      title: "✓ Company News Updated",
      description: "All employees will see the updated announcement",
    });
  };

  const handleLinkClick = (resource: ResourceLink) => {
    if (resource.status === "demo") {
      alert(`Demo Link: ${resource.title}\n\nIn production, this would open:\n${resource.url}\n\nYour browser would remember your login credentials for that site automatically.`);
    } else {
      window.open(resource.url, '_blank', 'noopener,noreferrer');
    }
  };

  const benefitsLinks = COMPANY_RESOURCES.filter(r => r.category === "benefits");
  const payrollLinks = COMPANY_RESOURCES.filter(r => r.category === "payroll");
  const companyLinks = COMPANY_RESOURCES.filter(r => r.category === "company");

  return (
    <div className="space-y-6 p-6 pb-20">
      <PageHeader title="Corporate Portal" navigationVariant="back" fallbackRoute="/dashboard" />
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm text-slate-600 mt-1">
            Cox Enterprises, Inc. → Cox Automotive → Manheim
          </p>
          <p className="text-xs text-slate-500 mt-0.5">
            Manheim Nashville • Part of the Cox Automotive family since 1968
          </p>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex flex-col items-end gap-1">
            <Badge variant="outline" className="text-xs bg-blue-50 text-blue-700 border-blue-300">
              Cox Automotive
            </Badge>
            <span className="text-xs text-slate-500">Est. 1898</span>
          </div>
          {canEdit && (
            <Button 
              variant="outline" 
              size="sm"
              className="bg-amber-50 border-amber-300 text-amber-700 hover:bg-amber-100"
              data-testid="button-edit-portal"
            >
              <Edit className="h-4 w-4 mr-2" />
              Manage Portal
            </Button>
          )}
        </div>
      </div>

      {/* Company News Section */}
      <Card className="bg-gradient-to-r from-blue-600 to-purple-600 text-white">
        <CardContent className="p-4">
          <div className="flex items-start justify-between gap-3">
            <div className="flex items-start gap-3 flex-1">
              <Newspaper className="h-6 w-6 mt-0.5 flex-shrink-0" />
              <div className="flex-1">
                <h3 className="font-bold text-base mb-1">Company Updates</h3>
                <p className="text-sm text-white/90 mb-3">
                  Weekly updates, announcements, and important notices posted by management
                </p>
                
                {companyNews.imageUrl && (
                  <div className="mb-3">
                    <img 
                      src={companyNews.imageUrl} 
                      alt="Announcement" 
                      className="rounded-lg max-h-48 w-auto object-contain"
                    />
                  </div>
                )}
                
                <div className="bg-white/10 rounded p-3 text-sm">
                  {companyNews.message}
                </div>
                
                {companyNews.updatedAt && (
                  <p className="text-xs text-white/60 mt-2">
                    Last updated: {new Date(companyNews.updatedAt).toLocaleDateString()}
                  </p>
                )}
              </div>
            </div>
            {canEdit && (
              <Button 
                variant="ghost" 
                size="sm"
                className="text-white hover:bg-white/20 flex-shrink-0"
                onClick={() => {
                  setEditNews(companyNews);
                  setShowNewsEditor(true);
                }}
                data-testid="button-edit-news"
              >
                <Edit className="h-4 w-4" />
              </Button>
            )}
          </div>
        </CardContent>
      </Card>
      
      {/* News Editor Dialog */}
      <Dialog open={showNewsEditor} onOpenChange={setShowNewsEditor}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Newspaper className="h-5 w-5 text-blue-600" />
              Edit Company News
            </DialogTitle>
          </DialogHeader>
          
          <div className="space-y-4 py-4">
            <div>
              <Label className="text-sm font-semibold">Announcement Message</Label>
              <Textarea
                value={editNews.message}
                onChange={(e) => setEditNews({ ...editNews, message: e.target.value })}
                placeholder="Example: Reminder - Christmas party on December 12th at 6pm! Bring your family!"
                className="mt-2 min-h-32"
                data-testid="textarea-news-message"
              />
              <p className="text-xs text-slate-500 mt-1">
                This message appears to all employees on the Corporate Portal
              </p>
            </div>
            
            <div className="space-y-3">
              <Label className="text-sm font-semibold flex items-center gap-2">
                <Image className="h-4 w-4" />
                Add Image (Optional)
              </Label>
              
              {/* File Upload Button */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div>
                  <Input
                    type="file"
                    accept="image/*"
                    capture="environment"
                    onChange={handleImageUpload}
                    className="cursor-pointer"
                    data-testid="input-upload-image"
                  />
                  <p className="text-xs text-slate-500 mt-1">
                    📸 Take photo or upload JPEG/PNG
                  </p>
                </div>
                
                <div>
                  <Input
                    value={editNews.imageUrl?.startsWith('data:') ? '' : (editNews.imageUrl || "")}
                    onChange={(e) => setEditNews({ ...editNews, imageUrl: e.target.value })}
                    placeholder="https://i.giphy.com/..."
                    data-testid="input-news-image-url"
                  />
                  <p className="text-xs text-slate-500 mt-1">
                    🔗 Or paste image URL from web
                  </p>
                </div>
              </div>
            </div>
            
            {editNews.imageUrl && (
              <div className="border rounded-lg p-3 bg-slate-50">
                <div className="flex items-center justify-between mb-2">
                  <p className="text-xs font-semibold text-slate-700">Preview:</p>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setEditNews({ ...editNews, imageUrl: "" })}
                    className="text-xs text-red-600 hover:text-red-700 hover:bg-red-50"
                  >
                    Remove Image
                  </Button>
                </div>
                <img 
                  src={editNews.imageUrl} 
                  alt="Preview" 
                  className="rounded max-h-64 w-full object-contain bg-white"
                  onError={(e) => {
                    (e.target as HTMLImageElement).style.display = 'none';
                  }}
                />
                <p className="text-xs text-slate-500 mt-2">
                  {editNews.imageUrl.startsWith('data:') ? '📸 Uploaded image' : '🔗 Image from URL'}
                </p>
              </div>
            )}
          </div>
          
          <DialogFooter>
            <Button 
              variant="outline" 
              onClick={() => setShowNewsEditor(false)}
            >
              Cancel
            </Button>
            <Button 
              onClick={handleSaveNews}
              className="bg-blue-600 hover:bg-blue-700"
              data-testid="button-save-news"
            >
              <Save className="h-4 w-4 mr-2" />
              Save & Publish
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Info Banners - Side by Side */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        <Card className="bg-blue-50 border-blue-200">
          <CardContent className="p-3">
            <div className="flex items-start gap-3">
              <Shield className="h-5 w-5 text-blue-600 mt-0.5" />
              <div className="flex-1">
                <h3 className="font-semibold text-blue-900 text-sm">Password Memory</h3>
                <p className="text-xs text-blue-800 mt-1">
                  Browser automatically saves credentials when logging into external portals. No re-entry required on return visits.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-slate-100 border-slate-300">
          <CardContent className="p-3">
            <div className="flex items-start gap-3">
              <Building2 className="h-5 w-5 text-slate-600 mt-0.5" />
              <div className="flex-1">
                <h3 className="font-semibold text-slate-900 text-sm">One-Click Access</h3>
                <p className="text-xs text-slate-700 mt-1">
                  Centralized portal for all employee resources. Click any card to open the respective external service.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Benefits & Insurance */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Heart className="h-5 w-5 text-red-600" />
            <h2 className="text-base font-semibold text-slate-900">Benefits & Insurance</h2>
          </div>
          {canEdit && (
            <Button 
              variant="ghost" 
              size="sm"
              className="text-slate-600 hover:bg-slate-100"
              data-testid="button-add-benefit"
            >
              <Plus className="h-4 w-4 mr-1" />
              Add Link
            </Button>
          )}
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {benefitsLinks.map((resource) => {
            const Icon = resource.icon;
            return (
              <Card 
                key={resource.id} 
                className="group hover:shadow-xl transition-all duration-300 cursor-pointer border-2 hover:border-blue-400 hover:scale-105 bg-gradient-to-br from-white to-blue-50"
                onClick={() => handleLinkClick(resource)}
                data-testid={`card-resource-${resource.id}`}
              >
                <CardContent className="p-4">
                  <div className="flex items-center gap-3">
                    <div className="bg-gradient-to-br from-blue-500 to-blue-600 p-3 rounded-xl shadow-lg group-hover:shadow-xl transition-shadow">
                      <Icon className="h-7 w-7 text-white" />
                    </div>
                    <div className="flex-1">
                      <div className="flex items-start justify-between">
                        <div>
                          <h3 className="font-bold text-slate-900 text-base mb-1">{resource.title}</h3>
                          <p className="text-xs text-slate-600 leading-relaxed">{resource.description}</p>
                        </div>
                        <ExternalLink className="h-5 w-5 text-blue-500 ml-2 flex-shrink-0 group-hover:text-blue-600" />
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </div>

      {/* Payroll & Compensation */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <CreditCard className="h-5 w-5 text-green-600" />
            <h2 className="text-base font-semibold text-slate-900">Payroll & Compensation</h2>
          </div>
          {canEdit && (
            <Button 
              variant="ghost" 
              size="sm"
              className="text-slate-600 hover:bg-slate-100"
              data-testid="button-add-payroll"
            >
              <Plus className="h-4 w-4 mr-1" />
              Add Link
            </Button>
          )}
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {payrollLinks.map((resource) => {
            const Icon = resource.icon;
            return (
              <Card 
                key={resource.id} 
                className="group hover:shadow-xl transition-all duration-300 cursor-pointer border-2 hover:border-green-400 hover:scale-105 bg-gradient-to-br from-white to-green-50"
                onClick={() => handleLinkClick(resource)}
                data-testid={`card-resource-${resource.id}`}
              >
                <CardContent className="p-4">
                  <div className="flex items-center gap-3">
                    <div className="bg-gradient-to-br from-green-500 to-green-600 p-3 rounded-xl shadow-lg group-hover:shadow-xl transition-shadow">
                      <Icon className="h-7 w-7 text-white" />
                    </div>
                    <div className="flex-1">
                      <div className="flex items-start justify-between">
                        <div>
                          <h3 className="font-bold text-slate-900 text-base mb-1">{resource.title}</h3>
                          <p className="text-xs text-slate-600 leading-relaxed">{resource.description}</p>
                        </div>
                        <ExternalLink className="h-5 w-5 text-green-500 ml-2 flex-shrink-0 group-hover:text-green-600" />
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </div>

      {/* Company Resources */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Building2 className="h-5 w-5 text-slate-600" />
            <h2 className="text-base font-semibold text-slate-900">Company Resources</h2>
          </div>
          {canEdit && (
            <Button 
              variant="ghost" 
              size="sm"
              className="text-slate-600 hover:bg-slate-100"
              data-testid="button-add-resource"
            >
              <Plus className="h-4 w-4 mr-1" />
              Add Link
            </Button>
          )}
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {companyLinks.map((resource) => {
            const Icon = resource.icon;
            return (
              <Card 
                key={resource.id} 
                className="group hover:shadow-xl transition-all duration-300 cursor-pointer border-2 hover:border-slate-400 hover:scale-105 bg-gradient-to-br from-white to-slate-50"
                onClick={() => handleLinkClick(resource)}
                data-testid={`card-resource-${resource.id}`}
              >
                <CardContent className="p-4">
                  <div className="flex items-center gap-3">
                    <div className="bg-gradient-to-br from-slate-600 to-slate-700 p-3 rounded-xl shadow-lg group-hover:shadow-xl transition-shadow">
                      <Icon className="h-7 w-7 text-white" />
                    </div>
                    <div className="flex-1">
                      <div className="flex items-start justify-between">
                        <div>
                          <h3 className="font-bold text-slate-900 text-base mb-1">{resource.title}</h3>
                          <p className="text-xs text-slate-600 leading-relaxed">{resource.description}</p>
                        </div>
                        <ExternalLink className="h-5 w-5 text-slate-500 ml-2 flex-shrink-0 group-hover:text-slate-600" />
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </div>

      {/* Expandable Features - Version 2.0 */}
      <div className="space-y-4 pt-4 border-t-2 border-slate-200">
        <div>
          <h2 className="text-lg font-semibold text-slate-900 mb-1">Expandable Capabilities</h2>
          <p className="text-xs text-slate-600">
            Additional features the system can accommodate based on organizational requirements
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Personal Medical Contacts */}
          <Card className="border-2 border-dashed border-slate-300 bg-slate-50">
            <CardHeader className="pb-3">
              <div className="flex items-center gap-3">
                <div className="bg-white p-2 rounded-lg border border-slate-300">
                  <Stethoscope className="h-5 w-5 text-purple-600" />
                </div>
                <CardTitle className="text-sm">Medical Contacts</CardTitle>
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-xs text-slate-600 mb-2">
                Securely store primary doctor, dentist, specialist contacts with direct portal links
              </p>
              <Badge variant="outline" className="text-[10px]">Personal Health Directory</Badge>
            </CardContent>
          </Card>

          {/* Training Portal */}
          <Card className="border-2 border-dashed border-slate-300 bg-slate-50">
            <CardHeader className="pb-3">
              <div className="flex items-center gap-3">
                <div className="bg-white p-2 rounded-lg border border-slate-300">
                  <GraduationCap className="h-5 w-5 text-blue-600" />
                </div>
                <CardTitle className="text-sm">Training Portal</CardTitle>
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-xs text-slate-600 mb-2">
                Embedded training videos, completion tracking, and automated reporting export (CSV/PDF)
              </p>
              <Badge variant="outline" className="text-[10px]">Learning Management</Badge>
            </CardContent>
          </Card>

          {/* Tax & HR Documents */}
          <Card className="border-2 border-dashed border-slate-300 bg-slate-50">
            <CardHeader className="pb-3">
              <div className="flex items-center gap-3">
                <div className="bg-white p-2 rounded-lg border border-slate-300">
                  <FileSpreadsheet className="h-5 w-5 text-green-600" />
                </div>
                <CardTitle className="text-sm">Tax Documents</CardTitle>
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-xs text-slate-600 mb-2">
                W-4 updates, W-2 access, tax withholding adjustments, and direct HR portal integration
              </p>
              <Badge variant="outline" className="text-[10px]">Document Management</Badge>
            </CardContent>
          </Card>

          {/* Data Export */}
          <Card className="border-2 border-dashed border-slate-300 bg-slate-50">
            <CardHeader className="pb-3">
              <div className="flex items-center gap-3">
                <div className="bg-white p-2 rounded-lg border border-slate-300">
                  <Database className="h-5 w-5 text-indigo-600" />
                </div>
                <CardTitle className="text-sm">Data Export</CardTitle>
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-xs text-slate-600 mb-2">
                Training completion reports, attendance logs, and performance data export capabilities
              </p>
              <Badge variant="outline" className="text-[10px]">CSV / PDF Export</Badge>
            </CardContent>
          </Card>

          {/* Video Library */}
          <Card className="border-2 border-dashed border-slate-300 bg-slate-50">
            <CardHeader className="pb-3">
              <div className="flex items-center gap-3">
                <div className="bg-white p-2 rounded-lg border border-slate-300">
                  <Video className="h-5 w-5 text-red-600" />
                </div>
                <CardTitle className="text-sm">Training Videos</CardTitle>
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-xs text-slate-600 mb-2">
                Centralized video library for safety training, operational procedures, and onboarding content
              </p>
              <Badge variant="outline" className="text-[10px]">Media Integration</Badge>
            </CardContent>
          </Card>

          {/* Knowledge Base */}
          <Card className="border-2 border-dashed border-slate-300 bg-slate-50">
            <CardHeader className="pb-3">
              <div className="flex items-center gap-3">
                <div className="bg-white p-2 rounded-lg border border-slate-300">
                  <BookOpen className="h-5 w-5 text-amber-600" />
                </div>
                <CardTitle className="text-sm">Knowledge Base</CardTitle>
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-xs text-slate-600 mb-2">
                Company policies, SOPs, FAQs, and searchable documentation repository
              </p>
              <Badge variant="outline" className="text-[10px]">Information Hub</Badge>
            </CardContent>
          </Card>
        </div>

        {/* Capability Statement - Side by Side */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Card className="bg-slate-100 border-slate-300">
            <CardContent className="p-4">
              <div className="text-xs text-slate-700">
                <p className="font-semibold mb-2">Platform Capabilities:</p>
                <ul className="list-disc list-inside space-y-1 ml-2 text-slate-600">
                  <li>Secure healthcare provider storage</li>
                  <li>HR and payroll system integration</li>
                  <li>Training completion tracking</li>
                  <li>Tax form document management</li>
                  <li>Video hosting and learning modules</li>
                  <li>CSV/PDF data export for compliance</li>
                </ul>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-amber-50 border-amber-200">
            <CardContent className="p-4">
              <div className="text-xs text-amber-800">
                <p className="font-semibold mb-2">Implementation Notes:</p>
                <p className="mb-2">
                  Demonstration shows potential system extensions based on organizational requirements.
                </p>
                <p className="text-[11px] text-amber-700 italic">
                  Platform adapts to specific workflows and security requirements. Replace demo links with actual portal URLs when implementing.
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
      
      {/* Footer */}
      <Footer />
    </div>
  );
}
