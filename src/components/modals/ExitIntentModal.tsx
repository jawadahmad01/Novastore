import React, { useState, useEffect } from "react";
import { hubspot } from "@/src/lib/hubspot";
import { useToast } from "@/src/context/ToastContext";
import { X, Tag, Sparkles, Check, Copy, ArrowRight } from "lucide-react";

const EXIT_INTENT_KEY = "novastore_exit_intent_dismissed_v1";

export const ExitIntentModal: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [email, setEmail] = useState("");
  const [firstName, setFirstName] = useState("");
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [hasCopied, setHasCopied] = useState(false);
  const { showToast } = useToast();

  useEffect(() => {
    // Check if dismissed previously
    const isDismissed = localStorage.getItem(EXIT_INTENT_KEY);
    if (isDismissed) return;

    let timer: NodeJS.Timeout;

    // Desktop mouseleave trigger
    const handleMouseLeave = (e: MouseEvent) => {
      if (e.clientY <= 10 && !isSubmitted) {
        setIsOpen(true);
        document.removeEventListener("mouseleave", handleMouseLeave);
      }
    };

    // Mobile timeout trigger (30 seconds of browsing)
    const isMobile = window.innerWidth <= 768;
    if (isMobile) {
      timer = setTimeout(() => {
        if (!localStorage.getItem(EXIT_INTENT_KEY)) {
          setIsOpen(true);
        }
      }, 35000);
    } else {
      // Delay attaching listener so it doesn't pop immediately
      const attachTimeout = setTimeout(() => {
        document.addEventListener("mouseleave", handleMouseLeave);
      }, 6000);

      return () => {
        clearTimeout(attachTimeout);
        document.removeEventListener("mouseleave", handleMouseLeave);
      };
    }

    return () => {
      if (timer) clearTimeout(timer);
    };
  }, [isSubmitted]);

  const handleClose = () => {
    setIsOpen(false);
    localStorage.setItem(EXIT_INTENT_KEY, "true");
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !email.includes("@")) {
      showToast("Please provide a valid email.", "error");
      return;
    }

    setIsSubmitting(true);
    try {
      await hubspot.syncContactToHubSpot({
        email,
        firstName,
        lifecycleStage: "lead",
        source: "exit_intent_popup",
        tags: ["discount_code_requested"],
      });

      await hubspot.submitLeadForm({
        formId: "exit-intent-lead",
        formName: "exit-intent",
        email,
        firstName,
        couponCodeOffered: "WELCOME10",
        submittedAt: new Date().toISOString(),
      });

      setIsSubmitted(true);
      showToast("Coupon unlocked! Code: WELCOME10", "success");
      localStorage.setItem(EXIT_INTENT_KEY, "true");
    } catch {
      showToast("Submission failed. Please try again.", "error");
    } finally {
      setIsSubmitting(false);
    }
  };

  const copyCode = () => {
    navigator.clipboard.writeText("WELCOME10");
    setHasCopied(true);
    showToast("Voucher WELCOME10 copied to clipboard!", "success");
    setTimeout(() => setHasCopied(false), 2500);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-stone-900/60 backdrop-blur-xs transition-opacity"
        onClick={handleClose}
      />

      {/* Modal Card */}
      <div className="relative w-full max-w-lg bg-white rounded-2xl shadow-2xl overflow-hidden z-10 border border-stone-200 animate-in zoom-in-95 duration-200">
        <button
          onClick={handleClose}
          aria-label="Close dialog"
          className="absolute top-3.5 right-3.5 p-2 text-stone-400 hover:text-stone-900 rounded-lg hover:bg-stone-100 transition-colors z-20"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="p-6 sm:p-8">
          {!isSubmitted ? (
            <div>
              <div className="w-12 h-12 rounded-xl bg-rose-50 border border-rose-100 flex items-center justify-center text-rose-600 mb-4">
                <Tag className="w-6 h-6 stroke-[1.8]" />
              </div>

              <h3 className="text-xl sm:text-2xl font-extrabold text-stone-900 tracking-tight mb-2">
                Wait! Enjoy 10% Off Your First Order
              </h3>

              <p className="text-xs sm:text-sm text-stone-500 mb-6 leading-relaxed">
                Join our VIP circle for an instant 10% discount voucher across our entire collection, plus early access to flash sales in Pakistan.
              </p>

              <form
                onSubmit={handleSubmit}
                data-form="exit-intent"
                data-source="exit-intent"
                data-crm="hubspot"
                className="space-y-3"
              >
                <div>
                  <input
                    type="text"
                    value={firstName}
                    onChange={(e) => setFirstName(e.target.value)}
                    placeholder="Your Name (Optional)"
                    className="w-full px-4 py-2.5 bg-stone-50 border border-stone-200 rounded-xl text-xs sm:text-sm focus:bg-white focus:outline-none focus:border-stone-900"
                  />
                </div>

                <div>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="Your Email Address"
                    required
                    className="w-full px-4 py-2.5 bg-stone-50 border border-stone-200 rounded-xl text-xs sm:text-sm focus:bg-white focus:outline-none focus:border-stone-900"
                  />
                </div>

                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full py-3 px-4 bg-stone-900 text-white rounded-xl text-xs sm:text-sm font-semibold hover:bg-stone-800 transition-colors flex items-center justify-center gap-2 shadow-md disabled:opacity-50"
                >
                  {isSubmitting ? (
                    <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  ) : (
                    <>
                      <span>Get My 10% Discount</span>
                      <ArrowRight className="w-4 h-4" />
                    </>
                  )}
                </button>
              </form>

              <p className="text-[11px] text-stone-400 text-center mt-4">
                No spam. Unsubscribe anytime. Valid on all orders over Rs. 2,000.
              </p>
            </div>
          ) : (
            <div className="text-center py-4">
              <div className="w-14 h-14 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-600 flex items-center justify-center mx-auto mb-4">
                <Sparkles className="w-7 h-7" />
              </div>

              <h3 className="text-xl font-extrabold text-stone-900 mb-1">
                Your Discount Code is Ready!
              </h3>
              <p className="text-xs text-stone-500 mb-6">
                Use this promotional code during checkout for 10% off your purchase.
              </p>

              {/* Coupon Box */}
              <div className="bg-stone-50 border-2 border-dashed border-stone-300 rounded-xl p-4 flex items-center justify-between gap-4 max-w-sm mx-auto mb-6">
                <span className="font-mono font-extrabold text-lg tracking-wider text-stone-900">
                  WELCOME10
                </span>
                <button
                  onClick={copyCode}
                  className="px-3.5 py-1.5 bg-stone-900 text-white rounded-lg text-xs font-semibold hover:bg-stone-800 flex items-center gap-1.5 transition-colors"
                >
                  {hasCopied ? (
                    <>
                      <Check className="w-3.5 h-3.5 text-emerald-400" />
                      <span>Copied!</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-3.5 h-3.5" />
                      <span>Copy Code</span>
                    </>
                  )}
                </button>
              </div>

              <button
                onClick={handleClose}
                className="w-full py-2.5 bg-stone-100 hover:bg-stone-200 text-stone-800 rounded-xl text-xs font-semibold transition-colors"
              >
                Continue Shopping
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
