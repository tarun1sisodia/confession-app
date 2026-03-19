import Settings from './settings.model.js';

export const getSettings = async (deviceId) => {
  if (!deviceId) return { theme: 'system', revealEnabled: true };
  const pref = await Settings.findOne({ deviceId });
  return pref || { theme: 'system', revealEnabled: true };
};

export const updateSettings = async (deviceId, data) => {
  if (!deviceId) throw new Error("deviceId is required");
  
  const updateObj = {};
  if (data.theme) updateObj.theme = data.theme;
  if (typeof data.revealEnabled === 'boolean') updateObj.revealEnabled = data.revealEnabled;

  const pref = await Settings.findOneAndUpdate(
    { deviceId },
    { $set: updateObj },
    { upsert: true, new: true, setDefaultsOnInsert: true }
  );
  return pref;
};
