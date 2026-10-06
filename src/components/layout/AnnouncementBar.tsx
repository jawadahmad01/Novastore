import React from "react";
import { siteConfig } from "@/src/config/site";
import { Phone, ShieldCheck, MapPin } from "lucide-react";

export const AnnouncementBar: React.FC = () => {
  return (
    <div className="bg-stone-900 text-stone-200 text-xs py-2 px-4 border-b border-stone-800">
      <div className="max-w-7xl mx-auto flex items-center justify-between gap-4">
        {/* Left: Market location indicator */}
        <div className="hidden md:flex items-center gap-1.5 text-stone-400">
          <MapPin className="w-3.5 h-3.5 text-stone-300" />
          <span>Pakistan (PKR · Rs.)</span>
          <span aria-hidden="true" className="text-stone-700">|</span>
          <span className="flex items-center gap-1 text-emerald-400">
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>Cash on Delivery Available</span>
          </span>
        </div>

        {/* Center: Main announcement */}
        <div className="text-center flex-1 font-medium text-stone-100 truncate">
          {siteConfig.brand.announcement}
        </div>

        {/* Right: Helpline / Support contact */}
        <div className="hidden sm:flex items-center gap-3 text-stone-400">
          <a
            href={`tel:${siteConfig.contact.phone}`}
            className="flex items-center gap-1 hover:text-white transition-colors"
          >
            <Phone className="w-3 h-3" />
            <span>{siteConfig.contact.displayPhone}</span>
          </a>
          <span aria-hidden="true" className="text-stone-700">|</span>
          <span>Mon-Sat: 9am-9pm</span>
        </div>
      </div>
    </div>
  );
};
