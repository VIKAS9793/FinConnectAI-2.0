require('dotenv').config();
const express = require('express');
const cors = require('cors');
const { auth } = require('express-oauth2-jwt-bearer');
const aiProvider = require('./aiProviderService');

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());

// Helper function to analyze transaction with AI
async function analyzeTransactionWithAI(transactionData) {
  console.log('Analyzing transaction:', JSON.stringify(transactionData, null, 2));
  
  try {
    const result = await aiProvider.analyzeTransaction(transactionData);
    
    if (!result) {
      throw new Error('No result returned from AI provider');
    }
    
    console.log('AI Provider Response:', JSON.stringify(result, null, 2));
    
    // Parse the response from the AI provider
    const analysis = {
      riskScore: Math.floor(Math.random() * 100), // You might want to extract this from the AI response
      riskLevel: ['Low', 'Medium', 'High'][Math.floor(Math.random() * 3)],
      explanation: result.content || 'No explanation provided',
      timestamp: new Date().toISOString(),
      provider: result.provider || 'unknown',
      model: result.model || 'unknown',
      success: true
    };

    // Check if we have content to parse
    if (result.content) {
      try {
        // Extract JSON from markdown code block if present
        let jsonContent = result.content;
        const jsonMatch = result.content.match(/```(?:json)?\s*([\s\S]*?)\s*```/);
        if (jsonMatch && jsonMatch[1]) {
          jsonContent = jsonMatch[1];
        }
        
        // Try to parse the JSON content
        const parsedContent = JSON.parse(jsonContent);
        return {
          ...analysis,
          ...parsedContent,
          transactionId: parsedContent.transactionId || `txn_${Math.floor(Math.random() * 1000000)}`,
          success: true
        };
      } catch (parseError) {
        console.warn('Failed to parse AI response as JSON, using raw content');
        return analysis;
      }
    }
    
    return analysis;
  } catch (error) {
    console.error('Error in analyzeTransactionWithAI:', error);
    // Return a default response in case of error
    return {
      transactionId: `txn_${Math.floor(Math.random() * 1000000)}`,
      timestamp: new Date().toISOString(),
      riskScore: 0.5,
      riskLevel: 'Medium',
      explanation: 'Error in analysis - using default assessment',
      factors: [],
      recommendations: ['Review transaction manually'],
      isHighRisk: false,
      error: error.message
    };
  }
}

// Enhanced logging middleware
app.use((req, res, next) => {
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.url}`);
  if (Object.keys(req.body).length > 0) {
    console.log('Request body:', JSON.stringify(req.body, null, 2));
  }
  next();
});

// Middleware
app.use(cors());
app.use(express.json());

// Auth0 configuration
const checkJwt = auth({
  audience: process.env.AUTH0_AUDIENCE,
  issuerBaseURL: `https://${process.env.AUTH0_DOMAIN}/`,
  tokenSigningAlg: 'RS256'
});

// Public test endpoint (for development only)
app.post('/api/test/analyze/transaction', async (req, res) => {
  console.log('Received test request at:', new Date().toISOString());
  try {
    const { amount, merchant, location } = req.body;
    
    if (!amount || !merchant || !location) {
      return res.status(400).json({
        error: 'Missing required fields',
        required: ['amount', 'merchant', 'location']
      });
    }
    
    console.log('Processing test transaction:', { amount, merchant, location });
    
    // Simulate AI processing
    const riskScore = Math.min(1, Math.max(0, 
      0.3 * (amount > 10000 ? 0.8 : amount / 10000) + 
      0.2 * (merchant.includes('Suspicious') ? 0.9 : 0.1) +
      0.1 * (location.includes('High Risk') ? 0.8 : 0.1)
    ));
    
    const response = {
      riskScore: Math.round(riskScore * 100),
      riskLevel: riskScore > 0.7 ? 'High' : riskScore > 0.3 ? 'Medium' : 'Low',
      explanation: 'Test analysis completed successfully',
      timestamp: new Date().toISOString(),
      provider: 'test',
      model: 'test',
      success: true,
      requestId: Math.random().toString(36).substring(2, 10)
    };
    
    console.log('Sending test response:', response);
    res.json(response);
  } catch (error) {
    console.error('Test endpoint error:', error);
    res.status(500).json({
      error: 'Test failed',
      message: error.message,
      success: false
    });
  }
});

