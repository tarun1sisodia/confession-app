import express from 'express';
import * as confessionController from './confession.controller.js';
import { rateLimiter } from '../../middlewares/rateLimiter.middleware.js';
import upload from '../../middlewares/upload.middleware.js';
import AppError from '../../utils/AppError.js';

import { validate } from '../../middlewares/validate.middleware.js';
import * as schemas from './confession.validation.js';

const router = express.Router();

router.get('/', confessionController.getConfessions);
router.get('/trending', confessionController.getTrending);
router.get('/search', rateLimiter({ max: 40, keySuffix: 'search' }), confessionController.searchConfessions);
router.get('/stats', confessionController.getStats);
router.get('/my-posts', confessionController.getMyConfessions);
router.post('/activity', confessionController.getActivity);

router.post('/upload', rateLimiter({ max: 10, keySuffix: 'upload' }), upload.single('image'), confessionController.uploadImage);
router.post('/add', rateLimiter({ max: 3, message: 'Take a breath! You can only post 3 times per minute.', keySuffix: 'create-post' }), validate(schemas.createConfessionSchema), confessionController.addConfession);
router.patch('/:id', rateLimiter({ max: 10, keySuffix: 'edit-post' }), validate(schemas.updateConfessionSchema), confessionController.updateConfession);
router.delete('/:id', rateLimiter({ max: 5, keySuffix: 'delete-post' }), confessionController.deleteConfession);
router.post('/vote/:id', rateLimiter({ max: 25, keySuffix: 'vote-post' }), validate(schemas.votePostSchema), confessionController.votePost);
router.post('/like/:id', rateLimiter({ max: 25, keySuffix: 'vote-like' }), confessionController.likeConfession);
router.post('/dislike/:id', rateLimiter({ max: 25, keySuffix: 'vote-dislike' }), confessionController.dislikeConfession);
router.post('/react/:id', rateLimiter({ max: 25, keySuffix: 'vote-react' }), confessionController.reactConfession);
router.post('/report/:id', rateLimiter({ max: 5, keySuffix: 'report-post' }), validate(schemas.reportConfessionSchema), confessionController.reportConfession);

// Comment routes
router.get('/:id/comments', confessionController.getComments);
router.post('/:id/comments', rateLimiter({ max: 20, keySuffix: 'comment-create' }), validate(schemas.addCommentSchema), confessionController.addComment);
router.post('/:id/comments/:commentId/vote', rateLimiter({ max: 30, keySuffix: 'comment-vote' }), confessionController.voteComment);
router.post('/:id/comments/:commentId/react', rateLimiter({ max: 30, keySuffix: 'comment-react' }), confessionController.reactComment);

// Admin Moderation
const adminAuth = (req, res, next) => {
  const adminKey = req.headers['x-admin-key'];
  if (adminKey !== process.env.ADMIN_KEY) {
    throw new AppError('Unauthorized admin access', 401);
  }
  next();
};

router.post('/admin/moderate/:id', adminAuth, confessionController.adminUpdateStatus);

export default router;
