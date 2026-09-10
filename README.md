# Carty - Autonomous Personal Shopping Assistant

Carty is an AI-powered personal shopping assistant that operates directly within iMessage. It allows users to search for products across the web using natural language and provides curated recommendations.

## Current Features (MVP 1)
- **Natural Language Shopping:** Users can text `/shop <item>` (e.g. `/shop Premium Bluetooth speakers`) directly in iMessage.
- **Live Market Search:** Carty queries live shopping data using SerpApi to find the top 3 best matching products, complete with prices and curated highlights (Best match, Great value, etc.).
- **Direct Affiliate Purchasing:** Users can select an item and choose "Buy it myself". Carty instantly provides the direct URL to the retailer (Amazon, Target, BestBuy, etc.) so the user can purchase it directly.
- **Graceful Error Handling:** If the underlying search engine times out or encounters an error, Carty relays the exact error to the user for easy debugging.

## Upcoming Features (MVP 2)
The next phase of Carty focuses on **Fully Autonomous Concierge Fulfillment**, allowing users to pay the bot directly and have the bot place the order for them.

- **Automated Crypto Checkout (Web3):**
  - Unique deposit address generation for every order.
  - On-chain payment detection (via Moralis, Alchemy, or similar) to instantly confirm USDC/USDT deposits on the Base network.
  - Integration with Crypto-to-Fiat Virtual Card providers (e.g., Sphere, PST.net) to instantly generate a one-time-use virtual Visa card funded by the user's crypto deposit.
- **Automated Card/Fiat Checkout (Web2):**
  - Native Paystack integration to securely accept credit cards and Apple Pay in supported regions.
- **Autonomous Purchasing Agents:**
  - Utilizing Puppeteer or Browser-Use agents to automatically navigate to the retailer's website, input the user's shipping address, and check out using the dynamically generated virtual card.
