import React, { useState } from "react";
import { Link } from "react-router-dom";
import { siteConfig } from "@/src/config/site";
import { hubspot } from "@/src/lib/hubspot";
import { analytics } from "@/src/lib/analytics";
import { useToast } from "@/src/context/ToastContext";
import {
  Mail,
  Phone,
  MapPin,
  ArrowRight,
  ShieldCheck,
  CreditCard,
  Banknote,
  CheckCircle2,
} from "lucide-react";

export const Footer: React.FC = () => {
  const [email, setEmail] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const { showToast } = useToast();

  const handleSubscribe = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !email.includes("@")) {
      showToast("Please enter a valid email address.", "error");
      return;
    }

    setIsSubmitting(true);
    try {
      await hubspot.syncContactToHubSpot({
        email,
        lifecycleStage: "subscriber",
        source: "footer_newsletter",
      });
      await hubspot.submitLeadForm({
        formId: "footer-newsletter",
        formName: "newsletter",
        email,
        submittedAt: new Date().toISOString(),
      });
      analytics.trackNewsletterSignup(email, "footer");

      setIsSuccess(true);
      showToast("Thank you for subscribing to NOVA STORE updates!", "success");
      setEmail("");
    } catch {
      showToast("Subscription failed. Please try again.", "error");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <footer className="bg-stone-900 text-stone-300 pt-16 pb-12 border-t border-stone-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Top Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-10 lg:gap-8 pb-12 border-b border-stone-800">
          {/* Brand info (2 columns on large screens) */}
          <div className="lg:col-span-2 space-y-4">
            <Link to="/" className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-white text-stone-900 flex items-center justify-center font-bold text-sm shadow">
                N
              </div>
              <span className="font-extrabold text-xl tracking-tight text-white font-mono">
                {siteConfig.brand.name}
              </span>
            </Link>

            <p className="text-sm text-stone-400 max-w-sm leading-relaxed">
              {siteConfig.brand.description}
            </p>

            <div className="space-y-2 text-xs text-stone-400 pt-2">
              <div className="flex items-center gap-2">
                <MapPin className="w-4 h-4 text-stone-500 shrink-0" />
                <span>{siteConfig.contact.address}</span>
              </div>
              <div className="flex items-center gap-2">
                <Phone className="w-4 h-4 text-stone-500 shrink-0" />
                <a href={`tel:${siteConfig.contact.phone}`} className="hover:text-white transition-colors">
                  {siteConfig.contact.displayPhone}
                </a>
              </div>
              <div className="flex items-center gap-2">
                <Mail className="w-4 h-4 text-stone-500 shrink-0" />
                <a href={`mailto:${siteConfig.contact.supportEmail}`} className="hover:text-white transition-colors">
                  {siteConfig.contact.supportEmail}
                </a>
              </div>
            </div>
          </div>

          {/* Shop Links */}
          <div className="space-y-3">
            <h3 className="text-xs font-bold uppercase tracking-wider text-white">Categories</h3>
            <ul className="space-y-2 text-sm text-stone-400">
              <li>
                <Link to="/products" className="hover:text-white transition-colors">All Products</Link>
              </li>
              <li>
                <Link to="/products?category=Electronics" className="hover:text-white transition-colors">Electronics</Link>
              </li>
              <li>
                <Link to="/products?category=Mobile%20Accessories" className="hover:text-white transition-colors">Mobile Accessories</Link>
              </li>
              <li>
                <Link to="/products?category=Fashion" className="hover:text-white transition-colors">Fashion & Apparel</Link>
              </li>
              <li>
                <Link to="/products?category=Home%20%26%20Lifestyle" className="hover:text-white transition-colors">Home & Lifestyle</Link>
              </li>
              <li>
                <Link to="/products?category=Beauty%20%26%20Personal%20Care" className="hover:text-white transition-colors">Beauty & Personal Care</Link>
              </li>
              <li>
                <Link to="/products?category=Kitchen" className="hover:text-white transition-colors">Kitchen Essentials</Link>
              </li>
              <li>
                <Link to="/products?category=Sports%20%26%20Fitness" className="hover:text-white transition-colors">Sports & Fitness</Link>
              </li>
              <li>
                <Link to="/deals" className="hover:text-rose-400 text-rose-300 font-medium transition-colors">Deals & Offers</Link>
              </li>
            </ul>
          </div>

          {/* Customer Service Links */}
          <div className="space-y-3">
            <h3 className="text-xs font-bold uppercase tracking-wider text-white">Customer Care</h3>
            <ul className="space-y-2 text-sm text-stone-400">
              <li>
                <Link to="/contact" className="hover:text-white transition-colors">Contact Support</Link>
              </li>
              <li>
                <Link to="/shipping" className="hover:text-white transition-colors">Shipping & Delivery</Link>
              </li>
              <li>
                <Link to="/returns" className="hover:text-white transition-colors">Return Policy</Link>
              </li>
              <li>
                <Link to="/faq" className="hover:text-white transition-colors">Frequently Asked Questions</Link>
              </li>
              <li>
                <Link to="/account/orders" className="hover:text-white transition-colors">Track Your Order</Link>
              </li>
            </ul>
          </div>

          {/* Newsletter Signup Column */}
          <div className="space-y-3">
            <h3 className="text-xs font-bold uppercase tracking-wider text-white">Stay In Touch</h3>
            <p className="text-xs text-stone-400 leading-relaxed">
              Subscribe for exclusive flash sales, new product drops, and discount vouchers across Pakistan.
            </p>

            <form
              onSubmit={handleSubscribe}
              data-form="newsletter"
              data-source="footer"
              data-crm="hubspot"
              className="space-y-2"
            >
              <div className="relative">
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Enter your email"
                  required
                  className="w-full px-3.5 py-2.5 bg-stone-800 text-stone-100 placeholder-stone-500 rounded-xl text-xs border border-stone-700 focus:outline-none focus:border-stone-400"
                />
                <button
                  type="submit"
                  disabled={isSubmitting}
                  aria-label="Subscribe"
                  className="absolute right-1 top-1 bottom-1 px-3 bg-white text-stone-900 rounded-lg text-xs font-semibold hover:bg-stone-200 transition-colors flex items-center justify-center disabled:opacity-50"
                >
                  {isSubmitting ? (
                    <span className="w-3.5 h-3.5 border-2 border-stone-900 border-t-transparent rounded-full animate-spin" />
                  ) : (
                    <ArrowRight className="w-3.5 h-3.5" />
                  )}
                </button>
              </div>

              {isSuccess && (
                <div className="flex items-center gap-1.5 text-[11px] text-emerald-400 font-medium">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  <span>Subscribed! Check your inbox for updates.</span>
                </div>
              )}
            </form>
          </div>
        </div>

        {/* Bottom Bar: Trust Badges, Payment Support & Legal */}
        <div className="pt-8 flex flex-col md:flex-row items-center justify-between gap-6">
          {/* Payment Badges (COD, Bank Transfer, Card) */}
          <div className="flex items-center gap-3 flex-wrap justify-center text-xs text-stone-400">
            <span className="text-stone-500 font-medium">Accepted Methods:</span>
            <div className="flex items-center gap-1.5 bg-stone-800/80 px-2.5 py-1 rounded-md border border-stone-700/60">
              <Banknote className="w-3.5 h-3.5 text-emerald-400" />
              <span className="text-stone-300 font-medium">Cash on Delivery</span>
            </div>
            <div className="flex items-center gap-1.5 bg-stone-800/80 px-2.5 py-1 rounded-md border border-stone-700/60">
              <ShieldCheck className="w-3.5 h-3.5 text-blue-400" />
              <span className="text-stone-300 font-medium">Direct Bank Transfer</span>
            </div>
            <div className="flex items-center gap-1.5 bg-stone-800/80 px-2.5 py-1 rounded-md border border-stone-700/60">
              <CreditCard className="w-3.5 h-3.5 text-amber-400" />
              <span className="text-stone-300 font-medium">Visa / Mastercard Ready</span>
            </div>
          </div>

          {/* Copyright & Legal Links */}
          <div className="flex items-center gap-4 text-xs text-stone-500 flex-wrap justify-center">
            <span>© {new Date().getFullYear()} {siteConfig.brand.legalName}. All rights reserved.</span>
            <span aria-hidden="true">·</span>
            <Link to="/privacy" className="hover:text-stone-300 transition-colors">Privacy Policy</Link>
            <span aria-hidden="true">·</span>
            <Link to="/terms" className="hover:text-stone-300 transition-colors">Terms of Service</Link>
          </div>
        </div>
      </div>
    </footer>
  );
};
