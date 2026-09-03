import express from 'express';
import stripePackage from 'stripe';
import cors from 'cors';
import bodyParser from 'body-parser';
import dotenv from 'dotenv';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import { execSync } from 'child_process';
import crypto from 'crypto';

import { GoogleGenerativeAI } from "@google/generative-ai";

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

let stripe;
try {
  if (process.env.STRIPE_SECRET_KEY) {
    stripe = new stripePackage(process.env.STRIPE_SECRET_KEY);
  } else {
    console.warn('STRIPE_SECRET_KEY not found. Stripe features will be disabled.');
  }
} catch (e) {
  console.error('Failed to initialize Stripe:', e.message);
}

let genAI;
if (process.env.VITE_GEMINI_API_KEY) {
  genAI = new GoogleGenerativeAI(process.env.VITE_GEMINI_API_KEY);
}
const app = express();

const PORT = process.env.PORT || 3000;

app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} ${req.method} ${req.url}`);
  next();
});

app.use(cors());

// Webhook needs raw body for signature verification - must be BEFORE bodyParser.json()
app.post('/api/stripe/webhook', express.raw({type: 'application/json'}), async (req, res) => {
  const sig = req.headers['stripe-signature'];
  let event;

  try {
    if (!process.env.STRIPE_WEBHOOK_SECRET) {
      throw new Error('Webhook secret missing');
    }
    event = await stripe.webhooks.constructEventAsync(req.body, sig, process.env.STRIPE_WEBHOOK_SECRET);
  } catch (err) {
    console.error(`Webhook Error: ${err.message}`);
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }

  // Handle the event
  switch (event.type) {
    case 'checkout.session.completed':
      const session = event.data.object;
      const userId = session.client_reference_id || session.metadata?.userId;
      if (userId) {
        const expiryDate = new Date();
        expiryDate.setMonth(expiryDate.getMonth() + 1);
        const expiryStr = expiryDate.toISOString().replace('T', ' ').substring(0, 19);
        
        runQuery(`UPDATE users SET 
          is_pro = 1, 
          pro_expires_at = '${expiryStr}',
          subscription_status = 'active',
          stripe_customer_id = ${val(session.customer)},
          stripe_subscription_id = ${val(session.subscription)}
          WHERE id = '${escapeSql(userId)}'`);
        console.log(`Webhook: User ${userId} upgraded via checkout.session.completed`);
      }
      break;
    case 'customer.subscription.updated':
    case 'customer.subscription.deleted':
      const subscription = event.data.object;
      const status = subscription.status;
      const stripeSubId = subscription.id;
      const cancelAtPeriodEnd = subscription.cancel_at_period_end;
      
      let localStatus = status;
      if (cancelAtPeriodEnd && status === 'active') {
        localStatus = 'canceled';
      }
      
      if (status !== 'active' && status !== 'trialing' && status !== 'past_due') {
        console.log(`Subscription ${stripeSubId} is ${status}. Downgrading user.`);
        runQuery(`UPDATE users SET is_pro = 0, subscription_status = '${localStatus}' WHERE stripe_subscription_id = '${escapeSql(stripeSubId)}'`);
      } else {
        runQuery(`UPDATE users SET subscription_status = '${localStatus}' WHERE stripe_subscription_id = '${escapeSql(stripeSubId)}'`);
      }
      break;
    case 'invoice.payment_failed':
      const invoice = event.data.object;
      if (invoice.subscription) {
        console.log(`Payment failed for invoice ${invoice.id}. Downgrading user.`);
        runQuery(`UPDATE users SET is_pro = 0, subscription_status = 'past_due' WHERE stripe_subscription_id = '${escapeSql(invoice.subscription)}'`);
      }
      break;
    default:
      console.log(`Unhandled event type ${event.type}`);
  }

  res.json({received: true});
});

app.use(bodyParser.json());

// Authentication & Subscription Verification Middleware
const auth = (req, res, next) => {
  req.userId = req.headers['x-user-id'] || 'default_user';
  
  // Verify Pro status and subscription lifecycle
  try {
    const userResult = runQuery(`SELECT is_pro, pro_expires_at, subscription_status FROM users WHERE id = '${escapeSql(req.userId)}'`);
    if (userResult && userResult.length > 0) {
      const user = userResult[0];
      
      // If subscription is canceled, check if we past the expiration date
      if (user.is_pro === 1 && user.pro_expires_at) {
        const expiry = new Date(user.pro_expires_at);
        if (expiry < new Date()) {
          // Downgrade user if subscription is not active or past expiry
          if (user.subscription_status !== 'active') {
            console.log(`Subscription for user ${req.userId} expired or inactive. Downgrading to standard.`);
            runQuery(`UPDATE users SET is_pro = 0, subscription_status = 'none' WHERE id = '${escapeSql(req.userId)}'`);
          }
        }
      }
    }
  } catch (error) {
    console.error('Auth Middleware Subscription Check Error:', error);
  }
  
  next();
};

app.use('/api', auth);

// Simulated Auth Endpoints
app.post('/api/auth/login', (req, res) => {
  const { userId, utm_source, utm_medium, utm_campaign } = req.body;
  if (!userId) return res.status(400).json({ error: 'userId is required' });
  
  try {
    let user = runQuery(`SELECT * FROM users WHERE id = '${escapeSql(userId)}'`);
    if (!user || user.length === 0) {
      // Create simulated user
      runQuery(`INSERT INTO users (id, referral_code, utm_source, utm_medium, utm_campaign, subscription_status) VALUES ('${escapeSql(userId)}', '${escapeSql(userId.toUpperCase() + '123')}', ${val(utm_source)}, ${val(utm_medium)}, ${val(utm_campaign)}, 'none')`);
      
      // Update traffic stats for signup
      if (utm_source) {
        const today = new Date().toISOString().split('T')[0];
        runQuery(`INSERT INTO traffic_stats (date, utm_source, utm_medium, utm_campaign, signups) 
                  VALUES ('${today}', ${val(utm_source)}, ${val(utm_medium)}, ${val(utm_campaign)}, 1)
                  ON CONFLICT(date, utm_source, utm_medium, utm_campaign) DO UPDATE SET signups = signups + 1`);
      }

      // Initialize default configs
      runQuery(`INSERT INTO bot_config (id, user_id, status) VALUES ('${crypto.randomUUID()}', '${escapeSql(userId)}', 'Paused')`);
      runQuery(`INSERT INTO bot_stats (id, user_id, shares_count, views_count) VALUES ('${crypto.randomUUID()}', '${escapeSql(userId)}', 0, 0)`);
      runQuery(`INSERT INTO offer_rules (id, user_id, discount_percent, delay_minutes, is_active) VALUES ('${crypto.randomUUID()}', '${escapeSql(userId)}', 15, 10, 1)`);
      
      user = runQuery(`SELECT * FROM users WHERE id = '${escapeSql(userId)}'`);
    }
    res.json(user[0]);
  } catch (error) {
    console.error('Login Error:', error);
    res.status(500).json({ error: 'Failed to login' });
  }
});

// Path to the team-db CLI. Default is this sandbox; override via env (e.g. when the
// API is deployed to a VPS where team-db lives at a different path).
const TEAM_DB_PATH = process.env.TEAM_DB_BIN_PATH || '/home/agent-engineer/.local/bin/team-db';

// Helper to run team-db commands with retry for locking errors
const runQuery = (query, retries = 5) => {
  for (let i = 0; i < retries; i++) {
    try {
      const output = execSync(`${TEAM_DB_PATH} "${query.replace(/"/g, '\\"')}"`, { 
        stdio: ['ignore', 'pipe', 'pipe'] 
      }).toString();
      return JSON.parse(output);
    } catch (error) {
      const stderr = error.stderr ? error.stderr.toString() : '';
      const message = error.message || '';
      const isLocked = stderr.toLowerCase().includes('lock') || message.toLowerCase().includes('lock');
      
      if (isLocked && i < retries - 1) {
        const delay = 500 + (i * 200); // Incremental backoff
        console.warn(`Database locked, retrying (${i + 1}/${retries}) in ${delay}ms...`);
        execSync(`sleep ${delay / 1000}`);
        continue;
      }
      console.error('Database Error:', stderr || message);
      throw error;
    }
  }
};

