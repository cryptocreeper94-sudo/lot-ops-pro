import { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Check, Car, Truck, TreePine, ChevronLeft, ChevronRight, Sparkles } from 'lucide-react';
import { 
  VEHICLE_CATALOG, 
  TREE_CATALOG, 
  useVehicleSelection, 
  useTreeSelection,
  VehicleOption,
  TreeOption 
} from './FloatingScene';
import { useToast } from '@/hooks/use-toast';

const VEHICLE_CATEGORIES = {
  exotics: {
    label: 'Exotics',
    icon: '🏎️',
    color: 'from-red-500 to-orange-500',
    vehicles: ['bugatti_chiron', 'lamborghini_aventador', 'mclaren_720s', 'ferrari', 'ferrari_488', 'aston_martin_db11', 'maserati_granturismo']
  },
  luxury: {
    label: 'Luxury',
    icon: '👔',
    color: 'from-purple-500 to-pink-500',
    vehicles: ['rolls_royce_phantom', 'bentley_continental', 'tesla_model_s']
  },
  muscle: {
    label: 'Muscle',
    icon: '💪',
    color: 'from-amber-500 to-red-600',
    vehicles: ['dodge_hellcat', 'ford_mustang_gt', 'camaro_zl1', 'corvette', 'porsche_911']
  },
  suvs: {
    label: 'SUVs',
    icon: '🚙',
    color: 'from-slate-600 to-slate-800',
    vehicles: ['g_wagon', 'range_rover_sport']
  },
  everyday: {
    label: 'Everyday',
    icon: '🚗',
    color: 'from-blue-500 to-cyan-500',
    vehicles: ['honda_civic', 'ford_f150']
  }
};

