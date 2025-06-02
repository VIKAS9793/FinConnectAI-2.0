const reviewService = require('../services/reviewService');
const { v4: uuidv4 } = require('uuid');

/**
 * Middleware to handle HITL workflow
 */
const hitlMiddleware = (req, res, next) => {
  // Store original send function
  const originalSend = res.send;
  
  // Override send to intercept responses
  res.send = async function(body) {
    try {
      // Only process JSON responses
      if (this.get('Content-Type') === 'application/json') {
        let data = typeof body === 'string' ? JSON.parse(body) : body;
        
        // Check if this is a transaction analysis response
        if (req.path.includes('/analyze') && data.riskScore !== undefined) {
          // Store the original response
          const originalResponse = JSON.parse(JSON.stringify(data));
          
          // Handle the analysis and update the response
          await handleAnalysisResponse(req, data);
          
          // If the response was modified, update the body
          if (JSON.stringify(data) !== JSON.stringify(originalResponse)) {
            // Convert back to string if the original body was a string
            if (typeof body === 'string') {
              body = JSON.stringify(data);
            } else {
              body = data;
            }
            
            // Update the response in the request object for potential use in other middleware
            if (req._hitlResponse) {
              Object.assign(req._hitlResponse, data);
            }
          }
        }
      }
      
      // Call original send with potentially modified body
      return originalSend.call(this, body);
    } catch (error) {
      console.error('HITL Middleware Error:', error);
      return originalSend.call(this, body);
    }
  };
  
  next();
};

/**
 * Handle analysis response for HITL
 */
async function handleAnalysisResponse(req, analysisResult) {
  const transaction = req.body;
  
  // Add transaction details to analysis result for reference
  analysisResult.transactionDetails = {
    amount: transaction.amount,
    merchant: transaction.merchant,
    description: transaction.description,
    timestamp: new Date().toISOString()
  };
  
  // Determine if human review is needed
  const needsReview = await shouldRequireHumanReview(transaction, analysisResult);
  
  if (needsReview) {
    const reason = getReviewReason(transaction, analysisResult);
    
    try {
      // Create a review record
      const reviewData = {
        transactionId: transaction.transactionId || `tx_${Date.now()}`,
        status: 'pending',
        riskScore: analysisResult.riskScore,
        reason,
        transactionDetails: transaction,
        analysisResult: analysisResult,
        createdAt: new Date(),
        updatedAt: new Date()
      };
      
      const reviewId = await reviewService.createReview(reviewData);
      
      // Update analysis result to indicate review status
      analysisResult.requiresHumanReview = true;
      analysisResult.reviewId = reviewId;
      analysisResult.reviewStatus = 'pending';
      analysisResult.reviewReason = reason;
      analysisResult.reviewReasonDescription = getReasonDescription(reason);
      analysisResult.reviewedBy = null;
      analysisResult.reviewedAt = null;
      analysisResult.reviewComments = null;
      
      console.log(`Transaction ${transaction.transactionId || 'unknown'} flagged for review (${reason})`);
    } catch (error) {
      console.error('Error creating review:', error);
      // Continue with the original analysis result if review creation fails
      analysisResult.reviewError = 'Failed to create review record';
    }
  } else {
    // Ensure these fields are always present in the response
    analysisResult.requiresHumanReview = false;
    analysisResult.reviewStatus = 'not_required';
  }
  
  return analysisResult;
}

/**
 * Determine if a transaction requires human review
 */
