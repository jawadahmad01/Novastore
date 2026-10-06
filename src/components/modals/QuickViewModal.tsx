import React, { useState } from "react";
import { Link } from "react-router-dom";
import { Product, ProductVariant } from "@/src/types";
import { PriceDisplay } from "@/src/components/common/PriceDisplay";
import { RatingStars } from "@/src/components/common/RatingStars";
import { useCart } from "@/src/context/CartContext";
import { useWishlist } from "@/src/context/WishlistContext";
import { inventoryService } from "@/src/lib/services/inventoryService";
import { ImageWithFallback } from "@/src/components/common/ImageWithFallback";
import { X, Heart, Plus, Minus, ShoppingBag, ArrowRight, ShieldCheck, Check } from "lucide-react";

interface QuickViewModalProps {
  product: Product | null;
  onClose: () => void;
}

export const QuickViewModal: React.FC<QuickViewModalProps> = ({ product, onClose }) => {
  const { addItem } = useCart();
  const { isInWishlist, toggleWishlist } = useWishlist();

  const [selectedVariant, setSelectedVariant] = useState<ProductVariant | undefined>(
    product?.variants?.[0]
  );
  const [quantity, setQuantity] = useState(1);
  const [activeImageIndex, setActiveImageIndex] = useState(0);

  if (!product) return null;

  const isFavorite = isInWishlist(product.id);
  const stockStatus = inventoryService.getStockStatus(product, selectedVariant);
  const currentPrice = selectedVariant?.priceModifier
    ? product.price + selectedVariant.priceModifier
    : product.price;

  const handleAddToCart = () => {
    addItem(product, selectedVariant, quantity);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-stone-900/60 backdrop-blur-xs transition-opacity"
        onClick={onClose}
      />

      {/* Modal Container */}
      <div className="relative w-full max-w-3xl bg-white rounded-2xl shadow-2xl overflow-hidden z-10 border border-stone-200 animate-in zoom-in-95 duration-200 max-h-[90vh] flex flex-col md:flex-row">
        {/* Close Button */}
        <button
          onClick={onClose}
          aria-label="Close dialog"
          className="absolute top-3 right-3 p-1.5 text-stone-400 hover:text-stone-900 rounded-lg hover:bg-stone-100 transition-colors z-20"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Product Image Stage */}
        <div className="w-full md:w-1/2 bg-stone-100 flex flex-col justify-between p-4">
          <div className="aspect-square w-full rounded-xl overflow-hidden bg-white">
            <ImageWithFallback
              src={product.images[activeImageIndex] || product.thumbnail}
              alt={product.title}
              category={product.category}
              className="w-full h-full object-cover"
            />
          </div>

          {/* Thumbnail list */}
          {product.images.length > 1 && (
            <div className="flex gap-2 mt-3 overflow-x-auto pb-1">
              {product.images.map((img, idx) => (
                <button
                  key={idx}
                  onClick={() => setActiveImageIndex(idx)}
                  className={`w-14 h-14 rounded-lg overflow-hidden border-2 shrink-0 transition-all ${
                    activeImageIndex === idx ? "border-stone-900" : "border-transparent opacity-60 hover:opacity-100"
                  }`}
                >
                  <ImageWithFallback src={img} alt="" category={product.category} className="w-full h-full object-cover" />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Product Info & Actions */}
        <div className="w-full md:w-1/2 p-6 flex flex-col justify-between overflow-y-auto">
          <div>
            <div className="flex items-center gap-1.5 text-xs text-stone-500 mb-1">
              <span className="font-medium text-stone-700">{product.category}</span>
              <span aria-hidden="true">·</span>
              <span className="font-mono text-stone-400">SKU: {selectedVariant?.sku || product.sku}</span>
            </div>

            <h2 className="text-lg sm:text-xl font-bold text-stone-900 tracking-tight mb-2">
              {product.title}
            </h2>

            <div className="mb-3">
              <RatingStars rating={product.rating} reviewCount={product.reviewCount} showValue size="sm" />
            </div>

            <div className="mb-4">
              <PriceDisplay price={currentPrice} compareAtPrice={product.compareAtPrice} size="lg" />
            </div>

            <p className="text-xs text-stone-600 line-clamp-3 mb-5 leading-relaxed">
              {product.shortDescription || product.description}
            </p>

            {/* Variants */}
            {product.variants && product.variants.length > 0 && (
              <div className="mb-5">
                <label className="text-xs font-semibold text-stone-800 mb-2 block">
                  Select {product.variants[0].type.toUpperCase()}:{" "}
                  <span className="font-normal text-stone-600">{selectedVariant?.value}</span>
                </label>
                <div className="flex flex-wrap gap-2">
                  {product.variants.map((v) => {
                    const isSelected = selectedVariant?.id === v.id;
                    const isVariantOutOfStock = v.stock <= 0;

                    return (
                      <button
                        key={v.id}
                        disabled={isVariantOutOfStock}
                        onClick={() => setSelectedVariant(v)}
                        className={`px-3 py-1.5 rounded-lg text-xs font-medium border transition-all ${
                          isSelected
                            ? "border-stone-900 bg-stone-900 text-white shadow-xs"
                            : isVariantOutOfStock
                            ? "border-stone-200 text-stone-300 line-through cursor-not-allowed"
                            : "border-stone-200 text-stone-700 hover:border-stone-400 bg-white"
                        }`}
                      >
                        {v.value}
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Stock status indicator */}
            <div className="text-xs mb-5">
              <span
                className={`font-semibold ${
                  stockStatus.inStock ? "text-emerald-700" : "text-rose-600"
                }`}
              >
                {stockStatus.displayText}
              </span>
            </div>
          </div>

          {/* Action Row: Stepper + Add to Cart + Wishlist */}
          <div className="space-y-3 pt-4 border-t border-stone-100">
            <div className="flex items-center gap-3">
              {/* Stepper */}
              <div className="flex items-center border border-stone-200 rounded-xl bg-white overflow-hidden">
                <button
                  onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                  className="px-2.5 py-2 text-stone-600 hover:bg-stone-100 transition-colors"
                >
                  <Minus className="w-3.5 h-3.5" />
                </button>
                <span className="px-3 text-xs font-bold text-stone-900">{quantity}</span>
                <button
                  onClick={() => setQuantity((q) => Math.min(stockStatus.availableQuantity, q + 1))}
                  className="px-2.5 py-2 text-stone-600 hover:bg-stone-100 transition-colors"
                >
                  <Plus className="w-3.5 h-3.5" />
                </button>
              </div>

              {/* Add to Cart Button */}
              <button
                onClick={handleAddToCart}
                disabled={!stockStatus.inStock}
                className="flex-1 py-2.5 px-4 bg-stone-900 text-white rounded-xl text-xs font-semibold hover:bg-stone-800 transition-colors flex items-center justify-center gap-2 shadow-sm disabled:bg-stone-200 disabled:text-stone-400"
              >
                <ShoppingBag className="w-4 h-4" />
                <span>Add to Cart</span>
              </button>

              {/* Wishlist Button */}
              <button
                onClick={() => toggleWishlist(product)}
                aria-label="Wishlist"
                className={`p-2.5 rounded-xl border transition-colors ${
                  isFavorite
                    ? "bg-rose-50 border-rose-200 text-rose-600"
                    : "border-stone-200 text-stone-600 hover:text-stone-900 hover:border-stone-400"
                }`}
              >
                <Heart className={`w-4 h-4 ${isFavorite ? "fill-rose-500" : ""}`} />
              </button>
            </div>

            {/* View Full Product Link */}
            <Link
              to={`/products/${product.slug}`}
              onClick={onClose}
              className="text-xs text-stone-500 hover:text-stone-900 flex items-center justify-center gap-1 transition-colors"
            >
              <span>View full product details</span>
              <ArrowRight className="w-3 h-3" />
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};
