import mongoose from 'mongoose';
import Confession from './confession.model.js';
import Report from './report.model.js';
import Vote from './vote.model.js';
import UserTracker from './userTracker.model.js';
import { containsBadWords } from './confession.utils.js';
import AppError from '../../utils/AppError.js';

const ALLOWED_TYPES = new Set(['deep', 'secret', 'funny', 'general']);
const ALLOWED_REACTIONS = new Set(['funny', 'sad', 'relatable']);
const VISIBLE_REPORT_THRESHOLD = 5;

const getTimeAgo = (date) => {
  const seconds = Math.floor((new Date() - new Date(date)) / 1000);
  if (seconds < 60) return 'Just now';
  if (seconds < 3600) return `${Math.floor(seconds / 60)} mins ago`;
  if (seconds < 86400) return `${Math.floor(seconds / 3600)} hours ago`;
  return `${Math.floor(seconds / 86400)} days ago`;
};

const getPublicFilter = (extra = {}) => ({
  reports: { $lt: VISIBLE_REPORT_THRESHOLD },
  ...extra
});

const normalizeDeviceId = (deviceId) => {
  if (!deviceId || typeof deviceId !== 'string') {
    throw new AppError('Device ID is required', 400);
  }

  return deviceId.trim().slice(0, 120);
};

const normalizeText = (value, fieldName, maxLength) => {
  const text = value?.trim();

  if (!text) {
    throw new AppError(`${fieldName} cannot be empty`, 400);
  }

  if (text.length > maxLength) {
    throw new AppError(`${fieldName} is too long (max ${maxLength} chars)`, 400);
  }

  if (containsBadWords(text)) {
    throw new AppError(`Inappropriate content detected in ${fieldName.toLowerCase()}`, 400);
  }

  return text;
};

const normalizeImageUrl = (imageUrl) => {
  if (!imageUrl) {
    return '';
  }

  const trimmed = imageUrl.trim();
  if (!trimmed) {
    return '';
  }

  if (trimmed.length > 2000) {
    throw new AppError('Image URL is too long', 400);
  }

  let parsed;
  try {
    parsed = new URL(trimmed);
  } catch {
    throw new AppError('Image URL must be a valid http or https address', 400);
  }

  if (!['http:', 'https:'].includes(parsed.protocol) || !parsed.hostname) {
    throw new AppError('Image URL must be a valid http or https address', 400);
  }

  return parsed.toString();
};

const getReactionTotal = (reactions = {}) => {
  const values = reactions instanceof Map ? [...reactions.values()] : Object.values(reactions);
  return values.reduce((sum, value) => sum + (Number(value) || 0), 0);
};

const getEngagementScore = (post) => {
  const likes = post.likes || 0;
  const dislikes = post.dislikes || 0;
  const comments = post.comments?.length || 0;
  const reactions = getReactionTotal(post.reactions || {});
  const ageHours = Math.max(
    1,
    (Date.now() - new Date(post.createdAt || Date.now()).getTime()) / (1000 * 60 * 60)
  );
  const freshnessBoost = ageHours < 24 ? 24 - ageHours : 0;

  return Number((likes * 2 + comments * 3 + reactions * 1.5 + freshnessBoost - dislikes * 1.75).toFixed(2));
};

const getEngagementBand = (score) => {
  if (score >= 28) return 'hot';
  if (score >= 16) return 'rising';
  if (score >= 8) return 'steady';
  return 'fresh';
};

const formatConfession = (doc, userVoteMap = new Map()) => {
  const obj = doc.toObject ? doc.toObject() : { ...doc };
  obj.timeAgo = getTimeAgo(obj.createdAt);
  obj.reactions = obj.reactions instanceof Map ? Object.fromEntries(obj.reactions) : (obj.reactions || {});

  if (obj.comments) {
    obj.comments = [...obj.comments].map((comment) => ({
      ...comment,
      timeAgo: getTimeAgo(comment.createdAt || new Date())
    }));
    obj.comments.sort((a, b) => (b.likes - b.dislikes) - (a.likes - a.dislikes));
  }

  obj.engagementScore = getEngagementScore(obj);
  obj.engagementBand = getEngagementBand(obj.engagementScore);

  const vote = userVoteMap.get(String(obj._id));
  if (vote) {
    obj.userVote = vote.voteType;
    obj.userReaction = vote.reactionValue || null;
  }

  return obj;
};

