"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { ShoppingBag, Search, User, Menu, X, Sparkles, Filter, Shield, Check } from "lucide-react";
import { CartProvider, useCart } from "@/lib/context/cart-context";
import { CartDrawer } from "@/components/store/cart-drawer";
import { MockDatabase, Product } from "@/lib/db/mock-db";

const Header: React.FC = () => {
  const pathname = usePathname();
  const router = useRouter();
  const { cart, setIsCartOpen } = useCart();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  
  // Search Autocomplete State
  const [searchQuery, setSearchQuery] = useState("");
  const [searchFocus, setSearchFocus] = useState(false);
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [matchingProducts, setMatchingProducts] = useState<Product[]>([]);

  // Local state for role quick switcher
  const [userRole, setUserRole] = useState<string>("CUSTOMER");

  useEffect(() => {
    MockDatabase.init();
    setUserRole(MockDatabase.getProfile().role);
  }, [pathname]);

  // Handle live search suggestions based on ingredients, tags, or name
  useEffect(() => {
    if (!searchQuery.trim()) {
      setSuggestions([]);
      setMatchingProducts([]);
      return;
    }

    const q = searchQuery.toLowerCase();
    const products = MockDatabase.getProducts();

    // 1. Gather matching keywords
    const keywords: string[] = [];
    if ("diabetic".includes(q)) keywords.push("diabetic-friendly");
    if ("sugar".includes(q) || "free".includes(q)) keywords.push("sugar-free");
    if ("keto".includes(q)) keywords.push("keto");
    if ("protein".includes(q)) keywords.push("high-protein");
    if ("kids".includes(q)) keywords.push("kids");
    if ("beet".includes(q) || "chip".includes(q)) keywords.push("beetroot chips");

    // 2. Gather matched products
    const matched = products.filter(
      (p) =>
        p.name.toLowerCase().includes(q) ||
        p.description.toLowerCase().includes(q) ||
        p.dietaryTags.some((t) => t.toLowerCase().includes(q)) ||
        p.featuredIngredients.some((i) => i.toLowerCase().includes(q))
    );

    setSuggestions(keywords.slice(0, 3));
    setMatchingProducts(matched.slice(0, 4));
  }, [searchQuery]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchQuery.trim()) return;

    // Log Search Analytics
    MockDatabase.logEvent({
      type: "SEARCH",
      sessionId: "demo-session",
      metadata: searchQuery
    });

    setSearchFocus(false);
    router.push(`/products?search=${encodeURIComponent(searchQuery)}`);
  };

  const handleSuggestionClick = (keyword: string) => {
    setSearchQuery(keyword);
    setSearchFocus(false);
    router.push(`/products?search=${encodeURIComponent(keyword)}`);
  };

  const switchRole = (role: "CUSTOMER" | "STAFF" | "ADMIN") => {
    const profile = MockDatabase.getProfile();
    profile.role = role;
    MockDatabase.updateProfile(profile);
    setUserRole(role);
    router.refresh();
  };

  const goals = [
    { name: "Diabetic-Friendly", tag: "diabetic-friendly", emoji: "🍎" },
    { name: "Keto / Low-Carb", tag: "keto", emoji: "🥑" },
    { name: "High Protein", tag: "high-protein", emoji: "💪" },
    { name: "Sugar-Free", tag: "sugar-free", emoji: "🌿" },
    { name: "Kids Healthy", tag: "kids", emoji: "🧸" },
  ];

  return (
    <header className="sticky top-0 z-40 bg-background/90 backdrop-blur-xl border-b border-border transition-all">
      {/* Top Banner */}
      <div className="bg-primary text-background text-center py-2 px-4 text-[10px] font-bold uppercase tracking-wider border-b border-accent/15">
        ✨ Hyderabad Hub Express: Madhapur, Gachibowli, Jubilee Hills dispatches in 45 mins!
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 sm:h-20">
          
          {/* Logo */}
          <div className="flex items-center gap-10">
            <Link href="/" className="flex items-center gap-2 group cursor-pointer">
              <span className="font-display font-black text-xl sm:text-2xl text-primary tracking-tight group-hover:text-accent transition-colors">
                SafeSnack
              </span>
              <span className="font-sans text-[8px] font-bold uppercase tracking-widest bg-accent/10 text-accent border border-accent/25 px-2.5 py-0.5 rounded-full">
                Originals
              </span>
            </Link>

            {/* Desktop Menu links */}
            <nav className="hidden lg:flex items-center gap-8 text-xs font-bold uppercase tracking-wider text-text/70">
              <Link href="/products" className={`hover:text-accent transition-colors ${pathname === "/products" ? "text-accent border-b-2 border-accent pb-1" : ""}`}>
                All Snacks
              </Link>
              <Link href="/bundles" className={`hover:text-accent transition-colors ${pathname === "/bundles" ? "text-accent border-b-2 border-accent pb-1" : ""}`}>
                Curated Packs
              </Link>
              
              <div className="relative group">
                <button className="flex items-center gap-1.5 hover:text-accent transition-colors cursor-pointer pb-1 font-bold">
                  Shop By Diet
                  <Filter size={10} className="text-accent" />
                </button>
                <div className="absolute top-full left-0 mt-2 w-56 bg-background border border-border shadow-xl rounded-2xl py-2 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-300 z-50 transform translate-y-1 group-hover:translate-y-0">
                  {goals.map((g) => (
                    <Link
                      key={g.tag}
                      href={`/products?tag=${g.tag}`}
                      className="flex items-center gap-3 px-4 py-2.5 text-xs font-semibold text-text/60 hover:bg-surface hover:text-primary transition-colors"
                    >
                      <span>{g.emoji}</span>
                      <span>{g.name}</span>
                    </Link>
                  ))}
                </div>
              </div>
            </nav>
          </div>

          {/* Search bar & Actions */}
          <div className="flex items-center gap-5 flex-1 justify-end max-w-xl lg:ml-8">
            
            {/* Search Input Container */}
            <form onSubmit={handleSearchSubmit} className="relative flex-1 hidden md:block max-w-xs group">
              <input
                type="text"
                placeholder="Search almond, keto, stevia..."
                value={searchQuery}
                onFocus={() => setSearchFocus(true)}
                onBlur={() => setTimeout(() => setSearchFocus(false), 250)}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full text-xs bg-surface/60 border border-border rounded-full py-2.5 pl-10 pr-4 text-text placeholder-text-muted focus:outline-none focus:border-accent focus:ring-1 focus:ring-accent/20 focus:bg-background transition-all duration-300"
              />
              <Search size={13} className="absolute left-4 top-1/2 -translate-y-1/2 text-text-muted group-focus-within:text-accent transition-colors" />

              {/* Autocomplete Dropdown */}
              {searchFocus && (suggestions.length > 0 || matchingProducts.length > 0) && (
                <div className="absolute top-full left-0 right-0 mt-3 bg-background border border-border shadow-2xl rounded-2xl p-4 z-50 text-left animate-fade-in">
                  {suggestions.length > 0 && (
                    <div className="mb-4">
                      <span className="text-[9px] text-text-muted font-bold uppercase tracking-wider block">Recommended Diets</span>
                      <div className="flex flex-wrap gap-1.5 mt-2">
                        {suggestions.map((s) => (
                          <button
                            key={s}
                            type="button"
                            onClick={() => handleSuggestionClick(s)}
                            className="text-[10px] bg-accent/10 hover:bg-accent/20 text-accent font-bold px-3 py-1 rounded-full cursor-pointer transition-colors"
                          >
                            #{s}
                          </button>
                        ))}
                      </div>
                    </div>
                  )}

                  {matchingProducts.length > 0 && (
                    <div>
                      <span className="text-[9px] text-text-muted font-bold uppercase tracking-wider block border-b border-border pb-1.5 mb-2">Matched Snacks</span>
                      <div className="space-y-2">
                        {matchingProducts.map((p) => (
                          <Link
                            key={p.id}
                            href={`/products/${p.slug}`}
                            className="flex items-center gap-3 p-1.5 hover:bg-surface rounded-xl transition-colors cursor-pointer"
                          >
                            <img src={p.images.primary} alt={p.name} className="w-8 h-8 rounded-lg object-cover border border-border" />
                            <div className="text-xs">
                              <span className="font-bold text-text block line-clamp-1">{p.name}</span>
                              <span className="text-[9px] text-accent font-bold uppercase block tracking-wider mt-0.5">{p.dietaryTags[0]}</span>
                            </div>
                          </Link>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}
            </form>

            {/* Quick Switch Demo Role Toggler Capsule */}
            <div className="hidden sm:flex items-center gap-1 bg-surface p-1 rounded-full text-[9px] font-bold uppercase tracking-wider border border-border">
              <button
                onClick={() => switchRole("CUSTOMER")}
                className={`px-3 py-1 rounded-full cursor-pointer transition-all duration-300 ${userRole === "CUSTOMER" ? "bg-primary text-background shadow-sm" : "text-text-muted hover:text-text"}`}
              >
                Buyer
              </button>
              <button
                onClick={() => switchRole("STAFF")}
                className={`px-3 py-1 rounded-full cursor-pointer transition-all duration-300 ${userRole === "STAFF" ? "bg-primary text-background shadow-sm" : "text-text-muted hover:text-text"}`}
              >
                Staff
              </button>
              <button
                onClick={() => switchRole("ADMIN")}
                className={`px-3 py-1 rounded-full cursor-pointer transition-all duration-300 ${userRole === "ADMIN" ? "bg-primary text-background shadow-sm" : "text-text-muted hover:text-text"}`}
              >
                Admin
              </button>
            </div>

            {/* Actions Grid */}
            <div className="flex items-center gap-2">
              {/* Shopping Cart Button */}
              <button
                onClick={() => setIsCartOpen(true)}
                className="relative p-2.5 text-primary hover:text-accent transition-colors cursor-pointer bg-surface hover:bg-accent/10 rounded-full border border-border"
                aria-label="Open Shopping Cart"
              >
                <ShoppingBag size={18} />
                {cart.length > 0 && (
                  <span className="absolute -top-1 -right-1 w-4 h-4 bg-accent text-background text-[8px] font-black rounded-full flex items-center justify-center animate-pulse">
                    {cart.reduce((sum, item) => sum + item.qty, 0)}
                  </span>
                )}
              </button>

              {/* Portal shortcuts */}
              {userRole === "ADMIN" && (
                <Link href="/admin" className="p-2.5 text-accent hover:bg-accent/10 transition-colors rounded-full border border-border cursor-pointer" title="Admin Analytics">
                  <Sparkles size={18} />
                </Link>
              )}
              {userRole === "STAFF" && (
                <Link href="/staff" className="p-2.5 text-accent-hover hover:bg-accent/10 transition-colors rounded-full border border-border cursor-pointer" title="Staff Fulfillment">
                  <Shield size={18} />
                </Link>
              )}

              {/* Account Icon */}
              <Link
                href="/orders"
                className="p-2.5 text-primary hover:bg-surface transition-colors rounded-full border border-border cursor-pointer"
                title="Customer Orders"
              >
                <User size={18} />
              </Link>
            </div>

            {/* Mobile menu toggle */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2.5 text-primary hover:text-accent lg:hidden cursor-pointer border border-border rounded-full"
            >
              {mobileMenuOpen ? <X size={18} /> : <Menu size={18} />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Drawer menu */}
      {mobileMenuOpen && (
        <div className="lg:hidden border-t border-border bg-background p-5 space-y-4 animate-fade-in">
          {/* Quick Switch Role Switcher */}
          <div className="flex items-center justify-between border-b border-border pb-3 text-xs">
            <span className="text-text-muted font-bold uppercase tracking-wider">Demo Role:</span>
            <div className="flex gap-1 bg-surface p-1 rounded-full border border-border">
              {["CUSTOMER", "STAFF", "ADMIN"].map((r) => (
                <button
                  key={r}
                  onClick={() => switchRole(r as any)}
                  className={`px-3 py-1 rounded-full text-[9px] font-bold uppercase cursor-pointer transition-all ${userRole === r ? "bg-primary text-background font-semibold" : "text-text-muted"}`}
                >
                  {r}
                </button>
              ))}
            </div>
          </div>
          
          <nav className="flex flex-col gap-3 text-xs font-bold uppercase tracking-wider">
            <Link href="/products" onClick={() => setMobileMenuOpen(false)} className="hover:text-accent py-1 block border-b border-border/50">
              All Snacks
            </Link>
            <Link href="/bundles" onClick={() => setMobileMenuOpen(false)} className="hover:text-accent py-1 block border-b border-border/50">
              Curated Packs
            </Link>
            <div className="py-2">
              <span className="text-[10px] text-text-muted font-bold block mb-2">Dietary Objectives</span>
              <div className="grid grid-cols-2 gap-2 pt-1">
                {goals.map((g) => (
                  <Link
                    key={g.tag}
                    href={`/products?tag=${g.tag}`}
                    onClick={() => setMobileMenuOpen(false)}
                    className="flex items-center gap-2 px-3 py-2 bg-surface border border-border rounded-xl text-[10px] text-text hover:bg-accent/10 hover:text-primary"
                  >
                    <span>{g.emoji}</span>
                    <span>{g.name}</span>
                  </Link>
                ))}
              </div>
            </div>
          </nav>
        </div>
      )}
    </header>
  );
};

const Footer: React.FC = () => {
  return (
    <footer className="bg-primary text-background border-t border-accent/15 mt-auto">
      {/* Trust bar */}
      <div className="border-b border-accent/10 bg-primary-hover/40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 grid grid-cols-1 sm:grid-cols-3 gap-6 text-center sm:text-left text-xs font-bold uppercase tracking-wider text-accent">
          <div className="flex items-center justify-center sm:justify-start gap-3">
            <span className="text-xl">🌿</span>
            <div>
              <span className="block text-background">100% Clean Ingredients</span>
              <span className="text-[9px] text-background/45 block font-normal normal-case mt-0.5">No added sugar, artificial sweeteners or chemical preservatives</span>
            </div>
          </div>
          <div className="flex items-center justify-center sm:justify-start gap-3 border-t sm:border-t-0 sm:border-x border-accent/10 py-4 sm:py-0 sm:px-6">
            <span className="text-xl">⚡</span>
            <div>
              <span className="block text-background">45-Minute Hyderabad Dispatch</span>
              <span className="text-[9px] text-background/45 block font-normal normal-case mt-0.5">Dispatched fresh from our Madhapur micro-fulfillment center</span>
            </div>
          </div>
          <div className="flex items-center justify-center sm:justify-start gap-3 border-t sm:border-t-0 pt-4 sm:pt-0 sm:pl-6">
            <span className="text-xl">🩺</span>
            <div>
              <span className="block text-background">Diabetic Friendly Certs</span>
              <span className="text-[9px] text-background/45 block font-normal normal-case mt-0.5">Laboratory tested glycemic curves for low glucose spikes</span>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-10">
          {/* Brand block */}
          <div className="space-y-4">
            <h4 className="font-display font-black text-2xl tracking-tight text-accent">
              SafeSnack
            </h4>
            <p className="text-xs text-background/55 max-w-xs leading-relaxed font-medium">
              Crafting premium health foods that keep blood glucose stable. Proudly born in Hyderabad, supplying guilt-free snacks across the city.
            </p>
            <div className="text-[9px] font-bold uppercase tracking-widest text-primary bg-accent px-3.5 py-1.5 rounded-full inline-block">
              🍃 Lab Verified Glycemic Impact
            </div>
          </div>

          {/* Customer links */}
          <div>
            <h5 className="text-xs font-bold uppercase tracking-widest text-accent mb-4">Shop Collections</h5>
            <ul className="space-y-3 text-xs text-background/65 font-semibold">
              <li><Link href="/products" className="hover:text-accent transition-colors">All Products</Link></li>
              <li><Link href="/products?brand=safesnack-originals" className="hover:text-accent transition-colors">SafeSnack Originals</Link></li>
              <li><Link href="/bundles" className="hover:text-accent transition-colors">Functional Curated Bundles</Link></li>
              <li><Link href="/products?tag=keto" className="hover:text-accent transition-colors">Keto Range</Link></li>
              <li><Link href="/products?tag=diabetic-friendly" className="hover:text-accent transition-colors">Diabetic-Friendly Diet</Link></li>
            </ul>
          </div>

          {/* Quick links */}
          <div>
            <h5 className="text-xs font-bold uppercase tracking-widest text-accent mb-4">Customer Care</h5>
            <ul className="space-y-3 text-xs text-background/65 font-semibold">
              <li><Link href="/orders" className="hover:text-accent transition-colors">Track Active Orders</Link></li>
              <li><Link href="/products" className="hover:text-accent transition-colors">Verified Lab Curves</Link></li>
              <li><span className="opacity-60">Hyderabad Delivery Areas (Madhapur, Hitech City, Gachibowli, Jubilee Hills)</span></li>
              <li><a href="https://wa.me/919848012345" target="_blank" rel="noreferrer" className="text-success hover:underline font-bold">WhatsApp Order Support</a></li>
            </ul>
          </div>

          {/* Demo shortcuts */}
          <div>
            <h5 className="text-xs font-bold uppercase tracking-widest text-accent mb-4">Demo Admin Controls</h5>
            <ul className="space-y-3 text-xs font-bold">
              <li><Link href="/admin" className="hover:text-accent transition-colors text-accent flex items-center gap-1.5">✨ Admin Analytics & CMS</Link></li>
              <li><Link href="/staff" className="hover:text-accent transition-colors text-success flex items-center gap-1.5">💼 Staff Fulfillment Queue</Link></li>
              <li><Link href="/orders" className="hover:text-accent transition-colors font-medium">Customer Dashboard</Link></li>
              <li>
                <button
                  onClick={() => {
                    MockDatabase.init(true);
                    window.location.reload();
                  }}
                  className="text-amber-400 hover:underline cursor-pointer text-left uppercase text-[10px]"
                >
                  🔄 Reset Mock Database Seed
                </button>
              </li>
            </ul>
          </div>
        </div>

        <div className="border-t border-accent/10 mt-12 pt-8 flex flex-col sm:flex-row items-center justify-between text-[10px] text-background/35 font-semibold tracking-wider uppercase">
          <span>&copy; 2026 SafeSnack Originals. All rights reserved.</span>
          <div className="flex gap-6 mt-3 sm:mt-0">
            <span>Secure TLS</span>
            <span>FEFO Batch Allocator</span>
            <span>Razorpay Gateway</span>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default function StoreLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <CartProvider>
      <div className="flex flex-col min-h-screen bg-background text-text">
        <Header />
        <main className="flex-1 flex flex-col">{children}</main>
        <Footer />
        <CartDrawer />
      </div>
    </CartProvider>
  );
}
