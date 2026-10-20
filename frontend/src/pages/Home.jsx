import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import api from "../api/axios.js";
import ProductCard from "../components/ProductCard.jsx";
import {
  Sparkles,
  ShieldCheck,
  Truck,
  RotateCcw,
  Award,
  ArrowRight,
  PhoneCall,
  CheckCircle2,
  Heart,
} from "../components/icons/LucideIcons.jsx";

const CATEGORIES = [
  {
    name: "Rings",
    title: "Solitaire & Gold Rings",
    desc: "Brilliant cut natural diamonds set in 18K gold",
    image: "https://images.unsplash.com/photo-1605100804763-247f67b3557e?w=600&q=80",
    slug: "Rings",
  },
  {
    name: "Necklaces",
    title: "Royal Necklaces & Pendants",
    desc: "Heritage emerald, ruby and diamond statement pieces",
    image: "https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?w=600&q=80",
    slug: "Necklaces",
  },
  {
    name: "Bracelets",
    title: "Artisan Bangles & Cuffs",
    desc: "Solid gold filigree and diamond eternity tennis bracelets",
    image: "https://images.unsplash.com/photo-1611591475870-745a0b777a83?w=600&q=80",
    slug: "Bracelets",
  },
  {
    name: "Earrings",
    title: "Drop & Chandelier Earrings",
    desc: "Freshwater pearls and radiant diamond halo studs",
    image: "https://images.unsplash.com/photo-1630019852942-f89202989a59?w=600&q=80",
    slug: "Earrings",
  },
  {
    name: "Bridal Sets",
    title: "Heritage Bridal Trousseau",
    desc: "Opulent Kundan, Polki, and antique gold sets",
    image: "https://images.unsplash.com/photo-1515562141207-7a88fb7ce338?w=600&q=80",
    slug: "Bridal Sets",
  },
];

