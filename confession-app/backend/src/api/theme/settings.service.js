import Settings from './settings.model.js';
import AppError from '../../utils/AppError.js';

const ALLOWED_THEMES = new Set(['light', 'dark', 'system']);

const sanitizeDeviceId = (deviceId) => {
  if (!deviceId || typeof deviceId !== 'string') {
    return '';
  }

  return deviceId.trim().slice(0, 120);
};

export const getSettings = async (deviceId) => {
  const normalizedDeviceId = sanitizeDeviceId(deviceId);
  if (!normalizedDeviceId) return { theme: 'system', revealEnabled: true };

  const pref = await Settings.findOne({ deviceId: normalizedDeviceId });
  return pref || { theme: 'system', revealEnabled: true };
};

export const updateSettings = async (deviceId, data) => {
  const normalizedDeviceId = sanitizeDeviceId(deviceId);
  if (!normalizedDeviceId) {
    throw new AppError('deviceId is required', 400);
  }
  
  const updateObj = {};
  if (data.theme) {
    if (!ALLOWED_THEMES.has(data.theme)) {
      throw new AppError('Invalid theme selection', 400);
    }
    updateObj.theme = data.theme;
  }
  if (typeof data.revealEnabled === 'boolean') updateObj.revealEnabled = data.revealEnabled;

  const pref = await Settings.findOneAndUpdate(
    { deviceId: normalizedDeviceId },
    { $set: updateObj },
    { upsert: true, new: true, setDefaultsOnInsert: true }
  );
  return pref;
};
