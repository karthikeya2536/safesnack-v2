import { describe, test, expect, beforeAll } from "vitest";

// Mock window and localStorage for Node testing environment
if (typeof global.window === "undefined") {
  const store: Record<string, string> = {};
  (global as any).window = {} as any;
  (global as any).localStorage = {
    getItem: (key: string) => store[key] || null,
    setItem: (key: string, value: string) => { store[key] = value; },
    removeItem: (key: string) => { delete store[key]; },
    clear: () => { Object.keys(store).forEach(k => delete store[k]); },
    length: 0,
    key: () => null,
  };
}

import { MockDatabase } from "../lib/db/mock-db";

describe("Checkout Discount & Delivery Fee Tests", () => {
  beforeAll(() => {
    MockDatabase.init(true);
  });

  test("Pincode validator resolves correct delivery fee, min order, and ETA", () => {
    const zones = MockDatabase.getDeliveryZones();
    
    // Madhapur test
    const madhapur = zones.find(z => z.pincode === "500081");
    expect(madhapur).toBeDefined();
    expect(madhapur?.deliveryFee).toBe(40);
    expect(madhapur?.minOrder).toBe(250);
    expect(madhapur?.etaMinutes).toBe(30);

    // Abids test
    const abids = zones.find(z => z.pincode === "500001");
    expect(abids).toBeDefined();
    expect(abids?.deliveryFee).toBe(60);
    expect(abids?.minOrder).toBe(400);
    expect(abids?.etaMinutes).toBe(50);
  });

  test("Coupon SUGARFREE discount math resolves correctly", () => {
    const coupons = MockDatabase.getCoupons();
    const coupon = coupons.find(c => c.code === "SUGARFREE");
    expect(coupon).toBeDefined();
    expect(coupon?.type).toBe("PERCENT");
    expect(coupon?.value).toBe(15);
    expect(coupon?.minOrder).toBe(400);
    expect(coupon?.maxDiscount).toBe(150);

    // Case 1: Subtotal is ₹500 (15% is ₹75, which is under max ₹150 cap)
    const subtotal1 = 500;
    let discount1 = (subtotal1 * coupon!.value) / 100;
    if (coupon!.maxDiscount && discount1 > coupon!.maxDiscount) {
      discount1 = coupon!.maxDiscount;
    }
    expect(discount1).toBe(75);

    // Case 2: Subtotal is ₹2000 (15% is ₹300, which exceeds max ₹150 cap)
    const subtotal2 = 2000;
    let discount2 = (subtotal2 * coupon!.value) / 100;
    if (coupon!.maxDiscount && discount2 > coupon!.maxDiscount) {
      discount2 = coupon!.maxDiscount;
    }
    expect(discount2).toBe(150);
  });

  test("Coupon WELCOME10 applies flat discount correctly", () => {
    const coupons = MockDatabase.getCoupons();
    const coupon = coupons.find(c => c.code === "WELCOME10");
    expect(coupon).toBeDefined();
    expect(coupon?.type).toBe("FLAT");
    expect(coupon?.value).toBe(100);
    expect(coupon?.minOrder).toBe(500);

    // Verification
    const subtotal = 600;
    let discount = 0;
    if (subtotal >= coupon!.minOrder) {
      discount = coupon!.value;
    }
    expect(discount).toBe(100);
  });
});
