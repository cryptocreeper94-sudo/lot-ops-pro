import { useLocation } from "wouter";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { MapPin, Home, HelpCircle, ArrowLeft } from "lucide-react";

export default function NotFound() {
  const [_, setLocation] = useLocation();
  
  const userStr = typeof window !== "undefined" ? localStorage.getItem("vanops_user") : null;
  const isLoggedIn = !!userStr;

  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900 p-4">
      <Card className="w-full max-w-md bg-white/10 border-white/20 backdrop-blur-lg">
        <CardContent className="pt-8 pb-6 px-6">
          <div className="text-center space-y-6">
            <div className="flex justify-center">
              <div className="bg-orange-500/20 rounded-full p-4">
                <MapPin className="h-12 w-12 text-orange-400" />
              </div>
            </div>
            
            <div className="space-y-2">
              <h1 className="text-3xl font-bold text-white" data-testid="text-404-title">
                Page Not Found
              </h1>
              <p className="text-slate-300 text-sm" data-testid="text-404-message">
                Looks like you took a wrong turn. This page doesn't exist or may have been moved.
              </p>
            </div>

            <div className="space-y-3 pt-2">
              {isLoggedIn ? (
                <>
                  <Button
                    onClick={() => setLocation("/dashboard")}
                    className="w-full bg-gradient-to-r from-blue-600 to-purple-600"
                    data-testid="button-go-dashboard"
                  >
                    <Home className="h-4 w-4 mr-2" />
                    Go to Dashboard
                  </Button>
                  <Button
                    onClick={() => setLocation("/help")}
                    variant="outline"
                    className="w-full border-white/30 text-white hover:bg-white/10"
                    data-testid="button-go-help"
                  >
                    <HelpCircle className="h-4 w-4 mr-2" />
                    Get Help
                  </Button>
                </>
              ) : (
                <>
                  <Button
                    onClick={() => setLocation("/")}
                    className="w-full bg-gradient-to-r from-blue-600 to-purple-600"
                    data-testid="button-go-home"
                  >
                    <Home className="h-4 w-4 mr-2" />
                    Go to Login
                  </Button>
                  <Button
                    onClick={() => setLocation("/about")}
                    variant="outline"
                    className="w-full border-white/30 text-white hover:bg-white/10"
                    data-testid="button-go-about"
                  >
                    <ArrowLeft className="h-4 w-4 mr-2" />
                    Learn About Lot Ops Pro
                  </Button>
                </>
              )}
            </div>

            <p className="text-slate-400 text-xs pt-4">
              Lot Ops Pro - Driver Performance Management
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
