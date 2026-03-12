import { createContext, useContext, useState, useEffect, useRef, useCallback, ReactNode } from 'react';

export interface LotBuddyAvatar {
  id: string;
  filename: string;
  displayName: string;
  race: string;
  gender: string;
  hairColor: string;
  bodyType: string;
  hasFacialHair?: boolean;
}

export interface VoicePreferences {
  enabled: boolean;
  rate: number;
  pitch: number;
  volume: number;
  gender: 'male' | 'female' | 'auto';
}

// Voice command types
export type VoiceCommand = 
  | { type: 'mark_delivered'; vin?: string }
  | { type: 'next_pickup' }
  | { type: 'current_quota' }
  | { type: 'help' }
  | { type: 'start_scan' }
  | { type: 'stop_scan' }
  | { type: 'where_am_i' }
  | { type: 'status' }
  | { type: 'break_start' }
  | { type: 'break_end' }
  | { type: 'navigate'; destination?: string }
  | { type: 'cancel' }
  | { type: 'repeat' }
  | { type: 'confirm' }
  | { type: 'call_supervisor' }
  | { type: 'unknown'; transcript: string };

export interface VoiceRecognitionState {
  isListening: boolean;
  isSupported: boolean;
  lastTranscript: string;
  lastCommand: VoiceCommand | null;
  error: string | null;
  confidence: number;
}

export interface VoicePatternProfile {
  avgWordLength: number;
  usesExclamations: boolean;
  usesQuestionMarks: boolean;
  usesEllipsis: boolean;
  usesAllCaps: boolean;
  emojiFrequency: 'none' | 'rare' | 'moderate' | 'frequent';
  punctuationStyle: 'minimal' | 'standard' | 'expressive';
  sentenceLength: 'short' | 'medium' | 'long';
  commonPhrases: string[];
  messageSamples: string[];
  totalMessageCount: number;
}

export interface PersonalityPreferences {
  tone: 'casual' | 'professional' | 'friendly' | 'motivational';
  verbosity: 'brief' | 'normal' | 'detailed';
  useEmojis: boolean;
  useSlang: boolean;
  encouragementLevel: 'low' | 'medium' | 'high';
  learnedPhrases: string[];
  interactionCount: number;
  voicePattern: VoicePatternProfile;
}

const DEFAULT_VOICE_PATTERN: VoicePatternProfile = {
  avgWordLength: 4.5,
  usesExclamations: false,
  usesQuestionMarks: false,
  usesEllipsis: false,
  usesAllCaps: false,
  emojiFrequency: 'none',
  punctuationStyle: 'standard',
  sentenceLength: 'medium',
  commonPhrases: [],
  messageSamples: [],
  totalMessageCount: 0
};

const DEFAULT_PERSONALITY: PersonalityPreferences = {
  tone: 'friendly',
  verbosity: 'normal',
  useEmojis: true,
  useSlang: false,
  encouragementLevel: 'medium',
  learnedPhrases: [],
  interactionCount: 0,
  voicePattern: DEFAULT_VOICE_PATTERN
};

export type LotBuddyDisplayMode = 'minimized' | 'visible' | 'speaking';
export type LotBuddyVisibilityPreference = 'minimize_to_tile' | 'always_visible';
export type BuddySurface = 'none' | 'popup' | 'chat';
export type InteractionMode = 'ai' | 'messaging' | null;

interface LotBuddyContextType {
  selectedAvatar: LotBuddyAvatar | null;
  setSelectedAvatar: (avatar: LotBuddyAvatar | null) => void;
  customName: string;
  setCustomName: (name: string) => void;
  isEnabled: boolean;
  setIsEnabled: (enabled: boolean) => void;
  showPopup: (message: string, title?: string, duration?: number) => void;
  hidePopup: () => void;
  popupState: {
    isVisible: boolean;
    message: string;
    title: string;
    direction: 'left' | 'right';
  };
  availableAvatars: LotBuddyAvatar[];
  displayMode: LotBuddyDisplayMode;
  setDisplayMode: (mode: LotBuddyDisplayMode) => void;
  visibilityPreference: LotBuddyVisibilityPreference;
  setVisibilityPreference: (pref: LotBuddyVisibilityPreference) => void;
  expandMascot: () => void;
  minimizeMascot: () => void;
  // Voice synthesis (text-to-speech)
  voicePreferences: VoicePreferences;
  setVoicePreferences: (prefs: Partial<VoicePreferences>) => void;
  speak: (text: string) => void;
  stopSpeaking: () => void;
  isSpeaking: boolean;
  voiceSupported: boolean;
  availableVoices: SpeechSynthesisVoice[];
  // Voice recognition (speech-to-text)
  voiceRecognition: VoiceRecognitionState;
  startListening: () => void;
  stopListening: () => void;
  onVoiceCommand: (callback: (command: VoiceCommand) => void) => () => void;
  // Adaptive AI personality
  personality: PersonalityPreferences;
  setPersonality: (prefs: Partial<PersonalityPreferences>) => void;
  getPersonalizedMessage: (context: string, baseMessage?: string) => Promise<string>;
  recordInteraction: (type: 'positive' | 'neutral' | 'dismissed') => void;
  learnFromUserInput: (userMessage: string) => void;
  generateMirroredResponse: (baseMessage: string) => string;
  // Conversational AI (natural speech)
  talkToLotBuddy: (message: string) => Promise<string>;
  isThinking: boolean;
  startConversation: () => void;
  // Surface coordination for FloatingScene
  activeSurface: BuddySurface;
  openPopupSurface: (message: string, title?: string, duration?: number) => void;
  openChatSurface: () => void;
  closeBuddySurface: () => void;
  // Full-screen interaction overlay
  interactionMode: InteractionMode;
  openInteractionOverlay: (mode: 'ai' | 'messaging') => void;
  closeInteractionOverlay: () => void;
}

