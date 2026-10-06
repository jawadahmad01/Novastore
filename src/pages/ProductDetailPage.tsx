import React, { useState, useEffect, useMemo, useRef } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { productService } from "@/src/lib/services/productService";
import { inventoryService } from "@/src/lib/services/inventoryService";
import { analytics } from "@/src/lib/analytics";
import { Product, ProductVariant, ProductReview } from "@/src/types";
import { useCart } from "@/src/context/CartContext";
import { useWishlist } from "@/src/context/WishlistContext";
import { PriceDisplay } from "@/src/components/common/PriceDisplay";
import { RatingStars } from "@/src/components/common/RatingStars";
import { Breadcrumbs } from "@/src/components/layout/Breadcrumbs";
import { ImageGallery } from "@/src/components/product/ImageGallery";
import { ReviewSection } from "@/src/components/product/ReviewSection";
import { ProductCarousel } from "@/src/components/product/ProductCarousel";
import { siteConfig } from "@/src/config/site";
import { SEO } from "@/src/components/common/SEO";
import reviewsData from "@/src/data/reviews.json";
import {
  Heart,
  ShoppingBag,
  Zap,
  Truck,
  RotateCcw,
  ShieldCheck,
  ChevronDown,
  Share2,
  Check,
  Plus,
  Minus,
  AlertCircle,
  HelpCircle,
  PackageOpen,
  ArrowRight,
  Info,
} from "lucide-react";
import { useToast } from "@/src/context/ToastContext";

const RECENTLY_VIEWED_KEY = "novastore_recently_viewed";

