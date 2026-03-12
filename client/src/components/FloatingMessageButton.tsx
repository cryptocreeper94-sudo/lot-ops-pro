import { useState } from "react";
import { MessageSquare, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ChatOverlay } from "@/components/ChatOverlay";
import { useQuery } from "@tanstack/react-query";

interface FloatingMessageButtonProps {
  role: "supervisor" | "driver";
  userId: string;
  userName?: string;
}

export function FloatingMessageButton({ role, userId, userName }: FloatingMessageButtonProps) {
  const [isOpen, setIsOpen] = useState(false);

  const { data: messages = [] } = useQuery<any[]>({
    queryKey: ['/api/messages', userId],
    queryFn: async () => {
      const response = await fetch(`/api/messages?driverNumber=${userId}`);
      if (!response.ok) throw new Error('Failed to fetch messages');
      return response.json();
    },
    refetchInterval: 3000,
  });

  const unreadCount = messages.filter((m: any) => !m.isRead && m.toId === userId).length;

  return (
    <>
      {/* Floating Button with Glow Effect - Position: bottom-right, aligned with Lot Buddy */}
      <div className="fixed bottom-4 right-4 z-50">
        <div className="relative group">
          {/* Animated glow ring */}
          <div 
            className={`
              absolute -inset-1.5 rounded-full blur-md transition-all duration-500
              ${isOpen 
                ? 'bg-gradient-to-r from-red-500 via-orange-500 to-red-500 opacity-70' 
                : 'bg-gradient-to-r from-blue-500 via-cyan-400 to-blue-500 opacity-60 group-hover:opacity-90'
              }
              ${!isOpen && 'animate-pulse'}
            `}
          />
          
          {/* Button */}
          <Button
            onClick={() => setIsOpen(!isOpen)}
            className={`
              relative h-12 w-12 rounded-full shadow-2xl
              ${isOpen 
                ? 'bg-gradient-to-br from-red-600 to-red-700 hover:from-red-700 hover:to-red-800' 
                : 'bg-gradient-to-br from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800'
              }
              transition-all duration-300 transform hover:scale-105 active:scale-95
              flex items-center justify-center
              border border-white/20
            `}
            data-testid="button-floating-messages"
          >
            {isOpen ? (
              <X className="h-5 w-5 text-white drop-shadow-lg" />
            ) : (
              <>
                <MessageSquare className="h-5 w-5 text-white drop-shadow-lg" />
                {unreadCount > 0 && (
                  <Badge 
                    variant="destructive" 
                    className="absolute -top-1 -right-1 h-5 w-5 flex items-center justify-center p-0 rounded-full bg-red-500 border-2 border-white text-[10px] font-bold animate-bounce"
                  >
                    {unreadCount}
                  </Badge>
                )}
              </>
            )}
          </Button>
          
          {/* Label tooltip */}
          <div className="absolute right-full mr-3 top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none">
            <span className="bg-slate-900/90 text-white text-xs px-2 py-1 rounded-md whitespace-nowrap backdrop-blur-sm border border-slate-700/50">
              Messages
            </span>
          </div>
        </div>
      </div>

      {/* Chat Overlay */}
      {isOpen && (
        <div className="fixed bottom-36 right-4 z-50 w-96 max-w-[calc(100vw-2rem)] h-[450px]">
          <ChatOverlay
            role={role}
            driverId={userId}
            driverName={userName}
          />
        </div>
      )}
    </>
  );
}
