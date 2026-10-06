import React from "react";
import { LucideIcon, PackageOpen } from "lucide-react";
import { Link } from "react-router-dom";

interface AdminEmptyStateProps {
  icon?: LucideIcon;
  title: string;
  description: string;
  actionLabel?: string;
  actionHref?: string;
  onAction?: () => void;
}

export const AdminEmptyState: React.FC<AdminEmptyStateProps> = ({
  icon: Icon = PackageOpen,
  title,
  description,
  actionLabel,
  actionHref,
  onAction,
}) => {
  return (
    <div className="bg-white border border-stone-200 rounded-3xl p-10 sm:p-14 text-center space-y-4 shadow-2xs">
      <div className="w-14 h-14 rounded-2xl bg-stone-100 text-stone-600 flex items-center justify-center mx-auto">
        <Icon className="w-7 h-7 stroke-[1.5]" />
      </div>

      <div className="max-w-md mx-auto space-y-1.5">
        <h3 className="text-base sm:text-lg font-bold text-stone-900 tracking-tight">
          {title}
        </h3>
        <p className="text-xs text-stone-500 leading-relaxed">
          {description}
        </p>
      </div>

      {(actionLabel && (actionHref || onAction)) && (
        <div className="pt-2">
          {actionHref ? (
            <Link
              to={actionHref}
              className="inline-flex items-center gap-2 px-5 py-2.5 bg-stone-900 text-white rounded-xl text-xs font-bold hover:bg-stone-800 transition-colors shadow-xs"
            >
              {actionLabel}
            </Link>
          ) : (
            <button
              onClick={onAction}
              className="inline-flex items-center gap-2 px-5 py-2.5 bg-stone-900 text-white rounded-xl text-xs font-bold hover:bg-stone-800 transition-colors shadow-xs"
            >
              {actionLabel}
            </button>
          )}
        </div>
      )}
    </div>
  );
};
