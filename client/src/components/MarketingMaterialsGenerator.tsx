import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Copy, Download, Mail } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

const MARKETING_MATERIALS = {
  "manheim-corporate": {
    title: "Manheim Corporate - Operations Efficiency Pitch",
    subject: "50% Cost Reduction: Replace 10 Systems with Lot Ops Pro",
    body: `Dear Manheim Operations Leadership,

I'm reaching out to introduce Lot Ops Pro, a comprehensive autonomous lot management platform specifically designed for auto auction facilities like yours.

**THE CHALLENGE YOU FACE:**
Currently, Manheim locations rely on 10+ separate contractor systems for:
• Van driver routing and performance tracking
• Inventory scanning and work order management
• Shift management and break tracking
• Safety incident reporting and compliance
• GPS navigation and lot space optimization

**OUR SOLUTION:**
Lot Ops Pro consolidates ALL these functions into one unified, mobile-first platform:

✓ OCR Camera Scanner - Autonomous work order scanning with live preview
✓ GPS Routing - Turn-by-turn navigation across your 263-acre facility
✓ Performance Tracking - Real-time MPH, quotas, bonus estimation
✓ Safety Monitoring - Speed violations, incident reporting with photo/video
✓ Shift Management - Clock in/out, break timers, personnel tracking
✓ AI Assistant - Voice I/O for instant guidance and support

**PROVEN AT MANHEIM NASHVILLE:**
This system was built and tested at Manheim Nashville (22-lane facility) with real operational data. It's ready for immediate deployment across your 82 North American locations.

**ROI PROJECTION:**
• 50-70% reduction in contractor overhead
• Eliminate 10 separate vendor relationships
• One unified platform, one support contact
• White-label deployment with your branding
• $299/month per location vs. $1,500+/month for multiple systems

**ENTERPRISE FEATURES:**
• Multi-facility management dashboard
• Custom integrations (payroll, HR, ERP systems)
• Dedicated account management and SLA guarantee
• On-site training and implementation support

Would you be available for a 15-minute demo this week? I can show you the live system running with Manheim Nashville data.

Best regards,
Jason Williams
Founder, DarkWave Studios
[Your contact information]

P.S. We also have deployment-ready configurations for ADESA, IAA, and other major auction groups. This is a proven, white-label solution designed for enterprise scale.`
  },
  
  "manheim-location": {
    title: "Manheim Location Manager - Immediate Operations Upgrade",
    subject: "Reduce Costs 50% at Your Facility - Lot Ops Pro Demo",
    body: `Hello [Location Manager Name],

I'm reaching out about a game-changing operations platform that could save your facility significant time and money while improving driver performance and safety.

**WHAT IT IS:**
Lot Ops Pro is an all-in-one mobile app that replaces multiple contractor systems you're currently using:

Instead of juggling:
❌ Separate GPS routing systems
❌ Manual performance tracking
❌ Paper-based safety reports
❌ Multiple vendor contracts
❌ Disconnected shift management

You get:
✅ ONE unified platform
✅ ONE monthly cost ($299/location)
✅ ONE support contact
✅ Real-time data and analytics

**BUILT FOR MANHEIM:**
This system was developed at Manheim Nashville and includes:
• Live OCR scanning for work orders
• GPS routing with lot space tracking
• Performance dashboards (MPH, quotas, efficiency)
• Safety incident reporting with photo capture
• Shift management with automated break timers
• 100+ custom themes (including Manheim branding)

**THE NUMBERS:**
Current typical costs: $1,500+/month across multiple vendors
Lot Ops Pro cost: $299/month
Annual savings: ~$14,400 per facility

**14-DAY FREE TRIAL:**
Try it risk-free for two weeks. If it doesn't dramatically improve your operations, no charge.

Can I send you a quick video demo or schedule a 10-minute call this week?

Best,
Jason Williams
[Contact info]`
  },

  "nissan-manufacturing": {
    title: "Nissan Manufacturing - Shift Operations Platform",
    subject: "Manufacturing Operations Platform - Built for Nissan Scale",
    body: `Dear Nissan Operations Team,

I'm reaching out through a referral from one of your former Smyrna plant supervisors who mentioned your current shift management system could use significant improvement.

**WHAT WE BUILT:**
Lot Ops Pro is an enterprise-grade operations platform originally designed for large-scale auto auction facilities, but perfectly suited for manufacturing plant operations:

**YOUR CHALLENGES:**
• Complex shift scheduling across multiple production lines
• Performance tracking for hundreds of workers
• Safety compliance and incident reporting
• Equipment tracking and movement logging
• Real-time communication between shifts and management

**OUR SOLUTION:**
✓ **Shift Management** - Automated clock in/out, break timers, grace periods
✓ **Performance Tracking** - Real-time metrics, quotas, efficiency scoring
✓ **Safety System** - Incident reporting with photo/video capture, speed monitoring
✓ **GPS Tracking** - Equipment movement, trip counting, mileage logging
✓ **AI Assistant** - Voice-activated guidance for workers and supervisors
✓ **Document Storage** - Reports, procedures, compliance docs (10MB per file)

**ENTERPRISE FEATURES:**
• Multi-facility deployment (Smyrna, Canton, Decherd plants)
• White-label with Nissan branding
• Custom integrations with existing HR/payroll systems
• Dedicated support and on-site training
• SLA guarantees for mission-critical operations

**PROOF OF CONCEPT:**
We can deploy a pilot program at one production line or shift to demonstrate ROI before facility-wide rollout.

**COST STRUCTURE:**
Tier-based pricing from $149/month (basic) to custom enterprise pricing
Significant volume discounts for multi-facility deployment
Replace multiple contractor systems with one unified platform

Would you be open to a brief conversation about your current pain points and how we might address them?

Best regards,
Jason Williams
Founder, DarkWave Studios
[Contact information]`
  },

  "adesa-auctions": {
    title: "ADESA - Competitive Advantage Opportunity",
    subject: "Modern Operations Platform - Built for Auto Auctions",
    body: `Dear ADESA Operations Leadership,

While this platform was initially developed for a Manheim facility, I believe ADESA could gain significant competitive advantage by deploying it first.

**WHAT IT DOES:**
Lot Ops Pro is a comprehensive mobile operations platform that handles:
• Autonomous OCR scanning and work order management
• GPS routing and real-time driver guidance
• Performance analytics and efficiency tracking
• Safety monitoring and compliance reporting
• Shift management and personnel tracking

**WHY ADESA SHOULD CONSIDER THIS:**
1. **First-mover advantage** - Deploy before Manheim corporate rolls it out
2. **Cost savings** - $299/month vs. $1,500+ for multiple contractor systems
3. **Modern technology** - Mobile-first, AI-powered, white-label ready
4. **Proven concept** - Already operational at a major auction facility
5. **Scalability** - Deploy across all ADESA locations with centralized management

**ENTERPRISE DEPLOYMENT:**
• Multi-location dashboard for corporate oversight
• Custom branding with ADESA colors and logos
• Integration with existing systems (payroll, HR, CRM)
• Dedicated implementation team and support
• Volume pricing for facility-wide deployment

**COMPETITIVE INTELLIGENCE:**
Your drivers and managers will have better tools than competitors, leading to:
• Faster vehicle processing times
• Higher driver satisfaction and retention
• Improved safety records
• Real-time operational visibility
• Data-driven decision making

Let's discuss how ADESA can lead the industry in operational technology.

Best regards,
Jason Williams
[Contact info]`
  },

  "car-dealership": {
    title: "Car Dealership - Lot Management Solution",
    subject: "Streamline Your Lot Operations - Save Time and Money",
    body: `Dear [Dealership Manager],

Managing a busy car dealership lot involves countless moving pieces - vehicle arrivals, detailing, inspections, test drives, deliveries, and more.

**COMMON DEALERSHIP CHALLENGES:**
❌ Lost vehicles on the lot ("Where did we park that Camry?")
❌ Manual inventory tracking with clipboards
❌ Inefficient lot attendant routing
❌ No performance metrics for lot staff
❌ Paper-based work orders and damage reports

**LOT OPS PRO SOLUTION:**
✅ OCR Scanner - Scan VIN/stock numbers instantly
✅ GPS Lot Map - Find any vehicle in seconds
✅ Digital Work Orders - No more clipboards
✅ Performance Tracking - Monitor lot attendant efficiency
✅ Photo Documentation - Damage reports with timestamps
✅ Customer Delivery - Track vehicle prep status in real-time

**DEALERSHIP-SPECIFIC FEATURES:**
• Track vehicles from arrival → detailing → sales floor → delivery
• Monitor lot attendant performance (vehicles moved per hour)
• Digital damage reports with photo evidence
• Customer delivery checklist and documentation
• Integration with DMS systems (Reynolds, CDK, DealerTrack)

**PRICING:**
Scanner Only: $49/month (perfect for small lots)
Full System: $149/month (includes GPS, performance tracking)
Enterprise: Custom pricing for dealership groups

**14-DAY FREE TRIAL:**
Try it completely free. No credit card required. See immediate results.

Ready to modernize your lot operations?

Best,
Jason Williams
[Contact]`
  },

  "equipment-yard": {
    title: "Equipment Yard - Inventory Management Platform",
    subject: "Equipment Tracking Made Simple - Lot Ops Pro",
    body: `Dear [Yard Manager],

Whether you manage construction equipment, farm machinery, or heavy trucks, keeping track of inventory across acres of yard space is challenging.

**YOUR CHALLENGES:**
• Finding specific equipment quickly
• Tracking movement in/out of the yard
• Recording equipment condition and damage
• Managing work orders and service tickets
• Monitoring yard personnel productivity

**LOT OPS PRO FOR EQUIPMENT YARDS:**
✓ **Equipment Scanner** - Scan serial numbers, asset tags, QR codes
✓ **GPS Yard Map** - Locate equipment instantly on digital map
✓ **Work Order System** - Digital service tickets and maintenance logs
✓ **Photo Documentation** - Before/after condition reports
✓ **Personnel Tracking** - Monitor yard staff efficiency
✓ **Mileage Logging** - Track equipment movement distances

**INVENTORY TYPES WE SUPPORT:**
• Construction Equipment (excavators, dozers, loaders)
• Farm Equipment (tractors, combines, implements)
• Trucks & Trailers (semi-trucks, flatbeds, tankers)
• RVs & Campers (motorhomes, travel trailers)
• Marine Equipment (boats, jet skis, trailers)

**FLEXIBLE PRICING:**
• Scanner Only: $49/month (basic tracking)
• Yard Ops Lite: $149/month (includes GPS mapping)
• Full Platform: $299/month (complete system)

**ROI EXAMPLE:**
Time saved finding equipment: 2 hours/day = $15,000/year
Reduced damage from better tracking: $5,000/year
Improved personnel efficiency: $10,000/year
Total annual value: $30,000 vs. $3,588/year cost

Want to see it in action at your yard?

Best regards,
Jason Williams
[Contact]`
  }
};