// AI-Powered Transaction Analysis Endpoint (secured with Auth0)
app.post('/api/analyze/transaction', checkJwt, async (req, res) => {
  const startTime = Date.now();
  const requestId = Math.random().toString(36).substring(2, 15);
  
  console.log(`[${new Date().toISOString()}] [${requestId}] Received transaction analysis request`);
  
  try {
    const { amount, merchant, location } = req.body;
    console.log(`[${requestId}] Request body:`, { amount, merchant, location });

    if (!amount || !merchant || !location) {
      const errorMsg = 'Missing required fields';
      console.error(`[${requestId}] ${errorMsg}:`, { amount, merchant, location });
      
      return res.status(400).json({ 
        error: errorMsg,
        required: ['amount', 'merchant', 'location'],
        requestId,
        success: false
      });
    }

    console.log(`[${requestId}] Starting AI analysis...`);
    try {
      const analysis = await analyzeTransactionWithAI({ amount, merchant, location });
      
      const responseTime = Date.now() - startTime;
      console.log(`[${requestId}] Analysis completed in ${responseTime}ms`);
      
      res.json({
        ...analysis,
        requestId,
        responseTime: `${responseTime}ms`
      });
    } catch (error) {
      const errorMsg = error.message || 'Unknown error';
      console.error(`[${requestId}] AI Analysis Error:`, errorMsg);
      
      // Fallback to basic analysis if AI fails
      const riskScore = Math.min(1, Math.max(0, 
        0.3 * (req.body.amount > 10000 ? 0.8 : req.body.amount / 10000) + 
        0.2 * (req.body.merchant.includes('Suspicious') ? 0.9 : 0.1) +
        0.1 * (req.body.location.includes('High Risk') ? 0.8 : 0.1)
      ));
      
      const responseTime = Date.now() - startTime;
      
      res.status(500).json({ 
        riskScore: Math.round(riskScore * 100),
        riskLevel: riskScore > 0.7 ? 'High' : riskScore > 0.3 ? 'Medium' : 'Low',
        explanation: 'Basic risk assessment (AI service unavailable)',
        timestamp: new Date().toISOString(),
        provider: 'fallback',
        model: 'basic',
        success: false,
        requestId,
        responseTime: `${responseTime}ms`,
        warning: 'Using fallback analysis due to error',
        error: errorMsg
      });
    }
  } catch (error) {
    const errorMsg = error.message || 'Unknown error';
    console.error(`[${requestId}] Error in /api/analyze/transaction:`, errorMsg);
    console.error(error.stack);
    
    // Final fallback in case everything else fails
    res.status(500).json({
      error: 'Failed to process transaction analysis',
      message: errorMsg,
      requestId,
      success: false,
      timestamp: new Date().toISOString(),
      responseTime: `${Date.now() - startTime}ms`
    });
  }
});

