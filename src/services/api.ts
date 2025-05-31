import axios, {
  AxiosInstance,
  AxiosResponse,
  AxiosError,
  AxiosRequestHeaders
} from 'axios';

interface ErrorResponse {
  message: string;
  status?: number;
  errors?: Record<string, string[]>;
}

export interface TransactionData {
  amount: number;
  merchant: string;
  location: string;
  [key: string]: any;
}

export interface RiskScoreData {
  customerId: string;
  transactionHistory: any[];
  [key: string]: any;
}

export interface AnalysisResult {
  riskScore: number;
  riskLevel: 'Low' | 'Medium' | 'High';
  explanation: string;
  confidence: number;
  timestamp: string;
  error?: string;
  transactionId?: string;
  customerId?: string;
  recommendedAction?: string;
  [key: string]: any;
}

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3001/api';

const api: AxiosInstance = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 10000,
  validateStatus: (status) => status >= 200 && status < 500,
});

api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      const newConfig = { ...config };
      newConfig.headers = newConfig.headers || {} as AxiosRequestHeaders;
      (newConfig.headers as any).Authorization = `Bearer ${token}`;
      return newConfig;
    }
    return config;
  },
  (error: AxiosError) => Promise.reject(error)
);

api.interceptors.response.use(
  (response: AxiosResponse) => response,
  (error: AxiosError<ErrorResponse>) => {
    if (error.response) {
      console.error('API Error Response:', error.response.data);
      return Promise.reject({
        message: error.response.data?.message || 'An error occurred',
        status: error.response.status,
        errors: error.response.data?.errors,
      });
    } else if (error.request) {
      console.error('API Request Error:', error.request);
      return Promise.reject({
        message: 'No response received from server. Please check your connection.',
      });
    } else {
      console.error('API Error:', error.message);
      return Promise.reject({
        message: error.message || 'An error occurred while processing your request',
      });
    }
  }
);

export const analyzeTransaction = async (
  transactionData: TransactionData
): Promise<AnalysisResult> => {
  try {
    const response = await api.post('/analyze/transaction', transactionData);
    return response.data;
  } catch (error) {
    console.error('Error analyzing transaction:', error);
    throw error;
  }
};

export const generateRiskScore = async (customerData: RiskScoreData): Promise<AnalysisResult> => {
  try {
    const response = await api.post('/analyze/risk-score', customerData);
    return response.data;
  } catch (error) {
    console.error('Error generating risk score:', error);
    throw error;
  }
};

export default {
  analyzeTransaction,
  generateRiskScore,
};