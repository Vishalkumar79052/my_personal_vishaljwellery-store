import {
  Sparkles,
  Package,
  Truck,
  CheckCircle,
  XCircle,
  Clock,
  ShieldCheck,
  AlertCircle,
} from "./icons/LucideIcons.jsx";

import { computeOrderTimeline } from "../utils/orderTimeline.js";

export { computeOrderTimeline };

const iconMap = {
  placed: Sparkles,
  processing: Package,
  shipped: Truck,
  delivered: ShieldCheck,
};

const OrderProgressTimeline = ({ order, compact = false }) => {
  if (!order) return null;

  const isCancelled = order.status === "cancelled";
  const steps = computeOrderTimeline(order);

  if (isCancelled) {
    return (
      <div className="p-4 sm:p-5 rounded-2xl bg-rose-50 border border-rose-200/90 text-rose-950 flex items-start sm:items-center gap-3.5 my-4">
        <div className="w-10 h-10 rounded-xl bg-rose-100 text-rose-700 flex items-center justify-center shrink-0">
          <XCircle className="w-5 h-5 stroke-[2.2]" />
        </div>
        <div className="flex-1 min-w-0 text-xs">
          <div className="flex items-center gap-2">
            <span className="font-display font-bold text-sm text-rose-900">
              Acquisition Cancelled
            </span>
            <span className="px-2 py-0.5 rounded-full bg-rose-200/80 text-rose-900 text-[10px] font-bold uppercase tracking-wider">
              Status Terminated
            </span>
          </div>
          <p className="text-rose-700 mt-1 leading-relaxed">
            Atelier preparation has ceased. Any reserved payments have been released for restitution to your original payment method.
          </p>
        </div>
      </div>
    );
  }

  if (compact) {
    // Compact rendering for order list preview cards
    return (
      <div className="w-full space-y-2">
        <div className="grid grid-cols-4 gap-1.5 items-center">
          {steps.map((step, idx) => {
            const isCompleted = step.isCompleted;
            const isActive = step.isActive;

            return (
              <div key={step.key} className="space-y-1">
                <div
                  className={`h-1.5 rounded-full transition-all ${
                    isCompleted
                      ? "bg-emerald-800"
                      : isActive
                      ? "bg-amber-400 animate-pulse"
                      : "bg-stone-200"
                  }`}
                />
                <div className="flex items-center justify-between text-[10px] text-stone-500">
                  <span
                    className={`truncate font-medium ${
                      isCompleted
                        ? "text-emerald-950 font-bold"
                        : isActive
                        ? "text-amber-800 font-bold"
                        : "text-stone-400"
                    }`}
                  >
                    {step.title}
                  </span>
                  {isCompleted && (
                    <span className="text-emerald-800 font-bold text-[9px] shrink-0">
                      ✓
                    </span>
                  )}
                  {isActive && (
                    <span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-ping shrink-0" />
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    );
  }

  // Full rich jewellery stepper progression
  return (
    <div className="w-full my-6 space-y-3">
      <div className="flex items-center justify-between pb-1">
        <div className="flex items-center gap-2">
          <span className="text-[11px] font-bold uppercase tracking-widest text-amber-800">
            Progress Tracking
          </span>
          <span className="text-stone-300">·</span>
          <span className="text-xs text-stone-500">
            Current Stage:{" "}
            <strong className="text-stone-900 capitalize font-medium">
              {order.status === "pending"
                ? "Pending Atelier Review"
                : order.status === "processing"
                ? "In Atelier Crafting"
                : order.status === "shipped"
                ? "Dispatched & In Transit"
                : order.status === "delivered"
                ? "Delivered & Signed"
                : order.status}
            </strong>
          </span>
        </div>

        {order.status === "pending" && (
          <span className="px-2.5 py-0.5 rounded-full bg-amber-50 text-amber-900 border border-amber-200 text-[10px] font-semibold">
            Stage 1 of 4 Completed
          </span>
        )}
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5 relative">
        {steps.map((step, idx) => {
          const isCompleted = step.isCompleted;
          const isActive = step.isActive;
          const isPending = step.isPending;

          const StepIcon = iconMap[step.key] || Sparkles;

          return (
            <div
              key={step.key}
              className={`p-4 rounded-2xl border transition-all relative overflow-hidden flex flex-col justify-between ${
                isCompleted
                  ? "bg-[#FAF9F6] border-emerald-300/80 shadow-2xs"
                  : isActive
                  ? "bg-amber-50/70 border-amber-300/90 shadow-soft ring-1 ring-amber-300/60"
                  : "bg-stone-50/50 border-stone-200/70 text-stone-400"
              }`}
            >
              <div>
                {/* Header Row: Circle number / check + Stage Tag */}
                <div className="flex items-center justify-between gap-2 mb-2.5">
                  <div className="flex items-center gap-2">
                    <div
                      className={`w-7 h-7 rounded-xl flex items-center justify-center text-xs font-bold transition-transform ${
                        isCompleted
                          ? "bg-emerald-900 text-amber-100 shadow-2xs"
                          : isActive
                          ? "bg-amber-400 text-stone-950 font-black shadow-xs animate-pulse ring-2 ring-amber-300"
                          : "bg-stone-200 text-stone-500"
                      }`}
                    >
                      {isCompleted ? "✓" : step.number}
                    </div>

                    <span
                      className={`font-display font-bold text-xs ${
                        isCompleted
                          ? "text-stone-900"
                          : isActive
                          ? "text-amber-950"
                          : "text-stone-400"
                      }`}
                    >
                      {step.title}
                    </span>
                  </div>

                  <span
                    className={`px-2 py-0.5 rounded-full text-[10px] font-bold tracking-tight uppercase ${
                      isCompleted
                        ? "bg-emerald-100 text-emerald-900"
                        : isActive
                        ? "bg-amber-200/80 text-amber-950"
                        : "bg-stone-100 text-stone-400"
                    }`}
                  >
                    {isCompleted
                      ? "Completed"
                      : isActive
                      ? "In Progress"
                      : "Pending"}
                  </span>
                </div>

                {/* Subtitle / Description */}
                <p
                  className={`text-[11px] leading-relaxed ${
                    isCompleted
                      ? "text-stone-600"
                      : isActive
                      ? "text-stone-800 font-medium"
                      : "text-stone-400"
                  }`}
                >
                  {step.subtitle}
                </p>
              </div>

              {/* Status Note & Timestamp Footer */}
              <div className="mt-3 pt-2.5 border-t border-stone-100/80 flex items-center justify-between text-[10px]">
                <span
                  className={`truncate ${
                    isCompleted
                      ? "text-emerald-900 font-medium"
                      : isActive
                      ? "text-amber-900 font-semibold"
                      : "text-stone-400"
                  }`}
                >
                  {step.statusText}
                </span>

                {step.timestamp && (
                  <span className="text-stone-400 font-mono text-[9px] shrink-0 ml-1">
                    {step.timestamp}
                  </span>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default OrderProgressTimeline;
