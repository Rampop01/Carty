import type { Product } from "../shop/SearchEngine.js";
import { type ShoppingSession } from "../shop/SessionState.js";
export declare function formatSearchResults(session: ShoppingSession): string;
export declare function formatVotingUpdate(session: ShoppingSession): string;
export declare function formatFinalDecision(product: Product, votes: number, totalVotes: number): string;
export declare function formatNoProductsFound(query: string): string;
export declare function formatSessionAlreadyActive(query: string): string;
export declare function formatNoActiveSession(): string;
//# sourceMappingURL=formatter.d.ts.map