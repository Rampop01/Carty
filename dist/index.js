// ============================================================
// Carty — Main Entry Point
// ============================================================
// Connects to Photon Spectrum and routes incoming messages.
import "dotenv/config";
import { Spectrum } from "spectrum-ts";
import { imessage } from "spectrum-ts/providers/imessage";
import { parseCommand, handleCommand } from "./handlers/commandHandler.js";
import { handleVote } from "./handlers/voteHandler.js";
const PROJECT_ID = process.env.PROJECT_ID;
const PROJECT_SECRET = process.env.PROJECT_SECRET;
if (!PROJECT_ID || !PROJECT_SECRET) {
    console.error("❌ ERROR: Missing PROJECT_ID or PROJECT_SECRET in .env");
    console.error("Get these from https://app.photon.codes");
    process.exit(1);
}
// 1. Initialize Spectrum
console.log("🛍️ Carty starting up...");
const app = await Spectrum({
    projectId: PROJECT_ID,
    projectSecret: PROJECT_SECRET,
    providers: [imessage.config()],
});
console.log("✅ Connected to Photon Spectrum!");
console.log("🎯 Carty is live. Waiting for shopping requests...");
console.log("");
console.log("   Commands:");
console.log("   /shop <item>  — Start a shopping session");
console.log("   vote 1        — Vote for option 1");
console.log("   /decide       — Announce the winner");
console.log("");
// 2. Handle incoming messages
for await (const [space, message] of app.messages) {
    await space.responding(async () => {
        try {
            const text = message.text?.trim();
            if (!text)
                return;
            const chatId = space.id || "default";
            const senderId = message.sender?.id || "unknown";
            const senderName = message.sender.name || message.sender?.id || "Shopper";
            const send = async (msg) => {
                await message.reply(msg);
            };
            // Check if it's a command like /shop or /decide
            const command = parseCommand(text);
            if (command.type !== "unknown") {
                await handleCommand(command, chatId, senderId, senderName, send);
                return;
            }
            // If not a command, check if it's a vote
            const isVote = await handleVote(chatId, senderId, senderName, text, send);
            if (isVote)
                return;
        }
        catch (error) {
            console.error("Error processing message:", error);
            try {
                await message.reply("❌ Oops, I ran into an error. Let's try that again.");
            }
            catch { }
        }
    });
}
//# sourceMappingURL=index.js.map