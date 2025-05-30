import React, { useState } from 'react';
import { Star } from 'lucide-react';

interface FeedbackRatingProps {
  initialRating?: number;
  onRatingChange: (rating: number) => void;
  disabled?: boolean;
}

const FeedbackRating: React.FC<FeedbackRatingProps> = ({
  initialRating = 0,
  onRatingChange,
  disabled = false,
}) => {
  const [rating, setRating] = useState(initialRating);
  const [hoverRating, setHoverRating] = useState(0);

  const handleRatingClick = (newRating: number) => {
    if (disabled) return;
    setRating(newRating);
    onRatingChange(newRating);
  };

  return (
    <div className="flex items-center space-x-1">
      {[1, 2, 3, 4, 5].map((star) => (
        <button
          key={star}
          type="button"
          disabled={disabled}
          className={`focus:outline-none transition-all duration-150 ${disabled ? 'cursor-default opacity-80' : 'cursor-pointer hover:scale-110'}`}
          onMouseEnter={() => !disabled && setHoverRating(star)}
          onMouseLeave={() => !disabled && setHoverRating(0)}
          onClick={() => handleRatingClick(star)}
        >
          <Star
            className={`h-6 w-6 ${
              (hoverRating || rating) >= star ? 'text-yellow-400 fill-yellow-400' : 'text-gray-300'
            }`}
          />
        </button>
      ))}
    </div>
  );
};

export default FeedbackRating;
