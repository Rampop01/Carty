// ============================================================
// Carty — Session State
// ============================================================
export function createSession(id, chatId, query, hostId, hostName) {
    const playerNames = new Map();
    playerNames.set(hostId, hostName);
    return {
        id,
        chatId,
        query,
        status: "searching",
        products: [],
        votes: new Map(),
        playerNames,
        hostId,
    };
}
export function getVoteCounts(session) {
    const counts = new Map();
    for (const product of session.products) {
        counts.set(product.id, 0);
    }
    for (const productId of session.votes.values()) {
        counts.set(productId, (counts.get(productId) || 0) + 1);
    }
    return counts;
}
export function getVotersForProduct(session, productId) {
    const voters = [];
    for (const [playerId, pid] of session.votes.entries()) {
        if (pid === productId) {
            voters.push(session.playerNames.get(playerId) || "Unknown");
        }
    }
    return voters;
}
//# sourceMappingURL=SessionState.js.map