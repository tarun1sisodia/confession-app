const express = require('express');
const router = express.Router();
const confessionController = require('./confession.controller');

router.get('/', confessionController.getConfessions);
router.get('/trending', confessionController.getTrending);
router.post('/add', confessionController.addConfession);
router.post('/like/:id', confessionController.likeConfession);
router.post('/react/:id', confessionController.reactConfession);
router.post('/report/:id', confessionController.reportConfession);

// Comment routes
router.post('/:id/comments', confessionController.addComment);
router.post('/:id/comments/:commentId/vote', confessionController.voteComment);

module.exports = router;
