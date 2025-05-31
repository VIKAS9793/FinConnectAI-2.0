const { GoogleGenerativeAI } = require('@google/generative-ai');
const OpenAI = require('openai');
const { pipeline } = require('@xenova/transformers');
const tf = require('@tensorflow/tfjs-node');
const Redis = require('ioredis');
const winston = require('winston');

// Configure Winston logger
const logger = winston.createLogger({
  level: 'info',
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.json()
  ),
  transports: [
    new winston.transports.File({ filename: 'error.log', level: 'error' }),
    new winston.transports.File({ filename: 'combined.log' })
  ]
});

if (process.env.NODE_ENV !== 'production') {
  logger.add(new winston.transports.Console({
    format: winston.format.simple()
  }));
}

class AIProviderService {
  constructor() {
    this.provider = process.env.AI_PROVIDER || 'offline';
    this.initProviders();
    this.initCache();
    this.initOfflineModels();
  }

  async initProviders() {
    if (process.env.GOOGLE_AI_KEY) {
      this.googleAI = new GoogleGenerativeAI(process.env.GOOGLE_AI_KEY);
    }

    if (process.env.OPENAI_API_KEY) {
      this.openai = new OpenAI({
        apiKey: process.env.OPENAI_API_KEY,
      });
    }
  }

  async initCache() {
    try {
      this.cache = new Redis({
        host: process.env.REDIS_HOST || 'localhost',
        port: parseInt(process.env.REDIS_PORT || '6379'),
        retryStrategy: (times) => Math.min(times * 50, 2000)
      });

      this.cache.on('error', (err) => {
        logger.error('Redis Cache Error:', err);
      });
    } catch (error) {
      logger.error('Failed to initialize Redis cache:', error);
    }
  }

  async initOfflineModels() {
    try {
      // Initialize offline models
      this.classifier = await pipeline('text-classification', 'Xenova/distilbert-base-uncased-finetuned-sst-2-english');
      
      // Load TensorFlow model for fraud detection
      this.fraudModel = await tf.loadLayersModel('file://./models/fraud-detection/model.json');
      
      logger.info('Offline models initialized successfully');
    } catch (error) {
      logger.error('Failed to initialize offline models:', error);
    }
  }

  async analyzeWithOfflineModels(data) {
    try {
      // Use TensorFlow.js for numerical analysis
      const features = this.preprocessData(data);
      const tensorInput = tf.tensor2d([features]);
      const fraudPrediction = this.fraudModel.predict(tensorInput);
      const riskScore = await fraudPrediction.data();

      // Use Transformers.js for text analysis
      const textAnalysis = await this.classifier(data.description || '');
      
      return {
        provider: 'offline',
        content: JSON.stringify({
          riskScore: riskScore[0],
          riskLevel: this.getRiskLevel(riskScore[0]),
          confidence: textAnalysis[0].score,
          explanation: `Risk analysis based on offline models. Confidence: ${(textAnalysis[0].score * 100).toFixed(1)}%`
        }),
        model: 'hybrid-offline'
      };
    } catch (error) {
      logger.error('Offline analysis error:', error);
      throw error;
    }
  }

  preprocessData(data) {
    // Convert transaction data to numerical features
    return [
      parseFloat(data.amount) || 0,
      this.getLocationRiskScore(data.location),
      this.getMerchantRiskScore(data.merchant),
      // Add more features as needed
    ];
  }

  getLocationRiskScore(location) {
    // Implement location-based risk scoring
    return location.toLowerCase().includes('high risk') ? 0.8 : 0.2;
  }

  getMerchantRiskScore(merchant) {
    // Implement merchant-based risk scoring
    return merchant.toLowerCase().includes('suspicious') ? 0.9 : 0.1;
  }

  getRiskLevel(score) {
    if (score < 0.3) return 'Low';
    if (score < 0.7) return 'Medium';
    return 'High';
  }

  async analyzeWithCache(key, analysisFunction) {
    try {
      if (this.cache) {
        const cached = await this.cache.get(key);
        if (cached) {
          logger.info('Cache hit for key:', key);
          return JSON.parse(cached);
        }
      }

      const result = await analysisFunction();
      
      if (this.cache) {
        await this.cache.setex(key, 3600, JSON.stringify(result)); // Cache for 1 hour
      }

      return result;
    } catch (error) {
      logger.error('Cache operation failed:', error);
      return await analysisFunction();
    }
  }

  async analyzeTransaction(transactionData) {
    const cacheKey = `transaction:${JSON.stringify(transactionData)}`;
    
    try {
      return await this.analyzeWithCache(cacheKey, async () => {
        // Try offline models first
        try {
          return await this.analyzeWithOfflineModels(transactionData);
        } catch (offlineError) {
          logger.warn('Offline analysis failed, falling back to online providers:', offlineError);
          
          // Fallback to online providers
          if (this.provider === 'hybrid') {
            try {
              return await this.analyzeWithGoogle(JSON.stringify(transactionData));
            } catch (googleError) {
              logger.warn('Google AI failed, falling back to OpenAI:', googleError);
              return await this.analyzeWithOpenAI(JSON.stringify(transactionData));
            }
          }
          
          if (this.provider === 'google') {
            return await this.analyzeWithGoogle(JSON.stringify(transactionData));
          } else if (this.provider === 'openai') {
            return await this.analyzeWithOpenAI(JSON.stringify(transactionData));
          }
          
          throw new Error('No valid AI provider available');
        }
      });
    } catch (error) {
      logger.error('AI Analysis Error:', error);
      throw new Error('Failed to analyze transaction with AI services');
    }
  }

  async analyzeRiskProfile(customerId, transactionHistory = []) {
    const cacheKey = `risk:${customerId}:${transactionHistory.length}`;
    
    const analysisFunction = async () => {
      try {
        // Try offline analysis first
        return await this.analyzeWithOfflineModels({
          customerId,
          transactionHistory,
          description: `Customer ${customerId} with ${transactionHistory.length} transactions`
        });
      } catch (offlineError) {
        logger.warn('Offline risk analysis failed, falling back to online providers:', offlineError);
        
        const prompt = this.buildRiskProfilePrompt(customerId, transactionHistory);
        
        if (this.provider === 'hybrid') {
          try {
            return await this.analyzeWithGoogle(prompt);
          } catch (googleError) {
            logger.warn('Google AI failed for risk profile, falling back to OpenAI:', googleError);
            return await this.analyzeWithOpenAI(prompt);
          }
        }
        
        if (this.provider === 'google') {
          return await this.analyzeWithGoogle(prompt);
        } else if (this.provider === 'openai') {
          return await this.analyzeWithOpenAI(prompt);
        }
        
        throw new Error('No valid AI provider available');
      }
    };

    try {
      return await this.analyzeWithCache(cacheKey, analysisFunction);
    } catch (error) {
      logger.error('Risk Profile Analysis Error:', error);
      throw new Error('Failed to analyze risk profile');
    }
  }

  buildRiskProfilePrompt(customerId, transactionHistory) {
    const transactionSummary = transactionHistory.length > 0 
      ? `Customer has ${transactionHistory.length} transactions with an average amount of $${(transactionHistory.reduce((sum, t) => sum + (parseFloat(t.amount) || 0), 0) / transactionHistory.length).toFixed(2)}`
      : 'No transaction history available';

    return `Analyze this customer's risk profile:
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
  }
}

module.exports = new AIProviderService();