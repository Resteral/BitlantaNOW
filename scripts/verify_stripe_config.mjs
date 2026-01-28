
import Stripe from 'stripe';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const envPath = path.resolve(__dirname, '../.env.local');

// Quick and dirty env loader
const envContent = fs.readFileSync(envPath, 'utf-8');
const env = {};
envContent.split('\n').forEach(line => {
    const match = line.match(/^([^=]+)=(.*)$/);
    if (match) {
        env[match[1]] = match[2].trim();
    }
});

const key = env.STRIPE_SECRET_KEY;

if (!key) {
    console.error("No STRIPE_SECRET_KEY found in .env.local");
    process.exit(1);
}

const stripe = new Stripe(key, {
    apiVersion: '2025-12-15.clover',
    typescript: true,
});

async function runTest() {
    try {
        console.log("Attempting to create a test checkout session...");
        const session = await stripe.checkout.sessions.create({
            payment_method_types: ['card'],
            line_items: [
                {
                    price_data: {
                        currency: 'usd',
                        product_data: {
                            name: 'Test Product',
                        },
                        unit_amount: 2000,
                        recurring: {
                            interval: 'month',
                        },
                    },
                    quantity: 1,
                },
            ],
            mode: 'subscription',
            success_url: `http://localhost:3000?success=true`,
            cancel_url: `http://localhost:3000?canceled=true`,
        });

        console.log("✅ Checkout Session Created Successfully!");
        console.log("Session URL:", session.url);

    } catch (e) {
        console.error("❌ Checkout Session Creation Failed:", e.message);
    }
}

runTest();
