// ============================================================
// Carty — Message Formatter
// ============================================================
// Creates the rich text UI for the iMessage conversation.
import { getVoteCounts, getVotersForProduct } from "../shop/SessionState.js";
export function formatSearchResults(session) {
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
    lines.push(`Reply with "vote 1", "vote 2", or "vote 3" to decide!`);
    return lines.join("\n");
}
export function formatVotingUpdate(session) {
    const counts = getVoteCounts(session);
    const totalVotes = session.votes.size;
    const lines = [
        `📊 CURRENT VOTES (${totalVotes} total)`,
        ""
    ];
    for (let i = 0; i < session.products.length; i++) {
        const p = session.products[i];
        const voteCount = counts.get(p.id) || 0;
        const voters = getVotersForProduct(session, p.id);
        let voteText = `👍 ${voteCount} vote${voteCount !== 1 ? "s" : ""}`;
        if (voters.length > 0) {
            voteText += ` (${voters.join(", ")})`;
        }
        lines.push(`${i + 1}. ${p.name} — ${voteText}`);
    }
    lines.push("");
    lines.push(`Type "/decide" to lock it in.`);
    return lines.join("\n");
}
export function formatFinalDecision(product, votes, totalVotes) {
    return [
        `🏆 THE GROUP HAS SPOKEN`,
        "",
        `We are going with:`,
        `👉 ${product.name} ($${product.price})`,
        `It received ${votes} out of ${totalVotes} votes.`,
        "",
        `I'll save this to your group's shopping list. 🛍️`
    ].join("\n");
}
export function formatNoProductsFound(query) {
    return `❌ I couldn't find any recommendations for "${query}".\nTry searching for "Bluetooth speakers" or "Coding laptop".`;
}
export function formatSessionAlreadyActive(query) {
    return `⚠️ We are already shopping for: "${query}"\nType "/decide" to finish the current session first.`;
}
export function formatNoActiveSession() {
    return `There's no active shopping session.\nStart one with: /shop <what you need>`;
}
//# sourceMappingURL=formatter.js.map