const buildVoteMap = async (confessions, deviceId) => {
  if (!deviceId || !confessions.length) {
    return new Map();
  }

  const confessionIds = confessions.map((item) => item._id).filter(Boolean);
  const votes = await Vote.find({
    confessionId: { $in: confessionIds },
    deviceId,
    commentId: { $exists: false }
  }).lean();

  return new Map(votes.map((vote) => [String(vote.confessionId), vote]));
};

const validateType = (type) => {
  if (!ALLOWED_TYPES.has(type)) {
    throw new AppError('Invalid confession type', 400);
  }
};

const applyVoteMutation = (update, type, reactionValue, delta) => {
  if (type === 'like') {
    update.$inc.likes = (update.$inc.likes || 0) + delta;
    return;
  }

  if (type === 'dislike') {
    update.$inc.dislikes = (update.$inc.dislikes || 0) + delta;
    return;
  }

  if (type === 'reaction') {
    if (!ALLOWED_REACTIONS.has(reactionValue)) {
      throw new AppError('Invalid reaction type', 400);
    }
    update.$inc[`reactions.${reactionValue}`] = (update.$inc[`reactions.${reactionValue}`] || 0) + delta;
    return;
  }

  throw new AppError('Invalid vote type', 400);
};

export const getAllConfessions = async (typeFilter, page = 1, limit = 10, deviceId = null) => {
  const safePage = Math.max(1, Number.parseInt(page, 10) || 1);
  const safeLimit = Math.min(20, Math.max(1, Number.parseInt(limit, 10) || 10));
  const query = getPublicFilter(typeFilter ? { type: typeFilter } : {});
  const skip = (safePage - 1) * safeLimit;
  const confessions = await Confession.find(query)
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(safeLimit);
  const voteMap = await buildVoteMap(confessions, deviceId);
  return confessions.map((confession) => formatConfession(confession, voteMap));
};

export const getTrendingConfessions = async (deviceId = null) => {
  const confessions = await Confession.find(getPublicFilter())
    .sort({ createdAt: -1 })
    .limit(150);

  const ranked = confessions
    .map((confession) => formatConfession(confession))
    .sort((a, b) => b.engagementScore - a.engagementScore)
    .slice(0, 20);

  const voteMap = await buildVoteMap(ranked, deviceId);
  return ranked.map((confession) => formatConfession(confession, voteMap));
};

export const createConfession = async (data) => {
  const text = normalizeText(data.text, 'Confession text', 1000);
  const type = data.type || 'deep';
  validateType(type);

  const payload = {
    imageUrl: normalizeImageUrl(data.imageUrl),
    text,
    type,
    blurred: !!data.blurred
  };

  const confession = await Confession.create(payload);
  return formatConfession(confession);
};

export const votePost = async (id, deviceId, type, reactionValue = null) => {
  const normalizedDeviceId = normalizeDeviceId(deviceId);
  const confession = await Confession.findById(id);
  if (!confession) throw new AppError('Confession not found', 404);

  const existingVote = await Vote.findOne({ confessionId: id, deviceId: normalizedDeviceId, commentId: { $exists: false } });
  const update = { $inc: {} };

  let responseVote = null;

  if (existingVote) {
    applyVoteMutation(update, existingVote.voteType, existingVote.reactionValue, -1);

    const isSameSelection =
      existingVote.voteType === type && (existingVote.reactionValue || null) === (reactionValue || null);

    if (isSameSelection) {
      await Vote.deleteOne({ _id: existingVote._id });
    } else {
      applyVoteMutation(update, type, reactionValue, 1);
      existingVote.voteType = type;
      existingVote.reactionValue = type === 'reaction' ? reactionValue : undefined;
      await existingVote.save();
      responseVote = { voteType: type, reactionValue };
    }
  } else {
    applyVoteMutation(update, type, reactionValue, 1);
    await Vote.create({
      confessionId: id,
      deviceId: normalizedDeviceId,
      voteType: type,
      reactionValue: type === 'reaction' ? reactionValue : undefined
    });
    responseVote = { voteType: type, reactionValue };
  }

  const updated = await Confession.findByIdAndUpdate(id, update, { new: true });
  const voteMap = responseVote ? new Map([[String(updated._id), responseVote]]) : new Map();
  return formatConfession(updated, voteMap);
};