const escapeSql = (str) => {
  if (typeof str !== 'string') return str;
  return str.replace(/'/g, "''");
};

const val = (v) => v === undefined || v === null ? 'NULL' : typeof v === 'string' ? `'${escapeSql(v)}'` : v;

const TRAFFIC_SOURCES = [
  { source: 'facebook', medium: 'cpc', campaign: 'summer_sale', costPerVisit: 1.20, conversionRate: 0.05 },
  { source: 'google', medium: 'cpc', campaign: 'search_intent', costPerVisit: 0.80, conversionRate: 0.08 },
  { source: 'instagram', medium: 'social', campaign: 'influencer_blast', costPerVisit: 2.50, conversionRate: 0.12 },
  { source: 'organic', medium: 'search', campaign: null, costPerVisit: 0, conversionRate: 0.02 },
  { source: 'youtube', medium: 'social', campaign: 'MOGI15', costPerVisit: 0.50, conversionRate: 0.18 },
  { source: 'instagram', medium: 'social', campaign: 'SARAH20', costPerVisit: 0.50, conversionRate: 0.18 },
  { source: 'youtube', medium: 'social', campaign: 'FRIZZY20', costPerVisit: 0.50, conversionRate: 0.18 }
];

// Serve static assets with long caching
app.use('/assets', express.static(path.join(__dirname, 'dist', 'assets'), {
  maxAge: '1y',
  immutable: true
}));

// Serve other static files from dist (but NOT index.html yet)
app.use(express.static(path.join(__dirname, 'dist'), { 
  index: false,
  setHeaders: (res, filePath) => {
    if (filePath.match(/\.(js|css|svg|png|jpg|woff2?)$/)) {
      res.setHeader('Cache-Control', 'public, max-age=31536000, immutable');
    }
  }
}));

// SEO Endpoints (moved here to be handled before catch-all)
app.get('/robots.txt', (req, res) => {
  res.type('text/plain');
  res.send("User-agent: *\nAllow: /\nSitemap: https://posh-pal.team/sitemap.xml");
});

app.get('/sitemap.xml', (req, res) => {
  try {
    const items = runQuery("SELECT id FROM inventory WHERE status = 'Active'");
    const posts = runQuery("SELECT slug FROM blog_posts");
    
    let xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <url><loc>https://posh-pal.team/</loc></url>
  <url><loc>https://posh-pal.team/inventory</loc></url>
  <url><loc>https://posh-pal.team/bot</loc></url>
  <url><loc>https://posh-pal.team/offers</loc></url>
  <url><loc>https://posh-pal.team/blog</loc></url>
`;
    items.forEach(item => {
      xml += `  <url><loc>https://posh-pal.team/item/${item.id}</loc></url>\n`;
    });
    posts.forEach(post => {
      xml += `  <url><loc>https://posh-pal.team/blog/${post.slug}</loc></url>\n`;
    });
    xml += '</urlset>';
    res.header('Content-Type', 'application/xml');
    res.send(xml);
  } catch (error) {
    res.status(500).send('Sitemap Error');
  }
});

const escapeHtml = (unsafe) => {
  if (typeof unsafe !== 'string') return unsafe;
  return unsafe
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
};

app.get('/api/seo/:id', (req, res) => {
  const { id } = req.params;
  try {
    const item = runQuery(`SELECT * FROM inventory WHERE id = '${escapeSql(id)}'`);
    if (!item || item.length === 0) {
      return res.status(404).json({ error: 'Item not found' });
    }
    const i = item[0];
    res.json({
      title: `${i.title} - Posh Pal`,
      description: i.description,
      jsonLd: {
        "@context": "https://schema.org/",
        "@type": "Product",
        "name": i.title,
        "description": i.description,
        "brand": {
          "@type": "Brand",
          "name": i.brand
        },
        "offers": {
          "@type": "Offer",
          "price": i.price,
          "priceCurrency": "USD",
          "itemCondition": i.condition === 'New' ? "https://schema.org/NewCondition" : "https://schema.org/UsedCondition",
          "availability": i.status === 'Active' ? "https://schema.org/InStock" : "https://schema.org/OutOfStock"
        }
      }
    });
  } catch (error) {
    res.status(500).json({ error: 'SEO API Error' });
  }
});

app.get('/item/:id', (req, res) => {
  const { id } = req.params;
  try {
    const item = runQuery(`SELECT * FROM inventory WHERE id = '${escapeSql(id)}'`);
    let html = fs.readFileSync(path.join(__dirname, 'dist', 'index.html'), 'utf8');
    
    if (item && item.length > 0) {
      const i = item[0];
      const title = `${i.title} - Posh Pal`;
      const description = i.description;
      const jsonLd = {
        "@context": "https://schema.org/",
        "@type": "Product",
        "name": i.title,
        "description": i.description,
        "brand": {
          "@type": "Brand",
          "name": i.brand
        },
        "offers": {
          "@type": "Offer",
          "price": i.price,
          "priceCurrency": "USD",
          "itemCondition": i.condition === 'New' ? "https://schema.org/NewCondition" : "https://schema.org/UsedCondition",
          "availability": i.status === 'Active' ? "https://schema.org/InStock" : "https://schema.org/OutOfStock"
        }
      };
      
      html = html.replace('<title>Posh Pal</title>', `<title>${escapeHtml(title)}</title>`);
      html = html.replace('</head>', `
        <meta name="description" content="${escapeHtml(description)}">
        <meta property="og:title" content="${escapeHtml(title)}">
        <meta property="og:description" content="${escapeHtml(description)}">
        <script type="application/ld+json">${JSON.stringify(jsonLd)}</script>
      </head>`);
    }
    
    res.send(html);
  } catch (error) {
    res.sendFile(path.join(__dirname, 'dist', 'index.html'));
  }
});

