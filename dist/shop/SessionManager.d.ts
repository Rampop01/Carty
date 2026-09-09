import { type ShoppingSession } from "./SessionState.js";
export type SendFn = (message: any) => Promise<void>;
export declare class SessionManager {
    private sessions;
    hasSession(chatId: string): boolean;
    getSession(chatId: string): ShoppingSession | undefined;
    /**
     * Start a new shopping session.
     */
    startShopping(chatId: string, query: string, hostId: string, hostName: string, send: SendFn): Promise<void>;
    /**
     * Cast a vote for a product.
     */
    castVote(chatId: string, playerId: string, playerName: string, productId: string, send: SendFn): Promise<void>;
    /**
     * Close the session and announce the winner.
     */
    decide(chatId: string, send: SendFn): Promise<void>;
}
export declare const sessionManager: SessionManager;
//# sourceMappingURL=SessionManager.d.ts.map