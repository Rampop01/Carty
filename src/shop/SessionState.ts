// ============================================================
// Carty — Session State
// ============================================================

import type { Product } from "./SearchEngine.js";

export type SessionStatus = "searching" | "voting" | "decided";

export interface ShoppingSession {
  id: string;
  chatId: string;
  query: string;
  status: SessionStatus;
  products: Product[];
  votes: Map<string, string>; // playerId -> productId
  playerNames: Map<string, string>; // playerId -> playerName
  hostId: string;
}

export function createSession(
  id: string,
  chatId: string,
  query: string,
  hostId: string,
  hostName: string
): ShoppingSession {
  const playerNames = new Map<string, string>();
  playerNames.set(hostId, hostName);

  return {
    id,
    chatId,
    query,
    status: "searching",
    products: [],
    votes: new Map<string, string>(),
    playerNames,
    hostId,
  };
}

export function getVoteCounts(session: ShoppingSession): Map<string, number> {
  const counts = new Map<string, number>();
  for (const product of session.products) {
    counts.set(product.id, 0);
  }

  for (const productId of session.votes.values()) {
    counts.set(productId, (counts.get(productId) || 0) + 1);
  }

  return counts;
}

export function getVotersForProduct(
  session: ShoppingSession,
  productId: string
): string[] {
  const voters: string[] = [];
  for (const [playerId, pid] of session.votes.entries()) {
    if (pid === productId) {
      voters.push(session.playerNames.get(playerId) || "Unknown");
    }
  }
  return voters;
}
