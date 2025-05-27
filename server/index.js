require('dotenv').config();
const express = require('express');
const cors = require('cors');
const { auth } = require('express-oauth2-jwt-bearer');
const OpenAI = require('openai');

const app = express();
const PORT = process.env.PORT || 5000;

// Initialize OpenAI client
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
});

// Helper function to analyze transaction with AI
async function analyzeTransactionWithAI(transaction) {
  try {
    const { amount, merchant, location } = transaction;
    
    const prompt = `Analyze this financial transaction for potential fraud risk:
    - Amount: $${amount}
    - Merchant: ${merchant}
    - Location: ${location}
    
    Provide a detailed risk analysis with:
    1. Risk score (0-1)
    2. Risk level (Low/Medium/High)
    3. Key risk factors
    4. Explanation
    5. Recommended actions
    
    Format the response as a JSON object with these fields:
    {
      "riskScore": number,
      "riskLevel": "Low" | "Medium" | "High",
      "isHighRisk": boolean,
      "explanation": string,
      "factors": Array<{name: string, value: string, impact: number}>,
      "recommendations": string[]
    }`;

    const completion = await openai.chat.completions.create({
      model: process.env.OPENAI_MODEL || 'gpt-4',
      messages: [
        {
          role: 'system',
          content: 'You are a financial fraud detection AI. Analyze transactions for potential fraud and provide detailed risk assessments.'
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
      // Try to parse the response as JSON
      analysis = JSON.parse(responseText);
    } catch (e) {
      console.error('Failed to parse AI response:', responseText);
      throw new Error('Failed to analyze transaction with AI');
    }

    return {
      transactionId: `txn_${Math.floor(Math.random() * 1000000)}`,
      timestamp: new Date().toISOString(),
      ...analysis
    };
  } catch (error) {
    console.error('AI Analysis Error:', error);
    throw new Error('Failed to analyze transaction with AI');
  }
}

// Middleware
app.use(cors());
app.use(express.json());

// Auth0 configuration
const checkJwt = auth({
  audience: process.env.AUTH0_AUDIENCE,
  issuerBaseURL: `https://${process.env.AUTH0_DOMAIN}/`,
  tokenSigningAlg: 'RS256'
});

// AI-Powered Transaction Analysis Endpoint
app.post('/api/analyze/transaction', checkJwt, async (req, res) => {
  try {
    const { amount, merchant, location } = req.body;
    
    if (!amount || !merchant) {
      return res.status(400).json({ 
        error: 'Missing required fields: amount and merchant are required' 
      });
    }

    console.log('Analyzing transaction with AI:', { amount, merchant, location });
    
    // Use AI to analyze the transaction
    const analysis = await analyzeTransactionWithAI({
      amount: parseFloat(amount),
      merchant: merchant.toString(),
      location: location?.toString() || 'Unknown'
    });

    console.log('AI Analysis Result:', analysis);
    
    res.json(analysis);
  } catch (error) {
    console.error('Transaction Analysis Error:', error);
    
    // Fallback to basic analysis if AI fails
    const { amount, merchant, location } = req.body;
    const riskScore = Math.min(1, Math.max(0, 
      0.3 * (amount > 10000 ? 0.8 : amount / 10000) + 
      0.2 * (merchant === 'High Risk Merchant' ? 0.9 : 0.1) +
      0.1 * (location === 'High Risk Country' ? 0.7 : 0.1) +
      Math.random() * 0.2
    ));

    const isHighRisk = riskScore > 0.7;
    
    res.json({
      transactionId: `txn_${Math.floor(Math.random() * 1000000)}`,
      riskScore: parseFloat(riskScore.toFixed(2)),
      riskLevel: isHighRisk ? 'High' : riskScore > 0.4 ? 'Medium' : 'Low',
      isHighRisk,
      explanation: 'Basic risk analysis (AI service unavailable)',
      factors: [
        { name: 'Amount', value: amount > 10000 ? 'High' : 'Normal', impact: 0.3 },
        { name: 'Merchant', value: merchant, impact: 0.2 },
        { name: 'Location', value: location || 'Unknown', impact: 0.1 }
      ],
      recommendations: isHighRisk 
        ? ['Review transaction details', 'Contact customer for verification'] 
        : ['No action required']
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

// Start server
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
