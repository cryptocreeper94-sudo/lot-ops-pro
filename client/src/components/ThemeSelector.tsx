import { useState, useEffect } from "react";
import { useTheme } from "@/contexts/ThemeContext";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { 
  Accordion, 
  AccordionContent, 
  AccordionItem, 
  AccordionTrigger 
} from "@/components/ui/accordion";
import { CheckCircle2, Palette, Plus, Sparkles, Star, Crown } from "lucide-react";
import { ThemeRequestDialog } from "./ThemeRequestDialog";

const categoryLabels: Record<string, { label: string; icon: string; color: string }> = {
  classic: { label: "Classic Themes", icon: "🎨", color: "from-slate-600 to-slate-800" },
  nfl: { label: "NFL Teams", icon: "🏈", color: "from-green-600 to-green-800" },
  mlb: { label: "MLB Teams", icon: "⚾", color: "from-red-600 to-red-800" },
  nba: { label: "NBA Teams", icon: "🏀", color: "from-orange-600 to-orange-800" },
  nhl: { label: "NHL Teams", icon: "🏒", color: "from-blue-600 to-blue-800" },
  mls: { label: "MLS Teams", icon: "⚽", color: "from-emerald-600 to-emerald-800" },
  wsl: { label: "WSL Teams", icon: "⚽", color: "from-pink-600 to-pink-800" },
  epl: { label: "Premier League", icon: "🏴󠁧󠁢󠁥󠁮󠁧󠁿", color: "from-purple-600 to-purple-800" },
  laliga: { label: "La Liga", icon: "🇪🇸", color: "from-yellow-600 to-red-700" },
  bundesliga: { label: "Bundesliga", icon: "🇩🇪", color: "from-black to-red-800" },
  seriea: { label: "Serie A", icon: "🇮🇹", color: "from-green-700 to-red-700" },
  ligue1: { label: "Ligue 1", icon: "🇫🇷", color: "from-blue-700 to-red-700" },
  college: { label: "NCAA D1 College", icon: "🎓", color: "from-amber-600 to-amber-800" },
  golf: { label: "Golf", icon: "⛳", color: "from-green-500 to-green-700" },
  nature: { label: "Nature & Scenery", icon: "🌿", color: "from-teal-600 to-teal-800" }
};

const categoryOrder = [
  "classic", "nfl", "mlb", "nba", "nhl", "mls", "wsl", 
  "epl", "laliga", "bundesliga", "seriea", "ligue1", 
  "college", "golf", "nature"
];

