import { getUncachableStripeClient } from './stripeClient';

async function createProducts() {
  const stripe = await getUncachableStripeClient();

  console.log('Creating Lot Ops Pro products and prices...');

  try {
    // Scanner Only Product
    const scannerProduct = await stripe.products.create({
      name: 'Scanner Only',
      description: 'OCR scanning and work order management',
      metadata: {
        tier: 'scanner',
        features: 'scanning,work_orders,basic_tracking'
      }
    });

    const scannerPrice = await stripe.prices.create({
      product: scannerProduct.id,
      unit_amount: 4900,
      currency: 'usd',
      recurring: { interval: 'month' },
      metadata: { displayName: '$49/month' }
    });

    console.log('✓ Scanner Only:', scannerProduct.id, scannerPrice.id);

    // Lot Ops Lite Product
    const liteProduct = await stripe.products.create({
      name: 'Lot Ops Lite',
      description: 'Lot operations with GPS routing and performance tracking',
      metadata: {
        tier: 'lite',
        features: 'scanning,gps,performance,shifts,messaging,weather'
      }
    });

    const litePrice = await stripe.prices.create({
      product: liteProduct.id,
      unit_amount: 14900,
      currency: 'usd',
      recurring: { interval: 'month' },
      metadata: { displayName: '$149/month' }
    });

    console.log('✓ Lot Ops Lite:', liteProduct.id, litePrice.id);

    // Lot Ops Pro Product
    const proProduct = await stripe.products.create({
      name: 'Lot Ops Pro',
      description: 'Complete operations platform with AI and safety monitoring',
      metadata: {
        tier: 'pro',
        features: 'all,ai_assistant,safety_reporting,speed_monitoring,documents,themes'
      }
    });

    const proPrice = await stripe.prices.create({
      product: proProduct.id,
      unit_amount: 29900,
      currency: 'usd',
      recurring: { interval: 'month' },
      metadata: { displayName: '$299/month' }
    });

    console.log('✓ Lot Ops Pro:', proProduct.id, proPrice.id);

    // Enterprise Product
    const enterpriseProduct = await stripe.products.create({
      name: 'Enterprise',
      description: 'White-label deployment with custom integrations',
      metadata: {
        tier: 'enterprise',
        features: 'all,white_label,multi_facility,custom_integrations,dedicated_support'
      }
    });

    console.log('✓ Enterprise:', enterpriseProduct.id);

    console.log('\nAll products created successfully!');
    console.log('\nNext steps:');
    console.log('1. The app will automatically sync these products to the database');
    console.log('2. You can now use these price IDs in checkout');
    console.log('3. Copy the price IDs to your frontend for checkout buttons');

  } catch (error: any) {
    console.error('Error creating products:', error.message);
    if (error.code === 'resource_missing') {
      console.error('Stripe keys not configured. Check your connection.');
    }
  }
}

createProducts();
