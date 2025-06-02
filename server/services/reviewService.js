const { v4: uuidv4 } = require('uuid');

class ReviewService {
  constructor() {
    this.reviewQueue = new Map(); // In-memory store (replace with DB in production)
    this.reviewers = new Map();
  }

  /**
   * Add transaction for human review
   * @param {Object} transaction - The transaction data
   * @param {Object} aiAnalysis - AI analysis results
   * @param {string} reason - Reason for review (e.g., 'high_risk', 'ai_failure')
   * @returns {string} Review ID
   */
  async createReview(transaction, aiAnalysis, reason) {
    const reviewId = `rev_${uuidv4()}`;
    const review = {
      id: reviewId,
      transaction,
      aiAnalysis,
      status: 'pending',
      reason,
      createdAt: new Date(),
      updatedAt: new Date(),
      priority: this.calculatePriority(aiAnalysis.riskScore, reason)
    };
    
    this.reviewQueue.set(reviewId, review);
    this.notifyReviewers(review);
    return reviewId;
  }

  /**
   * Process a review decision
   * @param {string} reviewId - The review ID
   * @param {Object} decision - {status: 'approved'|'rejected', comments: string, reviewerId: string}
   */
  async processReview(reviewId, decision) {
    const review = this.reviewQueue.get(reviewId);
    if (!review) throw new Error('Review not found');
    
    review.status = decision.status;
    review.decision = {
      status: decision.status,
      comments: decision.comments,
      reviewerId: decision.reviewerId,
      reviewedAt: new Date()
    };
    review.updatedAt = new Date();
    
    this.reviewQueue.set(reviewId, review);
    return review;
  }

  /**
   * Get reviews by status
   * @param {string} status - Filter by status
   * @returns {Array} List of reviews
   */
  async getReviews(status) {
    const reviews = Array.from(this.reviewQueue.values());
    return status ? reviews.filter(r => r.status === status) : reviews;
  }

  /**
   * Get a single review by ID
   * @param {string} reviewId - The review ID
   * @returns {Object|null} The review or null if not found
   */
  async getReviewById(reviewId) {
    return this.reviewQueue.get(reviewId) || null;
  }

  /**
   * Calculate review priority (1-10, 10 being highest)
   */
  calculatePriority(riskScore, reason) {
    let priority = 5; // Default priority
    
    // Increase priority for high risk scores
    if (riskScore >= 80) priority += 3;
    else if (riskScore >= 60) priority += 1;
    
    // Adjust based on review reason
    if (reason === 'ai_failure') priority += 2;
    if (reason === 'emergency') priority = 10; // Highest priority
    
    return Math.min(10, Math.max(1, priority)); // Ensure between 1-10
  }

  /**
   * Notify available reviewers (stub - implement actual notification)
   */
  async notifyReviewers(review) {
    // In a real implementation, this would:
    // 1. Find available reviewers
    // 2. Send notifications (email, in-app, etc.)
    // 3. Handle response timeouts
    console.log(`[Review ${review.id}] Needs review - Priority: ${review.priority}, Reason: ${review.reason}`);
  }
}

module.exports = new ReviewService();
