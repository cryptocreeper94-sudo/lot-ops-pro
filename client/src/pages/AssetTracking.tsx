import { useState, useEffect } from "react";
import { useLocation } from "wouter";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { QrCode, Search, Plus, FileText, Clock, User } from "lucide-react";
import { toast } from "sonner";
import { NavigationControl } from "@/components/NavigationControl";

interface Asset {
  id: number;
  assetNumber: string;
  assetName: string;
  assetType: string;
  serialNumber?: string;
  qrCode?: string;
  hallmarkStamp: string;
  originalAssignedToName?: string;
  currentOwnerName?: string;
  status: string;
  location?: string;
  createdAt: string;
  updatedAt: string;
}

interface HistoryEntry {
  id: number;
  action: string;
  actionDescription?: string;
  performedByName?: string;
  fromValue?: string;
  toValue?: string;
  hallmarkStamp: string;
  createdAt: string;
}

export default function AssetTracking() {
  const [_, setLocation] = useLocation();
  const [user, setUser] = useState<any>(null);
  const [assets, setAssets] = useState<Asset[]>([]);
  const [selectedAsset, setSelectedAsset] = useState<Asset | null>(null);
  const [history, setHistory] = useState<HistoryEntry[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [loading, setLoading] = useState(false);

  const [newAsset, setNewAsset] = useState({
    assetNumber: "",
    assetName: "",
    assetType: "equipment",
    serialNumber: "",
    qrCode: "",
    location: "",
    notes: "",
  });

  useEffect(() => {
    const userStr = localStorage.getItem("vanops_user");
    if (!userStr) {
      setLocation("/");
      return;
    }

    const userData = JSON.parse(userStr);
    if (!["developer", "operations_manager"].includes(userData.role)) {
      toast.error("Access denied. Only developers and operations managers can access asset tracking.");
      setLocation("/dashboard");
      return;
    }

    setUser(userData);
    fetchAssets();
  }, []);

  const fetchAssets = async () => {
    try {
      setLoading(true);
      const res = await fetch("/api/assets");
      if (res.ok) {
        const data = await res.json();
        setAssets(data);
      }
    } catch (error) {
      console.error("Failed to fetch assets:", error);
      toast.error("Failed to load assets");
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = async () => {
    if (!searchQuery.trim()) {
      fetchAssets();
      return;
    }

    try {
      setLoading(true);
      const res = await fetch(`/api/assets/search?q=${encodeURIComponent(searchQuery)}`);
      if (res.ok) {
        const data = await res.json();
        setAssets(data);
      }
    } catch (error) {
      toast.error("Search failed");
    } finally {
      setLoading(false);
    }
  };

  const handleSelectAsset = async (asset: Asset) => {
    setSelectedAsset(asset);
    try {
      const res = await fetch(`/api/assets/${asset.id}/history`);
      if (res.ok) {
        const data = await res.json();
        setHistory(data);
      }
    } catch (error) {
      console.error("Failed to fetch history:", error);
    }
  };

  const handleCreateAsset = async () => {
    if (!newAsset.assetNumber || !newAsset.assetName) {
      toast.error("Asset number and name are required");
      return;
    }

    try {
      const res = await fetch("/api/assets", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...newAsset,
          hallmarkStamp: "Lot Ops Pro", // Auto-stamp with current hallmark
          originalAssignedTo: user.id,
          originalAssignedToName: user.name,
          currentOwner: user.id,
          currentOwnerName: user.name,
        }),
      });

      if (res.ok) {
        toast.success("Asset created and stamped with hallmark");
        setNewAsset({
          assetNumber: "",
          assetName: "",
          assetType: "equipment",
          serialNumber: "",
          qrCode: "",
          location: "",
          notes: "",
        });
        fetchAssets();
      }
    } catch (error) {
      toast.error("Failed to create asset");
    }
  };

  if (!user) return <div className="p-4">Loading...</div>;

  return (
    <div className="min-h-screen bg-slate-900 p-4 md:p-8">
      <div className="max-w-7xl mx-auto space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold text-white">Asset Tracking System</h1>
          <NavigationControl variant="back" fallbackRoute="/dashboard" />
        </div>

        <Tabs defaultValue="browse" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="browse">Browse Assets</TabsTrigger>
            <TabsTrigger value="create">Create Asset</TabsTrigger>
          </TabsList>

          {/* Browse Assets Tab */}
          <TabsContent value="browse" className="space-y-4">
            {/* Search */}
            <Card className="bg-white/5 border-slate-700">
              <CardHeader>
                <CardTitle className="text-white flex items-center gap-2">
                  <Search className="h-5 w-5" />
                  Search Assets
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex gap-2">
                  <Input
                    placeholder="Search by name, asset #, serial, QR code, or owner..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && handleSearch()}
                    data-testid="input-search"
                    className="flex-1"
                  />
                  <Button onClick={handleSearch} data-testid="button-search">
                    Search
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => {
                      setSearchQuery("");
                      fetchAssets();
                    }}
                    data-testid="button-clear"
                  >
                    Clear
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Assets List */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {loading ? (
                <p className="text-slate-300">Loading assets...</p>
              ) : assets.length === 0 ? (
                <p className="text-slate-400">No assets found</p>
              ) : (
                assets.map((asset) => (
                  <Card
                    key={asset.id}
                    className="bg-white/5 border-slate-700 cursor-pointer hover:bg-white/10 transition"
                    onClick={() => handleSelectAsset(asset)}
                    data-testid={`card-asset-${asset.id}`}
                  >
                    <CardContent className="p-4 space-y-3">
                      <div className="flex items-start justify-between">
                        <div>
                          <h3 className="text-white font-semibold" data-testid={`text-name-${asset.id}`}>
                            {asset.assetName}
                          </h3>
                          <p className="text-slate-400 text-sm">#{asset.assetNumber}</p>
                        </div>
                        <Badge variant="outline" className={asset.status === "active" ? "bg-green-600" : "bg-red-600"}>
                          {asset.status}
                        </Badge>
                      </div>

                      <div className="space-y-1 text-sm">
                        {asset.serialNumber && (
                          <p className="text-slate-300">
                            <span className="text-slate-500">Serial:</span> {asset.serialNumber}
                          </p>
                        )}
                        {asset.qrCode && (
                          <p className="text-slate-300 flex items-center gap-2">
                            <QrCode className="h-3 w-3" />
                            {asset.qrCode}
                          </p>
                        )}
                        <p className="text-slate-300">
                          <span className="text-slate-500">Owner:</span> {asset.currentOwnerName || "Unassigned"}
                        </p>
                      </div>

                      <div className="pt-2 border-t border-slate-700">
                        <p className="text-xs text-slate-400">
                          Hallmark: <span className="text-blue-400 font-semibold">{asset.hallmarkStamp}</span>
                        </p>
                      </div>
                    </CardContent>
                  </Card>
                ))
              )}
            </div>
          </TabsContent>

          {/* Create Asset Tab */}
          <TabsContent value="create">
            <Card className="bg-white/5 border-slate-700">
              <CardHeader>
                <CardTitle className="text-white flex items-center gap-2">
                  <Plus className="h-5 w-5" />
                  Create New Asset
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label className="text-white">Asset Number *</Label>
                    <Input
                      value={newAsset.assetNumber}
                      onChange={(e) => setNewAsset({ ...newAsset, assetNumber: e.target.value })}
                      placeholder="AST-001"
                      data-testid="input-asset-number"
                    />
                  </div>

                  <div>
                    <Label className="text-white">Asset Name *</Label>
                    <Input
                      value={newAsset.assetName}
                      onChange={(e) => setNewAsset({ ...newAsset, assetName: e.target.value })}
                      placeholder="Vehicle, Equipment, etc."
                      data-testid="input-asset-name"
                    />
                  </div>

                  <div>
                    <Label className="text-white">Asset Type</Label>
                    <select
                      value={newAsset.assetType}
                      onChange={(e) => setNewAsset({ ...newAsset, assetType: e.target.value })}
                      className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded text-white"
                      data-testid="select-type"
                    >
                      <option value="equipment">Equipment</option>
                      <option value="vehicle">Vehicle</option>
                      <option value="device">Device</option>
                      <option value="document">Document</option>
                      <option value="other">Other</option>
                    </select>
                  </div>

                  <div>
                    <Label className="text-white">Serial Number</Label>
                    <Input
                      value={newAsset.serialNumber}
                      onChange={(e) => setNewAsset({ ...newAsset, serialNumber: e.target.value })}
                      placeholder="Serial #"
                      data-testid="input-serial"
                    />
                  </div>

                  <div>
                    <Label className="text-white">QR Code</Label>
                    <Input
                      value={newAsset.qrCode}
                      onChange={(e) => setNewAsset({ ...newAsset, qrCode: e.target.value })}
                      placeholder="QR Code identifier"
                      data-testid="input-qr"
                    />
                  </div>

                  <div>
                    <Label className="text-white">Location</Label>
                    <Input
                      value={newAsset.location}
                      onChange={(e) => setNewAsset({ ...newAsset, location: e.target.value })}
                      placeholder="Current location"
                      data-testid="input-location"
                    />
                  </div>
                </div>

                <div>
                  <Label className="text-white">Notes</Label>
                  <textarea
                    value={newAsset.notes}
                    onChange={(e) => setNewAsset({ ...newAsset, notes: e.target.value })}
                    placeholder="Additional notes..."
                    className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded text-white"
                    rows={3}
                    data-testid="textarea-notes"
                  />
                </div>

                <Button
                  onClick={handleCreateAsset}
                  className="w-full bg-blue-600 hover:bg-blue-700"
                  data-testid="button-create"
                >
                  Create Asset (Auto-Stamped with Hallmark)
                </Button>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        {/* Asset Detail & History */}
        {selectedAsset && (
          <Card className="bg-white/5 border-slate-700">
            <CardHeader>
              <CardTitle className="text-white">Asset Details & History</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="bg-slate-800/50 p-4 rounded">
                  <h3 className="text-slate-300 text-sm font-semibold mb-2">Asset Information</h3>
                  <div className="space-y-2 text-sm">
                    <p className="text-white"><span className="text-slate-400">Name:</span> {selectedAsset.assetName}</p>
                    <p className="text-white"><span className="text-slate-400">Number:</span> {selectedAsset.assetNumber}</p>
                    <p className="text-white"><span className="text-slate-400">Type:</span> {selectedAsset.assetType}</p>
                    {selectedAsset.serialNumber && (
                      <p className="text-white"><span className="text-slate-400">Serial:</span> {selectedAsset.serialNumber}</p>
                    )}
                    {selectedAsset.qrCode && (
                      <p className="text-white flex items-center gap-1">
                        <QrCode className="h-3 w-3" />
                        {selectedAsset.qrCode}
                      </p>
                    )}
                  </div>
                </div>

                <div className="bg-slate-800/50 p-4 rounded">
                  <h3 className="text-slate-300 text-sm font-semibold mb-2">Assignment & Hallmark</h3>
                  <div className="space-y-2 text-sm">
                    <p className="text-white flex items-center gap-2">
                      <User className="h-4 w-4" />
                      <span className="text-slate-400">Original:</span> {selectedAsset.originalAssignedToName || "N/A"}
                    </p>
                    <p className="text-white flex items-center gap-2">
                      <User className="h-4 w-4" />
                      <span className="text-slate-400">Current:</span> {selectedAsset.currentOwnerName || "Unassigned"}
                    </p>
                    <p className="text-white">
                      <span className="text-slate-400">Hallmark:</span>
                      <Badge className="ml-2 bg-blue-600">{selectedAsset.hallmarkStamp}</Badge>
                    </p>
                  </div>
                </div>
              </div>

              {/* History Timeline */}
              <div>
                <h3 className="text-white font-semibold mb-4 flex items-center gap-2">
                  <Clock className="h-5 w-5" />
                  Full History
                </h3>
                <div className="space-y-3 max-h-96 overflow-y-auto">
                  {history.length === 0 ? (
                    <p className="text-slate-400">No history yet</p>
                  ) : (
                    history.map((entry) => (
                      <div
                        key={entry.id}
                        className="bg-slate-800/30 border-l-4 border-blue-500 p-3 rounded text-sm"
                      >
                        <div className="flex items-start justify-between">
                          <div>
                            <p className="text-white font-semibold capitalize">{entry.action}</p>
                            {entry.actionDescription && (
                              <p className="text-slate-300 text-xs">{entry.actionDescription}</p>
                            )}
                            {entry.fromValue && (
                              <p className="text-slate-400 text-xs mt-1">
                                {entry.fromValue} → {entry.toValue}
                              </p>
                            )}
                            <p className="text-slate-500 text-xs mt-1">
                              by {entry.performedByName || "System"}
                            </p>
                          </div>
                          <div className="text-right">
                            <Badge className="bg-blue-600 mb-1">{entry.hallmarkStamp}</Badge>
                            <p className="text-xs text-slate-400">
                              {new Date(entry.createdAt).toLocaleDateString()}
                            </p>
                          </div>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
