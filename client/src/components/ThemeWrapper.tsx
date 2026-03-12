import { ReactNode } from "react";
import { useTheme } from "@/contexts/ThemeContext";

interface ThemeWrapperProps {
  children: ReactNode;
}

export function ThemeWrapper({ children }: ThemeWrapperProps) {
  const { currentTheme } = useTheme();

  return (
    <div
      className={`min-h-screen ${currentTheme.colors.background} ${currentTheme.colors.textPrimary} transition-colors duration-300 relative`}
      style={{
        backgroundImage: currentTheme.watermark
          ? `linear-gradient(rgba(0, 0, 0, 0.7), rgba(0, 0, 0, 0.7)), url(${currentTheme.watermark})`
          : undefined,
        backgroundSize: currentTheme.watermark ? "cover" : undefined,
        backgroundPosition: currentTheme.watermark ? "center" : undefined,
        backgroundAttachment: currentTheme.watermark ? "fixed" : undefined,
        backgroundRepeat: currentTheme.watermark ? "no-repeat" : undefined,
      }}
    >
      {currentTheme.watermark && (
        <div className="fixed inset-0 pointer-events-none z-0 opacity-10">
          <div
            className="w-full h-full"
            style={{
              backgroundImage: `url(${currentTheme.watermark})`,
              backgroundSize: "contain",
              backgroundPosition: "center",
              backgroundRepeat: "no-repeat",
            }}
          />
        </div>
      )}
      <div className="relative z-10">{children}</div>
    </div>
  );
}
