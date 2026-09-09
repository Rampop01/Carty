// ============================================================
// Carty — Live Search Engine (SerpApi)
// ============================================================

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
export async function searchLiveProducts(query: string): Promise<SearchResult | null> {
  const apiKey = process.env.SERPAPI_KEY;
  if (!apiKey) {
    console.error("❌ Missing SERPAPI_KEY in .env");
    return null;
  }

  try {
    // Build the request URL
    const url = new URL("https://serpapi.com/search");
    url.searchParams.append("engine", "google_shopping");
    url.searchParams.append("q", query);
    url.searchParams.append("api_key", apiKey);
    url.searchParams.append("hl", "en");
    url.searchParams.append("gl", "us");

    const response = await fetch(url.toString());
    if (!response.ok) {
      console.error("❌ SerpApi request failed:", response.statusText);
      return null;
    }

    const data = await response.json();
    
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

      return {
        id: item.product_id || `product_${index}`,
        name,
        price,
        highlight,
        url: item.link || "https://google.com/shopping",
      };
    });

    return {
      query,
      category: "Live Search",
      products
    };

  } catch (error) {
    console.error("❌ Error fetching from SerpApi:", error);
    return null;
  }
}
