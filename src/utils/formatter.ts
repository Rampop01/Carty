// ============================================================
// Carty — Message Formatter
// ============================================================
// Creates the rich text UI for the iMessage conversation.

import type { Product } from "../shop/SearchEngine.js";
import type { ShoppingSession } from "../shop/SessionState.js";

export function formatSearchResults(session: ShoppingSession): string {
  const lines = [
    `🛍️ Got it. Looking for: ${session.query}`,
    `I found ${session.products.length} strong options.`,
    "",
    "┌─────────────────────────┐",
    "│ TOP PICKS               │",
    "│                         │"
  ];

  for (let i = 0; i < session.products.length; i++) {
    const p = session.products[i];
    lines.push(`│ ${i + 1}. ${p.name.padEnd(21)}│`);
    lines.push(`│ $${p.price.toString().padEnd(23)}│`);
    lines.push(`│ ${p.highlight.padEnd(23)}│`);
    if (i < session.products.length - 1) {
      lines.push("│                         │");
    }
  }

  lines.push("└─────────────────────────┘");
  lines.push("");
  lines.push(`Reply with "select 1", "select 2", or "select 3" to choose!`);

  return lines.join("\n");
}

export function formatSelectionPrompt(product: Product): string {
  return [
    `✅ You selected: ${product.name} ($${product.price})`,
    ``,
    `How would you like to proceed?`,
    `1. "Buy it myself" (I'll send you the direct URL)`,
    `2. "Pay with Crypto" (Not available at the moment, development in progress)`,
    `3. "Pay with Card" (Not available at the moment, development in progress)`
  ].join("\n");
}

export function formatSelfBuy(product: Product): string {
  return [
    `Sounds good! You can purchase it directly here:`,
    `👉 ${product.url}`,
    "",
    `Let me know if you need to shop for anything else! 🛍️`
  ].join("\n");
}

export function formatConciergeEmailPrompt(product: Product): string {
  return [
    `To generate your Paystack checkout link, please reply with your **email address**.`
  ].join("\n");
}

export function formatCryptoBuy(product: Product): string {
  const cryptoWallet = process.env.CRYPTO_WALLET_ADDRESS || "0xBEEF1D6399Df3619F5618b4C0D7f2a90d90Edf26";
  const serviceFee = 5.00;
  const total = (product.price + serviceFee).toFixed(2);

  return [
    `🪙 **Crypto Payment**`,
    ``,
    `Product Price: $${product.price.toFixed(2)}`,
    `Service Fee: $${serviceFee.toFixed(2)}`,
    `**Total: $${total}**`,
    ``,
    `Please send exactly **$${total}** in USDT or USDC on the **Base network** to:`,
    `\`${cryptoWallet}\``,
    ``,
    `Once you have paid, reply to let me know so I can process your order! 🛍️`
  ].join("\n");
}

export function formatCardBuy(product: Product): string {
  return [
    `💳 **Card/Fiat Payment**`,
    `Tap the checkout link below to securely pay using Paystack.`,
    ``,
    `Once you have paid, I will process your order! 🛍️`
  ].join("\n");
}

export function formatNoProductsFound(query: string): string {
  return `❌ I couldn't find any recommendations for "${query}".\nTry searching for "Bluetooth speakers" or "Coding laptop".`;
}

export function formatSessionAlreadyActive(query: string): string {
  return `⚠️ We are already shopping for: "${query}"\nType "/cancel" to clear the session first.`;
}

export function formatNoActiveSession(): string {
  return `There's no active shopping session.\nStart one with: /shop <what you need>`;
}
