"use client";

import React, { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { Star, ShieldCheck, Heart, AlertCircle, ShoppingBag, Plus, Sparkles, Mail } from "lucide-react";
import { MockDatabase, Product, Variant, Brand, Review } from "@/lib/db/mock-db";
import { useCart } from "@/lib/context/cart-context";
import { Button } from "@/components/ui/button";

export default function ProductDetailPage() {
  const { slug } = useParams();
  const router = useRouter();
  const { addToCart } = useCart();

  const [product, setProduct] = useState<Product | null>(null);
  const [variants, setVariants] = useState<Variant[]>([]);
  const [brand, setBrand] = useState<Brand | null>(null);
  const [selectedVariant, setSelectedVariant] = useState<Variant | null>(null);
  const [activeTab, setActiveTab] = useState<"benefits" | "story" | "ingredients" | "serving">("benefits");
  
  // Image Gallery State
  const [activeImage, setActiveImage] = useState<string>("");
  const [activeImageLabel, setActiveImageLabel] = useState<string>("Product");

  // Frequently Bought Together (FBT) state
  const [fbtProducts, setFbtProducts] = useState<Product[]>([]);
  const [fbtVariants, setFbtVariants] = useState<Variant[]>([]);

  // Reviews states
  const [reviews, setReviews] = useState<Review[]>([]);
  const [newReview, setNewReview] = useState({ rating: 5, title: "", body: "", userName: "" });
  const [reviewSuccess, setReviewSuccess] = useState(false);

  useEffect(() => {
    if (!slug) return;
    MockDatabase.init();
    const allProducts = MockDatabase.getProducts();
    const foundProduct = allProducts.find((p) => p.slug === slug);

    if (!foundProduct) {
      return;
    }

    setProduct(foundProduct);
    
    // Log Product View Analytics
    MockDatabase.logEvent({
      type: "PRODUCT_VIEW",
      sessionId: "demo-session",
      productId: foundProduct.id,
      metadata: foundProduct.name
    });

    const pVariants = MockDatabase.getVariants().filter((v) => v.productId === foundProduct.id);
    setVariants(pVariants);
    setSelectedVariant(pVariants[0] || null);

    const pBrand = MockDatabase.getBrands().find((b) => b.id === foundProduct.brandId) || null;
    setBrand(pBrand);

    setActiveImage(foundProduct.images.primary);
    setActiveImageLabel("Primary");

    // Gather Frequently Bought Together products (limit 2)
    const fbtList = allProducts.filter((p) => foundProduct.frequentlyBoughtTogether.includes(p.id));
    setFbtProducts(fbtList);
    const fbtVars = MockDatabase.getVariants().filter((v) => foundProduct.frequentlyBoughtTogether.includes(v.productId));
    setFbtVariants(fbtVars);

    // Get Reviews
    const pReviews = MockDatabase.getReviews().filter((r) => r.productId === foundProduct.id && r.status === "APPROVED");
    setReviews(pReviews);
  }, [slug]);

  if (!product || !brand || !selectedVariant) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="w-8 h-8 border-4 border-gold border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  const handleAddToCart = () => {
    addToCart({
      id: selectedVariant.id,
      variantId: selectedVariant.id,
      price: selectedVariant.price,
      name: product.name,
      label: selectedVariant.label,
      sku: selectedVariant.sku,
      image: product.images.primary,
      brandName: brand.name,
      isBundle: false,
    });
  };

  // Add Frequently Bought Together bundle (Current variant + FBT items) with 10% discount!
  const handleAddFbtBundle = () => {
    // Current item
    addToCart({
      id: selectedVariant.id,
      variantId: selectedVariant.id,
      price: Math.floor(selectedVariant.price * 0.9), // 10% off
      name: `${product.name} (Bundle Save)`,
      label: selectedVariant.label,
      sku: selectedVariant.sku,
      image: product.images.primary,
      brandName: brand.name,
      isBundle: false,
    }, 1);

    // FBT items
    fbtProducts.forEach(fp => {
      const fpVar = fbtVariants.find(v => v.productId === fp.id);
      const fpBrand = MockDatabase.getBrands().find(b => b.id === fp.brandId);
      if (fpVar) {
        addToCart({
          id: fpVar.id,
          variantId: fpVar.id,
          price: Math.floor(fpVar.price * 0.9), // 10% off
          name: `${fp.name} (Bundle Save)`,
          label: fpVar.label,
          sku: fpVar.sku,
          image: fp.images.primary,
          brandName: fpBrand?.name,
          isBundle: false,
        }, 1);
      }
    });
  };

  // Submit Review Handler
  const handleReviewSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newReview.userName || !newReview.title || !newReview.body) return;

    MockDatabase.addReview({
      productId: product.id,
      userId: "user-cust", // Demo customer
      userName: newReview.userName,
      rating: newReview.rating,
      title: newReview.title,
      body: newReview.body,
      verifiedPurchase: true, // Mark verified purchase for demo
    });

    // Refresh reviews
    const updatedReviews = MockDatabase.getReviews().filter((r) => r.productId === product.id && r.status === "APPROVED");
    setReviews(updatedReviews);
    setReviewSuccess(true);
    setNewReview({ rating: 5, title: "", body: "", userName: "" });

    // Refresh product cache
    const updatedProd = MockDatabase.getProducts().find(p => p.id === product.id);
    if (updatedProd) setProduct(updatedProd);
  };

  // FBT Calculations
  const currentPrice = selectedVariant.price;
  const fbtPriceSum = fbtProducts.reduce((sum, fp) => {
    const fv = fbtVariants.find(v => v.productId === fp.id);
    return sum + (fv ? fv.price : 0);
  }, 0);
  const bundleSubtotal = currentPrice + fbtPriceSum;
  const bundleDiscountedTotal = Math.floor(bundleSubtotal * 0.9);

  // SEO JSON-LD Product Schema
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Product",
    "name": product.name,
    "image": [product.images.primary, product.images.hover],
    "description": product.description,
    "sku": selectedVariant.sku,
    "brand": {
      "@type": "Brand",
      "name": brand.name
    },
    "offers": {
      "@type": "Offer",
      "url": `https://safesnack.in/products/${product.slug}`,
      "priceCurrency": "INR",
      "price": selectedVariant.price,
      "itemCondition": "https://schema.org/NewCondition",
      "availability": "https://schema.org/InStock"
    },
    "aggregateRating": {
      "@type": "AggregateRating",
      "ratingValue": product.ratingCache,
      "reviewCount": reviews.length || 1
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-16 text-left animate-fade-in">
      {/* Baked-in SEO JSON-LD */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      {/* Main product structure */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16 items-start">
        
        {/* Gallery column (Left) */}
        <div className="lg:col-span-6 space-y-5">
          <div className="aspect-square w-full rounded-[2.5rem] overflow-hidden bg-accent/5 border border-accent/15 relative shadow-xl">
            {brand.isHouseBrand && (
              <div className="absolute top-4 left-4 z-10 bg-primary text-pearl text-[9px] font-bold px-3.5 py-1.5 rounded-full uppercase tracking-wider border border-accent/20 shadow-md">
                Original Recipe
              </div>
            )}
            <img
              src={activeImage}
              alt={`${product.name} - ${activeImageLabel}`}
              className="w-full h-full object-cover animate-fade-in"
            />
            <div className="absolute bottom-4 right-4 bg-text/80 text-pearl text-[9px] font-bold px-3.5 py-1 rounded-full uppercase tracking-widest border border-accent/15 shadow-sm">
              {activeImageLabel} view
            </div>
          </div>

          {/* Thumbnails grid */}
          <div className="grid grid-cols-4 gap-3.5">
            {[
              { src: product.images.primary, label: "Primary" },
              { src: product.images.hover, label: "Lifestyle" },
              { src: product.images.nutrition, label: "Nutrition Label" },
              { src: product.images.ingredients, label: "Ingredients" },
            ].map((img, i) => (
              <button
                key={i}
                onClick={() => {
                  setActiveImage(img.src);
                  setActiveImageLabel(img.label);
                }}
                className={`aspect-square rounded-[1.25rem] overflow-hidden border bg-surface/30 transition-all duration-300 cursor-pointer ${
                  activeImage === img.src
                    ? "border-gold ring-4 ring-gold/20 scale-[0.96]"
                    : "border-accent/15 hover:border-gold/50"
                }`}
              >
                <img src={img.src} alt={img.label} className="w-full h-full object-cover" />
              </button>
            ))}
          </div>
        </div>

        {/* Details column (Right) */}
        <div className="lg:col-span-6 space-y-6">
          <div className="space-y-1">
            <span className="text-[9px] uppercase tracking-widest font-bold text-accent">
              {brand.name}
            </span>
            <h1 className="font-display font-black text-3xl sm:text-4xl text-text tracking-tight leading-tight">
              {product.name}
            </h1>
            
            {/* Rating Row */}
            <div className="flex items-center gap-2 mt-2 font-semibold text-xs">
              <div className="flex text-accent">
                <Star size={14} fill="currentColor" className="stroke-none" />
              </div>
              <span className="text-text">{product.ratingCache}</span>
              <span className="text-text-muted font-normal">({reviews.length} Verified Reviews)</span>
            </div>
          </div>

          <p className="text-sm text-text/70 leading-relaxed border-b border-gold/10 pb-6 font-medium">
            {product.description}
          </p>

          {/* Variants Selector */}
          <div className="space-y-3 text-left">
            <h3 className="text-[10px] font-bold uppercase tracking-widest text-accent">Select Pack Size</h3>
            <div className="flex flex-wrap gap-2.5">
              {variants.map((v) => (
                <button
                  key={v.id}
                  onClick={() => setSelectedVariant(v)}
                  className={`text-[11px] font-bold uppercase tracking-wider px-5 py-3 rounded-full border transition-all cursor-pointer ${
                    selectedVariant.id === v.id
                      ? "border-primary bg-primary text-pearl shadow-sm"
                      : "border-accent/20 hover:border-gold/50 bg-transparent text-text-muted hover:text-text"
                  }`}
                >
                  {v.label} — ₹{v.price}
                </button>
              ))}
            </div>
          </div>

          {/* Pricing Box & Add To Cart Button */}
          <div className="bg-surface/60 border border-accent/20 rounded-3xl p-5 flex items-center justify-between gap-4 shadow-sm">
            <div>
              {selectedVariant.compareAtPrice && (
                <span className="text-[10px] font-bold text-text-muted line-through block leading-tight">
                  ₹{selectedVariant.compareAtPrice}
                </span>
              )}
              <span className="font-display font-black text-2xl text-text block">
                ₹{selectedVariant.price}
              </span>
              <span className="text-[9px] text-primary font-bold uppercase tracking-widest mt-1 block">
                ✓ Verified Batch In Stock
              </span>
            </div>

            <Button
              onClick={handleAddToCart}
              variant="primary"
              size="lg"
              className="px-8 py-4 font-bold text-xs uppercase tracking-wider flex items-center gap-2 shadow-xl hover:shadow-gold/15 cursor-pointer"
            >
              <ShoppingBag size={14} />
              Add to Cart
            </Button>
          </div>

          {/* Frequently Bought Together (FBT) Component */}
          {fbtProducts.length > 0 && (
            <div className="border border-accent/20 bg-accent/5 p-6 rounded-3xl space-y-4">
              <div className="flex items-center gap-2 text-[10px] text-accent font-bold uppercase tracking-widest">
                <Sparkles size={13} className="text-accent" />
                Frequently Bought Together (Save 10%)
              </div>
              
              {/* Bundle items list */}
              <div className="flex items-center gap-4 overflow-x-auto no-scrollbar py-2 text-xs font-semibold">
                {/* Current Product */}
                <div className="flex items-center gap-3 shrink-0">
                  <img src={product.images.primary} className="w-10 h-10 object-cover rounded-xl border border-accent/15" />
                  <div className="text-left">
                    <span className="font-bold block text-text line-clamp-1 max-w-[120px]">{product.name}</span>
                    <span className="text-text-muted text-[9px]">{selectedVariant.label}</span>
                  </div>
                </div>

                <span className="text-accent text-lg font-black shrink-0">+</span>

                {/* FBT items */}
                {fbtProducts.map((fp, idx) => {
                  const fv = fbtVariants.find(v => v.productId === fp.id);
                  return (
                    <React.Fragment key={fp.id}>
                      <div className="flex items-center gap-3 shrink-0">
                        <img src={fp.images.primary} className="w-10 h-10 object-cover rounded-xl border border-accent/15" />
                        <div className="text-left">
                          <span className="font-bold block text-text line-clamp-1 max-w-[120px]">{fp.name}</span>
                          {fv && <span className="text-text-muted text-[9px]">{fv.label}</span>}
                        </div>
                      </div>
                      {idx < fbtProducts.length - 1 && <span className="text-accent text-lg font-black shrink-0">+</span>}
                    </React.Fragment>
                  );
                })}
              </div>

              {/* FBT Action */}
              <div className="flex items-center justify-between border-t border-gold/10 pt-4 text-xs">
                <div className="text-left">
                  <span className="text-text-muted line-through block font-bold">₹{bundleSubtotal}</span>
                  <span className="font-display font-black text-lg text-text block">₹{bundleDiscountedTotal}</span>
                </div>
                <Button
                  onClick={handleAddFbtBundle}
                  variant="outline"
                  size="sm"
                  className="py-3 px-5 font-bold uppercase tracking-wider text-[9px] bg-accent/10 hover:bg-accent text-primary hover:text-text transition-colors border-accent/25 cursor-pointer"
                >
                  <Plus size={12} className="stroke-[2.5]" />
                  Add Pack to Cart
                </Button>
              </div>
            </div>
          )}

        </div>
      </div>

      {/* Storytelling tab details (Middle) */}
      <section className="bg-surface/30 border border-accent/15 rounded-[2rem] overflow-hidden text-left">
        {/* Navigation Tabs */}
        <div className="flex border-b border-gold/10 bg-surface/60 overflow-x-auto no-scrollbar">
          {[
            { id: "benefits", label: "Benefits & Nutritional Value" },
            { id: "story", label: "Our Sourcing Story" },
            { id: "ingredients", label: "Featured Ingredients" },
            { id: "serving", label: "Serving Suggestions" },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`px-6 py-4 text-[10px] font-bold uppercase tracking-widest border-b-2 transition-all cursor-pointer whitespace-nowrap ${
                activeTab === tab.id
                  ? "border-gold text-primary bg-background font-black"
                  : "border-transparent text-text-muted hover:text-text"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Tab Contents */}
        <div className="p-8 sm:p-10 min-h-[180px] animate-fade-in">
          {activeTab === "benefits" && (
            <div className="space-y-4">
              <h3 className="font-display font-bold text-lg text-text">Why it is good for you</h3>
              <ul className="space-y-3">
                {product.benefits.map((b, i) => (
                  <li key={i} className="flex gap-2.5 text-xs text-text/70 leading-relaxed font-semibold">
                    <span className="text-accent font-bold">✔</span>
                    {b}
                  </li>
                ))}
              </ul>
            </div>
          )}

          {activeTab === "story" && (
            <div className="space-y-3">
              <h3 className="font-display font-bold text-lg text-text">From seed to snack</h3>
              <p className="text-xs text-text/70 leading-relaxed max-w-3xl font-medium">
                {product.story}
              </p>
            </div>
          )}

          {activeTab === "ingredients" && (
            <div className="space-y-4">
              <h3 className="font-display font-bold text-lg text-text">Clean ingredients lists only</h3>
              <div className="flex flex-wrap gap-2.5">
                {product.featuredIngredients.map((ing, i) => (
                  <span
                    key={i}
                    className="bg-surface border border-accent/15 text-text text-xs font-bold px-4.5 py-2.5 rounded-2xl shadow-xs"
                  >
                    {ing}
                  </span>
                ))}
              </div>
              <p className="text-[9px] font-semibold text-text-muted max-w-lg leading-snug">
                Warning: Produced in a kitchen that handles nuts, dairy, and sesame seeds. Review individual labels for detailed allergen notices.
              </p>
            </div>
          )}

          {activeTab === "serving" && (
            <div className="space-y-3">
              <h3 className="font-display font-bold text-lg text-text">How to enjoy</h3>
              <ul className="space-y-2.5">
                {product.servingSuggestions.map((s, i) => (
                  <li key={i} className="text-xs text-text/70 leading-relaxed list-disc list-inside font-semibold">
                    {s}
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      </section>

      {/* Verified Reviews Section */}
      <section className="grid grid-cols-1 lg:grid-cols-12 gap-12 border-t border-accent/15 pt-16 text-left">
        
        {/* Left: Reviews summary & Add review form */}
        <div className="lg:col-span-5 space-y-6">
          <div className="space-y-1">
            <h2 className="font-display font-black text-2xl text-text tracking-tight">
              Customer Reviews
            </h2>
            <p className="text-xs text-text-muted font-medium">
              Add your rating. We love reading verified glycemic response case studies!
            </p>
          </div>

          <form onSubmit={handleReviewSubmit} className="bg-surface/40 border border-accent/20 rounded-3xl p-6 space-y-4 shadow-sm">
            <h3 className="font-display font-bold text-sm text-text">Write a Review</h3>
            
            {reviewSuccess && (
              <div className="bg-[#EBF7EE] border border-[#D6ECD9] text-[#2F5233] p-4 rounded-xl text-xs font-bold">
                ✓ Thank you! Your review was successfully posted and aggregate rating recalculated.
              </div>
            )}

            <div className="space-y-1">
              <label className="text-[9px] font-bold uppercase tracking-widest text-accent block">Your Name</label>
              <input
                type="text"
                required
                placeholder="Ramesh Kumar"
                value={newReview.userName}
                onChange={(e) => setNewReview({ ...newReview, userName: e.target.value })}
                className="w-full text-xs bg-surface border border-accent/20 rounded-xl px-3.5 py-2.5 text-text focus:outline-none focus:border-gold"
              />
            </div>

            <div className="space-y-1">
              <label className="text-[9px] font-bold uppercase tracking-widest text-accent block">Rating</label>
              <select
                value={newReview.rating}
                onChange={(e) => setNewReview({ ...newReview, rating: parseInt(e.target.value) })}
                className="w-full text-xs bg-surface border border-accent/20 rounded-xl px-3.5 py-2.5 text-text focus:outline-none focus:border-gold cursor-pointer font-bold"
              >
                <option value="5">⭐⭐⭐⭐⭐ 5 Stars</option>
                <option value="4">⭐⭐⭐⭐ 4 Stars</option>
                <option value="3">⭐⭐⭐ 3 Stars</option>
                <option value="2">⭐⭐ 2 Stars</option>
                <option value="1">⭐ 1 Star</option>
              </select>
            </div>

            <div className="space-y-1">
              <label className="text-[9px] font-bold uppercase tracking-widest text-accent block">Review Headline</label>
              <input
                type="text"
                required
                placeholder="Perfect diabetic snack choice"
                value={newReview.title}
                onChange={(e) => setNewReview({ ...newReview, title: e.target.value })}
                className="w-full text-xs bg-surface border border-accent/20 rounded-xl px-3.5 py-2.5 text-text focus:outline-none focus:border-gold"
              />
            </div>

            <div className="space-y-1">
              <label className="text-[9px] font-bold uppercase tracking-widest text-accent block">Body Details</label>
              <textarea
                required
                rows={3}
                placeholder="Share your experience (sweetness level, crispiness, glycemic tests)..."
                value={newReview.body}
                onChange={(e) => setNewReview({ ...newReview, body: e.target.value })}
                className="w-full text-xs bg-surface border border-accent/20 rounded-xl px-3.5 py-2.5 text-text focus:outline-none focus:border-gold leading-relaxed"
              />
            </div>

            <Button type="submit" variant="primary" className="w-full py-3.5 font-bold uppercase tracking-wider text-[10px] cursor-pointer shadow-lg hover:shadow-gold/15">
              Post Review
            </Button>
          </form>
        </div>

        {/* Right: Reviews List */}
        <div className="lg:col-span-7 space-y-4">
          {reviews.length === 0 ? (
            <div className="bg-surface/40 rounded-3xl border border-accent/15 p-8 text-center text-xs text-text-muted font-semibold italic">
              No reviews yet for this product. Be the first to share your experience!
            </div>
          ) : (
            <div className="space-y-4">
              {reviews.map((r) => (
                <div key={r.id} className="bg-surface/50 border border-accent/15 p-6 rounded-3xl space-y-3 hover:border-gold transition-all duration-300">
                  <div className="flex items-center justify-between">
                    <div className="flex gap-1 text-accent">
                      {Array.from({ length: r.rating }).map((_, i) => (
                        <Star key={i} size={11} fill="currentColor" className="stroke-none" />
                      ))}
                    </div>
                    <span className="text-[9px] font-bold text-text-muted font-mono">
                      {new Date(r.timestamp).toLocaleDateString()}
                    </span>
                  </div>
                  
                  <div className="space-y-1 text-left">
                    <h4 className="font-display font-bold text-sm text-text">
                      {r.title}
                    </h4>
                    <p className="text-xs text-text-muted leading-relaxed font-semibold italic">
                      {r.body}
                    </p>
                  </div>

                  <div className="flex items-center justify-between pt-3 border-t border-gold/10 text-[9px] font-bold uppercase tracking-wider text-text-muted">
                    <span>{r.userName}</span>
                    {r.verifiedPurchase && (
                      <span className="text-primary bg-accent/10 border border-accent/20 px-2.5 py-0.5 rounded-full text-[8px]">
                        Verified Purchase
                      </span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

      </section>

    </div>
  );
}
