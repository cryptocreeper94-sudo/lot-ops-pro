import { useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useLocation } from "wouter";
import { 
  ArrowLeft, User, Car, TreePine, Palette, Check, 
  ChevronRight, Sparkles, Building2, MapPin
} from "lucide-react";
import nashvilleSkyline from "@assets/generated_images/nashville_scene_pwa_splash.png";
import atlantaSkyline from "@assets/generated_images/atlanta_skyline_pwa_splash.png";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area";
import { useLotBuddy } from "@/contexts/LotBuddyContext";
import { useTheme } from "@/contexts/ThemeContext";
import { allThemes } from "@/data/themes";
import { VEHICLE_CATALOG, TREE_CATALOG, BUILDING_CATALOG } from "@/components/FloatingScene";
import { useToast } from "@/hooks/use-toast";

type ThemeCategory = "all" | "classic" | "nature" | "nfl" | "mlb" | "nba" | "nhl" | "mls" | "epl" | "laliga" | "bundesliga" | "seriea" | "ligue1" | "wsl" | "college" | "golf";

// City Scene options for PWA customization
const CITY_SCENES = [
  { id: "nashville", name: "Nashville", state: "TN", image: nashvilleSkyline, available: true },
  { id: "atlanta", name: "Atlanta", state: "GA", image: atlantaSkyline, available: true },
  { id: "dallas", name: "Dallas", state: "TX", image: null, available: false },
  { id: "houston", name: "Houston", state: "TX", image: null, available: false },
  { id: "phoenix", name: "Phoenix", state: "AZ", image: null, available: false },
  { id: "chicago", name: "Chicago", state: "IL", image: null, available: false },
  { id: "denver", name: "Denver", state: "CO", image: null, available: false },
  { id: "los_angeles", name: "Los Angeles", state: "CA", image: null, available: false },
  { id: "toronto", name: "Toronto", state: "ON", image: null, available: false },
  { id: "riverside", name: "Riverside", state: "CA", image: null, available: false },
  { id: "tampa", name: "Tampa", state: "FL", image: null, available: false },
  { id: "orlando", name: "Orlando", state: "FL", image: null, available: false },
];

const THEME_CATEGORIES: { id: ThemeCategory; name: string; icon?: string }[] = [
  { id: "all", name: "All" },
  { id: "classic", name: "Classic" },
  { id: "nature", name: "Nature" },
  { id: "nfl", name: "NFL" },
  { id: "nba", name: "NBA" },
  { id: "mlb", name: "MLB" },
  { id: "nhl", name: "NHL" },
  { id: "mls", name: "MLS" },
  { id: "epl", name: "Premier League" },
  { id: "laliga", name: "La Liga" },
  { id: "bundesliga", name: "Bundesliga" },
  { id: "seriea", name: "Serie A" },
  { id: "ligue1", name: "Ligue 1" },
  { id: "wsl", name: "WSL" },
  { id: "college", name: "College" },
  { id: "golf", name: "Golf" },
];

