import { FC, useState, useEffect, FormEvent, ChangeEvent, useCallback } from 'react';
import { useAIService } from '../hooks/useAIService';

// Types
export interface TransactionInput {
  amount: string;
  merchant: string;
  location: string;
}

export interface Transaction extends TransactionInput {
  id: number;
  date: string;
  status?: string;
  riskScore?: number;
  riskLevel?: 'High' | 'Medium' | 'Low';
}

export interface AnalysisResult {
  riskScore: number;
  riskLevel: 'High' | 'Medium' | 'Low';
  explanation: string;
  timestamp?: string;
  recommendedAction?: string;
  confidence?: number;
}

interface TransactionAnalyzerProps {
  onAnalysisComplete?: (result: AnalysisResult) => void;
  className?: string;
  initialTransaction?: Partial<TransactionInput>;
  showHistory?: boolean;
  transactions?: Transaction[];
}

const TransactionAnalyzer: FC<TransactionAnalyzerProps> = ({
  onAnalysisComplete = () => {},
  className = '',
  initialTransaction = { amount: '', merchant: '', location: '' },
  showHistory = true,
}) => {
  // State
  const [transaction, setTransaction] = useState<TransactionInput>({
    amount: initialTransaction.amount || '',
    merchant: initialTransaction.merchant || '',
    location: initialTransaction.location || '',
  });

  const { analyzeTransaction, isLoading } = useAIService();
  const [analysisResult, setAnalysisResult] = useState<AnalysisResult | null>(null);
  const [showAnalysisResults, setShowAnalysisResults] = useState(false);
  const [transactionHistory, setTransactionHistory] = useState<Transaction[]>([]);
  const [error, setError] = useState<string | null>(null);

  // Handlers
  const handleSubmit = useCallback(
    async (e: FormEvent) => {
      e.preventDefault();
      if (isLoading) return;
      setError(null);

      try {
        const result = await analyzeTransaction(transaction);
        setAnalysisResult(result);
        onAnalysisComplete(result);
        setShowAnalysisResults(true);

        // Add to history
        setTransactionHistory((prev) => [
          {
            ...transaction,
            id: Date.now(),
            date: new Date().toISOString(),
            riskScore: result.riskScore,
            riskLevel: result.riskLevel,
          },
          ...prev,
        ]);
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'Failed to analyze transaction';
        setError(errorMessage);
        console.error('Analysis failed:', errorMessage);
      }
    },
    [transaction, analyzeTransaction, isLoading, onAnalysisComplete]
  );

  const handleInputChange = (e: ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setTransaction((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleNewAnalysis = () => {
    setShowAnalysisResults(false);
    setError(null);
  };

  // Load sample transaction history for demo purposes
  useEffect(() => {
    if (!showHistory) return;

    const history: Transaction[] = [
      {
        id: 1,
        amount: '150.75',
        merchant: 'Grocery Store',
        location: 'New York, NY',
        date: '2023-05-15',
        status: 'Completed',
        riskScore: 15,
        riskLevel: 'Low',
      },
      {
        id: 2,
        amount: '45.20',
        merchant: 'Coffee Shop',
        location: 'Brooklyn, NY',
        date: '2023-05-14',
        status: 'Completed',
        riskScore: 35,
        riskLevel: 'Medium',
      },
      {
        id: 3,
        amount: '2500.00',
        merchant: 'Electronics Store',
        location: 'Online',
        date: '2023-05-12',
        status: 'Completed',
        riskScore: 75,
        riskLevel: 'High',
      },
    ];

    setTransactionHistory(history);
  }, [showHistory]);

  const formatCurrency = (amount: string): string => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(parseFloat(amount) || 0);
  };

  if (showAnalysisResults && analysisResult) {
    return (
      <div className={`bg-white p-6 rounded-lg shadow-md ${className}`}>
        <h2 className="text-xl font-semibold mb-4">Analysis Results</h2>
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-sm font-medium text-gray-500">Risk Level</p>
              <p
                className={`text-lg font-semibold ${
                  analysisResult.riskLevel === 'High'
                    ? 'text-red-600'
                    : analysisResult.riskLevel === 'Medium'
                      ? 'text-yellow-600'
                      : 'text-green-600'
                }`}
              >
                {analysisResult.riskLevel}
              </p>
            </div>
            <div>
              <p className="text-sm font-medium text-gray-500">Risk Score</p>
              <p className="text-lg font-semibold">{analysisResult.riskScore}</p>
            </div>
          </div>

          {analysisResult.recommendedAction && (
            <div>
              <p className="text-sm font-medium text-gray-500">Recommended Action</p>
              <p className="text-sm">{analysisResult.recommendedAction}</p>
            </div>
          )}

          <div>
            <p className="text-sm font-medium text-gray-500">Explanation</p>
            <p className="text-sm">{analysisResult.explanation}</p>
          </div>

          <button
            onClick={handleNewAnalysis}
            className="mt-4 w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
          >
            Analyze Another Transaction
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className={`bg-white p-6 rounded-lg shadow-md ${className}`}>
      <h2 className="text-xl font-semibold mb-4">Analyze Transaction</h2>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label htmlFor="amount" className="block text-sm font-medium text-gray-700">
            Amount ($)
          </label>
          <input
            type="number"
            id="amount"
            name="amount"
            value={transaction.amount}
            onChange={handleInputChange}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
            placeholder="0.00"
            step="0.01"
            min="0"
            required
          />
        </div>

        <div>
          <label htmlFor="merchant" className="block text-sm font-medium text-gray-700">
            Merchant
          </label>
          <input
            type="text"
            id="merchant"
            name="merchant"
            value={transaction.merchant}
            onChange={handleInputChange}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
            placeholder="Merchant name"
            required
          />
        </div>

        <div>
          <label htmlFor="location" className="block text-sm font-medium text-gray-700">
            Location
          </label>
          <input
            type="text"
            id="location"
            name="location"
            value={transaction.location}
            onChange={handleInputChange}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
            placeholder="City, Country"
            required
          />
        </div>

        {error && <div className="p-3 text-sm text-red-700 bg-red-100 rounded-md">{error}</div>}

        <div className="flex justify-end">
          <button
            type="submit"
            disabled={isLoading}
            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
          >
            {isLoading ? 'Analyzing...' : 'Analyze Transaction'}
          </button>
        </div>
      </form>

      {showHistory && transactionHistory.length > 0 && (
        <div className="mt-8">
          <h3 className="text-lg font-medium text-gray-900 mb-2">Recent Transactions</h3>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th
                    scope="col"
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                  >
                    Date
                  </th>
                  <th
                    scope="col"
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                  >
                    Merchant
                  </th>
                  <th
                    scope="col"
                    className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider"
                  >
                    Amount
                  </th>
                  <th
                    scope="col"
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                  >
                    Status
                  </th>
                  <th
                    scope="col"
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                  >
                    Risk
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {transactionHistory.map((txn) => (
                  <tr key={txn.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {new Date(txn.date).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">{txn.merchant}</div>
                      <div className="text-sm text-gray-500">{txn.location}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      {formatCurrency(txn.amount)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800">
                        {txn.status || 'Completed'}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span
                        className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                          txn.riskLevel === 'High'
                            ? 'bg-red-100 text-red-800'
                            : txn.riskLevel === 'Medium'
                              ? 'bg-yellow-100 text-yellow-800'
                              : 'bg-green-100 text-green-800'
                        }`}
                      >
                        {txn.riskLevel || 'N/A'}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};

// Export the component
export default TransactionAnalyzer;
