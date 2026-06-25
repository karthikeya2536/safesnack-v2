"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { User, Gift, Clock, ShoppingBag, Eye, Calendar, ArrowRight, ShieldCheck } from "lucide-react";
import { MockDatabase, Order, Profile, RewardPointLedger } from "@/lib/db/mock-db";
import { Button } from "@/components/ui/button";

export default function CustomerOrdersPage() {
  const [profile, setProfile] = useState<Profile | null>(null);
  const [orders, setOrders] = useState<Order[]>([]);
  const [pointsHistory, setPointsHistory] = useState<RewardPointLedger[]>([]);

  useEffect(() => {
    MockDatabase.init();
    setProfile(MockDatabase.getProfile());
    
    // Fetch orders for this customer (user-cust)
    const userOrders = MockDatabase.getOrders()
      .filter(o => o.userId === "user-cust")
      .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
    setOrders(userOrders);

    // Fetch reward points history
    const userLedger = MockDatabase.getPointsLedger()
      .filter(l => l.userId === "user-cust")
      .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
    setPointsHistory(userLedger);
  }, []);

  if (!profile) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8 text-left animate-fade-in">
      
      {/* Page Header */}
      <div className="border-b border-border pb-6">
        <h1 className="font-display font-black text-3xl text-text tracking-tight">
          Customer Dashboard
        </h1>
        <p className="text-xs text-text-muted mt-1">
          Monitor your active orders, track express delivery, and review your SafeSnack loyalty rewards ledger.
        </p>
      </div>

      {/* Main Grid: Info Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        
        {/* Profile Card */}
        <div className="bg-background border border-border rounded-2xl p-6 space-y-4">
          <h3 className="font-display font-bold text-sm text-text-muted uppercase tracking-wider flex items-center gap-1.5 border-b border-border pb-2">
            <User size={16} className="text-primary" />
            Profile Details
          </h3>
          <div className="space-y-2 text-xs text-text/70">
            <div>
              <span className="block text-[10px] text-text-muted font-bold uppercase">Name</span>
              <span className="font-semibold text-text">{profile.name}</span>
            </div>
            <div>
              <span className="block text-[10px] text-text-muted font-bold uppercase">Phone</span>
              <span className="font-medium">{profile.phone}</span>
            </div>
            <div>
              <span className="block text-[10px] text-text-muted font-bold uppercase">Email</span>
              <span className="font-medium">{profile.email}</span>
            </div>
            <div>
              <span className="block text-[10px] text-text-muted font-bold uppercase">Referral Code</span>
              <span className="font-bold text-clay bg-clay/5 border border-clay/10 px-2 py-0.5 rounded inline-block mt-0.5">
                {profile.referralCode}
              </span>
            </div>
          </div>
        </div>

        {/* Loyalty Points Card */}
        <div className="bg-background border border-border rounded-2xl p-6 space-y-4 md:col-span-2">
          <h3 className="font-display font-bold text-sm text-text-muted uppercase tracking-wider flex items-center gap-1.5 border-b border-border pb-2">
            <Gift size={16} className="text-clay" />
            Loyalty Points Balance
          </h3>
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="space-y-1">
              <span className="text-3xl font-display font-black text-text">{profile.pointsBalance}</span>
              <span className="text-xs text-text-muted block">Available Points (1 Point = ₹1 Discount)</span>
            </div>
            <div className="text-[10px] bg-primary/15 border border-primary/20 text-primary p-3 rounded-xl max-w-xs">
              <strong>Earning Rule:</strong> Earn 1 point per ₹10 spent. Redeem points on any checkout to save up to 20% of your order total.
            </div>
          </div>
        </div>

      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        
        {/* Left Column: Order History */}
        <div className="lg:col-span-8 space-y-4">
          <h3 className="font-display font-bold text-lg text-text pb-1 border-b border-border flex items-center gap-1.5">
            <ShoppingBag size={18} className="text-primary" />
            Your Order History ({orders.length})
          </h3>

          {orders.length === 0 ? (
            <div className="bg-surface/10 rounded-2xl p-12 text-center text-xs text-text-muted">
              No orders found. Fill your cart with SafeSnack Originals to place your first order!
            </div>
          ) : (
            <div className="space-y-4">
              {orders.map((o) => (
                <div
                  key={o.id}
                  className="bg-background border border-border rounded-2xl p-5 hover:border-sage transition-all flex flex-col sm:flex-row justify-between sm:items-center gap-4"
                >
                  <div className="text-left space-y-1 text-xs text-text/70">
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-text">Order ID: {o.id}</span>
                      <span className="bg-sage/35 text-text px-2.5 py-0.5 rounded-full text-[10px] font-bold">
                        {new Date(o.timestamp).toLocaleDateString()}
                      </span>
                    </div>
                    <p className="line-clamp-1 max-w-sm">
                      Delivery to: {o.addressSnapshot.line1}, {o.addressSnapshot.pincode}
                    </p>
                    <div className="flex gap-4 pt-1">
                      <span>Total: <strong className="text-text">₹{o.total}</strong></span>
                      <span>Items: <strong className="text-text">{o.items.length}</strong></span>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 justify-between sm:justify-end">
                    <span className="bg-primary/10 border border-primary/20 text-primary text-[10px] font-bold px-3 py-1 rounded-full uppercase tracking-wider">
                      {o.status.replace(/_/g, " ")}
                    </span>
                    <Link href={`/orders/${o.id}`}>
                      <Button variant="outline" size="sm" className="flex items-center gap-1 cursor-pointer py-2 px-3 text-xs">
                        <Eye size={12} />
                        Track
                      </Button>
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Right Column: Loyalty Ledger timeline */}
        <div className="lg:col-span-4 space-y-4">
          <h3 className="font-display font-bold text-lg text-text pb-1 border-b border-border flex items-center gap-1.5">
            <Clock size={18} className="text-[#B5704D]" />
            Rewards Ledger Log
          </h3>

          <div className="bg-background border border-border rounded-2xl p-5 space-y-4 max-h-[350px] overflow-y-auto pr-1">
            {pointsHistory.length === 0 ? (
              <p className="text-xs text-text-muted text-center py-6">No points movements recorded.</p>
            ) : (
              <div className="relative border-l border-border pl-4 ml-2 space-y-4 text-left text-xs">
                {pointsHistory.map((item) => {
                  const isEarn = item.delta > 0;
                  return (
                    <div key={item.id} className="relative space-y-0.5">
                      {/* Timeline dot */}
                      <span className={`absolute -left-[21px] top-1 w-2.5 h-2.5 rounded-full border ${isEarn ? "bg-primary border-primary" : "bg-clay border-clay"}`} />
                      
                      <div className="flex items-center justify-between">
                        <span className={`font-bold ${isEarn ? "text-primary" : "text-clay"}`}>
                          {isEarn ? `+${item.delta}` : item.delta} Points
                        </span>
                        <span className="text-[9px] text-text-muted">
                          {new Date(item.timestamp).toLocaleDateString()}
                        </span>
                      </div>
                      <p className="text-text-muted leading-tight text-[11px]">{item.reason}</p>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>

      </div>

    </div>
  );
}
