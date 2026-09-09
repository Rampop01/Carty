// ============================================================
// Carty — Command Handler
// ============================================================
// Parses and routes incoming user commands.
import { sessionManager } from "../shop/SessionManager.js";
export function parseCommand(text) {
    const trimmed = text.trim();
    const lower = trimmed.toLowerCase();
    // /shop <query>
    if (lower.startsWith("/shop ") || lower.startsWith("shop ")) {
        const args = lower.startsWith("/shop ") ? trimmed.slice(6) : trimmed.slice(5);
        return { type: "shop", args: args.trim() };
    }
    // /decide or /buy
    if (lower === "/decide" || lower === "decide" || lower === "/buy" || lower === "buy") {
        return { type: "decide" };
    }
    if (lower === "/help" || lower === "help") {
        return { type: "help" };
    }
    return { type: "unknown" };
}
export async function handleCommand(command, chatId, senderId, senderName, send) {
    switch (command.type) {
        case "shop":
            if (!command.args) {
                await send(`🛍️ Carty\n\nUsage: /shop <what you want>\nExample: /shop Bluetooth speaker under $150`);
                return;
            }
            await sessionManager.startShopping(chatId, command.args, senderId, senderName, send);
            break;
        case "decide":
            await sessionManager.decide(chatId, send);
            break;
        case "help":
            await send([
                "🛍️ Carty — Commands",
                "",
                "/shop <item> — Search for products",
                "vote <1/2/3> — Vote for an option",
                "/decide — End voting and announce winner"
            ].join("\n"));
            break;
        case "unknown":
            // Do nothing for unknown commands here; vote handler will catch conversational votes
            break;
    }
}
//# sourceMappingURL=commandHandler.js.map