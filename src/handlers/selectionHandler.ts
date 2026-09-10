// ============================================================
// Carty — Selection Handler
// ============================================================
// Parses conversational selection (e.g., "select 1", "I want 2").
// Also parses fulfillment choices (e.g., "buy it myself", "do it for me").

import { sessionManager, type SendFn } from "../shop/SessionManager.js";
import type { ShoppingSession } from "../shop/SessionState.js";

/**
 * Attempt to parse a selection from natural text.
 * Returns the index (0, 1, or 2) if a selection is found, otherwise null.
 */
function parseSelection(text: string, session: ShoppingSession): number | null {
  const lower = text.toLowerCase().trim();

  // Match "select 1", "save 1", "buy 1", "1", etc.
  if (lower.includes("select 1") || lower.includes("save 1") || lower === "1" || lower.includes("buy 1")) return 0;
  if (lower.includes("select 2") || lower.includes("save 2") || lower === "2" || lower.includes("buy 2")) return 1;
  if (lower.includes("select 3") || lower.includes("save 3") || lower === "3" || lower.includes("buy 3")) return 2;

  return null;
}

/**
 * Parse the user's choice of fulfillment when in "fulfillment_choice" status.
 */
function parseFulfillmentChoice(text: string): "self" | "crypto" | "card" | null {
  const normalized = text.toLowerCase().trim();
  if (normalized.includes("buy it myself") || normalized === "1") return "self";
  if (normalized.includes("crypto") || normalized === "2") return "crypto";
  if (normalized.includes("card") || normalized === "3") return "card";
  return null;
}

export async function handleSelection(
  chatId: string,
  text: string,
  send: SendFn
): Promise<boolean> {
  const session = sessionManager.getSession(chatId);
  if (!session) return false;

  if (session.status === "awaiting_email") {
    // Simple email extraction
    const emailRegex = /([a-zA-Z0-9._-]+@[a-zA-Z0-9._-]+\.[a-zA-Z0-9_-]+)/;
    const match = text.match(emailRegex);
    if (match && match[1]) {
      await sessionManager.finalizeConcierge(chatId, match[1], send);
      return true;
    } else {
      await send("That doesn't look like a valid email. Please reply with your email address so I can generate your payment link!");
      return true; // We handled the message, they just gave a bad email
    }
  }

  if (session.status === "selecting") {
    const selectionIndex = parseSelection(text, session);
    if (selectionIndex === null) return false;

    if (selectionIndex >= session.products.length) return false;

    const productId = session.products[selectionIndex].id;
    await sessionManager.saveProduct(chatId, productId, send);
    return true;
  }

  if (session.status === "fulfillment_choice") {
    const choice = parseFulfillmentChoice(text);
    if (!choice) return false;

    await sessionManager.processFulfillment(chatId, choice, send);
    return true;
  }

  return false;
}
