import * as settingsService from './settings.service.js';
import catchAsync from '../../utils/catchAsync.js';

export const getSettings = catchAsync(async (req, res) => {
  const settings = await settingsService.getSettings(req.params.deviceId);
  res.status(200).json({ status: 'success', data: settings });
});

export const updateSettings = catchAsync(async (req, res) => {
  const { deviceId, ...settingsData } = req.body;
  const updated = await settingsService.updateSettings(deviceId, settingsData);
  res.status(200).json({ status: 'success', data: updated });
});
