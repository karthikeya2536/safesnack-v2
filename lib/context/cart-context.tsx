"use client";

import React, { createContext, useContext, useState, useEffect } from "react";
import { MockDatabase, Variant, Bundle, Coupon, DeliveryZone } from "@/lib/db/mock-db";

export interface CartItem {
  id: string; // variantId or bundleId
  variantId?: string;
  bundleId?: string;
  qty: number;
  price: number;
  name: string;
  sku?: string;
  label?: string; // variant size label (e.g. 50g)
  image: string;
  brandName?: string;
  isBundle: boolean;
}

interface CartContextType {
  cart: CartItem[];
  isCartOpen: boolean;
  setIsCartOpen: (open: boolean) => void;
  addToCart: (item: Omit<CartItem, "qty">, qty?: number) => void;
  removeFromCart: (id: string) => void;
  updateQty: (id: string, qty: number) => void;
  clearCart: () => void;
  
  // Checkout hooks
  coupon: Coupon | null;
  applyCoupon: (code: string) => { success: boolean; message: string };
  removeCoupon: () => void;
  pointsRedeemed: number;
  setPointsRedeemed: (points: number) => void;
  pincode: string;
  pincodeZone: DeliveryZone | null;
  validatePincode: (pin: string) => { success: boolean; message: string };
  
  // Calculations
  cartSubtotal: number;
  cartDiscount: number;
  cartDeliveryFee: number;
  cartTotal: number;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export const CartProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [cart, setCart] = useState<CartItem[]>([]);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [coupon, setCoupon] = useState<Coupon | null>(null);
  const [pointsRedeemed, setPointsRedeemed] = useState(0);
  const [pincode, setPincode] = useState("");
  const [pincodeZone, setPincodeZone] = useState<DeliveryZone | null>(null);

  // Initialize DB and load cart from localStorage
  useEffect(() => {
    MockDatabase.init();
    const storedCart = localStorage.getItem("ss_cart");
    if (storedCart) {
      setCart(JSON.parse(storedCart));
    }
  }, []);

  // Save cart to localStorage
  const saveCart = (newCart: CartItem[]) => {
    setCart(newCart);
    localStorage.setItem("ss_cart", JSON.stringify(newCart));
  };

  const addToCart = (item: Omit<CartItem, "qty">, qty = 1) => {
    const newCart = [...cart];
    const existingIdx = newCart.findIndex((i) => i.id === item.id);

    if (existingIdx >= 0) {
      newCart[existingIdx].qty += qty;
    } else {
      newCart.push({ ...item, qty });
    }

    saveCart(newCart);
    setIsCartOpen(true);

    // Log Analytics Event
    MockDatabase.logEvent({
      type: "ADD_TO_CART",
      sessionId: "demo-session",
      productId: item.isBundle ? undefined : item.id,
      value: item.price * qty,
      metadata: JSON.stringify({ name: item.name, qty })
    });
  };

  const removeFromCart = (id: string) => {
    const newCart = cart.filter((i) => i.id !== id);
    saveCart(newCart);
  };

  const updateQty = (id: string, qty: number) => {
    if (qty <= 0) {
      removeFromCart(id);
      return;
    }
    const newCart = cart.map((item) => (item.id === id ? { ...item, qty } : item));
    saveCart(newCart);
  };

  const clearCart = () => {
    saveCart([]);
    setCoupon(null);
    setPointsRedeemed(0);
    setPincode("");
    setPincodeZone(null);
  };

  const applyCoupon = (code: string) => {
    const cleaned = code.trim().toUpperCase();
    const coupons = MockDatabase.getCoupons();
    const found = coupons.find((c) => c.code === cleaned && c.active);

    if (!found) {
      return { success: false, message: "Invalid or inactive coupon code." };
    }

    // Check expiration
    if (new Date(found.expiresAt).getTime() < new Date().getTime()) {
      return { success: false, message: "This coupon code has expired." };
    }

    const subtotal = cart.reduce((sum, item) => sum + item.price * item.qty, 0);
    if (subtotal < found.minOrder) {
      return { success: false, message: `Minimum order of ₹${found.minOrder} is required for this coupon.` };
    }

    setCoupon(found);
    return { success: true, message: "Coupon applied successfully!" };
  };

  const removeCoupon = () => {
    setCoupon(null);
  };

  const validatePincode = (pin: string) => {
    const zones = MockDatabase.getDeliveryZones();
    const found = zones.find((z) => z.pincode === pin);

    if (!found) {
      setPincodeZone(null);
      setPincode("");
      return {
        success: false,
        message: "We currently only deliver to select areas in Hyderabad (e.g., 500081, 500032, 500008, 500001, 500003).",
      };
    }

    setPincode(pin);
    setPincodeZone(found);
    return { success: true, message: `Delivering to ${found.area}. Delivery fee: ₹${found.deliveryFee}. ETA: ${found.etaMinutes} mins.` };
  };

  // Calculations
  const cartSubtotal = cart.reduce((sum, item) => sum + item.price * item.qty, 0);
  
  let cartDiscount = 0;
  if (coupon) {
    if (coupon.type === "PERCENT") {
      cartDiscount = (cartSubtotal * coupon.value) / 100;
      if (coupon.maxDiscount && cartDiscount > coupon.maxDiscount) {
        cartDiscount = coupon.maxDiscount;
      }
    } else {
      cartDiscount = coupon.value;
    }
  }

  // Points redemption calculation (1 point = 1 Rupee, capped at 20% of order subtotal after coupon)
  const remainingAfterCoupon = Math.max(0, cartSubtotal - cartDiscount);
  const maxPointsAllowed = Math.floor(remainingAfterCoupon * 0.2);
  const actualPointsRedeemed = Math.min(pointsRedeemed, maxPointsAllowed);

  // Delivery fee logic: Free delivery if subtotal after discount is above the delivery zone minOrder
  let cartDeliveryFee = 0;
  if (pincodeZone) {
    cartDeliveryFee = remainingAfterCoupon >= pincodeZone.minOrder ? 0 : pincodeZone.deliveryFee;
  }

  const cartTotal = Math.max(0, remainingAfterCoupon - actualPointsRedeemed + cartDeliveryFee);

  return (
    <CartContext.Provider
      value={{
        cart,
        isCartOpen,
        setIsCartOpen,
        addToCart,
        removeFromCart,
        updateQty,
        clearCart,
        coupon,
        applyCoupon,
        removeCoupon,
        pointsRedeemed: actualPointsRedeemed,
        setPointsRedeemed,
        pincode,
        pincodeZone,
        validatePincode,
        cartSubtotal,
        cartDiscount,
        cartDeliveryFee,
        cartTotal,
      }}
    >
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error("useCart must be used within a CartProvider");
  }
  return context;
};
