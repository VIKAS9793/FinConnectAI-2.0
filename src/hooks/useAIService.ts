/**
 * @file useAIService.ts
 * @description AIService hook for transaction analysis with fraud detection capabilities.
 * 
 * IMPORTANT: This is a MOCK IMPLEMENTATION for demonstration and testing purposes.
 * The risk scoring and analysis are simulated and should not be used in production.
 * 
 * For production use, replace the mock implementation with real API calls to a fraud detection service.
 * 
 * Production Implementation Requirements:
 * 1. Replace mockAnalyzeTransaction with actual API calls to a fraud detection service like:
 *    - Sift Science
 *    - Kount
 *    - Forter
 *    - Signifyd
 *    - Or a custom machine learning model
 * 
 * 2. Required Environment Variables for Production:
 *    - REACT_APP_FRAUD_API_KEY: Your fraud detection service API key
 *    - REACT_APP_FRAUD_API_URL: Base URL for the fraud detection API
 *    - NODE_ENV: Set to 'production' in production environments
 * 
 * 3. Real Implementation Notes:
 *    - Implement proper error handling and retry logic
 *    - Add request/response validation
 *    - Consider implementing client-side caching for performance
 *    - Add proper logging and monitoring
 *    - Ensure compliance with data protection regulations (GDPR, CCPA, etc.)
 * 
 * Mock Implementation Details:
 * - Uses simulated risk scoring based on transaction patterns
 * - Includes example risk indicators and patterns
 * - Provides realistic-looking but synthetic analysis results
 */

import { useState } from 'react';

// ISO 4217 currency codes with their decimal places
const CURRENCY_DECIMALS: Record<string, number> = {
  USD: 2, EUR: 2, GBP: 2, JPY: 0, AUD: 2, 
  CAD: 2, CHF: 2, CNY: 2, HKD: 2, SGD: 2,
  // Add more currencies as needed
};

// Exchange rates (simplified for demo - in real app, use a live API)
const EXCHANGE_RATES: Record<string, number> = {
  USD: 1,      // Base currency
  EUR: 0.92,   // Example rates
  GBP: 0.79,
  JPY: 151.23,
  INR: 83.45,
  AUD: 1.51,
  // Add more currencies as needed
};

export interface TransactionData {
  amount: number | string;
  currency?: string;  // ISO 4217 currency code (e.g., 'USD', 'EUR')
  merchant: string;
  merchantCategory?: string;  // MCC (Merchant Category Code)
  location: string;
  country?: string;   // ISO 3166-1 alpha-2 country code
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

interface TransactionDetails {
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

interface RiskScoreBreakdown {
  amountRisk: number;
  merchantRisk: number;
  locationRisk: number;
  timeRisk: number;
  patternRisk: number;
  velocityRisk: number;
  deviceRisk: number;
  behavioralRisk: number;
}

interface AnalysisResult {
  // Core risk assessment
  riskScore: number;
  riskLevel: 'Low' | 'Medium' | 'High';
  confidence: number;
  riskFactors: string[];
  rulesTriggered: string[];
  
  // Transaction details
  transaction: TransactionDetails;
  normalizedAmount: {
    amount: number;
    currency: string;
    originalAmount: number;
    originalCurrency: string;
    exchangeRate?: number;
  };
  