export const reportConfession = async (id, deviceId) => {
  const normalizedDeviceId = normalizeDeviceId(deviceId);
  const confession = await Confession.findById(id);
  if (!confession) throw new AppError('Confession not found', 404);

  const existingReport = await Report.findOne({ confessionId: id, deviceId: normalizedDeviceId });
  if (existingReport) {
    return formatConfession(confession);
  }

  await Report.create({ confessionId: id, deviceId: normalizedDeviceId });
  confession.reports = (confession.reports || 0) + 1;
  if (confession.reports >= VISIBLE_REPORT_THRESHOLD) {
    confession.isReported = true;
  }

  await confession.save();
  return formatConfession(confession);
};

export const addComment = async (confessionId, text) => {
  const normalizedText = normalizeText(text, 'Comment text', 500);

  const confession = await Confession.findById(confessionId);
  if (!confession) throw new AppError('Confession not found', 404);

  confession.comments.unshift({ text: normalizedText });
  await confession.save();
  return formatConfession(confession);
};

export const voteComment = async (confessionId, commentId, isLike, deviceId) => {
  const normalizedDeviceId = normalizeDeviceId(deviceId);
  const type = isLike ? 'like' : 'dislike';

  const confession = await Confession.findById(confessionId);
  if (!confession) throw new AppError('Confession not found', 404);

  const comment = confession.comments.id(commentId);
  if (!comment) throw new AppError('Comment not found', 404);

  const existingVote = await Vote.findOne({ confessionId, commentId, deviceId: normalizedDeviceId });

  if (existingVote) {
    if (existingVote.voteType === type) {
      await Vote.deleteOne({ _id: existingVote._id });
      if (isLike) comment.likes = Math.max(0, (comment.likes || 0) - 1);
      else comment.dislikes = Math.max(0, (comment.dislikes || 0) - 1);
    } else {
      existingVote.voteType = type;
      await existingVote.save();
      if (isLike) {
        comment.likes = (comment.likes || 0) + 1;
        comment.dislikes = Math.max(0, (comment.dislikes || 0) - 1);
      } else {
        comment.dislikes = (comment.dislikes || 0) + 1;
        comment.likes = Math.max(0, (comment.likes || 0) - 1);
      }
    }
  } else {
    await Vote.create({ confessionId, commentId, deviceId: normalizedDeviceId, voteType: type });
    if (isLike) comment.likes = (comment.likes || 0) + 1;
    else comment.dislikes = (comment.dislikes || 0) + 1;
  }

  await confession.save();
  return formatConfession(confession);
};

export const searchConfessions = async (query, deviceId = null) => {
  const normalizedQuery = query?.trim();
  if (!normalizedQuery || normalizedQuery.length < 2) return [];

  const safeQuery = normalizedQuery.slice(0, 80).replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  const confessions = await Confession.find({
    ...getPublicFilter(),
    text: { $regex: safeQuery, $options: 'i' }
  })
    .sort({ createdAt: -1 })
    .limit(50);
  const voteMap = await buildVoteMap(confessions, deviceId);
  return confessions.map((confession) => formatConfession(confession, voteMap));
};

export const getActivity = async (postIds, deviceId = null) => {
  if (!Array.isArray(postIds) || postIds.length === 0) return [];

  const normalizedIds = [...new Set(postIds)]
    .filter((value) => mongoose.Types.ObjectId.isValid(value))
    .slice(0, 30);

  if (!normalizedIds.length) {
    return [];
  }

  const confessions = await Confession.find({ _id: { $in: normalizedIds } })
    .sort({ updatedAt: -1 })
    .limit(30);
  const voteMap = await buildVoteMap(confessions, deviceId);
  return confessions.map((confession) => formatConfession(confession, voteMap));
};

export const getUniqueUserCount = async () => UserTracker.countDocuments();
