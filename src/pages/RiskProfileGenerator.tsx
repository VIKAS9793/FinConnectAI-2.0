import React, { useState } from 'react';
import { Users, Download, Filter, RotateCcw, ArrowRight, Shield, TrendingUp, TrendingDown } from 'lucide-react';
import ResultCard from '../components/ResultCard';
import MobileSidebar from '../components/MobileSidebar';

// Sample customer data
const sampleCustomers = [
  { 
    id: 'C123456', 
    name: 'John Smith', 
    age: 42, 
    income: 85000, 
    occupation: 'Software Engineer', 
    creditScore: 740,
    location: 'Seattle, WA',
    accountAge: 36 // months
  },
  { 
    id: 'C123457', 
    name: 'Maria Garcia', 
    age: 29, 
    income: 65000, 
    occupation: 'Marketing Manager', 
    creditScore: 680,
    location: 'Austin, TX',
    accountAge: 14 // months
  },
  { 
    id: 'C123458', 
    name: 'Robert Johnson', 
    age: 56, 
    income: 120000, 
    occupation: 'Financial Advisor', 
    creditScore: 820,
    location: 'Chicago, IL',
    accountAge: 84 // months
  },
  { 
    id: 'C123459', 
    name: 'Emily Wong', 
    age: 33, 
    income: 72000, 
    occupation: 'Healthcare Professional', 
    creditScore: 710,
    location: 'Los Angeles, CA',
    accountAge: 28 // months
  },
  { 
    id: 'C123460', 
    name: 'Daniel Brown', 
    age: 38, 
    income: 95000, 
    occupation: 'Product Manager', 
    creditScore: 760,
    location: 'New York, NY',
    accountAge: 42 // months
  },
];

// Sample results for demonstration
const sampleResults = [
  {
    id: 1,
    title: 'Risk Profile for C123458',
    timestamp: '2025-05-10 13:15',
    result: {
      summary: 'Low risk profile (92% confidence)',
      details: 'Customer profile analysis:\n- Strong credit history (score: 820)\n- Long-term customer (7+ years)\n- Stable income and occupation\n- Consistent payment behavior\n\nRecommendation: Eligible for premium services and higher credit limits.',
      confidence: 92
    }
  },
  {
    id: 2,
    title: 'Risk Profile for C123457',
    timestamp: '2025-05-08 10:08',
    result: {
      summary: 'Moderate risk profile (75% confidence)',
      details: 'Customer profile analysis:\n- Average credit score (680)\n- Relatively new customer (14 months)\n- Income within expected range\n- Location has moderate fraud risk\n\nRecommendation: Standard monitoring procedures.',
      confidence: 75
    }
  }
];