  // Detailed analysis
  riskBreakdown: RiskScoreBreakdown;
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

/**
 * Mock risk indicators used for demonstration purposes
 * 
 * In a production environment, these would be replaced with:
 * 1. Real-time risk scoring from a fraud detection service
 * 2. Machine learning models trained on historical transaction data
 * 3. Business rules specific to your organization's risk tolerance
 * 
 * The current implementation uses simplified scoring for demonstration only.
 */
const RISK_INDICATORS = {
  // Merchant categories (expanded list)
  MERCHANT_CATEGORIES: {
    HIGH_RISK: [
      'gambling', 'casino', 'crypto', 'forex', 'offshore', 'adult',
      'prepaid cards', 'wire transfer', 'high-risk investments', 'pawn shops',
      'money transfer', 'virtual currency', 'binary options', 'crowdfunding'
    ],
    MEDIUM_RISK: [
      'jewelry', 'electronics', 'luxury goods', 'travel', 'auctions',
      'tobacco', 'firearms', 'alcohol', 'pharmaceuticals'
    ]
  },
  
  // Geographic risk indicators
  COUNTRIES: {
    HIGH_RISK: [
      'KP', 'IR', 'SY', 'CU', 'SD', 'VE', 'MM', 'CF', 'LY', 'SO', 'YE', 'ZW'
    ],
    MEDIUM_RISK: [
      'AF', 'IQ', 'PK', 'LR', 'SS', 'CD', 'ER', 'ET', 'NG', 'UA'
    ],
    // Tax havens
    TAX_HAVENS: [
      'VG', 'KY', 'BM', 'PA', 'MC', 'LI', 'AD', 'SM', 'MT', 'CY', 'LU', 'CH', 'SG', 'HK', 'AE'
    ]
  },
  
  // Transaction patterns
  PATTERNS: {
    ROUND_NUMBERS: [100, 500, 1000, 5000, 10000],
    TEST_AMOUNTS: [0.01, 0.1, 1, 10, 100, 1000]
  },
  
  // Time-based patterns (in hours, local time)
  TIME_WINDOWS: {
    UNUSUAL_HOURS: [0, 1, 2, 3, 4, 5],  // Midnight to 5 AM
    PEAK_HOURS: [10, 11, 12, 13, 17, 18, 19]  // Common shopping/meal times
  },
  
  // Velocity patterns (transactions per time period)
  VELOCITY: {
    HIGH_RISK: 10,    // Transactions per hour
    MEDIUM_RISK: 5,   // Transactions per hour
  },
  
  // Amount thresholds (in USD)
  AMOUNTS: {
    HIGH_RISK: 10000,
    MEDIUM_RISK: 5000,
    MICRO_PAYMENT: 1,
    LARGE_PAYMENT: 50000
  }
};

// Known fraud patterns and rules
const FRAUD_PATTERNS = [
  // Common fraud patterns
  {
    name: 'Micro-transactions before large',
    check: (tx: any, history: any[]) => {
      const recentMicro = history.filter(t => 
        t.amount < RISK_INDICATORS.AMOUNTS.MICRO_PAYMENT && 
        new Date(t.timestamp) > new Date(Date.now() - 3600000) // Last hour
      );
      return recentMicro.length > 0 && tx.amount > RISK_INDICATORS.AMOUNTS.HIGH_RISK;
    },
    risk: 0.4,
    message: 'Multiple micro-transactions followed by a large transaction'
  },
  {
    name: 'Rapid international transactions',
    check: (tx: any, history: any[]) => {
      if (!tx.country) return false;
      const lastHour = history.filter(t => 
        new Date(t.timestamp) > new Date(Date.now() - 3600000) &&
        t.country && t.country !== tx.country
      );
      return lastHour.length >= 3;
    },
    risk: 0.5,
    message: 'Multiple transactions from different countries within a short period'
  },
  // Add more patterns as needed
];

// Helper functions
const normalizeAmount = (amount: number | string, currency: string = 'USD'): number => {
  const numAmount = typeof amount === 'string' 
    ? parseFloat(amount.replace(/[^0-9.-]+/g, '')) || 0 
    : amount;
    
  // If currency is not USD, convert to USD using exchange rates
  if (currency !== 'USD' && EXCHANGE_RATES[currency]) {
    return parseFloat((numAmount / EXCHANGE_RATES[currency]).toFixed(2));
  }
  return numAmount;
};

const getCurrencyDecimals = (currency: string = 'USD'): number => {
  return CURRENCY_DECIMALS[currency.toUpperCase()] || 2;
};

const formatCurrency = (amount: number, currency: string = 'USD'): string => {
  const decimals = getCurrencyDecimals(currency);
  const formatter = new Intl.NumberFormat(undefined, {
    style: 'currency',
    currency: currency || 'USD',
    minimumFractionDigits: 0,
    maximumFractionDigits: decimals
  });
  return formatter.format(amount);
};

// Helper function to get currency for country (simplified)
const getCurrencyForCountry = (countryCode: string): string | null => {
  const countryToCurrency: Record<string, string> = {
    US: 'USD',
    GB: 'GBP',
    JP: 'JPY',
    IN: 'INR',
    CA: 'CAD',
    AU: 'AUD',
    EU: 'EUR',
    // Add more country-currency mappings as needed
  };
  return countryToCurrency[countryCode] || null;
};

/**
 * Generates a unique transaction ID for mock data
 * 
 * In production, this would typically be handled by your backend system
 * and follow your organization's ID generation strategy.
 */
const generateTransactionId = () => {
  return `txn_${Date.now()}_${Math.floor(Math.random() * 10000)}`;
};

// Helper function to get merchant context
const getMerchantContext = (merchant: string) => {
  const highRiskMerchants = ['casino', 'crypto', 'forex', 'gambling', 'prepaid cards'];
  const mediumRiskMerchants = ['electronics', 'jewelry', 'travel', 'wire transfer'];
  
  const merchantLower = merchant.toLowerCase();
  if (highRiskMerchants.some(m => merchantLower.includes(m))) {
    return 'This merchant is categorized as high-risk due to higher instances of fraudulent activity in this sector.';
  }
  if (mediumRiskMerchants.some(m => merchantLower.includes(m))) {
    return 'This merchant operates in a sector that experiences moderate levels of fraudulent activity.';
  }
  return 'This merchant is considered low risk based on historical transaction data.';
};

/**
 * MOCK IMPLEMENTATION - Simulates transaction analysis for demonstration purposes
 * 
 * WARNING: This is a simulated implementation. In production, replace with actual API calls
 * to a fraud detection service.
 * 
 * Example production implementation would look like:
 * 
 * const analyzeTransaction = async (transaction: TransactionData): Promise<AnalysisResult> => {
 *   try {
 *     const response = await fetch(`${process.env.REACT_APP_FRAUD_API_URL}/analyze`, {
 *       method: 'POST',
 *       headers: {
 *         'Content-Type': 'application/json',
 *         'Authorization': `Bearer ${process.env.REACT_APP_FRAUD_API_KEY}`
 *       },
 *       body: JSON.stringify(transaction)
 *     });
 *     
 *     if (!response.ok) {
 *       throw new Error(`API request failed with status ${response.status}`);
 *     }
 *     
 *     return await response.json();
 *   } catch (error) {
 *     console.error('Error analyzing transaction:', error);
 *     // Return a fallback result with error information
 *     return {
 *       riskScore: 0.5,
 *       riskLevel: 'Medium',
 *       confidence: 0,
 *       riskFactors: ['Error during analysis'],
 *       // ... other required fields
 *     };
 *   }
 * };
 */
const mockAnalyzeTransaction = (transaction: Partial<TransactionData>): AnalysisResult => {
  const startTime = performance.now();
  
  // Process and validate input data
  const amount = normalizeAmount(transaction.amount || 0, transaction.currency);
  const merchant = (transaction.merchant || 'Unknown Merchant').trim();
  const country = (transaction.country || '').toUpperCase();
  const currency = (transaction.currency || 'USD').toUpperCase();
  const transactionId = transaction.transactionId?.toString() || generateTransactionId();
  const amountUSD = currency === 'USD' ? amount : normalizeAmount(amount, currency);
  
  // Initialize risk factors and rules
  const riskFactors: string[] = [];
  const rulesTriggered: string[] = [];
  let riskScore = 0.0;
  
  // Initialize risk breakdown with default values
  const riskBreakdown: RiskScoreBreakdown = {
    amountRisk: 0,
    merchantRisk: 0,
    locationRisk: 0,
    timeRisk: 0,
    patternRisk: 0,
    velocityRisk: 0,
    deviceRisk: 0,
    behavioralRisk: 0
  };
  
  // 1. Amount-based risk assessment
  if (amountUSD > 50000) {
    riskBreakdown.amountRisk = 0.8;
    riskScore += 0.8;
    riskFactors.push(`Very large transaction amount (${formatCurrency(amount, currency)})`);
    rulesTriggered.push('LARGE_AMOUNT');
  } else if (amountUSD > 10000) {
    riskBreakdown.amountRisk = 0.6;
    riskScore += 0.6;
    riskFactors.push(`High transaction amount (${formatCurrency(amount, currency)})`);
    rulesTriggered.push('HIGH_AMOUNT');
  } else if (amountUSD < 1) {
    riskBreakdown.amountRisk = 0.5;
    riskScore += 0.5;
    riskFactors.push('Micro-transaction (potential card testing)');
    rulesTriggered.push('MICRO_TRANSACTION');
  } else {
    riskBreakdown.amountRisk = 0.1;
    riskScore += 0.1;
  }
  
  // 2. Merchant-based risk assessment
  const merchantLower = merchant.toLowerCase();
  const isHighRiskMerchant = RISK_INDICATORS.MERCHANT_CATEGORIES.HIGH_RISK.some(
    (cat: string) => merchantLower.includes(cat.toLowerCase())
  );
  
  const isMediumRiskMerchant = RISK_INDICATORS.MERCHANT_CATEGORIES.MEDIUM_RISK.some(
    (cat: string) => merchantLower.includes(cat.toLowerCase())
  );
  
  if (isHighRiskMerchant) {
    riskBreakdown.merchantRisk = 0.5;
    riskScore += 0.5;
    riskFactors.push(`High-risk merchant category: ${merchant}`);
    rulesTriggered.push('HIGH_RISK_MERCHANT');
  } else if (isMediumRiskMerchant) {
    riskBreakdown.merchantRisk = 0.3;
    riskScore += 0.3;
    riskFactors.push(`Medium-risk merchant category: ${merchant}`);
    rulesTriggered.push('MEDIUM_RISK_MERCHANT');
  } else {
    riskBreakdown.merchantRisk = 0.1;
  }
  
  // 3. Geographic risk assessment
  if (country) {
    if (RISK_INDICATORS.COUNTRIES.HIGH_RISK.includes(country)) {
      riskBreakdown.locationRisk = 0.6;
      riskScore += 0.6;
      riskFactors.push(`High-risk country: ${country}`);
      rulesTriggered.push('HIGH_RISK_COUNTRY');
    } else if (RISK_INDICATORS.COUNTRIES.MEDIUM_RISK.includes(country)) {
      riskBreakdown.locationRisk = 0.3;
      riskScore += 0.3;
      riskFactors.push(`Medium-risk country: ${country}`);
      rulesTriggered.push('MEDIUM_RISK_COUNTRY');
    } else {
      riskBreakdown.locationRisk = 0.1;
    }
    
    // Check for country-currency mismatch
    const expectedCurrency = getCurrencyForCountry(country);
    if (expectedCurrency && currency !== expectedCurrency && !['USD', 'EUR', 'GBP'].includes(currency)) {
      riskScore += 0.2;
      riskFactors.push(`Unusual currency ${currency} for country ${country}`);
      rulesTriggered.push('CURRENCY_MISMATCH');
    }
  }
  
  // 4. Time-based patterns (simplified for demo)
  const now = new Date();
  const hour = now.getHours();
  if (RISK_INDICATORS.TIME_WINDOWS.UNUSUAL_HOURS.includes(hour)) {
    riskBreakdown.timeRisk = 0.3;
    riskScore += 0.3;
    riskFactors.push(`Unusual transaction time (${hour}:00 local time)`);
    rulesTriggered.push('UNUSUAL_TIME');
  } else {
    riskBreakdown.timeRisk = 0.1;
  }
  
  // 5. Transaction patterns
  // Check for round number amounts
  if (RISK_INDICATORS.PATTERNS.ROUND_NUMBERS.includes(amount)) {
    riskBreakdown.patternRisk = 0.2;
    riskScore += 0.2;
    riskFactors.push('Round number transaction amount (common in test transactions)');
    rulesTriggered.push('ROUND_NUMBER');
  } else {
    riskBreakdown.patternRisk = 0.1;
  }
  
  // 6. Card-present vs. card-not-present
  if (transaction.cardPresent === false) {
    riskBreakdown.deviceRisk = 0.15;
    riskScore += 0.15; // Card-not-present transactions are generally higher risk
    rulesTriggered.push('CARD_NOT_PRESENT');
  } else {
    riskBreakdown.deviceRisk = 0.05;
  }
  
  // 7. Check against known fraud patterns
  const transactionContext = {
    amount: amountUSD,
    currency,
    merchant,
    country,
    timestamp: now.toISOString(),
    isCardPresent: transaction.cardPresent || false
  };
  
  FRAUD_PATTERNS.forEach(pattern => {
    if (pattern.check(transactionContext, [])) { // Empty array as mock history
      riskScore += pattern.risk;
      riskFactors.push(pattern.message);
      rulesTriggered.push(pattern.name.toUpperCase().replace(/\s+/g, '_'));
    }
  });
  
  // Ensure risk score doesn't exceed 1.0
  const finalRiskScore = Math.min(riskScore, 1.0);
  
  // Determine risk level based on final score
  const riskLevel: 'Low' | 'Medium' | 'High' = 
    finalRiskScore >= 0.7 ? 'High' : 
    finalRiskScore >= 0.4 ? 'Medium' : 'Low';
  
  const confidence = Math.max(0.7, 0.95 - (finalRiskScore * 0.3));
  
  // Generate explanation
  const explanation = `## Transaction Analysis Complete\n\n` +
    `This transaction has been analyzed using our comprehensive fraud detection system. ` +
    `The system evaluated multiple risk factors including transaction amount, merchant category, ` +
    `geographic location, timing patterns, and transaction behavior.\n\n` +
    `**Risk Assessment:** ${riskLevel} (${(finalRiskScore * 100).toFixed(1)}%)\n` +
    `**Confidence Level:** ${(confidence * 100).toFixed(1)}%\n\n` +
    `${getMerchantContext(merchant)}\n\n` +
    `**Key Risk Factors Identified:**\n` +
    (riskFactors.length > 0 ? riskFactors.map(factor => `• ${factor}`).join('\n') : '• No significant risk factors identified');
  
  // Generate risk-based recommendation
  let recommendedAction: string;
  
  if (riskLevel === 'High') {
    recommendedAction = `**High Risk Transaction Detected**\n\n` +
      `Our advanced fraud detection system has identified several high-risk indicators. ` +
      `Immediate action is required:\n\n` +
      `• Place a temporary hold on the transaction for verification\n` +
      `• Contact the cardholder through verified channels\n` +
      `• Review recent account activity for suspicious patterns\n` +
      `• Consider implementing additional security measures\n` +
      `• Document all actions for compliance purposes`;
  } else if (riskLevel === 'Medium') {
    recommendedAction = `**Moderate Risk Transaction**\n\n` +
      `This transaction requires additional review due to certain risk indicators:\n\n` +
      `• Initiate secondary authentication\n` +
      `• Monitor account for similar patterns in next 48 hours\n` +
      `• Consider step-up authentication for future transactions\n` +
      `• Review transaction history for context\n` +
      `• Document review process and decision`;
  } else {
    recommendedAction = `**Standard Processing Approved**\n\n` +
      `This transaction appears to be low risk and aligns with expected patterns:\n\n` +
      `• Proceed with standard monitoring procedures\n` +
      `• No additional verification required\n` +
      `• Continue routine monitoring for unusual patterns\n` +
      `• Document transaction for record-keeping`;
  }
  
  // Generate insights
  const insights = [
    `Transaction classified as ${riskLevel.toLowerCase()} risk`,
    `Confidence score: ${(confidence * 100).toFixed(1)}%`,
    `Transaction amount: ${formatCurrency(amount, currency)}`,
    `Merchant: ${merchant}`,
    `Location: ${country || 'Unknown'}`,
    `Processing time: ${(performance.now() - startTime).toFixed(2)}ms`
  ];
  
  // Return the complete analysis result
  const result: AnalysisResult = {
    // Core risk assessment
    riskScore: finalRiskScore,
    riskLevel,
    confidence,
    riskFactors,
    rulesTriggered,
    
    // Transaction details
    transaction: {
      id: transactionId,
      merchant,
      merchantCategory: transaction.merchantCategory || '',
      country: country || '',
      currency,
      amount,
      isCardPresent: transaction.cardPresent || false,
      isRecurring: transaction.isRecurring || false,
      deviceType: transaction.deviceId ? 'mobile' : 'desktop',
      ipAddress: transaction.ipAddress || '',
      userAgent: 'Unknown',
      billingAddressMatch: true,
      shippingAddressMatch: true,
      previousPurchases: 0,
      daysSinceFirstPurchase: 0,
      transactionType: transaction.merchantCategory?.toLowerCase().includes('atm') ? 'withdrawal' : 'purchase',
      paymentMethod: transaction.cardPresent ? 'credit_card' : 'digital_wallet',
      deviceId: transaction.deviceId,
      customerId: transaction.customerId
    },
    
    // Normalized amount information
    normalizedAmount: {
      amount: amountUSD,
      currency: 'USD',
      originalAmount: amount,
      originalCurrency: currency,
      exchangeRate: currency === 'USD' ? 1.0 : EXCHANGE_RATES[currency] || 0.85
    },
    
    // Risk analysis details
    riskBreakdown,
    similarTransactions: {
      count: Math.floor(Math.random() * 10),
      amount: Math.floor(amount * (0.5 + Math.random())),
      currency: currency
    },
    
    // Human-readable outputs
    explanation,
    recommendedAction,
    insights,
    
    // Metadata
    metadata: {
      id: transactionId,
      timestamp: new Date().toISOString(),
      processingTimeMs: performance.now() - startTime,
      version: '1.0.0',
      model: 'fraud-detection-v2',
      environment: (typeof process !== 'undefined' && process.env?.NODE_ENV === 'production') ? 'production' : 'development'
    }
  };
  
  return result;
};

/**
 * useAIService Hook
 * 
 * Provides transaction analysis functionality with mock implementation.
 * 
 * @example
 * // Basic usage
 * const { analyzeTransaction, isLoading, error } = useAIService();
 * 
 * // In your component:
 * const handleTransaction = async (transactionData) => {
 *   const result = await analyzeTransaction(transactionData);
 *   // Handle analysis result
 * };
 * 
 * @returns {Object} Hook methods and state
 * @property {Function} analyzeTransaction - Analyzes a transaction for fraud risk
 * @property {boolean} isLoading - Loading state of the analysis
 * @property {Error|null} error - Error object if analysis fails
 */
export const useAIService = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  /**
   * Analyzes a transaction for potential fraud risk
   * 
   * @param {Partial<TransactionData>} transaction - The transaction data to analyze
   * @returns {Promise<AnalysisResult>} Analysis result with risk assessment
   * 
   * @example
   * const result = await analyzeTransaction({
   *   amount: 150.75,
   *   currency: 'USD',
   *   merchant: 'Example Store',
   *   cardPresent: false
   * });
   */
  const analyzeTransaction = async (transaction: Partial<TransactionData>): Promise<AnalysisResult> => {
    setIsLoading(true);
    setError(null);

    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 500));
      
