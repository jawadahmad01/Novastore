import React, { useState } from "react";
import { Link } from "react-router-dom";
import { siteConfig } from "@/src/config/site";
import { hubspot } from "@/src/lib/hubspot";
import { Breadcrumbs } from "@/src/components/layout/Breadcrumbs";
import { useToast } from "@/src/context/ToastContext";
import {
  Phone,
  Mail,
  MapPin,
  Clock,
  MessageSquare,
  HelpCircle,
  Truck,
  ShieldCheck,
  ChevronDown,
  ChevronUp,
  Search,
  ArrowRight,
  FileText,
  AlertTriangle,
} from "lucide-react";

/* -------------------------------------------------------------
 * 1. CONTACT PAGE (HubSpot Connected)
 * ------------------------------------------------------------- */
export const ContactPage: React.FC = () => {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [subject, setSubject] = useState("");
  const [message, setMessage] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSent, setIsSent] = useState(false);
  const { showToast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      await hubspot.syncContactToHubSpot({
        email,
        firstName: name,
        phone,
        lifecycleStage: "lead",
        source: "contact_page",
      });

      await hubspot.submitLeadForm({
        formId: "contact-support",
        formName: "contact-us",
        email,
        firstName: name,
        phone,
        message: `Subject: ${subject} - ${message}`,
        submittedAt: new Date().toISOString(),
      });

      setIsSent(true);
      showToast("Thank you! Your message has been received.", "success");
    } catch {
      showToast("Failed to send message. Please reach out via WhatsApp.", "error");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-10">
      <Breadcrumbs items={[{ label: "Contact Us" }]} />

      <div className="text-center max-w-2xl mx-auto space-y-2">
        <h1 className="text-3xl font-extrabold text-stone-900 tracking-tight">
          We're Here to Help
        </h1>
        <p className="text-xs sm:text-sm text-stone-500">
          Have an inquiry about an order, delivery timeline, or corporate bulk purchase in Pakistan?
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Contact Info Cards (5 cols) */}
        <div className="lg:col-span-5 space-y-4">
          <div className="bg-white p-6 rounded-2xl border border-stone-200 shadow-2xs space-y-4">
            <h3 className="text-sm font-bold uppercase tracking-wider text-stone-900 pb-2 border-b border-stone-100">
              Direct Channels
            </h3>

            <div className="space-y-4 text-xs">
              <div className="flex items-start gap-3">
                <div className="w-8 h-8 rounded-lg bg-stone-100 flex items-center justify-center text-stone-800 shrink-0">
                  <Phone className="w-4 h-4" />
                </div>
                <div>
                  <p className="text-stone-400">Phone Support</p>
                  <a href={`tel:${siteConfig.contact.phone}`} className="font-bold text-stone-900 hover:underline">
                    {siteConfig.contact.displayPhone}
                  </a>
                  <p className="text-stone-500 text-[11px] mt-0.5">{siteConfig.contact.businessHours}</p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="w-8 h-8 rounded-lg bg-stone-100 flex items-center justify-center text-stone-800 shrink-0">
                  <Mail className="w-4 h-4" />
                </div>
                <div>
                  <p className="text-stone-400">Email Care</p>
                  <a href={`mailto:${siteConfig.contact.supportEmail}`} className="font-bold text-stone-900 hover:underline">
                    {siteConfig.contact.supportEmail}
                  </a>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="w-8 h-8 rounded-lg bg-stone-100 flex items-center justify-center text-stone-800 shrink-0">
                  <MapPin className="w-4 h-4" />
                </div>
                <div>
                  <p className="text-stone-400">Fulfillment Hub</p>
                  <p className="font-medium text-stone-800">{siteConfig.contact.address}</p>
                </div>
              </div>
            </div>

            {/* WhatsApp CTA Placeholder */}
            <div className="pt-2">
              <a
                href={`https://wa.me/${siteConfig.contact.whatsappNumber.replace(/\D/g, "")}`}
                target="_blank"
                rel="noreferrer"
                className="w-full py-3 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold transition-colors flex items-center justify-center gap-2 shadow-sm"
              >
                <MessageSquare className="w-4 h-4" />
                <span>Chat with us on WhatsApp</span>
              </a>
            </div>
          </div>
        </div>

        {/* Contact Form (7 cols) */}
        <div className="lg:col-span-7 bg-white p-6 sm:p-8 rounded-2xl border border-stone-200 shadow-2xs">
          <h2 className="text-lg font-bold text-stone-900 mb-1">Send a Message</h2>
          <p className="text-xs text-stone-500 mb-6">Our support staff usually responds within 2-4 hours.</p>

          {!isSent ? (
            <form
              onSubmit={handleSubmit}
              data-form="contact-us"
              data-source="contact_page"
              data-crm="hubspot"
              className="space-y-4"
            >
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-semibold text-stone-700 block mb-1">Your Name *</label>
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Hamza Tariq"
                    className="w-full px-3.5 py-2.5 bg-stone-50 border border-stone-200 rounded-xl text-xs sm:text-sm focus:outline-none focus:border-stone-900"
                  />
                </div>
                <div>
                  <label className="text-xs font-semibold text-stone-700 block mb-1">Email Address *</label>
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="hamza@example.com"
                    className="w-full px-3.5 py-2.5 bg-stone-50 border border-stone-200 rounded-xl text-xs sm:text-sm focus:outline-none focus:border-stone-900"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-semibold text-stone-700 block mb-1">
                    Phone (03XX-XXXXXXX)
                  </label>
                  <input
                    type="tel"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="0300-1234567"
                    className="w-full px-3.5 py-2.5 bg-stone-50 border border-stone-200 rounded-xl text-xs sm:text-sm focus:outline-none focus:border-stone-900"
                  />
                </div>
                <div>
                  <label className="text-xs font-semibold text-stone-700 block mb-1">Subject</label>
                  <input
                    type="text"
                    value={subject}
                    onChange={(e) => setSubject(e.target.value)}
                    placeholder="Order delivery inquiry, product inquiry..."
                    className="w-full px-3.5 py-2.5 bg-stone-50 border border-stone-200 rounded-xl text-xs sm:text-sm focus:outline-none focus:border-stone-900"
                  />
                </div>
              </div>

              <div>
                <label className="text-xs font-semibold text-stone-700 block mb-1">Message *</label>
                <textarea
                  rows={4}
                  required
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  placeholder="How can we help you today? Please include order number if applicable."
                  className="w-full px-3.5 py-2.5 bg-stone-50 border border-stone-200 rounded-xl text-xs sm:text-sm focus:outline-none focus:border-stone-900"
                />
              </div>

              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full sm:w-auto px-8 py-3 bg-stone-900 text-white rounded-xl text-xs sm:text-sm font-semibold hover:bg-stone-800 transition-colors disabled:opacity-50"
              >
                {isSubmitting ? "Sending..." : "Submit Message"}
              </button>
            </form>
          ) : (
            <div className="py-8 text-center space-y-3">
              <ShieldCheck className="w-12 h-12 text-emerald-600 mx-auto" />
              <h3 className="text-base font-bold text-stone-900">Message Received!</h3>
              <p className="text-xs text-stone-600 max-w-sm mx-auto">
                Thank you, {name}. Our customer success team has been notified and will email you back shortly.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

/* -------------------------------------------------------------
 * 2. FAQ PAGE (Searchable & Collapsible)
 * ------------------------------------------------------------- */
export const FAQPage: React.FC = () => {
  const [search, setSearch] = useState("");
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  const faqs = [
    {
      category: "Payments",
      q: "Does NOVA STORE offer Cash on Delivery (COD)?",
      a: "Yes! Cash on Delivery is available for all addresses across Pakistan. You can pay cash directly to the courier rider upon receiving and inspecting the sealed package.",
    },
    {
      category: "Payments",
      q: "How does Direct Bank Transfer / Raast work?",
      a: `Select 'Direct Bank Transfer' at checkout. Transfer the exact amount to our official Meezan Bank account (${siteConfig.bankDetails.accountNumber}) using your mobile banking app. Mention your Order Number as the reference or enter your transaction ID.`,
    },
    {
      category: "Shipping",
      q: "How long does delivery take in Pakistan?",
      a: "Orders in Lahore, Karachi, and Islamabad/Rawalpindi generally arrive in 1 to 2 business days. Other cities (Faisalabad, Multan, Peshawar, Quetta, Sialkot, etc.) take 2 to 4 business days.",
    },
    {
      category: "Shipping",
      q: "How do I get Free Shipping?",
      a: `Free shipping is automatically applied to all orders with a subtotal of Rs. ${siteConfig.shipping.freeShippingThreshold.toLocaleString()} or above!`,
    },
    {
      category: "Returns",
      q: "What is your return and exchange policy?",
      a: "We offer a 7-day replacement guarantee on any product with manufacturing faults or transit damage. Simply reach out via our contact page or WhatsApp with photos of the item.",
    },
    {
      category: "Orders",
      q: "Can I open the parcel before paying for COD?",
      a: "Per Pakistani courier regulations (TCS, Leopard, Trax), payments must be handed to the delivery rider before the sealed flyer is opened. However, if anything is missing or incorrect, our 7-day customer guarantee protects you with a full exchange or refund.",
    },
  ];

  const filteredFaqs = faqs.filter(
    (f) =>
      f.q.toLowerCase().includes(search.toLowerCase()) ||
      f.a.toLowerCase().includes(search.toLowerCase()) ||
      f.category.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      <Breadcrumbs items={[{ label: "Frequently Asked Questions" }]} />

      <div className="text-center space-y-2">
        <h1 className="text-3xl font-extrabold text-stone-900 tracking-tight">
          Frequently Asked Questions
        </h1>
        <p className="text-xs sm:text-sm text-stone-500 max-w-md mx-auto">
          Common queries regarding nationwide delivery, payment methods, and warranties.
        </p>

        {/* Search */}
        <div className="max-w-md mx-auto pt-4 relative">
          <Search className="w-4 h-4 text-stone-400 absolute left-3.5 top-3.5" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search questions (e.g. COD, delivery, returns)..."
            className="w-full pl-10 pr-4 py-2.5 bg-white border border-stone-200 rounded-xl text-xs sm:text-sm focus:outline-none focus:border-stone-900 shadow-2xs"
          />
        </div>
      </div>

      <div className="space-y-3">
        {filteredFaqs.map((faq, idx) => {
          const isOpen = openIndex === idx;

          return (
            <div
              key={idx}
              className="bg-white rounded-2xl border border-stone-200 overflow-hidden shadow-2xs transition-all"
            >
              <button
                onClick={() => setOpenIndex(isOpen ? null : idx)}
                className="w-full p-5 text-left flex items-center justify-between gap-4 hover:bg-stone-50/50"
              >
                <div>
                  <span className="text-[10px] font-bold uppercase tracking-wider text-stone-400 block mb-0.5">
                    {faq.category}
                  </span>
                  <span className="text-sm font-semibold text-stone-900">{faq.q}</span>
                </div>
                <div className="p-1 rounded-full bg-stone-100 text-stone-600 shrink-0">
                  {isOpen ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                </div>
              </button>

              {isOpen && (
                <div className="px-5 pb-5 pt-1 text-xs sm:text-sm text-stone-600 leading-relaxed border-t border-stone-100">
                  {faq.a}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};

/* -------------------------------------------------------------
 * 3. ABOUT PAGE
 * ------------------------------------------------------------- */
export const AboutPage: React.FC = () => {
  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      <Breadcrumbs items={[{ label: "About Us" }]} />

      <div className="space-y-4">
        <h1 className="text-3xl sm:text-4xl font-extrabold text-stone-900 tracking-tight">
          About {siteConfig.brand.name}
        </h1>
        <p className="text-sm sm:text-base text-stone-600 leading-relaxed">
          {siteConfig.brand.description}
        </p>
      </div>

      <div className="bg-stone-100 rounded-2xl p-6 sm:p-8 space-y-4">
        <h2 className="text-lg font-bold text-stone-900">Our Mission for Pakistani Commerce</h2>
        <p className="text-xs sm:text-sm text-stone-600 leading-relaxed">
          Online retail in Pakistan should be dependable, transparent, and joyful. Too often, customers experience low-quality knockoffs, ambiguous pricing, or delayed deliveries. NOVA STORE was built to provide verified quality products, clear upfront PKR prices, and reliable courier tracking from our fulfillment hubs to your home.
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2">
        <div className="p-5 rounded-xl border border-stone-200 bg-white">
          <h3 className="font-bold text-stone-900 text-sm mb-1">Authentic Quality</h3>
          <p className="text-xs text-stone-500">Every item is rigorously tested and vetted before catalog addition.</p>
        </div>
        <div className="p-5 rounded-xl border border-stone-200 bg-white">
          <h3 className="font-bold text-stone-900 text-sm mb-1">Doorstep COD</h3>
          <p className="text-xs text-stone-500">Shop with peace of mind. Pay with cash when your package arrives.</p>
        </div>
        <div className="p-5 rounded-xl border border-stone-200 bg-white">
          <h3 className="font-bold text-stone-900 text-sm mb-1">Local Support</h3>
          <p className="text-xs text-stone-500">Dedicated phone & WhatsApp support teams in Pakistan.</p>
        </div>
      </div>
    </div>
  );
};

/* -------------------------------------------------------------
 * 4. SHIPPING POLICY PAGE
 * ------------------------------------------------------------- */
export const ShippingPolicyPage: React.FC = () => {
  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      <Breadcrumbs items={[{ label: "Shipping Policy" }]} />

      <h1 className="text-3xl font-extrabold text-stone-900 tracking-tight">
        Shipping & Delivery Policy
      </h1>

      <div className="bg-white p-6 sm:p-8 rounded-2xl border border-stone-200 space-y-6 text-xs sm:text-sm text-stone-700 leading-relaxed shadow-2xs">
        <div>
          <h2 className="text-base font-bold text-stone-900 mb-2">1. Delivery Zones & Timeline</h2>
          <p>
            We deliver across all provinces and territories of Pakistan: Punjab, Sindh, Khyber Pakhtunkhwa, Islamabad Capital Territory, Balochistan, Azad Jammu & Kashmir, and Gilgit-Baltistan.
          </p>
          <ul className="list-disc list-inside mt-2 space-y-1 text-stone-600">
            <li><strong>Major Metros (Lahore, Karachi, Islamabad/Rawalpindi):</strong> 1 – 2 business days.</li>
            <li><strong>Tier 2 Cities (Faisalabad, Multan, Gujranwala, Sialkot, Peshawar):</strong> 2 – 3 business days.</li>
            <li><strong>Rest of Pakistan:</strong> 3 – 5 business days.</li>
          </ul>
        </div>

        <div>
          <h2 className="text-base font-bold text-stone-900 mb-2">2. Shipping Charges</h2>
          <p>
            Standard shipping is flat Rs. {siteConfig.shipping.standardFlatRate} nationwide. However, all orders above <strong>Rs. {siteConfig.shipping.freeShippingThreshold.toLocaleString()}</strong> qualify for 100% <strong>FREE Shipping</strong>.
          </p>
        </div>

        <div>
          <h2 className="text-base font-bold text-stone-900 mb-2">3. Courier Partners & Tracking</h2>
          <p>
            All shipments are dispatched using tracked premier courier services (TCS, Leopard, Trax, CallCourier). Once dispatched, an SMS notification with tracking URL is automatically sent to the customer's Pakistani mobile number.
          </p>
        </div>
      </div>
    </div>
  );
};

/* -------------------------------------------------------------
 * 5. RETURNS POLICY PAGE
 * ------------------------------------------------------------- */
export const ReturnsPolicyPage: React.FC = () => {
  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      <Breadcrumbs items={[{ label: "Return Policy" }]} />

      <h1 className="text-3xl font-extrabold text-stone-900 tracking-tight">
        Return & Exchange Policy
      </h1>

      <div className="bg-white p-6 sm:p-8 rounded-2xl border border-stone-200 space-y-6 text-xs sm:text-sm text-stone-700 leading-relaxed shadow-2xs">
        <div className="p-3 bg-amber-50 border border-amber-200 rounded-xl text-amber-900 text-xs">
          <strong>Configurable Policy Notice:</strong> This return policy represents our current standard 7-day guarantee for consumer products. The business owner can customize timelines as needed.
        </div>

        <div>
          <h2 className="text-base font-bold text-stone-900 mb-2">7-Day Replacement Guarantee</h2>
          <p>
            If you receive a damaged, defective, or incorrect product, you may request an exchange or return within 7 calendar days of receipt.
          </p>
        </div>

        <div>
          <h2 className="text-base font-bold text-stone-900 mb-2">Eligibility Criteria</h2>
          <ul className="list-disc list-inside space-y-1 text-stone-600">
            <li>The item must be in its original packaging with tags and warranty cards intact.</li>
            <li>A photo or brief video demonstrating the issue must be shared with support.</li>
          </ul>
        </div>
      </div>
    </div>
  );
};

/* -------------------------------------------------------------
 * 6. PRIVACY & TERMS
 * ------------------------------------------------------------- */
export const PrivacyPage: React.FC = () => (
  <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
    <Breadcrumbs items={[{ label: "Privacy Policy" }]} />
    <h1 className="text-3xl font-extrabold text-stone-900">Privacy Policy</h1>
    <div className="bg-white p-6 sm:p-8 rounded-2xl border border-stone-200 text-xs sm:text-sm text-stone-700 space-y-4">
      <p>
        NOVA STORE ("we", "our") is dedicated to protecting customer privacy across Pakistan. We collect delivery addresses, phone numbers, and email addresses strictly for fulfilling orders and communicating delivery status.
      </p>
      <p>
        We do not store payment card numbers or sell personal information to third parties.
      </p>
    </div>
  </div>
);

export const TermsPage: React.FC = () => (
  <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
    <Breadcrumbs items={[{ label: "Terms of Service" }]} />
    <h1 className="text-3xl font-extrabold text-stone-900">Terms of Service</h1>
    <div className="bg-white p-6 sm:p-8 rounded-2xl border border-stone-200 text-xs sm:text-sm text-stone-700 space-y-4">
      <p>
        By accessing and placing orders on NOVA STORE, you agree to comply with our terms of service, payment agreements for Cash on Delivery, and courier receipt conditions.
      </p>
    </div>
  </div>
);

/* -------------------------------------------------------------
 * 7. NOT FOUND PAGE (404)
 * ------------------------------------------------------------- */
export const NotFoundPage: React.FC = () => (
  <div className="max-w-md mx-auto px-4 py-24 text-center space-y-4">
    <div className="text-6xl font-extrabold text-stone-900 tracking-tighter">404</div>
    <h1 className="text-xl font-bold text-stone-900">Page Not Found</h1>
    <p className="text-xs text-stone-500">
      The page you were looking for doesn't exist or may have been moved.
    </p>
    <div className="flex gap-2 pt-2 justify-center">
      <Link
        to="/"
        className="px-5 py-2.5 bg-stone-900 text-white rounded-xl text-xs font-semibold hover:bg-stone-800 transition-colors"
      >
        Back to Home
      </Link>
      <Link
        to="/products"
        className="px-5 py-2.5 bg-stone-100 hover:bg-stone-200 text-stone-800 rounded-xl text-xs font-semibold transition-colors"
      >
        Shop Catalog
      </Link>
    </div>
  </div>
);
