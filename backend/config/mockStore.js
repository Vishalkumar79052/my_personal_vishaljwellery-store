import bcrypt from "bcryptjs";

// Sample seed products with fixed realistic IDs
const INITIAL_PRODUCTS = [
  {
    _id: "66d8e0000000000000000101",
    name: "Eternal Solitaire Diamond Ring",
    description: "Handcrafted 18K yellow gold band with a brilliant-cut certified solitaire diamond.",
    price: 499.0,
    compareAtPrice: 599.0,
    category: "Rings",
    brand: "Vishal Atelier",
    image: "https://images.unsplash.com/photo-1605100804763-247f67b3557e?w=600",
    stock: 25,
    isFeatured: true,
    isActive: true,
    sku: "VSH-RNG-001",
    rating: 4.9,
    numReviews: 4,
    reviews: [
      {
        _id: "66d8e0000000000000000201",
        user: "66d8e0000000000000000002",
        name: "Demo Shopper",
        rating: 5,
        comment: "Breathtaking brilliance and timeless craftsmanship. Fits true to size!",
        createdAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000),
      },
    ],
    createdAt: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000),
    updatedAt: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000),
  },
  {
    _id: "66d8e0000000000000000102",
    name: "Royal Emerald Heritage Necklace",
    description: "Intricately woven 22K gold chain adorned with a deep green certified emerald pendant.",
    price: 749.5,
    compareAtPrice: 850.0,
    category: "Necklaces",
    brand: "Vishal Atelier",
    image: "https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?w=600",
    stock: 18,
    isFeatured: true,
    isActive: true,
    sku: "VSH-NCK-002",
    rating: 4.8,
    numReviews: 3,
    reviews: [],
    createdAt: new Date(Date.now() - 9 * 24 * 60 * 60 * 1000),
    updatedAt: new Date(Date.now() - 9 * 24 * 60 * 60 * 1000),
  },
  {
    _id: "66d8e0000000000000000103",
    name: "Lustrous Freshwater Pearl Drop Earrings",
    description: "Selected natural freshwater baroque pearls suspended from delicate 14K rose gold hooks.",
    price: 185.0,
    category: "Earrings",
    brand: "Vishal Atelier",
    image: "https://images.unsplash.com/photo-1535632066927-ab7c9ab60908?w=600",
    stock: 35,
    isFeatured: true,
    isActive: true,
    sku: "VSH-EAR-003",
    rating: 4.7,
    numReviews: 2,
    reviews: [],
    createdAt: new Date(Date.now() - 8 * 24 * 60 * 60 * 1000),
    updatedAt: new Date(Date.now() - 8 * 24 * 60 * 60 * 1000),
  },
  {
    _id: "66d8e0000000000000000104",
    name: "Artisan Solid Gold Filigree Bracelet",
    description: "Hand-chiseled 18K solid yellow gold cuff with filigree motifs and safety push clasp.",
    price: 380.0,
    compareAtPrice: 420.0,
    category: "Bracelets",
    brand: "Vishal Atelier",
    image: "https://images.unsplash.com/photo-1611591475819-20b1297eef9f?w=600",
    stock: 15,
    isFeatured: true,
    isActive: true,
    sku: "VSH-BRC-004",
    rating: 4.9,
    numReviews: 6,
    reviews: [],
    createdAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
    updatedAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
  },
  {
    _id: "66d8e0000000000000000105",
    name: "Celestial Diamond Solitaire Studs",
    description: "Classic four-prong platinum stud earrings featuring brilliant-cut conflict-free diamonds.",
    price: 299.99,
    compareAtPrice: 349.99,
    category: "Earrings",
    brand: "Vishal Atelier",
    image: "https://images.unsplash.com/photo-1630019852942-f89202989a59?w=600",
    stock: 22,
    isFeatured: false,
    isActive: true,
    sku: "VSH-EAR-005",
    rating: 4.8,
    numReviews: 5,
    reviews: [],
    createdAt: new Date(Date.now() - 6 * 24 * 60 * 60 * 1000),
    updatedAt: new Date(Date.now() - 6 * 24 * 60 * 60 * 1000),
  },
  {
    _id: "66d8e0000000000000000106",
    name: "Aura Diamond Eternity Tennis Bracelet",
    description: "Continuous line of lab-grown certified round diamonds set in 14K rhodium white gold.",
    price: 850.0,
    compareAtPrice: 950.0,
    category: "Bracelets",
    brand: "Vishal Atelier",
    image: "https://images.unsplash.com/photo-1515562141207-7a88fb7ce338?w=600",
    stock: 12,
    isFeatured: false,
    isActive: true,
    sku: "VSH-BRC-006",
    rating: 4.9,
    numReviews: 3,
    reviews: [],
    createdAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000),
    updatedAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000),
  },
  {
    _id: "66d8e0000000000000000107",
    name: "Kundan Heritage Bridal Choker Set",
    description: "Grand 24K gold foil Kundan choker with matching jhumkas and maang tikka, encrusted with rubies.",
    price: 1199.0,
    compareAtPrice: 1399.0,
    category: "Bridal Sets",
    brand: "Vishal Atelier",
    image: "https://images.unsplash.com/photo-1603561591411-07134e71a2a9?w=600",
    stock: 8,
    isFeatured: true,
    isActive: true,
    sku: "VSH-BRD-007",
    rating: 5.0,
    numReviews: 2,
    reviews: [],
    createdAt: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000),
    updatedAt: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000),
  },
];

