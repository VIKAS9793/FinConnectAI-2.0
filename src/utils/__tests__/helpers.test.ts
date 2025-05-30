import { describe, it, expect } from 'vitest';

// Utility function tests
describe('Utility Functions', () => {
  describe('formatCurrency', () => {
    it('should format currency correctly', () => {
      const formatCurrency = (amount: number) => {
        return new Intl.NumberFormat('en-US', {
          style: 'currency',
          currency: 'USD'
        }).format(amount);
      };

      expect(formatCurrency(1234.56)).toBe('$1,234.56');
      expect(formatCurrency(0)).toBe('$0.00');
      expect(formatCurrency(-500)).toBe('-$500.00');
    });
  });

  describe('calculateRiskLevel', () => {
    it('should categorize risk levels correctly', () => {
      const calculateRiskLevel = (score: number): string => {
        if (score < 0.3) return 'Low';
        if (score < 0.7) return 'Medium';
        return 'High';
      };

      expect(calculateRiskLevel(0.1)).toBe('Low');
      expect(calculateRiskLevel(0.5)).toBe('Medium');
      expect(calculateRiskLevel(0.9)).toBe('High');
    });
  });
});