      // Use the mock analysis function
      return mockAnalyzeTransaction(transaction);
    } catch (err) {
      const error = err instanceof Error ? err : new Error('An unknown error occurred');
      setError(error);
      const timestamp = new Date().toISOString();
      const errorId = `err_${Date.now()}_${Math.floor(Math.random() * 1000)}`;
      
      // Return a complete fallback result that matches AnalysisResult
      return {
        // Core risk assessment
        riskScore: 0.5,
        riskLevel: 'Medium',
        confidence: 0.7,
        riskFactors: ['Analysis error occurred'],
        rulesTriggered: ['ERROR_OCCURRED'],
        
        // Transaction details
        transaction: {
          id: errorId,
          merchant: 'Unknown',
          currency: 'USD',
          amount: 0,
          isCardPresent: false,
          isRecurring: false,
          transactionType: 'other',
          paymentMethod: 'other'
        },
        
        // Normalized amount information
        normalizedAmount: {
          amount: 0,
          currency: 'USD',
          originalAmount: 0,
          originalCurrency: 'USD',
          exchangeRate: 1.0
        },
        
        // Risk analysis details
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
        
        // Transaction history context
        similarTransactions: {
          count: 0,
          amount: 0,
          currency: 'USD'
        },
        
        // Human-readable outputs
        explanation: `## Transaction Analysis Interrupted\n\nWe encountered an issue while processing this transaction analysis. The specific error reported was: ${error.message}`,
        recommendedAction: `We apologize for the inconvenience. For assistance, please contact our support team and reference error ID: ${errorId}. Our team will investigate this matter promptly.`,
        insights: [
          'The transaction analysis could not be completed due to a system error',
          'Our technical team has been notified of this issue',
          'We recommend attempting the analysis again or contacting support if the issue persists'
        ],
        
        // Metadata
        metadata: {
          id: errorId,
          timestamp,
          processingTimeMs: 0,
          version: '1.0.0',
          model: 'error-fallback',
          environment: (typeof process !== 'undefined' && process.env?.NODE_ENV === 'production') ? 'production' : 'development'
        },
        
        // Backward compatibility
        isFallback: true
      };
    } finally {
      setIsLoading(false);
    }
  };

  return {
    analyzeTransaction,
    isLoading,
    error
  };
};

// Example Environment Variables for Production
/*
# .env.production
REACT_APP_FRAUD_API_URL=https://api.fraud-service.com/v1
REACT_APP_FRAUD_API_KEY=your_api_key_here
NODE_ENV=production
*/

// Example Production Implementation Skeleton
/*
async function analyzeTransaction(transaction: TransactionData): Promise<AnalysisResult> {
  // 1. Validate input
  // 2. Call fraud detection API
  // 3. Transform API response to AnalysisResult
  // 4. Handle errors and edge cases
  // 5. Return standardized result
}
*/
