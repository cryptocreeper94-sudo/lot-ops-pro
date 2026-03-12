import Stripe from 'stripe';

async function getCredentials() {
  // Use environment secrets directly
  const secretKey = process.env.STRIPE_SECRET_KEY;
  const publishableKey = process.env.STRIPE_PUBLISHABLE_KEY;

  if (!secretKey || !publishableKey) {
    console.log('Stripe keys not configured (STRIPE_SECRET_KEY/STRIPE_PUBLISHABLE_KEY missing)');
    return null;
  }

  return {
    publishableKey,
    secretKey,
  };
}

export async function getUncachableStripeClient() {
  const creds = await getCredentials();
  if (!creds) return null;
  return new Stripe(creds.secretKey);
}

export async function getStripePublishableKey() {
  const creds = await getCredentials();
  return creds?.publishableKey || null;
}

export async function getStripeSecretKey() {
  const creds = await getCredentials();
  return creds?.secretKey || null;
}
