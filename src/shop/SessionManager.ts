// ============================================================
// Carty — Session Manager
// ============================================================
// Orchestrator for active shopping sessions.

import { v4 as uuid } from "uuid";
import { searchLiveProducts } from "./SearchEngine.js";
import {
  type ShoppingSession,
  createSession,
  getVoteCounts,
  getVotersForProduct,
} from "./SessionState.js";
import { poll, richlink } from "spectrum-ts";
import {
  formatVotingUpdate,
  formatFinalDecision,
  formatNoProductsFound,
  formatSessionAlreadyActive,
  formatNoActiveSession,
} from "../utils/formatter.js";

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
    hostId: string,
    hostName: string,
    send: SendFn
  ): Promise<void> {
    if (this.sessions.has(chatId)) {
      const existing = this.sessions.get(chatId)!;
      if (existing.status !== "decided") {
        await send(formatSessionAlreadyActive(existing.query));
        return;
      }
    }

    const session = createSession(uuid(), chatId, query, hostId, hostName);
    
    // Send a loading message so the user knows we're hitting the internet
    await send(`🔍 Searching the web for: ${query}...`);

    // Search live products
    const results = await searchLiveProducts(query);
    if (!results || results.products.length === 0) {
      await send(formatNoProductsFound(query));
      return;
    }

    session.products = results.products;
    session.status = "voting";
    this.sessions.set(chatId, session);

    // Send the native iMessage Poll Mini App
    const options = session.products.map((p, i) => `${i + 1}. ${p.name} ($${p.price})`);
    const title = `Which one should we get for: ${session.query}?`;
    
    // We send the poll object directly to the spectrum-ts API
    await send(poll(title, ...options));
  }

  /**
   * Cast a vote for a product.
   */
  async castVote(
    chatId: string,
    playerId: string,
    playerName: string,
    productId: string,
    send: SendFn
  ): Promise<void> {
    const session = this.sessions.get(chatId);
    if (!session || session.status !== "voting") return;

    // Validate product ID exists in the shortlist
    const productExists = session.products.some((p) => p.id === productId);
    if (!productExists) return; // Ignore invalid votes

    session.playerNames.set(playerId, playerName);
    session.votes.set(playerId, productId);

    await send(formatVotingUpdate(session));
  }

  /**
   * Close the session and announce the winner.
   */
  async decide(chatId: string, send: SendFn): Promise<void> {
    const session = this.sessions.get(chatId);
    if (!session) {
      await send(formatNoActiveSession());
      return;
    }

    if (session.status === "decided") return;

    session.status = "decided";

    if (session.votes.size === 0) {
      await send("🤷 No one voted! I guess we aren't buying anything.");
      this.sessions.delete(chatId);
      return;
    }

    // Tally votes
    const voteCounts = getVoteCounts(session);
    let winningProductId = "";
    let maxVotes = -1;

    for (const [productId, count] of voteCounts.entries()) {
      if (count > maxVotes) {
        maxVotes = count;
        winningProductId = productId;
      }
    }

    const winningProduct = session.products.find((p) => p.id === winningProductId);
    if (!winningProduct) return;

    // 1. Calculate the split
    const votersCount = getVotersForProduct(session, winningProduct.id).length || 1;
    const splitCost = (winningProduct.price / votersCount).toFixed(2);

    // 2. Generate a Venmo link for the host
    const venmoUrl = `https://venmo.com/?txn=charge&amount=${splitCost}&note=${encodeURIComponent(winningProduct.name)}`;

    // 3. Send the native Mini App Cards!
    await send(`🎉 The group has decided on: ${winningProduct.name}!`);
    await send(`The total is $${winningProduct.price}. Split between ${votersCount} people, that's $${splitCost} each.`);

    await send(richlink(winningProduct.url));
    await send(richlink(venmoUrl));

    // Cleanup after a delay
    setTimeout(() => {
      const s = this.sessions.get(chatId);
      if (s && s.id === session.id) {
        this.sessions.delete(chatId);
      }
    }, 60_000);
  }
}

export const sessionManager = new SessionManager();
