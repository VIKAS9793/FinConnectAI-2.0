import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import '@testing-library/jest-dom';
import StatsCard from '../StatsCard';

// Mock the icon component
const MockIcon = (): JSX.Element => <div data-testid="mock-icon" />;

describe('StatsCard', () => {
  it('renders stats card with correct data', () => {
    const mockProps = {
      title: 'Total Transactions',
      value: '1,234',
      icon: <MockIcon />,
      change: {
        value: 12,
        isPositive: true
      }
    };

    render(<StatsCard {...mockProps} />);
    
    expect(screen.getByText('Total Transactions')).toBeInTheDocument();
    expect(screen.getByText('1,234')).toBeInTheDocument();
    expect(screen.getByText('+12%')).toBeInTheDocument();
  });

  it('handles negative change values', () => {
    const mockProps = {
      title: 'Risk Score',
      value: '85',
      icon: <MockIcon />,
      change: {
        value: 5,
        isPositive: false
      }
    };

    render(<StatsCard {...mockProps} />);
    
    expect(screen.getByText('-5%')).toBeInTheDocument();
  });
});