const RiskProfileGenerator = () => {
  const [selectedCustomer, setSelectedCustomer] = useState('');
  const [additionalInfo, setAdditionalInfo] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [results, setResults] = useState(sampleResults);
  
  const handleGenerateProfile = () => {
    if (!selectedCustomer) return;
    
    setIsLoading(true);
    
    // Simulate API call
    setTimeout(() => {
      // Find the selected customer details
      const customerDetails = sampleCustomers.find(c => c.id === selectedCustomer);
      
      if (customerDetails) {
        // Generate risk level based on credit score and account age
        let riskLevel = 'Moderate';
        let confidence = 75;
        
        if (customerDetails.creditScore > 750 && customerDetails.accountAge > 36) {
          riskLevel = 'Low';
          confidence = 90 + Math.floor(Math.random() * 10);
        } else if (customerDetails.creditScore < 650 || customerDetails.accountAge < 12) {
          riskLevel = 'High';
          confidence = 60 + Math.floor(Math.random() * 20);
        }
        
        const newResult = {
          id: Date.now(),
          title: `Risk Profile for ${customerDetails.id}`,
          timestamp: new Date().toISOString().replace('T', ' ').substring(0, 16),
          result: {
            summary: `${riskLevel} risk profile (${confidence}% confidence)`,
            details: `Customer profile analysis:\n- Credit score: ${customerDetails.creditScore} (${customerDetails.creditScore > 750 ? 'Excellent' : customerDetails.creditScore > 700 ? 'Good' : customerDetails.creditScore > 650 ? 'Fair' : 'Poor'})\n- Account age: ${customerDetails.accountAge} months\n- Income: $${customerDetails.income.toLocaleString()}\n- Occupation: ${customerDetails.occupation}\n- Location: ${customerDetails.location}\n${additionalInfo ? `\nAdditional context:\n${additionalInfo}` : ''}`,
            confidence
          }
        };
        
        setResults([newResult, ...results]);
        setSelectedCustomer('');
        setAdditionalInfo('');
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
          <div className="p-2 bg-blue-100 rounded-lg text-blue-700">
            <Users className="h-6 w-6" />
          </div>
          <h1 className="text-2xl font-bold text-gray-800">CRM Risk Profile Generator</h1>
        </div>
        
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-1">
            <div className="bg-white rounded-lg shadow-md border border-gray-200 overflow-hidden">
              <div className="p-5 border-b border-gray-200">
                <h2 className="text-lg font-semibold text-gray-800">Generate Risk Profile</h2>
                <p className="text-sm text-gray-500 mt-1">Analyze a customer for risk assessment</p>
              </div>
              
              <div className="p-5 space-y-4">
                <div>
                  <label htmlFor="customer" className="block text-sm font-medium text-gray-700 mb-1">
                    Select Customer
                  </label>
                  <select
                    id="customer"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    value={selectedCustomer}
                    onChange={(e) => setSelectedCustomer(e.target.value)}
                  >
                    <option value="">Select a customer</option>
                    {sampleCustomers.map((customer) => (
                      <option key={customer.id} value={customer.id}>
                        {customer.id} - {customer.name}
                      </option>
                    ))}
                  </select>
                </div>
                
                {selectedCustomer && (
                  <div className="bg-gray-50 p-3 rounded-md border border-gray-200 text-sm">
                    {(() => {
                      const customer = sampleCustomers.find(c => c.id === selectedCustomer);
                      return customer ? (
                        <div className="space-y-1">
                          <div className="flex justify-between">
                            <span className="text-gray-600">Customer ID:</span>
                            <span className="font-medium">{customer.id}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-gray-600">Name:</span>
                            <span className="font-medium">{customer.name}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-gray-600">Age:</span>
                            <span className="font-medium">{customer.age}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-gray-600">Income:</span>
                            <span className="font-medium">${customer.income.toLocaleString()}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-gray-600">Credit Score:</span>
                            <span className="font-medium">{customer.creditScore}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-gray-600">Location:</span>
                            <span className="font-medium">{customer.location}</span>
                          </div>
                        </div>
                      ) : null;
                    })()}
                  </div>
                )}
                
                <div>
                  <label htmlFor="additionalInfo" className="block text-sm font-medium text-gray-700 mb-1">
                    Additional Information (Optional)
                  </label>
                  <textarea
                    id="additionalInfo"
                    rows={3}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="Add any additional context or information..."
                    value={additionalInfo}
                    onChange={(e) => setAdditionalInfo(e.target.value)}
                  ></textarea>
                </div>
                
                <button
                  type="button"
                  className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-md transition-colors flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed"
                  onClick={handleGenerateProfile}
                  disabled={!selectedCustomer || isLoading}
                >
                  {isLoading ? (
                    <>
                      <RotateCcw className="h-4 w-4 mr-2 animate-spin" />
                      Generating...
                    </>
                  ) : (
                    <>
                      Generate Risk Profile
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
                  <p className="text-sm text-gray-600 mt-1">Chain-of-Thought</p>
                </div>
                
                <div>
                  <h3 className="text-sm font-medium text-gray-700">Tools</h3>
                  <ul className="list-disc list-inside text-sm text-gray-600 mt-1 space-y-1">
                    <li>RiskScorer</li>
                    <li>CustomerProfileDB</li>
                  </ul>
                </div>
                
                <div>
                  <h3 className="text-sm font-medium text-gray-700">Guardrails</h3>
                  <ul className="list-disc list-inside text-sm text-gray-600 mt-1 space-y-1">
                    <li>Relevance Filter</li>
                    <li>Retry-on-failure</li>
                  </ul>
                </div>
                
                <div>
                  <h3 className="text-sm font-medium text-gray-700">Performance</h3>
                  <div className="flex items-center mt-1">
                    <div className="flex-1 bg-gray-200 rounded-full h-2">
                      <div className="bg-blue-600 h-2 rounded-full" style={{ width: '92%' }}></div>
                    </div>
                    <span className="text-sm font-medium text-gray-700 ml-2">92%</span>
                  </div>
                  <p className="text-xs text-gray-500 mt-1">Accuracy vs manual benchmark (F1 score: 0.81)</p>
                </div>
              </div>
            </div>
          </div>
          
          <div className="lg:col-span-2">
            <div className="bg-white rounded-lg shadow-md border border-gray-200 overflow-hidden">
              <div className="p-5 border-b border-gray-200 flex justify-between items-center">
                <h2 className="text-lg font-semibold text-gray-800">Risk Profiles</h2>
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
                    <Shield className="h-12 w-12 text-gray-400 mx-auto" />
                    <h3 className="mt-2 text-sm font-medium text-gray-900">No risk profiles yet</h3>
                    <p className="mt-1 text-sm text-gray-500">
                      Select a customer and generate a profile to see results here.
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
            
            <div className="bg-white rounded-lg shadow-md border border-gray-200 overflow-hidden mt-6">
              <div className="p-5 border-b border-gray-200">
                <h2 className="text-lg font-semibold text-gray-800">Risk Distribution</h2>
                <p className="text-sm text-gray-500 mt-1">Customer risk profile distribution across portfolio</p>
              </div>
              
              <div className="p-5">
                <div className="grid grid-cols-3 gap-4">
                  <div className="bg-green-50 rounded-lg p-4 border border-green-100">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-gray-500">Low Risk</p>
                        <p className="text-2xl font-bold text-green-700 mt-1">58%</p>
                      </div>
                      <TrendingDown className="h-8 w-8 text-green-500" />
                    </div>
                    <div className="mt-2">
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div className="bg-green-500 h-2 rounded-full" style={{ width: '58%' }}></div>
                      </div>
                    </div>
                  </div>
                  
                  <div className="bg-yellow-50 rounded-lg p-4 border border-yellow-100">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-gray-500">Medium Risk</p>
                        <p className="text-2xl font-bold text-yellow-700 mt-1">32%</p>
                      </div>
                      <Shield className="h-8 w-8 text-yellow-500" />
                    </div>
                    <div className="mt-2">
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div className="bg-yellow-500 h-2 rounded-full" style={{ width: '32%' }}></div>
                      </div>
                    </div>
                  </div>
                  
                  <div className="bg-red-50 rounded-lg p-4 border border-red-100">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-gray-500">High Risk</p>
                        <p className="text-2xl font-bold text-red-700 mt-1">10%</p>
                      </div>
                      <TrendingUp className="h-8 w-8 text-red-500" />
                    </div>
                    <div className="mt-2">
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div className="bg-red-500 h-2 rounded-full" style={{ width: '10%' }}></div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default RiskProfileGenerator;