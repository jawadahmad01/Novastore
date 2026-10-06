import React from "react";
import { LucideIcon, PackageOpen, ArrowRight } from "lucide-react";
import { Link } from "react-router-dom";

export const ProductCardSkeleton: React.FC = () => {
  return (
    <div className="flex flex-col rounded-xl bg-white border border-stone-200/80 overflow-hidden animate-pulse">
      <div className="aspect-[4/3] sm:aspect-square bg-stone-100" />
      <div className="p-4 space-y-2.5">
        <div className="h-3 w-1/3 bg-stone-100 rounded" />
        <div className="h-4 w-4/5 bg-stone-100 rounded" />
        <div className="h-3 w-1/4 bg-stone-100 rounded" />
        <div className="pt-2 flex justify-between items-center">
          <div className="h-5 w-2/5 bg-stone-100 rounded" />
          <div className="h-8 w-8 bg-stone-100 rounded-lg" />
        </div>
      </div>
    </div>
  );
};

export const CatalogSkeleton: React.FC = () => {
  return (
    <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6">
      {Array.from({ length: 8 }).map((_, i) => (
        <ProductCardSkeleton key={i} />
      ))}
    </div>
  );
};

interface EmptyStateProps {
  icon?: LucideIcon;
  title: string;
  description: string;
  actionText?: string;
  actionHref?: string;
  onAction?: () => void;
}

export const EmptyState: React.FC<EmptyStateProps> = ({
  icon: Icon = PackageOpen,
  title,
  description,
  actionText,
  actionHref,
  onAction,
}) => {
  return (
    <div className="flex flex-col items-center justify-center text-center py-16 px-4 max-w-md mx-auto">
      <div className="w-16 h-16 rounded-2xl bg-stone-100 flex items-center justify-center text-stone-500 mb-4 border border-stone-200">
        <Icon className="w-8 h-8 stroke-[1.5]" />
      </div>

      <h3 className="text-lg font-bold text-stone-900 mb-1.5">{title}</h3>
      <p className="text-sm text-stone-500 mb-6 leading-relaxed">{description}</p>

      {actionText && actionHref && (
        <Link
          to={actionHref}
          className="inline-flex items-center gap-2 px-5 py-2.5 bg-stone-900 text-white text-sm font-medium rounded-xl hover:bg-stone-800 transition-colors shadow-sm"
        >
          <span>{actionText}</span>
          <ArrowRight className="w-4 h-4" />
        </Link>
      )}

      {actionText && !actionHref && onAction && (
        <button
          onClick={onAction}
          className="inline-flex items-center gap-2 px-5 py-2.5 bg-stone-900 text-white text-sm font-medium rounded-xl hover:bg-stone-800 transition-colors shadow-sm"
        >
          <span>{actionText}</span>
          <ArrowRight className="w-4 h-4" />
        </button>
      )}
    </div>
  );
};
