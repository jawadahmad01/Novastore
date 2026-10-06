import React, { useState } from "react";
import { Link } from "react-router-dom";
import { Order, OrderStatus } from "@/src/types";
import { formatPrice, formatDate } from "@/src/lib/utils/formatters";
import { orderService } from "@/src/lib/services/orderService";
import { productService } from "@/src/lib/services/productService";
import { useCart } from "@/src/context/CartContext";
import { useToast } from "@/src/context/ToastContext";
import { OrderTimeline } from "@/src/components/account/OrderTimeline";
import {
  ArrowLeft,
  Package,
  Truck,
  CreditCard,
  MapPin,
  RefreshCw,
  XCircle,
  CheckCircle2,
  AlertTriangle,
  Building2,
  Calendar,
  ExternalLink,
} from "lucide-react";

interface OrderDetailViewProps {
  order: Order;
  onBack: () => void;
  onOrderUpdated?: (updatedOrder: Order) => void;
}

export const OrderDetailView: React.FC<OrderDetailViewProps> = ({
  order,
  onBack,
  onOrderUpdated,
}) => {
  const { addItem, openCart } = useCart();
  const { showToast } = useToast();

  const [currentOrder, setCurrentOrder] = useState<Order>(order);
  const [isCancelModalOpen, setIsCancelModalOpen] = useState(false);
  const [cancelReason, setCancelReason] = useState("Changed mind");
  const [isCanceling, setIsCanceling] = useState(false);
  const [isReordering, setIsReordering] = useState(false);

  const canCancel =
    currentOrder.orderStatus === "Pending" ||
    currentOrder.orderStatus === "Processing" ||
    currentOrder.orderStatus === "Confirmed";

  const getStatusBadge = (status: OrderStatus) => {
    switch (status) {
      case "Delivered":
        return (
          <span className="bg-emerald-50 text-emerald-700 px-3 py-1 rounded-full text-xs font-bold border border-emerald-200">
            Delivered
          </span>
        );
      case "Shipped":
        return (
          <span className="bg-blue-50 text-blue-700 px-3 py-1 rounded-full text-xs font-bold border border-blue-200">
            Shipped
          </span>
        );
      case "Processing":
        return (
          <span className="bg-amber-50 text-amber-800 px-3 py-1 rounded-full text-xs font-bold border border-amber-200">
            Processing
          </span>
        );
      case "Confirmed":
        return (
          <span className="bg-stone-100 text-stone-800 px-3 py-1 rounded-full text-xs font-bold border border-stone-200">
            Confirmed
          </span>
        );
      case "Cancelled":
        return (
          <span className="bg-rose-50 text-rose-700 px-3 py-1 rounded-full text-xs font-bold border border-rose-200">
            Cancelled
          </span>
        );
      case "Pending":
      default:
        return (
          <span className="bg-stone-100 text-stone-700 px-3 py-1 rounded-full text-xs font-bold border border-stone-200">
            Pending
          </span>
        );
    }
  };

  const handleReorder = async () => {
    setIsReordering(true);
    try {
      let addedCount = 0;
      for (const item of currentOrder.items) {
        const prod = await productService.getProductById(item.productId);
        if (prod) {
          const matchedVariant = prod.variants?.find((v) => v.sku === item.sku);
          addItem(prod, matchedVariant, item.quantity);
          addedCount++;
        }
      }
      showToast(
        addedCount > 0
          ? `${addedCount} items added to your cart!`
          : "Items added to cart",
        "success"
      );
      openCart();
    } catch {
      showToast("Could not reorder all items.", "error");
    } finally {
      setIsReordering(false);
    }
  };

  const handleConfirmCancel = async () => {
    setIsCanceling(true);
    try {
      const updated = await orderService.cancelOrder(currentOrder.id, cancelReason);
      setCurrentOrder(updated);
      if (onOrderUpdated) onOrderUpdated(updated);
      showToast(`Order #${currentOrder.orderNumber} has been cancelled.`, "info");
      setIsCancelModalOpen(false);
    } catch (err: any) {
      showToast(err.message || "Failed to cancel order", "error");
    } finally {
      setIsCanceling(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Header & Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-stone-200">
        <button
          onClick={onBack}
          className="flex items-center gap-2 text-xs sm:text-sm font-semibold text-stone-600 hover:text-stone-900 transition-colors w-fit"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to All Orders</span>
        </button>

        <div className="flex items-center gap-2.5">
          {canCancel && (
            <button
              onClick={() => setIsCancelModalOpen(true)}
              className="px-3.5 py-2 border border-rose-300 text-rose-700 hover:bg-rose-50 rounded-xl text-xs font-semibold transition-colors flex items-center gap-1.5"
            >
              <XCircle className="w-3.5 h-3.5" />
              <span>Cancel Order</span>
            </button>
          )}

          <button
            onClick={handleReorder}
            disabled={isReordering}
            className="px-4 py-2 bg-stone-900 hover:bg-stone-800 text-white rounded-xl text-xs font-semibold transition-colors flex items-center gap-1.5 shadow-2xs disabled:opacity-50"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isReordering ? "animate-spin" : ""}`} />
            <span>Buy Again</span>
          </button>
        </div>
      </div>

      {/* Main Order Info Banner */}
      <div className="bg-white rounded-2xl border border-stone-200 p-5 sm:p-6 shadow-2xs space-y-3">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <div className="flex items-center gap-2.5 flex-wrap">
              <span className="font-mono text-lg sm:text-xl font-extrabold text-stone-900">
                Order #{currentOrder.orderNumber}
              </span>
              {getStatusBadge(currentOrder.orderStatus)}
            </div>
            <p className="text-xs text-stone-500 mt-1 flex items-center gap-1.5">
              <Calendar className="w-3.5 h-3.5 text-stone-400" />
              <span>Placed on {formatDate(currentOrder.createdAt)}</span>
              <span>·</span>
              <span>
                Payment:{" "}
                <strong className="text-stone-700">{currentOrder.paymentStatus}</strong>
              </span>
            </p>
          </div>

          <div className="text-left sm:text-right">
            <p className="text-xs text-stone-400">Total Order Amount</p>
            <p className="text-lg sm:text-xl font-extrabold text-stone-900">
              {formatPrice(currentOrder.total)}
            </p>
          </div>
        </div>
      </div>

      {/* Tracking Timeline */}
      <OrderTimeline
        status={currentOrder.orderStatus}
        createdAt={currentOrder.createdAt}
        updatedAt={currentOrder.updatedAt}
      />

      {/* Items Section */}
      <div className="bg-white rounded-2xl border border-stone-200 p-5 sm:p-6 shadow-2xs space-y-4">
        <h3 className="text-xs font-bold uppercase tracking-wider text-stone-900 pb-2 border-b border-stone-100">
          Order Items ({currentOrder.items.length})
        </h3>

        <div className="divide-y divide-stone-100">
          {currentOrder.items.map((item, idx) => (
            <div
              key={idx}
              className="py-4 first:pt-0 last:pb-0 flex flex-col sm:flex-row sm:items-center justify-between gap-4"
            >
              <div className="flex items-start sm:items-center gap-3.5">
                <img
                  src={item.productImage}
                  alt={item.productTitle}
                  className="w-16 h-16 rounded-xl object-cover bg-stone-100 shrink-0 border border-stone-200"
                />
                <div className="space-y-1">
                  <h4 className="text-xs sm:text-sm font-bold text-stone-900 line-clamp-2">
                    {item.productTitle}
                  </h4>
                  <div className="flex items-center gap-2 text-[11px] text-stone-500 flex-wrap">
                    {item.variantDescription && (
                      <span className="bg-stone-100 text-stone-700 px-2 py-0.5 rounded font-medium">
                        {item.variantDescription}
                      </span>
                    )}
                    <span className="font-mono text-stone-400">SKU: {item.sku}</span>
                  </div>
                  <p className="text-xs text-stone-600">
                    {formatPrice(item.unitPrice)} × {item.quantity}
                  </p>
                </div>
              </div>

              <div className="text-right self-end sm:self-center">
                <span className="text-xs sm:text-sm font-extrabold text-stone-900">
                  {formatPrice(item.totalPrice)}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Breakdown, Shipping & Payment Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Shipping Address */}
        <div className="bg-white rounded-2xl border border-stone-200 p-5 shadow-2xs space-y-2.5">
          <div className="flex items-center gap-2 text-stone-900 font-bold text-xs uppercase tracking-wider">
            <MapPin className="w-4 h-4 text-stone-700" />
            <span>Shipping Address</span>
          </div>

          <div className="text-xs space-y-1 text-stone-700">
            <p className="font-semibold text-stone-900">
              {currentOrder.shippingAddress.firstName} {currentOrder.shippingAddress.lastName}
            </p>
            <p>
              {currentOrder.shippingAddress.houseFlatShopNumber},{" "}
              {currentOrder.shippingAddress.streetAddress}
            </p>
            <p>
              {currentOrder.shippingAddress.area}, {currentOrder.shippingAddress.city},{" "}
              {currentOrder.shippingAddress.province}
            </p>
            <p className="font-mono text-stone-600">{currentOrder.shippingAddress.phone}</p>
            {currentOrder.shippingAddress.deliveryInstructions && (
              <p className="text-stone-500 italic pt-1 border-t border-stone-100 mt-2">
                "{currentOrder.shippingAddress.deliveryInstructions}"
              </p>
            )}
          </div>
        </div>

        {/* Payment Method */}
        <div className="bg-white rounded-2xl border border-stone-200 p-5 shadow-2xs space-y-2.5">
          <div className="flex items-center gap-2 text-stone-900 font-bold text-xs uppercase tracking-wider">
            <CreditCard className="w-4 h-4 text-stone-700" />
            <span>Payment Information</span>
          </div>

          <div className="text-xs space-y-1.5 text-stone-700">
            <p className="font-semibold text-stone-900 capitalize">
              {currentOrder.paymentMethod === "cod"
                ? "Cash on Delivery (COD)"
                : currentOrder.paymentMethod === "bank_transfer"
                ? "Direct Bank Transfer (IBFT)"
                : "Online Card Gateway"}
            </p>
            <p className="text-stone-500">
              Payment Status:{" "}
              <strong className="text-stone-800">{currentOrder.paymentStatus}</strong>
            </p>
            {currentOrder.paymentReference && (
              <div className="bg-stone-50 p-2 rounded-lg border border-stone-200/80">
                <p className="text-[11px] text-stone-500">Bank Transfer Reference</p>
                <p className="font-mono font-bold text-stone-900">
                  {currentOrder.paymentReference}
                </p>
              </div>
            )}
            <p className="text-[11px] text-stone-400">
              Shipping via{" "}
              <strong className="capitalize text-stone-600">
                {currentOrder.shippingMethod} Courier
              </strong>
            </p>
          </div>
        </div>

        {/* Cost Summary */}
        <div className="bg-white rounded-2xl border border-stone-200 p-5 shadow-2xs space-y-2.5">
          <h4 className="text-stone-900 font-bold text-xs uppercase tracking-wider">
            Price Breakdown
          </h4>

          <div className="text-xs space-y-2 text-stone-600">
            <div className="flex justify-between">
              <span>Subtotal</span>
              <span className="font-semibold text-stone-900">
                {formatPrice(currentOrder.subtotal)}
              </span>
            </div>

            {currentOrder.discount > 0 && (
              <div className="flex justify-between text-emerald-700">
                <span>Discount {currentOrder.couponCode ? `(${currentOrder.couponCode})` : ""}</span>
                <span className="font-semibold">-{formatPrice(currentOrder.discount)}</span>
              </div>
            )}

            <div className="flex justify-between">
              <span>Shipping Fee</span>
              <span className="font-semibold text-stone-900">
                {currentOrder.shipping === 0 ? "FREE" : formatPrice(currentOrder.shipping)}
              </span>
            </div>

            <div className="border-t border-stone-200 pt-2 flex justify-between text-sm font-extrabold text-stone-900">
              <span>Grand Total</span>
              <span>{formatPrice(currentOrder.total)}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Cancel Order Confirmation Modal */}
      {isCancelModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div
            className="fixed inset-0 bg-stone-900/60 backdrop-blur-xs"
            onClick={() => setIsCancelModalOpen(false)}
          />

          <div className="relative w-full max-w-md bg-white rounded-3xl shadow-2xl p-6 z-10 border border-stone-200 space-y-4 animate-in zoom-in-95">
            <div className="w-10 h-10 rounded-2xl bg-rose-50 text-rose-600 flex items-center justify-center">
              <AlertTriangle className="w-5 h-5" />
            </div>

            <div>
              <h3 className="text-base font-bold text-stone-900">Cancel Order #{currentOrder.orderNumber}?</h3>
              <p className="text-xs text-stone-500 mt-1">
                Are you sure you want to cancel this order? This action cannot be undone once confirmed.
              </p>
            </div>

            <div>
              <label className="text-xs font-semibold text-stone-700 block mb-1">
                Reason for cancellation
              </label>
              <select
                value={cancelReason}
                onChange={(e) => setCancelReason(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-stone-200 bg-stone-50 text-xs sm:text-sm focus:outline-none focus:border-stone-900"
              >
                <option value="Changed mind">Changed mind</option>
                <option value="Ordered by mistake">Ordered by mistake</option>
                <option value="Found better price elsewhere">Found better price elsewhere</option>
                <option value="Need to change shipping address">Need to change shipping address</option>
                <option value="Delivery duration too long">Delivery duration too long</option>
                <option value="Other">Other reason</option>
              </select>
            </div>

            <div className="flex gap-2 pt-2">
              <button
                type="button"
                onClick={() => setIsCancelModalOpen(false)}
                className="flex-1 py-2.5 bg-stone-100 hover:bg-stone-200 text-stone-800 rounded-xl text-xs font-semibold transition-colors"
              >
                Keep Order
              </button>
              <button
                type="button"
                onClick={handleConfirmCancel}
                disabled={isCanceling}
                className="flex-1 py-2.5 bg-rose-600 hover:bg-rose-700 text-white rounded-xl text-xs font-semibold transition-colors disabled:opacity-50"
              >
                {isCanceling ? "Cancelling..." : "Confirm Cancel"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
