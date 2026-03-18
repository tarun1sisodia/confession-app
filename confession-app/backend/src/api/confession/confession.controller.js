import * as confessionService from './confession.service.js';
import catchAsync from '../../utils/catchAsync.js';

export const getConfessions = catchAsync(async (req, res) => {
  const confessions = await confessionService.getAllConfessions(req.query.type);
  res.status(200).json({ status: 'success', data: confessions });
});

export const getTrending = catchAsync(async (req, res) => {
  const confessions = await confessionService.getTrendingConfessions();
  res.status(200).json({ status: 'success', data: confessions });
});

export const addConfession = catchAsync(async (req, res) => {
  const confession = await confessionService.createConfession(req.body);
  res.status(201).json({ status: 'success', message: 'Confession added', data: confession });
});

export const likeConfession = catchAsync(async (req, res) => {
  await confessionService.likeConfession(req.params.id);
  res.status(200).json({ status: 'success', message: 'Liked successfully' });
});

export const reactConfession = catchAsync(async (req, res) => {
  const type = await confessionService.reactToConfession(req.params.id, req.body.type);
  res.status(200).json({ status: 'success', message: `Reacted with ${type}` });
});

export const reportConfession = catchAsync(async (req, res) => {
  await confessionService.reportConfession(req.params.id);
  res.status(200).json({ status: 'success', message: 'Reported successfully' });
});

export const addComment = catchAsync(async (req, res) => {
  const confession = await confessionService.addComment(req.params.id, req.body.text);
  res.status(201).json({ status: 'success', message: 'Comment added', data: confession });
});

export const voteComment = catchAsync(async (req, res) => {
  const { commentId } = req.params;
  const { isLike } = req.body; // boolean
  const confession = await confessionService.voteComment(req.params.id, commentId, isLike);
  res.status(200).json({ status: 'success', message: 'Voted successfully', data: confession });
});
