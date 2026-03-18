const env = require('./config/env');
const connectDB = require('./config/database');
const app = require('./app');
const logger = require('./utils/logger');

// Catch synchronous exceptions
process.on('uncaughtException', err => {
  logger.error('UNCAUGHT EXCEPTION! 💥 Shutting down...');
  logger.error(err.name, err.message);
  process.exit(1);
});

// Connect to DB
connectDB();

// Start Server
const server = app.listen(env.PORT, () => {
  logger.info(`Node Server running on port ${env.PORT} in ${env.NODE_ENV} mode.`);
});

// Catch asynchronous rejections
process.on('unhandledRejection', err => {
  logger.error('UNHANDLED REJECTION! 💥 Shutting down...');
  logger.error(err.name, err.message);
  server.close(() => {
    process.exit(1);
  });
});
