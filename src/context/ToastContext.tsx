import React, { createContext, useContext, useState, useCallback } from "react";
import { ToastMessage } from "@/src/types";
import { CheckCircle2, AlertCircle, Info, X, AlertTriangle } from "lucide-react";

interface ToastContextType {
  toasts: ToastMessage[];
  showToast: (message: string, type?: "success" | "error" | "info" | "warning", title?: string, duration?: number) => void;
  removeToast: (id: string) => void;
}

const ToastContext = createContext<ToastContextType | undefined>(undefined);

export const ToastProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [toasts, setToasts] = useState<ToastMessage[]>([]);

  const removeToast = useCallback((id: string) => {
    queueMicrotask(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    });
  }, []);

  const showToast = useCallback(
    (message: string, type: "success" | "error" | "info" | "warning" = "info", title?: string, duration = 4000) => {
      const id = `toast_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`;
      const newToast: ToastMessage = { id, message, type, title, duration };

      queueMicrotask(() => {
        setToasts((prev) => [...prev, newToast]);
      });

      if (duration > 0) {
        setTimeout(() => {
          removeToast(id);
        }, duration);
      }
    },
    [removeToast]
  );

  return (
    <ToastContext.Provider value={{ toasts, showToast, removeToast }}>
      {children}
      {/* Toast Notification Container */}
      <div
        aria-live="polite"
        className="fixed bottom-5 right-5 z-50 flex flex-col gap-2.5 max-w-sm w-full pointer-events-none px-4 sm:px-0"
      >
        {toasts.map((toast) => {
          const isSuccess = toast.type === "success";
          const isError = toast.type === "error";
          const isWarning = toast.type === "warning";

          return (
            <div
              key={toast.id}
              role="alert"
              className={`pointer-events-auto flex items-start gap-3 p-3.5 rounded-xl border shadow-lg transition-all duration-300 transform translate-y-0 opacity-100 ${
                isSuccess
                  ? "bg-stone-900 text-stone-100 border-stone-800"
                  : isError
                  ? "bg-rose-950 text-rose-50 border-rose-800"
                  : isWarning
                  ? "bg-amber-950 text-amber-50 border-amber-800"
                  : "bg-stone-900 text-stone-100 border-stone-800"
              }`}
            >
              <div className="shrink-0 mt-0.5">
                {isSuccess && <CheckCircle2 className="w-5 h-5 text-emerald-400" />}
                {isError && <AlertCircle className="w-5 h-5 text-rose-400" />}
                {isWarning && <AlertTriangle className="w-5 h-5 text-amber-400" />}
                {!isSuccess && !isError && !isWarning && <Info className="w-5 h-5 text-stone-400" />}
              </div>

              <div className="flex-1 text-sm">
                {toast.title && <div className="font-semibold mb-0.5 leading-snug">{toast.title}</div>}
                <div className="leading-relaxed text-stone-300">{toast.message}</div>
              </div>

              <button
                onClick={() => removeToast(toast.id)}
                className="shrink-0 text-stone-400 hover:text-stone-100 transition-colors p-1"
                aria-label="Close notification"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          );
        })}
      </div>
    </ToastContext.Provider>
  );
};

export function useToast(): ToastContextType {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error("useToast must be used within a ToastProvider");
  }
  return context;
}
