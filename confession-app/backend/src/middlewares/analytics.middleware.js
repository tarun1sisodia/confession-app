import UserTracker from '../api/confession/userTracker.model.js';
import catchAsync from '../utils/catchAsync.js';

const TRACK_INTERVAL_MS = 10 * 60 * 1000;
const recentTrackMap = new Map();

const pruneRecentTrackMap = (now) => {
  for (const [deviceId, trackedAt] of recentTrackMap.entries()) {
    if (now - trackedAt > TRACK_INTERVAL_MS) {
      recentTrackMap.delete(deviceId);
    }
  }
};

const resolvePlatform = (userAgent = '') => {
  const normalized = userAgent.toLowerCase();

  if (normalized.includes('android')) return 'android';
  if (normalized.includes('iphone') || normalized.includes('ios')) return 'ios';
  return 'web';
};

export const trackUser = catchAsync(async (req, res, next) => {
  const rawDeviceId = req.headers['x-device-id'] || req.query.deviceId || req.body?.deviceId;
  const deviceId = typeof rawDeviceId === 'string' ? rawDeviceId.trim().slice(0, 120) : '';
  const now = Date.now();

  if (deviceId) {
    pruneRecentTrackMap(now);
    const lastTrackedAt = recentTrackMap.get(deviceId) || 0;
    if (now - lastTrackedAt < TRACK_INTERVAL_MS) {
      next();
      return;
    }

    recentTrackMap.set(deviceId, now);
    await UserTracker.findOneAndUpdate(
      { deviceId },
      {
        $set: {
          lastSeen: new Date(),
          isOnline: true,
          platform: resolvePlatform(req.headers['user-agent'])
        }
      },
      { upsert: true, new: true }
    ).catch(() => undefined);
  }

  next();
});
