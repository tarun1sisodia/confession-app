const mongoose = require('mongoose');

const commentSchema = new mongoose.Schema({
  text: { type: String, required: true, maxlength: 500 },
  likes: { type: Number, default: 0 },
  dislikes: { type: Number, default: 0 }
}, { timestamps: true });

const reactionSchema = new mongoose.Schema({
  funny: { type: Number, default: 0 },
  sad: { type: Number, default: 0 },
  relatable: { type: Number, default: 0 }
}, { _id: false });

const confessionSchema = new mongoose.Schema({
  text: {
    type: String,
    required: [true, 'Confession text is required'],
    trim: true,
    maxlength: [1000, 'Confession cannot be more than 1000 characters']
  },
  type: {
    type: String,
    enum: ['deep', 'secret', 'funny', 'general'],
    default: 'deep'
  },
  blurred: {
    type: Boolean,
    default: false
  },
  likes: {
    type: Number,
    default: 0
  },
  reactions: {
    type: reactionSchema,
    default: () => ({})
  },
  comments: [commentSchema],
  isReported: {
    type: Boolean,
    default: false
  },
  reports: {
    type: Number,
    default: 0
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('Confession', confessionSchema);
