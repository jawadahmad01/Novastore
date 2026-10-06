import React from "react";
import { Star } from "lucide-react";

interface RatingStarsProps {
  rating: number; // e.g. 4.8
  reviewCount?: number;
  size?: "sm" | "md" | "lg";
  showValue?: boolean;
}

export const RatingStars: React.FC<RatingStarsProps> = ({
  rating,
  reviewCount,
  size = "sm",
  showValue = false,
}) => {
  const starSizes = {
    sm: "w-3.5 h-3.5",
    md: "w-4 h-4",
    lg: "w-5 h-5",
  };

  const clamped = Math.max(0, Math.min(5, rating));
  const fullStars = Math.floor(clamped);
  const hasHalfStar = clamped % 1 >= 0.3;

  return (
    <div className="flex items-center gap-1.5 text-xs text-stone-600">
      <div className="flex items-center text-amber-500" aria-label={`Rating: ${rating} out of 5 stars`}>
        {[1, 2, 3, 4, 5].map((index) => {
          const isFilled = index <= fullStars;
          const isHalf = !isFilled && index === fullStars + 1 && hasHalfStar;

          return (
            <Star
              key={index}
              className={`${starSizes[size]} ${
                isFilled
                  ? "fill-amber-400 text-amber-400"
                  : isHalf
                  ? "fill-amber-200 text-amber-400"
                  : "text-stone-300"
              }`}
            />
          );
        })}
      </div>

      {showValue && <span className="font-medium text-stone-800">{rating.toFixed(1)}</span>}

      {reviewCount !== undefined && (
        <span className="text-stone-400">({reviewCount})</span>
      )}
    </div>
  );
};
