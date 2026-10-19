import { Link } from "react-router-dom";

const ProductCard = ({ product }) => (
  <Link to={`/product/${product._id}`} className="group block">
    <div className="aspect-[4/5] overflow-hidden rounded-2xl bg-sand mb-3 relative">
      <img
        src={product.image}
        alt={product.name}
        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
      />
      {product.stock <= 5 && product.stock > 0 && (
        <span className="absolute top-3 left-3 bg-clay-500 text-white text-[10px] px-2 py-1 rounded-full uppercase tracking-wide">
          Low stock
        </span>
      )}
      {product.stock === 0 && (
        <span className="absolute top-3 left-3 bg-ink text-white text-[10px] px-2 py-1 rounded-full uppercase tracking-wide">
          Sold out
        </span>
      )}
    </div>
    <div className="flex items-start justify-between gap-2">
      <div>
        <p className="text-xs uppercase tracking-wide text-forest-500">{product.category}</p>
        <h3 className="font-display text-lg leading-snug text-ink">{product.name}</h3>
      </div>
      <div className="text-right shrink-0">
        <p className="font-medium">${product.price.toFixed(2)}</p>
        {product.compareAtPrice > product.price && (
          <p className="text-xs text-forest-700/40 line-through">${product.compareAtPrice.toFixed(2)}</p>
        )}
      </div>
    </div>
  </Link>
);

export default ProductCard;
