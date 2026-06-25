export interface Profile {
  id: string;
  name: string;
  phone: string;
  email: string;
  role: 'CUSTOMER' | 'STAFF' | 'ADMIN';
  referralCode: string;
  referredBy?: string;
  pointsBalance: number;
}

export interface Address {
  id: string;
  userId: string;
  label: string; // Home, Office, etc.
  line1: string;
  line2?: string;
  city: string;
  state: string;
  pincode: string;
  phone: string;
}

export interface Brand {
  id: string;
  name: string;
  slug: string;
  logo: string;
  isHouseBrand: boolean; // SafeSnack Originals = true
}

export interface Category {
  id: string;
  name: string;
  slug: string;
}

export interface Product {
  id: string;
  name: string;
  slug: string;
  description: string;
  brandId: string;
  categoryId: string;
  dietaryTags: ('sugar-free' | 'keto' | 'diabetic-friendly' | 'vegan' | 'high-protein' | 'low-carb' | 'kids')[];
  benefits: string[];
  story: string;
  featuredIngredients: string[];
  servingSuggestions: string[];
  images: {
    primary: string;
    hover: string;
    gallery: string[];
    lifestyle: string;
    nutrition: string;
    ingredients: string;
  };
  isActive: boolean;
  ratingCache: number;
  reviewCount: number;
  relatedProducts: string[]; // Product IDs
  frequentlyBoughtTogether: string[]; // Product IDs
}

export interface Variant {
  id: string;
  productId: string;
  label: string; // e.g. 50g, 100g, 200g, 1 Bottle, 1 Pack
  price: number;
  compareAtPrice?: number;
  sku: string;
}

export interface Bundle {
  id: string;
  name: string;
  slug: string;
  description: string;
  price: number;
  compareAtPrice: number;
  images: string[];
  dietaryTags: string[];
  items: {
    variantId: string;
    qty: number;
  }[];
  isActive: boolean;
}

export interface Coupon {
  id: string;
  code: string;
  type: 'PERCENT' | 'FLAT';
  value: number;
  minOrder: number;
  maxDiscount?: number;
  usageLimit: number;
  perUserLimit: number;
  startsAt: string;
  expiresAt: string;
  active: boolean;
}

export interface RewardPointLedger {
  id: string;
  userId: string;
  delta: number;
  reason: string;
  orderId?: string;
  timestamp: string;
}

export interface Referral {
  id: string;
  referrerId: string;
  code: string;
  refereeId: string;
  status: 'PENDING' | 'COMPLETED';
  rewardPointsGranted: number;
  timestamp: string;
}

export interface Batch {
  id: string;
  variantId: string;
  batchNumber: string;
  mfgDate: string;
  expiryDate: string;
  quantity: number;
}

export interface InventoryMovement {
  id: string;
  variantId: string;
  batchId?: string;
  type: 'IN' | 'OUT' | 'ADJUST' | 'SALE' | 'EXPIRED';
  qty: number;
  reference: string; // Order ID, Batch ID, or notes
  staffId?: string;
  timestamp: string;
}

export interface OrderItem {
  id: string;
  variantId?: string;
  bundleId?: string;
  qty: number;
  unitPrice: number;
  lineTotal: number;
  batchAllocations?: {
    batchId: string;
    qty: number;
  }[];
}

export interface Order {
  id: string;
  userId: string;
  status: 'PENDING_PAYMENT' | 'PAID' | 'PROCESSING' | 'SHIPPED' | 'OUT_FOR_DELIVERY' | 'DELIVERED' | 'CANCELLED' | 'REFUNDED';
  subtotal: number;
  discount: number;
  deliveryFee: number;
  total: number;
  couponId?: string;
  couponCode?: string;
  addressSnapshot: Address;
  razorpayOrderId: string;
  paymentId?: string;
  paymentStatus: 'PENDING' | 'SUCCESS' | 'FAILED';
  pointsEarned: number;
  pointsRedeemed: number;
  items: OrderItem[];
  timestamp: string;
  etaMinutes?: number;
}

export interface Review {
  id: string;
  productId: string;
  userId: string;
  userName: string;
  rating: number;
  title: string;
  body: string;
  verifiedPurchase: boolean;
  status: 'PENDING' | 'APPROVED' | 'REJECTED';
  timestamp: string;
}

export interface WishlistItem {
  userId: string;
  productId: string;
}

export interface DeliveryZone {
  id: string;
  pincode: string;
  area: string;
  deliveryFee: number;
  minOrder: number;
  etaMinutes: number;
}

export interface AnalyticsEvent {
  id: string;
  type: 'PRODUCT_VIEW' | 'ADD_TO_CART' | 'BEGIN_CHECKOUT' | 'PURCHASE' | 'SEARCH';
  userId?: string;
  sessionId: string;
  productId?: string;
  value?: number;
  metadata?: string; // Search query, pincode, coupon code, etc.
  timestamp: string;
}

// Future feature placeholders
export interface SubscriptionPlan {
  id: string;
  name: string;
  description: string;
  pricePerMonth: number;
  deliveryFrequency: 'WEEKLY' | 'FORTNIGHTLY' | 'MONTHLY';
  bundleId: string;
}

export interface SubscriptionOrder {
  id: string;
  userId: string;
  planId: string;
  status: 'ACTIVE' | 'PAUSED' | 'CANCELLED';
  nextDeliveryDate: string;
  billingCardToken: string;
}

export interface HomepageCms {
  heroTitle: string;
  heroSubtitle: string;
  heroCtaText: string;
  heroCtaLink: string;
  heroImage: string;
  featuredProductIds: string[];
  featuredBundleIds: string[];
  bannerText?: string;
}

// ----------------------------------------------------
// SEED DATA DECLARATIONS
// ----------------------------------------------------

const SEED_BRANDS: Brand[] = [
  {
    id: "brand-1",
    name: "SafeSnack Originals",
    slug: "safesnack-originals",
    logo: "🌿 SafeSnack",
    isHouseBrand: true
  },
  {
    id: "brand-2",
    name: "Nourish Foods",
    slug: "nourish-foods",
    logo: "🌾 Nourish",
    isHouseBrand: false
  },
  {
    id: "brand-3",
    name: "Diabeats Zero",
    slug: "diabeats-zero",
    logo: "🍎 Diabeats",
    isHouseBrand: false
  },
  {
    id: "brand-4",
    name: "KetoKrust",
    slug: "ketokrust",
    logo: "🥑 KetoKrust",
    isHouseBrand: false
  }
];

const SEED_CATEGORIES: Category[] = [
  { id: "cat-1", name: "Vegetable Chips", slug: "vegetable-chips" },
  { id: "cat-2", name: "Premium Chocolates", slug: "premium-chocolates" },
  { id: "cat-3", name: "High-Protein Shakes & Oats", slug: "protein-shakes-oats" },
  { id: "cat-4", name: "Healthy Pasta & Noodles", slug: "pasta-noodles" },
  { id: "cat-5", name: "Guilt-Free Desserts", slug: "guilt-free-desserts" }
];

