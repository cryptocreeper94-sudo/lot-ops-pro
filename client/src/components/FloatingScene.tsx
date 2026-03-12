import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useLotBuddy } from '@/contexts/LotBuddyContext';
import { LotBuddyInteractionOverlay } from '@/components/LotBuddyInteractionOverlay';
import { X, MessageCircle, Bot, Sparkles } from 'lucide-react';
import { useLocation } from 'wouter';

export interface VehicleOption {
  id: string;
  filename: string;
  displayName: string;
  category: 'sports' | 'suv' | 'sedan' | 'truck';
}

export const VEHICLE_CATALOG: VehicleOption[] = [
  { id: 'bugatti_chiron', filename: 'bugatti_chiron.png', displayName: 'Bugatti Chiron', category: 'sports' },
  { id: 'lamborghini_aventador', filename: 'lamborghini_aventador.png', displayName: 'Lamborghini Aventador', category: 'sports' },
  { id: 'mclaren_720s', filename: 'mclaren_720s.png', displayName: 'McLaren 720S', category: 'sports' },
  { id: 'ferrari', filename: 'ferrari.png', displayName: 'Ferrari', category: 'sports' },
  { id: 'ferrari_488', filename: 'ferrari_488.png', displayName: 'Ferrari 488', category: 'sports' },
  { id: 'aston_martin_db11', filename: 'aston_martin_db11.png', displayName: 'Aston Martin DB11', category: 'sports' },
  { id: 'maserati_granturismo', filename: 'maserati_granturismo.png', displayName: 'Maserati GranTurismo', category: 'sports' },
  { id: 'porsche_911', filename: 'porsche_911.png', displayName: 'Porsche 911', category: 'sports' },
  { id: 'corvette', filename: 'corvette.png', displayName: 'Corvette C8', category: 'sports' },
  { id: 'rolls_royce_phantom', filename: 'rolls_royce_phantom.png', displayName: 'Rolls Royce Phantom', category: 'sedan' },
  { id: 'bentley_continental', filename: 'bentley_continental.png', displayName: 'Bentley Continental', category: 'sedan' },
  { id: 'tesla_model_s', filename: 'tesla_model_s.png', displayName: 'Tesla Model S', category: 'sedan' },
  { id: 'dodge_hellcat', filename: 'dodge_hellcat.png', displayName: 'Dodge Hellcat', category: 'sports' },
  { id: 'ford_mustang_gt', filename: 'ford_mustang_gt.png', displayName: 'Ford Mustang GT', category: 'sports' },
  { id: 'camaro_zl1', filename: 'camaro_zl1.png', displayName: 'Chevy Camaro ZL1', category: 'sports' },
  { id: 'g_wagon', filename: 'g_wagon.png', displayName: 'Mercedes G-Wagon', category: 'suv' },
  { id: 'range_rover_sport', filename: 'range_rover_sport.png', displayName: 'Range Rover Sport', category: 'suv' },
  { id: 'honda_civic', filename: 'honda_civic.png', displayName: 'Honda Civic', category: 'sedan' },
  { id: 'ford_f150', filename: 'ford_f150.png', displayName: 'Ford F-150', category: 'truck' },
];

export interface TreeOption {
  id: string;
  filename: string;
  displayName: string;
}

export const TREE_CATALOG: TreeOption[] = [
  { id: 'palm_tree', filename: 'palm_tree.png', displayName: 'Palm Tree' },
  { id: 'oak_tree', filename: 'oak_tree.png', displayName: 'Oak Tree' },
  { id: 'pine_tree', filename: 'pine_tree.png', displayName: 'Pine Tree' },
  { id: 'tree', filename: 'tree.png', displayName: 'Decorative Tree' },
];

export interface BuildingOption {
  id: string;
  filename: string;
  displayName: string;
  category: 'classic' | 'vacation' | 'fun';
}

export const BUILDING_CATALOG: BuildingOption[] = [
  { id: 'garage', filename: 'garage.png', displayName: 'Headquarters', category: 'classic' },
  { id: 'modern_house', filename: 'modern_house.png', displayName: 'Modern House', category: 'classic' },
  { id: 'mountain_cabin', filename: 'mountain_cabin.png', displayName: 'Mountain Cabin', category: 'vacation' },
  { id: 'beach_villa', filename: 'beach_villa.png', displayName: 'Beach Villa', category: 'vacation' },
  { id: 'treehouse', filename: 'treehouse.png', displayName: 'Treehouse', category: 'fun' },
  { id: 'food_truck', filename: 'food_truck.png', displayName: 'Food Truck', category: 'fun' },
  { id: 'castle_tower', filename: 'castle_tower.png', displayName: 'Castle Tower', category: 'fun' },
];

