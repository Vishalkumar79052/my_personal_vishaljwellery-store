import mongoose from "mongoose";

const settingSchema = new mongoose.Schema(
  {
    storeName: { type: String, default: "Vishal Jewellery Store" },
    tagline: { type: String, default: "Haute Joaillerie & Certified Solitaires" },
    contactEmail: { type: String, default: "contact@vishaljewellery.com" },
    contactPhone: { type: String, default: "+91 98765 43210" },
    currency: { type: String, default: "USD" },
    currencySymbol: { type: String, default: "$" },
    lowStockThreshold: { type: Number, default: 5 },
    freeShippingThreshold: { type: Number, default: 500 },
    storeAddress: {
      type: String,
      default: "104 Heritage Jewellers Boulevard, Zaveri Bazaar, Mumbai 400002, India",
    },
    aboutStory: {
      type: String,
      default: "Dedicated to handcrafted timeless bridal jewelry, solitaire diamonds, and precious gemstone heirlooms.",
    },
  },
  { timestamps: true }
);

settingSchema.statics.getStoreSettings = async function () {
  let settings = await this.findOne();
  if (!settings) {
    settings = await this.create({});
  }
  return settings;
};

const Setting = mongoose.model("Setting", settingSchema);
export default Setting;
