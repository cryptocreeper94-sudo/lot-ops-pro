import { useState, useRef, useEffect } from "react";
import { 
  MessageSquare, 
  X, 
  Send, 
  Minimize2, 
  Maximize2, 
  User, 
  MoreVertical,
  Phone,
  AlertCircle,
  ChevronLeft,
  Users,
  Zap,
  Shield,
  Lock,
  Mic,
  MicOff
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";

import { useToast } from "@/hooks/use-toast";

interface Message {
  id: number;
  fromId: string;
  toId: string | null;
  content: string;
  timestamp: string;
  isRead: boolean;
  isOfficial: boolean; // Official company message (logged) vs Private (not stored)
}

interface ChatOverlayProps {
  role: "supervisor" | "driver";
  driverId?: string; // For driver role
  driverName?: string; // For supervisor to see who they are talking to
  serviceTruckDriver?: string; // Service truck driver ID for special designation
  initialOpen?: boolean; // Start with panel open
}

export function ChatOverlay({ role, driverId, driverName, serviceTruckDriver, initialOpen = false }: ChatOverlayProps) {
  const { toast } = useToast();
  const [isOpen, setIsOpen] = useState(initialOpen);
  const [isMinimized, setIsMinimized] = useState(false);
  const [newMessage, setNewMessage] = useState("");
  const [hasUnread, setHasUnread] = useState(false);
  const [isOfficial, setIsOfficial] = useState(false); // Official Message toggle
  const [showPrivacyBanner, setShowPrivacyBanner] = useState(true); // Privacy notice
  const [isListening, setIsListening] = useState(false); // Voice recognition state
  
  // Supervisor State
  const [selectedDriver, setSelectedDriver] = useState<string | null>(null); // null = List View
  const [showQuickReplies, setShowQuickReplies] = useState(true);

  const scrollRef = useRef<HTMLDivElement>(null);
  const lastMessageRef = useRef<number | null>(null);
  const queryClient = useQueryClient();

  // Identity Management
  const [myId, setMyId] = useState<string>("");

  useEffect(() => {
    if (role === "supervisor") {
      setMyId("Supervisor");
    } else {
      // Use provided driverId, or fall back to localStorage (legacy/testing)
      if (driverId) {
        setMyId(driverId);
      } else {
        let storedId = localStorage.getItem("vanops_driver_id");
        if (!storedId) {
          storedId = Math.floor(Math.random() * 900 + 100).toString();
          localStorage.setItem("vanops_driver_id", storedId);
        }
        setMyId(storedId);
      }
    }
  }, [role, driverId]);

  // Fetch Messages
  const { data: messages = [] } = useQuery<Message[]>({
    queryKey: ["messages", myId, role], // Add role to key
    queryFn: async () => {
      if (!myId) return [];
      
      if (role === "supervisor") {
        // Supervisor gets ALL messages
        const res = await fetch("/api/messages");
        return res.json();
      } else {
        // Driver gets ONLY their messages (filtered by backend)
        const res = await fetch(`/api/messages?driverNumber=${myId}`);
        return res.json();
      }
    },
    refetchInterval: 2000,
    enabled: !!myId
  });

  // SUPERVISOR: Derive Conversation List
  const conversations = role === "supervisor" 
    ? Array.from(new Set(messages
        .filter(m => m.fromId !== "Supervisor") // Get all drivers who spoke
        .map(m => m.fromId)
      ))
    : [];

  // SUPERVISOR: Filter messages for active view
  const activeMessages = role === "supervisor" 
    ? (selectedDriver 
        ? messages.filter(m => m.fromId === selectedDriver || m.toId === selectedDriver)
        : []) // List view doesn't show messages
    : messages; // Driver sees all their messages

  // Send Message Mutation
  const sendMessageMutation = useMutation({
    mutationFn: async (text: string) => {
      let toId: string | null = null;
      
      if (role === "driver") {
        toId = "Supervisor";
      } else {
        // Supervisor sending
        toId = selectedDriver || "all"; // If no driver selected (shouldn't happen in chat view), broadcast
      }

      await apiRequest("POST", "/api/messages", {
        fromId: myId,
        toId,
        content: text,
        isOfficial: isOfficial // Include privacy flag
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["messages"] });
      setNewMessage("");
      setIsOfficial(false); // Reset toggle after send
    }
  });

  // Auto-scroll
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [activeMessages, isOpen, selectedDriver]);

  // Unread Logic & Toast Notification
  useEffect(() => {
    if (messages.length > 0) {
      const lastMsg = messages[messages.length - 1];
      
      // Check if it's a new message we haven't seen yet
      if (lastMessageRef.current !== lastMsg.id) {
        lastMessageRef.current = lastMsg.id;
        
        // If it's from someone else
        if (lastMsg.fromId !== myId) {
          // If chat is closed OR minimized, show toast
          if (!isOpen || isMinimized) {
            setHasUnread(true);
            toast({
              title: `New Message from ${lastMsg.fromId === 'Supervisor' ? 'Teresa (Supervisor)' : `Driver ${lastMsg.fromId}`}`,
              description: lastMsg.content,
              duration: 5000,
            });
          }
        }
      }
    }
  }, [messages, isOpen, isMinimized, myId, toast]);

  const handleSend = () => {
    if (!newMessage.trim()) return;
    sendMessageMutation.mutate(newMessage);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') handleSend();
  };

  const toggleChat = () => {
    setIsOpen(!isOpen);
    if (!isOpen) setHasUnread(false);
  };

  // Voice Recognition
  const handleVoiceInput = () => {
    if (!('webkitSpeechRecognition' in window) && !('SpeechRecognition' in window)) {
      toast({
        title: "Voice not supported",
        description: "Your browser doesn't support voice recognition. Try Chrome or Safari.",
        variant: "destructive"
      });
      return;
    }

    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    const recognition = new SpeechRecognition();
    
    recognition.continuous = false;
    recognition.interimResults = false;
    recognition.lang = 'en-US';

    recognition.onstart = () => {
      setIsListening(true);
      toast({
        title: "🎤 Listening...",
        description: "Speak your message now"
      });
    };

    recognition.onresult = (event: any) => {
      const transcript = event.results[0][0].transcript;
      setNewMessage(transcript);
      setIsListening(false);
    };

    recognition.onerror = (event: any) => {
      setIsListening(false);
      toast({
        title: "Voice recognition error",
        description: event.error === 'no-speech' ? "No speech detected. Try again." : "Could not recognize speech.",
        variant: "destructive"
      });
    };

    recognition.onend = () => {
      setIsListening(false);
    };

    recognition.start();
  };

  const quickReplies = [
    // Crunch Operations - Lot Assignments
    { text: "Do 501", icon: "🅿️", category: "crunch" },
    { text: "Do 518", icon: "🅿️", category: "crunch" },
    { text: "Do 591-599", icon: "🅿️", category: "crunch" },
    { text: "Do VIP (500-505)", icon: "👑", category: "crunch" },
    { text: "Do Inventory", icon: "📦", category: "crunch" },
    { text: "Clean Side", icon: "🧹", category: "crunch" },
    { text: "Sold Lots (801-805)", icon: "💰", category: "crunch" },
    { text: "Work the Chutes", icon: "🚪", category: "crunch" },
    // General Check-ins
    { text: "Is everything okay?", icon: "❓", category: "check" },
    { text: "Do you have your radio?", icon: "📻", category: "check" },
    { text: "Are you on break?", icon: "☕", category: "check" },
    // Actions
    { text: "Come see me in the office", icon: "🏢", category: "action" },
    { text: "I have a list for you", icon: "📋", category: "action" },
    { text: "Please respond ASAP", icon: "⚡", category: "urgent" },
    // Positive Feedback
    { text: "Thanks for the update!", icon: "👍", category: "positive" },
    { text: "Great work today!", icon: "⭐", category: "positive" },
    { text: "Need to pick up the pace", icon: "⏱️", category: "nudge" },
  ];

  const handleQuickReply = (text: string) => {
    setNewMessage(text);
    setShowQuickReplies(false);
  };

  const formatTime = (isoString: string) => {
    return new Date(isoString).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  // --- RENDER LOGIC ---

  // 1. Minimized / Button
  if (!isOpen || isMinimized) {
    const lastMsg = messages[messages.length - 1];
    return (
      <div className="fixed bottom-6 right-6 z-50 flex flex-col items-end gap-2">
        {isOpen && isMinimized && lastMsg && (
           <div className="bg-white rounded-lg shadow-lg p-3 border border-slate-200 w-64 mb-2 animate-in slide-in-from-bottom-5">
             <div className="flex justify-between items-center mb-2">
               <span className="font-bold text-sm">{lastMsg.fromId === myId ? 'Me' : lastMsg.fromId}</span>
               <div className="flex gap-1">
                  <Button variant="ghost" size="icon" className="h-5 w-5" onClick={() => setIsMinimized(false)}><Maximize2 className="h-3 w-3" /></Button>
                  <Button variant="ghost" size="icon" className="h-5 w-5" onClick={() => setIsOpen(false)}><X className="h-3 w-3" /></Button>
               </div>
             </div>
             <div className="text-xs text-slate-500 truncate">
                {lastMsg.content}
             </div>
           </div>
        )}
        
        <Button 
          onClick={toggleChat}
          className={`h-14 w-14 rounded-full shadow-xl flex items-center justify-center transition-all duration-300 ${hasUnread ? 'bg-red-600 hover:bg-red-700 animate-bounce' : 'bg-blue-600 hover:bg-blue-700'}`}
        >
          <MessageSquare className="h-6 w-6 text-white" />
          {hasUnread && (
            <span className="absolute -top-1 -right-1 h-5 w-5 bg-red-500 border-2 border-white rounded-full flex items-center justify-center text-[10px] font-bold text-white">
              !
            </span>
          )}
        </Button>
      </div>
    );
  }

  // 2. Supervisor List View
  if (role === "supervisor" && !selectedDriver) {
    return (
      <div className="fixed bottom-6 right-6 z-50 w-80 sm:w-96 shadow-2xl animate-in slide-in-from-bottom-10 fade-in">
        <Card className="border-blue-200 overflow-hidden h-[500px] flex flex-col">
          <CardHeader className="p-3 bg-slate-900 text-white flex flex-row items-center justify-between sticky top-0">
            <div className="flex items-center gap-3">
               <Users className="h-5 w-5" />
               <CardTitle className="text-sm font-bold">Active Conversations</CardTitle>
            </div>
            <div className="flex items-center gap-1">
               <Button variant="ghost" size="icon" className="h-6 w-6 text-slate-300 hover:text-white" onClick={() => setIsMinimized(true)}>
                <Minimize2 className="h-3 w-3" />
               </Button>
               <Button variant="ghost" size="icon" className="h-6 w-6 text-slate-300 hover:text-white" onClick={() => setIsOpen(false)}>
                <X className="h-3 w-3" />
               </Button>
            </div>
          </CardHeader>
          <CardContent className="p-0 bg-slate-50 flex-1 overflow-hidden flex flex-col">
            <div className="p-2 bg-blue-50 border-b border-blue-100 space-y-2">
              <Button 
                className="w-full bg-blue-600 hover:bg-blue-700 h-8 text-xs"
                onClick={() => setSelectedDriver("all")}
                data-testid="button-broadcast-all"
              >
                📢 Broadcast to Everyone
              </Button>
              <Button 
                className="w-full bg-green-600 hover:bg-green-700 h-8 text-xs"
                onClick={() => setSelectedDriver("van_drivers")}
                data-testid="button-broadcast-van-drivers"
              >
                🚐 Van Drivers Only
              </Button>
            </div>
            <ScrollArea className="flex-1">
              {conversations.length === 0 ? (
                 <div className="p-8 text-center text-slate-400 text-sm">
                   No active driver conversations.
                 </div>
              ) : (
                conversations.map(driverNum => {
                   const lastMsg = messages.filter(m => m.fromId === driverNum || m.toId === driverNum).pop();
                   const unreadCount = messages.filter(m => m.fromId === driverNum && !m.isRead).length;
                   
                   return (
                     <div 
                       key={driverNum}
                       className="p-3 border-b border-slate-100 hover:bg-white cursor-pointer transition-colors flex items-center gap-3"
                       onClick={() => setSelectedDriver(driverNum)}
                     >
                       <Avatar className="h-10 w-10 bg-slate-200">
                         <AvatarFallback className="text-slate-600 text-xs">{driverNum}</AvatarFallback>
                       </Avatar>
                       <div className="flex-1 overflow-hidden">
                         <div className="flex justify-between items-center">
                           <span className="font-bold text-sm text-slate-900">
                             {serviceTruckDriver === driverNum ? 'Service Truck Driver' : `Driver ${driverNum}`}
                           </span>
                           <span className="text-[10px] text-slate-400">{lastMsg ? formatTime(lastMsg.timestamp) : ''}</span>
                         </div>
                         <div className="text-xs text-slate-500 truncate">
                           {lastMsg?.fromId === 'Supervisor' ? 'You: ' : ''}
                           {lastMsg?.content || 'No messages'}
                         </div>
                       </div>
                       {unreadCount > 0 && (
                         <Badge className="h-5 w-5 rounded-full p-0 flex items-center justify-center bg-blue-600 text-white">
                           {unreadCount}
                         </Badge>
                       )}
                     </div>
                   );
                })
              )}
            </ScrollArea>
          </CardContent>
        </Card>
      </div>
    );
  }

  // 3. Chat View (Driver OR Supervisor-Selected)
  const chatTitle = role === "supervisor" 
    ? (selectedDriver === "all" 
        ? "Broadcast to All" 
        : selectedDriver === "van_drivers" 
          ? "Van Drivers" 
          : serviceTruckDriver === selectedDriver 
            ? "Service Truck Driver"
            : `Driver ${selectedDriver}`) 
    : "Lot Supervisor";

  const chatSubtitle = role === "supervisor"
    ? (selectedDriver === "all" 
        ? "Everyone will receive this" 
        : selectedDriver === "van_drivers"
          ? "All van drivers will see this"
          : "Direct message")
    : "Online";

  return (
    <div className="fixed bottom-6 right-6 z-50 w-80 sm:w-96 shadow-2xl animate-in slide-in-from-bottom-10 fade-in">
      <Card className="border-blue-200 overflow-hidden h-[500px] flex flex-col">
        <CardHeader className={`p-3 ${role === 'supervisor' ? 'bg-slate-900' : 'bg-blue-600'} text-white flex flex-row items-center justify-between sticky top-0`}>
          <div className="flex items-center gap-3">
            {role === "supervisor" && (
              <Button variant="ghost" size="icon" className="h-6 w-6 -ml-2 mr-1 text-white hover:bg-white/20" onClick={() => setSelectedDriver(null)}>
                <ChevronLeft className="h-4 w-4" />
              </Button>
            )}
            <div className="relative">
              <Avatar className={`h-8 w-8 border-2 ${role === 'supervisor' ? 'border-slate-600 bg-slate-800' : 'border-blue-400 bg-blue-800'}`}>
                <AvatarFallback className="text-xs text-white">{role === 'driver' ? 'D' : 'S'}</AvatarFallback>
              </Avatar>
              <span className="absolute bottom-0 right-0 h-2.5 w-2.5 bg-green-400 border-2 border-blue-600 rounded-full"></span>
            </div>
            <div>
              <CardTitle className="text-sm font-bold leading-none">
                {chatTitle}
              </CardTitle>
              <p className="text-[10px] opacity-80 font-medium">
                {chatSubtitle}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-1">
            <Button variant="ghost" size="icon" className="h-6 w-6 opacity-80 hover:opacity-100 hover:bg-white/20" onClick={() => setIsMinimized(true)}>
              <Minimize2 className="h-3 w-3" />
            </Button>
            <Button variant="ghost" size="icon" className="h-6 w-6 opacity-80 hover:opacity-100 hover:bg-white/20" onClick={() => setIsOpen(false)}>
              <X className="h-3 w-3" />
            </Button>
          </div>
        </CardHeader>
        
        <CardContent className="p-0 bg-slate-50 flex-1 overflow-hidden flex flex-col">
          {/* Privacy & Safety Banners */}
          {showPrivacyBanner && (
            <div className="border-b border-slate-200">
              <div className="bg-gradient-to-r from-green-50 to-blue-50 border-b border-green-200 p-2">
                <div className="flex items-start gap-2">
                  <Lock className="h-3.5 w-3.5 text-green-600 mt-0.5 flex-shrink-0" />
                  <div className="flex-1">
                    <p className="text-[10px] font-bold text-green-900 leading-tight">🔒 Private by Default</p>
                    <p className="text-[9px] text-green-700 leading-tight mt-0.5">
                      All messages are private unless marked Official. Developers have NO access to private messages. Only sender and recipient can see private chats.
                    </p>
                  </div>
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    className="h-4 w-4 p-0 text-green-600 hover:text-green-900"
                    onClick={() => setShowPrivacyBanner(false)}
                  >
                    <X className="h-3 w-3" />
                  </Button>
                </div>
              </div>
              <div className="bg-gradient-to-r from-red-50 to-orange-50 border-b border-red-200 p-2">
                <div className="flex items-start gap-2">
                  <AlertCircle className="h-3.5 w-3.5 text-red-600 mt-0.5 flex-shrink-0" />
                  <div className="flex-1">
                    <p className="text-[10px] font-bold text-red-900 leading-tight">⚠️ Safety First</p>
                    <p className="text-[9px] text-red-700 leading-tight mt-0.5">
                      Use voice-to-text 🎤 for hands-free messaging while driving. Pull over if needed. Use responsibly and professionally.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}
          
          <ScrollArea className="flex-1 p-4">
            <div className="space-y-4">
              {activeMessages.map((msg) => {
                const isMe = msg.fromId === myId;
                return (
                  <div 
                    key={msg.id} 
                    className={`flex ${isMe ? 'justify-end' : 'justify-start'}`}
                  >
                    <div className={`max-w-[85%] rounded-xl p-3 shadow-sm ${
                      isMe
                        ? 'bg-blue-600 text-white rounded-br-none' 
                        : 'bg-white text-slate-800 border border-slate-100 rounded-bl-none'
                    }`}>
                      {!isMe && role === 'supervisor' && selectedDriver === 'all' && (
                        <div className="text-[10px] font-bold text-blue-600 mb-1">Driver {msg.fromId}</div>
                      )}
                      {msg.isOfficial && (
                        <Badge variant="outline" className="mb-1 text-[8px] bg-amber-100 text-amber-800 border-amber-300">
                          📋 Official
                        </Badge>
                      )}
                      <div className="text-sm">{msg.content}</div>
                      <div className={`text-[9px] mt-1 text-right ${isMe ? 'text-blue-200' : 'text-slate-400'}`}>
                        {formatTime(msg.timestamp)}
                      </div>
                    </div>
                  </div>
                );
              })}
              {activeMessages.length === 0 && (
                <div className="text-center text-slate-400 text-xs py-10">
                  No messages yet. Start the conversation!
                </div>
              )}
              <div ref={scrollRef} />
            </div>
          </ScrollArea>
          
          {/* Quick Replies for Supervisor */}
          {role === 'supervisor' && selectedDriver && selectedDriver !== 'all' && selectedDriver !== 'van_drivers' && showQuickReplies && (
            <div className="p-2 bg-amber-50 border-t border-amber-100">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-1">
                  <Zap className="h-3 w-3 text-amber-600" />
                  <span className="text-xs font-bold text-amber-900">Quick Messages</span>
                </div>
                <Button 
                  variant="ghost" 
                  size="sm" 
                  className="h-5 text-xs text-amber-600 hover:text-amber-900"
                  onClick={() => setShowQuickReplies(false)}
                >
                  Hide
                </Button>
              </div>
              <div className="grid grid-cols-2 gap-1 max-h-32 overflow-y-auto">
                {quickReplies.map((reply, idx) => (
                  <Button
                    key={idx}
                    variant="outline"
                    size="sm"
                    className="h-auto py-1.5 px-2 text-xs text-left justify-start border-amber-200 hover:bg-amber-100 hover:border-amber-300"
                    onClick={() => handleQuickReply(reply.text)}
                    data-testid={`quick-reply-${idx}`}
                  >
                    <span className="mr-1">{reply.icon}</span>
                    <span className="truncate">{reply.text}</span>
                  </Button>
                ))}
              </div>
            </div>
          )}

          <div className="p-3 bg-white border-t border-slate-100">
            {/* Official Message Toggle */}
            <div className="flex items-center gap-2 mb-2 pb-2 border-b border-slate-100">
              <Switch 
                id="official-toggle" 
                checked={isOfficial} 
                onCheckedChange={setIsOfficial}
                data-testid="toggle-official"
              />
              <Label htmlFor="official-toggle" className="text-xs cursor-pointer flex items-center gap-1">
                {isOfficial ? (
                  <>
                    <Shield className="h-3 w-3 text-amber-600" />
                    <span className="font-bold text-amber-900">Official Message</span>
                    <span className="text-amber-600">(Logged)</span>
                  </>
                ) : (
                  <>
                    <Lock className="h-3 w-3 text-green-600" />
                    <span className="font-bold text-green-900">Private</span>
                    <span className="text-green-600">(Not Stored)</span>
                  </>
                )}
              </Label>
            </div>
            
            <div className="flex gap-2">
              {role === 'supervisor' && !showQuickReplies && (
                <Button 
                  variant="outline" 
                  size="icon" 
                  className="h-10 w-10 border-amber-300 text-amber-600 hover:bg-amber-50"
                  onClick={() => setShowQuickReplies(true)}
                  data-testid="button-show-quick-replies"
                >
                  <Zap className="h-4 w-4" />
                </Button>
              )}
              <Button 
                variant="outline" 
                size="icon" 
                className={`h-10 w-10 ${isListening ? 'bg-red-100 border-red-500 text-red-600 animate-pulse' : 'border-slate-300 text-slate-600 hover:bg-slate-50'}`}
                onClick={handleVoiceInput}
                disabled={isListening}
                data-testid="button-voice-input"
              >
                {isListening ? <Mic className="h-4 w-4" /> : <Mic className="h-4 w-4" />}
              </Button>
              <Input 
                placeholder={role === 'supervisor' && selectedDriver === 'all' ? "Broadcast message..." : "Type a message..."}
                className="flex-1 text-sm bg-slate-50 border-slate-200"
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
                onKeyDown={handleKeyDown}
                data-testid="input-message"
              />
              <Button size="icon" className={`${isOfficial ? 'bg-amber-600 hover:bg-amber-700' : 'bg-blue-600 hover:bg-blue-700'}`} onClick={handleSend} disabled={sendMessageMutation.isPending}>
                <Send className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}