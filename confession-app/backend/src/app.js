const express = require('express');
const cors = require('cors');
const confessionRoutes = require('./api/confession/confession.routes');
const errorMiddleware = require('./middlewares/error.middleware');
const AppError = require('./utils/AppError');

const app = express();

// Global Middlewares
app.use(cors());
app.use(express.json({ limit: '10kb' })); 

// Health Check
app.get('/health', (req, res) => {
  res.status(200).json({ status: 'healthy', timestamp: new Date() });
});

// Domain Routes
app.use('/api/confessions', confessionRoutes);

// Undefined Routes Handler
app.all('*', (req, res, next) => {
  next(new AppError(`Can't find ${req.originalUrl} on this server!`, 404));
});

// Global Error Handling Middleware
app.use(errorMiddleware);

module.exports = app;
