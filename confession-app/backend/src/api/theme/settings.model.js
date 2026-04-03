import mongoose from 'mongoose';

const settingsSchema = new mongoose.Schema({
  deviceIdHash: {
    type: String,
    required: true,
    unique: true,
    index: true
  },
  theme: {
    type: String,
    enum: ['light', 'dark', 'system'],
    default: 'system'
  },
  revealEnabled: {
    type: Boolean,
    default: true
  }
}, { timestamps: true });

const Settings = mongoose.model('Settings', settingsSchema);
export default Settings;
