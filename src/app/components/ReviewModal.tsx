import { useState } from 'react';
import { Star } from 'lucide-react';
import { Button } from './ui/button';
import { Textarea } from './ui/textarea';
import { useNotification } from '../context/NotificationContext';

interface ReviewModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  propertyTitle: string;
  onSubmitReview: (rating: number, comment: string, categories: any) => void;
}

export function ReviewModal({
  open,
  onOpenChange,
  propertyTitle,
  onSubmitReview,
}: ReviewModalProps) {
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState('');
  const [categories, setCategories] = useState({
    cleanliness: 5,
    communication: 5,
    accuracy: 5,
    value: 5,
  });
  const { addNotification } = useNotification();

  const handleSubmit = () => {
    if (comment.trim()) {
      onSubmitReview(rating, comment, categories);
      addNotification('success', 'Review Posted', 'Your review has been submitted');
      setComment('');
      setRating(5);
      onOpenChange(false);
    }
  };

  if (!open) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4 space-y-4">
        <h2 className="text-xl font-bold">Rate {propertyTitle}</h2>

        {/* Overall Rating */}
        <div>
          <label className="text-sm font-medium mb-2 block">Overall Rating</label>
          <div className="flex gap-2">
            {[1, 2, 3, 4, 5].map((star) => (
              <button
                key={star}
                onClick={() => setRating(star)}
                className={`text-2xl ${
                  star <= rating ? 'text-yellow-400' : 'text-gray-300'
                }`}
              >
                <Star fill="currentColor" />
              </button>
            ))}
          </div>
        </div>

        {/* Category Ratings */}
        <div className="space-y-2">
          {Object.entries(categories).map(([key, value]) => (
            <div key={key}>
              <label className="text-sm capitalize font-medium">{key}</label>
              <div className="flex gap-1">
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    key={star}
                    onClick={() =>
                      setCategories({ ...categories, [key]: star })
                    }
                    className={`text-lg ${
                      star <= (value as number)
                        ? 'text-yellow-400'
                        : 'text-gray-300'
                    }`}
                  >
                    <Star fill="currentColor" />
                  </button>
                ))}
              </div>
            </div>
          ))}
        </div>

        {/* Review Text */}
        <Textarea
          placeholder="Share your experience..."
          value={comment}
          onChange={(e) => setComment(e.target.value)}
          rows={4}
        />

        <div className="flex gap-2">
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={handleSubmit}>Submit Review</Button>
        </div>
      </div>
    </div>
  );
}
