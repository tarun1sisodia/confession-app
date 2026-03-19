import express from 'express';
import * as settingsController from './settings.controller.js';

const router = express.Router();

router.get('/:deviceId', settingsController.getSettings);
router.post('/', settingsController.updateSettings);

export default router;
