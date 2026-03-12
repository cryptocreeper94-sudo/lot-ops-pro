import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useLocation } from "wouter";
import { useMascot, PageTutorial, FAQItem } from "./MascotGuideContext";
import { LotBuddy, MascotExpression } from "./LotBuddy";
import { triggerLotBuddyTip } from "./LotBuddyPopup";
import { useLotBuddy } from "@/contexts/LotBuddyContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  X,
  HelpCircle,
  ChevronLeft,
  ChevronRight,
  Search,
  Lightbulb,
  MessageCircle,
  BookOpen,
  Sparkles,
  Send,
  ExternalLink,
} from "lucide-react";

export function MascotGuideOverlay() {
  const {
    state,
    hideMessage,
    openTutorial,
    closeTutorial,
    nextSlide,
    prevSlide,
    openQA,
    closeQA,
    searchFAQ,
    getCurrentPageTutorial,
  } = useMascot();
  const [currentLocation, setLocation] = useLocation();
  
  // Get LotBuddy state to prevent duplicate buddy displays
  const lotBuddyContext = useLotBuddy();
  const lotBuddyIsActive = lotBuddyContext?.displayMode !== 'minimized' || lotBuddyContext?.popupState?.isVisible;

  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<FAQItem[]>([]);
  const [selectedFAQ, setSelectedFAQ] = useState<FAQItem | null>(null);

  const tutorial = getCurrentPageTutorial();
  const currentSlide = tutorial?.slides[state.currentSlide];

  const hashToTabMapping: Record<string, string> = {
    'overview': 'overview',
    'ai-suggestions': 'ai_optimization',
    'reports': 'reports',
    'messages': 'communications',
    'roster': 'roster',
    'assignments': 'dispatch',
    'lanes': 'config',
    'performance': 'performance',
  };

  const scrollToElement = (hash: string) => {
    const tabValue = hashToTabMapping[hash];
    if (tabValue) {
      sessionStorage.setItem('tutorial-pending-tab', tabValue);
      sessionStorage.setItem('tutorial-pending-hash', hash);
      window.dispatchEvent(new CustomEvent('tutorial-select-tab', { detail: { tabValue } }));
    }
    
    const attemptScroll = (retries = 0) => {
      const element = document.getElementById(hash) || 
                     document.querySelector(`[data-section="${hash}"]`) ||
                     document.querySelector(`[data-testid*="${hash}"]`);
      if (element) {
        sessionStorage.removeItem('tutorial-pending-tab');
        sessionStorage.removeItem('tutorial-pending-hash');
        element.scrollIntoView({ behavior: 'smooth', block: 'center' });
        element.classList.add('ring-2', 'ring-orange-400', 'ring-offset-2');
        setTimeout(() => {
          element.classList.remove('ring-2', 'ring-orange-400', 'ring-offset-2');
        }, 2000);
      } else if (retries < 5) {
        setTimeout(() => attemptScroll(retries + 1), 200);
      }
    };
    
    setTimeout(() => attemptScroll(), 100);
  };

  useEffect(() => {
    if (searchQuery.length > 2) {
      const results = searchFAQ(searchQuery);
      setSearchResults(results);
    } else {
      setSearchResults([]);
    }
  }, [searchQuery, searchFAQ]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.length > 2) {
      const results = searchFAQ(searchQuery);
      setSearchResults(results);
    }
  };

  return (
    <>
      {/* Vector Buddy removed from floating - now only accessible via hamburger menu Tutorials */}

      {/* Welcome Message Popup - Hidden when LotBuddy avatar is active to prevent duplicates */}
      <AnimatePresence>
        {state.isVisible && state.message && !state.showTutorial && !state.showQA && !lotBuddyIsActive && (
          <motion.div
            className="fixed bottom-20 left-4 z-[9500] max-w-sm"
            initial={{ opacity: 0, y: 20, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.9 }}
          >
            <Card className="border-orange-200 bg-gradient-to-br from-orange-50 to-amber-50 shadow-xl">
              <CardContent className="p-4">
                <div className="flex gap-3">
                  <LotBuddy expression={state.expression} size="md" />
                  <div className="flex-1">
                    <div className="flex justify-between items-start mb-2">
                      <Badge className="bg-orange-500 text-white">Lot Buddy</Badge>
                      <button
                        onClick={hideMessage}
                        className="text-slate-400 hover:text-slate-600 transition-colors"
                        data-testid="button-close-welcome"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                    <p className="text-sm text-slate-700 mb-3">{state.message}</p>
                    <div className="flex gap-2">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={openTutorial}
                        className="text-xs border-orange-300 hover:bg-orange-100"
                        data-testid="button-show-tutorial"
                      >
                        <BookOpen className="w-3 h-3 mr-1" />
                        Show me around
                      </Button>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={hideMessage}
                        className="text-xs text-slate-500"
                        data-testid="button-dismiss-welcome"
                      >
                        Got it!
                      </Button>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Tutorial Slideshow Modal */}
      <AnimatePresence>
        {state.showTutorial && tutorial && (
          <motion.div
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <motion.div
              className="bg-white rounded-2xl shadow-2xl max-w-lg w-full overflow-hidden"
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.9, y: 20 }}
            >
              {/* Header */}
              <div className="bg-gradient-to-r from-orange-500 to-amber-500 p-4 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <LotBuddy expression="pointing" size="sm" animated={false} />
                  <div>
                    <h2 className="text-white font-bold">{tutorial.title}</h2>
                    <p className="text-orange-100 text-xs">
                      Step {state.currentSlide + 1} of {tutorial.slides.length}
                    </p>
                  </div>
                </div>
                <button
                  onClick={closeTutorial}
                  className="text-white/80 hover:text-white transition-colors"
                  data-testid="button-close-tutorial"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Progress Bar */}
              <div className="h-1 bg-orange-200">
                <motion.div
                  className="h-full bg-orange-500"
                  initial={{ width: 0 }}
                  animate={{
                    width: `${((state.currentSlide + 1) / tutorial.slides.length) * 100}%`,
                  }}
                  transition={{ duration: 0.3 }}
                />
              </div>

              {/* Content */}
              <div className="p-6">
                <AnimatePresence mode="wait">
                  <motion.div
                    key={state.currentSlide}
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    transition={{ duration: 0.2 }}
                  >
                    <h3 className="text-lg font-bold text-slate-800 mb-3 flex items-center gap-2">
                      <Sparkles className="w-5 h-5 text-orange-500" />
                      {tutorial.slides[state.currentSlide].title}
                    </h3>
                    <p className="text-slate-600 mb-4">
                      {tutorial.slides[state.currentSlide].content}
                    </p>
                    {tutorial.slides[state.currentSlide].tip && (
                      <div className="bg-amber-50 border border-amber-200 rounded-lg p-3 flex gap-2">
                        <Lightbulb className="w-4 h-4 text-amber-600 flex-shrink-0 mt-0.5" />
                        <p className="text-sm text-amber-800">
                          <strong>Pro tip:</strong> {tutorial.slides[state.currentSlide].tip}
                        </p>
                      </div>
                    )}
                    {currentSlide?.link && (
                      <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.3 }}
                        className="mt-4"
                      >
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => {
                            const linkRoute = currentSlide.link!.route;
                            const [path, hash] = linkRoute.split('#');
                            const isSameRoute = currentLocation === path || currentLocation.startsWith(path);
                            
                            if (hash) {
                              const tabValue = hashToTabMapping[hash];
                              if (tabValue) {
                                sessionStorage.setItem('tutorial-pending-tab', tabValue);
                                sessionStorage.setItem('tutorial-pending-hash', hash);
                              }
                            }
                            
                            closeTutorial();
                            
                            if (isSameRoute && hash) {
                              scrollToElement(hash);
                            } else {
                              setLocation(path);
                              if (hash) {
                                setTimeout(() => scrollToElement(hash), 500);
                              }
                            }
                          }}
                          className="w-full gap-2 border-orange-200 text-orange-600 hover:bg-orange-50 hover:text-orange-700"
                          data-testid={`button-slide-link-${state.currentSlide}`}
                        >
                          <ExternalLink className="w-4 h-4" />
                          {currentSlide.link.label}
                        </Button>
                      </motion.div>
                    )}
                  </motion.div>
                </AnimatePresence>
              </div>

              {/* Navigation */}
              <div className="border-t border-slate-200 p-4 flex justify-between items-center bg-slate-50">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={prevSlide}
                  disabled={state.currentSlide === 0}
                  className="gap-1"
                  data-testid="button-prev-slide"
                >
                  <ChevronLeft className="w-4 h-4" />
                  Back
                </Button>
                <div className="flex gap-1">
                  {tutorial.slides.map((_, i) => (
                    <div
                      key={i}
                      className={`w-2 h-2 rounded-full transition-colors ${
                        i === state.currentSlide ? "bg-orange-500" : "bg-slate-300"
                      }`}
                    />
                  ))}
                </div>
                <Button
                  size="sm"
                  onClick={nextSlide}
                  className="gap-1 bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600"
                  data-testid="button-next-slide"
                >
                  {state.currentSlide === tutorial.slides.length - 1 ? (
                    "Finish"
                  ) : (
                    <>
                      Next
                      <ChevronRight className="w-4 h-4" />
                    </>
                  )}
                </Button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Q&A Panel */}
      <AnimatePresence>
        {state.showQA && (
          <motion.div
            className="fixed bottom-20 left-4 z-50 w-80 max-h-[60vh]"
            initial={{ opacity: 0, y: 20, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.9 }}
          >
            <Card className="border-orange-200 shadow-2xl overflow-hidden">
              {/* Header */}
              <CardHeader className="bg-gradient-to-r from-orange-500 to-amber-500 py-3 px-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <LotBuddy expression="thinking" size="sm" animated={false} />
                    <div>
                      <CardTitle className="text-white text-sm">Ask Lot Buddy</CardTitle>
                      <p className="text-orange-100 text-xs">I'm here to help!</p>
                    </div>
                  </div>
                  <button
                    onClick={closeQA}
                    className="text-white/80 hover:text-white transition-colors"
                    data-testid="button-close-qa"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              </CardHeader>

              <CardContent className="p-0">
                {/* Search */}
                <form onSubmit={handleSearchSubmit} className="p-3 border-b border-slate-200">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                    <Input
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      placeholder="Type your question..."
                      className="pl-9 pr-10 text-sm"
                      data-testid="input-qa-search"
                    />
                    <button
                      type="submit"
                      className="absolute right-2 top-1/2 -translate-y-1/2 text-orange-500 hover:text-orange-600"
                      data-testid="button-qa-submit"
                    >
                      <Send className="w-4 h-4" />
                    </button>
                  </div>
                </form>

                {/* Quick Actions */}
                <div className="p-3 border-b border-slate-200 space-y-2">
                  <p className="text-xs text-slate-500 font-medium">Quick Actions</p>
                  <div className="flex flex-wrap gap-2">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={openTutorial}
                      className="text-xs h-7 border-orange-200 hover:bg-orange-50"
                      data-testid="button-qa-tutorial"
                    >
                      <BookOpen className="w-3 h-3 mr-1" />
                      Page Tutorial
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => setSearchQuery("How do I")}
                      className="text-xs h-7 border-blue-200 hover:bg-blue-50"
                      data-testid="button-qa-howto"
                    >
                      <HelpCircle className="w-3 h-3 mr-1" />
                      How do I...
                    </Button>
                  </div>
                </div>

                {/* Results or Selected Answer */}
                <ScrollArea className="h-64">
                  <div className="p-3 space-y-2">
                    {selectedFAQ ? (
                      <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        className="space-y-3"
                      >
                        <button
                          onClick={() => setSelectedFAQ(null)}
                          className="text-xs text-orange-500 hover:text-orange-600 flex items-center gap-1"
                          data-testid="button-back-to-results"
                        >
                          <ChevronLeft className="w-3 h-3" />
                          Back to results
                        </button>
                        <div className="bg-orange-50 rounded-lg p-3">
                          <p className="font-medium text-sm text-slate-800 mb-2 flex items-center gap-2">
                            <MessageCircle className="w-4 h-4 text-orange-500" />
                            {selectedFAQ.question}
                          </p>
                          <p className="text-sm text-slate-600">{selectedFAQ.answer}</p>
                        </div>
                        <div className="flex items-center gap-2">
                          <LotBuddy expression="speaking" size="sm" />
                          <p className="text-xs text-slate-500">
                            Was this helpful? Let me know if you need more info!
                          </p>
                        </div>
                      </motion.div>
                    ) : searchResults.length > 0 ? (
                      <>
                        <p className="text-xs text-slate-500 mb-2">
                          Found {searchResults.length} result{searchResults.length !== 1 ? "s" : ""}
                        </p>
                        {searchResults.map((item, i) => (
                          <motion.button
                            key={i}
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: i * 0.05 }}
                            onClick={() => setSelectedFAQ(item)}
                            className="w-full text-left p-2 rounded-lg hover:bg-orange-50 border border-transparent hover:border-orange-200 transition-colors"
                            data-testid={`button-faq-${i}`}
                          >
                            <p className="text-sm font-medium text-slate-700 flex items-center gap-2">
                              <HelpCircle className="w-3 h-3 text-orange-400" />
                              {item.question}
                            </p>
                          </motion.button>
                        ))}
                      </>
                    ) : searchQuery.length > 2 ? (
                      <div className="text-center py-4">
                        <LotBuddy expression="thinking" size="md" />
                        <p className="text-sm text-slate-500 mt-2">
                          Hmm, I couldn't find anything for that.
                        </p>
                        <p className="text-xs text-slate-400">
                          Try different keywords or ask differently!
                        </p>
                      </div>
                    ) : (
                      <div className="space-y-2">
                        <p className="text-xs text-slate-500 font-medium">Popular Questions</p>
                        {[
                          "How do I clock in?",
                          "How do I send a task to a driver?",
                          "What is the Daily Access Code?",
                        ].map((q, i) => (
                          <button
                            key={i}
                            onClick={() => setSearchQuery(q)}
                            className="w-full text-left p-2 rounded-lg hover:bg-slate-50 text-sm text-slate-600 flex items-center gap-2"
                            data-testid={`button-popular-${i}`}
                          >
                            <MessageCircle className="w-3 h-3 text-slate-400" />
                            {q}
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                </ScrollArea>
              </CardContent>
            </Card>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}

export default MascotGuideOverlay;
