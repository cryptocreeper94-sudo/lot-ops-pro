import { createContext, useContext, useState, useEffect, useCallback, ReactNode } from "react";
import { useLocation } from "wouter";

export type MascotExpression = "idle" | "waving" | "speaking" | "celebrating" | "thinking" | "pointing";

interface WelcomeMessage {
  role: string;
  messages: string[];
}

export interface TutorialSlide {
  title: string;
  content: string;
  tip?: string;
  link?: {
    route: string;
    label: string;
  };
}

export interface PageTutorial {
  route: string;
  title: string;
  slides: TutorialSlide[];
}

export interface FAQItem {
  question: string;
  answer: string;
  keywords: string[];
  roles?: string[];
}

interface MascotState {
  isVisible: boolean;
  expression: MascotExpression;
  message: string | null;
  currentSlide: number;
  totalSlides: number;
  showTutorial: boolean;
  showQA: boolean;
}

interface MascotContextType {
  state: MascotState;
  showWelcome: (userName: string, userRole: string) => void;
  showMessage: (message: string, expression?: MascotExpression, duration?: number) => void;
  hideMessage: () => void;
  openTutorial: () => void;
  closeTutorial: () => void;
  nextSlide: () => void;
  prevSlide: () => void;
  openQA: () => void;
  closeQA: () => void;
  searchFAQ: (query: string) => FAQItem[];
  getCurrentPageTutorial: () => PageTutorial | null;
  dismissedToday: boolean;
  setDismissedToday: (value: boolean) => void;
}

const normalizeRole = (role: string): string => {
  const r = role?.toLowerCase()?.trim() || 'driver';
  if (r.includes('operations') || r.includes('manager') || r === 'ops_manager') return 'operations_manager';
  if (r.includes('supervisor') || r === 'sup') return 'supervisor';
  if (r.includes('driver') || r === 'van' || r === 'transport') return 'driver';
  if (r.includes('inventory') || r === 'inv') return 'inventory';
  if (r.includes('beta') || r.includes('tester')) return 'beta_tester';
  if (r.includes('safety')) return 'safety_advisor';
  if (r.includes('developer') || r === 'dev') return 'developer';
  return 'driver';
};

const welcomeMessages: WelcomeMessage[] = [
  {
    role: "operations_manager",
    messages: [
      "Welcome back, boss! Ready to run a smooth operation today?",
      "Hey there! Your team is counting on you. Let's make it a great day!",
      "Good to see you! The lot is waiting for your leadership.",
      "Welcome! I've got all your dashboards ready to go.",
    ]
  },
  {
    role: "supervisor",
    messages: [
      "Hey! Your drivers are ready and waiting. Let's keep things moving!",
      "Welcome back! Time to keep this lot running like clockwork.",
      "Good to see you! Ready to dispatch some drivers?",
      "Hey supervisor! The team's all set. What's the game plan?",
    ]
  },
  {
    role: "driver",
    messages: [
      "Hey driver! Ready to hit the lot? Your assignments are waiting!",
      "Welcome! Let's move some vehicles today. You got this!",
      "Good to see you! Time to rack up those moves.",
      "Hey! The lot awaits. Let's make some magic happen!",
    ]
  },
  {
    role: "inventory",
    messages: [
      "Hey inventory driver! Ready to scan some vehicles today?",
      "Welcome! Let's get those cars logged and tracked.",
      "Good to see you! Time to keep the inventory moving.",
    ]
  },
  {
    role: "safety_advisor",
    messages: [
      "Welcome, Safety Advisor! Ready to keep everyone safe today?",
      "Hey there! Your watchful eye keeps the lot running safely.",
      "Good to see you! Let's make it a zero-incident day!",
    ]
  },
  {
    role: "developer",
    messages: [
      "Hey developer! Ready to build something awesome?",
      "Welcome to the dev zone! All systems are operational.",
      "Good to see you! The code awaits your expertise.",
    ]
  },
  {
    role: "beta_tester",
    messages: [
      "Welcome, tester! Thanks for helping us make Lot Ops Pro amazing!",
      "Hey beta tester! Your feedback is super valuable. Explore away!",
      "Welcome! Don't hold back - we want to hear what you think!",
    ]
  }
];

