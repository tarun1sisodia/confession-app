import express from 'express';
import cors from 'cors';
import confessionRoutes from './api/confession/confession.routes.js';
import settingsRoutes from './api/theme/settings.routes.js';
import errorMiddleware from './middlewares/error.middleware.js';
import AppError from './utils/AppError.js';

const app = express();

// Global Middlewares
app.use(cors({
  origin: process.env.FRONTEND_URL || '*',
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  credentials: true
}));
app.use(express.json({ limit: '10kb' })); 

// Health Check
app.get('/health', (req, res) => {
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
