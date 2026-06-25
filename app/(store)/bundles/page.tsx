"use client";

import React, { useEffect, useState } from "react";
import { Sparkles, Plus, Gift, CheckCircle, ShieldCheck } from "lucide-react";
import { MockDatabase, Bundle, Variant, Product } from "@/lib/db/mock-db";
import { useCart } from "@/lib/context/cart-context";
import { Button } from "@/components/ui/button";

export default function BundlesPage() {
  const { addToCart } = useCart();
  const [bundles, setBundles] = useState<Bundle[]>([]);
  const [variants, setVariants] = useState<Variant[]>([]);
  const [products, setProducts] = useState<Product[]>([]);

  useEffect(() => {
    MockDatabase.init();
    setBundles(MockDatabase.getBundles().filter(b => b.isActive));
    setVariants(MockDatabase.getVariants());
    setProducts(MockDatabase.getProducts());
  }, []);

  const handleAddBundle = (bundle: Bundle) => {
    addToCart({
      id: bundle.id,
      bundleId: bundle.id,
      price: bundle.price,
      name: bundle.name,
      image: bundle.images[0] || "https://images.unsplash.com/photo-1512621776951-a57141f2eefd?q=80&w=600&fit=crop",
      isBundle: true,
    });
  };

  const getVariantDetail = (variantId: string) => {
    const v = variants.find(variant => variant.id === variantId);
    if (!v) return null;
    const p = products.find(prod => prod.id === v.productId);
    return {
      name: p ? p.name : "Healthy Snack",
      label: v.label,
      image: p ? p.images.primary : ""
    };
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8 text-left animate-fade-in">
      
      {/* Header Banner */}
      <div className="border-b border-border pb-6 space-y-2">
        <span className="inline-flex items-center gap-1 bg-[#B5704D]/10 text-clay text-[10px] font-bold px-3 py-1 rounded-full uppercase tracking-wider">
          <Gift size={12} />
          High-Value Bundles (Save 20-30%)
        </span>
        <h1 className="font-display font-black text-3xl sm:text-4xl text-text tracking-tight leading-tight">
          Curated Functional Snack Boxes
        </h1>
        <p className="text-xs sm:text-sm text-text-muted max-w-xl">
          Purchase combined packs tailored for specific metabolic goals. Increasing average order value (AOV) while saving you money.
        </p>
      </div>

      {/* Bundles Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {bundles.map((bundle) => (
          <div
            key={bundle.id}
            className="group bg-background border border-border rounded-3xl overflow-hidden hover:shadow-md hover:border-sage transition-all duration-300 flex flex-col justify-between"
          >
            <div>
              {/* Photo Banner */}
              <div className="aspect-[2/1] w-full relative overflow-hidden bg-surface/10">
                <div className="absolute top-4 left-4 z-10 flex gap-1.5">
                  {bundle.dietaryTags.map((tag) => (
                    <span
                      key={tag}
                      className="bg-primary text-background text-[9px] font-bold px-2.5 py-1 rounded-full uppercase tracking-wider shadow-xs"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
                <img
                  src={bundle.images[0]}
                  alt={bundle.name}
                  className="w-full h-full object-cover transition-transform duration-500 ease-out group-hover:scale-102"
                />
              </div>

              {/* Text Description */}
              <div className="p-6 sm:p-8 space-y-4">
                <h3 className="font-display font-black text-xl sm:text-2xl text-text tracking-tight group-hover:text-primary transition-colors">
                  {bundle.name}
                </h3>
                <p className="text-xs text-text-muted leading-relaxed">
                  {bundle.description}
                </p>

                {/* Bundle Box Composition */}
                <div className="space-y-2.5 pt-2">
                  <h4 className="text-[10px] font-bold uppercase tracking-wider text-text-muted">
                    What's Inside This Pack:
                  </h4>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                    {bundle.items.map((item, i) => {
                      const details = getVariantDetail(item.variantId);
                      if (!details) return null;
                      return (
                        <div
                          key={i}
                          className="flex items-center gap-2.5 bg-surface/10 border border-sage/35 p-2 rounded-xl"
                        >
                          <img src={details.image} className="w-8 h-8 rounded object-cover" />
                          <div className="leading-tight">
                            <span className="font-bold text-text block line-clamp-1">
                              {details.name}
                            </span>
                            <span className="text-text-muted text-[10px]">
                              {item.qty} &times; {details.label}
                            </span>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
            </div>

            {/* Price & Buy Action */}
            <div className="p-6 sm:px-8 sm:pb-8 pt-0 mt-auto border-t border-border flex items-center justify-between gap-4">
              <div>
                <span className="text-xs text-text-muted line-through block">
                  Value: ₹{bundle.compareAtPrice}
                </span>
                <span className="font-display font-black text-xl text-text block">
                  ₹{bundle.price}
                </span>
                <span className="text-[10px] text-primary-800 font-semibold uppercase tracking-wider mt-0.5 block">
                  Save ₹{bundle.compareAtPrice - bundle.price}!
                </span>
              </div>

              <Button
                onClick={() => handleAddBundle(bundle)}
                variant="accent"
                size="md"
                className="py-3 px-6 font-bold flex items-center gap-2 cursor-pointer shadow-xs"
              >
                <Plus size={16} />
                Add Pack to Cart
              </Button>
            </div>

          </div>
        ))}
      </div>

      {/* Trust banner */}
      <section className="bg-surface/10 border border-border rounded-3xl p-6 sm:p-8 flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 bg-background border border-sage/80 rounded-2xl flex items-center justify-center text-xl shrink-0">
            🌿
          </div>
          <div>
            <h4 className="font-display font-bold text-sm text-text">Original Custom Formulations</h4>
            <p className="text-xs text-text-muted mt-0.5">All bundles are packed under FEFO batch audits to guarantee maximum freshness.</p>
          </div>
        </div>
        <div className="flex gap-2">
          <span className="flex items-center gap-1 text-[10px] bg-background border border-sage/80 px-3 py-1 rounded-full text-text-muted">
            <CheckCircle size={12} className="text-primary" /> Zero Sugar
          </span>
          <span className="flex items-center gap-1 text-[10px] bg-background border border-sage/80 px-3 py-1 rounded-full text-text-muted">
            <CheckCircle size={12} className="text-primary" /> Diabetic Tested
          </span>
        </div>
      </section>

    </div>
  );
}
