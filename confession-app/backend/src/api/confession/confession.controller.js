import * as confessionService from './confession.service.js';
import catchAsync from '../../utils/catchAsync.js';
import { uploadToCloudinary } from '../../utils/cloudinary.utils.js';
import fs from 'fs';
import AppError from '../../utils/AppError.js';

export const getConfessions = catchAsync(async (req, res) => {
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 10;
  const deviceId = req.headers['x-device-id'];
  const confessions = await confessionService.getAllConfessions(req.query.type, page, limit, deviceId);
  res.status(200).json({ status: 'success', data: confessions });
});

export const getTrending = catchAsync(async (req, res) => {
  const deviceId = req.headers['x-device-id'];
  const confessions = await confessionService.getTrendingConfessions(deviceId);
  res.status(200).json({ status: 'success', data: confessions });
});

export const addConfession = catchAsync(async (req, res) => {
  const confession = await confessionService.createConfession(req.body);
  res.status(201).json({ status: 'success', message: 'Confession added', data: confession });
});

const buildVoteHandler = (typeResolver) => catchAsync(async (req, res) => {
  const { deviceId, type, reactionValue } = req.body;
  const devId = deviceId || req.headers['x-device-id'];
  const resolved = typeResolver({ type, reactionValue });
  const confession = await confessionService.votePost(
    req.params.id,
    devId,
    resolved.type,
    resolved.reactionValue
  );
  res.status(200).json({ status: 'success', message: 'Vote processed', data: confession });
});

export const votePost = buildVoteHandler(({ type, reactionValue }) => ({ type, reactionValue }));
export const likeConfession = buildVoteHandler(() => ({ type: 'like', reactionValue: null }));
export const dislikeConfession = buildVoteHandler(() => ({ type: 'dislike', reactionValue: null }));
export const reactConfession = buildVoteHandler(({ reactionValue, type }) => ({
  type: 'reaction',
  reactionValue: reactionValue || type
}));

export const uploadImage = catchAsync(async (req, res) => {
  if (!req.file?.path) {
    throw new AppError('No file uploaded', 400);
  }

  try {
    const imageUrl = await uploadToCloudinary(req.file.path);
    // Cleanup local file after upload
    if (fs.existsSync(req.file.path)) {
      fs.unlinkSync(req.file.path);
    }
    res.status(200).json({ status: 'success', data: { imageUrl } });
  } catch (error) {
    if (fs.existsSync(req.file.path)) fs.unlinkSync(req.file.path);
    throw error;
  }
});

export const reportConfession = catchAsync(async (req, res) => {
  const deviceId = req.body?.deviceId || req.headers['x-device-id'];
  const confession = await confessionService.reportConfession(req.params.id, deviceId);
  res.status(200).json({ status: 'success', message: 'Reported successfully', data: confession });
});

export const addComment = catchAsync(async (req, res) => {
  const confession = await confessionService.addComment(req.params.id, req.body.text);
  res.status(201).json({ status: 'success', message: 'Comment added', data: confession });
});

export const voteComment = catchAsync(async (req, res) => {
  const { commentId } = req.params;
  const { isLike, deviceId } = req.body;
  const devId = deviceId || req.headers['x-device-id'];
  const confession = await confessionService.voteComment(req.params.id, commentId, isLike, devId);
  res.status(200).json({ status: 'success', message: 'Voted successfully', data: confession });
});

export const searchConfessions = catchAsync(async (req, res) => {
  const deviceId = req.headers['x-device-id'];
  const confessions = await confessionService.searchConfessions(req.query.q, deviceId);
  res.status(200).json({ status: 'success', data: confessions });
});

export const getActivity = catchAsync(async (req, res) => {
  const { postIds } = req.body;
  const deviceId = req.headers['x-device-id'];
  const activity = await confessionService.getActivity(postIds, deviceId);
  res.status(200).json({ status: 'success', data: activity });
});

export const getStats = catchAsync(async (req, res) => {
  const userCount = await confessionService.getUniqueUserCount();
  res.status(200).json({ status: 'success', data: { userCount } });
});
