import React, { useRef } from "react";
import { Link } from "react-router-dom";
import { Product } from "@/src/types";
import { ProductCard } from "@/src/components/product/ProductCard";
import { ChevronLeft, ChevronRight, ArrowRight } from "lucide-react";

interface ProductGridProps {
  products: Product[];
  onQuickView?: (product: Product) => void;
  className?: string;
}

export const ProductGrid: React.FC<ProductGridProps> = ({
  products,
  onQuickView,
  className = "",
}) => {
  return (
    <div
      className={`grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-6 w-full ${className}`}
    >
      {products.map((product) => (
        <ProductCard key={product.id} product={product} onQuickView={onQuickView} />
      ))}
    </div>
  );
};

interface ProductCarouselProps {
  title?: string;
  subtitle?: string;
  products: Product[];
  onQuickView?: (product: Product) => void;
  viewAllLink?: string;
}

export const ProductCarousel: React.FC<ProductCarouselProps> = ({
  title,
  subtitle,
  products,
  onQuickView,
  viewAllLink,
}) => {
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  const scroll = (direction: "left" | "right") => {
    if (scrollContainerRef.current) {
      const offset = scrollContainerRef.current.clientWidth * 0.75;
      scrollContainerRef.current.scrollBy({
        left: direction === "left" ? -offset : offset,
        behavior: "smooth",
      });
    }
  };

  return (
    <div className="relative w-full overflow-hidden">
      {/* Header with Title and Scroll Controls */}
      {(title || subtitle) && (
        <div className="flex items-end justify-between mb-4 sm:mb-6">
          <div>
            {subtitle && (
              <p className="text-[11px] sm:text-xs uppercase tracking-wider text-stone-500 font-bold mb-1">
                {subtitle}
              </p>
            )}
            {title && (
              <h2 className="text-xl sm:text-2xl lg:text-3xl font-extrabold text-stone-900 tracking-tight">
                {title}
              </h2>
            )}
          </div>

          <div className="flex items-center gap-2">
            {viewAllLink && (
              <Link
                to={viewAllLink}
                className="hidden sm:flex items-center gap-1 text-xs font-semibold text-stone-900 hover:text-stone-700 mr-2"
              >
                <span>View all</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            )}

            <button
              onClick={() => scroll("left")}
              aria-label="Previous items"
              className="w-8 h-8 sm:w-9 sm:h-9 rounded-full border border-stone-200 bg-white hover:bg-stone-50 active:bg-stone-100 flex items-center justify-center text-stone-700 transition-colors shadow-2xs"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <button
              onClick={() => scroll("right")}
              aria-label="Next items"
              className="w-8 h-8 sm:w-9 sm:h-9 rounded-full border border-stone-200 bg-white hover:bg-stone-50 active:bg-stone-100 flex items-center justify-center text-stone-700 transition-colors shadow-2xs"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* Swipeable Track: Perfectly sized for mobile cards so no horizontal screen overflow */}
      <div
        ref={scrollContainerRef}
        className="flex gap-3 sm:gap-5 overflow-x-auto pb-3 pt-1 snap-x snap-mandatory scroll-smooth no-scrollbar w-full"
        style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
      >
        {products.map((product) => (
          <div
            key={product.id}
            className="w-[170px] sm:w-[220px] md:w-[250px] shrink-0 snap-start flex flex-col"
          >
            <ProductCard product={product} onQuickView={onQuickView} />
          </div>
        ))}
      </div>
    </div>
  );
};