async function shouldRequireHumanReview(transaction, analysisResult) {
  // Always log the check for debugging
  console.log(`Checking if transaction requires review. Risk score: ${analysisResult.riskScore}, Amount: ${transaction.amount}`);
  
  // High risk transactions
  if (analysisResult.riskScore >= 70) {
    console.log('Flagging for review: High risk score');
    return true;
  }
  
  // Large transactions (example: over $5,000)
  if (transaction.amount > 5000) {
    console.log('Flagging for review: Large transaction amount');
    return true;
  }
  
  // AI confidence is low
  if (analysisResult.confidenceScore && analysisResult.confidenceScore < 0.7) {
    console.log('Flagging for review: Low confidence score');
    return true;
  }
  
  // Check for suspicious patterns
  const hasSuspicious = hasSuspiciousPatterns(transaction);
  if (hasSuspicious) {
    console.log('Flagging for review: Suspicious patterns detected');
    return true;
  }
  
  // Check for unusual transaction patterns (time, location, etc.)
  if (isUnusualTransaction(transaction)) {
    console.log('Flagging for review: Unusual transaction pattern');
    return true;
  }
  
  return false;
}

/**
 * Check for unusual transaction patterns
 */
function isUnusualTransaction(transaction) {
  // Check for unusual transaction times (e.g., very early morning)
  const transactionHour = new Date(transaction.timestamp || new Date()).getHours();
  if (transactionHour >= 1 && transactionHour <= 5) {
    return true; // Unusual time for most transactions
  }
  
  // Check for unusual locations if available
  if (transaction.location) {
    const unusualLocations = ['offshore', 'high risk', 'sanctioned'];
    const location = transaction.location.toLowerCase();
    if (unusualLocations.some(loc => location.includes(loc))) {
      return true;
    }
  }
  
  return false;
}

/**
 * Check for suspicious patterns
 */
function hasSuspiciousPatterns(transaction) {
  // Implement pattern matching logic
  const suspiciousKeywords = ['casino', 'gambling', 'offshore', 'highrisk'];
  const merchant = (transaction.merchant || '').toLowerCase();
  
  return suspiciousKeywords.some(keyword => 
    merchant.includes(keyword) || 
    (transaction.description && transaction.description.toLowerCase().includes(keyword))
  );
}

/**
 * Get reason for human review with detailed explanation
 */
function getReviewReason(transaction, analysisResult) {
  const reasons = [];
  
  // Check risk score
  if (analysisResult.riskScore >= 90) {
    reasons.push('very_high_risk_score');
  } else if (analysisResult.riskScore >= 70) {
    reasons.push('high_risk_score');
  }
  
  // Check transaction amount
  if (transaction.amount > 10000) {
    reasons.push('very_large_transaction');
  } else if (transaction.amount > 5000) {
    reasons.push('large_transaction');
  }
  
  // Check AI confidence
  if (analysisResult.confidenceScore !== undefined) {
    if (analysisResult.confidenceScore < 0.5) {
      reasons.push('very_low_confidence');
    } else if (analysisResult.confidenceScore < 0.7) {
      reasons.push('low_confidence');
    }
  }
  
  // Check for suspicious patterns
  if (hasSuspiciousPatterns(transaction)) {
    reasons.push('suspicious_pattern');
  }
  
  // Check for unusual transaction patterns
  if (isUnusualTransaction(transaction)) {
    reasons.push('unusual_pattern');
  }
  
  // Return the most critical reason first, or a default if no specific reason found
  if (reasons.length > 0) {
    return reasons[0];
  }
  
  return 'manual_review_required';
}

/**
 * Get human-readable description for a review reason
 */
function getReasonDescription(reason) {
  const reasons = {
    'very_high_risk_score': 'Very high risk score (90+)',
    'high_risk_score': 'High risk score (70-89)',
    'very_large_transaction': 'Very large transaction amount (>$10,000)',
    'large_transaction': 'Large transaction amount (>$5,000)',
    'very_low_confidence': 'Very low confidence in analysis',
    'low_confidence': 'Low confidence in analysis',
    'suspicious_pattern': 'Suspicious transaction pattern detected',
    'unusual_pattern': 'Unusual transaction pattern',
    'manual_review_required': 'Manual review required'
  };
  
  return reasons[reason] || 'Review required';
}

module.exports = hitlMiddleware;
