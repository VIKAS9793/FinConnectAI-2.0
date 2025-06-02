require('dotenv').config();
const express = require('express');
const cors = require('cors');
const { exec } = require('child_process');
const { promisify } = require('util');
const { auth } = require('express-oauth2-jwt-bearer');
const aiProvider = require('./aiProviderService');
const hitlMiddleware = require('./middleware/hitlMiddleware');
const reviewRoutes = require('./routes/reviewRoutes');

const app = express();
const execPromise = promisify(exec);

// Server configuration
const HOST = '0.0.0.0';  // Listen on all network interfaces
const START_PORT = 3000;  // Starting port number
const MAX_PORT_ATTEMPTS = 10;  // Maximum number of ports to try
let currentPort = START_PORT;

// Utility function to check if port is in use
async function isPortInUse(port) {
  try {
    const { stdout } = await execPromise(`netstat -ano | findstr :${port}`);
    return stdout.trim().length > 0;
  } catch (error) {
    return false;
  }
}

// Utility function to kill process on port
async function killProcessOnPort(port) {
  try {
    const { stdout } = await execPromise(`netstat -ano | findstr :${port}`);
    const lines = stdout.trim().split('\n');
    const pids = new Set();
    
    lines.forEach(line => {
      const match = line.trim().split(/\s+/);
      if (match.length > 4) {
        pids.add(match[4]);
      }
    });

    for (const pid of pids) {
      try {
        console.log(`Killing process with PID: ${pid}`);
        await execPromise(`taskkill /F /PID ${pid}`);
      } catch (err) {
        console.error(`Failed to kill process ${pid}:`, err.message);
      }
    }
    return true;
  } catch (error) {
    console.error('Error killing process on port:', error.message);
    return false;
  }
}

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
  const start = Date.now();
  const requestId = Math.random().toString(36).substring(2, 10);
  
  console.log(`[${new Date().toISOString()}] [${requestId}] ${req.method} ${req.url}`);
  
  // Log request headers for debugging
  console.log(`[${requestId}] Headers:`, JSON.stringify(req.headers, null, 2));
  
  // Log request body if present
  if (Object.keys(req.body).length > 0) {
    console.log(`[${requestId}] Request body:`, JSON.stringify(req.body, null, 2));
  }
  
  // Log response
  const originalSend = res.send;
  res.send = function(body) {
    const responseTime = Date.now() - start;
    console.log(`[${requestId}] Response (${responseTime}ms):`, JSON.stringify(body, null, 2));
    return originalSend.call(this, body);
  };
  
  // Log errors
  res.on('finish', () => {
    const responseTime = Date.now() - start;
    console.log(`[${requestId}] Completed ${res.statusCode} in ${responseTime}ms`);
  });
  
  next();
});

// Core Middleware
app.use(cors());
app.use(express.json());

// HITL Middleware
app.use(hitlMiddleware);

// Review Routes
app.use('/api/reviews', reviewRoutes);

// Import auth middleware
const { checkJwt } = require('./middleware/auth');

// Public test endpoint (for development only)
app.post('/api/test/analyze/transaction', (req, res) => {
  console.log('Test endpoint hit with body:', req.body);
  
  // Simple echo response with additional fields
  const response = {
    success: true,
    message: 'Test endpoint working',
    request: req.body,
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || 'development'
  };
  
  res.json(response);
});

