"use client";

import React, { useEffect, useState } from "react";
import { 
  TrendingUp, 
  ShoppingBag, 
  DollarSign, 
  Users, 
  ArrowRight, 
  Search, 
  AlertTriangle, 
  Calendar, 
  Plus, 
  Check, 
  Sparkles,
  RefreshCw
} from "lucide-react";
import { MockDatabase, Order, AnalyticsEvent, Product } from "@/lib/db/mock-db";
import { Button } from "@/components/ui/button";

export default function AdminDashboard() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [events, setEvents] = useState<AnalyticsEvent[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [timeRange, setTimeRange] = useState<"7d" | "30d" | "all">("7d");
  const [activeTab, setActiveTab] = useState<"analytics" | "searches" | "abandoned" | "subscriptions">("analytics");
  const [showAddSubscription, setShowAddSubscription] = useState(false);

  // Load and seed if necessary
  const loadData = () => {
    MockDatabase.init();
    
    // Auto-seed some realistic events if empty so the dashboard is instantly beautiful
    const currentEvents = MockDatabase.getAnalyticsEvents();
    if (currentEvents.length === 0) {
      const demoEvents: Omit<AnalyticsEvent, "id" | "timestamp">[] = [
        // Product Views
        { type: "PRODUCT_VIEW", productId: "prod-1", sessionId: "s1" },
        { type: "PRODUCT_VIEW", productId: "prod-1", sessionId: "s2" },
        { type: "PRODUCT_VIEW", productId: "prod-2", sessionId: "s3" },
        { type: "PRODUCT_VIEW", productId: "prod-6", sessionId: "s4" },
        { type: "PRODUCT_VIEW", productId: "prod-6", sessionId: "s5" },
        { type: "PRODUCT_VIEW", productId: "prod-7", sessionId: "s6" },
        { type: "PRODUCT_VIEW", productId: "prod-5", sessionId: "s7" },
        { type: "PRODUCT_VIEW", productId: "prod-1", sessionId: "s8" },
        { type: "PRODUCT_VIEW", productId: "prod-10", sessionId: "s9" },
        { type: "PRODUCT_VIEW", productId: "prod-9", sessionId: "s10" },
        { type: "PRODUCT_VIEW", productId: "prod-12", sessionId: "s11" },
        
        // Searches
        { type: "SEARCH", sessionId: "s12", metadata: "keto" },
        { type: "SEARCH", sessionId: "s13", metadata: "sugar free" },
        { type: "SEARCH", sessionId: "s14", metadata: "keto" },
        { type: "SEARCH", sessionId: "s15", metadata: "almond" },
        { type: "SEARCH", sessionId: "s16", metadata: "makhana" },
        { type: "SEARCH", sessionId: "s17", metadata: "diabetic snacks" },
        { type: "SEARCH", sessionId: "s18", metadata: "stevia" },
        { type: "SEARCH", sessionId: "s19", metadata: "keto" },
        { type: "SEARCH", sessionId: "s20", metadata: "sugar free" },
        
        // Add to Carts
        { type: "ADD_TO_CART", productId: "prod-1", sessionId: "s1", value: 120 },
        { type: "ADD_TO_CART", productId: "prod-6", sessionId: "s4", value: 240 },
        { type: "ADD_TO_CART", productId: "prod-7", sessionId: "s6", value: 150 },
        { type: "ADD_TO_CART", productId: "prod-5", sessionId: "s7", value: 140 },
        { type: "ADD_TO_CART", productId: "prod-2", sessionId: "s3", value: 180 },
        
        // Begin Checkouts
        { type: "BEGIN_CHECKOUT", sessionId: "s1", value: 120 },
        { type: "BEGIN_CHECKOUT", sessionId: "s4", value: 240 },
        { type: "BEGIN_CHECKOUT", sessionId: "s6", value: 150 },
      ];
      
      demoEvents.forEach(evt => MockDatabase.logEvent(evt));
    }

    // Auto-seed some completed/pending orders if empty for analytics preview
    const currentOrders = MockDatabase.getOrders();
    if (currentOrders.length === 0) {
      // Create some historical orders
      const userProfile = MockDatabase.getProfile();
      const o1 = MockDatabase.createOrder({
        userId: userProfile.id,
        status: "DELIVERED",
        subtotal: 360,
        discount: 0,
        deliveryFee: 40,
        total: 400,
        addressSnapshot: {
          id: "addr-1",
          userId: userProfile.id,
          label: "Home",
          line1: "Flat 402, Sage Towers",
          line2: "Hitech City",
          city: "Hyderabad",
          state: "Telangana",
          pincode: "500081",
          phone: "+91 98480 12345"
        },
        pointsEarned: 40,
        pointsRedeemed: 0,
        items: [
          { id: "oi-1", variantId: "var-1a", qty: 3, unitPrice: 120, lineTotal: 360 }
        ]
      });
      MockDatabase.payOrder(o1.id, "pay_hist1");
      MockDatabase.updateOrderStatus(o1.id, "DELIVERED");

      const o2 = MockDatabase.createOrder({
        userId: userProfile.id,
        status: "PAID",
        subtotal: 699,
        discount: 100,
        deliveryFee: 40,
        total: 639,
        couponId: "coup-2",
        couponCode: "WELCOME10",
        addressSnapshot: {
          id: "addr-2",
          userId: userProfile.id,
          label: "Office",
          line1: "Phase 2, Deloitte Office",
          line2: "Gachibowli",
          city: "Hyderabad",
          state: "Telangana",
          pincode: "500032",
          phone: "+91 98480 12345"
        },
        pointsEarned: 63,
        pointsRedeemed: 0,
        items: [
          { id: "oi-2", bundleId: "bundle-1", qty: 1, unitPrice: 699, lineTotal: 699 }
        ]
      });
      MockDatabase.payOrder(o2.id, "pay_hist2");

      // Abandoned cart simulated order
      MockDatabase.createOrder({
        userId: userProfile.id,
        status: "PENDING_PAYMENT",
        subtotal: 390,
        discount: 0,
        deliveryFee: 40,
        total: 430,
        addressSnapshot: {
          id: "addr-3",
          userId: userProfile.id,
          label: "Home",
          line1: "Flat 402, Sage Towers",
          pincode: "500081",
          city: "Hyderabad",
          state: "Telangana",
          phone: "+91 98480 12345"
        },
        pointsEarned: 0,
        pointsRedeemed: 0,
        items: [
          { id: "oi-3", variantId: "var-2b", qty: 1, unitPrice: 390, lineTotal: 390 }
        ]
      });
    }

    setOrders(MockDatabase.getOrders());
    setEvents(MockDatabase.getAnalyticsEvents());
    setProducts(MockDatabase.getProducts());
  };

  useEffect(() => {
    loadData();
  }, []);

  // Compute stats
  const paidOrders = orders.filter(o => o.status !== "PENDING_PAYMENT" && o.status !== "CANCELLED");
  const totalRevenue = paidOrders.reduce((sum, o) => sum + o.total, 0);
  const averageOrderValue = paidOrders.length > 0 ? Math.round(totalRevenue / paidOrders.length) : 0;
  
  // Conversion Funnel Calculations
  const viewCount = events.filter(e => e.type === "PRODUCT_VIEW").length || 30; // Safe default
  const cartCount = events.filter(e => e.type === "ADD_TO_CART").length || 12;
  const beginCheckoutCount = events.filter(e => e.type === "BEGIN_CHECKOUT").length || 6;
  const purchaseCount = paidOrders.length;
  
  // Search metrics
  const searchEvents = events.filter(e => e.type === "SEARCH");
  const searchGrouped: { [key: string]: number } = {};
  searchEvents.forEach(e => {
    const q = (e.metadata || "").toLowerCase().trim();
    if (q) searchGrouped[q] = (searchGrouped[q] || 0) + 1;
  });
  const topSearches = Object.entries(searchGrouped)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5);

  // Abandoned Checkouts
  const abandonedCheckouts = orders.filter(o => o.status === "PENDING_PAYMENT");

  // Product sales counts
  const productSalesMap: { [key: string]: { name: string, qty: number, rev: number } } = {};
  paidOrders.forEach(o => {
    o.items.forEach(item => {
      if (item.variantId) {
        const variant = MockDatabase.getVariants().find(v => v.id === item.variantId);
        const prod = products.find(p => p.id === variant?.productId);
        if (prod) {
          if (!productSalesMap[prod.id]) {
            productSalesMap[prod.id] = { name: prod.name, qty: 0, rev: 0 };
          }
          productSalesMap[prod.id].qty += item.qty;
          productSalesMap[prod.id].rev += item.lineTotal;
        }
      } else if (item.bundleId) {
        const bundle = MockDatabase.getBundles().find(b => b.id === item.bundleId);
        if (bundle) {
          if (!productSalesMap[bundle.id]) {
            productSalesMap[bundle.id] = { name: `Bundle: ${bundle.name}`, qty: 0, rev: 0 };
          }
          productSalesMap[bundle.id].qty += item.qty;
          productSalesMap[bundle.id].rev += item.lineTotal;
        }
      }
    });
  });
  
  const productSales = Object.entries(productSalesMap)
    .sort((a, b) => b[1].rev - a[1].rev)
    .slice(0, 5);

  return (
    <div className="space-y-8 text-left animate-fade-in max-w-7xl mx-auto">
      
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-border pb-6">
        <div>
          <h1 className="font-display font-black text-3xl text-text tracking-tight">
            Merchandising & Sales Analytics
          </h1>
          <p className="text-xs text-text-muted mt-1 font-medium">
            Real-time storefront checkout funnel, search logs, and product conversion trackers.
          </p>
        </div>
        
        <div className="flex items-center gap-3">
          <select 
            value={timeRange} 
            onChange={(e) => setTimeRange(e.target.value as any)}
            className="bg-surface/80 border border-border rounded-xl px-4 py-2.5 text-xs font-bold text-text focus:outline-none focus:ring-2 focus:ring-primary/10 cursor-pointer transition-all"
          >
            <option value="7d">Last 7 Days</option>
            <option value="30d">Last 30 Days</option>
            <option value="all">All Time</option>
          </select>
          <button 
            onClick={loadData}
            className="p-3 bg-primary text-white hover:bg-primary/90 rounded-xl transition-all cursor-pointer shadow-sm hover:scale-[1.02]"
            title="Refresh Data"
          >
            <RefreshCw size={16} />
          </button>
        </div>
      </div>

      {/* KPI Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
        
        {/* KPI: Sales */}
        <div className="bg-surface/60 border border-primary/10 backdrop-blur-md rounded-3xl p-6 shadow-sm hover:shadow-md transition-all duration-500 hover:-translate-y-1 flex items-center justify-between group">
          <div className="space-y-1">
            <span className="text-[10px] text-text-muted font-bold uppercase tracking-wider block">Total Sales</span>
            <span className="font-display font-black text-2xl text-text block group-hover:text-primary transition-colors">₹{totalRevenue.toLocaleString()}</span>
            <span className="text-[10px] text-success font-bold block flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-primary animate-ping inline-block"></span>
              Local simulation active
            </span>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-success/10 flex items-center justify-center text-success shadow-inner transition-transform group-hover:rotate-12 duration-300">
            <DollarSign size={22} />
          </div>
        </div>

        {/* KPI: Orders */}
        <div className="bg-surface/60 border border-primary/10 backdrop-blur-md rounded-3xl p-6 shadow-sm hover:shadow-md transition-all duration-500 hover:-translate-y-1 flex items-center justify-between group">
          <div className="space-y-1">
            <span className="text-[10px] text-text-muted font-bold uppercase tracking-wider block">Completed Orders</span>
            <span className="font-display font-black text-2xl text-text block group-hover:text-primary transition-colors">{paidOrders.length}</span>
            <span className="text-[10px] text-success font-bold block">100% Paid & Depleted</span>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-[#E6ECE5] flex items-center justify-center text-primary shadow-inner transition-transform group-hover:rotate-12 duration-300">
            <ShoppingBag size={22} />
          </div>
        </div>

        {/* KPI: AOV */}
        <div className="bg-surface/60 border border-primary/10 backdrop-blur-md rounded-3xl p-6 shadow-sm hover:shadow-md transition-all duration-500 hover:-translate-y-1 flex items-center justify-between group">
          <div className="space-y-1">
            <span className="text-[10px] text-text-muted font-bold uppercase tracking-wider block">Average Order Value</span>
            <span className="font-display font-black text-2xl text-text block group-hover:text-accent transition-colors">₹{averageOrderValue}</span>
            <span className="text-[10px] text-clay font-bold block">Healthy basket size</span>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-[#FCF3EE] flex items-center justify-center text-clay shadow-inner transition-transform group-hover:rotate-12 duration-300">
            <TrendingUp size={22} />
          </div>
        </div>

        {/* KPI: Conversion */}
        <div className="bg-surface/60 border border-primary/10 backdrop-blur-md rounded-3xl p-6 shadow-sm hover:shadow-md transition-all duration-500 hover:-translate-y-1 flex items-center justify-between group">
          <div className="space-y-1">
            <span className="text-[10px] text-text-muted font-bold uppercase tracking-wider block">Conversion Rate</span>
            <span className="font-display font-black text-2xl text-text block group-hover:text-primary transition-colors">
              {viewCount > 0 ? ((purchaseCount / viewCount) * 100).toFixed(1) : 0}%
            </span>
            <span className="text-[10px] text-text-muted block font-medium">Views: {viewCount} | Purchase: {purchaseCount}</span>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-surface/30 flex items-center justify-center text-text/70 shadow-inner transition-transform group-hover:rotate-12 duration-300">
            <Users size={22} />
          </div>
        </div>

      </div>

      {/* Main Dashboard Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 sm:gap-8">
        
        {/* Left 2 Cols: Funnel, Charts, Tabs */}
        <div className="lg:col-span-2 space-y-6 sm:space-y-8">
          
          {/* Conversion Funnel Card */}
          <div className="bg-surface/60 border border-primary/10 backdrop-blur-md rounded-3xl p-6 shadow-sm space-y-6">
            <div className="flex items-center justify-between border-b border-border pb-4">
              <div>
                <h3 className="font-display font-bold text-base text-text">Conversion Funnel Visualizer</h3>
                <p className="text-[10px] text-text-muted font-semibold mt-0.5">Tracking buyer drop-off from initial browse to order success</p>
              </div>
              <span className="text-[9px] bg-primary/10 border border-primary/20 text-primary px-3 py-1 rounded-full font-bold uppercase tracking-wider">
                Funnel Analytics
              </span>
            </div>

            {/* Funnel chart bars */}
            <div className="space-y-5">
              
              {/* Step 1: Browse */}
              <div className="space-y-1.5">
                <div className="flex justify-between text-xs font-semibold">
                  <span className="text-text flex items-center gap-2">
                    <span className="w-3 h-3 bg-primary/30 rounded-full inline-block"></span>
                    1. Product Views (Browse)
                  </span>
                  <span className="font-bold text-text/75">{viewCount} sessions</span>
                </div>
                <div className="w-full h-8 bg-surface/20 rounded-xl overflow-hidden relative flex items-center shadow-inner">
                  <div className="h-full bg-gradient-to-r from-primary/10 to-primary/20 transition-all duration-500" style={{ width: "100%" }}></div>
                  <span className="absolute left-4 text-[10px] font-bold text-primary">100% baseline</span>
                </div>
              </div>

              {/* Step 2: Add to Cart */}
              <div className="space-y-1.5">
                <div className="flex justify-between text-xs font-semibold">
                  <span className="text-text flex items-center gap-2">
                    <span className="w-3 h-3 bg-primary/50 rounded-full inline-block"></span>
                    2. Added to Cart
                  </span>
                  <span className="font-bold text-text/75">
                    {cartCount} ({viewCount > 0 ? Math.round((cartCount / viewCount) * 100) : 0}%)
                  </span>
                </div>
                <div className="w-full h-8 bg-surface/20 rounded-xl overflow-hidden relative flex items-center shadow-inner">
                  <div 
                    className="h-full bg-gradient-to-r from-primary/25 to-primary/40 transition-all duration-500" 
                    style={{ width: `${viewCount > 0 ? (cartCount / viewCount) * 100 : 0}%` }}
                  ></div>
                  <span className="absolute left-4 text-[10px] font-bold text-primary">
                    {viewCount > 0 ? Math.round((cartCount / viewCount) * 100) : 0}% of views
                  </span>
                </div>
              </div>

              {/* Step 3: Checkout */}
              <div className="space-y-1.5">
                <div className="flex justify-between text-xs font-semibold">
                  <span className="text-text flex items-center gap-2">
                    <span className="w-3 h-3 bg-accent/50 rounded-full inline-block"></span>
                    3. Began Checkout
                  </span>
                  <span className="font-bold text-text/75">
                    {beginCheckoutCount} ({cartCount > 0 ? Math.round((beginCheckoutCount / cartCount) * 100) : 0}%)
                  </span>
                </div>
                <div className="w-full h-8 bg-surface/20 rounded-xl overflow-hidden relative flex items-center shadow-inner">
                  <div 
                    className="h-full bg-gradient-to-r from-gold/30 to-gold/50 transition-all duration-500" 
                    style={{ width: `${viewCount > 0 ? (beginCheckoutCount / viewCount) * 100 : 0}%` }}
                  ></div>
                  <span className="absolute left-4 text-[10px] font-bold text-accent-dark">
                    {cartCount > 0 ? Math.round((beginCheckoutCount / cartCount) * 100) : 0}% of cart-adds
                  </span>
                </div>
              </div>

              {/* Step 4: Purchase */}
              <div className="space-y-1.5">
                <div className="flex justify-between text-xs font-semibold">
                  <span className="text-text flex items-center gap-2">
                    <span className="w-3 h-3 bg-primary rounded-full inline-block"></span>
                    4. Completed Purchase
                  </span>
                  <span className="font-bold text-text/75">
                    {purchaseCount} ({beginCheckoutCount > 0 ? Math.round((purchaseCount / beginCheckoutCount) * 100) : 0}%)
                  </span>
                </div>
                <div className="w-full h-8 bg-surface/20 rounded-xl overflow-hidden relative flex items-center shadow-inner">
                  <div 
                    className="h-full bg-gradient-to-r from-primary/80 to-primary transition-all duration-500 animate-pulse" 
                    style={{ width: `${viewCount > 0 ? (purchaseCount / viewCount) * 100 : 0}%` }}
                  ></div>
                  <span className="absolute left-4 text-[10px] font-bold text-white">
                    {beginCheckoutCount > 0 ? Math.round((purchaseCount / beginCheckoutCount) * 100) : 0}% of checkouts
                  </span>
                </div>
              </div>

            </div>

            <div className="bg-[#FAF8F3] p-4.5 rounded-2xl border border-border flex items-start gap-3.5 text-left">
              <span className="text-lg">💡</span>
              <div className="space-y-1 text-xs">
                <span className="font-bold text-text block text-sm">Funnel Optimizations Suggestion</span>
                <p className="text-text-muted leading-relaxed font-medium">
                  Checkout to purchase drop-off is {beginCheckoutCount > 0 ? Math.round((1 - purchaseCount / beginCheckoutCount) * 100) : 0}%. 
                  Offering quick UPI/simulated Razorpay flows reduces friction. Ensure pincode range validation is immediate to prevent cart abandonments.
                </p>
              </div>
            </div>
          </div>

          {/* Navigation Tabs for detailed grids */}
          <div className="space-y-4">
            <div className="flex border-b border-border text-xs gap-2">
              <button 
                onClick={() => setActiveTab("analytics")}
                className={`px-5 py-3.5 font-bold border-b-2 cursor-pointer transition-all tracking-wide uppercase text-[10px] ${
                  activeTab === "analytics" 
                    ? "border-primary text-primary" 
                    : "border-transparent text-text-muted hover:text-text"
                }`}
              >
                Top Merchandising
              </button>
              <button 
                onClick={() => setActiveTab("searches")}
                className={`px-5 py-3.5 font-bold border-b-2 cursor-pointer transition-all tracking-wide uppercase text-[10px] ${
                  activeTab === "searches" 
                    ? "border-primary text-primary" 
                    : "border-transparent text-text-muted hover:text-text"
                }`}
              >
                Popular Searches
              </button>
              <button 
                onClick={() => setActiveTab("abandoned")}
                className={`px-5 py-3.5 font-bold border-b-2 cursor-pointer transition-all tracking-wide uppercase text-[10px] ${
                  activeTab === "abandoned" 
                    ? "border-primary text-primary" 
                    : "border-transparent text-text-muted hover:text-text"
                }`}
              >
                Abandoned Carts ({abandonedCheckouts.length})
              </button>
              <button 
                onClick={() => setActiveTab("subscriptions")}
                className={`px-5 py-3.5 font-bold border-b-2 cursor-pointer transition-all tracking-wide uppercase text-[10px] ${
                  activeTab === "subscriptions" 
                    ? "border-primary text-primary" 
                    : "border-transparent text-text-muted hover:text-text"
                }`}
              >
                Subscribers Slot
              </button>
            </div>

            {/* Tab content */}
            <div className="bg-surface/60 border border-primary/10 backdrop-blur-md rounded-3xl p-6 shadow-sm min-h-[250px] transition-all">
              
              {/* Tab: Analytics (Top Products) */}
              {activeTab === "analytics" && (
                <div className="space-y-4">
                  <div className="flex justify-between items-center border-b border-border pb-3">
                    <span className="font-bold text-text-muted uppercase text-[10px] tracking-wider">Product / Bundle</span>
                    <div className="flex gap-16 text-[10px] font-bold text-text-muted uppercase tracking-wider pr-4">
                      <span>Units Sold</span>
                      <span>Total Revenue</span>
                    </div>
                  </div>

                  {productSales.length === 0 ? (
                    <div className="py-12 text-center text-text-muted text-xs font-semibold">
                      No sales recorded yet. Place orders on the storefront and pay them.
                    </div>
                  ) : (
                    <div className="divide-y divide-border">
                      {productSales.map(([id, stats]) => (
                        <div key={id} className="flex justify-between items-center py-4 text-xs group hover:bg-surface/5 px-2 rounded-xl transition-all">
                          <span className="font-bold text-text group-hover:text-primary transition-colors">{stats.name}</span>
                          <div className="flex gap-20 font-semibold pr-4">
                            <span className="w-10 text-right">{stats.qty}</span>
                            <span className="w-20 text-right font-bold text-primary">₹{stats.rev}</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {/* Tab: Searches */}
              {activeTab === "searches" && (
                <div className="space-y-4">
                  <div className="flex justify-between items-center border-b border-border pb-3">
                    <span className="font-bold text-text-muted uppercase text-[10px] tracking-wider">Keyword Query</span>
                    <span className="font-bold text-text-muted uppercase text-[10px] tracking-wider">Frequency / Hits</span>
                  </div>

                  {topSearches.length === 0 ? (
                    <div className="py-12 text-center text-text-muted text-xs font-semibold">
                      No search logs captured. Try typing in the storefront header search bar.
                    </div>
                  ) : (
                    <div className="divide-y divide-border">
                      {topSearches.map(([term, count]) => (
                        <div key={term} className="flex justify-between items-center py-4 text-xs hover:bg-surface/5 px-2 rounded-xl transition-all">
                          <div className="flex items-center gap-3">
                            <Search size={14} className="text-text-muted" />
                            <span className="font-bold text-text font-mono bg-surface/30 px-3 py-1 rounded-full text-[10px] tracking-tight">
                              {term}
                            </span>
                          </div>
                          <span className="font-bold text-text">{count} queries</span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {/* Tab: Abandoned Checkouts */}
              {activeTab === "abandoned" && (
                <div className="space-y-4">
                  <div className="flex justify-between items-center border-b border-border pb-3">
                    <span className="font-bold text-text-muted uppercase text-[10px] tracking-wider">Customer / Order ID</span>
                    <span className="font-bold text-text-muted uppercase text-[10px] tracking-wider">Cart Value</span>
                  </div>

                  {abandonedCheckouts.length === 0 ? (
                    <div className="py-12 text-center text-text-muted text-xs font-semibold">
                      No abandoned checkouts. All users finished their simulated payment flow.
                    </div>
                  ) : (
                    <div className="divide-y divide-border">
                      {abandonedCheckouts.map((order) => (
                        <div key={order.id} className="flex justify-between items-center py-4 text-xs hover:bg-surface/5 px-2 rounded-xl transition-all">
                          <div className="space-y-1 text-left">
                            <span className="font-bold text-text block">
                              {order.addressSnapshot.label} ({order.addressSnapshot.city})
                            </span>
                            <span className="text-[10px] text-text-muted font-mono block">
                              {order.id} • {new Date(order.timestamp).toLocaleString()}
                            </span>
                          </div>
                          <div className="flex items-center gap-4">
                            <span className="font-bold text-clay bg-clay/10 px-2.5 py-1 rounded-full text-[9px] uppercase tracking-wider border border-clay/15">
                              Abandoned
                            </span>
                            <span className="font-bold text-text">₹{order.total}</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {/* Tab: Subscriptions (Future Feature Preview) */}
              {activeTab === "subscriptions" && (
                <div className="space-y-6">
                  <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-3 border-b border-border pb-3 text-left">
                    <div className="space-y-1">
                      <span className="font-bold text-text text-sm block">Active Subscriptions</span>
                      <span className="text-[10px] text-text-muted font-semibold block">Recurring monthly diabetic snack boxes</span>
                    </div>
                    <Button 
                      variant="outline" 
                      size="sm" 
                      onClick={() => setShowAddSubscription(!showAddSubscription)}
                      className="cursor-pointer font-bold text-[10px] flex items-center gap-1.5 py-2 px-4 border-border rounded-xl"
                    >
                      <Plus size={12} /> Add Subscription Plan
                    </Button>
                  </div>

                  {showAddSubscription && (
                    <form onSubmit={(e) => { e.preventDefault(); setShowAddSubscription(false); }} className="bg-surface/25 p-5 border border-border rounded-2xl text-xs space-y-4 text-left animate-fade-in">
                      <span className="font-bold text-primary text-sm block">Create Simulated Subscription Box</span>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div className="space-y-1.5">
                          <label className="text-[10px] uppercase font-bold text-text-muted">Plan Name</label>
                          <input type="text" placeholder="e.g. Weekly Diabetic Box" className="w-full bg-background border border-border rounded-xl p-3 text-xs focus:outline-none" required />
                        </div>
                        <div className="space-y-1.5">
                          <label className="text-[10px] uppercase font-bold text-text-muted">Price Per Month (₹)</label>
                          <input type="number" placeholder="2499" className="w-full bg-background border border-border rounded-xl p-3 text-xs focus:outline-none" required />
                        </div>
                      </div>
                      <div className="flex justify-end gap-2 pt-2">
                        <Button type="button" size="sm" variant="outline" onClick={() => setShowAddSubscription(false)} className="rounded-xl border-border px-4">Cancel</Button>
                        <Button type="submit" size="sm" variant="primary" className="rounded-xl bg-primary hover:bg-primary/90 text-white px-5">Create Plan</Button>
                      </div>
                    </form>
                  )}

                  {/* Seeded subscriptions display */}
                  <div className="space-y-4">
                    <div className="bg-surface/50 p-4 border border-border rounded-2xl flex items-center justify-between text-xs hover:border-gold transition-colors duration-300">
                      <div className="space-y-1 text-left">
                        <span className="font-bold text-text text-sm block">Diabetic Care Box (Monthly Subscription)</span>
                        <span className="text-[10px] text-text-muted font-semibold block">Assigned: Arjun Rao (arjun.rao@gmail.com)</span>
                        <span className="text-[10px] text-primary font-bold block flex items-center gap-1 mt-1.5 bg-success/10 border border-success/20 px-2.5 py-1 rounded-full w-fit">
                          <Check size={10} className="stroke-[3]" /> Next delivery: July 05, 2026
                        </span>
                      </div>
                      <div className="text-right space-y-2">
                        <span className="font-bold text-text text-sm block">₹2,499/mo</span>
                        <span className="text-[9px] bg-success/10 text-success px-3 py-1 rounded-full font-bold uppercase tracking-wider border border-success/20">
                          Active
                        </span>
                      </div>
                    </div>

                    <div className="bg-surface/50 p-4 border border-border rounded-2xl flex items-center justify-between text-xs hover:border-gold transition-colors duration-300">
                      <div className="space-y-1 text-left">
                        <span className="font-bold text-text text-sm block">Keto Fat-Loss Stack (Fortnightly Box)</span>
                        <span className="text-[10px] text-text-muted font-semibold block">Assigned: Sneha Reddy (sneha@gmail.com)</span>
                        <span className="text-[10px] text-primary font-bold block flex items-center gap-1 mt-1.5 bg-success/10 border border-success/20 px-2.5 py-1 rounded-full w-fit">
                          <Check size={10} className="stroke-[3]" /> Next delivery: June 30, 2026
                        </span>
                      </div>
                      <div className="text-right space-y-2">
                        <span className="font-bold text-text text-sm block">₹3,999/mo</span>
                        <span className="text-[9px] bg-success/10 text-success px-3 py-1 rounded-full font-bold uppercase tracking-wider border border-success/20">
                          Active
                        </span>
                      </div>
                    </div>
                  </div>

                </div>
              )}

            </div>
          </div>

        </div>

        {/* Right 1 Col: Quick settings, alerts, system health */}
        <div className="space-y-6 sm:space-y-8">
          
          {/* Merchandising Goals Tracker */}
          <div className="bg-surface/60 border border-primary/10 backdrop-blur-md rounded-3xl p-6 shadow-sm space-y-5 text-left">
            <h3 className="font-display font-bold text-base text-text flex items-center gap-2.5">
              <Sparkles size={18} className="text-accent" />
              Originals Growth Target
            </h3>
            
            <div className="space-y-3.5">
              <div className="flex justify-between text-xs font-semibold">
                <span className="text-text-muted"> Originals Sales Ratio</span>
                <span className="font-bold text-primary">
                  {paidOrders.length > 0 ? "66%" : "0%"} <span className="text-text-muted font-medium">(Goal: 60%)</span>
                </span>
              </div>
              <div className="w-full h-2.5 bg-surface/35 rounded-full overflow-hidden shadow-inner">
                <div className="h-full bg-gradient-to-r from-gold to-gold-dark rounded-full transition-all duration-1000" style={{ width: paidOrders.length > 0 ? "66%" : "0%" }}></div>
              </div>
              <p className="text-[10px] text-text-muted leading-relaxed font-semibold">
                SafeSnack Originals products achieve a 45% margin vs 12% on partner brands. Current ratio is hitting target parameters.
              </p>
            </div>

            <div className="border-t border-border pt-5 space-y-3 text-xs">
              <span className="font-bold text-text-muted uppercase text-[10px] tracking-wider block">Active Promos & Conversion</span>
              <div className="flex justify-between py-2 border-b border-border/50 items-center">
                <span className="font-bold font-mono text-[9px] bg-primary/10 text-primary px-2 py-0.5 rounded border border-primary/15">SUGARFREE</span>
                <span className="font-bold text-text">12 applied</span>
              </div>
              <div className="flex justify-between py-2 border-b border-border/50 items-center">
                <span className="font-bold font-mono text-[9px] bg-primary/10 text-primary px-2 py-0.5 rounded border border-primary/15">WELCOME10</span>
                <span className="font-bold text-text">8 applied</span>
              </div>
            </div>
          </div>

          {/* Delivery zone performance */}
          <div className="bg-surface/60 border border-primary/10 backdrop-blur-md rounded-3xl p-6 shadow-sm space-y-5 text-left">
            <div>
              <h3 className="font-display font-bold text-base text-text">Hyderabad Heatmap</h3>
              <p className="text-[10px] text-text-muted font-semibold mt-0.5">Current dispatch operations splits in Hyderabad regions</p>
            </div>
            
            <div className="space-y-4 text-xs font-semibold">
              <div className="flex items-center justify-between">
                <div className="flex flex-col text-left space-y-0.5">
                  <span className="font-bold text-text">Madhapur (500081)</span>
                  <span className="text-[10px] text-text-muted font-semibold">Madhapur / Hitech City • 30m</span>
                </div>
                <span className="font-bold text-primary bg-primary/10 border border-primary/15 px-2.5 py-1 rounded-full text-[10px]">60% orders</span>
              </div>

              <div className="flex items-center justify-between border-t border-border pt-3">
                <div className="flex flex-col text-left space-y-0.5">
                  <span className="font-bold text-text">Gachibowli (500032)</span>
                  <span className="text-[10px] text-text-muted font-semibold">Financial District • 35m</span>
                </div>
                <span className="font-bold text-primary bg-primary/10 border border-primary/15 px-2.5 py-1 rounded-full text-[10px]">30% orders</span>
              </div>

              <div className="flex items-center justify-between border-t border-border pt-3">
                <div className="flex flex-col text-left space-y-0.5">
                  <span className="font-bold text-text">Jubilee Hills (500008)</span>
                  <span className="text-[10px] text-text-muted font-semibold">Banjara Hills • 40m</span>
                </div>
                <span className="font-bold text-primary bg-primary/10 border border-primary/15 px-2.5 py-1 rounded-full text-[10px]">10% orders</span>
              </div>
            </div>
          </div>

        </div>

      </div>

    </div>
  );
}
