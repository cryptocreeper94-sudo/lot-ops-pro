import { useState, useRef, useCallback } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter, DialogTrigger } from "@/components/ui/dialog";
import { Camera, ListChecks, Check, CheckCircle2, Send, Loader2, ScanLine, X, Trash2, Clock, MapPin } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import type { ScannedList } from "@shared/schema";
import Tesseract from "tesseract.js";

interface ListItem {
  id: string;
  text: string;
  completed: boolean;
  completedAt?: string;
}

interface ListScannerProps {
  driverName: string;
  driverPin: string;
  onComplete?: () => void;
}

export function ListScanner({ driverName, driverPin, onComplete }: ListScannerProps) {
  const [isScanning, setIsScanning] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [showCamera, setShowCamera] = useState(false);
  const [capturedImage, setCapturedImage] = useState<string | null>(null);
  const [ocrText, setOcrText] = useState<string>("");
  const [listTitle, setListTitle] = useState("");
  const [lane, setLane] = useState("");
  const [zone, setZone] = useState("");
  const [parsedItems, setParsedItems] = useState<ListItem[]>([]);
  const [activeListId, setActiveListId] = useState<number | null>(null);
  const [showCompleteDialog, setShowCompleteDialog] = useState(false);
  
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: activeLists = [], isLoading: loadingLists } = useQuery<ScannedList[]>({
    queryKey: ['/api/scanned-lists', driverPin],
    enabled: !!driverPin
  });

  const activeList = activeLists.find(l => l.status === 'active');

  const createListMutation = useMutation({
    mutationFn: async (data: { title: string; items: string; totalItems: number; lane?: string; zone?: string; ocrRawText?: string; originalImageBase64?: string; assignedToDriverName: string; assignedToDriverPin: string }) => {
      const res = await apiRequest('POST', '/api/scanned-lists', data);
      return res.json();
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['/api/scanned-lists'] });
      setActiveListId(data.id);
      toast({ title: "List Created", description: `${parsedItems.length} items ready to check off` });
      resetScanState();
    },
    onError: () => {
      toast({ title: "Error", description: "Failed to create list", variant: "destructive" });
    }
  });

  const updateListMutation = useMutation({
    mutationFn: async ({ id, updates }: { id: number; updates: Partial<ScannedList> }) => {
      const res = await apiRequest('PATCH', `/api/scanned-lists/${id}`, updates);
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/scanned-lists'] });
    }
  });

  const completeListMutation = useMutation({
    mutationFn: async (id: number) => {
      const res = await apiRequest('POST', `/api/scanned-lists/${id}/complete`, { driverName, driverPin });
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/scanned-lists'] });
      setShowCompleteDialog(false);
      setActiveListId(null);
      toast({ 
        title: "Assignment Complete!", 
        description: "Supervisor has been notified. Ready for next task!" 
      });
      onComplete?.();
    },
    onError: () => {
      toast({ title: "Error", description: "Failed to complete assignment", variant: "destructive" });
    }
  });

  const deleteListMutation = useMutation({
    mutationFn: async (id: number) => {
      await apiRequest('DELETE', `/api/scanned-lists/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/scanned-lists'] });
      setActiveListId(null);
      toast({ title: "List Deleted" });
    }
  });

  const startCamera = useCallback(async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ 
        video: { facingMode: 'environment', width: { ideal: 1920 }, height: { ideal: 1080 } } 
      });
      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }
      setShowCamera(true);
    } catch (error) {
      toast({ title: "Camera Error", description: "Could not access camera", variant: "destructive" });
    }
  }, [toast]);

  const stopCamera = useCallback(() => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }
    setShowCamera(false);
  }, []);

  const captureImage = useCallback(() => {
    if (videoRef.current && canvasRef.current) {
      const video = videoRef.current;
      const canvas = canvasRef.current;
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.drawImage(video, 0, 0);
        const imageData = canvas.toDataURL('image/jpeg', 0.9);
        setCapturedImage(imageData);
        stopCamera();
        processImage(imageData);
      }
    }
  }, [stopCamera]);

  const processImage = async (imageData: string) => {
    setIsProcessing(true);
    try {
      const result = await Tesseract.recognize(imageData, 'eng', {
        logger: (m) => {
          if (m.status === 'recognizing text') {
            setIsScanning(true);
          }
        }
      });
      
      const text = result.data.text;
      setOcrText(text);
      
      const items = parseListItems(text);
      setParsedItems(items);
      
      if (items.length === 0) {
        toast({ title: "No Items Found", description: "Try taking a clearer photo of the list", variant: "destructive" });
      } else {
        toast({ title: "List Scanned", description: `Found ${items.length} items` });
      }
    } catch (error) {
      console.error("OCR Error:", error);
      toast({ title: "Scan Failed", description: "Could not read the list", variant: "destructive" });
    } finally {
      setIsProcessing(false);
      setIsScanning(false);
    }
  };

  const parseListItems = (text: string): ListItem[] => {
    const lines = text.split('\n')
      .map(line => line.trim())
      .filter(line => {
        if (line.length < 2) return false;
        if (/^\d+[\.\)\-]?\s*$/.test(line)) return false;
        const hasNumber = /\d{2,}/.test(line);
        const hasLetters = /[a-zA-Z]{2,}/.test(line);
        return hasNumber || hasLetters;
      });
    
    return lines.map((text, index) => ({
      id: `item-${index}-${Date.now()}`,
      text: text.replace(/^[\d\.\)\-\s]+/, '').trim() || text,
      completed: false
    }));
  };

  const resetScanState = () => {
    setCapturedImage(null);
    setOcrText("");
    setParsedItems([]);
    setListTitle("");
    setLane("");
    setZone("");
  };

  const handleCreateList = () => {
    if (parsedItems.length === 0) return;
    
    const title = listTitle || `Scanned List - ${new Date().toLocaleTimeString()}`;
    
    createListMutation.mutate({
      title,
      items: JSON.stringify(parsedItems),
      totalItems: parsedItems.length,
      lane: lane || undefined,
      zone: zone || undefined,
      ocrRawText: ocrText,
      originalImageBase64: capturedImage || undefined,
      assignedToDriverName: driverName,
      assignedToDriverPin: driverPin
    });
  };

  const toggleItem = (listId: number, itemId: string, items: ListItem[]) => {
    const updatedItems = items.map(item => {
      if (item.id === itemId) {
        return { 
          ...item, 
          completed: !item.completed, 
          completedAt: !item.completed ? new Date().toISOString() : undefined 
        };
      }
      return item;
    });
    
    const completedCount = updatedItems.filter(i => i.completed).length;
    
    updateListMutation.mutate({
      id: listId,
      updates: {
        items: JSON.stringify(updatedItems),
        completedItems: completedCount
      }
    });
  };

  const getListProgress = (list: ScannedList): number => {
    if (!list.totalItems) return 0;
    return Math.round(((list.completedItems || 0) / list.totalItems) * 100);
  };

  if (loadingLists) {
    return (
      <div className="flex items-center justify-center p-8">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  if (activeList) {
    const items: ListItem[] = JSON.parse(activeList.items || '[]');
    const progress = getListProgress(activeList);
    const allComplete = progress === 100;
    
    return (
      <Card className="border-2 border-primary/20">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between gap-2">
            <div className="flex-1 min-w-0">
              <CardTitle className="text-lg truncate">{activeList.title}</CardTitle>
              <CardDescription className="flex items-center gap-2 flex-wrap mt-1">
                {activeList.lane && (
                  <Badge variant="outline" className="text-xs">
                    <MapPin className="w-3 h-3 mr-1" />
                    {activeList.lane}
                  </Badge>
                )}
                {activeList.zone && (
                  <Badge variant="secondary" className="text-xs">{activeList.zone}</Badge>
                )}
                <span className="text-xs text-muted-foreground flex items-center">
                  <Clock className="w-3 h-3 mr-1" />
                  {new Date(activeList.createdAt).toLocaleTimeString()}
                </span>
              </CardDescription>
            </div>
            <Button
              size="icon"
              variant="ghost"
              onClick={() => deleteListMutation.mutate(activeList.id)}
              data-testid="button-delete-list"
            >
              <Trash2 className="w-4 h-4 text-destructive" />
            </Button>
          </div>
          
          <div className="mt-3">
            <div className="flex items-center justify-between text-sm mb-1">
              <span>{activeList.completedItems || 0} of {activeList.totalItems} complete</span>
              <span className="font-semibold">{progress}%</span>
            </div>
            <Progress value={progress} className="h-2" />
          </div>
        </CardHeader>
        
        <CardContent className="max-h-[50vh] overflow-y-auto space-y-2">
          {items.map((item) => (
            <div
              key={item.id}
              className={`flex items-center gap-3 p-3 rounded-md transition-colors ${
                item.completed ? 'bg-green-50 dark:bg-green-950/20' : 'bg-muted/50'
              }`}
              data-testid={`list-item-${item.id}`}
            >
              <Checkbox
                checked={item.completed}
                onCheckedChange={() => toggleItem(activeList.id, item.id, items)}
                className="h-6 w-6"
                data-testid={`checkbox-${item.id}`}
              />
              <span className={`flex-1 text-sm ${item.completed ? 'line-through text-muted-foreground' : ''}`}>
                {item.text}
              </span>
              {item.completed && (
                <CheckCircle2 className="w-5 h-5 text-green-600 flex-shrink-0" />
              )}
            </div>
          ))}
        </CardContent>
        
        <CardFooter className="pt-4">
          <Dialog open={showCompleteDialog} onOpenChange={setShowCompleteDialog}>
            <DialogTrigger asChild>
              <Button 
                className="w-full" 
                size="lg"
                variant={allComplete ? "default" : "secondary"}
                disabled={!allComplete && items.some(i => !i.completed)}
                data-testid="button-assignment-complete"
              >
                {allComplete ? (
                  <>
                    <CheckCircle2 className="w-5 h-5 mr-2" />
                    Assignment Complete - Notify Supervisor
                  </>
                ) : (
                  <>
                    <ListChecks className="w-5 h-5 mr-2" />
                    Complete Remaining Items ({items.filter(i => !i.completed).length} left)
                  </>
                )}
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle className="flex items-center gap-2">
                  <CheckCircle2 className="w-6 h-6 text-green-600" />
                  Complete Assignment?
                </DialogTitle>
                <DialogDescription>
                  This will mark "{activeList.title}" as complete and notify your supervisor that you're ready for the next task.
                </DialogDescription>
              </DialogHeader>
              <div className="py-4 space-y-2">
                <div className="flex justify-between text-sm">
                  <span>Items Completed:</span>
                  <span className="font-semibold">{activeList.completedItems} / {activeList.totalItems}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span>Driver:</span>
                  <span className="font-semibold">{driverName}</span>
                </div>
                {activeList.lane && (
                  <div className="flex justify-between text-sm">
                    <span>Lane:</span>
                    <span className="font-semibold">{activeList.lane}</span>
                  </div>
                )}
              </div>
              <DialogFooter className="gap-2">
                <Button variant="outline" onClick={() => setShowCompleteDialog(false)}>
                  Cancel
                </Button>
                <Button 
                  onClick={() => completeListMutation.mutate(activeList.id)}
                  disabled={completeListMutation.isPending}
                  data-testid="button-confirm-complete"
                >
                  {completeListMutation.isPending ? (
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  ) : (
                    <Send className="w-4 h-4 mr-2" />
                  )}
                  Complete & Notify Supervisor
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </CardFooter>
      </Card>
    );
  }

  if (showCamera) {
    return (
      <Card className="overflow-hidden">
        <CardContent className="p-0 relative">
          <video 
            ref={videoRef} 
            autoPlay 
            playsInline 
            className="w-full aspect-[4/3] object-cover bg-black"
          />
          <canvas ref={canvasRef} className="hidden" />
          
          <div className="absolute inset-0 pointer-events-none">
            <div className="absolute inset-8 border-2 border-white/50 rounded-lg" />
            <div className="absolute top-1/2 left-8 right-8 h-0.5 bg-red-500/50 animate-pulse" />
          </div>
          
          <div className="absolute bottom-4 left-0 right-0 flex justify-center gap-4">
            <Button variant="outline" size="lg" onClick={stopCamera} data-testid="button-cancel-scan">
              <X className="w-5 h-5 mr-2" />
              Cancel
            </Button>
            <Button size="lg" onClick={captureImage} data-testid="button-capture">
              <Camera className="w-5 h-5 mr-2" />
              Capture
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (isProcessing || isScanning) {
    return (
      <Card>
        <CardContent className="py-12 text-center">
          <div className="relative inline-block">
            <ScanLine className="w-16 h-16 text-primary animate-pulse" />
            <Loader2 className="w-8 h-8 absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 animate-spin text-primary" />
          </div>
          <p className="mt-4 text-lg font-medium">Scanning List...</p>
          <p className="text-sm text-muted-foreground">Reading text from image</p>
        </CardContent>
      </Card>
    );
  }

  if (capturedImage && parsedItems.length > 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <ListChecks className="w-5 h-5 text-primary" />
            Review Scanned List
          </CardTitle>
          <CardDescription>
            Found {parsedItems.length} items. Add details and create your checklist.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-4 sm:grid-cols-3">
            <div className="sm:col-span-3">
              <Label htmlFor="title">List Title</Label>
              <Input
                id="title"
                value={listTitle}
                onChange={(e) => setListTitle(e.target.value)}
                placeholder="e.g., Sold Cars - Lane 20"
                data-testid="input-list-title"
              />
            </div>
            <div>
              <Label htmlFor="lane">Lane (optional)</Label>
              <Input
                id="lane"
                value={lane}
                onChange={(e) => setLane(e.target.value)}
                placeholder="e.g., Lane 20"
                data-testid="input-lane"
              />
            </div>
            <div>
              <Label htmlFor="zone">Zone (optional)</Label>
              <Input
                id="zone"
                value={zone}
                onChange={(e) => setZone(e.target.value)}
                placeholder="e.g., Clean Side"
                data-testid="input-zone"
              />
            </div>
          </div>
          
          <div className="border rounded-md p-3 max-h-48 overflow-y-auto bg-muted/30">
            <p className="text-xs font-medium text-muted-foreground mb-2">Items Preview:</p>
            {parsedItems.map((item, i) => (
              <div key={item.id} className="text-sm py-1 border-b last:border-0">
                {i + 1}. {item.text}
              </div>
            ))}
          </div>
        </CardContent>
        <CardFooter className="gap-2 flex-wrap">
          <Button variant="outline" onClick={resetScanState} data-testid="button-rescan">
            <Camera className="w-4 h-4 mr-2" />
            Rescan
          </Button>
          <Button 
            onClick={handleCreateList}
            disabled={createListMutation.isPending}
            className="flex-1"
            data-testid="button-create-list"
          >
            {createListMutation.isPending ? (
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
            ) : (
              <Check className="w-4 h-4 mr-2" />
            )}
            Create Checklist ({parsedItems.length} items)
          </Button>
        </CardFooter>
      </Card>
    );
  }

  return (
    <Card className="hover-elevate cursor-pointer" onClick={startCamera}>
      <CardContent className="py-8 text-center">
        <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-primary/10 mb-4">
          <ScanLine className="w-8 h-8 text-primary" />
        </div>
        <h3 className="text-lg font-semibold">Scan Paper List</h3>
        <p className="text-sm text-muted-foreground mt-1">
          Take a photo of your assignment list to create a digital checklist
        </p>
        <Button className="mt-4" size="lg" data-testid="button-scan-list">
          <Camera className="w-5 h-5 mr-2" />
          Start Scanning
        </Button>
      </CardContent>
    </Card>
  );
}
