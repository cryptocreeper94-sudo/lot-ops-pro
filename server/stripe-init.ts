import { getUncachableStripeClient } from './stripeClient';

export async function initStripe() {
  // Skip Stripe entirely if disabled or no database
  if (process.env.SKIP_STRIPE === 'true') {
    console.log('Stripe integration disabled via SKIP_STRIPE');
    return;
  }

  try {
    console.log('Initializing Stripe...');
    const stripe = await getUncachableStripeClient();

    if (!stripe) {
      console.log('Stripe client not available - skipping initialization');
      return;
    }

    // Verify connection by listing products
    const products = await stripe.products.list({ limit: 1 });
    console.log(`✓ Stripe connected (${products.data.length ? 'products found' : 'no products yet'})`);

    // Set up webhook if domain is configured
    const domain = process.env.APP_DOMAIN || 'lotopspro.io';
    const webhookUrl = `https://${domain}/api/stripe/webhook`;

    console.log(`✓ Stripe webhook expected at: ${webhookUrl}`);

  } catch (error: any) {
    // Log but don't crash - Stripe is optional
    console.log('Stripe initialization skipped:', error.message || error);
  }
}
