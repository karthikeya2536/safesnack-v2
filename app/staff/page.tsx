"use client";

import React, { useEffect, useState } from "react";
import { 
  ClipboardList, 
  Clock, 
  MapPin, 
  Phone, 
  Truck, 
  CheckCircle, 
  PackageCheck, 
  AlertCircle,
  TrendingUp,
  Search,
  MessageSquare
} from "lucide-react";
import { MockDatabase, Order, Variant, Product } from "@/lib/db/mock-db";
import { Button } from "@/components/ui/button";

export default function OrderQueue() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [variants, setVariants] = useState<Variant[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [filterStatus, setFilterStatus] = useState<"ACTIVE" | "PAID" | "PROCESSING" | "COMPLETED" | "ALL">("ACTIVE");
  const [searchQuery, setSearchQuery] = useState("");
  const [expandedOrder, setExpandedOrder] = useState<string | null>(null);

  const loadData = () => {
    MockDatabase.init();
    setOrders(MockDatabase.getOrders());
    setVariants(MockDatabase.getVariants());
    setProducts(MockDatabase.getProducts());
  };

  useEffect(() => {
    loadData();
    // Set up polling for order queue
    const interval = setInterval(loadData, 5000);
    return () => clearInterval(interval);
  }, []);

  const handleStatusChange = (orderId: string, newStatus: Order["status"]) => {
    MockDatabase.updateOrderStatus(orderId, newStatus);
    loadData();
  };

  const getStatusBadgeColor = (status: Order["status"]) => {
    switch (status) {
      case "PENDING_PAYMENT":
        return "bg-amber-100 text-amber-800 border-amber-200";
      case "PAID":
        return "bg-success/10 text-success border-success/20";
      case "PROCESSING":
        return "bg-blue-100 text-blue-800 border-blue-200";
      case "SHIPPED":
        return "bg-indigo-100 text-indigo-800 border-indigo-200";
      case "OUT_FOR_DELIVERY":
        return "bg-purple-100 text-purple-800 border-purple-200";
      case "DELIVERED":
        return "bg-success/10 text-success border-transparent";
      case "CANCELLED":
        return "bg-red-100 text-red-800 border-red-200";
      default:
        return "bg-gray-100 text-gray-800 border-gray-200";
    }
  };

  const getVariantLabel = (variantId?: string) => {
    if (!variantId) return "";
    const v = variants.find(x => x.id === variantId);
    const p = products.find(x => x.id === v?.productId);
    return p ? `${p.name} (${v?.label})` : variantId;
  };

  const getBundleLabel = (bundleId?: string) => {
    if (!bundleId) return "";
    const b = MockDatabase.getBundles().find(x => x.id === bundleId);
    return b ? `Bundle: ${b.name}` : bundleId;
  };

  // Filter orders
  const filteredOrders = orders.filter(order => {
    // Status filters
    if (filterStatus === "ACTIVE") {
      if (order.status === "DELIVERED" || order.status === "CANCELLED" || order.status === "PENDING_PAYMENT") return false;
    } else if (filterStatus === "PAID" && order.status !== "PAID") return false;
    else if (filterStatus === "PROCESSING" && order.status !== "PROCESSING") return false;
    else if (filterStatus === "COMPLETED" && order.status !== "DELIVERED") return false;

    // Search query filters (matches customer name, pincode, order ID)
    if (searchQuery.trim() !== "") {
      const q = searchQuery.toLowerCase();
      const matchesName = order.addressSnapshot.label.toLowerCase().includes(q);
      const matchesPincode = order.addressSnapshot.pincode.includes(q);
      const matchesId = order.id.toLowerCase().includes(q);
      if (!matchesName && !matchesPincode && !matchesId) return false;
    }

    return true;
  });

  return (
    <div className="space-y-6 text-left animate-fade-in max-w-5xl">
      
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="font-display font-black text-2xl sm:text-3xl text-text tracking-tight flex items-center gap-2">
            <ClipboardList size={28} className="text-primary" />
            Fulfillment Queue
          </h1>
          <p className="text-xs text-text/60 mt-1">
            Track and dispatch Hyderabad orders. Batch selections are automatically calculated using the FEFO algorithm.
          </p>
        </div>
        
        {/* Quick info */}
        <div className="bg-background border border-border rounded-2xl px-4 py-2.5 flex items-center gap-3 text-xs">
          <Clock size={16} className="text-clay" />
          <div>
            <span className="font-bold block text-text">Fulfillment Center Open</span>
            <span className="text-[10px] text-text/40 block">Hyderabad HUB-1</span>
          </div>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col md:flex-row gap-4 justify-between items-stretch sm:items-center bg-background border border-border rounded-3xl p-4 shadow-xs">
        
        {/* Status Filters */}
        <div className="flex flex-wrap gap-1 text-[10px] uppercase font-bold">
          <button
            onClick={() => setFilterStatus("ACTIVE")}
            className={`px-3 py-1.5 rounded-lg border transition-all cursor-pointer ${
              filterStatus === "ACTIVE" 
                ? "bg-primary border-primary text-background" 
                : "border-border bg-background text-text/60 hover:text-text"
            }`}
          >
            Active Orders
          </button>
          <button
            onClick={() => setFilterStatus("PAID")}
            className={`px-3 py-1.5 rounded-lg border transition-all cursor-pointer ${
              filterStatus === "PAID" 
                ? "bg-success/10 border-success/20 text-success" 
                : "border-border bg-background text-text/60 hover:text-text"
            }`}
          >
            Paid (Queue)
          </button>
          <button
            onClick={() => setFilterStatus("PROCESSING")}
            className={`px-3 py-1.5 rounded-lg border transition-all cursor-pointer ${
              filterStatus === "PROCESSING" 
                ? "bg-blue-100 border-blue-200 text-blue-800" 
                : "border-border bg-background text-text/60 hover:text-text"
            }`}
          >
            Processing
          </button>
          <button
            onClick={() => setFilterStatus("COMPLETED")}
            className={`px-3 py-1.5 rounded-lg border transition-all cursor-pointer ${
              filterStatus === "COMPLETED" 
                ? "bg-surface border-transparent text-text" 
                : "border-border bg-background text-text/60 hover:text-text"
            }`}
          >
            Delivered
          </button>
          <button
            onClick={() => setFilterStatus("ALL")}
            className={`px-3 py-1.5 rounded-lg border transition-all cursor-pointer ${
              filterStatus === "ALL" 
                ? "bg-text border-charcoal text-background" 
                : "border-border bg-background text-text/60 hover:text-text"
            }`}
          >
            All
          </button>
        </div>

        {/* Search */}
        <div className="relative">
          <input
            type="text"
            placeholder="Search Order ID, name..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full sm:w-60 bg-background border border-border rounded-xl pl-9 pr-3 py-2 text-xs focus:outline-none text-text"
          />
          <Search size={14} className="absolute left-3 top-2.5 text-text/40" />
        </div>

      </div>

      {/* Orders List */}
      <div className="space-y-4">
        {filteredOrders.length === 0 ? (
          <div className="bg-background border border-border rounded-3xl p-12 text-center text-xs text-text/40">
            No orders match the selected filter. Try placing a paid order in the storefront first.
          </div>
        ) : (
          filteredOrders.map((order) => {
            const isExpanded = expandedOrder === order.id;
            const itemsCount = order.items.reduce((sum, item) => sum + item.qty, 0);

            return (
              <div 
                key={order.id} 
                className="bg-background border border-border rounded-3xl overflow-hidden shadow-xs hover:border-border transition-all text-xs"
              >
                
                {/* Order Summary Line */}
                <div 
                  onClick={() => setExpandedOrder(isExpanded ? null : order.id)}
                  className="p-5 sm:p-6 flex flex-col md:flex-row md:items-center justify-between gap-4 cursor-pointer hover:bg-surface/10 select-none"
                >
                  <div className="space-y-1">
                    <div className="flex items-center gap-2.5">
                      <span className="font-display font-black text-sm text-text">{order.id}</span>
                      <span className={`px-2 py-0.5 rounded text-[9px] font-bold border uppercase tracking-wider ${getStatusBadgeColor(order.status)}`}>
                        {order.status}
                      </span>
                    </div>
                    <div className="text-[10px] text-text/40 font-semibold uppercase tracking-wider flex items-center gap-3">
                      <span>{new Date(order.timestamp).toLocaleString()}</span>
                      <span>•</span>
                      <span>{itemsCount} {itemsCount === 1 ? "item" : "items"}</span>
                      <span>•</span>
                      <span className="text-primary font-bold">₹{order.total}</span>
                    </div>
                  </div>

                  <div className="flex items-center justify-between md:justify-end gap-6 text-[11px]">
                    <div className="flex items-center gap-1.5 text-text/60">
                      <MapPin size={14} className="text-clay" />
                      <span>
                        {MockDatabase.getDeliveryZones().find(z => z.pincode === order.addressSnapshot.pincode)?.area || order.addressSnapshot.label} ({order.addressSnapshot.pincode})
                      </span>
                    </div>

                    <div className="flex items-center gap-2">
                      {order.status === "PAID" && (
                        <Button
                          variant="primary"
                          size="sm"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleStatusChange(order.id, "PROCESSING");
                          }}
                          className="font-bold text-[10px] bg-primary text-background hover:bg-primary/90 py-1.5 px-3 rounded-lg"
                        >
                          Start Packing
                        </Button>
                      )}

                      {order.status === "PROCESSING" && (
                        <Button
                          variant="primary"
                          size="sm"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleStatusChange(order.id, "SHIPPED");
                          }}
                          className="font-bold text-[10px] bg-[#B5704D] text-background hover:bg-clay/90 py-1.5 px-3 rounded-lg"
                        >
                          Mark Shipped
                        </Button>
                      )}

                      {order.status === "SHIPPED" && (
                        <Button
                          variant="primary"
                          size="sm"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleStatusChange(order.id, "OUT_FOR_DELIVERY");
                          }}
                          className="font-bold text-[10px] bg-indigo-600 hover:bg-indigo-700 text-background py-1.5 px-3 rounded-lg border-none"
                        >
                          Out for Delivery
                        </Button>
                      )}

                      {order.status === "OUT_FOR_DELIVERY" && (
                        <Button
                          variant="primary"
                          size="sm"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleStatusChange(order.id, "DELIVERED");
                          }}
                          className="font-bold text-[10px] bg-primary hover:bg-primary-hover text-background py-1.5 px-3 rounded-lg border-none"
                        >
                          Mark Delivered
                        </Button>
                      )}

                      <span className="text-text/30 select-none hidden md:inline">
                        {isExpanded ? "▲" : "▼"}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Expanded Details Panel */}
                {isExpanded && (
                  <div className="border-t border-border bg-[#FAF8F3]/50 p-6 space-y-6 animate-fade-in">
                    
                    {/* Delivery Address & Customer Details */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="space-y-2">
                        <span className="font-bold text-text/40 uppercase tracking-widest text-[9px] block">Delivery Details</span>
                        <div className="bg-background border border-border rounded-2xl p-4 space-y-2">
                          <div className="font-bold text-text flex items-center gap-1.5">
                            <span>{order.addressSnapshot.label}</span>
                            <span className="font-normal text-[10px] text-text/40">({order.addressSnapshot.city})</span>
                          </div>
                          <p className="text-text/60 leading-relaxed">
                            {order.addressSnapshot.line1}
                            {order.addressSnapshot.line2 && `, ${order.addressSnapshot.line2}`}
                          </p>
                          <div className="flex items-center gap-2 pt-1.5 text-xs font-semibold text-text/70">
                            <Phone size={12} className="text-clay" />
                            <span>{order.addressSnapshot.phone}</span>
                          </div>
                        </div>
                      </div>

                      <div className="space-y-2">
                        <span className="font-bold text-text/40 uppercase tracking-widest text-[9px] block">Courier Operations</span>
                        <div className="bg-background border border-border rounded-2xl p-4 space-y-3">
                          <div className="flex justify-between items-center text-xs">
                            <span className="text-text/50">Simulated Pincode Zone Rate:</span>
                            <span className="font-bold text-text">₹{order.deliveryFee}</span>
                          </div>
                          <div className="flex justify-between items-center text-xs">
                            <span className="text-text/50">Delivery SLA / ETA:</span>
                            <span className="font-bold text-primary">
                              {order.etaMinutes || 30} mins (Hyderabad Fast Delivery)
                            </span>
                          </div>
                          
                          {/* Payment information */}
                          <div className="flex justify-between items-center border-t border-border pt-2.5 text-xs">
                            <span className="text-text/50">Razorpay Transaction ID:</span>
                            <span className="font-mono font-bold text-text/70">{order.paymentId || "N/A"}</span>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Order items and batch allocations */}
                    <div className="space-y-2">
                      <span className="font-bold text-text/40 uppercase tracking-widest text-[9px] block">Items & FEFO Batch Allocations</span>
                      
                      <div className="bg-background border border-border rounded-2xl overflow-hidden divide-y divide-border">
                        {order.items.map((item) => (
                          <div key={item.id} className="p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                            <div className="space-y-1">
                              <span className="font-bold text-text text-xs">
                                {item.variantId ? getVariantLabel(item.variantId) : getBundleLabel(item.bundleId)}
                              </span>
                              <div className="flex flex-wrap gap-1.5 pt-1">
                                {item.batchAllocations?.map(alloc => (
                                  <span key={alloc.batchId} className="bg-surface/40 border border-border text-[9px] px-2 py-0.5 rounded-md font-mono text-text">
                                    Allocated Batch: <span className="font-bold">{alloc.batchId.replace("batch-", "")}</span> (Qty: {alloc.qty})
                                  </span>
                                ))}
                                {!item.batchAllocations && (
                                  <span className="text-[9px] text-clay/80 font-bold bg-[#FCF3EE] border border-[#F5DFD3] px-2 py-0.5 rounded-md flex items-center gap-1">
                                    <AlertCircle size={10} /> Dynamic FEFO allocation pending payment/pack
                                  </span>
                                )}
                              </div>
                            </div>

                            <div className="flex gap-12 font-bold text-xs">
                              <div>
                                <span className="text-text/40 text-[10px] block font-normal">Quantity</span>
                                <span>{item.qty} units</span>
                              </div>
                              <div>
                                <span className="text-text/40 text-[10px] block font-normal">Line Price</span>
                                <span>₹{item.lineTotal}</span>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Quick transitions details */}
                    <div className="flex flex-wrap justify-between items-center gap-3 pt-3 border-t border-border">
                      <div className="flex gap-2">
                        {order.status !== "CANCELLED" && order.status !== "DELIVERED" && (
                          <button
                            onClick={() => handleStatusChange(order.id, "CANCELLED")}
                            className="bg-transparent hover:bg-red-50 text-red-700 border border-red-200 px-3 py-1.5 rounded-lg font-bold text-[10px] uppercase cursor-pointer"
                          >
                            Cancel Order
                          </button>
                        )}
                      </div>
                      
                      <span className="text-[10px] text-text/40 italic">
                        All movements are audited and saved to the local inventory ledger logs automatically.
                      </span>
                    </div>

                  </div>
                )}

              </div>
            );
          })
        )}
      </div>

    </div>
  );
}