const SEED_PRODUCTS: Product[] = [
  {
    id: "prod-1",
    name: "Baked Beetroot Chips",
    slug: "baked-beetroot-chips",
    description: "Crispy, vacuum-baked beetroot slices dusted with Himalayan rock salt and organic mint. High in dietary fiber and naturally sweet with zero added sugar.",
    brandId: "brand-1",
    categoryId: "cat-1",
    dietaryTags: ["sugar-free", "diabetic-friendly", "vegan", "low-carb", "kids"],
    benefits: [
      "Rich in organic nitrates to support healthy blood pressure",
      "Excellent source of soluble fiber for digestive wellness",
      "Low glycemic index (GI) snacks that prevent blood sugar spikes"
    ],
    story: "Our Beetroot Chips are sourced directly from organic farmers in the Deccan plateau. We vacuum-bake them at low temperatures (under 80°C) to lock in the intense natural ruby color, essential nutrients, and natural sweetness without adding a single gram of sugar or artificial oil.",
    featuredIngredients: ["Organic Beetroot (98%)", "Hayan Pink Salt", "Organic Mint Extract", "Cold-Pressed Rice Bran Oil (less than 2% for crisping)"],
    servingSuggestions: ["Pair with sugar-free Greek yogurt dip", "Crumble over fresh garden salads for a healthy crunch", "Enjoy straight from the pouch during afternoon meetings"],
    images: {
      primary: "https://images.unsplash.com/photo-1628268909376-e8c44bb3153f?q=80&w=600&fit=crop",
      hover: "https://images.unsplash.com/photo-1512621776951-a57141f2eefd?q=80&w=600&fit=crop",
      gallery: [
        "https://images.unsplash.com/photo-1628268909376-e8c44bb3153f?q=80&w=600&fit=crop",
        "https://images.unsplash.com/photo-1512621776951-a57141f2eefd?q=80&w=600&fit=crop"
      ],
      lifestyle: "https://images.unsplash.com/photo-1540420773420-3366772f4999?q=80&w=600&fit=crop",
      nutrition: "https://images.unsplash.com/photo-1505576399279-565b52d4ac71?q=80&w=600&fit=crop",
      ingredients: "https://images.unsplash.com/photo-1506084868230-bb9d95c24759?q=80&w=600&fit=crop"
    },
    isActive: true,
    ratingCache: 4.8,
    reviewCount: 34,
    relatedProducts: ["prod-2", "prod-3", "prod-5"],
    frequentlyBoughtTogether: ["prod-6", "prod-10"]
  },
  {
    id: "prod-2",
    name: "Crunchy Broccoli Chips",
    slug: "crunchy-broccoli-chips",
    description: "Dehydrated organic broccoli florets seasoned with mild garlic and dietary yeast for a cheesy flavor. Packed with vitamins and high in protein.",
    brandId: "brand-1",
    categoryId: "cat-1",
    dietaryTags: ["keto", "diabetic-friendly", "vegan", "high-protein", "low-carb"],
    benefits: [
      "Extremely low net carb (under 2g per serving)",
      "High in Vitamin C, K, and folate",
      "Natural glucosinolates for cellular defense"
    ],
    story: "Made for kids and adults who struggle to eat their greens. We freeze-dry fresh broccoli florets to keep their structural shape and toss them in nutritional yeast to mimic real cheese, offering a zero-guilt crunch.",
    featuredIngredients: ["Fresh Broccoli Florets (95%)", "Nutritional Yeast", "Garlic Powder", "Sea Salt"],
    servingSuggestions: ["Garnish over hot tomato soup", "Healthy finger food for kids' lunchboxes", "Snack during movie night instead of buttered popcorn"],
    images: {
      primary: "https://images.unsplash.com/photo-1584269600464-37b1b58a9fe7?q=80&w=600&fit=crop",
      hover: "https://images.unsplash.com/photo-1628268909376-e8c44bb3153f?q=80&w=600&fit=crop",
      gallery: ["https://images.unsplash.com/photo-1584269600464-37b1b58a9fe7?q=80&w=600&fit=crop"],
      lifestyle: "https://images.unsplash.com/photo-1540420773420-3366772f4999?q=80&w=600&fit=crop",
      nutrition: "https://images.unsplash.com/photo-1505576399279-565b52d4ac71?q=80&w=600&fit=crop",
      ingredients: "https://images.unsplash.com/photo-1506084868230-bb9d95c24759?q=80&w=600&fit=crop"
    },
    isActive: true,
    ratingCache: 4.6,
    reviewCount: 22,
    relatedProducts: ["prod-1", "prod-3"],
    frequentlyBoughtTogether: ["prod-1", "prod-9"]
  },
  {
    id: "prod-3",
    name: "Spiced Soya Chips",
    slug: "spiced-soya-chips",
    description: "Crispy high-fiber puffed soya chips seasoned with traditional Indian spices like cumin, coriander, and dry mango powder. Low in saturated fat.",
    brandId: "brand-2",
    categoryId: "cat-1",
    dietaryTags: ["sugar-free", "diabetic-friendly", "high-protein"],
    benefits: [
      "9g of plant protein per serving",
      "Zero cholesterol and trans-fats",
      "High fiber to support metabolic health"
    ],
    story: "Co-created with Nourish Foods, this snack utilizes non-GMO soy protein isolate puffed under high pressure to achieve a light, airy crunch. Seasoned with native spice blends from Hyderabad.",
    featuredIngredients: ["Non-GMO Soy Flour", "Rice Flour", "Chili Powder", "Amchur", "Rock Salt"],
    servingSuggestions: ["Serve with afternoon tea or chai", "Mix with raw onions, coriander, and lemon juice for a quick soya chaat"],
    images: {
      primary: "https://images.unsplash.com/photo-1566478989037-eec170784d0b?q=80&w=600&fit=crop",
      hover: "https://images.unsplash.com/photo-1541795795328-f073b763494e?q=80&w=600&fit=crop",
      gallery: ["https://images.unsplash.com/photo-1566478989037-eec170784d0b?q=80&w=600&fit=crop"],
      lifestyle: "https://images.unsplash.com/photo-1540420773420-3366772f4999?q=80&w=600&fit=crop",
      nutrition: "https://images.unsplash.com/photo-1505576399279-565b52d4ac71?q=80&w=600&fit=crop",
      ingredients: "https://images.unsplash.com/photo-1506084868230-bb9d95c24759?q=80&w=600&fit=crop"
    },
    isActive: true,
    ratingCache: 4.4,
    reviewCount: 15,
    relatedProducts: ["prod-1", "prod-4"],
    frequentlyBoughtTogether: ["prod-4", "prod-11"]
  },
  {
    id: "prod-4",
    name: "Roasted Ragi Crisps",
    slug: "roasted-ragi-crisps",
    description: "Ancient finger millet (ragi) dough rolled thin, slow-roasted, and tossed in cold-pressed coconut oil and mild black pepper.",
    brandId: "brand-1",
    categoryId: "cat-1",
    dietaryTags: ["sugar-free", "diabetic-friendly", "vegan", "kids"],
    benefits: [
      "Natural calcium powerhouse for bone health",
      "Slow-releasing carbohydrates for long-lasting energy",
      "Iron-rich formulation to combat fatigue"
    ],
    story: "SafeSnack Originals rediscovers ragi—the ancient super-grain. High in polyphenols and dietary fibers, this ragi crisp digests slowly, meaning it won't cause spikes in blood glucose levels. Perfect for diabetic snacking.",
    featuredIngredients: ["Ragi (Finger Millet) Flour (70%)", "Whole Wheat Flour", "Cold-pressed Coconut Oil", "Black Pepper", "Himalayan Salt"],
    servingSuggestions: ["Eat as a mid-morning workplace snack", "Dip in sesame tahini or peanut butter for extra protein"],
    images: {
      primary: "https://images.unsplash.com/photo-1541795795328-f073b763494e?q=80&w=600&fit=crop",
      hover: "https://images.unsplash.com/photo-1566478989037-eec170784d0b?q=80&w=600&fit=crop",
      gallery: ["https://images.unsplash.com/photo-1541795795328-f073b763494e?q=80&w=600&fit=crop"],
      lifestyle: "https://images.unsplash.com/photo-1540420773420-3366772f4999?q=80&w=600&fit=crop",
      nutrition: "https://images.unsplash.com/photo-1505576399279-565b52d4ac71?q=80&w=600&fit=crop",
      ingredients: "https://images.unsplash.com/photo-1506084868230-bb9d95c24759?q=80&w=600&fit=crop"
    },
    isActive: true,
    ratingCache: 4.7,
    reviewCount: 41,
    relatedProducts: ["prod-1", "prod-3", "prod-5"],
    frequentlyBoughtTogether: ["prod-1", "prod-6"]
  },
  {
    id: "prod-5",
    name: "Tangy Pudina Makhana",
    slug: "tangy-pudina-makhana",
    description: "Premium popped lotus seeds (makhana) roasted dry and seasoned with fresh pudina (mint) leaf powder and sour dry mango.",
    brandId: "brand-1",
    categoryId: "cat-1",
    dietaryTags: ["sugar-free", "diabetic-friendly", "keto", "low-carb", "kids"],
    benefits: [
      "Rich in kaempferol, a natural anti-inflammatory agent",
      "Very low sodium, ideal for heart-health conscious snacks",
      "Gluten-free protein alternative"
    ],
    story: "Makhana is nature's puffed snack. We grade our lotus seeds to ensure maximum diameter, pop them, and roast them without frying. A heavy dusting of dry mint makes this Hyderabad's favorite hot-weather snack.",
    featuredIngredients: ["Popped Lotus Seeds (Makhana)", "Dehydrated Mint Leaves", "Black Salt", "Jeera Powder", "Cold-Pressed Olive Oil (spray-coated)"],
    servingSuggestions: ["Carry in a jar for travel snacking", "Combine with roasted peanuts for a custom diet mix"],
    images: {
      primary: "https://images.unsplash.com/photo-1512621776951-a57141f2eefd?q=80&w=600&fit=crop",
      hover: "https://images.unsplash.com/photo-1628268909376-e8c44bb3153f?q=80&w=600&fit=crop",
      gallery: ["https://images.unsplash.com/photo-1512621776951-a57141f2eefd?q=80&w=600&fit=crop"],
      lifestyle: "https://images.unsplash.com/photo-1540420773420-3366772f4999?q=80&w=600&fit=crop",
      nutrition: "https://images.unsplash.com/photo-1505576399279-565b52d4ac71?q=80&w=600&fit=crop",
      ingredients: "https://images.unsplash.com/photo-1506084868230-bb9d95c24759?q=80&w=600&fit=crop"
    },
    isActive: true,
    ratingCache: 4.9,
    reviewCount: 52,
    relatedProducts: ["prod-1", "prod-4"],
    frequentlyBoughtTogether: ["prod-1", "prod-10"]
  },
  {
    id: "prod-6",
    name: "85% Dark Stevia Chocolate",
    slug: "85-dark-stevia-chocolate",
    description: "Artisanal, stone-ground dark chocolate bars sweetened exclusively with premium organic stevia extract. Rich in cocoa flavanols.",
    brandId: "brand-1",
    categoryId: "cat-2",
    dietaryTags: ["sugar-free", "diabetic-friendly", "keto", "vegan", "low-carb"],
    benefits: [
      "Zero added sugar and zero maltitol",
      "High in brain-boosting flavanols and antioxidants",
      "Net carbs under 1.5g per 30g serving"
    ],
    story: "Most 'sugar-free' chocolates contain maltitol, which causes insulin spikes. SafeSnack Dark Chocolate is sweetened only with organic Stevia and erythritol, stone-ground for 48 hours for a velvet mouthfeel that is completely safe for diabetics.",
    featuredIngredients: ["Cocoa Mass (85%)", "Cocoa Butter", "Erythritol", "Organic Stevia Leaf Extract", "Sunflower Lecithin"],
    servingSuggestions: ["Melt a square over morning keto oats", "Savor one piece slowly after dinner to curb sugar cravings"],
    images: {
      primary: "https://images.unsplash.com/photo-1511381939415-e44015466834?q=80&w=600&fit=crop",
      hover: "https://images.unsplash.com/photo-1606313564200-e75d5e30476c?q=80&w=600&fit=crop",
      gallery: ["https://images.unsplash.com/photo-1511381939415-e44015466834?q=80&w=600&fit=crop"],
      lifestyle: "https://images.unsplash.com/photo-1540420773420-3366772f4999?q=80&w=600&fit=crop",
      nutrition: "https://images.unsplash.com/photo-1505576399279-565b52d4ac71?q=80&w=600&fit=crop",
      ingredients: "https://images.unsplash.com/photo-1506084868230-bb9d95c24759?q=80&w=600&fit=crop"
    },
    isActive: true,
    ratingCache: 4.8,
    reviewCount: 61,
    relatedProducts: ["prod-7", "prod-8"],
    frequentlyBoughtTogether: ["prod-1", "prod-7"]
  },
  {
    id: "prod-7",
    name: "Almond Flour Fudge Brownie",
    slug: "almond-flour-fudge-brownie",
    description: "Decadent, moist brownies made with grain-free almond flour, organic cocoa powder, and dark chocolate chips. Low glycemic index.",
    brandId: "brand-4",
    categoryId: "cat-5",
    dietaryTags: ["sugar-free", "diabetic-friendly", "keto", "low-carb"],
    benefits: [
      "100% grain-free and gluten-free",
      "Sweetened with natural Monkfruit extract",
      "Only 2.2g net carbs per brownie"
    ],
    story: "Partnered with KetoKrust, these brownies replace white wheat flour with finely ground California almonds. The result is a fudgy brownie rich in healthy monounsaturated fats that satisfies chocolate cravings without affecting insulin.",
    featuredIngredients: ["Blanched Almond Flour", "Unsweetened Cocoa Powder", "Monkfruit Sweetener", "Grass-Fed Butter", "Pasteurized Eggs", "Vanilla Extract"],
    servingSuggestions: ["Warm for 10 seconds in the microwave", "Serve with a scoop of our Sugar-Free Vanilla Ice Cream"],
    images: {
      primary: "https://images.unsplash.com/photo-1606313564200-e75d5e30476c?q=80&w=600&fit=crop",
      hover: "https://images.unsplash.com/photo-1511381939415-e44015466834?q=80&w=600&fit=crop",
      gallery: ["https://images.unsplash.com/photo-1606313564200-e75d5e30476c?q=80&w=600&fit=crop"],
      lifestyle: "https://images.unsplash.com/photo-1540420773420-3366772f4999?q=80&w=600&fit=crop",
      nutrition: "https://images.unsplash.com/photo-1505576399279-565b52d4ac71?q=80&w=600&fit=crop",
      ingredients: "https://images.unsplash.com/photo-1506084868230-bb9d95c24759?q=80&w=600&fit=crop"
    },
    isActive: true,
    ratingCache: 4.9,
    reviewCount: 47,
    relatedProducts: ["prod-6", "prod-8"],
    frequentlyBoughtTogether: ["prod-6", "prod-8"]
  },
  {
    id: "prod-8",
    name: "Avocado Vanilla Sugar-Free Ice Cream",
    slug: "avocado-vanilla-ice-cream",
    description: "Creamy, keto-friendly ice cream made with ripe Hass avocados, fresh dairy cream, and Madagascan vanilla pods. Sweetened with erythritol.",
    brandId: "brand-4",
    categoryId: "cat-5",
    dietaryTags: ["sugar-free", "diabetic-friendly", "keto", "low-carb"],
    benefits: [
      "Rich in heart-healthy monounsaturated fats from real avocados",
      "Zero added sugars, no artificial colors",
      "Smooth, luxurious texture without gums or stabilizers"
    ],
    story: "Created by KetoKrust, this dessert utilizes the natural buttery fat structure of avocados to create an ultra-smooth ice cream consistency without needing heavy corn syrup or starch thickeners. Flavored with real vanilla pods.",
    featuredIngredients: ["Ripe Hass Avocados (30%)", "Fresh Dairy Cream", "Erythritol", "Madagascan Vanilla Bean Extract", "Sea Salt"],
    servingSuggestions: ["Serve alongside Warm Almond Flour Fudge Brownies", "Blend with almond milk to create an instant keto milkshake"],
    images: {
      primary: "https://images.unsplash.com/photo-1501443762994-82bd5dace89a?q=80&w=600&fit=crop",
      hover: "https://images.unsplash.com/photo-1488477181946-6428a0291777?q=80&w=600&fit=crop",
      gallery: ["https://images.unsplash.com/photo-1501443762994-82bd5dace89a?q=80&w=600&fit=crop"],
      lifestyle: "https://images.unsplash.com/photo-1540420773420-3366772f4999?q=80&w=600&fit=crop",
      nutrition: "https://images.unsplash.com/photo-1505576399279-565b52d4ac71?q=80&w=600&fit=crop",
      ingredients: "https://images.unsplash.com/photo-1506084868230-bb9d95c24759?q=80&w=600&fit=crop"
    },
    isActive: true,
    ratingCache: 4.5,
    reviewCount: 19,
    relatedProducts: ["prod-7", "prod-13"],
    frequentlyBoughtTogether: ["prod-7", "prod-13"]
  },
  {
    id: "prod-9",
    name: "Whey Protein Rolled Oats",
    slug: "whey-protein-rolled-oats",
    description: "Premium rolled oats blended with grass-fed whey protein isolate, organic chia seeds, and raw almond slivers. Perfect high-protein breakfast.",
    brandId: "brand-1",
    categoryId: "cat-3",
    dietaryTags: ["sugar-free", "high-protein", "kids"],
    benefits: [
      "22g of clean protein per serving",
      "High beta-glucan fiber for sustained satiety",
      "Omega-3 fatty acids from raw chia seeds"
    ],
    story: "SafeSnack Originals breakfast series. We combine high-grade rolled oats with grass-fed micro-filtered whey protein isolate to give you a breakfast that keeps you full until lunch, stabilizing morning blood glucose levels.",
    featuredIngredients: ["Rolled Oats (65%)", "Whey Protein Isolate (20%)", "Organic Chia Seeds", "Almond Slivers", "Organic Stevia Leaf"],
    servingSuggestions: ["Soak overnight in almond milk or water", "Microwave for 90 seconds and top with fresh berries"],
    images: {
      primary: "https://images.unsplash.com/photo-1586444248902-2f64eddc13df?q=80&w=600&fit=crop",
      hover: "https://images.unsplash.com/photo-1553530666-ba11a7da3888?q=80&w=600&fit=crop",
      gallery: ["https://images.unsplash.com/photo-1586444248902-2f64eddc13df?q=80&w=600&fit=crop"],
      lifestyle: "https://images.unsplash.com/photo-1540420773420-3366772f4999?q=80&w=600&fit=crop",
      nutrition: "https://images.unsplash.com/photo-1505576399279-565b52d4ac71?q=80&w=600&fit=crop",
      ingredients: "https://images.unsplash.com/photo-1506084868230-bb9d95c24759?q=80&w=600&fit=crop"
    },
    isActive: true,
    ratingCache: 4.8,
    reviewCount: 38,
    relatedProducts: ["prod-10", "prod-1"],
    frequentlyBoughtTogether: ["prod-10", "prod-1"]
  },
  {
    id: "prod-10",
    name: "Sugar-Free Mango Protein Shake",
    slug: "mango-protein-shake",
    description: "Ready-to-drink meal replacement protein shake flavored with real Alphonso mango pulp and sweetened with stevia. Zero preservatives.",
    brandId: "brand-1",
    categoryId: "cat-3",
    dietaryTags: ["sugar-free", "diabetic-friendly", "high-protein", "low-carb", "kids"],
    benefits: [
      "25g of triple-source protein (whey + casein + pea)",
      "Zero added sugar, contains naturally occurring sugars from mango",
      "Essential vitamins and minerals for daily wellness"
    ],
    story: "SafeSnack Originals shakes capture the essence of Indian summer. We use high-pressure processing (HPP) to preserve the Alphonso mango pulp flavor without pasteurizing away the nutrients, sweetened solely with stevia.",
    featuredIngredients: ["Alphonso Mango Pulp (10%)", "Milk Protein Concentrate", "Whey Protein Isolate", "Calcium Caseinate", "Stevia", "Vitamin Mix"],
    servingSuggestions: ["Drink chilled post-workout", "Blend with ice for a frosty summer smoothie"],
    images: {
      primary: "https://images.unsplash.com/photo-1553530666-ba11a7da3888?q=80&w=600&fit=crop",
      hover: "https://images.unsplash.com/photo-1586444248902-2f64eddc13df?q=80&w=600&fit=crop",
      gallery: ["https://images.unsplash.com/photo-1553530666-ba11a7da3888?q=80&w=600&fit=crop"],
      lifestyle: "https://images.unsplash.com/photo-1540420773420-3366772f4999?q=80&w=600&fit=crop",
      nutrition: "https://images.unsplash.com/photo-1505576399279-565b52d4ac71?q=80&w=600&fit=crop",
      ingredients: "https://images.unsplash.com/photo-1506084868230-bb9d95c24759?q=80&w=600&fit=crop"
    },
    isActive: true,
    ratingCache: 4.7,
    reviewCount: 29,
    relatedProducts: ["prod-9", "prod-5"],
    frequentlyBoughtTogether: ["prod-9", "prod-5"]
  },
  {
    id: "prod-11",
    name: "High-Protein Millet Noodles",
    slug: "high-protein-millet-noodles",
    description: "Air-dried noodles crafted from a blend of foxtail millet, finger millet, and high-protein wheat gluten. Zero refined flour (Maida) and zero oil fried.",
    brandId: "brand-3",
    categoryId: "cat-4",
    dietaryTags: ["sugar-free", "diabetic-friendly", "high-protein", "kids"],
    benefits: [
      "15g of vegetable protein per pack",
      "Air-dried, not fried, reducing calories by 40%",
      "Rich in dietary fiber and essential minerals"
    ],
    story: "Partnered with Diabeats Zero, these noodles are designed for instant food lovers who require stable glycemic curves. Formulated with local millets, they cook in 5 minutes and digest slowly.",
    featuredIngredients: ["Foxtail Millet Flour (40%)", "Ragi Flour (20%)", "High-Protein Wheat Gluten", "Water", "Included Spice Tastemaker (Zero MSG)"],
    servingSuggestions: ["Stir fry with fresh cabbage, capsicum, and carrots", "Cook as soupy noodles with coriander leaves"],
    images: {
      primary: "https://images.unsplash.com/photo-1585032226651-759b368d7246?q=80&w=600&fit=crop",
      hover: "https://images.unsplash.com/photo-1563379091339-03b21ab4a4f8?q=80&w=600&fit=crop",
      gallery: ["https://images.unsplash.com/photo-1585032226651-759b368d7246?q=80&w=600&fit=crop"],
      lifestyle: "https://images.unsplash.com/photo-1540420773420-3366772f4999?q=80&w=600&fit=crop",
      nutrition: "https://images.unsplash.com/photo-1505576399279-565b52d4ac71?q=80&w=600&fit=crop",
      ingredients: "https://images.unsplash.com/photo-1506084868230-bb9d95c24759?q=80&w=600&fit=crop"
    },
    isActive: true,
    ratingCache: 4.3,
    reviewCount: 14,
    relatedProducts: ["prod-12", "prod-3"],
    frequentlyBoughtTogether: ["prod-12", "prod-3"]
  },
  {
    id: "prod-12",
    name: "Keto Almond Flour Pasta",
    slug: "keto-almond-pasta",
    description: "Macaroni-style pasta made from blanched almond flour and egg whites. Low-carb and high in healthy fats.",
    brandId: "brand-4",
    categoryId: "cat-4",
    dietaryTags: ["sugar-free", "diabetic-friendly", "keto", "low-carb"],
    benefits: [
      "Under 5g net carbs per standard 100g serving",
      "Gluten-free, grain-free alternative to traditional pasta",
      "High in healthy fats and proteins"
    ],
    story: "Partnered with KetoKrust, this pasta is stone-extruded and slow dried. It has a beautiful al-dente texture that absorbs healthy sauces like olive-oil pesto perfectly, without spiking insulin.",
    featuredIngredients: ["Blanched Almond Flour (80%)", "Pasteurized Egg Whites", "Xanthan Gum", "Sea Salt"],
    servingSuggestions: ["Toss with cold-pressed olive oil, garlic, and cherry tomatoes", "Bake with spinach and vegan mozzarella cheese"],
    images: {
      primary: "https://images.unsplash.com/photo-1563379091339-03b21ab4a4f8?q=80&w=600&fit=crop",
      hover: "https://images.unsplash.com/photo-1585032226651-759b368d7246?q=80&w=600&fit=crop",
      gallery: ["https://images.unsplash.com/photo-1563379091339-03b21ab4a4f8?q=80&w=600&fit=crop"],
      lifestyle: "https://images.unsplash.com/photo-1540420773420-3366772f4999?q=80&w=600&fit=crop",
      nutrition: "https://images.unsplash.com/photo-1505576399279-565b52d4ac71?q=80&w=600&fit=crop",
      ingredients: "https://images.unsplash.com/photo-1506084868230-bb9d95c24759?q=80&w=600&fit=crop"
    },
    isActive: true,
    ratingCache: 4.6,
    reviewCount: 20,
    relatedProducts: ["prod-11", "prod-2"],
    frequentlyBoughtTogether: ["prod-11", "prod-2"]
  },
  {
    id: "prod-13",
    name: "Sugar-Free Strawberry Pops",
    slug: "strawberry-pops",
    description: "Sugar-free fruit juice ice pops made from real Mahabaleshwar strawberries and erythritol. Refreshing, kid-friendly snack.",
    brandId: "brand-1",
    categoryId: "cat-5",
    dietaryTags: ["sugar-free", "diabetic-friendly", "vegan", "kids"],
    benefits: [
      "Made with 100% real fruit juice, no artificial concentrates",
      "Only 15 calories per popsicle",
      "Completely tooth-friendly sugar-free sweetener"
    ],
    story: "SafeSnack Originals summer Pops are cold-pressed strawberry purees sweetened with zero-calorie erythritol. It provides a sweet, icy treat that kids love, without the hyperactive sugar crash.",
    featuredIngredients: ["Fresh Strawberry Puree (60%)", "Filter Water", "Erythritol", "Lemon Juice", "Organic Stevia Extract"],
    servingSuggestions: ["Eat straight out of the freezer for hot summer days", "Crush into a glass of sparkling water for a sugar-free mocktail mock slushy"],
    images: {
      primary: "https://images.unsplash.com/photo-1488477181946-6428a0291777?q=80&w=600&fit=crop",
      hover: "https://images.unsplash.com/photo-1501443762994-82bd5dace89a?q=80&w=600&fit=crop",
      gallery: ["https://images.unsplash.com/photo-1488477181946-6428a0291777?q=80&w=600&fit=crop"],
      lifestyle: "https://images.unsplash.com/photo-1540420773420-3366772f4999?q=80&w=600&fit=crop",
      nutrition: "https://images.unsplash.com/photo-1505576399279-565b52d4ac71?q=80&w=600&fit=crop",
      ingredients: "https://images.unsplash.com/photo-1506084868230-bb9d95c24759?q=80&w=600&fit=crop"
    },
    isActive: true,
    ratingCache: 4.8,
    reviewCount: 31,
    relatedProducts: ["prod-8", "prod-1"],
    frequentlyBoughtTogether: ["prod-8", "prod-1"]
  }
];