let users = [];
let products = [];
let orders = [];

function generateId() {
  return "66d8" + Math.random().toString(16).slice(2, 10).padEnd(8, "0") + Date.now().toString(16).slice(-12);
}

function createUserDocument(raw) {
  const doc = {
    _id: raw._id ? String(raw._id) : generateId(),
    name: raw.name || "",
    email: (raw.email || "").toLowerCase().trim(),
    password: raw.password || "",
    role: raw.role || "user",
    avatar: raw.avatar || "",
    address: raw.address || {},
    cart: Array.isArray(raw.cart)
      ? raw.cart.map((item) => ({
          product: item.product?._id ? String(item.product._id) : String(item.product),
          quantity: Number(item.quantity) || 1,
        }))
      : [],
    isActive: (raw.role === "admin" || (raw.email && raw.email.includes("vishal"))) ? true : (raw.isActive !== undefined ? Boolean(raw.isActive) : true),
    createdAt: raw.createdAt ? new Date(raw.createdAt) : new Date(),
    updatedAt: raw.updatedAt ? new Date(raw.updatedAt) : new Date(),
  };

  doc.matchPassword = async function (entered) {
    if (!this.password) return false;
    return bcrypt.compare(entered, this.password);
  };

  doc.toSafeObject = function () {
    const copy = { ...this };
    delete copy.password;
    delete copy.matchPassword;
    delete copy.toSafeObject;
    delete copy.save;
    delete copy.deleteOne;
    delete copy.populate;
    return copy;
  };

  doc.save = async function () {
    if (doc.role === "admin") {
      doc.isActive = true;
    }
    doc.updatedAt = new Date();
    const idx = users.findIndex((u) => u._id === doc._id);
    if (idx >= 0) {
      users[idx] = doc;
    } else {
      users.push(doc);
    }
    return doc;
  };

  doc.deleteOne = async function () {
    users = users.filter((u) => u._id !== doc._id);
    return { acknowledged: true, deletedCount: 1 };
  };

  doc.populate = async function (field) {
    if (field === "cart.product") {
      const populatedCart = doc.cart.map((item) => {
        const prodId = item.product?._id ? String(item.product._id) : String(item.product);
        const found = products.find((p) => p._id === prodId);
        return {
          product: found ? { ...found } : null,
          quantity: item.quantity,
        };
      });
      return { ...doc, cart: populatedCart };
    }
    return doc;
  };

  return doc;
}

function createProductDocument(raw) {
  const doc = {
    _id: raw._id ? String(raw._id) : generateId(),
    name: raw.name || "",
    description: raw.description || "",
    price: Number(raw.price) || 0,
    compareAtPrice: raw.compareAtPrice ? Number(raw.compareAtPrice) : undefined,
    category: raw.category || "General",
    brand: raw.brand || "",
    image: raw.image || "",
    images: Array.isArray(raw.images) ? raw.images : [],
    stock: Number(raw.stock) || 0,
    sku: raw.sku || ("SKU-" + Math.floor(Math.random() * 10000)),
    isFeatured: Boolean(raw.isFeatured),
    isActive: raw.isActive !== undefined ? Boolean(raw.isActive) : true,
    rating: Number(raw.rating) || 0,
    numReviews: Number(raw.numReviews) || 0,
    reviews: Array.isArray(raw.reviews) ? [...raw.reviews] : [],
    createdAt: raw.createdAt ? new Date(raw.createdAt) : new Date(),
    updatedAt: raw.updatedAt ? new Date(raw.updatedAt) : new Date(),
  };

  doc.save = async function () {
    doc.updatedAt = new Date();
    const idx = products.findIndex((p) => p._id === doc._id);
    if (idx >= 0) {
      products[idx] = doc;
    } else {
      products.push(doc);
    }
    return doc;
  };

  return doc;
}

