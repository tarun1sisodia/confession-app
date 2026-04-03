import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import fs from 'fs';
import path from 'path';
import confessionRoutes from './api/confession/confession.routes.js';
import settingsRoutes from './api/theme/settings.routes.js';
import env from './config/env.js';
import errorMiddleware from './middlewares/error.middleware.js';
import AppError from './utils/AppError.js';
import { trackUser } from './middlewares/analytics.middleware.js';

const app = express();
app.set('trust proxy', 1);

// Initialize upload directory
const uploadDir = path.resolve('uploads');
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
  console.log('✓ Upload directory created:', uploadDir);
} else {
  console.log('✓ Upload directory exists:', uploadDir);
}

// Verify upload directory is writable
try {
  const testFile = path.join(uploadDir, '.write-test');
  fs.writeFileSync(testFile, 'test');
  fs.unlinkSync(testFile);
  console.log('✓ Upload directory is writable');
} catch (error) {
  console.error('✗ Upload directory is not writable:', error.message);
  console.error('  Image uploads will fail. Please check directory permissions.');
}

const allowedOrigins = env.FRONTEND_URL
  .split(",")
  .map(origin => origin.trim())
  .filter(Boolean);

// Security Headers with Helmet
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      scriptSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'"],
      imgSrc: ["'self'", "https:", "data:", "blob:"],
      connectSrc: ["'self'"],
      fontSrc: ["'self'", "data:"],
      objectSrc: ["'none'"],
      mediaSrc: ["'self'"],
      frameSrc: ["'none'"]
    }
  },
  hsts: {
    maxAge: 31536000,
    includeSubDomains: true,
    preload: true
  },
  frameguard: { action: 'deny' },
  noSniff: true,
  xssFilter: true,
  referrerPolicy: { policy: 'strict-origin-when-cross-origin' },
  crossOriginResourcePolicy: { policy: 'cross-origin' }
}));
app.use(cors({
  origin(origin, callback) {
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
      return;
    }

    callback(new Error("Not allowed by CORS"));
  },
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  credentials: true
}));
app.use(express.json({ limit: '5mb' })); 
app.use(express.urlencoded({ extended: true, limit: '5mb' }));

// Analytics Middleware
app.use(trackUser);

// Health Check - Secured for cron jobs
app.get('/health', (req, res) => {
  const healthSecret = env.HEALTH_SECRET;
  
  // If HEALTH_SECRET is set, require authentication
  if (healthSecret) {
    const providedSecret = req.headers['x-health-secret'] || req.query.secret;
    
    if (providedSecret !== healthSecret) {
      return res.status(401).json({ 
        status: 'unauthorized', 
        message: 'Invalid or missing health secret' 
      });
    }
  }
  
  res.status(200).json({ status: 'healthy', timestamp: new Date() });
});

// Domain Routes
app.use('/api/confessions', confessionRoutes);
app.use('/api/settings', settingsRoutes);

// Undefined Routes Handler
app.all('*', (req, res, next) => {
  next(new AppError(`Can't find ${req.originalUrl} on this server!`, 404));
});

// Global Error Handling Middleware
app.use(errorMiddleware);

export default app;
