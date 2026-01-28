import { Stripe } from 'stripe';
import { createClient } from '@/lib/supabase/server';
import { NextResponse } from 'next/server';

function logWithError(msg: string, error?: any) {
    if (error) {
        console.error(`[Checkout] ${msg}`, error);
    } else {
        console.log(`[Checkout] ${msg}`);
    }
}

// Initialize Stripe lazily to avoid build-time errors if env vars are missing
const getStripe = () => {
    if (!process.env.STRIPE_SECRET_KEY) {
        throw new Error("STRIPE_SECRET_KEY is missing. Please set it in Vercel Environment Variables.");
    }
    return new Stripe(process.env.STRIPE_SECRET_KEY, {
        apiVersion: '2025-12-15.clover',
        typescript: true,
    });
};

export async function GET(req: Request) {
    logWithError('[Checkout] GET request received - Debugging check');
    return NextResponse.json({ status: 'API is working', timestamp: new Date().toISOString() });
}

export async function POST(req: Request) {
    try {
        const supabase = await createClient();
        const { data: { user } } = await supabase.auth.getUser();

        const { tier, amount, name, currency = 'usd' } = await req.json();

        logWithError(`[Checkout] User: ${user?.id}, Tier: ${tier}, Amount: ${amount}`);

        if (!user) {
            logWithError('[Checkout] Unauthorized: No user found');
            return new NextResponse(JSON.stringify({ error: 'Unauthorized: Please log in' }), {
                status: 401,
                headers: { 'Content-Type': 'application/json' }
            });
        }

        if (!amount || !name) {
            return new NextResponse(JSON.stringify({
                error: `Missing amount or name. Received: amount=${amount}, name=${name}, tier=${tier}`
            }), {
                status: 400,
                headers: { 'Content-Type': 'application/json' }
            });
        }

        const origin = req.headers.get('origin') || 'http://localhost:3000';

        const stripe = getStripe();

        const session = await stripe.checkout.sessions.create({
            payment_method_types: ['card'],
            line_items: [
                {
                    price_data: {
                        currency: currency.toLowerCase(),
                        product_data: {
                            name: name,
                        },
                        unit_amount: Math.round(amount * 100), // Convert to cents
                        recurring: {
                            interval: 'month',
                        },
                    },
                    quantity: 1,
                },
            ],
            mode: 'subscription',
            success_url: `${origin}?success=true&tier=${tier}`,
            cancel_url: `${origin}?canceled=true`,
            metadata: {
                userId: user.id,
                tier: tier,
            },
            client_reference_id: user.id,
        });

        return NextResponse.json({ url: session.url });
    } catch (error: any) {
        logWithError('Stripe Checkout Error:', error);
        return new NextResponse(
            JSON.stringify({
                error: error.message || 'Internal Server Error',
                details: error.type || 'Unknown Type'
            }),
            {
                status: 500,
                headers: {
                    'Content-Type': 'application/json'
                }
            }
        );
    }
}
