import env from './config/env.js';
import connectDB from './config/database.js';
import app from './app.js';
import logger from './utils/logger.js';

process.on('uncaughtException', (err) => {
  logger.error('UNCAUGHT EXCEPTION! Shutting down...');
  logger.error(err.name, err.message);
  process.exit(1);
});

connectDB();

const server = app.listen(env.PORT, () => {
  logger.info(`Node Server running on port ${env.PORT} in ${env.NODE_ENV} mode.`);
});

process.on('unhandledRejection', (err) => {
  logger.error('UNHANDLED REJECTION! Shutting down...');
  logger.error(err.name, err.message);
  server.close(() => {
    process.exit(1);
  });
});
