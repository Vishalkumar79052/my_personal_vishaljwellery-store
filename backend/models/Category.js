import mongoose from "mongoose";

const categorySchema = new mongoose.Schema(
  {
    name: { type: String, required: true, unique: true, trim: true },
    slug: { type: String, lowercase: true, trim: true },
    description: { type: String, default: "" },
    image: { type: String, default: "" },
    featured: { type: Boolean, default: false },
    sortOrder: { type: Number, default: 0 },
  },
  { timestamps: true }
);

categorySchema.pre("save", function (next) {
  if (this.isModified("name") && !this.slug) {
    this.slug = this.name.toLowerCase().replace(/[^a-z0-9]+/g, "-");
  }
  next();
});

const DEFAULT_CATEGORIES = [
  { name: "Rings", description: "Solitaires, eternity bands, and diamond cocktail rings", image: "https://images.unsplash.com/photo-1605100804763-247f67b3557e?w=800", featured: true, sortOrder: 1 },
  { name: "Necklaces", description: "Chokers, collar necklaces, and bridal sets", image: "https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?w=800", featured: true, sortOrder: 2 },
  { name: "Earrings", description: "Studs, chandelier drops, and diamond hoops", image: "https://images.unsplash.com/photo-1630019852942-f89202989a59?w=800", featured: true, sortOrder: 3 },
  { name: "Bracelets", description: "Tennis bracelets, cuffs, and charm bracelets", image: "https://images.unsplash.com/photo-1611591475817-21a4f028441f?w=800", featured: true, sortOrder: 4 },
  { name: "Bangles", description: "Traditional 22K gold & diamond encrusted bangles", image: "https://images.unsplash.com/photo-1535632066927-ab7c9ab60908?w=800", featured: false, sortOrder: 5 },
  { name: "Pendants", description: "Gemstone solitaires and bespoke religious motifs", image: "https://images.unsplash.com/photo-1515562141207-7a88fb7ce338?w=800", featured: false, sortOrder: 6 },
  { name: "Bridal Sets", description: "Complete royal wedding trousseau suites", image: "https://images.unsplash.com/photo-1544816155-12df9643f363?w=800", featured: true, sortOrder: 7 },
  { name: "Solitaires", description: "GIA certified natural and lab-grown diamonds", image: "https://images.unsplash.com/photo-1603561591411-07134e71a2a9?w=800", featured: true, sortOrder: 8 },
];

categorySchema.statics.seedDefaultsIfEmpty = async function () {
  const count = await this.countDocuments();
  if (count === 0) {
    for (const cat of DEFAULT_CATEGORIES) {
      await this.create(cat);
    }
  }
};

const Category = mongoose.model("Category", categorySchema);
export default Category;