const pageTutorials: PageTutorial[] = [
  {
    route: "/",
    title: "Welcome to Lot Ops Pro",
    slides: [
      {
        title: "Your Dashboard",
        content: "This is your home base! From here, you can see everything that's happening on the lot at a glance.",
        tip: "The cards update in real-time, so you always know what's going on."
      },
      {
        title: "Quick Navigation",
        content: "Use the tabs at the top to jump between different sections. Each one is designed for a specific task.",
        tip: "Swipe left or right on mobile to see more tabs!"
      },
      {
        title: "Getting Help",
        content: "See me in the corner? Click on me anytime for help with the current page!",
        tip: "You can also type questions and I'll find answers for you."
      }
    ]
  },
  {
    route: "/resource-allocation",
    title: "Supervisor Dashboard Guide",
    slides: [
      {
        title: "Driver Management",
        content: "The Roster tab shows all your active drivers. You can see who's clocked in and their current assignments.",
        tip: "Green badges mean the driver is available. Yellow means they're on a task.",
        link: { route: "/resource-allocation#roster", label: "View Driver Roster" }
      },
      {
        title: "Sending Assignments",
        content: "Use the Assignment Panel to send task lists directly to drivers. They'll get notified instantly!",
        tip: "Save frequently used lists as templates to speed things up.",
        link: { route: "/resource-allocation#assignments", label: "Open Assignments" }
      },
      {
        title: "Lane Crunch Operations",
        content: "Need to consolidate lanes? Select 'Crunch Lanes' and pick which lane groups to work on.",
        tip: "Lane groups: 501-505, 513-515, 516-518, 591-599",
        link: { route: "/resource-allocation#lanes", label: "Manage Lanes" }
      },
      {
        title: "Performance Tracking",
        content: "Keep an eye on the Performance tab to see how your team is doing. Real-time stats help you optimize.",
        tip: "Look for the efficiency score - aim for 85% or higher!",
        link: { route: "/resource-allocation#performance", label: "View Performance" }
      }
    ]
  },
  {
    route: "/operations-manager",
    title: "Operations Manager Guide",
    slides: [
      {
        title: "Your Command Center",
        content: "Everything you need to run the entire operation is right here. Overview shows the big picture.",
        tip: "Start each day by checking the Daily Access Code and sharing it at the pre-shift meeting.",
        link: { route: "/operations-manager#overview", label: "Go to Dashboard" }
      },
      {
        title: "Team Communication",
        content: "Use the Messages tab to send announcements to the whole team or specific groups.",
        tip: "Important messages can be marked as priority to make sure everyone sees them.",
        link: { route: "/operations-manager#messages", label: "Open Messages" }
      },
      {
        title: "Reports & Analytics",
        content: "The Reports tab gives you detailed insights into performance, efficiency, and trends.",
        tip: "Export reports as PDF for management meetings!",
        link: { route: "/operations-manager#reports", label: "View Reports" }
      },
      {
        title: "AI Optimization",
        content: "Our AI analyzes lot conditions and suggests ways to improve flow and efficiency.",
        tip: "Review AI suggestions daily - they learn from your lot's patterns!",
        link: { route: "/operations-manager#ai-suggestions", label: "See AI Suggestions" }
      }
    ]
  },
  {
    route: "/van-driver",
    title: "Driver Dashboard Guide",
    slides: [
      {
        title: "Your Assignments",
        content: "Check here for your current task list. Each assignment shows where to pick up and where to drop off.",
        tip: "Tap an assignment to see the full route and any special instructions."
      },
      {
        title: "Completing Tasks",
        content: "When you finish a task, mark it complete. Your supervisor will be notified automatically!",
        tip: "If you run into issues, use the 'Request Help' option."
      },
      {
        title: "GPS Navigation",
        content: "The built-in GPS shows you the fastest route across the lot. Follow the blue line!",
        tip: "Speed is tracked automatically - stay safe out there!"
      },
      {
        title: "Communication",
        content: "Need to talk to your supervisor? Use the message feature to send updates or ask questions.",
        tip: "Check for new messages at the start of each shift!"
      }
    ]
  },
  {
    route: "/crew-manager",
    title: "Driver Dashboard Guide",
    slides: [
      {
        title: "Your Assignments",
        content: "Check here for your current task list. Each assignment shows where to pick up and where to drop off.",
        tip: "Tap an assignment to see the full route and any special instructions."
      },
      {
        title: "Completing Tasks",
        content: "When you finish a task, mark it complete. Your supervisor will be notified automatically!",
        tip: "If you run into issues, use the 'Request Help' option."
      },
      {
        title: "GPS Navigation",
        content: "The built-in GPS shows you the fastest route across the lot. Follow the blue line!",
        tip: "Speed is tracked automatically - stay safe out there!"
      },
      {
        title: "Communication",
        content: "Need to talk to your supervisor? Use the message feature to send updates or ask questions.",
        tip: "Check for new messages at the start of each shift!"
      }
    ]
  },
  {
    route: "/dashboard",
    title: "Mode Selection Guide",
    slides: [
      {
        title: "Choose Your Role",
        content: "Select the operation mode that matches your job for today.",
        tip: "Each mode gives you different tools tailored to your responsibilities."
      },
      {
        title: "Supervisor Access",
        content: "Supervisors have a special login with enhanced controls for managing drivers and operations.",
        tip: "Enter your supervisor PIN to access advanced features."
      },
      {
        title: "Quick Start",
        content: "Tap on your assigned role card to get started right away!",
        tip: "Check with your supervisor if you're unsure which mode to use."
      }
    ]
  }
];

