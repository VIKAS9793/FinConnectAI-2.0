import React, { useState } from 'react';
import { ArrowRight, AlertTriangle, Download, Filter, RotateCcw } from 'lucide-react';
import ResultCard from '../components/ResultCard';
import MobileSidebar from '../components/MobileSidebar';

// Sample fraud transaction data
const sampleTransactions = [
  { id: 'TX123456', amount: 2499.99, date: '2025-05-10', merchant: 'TechGadgets Inc.', location: 'San Francisco, CA' },
  { id: 'TX123457', amount: 149.50, date: '2025-05-09', merchant: 'AirlineTickets.com', location: 'Online' },
  { id: 'TX123458', amount: 899.00, date: '2025-05-08', merchant: 'LuxuryBags Store', location: 'New York, NY' },
  { id: 'TX123459', amount: 75.25, date: '2025-05-07', merchant: 'GroceryMart', location: 'Chicago, IL' },
  { id: 'TX123460', amount: 1299.99, date: '2025-05-06', merchant: 'ElectroWorld', location: 'Miami, FL' },
];

// Sample results for demonstration
const sampleResults = [
  {
    id: 1,
    title: 'Fraud Analysis for TX123456',
    timestamp: '2025-05-10 14:32',
    result: {
      summary: 'High probability of fraud detected (87% confidence)',
      details: 'Transaction flagged due to:\n- Unusual location (different from customer\'s normal spending pattern)\n- High value purchase ($2,499.99)\n- Merchant previously associated with fraud\n\nRecommendation: Contact customer to verify purchase.',
      confidence: 87
    }
  },
  {
    id: 2,
    title: 'Fraud Analysis for TX123458',
    timestamp: '2025-05-08 11:42',
    result: {
      summary: 'Moderate risk of fraud detected (65% confidence)',
      details: 'Transaction flagged due to:\n- Purchase amount higher than customer\'s average spending\n- First purchase with this merchant\n\nRecommendation: Monitor account for additional suspicious activity.',
      confidence: 65
    }
  }
];

