import { useQuery } from "@tanstack/react-query";
import { Badge } from "@/components/ui/badge";
import { Calendar } from "lucide-react";

interface WeeklyMap {
  id: number;
  weekNumber: number;
  year: number;
  effectiveDate: string | null;
  isActive: boolean;
}

export function ActiveWeekBanner() {
  const { data: maps = [] } = useQuery<WeeklyMap[]>({
    queryKey: ["/api/weekly-maps"],
  });

  const activeMap = maps.find(m => m.isActive);

  if (!activeMap) return null;

  return (
    <div className="bg-purple-900/30 border border-purple-500/30 rounded px-2 py-1 flex items-center justify-between text-xs">
      <div className="flex items-center gap-1.5">
        <Calendar className="h-3 w-3 text-purple-300" />
        <span className="text-purple-100">
          Week {activeMap.weekNumber}
        </span>
      </div>
      <Badge variant="outline" className="bg-purple-600 text-white border-none text-[10px] py-0 px-1.5">
        ACTIVE
      </Badge>
    </div>
  );
}
