import express from 'express';
import cors from 'cors';
import confessionRoutes from './api/confession/confession.routes.js';
import settingsRoutes from './api/theme/settings.routes.js';
import env from './config/env.js';
import errorMiddleware from './middlewares/error.middleware.js';
import AppError from './utils/AppError.js';
import { trackUser } from './middlewares/analytics.middleware.js';

const app = express();
app.set('trust proxy', 1);

const allowedOrigins = env.FRONTEND_URL
  .split(",")
  .map(origin => origin.trim())
  .filter(Boolean);

// Global Middlewares
app.use((req, res, next) => {
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');
  res.setHeader('X-Frame-Options', 'DENY');
  res.setHeader('Cross-Origin-Resource-Policy', 'cross-origin');
  next();
});
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
app.use(express.json({ limit: '1mb' })); 
app.use(express.urlencoded({ extended: true, limit: '1mb' }));

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