export default function Customize() {
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const { selectedAvatar, setSelectedAvatar, availableAvatars, customName } = useLotBuddy();
  const { currentTheme, setTheme } = useTheme();
  
  const [selectedCategory, setSelectedCategory] = useState<ThemeCategory>("all");
  const [selectedVehicle, setSelectedVehicle] = useState(() => {
    return localStorage.getItem("lotops_selected_vehicle") || "porsche_911_silver";
  });
  const [selectedTree, setSelectedTree] = useState(() => {
    return localStorage.getItem("lotops_selected_tree") || "palm_tree";
  });
  const [selectedBuilding, setSelectedBuilding] = useState(() => {
    return localStorage.getItem("lotops_selected_building") || "garage";
  });
  const [selectedCityScene, setSelectedCityScene] = useState(() => {
    return localStorage.getItem("lotops_selected_city_scene") || "nashville";
  });

  const filteredThemes = useMemo(() => {
    if (selectedCategory === "all") return allThemes;
    return allThemes.filter(t => t.category === selectedCategory);
  }, [selectedCategory]);

  const handleVehicleSelect = (vehicleId: string) => {
    const vehicle = VEHICLE_CATALOG.find(v => v.id === vehicleId);
    setSelectedVehicle(vehicleId);
    localStorage.setItem("lotops_selected_vehicle", vehicleId);
    window.dispatchEvent(new CustomEvent('lotops-vehicle-changed', { detail: vehicleId }));
    toast({
      title: "Vehicle Saved",
      description: vehicle ? `${vehicle.displayName} is now your vehicle` : "Your vehicle has been updated",
    });
  };

  const handleTreeSelect = (treeId: string) => {
    const tree = TREE_CATALOG.find(t => t.id === treeId);
    setSelectedTree(treeId);
    localStorage.setItem("lotops_selected_tree", treeId);
    window.dispatchEvent(new CustomEvent('lotops-tree-changed', { detail: treeId }));
    toast({
      title: "Tree Saved", 
      description: tree ? `${tree.displayName} is now in your scene` : "Your tree has been updated",
    });
  };

  const handleBuildingSelect = (buildingId: string) => {
    const building = BUILDING_CATALOG.find(b => b.id === buildingId);
    setSelectedBuilding(buildingId);
    localStorage.setItem("lotops_selected_building", buildingId);
    window.dispatchEvent(new CustomEvent('lotops-building-changed', { detail: buildingId }));
    toast({
      title: "Building Saved", 
      description: building ? `${building.displayName} is now your headquarters` : "Your building has been updated",
    });
  };

  const handleCitySceneSelect = (cityId: string) => {
    const city = CITY_SCENES.find(c => c.id === cityId);
    if (!city?.available) {
      toast({
        title: "City Scene Available",
        description: `${city?.name} skyline can be added to your PWA`,
      });
      return;
    }
    setSelectedCityScene(cityId);
    localStorage.setItem("lotops_selected_city_scene", cityId);
    window.dispatchEvent(new CustomEvent('lotops-city-changed', { detail: cityId }));
    toast({
      title: "City Scene Saved",
      description: `${city.name} is now your PWA background`,
    });
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="sticky top-0 z-50 bg-background/95 backdrop-blur-sm border-b">
        <div className="flex items-center gap-3 p-4">
          <Button 
            variant="ghost" 
            size="icon"
            onClick={() => setLocation("/")}
            data-testid="button-back"
          >
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div>
            <h1 className="text-xl font-bold">Customize</h1>
            <p className="text-xs text-muted-foreground">Personalize your experience</p>
          </div>
        </div>
      </div>

      <div className="p-4 space-y-4 pb-24">
        {/* Bento Grid - Top Row */}
        <div className="grid grid-cols-2 gap-3">
          {/* My Buddy Tile */}
          <Card className="p-3 space-y-2" data-testid="tile-buddy">
            <div className="flex items-center gap-2">
              <div className="p-1.5 rounded-lg bg-emerald-500/20">
                <User className="h-4 w-4 text-emerald-500" />
              </div>
              <span className="font-semibold text-sm">My Buddy</span>
            </div>
            
            <ScrollArea className="w-full">
              <div className="flex gap-2 pb-2">
                {availableAvatars.slice(0, 12).map((avatar) => (
                  <motion.button
                    key={avatar.id}
                    onClick={() => setSelectedAvatar(avatar)}
                    className={`relative shrink-0 w-14 h-14 rounded-xl overflow-hidden border-2 transition-all ${
                      selectedAvatar?.id === avatar.id 
                        ? 'border-emerald-500 ring-2 ring-emerald-500/30' 
                        : 'border-transparent hover:border-muted-foreground/30'
                    }`}
                    whileTap={{ scale: 0.95 }}
                    data-testid={`avatar-option-${avatar.id}`}
                  >
                    <img 
                      src={`/lotbuddy_catalog/${avatar.filename}`}
                      alt={avatar.displayName}
                      className="w-full h-full object-cover"
                    />
                    {selectedAvatar?.id === avatar.id && (
                      <div className="absolute bottom-0 right-0 p-0.5 bg-emerald-500 rounded-tl-lg">
                        <Check className="h-2.5 w-2.5 text-white" />
                      </div>
                    )}
                  </motion.button>
                ))}
              </div>
              <ScrollBar orientation="horizontal" />
            </ScrollArea>
            
            {selectedAvatar && (
              <p className="text-xs text-muted-foreground truncate">
                {customName || selectedAvatar.displayName}
              </p>
            )}
          </Card>

          {/* My Vehicle Tile */}
          <Card className="p-3 space-y-2" data-testid="tile-vehicle">
            <div className="flex items-center gap-2">
              <div className="p-1.5 rounded-lg bg-blue-500/20">
                <Car className="h-4 w-4 text-blue-500" />
              </div>
              <span className="font-semibold text-sm">My Vehicle</span>
            </div>
            
            <ScrollArea className="w-full">
              <div className="flex gap-2 pb-2">
                {VEHICLE_CATALOG.map((vehicle) => (
                  <motion.button
                    key={vehicle.id}
                    onClick={() => handleVehicleSelect(vehicle.id)}
                    className={`relative shrink-0 w-16 h-12 rounded-lg overflow-hidden border-2 bg-muted/50 transition-all ${
                      selectedVehicle === vehicle.id 
                        ? 'border-blue-500 ring-2 ring-blue-500/30' 
                        : 'border-transparent hover:border-muted-foreground/30'
                    }`}
                    whileTap={{ scale: 0.95 }}
                    data-testid={`vehicle-option-${vehicle.id}`}
                  >
                    <img 
                      src={`/vehicle_catalog/${vehicle.filename}`}
                      alt={vehicle.displayName}
                      className="w-full h-full object-contain p-1"
                    />
                    {selectedVehicle === vehicle.id && (
                      <div className="absolute bottom-0 right-0 p-0.5 bg-blue-500 rounded-tl-lg">
                        <Check className="h-2.5 w-2.5 text-white" />
                      </div>
                    )}
                  </motion.button>
                ))}
              </div>
              <ScrollBar orientation="horizontal" />
            </ScrollArea>
          </Card>
        </div>

        {/* Bento Grid - Second Row */}
        <div className="grid grid-cols-2 gap-3">
          {/* Scene Elements Tile */}
          <Card className="p-3 space-y-2" data-testid="tile-scene">
            <div className="flex items-center gap-2">
              <div className="p-1.5 rounded-lg bg-green-500/20">
                <TreePine className="h-4 w-4 text-green-500" />
              </div>
              <span className="font-semibold text-sm">My Scene</span>
            </div>
            
            <div className="grid grid-cols-2 gap-2">
              {TREE_CATALOG.map((tree) => (
                <motion.button
                  key={tree.id}
                  onClick={() => handleTreeSelect(tree.id)}
                  className={`flex flex-col items-center gap-1 p-2 rounded-lg border-2 transition-all ${
                    selectedTree === tree.id 
                      ? 'border-green-500 bg-green-500/10' 
                      : 'border-muted hover:border-muted-foreground/30'
                  }`}
                  whileTap={{ scale: 0.95 }}
                  data-testid={`tree-option-${tree.id}`}
                >
                  <img 
                    src={`/scene_assets/${tree.filename}`}
                    alt={tree.displayName}
                    className="w-8 h-8 object-contain"
                  />
                  <span className="text-[10px] text-muted-foreground">{tree.displayName}</span>
                </motion.button>
              ))}
            </div>
          </Card>

          {/* My Building Tile */}
          <Card className="p-3 space-y-2" data-testid="tile-building">
            <div className="flex items-center gap-2">
              <div className="p-1.5 rounded-lg bg-amber-500/20">
                <Building2 className="h-4 w-4 text-amber-500" />
              </div>
              <span className="font-semibold text-sm">My Building</span>
            </div>
            
            <ScrollArea className="h-[140px]">
              <div className="grid grid-cols-2 gap-2 pr-2">
                {BUILDING_CATALOG.map((building) => (
                  <motion.button
                    key={building.id}
                    onClick={() => handleBuildingSelect(building.id)}
                    className={`flex flex-col items-center gap-1 p-2 rounded-lg border-2 transition-all ${
                      selectedBuilding === building.id 
                        ? 'border-amber-500 bg-amber-500/10' 
                        : 'border-muted hover:border-muted-foreground/30'
                    }`}
                    whileTap={{ scale: 0.95 }}
                    data-testid={`building-option-${building.id}`}
                  >
                    <img 
                      src={`/scene_assets/${building.filename}`}
                      alt={building.displayName}
                      className="w-10 h-10 object-contain"
                    />
                    <span className="text-[10px] text-muted-foreground text-center leading-tight">{building.displayName}</span>
                  </motion.button>
                ))}
              </div>
            </ScrollArea>
          </Card>
        </div>

        {/* City Scenes - PWA Customization */}
        <Card className="p-3 space-y-3" data-testid="tile-city-scenes">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="p-1.5 rounded-lg bg-cyan-500/20">
                <MapPin className="h-4 w-4 text-cyan-500" />
              </div>
              <span className="font-semibold text-sm">City Scenes</span>
            </div>
            <Badge variant="secondary" className="text-xs">
              PWA Background
            </Badge>
          </div>
          
          <p className="text-xs text-muted-foreground">
            Customize your app icon with your city skyline
          </p>
          
          <ScrollArea className="w-full">
            <div className="flex gap-3 pb-2">
              {CITY_SCENES.map((city) => (
                <motion.button
                  key={city.id}
                  onClick={() => handleCitySceneSelect(city.id)}
                  className={`relative shrink-0 w-24 rounded-lg overflow-hidden border-2 transition-all ${
                    selectedCityScene === city.id && city.available
                      ? 'border-cyan-500 ring-2 ring-cyan-500/30' 
                      : city.available 
                        ? 'border-transparent hover:border-muted-foreground/30' 
                        : 'border-dashed border-muted-foreground/30 opacity-70'
                  }`}
                  whileTap={{ scale: 0.95 }}
                  data-testid={`city-option-${city.id}`}
                >
                  <div className="aspect-square bg-gradient-to-br from-slate-700 to-slate-900 flex items-center justify-center">
                    {city.image ? (
                      <img 
                        src={city.image}
                        alt={city.name}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="text-center p-2">
                        <MapPin className="h-6 w-6 mx-auto text-muted-foreground/50 mb-1" />
                        <span className="text-[8px] text-muted-foreground/50">Available</span>
                      </div>
                    )}
                  </div>
                  <div className="p-1.5 bg-background/95 text-center">
                    <span className="text-[10px] font-medium">{city.name}</span>
                    <span className="text-[8px] text-muted-foreground ml-1">{city.state}</span>
                  </div>
                  {selectedCityScene === city.id && city.available && (
                    <div className="absolute top-1 right-1 p-0.5 bg-cyan-500 rounded-full">
                      <Check className="h-2.5 w-2.5 text-white" />
                    </div>
                  )}
                </motion.button>
              ))}
            </div>
            <ScrollBar orientation="horizontal" />
          </ScrollArea>
        </Card>

        {/* Bento Grid - Third Row (Theme Preview standalone) */}
        <div className="grid grid-cols-1 gap-3">
          {/* Current Theme Preview */}
          <Card className="p-3 space-y-2" data-testid="tile-current-theme">
            <div className="flex items-center gap-2">
              <div className="p-1.5 rounded-lg bg-purple-500/20">
                <Sparkles className="h-4 w-4 text-purple-500" />
              </div>
              <span className="font-semibold text-sm">Current Theme</span>
            </div>
            
            <div 
              className={`relative h-20 rounded-lg overflow-hidden bg-gradient-to-br ${currentTheme?.colors?.primary || 'from-slate-900 to-slate-800'}`}
            >
              {currentTheme?.watermark && (
                <img 
                  src={currentTheme.watermark}
                  alt=""
                  className="absolute inset-0 w-full h-full object-cover opacity-30"
                />
              )}
              <div className="absolute inset-0 flex items-center justify-center">
                <span className="text-white font-bold text-sm text-center px-2 drop-shadow-lg">
                  {currentTheme?.name || "Default"}
                </span>
              </div>
            </div>
          </Card>
        </div>

        {/* Theme Categories */}
        <Card className="p-3 space-y-3" data-testid="tile-themes">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="p-1.5 rounded-lg bg-orange-500/20">
                <Palette className="h-4 w-4 text-orange-500" />
              </div>
              <span className="font-semibold text-sm">Theme Gallery</span>
            </div>
            <Badge variant="secondary" className="text-xs">
              {filteredThemes.length} themes
            </Badge>
          </div>

          {/* Category Tabs */}
          <ScrollArea className="w-full">
            <div className="flex gap-1.5 pb-2">
              {THEME_CATEGORIES.map((cat) => (
                <Button
                  key={cat.id}
                  variant={selectedCategory === cat.id ? "default" : "outline"}
                  size="sm"
                  onClick={() => setSelectedCategory(cat.id)}
                  className="shrink-0 text-xs h-7 px-2.5"
                  data-testid={`category-${cat.id}`}
                >
                  {cat.name}
                </Button>
              ))}
            </div>
            <ScrollBar orientation="horizontal" />
          </ScrollArea>

          {/* Theme Grid */}
          <div className="grid grid-cols-3 gap-2 max-h-[40vh] overflow-y-auto pr-1">
            <AnimatePresence mode="popLayout">
              {filteredThemes.map((theme) => (
                <motion.button
                  key={theme.id}
                  layout
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.9 }}
                  onClick={() => setTheme(theme.id)}
                  className={`relative aspect-square rounded-lg overflow-hidden border-2 transition-all ${
                    currentTheme?.id === theme.id 
                      ? 'border-primary ring-2 ring-primary/30' 
                      : 'border-transparent hover:border-muted-foreground/30'
                  }`}
                  whileTap={{ scale: 0.95 }}
                  data-testid={`theme-${theme.id}`}
                >
                  <div className={`absolute inset-0 bg-gradient-to-br ${theme.colors.primary}`} />
                  {theme.watermark && (
                    <img 
                      src={theme.watermark}
                      alt=""
                      className="absolute inset-0 w-full h-full object-cover opacity-40"
                      loading="lazy"
                    />
                  )}
                  <div className="absolute inset-0 flex items-end p-1.5">
                    <span className="text-[9px] font-medium text-white drop-shadow-lg line-clamp-2 leading-tight">
                      {theme.name.replace(/^[^\s]+\s/, '')}
                    </span>
                  </div>
                  {currentTheme?.id === theme.id && (
                    <div className="absolute top-1 right-1 p-0.5 bg-primary rounded-full">
                      <Check className="h-2.5 w-2.5 text-primary-foreground" />
                    </div>
                  )}
                </motion.button>
              ))}
            </AnimatePresence>
          </div>
        </Card>

        {/* Quick Stats */}
        <div className="grid grid-cols-4 gap-2">
          <Card className="p-2 text-center">
            <p className="text-lg font-bold text-emerald-500">32</p>
            <p className="text-[10px] text-muted-foreground">NFL</p>
          </Card>
          <Card className="p-2 text-center">
            <p className="text-lg font-bold text-blue-500">30</p>
            <p className="text-[10px] text-muted-foreground">NBA</p>
          </Card>
          <Card className="p-2 text-center">
            <p className="text-lg font-bold text-red-500">30</p>
            <p className="text-[10px] text-muted-foreground">MLB</p>
          </Card>
          <Card className="p-2 text-center">
            <p className="text-lg font-bold text-purple-500">100+</p>
            <p className="text-[10px] text-muted-foreground">Soccer</p>
          </Card>
        </div>
      </div>
    </div>
  );
}
