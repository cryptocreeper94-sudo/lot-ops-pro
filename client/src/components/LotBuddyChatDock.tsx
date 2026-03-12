import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Send, Mic, MicOff, X, MessageCircle, Settings, ExternalLink, Loader2 } from 'lucide-react';
import { useLotBuddy } from '@/contexts/LotBuddyContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
}

type MicPermissionState = 'prompt' | 'granted' | 'denied' | 'unsupported' | 'checking';

function getBrowserInfo(): { name: string; settingsUrl: string; instructions: string } {
  const ua = navigator.userAgent.toLowerCase();
  
  if (ua.includes('edg/')) {
    return {
      name: 'Edge',
      settingsUrl: 'edge://settings/content/microphone',
      instructions: 'Copy and paste this URL into a new tab, then allow microphone access for this site.'
    };
  } else if (ua.includes('chrome')) {
    return {
      name: 'Chrome',
      settingsUrl: 'chrome://settings/content/microphone',
      instructions: 'Copy and paste this URL into a new tab, then allow microphone access for this site.'
    };
  } else if (ua.includes('firefox')) {
    return {
      name: 'Firefox',
      settingsUrl: 'about:preferences#privacy',
      instructions: 'Go to Settings → Privacy & Security → Permissions → Microphone → Settings, and allow this site.'
    };
  } else if (ua.includes('safari') && !ua.includes('chrome')) {
    return {
      name: 'Safari',
      settingsUrl: '',
      instructions: 'Go to Safari → Settings → Websites → Microphone, and allow this site. On macOS, also check System Settings → Privacy & Security → Microphone.'
    };
  }
  
  return {
    name: 'your browser',
    settingsUrl: '',
    instructions: 'Go to your browser settings and enable microphone access for this site.'
  };
}