const SEED_VARIANTS: Variant[] = [
  // Beetroot
  { id: "var-1a", productId: "prod-1", label: "50g Pouch", price: 120, compareAtPrice: 150, sku: "SS-BEET-50G" },
  { id: "var-1b", productId: "prod-1", label: "150g Family Pack", price: 290, compareAtPrice: 350, sku: "SS-BEET-150G" },
  // Broccoli
  { id: "var-2a", productId: "prod-2", label: "40g Pouch", price: 180, compareAtPrice: 220, sku: "SS-BROC-40G" },
  { id: "var-2b", productId: "prod-2", label: "100g Tub", price: 390, compareAtPrice: 450, sku: "SS-BROC-100G" },
  // Soya
  { id: "var-3a", productId: "prod-3", label: "80g Packet", price: 95, compareAtPrice: 110, sku: "NF-SOYA-80G" },
  // Ragi
  { id: "var-4a", productId: "prod-4", label: "60g Pouch", price: 110, compareAtPrice: 130, sku: "SS-RAGI-60G" },
  { id: "var-4b", productId: "prod-4", label: "180g Big Pack", price: 280, compareAtPrice: 320, sku: "SS-RAGI-180G" },
  // Makhana
  { id: "var-5a", productId: "prod-5", label: "50g Pouch", price: 140, compareAtPrice: 165, sku: "SS-MAKH-50G" },
  { id: "var-5b", productId: "prod-5", label: "120g Family Size", price: 299, compareAtPrice: 360, sku: "SS-MAKH-120G" },
  // Chocolates
  { id: "var-6a", productId: "prod-6", label: "1 Bar (70g)", price: 240, compareAtPrice: 280, sku: "SS-CHOCO-70G" },
  { id: "var-6b", productId: "prod-6", label: "Pack of 3 Bars", price: 650, compareAtPrice: 840, sku: "SS-CHOCO-3BAR" },
  // Brownie
  { id: "var-7a", productId: "prod-7", label: "Single Piece (60g)", price: 150, compareAtPrice: 180, sku: "KK-BROWN-60G" },
  { id: "var-7b", productId: "prod-7", label: "Box of 4 Pieces", price: 520, compareAtPrice: 720, sku: "KK-BROWN-BOX" },
  // Ice Cream
  { id: "var-8a", productId: "prod-8", label: "500ml Tub", price: 450, compareAtPrice: 550, sku: "KK-ICE-500ML" },
  // Oats
  { id: "var-9a", productId: "prod-9", label: "400g Pouch", price: 350, compareAtPrice: 420, sku: "SS-OATS-400G" },
  // Shake
  { id: "var-10a", productId: "prod-10", label: "1 Bottle (250ml)", price: 160, compareAtPrice: 199, sku: "SS-SHAKE-250ML" },
  { id: "var-10b", productId: "prod-10", label: "Pack of 6 Shakes", price: 850, compareAtPrice: 1194, sku: "SS-SHAKE-6PACK" },
  // Noodles
  { id: "var-11a", productId: "prod-11", label: "Single Pack (150g)", price: 125, compareAtPrice: 140, sku: "DZ-NOODLE-150G" },
  // Pasta
  { id: "var-12a", productId: "prod-12", label: "200g Pouch", price: 299, compareAtPrice: 350, sku: "KK-PASTA-200G" },
  // Pops
  { id: "var-13a", productId: "prod-13", label: "Pack of 4 Pops", price: 199, compareAtPrice: 249, sku: "SS-POPS-4PACK" }
];

