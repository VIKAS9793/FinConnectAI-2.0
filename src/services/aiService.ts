import axios, { AxiosError } from 'axios';
import { 
  AnalysisResult, 
  TransactionData, 
  RiskScoreData, 
  TransactionMetadata, 
  RiskScoreBreakdown 
} from './api';

/**
 * @file aiService.ts
 * @description Service for interacting with the AI fraud detection API
 * 
 * This service provides methods for analyzing transactions and generating risk profiles
 * using the backend AI service. It handles API communication, error handling, and
 * response transformation.
 * 
 * Environment Variables:
 * - VITE_API_BASE_URL: Base URL for the API (default: http://localhost:5000/api)
 * - VITE_API_TIMEOUT: Request timeout in milliseconds (default: 10000)
 */

const DEFAULT_TIMEOUT = 10000; // 10 seconds
// API version is currently not used but kept for future versioning
// const API_VERSION = 'v1';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api';

interface AIServiceResponse {
  riskScore: number;
  riskLevel: 'Low' | 'Medium' | 'High';
  confidence: number;
  riskFactors: string[];
  rulesTriggered: string[];
  transaction: AnalysisResult['transaction'];
  normalizedAmount: AnalysisResult['normalizedAmount'];
  riskBreakdown: RiskScoreBreakdown;
  explanation: string;
  recommendedAction: string;
  insights: string[];
  metadata: Omit<TransactionMetadata, 'processingTimeMs'> & {
    modelVersion: string;
  };
}

/**
 * Service for handling AI-powered fraud detection and risk assessment
 */
class AIService {
  private readonly apiBaseUrl: string;

  constructor(apiBaseUrl: string = API_BASE_URL) {
    this.apiBaseUrl = apiBaseUrl;
  }

