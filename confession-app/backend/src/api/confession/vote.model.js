import mongoose from 'mongoose';

const voteSchema = new mongoose.Schema({
  confessionId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Confession',
    required: true
  },
  commentId: {
    type: mongoose.Schema.Types.ObjectId,
    required: false // Only set for comment votes
  },
  deviceId: {
    type: String,
    required: true
  },
  voteType: {
    type: String,
    enum: ['like', 'dislike', 'reaction'],
    required: true
  },
  reactionValue: {
    type: String,
    required: false // Only for voteType === 'reaction'
  }
}, { timestamps: true });

// Unique vote per device per (post or comment). 
// For posts (commentId null), only one of [like, dislike, reaction] allowed.
voteSchema.index({ confessionId: 1, commentId: 1, deviceId: 1 }, { unique: true });

const Vote = mongoose.model('Vote', voteSchema);
export default Vote;
