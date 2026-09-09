export interface Product {
    id: string;
    name: string;
    price: number;
    highlight: string;
    url: string;
}
export interface SearchResult {
    query: string;
    category: string;
    products: Product[];
}
/**
 * Perform a live search via SerpApi Google Shopping.
 */
export declare function searchLiveProducts(query: string): Promise<SearchResult | null>;
//# sourceMappingURL=SearchEngine.d.ts.map