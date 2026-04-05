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
  const deviceId = req.headers['x-device-id'];
  const confession = await confessionService.createConfession(req.body, deviceId);
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

  const filePath = req.file.path;

  try {
    const imageUrl = await uploadToCloudinary(filePath);

    // Cleanup local file after successful upload
    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
    }

    res.status(200).json({ status: 'success', data: { imageUrl } });
  } catch (error) {
    // Cleanup local file on error
    if (fs.existsSync(filePath)) {
      try {
        fs.unlinkSync(filePath);
      } catch (cleanupError) {
        console.error('Failed to cleanup upload file:', cleanupError);
      }
    }
    throw error;
  }
});

export const reportConfession = catchAsync(async (req, res) => {
  const deviceId = req.body?.deviceId || req.headers['x-device-id'];
  const { reason, details } = req.body;
  const confession = await confessionService.reportConfession(req.params.id, deviceId, reason, details);
  res.status(200).json({ status: 'success', message: 'Reported successfully', data: confession });
});

export const addComment = catchAsync(async (req, res) => {
  const confession = await confessionService.addComment(req.params.id, req.body.text);
  res.status(201).json({ status: 'success', message: 'Comment added', data: confession });
});

export const getComments = catchAsync(async (req, res) => {
  const { page, limit } = req.query;
  const comments = await confessionService.getConfessionComments(req.params.id, page, limit);
  res.status(200).json({ status: 'success', data: comments });
});

export const voteComment = catchAsync(async (req, res) => {
  const { commentId } = req.params;
  const { isLike, deviceId } = req.body;
  const devId = deviceId || req.headers['x-device-id'];
  const confession = await confessionService.voteComment(req.params.id, commentId, isLike, devId);
  res.status(200).json({ status: 'success', message: 'Voted successfully', data: confession });
});

export const reactComment = catchAsync(async (req, res) => {
  const { commentId } = req.params;
  const { reactionValue, deviceId } = req.body;
  const devId = deviceId || req.headers['x-device-id'];
  const confession = await confessionService.reactComment(req.params.id, commentId, reactionValue, devId);
  res.status(200).json({ status: 'success', message: 'Reaction added', data: confession });
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

export const getMyConfessions = catchAsync(async (req, res) => {
  const deviceId = req.headers['x-device-id'];
  const { page, limit } = req.query;
  const confessions = await confessionService.getMyConfessions(deviceId, page, limit);
  res.status(200).json({ status: 'success', data: confessions });
});

export const updateConfession = catchAsync(async (req, res) => {
  const deviceId = req.headers['x-device-id'];
  const confession = await confessionService.updateConfession(req.params.id, deviceId, req.body);
  res.status(200).json({ status: 'success', message: 'Updated successfully', data: confession });
});

export const deleteConfession = catchAsync(async (req, res) => {
  const deviceId = req.headers['x-device-id'];
  await confessionService.deleteConfession(req.params.id, deviceId);
  res.status(200).json({ status: 'success', message: 'Deleted successfully' });
});

export const adminUpdateStatus = catchAsync(async (req, res) => {
  const { status } = req.body;
  const confession = await confessionService.adminUpdateStatus(req.params.id, status);
  res.status(200).json({ status: 'success', message: 'Status updated', data: confession });
});