const LotBuddyContext = createContext<LotBuddyContextType | undefined>(undefined);

const STORAGE_KEY = 'lotbuddy_preferences';

// Parse avatar filename to extract metadata
function parseAvatarFilename(filename: string): LotBuddyAvatar {
  // Format: lotbuddy_avatar_##_[race]_[gender]_[haircolor]_[bodytype].png
  const parts = filename.replace('.png', '').split('_');
  const id = parts[2] || '00';
  const race = parts[3] || 'unknown';
  const gender = parts[4] || 'unknown';
  const hairColor = parts[5] || 'unknown';
  const bodyType = parts[6] || 'average';
  const hasFacialHair = filename.includes('beard') || filename.includes('goatee') || filename.includes('stubble');
  
  // Simple display name - just "Buddy #XX" - no race/gender labels
  return {
    id,
    filename,
    displayName: `Buddy #${id}`,
    race,
    gender,
    hairColor,
    bodyType,
    hasFacialHair
  };
}

// Get best matching voice for avatar gender
function getBestVoice(voices: SpeechSynthesisVoice[], gender: string): SpeechSynthesisVoice | null {
  if (voices.length === 0) return null;
  
  // Priority: English voices, then match gender
  const englishVoices = voices.filter(v => v.lang.startsWith('en'));
  const targetVoices = englishVoices.length > 0 ? englishVoices : voices;
  
  // Common female voice name patterns
  const femalePatterns = ['female', 'woman', 'samantha', 'victoria', 'karen', 'moira', 'tessa', 'fiona', 'veena', 'zira', 'hazel', 'susan', 'kate'];
  // Common male voice name patterns  
  const malePatterns = ['male', 'man', 'daniel', 'alex', 'tom', 'david', 'james', 'richard', 'george', 'mark'];
  
  const patterns = gender === 'female' ? femalePatterns : malePatterns;
  const oppositePatterns = gender === 'female' ? malePatterns : femalePatterns;
  
  // Try to find matching gender voice
  for (const voice of targetVoices) {
    const nameLower = voice.name.toLowerCase();
    if (patterns.some(p => nameLower.includes(p))) {
      return voice;
    }
  }
  
  // Avoid opposite gender if possible
  const neutralVoices = targetVoices.filter(v => {
    const nameLower = v.name.toLowerCase();
    return !oppositePatterns.some(p => nameLower.includes(p));
  });
  
  return neutralVoices[0] || targetVoices[0] || voices[0];
}

