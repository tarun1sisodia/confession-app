import express from 'express';
import * as confessionController from './confession.controller.js';
import { rateLimiter } from '../../middlewares/rateLimiter.middleware.js';

const router = express.Router();

router.get('/', confessionController.getConfessions);
router.get('/trending', confessionController.getTrending);
router.get('/search', confessionController.searchConfessions);
router.post('/activity', confessionController.getActivity);

router.post('/add', rateLimiter({ max: 3, message: 'Take a breath! You can only post 3 times per minute.' }), confessionController.addConfession);
router.post('/like/:id', rateLimiter({ max: 20 }), confessionController.likeConfession);
router.post('/dislike/:id', rateLimiter({ max: 20 }), confessionController.dislikeConfession);
router.post('/react/:id', rateLimiter({ max: 15 }), confessionController.reactConfession);
router.post('/report/:id', rateLimiter({ max: 5 }), confessionController.reportConfession);

// Comment routes
router.post('/:id/comments', confessionController.addComment);
router.post('/:id/comments/:commentId/vote', confessionController.voteComment);

export default router;
