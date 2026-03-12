import { useState, useEffect, useCallback, createContext, useContext, ReactNode } from "react";
import { useQuery } from "@tanstack/react-query";
import { DriverPopup, sarcasticMessages } from "./DriverPopup";

interface Driver {
  id: number;
  name: string;
  avatarUrl?: string;
  profilePhoto?: string;
}

interface PopupGameContextType {
  isEnabled: boolean;
  setIsEnabled: (enabled: boolean) => void;
  triggerRandomPopup: () => void;
  driversWithAvatars: Driver[];
  popupInterval: number;
  setPopupInterval: (ms: number) => void;
}

const PopupGameContext = createContext<PopupGameContextType | null>(null);

export function usePopupGame() {
  const context = useContext(PopupGameContext);
  if (!context) {
    throw new Error("usePopupGame must be used within PopupGameProvider");
  }
  return context;
}

interface PopupGameProviderProps {
  children: ReactNode;
  defaultEnabled?: boolean;
  defaultInterval?: number;
}

export function PopupGameProvider({ 
  children, 
  defaultEnabled = false,
  defaultInterval = 45000 
}: PopupGameProviderProps) {
  const [isEnabled, setIsEnabled] = useState(() => {
    const saved = localStorage.getItem('popup_game_enabled');
    return saved !== null ? saved === 'true' : defaultEnabled;
  });
  
  const [popupInterval, setPopupInterval] = useState(() => {
    const saved = localStorage.getItem('popup_game_interval');
    return saved ? parseInt(saved, 10) : defaultInterval;
  });

  const [currentPopup, setCurrentPopup] = useState<{
    driverName: string;
    avatarUrl?: string;
    message: string;
  } | null>(null);

  const { data: driversWithAvatars = [] } = useQuery<Driver[]>({
    queryKey: ["/api/drivers-with-avatars"],
    queryFn: async () => {
      try {
        const res = await fetch("/api/drivers-with-avatars");
        if (!res.ok) return [];
        return await res.json();
      } catch {
        return [];
      }
    },
    enabled: isEnabled,
    refetchInterval: 60000,
  });

  const triggerRandomPopup = useCallback(() => {
    if (driversWithAvatars.length === 0) return;
    
    const randomDriver = driversWithAvatars[Math.floor(Math.random() * driversWithAvatars.length)];
    const randomMessage = sarcasticMessages[Math.floor(Math.random() * sarcasticMessages.length)];
    
    setCurrentPopup({
      driverName: randomDriver.name,
      avatarUrl: randomDriver.avatarUrl || randomDriver.profilePhoto,
      message: randomMessage
    });
  }, [driversWithAvatars]);

  useEffect(() => {
    localStorage.setItem('popup_game_enabled', String(isEnabled));
  }, [isEnabled]);

  useEffect(() => {
    localStorage.setItem('popup_game_interval', String(popupInterval));
  }, [popupInterval]);

  useEffect(() => {
    if (!isEnabled || driversWithAvatars.length === 0) return;

    const interval = setInterval(() => {
      if (Math.random() > 0.3) {
        triggerRandomPopup();
      }
    }, popupInterval);

    return () => clearInterval(interval);
  }, [isEnabled, popupInterval, driversWithAvatars.length, triggerRandomPopup]);

  const handleClosePopup = useCallback(() => {
    setCurrentPopup(null);
  }, []);

  return (
    <PopupGameContext.Provider value={{
      isEnabled,
      setIsEnabled,
      triggerRandomPopup,
      driversWithAvatars,
      popupInterval,
      setPopupInterval
    }}>
      {children}
      {currentPopup && (
        <DriverPopup
          driverName={currentPopup.driverName}
          avatarUrl={currentPopup.avatarUrl}
          message={currentPopup.message}
          onClose={handleClosePopup}
          duration={6000}
        />
      )}
    </PopupGameContext.Provider>
  );
}

interface PopupGameToggleProps {
  className?: string;
  showLabel?: boolean;
}

export function PopupGameToggle({ className = "", showLabel = true }: PopupGameToggleProps) {
  const { isEnabled, setIsEnabled, driversWithAvatars, triggerRandomPopup } = usePopupGame();
  
  return (
    <div className={`flex items-center gap-3 ${className}`}>
      {showLabel && (
        <label className="text-sm font-medium text-slate-700">
          Team Pop-ups
          <span className="text-xs text-slate-500 ml-1">({driversWithAvatars.length} avatars)</span>
        </label>
      )}
      <button
        onClick={() => setIsEnabled(!isEnabled)}
        className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
          isEnabled 
            ? 'bg-gradient-to-r from-purple-500 to-blue-500' 
            : 'bg-slate-300'
        }`}
        data-testid="toggle-popup-game"
      >
        <span
          className={`inline-block h-4 w-4 transform rounded-full bg-white shadow-md transition-transform ${
            isEnabled ? 'translate-x-6' : 'translate-x-1'
          }`}
        />
      </button>
      {isEnabled && (
        <button
          onClick={triggerRandomPopup}
          className="text-xs px-2 py-1 bg-purple-100 text-purple-700 rounded hover:bg-purple-200 transition-colors"
          data-testid="button-trigger-popup"
        >
          Test
        </button>
      )}
    </div>
  );
}

export function PopupGameSettings() {
  const { popupInterval, setPopupInterval, isEnabled, driversWithAvatars } = usePopupGame();
  
  const intervals = [
    { label: "30 sec", value: 30000 },
    { label: "45 sec", value: 45000 },
    { label: "1 min", value: 60000 },
    { label: "2 min", value: 120000 },
    { label: "5 min", value: 300000 },
  ];

  if (!isEnabled) return null;

  return (
    <div className="p-4 bg-gradient-to-r from-purple-50 to-blue-50 rounded-lg border border-purple-200">
      <h4 className="font-semibold text-slate-900 mb-3 flex items-center gap-2">
        🎮 Team Avatar Pop-up Game
        <span className="text-xs bg-purple-100 text-purple-700 px-2 py-0.5 rounded-full">
          {driversWithAvatars.length} players
        </span>
      </h4>
      
      <div className="space-y-3">
        <div>
          <label className="text-sm text-slate-600 block mb-1">Pop-up Frequency</label>
          <div className="flex flex-wrap gap-2">
            {intervals.map(({ label, value }) => (
              <button
                key={value}
                onClick={() => setPopupInterval(value)}
                className={`px-3 py-1.5 text-xs rounded-full transition-all ${
                  popupInterval === value
                    ? 'bg-gradient-to-r from-purple-500 to-blue-500 text-white shadow-md'
                    : 'bg-white text-slate-600 border border-slate-200 hover:border-purple-300'
                }`}
                data-testid={`button-interval-${value}`}
              >
                {label}
              </button>
            ))}
          </div>
        </div>
        
        <p className="text-xs text-slate-500">
          Random teammate avatars will pop up with fun messages to keep the energy going!
        </p>
      </div>
    </div>
  );
}
