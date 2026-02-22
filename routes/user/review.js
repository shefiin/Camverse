const express = require('express');
const router = express.Router();
const { upsertReview, deleteReview } = require('../../controllers/user/reviewController');

router.post('/:productId', upsertReview);
router.post('/:productId/delete', deleteReview);

module.exports = router;