const SEED_BUNDLES: Bundle[] = [
  {
    id: "bundle-1",
    name: "Diabetic Care Starter Box",
    slug: "diabetic-care-starter-box",
    description: "Curated snacks selected specifically for low insulin responses and satisfying cravings. Includes Beetroot chips, Roasted Ragi crisps, Stevia Chocolates, and high-protein Noodles.",
    price: 699,
    compareAtPrice: 895,
    images: ["https://images.unsplash.com/photo-1512621776951-a57141f2eefd?q=80&w=600&fit=crop"],
    dietaryTags: ["sugar-free", "diabetic-friendly", "low-carb"],
    items: [
      { variantId: "var-1a", qty: 2 }, // Beetroot 50g (120 x 2 = 240)
      { variantId: "var-4a", qty: 1 }, // Ragi 60g (110)
      { variantId: "var-6a", qty: 1 }, // Stevia Chocolate 70g (240)
      { variantId: "var-11a", qty: 2 } // Noodles 150g (125 x 2 = 250)
      // Total value: 840, bundle saves at 699
    ],
    isActive: true
  },
  {
    id: "bundle-2",
    name: "Keto Weight Management Pack",
    slug: "keto-weight-management-pack",
    description: "Maximize fat-burning and crush cravings with zero glycemic load. Highlights premium Broccoli chips, dark chocolates, blanched Almond pasta, and fudge Brownies.",
    price: 1199,
    compareAtPrice: 1539,
    images: ["https://images.unsplash.com/photo-1540420773420-3366772f4999?q=80&w=600&fit=crop"],
    dietaryTags: ["keto", "sugar-free", "low-carb"],
    items: [
      { variantId: "var-2a", qty: 2 }, // Broccoli 40g (180 x 2 = 360)
      { variantId: "var-6a", qty: 2 }, // Stevia Chocolate 70g (240 x 2 = 480)
      { variantId: "var-7b", qty: 1 }, // Brownie Box of 4 (520)
      { variantId: "var-12a", qty: 1 } // Pasta 200g (299)
      // Total value: 1659, bundle saves at 1199
    ],
    isActive: true
  },
  {
    id: "bundle-3",
    name: "Kids Healthy Lunch Box Pack",
    slug: "kids-healthy-lunch-pack",
    description: "Nutritious snack alternatives that kids actually love! Features sweet Ragi crisps, high-calcium Makhana, fruit juice Strawberry Pops, and Beetroot chips.",
    price: 549,
    compareAtPrice: 698,
    images: ["https://images.unsplash.com/photo-1505576399279-565b52d4ac71?q=80&w=600&fit=crop"],
    dietaryTags: ["kids", "sugar-free", "diabetic-friendly"],
    items: [
      { variantId: "var-1a", qty: 1 }, // Beetroot 50g (120)
      { variantId: "var-4a", qty: 1 }, // Ragi 60g (110)
      { variantId: "var-5a", qty: 1 }, // Makhana 50g (140)
      { variantId: "var-13a", qty: 1 } // Pops 4 pack (199)
      // Total value: 569, bundle saves at 549
    ],
    isActive: true
  },
  {
    id: "bundle-4",
    name: "High Protein Muscle Bundle",
    slug: "high-protein-muscle-bundle",
    description: "The ultimate pack for fitness enthusiasts. High protein rolled oats, premium Alphonso mango shakes, air-dried millet noodles, and crispy soya chips.",
    price: 1390,
    compareAtPrice: 1775,
    images: ["https://images.unsplash.com/photo-1586444248902-2f64eddc13df?q=80&w=600&fit=crop"],
    dietaryTags: ["high-protein", "sugar-free"],
    items: [
      { variantId: "var-9a", qty: 2 }, // Rolled Oats 400g (350 x 2 = 700)
      { variantId: "var-10b", qty: 1 }, // Shake 6 pack (850)
      { variantId: "var-11a", qty: 1 }, // Noodles 150g (125)
      { variantId: "var-3a", qty: 1 }  // Soya packet (95)
      // Total value: 1770, bundle saves at 1390
    ],
    isActive: true
  }
];

