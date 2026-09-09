// ============================================================
// Carty — Local Test Script
// ============================================================
// Simulates a full shopping session locally without Spectrum.

import "dotenv/config";
import { parseCommand, handleCommand } from "./handlers/commandHandler.js";
import { handleVote } from "./handlers/voteHandler.js";

// Simulated send function
const send = async (msg: any) => {
  console.log("\n" + "─".repeat(50));
  console.log("🤖 Carty:");
  if (typeof msg === "string") {
    console.log(msg);
  } else {
    // If it's a Poll or RichLink object, serialize it so we can read it in the terminal
    console.log(JSON.stringify(msg, null, 2));
  }
  console.log("─".repeat(50) + "\n");
};

// Simulate an incoming message
async function simulateMessage(
  chatId: string,
  senderId: string,
  senderName: string,
  text: string
) {
  console.log(`👤 ${senderName}: ${text}`);
  
  const command = parseCommand(text);
  if (command.type !== "unknown") {
    await handleCommand(command, chatId, senderId, senderName, send);
    return;
  }

  const isVote = await handleVote(chatId, senderId, senderName, text, send);
  if (!isVote) {
    // Ignored message
    // console.log(`(Message ignored by Carty)`);
  }
}

// ──────────────────────────────────────────────
// RUN SIMULATION
// ──────────────────────────────────────────────

async function runSimulation() {
  console.log("🛍️ Carty — Local Test Simulation");
  console.log("=========================================\n");

  const chatId = "test-group-chat";
  
  const p1 = { id: "p1", name: "Rahmat" };
  const p2 = { id: "p2", name: "Sarah" };
  const p3 = { id: "p3", name: "David" };

  // 1. Rahmat starts a search
  await simulateMessage(chatId, p1.id, p1.name, "/shop Bluetooth speaker under $150");

  // 2. Everyone votes
  await simulateMessage(chatId, p1.id, p1.name, "I vote 1");
  await simulateMessage(chatId, p2.id, p2.name, "vote 1");
  await simulateMessage(chatId, p3.id, p3.name, "Put me down for 3");

  // 3. Sarah changes her mind
  await simulateMessage(chatId, p2.id, p2.name, "Wait, vote 3");

  // 4. Rahmat decides
  await simulateMessage(chatId, p1.id, p1.name, "/decide");
}

runSimulation().catch(console.error);
