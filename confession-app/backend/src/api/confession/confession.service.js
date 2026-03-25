import Confession from './confession.model.js';
import Vote from './vote.model.js';
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
    obj.comments.sort((a, b) => (b.likes - b.dislikes) - (a.likes - a.dislikes));
  }
  return obj;
};

export const getAllConfessions = async (typeFilter, page = 1, limit = 10) => {
  const safePage = Math.max(1, Number.parseInt(page, 10) || 1);
  const safeLimit = Math.min(20, Math.max(1, Number.parseInt(limit, 10) || 10));
  const query = typeFilter ? { type: typeFilter } : {};
  const skip = (safePage - 1) * safeLimit;
  const confessions = await Confession.find(query)
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(safeLimit);
  return confessions.map(formatConfession);
};

export const getTrendingConfessions = async () => {
  // Score = Likes + Reactions + (Comments * 3) - Dislikes
  const confessions = await Confession.aggregate([
    {
      $addFields: {
        score: {
          $add: [
            { $ifNull: ["$likes", 0] },
            { $ifNull: ["$reactions.funny", 0] },
            { $ifNull: ["$reactions.sad", 0] },
            { $ifNull: ["$reactions.relatable", 0] },
            { $multiply: [{ $size: { $ifNull: ["$comments", []] } }, 3] },
            { $multiply: [{ $ifNull: ["$dislikes", 0] }, -1] }
          ]
        }
      }
    },
    { $sort: { score: -1, createdAt: -1 } },
    { $limit: 20 }
  ]);
  
  // Convert aggregation plain objects to expected format
  return confessions.map(doc => formatConfession(doc));
};

export const createConfession = async (data) => {
  const text = data.text?.trim();

  if (!text) {
    throw new AppError('Confession text cannot be empty', 400);
  }
  if (text.length > 1000) {
    throw new AppError('Confession is too long (max 1000 chars)', 400);
  }
  if (containsBadWords(text)) {
    throw new AppError('Inappropriate content detected. Not allowed.', 400);
  }
  if (data.imageUrl) {
    try {
      const parsed = new URL(data.imageUrl);
      if (!['http:', 'https:'].includes(parsed.protocol)) {
        throw new Error('Invalid protocol');
      }
    } catch {
      throw new AppError('Image URL must be a valid http or https address', 400);
    }
  }
  
  const payload = { 
    imageUrl: data.imageUrl?.trim() || '',
    text,
    type: data.type || 'deep',
    blurred: !!data.blurred
  };

  const confession = await Confession.create(payload);
  return formatConfession(confession);
};

export const likeConfession = async (id, deviceId) => {
  if (!deviceId) throw new AppError('Device ID is required', 400);

  const existingVote = await Vote.findOne({ confessionId: id, deviceId });

  if (existingVote) {
    if (existingVote.voteType === 'like') {
      // Toggle off: Remove vote
      await Vote.deleteOne({ _id: existingVote._id });
      return await Confession.findByIdAndUpdate(id, { $inc: { likes: -1 } }, { new: true });
    } else {
      // Change from dislike to like
      existingVote.voteType = 'like';
      await existingVote.save();
      return await Confession.findByIdAndUpdate(id, { $inc: { likes: 1, dislikes: -1 } }, { new: true });
    }
  }

  // New vote
  await Vote.create({ confessionId: id, deviceId, voteType: 'like' });
  return await Confession.findByIdAndUpdate(id, { $inc: { likes: 1 } }, { new: true });
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
  const normalizedText = text?.trim();

  if (!normalizedText) {
    throw new AppError('Comment text cannot be empty', 400);
  }
  if (normalizedText.length > 500) {
    throw new AppError('Comment is too long (max 500 chars)', 400);
  }
  if (containsBadWords(normalizedText)) {
    throw new AppError('Inappropriate content detected in comment', 400);
  }

  const confession = await Confession.findById(confessionId);
  if (!confession) throw new AppError('Confession not found', 404);

  confession.comments.unshift({ text: normalizedText });
  await confession.save();
  return formatConfession(confession);
};

export const voteComment = async (confessionId, commentId, isLike, deviceId) => {
  if (!deviceId) throw new AppError('Device ID is required', 400);
  const type = isLike ? 'like' : 'dislike';

  const confession = await Confession.findById(confessionId);
  if (!confession) throw new AppError('Confession not found', 404);

  const comment = confession.comments.id(commentId);
  if (!comment) throw new AppError('Comment not found', 404);

  const existingVote = await Vote.findOne({ confessionId, commentId, deviceId });

  if (existingVote) {
    if (existingVote.voteType === type) {
      // Toggle off
      await Vote.deleteOne({ _id: existingVote._id });
      if (isLike) comment.likes -= 1; else comment.dislikes -= 1;
    } else {
      // Change vote
      existingVote.voteType = type;
      await existingVote.save();
      if (isLike) { comment.likes += 1; comment.dislikes -= 1; }
      else { comment.likes -= 1; comment.dislikes += 1; }
    }
  } else {
    // New vote
    await Vote.create({ confessionId, commentId, deviceId, voteType: type });
    if (isLike) comment.likes += 1; else comment.dislikes += 1;
  }
  
  await confession.save();
  return formatConfession(confession);
};

export const searchConfessions = async (query) => {
  const normalizedQuery = query?.trim();
  if (!normalizedQuery || normalizedQuery.length < 2) return [];
  const safeQuery = normalizedQuery.slice(0, 80).replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  const confessions = await Confession.find({ text: { $regex: safeQuery, $options: 'i' } })
    .sort({ createdAt: -1 })
    .limit(50);
  return confessions.map(formatConfession);
};

export const dislikeConfession = async (id, deviceId) => {
  if (!deviceId) throw new AppError('Device ID is required', 400);

  const existingVote = await Vote.findOne({ confessionId: id, deviceId });

  if (existingVote) {
    if (existingVote.voteType === 'dislike') {
      // Toggle off: Remove vote
      await Vote.deleteOne({ _id: existingVote._id });
      return await Confession.findByIdAndUpdate(id, { $inc: { dislikes: -1 } }, { new: true });
    } else {
      // Change from like to dislike
      existingVote.voteType = 'dislike';
      await existingVote.save();
      return await Confession.findByIdAndUpdate(id, { $inc: { likes: -1, dislikes: 1 } }, { new: true });
    }
  }

  // New vote
  await Vote.create({ confessionId: id, deviceId, voteType: 'dislike' });
  return await Confession.findByIdAndUpdate(id, { $inc: { dislikes: 1 } }, { new: true });
};

export const getActivity = async (postIds) => {
  if (!postIds || !Array.isArray(postIds) || postIds.length === 0) return [];
  
  // Find posts the user authored, sorting by when they were last interacted with
  const confessions = await Confession.find({ _id: { $in: postIds } }).sort({ updatedAt: -1 }).limit(30);
  return confessions.map(formatConfession);
};
