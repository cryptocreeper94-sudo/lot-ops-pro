import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Calendar, MapIcon, ZoomIn, ZoomOut, X } from "lucide-react";

interface WeeklyMap {
  id: number;
  weekNumber: number;
  year: number;
  effectiveDate: string | null;
  mapImageUrl: string | null;
  isActive: boolean;
  notes: string | null;
}

interface WeeklyMapViewerProps {
  open: boolean;
  onClose: () => void;
}

export function WeeklyMapViewer({ open, onClose }: WeeklyMapViewerProps) {
  const [zoom, setZoom] = useState(100);

  const { data: maps = [] } = useQuery<WeeklyMap[]>({
    queryKey: ["/api/weekly-maps"],
    enabled: open,
  });

  const activeMap = maps.find(m => m.isActive);

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] p-0">
        <DialogHeader className="p-3 border-b">
          <div className="flex items-center justify-between">
            <DialogTitle className="text-base flex items-center gap-2">
              <Calendar className="h-4 w-4" />
              {activeMap ? `Week ${activeMap.weekNumber} Lane Map` : "No Active Map"}
            </DialogTitle>
            {activeMap && (
              <Badge className="bg-green-600 text-white text-xs">
                ACTIVE
              </Badge>
            )}
          </div>
          {activeMap?.effectiveDate && (
            <p className="text-xs text-gray-500">Effective: {activeMap.effectiveDate}</p>
          )}
        </DialogHeader>

        <div className="p-3">
          {!activeMap ? (
            <div className="text-center py-12">
              <MapIcon className="h-12 w-12 text-gray-300 mx-auto mb-3" />
              <p className="text-gray-500 text-sm">No weekly map is currently active</p>
              <p className="text-gray-400 text-xs mt-1">Contact your supervisor for the current week's configuration</p>
            </div>
          ) : !activeMap.mapImageUrl ? (
            <div className="text-center py-12">
              <MapIcon className="h-12 w-12 text-gray-300 mx-auto mb-3" />
              <p className="text-gray-500 text-sm">Week {activeMap.weekNumber} has no map image</p>
              <p className="text-gray-400 text-xs mt-1">The map image has not been uploaded yet</p>
            </div>
          ) : (
            <div className="space-y-2">
              {/* Zoom Controls */}
              <div className="flex items-center justify-between bg-gray-50 p-2 rounded">
                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setZoom(Math.max(50, zoom - 25))}
                    disabled={zoom <= 50}
                    className="h-7 px-2"
                  >
                    <ZoomOut className="h-3 w-3" />
                  </Button>
                  <span className="text-xs font-medium text-gray-700 min-w-[3rem] text-center">
                    {zoom}%
                  </span>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setZoom(Math.min(300, zoom + 25))}
                    disabled={zoom >= 300}
                    className="h-7 px-2"
                  >
                    <ZoomIn className="h-3 w-3" />
                  </Button>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setZoom(100)}
                  className="h-7 text-xs"
                >
                  Reset
                </Button>
              </div>

              {/* Map Image */}
              <div className="border rounded-lg bg-gray-50 overflow-auto max-h-[60vh]">
                <img
                  src={activeMap.mapImageUrl}
                  alt={`Week ${activeMap.weekNumber} lane configuration`}
                  style={{ width: `${zoom}%` }}
                  className="mx-auto"
                />
              </div>

              {/* Notes */}
              {activeMap.notes && (
                <div className="bg-blue-50 border border-blue-200 rounded p-2">
                  <p className="text-xs text-blue-900">
                    <strong>Notes:</strong> {activeMap.notes}
                  </p>
                </div>
              )}
            </div>
          )}
        </div>

        <div className="p-3 border-t flex justify-end">
          <Button
            onClick={onClose}
            variant="outline"
            size="sm"
            data-testid="button-close-map"
          >
            <X className="h-4 w-4 mr-1" />
            Close
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
