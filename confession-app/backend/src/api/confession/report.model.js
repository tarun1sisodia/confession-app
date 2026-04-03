import mongoose from 'mongoose';

const reportSchema = new mongoose.Schema(
  {
    confessionId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Confession',
      required: true
    },
    deviceIdHash: {
      type: String,
      required: true,
      trim: true,
      maxlength: 120,
      index: true
    },
    reason: {
      type: String,
      enum: ['SPAM', 'HARASSMENT', 'OFFENSIVE', 'SELF_HARM', 'OTHER'],
      default: 'OTHER'
    },
    details: {
      type: String,
      trim: true,
      maxlength: 200
    }
  },
  { timestamps: true }
);

reportSchema.index({ confessionId: 1, deviceIdHash: 1 }, { unique: true });

// TTL index: Remove old reports after 90 days
reportSchema.index({ createdAt: 1 }, { expireAfterSeconds: 7776000 });

const Report = mongoose.model('Report', reportSchema);
export default Report;
