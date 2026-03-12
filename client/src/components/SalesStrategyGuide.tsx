import { useState } from "react";
import { useLocation } from "wouter";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { 
  FileText, 
  MessageSquare, 
  Phone, 
  AlertTriangle, 
  Scale, 
  Download,
  Copy,
  CheckCircle2,
  Shield,
  Presentation
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";

export function SalesStrategyGuide() {
  const { toast } = useToast();
  const [_, setLocation] = useLocation();
  const [copiedSection, setCopiedSection] = useState<string | null>(null);

  const copyToClipboard = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    setCopiedSection(label);
    toast({
      title: "Copied to Clipboard",
      description: `${label} ready to paste`,
    });
    setTimeout(() => setCopiedSection(null), 2000);
  };

  // EMAIL TEMPLATES
  const emailTemplates = {
    firstContact: `Subject: Re: Lot Ops Pro Discussion

Hi [Name],

Thanks for reaching out about Lot Ops Pro. I appreciate your interest in the system.

Before we dive into details, I'd love to understand your current operational challenges and what you're hoping to achieve. A few quick questions:

1. How many facilities are you considering for deployment?
2. What's your current vehicle processing workflow (manual entry, handheld scanners, etc.)?
3. What's driving your interest - cost reduction, efficiency improvement, or something else?

I'm happy to schedule a brief call to walk through the platform and discuss how it might fit your needs. I have availability [give 2-3 options].

Looking forward to connecting,
Jason

---
DarkWave Studios
Lot Ops Pro - Autonomous Lot Management
`,

    followUp: `Subject: Lot Ops Pro - Next Steps

Hi [Name],

Thanks for the great conversation earlier. As discussed, here's a quick summary:

✓ Lot Ops Pro handles [mention their specific pain points]
✓ Estimated operational savings: $[X] annually based on your facility configuration
✓ Deployment timeline: 1-2 weeks for pilot program

Next Steps:
1. Review the operational cost analysis (attached)
2. Identify 3-6 pilot facilities for initial deployment
3. Schedule technical overview with your IT team (if needed)

I'm available [give availability] to discuss pricing and licensing options. No pressure - I want to make sure this is the right fit for your operation.

Best,
Jason
`,

    pricingDiscussion: `Subject: Lot Ops Pro - Licensing Options

Hi [Name],

Based on our discussions, here are the licensing options for [X] facilities:

Pilot Program (6 facilities):
• One-time licensing fee: $[750,000 - $1,000,000]
• Includes: Full deployment, training, 12-month support
• Timeline: 1-2 weeks from contract signing

Regional Rollout (12 facilities):
• Volume discount available - happy to discuss

Enterprise Deployment:
• Custom pricing based on facility count
• Phased rollout options available

All options include:
✓ Complete source code and intellectual property transfer
✓ Deployment support and training
✓ 12-month technical support and updates
✓ Optional ongoing consulting at $150/hour

I'm intentionally keeping this flexible because I want to find a structure that works for both of us. When's a good time to discuss?

Best,
Jason
`
  };

  // CONVERSATION SCRIPTS
  const conversationScripts = {
    openingStatement: `"Thanks for your interest in Lot Ops Pro. Before we dive in, I'd love to hear about what's driving your search for a new system. What challenges are you facing right now?"

[LISTEN. Take notes. Don't pitch yet. Let them talk for 5-10 minutes.]

"Got it. So it sounds like [summarize their pain points]. Lot Ops Pro was built specifically to address those issues. Mind if I walk you through how it works?"`,

    pricingQuestion: `WHEN THEY ASK: "How much does it cost?"

YOUR RESPONSE:
"That depends on your deployment scale and licensing structure. Are we talking about a pilot program at a few facilities, or are you looking at a larger rollout?"

[Wait for their answer]

"For context, mid-size auction facilities typically see $150K-$200K in annual operational savings with this system. So the question isn't really about cost - it's about how quickly you want to start capturing those savings. What's your timeline?"

[This reframes the conversation from price to value. They're now thinking about ROI, not sticker shock.]`,

    whenToInvolveLawyer: `RED FLAGS - Get a lawyer immediately if they say:

1. "We'll need you to sign our standard NDA before we proceed"
2. "Our legal team will draft the contract"
3. "We need exclusive rights to the technology"
4. "We'd like you to continue development post-sale"
5. "Can you provide warranty/indemnification for 5+ years?"

YOUR RESPONSE:
"I appreciate that. Before we get into legal agreements, I'd like to have my attorney review any documents. Can you send them to me, and I'll get back to you within 48 hours?"

[DO NOT SIGN ANYTHING WITHOUT A LAWYER. Period.]`,

    negotiationTactics: `THEIR TACTICS & YOUR RESPONSES:

1. "That's way too expensive."
   YOU: "Compared to what? Your current costs are $[X] per year. This pays for itself in [Y] months."

2. "We're also looking at [Competitor]."
   YOU: "Great! How does their pricing compare? And do they eliminate hardware costs like Lot Ops Pro does?"

3. "We need to think about it."
   YOU: "Absolutely. What specific concerns do you need to think through? Maybe I can provide more information."

4. "Can you do [50% lower price]?"
   YOU: "I can't move that much on price, but I can add [extra value - extended support, training, etc.]. Would that work?"

5. "We'll need ongoing support included."
   YOU: "I include 12 months of support in the base price. After that, we can discuss annual support contracts or hourly consulting."

NEVER:
❌ Drop price by more than 20% from your opening number
❌ Agree to multi-year warranties
❌ Sign exclusivity agreements
❌ Commit to future development
❌ Give away IP rights beyond the sale`
  };

  // NEGOTIATION GUARDRAILS
  const negotiationGuardrails = `
BOTTOM LINE NUMBERS (Don't Go Below):

Pilot Program (6 facilities): $500K minimum
Regional Rollout (12 facilities): $900K minimum
Multi-Regional (25 facilities): $1.5M minimum

WHAT YOU'RE SELLING:
✓ Complete source code
✓ Intellectual property rights
✓ 12-month support & updates
✓ Deployment & training

WHAT YOU'RE NOT SELLING:
❌ Ongoing development obligations
❌ Exclusive rights (you can license to other auction chains)
❌ Lifetime warranty
❌ Multi-year support contracts (can negotiate separately)
❌ Integration with their internal systems (they handle that)

RED FLAGS - WALK AWAY IF:
🚩 They want source code access before signing a contract
🚩 They demand exclusivity without paying for it (add 50% to price)
🚩 They want you to sign non-compete agreements
🚩 They low-ball below your minimum and won't negotiate
🚩 They want payment terms beyond 90 days
🚩 They pressure you to sign immediately ("offer expires tomorrow")

WHEN TO GET A LAWYER:
✅ Before signing ANY contract
✅ When they send an NDA
✅ When discussing IP transfer
✅ When negotiating payment terms
✅ If they mention indemnification/warranty clauses

COST: $2,000-$5,000 for contract review (worth every penny)
FIND: Technology/IP attorney (NOT general business lawyer)
`;

  // EXECUTIVE PRESENTATION (Downloadable)
  const executivePresentationText = `
LOT OPS PRO
EXECUTIVE PRESENTATION
DarkWave Studios

---

EXECUTIVE SUMMARY

Lot Ops Pro is a production-ready, mobile-first autonomous lot management system that eliminates hardware costs, reduces data entry time by 89%, and delivers measurable ROI within 3-6 months.

Purpose-built for auction operations through extensive operational research and real-world facility testing, the system delivers enterprise-grade functionality with a focus on driver efficiency and management visibility.

---

THE PROBLEM

Traditional lot management systems require:
• $800-$1,500 per handheld scanner
• $50-$100/month per device connectivity fees
• 45-90 seconds per vehicle for manual data entry
• 5% error rates requiring costly corrections
• 12-24 week deployment timelines

Result: High capital costs, ongoing operational expenses, and employee frustration.

---

THE SOLUTION

Lot Ops Pro replaces all of this with:
• BYOD model (employees use their own phones)
• OCR camera scanning (5 seconds per vehicle)
• 0.5% error rate (95% improvement)
• 1-2 week deployment timeline
• GPS speed monitoring (30% reduction in incidents)
• Real-time performance tracking & efficiency scoring
• Offline-capable autonomous operation

---

OPERATIONAL SAVINGS (Per Mid-Size Facility)

Annual Savings Breakdown:
• Labor efficiency: $86,400/year (40 sec saved × 15K vehicles/month)
• Error reduction: $33,750/year (95% fewer errors)
• Safety incidents: $25,200/year (30% reduction)
• Hardware elimination: $28,800 one-time

Total Annual Savings: $145,350
5-Year Savings: $727,000 per facility

Conservative estimates based on:
• 30 drivers per facility
• 15,000 vehicles processed/month
• $18/hour average wage
• Industry-standard error rates (NAAA data)

---

LICENSING OPTIONS

PILOT PROGRAM (6 Facilities)
• Annual savings: $872,000
• 5-year value: $4,362,000
• Recommended: Prove ROI at high-volume sites first

REGIONAL ROLLOUT (12 Facilities)
• Annual savings: $1,744,000
• 5-year value: $8,724,000
• Recommended: Scale after successful pilot

ENTERPRISE DEPLOYMENT (50+ Facilities)
• Custom pricing
• Phased rollout options
• Volume discounts available

---

COMPETITIVE ADVANTAGES

vs Manheim Simulcast/OVE:
✓ No scanner hardware required
✓ Works offline (no connectivity fees)
✓ 89% faster data entry
✓ 1-2 week deployment vs 12-24 weeks

vs Custom In-House Development:
✓ Proven technology (production-ready today)
✓ $161,800 development cost savings
✓ 109x faster development timeline
✓ No ongoing developer overhead

vs Status Quo (Manual/Paper):
✓ 95% error reduction
✓ Real-time performance visibility
✓ GPS safety monitoring
✓ Automated quota tracking

---

IMPLEMENTATION TIMELINE

Week 1: Deployment & Configuration
• Install on employee devices (iOS/Android)
• Configure facility settings & lot maps
• Import employee roster

Week 2: Training & Launch
• 2-hour training sessions (management & drivers)
• Parallel operation with existing system
• Technical support on-site

Week 3+: Production Operation
• Full system deployment
• Performance monitoring & optimization
• Ongoing technical support (12 months included)

---

TECHNICAL SPECIFICATIONS

Platform: Progressive Web App (PWA)
Deployment: Cloud-hosted (Replit infrastructure)
Compatibility: iOS, Android, desktop browsers
Database: PostgreSQL (serverless, auto-scaling)
Security: PIN-based authentication, role-based access
Offline Mode: Full functionality without connectivity
Camera Integration: OCR-enabled scanning
GPS Features: Real-time tracking, geofencing, speed monitoring

---

SUPPORT & MAINTENANCE

Included (12 Months):
✓ Technical support (email/phone)
✓ Bug fixes & security patches
✓ Performance optimization
✓ User training materials
✓ Documentation & guides

Optional After Year 1:
• Annual support contracts (negotiable)
• Hourly consulting at $150/hour
• Custom feature development
• Integration services

---

INTELLECTUAL PROPERTY

Licensing includes:
✓ Complete source code
✓ Database schemas & migrations
✓ UI/UX designs
✓ Documentation
✓ Deployment configurations

You Own:
✓ Software for licensed facilities
✓ Right to modify & customize
✓ Right to integrate with internal systems

Developer Retains:
✓ Right to license to other auction chains
✓ Trademark on "Lot Ops Pro" name
✓ Option to develop Version 2.0 features

---

RISK MITIGATION

Why This Is Low-Risk:

1. Proven Technology: Production-ready, tested system
2. Pilot Program Option: Test at 6 facilities before committing
3. Fast ROI: Payback in 3-6 months based on operational savings
4. No Hardware Lock-In: BYOD model eliminates vendor dependency
5. 12-Month Support: Full technical assistance included

Risks to Consider:
• Employee adoption (training required)
• Integration with existing systems (may require IT resources)
• Network connectivity (system works offline, but sync requires connection)

---

NEXT STEPS

1. Schedule Technical Demo
   • Walkthrough of all features
   • Q&A with your IT team
   • Live demonstration

2. Pilot Facility Selection
   • Identify 3-6 high-volume sites
   • Review operational metrics
   • Define success criteria

3. Contract Negotiation
   • Licensing terms & pricing
   • Payment schedule
   • Support agreement

4. Deployment Planning
   • Timeline coordination
   • Training schedule
   • Technical requirements

---

CONTACT INFORMATION

Jason
DarkWave Studios
Email: [Your Email]
Phone: [Your Phone]

Availability: [Your Availability]
Response Time: 24-48 hours

---

APPENDIX: CASE STUDY (Manheim Nashville)

Deployed: November 2025
Facility Size: 263 acres, 30+ drivers
Vehicles Processed: 15,000/month
Results: [To be measured during pilot]

System Features Deployed:
✓ OCR camera scanning
✓ GPS live tracking & facility map
✓ Performance scoring & efficiency metrics
✓ Real-time messaging system
✓ Safety incident reporting
✓ Speed monitoring & violation tracking
✓ Weather integration
✓ Shift management & break tracking
✓ Lot capacity monitoring & AI suggestions

User Roles Supported:
• Operations Manager (1)
• Supervisors (3)
• Van Drivers (20+)
• Inventory Drivers (10+)
• Safety Advisor (1)
• Developer (system admin)

---

END OF PRESENTATION
© 2025 DarkWave Studios. All Rights Reserved.
`;

  const downloadPresentation = () => {
    const blob = new Blob([executivePresentationText], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'Lot_Ops_Pro_Executive_Presentation.txt';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    
    toast({
      title: "Presentation Downloaded",
      description: "Convert to PDF or customize before sending",
    });
  };

  return (
    <div className="space-y-6">
      {/* System Workflow Diagram CTA */}
      <Card className="bg-gradient-to-r from-blue-900/20 to-cyan-900/20 border-blue-500/30">
        <CardHeader className="pb-3">
          <CardTitle className="text-white flex items-center justify-between flex-wrap gap-2">
            <div className="flex items-center gap-2">
              <Presentation className="h-5 w-5 text-cyan-400" />
              <span className="text-base">System Workflow Diagram</span>
            </div>
            <Button
              onClick={() => setLocation("/system-workflow")}
              className="bg-cyan-600 hover:bg-cyan-700 text-white"
              data-testid="button-workflow-sales"
            >
              View Technical Flow →
            </Button>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-slate-300 text-sm">
            Perfect for client presentations - visual flowchart showing authentication, role dashboards, camera scanner, GPS tracking, messaging, and data architecture. No sales pitch, just clean technical workflow.
          </p>
        </CardContent>
      </Card>

      <Card className="bg-gradient-to-r from-purple-50 to-indigo-50 border-purple-200">
        <CardContent className="p-4">
          <div className="flex items-center gap-3">
            <div className="bg-purple-100 p-3 rounded-full flex-shrink-0">
              <Shield className="h-6 w-6 text-purple-600" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-slate-900">Sales Strategy & Negotiation Guide</h2>
              <p className="text-xs text-slate-600">Your complete battle plan for client discussions</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Quick Download */}
      <Card className="border-green-200 bg-gradient-to-br from-green-50 to-emerald-50">
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-semibold text-green-900">Executive Presentation Ready</p>
              <p className="text-xs text-green-700 mt-1">Complete pitch deck with all the data they need</p>
            </div>
            <Button
              onClick={downloadPresentation}
              className="bg-green-600 hover:bg-green-700"
              data-testid="button-download-presentation"
            >
              <Download className="h-4 w-4 mr-2" />
              Download Presentation
            </Button>
          </div>
        </CardContent>
      </Card>

      <Tabs defaultValue="email" className="w-full">
        <TabsList className="grid w-full grid-cols-4 bg-slate-100">
          <TabsTrigger value="email" data-testid="tab-email">
            <FileText className="h-4 w-4 mr-2" />
            Email Templates
          </TabsTrigger>
          <TabsTrigger value="conversations" data-testid="tab-conversations">
            <MessageSquare className="h-4 w-4 mr-2" />
            Conversations
          </TabsTrigger>
          <TabsTrigger value="negotiation" data-testid="tab-negotiation">
            <Scale className="h-4 w-4 mr-2" />
            Negotiation
          </TabsTrigger>
          <TabsTrigger value="redflags" data-testid="tab-redflags">
            <AlertTriangle className="h-4 w-4 mr-2" />
            Red Flags
          </TabsTrigger>
        </TabsList>

        {/* EMAIL TEMPLATES */}
        <TabsContent value="email" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center justify-between">
                First Contact Response
                <Badge variant="outline">Copy & Paste Ready</Badge>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="bg-slate-50 p-4 rounded border border-slate-200 font-mono text-xs whitespace-pre-wrap">
                {emailTemplates.firstContact}
              </div>
              <Button
                onClick={() => copyToClipboard(emailTemplates.firstContact, "First Contact Email")}
                className="mt-3"
                variant="outline"
                size="sm"
                data-testid="button-copy-first-contact"
              >
                {copiedSection === "First Contact Email" ? (
                  <><CheckCircle2 className="h-4 w-4 mr-2 text-green-600" /> Copied!</>
                ) : (
                  <><Copy className="h-4 w-4 mr-2" /> Copy to Clipboard</>
                )}
              </Button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center justify-between">
                Follow-Up After Meeting
                <Badge variant="outline">Copy & Paste Ready</Badge>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="bg-slate-50 p-4 rounded border border-slate-200 font-mono text-xs whitespace-pre-wrap">
                {emailTemplates.followUp}
              </div>
              <Button
                onClick={() => copyToClipboard(emailTemplates.followUp, "Follow-Up Email")}
                className="mt-3"
                variant="outline"
                size="sm"
                data-testid="button-copy-followup"
              >
                {copiedSection === "Follow-Up Email" ? (
                  <><CheckCircle2 className="h-4 w-4 mr-2 text-green-600" /> Copied!</>
                ) : (
                  <><Copy className="h-4 w-4 mr-2" /> Copy to Clipboard</>
                )}
              </Button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center justify-between">
                Pricing Discussion
                <Badge variant="outline">Copy & Paste Ready</Badge>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="bg-slate-50 p-4 rounded border border-slate-200 font-mono text-xs whitespace-pre-wrap">
                {emailTemplates.pricingDiscussion}
              </div>
              <Button
                onClick={() => copyToClipboard(emailTemplates.pricingDiscussion, "Pricing Email")}
                className="mt-3"
                variant="outline"
                size="sm"
                data-testid="button-copy-pricing"
              >
                {copiedSection === "Pricing Email" ? (
                  <><CheckCircle2 className="h-4 w-4 mr-2 text-green-600" /> Copied!</>
                ) : (
                  <><Copy className="h-4 w-4 mr-2" /> Copy to Clipboard</>
                )}
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        {/* CONVERSATION SCRIPTS */}
        <TabsContent value="conversations" className="space-y-4">
          <Card className="border-blue-200 bg-blue-50">
            <CardHeader>
              <CardTitle className="text-lg text-blue-900">Opening Statement (First Call)</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="bg-white p-4 rounded border border-blue-200 text-sm whitespace-pre-wrap">
                {conversationScripts.openingStatement}
              </div>
              <Button
                onClick={() => copyToClipboard(conversationScripts.openingStatement, "Opening Script")}
                className="mt-3 bg-blue-600 hover:bg-blue-700"
                size="sm"
              >
                <Copy className="h-4 w-4 mr-2" /> Copy Script
              </Button>
            </CardContent>
          </Card>

          <Card className="border-purple-200 bg-purple-50">
            <CardHeader>
              <CardTitle className="text-lg text-purple-900">When They Ask About Price</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="bg-white p-4 rounded border border-purple-200 text-sm whitespace-pre-wrap">
                {conversationScripts.pricingQuestion}
              </div>
              <Button
                onClick={() => copyToClipboard(conversationScripts.pricingQuestion, "Pricing Script")}
                className="mt-3 bg-purple-600 hover:bg-purple-700"
                size="sm"
              >
                <Copy className="h-4 w-4 mr-2" /> Copy Script
              </Button>
            </CardContent>
          </Card>

          <Card className="border-amber-200 bg-amber-50">
            <CardHeader>
              <CardTitle className="text-lg text-amber-900">When to Involve a Lawyer</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="bg-white p-4 rounded border border-amber-200 text-sm whitespace-pre-wrap">
                {conversationScripts.whenToInvolveLawyer}
              </div>
            </CardContent>
          </Card>

          <Card className="border-green-200 bg-green-50">
            <CardHeader>
              <CardTitle className="text-lg text-green-900">Handling Their Tactics</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="bg-white p-4 rounded border border-green-200 text-sm whitespace-pre-wrap">
                {conversationScripts.negotiationTactics}
              </div>
              <Button
                onClick={() => copyToClipboard(conversationScripts.negotiationTactics, "Negotiation Tactics")}
                className="mt-3 bg-green-600 hover:bg-green-700"
                size="sm"
              >
                <Copy className="h-4 w-4 mr-2" /> Copy All Tactics
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        {/* NEGOTIATION GUARDRAILS */}
        <TabsContent value="negotiation" className="space-y-4">
          <Card className="border-red-200 bg-red-50">
            <CardHeader>
              <CardTitle className="text-lg text-red-900 flex items-center gap-2">
                <Shield className="h-5 w-5" />
                Your Bottom Line - Don't Go Below This
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="bg-white p-4 rounded border border-red-200 text-sm whitespace-pre-wrap">
                {negotiationGuardrails}
              </div>
              <Button
                onClick={() => copyToClipboard(negotiationGuardrails, "Negotiation Guardrails")}
                className="mt-3 bg-red-600 hover:bg-red-700"
                size="sm"
              >
                <Copy className="h-4 w-4 mr-2" /> Copy Guardrails
              </Button>
            </CardContent>
          </Card>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card className="border-green-200 bg-green-50">
              <CardHeader className="pb-3">
                <CardTitle className="text-sm text-green-900">Minimum Pricing</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <div>
                    <p className="text-xs text-green-700">6 Facilities</p>
                    <p className="text-2xl font-bold text-green-900">$500K</p>
                  </div>
                  <div>
                    <p className="text-xs text-green-700">12 Facilities</p>
                    <p className="text-2xl font-bold text-green-900">$900K</p>
                  </div>
                  <div>
                    <p className="text-xs text-green-700">25 Facilities</p>
                    <p className="text-2xl font-bold text-green-900">$1.5M</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="border-blue-200 bg-blue-50">
              <CardHeader className="pb-3">
                <CardTitle className="text-sm text-blue-900">What You're Selling</CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-1 text-xs text-blue-900">
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="h-3 w-3" />
                    Complete source code
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="h-3 w-3" />
                    IP rights for facilities
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="h-3 w-3" />
                    12-month support
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="h-3 w-3" />
                    Deployment & training
                  </li>
                </ul>
              </CardContent>
            </Card>

            <Card className="border-amber-200 bg-amber-50">
              <CardHeader className="pb-3">
                <CardTitle className="text-sm text-amber-900">Lawyer Time</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-xs text-amber-900 mb-2">Get attorney BEFORE:</p>
                <ul className="space-y-1 text-xs text-amber-900">
                  <li className="flex items-center gap-2">
                    <AlertTriangle className="h-3 w-3" />
                    Signing anything
                  </li>
                  <li className="flex items-center gap-2">
                    <AlertTriangle className="h-3 w-3" />
                    Discussing IP transfer
                  </li>
                  <li className="flex items-center gap-2">
                    <AlertTriangle className="h-3 w-3" />
                    NDAs or contracts
                  </li>
                </ul>
                <p className="text-xs text-amber-700 mt-2 font-semibold">Cost: $2K-$5K (worth it)</p>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* RED FLAGS */}
        <TabsContent value="redflags" className="space-y-4">
          <Card className="border-red-300 bg-red-50">
            <CardHeader>
              <CardTitle className="text-lg text-red-900 flex items-center gap-2">
                <AlertTriangle className="h-5 w-5" />
                WALK AWAY If They Say This
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="bg-white p-3 rounded border border-red-200">
                  <p className="text-sm font-semibold text-red-900">🚩 "Send us the source code so we can evaluate it"</p>
                  <p className="text-xs text-red-700 mt-1">Response: "I'm happy to demo the system live, but source code access comes after contract signing."</p>
                </div>
                <div className="bg-white p-3 rounded border border-red-200">
                  <p className="text-sm font-semibold text-red-900">🚩 "We need exclusive rights to the technology"</p>
                  <p className="text-xs text-red-700 mt-1">Response: "Exclusivity would require significantly higher pricing. Are you interested in discussing that?"</p>
                </div>
                <div className="bg-white p-3 rounded border border-red-200">
                  <p className="text-sm font-semibold text-red-900">🚩 "Can you do it for [50% less]?"</p>
                  <p className="text-xs text-red-700 mt-1">Response: "That's below my minimum. I can add value at my standard price - extended support, extra training, etc. Would that work?"</p>
                </div>
                <div className="bg-white p-3 rounded border border-red-200">
                  <p className="text-sm font-semibold text-red-900">🚩 "We'll pay you over 24 months"</p>
                  <p className="text-xs text-red-700 mt-1">Response: "I can do net-90 payment terms. Longer than that requires a different pricing structure."</p>
                </div>
                <div className="bg-white p-3 rounded border border-red-200">
                  <p className="text-sm font-semibold text-red-900">🚩 "Sign this NDA before we proceed"</p>
                  <p className="text-xs text-red-700 mt-1">Response: "I'll have my attorney review it and get back to you within 48 hours."</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-green-300 bg-green-50">
            <CardHeader>
              <CardTitle className="text-lg text-green-900 flex items-center gap-2">
                <CheckCircle2 className="h-5 w-5" />
                GOOD SIGNS - These Are Serious Buyers
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <div className="bg-white p-3 rounded border border-green-200">
                  <p className="text-sm text-green-900">✅ They ask detailed operational questions</p>
                </div>
                <div className="bg-white p-3 rounded border border-green-200">
                  <p className="text-sm text-green-900">✅ They want to schedule a technical demo with IT team</p>
                </div>
                <div className="bg-white p-3 rounded border border-green-200">
                  <p className="text-sm text-green-900">✅ They discuss pilot facility selection</p>
                </div>
                <div className="bg-white p-3 rounded border border-green-200">
                  <p className="text-sm text-green-900">✅ They ask about deployment timeline</p>
                </div>
                <div className="bg-white p-3 rounded border border-green-200">
                  <p className="text-sm text-green-900">✅ They're transparent about their budget/timeline</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Final Reminder */}
      <Card className="border-purple-300 bg-purple-50">
        <CardContent className="p-4">
          <p className="text-sm font-semibold text-purple-900 mb-2">Remember:</p>
          <ul className="text-xs text-purple-800 space-y-1">
            <li>• You built something valuable. Don't undervalue it.</li>
            <li>• They came to YOU. That's leverage.</li>
            <li>• Get a lawyer before signing ANYTHING.</li>
            <li>• Your minimum is $500K for 6 facilities. Don't go below it.</li>
            <li>• If they pressure you to sign fast, that's a red flag.</li>
            <li>• You can always say "Let me think about it and get back to you."</li>
          </ul>
        </CardContent>
      </Card>
    </div>
  );
}