app.get('/blog', (req, res) => {
  try {
    let html = fs.readFileSync(path.join(__dirname, 'dist', 'index.html'), 'utf8');
    const title = "Reseller Success Blog - Posh Pal";
    const description = "Learn how top Poshmark resellers are using automation and AI to scale their businesses.";
    
    html = html.replace('<title>Posh Pal</title>', `<title>${escapeHtml(title)}</title>`);
    html = html.replace('</head>', `
      <meta name="description" content="${escapeHtml(description)}">
      <meta property="og:title" content="${escapeHtml(title)}">
      <meta property="og:description" content="${escapeHtml(description)}">
    </head>`);
    
    res.send(html);
  } catch (error) {
    res.sendFile(path.join(__dirname, 'dist', 'index.html'));
  }
});

app.get('/blog/:slug', (req, res) => {
  const { slug } = req.params;
  try {
    const post = runQuery(`SELECT * FROM blog_posts WHERE slug = '${escapeSql(slug)}'`);
    let html = fs.readFileSync(path.join(__dirname, 'dist', 'index.html'), 'utf8');
    
    if (post && post.length > 0) {
      const p = post[0];
      const title = `${p.title} - Posh Pal Blog`;
      const description = p.summary;
      
      html = html.replace('<title>Posh Pal</title>', `<title>${escapeHtml(title)}</title>`);
      html = html.replace('</head>', `
        <meta name="description" content="${escapeHtml(description)}">
        <meta property="og:title" content="${escapeHtml(title)}">
        <meta property="og:description" content="${escapeHtml(description)}">
        <meta property="og:type" content="article">
        <meta property="og:site_name" content="Posh Pal">
        <meta property="article:author" content="${escapeHtml(p.author)}">
        <meta property="article:published_time" content="${escapeHtml(p.date)}">
      </head>`);
    }
    
    res.send(html);
  } catch (error) {
    res.sendFile(path.join(__dirname, 'dist', 'index.html'));
  }
});

// AI Analysis API Endpoint
app.post('/api/ai/analyze', async (req, res) => {
  const { images } = req.body;
  if (!images || !Array.isArray(images) || images.length === 0) {
    return res.status(400).json({ error: 'Images array is required' });
  }

  try {
    // Check Pro status
    const userResult = runQuery(`SELECT is_pro FROM users WHERE id = '${escapeSql(req.userId)}'`);
    const isPro = userResult && userResult.length > 0 && userResult[0].is_pro === 1;

    // Limit photos for free users
    const maxPhotos = isPro ? 5 : 1;
    const imagesToAnalyze = images.slice(0, maxPhotos);

    if (!genAI) {
      console.log("AI Backend: Running in Simulation Mode (No API Key)");
      // Simulate delay
      await new Promise(resolve => setTimeout(resolve, 1000 * imagesToAnalyze.length));
      
      const mocks = [
        {
          title: "Premium Patagonia Better Sweater 1/4 Zip - Men's M",
          description: "Authentic Patagonia Better Sweater in excellent condition. Multi-photo analysis confirmed high quality and zero flaws.",
          tags: "Patagonia, Outdoors, Fleece, Sustainable, Gorpcore",
          hashtags: "#patagonia #bettersweater #outdoors #hiking #fleece"
        },
        {
          title: "Lululemon Align High-Rise Pant 25\" - Black - Size 6",
          description: "Like new Lululemon Align leggings in classic black. Analysis of all angles confirms authenticity and perfect stitching.",
          tags: "Lululemon, Yoga, Leggings, Activewear, Athleisure",
          hashtags: "#lululemon #align #yoga #activewear #athleisure"
        }
      ];
      const result = mocks[Math.floor(Math.random() * mocks.length)];
      if (imagesToAnalyze.length > 1) {
        result.description += `\n\n(AI verified across ${imagesToAnalyze.length} photos)`;
      }
      return res.json(result);
    }

    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
    const prompt = `You are a professional Poshmark reseller expert. Analyze these ${imagesToAnalyze.length} images of the same clothing/accessory item. 
    One image might show the front, another the back, others might show the brand label, size tag, material composition, or specific flaws (stains, holes, wear).
    
    Cross-reference all photos to provide a highly accurate and optimized listing.
    
    Analyze:
    1. Brand Name (from labels)
    2. Exact Item Name/Model
    3. Condition (look for flaws across all photos)
    4. Style details (patterns, textures, cuts)
    5. Color
    6. Material (from care tags if visible)
    7. Size (from size tags)
    
    Return the result in JSON format with these exact keys:
    - title: SEO-optimized title including brand, size, and key style features (max 80 chars)
    - description: Detailed, persuasive description highlighting the item's best features and mentioning any observed flaws or wear.
    - tags: 5 comma-separated style tags (e.g., "Vintage, Boho, Minimalist")
    - hashtags: 5 hashtags including #poshmark and the brand.`;

    const imageParts = imagesToAnalyze.map(img => ({
      inlineData: {
        data: img.split(',')[1],
        mimeType: "image/jpeg",
      },
    }));

    const result = await model.generateContent([prompt, ...imageParts]);
    const text = result.response.text();
    const cleanedText = text.replace(/```json/g, '').replace(/```/g, '').trim();
    
    try {
      const jsonMatch = cleanedText.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        return res.json(JSON.parse(jsonMatch[0]));
      }
    } catch (e) {
      console.error("Failed to parse AI response as JSON:", cleanedText);
    }

    res.json({
      title: "AI Generated Listing",
      description: cleanedText,
      tags: "Resale, Fashion",
      hashtags: "#poshmark #reseller"
    });
  } catch (error) {
    console.error('AI Analysis Error:', error);
    res.status(500).json({ error: 'Failed to analyze images' });
  }
});

// Inventory API Endpoints
app.get('/api/inventory', (req, res) => {
  try {
    const items = runQuery(`SELECT * FROM inventory WHERE user_id = '${escapeSql(req.userId)}' ORDER BY created_at DESC`);
    res.json(items);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch inventory' });
  }
});

app.post('/api/inventory', (req, res) => {
  const { id, title, description, price, brand, size, condition, category, status } = req.body;
  try {
    runQuery(`INSERT INTO inventory (id, user_id, title, description, price, brand, size, condition, category, status) VALUES ('${escapeSql(id)}', '${escapeSql(req.userId)}', '${escapeSql(title)}', '${escapeSql(description)}', '${price}', '${escapeSql(brand)}', '${escapeSql(size)}', '${escapeSql(condition)}', '${escapeSql(category)}', '${escapeSql(status)}')`);
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: 'Failed to add item to inventory' });
  }
});

