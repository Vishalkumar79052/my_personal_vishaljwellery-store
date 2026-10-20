import { Link } from "react-router-dom";
import {
  ShieldCheck,
  Truck,
  RotateCcw,
  Headphones,
  Sparkles,
  Phone,
  Mail,
  Clock,
} from "./icons/LucideIcons.jsx";

const Footer = () => {
  return (
    <footer className="mt-28 bg-[#09150D] text-stone-300 font-sans border-t border-gold-400/20 relative overflow-hidden">
      {/* Decorative Gold Glow in Background */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-32 bg-gradient-to-b from-gold-400/10 to-transparent blur-3xl pointer-events-none" />

      {/* Trust Pillars Bar */}
      <div className="border-b border-white/10 bg-white/[0.02]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-10 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
          <div className="flex items-start gap-4">
            <div className="w-12 h-12 rounded-2xl bg-gold-400/10 border border-gold-400/30 text-amber-300 flex items-center justify-center shrink-0">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <div>
              <h5 className="font-editorial text-lg font-bold text-white leading-tight">100% Certified Authentic</h5>
              <p className="text-xs text-stone-400 mt-1">Government BIS hallmarked 18K/22K gold & verified solitaires.</p>
            </div>
          </div>

          <div className="flex items-start gap-4">
            <div className="w-12 h-12 rounded-2xl bg-gold-400/10 border border-gold-400/30 text-amber-300 flex items-center justify-center shrink-0">
              <Truck className="w-6 h-6" />
            </div>
            <div>
              <h5 className="font-editorial text-lg font-bold text-white leading-tight">Insured Armoured Transit</h5>
              <p className="text-xs text-stone-400 mt-1">Tamper-evident, high-security protected doorstep delivery.</p>
            </div>
          </div>

          <div className="flex items-start gap-4">
            <div className="w-12 h-12 rounded-2xl bg-gold-400/10 border border-gold-400/30 text-amber-300 flex items-center justify-center shrink-0">
              <RotateCcw className="w-6 h-6" />
            </div>
            <div>
              <h5 className="font-editorial text-lg font-bold text-white leading-tight">30-Day Privilege Return</h5>
              <p className="text-xs text-stone-400 mt-1">Complimentary exchanges and guaranteed buyback valuation.</p>
            </div>
          </div>

          <div className="flex items-start gap-4">
            <div className="w-12 h-12 rounded-2xl bg-gold-400/10 border border-gold-400/30 text-amber-300 flex items-center justify-center shrink-0">
              <Headphones className="w-6 h-6" />
            </div>
            <div>
              <h5 className="font-editorial text-lg font-bold text-white leading-tight">VIP Private Concierge</h5>
              <p className="text-xs text-stone-400 mt-1">Direct diamond consultations and bespoke bridal sizing advisors.</p>
            </div>
          </div>
        </div>
      </div>

      {/* Main Footer Links & Story */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-16 grid grid-cols-1 md:grid-cols-12 gap-10 lg:gap-14 text-xs">
        {/* Brand Column */}
        <div className="md:col-span-5 space-y-4">
          <Link to="/" className="inline-flex items-center gap-2.5 group">
            <div className="w-9 h-9 rounded-full bg-forest-900 text-amber-300 flex items-center justify-center font-editorial font-bold text-base border border-amber-300/40 shadow-xs">
              VJ
            </div>
            <div>
              <span className="font-editorial text-2xl font-bold tracking-tight text-white block leading-tight">
                Vishal Jewellery
              </span>
              <span className="text-[10px] font-cinzel tracking-widest uppercase font-semibold text-gold-400 block">
                Haute Joaillerie & Solitaires
              </span>
            </div>
          </Link>

          <p className="text-stone-400 text-xs sm:text-sm leading-relaxed max-w-sm">
            Crafting certified sovereign gold jewellery, rare solitaire diamond creations,
            and regal bridal trousseaux designed with ancestral artistry for life's most precious milestones.
          </p>

          <div className="pt-2 flex items-center gap-3">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/5 border border-white/10 text-[11px] text-amber-200">
              <Sparkles className="w-3.5 h-3.5 text-gold-400" />
              <span>Certified Bureau of Indian Standards (BIS 916)</span>
            </div>
          </div>
        </div>

        {/* Collections */}
        <div className="md:col-span-3 space-y-3">
          <h4 className="font-cinzel text-xs font-bold text-gold-400 uppercase tracking-widest">
            Atelier Suites
          </h4>
          <ul className="space-y-2.5 text-stone-300 text-xs">
            <li>
              <Link to="/shop?category=Rings" className="hover:text-gold-300 transition-colors">
                Solitaire & Engagement Rings
              </Link>
            </li>
            <li>
              <Link to="/shop?category=Necklaces" className="hover:text-gold-300 transition-colors">
                Royal Emerald & Diamond Necklaces
              </Link>
            </li>
            <li>
              <Link to="/shop?category=Bracelets" className="hover:text-gold-300 transition-colors">
                Solid Gold Bangles & Tennis Cuffs
              </Link>
            </li>
            <li>
              <Link to="/shop?category=Earrings" className="hover:text-gold-300 transition-colors">
                Freshwater Pearl & Drop Earrings
              </Link>
            </li>
            <li>
              <Link to="/shop?category=Bridal%20Sets" className="hover:text-gold-300 transition-colors">
                Regal Kundan & Bridal Sets
              </Link>
            </li>
          </ul>
        </div>

        {/* Contact Concierge */}
        <div className="md:col-span-4 space-y-3">
          <h4 className="font-cinzel text-xs font-bold text-gold-400 uppercase tracking-widest">
            Atelier Concierge
          </h4>
          <ul className="space-y-3 text-stone-300 text-xs">
            <li className="flex items-center gap-2.5">
              <Phone className="w-4 h-4 text-gold-400 shrink-0" />
              <a
                href="tel:+917905239681"
                className="hover:text-gold-300 transition-colors font-medium font-sans"
              >
                +91 79052 39681
              </a>
            </li>

            <li className="flex items-center gap-2.5">
              <Mail className="w-4 h-4 text-gold-400 shrink-0" />
              <a
                href="mailto:contact@vishaljewellery.com"
                className="hover:text-gold-300 transition-colors font-medium"
              >
                contact@vishaljewellery.com
              </a>
            </li>

            <li className="flex items-start gap-2.5 text-stone-400 pt-1">
              <Clock className="w-4 h-4 text-gold-400 shrink-0 mt-0.5" />
              <span>Private Appointments & Inquiries: Available 24/7</span>
            </li>
          </ul>
        </div>
      </div>

      {/* Bottom Legal Bar */}
      <div className="border-t border-white/10 bg-black/40 py-6 px-4 sm:px-6 text-xs text-stone-500">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4 text-center sm:text-left">
          <p>© {new Date().getFullYear()} Vishal Jewellery Store. All rights reserved. Sovereign Certified Luxury.</p>
          <div className="flex items-center gap-6 text-[11px]">
            <Link to="/shop" className="hover:text-stone-300 transition-colors">
              Privacy Policy
            </Link>
            <Link to="/shop" className="hover:text-stone-300 transition-colors">
              Terms of Service
            </Link>
            <Link to="/shop" className="hover:text-stone-300 transition-colors">
              Shipping & Transit Protection
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
