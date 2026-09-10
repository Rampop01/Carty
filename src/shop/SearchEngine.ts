// ============================================================
// Carty — Live Search Engine (SerpApi)
// ============================================================

import axios from "axios";

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
export async function searchLiveProducts(query: string): Promise<SearchResult | string | null> {
  const apiKey = process.env.SERPAPI_KEY;
  if (!apiKey) {
    console.error("❌ Missing SERPAPI_KEY in .env");
    return "Missing SERPAPI_KEY in .env";
  }

  try {
    // Build the request URL
    const url = new URL("https://serpapi.com/search");
    url.searchParams.append("engine", "google_shopping");
    url.searchParams.append("q", query);
    url.searchParams.append("api_key", apiKey);
    url.searchParams.append("hl", "en");
    url.searchParams.append("gl", "us");

    const response = await axios.get(url.toString(), {
      timeout: 45000,
      validateStatus: () => true // Handle errors manually
    });

    if (response.status !== 200) {
      const errStr = typeof response.data === 'object' ? JSON.stringify(response.data) : response.statusText;
      return `SerpApi HTTP Error ${response.status}: ${errStr}`;
    }

    const data = response.data;
    
    // Extract the top shopping results
    const results = data.shopping_results || [];
    if (results.length === 0) return null;

    // We only want the top 3 options
    const topResults = results.slice(0, 3);

    const products: Product[] = topResults.map((item: any, index: number) => {
      // Try to parse the price securely, defaulting to 0 if missing
      let price = 0;
      if (item.extracted_price) {
        price = item.extracted_price;
      } else if (item.price) {
        const match = item.price.match(/\$(\d+(\.\d+)?)/);
        if (match) price = parseFloat(match[1]);
      }

      // Generate a fake highlight based on its rank to keep the UI looking good
      let highlight = "👍 Solid option";
      if (index === 0) highlight = "⭐ Best overall match";
      if (index === 1) highlight = "💰 Great value";
      if (index === 2) highlight = "👀 Interesting alternative";

      // Keep names relatively short so the Poll UI doesn't look messy
      let name = item.title || "Unknown Product";
      if (name.length > 35) name = name.substring(0, 32) + "...";

      const rawUrl = item.product_link || item.link || "https://google.com/shopping";
      
      return {
        id: item.product_id || `product_${index}`,
        name,
        price,
        highlight,
        url: encodeURI(rawUrl),
      };
    });

    return {
      query,
      category: "Live Search",
      products
    };

  } catch (error: any) {
    console.error("❌ Error fetching from SerpApi:", error);
    return `SerpApi Exception: ${error.message || String(error)}`;
  }
}