const faqItems: FAQItem[] = [
  {
    question: "How do I clock in?",
    answer: "On your dashboard, look for the 'Clock In' button at the top. Tap it, and you're all set! Make sure your GPS is enabled.",
    keywords: ["clock", "start", "shift", "begin", "login"],
    roles: ["driver", "supervisor"]
  },
  {
    question: "How do I send a task to a driver?",
    answer: "Go to the Assignment Panel, select a driver from the dropdown, choose your task type (Send List, Crunch Lanes, or Custom), and hit Send!",
    keywords: ["assign", "task", "driver", "send", "dispatch"],
    roles: ["supervisor", "operations_manager"]
  },
  {
    question: "What do the lane groups mean?",
    answer: "Lane groups organize the lot into sections: 501-505 (North), 513-515 (Central), 516-518 (South), and 591-599 (Overflow). Use these for crunch operations!",
    keywords: ["lane", "group", "section", "crunch", "area"],
    roles: ["supervisor", "driver", "operations_manager"]
  },
  {
    question: "How do I mark a task complete?",
    answer: "When you've finished your assignment, tap the 'Complete' button on your assignment card. You can then send a response back to your supervisor.",
    keywords: ["complete", "finish", "done", "task", "assignment"],
    roles: ["driver"]
  },
  {
    question: "What is the Daily Access Code?",
    answer: "The Daily Access Code changes every day and is announced at the pre-shift meeting. Drivers need it to log in. Supervisors can bypass it.",
    keywords: ["code", "access", "daily", "login", "security"],
    roles: ["driver", "supervisor", "operations_manager"]
  },
  {
    question: "How do I check my performance stats?",
    answer: "Your performance stats are visible on your dashboard. Look for the Performance card showing moves completed, average speed, and efficiency score.",
    keywords: ["performance", "stats", "score", "moves", "speed"],
    roles: ["driver", "supervisor"]
  },
  {
    question: "How do I contact my supervisor?",
    answer: "Use the Messages feature on your dashboard. Tap the message icon, select your supervisor, and type your message. They'll get it instantly!",
    keywords: ["message", "contact", "supervisor", "talk", "communicate"],
    roles: ["driver"]
  },
  {
    question: "What does Sandbox Mode mean?",
    answer: "Sandbox Mode is training mode! You can explore all features without affecting real data. Perfect for learning the system.",
    keywords: ["sandbox", "training", "practice", "demo", "test"],
    roles: ["driver", "supervisor", "operations_manager", "beta_tester"]
  },
  {
    question: "How do I use the AI optimization feature?",
    answer: "Go to the AI Optimization tab and click 'Generate Suggestions'. The AI will analyze current lot conditions and give you actionable recommendations!",
    keywords: ["ai", "optimization", "suggestions", "smart", "improve"],
    roles: ["supervisor", "operations_manager"]
  },
  {
    question: "How do I track a specific vehicle?",
    answer: "Use the Asset Tracking feature. Enter the VIN or stock number in the search bar, and you'll see the vehicle's current location and history.",
    keywords: ["track", "vehicle", "vin", "find", "locate", "asset"],
    roles: ["supervisor", "operations_manager"]
  }
];

const MascotContext = createContext<MascotContextType | null>(null);

