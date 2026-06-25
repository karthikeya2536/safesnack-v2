"use client";

import React, { useState } from "react";
import Link from "next/link";
import { Star, Plus, ShieldCheck } from "lucide-react";
import { Product, Variant, Brand } from "@/lib/db/mock-db";
import { useCart } from "@/lib/context/cart-context";
import { Button } from "./button";

interface ProductCardProps {
  product: Product;
  variants: Variant[];
  brand: Brand;
}

export const ProductCard: React.FC<ProductCardProps> = ({ product, variants, brand }) => {
  const { addToCart } = useCart();
  const [selectedVariant, setSelectedVariant] = useState<Variant>(variants[0] || null);

  const getDietaryTagStyle = (tag: string) => {
    switch (tag) {
      case "diabetic-friendly":
        return "bg-accent/10 text-accent border-accent/20";
      case "keto":
        return "bg-success/10 text-success border-success/20";
      case "sugar-free":
        return "bg-success/10 text-success border-success/20";
      case "vegan":
        return "bg-success/8 text-success border-success/15";
      case "high-protein":
        return "bg-accent/10 text-accent-hover border-accent/20";
      case "kids":
        return "bg-accent/8 text-accent border-accent/15";
      default:
        return "bg-surface text-text-muted border-border";
    }
  };

  const handleAddToCart = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (!selectedVariant) return;

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

  return (
    <div className="group relative bg-background border border-border rounded-3xl overflow-hidden hover:shadow-xl hover:shadow-accent/8 hover:border-accent hover:-translate-y-1.5 transition-all duration-500 flex flex-col h-full animate-fade-in-up">
      {/* Product Images (Dual-image hover zoom) */}
      <Link href={`/products/${product.slug}`} className="block relative aspect-square overflow-hidden cursor-pointer bg-surface border-b border-border">
        
        {/* House Brand Indicator Badge */}
        {brand.isHouseBrand && (
          <div className="absolute top-4 left-4 z-10 flex items-center gap-1 bg-primary text-background text-[9px] font-bold px-3 py-1 rounded-full uppercase tracking-wider shadow-md border border-accent/20">
            <ShieldCheck size={11} className="text-accent" />
            Original
          </div>
        )}
        
        {/* Primary Image */}
        <img
          src={product.images.primary}
          alt={product.name}
          className="w-full h-full object-cover transition-transform duration-700 ease-out group-hover:scale-105 group-hover:opacity-0"
          loading="lazy"
        />
        {/* Hover Image */}
        <img
          src={product.images.hover}
          alt={`${product.name} alternate view`}
          className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 ease-out opacity-0 scale-102 group-hover:scale-105 group-hover:opacity-100"
          loading="lazy"
        />
      </Link>

      {/* Info Content */}
      <div className="p-5 flex-1 flex flex-col justify-between text-left">
        <div>
          {/* Brand */}
          <span className="text-[9px] uppercase tracking-widest text-accent font-bold">
            {brand.name}
          </span>

          {/* Title */}
          <Link href={`/products/${product.slug}`} className="block mt-1">
            <h4 className="font-display font-bold text-base text-text group-hover:text-accent transition-colors duration-300 line-clamp-1">
              {product.name}
            </h4>
          </Link>

          {/* Star Rating */}
          <div className="flex items-center gap-1.5 mt-1.5 text-[10px] font-bold">
            <div className="flex text-accent">
              <Star size={11} fill="currentColor" className="stroke-none" />
            </div>
            <span className="text-text/80">{product.ratingCache}</span>
            <span className="text-text-muted font-normal">({product.reviewCount})</span>
          </div>

          {/* Dietary Tags */}
          <div className="flex flex-wrap gap-1 mt-3">
            {product.dietaryTags.slice(0, 3).map((tag) => (
              <span
                key={tag}
                className={`text-[9px] font-bold uppercase tracking-wider px-2 py-0.5 rounded border ${getDietaryTagStyle(
                  tag
                )}`}
              >
                {tag.replace("-friendly", "")}
              </span>
            ))}
          </div>
        </div>

        {/* Variants Selection & Price & CTA */}
        <div className="mt-5 pt-4 border-t border-border">
          {/* Variants pill selector (only if multiple variants exist) */}
          {variants.length > 1 && (
            <div className="flex gap-1.5 mb-3 overflow-x-auto no-scrollbar py-0.5">
              {variants.map((v) => (
                <button
                  key={v.id}
                  onClick={() => setSelectedVariant(v)}
                  className={`text-[9px] font-bold uppercase tracking-wider px-3 py-1 rounded-full border transition-all cursor-pointer whitespace-nowrap ${
                    selectedVariant.id === v.id
                      ? "border-primary bg-primary text-background shadow-sm"
                      : "border-border hover:border-accent/40 text-text-muted hover:text-text bg-transparent"
                  }`}
                >
                  {v.label}
                </button>
              ))}
            </div>
          )}

          {/* Price & Add to Cart Row */}
          <div className="flex items-center justify-between gap-2 mt-auto">
            <div>
              {selectedVariant.compareAtPrice && (
                <span className="text-[10px] font-bold text-text-muted line-through block leading-tight">
                  ₹{selectedVariant.compareAtPrice}
                </span>
              )}
              <span className="font-display font-black text-lg text-text block">
                ₹{selectedVariant.price}
              </span>
            </div>

            <Button
              variant="primary"
              size="sm"
              onClick={handleAddToCart}
              className="flex items-center gap-1.5 py-2 px-4 shadow-lg hover:shadow-accent/10 cursor-pointer font-bold text-[10px] uppercase tracking-wider"
            >
              <Plus size={12} className="stroke-[3]" />
              Add
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};
