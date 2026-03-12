import { useState } from "react";
import { useLocation } from "wouter";
import { useQuery, useMutation } from "@tanstack/react-query";
import { motion, AnimatePresence } from "framer-motion";
import { 
  ArrowLeft, Megaphone, Link2, Award, Plus, ExternalLink, 
  Calendar, Eye, Pin, User, ChevronRight, Newspaper, 
  Trophy, Bookmark, Clock, X, FileText
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { format } from "date-fns";
import { PageHelp } from "@/components/PageHelp";

interface NewsPost {
  id: number;
  title: string;
  content: string;
  category: string;
  imageUrl?: string;
  isPinned: boolean;
  isPublished: boolean;
  authorName: string;
  authorRole: string;
  viewCount: number;
  createdAt: string;
  publishedAt?: string;
}

interface QuickLink {
  id: number;
  title: string;
  url: string;
  description?: string;
  icon?: string;
  category: string;
  sortOrder: number;
}

interface Recognition {
  id: number;
  recipientName: string;
  recipientRole?: string;
  awardType: string;
  message: string;
  awardedByName: string;
  isPublished: boolean;
  createdAt: string;
}

const CATEGORY_ICONS: Record<string, typeof Megaphone> = {
  announcement: Megaphone,
  update: Newspaper,
  policy: FileText,
  recognition: Trophy,
  general: Bookmark,
};

const AWARD_TYPES = [
  { id: "star_performer", label: "Star Performer", icon: Trophy },
  { id: "safety_champion", label: "Safety Champion", icon: Award },
  { id: "team_player", label: "Team Player", icon: User },
  { id: "most_improved", label: "Most Improved", icon: ChevronRight },
];

export default function EmployeePortal() {
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const [selectedNews, setSelectedNews] = useState<NewsPost | null>(null);
  const [showCreateNews, setShowCreateNews] = useState(false);
  const [showCreateLink, setShowCreateLink] = useState(false);
  const [showCreateRecognition, setShowCreateRecognition] = useState(false);
  
  const entryType = localStorage.getItem("vanops_entry_type");
  const isSandbox = localStorage.getItem("vanops_sandbox_mode") === "true";
  
  const userStr = localStorage.getItem("vanops_user");
  const user = userStr ? JSON.parse(userStr) : null;
  const userRole = user?.role || "driver";
  
  const isManager = isSandbox 
    ? entryType === "manager" 
    : ["operations_manager", "supervisor"].includes(userRole);

  const { data: news = [], isLoading: loadingNews } = useQuery<NewsPost[]>({
    queryKey: ["/api/employee-portal/news", { includeUnpublished: isManager }],
  });

  const { data: quickLinks = [], isLoading: loadingLinks } = useQuery<QuickLink[]>({
    queryKey: ["/api/employee-portal/quick-links"],
  });

  const { data: recognitions = [], isLoading: loadingRecognitions } = useQuery<Recognition[]>({
    queryKey: ["/api/employee-portal/recognitions"],
  });

  const createNewsMutation = useMutation({
    mutationFn: async (data: Partial<NewsPost>) => {
      return apiRequest("POST", "/api/employee-portal/news", data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/employee-portal/news"] });
      setShowCreateNews(false);
      toast({ title: "News Created", description: "Your announcement has been published" });
    },
    onError: () => {
      toast({ title: "Error", description: "Failed to create news", variant: "destructive" });
    }
  });

  const createLinkMutation = useMutation({
    mutationFn: async (data: Partial<QuickLink>) => {
      return apiRequest("POST", "/api/employee-portal/quick-links", data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/employee-portal/quick-links"] });
      setShowCreateLink(false);
      toast({ title: "Link Added", description: "Quick link has been created" });
    },
    onError: () => {
      toast({ title: "Error", description: "Failed to create link", variant: "destructive" });
    }
  });

  const createRecognitionMutation = useMutation({
    mutationFn: async (data: Partial<Recognition>) => {
      return apiRequest("POST", "/api/employee-portal/recognitions", data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/employee-portal/recognitions"] });
      setShowCreateRecognition(false);
      toast({ title: "Recognition Created", description: "Team member has been recognized" });
    },
    onError: () => {
      toast({ title: "Error", description: "Failed to create recognition", variant: "destructive" });
    }
  });

  const pinnedNews = news.filter(n => n.isPinned);
  const regularNews = news.filter(n => !n.isPinned);

  return (
    <div className="min-h-screen bg-background">
      <div className="sticky top-0 z-50 bg-background/95 backdrop-blur-sm border-b">
        <div className="flex items-center justify-between p-4">
          <div className="flex items-center gap-3">
            <Button 
              variant="ghost" 
              size="icon"
              onClick={() => setLocation("/")}
              data-testid="button-back"
            >
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <div>
              <h1 className="text-xl font-bold">Employee Portal</h1>
              <p className="text-xs text-muted-foreground">News, Links, and Recognition</p>
            </div>
          </div>
          {isManager && (
            <Badge variant="outline" className="bg-purple-500/10 text-purple-500 border-purple-500/30">
              Manager View
            </Badge>
          )}
        </div>
      </div>

      <div className="p-3 pb-24">
        {/* BENTO GRID LAYOUT */}
        <div className="grid grid-cols-4 md:grid-cols-6 gap-3">
          
          {/* STAT TILES - Row 1 */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="col-span-2"
          >
            <Card className="h-full bg-gradient-to-br from-blue-500/10 to-blue-600/5 border-blue-500/20" data-testid="stat-news">
              <div className="p-4 flex items-center gap-3">
                <div className="p-3 rounded-xl bg-blue-500/20">
                  <Newspaper className="h-6 w-6 text-blue-500" />
                </div>
                <div>
                  <div className="text-3xl font-bold">{news.length}</div>
                  <div className="text-xs text-muted-foreground">Announcements</div>
                </div>
              </div>
            </Card>
          </motion.div>
          
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.15 }}
            className="col-span-1"
          >
            <Card className="h-full bg-gradient-to-br from-green-500/10 to-green-600/5 border-green-500/20" data-testid="stat-links">
              <div className="p-3 flex flex-col items-center justify-center h-full text-center">
                <div className="p-2 rounded-lg bg-green-500/20 mb-1">
                  <Link2 className="h-5 w-5 text-green-500" />
                </div>
                <div className="text-2xl font-bold">{quickLinks.length}</div>
                <div className="text-[10px] text-muted-foreground">Links</div>
              </div>
            </Card>
          </motion.div>
          
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="col-span-1"
          >
            <Card className="h-full bg-gradient-to-br from-yellow-500/10 to-orange-500/5 border-yellow-500/20" data-testid="stat-recognitions">
              <div className="p-3 flex flex-col items-center justify-center h-full text-center">
                <div className="p-2 rounded-lg bg-yellow-500/20 mb-1">
                  <Trophy className="h-5 w-5 text-yellow-500" />
                </div>
                <div className="text-2xl font-bold">{recognitions.length}</div>
                <div className="text-[10px] text-muted-foreground">Awards</div>
              </div>
            </Card>
          </motion.div>
          
          {/* PINNED - Full width accent tile */}
          {pinnedNews.length > 0 && (
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.25 }}
              className="col-span-4 md:col-span-6"
            >
              <Card className="bg-gradient-to-r from-yellow-500/20 via-amber-500/10 to-orange-500/20 border-yellow-500/30">
                <div className="p-3">
                  <div className="flex items-center gap-2 mb-2">
                    <Pin className="h-4 w-4 text-yellow-500" />
                    <span className="text-sm font-semibold text-yellow-600 dark:text-yellow-400">Pinned</span>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                    {pinnedNews.map(item => (
                      <div 
                        key={item.id} 
                        className="p-3 rounded-lg bg-background/60 backdrop-blur-sm hover-elevate cursor-pointer"
                        onClick={() => setSelectedNews(item)}
                        data-testid={`news-pinned-${item.id}`}
                      >
                        <div className="flex items-start justify-between gap-2">
                          <div className="flex-1 min-w-0">
                            <Badge variant="outline" className="text-xs bg-yellow-500/10 text-yellow-600 border-yellow-500/30 mb-1">
                              {item.category}
                            </Badge>
                            <h3 className="font-semibold text-sm truncate">{item.title}</h3>
                            <p className="text-xs text-muted-foreground line-clamp-1 mt-0.5">{item.content}</p>
                          </div>
                          <ChevronRight className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </Card>
            </motion.div>
          )}

          {/* NEWS FEED - Main content area */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="col-span-4 md:col-span-4"
          >
            <Card className="h-full">
              <div className="p-3 border-b flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Megaphone className="h-4 w-4 text-blue-500" />
                  <span className="text-sm font-semibold">Latest News</span>
                </div>
                {isManager && (
                  <Button 
                    size="sm" 
                    variant="ghost"
                    onClick={() => setShowCreateNews(true)}
                    data-testid="button-create-news"
                  >
                    <Plus className="h-4 w-4" />
                  </Button>
                )}
              </div>
              <div className="p-2">
                {loadingNews ? (
                  <div className="space-y-2">
                    {[1, 2, 3].map(i => (
                      <div key={i} className="p-3 rounded-lg bg-muted/50 animate-pulse">
                        <div className="h-3 bg-muted rounded w-3/4 mb-2" />
                        <div className="h-2 bg-muted rounded w-1/2" />
                      </div>
                    ))}
                  </div>
                ) : regularNews.length === 0 ? (
                  <div className="p-6 text-center text-muted-foreground">
                    <Newspaper className="h-8 w-8 mx-auto mb-2 opacity-30" />
                    <p className="text-sm">No announcements yet</p>
                  </div>
                ) : (
                  <div className="space-y-1">
                    {regularNews.slice(0, 4).map(item => {
                      const CategoryIcon = CATEGORY_ICONS[item.category] || Newspaper;
                      return (
                        <div 
                          key={item.id} 
                          className="p-2.5 rounded-lg hover-elevate cursor-pointer flex items-start gap-2"
                          onClick={() => setSelectedNews(item)}
                          data-testid={`news-item-${item.id}`}
                        >
                          <div className="p-1.5 rounded-lg bg-blue-500/10 flex-shrink-0 mt-0.5">
                            <CategoryIcon className="h-3.5 w-3.5 text-blue-500" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-1.5 mb-0.5 flex-wrap">
                              <Badge variant="outline" className="text-[10px] px-1.5 py-0">{item.category}</Badge>
                              {!item.isPublished && (
                                <Badge variant="secondary" className="text-[10px] px-1.5 py-0">Draft</Badge>
                              )}
                            </div>
                            <h3 className="font-medium text-sm truncate">{item.title}</h3>
                            <div className="flex items-center gap-2 mt-1 text-[10px] text-muted-foreground">
                              <span>{item.authorName}</span>
                              <span>{format(new Date(item.createdAt), "MMM d")}</span>
                            </div>
                          </div>
                          <ChevronRight className="h-4 w-4 text-muted-foreground flex-shrink-0 mt-1" />
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            </Card>
          </motion.div>

          {/* QUICK LINKS - Sidebar tile */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.35 }}
            className="col-span-4 md:col-span-2 row-span-1"
          >
            <Card className="h-full">
              <div className="p-3 border-b flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Link2 className="h-4 w-4 text-green-500" />
                  <span className="text-sm font-semibold">Quick Links</span>
                </div>
                {isManager && (
                  <Button 
                    size="sm" 
                    variant="ghost"
                    onClick={() => setShowCreateLink(true)}
                    data-testid="button-create-link"
                  >
                    <Plus className="h-4 w-4" />
                  </Button>
                )}
              </div>
              <div className="p-2">
                {loadingLinks ? (
                  <div className="space-y-2">
                    {[1, 2, 3].map(i => (
                      <div key={i} className="p-2 rounded-lg bg-muted/50 animate-pulse">
                        <div className="h-3 bg-muted rounded w-3/4" />
                      </div>
                    ))}
                  </div>
                ) : quickLinks.length === 0 ? (
                  <div className="p-4 text-center text-muted-foreground">
                    <Link2 className="h-6 w-6 mx-auto mb-1 opacity-30" />
                    <p className="text-xs">No links yet</p>
                  </div>
                ) : (
                  <div className="space-y-1">
                    {quickLinks.slice(0, 5).map(link => (
                      <div 
                        key={link.id}
                        className="p-2 rounded-lg hover-elevate cursor-pointer flex items-center gap-2"
                        onClick={() => window.open(link.url, "_blank")}
                        data-testid={`quick-link-${link.id}`}
                      >
                        <div className="p-1.5 rounded-lg bg-green-500/10">
                          <ExternalLink className="h-3 w-3 text-green-500" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="font-medium text-xs truncate">{link.title}</p>
                          {link.description && (
                            <p className="text-[10px] text-muted-foreground truncate">{link.description}</p>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </Card>
          </motion.div>

          {/* RECOGNITION - Full width showcase */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="col-span-4 md:col-span-6"
          >
            <Card className="bg-gradient-to-br from-purple-500/5 via-transparent to-pink-500/5">
              <div className="p-3 border-b flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Trophy className="h-4 w-4 text-yellow-500" />
                  <span className="text-sm font-semibold">Team Recognition</span>
                </div>
                {isManager && (
                  <Button 
                    size="sm" 
                    variant="ghost"
                    onClick={() => setShowCreateRecognition(true)}
                    data-testid="button-create-recognition"
                  >
                    <Plus className="h-4 w-4 mr-1" />
                    Recognize
                  </Button>
                )}
              </div>
              <div className="p-3">
                {loadingRecognitions ? (
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
                    {[1, 2, 3].map(i => (
                      <div key={i} className="p-3 rounded-lg bg-muted/50 animate-pulse">
                        <div className="h-4 bg-muted rounded w-1/2 mb-2" />
                        <div className="h-3 bg-muted rounded w-3/4" />
                      </div>
                    ))}
                  </div>
                ) : recognitions.length === 0 ? (
                  <div className="p-8 text-center text-muted-foreground">
                    <div className="p-4 rounded-full bg-yellow-500/10 w-fit mx-auto mb-3">
                      <Trophy className="h-8 w-8 text-yellow-500/50" />
                    </div>
                    <p className="text-sm">No recognitions yet</p>
                    {isManager && <p className="text-xs mt-1 opacity-60">Celebrate your team</p>}
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
                    {recognitions.slice(0, 3).map(rec => {
                      const awardInfo = AWARD_TYPES.find(a => a.id === rec.awardType);
                      const AwardIcon = awardInfo?.icon || Trophy;
                      return (
                        <div 
                          key={rec.id} 
                          className="p-3 rounded-lg bg-gradient-to-br from-yellow-500/10 to-orange-500/5 border border-yellow-500/20"
                          data-testid={`recognition-${rec.id}`}
                        >
                          <div className="flex items-start gap-2">
                            <div className="p-2 rounded-lg bg-gradient-to-br from-yellow-400 to-orange-500 flex-shrink-0">
                              <AwardIcon className="h-4 w-4 text-white" />
                            </div>
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-1.5 flex-wrap mb-0.5">
                                <span className="font-semibold text-sm">{rec.recipientName}</span>
                                <Badge variant="outline" className="text-[10px] px-1.5 py-0 bg-yellow-500/10 text-yellow-600 border-yellow-500/30">
                                  {awardInfo?.label || rec.awardType}
                                </Badge>
                              </div>
                              <p className="text-xs text-muted-foreground line-clamp-2">{rec.message}</p>
                              <div className="flex items-center gap-1 mt-1.5 text-[10px] text-muted-foreground">
                                <Clock className="h-2.5 w-2.5" />
                                {format(new Date(rec.createdAt), "MMM d")}
                              </div>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            </Card>
          </motion.div>

        </div>
      </div>

      <AnimatePresence>
        {selectedNews && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4"
            onClick={() => setSelectedNews(null)}
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-background rounded-lg shadow-xl max-w-lg w-full max-h-[80vh] overflow-hidden"
              onClick={e => e.stopPropagation()}
            >
              <div className="sticky top-0 bg-background border-b p-4 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Badge variant="outline">{selectedNews.category}</Badge>
                  {selectedNews.isPinned && <Pin className="h-4 w-4 text-yellow-500" />}
                </div>
                <Button variant="ghost" size="icon" onClick={() => setSelectedNews(null)}>
                  <X className="h-5 w-5" />
                </Button>
              </div>
              <ScrollArea className="p-4 max-h-[60vh]">
                <h2 className="text-xl font-bold mb-2">{selectedNews.title}</h2>
                <div className="flex items-center gap-3 text-sm text-muted-foreground mb-4">
                  <span className="flex items-center gap-1">
                    <User className="h-4 w-4" />
                    {selectedNews.authorName}
                  </span>
                  <span className="flex items-center gap-1">
                    <Calendar className="h-4 w-4" />
                    {format(new Date(selectedNews.createdAt), "MMMM d, yyyy")}
                  </span>
                </div>
                {selectedNews.imageUrl && (
                  <img 
                    src={selectedNews.imageUrl} 
                    alt={selectedNews.title}
                    className="w-full rounded-lg mb-4 object-cover max-h-48"
                  />
                )}
                <div className="prose prose-sm dark:prose-invert">
                  <p className="whitespace-pre-wrap">{selectedNews.content}</p>
                </div>
              </ScrollArea>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <CreateNewsDialog 
        open={showCreateNews} 
        onClose={() => setShowCreateNews(false)}
        onSubmit={(data) => createNewsMutation.mutate(data)}
        isPending={createNewsMutation.isPending}
      />

      <CreateLinkDialog
        open={showCreateLink}
        onClose={() => setShowCreateLink(false)}
        onSubmit={(data) => createLinkMutation.mutate(data)}
        isPending={createLinkMutation.isPending}
      />

      <CreateRecognitionDialog
        open={showCreateRecognition}
        onClose={() => setShowCreateRecognition(false)}
        onSubmit={(data) => createRecognitionMutation.mutate(data)}
        isPending={createRecognitionMutation.isPending}
      />

      <PageHelp
        pageName="Employee Portal"
        pageDescription="Central hub for company news, quick links, and team recognition to keep everyone informed and motivated."
        navigationPath={[
          { name: "Home" },
          { name: "Employee Portal", current: true }
        ]}
        steps={[
          {
            title: "Check Pinned Announcements",
            description: "Important announcements are pinned at the top with a yellow highlight - read these first."
          },
          {
            title: "Browse Latest News",
            description: "Scroll through the Latest News section to see recent company updates, policies, and announcements."
          },
          {
            title: "Use Quick Links",
            description: "Access frequently used resources and external links in the Quick Links section."
          },
          {
            title: "View Team Recognition",
            description: "See who has been recognized for great work in the Team Recognition showcase."
          },
          {
            title: "Create Content (Managers)",
            description: "If you're a manager, use the + buttons to create news, add links, or recognize team members."
          }
        ]}
        quickActions={[
          { label: "View Announcements", description: "Read company-wide announcements and updates" },
          { label: "Access Quick Links", description: "Jump to frequently used resources and sites" },
          { label: "See Recognitions", description: "View team member achievements and awards" },
          { label: "Create News (Manager)", description: "Post new announcements to the portal" },
          { label: "Add Links (Manager)", description: "Add useful quick links for the team" }
        ]}
        tips={[
          "Pinned items appear at the top - these are high-priority announcements",
          "Tap on any news item to read the full content",
          "Quick links open in a new tab so you don't lose your place",
          "Managers can toggle news between published and draft status"
        ]}
      />
    </div>
  );
}

function CreateNewsDialog({ 
  open, 
  onClose, 
  onSubmit, 
  isPending 
}: { 
  open: boolean; 
  onClose: () => void; 
  onSubmit: (data: Partial<NewsPost>) => void;
  isPending: boolean;
}) {
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [category, setCategory] = useState("announcement");
  const [isPinned, setIsPinned] = useState(false);
  const [isPublished, setIsPublished] = useState(true);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit({ title, content, category, isPinned, isPublished });
    setTitle("");
    setContent("");
    setCategory("announcement");
    setIsPinned(false);
    setIsPublished(true);
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Megaphone className="h-5 w-5" />
            Create Announcement
          </DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="title">Title</Label>
            <Input 
              id="title"
              value={title}
              onChange={e => setTitle(e.target.value)}
              placeholder="Announcement title..."
              required
              data-testid="input-news-title"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="content">Content</Label>
            <Textarea
              id="content"
              value={content}
              onChange={e => setContent(e.target.value)}
              placeholder="Write your announcement..."
              rows={4}
              required
              data-testid="input-news-content"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="category">Category</Label>
            <select
              id="category"
              value={category}
              onChange={e => setCategory(e.target.value)}
              className="w-full px-3 py-2 border rounded-md bg-background"
              data-testid="select-news-category"
            >
              <option value="announcement">Announcement</option>
              <option value="update">Update</option>
              <option value="policy">Policy</option>
              <option value="general">General</option>
            </select>
          </div>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Switch 
                id="pinned" 
                checked={isPinned} 
                onCheckedChange={setIsPinned}
                data-testid="switch-news-pinned"
              />
              <Label htmlFor="pinned" className="text-sm">Pin to top</Label>
            </div>
            <div className="flex items-center gap-2">
              <Switch 
                id="published" 
                checked={isPublished} 
                onCheckedChange={setIsPublished}
                data-testid="switch-news-published"
              />
              <Label htmlFor="published" className="text-sm">Publish now</Label>
            </div>
          </div>
          <Button 
            type="submit" 
            className="w-full" 
            disabled={isPending || !title.trim() || !content.trim()}
            data-testid="button-submit-news"
          >
            {isPending ? "Creating..." : "Create Announcement"}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}

function CreateLinkDialog({ 
  open, 
  onClose, 
  onSubmit, 
  isPending 
}: { 
  open: boolean; 
  onClose: () => void; 
  onSubmit: (data: Partial<QuickLink>) => void;
  isPending: boolean;
}) {
  const [title, setTitle] = useState("");
  const [url, setUrl] = useState("");
  const [description, setDescription] = useState("");
  const [linkCategory, setLinkCategory] = useState("general");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit({ title, url, description, category: linkCategory });
    setTitle("");
    setUrl("");
    setDescription("");
    setLinkCategory("general");
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Link2 className="h-5 w-5" />
            Add Quick Link
          </DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="link-title">Title</Label>
            <Input 
              id="link-title"
              value={title}
              onChange={e => setTitle(e.target.value)}
              placeholder="Link title..."
              required
              data-testid="input-link-title"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="link-url">URL</Label>
            <Input 
              id="link-url"
              type="url"
              value={url}
              onChange={e => setUrl(e.target.value)}
              placeholder="https://..."
              required
              data-testid="input-link-url"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="link-description">Description (optional)</Label>
            <Input 
              id="link-description"
              value={description}
              onChange={e => setDescription(e.target.value)}
              placeholder="Brief description..."
              data-testid="input-link-description"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="link-category">Category</Label>
            <select
              id="link-category"
              value={linkCategory}
              onChange={e => setLinkCategory(e.target.value)}
              className="w-full px-3 py-2 border rounded-md bg-background"
              data-testid="select-link-category"
            >
              <option value="general">General</option>
              <option value="hr">HR</option>
              <option value="safety">Safety</option>
              <option value="training">Training</option>
            </select>
          </div>
          <Button 
            type="submit" 
            className="w-full" 
            disabled={isPending || !title.trim() || !url.trim()}
            data-testid="button-submit-link"
          >
            {isPending ? "Adding..." : "Add Quick Link"}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}

function CreateRecognitionDialog({ 
  open, 
  onClose, 
  onSubmit, 
  isPending 
}: { 
  open: boolean; 
  onClose: () => void; 
  onSubmit: (data: Partial<Recognition>) => void;
  isPending: boolean;
}) {
  const [recipientName, setRecipientName] = useState("");
  const [awardType, setAwardType] = useState("star_performer");
  const [message, setMessage] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit({ recipientName, awardType, message, isPublished: true });
    setRecipientName("");
    setAwardType("star_performer");
    setMessage("");
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Trophy className="h-5 w-5" />
            Recognize Team Member
          </DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="recipient">Team Member Name</Label>
            <Input 
              id="recipient"
              value={recipientName}
              onChange={e => setRecipientName(e.target.value)}
              placeholder="Enter name..."
              required
              data-testid="input-recognition-name"
            />
          </div>
          <div className="space-y-2">
            <Label>Award Type</Label>
            <div className="grid grid-cols-2 gap-2">
              {AWARD_TYPES.map(award => {
                const Icon = award.icon;
                return (
                  <Card 
                    key={award.id}
                    className={`p-3 cursor-pointer transition-all ${
                      awardType === award.id 
                        ? "border-yellow-500 bg-yellow-500/10" 
                        : "hover-elevate"
                    }`}
                    onClick={() => setAwardType(award.id)}
                    data-testid={`award-type-${award.id}`}
                  >
                    <div className="flex items-center gap-2">
                      <Icon className={`h-4 w-4 ${awardType === award.id ? "text-yellow-500" : "text-muted-foreground"}`} />
                      <span className="text-sm font-medium">{award.label}</span>
                    </div>
                  </Card>
                );
              })}
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="message">Recognition Message</Label>
            <Textarea
              id="message"
              value={message}
              onChange={e => setMessage(e.target.value)}
              placeholder="What did they do that deserves recognition..."
              rows={3}
              required
              data-testid="input-recognition-message"
            />
          </div>
          <Button 
            type="submit" 
            className="w-full" 
            disabled={isPending || !recipientName.trim() || !message.trim()}
            data-testid="button-submit-recognition"
          >
            {isPending ? "Creating..." : "Publish Recognition"}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}
