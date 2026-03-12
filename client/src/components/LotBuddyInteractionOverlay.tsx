import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Send, ChevronDown, ChevronUp, Check, Users, Mic, MicOff } from 'lucide-react';
import { useLotBuddy } from '@/contexts/LotBuddyContext';
import { Button } from '@/components/ui/button';
import { useQuery } from '@tanstack/react-query';

interface Message {
  id: string;
  content: string;
  sender: 'user' | 'buddy';
  timestamp: Date;
}

interface AvailableUser {
  id: number;
  name: string;
  role: string;
  isOnline: boolean;
}

export function LotBuddyInteractionOverlay() {
  const {
    selectedAvatar,
    customName,
    interactionMode,
    closeInteractionOverlay,
    talkToLotBuddy,
    isThinking,
    voiceRecognition,
    startListening,
    stopListening,
    onVoiceCommand,
    speak
  } = useLotBuddy();

  const [messages, setMessages] = useState<Message[]>([]);
  const [inputValue, setInputValue] = useState('');
  const [selectedUsers, setSelectedUsers] = useState<number[]>([]);
  const [showInput, setShowInput] = useState(false);
  const [showRecipientPicker, setShowRecipientPicker] = useState(false);
  const [expandedCategory, setExpandedCategory] = useState<string | null>(null);
  const [isListeningMode, setIsListeningMode] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const buddyName = customName || selectedAvatar?.displayName || 'Lot Buddy';

  // Fetch available users (who's logged in today)
  const { data: availableUsers = [] } = useQuery<AvailableUser[]>({
    queryKey: ['/api/users/available'],
    queryFn: async () => {
      try {
        const res = await fetch('/api/users/available');
        if (!res.ok) return getMockUsers();
        return res.json();
      } catch {
        return getMockUsers();
      }
    },
    staleTime: 30000,
  });

  // Mock users for demo when API not available
  function getMockUsers(): AvailableUser[] {
    return [
      { id: 1, name: 'Mike Johnson', role: 'lotops_manager', isOnline: true },
      { id: 2, name: 'Sarah Williams', role: 'supervisor', isOnline: true },
      { id: 3, name: 'Tom Davis', role: 'supervisor', isOnline: true },
      { id: 4, name: 'James Wilson', role: 'van_driver', isOnline: true },
      { id: 5, name: 'Robert Brown', role: 'van_driver', isOnline: true },
      { id: 6, name: 'Chris Martinez', role: 'van_driver', isOnline: true },
      { id: 7, name: 'David Lee', role: 'inventory_driver', isOnline: true },
      { id: 8, name: 'Kevin Garcia', role: 'inventory_driver', isOnline: true },
      { id: 9, name: 'Brian Taylor', role: 'service_driver', isOnline: true },
    ];
  }

  const categories = [
    { id: 'team', name: 'Team (All On Duty)', roles: ['supervisor', 'van_driver', 'inventory_driver'] },
    { id: 'lotops_manager', name: 'Lot Ops Manager', roles: ['lotops_manager'] },
    { id: 'supervisors', name: 'Supervisors', roles: ['supervisor'] },
    { id: 'van_drivers', name: 'Van Drivers', roles: ['van_driver'] },
    { id: 'inventory_drivers', name: 'Inventory Drivers', roles: ['inventory_driver'] },
    { id: 'service_drivers', name: 'Service Truck Drivers', roles: ['service_driver'] }
  ];

  const getUsersByCategory = (categoryId: string) => {
    const category = categories.find(c => c.id === categoryId);
    if (!category) return [];
    return availableUsers.filter(u => category.roles.includes(u.role) && u.isOnline);
  };

  const toggleUser = (userId: number) => {
    setSelectedUsers(prev => 
      prev.includes(userId) 
        ? prev.filter(id => id !== userId)
        : [...prev, userId]
    );
  };

  const selectAllInCategory = (categoryId: string) => {
    const users = getUsersByCategory(categoryId);
    const userIds = users.map(u => u.id);
    const allSelected = userIds.every(id => selectedUsers.includes(id));
    
    if (allSelected) {
      setSelectedUsers(prev => prev.filter(id => !userIds.includes(id)));
    } else {
      setSelectedUsers(prev => Array.from(new Set([...prev, ...userIds])));
    }
  };

  const getSelectedNames = () => {
    const names = availableUsers
      .filter(u => selectedUsers.includes(u.id))
      .map(u => u.name.split(' ')[0]);
    if (names.length === 0) return 'Select recipients';
    if (names.length <= 2) return names.join(', ');
    return `${names.slice(0, 2).join(', ')} +${names.length - 2} more`;
  };

  useEffect(() => {
    if (interactionMode) {
      const welcomeMessage = interactionMode === 'ai' 
        ? `Hey there! I'm your AI assistant. Tap the mic to speak or tap to type!`
        : `Messages are monitored. Keep communications professional.\n\nSelect who you want to message, then tap to type.`;
      
      setMessages([{
        id: 'welcome',
        content: welcomeMessage,
        sender: 'buddy',
        timestamp: new Date()
      }]);
      setShowInput(false);
      setSelectedUsers([]);
      setShowRecipientPicker(false);
    }
  }, [interactionMode]);

  // Handle voice recognition results
  useEffect(() => {
    if (!isListeningMode || !interactionMode) return;
    
    const unsubscribe = onVoiceCommand(async (command) => {
      setIsListeningMode(false);
      stopListening();
      
      const transcript = command.type === 'unknown' 
        ? (command as any).transcript 
        : command.type.replace(/_/g, ' ');
      if (!transcript) return;
      
      // Add user message
      const userMessage: Message = {
        id: `user-${Date.now()}`,
        content: transcript,
        sender: 'user',
        timestamp: new Date()
      };
      setMessages(prev => [...prev, userMessage]);
      
      if (interactionMode === 'ai') {
        const response = await talkToLotBuddy(transcript);
        setMessages(prev => [...prev, {
          id: `buddy-${Date.now()}`,
          content: response,
          sender: 'buddy',
          timestamp: new Date()
        }]);
        speak(response);
      }
    });
    
    return unsubscribe;
  }, [isListeningMode, interactionMode, onVoiceCommand, stopListening, talkToLotBuddy, speak]);

  const handleMicToggle = async () => {
    if (!voiceRecognition.isSupported) {
      speak("Voice input is not supported in this browser. Please type your message instead.");
      return;
    }
    
    if (isListeningMode) {
      setIsListeningMode(false);
      stopListening();
      return;
    }
    
    // Request microphone permission
    try {
      await navigator.mediaDevices.getUserMedia({ audio: true });
    } catch {
      speak("Please allow microphone access to use voice input.");
      return;
    }
    
    setShowInput(true);
    setIsListeningMode(true);
    startListening();
  };

  const handleSendMessage = async () => {
    if (!inputValue.trim()) return;
    if (interactionMode === 'messaging' && selectedUsers.length === 0) return;

    const userMessage: Message = {
      id: `user-${Date.now()}`,
      content: inputValue.trim(),
      sender: 'user',
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    const currentInput = inputValue.trim();
    setInputValue('');

    if (interactionMode === 'ai') {
      const response = await talkToLotBuddy(currentInput);
      setMessages(prev => [...prev, {
        id: `buddy-${Date.now()}`,
        content: response,
        sender: 'buddy',
        timestamp: new Date()
      }]);
    } else {
      const recipientNames = availableUsers
        .filter(u => selectedUsers.includes(u.id))
        .map(u => u.name.split(' ')[0])
        .join(', ');
      
      setMessages(prev => [...prev, {
        id: `buddy-${Date.now()}`,
        content: `Message sent to ${recipientNames}!`,
        sender: 'buddy',
        timestamp: new Date()
      }]);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const handleBubbleTap = () => {
    if (interactionMode === 'messaging' && !showRecipientPicker && selectedUsers.length === 0) {
      setShowRecipientPicker(true);
    } else {
      setShowInput(true);
      setShowRecipientPicker(false);
      setTimeout(() => inputRef.current?.focus(), 100);
    }
  };

  const latestBuddyMessage = [...messages].reverse().find(m => m.sender === 'buddy');

  if (!interactionMode || !selectedAvatar) return null;

  const isAI = interactionMode === 'ai';
  const bubbleColor = isAI 
    ? 'linear-gradient(135deg, #10b981 0%, #059669 100%)'
    : 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)';

  return (
    <AnimatePresence>
      <div
        className="fixed inset-0 z-[10000] pointer-events-none"
        data-testid="interaction-overlay"
      >
        <motion.div
          className="absolute bottom-0 left-0 right-0 flex flex-col items-center pointer-events-auto"
          initial={{ opacity: 0, x: 200, y: 100 }}
          animate={{ opacity: 1, x: 0, y: 0 }}
          exit={{ opacity: 0, x: 200, y: 100 }}
          transition={{ 
            type: 'spring', 
            stiffness: 120, 
            damping: 18,
            duration: 0.6 
          }}
        >
          <motion.div
            className="relative z-20 px-4 mb-2 w-full max-w-sm"
            initial={{ opacity: 0, y: -20, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            transition={{ delay: 0.3, type: 'spring', stiffness: 200, damping: 20 }}
          >
            {interactionMode === 'messaging' && (
              <motion.div 
                className="flex justify-center mb-2"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.5 }}
              >
                <button
                  onClick={() => setShowRecipientPicker(!showRecipientPicker)}
                  className="flex items-center gap-2 bg-black/40 backdrop-blur-sm rounded-full px-4 py-2 border border-white/20"
                  data-testid="button-recipient-picker"
                >
                  <Users className="h-4 w-4 text-white/70" />
                  <span className="text-white text-sm font-medium">{getSelectedNames()}</span>
                  {showRecipientPicker ? (
                    <ChevronUp className="h-4 w-4 text-white/70" />
                  ) : (
                    <ChevronDown className="h-4 w-4 text-white/70" />
                  )}
                </button>
              </motion.div>
            )}

            <AnimatePresence>
              {showRecipientPicker && interactionMode === 'messaging' && (
                <motion.div
                  className="mb-2 bg-slate-900/95 backdrop-blur-sm rounded-xl border border-white/20 overflow-hidden max-h-[35vh] overflow-y-auto"
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                >
                  {categories.map(category => {
                    const users = getUsersByCategory(category.id);
                    const allSelected = users.length > 0 && users.every(u => selectedUsers.includes(u.id));
                    const someSelected = users.some(u => selectedUsers.includes(u.id));
                    
                    return (
                      <div key={category.id} className="border-b border-white/10 last:border-b-0">
                        <button
                          className="w-full flex items-center justify-between px-3 py-2 hover:bg-white/5"
                          onClick={() => setExpandedCategory(expandedCategory === category.id ? null : category.id)}
                          data-testid={`button-category-${category.id}`}
                        >
                          <div className="flex items-center gap-2">
                            <button
                              onClick={(e) => { e.stopPropagation(); selectAllInCategory(category.id); }}
                              className={`w-4 h-4 rounded flex items-center justify-center border ${
                                allSelected ? 'bg-emerald-500 border-emerald-500' : 
                                someSelected ? 'bg-emerald-500/50 border-emerald-500' : 'border-white/30'
                              }`}
                              data-testid={`checkbox-category-${category.id}`}
                            >
                              {(allSelected || someSelected) && <Check className="h-2.5 w-2.5 text-white" />}
                            </button>
                            <span className="text-white font-medium text-sm">{category.name}</span>
                            <span className="text-white/50 text-xs">({users.length})</span>
                          </div>
                          {expandedCategory === category.id ? (
                            <ChevronUp className="h-4 w-4 text-white/50" />
                          ) : (
                            <ChevronDown className="h-4 w-4 text-white/50" />
                          )}
                        </button>
                        
                        <AnimatePresence>
                          {expandedCategory === category.id && (
                            <motion.div
                              initial={{ height: 0 }}
                              animate={{ height: 'auto' }}
                              exit={{ height: 0 }}
                              className="overflow-hidden bg-white/5"
                            >
                              {users.map(user => (
                                <button
                                  key={user.id}
                                  onClick={() => toggleUser(user.id)}
                                  className="w-full flex items-center gap-2 px-3 py-1.5 pl-9 hover:bg-white/5"
                                  data-testid={`button-user-${user.id}`}
                                >
                                  <div className={`w-4 h-4 rounded flex items-center justify-center border ${
                                    selectedUsers.includes(user.id) ? 'bg-emerald-500 border-emerald-500' : 'border-white/30'
                                  }`}>
                                    {selectedUsers.includes(user.id) && <Check className="h-2.5 w-2.5 text-white" />}
                                  </div>
                                  <span className="text-white/90 text-sm">{user.name}</span>
                                  <span className="ml-auto w-1.5 h-1.5 rounded-full bg-emerald-400" />
                                </button>
                              ))}
                              {users.length === 0 && (
                                <div className="px-3 py-1.5 pl-9 text-white/50 text-xs">
                                  No one available
                                </div>
                              )}
                            </motion.div>
                          )}
                        </AnimatePresence>
                      </div>
                    );
                  })}
                  
                  {selectedUsers.length > 0 && (
                    <div className="p-2 bg-emerald-600/20 border-t border-emerald-500/30">
                      <Button
                        size="sm"
                        onClick={() => { setShowRecipientPicker(false); setShowInput(true); setTimeout(() => inputRef.current?.focus(), 100); }}
                        className="w-full bg-emerald-500 hover:bg-emerald-600 text-white text-sm"
                        data-testid="button-confirm-recipients"
                      >
                        Message {selectedUsers.length} {selectedUsers.length === 1 ? 'person' : 'people'}
                      </Button>
                    </div>
                  )}
                </motion.div>
              )}
            </AnimatePresence>

            <motion.div
              className="relative"
            >
              <div 
                className="relative rounded-3xl px-5 py-4 shadow-2xl cursor-pointer overflow-hidden"
                onClick={handleBubbleTap}
                style={{
                  background: 'white',
                  border: isAI ? '3px solid #10b981' : '3px solid #84cc16',
                  boxShadow: isAI 
                    ? '0 15px 50px rgba(16, 185, 129, 0.3), 0 0 20px rgba(16, 185, 129, 0.2)' 
                    : '0 15px 50px rgba(132, 204, 22, 0.3), 0 0 20px rgba(132, 204, 22, 0.2)'
                }}
              >
                <button
                  onClick={(e) => { e.stopPropagation(); closeInteractionOverlay(); }}
                  className="absolute top-2 right-2 w-7 h-7 flex items-center justify-center rounded-full bg-slate-100 hover:bg-slate-200 transition-colors"
                  data-testid="button-close-overlay"
                >
                  <X className="h-4 w-4 text-slate-600" />
                </button>
                
                {isThinking ? (
                  <div className="flex items-center justify-center gap-2 py-2">
                    <motion.span 
                      className="w-3 h-3 bg-emerald-500 rounded-full"
                      animate={{ y: [0, -8, 0] }}
                      transition={{ duration: 0.6, repeat: Infinity, delay: 0 }}
                    />
                    <motion.span 
                      className="w-3 h-3 bg-emerald-500 rounded-full"
                      animate={{ y: [0, -8, 0] }}
                      transition={{ duration: 0.6, repeat: Infinity, delay: 0.15 }}
                    />
                    <motion.span 
                      className="w-3 h-3 bg-emerald-500 rounded-full"
                      animate={{ y: [0, -8, 0] }}
                      transition={{ duration: 0.6, repeat: Infinity, delay: 0.3 }}
                    />
                  </div>
                ) : (
                  <p className="text-base font-medium text-center leading-relaxed whitespace-pre-line pr-6 text-slate-800">
                    {latestBuddyMessage?.content}
                  </p>
                )}

                {/* Quick Voice Button - Always visible in AI mode for hands-free operation */}
                {isAI && !showInput && (
                  <motion.div 
                    className="mt-3 flex justify-center"
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: 0.4 }}
                  >
                    <Button
                      size="icon"
                      onClick={(e) => { e.stopPropagation(); handleMicToggle(); }}
                      className={`h-14 w-14 rounded-full shadow-lg transition-all ${
                        isListeningMode 
                          ? 'bg-red-500 hover:bg-red-600 animate-pulse' 
                          : 'bg-emerald-500 hover:bg-emerald-600'
                      } text-white`}
                      data-testid="button-quick-voice"
                    >
                      {isListeningMode ? (
                        <MicOff className="h-6 w-6" />
                      ) : (
                        <Mic className="h-6 w-6" />
                      )}
                    </Button>
                    {isListeningMode && (
                      <motion.span 
                        className="absolute -bottom-6 text-xs text-emerald-600 font-medium"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: [0.5, 1, 0.5] }}
                        transition={{ duration: 1.5, repeat: Infinity }}
                      >
                        Listening...
                      </motion.span>
                    )}
                  </motion.div>
                )}

                {showInput && (
                  <motion.div 
                    className="mt-3 flex gap-2 w-full"
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                  >
                    {isAI && (
                      <Button
                        size="icon"
                        onClick={(e) => { e.stopPropagation(); handleMicToggle(); }}
                        className={`h-12 w-12 rounded-full shrink-0 shadow-lg transition-all ${
                          isListeningMode 
                            ? 'bg-red-500 hover:bg-red-600 animate-pulse' 
                            : 'bg-emerald-500 hover:bg-emerald-600'
                        } text-white`}
                        data-testid="button-voice-input"
                      >
                        {isListeningMode ? (
                          <MicOff className="h-5 w-5" />
                        ) : (
                          <Mic className="h-5 w-5" />
                        )}
                      </Button>
                    )}
                    <input
                      ref={inputRef}
                      type="text"
                      value={isListeningMode ? 'Listening...' : inputValue}
                      onChange={(e) => setInputValue(e.target.value)}
                      onKeyDown={handleKeyDown}
                      placeholder={isAI ? 'Ask me anything...' : 'Type your message...'}
                      className="flex-1 min-w-0 bg-white border border-slate-300 rounded-full px-4 py-3 text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-slate-400 shadow-inner"
                      disabled={isListeningMode}
                      data-testid="input-message"
                    />
                    <Button
                      size="icon"
                      onClick={handleSendMessage}
                      disabled={!inputValue.trim() || isThinking || isListeningMode || (interactionMode === 'messaging' && selectedUsers.length === 0)}
                      className="bg-slate-800 text-white hover:bg-slate-700 h-12 w-12 rounded-full shrink-0 shadow-lg"
                      data-testid="button-send-message"
                    >
                      <Send className="h-5 w-5" />
                    </Button>
                  </motion.div>
                )}
              </div>
              
              <div 
                className="absolute -bottom-5 left-1/2 -translate-x-1/2"
                style={{ width: '40px', height: '25px' }}
              >
                <div 
                  className="absolute w-0 h-0"
                  style={{
                    borderLeft: '20px solid transparent',
                    borderRight: '20px solid transparent',
                    borderTop: isAI ? '25px solid #10b981' : '25px solid #84cc16'
                  }}
                />
                <div 
                  className="absolute w-0 h-0"
                  style={{
                    top: '0px',
                    left: '3px',
                    borderLeft: '17px solid transparent',
                    borderRight: '17px solid transparent',
                    borderTop: '22px solid white'
                  }}
                />
              </div>
            </motion.div>
          </motion.div>

          <motion.div
            className="relative z-10"
            animate={{ 
              y: [0, -6, 0],
            }}
            transition={{ 
              duration: 3, 
              repeat: Infinity, 
              ease: 'easeInOut' 
            }}
          >
            <img
              src={`/lotbuddy_catalog/${selectedAvatar.filename}`}
              alt={buddyName}
              className={`w-auto object-contain ${isAI ? 'h-[35vh] max-h-[300px]' : 'h-[28vh] max-h-[220px]'}`}
              style={{ 
                filter: 'drop-shadow(0 15px 35px rgba(0,0,0,0.5))'
              }}
              data-testid="avatar-large"
            />
            
            {customName && (
              <motion.div
                className="absolute -bottom-2 left-1/2 -translate-x-1/2 px-4 py-1 rounded-full text-sm font-bold"
                style={{
                  background: bubbleColor,
                  color: 'white',
                  boxShadow: `0 4px 15px ${isAI ? 'rgba(16, 185, 129, 0.4)' : 'rgba(245, 158, 11, 0.4)'}`
                }}
                initial={{ opacity: 0, scale: 0 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.5, type: 'spring' }}
              >
                {buddyName}
              </motion.div>
            )}
          </motion.div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}

export default LotBuddyInteractionOverlay;
