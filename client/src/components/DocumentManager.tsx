import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Card, CardContent } from "@/components/ui/card";
import { 
  Upload, 
  FileText, 
  Download, 
  Trash2, 
  Calendar,
  File,
  FileSpreadsheet,
  Image as ImageIcon,
  Filter
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { DemoStorage } from "@/lib/demoStorage";
import { format } from "date-fns";

interface SavedDocument {
  id: number;
  fileName: string;
  fileType: string;
  fileSize?: number;
  fileData: string; // Base64
  category?: string;
  description?: string;
  uploadedBy: string;
  uploadedByRole: string;
  uploadedByName: string;
  uploadDate: string; // "2025-11-20"
  createdAt?: string;
  tags?: string[];
}

interface DocumentManagerProps {
  userRole: "supervisor" | "operations_manager";
  userPin: string;
  userName: string;
}

export function DocumentManager({ userRole, userPin, userName }: DocumentManagerProps) {
  const { toast } = useToast();
  const isDemoMode = DemoStorage.isDemoMode();

  const [showUploadDialog, setShowUploadDialog] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [fileCategory, setFileCategory] = useState("");
  const [fileDescription, setFileDescription] = useState("");
  const [fileTags, setFileTags] = useState("");
  const [filterCategory, setFilterCategory] = useState<string>("all");
  const [filterDate, setFilterDate] = useState<string>("");

  // Fetch documents from database (or demo storage)
  const { data: documents = [] } = useQuery<SavedDocument[]>({
    queryKey: ["/api/saved-documents", userPin],
    enabled: !isDemoMode,
  });

  // Demo mode documents
  const demoDocuments = isDemoMode ? DemoStorage.getSavedDocuments(userPin) : [];
  const displayDocuments = isDemoMode ? demoDocuments : documents;

  // Upload document mutation
  const uploadDocumentMutation = useMutation({
    mutationFn: async (data: {
      fileName: string;
      fileType: string;
      fileSize: number;
      fileData: string;
      category?: string;
      description?: string;
      tags?: string[];
      uploadedBy: string;
      uploadedByRole: string;
      uploadedByName: string;
      uploadDate: string;
    }) => {
      if (isDemoMode) {
        DemoStorage.addSavedDocument(data);
        return data;
      }
      const res = await apiRequest("POST", "/api/saved-documents", data);
      return res.json();
    },
    onSuccess: () => {
      if (!isDemoMode) {
        queryClient.invalidateQueries({ queryKey: ["/api/saved-documents"] });
      }
      resetUploadForm();
      toast({
        title: "Document Saved",
        description: "File has been saved successfully.",
      });
    },
  });

  // Delete document mutation
  const deleteDocumentMutation = useMutation({
    mutationFn: async (id: number) => {
      if (isDemoMode) {
        DemoStorage.removeSavedDocument(id);
        return;
      }
      await apiRequest("DELETE", `/api/saved-documents/${id}`);
    },
    onSuccess: () => {
      if (!isDemoMode) {
        queryClient.invalidateQueries({ queryKey: ["/api/saved-documents"] });
      }
      toast({
        title: "Document Deleted",
        description: "File has been removed.",
      });
    },
  });

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Check file size (max 10MB)
    if (file.size > 10 * 1024 * 1024) {
      toast({
        title: "File Too Large",
        description: "Maximum file size is 10MB.",
        variant: "destructive",
      });
      return;
    }

    setSelectedFile(file);
  };

  const handleUploadDocument = () => {
    if (!selectedFile) {
      toast({
        title: "No File Selected",
        description: "Please select a file to upload.",
        variant: "destructive",
      });
      return;
    }

    // Convert file to base64
    const reader = new FileReader();
    reader.onloadend = () => {
      const base64Data = reader.result as string;
      const fileType = selectedFile.name.split('.').pop()?.toLowerCase() || 'unknown';
      
      const tags = fileTags
        ? fileTags.split(',').map(tag => tag.trim()).filter(Boolean)
        : [];

      uploadDocumentMutation.mutate({
        fileName: selectedFile.name,
        fileType,
        fileSize: selectedFile.size,
        fileData: base64Data,
        category: fileCategory || undefined,
        description: fileDescription || undefined,
        tags,
        uploadedBy: userPin,
        uploadedByRole: userRole,
        uploadedByName: userName,
        uploadDate: format(new Date(), 'yyyy-MM-dd'),
      });
    };
    reader.readAsDataURL(selectedFile);
  };

  const resetUploadForm = () => {
    setShowUploadDialog(false);
    setSelectedFile(null);
    setFileCategory("");
    setFileDescription("");
    setFileTags("");
  };

  const handleDownloadDocument = (doc: SavedDocument) => {
    // Create download link
    const link = document.createElement('a');
    link.href = doc.fileData;
    link.download = doc.fileName;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    toast({
      title: "Download Started",
      description: `Downloading ${doc.fileName}`,
    });
  };

  const getFileIcon = (fileType: string) => {
    if (fileType.includes('pdf')) return <FileText className="h-5 w-5 text-red-500" />;
    if (fileType.includes('xlsx') || fileType.includes('csv')) return <FileSpreadsheet className="h-5 w-5 text-green-500" />;
    if (fileType.includes('image') || fileType.includes('png') || fileType.includes('jpg')) return <ImageIcon className="h-5 w-5 text-blue-500" />;
    return <File className="h-5 w-5 text-slate-500" />;
  };

  const formatFileSize = (bytes?: number) => {
    if (!bytes) return '—';
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  // Filter documents
  const filteredDocuments = displayDocuments.filter(doc => {
    if (filterCategory !== 'all' && doc.category !== filterCategory) return false;
    if (filterDate && doc.uploadDate !== filterDate) return false;
    return true;
  });

  // Group by date
  const groupedByDate = filteredDocuments.reduce((acc, doc) => {
    const date = doc.uploadDate;
    if (!acc[date]) acc[date] = [];
    acc[date].push(doc);
    return acc;
  }, {} as Record<string, SavedDocument[]>);

  return (
    <div className="space-y-4">
      {/* Header with Upload Button */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold text-slate-800">Saved Documents</h3>
          <p className="text-sm text-slate-500">
            Save reports, PDFs, and files organized by date
          </p>
        </div>
        <Button
          onClick={() => setShowUploadDialog(true)}
          className="bg-blue-600 hover:bg-blue-700"
          size="sm"
          data-testid="button-upload-document"
        >
          <Upload className="h-4 w-4 mr-2" />
          Upload File
        </Button>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="p-4">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <Filter className="h-4 w-4 text-slate-500" />
              <span className="text-sm font-medium text-slate-700">Filters:</span>
            </div>
            <Select value={filterCategory} onValueChange={setFilterCategory}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="All Categories" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Categories</SelectItem>
                <SelectItem value="reports">Reports</SelectItem>
                <SelectItem value="schedules">Schedules</SelectItem>
                <SelectItem value="safety">Safety</SelectItem>
                <SelectItem value="performance">Performance</SelectItem>
                <SelectItem value="other">Other</SelectItem>
              </SelectContent>
            </Select>
            <Input
              type="date"
              value={filterDate}
              onChange={(e) => setFilterDate(e.target.value)}
              className="w-[180px]"
              placeholder="Filter by date"
            />
            {(filterCategory !== 'all' || filterDate) && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => {
                  setFilterCategory('all');
                  setFilterDate('');
                }}
              >
                Clear Filters
              </Button>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Documents List - Grouped by Date */}
      <ScrollArea className="h-[500px] border border-slate-200 rounded-lg">
        <div className="p-4 space-y-6">
          {Object.keys(groupedByDate).length === 0 ? (
            <div className="text-center py-12 text-slate-400">
              <FileText className="h-16 w-16 mx-auto mb-4 opacity-50" />
              <p className="text-sm">No documents found</p>
              <p className="text-xs mt-1">Click "Upload File" to save your first document</p>
            </div>
          ) : (
            Object.entries(groupedByDate)
              .sort(([dateA], [dateB]) => dateB.localeCompare(dateA)) // Most recent first
              .map(([date, docs]) => (
                <div key={date} className="space-y-2">
                  <div className="flex items-center gap-2 sticky top-0 bg-slate-50 py-2 px-3 rounded-lg">
                    <Calendar className="h-4 w-4 text-slate-600" />
                    <h4 className="font-semibold text-slate-700">
                      {format(new Date(date), 'MMMM d, yyyy')}
                    </h4>
                    <Badge variant="secondary" className="ml-2">
                      {docs.length} {docs.length === 1 ? 'file' : 'files'}
                    </Badge>
                  </div>
                  <div className="space-y-2 pl-6">
                    {docs.map((doc) => (
                      <div
                        key={doc.id}
                        className="flex items-center justify-between p-3 bg-white border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors"
                      >
                        <div className="flex items-center gap-3 flex-1 min-w-0">
                          {getFileIcon(doc.fileType)}
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2">
                              <h5 className="font-medium text-slate-800 truncate">
                                {doc.fileName}
                              </h5>
                              {doc.category && (
                                <Badge variant="outline" className="text-xs">
                                  {doc.category}
                                </Badge>
                              )}
                            </div>
                            {doc.description && (
                              <p className="text-xs text-slate-500 truncate mt-0.5">
                                {doc.description}
                              </p>
                            )}
                            <div className="flex items-center gap-3 mt-1 text-xs text-slate-400">
                              <span>{formatFileSize(doc.fileSize)}</span>
                              <span>•</span>
                              <span>By {doc.uploadedByName}</span>
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center gap-2 ml-4">
                          <Button
                            onClick={() => handleDownloadDocument(doc)}
                            size="sm"
                            variant="outline"
                            className="text-blue-600 border-blue-200 hover:bg-blue-50"
                            data-testid={`button-download-${doc.id}`}
                          >
                            <Download className="h-4 w-4 mr-1" />
                            Download
                          </Button>
                          <Button
                            onClick={() => deleteDocumentMutation.mutate(doc.id)}
                            size="sm"
                            variant="ghost"
                            className="text-red-600 hover:text-red-700 hover:bg-red-50"
                            data-testid={`button-delete-${doc.id}`}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ))
          )}
        </div>
      </ScrollArea>

      {/* Upload Dialog */}
      <Dialog open={showUploadDialog} onOpenChange={setShowUploadDialog}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Upload Document</DialogTitle>
            <DialogDescription>
              Save a file for easy retrieval organized by date
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="file-upload">File * (Max 10MB)</Label>
              <Input
                id="file-upload"
                type="file"
                onChange={handleFileSelect}
                accept=".pdf,.xlsx,.xls,.csv,.docx,.doc,.txt,.png,.jpg,.jpeg"
                data-testid="input-file-upload"
              />
              {selectedFile && (
                <p className="text-sm text-slate-600">
                  Selected: {selectedFile.name} ({formatFileSize(selectedFile.size)})
                </p>
              )}
            </div>
            <div className="space-y-2">
              <Label htmlFor="file-category">Category (Optional)</Label>
              <Select value={fileCategory} onValueChange={setFileCategory}>
                <SelectTrigger id="file-category">
                  <SelectValue placeholder="Select category" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="reports">Reports</SelectItem>
                  <SelectItem value="schedules">Schedules</SelectItem>
                  <SelectItem value="safety">Safety</SelectItem>
                  <SelectItem value="performance">Performance</SelectItem>
                  <SelectItem value="other">Other</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="file-description">Description (Optional)</Label>
              <Input
                id="file-description"
                placeholder="Weekly performance report..."
                value={fileDescription}
                onChange={(e) => setFileDescription(e.target.value)}
                data-testid="input-file-description"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="file-tags">Tags (Optional)</Label>
              <Input
                id="file-tags"
                placeholder="weekly, first-shift, november (comma separated)"
                value={fileTags}
                onChange={(e) => setFileTags(e.target.value)}
                data-testid="input-file-tags"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={resetUploadForm}>
              Cancel
            </Button>
            <Button
              onClick={handleUploadDocument}
              className="bg-blue-600 hover:bg-blue-700"
              disabled={!selectedFile}
            >
              <Upload className="h-4 w-4 mr-2" />
              Save Document
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
