import type { Product } from "./SearchEngine.js";

const paystackSecretKey = process.env.PAYSTACK_SECRET_KEY || "sk_test_dummy";

export async function createPaystackSession(product: Product, email: string): Promise<string | null> {
  try {
    // We add a $5 service fee for the concierge service
    const serviceFee = 5.00;
    const totalAmountKobo = Math.round((product.price + serviceFee) * 100);

    const response = await fetch("https://api.paystack.co/transaction/initialize", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${paystackSecretKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        email: email,
        amount: totalAmountKobo, // Paystack amount is in kobo / lowest denomination
        currency: "USD", // Or "NGN" depending on your account setup
        callback_url: "https://photon.codes/success",
        metadata: {
          custom_fields: [
            {
              display_name: "Order Type",
              variable_name: "order_type",
              value: `Concierge Order: ${product.name}`,
            },
          ],
        },
      }),
    });

    if (!response.ok) {
      const errText = await response.text();
      console.error("❌ Paystack API Error:", response.status, errText);
      return null;
    }

    const data = await response.json() as any;
    if (data && data.status && data.data && data.data.authorization_url) {
      return data.data.authorization_url;
    }
    
    return null;
  } catch (error) {
    console.error("❌ Error creating Paystack checkout session:", error);
    return null;
  }
}