const DEFAULT_VEHICLE = VEHICLE_CATALOG[0];
const DEFAULT_TREE = TREE_CATALOG[0];
const DEFAULT_BUILDING = BUILDING_CATALOG[0];

export function useVehicleSelection() {
  const [selectedVehicle, setSelectedVehicle] = useState<VehicleOption>(DEFAULT_VEHICLE);
  
  useEffect(() => {
    const loadVehicle = () => {
      const savedVehicle = localStorage.getItem('lotops_selected_vehicle');
      if (savedVehicle) {
        const vehicle = VEHICLE_CATALOG.find(v => v.id === savedVehicle);
        if (vehicle) setSelectedVehicle(vehicle);
      }
    };
    
    loadVehicle();
    
    const handleChange = (e: Event) => {
      const vehicleId = (e as CustomEvent).detail;
      const vehicle = VEHICLE_CATALOG.find(v => v.id === vehicleId);
      if (vehicle) setSelectedVehicle(vehicle);
    };
    
    window.addEventListener('lotops-vehicle-changed', handleChange);
    return () => window.removeEventListener('lotops-vehicle-changed', handleChange);
  }, []);
  
  const selectVehicle = (vehicle: VehicleOption) => {
    setSelectedVehicle(vehicle);
    localStorage.setItem('lotops_selected_vehicle', vehicle.id);
  };
  
  return { selectedVehicle, selectVehicle, vehicles: VEHICLE_CATALOG };
}

export function useTreeSelection() {
  const [selectedTree, setSelectedTree] = useState<TreeOption>(DEFAULT_TREE);
  
  useEffect(() => {
    const loadTree = () => {
      const savedTree = localStorage.getItem('lotops_selected_tree');
      if (savedTree) {
        const tree = TREE_CATALOG.find(t => t.id === savedTree);
        if (tree) setSelectedTree(tree);
      }
    };
    
    loadTree();
    
    const handleChange = (e: Event) => {
      const treeId = (e as CustomEvent).detail;
      const tree = TREE_CATALOG.find(t => t.id === treeId);
      if (tree) setSelectedTree(tree);
    };
    
    window.addEventListener('lotops-tree-changed', handleChange);
    return () => window.removeEventListener('lotops-tree-changed', handleChange);
  }, []);
  
  const selectTree = (tree: TreeOption) => {
    setSelectedTree(tree);
    localStorage.setItem('lotops_selected_tree', tree.id);
  };
  
  return { selectedTree, selectTree, trees: TREE_CATALOG };
}

export function useBuildingSelection() {
  const [selectedBuilding, setSelectedBuilding] = useState<BuildingOption>(DEFAULT_BUILDING);
  
  useEffect(() => {
    const loadBuilding = () => {
      const savedBuilding = localStorage.getItem('lotops_selected_building');
      if (savedBuilding) {
        const building = BUILDING_CATALOG.find(b => b.id === savedBuilding);
        if (building) setSelectedBuilding(building);
      }
    };
    
    loadBuilding();
    
    const handleChange = (e: Event) => {
      const buildingId = (e as CustomEvent).detail;
      const building = BUILDING_CATALOG.find(b => b.id === buildingId);
      if (building) setSelectedBuilding(building);
    };
    
    window.addEventListener('lotops-building-changed', handleChange);
    return () => window.removeEventListener('lotops-building-changed', handleChange);
  }, []);
  
  const selectBuilding = (building: BuildingOption) => {
    setSelectedBuilding(building);
    localStorage.setItem('lotops_selected_building', building.id);
  };
  
  return { selectedBuilding, selectBuilding, buildings: BUILDING_CATALOG };
}

