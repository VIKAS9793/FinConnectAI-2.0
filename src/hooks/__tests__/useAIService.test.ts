import { describe, it, expect, vi, beforeEach, beforeAll, afterAll } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useAIService } from '../useAIService';
import React from 'react';
// Mock the AuthContext
vi.mock('../../contexts/AuthContext', () => ({
  useAuth: () => ({
    login: vi.fn(),
    logout: vi.fn(),
    user: { name: 'Test User' },
    isAuthenticated: true,
    isLoading: false,
    getAccessToken: vi.fn().mockResolvedValue('test-token'),
    mockToken: 'test-token',
  }),
  AuthProvider: ({ children }: { children: React.ReactNode }) => 
    React.createElement('div', null, children),
}));

// Mock the fetch function
const mockFetch = vi.fn();

// Create a test wrapper component with AuthProvider
const createWrapper = () => {
  return function Wrapper({ children }: { children: React.ReactNode }) {
    const { AuthProvider } = require('../../contexts/AuthContext');
    return React.createElement(AuthProvider, null, children);
  };
};

describe('useAIService', () => {
  beforeAll(() => {
    global.fetch = mockFetch;
  });

  beforeEach(() => {
    vi.clearAllMocks();
    mockFetch.mockClear();
  });

  afterAll(() => {
    vi.restoreAllMocks();
  });

  it('should analyze a transaction successfully', async () => {
    const mockResponse = {
      riskScore: 0.5,
      riskLevel: 'Medium' as const,
      explanation: 'Test analysis',
      confidence: 0.8,
    };

    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve(mockResponse)
    } as Response);

    const { result } = renderHook(() => useAIService(), {
      wrapper: createWrapper(),
    });

    const transaction = {
      amount: 100,
      merchant: 'Test Merchant',
      location: 'Online',
      category: 'Food'
    };

    let analysisResult;
    await act(async () => {
      analysisResult = await result.current.analyzeTransaction(transaction);
    });

    expect(analysisResult).toEqual(mockResponse);
    expect(result.current.isLoading).toBe(false);
    expect(result.current.error).toBeNull();
    
    // Verify fetch was called with correct parameters
    expect(mockFetch).toHaveBeenCalledWith(
      expect.stringContaining('/analyze/transaction'),
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': 'Bearer test-token'
        },
        body: JSON.stringify(transaction)
      }
    );
  });

  it('should handle transaction analysis error', async () => {
    const errorMessage = 'Failed to analyze transaction';
    
    mockFetch.mockRejectedValueOnce(new Error(errorMessage));

    const { result } = renderHook(() => useAIService(), {
      wrapper: createWrapper(),
    });

    const transaction = {
      amount: 100,
      merchant: 'Test Merchant',
      location: 'Online',
      category: 'Food'
    };

    await act(async () => {
      try {
        await result.current.analyzeTransaction(transaction);
      } catch (error) {
        expect(error).toBeInstanceOf(Error);
        expect((error as Error).message).toBe(errorMessage);
      }
    });

    expect(result.current.isLoading).toBe(false);
    expect(result.current.error).toBe(errorMessage);
  });

  it('should get risk assessment successfully', async () => {
    const mockResponse = {
      riskScore: 0.3,
      riskLevel: 'Low' as const,
      explanation: 'Low risk profile',
      confidence: 0.9,
    };

    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve(mockResponse)
    } as Response);

    const { result } = renderHook(() => useAIService(), {
      wrapper: createWrapper(),
    });

    const riskData = {
      customerId: '123',
      transactionHistory: [
        { amount: 100, merchant: 'Store 1' },
        { amount: 50, merchant: 'Store 2' },
      ]
    };

    let riskAssessment;
    await act(async () => {
      riskAssessment = await result.current.getRiskAssessment(riskData);
    });

    expect(riskAssessment).toEqual(mockResponse);
    expect(result.current.isLoading).toBe(false);
    expect(result.current.error).toBeNull();
    
    // Verify fetch was called with correct parameters
    expect(mockFetch).toHaveBeenCalledWith(
      expect.stringContaining('/analyze/risk-score'),
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': 'Bearer test-token'
        },
        body: JSON.stringify(riskData)
      }
    );
  });
});
