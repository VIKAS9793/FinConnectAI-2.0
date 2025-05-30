import axios from 'axios';
import { AnalysisResult, TransactionData, RiskScoreData } from './api';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api';

interface AIServiceResponse {
  risk_score?: number;
  explanation?: string;
  recommendations?: string[];
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
   * Analyzes a transaction for potential fraud
   * @param transactionData Transaction data to analyze
   * @returns Analysis result with risk score and explanation
   */
  async analyzeTransaction(transactionData: TransactionData): Promise<AnalysisResult> {
    try {
      const response = await axios.post<AIServiceResponse>(
        `${this.apiBaseUrl}/analyze`,
        transactionData
      );

      if (!response.data) {
        throw new Error('No data received from API');
      }

      const { risk_score = 0.5, explanation = 'No explanation provided' } = response.data;
      
      return {
        riskScore: risk_score,
        riskLevel: this.calculateRiskLevel(risk_score),
        explanation,
        confidence: 1 - risk_score,
        timestamp: new Date().toISOString(),
      };
    } catch (error) {
      console.error('Error in AI transaction analysis:', error);
      return {
        riskScore: 0.5,
        riskLevel: 'Medium',
        explanation: 'Unable to analyze transaction due to an error',
        confidence: 0,
        timestamp: new Date().toISOString(),
        error: error instanceof Error ? error.message : 'Unknown error occurred',
      };
    }
  }

  /**
   * Generates a risk profile for a customer
   * @param customerData Customer data including transaction history
   * @returns Risk assessment with score and explanation
   */
  async generateRiskProfile(customerData: RiskScoreData): Promise<AnalysisResult> {
    try {
      const response = await axios.post<AIServiceResponse>(
        `${this.apiBaseUrl}/risk-profile`,
        customerData
      );

      if (!response.data) {
        throw new Error('No data received from API');
      }

      const { risk_score = 0.5, explanation = 'No explanation provided' } = response.data;
      
      return {
        riskScore: risk_score,
        riskLevel: this.calculateRiskLevel(risk_score),
        explanation,
        confidence: 1 - risk_score,
        timestamp: new Date().toISOString(),
      };
    } catch (error) {
      console.error('Error in AI risk assessment:', error);
      return {
        riskScore: 0.5,
        riskLevel: 'Medium',
        explanation: 'Unable to generate risk profile due to an error',
        confidence: 0,
        timestamp: new Date().toISOString(),
        error: error instanceof Error ? error.message : 'Unknown error occurred',
      };
    }
  }

  /**
   * Calculates the risk level based on a risk score
   * @param riskScore The risk score from 0 to 1
   * @returns The risk level as 'Low', 'Medium', or 'High'
   */
  private calculateRiskLevel(riskScore: number): 'Low' | 'Medium' | 'High' {
    if (riskScore < 0.3) return 'Low';
    if (riskScore < 0.7) return 'Medium';
    return 'High';
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