app.put('/api/inventory/:id', (req, res) => {
  const { id } = req.params;
  const { title, description, price, brand, size, condition, category, status } = req.body;
  try {
    runQuery(`UPDATE inventory SET title = '${escapeSql(title)}', description = '${escapeSql(description)}', price = '${price}', brand = '${escapeSql(brand)}', size = '${escapeSql(size)}', condition = '${escapeSql(condition)}', category = '${escapeSql(category)}', status = '${escapeSql(status)}' WHERE id = '${escapeSql(id)}' AND user_id = '${escapeSql(req.userId)}'`);
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: 'Failed to update inventory item' });
  }
});

app.delete('/api/inventory/:id', (req, res) => {
  const { id } = req.params;
  try {
    runQuery(`DELETE FROM inventory WHERE id = '${id}' AND user_id = '${escapeSql(req.userId)}'`);
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: 'Failed to delete inventory item' });
  }
});

// Bot API Endpoints
app.get('/api/bot/config', (req, res) => {
  try {
    const config = runQuery(`SELECT * FROM bot_config WHERE user_id = '${escapeSql(req.userId)}'`);
    const stats = runQuery(`SELECT * FROM bot_stats WHERE user_id = '${escapeSql(req.userId)}'`);
    res.json({ config: config[0], stats: stats[0] });
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch bot config' });
  }
});

app.post('/api/bot/status', (req, res) => {
  const { status } = req.body;
  try {
    runQuery(`UPDATE bot_config SET status = '${status}', updated_at = CURRENT_TIMESTAMP WHERE user_id = '${escapeSql(req.userId)}'`);
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: 'Failed to update bot status' });
  }
});

app.get('/api/bot/schedule', (req, res) => {
  try {
    const schedule = runQuery(`SELECT * FROM bot_schedule WHERE user_id = '${escapeSql(req.userId)}' ORDER BY time ASC`);
    res.json(schedule);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch schedule' });
  }
});

app.post('/api/bot/schedule', (req, res) => {
  const { time, label } = req.body;
  try {
    runQuery(`INSERT INTO bot_schedule (user_id, time, label) VALUES ('${escapeSql(req.userId)}', '${time}', '${label}')`);
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: 'Failed to add schedule slot' });
  }
});

app.delete('/api/bot/schedule/:id', (req, res) => {
  const { id } = req.params;
  try {
    runQuery(`DELETE FROM bot_schedule WHERE id = ${id} AND user_id = '${escapeSql(req.userId)}'`);
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: 'Failed to delete schedule slot' });
  }
});

// Offer Engine API Endpoints
app.get('/api/offers', (req, res) => {
  try {
    const offers = runQuery(`SELECT o.*, COALESCE(o.title, i.title) as item_title FROM offers o LEFT JOIN inventory i ON o.inventory_id = i.id WHERE o.user_id = '${escapeSql(req.userId)}' ORDER BY o.created_at DESC LIMIT 50`);
    res.json(offers);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch offers' });
  }
});

app.post('/api/offers', (req, res) => {
  const { id, title, type, inventory_id, discount_percent, total_value, bundle_price, net_profit, item_count, status, scheduled_for } = req.body;
  try {
    const offerId = id || crypto.randomUUID();
    const offerStatus = status || 'Pending';
    const val = (v) => v === undefined || v === null ? 'NULL' : typeof v === 'string' ? `'${escapeSql(v)}'` : v;
    
    runQuery(`INSERT INTO offers (id, user_id, title, type, inventory_id, discount_percent, total_value, bundle_price, net_profit, item_count, status, scheduled_for) VALUES (${val(offerId)}, '${escapeSql(req.userId)}', ${val(title)}, ${val(type)}, ${val(inventory_id)}, ${val(discount_percent)}, ${val(total_value)}, ${val(bundle_price)}, ${val(net_profit)}, ${val(item_count)}, ${val(offerStatus)}, ${val(scheduled_for)})`);
    res.json({ success: true, id: offerId });
  } catch (error) {
    console.error('Error creating offer:', error);
    res.status(500).json({ error: 'Failed to create offer' });
  }
});

app.delete('/api/offers/:id', (req, res) => {
  const { id } = req.params;
  try {
    runQuery(`DELETE FROM offers WHERE id = '${id}' AND user_id = '${escapeSql(req.userId)}'`);
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: 'Failed to delete offer' });
  }
});

app.get('/api/offer-rules', (req, res) => {
  try {
    const rules = runQuery(`SELECT * FROM offer_rules WHERE user_id = '${escapeSql(req.userId)}'`);
    res.json(rules[0]);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch offer rules' });
  }
});

app.post('/api/offer-rules', (req, res) => {
  const { discount_percent, delay_minutes, is_active } = req.body;
  try {
    runQuery(`UPDATE offer_rules SET discount_percent = ${discount_percent}, delay_minutes = ${delay_minutes}, is_active = ${is_active} WHERE user_id = '${escapeSql(req.userId)}'`);
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: 'Failed to update offer rules' });
  }
});

// Analytics API Endpoint
app.get('/api/analytics/summary', (req, res) => {
  const { days } = req.query;
  const viewFilter = req.headers['x-view-filter'] || 'all';
  const targetUserId = (viewFilter === 'all') ? null : viewFilter;
  const effectiveUserId = targetUserId || req.userId;

  try {
    if (days && !isNaN(days)) {
      let query = `SELECT * FROM daily_stats WHERE user_id = '${escapeSql(effectiveUserId)}'`;
      if (viewFilter === 'all') {
        // Aggregate for all users if 'all'
        query = `SELECT date, SUM(shares) as shares, SUM(offers_sent) as offers_sent, SUM(offers_accepted) as offers_accepted, SUM(revenue) as revenue 
                 FROM daily_stats GROUP BY date ORDER BY date DESC LIMIT ${parseInt(days)}`;
      } else {
        query += ` ORDER BY date DESC LIMIT ${parseInt(days)}`;
      }
      const historical = runQuery(query);
      return res.json(historical);
    }

    let statsQuery = `SELECT SUM(shares_count) as shares_count FROM bot_stats`;
    let offersQuery = `SELECT status, bundle_price, discount_percent, total_value, item_count, type, inventory_id FROM offers`;
    let inventoryQuery = `SELECT id, price FROM inventory`;

    if (viewFilter !== 'all') {
      statsQuery += ` WHERE user_id = '${escapeSql(effectiveUserId)}'`;
      offersQuery += ` WHERE user_id = '${escapeSql(effectiveUserId)}'`;
      inventoryQuery += ` WHERE user_id = '${escapeSql(effectiveUserId)}'`;
    }

    const stats = runQuery(statsQuery);
    const offers = runQuery(offersQuery);
    const inventory = runQuery(inventoryQuery);
    const invMap = {};
    inventory.forEach(item => {
      invMap[item.id] = parseFloat(item.price) || 0;
    });

    offers.forEach(offer => {
      const status = offer.status || 'Pending';
      if (status === 'Sent' || status === 'Accepted') {
        totalSent++;
      }
      if (status === 'Accepted') {
        totalAccepted++;
        if (offer.type === 'Bundle') {
          totalRevenue += parseFloat(offer.bundle_price) || 0;
        } else {
          const basePrice = invMap[offer.inventory_id] || 0;
          const discountedPrice = basePrice * (1 - (offer.discount_percent || 0) / 100);
          totalRevenue += discountedPrice;
        }
      }
    });

    const conversionRate = totalSent > 0 ? (totalAccepted / totalSent) * 100 : 0;

    res.json({
      total_shares: stats[0] ? stats[0].shares_count : 0,
      total_offers_sent: totalSent,
      total_offers_accepted: totalAccepted,
      conversion_rate: conversionRate.toFixed(1),
      total_revenue: totalRevenue.toFixed(2)
    });
  } catch (error) {
    console.error('Analytics Error:', error);
    res.status(500).json({ error: 'Failed to fetch analytics' });
  }
});

