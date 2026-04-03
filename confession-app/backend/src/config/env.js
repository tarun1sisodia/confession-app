import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, resolve } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Load environment-specific .env file
const nodeEnv = process.env.NODE_ENV || 'development';
const envFile = resolve(__dirname, '..', '..', `.env.${nodeEnv}`);

// Load .env.{environment} file (e.g., .env.production, .env.development)
dotenv.config({ path: envFile });

// Also load .env.local if it exists (for local overrides, takes precedence)
if (nodeEnv === 'development') {
  dotenv.config({ path: resolve(__dirname, '..', '..', '.env.local') });
}

// Load base .env file as fallback
dotenv.config({ path: resolve(__dirname, '..', '..', '.env') });

export default {
  NODE_ENV: process.env.NODE_ENV || 'development',
  PORT: parseInt(process.env.PORT, 10) || 5000,
  MONGO_URI: process.env.MONGO_URI || 'mongodb://localhost:27017/confessionDB',
  FRONTEND_URL: process.env.FRONTEND_URL || 'http://localhost:3000',
  DEVICE_ID_SECRET: process.env.DEVICE_ID_SECRET,
  ADMIN_KEY: process.env.ADMIN_KEY,
  CLOUDINARY_URL: process.env.CLOUDINARY_URL,
  CLOUDINARY_CLOUD_NAME: process.env.CLOUDINARY_CLOUD_NAME,
  CLOUDINARY_API_KEY: process.env.CLOUDINARY_API_KEY,
  CLOUDINARY_API_SECRET: process.env.CLOUDINARY_API_SECRET,
  LOG_LEVEL: process.env.LOG_LEVEL || 'info',
  HEALTH_SECRET: process.env.HEALTH_SECRET,
};
