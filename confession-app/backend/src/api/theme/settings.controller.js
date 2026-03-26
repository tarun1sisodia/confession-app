import * as settingsService from './settings.service.js';
import catchAsync from '../../utils/catchAsync.js';

export const getSettings = catchAsync(async (req, res) => {
  const settings = await settingsService.getSettings(req.headers['x-device-id']);
  res.status(200).json({ status: 'success', data: settings });
});

export const updateSettings = catchAsync(async (req, res) => {
  const updated = await settingsService.updateSettings(req.headers['x-device-id'], req.body);
  res.status(200).json({ status: 'success', data: updated });
});
