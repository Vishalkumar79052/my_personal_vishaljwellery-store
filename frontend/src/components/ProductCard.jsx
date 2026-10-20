import { Link } from "react-router-dom";
import { Sparkles, ArrowRight } from "./icons/LucideIcons.jsx";

const ProductCard = ({ product }) => {
  if (!product) return null;

  const isLowStock = product.stock <= 5 && product.stock > 0;
  const isSoldOut = product.stock === 0;

  return (
    <Link
      to={`/product/${product._id}`}
      className="group flex flex-col bg-white rounded-3xl p-3 sm:p-3.5 border border-stone-200/80 luxury-card-hover relative"
    >
      {/* Product Image Stage */}
      <div className="aspect-[4/5] w-full overflow-hidden rounded-2xl bg-[#F7F4EE] relative mb-3.5 flex items-center justify-center">
        <img
          src={product.image || "https://images.unsplash.com/photo-1605100804763-247f67b3557e?w=600&q=80"}
          alt={product.name}
          className="w-full h-full object-cover group-hover:scale-108 transition-transform duration-700 ease-out"
          loading="lazy"
        />

        {/* Floating Badges */}
        <div className="absolute top-2.5 left-2.5 flex flex-col gap-1.5 z-10">
          <span className="inline-flex items-center gap-1 bg-forest-950/85 backdrop-blur-md text-amber-200 text-[10px] font-semibold tracking-wider uppercase px-2.5 py-1 rounded-full border border-amber-300/40 shadow-xs">
            <Sparkles className="w-2.5 h-2.5 text-amber-400" />
            <span>BIS Hallmarked</span>
          </span>

          {isLowStock && (
            <span className="bg-amber-600/90 backdrop-blur-md text-white text-[9px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider">
              Only {product.stock} left
            </span>
          )}
          {isSoldOut && (
            <span className="bg-stone-900/90 backdrop-blur-md text-stone-200 text-[9px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider">
              Reserved
            </span>
          )}
        </div>

        {/* Quick View Hover Pill */}
        <div className="absolute inset-x-3 bottom-3 z-10 translate-y-3 opacity-0 group-hover:translate-y-0 group-hover:opacity-100 transition-all duration-300">
          <div className="w-full py-2.5 px-4 rounded-xl bg-forest-950/90 backdrop-blur-md text-amber-100 text-xs font-semibold tracking-wider uppercase flex items-center justify-center gap-2 border border-amber-300/30 shadow-lg">
            <span>View Masterpiece</span>
            <ArrowRight className="w-3.5 h-3.5 text-amber-300 transition-transform group-hover:translate-x-1" />
          </div>
        </div>
      </div>

      {/* Product Content Details */}
      <div className="flex-1 flex flex-col justify-between px-1">
        <div>
          <div className="flex items-center justify-between gap-2 mb-1">
            <p className="text-[10px] font-cinzel tracking-widest uppercase text-gold-700 font-semibold truncate">
              {product.category || "Fine Jewellery"}
            </p>
            <div className="flex items-center text-amber-500 text-[11px] font-semibold shrink-0">
              <span>★</span>
              <span className="text-stone-600 text-[10px] ml-0.5">4.9</span>
            </div>
          </div>

          <h3 className="font-editorial text-lg sm:text-xl font-bold text-stone-900 leading-snug line-clamp-2 group-hover:text-forest-850 transition-colors">
            {product.name}
          </h3>
        </div>

        {/* Price & SKU row */}
        <div className="mt-3 pt-3 border-t border-stone-100 flex items-baseline justify-between gap-2">
          <div className="flex items-baseline gap-2">
            <span className="font-sans text-base sm:text-lg font-bold text-stone-950">
              ${Number(product.price || 0).toFixed(2)}
            </span>
            {product.compareAtPrice > product.price && (
              <span className="text-xs text-stone-400 line-through">
                ${Number(product.compareAtPrice).toFixed(2)}
              </span>
            )}
          </div>

          <span className="text-[10px] text-stone-400 font-mono tracking-wider">
            {product.sku || "18K Gold"}
          </span>
        </div>
      </div>
    </Link>
  );
};

export default ProductCard;
