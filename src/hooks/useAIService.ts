import { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { generateRiskScore } from '../services/api';
import type { TransactionData, RiskScoreData, AnalysisResult } from '../services/api';

export const useAIService = () => {
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const { getAccessToken } = useAuth();

  const analyzeTransaction = async (
    transactionData: Omit<TransactionData, 'id' | 'status' | 'riskScore' | 'riskLevel'>
  ): Promise<AnalysisResult> => {
    setIsLoading(true);
    setError(null);
    try {
      const token = await getAccessToken();
      localStorage.setItem('token', token);
      
      const result = await generateRiskScore({
        customerId: 'temp-' + Date.now(),
        transactionHistory: [transactionData]
      });

      return result;
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to analyze transaction';
      console.error('Error analyzing transaction:', errorMessage);
      setError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  const getRiskAssessment = async (riskData: RiskScoreData): Promise<AnalysisResult> => {
    setIsLoading(true);
    setError(null);
    try {
      const token = await getAccessToken();
      localStorage.setItem('token', token);
      
      const result = await generateRiskScore(riskData);
      return result;
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to get risk assessment';
      console.error('Error getting risk assessment:', errorMessage);
      setError(errorMessage);

      return {
        riskScore: 0.5,
        riskLevel: 'Medium' as const,
        explanation: 'Using default risk assessment due to server error',
        confidence: 0,
        timestamp: new Date().toISOString(),
        error: errorMessage,
      };
    } finally {
      setIsLoading(false);
    }
  };

  return {
    analyzeTransaction,
    getRiskAssessment,
    isLoading,
    error,
  };
};