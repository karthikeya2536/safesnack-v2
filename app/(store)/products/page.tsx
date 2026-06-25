"use client";

import React, { useState, useEffect, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { SlidersHorizontal, ArrowUpDown, RefreshCw, Sparkles, AlertCircle } from "lucide-react";
import { MockDatabase, Product, Variant, Brand, Category } from "@/lib/db/mock-db";
import { ProductCard } from "@/components/ui/product-card";
import { Button } from "@/components/ui/button";

function CatalogContent() {
  const searchParams = useSearchParams();
  const router = useRouter();

  const [products, setProducts] = useState<Product[]>([]);
  const [variants, setVariants] = useState<Variant[]>([]);
  const [brands, setBrands] = useState<Brand[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);

  // Filter States
  const [searchVal, setSearchVal] = useState("");
  const [selectedBrand, setSelectedBrand] = useState<string>("");
  const [selectedCategory, setSelectedCategory] = useState<string>("");
  const [selectedTag, setSelectedTag] = useState<string>("");
  const [sortOption, setSortOption] = useState<string>("popular");
  const [maxPrice, setMaxPrice] = useState<number>(1000);

  const [showMobileFilters, setShowMobileFilters] = useState(false);

  // Initialize and read search params
  useEffect(() => {
    MockDatabase.init();
    setProducts(MockDatabase.getProducts());
    setVariants(MockDatabase.getVariants());
    setBrands(MockDatabase.getBrands());
    setCategories(MockDatabase.getCategories());

    // Read initial queries
    const search = searchParams.get("search") || searchParams.get("q") || "";
    const tag = searchParams.get("tag") || "";
    const brandSlug = searchParams.get("brand") || "";
    const catSlug = searchParams.get("category") || "";

    if (search) setSearchVal(search);
    if (tag) setSelectedTag(tag);
    
    if (brandSlug) {
      const b = MockDatabase.getBrands().find(br => br.slug === brandSlug);
      if (b) setSelectedBrand(b.id);
    }
    
    if (catSlug) {
      const c = MockDatabase.getCategories().find(ca => ca.slug === catSlug);
      if (c) setSelectedCategory(c.id);
    }
  }, [searchParams]);

  // Handle Search Input Change
  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchVal(e.target.value);
  };

  // Clear all filters
  const handleClearFilters = () => {
    setSearchVal("");
    setSelectedBrand("");
    setSelectedCategory("");
    setSelectedTag("");
    setSortOption("popular");
    setMaxPrice(1000);
    router.push("/products");
  };

  // Filter & Sort Logic
  const getFilteredProducts = () => {
    let result = [...products];

    // 1. Search Query with Smart Intelligence (Check title, description, tags, and ingredients)
    if (searchVal.trim()) {
      const q = searchVal.toLowerCase().trim();
      result = result.filter((p) => {
        const titleMatch = p.name.toLowerCase().includes(q);
        const descMatch = p.description.toLowerCase().includes(q);
        const tagMatch = p.dietaryTags.some((t) => t.toLowerCase().includes(q));
        const ingredientMatch = p.featuredIngredients.some((i) => i.toLowerCase().includes(q));
        
        // Map synonyms (e.g. "low sugar" -> "sugar-free")
        let synonymMatch = false;
        if (q === "low sugar" || q === "no sugar") {
          synonymMatch = p.dietaryTags.includes("sugar-free");
        } else if (q === "weight loss" || q === "diet") {
          synonymMatch = p.dietaryTags.includes("keto") || p.dietaryTags.includes("low-carb");
        } else if (q === "high protein" || q === "muscle") {
          synonymMatch = p.dietaryTags.includes("high-protein");
        }

        return titleMatch || descMatch || tagMatch || ingredientMatch || synonymMatch;
      });
    }

    // 2. Brand Filter
    if (selectedBrand) {
      result = result.filter((p) => p.brandId === selectedBrand);
    }

    // 3. Category Filter
    if (selectedCategory) {
      result = result.filter((p) => p.categoryId === selectedCategory);
    }

    // 4. Dietary Tag Filter
    if (selectedTag) {
      result = result.filter((p) => p.dietaryTags.includes(selectedTag as any));
    }

    // 5. Price Filter (based on first variant price)
    result = result.filter((p) => {
      const pVariants = variants.filter((v) => v.productId === p.id);
      if (pVariants.length === 0) return true;
      const minPrice = Math.min(...pVariants.map((v) => v.price));
      return minPrice <= maxPrice;
    });

    // 6. Sorting Logic
    if (sortOption === "price-low") {
      result.sort((a, b) => {
        const aPrice = Math.min(...variants.filter((v) => v.productId === a.id).map((v) => v.price));
        const bPrice = Math.min(...variants.filter((v) => v.productId === b.id).map((v) => v.price));
        return aPrice - bPrice;
      });
    } else if (sortOption === "price-high") {
      result.sort((a, b) => {
        const aPrice = Math.min(...variants.filter((v) => v.productId === a.id).map((v) => v.price));
        const bPrice = Math.min(...variants.filter((v) => v.productId === b.id).map((v) => v.price));
        return bPrice - aPrice;
      });
    } else if (sortOption === "rating") {
      result.sort((a, b) => b.ratingCache - a.ratingCache);
    }

    return result;
  };

  const filteredProductsList = getFilteredProducts();

  // SEO JSON-LD Breadcrumb List
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    "itemListElement": [
      {
        "@type": "ListItem",
        "position": 1,
        "name": "Home",
        "item": "https://safesnack.in"
      },
      {
        "@type": "ListItem",
        "position": 2,
        "name": "Products",
        "item": "https://safesnack.in/products"
      }
    ]
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-6">
      {/* Baked-in SEO Schema */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      {/* Header Row */}
      <div className="text-left space-y-2 border-b border-border pb-6">
        <h1 className="font-display font-black text-3xl sm:text-4xl text-text tracking-tight">
          Explore Our Guilt-Free Catalog
        </h1>
        <p className="text-xs sm:text-sm text-text-muted max-w-xl">
          Browse clean snacks curated for glycemic stability. Use the search bar to find ingredients, tags, or specific medical dietary objectives.
        </p>
      </div>

      {/* Search Bar & Mobile Filters Toggle */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <input
            type="text"
            placeholder="Search by ingredient (e.g. almond), goal (e.g. keto), or name..."
            value={searchVal}
            onChange={handleSearchChange}
            className="w-full text-xs bg-surface/10 border border-border rounded-xl py-3 pl-11 pr-4 text-text placeholder-charcoal/40 focus:outline-none focus:border-primary focus:ring-1 focus:ring-forest/30"
          />
          <SlidersHorizontal size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-text-muted" />
        </div>

        <div className="flex gap-2">
          {/* Sorting */}
          <div className="relative">
            <select
              value={sortOption}
              onChange={(e) => setSortOption(e.target.value)}
              className="text-xs bg-background border border-border rounded-xl px-4 py-3 text-text focus:outline-none focus:border-primary cursor-pointer appearance-none pr-8"
            >
              <option value="popular">Popularity</option>
              <option value="rating">Top Rated</option>
              <option value="price-low">Price: Low to High</option>
              <option value="price-high">Price: High to Low</option>
            </select>
            <ArrowUpDown size={14} className="absolute right-3.5 top-1/2 -translate-y-1/2 text-text-muted pointer-events-none" />
          </div>

          <Button
            variant="outline"
            className="md:hidden flex items-center gap-1.5 py-3 px-4 text-xs cursor-pointer"
            onClick={() => setShowMobileFilters(!showMobileFilters)}
          >
            Filters
          </Button>

          {(selectedBrand || selectedCategory || selectedTag || searchVal || maxPrice < 1000) && (
            <Button
              variant="ghost"
              onClick={handleClearFilters}
              className="flex items-center gap-1 py-3 px-4 text-xs text-clay hover:text-clay cursor-pointer"
            >
              <RefreshCw size={13} />
              Reset
            </Button>
          )}
        </div>
      </div>

      {/* Main Content Area */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-8 items-start">
        
        {/* Sidebar Filters (Desktop) */}
        <aside className="hidden md:block md:col-span-3 space-y-6 bg-background border border-border p-6 rounded-2xl">
          
          {/* Tag Goal Filter */}
          <div className="space-y-2">
            <h4 className="text-xs font-bold uppercase tracking-wider text-text-muted">Dietary Goals</h4>
            <div className="space-y-1">
              {[
                { label: "All Goals", val: "" },
                { label: "Diabetic Friendly", val: "diabetic-friendly" },
                { label: "Keto / Low-Carb", val: "keto" },
                { label: "Sugar-Free", val: "sugar-free" },
                { label: "High Protein", val: "high-protein" },
                { label: "Vegan", val: "vegan" },
                { label: "Kids Snack", val: "kids" },
              ].map((t) => (
                <button
                  key={t.val}
                  onClick={() => setSelectedTag(t.val)}
                  className={`w-full text-left text-xs py-1.5 px-2 rounded-lg transition-colors cursor-pointer block ${
                    selectedTag === t.val
                      ? "bg-primary text-background font-medium"
                      : "text-text/70 hover:bg-surface/40 hover:text-text"
                  }`}
                >
                  {t.label}
                </button>
              ))}
            </div>
          </div>

          {/* Brand Filter */}
          <div className="space-y-2">
            <h4 className="text-xs font-bold uppercase tracking-wider text-text-muted">Brands</h4>
            <div className="space-y-1">
              <button
                onClick={() => setSelectedBrand("")}
                className={`w-full text-left text-xs py-1.5 px-2 rounded-lg transition-colors cursor-pointer block ${
                  selectedBrand === ""
                    ? "bg-primary text-background font-medium"
                    : "text-text/70 hover:bg-surface/40 hover:text-text"
                }`}
              >
                All Brands
              </button>
              {brands.map((b) => (
                <button
                  key={b.id}
                  onClick={() => setSelectedBrand(b.id)}
                  className={`w-full text-left text-xs py-1.5 px-2 rounded-lg transition-colors cursor-pointer flex items-center justify-between ${
                    selectedBrand === b.id
                      ? "bg-primary text-background font-medium"
                      : "text-text/70 hover:bg-surface/40 hover:text-text"
                  }`}
                >
                  <span>{b.name}</span>
                  {b.isHouseBrand && (
                    <span className="bg-clay text-background text-[9px] font-bold px-1.5 py-0.5 rounded-full uppercase tracking-wide">
                      Original
                    </span>
                  )}
                </button>
              ))}
            </div>
          </div>

          {/* Category Filter */}
          <div className="space-y-2">
            <h4 className="text-xs font-bold uppercase tracking-wider text-text-muted">Categories</h4>
            <div className="space-y-1">
              <button
                onClick={() => setSelectedCategory("")}
                className={`w-full text-left text-xs py-1.5 px-2 rounded-lg transition-colors cursor-pointer block ${
                  selectedCategory === ""
                    ? "bg-primary text-background font-medium"
                    : "text-text/70 hover:bg-surface/40 hover:text-text"
                }`}
              >
                All Categories
              </button>
              {categories.map((c) => (
                <button
                  key={c.id}
                  onClick={() => setSelectedCategory(c.id)}
                  className={`w-full text-left text-xs py-1.5 px-2 rounded-lg transition-colors cursor-pointer block ${
                    selectedCategory === c.id
                      ? "bg-primary text-background font-medium"
                      : "text-text/70 hover:bg-surface/40 hover:text-text"
                  }`}
                >
                  {c.name}
                </button>
              ))}
            </div>
          </div>

          {/* Price Range Filter */}
          <div className="space-y-3">
            <div className="flex justify-between items-center text-xs">
              <h4 className="font-bold uppercase tracking-wider text-text-muted">Max Price</h4>
              <span className="font-bold text-text">₹{maxPrice}</span>
            </div>
            <input
              type="range"
              min="50"
              max="1000"
              step="20"
              value={maxPrice}
              onChange={(e) => setMaxPrice(parseInt(e.target.value))}
              className="w-full h-1.5 bg-sage rounded-lg appearance-none cursor-pointer accent-forest focus:outline-none"
            />
          </div>

        </aside>

        {/* Mobile Filters Drawer Overlay */}
        {showMobileFilters && (
          <div className="fixed inset-0 z-50 flex md:hidden">
            <div className="fixed inset-0 bg-text/40" onClick={() => setShowMobileFilters(false)} />
            <div className="relative w-full max-w-xs bg-background h-full shadow-2xl p-6 overflow-y-auto z-10 flex flex-col justify-between">
              <div className="space-y-6">
                <div className="flex items-center justify-between border-b border-border pb-3">
                  <h3 className="font-display font-bold text-base text-text">Filter Catalog</h3>
                  <button onClick={() => setShowMobileFilters(false)} className="text-text-muted">✕</button>
                </div>
                
                {/* Goals */}
                <div className="space-y-2">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-text-muted">Dietary Goals</h4>
                  <div className="flex flex-wrap gap-1">
                    {["diabetic-friendly", "keto", "sugar-free", "high-protein", "vegan", "kids"].map((t) => (
                      <button
                        key={t}
                        onClick={() => setSelectedTag(selectedTag === t ? "" : t)}
                        className={`text-[11px] px-3 py-1 rounded-full border transition-all ${
                          selectedTag === t
                            ? "bg-primary text-background border-primary"
                            : "bg-transparent text-text-muted border-border"
                        }`}
                      >
                        {t}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Brands */}
                <div className="space-y-2">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-text-muted">Brands</h4>
                  <div className="space-y-1">
                    {brands.map((b) => (
                      <button
                        key={b.id}
                        onClick={() => setSelectedBrand(selectedBrand === b.id ? "" : b.id)}
                        className={`w-full text-left text-xs py-1.5 px-2 rounded-lg transition-colors flex items-center justify-between ${
                          selectedBrand === b.id ? "bg-primary text-background font-medium" : "text-text/70"
                        }`}
                      >
                        <span>{b.name}</span>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Categories */}
                <div className="space-y-2">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-text-muted">Categories</h4>
                  <div className="space-y-1">
                    {categories.map((c) => (
                      <button
                        key={c.id}
                        onClick={() => setSelectedCategory(selectedCategory === c.id ? "" : c.id)}
                        className={`w-full text-left text-xs py-1.5 px-2 rounded-lg transition-colors ${
                          selectedCategory === c.id ? "bg-primary text-background font-medium" : "text-text/70"
                        }`}
                      >
                        {c.name}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Price */}
                <div className="space-y-2">
                  <div className="flex justify-between items-center text-xs">
                    <h4 className="font-bold uppercase tracking-wider text-text-muted">Max Price</h4>
                    <span className="font-bold text-text">₹{maxPrice}</span>
                  </div>
                  <input
                    type="range"
                    min="50"
                    max="1000"
                    step="20"
                    value={maxPrice}
                    onChange={(e) => setMaxPrice(parseInt(e.target.value))}
                    className="w-full h-1.5 bg-sage rounded-lg appearance-none cursor-pointer accent-forest"
                  />
                </div>
              </div>

              <Button variant="primary" className="w-full mt-8 cursor-pointer" onClick={() => setShowMobileFilters(false)}>
                Apply Filters
              </Button>
            </div>
          </div>
        )}

        {/* Product Grid Area */}
        <div className="md:col-span-9 space-y-6">
          {filteredProductsList.length === 0 ? (
            <div className="text-center py-20 bg-surface/10 border border-border rounded-2xl p-8 space-y-4">
              <AlertCircle size={32} className="text-clay mx-auto" />
              <h3 className="font-display font-extrabold text-lg text-text">No Snacks Matched</h3>
              <p className="text-xs text-text-muted max-w-sm mx-auto leading-relaxed">
                We couldn't find any snacks matching your filter configuration. Try looking for different ingredients or clearing search queries.
              </p>
              <div className="pt-2">
                <Button variant="outline" className="text-xs py-2 px-5 cursor-pointer" onClick={handleClearFilters}>
                  Clear All Filters
                </Button>
              </div>
            </div>
          ) : (
            <>
              {/* Active Filter Badges */}
              <div className="flex flex-wrap items-center gap-2 text-xs text-text-muted">
                <span className="font-semibold text-text/70">Found {filteredProductsList.length} items</span>
                {searchVal && (
                  <span className="bg-surface/40 px-2.5 py-1 rounded-full border border-sage flex items-center gap-1.5 text-[10px]">
                    Search: "{searchVal}"
                    <button onClick={() => setSearchVal("")} className="hover:text-rose-700 cursor-pointer">✕</button>
                  </span>
                )}
                {selectedTag && (
                  <span className="bg-surface/40 px-2.5 py-1 rounded-full border border-sage flex items-center gap-1.5 text-[10px]">
                    Goal: {selectedTag}
                    <button onClick={() => setSelectedTag("")} className="hover:text-rose-700 cursor-pointer">✕</button>
                  </span>
                )}
                {selectedBrand && (
                  <span className="bg-surface/40 px-2.5 py-1 rounded-full border border-sage flex items-center gap-1.5 text-[10px]">
                    Brand: {brands.find(b => b.id === selectedBrand)?.name}
                    <button onClick={() => setSelectedBrand("")} className="hover:text-rose-700 cursor-pointer">✕</button>
                  </span>
                )}
                {selectedCategory && (
                  <span className="bg-surface/40 px-2.5 py-1 rounded-full border border-sage flex items-center gap-1.5 text-[10px]">
                    Category: {categories.find(c => c.id === selectedCategory)?.name}
                    <button onClick={() => setSelectedCategory("")} className="hover:text-rose-700 cursor-pointer">✕</button>
                  </span>
                )}
              </div>

              {/* Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredProductsList.map((product) => (
                  <ProductCard
                    key={product.id}
                    product={product}
                    variants={variants.filter((v) => v.productId === product.id)}
                    brand={brands.find((b) => b.id === product.brandId)!}
                  />
                ))}
              </div>
            </>
          )}
        </div>

      </div>
    </div>
  );
}

export default function CatalogPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
      </div>
    }>
      <CatalogContent />
    </Suspense>
  );
}
