import express, { type Express } from 'express';
import { db } from './db';
import { sql } from 'drizzle-orm';
import { getUncachableStripeClient } from './stripeClient';

export function registerStripeRoutes(app: Express) {
  // Get user's current subscription
  app.get('/api/subscription', async (req: any, res) => {
    try {
      if (!db) {
        return res.json({ subscription: null, error: 'Database not available' });
      }
      if (!req.user?.id) {
        return res.json({ subscription: null });
      }

      // Query user's stripe subscription from database
      const result = await db.execute(
        sql`SELECT stripe_subscription_id FROM users WHERE id = ${req.user.id}`
      );

      const user = result.rows[0];
      if (!user?.stripe_subscription_id) {
        return res.json({ subscription: null });
      }

      // Get subscription from stripe schema
      const subResult = await db.execute(
        sql`SELECT * FROM stripe.subscriptions WHERE id = ${user.stripe_subscription_id}`
      );

      res.json({ subscription: subResult.rows[0] || null });
    } catch (error) {
      console.error('Error fetching subscription:', error);
      res.status(500).json({ error: 'Failed to fetch subscription' });
    }
  });

  // Create checkout session
  app.post('/api/checkout', async (req: any, res) => {
    try {
      if (!db) {
        return res.status(503).json({ error: 'Database not available' });
      }
      if (!req.user?.id || !req.user?.email) {
        return res.status(401).json({ error: 'Not authenticated' });
      }

      const { priceId } = req.body;
      if (!priceId) {
        return res.status(400).json({ error: 'Price ID required' });
      }

      const stripe = await getUncachableStripeClient();
      if (!stripe) {
        return res.status(503).json({ error: 'Stripe not configured' });
      }

      // Get or create customer
      let customerId = req.user.stripe_customer_id;
      if (!customerId) {
        const customer = await stripe.customers.create({
          email: req.user.email,
          metadata: { userId: req.user.id }
        });
        customerId = customer.id;

        // Update user with customer ID
        await db.execute(
          sql`UPDATE users SET stripe_customer_id = ${customerId} WHERE id = ${req.user.id}`
        );
      }

      // Create checkout session
      const session = await stripe.checkout.sessions.create({
        customer: customerId,
        payment_method_types: ['card'],
        line_items: [{ price: priceId, quantity: 1 }],
        mode: 'subscription',
        success_url: `${req.protocol}://${req.get('host')}/checkout/success`,
        cancel_url: `${req.protocol}://${req.get('host')}/checkout/cancel`
      });

      res.json({ url: session.url });
    } catch (error: any) {
      console.error('Checkout error:', error);
      res.status(500).json({ error: error.message || 'Checkout failed' });
    }
  });

  // Customer portal (manage billing)
  app.post('/api/customer-portal', async (req: any, res) => {
    try {
      if (!req.user?.stripe_customer_id) {
        return res.status(400).json({ error: 'No customer ID found' });
      }

      const { returnUrl } = req.body;
      const stripe = await getUncachableStripeClient();
      if (!stripe) {
        return res.status(503).json({ error: 'Stripe not configured' });
      }

      const session = await stripe.billingPortal.sessions.create({
        customer: req.user.stripe_customer_id,
        return_url: returnUrl || `${req.protocol}://${req.get('host')}/subscription`
      });

      res.json({ url: session.url });
    } catch (error: any) {
      console.error('Portal error:', error);
      res.status(500).json({ error: error.message || 'Portal creation failed' });
    }
  });

  // Get products and prices
  app.get('/api/products', async (req, res) => {
    try {
      if (!db) {
        return res.json({ data: [] });
      }
      const result = await db.execute(
        sql`
          SELECT DISTINCT
            p.id,
            p.name,
            p.description,
            p.metadata,
            p.active
          FROM stripe.products p
          WHERE p.active = true
          ORDER BY p.name
        `
      );

      res.json({ data: result.rows });
    } catch (error) {
      console.error('Error fetching products:', error);
      res.status(500).json({ error: 'Failed to fetch products' });
    }
  });

  // Get prices for products
  app.get('/api/prices', async (req, res) => {
    try {
      if (!db) {
        return res.json({ data: [] });
      }
      const result = await db.execute(
        sql`
          SELECT
            p.id,
            p.product,
            p.unit_amount,
            p.currency,
            p.recurring,
            p.active,
            pr.name as product_name
          FROM stripe.prices p
          JOIN stripe.products pr ON pr.id = p.product
          WHERE p.active = true
          ORDER BY p.unit_amount
        `
      );

      res.json({ data: result.rows });
    } catch (error) {
      console.error('Error fetching prices:', error);
      res.status(500).json({ error: 'Failed to fetch prices' });
    }
  });
}
