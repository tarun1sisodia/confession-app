import mongoose from 'mongoose';

const voteSchema = new mongoose.Schema({
  confessionId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Confession',
    required: true
  },
  deviceId: {
    type: String,
    required: true
  },
  voteType: {
    type: String,
    enum: ['like', 'dislike'],
    required: true
  }
}, { timestamps: true });

// Ensure one device can only have one vote per confession
voteSchema.index({ confessionId: 1, deviceId: 1 }, { unique: true });

const Vote = mongoose.model('Vote', voteSchema);
export default Vote;
