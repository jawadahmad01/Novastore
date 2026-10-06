import React from "react";
import { formatPrice, calculateDiscountPercentage } from "@/src/lib/utils/formatters";

interface PriceDisplayProps {
  price: number;
  compareAtPrice?: number;
  size?: "sm" | "md" | "lg" | "xl";
  className?: string;
}

export const PriceDisplay: React.FC<PriceDisplayProps> = ({
  price,
  compareAtPrice,
  size = "md",
  className = "",
}) => {
  const hasDiscount = compareAtPrice && compareAtPrice > price;
  const discountPercent = calculateDiscountPercentage(price, compareAtPrice);

  const sizeClasses = {
    sm: "text-sm",
    md: "text-base font-semibold",
    lg: "text-xl font-bold",
    xl: "text-2xl sm:text-3xl font-extrabold",
  };

  return (
    <div className={`flex items-baseline gap-2 flex-wrap ${className}`}>
      <span className={`text-stone-900 tracking-tight font-medium ${sizeClasses[size]}`}>
        {formatPrice(price)}
      </span>

      {hasDiscount && (
        <>
          <span className="text-xs sm:text-sm text-stone-400 line-through">
            {formatPrice(compareAtPrice!)}
          </span>
          <span className="text-xs font-semibold text-rose-600 bg-rose-50 px-1.5 py-0.5 rounded">
            -{discountPercent}%
          </span>
        </>
      )}
    </div>
  );
};
