import { useState, useEffect } from 'react';
import { Star } from 'lucide-react';

/* ----------------------------- StarRating Component ----------------------------- */
const StarRating = ({
  rating = 0,
  onRate = () => {},
  readonly = false,
  size = 40,
}) => {
  const [hover, setHover] = useState(0);
  const [selected, setSelected] = useState(rating);

  useEffect(() => setSelected(rating || 0), [rating]);

  const handleClick = (star) => {
    if (readonly) return;
    setSelected(star);
    onRate(star);
  };

  return (
    <div className="flex gap-1 justify-center">
      {[1, 2, 3, 4, 5].map((star) => (
        <button
          key={star}
          type="button"
          disabled={readonly}
          onClick={() => handleClick(star)}
          onMouseEnter={() => !readonly && setHover(star)}
          onMouseLeave={() => !readonly && setHover(0)}
          className={`${
            readonly ? 'cursor-default' : 'cursor-pointer'
          } transition-transform hover:scale-110`}
        >
          <Star
            size={size}
            fill={(hover || selected) >= star ? '#fbbf24' : 'none'}
            stroke={(hover || selected) >= star ? '#fbbf24' : '#d1d5db'}
            strokeWidth={2}
          />
        </button>
      ))}
    </div>
  );
};

export default StarRating;
