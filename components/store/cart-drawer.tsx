"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { X, Minus, Plus, ShoppingBag, MapPin, Tag, Gift, Trash2 } from "lucide-react";
import { useCart } from "@/lib/context/cart-context";
import { MockDatabase } from "@/lib/db/mock-db";
import { Button } from "../ui/button";

export const CartDrawer: React.FC = () => {
  const {
    cart,
    isCartOpen,
    setIsCartOpen,
    updateQty,
    removeFromCart,
    coupon,
    applyCoupon,
    removeCoupon,
    pointsRedeemed,
    setPointsRedeemed,
    pincode,
    pincodeZone,
    validatePincode,
    cartSubtotal,
    cartDiscount,
    cartDeliveryFee,
    cartTotal,
  } = useCart();

  const [couponInput, setCouponInput] = useState("");
  const [couponError, setCouponError] = useState("");
  const [couponSuccess, setCouponSuccess] = useState("");
  
  const [pinInput, setPinInput] = useState("");
  const [pinError, setPinError] = useState("");
  const [pinSuccess, setPinSuccess] = useState("");

  const [redeemPointsToggle, setRedeemPointsToggle] = useState(false);
  const [userPoints, setUserPoints] = useState(0);

  useEffect(() => {
    if (isCartOpen) {
      document.body.style.overflow = "hidden";
      const profile = MockDatabase.getProfile();
      setUserPoints(profile.pointsBalance);
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [isCartOpen]);

  if (!isCartOpen) return null;

  const handleCouponSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setCouponError("");
    setCouponSuccess("");
    if (!couponInput) return;

    const res = applyCoupon(couponInput);
    if (res.success) {
      setCouponSuccess(res.message);
      setCouponInput("");
    } else {
      setCouponError(res.message);
    }
  };

  const handlePincodeSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setPinError("");
    setPinSuccess("");
    if (!pinInput) return;

    const res = validatePincode(pinInput);
    if (res.success) {
      setPinSuccess(res.message);
    } else {
      setPinError(res.message);
    }
  };

  const handlePointsCheckboxChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setRedeemPointsToggle(e.target.checked);
    if (!e.target.checked) {
      setPointsRedeemed(0);
    } else {
      // Calculate max allowed redemption (capped at 20% of subtotal after coupon, or user balance, whichever is lower)
      const afterCoupon = Math.max(0, cartSubtotal - cartDiscount);
      const cap = Math.floor(afterCoupon * 0.2);
      const redeem = Math.min(userPoints, cap);
      setPointsRedeemed(redeem);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex justify-end">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-text/20 backdrop-blur-md transition-opacity duration-300"
        onClick={() => setIsCartOpen(false)}
      />

      {/* Drawer */}
      <div className="relative w-full max-w-md bg-background h-full shadow-2xl flex flex-col z-10 border-l border-border animate-fade-in">
        {/* Header */}
        <div className="flex items-center justify-between p-5 border-b border-border">
          <div className="flex items-center gap-2">
            <ShoppingBag size={20} className="text-primary" />
            <h3 className="font-display text-lg font-bold text-text">
              Your Snack Cart
            </h3>
            <span className="bg-surface text-text text-xs px-2.5 py-0.5 rounded-full font-bold">
              {cart.reduce((sum, item) => sum + item.qty, 0)}
            </span>
          </div>
          <button
            onClick={() => setIsCartOpen(false)}
            className="p-1.5 rounded-full hover:bg-surface text-text-muted hover:text-text transition-all active:scale-90 cursor-pointer"
          >
            <X size={18} />
          </button>
        </div>

        {/* Scrollable Items */}
        <div className="flex-1 overflow-y-auto p-5 space-y-4">
          {cart.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-64 text-center">
              <div className="w-16 h-16 bg-surface rounded-full flex items-center justify-center text-text-muted mb-4">
                <ShoppingBag size={28} />
              </div>
              <h4 className="font-display font-bold text-text/80 text-base">Your cart is empty</h4>
              <p className="text-xs text-text-muted mt-1 max-w-[250px]">
                Fill it with SafeSnack Originals or curated partner blends to start your healthy snacking journey.
              </p>
              <Button
                variant="primary"
                size="sm"
                className="mt-5 cursor-pointer"
                onClick={() => setIsCartOpen(false)}
              >
                Start Snacking
              </Button>
            </div>
          ) : (
            <>
              {cart.map((item) => (
                <div
                  key={item.id}
                  className="flex gap-3 p-3 bg-surface/60 border border-border rounded-2xl hover:border-accent/30 hover:bg-surface transition-all duration-300 shadow-xs"
                >
                  {/* Thumb */}
                  <img
                    src={item.image}
                    alt={item.name}
                    className="w-16 h-16 rounded-lg object-cover bg-surface border border-border"
                  />
                  {/* Details */}
                  <div className="flex-1 flex flex-col justify-between">
                    <div>
                      <div className="flex items-start justify-between gap-1">
                        <div>
                          <span className="text-[9px] uppercase tracking-wider text-text-muted font-medium block">
                            {item.isBundle ? "Curated Bundle" : item.brandName}
                          </span>
                          <h5 className="text-xs font-bold text-text line-clamp-1 leading-tight mt-0.5">
                            {item.name}
                          </h5>
                          {item.label && (
                            <span className="text-[10px] text-text-muted leading-none">
                              Size: {item.label}
                            </span>
                          )}
                        </div>
                        <button
                          onClick={() => removeFromCart(item.id)}
                          className="text-text-muted hover:text-rose-700 p-0.5 rounded-full hover:bg-surface transition-colors cursor-pointer"
                        >
                          <Trash2 size={13} />
                        </button>
                      </div>
                    </div>

                    {/* Qty & Price Row */}
                    <div className="flex items-center justify-between mt-2">
                      <div className="flex items-center border border-border rounded-full bg-surface/50">
                        <button
                          onClick={() => updateQty(item.id, item.qty - 1)}
                          className="px-2 py-1 text-text-muted hover:text-text cursor-pointer"
                        >
                          <Minus size={11} />
                        </button>
                        <span className="text-xs font-bold px-1.5 min-w-[20px] text-center text-text">
                          {item.qty}
                        </span>
                        <button
                          onClick={() => updateQty(item.id, item.qty + 1)}
                          className="px-2 py-1 text-text-muted hover:text-text cursor-pointer"
                        >
                          <Plus size={11} />
                        </button>
                      </div>
                      <span className="font-display font-bold text-xs text-text">
                        ₹{item.price * item.qty}
                      </span>
                    </div>
                  </div>
                </div>
              ))}

              {/* Delivery Zone Pincode Checker */}
              <div className="border-t border-border pt-4 mt-6">
                <div className="flex items-center gap-1.5 text-xs text-text-muted font-semibold mb-2">
                  <MapPin size={14} className="text-primary" />
                  Hyderabad Delivery Zone Check
                </div>
                <form onSubmit={handlePincodeSubmit} className="flex gap-2">
                  <input
                    type="text"
                    maxLength={6}
                    placeholder="Enter pincode (e.g., 500081)"
                    value={pinInput}
                    onChange={(e) => setPinInput(e.target.value.replace(/\D/g, ""))}
                    className="flex-1 text-xs bg-background border border-border rounded-lg px-3 py-2 text-text focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary/20"
                  />
                  <Button variant="outline" size="sm" type="submit" className="py-2.5 px-4 cursor-pointer text-xs">
                    Verify
                  </Button>
                </form>
                {pinError && <p className="text-[10px] text-rose-700 mt-1">{pinError}</p>}
                {pinSuccess && <p className="text-[10px] text-success mt-1">{pinSuccess}</p>}
              </div>

              {/* Coupon Code Input */}
              <div className="border-t border-border pt-4">
                <div className="flex items-center gap-1.5 text-xs text-text-muted font-semibold mb-2">
                  <Tag size={14} className="text-accent" />
                  Apply Discount Coupon
                </div>
                {coupon ? (
                  <div className="flex items-center justify-between bg-success/10 border border-success/20 rounded-lg p-2 text-xs">
                    <span className="text-success font-medium flex items-center gap-1.5">
                      <Tag size={12} />
                      Code: {coupon.code} Applied (₹{cartDiscount} off)
                    </span>
                    <button
                      onClick={removeCoupon}
                      className="text-text-muted hover:text-rose-700 cursor-pointer"
                    >
                      Remove
                    </button>
                  </div>
                ) : (
                  <form onSubmit={handleCouponSubmit} className="flex gap-2">
                    <input
                      type="text"
                      placeholder="Coupon Code (SUGARFREE, WELCOME10)"
                      value={couponInput}
                      onChange={(e) => setCouponInput(e.target.value)}
                      className="flex-1 text-xs bg-background border border-border rounded-lg px-3 py-2 text-text focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary/20"
                    />
                    <Button variant="outline" size="sm" type="submit" className="py-2.5 px-4 cursor-pointer text-xs">
                      Apply
                    </Button>
                  </form>
                )}
                {couponError && <p className="text-[10px] text-rose-700 mt-1">{couponError}</p>}
                {couponSuccess && <p className="text-[10px] text-success mt-1">{couponSuccess}</p>}
              </div>

              {/* Loyalty Reward Points Redemption */}
              {userPoints > 0 && (
                <div className="border-t border-border pt-4">
                  <label className="flex items-start gap-2.5 cursor-pointer bg-surface/50 hover:bg-surface border border-border p-3 rounded-lg transition-colors">
                    <input
                      type="checkbox"
                      checked={redeemPointsToggle}
                      onChange={handlePointsCheckboxChange}
                      className="mt-0.5 rounded text-primary focus:ring-primary cursor-pointer"
                    />
                    <div>
                      <span className="text-xs font-semibold text-text flex items-center gap-1">
                        <Gift size={13} className="text-accent" />
                        Redeem Loyalty Points
                      </span>
                      <p className="text-[10px] text-text-muted mt-0.5">
                        You have {userPoints} points. Redeem to save up to 20% of your cart value (₹1 = 1 point).
                      </p>
                    </div>
                  </label>
                  {redeemPointsToggle && pointsRedeemed > 0 && (
                    <p className="text-[10px] text-success font-medium mt-1">
                      ✓ Applied {pointsRedeemed} reward points for ₹{pointsRedeemed} discount!
                    </p>
                  )}
                </div>
              )}
            </>
          )}
        </div>

        {/* Footer Calculations */}
        {cart.length > 0 && (
          <div className="p-5 border-t border-border bg-surface/40 space-y-3">
            <div className="space-y-1.5 text-xs text-text-muted">
              <div className="flex justify-between">
                <span>Subtotal</span>
                <span className="font-bold text-text">₹{cartSubtotal}</span>
              </div>
              {cartDiscount > 0 && (
                <div className="flex justify-between text-success">
                  <span>Coupon Discount</span>
                  <span>- ₹{cartDiscount}</span>
                </div>
              )}
              {pointsRedeemed > 0 && (
                <div className="flex justify-between text-success">
                  <span>Points Discount</span>
                  <span>- ₹{pointsRedeemed}</span>
                </div>
              )}
              <div className="flex justify-between">
                <span>Delivery Fee {pincodeZone && cartDeliveryFee === 0 && <span className="text-success text-[10px]">(Free)</span>}</span>
                <span className="font-bold text-text">
                  {pincodeZone ? `₹${cartDeliveryFee}` : "Verify pincode"}
                </span>
              </div>
            </div>

            <div className="flex justify-between items-end border-t border-border pt-3">
              <div>
                <span className="text-xs text-text-muted block leading-tight">Total Amount</span>
                <span className="font-display font-bold text-xl text-text leading-none">
                  ₹{cartTotal}
                </span>
              </div>

              <Link href="/checkout" onClick={() => setIsCartOpen(false)}>
                <Button variant="primary" className="py-2.5 px-6 font-semibold cursor-pointer text-xs">
                  Checkout
                </Button>
              </Link>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
