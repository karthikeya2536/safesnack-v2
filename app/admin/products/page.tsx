"use client";

import React, { useEffect, useState } from "react";
import { Edit2, Plus, Trash2, CheckCircle, XCircle, Tag, Layers, Database } from "lucide-react";
import { MockDatabase, Product, Variant, Bundle, Brand, Category } from "@/lib/db/mock-db";
import { Button } from "@/components/ui/button";

export default function AdminProductsCrud() {
  const [activeTab, setActiveTab] = useState<"products" | "bundles">("products");
  
  // Database States
  const [products, setProducts] = useState<Product[]>([]);
  const [variants, setVariants] = useState<Variant[]>([]);
  const [bundles, setBundles] = useState<Bundle[]>([]);
  const [brands, setBrands] = useState<Brand[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);

  // Selected Item for Editing
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [selectedBundle, setSelectedBundle] = useState<Bundle | null>(null);

  // Form toggles
  const [showProductForm, setShowProductForm] = useState(false);
  const [showBundleForm, setShowBundleForm] = useState(false);

  // Product Form State
  const [productForm, setProductForm] = useState({
    id: "",
    name: "",
    slug: "",
    description: "",
    brandId: "brand-1",
    categoryId: "cat-1",
    dietaryTags: [] as string[],
    benefits: "",
    story: "",
    featuredIngredients: "",
    servingSuggestions: "",
    images: {
      primary: "",
      hover: "",
      gallery: "",
      lifestyle: "",
      nutrition: "",
      ingredients: ""
    },
    isActive: true
  });

  // Bundle Form State
  const [bundleForm, setBundleForm] = useState({
    id: "",
    name: "",
    slug: "",
    description: "",
    price: 0,
    compareAtPrice: 0,
    images: "",
    dietaryTags: [] as string[],
    isActive: true
  });

  useEffect(() => {
    MockDatabase.init();
    refreshData();
  }, []);

  const refreshData = () => {
    setProducts(MockDatabase.getProducts());
    setVariants(MockDatabase.getVariants());
    setBundles(MockDatabase.getBundles());
    setBrands(MockDatabase.getBrands());
    setCategories(MockDatabase.getCategories());
  };

  // Open product editor
  const handleEditProduct = (p: Product) => {
    setSelectedProduct(p);
    setProductForm({
      id: p.id,
      name: p.name,
      slug: p.slug,
      description: p.description,
      brandId: p.brandId,
      categoryId: p.categoryId,
      dietaryTags: p.dietaryTags,
      benefits: p.benefits.join("\n"),
      story: p.story,
      featuredIngredients: p.featuredIngredients.join(", "),
      servingSuggestions: p.servingSuggestions.join("\n"),
      images: {
        primary: p.images.primary,
        hover: p.images.hover,
        gallery: p.images.gallery.join(", "),
        lifestyle: p.images.lifestyle,
        nutrition: p.images.nutrition,
        ingredients: p.images.ingredients
      },
      isActive: p.isActive
    });
    setShowProductForm(true);
  };

  const handleNewProduct = () => {
    setSelectedProduct(null);
    setProductForm({
      id: `prod-${Math.random().toString(36).substr(2, 9)}`,
      name: "",
      slug: "",
      description: "",
      brandId: "brand-1",
      categoryId: "cat-1",
      dietaryTags: ["sugar-free", "diabetic-friendly"],
      benefits: "",
      story: "",
      featuredIngredients: "",
      servingSuggestions: "",
      images: {
        primary: "https://images.unsplash.com/photo-1628268909376-e8c44bb3153f?q=80&w=600&fit=crop",
        hover: "https://images.unsplash.com/photo-1512621776951-a57141f2eefd?q=80&w=600&fit=crop",
        gallery: "https://images.unsplash.com/photo-1628268909376-e8c44bb3153f?q=80&w=600&fit=crop",
        lifestyle: "https://images.unsplash.com/photo-1540420773420-3366772f4999?q=80&w=600&fit=crop",
        nutrition: "https://images.unsplash.com/photo-1505576399279-565b52d4ac71?q=80&w=600&fit=crop",
        ingredients: "https://images.unsplash.com/photo-1607305387299-a3d9611cd46f?q=80&w=600&fit=crop"
      },
      isActive: true
    });
    setShowProductForm(true);
  };

  const handleProductSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    const benefitsList = productForm.benefits.split("\n").filter(b => b.trim());
    const ingredientsList = productForm.featuredIngredients.split(",").map(i => i.trim()).filter(Boolean);
    const suggestionsList = productForm.servingSuggestions.split("\n").filter(s => s.trim());
    const galleryList = productForm.images.gallery.split(",").map(g => g.trim()).filter(Boolean);

    const savedProduct: Product = {
      id: productForm.id,
      name: productForm.name,
      slug: productForm.slug || productForm.name.toLowerCase().replace(/[^a-z0-9]+/g, "-"),
      description: productForm.description,
      brandId: productForm.brandId,
      categoryId: productForm.categoryId,
      dietaryTags: productForm.dietaryTags as any,
      benefits: benefitsList,
      story: productForm.story,
      featuredIngredients: ingredientsList,
      servingSuggestions: suggestionsList,
      images: {
        primary: productForm.images.primary,
        hover: productForm.images.hover,
        gallery: galleryList.length > 0 ? galleryList : [productForm.images.primary],
        lifestyle: productForm.images.lifestyle,
        nutrition: productForm.images.nutrition,
        ingredients: productForm.images.ingredients
      },
      isActive: productForm.isActive,
      ratingCache: selectedProduct ? selectedProduct.ratingCache : 4.8,
      reviewCount: selectedProduct ? selectedProduct.reviewCount : 1,
      relatedProducts: selectedProduct ? selectedProduct.relatedProducts : [],
      frequentlyBoughtTogether: selectedProduct ? selectedProduct.frequentlyBoughtTogether : []
    };

    MockDatabase.saveProduct(savedProduct);
    
    // Also save a default variant if it's a new product
    const pVariants = MockDatabase.getVariants().filter(v => v.productId === savedProduct.id);
    if (pVariants.length === 0) {
      MockDatabase.saveVariant({
        id: `var-${Math.random().toString(36).substr(2, 9)}`,
        productId: savedProduct.id,
        label: "100g Pack",
        price: 199,
        compareAtPrice: 249,
        sku: `SS-${savedProduct.slug.substring(0,4).toUpperCase()}-100G`
      });
    }

    setShowProductForm(false);
    refreshData();
  };

  // Open bundle editor
  const handleEditBundle = (b: Bundle) => {
    setSelectedBundle(b);
    setBundleForm({
      id: b.id,
      name: b.name,
      slug: b.slug,
      description: b.description,
      price: b.price,
      compareAtPrice: b.compareAtPrice,
      images: b.images.join(", "),
      dietaryTags: b.dietaryTags,
      isActive: b.isActive
    });
    setShowBundleForm(true);
  };

  const handleNewBundle = () => {
    setSelectedBundle(null);
    setBundleForm({
      id: `bundle-${Math.random().toString(36).substr(2, 9)}`,
      name: "",
      slug: "",
      description: "",
      price: 499,
      compareAtPrice: 650,
      images: "https://images.unsplash.com/photo-1512621776951-a57141f2eefd?q=80&w=600&fit=crop",
      dietaryTags: ["sugar-free"],
      isActive: true
    });
    setShowBundleForm(true);
  };

  const handleBundleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const savedBundle: Bundle = {
      id: bundleForm.id,
      name: bundleForm.name,
      slug: bundleForm.slug || bundleForm.name.toLowerCase().replace(/[^a-z0-9]+/g, "-"),
      description: bundleForm.description,
      price: Number(bundleForm.price),
      compareAtPrice: Number(bundleForm.compareAtPrice),
      images: bundleForm.images.split(",").map(i => i.trim()).filter(Boolean),
      dietaryTags: bundleForm.dietaryTags,
      items: selectedBundle ? selectedBundle.items : [], // Keep existing items for mock simplicity
      isActive: bundleForm.isActive
    };

    MockDatabase.saveBundle(savedBundle);
    setShowBundleForm(false);
    refreshData();
  };

  const handleDietaryTagToggle = (tag: string, formType: "product" | "bundle") => {
    if (formType === "product") {
      const active = [...productForm.dietaryTags];
      const idx = active.indexOf(tag);
      if (idx >= 0) active.splice(idx, 1);
      else active.push(tag);
      setProductForm({ ...productForm, dietaryTags: active });
    } else {
      const active = [...bundleForm.dietaryTags];
      const idx = active.indexOf(tag);
      if (idx >= 0) active.splice(idx, 1);
      else active.push(tag);
      setBundleForm({ ...bundleForm, dietaryTags: active });
    }
  };

  return (
    <div className="space-y-8 text-left animate-fade-in">
      
      {/* Page Header */}
      <div className="flex justify-between items-end">
        <div>
          <h1 className="font-display font-black text-2xl sm:text-3xl text-text tracking-tight">
            Inventory & Catalog CRUD
          </h1>
          <p className="text-xs text-text-muted mt-1">
            Update descriptions, ingredients lists, pricing variants, and healthy bundles.
          </p>
        </div>
        
        {activeTab === "products" ? (
          <Button onClick={handleNewProduct} variant="primary" className="flex items-center gap-1.5 py-2.5 px-5 cursor-pointer text-xs">
            <Plus size={16} />
            New Product
          </Button>
        ) : (
          <Button onClick={handleNewBundle} variant="primary" className="flex items-center gap-1.5 py-2.5 px-5 cursor-pointer text-xs">
            <Plus size={16} />
            New Bundle
          </Button>
        )}
      </div>

      {/* Tabs */}
      <div className="flex border-b border-border">
        <button
          onClick={() => setActiveTab("products")}
          className={`px-5 py-3 text-xs font-bold uppercase tracking-wider border-b-2 transition-all cursor-pointer flex items-center gap-2 ${
            activeTab === "products" ? "border-primary text-primary font-semibold" : "border-transparent text-text-muted"
          }`}
        >
          <Database size={14} />
          Products & Variants
        </button>
        <button
          onClick={() => setActiveTab("bundles")}
          className={`px-5 py-3 text-xs font-bold uppercase tracking-wider border-b-2 transition-all cursor-pointer flex items-center gap-2 ${
            activeTab === "bundles" ? "border-primary text-primary font-semibold" : "border-transparent text-text-muted"
          }`}
        >
          <Layers size={14} />
          Healthy Bundles
        </button>
      </div>

      {/* List Views */}
      {activeTab === "products" ? (
        <div className="bg-background border border-border rounded-2xl overflow-hidden shadow-xs">
          <div className="overflow-x-auto">
            <table className="w-full text-xs text-left">
              <thead>
                <tr className="bg-surface/15 border-b border-border text-text-muted font-bold uppercase tracking-wider">
                  <th className="p-4">Name</th>
                  <th className="p-4">Brand</th>
                  <th className="p-4">Category</th>
                  <th className="p-4">Rating</th>
                  <th className="p-4">Status</th>
                  <th className="p-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-sage/40">
                {products.map((p) => {
                  const pBrand = brands.find(b => b.id === p.brandId);
                  const pCat = categories.find(c => c.id === p.categoryId);
                  return (
                    <tr key={p.id} className="hover:bg-surface/5">
                      <td className="p-4 font-bold text-text flex items-center gap-2.5">
                        <img src={p.images.primary} className="w-8 h-8 rounded object-cover" />
                        {p.name}
                      </td>
                      <td className="p-4">{pBrand?.name}</td>
                      <td className="p-4">{pCat?.name}</td>
                      <td className="p-4">⭐ {p.ratingCache} ({p.reviewCount})</td>
                      <td className="p-4">
                        {p.isActive ? (
                          <span className="text-success bg-success/10 border border-success/20 px-2 py-0.5 rounded-full font-bold flex items-center gap-1 w-fit text-[10px]">
                            <CheckCircle size={10} /> Active
                          </span>
                        ) : (
                          <span className="text-rose-700 bg-rose-50 border border-rose-100 px-2 py-0.5 rounded-full font-bold flex items-center gap-1 w-fit text-[10px]">
                            <XCircle size={10} /> Inactive
                          </span>
                        )}
                      </td>
                      <td className="p-4 text-right">
                        <Button
                          onClick={() => handleEditProduct(p)}
                          variant="outline"
                          size="sm"
                          className="py-1 px-3.5 hover:shadow-none cursor-pointer text-[10px]"
                        >
                          <Edit2 size={10} className="mr-1" /> Edit
                        </Button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        <div className="bg-background border border-border rounded-2xl overflow-hidden shadow-xs">
          <div className="overflow-x-auto">
            <table className="w-full text-xs text-left">
              <thead>
                <tr className="bg-surface/15 border-b border-border text-text-muted font-bold uppercase tracking-wider">
                  <th className="p-4">Bundle Box Name</th>
                  <th className="p-4">Price</th>
                  <th className="p-4">Compare At Value</th>
                  <th className="p-4">Items Count</th>
                  <th className="p-4">Status</th>
                  <th className="p-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-sage/40">
                {bundles.map((b) => (
                  <tr key={b.id} className="hover:bg-surface/5">
                    <td className="p-4 font-bold text-text flex items-center gap-2.5">
                      <img src={b.images[0]} className="w-12 h-6 rounded object-cover" />
                      {b.name}
                    </td>
                    <td className="p-4">₹{b.price}</td>
                    <td className="p-4">₹{b.compareAtPrice}</td>
                    <td className="p-4">{b.items.length} snacks</td>
                    <td className="p-4">
                      {b.isActive ? (
                        <span className="text-success bg-success/10 border border-success/20 px-2 py-0.5 rounded-full font-bold flex items-center gap-1 w-fit text-[10px]">
                          <CheckCircle size={10} /> Active
                        </span>
                      ) : (
                        <span className="text-rose-700 bg-rose-50 border border-rose-100 px-2 py-0.5 rounded-full font-bold flex items-center gap-1 w-fit text-[10px]">
                          <XCircle size={10} /> Inactive
                        </span>
                      )}
                    </td>
                    <td className="p-4 text-right">
                      <Button
                        onClick={() => handleEditBundle(b)}
                        variant="outline"
                        size="sm"
                        className="py-1 px-3.5 hover:shadow-none cursor-pointer text-[10px]"
                      >
                        <Edit2 size={10} className="mr-1" /> Edit
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Product Form Overlay Modal */}
      {showProductForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-text/40 backdrop-blur-xs overflow-y-auto">
          <div className="bg-background border border-border rounded-2xl shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto flex flex-col p-6 animate-fade-in text-left">
            <div className="flex justify-between items-center border-b border-border pb-3 mb-4">
              <h3 className="font-display font-black text-lg text-text">
                {selectedProduct ? `Edit Product: ${selectedProduct.name}` : "Create New Product"}
              </h3>
              <button onClick={() => setShowProductForm(false)} className="text-text-muted hover:text-text cursor-pointer">✕</button>
            </div>

            <form onSubmit={handleProductSubmit} className="space-y-4 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="font-bold text-text-muted uppercase block">Product Name</label>
                  <input
                    type="text"
                    required
                    value={productForm.name}
                    onChange={(e) => setProductForm({ ...productForm, name: e.target.value })}
                    className="w-full bg-background border border-border rounded-lg px-3 py-2 text-text focus:outline-none"
                  />
                </div>
                <div className="space-y-1">
                  <label className="font-bold text-text-muted uppercase block">URL Slug (Auto if blank)</label>
                  <input
                    type="text"
                    value={productForm.slug}
                    onChange={(e) => setProductForm({ ...productForm, slug: e.target.value })}
                    className="w-full bg-background border border-border rounded-lg px-3 py-2 text-text focus:outline-none"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="font-bold text-text-muted uppercase block">Short Description</label>
                <textarea
                  required
                  rows={2}
                  value={productForm.description}
                  onChange={(e) => setProductForm({ ...productForm, description: e.target.value })}
                  className="w-full bg-background border border-border rounded-lg px-3 py-2 text-text focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="font-bold text-text-muted uppercase block">Brand</label>
                  <select
                    value={productForm.brandId}
                    onChange={(e) => setProductForm({ ...productForm, brandId: e.target.value })}
                    className="w-full bg-background border border-border rounded-lg px-3 py-2 text-text cursor-pointer"
                  >
                    {brands.map(b => <option key={b.id} value={b.id}>{b.name}</option>)}
                  </select>
                </div>
                <div className="space-y-1">
                  <label className="font-bold text-text-muted uppercase block">Category</label>
                  <select
                    value={productForm.categoryId}
                    onChange={(e) => setProductForm({ ...productForm, categoryId: e.target.value })}
                    className="w-full bg-background border border-border rounded-lg px-3 py-2 text-text cursor-pointer"
                  >
                    {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                  </select>
                </div>
              </div>

              {/* Dietary Tags Checkboxes */}
              <div className="space-y-1.5">
                <label className="font-bold text-text-muted uppercase block">Dietary Goals</label>
                <div className="flex flex-wrap gap-2 pt-1">
                  {["sugar-free", "keto", "diabetic-friendly", "vegan", "high-protein", "low-carb", "kids"].map(tag => {
                    const isChecked = productForm.dietaryTags.includes(tag);
                    return (
                      <button
                        key={tag}
                        type="button"
                        onClick={() => handleDietaryTagToggle(tag, "product")}
                        className={`px-3 py-1 rounded-full border transition-all cursor-pointer text-[10px] ${
                          isChecked ? "bg-primary text-background border-primary" : "bg-transparent text-text-muted border-border"
                        }`}
                      >
                        {tag}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Storytelling Fields */}
              <div className="space-y-2 border-t border-border pt-3">
                <span className="font-display font-bold text-sm text-primary block">Product Storytelling Info</span>
                
                <div className="space-y-1">
                  <label className="font-bold text-text-muted uppercase block">Sourcing Story</label>
                  <textarea
                    rows={2}
                    value={productForm.story}
                    onChange={(e) => setProductForm({ ...productForm, story: e.target.value })}
                    className="w-full bg-background border border-border rounded-lg px-3 py-2 text-text focus:outline-none"
                  />
                </div>
                
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="font-bold text-text-muted uppercase block">Health Benefits (One per line)</label>
                    <textarea
                      rows={2}
                      value={productForm.benefits}
                      onChange={(e) => setProductForm({ ...productForm, benefits: e.target.value })}
                      className="w-full bg-background border border-border rounded-lg px-3 py-2 text-text focus:outline-none"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="font-bold text-text-muted uppercase block">Serving Suggestions (One per line)</label>
                    <textarea
                      rows={2}
                      value={productForm.servingSuggestions}
                      onChange={(e) => setProductForm({ ...productForm, servingSuggestions: e.target.value })}
                      className="w-full bg-background border border-border rounded-lg px-3 py-2 text-text focus:outline-none"
                    />
                  </div>
                </div>
                
                <div className="space-y-1">
                  <label className="font-bold text-text-muted uppercase block">Featured Ingredients (Comma-separated)</label>
                  <input
                    type="text"
                    value={productForm.featuredIngredients}
                    onChange={(e) => setProductForm({ ...productForm, featuredIngredients: e.target.value })}
                    className="w-full bg-background border border-border rounded-lg px-3 py-2 text-text focus:outline-none"
                  />
                </div>
              </div>

              {/* Photo URLs */}
              <div className="space-y-2 border-t border-border pt-3">
                <span className="font-display font-bold text-sm text-primary block">Product Photography URLs</span>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="font-bold text-text/45 uppercase block">Primary Photo</label>
                    <input
                      type="text"
                      required
                      value={productForm.images.primary}
                      onChange={(e) => setProductForm({
                        ...productForm,
                        images: { ...productForm.images, primary: e.target.value }
                      })}
                      className="w-full bg-background border border-border rounded-lg px-3 py-2 text-text focus:outline-none"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="font-bold text-text/45 uppercase block">Hover Alternate Photo</label>
                    <input
                      type="text"
                      required
                      value={productForm.images.hover}
                      onChange={(e) => setProductForm({
                        ...productForm,
                        images: { ...productForm.images, hover: e.target.value }
                      })}
                      className="w-full bg-background border border-border rounded-lg px-3 py-2 text-text focus:outline-none"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="font-bold text-text/45 uppercase block">Nutrition Label Photo</label>
                    <input
                      type="text"
                      required
                      value={productForm.images.nutrition}
                      onChange={(e) => setProductForm({
                        ...productForm,
                        images: { ...productForm.images, nutrition: e.target.value }
                      })}
                      className="w-full bg-background border border-border rounded-lg px-3 py-2 text-text focus:outline-none"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="font-bold text-text/45 uppercase block">Ingredients Profile Photo</label>
                    <input
                      type="text"
                      required
                      value={productForm.images.ingredients}
                      onChange={(e) => setProductForm({
                        ...productForm,
                        images: { ...productForm.images, ingredients: e.target.value }
                      })}
                      className="w-full bg-background border border-border rounded-lg px-3 py-2 text-text focus:outline-none"
                    />
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-2 border-t border-border pt-4">
                <input
                  type="checkbox"
                  id="prod-active"
                  checked={productForm.isActive}
                  onChange={(e) => setProductForm({ ...productForm, isActive: e.target.checked })}
                  className="rounded text-primary focus:ring-primary cursor-pointer"
                />
                <label htmlFor="prod-active" className="font-bold text-text/70 cursor-pointer">
                  Product Active & Visible in Catalog
                </label>
              </div>

              <div className="flex gap-2 justify-end pt-4 border-t border-border">
                <Button type="button" variant="outline" onClick={() => setShowProductForm(false)} className="cursor-pointer">
                  Cancel
                </Button>
                <Button type="submit" variant="primary" className="cursor-pointer font-bold">
                  Save Product details
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Bundle Form Overlay Modal */}
      {showBundleForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-text/40 backdrop-blur-xs">
          <div className="bg-background border border-border rounded-2xl shadow-xl w-full max-w-lg p-6 animate-fade-in text-left">
            <div className="flex justify-between items-center border-b border-border pb-3 mb-4">
              <h3 className="font-display font-black text-lg text-text">
                {selectedBundle ? `Edit Bundle: ${selectedBundle.name}` : "Create New Bundle Pack"}
              </h3>
              <button onClick={() => setShowBundleForm(false)} className="text-text-muted hover:text-text cursor-pointer">✕</button>
            </div>

            <form onSubmit={handleBundleSubmit} className="space-y-4 text-xs">
              <div className="space-y-1">
                <label className="font-bold text-text-muted uppercase block">Bundle Name</label>
                <input
                  type="text"
                  required
                  value={bundleForm.name}
                  onChange={(e) => setBundleForm({ ...bundleForm, name: e.target.value })}
                  className="w-full bg-background border border-border rounded-lg px-3 py-2 text-text focus:outline-none"
                />
              </div>

              <div className="space-y-1">
                <label className="font-bold text-text-muted uppercase block">Description</label>
                <textarea
                  required
                  rows={3}
                  value={bundleForm.description}
                  onChange={(e) => setBundleForm({ ...bundleForm, description: e.target.value })}
                  className="w-full bg-background border border-border rounded-lg px-3 py-2 text-text focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="font-bold text-text-muted uppercase block">Bundle Price (₹)</label>
                  <input
                    type="number"
                    required
                    value={bundleForm.price}
                    onChange={(e) => setBundleForm({ ...bundleForm, price: Number(e.target.value) })}
                    className="w-full bg-background border border-border rounded-lg px-3 py-2 text-text focus:outline-none"
                  />
                </div>
                <div className="space-y-1">
                  <label className="font-bold text-text-muted uppercase block">Retail Value (₹)</label>
                  <input
                    type="number"
                    required
                    value={bundleForm.compareAtPrice}
                    onChange={(e) => setBundleForm({ ...bundleForm, compareAtPrice: Number(e.target.value) })}
                    className="w-full bg-background border border-border rounded-lg px-3 py-2 text-text focus:outline-none"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="font-bold text-text-muted uppercase block">Image URL</label>
                <input
                  type="text"
                  required
                  value={bundleForm.images}
                  onChange={(e) => setBundleForm({ ...bundleForm, images: e.target.value })}
                  className="w-full bg-background border border-border rounded-lg px-3 py-2 text-text focus:outline-none"
                />
              </div>

              {/* Dietary Tags Checkboxes */}
              <div className="space-y-1.5">
                <label className="font-bold text-text-muted uppercase block">Dietary Goals</label>
                <div className="flex flex-wrap gap-2 pt-1">
                  {["sugar-free", "keto", "diabetic-friendly", "kids"].map(tag => {
                    const isChecked = bundleForm.dietaryTags.includes(tag);
                    return (
                      <button
                        key={tag}
                        type="button"
                        onClick={() => handleDietaryTagToggle(tag, "bundle")}
                        className={`px-3 py-1 rounded-full border transition-all cursor-pointer text-[10px] ${
                          isChecked ? "bg-primary text-background border-primary" : "bg-transparent text-text-muted border-border"
                        }`}
                      >
                        {tag}
                      </button>
                    );
                  })}
                </div>
              </div>

              <div className="flex items-center gap-2 border-t border-border pt-4">
                <input
                  type="checkbox"
                  id="bundle-active"
                  checked={bundleForm.isActive}
                  onChange={(e) => setBundleForm({ ...bundleForm, isActive: e.target.checked })}
                  className="rounded text-primary focus:ring-primary cursor-pointer"
                />
                <label htmlFor="bundle-active" className="font-bold text-text/70 cursor-pointer">
                  Bundle Active & Visible in Store
                </label>
              </div>

              <div className="flex gap-2 justify-end pt-4 border-t border-border">
                <Button type="button" variant="outline" onClick={() => setShowBundleForm(false)} className="cursor-pointer">
                  Cancel
                </Button>
                <Button type="submit" variant="primary" className="cursor-pointer font-bold">
                  Save Bundle details
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