function createOrderDocument(raw) {
  const doc = {
    _id: raw._id ? String(raw._id) : generateId(),
    user: raw.user?._id ? String(raw.user._id) : String(raw.user),
    items: Array.isArray(raw.items) ? [...raw.items] : [],
    shippingAddress: raw.shippingAddress || {},
    paymentMethod: raw.paymentMethod || "cod",
    itemsPrice: Number(raw.itemsPrice) || 0,
    shippingPrice: Number(raw.shippingPrice) || 0,
    taxPrice: Number(raw.taxPrice) || 0,
    totalPrice: Number(raw.totalPrice) || 0,
    isPaid: Boolean(raw.isPaid),
    paidAt: raw.paidAt ? new Date(raw.paidAt) : undefined,
    status: raw.status || "pending",
    trackingNumber: raw.trackingNumber || "",
    carrier: raw.carrier || "",
    notes: raw.notes || "",
    confirmedAt: raw.confirmedAt ? new Date(raw.confirmedAt) : undefined,
    processingAt: raw.processingAt ? new Date(raw.processingAt) : undefined,
    shippedAt: raw.shippedAt ? new Date(raw.shippedAt) : undefined,
    deliveredAt: raw.deliveredAt ? new Date(raw.deliveredAt) : undefined,
    statusHistory: Array.isArray(raw.statusHistory) ? [...raw.statusHistory] : [],
    createdAt: raw.createdAt ? new Date(raw.createdAt) : new Date(),
    updatedAt: raw.updatedAt ? new Date(raw.updatedAt) : new Date(),
  };

  doc.save = async function () {
    doc.updatedAt = new Date();
    const idx = orders.findIndex((o) => o._id === doc._id);
    if (idx >= 0) {
      orders[idx] = doc;
    } else {
      orders.push(doc);
    }
    return doc;
  };

  return doc;
}

// Initialize seed data
export async function initMockStore() {
  if (users.length > 0) return;

  const adminHash = await bcrypt.hash("vishal123", 10);
  const userHash = await bcrypt.hash("user1234", 10);

  const adminUser = createUserDocument({
    _id: "66d8e0000000000000000001",
    name: "Vishal Kumar",
    email: "vishalcse340@gmail.com",
    password: adminHash,
    role: "admin",
  });

  const demoUser = createUserDocument({
    _id: "66d8e0000000000000000002",
    name: "Demo Shopper",
    email: "user@example.com",
    password: userHash,
    role: "user",
    address: {
      fullName: "Demo Shopper",
      line1: "123 Orchard Lane",
      city: "Springfield",
      state: "IL",
      postalCode: "62701",
      country: "USA",
      phone: "+1 555-0199",
    },
  });

  users = [adminUser, demoUser];
  products = INITIAL_PRODUCTS.map(createProductDocument);

  // Initial sample order
  orders = [
    createOrderDocument({
      _id: "66d8e0000000000000000301",
      user: demoUser._id,
      items: [
        {
          product: products[0]._id,
          name: products[0].name,
          image: products[0].image,
          price: products[0].price,
          quantity: 1,
        },
      ],
      shippingAddress: demoUser.address,
      paymentMethod: "cod",
      itemsPrice: 129.99,
      shippingPrice: 0,
      taxPrice: 10.4,
      totalPrice: 140.39,
      isPaid: true,
      paidAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
      status: "delivered",
      deliveredAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000),
      createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
    }),
  ];
}