const SEED_DELIVERY_ZONES: DeliveryZone[] = [
  { id: "dz-1", pincode: "500081", area: "Madhapur / Hitech City", deliveryFee: 40, minOrder: 250, etaMinutes: 30 },
  { id: "dz-2", pincode: "500032", area: "Gachibowli / Financial District", deliveryFee: 40, minOrder: 250, etaMinutes: 35 },
  { id: "dz-3", pincode: "500008", area: "Jubilee Hills / Banjara Hills", deliveryFee: 50, minOrder: 300, etaMinutes: 40 },
  { id: "dz-4", pincode: "500001", area: "Abids / Koti / Nampally", deliveryFee: 60, minOrder: 400, etaMinutes: 50 },
  { id: "dz-5", pincode: "500003", area: "Secunderabad Station Area", deliveryFee: 80, minOrder: 500, etaMinutes: 60 }
];

const SEED_COUPONS: Coupon[] = [
  {
    id: "coup-1",
    code: "SUGARFREE",
    type: "PERCENT",
    value: 15,
    minOrder: 400,
    maxDiscount: 150,
    usageLimit: 100,
    perUserLimit: 1,
    startsAt: "2026-01-01T00:00:00Z",
    expiresAt: "2026-12-31T23:59:59Z",
    active: true
  },
  {
    id: "coup-2",
    code: "WELCOME10",
    type: "FLAT",
    value: 100,
    minOrder: 500,
    usageLimit: 500,
    perUserLimit: 1,
    startsAt: "2026-01-01T00:00:00Z",
    expiresAt: "2026-12-31T23:59:59Z",
    active: true
  },
  {
    id: "coup-3",
    code: "KETO20",
    type: "PERCENT",
    value: 20,
    minOrder: 1000,
    maxDiscount: 300,
    usageLimit: 50,
    perUserLimit: 1,
    startsAt: "2026-01-01T00:00:00Z",
    expiresAt: "2026-12-31T23:59:59Z",
    active: true
  }
];

