"use client";

import React, { useEffect, useState } from "react";
import { 
  Package, 
  Plus, 
  AlertTriangle, 
  CheckCircle, 
  Calendar, 
  History,
  Info,
  ShieldAlert,
  ArrowRight,
  TrendingDown
} from "lucide-react";
import { MockDatabase, Batch, Variant, Product, InventoryMovement } from "@/lib/db/mock-db";
import { Button } from "@/components/ui/button";

export default function InventoryDashboard() {
  const [batches, setBatches] = useState<Batch[]>([]);
  const [variants, setVariants] = useState<Variant[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [movements, setMovements] = useState<InventoryMovement[]>([]);
  
  // Form states
  const [selectedVariantId, setSelectedVariantId] = useState("");
  const [batchNum, setBatchNum] = useState("");
  const [mfgDate, setMfgDate] = useState("");
  const [expDate, setExpDate] = useState("");
  const [qty, setQty] = useState(100);
  const [showAddForm, setShowAddForm] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState(false);

  const loadData = () => {
    MockDatabase.init();
    setBatches(MockDatabase.getBatches());
    setVariants(MockDatabase.getVariants());
    setProducts(MockDatabase.getProducts());
    setMovements(MockDatabase.getInventoryMovements());
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleAddBatch = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedVariantId || !batchNum || !mfgDate || !expDate) return;

    const newBatch: Batch = {
      id: `batch-${selectedVariantId}-${Math.random().toString(36).substr(2, 9)}`,
      variantId: selectedVariantId,
      batchNumber: batchNum,
      mfgDate,
      expiryDate: expDate,
      quantity: Number(qty)
    };

    MockDatabase.saveBatch(newBatch);
    setSubmitSuccess(true);
    
    // Clear form
    setBatchNum("");
    setMfgDate("");
    setExpDate("");
    setQty(100);
    
    loadData();

    setTimeout(() => {
      setSubmitSuccess(false);
      setShowAddForm(false);
    }, 2000);
  };

  // Helper: Get variant and product text
  const getVariantName = (variantId: string) => {
    const v = variants.find(x => x.id === variantId);
    const p = products.find(x => x.id === v?.productId);
    return p ? `${p.name} (${v?.label})` : variantId;
  };

  // Compute Alerts
  const today = new Date();
  const thirtyDaysLater = new Date(today);
  thirtyDaysLater.setDate(today.getDate() + 30);

  const expiryAlerts: { batch: Batch; daysLeft: number }[] = [];
  const lowStockAlerts: { variant: Variant; totalQty: number }[] = [];

  // Expiry checks
  batches.forEach(b => {
    if (b.quantity <= 0) return;
    const exp = new Date(b.expiryDate);
    const diffTime = exp.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays <= 30) {
      expiryAlerts.push({ batch: b, daysLeft: diffDays });
    }
  });

  // Low stock checks (Sum variant quantities)
  variants.forEach(v => {
    const variantBatches = batches.filter(b => b.variantId === v.id);
    const totalQty = variantBatches.reduce((sum, b) => sum + b.quantity, 0);
    
    if (totalQty < 20) {
      lowStockAlerts.push({ variant: v, totalQty });
    }
  });

  // Group batches by product for overview
  const productsWithBatches = products.map(prod => {
    const prodVariants = variants.filter(v => v.productId === prod.id);
    const variantsData = prodVariants.map(v => {
      const vBatches = batches.filter(b => b.variantId === v.id && b.quantity > 0)
        .sort((a, b) => new Date(a.expiryDate).getTime() - new Date(b.expiryDate).getTime());
      const totalQty = vBatches.reduce((sum, b) => sum + b.quantity, 0);
      return { variant: v, batches: vBatches, totalQty };
    });
    return { product: prod, variantsData };
  });

  return (
    <div className="space-y-8 text-left animate-fade-in max-w-6xl">
      
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="font-display font-black text-2xl sm:text-3xl text-text tracking-tight flex items-center gap-2">
            <Package size={28} className="text-primary" />
            Batch Inventory Manager (FEFO)
          </h1>
          <p className="text-xs text-text/60 mt-1">
            Track batches by Manufacture (MFG) & Expiry dates. Ensure First-Expiry-First-Out (FEFO) order allocations.
          </p>
        </div>
        
        <Button
          variant="primary"
          onClick={() => {
            setShowAddForm(!showAddForm);
            if (variants.length > 0) setSelectedVariantId(variants[0].id);
          }}
          className="cursor-pointer font-bold text-xs flex items-center gap-2"
        >
          <Plus size={16} /> Add Batch Shipment
        </Button>
      </div>

      {/* Alert Banner Grid */}
      {(expiryAlerts.length > 0 || lowStockAlerts.length > 0) && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          
          {/* Expiry alerts */}
          {expiryAlerts.length > 0 && (
            <div className="bg-[#FFF8F5] border border-[#FDE5D8] rounded-3xl p-5 space-y-3">
              <span className="font-display font-bold text-xs text-[#C25827] flex items-center gap-1.5">
                <AlertTriangle size={16} /> Batch Expiry Alert (Under 30 Days)
              </span>
              <div className="space-y-2 max-h-[150px] overflow-y-auto pr-1">
                {expiryAlerts.map(({ batch, daysLeft }) => (
                  <div key={batch.id} className="text-xs flex justify-between items-center py-1.5 border-b border-[#FBEADF]/60">
                    <div className="text-left">
                      <span className="font-bold text-text block">{getVariantName(batch.variantId)}</span>
                      <span className="text-[10px] text-text/40 font-mono block">Batch: {batch.batchNumber}</span>
                    </div>
                    <span className="text-[10px] bg-red-100 text-red-800 px-2 py-0.5 rounded-lg font-bold">
                      {daysLeft <= 0 ? "Expired" : `${daysLeft} days left`} ({batch.quantity} units)
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Low stock alerts */}
          {lowStockAlerts.length > 0 && (
            <div className="bg-[#FFFBF0] border border-[#FBECC8] rounded-3xl p-5 space-y-3">
              <span className="font-display font-bold text-xs text-[#B37B00] flex items-center gap-1.5">
                <ShieldAlert size={16} /> Low Stock Warnings (&lt; 20 units)
              </span>
              <div className="space-y-2 max-h-[150px] overflow-y-auto pr-1">
                {lowStockAlerts.map(({ variant, totalQty }) => (
                  <div key={variant.id} className="text-xs flex justify-between items-center py-1.5 border-b border-[#F7EAC4]/60">
                    <span className="font-bold text-text">{getVariantName(variant.id)}</span>
                    <span className="text-[10px] bg-amber-100 text-amber-800 px-2 py-0.5 rounded-lg font-bold">
                      {totalQty} in stock
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

        </div>
      )}

      {/* Add Shipment Form Modal/Toggle */}
      {showAddForm && (
        <form onSubmit={handleAddBatch} className="bg-background border border-border rounded-3xl p-6 sm:p-8 space-y-6 shadow-xs text-xs animate-fade-in">
          <div className="flex items-center justify-between border-b border-border pb-3">
            <h3 className="font-display font-bold text-sm text-primary">Add Variant Inventory Batch</h3>
            <button 
              type="button" 
              onClick={() => setShowAddForm(false)}
              className="text-text/40 hover:text-text cursor-pointer"
            >
              ✕ Close
            </button>
          </div>

          {submitSuccess && (
            <div className="bg-success/10 border border-success/20 text-success p-4 rounded-xl font-bold flex items-center gap-2">
              <CheckCircle size={16} /> ✓ Batch registered and movement logs created!
            </div>
          )}

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            
            {/* Variant picker */}
            <div className="space-y-1">
              <label className="font-bold text-text/50 uppercase">Snack Product Variant</label>
              <select
                required
                value={selectedVariantId}
                onChange={(e) => setSelectedVariantId(e.target.value)}
                className="w-full bg-background border border-border rounded-lg px-3 py-2 text-text focus:outline-none"
              >
                {products.map(prod => (
                  <optgroup key={prod.id} label={prod.name}>
                    {variants.filter(v => v.productId === prod.id).map(v => (
                      <option key={v.id} value={v.id}>
                        {prod.name} - {v.label} (₹{v.price})
                      </option>
                    ))}
                  </optgroup>
                ))}
              </select>
            </div>

            {/* Batch number */}
            <div className="space-y-1">
              <label className="font-bold text-text/50 uppercase">Batch Number / SKU Tag</label>
              <input
                type="text"
                required
                placeholder="e.g. B-METHI-03"
                value={batchNum}
                onChange={(e) => setBatchNum(e.target.value)}
                className="w-full bg-background border border-border rounded-lg px-3 py-2 text-text focus:outline-none"
              />
            </div>

            {/* Quantity */}
            <div className="space-y-1">
              <label className="font-bold text-text/50 uppercase">Initial Batch Quantity</label>
              <input
                type="number"
                required
                min={1}
                value={qty}
                onChange={(e) => setQty(Number(e.target.value))}
                className="w-full bg-background border border-border rounded-lg px-3 py-2 text-text focus:outline-none"
              />
            </div>

            {/* MFG Date */}
            <div className="space-y-1">
              <label className="font-bold text-text/50 uppercase">Manufacture (MFG) Date</label>
              <input
                type="date"
                required
                value={mfgDate}
                onChange={(e) => setMfgDate(e.target.value)}
                className="w-full bg-background border border-border rounded-lg px-3 py-2 text-text focus:outline-none"
              />
            </div>

            {/* EXP Date */}
            <div className="space-y-1">
              <label className="font-bold text-text/50 uppercase">Expiry (EXP) Date</label>
              <input
                type="date"
                required
                value={expDate}
                onChange={(e) => setExpDate(e.target.value)}
                className="w-full bg-background border border-border rounded-lg px-3 py-2 text-text focus:outline-none"
              />
            </div>

          </div>

          <div className="flex gap-2 justify-end border-t border-border pt-4">
            <Button
              type="submit"
              variant="primary"
              className="font-bold cursor-pointer"
            >
              Add To Stock
            </Button>
          </div>
        </form>
      )}

      {/* Main Stock Overview */}
      <div className="bg-background border border-border rounded-3xl p-6 shadow-xs space-y-6">
        <div className="flex items-center justify-between border-b border-border pb-3">
          <h3 className="font-display font-bold text-base text-text">Batch Levels & Expiry Dates</h3>
          <span className="text-[10px] bg-primary/10 text-primary px-2.5 py-1 rounded-full font-bold uppercase tracking-wider">
            FEFO Active Queue
          </span>
        </div>

        <div className="space-y-6">
          {productsWithBatches.map(({ product, variantsData }) => {
            const hasStock = variantsData.some(vd => vd.totalQty > 0);
            if (!hasStock) return null; // Only show items with stock

            return (
              <div key={product.id} className="space-y-3">
                <span className="font-display font-black text-sm text-primary block">{product.name}</span>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {variantsData.map(({ variant, batches: vBatches, totalQty }) => (
                    <div key={variant.id} className="bg-[#FAF8F3] border border-border rounded-2xl p-4 flex flex-col justify-between space-y-4">
                      
                      {/* Variant name & total */}
                      <div className="flex justify-between items-center text-xs">
                        <span className="font-bold text-text">{variant.label}</span>
                        <span className="font-bold text-primary bg-surface/50 px-2 py-0.5 rounded-lg text-[10px]">
                          Total Stock: {totalQty} units
                        </span>
                      </div>

                      {/* Batches breakdowns */}
                      <div className="space-y-2 text-[11px]">
                        <span className="text-[9px] uppercase font-bold text-text/40 tracking-wider block">Batches (Sorted by Expiry)</span>
                        {vBatches.length === 0 ? (
                          <span className="text-clay italic block">Out of stock!</span>
                        ) : (
                          vBatches.map((b, idx) => {
                            const isNextOut = idx === 0;
                            return (
                              <div 
                                key={b.id} 
                                className={`flex justify-between items-center p-2 rounded-lg border ${
                                  isNextOut 
                                    ? "bg-surface/20 border-border text-text" 
                                    : "bg-transparent border-border text-text/60"
                                }`}
                              >
                                <div className="text-left font-mono">
                                  <span className="font-bold block">
                                    {b.batchNumber} {isNextOut && <span className="text-[9.5px] text-[#B5704D] font-sans font-black">(FEFO Next Out)</span>}
                                  </span>
                                  <span className="text-[9px] block text-text/40">EXP: {b.expiryDate}</span>
                                </div>
                                <span className="font-bold">{b.quantity} units</span>
                              </div>
                            );
                          })
                        )}
                      </div>

                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Movement Ledger Log */}
      <div className="bg-background border border-border rounded-3xl p-6 shadow-xs space-y-4">
        <h3 className="font-display font-bold text-base text-text flex items-center gap-2">
          <History size={18} className="text-clay" />
          Inventory Movement Log
        </h3>
        
        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left border-collapse">
            <thead>
              <tr className="border-b border-border pb-2 text-text/40 uppercase text-[9px] font-bold">
                <th className="py-2.5">Timestamp</th>
                <th>Variant</th>
                <th>Movement</th>
                <th>Quantity</th>
                <th>Reference Detail</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border font-medium">
              {movements.length === 0 ? (
                <tr>
                  <td colSpan={5} className="py-8 text-center text-text/40">
                    No movements logged. Try packing/allocating orders or adding a shipment.
                  </td>
                </tr>
              ) : (
                [...movements].reverse().slice(0, 8).map((mov) => {
                  const typeColors = {
                    IN: "bg-success/15 text-success",
                    OUT: "bg-amber-100 text-amber-800",
                    ADJUST: "bg-blue-100 text-blue-800",
                    SALE: "bg-indigo-100 text-indigo-800",
                    EXPIRED: "bg-red-100 text-red-800"
                  };

                  return (
                    <tr key={mov.id} className="hover:bg-surface/10 text-xs">
                      <td className="py-2.5 font-mono text-text/50 text-[10px]">
                        {new Date(mov.timestamp).toLocaleString()}
                      </td>
                      <td className="font-bold text-text">
                        {getVariantName(mov.variantId)}
                      </td>
                      <td>
                        <span className={`px-2 py-0.5 rounded text-[9px] font-bold ${typeColors[mov.type] || "bg-gray-100"}`}>
                          {mov.type}
                        </span>
                      </td>
                      <td className="font-bold">
                        {mov.type === "OUT" || mov.type === "EXPIRED" ? "-" : "+"}{mov.qty}
                      </td>
                      <td className="text-text/60 text-[10.5px]">
                        {mov.reference}
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

    </div>
  );
}
