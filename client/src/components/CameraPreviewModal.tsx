import { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { X, Camera, Video, SwitchCamera, Loader2, CheckCircle2, RotateCcw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useCameraSession, CameraMode } from '@/hooks/useCameraSession';
import { cn } from '@/lib/utils';

interface CameraPreviewModalProps {
  isOpen: boolean;
  mode: CameraMode;
  title?: string;
  description?: string;
  onClose: () => void;
  onCapture: (dataUrl: string) => void;
  onProcessing?: (dataUrl: string) => Promise<void>;
  showScanFrame?: boolean;
}

export function CameraPreviewModal({
  isOpen,
  mode,
  title = 'Camera',
  description = 'Align and capture',
  onClose,
  onCapture,
  onProcessing,
  showScanFrame = false
}: CameraPreviewModalProps) {
  const [capturedImage, setCapturedImage] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [processingStatus, setProcessingStatus] = useState('');

  const {
    videoRef,
    canvasRef,
    isActive,
    isRecording,
    error,
    currentFacing,
    startCamera,
    stopCamera,
    capturePhoto,
    startVideoRecording,
    stopVideoRecording,
    switchCamera
  } = useCameraSession({
    mode,
    facingMode: 'environment',
    onError: (err) => {
      console.error('Camera error:', err);
    }
  });

  useEffect(() => {
    if (isOpen && !isActive) {
      startCamera();
    }
    
    if (!isOpen) {
      stopCamera();
      setCapturedImage(null);
      setIsProcessing(false);
    }
  }, [isOpen]);

  const handleCapture = async () => {
    if (mode === 'video') {
      if (isRecording) {
        stopVideoRecording();
      } else {
        startVideoRecording();
      }
      return;
    }

    const photo = capturePhoto();
    if (photo) {
      setCapturedImage(photo);
      
      if (onProcessing) {
        setIsProcessing(true);
        setProcessingStatus('Processing...');
        try {
          await onProcessing(photo);
          setProcessingStatus('Complete!');
        } catch (err) {
          console.error('Processing error:', err);
          setProcessingStatus('Processing failed');
        } finally {
          setTimeout(() => {
            setIsProcessing(false);
            setProcessingStatus('');
          }, 1000);
        }
      }
    }
  };

  const handleConfirm = () => {
    if (capturedImage && !isProcessing) {
      onCapture(capturedImage);
      // Don't auto-close - let the capture handler decide
    }
  };

  const handleRetake = () => {
    setCapturedImage(null);
    setIsProcessing(false);
    setProcessingStatus('');
    startCamera();
  };

  const handleClose = () => {
    stopCamera();
    setCapturedImage(null);
    setIsProcessing(false);
    setProcessingStatus('');
    onClose();
  };

  // Lock body scroll when modal is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
      return () => {
        document.body.style.overflow = '';
      };
    }
  }, [isOpen]);

  if (!isOpen) return null;

  // Get the portal container - render outside DOM hierarchy to avoid clipping
  const portalContainer = document.getElementById('camera-root');
  if (!portalContainer) {
    console.error('Camera root container not found');
    return null;
  }

  return createPortal(
    <div className="fixed inset-0 bg-black flex flex-col" style={{ zIndex: 99999 }}>
      {/* Header */}
      <div className="bg-slate-900/95 backdrop-blur-sm p-4 flex items-center justify-between border-b border-slate-700">
        <div className="flex-1">
          <h2 className="text-white font-bold text-lg">{title}</h2>
          <p className="text-slate-400 text-sm">{description}</p>
        </div>
        <Button
          variant="ghost"
          size="sm"
          onClick={handleClose}
          className="text-white hover:bg-slate-800"
          data-testid="button-close-camera"
        >
          <X className="h-5 w-5" />
        </Button>
      </div>

      {/* Camera Preview / Captured Image */}
      <div className="flex-1 relative bg-black overflow-hidden">
        {!capturedImage ? (
          <>
            {/* Live Video Feed */}
            <video
              ref={videoRef}
              autoPlay
              playsInline
              muted
              className="w-full h-full object-cover"
              data-testid="camera-preview-video"
            />
            
            {/* Scan Frame Overlay (for OCR mode) */}
            {showScanFrame && (
              <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                <div className="border-4 border-green-500 rounded-lg w-[85%] h-[60%] relative shadow-2xl">
                  {/* Corner Markers */}
                  <div className="absolute -top-1 -left-1 w-8 h-8 border-t-4 border-l-4 border-white rounded-tl-lg" />
                  <div className="absolute -top-1 -right-1 w-8 h-8 border-t-4 border-r-4 border-white rounded-tr-lg" />
                  <div className="absolute -bottom-1 -left-1 w-8 h-8 border-b-4 border-l-4 border-white rounded-bl-lg" />
                  <div className="absolute -bottom-1 -right-1 w-8 h-8 border-b-4 border-r-4 border-white rounded-br-lg" />
                  
                  {/* Center Guide */}
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="text-green-400 text-center">
                      <Camera className="h-12 w-12 mx-auto mb-2 animate-pulse" />
                      <p className="text-sm font-medium">Align sticker within frame</p>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Recording Indicator */}
            {isRecording && (
              <div className="absolute top-4 left-4 flex items-center gap-2 bg-red-600 text-white px-3 py-2 rounded-full animate-pulse">
                <div className="w-3 h-3 bg-white rounded-full" />
                <span className="text-sm font-bold">RECORDING</span>
              </div>
            )}

            {/* Error Message */}
            {error && (
              <div className="absolute inset-0 flex items-center justify-center bg-black/80">
                <div className="bg-slate-900 border border-red-500 rounded-lg p-6 max-w-sm mx-4">
                  <h3 className="text-white font-bold mb-2">Camera Access Required</h3>
                  <p className="text-slate-300 text-sm mb-4">{error.message}</p>
                  <Button onClick={startCamera} className="w-full" data-testid="button-retry-camera">
                    Try Again
                  </Button>
                </div>
              </div>
            )}
          </>
        ) : (
          <>
            {/* Captured Image Preview */}
            <img
              src={capturedImage}
              alt="Captured"
              className="w-full h-full object-contain"
              data-testid="captured-image-preview"
            />
            
            {/* Processing Overlay */}
            {isProcessing && (
              <div className="absolute inset-0 bg-black/80 flex items-center justify-center">
                <div className="bg-slate-900 border border-slate-700 rounded-lg p-6 max-w-sm mx-4">
                  <div className="flex flex-col items-center gap-4">
                    {processingStatus === 'Complete!' ? (
                      <CheckCircle2 className="h-12 w-12 text-green-400" />
                    ) : (
                      <Loader2 className="h-12 w-12 text-blue-400 animate-spin" />
                    )}
                    <p className="text-white font-medium text-lg">{processingStatus}</p>
                  </div>
                </div>
              </div>
            )}
          </>
        )}
      </div>

      {/* Bottom Controls */}
      <div className="bg-slate-900/95 backdrop-blur-sm border-t border-slate-700 p-6">
        {!capturedImage ? (
          <div className="flex items-center justify-between max-w-2xl mx-auto">
            {/* Switch Camera */}
            <Button
              variant="ghost"
              size="lg"
              onClick={switchCamera}
              className="text-white hover:bg-slate-800 h-14 w-14 rounded-full"
              data-testid="button-switch-camera"
            >
              <SwitchCamera className="h-6 w-6" />
            </Button>

            {/* Capture Button */}
            <Button
              onClick={handleCapture}
              className={cn(
                "h-20 w-20 rounded-full shadow-2xl transition-all",
                mode === 'video' && isRecording
                  ? "bg-red-600 hover:bg-red-700"
                  : "bg-white hover:bg-slate-200"
              )}
              data-testid="button-capture"
            >
              {mode === 'video' ? (
                isRecording ? (
                  <div className="w-6 h-6 bg-white rounded-sm" />
                ) : (
                  <Video className="h-8 w-8 text-slate-900" />
                )
              ) : (
                <Camera className="h-8 w-8 text-slate-900" />
              )}
            </Button>

            {/* Spacer for alignment */}
            <div className="h-14 w-14" />
          </div>
        ) : (
          <div className="flex items-center justify-center gap-4 max-w-2xl mx-auto">
            <Button
              variant="outline"
              size="lg"
              onClick={handleRetake}
              className="flex-1 max-w-xs bg-white/10 text-white border-white/30 hover:bg-white/20"
              data-testid="button-retake"
            >
              <RotateCcw className="h-5 w-5 mr-2" />
              Retake
            </Button>
            <Button
              size="lg"
              onClick={handleConfirm}
              disabled={isProcessing}
              className="flex-1 max-w-xs bg-green-600 hover:bg-green-700 text-white"
              data-testid="button-confirm-capture"
            >
              <CheckCircle2 className="h-5 w-5 mr-2" />
              {isProcessing ? 'Processing...' : 'Use Photo'}
            </Button>
          </div>
        )}
      </div>

      {/* Hidden canvas for photo capture */}
      <canvas ref={canvasRef} className="hidden" />
    </div>,
    portalContainer
  );
}
