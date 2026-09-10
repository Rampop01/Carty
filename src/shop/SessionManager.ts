// ============================================================
// Carty — Session Manager
// ============================================================
// Orchestrator for active shopping sessions.

import { v4 as uuid } from "uuid";
import { searchLiveProducts } from "./SearchEngine.js";
import {
  type ShoppingSession,
  createSession,
} from "./SessionState.js";
import { richlink } from "spectrum-ts";
import {
  formatSearchResults,
  formatSelectionPrompt,
  formatSelfBuy,
  formatCryptoBuy,
  formatCardBuy,
  formatConciergeEmailPrompt,
  formatNoProductsFound,
  formatSessionAlreadyActive,
} from "../utils/formatter.js";
import { createPaystackSession } from "./paystackCheckout.js";

export type SendFn = (message: any) => Promise<void>;

export class SessionManager {
  // Map of chatId -> active session
  private sessions: Map<string, ShoppingSession> = new Map();

  hasSession(chatId: string): boolean {
    return this.sessions.has(chatId);
  }

  getSession(chatId: string): ShoppingSession | undefined {
    return this.sessions.get(chatId);
  }

  /**
   * Start a new shopping session.
   */
  async startShopping(
    chatId: string,
    query: string,
    send: SendFn
  ): Promise<void> {
    if (this.sessions.has(chatId)) {
      const existing = this.sessions.get(chatId)!;
      if (existing.status !== "completed") {
        await send(formatSessionAlreadyActive(existing.query));
        return;
      }
    }

    const session = createSession(uuid(), chatId, query);
    
    // Send a loading message so the user knows we're hitting the internet
    await send(`🔍 Searching the web for: ${query}...`);

    // Search live products
    const result = await searchLiveProducts(query);
    
    if (typeof result === "string") {
      await send(`❌ Error from SerpApi:\n${result}`);
      return;
    }

    if (!result || result.products.length === 0) {
      await send(formatNoProductsFound(query));
      return;
    }

    session.products = result.products;
    session.status = "selecting";
    this.sessions.set(chatId, session);

    // Send the text UI so the user can select an option
    await send(formatSearchResults(session));
  }

  /**
   * Save a product selection and ask for fulfillment choice.
   */
  async saveProduct(
    chatId: string,
    productId: string,
    send: SendFn
  ): Promise<void> {
    const session = this.sessions.get(chatId);
    if (!session || session.status !== "selecting") return;

    session.selectedProductId = productId;
    session.status = "fulfillment_choice";

    const product = session.products.find(p => p.id === productId);
    if (!product) return;

    await send(formatSelectionPrompt(product));
  }

  /**
   * Process the fulfillment choice (self, crypto, or card).
   */
  async processFulfillment(
    chatId: string,
    choice: "self" | "crypto" | "card",
    send: SendFn
  ): Promise<void> {
    const session = this.sessions.get(chatId);
    if (!session || session.status !== "fulfillment_choice" || !session.selectedProductId) return;

    const product = session.products.find(p => p.id === session.selectedProductId);
    if (!product) return;

    if (choice === "self") {
      session.status = "completed";
      await send(formatSelfBuy(product));
      await send(richlink(product.url));
      
      this.scheduleCleanup(chatId, session.id);
    } else if (choice === "crypto") {
      session.status = "completed";
      await send(formatCryptoBuy(product));
      this.scheduleCleanup(chatId, session.id);
    } else if (choice === "card") {
      session.status = "awaiting_email";
      await send(formatConciergeEmailPrompt(product));
    }
  }

  /**
   * Finalize the concierge flow once we have the user's email.
   */
  async finalizeConcierge(chatId: string, email: string, send: SendFn): Promise<void> {
    const session = this.sessions.get(chatId);
    if (!session || session.status !== "awaiting_email" || !session.selectedProductId) return;

    const product = session.products.find(p => p.id === session.selectedProductId);
    if (!product) return;

    session.status = "completed";
    
    // Generate Paystack URL
    const checkoutUrl = await createPaystackSession(product, email);
    
    if (checkoutUrl) {
      await send(formatCardBuy(product));
      await send(richlink(checkoutUrl));
    } else {
      await send("❌ Oops! I couldn't generate the Paystack payment link. Please make sure my API Key is set up.");
    }

    this.scheduleCleanup(chatId, session.id);
  }

  private scheduleCleanup(chatId: string, sessionId: string) {
    setTimeout(() => {
      const s = this.sessions.get(chatId);
      if (s && s.id === sessionId) {
        this.sessions.delete(chatId);
      }
    }, 10_000);
  }

  /**
   * Cancel the current session manually.
   */
  async cancelSession(chatId: string, send: SendFn): Promise<void> {
    if (this.sessions.has(chatId)) {
      this.sessions.delete(chatId);
      await send("🗑️ Active shopping session canceled.");
    } else {
      await send("No active session to cancel.");
    }
  }
}

export const sessionManager = new SessionManager();
