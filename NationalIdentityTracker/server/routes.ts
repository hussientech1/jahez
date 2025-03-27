import express, { type Express, Request, Response } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { 
  loginSchema, 
  insertUserSchema, 
  insertApplicationSchema, 
  insertDocumentSchema,
  insertNotificationSchema
} from "@shared/schema";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { ZodError } from "zod";
import { fromZodError } from "zod-validation-error";

// Default JWT secret, should be overridden by environment variable in production
const JWT_SECRET = process.env.JWT_SECRET || "absher-jwt-secret-key";
const SALT_ROUNDS = 10;

// Rate limiting for login attempts
const loginAttempts = new Map<string, { count: number, lastAttempt: number }>();
const MAX_LOGIN_ATTEMPTS = 5;
const LOCKOUT_TIME = 15 * 60 * 1000; // 15 minutes in milliseconds

export async function registerRoutes(app: Express): Promise<Server> {
  const router = express.Router();

  // Middleware to verify JWT token
  const authenticateToken = (req: Request, res: Response, next: any) => {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];
    
    if (!token) return res.status(401).json({ message: "Authentication required" });
    
    jwt.verify(token, JWT_SECRET, (err: any, user: any) => {
      if (err) return res.status(403).json({ message: "Invalid or expired token" });
      
      // Check if req.body is undefined and initialize it if necessary
      if (req.body === undefined) {
        req.body = {};
      }
      
      // Store the user data in the request object
      req.body.user = user;
      next();
    });
  };

  // User authentication routes
  router.post('/auth/login', async (req: Request, res: Response) => {
    try {
      const { nationalNumber, password } = loginSchema.parse(req.body);
      
      // Check for rate limiting
      const ipAddress = req.ip || req.socket.remoteAddress || 'unknown';
      const attempts = loginAttempts.get(ipAddress) || { count: 0, lastAttempt: 0 };
      
      // Check if account is locked out
      if (attempts.count >= MAX_LOGIN_ATTEMPTS) {
        const timeSinceLockout = Date.now() - attempts.lastAttempt;
        if (timeSinceLockout < LOCKOUT_TIME) {
          const minutesLeft = Math.ceil((LOCKOUT_TIME - timeSinceLockout) / 60000);
          return res.status(429).json({ 
            message: `Too many failed login attempts. Account locked for ${minutesLeft} more minutes` 
          });
        } else {
          // Reset attempts after lockout period
          loginAttempts.set(ipAddress, { count: 0, lastAttempt: Date.now() });
        }
      }
      
      const user = await storage.getUserByNationalNumber(nationalNumber);
      
      if (!user) {
        // Increment failed attempts
        loginAttempts.set(ipAddress, { 
          count: attempts.count + 1, 
          lastAttempt: Date.now() 
        });
        
        return res.status(401).json({ message: "Invalid National Number or password" });
      }
      
      const passwordMatch = await bcrypt.compare(password, user.password);
      
      if (!passwordMatch) {
        // Increment failed attempts
        loginAttempts.set(ipAddress, { 
          count: attempts.count + 1, 
          lastAttempt: Date.now() 
        });
        
        return res.status(401).json({ message: "Invalid National Number or password" });
      }
      
      // Reset login attempts on successful login
      loginAttempts.delete(ipAddress);
      
      // Generate JWT token
      const token = jwt.sign(
        { id: user.id, nationalNumber: user.nationalNumber },
        JWT_SECRET,
        { expiresIn: '24h' }
      );
      
      res.json({ 
        token,
        user: {
          id: user.id,
          nationalNumber: user.nationalNumber,
          fullName: user.fullName,
          profileComplete: user.profileComplete,
          darkMode: user.darkMode,
          language: user.language,
        }
      });
      
    } catch (error) {
      if (error instanceof ZodError) {
        const validationError = fromZodError(error);
        res.status(400).json({ message: validationError.message });
      } else {
        res.status(500).json({ message: "Internal server error" });
      }
    }
  });

  router.post('/auth/register', async (req: Request, res: Response) => {
    try {
      const userData = insertUserSchema.parse(req.body);
      
      // Check if user with this national number already exists
      const existingUser = await storage.getUserByNationalNumber(userData.nationalNumber);
      if (existingUser) {
        return res.status(409).json({ message: "User with this National Number already exists" });
      }
      
      // Hash the password
      const hashedPassword = await bcrypt.hash(userData.password, SALT_ROUNDS);
      
      // Create the user with hashed password
      const user = await storage.createUser({
        ...userData,
        password: hashedPassword
      });
      
      // Generate JWT token
      const token = jwt.sign(
        { id: user.id, nationalNumber: user.nationalNumber },
        JWT_SECRET,
        { expiresIn: '24h' }
      );
      
      res.status(201).json({ 
        token,
        user: {
          id: user.id,
          nationalNumber: user.nationalNumber,
          fullName: user.fullName,
          profileComplete: user.profileComplete,
          darkMode: user.darkMode,
          language: user.language,
        }
      });
      
    } catch (error) {
      if (error instanceof ZodError) {
        const validationError = fromZodError(error);
        res.status(400).json({ message: validationError.message });
      } else {
        res.status(500).json({ message: "Internal server error" });
      }
    }
  });

  // User routes
  router.get('/user', authenticateToken, async (req: Request, res: Response) => {
    try {
      const { id } = req.body.user;
      const user = await storage.getUser(id);
      
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }
      
      res.json({
        id: user.id,
        nationalNumber: user.nationalNumber,
        fullName: user.fullName,
        phoneNumber: user.phoneNumber,
        email: user.email,
        profileComplete: user.profileComplete,
        darkMode: user.darkMode,
        language: user.language,
      });
      
    } catch (error) {
      res.status(500).json({ message: "Internal server error" });
    }
  });

  router.put('/user/settings', authenticateToken, async (req: Request, res: Response) => {
    try {
      const { id } = req.body.user;
      const { darkMode, language, phoneNumber, email } = req.body;
      
      const updatedUser = await storage.updateUser(id, {
        darkMode,
        language,
        phoneNumber,
        email
      });
      
      if (!updatedUser) {
        return res.status(404).json({ message: "User not found" });
      }
      
      res.json({
        id: updatedUser.id,
        nationalNumber: updatedUser.nationalNumber,
        fullName: updatedUser.fullName,
        phoneNumber: updatedUser.phoneNumber,
        email: updatedUser.email,
        profileComplete: updatedUser.profileComplete,
        darkMode: updatedUser.darkMode,
        language: updatedUser.language,
      });
      
    } catch (error) {
      res.status(500).json({ message: "Internal server error" });
    }
  });

  // Document routes
  router.get('/user/docs', authenticateToken, async (req: Request, res: Response) => {
    try {
      const { id } = req.body.user;
      const documents = await storage.getDocuments(id);
      res.json(documents);
    } catch (error) {
      res.status(500).json({ message: "Internal server error" });
    }
  });

  router.post('/user/docs', authenticateToken, async (req: Request, res: Response) => {
    try {
      const { id } = req.body.user;
      const documentData = insertDocumentSchema.parse({
        ...req.body,
        userId: id
      });
      
      const newDocument = await storage.createDocument(documentData);
      res.status(201).json(newDocument);
    } catch (error) {
      if (error instanceof ZodError) {
        const validationError = fromZodError(error);
        res.status(400).json({ message: validationError.message });
      } else {
        res.status(500).json({ message: "Internal server error" });
      }
    }
  });

  // Services routes
  router.get('/services', async (req: Request, res: Response) => {
    try {
      const services = await storage.getServices();
      res.json(services);
    } catch (error) {
      res.status(500).json({ message: "Internal server error" });
    }
  });

  // Offices routes
  router.get('/offices', async (req: Request, res: Response) => {
    try {
      const offices = await storage.getOffices();
      res.json(offices);
    } catch (error) {
      res.status(500).json({ message: "Internal server error" });
    }
  });

  // Applications routes
  router.get('/applications', authenticateToken, async (req: Request, res: Response) => {
    try {
      const { id } = req.body.user;
      const applications = await storage.getApplications(id);
      
      // Fetch service and office details for each application
      const applicationsWithDetails = await Promise.all(
        applications.map(async (app) => {
          const service = await storage.getService(app.serviceId);
          const office = await storage.getOffice(app.officeId);
          return {
            ...app,
            serviceName: service?.name,
            officeName: office?.name,
          };
        })
      );
      
      res.json(applicationsWithDetails);
    } catch (error) {
      res.status(500).json({ message: "Internal server error" });
    }
  });

  router.post('/services/apply', authenticateToken, async (req: Request, res: Response) => {
    try {
      const { id } = req.body.user;
      const { serviceId, officeId, invoiceNumber, isEmergency } = req.body;
      
      // Validate application data
      const applicationData = insertApplicationSchema.parse({
        userId: id,
        serviceId,
        officeId,
        invoiceNumber,
        isEmergency: !!isEmergency,
        status: "pending"
      });
      
      // Create the application
      const application = await storage.createApplication(applicationData);
      
      // Create a notification for the application
      const service = await storage.getService(serviceId);
      const notificationData = insertNotificationSchema.parse({
        userId: id,
        title: `Application Submitted: ${service?.name}`,
        message: `Your application for ${service?.name} has been submitted and is pending review.`,
        type: "info"
      });
      
      await storage.createNotification(notificationData);
      
      res.status(201).json(application);
    } catch (error) {
      if (error instanceof ZodError) {
        const validationError = fromZodError(error);
        res.status(400).json({ message: validationError.message });
      } else {
        res.status(500).json({ message: "Internal server error" });
      }
    }
  });

  // Notifications routes
  router.get('/notifications', authenticateToken, async (req: Request, res: Response) => {
    try {
      const { id } = req.body.user;
      const notifications = await storage.getNotifications(id);
      res.json(notifications);
    } catch (error) {
      res.status(500).json({ message: "Internal server error" });
    }
  });

  router.put('/notifications/:id/read', authenticateToken, async (req: Request, res: Response) => {
    try {
      const notificationId = parseInt(req.params.id);
      const updatedNotification = await storage.markNotificationAsRead(notificationId);
      
      if (!updatedNotification) {
        return res.status(404).json({ message: "Notification not found" });
      }
      
      res.json(updatedNotification);
    } catch (error) {
      res.status(500).json({ message: "Internal server error" });
    }
  });

  // Register routes with /api prefix
  app.use('/api', router);

  const httpServer = createServer(app);
  return httpServer;
}
