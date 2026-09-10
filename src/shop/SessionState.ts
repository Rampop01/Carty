// ============================================================
// Carty — Session State
// ============================================================

import type { Product } from "./SearchEngine.js";

export type SessionStatus = "searching" | "selecting" | "fulfillment_choice" | "awaiting_email" | "completed";

export interface ShoppingSession {
  id: string;
  chatId: string;
  query: string;
  status: SessionStatus;
  products: Product[];
  selectedProductId: string | null;
}

export function createSession(
  id: string,
  chatId: string,
  query: string
): ShoppingSession {
  return {
    id,
    chatId,
    query,
    status: "searching",
    products: [],
    selectedProductId: null,
  };
}
