// ============================================================
// Carty — Command Handler
// ============================================================
// Parses and routes incoming user commands.

import { sessionManager, type SendFn } from "../shop/SessionManager.js";

export interface ParsedCommand {
  type: "shop" | "cancel" | "help" | "unknown";
  args?: string;
}

export function parseCommand(text: string): ParsedCommand {
  const trimmed = text.trim();
  const lower = trimmed.toLowerCase();

  // /shop <query>
  if (lower.startsWith("/shop ") || lower.startsWith("shop ")) {
    const args = lower.startsWith("/shop ") ? trimmed.slice(6) : trimmed.slice(5);
    return { type: "shop", args: args.trim() };
  }

  // /cancel
  if (lower === "/cancel" || lower === "cancel") {
    return { type: "cancel" };
  }

  if (lower === "/help" || lower === "help") {
    return { type: "help" };
  }

  return { type: "unknown" };
}

export async function handleCommand(
  command: ParsedCommand,
  chatId: string,
  send: SendFn
): Promise<void> {
  switch (command.type) {
    case "shop":
      if (!command.args) {
        await send(`🛍️ Carty\n\nUsage: /shop <what you want>\nExample: /shop Bluetooth speaker under $150`);
        return;
      }
      await sessionManager.startShopping(chatId, command.args, send);
      break;

    case "cancel":
      await sessionManager.cancelSession(chatId, send);
      break;

    case "help":
      await send(
        [
          "🛍️ Carty — Personal Shopper",
          "",
          "/shop <item> — Search for products",
          "select <1/2/3> — Choose an option",
          "/cancel — Cancel current shopping session"
        ].join("\n")
      );
      break;

    case "unknown":
      // Do nothing for unknown commands here; selection handler will catch natural text
      break;
  }
}