const Home = () => {
  const [featured, setFeatured] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    api
      .get("/products?limit=8")
      .then((res) => {
        const list = Array.isArray(res.data?.products)
          ? res.data.products
          : Array.isArray(res.data)
          ? res.data
          : [];
        setFeatured(list);
      })
      .catch((err) => {
        console.warn("Could not load featured products:", err.message);
        setFeatured([]);
      })
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="space-y-24 sm:space-y-32 pb-24 overflow-hidden">
      {/* ========================================================
          1. HERO SECTION: Haute Joaillerie Masterpiece
          ======================================================== */}
      <section className="relative pt-6 sm:pt-12 px-4 sm:px-6 max-w-7xl mx-auto">
        {/* Ambient Gold Glow Background */}
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 sm:w-[600px] h-96 sm:h-[600px] bg-gradient-to-tr from-amber-300/15 via-gold-400/10 to-emerald-900/5 rounded-full blur-3xl pointer-events-none -z-10" />

        <div className="grid lg:grid-cols-12 gap-12 lg:gap-8 items-center">
          {/* Hero Left Content */}
          <div className="lg:col-span-7 space-y-6 sm:space-y-8 text-center lg:text-left">
            {/* Luxury Crest Pill */}
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-forest-950/5 border border-gold-400/40 text-forest-950 text-xs font-semibold tracking-widest uppercase shadow-2xs">
              <Sparkles className="w-3.5 h-3.5 text-gold-600 animate-pulse" />
              <span>Haute Joaillerie · Certified Atelier</span>
            </div>

            {/* Main Regal Headline */}
            <h1 className="font-editorial text-4xl sm:text-6xl lg:text-7xl font-bold text-stone-950 tracking-tight leading-[1.08]">
              Timeless Splendour, <br />
              <span className="italic font-normal gold-gradient-text">
                Cast in Pure Gold & Rare Solitaires.
              </span>
            </h1>

            {/* Editorial Description */}
            <p className="text-stone-600 text-sm sm:text-base lg:text-lg max-w-xl mx-auto lg:mx-0 leading-relaxed font-sans">
              Discover masterfully crafted fine jewellery. Every solitaire diamond,
              emerald pendant, and heritage gold bangle is hallmarked with sovereign
              purity and designed to be treasured across generations.
            </p>

            {/* Call to Actions */}
            <div className="flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-4 pt-2">
              <Link to="/shop" className="btn-primary w-full sm:w-auto text-center !px-8 !py-3.5 shadow-gold">
                <span>Explore Fine Collections</span>
                <ArrowRight className="w-4 h-4 text-amber-300" />
              </Link>

              <Link
                to="/user/dashboard/support"
                className="btn-secondary w-full sm:w-auto text-center !px-7 !py-3.5 border-stone-300 text-stone-800 hover:border-gold-500"
              >
                <span>Book Concierge Viewing</span>
              </Link>
            </div>

            {/* Trust Badges Bar */}
            <div className="pt-6 border-t border-stone-200/70 grid grid-cols-2 sm:grid-cols-4 gap-4 text-left">
              <div className="flex items-center gap-2.5">
                <ShieldCheck className="w-4 h-4 text-emerald-800 shrink-0" />
                <div>
                  <p className="text-xs font-bold text-stone-900 leading-tight">BIS 916</p>
                  <p className="text-[10px] text-stone-500">Hallmarked Gold</p>
                </div>
              </div>

              <div className="flex items-center gap-2.5">
                <Award className="w-4 h-4 text-emerald-800 shrink-0" />
                <div>
                  <p className="text-xs font-bold text-stone-900 leading-tight">IGI & GIA</p>
                  <p className="text-[10px] text-stone-500">Certified Diamonds</p>
                </div>
              </div>

              <div className="flex items-center gap-2.5">
                <Truck className="w-4 h-4 text-emerald-800 shrink-0" />
                <div>
                  <p className="text-xs font-bold text-stone-900 leading-tight">100% Insured</p>
                  <p className="text-[10px] text-stone-500">Armoured Transit</p>
                </div>
              </div>

              <div className="flex items-center gap-2.5">
                <RotateCcw className="w-4 h-4 text-emerald-800 shrink-0" />
                <div>
                  <p className="text-xs font-bold text-stone-900 leading-tight">30-Day</p>
                  <p className="text-[10px] text-stone-500">Privilege Return</p>
                </div>
              </div>
            </div>
          </div>

          {/* Hero Right Showcase Visual */}
          <div className="lg:col-span-5 relative">
            <div className="relative mx-auto max-w-md lg:max-w-none">
              {/* Outer decorative gold ring */}
              <div className="absolute -inset-3 rounded-4xl bg-gradient-to-tr from-gold-400/30 via-transparent to-forest-900/20 blur-sm -z-10" />

              <div className="aspect-[4/5] rounded-3xl overflow-hidden bg-stone-900 shadow-2xl border-2 border-gold-400/40 relative group">
                <img
                  src="https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?w=1000&q=85"
                  alt="High Jewellery Masterpiece"
                  className="w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-1000"
                />

                <div className="absolute inset-0 bg-gradient-to-t from-stone-950/80 via-stone-950/20 to-transparent" />

                {/* Floating Card Overlay */}
                <div className="absolute bottom-5 inset-x-5 p-4 rounded-2xl bg-white/90 backdrop-blur-md border border-gold-300/60 shadow-xl flex items-center justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-forest-950 text-amber-300 flex items-center justify-center font-editorial font-bold text-lg border border-amber-300/40">
                      VJ
                    </div>
                    <div>
                      <p className="font-editorial text-base font-bold text-stone-950 leading-tight">
                        Royal Emerald Heritage
                      </p>
                      <p className="text-[11px] text-amber-800 font-semibold tracking-wider uppercase">
                        Hallmarked Solitaire Collection
                      </p>
                    </div>
                  </div>
                  <Link
                    to="/shop"
                    className="p-2 rounded-full bg-forest-950 text-amber-200 hover:bg-forest-900 transition-colors shrink-0 shadow-xs"
                    title="View Collection"
                  >
                    <ArrowRight className="w-4 h-4" />
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ========================================================
          2. MAISON CURATED CATEGORIES
          ======================================================== */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="text-center max-w-2xl mx-auto mb-12 sm:mb-16 space-y-3">
          <p className="text-[11px] font-cinzel font-semibold tracking-widest uppercase text-gold-700">
            Curated Collections
          </p>
          <h2 className="font-editorial text-3xl sm:text-5xl font-bold text-stone-950">
            Explore by Jewellery Category
          </h2>
          <p className="text-stone-500 text-xs sm:text-sm">
            From iconic solitaire engagement bands to royal heirloom neckpieces, discover the atelier's celebrated suites.
          </p>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4 sm:gap-6">
          {CATEGORIES.map((cat, idx) => (
            <Link
              key={idx}
              to={`/shop?category=${encodeURIComponent(cat.slug)}`}
              className="group flex flex-col bg-white rounded-3xl p-3 border border-stone-200/80 luxury-card-hover text-center"
            >
              <div className="aspect-square w-full rounded-2xl overflow-hidden bg-stone-100 mb-3 relative">
                <img
                  src={cat.image}
                  alt={cat.title}
                  className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700 ease-out"
                />
                <div className="absolute inset-0 bg-stone-950/15 group-hover:bg-stone-950/30 transition-colors" />
                <span className="absolute bottom-2.5 inset-x-2.5 py-1 rounded-full bg-forest-950/80 backdrop-blur text-amber-200 text-[10px] font-semibold tracking-wider uppercase border border-amber-300/30 opacity-90 group-hover:opacity-100 transition-opacity">
                  View Suite
                </span>
              </div>
              <h3 className="font-editorial text-lg font-bold text-stone-900 group-hover:text-forest-850 transition-colors">
                {cat.name}
              </h3>
              <p className="text-[11px] text-stone-400 mt-0.5 line-clamp-1">{cat.desc}</p>
            </Link>
          ))}
        </div>
      </section>

      {/* ========================================================
          3. FEATURED ATELIER MASTERPIECES
          ======================================================== */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-10 sm:mb-12 border-b border-stone-200/80 pb-6">
          <div>
            <p className="text-[11px] font-cinzel font-semibold tracking-widest uppercase text-gold-700 mb-1">
              Hallmarked Fine Jewellery
            </p>
            <h2 className="font-editorial text-3xl sm:text-5xl font-bold text-stone-950">
              Featured Masterpieces
            </h2>
          </div>
          <Link
            to="/shop"
            className="inline-flex items-center gap-2 text-xs font-bold tracking-wider uppercase text-emerald-950 hover:text-gold-700 transition-colors group"
          >
            <span>Explore Entire Boutique</span>
            <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
          </Link>
        </div>

        {loading ? (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 sm:gap-6">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="animate-pulse bg-white p-3 rounded-3xl border border-stone-200 space-y-3">
                <div className="aspect-[4/5] bg-stone-200 rounded-2xl" />
                <div className="h-4 bg-stone-200 rounded w-3/4" />
                <div className="h-4 bg-stone-200 rounded w-1/2" />
              </div>
            ))}
          </div>
        ) : featured.length === 0 ? (
          <div className="p-12 text-center rounded-3xl bg-white border border-stone-200">
            <p className="font-editorial text-xl text-stone-700">No masterpieces currently displayed.</p>
            <Link to="/shop" className="btn-primary mt-4 inline-block">
              Browse Catalogue
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6">
            {featured.map((p) => (
              <ProductCard key={p._id} product={p} />
            ))}
          </div>
        )}
      </section>

      {/* ========================================================
          4. THE VISHAL HERITAGE ATELIER STORY
          ======================================================== */}
      <section className="bg-gradient-to-br from-forest-950 via-forest-900 to-stone-950 text-amber-100 py-20 sm:py-28 px-4 sm:px-6 relative">
        <div className="max-w-7xl mx-auto grid lg:grid-cols-2 gap-12 lg:gap-16 items-center">
          <div className="space-y-6">
            <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-amber-400/10 border border-amber-400/30 text-amber-300 text-[11px] font-semibold tracking-widest uppercase">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Ancestral Craftsmanship</span>
            </div>

            <h2 className="font-editorial text-4xl sm:text-5xl lg:text-6xl font-bold text-white leading-tight">
              Honouring Centuries of Indian Filigree & Goldsmithing
            </h2>

            <p className="text-amber-100/70 text-sm sm:text-base leading-relaxed">
              Every creation at Vishal Jewellery begins with an uncompromising commitment
              to pure precious metals. Our master karigars blend centuries of royal Jaipuri
              filigree with modern Swiss laser casting, crafting heirlooms that retain their
              lustre and emotional value forever.
            </p>

            <div className="space-y-3.5 pt-2">
              <div className="flex items-start gap-3">
                <CheckCircle2 className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
                <div>
                  <h4 className="font-bold text-white text-sm">BIS Sovereign Hallmarking</h4>
                  <p className="text-xs text-amber-100/60">Every gold jewel bears the authentic laser-etched Bureau of Indian Standards hallmark.</p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <CheckCircle2 className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
                <div>
                  <h4 className="font-bold text-white text-sm">Ethically Mined, Certified Solitaires</h4>
                  <p className="text-xs text-amber-100/60">Natural diamonds rigorously graded for cut, clarity, carat, and color with individual gem certificates.</p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <CheckCircle2 className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
                <div>
                  <h4 className="font-bold text-white text-sm">Lifetime Buyback & Atelier Polish</h4>
                  <p className="text-xs text-amber-100/60">Enjoy complimentary lifetime cleaning, inspection, and guaranteed buyback value.</p>
                </div>
              </div>
            </div>

            <div className="pt-4">
              <Link to="/shop" className="btn-gold !px-8 !py-3.5">
                <span>View Certified Heirlooms</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          </div>

          {/* Right Image Composition */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-4">
              <div className="rounded-3xl overflow-hidden aspect-[4/5] border border-amber-400/20 shadow-2xl">
                <img
                  src="https://images.unsplash.com/photo-1605100804763-247f67b3557e?w=700&q=80"
                  alt="Solitaire Diamond Ring Craft"
                  className="w-full h-full object-cover"
                />
              </div>
              <div className="p-5 rounded-3xl bg-white/5 border border-amber-400/20 text-xs text-amber-100/80">
                <p className="font-editorial text-base font-bold text-amber-200">100% Conflict-Free</p>
                <p className="text-[11px] mt-1 text-amber-100/60">Kimberley Process Certified Gemstones</p>
              </div>
            </div>

            <div className="space-y-4 pt-8">
              <div className="p-5 rounded-3xl bg-white/5 border border-amber-400/20 text-xs text-amber-100/80">
                <p className="font-editorial text-base font-bold text-amber-200">Bespoke Engraving</p>
                <p className="text-[11px] mt-1 text-amber-100/60">Complimentary customized initials on request</p>
              </div>
              <div className="rounded-3xl overflow-hidden aspect-[4/5] border border-amber-400/20 shadow-2xl">
                <img
                  src="https://images.unsplash.com/photo-1535632066927-ab7c9ab60908?w=700&q=80"
                  alt="Fine Gold Handcrafted Jewels"
                  className="w-full h-full object-cover"
                />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ========================================================
          5. CLIENT TESTIMONIALS / PATRON REVIEWS
          ======================================================== */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="text-center max-w-xl mx-auto mb-12 space-y-2">
          <p className="text-[11px] font-cinzel font-semibold tracking-widest uppercase text-gold-700">
            Patron Reflections
          </p>
          <h2 className="font-editorial text-3xl sm:text-5xl font-bold text-stone-950">
            Cherished by Discerning Clients
          </h2>
        </div>

        <div className="grid md:grid-cols-3 gap-6">
          <div className="p-6 sm:p-8 rounded-3xl bg-white border border-stone-200/80 shadow-soft space-y-4">
            <div className="flex text-amber-400 text-sm">★★★★★</div>
            <p className="font-editorial text-lg text-stone-800 leading-snug">
              "The solitaire engagement ring from Vishal Jewellery exceeded every expectation.
              The diamond's fire is breathtaking, and the hallmarked certificate gave us complete peace of mind."
            </p>
            <div className="pt-2 border-t border-stone-100">
              <p className="text-xs font-bold text-stone-900">Ananya & Raghav S.</p>
              <p className="text-[10px] text-stone-400">Eternal Solitaire Ring · New Delhi</p>
            </div>
          </div>

          <div className="p-6 sm:p-8 rounded-3xl bg-white border border-stone-200/80 shadow-soft space-y-4">
            <div className="flex text-amber-400 text-sm">★★★★★</div>
            <p className="font-editorial text-lg text-stone-800 leading-snug">
              "The Royal Emerald Necklace is an absolute showstopper. The filigree work reminds me of our ancestral royal jewelry.
              The armored courier delivery was prompt and discreet."
            </p>
            <div className="pt-2 border-t border-stone-100">
              <p className="text-xs font-bold text-stone-900">Meera Sen</p>
              <p className="text-[10px] text-stone-400">Heritage Choker Suite · Mumbai</p>
            </div>
          </div>

          <div className="p-6 sm:p-8 rounded-3xl bg-white border border-stone-200/80 shadow-soft space-y-4">
            <div className="flex text-amber-400 text-sm">★★★★★</div>
            <p className="font-editorial text-lg text-stone-800 leading-snug">
              "Outstanding customer concierge support. They helped me choose the exact tennis bracelet for our 10th anniversary.
              Magnificent presentation box and documentation."
            </p>
            <div className="pt-2 border-t border-stone-100">
              <p className="text-xs font-bold text-stone-900">Vikramaditya Roy</p>
              <p className="text-[10px] text-stone-400">Aura Diamond Tennis Bracelet · Bengaluru</p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Home;
