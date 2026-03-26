import mongoose from 'mongoose';

const userTrackerSchema = new mongoose.Schema({
  deviceId: {
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

const UserTracker = mongoose.model('UserTracker', userTrackerSchema);
export default UserTracker;
