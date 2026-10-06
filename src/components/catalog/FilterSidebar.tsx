import React, { useMemo } from "react";
import { FilterState, ProductCategory } from "@/src/types";
import { productService } from "@/src/lib/services/productService";
import { Star, RotateCcw, Check } from "lucide-react";

interface FilterSidebarProps {
  filters: FilterState;
  onChange: (updated: FilterState) => void;
  onReset: () => void;
  priceBounds: { min: number; max: number };
}

const CATEGORIES: ProductCategory[] = [
  "Electronics",
  "Mobile Accessories",
  "Home & Lifestyle",
  "Fashion",
  "Beauty & Personal Care",
  "Kitchen",
  "Sports & Fitness",
  "Bags & Accessories",
];

export const FilterSidebar: React.FC<FilterSidebarProps> = ({
  filters,
  onChange,
  onReset,
  priceBounds,
}) => {
  const categoryCounts = useMemo(() => productService.getCategoryCounts(), []);
  const allBrands = useMemo(() => productService.getAllBrands(), []);
  const subcategories = useMemo(
    () => (filters.category && filters.category !== "All" ? productService.getSubcategories(filters.category as ProductCategory) : []),
    [filters.category]
  );

  const handleCategoryClick = (cat: ProductCategory | "All") => {
    onChange({
      ...filters,
      category: cat === "All" ? undefined : cat,
      subcategory: undefined, // reset subcategory on category change
    });
  };

  const handleSubcategoryClick = (sub: string) => {
    onChange({
      ...filters,
      subcategory: filters.subcategory === sub ? undefined : sub,
    });
  };

  const handleBrandClick = (brand: string) => {
    onChange({
      ...filters,
      brand: filters.brand === brand ? undefined : brand,
    });
  };

  const handlePriceChange = (min?: number, max?: number) => {
    onChange({
      ...filters,
      minPrice: min,
      maxPrice: max,
    });
  };

  const handleRatingChange = (rating?: number) => {
    onChange({
      ...filters,
      minRating: filters.minRating === rating ? undefined : rating,
    });
  };

  const handleAvailabilityChange = (avail?: "all" | "in_stock" | "low_stock" | "sale") => {
    onChange({
      ...filters,
      availability: filters.availability === avail ? undefined : avail,
    });
  };

  const hasActiveFilters =
    Boolean(filters.category) ||
    Boolean(filters.subcategory) ||
    Boolean(filters.brand) ||
    Boolean(filters.minPrice) ||
    Boolean(filters.maxPrice) ||
    Boolean(filters.minRating) ||
    Boolean(filters.availability);

  const totalCatalogCount = productService.getTotalCount();

  return (
    <div className="space-y-6">
      {/* Header with Clear button */}
      <div className="flex items-center justify-between pb-3 border-b border-stone-200">
        <h3 className="text-sm font-bold text-stone-900 uppercase tracking-wider">Filters</h3>
        {hasActiveFilters && (
          <button
            onClick={onReset}
            className="text-xs text-rose-600 hover:text-rose-800 font-semibold flex items-center gap-1 transition-colors"
          >
            <RotateCcw className="w-3 h-3" />
            <span>Reset</span>
          </button>
        )}
      </div>

      {/* Categories */}
      <div className="space-y-2">
        <h4 className="text-xs font-bold text-stone-800 uppercase tracking-wide">Category</h4>
        <div className="space-y-1">
          <button
            onClick={() => handleCategoryClick("All")}
            className={`w-full text-left px-2.5 py-1.5 rounded-lg text-xs font-medium transition-colors flex items-center justify-between ${
              !filters.category
                ? "bg-stone-900 text-white font-semibold"
                : "text-stone-600 hover:bg-stone-100"
            }`}
          >
            <span>All Categories</span>
            <span className={`text-[10px] ${!filters.category ? "text-stone-300" : "text-stone-400"}`}>
              {totalCatalogCount}
            </span>
          </button>

          {CATEGORIES.map((cat) => {
            const isSelected = filters.category === cat;
            const count = categoryCounts[cat] || 0;
            return (
              <button
                key={cat}
                onClick={() => handleCategoryClick(cat)}
                className={`w-full text-left px-2.5 py-1.5 rounded-lg text-xs font-medium transition-colors flex items-center justify-between ${
                  isSelected
                    ? "bg-stone-900 text-white font-semibold"
                    : "text-stone-600 hover:bg-stone-100"
                }`}
              >
                <span className="truncate pr-1">{cat}</span>
                <span className={`text-[10px] shrink-0 ${isSelected ? "text-stone-300" : "text-stone-400"}`}>
                  {count}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Subcategories (if category selected and available) */}
      {subcategories.length > 0 && (
        <div className="space-y-2 pt-2 border-t border-stone-100">
          <h4 className="text-xs font-bold text-stone-800 uppercase tracking-wide">Subcategory</h4>
          <div className="flex flex-wrap gap-1.5">
            {subcategories.map((sub) => {
              const isSelected = filters.subcategory === sub;
              return (
                <button
                  key={sub}
                  onClick={() => handleSubcategoryClick(sub)}
                  className={`px-2.5 py-1 rounded-md text-xs font-medium transition-colors ${
                    isSelected
                      ? "bg-stone-900 text-white font-semibold"
                      : "bg-stone-100 text-stone-700 hover:bg-stone-200"
                  }`}
                >
                  {sub}
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* Brand Filter */}
      <div className="space-y-2 pt-2 border-t border-stone-100">
        <h4 className="text-xs font-bold text-stone-800 uppercase tracking-wide">Brand</h4>
        <div className="max-h-36 overflow-y-auto space-y-1 pr-1">
          {allBrands.map((brand) => {
            const isSelected = filters.brand === brand;
            return (
              <button
                key={brand}
                onClick={() => handleBrandClick(brand)}
                className={`w-full text-left px-2.5 py-1.5 rounded-lg text-xs font-medium transition-colors flex items-center justify-between ${
                  isSelected
                    ? "bg-stone-100 text-stone-900 font-semibold"
                    : "text-stone-600 hover:bg-stone-50"
                }`}
              >
                <span className="truncate">{brand}</span>
                {isSelected && <Check className="w-3.5 h-3.5 text-stone-900 shrink-0" />}
              </button>
            );
          })}
        </div>
      </div>

      {/* Price Range Slider / Quick Select */}
      <div className="space-y-2 pt-2 border-t border-stone-100">
        <h4 className="text-xs font-bold text-stone-800 uppercase tracking-wide">Price (PKR)</h4>
        <div className="space-y-1.5">
          <button
            onClick={() => handlePriceChange(undefined, undefined)}
            className={`w-full text-left px-2.5 py-1.5 rounded-lg text-xs font-medium ${
              filters.minPrice === undefined && filters.maxPrice === undefined
                ? "bg-stone-100 text-stone-900 font-semibold"
                : "text-stone-600 hover:bg-stone-50"
            }`}
          >
            Any Price
          </button>
          <button
            onClick={() => handlePriceChange(0, 5000)}
            className={`w-full text-left px-2.5 py-1.5 rounded-lg text-xs font-medium ${
              filters.maxPrice === 5000
                ? "bg-stone-100 text-stone-900 font-semibold"
                : "text-stone-600 hover:bg-stone-50"
            }`}
          >
            Under Rs. 5,000
          </button>
          <button
            onClick={() => handlePriceChange(5000, 10000)}
            className={`w-full text-left px-2.5 py-1.5 rounded-lg text-xs font-medium ${
              filters.minPrice === 5000 && filters.maxPrice === 10000
                ? "bg-stone-100 text-stone-900 font-semibold"
                : "text-stone-600 hover:bg-stone-50"
            }`}
          >
            Rs. 5,000 – Rs. 10,000
          </button>
          <button
            onClick={() => handlePriceChange(10000, undefined)}
            className={`w-full text-left px-2.5 py-1.5 rounded-lg text-xs font-medium ${
              filters.minPrice === 10000
                ? "bg-stone-100 text-stone-900 font-semibold"
                : "text-stone-600 hover:bg-stone-50"
            }`}
          >
            Over Rs. 10,000
          </button>
        </div>
      </div>

      {/* Customer Rating */}
      <div className="space-y-2 pt-2 border-t border-stone-100">
        <h4 className="text-xs font-bold text-stone-800 uppercase tracking-wide">Rating</h4>
        <div className="space-y-1">
          {[4, 3].map((stars) => {
            const isSelected = filters.minRating === stars;
            return (
              <button
                key={stars}
                onClick={() => handleRatingChange(stars)}
                className={`w-full text-left px-2.5 py-1.5 rounded-lg text-xs font-medium flex items-center justify-between ${
                  isSelected
                    ? "bg-stone-100 text-stone-900 font-semibold"
                    : "text-stone-600 hover:bg-stone-50"
                }`}
              >
                <div className="flex items-center gap-1.5">
                  <div className="flex items-center text-amber-500">
                    {Array.from({ length: stars }).map((_, i) => (
                      <Star key={i} className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                    ))}
                  </div>
                  <span>{stars} Stars & Above</span>
                </div>
                {isSelected && <Check className="w-3.5 h-3.5 text-stone-900" />}
              </button>
            );
          })}
        </div>
      </div>

      {/* Availability / Deals */}
      <div className="space-y-2 pt-2 border-t border-stone-100">
        <h4 className="text-xs font-bold text-stone-800 uppercase tracking-wide">Availability & Offers</h4>
        <div className="space-y-1">
          <button
            onClick={() => handleAvailabilityChange("in_stock")}
            className={`w-full text-left px-2.5 py-1.5 rounded-lg text-xs font-medium flex items-center justify-between ${
              filters.availability === "in_stock"
                ? "bg-stone-100 text-stone-900 font-semibold"
                : "text-stone-600 hover:bg-stone-50"
            }`}
          >
            <span>In Stock Only</span>
            {filters.availability === "in_stock" && <Check className="w-3.5 h-3.5" />}
          </button>

          <button
            onClick={() => handleAvailabilityChange("sale")}
            className={`w-full text-left px-2.5 py-1.5 rounded-lg text-xs font-medium flex items-center justify-between ${
              filters.availability === "sale"
                ? "bg-rose-50 text-rose-700 font-semibold"
                : "text-stone-600 hover:bg-stone-50"
            }`}
          >
            <span>On Discount / Sale</span>
            {filters.availability === "sale" && <Check className="w-3.5 h-3.5 text-rose-700" />}
          </button>
        </div>
      </div>
    </div>
  );
};