export function ThemeSelector() {
  const { currentTheme, setTheme, availableThemes } = useTheme();
  const [requestDialogOpen, setRequestDialogOpen] = useState(false);
  const [user, setUser] = useState<any>(null);
  const [expandedCategories, setExpandedCategories] = useState<string[]>([]);

  useEffect(() => {
    const userStr = localStorage.getItem("vanops_user");
    if (userStr) {
      setUser(JSON.parse(userStr));
    }
  }, []);

  const themesByCategory = availableThemes.reduce((acc, theme) => {
    if (!acc[theme.category]) {
      acc[theme.category] = [];
    }
    acc[theme.category].push(theme);
    return acc;
  }, {} as Record<string, typeof availableThemes>);

  const sortedCategories = categoryOrder.filter(cat => themesByCategory[cat]?.length > 0);

  return (
    <div className="space-y-4 bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 rounded-2xl p-4 border border-slate-700/50 shadow-2xl">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="relative">
            <div className="absolute inset-0 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full blur-lg opacity-50 animate-pulse" />
            <div className="relative bg-gradient-to-br from-blue-500 to-purple-600 p-2.5 rounded-full">
              <Palette className="h-5 w-5 text-white" />
            </div>
          </div>
          <div>
            <h2 className="text-lg font-bold text-white flex items-center gap-2">
              Theme Gallery
              <Sparkles className="h-4 w-4 text-yellow-400 animate-pulse" />
            </h2>
            <p className="text-xs text-slate-400">
              300+ premium themes with team logos
            </p>
          </div>
        </div>
        <Button
          onClick={() => setRequestDialogOpen(true)}
          size="sm"
          className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-500 hover:to-purple-500 text-white border-0 shadow-lg shadow-purple-500/20"
          data-testid="button-request-theme"
        >
          <Plus className="h-3 w-3 mr-1" />
          Request
        </Button>
      </div>

      {/* Current Theme Display */}
      <div className="relative overflow-hidden rounded-xl bg-gradient-to-r from-blue-900/50 to-purple-900/50 border border-blue-500/30 p-3">
        <div className="absolute top-0 right-0 w-20 h-20 bg-gradient-to-br from-yellow-400/20 to-transparent rounded-full blur-2xl" />
        <div className="relative flex items-center gap-3">
          <div className="flex-shrink-0">
            <div 
              className={`w-12 h-12 rounded-lg bg-gradient-to-br ${currentTheme.colors.primary} border-2 border-white/20 shadow-lg`}
              style={{
                backgroundImage: currentTheme.watermark ? `url(${currentTheme.watermark})` : undefined,
                backgroundSize: "cover",
                backgroundPosition: "center",
                backgroundBlendMode: "overlay"
              }}
            />
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2">
              <Crown className="h-4 w-4 text-yellow-400" />
              <span className="text-sm font-bold text-white truncate">{currentTheme.name}</span>
            </div>
            <p className="text-xs text-blue-300">Currently Active</p>
          </div>
          <CheckCircle2 className="h-5 w-5 text-green-400 flex-shrink-0" />
        </div>
      </div>

      {/* Accordion Categories */}
      <Accordion 
        type="multiple" 
        value={expandedCategories}
        onValueChange={setExpandedCategories}
        className="space-y-2"
      >
        {sortedCategories.map((category) => {
          const themes = themesByCategory[category];
          const catInfo = categoryLabels[category];
          const hasCurrentTheme = themes.some(t => t.id === currentTheme.id);
          
          return (
            <AccordionItem 
              key={category} 
              value={category}
              className="border-0"
            >
              <AccordionTrigger 
                className={`
                  px-3 py-2.5 rounded-xl hover:no-underline transition-all duration-300
                  bg-gradient-to-r ${catInfo.color} 
                  hover:shadow-lg hover:shadow-${category === 'nfl' ? 'green' : 'blue'}-500/20
                  border border-white/10 hover:border-white/20
                  ${hasCurrentTheme ? 'ring-2 ring-yellow-400/50' : ''}
                `}
              >
                <div className="flex items-center gap-3 w-full">
                  <span className="text-xl">{catInfo.icon}</span>
                  <span className="text-sm font-bold text-white">{catInfo.label}</span>
                  <Badge 
                    className="ml-auto mr-2 bg-white/20 text-white border-white/30 text-xs px-2 py-0"
                  >
                    {themes.length}
                  </Badge>
                  {hasCurrentTheme && (
                    <Star className="h-4 w-4 text-yellow-400 fill-yellow-400" />
                  )}
                </div>
              </AccordionTrigger>
              
              <AccordionContent className="pt-3 pb-1">
                <div className="overflow-x-auto scrollbar-thin scrollbar-thumb-slate-600 scrollbar-track-transparent pb-2 -mx-1 px-1">
                  <div className="flex gap-2" style={{ minWidth: "max-content" }}>
                    {themes.map((theme) => {
                      const isSelected = currentTheme.id === theme.id;
                      return (
                        <button
                          key={theme.id}
                          onClick={() => setTheme(theme.id)}
                          className={`
                            group relative flex-shrink-0 w-20 rounded-xl overflow-hidden
                            transition-all duration-300 transform
                            ${isSelected 
                              ? 'ring-2 ring-yellow-400 shadow-lg shadow-yellow-400/30 scale-105' 
                              : 'hover:scale-105 hover:shadow-lg hover:shadow-blue-500/20 border border-slate-600/50 hover:border-blue-400/50'
                            }
                          `}
                          data-testid={`theme-${theme.id}`}
                        >
                          {/* Theme Preview */}
                          <div 
                            className={`h-14 bg-gradient-to-br ${theme.colors.primary} relative`}
                            style={{
                              backgroundImage: theme.watermark ? `url(${theme.watermark})` : undefined,
                              backgroundSize: "cover",
                              backgroundPosition: "center",
                              backgroundBlendMode: "overlay"
                            }}
                          >
                            {/* Shimmer overlay */}
                            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent opacity-0 group-hover:opacity-100 group-hover:animate-shimmer" />
                            
                            {isSelected && (
                              <div className="absolute top-1 right-1">
                                <div className="bg-yellow-400 rounded-full p-0.5">
                                  <CheckCircle2 className="h-3 w-3 text-slate-900" />
                                </div>
                              </div>
                            )}
                          </div>
                          
                          {/* Theme Name */}
                          <div className="p-1.5 bg-slate-800/90 backdrop-blur-sm">
                            <p className="text-[10px] font-medium text-white truncate text-center leading-tight">
                              {theme.name.replace(/^[^\w]*/, '').substring(0, 12)}
                            </p>
                          </div>
                        </button>
                      );
                    })}
                  </div>
                </div>
              </AccordionContent>
            </AccordionItem>
          );
        })}
      </Accordion>

      {/* Footer Stats */}
      <div className="flex items-center justify-center gap-4 pt-2 border-t border-slate-700/50">
        <div className="text-center">
          <p className="text-lg font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-purple-400">
            {availableThemes.length}+
          </p>
          <p className="text-[10px] text-slate-500 uppercase tracking-wide">Themes</p>
        </div>
        <div className="w-px h-8 bg-slate-700" />
        <div className="text-center">
          <p className="text-lg font-bold text-transparent bg-clip-text bg-gradient-to-r from-green-400 to-emerald-400">
            {sortedCategories.length}
          </p>
          <p className="text-[10px] text-slate-500 uppercase tracking-wide">Categories</p>
        </div>
        <div className="w-px h-8 bg-slate-700" />
        <div className="text-center">
          <p className="text-lg font-bold text-transparent bg-clip-text bg-gradient-to-r from-yellow-400 to-orange-400">
            ∞
          </p>
          <p className="text-[10px] text-slate-500 uppercase tracking-wide">Style</p>
        </div>
      </div>

      {user && (
        <ThemeRequestDialog
          open={requestDialogOpen}
          onOpenChange={setRequestDialogOpen}
          userId={user.phoneLast4 || user.pin || user.id?.toString() || "unknown"}
          userName={user.name || "User"}
        />
      )}
    </div>
  );
}