export const ProductDetailPage: React.FC = () => {
  const { slug } = useParams<{ slug: string }>();
  const navigate = useNavigate();
  const { addItem } = useCart();
  const { isInWishlist, toggleWishlist } = useWishlist();
  const { showToast } = useToast();

  const [product, setProduct] = useState<Product | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);
  const [selectedVariant, setSelectedVariant] = useState<ProductVariant | undefined>(undefined);
  const [quantity, setQuantity] = useState(1);

  // Tab & Accordion States
  const [activeTab, setActiveTab] = useState<"desc" | "specs" | "shipping" | "returns" | "faq" | "reviews">("desc");
  const [openAccordions, setOpenAccordions] = useState<{ [key: string]: boolean }>({
    desc: true,
    specs: false,
    shipping: false,
    returns: false,
    faq: false,
  });

  // Related & Recently Viewed Products
  const [relatedProducts, setRelatedProducts] = useState<Product[]>([]);
  const [recentlyViewed, setRecentlyViewed] = useState<Product[]>([]);

  // Intersection observer ref for sticky mobile bar visibility
  const buySectionRef = useRef<HTMLDivElement>(null);
  const [isBuySectionOffscreen, setIsBuySectionOffscreen] = useState(false);

  // Load product data
  useEffect(() => {
    async function loadProduct() {
      if (!slug) return;
      setIsLoading(true);
      setNotFound(false);
      try {
        const found = await productService.getProductBySlug(slug);
        if (!found) {
          setNotFound(true);
          return;
        }

        setProduct(found);
        setSelectedVariant(found.variants?.[0]);
        setQuantity(1);

        // Update document title and dynamic meta description for SEO
        document.title = `${found.title} — ${siteConfig.brand.name}`;
        const metaDesc = document.querySelector('meta[name="description"]');
        if (metaDesc) {
          metaDesc.setAttribute("content", found.shortDescription || found.description.slice(0, 160));
        }

        // Fetch related products scored by category, tags, and brand
        const related = await productService.getRelatedProducts(
          found.id,
          found.category,
          6,
          found.tags,
          found.brand
        );
        setRelatedProducts(related);

        // Track analytics view
        analytics.trackProductView(found);

        // Update recently viewed in localStorage (max 6 items, deduplicated)
        try {
          const stored = localStorage.getItem(RECENTLY_VIEWED_KEY);
          let list: Product[] = stored ? JSON.parse(stored) : [];
          list = [found, ...list.filter((p) => p.id !== found.id)].slice(0, 6);
          localStorage.setItem(RECENTLY_VIEWED_KEY, JSON.stringify(list));
          setRecentlyViewed(list.filter((p) => p.id !== found.id));
        } catch (e) {
          console.error("Failed to update recently viewed", e);
        }
      } catch (e) {
        console.error("Error loading product", e);
        setNotFound(true);
      } finally {
        setIsLoading(false);
      }
    }

    loadProduct();
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, [slug]);

  // Monitor visibility of primary buy section to toggle mobile sticky bar
  useEffect(() => {
    const handleScroll = () => {
      if (!buySectionRef.current) return;
      const rect = buySectionRef.current.getBoundingClientRect();
      setIsBuySectionOffscreen(rect.bottom < 60);
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const toggleAccordion = (key: string) => {
    setOpenAccordions((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  // Stock and Pricing calculations
  const stockStatus = useMemo(() => {
    if (!product) {
      return { inStock: false, isLowStock: false, availableQuantity: 0, label: "Out of Stock" as const, displayText: "Out of stock" };
    }
    return inventoryService.getStockStatus(product, selectedVariant);
  }, [product, selectedVariant]);

  const currentPrice = useMemo(() => {
    if (!product) return 0;
    return selectedVariant?.priceModifier
      ? product.price + selectedVariant.priceModifier
      : product.price;
  }, [product, selectedVariant]);

  const currentCompareAtPrice = useMemo(() => {
    if (!product || !product.compareAtPrice) return undefined;
    return selectedVariant?.priceModifier
      ? product.compareAtPrice + selectedVariant.priceModifier
      : product.compareAtPrice;
  }, [product, selectedVariant]);

  const discountPercentage = useMemo(() => {
    if (!currentCompareAtPrice || currentCompareAtPrice <= currentPrice) return 0;
    return Math.round(((currentCompareAtPrice - currentPrice) / currentCompareAtPrice) * 100);
  }, [currentPrice, currentCompareAtPrice]);

  const isFavorite = product ? isInWishlist(product.id) : false;

  // Add to cart handler
  const handleAddToCart = () => {
    if (!product || !stockStatus.inStock) return;
    addItem(product, selectedVariant, quantity);
  };

  // Buy now handler (adds to cart and navigates straight to checkout)
  const handleBuyNow = () => {
    if (!product || !stockStatus.inStock) return;
    addItem(product, selectedVariant, quantity);
    navigate("/checkout");
  };

  // Share handler
  const handleShare = () => {
    if (!product) return;
    if (navigator.share) {
      navigator.share({
        title: product.title,
        text: product.shortDescription,
        url: window.location.href,
      }).catch(() => {});
    } else {
      navigator.clipboard.writeText(window.location.href);
      showToast("Product link copied to clipboard!", "success");
    }
  };

  // Demo reviews for this product
  const productReviews: ProductReview[] = useMemo(() => {
    if (!product) return [];
    return (reviewsData as ProductReview[]).filter((r) => r.productId === product.id);
  }, [product]);

  // Loading skeleton state
  if (isLoading) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
        <div className="animate-pulse space-y-6">
          <div className="h-4 w-48 bg-stone-200 rounded" />
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12">
            <div className="lg:col-span-7 aspect-square bg-stone-200 rounded-2xl" />
            <div className="lg:col-span-5 space-y-4">
              <div className="h-4 w-28 bg-stone-200 rounded" />
              <div className="h-8 w-3/4 bg-stone-200 rounded" />
              <div className="h-6 w-1/3 bg-stone-200 rounded" />
              <div className="h-16 bg-stone-200 rounded-xl" />
              <div className="h-28 bg-stone-200 rounded-xl" />
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Not found state
  if (notFound || !product) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-20 text-center">
        <div className="w-16 h-16 rounded-2xl bg-stone-100 flex items-center justify-center mx-auto mb-4 text-stone-400">
          <PackageOpen className="w-8 h-8 stroke-[1.5]" />
        </div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-stone-900 tracking-tight mb-2">
          Product Not Found
        </h1>
        <p className="text-stone-500 text-sm max-w-md mx-auto mb-6">
          We could not find the product you requested. It may have been relocated, renamed, or is temporarily unavailable.
        </p>
        <div className="flex items-center justify-center gap-3">
          <Link
            to="/products"
            className="px-6 py-3 bg-stone-900 text-white rounded-xl text-xs sm:text-sm font-bold hover:bg-stone-800 transition-colors shadow-xs"
          >
            Explore Catalog
          </Link>
          <Link
            to="/"
            className="px-6 py-3 bg-white border border-stone-200 text-stone-700 rounded-xl text-xs sm:text-sm font-semibold hover:bg-stone-50 transition-colors"
          >
            Back to Home
          </Link>
        </div>
      </div>
    );
  }

  const breadcrumbs = [
    { label: "Home", href: "/" },
    { label: product.category, href: `/products?category=${encodeURIComponent(product.category)}` },
    { label: product.title },
  ];

  return (
    <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 py-5 sm:py-8 space-y-10 sm:space-y-14 overflow-x-hidden w-full">
      {/* Dynamic SEO & Schema.org Product markup */}
      <SEO
        title={product.title}
        description={product.shortDescription || product.description.slice(0, 150)}
        image={product.thumbnail || product.images[0]}
        type="product"
        schema={{
          "@context": "https://schema.org",
          "@type": "Product",
          name: product.title,
          image: product.images,
          description: product.description,
          sku: product.sku,
          brand: {
            "@type": "Brand",
            name: product.brand,
          },
          offers: {
            "@type": "Offer",
            url: typeof window !== "undefined" ? window.location.href : "",
            priceCurrency: product.currency || "PKR",
            price: currentPrice,
            availability: product.stock > 0 ? "https://schema.org/InStock" : "https://schema.org/OutOfStock",
            itemCondition: "https://schema.org/NewCondition",
          },
          aggregateRating: {
            "@type": "AggregateRating",
            ratingValue: product.rating,
            reviewCount: product.reviewCount || 1,
          },
        }}
      />

      {/* Clickable Breadcrumbs */}
      <Breadcrumbs items={breadcrumbs} />

      {/* Primary PDP Two-Column Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-start">
        {/* LEFT COLUMN: Gallery with swipe support and variant sync (7 cols) */}
        <div className="lg:col-span-7 w-full">
          <ImageGallery
            images={product.images}
            productTitle={product.title}
            variantImage={selectedVariant?.image}
          />
        </div>

        {/* RIGHT COLUMN: Product Information & Purchase Actions (5 cols) */}
        <div className="lg:col-span-5 space-y-5 sm:space-y-6">
          {/* Metadata: Category · Brand · SKU */}
          <div>
            <div className="flex items-center justify-between gap-2 mb-2">
              <div className="flex items-center gap-1.5 text-xs text-stone-500 truncate">
                <Link
                  to={`/products?category=${encodeURIComponent(product.category)}`}
                  className="font-bold text-stone-800 hover:text-stone-950 hover:underline uppercase tracking-wider text-[11px]"
                >
                  {product.category}
                </Link>
                <span aria-hidden="true">·</span>
                <span className="text-stone-600 font-medium">{product.brand}</span>
                <span aria-hidden="true">·</span>
                <span className="font-mono text-[11px] text-stone-400">
                  SKU: {selectedVariant?.sku || product.sku}
                </span>
              </div>

              {/* Share Button */}
              <button
                type="button"
                onClick={handleShare}
                aria-label="Share product"
                className="p-1.5 text-stone-400 hover:text-stone-900 rounded-lg hover:bg-stone-100 transition-colors shrink-0"
              >
                <Share2 className="w-4 h-4" />
              </button>
            </div>

            {/* Product Title */}
            <h1 className="text-xl sm:text-2xl lg:text-3xl font-extrabold text-stone-900 tracking-tight leading-snug">
              {product.title}
            </h1>

            {/* Star Rating & Review Link */}
            <div className="flex items-center gap-2 mt-2.5 pb-3 border-b border-stone-100">
              <RatingStars rating={product.rating} reviewCount={product.reviewCount} showValue size="sm" />
              <button
                type="button"
                onClick={() => {
                  setActiveTab("reviews");
                  const reviewElem = document.getElementById("pdp-reviews-section");
                  if (reviewElem) {
                    reviewElem.scrollIntoView({ behavior: "smooth" });
                  }
                }}
                className="text-xs text-stone-500 hover:text-stone-900 underline ml-1 cursor-pointer"
              >
                Read {product.reviewCount} reviews
              </button>
            </div>
          </div>

          {/* Pricing Stage with Strikethrough & Discount Badge */}
          <div className="bg-stone-50/80 p-4 sm:p-5 rounded-2xl border border-stone-200/90">
            <div className="flex items-center gap-3 flex-wrap">
              <PriceDisplay
                price={currentPrice}
                compareAtPrice={currentCompareAtPrice}
                size="xl"
              />
              {discountPercentage > 0 && (
                <span className="px-2.5 py-1 rounded-md bg-rose-600 text-white text-xs font-extrabold tracking-wide shadow-2xs">
                  {discountPercentage}% OFF
                </span>
              )}
            </div>

            <p className="text-[11px] sm:text-xs text-stone-500 mt-2 flex items-center gap-1.5">
              <Check className="w-3.5 h-3.5 text-emerald-600" />
              <span>Prices inclusive of all taxes. Free delivery on orders over Rs. {siteConfig.shipping.freeShippingThreshold.toLocaleString()}.</span>
            </p>
          </div>

          {/* Short Description */}
          <p className="text-xs sm:text-sm text-stone-600 leading-relaxed">
            {product.shortDescription}
          </p>

          {/* Dynamic Variant Selector (Color, Size, Style, Storage) */}
          {product.variants && product.variants.length > 0 && (
            <div className="space-y-3 pt-1">
              <div className="flex justify-between items-center text-xs">
                <span className="font-bold text-stone-900">
                  Select {product.variants[0].type.charAt(0).toUpperCase() + product.variants[0].type.slice(1)}:
                </span>
                <span className="font-semibold text-stone-700 bg-stone-100 px-2 py-0.5 rounded text-[11px]">
                  {selectedVariant?.value}
                </span>
              </div>

              <div className="flex flex-wrap gap-2">
                {product.variants.map((v) => {
                  const isSelected = selectedVariant?.id === v.id;
                  const isVariantOutOfStock = v.stock <= 0;

                  return (
                    <button
                      key={v.id}
                      type="button"
                      disabled={isVariantOutOfStock}
                      onClick={() => {
                        setSelectedVariant(v);
                        if (quantity > v.stock) {
                          setQuantity(Math.max(1, v.stock));
                        }
                      }}
                      className={`px-3.5 py-2 rounded-xl text-xs font-semibold border transition-all cursor-pointer ${
                        isSelected
                          ? "border-stone-900 bg-stone-900 text-white shadow-sm ring-1 ring-stone-900"
                          : isVariantOutOfStock
                          ? "border-stone-200 text-stone-300 line-through cursor-not-allowed bg-stone-50"
                          : "border-stone-200 text-stone-800 hover:border-stone-400 bg-white"
                      }`}
                    >
                      {v.value}
                      {v.priceModifier && v.priceModifier !== 0 ? ` (+Rs. ${v.priceModifier})` : ""}
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* Stock Status Indicator */}
          <div className="flex items-center gap-2 text-xs py-1">
            <span
              className={`w-2.5 h-2.5 rounded-full ${
                !stockStatus.inStock
                  ? "bg-rose-500"
                  : stockStatus.isLowStock
                  ? "bg-amber-500 animate-pulse"
                  : "bg-emerald-500 animate-pulse"
              }`}
            />
            <span
              className={`font-semibold ${
                !stockStatus.inStock
                  ? "text-rose-600"
                  : stockStatus.isLowStock
                  ? "text-amber-700 font-bold"
                  : "text-emerald-700"
              }`}
            >
              {!stockStatus.inStock
                ? "Out of Stock — This product is currently unavailable."
                : stockStatus.isLowStock
                ? `Low Stock: Only ${stockStatus.availableQuantity} left — order soon!`
                : `In Stock (${stockStatus.availableQuantity} units available)`}
            </span>
          </div>

          {/* Quantity Selector + Add to Cart + Buy Now + Wishlist */}
          <div ref={buySectionRef} className="space-y-3 pt-2">
            <div className="flex items-center gap-2 sm:gap-3">
              {/* Stepper ([-] 1 [+]) */}
              <div className="flex items-center border border-stone-200 rounded-xl bg-white overflow-hidden shadow-2xs">
                <button
                  type="button"
                  disabled={!stockStatus.inStock || quantity <= 1}
                  onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                  aria-label="Decrease quantity"
                  className="px-3.5 py-3 text-stone-600 hover:bg-stone-100 transition-colors disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
                >
                  <Minus className="w-3.5 h-3.5" />
                </button>
                <span className="px-3.5 text-xs sm:text-sm font-bold text-stone-900 select-none min-w-[28px] text-center">
                  {quantity}
                </span>
                <button
                  type="button"
                  disabled={!stockStatus.inStock || quantity >= stockStatus.availableQuantity}
                  onClick={() => setQuantity((q) => Math.min(stockStatus.availableQuantity, q + 1))}
                  aria-label="Increase quantity"
                  className="px-3.5 py-3 text-stone-600 hover:bg-stone-100 transition-colors disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
                >
                  <Plus className="w-3.5 h-3.5" />
                </button>
              </div>

              {/* Add to Cart Button */}
              <button
                type="button"
                onClick={handleAddToCart}
                disabled={!stockStatus.inStock}
                aria-label={`Add ${product.title} to cart`}
                className="flex-1 py-3.5 px-4 bg-stone-900 text-white rounded-xl text-xs sm:text-sm font-bold hover:bg-stone-800 transition-all flex items-center justify-center gap-2 shadow-xs disabled:bg-stone-200 disabled:text-stone-400 disabled:cursor-not-allowed active:scale-98 min-h-[48px] cursor-pointer"
              >
                <ShoppingBag className="w-4 h-4" />
                <span>{stockStatus.inStock ? "Add to Cart" : "Out of Stock"}</span>
              </button>

              {/* Wishlist Heart Button */}
              <button
                type="button"
                onClick={() => toggleWishlist(product)}
                aria-label={isFavorite ? "Remove from wishlist" : "Add to wishlist"}
                className={`p-3.5 rounded-xl border transition-colors min-h-[48px] min-w-[48px] flex items-center justify-center cursor-pointer ${
                  isFavorite
                    ? "bg-rose-50 border-rose-200 text-rose-600"
                    : "border-stone-200 text-stone-600 hover:text-stone-900 hover:border-stone-400 bg-white"
                }`}
              >
                <Heart className={`w-5 h-5 ${isFavorite ? "fill-rose-500 text-rose-500" : ""}`} />
              </button>
            </div>

            {/* Buy Now Direct Button */}
            <button
              type="button"
              onClick={handleBuyNow}
              disabled={!stockStatus.inStock}
              className="w-full py-3.5 px-5 bg-emerald-800 hover:bg-emerald-700 text-white rounded-xl text-xs sm:text-sm font-bold transition-all flex items-center justify-center gap-2 shadow-xs disabled:opacity-40 disabled:cursor-not-allowed min-h-[48px] active:scale-98 cursor-pointer"
            >
              <Zap className="w-4 h-4 fill-white" />
              <span>Buy Now with Cash on Delivery</span>
            </button>
          </div>

          {/* Pakistan Trust & Delivery Reassurance Badges */}
          <div className="pt-4 border-t border-stone-200 grid grid-cols-3 gap-2 text-center sm:text-left text-[11px] sm:text-xs text-stone-600">
            <div className="flex flex-col sm:flex-row items-center gap-1.5 p-2 rounded-lg bg-stone-50/70 border border-stone-100">
              <Truck className="w-4 h-4 text-stone-600 shrink-0" />
              <span className="leading-tight font-medium">Nationwide 2–7 Days</span>
            </div>
            <div className="flex flex-col sm:flex-row items-center gap-1.5 p-2 rounded-lg bg-stone-50/70 border border-stone-100">
              <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0" />
              <span className="leading-tight font-medium">Verified Genuine</span>
            </div>
            <div className="flex flex-col sm:flex-row items-center gap-1.5 p-2 rounded-lg bg-stone-50/70 border border-stone-100">
              <RotateCcw className="w-4 h-4 text-stone-600 shrink-0" />
              <span className="leading-tight font-medium">7-Day Inspection</span>
            </div>
          </div>
        </div>
      </div>

      {/* Accordions (Mobile) / Tabs (Desktop) for Detailed Information */}
      <div className="pt-8 border-t border-stone-200" id="pdp-details-section">
        {/* Desktop Tabs Header */}
        <div className="hidden md:flex border-b border-stone-200 overflow-x-auto gap-8">
          <button
            type="button"
            onClick={() => setActiveTab("desc")}
            className={`pb-4 text-xs sm:text-sm font-bold tracking-tight transition-colors border-b-2 -mb-px shrink-0 cursor-pointer ${
              activeTab === "desc"
                ? "border-stone-900 text-stone-900 font-extrabold"
                : "border-transparent text-stone-500 hover:text-stone-800"
            }`}
          >
            Product Overview
          </button>

          {product.specifications && product.specifications.length > 0 && (
            <button
              type="button"
              onClick={() => setActiveTab("specs")}
              className={`pb-4 text-xs sm:text-sm font-bold tracking-tight transition-colors border-b-2 -mb-px shrink-0 cursor-pointer ${
                activeTab === "specs"
                  ? "border-stone-900 text-stone-900 font-extrabold"
                  : "border-transparent text-stone-500 hover:text-stone-800"
              }`}
            >
              Technical Specifications
            </button>
          )}

          <button
            type="button"
            onClick={() => setActiveTab("shipping")}
            className={`pb-4 text-xs sm:text-sm font-bold tracking-tight transition-colors border-b-2 -mb-px shrink-0 cursor-pointer ${
              activeTab === "shipping"
                ? "border-stone-900 text-stone-900 font-extrabold"
                : "border-transparent text-stone-500 hover:text-stone-800"
            }`}
          >
            Shipping (Pakistan)
          </button>

          <button
            type="button"
            onClick={() => setActiveTab("returns")}
            className={`pb-4 text-xs sm:text-sm font-bold tracking-tight transition-colors border-b-2 -mb-px shrink-0 cursor-pointer ${
              activeTab === "returns"
                ? "border-stone-900 text-stone-900 font-extrabold"
                : "border-transparent text-stone-500 hover:text-stone-800"
            }`}
          >
            Returns & Refunds
          </button>

          <button
            type="button"
            onClick={() => setActiveTab("faq")}
            className={`pb-4 text-xs sm:text-sm font-bold tracking-tight transition-colors border-b-2 -mb-px shrink-0 cursor-pointer ${
              activeTab === "faq"
                ? "border-stone-900 text-stone-900 font-extrabold"
                : "border-transparent text-stone-500 hover:text-stone-800"
            }`}
          >
            Frequently Asked Questions
          </button>

          <button
            type="button"
            onClick={() => setActiveTab("reviews")}
            className={`pb-4 text-xs sm:text-sm font-bold tracking-tight transition-colors border-b-2 -mb-px shrink-0 cursor-pointer ${
              activeTab === "reviews"
                ? "border-stone-900 text-stone-900 font-extrabold"
                : "border-transparent text-stone-500 hover:text-stone-800"
            }`}
          >
            Customer Reviews ({product.reviewCount})
          </button>
        </div>

        {/* Desktop Tab Contents */}
        <div className="hidden md:block py-6">
          {activeTab === "desc" && (
            <div className="max-w-3xl space-y-4 text-sm text-stone-700 leading-relaxed">
              <h3 className="text-base font-bold text-stone-900">About this product</h3>
              <p>{product.description}</p>
              <div className="bg-stone-50 p-5 rounded-2xl border border-stone-200 mt-4 space-y-2.5">
                <h4 className="font-bold text-stone-900 text-sm">Highlights & Features:</h4>
                <ul className="list-disc list-inside space-y-1.5 text-xs sm:text-sm text-stone-600">
                  <li>Dispatched from verified fulfillment centers in Lahore & Karachi.</li>
                  <li>Every order is hand-inspected for physical damage before courier handover.</li>
                  <li>Tamper-evident security packaging with live SMS courier tracking updates.</li>
                  <li>Cash on Delivery (COD) supported nationwide across all major cities and towns.</li>
                </ul>
              </div>
            </div>
          )}

          {activeTab === "specs" && product.specifications && (
            <div className="max-w-3xl overflow-hidden rounded-xl border border-stone-200">
              <table className="w-full text-xs text-left">
                <tbody className="divide-y divide-stone-100">
                  {product.specifications.map((spec, i) => (
                    <tr key={i} className={i % 2 === 0 ? "bg-white" : "bg-stone-50/60"}>
                      <td className="py-3 px-4 font-semibold text-stone-700 w-1/3">{spec.name}</td>
                      <td className="py-3 px-4 text-stone-900">{spec.value}</td>
                    </tr>
                  ))}
                  <tr className="bg-white">
                    <td className="py-3 px-4 font-semibold text-stone-700">SKU Code</td>
                    <td className="py-3 px-4 font-mono text-stone-900">{selectedVariant?.sku || product.sku}</td>
                  </tr>
                  <tr className="bg-stone-50/60">
                    <td className="py-3 px-4 font-semibold text-stone-700">Stock Availability</td>
                    <td className="py-3 px-4 text-stone-900">{stockStatus.displayText}</td>
                  </tr>
                </tbody>
              </table>
            </div>
          )}

          {activeTab === "shipping" && (
            <div className="max-w-3xl space-y-4 text-xs sm:text-sm text-stone-700 leading-relaxed">
              <h3 className="font-bold text-stone-900 text-base">Delivery Available Across Pakistan</h3>
              <p>
                We deliver nationwide to all cities, towns, and districts across Punjab, Sindh, Khyber Pakhtunkhwa, Islamabad, Balochistan, Gilgit-Baltistan, and Azad Jammu & Kashmir.
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
                <div className="p-4 rounded-xl bg-stone-50 border border-stone-200">
                  <h4 className="font-bold text-stone-900 mb-1 text-sm">Standard Delivery (2–7 Business Days)</h4>
                  <p className="text-xs text-stone-600">
                    Estimated delivery time: 2–7 business days depending on city and location. Flat Rs. {siteConfig.shipping.standardFlatRate} (FREE on orders over Rs. {siteConfig.shipping.freeShippingThreshold.toLocaleString()}).
                  </p>
                </div>
                <div className="p-4 rounded-xl bg-stone-50 border border-stone-200">
                  <h4 className="font-bold text-stone-900 mb-1 text-sm">Express Priority Courier (1–3 Days)</h4>
                  <p className="text-xs text-stone-600">
                    Expedited dispatch via premier air couriers for Lahore, Karachi, and Islamabad / Rawalpindi. Flat Rs. {siteConfig.shipping.expressFlatRate}.
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2 p-3 bg-emerald-50 text-emerald-800 rounded-xl text-xs border border-emerald-200">
                <Info className="w-4 h-4 shrink-0 text-emerald-700" />
                <span>Cash on Delivery (COD) is supported on all standard courier parcels nationwide.</span>
              </div>
            </div>
          )}

          {activeTab === "returns" && (
            <div className="max-w-3xl space-y-4 text-xs sm:text-sm text-stone-700 leading-relaxed">
              <h3 className="font-bold text-stone-900 text-base">Returns & Exchange Policy</h3>
              <p className="text-stone-600">
                Returns are subject to NOVA STORE's return policy. Product eligibility, return period and conditions will be confirmed in the final policy.
              </p>
              <div className="p-4 rounded-xl bg-stone-50 border border-stone-200 space-y-2">
                <h4 className="font-bold text-stone-900 text-sm">Customer Protection Checklist:</h4>
                <ul className="list-disc list-inside space-y-1 text-xs text-stone-600">
                  <li>Inspect outer courier flyer for tampering prior to accepting from rider.</li>
                  <li>In the rare event of damage in transit, contact our WhatsApp support within 7 days.</li>
                  <li>Keep original retail box, documentation, and accessories intact.</li>
                </ul>
              </div>
            </div>
          )}

          {activeTab === "faq" && (
            <div className="max-w-3xl space-y-3">
              <h3 className="font-bold text-stone-900 text-base mb-2">Frequently Asked Questions</h3>
              <div className="space-y-3 text-xs sm:text-sm">
                <div className="p-4 rounded-xl bg-stone-50 border border-stone-200">
                  <h4 className="font-bold text-stone-900 mb-1">How does Cash on Delivery (COD) work?</h4>
                  <p className="text-stone-600">
                    You only pay the courier delivery rider in cash when the parcel arrives at your doorstep. No prepayment or credit card required.
                  </p>
                </div>
                <div className="p-4 rounded-xl bg-stone-50 border border-stone-200">
                  <h4 className="font-bold text-stone-900 mb-1">How do I track my order once dispatched?</h4>
                  <p className="text-stone-600">
                    Once your parcel is handed over to the courier (TCS, Trax, Leopard, CallCourier), you will receive an automated tracking link and SMS with the consignment number.
                  </p>
                </div>
                <div className="p-4 rounded-xl bg-stone-50 border border-stone-200">
                  <h4 className="font-bold text-stone-900 mb-1">What if the item is damaged or different from the description?</h4>
                  <p className="text-stone-600">
                    Our team provides a hassle-free exchange. Simply share your order number and photos with our support team within 7 days of receiving the item.
                  </p>
                </div>
              </div>
            </div>
          )}

          {activeTab === "reviews" && (
            <div id="pdp-reviews-section">
              <ReviewSection
                productId={product.id}
                initialReviews={productReviews}
                averageRating={product.rating}
                totalReviews={product.reviewCount}
              />
            </div>
          )}
        </div>

        {/* Mobile Accordions (Easy-to-tap touch friendly) */}
        <div className="md:hidden space-y-2">
          {/* Accordion 1: Description */}
          <div className="border border-stone-200 rounded-xl overflow-hidden bg-white">
            <button
              type="button"
              onClick={() => toggleAccordion("desc")}
              className="w-full px-4 py-3.5 flex items-center justify-between text-left text-xs font-bold text-stone-900 hover:bg-stone-50"
            >
              <span>Product Overview</span>
              <ChevronDown className={`w-4 h-4 text-stone-500 transition-transform ${openAccordions.desc ? "rotate-180" : ""}`} />
            </button>
            {openAccordions.desc && (
              <div className="px-4 pb-4 pt-1 text-xs text-stone-600 leading-relaxed border-t border-stone-100 space-y-2">
                <p>{product.description}</p>
                <div className="bg-stone-50 p-3 rounded-lg border border-stone-200">
                  <p className="font-bold text-stone-900 mb-1">Highlights:</p>
                  <ul className="list-disc list-inside space-y-1 text-stone-600">
                    <li>Dispatched from climate-controlled fulfillment centers.</li>
                    <li>Tamper-evident packaging with live SMS courier tracking.</li>
                  </ul>
                </div>
              </div>
            )}
          </div>

          {/* Accordion 2: Specifications (only if specs exist) */}
          {product.specifications && product.specifications.length > 0 && (
            <div className="border border-stone-200 rounded-xl overflow-hidden bg-white">
              <button
                type="button"
                onClick={() => toggleAccordion("specs")}
                className="w-full px-4 py-3.5 flex items-center justify-between text-left text-xs font-bold text-stone-900 hover:bg-stone-50"
              >
                <span>Technical Specifications</span>
                <ChevronDown className={`w-4 h-4 text-stone-500 transition-transform ${openAccordions.specs ? "rotate-180" : ""}`} />
              </button>
              {openAccordions.specs && (
                <div className="px-4 pb-4 pt-1 border-t border-stone-100">
                  <table className="w-full text-xs">
                    <tbody className="divide-y divide-stone-100">
                      {product.specifications.map((spec, i) => (
                        <tr key={i} className="py-2">
                          <td className="py-2 pr-2 font-semibold text-stone-600 w-1/3">{spec.name}</td>
                          <td className="py-2 text-stone-900">{spec.value}</td>
                        </tr>
                      ))}
                      <tr>
                        <td className="py-2 pr-2 font-semibold text-stone-600">SKU</td>
                        <td className="py-2 font-mono text-stone-900">{selectedVariant?.sku || product.sku}</td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}

          {/* Accordion 3: Shipping */}
          <div className="border border-stone-200 rounded-xl overflow-hidden bg-white">
            <button
              type="button"
              onClick={() => toggleAccordion("shipping")}
              className="w-full px-4 py-3.5 flex items-center justify-between text-left text-xs font-bold text-stone-900 hover:bg-stone-50"
            >
              <span>Shipping Information (Pakistan)</span>
              <ChevronDown className={`w-4 h-4 text-stone-500 transition-transform ${openAccordions.shipping ? "rotate-180" : ""}`} />
            </button>
            {openAccordions.shipping && (
              <div className="px-4 pb-4 pt-1 text-xs text-stone-600 leading-relaxed border-t border-stone-100 space-y-2">
                <p>
                  Delivery available across Pakistan. Estimated delivery time: 2–7 business days. Delivery time may vary by city and location.
                </p>
                <div className="p-3 bg-stone-50 rounded-lg border border-stone-200">
                  <p className="font-semibold text-stone-900">Cash on Delivery (COD) Supported</p>
                  <p className="text-[11px] text-stone-500 mt-0.5">Pay in cash upon doorstep delivery.</p>
                </div>
              </div>
            )}
          </div>

          {/* Accordion 4: Returns */}
          <div className="border border-stone-200 rounded-xl overflow-hidden bg-white">
            <button
              type="button"
              onClick={() => toggleAccordion("returns")}
              className="w-full px-4 py-3.5 flex items-center justify-between text-left text-xs font-bold text-stone-900 hover:bg-stone-50"
            >
              <span>Returns & Refunds</span>
              <ChevronDown className={`w-4 h-4 text-stone-500 transition-transform ${openAccordions.returns ? "rotate-180" : ""}`} />
            </button>
            {openAccordions.returns && (
              <div className="px-4 pb-4 pt-1 text-xs text-stone-600 leading-relaxed border-t border-stone-100">
                <p>
                  Returns are subject to NOVA STORE's return policy. Product eligibility, return period and conditions will be confirmed in the final policy.
                </p>
              </div>
            )}
          </div>

          {/* Accordion 5: FAQs */}
          <div className="border border-stone-200 rounded-xl overflow-hidden bg-white">
            <button
              type="button"
              onClick={() => toggleAccordion("faq")}
              className="w-full px-4 py-3.5 flex items-center justify-between text-left text-xs font-bold text-stone-900 hover:bg-stone-50"
            >
              <span>Frequently Asked Questions</span>
              <ChevronDown className={`w-4 h-4 text-stone-500 transition-transform ${openAccordions.faq ? "rotate-180" : ""}`} />
            </button>
            {openAccordions.faq && (
              <div className="px-4 pb-4 pt-1 text-xs text-stone-600 leading-relaxed border-t border-stone-100 space-y-3">
                <div>
                  <h4 className="font-bold text-stone-900">How does Cash on Delivery work?</h4>
                  <p className="text-stone-600 text-[11px] mt-0.5">Pay the delivery rider in cash when your parcel is delivered.</p>
                </div>
                <div>
                  <h4 className="font-bold text-stone-900">How do I track my order?</h4>
                  <p className="text-stone-600 text-[11px] mt-0.5">You will receive courier tracking details by SMS upon dispatch.</p>
                </div>
              </div>
            )}
          </div>

          {/* Accordion 6: Reviews */}
          <div className="border border-stone-200 rounded-xl overflow-hidden bg-white">
            <button
              type="button"
              onClick={() => toggleAccordion("reviews")}
              className="w-full px-4 py-3.5 flex items-center justify-between text-left text-xs font-bold text-stone-900 hover:bg-stone-50"
            >
              <span>Customer Reviews ({product.reviewCount})</span>
              <ChevronDown className={`w-4 h-4 text-stone-500 transition-transform ${openAccordions.reviews ? "rotate-180" : ""}`} />
            </button>
            {openAccordions.reviews && (
              <div className="px-3 pb-4 pt-1 border-t border-stone-100" id="pdp-reviews-mobile">
                <ReviewSection
                  productId={product.id}
                  initialReviews={productReviews}
                  averageRating={product.rating}
                  totalReviews={product.reviewCount}
                />
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Related Products Carousel */}
      {relatedProducts.length > 0 && (
        <section className="pt-8 border-t border-stone-200">
          <ProductCarousel
            title="Related Products"
            subtitle={`More from ${product.category}`}
            products={relatedProducts}
            viewAllLink={`/products?category=${encodeURIComponent(product.category)}`}
          />
        </section>
      )}

      {/* Recently Viewed Products */}
      {recentlyViewed.length > 0 && (
        <section className="pt-8 border-t border-stone-200">
          <ProductCarousel
            title="Recently Viewed"
            subtitle="Products you checked out"
            products={recentlyViewed}
          />
        </section>
      )}

      {/* Sticky Mobile Purchase Bar (only on small viewports when main buy button scrolls offscreen) */}
      <div
        className={`sm:hidden fixed bottom-0 left-0 right-0 z-40 bg-white/95 backdrop-blur-md border-t border-stone-200 p-3 shadow-xl transition-all duration-300 ${
          isBuySectionOffscreen ? "translate-y-0 opacity-100" : "translate-y-full opacity-0 pointer-events-none"
        }`}
      >
        <div className="flex items-center justify-between gap-3">
          <div className="min-w-0 flex-1">
            <p className="text-[11px] font-bold text-stone-900 truncate">{product.title}</p>
            <p className="text-xs font-extrabold text-stone-900">
              Rs. {currentPrice.toLocaleString()}
            </p>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <button
              type="button"
              onClick={handleAddToCart}
              disabled={!stockStatus.inStock}
              className="py-2.5 px-3.5 bg-stone-900 text-white rounded-xl text-xs font-bold hover:bg-stone-800 transition-colors disabled:bg-stone-200 disabled:text-stone-400 active:scale-95"
            >
              Add to Cart
            </button>
            <button
              type="button"
              onClick={handleBuyNow}
              disabled={!stockStatus.inStock}
              className="py-2.5 px-3.5 bg-emerald-800 text-white rounded-xl text-xs font-bold hover:bg-emerald-700 transition-colors disabled:opacity-40 active:scale-95"
            >
              Buy Now
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
