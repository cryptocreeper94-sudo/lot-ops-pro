import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
} from "@/components/ui/dialog";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Mail, UserPlus, ExternalLink, Trash2, Check } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { DemoStorage } from "@/lib/demoStorage";

interface EmailContact {
  id: number;
  name: string;
  email: string;
  category?: string;
  notes?: string;
  addedBy: string;
  lastUsed?: string;
}

interface EmailContactManagerProps {
  userRole: "supervisor" | "operations_manager";
  userPin: string;
  userName: string;
}

export function EmailContactManager({ userRole, userPin, userName }: EmailContactManagerProps) {
  const { toast } = useToast();
  const isDemoMode = DemoStorage.isDemoMode();

  const [showAddContact, setShowAddContact] = useState(false);
  const [showQuickEmail, setShowQuickEmail] = useState(false);
  const [newContactName, setNewContactName] = useState("");
  const [newContactEmail, setNewContactEmail] = useState("");
  const [newContactCategory, setNewContactCategory] = useState("");
  const [newContactNotes, setNewContactNotes] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedContact, setSelectedContact] = useState<EmailContact | null>(null);
  const [emailSubject, setEmailSubject] = useState("");
  const [emailBody, setEmailBody] = useState("");

  // Fetch contacts from database (or demo storage)
  const { data: contacts = [] } = useQuery<EmailContact[]>({
    queryKey: ["/api/email-contacts", userPin],
    enabled: !isDemoMode,
  });

  // Demo mode contacts
  const demoContacts = isDemoMode ? DemoStorage.getEmailContacts(userPin) : [];
  const displayContacts = isDemoMode ? demoContacts : contacts;

  // Add contact mutation
  const addContactMutation = useMutation({
    mutationFn: async (data: {
      name: string;
      email: string;
      category?: string;
      notes?: string;
      addedBy: string;
    }) => {
      if (isDemoMode) {
        DemoStorage.addEmailContact(data);
        return data;
      }
      const res = await apiRequest("POST", "/api/email-contacts", data);
      return res.json();
    },
    onSuccess: () => {
      if (!isDemoMode) {
        queryClient.invalidateQueries({ queryKey: ["/api/email-contacts"] });
      }
      resetAddForm();
      toast({
        title: "Contact Saved",
        description: "Email contact has been added to your list.",
      });
    },
  });

  // Delete contact mutation
  const deleteContactMutation = useMutation({
    mutationFn: async (id: number) => {
      if (isDemoMode) {
        DemoStorage.removeEmailContact(id);
        return;
      }
      await apiRequest("DELETE", `/api/email-contacts/${id}`);
    },
    onSuccess: () => {
      if (!isDemoMode) {
        queryClient.invalidateQueries({ queryKey: ["/api/email-contacts"] });
      }
      toast({
        title: "Contact Removed",
        description: "Email contact has been deleted.",
      });
    },
  });

  const handleAddContact = () => {
    if (!newContactName || !newContactEmail) {
      toast({
        title: "Missing Information",
        description: "Please enter name and email address.",
        variant: "destructive",
      });
      return;
    }

    // Basic email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(newContactEmail)) {
      toast({
        title: "Invalid Email",
        description: "Please enter a valid email address.",
        variant: "destructive",
      });
      return;
    }

    addContactMutation.mutate({
      name: newContactName,
      email: newContactEmail,
      category: newContactCategory || undefined,
      notes: newContactNotes || undefined,
      addedBy: userPin,
    });
  };

  const resetAddForm = () => {
    setShowAddContact(false);
    setNewContactName("");
    setNewContactEmail("");
    setNewContactCategory("");
    setNewContactNotes("");
  };

  const handleQuickEmail = (contact: EmailContact) => {
    // Update last used timestamp
    if (isDemoMode) {
      DemoStorage.updateEmailContactLastUsed(contact.id);
    } else {
      // TODO: API call to update last used
    }

    // Open default email client with mailto: link
    const mailtoLink = `mailto:${contact.email}?subject=${encodeURIComponent(
      emailSubject || ""
    )}&body=${encodeURIComponent(emailBody || "")}`;
    window.location.href = mailtoLink;

    setShowQuickEmail(false);
    setSelectedContact(null);
    setEmailSubject("");
    setEmailBody("");

    toast({
      title: "Opening Email",
      description: `Composing email to ${contact.name}`,
    });
  };

  const openQuickEmailDialog = (contact: EmailContact) => {
    setSelectedContact(contact);
    setShowQuickEmail(true);
  };

  // Filter contacts based on search
  const filteredContacts = displayContacts.filter(
    (contact) =>
      contact.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      contact.email.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="space-y-4">
      {/* Header with Add Button */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold text-slate-800">Quick Email Contacts</h3>
          <p className="text-sm text-slate-500">
            Save frequently used email addresses for one-click access
          </p>
        </div>
        <Button
          onClick={() => setShowAddContact(true)}
          className="bg-blue-600 hover:bg-blue-700"
          size="sm"
          data-testid="button-add-email-contact"
        >
          <UserPlus className="h-4 w-4 mr-2" />
          Add Contact
        </Button>
      </div>

      {/* Search/Autocomplete */}
      <div className="relative">
        <Input
          placeholder="Search contacts by name or email..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full"
          data-testid="input-search-contacts"
        />
      </div>

      {/* Contact List */}
      <ScrollArea className="h-[400px] border border-slate-200 rounded-lg">
        <div className="p-4 space-y-2">
          {filteredContacts.length === 0 ? (
            <div className="text-center py-8 text-slate-400">
              <Mail className="h-12 w-12 mx-auto mb-2 opacity-50" />
              <p className="text-sm">No contacts found</p>
              {displayContacts.length === 0 && (
                <p className="text-xs mt-1">Click "Add Contact" to save your first email</p>
              )}
            </div>
          ) : (
            filteredContacts.map((contact) => (
              <div
                key={contact.id}
                className="flex items-center justify-between p-3 bg-slate-50 rounded-lg hover:bg-slate-100 transition-colors"
              >
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <h4 className="font-semibold text-slate-800 truncate">
                      {contact.name}
                    </h4>
                    {contact.category && (
                      <Badge variant="secondary" className="text-xs">
                        {contact.category}
                      </Badge>
                    )}
                  </div>
                  <p className="text-sm text-slate-600 truncate">{contact.email}</p>
                  {contact.notes && (
                    <p className="text-xs text-slate-500 mt-1 truncate">{contact.notes}</p>
                  )}
                </div>
                <div className="flex items-center gap-2 ml-4">
                  <Button
                    onClick={() => openQuickEmailDialog(contact)}
                    size="sm"
                    className="bg-blue-600 hover:bg-blue-700"
                    data-testid={`button-email-${contact.id}`}
                  >
                    <Mail className="h-4 w-4 mr-1" />
                    Email
                  </Button>
                  <Button
                    onClick={() => deleteContactMutation.mutate(contact.id)}
                    size="sm"
                    variant="ghost"
                    className="text-red-600 hover:text-red-700 hover:bg-red-50"
                    data-testid={`button-delete-${contact.id}`}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            ))
          )}
        </div>
      </ScrollArea>

      {/* Add Contact Dialog */}
      <Dialog open={showAddContact} onOpenChange={setShowAddContact}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Add Email Contact</DialogTitle>
            <DialogDescription>
              Save a contact for quick email access
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="contact-name">Name *</Label>
              <Input
                id="contact-name"
                placeholder="John Smith"
                value={newContactName}
                onChange={(e) => setNewContactName(e.target.value)}
                data-testid="input-contact-name"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="contact-email">Email Address *</Label>
              <Input
                id="contact-email"
                type="email"
                placeholder="john.smith@company.com"
                value={newContactEmail}
                onChange={(e) => setNewContactEmail(e.target.value)}
                data-testid="input-contact-email"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="contact-category">Category (Optional)</Label>
              <Input
                id="contact-category"
                placeholder="Management, HR, Safety, etc."
                value={newContactCategory}
                onChange={(e) => setNewContactCategory(e.target.value)}
                data-testid="input-contact-category"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="contact-notes">Notes (Optional)</Label>
              <Input
                id="contact-notes"
                placeholder="Regional Manager, Nashville office"
                value={newContactNotes}
                onChange={(e) => setNewContactNotes(e.target.value)}
                data-testid="input-contact-notes"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={resetAddForm}>
              Cancel
            </Button>
            <Button onClick={handleAddContact} className="bg-blue-600 hover:bg-blue-700">
              <Check className="h-4 w-4 mr-2" />
              Save Contact
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Quick Email Compose Dialog */}
      <Dialog open={showQuickEmail} onOpenChange={setShowQuickEmail}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>
              Email {selectedContact?.name}
            </DialogTitle>
            <DialogDescription>
              Opens your default email client
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="bg-slate-50 p-3 rounded-lg">
              <p className="text-sm font-semibold text-slate-700">To:</p>
              <p className="text-sm text-slate-600">{selectedContact?.email}</p>
            </div>
            <div className="space-y-2">
              <Label htmlFor="email-subject">Subject (Optional)</Label>
              <Input
                id="email-subject"
                placeholder="Email subject..."
                value={emailSubject}
                onChange={(e) => setEmailSubject(e.target.value)}
                data-testid="input-email-subject"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="email-body">Message (Optional)</Label>
              <textarea
                id="email-body"
                placeholder="Email message..."
                value={emailBody}
                onChange={(e) => setEmailBody(e.target.value)}
                className="w-full min-h-[100px] p-3 border border-slate-300 rounded-lg resize-none focus:outline-none focus:ring-2 focus:ring-blue-500"
                data-testid="input-email-body"
              />
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setShowQuickEmail(false);
                setSelectedContact(null);
                setEmailSubject("");
                setEmailBody("");
              }}
            >
              Cancel
            </Button>
            <Button
              onClick={() => selectedContact && handleQuickEmail(selectedContact)}
              className="bg-blue-600 hover:bg-blue-700"
            >
              <ExternalLink className="h-4 w-4 mr-2" />
              Open Email Client
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
