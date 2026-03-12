import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X } from 'lucide-react';
import { useLotBuddy } from '@/contexts/LotBuddyContext';

export function LotBuddyAvatarPopup() {
  const { popupState, hidePopup, selectedAvatar, isEnabled, recordInteraction, displayMode, activeSurface, closeBuddySurface } = useLotBuddy();
  
  // Don't render character here if the mascot is already expanded (LotBuddyAvatarButton shows it)
  const showCharacter = displayMode === 'minimized';
  
  const handleDismiss = () => {
    recordInteraction('dismissed');
    closeBuddySurface();
  };
  
  const handleInteract = () => {
    recordInteraction('positive');
    closeBuddySurface();
  };
  
  if (!isEnabled || !selectedAvatar) return null;
  
  const isLeft = popupState.direction === 'left';
  
  const containerVariants = {
    hidden: {
      x: isLeft ? -300 : 300,
      opacity: 0,
    },
    visible: {
      x: 0,
      opacity: 1,
      transition: {
        type: 'spring' as const,
        stiffness: 120,
        damping: 18,
        staggerChildren: 0.2,
        duration: 0.8
      }
    },
    exit: {
      x: isLeft ? 300 : -300,
      opacity: 0,
      transition: {
        duration: 0.6,
        ease: 'easeInOut' as const
      }
    }
  };
  
  const bubbleVariants = {
    hidden: { scale: 0.5, opacity: 0, y: 20 },
    visible: { 
      scale: 1, 
      opacity: 1, 
      y: 0,
      transition: {
        type: 'spring' as const,
        stiffness: 150,
        damping: 15,
        delay: 0.3,
        duration: 0.6
      }
    }
  };
  
  const characterVariants = {
    hidden: { y: 80, opacity: 0, scale: 0.7 },
    visible: { 
      y: 0, 
      opacity: 1, 
      scale: 1,
      transition: {
        type: 'spring' as const,
        stiffness: 100,
        damping: 12,
        duration: 0.8
      }
    }
  };

  const floatAnimation = {
    y: [0, -8, 0],
    transition: {
      duration: 3,
      repeat: Infinity,
      ease: 'easeInOut' as const
    }
  };

  return (
    <AnimatePresence mode="wait">
      {popupState.isVisible && activeSurface === 'popup' && (
        <motion.div
          key="lotbuddy-avatar-popup"
          className={`fixed bottom-6 z-[10100] flex flex-col items-center pointer-events-auto ${
            isLeft ? 'left-2' : 'right-2'
          }`}
          style={{ maxWidth: 'calc(100vw - 16px)' }}
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          exit="exit"
          onClick={handleInteract}
        >
          {/* Speech Bubble */}
          <motion.div
            className="relative mb-4"
            variants={bubbleVariants}
          >
            <div className="relative bg-gradient-to-b from-white to-slate-50 border-[4px] border-slate-800 rounded-[50%_50%_50%_50%/40%_40%_60%_60%] px-8 py-5 max-w-[380px] min-w-[220px] shadow-[6px_6px_0_#1e293b,0_12px_35px_rgba(0,0,0,0.3)]">
              {/* Close button */}
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  handleDismiss();
                }}
                className="absolute -top-3 -right-3 w-8 h-8 bg-slate-800 hover:bg-slate-700 rounded-full flex items-center justify-center transition-colors"
                data-testid="button-close-avatar-popup"
              >
                <X className="w-4 h-4 text-white" />
              </button>
              
              {/* Title */}
              {popupState.title && (
                <div className="text-base font-black text-slate-800 mb-3 text-center uppercase tracking-wide">
                  {popupState.title}
                </div>
              )}
              
              {/* Message */}
              <div className="text-base text-slate-700 leading-relaxed text-center font-medium">
                {popupState.message}
              </div>
              
              {/* Tail */}
              <div 
                className={`absolute -bottom-[24px] w-7 h-7 bg-gradient-to-b from-white to-slate-50 border-r-[4px] border-b-[4px] border-slate-800 transform rotate-45 skew-x-[15deg] skew-y-[15deg] shadow-[4px_4px_0_#1e293b] ${
                  isLeft ? 'left-10' : 'right-10'
                }`}
              />
              
              {/* Cover the tail junction */}
              <div className="absolute bottom-0 left-6 right-6 h-4 bg-slate-50" />
            </div>
          </motion.div>
          
          {/* Character Image - Only show when mascot is minimized (not expanded) */}
          {showCharacter && (
            <motion.div
              variants={characterVariants}
              animate={floatAnimation}
              className="relative"
            >
              <img
                src={`/lotbuddy_catalog/${selectedAvatar.filename}`}
                alt={selectedAvatar.displayName}
                className="h-64 sm:h-72 md:h-80 lg:h-96 w-auto object-contain drop-shadow-[0_12px_40px_rgba(0,0,0,0.5)] cursor-pointer hover:scale-105 transition-transform duration-200"
                onError={(e) => {
                  (e.target as HTMLImageElement).style.display = 'none';
                }}
              />
              
              {/* Glow effect behind character */}
              <div className="absolute inset-0 -z-10 bg-gradient-to-t from-emerald-500/30 to-transparent blur-2xl rounded-full" />
            </motion.div>
          )}
        </motion.div>
      )}
    </AnimatePresence>
  );
}