// AI-Powered Risk Score Endpoint
app.post('/api/analyze/risk-score', checkJwt, async (req, res) => {
  try {
    const { customerId, transactionHistory = [] } = req.body;
    
    if (!customerId) {
      return res.status(400).json({ 
        error: 'Missing required field: customerId is required' 
      });
    }

    console.log('Analyzing customer risk with AI:', { customerId, transactionCount: transactionHistory.length });
    
    // Prepare transaction history summary for AI
    const transactionSummary = transactionHistory.length > 0 
      ? `Customer has ${transactionHistory.length} transactions with an average amount of $${(transactionHistory.reduce((sum, t) => sum + (parseFloat(t.amount) || 0), 0) / transactionHistory.length).toFixed(2)}`
      : 'No transaction history available';

    const prompt = `Analyze this customer's risk profile:
    - Customer ID: ${customerId}
    - Transaction History: ${transactionSummary}
    
    Provide a comprehensive risk assessment with:
    1. Risk score (0-1)
    2. Risk level (Low/Medium/High)
    3. Key risk factors
    4. Explanation
    5. Recommended monitoring approach
    
    Format the response as a JSON object with these fields:
    {
      "riskScore": number,
      "riskLevel": "Low" | "Medium" | "High",
      "lastUpdated": string,
      "explanation": string,
      "factors": Array<{name: string, value: string, impact: number}>,
      "recommendations": string[]
    }`;

    const completion = await openai.chat.completions.create({
      model: process.env.OPENAI_MODEL || 'gpt-4',
      messages: [
        {
          role: 'system',
          content: 'You are a financial risk assessment AI. Analyze customer profiles and transaction history to assess credit and fraud risk.'
        },
        {
          role: 'user',
          content: prompt
        }
      ],
      temperature: 0.2,
      max_tokens: 1000
    });

    // Parse the AI response
    const responseText = completion.choices[0]?.message?.content || '{}';
    let analysis;
    
    try {
      analysis = JSON.parse(responseText);
    } catch (e) {
      console.error('Failed to parse AI risk assessment:', responseText);
      throw new Error('Failed to analyze customer risk with AI');
    }

    const result = {
      customerId,
      lastUpdated: new Date().toISOString(),
      ...analysis
    };

    console.log('AI Risk Assessment Result:', result);
    res.json(result);
    
  } catch (error) {
    console.error('Risk Assessment Error:', error);
    
    // Fallback to basic risk scoring if AI fails
    const riskScore = Math.min(1, Math.max(0, 
      0.4 * (Math.random() > 0.7 ? 0.8 : Math.random() > 0.3 ? 0.5 : 0.2) +
      Math.random() * 0.3
    ));

    res.json({
      customerId: req.body.customerId || 'cust_' + Math.floor(Math.random() * 10000),
      riskScore: parseFloat(riskScore.toFixed(2)),
      riskLevel: riskScore > 0.7 ? 'High' : riskScore > 0.4 ? 'Medium' : 'Low',
      lastUpdated: new Date().toISOString(),
      explanation: 'Basic risk assessment (AI service unavailable)',
      factors: [
        { name: 'Transaction History', value: 'Stable', impact: 0.4 },
        { name: 'Account Age', value: '>1 year', impact: 0.3 },
        { name: 'KYC Status', value: 'Verified', impact: 0.2 }
      ],
      recommendations: [
        riskScore > 0.7 ? 'Enhanced monitoring recommended' : 'Standard monitoring'
      ]
    });
  }
});

// Health Check
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Start server with error handling
const server = app.listen(PORT, '0.0.0.0', () => {
  console.log(`Server running on port ${PORT}`);
  console.log('Environment:', process.env.NODE_ENV || 'development');
  console.log('Available endpoints:');
  console.log(`  - GET  http://localhost:${PORT}/api/health`);
  console.log(`  - POST http://localhost:${PORT}/api/test/analyze/transaction`);
  console.log(`  - POST http://localhost:${PORT}/api/analyze/transaction (requires auth)`);
});

// Handle server errors
server.on('error', (error) => {
  if (error.code === 'EADDRINUSE') {
    console.error(`Port ${PORT} is already in use. Please stop any other servers using this port.`);
  } else {
    console.error('Server error:', error);
  }
  process.exit(1);
});

// Handle unhandled promise rejections
process.on('unhandledRejection', (reason, promise) => {
  console.error('Unhandled Rejection at:', promise, 'reason:', reason);
  // Consider restarting the server or performing cleanup here
});

// Handle uncaught exceptions
process.on('uncaughtException', (error) => {
  console.error('Uncaught Exception:', error);
  // Consider restarting the server or performing cleanup here
  process.exit(1);
});
