// ============================================================
// Carty — Vote Handler
// ============================================================
// Parses conversational voting (e.g., "vote 1", "I vote A").

import { sessionManager, type SendFn } from "../shop/SessionManager.js";
import type { ShoppingSession } from "../shop/SessionState.js";

/**
 * Attempt to parse a vote from natural text.
 * Returns the index (0, 1, or 2) if a vote is found, otherwise null.
 */
function parseVote(text: string, session: ShoppingSession): number | null {
  const lower = text.toLowerCase().trim();

  // Match "vote 1", "I vote 2", "put me down for 3", etc.
  if (lower.includes("vote 1") || lower === "1" || lower.includes("vote a")) return 0;
  if (lower.includes("vote 2") || lower === "2" || lower.includes("vote b")) return 1;
  if (lower.includes("vote 3") || lower === "3" || lower.includes("vote c")) return 2;

  // Match exact poll option string (e.g., "1. SoundBlast Pro ($129)")
  for (let i = 0; i < session.products.length; i++) {
    const p = session.products[i];
    const optionText = `${i + 1}. ${p.name} ($${p.price})`.toLowerCase();
    if (lower === optionText) {
      return i;
    }
  }

  return null;
}

export async function handleVote(
  chatId: string,
  senderId: string,
  senderName: string,
  text: string,
  send: SendFn
): Promise<boolean> {
  const session = sessionManager.getSession(chatId);
  if (!session || session.status !== "voting") return false;

  const voteIndex = parseVote(text, session);
  if (voteIndex === null) return false;

  // Make sure the index exists in the current product list
  if (voteIndex >= session.products.length) return false;

  const productId = session.products[voteIndex].id;
  await sessionManager.castVote(chatId, senderId, senderName, productId, send);

  return true;
}
