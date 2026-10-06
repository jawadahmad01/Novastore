import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useCart } from "@/src/context/CartContext";
import { useAuth } from "@/src/context/AuthContext";
import { useToast } from "@/src/context/ToastContext";
import { orderService } from "@/src/lib/services/orderService";
import { paymentService } from "@/src/lib/services/paymentService";
import { shippingService } from "@/src/lib/services/shippingService";
import { analytics } from "@/src/lib/analytics";
import { hubspot } from "@/src/lib/hubspot";
import { Address, PaymentMethodType, OrderItem } from "@/src/types";
import { siteConfig } from "@/src/config/site";
import { CheckoutSteps } from "@/src/components/checkout/CheckoutSteps";
import { ShippingForm } from "@/src/components/checkout/ShippingForm";
import { PaymentMethodSelector } from "@/src/components/checkout/PaymentMethodSelector";
import { OrderReview } from "@/src/components/checkout/OrderReview";
import { formatPrice } from "@/src/lib/utils/formatters";
import { Breadcrumbs } from "@/src/components/layout/Breadcrumbs";
import { EmptyState } from "@/src/components/common/LoadingSkeleton";
import { ShoppingBag } from "lucide-react";

const CHECKOUT_STATE_KEY = "novastore_checkout_progress_v1";

