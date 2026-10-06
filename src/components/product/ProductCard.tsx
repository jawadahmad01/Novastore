import React, { useState } from "react";
import { Link } from "react-router-dom";
import { Product } from "@/src/types";
import { PriceDisplay } from "@/src/components/common/PriceDisplay";
import { RatingStars } from "@/src/components/common/RatingStars";
import { ImageWithFallback } from "@/src/components/common/ImageWithFallback";
import { useCart } from "@/src/context/CartContext";
import { useWishlist } from "@/src/context/WishlistContext";
import { Heart, ShoppingBag, Eye, Check } from "lucide-react";

interface ProductCardProps {
  product: Product;
  onQuickView?: (product: Product) => void;
}

export const ProductCard: React.FC<ProductCardProps> = ({ product, onQuickView }) => {
  const { addItem } = useCart();
  const { isInWishlist, toggleWishlist } = useWishlist();
  const [isHovered, setIsHovered] = useState(false);
  const [isAdding, setIsAdding] = useState(false);

  const isFavorite = isInWishlist(product.id);
  const secondaryImage = product.images?.[1] || product.thumbnail;

  const handleQuickAdd = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (isOutOfStock) return;
    setIsAdding(true);
    addItem(product);
    setTimeout(() => setIsAdding(false), 900);
  };

  const handleToggleWishlist = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    toggleWishlist(product);
  };

  const handleQuickView = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (onQuickView) {
      onQuickView(product);
    }
  };

  const isLowStock = product.stock > 0 && product.stock <= 5;
  const isOutOfStock = product.stock <= 0;

  return (
    <div
      className="group relative flex flex-col bg-white rounded-2xl border border-stone-200/90 overflow-hidden hover:border-stone-400 hover:shadow-md transition-all duration-250 w-full min-w-0"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Product Image Stage */}
      <Link
        to={`/products/${product.slug}`}
        className="relative aspect-square w-full bg-stone-100 overflow-hidden block"
      >
        {/* Main Image with safe fallback */}
        <ImageWithFallback
          src={isHovered && secondaryImage ? secondaryImage : product.thumbnail}
          alt={product.title}
          category={product.category}
          className="h-full w-full object-cover object-center transition-transform duration-500 group-hover:scale-105"
        />

        {/* Badges: Sale & Bestseller (clean, prominent, non-obtrusive) */}
        <div className="absolute top-2 left-2 flex flex-col gap-1 items-start z-10 pointer-events-none">
          {product.sale && (
            <span className="bg-rose-600 text-white text-[10px] sm:text-xs font-bold px-2 py-0.5 rounded-md shadow-xs tracking-wide">
              SALE
            </span>
          )}
          {product.bestSeller && !product.sale && (
            <span className="bg-amber-600 text-white text-[10px] sm:text-xs font-bold px-2 py-0.5 rounded-md shadow-xs tracking-wide">
              BESTSELLER
            </span>
          )}
          {product.newArrival && !product.sale && !product.bestSeller && (
            <span className="bg-stone-900 text-white text-[10px] sm:text-xs font-bold px-2 py-0.5 rounded-md shadow-xs tracking-wide">
              NEW
            </span>
          )}
        </div>

        {/* Wishlist Button: Large touch target (40px) */}
        <div className="absolute top-2 right-2 flex flex-col gap-1.5 z-10">
          <button
            onClick={handleToggleWishlist}
            aria-label={isFavorite ? "Remove from wishlist" : "Add to wishlist"}
            className={`w-9 h-9 sm:w-8 sm:h-8 rounded-full flex items-center justify-center backdrop-blur-md transition-all shadow-xs ${
              isFavorite
                ? "bg-white text-rose-600 border border-rose-200"
                : "bg-white/95 text-stone-600 hover:text-stone-900 hover:bg-white border border-stone-200/80"
            }`}
          >
            <Heart
              className={`w-4 h-4 transition-transform active:scale-125 ${
                isFavorite ? "fill-rose-500 text-rose-500" : ""
              }`}
            />
          </button>

          {/* Desktop Quick View */}
          {onQuickView && (
            <button
              onClick={handleQuickView}
              aria-label="Quick preview"
              className="hidden sm:flex w-8 h-8 rounded-full bg-white/95 hover:bg-white text-stone-600 hover:text-stone-900 items-center justify-center backdrop-blur-md transition-all border border-stone-200/80 shadow-xs opacity-0 group-hover:opacity-100"
            >
              <Eye className="w-4 h-4" />
            </button>
          )}
        </div>
      </Link>

      {/* Product Content Details */}
      <div className="p-3 sm:p-4 flex flex-col flex-1 min-w-0">
        {/* Category & Stock Status */}
        <div className="flex items-center gap-1.5 text-[11px] sm:text-xs text-stone-500 mb-1 truncate">
          <span className="font-semibold text-stone-600 truncate">{product.category}</span>
          <span aria-hidden="true">·</span>
          {isOutOfStock ? (
            <span className="text-rose-600 font-medium shrink-0">Out of stock</span>
          ) : isLowStock ? (
            <span className="text-amber-700 font-medium shrink-0">Only {product.stock} left</span>
          ) : (
            <span className="text-emerald-700 font-medium shrink-0">In Stock</span>
          )}
        </div>

        {/* Product Title (2-line clamp with min height for uniform card alignment) */}
        <Link
          to={`/products/${product.slug}`}
          className="font-medium text-stone-900 text-xs sm:text-sm hover:text-stone-700 transition-colors line-clamp-2 min-h-[2rem] sm:min-h-[2.5rem] leading-snug mb-1"
          title={product.title}
        >
          {product.title}
        </Link>

        {/* Rating Stars & Count */}
        <div className="mb-2">
          <RatingStars rating={product.rating} reviewCount={product.reviewCount} size="sm" />
        </div>

        {/* Pricing Stage */}
        <div className="mt-auto pt-2 border-t border-stone-100">
          <PriceDisplay
            price={product.price}
            compareAtPrice={product.compareAtPrice}
            size="sm"
            className="mb-2.5"
          />

          {/* Add to Cart Button (Mobile & Desktop) */}
          <button
            onClick={handleQuickAdd}
            disabled={isOutOfStock}
            aria-label={`Add ${product.title} to cart`}
            className={`w-full py-2 sm:py-2.5 px-3 rounded-xl text-xs font-semibold flex items-center justify-center gap-1.5 shadow-2xs transition-all active:scale-97 min-h-[40px] sm:min-h-[38px] ${
              isOutOfStock
                ? "bg-stone-100 text-stone-400 cursor-not-allowed border border-stone-200"
                : isAdding
                ? "bg-emerald-700 text-white"
                : "bg-stone-900 text-white hover:bg-stone-800"
            }`}
          >
            {isAdding ? (
              <>
                <Check className="w-3.5 h-3.5 text-white" />
                <span>Added</span>
              </>
            ) : isOutOfStock ? (
              <span>Out of Stock</span>
            ) : (
              <>
                <ShoppingBag className="w-3.5 h-3.5" />
                <span>Add to Cart</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};