const createSeedBatches = (): Batch[] => {
  const batches: Batch[] = [];
  const today = new Date();
  
  SEED_VARIANTS.forEach((variant) => {
    const mfg1 = new Date(today);
    mfg1.setMonth(today.getMonth() - 2);
    const exp1 = new Date(today);
    exp1.setMonth(today.getMonth() + 2);

    batches.push({
      id: `batch-${variant.id}-1`,
      variantId: variant.id,
      batchNumber: `B-${variant.sku}-01`,
      mfgDate: mfg1.toISOString().split('T')[0],
      expiryDate: exp1.toISOString().split('T')[0],
      quantity: 50
    });

    const mfg2 = new Date(today);
    mfg2.setMonth(today.getMonth() - 1);
    const exp2 = new Date(today);
    exp2.setMonth(today.getMonth() + 6);

    batches.push({
      id: `batch-${variant.id}-2`,
      variantId: variant.id,
      batchNumber: `B-${variant.sku}-02`,
      mfgDate: mfg2.toISOString().split('T')[0],
      expiryDate: exp2.toISOString().split('T')[0],
      quantity: 80
    });
  });
  return batches;
};

const SEED_REVIEWS: Review[] = [
  {
    id: "rev-1",
    productId: "prod-1",
    userId: "user-cust",
    userName: "Ramesh Kumar",
    rating: 5,
    title: "Perfect diabetic snack!",
    body: "I am diabetic and struggle to find crunchy snacks that don't trigger spikes. These Beetroot chips are crisp, perfectly salty, and my glycemic reader shows absolutely zero change after eating. Highly recommend!",
    verifiedPurchase: true,
    status: "APPROVED",
    timestamp: "2026-06-20T10:00:00Z"
  },
  {
    id: "rev-2",
    productId: "prod-1",
    userId: "user-cust2",
    userName: "Sneha Reddy",
    rating: 4,
    title: "Extremely tasty, a bit small pack",
    body: "The mint flavor combined with beet is really refreshing. Wish the pack was slightly bigger, but quality is top notch.",
    verifiedPurchase: true,
    status: "APPROVED",
    timestamp: "2026-06-22T14:30:00Z"
  },
  {
    id: "rev-3",
    productId: "prod-6",
    userId: "user-cust",
    userName: "Ramesh Kumar",
    rating: 5,
    title: "No Maltitol spike!",
    body: "It is very hard to find real stevia-sweetened chocolates in India. Most brands use maltitol. SafeSnack uses real stevia, tastes premium like Belgian chocolate. Excellent job.",
    verifiedPurchase: true,
    status: "APPROVED",
    timestamp: "2026-06-18T18:15:00Z"
  }
];

