import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { NavigationControl } from "@/components/NavigationControl";
import { BentoGrid, BentoTile } from "@/components/ui/bento-grid";
import { SwipeCarousel } from "@/components/ui/premium-carousel";
import { PremiumButton } from "@/components/ui/premium-button";
import { 
  Award, 
  History, 
  Scan, 
  ChevronRight, 
  ExternalLink,
  Clock,
  MapPin,
  Hash,
  Loader2,
  RefreshCw,
  Package,
  Car,
  Shield
} from "lucide-react";
import { format } from "date-fns";

export default function MyActivity() {
  const [activeTab, setActiveTab] = useState("badges");
  
  const { data: activity, isLoading, refetch, isRefetching } = useQuery<{
    badges: any[];
    history: any[];
    scans: any[];
  }>({
    queryKey: ["/api/user/activity"],
    refetchOnWindowFocus: false
  });
  
  const { data: userAssets, isLoading: assetsLoading, refetch: refetchAssets } = useQuery<any[]>({
    queryKey: ["/api/user/assets"],
    refetchOnWindowFocus: false
  });
  
  const badges = activity?.badges || [];
  const history = activity?.history || [];
  const scans = activity?.scans || [];
  const assets = userAssets || [];
  
  const formatDate = (dateString: string) => {
    try {
      return format(new Date(dateString), "MMM d, yyyy h:mm a");
    } catch {
      return dateString;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 text-white p-4">
      <div className="max-w-5xl mx-auto space-y-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <NavigationControl variant="back" fallbackRoute="/mode-selection" />
            <div>
              <h1 className="text-2xl font-bold" data-testid="text-page-title">My Activity</h1>
              <p className="text-slate-400 text-sm">Your personal dashboard</p>
            </div>
          </div>
          <PremiumButton
            variant="glass"
            size="sm"
            onClick={() => { refetch(); refetchAssets(); }}
            disabled={isRefetching || assetsLoading}
            icon={<RefreshCw className={`h-4 w-4 ${isRefetching || assetsLoading ? 'animate-spin' : ''}`} />}
            data-testid="button-refresh"
          >
            Refresh
          </PremiumButton>
        </div>

        <BentoGrid columns={4} gap="md">
          <BentoTile
            size="sm"
            variant={activeTab === "badges" ? "glow" : "glass"}
            sparkle={activeTab === "badges"}
            icon={<Award className="h-5 w-5" />}
            onClick={() => setActiveTab("badges")}
            data-testid="tile-badges"
            className="cursor-pointer"
          >
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">Badges</span>
              {badges.length > 0 && (
                <Badge className="bg-purple-600/50 text-xs">{badges.length}</Badge>
              )}
            </div>
          </BentoTile>
          
          <BentoTile
            size="sm"
            variant={activeTab === "assets" ? "glow" : "glass"}
            sparkle={activeTab === "assets"}
            icon={<Package className="h-5 w-5" />}
            onClick={() => setActiveTab("assets")}
            data-testid="tile-assets"
            className="cursor-pointer"
          >
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">Assets</span>
              {assets.length > 0 && (
                <Badge className="bg-amber-600/50 text-xs">{assets.length}</Badge>
              )}
            </div>
          </BentoTile>
          
          <BentoTile
            size="sm"
            variant={activeTab === "history" ? "glow" : "glass"}
            sparkle={activeTab === "history"}
            icon={<History className="h-5 w-5" />}
            onClick={() => setActiveTab("history")}
            data-testid="tile-history"
            className="cursor-pointer"
          >
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">Actions</span>
              {history.length > 0 && (
                <Badge className="bg-blue-600/50 text-xs">{history.length}</Badge>
              )}
            </div>
          </BentoTile>
          
          <BentoTile
            size="sm"
            variant={activeTab === "scans" ? "glow" : "glass"}
            sparkle={activeTab === "scans"}
            icon={<Scan className="h-5 w-5" />}
            onClick={() => setActiveTab("scans")}
            data-testid="tile-scans"
            className="cursor-pointer"
          >
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">Scans</span>
              {scans.length > 0 && (
                <Badge className="bg-green-600/50 text-xs">{scans.length}</Badge>
              )}
            </div>
          </BentoTile>
        </BentoGrid>
        
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="hidden">
            <TabsTrigger value="badges" data-testid="tab-badges">Badges</TabsTrigger>
            <TabsTrigger value="assets" data-testid="tab-assets">Assets</TabsTrigger>
            <TabsTrigger value="history" data-testid="tab-history">History</TabsTrigger>
            <TabsTrigger value="scans" data-testid="tab-scans">Scans</TabsTrigger>
          </TabsList>
          
          {(isLoading || (activeTab === 'assets' && assetsLoading)) ? (
            <BentoTile variant="glass" size="lg" className="mt-4" interactive={false}>
              <div className="flex items-center justify-center py-8">
                <Loader2 className="h-8 w-8 animate-spin text-purple-500" />
                <span className="ml-3 text-slate-400">Loading your {activeTab === 'assets' ? 'assets' : 'activity'}...</span>
              </div>
            </BentoTile>
          ) : (
            <>
              <TabsContent value="badges" className="mt-4">
                {badges.length === 0 ? (
                  <BentoTile 
                    variant="glass" 
                    size="lg" 
                    interactive={false}
                    icon={<Award className="h-8 w-8 text-slate-500" />}
                    title="No NFT Badges Yet"
                    description="Complete achievements to earn blockchain-verified badges"
                    data-testid="empty-badges"
                  />
                ) : (
                  <SwipeCarousel itemWidth="320px" gap={16} showPeek>
                    {badges.map((badge: any, index: number) => (
                      <BentoTile 
                        key={badge.id || index}
                        variant="premium"
                        sparkle
                        size="md"
                        className="h-full"
                        data-testid={`card-badge-${badge.id || index}`}
                      >
                        <div className="flex items-start gap-3">
                          <div className="w-14 h-14 rounded-lg bg-purple-600/20 flex items-center justify-center overflow-hidden shrink-0">
                            {badge.avatarUrl ? (
                              <img src={badge.avatarUrl} alt="Badge" className="w-full h-full object-cover" />
                            ) : (
                              <Award className="h-7 w-7 text-purple-400" />
                            )}
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 mb-1">
                              <h3 className="font-semibold text-base truncate">{badge.driverName || "Driver Badge"}</h3>
                            </div>
                            <Badge className="bg-purple-600 text-xs mb-1">{badge.variant || "Standard"}</Badge>
                            <p className="text-slate-400 text-xs">
                              {badge.role || "Driver"} • {badge.blockchainNetwork || "Solana"}
                            </p>
                          </div>
                        </div>
                        
                        {badge.hallmarkHash && (
                          <div className="flex items-center gap-2 text-xs mt-3 pt-3 border-t border-slate-700">
                            <Hash className="h-3 w-3 text-slate-500" />
                            <span className="font-mono text-purple-400 truncate">
                              {badge.hallmarkHash.slice(0, 16)}...
                            </span>
                            {badge.mintAddress && (
                              <a 
                                href={`https://solscan.io/token/${badge.mintAddress}`}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-purple-400 hover:text-purple-300 ml-auto"
                                data-testid={`link-explorer-${badge.id || index}`}
                              >
                                <ExternalLink className="h-3 w-3" />
                              </a>
                            )}
                          </div>
                        )}
                        
                        {(badge.totalMoves || badge.efficiency || badge.quotaCompletion) && (
                          <div className="grid grid-cols-3 gap-2 mt-3 pt-3 border-t border-slate-700">
                            <div className="text-center">
                              <div className="text-lg font-bold text-white">{badge.totalMoves || 0}</div>
                              <div className="text-[10px] text-slate-400">Moves</div>
                            </div>
                            <div className="text-center">
                              <div className="text-lg font-bold text-green-400">{badge.efficiency || 0}%</div>
                              <div className="text-[10px] text-slate-400">Efficiency</div>
                            </div>
                            <div className="text-center">
                              <div className="text-lg font-bold text-blue-400">{badge.quotaCompletion || 0}%</div>
                              <div className="text-[10px] text-slate-400">Quota</div>
                            </div>
                          </div>
                        )}
                      </BentoTile>
                    ))}
                  </SwipeCarousel>
                )}
              </TabsContent>
              
              <TabsContent value="assets" className="mt-4">
                {assets.length === 0 ? (
                  <BentoTile 
                    variant="glass" 
                    size="lg" 
                    interactive={false}
                    icon={<Package className="h-8 w-8 text-slate-500" />}
                    title="No Assets Assigned"
                    description="Assets you're currently assigned to will appear here"
                    data-testid="empty-assets"
                  />
                ) : (
                  <SwipeCarousel itemWidth="280px" gap={12} showPeek>
                    {assets.map((asset: any, index: number) => (
                      <BentoTile
                        key={asset.id || index}
                        variant="glass"
                        size="sm"
                        className="h-full"
                        data-testid={`card-asset-${asset.id || index}`}
                      >
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-lg bg-amber-600/20 flex items-center justify-center shrink-0">
                            <Car className="h-5 w-5 text-amber-400" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 flex-wrap">
                              <span className="font-medium text-sm">{asset.assetName || asset.assetNumber || "Asset"}</span>
                              <Badge className="text-[10px] bg-amber-600/20 text-amber-400">
                                {asset.assetType || "Vehicle"}
                              </Badge>
                            </div>
                            <Badge variant="outline" className={`text-[10px] mt-1 ${
                              asset.status === 'active' ? 'border-green-600 text-green-400' :
                              asset.status === 'in_use' ? 'border-blue-600 text-blue-400' :
                              'border-slate-600 text-slate-400'
                            }`}>
                              {asset.status || "Unknown"}
                            </Badge>
                          </div>
                        </div>
                        
                        {asset.location && (
                          <div className="flex items-center gap-1 text-xs text-slate-400 mt-2">
                            <MapPin className="h-3 w-3" />
                            {asset.location}
                          </div>
                        )}
                        
                        <div className="flex items-center justify-between mt-2 pt-2 border-t border-slate-700/50">
                          {asset.hallmarkStamp && (
                            <div className="flex items-center gap-1 text-[10px] text-amber-400 font-mono">
                              <Hash className="h-3 w-3" />
                              {asset.hallmarkStamp.slice(0, 8)}...
                            </div>
                          )}
                          <div className="flex items-center gap-1 text-[10px] text-slate-500 ml-auto">
                            <Clock className="h-3 w-3" />
                            {formatDate(asset.updatedAt || asset.createdAt)}
                          </div>
                        </div>
                      </BentoTile>
                    ))}
                  </SwipeCarousel>
                )}
              </TabsContent>
              
              <TabsContent value="history" className="mt-4">
                {history.length === 0 ? (
                  <BentoTile 
                    variant="glass" 
                    size="lg" 
                    interactive={false}
                    icon={<History className="h-8 w-8 text-slate-500" />}
                    title="No Activity History"
                    description="Your asset moves and actions will appear here"
                    data-testid="empty-history"
                  />
                ) : (
                  <SwipeCarousel itemWidth="260px" gap={12} showPeek>
                    {history.map((item: any, index: number) => (
                      <BentoTile
                        key={item.id || index}
                        variant="glass"
                        size="sm"
                        className="h-full"
                        data-testid={`card-history-${item.id || index}`}
                      >
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-lg bg-blue-600/20 flex items-center justify-center shrink-0">
                            <History className="h-5 w-5 text-blue-400" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2">
                              <span className="font-medium text-sm capitalize">{item.action || "Action"}</span>
                            </div>
                            {item.assetName && (
                              <Badge variant="outline" className="text-[10px] border-slate-600 mt-1">
                                {item.assetName}
                              </Badge>
                            )}
                          </div>
                        </div>
                        
                        <p className="text-slate-400 text-xs mt-2 line-clamp-2">
                          {item.actionDescription || "No description"}
                        </p>
                        
                        <div className="flex items-center gap-1 text-[10px] text-slate-500 mt-2 pt-2 border-t border-slate-700/50">
                          <Clock className="h-3 w-3" />
                          {formatDate(item.createdAt)}
                        </div>
                      </BentoTile>
                    ))}
                  </SwipeCarousel>
                )}
              </TabsContent>
              
              <TabsContent value="scans" className="mt-4">
                {scans.length === 0 ? (
                  <BentoTile 
                    variant="glass" 
                    size="lg" 
                    interactive={false}
                    icon={<Scan className="h-8 w-8 text-slate-500" />}
                    title="No Scan Records"
                    description="Your VIN scans and QR codes will appear here"
                    data-testid="empty-scans"
                  />
                ) : (
                  <SwipeCarousel itemWidth="280px" gap={12} showPeek>
                    {scans.map((scan: any, index: number) => (
                      <BentoTile
                        key={scan.id || index}
                        variant="glass"
                        size="sm"
                        className="h-full"
                        data-testid={`card-scan-${scan.id || index}`}
                      >
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-lg bg-green-600/20 flex items-center justify-center shrink-0">
                            <Scan className="h-5 w-5 text-green-400" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <span className="font-mono text-sm block truncate">{scan.scannedValue || scan.vin || "Scan"}</span>
                            <Badge className="text-[10px] bg-green-600/20 text-green-400 mt-1">
                              {scan.scanType || "VIN"}
                            </Badge>
                          </div>
                        </div>
                        
                        {scan.location && (
                          <div className="flex items-center gap-1 text-xs text-slate-400 mt-2">
                            <MapPin className="h-3 w-3" />
                            {scan.location}
                          </div>
                        )}
                        
                        <div className="flex items-center gap-1 text-[10px] text-slate-500 mt-2 pt-2 border-t border-slate-700/50">
                          <Clock className="h-3 w-3" />
                          {formatDate(scan.scannedAt)}
                        </div>
                      </BentoTile>
                    ))}
                  </SwipeCarousel>
                )}
              </TabsContent>
            </>
          )}
        </Tabs>
        
        <BentoTile
          variant="glass"
          size="wide"
          icon={<Shield className="h-5 w-5 text-slate-400" />}
          interactive={false}
          data-testid="tile-privacy"
        >
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-medium mb-1 text-sm">Data Privacy</h3>
              <p className="text-xs text-slate-400">
                This page shows only your personal activity. Company searches and cross-tenant data require elevated permissions.
              </p>
            </div>
            <ChevronRight className="h-5 w-5 text-slate-500 shrink-0 ml-4" />
          </div>
        </BentoTile>
      </div>
    </div>
  );
}
