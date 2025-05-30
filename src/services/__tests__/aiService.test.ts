import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { analyzeTransaction, generateRiskProfile } from '../aiService';
import axios from 'axios';
import type { TransactionData, RiskScoreData } from '../api';

// Mock axios
vi.mock('axios', () => {
  const mockAxios = {
    create: vi.fn(() => ({
      post: vi.fn(),
    })),
  };
  return {
    ...mockAxios,
    default: mockAxios,
  };
});

describe('AI Service', () => {
  let mockPost: ReturnType<typeof vi.fn>;
  
  // Test data
  const mockTransaction: TransactionData = {
    amount: 1000,
    currency: 'USD',
    merchant: 'Test Merchant',
    category: 'Electronics',
    location: 'Online',
    timestamp: new Date().toISOString(),
  };

  const mockRiskProfile: RiskScoreData = {
    customerId: '123',
    creditScore: 750,
    kycStatus: 'verified',
    transactionHistory: [{
      amount: 1000,
      currency: 'USD',
      merchant: 'Test Merchant',
      category: 'Electronics',
      location: 'Online',
      timestamp: new Date().toISOString(),
    }],
  };
  
  beforeEach(() => {
    // Reset all mocks before each test
    vi.clearAllMocks();
    
    // Create a new mock for each test
    mockPost = vi.fn();
    
    // Mock the axios instance
    (axios.create as ReturnType<typeof vi.fn>).mockReturnValue({
      post: mockPost,
    });
    
    // Default mock implementation for successful responses
    mockPost.mockResolvedValue({
      data: {
        risk_score: 0.5,
        explanation: 'Test explanation',
        recommendations: []
      },
      status: 200,
      statusText: 'OK',
      headers: {},
      config: { headers: {} },
    });
  });
  
  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('analyzeTransaction', () => {
    it('should analyze a transaction successfully', async () => {
      // Arrange
      const mockResponse = {
        risk_score: 0.5,
        explanation: 'Medium risk transaction',
        recommendations: ['No specific recommendations']
      };
      
      mockPost.mockResolvedValueOnce({ data: mockResponse });

      // Act
      const result = await analyzeTransaction(mockTransaction);

      // Assert
      expect(result).toMatchObject({
        riskScore: 0.5,
        riskLevel: 'Medium',
        explanation: 'Medium risk transaction',
        confidence: 0.5,
        timestamp: expect.any(String),
      });

      // Verify API call
      expect(mockPost).toHaveBeenCalledWith(
        expect.stringContaining('/analyze'),
        mockTransaction
      );
    });

    it('should handle API errors gracefully', async () => {
      // Arrange
      const error = new Error('Test error');
      const consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
      
      mockPost.mockRejectedValueOnce(error);

      // Act
      const result = await analyzeTransaction(mockTransaction);

      // Assert
      expect(result).toMatchObject({
        riskScore: 0.5,
        riskLevel: 'Medium',
        explanation: 'Unable to analyze transaction due to an error',
        confidence: 0,
        timestamp: expect.any(String),
        error: expect.any(String)
      });
      
      expect(consoleErrorSpy).toHaveBeenCalledWith(
        'Error in AI transaction analysis:',
        expect.any(Error)
      );

      // Cleanup
      consoleErrorSpy.mockRestore();
    });
  });

  describe('generateRiskProfile', () => {
    it('should generate a risk profile successfully', async () => {
      // Arrange
      const mockResponse = {
        risk_score: 0.3,
        explanation: 'Low risk profile',
        recommendations: ['Continue good spending habits']
      };
      
      mockPost.mockResolvedValueOnce({ data: mockResponse });

      // Act
      const result = await generateRiskProfile(mockRiskProfile);

      // Assert
      expect(mockPost).toHaveBeenCalledWith(
        expect.stringContaining('/risk-profile'),
        mockRiskProfile
      );

      expect(result).toMatchObject({
        riskScore: 0.3,
        riskLevel: 'Low',
        explanation: 'Low risk profile',
        confidence: 0.7,
        timestamp: expect.any(String),
      });
    });

    it('should handle network errors when generating risk profile', async () => {
      // Arrange
      const error = new Error('Network error');
      mockPost.mockRejectedValueOnce(error);
      const consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});

      // Act
      const result = await generateRiskProfile(mockRiskProfile);

      // Assert
      expect(result).toMatchObject({
        riskScore: 0.5,
        riskLevel: 'Medium',
        explanation: 'Unable to generate risk profile due to an error',
        confidence: 0,
        timestamp: expect.any(String),
        error: expect.any(String)
      });
      
      expect(consoleErrorSpy).toHaveBeenCalledWith(
        'Error in AI risk assessment:',
        expect.any(Error)
      );

      // Cleanup
      consoleErrorSpy.mockRestore();
    });
  });
});
