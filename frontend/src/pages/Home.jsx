import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import api from "../api/axios.js";
import ProductCard from "../components/ProductCard.jsx";

const Home = () => {
  const [featured, setFeatured] = useState([]);

  useEffect(() => {
    api.get("/products?limit=8").then((res) => setFeatured(res.data.products));
  }, []);

  return (
    <div>
      <section className="max-w-7xl mx-auto px-6 pt-16 pb-20 grid md:grid-cols-2 gap-12 items-center">
        <div>
          <p className="uppercase tracking-[0.2em] text-xs text-clay-600 mb-4">New season</p>
          <h1 className="font-display text-5xl md:text-6xl leading-[1.05] text-ink mb-6">
            Everyday jewellery, <em className="text-forest-600 not-italic">made to last.</em>
          </h1>
          <p className="text-forest-800/70 max-w-md mb-8 text-lg">
           A thoughtfully curated collection of timeless jewellery — crafted with elegance, designed to celebrate every moment, and made to be treasured.
          </p>
          <Link to="/shop" className="btn-primary inline-block">
            Explore the shop
          </Link>
        </div>
        <div className="aspect-[4/5] rounded-3xl bg-forest-100 overflow-hidden">
          <img
            src="https://images.unsplash.com/photo-1556228453-efd6c1ff04f6?w=900"
            alt="Considered home goods flat lay"
            className="w-full h-full object-cover"
          />
        </div>
      </section>

      <section className="max-w-7xl mx-auto px-6 pb-24">
        <div className="flex items-end justify-between mb-8">
          <h2 className="font-display text-3xl text-ink">Featured pieces</h2>
          <Link to="/shop" className="text-sm font-medium text-forest-700 hover:underline">
            View all →
          </Link>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-x-6 gap-y-10">
          {featured.map((p) => (
            <ProductCard key={p._id} product={p} />
          ))}
        </div>
      </section>
    </div>
  );
};

export default Home;