// Chainable query helper
function createQueryChain(execFn) {
  let sortOption = null;
  let skipNum = 0;
  let limitNum = 0;
  let selectFields = null;
  let populateField = null;

  const chain = {
    sort(opt) {
      sortOption = opt;
      return chain;
    },
    skip(n) {
      skipNum = n;
      return chain;
    },
    limit(n) {
      limitNum = n;
      return chain;
    },
    select(fields) {
      selectFields = fields;
      return chain;
    },
    populate(field, subFields) {
      populateField = { field, subFields };
      return chain;
    },
    then(onFulfilled, onRejected) {
      return Promise.resolve()
        .then(() =>
          execFn({
            sort: sortOption,
            skip: skipNum,
            limit: limitNum,
            select: selectFields,
            populate: populateField,
          })
        )
        .then(onFulfilled, onRejected);
    },
    catch(onRejected) {
      return chain.then(null, onRejected);
    },
  };

  return chain;
}

// Mock User repository
export const MockUser = {
  async findOne(query) {
    await initMockStore();
    if (query.email) {
      const email = String(query.email).toLowerCase().trim();
      const user = users.find((u) => u.email === email);
      return user ? user : null;
    }
    return users[0] || null;
  },

  findById(id) {
    const userId = id?._id ? String(id._id) : String(id);
    return createQueryChain(async ({ select, populate }) => {
      await initMockStore();
      const user = users.find((u) => u._id === userId);
      if (!user) return null;
      if (populate?.field === "cart.product" || populate === "cart.product") {
        return await user.populate("cart.product");
      }
      return user;
    });
  },

  async create(data) {
    await initMockStore();
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(data.password, salt);
    const doc = createUserDocument({
      ...data,
      password: hashedPassword,
    });
    users.push(doc);
    return doc;
  },

  async countDocuments(query) {
    await initMockStore();
    if (!query) return users.length;
    let list = users;
    if (query.role) list = list.filter((u) => u.role === query.role);
    return list.length;
  },

  find(query) {
    return createQueryChain(async ({ sort, select }) => {
      await initMockStore();
      let list = [...users];
      if (sort?.createdAt === -1) {
        list.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
      }
      return list;
    });
  },
};

// Mock Product repository
export const MockProduct = {
  find(filter = {}) {
    return createQueryChain(async ({ sort, skip, limit, select }) => {
      await initMockStore();
      let list = [...products];

      if (filter.isActive !== undefined) {
        list = list.filter((p) => p.isActive === filter.isActive);
      }
      if (filter.category) {
        list = list.filter((p) => p.category.toLowerCase() === filter.category.toLowerCase());
      }
      if (filter.$text?.$search) {
        const term = filter.$text.$search.toLowerCase();
        list = list.filter(
          (p) =>
            p.name.toLowerCase().includes(term) ||
            p.description.toLowerCase().includes(term) ||
            p.category.toLowerCase().includes(term)
        );
      }
      if (filter.price?.$gte !== undefined) {
        list = list.filter((p) => p.price >= filter.price.$gte);
      }
      if (filter.price?.$lte !== undefined) {
        list = list.filter((p) => p.price <= filter.price.$lte);
      }
      if (filter.isFeatured !== undefined) {
        list = list.filter((p) => p.isFeatured === filter.isFeatured);
      }
      if (filter.stock?.$lte !== undefined) {
        list = list.filter((p) => p.stock <= filter.stock.$lte);
      }

      if (sort) {
        if (sort.price === 1) list.sort((a, b) => a.price - b.price);
        if (sort.price === -1) list.sort((a, b) => b.price - a.price);
        if (sort.rating === -1) list.sort((a, b) => (b.rating || 0) - (a.rating || 0));
        if (sort.createdAt === -1) list.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
      }

      if (skip) list = list.slice(skip);
      if (limit && limit > 0) list = list.slice(0, limit);

      return list;
    });
  },

  async countDocuments(filter = {}) {
    await initMockStore();
    let list = [...products];
    if (filter.isActive !== undefined) {
      list = list.filter((p) => p.isActive === filter.isActive);
    }
    if (filter.category) {
      list = list.filter((p) => p.category.toLowerCase() === filter.category.toLowerCase());
    }
    if (filter.$text?.$search) {
      const term = filter.$text.$search.toLowerCase();
      list = list.filter(
        (p) =>
          p.name.toLowerCase().includes(term) ||
          p.description.toLowerCase().includes(term) ||
          p.category.toLowerCase().includes(term)
      );
    }
    if (filter.price?.$gte !== undefined) {
      list = list.filter((p) => p.price >= filter.price.$gte);
    }
    if (filter.price?.$lte !== undefined) {
      list = list.filter((p) => p.price <= filter.price.$lte);
    }
    return list.length;
  },

  async findById(id) {
    await initMockStore();
    const prodId = id?._id ? String(id._id) : String(id);
    const found = products.find((p) => p._id === prodId);
    return found || null;
  },

  async distinct(field, filter = {}) {
    await initMockStore();
    let list = [...products];
    if (filter.isActive !== undefined) list = list.filter((p) => p.isActive === filter.isActive);
    const values = [...new Set(list.map((p) => p[field]).filter(Boolean))];
    return values;
  },

  async create(data) {
    await initMockStore();
    const doc = createProductDocument(data);
    products.push(doc);
    return doc;
  },

  async findByIdAndUpdate(id, data, options = {}) {
    await initMockStore();
    const prodId = id?._id ? String(id._id) : String(id);
    const prod = products.find((p) => p._id === prodId);
    if (!prod) return null;

    if (data.$inc?.stock !== undefined) {
      prod.stock += Number(data.$inc.stock);
    }
    Object.keys(data).forEach((key) => {
      if (key !== "$inc") {
        prod[key] = data[key];
      }
    });
    prod.updatedAt = new Date();
    return prod;
  },

  async findByIdAndDelete(id) {
    await initMockStore();
    const prodId = id?._id ? String(id._id) : String(id);
    const prod = products.find((p) => p._id === prodId);
    if (!prod) return null;
    products = products.filter((p) => p._id !== prodId);
    return prod;
  },
};

