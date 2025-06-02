const axios = require('axios');
const { v4: uuidv4 } = require('uuid');

// Configuration
const API_BASE_URL = 'http://localhost:3000';

// Test transaction data
const testTransactions = [
  // High risk transaction
  {
    amount: 15000,
    merchant: "Suspicious Casino",
    location: "Offshore",
    description: "Gambling transaction"
  },
  // Medium risk transaction
  {
    amount: 5000,
    merchant: "Legit Store",
    location: "Local",
    description: "Regular purchase"
  },
  // Low risk transaction
  {
    amount: 100,
    merchant: "Grocery Store",
    location: "Local",
    description: "Weekly groceries"
  }
];

async function testTransaction(transaction) {
  try {
    console.log('\n--- Testing Transaction ---');
    console.log('Transaction:', JSON.stringify(transaction, null, 2));
    
    // Call the test endpoint (unauthenticated)
    const response = await axios.post(
      `${API_BASE_URL}/api/test/analyze/transaction`,
      transaction
    );
    
    console.log('\nAnalysis Result:');
    console.log(JSON.stringify(response.data, null, 2));
    
    if (response.data.requiresHumanReview) {
      console.log('\n🔍 This transaction requires human review!');
      console.log(`Review ID: ${response.data.reviewId}`);
      console.log(`Reason: ${response.data.reviewReason}`);
      
      // Simulate a review decision
      await simulateReviewDecision(response.data.reviewId);
    } else {
      console.log('\n✅ Transaction approved automatically');
    }
    
    return response.data;
  } catch (error) {
    console.error('Test failed:', error.response?.data || error.message);
    throw error;
  }
}

async function simulateReviewDecision(reviewId) {
  try {
    // In a real scenario, this would be done through the API with proper authentication
    console.log('\nSimulating review decision...');
    
    // Simulate approval after 2 seconds
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    // In a real app, you would call the review decision endpoint:
    // await axios.post(
    //   `${API_BASE_URL}/api/reviews/${reviewId}/decision`,
    //   {
    //     status: 'approved',
    //     reviewerId: 'test-reviewer-1',
    //     comments: 'Manually approved after review'
    //   },
    //   { headers: { Authorization: `Bearer ${AUTH_TOKEN}` }}
    // );
    
    console.log('✅ Review decision simulated (approved)');
    
  } catch (error) {
    console.error('Failed to simulate review decision:', error.message);
  }
}

// Run tests
async function runTests() {
  try {
    console.log('🚀 Starting HITL Integration Tests\n');
    
    // Test each transaction
    for (const transaction of testTransactions) {
      await testTransaction(transaction);
      console.log('\n' + '='.repeat(50) + '\n');
    }
    
    console.log('✅ All tests completed successfully!');
  } catch (error) {
    console.error('❌ Test failed:', error);
    process.exit(1);
  } finally {
    process.exit(0);
  }
}

// Start the tests
runTests();
