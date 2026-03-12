import { useState, useRef } from "react";
import { X, Camera, Upload, Sparkles, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";

interface AvatarPromptBannerProps {
  driverName: string;
  onPhotoUploaded: (photoDataUrl: string) => void;
}

export function AvatarPromptBanner({ driverName, onPhotoUploaded }: AvatarPromptBannerProps) {
  const { toast } = useToast();
  const [isDismissed, setIsDismissed] = useState(() => {
    const dismissed = sessionStorage.getItem('avatar_banner_dismissed');
    return dismissed === 'true';
  });
  const [isUploading, setIsUploading] = useState(false);
  const [isRemovingBg, setIsRemovingBg] = useState(false);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleDismiss = () => {
    setIsDismissed(true);
    sessionStorage.setItem('avatar_banner_dismissed', 'true');
  };

  const removeBackground = async (imageDataUrl: string): Promise<string> => {
    try {
      const response = await fetch('/api/remove-background', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ image: imageDataUrl })
      });
      
      const result = await response.json();
      
      if (result.success && result.image) {
        return result.image;
      }
      throw new Error(result.message || 'Background removal failed');
    } catch (error) {
      console.error('Background removal error:', error);
      throw error;
    }
  };

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploading(true);
    
    try {
      const dataUrl = await new Promise<string>((resolve, reject) => {
        const reader = new FileReader();
        reader.onloadend = () => resolve(reader.result as string);
        reader.onerror = () => reject(new Error('Failed to read file'));
        reader.readAsDataURL(file);
      });
      
      setPreviewUrl(dataUrl);
      setIsRemovingBg(true);
      
      toast({
        title: "🎨 Removing background...",
        description: "Making your avatar look awesome!"
      });
      
      const transparentImage = await removeBackground(dataUrl);
      
      onPhotoUploaded(transparentImage);
      
      localStorage.setItem(`driver_avatar_${driverName}`, transparentImage);
      
      setIsDismissed(true);
      sessionStorage.setItem('avatar_banner_dismissed', 'true');
      
      toast({ 
        title: "✨ Avatar Ready!", 
        description: "Your floating avatar is ready for pop-ups!" 
      });
    } catch (error) {
      toast({ 
        title: "Upload Issue", 
        description: "Photo added but background removal failed. Still looks great!", 
        variant: "default" 
      });
      if (previewUrl) {
        onPhotoUploaded(previewUrl);
        localStorage.setItem(`driver_avatar_${driverName}`, previewUrl);
      }
    } finally {
      setIsUploading(false);
      setIsRemovingBg(false);
      setPreviewUrl(null);
    }
  };

  const triggerFileInput = () => {
    fileInputRef.current?.click();
  };

  if (isDismissed) return null;

  return (
    <div className="bg-gradient-to-r from-purple-50 via-blue-50 to-indigo-50 border-l-4 border-purple-500 p-4 mb-4 rounded-r-lg shadow-sm animate-in slide-in-from-top duration-300">
      <div className="flex items-start justify-between gap-4">
        <div className="flex-1">
          <div className="flex items-center gap-3 mb-2">
            {previewUrl ? (
              <div className="relative h-12 w-12 rounded-full overflow-hidden border-2 border-purple-400">
                <img src={previewUrl} alt="Preview" className="w-full h-full object-cover" />
                {isRemovingBg && (
                  <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                    <Loader2 className="h-5 w-5 text-white animate-spin" />
                  </div>
                )}
              </div>
            ) : (
              <div className="h-12 w-12 rounded-full bg-gradient-to-br from-purple-400 to-blue-500 flex items-center justify-center">
                <Camera className="h-6 w-6 text-white" />
              </div>
            )}
            <div>
              <h3 className="font-semibold text-slate-900 flex items-center gap-2">
                Add Your Photo, {driverName.split(' ')[0]}!
                <Sparkles className="h-4 w-4 text-yellow-500" />
              </h3>
              <p className="text-sm text-slate-600">
                Your face will pop up with a 
                <span className="font-medium text-purple-700"> sarcastic bio</span> on other drivers' screens!
                <span className="text-xs text-slate-500 block">Background removed automatically for floating effect</span>
              </p>
            </div>
          </div>
          <div className="flex gap-2 ml-15">
            <Button 
              onClick={triggerFileInput}
              disabled={isUploading || isRemovingBg}
              className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white shadow-lg"
              size="sm"
              data-testid="button-add-photo"
            >
              {isRemovingBg ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Magic in progress...
                </>
              ) : isUploading ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Uploading...
                </>
              ) : (
                <>
                  <Camera className="h-4 w-4 mr-2" />
                  Add Photo Now
                </>
              )}
            </Button>
            <Button 
              onClick={handleDismiss}
              variant="ghost"
              size="sm"
              className="text-slate-600"
              data-testid="button-dismiss-banner"
            >
              Maybe Later
            </Button>
          </div>
        </div>
        <button
          onClick={handleDismiss}
          className="text-slate-400 hover:text-slate-600 transition-colors"
          data-testid="button-close-banner"
        >
          <X className="h-5 w-5" />
        </button>
      </div>

      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        capture="environment"
        onChange={handleFileSelect}
        className="hidden"
        data-testid="input-avatar-upload"
      />
    </div>
  );
}
