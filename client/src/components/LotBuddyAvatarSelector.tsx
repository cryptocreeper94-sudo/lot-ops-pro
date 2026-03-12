import { motion, AnimatePresence } from 'framer-motion';
import { Check, User, Sparkles, ChevronLeft, ChevronRight, Pencil, Volume2, VolumeX, Mic } from 'lucide-react';
import { useLotBuddy } from '@/contexts/LotBuddyContext';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Slider } from '@/components/ui/slider';
import { useRef, useState } from 'react';

export function LotBuddyAvatarSelector() {
  const { 
    selectedAvatar, 
    setSelectedAvatar, 
    customName,
    setCustomName,
    isEnabled, 
    setIsEnabled, 
    availableAvatars,
    showPopup,
    voicePreferences,
    setVoicePreferences,
    speak,
    stopSpeaking,
    isSpeaking,
    voiceSupported,
    visibilityPreference,
    setVisibilityPreference
  } = useLotBuddy();
  
  const scrollRef = useRef<HTMLDivElement>(null);
  const [showNamingModal, setShowNamingModal] = useState(false);
  const [pendingAvatar, setPendingAvatar] = useState<typeof availableAvatars[0] | null>(null);
  const [tempName, setTempName] = useState('');
  const [showVoiceSettings, setShowVoiceSettings] = useState(false);
  
  const handleAvatarSelect = (avatar: typeof availableAvatars[0]) => {
    setPendingAvatar(avatar);
    setTempName(customName || '');
    setShowNamingModal(true);
  };
  
  const confirmSelection = () => {
    if (pendingAvatar) {
      setSelectedAvatar(pendingAvatar);
      // Always update name - if blank, use empty string to clear any previous custom name
      setCustomName(tempName.trim());
      setShowNamingModal(false);
      
      const buddyName = tempName.trim() || pendingAvatar.displayName;
      if (isEnabled) {
        showPopup(`Hey! I'm ${buddyName}. Ready to help you crush it today!`, buddyName, 4000);
      }
    }
  };
  
  const skipNaming = () => {
    if (pendingAvatar) {
      setSelectedAvatar(pendingAvatar);
      // Clear custom name when skipping - use default
      setCustomName('');
      setShowNamingModal(false);
      
      if (isEnabled) {
        showPopup(`I'm ready to help you today!`, pendingAvatar.displayName, 4000);
      }
    }
  };
  
  const testVoice = () => {
    const buddyName = customName || selectedAvatar?.displayName || 'Lot Buddy';
    speak(`Hi! I'm ${buddyName}. I'll be your assistant today. Let's get to work!`);
  };
  
  const scroll = (direction: 'left' | 'right') => {
    if (scrollRef.current) {
      const scrollAmount = 280;
      scrollRef.current.scrollBy({
        left: direction === 'left' ? -scrollAmount : scrollAmount,
        behavior: 'smooth'
      });
    }
  };
  
  const displayName = customName || selectedAvatar?.displayName || 'Lot Buddy';
  
  return (
    <>
      <Card className="relative overflow-hidden bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 border-emerald-500/40 shadow-[0_0_30px_rgba(16,185,129,0.15)]">
        {/* Animated background shimmer */}
        <div className="absolute inset-0 opacity-30">
          <div className="absolute inset-0 bg-[linear-gradient(45deg,transparent_25%,rgba(16,185,129,0.1)_50%,transparent_75%)] bg-[length:400%_400%] animate-[shimmer_3s_ease-in-out_infinite]" />
        </div>
        
        {/* Corner sparkles */}
        <Sparkles className="absolute top-3 right-3 w-4 h-4 text-emerald-400/60 animate-pulse" />
        <Sparkles className="absolute bottom-3 left-3 w-3 h-3 text-teal-400/40 animate-pulse" style={{ animationDelay: '0.5s' }} />
        
        <CardHeader className="relative pb-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <motion.div 
                className="p-2.5 rounded-xl bg-gradient-to-br from-emerald-500 via-teal-500 to-cyan-600 shadow-lg shadow-emerald-500/40"
                animate={{ 
                  boxShadow: ['0 10px 25px rgba(16,185,129,0.4)', '0 10px 35px rgba(16,185,129,0.6)', '0 10px 25px rgba(16,185,129,0.4)']
                }}
                transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
              >
                <User className="w-5 h-5 text-white drop-shadow-lg" />
              </motion.div>
              <div>
                <CardTitle className="text-lg bg-gradient-to-r from-white via-emerald-100 to-white bg-clip-text text-transparent font-bold">
                  Lot Buddy Avatar
                </CardTitle>
                <CardDescription className="text-slate-400 text-xs flex items-center gap-1">
                  <Sparkles className="w-3 h-3 text-emerald-500" />
                  Choose & name your assistant
                </CardDescription>
              </div>
            </div>
            
            {/* Premium Toggle */}
            <div className="flex items-center gap-2 bg-slate-800/60 rounded-full px-3 py-1.5 border border-slate-700/50">
              <Label htmlFor="lotbuddy-toggle" className="text-xs font-medium text-slate-300">
                {isEnabled ? 'Active' : 'Off'}
              </Label>
              <Switch
                id="lotbuddy-toggle"
                checked={isEnabled}
                onCheckedChange={setIsEnabled}
                className="data-[state=checked]:bg-gradient-to-r data-[state=checked]:from-emerald-500 data-[state=checked]:to-teal-500"
                data-testid="switch-lotbuddy-toggle"
              />
            </div>
          </div>
          
          {/* Visibility Preference Toggle */}
          {isEnabled && (
            <div className="flex items-center justify-between mt-3 pt-3 border-t border-slate-700/30">
              <div className="flex flex-col">
                <Label htmlFor="visibility-toggle" className="text-xs font-medium text-slate-300">
                  Always Visible
                </Label>
                <span className="text-[10px] text-slate-500">Keep Buddy visible instead of minimizing to tile</span>
              </div>
              <Switch
                id="visibility-toggle"
                checked={visibilityPreference === 'always_visible'}
                onCheckedChange={(checked) => setVisibilityPreference(checked ? 'always_visible' : 'minimize_to_tile')}
                className="data-[state=checked]:bg-gradient-to-r data-[state=checked]:from-amber-500 data-[state=checked]:to-orange-500"
                data-testid="switch-visibility-toggle"
              />
            </div>
          )}
        </CardHeader>
        
        <CardContent className="relative px-2 pb-3">
          {/* Scroll Buttons */}
          <motion.button
            onClick={() => scroll('left')}
            className="absolute left-0 top-1/2 -translate-y-1/2 z-20 w-8 h-16 bg-gradient-to-r from-slate-900 via-slate-900/95 to-transparent flex items-center justify-start pl-1"
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            data-testid="button-scroll-left"
          >
            <div className="w-6 h-6 rounded-full bg-emerald-500/80 flex items-center justify-center shadow-lg shadow-emerald-500/30">
              <ChevronLeft className="w-4 h-4 text-white" />
            </div>
          </motion.button>
          
          <motion.button
            onClick={() => scroll('right')}
            className="absolute right-0 top-1/2 -translate-y-1/2 z-20 w-8 h-16 bg-gradient-to-l from-slate-900 via-slate-900/95 to-transparent flex items-center justify-end pr-1"
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            data-testid="button-scroll-right"
          >
            <div className="w-6 h-6 rounded-full bg-emerald-500/80 flex items-center justify-center shadow-lg shadow-emerald-500/30">
              <ChevronRight className="w-4 h-4 text-white" />
            </div>
          </motion.button>
          
          {/* Horizontal Scroll Container */}
          <div 
            ref={scrollRef}
            className="flex gap-2 overflow-x-auto scrollbar-hide px-6 py-2 scroll-smooth snap-x snap-mandatory"
            style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
          >
            {availableAvatars.map((avatar, index) => {
              const isSelected = selectedAvatar?.id === avatar.id;
              
              return (
                <motion.button
                  key={avatar.id}
                  onClick={() => handleAvatarSelect(avatar)}
                  className={`relative flex-shrink-0 w-20 h-28 rounded-xl overflow-hidden border-2 transition-all duration-300 snap-center ${
                    isSelected
                      ? 'border-emerald-400 shadow-[0_0_20px_rgba(16,185,129,0.5)] ring-2 ring-emerald-400/50'
                      : 'border-slate-600/30 hover:border-emerald-500/50 hover:shadow-[0_0_15px_rgba(16,185,129,0.3)]'
                  } ${!isEnabled ? 'opacity-40 grayscale' : ''}`}
                  whileHover={{ scale: isEnabled ? 1.08 : 1, y: isEnabled ? -4 : 0 }}
                  whileTap={{ scale: isEnabled ? 0.95 : 1 }}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.02, duration: 0.3 }}
                  disabled={!isEnabled}
                  data-testid={`button-avatar-${avatar.id}`}
                >
                  {/* Gradient background */}
                  <div className="absolute inset-0 bg-gradient-to-b from-slate-700/50 via-slate-800 to-slate-900" />
                  
                  {/* Avatar Image */}
                  <img
                    src={`/lotbuddy_catalog/${avatar.filename}`}
                    alt={avatar.displayName}
                    className="relative w-full h-full object-cover object-top"
                    onError={(e) => {
                      (e.target as HTMLImageElement).style.display = 'none';
                    }}
                  />
                  
                  {/* Selection Glow Ring */}
                  {isSelected && (
                    <>
                      <motion.div
                        className="absolute inset-0 rounded-xl"
                        animate={{
                          boxShadow: ['inset 0 0 20px rgba(16,185,129,0.3)', 'inset 0 0 30px rgba(16,185,129,0.5)', 'inset 0 0 20px rgba(16,185,129,0.3)']
                        }}
                        transition={{ duration: 1.5, repeat: Infinity, ease: 'easeInOut' }}
                      />
                      <motion.div
                        className="absolute top-1 right-1 w-5 h-5 rounded-full bg-gradient-to-br from-emerald-400 to-teal-500 flex items-center justify-center shadow-lg shadow-emerald-500/50"
                        initial={{ scale: 0, rotate: -180 }}
                        animate={{ scale: 1, rotate: 0 }}
                        transition={{ type: 'spring', stiffness: 500, damping: 20 }}
                      >
                        <Check className="w-3 h-3 text-white" />
                      </motion.div>
                    </>
                  )}
                  
                  {/* Bottom badge - just number, no labels */}
                  <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/90 via-black/60 to-transparent px-1 py-1.5">
                    <p className="text-[9px] text-emerald-300 text-center font-bold tracking-wide">
                      #{avatar.id}
                    </p>
                  </div>
                </motion.button>
              );
            })}
          </div>
          
          {/* Count Badge */}
          <div className="flex justify-center mt-2">
            <div className="px-3 py-1 rounded-full bg-slate-800/80 border border-slate-700/50 flex items-center gap-2">
              <Sparkles className="w-3 h-3 text-emerald-400" />
              <span className="text-[10px] text-slate-300 font-medium">{availableAvatars.length} Characters Available</span>
            </div>
          </div>
          
          {/* Current Selection Preview with Name & Voice Controls */}
          {selectedAvatar && isEnabled && (
            <motion.div 
              className="mt-3 bg-gradient-to-r from-slate-800/80 via-emerald-900/20 to-slate-800/80 rounded-xl p-3 border border-emerald-500/30 shadow-lg shadow-emerald-500/10"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
            >
              <div className="flex items-center gap-3">
                <div className="relative">
                  <motion.div 
                    className="absolute -inset-1 rounded-full bg-gradient-to-r from-emerald-500 to-teal-500 opacity-60 blur-sm"
                    animate={{ opacity: [0.4, 0.7, 0.4] }}
                    transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
                  />
                  <img
                    src={`/lotbuddy_catalog/${selectedAvatar.filename}`}
                    alt={displayName}
                    className="relative w-14 h-14 rounded-full object-cover object-top border-2 border-emerald-400"
                  />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <p className="text-sm font-bold bg-gradient-to-r from-white to-emerald-200 bg-clip-text text-transparent truncate">
                      {displayName}
                    </p>
                    <button 
                      onClick={() => {
                        setTempName(customName);
                        setPendingAvatar(selectedAvatar);
                        setShowNamingModal(true);
                      }}
                      className="p-1 rounded-full bg-slate-700/50 hover:bg-emerald-500/30 transition-colors"
                      data-testid="button-edit-name"
                    >
                      <Pencil className="w-3 h-3 text-slate-400" />
                    </button>
                  </div>
                  <p className="text-[10px] text-slate-400 mt-0.5">
                    Your personal assistant
                  </p>
                </div>
                
                {/* Voice Controls */}
                {voiceSupported && (
                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => setShowVoiceSettings(!showVoiceSettings)}
                      className={`p-2 rounded-lg transition-all ${
                        voicePreferences.enabled 
                          ? 'bg-emerald-500/30 text-emerald-400' 
                          : 'bg-slate-700/50 text-slate-400'
                      }`}
                      data-testid="button-voice-settings"
                    >
                      {voicePreferences.enabled ? (
                        <Volume2 className="w-4 h-4" />
                      ) : (
                        <VolumeX className="w-4 h-4" />
                      )}
                    </button>
                    {isSpeaking && (
                      <motion.div
                        className="flex gap-0.5"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                      >
                        {[0, 1, 2].map(i => (
                          <motion.div
                            key={i}
                            className="w-1 h-3 bg-emerald-400 rounded-full"
                            animate={{ scaleY: [0.3, 1, 0.3] }}
                            transition={{ duration: 0.5, repeat: Infinity, delay: i * 0.1 }}
                          />
                        ))}
                      </motion.div>
                    )}
                  </div>
                )}
              </div>
              
              {/* Voice Settings Panel */}
              <AnimatePresence>
                {showVoiceSettings && voiceSupported && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    className="overflow-hidden"
                  >
                    <div className="mt-3 pt-3 border-t border-slate-700/50 space-y-3">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <Mic className="w-4 h-4 text-emerald-400" />
                          <span className="text-xs text-slate-300">Voice Output</span>
                        </div>
                        <Switch
                          checked={voicePreferences.enabled}
                          onCheckedChange={(enabled) => setVoicePreferences({ enabled })}
                          className="data-[state=checked]:bg-emerald-500"
                          data-testid="switch-voice-enabled"
                        />
                      </div>
                      
                      {voicePreferences.enabled && (
                        <>
                          {/* Voice Gender Selection */}
                          <div className="space-y-1.5">
                            <span className="text-[10px] text-slate-400">Voice Type</span>
                            <div className="flex gap-1.5">
                              {[
                                { value: 'auto', label: 'Auto', icon: '🎭' },
                                { value: 'male', label: 'Male', icon: '👨' },
                                { value: 'female', label: 'Female', icon: '👩' }
                              ].map((option) => (
                                <button
                                  key={option.value}
                                  onClick={() => setVoicePreferences({ gender: option.value as 'auto' | 'male' | 'female' })}
                                  className={`flex-1 py-1.5 px-2 rounded-lg text-[10px] font-medium transition-all ${
                                    voicePreferences.gender === option.value
                                      ? 'bg-gradient-to-r from-emerald-500/40 to-teal-500/40 text-emerald-300 border border-emerald-500/50'
                                      : 'bg-slate-700/50 text-slate-400 border border-slate-600/30 hover:border-emerald-500/30'
                                  }`}
                                  data-testid={`button-voice-gender-${option.value}`}
                                >
                                  <span className="mr-1">{option.icon}</span>
                                  {option.label}
                                </button>
                              ))}
                            </div>
                            <p className="text-[9px] text-slate-500 mt-0.5">
                              {voicePreferences.gender === 'auto' 
                                ? 'Voice matches your avatar' 
                                : `Using ${voicePreferences.gender} voice`}
                            </p>
                          </div>
                          
                          <div className="space-y-1">
                            <div className="flex justify-between text-[10px]">
                              <span className="text-slate-400">Speed</span>
                              <span className="text-emerald-400">{voicePreferences.rate.toFixed(1)}x</span>
                            </div>
                            <Slider
                              value={[voicePreferences.rate]}
                              onValueChange={([rate]) => setVoicePreferences({ rate })}
                              min={0.5}
                              max={2}
                              step={0.1}
                              className="h-1"
                              data-testid="slider-voice-rate"
                            />
                          </div>
                          
                          <div className="space-y-1">
                            <div className="flex justify-between text-[10px]">
                              <span className="text-slate-400">Volume</span>
                              <span className="text-emerald-400">{Math.round(voicePreferences.volume * 100)}%</span>
                            </div>
                            <Slider
                              value={[voicePreferences.volume]}
                              onValueChange={([volume]) => setVoicePreferences({ volume })}
                              min={0}
                              max={1}
                              step={0.1}
                              className="h-1"
                              data-testid="slider-voice-volume"
                            />
                          </div>
                          
                          <Button
                            onClick={isSpeaking ? stopSpeaking : testVoice}
                            size="sm"
                            variant="outline"
                            className="w-full h-8 text-xs border-emerald-500/30 hover:bg-emerald-500/20"
                            data-testid="button-test-voice"
                          >
                            {isSpeaking ? 'Stop' : 'Test Voice'}
                          </Button>
                        </>
                      )}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          )}
        </CardContent>
        
        {/* Custom CSS for shimmer animation */}
        <style>{`
          @keyframes shimmer {
            0% { background-position: 200% 0; }
            100% { background-position: -200% 0; }
          }
          .scrollbar-hide::-webkit-scrollbar {
            display: none;
          }
        `}</style>
      </Card>
      
      {/* Naming Modal */}
      <AnimatePresence>
        {showNamingModal && pendingAvatar && (
          <motion.div
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setShowNamingModal(false)}
          >
            <motion.div
              className="w-full max-w-sm bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 rounded-2xl border border-emerald-500/40 shadow-2xl shadow-emerald-500/20 overflow-hidden"
              initial={{ scale: 0.9, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.9, opacity: 0, y: 20 }}
              onClick={(e) => e.stopPropagation()}
            >
              {/* Header with Avatar Preview */}
              <div className="relative bg-gradient-to-br from-emerald-600/30 via-teal-600/20 to-cyan-600/30 p-6 text-center">
                <Sparkles className="absolute top-3 right-3 w-5 h-5 text-emerald-400/60 animate-pulse" />
                <Sparkles className="absolute top-6 left-4 w-3 h-3 text-teal-400/40 animate-pulse" style={{ animationDelay: '0.3s' }} />
                
                <motion.div 
                  className="relative w-24 h-24 mx-auto mb-3"
                  animate={{ y: [0, -6, 0] }}
                  transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
                >
                  <div className="absolute inset-0 rounded-full bg-gradient-to-r from-emerald-500 via-teal-500 to-cyan-500 blur-lg opacity-50" />
                  <img
                    src={`/lotbuddy_catalog/${pendingAvatar.filename}`}
                    alt={pendingAvatar.displayName}
                    className="relative w-full h-full rounded-full object-cover object-top border-4 border-emerald-400 shadow-xl"
                  />
                </motion.div>
                
                <h3 className="text-lg font-bold bg-gradient-to-r from-white via-emerald-100 to-white bg-clip-text text-transparent">
                  Name Your Buddy
                </h3>
                <p className="text-xs text-slate-400 mt-1">
                  Give your assistant a personal name
                </p>
              </div>
              
              {/* Input Section */}
              <div className="p-5 space-y-4">
                <div className="space-y-2">
                  <Label className="text-xs text-slate-400">Buddy Name</Label>
                  <Input
                    value={tempName}
                    onChange={(e) => setTempName(e.target.value)}
                    placeholder="e.g., Max, Luna, Buddy..."
                    className="bg-slate-800/60 border-slate-700 focus:border-emerald-500 text-white placeholder:text-slate-500"
                    maxLength={20}
                    autoFocus
                    data-testid="input-buddy-name"
                  />
                  <p className="text-[10px] text-slate-500">
                    Leave blank for default: {pendingAvatar.displayName}
                  </p>
                </div>
                
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    className="flex-1 border-slate-600 hover:bg-slate-700"
                    onClick={() => setShowNamingModal(false)}
                    data-testid="button-cancel-naming"
                  >
                    Cancel
                  </Button>
                  <Button
                    className="flex-1 bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 text-white font-bold"
                    onClick={confirmSelection}
                    data-testid="button-confirm-naming"
                  >
                    <Sparkles className="w-4 h-4 mr-2" />
                    Confirm
                  </Button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}

export default LotBuddyAvatarSelector;