  /**
   * Analyzes a transaction for potential fraud using the AI service
   * @param transactionData - The transaction data to analyze
   * @returns Promise resolving to the analysis result
   * @throws {Error} If the API request fails
   * 
   * @example
   * const result = await aiService.analyzeTransaction({
   *   amount: 150.75,
   *   currency: 'USD',
   *   merchant: 'Example Store',
   *   cardPresent: false
   * });
   */
  async analyzeTransaction(transactionData: TransactionData): Promise<AnalysisResult> {
    const startTime = performance.now();
    
    try {
      const response = await axios.post<AIServiceResponse>(
        `${this.apiBaseUrl}/analyze`,
        transactionData,
        {
          timeout: parseInt(import.meta.env.VITE_API_TIMEOUT || '10000', 10) || DEFAULT_TIMEOUT,
          headers: {
            'Content-Type': 'application/json',
            'X-Request-ID': `txn-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
          },
        }
      );

      if (!response.data) {
        throw new Error('No data received from API');
      }

      const processingTimeMs = Math.round(performance.now() - startTime);
      
      return {
        ...response.data,
        metadata: {
          ...response.data.metadata,
          processingTimeMs,
          timestamp: new Date().toISOString(),
        },
      };
    } catch (error) {
      const errorStatus = (error as AxiosError)?.response?.status || 500;
      const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
      console.error(`AI transaction analysis failed (${errorStatus}):`, errorMessage);
      
      // Create a fallback result with comprehensive error information
      const fallbackResult: AnalysisResult = {
        riskScore: 0.5,
        riskLevel: 'Medium',
        confidence: 0,
        riskFactors: [`API Error (${errorStatus}): ${errorMessage}`],
        rulesTriggered: ['fallback_triggered'],
        transaction: {
          id: `fallback-${Date.now()}`,
          merchant: transactionData.merchant || 'Unknown',
          currency: (transactionData.currency as string) || 'USD',
          amount: typeof transactionData.amount === 'number' ? transactionData.amount : 0,
          isCardPresent: Boolean(transactionData.cardPresent),
          isRecurring: Boolean(transactionData.isRecurring),
          transactionType: 'other',
          paymentMethod: 'other',
          ...(transactionData.deviceId && { deviceId: transactionData.deviceId }),
          ...(transactionData.customerId && { customerId: transactionData.customerId }),
          ...(transactionData.ipAddress && { ipAddress: transactionData.ipAddress }),
        },
        normalizedAmount: {
          amount: typeof transactionData.amount === 'number' ? transactionData.amount : 0,
          currency: (transactionData.currency as string) || 'USD',
          originalAmount: typeof transactionData.amount === 'number' ? transactionData.amount : 0,
          originalCurrency: (transactionData.currency as string) || 'USD',
        },
        riskBreakdown: {
          amountRisk: 0.1,
          merchantRisk: 0.1,
          locationRisk: 0.1,
          timeRisk: 0.1,
          patternRisk: 0.1,
          velocityRisk: 0.1,
          deviceRisk: 0.1,
          behavioralRisk: 0.1,
        },
        explanation: 'An error occurred while analyzing the transaction. Using fallback risk assessment.',
        recommendedAction: 'Review this transaction manually for potential fraud.',
        insights: [
          'This result was generated due to an error in the fraud detection service.',
          'Please verify the transaction details and consider additional verification steps.'
        ],
        metadata: {
          id: `fallback-${Date.now()}`,
          timestamp: new Date().toISOString(),
          processingTimeMs: Math.round(performance.now() - startTime),
          version: '1.0.0',
          model: 'fallback-model',
          environment: 'production',
        },
        isFallback: true
      };
      
      return fallbackResult;
    }
  }

  /**
   * Generates a risk profile for a customer
   * @param customerData Customer data including transaction history
   * @returns Risk assessment with score and explanation
   */
  async generateRiskProfile(customerData: RiskScoreData): Promise<AnalysisResult> {
    const startTime = performance.now();
    const transactionId = `risk-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
    
    try {
      const response = await axios.post<AIServiceResponse>(
        `${this.apiBaseUrl}/risk-profile`,
        customerData,
        {
          timeout: parseInt(import.meta.env.VITE_API_TIMEOUT || '10000', 10) || DEFAULT_TIMEOUT,
          headers: {
            'Content-Type': 'application/json',
            'X-Request-ID': transactionId,
          },
        }
      );

      if (!response.data) {
        throw new Error('No data received from API');
      }

      const processingTimeMs = Math.round(performance.now() - startTime);
      
      return {
        ...response.data,
        metadata: {
          ...response.data.metadata,
          processingTimeMs,
          timestamp: new Date().toISOString(),
        },
      };
    } catch (error) {
      const errorStatus = (error as AxiosError)?.response?.status || 500;
      const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
      console.error(`Risk profile generation failed (${errorStatus}):`, errorMessage);
      
      // Create a fallback result with error information
      const fallbackResult: AnalysisResult = {
        riskScore: 0.5,
        riskLevel: 'Medium',
        confidence: 0.5,
        riskFactors: ['Service error'],
        rulesTriggered: [],
        transaction: {
          merchant: 'Unknown',
          currency: 'USD',
          amount: 0,
          isCardPresent: false,
          isRecurring: false,
          transactionType: 'other',
          paymentMethod: 'other',
        },
        normalizedAmount: {
          amount: 0,
          currency: 'USD',
          originalAmount: 0,
          originalCurrency: 'USD'
        },
        riskBreakdown: {
          amountRisk: 0,
          merchantRisk: 0,
          locationRisk: 0,
          timeRisk: 0,
          patternRisk: 0,
          velocityRisk: 0,
          deviceRisk: 0,
          behavioralRisk: 0
        },
        explanation: 'Error in risk assessment service. Using fallback values.',
        recommendedAction: 'Please review this transaction manually',
        insights: ['Service error occurred during risk assessment'],
        metadata: {
          id: transactionId,
          timestamp: new Date().toISOString(),
          processingTimeMs: Math.round(performance.now() - startTime),
          version: '1.0.0',
          model: 'fallback-model',
          environment: 'production' as const
        },
        isFallback: true
      };
      
      return fallbackResult;
    }
  }


}

// Export a singleton instance for convenience
export const aiService = new AIService();

// Named exports for individual functions
export const analyzeTransaction = (transactionData: TransactionData): Promise<AnalysisResult> => {
  return aiService.analyzeTransaction(transactionData);
};

export const generateRiskProfile = (customerData: RiskScoreData): Promise<AnalysisResult> => {
  return aiService.generateRiskProfile(customerData);
};

export default AIService;
