import React, { useState, useEffect, useRef } from "react";
import { useNavigate, Link } from "react-router-dom";
import { productService } from "@/src/lib/services/productService";
import { analytics } from "@/src/lib/analytics";
import { Product } from "@/src/types";
import { formatPrice } from "@/src/lib/utils/formatters";
import { ImageWithFallback } from "@/src/components/common/ImageWithFallback";
import { Search, X, Clock, TrendingUp, ArrowRight, ArrowUpRight } from "lucide-react";

interface SearchDrawerProps {
  isOpen: boolean;
  onClose: () => void;
}

const RECENT_SEARCHES_KEY = "novastore_recent_searches";
const POPULAR_SEARCHES = ["Headphones", "Power Bank", "Cotton Tee", "Leather Wallet", "Smartwatch", "Duffle Bag"];

export const SearchDrawer: React.FC<SearchDrawerProps> = ({ isOpen, onClose }) => {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [recentSearches, setRecentSearches] = useState<string[]>(() => {
    try {
      const stored = localStorage.getItem(RECENT_SEARCHES_KEY);
      return stored ? JSON.parse(stored) : ["Wireless", "Chino", "Charger"];
    } catch {
      return [];
    }
  });

  const inputRef = useRef<HTMLInputElement>(null);
  const navigate = useNavigate();

  // Focus input on open
  useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 100);
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
      setQuery("");
      setResults([]);
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [isOpen]);

  // Escape key handler
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    if (isOpen) window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, onClose]);

  // Live debounced search
  useEffect(() => {
    if (!query.trim()) {
      setResults([]);
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    const timer = setTimeout(async () => {
      try {
        const found = await productService.searchSuggestions(query, 6);
        setResults(found);
        analytics.trackSearch(query, found.length);
      } catch (e) {
        console.error("Search error", e);
      } finally {
        setIsLoading(false);
      }
    }, 200);

    return () => clearTimeout(timer);
  }, [query]);

  const saveRecentSearch = (term: string) => {
    const trimmed = term.trim();
    if (!trimmed) return;
    const updated = [trimmed, ...recentSearches.filter((s) => s.toLowerCase() !== trimmed.toLowerCase())].slice(0, 6);
    setRecentSearches(updated);
    try {
      localStorage.setItem(RECENT_SEARCHES_KEY, JSON.stringify(updated));
    } catch {}
  };

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!query.trim()) return;
    saveRecentSearch(query);
    onClose();
    navigate(`/products?search=${encodeURIComponent(query.trim())}`);
  };

  const handleSelectRecentOrPopular = (term: string) => {
    setQuery(term);
    saveRecentSearch(term);
    onClose();
    navigate(`/products?search=${encodeURIComponent(term)}`);
  };

  const clearRecentSearches = () => {
    setRecentSearches([]);
    localStorage.removeItem(RECENT_SEARCHES_KEY);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex flex-col">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-stone-900/60 backdrop-blur-xs transition-opacity"
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Search Top Panel */}
      <div className="relative w-full bg-white shadow-xl z-10 animate-in slide-in-from-top-4 duration-200 border-b border-stone-200">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 py-4 sm:py-6">
          {/* Search Input Bar */}
          <form onSubmit={handleSearchSubmit} className="relative flex items-center">
            <Search className="absolute left-4 w-5 h-5 text-stone-400" />
            <input
              ref={inputRef}
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search products by title, category, SKU, or brand..."
              className="w-full pl-12 pr-24 py-3.5 sm:py-4 bg-stone-100 text-stone-900 placeholder-stone-400 rounded-2xl text-sm sm:text-base border border-transparent focus:border-stone-400 focus:bg-white focus:outline-none transition-all"
            />

            <div className="absolute right-3 flex items-center gap-1.5">
              {query && (
                <button
                  type="button"
                  onClick={() => setQuery("")}
                  className="p-1.5 text-stone-400 hover:text-stone-700 rounded-md"
                  aria-label="Clear search"
                >
                  <X className="w-4 h-4" />
                </button>
              )}

              <button
                type="button"
                onClick={onClose}
                className="px-3 py-1.5 text-xs font-semibold text-stone-600 hover:text-stone-900 rounded-lg hover:bg-stone-200/60 transition-colors"
              >
                ESC
              </button>
            </div>
          </form>

          {/* Quick suggestions, recent searches, or live results */}
          <div className="mt-6 max-h-[60vh] overflow-y-auto">
            {isLoading ? (
              <div className="py-10 text-center text-xs text-stone-400 flex items-center justify-center gap-2">
                <span className="w-4 h-4 border-2 border-stone-400 border-t-transparent rounded-full animate-spin" />
                <span>Searching catalog...</span>
              </div>
            ) : query.trim() ? (
              <div>
                <div className="flex items-center justify-between pb-3 border-b border-stone-100">
                  <p className="text-xs font-semibold uppercase tracking-wider text-stone-400">
                    Results ({results.length})
                  </p>
                  {results.length > 0 && (
                    <button
                      onClick={handleSearchSubmit}
                      className="text-xs font-semibold text-stone-800 hover:text-stone-950 flex items-center gap-1"
                    >
                      <span>View all results</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>

                {results.length === 0 ? (
                  <div className="py-12 text-center">
                    <p className="text-sm font-semibold text-stone-900 mb-1">No products found for "{query}"</p>
                    <p className="text-xs text-stone-500 max-w-sm mx-auto mb-4">
                      Try searching with broader terms like "audio", "shirt", "watch", or check our categories.
                    </p>
                    <button
                      onClick={() => {
                        onClose();
                        navigate("/products");
                      }}
                      className="px-4 py-2 bg-stone-900 text-white rounded-lg text-xs font-semibold"
                    >
                      Browse All Products
                    </button>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3 pt-3">
                    {results.map((product) => (
                      <Link
                        key={product.id}
                        to={`/products/${product.slug}`}
                        onClick={() => {
                          saveRecentSearch(product.title);
                          onClose();
                        }}
                        className="flex items-center gap-3 p-2.5 rounded-xl hover:bg-stone-50 border border-transparent hover:border-stone-200 transition-all group"
                      >
                        <div className="w-14 h-14 rounded-lg overflow-hidden shrink-0 border border-stone-200">
                          <ImageWithFallback
                            src={product.thumbnail}
                            alt={product.title}
                            category={product.category}
                            className="w-full h-full object-cover"
                          />
                        </div>
                        <div className="min-w-0 flex-1">
                          <p className="text-[11px] text-stone-400 font-medium truncate">{product.category}</p>
                          <h4 className="text-xs sm:text-sm font-medium text-stone-900 group-hover:text-stone-700 truncate">
                            {product.title}
                          </h4>
                          <p className="text-xs font-bold text-stone-900 mt-0.5">
                            {formatPrice(product.price)}
                          </p>
                        </div>
                        <ArrowUpRight className="w-4 h-4 text-stone-400 group-hover:text-stone-900 shrink-0" />
                      </Link>
                    ))}
                  </div>
                )}
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 pt-2">
                {/* Recent Searches */}
                {recentSearches.length > 0 && (
                  <div>
                    <div className="flex items-center justify-between mb-3">
                      <p className="text-xs font-bold uppercase tracking-wider text-stone-400 flex items-center gap-1.5">
                        <Clock className="w-3.5 h-3.5" />
                        <span>Recent Searches</span>
                      </p>
                      <button
                        onClick={clearRecentSearches}
                        className="text-[11px] text-stone-400 hover:text-stone-700"
                      >
                        Clear
                      </button>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {recentSearches.map((term, i) => (
                        <button
                          key={i}
                          onClick={() => handleSelectRecentOrPopular(term)}
                          className="px-3 py-1.5 rounded-lg bg-stone-100 hover:bg-stone-200 text-stone-700 text-xs font-medium transition-colors"
                        >
                          {term}
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {/* Popular Searches */}
                <div>
                  <p className="text-xs font-bold uppercase tracking-wider text-stone-400 flex items-center gap-1.5 mb-3">
                    <TrendingUp className="w-3.5 h-3.5" />
                    <span>Popular Searches</span>
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {POPULAR_SEARCHES.map((term, i) => (
                      <button
                        key={i}
                        onClick={() => handleSelectRecentOrPopular(term)}
                        className="px-3 py-1.5 rounded-lg border border-stone-200 hover:border-stone-400 text-stone-800 text-xs font-medium transition-colors"
                      >
                        {term}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