const FraudExplainer = () => {
  const [selectedTransaction, setSelectedTransaction] = useState('');
  const [additionalDetails, setAdditionalDetails] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [results, setResults] = useState(sampleResults);
  
  const handleAnalyzeTransaction = () => {
    if (!selectedTransaction) return;
    
    setIsLoading(true);
    
    // Simulate API call
    setTimeout(() => {
      // Find the selected transaction details
      const txDetails = sampleTransactions.find(tx => tx.id === selectedTransaction);
      
      if (txDetails) {
        const newResult = {
          id: Date.now(),
          title: `Fraud Analysis for ${txDetails.id}`,
          timestamp: new Date().toISOString().replace('T', ' ').substring(0, 16),
          result: {
            summary: `Potential fraud detected (${Math.floor(Math.random() * 30) + 60}% confidence)`,
            details: `Transaction flagged due to:\n- ${txDetails.amount > 1000 ? 'High value purchase' : 'Unusual purchase pattern'}\n- ${txDetails.location === 'Online' ? 'Online transaction with new merchant' : `Transaction location (${txDetails.location})`}\n${additionalDetails ? `\nAdditional context:\n${additionalDetails}` : ''}`,
            confidence: Math.floor(Math.random() * 30) + 60
          }
        };
        
        setResults([newResult, ...results]);
        setSelectedTransaction('');
        setAdditionalDetails('');
      }
      
      setIsLoading(false);
    }, 2000);
  };
  
  const handleFeedbackSubmit = (resultId: number, rating: number, feedback: string) => {
    console.log(`Feedback for result ${resultId}:`, { rating, feedback });
    // In a real app, this would send the feedback to an API
  };

  return (
    <>
      <MobileSidebar />
      <div className="space-y-6">
        <div className="flex items-center space-x-2 mb-6">
          <div className="p-2 bg-orange-100 rounded-lg text-orange-700">
            <AlertTriangle className="h-6 w-6" />
          </div>
          <h1 className="text-2xl font-bold text-gray-800">Fraud Explainer Agent</h1>
        </div>
        
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-1">
            <div className="bg-white rounded-lg shadow-md border border-gray-200 overflow-hidden">
              <div className="p-5 border-b border-gray-200">
                <h2 className="text-lg font-semibold text-gray-800">Analyze Transaction</h2>
                <p className="text-sm text-gray-500 mt-1">Submit a transaction for fraud analysis</p>
              </div>
              
              <div className="p-5 space-y-4">
                <div>
                  <label htmlFor="transaction" className="block text-sm font-medium text-gray-700 mb-1">
                    Select Transaction
                  </label>
                  <select
                    id="transaction"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    value={selectedTransaction}
                    onChange={(e) => setSelectedTransaction(e.target.value)}
                  >
                    <option value="">Select a transaction</option>
                    {sampleTransactions.map((tx) => (
                      <option key={tx.id} value={tx.id}>
                        {tx.id} - ${tx.amount.toFixed(2)} ({tx.merchant})
                      </option>
                    ))}
                  </select>
                </div>
                
                {selectedTransaction && (
                  <div className="bg-gray-50 p-3 rounded-md border border-gray-200 text-sm">
                    {(() => {
                      const tx = sampleTransactions.find(t => t.id === selectedTransaction);
                      return tx ? (
                        <div className="space-y-1">
                          <div className="flex justify-between">
                            <span className="text-gray-600">Transaction ID:</span>
                            <span className="font-medium">{tx.id}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-gray-600">Amount:</span>
                            <span className="font-medium">${tx.amount.toFixed(2)}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-gray-600">Date:</span>
                            <span className="font-medium">{tx.date}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-gray-600">Merchant:</span>
                            <span className="font-medium">{tx.merchant}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-gray-600">Location:</span>
                            <span className="font-medium">{tx.location}</span>
                          </div>
                        </div>
                      ) : null;
                    })()}
                  </div>
                )}
                
                <div>
                  <label htmlFor="additionalDetails" className="block text-sm font-medium text-gray-700 mb-1">
                    Additional Context (Optional)
                  </label>
                  <textarea
                    id="additionalDetails"
                    rows={3}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="Add any additional context or information..."
                    value={additionalDetails}
                    onChange={(e) => setAdditionalDetails(e.target.value)}
                  ></textarea>
                </div>
                
                <button
                  type="button"
                  className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-md transition-colors flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed"
                  onClick={handleAnalyzeTransaction}
                  disabled={!selectedTransaction || isLoading}
                >
                  {isLoading ? (
                    <>
                      <RotateCcw className="h-4 w-4 mr-2 animate-spin" />
                      Analyzing...
                    </>
                  ) : (
                    <>
                      Analyze Transaction
                      <ArrowRight className="h-4 w-4 ml-2" />
                    </>
                  )}
                </button>
              </div>
            </div>
            
            <div className="bg-white rounded-lg shadow-md border border-gray-200 overflow-hidden mt-6">
              <div className="p-5 border-b border-gray-200 flex justify-between items-center">
                <h2 className="text-lg font-semibold text-gray-800">Agent Information</h2>
              </div>
              
              <div className="p-5 space-y-4">
                <div>
                  <h3 className="text-sm font-medium text-gray-700">Pattern</h3>
                  <p className="text-sm text-gray-600 mt-1">ReAct (Reasoning + Acting)</p>
                </div>
                
                <div>
                  <h3 className="text-sm font-medium text-gray-700">Tools</h3>
                  <ul className="list-disc list-inside text-sm text-gray-600 mt-1 space-y-1">
                    <li>SimpleClassifier</li>
                    <li>ExplainabilityRules</li>
                    <li>TransactionFetcher</li>
                  </ul>
                </div>
                
                <div>
                  <h3 className="text-sm font-medium text-gray-700">Guardrails</h3>
                  <ul className="list-disc list-inside text-sm text-gray-600 mt-1 space-y-1">
                    <li>PII Masker</li>
                    <li>Rule Validator</li>
                  </ul>
                </div>
                
                <div>
                  <h3 className="text-sm font-medium text-gray-700">Performance</h3>
                  <div className="flex items-center mt-1">
                    <div className="flex-1 bg-gray-200 rounded-full h-2">
                      <div className="bg-blue-600 h-2 rounded-full" style={{ width: '84%' }}></div>
                    </div>
                    <span className="text-sm font-medium text-gray-700 ml-2">84%</span>
                  </div>
                  <p className="text-xs text-gray-500 mt-1">Success rate based on compliance officer ratings</p>
                </div>
              </div>
            </div>
          </div>
          
          <div className="lg:col-span-2">
            <div className="bg-white rounded-lg shadow-md border border-gray-200 overflow-hidden">
              <div className="p-5 border-b border-gray-200 flex justify-between items-center">
                <h2 className="text-lg font-semibold text-gray-800">Analysis Results</h2>
                <div className="flex space-x-2">
                  <button className="text-sm text-gray-600 hover:text-gray-800 flex items-center p-1">
                    <Filter className="h-4 w-4 mr-1" />
                    <span className="hidden md:inline">Filter</span>
                  </button>
                  <button className="text-sm text-gray-600 hover:text-gray-800 flex items-center p-1">
                    <Download className="h-4 w-4 mr-1" />
                    <span className="hidden md:inline">Export</span>
                  </button>
                </div>
              </div>
              
              <div className="p-5">
                {results.length === 0 ? (
                  <div className="text-center py-6">
                    <AlertTriangle className="h-12 w-12 text-gray-400 mx-auto" />
                    <h3 className="mt-2 text-sm font-medium text-gray-900">No results yet</h3>
                    <p className="mt-1 text-sm text-gray-500">
                      Select a transaction and analyze it to see results here.
                    </p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {results.map((result) => (
                      <ResultCard 
                        key={result.id}
                        title={result.title}
                        timestamp={result.timestamp}
                        result={result.result}
                        onFeedbackSubmit={(rating, feedback) => 
                          handleFeedbackSubmit(result.id, rating, feedback)
                        }
                      />
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default FraudExplainer;