export function MarketingMaterialsGenerator() {
  const { toast } = useToast();
  const [selectedMaterial, setSelectedMaterial] = useState<string>("");
  const [content, setContent] = useState<string>("");

  const handleSelect = (value: string) => {
    setSelectedMaterial(value);
    const material = MARKETING_MATERIALS[value as keyof typeof MARKETING_MATERIALS];
    if (material) {
      setContent(material.body);
    }
  };

  const copyToClipboard = () => {
    navigator.clipboard.writeText(content);
    toast({ title: "Copied!", description: "Email template copied to clipboard" });
  };

  const downloadAsText = () => {
    const blob = new Blob([content], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${selectedMaterial}-email-template.txt`;
    a.click();
    toast({ title: "Downloaded!", description: "Template saved as text file" });
  };

  const openInEmail = () => {
    const material = MARKETING_MATERIALS[selectedMaterial as keyof typeof MARKETING_MATERIALS];
    if (!material) return;
    
    const subject = encodeURIComponent(material.subject);
    const body = encodeURIComponent(content);
    window.open(`mailto:?subject=${subject}&body=${body}`, "_blank");
  };

  return (
    <Card className="bg-white">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Mail className="h-5 w-5 text-blue-600" />
          Marketing Materials Generator
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <label className="text-sm font-medium">Select Target Audience</label>
          <Select value={selectedMaterial} onValueChange={handleSelect}>
            <SelectTrigger>
              <SelectValue placeholder="Choose a template..." />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="manheim-corporate">Manheim Corporate (Multi-Location)</SelectItem>
              <SelectItem value="manheim-location">Manheim Individual Location</SelectItem>
              <SelectItem value="nissan-manufacturing">Nissan Manufacturing Plants</SelectItem>
              <SelectItem value="adesa-auctions">ADESA Auto Auctions</SelectItem>
              <SelectItem value="car-dealership">Car Dealerships</SelectItem>
              <SelectItem value="equipment-yard">Equipment Yards</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {selectedMaterial && (
          <>
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <label className="text-sm font-medium">Email Template</label>
                <div className="flex gap-2">
                  <Button size="sm" variant="outline" onClick={copyToClipboard}>
                    <Copy className="h-4 w-4 mr-1" />
                    Copy
                  </Button>
                  <Button size="sm" variant="outline" onClick={downloadAsText}>
                    <Download className="h-4 w-4 mr-1" />
                    Download
                  </Button>
                  <Button size="sm" onClick={openInEmail}>
                    <Mail className="h-4 w-4 mr-1" />
                    Open in Email
                  </Button>
                </div>
              </div>
              <Textarea
                value={content}
                onChange={(e) => setContent(e.target.value)}
                className="min-h-[400px] font-mono text-sm"
                placeholder="Select a template to begin..."
              />
            </div>

            <div className="bg-blue-50 border-l-4 border-blue-500 p-3 rounded text-sm">
              <p className="font-semibold text-blue-900 mb-1">Pro Tip:</p>
              <p className="text-blue-800">
                Personalize the template with the recipient's name and specific facility details before sending. 
                Research their current pain points and customize the ROI projections to match their operation size.
              </p>
            </div>
          </>
        )}
      </CardContent>
    </Card>
  );
}
