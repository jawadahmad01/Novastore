import React, { useState } from "react";
import { PaymentMethodType } from "@/src/types";
import { siteConfig } from "@/src/config/site";
import { formatPrice } from "@/src/lib/utils/formatters";
import {
  Banknote,
  Building2,
  CreditCard,
  ShieldCheck,
  Info,
  CheckCircle2,
  Copy,
  Check,
  Lock,
} from "lucide-react";
import { useToast } from "@/src/context/ToastContext";

interface PaymentMethodSelectorProps {
  selectedMethod: PaymentMethodType;
  onSelectMethod: (method: PaymentMethodType) => void;
  bankReference: string;
  onBankReferenceChange: (ref: string) => void;
  orderTotal: number;
  onBack: () => void;
  onNext: () => void;
}

export const PaymentMethodSelector: React.FC<PaymentMethodSelectorProps> = ({
  selectedMethod,
  onSelectMethod,
  bankReference,
  onBankReferenceChange,
  orderTotal,
  onBack,
  onNext,
}) => {
  const { showToast } = useToast();
  const [copiedField, setCopiedField] = useState<string | null>(null);

  // Card mock input states
  const [cardNumber, setCardNumber] = useState("");
  const [cardHolder, setCardHolder] = useState("");
  const [cardExpiry, setCardExpiry] = useState("");
  const [cardCvv, setCardCvv] = useState("");

  const copyToClipboard = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    setCopiedField(label);
    showToast(`${label} copied to clipboard!`, "info");
    setTimeout(() => setCopiedField(null), 2000);
  };

  const handleCardNumberChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let val = e.target.value.replace(/\D/g, "").slice(0, 16);
    // group by 4 digits
    val = val.replace(/(\d{4})(?=\d)/g, "$1 ");
    setCardNumber(val);
  };

  const handleExpiryChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let val = e.target.value.replace(/\D/g, "").slice(0, 4);
    if (val.length >= 3) {
      val = `${val.slice(0, 2)}/${val.slice(2)}`;
    }
    setCardExpiry(val);
  };

  return (
    <div className="space-y-6">
      {/* Method 1: Cash on Delivery */}
      <div
        onClick={() => onSelectMethod("cod")}
        className={`p-5 sm:p-6 rounded-2xl border-2 cursor-pointer transition-all ${
          selectedMethod === "cod"
            ? "border-stone-900 bg-white shadow-sm ring-1 ring-stone-900/10"
            : "border-stone-200 bg-stone-50/50 hover:border-stone-300"
        }`}
      >
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-start gap-3.5">
            <input
              type="radio"
              name="paymentMethod"
              checked={selectedMethod === "cod"}
              onChange={() => onSelectMethod("cod")}
              className="mt-1 text-stone-900 focus:ring-stone-900"
            />
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <span className="text-sm sm:text-base font-bold text-stone-900">
                  Cash on Delivery (COD)
                </span>
                <span className="text-[11px] font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded">
                  Most Popular in Pakistan
                </span>
              </div>
              <p className="text-xs text-stone-500 mt-1">
                Pay with physical cash when the courier rider delivers the package to your doorstep.
              </p>
            </div>
          </div>

          <Banknote className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
        </div>

        {selectedMethod === "cod" && (
          <div className="mt-4 pt-4 border-t border-stone-100 text-xs text-stone-600 space-y-1.5 bg-stone-50 p-3.5 rounded-xl">
            <p className="font-semibold text-stone-800 flex items-center gap-1.5">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
              <span>Payment Amount due on arrival: {formatPrice(orderTotal)}</span>
            </p>
            <p className="text-stone-500">
              Please ensure someone is available at your delivery address with the exact amount.
            </p>
          </div>
        )}
      </div>

      {/* Method 2: Direct Bank Transfer */}
      <div
        onClick={() => onSelectMethod("bank_transfer")}
        className={`p-5 sm:p-6 rounded-2xl border-2 cursor-pointer transition-all ${
          selectedMethod === "bank_transfer"
            ? "border-stone-900 bg-white shadow-sm ring-1 ring-stone-900/10"
            : "border-stone-200 bg-stone-50/50 hover:border-stone-300"
        }`}
      >
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-start gap-3.5">
            <input
              type="radio"
              name="paymentMethod"
              checked={selectedMethod === "bank_transfer"}
              onChange={() => onSelectMethod("bank_transfer")}
              className="mt-1 text-stone-900 focus:ring-stone-900"
            />
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <span className="text-sm sm:text-base font-bold text-stone-900">
                  Direct Bank Transfer / IBFT
                </span>
                <span className="text-[11px] font-semibold text-blue-700 bg-blue-50 px-2 py-0.5 rounded">
                  Raast & Mobile Banking
                </span>
              </div>
              <p className="text-xs text-stone-500 mt-1">
                Transfer via Raast, Meezan, HBL, Nayapay, Sadapay, or any Pakistani banking app.
              </p>
            </div>
          </div>

          <Building2 className="w-5 h-5 text-blue-600 shrink-0 mt-0.5" />
        </div>

        {selectedMethod === "bank_transfer" && (
          <div
            className="mt-4 pt-4 border-t border-stone-100 text-xs space-y-3 bg-stone-50 p-4 rounded-xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg text-blue-900 text-xs space-y-1">
              <p className="font-bold flex items-center gap-1.5">
                <Info className="w-3.5 h-3.5 text-blue-700 shrink-0" />
                <span>Placeholder Bank Information Notice</span>
              </p>
              <p className="text-[11px] text-blue-800 leading-relaxed">
                The account details below are placeholders. In production, your actual Pakistani commercial banking details (Meezan, HBL, UBL, Raast) will appear here. Bank transfers are not automatically marked as paid; they remain <strong>Awaiting Verification</strong> until confirmed by our accounts team.
              </p>
            </div>

            <p className="font-semibold text-stone-800">
              Transfer amount: <strong className="text-stone-900">{formatPrice(orderTotal)}</strong>
            </p>

            <div className="space-y-2 bg-white p-3 rounded-lg border border-stone-200 text-stone-700 font-mono text-[11px]">
              <div className="flex justify-between items-center">
                <span>Bank:</span>
                <span className="font-bold text-stone-900">{siteConfig.bankDetails.bankName}</span>
              </div>
              <div className="flex justify-between items-center">
                <span>Account Title:</span>
                <span className="font-bold text-stone-900">{siteConfig.bankDetails.accountTitle}</span>
              </div>
              <div className="flex justify-between items-center">
                <span>Account Number:</span>
                <div className="flex items-center gap-1.5">
                  <span className="font-bold text-stone-900">{siteConfig.bankDetails.accountNumber}</span>
                  <button
                    type="button"
                    onClick={() => copyToClipboard(siteConfig.bankDetails.accountNumber, "Account Number")}
                    className="p-1 hover:text-stone-900 text-stone-400"
                  >
                    {copiedField === "Account Number" ? <Check className="w-3 h-3 text-emerald-600" /> : <Copy className="w-3 h-3" />}
                  </button>
                </div>
              </div>
              <div className="flex justify-between items-center">
                <span>IBAN:</span>
                <div className="flex items-center gap-1.5">
                  <span className="font-bold text-stone-900">{siteConfig.bankDetails.iban}</span>
                  <button
                    type="button"
                    onClick={() => copyToClipboard(siteConfig.bankDetails.iban, "IBAN")}
                    className="p-1 hover:text-stone-900 text-stone-400"
                  >
                    {copiedField === "IBAN" ? <Check className="w-3 h-3 text-emerald-600" /> : <Copy className="w-3 h-3" />}
                  </button>
                </div>
              </div>
            </div>

            <div>
              <label className="text-xs font-semibold text-stone-700 block mb-1">
                Transaction ID / Reference # (Optional during checkout)
              </label>
              <input
                type="text"
                value={bankReference}
                onChange={(e) => onBankReferenceChange(e.target.value)}
                placeholder="e.g. RAAST-98214 or Bank Reference #"
                className="w-full px-3 py-2 bg-white border border-stone-200 rounded-lg text-xs focus:outline-none focus:border-stone-900"
              />
              <p className="text-[11px] text-stone-500 mt-1">
                You can also submit proof after placing the order or via WhatsApp with your Order ID.
              </p>
            </div>
          </div>
        )}
      </div>

      {/* Method 3: Credit / Debit Card (Gateway Ready) */}
      <div
        onClick={() => onSelectMethod("card")}
        className={`p-5 sm:p-6 rounded-2xl border-2 cursor-pointer transition-all ${
          selectedMethod === "card"
            ? "border-stone-900 bg-white shadow-sm ring-1 ring-stone-900/10"
            : "border-stone-200 bg-stone-50/50 hover:border-stone-300"
        }`}
      >
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-start gap-3.5">
            <input
              type="radio"
              name="paymentMethod"
              checked={selectedMethod === "card"}
              onChange={() => onSelectMethod("card")}
              className="mt-1 text-stone-900 focus:ring-stone-900"
            />
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <span className="text-sm sm:text-base font-bold text-stone-900">
                  Credit / Debit Card (Visa / Mastercard)
                </span>
                <span className="text-[11px] font-semibold text-amber-800 bg-amber-50 px-2 py-0.5 rounded">
                  Gateway Integration Ready
                </span>
              </div>
              <p className="text-xs text-stone-500 mt-1">
                Pay securely using international or local Visa, Mastercard, or UnionPay cards.
              </p>
            </div>
          </div>

          <CreditCard className="w-5 h-5 text-stone-700 shrink-0 mt-0.5" />
        </div>

        {selectedMethod === "card" && (
          <div
            className="mt-4 pt-4 border-t border-stone-100 text-xs space-y-3 bg-stone-50 p-4 rounded-xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="p-3 bg-amber-50 border border-amber-200 rounded-lg flex items-start gap-2 text-amber-900 text-xs">
              <Info className="w-4 h-4 shrink-0 text-amber-700 mt-0.5" />
              <span>
                <strong>Payment Architecture Notice:</strong> For testing this initial storefront, card checkout generates a gateway authorization payload. Sensitive card numbers are never stored in browser memory.
              </span>
            </div>

            <div className="space-y-3">
              <div>
                <label className="text-xs font-semibold text-stone-700 block mb-1">
                  Name on Card
                </label>
                <input
                  type="text"
                  value={cardHolder}
                  onChange={(e) => setCardHolder(e.target.value)}
                  placeholder="e.g. Hamza Khan"
                  className="w-full px-3.5 py-2 bg-white border border-stone-200 rounded-xl text-xs sm:text-sm focus:outline-none focus:border-stone-900"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-stone-700 block mb-1">
                  Card Number
                </label>
                <input
                  type="text"
                  value={cardNumber}
                  onChange={handleCardNumberChange}
                  placeholder="4000 1234 5678 9010"
                  maxLength={19}
                  className="w-full px-3.5 py-2 bg-white border border-stone-200 rounded-xl text-xs sm:text-sm focus:outline-none focus:border-stone-900 font-mono"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-semibold text-stone-700 block mb-1">
                    Expiry (MM/YY)
                  </label>
                  <input
                    type="text"
                    value={cardExpiry}
                    onChange={handleExpiryChange}
                    placeholder="12/28"
                    maxLength={5}
                    className="w-full px-3.5 py-2 bg-white border border-stone-200 rounded-xl text-xs sm:text-sm focus:outline-none focus:border-stone-900 font-mono"
                  />
                </div>
                <div>
                  <label className="text-xs font-semibold text-stone-700 block mb-1">
                    Security Code (CVV)
                  </label>
                  <input
                    type="password"
                    value={cardCvv}
                    onChange={(e) => setCardCvv(e.target.value.slice(0, 4))}
                    placeholder="•••"
                    maxLength={4}
                    className="w-full px-3.5 py-2 bg-white border border-stone-200 rounded-xl text-xs sm:text-sm focus:outline-none focus:border-stone-900 font-mono"
                  />
                </div>
              </div>

              <div className="flex items-center gap-1.5 text-[11px] text-stone-500 pt-1">
                <Lock className="w-3.5 h-3.5 text-emerald-600" />
                <span>256-bit SSL encrypted PCI-DSS compliant payment connection.</span>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Navigation buttons */}
      <div className="flex items-center justify-between pt-4">
        <button
          type="button"
          onClick={onBack}
          className="px-5 py-2.5 rounded-xl border border-stone-300 text-stone-700 text-xs sm:text-sm font-semibold hover:bg-stone-100 transition-colors"
        >
          ← Back to Shipping
        </button>

        <button
          type="button"
          onClick={onNext}
          className="px-8 py-3.5 bg-stone-900 text-white rounded-xl text-xs sm:text-sm font-semibold hover:bg-stone-800 transition-colors shadow-sm"
        >
          Continue to Order Review →
        </button>
      </div>
    </div>
  );
};
