import React, { useState, useEffect, useMemo } from "react";
import { useSearchParams, useParams, useLocation } from "react-router-dom";
import { productService } from "@/src/lib/services/productService";
import { analytics } from "@/src/lib/analytics";
import { Product, FilterState, SortOption, ProductCategory } from "@/src/types";
import { ProductCard } from "@/src/components/product/ProductCard";
import { FilterSidebar } from "@/src/components/catalog/FilterSidebar";
import { FilterDrawer } from "@/src/components/catalog/FilterDrawer";
import { Breadcrumbs } from "@/src/components/layout/Breadcrumbs";
import { CatalogSkeleton, EmptyState } from "@/src/components/common/LoadingSkeleton";
import { QuickViewModal } from "@/src/components/modals/QuickViewModal";
import { SEO } from "@/src/components/common/SEO";
import {
  SlidersHorizontal,
  ArrowUpDown,
  X,
  RotateCcw,
  Search,
} from "lucide-react";

export const CatalogPage: React.FC = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const { category: paramCategory } = useParams<{ category?: string }>();
  const location = useLocation();

  const [products, setProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isFilterDrawerOpen, setIsFilterDrawerOpen] = useState(false);
  const [quickViewProduct, setQuickViewProduct] = useState<Product | null>(null);

  // Initialize filters from URL parameters
  const initialCategory = paramCategory
    ? (paramCategory.charAt(0).toUpperCase() + paramCategory.slice(1)) as ProductCategory
    : (searchParams.get("category") as ProductCategory | undefined);

  const initialSearch = searchParams.get("search") || "";
  const isDealsPage = location.pathname === "/deals";
  const isNewArrivalsPage = location.pathname === "/new-arrivals";

  const [filters, setFilters] = useState<FilterState>({
    category: initialCategory || undefined,
    searchQuery: initialSearch || undefined,
    availability: isDealsPage ? "sale" : undefined,
    sortBy: isNewArrivalsPage ? "newest" : "featured",
  });

  const priceBounds = useMemo(() => productService.getPriceBounds(), []);

  // Sync route changes to state
  useEffect(() => {
    const cat = paramCategory
      ? (paramCategory.charAt(0).toUpperCase() + paramCategory.slice(1)) as ProductCategory
      : (searchParams.get("category") as ProductCategory | undefined);

    const q = searchParams.get("search") || "";

    setFilters((prev) => ({
      ...prev,
      category: cat || undefined,
      searchQuery: q || undefined,
      availability: location.pathname === "/deals" ? "sale" : prev.availability,
      sortBy: location.pathname === "/new-arrivals" ? "newest" : prev.sortBy,
    }));
  }, [paramCategory, searchParams, location.pathname]);

  // Load products based on filter changes
  useEffect(() => {
    async function loadFiltered() {
      setIsLoading(true);
      try {
        const data = await productService.getProducts(filters);
        setProducts(data);
      } catch (e) {
        console.error("Filter loading error", e);
      } finally {
        setIsLoading(false);
      }
    }
    loadFiltered();
  }, [filters]);

  const handleResetFilters = () => {
    setFilters({
      sortBy: "featured",
    });
    setSearchParams({});
  };

  const removeFilterChip = (key: keyof FilterState) => {
    setFilters((prev) => {
      const copy = { ...prev };
      delete copy[key];
      return copy;
    });
    if (key === "category") {
      searchParams.delete("category");
      setSearchParams(searchParams);
    }
    if (key === "searchQuery") {
      searchParams.delete("search");
      setSearchParams(searchParams);
    }
  };

  // Determine page title
  const pageTitle = useMemo(() => {
    if (filters.searchQuery) return `Search Results for "${filters.searchQuery}"`;
    if (location.pathname === "/deals") return "Promotional Deals & Flash Offers";
    if (location.pathname === "/new-arrivals") return "New Arrivals in Pakistan";
    if (filters.category) return `${filters.category} Collection`;
    return "All Products";
  }, [filters.searchQuery, filters.category, location.pathname]);

  const breadcrumbs = [
    { label: "Products", href: "/products" },
    ...(filters.category ? [{ label: filters.category }] : []),
    ...(filters.searchQuery ? [{ label: `"${filters.searchQuery}"` }] : []),
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
      <SEO
        title={pageTitle}
        description={`Explore the ${pageTitle} on NOVA STORE. High-grade electronics, fashion, mobile accessories and lifestyle essentials in Pakistan.`}
      />
      <Breadcrumbs items={breadcrumbs} />

      {/* Catalog Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 pb-4 border-b border-stone-200">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-stone-900 tracking-tight">
            {pageTitle}
          </h1>
          <p className="text-xs text-stone-500 mt-1">
            Showing <strong className="text-stone-800">{products.length}</strong> available items
          </p>
        </div>

        {/* Controls: Mobile Filter Button & Sort Select */}
        <div className="flex items-center gap-3">
          {/* Mobile Filter Toggle */}
          <button
            onClick={() => setIsFilterDrawerOpen(true)}
            className="lg:hidden flex-1 sm:flex-initial flex items-center justify-center gap-2 px-4 py-2.5 bg-white border border-stone-200 rounded-xl text-xs font-semibold text-stone-800 shadow-2xs hover:bg-stone-50 active:bg-stone-100 min-h-[42px] transition-colors"
          >
            <SlidersHorizontal className="w-3.5 h-3.5" />
            <span>Filter</span>
          </button>

          {/* Sort Dropdown */}
          <div className="flex items-center gap-2 bg-white border border-stone-200 rounded-xl px-3 py-2 text-xs shadow-2xs">
            <ArrowUpDown className="w-3.5 h-3.5 text-stone-400" />
            <label htmlFor="sortSelect" className="text-stone-500 font-medium sr-only sm:not-sr-only">
              Sort by:
            </label>
            <select
              id="sortSelect"
              value={filters.sortBy || "featured"}
              onChange={(e) =>
                setFilters((prev) => ({ ...prev, sortBy: e.target.value as SortOption }))
              }
              className="bg-transparent font-semibold text-stone-900 focus:outline-none cursor-pointer pr-2"
            >
              <option value="featured">Featured</option>
              <option value="popularity">Most Popular</option>
              <option value="newest">Newest Arrivals</option>
              <option value="price_asc">Price: Low to High</option>
              <option value="price_desc">Price: High to Low</option>
              <option value="highest_rated">Highest Rated</option>
            </select>
          </div>
        </div>
      </div>

      {/* Active Filter Chips */}
      {(filters.category ||
        filters.searchQuery ||
        filters.minPrice !== undefined ||
        filters.maxPrice !== undefined ||
        filters.minRating ||
        filters.availability) && (
        <div className="flex items-center gap-2 flex-wrap pt-1">
          <span className="text-xs text-stone-400 font-medium">Active filters:</span>

          {filters.category && (
            <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-stone-100 text-stone-800 rounded-lg text-xs font-medium border border-stone-200">
              <span>Category: {filters.category}</span>
              <button onClick={() => removeFilterChip("category")} aria-label="Remove category filter">
                <X className="w-3 h-3 hover:text-rose-600" />
              </button>
            </span>
          )}

          {filters.subcategory && (
            <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-stone-100 text-stone-800 rounded-lg text-xs font-medium border border-stone-200">
              <span>Subcategory: {filters.subcategory}</span>
              <button onClick={() => removeFilterChip("subcategory")} aria-label="Remove subcategory filter">
                <X className="w-3 h-3 hover:text-rose-600" />
              </button>
            </span>
          )}

          {filters.brand && (
            <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-stone-100 text-stone-800 rounded-lg text-xs font-medium border border-stone-200">
              <span>Brand: {filters.brand}</span>
              <button onClick={() => removeFilterChip("brand")} aria-label="Remove brand filter">
                <X className="w-3 h-3 hover:text-rose-600" />
              </button>
            </span>
          )}

          {filters.searchQuery && (
            <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-stone-100 text-stone-800 rounded-lg text-xs font-medium border border-stone-200">
              <span>Search: "{filters.searchQuery}"</span>
              <button onClick={() => removeFilterChip("searchQuery")} aria-label="Remove search filter">
                <X className="w-3 h-3 hover:text-rose-600" />
              </button>
            </span>
          )}

          {(filters.minPrice !== undefined || filters.maxPrice !== undefined) && (
            <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-stone-100 text-stone-800 rounded-lg text-xs font-medium border border-stone-200">
              <span>Price Range</span>
              <button
                onClick={() => {
                  removeFilterChip("minPrice");
                  removeFilterChip("maxPrice");
                }}
                aria-label="Remove price filter"
              >
                <X className="w-3 h-3 hover:text-rose-600" />
              </button>
            </span>
          )}

          {filters.minRating && (
            <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-stone-100 text-stone-800 rounded-lg text-xs font-medium border border-stone-200">
              <span>{filters.minRating}★ & Up</span>
              <button onClick={() => removeFilterChip("minRating")} aria-label="Remove rating filter">
                <X className="w-3 h-3 hover:text-rose-600" />
              </button>
            </span>
          )}

          {filters.availability && (
            <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-stone-100 text-stone-800 rounded-lg text-xs font-medium border border-stone-200">
              <span>{filters.availability === "sale" ? "On Sale" : "In Stock"}</span>
              <button onClick={() => removeFilterChip("availability")} aria-label="Remove availability filter">
                <X className="w-3 h-3 hover:text-rose-600" />
              </button>
            </span>
          )}

          <button
            onClick={handleResetFilters}
            className="text-xs text-rose-600 hover:text-rose-800 font-semibold underline ml-2"
          >
            Clear All
          </button>
        </div>
      )}

      {/* Main Grid & Desktop Sidebar Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8 items-start">
        {/* Desktop Filter Sidebar */}
        <aside className="hidden lg:block lg:col-span-1 bg-white p-6 rounded-2xl border border-stone-200 shadow-2xs sticky top-24">
          <FilterSidebar
            filters={filters}
            onChange={(updated) => setFilters(updated)}
            onReset={handleResetFilters}
            priceBounds={priceBounds}
          />
        </aside>

        {/* Product Grid Area */}
        <main className="lg:col-span-3">
          {isLoading ? (
            <CatalogSkeleton />
          ) : products.length === 0 ? (
            <EmptyState
              icon={Search}
              title="No products found"
              description="We couldn't find any products matching your selected criteria. Try resetting filters or browsing other categories."
              actionText="Reset Filters"
              onAction={handleResetFilters}
            />
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 gap-3 sm:gap-6">
              {products.map((product) => (
                <ProductCard
                  key={product.id}
                  product={product}
                  onQuickView={(p) => setQuickViewProduct(p)}
                />
              ))}
            </div>
          )}
        </main>
      </div>

      {/* Mobile Bottom-sheet Filter Drawer */}
      <FilterDrawer
        isOpen={isFilterDrawerOpen}
        onClose={() => setIsFilterDrawerOpen(false)}
        filters={filters}
        onChange={(updated) => setFilters(updated)}
        onReset={handleResetFilters}
        priceBounds={priceBounds}
        totalCount={products.length}
      />

      {/* Quick View Modal */}
      <QuickViewModal
        product={quickViewProduct}
        onClose={() => setQuickViewProduct(null)}
      />
    </div>
  );
};