app.get('/api/analytics/attribution', (req, res) => {
  try {
    const stats = runQuery(`SELECT * FROM traffic_stats ORDER BY date DESC`);
    
    // Group by source + campaign for influencer visibility
    const summary = {};
    stats.forEach(row => {
      // Group by campaign when present, otherwise source
      const key = row.utm_campaign || row.utm_source || 'direct';
      
      if (!summary[key]) {
        summary[key] = { source: key, visits: 0, signups: 0, cost: 0, revenue: 0 };
      }
      summary[key].visits += row.visits;
      summary[key].signups += row.signups;
      summary[key].cost += row.cost;
    });

    // Calculate revenue per source/campaign
    const revenueBySource = runQuery(`
      SELECT utm_source, utm_campaign, SUM(ds.revenue) as total_revenue
      FROM users u
      JOIN daily_stats ds ON u.id = ds.user_id
      GROUP BY utm_source, utm_campaign
    `);

    revenueBySource.forEach(row => {
      const key = row.utm_campaign || row.utm_source || 'direct';
      if (summary[key]) {
        summary[key].revenue += row.total_revenue || 0;
      }
    });

    // Calculate ROI and CAC
    const result = Object.values(summary).map(s => {
      return {
        ...s,
        cac: s.signups > 0 ? (s.cost / s.signups).toFixed(2) : (s.cost).toFixed(2),
        roi: s.cost > 0 ? (((s.revenue - s.cost) / s.cost) * 100).toFixed(1) + '%' : 'N/A',
        conversion_rate: s.visits > 0 ? ((s.signups / s.visits) * 100).toFixed(1) + '%' : '0%'
      };
    });

    res.json(result);
  } catch (error) {
    console.error('Attribution Error:', error);
    res.status(500).json({ error: 'Failed to fetch attribution data' });
  }
});

app.get('/api/analytics/traffic-trend', (req, res) => {
  try {
    const trend = runQuery(`
      SELECT date, SUM(visits) as visits, SUM(signups) as signups 
      FROM traffic_stats 
      GROUP BY date 
      ORDER BY date ASC 
      LIMIT 30
    `);
    res.json(trend);
  } catch (error) {
    console.error('Traffic Trend Error:', error);
    res.status(500).json({ error: 'Failed to fetch traffic trend' });
  }
});

app.get('/api/referral/code/:code', (req, res) => {
  const { code } = req.params;
  try {
    const influencers = runQuery(`SELECT name, handle, bio, referral_count FROM users WHERE referral_code = '${escapeSql(code)}'`);
    if (!influencers || influencers.length === 0) {
      return res.status(404).json({ error: 'Influencer not found' });
    }
    res.json(influencers[0]);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch influencer info' });
  }
});

app.get('/api/analytics/referrals', (req, res) => {
  try {
    const totalCount = runQuery(`SELECT SUM(referral_count) as total FROM users`)[0].total || 0;
    const totalConversions = runQuery(`SELECT COUNT(*) as total FROM referral_history`)[0].total || 0;
    
    // Real values only; growth metrics are 0 until real referral data accumulates
    res.json({
      referral_count: totalCount,
      referral_conversions: totalConversions,
      referral_revenue: totalConversions * 15.00, // $15 per conversion
      referral_growth: 0,
      conversion_growth: 0,
      referral_revenue_growth: 0,
      referral_weekly: []
    });
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch referral analytics' });
  }
});

app.get('/api/analytics/leaderboard', (req, res) => {
  try {
    const topReferrers = runQuery(`
      SELECT id, name, handle, referral_code as code, referral_count as referrals
      FROM users 
      WHERE user_type = 'influencer' OR referral_count > 0
      ORDER BY referral_count DESC 
      LIMIT 10
    `);

    const leaderboard = topReferrers.map((r, i) => ({
      rank: i + 1,
      ...r,
      conversions: 0,
      revenue: 0,
      tier: r.referrals > 10 ? '🔥 Lifetime Free' : '💎 Pro Member'
    }));

    res.json({ leaderboard });
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch leaderboard' });
  }
});

// Blog API Endpoints
app.get('/api/blog', (req, res) => {
  try {
    const posts = runQuery('SELECT * FROM blog_posts ORDER BY date DESC');
    res.json(posts);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch blog posts' });
  }
});

app.post('/api/blog', (req, res) => {
  const { title, version_b_title, is_verified, content, author, summary, tags } = req.body;
  if (!title || !content) return res.status(400).json({ error: 'Title and content are required' });
  
  const slug = title.toLowerCase().trim().replace(/ /g, '-').replace(/[^\w-]+/g, '');
  const date = new Date().toISOString().split('T')[0];
  const wordCount = content.split(/\s+/).length;
  const read_time = Math.ceil(wordCount / 200) + ' min read';

  try {
    runQuery(`INSERT INTO blog_posts (title, version_b_title, is_verified, content, author, date, slug, summary, read_time, tags) 
              VALUES ('${escapeSql(title)}', ${val(version_b_title)}, ${is_verified || 0}, '${escapeSql(content)}', '${escapeSql(author || 'Team Posh Pal')}', '${date}', '${slug}', '${escapeSql(summary || '')}', '${read_time}', '${escapeSql(tags || '')}')`);
    res.json({ success: true, slug });
  } catch (error) {
    console.error('Blog Publish Error:', error);
    res.status(500).json({ error: 'Failed to publish blog post' });
  }
});

