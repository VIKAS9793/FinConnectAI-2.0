import { useState, useEffect, useCallback, FC } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import { useAIService } from '../hooks/useAIService';
import TransactionAnalyzer, {
  Transaction,
  AnalysisResult,
} from '../components/TransactionAnalyzer';
import { User } from 'lucide-react';

interface DashboardProps {}

interface RiskBadgeProps {
  level?: 'High' | 'Medium' | 'Low';
  defaultLevel?: 'High' | 'Medium' | 'Low';
}

interface CustomerRisk extends AnalysisResult {
  // Extending AnalysisResult to include all its fields
}

const RiskBadge: FC<RiskBadgeProps> = ({ level, defaultLevel = 'Low' }) => {
  const effectiveLevel =
    level && ['High', 'Medium', 'Low'].includes(level)
      ? (level as 'High' | 'Medium' | 'Low')
      : defaultLevel;

  const colors = {
    High: 'bg-red-100 text-red-800',
    Medium: 'bg-yellow-100 text-yellow-800',
    Low: 'bg-green-100 text-green-800',
  } as const;

  return (
    <span className={`px-2 py-1 text-xs font-medium rounded-full ${colors[effectiveLevel]}`}>
      {effectiveLevel}
    </span>
  );
};

const Dashboard: FC<DashboardProps> = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const { getRiskAssessment } = useAIService();

  // Sample transaction history - in a real app, this would come from an API
  const [transactions, setTransactions] = useState<Transaction[]>([
    {
      id: 1,
      amount: '150.75',
      merchant: 'Amazon',
      location: 'Online',
      date: '2023-05-15T10:30:00Z',
      status: 'completed',
      riskScore: 25,
      riskLevel: 'Low' as const,
    },
    {
      id: 2,
      amount: '29.99',
      merchant: 'Netflix',
      location: 'Online',
      date: '2023-05-14T19:45:00Z',
      status: 'completed',
      riskScore: 10,
      riskLevel: 'Low' as const,
    },
    {
      id: 3,
      amount: '1250.00',
      merchant: 'ElectroHub',
      location: 'New York, NY',
      date: '2023-05-13T14:20:00Z',
      status: 'pending',
      riskScore: 45,
      riskLevel: 'Medium' as const,
    },
    {
      id: 4,
      amount: '85.50',
      merchant: 'Cafe Mocha',
      location: 'San Francisco, CA',
      date: '2023-05-12T08:15:00Z',
      status: 'completed',
      riskScore: 35,
      riskLevel: 'Medium' as const,
    },
    {
      id: 5,
      amount: '450.00',
      merchant: 'TechGadgets',
      location: 'Online',
      date: '2023-05-10T16:30:00Z',
      status: 'completed',
      riskScore: 40,
      riskLevel: 'Medium' as const,
    },
  ]);

  const [customerRisk, setCustomerRisk] = useState<CustomerRisk>({
    riskScore: 0,
    riskLevel: 'Low',
    explanation: '',
    recommendedAction: 'No action required',
    confidence: 95,
    timestamp: new Date().toISOString(),
  });

  const [isLoadingRisk, setIsLoadingRisk] = useState<boolean>(false);
  const [activeTab, setActiveTab] = useState<'overview' | 'transactions' | 'analyze'>('overview');
  const [isAnalyzing, setIsAnalyzing] = useState(false);

  // Handle logout
  const handleLogout = async (e?: React.MouseEvent) => {
    e?.preventDefault();
    try {
      await logout();
      navigate('/login');
    } catch (error) {
      console.error('Failed to log out', error);
    }
  };

  // Calculate summary metrics
  const totalTransactions = transactions.length;
  const totalAmount = transactions.reduce((sum, t) => {
    const amount = parseFloat(t.amount) || 0;
    return sum + amount;
  }, 0);

  const avgRiskScore =
    transactions.length > 0
      ? transactions.reduce((sum, t) => sum + (t.riskScore || 0), 0) / transactions.length
      : 0;

  // Get customer risk assessment
  const fetchCustomerRisk = useCallback(async () => {
    if (!user) return;

    setIsLoadingRisk(true);
    setCustomerRisk((prev) => ({
      ...prev,
      explanation: 'Loading risk assessment...',
    }));

    try {
      const assessment = await getRiskAssessment({
        customerId: user.sub || 'demo-customer-123',
        transactionHistory: transactions.map((t) => ({
          id: t.id,
          amount: parseFloat(t.amount),
          merchant: t.merchant,
          location: t.location,
          date: t.date,
          status: t.status,
          riskScore: t.riskScore,
          riskLevel: t.riskLevel,
        })),
      });
      setCustomerRisk(assessment);
    } catch (err) {
      console.error('Failed to fetch customer risk:', err);
      setCustomerRisk((prev) => ({
        ...prev,
        explanation: 'Failed to load risk assessment. Please try again.',
      }));
    } finally {
      setIsLoadingRisk(false);
    }
  }, [user, transactions, getRiskAssessment]);

  // Load customer risk on component mount
  useEffect(() => {
    fetchCustomerRisk();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user]);

  // Refresh risk assessment when transactions change
  useEffect(() => {
    if (transactions.length > 0) {
      fetchCustomerRisk();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [transactions]);

  // Handle analysis completion from TransactionAnalyzer with proper typing
  const handleAnalysisComplete = useCallback(
    (result: AnalysisResult) => {
      try {
        setIsAnalyzing(true);

        // Create a new transaction with the analysis result
        const newTransaction: Transaction = {
          id: transactions.length + 1,
          amount: '0', // This would come from the actual transaction data
          merchant: 'Unknown',
          location: 'Unknown',
          date: new Date().toISOString(),
          status: 'completed',
          riskScore: result.riskScore,
          riskLevel: result.riskLevel,
        };

        setTransactions((prev) => [newTransaction, ...prev]);

        // Update customer risk with the new analysis result
        const updatedTransactions = [newTransaction, ...transactions];
        const avgRiskScore = calculateAverageRisk(updatedTransactions);

        setCustomerRisk((prev) => ({
          ...prev,
          riskScore: avgRiskScore,
          riskLevel: avgRiskScore >= 60 ? 'High' : avgRiskScore >= 30 ? 'Medium' : 'Low',
          explanation: result.explanation || prev.explanation,
          recommendedAction: result.recommendedAction || prev.recommendedAction,
          confidence: result.confidence || prev.confidence,
        }));
      } catch (error) {
        console.error('Error processing analysis result:', error);
        setCustomerRisk((prev) => ({
          ...prev,
          explanation: 'Failed to process transaction analysis. Please try again.',
        }));
      } finally {
        setIsAnalyzing(false);
      }
    },
    [transactions.length]
  );

  // Format currency - handle both string and number inputs
  const formatCurrency = (amount: string | number): string => {
    const numAmount = typeof amount === 'string' ? parseFloat(amount) || 0 : amount;
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(numAmount);
  };

  // Format date
  const formatDate = (dateString: string): string => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  // Calculate average risk score
  const calculateAverageRisk = useCallback((transactions: Transaction[]) => {
    if (transactions.length === 0) return 0;
    const total = transactions.reduce((sum, tx) => sum + (tx.riskScore || 0), 0);
    return Math.round(total / transactions.length);
  }, []);

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Single Header */}
      <header className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 py-4 sm:px-6 lg:px-8 flex justify-between items-center">
          <h1 className="text-2xl font-bold text-gray-900">FinConnectAI</h1>
          <div className="flex items-center space-x-4">
            <div className="flex items-center">
              <User className="h-5 w-5 text-gray-500 mr-2" />
              <span className="text-sm font-medium text-gray-700">
                {user?.name || 'Vikas Sahani'}
              </span>
            </div>
            <button
              onClick={handleLogout}
              className="text-sm font-medium text-red-600 hover:text-red-800"
            >
              Sign out
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        {/* Stats */}
        <div className="grid grid-cols-1 gap-5 mt-6 sm:grid-cols-2 lg:grid-cols-4">
          <div className="bg-white overflow-hidden shadow rounded-lg">
            <div className="p-5">
              <div className="flex items-center">
                <div className="flex-shrink-0 bg-blue-500 rounded-md p-3">
                  <div className="h-6 w-6 bg-gray-200 rounded"></div>
                </div>
                <div className="ml-5 w-0 flex-1">
                  <dl>
                    <dt className="text-sm font-medium text-gray-500 truncate">
                      Total Transactions
                    </dt>
                    <dd className="flex items-baseline">
                      <div className="text-2xl font-semibold text-gray-900">
                        {totalTransactions}
                      </div>
                    </dd>
                  </dl>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white overflow-hidden shadow rounded-lg">
            <div className="p-5">
              <div className="flex items-center">
                <div className="flex-shrink-0 bg-green-500 rounded-md p-3">
                  <div className="h-6 w-6 bg-gray-200 rounded"></div>
                </div>
                <div className="ml-5 w-0 flex-1">
                  <dl>
                    <dt className="text-sm font-medium text-gray-500 truncate">Total Amount</dt>
                    <dd className="flex items-baseline">
                      <div className="text-2xl font-semibold text-gray-900">
                        {formatCurrency(totalAmount)}
                      </div>
                    </dd>
                  </dl>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white overflow-hidden shadow rounded-lg">
            <div className="p-5">
              <div className="flex items-center">
                <div className="flex-shrink-0 bg-yellow-500 rounded-md p-3">
                  <div className="h-6 w-6 bg-gray-200 rounded"></div>
                </div>
                <div className="ml-5 w-0 flex-1">
                  <dl>
                    <dt className="text-sm font-medium text-gray-500 truncate">Avg. Risk Score</dt>
                    <dd className="flex items-baseline">
                      <div className="text-2xl font-semibold text-gray-900">
                        {(avgRiskScore * 100).toFixed(1)}%
                      </div>
                    </dd>
                  </dl>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white overflow-hidden shadow rounded-lg">
            <div className="p-5">
              <div className="flex items-center">
                <div className="flex-shrink-0 bg-purple-500 rounded-md p-3">
                  <div className="h-6 w-6 bg-gray-200 rounded"></div>
                </div>
                <div className="ml-5 w-0 flex-1">
                  <dl>
                    <dt className="text-sm font-medium text-gray-500 truncate">
                      Customer Risk Level
                    </dt>
                    <dd className="flex items-baseline">
                      {isLoadingRisk ? (
                        <div className="animate-pulse h-6 w-20 bg-gray-200 rounded"></div>
                      ) : customerRisk ? (
                        <RiskBadge level={customerRisk.riskLevel} />
                      ) : (
                        <span className="text-gray-500">N/A</span>
                      )}
                    </dd>
                  </dl>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="mt-8">
          <div className="border-b border-gray-200">
            <nav className="-mb-px flex space-x-8">
              <button
                onClick={() => setActiveTab('overview')}
                className={`${
                  activeTab === 'overview'
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm`}
              >
                Overview
              </button>
              <button
                onClick={() => setActiveTab('transactions')}
                className={`${
                  activeTab === 'transactions'
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm`}
              >
                Transactions
              </button>
              <button
                onClick={() => setActiveTab('analyze')}
                className={`${
                  activeTab === 'analyze'
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm`}
              >
                Analyze Transaction
              </button>
            </nav>
          </div>

          <div className="bg-white shadow overflow-hidden sm:rounded-lg mt-6">
            {activeTab === 'overview' && (
              <div className="p-6">
                <h2 className="text-lg font-medium text-gray-900 mb-4">
                  Welcome back, {user?.name || 'User'}
                </h2>
                <div className="bg-blue-50 rounded-lg p-4 mb-6">
                  <div className="flex">
                    <div className="flex-shrink-0">
                      <div className="h-5 w-5 text-blue-400" />
                    </div>
                    <div className="ml-3">
                      <h3 className="text-sm font-medium text-blue-800">Quick Start</h3>
                      <div className="mt-2 text-sm text-blue-700">
                        <p>
                          Use the tabs above to navigate between different sections. Analyze new
                          transactions, view transaction history, or check customer risk profiles.
                        </p>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="mt-8">
                  <h3 className="text-base font-medium text-gray-900 mb-4">Recent Activity</h3>
                  <div className="bg-white shadow overflow-hidden sm:rounded-md">
                    <ul className="divide-y divide-gray-200">
                      {transactions.slice(0, 5).map((transaction) => (
                        <li key={transaction.id}>
                          <div className="px-4 py-4 sm:px-6">
                            <div className="flex items-center justify-between">
                              <p className="text-sm font-medium text-blue-600 truncate">
                                {transaction.merchant}
                              </p>
                              <div className="ml-2 flex-shrink-0 flex">
                                <RiskBadge level={transaction.riskLevel} />
                              </div>
                            </div>
                            <div className="mt-2 sm:flex sm:justify-between">
                              <div className="sm:flex">
                                <p className="flex items-center text-sm text-gray-500">
                                  <div className="flex-shrink-0 mr-1.5 h-5 w-5 text-gray-400" />
                                  {formatDate(transaction.date)}
                                </p>
                              </div>
                              <div className="mt-2 flex items-center text-sm text-gray-500 sm:mt-0">
                                <p className="font-medium">{formatCurrency(transaction.amount)}</p>
                              </div>
                            </div>
                          </div>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'transactions' && (
              <div className="p-6">
                <div className="flex justify-between items-center mb-6">
                  <h2 className="text-lg font-medium text-gray-900">Transaction History</h2>
                  <div className="flex-shrink-0">
                    <button
                      onClick={(e) => {
                        e.preventDefault();
                        handleLogout();
                      }}
                      className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
                    >
                      Sign out
                    </button>
                    <button
                      type="button"
                      className="relative inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 shadow-sm hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                      onClick={() => setActiveTab('analyze')}
                    >
                      Analyze New Transaction
                    </button>
                  </div>
                </div>
                <div className="flex flex-col">
                  <div className="-my-2 overflow-x-auto sm:-mx-6 lg:-mx-8">
                    <div className="py-2 align-middle inline-block min-w-full sm:px-6 lg:px-8">
                      <div className="shadow overflow-hidden border-b border-gray-200 sm:rounded-lg">
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
                                className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                              >
                                Location
                              </th>
                              <th
                                scope="col"
                                className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                              >
                                Amount
                              </th>
                              <th
                                scope="col"
                                className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                              >
                                Risk Level
                              </th>
                              <th scope="col" className="relative px-6 py-3">
                                <span className="sr-only">View</span>
                              </th>
                            </tr>
                          </thead>
                          <tbody className="bg-white divide-y divide-gray-200">
                            {transactions.map((transaction) => (
                              <tr key={transaction.id}>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                  {formatDate(transaction.date)}
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap">
                                  <div className="text-sm font-medium text-gray-900">
                                    {transaction.merchant}
                                  </div>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap">
                                  <div className="text-sm text-gray-500">
                                    {transaction.location}
                                  </div>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                  {formatCurrency(transaction.amount)}
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap">
                                  <RiskBadge level={transaction.riskLevel} />
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                  <button className="text-blue-600 hover:text-blue-900">
                                    View
                                  </button>
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'analyze' && (
              <div className="p-6">
                <div className="md:grid md:grid-cols-3 md:gap-6">
                  <div className="md:col-span-1">
                    <div className="px-4 sm:px-0">
                      <h3 className="text-lg font-medium leading-6 text-gray-900">
                        Transaction Analysis
                      </h3>
                      <p className="mt-1 text-sm text-gray-600">
                        Analyze a new transaction for potential fraud and risk factors.
                      </p>
                    </div>
                  </div>
                  <div className="mt-5 md:mt-0 md:col-span-2">
                    <div className="mt-8">
                      {isAnalyzing ? (
                        <div className="flex items-center justify-center min-h-[200px]">
                          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
                        </div>
                      ) : (
                        <TransactionAnalyzer
                          onAnalysisComplete={handleAnalysisComplete}
                          showHistory={true}
                        />
                      )}
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </main>

      <footer className="bg-white mt-12">
        <div className="max-w-7xl mx-auto py-6 px-4 overflow-hidden sm:px-6 lg:px-8">
          <p className="mt-8 text-center text-base text-gray-400">
            &copy; {new Date().getFullYear()} FinConnectAI. All rights reserved.
          </p>
        </div>
      </footer>
    </div>
  );
};

export default Dashboard;