export function FloatingScene() {
  const [location] = useLocation();
  const [isExpanded, setIsExpanded] = useState(false);
  const [showTooltip, setShowTooltip] = useState(false);
  const { 
    interactionMode,
    openInteractionOverlay,
    closeInteractionOverlay
  } = useLotBuddy();
  
  const { selectedVehicle } = useVehicleSelection();
  const { selectedTree } = useTreeSelection();
  const { selectedBuilding } = useBuildingSelection();

  // Hide on login page
  const isLoginPage = location === '/' || location === '/login';
  
  // Check if first time seeing the diorama
  useEffect(() => {
    if (isExpanded) {
      const hasSeenTooltip = localStorage.getItem('lotops_diorama_tooltip_seen');
      if (!hasSeenTooltip) {
        setShowTooltip(true);
      }
    }
  }, [isExpanded]);

  const dismissTooltip = () => {
    localStorage.setItem('lotops_diorama_tooltip_seen', 'true');
    setShowTooltip(false);
  };
  
  const handleVehicleClick = () => {
    if (interactionMode === 'ai') {
      closeInteractionOverlay();
    } else {
      openInteractionOverlay('ai');
    }
  };
  
  const handleGarageClick = () => {
    if (interactionMode === 'messaging') {
      closeInteractionOverlay();
    } else {
      openInteractionOverlay('messaging');
    }
  };

  // Auto-expand when an interaction mode is active
  useEffect(() => {
    if (interactionMode) {
      setIsExpanded(true);
    }
  }, [interactionMode]);

  // Don't render on login page
  if (isLoginPage) {
    return <LotBuddyInteractionOverlay />;
  }

  return (
    <>
      {/* Collapsed State - Small Subtle Trigger Button */}
      <AnimatePresence>
        {!isExpanded && (
          <motion.button
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.8, y: 20 }}
            whileHover={{ scale: 1.15 }}
            whileTap={{ scale: 0.9 }}
            onClick={() => setIsExpanded(true)}
            className="fixed bottom-[42px] right-4 z-[9998] w-10 h-10 rounded-full bg-gradient-to-br from-indigo-600/80 via-purple-600/80 to-pink-600/80 border border-white/20 backdrop-blur-sm shadow-lg flex items-center justify-center cursor-pointer"
            data-testid="button-expand-diorama"
          >
            <Sparkles className="w-5 h-5 text-white" />
            {/* Subtle pulse */}
            <motion.div
              className="absolute inset-0 rounded-full border border-white/30"
              animate={{ opacity: [0.2, 0.5, 0.2], scale: [1, 1.15, 1] }}
              transition={{ repeat: Infinity, duration: 2.5 }}
            />
          </motion.button>
        )}
      </AnimatePresence>

      {/* Expanded State - Full Diorama */}
      <AnimatePresence>
        {isExpanded && (
          <motion.div 
            initial={{ opacity: 0, scale: 0.6, y: 50 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.6, y: 50 }}
            transition={{ type: 'spring', stiffness: 300, damping: 25 }}
            className="fixed bottom-[42px] right-4 z-[9998]"
            style={{ width: '160px', height: '140px' }}
          >
            {/* Background card */}
            <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-slate-800/95 via-slate-900/95 to-slate-800/95 border border-slate-700/60 backdrop-blur-md shadow-2xl" />
            
            {/* First-time tooltip */}
            <AnimatePresence>
              {showTooltip && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="absolute -top-[85px] left-0 right-0 z-50 mx-2"
                >
                  <div className="bg-slate-800 border border-slate-600 rounded-lg p-2.5 shadow-xl relative">
                    <button
                      onClick={dismissTooltip}
                      className="absolute top-1 right-1 w-5 h-5 rounded-full bg-slate-700 flex items-center justify-center text-slate-400 hover:text-white"
                      data-testid="button-dismiss-tooltip"
                    >
                      <X className="w-3 h-3" />
                    </button>
                    <div className="space-y-1.5 pr-4">
                      <div className="flex items-center gap-2 text-[10px]">
                        <div className="w-4 h-4 rounded bg-emerald-500/20 flex items-center justify-center">
                          <Bot className="w-2.5 h-2.5 text-emerald-400" />
                        </div>
                        <span className="text-slate-300">Tap <strong className="text-emerald-400">car</strong> for AI Assistant</span>
                      </div>
                      <div className="flex items-center gap-2 text-[10px]">
                        <div className="w-4 h-4 rounded bg-amber-500/20 flex items-center justify-center">
                          <MessageCircle className="w-2.5 h-2.5 text-amber-400" />
                        </div>
                        <span className="text-slate-300">Tap <strong className="text-amber-400">building</strong> for Messaging</span>
                      </div>
                    </div>
                    {/* Arrow pointing down */}
                    <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 w-0 h-0 border-l-[8px] border-l-transparent border-r-[8px] border-r-transparent border-t-[8px] border-t-slate-600" />
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
            
            {/* Close button */}
            <motion.button
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.2 }}
              onClick={() => {
                if (interactionMode) {
                  closeInteractionOverlay();
                }
                setIsExpanded(false);
              }}
              className="absolute top-2 right-2 z-50 w-6 h-6 rounded-full bg-slate-700/80 border border-slate-600/50 flex items-center justify-center text-slate-400 hover:text-white hover:bg-slate-600/80 transition-colors"
              data-testid="button-collapse-diorama"
            >
              <X className="w-3.5 h-3.5" />
            </motion.button>

            {/* Action labels */}
            <div className="absolute top-2 left-3 flex gap-2 z-40">
              <div className="flex items-center gap-1 px-2 py-0.5 rounded-full bg-emerald-500/20 border border-emerald-500/30">
                <Bot className="w-2.5 h-2.5 text-emerald-400" />
                <span className="text-[9px] text-emerald-300 font-medium">AI</span>
              </div>
              <div className="flex items-center gap-1 px-2 py-0.5 rounded-full bg-amber-500/20 border border-amber-500/30">
                <MessageCircle className="w-2.5 h-2.5 text-amber-400" />
                <span className="text-[9px] text-amber-300 font-medium">MSG</span>
              </div>
            </div>

            <div className="relative w-full h-full pointer-events-auto pt-8">
              {/* LAYER 1: Headquarters Building - Messaging Button */}
              <motion.button
                className="absolute left-[42px] cursor-pointer z-10 w-[70px] h-[58px] top-[52px]"
                onClick={handleGarageClick}
                whileHover={{ scale: 1.03, y: -3 }}
                whileTap={{ scale: 0.98 }}
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ type: 'spring', stiffness: 200, damping: 15 }}
                data-testid="button-garage-messaging"
              >
                <img
                  src={`/scene_assets/${selectedBuilding.filename}`}
                  alt={selectedBuilding.displayName}
                  className="w-full h-full object-contain"
                  style={{ 
                    filter: `drop-shadow(0 8px 20px rgba(0,0,0,0.5)) ${interactionMode === 'messaging' ? 'brightness(1.25) saturate(1.2)' : ''}`,
                    transform: 'scaleX(-1)',
                  }}
                />
                {interactionMode === 'messaging' && (
                  <motion.div
                    className="absolute inset-0 rounded-lg pointer-events-none"
                    style={{ background: 'radial-gradient(circle at center, rgba(251,191,36,0.3) 0%, transparent 70%)' }}
                    animate={{ opacity: [0.4, 0.7, 0.4] }}
                    transition={{ repeat: Infinity, duration: 1.5 }}
                  />
                )}
              </motion.button>
              
              {/* LAYER 2: Tree - Decorative */}
              <motion.div
                className="absolute z-20 pointer-events-none right-[30px] top-[42px] w-[36px] h-[54px]"
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.15, type: 'spring', stiffness: 200 }}
              >
                <img
                  src={`/scene_assets/${selectedTree.filename}`}
                  alt="Tree"
                  className="w-full h-full object-contain"
                  style={{ filter: 'drop-shadow(0 6px 12px rgba(0,0,0,0.4))' }}
                />
              </motion.div>
              
              {/* LAYER 3: Vehicle - AI Agent Button (almost touching building) */}
              <motion.button
                className="absolute left-[50px] bottom-[16px] cursor-pointer z-30 w-[62px] h-[40px]"
                onClick={handleVehicleClick}
                whileHover={{ scale: 1.08, x: 5, rotate: 1 }}
                whileTap={{ scale: 0.95 }}
                initial={{ opacity: 0, x: -30 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ type: 'spring', stiffness: 200, damping: 15, delay: 0.1 }}
                data-testid="button-vehicle-ai"
              >
                <img
                  src={`/vehicle_catalog/${selectedVehicle.filename}`}
                  alt="Vehicle"
                  className="w-full h-full object-contain"
                  style={{ 
                    filter: `drop-shadow(0 8px 16px rgba(0,0,0,0.6)) ${interactionMode === 'ai' ? 'brightness(1.2) saturate(1.15)' : ''}`,
                  }}
                />
                {interactionMode === 'ai' && (
                  <motion.div
                    className="absolute inset-0 rounded-lg pointer-events-none"
                    style={{ background: 'radial-gradient(circle at center, rgba(52,211,153,0.35) 0%, transparent 70%)' }}
                    animate={{ opacity: [0.4, 0.8, 0.4], scale: [0.98, 1.02, 0.98] }}
                    transition={{ repeat: Infinity, duration: 1.8 }}
                  />
                )}
              </motion.button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
      
      <LotBuddyInteractionOverlay />
    </>
  );
}

export default FloatingScene;
