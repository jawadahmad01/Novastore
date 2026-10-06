import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { siteConfig } from "@/src/config/site";
import { productService } from "@/src/lib/services/productService";
import { hubspot } from "@/src/lib/hubspot";
import { analytics } from "@/src/lib/analytics";
import { useToast } from "@/src/context/ToastContext";
import { Product } from "@/src/types";
import { ProductCard } from "@/src/components/product/ProductCard";
import { ProductCarousel } from "@/src/components/product/ProductCarousel";
import { QuickViewModal } from "@/src/components/modals/QuickViewModal";
import { ImageWithFallback } from "@/src/components/common/ImageWithFallback";
import { SEO } from "@/src/components/common/SEO";
import {
  Truck,
  ShieldCheck,
  RotateCcw,
  Headphones,
  ArrowRight,
  Flame,
  Sparkles,
  Clock,
  CheckCircle2,
} from "lucide-react";

export const HomePage: React.FC = () => {
  const [featuredProducts, setFeaturedProducts] = useState<Product[]>([]);
  const [bestSellers, setBestSellers] = useState<Product[]>([]);
  const [newArrivals, setNewArrivals] = useState<Product[]>([]);
  const [flashDeals, setFlashDeals] = useState<Product[]>([]);
  const [quickViewProduct, setQuickViewProduct] = useState<Product | null>(null);

  // Newsletter state
  const [newsletterEmail, setNewsletterEmail] = useState("");
  const [isSubscribing, setIsSubscribing] = useState(false);
  const [newsletterSuccess, setNewsletterSuccess] = useState(false);
  const { showToast } = useToast();

  // Flash sale countdown timer state
  const [timeLeft, setTimeLeft] = useState({
    hours: 14,
    minutes: 36,
    seconds: 48,
  });

  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev.seconds > 0) {
          return { ...prev, seconds: prev.seconds - 1 };
        } else if (prev.minutes > 0) {
          return { ...prev, minutes: prev.minutes - 1, seconds: 59 };
        } else if (prev.hours > 0) {
          return { hours: prev.hours - 1, minutes: 59, seconds: 59 };
        }
        return { hours: 24, minutes: 0, seconds: 0 };
      });
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    async function loadData() {
      const [featured, best, newest, deals] = await Promise.all([
        productService.getFeaturedProducts(8),
        productService.getBestSellers(6),
        productService.getNewArrivals(6),
        productService.getFlashDeals(4),
      ]);
      setFeaturedProducts(featured);
      setBestSellers(best);
      setNewArrivals(newest);
      setFlashDeals(deals);
    }
    loadData();
    analytics.trackPageView("Home — NOVA STORE", "/");
  }, []);

  const handleNewsletterSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newsletterEmail || !newsletterEmail.includes("@")) {
      showToast("Please enter a valid email address.", "error");
      return;
    }

    setIsSubscribing(true);
    try {
      await hubspot.syncContactToHubSpot({
        email: newsletterEmail,
        lifecycleStage: "subscriber",
        source: "homepage_newsletter_section",
      });
      await hubspot.submitLeadForm({
        formId: "homepage-newsletter",
        formName: "newsletter",
        email: newsletterEmail,
        submittedAt: new Date().toISOString(),
      });
      analytics.trackNewsletterSignup(newsletterEmail, "homepage");

      setNewsletterSuccess(true);
      showToast("Welcome! Check your email for special welcome offers.", "success");
      setNewsletterEmail("");
    } catch {
      showToast("Subscription failed. Please try again.", "error");
    } finally {
      setIsSubscribing(false);
    }
  };

  const categories = [
    {
      title: "Electronics",
      description: "Audio, smartwatches & accessories",
      count: "6 Products",
      image: "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=800&auto=format&fit=crop&q=80",
      link: "/products?category=Electronics",
    },
    {
      title: "Mobile Accessories",
      description: "Power banks, fast cables & stands",
      count: "4 Products",
      image: "https://images.unsplash.com/photo-1583863788434-e58a36330cf0?w=800&auto=format&fit=crop&q=80",
      link: "/products?category=Mobile%20Accessories",
    },
    {
      title: "Home & Lifestyle",
      description: "LED lamps, desk decor & ceramics",
      count: "4 Products",
      image: "https://images.unsplash.com/photo-1513506003901-1e6a229e2d15?w=800&auto=format&fit=crop&q=80",
      link: "/products?category=Home%20%26%20Lifestyle",
    },
    {
      title: "Fashion",
      description: "Heavyweight tees, Oxford shirts & chinos",
      count: "4 Products",
      image: "https://images.unsplash.com/photo-1521572267360-ee0c2909d518?w=800&auto=format&fit=crop&q=80",
      link: "/products?category=Fashion",
    },
    {
      title: "Beauty & Personal Care",
      description: "Sonic brushes, diffusers & grooming",
      count: "4 Products",
      image: "https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?w=800&auto=format&fit=crop&q=80",
      link: "/products?category=Beauty%20%26%20Personal%20Care",
    },
    {
      title: "Kitchen",
      description: "Electric kettles & organizers",
      count: "3 Products",
      image: "https://images.unsplash.com/photo-1556911220-e15b29be8c8f?w=800&auto=format&fit=crop&q=80",
      link: "/products?category=Kitchen",
    },
    {
      title: "Sports & Fitness",
      description: "Bottles, resistance bands & gear",
      count: "3 Products",
      image: "https://images.unsplash.com/photo-1517838277536-f5f99be501cd?w=800&auto=format&fit=crop&q=80",
      link: "/products?category=Sports%20%26%20Fitness",
    },
    {
      title: "Bags & Accessories",
      description: "Commuter backpacks, wallets & shades",
      count: "3 Products",
      image: "https://images.unsplash.com/photo-1622560480605-d83c853bc5c3?w=800&auto=format&fit=crop&q=80",
      link: "/products?category=Bags%20%26%20Accessories",
    },
  ];

  return (
    <div className="space-y-12 sm:space-y-20 pb-16 overflow-x-hidden w-full">
      <SEO
        title="Quality Essentials & Tech Across Pakistan"
        description="Discover verified electronics, tailored apparel, handcrafted leather goods, and modern home essentials with transparent PKR pricing and nationwide delivery."
        type="website"
        schema={{
          "@context": "https://schema.org",
          "@type": "WebStore",
          name: siteConfig.brand.name,
          description: siteConfig.brand.description,
          url: "https://novastore.pk",
          potentialAction: {
            "@type": "SearchAction",
            target: "https://novastore.pk/products?search={search_term_string}",
            "query-input": "required name=search_term_string",
          },
        }}
      />
      {/* 1. HERO SECTION */}
      <section className="relative overflow-hidden bg-stone-900 text-white rounded-2xl sm:rounded-3xl mx-3 sm:mx-6 lg:mx-8 mt-3 sm:mt-6 border border-stone-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-8 lg:px-12 py-12 sm:py-20 lg:py-28 grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center">
          {/* Hero Copy */}
          <div className="lg:col-span-7 space-y-4 sm:space-y-6 z-10 text-center lg:text-left">
            <div className="inline-flex items-center gap-2 bg-stone-800/90 text-stone-200 text-[11px] sm:text-xs px-3 py-1.5 rounded-full border border-stone-700/80">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              <span className="font-semibold">Nationwide Cash on Delivery across Pakistan</span>
            </div>

            <h1 className="text-2xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight text-white leading-tight sm:leading-snug">
              Everything You Want. <br className="hidden sm:block" />
              <span className="text-stone-300">One Better Store.</span>
            </h1>

            <p className="text-stone-400 text-xs sm:text-base max-w-xl mx-auto lg:mx-0 leading-relaxed font-normal">
              Discover verified electronics, tailored apparel, handcrafted leather goods, and modern home essentials with transparent PKR pricing and prompt courier delivery.
            </p>

            <div className="flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-3 pt-2">
              <Link
                to="/products"
                className="w-full sm:w-auto px-7 py-3.5 bg-white text-stone-900 rounded-xl text-xs sm:text-sm font-bold hover:bg-stone-100 transition-all flex items-center justify-center gap-2 shadow-lg active:scale-97 min-h-[44px]"
              >
                <span>Shop Collection</span>
                <ArrowRight className="w-4 h-4" />
              </Link>

              <Link
                to="/deals"
                className="w-full sm:w-auto px-6 py-3.5 bg-stone-800/90 hover:bg-stone-800 text-white border border-stone-700 rounded-xl text-xs sm:text-sm font-semibold transition-all flex items-center justify-center gap-2 active:scale-97 min-h-[44px]"
              >
                <Flame className="w-4 h-4 text-rose-400" />
                <span>Explore Deals</span>
              </Link>
            </div>
          </div>

          {/* Hero Visual Imagery */}
          <div className="lg:col-span-5 relative w-full">
            <div className="relative aspect-4/3 sm:aspect-square rounded-2xl overflow-hidden shadow-2xl border border-stone-800 group">
              <ImageWithFallback
                src="https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=1000&auto=format&fit=crop&q=80"
                alt="Acoustic Pro ANC Headphones"
                category="Electronics"
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-stone-950/85 via-stone-950/20 to-transparent pointer-events-none" />

              {/* Floating product card tag */}
              <div className="absolute bottom-3 left-3 right-3 sm:bottom-4 sm:left-4 sm:right-4 bg-stone-900/90 backdrop-blur-md p-3 sm:p-4 rounded-xl border border-stone-700 flex items-center justify-between gap-3">
                <div className="min-w-0">
                  <p className="text-[10px] text-stone-400 uppercase tracking-wider font-semibold">Featured</p>
                  <p className="text-xs sm:text-sm font-bold text-white truncate">Acoustic Pro ANC Headphones</p>
                  <p className="text-xs font-bold text-emerald-400 mt-0.5">Rs. 14,999</p>
                </div>
                <Link
                  to="/products/acoustic-pro-wireless-noise-cancelling-headphones"
                  className="px-3.5 py-2 bg-white text-stone-900 rounded-lg text-xs font-bold hover:bg-stone-200 transition-colors shrink-0"
                >
                  View
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 2. CATEGORIES SECTION */}
      <section className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8">
        <div className="flex items-end justify-between mb-5 sm:mb-8">
          <div>
            <p className="text-[11px] sm:text-xs uppercase tracking-wider text-stone-500 font-bold mb-1">
              Curated Collections
            </p>
            <h2 className="text-xl sm:text-3xl font-extrabold text-stone-900 tracking-tight">
              Shop by Category
            </h2>
          </div>
          <Link
            to="/products"
            className="text-xs sm:text-sm font-semibold text-stone-900 hover:text-stone-600 flex items-center gap-1 transition-colors"
          >
            <span>All Categories</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>

        {/* 2-column on mobile, 4-column on desktop */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-6">
          {categories.map((cat) => (
            <Link
              key={cat.title}
              to={cat.link}
              className="group relative rounded-2xl overflow-hidden aspect-[4/5] sm:aspect-[3/4] bg-stone-100 flex flex-col justify-end p-3.5 sm:p-5 border border-stone-200/80 shadow-2xs hover:shadow-md transition-all min-w-0"
            >
              <ImageWithFallback
                src={cat.image}
                alt={cat.title}
                category={cat.title}
                className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-stone-950/85 via-stone-950/30 to-transparent pointer-events-none" />

              <div className="relative z-10 text-white space-y-0.5 sm:space-y-1">
                <span className="text-[10px] sm:text-xs font-semibold text-stone-300 uppercase tracking-wider block">
                  {cat.count}
                </span>
                <h3 className="text-sm sm:text-lg font-bold tracking-tight text-white group-hover:text-stone-200 transition-colors truncate">
                  {cat.title}
                </h3>
                <p className="text-[11px] text-stone-300 line-clamp-1 hidden sm:block">{cat.description}</p>
                <div className="pt-1">
                  <span className="inline-flex items-center gap-1 text-[11px] sm:text-xs font-semibold text-white group-hover:translate-x-1 transition-transform">
                    <span>Explore</span>
                    <ArrowRight className="w-3 h-3" />
                  </span>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* 3. FEATURED PRODUCTS (2-column on mobile, 4-column on desktop) */}
      <section className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8">
        <div className="flex items-end justify-between mb-5 sm:mb-8">
          <div>
            <p className="text-[11px] sm:text-xs uppercase tracking-wider text-stone-500 font-bold mb-1">
              Handpicked Quality
            </p>
            <h2 className="text-xl sm:text-3xl font-extrabold text-stone-900 tracking-tight">
              Featured Products
            </h2>
          </div>
          <Link
            to="/products"
            className="text-xs sm:text-sm font-semibold text-stone-900 hover:text-stone-600 flex items-center gap-1 transition-colors"
          >
            <span>View All</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-6">
          {featuredProducts.slice(0, 8).map((prod) => (
            <ProductCard
              key={prod.id}
              product={prod}
              onQuickView={(p) => setQuickViewProduct(p)}
            />
          ))}
        </div>
      </section>

      {/* 4. FLASH DEALS / LIMITED OFFERS SECTION */}
      <section className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8">
        <div className="bg-gradient-to-br from-rose-950 via-stone-900 to-stone-950 text-white rounded-2xl sm:rounded-3xl p-4 sm:p-8 lg:p-10 border border-rose-900/40 shadow-xl">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 sm:gap-6 mb-6 pb-5 border-b border-rose-900/40">
            <div>
              <div className="inline-flex items-center gap-1.5 bg-rose-900/60 text-rose-300 text-[11px] sm:text-xs px-3 py-1 rounded-full border border-rose-700/60 mb-2">
                <Flame className="w-3.5 h-3.5 text-rose-400" />
                <span className="font-bold">Weekend Flash Sale</span>
              </div>
              <h2 className="text-xl sm:text-3xl font-extrabold tracking-tight text-white">
                Up to 40% Off Selected Essentials
              </h2>
              <p className="text-xs sm:text-sm text-stone-300 mt-1 max-w-lg">
                Exclusive prices for early orders. Cash on Delivery supported nationwide in Pakistan.
              </p>
            </div>

            {/* Countdown Clock */}
            <div className="flex items-center gap-2 self-start md:self-end">
              <div className="flex items-center gap-1 text-stone-400 text-xs mr-1">
                <Clock className="w-3.5 h-3.5 text-rose-400" />
                <span className="hidden sm:inline">Ends in:</span>
              </div>
              <div className="flex gap-1.5 text-center font-mono text-xs">
                <div className="bg-stone-900/90 border border-stone-800 px-2.5 py-1.5 rounded-lg">
                  <span className="text-sm font-bold text-white">{String(timeLeft.hours).padStart(2, "0")}</span>
                  <span className="block text-[8px] uppercase tracking-wider text-stone-400">Hrs</span>
                </div>
                <span className="text-sm font-bold text-stone-500 self-center">:</span>
                <div className="bg-stone-900/90 border border-stone-800 px-2.5 py-1.5 rounded-lg">
                  <span className="text-sm font-bold text-white">{String(timeLeft.minutes).padStart(2, "0")}</span>
                  <span className="block text-[8px] uppercase tracking-wider text-stone-400">Min</span>
                </div>
                <span className="text-sm font-bold text-stone-500 self-center">:</span>
                <div className="bg-stone-900/90 border border-stone-800 px-2.5 py-1.5 rounded-lg">
                  <span className="text-sm font-bold text-rose-400">{String(timeLeft.seconds).padStart(2, "0")}</span>
                  <span className="block text-[8px] uppercase tracking-wider text-stone-400">Sec</span>
                </div>
              </div>
            </div>
          </div>

          {/* Flash Deals 2-column grid on mobile, 4-column on desktop */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-6">
            {flashDeals.map((prod) => (
              <ProductCard
                key={prod.id}
                product={prod}
                onQuickView={(p) => setQuickViewProduct(p)}
              />
            ))}
          </div>
        </div>
      </section>

      {/* 5. NEW ARRIVALS CAROUSEL */}
      <section className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8">
        <ProductCarousel
          title="Fresh New Arrivals"
          subtitle="Just Landed in Stock"
          products={newArrivals}
          viewAllLink="/new-arrivals"
          onQuickView={(p) => setQuickViewProduct(p)}
        />
      </section>

      {/* 6. BEST SELLERS CAROUSEL */}
      <section className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8">
        <ProductCarousel
          title="Best Sellers in Pakistan"
          subtitle="Top Customer Favorites"
          products={bestSellers}
          viewAllLink="/products"
          onQuickView={(p) => setQuickViewProduct(p)}
        />
      </section>

      {/* 7. TRUST / VALUE PROPOSITION BAR */}
      <section className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-6">
          <div className="p-4 sm:p-5 rounded-2xl bg-white border border-stone-200/90 shadow-2xs flex items-start gap-3">
            <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-stone-100 flex items-center justify-center text-stone-800 shrink-0">
              <Truck className="w-4 h-4 sm:w-5 sm:h-5" />
            </div>
            <div>
              <h3 className="text-xs sm:text-sm font-bold text-stone-900">Free Shipping</h3>
              <p className="text-[11px] sm:text-xs text-stone-500 mt-0.5 leading-snug">
                On eligible orders over Rs. {siteConfig.shipping.freeShippingThreshold.toLocaleString()}
              </p>
            </div>
          </div>

          <div className="p-4 sm:p-5 rounded-2xl bg-white border border-stone-200/90 shadow-2xs flex items-start gap-3">
            <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-stone-100 flex items-center justify-center text-stone-800 shrink-0">
              <ShieldCheck className="w-4 h-4 sm:w-5 sm:h-5 text-emerald-600" />
            </div>
            <div>
              <h3 className="text-xs sm:text-sm font-bold text-stone-900">Secure Payments</h3>
              <p className="text-[11px] sm:text-xs text-stone-500 mt-0.5 leading-snug">
                Cash on Delivery & Direct Bank Transfer / Raast
              </p>
            </div>
          </div>

          <div className="p-4 sm:p-5 rounded-2xl bg-white border border-stone-200/90 shadow-2xs flex items-start gap-3">
            <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-stone-100 flex items-center justify-center text-stone-800 shrink-0">
              <RotateCcw className="w-4 h-4 sm:w-5 sm:h-5" />
            </div>
            <div>
              <h3 className="text-xs sm:text-sm font-bold text-stone-900">Easy Returns</h3>
              <p className="text-[11px] sm:text-xs text-stone-500 mt-0.5 leading-snug">
                7-day replacement guarantee on defective items
              </p>
            </div>
          </div>

          <div className="p-4 sm:p-5 rounded-2xl bg-white border border-stone-200/90 shadow-2xs flex items-start gap-3">
            <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-stone-100 flex items-center justify-center text-stone-800 shrink-0">
              <Headphones className="w-4 h-4 sm:w-5 sm:h-5" />
            </div>
            <div>
              <h3 className="text-xs sm:text-sm font-bold text-stone-900">Customer Support</h3>
              <p className="text-[11px] sm:text-xs text-stone-500 mt-0.5 leading-snug">
                Pakistani helpline & WhatsApp assistance
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* 8. NEWSLETTER CONVERSION SECTION */}
      <section className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8">
        <div className="bg-stone-900 text-white rounded-2xl sm:rounded-3xl p-6 sm:p-12 lg:p-16 border border-stone-800 text-center relative overflow-hidden">
          <div className="relative z-10 max-w-2xl mx-auto space-y-3 sm:space-y-4">
            <div className="inline-flex items-center gap-1.5 bg-stone-800 text-stone-300 text-[11px] sm:text-xs px-3 py-1 rounded-full border border-stone-700">
              <Sparkles className="w-3.5 h-3.5 text-amber-400" />
              <span>Join 12,000+ Pakistani Shoppers</span>
            </div>

            <h2 className="text-xl sm:text-3xl font-extrabold tracking-tight text-white">
              Stay Ahead of Exclusive Offers
            </h2>

            <p className="text-xs sm:text-sm text-stone-400 leading-relaxed max-w-lg mx-auto">
              Subscribe to get secret voucher codes, weekly product updates, and seasonal sale alerts delivered straight to your inbox.
            </p>

            <form
              onSubmit={handleNewsletterSubmit}
              data-form="newsletter"
              data-source="homepage"
              data-crm="hubspot"
              className="flex flex-col sm:flex-row gap-2.5 max-w-md mx-auto pt-2"
            >
              <input
                type="email"
                value={newsletterEmail}
                onChange={(e) => setNewsletterEmail(e.target.value)}
                placeholder="Enter your email address"
                required
                className="flex-1 px-4 py-3 bg-stone-800 text-stone-100 placeholder-stone-500 rounded-xl text-xs sm:text-sm border border-stone-700 focus:outline-none focus:border-stone-400"
              />
              <button
                type="submit"
                disabled={isSubscribing}
                className="px-6 py-3 bg-white text-stone-900 rounded-xl text-xs sm:text-sm font-bold hover:bg-stone-100 transition-colors shadow-md disabled:opacity-50 shrink-0 min-h-[44px]"
              >
                {isSubscribing ? (
                  <span className="w-4 h-4 border-2 border-stone-900 border-t-transparent rounded-full animate-spin inline-block" />
                ) : (
                  "Subscribe Now"
                )}
              </button>
            </form>

            {newsletterSuccess && (
              <p className="text-xs text-emerald-400 font-medium flex items-center justify-center gap-1.5 pt-2">
                <CheckCircle2 className="w-4 h-4" />
                <span>You're in! Check your inbox for your 10% welcome voucher.</span>
              </p>
            )}

            <p className="text-[10px] sm:text-[11px] text-stone-500 pt-1">
              We respect your privacy. No spam, ever. Unsubscribe anytime.
            </p>
          </div>
        </div>
      </section>

      {/* Quick View Modal */}
      <QuickViewModal
        product={quickViewProduct}
        onClose={() => setQuickViewProduct(null)}
      />
    </div>
  );
};