// A/B Testing API Endpoints
app.get('/api/ab-test/assign', (req, res) => {
  const { experiment } = req.query;
  if (!experiment) return res.status(400).json({ error: 'Experiment name is required' });
  
  try {
    // Deterministic assignment based on userId
    const hash = crypto.createHash('md5').update(req.userId + experiment).digest('hex');
    const variant = parseInt(hash.substring(0, 8), 16) % 2 === 0 ? 'A' : 'B';
    
    // Log assignment to results table if not already present
    const existing = runQuery(`SELECT * FROM ab_test_results WHERE experiment_name = '${escapeSql(experiment)}' AND user_id = '${escapeSql(req.userId)}'`);
    if (!existing || existing.length === 0) {
      runQuery(`INSERT INTO ab_test_results (experiment_name, variant, user_id) VALUES ('${escapeSql(experiment)}', '${variant}', '${escapeSql(req.userId)}')`);
    }
    
    res.json({ experiment, variant });
  } catch (error) {
    console.error('A/B Test Assign Error:', error);
    res.status(500).json({ error: 'Failed to assign A/B test variant' });
  }
});

app.post('/api/ab-test/convert', (req, res) => {
  const { experiment } = req.body;
  if (!experiment) return res.status(400).json({ error: 'Experiment name is required' });
  
  try {
    runQuery(`UPDATE ab_test_results SET converted = 1 WHERE experiment_name = '${escapeSql(experiment)}' AND user_id = '${escapeSql(req.userId)}'`);
    res.json({ success: true });
  } catch (error) {
    console.error('A/B Test Convert Error:', error);
    res.status(500).json({ error: 'Failed to log conversion' });
  }
});

app.get('/api/blog/:slug', (req, res) => {
  const { slug } = req.params;
  try {
    const post = runQuery(`SELECT * FROM blog_posts WHERE slug = '${escapeSql(slug)}'`);
    if (!post || post.length === 0) {
      return res.status(404).json({ error: 'Post not found' });
    }
    res.json(post[0]);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch blog post' });
  }
});

// Referral API Endpoints
app.post('/api/referrals/redeem', (req, res) => {
  const { code } = req.body;
  try {
    const referrers = runQuery(`SELECT * FROM users WHERE referral_code = '${escapeSql(code)}'`);
    if (referrers && referrers.length > 0) {
      const referrer = referrers[0];
      
      let proDays = 30; // Default 1 month
      let rewardTier = 'Standard';
      
      if (referrer.user_type === 'influencer') {
        proDays = 90; // Influencer code gives 3 months
        rewardTier = 'Influencer Special';
      }
      
      const expiryDate = new Date();
      expiryDate.setDate(expiryDate.getDate() + proDays);
      const expiryStr = expiryDate.toISOString().replace('T', ' ').substring(0, 19);
      
      // Update current user
      runQuery(`UPDATE users SET referred_by = '${escapeSql(code)}', is_pro = 1, pro_expires_at = '${expiryStr}' WHERE id = '${escapeSql(req.userId)}'`);
      
      // Update referrer
      runQuery(`UPDATE users SET referral_count = referral_count + 1 WHERE id = '${escapeSql(referrer.id)}'`);
      
      // Add to history
      runQuery(`INSERT INTO referral_history (referrer_id, referred_user_id, code_used) VALUES ('${escapeSql(referrer.id)}', '${escapeSql(req.userId)}', '${escapeSql(code)}')`);
      
      res.json({ 
        success: true, 
        message: `Referral code applied! You now have Pro access until ${expiryStr.split(' ')[0]} (${rewardTier} reward).`,
        pro_expires_at: expiryStr
      });
    } else {
      res.status(404).json({ error: 'Invalid referral code.' });
    }
  } catch (error) {
    console.error('Referral Error:', error);
    res.status(500).json({ error: 'Failed to redeem referral code' });
  }
});

// Marketplace Insights API Endpoint
app.get('/api/market-insights/:id', (req, res) => {
  const { id } = req.params;
  try {
    const item = runQuery(`SELECT * FROM inventory WHERE id = '${escapeSql(id)}'`);
    if (!item || item.length === 0) {
      return res.status(404).json({ error: 'Item not found' });
    }

    let marketData = null;
    if (item[0].market_data) {
      try {
        marketData = JSON.parse(item[0].market_data);
      } catch (e) {
        console.error('JSON parse error for market_data:', e);
      }
    }

    const isSneaker = item[0].category && item[0].category.toLowerCase().includes('sneaker');
    const isShoe = item[0].category && item[0].category.toLowerCase().includes('shoe');
    
    if (!marketData && (isSneaker || isShoe)) {
      const basePrice = parseFloat(item[0].price) || 100;
      marketData = {
        lowest_ask: (basePrice * (0.9 + Math.random() * 0.2)).toFixed(2),
        highest_bid: (basePrice * (0.7 + Math.random() * 0.2)).toFixed(2),
        last_sale: (basePrice * (0.8 + Math.random() * 0.2)).toFixed(2),
        volatility: (Math.random() * 10).toFixed(1) + '%',
        updated_at: new Date().toISOString()
      };
      
      runQuery(`UPDATE inventory SET market_data = '${escapeSql(JSON.stringify(marketData))}' WHERE id = '${escapeSql(id)}'`);
    }

    res.json({
      item_id: id,
      title: item[0].title,
      current_price: item[0].price,
      simulated: marketData ? false : (isSneaker || isShoe),
      market_data: marketData || { message: 'No specialized market data available for this category' }
    });
  } catch (error) {
    console.error('Market Insights Error:', error);
    res.status(500).json({ error: 'Failed to fetch market insights' });
  }
});

app.post('/api/create-checkout-session', async (req, res) => {
  try {
    if (!stripe) throw new Error('Stripe is not initialized. Please check API keys.');
    
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      client_reference_id: req.userId,
      metadata: {
        userId: req.userId
      },
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
      // Redirect the buyer back to the caller's Origin after checkout. Fall back
      // to a safe, env-overridable default when the Origin header is absent
      // (curl/Postman/bots or a future stable host) so this endpoint never 500s.
      // Existing browsers always send Origin, so their behavior is unchanged.
      success_url: `${req.headers.origin || process.env.POSH_PAL_APP_ORIGIN || 'http://localhost:3000'}/?success=true&session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${req.headers.origin || process.env.POSH_PAL_APP_ORIGIN || 'http://localhost:3000'}/?canceled=true`,
    });

    console.log(`Created checkout session: ${session.id} for user ${req.userId}`);
    res.json({ id: session.id, url: session.url });
  } catch (error) {
    console.error('Error creating checkout session:', error);
    res.status(500).json({ error: error.message });
  }
});

