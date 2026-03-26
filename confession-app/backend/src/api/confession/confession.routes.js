import express from 'express';
import * as confessionController from './confession.controller.js';
import { rateLimiter } from '../../middlewares/rateLimiter.middleware.js';
import upload from '../../middlewares/upload.middleware.js';

const router = express.Router();

router.get('/', confessionController.getConfessions);
router.get('/trending', confessionController.getTrending);
router.get('/search', rateLimiter({ max: 40, keySuffix: 'search' }), confessionController.searchConfessions);
router.get('/stats', confessionController.getStats);
router.post('/activity', confessionController.getActivity);

router.post('/upload', rateLimiter({ max: 10, keySuffix: 'upload' }), upload.single('image'), confessionController.uploadImage);
router.post('/add', rateLimiter({ max: 3, message: 'Take a breath! You can only post 3 times per minute.', keySuffix: 'create-post' }), confessionController.addConfession);
router.post('/vote/:id', rateLimiter({ max: 25, keySuffix: 'vote-post' }), confessionController.votePost);
router.post('/like/:id', rateLimiter({ max: 25, keySuffix: 'vote-like' }), confessionController.likeConfession);
router.post('/dislike/:id', rateLimiter({ max: 25, keySuffix: 'vote-dislike' }), confessionController.dislikeConfession);
router.post('/react/:id', rateLimiter({ max: 25, keySuffix: 'vote-react' }), confessionController.reactConfession);
router.post('/report/:id', rateLimiter({ max: 5, keySuffix: 'report-post' }), confessionController.reportConfession);

// Comment routes
router.post('/:id/comments', rateLimiter({ max: 20, keySuffix: 'comment-create' }), confessionController.addComment);
router.post('/:id/comments/:commentId/vote', rateLimiter({ max: 30, keySuffix: 'comment-vote' }), confessionController.voteComment);

export default router;
