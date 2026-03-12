import { useState, useEffect } from "react";
import { useLocation } from "wouter";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { FileText, CheckCircle2 } from "lucide-react";
import { NavigationControl } from "@/components/NavigationControl";

export default function TermsOfService() {
  const [_, setLocation] = useLocation();
  const [userRole, setUserRole] = useState<string>("");
  
  useEffect(() => {
    const userStr = localStorage.getItem("vanops_user");
    if (userStr) {
      const user = JSON.parse(userStr);
      setUserRole(user.role || "");
    }
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900 p-4">
      <div className="max-w-3xl mx-auto space-y-3 py-4">
        <NavigationControl variant="back" fallbackRoute="/" />

        {/* Header */}
        <Card className="bg-gradient-to-br from-blue-600 to-indigo-700 border-none text-white">
          <CardContent className="p-6">
            <div className="flex items-center gap-3">
              <div className="bg-white/20 rounded-full p-3">
                <FileText className="h-8 w-8" />
              </div>
              <div>
                <h1 className="text-3xl font-bold">Terms of Service</h1>
                <p className="text-sm text-blue-100">Lot Ops Pro - Enterprise Operations Platform</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Last Updated */}
        <Card className="bg-white/10 border-white/20 backdrop-blur-lg">
          <CardContent className="p-4">
            <p className="text-sm text-slate-300">
              <strong>Last Updated:</strong> November 24, 2025
            </p>
          </CardContent>
        </Card>

        {/* Content */}
        <div className="space-y-4 pb-8">
          {/* Acceptance of Terms */}
          <Card className="bg-white/10 border-white/20 backdrop-blur-lg hover:bg-white/15 transition-all">
            <CardHeader>
              <CardTitle className="text-white text-xl flex items-center gap-2">
                <CheckCircle2 className="h-5 w-5 text-blue-400" />
                1. Acceptance of Terms
              </CardTitle>
            </CardHeader>
            <CardContent className="text-slate-300 space-y-3">
              <p>
                By accessing and using Lot Ops Pro ("Service"), you accept and agree to be bound by the terms and provision of this agreement. If you do not agree to abide by the above, please do not use this service.
              </p>
              <p>
                Lot Ops Pro is a production-grade autonomous lot management system designed for auto auctions, manufacturing facilities, dealerships, and equipment yards. This Service is provided on an "AS IS" and "AS AVAILABLE" basis.
              </p>
            </CardContent>
          </Card>

          {/* Use License */}
          <Card className="bg-white/10 border-white/20 backdrop-blur-lg hover:bg-white/15 transition-all">
            <CardHeader>
              <CardTitle className="text-white text-xl flex items-center gap-2">
                <CheckCircle2 className="h-5 w-5 text-blue-400" />
                2. Use License
              </CardTitle>
            </CardHeader>
            <CardContent className="text-slate-300 space-y-3">
              <p>
                Permission is granted to temporarily download one copy of the materials (information or software) on Lot Ops Pro for personal, non-commercial transitory viewing only. This is the grant of a license, not a transfer of title, and under this license you may not:
              </p>
              <ul className="list-disc list-inside space-y-2 ml-2">
                <li>Modifying or copying the materials</li>
                <li>Using the materials for any commercial purpose or for any public display</li>
                <li>Attempting to decompile or reverse engineer any software contained on Lot Ops Pro</li>
                <li>Removing any copyright or other proprietary notations from the materials</li>
                <li>Transferring the materials to another person or "mirroring" the materials on any other server</li>
                <li>Violating any applicable laws or regulations</li>
              </ul>
            </CardContent>
          </Card>

          {/* Disclaimer */}
          <Card className="bg-white/10 border-white/20 backdrop-blur-lg hover:bg-white/15 transition-all">
            <CardHeader>
              <CardTitle className="text-white text-xl flex items-center gap-2">
                <CheckCircle2 className="h-5 w-5 text-blue-400" />
                3. Disclaimer
              </CardTitle>
            </CardHeader>
            <CardContent className="text-slate-300 space-y-3">
              <p>
                The materials on Lot Ops Pro are provided on an 'as is' basis. Lot Ops Pro makes no warranties, expressed or implied, and hereby disclaims and negates all other warranties including, without limitation, implied warranties or conditions of merchantability, fitness for a particular purpose, or non-infringement of intellectual property or other violation of rights.
              </p>
              <p>
                Further, Lot Ops Pro does not warrant or make any representations concerning the accuracy, likely results, or reliability of the use of the materials on its website or otherwise relating to such materials or on any sites linked to this site.
              </p>
            </CardContent>
          </Card>

          {/* Limitations of Liability */}
          <Card className="bg-white/10 border-white/20 backdrop-blur-lg hover:bg-white/15 transition-all">
            <CardHeader>
              <CardTitle className="text-white text-xl flex items-center gap-2">
                <CheckCircle2 className="h-5 w-5 text-blue-400" />
                4. Limitations of Liability
              </CardTitle>
            </CardHeader>
            <CardContent className="text-slate-300 space-y-3">
              <p>
                In no event shall Lot Ops Pro or its suppliers be liable for any damages (including, without limitation, damages for loss of data or profit, or due to business interruption) arising out of the use or inability to use the materials on Lot Ops Pro, even if Lot Ops Pro or an authorized representative has been notified orally or in writing of the possibility of such damage.
              </p>
              <p>
                Because some jurisdictions do not allow limitations on implied warranties, or limitations of liability for consequential or incidental damages, these limitations may not apply to you.
              </p>
            </CardContent>
          </Card>

          {/* Accuracy of Materials */}
          <Card className="bg-white/10 border-white/20 backdrop-blur-lg hover:bg-white/15 transition-all">
            <CardHeader>
              <CardTitle className="text-white text-xl flex items-center gap-2">
                <CheckCircle2 className="h-5 w-5 text-blue-400" />
                5. Accuracy of Materials
              </CardTitle>
            </CardHeader>
            <CardContent className="text-slate-300 space-y-3">
              <p>
                The materials appearing on Lot Ops Pro could include technical, typographical, or photographic errors. Lot Ops Pro does not warrant that any of the materials on its website are accurate, complete, or current. Lot Ops Pro may make changes to the materials contained on its website at any time without notice.
              </p>
            </CardContent>
          </Card>

          {/* Materials License */}
          <Card className="bg-white/10 border-white/20 backdrop-blur-lg hover:bg-white/15 transition-all">
            <CardHeader>
              <CardTitle className="text-white text-xl flex items-center gap-2">
                <CheckCircle2 className="h-5 w-5 text-blue-400" />
                6. Materials License
              </CardTitle>
            </CardHeader>
            <CardContent className="text-slate-300 space-y-3">
              <p>
                Lot Ops Pro grants you a worldwide, non-exclusive, royalty-free, revocable license to view and use the materials provided only for authorized purposes as an end user. This license does not include the right to:
              </p>
              <ul className="list-disc list-inside space-y-2 ml-2">
                <li>Sublicense the Service to third parties</li>
                <li>Use the Service to develop competing products or services</li>
                <li>Remove or obscure any proprietary notices</li>
                <li>Transfer any intellectual property rights</li>
              </ul>
            </CardContent>
          </Card>

          {/* Limitations on Use */}
          <Card className="bg-white/10 border-white/20 backdrop-blur-lg hover:bg-white/15 transition-all">
            <CardHeader>
              <CardTitle className="text-white text-xl flex items-center gap-2">
                <CheckCircle2 className="h-5 w-5 text-blue-400" />
                7. Limitations on Use
              </CardTitle>
            </CardHeader>
            <CardContent className="text-slate-300 space-y-3">
              <p>
                You agree not to engage in any conduct that restricts or inhibits anyone's use or enjoyment of the Service. Prohibited behavior includes harassing or causing distress or discomfort to any person, transmitting obscene or offensive content, and disrupting the normal flow of dialogue within the Service.
              </p>
            </CardContent>
          </Card>

          {/* Modifications */}
          <Card className="bg-white/10 border-white/20 backdrop-blur-lg hover:bg-white/15 transition-all">
            <CardHeader>
              <CardTitle className="text-white text-xl flex items-center gap-2">
                <CheckCircle2 className="h-5 w-5 text-blue-400" />
                8. Modifications
              </CardTitle>
            </CardHeader>
            <CardContent className="text-slate-300 space-y-3">
              <p>
                Lot Ops Pro may revise these terms of service for its website at any time without notice. By using this website, you are agreeing to be bound by the then current version of these terms of service.
              </p>
            </CardContent>
          </Card>

          {/* Governing Law */}
          <Card className="bg-white/10 border-white/20 backdrop-blur-lg hover:bg-white/15 transition-all">
            <CardHeader>
              <CardTitle className="text-white text-xl flex items-center gap-2">
                <CheckCircle2 className="h-5 w-5 text-blue-400" />
                9. Governing Law
              </CardTitle>
            </CardHeader>
            <CardContent className="text-slate-300 space-y-3">
              <p>
                These terms and conditions are governed by and construed in accordance with the laws of the State of Tennessee, and you irrevocably submit to the exclusive jurisdiction of the courts in that location.
              </p>
            </CardContent>
          </Card>

          {/* Data Security */}
          <Card className="bg-white/10 border-white/20 backdrop-blur-lg hover:bg-white/15 transition-all">
            <CardHeader>
              <CardTitle className="text-white text-xl flex items-center gap-2">
                <CheckCircle2 className="h-5 w-5 text-blue-400" />
                10. Data Security & Confidentiality
              </CardTitle>
            </CardHeader>
            <CardContent className="text-slate-300 space-y-3">
              <p>
                Lot Ops Pro uses industry-standard security measures to protect your data. Your PIN-based authentication, GPS coordinates, performance metrics, and operational data are encrypted in transit and at rest. You are responsible for maintaining the confidentiality of your PIN.
              </p>
            </CardContent>
          </Card>

          {/* Subscription Terms */}
          <Card className="bg-white/10 border-white/20 backdrop-blur-lg hover:bg-white/15 transition-all">
            <CardHeader>
              <CardTitle className="text-white text-xl flex items-center gap-2">
                <CheckCircle2 className="h-5 w-5 text-blue-400" />
                11. Subscription & Billing
              </CardTitle>
            </CardHeader>
            <CardContent className="text-slate-300 space-y-3">
              <p>
                Paid subscriptions are billed automatically at the frequency selected. You can cancel anytime through your account settings. Cancellation takes effect at the end of your current billing period.
              </p>
              <p>
                All fees exclude applicable sales tax or VAT. Recurring billing charges will continue until you cancel your subscription.
              </p>
            </CardContent>
          </Card>

          {/* Support & Contact */}
          <Card className="bg-white/10 border-white/20 backdrop-blur-lg hover:bg-white/15 transition-all">
            <CardHeader>
              <CardTitle className="text-white text-xl flex items-center gap-2">
                <CheckCircle2 className="h-5 w-5 text-blue-400" />
                12. Support & Contact
              </CardTitle>
            </CardHeader>
            <CardContent className="text-slate-300 space-y-3">
              <p>
                For support, feature requests, or inquiries about these Terms, please contact:
              </p>
              <div className="bg-white/5 p-3 rounded border border-white/10 space-y-1">
                <p className="text-sm"><strong>Lot Ops Pro Support Team</strong></p>
                <p className="text-sm">Email: support@lotopspro.io</p>
                <p className="text-sm">Phone: (615) 796-0430</p>
                <p className="text-sm">Location: Nashville, Tennessee</p>
              </div>
            </CardContent>
          </Card>

          {/* Acknowledgment */}
          <Card className="bg-gradient-to-r from-blue-500/20 to-indigo-500/20 border-blue-400/30">
            <CardContent className="p-4">
              <p className="text-sm text-blue-100 text-center">
                By using Lot Ops Pro, you acknowledge that you have read, understood, and agree to be bound by these Terms of Service.
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
