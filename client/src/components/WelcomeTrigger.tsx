import { useEffect, useRef } from "react";
import { useMascot } from "./MascotGuideContext";

interface WelcomeTriggerProps {
  userName?: string;
  userRole?: string;
}

export function WelcomeTrigger({ userName, userRole }: WelcomeTriggerProps) {
  const { showWelcome, dismissedToday } = useMascot();
  const hasTriggered = useRef(false);

  useEffect(() => {
    if (hasTriggered.current || dismissedToday) return;
    
    const user = userName || (() => {
      try {
        const stored = localStorage.getItem("vanops_user");
        return stored ? JSON.parse(stored).name : "there";
      } catch {
        return "there";
      }
    })();

    const role = userRole || (() => {
      try {
        const stored = localStorage.getItem("vanops_user");
        return stored ? JSON.parse(stored).role : "driver";
      } catch {
        return "driver";
      }
    })();

    const timer = setTimeout(() => {
      showWelcome(user, role);
      hasTriggered.current = true;
    }, 1500);

    return () => clearTimeout(timer);
  }, [userName, userRole, showWelcome, dismissedToday]);

  return null;
}

export default WelcomeTrigger;
