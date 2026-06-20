import { describe, it, expect, vi } from "vitest";
import { listProducts, createProduct } from "./products";
import type { SupabaseClient } from "@supabase/supabase-js";

function mockClient(returns: unknown) {
  const builder: any = {
    select: vi.fn(() => builder),
    insert: vi.fn(() => builder),
    order: vi.fn(() => Promise.resolve({ data: returns, error: null })),
    single: vi.fn(() => Promise.resolve({ data: returns, error: null })),
  };
  return { from: vi.fn(() => builder) } as unknown as SupabaseClient;
}

describe("products dataåtkomst", () => {
  it("listProducts returnerar rader sorterade på senast ändrad", async () => {
    const rows = [{ id: "1", name: "Pasta", status: "unsafe" }];
    const client = mockClient(rows);
    const result = await listProducts(client);
    expect(result).toEqual(rows);
    expect(client.from).toHaveBeenCalledWith("saved_products");
  });

  it("createProduct skickar in produkten och returnerar den skapade raden", async () => {
    const row = { id: "2", name: "Kanelbulle", status: "safe" };
    const client = mockClient(row);
    const result = await createProduct(client, { name: "Kanelbulle", status: "safe" });
    expect(result).toEqual(row);
  });
});
