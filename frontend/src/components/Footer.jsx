import { Link, useLocation } from "react-router-dom";

const Footer = () => {
  const location = useLocation();
  const isAdmin = location.pathname.startsWith("/admin");

  // Sleek, minimal footer for the admin console to prevent UI clutter
  if (isAdmin) {
    return (
      <footer className="mt-auto border-t border-forest-100 bg-white/70 py-4 px-6 text-xs text-forest-700/70">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-2">
          <p>© {new Date().getFullYear()} Vishal Jewellery Store — Admin Console. All rights reserved.</p>
          <div className="flex items-center gap-3">
            <span className="inline-flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              <span className="text-forest-800 font-medium">System Online</span>
            </span>
          </div>
        </div>
      </footer>
    );
  }

  return (
    <footer className="mt-24 border-t border-forest-100 bg-sand/50 text-ink">
      {/* Trust Pillars Bar */}
      <div className="border-b border-forest-100/80 bg-sand/70">
        <div className="max-w-7xl mx-auto px-6 py-8 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="flex items-start gap-3.5">
            <div className="w-10 h-10 rounded-xl bg-forest-100/80 text-forest-800 flex items-center justify-center shrink-0">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.75" d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <div>
              <h5 className="font-semibold text-forest-900 text-sm">100% Certified Authentic</h5>
              <p className="text-xs text-forest-700/70 mt-0.5">Hallmarked metals and verified gemstones</p>
            </div>
          </div>

          <div className="flex items-start gap-3.5">
            <div className="w-10 h-10 rounded-xl bg-forest-100/80 text-forest-800 flex items-center justify-center shrink-0">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.75" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
              </svg>
            </div>
            <div>
              <h5 className="font-semibold text-forest-900 text-sm">Insured Express Delivery</h5>
              <p className="text-xs text-forest-700/70 mt-0.5">Tamper-evident, protected doorstep shipping</p>
            </div>
          </div>

          <div className="flex items-start gap-3.5">
            <div className="w-10 h-10 rounded-xl bg-forest-100/80 text-forest-800 flex items-center justify-center shrink-0">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.75" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
              </svg>
            </div>
            <div>
              <h5 className="font-semibold text-forest-900 text-sm">Easy 30-Day Returns</h5>
              <p className="text-xs text-forest-700/70 mt-0.5">Hassle-free exchange and full refund policy</p>
            </div>
          </div>

          <div className="flex items-start gap-3.5">
            <div className="w-10 h-10 rounded-xl bg-forest-100/80 text-forest-800 flex items-center justify-center shrink-0">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.75" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
              </svg>
            </div>
            <div>
              <h5 className="font-semibold text-forest-900 text-sm">Dedicated Support</h5>
              <p className="text-xs text-forest-700/70 mt-0.5">Direct phone and email jewellery advisors</p>
            </div>
          </div>
        </div>
      </div>

      {/* Main Footer Links */}
      <div className="max-w-7xl mx-auto px-6 py-14 grid grid-cols-1 md:grid-cols-3 gap-10 lg:gap-14 text-sm">
        {/* Brand Story */}
        <div className="space-y-3">
          <Link to="/" className="inline-block font-display text-2xl text-forest-900 tracking-tight">
            Vishal Jewellery Store
          </Link>
          <p className="text-forest-700/80 text-sm leading-relaxed max-w-sm">
            Thoughtfully crafted and ethically sourced fine jewellery and timeless lifestyle pieces, designed for everyday elegance and cherished milestones.
          </p>
        </div>

        {/* Collections */}
        <div>
          <h4 className="font-medium text-forest-900 mb-3.5 tracking-wide text-xs uppercase">Collections</h4>
          <ul className="space-y-2.5 text-forest-700/80">
            <li>All Jewellery</li>
            <li>Diamond & Gold Rings</li>
            <li>Necklaces & Pendants</li>
            <li>Earrings & Studs</li>
            <li>Bracelets & Bangles</li>
            <li>Bridal & Wedding Sets</li>
          </ul>
        </div>

        {/* Contact Info */}
        <div>
          <h4 className="font-medium text-forest-900 mb-3.5 tracking-wide text-xs uppercase">Contact Us</h4>
          <ul className="space-y-3 text-forest-700/80">
            <li className="flex items-center gap-2.5">
              <svg className="w-4 h-4 text-forest-600 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
              </svg>
              <a
                href="tel:+917905239681"
                className="hover:text-forest-950 transition-colors font-medium"
                title="Click to call +91 79052 39681"
              >
                Call: +91 79052 39681
              </a>
            </li>
            <li className="flex items-center gap-2.5">
              <svg className="w-4 h-4 text-emerald-600 shrink-0" fill="currentColor" viewBox="0 0 24 24">
                <path d="M.057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.587-5.946.003-6.556 5.338-11.891 11.893-11.891 3.181.001 6.167 1.24 8.413 3.488 2.245 2.248 3.481 5.236 3.48 8.414-.003 6.557-5.338 11.892-11.893 11.892-1.99-.001-3.951-.5-5.688-1.448l-6.305 1.654zm6.597-3.807c1.676.995 3.276 1.591 5.392 1.592 5.448 0 9.886-4.434 9.889-9.885.002-5.462-4.415-9.89-9.881-9.892-5.452 0-9.887 4.434-9.889 9.884-.001 2.225.651 3.891 1.746 5.634l-.999 3.648 3.742-.981zm11.387-5.464c-.074-.124-.272-.198-.57-.347-.297-.149-1.758-.868-2.031-.967-.272-.099-.47-.149-.669.149-.198.297-.768.967-.941 1.165-.173.198-.347.223-.644.074-.297-.149-1.255-.462-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.297-.347.446-.521.151-.172.2-.296.3-.495.099-.198.05-.372-.025-.521-.075-.148-.669-1.611-.916-2.206-.242-.579-.487-.501-.669-.51l-.57-.01c-.198 0-.52.074-.792.372s-1.04 1.016-1.04 2.479 1.065 2.876 1.213 3.074c.149.198 2.095 3.2 5.076 4.487.709.306 1.263.489 1.694.626.712.226 1.36.194 1.872.118.571-.085 1.758-.719 2.006-1.413.248-.695.248-1.29.173-1.414z"/>
              </svg>
              <a
                href="https://wa.me/918279688358?text=Hello!%20How%20can%20I%20help%20you%3F"
                target="_blank"
                rel="noopener noreferrer"
                className="hover:text-emerald-700 transition-colors font-medium"
                title="Chat on WhatsApp"
              >
                WhatsApp
              </a>
            </li>
            <li className="flex items-center gap-2.5">
              <svg className="w-4 h-4 text-sky-500 shrink-0" fill="currentColor" viewBox="0 0 24 24">
                <path d="M11.944 0A12 12 0 0 0 0 12a12 12 0 0 0 12 12 12 12 0 0 0 12-12A12 12 0 0 0 12 0a12 12 0 0 0-.056 0zm4.962 7.224c.1-.002.321.023.465.14a.506.506 0 0 1 .171.325c.016.093.036.306.02.472-.18 1.898-.962 6.502-1.36 8.627-.168.9-.499 1.201-.82 1.23-.696.065-1.225-.46-1.9-.902-1.056-.693-1.653-1.124-2.678-1.8-1.185-.78-.417-1.21.258-1.91.177-.184 3.247-2.977 3.307-3.23.007-.032.014-.15-.056-.212s-.174-.041-.249-.024c-.106.024-1.793 1.14-5.061 3.345-.48.33-.913.49-1.302.48-.428-.008-1.252-.241-1.865-.44-.752-.245-1.349-.374-1.297-.789.027-.216.325-.437.893-.663 3.498-1.524 5.83-2.529 6.998-3.014 3.332-1.386 4.025-1.627 4.476-1.635z"/>
              </svg>
              <a
                href="https://t.me/+918279688358?text=Hello%20sir%20!%20How%20can%20I%20help%20you%20%3F"
                target="_blank"
                rel="noopener noreferrer"
                className="hover:text-sky-700 transition-colors font-medium"
                title="Chat on Telegram"
              >
                Telegram
              </a>
            </li>
            <li className="flex items-center gap-2.5">
              <svg className="w-4 h-4 text-forest-600 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
              </svg>
              <a
                href="mailto:vishalcse340@gmail.com?subject=Inquiry%20-%20Vishal%20Jewellery%20Store"
                className="hover:text-forest-950 transition-colors break-all font-medium"
                title="Send an email to vishalcse340@gmail.com"
              >
                Email: vishalcse340@gmail.com
              </a>
            </li>
            <li className="flex items-start gap-2.5 text-xs text-forest-700/70 pt-1">
              <svg className="w-4 h-4 text-forest-600 shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <span>Open 24 * 7</span>
            </li>
          </ul>
        </div>
      </div>

      {/* Bottom Bar */}
      <div className="border-t border-forest-100/80 bg-sand/80 py-6 px-6 text-xs text-forest-700/60">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4 text-center sm:text-left">
          <p>© {new Date().getFullYear()} Vishal Jewellery Store. All rights reserved.</p>
          <div className="flex items-center gap-6">
            <Link to="/shop" className="hover:text-forest-900 transition-colors">
              Privacy Policy
            </Link>
            <Link to="/shop" className="hover:text-forest-900 transition-colors">
              Terms of Service
            </Link>
            <Link to="/shop" className="hover:text-forest-900 transition-colors">
              Shipping & Returns
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;

