import { useQuery } from "@tanstack/react-query";

interface Message {
  id: number;
  fromId: string;
  toId: string | null;
  content: string;
  timestamp: string;
  isRead: boolean;
}

export function useUnreadMessages(driverId: string) {
  return useQuery<number>({
    queryKey: ["unreadCount", driverId],
    queryFn: async () => {
      const res = await fetch(`/api/messages/${driverId}`);
      const messages: Message[] = await res.json();
      return messages.filter(m => !m.isRead).length;
    },
    refetchInterval: 10000, // Check every 10 seconds
    enabled: !!driverId
  });
}
