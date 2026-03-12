import { getUncachableStripeClient } from './stripeClient';

async function seedNftBadgeProduct() {
  try {
    const stripe = await getUncachableStripeClient();
    
    // Check if product already exists
    const existingProducts = await stripe.products.search({ 
      query: "name:'Lot Ops Pro NFT Hallmark Badge'" 
    });
    
    if (existingProducts.data.length > 0) {
      console.log('NFT Badge product already exists:', existingProducts.data[0].id);
      
      // Get existing price
      const prices = await stripe.prices.list({ product: existingProducts.data[0].id, active: true });
      if (prices.data.length > 0) {
        console.log('Price ID:', prices.data[0].id);
        console.log('Amount:', prices.data[0].unit_amount! / 100, prices.data[0].currency.toUpperCase());
      }
      return;
    }
    
    // Create the NFT Badge product
    const product = await stripe.products.create({
      name: 'Lot Ops Pro NFT Hallmark Badge',
      description: 'Verified blockchain NFT badge minted on Solana Mainnet. Permanent proof of your driver achievements and performance stats.',
      images: ['https://lot-ops-pro.replit.app/lotops-emblem-transparent.png'],
      metadata: {
        type: 'nft_badge',
        blockchain: 'solana_mainnet',
        category: 'digital_collectible',
      }
    });
    
    console.log('Created product:', product.id, product.name);
    
    // Create the $1.99 price
    const price = await stripe.prices.create({
      product: product.id,
      unit_amount: 199, // $1.99 in cents
      currency: 'usd',
      metadata: {
        type: 'nft_badge_purchase',
        variant: 'public',
      }
    });
    
    console.log('Created price:', price.id, '$' + (price.unit_amount! / 100));
    console.log('\n--- IMPORTANT ---');
    console.log('Add this to your environment or config:');
    console.log(`NFT_BADGE_PRICE_ID=${price.id}`);
    
  } catch (error) {
    console.error('Error seeding NFT badge product:', error);
    throw error;
  }
}

seedNftBadgeProduct();