export function LotBuddyProvider({ children }: { children: ReactNode }) {
  const [selectedAvatar, setSelectedAvatarState] = useState<LotBuddyAvatar | null>(null);
  const [customName, setCustomNameState] = useState<string>('');
  const [isEnabled, setIsEnabledState] = useState(true);
  const [availableAvatars, setAvailableAvatars] = useState<LotBuddyAvatar[]>([]);
  const [popupState, setPopupState] = useState({
    isVisible: false,
    message: '',
    title: '',
    direction: 'left' as 'left' | 'right'
  });
  const [popupTimeout, setPopupTimeoutId] = useState<NodeJS.Timeout | null>(null);
  
  // Surface coordination for FloatingScene - ensures only one Buddy instance at a time
  const [activeSurface, setActiveSurface] = useState<BuddySurface>('none');
  
  // Full-screen interaction overlay state
  const [interactionMode, setInteractionMode] = useState<InteractionMode>(null);
  
  const [displayMode, setDisplayModeState] = useState<LotBuddyDisplayMode>('minimized');
  const [visibilityPreference, setVisibilityPreferenceState] = useState<LotBuddyVisibilityPreference>('minimize_to_tile');

  useEffect(() => {
    const savedPref = localStorage.getItem('lotbuddy_visibility_preference');
    if (savedPref === 'always_visible' || savedPref === 'minimize_to_tile') {
      setVisibilityPreferenceState(savedPref);
      if (savedPref === 'always_visible') {
        setDisplayModeState('visible');
      }
    }
  }, []);

  const setDisplayMode = useCallback((mode: LotBuddyDisplayMode) => {
    setDisplayModeState(mode);
  }, []);

  const setVisibilityPreference = useCallback((pref: LotBuddyVisibilityPreference) => {
    setVisibilityPreferenceState(pref);
    localStorage.setItem('lotbuddy_visibility_preference', pref);
    if (pref === 'always_visible') {
      setDisplayModeState('visible');
    } else {
      setDisplayModeState('minimized');
    }
  }, []);

  const expandMascot = useCallback(() => {
    setDisplayModeState('visible');
  }, []);

  const minimizeMascot = useCallback(() => {
    if (visibilityPreference !== 'always_visible') {
      setDisplayModeState('minimized');
    }
  }, [visibilityPreference]);
  
  // Adaptive AI personality state
  const [personality, setPersonalityState] = useState<PersonalityPreferences>(DEFAULT_PERSONALITY);
  
  // Voice synthesis state
  const [voicePreferences, setVoicePreferencesState] = useState<VoicePreferences>({
    enabled: true,
    rate: 1.0,
    pitch: 1.0,
    volume: 0.8,
    gender: 'auto'
  });
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [availableVoices, setAvailableVoices] = useState<SpeechSynthesisVoice[]>([]);
  const [voiceSupported, setVoiceSupported] = useState(false);
  const speechRef = useRef<SpeechSynthesisUtterance | null>(null);
  
  // Voice recognition state (speech-to-text)
  const [voiceRecognition, setVoiceRecognition] = useState<VoiceRecognitionState>({
    isListening: false,
    isSupported: false,
    lastTranscript: '',
    lastCommand: null,
    error: null,
    confidence: 0
  });
  const recognitionRef = useRef<any>(null);
  const commandCallbacksRef = useRef<Set<(command: VoiceCommand) => void>>(new Set());

  // Parse voice transcript into a command
  const parseVoiceCommand = useCallback((transcript: string): VoiceCommand => {
    const text = transcript.toLowerCase().trim();
    
    // Cancel / undo / abort - check first for safety
    if (/\b(cancel|undo|abort|never ?mind|stop that)\b/.test(text)) {
      return { type: 'cancel' };
    }
    
    // Repeat last command
    if (/\b(repeat|say.*(again|that)|what did you say)\b/.test(text)) {
      return { type: 'repeat' };
    }
    
    // Call supervisor / emergency contact
    if (/\b(call|contact|reach|get).*(supervisor|teresa|manager|help)\b/.test(text) ||
        /\b(need|supervisor|manager|help me)\b/.test(text)) {
      return { type: 'call_supervisor' };
    }
    
    // Confirm / yes / ok
    if (/^(yes|yeah|yep|confirm|ok|okay|affirmative|correct|right)$/i.test(text)) {
      return { type: 'confirm' };
    }
    
    // Mark delivered / complete / done
    if (/\b(mark|this|car|vehicle).*(delivered|done|complete|finished)\b/.test(text) ||
        /\b(delivered|done|complete|finished)\b/.test(text)) {
      // More precise VIN extraction - look for "VIN" prefix or 17-char pattern
      const vinWithPrefix = text.match(/\bvin\s*[:=]?\s*([A-Z0-9]{17})\b/i);
      const vin17 = text.match(/\b([A-HJ-NPR-Z0-9]{17})\b/i); // Standard VIN format (excludes I, O, Q)
      return { type: 'mark_delivered', vin: vinWithPrefix?.[1] || vin17?.[1] };
    }
    
    // Next pickup / assignment
    if (/\b(next|what's next|what is next|next pickup|next car|next assignment)\b/.test(text)) {
      return { type: 'next_pickup' };
    }
    
    // Quota / progress / how am I doing
    if (/\b(quota|progress|how.*(am i|many|much)|count|stats|score)\b/.test(text)) {
      return { type: 'current_quota' };
    }
    
    // Help
    if (/\b(help|what can you do|commands|options)\b/.test(text)) {
      return { type: 'help' };
    }
    
    // Start/stop scan
    if (/\b(start|open|begin).*(scan|camera|scanner)\b/.test(text)) {
      return { type: 'start_scan' };
    }
    if (/\b(stop|close|end).*(scan|camera|scanner)\b/.test(text)) {
      return { type: 'stop_scan' };
    }
    
    // Location
    if (/\b(where am i|my location|current location|position)\b/.test(text)) {
      return { type: 'where_am_i' };
    }
    
    // Status
    if (/\b(status|what's going on|update)\b/.test(text)) {
      return { type: 'status' };
    }
    
    // Break
    if (/\b(start|take|going on).*(break|lunch)\b/.test(text)) {
      return { type: 'break_start' };
    }
    if (/\b(end|back from|done with).*(break|lunch)\b/.test(text)) {
      return { type: 'break_end' };
    }
    
    // Navigate
    if (/\b(navigate|go to|take me to|directions to)\b/.test(text)) {
      const destMatch = text.match(/(?:navigate|go to|take me to|directions to)\s+(.+)/i);
      return { type: 'navigate', destination: destMatch?.[1]?.trim() };
    }
    
    // Unknown command
    return { type: 'unknown', transcript };
  }, []);

  // Initialize voice synthesis
  useEffect(() => {
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      setVoiceSupported(true);
      console.log('[LotBuddy Voice] Speech synthesis supported');
      
      const loadVoices = () => {
        const voices = window.speechSynthesis.getVoices();
        console.log('[LotBuddy Voice] Loaded', voices.length, 'voices');
        setAvailableVoices(voices);
        
        // If no voices yet, try again after a short delay (Chrome sometimes needs this)
        if (voices.length === 0) {
          setTimeout(() => {
            const retryVoices = window.speechSynthesis.getVoices();
            console.log('[LotBuddy Voice] Retry loaded', retryVoices.length, 'voices');
            setAvailableVoices(retryVoices);
          }, 100);
        }
      };
      
      // Voices may load asynchronously
      loadVoices();
      window.speechSynthesis.onvoiceschanged = loadVoices;
      
      // Additional fallback for browsers that don't fire onvoiceschanged
      setTimeout(loadVoices, 500);
      
      return () => {
        window.speechSynthesis.onvoiceschanged = null;
      };
    } else {
      console.log('[LotBuddy Voice] Speech synthesis NOT supported');
    }
  }, []);
  
  // Initialize voice recognition (speech-to-text)
  useEffect(() => {
    if (typeof window === 'undefined') return;
    
    // Check for SpeechRecognition support
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    
    if (!SpeechRecognition) {
      setVoiceRecognition(prev => ({ ...prev, isSupported: false }));
      return;
    }
    
    setVoiceRecognition(prev => ({ ...prev, isSupported: true }));
    
    // Create recognition instance
    const recognition = new SpeechRecognition();
    recognition.continuous = false; // Single command mode
    recognition.interimResults = false;
    recognition.lang = 'en-US';
    recognition.maxAlternatives = 1;
    
    recognition.onstart = () => {
      setVoiceRecognition(prev => ({ 
        ...prev, 
        isListening: true, 
        error: null 
      }));
    };
    
    recognition.onend = () => {
      setVoiceRecognition(prev => ({ ...prev, isListening: false }));
    };
    
    recognition.onerror = (event: any) => {
      let errorMsg = 'Voice recognition error';
      if (event.error === 'no-speech') errorMsg = 'No speech detected. Try again.';
      else if (event.error === 'not-allowed') errorMsg = 'Microphone access denied. Please enable microphone.';
      else if (event.error === 'network') errorMsg = 'Network error. Check your connection.';
      
      setVoiceRecognition(prev => ({ 
        ...prev, 
        isListening: false, 
        error: errorMsg 
      }));
    };
    
    recognition.onresult = (event: any) => {
      const result = event.results[0];
      const transcript = result[0].transcript;
      const confidence = result[0].confidence;
      
      // Parse the command
      const command = parseVoiceCommand(transcript);
      
      setVoiceRecognition(prev => ({
        ...prev,
        lastTranscript: transcript,
        lastCommand: command,
        confidence,
        error: null
      }));
      
      // Learn from the user's voice input (adapts to their speaking patterns)
      learnFromUserInput(transcript);
      
      // Notify all registered callbacks
      commandCallbacksRef.current.forEach(callback => callback(command));
    };
    
    recognitionRef.current = recognition;
    
    return () => {
      if (recognitionRef.current) {
        recognitionRef.current.abort();
      }
    };
  }, [parseVoiceCommand]);

  // Load preferences from localStorage
  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        const prefs = JSON.parse(stored);
        if (prefs.isEnabled !== undefined) setIsEnabledState(prefs.isEnabled);
        if (prefs.customName) setCustomNameState(prefs.customName);
        if (prefs.voicePreferences) setVoicePreferencesState(prefs.voicePreferences);
        if (prefs.personality) setPersonalityState({ ...DEFAULT_PERSONALITY, ...prefs.personality });
        if (prefs.selectedAvatarId && availableAvatars.length > 0) {
          const avatar = availableAvatars.find(a => a.id === prefs.selectedAvatarId);
          if (avatar) setSelectedAvatarState(avatar);
        }
      }
    } catch (e) {
      console.error('Failed to load LotBuddy preferences:', e);
    }
  }, [availableAvatars]);

  // Load available avatars from catalog
  useEffect(() => {
    // Define the avatar catalog - 41 unique 3D Pixar-style avatars
    const catalogFiles = [
      'lotbuddy_avatar_01_mixed_male_brown_average.png',
      'lotbuddy_avatar_02_caucasian_male_brown_average.png',
      'lotbuddy_avatar_03_caucasian_female_blonde_slim.png',
      'lotbuddy_avatar_04_black_male_black_average.png',
      'lotbuddy_avatar_05_hispanic_male_black_stocky_beard.png',
      'lotbuddy_avatar_06_southasian_male_black_slim.png',
      'lotbuddy_avatar_07_middleeastern_male_black_average_beard.png',
      'lotbuddy_avatar_08_hispanic_male_black_average_beard.png',
      'lotbuddy_avatar_09_asian_male_black_slim.png',
      'lotbuddy_avatar_10_asian_male_black_slim.png',
      'lotbuddy_avatar_11_caucasian_male_auburn_stocky_beard.png',
      'lotbuddy_avatar_12_black_male_bald_stocky.png',
      'lotbuddy_avatar_13_black_male_gray_stocky_older.png',
      'lotbuddy_avatar_14_caucasian_male_blonde_stocky.png',
      'lotbuddy_avatar_15_caucasian_male_gray_average_older_glasses.png',
      'lotbuddy_avatar_16_hispanic_male_gray_stocky_older_beard.png',
      'lotbuddy_avatar_17_hispanic_female_black_average.png',
      'lotbuddy_avatar_18_black_female_gray_average_older_glasses.png',
      'lotbuddy_avatar_19_hispanic_male_black_stocky_goatee.png',
      'lotbuddy_avatar_21_caucasian_male_bald_stocky_older_mustache.png',
      'lotbuddy_avatar_22_caucasian_male_white_stocky_older.png',
      'lotbuddy_avatar_23_caucasian_female_auburn_stocky_curly.png',
      'lotbuddy_avatar_24_caucasian_male_gray_stocky_older_cap.png',
      'lotbuddy_avatar_25_black_male_gray_average_older_hat_glasses_cane.png',
      'lotbuddy_avatar_26_asian_female_black_slim_glasses_cane_redhighlights.png',
      'lotbuddy_avatar_27_mixed_male_brown_average_curly_young.png',
      'lotbuddy_avatar_28_asian_male_black_slim_glasses.png',
      'lotbuddy_avatar_29_caucasian_female_auburn_average_curly.png',
      'lotbuddy_avatar_30_southasian_male_black_average.png',
      'lotbuddy_avatar_31_hispanic_male_black_slim_young.png',
      'lotbuddy_avatar_32_caucasian_male_brown_stocky.png',
      'lotbuddy_avatar_33_caucasian_female_blonde_average_glasses.png',
      'lotbuddy_avatar_34_group_5_workers.png',
      'lotbuddy_avatar_35_mixed_female_brown_curly_stocky.png',
      'lotbuddy_avatar_36_caucasian_male_brown_slim_glasses.png',
      'lotbuddy_avatar_37_caucasian_male_blonde_curly_average.png',
      'lotbuddy_avatar_38_caucasian_female_brown_average_glasses.png',
      'lotbuddy_avatar_39_caucasian_female_brown_stocky.png',
      'lotbuddy_avatar_40_mixed_female_brown_curly_stocky.png',
      'lotbuddy_avatar_41_caucasian_female_brown_stocky.png',
      'lotbuddy_avatar_42_caucasian_male_brown_stocky.png',
    ];
    
    const avatars = catalogFiles.map(parseAvatarFilename);
    setAvailableAvatars(avatars);
    
    // Set default avatar if none selected
    if (!selectedAvatar && avatars.length > 0) {
      setSelectedAvatarState(avatars[0]);
    }
  }, []);

  // Save preferences to localStorage
  const savePreferences = useCallback((avatarId: string | null, enabled: boolean, name: string, voice: VoicePreferences, pers: PersonalityPreferences) => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify({
        selectedAvatarId: avatarId,
        isEnabled: enabled,
        customName: name,
        voicePreferences: voice,
        personality: pers
      }));
    } catch (e) {
      console.error('Failed to save LotBuddy preferences:', e);
    }
  }, []);

  const setSelectedAvatar = useCallback((avatar: LotBuddyAvatar | null) => {
    setSelectedAvatarState(avatar);
    savePreferences(avatar?.id || null, isEnabled, customName, voicePreferences, personality);
  }, [isEnabled, customName, voicePreferences, personality, savePreferences]);

  const setCustomName = useCallback((name: string) => {
    setCustomNameState(name);
    savePreferences(selectedAvatar?.id || null, isEnabled, name, voicePreferences, personality);
  }, [selectedAvatar, isEnabled, voicePreferences, personality, savePreferences]);

  const setIsEnabled = useCallback((enabled: boolean) => {
    setIsEnabledState(enabled);
    savePreferences(selectedAvatar?.id || null, enabled, customName, voicePreferences, personality);
  }, [selectedAvatar, customName, voicePreferences, personality, savePreferences]);

  const setVoicePreferences = useCallback((prefs: Partial<VoicePreferences>) => {
    setVoicePreferencesState(prev => {
      const updated = { ...prev, ...prefs };
      savePreferences(selectedAvatar?.id || null, isEnabled, customName, updated, personality);
      return updated;
    });
  }, [selectedAvatar, isEnabled, customName, personality, savePreferences]);

  // Adaptive AI personality methods
  const setPersonality = useCallback((prefs: Partial<PersonalityPreferences>) => {
    setPersonalityState(prev => {
      const updated = { ...prev, ...prefs };
      savePreferences(selectedAvatar?.id || null, isEnabled, customName, voicePreferences, updated);
      return updated;
    });
  }, [selectedAvatar, isEnabled, customName, voicePreferences, savePreferences]);

  // Record user interaction to adapt personality over time
  const recordInteraction = useCallback((type: 'positive' | 'neutral' | 'dismissed') => {
    setPersonalityState(prev => {
      const updated = { ...prev, interactionCount: prev.interactionCount + 1 };
      
      // Adapt based on interaction patterns
      if (type === 'dismissed') {
        // User dismissed - reduce verbosity/enthusiasm
        if (updated.interactionCount % 3 === 0) {
          if (updated.verbosity === 'detailed') updated.verbosity = 'normal';
          else if (updated.verbosity === 'normal') updated.verbosity = 'brief';
          if (updated.encouragementLevel === 'high') updated.encouragementLevel = 'medium';
          else if (updated.encouragementLevel === 'medium') updated.encouragementLevel = 'low';
        }
      } else if (type === 'positive') {
        // User engaged positively - increase engagement
        if (updated.interactionCount % 5 === 0) {
          if (updated.encouragementLevel === 'low') updated.encouragementLevel = 'medium';
          else if (updated.encouragementLevel === 'medium') updated.encouragementLevel = 'high';
        }
      }
      
      savePreferences(selectedAvatar?.id || null, isEnabled, customName, voicePreferences, updated);
      return updated;
    });
  }, [selectedAvatar, isEnabled, customName, voicePreferences, savePreferences]);

  // Learn from user input to mirror their communication style
  const learnFromUserInput = useCallback((userMessage: string) => {
    if (!userMessage || userMessage.length < 3) return;
    
    setPersonalityState(prev => {
      const vp = prev.voicePattern;
      const samples = [...vp.messageSamples];
      
      // Keep last 20 message samples for analysis
      if (samples.length >= 20) samples.shift();
      samples.push(userMessage);
      
      // Analyze the message
      const words = userMessage.split(/\s+/).filter(w => w.length > 0);
      const avgWordLen = words.length > 0 ? words.reduce((acc, w) => acc + w.replace(/[^\w]/g, '').length, 0) / words.length : 4.5;
      
      // Detect patterns
      const hasExclamation = /!/.test(userMessage);
      const hasQuestion = /\?/.test(userMessage);
      const hasEllipsis = /\.{2,}|…/.test(userMessage);
      const hasAllCaps = /\b[A-Z]{2,}\b/.test(userMessage);
      const emojiMatch = userMessage.match(/[\uD83C-\uDBFF\uDC00-\uDFFF]+/g);
      const emojiCount = emojiMatch ? emojiMatch.length : 0;
      
      // Calculate running averages
      const totalMsgs = vp.totalMessageCount + 1;
      const newAvgWordLen = ((vp.avgWordLength * vp.totalMessageCount) + avgWordLen) / totalMsgs;
      
      // Determine emoji frequency
      let emojiFreq: 'none' | 'rare' | 'moderate' | 'frequent' = 'none';
      if (emojiCount > 2) emojiFreq = 'frequent';
      else if (emojiCount > 0) emojiFreq = 'moderate';
      else if (vp.emojiFrequency !== 'none' && totalMsgs > 3) emojiFreq = 'rare';
      
      // Determine punctuation style
      const punctCount = (userMessage.match(/[!?;:,]/g) || []).length;
      let punctStyle: 'minimal' | 'standard' | 'expressive' = 'standard';
      if (punctCount === 0 && words.length > 3) punctStyle = 'minimal';
      else if (punctCount > words.length / 2) punctStyle = 'expressive';
      
      // Determine sentence length preference
      let sentLen: 'short' | 'medium' | 'long' = 'medium';
      if (words.length <= 5) sentLen = 'short';
      else if (words.length > 15) sentLen = 'long';
      
      // Extract common 2-3 word phrases
      const phrases = [...vp.commonPhrases];
      for (let i = 0; i < words.length - 1; i++) {
        const phrase = words.slice(i, i + 2).join(' ').toLowerCase().replace(/[^\w\s]/g, '');
        if (phrase.length > 4 && !phrases.includes(phrase)) {
          if (phrases.length >= 10) phrases.shift();
          phrases.push(phrase);
        }
      }
      
      const updated = {
        ...prev,
        voicePattern: {
          avgWordLength: newAvgWordLen,
          usesExclamations: hasExclamation || vp.usesExclamations,
          usesQuestionMarks: hasQuestion || vp.usesQuestionMarks,
          usesEllipsis: hasEllipsis || vp.usesEllipsis,
          usesAllCaps: hasAllCaps || vp.usesAllCaps,
          emojiFrequency: emojiFreq !== 'none' ? emojiFreq : vp.emojiFrequency,
          punctuationStyle: punctStyle,
          sentenceLength: sentLen,
          commonPhrases: phrases,
          messageSamples: samples,
          totalMessageCount: totalMsgs
        }
      };
      
      savePreferences(selectedAvatar?.id || null, isEnabled, customName, voicePreferences, updated);
      return updated;
    });
  }, [selectedAvatar, isEnabled, customName, voicePreferences, savePreferences]);

  // Generate a response that mirrors the user's communication style
  const generateMirroredResponse = useCallback((baseMessage: string): string => {
    const vp = personality.voicePattern;
    let response = baseMessage;
    
    // Apply learned patterns to mirror user's style
    
    // Adjust sentence structure based on their preference
    if (vp.sentenceLength === 'short' && response.length > 50) {
      // Shorten by removing filler words
      response = response.replace(/\b(just|really|very|quite|actually)\b\s*/gi, '');
    }
    
    // Add exclamations if they use them
    if (vp.usesExclamations && !response.includes('!') && Math.random() > 0.5) {
      response = response.replace(/\.$/, '!');
    }
    
    // Add ellipsis if they use it
    if (vp.usesEllipsis && Math.random() > 0.7) {
      response = response.replace(/\.$/, '...');
    }
    
    // Mirror emoji usage
    if (vp.emojiFrequency === 'frequent') {
      const emojis = ['👍', '✨', '🔥', '💪', '👏', '🚗', '⚡'];
      response = `${response} ${emojis[Math.floor(Math.random() * emojis.length)]}`;
    } else if (vp.emojiFrequency === 'moderate' && Math.random() > 0.5) {
      const emojis = ['👍', '✨', '💪'];
      response = `${response} ${emojis[Math.floor(Math.random() * emojis.length)]}`;
    }
    
    // Mirror punctuation style
    if (vp.punctuationStyle === 'minimal') {
      response = response.replace(/[,;:]/g, '');
    } else if (vp.punctuationStyle === 'expressive' && !response.includes('!')) {
      response = response.replace(/\.$/, '!');
    }
    
    // Add casual contractions if they use short sentences
    if (vp.sentenceLength === 'short') {
      response = response
        .replace(/\bI am\b/g, "I'm")
        .replace(/\bYou are\b/g, "You're")
        .replace(/\bIt is\b/g, "It's")
        .replace(/\bdo not\b/g, "don't")
        .replace(/\bcannot\b/g, "can't");
    }
    
    // Include one of their common phrases occasionally
    if (vp.commonPhrases.length > 0 && Math.random() > 0.8) {
      const phrase = vp.commonPhrases[Math.floor(Math.random() * vp.commonPhrases.length)];
      if (!response.toLowerCase().includes(phrase)) {
        response = `${phrase} - ${response}`;
      }
    }
    
    return response;
  }, [personality.voicePattern]);

  // Get personalized message using AI or template fallback
  const getPersonalizedMessage = useCallback(async (context: string, baseMessage?: string): Promise<string> => {
    const buddyName = customName || 'Lot Buddy';
    
    // Template-based messages as fallback (fast, no API call)
    const templates = {
      greeting: {
        casual: [`Hey! What's up?`, `Yo! Ready to roll?`, `Hey there, friend!`],
        professional: [`Good day. How may I assist you?`, `Hello. Ready to help.`, `Greetings. At your service.`],
        friendly: [`Hi there! Great to see you!`, `Hey! Hope you're having a good one!`, `Hello! Ready to help out!`],
        motivational: [`Let's crush it today!`, `Time to make it happen!`, `You've got this! Let's go!`]
      },
      encouragement: {
        casual: [`Nice work!`, `Solid!`, `Keep it up!`],
        professional: [`Excellent progress.`, `Well done.`, `Proceeding efficiently.`],
        friendly: [`You're doing great!`, `Awesome job!`, `That's the way!`],
        motivational: [`Champion moves!`, `Unstoppable!`, `On fire today!`]
      },
      tip: {
        casual: [`Quick tip:`, `FYI:`, `Heads up:`],
        professional: [`Please note:`, `Important:`, `For your information:`],
        friendly: [`Here's a helpful tip!`, `Just so you know:`, `Friendly reminder:`],
        motivational: [`Pro tip for success:`, `Power move:`, `Level up tip:`]
      }
    };
    
    // If we have a base message, just style it
    if (baseMessage) {
      const prefix = personality.useEmojis ? '✨ ' : '';
      const suffix = personality.useEmojis ? ' 💪' : '';
      return personality.encouragementLevel === 'high' ? `${prefix}${baseMessage}${suffix}` : baseMessage;
    }
    
    // Get template based on context and personality tone
    const contextTemplates = templates[context as keyof typeof templates] || templates.greeting;
    const toneMessages = contextTemplates[personality.tone] || contextTemplates.friendly;
    const randomMessage = toneMessages[Math.floor(Math.random() * toneMessages.length)];
    
    // Add visual flair for display (emojis for visual appeal only)
    const prefix = personality.useEmojis ? '✨ ' : '';
    const suffix = personality.useEmojis ? ' ✨' : '';
    return personality.verbosity === 'brief' ? randomMessage : `${prefix}${randomMessage}${suffix}`;
  }, [customName, personality]);

  // Clean text for natural speech - remove emojis and formatting
  const cleanTextForSpeech = useCallback((text: string): string => {
    let cleaned = text;
    
    // Remove emojis using a simpler approach - match emoji unicode ranges
    cleaned = cleaned.replace(/[\u2600-\u27BF]|[\uD83C-\uDBFF][\uDC00-\uDFFF]|[\u2300-\u23FF]|[\u2B50-\u2B55]|[\u2934-\u2935]|[\u25AA-\u25FE]|[\u2190-\u21FF]|[\u2000-\u206F]|[\u3000-\u303F]/g, '');
    
    // Remove specific common emojis that might slip through
    cleaned = cleaned.replace(/[✨💪🎧🔊✓⏳🏆🎯🚀⭐️❤️👋👍🙌💯🔥✅❌⚡️💡🎉]/g, '');
    
    // Remove common patterns that sound awkward when spoken
    cleaned = cleaned.replace(/Lot Buddy says:\s*/gi, '');
    cleaned = cleaned.replace(/says:\s*/gi, '');
    cleaned = cleaned.replace(/\s*:\s*$/g, '');
    cleaned = cleaned.replace(/\*\*/g, '');
    cleaned = cleaned.replace(/\*/g, '');
    cleaned = cleaned.replace(/#+\s*/g, '');
    cleaned = cleaned.replace(/`/g, '');
    cleaned = cleaned.replace(/\s+/g, ' ');
    cleaned = cleaned.trim();
    
    return cleaned;
  }, []);

  // Audio ref for OpenAI TTS playback
  const audioRef = useRef<HTMLAudioElement | null>(null);
  
  // Fallback to browser speech synthesis
  const speakWithBrowserVoice = useCallback((text: string) => {
    if (!voiceSupported) {
      console.log('[LotBuddy Voice] Browser TTS not supported');
      return;
    }
    
    window.speechSynthesis.cancel();
    if (window.speechSynthesis.paused) {
      window.speechSynthesis.resume();
    }
    
    const cleanedText = cleanTextForSpeech(text);
    if (!cleanedText) return;
    
    console.log('[LotBuddy Voice] Using browser fallback for:', cleanedText.substring(0, 30) + '...');
    
    const utterance = new SpeechSynthesisUtterance(cleanedText);
    utterance.rate = voicePreferences.rate;
    utterance.pitch = voicePreferences.pitch;
    utterance.volume = voicePreferences.volume;
    
    const targetGender = voicePreferences.gender === 'auto' 
      ? (selectedAvatar?.gender || 'male')
      : voicePreferences.gender;
    const voice = getBestVoice(availableVoices, targetGender);
    if (voice) utterance.voice = voice;
    
    utterance.onstart = () => setIsSpeaking(true);
    utterance.onend = () => setIsSpeaking(false);
    utterance.onerror = () => setIsSpeaking(false);
    
    speechRef.current = utterance;
    setTimeout(() => window.speechSynthesis.speak(utterance), 50);
  }, [voiceSupported, voicePreferences, availableVoices, selectedAvatar, cleanTextForSpeech]);

  // Text-to-speech function using OpenAI's natural voice
  const speak = useCallback(async (text: string) => {
    if (!voicePreferences.enabled || !isEnabled) {
      console.log('[LotBuddy Voice] Skipped - enabled:', voicePreferences.enabled, 'isEnabled:', isEnabled);
      return;
    }
    
    // Stop any current audio
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current = null;
    }
    window.speechSynthesis.cancel();
    
    const cleanedText = cleanTextForSpeech(text);
    if (!cleanedText) {
      console.log('[LotBuddy Voice] Nothing to speak after cleaning');
      return;
    }
    
    console.log('[LotBuddy Voice] Requesting natural voice for:', cleanedText.substring(0, 50) + '...');
    setIsSpeaking(true);
    
    try {
      // Try OpenAI TTS first for natural voice
      const response = await fetch('/api/ai/speak', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          text: cleanedText,
          voice: selectedAvatar?.gender === 'female' ? 'nova' : 'alloy'
        })
      });
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        if (errorData.fallback) {
          console.log('[LotBuddy Voice] OpenAI TTS unavailable, using browser fallback');
          setIsSpeaking(false);
          speakWithBrowserVoice(text);
          return;
        }
        throw new Error('TTS request failed');
      }
      
      // Play the audio
      const audioBlob = await response.blob();
      const audioUrl = URL.createObjectURL(audioBlob);
      const audio = new Audio(audioUrl);
      audioRef.current = audio;
      
      audio.volume = voicePreferences.volume;
      
      audio.onended = () => {
        console.log('[LotBuddy Voice] Finished speaking (natural)');
        setIsSpeaking(false);
        URL.revokeObjectURL(audioUrl);
        audioRef.current = null;
      };
      
      audio.onerror = () => {
        console.log('[LotBuddy Voice] Audio playback error, trying fallback');
        setIsSpeaking(false);
        URL.revokeObjectURL(audioUrl);
        speakWithBrowserVoice(text);
      };
      
      await audio.play();
      console.log('[LotBuddy Voice] Playing natural voice');
      
    } catch (error) {
      console.error('[LotBuddy Voice] OpenAI TTS error:', error);
      setIsSpeaking(false);
      speakWithBrowserVoice(text);
    }
  }, [voicePreferences, isEnabled, selectedAvatar, cleanTextForSpeech, speakWithBrowserVoice]);

  const stopSpeaking = useCallback(() => {
    // Stop OpenAI audio
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current = null;
    }
    // Stop browser synthesis
    if (voiceSupported) {
      window.speechSynthesis.cancel();
    }
    setIsSpeaking(false);
  }, [voiceSupported]);
  
  // Voice recognition methods (speech-to-text)
  const startListening = useCallback(() => {
    if (!voiceRecognition.isSupported || !recognitionRef.current) {
      setVoiceRecognition(prev => ({ 
        ...prev, 
        error: 'Voice recognition not supported on this device' 
      }));
      return;
    }
    
    try {
      // Stop any ongoing speech before listening
      stopSpeaking();
      recognitionRef.current.start();
    } catch (error: any) {
      if (error.name === 'InvalidStateError') {
        // Already listening, ignore
      } else {
        setVoiceRecognition(prev => ({ 
          ...prev, 
          error: 'Failed to start voice recognition' 
        }));
      }
    }
  }, [voiceRecognition.isSupported, stopSpeaking]);
  
  const stopListening = useCallback(() => {
    if (recognitionRef.current) {
      try {
        recognitionRef.current.stop();
      } catch (error) {
        // Ignore errors when stopping
      }
    }
    setVoiceRecognition(prev => ({ ...prev, isListening: false }));
  }, []);
  
  // Register callback for voice commands
  const onVoiceCommand = useCallback((callback: (command: VoiceCommand) => void) => {
    commandCallbacksRef.current.add(callback);
    
    // Return unsubscribe function
    return () => {
      commandCallbacksRef.current.delete(callback);
    };
  }, []);

  // Conversational AI state
  const [isThinking, setIsThinking] = useState(false);
  
  // Talk to Lot Buddy - send message to AI and get spoken response
  const talkToLotBuddy = useCallback(async (message: string): Promise<string> => {
    setIsThinking(true);
    try {
      const response = await fetch('/api/ai/voice', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          message,
          buddyName: customName || 'Lot Buddy',
          userName: undefined // Could pass user name if available
        })
      });
      
      const data = await response.json();
      const aiResponse = data.response || "I didn't catch that. Could you try again?";
      
      // Learn from this interaction
      learnFromUserInput(message);
      
      // Speak the response
      speak(aiResponse);
      
      return aiResponse;
    } catch (error) {
      console.error('Error talking to Lot Buddy:', error);
      const fallback = "Sorry, I'm having trouble connecting right now.";
      speak(fallback);
      return fallback;
    } finally {
      setIsThinking(false);
    }
  }, [customName, speak, learnFromUserInput]);
  
  // Start a voice conversation - listen, process, respond
  const startConversation = useCallback(() => {
    if (!voiceRecognition.isSupported || !recognitionRef.current) {
      speak("Voice recognition isn't available on this device.");
      return;
    }
    
    // Set up a one-time handler for this conversation turn
    const handleResult = async (event: any) => {
      const transcript = event.results[0][0].transcript;
      if (transcript) {
        await talkToLotBuddy(transcript);
      }
    };
    
    // Temporarily override the onresult handler for conversation mode
    const originalHandler = recognitionRef.current.onresult;
    recognitionRef.current.onresult = (event: any) => {
      handleResult(event);
      // Restore original handler after processing
      if (recognitionRef.current) {
        recognitionRef.current.onresult = originalHandler;
      }
    };
    
    startListening();
  }, [voiceRecognition.isSupported, speak, talkToLotBuddy, startListening]);

  const showPopup = useCallback((message: string, title?: string, duration: number = 6000) => {
    if (!isEnabled || !selectedAvatar) return;
    
    // Clear any existing timeout
    if (popupTimeout) {
      clearTimeout(popupTimeout);
    }
    
    // Alternate direction for variety
    const direction = Math.random() > 0.5 ? 'left' : 'right';
    
    // Use custom name if set, otherwise default
    const buddyTitle = customName || title || 'Lot Buddy';
    
    setPopupState({
      isVisible: true,
      message,
      title: buddyTitle,
      direction
    });
    
    // Speak the message if voice is enabled
    if (voicePreferences.enabled) {
      speak(message);
    }
    
    // Auto-hide after duration
    const timeout = setTimeout(() => {
      hidePopup();
    }, duration);
    setPopupTimeoutId(timeout);
  }, [isEnabled, selectedAvatar, customName, popupTimeout, voicePreferences.enabled, speak]);

  const hidePopup = useCallback(() => {
    if (popupTimeout) {
      clearTimeout(popupTimeout);
      setPopupTimeoutId(null);
    }
    setPopupState(prev => ({ ...prev, isVisible: false }));
    stopSpeaking();
  }, [popupTimeout, stopSpeaking]);

  // Surface coordination methods for FloatingScene
  const openPopupSurface = useCallback((message: string, title?: string, duration: number = 6000) => {
    setActiveSurface('popup');
    showPopup(message, title, duration);
  }, [showPopup]);

  const openChatSurface = useCallback(() => {
    setActiveSurface('chat');
    // Close popup if it's open
    hidePopup();
  }, [hidePopup]);

  const closeBuddySurface = useCallback(() => {
    setActiveSurface('none');
    hidePopup();
  }, [hidePopup]);

  // Full-screen interaction overlay methods
  const openInteractionOverlay = useCallback((mode: 'ai' | 'messaging') => {
    setInteractionMode(mode);
    setActiveSurface('none'); // Close any small popups
    hidePopup();
  }, [hidePopup]);

  const closeInteractionOverlay = useCallback(() => {
    setInteractionMode(null);
  }, []);

  return (
    <LotBuddyContext.Provider value={{
      selectedAvatar,
      setSelectedAvatar,
      customName,
      setCustomName,
      isEnabled,
      setIsEnabled,
      showPopup,
      hidePopup,
      popupState,
      availableAvatars,
      displayMode,
      setDisplayMode,
      visibilityPreference,
      setVisibilityPreference,
      expandMascot,
      minimizeMascot,
      voicePreferences,
      setVoicePreferences,
      speak,
      stopSpeaking,
      isSpeaking,
      voiceSupported,
      availableVoices,
      voiceRecognition,
      startListening,
      stopListening,
      onVoiceCommand,
      personality,
      setPersonality,
      getPersonalizedMessage,
      recordInteraction,
      learnFromUserInput,
      generateMirroredResponse,
      talkToLotBuddy,
      isThinking,
      startConversation,
      activeSurface,
      openPopupSurface,
      openChatSurface,
      closeBuddySurface,
      interactionMode,
      openInteractionOverlay,
      closeInteractionOverlay
    }}>
      {children}
    </LotBuddyContext.Provider>
  );
}

export function useLotBuddy() {
  const context = useContext(LotBuddyContext);
  if (!context) {
    throw new Error('useLotBuddy must be used within a LotBuddyProvider');
  }
  return context;
}
