// ============================================================
// Carty — Local Test Script
// ============================================================
// Simulates a full shopping session locally without Spectrum.

import "dotenv/config";
import { parseCommand, handleCommand } from "./handlers/commandHandler.js";
import { handleSelection } from "./handlers/selectionHandler.js";

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
  text: string
) {
  console.log(`👤 Shopper: ${text}`);
  
  const command = parseCommand(text);
  if (command.type !== "unknown") {
    await handleCommand(command, chatId, send);
    return;
  }

  const isSelection = await handleSelection(chatId, text, send);
  if (!isSelection) {
    // console.log(`(Message ignored by Carty)`);
  }
}

// ──────────────────────────────────────────────
// RUN SIMULATION
// ──────────────────────────────────────────────

async function runSimulation() {
  console.log("🛍️ Carty — Local Test Simulation (1-on-1)");
  console.log("=========================================\n");

  const chatId = "test-dm-chat";
  
  // 1. Start a search
  await simulateMessage(chatId, "/shop Bluetooth speaker under $150");

  // 2. Select option 1
  await simulateMessage(chatId, "select 1");

  // 3. Choose fulfillment
  await simulateMessage(chatId, "do it for me");

  // 4. Provide email
  await simulateMessage(chatId, "hello@example.com");
}

runSimulation().catch(console.error);