// Mock Order repository
export const MockOrder = {
  async create(data) {
    await initMockStore();
    const doc = createOrderDocument(data);
    orders.unshift(doc);
    return doc;
  },

  find(filter = {}) {
    return createQueryChain(async ({ sort, limit, populate }) => {
      await initMockStore();
      let list = [...orders];
      if (filter.user) {
        const userId = filter.user?._id ? String(filter.user._id) : String(filter.user);
        list = list.filter((o) => o.user === userId);
      }

      if (sort?.createdAt === -1) {
        list.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
      }

      if (limit && limit > 0) {
        list = list.slice(0, limit);
      }

      if (populate?.field === "user" || populate === "user") {
        return list.map((order) => {
          const u = users.find((usr) => usr._id === order.user);
          return {
            ...order,
            user: u ? { _id: u._id, name: u.name, email: u.email } : { _id: order.user, name: "User", email: "" },
          };
        });
      }

      return list;
    });
  },

  findById(id) {
    const orderId = id?._id ? String(id._id) : String(id);
    return createQueryChain(async ({ populate }) => {
      await initMockStore();
      const order = orders.find((o) => o._id === orderId);
      if (!order) return null;

      if (populate?.field === "user" || populate === "user") {
        const u = users.find((usr) => usr._id === order.user);
        return {
          ...order,
          user: u ? { _id: u._id, name: u.name, email: u.email } : { _id: order.user, name: "User", email: "" },
        };
      }
      return order;
    });
  },

  async countDocuments() {
    await initMockStore();
    return orders.length;
  },

  async aggregate(pipeline) {
    await initMockStore();
    if (!pipeline || !pipeline.length) return [];

    // Check total revenue pipeline
    if (pipeline[0]?.$group?.total?.$sum === "$totalPrice") {
      const sum = orders.reduce((acc, o) => acc + (Number(o.totalPrice) || 0), 0);
      return [{ _id: null, total: Number(sum.toFixed(2)) }];
    }

    // Check salesByDay pipeline
    if (pipeline.some((step) => step.$group?._id?.$dateToString)) {
      const dayMap = new Map();
      const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);

      orders
        .filter((o) => new Date(o.createdAt) >= sevenDaysAgo)
        .forEach((o) => {
          const dateStr = new Date(o.createdAt).toISOString().split("T")[0];
          const current = dayMap.get(dateStr) || { total: 0, count: 0 };
          current.total += Number(o.totalPrice) || 0;
          current.count += 1;
          dayMap.set(dateStr, current);
        });

      const result = Array.from(dayMap.entries()).map(([date, data]) => ({
        _id: date,
        total: Number(data.total.toFixed(2)),
        count: data.count,
      }));
      result.sort((a, b) => a._id.localeCompare(b._id));
      return result;
    }

    return [];
  },
};
