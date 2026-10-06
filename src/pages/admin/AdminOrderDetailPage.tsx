import React, { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import { orderService } from "@/src/lib/services/orderService";
import { Order, OrderStatus, PaymentStatus } from "@/src/types";
import { StatusBadge } from "@/src/components/admin/StatusBadge";
import { ConfirmDialog } from "@/src/components/admin/ConfirmDialog";
import { AdminLoadingState } from "@/src/components/admin/AdminLoadingState";
import { AdminEmptyState } from "@/src/components/admin/AdminEmptyState";
import { useToast } from "@/src/context/ToastContext";
import {
  ArrowLeft,
  CheckCircle2,
  Clock,
  Package,
  Truck,
  Building2,
  Banknote,
  User,
  MapPin,
  FileText,
  AlertTriangle,
  Plus,
  Send,
  ExternalLink,
  ShieldCheck,
} from "lucide-react";

export const AdminOrderDetailPage: React.FC = () => {
  const { orderId } = useParams<{ orderId: string }>();
  const { showToast } = useToast();

  const [order, setOrder] = useState<Order | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Status updating state
  const [selectedStatus, setSelectedStatus] = useState<OrderStatus>("Pending");
  const [selectedPaymentStatus, setSelectedPaymentStatus] = useState<PaymentStatus>("Pending");
  const [isUpdatingStatus, setIsUpdatingStatus] = useState(false);

  // Bank verify modal state
  const [showVerifyModal, setShowVerifyModal] = useState(false);
  const [isVerifying, setIsVerifying] = useState(false);

  // Admin note input
  const [noteInput, setNoteInput] = useState("");
  const [isAddingNote, setIsAddingNote] = useState(false);

  const fetchOrder = async () => {
    if (!orderId) return;
    setIsLoading(true);
    try {
      const found = await orderService.getOrderById(orderId);
      if (found) {
        setOrder(found);
        setSelectedStatus(found.orderStatus);
        setSelectedPaymentStatus(found.paymentStatus);
      }
    } catch {
      showToast("Failed to load order details", "error");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchOrder();
  }, [orderId]);

  const handleUpdateOrderStatus = async () => {
    if (!order) return;
    setIsUpdatingStatus(true);
    try {
      const updated = await orderService.updateOrderStatus(
        order.id,
        selectedStatus,
        `Status transitioned to ${selectedStatus} by Administrator.`
      );
      setOrder(updated);
      showToast(`Order status updated to "${selectedStatus}".`, "success");
    } catch (err: any) {
      showToast(err.message || "Failed to update status", "error");
    } finally {
      setIsUpdatingStatus(false);
    }
  };

  const handleUpdatePaymentStatus = async (newStatus: PaymentStatus) => {
    if (!order) return;
    try {
      const updated = await orderService.updatePaymentStatus(
        order.id,
        newStatus,
        `Payment status updated to ${newStatus}.`
      );
      setOrder(updated);
      setSelectedPaymentStatus(newStatus);
      showToast(`Payment marked as "${newStatus}".`, "success");
    } catch (err: any) {
      showToast(err.message || "Failed to update payment", "error");
    }
  };

  const handleVerifyBankPayment = async () => {
    if (!order) return;
    setIsVerifying(true);
    try {
      await handleUpdatePaymentStatus("Paid");
      setShowVerifyModal(false);
    } finally {
      setIsVerifying(false);
    }
  };

  const handleAddNote = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!order || !noteInput.trim()) return;

    setIsAddingNote(true);
    try {
      const updated = await orderService.addOrderNote(order.id, noteInput.trim());
      setOrder(updated);
      setNoteInput("");
      showToast("Internal note appended to order.", "success");
    } catch (err: any) {
      showToast(err.message || "Failed to add note", "error");
    } finally {
      setIsAddingNote(false);
    }
  };

  if (isLoading) {
    return <AdminLoadingState message="Loading order details..." />;
  }

  if (!order) {
    return (
      <div className="space-y-4">
        <Link
          to="/admin/orders"
          className="inline-flex items-center gap-2 text-xs font-semibold text-stone-600 hover:text-stone-900"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Orders</span>
        </Link>
        <AdminEmptyState
          title="Order Not Found"
          description={`Order #${orderId} does not exist in the fulfillment database.`}
          actionLabel="View All Orders"
          actionHref="/admin/orders"
        />
      </div>
    );
  }

  const timelineSteps = [
    {
      key: "Placed",
      label: "Order Placed",
      time: order.createdAt,
      done: true,
      icon: Clock,
    },
    {
      key: "Confirmed",
      label: "Confirmed",
      done: ["Confirmed", "Processing", "Shipped", "Delivered"].includes(order.orderStatus),
      icon: CheckCircle2,
    },
    {
      key: "Processing",
      label: "Processing & Packaging",
      done: ["Processing", "Shipped", "Delivered"].includes(order.orderStatus),
      icon: Package,
    },
    {
      key: "Shipped",
      label: "Dispatched / In Transit",
      done: ["Shipped", "Delivered"].includes(order.orderStatus),
      icon: Truck,
    },
    {
      key: "Delivered",
      label: "Delivered to Customer",
      done: order.orderStatus === "Delivered",
      icon: CheckCircle2,
    },
  ];

  return (
    <div className="space-y-6 max-w-6xl mx-auto animate-in fade-in duration-200 pb-12">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-5 rounded-3xl border border-stone-200 shadow-2xs">
        <div className="flex items-center gap-3">
          <Link
            to="/admin/orders"
            className="p-2 text-stone-600 hover:text-stone-900 rounded-xl hover:bg-stone-100 transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <h1 className="text-xl font-mono font-bold text-stone-900 tracking-tight">
                Order #{order.orderNumber}
              </h1>
              <StatusBadge type="order" status={order.orderStatus} size="sm" />
              <StatusBadge type="payment" status={order.paymentStatus} size="sm" />
            </div>
            <p className="text-xs text-stone-500 mt-0.5">
              Placed on{" "}
              {new Date(order.createdAt).toLocaleDateString("en-PK", {
                weekday: "short",
                year: "numeric",
                month: "short",
                day: "numeric",
                hour: "2-digit",
                minute: "2-digit",
              })}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {/* Direct Bank Verification shortcut if pending */}
          {order.paymentMethod === "bank_transfer" && order.paymentStatus !== "Paid" && (
            <button
              type="button"
              onClick={() => setShowVerifyModal(true)}
              className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold transition-colors shadow-xs flex items-center gap-1.5"
            >
              <ShieldCheck className="w-4 h-4" />
              <span>Verify Payment (Rs. {order.total.toLocaleString()})</span>
            </button>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left 2 Columns: Items, Breakdown, Status Updater, Timeline, Internal Notes */}
        <div className="lg:col-span-2 space-y-6">
          {/* Status & Fulfillment Controller Card */}
          <div className="bg-white p-6 rounded-3xl border border-stone-200 shadow-2xs space-y-4">
            <h2 className="text-xs font-bold uppercase tracking-wider text-stone-500 pb-2 border-b border-stone-100">
              Order Fulfillment Controller
            </h2>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 items-end">
              <div>
                <label className="block text-xs font-bold text-stone-700 mb-1">
                  Update Order Status
                </label>
                <select
                  value={selectedStatus}
                  onChange={(e) => setSelectedStatus(e.target.value as OrderStatus)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-stone-200 bg-stone-50/50 text-xs font-bold focus:outline-none focus:border-stone-900"
                >
                  <option value="Pending">Pending (New)</option>
                  <option value="Confirmed">Confirmed (Verified)</option>
                  <option value="Processing">Processing (Packing)</option>
                  <option value="Shipped">Shipped (In Transit)</option>
                  <option value="Delivered">Delivered (Completed)</option>
                  <option value="Cancelled">Cancelled (Terminated)</option>
                </select>
              </div>

              <div>
                <button
                  type="button"
                  onClick={handleUpdateOrderStatus}
                  disabled={isUpdatingStatus || selectedStatus === order.orderStatus}
                  className="w-full py-2.5 px-4 bg-stone-900 hover:bg-stone-800 disabled:opacity-40 text-white rounded-xl text-xs font-bold transition-all shadow-xs flex items-center justify-center gap-2"
                >
                  {isUpdatingStatus ? (
                    <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  ) : (
                    <CheckCircle2 className="w-4 h-4" />
                  )}
                  <span>Save Status Transition</span>
                </button>
              </div>
            </div>

            {/* Visual Timeline */}
            <div className="pt-4 border-t border-stone-100">
              <p className="text-[11px] font-bold text-stone-500 mb-3">
                Customer Delivery Progression:
              </p>
              <div className="grid grid-cols-5 gap-2 text-center text-[10px]">
                {timelineSteps.map((step, idx) => {
                  const Icon = step.icon;
                  return (
                    <div key={step.key} className="space-y-1.5 flex flex-col items-center">
                      <div
                        className={`w-8 h-8 rounded-full flex items-center justify-center transition-colors ${
                          step.done
                            ? "bg-emerald-600 text-white shadow-xs"
                            : "bg-stone-100 text-stone-400"
                        }`}
                      >
                        <Icon className="w-4 h-4" />
                      </div>
                      <span
                        className={`font-bold block leading-tight ${
                          step.done ? "text-stone-900" : "text-stone-400"
                        }`}
                      >
                        {step.label}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Purchased Items Card */}
          <div className="bg-white p-6 rounded-3xl border border-stone-200 shadow-2xs space-y-4">
            <h2 className="text-xs font-bold uppercase tracking-wider text-stone-500 pb-2 border-b border-stone-100">
              Ordered Line Items ({order.items.length})
            </h2>

            <div className="divide-y divide-stone-100">
              {order.items.map((item, idx) => (
                <div key={idx} className="py-3 flex items-center justify-between gap-4">
                  <div className="flex items-center gap-3 min-w-0">
                    <img
                      src={item.productImage}
                      alt={item.productTitle}
                      className="w-14 h-14 rounded-xl object-cover bg-stone-100 border border-stone-200 shrink-0"
                    />
                    <div className="min-w-0">
                      <p className="text-xs font-bold text-stone-900 leading-tight">
                        {item.productTitle}
                      </p>
                      {item.variantDescription && (
                        <p className="text-[11px] text-amber-700 font-semibold mt-0.5">
                          Variant: {item.variantDescription}
                        </p>
                      )}
                      <p className="text-[10px] text-stone-400 font-mono mt-0.5">
                        SKU: {item.sku} • Qty: {item.quantity} × Rs. {item.unitPrice.toLocaleString()}
                      </p>
                    </div>
                  </div>

                  <div className="text-right shrink-0 font-extrabold text-xs text-stone-900">
                    Rs. {item.totalPrice.toLocaleString()}
                  </div>
                </div>
              ))}
            </div>

            {/* Financial Summary */}
            <div className="pt-4 border-t border-stone-100 space-y-2 text-xs">
              <div className="flex justify-between text-stone-600">
                <span>Subtotal</span>
                <span className="font-semibold">Rs. {order.subtotal.toLocaleString()}</span>
              </div>

              {order.discount > 0 && (
                <div className="flex justify-between text-emerald-600 font-semibold">
                  <span>Coupon Discount {order.couponCode && `(${order.couponCode})`}</span>
                  <span>-Rs. {order.discount.toLocaleString()}</span>
                </div>
              )}

              <div className="flex justify-between text-stone-600">
                <span>Delivery Charges ({order.shippingMethod.toUpperCase()})</span>
                <span className="font-semibold">
                  {order.shipping === 0 ? "FREE" : `Rs. ${order.shipping.toLocaleString()}`}
                </span>
              </div>

              {order.tax > 0 && (
                <div className="flex justify-between text-stone-600">
                  <span>Sales Tax</span>
                  <span className="font-semibold">Rs. {order.tax.toLocaleString()}</span>
                </div>
              )}

              <div className="flex justify-between pt-2 border-t border-stone-100 text-sm font-extrabold text-stone-900">
                <span>Grand Total</span>
                <span>Rs. {order.total.toLocaleString()} PKR</span>
              </div>
            </div>
          </div>

          {/* Internal Notes Card */}
          <div className="bg-white p-6 rounded-3xl border border-stone-200 shadow-2xs space-y-4">
            <h2 className="text-xs font-bold uppercase tracking-wider text-stone-500 pb-2 border-b border-stone-100 flex items-center gap-2">
              <FileText className="w-4 h-4 text-stone-500" />
              <span>Internal Admin Notes & Log</span>
            </h2>

            {order.notes ? (
              <div className="bg-stone-50 p-4 rounded-2xl border border-stone-200/80 whitespace-pre-wrap font-mono text-xs text-stone-700 leading-relaxed">
                {order.notes}
              </div>
            ) : (
              <p className="text-xs text-stone-400 italic">
                No internal admin notes recorded for this order yet.
              </p>
            )}

            <form onSubmit={handleAddNote} className="flex gap-2">
              <input
                type="text"
                value={noteInput}
                onChange={(e) => setNoteInput(e.target.value)}
                placeholder="Append internal fulfillment note..."
                className="flex-1 px-3.5 py-2 rounded-xl border border-stone-200 text-xs focus:outline-none focus:border-stone-900"
              />
              <button
                type="submit"
                disabled={isAddingNote || !noteInput.trim()}
                className="px-4 py-2 bg-stone-900 hover:bg-stone-800 disabled:opacity-40 text-white rounded-xl text-xs font-bold transition-colors flex items-center gap-1.5 shrink-0"
              >
                <Send className="w-3.5 h-3.5" />
                <span>Add Note</span>
              </button>
            </form>
          </div>
        </div>

        {/* Right 1 Column: Customer Details, Shipping Address, Payment Method */}
        <div className="space-y-6">
          {/* Customer Profile Card */}
          <div className="bg-white p-6 rounded-3xl border border-stone-200 shadow-2xs space-y-4">
            <h3 className="text-xs font-bold uppercase tracking-wider text-stone-500 pb-2 border-b border-stone-100 flex items-center gap-1.5">
              <User className="w-4 h-4 text-stone-400" />
              <span>Customer Information</span>
            </h3>

            <div className="space-y-2 text-xs">
              <div>
                <p className="font-bold text-stone-900 text-sm">
                  {order.customer.firstName} {order.customer.lastName}
                </p>
                <p className="text-stone-500">{order.customer.email}</p>
                <p className="text-stone-700 font-mono font-bold mt-0.5">
                  {order.customer.phone}
                </p>
              </div>

              {order.customer.userId ? (
                <div className="pt-2">
                  <span className="px-2 py-0.5 bg-emerald-50 text-emerald-800 rounded-md text-[10px] font-bold">
                    Registered Customer Account
                  </span>
                </div>
              ) : (
                <div className="pt-2">
                  <span className="px-2 py-0.5 bg-stone-100 text-stone-600 rounded-md text-[10px] font-bold">
                    Guest Checkout
                  </span>
                </div>
              )}
            </div>
          </div>

          {/* Shipping Address Card */}
          <div className="bg-white p-6 rounded-3xl border border-stone-200 shadow-2xs space-y-4">
            <h3 className="text-xs font-bold uppercase tracking-wider text-stone-500 pb-2 border-b border-stone-100 flex items-center gap-1.5">
              <MapPin className="w-4 h-4 text-stone-400" />
              <span>Delivery Address</span>
            </h3>

            <div className="space-y-1.5 text-xs text-stone-700 leading-relaxed">
              <p className="font-bold text-stone-900">
                {order.shippingAddress.houseFlatShopNumber},{" "}
                {order.shippingAddress.streetAddress}
              </p>
              <p>{order.shippingAddress.area}</p>
              <p className="font-semibold text-stone-800">
                {order.shippingAddress.city}, {order.shippingAddress.province}{" "}
                {order.shippingAddress.postalCode && `(${order.shippingAddress.postalCode})`}
              </p>
              <p className="text-[11px] text-stone-400">Pakistan</p>

              {order.shippingAddress.deliveryInstructions && (
                <div className="mt-3 p-3 bg-amber-50/70 border border-amber-200/80 rounded-xl text-[11px] text-amber-900">
                  <strong className="block mb-0.5 text-amber-950">
                    Courier Rider Instructions:
                  </strong>
                  {order.shippingAddress.deliveryInstructions}
                </div>
              )}
            </div>
          </div>

          {/* Payment Method Card */}
          <div className="bg-white p-6 rounded-3xl border border-stone-200 shadow-2xs space-y-4">
            <h3 className="text-xs font-bold uppercase tracking-wider text-stone-500 pb-2 border-b border-stone-100 flex items-center justify-between">
              <span className="flex items-center gap-1.5">
                <Banknote className="w-4 h-4 text-stone-400" />
                <span>Payment & Verification</span>
              </span>
              <StatusBadge type="payment" status={order.paymentStatus} size="sm" />
            </h3>

            <div className="space-y-3 text-xs">
              <div className="flex items-center gap-2">
                {order.paymentMethod === "cod" ? (
                  <div className="p-2 bg-stone-100 rounded-xl text-stone-800 flex items-center gap-2 font-bold w-full">
                    <Banknote className="w-4 h-4" />
                    <span>Cash on Delivery (COD)</span>
                  </div>
                ) : order.paymentMethod === "bank_transfer" ? (
                  <div className="p-2 bg-blue-50 border border-blue-200 rounded-xl text-blue-900 flex items-center gap-2 font-bold w-full">
                    <Building2 className="w-4 h-4 text-blue-700" />
                    <span>Direct Bank Transfer</span>
                  </div>
                ) : (
                  <span>Credit / Debit Card</span>
                )}
              </div>

              {order.paymentMethod === "bank_transfer" && (
                <div className="space-y-2 bg-stone-50 p-3 rounded-xl border border-stone-200">
                  <div className="flex justify-between items-center text-[11px]">
                    <span className="text-stone-500">Bank Ref / Transaction ID:</span>
                    <span className="font-mono font-bold text-stone-900">
                      {order.paymentReference || "Awaiting Submission"}
                    </span>
                  </div>
                </div>
              )}

              {/* Payment status quick switcher */}
              <div className="pt-2 space-y-2">
                <p className="text-[10px] font-bold text-stone-500 uppercase">
                  Manual Payment Override
                </p>
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => handleUpdatePaymentStatus("Paid")}
                    className="flex-1 py-1.5 px-2 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-300 rounded-lg text-[11px] font-bold transition-colors text-center"
                  >
                    Mark Paid
                  </button>
                  <button
                    type="button"
                    onClick={() => handleUpdatePaymentStatus("Refunded")}
                    className="flex-1 py-1.5 px-2 bg-stone-50 hover:bg-stone-100 text-stone-700 border border-stone-200 rounded-lg text-[11px] font-bold transition-colors text-center"
                  >
                    Mark Refunded
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Bank Verification Confirmation Modal */}
      <ConfirmDialog
        isOpen={showVerifyModal}
        title="Confirm Bank Transfer Payment"
        message={`Are you sure you want to mark Order #${order.orderNumber} as PAID? Please confirm that you have verified the transaction deposit of Rs. ${order.total.toLocaleString()} in your Meezan Bank account.`}
        confirmLabel="Verify & Mark as Paid"
        isDestructive={false}
        isLoading={isVerifying}
        onConfirm={handleVerifyBankPayment}
        onCancel={() => setShowVerifyModal(false)}
      />
    </div>
  );
};
