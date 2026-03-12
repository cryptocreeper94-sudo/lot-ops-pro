import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { ArrowLeft, X, Home } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { PageWorkflowGuide } from "./PageWorkflowGuide";

type NavigationVariant = "back" | "close" | "home" | "back-or-close";

interface NavigationControlProps {
  variant?: NavigationVariant;
  fallbackRoute?: string;
  onNavigate?: () => void;
  className?: string;
  label?: string;
}

export function NavigationControl({
  variant = "back",
  fallbackRoute = "/",
  onNavigate,
  className = "",
  label
}: NavigationControlProps) {
  const [_, setLocation] = useLocation();
  const { toast } = useToast();

  const handleNavigation = () => {
    if (onNavigate) {
      onNavigate();
      return;
    }

    try {
      if (variant === "back" || variant === "back-or-close") {
        if (window.history.length > 1) {
          window.history.back();
        } else {
          setLocation(fallbackRoute);
        }
      } else if (variant === "close") {
        setLocation(fallbackRoute);
      } else if (variant === "home") {
        setLocation("/");
      }
    } catch (error) {
      toast({
        title: "Navigation Error",
        description: "Returning to home page",
        variant: "destructive"
      });
      setLocation("/");
    }
  };

  const getIcon = () => {
    if (variant === "home") return <Home className="h-5 w-5" />;
    if (variant === "close") return <X className="h-5 w-5" />;
    return <ArrowLeft className="h-5 w-5" />;
  };

  const getLabel = () => {
    if (label) return label;
    if (variant === "home") return "Home";
    if (variant === "close") return "Close";
    if (variant === "back-or-close") return "Back";
    return "Back";
  };

  const getTestId = () => {
    if (variant === "home") return "button-home";
    if (variant === "close") return "button-close";
    return "button-back";
  };

  return (
    <Button
      onClick={handleNavigation}
      variant="ghost"
      size="sm"
      className={`gap-2 ${className}`}
      data-testid={getTestId()}
    >
      {getIcon()}
      <span className="hidden sm:inline">{getLabel()}</span>
    </Button>
  );
}

export function PageHeader({
  title,
  navigationVariant = "back",
  fallbackRoute,
  onNavigate,
  children,
  showGuide = true
}: {
  title: string;
  navigationVariant?: NavigationVariant;
  fallbackRoute?: string;
  onNavigate?: () => void;
  children?: React.ReactNode;
  showGuide?: boolean;
}) {
  return (
    <div className="flex items-center justify-between p-4 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 sticky top-0 z-40">
      <div className="flex items-center gap-4 flex-1">
        <NavigationControl
          variant={navigationVariant}
          fallbackRoute={fallbackRoute}
          onNavigate={onNavigate}
        />
        <h1 className="text-xl font-bold truncate">{title}</h1>
      </div>
      <div className="flex items-center gap-2">
        {showGuide && <PageWorkflowGuide />}
        {children}
      </div>
    </div>
  );
}
