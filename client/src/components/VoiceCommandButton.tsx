import { useState, useEffect } from 'react';
import { Mic, MicOff, Volume2, Loader2, MessageCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useLotBuddy, VoiceCommand } from '@/contexts/LotBuddyContext';
import { useToast } from '@/hooks/use-toast';
import { motion, AnimatePresence } from 'framer-motion';

interface VoiceCommandButtonProps {
  onCommand?: (command: VoiceCommand) => void;
  className?: string;
  size?: 'sm' | 'md' | 'lg';
  showTranscript?: boolean;
  floating?: boolean;
  mode?: 'command' | 'conversation' | 'both';
}

export function VoiceCommandButton({ 
  onCommand, 
  className = '', 
  size = 'md',
  showTranscript = true,
  floating = false,
  mode = 'both'
}: VoiceCommandButtonProps) {
  const { 
    voiceRecognition, 
    startListening, 
    stopListening, 
    onVoiceCommand,
    speak,
    customName,
    isEnabled,
    startConversation,
    isThinking
  } = useLotBuddy();
  const { toast } = useToast();
  const [showFeedback, setShowFeedback] = useState(false);
  
  const buddyName = customName || 'Lot Buddy';
  
  useEffect(() => {
    if (!onCommand) return;
    
    const unsubscribe = onVoiceCommand((command) => {
      onCommand(command);
      
      if (command.type !== 'unknown') {
        setShowFeedback(true);
        setTimeout(() => setShowFeedback(false), 3000);
        
        const responses: Record<string, string> = {
          'mark_delivered': "Got it! Marking as delivered.",
          'next_pickup': "Checking your next assignment...",
          'current_quota': "Let me get your quota status.",
          'help': "You can say: mark delivered, next pickup, what's my quota, start scan, take a break, where am I, call supervisor, or cancel.",
          'start_scan': "Opening the scanner for you.",
          'stop_scan': "Closing the scanner.",
          'where_am_i': "Checking your current location...",
          'status': "Getting your status update...",
          'break_start': "Starting your break. Take your time!",
          'break_end': "Welcome back! Ready to get rolling?",
          'navigate': `Setting navigation to ${(command as any).destination || 'your destination'}...`,
          'cancel': "Cancelled. What would you like to do instead?",
          'repeat': "Let me repeat that for you.",
          'confirm': "Confirmed!",
          'call_supervisor': "Connecting you with your supervisor..."
        };
        
        const response = responses[command.type];
        if (response) {
          speak(response);
        }
      } else {
        speak("Sorry, I didn't understand that. Try saying 'help' for a list of commands.");
      }
    });
    
    return unsubscribe;
  }, [onCommand, onVoiceCommand, speak]);
  
  useEffect(() => {
    if (voiceRecognition.error) {
      toast({
        title: "Voice Error",
        description: voiceRecognition.error,
        variant: "destructive"
      });
    }
  }, [voiceRecognition.error, toast]);
  
  const handleClick = () => {
    if (voiceRecognition.isListening) {
      stopListening();
    } else {
      startListening();
    }
  };
  
  if (!isEnabled || !voiceRecognition.isSupported) {
    return null;
  }
  
  const sizeClasses = {
    sm: 'h-10 w-10',
    md: 'h-14 w-14',
    lg: 'h-16 w-16'
  };
  
  const iconSizes = {
    sm: 'h-5 w-5',
    md: 'h-6 w-6',
    lg: 'h-7 w-7'
  };
  
  const buttonContent = (
    <Button
      onClick={handleClick}
      data-testid="button-voice-command"
      className={`
        ${sizeClasses[size]} 
        rounded-full 
        shadow-lg
        transition-all duration-300
        flex items-center justify-center
        ${voiceRecognition.isListening 
          ? 'bg-gradient-to-br from-red-500 to-red-700 hover:from-red-600 hover:to-red-800 animate-pulse shadow-red-500/50' 
          : 'bg-gradient-to-br from-emerald-500 to-cyan-600 hover:from-emerald-600 hover:to-cyan-700 shadow-emerald-500/30'
        }
        ${className}
      `}
    >
      {voiceRecognition.isListening ? (
        <motion.div
          animate={{ scale: [1, 1.2, 1] }}
          transition={{ repeat: Infinity, duration: 1 }}
        >
          <Mic className={`${iconSizes[size]} text-white`} />
        </motion.div>
      ) : (
        <Mic className={`${iconSizes[size]} text-white`} />
      )}
    </Button>
  );
  
  if (floating) {
    return (
      <div className="fixed bottom-36 right-2 z-50 flex flex-col items-end gap-2">
        <AnimatePresence>
          {voiceRecognition.isListening && (
            <motion.div
              initial={{ opacity: 0, x: 20, scale: 0.8 }}
              animate={{ opacity: 1, x: 0, scale: 1 }}
              exit={{ opacity: 0, x: 20, scale: 0.8 }}
              className="bg-slate-900/95 backdrop-blur-sm rounded-lg px-4 py-2 shadow-xl border border-emerald-500/30"
            >
              <div className="flex items-center gap-2">
                <Loader2 className="h-4 w-4 text-emerald-400 animate-spin" />
                <span className="text-white text-sm font-medium">Listening...</span>
              </div>
              <p className="text-emerald-300 text-xs mt-1">Say anything to {buddyName}</p>
            </motion.div>
          )}
          
          {isThinking && (
            <motion.div
              initial={{ opacity: 0, x: 20, scale: 0.8 }}
              animate={{ opacity: 1, x: 0, scale: 1 }}
              exit={{ opacity: 0, x: 20, scale: 0.8 }}
              className="bg-purple-900/95 backdrop-blur-sm rounded-lg px-4 py-2 shadow-xl border border-purple-500/30"
            >
              <div className="flex items-center gap-2">
                <Loader2 className="h-4 w-4 text-purple-400 animate-spin" />
                <span className="text-white text-sm font-medium">{buddyName} is thinking...</span>
              </div>
            </motion.div>
          )}
          
          {showFeedback && voiceRecognition.lastCommand && voiceRecognition.lastCommand.type !== 'unknown' && (
            <motion.div
              initial={{ opacity: 0, y: 10, scale: 0.9 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -10, scale: 0.9 }}
              className="bg-emerald-900/95 backdrop-blur-sm rounded-lg px-4 py-2 shadow-xl border border-emerald-500/50"
            >
              <div className="flex items-center gap-2">
                <Volume2 className="h-4 w-4 text-emerald-300" />
                <span className="text-white text-sm font-medium capitalize">
                  {voiceRecognition.lastCommand.type.replace(/_/g, ' ')}
                </span>
              </div>
              {showTranscript && voiceRecognition.lastTranscript && (
                <p className="text-emerald-200 text-xs mt-1 italic">
                  "{voiceRecognition.lastTranscript}"
                </p>
              )}
            </motion.div>
          )}
        </AnimatePresence>
        
        <div className="flex items-end gap-2">
          {(mode === 'both' || mode === 'conversation') && (
            <Button
              onClick={startConversation}
              data-testid="button-voice-chat"
              disabled={voiceRecognition.isListening || isThinking}
              className={`
                ${sizeClasses[size]} 
                rounded-full 
                shadow-lg
                transition-all duration-300
                bg-gradient-to-br from-purple-500 to-pink-600 hover:from-purple-600 hover:to-pink-700 shadow-purple-500/30
                disabled:opacity-50
                flex items-center justify-center
              `}
            >
              <MessageCircle className={`${iconSizes[size]} text-white`} />
            </Button>
          )}
          
          {(mode === 'both' || mode === 'command') && buttonContent}
        </div>
        
        <span className="text-[10px] text-slate-400 text-center">
          {voiceRecognition.isListening ? 'Listening...' : isThinking ? 'Thinking...' : `Talk to ${buddyName}`}
        </span>
      </div>
    );
  }
  
  return (
    <div className={`flex items-center gap-3 ${className}`}>
      {buttonContent}
      
      <AnimatePresence>
        {voiceRecognition.isListening && (
          <motion.div
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -10 }}
            className="flex items-center gap-2"
          >
            <Loader2 className="h-4 w-4 text-emerald-400 animate-spin" />
            <span className="text-emerald-400 text-sm">Listening...</span>
          </motion.div>
        )}
        
        {showTranscript && !voiceRecognition.isListening && voiceRecognition.lastTranscript && (
          <motion.div
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0 }}
            className="text-sm text-slate-400 italic max-w-[200px] truncate"
          >
            "{voiceRecognition.lastTranscript}"
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export function VoiceCommandHelp() {
  const { customName } = useLotBuddy();
  const buddyName = customName || 'Lot Buddy';
  
  const commands = [
    { phrase: `"Mark delivered"`, action: 'Complete current delivery' },
    { phrase: `"Next pickup"`, action: 'Get next assignment' },
    { phrase: `"What's my quota?"`, action: 'Check your progress' },
    { phrase: `"Start scan"`, action: 'Open camera scanner' },
    { phrase: `"Take a break"`, action: 'Start break timer' },
    { phrase: `"Back from break"`, action: 'End break' },
    { phrase: `"Where am I?"`, action: 'Get current location' },
    { phrase: `"Navigate to Lane 5"`, action: 'Get directions' },
    { phrase: `"Call supervisor"`, action: 'Contact your supervisor' },
    { phrase: `"Cancel" / "Undo"`, action: 'Cancel last action' },
    { phrase: `"Help"`, action: 'List all commands' },
  ];
  
  return (
    <div className="bg-slate-800/50 rounded-lg p-4 border border-slate-700">
      <h3 className="text-white font-semibold mb-3 flex items-center gap-2">
        <Mic className="h-5 w-5 text-emerald-400" />
        Voice Commands for {buddyName}
      </h3>
      <div className="grid gap-2">
        {commands.map((cmd, i) => (
          <div key={i} className="flex items-center justify-between text-sm">
            <span className="text-emerald-300 font-mono">{cmd.phrase}</span>
            <span className="text-slate-400">{cmd.action}</span>
          </div>
        ))}
      </div>
      <p className="text-xs text-slate-500 mt-3">
        Tap the microphone button, then speak naturally. {buddyName} learns your voice patterns over time!
      </p>
    </div>
  );
}
