import React from "react";
import { OrderStatus } from "@/src/types";
import { Check, Clock, Package, Truck, CheckCircle2, XCircle } from "lucide-react";

interface OrderTimelineProps {
  status: OrderStatus;
  createdAt: string;
  updatedAt?: string;
}

export const OrderTimeline: React.FC<OrderTimelineProps> = ({
  status,
  createdAt,
  updatedAt,
}) => {
  if (status === "Cancelled") {
    return (
      <div className="bg-rose-50 border border-rose-200 rounded-2xl p-4 sm:p-5 flex items-start gap-3.5 text-rose-800">
        <XCircle className="w-5 h-5 text-rose-600 shrink-0 mt-0.5" />
        <div className="space-y-1">
          <p className="text-xs sm:text-sm font-bold text-rose-900">This order was cancelled</p>
          <p className="text-xs text-rose-700 leading-relaxed">
            The order processing was halted. If any online payment was collected, your refund will be processed in accordance with our return & refund policy.
          </p>
        </div>
      </div>
    );
  }

  // Define steps
  const steps = [
    { key: "placed", label: "Order Placed", desc: "Order received in system", icon: CheckCircle2 },
    { key: "confirmed", label: "Confirmed & Packed", desc: "Prepared at warehouse", icon: Package },
    { key: "shipped", label: "Shipped & In Transit", desc: "Handed to courier partner", icon: Truck },
    { key: "delivered", label: "Delivered", desc: "Delivered to address", icon: Check },
  ];

  let currentStepIndex = 0;
  if (status === "Pending") currentStepIndex = 0;
  else if (status === "Confirmed") currentStepIndex = 1;
  else if (status === "Processing") currentStepIndex = 1;
  else if (status === "Shipped") currentStepIndex = 2;
  else if (status === "Delivered") currentStepIndex = 3;

  return (
    <div className="bg-white rounded-2xl border border-stone-200 p-5 sm:p-6 shadow-2xs space-y-4">
      <h3 className="text-xs font-bold uppercase tracking-wider text-stone-900">
        Order Tracking Status
      </h3>

      {/* Progress Steps */}
      <div className="relative">
        <div className="hidden sm:block absolute top-4 left-6 right-6 h-0.5 bg-stone-200 -z-0" />
        <div
          className="hidden sm:block absolute top-4 left-6 h-0.5 bg-stone-900 transition-all duration-500 -z-0"
          style={{ width: `${(currentStepIndex / (steps.length - 1)) * 90}%` }}
        />

        <div className="grid grid-cols-1 sm:grid-cols-4 gap-4 sm:gap-2 relative z-10">
          {steps.map((step, idx) => {
            const isCompleted = idx <= currentStepIndex;
            const isCurrent = idx === currentStepIndex;
            const Icon = step.icon;

            return (
              <div
                key={step.key}
                className="flex sm:flex-col items-center sm:text-center gap-3 sm:gap-2"
              >
                <div
                  className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 border-2 transition-all ${
                    isCompleted
                      ? "bg-stone-900 border-stone-900 text-white"
                      : "bg-white border-stone-300 text-stone-400"
                  } ${isCurrent ? "ring-4 ring-stone-900/10" : ""}`}
                >
                  <Icon className="w-4 h-4 stroke-[2.2]" />
                </div>

                <div>
                  <p
                    className={`text-xs font-bold ${
                      isCompleted ? "text-stone-900" : "text-stone-400"
                    }`}
                  >
                    {step.label}
                  </p>
                  <p className="text-[11px] text-stone-500 hidden sm:block mt-0.5">
                    {step.desc}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