export function MascotProvider({ children }: { children: ReactNode }) {
  const [location] = useLocation();
  const [dismissedToday, setDismissedToday] = useState(() => {
    const today = new Date().toDateString();
    const dismissed = localStorage.getItem("lotbuddy_dismissed_date");
    return dismissed === today;
  });

  const [state, setState] = useState<MascotState>({
    isVisible: false,
    expression: "idle",
    message: null,
    currentSlide: 0,
    totalSlides: 0,
    showTutorial: false,
    showQA: false,
  });

  const showWelcome = useCallback((userName: string, userRole: string) => {
    if (dismissedToday) return;

    const normalizedRole = normalizeRole(userRole);
    const roleMessages = welcomeMessages.find(w => w.role === normalizedRole) || welcomeMessages.find(w => w.role === 'driver')!;
    const randomMessage = roleMessages.messages[Math.floor(Math.random() * roleMessages.messages.length)];
    
    const firstName = userName?.split(' ')[0] || 'there';
    const personalizedMessage = randomMessage.replace(/^Hey!?|^Welcome!?|^Good to see you!?/i, `Hey ${firstName}!`);

    setState(prev => ({
      ...prev,
      isVisible: true,
      expression: "waving",
      message: personalizedMessage,
    }));

    setTimeout(() => {
      setState(prev => ({ ...prev, expression: "speaking" }));
    }, 1500);
  }, [dismissedToday]);

  const showMessage = useCallback((message: string, expression: MascotExpression = "speaking", duration?: number) => {
    setState(prev => ({
      ...prev,
      isVisible: true,
      expression,
      message,
    }));

    if (duration) {
      setTimeout(() => {
        hideMessage();
      }, duration);
    }
  }, []);

  const hideMessage = useCallback(() => {
    setState(prev => ({
      ...prev,
      isVisible: false,
      message: null,
      expression: "idle",
    }));

    const today = new Date().toDateString();
    localStorage.setItem("lotbuddy_dismissed_date", today);
    setDismissedToday(true);
  }, []);

  const getCurrentPageTutorial = useCallback((): PageTutorial | null => {
    // First try exact match, then longest prefix match, then fallback to first tutorial
    const exactMatch = pageTutorials.find(t => t.route === location);
    if (exactMatch) return exactMatch;
    
    // Find longest matching prefix (most specific route)
    const prefixMatches = pageTutorials
      .filter(t => location.startsWith(t.route))
      .sort((a, b) => b.route.length - a.route.length);
    
    return prefixMatches[0] || pageTutorials[0];
  }, [location]);

  const openTutorial = useCallback(() => {
    const tutorial = getCurrentPageTutorial();
    setState(prev => ({
      ...prev,
      showTutorial: true,
      showQA: false,
      currentSlide: 0,
      totalSlides: tutorial?.slides.length || 0,
      expression: "pointing",
    }));
  }, [getCurrentPageTutorial]);

  const closeTutorial = useCallback(() => {
    setState(prev => ({
      ...prev,
      showTutorial: false,
      currentSlide: 0,
      expression: "idle",
    }));
  }, []);

  const nextSlide = useCallback(() => {
    const tutorial = getCurrentPageTutorial();
    if (!tutorial) return;

    setState(prev => {
      const next = prev.currentSlide + 1;
      if (next >= tutorial.slides.length) {
        return { ...prev, showTutorial: false, currentSlide: 0, expression: "celebrating" };
      }
      return { ...prev, currentSlide: next };
    });
  }, [getCurrentPageTutorial]);

  const prevSlide = useCallback(() => {
    setState(prev => ({
      ...prev,
      currentSlide: Math.max(0, prev.currentSlide - 1),
    }));
  }, []);

  const openQA = useCallback(() => {
    setState(prev => ({
      ...prev,
      showQA: true,
      showTutorial: false,
      expression: "thinking",
    }));
  }, []);

  const closeQA = useCallback(() => {
    setState(prev => ({
      ...prev,
      showQA: false,
      expression: "idle",
    }));
  }, []);

  const searchFAQ = useCallback((query: string): FAQItem[] => {
    const queryLower = query.toLowerCase();
    const queryWords = queryLower.split(' ').filter(w => w.length > 2);

    return faqItems.filter(item => {
      const matchesKeyword = item.keywords.some(k => 
        queryLower.includes(k) || queryWords.some(w => k.includes(w))
      );
      const matchesQuestion = item.question.toLowerCase().includes(queryLower);
      return matchesKeyword || matchesQuestion;
    }).slice(0, 5);
  }, []);

  return (
    <MascotContext.Provider value={{
      state,
      showWelcome,
      showMessage,
      hideMessage,
      openTutorial,
      closeTutorial,
      nextSlide,
      prevSlide,
      openQA,
      closeQA,
      searchFAQ,
      getCurrentPageTutorial,
      dismissedToday,
      setDismissedToday,
    }}>
      {children}
    </MascotContext.Provider>
  );
}

export function useMascot() {
  const context = useContext(MascotContext);
  if (!context) {
    throw new Error("useMascot must be used within a MascotProvider");
  }
  return context;
}

export { pageTutorials, faqItems };
