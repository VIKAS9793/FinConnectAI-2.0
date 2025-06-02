const express = require('express');
const router = express.Router();
const { checkJwt, checkRole } = require('../middleware/auth');
const reviewService = require('../services/reviewService');

// Define roles for role-based access control
const ROLES = {
  ADMIN: 'admin',
  REVIEWER: 'reviewer',
  ANALYST: 'analyst'
};

/**
 * @swagger
 * /api/reviews:
 *   get:
 *     summary: Get all reviews
 *     tags: [Reviews]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *           enum: [pending, approved, rejected]
 *         description: Filter reviews by status
 *     responses:
 *       200:
 *         description: List of reviews
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Review'
 */
router.get('/', checkJwt, checkRole([ROLES.ADMIN, ROLES.REVIEWER, ROLES.ANALYST]), async (req, res) => {
  try {
    const { status } = req.query;
    const reviews = await reviewService.getReviews(status);
    res.json(reviews);
  } catch (error) {
    console.error('Failed to fetch reviews:', error);
    res.status(500).json({ error: 'Failed to fetch reviews' });
  }
});

/**
 * @swagger
 * /api/reviews/{reviewId}/decision:
 *   post:
 *     summary: Submit a review decision
 *     tags: [Reviews]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: reviewId
 *         required: true
 *         schema:
 *           type: string
 *         description: The review ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - status
 *               - reviewerId
 *             properties:
 *               status:
 *                 type: string
 *                 enum: [approved, rejected]
 *               reviewerId:
 *                 type: string
 *               comments:
 *                 type: string
 *     responses:
 *       200:
 *         description: Review decision submitted successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Review'
 */
router.post('/:reviewId/decision', checkJwt, checkRole([ROLES.ADMIN, ROLES.REVIEWER]), async (req, res) => {
  try {
    const { reviewId } = req.params;
    const { status, reviewerId, comments } = req.body;
    
    if (!['approved', 'rejected'].includes(status)) {
      return res.status(400).json({ error: 'Invalid status. Must be "approved" or "rejected"' });
    }
    
    const decision = { status, reviewerId, comments };
    const updatedReview = await reviewService.processReview(reviewId, decision);
    
    res.json(updatedReview);
  } catch (error) {
    console.error('Failed to process review decision:', error);
    res.status(500).json({ error: 'Failed to process review decision' });
  }
});

/**
 * @swagger
 * /api/reviews/{reviewId}:
 *   get:
 *     summary: Get review by ID
 *     tags: [Reviews]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: reviewId
 *         required: true
 *         schema:
 *           type: string
 *         description: The review ID
 *     responses:
 *       200:
 *         description: The review details
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Review'
 */
router.get('/:reviewId', checkJwt, checkRole([ROLES.ADMIN, ROLES.REVIEWER, ROLES.ANALYST]), async (req, res) => {
  try {
    const { reviewId } = req.params;
    const review = await reviewService.getReviewById(reviewId);
    
    if (!review) {
      return res.status(404).json({ error: 'Review not found' });
    }
    
    res.json(review);
  } catch (error) {
    console.error('Failed to fetch review:', error);
    res.status(500).json({ error: 'Failed to fetch review' });
  }
});

module.exports = router;