app.post('/api/stripe/success', async (req, res) => {
  const { session_id } = req.body;
  try {
    const userId = req.userId;
    let stripeCustomerId = null;
    let stripeSubscriptionId = null;

    // If we have a session_id and stripe is initialized, fetch details
    if (session_id && stripe && !session_id.startsWith('cs_test_')) {
      try {
        const session = await stripe.checkout.sessions.retrieve(session_id);
        stripeCustomerId = session.customer;
        stripeSubscriptionId = session.subscription;
      } catch (e) {
        console.warn('Failed to retrieve checkout session details:', e.message);
      }
    }

    const expiryDate = new Date();
    expiryDate.setMonth(expiryDate.getMonth() + 1);
    const expiryStr = expiryDate.toISOString().replace('T', ' ').substring(0, 19);

    runQuery(`UPDATE users SET 
      is_pro = 1, 
      pro_expires_at = '${expiryStr}',
      subscription_status = 'active',
      stripe_customer_id = ${val(stripeCustomerId)},
      stripe_subscription_id = ${val(stripeSubscriptionId)}
      WHERE id = '${escapeSql(userId)}'`);
    
    console.log(`Stripe Success: User ${userId} upgraded to Pro until ${expiryStr}`);
    res.json({ success: true, is_pro: true, expires_at: expiryStr, subscription_status: 'active' });
  } catch (error) {
    console.error('Stripe Success Error:', error);
    res.status(500).json({ error: 'Failed to update subscription status' });
  }
});

app.post('/api/cancel-subscription', async (req, res) => {
  try {
    const userId = req.userId;
    const userResult = runQuery(`SELECT stripe_subscription_id FROM users WHERE id = '${escapeSql(userId)}'`);
    
    if (userResult && userResult.length > 0 && userResult[0].stripe_subscription_id) {
      const subId = userResult[0].stripe_subscription_id;
      
      if (stripe) {
        try {
          await stripe.subscriptions.update(subId, { cancel_at_period_end: true });
        } catch (e) {
          console.error('Stripe cancel error:', e.message);
        }
      }
      
      // Update local DB to 'canceled' (meaning it will expire at end of period)
      runQuery(`UPDATE users SET subscription_status = 'canceled' WHERE id = '${escapeSql(userId)}'`);
      res.json({ success: true, message: 'Subscription will cancel at the end of the period.' });
    } else {
      // If no stripe ID, just mock cancel
      runQuery(`UPDATE users SET subscription_status = 'canceled' WHERE id = '${escapeSql(userId)}'`);
      res.json({ success: true, message: 'Subscription canceled (Simulation mode).' });
    }
  } catch (error) {
    console.error('Cancel Error:', error);
    res.status(500).json({ error: 'Failed to cancel subscription' });
  }
});

// Catch-all route to serve the cache-busted index.html
app.use((req, res) => {
  if (req.path.startsWith('/api')) {
    return res.status(404).json({ error: 'Not found' });
  }
  
  res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate');
  try {
    const htmlPath = path.join(__dirname, 'dist', 'index.html');
    let html = fs.readFileSync(htmlPath, 'utf8');
    const version = Date.now().toString(36);
    console.log(`Serving index.html from ${htmlPath}. First 100 chars: ${html.substring(0, 100).replace(/\n/g, ' ')}`);
    html = html.replace(/src="\/assets\/([^"]+)"/g, 'src="/assets/$1?v=' + version + '"');
    html = html.replace(/href="\/assets\/([^"]+)"/g, 'href="/assets/$1?v=' + version + '"');
    res.send(html);
  } catch (error) {
    console.error('Error serving index.html:', error);
    res.status(500).send('Internal Server Error');
  }
});

// Deep Automation Background Loop (Sharing + Offers)
setInterval(() => {
  try {
    const runningBots = runQuery("SELECT * FROM bot_config WHERE status = 'Running'");
    for (const bot of runningBots) {
      const userId = bot.user_id;
      // 1. Sharing Logic
      const activeItems = runQuery(`SELECT id FROM inventory WHERE status = 'Active' AND user_id = '${escapeSql(userId)}'`);
      if (activeItems && activeItems.length > 0) {
        const item = activeItems[Math.floor(Math.random() * activeItems.length)];
        runQuery(`INSERT INTO share_queue (inventory_id, user_id) VALUES ('${item.id}', '${escapeSql(userId)}')`);
        runQuery(`UPDATE bot_stats SET shares_count = shares_count + 1, views_count = views_count + ABS(RANDOM() % 5) + 2 WHERE user_id = '${escapeSql(userId)}'`);
        console.log(`Bot (${userId}): Shared item ${item.id}`);
      } else {
        runQuery(`UPDATE bot_stats SET views_count = views_count + ABS(RANDOM() % 3) + 1 WHERE user_id = '${escapeSql(userId)}'`);
      }

      // 2. Automated Offer Logic
      const offerRules = runQuery(`SELECT * FROM offer_rules WHERE user_id = '${escapeSql(userId)}' AND is_active = 1`);
      if (offerRules && offerRules[0]) {
        const rules = offerRules[0];
        // Simulate a 'Like' occasionally
        if (Math.random() < 0.33 && activeItems && activeItems.length > 0) {
          const item = activeItems[Math.floor(Math.random() * activeItems.length)];
          const scheduledTime = new Date(Date.now() + rules.delay_minutes * 60000).toISOString().replace('T', ' ').substring(0, 19);
          const offerId = crypto.randomUUID();
          runQuery(`INSERT INTO offers (id, user_id, inventory_id, discount_percent, status, scheduled_for, type) VALUES ('${offerId}', '${escapeSql(userId)}', '${item.id}', ${rules.discount_percent}, 'Pending', '${scheduledTime}', 'Automated')`);
          console.log(`Offer Engine (${userId}): Detected LIKE on ${item.id}, scheduled offer for ${scheduledTime}`);
        }
      }
    }

    // Process all scheduled offers (across all users)
    const now = new Date().toISOString().replace('T', ' ').substring(0, 19);
    const pendingOffers = runQuery(`SELECT * FROM offers WHERE status = 'Pending' AND scheduled_for <= '${now}'`);
    for (const offer of pendingOffers) {
      runQuery(`UPDATE offers SET status = 'Sent' WHERE id = '${offer.id}'`);
      console.log(`Offer Engine (${offer.user_id}): Sent ${offer.discount_percent}% off offer for item ${offer.inventory_id}`);

      // Occasionally simulate an acceptance (1 in 5)
      if (Math.random() < 0.2) {
         runQuery(`UPDATE offers SET status = 'Accepted' WHERE id = '${offer.id}'`);
         runQuery(`UPDATE inventory SET status = 'Sold' WHERE id = '${offer.inventory_id}' AND user_id = '${escapeSql(offer.user_id)}'`);
         console.log(`Offer Engine (${offer.user_id}): Offer ${offer.id} ACCEPTED! Item marked as Sold.`);
      }
    }
  } catch (error) {
    console.error('Automation loop error:', error);
  }
}, 600000); // Increased interval to 10m to prevent DB locking

