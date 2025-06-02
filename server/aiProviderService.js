const { GoogleGenerativeAI } = require('@google/generative-ai');
const OpenAI = require('openai');

class AIProviderService {
  constructor() {
    this.provider = process.env.AI_PROVIDER || 'google';
    this.initProviders();
  }

  initProviders() {
    // Initialize Google AI
    if (process.env.GOOGLE_AI_KEY) {
      this.googleAI = new GoogleGenerativeAI(process.env.GOOGLE_AI_KEY);
    }

    // Initialize OpenAI
    if (process.env.OPENAI_API_KEY) {
      this.openai = new OpenAI({
        apiKey: process.env.OPENAI_API_KEY,
      });
    }
  }

  async analyzeWithGoogle(prompt) {
    try {
      const model = this.googleAI.getGenerativeModel({ model: 'gemini-pro' });
      const result = await model.generateContent(prompt);
      const response = await result.response;
      return {
        provider: 'google',
        content: response.text(),
        model: 'gemini-pro'
      };
    } catch (error) {
      console.error('Google AI Error:', error);
      throw error;
    }
  }

  async analyzeWithOpenAI(prompt) {
    try {
      const completion = await this.openai.chat.completions.create({
        model: process.env.OPENAI_MODEL || 'gpt-4',
        messages: [
          { role: 'system', content: 'You are a helpful assistant that analyzes financial transactions.' },
          { role: 'user', content: prompt }
        ],
      });
      
      return {
        provider: 'openai',
        content: completion.choices[0]?.message?.content || 'No content',
        model: process.env.OPENAI_MODEL || 'gpt-4'
      };
    } catch (error) {
      console.error('OpenAI Error:', error);
      throw error;
    }
  }

  async analyzeTransaction(transactionData) {
    console.log('Analyzing transaction with data:', JSON.stringify(transactionData, null, 2));
    
    const prompt = `Analyze this financial transaction for potential fraud risk:
    - Amount: $${transactionData.amount}
    - Merchant: ${transactionData.merchant}
    - Location: ${transactionData.location}`;
    
    console.log('Using AI Provider:', this.provider);
    console.log('Environment Variables:', {
      GOOGLE_AI_KEY: process.env.GOOGLE_AI_KEY ? '***' : 'Not set',
      OPENAI_API_KEY: process.env.OPENAI_API_KEY ? '***' : 'Not set'
    });

    try {
      // If hybrid mode, try both providers and return the first successful response
      if (this.provider === 'hybrid') {
        try {
          const result = await this.analyzeWithGoogle(prompt);
          console.log('Used Google AI for analysis');
          return result;
        } catch (googleError) {
          console.log('Google AI failed, falling back to OpenAI');
          const result = await this.analyzeWithOpenAI(prompt);
          console.log('Used OpenAI for analysis');
          return result;
        }
      }
      
      // Use specific provider based on configuration
      if (this.provider === 'google') {
        return await this.analyzeWithGoogle(prompt);
      } else if (this.provider === 'openai') {
        return await this.analyzeWithOpenAI(prompt);
      }
      
      throw new Error('No valid AI provider configured');
    } catch (error) {
      console.error('AI Analysis Error:', error);
      throw new Error('Failed to analyze transaction with AI services');
    }
  }
}

module.exports = new AIProviderService();