export const CheckoutPage: React.FC = () => {
  const {
    items,
    subtotal,
    discount,
    appliedCoupon,
    clearCart,
  } = useCart();
  const { user } = useAuth();
  const { showToast } = useToast();
  const navigate = useNavigate();

  const [currentStep, setCurrentStep] = useState(1);
  const [shippingMethod, setShippingMethod] = useState<"standard" | "express">("standard");
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethodType>("cod");
  const [bankReference, setBankReference] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Address state with sensible defaults
  const [address, setAddress] = useState<Address>(() => {
    try {
      const saved = localStorage.getItem(CHECKOUT_STATE_KEY);
      if (saved) return JSON.parse(saved);
    } catch {}

    return {
      firstName: user?.firstName || "",
      lastName: user?.lastName || "",
      email: user?.email || "",
      phone: user?.phone || "",
      province: "Punjab",
      city: "Lahore",
      area: "",
      streetAddress: "",
      houseFlatShopNumber: "",
      country: siteConfig.market.country,
      deliveryInstructions: "",
    };
  });

  // Calculate dynamic shipping cost
  const shippingCalculation = shippingService.calculateShipping(
    subtotal,
    shippingMethod,
    address.province
  );

  const finalTotal = Math.max(0, subtotal - discount + shippingCalculation.cost);

  // Sync address changes
  useEffect(() => {
    try {
      localStorage.setItem(CHECKOUT_STATE_KEY, JSON.stringify(address));
    } catch {}
  }, [address]);

  // Track beginning of checkout
  useEffect(() => {
    if (items.length > 0) {
      analytics.trackBeginCheckout(items, subtotal);
    }
  }, [items, subtotal]);

  // Abandoned cart tracking hook (updates CRM when step changes)
  useEffect(() => {
    if (items.length > 0 && address.email) {
      hubspot.trackAbandonedCart({
        cartId: `cart_${Date.now()}`,
        email: address.email,
        customerName: `${address.firstName} ${address.lastName}`.trim(),
        phone: address.phone,
        items: items.map((i) => ({
          productId: i.product.id,
          productTitle: i.product.title,
          variantName: i.selectedVariant?.value,
          quantity: i.quantity,
          unitPrice: i.price,
        })),
        cartTotal: finalTotal,
        currency: "PKR",
        checkoutStepReached: currentStep,
        timestamp: new Date().toISOString(),
      });
    }
  }, [currentStep, items, address, finalTotal]);

  if (items.length === 0) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <Breadcrumbs items={[{ label: "Checkout" }]} />
        <div className="py-12">
          <EmptyState
            icon={ShoppingBag}
            title="Your cart is currently empty"
            description="Add some items to your bag before proceeding to checkout."
            actionText="Browse Catalog"
            actionHref="/products"
          />
        </div>
      </div>
    );
  }

  const handleShippingSubmit = (data: Address) => {
    setAddress(data);
    setCurrentStep(2);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handlePlaceOrder = async () => {
    setIsSubmitting(true);
    try {
      // 1. Process payment service abstraction
      const paymentResult = await paymentService.processPayment(paymentMethod, finalTotal, {
        bankReference,
      });

      // 2. Prepare Order Items
      const orderItems: OrderItem[] = items.map((item) => ({
        productId: item.product.id,
        productTitle: item.product.title,
        productImage: item.product.thumbnail,
        sku: item.selectedVariant?.sku || item.product.sku,
        variantDescription: item.selectedVariant?.value,
        quantity: item.quantity,
        unitPrice: item.price,
        totalPrice: item.price * item.quantity,
      }));

      // 3. Create persisted order
      const newOrder = await orderService.createOrder({
        customer: {
          firstName: address.firstName,
          lastName: address.lastName,
          email: address.email,
          phone: address.phone,
          userId: user?.id,
        },
        items: orderItems,
        subtotal,
        discount,
        couponCode: appliedCoupon?.code,
        shipping: shippingCalculation.cost,
        shippingMethod,
        tax: 0,
        total: finalTotal,
        currency: "PKR",
        paymentMethod,
        paymentStatus: paymentResult.initialStatus,
        orderStatus: "Pending",
        shippingAddress: address,
        paymentReference: bankReference || undefined,
        notes: address.deliveryInstructions,
      });

      // 4. Analytics & CRM sync
      analytics.trackPurchase(newOrder);
      await hubspot.syncContactToHubSpot({
        email: address.email,
        firstName: address.firstName,
        lastName: address.lastName,
        phone: address.phone,
        city: address.city,
        country: address.country,
        lifecycleStage: "customer",
        source: "checkout_completion",
      });

      // 5. Cleanup checkout state & cart
      clearCart();
      localStorage.removeItem(CHECKOUT_STATE_KEY);
      showToast(`Order #${newOrder.orderNumber} placed successfully!`, "success");

      // 6. Navigate to success page
      navigate(`/order-success/${newOrder.id}`);
    } catch (err: any) {
      showToast(err.message || "Failed to place order. Please try again.", "error");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
      <Breadcrumbs items={[{ label: "Cart", href: "/cart" }, { label: "Checkout" }]} />

      <div className="text-center">
        <h1 className="text-2xl sm:text-3xl font-extrabold text-stone-900 tracking-tight">
          Secure Checkout
        </h1>
        <p className="text-xs text-stone-500 mt-1">
          Complete your order in 3 simple steps. Cash on Delivery supported.
        </p>
      </div>

      <CheckoutSteps
        currentStep={currentStep}
        onStepClick={(step) => setCurrentStep(step)}
      />

      {/* Step 1: Shipping Information */}
      {currentStep === 1 && (
        <ShippingForm
          initialData={address}
          shippingMethod={shippingMethod}
          onShippingMethodChange={(method) => setShippingMethod(method)}
          onSubmit={handleShippingSubmit}
        />
      )}

      {/* Step 2: Payment Method */}
      {currentStep === 2 && (
        <div className="space-y-6">
          <div className="bg-white p-6 sm:p-7 rounded-2xl border border-stone-200 shadow-2xs space-y-4">
            <h3 className="text-sm font-bold uppercase tracking-wider text-stone-900 pb-2 border-b border-stone-100">
              Select Payment Method
            </h3>

            <PaymentMethodSelector
              selectedMethod={paymentMethod}
              onSelectMethod={(method) => setPaymentMethod(method)}
              bankReference={bankReference}
              onBankReferenceChange={(ref) => setBankReference(ref)}
              orderTotal={finalTotal}
              onBack={() => {
                setCurrentStep(1);
                window.scrollTo({ top: 0, behavior: "smooth" });
              }}
              onNext={() => {
                setCurrentStep(3);
                window.scrollTo({ top: 0, behavior: "smooth" });
              }}
            />
          </div>
        </div>
      )}

      {/* Step 3: Order Review & Placement */}
      {currentStep === 3 && (
        <OrderReview
          address={address}
          paymentMethod={paymentMethod}
          items={items}
          subtotal={subtotal}
          discount={discount}
          shipping={shippingCalculation.cost}
          shippingMethod={shippingMethod}
          tax={0}
          total={finalTotal}
          bankReference={bankReference}
          isSubmitting={isSubmitting}
          onBack={() => {
            setCurrentStep(2);
            window.scrollTo({ top: 0, behavior: "smooth" });
          }}
          onPlaceOrder={handlePlaceOrder}
        />
      )}
    </div>
  );
};
