import { useState } from 'react';
import { motion } from 'framer-motion';
import { MapPin, Navigation, ExternalLink, Search, Car, Compass, Target, Sparkles, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet';
import { useToast } from '@/hooks/use-toast';

const LOT_VISION_BASE_URL = 'https://xt.lotvision.cognosos.net';

// Self-contained carousel card - fixed size, works in SwipeCarousel
export function LotVisionCarouselCard() {
  return (
    <div
      onClick={() => window.open(LOT_VISION_BASE_URL, '_blank', 'noopener,noreferrer')}
      className="cursor-pointer group"
      data-testid="card-lotvision-carousel"
    >
      <Card className="h-32 w-[200px] overflow-hidden transition-all duration-300 group-hover:scale-[1.02] group-hover:shadow-xl border-2 border-transparent group-hover:border-blue-500/30 relative">
        <div className="absolute inset-0 bg-gradient-to-br from-blue-600 to-cyan-600 opacity-10 group-hover:opacity-20 transition-opacity" />
        <CardContent className="p-4 h-full flex flex-col relative z-10">
          <div className="p-2 rounded-lg bg-gradient-to-br from-blue-500 to-cyan-500 w-fit mb-2">
            <Compass className="w-4 h-4 text-white" />
          </div>
          <div className="flex-1">
            <div className="flex items-center gap-2">
              <h4 className="font-semibold text-sm">Lot Vision</h4>
              <Badge variant="outline" className="text-[10px] px-1.5 py-0 border-cyan-500/50 text-cyan-500">
                GPS
              </Badge>
            </div>
            <p className="text-xs text-muted-foreground">Vehicle tracking</p>
          </div>
          <ChevronRight className="w-4 h-4 text-muted-foreground absolute bottom-4 right-4 group-hover:translate-x-1 transition-transform" />
        </CardContent>
      </Card>
    </div>
  );
}

interface LotVisionLauncherProps {
  workOrder?: string;
  vin?: string;
  variant?: 'button' | 'card' | 'icon';
  size?: 'sm' | 'default' | 'lg';
  className?: string;
}

export function LotVisionLauncher({ 
  workOrder, 
  vin, 
  variant = 'button',
  size = 'default',
  className = ''
}: LotVisionLauncherProps) {
  const { toast } = useToast();

  const launchLotVision = (searchTerm?: string) => {
    const url = LOT_VISION_BASE_URL;
    
    if (searchTerm) {
      navigator.clipboard.writeText(searchTerm).then(() => {
        toast({
          title: "Work order copied!",
          description: `${searchTerm} copied to clipboard. Paste in Lot Vision search.`,
        });
      }).catch(() => {});
    }
    
    window.open(url, '_blank', 'noopener,noreferrer');
  };

  if (variant === 'icon') {
    return (
      <Button
        size="icon"
        variant="ghost"
        onClick={() => launchLotVision(workOrder || vin)}
        className={className}
        data-testid="button-lotvision-icon"
        title="Find in Lot Vision"
      >
        <Navigation className="w-4 h-4" />
      </Button>
    );
  }

  if (variant === 'card') {
    return (
      <motion.div
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
      >
        <Card 
          className={`bg-gradient-to-br from-blue-900/40 to-cyan-900/30 border-blue-500/30 cursor-pointer hover:border-blue-400/50 transition-all backdrop-blur-sm ${className}`}
          onClick={() => launchLotVision(workOrder || vin)}
          data-testid="card-lotvision-launcher"
        >
          <CardContent className="p-4 flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500/30 to-cyan-500/30 flex items-center justify-center backdrop-blur-sm border border-blue-400/20">
              <Navigation className="w-5 h-5 text-blue-400" />
            </div>
            <div className="flex-1">
              <p className="font-semibold text-white text-sm">Lot Vision GPS</p>
              <p className="text-xs text-blue-300">Find vehicle location</p>
            </div>
            <ExternalLink className="w-4 h-4 text-blue-400" />
          </CardContent>
        </Card>
      </motion.div>
    );
  }

  return (
    <Button
      size={size}
      variant="outline"
      onClick={() => launchLotVision(workOrder || vin)}
      className={`border-blue-500/50 text-blue-400 hover:bg-blue-500/20 ${className}`}
      data-testid="button-lotvision-launch"
    >
      <Navigation className="w-4 h-4 mr-2" />
      Find in Lot Vision
    </Button>
  );
}

export function LotVisionQuickSearch() {
  const [open, setOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const { toast } = useToast();

  const handleSearch = () => {
    if (!searchTerm.trim()) {
      toast({
        title: "Enter a work order or VIN",
        description: "Please enter a work order number, VIN, or seller ID to search.",
        variant: "destructive"
      });
      return;
    }

    navigator.clipboard.writeText(searchTerm.trim()).then(() => {
      toast({
        title: "Copied to clipboard!",
        description: "Paste this in the Lot Vision search box.",
      });
    }).catch(() => {});

    window.open(LOT_VISION_BASE_URL, '_blank', 'noopener,noreferrer');
    setSearchTerm('');
    setOpen(false);
  };

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        <motion.div
          whileHover={{ scale: 1.02, y: -2 }}
          whileTap={{ scale: 0.98 }}
          className="cursor-pointer"
        >
          <Card 
            className="relative overflow-hidden bg-gradient-to-br from-blue-600/20 via-cyan-600/10 to-blue-800/20 border-blue-500/40 backdrop-blur-xl hover:border-blue-400/60 transition-all shadow-lg shadow-blue-500/10"
            data-testid="card-lotvision-quick-search"
          >
            {/* Glassmorphic overlay */}
            <div className="absolute inset-0 bg-gradient-to-br from-white/5 to-transparent pointer-events-none" />
            
            {/* Sparkle effect */}
            <motion.div
              className="absolute top-2 right-2"
              animate={{ rotate: 360 }}
              transition={{ duration: 8, repeat: Infinity, ease: "linear" }}
            >
              <Sparkles className="w-4 h-4 text-cyan-400/60" />
            </motion.div>

            <CardContent className="p-4 relative z-10">
              <div className="flex items-center gap-3 mb-3">
                <motion.div 
                  className="w-12 h-12 rounded-xl bg-gradient-to-br from-blue-500 to-cyan-500 flex items-center justify-center shadow-lg shadow-blue-500/30"
                  whileHover={{ rotate: [0, -5, 5, 0] }}
                  transition={{ duration: 0.5 }}
                >
                  <Compass className="w-6 h-6 text-white" />
                </motion.div>
                <div>
                  <h3 className="font-bold text-white flex items-center gap-2">
                    Lot Vision GPS
                    <Badge variant="outline" className="text-[9px] px-1.5 py-0 border-cyan-500/50 text-cyan-400">
                      MANHEIM
                    </Badge>
                  </h3>
                  <p className="text-xs text-blue-300/80">Real-time vehicle tracking</p>
                </div>
              </div>
              <p className="text-xs text-slate-400">
                Find any vehicle on the lot with GPS navigation
              </p>
              
              {/* Feature pills */}
              <div className="flex gap-2 mt-3 flex-wrap">
                <div className="flex items-center gap-1 px-2 py-1 rounded-full bg-blue-500/20 border border-blue-500/30">
                  <MapPin className="w-3 h-3 text-blue-400" />
                  <span className="text-[10px] text-blue-300">GPS</span>
                </div>
                <div className="flex items-center gap-1 px-2 py-1 rounded-full bg-cyan-500/20 border border-cyan-500/30">
                  <Navigation className="w-3 h-3 text-cyan-400" />
                  <span className="text-[10px] text-cyan-300">Navigate</span>
                </div>
                <div className="flex items-center gap-1 px-2 py-1 rounded-full bg-emerald-500/20 border border-emerald-500/30">
                  <Target className="w-3 h-3 text-emerald-400" />
                  <span className="text-[10px] text-emerald-300">Locate</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </SheetTrigger>

      <SheetContent side="bottom" className="bg-gradient-to-b from-slate-900 to-slate-950 border-blue-500/30 rounded-t-3xl backdrop-blur-xl">
        <SheetHeader className="pb-4">
          <SheetTitle className="flex items-center gap-2 text-white">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-blue-500 to-cyan-500 flex items-center justify-center">
              <Compass className="w-4 h-4 text-white" />
            </div>
            Lot Vision GPS Navigation
          </SheetTitle>
        </SheetHeader>

        <div className="space-y-4">
          {/* How it works - Premium accordion style */}
          <div className="bg-gradient-to-br from-slate-800/80 to-slate-800/40 rounded-xl p-4 space-y-3 border border-slate-700/50 backdrop-blur-sm">
            <p className="text-xs text-slate-400 font-semibold uppercase tracking-wide">How it works</p>
            
            {[
              { step: 1, text: "Enter work order, VIN, or seller ID below", color: "blue" },
              { step: 2, text: "Tap search - we'll copy it and open Lot Vision", color: "blue" },
              { step: 3, text: "Paste in the Lot Vision search box", color: "blue" },
            ].map((item, i) => (
              <motion.div 
                key={i}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.1 }}
                className="flex items-start gap-3 text-xs text-slate-300"
              >
                <div className={`w-6 h-6 rounded-full bg-${item.color}-500/30 flex items-center justify-center flex-shrink-0 border border-${item.color}-500/40`}>
                  <span className={`text-${item.color}-400 font-bold text-xs`}>{item.step}</span>
                </div>
                <span className="pt-0.5">{item.text}</span>
              </motion.div>
            ))}
            
            <motion.div 
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.3 }}
              className="flex items-start gap-3 text-xs text-emerald-300"
            >
              <div className="w-6 h-6 rounded-full bg-emerald-500/30 flex items-center justify-center flex-shrink-0 border border-emerald-500/40">
                <Target className="w-3 h-3 text-emerald-400" />
              </div>
              <span className="pt-0.5 font-medium">Follow the GPS line to navigate to the vehicle!</span>
            </motion.div>
          </div>

          {/* Search input - Premium styling */}
          <div className="flex gap-2">
            <Input
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Work Order, VIN, or Seller ID"
              className="bg-slate-800/80 border-slate-600 text-white placeholder:text-slate-500 focus:border-blue-500 focus:ring-blue-500/20"
              data-testid="input-lotvision-search"
              onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
            />
            <Button 
              onClick={handleSearch}
              className="bg-gradient-to-r from-blue-500 to-cyan-500 hover:from-blue-600 hover:to-cyan-600 shadow-lg shadow-blue-500/25"
              data-testid="button-lotvision-search"
            >
              <Search className="w-4 h-4" />
            </Button>
          </div>

          {/* Quick launch */}
          <Button
            variant="outline"
            className="w-full border-blue-500/40 text-blue-400 hover:bg-blue-500/10 hover:border-blue-400/60"
            onClick={() => {
              window.open(LOT_VISION_BASE_URL, '_blank', 'noopener,noreferrer');
              setOpen(false);
            }}
            data-testid="button-lotvision-open-direct"
          >
            <ExternalLink className="w-4 h-4 mr-2" />
            Open Lot Vision Directly
          </Button>

          {/* Guest access note */}
          <p className="text-[10px] text-slate-500 text-center flex items-center justify-center gap-1">
            <Sparkles className="w-3 h-3" />
            Lot Vision guest view - no login required
          </p>
        </div>
      </SheetContent>
    </Sheet>
  );
}

