import { 
  users, type User, type InsertUser,
  documents, type Document, type InsertDocument,
  services, type Service, type InsertService,
  offices, type Office, type InsertOffice,
  applications, type Application, type InsertApplication,
  notifications, type Notification, type InsertNotification
} from "@shared/schema";

export interface IStorage {
  // User operations
  getUser(id: number): Promise<User | undefined>;
  getUserByNationalNumber(nationalNumber: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  updateUser(id: number, data: Partial<User>): Promise<User | undefined>;
  
  // Document operations
  getDocuments(userId: number): Promise<Document[]>;
  getDocument(id: number): Promise<Document | undefined>;
  createDocument(document: InsertDocument): Promise<Document>;
  
  // Service operations
  getServices(): Promise<Service[]>;
  getService(id: number): Promise<Service | undefined>;
  createService(service: InsertService): Promise<Service>;
  
  // Office operations
  getOffices(): Promise<Office[]>;
  getOffice(id: number): Promise<Office | undefined>;
  createOffice(office: InsertOffice): Promise<Office>;
  
  // Application operations
  getApplications(userId: number): Promise<Application[]>;
  getApplication(id: number): Promise<Application | undefined>;
  createApplication(application: InsertApplication): Promise<Application>;
  updateApplicationStatus(id: number, status: string, rejectionReason?: string): Promise<Application | undefined>;
  
  // Notification operations
  getNotifications(userId: number): Promise<Notification[]>;
  getNotification(id: number): Promise<Notification | undefined>;
  createNotification(notification: InsertNotification): Promise<Notification>;
  markNotificationAsRead(id: number): Promise<Notification | undefined>;
}

export class MemStorage implements IStorage {
  private usersData: Map<number, User>;
  private documentsData: Map<number, Document>;
  private servicesData: Map<number, Service>;
  private officesData: Map<number, Office>;
  private applicationsData: Map<number, Application>;
  private notificationsData: Map<number, Notification>;
  
  private currentUserId: number;
  private currentDocumentId: number;
  private currentServiceId: number;
  private currentOfficeId: number;
  private currentApplicationId: number;
  private currentNotificationId: number;

  constructor() {
    this.usersData = new Map();
    this.documentsData = new Map();
    this.servicesData = new Map();
    this.officesData = new Map();
    this.applicationsData = new Map();
    this.notificationsData = new Map();
    
    this.currentUserId = 1;
    this.currentDocumentId = 1;
    this.currentServiceId = 1;
    this.currentOfficeId = 1;
    this.currentApplicationId = 1;
    this.currentNotificationId = 1;
    
    // Initialize with some services and offices
    this.initializeServices();
    this.initializeOffices();
  }

  private initializeServices() {
    const servicesData = [
      { name: "New Passport Application", description: "Apply for a new passport" },
      { name: "Passport Renewal", description: "Renew your existing passport" },
      { name: "New ID Card Application", description: "Apply for a new ID card" },
      { name: "ID Card Renewal", description: "Renew your existing ID card" },
      { name: "Birth Certificate", description: "Request a birth certificate" },
      { name: "Emergency Travel Document", description: "Apply for emergency travel documents" }
    ];

    servicesData.forEach(service => {
      this.createService(service as InsertService);
    });
  }

  private initializeOffices() {
    const officesData = [
      { name: "Khartoum State Office", location: "Khartoum" },
      { name: "Gezira State Office", location: "Gezira" },
      { name: "Kassala State Office", location: "Kassala" },
      { name: "Darfur State Office", location: "Darfur" },
      { name: "River Nile State Office", location: "River Nile" },
      { name: "Red Sea State Office", location: "Red Sea" }
    ];

    officesData.forEach(office => {
      this.createOffice(office as InsertOffice);
    });
  }

  // User operations
  async getUser(id: number): Promise<User | undefined> {
    return this.usersData.get(id);
  }

