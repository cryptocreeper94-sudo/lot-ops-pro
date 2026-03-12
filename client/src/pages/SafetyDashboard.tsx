import { useState, useEffect } from "react";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { BentoGrid, BentoTile } from "@/components/ui/bento-grid";
import { PremiumAccordion, PremiumAccordionItem, PremiumAccordionTrigger, PremiumAccordionContent } from "@/components/ui/premium-accordion";
import { PremiumButton } from "@/components/ui/premium-button";
import { 
  Shield, AlertTriangle, MessageSquare, BookOpen, 
  Send, Eye, CheckCircle, Gauge, AlertCircle,
  Heart, Users, ChevronLeft, ChevronRight, Sparkles
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useLocation } from "wouter";
import { NavigationControl } from "@/components/NavigationControl";
import { PageHelp } from "@/components/PageHelp";

export default function SafetyDashboard() {
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const [safetyAdvisor, setSafetyAdvisor] = useState<any>(null);
  const [incidents, setIncidents] = useState<any[]>([]);
  const [speedViolations, setSpeedViolations] = useState<any[]>([]);
  const [safetyTopics, setSafetyTopics] = useState<any[]>([]);
  const [selectedTopic, setSelectedTopic] = useState<any | null>(null);
  const [showMessageDialog, setShowMessageDialog] = useState(false);
  const [showTopicDialog, setShowTopicDialog] = useState(false);
  const [showWelcomeModal, setShowWelcomeModal] = useState(false);
  const [messageForm, setMessageForm] = useState({
    toId: "all",
    toName: "All Drivers",
    messageType: "safety_reminder",
    subject: "",
    content: ""
  });
  const [stats, setStats] = useState({
    totalIncidents: 0,
    urgentIncidents: 0,
    resolvedIncidents: 0,
    speedViolationsToday: 0,
    activeDrivers: 0
  });

  useEffect(() => {
    const userStr = localStorage.getItem("vanops_user");
    if (userStr) {
      const user = JSON.parse(userStr);
      setSafetyAdvisor(user);
    }

    const hasSeenWelcome = localStorage.getItem("safety_dashboard_welcome_seen");
    if (!hasSeenWelcome) {
      setShowWelcomeModal(true);
    }

    loadIncidents();
    loadSpeedViolations();
    loadSafetyTopics();
    loadStats();
  }, []);

  const handleCloseWelcome = () => {
    localStorage.setItem("safety_dashboard_welcome_seen", "true");
    setShowWelcomeModal(false);
  };

  const loadIncidents = async () => {
    try {
      const res = await fetch("/api/safety-incidents");
      if (res.ok) {
        const data = await res.json();
        setIncidents(data);
      }
    } catch (error) {
      console.error("Failed to load incidents:", error);
    }
  };

  const loadSpeedViolations = async () => {
    try {
      const res = await fetch("/api/speed-violations");
      if (res.ok) {
        const data = await res.json();
        setSpeedViolations(data.slice(0, 10));
      }
    } catch (error) {
      console.error("Failed to load speed violations:", error);
    }
  };

  const loadSafetyTopics = async () => {
    try {
      const res = await fetch("/api/safety-topics");
      if (res.ok) {
        const data = await res.json();
        setSafetyTopics(data);
      }
    } catch (error) {
      console.error("Failed to load safety topics:", error);
    }
  };

  const loadStats = async () => {
    try {
      const incidentsRes = await fetch("/api/safety-incidents");
      const violationsRes = await fetch("/api/speed-violations/today");
      
      if (incidentsRes.ok) {
        const incidents = await incidentsRes.json();
        setStats(prev => ({
          ...prev,
          totalIncidents: incidents.length,
          urgentIncidents: incidents.filter((i: any) => i.urgency === "urgent").length,
          resolvedIncidents: incidents.filter((i: any) => i.isResolved).length
        }));
      }

      if (violationsRes.ok) {
        const violations = await violationsRes.json();
        setStats(prev => ({
          ...prev,
          speedViolationsToday: violations.length
        }));
      }
    } catch (error) {
      console.error("Failed to load stats:", error);
    }
  };

  const handleSendMessage = async () => {
    if (!messageForm.subject || !messageForm.content) {
      toast({
        title: "Missing Information",
        description: "Please fill in subject and message",
        variant: "destructive"
      });
      return;
    }

    try {
      const res = await fetch("/api/safety-messages", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          fromId: safetyAdvisor?.pin || "safety",
          fromName: safetyAdvisor?.name || "Safety Advisor",
          ...messageForm
        })
      });

      if (res.ok) {
        toast({
          title: "✓ Message Sent",
          description: `Safety message sent to ${messageForm.toName}`
        });
        setShowMessageDialog(false);
        setMessageForm({
          toId: "all",
          toName: "All Drivers",
          messageType: "safety_reminder",
          subject: "",
          content: ""
        });
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to send message",
        variant: "destructive"
      });
    }
  };

  const getIncidentBadgeColor = (urgency: string) => {
    if (urgency === "urgent") return "bg-red-600";
    if (urgency === "general") return "bg-amber-600";
    return "bg-blue-600";
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-950 via-indigo-900 to-purple-950 p-4">
      <div className="mb-6">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-3">
            <NavigationControl variant="back" fallbackRoute="/" />
            <Shield className="h-8 w-8 text-yellow-400" />
            <div>
              <h1 className="text-2xl font-bold text-white" data-testid="text-page-title">Safety Dashboard</h1>
              <p className="text-sm text-yellow-200" data-testid="text-advisor-name">{safetyAdvisor?.name || "Safety Advisor"}</p>
            </div>
          </div>
        </div>
      </div>

      <BentoGrid columns={4} gap="md" className="mb-6">
        <BentoTile
          variant="glow"
          size="sm"
          icon={<AlertTriangle className="h-5 w-5" />}
          title="Total Incidents"
          interactive={false}
          data-testid="tile-total-incidents"
        >
          <p className="text-3xl font-bold text-white" data-testid="stat-total-incidents">{stats.totalIncidents}</p>
        </BentoTile>

        <BentoTile
          variant="gradient"
          size="sm"
          icon={<AlertCircle className="h-5 w-5 text-orange-400" />}
          title="Urgent"
          interactive={false}
          data-testid="tile-urgent-incidents"
        >
          <p className="text-3xl font-bold text-orange-400" data-testid="stat-urgent-incidents">{stats.urgentIncidents}</p>
        </BentoTile>

        <BentoTile
          variant="glow"
          size="sm"
          icon={<Gauge className="h-5 w-5 text-yellow-400" />}
          title="Speed Today"
          interactive={false}
          data-testid="tile-speed-violations"
        >
          <p className="text-3xl font-bold text-yellow-400" data-testid="stat-speed-violations">{stats.speedViolationsToday}</p>
        </BentoTile>

        <BentoTile
          variant="gradient"
          size="sm"
          icon={<CheckCircle className="h-5 w-5 text-green-400" />}
          title="Resolved"
          interactive={false}
          data-testid="tile-resolved-incidents"
        >
          <p className="text-3xl font-bold text-green-400" data-testid="stat-resolved-incidents">{stats.resolvedIncidents}</p>
        </BentoTile>
      </BentoGrid>

      <div className="mb-6">
        <div className="flex items-center justify-between mb-3">
          <p className="text-xs font-bold text-amber-300 uppercase tracking-wide">Quick Actions</p>
          <div className="flex items-center gap-1">
            <Button
              size="icon"
              variant="ghost"
              className="h-7 w-7 text-white/60 hover:text-white"
              onClick={() => {
                const container = document.getElementById("quick-actions-scroll");
                if (container) container.scrollBy({ left: -200, behavior: "smooth" });
              }}
              data-testid="button-scroll-left"
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <Button
              size="icon"
              variant="ghost"
              className="h-7 w-7 text-white/60 hover:text-white"
              onClick={() => {
                const container = document.getElementById("quick-actions-scroll");
                if (container) container.scrollBy({ left: 200, behavior: "smooth" });
              }}
              data-testid="button-scroll-right"
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
        
        <div
          id="quick-actions-scroll"
          className="flex gap-3 overflow-x-auto pb-2 scroll-smooth scrollbar-hide"
          style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
        >
          <BentoTile
            variant="glow"
            size="sm"
            onClick={() => setShowMessageDialog(true)}
            icon={<MessageSquare className="h-5 w-5" />}
            title="Safety Message"
            description="Alert drivers"
            className="min-w-[160px] flex-shrink-0"
            data-testid="tile-send-safety-message"
          />

          <BentoTile
            variant="gradient"
            size="sm"
            onClick={() => setShowTopicDialog(true)}
            icon={<BookOpen className="h-5 w-5" />}
            title="Pre-Shift Topics"
            description="Daily briefings"
            className="min-w-[160px] flex-shrink-0"
            data-testid="tile-view-topics"
          />

          <BentoTile
            variant="glass"
            size="sm"
            onClick={() => setLocation("/safety-report")}
            icon={<AlertTriangle className="h-5 w-5 text-red-400" />}
            title="File Report"
            description="New incident"
            className="min-w-[160px] flex-shrink-0"
            data-testid="tile-file-report"
          />

          <BentoTile
            variant="glow"
            size="sm"
            onClick={() => {
              toast({ title: "Driver Locations", description: "Opening live map..." });
              setLocation("/operations-manager");
            }}
            icon={<Users className="h-5 w-5 text-blue-400" />}
            title="Driver Map"
            description="Live locations"
            className="min-w-[160px] flex-shrink-0"
            data-testid="tile-driver-map"
          />
        </div>
      </div>

      <div className="space-y-4">
        <PremiumAccordion type="multiple" defaultValue={["incidents", "violations"]}>
          <PremiumAccordionItem value="incidents" variant="glass">
            <PremiumAccordionTrigger
              icon={<AlertTriangle className="h-5 w-5" />}
              badge={`${incidents.length}`}
              description="View and manage recent safety incidents"
            >
              Recent Safety Incidents
            </PremiumAccordionTrigger>
            <PremiumAccordionContent>
              <ScrollArea className="h-64">
                {incidents.length === 0 ? (
                  <p className="text-sm text-white/50 text-center py-4" data-testid="text-no-incidents">No incidents reported</p>
                ) : (
                  <div className="space-y-2">
                    {incidents.slice(0, 10).map((incident) => (
                      <div
                        key={incident.id}
                        className="p-3 bg-white/10 rounded-lg border border-white/10 hover:bg-white/15 transition-colors"
                        data-testid={`incident-item-${incident.id}`}
                      >
                        <div className="flex items-start justify-between gap-2">
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-1">
                              <Badge className={`${getIncidentBadgeColor(incident.urgency)} text-[10px] px-1.5 py-0.5`}>
                                {incident.urgency}
                              </Badge>
                              <p className="text-sm font-bold text-white">{incident.title}</p>
                            </div>
                            <p className="text-xs text-white/70">{incident.reporterName}</p>
                            <p className="text-xs text-white/50">
                              {new Date(incident.createdAt).toLocaleDateString()} - {incident.location || "No location"}
                            </p>
                          </div>
                          {incident.isResolved && (
                            <CheckCircle className="h-4 w-4 text-green-400 flex-shrink-0" />
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </ScrollArea>
            </PremiumAccordionContent>
          </PremiumAccordionItem>

          <PremiumAccordionItem value="violations" variant="gradient">
            <PremiumAccordionTrigger
              icon={<Gauge className="h-5 w-5" />}
              badge={`${speedViolations.length}`}
              description="Recent speed limit violations"
            >
              Speed Violations
            </PremiumAccordionTrigger>
            <PremiumAccordionContent>
              <ScrollArea className="h-48">
                {speedViolations.length === 0 ? (
                  <p className="text-sm text-white/50 text-center py-4" data-testid="text-no-violations">No violations today</p>
                ) : (
                  <div className="space-y-2">
                    {speedViolations.map((violation) => (
                      <div
                        key={violation.id}
                        className="p-3 bg-yellow-500/10 rounded-lg border border-yellow-500/20 hover:bg-yellow-500/15 transition-colors"
                        data-testid={`violation-item-${violation.id}`}
                      >
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="text-sm font-bold text-white">{violation.driverName}</p>
                            <p className="text-xs text-yellow-200/80">
                              {violation.speed} MPH in {violation.speedLimit} MPH zone
                            </p>
                          </div>
                          <p className="text-xs text-white/50">
                            {new Date(violation.createdAt).toLocaleTimeString()}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </ScrollArea>
            </PremiumAccordionContent>
          </PremiumAccordionItem>
        </PremiumAccordion>
      </div>

      <Dialog open={showMessageDialog} onOpenChange={setShowMessageDialog}>
        <DialogContent className="bg-gradient-to-br from-blue-950 to-blue-900 border-blue-500">
          <DialogHeader>
            <DialogTitle className="text-white flex items-center gap-2">
              <MessageSquare className="h-5 w-5 text-blue-400" />
              Send Safety Message
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-3 py-4">
            <div>
              <label className="text-xs text-blue-200 mb-1 block">Send To</label>
              <Select
                value={messageForm.toId}
                onValueChange={(value) => {
                  setMessageForm({
                    ...messageForm,
                    toId: value,
                    toName: value === "all" ? "All Drivers" : `Driver ${value}`
                  });
                }}
              >
                <SelectTrigger className="bg-blue-900/50 border-blue-400 text-white" data-testid="select-message-recipient">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Drivers</SelectItem>
                  <SelectItem value="broadcast">Broadcast to Everyone</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <label className="text-xs text-blue-200 mb-1 block">Message Type</label>
              <Select
                value={messageForm.messageType}
                onValueChange={(value) => setMessageForm({ ...messageForm, messageType: value })}
              >
                <SelectTrigger className="bg-blue-900/50 border-blue-400 text-white" data-testid="select-message-type">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="safety_reminder">Safety Reminder</SelectItem>
                  <SelectItem value="violation_warning">Violation Warning</SelectItem>
                  <SelectItem value="general_announcement">General Announcement</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <label className="text-xs text-blue-200 mb-1 block">Subject</label>
              <Input
                placeholder="e.g., Speed Limit Reminder"
                value={messageForm.subject}
                onChange={(e) => setMessageForm({ ...messageForm, subject: e.target.value })}
                className="bg-blue-900/50 border-blue-400 text-white placeholder:text-blue-300"
                data-testid="input-message-subject"
              />
            </div>

            <div>
              <label className="text-xs text-blue-200 mb-1 block">Message</label>
              <Textarea
                placeholder="Write your safety message here..."
                value={messageForm.content}
                onChange={(e) => setMessageForm({ ...messageForm, content: e.target.value })}
                className="bg-blue-900/50 border-blue-400 text-white placeholder:text-blue-300 min-h-24"
                data-testid="input-message-content"
              />
            </div>
          </div>

          <DialogFooter>
            <PremiumButton
              variant="glass"
              onClick={() => setShowMessageDialog(false)}
              data-testid="button-cancel-message"
            >
              Cancel
            </PremiumButton>
            <PremiumButton
              variant="primary"
              onClick={handleSendMessage}
              icon={<Send className="h-4 w-4" />}
              data-testid="button-send-message"
            >
              Send Message
            </PremiumButton>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={showTopicDialog} onOpenChange={setShowTopicDialog}>
        <DialogContent className="bg-gradient-to-br from-purple-950 to-purple-900 border-purple-500 max-w-2xl">
          <DialogHeader>
            <DialogTitle className="text-white flex items-center gap-2">
              <BookOpen className="h-5 w-5 text-purple-400" />
              Pre-Shift Safety Topics
            </DialogTitle>
          </DialogHeader>

          <ScrollArea className="h-96 py-4">
            <PremiumAccordion type="single" collapsible>
              {safetyTopics.map((topic) => (
                <PremiumAccordionItem key={topic.id} value={topic.id.toString()} variant="glass">
                  <PremiumAccordionTrigger
                    badge={topic.category}
                    description={topic.content?.substring(0, 60) + "..."}
                  >
                    {topic.title}
                  </PremiumAccordionTrigger>
                  <PremiumAccordionContent>
                    <div className="space-y-3">
                      <p className="text-sm text-white/90 leading-relaxed">{topic.content}</p>
                      {topic.bulletPoints && topic.bulletPoints.length > 0 && (
                        <div className="bg-purple-900/50 p-3 rounded-lg">
                          <p className="text-xs font-bold text-purple-200 mb-2">Key Points:</p>
                          <ul className="text-xs text-purple-100 space-y-1">
                            {topic.bulletPoints.map((point: string, index: number) => (
                              <li key={index} className="flex gap-2">
                                <span className="text-purple-400">•</span>
                                <span>{point}</span>
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}
                      <div className="flex gap-2 pt-2">
                        <PremiumButton
                          variant="primary"
                          size="sm"
                          icon={<Send className="h-3 w-3" />}
                          onClick={() => {
                            setMessageForm({
                              toId: "all",
                              toName: "All Drivers",
                              messageType: "safety_reminder",
                              subject: topic.title,
                              content: topic.content
                            });
                            setShowTopicDialog(false);
                            setShowMessageDialog(true);
                          }}
                          data-testid={`button-send-topic-${topic.id}`}
                        >
                          Send to Drivers
                        </PremiumButton>
                      </div>
                    </div>
                  </PremiumAccordionContent>
                </PremiumAccordionItem>
              ))}
            </PremiumAccordion>
          </ScrollArea>

          <DialogFooter>
            <PremiumButton
              variant="glass"
              onClick={() => setShowTopicDialog(false)}
              data-testid="button-close-topics"
            >
              Close
            </PremiumButton>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {selectedTopic && (
        <Dialog open={!!selectedTopic} onOpenChange={() => setSelectedTopic(null)}>
          <DialogContent className="bg-gradient-to-br from-indigo-950 to-indigo-900 border-indigo-500">
            <DialogHeader>
              <DialogTitle className="text-white">{selectedTopic.title}</DialogTitle>
              <Badge className="bg-indigo-600 w-fit mt-2">{selectedTopic.category}</Badge>
            </DialogHeader>

            <ScrollArea className="max-h-96 py-4">
              <div className="space-y-4">
                <div>
                  <p className="text-sm text-indigo-100 leading-relaxed">{selectedTopic.content}</p>
                </div>

                {selectedTopic.bulletPoints && selectedTopic.bulletPoints.length > 0 && (
                  <div className="bg-indigo-900/50 p-3 rounded">
                    <p className="text-xs font-bold text-indigo-200 mb-2">Key Points:</p>
                    <ul className="text-xs text-indigo-100 space-y-1">
                      {selectedTopic.bulletPoints.map((point: string, index: number) => (
                        <li key={index} className="flex gap-2">
                          <span className="text-indigo-400">•</span>
                          <span>{point}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                <div className="bg-blue-900/30 p-3 rounded border border-blue-500/30">
                  <p className="text-xs text-blue-200">
                    💡 <span className="font-semibold">Tip:</span> Use this topic for your next pre-shift meeting or send as a safety reminder to all drivers.
                  </p>
                </div>
              </div>
            </ScrollArea>

            <DialogFooter className="gap-2">
              <PremiumButton
                variant="glass"
                onClick={() => setSelectedTopic(null)}
                data-testid="button-close-topic-detail"
              >
                Close
              </PremiumButton>
              <PremiumButton
                variant="primary"
                icon={<Send className="h-4 w-4" />}
                onClick={() => {
                  setMessageForm({
                    toId: "all",
                    toName: "All Drivers",
                    messageType: "safety_reminder",
                    subject: selectedTopic.title,
                    content: selectedTopic.content
                  });
                  setSelectedTopic(null);
                  setShowMessageDialog(true);
                }}
                data-testid="button-send-topic-detail"
              >
                Send to Drivers
              </PremiumButton>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}

      <Dialog open={showWelcomeModal} onOpenChange={setShowWelcomeModal}>
        <DialogContent className="bg-gradient-to-br from-amber-950 via-amber-900 to-yellow-900 border-amber-500/50 max-w-lg">
          <DialogHeader className="text-center">
            <div className="mx-auto mb-4 w-20 h-20 rounded-full bg-gradient-to-br from-amber-400 to-yellow-500 flex items-center justify-center shadow-lg shadow-amber-500/30">
              <Shield className="h-10 w-10 text-amber-950" />
            </div>
            <DialogTitle className="text-2xl font-bold text-white flex items-center justify-center gap-2" data-testid="text-welcome-title">
              <Sparkles className="h-5 w-5 text-amber-300" />
              Welcome, Ariel!
              <Sparkles className="h-5 w-5 text-amber-300" />
            </DialogTitle>
            <p className="text-amber-200 mt-2">Safety Representative Dashboard</p>
          </DialogHeader>

          <div className="py-4 space-y-4">
            <div className="bg-amber-800/30 rounded-lg p-4 border border-amber-500/30">
              <p className="text-sm text-amber-100 leading-relaxed text-center">
                Your command center for keeping our drivers and crew safe. Everything you need is right at your fingertips.
              </p>
            </div>

            <div className="space-y-3">
              <p className="text-xs font-bold text-amber-300 uppercase tracking-wide">Quick Guide:</p>
              
              <div className="flex items-start gap-3 p-3 bg-white/5 rounded-lg">
                <div className="w-8 h-8 rounded-full bg-red-500/20 flex items-center justify-center flex-shrink-0">
                  <AlertTriangle className="h-4 w-4 text-red-400" />
                </div>
                <div>
                  <p className="text-sm font-semibold text-white">Incident Monitoring</p>
                  <p className="text-xs text-amber-200/70">View and track all safety incidents reported by drivers</p>
                </div>
              </div>

              <div className="flex items-start gap-3 p-3 bg-white/5 rounded-lg">
                <div className="w-8 h-8 rounded-full bg-yellow-500/20 flex items-center justify-center flex-shrink-0">
                  <Gauge className="h-4 w-4 text-yellow-400" />
                </div>
                <div>
                  <p className="text-sm font-semibold text-white">Speed Violations</p>
                  <p className="text-xs text-amber-200/70">Real-time alerts when drivers exceed speed limits</p>
                </div>
              </div>

              <div className="flex items-start gap-3 p-3 bg-white/5 rounded-lg">
                <div className="w-8 h-8 rounded-full bg-blue-500/20 flex items-center justify-center flex-shrink-0">
                  <MessageSquare className="h-4 w-4 text-blue-400" />
                </div>
                <div>
                  <p className="text-sm font-semibold text-white">Safety Messages</p>
                  <p className="text-xs text-amber-200/70">Send reminders and alerts to all drivers instantly</p>
                </div>
              </div>

              <div className="flex items-start gap-3 p-3 bg-white/5 rounded-lg">
                <div className="w-8 h-8 rounded-full bg-purple-500/20 flex items-center justify-center flex-shrink-0">
                  <BookOpen className="h-4 w-4 text-purple-400" />
                </div>
                <div>
                  <p className="text-sm font-semibold text-white">Pre-Shift Topics</p>
                  <p className="text-xs text-amber-200/70">Access safety topics for your daily briefings</p>
                </div>
              </div>
            </div>

            <div className="bg-gradient-to-r from-green-900/40 to-emerald-900/40 rounded-lg p-3 border border-green-500/30">
              <div className="flex items-center gap-2">
                <Heart className="h-4 w-4 text-green-400" />
                <p className="text-xs text-green-200">
                  <span className="font-semibold">Thank you</span> for keeping our team safe every day!
                </p>
              </div>
            </div>
          </div>

          <DialogFooter>
            <PremiumButton
              variant="primary"
              className="w-full bg-gradient-to-r from-amber-500 to-yellow-500 hover:from-amber-400 hover:to-yellow-400 text-amber-950 font-bold"
              onClick={handleCloseWelcome}
              data-testid="button-close-welcome"
            >
              Let's Get Started
            </PremiumButton>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <PageHelp
        pageName="Safety Dashboard"
        pageDescription="Your command center for monitoring driver safety and managing incidents."
        navigationPath={[
          { name: "Home" },
          { name: "Safety Representative", current: true }
        ]}
        steps={[
          {
            title: "Check Today's Stats",
            description: "View the top row for incident counts, speed violations, and resolved cases at a glance."
          },
          {
            title: "Browse Quick Actions",
            description: "Swipe left/right through the action tiles or use the arrow buttons to access common tasks."
          },
          {
            title: "Review Incidents",
            description: "Tap the 'Recent Safety Incidents' accordion to see reported issues and their urgency levels."
          },
          {
            title: "Monitor Speed Violations",
            description: "Expand the 'Speed Violations' section to see drivers who exceeded limits today."
          },
          {
            title: "Send Safety Messages",
            description: "Tap 'Safety Message' tile to send reminders or warnings to all drivers."
          }
        ]}
        quickActions={[
          { label: "Safety Message", description: "Send alerts and reminders to all drivers" },
          { label: "Pre-Shift Topics", description: "Access daily safety briefing materials" },
          { label: "File Report", description: "Submit a new safety incident report" },
          { label: "Driver Map", description: "View real-time driver locations" }
        ]}
        tips={[
          "Red badges indicate urgent incidents that need immediate attention.",
          "Swipe horizontally on Quick Actions to see more options.",
          "Tap any accordion header to expand or collapse that section.",
          "Speed violations are sorted by time - newest first."
        ]}
      />
    </div>
  );
}
