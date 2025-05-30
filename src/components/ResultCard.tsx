import React, { useState } from 'react';
import { ChevronDown, ChevronUp } from 'lucide-react';
import FeedbackRating from './FeedbackRating';

interface ResultCardProps {
  title: string;
  timestamp: string;
  result: {
    summary: string;
    details: string;
    confidence: number;
  };
  onFeedbackSubmit: (rating: number, feedback: string) => void;
}

const ResultCard: React.FC<ResultCardProps> = ({ title, timestamp, result, onFeedbackSubmit }) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [rating, setRating] = useState(0);
  const [feedback, setFeedback] = useState('');
  const [isFeedbackSubmitted, setIsFeedbackSubmitted] = useState(false);

  const handleFeedbackSubmit = () => {
    onFeedbackSubmit(rating, feedback);
    setIsFeedbackSubmitted(true);
  };

  const getConfidenceColor = () => {
    if (result.confidence >= 80) return 'bg-green-100 text-green-800';
    if (result.confidence >= 50) return 'bg-yellow-100 text-yellow-800';
    return 'bg-red-100 text-red-800';
  };

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden mb-4 transition-all duration-200">
      <div
        className="p-4 cursor-pointer hover:bg-gray-50 transition-colors flex justify-between items-center"
        onClick={() => setIsExpanded(!isExpanded)}
      >
        <div>
          <h3 className="font-medium text-gray-800">{title}</h3>
          <p className="text-xs text-gray-500 mt-1">{timestamp}</p>
        </div>

        <div className="flex items-center space-x-3">
          <span
            className={`text-xs font-medium px-2.5 py-0.5 rounded-full ${getConfidenceColor()}`}
          >
            {result.confidence}% confidence
          </span>
          {isExpanded ? (
            <ChevronUp className="h-5 w-5 text-gray-400" />
          ) : (
            <ChevronDown className="h-5 w-5 text-gray-400" />
          )}
        </div>
      </div>

      {isExpanded && (
        <div className="p-4 border-t border-gray-100 bg-gray-50">
          <div className="mb-4">
            <h4 className="text-sm font-medium text-gray-700 mb-2">Summary</h4>
            <p className="text-sm text-gray-600">{result.summary}</p>
          </div>

          <div className="mb-4">
            <h4 className="text-sm font-medium text-gray-700 mb-2">Details</h4>
            <p className="text-sm text-gray-600 whitespace-pre-line">{result.details}</p>
          </div>

          <div className="border-t border-gray-200 pt-4 mt-4">
            <h4 className="text-sm font-medium text-gray-700 mb-2">Provide Feedback</h4>

            <div className="flex flex-col space-y-3">
              <div>
                <p className="text-xs text-gray-500 mb-1">How would you rate this result?</p>
                <FeedbackRating
                  initialRating={rating}
                  onRatingChange={setRating}
                  disabled={isFeedbackSubmitted}
                />
              </div>

              <div>
                <p className="text-xs text-gray-500 mb-1">Additional comments (optional)</p>
                <textarea
                  className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  rows={2}
                  placeholder="What could be improved?"
                  value={feedback}
                  onChange={(e) => setFeedback(e.target.value)}
                  disabled={isFeedbackSubmitted}
                ></textarea>
              </div>

              {isFeedbackSubmitted ? (
                <div className="bg-green-50 text-green-700 px-3 py-2 rounded-md text-sm">
                  Thank you for your feedback!
                </div>
              ) : (
                <button
                  className="bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium px-4 py-2 rounded-md transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  onClick={handleFeedbackSubmit}
                  disabled={rating === 0}
                >
                  Submit Feedback
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ResultCard;