// Transaction analysis endpoint with HITL integration
app.post('/api/analyze/transaction', checkJwt, async (req, res) => {
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

// AI-Powered Transaction Analysis Endpoint
app.post('/api/analyze/transaction', checkJwt, async (req, res) => {
  console.log('🔍 Transaction analysis endpoint hit');
  console.log('Auth:', req.auth);  // Log the auth object
  console.log('Request body:', req.body);  // Log the request body
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
      
      // The HITL middleware will handle the response and may modify it
      // to include review status if human review is needed
      const response = {
        ...analysis,
        requestId,
        responseTime: `${responseTime}ms`,
        // These fields will be set by the HITL middleware if needed:
        // - requiresHumanReview: boolean
        // - reviewId: string
        // - reviewStatus: 'pending'|'approved'|'rejected'
      };
      
      // Store the response in the request object for the HITL middleware
      req._hitlResponse = response;
      
      res.json(response);
    } catch (error) {
      const errorMsg = error.message || 'Unknown error';
      console.error(`[${requestId}] AI Analysis Error:`, errorMsg);
      
      // Fallback to basic analysis if AI fails
      const riskScore = Math.min(1, Math.max(0, 
        0.3 * (req.body.amount > 10000 ? 0.8 : req.body.amount / 10000) + 
        0.2 * ((req.body.merchant || '').includes('Suspicious') ? 0.9 : 0.1) +
        0.1 * ((req.body.location || '').includes('High Risk') ? 0.8 : 0.1)
      ));
      
      const responseTime = Date.now() - startTime;
      
      // Create fallback response that can be processed by HITL middleware
      const fallbackResponse = { 
        riskScore: Math.round(riskScore * 100),
        riskLevel: riskScore > 0.7 ? 'High' : riskScore > 0.3 ? 'Medium' : 'Low',
        explanation: 'Basic risk assessment (AI service unavailable)',
        timestamp: new Date().toISOString(),
        provider: 'fallback',
        model: 'basic',
        success: false,
        error: errorMsg,
        requestId,
        responseTime: `${responseTime}ms`,
        // Ensure these fields are present for HITL middleware
        requiresHumanReview: riskScore > 70, // Flag for human review if high risk
        reviewStatus: 'pending'
      };
      
      // Store the response in the request object for the HITL middleware
      req._hitlResponse = fallbackResponse;
      
      res.status(500).json(fallbackResponse);
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

// Test endpoint for direct connection testing
app.get('/test-connection', (req, res) => {
  console.log('Test connection endpoint hit at:', new Date().toISOString());
  res.send('Server is responding!');
});

// Health Check
app.get('/api/health', (req, res) => {
  console.log('Health check endpoint hit at:', new Date().toISOString());
  const response = { 
    status: 'ok', 
    timestamp: new Date().toISOString(),
    nodeVersion: process.version,
    platform: process.platform,
    memoryUsage: process.memoryUsage()
  };
  console.log('Sending response:', JSON.stringify(response, null, 2));
  res.json(response);
});

// Function to find an available port
const findAvailablePort = async (startPort) => {
  let port = startPort;
  let attempts = 0;
  
  while (attempts < MAX_PORT_ATTEMPTS) {
    const inUse = await isPortInUse(port);
    if (!inUse) {
      return port;
    }
    console.log(`Port ${port} is in use, trying next port...`);
    port++;
    attempts++;
  }
  
  throw new Error(`Could not find an available port after ${MAX_PORT_ATTEMPTS} attempts`);
};

// Start server with enhanced error handling and dynamic port selection
const startServer = async () => {
  try {
    // Find an available port
    currentPort = await findAvailablePort(START_PORT);
    console.log(`Found available port: ${currentPort}`);
    
    // Kill any processes using this port just to be safe
    await killProcessOnPort(currentPort);

    // Create HTTP server
    const server = app.listen(currentPort, HOST, () => {
      console.log(`\n✅ Server running at:`);
      console.log(`   Local:  http://localhost:${currentPort}`);
      console.log(`   Network: http://${require('os').networkInterfaces().eth0?.[0]?.address || '0.0.0.0'}:${currentPort}`);
      console.log(`\n📊 Health check: http://localhost:${currentPort}/health`);
      console.log(`🔌 Test connection: http://localhost:${currentPort}/test-connection`);
      console.log(`\nEnvironment: ${process.env.NODE_ENV || 'development'}`);
      console.log(`Node.js: ${process.version}`);
      console.log(`Platform: ${process.platform}\n`);
    });

    // Handle server errors
    server.on('error', async (error) => {
      if (error.code === 'EADDRINUSE') {
        console.error(`❌ Port ${currentPort} is still in use after cleanup attempt`);
        console.log('Trying next port...');
        // Try starting the server again with the next port
        currentPort++;
        if (currentPort < START_PORT + MAX_PORT_ATTEMPTS) {
          return startServer();
        } else {
          console.error('Maximum port attempts reached. Please check for port conflicts.');
        }
      } else {
        console.error('❌ Server error:', error.message);
      }
      process.exit(1);
    });

    // Graceful shutdown
    const gracefulShutdown = () => {
      console.log('\n🛑 Received shutdown signal. Closing server...');
      server.close(() => {
        console.log('✅ Server closed');
        process.exit(0);
      });

      // Force shutdown after 5 seconds
      setTimeout(() => {
        console.error('❌ Forcing shutdown...');
        process.exit(1);
      }, 5000);
    };

    // Handle termination signals
    process.on('SIGTERM', gracefulShutdown);
    process.on('SIGINT', gracefulShutdown);

    // Handle unhandled rejections
    process.on('unhandledRejection', (reason, promise) => {
      console.error('UNHANDLED REJECTION! 💥 Shutting down...');
      console.error('Reason:', reason);
      server.close(() => {
        process.exit(1);
      });
    });

    // Handle uncaught exceptions
    process.on('uncaughtException', (error) => {
      console.error('UNCAUGHT EXCEPTION! 💥 Shutting down...');
      console.error(error);
      server.close(() => {
        process.exit(1);
      });
    });

  } catch (error) {
    console.error('❌ Failed to start server:', error);
    process.exit(1);
  }
};

// Log environment configuration
console.log('\n🔧 Environment Configuration:');
console.log(`- NODE_ENV: ${process.env.NODE_ENV || 'development'}`);
console.log(`- AI_PROVIDER: ${process.env.AI_PROVIDER || 'Not set'}`);
console.log(`- GOOGLE_AI_KEY: ${process.env.GOOGLE_AI_KEY ? '***' : 'Not set'}`);
console.log(`- OPENAI_API_KEY: ${process.env.OPENAI_API_KEY ? '***' : 'Not set'}`);
console.log(`- AUTH0_DOMAIN: ${process.env.AUTH0_DOMAIN || 'Not set'}`);
console.log(`- AUTH0_AUDIENCE: ${process.env.AUTH0_AUDIENCE || 'Not set'}`);

// Start the server
console.log('\n🚀 Starting server...');
startServer();
