import { useState } from "react";
import * as React from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import {
  ChevronLeft,
  ChevronRight,
  Search,
  X,
  Camera,
  Navigation,
  TrendingUp,
  ClipboardList,
  BarChart3,
  Users,
  MessageSquare,
  Shield,
  Coffee,
  Rocket,
  Crown,
  MapPin,
  Mail,
  Key,
  AlertTriangle,
  FileText,
  Truck,
  Map,
  Target,
  Calendar,
  Clock,
  CheckCircle,
  List,
  Gauge,
  Sparkles
} from "lucide-react";
import { helpCategories, searchHelpTopics, getTopicsForRole, type HelpTopic } from "@shared/helpContent";

interface HelpCenterProps {
  isOpen: boolean;
  onClose: () => void;
  role: "van_driver" | "inventory_driver" | "supervisor" | "operations_manager";
}

const iconMap: Record<string, any> = {
  Camera, Navigation, TrendingUp, ClipboardList, BarChart3, Users, MessageSquare,
  Shield, Coffee, Rocket, Crown, MapPin, Mail, Key, AlertTriangle, FileText,
  Truck, Map, Target, Calendar, Clock, CheckCircle, List, Gauge, Search, Sparkles
};

export function HelpCenter({ isOpen, onClose, role }: HelpCenterProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedTopic, setSelectedTopic] = useState<HelpTopic | null>(null);
  const [currentSlide, setCurrentSlide] = useState(0);
  const [viewMode, setViewMode] = useState<"browse" | "search" | "slideshow">("browse");

  const roleTopics = getTopicsForRole(role);
  const searchResults = searchQuery.length > 2 ? searchHelpTopics(searchQuery, role) : [];

  const handleTopicClick = (topic: HelpTopic) => {
    setSelectedTopic(topic);
    setCurrentSlide(0);
    setViewMode("slideshow");
  };

  const handleBack = () => {
    if (viewMode === "slideshow") {
      setSelectedTopic(null);
      setViewMode(searchQuery ? "search" : "browse");
    } else {
      setViewMode("browse");
      setSearchQuery("");
    }
  };

  const nextSlide = () => {
    if (selectedTopic && currentSlide < selectedTopic.content.length - 1) {
      setCurrentSlide(currentSlide + 1);
    }
  };

  const prevSlide = () => {
    if (currentSlide > 0) {
      setCurrentSlide(currentSlide - 1);
    }
  };

  const getIcon = (iconName: string) => {
    const Icon = iconMap[iconName];
    return Icon ? <Icon className="h-5 w-5" /> : null;
  };

  const getRoleName = () => {
    switch (role) {
      case "van_driver": return "Van Driver";
      case "inventory_driver": return "Inventory Driver";
      case "supervisor": return "Supervisor";
      case "operations_manager": return "Operations Manager";
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl w-[95vw] h-[90vh] max-h-[900px] p-0 bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900 border-white/20">
        <DialogHeader className="px-6 pt-6 pb-4 border-b border-white/10">
          <div className="flex items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              {(viewMode === "search" || viewMode === "slideshow") && (
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={handleBack}
                  className="text-white hover:bg-white/10"
                  data-testid="button-help-back"
                >
                  <ChevronLeft className="h-5 w-5" />
                </Button>
              )}
              <div>
                <DialogTitle className="text-2xl text-white flex items-center gap-2">
                  <Rocket className="h-6 w-6 text-blue-400" />
                  Help Center
                </DialogTitle>
                <DialogDescription className="text-slate-300 mt-1">
                  {getRoleName()} Guide
                </DialogDescription>
              </div>
            </div>
            <Button
              variant="ghost"
              size="icon"
              onClick={onClose}
              className="text-white hover:bg-white/10"
              data-testid="button-help-close"
            >
              <X className="h-5 w-5" />
            </Button>
          </div>

          {/* Search Bar */}
          {viewMode !== "slideshow" && (
            <div className="relative mt-4">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
              <Input
                placeholder="Search for help (e.g., 'how to scan', 'GPS routing', 'breaks')..."
                value={searchQuery}
                onChange={(e) => {
                  setSearchQuery(e.target.value);
                  if (e.target.value.length > 2) {
                    setViewMode("search");
                  } else if (e.target.value.length === 0) {
                    setViewMode("browse");
                  }
                }}
                className="pl-10 bg-white/10 border-white/20 text-white placeholder:text-slate-400"
                data-testid="input-help-search"
              />
              {searchQuery && (
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => {
                    setSearchQuery("");
                    setViewMode("browse");
                  }}
                  className="absolute right-2 top-1/2 -translate-y-1/2 h-6 w-6 text-slate-400 hover:text-white"
                >
                  <X className="h-4 w-4" />
                </Button>
              )}
            </div>
          )}
        </DialogHeader>

        <div className="flex-1 overflow-hidden">
          {/* Browse Mode - Category Grid */}
          {viewMode === "browse" && (
            <ScrollArea className="h-full px-6 py-4">
              <div className="space-y-6 pb-6">
                {helpCategories.map((category) => {
                  const categoryTopics = category.topics.filter(
                    t => t.role === role || t.role === "all"
                  );
                  
                  if (categoryTopics.length === 0) return null;

                  return (
                    <div key={category.id}>
                      <div className="flex items-center gap-2 mb-3">
                        {getIcon(category.icon)}
                        <h3 className="text-lg font-semibold text-white">{category.title}</h3>
                        <Badge variant="outline" className="text-xs text-blue-300 border-blue-300">
                          {categoryTopics.length}
                        </Badge>
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                        {categoryTopics.map((topic) => (
                          <button
                            key={topic.id}
                            onClick={() => handleTopicClick(topic)}
                            className="bg-white/5 hover:bg-white/10 border border-white/10 rounded-lg p-4 text-left transition-all hover:scale-[1.02] group"
                            data-testid={`button-help-topic-${topic.id}`}
                          >
                            <h4 className="text-white font-medium mb-2 group-hover:text-blue-300 transition-colors">
                              {topic.title}
                            </h4>
                            <p className="text-slate-400 text-sm line-clamp-2">
                              {topic.description}
                            </p>
                            <div className="mt-2 flex items-center gap-2 text-xs text-blue-400">
                              <span>{topic.content.length} steps</span>
                              <ChevronRight className="h-3 w-3" />
                            </div>
                          </button>
                        ))}
                      </div>
                    </div>
                  );
                })}
              </div>
            </ScrollArea>
          )}

          {/* Search Results */}
          {viewMode === "search" && (
            <ScrollArea className="h-full px-6 py-4">
              <div className="space-y-3 pb-6">
                {searchResults.length === 0 ? (
                  <div className="text-center py-12">
                    <Search className="h-12 w-12 text-slate-600 mx-auto mb-3" />
                    <p className="text-slate-400">No results found for "{searchQuery}"</p>
                    <p className="text-slate-500 text-sm mt-2">Try different keywords or browse categories above</p>
                  </div>
                ) : (
                  <>
                    <p className="text-slate-300 mb-4">Found {searchResults.length} results</p>
                    {searchResults.map((topic) => (
                      <button
                        key={topic.id}
                        onClick={() => handleTopicClick(topic)}
                        className="w-full bg-white/5 hover:bg-white/10 border border-white/10 rounded-lg p-4 text-left transition-all hover:scale-[1.01] group"
                        data-testid={`button-search-result-${topic.id}`}
                      >
                        <h4 className="text-white font-medium mb-2 group-hover:text-blue-300 transition-colors">
                          {topic.title}
                        </h4>
                        <p className="text-slate-400 text-sm mb-3">
                          {topic.description}
                        </p>
                        <div className="flex items-center gap-2 text-xs text-slate-500">
                          <Badge variant="outline" className="text-xs">
                            {topic.content.length} steps
                          </Badge>
                          <span>•</span>
                          <span className="capitalize">{topic.role.replace(/_/g, " ")}</span>
                        </div>
                      </button>
                    ))}
                  </>
                )}
              </div>
            </ScrollArea>
          )}

          {/* Slideshow Mode */}
          {viewMode === "slideshow" && selectedTopic && (
            <div className="h-full flex flex-col">
              {/* Progress Dots */}
              <div className="flex justify-center gap-2 py-3 border-b border-white/10">
                {selectedTopic.content.map((_, index) => (
                  <button
                    key={index}
                    onClick={() => setCurrentSlide(index)}
                    className={`h-2 rounded-full transition-all ${
                      index === currentSlide
                        ? "w-8 bg-blue-400"
                        : "w-2 bg-white/20 hover:bg-white/30"
                    }`}
                    data-testid={`button-slide-dot-${index}`}
                  />
                ))}
              </div>

              {/* Slide Content */}
              <ScrollArea className="flex-1 px-6 py-6">
                <div className="max-w-2xl mx-auto pb-6">
                  <div className="text-center mb-6">
                    {getIcon(selectedTopic.content[currentSlide].icon || "Sparkles") && (
                      <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-blue-500/20 mb-4">
                        {React.cloneElement(
                          getIcon(selectedTopic.content[currentSlide].icon || "Sparkles")!,
                          { className: "h-8 w-8 text-blue-400" }
                        )}
                      </div>
                    )}
                    <h2 className="text-2xl font-bold text-white mb-2">
                      {selectedTopic.content[currentSlide].title}
                    </h2>
                    <p className="text-slate-300 text-lg">
                      {selectedTopic.content[currentSlide].description}
                    </p>
                  </div>

                  {/* Steps */}
                  {selectedTopic.content[currentSlide].steps && (
                    <div className="bg-white/5 rounded-lg p-5 mb-4 border border-white/10">
                      <h3 className="text-white font-semibold mb-3 flex items-center gap-2">
                        <List className="h-4 w-4 text-green-400" />
                        Step-by-Step Guide
                      </h3>
                      <ol className="space-y-3">
                        {selectedTopic.content[currentSlide].steps.map((step, idx) => (
                          <li key={idx} className="flex gap-3 text-slate-300">
                            <span className="flex-shrink-0 w-6 h-6 rounded-full bg-green-500/20 text-green-400 text-sm font-semibold flex items-center justify-center">
                              {idx + 1}
                            </span>
                            <span>{step}</span>
                          </li>
                        ))}
                      </ol>
                    </div>
                  )}

                  {/* Tips */}
                  {selectedTopic.content[currentSlide].tips && (
                    <div className="bg-yellow-500/10 rounded-lg p-5 border border-yellow-500/20">
                      <h3 className="text-yellow-300 font-semibold mb-3 flex items-center gap-2">
                        <Sparkles className="h-4 w-4" />
                        Pro Tips
                      </h3>
                      <ul className="space-y-2">
                        {selectedTopic.content[currentSlide].tips.map((tip, idx) => (
                          <li key={idx} className="flex gap-2 text-slate-300 text-sm">
                            <span className="text-yellow-400">•</span>
                            <span>{tip}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              </ScrollArea>

              {/* Navigation Controls */}
              <div className="border-t border-white/10 p-4 flex items-center justify-between bg-slate-900/50">
                <Button
                  variant="outline"
                  onClick={prevSlide}
                  disabled={currentSlide === 0}
                  className="bg-white/5 border-white/20 text-white hover:bg-white/10 disabled:opacity-30"
                  data-testid="button-prev-slide"
                >
                  <ChevronLeft className="h-4 w-4 mr-2" />
                  Previous
                </Button>
                
                <span className="text-slate-300 text-sm">
                  {currentSlide + 1} / {selectedTopic.content.length}
                </span>
                
                {currentSlide < selectedTopic.content.length - 1 ? (
                  <Button
                    onClick={nextSlide}
                    className="bg-blue-600 hover:bg-blue-700 text-white"
                    data-testid="button-next-slide"
                  >
                    Next
                    <ChevronRight className="h-4 w-4 ml-2" />
                  </Button>
                ) : (
                  <Button
                    onClick={onClose}
                    className="bg-green-600 hover:bg-green-700 text-white"
                    data-testid="button-finish-help"
                  >
                    <CheckCircle className="h-4 w-4 mr-2" />
                    Got It!
                  </Button>
                )}
              </div>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
