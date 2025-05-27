import axios, { AxiosInstance, InternalAxiosRequestConfig, AxiosResponse, AxiosError } from 'axios';

interface ErrorResponse {
  message: string;
  status?: number;
  errors?: Record<string, string[]>;
}

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

const API_BASE_URL = process.env.REACT_APP_API_BASE_URL || 'http://localhost:5000/api';

const api: AxiosInstance = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to add auth token
api.interceptors.request.use(
  async (config: InternalAxiosRequestConfig) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers = config.headers || {};
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error: AxiosError) => Promise.reject(error)
);

// Response interceptor for error handling
api.interceptors.response.use(
  (response: AxiosResponse) => response,
  (error: AxiosError<ErrorResponse>) => {
    if (error.response) {
      // The request was made and the server responded with a status code
      // that falls out of the range of 2xx
      console.error('API Error Response:', error.response.data);
      return Promise.reject({
        message: error.response.data?.message || 'An error occurred',
        status: error.response.status,
        errors: error.response.data?.errors,
      });
    } else if (error.request) {
      // The request was made but no response was received
      console.error('API Request Error:', error.request);
      return Promise.reject({
        message: 'No response received from server',
      });
    } else {
      // Something happened in setting up the request that triggered an Error
      console.error('API Error:', error.message);
      return Promise.reject({
        message: error.message || 'An error occurred',
      });
    }
  }
);

// AI Analysis Service
export const analyzeTransaction = async (transactionData: TransactionData): Promise<AnalysisResult> => {
  try {
    const response = await api.post('/analyze/transaction', transactionData);
    return response.data;
  } catch (error) {
    console.error('Error analyzing transaction:', error);
    throw error;
  }
};

// Risk Scoring Service
export const generateRiskScore = async (customerData: RiskScoreData): Promise<AnalysisResult> => {
  try {
    const response = await api.post('/risk/score', customerData);
    return response.data;
  } catch (error) {
    console.error('Error generating risk score:', error);
    throw error;
  }
};

export default {
  analyzeTransaction,
  generateRiskScore,
  // Add other API methods here
};
