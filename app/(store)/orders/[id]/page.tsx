"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useParams, useSearchParams } from "next/navigation";
import { CheckCircle2, MessageSquare, Mail, MapPin, ArrowRight, ShieldCheck, ShoppingBag, Clock, AlertCircle } from "lucide-react";
import { MockDatabase, Order } from "@/lib/db/mock-db";
import { Button } from "@/components/ui/button";

export default function OrderDetailPage() {
  const { id } = useParams();
  const searchParams = useSearchParams();
  const isSuccessRedirect = searchParams.get("success") === "true";

  const [order, setOrder] = useState<Order | null>(null);
  const [waLink, setWaLink] = useState("");

  useEffect(() => {
    if (!id) return;
    MockDatabase.init();
    const ordersList = MockDatabase.getOrders();
    const foundOrder = ordersList.find((o) => o.id === id);

    if (foundOrder) {
      setOrder(foundOrder);
      
      // Generate WhatsApp Click-To-Chat message deep link
      // Format: wa.me/919848012345?text=Hello...
      const businessNumber = "919848012345";
      const itemsList = foundOrder.items
        .map(item => {
          if (item.variantId) {
            const v = MockDatabase.getVariants().find(x => x.id === item.variantId);
            const p = MockDatabase.getProducts().find(x => x.id === v?.productId);
            return `${item.qty} x ${p ? `${p.name} (${v?.label})` : item.variantId}`;
          } else {
            const b = MockDatabase.getBundles().find(x => x.id === item.bundleId);
            return `${item.qty} x ${b ? `Bundle: ${b.name}` : item.bundleId}`;
          }
        })
        .join(", ");
      
      const message = `SafeSnack Order Confirmation:
*Order ID:* ${foundOrder.id}
*Payment status:* PAID
*Items:* ${itemsList}
*Total Paid:* ₹${foundOrder.total}
*Delivery Address:* ${foundOrder.addressSnapshot.line1}, Pincode: ${foundOrder.addressSnapshot.pincode}
*ETA:* ${foundOrder.etaMinutes || 45} mins.
Thank you!`;

      setWaLink(`https://wa.me/${businessNumber}?text=${encodeURIComponent(message)}`);
    }
  }, [id]);

  if (!order) {
    return (
      <div className="max-w-xl mx-auto px-4 py-20 text-center space-y-4 bg-background">
        <AlertIcon />
        <h2 className="font-display font-black text-xl text-text">Order Not Found</h2>
        <p className="text-xs text-text-muted">
          We couldn't locate an order with ID: <strong className="text-text/80">{id}</strong>.
        </p>
        <Link href="/products">
          <Button variant="primary" className="text-xs cursor-pointer">Back to Shop</Button>
        </Link>
      </div>
    );
  }

  const getStatusStep = () => {
    switch (order.status) {
      case "PENDING_PAYMENT": return 0;
      case "PAID": return 1;
      case "PROCESSING": return 2;
      case "SHIPPED": return 3;
      case "OUT_FOR_DELIVERY": return 4;
      case "DELIVERED": return 5;
      default: return 1;
    }
  };

  const steps = [
    { label: "Ordered", status: "PENDING_PAYMENT" },
    { label: "Paid", status: "PAID" },
    { label: "Processing", status: "PROCESSING" },
    { label: "Shipped", status: "SHIPPED" },
    { label: "Out for Delivery", status: "OUT_FOR_DELIVERY" },
    { label: "Delivered", status: "DELIVERED" }
  ];

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8 text-left animate-fade-in">
      
      {/* Success Redirect Banner */}
      {isSuccessRedirect && (
        <div className="bg-[#EBF7EE] border border-[#D6ECD9] rounded-3xl p-6 sm:p-8 flex flex-col sm:flex-row items-center gap-4 text-[#2F5233]">
          <CheckCircle2 size={40} className="shrink-0 text-[#2F5233]" />
          <div>
            <h2 className="font-display font-black text-lg sm:text-xl leading-snug">Order Placed Successfully!</h2>
            <p className="text-xs text-[#2F5233]/85 mt-0.5">
              Your payment has been secured via Razorpay. We have allocated batches using FEFO and credited {order.pointsEarned} points to your loyalty profile!
            </p>
          </div>
        </div>
      )}

      {/* Main Order Details layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        
        {/* Left: Status Tracker & Items */}
        <div className="lg:col-span-8 space-y-6">
          
          {/* Tracker Progress Bar */}
          <div className="bg-background border border-border rounded-2xl p-6 space-y-6">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 border-b border-border pb-4">
              <div>
                <span className="text-[10px] text-text-muted font-bold uppercase tracking-wider block">Receipt ID: {order.id}</span>
                <span className="font-display font-bold text-base text-text mt-1 block">
                  Status: <span className="text-primary uppercase">{order.status.replace(/_/g, " ")}</span>
                </span>
              </div>
              <div className="flex items-center gap-1.5 text-xs text-text-muted font-semibold bg-surface/20 px-3.5 py-1.5 rounded-full">
                <Clock size={14} className="text-primary" />
                ETA: {order.etaMinutes || 45} Minutes (Hyderabad Area)
              </div>
            </div>

            {/* Stepper progress */}
            <div className="relative pt-2">
              <div className="absolute top-5 left-2 right-2 h-1 bg-surface/40 -z-10 rounded">
                <div
                  className="h-full bg-primary rounded transition-all duration-500"
                  style={{ width: `${(getStatusStep() / (steps.length - 1)) * 100}%` }}
                />
              </div>
              
              <div className="flex justify-between items-center text-center">
                {steps.map((st, idx) => {
                  const isActive = getStatusStep() >= idx;
                  return (
                    <div key={st.status} className="flex flex-col items-center space-y-1.5 relative">
                      <div className={`w-8 h-8 rounded-full border flex items-center justify-center text-xs font-bold transition-all duration-300 ${
                        isActive
                          ? "bg-primary border-primary text-background shadow-xs"
                          : "bg-background border-sage text-text-muted"
                      }`}>
                        {idx + 1}
                      </div>
                      <span className={`text-[10px] font-medium hidden sm:block ${isActive ? "text-text font-bold" : "text-text-muted"}`}>
                        {st.label}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Items Summary list */}
          <div className="bg-background border border-border rounded-2xl p-6 space-y-4">
            <h3 className="font-display font-bold text-base text-text pb-2 border-b border-border">
              Purchased Snacks
            </h3>
            <div className="divide-y divide-sage/40">
              {order.items.map((item, idx) => {
                const isItemBundle = !!item.bundleId;
                const detail = isItemBundle
                  ? MockDatabase.getBundles().find(b => b.id === item.bundleId)
                  : MockDatabase.getVariants().find(v => v.id === item.variantId);
                const p = isItemBundle ? null : MockDatabase.getProducts().find(prod => prod.id === (detail as any).productId);
                
                return (
                  <div key={idx} className="flex gap-4 py-4 items-center">
                    <img
                      src={isItemBundle ? (detail as any).images[0] : p?.images.primary}
                      className="w-12 h-12 object-cover rounded-xl border border-border"
                    />
                    <div className="flex-1 text-left text-xs">
                      <span className="font-bold text-text block text-sm">
                        {isItemBundle ? (detail as any)?.name : p?.name}
                      </span>
                      <span className="text-text-muted text-[10px] block mt-0.5">
                        {isItemBundle ? "Special Curated Pack" : (detail as any).label} &bull; SKU: {(detail as any).sku || "SS-BUNDLE"}
                      </span>
                      {item.batchAllocations && item.batchAllocations.length > 0 && (
                        <div className="mt-1 text-[9px] text-primary-800 font-semibold bg-primary-50 border border-primary-100 rounded px-2 py-0.5 inline-block">
                          ✓ FEFO Batch: {item.batchAllocations[0].batchId} (Qty: {item.batchAllocations[0].qty})
                        </div>
                      )}
                    </div>
                    <div className="text-right text-xs">
                      <span className="text-text-muted block">{item.qty} &times; ₹{item.unitPrice}</span>
                      <span className="font-bold text-text block text-sm">₹{item.lineTotal}</span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Right: Actions, WhatsApp Click-to-chat, Resend Preview */}
        <div className="lg:col-span-4 space-y-6">
          
          {/* Actions & WhatsApp click-to-chat */}
          <div className="bg-background border border-border rounded-2xl p-6 space-y-4">
            <h3 className="font-display font-bold text-base text-text">
              Order Actions
            </h3>
            
            {/* WhatsApp button */}
            <a href={waLink} target="_blank" rel="noreferrer" className="block">
              <Button
                variant="primary"
                className="w-full bg-primary-600 hover:bg-primary-700 text-background py-3 font-semibold flex items-center justify-center gap-2 cursor-pointer shadow-sm"
              >
                <MessageSquare size={16} />
                Send Order to WhatsApp
              </Button>
            </a>
            <p className="text-[10px] text-text-muted leading-relaxed text-center">
              Sends pre-filled receipt confirmation text to SafeSnack business line. No API auth blockers.
            </p>

            <div className="border-t border-border pt-4 flex flex-col gap-2">
              <Link href="/products">
                <Button variant="outline" size="sm" className="w-full py-2.5 cursor-pointer text-xs">
                  Continue Shopping
                </Button>
              </Link>
            </div>
          </div>

          {/* Delivery & Billing Summary */}
          <div className="bg-background border border-border rounded-2xl p-6 space-y-3 text-xs">
            <h4 className="font-display font-bold text-sm text-text flex items-center gap-1">
              <MapPin size={14} className="text-primary" />
              Delivery Details
            </h4>
            <div className="text-text/70 leading-relaxed space-y-1.5">
              <p className="font-semibold text-text">{order.addressSnapshot.label} Address</p>
              <p>{order.addressSnapshot.line1}</p>
              {order.addressSnapshot.line2 && <p>{order.addressSnapshot.line2}</p>}
              <p>{order.addressSnapshot.city}, {order.addressSnapshot.state} - <strong className="text-text">{order.addressSnapshot.pincode}</strong></p>
              <p className="text-text-muted">Contact: {order.addressSnapshot.phone}</p>
            </div>
            
            <div className="border-t border-border pt-3 space-y-2 mt-2">
              <div className="flex justify-between text-text-muted">
                <span>Subtotal</span>
                <span>₹{order.subtotal}</span>
              </div>
              {order.discount > 0 && (
                <div className="flex justify-between text-primary-800 font-medium">
                  <span>Discount Applied</span>
                  <span>- ₹{order.discount}</span>
                </div>
              )}
              {order.pointsRedeemed > 0 && (
                <div className="flex justify-between text-primary-800 font-medium">
                  <span>Points Redeemed</span>
                  <span>- ₹{order.pointsRedeemed}</span>
                </div>
              )}
              <div className="flex justify-between text-text-muted">
                <span>Shipping Fee</span>
                <span>₹{order.deliveryFee}</span>
              </div>
              <div className="flex justify-between border-t border-border pt-2 font-bold text-text">
                <span>Total Paid</span>
                <span>₹{order.total}</span>
              </div>
            </div>
          </div>

          {/* Resend Transactional Email Preview */}
          <div className="bg-background border border-border rounded-2xl p-5 space-y-4">
            <h4 className="font-display font-bold text-xs text-text-muted uppercase tracking-wider flex items-center gap-1.5">
              <Mail size={14} className="text-[#B5704D]" />
              Resend Transactional Email Preview
            </h4>
            
            {/* Visual HTML Email Rendering inside the card */}
            <div className="bg-white border border-border rounded-xl p-4 text-[10px] text-text/80 space-y-3 leading-relaxed shadow-inner">
              <div className="border-b border-border pb-2 text-center">
                <span className="font-display font-black text-sm text-primary block">SafeSnack</span>
                <span className="text-[8px] text-text-muted block mt-0.5">Order Receipt Confirmation</span>
              </div>
              
              <p>Hi {MockDatabase.getProfile().name},</p>
              <p>Thank you for shopping with SafeSnack. We have received your payment of <strong>₹{order.total}</strong> via Razorpay. Your order is now being processed.</p>
              
              <div className="bg-surface/10 p-2.5 rounded border border-border text-[9px]">
                <p className="font-bold text-text/80">Order Summary:</p>
                <ul className="mt-1 space-y-1">
                  {order.items.map((item, idx) => {
                    let label = "";
                    if (item.variantId) {
                      const v = MockDatabase.getVariants().find(x => x.id === item.variantId);
                      const p = MockDatabase.getProducts().find(x => x.id === v?.productId);
                      label = p ? `${p.name} (${v?.label})` : item.variantId;
                    } else {
                      const b = MockDatabase.getBundles().find(x => x.id === item.bundleId);
                      label = b ? `Bundle: ${b.name}` : item.bundleId || "";
                    }
                    return (
                      <li key={idx} className="flex justify-between">
                        <span>{item.qty} &times; {label}</span>
                        <span>₹{item.lineTotal}</span>
                      </li>
                    );
                  })}
                </ul>
              </div>

              <div className="text-[9px]">
                <p className="font-bold text-text/80">Shipping To:</p>
                <p className="text-text-muted mt-0.5">
                  {order.addressSnapshot.line1}, Pincode: {order.addressSnapshot.pincode}
                </p>
              </div>

              <p className="text-center text-[8px] text-text-muted pt-2 border-t border-border">
                SafeSnack Originals, Hyderabad, India. Powered by Resend API.
              </p>
            </div>
            
            <p className="text-[9px] text-text-muted text-center leading-snug">
              Note: This mock email preview is generated client-side simulating a Resend webhook response.
            </p>
          </div>

        </div>

      </div>
    </div>
  );
}

function AlertIcon() {
  return <AlertCircle size={28} className="text-[#B5704D] mx-auto" />;
}
