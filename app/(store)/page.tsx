"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { ShieldCheck, Heart, Zap, Sparkles, HelpCircle, Star, ArrowRight, BookOpen, Quote, ShieldAlert } from "lucide-react";
import { MockDatabase, Product, Variant, Brand, HomepageCms } from "@/lib/db/mock-db";
import { ProductCard } from "@/components/ui/product-card";
import { Button } from "@/components/ui/button";

export default function HomePage() {
  const [cms, setCms] = useState<HomepageCms | null>(null);
  const [originals, setOriginals] = useState<{ product: Product; variants: Variant[]; brand: Brand }[]>([]);
  const [bestSellers, setBestSellers] = useState<{ product: Product; variants: Variant[]; brand: Brand }[]>([]);
  const [activeFaq, setActiveFaq] = useState<number | null>(null);

  // Client-side scroll reveal observer
  useEffect(() => {
    if (!cms) return;
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("opacity-100", "translate-y-0");
            entry.target.classList.remove("opacity-0", "translate-y-12");
          }
        });
      },
      { threshold: 0.05 }
    );

    const elements = document.querySelectorAll(".scroll-reveal");
    elements.forEach((el) => observer.observe(el));

    return () => {
      elements.forEach((el) => observer.unobserve(el));
    };
  }, [cms, originals, bestSellers]);

  useEffect(() => {
    MockDatabase.init();
    const cmsData = MockDatabase.getCms();
    setCms(cmsData);

    const allProducts = MockDatabase.getProducts();
    const allVariants = MockDatabase.getVariants();
    const allBrands = MockDatabase.getBrands();

    // originals (brand-1)
    const originalsBrand = allBrands.find(b => b.id === "brand-1");
    if (originalsBrand) {
      const origList = allProducts
        .filter(p => p.brandId === originalsBrand.id && p.isActive)
        .map(p => ({
          product: p,
          variants: allVariants.filter(v => v.productId === p.id),
          brand: originalsBrand
        }));
      setOriginals(origList.slice(0, 4));
    }

    // Best Sellers (ranked by ratingCache descending)
    const sellers = [...allProducts]
      .filter(p => p.isActive)
      .sort((a, b) => b.ratingCache - a.ratingCache)
      .slice(0, 4)
      .map(p => ({
        product: p,
        variants: allVariants.filter(v => v.productId === p.id),
        brand: allBrands.find(b => b.id === p.brandId)!
      }));
    setBestSellers(sellers);
  }, []);

  if (!cms) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="w-8 h-8 border-4 border-accent border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  const goals = [
    { name: "Diabetic Friendly", desc: "Tested glycemic curves", tag: "diabetic-friendly", emoji: "🍎", color: "bg-accent/8 border-accent/15" },
    { name: "Keto / Low-Carb", desc: "Net carbs under 2g", tag: "keto", emoji: "🥑", color: "bg-success/8 border-success/15" },
    { name: "High Protein", desc: "Grass-fed formulations", tag: "high-protein", emoji: "💪", color: "bg-accent-hover/8 border-accent-hover/15" },
    { name: "Sugar-Free", desc: "No maltitol or spikes", tag: "sugar-free", emoji: "🌿", color: "bg-success/8 border-success/15" },
    { name: "Kids Healthy", desc: "Tooth-friendly sweeteners", tag: "kids", emoji: "🧸", color: "bg-accent/8 border-accent/15" },
  ];

  const faqs = [
    {
      q: "Are SafeSnack products truly safe for diabetics?",
      a: "Yes, absolutely! We explicitly avoid maltitol, dextrose, or hidden high-glycemic sweeteners. SafeSnack products are sweetened using only pure, organic stevia, erythritol, and monkfruit which do not cause spikes in blood glucose levels. We routinely test our formulations to ensure stable glycemic responses."
    },
    {
      q: "What makes SafeSnack Originals different from other healthy snacks?",
      a: "Most 'health brands' in India co-pack or outsource manufacturing using cheap fillers like refined wheat flour (Maida) or palm oil. SafeSnack Originals are made in our dedicated kitchen in Hyderabad using premium whole grains (Ragi, millets), blanched almond flour, and organic cold-pressed oils. Our products are vacuum-baked under 80°C to lock in nutrients."
    },
    {
      q: "How does the pincode delivery system work?",
      a: "We operate a dedicated delivery kitchen in Hyderabad. During checkout (or in the cart drawer), you can enter your Hyderabad pincode (such as 500081 for Madhapur, 500032 for Gachibowli). If you meet the minimum order requirement for your zone, we dispatch via express delivery, getting fresh snacks to you in 30-60 minutes!"
    },
    {
      q: "Do you ship outside of Hyderabad?",
      a: "While our express hot-food and fresh dessert options are Hyderabad-exclusive, our dry packaged snacks (Beetroot chips, Ragi crisps, Dark chocolates, and oats) can be shipped pan-India within 3-5 business days."
    }
  ];

  const whyChooseUs = [
    {
      title: "No Maltitol, No Exceptions",
      desc: "Many 'sugar-free' chocolates use Maltitol, which has a glycemic index of 35 and causes insulin spikes. We exclusively use Stevia, Erythritol, and Monkfruit (GI of 0).",
      icon: <ShieldCheck className="text-success" size={20} />
    },
    {
      title: "FEFO Freshness Guarantee",
      desc: "We track batches using First-Expiry-First-Out (FEFO). You will never receive stale stock. Any batch within 15 days of expiry is automatically discounted or removed from our inventory.",
      icon: <Sparkles className="text-accent" size={20} />
    },
    {
      title: "Guilt-Free Ingredient Transparency",
      desc: "We share our full recipe origin story, ingredients list, and high-fidelity nutritional labels for every product so you can read exactly what goes into your body.",
      icon: <Heart className="text-accent-hover" size={20} />
    }
  ];

  return (
    <div className="space-y-24 sm:space-y-32 pb-24">
      
      {/* Dynamic Hero Section */}
      <section className="relative overflow-hidden bg-surface/50 border-b border-border py-20 sm:py-28">
        {/* Soft background glow — very subtle */}
        <div className="absolute top-0 right-0 w-[400px] h-[400px] bg-accent/[0.04] rounded-full blur-[100px] -z-10 pointer-events-none"></div>
        <div className="absolute bottom-0 left-0 w-[300px] h-[300px] bg-primary/[0.03] rounded-full blur-[80px] -z-10 pointer-events-none"></div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16 items-center">
            
            {/* Hero Text */}
            <div className="lg:col-span-7 space-y-8 text-left">
              <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-accent/10 border border-accent/20 text-accent text-[9px] font-bold uppercase tracking-widest animate-fade-in">
                <Sparkles size={11} className="animate-spin" style={{ animationDuration: '3s' }} />
                Hyderabad's Premium Health Brand
              </div>
              
              <div className="space-y-4">
                <h1 className="font-display font-black text-4xl sm:text-5xl lg:text-6xl text-text tracking-tight leading-[1.05]">
                  <span className="clip-text-parent">
                    <span className="clip-text-child">{cms.heroTitle.split(" ").slice(0, 3).join(" ")}</span>
                  </span>
                  <br />
                  <span className="clip-text-parent">
                    <span className="clip-text-child text-primary">{cms.heroTitle.split(" ").slice(3).join(" ")}</span>
                  </span>
                </h1>
                <p className="text-sm sm:text-base text-text-muted leading-relaxed max-w-xl font-medium">
                  {cms.heroSubtitle}
                </p>
              </div>

              <div className="flex flex-col sm:flex-row gap-4 pt-4">
                <Link href={cms.heroCtaLink}>
                  <Button variant="primary" size="lg" className="w-full sm:w-auto font-bold text-xs uppercase tracking-wider flex items-center justify-center gap-2.5 cursor-pointer shadow-xl hover:shadow-accent/15 transition-all duration-300">
                    {cms.heroCtaText}
                    <ArrowRight size={14} />
                  </Button>
                </Link>
                <Link href="/bundles">
                  <Button variant="outline" size="lg" className="w-full sm:w-auto font-bold text-xs uppercase tracking-wider cursor-pointer hover:bg-surface transition-colors">
                    Explore Curated Packs
                  </Button>
                </Link>
              </div>
            </div>

            {/* Hero Image Frame */}
            <div className="lg:col-span-5 relative mt-6 lg:mt-0">
              <div className="absolute inset-0 bg-accent/8 rounded-[2.5rem] transform rotate-3 scale-102 -z-10 border border-accent/15 blur-xs"></div>
              <div className="absolute inset-0 bg-primary/[0.04] rounded-[2.5rem] transform -rotate-2 scale-99 -z-10 border border-primary/10"></div>
              
              <div className="relative border border-border p-2.5 rounded-[2.5rem] bg-surface/60 shadow-2xl overflow-hidden group">
                <img
                  src={cms.heroImage}
                  alt="SafeSnack premium baked chips and diabetic friendly chocolates"
                  className="w-full aspect-[4/3] object-cover rounded-[2rem] border border-border transition-transform duration-700 ease-out group-hover:scale-103"
                />
                
                {/* Floating Micro-Badge */}
                <div className="absolute bottom-6 left-6 bg-text/92 backdrop-blur-md border border-accent/20 p-4 rounded-2xl flex items-center gap-3 shadow-2xl animate-bounce" style={{ animationDuration: '4s' }}>
                  <span className="text-xl">🌿</span>
                  <div className="text-left">
                    <span className="font-bold text-[10px] text-accent uppercase tracking-wider block">Lab Verified</span>
                    <span className="text-[9px] text-background/75 block font-semibold mt-0.5">0% Added Glycemic Load</span>
                  </div>
                </div>
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* Shop By Goal Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12 scroll-reveal opacity-0 translate-y-12 transition-all duration-700 ease-out">
        <div className="text-center max-w-xl mx-auto space-y-3">
          <span className="text-[9px] font-bold text-accent uppercase tracking-widest">Select Your Diet Target</span>
          <h2 className="font-display font-black text-3xl text-text tracking-tight">
            Shop By Health Target
          </h2>
          <p className="text-xs sm:text-sm text-text-muted leading-relaxed font-medium">
            Choose your health target. We automatically filter the snacks and ingredients suited for your metabolic path.
          </p>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-5 gap-5">
          {goals.map((g, index) => (
            <Link
              key={g.tag}
              href={`/products?tag=${g.tag}`}
              className="group relative block rounded-3xl border border-border bg-background p-6 text-center cursor-pointer transition-all duration-300 hover:shadow-xl hover:border-accent hover:-translate-y-1"
              style={{ animationDelay: `${index * 75}ms` }}
            >
              {/* Hover glow indicator */}
              <div className="absolute inset-0 rounded-3xl border border-accent opacity-0 group-hover:opacity-100 scale-95 group-hover:scale-100 transition-all duration-300 pointer-events-none"></div>

              <div className={`w-14 h-14 ${g.color} rounded-2xl flex items-center justify-center text-2xl mx-auto mb-4 border group-hover:scale-110 transition-all duration-300`}>
                {g.emoji}
              </div>
              
              <h3 className="font-display font-bold text-sm text-text group-hover:text-primary transition-colors">
                {g.name}
              </h3>
              <p className="text-[9px] text-text-muted font-semibold uppercase tracking-wider mt-1.5">
                {g.desc}
              </p>
            </Link>
          ))}
        </div>
      </section>

      {/* SafeSnack Originals Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-10 scroll-reveal opacity-0 translate-y-12 transition-all duration-700 ease-out">
        <div className="flex flex-col sm:flex-row items-start sm:items-end justify-between gap-4 border-b border-border pb-6">
          <div className="space-y-1 text-left">
            <span className="text-[9px] font-bold text-accent uppercase tracking-widest block">Crafted in Hyderabad</span>
            <h2 className="font-display font-black text-3xl text-text tracking-tight">
              SafeSnack Originals
            </h2>
            <p className="text-xs text-text-muted font-medium">
              Freshly prepared in our organic kitchen. High-nutrition formulas with absolute premium ingredients.
            </p>
          </div>
          <Link href="/products?brand=safesnack-originals" className="text-xs font-bold uppercase tracking-wider text-primary hover:text-accent transition-colors flex items-center gap-1.5 cursor-pointer">
            Explore Originals
            <ArrowRight size={14} className="text-accent" />
          </Link>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {originals.map(({ product, variants, brand }) => (
            <ProductCard
              key={product.id}
              product={product}
              variants={variants}
              brand={brand}
            />
          ))}
        </div>
      </section>

      {/* Why SafeSnack Section — Dark panel with Deep Forest background */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 scroll-reveal opacity-0 translate-y-12 transition-all duration-700 ease-out">
        <div className="bg-primary border border-accent/20 rounded-[2.5rem] p-8 sm:p-14 text-background shadow-2xl relative overflow-hidden">
          <div className="absolute right-0 top-0 bottom-0 w-1/3 bg-accent/[0.04] skew-x-12 translate-x-20 pointer-events-none"></div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16 items-center">
            
            <div className="lg:col-span-5 space-y-6 text-left">
              <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-accent/10 border border-accent/25 text-accent text-[9px] font-bold uppercase tracking-widest">
                🔬 Scientific Integrity
              </div>
              <h2 className="font-display font-black text-3xl sm:text-4xl text-background tracking-tight leading-tight">
                Crafted for Metabolic Stability
              </h2>
              <p className="text-xs sm:text-sm text-background/70 leading-relaxed font-medium">
                Health snacks should build your body up, not wear down your pancreas. SafeSnack is co-developed with clinical dieticians to ensure glycemic index levels are as close to zero as possible.
              </p>
              <div className="pt-2">
                <Link href="/products">
                  <Button variant="outline" className="text-xs font-bold uppercase tracking-wider py-2.5 px-6 border-accent/35 text-accent hover:bg-accent/10 hover:text-background cursor-pointer">
                    Explore Ingredients Matrix
                  </Button>
                </Link>
              </div>
            </div>
            
            <div className="lg:col-span-7 space-y-6">
              {whyChooseUs.map((w, index) => (
                <div key={index} className="flex gap-4 p-5 bg-background/[0.04] border border-accent/12 rounded-2xl hover:border-accent/30 transition-colors duration-300">
                  <div className="w-10 h-10 bg-accent/10 border border-accent/25 rounded-xl flex items-center justify-center shadow-sm shrink-0">
                    {w.icon}
                  </div>
                  <div className="text-left">
                    <h4 className="font-display font-bold text-sm text-accent">{w.title}</h4>
                    <p className="text-xs text-background/70 mt-1.5 leading-relaxed font-medium">{w.desc}</p>
                  </div>
                </div>
              ))}
            </div>

          </div>
        </div>
      </section>

      {/* Best Sellers Showcase */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-10 scroll-reveal opacity-0 translate-y-12 transition-all duration-700 ease-out">
        <div className="flex flex-col sm:flex-row items-start sm:items-end justify-between gap-4 border-b border-border pb-6">
          <div className="space-y-1 text-left">
            <span className="text-[9px] font-bold text-accent uppercase tracking-widest block">Customer Favorites</span>
            <h2 className="font-display font-black text-3xl text-text tracking-tight">
              Top Rated Best Sellers
            </h2>
            <p className="text-xs text-text-muted font-medium">
              Top-performing snacks based on verified clinical customer feedback.
            </p>
          </div>
          <Link href="/products" className="text-xs font-bold uppercase tracking-wider text-primary hover:text-accent transition-colors flex items-center gap-1.5 cursor-pointer">
            Explore All Snacks
            <ArrowRight size={14} className="text-accent" />
          </Link>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {bestSellers.map(({ product, variants, brand }) => (
            <ProductCard
              key={product.id}
              product={product}
              variants={variants}
              brand={brand}
            />
          ))}
        </div>
      </section>

      {/* Science Article Banner — Charcoal panel */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 scroll-reveal opacity-0 translate-y-12 transition-all duration-700 ease-out">
        <div className="relative overflow-hidden bg-text border border-accent/20 rounded-[2.5rem] text-background p-8 sm:p-14 shadow-2xl">
          <div className="absolute right-0 top-0 bottom-0 w-1/3 bg-accent/[0.05] skew-x-12 translate-x-20 pointer-events-none"></div>
          
          <div className="max-w-2xl space-y-6 text-left relative z-10">
            <span className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-accent/10 border border-accent/25 text-accent text-[9px] font-bold uppercase tracking-widest">
              <BookOpen size={11} className="text-accent" />
              Nutritional Sciences
            </span>
            <h3 className="font-display font-black text-2xl sm:text-3xl lg:text-4xl text-background tracking-tight leading-snug">
              Why Your Afternoon Snack Triggers Brain Fog & Energy Crashes
            </h3>
            <p className="text-xs sm:text-sm text-background/70 leading-relaxed font-medium">
              When you eat typical potato chips or sweetened biscuits, your blood sugar spikes, forcing a large insulin release. Within 90 minutes, your blood sugar crashes below baseline. This leads to lethargy, brain fog, and intense sugar cravings. By choosing snacks high in dietary fibers and zero-GI sweeteners, you enjoy stable, continuous energy.
            </p>
            <div className="pt-2">
              <Link href="/products?tag=diabetic-friendly">
                <Button variant="outline" className="text-xs font-bold uppercase tracking-wider py-2.5 px-6 border-accent text-accent hover:bg-accent hover:text-text cursor-pointer">
                  Shop Low Glycemic Range
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Featured Partner Brands */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-10 scroll-reveal opacity-0 translate-y-12 transition-all duration-700 ease-out">
        <div className="text-center max-w-xl mx-auto space-y-3">
          <span className="text-[9px] font-bold text-accent uppercase tracking-widest">Curated Marketplace</span>
          <h2 className="font-display font-black text-3xl text-text tracking-tight">
            Featured Partner Brands
          </h2>
          <p className="text-xs text-text-muted leading-relaxed font-medium">
            We partner only with brands who submit full lab analysis testing records. Strict zero-added-sugar enforcement.
          </p>
        </div>

        <div className="grid grid-cols-3 gap-6 max-w-3xl mx-auto items-center">
          {MockDatabase.getBrands().filter(b => b.id !== "brand-1").map((b) => (
            <Link
              key={b.id}
              href={`/products?brand=${b.slug}`}
              className="flex items-center justify-center p-8 bg-surface/50 border border-border rounded-3xl hover:border-accent hover:bg-background transition-all duration-300 cursor-pointer text-center group shadow-xs"
            >
              <span className="font-display font-black text-sm sm:text-base text-text-muted group-hover:text-primary transition-colors tracking-wide">
                {b.logo}
              </span>
            </Link>
          ))}
        </div>
      </section>

      {/* Testimonials */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-10 scroll-reveal opacity-0 translate-y-12 transition-all duration-700 ease-out">
        <div className="text-center max-w-xl mx-auto space-y-3">
          <span className="text-[9px] font-bold text-accent uppercase tracking-widest font-sans">Verified Customer Logs</span>
          <h2 className="font-display font-black text-3xl text-text tracking-tight">
            Loved by Health Achievers
          </h2>
          <p className="text-xs text-text-muted font-medium">
            Read stories from individuals managing diabetes, keto diets, and busy lifestyles.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {MockDatabase.getReviews().slice(0, 3).map((r) => (
            <div key={r.id} className="bg-surface/50 border border-border rounded-3xl p-8 flex flex-col justify-between shadow-sm relative group hover:border-accent transition-all duration-300">
              <Quote size={24} className="text-accent/20 absolute top-6 right-6" />
              
              <div className="space-y-4">
                <div className="flex gap-1 text-accent">
                  {Array.from({ length: r.rating }).map((_, i) => (
                    <Star key={i} size={13} fill="currentColor" className="stroke-none" />
                  ))}
                </div>
                <div className="space-y-2 text-left">
                  <h4 className="font-display font-bold text-sm text-text">
                    &ldquo;{r.title}&rdquo;
                  </h4>
                  <p className="text-xs text-text-muted leading-relaxed font-medium italic">
                    {r.body}
                  </p>
                </div>
              </div>

              <div className="mt-6 pt-4 border-t border-border flex items-center justify-between text-[10px] text-text-muted">
                <span className="font-bold text-text">{r.userName}</span>
                {r.verifiedPurchase && (
                  <span className="text-success bg-success/10 border border-success/20 px-3 py-1 rounded-full font-bold uppercase tracking-wider text-[8px]">
                    Verified Buyer
                  </span>
                )}
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* FAQ Accordion Section */}
      <section className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8 scroll-reveal opacity-0 translate-y-12 transition-all duration-700 ease-out">
        <div className="text-center space-y-2">
          <span className="text-[9px] font-bold text-accent uppercase tracking-widest font-sans">Common Inquiries</span>
          <h2 className="font-display font-black text-3xl text-text tracking-tight">
            Frequently Answered
          </h2>
        </div>

        <div className="space-y-4">
          {faqs.map((f, i) => (
            <div
              key={i}
              className="bg-surface/40 border border-border rounded-2xl overflow-hidden transition-all duration-300 hover:border-accent/30"
            >
              <button
                onClick={() => setActiveFaq(activeFaq === i ? null : i)}
                className="w-full text-left px-6 py-4.5 flex items-center justify-between font-display font-bold text-xs sm:text-sm text-text hover:bg-surface cursor-pointer transition-colors"
              >
                <span className="flex items-center gap-3">
                  <HelpCircle size={15} className="text-accent shrink-0" />
                  {f.q}
                </span>
                <span className="text-sm font-black text-accent/50 leading-none">
                  {activeFaq === i ? "−" : "+"}
                </span>
              </button>
              
              {activeFaq === i && (
                <div className="px-6 pb-5 pt-2 text-xs text-text-muted border-t border-border leading-relaxed font-medium bg-surface/30 animate-fade-in text-left">
                  {f.a}
                </div>
              )}
            </div>
          ))}
        </div>
      </section>

      {/* CTA Footer Promo Banner */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 scroll-reveal opacity-0 translate-y-12 transition-all duration-700 ease-out">
        <div className="bg-accent/8 border border-accent/20 rounded-[2.5rem] p-8 sm:p-16 text-center space-y-6 shadow-xl relative overflow-hidden">
          {/* Subtle background overlay */}
          <div className="absolute inset-0 bg-accent/[0.03] pointer-events-none"></div>

          <span className="inline-block bg-accent text-background text-[9px] font-bold px-4 py-1.5 rounded-full uppercase tracking-widest">
            Special Promo Code
          </span>
          
          <h3 className="font-display font-black text-2xl sm:text-4xl text-text max-w-xl mx-auto leading-tight">
            Try SafeSnack Today. Save 15% On Your First Order.
          </h3>
          
          <p className="text-xs text-text-muted font-semibold max-w-md mx-auto">
            Use code <strong className="text-accent bg-accent/10 px-2 py-0.5 rounded font-mono font-bold">SUGARFREE</strong> at checkout for 15% discount on all orders over ₹400. Express delivery within Hyderabad.
          </p>
          
          <div className="pt-2">
            <Link href="/products">
              <Button variant="primary" size="lg" className="font-bold text-xs uppercase tracking-wider cursor-pointer shadow-lg hover:shadow-accent/10">
                Order Now
              </Button>
            </Link>
          </div>
        </div>
      </section>

    </div>
  );
}