export function LotVisionDashboardWidget() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      <Card className="relative overflow-hidden bg-gradient-to-br from-slate-800/90 via-blue-900/20 to-slate-900/90 border-blue-500/30 backdrop-blur-xl shadow-xl shadow-blue-500/5">
        {/* Glassmorphic overlay */}
        <div className="absolute inset-0 bg-gradient-to-br from-white/5 via-transparent to-blue-500/5 pointer-events-none" />
        
        {/* Animated corner accent */}
        <div className="absolute top-0 right-0 w-24 h-24 bg-gradient-to-bl from-blue-500/20 to-transparent rounded-bl-full" />
        
        <CardHeader className="pb-3 relative z-10">
          <CardTitle className="text-base text-white flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500 to-cyan-500 flex items-center justify-center shadow-lg shadow-blue-500/30">
              <Compass className="w-5 h-5 text-white" />
            </div>
            <div>
              <span className="font-bold">Lot Vision Integration</span>
              <Badge variant="outline" className="ml-2 text-[9px] px-1.5 py-0 border-cyan-500/50 text-cyan-400">
                GPS
              </Badge>
            </div>
          </CardTitle>
        </CardHeader>
        
        <CardContent className="space-y-4 relative z-10">
          <p className="text-xs text-slate-400">
            GPS vehicle tracking powered by Manheim's Lot Vision system
          </p>
          
          {/* Feature grid with glassmorphic tiles */}
          <div className="grid grid-cols-4 gap-2">
            {[
              { icon: MapPin, label: "Real-time GPS", color: "blue" },
              { icon: Navigation, label: "Turn-by-turn", color: "cyan" },
              { icon: Car, label: "Vehicle Locate", color: "emerald" },
              { icon: Target, label: "Lane Mapping", color: "amber" },
            ].map((feature, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: i * 0.05 }}
                className={`bg-gradient-to-br from-${feature.color}-500/10 to-${feature.color}-600/5 rounded-lg p-2 text-center border border-${feature.color}-500/20 backdrop-blur-sm`}
              >
                <feature.icon className={`w-4 h-4 text-${feature.color}-400 mx-auto mb-1`} />
                <p className="text-[9px] text-slate-400 leading-tight">{feature.label}</p>
              </motion.div>
            ))}
          </div>

          <Button
            className="w-full bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-500 hover:to-cyan-500 shadow-lg shadow-blue-500/25 font-semibold"
            onClick={() => window.open(LOT_VISION_BASE_URL, '_blank', 'noopener,noreferrer')}
            data-testid="button-lotvision-dashboard-launch"
          >
            <Compass className="w-4 h-4 mr-2" />
            Launch Lot Vision
            <ExternalLink className="w-3 h-3 ml-2 opacity-70" />
          </Button>
          
          <p className="text-[10px] text-slate-500 text-center">
            Opens in new tab - guest access, no login required
          </p>
        </CardContent>
      </Card>
    </motion.div>
  );
}
