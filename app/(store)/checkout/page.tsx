"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { 
  ShieldCheck, 
  Tag, 
  Gift, 
  MapPin, 
  CreditCard, 
  Lock, 
  ArrowLeft, 
  ShoppingBag, 
  Check, 
  Edit3, 
  User, 
  Truck, 
  Loader2 
} from "lucide-react";
import { useCart } from "@/lib/context/cart-context";
import { MockDatabase, Address } from "@/lib/db/mock-db";
import { Button } from "@/components/ui/button";

export default function CheckoutPage() {
  const router = useRouter();
  const {
    cart,
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
    clearCart,
  } = useCart();

  const [step, setStep] = useState<1 | 2 | 3>(1);

  const [addressForm, setAddressForm] = useState({
    line1: "Plot 42, HUDA Heights",
    line2: "Near Botanical Garden, Kondapur",
    city: "Hyderabad",
    state: "Telangana",
    pincode: pincode || "500081",
    label: "Home",
  });

  const [contactForm, setContactForm] = useState({
    name: "",
    phone: "",
    email: "",
  });

  const [pinError, setPinError] = useState("");
  const [pinSuccess, setPinSuccess] = useState("");
  const [couponInput, setCouponInput] = useState("");
  const [couponError, setCouponError] = useState("");
  const [couponSuccess, setCouponSuccess] = useState("");

  const [userPoints, setUserPoints] = useState(0);
  const [redeemPointsToggle, setRedeemPointsToggle] = useState(pointsRedeemed > 0);

  // Razorpay simulation state
  const [showRazorpayModal, setShowRazorpayModal] = useState(false);
  const [isProcessingOrder, setIsProcessingOrder] = useState(false);
  const [simulatedRpOrderId, setSimulatedRpOrderId] = useState("");
  const [isPaying, setIsPaying] = useState(false);

  useEffect(() => {
    MockDatabase.init();
    const profile = MockDatabase.getProfile();
    setContactForm({
      name: profile.name,
      phone: profile.phone,
      email: profile.email,
    });
    setUserPoints(profile.pointsBalance);

    if (pincode) {
      const res = validatePincode(pincode);
      if (res.success) setPinSuccess(res.message);
    }

    // Log Begin Checkout Analytics
    if (cart.length > 0) {
      MockDatabase.logEvent({
        type: "BEGIN_CHECKOUT",
        sessionId: "demo-session",
        value: cartTotal,
        metadata: JSON.stringify({ itemsCount: cart.length })
      });
    }
  }, []);

  const handlePincodeBlur = () => {
    setPinError("");
    setPinSuccess("");
    if (!addressForm.pincode) return;

    const res = validatePincode(addressForm.pincode);
    if (res.success) {
      setPinSuccess(res.message);
    } else {
      setPinError(res.message);
    }
  };

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

  const handlePointsCheckboxChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setRedeemPointsToggle(e.target.checked);
    if (!e.target.checked) {
      setPointsRedeemed(0);
    } else {
      const afterCoupon = Math.max(0, cartSubtotal - cartDiscount);
      const cap = Math.floor(afterCoupon * 0.2);
      const redeem = Math.min(userPoints, cap);
      setPointsRedeemed(redeem);
    }
  };

  // Form submit router that handles step advancement or final placement
  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (step === 1) {
      setStep(2);
    } else if (step === 2) {
      if (!pincodeZone) {
        setPinError("Please verify a valid Hyderabad pincode for delivery zone rates.");
        return;
      }
      setStep(3);
    } else {
      triggerPlaceOrder();
    }
  };

  // Place Order (Trigger Simulated Payment Modal)
  const triggerPlaceOrder = () => {
    if (cart.length === 0) return;
    
    if (!pincodeZone) {
      setPinError("Please verify a valid Hyderabad pincode for delivery zone rates.");
      setStep(2);
      return;
    }

    setIsProcessingOrder(true);
    
    // Create Address Object
    const deliveryAddress: Address = {
      id: `addr-${Math.random().toString(36).substr(2, 9)}`,
      userId: "user-cust",
      ...addressForm,
      phone: contactForm.phone
    };

    // Create PENDING Order in local DB
    const orderItems = cart.map(item => ({
      id: `oi-${Math.random().toString(36).substr(2, 9)}`,
      variantId: item.isBundle ? undefined : item.variantId,
      bundleId: item.isBundle ? item.bundleId : undefined,
      qty: item.qty,
      unitPrice: item.price,
      lineTotal: item.price * item.qty
    }));

    const order = MockDatabase.createOrder({
      userId: "user-cust",
      status: "PENDING_PAYMENT",
      subtotal: cartSubtotal,
      discount: cartDiscount,
      deliveryFee: cartDeliveryFee,
      total: cartTotal,
      couponId: coupon?.id,
      couponCode: coupon?.code,
      addressSnapshot: deliveryAddress,
      pointsEarned: 0,
      pointsRedeemed: pointsRedeemed,
      items: orderItems,
      etaMinutes: pincodeZone.etaMinutes
    });

    setSimulatedRpOrderId(order.id);
    setIsProcessingOrder(false);
    setShowRazorpayModal(true);
  };

  // Simulated Razorpay Successful Payment
  const handlePaymentSuccess = () => {
    setIsPaying(true);
    setTimeout(() => {
      setShowRazorpayModal(false);
      setIsProcessingOrder(true);
      
      const paymentId = `pay_${Math.random().toString(36).substr(2, 9)}`;
      // Run FEFO deduction and flag as PAID
      MockDatabase.payOrder(simulatedRpOrderId, paymentId);
      
      // Clear global context cart
      clearCart();
      setIsProcessingOrder(false);
      setIsPaying(false);
      
      // Redirect to success screen
      router.push(`/orders/${simulatedRpOrderId}?success=true`);
    }, 1500);
  };

  // Simulated Razorpay Failed Payment
  const handlePaymentFailure = () => {
    setIsPaying(true);
    setTimeout(() => {
      setShowRazorpayModal(false);
      setIsPaying(false);
      alert("Simulated Razorpay Payment Failed. You can try checking out again or click simulated success.");
    }, 1000);
  };

  if (cart.length === 0) {
    return (
      <div className="max-w-xl mx-auto px-4 py-20 text-center space-y-6 animate-fade-in">
        <div className="w-20 h-20 bg-surface/20 rounded-full flex items-center justify-center text-primary mx-auto shadow-inner">
          <ShoppingBag size={32} className="stroke-[1.5]" />
        </div>
        <h2 className="font-display font-black text-2xl text-text">Your Cart is Empty</h2>
        <p className="text-xs text-text-muted max-w-sm mx-auto leading-relaxed">
          Add items to your cart from our shop page to proceed to checkout.
        </p>
        <div className="pt-2">
          <Link href="/products">
            <Button variant="primary" className="text-xs px-6 py-2.5 font-bold cursor-pointer rounded-full bg-primary hover:bg-primary-hover text-white transition-all shadow-sm">
              Go To Shop
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 text-left space-y-8 animate-fade-in">
      
      {/* Back Button */}
      <Link href="/products" className="inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-text-muted hover:text-primary transition-colors">
        <ArrowLeft size={14} />
        Back to Shop
      </Link>

      {/* Stepped Progress Bar */}
      <div className="max-w-2xl mx-auto bg-surface/40 border border-border rounded-3xl p-6 shadow-xs">
        <div className="flex items-center justify-between">
          <button 
            type="button" 
            onClick={() => step > 1 && setStep(1)}
            className="flex flex-col items-center flex-1 cursor-pointer focus:outline-none"
          >
            <div className={`w-10 h-10 rounded-full flex items-center justify-center text-xs font-bold transition-all duration-300 ${
              step > 1 
                ? 'bg-primary text-white shadow-md' 
                : step === 1 
                  ? 'bg-accent text-white shadow-lg ring-4 ring-accent/20' 
                  : 'bg-surface/40 text-text-muted'
            }`}>
              {step > 1 ? <Check size={16} className="stroke-[3]" /> : <User size={16} />}
            </div>
            <span className={`text-[10px] font-bold uppercase tracking-wider mt-2 transition-colors ${
              step === 1 ? 'text-accent' : 'text-text-muted'
            }`}>1. Info</span>
          </button>

          <div className={`flex-1 h-0.5 mx-4 transition-all duration-500 ${step >= 2 ? 'bg-primary' : 'bg-surface/40'}`}></div>

          <button 
            type="button" 
            onClick={() => step > 2 && setStep(2)}
            disabled={step < 2}
            className={`flex flex-col items-center flex-1 focus:outline-none ${step >= 2 ? 'cursor-pointer' : 'cursor-not-allowed'}`}
          >
            <div className={`w-10 h-10 rounded-full flex items-center justify-center text-xs font-bold transition-all duration-300 ${
              step > 2 
                ? 'bg-primary text-white shadow-md' 
                : step === 2 
                  ? 'bg-accent text-white shadow-lg ring-4 ring-accent/20' 
                  : 'bg-surface/40 text-text-muted'
            }`}>
              {step > 2 ? <Check size={16} className="stroke-[3]" /> : <Truck size={16} />}
            </div>
            <span className={`text-[10px] font-bold uppercase tracking-wider mt-2 transition-colors ${
              step === 2 ? 'text-accent' : 'text-text-muted'
            }`}>2. Delivery</span>
          </button>

          <div className={`flex-1 h-0.5 mx-4 transition-all duration-500 ${step >= 3 ? 'bg-primary' : 'bg-surface/40'}`}></div>

          <div className="flex flex-col items-center flex-1">
            <div className={`w-10 h-10 rounded-full flex items-center justify-center text-xs font-bold transition-all duration-300 ${
              step === 3 
                ? 'bg-accent text-white shadow-lg ring-4 ring-accent/20' 
                : 'bg-surface/40 text-text-muted'
            }`}>
              <CreditCard size={16} />
            </div>
            <span className={`text-[10px] font-bold uppercase tracking-wider mt-2 transition-colors ${
              step === 3 ? 'text-accent' : 'text-text-muted'
            }`}>3. Payment</span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-start">
        
        {/* Left Column: Forms */}
        <form onSubmit={handleFormSubmit} className="lg:col-span-7 space-y-6">
          
          {/* STEP 1: CONTACT INFORMATION */}
          <div className={`bg-surface border rounded-3xl p-6 transition-all duration-500 ${
            step === 1 
              ? 'border-gold shadow-md' 
              : 'border-border opacity-80 shadow-xs'
          }`}>
            {step > 1 ? (
              <div className="flex items-center justify-between">
                <div className="space-y-1">
                  <h3 className="font-display font-bold text-sm text-text-muted flex items-center gap-2">
                    <span className="w-5 h-5 bg-primary text-white rounded-full flex items-center justify-center text-[10px] font-bold">✓</span>
                    Contact Information
                  </h3>
                  <p className="text-xs text-text font-medium pl-7">
                    {contactForm.name} ({contactForm.email}) • {contactForm.phone}
                  </p>
                </div>
                <button 
                  type="button" 
                  onClick={() => setStep(1)} 
                  className="text-xs font-bold text-accent hover:text-primary flex items-center gap-1 cursor-pointer transition-colors"
                >
                  <Edit3 size={12} /> Edit
                </button>
              </div>
            ) : (
              <div className="space-y-6">
                <h3 className="font-display font-black text-lg text-text flex items-center gap-2.5">
                  <span className="w-6 h-6 bg-primary/10 text-primary rounded-full flex items-center justify-center text-xs font-bold">1</span>
                  Contact Information
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold uppercase tracking-wider text-text-muted">Full Name</label>
                    <input
                      type="text"
                      required
                      placeholder="Enter full name"
                      value={contactForm.name}
                      onChange={(e) => setContactForm({ ...contactForm, name: e.target.value })}
                      className="w-full text-xs bg-background border border-border rounded-xl px-4 py-3 text-text focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/10 transition-all font-medium"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold uppercase tracking-wider text-text-muted">Phone Number</label>
                    <input
                      type="tel"
                      required
                      placeholder="e.g. +91 98480 12345"
                      value={contactForm.phone}
                      onChange={(e) => setContactForm({ ...contactForm, phone: e.target.value })}
                      className="w-full text-xs bg-background border border-border rounded-xl px-4 py-3 text-text focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/10 transition-all font-medium"
                    />
                  </div>
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-bold uppercase tracking-wider text-text-muted">Email Address</label>
                  <input
                    type="email"
                    required
                    placeholder="name@example.com"
                    value={contactForm.email}
                    onChange={(e) => setContactForm({ ...contactForm, email: e.target.value })}
                    className="w-full text-xs bg-background border border-border rounded-xl px-4 py-3 text-text focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/10 transition-all font-medium"
                  />
                </div>
                <div className="pt-2 text-right">
                  <Button 
                    type="submit" 
                    className="bg-primary hover:bg-primary-hover text-white font-bold text-xs py-3 px-6 rounded-xl transition-all cursor-pointer shadow-sm"
                  >
                    Continue to Delivery
                  </Button>
                </div>
              </div>
            )}
          </div>

          {/* STEP 2: DELIVERY ADDRESS */}
          <div className={`bg-surface border rounded-3xl p-6 transition-all duration-500 ${
            step === 2 
              ? 'border-gold shadow-md' 
              : 'border-border shadow-xs'
          } ${step < 2 ? 'opacity-50' : 'opacity-100'}`}>
            {step < 2 ? (
              <div className="flex items-center gap-2.5 text-text-muted">
                <span className="w-5 h-5 bg-surface/20 text-text-muted rounded-full flex items-center justify-center text-[10px] font-bold">2</span>
                <h3 className="font-display font-bold text-sm">Delivery Address</h3>
                <Lock size={12} className="ml-auto" />
              </div>
            ) : step > 2 ? (
              <div className="flex items-center justify-between">
                <div className="space-y-1 text-left">
                  <h3 className="font-display font-bold text-sm text-text-muted flex items-center gap-2">
                    <span className="w-5 h-5 bg-primary text-white rounded-full flex items-center justify-center text-[10px] font-bold">✓</span>
                    Delivery Address
                  </h3>
                  <p className="text-xs text-text font-medium pl-7">
                    [{addressForm.label}] {addressForm.line1}, {addressForm.line2 ? addressForm.line2 + ", " : ""}{addressForm.city} - {addressForm.pincode}
                  </p>
                </div>
                <button 
                  type="button" 
                  onClick={() => setStep(2)} 
                  className="text-xs font-bold text-accent hover:text-primary flex items-center gap-1 cursor-pointer transition-colors"
                >
                  <Edit3 size={12} /> Edit
                </button>
              </div>
            ) : (
              <div className="space-y-6">
                <h3 className="font-display font-black text-lg text-text flex items-center gap-2.5">
                  <span className="w-6 h-6 bg-primary/10 text-primary rounded-full flex items-center justify-center text-xs font-bold">2</span>
                  Hyderabad Delivery Address
                </h3>
                
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div className="sm:col-span-2 space-y-1">
                    <label className="text-[10px] font-bold uppercase tracking-wider text-text-muted">Pincode (Hyderabad only)</label>
                    <input
                      id="pincode-input"
                      type="text"
                      required
                      maxLength={6}
                      value={addressForm.pincode}
                      onBlur={handlePincodeBlur}
                      onChange={(e) => setAddressForm({ ...addressForm, pincode: e.target.value.replace(/\D/g, "") })}
                      className="w-full text-xs bg-background border border-border rounded-xl px-4 py-3 text-text focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/10 transition-all font-medium"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold uppercase tracking-wider text-text-muted">Address Label</label>
                    <select
                      value={addressForm.label}
                      onChange={(e) => setAddressForm({ ...addressForm, label: e.target.value })}
                      className="w-full text-xs bg-background border border-border rounded-xl px-4 py-3 text-text focus:outline-none focus:border-primary cursor-pointer font-medium"
                    >
                      <option value="Home">Home</option>
                      <option value="Office">Office</option>
                      <option value="Other">Other</option>
                    </select>
                  </div>
                </div>
                {pinError && <p className="text-[10px] text-rose-700 font-bold tracking-tight">{pinError}</p>}
                {pinSuccess && <p className="text-[10px] text-primary font-bold tracking-tight">{pinSuccess}</p>}

                <div className="space-y-1">
                  <label className="text-[10px] font-bold uppercase tracking-wider text-text-muted">Address Line 1</label>
                  <input
                    type="text"
                    required
                    placeholder="House No, Building Name, Street Name"
                    value={addressForm.line1}
                    onChange={(e) => setAddressForm({ ...addressForm, line1: e.target.value })}
                    className="w-full text-xs bg-background border border-border rounded-xl px-4 py-3 text-text focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/10 transition-all font-medium"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] font-bold uppercase tracking-wider text-text-muted">Address Line 2 (Optional)</label>
                  <input
                    type="text"
                    placeholder="Landmark, Area details"
                    value={addressForm.line2}
                    onChange={(e) => setAddressForm({ ...addressForm, line2: e.target.value })}
                    className="w-full text-xs bg-background border border-border rounded-xl px-4 py-3 text-text focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/10 transition-all font-medium"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold uppercase tracking-wider text-text-muted">City</label>
                    <input
                      type="text"
                      required
                      disabled
                      value={addressForm.city}
                      className="w-full text-xs bg-surface/10 border border-border rounded-xl px-4 py-3 text-text-muted cursor-not-allowed font-semibold"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold uppercase tracking-wider text-text-muted">State</label>
                    <input
                      type="text"
                      required
                      disabled
                      value={addressForm.state}
                      className="w-full text-xs bg-surface/10 border border-border rounded-xl px-4 py-3 text-text-muted cursor-not-allowed font-semibold"
                    />
                  </div>
                </div>
                
                <div className="flex justify-between items-center pt-2">
                  <button 
                    type="button" 
                    onClick={() => setStep(1)} 
                    className="text-xs font-bold text-text-muted hover:text-text cursor-pointer transition-colors"
                  >
                    Back
                  </button>
                  <Button 
                    type="submit" 
                    className="bg-primary hover:bg-primary-hover text-white font-bold text-xs py-3 px-6 rounded-xl transition-all cursor-pointer shadow-sm"
                  >
                    Continue to Payment
                  </Button>
                </div>
              </div>
            )}
          </div>

          {/* STEP 3: PAYMENT METHOD */}
          <div className={`bg-surface border rounded-3xl p-6 transition-all duration-500 ${
            step === 3 
              ? 'border-gold shadow-md animate-fade-in' 
              : 'border-border shadow-xs'
          } ${step < 3 ? 'opacity-50' : 'opacity-100'}`}>
            {step < 3 ? (
              <div className="flex items-center gap-2.5 text-text-muted">
                <span className="w-5 h-5 bg-surface/20 text-text-muted rounded-full flex items-center justify-center text-[10px] font-bold">3</span>
                <h3 className="font-display font-bold text-sm">Payment Method</h3>
                <Lock size={12} className="ml-auto" />
              </div>
            ) : (
              <div className="space-y-6">
                <h3 className="font-display font-black text-lg text-text flex items-center gap-2.5">
                  <span className="w-6 h-6 bg-primary/10 text-primary rounded-full flex items-center justify-center text-xs font-bold">3</span>
                  Payment Method
                </h3>
                
                <div className="space-y-4">
                  <label className="flex items-center gap-3.5 p-4 border-2 border-primary bg-primary/5 rounded-2xl cursor-pointer transition-all duration-300">
                    <input type="radio" defaultChecked className="text-primary focus:ring-primary cursor-pointer w-4 h-4" />
                    <div className="flex-1 flex justify-between items-center text-xs">
                      <div>
                        <span className="font-bold text-text block text-sm">Razorpay Secure Checkout</span>
                        <span className="text-text-muted text-[10px] mt-0.5 block">UPI, Instant Transfer, Credit/Debit Cards, Wallets</span>
                      </div>
                      <CreditCard size={20} className="text-primary" />
                    </div>
                  </label>
                  
                  <div className="flex items-center gap-2 justify-center text-[10px] text-text-muted pt-2">
                    <Lock size={12} />
                    Secured under signed HMAC webhooks. Production keys encrypted at rest.
                  </div>
                </div>

                <div className="flex justify-between items-center pt-2 border-t border-border">
                  <button 
                    type="button" 
                    onClick={() => setStep(2)} 
                    className="text-xs font-bold text-text-muted hover:text-text cursor-pointer transition-colors"
                  >
                    Back
                  </button>
                  <Button
                    type="submit"
                    disabled={isProcessingOrder}
                    className="bg-accent hover:bg-accent-hover text-white font-bold text-xs py-3.5 px-8 rounded-xl transition-all cursor-pointer shadow-md tracking-wider uppercase"
                  >
                    {isProcessingOrder ? "Processing..." : `Place Order & Pay ₹${cartTotal}`}
                  </Button>
                </div>
              </div>
            )}
          </div>

        </form>

        {/* Right Column: Order Summary Calculations */}
        <div className="lg:col-span-5 space-y-6 sticky top-24">
          <div className="bg-surface border border-border rounded-3xl p-6 space-y-6 shadow-xs">
            <h3 className="font-display font-black text-lg text-text text-left border-b border-border pb-3">
              Order Summary
            </h3>

            {/* Items List */}
            <div className="divide-y divide-border max-h-[220px] overflow-y-auto pr-2 custom-scrollbar">
              {cart.map((item) => (
                <div key={item.id} className="flex gap-4 py-3.5 items-center text-xs">
                  <img src={item.image} className="w-12 h-12 object-cover rounded-xl border border-border shadow-xs" />
                  <div className="flex-1 text-left space-y-0.5">
                    <span className="font-bold text-text block line-clamp-1">{item.name}</span>
                    <span className="text-text-muted text-[10px] font-semibold">
                      {item.qty} &times; {item.label || "Pack"}
                    </span>
                  </div>
                  <span className="font-bold text-text">₹{item.price * item.qty}</span>
                </div>
              ))}
            </div>

            {/* Coupon input */}
            <div className="border-t border-border pt-5">
              {coupon ? (
                <div className="flex items-center justify-between bg-success/10 border border-success/20 rounded-xl p-3.5 text-xs text-success font-semibold">
                  <span className="flex items-center gap-2">
                    <Tag size={14} className="animate-pulse" />
                    Coupon {coupon.code} (₹{cartDiscount} off)
                  </span>
                  <button 
                    type="button" 
                    onClick={removeCoupon} 
                    className="text-text-muted hover:text-rose-700 font-bold uppercase tracking-wider text-[10px] cursor-pointer transition-colors"
                  >
                    Remove
                  </button>
                </div>
              ) : (
                <div className="space-y-1.5 text-left">
                  <label className="text-[10px] font-bold uppercase tracking-wider text-text-muted block">Apply Coupon</label>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      placeholder="Code (e.g. SUGARFREE)"
                      value={couponInput}
                      onChange={(e) => setCouponInput(e.target.value)}
                      className="flex-1 text-xs bg-background border border-border rounded-xl px-4 py-3 text-text focus:outline-none focus:border-primary font-medium"
                    />
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={handleCouponSubmit}
                      className="py-3 px-5 cursor-pointer text-xs font-bold border-border hover:bg-surface/10 rounded-xl"
                    >
                      Apply
                    </Button>
                  </div>
                  {couponError && <p className="text-[10px] text-rose-700 font-bold mt-1">{couponError}</p>}
                  {couponSuccess && <p className="text-[10px] text-primary font-bold mt-1">{couponSuccess}</p>}
                </div>
              )}
            </div>

            {/* Loyalty points toggle */}
            {userPoints > 0 && (
              <div className="border-t border-border pt-5">
                <label className="flex items-start gap-3 cursor-pointer bg-surface/10 hover:bg-surface/20 border border-border p-3.5 rounded-xl transition-all">
                  <input
                    type="checkbox"
                    checked={redeemPointsToggle}
                    onChange={handlePointsCheckboxChange}
                    className="mt-0.5 rounded text-primary focus:ring-primary cursor-pointer w-4 h-4 border-border"
                  />
                  <div className="text-left">
                    <span className="text-xs font-bold text-text flex items-center gap-1.5">
                      <Gift size={14} className="text-clay" />
                      Redeem Reward Points
                    </span>
                    <p className="text-[10px] text-text-muted mt-1 leading-relaxed font-medium">
                      You have {userPoints} points. Save up to 20% (₹{Math.floor(Math.max(0, cartSubtotal - cartDiscount) * 0.2)} max discount).
                    </p>
                  </div>
                </label>
                {redeemPointsToggle && pointsRedeemed > 0 && (
                  <p className="text-[10px] text-primary font-bold mt-2 text-left">
                    ✓ Applied {pointsRedeemed} points for ₹{pointsRedeemed} discount!
                  </p>
                )}
              </div>
            )}

            {/* Calculations */}
            <div className="border-t border-border pt-5 space-y-2.5 text-xs text-text-muted border-b border-border pb-5">
              <div className="flex justify-between font-medium">
                <span>Items Subtotal</span>
                <span className="font-bold text-text">₹{cartSubtotal}</span>
              </div>
              {cartDiscount > 0 && (
                <div className="flex justify-between text-success font-semibold">
                  <span>Coupon Savings</span>
                  <span>- ₹{cartDiscount}</span>
                </div>
              )}
              {pointsRedeemed > 0 && (
                <div className="flex justify-between text-success font-semibold">
                  <span>Loyalty Points Savings</span>
                  <span>- ₹{pointsRedeemed}</span>
                </div>
              )}
              <div className="flex justify-between font-medium">
                <span>Shipping & Handling</span>
                <span className="font-bold text-text">
                  {pincodeZone ? `₹${cartDeliveryFee}` : "Pincode pending"}
                </span>
              </div>
              {pincodeZone && cartDeliveryFee === 0 && (
                <div className="text-[10px] text-success font-bold text-left bg-success/10 p-2 rounded-lg border border-success/20 flex items-center gap-1">
                  <span>✓</span> Free Hyderabad Shipping achieved!
                </div>
              )}
            </div>

            <div className="flex justify-between items-end text-text text-left">
              <div>
                <span className="text-[10px] text-text-muted block font-bold uppercase tracking-wider">Total Amount</span>
                <span className="font-display font-black text-2xl leading-none text-primary mt-1 block">₹{cartTotal}</span>
              </div>
              <span className="text-[10px] bg-primary/10 border border-primary/20 text-primary px-3 py-1.5 rounded-full uppercase tracking-wider font-bold">
                + {Math.floor(cartTotal / 10)} pts earned
              </span>
            </div>
          </div>
        </div>

      </div>

      {/* Expensive Dark-Mode Simulated Razorpay Bottom Drawer/Modal */}
      {showRazorpayModal && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-text/80 backdrop-blur-md transition-all duration-300">
          
          {/* Backdrop click to fail (standard Razorpay behavior) */}
          <div className="absolute inset-0" onClick={handlePaymentFailure} />
          
          {/* Modal Container: Slides up from bottom on mobile, scales on desktop */}
          <div className="relative w-full sm:max-w-md bg-[#12110F] text-white border-t sm:border border-accent/25 rounded-t-3xl sm:rounded-3xl p-6 sm:p-8 shadow-2xl space-y-6 text-center transform translate-y-0 animate-fade-in z-10">
            
            {/* Elegant Top Decorative Gold Bar */}
            <div className="w-12 h-1.5 bg-accent/30 rounded-full mx-auto sm:hidden mb-2" />

            {/* Razorpay Banner Header */}
            <div className="border-b border-accent/15 pb-4 flex items-center justify-between">
              <div className="flex items-center gap-1.5">
                <span className="font-sans font-bold text-xs tracking-wider uppercase text-accent">
                  Razorpay Secure
                </span>
                <span className="text-[8px] bg-accent/15 text-accent border border-accent/25 px-2 py-0.5 rounded font-black tracking-widest uppercase">
                  Test Mode
                </span>
              </div>
              <span className="text-[10px] text-background/40 font-mono">ID: {simulatedRpOrderId}</span>
            </div>

            {/* Payment Summary */}
            <div className="space-y-2 py-4">
              <span className="text-[10px] text-background/50 uppercase tracking-widest block font-bold">Paying SafeSnack Originals</span>
              <span className="font-display font-black text-4xl block text-accent tracking-tight">₹{cartTotal}</span>
              <div className="inline-flex items-center gap-1.5 text-xs text-background/70 bg-white/5 border border-white/10 px-3 py-1.5 rounded-full font-medium">
                <User size={12} className="text-accent" />
                <span>{contactForm.name} • {contactForm.phone}</span>
              </div>
            </div>

            {/* Interactive Simulation Panel */}
            <div className="space-y-4 pt-2">
              {isPaying ? (
                <div className="py-6 flex flex-col items-center justify-center space-y-3">
                  <Loader2 className="w-10 h-10 text-accent animate-spin stroke-[1.5]" />
                  <span className="text-xs text-background/60 font-bold uppercase tracking-widest animate-pulse">
                    Authenticating HMAC payment payload...
                  </span>
                </div>
              ) : (
                <>
                  <button
                    type="button"
                    onClick={handlePaymentSuccess}
                    className="w-full bg-accent hover:bg-accent-hover text-text font-black py-4 px-6 rounded-xl text-xs uppercase tracking-widest transition-all duration-300 cursor-pointer shadow-lg hover:shadow-accent/15 flex items-center justify-center gap-2"
                  >
                    ✔ Simulate Success
                  </button>
                  <button
                    type="button"
                    onClick={handlePaymentFailure}
                    className="w-full bg-transparent hover:bg-white/5 text-rose-500 hover:text-rose-400 font-bold py-3.5 px-6 rounded-xl text-xs uppercase tracking-widest transition-all duration-300 cursor-pointer border border-rose-500/20"
                  >
                    ✕ Cancel Payment
                  </button>
                </>
              )}
            </div>

            {/* Footer lock */}
            <div className="flex items-center gap-2 justify-center text-[9px] text-background/40 pt-4 border-t border-accent/15">
              <ShieldCheck size={14} className="text-accent" />
              <span>Simulated Razorpay API v2 checkout. Encrypted at rest.</span>
            </div>

          </div>
        </div>
      )}

    </div>
  );
}