const SEED_CMS: HomepageCms = {
  heroTitle: "Guilt-Free Snacks Crafted for Your Health",
  heroSubtitle: "Zero sugar. Diabetic-friendly, keto, and high-protein snack alternatives designed to keep blood sugar stable and energy sustained.",
  heroCtaText: "Explore Originals First",
  heroCtaLink: "/products?brand=safesnack-originals",
  heroImage: "https://images.unsplash.com/photo-1540420773420-3366772f4999?q=80&w=1200&fit=crop",
  featuredProductIds: ["prod-1", "prod-2", "prod-5", "prod-6"],
  featuredBundleIds: ["bundle-1", "bundle-2"],
  bannerText: "✨ Quick Hyderabad Delivery: Gachibowli, Madhapur, Jubilee Hills in under 45 minutes!"
};

const SEED_PROFILE: Profile = {
  id: "user-cust",
  name: "Arjun Rao",
  phone: "+91 98480 12345",
  email: "arjun.rao@gmail.com",
  role: "CUSTOMER",
  referralCode: "ARJUN50",
  pointsBalance: 150
};

// ----------------------------------------------------
// DATABASE MANAGEMENT API
// ----------------------------------------------------

export class MockDatabase {
  private static isInitialized = false;

  private static getStore<T>(key: string): T[] {
    if (typeof window === 'undefined') return [];
    const val = localStorage.getItem(key);
    return val ? JSON.parse(val) : [];
  }

  private static setStore<T>(key: string, data: T[]): void {
    if (typeof window === 'undefined') return;
    localStorage.setItem(key, JSON.stringify(data));
  }

  public static init(force = false): void {
    if (typeof window === 'undefined') return;
    if (this.isInitialized && !force) return;

    const currentVersion = "v4";
    const storedVersion = localStorage.getItem('ss_seed_version');
    const needsSeed = !localStorage.getItem('ss_brands') || storedVersion !== currentVersion;

    if (needsSeed || force) {
      localStorage.setItem('ss_seed_version', currentVersion);
      localStorage.setItem('ss_brands', JSON.stringify(SEED_BRANDS));
      localStorage.setItem('ss_categories', JSON.stringify(SEED_CATEGORIES));
      localStorage.setItem('ss_products', JSON.stringify(SEED_PRODUCTS));
      localStorage.setItem('ss_variants', JSON.stringify(SEED_VARIANTS));
      localStorage.setItem('ss_bundles', JSON.stringify(SEED_BUNDLES));
      localStorage.setItem('ss_delivery_zones', JSON.stringify(SEED_DELIVERY_ZONES));
      localStorage.setItem('ss_coupons', JSON.stringify(SEED_COUPONS));
      localStorage.setItem('ss_batches', JSON.stringify(createSeedBatches()));
      localStorage.setItem('ss_reviews', JSON.stringify(SEED_REVIEWS));
      localStorage.setItem('ss_cms', JSON.stringify(SEED_CMS));
      localStorage.setItem('ss_profile', JSON.stringify(SEED_PROFILE));
      localStorage.setItem('ss_orders', JSON.stringify([]));
      localStorage.setItem('ss_points_ledger', JSON.stringify([
        { id: "led-1", userId: "user-cust", delta: 150, reason: "Welcome Signup Bonus", timestamp: new Date().toISOString() }
      ]));
      localStorage.setItem('ss_referrals', JSON.stringify([]));
      localStorage.setItem('ss_analytics', JSON.stringify([]));
      localStorage.setItem('ss_cart', JSON.stringify([]));
      localStorage.setItem('ss_wishlist', JSON.stringify([]));
      localStorage.setItem('ss_inventory_movements', JSON.stringify([]));
    }
    this.isInitialized = true;
  }

  public static getBrands(): Brand[] { return this.getStore('ss_brands'); }
  public static getCategories(): Category[] { return this.getStore('ss_categories'); }
  public static getProducts(): Product[] { return this.getStore('ss_products'); }
  public static getVariants(): Variant[] { return this.getStore('ss_variants'); }
  public static getBundles(): Bundle[] { return this.getStore('ss_bundles'); }
  public static getDeliveryZones(): DeliveryZone[] { return this.getStore('ss_delivery_zones'); }
  public static getCoupons(): Coupon[] { return this.getStore('ss_coupons'); }
  public static getReviews(): Review[] { return this.getStore('ss_reviews'); }
  public static getBatches(): Batch[] { return this.getStore('ss_batches'); }
  public static getOrders(): Order[] { return this.getStore('ss_orders'); }
  public static getPointsLedger(): RewardPointLedger[] { return this.getStore('ss_points_ledger'); }
  
  public static getProfile(): Profile {
    if (typeof window === 'undefined') return SEED_PROFILE;
    const val = localStorage.getItem('ss_profile');
    return val ? JSON.parse(val) : SEED_PROFILE;
  }

  public static updateProfile(profile: Profile): void {
    if (typeof window === 'undefined') return;
    localStorage.setItem('ss_profile', JSON.stringify(profile));
  }

  public static getCms(): HomepageCms {
    if (typeof window === 'undefined') return SEED_CMS;
    const val = localStorage.getItem('ss_cms');
    return val ? JSON.parse(val) : SEED_CMS;
  }

  public static updateCms(cms: HomepageCms): void {
    if (typeof window === 'undefined') return;
    localStorage.setItem('ss_cms', JSON.stringify(cms));
  }

  public static saveProduct(product: Product): void {
    const products = this.getProducts();
    const idx = products.findIndex(p => p.id === product.id);
    if (idx >= 0) products[idx] = product;
    else products.push(product);
    this.setStore('ss_products', products);
  }

  public static saveVariant(variant: Variant): void {
    const variants = this.getVariants();
    const idx = variants.findIndex(v => v.id === variant.id);
    if (idx >= 0) variants[idx] = variant;
    else variants.push(variant);
    this.setStore('ss_variants', variants);
  }

  public static saveBundle(bundle: Bundle): void {
    const bundles = this.getBundles();
    const idx = bundles.findIndex(b => b.id === bundle.id);
    if (idx >= 0) bundles[idx] = bundle;
    else bundles.push(bundle);
    this.setStore('ss_bundles', bundles);
  }

  public static logEvent(event: Omit<AnalyticsEvent, 'id' | 'timestamp'>): void {
    if (typeof window === 'undefined') return;
    const events = this.getStore<AnalyticsEvent>('ss_analytics');
    const newEvent: AnalyticsEvent = {
      ...event,
      id: `evt-${Math.random().toString(36).substr(2, 9)}`,
      timestamp: new Date().toISOString()
    };
    events.push(newEvent);
    this.setStore('ss_analytics', events);
  }

  public static getAnalyticsEvents(): AnalyticsEvent[] {
    return this.getStore('ss_analytics');
  }

