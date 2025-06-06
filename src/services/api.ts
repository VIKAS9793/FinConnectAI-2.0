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
  amount: number | string;
  currency?: string;
  merchant: string;
  merchantCategory?: string;
  location: string;
  country?: string;
  ipAddress?: string;
  deviceId?: string;
  cardPresent?: boolean;
  isRecurring?: boolean;
  customerId?: string;
  transactionTime?: string;
  transactionId?: string;
  [key: string]: any;
}

export interface TransactionMetadata {
  id?: string;
  timestamp: string;
  processingTimeMs: number;
  version: string;
  model: string;
  environment: 'development' | 'staging' | 'production';
}

export interface TransactionDetails {
  id?: string;
  merchant: string;
  merchantCategory?: string;
  country?: string;
  currency: string;
  amount: number;
  isCardPresent: boolean;
  isRecurring: boolean;
  deviceType?: string;
  ipAddress?: string;
  userAgent?: string;
  billingAddressMatch?: boolean;
  shippingAddressMatch?: boolean;
  previousPurchases?: number;
  daysSinceFirstPurchase?: number;
  transactionType: 'purchase' | 'withdrawal' | 'transfer' | 'payment' | 'other';
  paymentMethod: 'credit_card' | 'debit_card' | 'bank_transfer' | 'digital_wallet' | 'other';
  deviceId?: string;
  customerId?: string;
}

export interface RiskScoreBreakdown {
  amountRisk: number;
  merchantRisk: number;
  locationRisk: number;
  timeRisk: number;
  patternRisk: number;
  velocityRisk: number;
  deviceRisk: number;
  behavioralRisk: number;
}

export interface RiskScoreData {
  customerId: string;
  transactionHistory: any[];
  [key: string]: any;
}

export interface AnalysisResult {
  // Core risk assessment
  riskScore: number;
  riskLevel: 'Low' | 'Medium' | 'High';
  confidence: number;
  riskFactors: string[];
  rulesTriggered: string[];
  
  // Transaction details
  transaction: TransactionDetails;
  
  // Normalized amount information
  normalizedAmount: {
    amount: number;
    currency: string;
    originalAmount: number;
    originalCurrency: string;
    exchangeRate?: number;
  };
  
  // Risk analysis details
  riskBreakdown: RiskScoreBreakdown;
  
  // Transaction history context
  similarTransactions?: {
    count: number;
    amount: number;
    currency: string;
  };
  
  // Human-readable outputs
  explanation: string;
  recommendedAction: string;
  insights: string[];
  
  // Metadata
  metadata: TransactionMetadata;
  
  // Backward compatibility
  isFallback?: boolean;
  [key: string]: any;
}

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api';

const api: AxiosInstance = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to add auth token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      // Create a new config object to avoid mutating the original
      const newConfig = { ...config };
      newConfig.headers = newConfig.headers || {} as AxiosRequestHeaders;
      (newConfig.headers as any).Authorization = `Bearer ${token}`;
      return newConfig;
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
