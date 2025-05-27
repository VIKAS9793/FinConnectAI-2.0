import { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';

interface TransactionData {
  amount: number;
  merchant: string;
  location: string;
  [key: string]: any;
}

interface RiskScoreData {
  customerId: string;
  transactionHistory: any[];
  [key: string]: any;
}

export interface AnalysisResult {
  riskScore: number;
  riskLevel: 'Low' | 'Medium' | 'High';
  explanation: string;
  recommendedAction?: string;
  confidence?: number;
  [key: string]: any;
}

export const useAIService = () => {
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const { getAccessToken } = useAuth();

  const analyzeTransaction = async (transactionData: Omit<TransactionData, 'id' | 'status' | 'riskScore' | 'riskLevel'>): Promise<AnalysisResult> => {
    setIsLoading(true);
    setError(null);
    try {
      const token = await getAccessToken();
      const response = await fetch(`${process.env.REACT_APP_API_BASE_URL}/analyze/transaction`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(transactionData)
      });

      if (!response.ok) {
        throw new Error('Failed to analyze transaction');
      }

      return await response.json();
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
      const response = await fetch(`${process.env.REACT_APP_API_BASE_URL}/analyze/risk-score`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(riskData)
      });

      if (!response.ok) {
        throw new Error('Failed to get risk assessment');
      }

      return await response.json();
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to get risk assessment';
      console.error('Error getting risk assessment:', errorMessage);
      setError(errorMessage);
      
      // Return a default risk assessment in case of error
      return {
        riskScore: 0.5,
        riskLevel: 'Medium' as const,
        explanation: 'Using default risk assessment due to server error',
        isFallback: true
      };
    } finally {
      setIsLoading(false);
    }
  };

  return {
    analyzeTransaction,
    getRiskAssessment,
    isLoading,
    error
  };
};
