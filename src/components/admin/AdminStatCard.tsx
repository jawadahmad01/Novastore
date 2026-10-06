import React from "react";
import { LucideIcon, TrendingUp, TrendingDown } from "lucide-react";

interface AdminStatCardProps {
  title: string;
  value: string | number;
  icon: LucideIcon;
  description?: string;
  trend?: {
    value: string;
    isPositive: boolean;
  };
  highlight?: boolean;
  onClick?: () => void;
}

export const AdminStatCard: React.FC<AdminStatCardProps> = ({
  title,
  value,
  icon: Icon,
  description,
  trend,
  highlight,
  onClick,
}) => {
  return (
    <div
      onClick={onClick}
      className={`bg-white rounded-2xl border p-5 sm:p-6 transition-all shadow-xs ${
        highlight
          ? "border-amber-400/80 ring-1 ring-amber-400/30 bg-amber-50/20"
          : "border-stone-200 hover:border-stone-300"
      } ${onClick ? "cursor-pointer hover:shadow-sm" : ""}`}
    >
      <div className="flex items-center justify-between gap-3 mb-3">
        <span className="text-xs font-semibold uppercase tracking-wider text-stone-500">
          {title}
        </span>
        <div className="w-10 h-10 rounded-xl bg-stone-100 flex items-center justify-center text-stone-700 shrink-0">
          <Icon className="w-5 h-5 stroke-[1.8]" />
        </div>
      </div>

      <div className="space-y-1">
        <div className="text-2xl sm:text-3xl font-extrabold text-stone-900 tracking-tight">
          {value}
        </div>

        {(description || trend) && (
          <div className="flex items-center gap-2 text-xs text-stone-500 flex-wrap">
            {trend && (
              <span
                className={`inline-flex items-center gap-0.5 font-bold ${
                  trend.isPositive ? "text-emerald-600" : "text-rose-600"
                }`}
              >
                {trend.isPositive ? (
                  <TrendingUp className="w-3.5 h-3.5" />
                ) : (
                  <TrendingDown className="w-3.5 h-3.5" />
                )}
                {trend.value}
              </span>
            )}
            {description && <span className="text-stone-400">{description}</span>}
          </div>
        )}
      </div>
    </div>
  );
};
