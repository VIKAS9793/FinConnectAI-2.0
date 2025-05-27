import axios from 'axios';

const API_BASE_URL = process.env.REACT_APP_API_BASE_URL || 'http://localhost:5000/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to add auth token
api.interceptors.request.use(
  async (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// AI Analysis Service
export const analyzeTransaction = async (transactionData) => {
  try {
    const response = await api.post('/analyze/transaction', transactionData);
    return response.data;
  } catch (error) {
    console.error('Error analyzing transaction:', error);
    throw error;
  }
};

// Risk Scoring Service
export const generateRiskScore = async (customerData) => {
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
