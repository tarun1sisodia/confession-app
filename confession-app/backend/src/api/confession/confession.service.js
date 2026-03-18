import Confession from './confession.model.js';
import { containsBadWords } from './confession.utils.js';
import AppError from '../../utils/AppError.js';

const getTimeAgo = (date) => {
  const seconds = Math.floor((new Date() - date) / 1000);
  if (seconds < 60) return 'Just now';
  if (seconds < 3600) return `${Math.floor(seconds / 60)} mins ago`;
  if (seconds < 86400) return `${Math.floor(seconds / 3600)} hours ago`;
  return `${Math.floor(seconds / 86400)} days ago`;
};

const formatConfession = (doc) => {
  const obj = doc.toObject ? doc.toObject() : doc;
  obj.timeAgo = getTimeAgo(obj.createdAt);
  
  if (obj.comments) {
    obj.comments.forEach(c => {
      c.timeAgo = getTimeAgo(c.createdAt || new Date());
    });
    obj.comments.sort((a, b) => b.likes - a.likes);
  }
  return obj;
};

export const getAllConfessions = async (typeFilter) => {
  const query = typeFilter ? { type: typeFilter } : {};
  const confessions = await Confession.find(query).sort({ createdAt: -1 }).limit(100);
  return confessions.map(formatConfession);
};

export const getTrendingConfessions = async () => {
  const confessions = await Confession.find().sort({ likes: -1, createdAt: -1 }).limit(20);
  return confessions.map(formatConfession);
};

export const createConfession = async (data) => {
  if (!data.text || data.text.trim() === '') {
    throw new AppError('Confession text cannot be empty', 400);
  }
  if (data.text.length > 1000) {
    throw new AppError('Confession is too long (max 1000 chars)', 400);
  }
  if (containsBadWords(data.text)) {
    throw new AppError('Inappropriate content detected. Not allowed.', 400);
  }
  
  const payload = { 
    text: data.text,
    type: data.type || 'deep',
    blurred: !!data.blurred
  };

  const confession = await Confession.create(payload);
  return formatConfession(confession);
};

export const likeConfession = async (id) => {
  const confession = await Confession.findByIdAndUpdate(
    id,
    { $inc: { likes: 1 } },
    { new: true }
  );
  if (!confession) throw new AppError('Confession not found', 404);
  return confession;
};

export const reactToConfession = async (id, type) => {
  if (!['funny', 'sad', 'relatable'].includes(type)) {
    throw new AppError('Invalid reaction type', 400);
  }
  const updateObj = {};
  updateObj[`reactions.${type}`] = 1;

  const confession = await Confession.findByIdAndUpdate(
    id,
    { $inc: updateObj },
    { new: true }
  );
  if (!confession) throw new AppError('Confession not found', 404);
  return type;
};

export const reportConfession = async (id) => {
  const confession = await Confession.findByIdAndUpdate(
    id,
    { $inc: { reports: 1 }, $set: { isReported: true } },
    { new: true }
  );
  if (!confession) throw new AppError('Confession not found', 404);
  return confession;
};

export const addComment = async (confessionId, text) => {
  if (!text || text.trim() === '') {
    throw new AppError('Comment text cannot be empty', 400);
  }
  if (containsBadWords(text)) {
    throw new AppError('Inappropriate content detected in comment', 400);
  }

  const confession = await Confession.findById(confessionId);
  if (!confession) throw new AppError('Confession not found', 404);

  confession.comments.unshift({ text });
  await confession.save();
  return formatConfession(confession);
};

export const voteComment = async (confessionId, commentId, isLike) => {
  const confession = await Confession.findById(confessionId);
  if (!confession) throw new AppError('Confession not found', 404);

  const comment = confession.comments.id(commentId);
  if (!comment) throw new AppError('Comment not found', 404);

  if (isLike) {
    comment.likes += 1;
  } else {
    comment.dislikes += 1;
  }
  
  await confession.save();
  return formatConfession(confession);
};
