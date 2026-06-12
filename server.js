import express from 'express';
import stripePackage from 'stripe';
import cors from 'cors';
import bodyParser from 'body-parser';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import { execSync } from 'child_process';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const stripe = new stripePackage(process.env.STRIPE_SECRET_KEY);
const app = express();

const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(bodyParser.json());

// Helper to run team-db commands
const runQuery = (query) => {
  try {
    const output = execSync(`team-db "${query.replace(/"/g, '\\"')}"`).toString();
    return JSON.parse(output);
  } catch (error) {
    console.error('Database Error:', error);
    throw error;
  }
};

// Serve static files from the dist directory
app.use(express.static(path.join(__dirname, 'dist')));

// Inventory API Endpoints
app.get('/api/inventory', (req, res) => {
  try {
    const items = runQuery('SELECT * FROM inventory ORDER BY created_at DESC');
    res.json(items);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch inventory' });
  }
});

app.post('/api/inventory', (req, res) => {
  const { id, title, description, price, brand, size, condition, category, status } = req.body;
  try {
    runQuery(`INSERT INTO inventory (id, title, description, price, brand, size, condition, category, status) VALUES ('${id}', '${title}', '${description}', '${price}', '${brand}', '${size}', '${condition}', '${category}', '${status}')`);
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: 'Failed to add item to inventory' });
  }
});

app.put('/api/inventory/:id', (req, res) => {
  const { id } = req.params;
  const { title, description, price, brand, size, condition, category, status } = req.body;
  try {
    runQuery(`UPDATE inventory SET title = '${title}', description = '${description}', price = '${price}', brand = '${brand}', size = '${size}', condition = '${condition}', category = '${category}', status = '${status}' WHERE id = '${id}'`);
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: 'Failed to update inventory item' });
  }
});

app.delete('/api/inventory/:id', (req, res) => {
  const { id } = req.params;
  try {
    runQuery(`DELETE FROM inventory WHERE id = '${id}'`);
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: 'Failed to delete inventory item' });
  }
});

app.post('/api/create-checkout-session', async (req, res) => {
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

// Catch-all route to serve the index.html for any non-API requests
app.use((req, res) => {
  res.sendFile(path.join(__dirname, 'dist', 'index.html'));
});

app.listen(PORT, '0.0.0.0', () => {
  console.log(`Server running on port ${PORT}`);
});