export function LotBuddyChatDock() {
  const {
    selectedAvatar,
    customName,
    isEnabled,
    talkToLotBuddy,
    isThinking,
    voiceRecognition,
    startListening,
    stopListening,
    onVoiceCommand,
    speak,
    voicePreferences
  } = useLotBuddy();
  
  const [isOpen, setIsOpen] = useState(false);
  const [inputValue, setInputValue] = useState('');
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [micPermission, setMicPermission] = useState<MicPermissionState>('checking');
  const [showMicHelp, setShowMicHelp] = useState(false);
  const [isListeningMode, setIsListeningMode] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  
  const buddyName = customName || selectedAvatar?.displayName || 'Lot Buddy';
  const browserInfo = getBrowserInfo();
  
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);
  
  useEffect(() => {
    const checkMicPermission = async () => {
      if (!voiceRecognition.isSupported) {
        setMicPermission('unsupported');
        return;
      }
      
      try {
        if (navigator.permissions) {
          const result = await navigator.permissions.query({ name: 'microphone' as PermissionName });
          setMicPermission(result.state as MicPermissionState);
          
          result.onchange = () => {
            setMicPermission(result.state as MicPermissionState);
          };
        } else {
          setMicPermission('prompt');
        }
      } catch {
        setMicPermission('prompt');
      }
    };
    
    checkMicPermission();
  }, [voiceRecognition.isSupported]);
  
  useEffect(() => {
    if (!isListeningMode) return;
    
    const unsubscribe = onVoiceCommand(async (command) => {
      setIsListeningMode(false);
      stopListening();
      
      const transcript = command.type === 'unknown' ? command.transcript : command.type.replace(/_/g, ' ');
      if (!transcript) return;
      
      const userMessage: ChatMessage = {
        id: `user-${Date.now()}`,
        role: 'user',
        content: transcript,
        timestamp: new Date()
      };
      setMessages(prev => [...prev, userMessage]);
      
      try {
        const response = await talkToLotBuddy(transcript);
        const assistantMessage: ChatMessage = {
          id: `assistant-${Date.now()}`,
          role: 'assistant',
          content: response,
          timestamp: new Date()
        };
        setMessages(prev => [...prev, assistantMessage]);
        
        if (voicePreferences.enabled) {
          speak(response);
        }
      } catch {
        const errorMessage: ChatMessage = {
          id: `assistant-${Date.now()}`,
          role: 'assistant',
          content: "Sorry, I couldn't process that. Please try again!",
          timestamp: new Date()
        };
        setMessages(prev => [...prev, errorMessage]);
      }
    });
    
    return unsubscribe;
  }, [isListeningMode, onVoiceCommand, stopListening, talkToLotBuddy, speak, voicePreferences.enabled]);
  
  const handleSend = async () => {
    const message = inputValue.trim();
    if (!message || isThinking) return;
    
    setInputValue('');
    
    const userMessage: ChatMessage = {
      id: `user-${Date.now()}`,
      role: 'user',
      content: message,
      timestamp: new Date()
    };
    setMessages(prev => [...prev, userMessage]);
    
    try {
      const response = await talkToLotBuddy(message);
      const assistantMessage: ChatMessage = {
        id: `assistant-${Date.now()}`,
        role: 'assistant',
        content: response,
        timestamp: new Date()
      };
      setMessages(prev => [...prev, assistantMessage]);
      
      if (voicePreferences.enabled) {
        speak(response);
      }
    } catch {
      const errorMessage: ChatMessage = {
        id: `assistant-${Date.now()}`,
        role: 'assistant',
        content: "Sorry, I couldn't process that. Please try again!",
        timestamp: new Date()
      };
      setMessages(prev => [...prev, errorMessage]);
    }
  };
  
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };
  
  const handleMicToggle = async () => {
    if (micPermission === 'unsupported') {
      setShowMicHelp(true);
      return;
    }
    
    if (isListeningMode) {
      setIsListeningMode(false);
      stopListening();
      return;
    }
    
    if (micPermission === 'denied') {
      setShowMicHelp(true);
      return;
    }
    
    if (micPermission === 'prompt') {
      try {
        await navigator.mediaDevices.getUserMedia({ audio: true });
        setMicPermission('granted');
      } catch {
        setMicPermission('denied');
        setShowMicHelp(true);
        return;
      }
    }
    
    setIsListeningMode(true);
    startListening();
  };
  
  if (!selectedAvatar || !isEnabled) return null;
  
  return (
    <div className="hidden xl:block fixed bottom-6 right-36 z-[9998]">
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            transition={{ type: 'spring', stiffness: 300, damping: 25 }}
            className="bg-white/95 backdrop-blur-sm border-2 border-slate-300 rounded-2xl shadow-2xl w-80 mb-3 overflow-hidden"
          >
            <div className="bg-gradient-to-r from-emerald-600 to-cyan-600 p-3 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <img
                  src={`/lotbuddy_catalog/${selectedAvatar.filename}`}
                  alt={buddyName}
                  className="h-8 w-8 rounded-full object-cover bg-white/20"
                />
                <span className="font-bold text-white text-sm">{buddyName}</span>
              </div>
              <button
                onClick={() => setIsOpen(false)}
                className="text-white/80 hover:text-white transition-colors"
                data-testid="button-close-chat-dock"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <div className="h-64 overflow-y-auto p-3 space-y-3 bg-gradient-to-b from-slate-50 to-white">
              {messages.length === 0 && (
                <div className="text-center text-slate-500 text-sm py-8">
                  <p className="mb-2">Say hi to {buddyName}!</p>
                  <p className="text-xs text-slate-400">Type a message or click the mic to speak</p>
                </div>
              )}
              
              {messages.map((msg) => (
                <div
                  key={msg.id}
                  className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                  <div
                    className={`max-w-[80%] rounded-2xl px-3 py-2 text-sm ${
                      msg.role === 'user'
                        ? 'bg-emerald-600 text-white rounded-br-sm'
                        : 'bg-slate-200 text-slate-800 rounded-bl-sm'
                    }`}
                    data-testid={`text-message-${msg.id}`}
                  >
                    {msg.content}
                  </div>
                </div>
              ))}
              
              {isThinking && (
                <div className="flex justify-start">
                  <div className="bg-slate-200 rounded-2xl rounded-bl-sm px-3 py-2 flex items-center gap-2">
                    <Loader2 className="w-4 h-4 animate-spin text-slate-500" />
                    <span className="text-sm text-slate-500">Thinking...</span>
                  </div>
                </div>
              )}
              
              {isListeningMode && voiceRecognition.isListening && (
                <div className="flex justify-center">
                  <motion.div
                    className="bg-green-100 border border-green-300 rounded-full px-4 py-2 flex items-center gap-2"
                    animate={{ scale: [1, 1.05, 1] }}
                    transition={{ repeat: Infinity, duration: 1.5 }}
                  >
                    <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
                    <span className="text-sm text-green-700 font-medium">Listening...</span>
                  </motion.div>
                </div>
              )}
              
              <div ref={messagesEndRef} />
            </div>
            
            <AnimatePresence>
              {showMicHelp && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: 'auto', opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  className="bg-amber-50 border-t border-amber-200 p-3 overflow-hidden"
                >
                  <div className="flex items-start gap-2">
                    <Settings className="w-4 h-4 text-amber-600 mt-0.5 flex-shrink-0" />
                    <div className="text-xs text-amber-800">
                      <p className="font-semibold mb-1">
                        {micPermission === 'unsupported' 
                          ? 'Voice input not supported'
                          : 'Microphone access needed'}
                      </p>
                      {micPermission === 'unsupported' ? (
                        <p>Your browser doesn't support voice input. Please use text instead.</p>
                      ) : (
                        <>
                          <p className="mb-2">{browserInfo.instructions}</p>
                          {browserInfo.settingsUrl && (
                            <div className="bg-white/80 rounded p-2 font-mono text-[10px] break-all border border-amber-200">
                              {browserInfo.settingsUrl}
                            </div>
                          )}
                        </>
                      )}
                      <button
                        onClick={() => setShowMicHelp(false)}
                        className="mt-2 text-amber-600 hover:text-amber-800 underline"
                        data-testid="button-dismiss-mic-help"
                      >
                        Got it
                      </button>
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
            
            <div className="p-3 border-t border-slate-200 bg-white">
              <div className="flex items-center gap-2">
                <Input
                  ref={inputRef}
                  value={inputValue}
                  onChange={(e) => setInputValue(e.target.value)}
                  onKeyDown={handleKeyDown}
                  placeholder={`Message ${buddyName}...`}
                  disabled={isThinking}
                  className="flex-1 text-sm"
                  data-testid="input-lotbuddy-message"
                />
                
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={handleMicToggle}
                  disabled={isThinking}
                  className={`relative ${
                    isListeningMode 
                      ? 'text-green-600 bg-green-100 hover:bg-green-200' 
                      : micPermission === 'denied' || micPermission === 'unsupported'
                        ? 'text-red-500 hover:text-red-600'
                        : 'text-slate-600 hover:text-slate-800'
                  }`}
                  data-testid="button-mic-toggle"
                >
                  {isListeningMode ? (
                    <motion.div
                      animate={{ scale: [1, 1.2, 1] }}
                      transition={{ repeat: Infinity, duration: 1 }}
                    >
                      <Mic className="w-5 h-5" />
                    </motion.div>
                  ) : micPermission === 'denied' || micPermission === 'unsupported' ? (
                    <MicOff className="w-5 h-5" />
                  ) : (
                    <Mic className="w-5 h-5" />
                  )}
                </Button>
                
                <Button
                  size="icon"
                  onClick={handleSend}
                  disabled={!inputValue.trim() || isThinking}
                  className="bg-emerald-600 hover:bg-emerald-700 text-white"
                  data-testid="button-send-lotbuddy"
                >
                  <Send className="w-4 h-4" />
                </Button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
      
      <motion.button
        onClick={() => {
          setIsOpen(!isOpen);
          if (!isOpen) {
            setTimeout(() => inputRef.current?.focus(), 100);
          }
        }}
        className={`flex items-center gap-2 px-4 py-2 rounded-full shadow-lg transition-all ${
          isOpen 
            ? 'bg-slate-600 hover:bg-slate-700 text-white' 
            : 'bg-gradient-to-r from-emerald-600 to-cyan-600 hover:from-emerald-700 hover:to-cyan-700 text-white'
        }`}
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        data-testid="button-open-chat-dock"
      >
        <MessageCircle className="w-5 h-5" />
        <span className="text-sm font-medium">
          {isOpen ? 'Close' : `Chat with ${buddyName}`}
        </span>
      </motion.button>
    </div>
  );
}

export default LotBuddyChatDock;