export function VehicleSelector() {
  const { selectedVehicle, selectVehicle } = useVehicleSelection();
  const { selectedTree, selectTree } = useTreeSelection();
  const { toast } = useToast();
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const scrollRef = useRef<HTMLDivElement>(null);
  
  const handleVehicleSelect = (vehicle: VehicleOption) => {
    selectVehicle(vehicle);
    toast({ 
      title: "🚗 Vehicle Updated", 
      description: `${vehicle.displayName} is now your ride!` 
    });
  };
  
  const handleTreeSelect = (tree: TreeOption) => {
    selectTree(tree);
    toast({ 
      title: "🌳 Tree Updated", 
      description: `${tree.displayName} is now in your scene!` 
    });
  };
  
  const getVehiclesByCategory = (categoryKey: string): VehicleOption[] => {
    const category = VEHICLE_CATEGORIES[categoryKey as keyof typeof VEHICLE_CATEGORIES];
    if (!category) return [];
    return category.vehicles
      .map(id => VEHICLE_CATALOG.find(v => v.id === id))
      .filter((v): v is VehicleOption => v !== undefined);
  };
  
  const scroll = (direction: 'left' | 'right') => {
    if (scrollRef.current) {
      const scrollAmount = 200;
      scrollRef.current.scrollBy({
        left: direction === 'left' ? -scrollAmount : scrollAmount,
        behavior: 'smooth'
      });
    }
  };
  
  const getCurrentCategory = (): string | null => {
    if (!selectedVehicle) return null;
    for (const [key, cat] of Object.entries(VEHICLE_CATEGORIES)) {
      if (cat.vehicles.includes(selectedVehicle.id)) return key;
    }
    return null;
  };

  return (
    <div className="space-y-5">
      <motion.div 
        className="flex items-center gap-3 p-3 rounded-xl bg-gradient-to-r from-emerald-900/40 via-teal-900/30 to-emerald-900/40 border border-emerald-500/30 backdrop-blur-sm"
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
      >
        <div className="w-16 h-12 flex-shrink-0 relative">
          <img
            src={`/vehicle_catalog/${selectedVehicle?.filename}`}
            alt={selectedVehicle?.displayName}
            className="w-full h-full object-contain drop-shadow-lg"
          />
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <Car className="w-4 h-4 text-emerald-400" />
            <span className="text-sm font-bold text-foreground truncate">{selectedVehicle?.displayName || 'Select Vehicle'}</span>
          </div>
          <p className="text-xs text-muted-foreground">Your AI Assistant Ride</p>
        </div>
        <Check className="w-5 h-5 text-emerald-400 flex-shrink-0" />
      </motion.div>
      
      <div className="space-y-3">
        <div className="flex items-center gap-2">
          <Car className="w-4 h-4 text-slate-400" />
          <span className="text-xs font-medium text-slate-300">Vehicle Categories</span>
        </div>
        
        <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
          {Object.entries(VEHICLE_CATEGORIES).map(([key, cat]) => {
            const isActive = selectedCategory === key;
            const hasCurrentVehicle = getCurrentCategory() === key;
            
            return (
              <motion.button
                key={key}
                onClick={() => setSelectedCategory(isActive ? null : key)}
                className={`flex-shrink-0 flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold transition-all ${
                  isActive 
                    ? `bg-gradient-to-r ${cat.color} text-white shadow-lg` 
                    : 'bg-slate-800/80 text-slate-400 hover:bg-slate-700 border border-slate-700/50'
                } ${hasCurrentVehicle ? 'ring-2 ring-emerald-400/50' : ''}`}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                data-testid={`category-vehicle-${key}`}
              >
                <span>{cat.icon}</span>
                <span>{cat.label}</span>
                <span className="text-[10px] opacity-70">({cat.vehicles.length})</span>
              </motion.button>
            );
          })}
        </div>
        
        <AnimatePresence>
          {selectedCategory && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="overflow-hidden"
            >
              <div className="relative">
                <motion.button
                  onClick={() => scroll('left')}
                  className="absolute left-0 top-1/2 -translate-y-1/2 z-20 w-7 h-7 rounded-full bg-slate-800/90 border border-slate-600 flex items-center justify-center shadow-lg"
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                  data-testid="button-vehicle-scroll-left"
                >
                  <ChevronLeft className="w-4 h-4 text-white" />
                </motion.button>
                
                <motion.button
                  onClick={() => scroll('right')}
                  className="absolute right-0 top-1/2 -translate-y-1/2 z-20 w-7 h-7 rounded-full bg-slate-800/90 border border-slate-600 flex items-center justify-center shadow-lg"
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                  data-testid="button-vehicle-scroll-right"
                >
                  <ChevronRight className="w-4 h-4 text-white" />
                </motion.button>
                
                <div 
                  ref={scrollRef}
                  className="flex gap-3 overflow-x-auto pb-2 px-8 scrollbar-hide snap-x snap-mandatory"
                  style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
                >
                  {getVehiclesByCategory(selectedCategory).map((vehicle, index) => {
                    const isSelected = selectedVehicle?.id === vehicle.id;
                    
                    return (
                      <motion.button
                        key={vehicle.id}
                        onClick={() => handleVehicleSelect(vehicle)}
                        className={`relative flex-shrink-0 w-24 h-28 rounded-xl overflow-hidden border-2 transition-all snap-center ${
                          isSelected
                            ? 'border-emerald-400 shadow-[0_0_20px_rgba(16,185,129,0.5)] ring-2 ring-emerald-400/50'
                            : 'border-slate-600/30 hover:border-emerald-500/50'
                        }`}
                        whileHover={{ scale: 1.08, y: -4 }}
                        whileTap={{ scale: 0.95 }}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.05 }}
                        data-testid={`button-vehicle-${vehicle.id}`}
                      >
                        <div className="absolute inset-0 bg-gradient-to-b from-slate-700/50 via-slate-800 to-slate-900" />
                        
                        <div className="absolute inset-0 flex items-center justify-center p-2">
                          <img
                            src={`/vehicle_catalog/${vehicle.filename}`}
                            alt={vehicle.displayName}
                            className="w-full h-full object-contain drop-shadow-lg"
                            onError={(e) => {
                              (e.target as HTMLImageElement).style.display = 'none';
                            }}
                          />
                        </div>
                        
                        {isSelected && (
                          <motion.div
                            className="absolute top-1 right-1 w-5 h-5 rounded-full bg-gradient-to-br from-emerald-400 to-teal-500 flex items-center justify-center shadow-lg"
                            initial={{ scale: 0 }}
                            animate={{ scale: 1 }}
                            transition={{ type: 'spring', stiffness: 500, damping: 20 }}
                          >
                            <Check className="w-3 h-3 text-white" />
                          </motion.div>
                        )}
                        
                        <div className="absolute bottom-0 inset-x-0 bg-gradient-to-t from-black/90 to-transparent px-1 py-1.5">
                          <p className="text-[9px] text-white text-center font-medium truncate">
                            {vehicle.displayName}
                          </p>
                        </div>
                      </motion.button>
                    );
                  })}
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
      
      <div className="pt-3 border-t border-slate-700/50 space-y-3">
        <div className="flex items-center gap-2">
          <TreePine className="w-4 h-4 text-green-400" />
          <span className="text-xs font-medium text-slate-300">Scene Tree</span>
        </div>
        
        <motion.div 
          className="flex items-center gap-3 p-3 rounded-xl bg-gradient-to-r from-green-900/40 via-emerald-900/30 to-green-900/40 border border-green-500/30 backdrop-blur-sm"
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
        >
          <div className="w-10 h-12 flex-shrink-0 relative">
            <img
              src={`/scene_assets/${selectedTree?.filename}`}
              alt={selectedTree?.displayName}
              className="w-full h-full object-contain drop-shadow-lg"
            />
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2">
              <TreePine className="w-3 h-3 text-green-400" />
              <span className="text-sm font-bold text-foreground truncate">{selectedTree?.displayName || 'Select Tree'}</span>
            </div>
            <p className="text-xs text-muted-foreground">Scene Decoration</p>
          </div>
          <Check className="w-4 h-4 text-green-400 flex-shrink-0" />
        </motion.div>
        
        <div className="flex gap-3 justify-center">
          {TREE_CATALOG.map((tree, index) => {
            const isSelected = selectedTree?.id === tree.id;
            
            return (
              <motion.button
                key={tree.id}
                onClick={() => handleTreeSelect(tree)}
                className={`relative w-20 h-24 rounded-xl overflow-hidden border-2 transition-all ${
                  isSelected
                    ? 'border-green-400 shadow-[0_0_15px_rgba(34,197,94,0.4)] ring-2 ring-green-400/50'
                    : 'border-slate-600/30 hover:border-green-500/50'
                }`}
                whileHover={{ scale: 1.08, y: -4 }}
                whileTap={{ scale: 0.95 }}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                data-testid={`button-tree-${tree.id}`}
              >
                <div className="absolute inset-0 bg-gradient-to-b from-slate-700/50 via-slate-800 to-slate-900" />
                
                <div className="absolute inset-0 flex items-center justify-center p-2">
                  <img
                    src={`/scene_assets/${tree.filename}`}
                    alt={tree.displayName}
                    className="w-full h-full object-contain drop-shadow-lg"
                    onError={(e) => {
                      (e.target as HTMLImageElement).style.display = 'none';
                    }}
                  />
                </div>
                
                {isSelected && (
                  <motion.div
                    className="absolute top-1 right-1 w-5 h-5 rounded-full bg-gradient-to-br from-green-400 to-emerald-500 flex items-center justify-center shadow-lg"
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ type: 'spring', stiffness: 500, damping: 20 }}
                  >
                    <Check className="w-3 h-3 text-white" />
                  </motion.div>
                )}
                
                <div className="absolute bottom-0 inset-x-0 bg-gradient-to-t from-black/90 to-transparent px-1 py-1.5">
                  <p className="text-[9px] text-white text-center font-medium truncate">
                    {tree.displayName}
                  </p>
                </div>
              </motion.button>
            );
          })}
        </div>
      </div>
      
      <style>{`
        .scrollbar-hide::-webkit-scrollbar {
          display: none;
        }
      `}</style>
    </div>
  );
}

export default VehicleSelector;