  async getUserByNationalNumber(nationalNumber: string): Promise<User | undefined> {
    return Array.from(this.usersData.values()).find(
      (user) => user.nationalNumber.toLowerCase() === nationalNumber.toLowerCase(),
    );
  }

  async createUser(user: InsertUser): Promise<User> {
    const id = this.currentUserId++;
    const createdAt = new Date();
    const newUser: User = { ...user, id, createdAt };
    this.usersData.set(id, newUser);
    return newUser;
  }

  async updateUser(id: number, data: Partial<User>): Promise<User | undefined> {
    const user = await this.getUser(id);
    if (!user) return undefined;

    const updatedUser = { ...user, ...data };
    this.usersData.set(id, updatedUser);
    return updatedUser;
  }

  // Document operations
  async getDocuments(userId: number): Promise<Document[]> {
    return Array.from(this.documentsData.values()).filter(
      (doc) => doc.userId === userId,
    );
  }

  async getDocument(id: number): Promise<Document | undefined> {
    return this.documentsData.get(id);
  }

  async createDocument(document: InsertDocument): Promise<Document> {
    const id = this.currentDocumentId++;
    const createdAt = new Date();
    const newDocument: Document = { ...document, id, createdAt };
    this.documentsData.set(id, newDocument);
    return newDocument;
  }

  // Service operations
  async getServices(): Promise<Service[]> {
    return Array.from(this.servicesData.values());
  }

  async getService(id: number): Promise<Service | undefined> {
    return this.servicesData.get(id);
  }

  async createService(service: InsertService): Promise<Service> {
    const id = this.currentServiceId++;
    const newService: Service = { ...service, id };
    this.servicesData.set(id, newService);
    return newService;
  }

  // Office operations
  async getOffices(): Promise<Office[]> {
    return Array.from(this.officesData.values());
  }

  async getOffice(id: number): Promise<Office | undefined> {
    return this.officesData.get(id);
  }

  async createOffice(office: InsertOffice): Promise<Office> {
    const id = this.currentOfficeId++;
    const newOffice: Office = { ...office, id };
    this.officesData.set(id, newOffice);
    return newOffice;
  }

  // Application operations
  async getApplications(userId: number): Promise<Application[]> {
    return Array.from(this.applicationsData.values()).filter(
      (app) => app.userId === userId,
    );
  }

  async getApplication(id: number): Promise<Application | undefined> {
    return this.applicationsData.get(id);
  }

  async createApplication(application: InsertApplication): Promise<Application> {
    const id = this.currentApplicationId++;
    const appliedAt = new Date();
    const updatedAt = new Date();
    const newApplication: Application = { ...application, id, appliedAt, updatedAt };
    this.applicationsData.set(id, newApplication);
    return newApplication;
  }

  async updateApplicationStatus(id: number, status: string, rejectionReason?: string): Promise<Application | undefined> {
    const application = await this.getApplication(id);
    if (!application) return undefined;

    const updatedApplication: Application = { 
      ...application, 
      status, 
      rejectionReason: rejectionReason || application.rejectionReason,
      updatedAt: new Date()
    };
    
    this.applicationsData.set(id, updatedApplication);
    return updatedApplication;
  }

  // Notification operations
  async getNotifications(userId: number): Promise<Notification[]> {
    return Array.from(this.notificationsData.values())
      .filter((notification) => notification.userId === userId)
      .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
  }

  async getNotification(id: number): Promise<Notification | undefined> {
    return this.notificationsData.get(id);
  }

  async createNotification(notification: InsertNotification): Promise<Notification> {
    const id = this.currentNotificationId++;
    const createdAt = new Date();
    const newNotification: Notification = { ...notification, id, createdAt };
    this.notificationsData.set(id, newNotification);
    return newNotification;
  }

  async markNotificationAsRead(id: number): Promise<Notification | undefined> {
    const notification = await this.getNotification(id);
    if (!notification) return undefined;

    const updatedNotification: Notification = { ...notification, read: true };
    this.notificationsData.set(id, updatedNotification);
    return updatedNotification;
  }
}

export const storage = new MemStorage();
