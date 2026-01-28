import { headers } from 'next/headers';
import { NextResponse } from 'next/server';
import { Stripe } from 'stripe';
import { createServerClient } from "@supabase/ssr"

// NOTE: This route requires STRIPE_WEBHOOK_SECRET and SUPABASE_SERVICE_ROLE_KEY to be set in .env.local

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
    apiVersion: '2025-12-15.clover',
    typescript: true,
});

const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;

export async function POST(req: Request) {
    const body = await req.text();
    const signature = req.headers.get('stripe-signature');

    let event: Stripe.Event;

    try {
        if (webhookSecret && signature) {
            event = stripe.webhooks.constructEvent(body, signature, webhookSecret);
        } else {
            // Fallback for development/testing without signature verification (INSECURE)
            // Only use this if you trust the source (e.g. manual trigger)
            event = JSON.parse(body); // Simple parse if no secret
        }
    } catch (err: any) {
        console.error(`Webhook signature verification failed.`, err.message);
        return new NextResponse(`Webhook Error: ${err.message}`, { status: 400 });
    }

    if (event.type === 'checkout.session.completed') {
        const session = event.data.object as Stripe.Checkout.Session;

        // Fulfill the purchase...
        const userId = session.metadata?.userId;
        const tier = session.metadata?.tier; // e.g., 'SILVER'

        if (userId && tier) {
            // UPDATE SUPABASE
            const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
            const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;

            if (supabaseUrl && supabaseServiceRoleKey) {
                const supabase = createServerClient(supabaseUrl, supabaseServiceRoleKey, {
                    cookies: {
                        getAll() { return [] },
                        setAll() { }
                    }
                });

                // Assuming 'tier' matches enum in database ('FREE', 'BRONZE', 'SILVER', 'GOLD')
                // Need to handle potential mismatches if tier is 'premium' vs 'SILVER'.
                // Frontend passes 'premium' which maps to 'PREMIUM GATE' name.
                // I should map IDs 'basic' -> 'BRONZE'?, 'premium' -> 'SILVER', 'elite' -> 'GOLD'?
                // Lets standardize.

                let dbTier = 'FREE';
                if (tier === 'basic') dbTier = 'BRONZE';
                if (tier === 'premium') dbTier = 'SILVER';
                if (tier === 'elite') dbTier = 'GOLD';

                // Or explicitly pass the dbTier from checkout creation. 
                // Better to normalize early.

                console.log(`Updating user ${userId} to tier ${dbTier}`);

                const { error } = await supabase
                    .from('user_tiers')
                    .upsert({
                        id: userId,
                        tier: dbTier,
                        updated_at: new Date().toISOString()
                    }, { onConflict: 'id' });

                if (error) {
                    console.error('Supabase update failed:', error);
                    return new NextResponse('Database Update Failed', { status: 500 });
                }
            } else {
                console.error('Missing SUPABASE_SERVICE_ROLE_KEY. Cannot update user tier.');
                // This is where we fail if not configured.
            }
        }
    }

    return NextResponse.json({ received: true });
}
