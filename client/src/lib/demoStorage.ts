// Demo Mode Storage - Full functionality without database persistence
// All data stored in localStorage for 30-minute demo sessions

interface DemoDriver {
  id: number;
  phoneLast4: string;
  name: string;
  status: string;
  isOnRoster: boolean;
  role?: string;
  type?: string;
  avatarUrl?: string;
  employeeId?: number;
}

interface DemoEmployee {
  id: number;
  name: string;
  badgeNumber: string;
  department: string;
  role: string;
  type: string;
  isActive: boolean;
}

interface DemoMessage {
  id: number;
  fromId: string;
  toId: string | null;
  content: string;
  timestamp: string;
  isRead: boolean;
}

interface DemoEmailContact {
  id: number;
  name: string;
  email: string;
  category?: string;
  notes?: string;
  addedBy: string;
  createdAt: string;
  lastUsed?: string;
}

export class DemoStorage {
  private static DEMO_DRIVERS_KEY = 'vanops_demo_drivers';
  private static DEMO_EMPLOYEES_KEY = 'vanops_demo_employees';
  private static DEMO_MESSAGES_KEY = 'vanops_demo_messages';
  private static DEMO_EMAIL_CONTACTS_KEY = 'vanops_demo_email_contacts';

  // Check if in demo mode
  static isDemoMode(): boolean {
    return localStorage.getItem('vanops_demo_mode') === 'true';
  }

  // Initialize demo data with some sample records
  static initializeDemoData() {
    if (!this.isDemoMode()) return;

    // Initialize drivers if not exists
    if (!localStorage.getItem(this.DEMO_DRIVERS_KEY)) {
      const sampleDrivers: DemoDriver[] = [];
      localStorage.setItem(this.DEMO_DRIVERS_KEY, JSON.stringify(sampleDrivers));
    }

    // Initialize employees if not exists
    if (!localStorage.getItem(this.DEMO_EMPLOYEES_KEY)) {
      const sampleEmployees: DemoEmployee[] = [];
      localStorage.setItem(this.DEMO_EMPLOYEES_KEY, JSON.stringify(sampleEmployees));
    }

    // Initialize messages if not exists
    if (!localStorage.getItem(this.DEMO_MESSAGES_KEY)) {
      const sampleMessages: DemoMessage[] = [];
      localStorage.setItem(this.DEMO_MESSAGES_KEY, JSON.stringify(sampleMessages));
    }
  }

  // DRIVERS
  static getDrivers(): DemoDriver[] {
    const data = localStorage.getItem(this.DEMO_DRIVERS_KEY);
    return data ? JSON.parse(data) : [];
  }

  static addDriver(driver: Omit<DemoDriver, 'id'>): DemoDriver {
    const drivers = this.getDrivers();
    const newDriver = {
      ...driver,
      id: drivers.length > 0 ? Math.max(...drivers.map(d => d.id)) + 1 : 1
    };
    drivers.push(newDriver);
    localStorage.setItem(this.DEMO_DRIVERS_KEY, JSON.stringify(drivers));
    return newDriver;
  }

  static updateDriver(id: number, updates: Partial<DemoDriver>): DemoDriver | null {
    const drivers = this.getDrivers();
    const index = drivers.findIndex(d => d.id === id);
    if (index === -1) return null;
    
    drivers[index] = { ...drivers[index], ...updates };
    localStorage.setItem(this.DEMO_DRIVERS_KEY, JSON.stringify(drivers));
    return drivers[index];
  }

  static deleteDriver(id: number): boolean {
    const drivers = this.getDrivers();
    const filtered = drivers.filter(d => d.id !== id);
    if (filtered.length === drivers.length) return false;
    
    localStorage.setItem(this.DEMO_DRIVERS_KEY, JSON.stringify(filtered));
    return true;
  }

  static findDriverByPhone(phoneLast4: string): DemoDriver | null {
    const drivers = this.getDrivers();
    return drivers.find(d => d.phoneLast4 === phoneLast4) || null;
  }

  static findDriverByName(name: string): DemoDriver | null {
    const drivers = this.getDrivers();
    return drivers.find(d => d.name.toLowerCase().includes(name.toLowerCase())) || null;
  }

  // EMPLOYEES
  static getEmployees(): DemoEmployee[] {
    const data = localStorage.getItem(this.DEMO_EMPLOYEES_KEY);
    return data ? JSON.parse(data) : [];
  }

  static addEmployee(employee: Omit<DemoEmployee, 'id'>): DemoEmployee {
    const employees = this.getEmployees();
    const newEmployee = {
      ...employee,
      id: employees.length > 0 ? Math.max(...employees.map(e => e.id)) + 1 : 1
    };
    employees.push(newEmployee);
    localStorage.setItem(this.DEMO_EMPLOYEES_KEY, JSON.stringify(employees));
    return newEmployee;
  }

