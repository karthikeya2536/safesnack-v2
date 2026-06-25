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

describe("FEFO Batch Inventory Allocation Tests", () => {
  beforeAll(() => {
    // Force re-initialization of mock database seed
    MockDatabase.init(true);
  });

  test("It sorts batches by expiry date and allocates from the earliest batch first", () => {
    const variantId = "var-1a"; // Beetroot chips 50g

    // Check seed batches for var-1a
    const batches = MockDatabase.getBatches().filter(b => b.variantId === variantId);
    expect(batches.length).toBe(2);

    // Sort by expiry to identify which should be consumed first
    const sorted = [...batches].sort(
      (a, b) => new Date(a.expiryDate).getTime() - new Date(b.expiryDate).getTime()
    );
    const earliestBatch = sorted[0];
    const latestBatch = sorted[1];

    // Allocate 30 units (earliest batch has 50, so it should suffice)
    const result = MockDatabase.allocateInventoryFEFO(variantId, 30);
    expect(result.allocated).toBe(true);
    expect(result.allocations.length).toBe(1);
    expect(result.allocations[0].batchId).toBe(earliestBatch.id);
    expect(result.allocations[0].qty).toBe(30);
  });

  test("It splits allocations across multiple batches if first batch quantity is insufficient", () => {
    const variantId = "var-1a"; // Beetroot chips 50g

    const batches = MockDatabase.getBatches().filter(b => b.variantId === variantId);
    const sorted = [...batches].sort(
      (a, b) => new Date(a.expiryDate).getTime() - new Date(b.expiryDate).getTime()
    );
    const earliestBatch = sorted[0]; // has 50 units
    const latestBatch = sorted[1];   // has 80 units

    // Allocate 60 units (requires all 50 of earliest + 10 of latest)
    const result = MockDatabase.allocateInventoryFEFO(variantId, 60);
    expect(result.allocated).toBe(true);
    expect(result.allocations.length).toBe(2);

    expect(result.allocations[0].batchId).toBe(earliestBatch.id);
    expect(result.allocations[0].qty).toBe(50);

    expect(result.allocations[1].batchId).toBe(latestBatch.id);
    expect(result.allocations[1].qty).toBe(10);
  });

  test("It returns allocated false if requested quantity exceeds total stock level", () => {
    const variantId = "var-3a"; // Soya chips (total 130 in seed)
    const result = MockDatabase.allocateInventoryFEFO(variantId, 200);
    expect(result.allocated).toBe(false);
    expect(result.allocations.length).toBe(0);
  });
});
