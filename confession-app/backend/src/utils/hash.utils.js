import crypto from 'crypto';
import env from '../config/env.js';
import AppError from './AppError.js';

const getDeviceIdSecret = () => {
  const secret = env.DEVICE_ID_SECRET?.trim();
  if (!secret) {
    throw new AppError('Device identity hashing is not configured on the server', 503);
  }

  return secret;
};

/**
 * Hashes a device ID using HMAC with a secret key for security.
 * @param {string} deviceId - The raw device ID from headers.
 * @returns {string} - The hashed device ID.
 */
export const hashDeviceId = (deviceId) => {
  if (!deviceId) return '';

  return crypto
    .createHmac('sha256', getDeviceIdSecret())
    .update(deviceId)
    .digest('hex');
};
