import React from "react";
import { AlertTriangle, X } from "lucide-react";

interface ConfirmDialogProps {
  isOpen: boolean;
  title: string;
  message: string;
  confirmLabel?: string;
  cancelLabel?: string;
  isDestructive?: boolean;
  isLoading?: boolean;
  onConfirm: () => void;
  onCancel: () => void;
}

export const ConfirmDialog: React.FC<ConfirmDialogProps> = ({
  isOpen,
  title,
  message,
  confirmLabel = "Confirm",
  cancelLabel = "Cancel",
  isDestructive = true,
  isLoading = false,
  onConfirm,
  onCancel,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-900/60 backdrop-blur-xs animate-in fade-in duration-150">
      <div className="bg-white rounded-3xl border border-stone-200 shadow-2xl max-w-md w-full p-6 sm:p-7 space-y-5 animate-in zoom-in-95 duration-150">
        <div className="flex items-start justify-between gap-4">
          <div className="flex items-center gap-3.5">
            <div
              className={`w-11 h-11 rounded-2xl flex items-center justify-center shrink-0 ${
                isDestructive
                  ? "bg-rose-50 text-rose-600"
                  : "bg-amber-50 text-amber-600"
              }`}
            >
              <AlertTriangle className="w-5 h-5 stroke-[2]" />
            </div>
            <div>
              <h3 className="text-base font-bold text-stone-900 leading-tight">
                {title}
              </h3>
              <p className="text-xs text-stone-400 mt-0.5">Please confirm this action</p>
            </div>
          </div>
          <button
            onClick={onCancel}
            disabled={isLoading}
            className="text-stone-400 hover:text-stone-700 p-1.5 rounded-lg hover:bg-stone-100 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <p className="text-xs sm:text-sm text-stone-600 leading-relaxed">
          {message}
        </p>

        <div className="flex items-center justify-end gap-3 pt-2">
          <button
            type="button"
            onClick={onCancel}
            disabled={isLoading}
            className="px-4 py-2.5 rounded-xl border border-stone-200 text-stone-700 text-xs font-semibold hover:bg-stone-50 transition-colors disabled:opacity-50"
          >
            {cancelLabel}
          </button>
          <button
            type="button"
            onClick={onConfirm}
            disabled={isLoading}
            className={`px-5 py-2.5 rounded-xl text-xs font-bold text-white transition-all shadow-xs disabled:opacity-50 flex items-center gap-2 ${
              isDestructive
                ? "bg-rose-600 hover:bg-rose-700 focus:ring-2 focus:ring-rose-500"
                : "bg-stone-900 hover:bg-stone-800"
            }`}
          >
            {isLoading && (
              <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
            )}
            <span>{confirmLabel}</span>
          </button>
        </div>
      </div>
    </div>
  );
};
