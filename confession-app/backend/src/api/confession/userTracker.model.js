import mongoose from 'mongoose';

const userTrackerSchema = new mongoose.Schema({
  deviceIdHash: {
    type: String,
    required: true,
    unique: true,
    index: true
  },
  lastSeen: {
    type: Date,
    default: Date.now
  },
  platform: {
    type: String,
    enum: ['web', 'android', 'ios', 'unknown'],
    default: 'unknown'
  },
  isOnline: {
    type: Boolean,
    default: true
  }
}, { timestamps: true });

// TTL index: Remove inactive users after 30 days
userTrackerSchema.index({ lastSeen: 1 }, { expireAfterSeconds: 2592000 });

const UserTracker = mongoose.model('UserTracker', userTrackerSchema);
export default UserTracker;
