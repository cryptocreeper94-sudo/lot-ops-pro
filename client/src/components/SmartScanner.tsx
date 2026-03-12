import { useState } from "react";
import Tesseract from "tesseract.js";
import { CameraPreviewModal } from "@/components/CameraPreviewModal";
import { useToast } from "@/hooks/use-toast";

interface StickerData {
  type: "work_order" | "routing" | "sale_lane" | "unknown";
  vin?: string;
  workOrder?: string;
  year?: string;
  make?: string;
  dealer?: string;
  currentLocation?: string;
  nextLocation?: string;
  saleWeek?: string;
  saleLane?: string;
  saleDay?: string;
  rawText: string;
}

interface SmartScannerProps {
  onScanComplete: (data: StickerData) => void;
  onClose?: () => void;
  isOpen: boolean;
}

export function SmartScanner({ onScanComplete, onClose, isOpen }: SmartScannerProps) {
  const [scanProgress, setScanProgress] = useState(0);
  const [scanStatus, setScanStatus] = useState("");
  const [parsedData, setParsedData] = useState<StickerData | null>(null);
  const { toast } = useToast();

  const parseSticker = (text: string): StickerData => {
    const upperText = text.toUpperCase();
    let stickerData: StickerData = {
      type: "unknown",
      rawText: text
    };

    // Extract VIN (17 characters, alphanumeric)
    const vinMatch = text.match(/\b[A-HJ-NPR-Z0-9]{17}\b/i);
    if (vinMatch) {
      stickerData.vin = vinMatch[0].toUpperCase();
    }

    // Extract Work Order (format: WO: 2025-12345 or just numbers)
    const woMatch = text.match(/(?:WO|WORK ORDER)[:\s]*(\d{4}-\d+|\d+)/i);
    if (woMatch) {
      stickerData.workOrder = woMatch[1];
      stickerData.type = "work_order";
    }

    // Extract Year
    const yearMatch = text.match(/\b(19|20)\d{2}\b/);
    if (yearMatch) {
      stickerData.year = yearMatch[0];
    }

    // Extract Make (common car makes)
    const makes = ["HONDA", "TOYOTA", "FORD", "CHEVY", "CHEVROLET", "NISSAN", "HYUNDAI", "KIA", "BMW", "MERCEDES", "AUDI", "VW", "VOLKSWAGEN", "SUBARU", "MAZDA", "LEXUS", "ACURA", "INFINITI"];
    for (const make of makes) {
      if (upperText.includes(make)) {
        stickerData.make = make;
        break;
      }
    }

    // Extract Routing (DSC, REG, etc. → number)
    const routingMatch = text.match(/(DSC|REG|INV|SOLD|VIP)\s*→?\s*(\d+)/i);
    if (routingMatch) {
      stickerData.currentLocation = routingMatch[1].toUpperCase();
      stickerData.nextLocation = routingMatch[2];
      stickerData.type = "routing";
    }

    // Extract Sale Week (1-52)
    const weekMatch = text.match(/WEEK[:\s]*(\d{1,2})/i);
    if (weekMatch) {
      stickerData.saleWeek = weekMatch[1];
      stickerData.type = "sale_lane";
    }

    // Extract Sale Lane
    const laneMatch = text.match(/LANE[:\s]*(\d{1,3})/i);
    if (laneMatch) {
      stickerData.saleLane = laneMatch[1];
      stickerData.type = "sale_lane";
    }

    // Extract Sale Day
    const dayMatch = text.match(/(TUESDAY|WEDNESDAY|THURSDAY)/i);
    if (dayMatch) {
      stickerData.saleDay = dayMatch[1];
    }

    // Extract Dealer
    const dealerMatch = text.match(/DEALER[:\s]*([A-Z\s]+)/i);
    if (dealerMatch) {
      stickerData.dealer = dealerMatch[1].trim();
    }

    return stickerData;
  };

  const processImage = async (imageData: string): Promise<void> => {
    setScanProgress(0);
    setScanStatus("Analyzing image...");
    setParsedData(null); // Reset parsed data

    try {
      const result = await Tesseract.recognize(imageData, "eng", {
        logger: (m) => {
          if (m.status === "recognizing text") {
            setScanProgress(Math.round(m.progress * 100));
            setScanStatus(`Reading text... ${Math.round(m.progress * 100)}%`);
          }
        }
      });

      setScanStatus("Processing data...");
      const extractedText = result.data.text;
      const data = parseSticker(extractedText);
      
      // Store parsed data for user confirmation
      setParsedData(data);
      setScanStatus("Complete!");

    } catch (error) {
      console.error("OCR Error:", error);
      setScanStatus("Scan failed. Please try again.");
      setParsedData(null); // Ensure parsedData is null on error
      throw error;
    }
  };

  const handleCapture = (imageData: string) => {
    // User confirmed - use the already-processed data
    if (!parsedData) {
      console.error("No parsed data available - OCR may have failed");
      toast({
        title: "OCR Failed",
        description: "Could not extract data from the image. Please try again with better lighting.",
        variant: "destructive"
      });
      return; // Prevent proceeding without valid data
    }
    
    // Complete the scan with parsed data
    // DON'T close modal here - let parent handler close it after state updates
    onScanComplete(parsedData);
  };

  return (
    <CameraPreviewModal
      isOpen={isOpen}
      mode="ocr"
      title="Smart Scanner"
      description="Point at any car sticker"
      onClose={() => {
        if (onClose) onClose();
      }}
      onCapture={handleCapture}
      onProcessing={processImage}
      showScanFrame={true}
    />
  );
}
