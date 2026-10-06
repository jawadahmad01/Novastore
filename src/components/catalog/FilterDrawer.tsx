import React, { useEffect } from "react";
import { FilterSidebar } from "@/src/components/catalog/FilterSidebar";
import { FilterState } from "@/src/types";
import { X } from "lucide-react";

interface FilterDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  filters: FilterState;
  onChange: (updated: FilterState) => void;
  onReset: () => void;
  priceBounds: { min: number; max: number };
  totalCount: number;
}

export const FilterDrawer: React.FC<FilterDrawerProps> = ({
  isOpen,
  onClose,
  filters,
  onChange,
  onReset,
  priceBounds,
  totalCount,
}) => {
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex lg:hidden">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-stone-900/60 backdrop-blur-xs transition-opacity"
        onClick={onClose}
      />

      {/* Slide-over panel */}
      <div className="relative ml-auto w-full max-w-xs bg-white h-full shadow-2xl z-10 flex flex-col animate-in slide-in-from-right duration-200">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-stone-100">
          <h2 className="text-base font-bold text-stone-900">Filter Products</h2>
          <button
            onClick={onClose}
            aria-label="Close filters"
            className="p-1.5 text-stone-400 hover:text-stone-900 rounded-lg hover:bg-stone-100 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Filters Scroll Body */}
        <div className="flex-1 overflow-y-auto p-5">
          <FilterSidebar
            filters={filters}
            onChange={onChange}
            onReset={onReset}
            priceBounds={priceBounds}
          />
        </div>

        {/* Bottom Apply CTA */}
        <div className="p-4 border-t border-stone-200 bg-stone-50">
          <button
            onClick={onClose}
            className="w-full py-3 bg-stone-900 text-white rounded-xl text-xs font-semibold hover:bg-stone-800 transition-colors shadow-sm"
          >
            Show {totalCount} Products
          </button>
        </div>
      </div>
    </div>
  );
};
