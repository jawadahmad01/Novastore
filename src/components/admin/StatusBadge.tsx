import React from "react";
import { OrderStatus, PaymentStatus, StockStatusType } from "@/src/types";
import {
  Clock,
  CheckCircle2,
  Package,
  Truck,
  CheckCheck,
  XCircle,
  AlertTriangle,
  CreditCard,
  Building2,
  Banknote,
  RotateCcw,
} from "lucide-react";

interface StatusBadgeProps {
  type: "order" | "payment" | "stock" | "publication";
  status: string;
  size?: "sm" | "md" | "lg";
}

export const StatusBadge: React.FC<StatusBadgeProps> = ({
  type,
  status,
  size = "md",
}) => {
  const sizeClasses = {
    sm: "px-2 py-0.5 text-[10px] gap-1",
    md: "px-2.5 py-1 text-xs gap-1.5",
    lg: "px-3 py-1.5 text-sm gap-2 font-semibold",
  }[size];

  // ORDER STATUSES
  if (type === "order") {
    switch (status as OrderStatus) {
      case "Pending":
        return (
          <span className={`inline-flex items-center font-semibold rounded-full bg-amber-50 text-amber-800 border border-amber-200/80 ${sizeClasses}`}>
            <Clock className="w-3.5 h-3.5 text-amber-600 shrink-0" />
            <span>Pending</span>
          </span>
        );
      case "Confirmed":
        return (
          <span className={`inline-flex items-center font-semibold rounded-full bg-blue-50 text-blue-800 border border-blue-200/80 ${sizeClasses}`}>
            <CheckCircle2 className="w-3.5 h-3.5 text-blue-600 shrink-0" />
            <span>Confirmed</span>
          </span>
        );
      case "Processing":
        return (
          <span className={`inline-flex items-center font-semibold rounded-full bg-indigo-50 text-indigo-800 border border-indigo-200/80 ${sizeClasses}`}>
            <Package className="w-3.5 h-3.5 text-indigo-600 shrink-0" />
            <span>Processing</span>
          </span>
        );
      case "Shipped":
        return (
          <span className={`inline-flex items-center font-semibold rounded-full bg-purple-50 text-purple-800 border border-purple-200/80 ${sizeClasses}`}>
            <Truck className="w-3.5 h-3.5 text-purple-600 shrink-0" />
            <span>Shipped</span>
          </span>
        );
      case "Delivered":
        return (
          <span className={`inline-flex items-center font-semibold rounded-full bg-emerald-50 text-emerald-800 border border-emerald-200/80 ${sizeClasses}`}>
            <CheckCheck className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
            <span>Delivered</span>
          </span>
        );
      case "Cancelled":
        return (
          <span className={`inline-flex items-center font-semibold rounded-full bg-rose-50 text-rose-800 border border-rose-200/80 ${sizeClasses}`}>
            <XCircle className="w-3.5 h-3.5 text-rose-600 shrink-0" />
            <span>Cancelled</span>
          </span>
        );
      default:
        return (
          <span className={`inline-flex items-center font-medium rounded-full bg-stone-100 text-stone-700 ${sizeClasses}`}>
            {status}
          </span>
        );
    }
  }

  // PAYMENT STATUSES
  if (type === "payment") {
    switch (status as PaymentStatus | string) {
      case "Paid":
        return (
          <span className={`inline-flex items-center font-semibold rounded-full bg-emerald-50 text-emerald-800 border border-emerald-200/80 ${sizeClasses}`}>
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
            <span>Paid</span>
          </span>
        );
      case "Awaiting Verification":
      case "Pending Verification":
        return (
          <span className={`inline-flex items-center font-semibold rounded-full bg-amber-50 text-amber-900 border border-amber-300 animate-pulse ${sizeClasses}`}>
            <Building2 className="w-3.5 h-3.5 text-amber-700 shrink-0" />
            <span>Pending Verification</span>
          </span>
        );
      case "Pending":
        return (
          <span className={`inline-flex items-center font-semibold rounded-full bg-stone-100 text-stone-700 border border-stone-200 ${sizeClasses}`}>
            <Clock className="w-3.5 h-3.5 text-stone-500 shrink-0" />
            <span>Pending</span>
          </span>
        );
      case "Failed":
        return (
          <span className={`inline-flex items-center font-semibold rounded-full bg-rose-50 text-rose-800 border border-rose-200/80 ${sizeClasses}`}>
            <XCircle className="w-3.5 h-3.5 text-rose-600 shrink-0" />
            <span>Failed</span>
          </span>
        );
      case "Refunded":
        return (
          <span className={`inline-flex items-center font-semibold rounded-full bg-orange-50 text-orange-800 border border-orange-200/80 ${sizeClasses}`}>
            <RotateCcw className="w-3.5 h-3.5 text-orange-600 shrink-0" />
            <span>Refunded</span>
          </span>
        );
      default:
        return (
          <span className={`inline-flex items-center font-medium rounded-full bg-stone-100 text-stone-700 ${sizeClasses}`}>
            {status}
          </span>
        );
    }
  }

  // STOCK STATUSES
  if (type === "stock") {
    switch (status as StockStatusType | string) {
      case "in_stock":
      case "In Stock":
        return (
          <span className={`inline-flex items-center font-semibold rounded-full bg-emerald-50 text-emerald-800 border border-emerald-200/60 ${sizeClasses}`}>
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-600" />
            <span>In Stock</span>
          </span>
        );
      case "low_stock":
      case "Low Stock":
        return (
          <span className={`inline-flex items-center font-semibold rounded-full bg-amber-50 text-amber-800 border border-amber-300 ${sizeClasses}`}>
            <AlertTriangle className="w-3.5 h-3.5 text-amber-600 shrink-0" />
            <span>Low Stock</span>
          </span>
        );
      case "out_of_stock":
      case "Out of Stock":
        return (
          <span className={`inline-flex items-center font-semibold rounded-full bg-rose-50 text-rose-800 border border-rose-200 ${sizeClasses}`}>
            <XCircle className="w-3.5 h-3.5 text-rose-600 shrink-0" />
            <span>Out of Stock</span>
          </span>
        );
      default:
        return (
          <span className={`inline-flex items-center font-medium rounded-full bg-stone-100 text-stone-700 ${sizeClasses}`}>
            {status}
          </span>
        );
    }
  }

  // PUBLICATION STATUS
  if (type === "publication") {
    if (status === "published" || status === "true" || status === "Published") {
      return (
        <span className={`inline-flex items-center font-semibold rounded-full bg-teal-50 text-teal-800 border border-teal-200 ${sizeClasses}`}>
          <span className="w-1.5 h-1.5 rounded-full bg-teal-600" />
          <span>Published</span>
        </span>
      );
    }
    return (
      <span className={`inline-flex items-center font-semibold rounded-full bg-stone-100 text-stone-600 border border-stone-200 ${sizeClasses}`}>
        <span className="w-1.5 h-1.5 rounded-full bg-stone-400" />
        <span>Draft</span>
      </span>
    );
  }

  return (
    <span className={`inline-flex items-center font-medium rounded-full bg-stone-100 text-stone-700 ${sizeClasses}`}>
      {status}
    </span>
  );
};