  public static addReview(review: Omit<Review, 'id' | 'timestamp' | 'status'>): void {
    const reviews = this.getReviews();
    const newReview: Review = {
      ...review,
      id: `rev-${Math.random().toString(36).substr(2, 9)}`,
      status: 'APPROVED',
      timestamp: new Date().toISOString()
    };
    reviews.push(newReview);
    this.setStore('ss_reviews', reviews);

    const productReviews = reviews.filter(r => r.productId === review.productId && r.status === 'APPROVED');
    const avgRating = productReviews.reduce((sum, r) => sum + r.rating, 0) / (productReviews.length || 1);
    
    const products = this.getProducts();
    const pIdx = products.findIndex(p => p.id === review.productId);
    if (pIdx >= 0) {
      products[pIdx].ratingCache = parseFloat(avgRating.toFixed(1));
      products[pIdx].reviewCount = productReviews.length;
      this.saveProduct(products[pIdx]);
    }
  }

  public static saveBatch(batch: Batch): void {
    const batches = this.getBatches();
    const idx = batches.findIndex(b => b.id === batch.id);
    if (idx >= 0) {
      const oldQty = batches[idx].quantity;
      batches[idx] = batch;
      if (oldQty !== batch.quantity) {
        this.logInventoryMovement(
          batch.variantId,
          batch.id,
          batch.quantity > oldQty ? 'IN' : 'ADJUST',
          Math.abs(batch.quantity - oldQty),
          `Batch adjusted: ${batch.batchNumber}`
        );
      }
    } else {
      batches.push(batch);
      this.logInventoryMovement(batch.variantId, batch.id, 'IN', batch.quantity, `New batch initialized: ${batch.batchNumber}`);
    }
    this.setStore('ss_batches', batches);
  }

  public static logInventoryMovement(
    variantId: string,
    batchId: string | undefined,
    type: InventoryMovement['type'],
    qty: number,
    reference: string
  ): void {
    const movements = this.getStore<InventoryMovement>('ss_inventory_movements');
    const profile = this.getProfile();
    movements.push({
      id: `mov-${Math.random().toString(36).substr(2, 9)}`,
      variantId,
      batchId,
      type,
      qty,
      reference,
      staffId: profile.role !== 'CUSTOMER' ? profile.id : undefined,
      timestamp: new Date().toISOString()
    });
    this.setStore('ss_inventory_movements', movements);
  }

  public static getInventoryMovements(): InventoryMovement[] {
    return this.getStore('ss_inventory_movements');
  }

  public static allocateInventoryFEFO(variantId: string, quantityNeeded: number): { allocated: boolean; allocations: { batchId: string; qty: number }[] } {
    const batches = this.getBatches();
    const activeBatches = batches
      .filter(b => b.variantId === variantId && b.quantity > 0)
      .sort((a, b) => new Date(a.expiryDate).getTime() - new Date(b.expiryDate).getTime());

    let remaining = quantityNeeded;
    const allocations: { batchId: string; qty: number }[] = [];

    for (const batch of activeBatches) {
      if (remaining <= 0) break;

      const take = Math.min(batch.quantity, remaining);
      allocations.push({ batchId: batch.id, qty: take });
      remaining -= take;
    }

    if (remaining > 0) {
      return { allocated: false, allocations: [] };
    }

    return { allocated: true, allocations };
  }

  public static executeInventoryDeduction(variantId: string, allocations: { batchId: string; qty: number }[], orderId: string): void {
    const batches = this.getBatches();
    allocations.forEach(alloc => {
      const idx = batches.findIndex(b => b.id === alloc.batchId);
      if (idx >= 0) {
        batches[idx].quantity -= alloc.qty;
        this.logInventoryMovement(variantId, alloc.batchId, 'OUT', alloc.qty, `Order purchase: ${orderId}`);
      }
    });
    this.setStore('ss_batches', batches);
  }

  public static addPoints(userId: string, delta: number, reason: string, orderId?: string): void {
    const ledgers = this.getStore<RewardPointLedger>('ss_points_ledger');
    ledgers.push({
      id: `led-${Math.random().toString(36).substr(2, 9)}`,
      userId,
      delta,
      reason,
      orderId,
      timestamp: new Date().toISOString()
    });
    this.setStore('ss_points_ledger', ledgers);

    const profile = this.getProfile();
    if (profile.id === userId) {
      profile.pointsBalance = Math.max(0, profile.pointsBalance + delta);
      this.updateProfile(profile);
    }
  }

  public static createOrder(orderData: Omit<Order, 'id' | 'razorpayOrderId' | 'paymentStatus' | 'timestamp'>): Order {
    const orderId = `ord-${Math.random().toString(36).substr(2, 9)}`;
    const razorpayOrderId = `rp_order_${Math.random().toString(36).substr(2, 9)}`;
    
    const newOrder: Order = {
      ...orderData,
      id: orderId,
      razorpayOrderId,
      paymentStatus: 'PENDING',
      timestamp: new Date().toISOString()
    };

    const orders = this.getOrders();
    orders.push(newOrder);
    this.setStore('ss_orders', orders);

    return newOrder;
  }

  public static payOrder(orderId: string, paymentId: string): Order | null {
    const orders = this.getOrders();
    const idx = orders.findIndex(o => o.id === orderId);
    if (idx === -1) return null;

    const order = orders[idx];
    order.status = 'PAID';
    order.paymentId = paymentId;
    order.paymentStatus = 'SUCCESS';

    order.items.forEach(item => {
      if (item.variantId) {
        const allocResult = this.allocateInventoryFEFO(item.variantId, item.qty);
        if (allocResult.allocated) {
          this.executeInventoryDeduction(item.variantId, allocResult.allocations, orderId);
          item.batchAllocations = allocResult.allocations;
        } else {
          const batches = this.getBatches();
          const firstBatch = batches.find(b => b.variantId === item.variantId);
          if (firstBatch) {
            firstBatch.quantity = Math.max(0, firstBatch.quantity - item.qty);
            item.batchAllocations = [{ batchId: firstBatch.id, qty: item.qty }];
            this.logInventoryMovement(item.variantId, firstBatch.id, 'OUT', item.qty, `Order purchase (stock shortfall): ${orderId}`);
          }
        }
      } else if (item.bundleId) {
        const bundle = this.getBundles().find(b => b.id === item.bundleId);
        if (bundle) {
          bundle.items.forEach(bItem => {
            const qtyNeeded = bItem.qty * item.qty;
            const allocResult = this.allocateInventoryFEFO(bItem.variantId, qtyNeeded);
            if (allocResult.allocated) {
              this.executeInventoryDeduction(bItem.variantId, allocResult.allocations, orderId);
            }
          });
        }
      }
    });

    const pointsEarned = Math.floor(order.total / 10);
    order.pointsEarned = pointsEarned;
    this.addPoints(order.userId, pointsEarned, `Purchase Rewards on order ${orderId}`, orderId);

    if (order.pointsRedeemed > 0) {
      this.addPoints(order.userId, -order.pointsRedeemed, `Redeemed points on order ${orderId}`, orderId);
    }

    const completedOrders = orders.filter(o => o.userId === order.userId && o.status === 'PAID');
    if (completedOrders.length === 1) {
      const profile = this.getProfile();
      if (profile.referredBy) {
        this.addPoints(profile.referredBy, 100, `Referral bonus: Arjun made a purchase!`);
        this.addPoints(order.userId, 50, `Referral first purchase bonus`);
      }
    }

    orders[idx] = order;
    this.setStore('ss_orders', orders);

    this.logEvent({
      type: 'PURCHASE',
      userId: order.userId,
      sessionId: 'demo-session',
      value: order.total,
      metadata: JSON.stringify({ orderId, itemsCount: order.items.length })
    });

    return order;
  }

  public static updateOrderStatus(orderId: string, status: Order['status']): Order | null {
    const orders = this.getOrders();
    const idx = orders.findIndex(o => o.id === orderId);
    if (idx === -1) return null;

    orders[idx].status = status;
    this.setStore('ss_orders', orders);
    return orders[idx];
  }
}