  static deleteEmployee(id: number): boolean {
    const employees = this.getEmployees();
    const filtered = employees.filter(e => e.id !== id);
    if (filtered.length === employees.length) return false;
    
    localStorage.setItem(this.DEMO_EMPLOYEES_KEY, JSON.stringify(filtered));
    return true;
  }

  // MESSAGES
  static getMessages(): DemoMessage[] {
    const data = localStorage.getItem(this.DEMO_MESSAGES_KEY);
    return data ? JSON.parse(data) : [];
  }

  static addMessage(message: Omit<DemoMessage, 'id' | 'timestamp'>): DemoMessage {
    const messages = this.getMessages();
    const newMessage = {
      ...message,
      id: messages.length > 0 ? Math.max(...messages.map(m => m.id)) + 1 : 1,
      timestamp: new Date().toISOString()
    };
    messages.push(newMessage);
    localStorage.setItem(this.DEMO_MESSAGES_KEY, JSON.stringify(messages));
    return newMessage;
  }

  static markMessageRead(id: number): boolean {
    const messages = this.getMessages();
    const index = messages.findIndex(m => m.id === id);
    if (index === -1) return false;
    
    messages[index].isRead = true;
    localStorage.setItem(this.DEMO_MESSAGES_KEY, JSON.stringify(messages));
    return true;
  }

  // EMAIL CONTACTS
  static getEmailContacts(userPin: string): DemoEmailContact[] {
    const data = localStorage.getItem(this.DEMO_EMAIL_CONTACTS_KEY);
    const allContacts = data ? JSON.parse(data) : [];
    // Filter by user who added them
    return allContacts.filter((c: DemoEmailContact) => c.addedBy === userPin);
  }

  static addEmailContact(contact: Omit<DemoEmailContact, 'id' | 'createdAt'>): DemoEmailContact {
    const data = localStorage.getItem(this.DEMO_EMAIL_CONTACTS_KEY);
    const contacts = data ? JSON.parse(data) : [];
    
    const newContact = {
      ...contact,
      id: contacts.length > 0 ? Math.max(...contacts.map((c: DemoEmailContact) => c.id)) + 1 : 1,
      createdAt: new Date().toISOString()
    };
    
    contacts.push(newContact);
    localStorage.setItem(this.DEMO_EMAIL_CONTACTS_KEY, JSON.stringify(contacts));
    return newContact;
  }

  static updateEmailContactLastUsed(id: number): boolean {
    const data = localStorage.getItem(this.DEMO_EMAIL_CONTACTS_KEY);
    const contacts = data ? JSON.parse(data) : [];
    const index = contacts.findIndex((c: DemoEmailContact) => c.id === id);
    if (index === -1) return false;
    
    contacts[index].lastUsed = new Date().toISOString();
    localStorage.setItem(this.DEMO_EMAIL_CONTACTS_KEY, JSON.stringify(contacts));
    return true;
  }

  static removeEmailContact(id: number): boolean {
    const data = localStorage.getItem(this.DEMO_EMAIL_CONTACTS_KEY);
    const contacts = data ? JSON.parse(data) : [];
    const filtered = contacts.filter((c: DemoEmailContact) => c.id !== id);
    if (filtered.length === contacts.length) return false;
    
    localStorage.setItem(this.DEMO_EMAIL_CONTACTS_KEY, JSON.stringify(filtered));
    return true;
  }

  // SAVED DOCUMENTS
  static getSavedDocuments(userPin: string): any[] {
    const data = localStorage.getItem('vanops_demo_documents');
    const allDocs = data ? JSON.parse(data) : [];
    // Filter by user who uploaded them
    return allDocs.filter((d: any) => d.uploadedBy === userPin);
  }

  static addSavedDocument(document: any): any {
    const data = localStorage.getItem('vanops_demo_documents');
    const documents = data ? JSON.parse(data) : [];
    
    const newDocument = {
      ...document,
      id: documents.length > 0 ? Math.max(...documents.map((d: any) => d.id)) + 1 : 1,
      createdAt: new Date().toISOString()
    };
    
    documents.push(newDocument);
    localStorage.setItem('vanops_demo_documents', JSON.stringify(documents));
    return newDocument;
  }

  static removeSavedDocument(id: number): boolean {
    const data = localStorage.getItem('vanops_demo_documents');
    const documents = data ? JSON.parse(data) : [];
    const filtered = documents.filter((d: any) => d.id !== id);
    if (filtered.length === documents.length) return false;
    
    localStorage.setItem('vanops_demo_documents', JSON.stringify(filtered));
    return true;
  }

  // Clear all demo data
  static clearAllDemoData() {
    localStorage.removeItem(this.DEMO_DRIVERS_KEY);
    localStorage.removeItem(this.DEMO_EMPLOYEES_KEY);
    localStorage.removeItem(this.DEMO_MESSAGES_KEY);
    localStorage.removeItem(this.DEMO_EMAIL_CONTACTS_KEY);
    localStorage.removeItem('vanops_demo_documents');
  }
}

// Initialize demo data on module load if in demo mode
if (DemoStorage.isDemoMode()) {
  DemoStorage.initializeDemoData();
}
