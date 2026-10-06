import React from "react";
import { Link } from "react-router-dom";
import { useWishlist } from "@/src/context/WishlistContext";
import { useCart } from "@/src/context/CartContext";
import { formatPrice } from "@/src/lib/utils/formatters";
import { Breadcrumbs } from "@/src/components/layout/Breadcrumbs";
import { EmptyState } from "@/src/components/common/LoadingSkeleton";
import { RatingStars } from "@/src/components/common/RatingStars";
import { PriceDisplay } from "@/src/components/common/PriceDisplay";
import { ImageWithFallback } from "@/src/components/common/ImageWithFallback";
import { Heart, ShoppingBag, Trash2, ArrowRight } from "lucide-react";

export const WishlistPage: React.FC = () => {
  const { wishlist, removeFromWishlist, moveToCart } = useWishlist();
  const { addItem } = useCart();

  if (wishlist.length === 0) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <Breadcrumbs items={[{ label: "Wishlist" }]} />
        <div className="py-12">
          <EmptyState
            icon={Heart}
            title="Save products you love for later"
            description="Your wishlist is currently empty. Tap the heart icon on any product to save it here while you browse."
            actionText="Explore Catalog"
            actionHref="/products"
          />
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
      <Breadcrumbs items={[{ label: "Wishlist" }]} />

      <div className="flex items-center justify-between pb-4 border-b border-stone-200">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-stone-900 tracking-tight">
            My Wishlist
          </h1>
          <p className="text-xs text-stone-500 mt-1">
            {wishlist.length} {wishlist.length === 1 ? "saved item" : "saved items"}
          </p>
        </div>

        <Link
          to="/products"
          className="text-xs font-semibold text-stone-900 hover:text-stone-700 flex items-center gap-1"
        >
          <span>Continue Shopping</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </Link>
      </div>

      {/* Grid of Wishlist items */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6">
        {wishlist.map((product) => {
          const isOutOfStock = product.stock <= 0;

          return (
            <div
              key={product.id}
              className="bg-white rounded-2xl border border-stone-200 overflow-hidden flex flex-col justify-between shadow-2xs hover:shadow-sm transition-all"
            >
              <div>
                {/* Image Stage */}
                <div className="relative aspect-square bg-stone-100 overflow-hidden">
                  <Link to={`/products/${product.slug}`} className="block w-full h-full">
                    <ImageWithFallback
                      src={product.thumbnail}
                      alt={product.title}
                      category={product.category}
                      className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
                    />
                  </Link>

                  <button
                    onClick={() => removeFromWishlist(product.id)}
                    aria-label="Remove from wishlist"
                    className="absolute top-2.5 right-2.5 w-8 h-8 rounded-full bg-white/90 text-stone-400 hover:text-rose-600 flex items-center justify-center shadow-sm transition-colors"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>

                {/* Details */}
                <div className="p-4 space-y-2">
                  <p className="text-[11px] text-stone-400 font-medium">{product.category}</p>
                  <Link
                    to={`/products/${product.slug}`}
                    className="text-xs sm:text-sm font-semibold text-stone-900 hover:text-stone-700 line-clamp-1 block"
                  >
                    {product.title}
                  </Link>

                  <RatingStars rating={product.rating} reviewCount={product.reviewCount} size="sm" />

                  <PriceDisplay price={product.price} compareAtPrice={product.compareAtPrice} size="sm" />

                  <p className="text-[11px] font-semibold">
                    {isOutOfStock ? (
                      <span className="text-rose-600">Out of Stock</span>
                    ) : (
                      <span className="text-emerald-700">In Stock & Ready</span>
                    )}
                  </p>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="p-4 pt-0 space-y-2">
                <button
                  onClick={() => moveToCart(product)}
                  disabled={isOutOfStock}
                  className="w-full py-2.5 px-3 bg-stone-900 hover:bg-stone-800 text-white rounded-xl text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors shadow-2xs disabled:bg-stone-200 disabled:text-stone-400"
                >
                  <ShoppingBag className="w-3.5 h-3.5" />
                  <span>Move to Cart</span>
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
