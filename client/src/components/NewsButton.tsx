import { Newspaper } from "lucide-react";
import { Button } from "@/components/ui/button";

export function NewsButton() {
  const handleClick = () => {
    window.open("https://fox17.com/", "_blank", "noopener,noreferrer");
  };

  return (
    <Button
      variant="ghost"
      onClick={handleClick}
      className="fixed bottom-20 left-4 bg-red-600/90 hover:bg-red-700 text-white rounded-xl px-3 py-2 shadow-lg z-50 flex items-center gap-2"
      data-testid="button-news"
      title="Fox 17 Nashville News"
    >
      <Newspaper className="h-5 w-5" />
      <div className="text-left">
        <div className="text-sm font-bold">FOX 17</div>
        <div className="text-[10px] text-red-200">News</div>
      </div>
    </Button>
  );
}
