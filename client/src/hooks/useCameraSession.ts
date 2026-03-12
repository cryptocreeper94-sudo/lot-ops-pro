import { useRef, useState, useCallback, useEffect } from 'react';

export type CameraMode = 'photo' | 'video' | 'ocr';
export type CameraFacing = 'user' | 'environment';

interface UseCameraSessionOptions {
  mode?: CameraMode;
  facingMode?: CameraFacing;
  onPhotoCapture?: (dataUrl: string) => void;
  onVideoCapture?: (dataUrl: string) => void;
  onError?: (error: Error) => void;
}

export function useCameraSession(options: UseCameraSessionOptions = {}) {
  const {
    mode = 'photo',
    facingMode = 'environment',
    onPhotoCapture,
    onVideoCapture,
    onError
  } = options;

  const videoRef = useRef<HTMLVideoElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const recordedChunksRef = useRef<Blob[]>([]);

  const [isActive, setIsActive] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const [currentFacing, setCurrentFacing] = useState<CameraFacing>(facingMode);

  const startCamera = useCallback(async () => {
    try {
      setError(null);
      
      if (streamRef.current) {
        stopCamera();
      }

      const constraints: MediaStreamConstraints = {
        video: {
          facingMode: currentFacing,
          width: { ideal: 1920 },
          height: { ideal: 1080 }
        },
        audio: mode === 'video'
      };

      const stream = await navigator.mediaDevices.getUserMedia(constraints);
      
      streamRef.current = stream;
      
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        await videoRef.current.play();
      }
      
      setIsActive(true);
    } catch (err) {
      const error = err instanceof Error ? err : new Error('Failed to access camera');
      setError(error);
      if (onError) onError(error);
      console.error('Camera error:', err);
    }
  }, [currentFacing, mode, onError]);

  const stopCamera = useCallback(() => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }
    
    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }
    
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
    }
    
    setIsActive(false);
    setIsRecording(false);
  }, [isRecording]);

  const capturePhoto = useCallback((): string | null => {
    if (!videoRef.current || !isActive) {
      console.error('Camera not active');
      return null;
    }

    const canvas = canvasRef.current || document.createElement('canvas');
    const video = videoRef.current;

    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;

    const context = canvas.getContext('2d');
    if (!context) {
      console.error('Failed to get canvas context');
      return null;
    }

    context.drawImage(video, 0, 0, canvas.width, canvas.height);
    const dataUrl = canvas.toDataURL('image/jpeg', 0.95);

    if (onPhotoCapture) {
      onPhotoCapture(dataUrl);
    }

    return dataUrl;
  }, [isActive, onPhotoCapture]);

  const startVideoRecording = useCallback(() => {
    if (!streamRef.current || !isActive) {
      console.error('Camera not active');
      return;
    }

    try {
      recordedChunksRef.current = [];
      
      const options = { mimeType: 'video/webm;codecs=vp8,opus' };
      const recorder = new MediaRecorder(streamRef.current, options);
      
      recorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          recordedChunksRef.current.push(event.data);
        }
      };
      
      recorder.onstop = () => {
        const blob = new Blob(recordedChunksRef.current, { type: 'video/webm' });
        const reader = new FileReader();
        reader.onloadend = () => {
          const dataUrl = reader.result as string;
          if (onVideoCapture) {
            onVideoCapture(dataUrl);
          }
        };
        reader.readAsDataURL(blob);
      };
      
      mediaRecorderRef.current = recorder;
      recorder.start();
      setIsRecording(true);
    } catch (err) {
      console.error('Failed to start recording:', err);
      const error = err instanceof Error ? err : new Error('Failed to start recording');
      setError(error);
      if (onError) onError(error);
    }
  }, [isActive, onVideoCapture, onError]);

  const stopVideoRecording = useCallback(() => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
    }
  }, [isRecording]);

  const switchCamera = useCallback(async () => {
    const newFacing = currentFacing === 'environment' ? 'user' : 'environment';
    
    if (isActive) {
      stopCamera();
      
      // Restart camera with new facing mode after a brief delay
      setTimeout(async () => {
        setCurrentFacing(newFacing);
        
        try {
          const constraints: MediaStreamConstraints = {
            video: {
              facingMode: newFacing,
              width: { ideal: 1920 },
              height: { ideal: 1080 }
            },
            audio: mode === 'video'
          };

          const stream = await navigator.mediaDevices.getUserMedia(constraints);
          
          streamRef.current = stream;
          
          if (videoRef.current) {
            videoRef.current.srcObject = stream;
            await videoRef.current.play();
          }
          
          setIsActive(true);
        } catch (err) {
          const error = err instanceof Error ? err : new Error('Failed to switch camera');
          setError(error);
          if (onError) onError(error);
          console.error('Camera switch error:', err);
        }
      }, 100);
    } else {
      setCurrentFacing(newFacing);
    }
  }, [currentFacing, isActive, stopCamera, mode, onError]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      stopCamera();
    };
  }, [stopCamera]);

  return {
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
  };
}