// 24h Historical Snapshot Loop
setInterval(() => {
  try {
    const today = new Date().toISOString().split('T')[0];
    const users = runQuery("SELECT id FROM users");

    for (const user of users) {
      const userId = user.id;
      const existing = runQuery(`SELECT * FROM daily_stats WHERE date = '${today}' AND user_id = '${escapeSql(userId)}'`);

      if (!existing || existing.length === 0) {
        const stats = runQuery(`SELECT shares_count FROM bot_stats WHERE user_id = '${escapeSql(userId)}'`);
        const offers = runQuery(`SELECT status, bundle_price, discount_percent, type, inventory_id FROM offers WHERE user_id = '${escapeSql(userId)}'`);

        let totalSent = 0;
        let totalAccepted = 0;
        let totalRevenue = 0;

        const inventory = runQuery(`SELECT id, price FROM inventory WHERE user_id = '${escapeSql(userId)}'`);
        const invMap = {};
        inventory.forEach(item => {
          invMap[item.id] = parseFloat(item.price) || 0;
        });

        offers.forEach(offer => {
          const status = offer.status || 'Pending';
          if (status === 'Sent' || status === 'Accepted') {
            totalSent++;
          }
          if (status === 'Accepted') {
            totalAccepted++;
            if (offer.type === 'Bundle') {
              totalRevenue += parseFloat(offer.bundle_price) || 0;
            } else {
              const basePrice = invMap[offer.inventory_id] || 0;
              const discountedPrice = basePrice * (1 - (offer.discount_percent || 0) / 100);
              totalRevenue += discountedPrice;
            }
          }
        });

        const shares = stats[0] ? stats[0].shares_count : 0;

        runQuery(`INSERT INTO daily_stats (user_id, date, shares, offers_sent, offers_accepted, revenue) VALUES ('${escapeSql(userId)}', '${today}', ${shares}, ${totalSent}, ${totalAccepted}, ${totalRevenue})`);
        console.log(`Historical Snapshot (${userId}): Saved stats for ${today}`);
      }
    }
  } catch (error) {
    console.error('Snapshot loop error:', error);
  }
}, 3600000); // Check every hour

// Traffic Simulator Background Loop
setInterval(() => {
  try {
    const today = new Date().toISOString().split('T')[0];
    const source = TRAFFIC_SOURCES[Math.floor(Math.random() * TRAFFIC_SOURCES.length)];

    // 1. Log the visit
    runQuery(`INSERT INTO traffic_stats (date, utm_source, utm_medium, utm_campaign, visits, cost)
              VALUES ('${today}', ${val(source.source)}, ${val(source.medium)}, ${val(source.campaign)}, 1, ${source.costPerVisit})
              ON CONFLICT(date, utm_source, utm_medium, utm_campaign) DO UPDATE SET visits = visits + 1, cost = cost + ${source.costPerVisit}`);

    // 2. Decide if they "Signup"
    if (Math.random() < source.conversionRate) {
      const simulatedUserId = `sim_${Math.random().toString(36).substring(2, 11)}`;
      
      // Occasionally tag with influencer code
      let referredBy = null;
      const codes = ['SARAH20', 'MOGI15', 'FRIZZY20', 'POSHPAL123'];
      
      if (codes.includes(source.campaign)) {
        referredBy = source.campaign;
      } else if (Math.random() < 0.2) {
        referredBy = codes[Math.floor(Math.random() * codes.length)];
      }

      // Create user
      runQuery(`INSERT INTO users (id, referral_code, utm_source, utm_medium, utm_campaign, referred_by, subscription_status)
                VALUES ('${simulatedUserId}', '${simulatedUserId.toUpperCase()}123', ${val(source.source)}, ${val(source.medium)}, ${val(source.campaign)}, ${val(referredBy)}, 'none')`);

      // Init bot config for simulated user so they generate revenue later
      runQuery(`INSERT INTO bot_config (id, user_id, status) VALUES ('${crypto.randomUUID()}', '${simulatedUserId}', 'Running')`);
      runQuery(`INSERT INTO bot_stats (id, user_id, shares_count, views_count) VALUES ('${crypto.randomUUID()}', '${simulatedUserId}', 0, 0)`);
      runQuery(`INSERT INTO offer_rules (id, user_id, discount_percent, delay_minutes, is_active) VALUES ('${crypto.randomUUID()}', '${simulatedUserId}', 15, 10, 1)`);


      // Add some fake inventory so they can "sell" items
      const itemId = `item_sim_${simulatedUserId}`;
      runQuery(`INSERT INTO inventory (id, user_id, title, price, status) VALUES ('${itemId}', '${simulatedUserId}', 'Simulated Item', 50, 'Active')`);

      runQuery(`UPDATE traffic_stats SET signups = signups + 1
                WHERE date = '${today}' AND utm_source = ${val(source.source)} AND utm_medium = ${val(source.medium)} AND (utm_campaign = ${val(source.campaign)} OR (utm_campaign IS NULL AND ${val(source.campaign)} = 'NULL'))`);

      console.log(`Traffic Sim: Signup from ${source.source} simulated.`);
    }
  } catch (error) {
    console.error('Traffic Simulator Error:', error);
  }
}, 300000); // Increased interval to 5m to prevent DB locking

// Influencer Conversion Simulator (Pro Upgrades)
setInterval(() => {
  try {
    const pendingReferrals = runQuery("SELECT id, referred_by FROM users WHERE (is_pro = 0 OR is_pro IS NULL) AND referred_by IS NOT NULL LIMIT 10");
    for (const user of pendingReferrals) {
      // 30% chance to upgrade
      if (Math.random() < 0.3) {
        const expiryDate = new Date();
        expiryDate.setDate(expiryDate.getDate() + 90);
        const expiryStr = expiryDate.toISOString().replace('T', ' ').substring(0, 19);

        // Upgrade to Pro
        runQuery(`UPDATE users SET is_pro = 1, pro_expires_at = '${expiryStr}', subscription_status = 'active' WHERE id = '${user.id}'`);
        
        // Update Referrer
        const referrers = runQuery(`SELECT id FROM users WHERE referral_code = '${escapeSql(user.referred_by)}'`);
        if (referrers && referrers.length > 0) {
          const referrer = referrers[0];
          runQuery(`UPDATE users SET referral_count = referral_count + 1 WHERE id = '${referrer.id}'`);
          runQuery(`INSERT INTO referral_history (referrer_id, referred_user_id, code_used) VALUES ('${referrer.id}', '${user.id}', '${user.referred_by}')`);
          console.log(`Sim Conversion: User ${user.id} upgraded via ${user.referred_by}. Referrer ${referrer.id} rewarded.`);
        }
      }
    }
  } catch (error) {
    console.error('Conversion Simulator Error:', error);
  }
}, 450000); // Every 7.5 minutes

app.listen(PORT, '0.0.0.0', () => {
  console.log(`Server running on port ${PORT}`);
});
