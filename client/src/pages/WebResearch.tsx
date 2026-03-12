import { useState } from "react";
import { useLocation } from "wouter";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { 
  Search, 
  ArrowLeft, 
  Globe, 
  Car, 
  Zap, 
  Fuel,
  Info,
  AlertTriangle,
  ExternalLink
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { NavigationControl } from "@/components/NavigationControl";

export default function WebResearch() {
  const [location, setLocation] = useLocation();
  const { toast } = useToast();
  const [searchQuery, setSearchQuery] = useState("");
  const [isSearching, setIsSearching] = useState(false);
  
  // Quick search templates for common vehicle info
  const quickSearches = [
    { 
      icon: Fuel, 
      label: "Gas Cap Location", 
      query: "where is gas cap location on [vehicle make model]",
      color: "bg-blue-500"
    },
    { 
      icon: Zap, 
      label: "EV Charging Port", 
      query: "where is charging port on electric [vehicle make model]",
      color: "bg-green-500"
    },
    { 
      icon: Car, 
      label: "VIN Location", 
      query: "where to find VIN number on [vehicle make model]",
      color: "bg-purple-500"
    },
    { 
      icon: Info, 
      label: "Vehicle Specs", 
      query: "[vehicle year make model] specifications",
      color: "bg-orange-500"
    },
  ];

  const handleSearch = (query: string) => {
    setIsSearching(true);
    
    // Check if query is a URL (contains domain extension)
    const isUrl = /\.(com|net|org|edu|gov|io|co|us|info|biz|tv|app|dev|ai|tech)($|\/|\?|#|\s)/i.test(query);
    
    if (isUrl) {
      // Direct navigation to website
      let url = query.trim();
      // Add https:// if not present
      if (!url.startsWith('http://') && !url.startsWith('https://')) {
        url = 'https://' + url;
      }
      window.open(url, '_blank', 'noopener,noreferrer');
      
      toast({
        title: "Opening Website",
        description: `Navigating to ${url}`,
      });
    } else {
      // Open Google search in new tab with safe search enabled
      const searchUrl = `https://www.google.com/search?q=${encodeURIComponent(query)}&safe=active`;
      window.open(searchUrl, '_blank', 'noopener,noreferrer');
      
      toast({
        title: "Search Opened",
        description: "Results opened in new tab",
      });
    }
    
    setIsSearching(false);
  };

  const handleQuickSearch = (template: string) => {
    setSearchQuery(template);
  };

  return (
    <>
      <NavigationControl variant="back" fallbackRoute="/developer" />
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-green-50 p-4">
      {/* Header */}
      <div className="mb-6">
        <div className="flex items-center gap-3 mb-4">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => window.history.back()}
            className="gap-2"
          >
            <ArrowLeft className="w-4 h-4" />
            Back
          </Button>
        </div>
        
        <div className="flex items-center gap-3">
          <div className="bg-gradient-to-br from-blue-600 to-green-600 p-3 rounded-xl shadow-lg">
            <Globe className="w-6 h-6 text-white" />
          </div>
          <div>
            <h1 className="text-2xl font-black text-slate-900">Web Research</h1>
            <p className="text-sm text-slate-600">Vehicle Information Lookup</p>
          </div>
        </div>
      </div>

      {/* Safety Notice */}
      <Card className="mb-4 border-amber-200 bg-amber-50">
        <CardContent className="pt-4">
          <div className="flex items-start gap-3">
            <AlertTriangle className="w-5 h-5 text-amber-600 mt-0.5" />
            <div className="flex-1">
              <p className="text-sm font-semibold text-amber-900 mb-1">Professional Use Only</p>
              <p className="text-xs text-amber-700">
                This tool is for work-related vehicle research. Safe browsing is enabled. 
                Use this to find gas cap locations, charging ports, VIN locations, and vehicle specifications.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Search Box */}
      <Card className="mb-4">
        <CardHeader>
          <CardTitle className="text-base">Search or Navigate</CardTitle>
          <CardDescription>Type a website (www.manheim.com) or search for anything</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex gap-2">
            <Input
              placeholder="Search: charging port location, gas cap, who won the game, etc..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && searchQuery && handleSearch(searchQuery)}
              className="flex-1"
              data-testid="input-web-search"
            />
            <Button
              onClick={() => handleSearch(searchQuery)}
              disabled={!searchQuery || isSearching}
              className="gap-2"
              data-testid="button-search"
            >
              <Search className="w-4 h-4" />
              Search
            </Button>
          </div>
          
          <div className="flex items-center gap-2 text-xs text-slate-500">
            <ExternalLink className="w-3 h-3" />
            <span>Results will open in a new tab with safe browsing enabled</span>
          </div>
        </CardContent>
      </Card>

      {/* Quick Search Templates */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Quick Search Templates</CardTitle>
          <CardDescription>Click a template to start searching</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {quickSearches.map((item, index) => (
              <Button
                key={index}
                variant="outline"
                className="h-auto py-4 px-4 justify-start gap-3 hover:bg-slate-50"
                onClick={() => handleQuickSearch(item.query)}
                data-testid={`button-quick-search-${index}`}
              >
                <div className={`${item.color} p-2 rounded-lg`}>
                  <item.icon className="w-5 h-5 text-white" />
                </div>
                <div className="text-left flex-1">
                  <div className="font-bold text-sm">{item.label}</div>
                  <div className="text-xs text-slate-500 mt-0.5">
                    {item.query.replace('[vehicle make model]', '...')}
                  </div>
                </div>
              </Button>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Common Searches */}
      <Card className="mt-4">
        <CardHeader>
          <CardTitle className="text-base">Common Vehicle Info Searches</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2 text-sm text-slate-600">
            <div className="flex items-center gap-2">
              <Badge variant="secondary" className="text-xs">TIP</Badge>
              <span>Include year, make, and model for best results</span>
            </div>
            <div className="flex items-center gap-2">
              <Badge variant="secondary" className="text-xs">TIP</Badge>
              <span>Search "owner's manual PDF" for detailed diagrams</span>
            </div>
            <div className="flex items-center gap-2">
              <Badge variant="secondary" className="text-xs">TIP</Badge>
              <span>Add "diagram" or "location" for visual guides</span>
            </div>
          </div>
        </CardContent>
      </Card>
      </div>
    </>
  );
}