// Floating button to toggle LotBuddy or show quick tips
export function LotBuddyAvatarButton() {
  const { 
    selectedAvatar, 
    customName, 
    isEnabled, 
    setIsEnabled, 
    showPopup, 
    getPersonalizedMessage, 
    recordInteraction,
    startListening,
    stopListening,
    voiceRecognition,
    speak,
    onVoiceCommand,
    talkToLotBuddy,
    isThinking,
    displayMode,
    setDisplayMode,
    visibilityPreference,
    expandMascot,
    minimizeMascot
  } = useLotBuddy();
  const [showHandsFreeAck, setShowHandsFreeAck] = useState(false);
  const [hasAcknowledgedToday, setHasAcknowledgedToday] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isListeningMode, setIsListeningMode] = useState(false);
  const [showFirstLoginIntro, setShowFirstLoginIntro] = useState(false);

  // First login intro disabled - was causing multiple buddy characters to appear
  // The buddy starts minimized as a car button and users can tap to expand
  useEffect(() => {
    if (!selectedAvatar || !isEnabled) return;
    
    const hasSeenIntro = localStorage.getItem('pixar_buddy_intro_seen');
    if (!hasSeenIntro) {
      // Just mark as seen without the animated intro
      localStorage.setItem('pixar_buddy_intro_seen', 'true');
    }
  }, [selectedAvatar, isEnabled]);
  
  // Check if user has already acknowledged today and show dialog if driver
  useEffect(() => {
    const checkAcknowledgment = async () => {
      try {
        const userStr = localStorage.getItem('vanops_user');
        if (!userStr) return;
        
        const user = JSON.parse(userStr);
        // Only require acknowledgment for drivers
        if (user.role !== 'driver') {
          setHasAcknowledgedToday(true);
          return;
        }
        
        const driverNumber = user.pin || localStorage.getItem('vanops_pin') || '';
        if (!driverNumber) return;
        
        const res = await fetch(`/api/driver-acknowledgments/check/${driverNumber}/hands_free`);
        if (res.ok) {
          const data = await res.json();
          setHasAcknowledgedToday(data.acknowledged);
          if (!data.acknowledged) {
            setShowHandsFreeAck(true);
          }
        }
      } catch (err) {
        console.error('Error checking acknowledgment:', err);
      }
    };
    
    if (isEnabled) {
      checkAcknowledgment();
    }
  }, [isEnabled]);
  
  // Handle hands-free acknowledgment
  const handleAcknowledge = async () => {
    setIsSubmitting(true);
    try {
      const userStr = localStorage.getItem('vanops_user');
      if (!userStr) {
        setShowHandsFreeAck(false);
        setHasAcknowledgedToday(true);
        return;
      }
      
      const user = JSON.parse(userStr);
      const driverNumber = user.pin || localStorage.getItem('vanops_pin') || '';
      
      await fetch('/api/driver-acknowledgments', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          driverNumber,
          driverName: user.name || 'Unknown Driver',
          ackType: 'hands_free',
          ackMessageVersion: '1.0',
          recordSource: 'driver_app'
        })
      });
      
      setHasAcknowledgedToday(true);
      setShowHandsFreeAck(false);
      recordInteraction('positive');
    } catch (err) {
      console.error('Error creating acknowledgment:', err);
      // Still close on error to not block the user
      setShowHandsFreeAck(false);
      setHasAcknowledgedToday(true);
    } finally {
      setIsSubmitting(false);
    }
  };
  
  // Handle voice commands when listening
  useEffect(() => {
    if (!isListeningMode) return;
    
    const unsubscribe = onVoiceCommand(async (command) => {
      setIsListeningMode(false);
      stopListening();
      
      if (command.type === 'unknown' && command.transcript) {
        // Natural language - send to AI
        showPopup("Thinking...", buddyName, 2000);
        try {
          const response = await talkToLotBuddy(command.transcript);
          showPopup(response, buddyName, 6000);
          speak(response);
        } catch {
          showPopup("Sorry, I couldn't understand that. Try again!", buddyName, 4000);
        }
      } else {
        // Known command - provide feedback
        const responses: Record<string, string> = {
          'help': "You can ask me anything! Try: 'What's my quota?', 'Where should I go?', or just chat with me!",
          'current_quota': "Let me check your quota status...",
          'next_pickup': "Checking your next assignment...",
          'where_am_i': "Looking up your location...",
          'status': "Getting your current status...",
        };
        const response = responses[command.type] || "Got it!";
        showPopup(response, buddyName, 4000);
        speak(response);
      }
      recordInteraction('positive');
    });
    
    return unsubscribe;
  }, [isListeningMode, onVoiceCommand, talkToLotBuddy, speak, showPopup, stopListening, recordInteraction]);
  
  // Show listening feedback
  useEffect(() => {
    if (voiceRecognition.isListening && isListeningMode) {
      showPopup("I'm listening... speak now!", buddyName, 10000);
    }
  }, [voiceRecognition.isListening, isListeningMode]);
  
  if (!selectedAvatar) return null;
  
  const buddyName = customName || selectedAvatar.displayName;
  
  const handleClick = async () => {
    if (showHandsFreeAck) return;
    
    if (!isEnabled) {
      setIsEnabled(true);
      recordInteraction('positive');
      return;
    }
    
    if (displayMode === 'minimized') {
      expandMascot();
      recordInteraction('positive');
      return;
    }
    
    if (displayMode === 'visible') {
      setDisplayMode('speaking');
      if (voiceRecognition.isSupported) {
        setIsListeningMode(true);
        startListening();
      } else {
        const greeting = await getPersonalizedMessage('greeting');
        showPopup(greeting, buddyName, 4000);
      }
      recordInteraction('positive');
      return;
    }
    
    if (displayMode === 'speaking' || isListeningMode) {
      setIsListeningMode(false);
      stopListening();
      showPopup("Okay, talk to you later!", buddyName, 3000);
      if (visibilityPreference === 'minimize_to_tile') {
        setTimeout(() => minimizeMascot(), 3000);
      } else {
        setDisplayMode('visible');
      }
      return;
    }
  };

  const handleMinimize = () => {
    if (visibilityPreference !== 'always_visible') {
      minimizeMascot();
    }
  };
  
  return (
    <div className="fixed bottom-4 right-4 z-[9999] flex flex-col items-end gap-2">
      {/* Hands-Free Acknowledgment Dialog - Stays until acknowledged */}
      <AnimatePresence>
        {showHandsFreeAck && isEnabled && !hasAcknowledgedToday && (
          <motion.div
            initial={{ opacity: 0, scale: 0.8, y: 10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.8, y: 10 }}
            transition={{ type: 'spring', stiffness: 300, damping: 25 }}
            className="relative"
          >
            <div className="relative bg-gradient-to-br from-blue-50 via-white to-cyan-50 border-[3px] border-slate-800 rounded-2xl px-4 py-3 max-w-[260px] shadow-[4px_4px_0_#1e293b,0_8px_20px_rgba(0,0,0,0.25)]">
              {/* Title - Only show if custom name is set */}
              {customName && (
                <div className="text-xs font-black text-blue-700 mb-1 uppercase tracking-wide">
                  {customName}
                </div>
              )}
              
              {/* Safety Badge */}
              <div className="flex items-center gap-1 mb-2">
                <span className="text-lg">🎧</span>
                <span className="text-[10px] font-bold text-blue-600 uppercase tracking-wider">Hands-Free Facility</span>
              </div>
              
              {/* Message */}
              <div className="text-sm text-slate-700 leading-snug font-medium mb-3">
                This is a hands-free facility. I can assist you with voice commands while you work safely. Please acknowledge to continue.
              </div>
              
              {/* Acknowledge Button */}
              <button
                onClick={handleAcknowledge}
                disabled={isSubmitting}
                className="w-full bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700 text-white font-bold py-2 px-4 rounded-lg shadow-lg transition-all duration-200 flex items-center justify-center gap-2 disabled:opacity-50"
                data-testid="button-acknowledge-handsfree"
              >
                {isSubmitting ? (
                  <span className="animate-spin">⏳</span>
                ) : (
                  <>
                    <span>✓</span>
                    <span>I Acknowledge</span>
                  </>
                )}
              </button>
              
              {/* Premium sparkle accent */}
              <div className="absolute -top-1 -left-1 w-3 h-3 text-blue-400">🔊</div>
            </div>
            
            {/* Tail pointing down-right to avatar */}
            <div className="absolute -bottom-3 right-6 w-4 h-4 bg-gradient-to-br from-white to-cyan-50 border-r-[3px] border-b-[3px] border-slate-800 transform rotate-45 shadow-[2px_2px_0_#1e293b]" />
          </motion.div>
        )}
      </AnimatePresence>
      
      <AnimatePresence mode="wait">
        {displayMode === 'minimized' ? (
          <motion.button
            key="minimized-car"
            onClick={handleClick}
            className="relative"
            whileHover={{ scale: 1.15, y: -3 }}
            whileTap={{ scale: 0.95 }}
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0, opacity: 0 }}
            transition={{ type: 'spring', stiffness: 300, damping: 20 }}
            data-testid="button-lotbuddy-car"
            style={{ filter: 'drop-shadow(0 4px 12px rgba(16, 185, 129, 0.5))' }}
          >
            <img
              src="/lotbuddy_car_button.png"
              alt="Lot Buddy"
              className="h-12 w-auto object-contain"
            />
            <motion.div
              className="absolute inset-0 bg-emerald-400/30 rounded-full blur-xl -z-10"
              animate={{ opacity: [0.3, 0.6, 0.3], scale: [0.9, 1.1, 0.9] }}
              transition={{ repeat: Infinity, duration: 2 }}
            />
          </motion.button>
        ) : (
          <motion.div
            key="expanded-avatar"
            className="relative"
            initial={{ scale: 0.5, opacity: 0, y: 50 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.5, opacity: 0, y: 50 }}
            transition={{ type: 'spring', stiffness: 200, damping: 20 }}
          >
            {visibilityPreference === 'minimize_to_tile' && (
              <button
                onClick={handleMinimize}
                className="absolute -top-2 -left-2 w-6 h-6 bg-slate-700 hover:bg-slate-600 rounded-full flex items-center justify-center text-white text-xs z-10 shadow-md"
                data-testid="button-minimize-buddy"
              >
                ✕
              </button>
            )}
            
            <motion.button
              onClick={handleClick}
              className="transition-all duration-300 relative"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              data-testid="button-lotbuddy-avatar"
            >
              {isListeningMode && voiceRecognition.isListening && (
                <motion.div
                  className="absolute inset-0 rounded-full border-4 border-green-400"
                  animate={{ 
                    scale: [1, 1.2, 1],
                    opacity: [1, 0.5, 1]
                  }}
                  transition={{ 
                    repeat: Infinity, 
                    duration: 1.5,
                    ease: "easeInOut"
                  }}
                />
              )}
              
              {isThinking && (
                <motion.div
                  className="absolute -top-2 -right-2 bg-purple-500 text-white text-xs font-bold px-2 py-1 rounded-full"
                  animate={{ scale: [1, 1.1, 1] }}
                  transition={{ repeat: Infinity, duration: 0.8 }}
                >
                  ...
                </motion.div>
              )}
              
              {(displayMode === 'speaking' || isListeningMode) && (
                <motion.div
                  className="absolute -top-2 -right-2 bg-green-500 text-white text-xs font-bold px-2 py-1 rounded-full flex items-center gap-1"
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  exit={{ scale: 0 }}
                >
                  <span>🎤</span>
                </motion.div>
              )}
              
              <img
                src={`/lotbuddy_catalog/${selectedAvatar.filename}`}
                alt={selectedAvatar.displayName}
                className="h-64 sm:h-72 md:h-80 lg:h-96 w-auto object-contain drop-shadow-[0_12px_45px_rgba(0,0,0,0.6)] hover:drop-shadow-[0_15px_50px_rgba(0,0,0,0.7)]"
                style={{ filter: isEnabled ? 'none' : 'grayscale(100%)' }}
                onError={(e) => {
                  (e.target as HTMLImageElement).style.display = 'none';
                }}
              />
            </motion.button>
            
            {displayMode === 'visible' && (
              <motion.div
                className="absolute -top-8 left-1/2 -translate-x-1/2 bg-white/95 backdrop-blur px-2 py-1 rounded-full shadow-lg text-xs text-slate-700 font-medium whitespace-nowrap border border-slate-200"
                initial={{ opacity: 0, y: 10, scale: 0.9 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                transition={{ delay: 0.3, type: 'spring' }}
              >
                Tap me to talk!
              </motion.div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export default LotBuddyAvatarPopup;
