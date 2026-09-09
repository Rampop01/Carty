import type { Product } from "./SearchEngine.js";
export type SessionStatus = "searching" | "voting" | "decided";
export interface ShoppingSession {
    id: string;
    chatId: string;
    query: string;
    status: SessionStatus;
    products: Product[];
    votes: Map<string, string>;
    playerNames: Map<string, string>;
    hostId: string;
}
export declare function createSession(id: string, chatId: string, query: string, hostId: string, hostName: string): ShoppingSession;
export declare function getVoteCounts(session: ShoppingSession): Map<string, number>;
export declare function getVotersForProduct(session: ShoppingSession, productId: string): string[];
//# sourceMappingURL=SessionState.d.ts.map