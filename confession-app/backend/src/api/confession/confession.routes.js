import express from 'express';
import * as confessionController from './confession.controller.js';

const router = express.Router();

router.get('/', confessionController.getConfessions);
router.get('/trending', confessionController.getTrending);
router.get('/search', confessionController.searchConfessions);
router.post('/activity', confessionController.getActivity);

router.post('/add', confessionController.addConfession);
router.post('/like/:id', confessionController.likeConfession);
router.post('/dislike/:id', confessionController.dislikeConfession);
router.post('/react/:id', confessionController.reactConfession);
router.post('/report/:id', confessionController.reportConfession);

// Comment routes
router.post('/:id/comments', confessionController.addComment);
router.post('/:id/comments/:commentId/vote', confessionController.voteComment);

export default router;
