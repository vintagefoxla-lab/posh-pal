import express from 'express';
import stripePackage from 'stripe';
import cors from 'cors';
import bodyParser from 'body-parser';

const stripe = new stripePackage(process.env.STRIPE_SECRET_KEY);
const app = express();

app.use(cors());
app.use(bodyParser.json());

const PORT = process.env.PORT || 3001;

app.post('/create-checkout-session', async (req, res) => {
  try {
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: [
        {
          price_data: {
            currency: 'usd',
            product_data: {
              name: 'Posh Pal Pro Subscription',
              description: 'Unlimited AI listings, 24/7 sharing, and cross-listing tools.',
            },
            unit_amount: 1500,
            recurring: {
              interval: 'month',
            },
          },
          quantity: 1,
        },
      ],
      mode: 'subscription',
      success_url: `${req.headers.origin}/?success=true`,
      cancel_url: `${req.headers.origin}/?canceled=true`,
    });

    res.json({ id: session.id, url: session.url });
  } catch (error) {
    console.error('Error creating checkout session:', error);
    res.status(500).json({ error: error.message });
  }
});

app.listen(PORT, '0.0.0.0', () => {
  console.log(`Server running on port ${PORT}`);
});
