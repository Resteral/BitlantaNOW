import { Stripe } from 'stripe';
import { createClient } from '@/lib/supabase/server';
import { NextResponse } from 'next/server';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
    apiVersion: '2025-12-15.clover',
    typescript: true,
});

export async function POST(req: Request) {
    try {
        const supabase = await createClient();
        const { data: { user } } = await supabase.auth.getUser();

        if (!user) {
            return new NextResponse('Unauthorized', { status: 401 });
        }

        const { tier, priceId } = await req.json();

        if (!priceId) {
            return new NextResponse('Missing priceId', { status: 400 });
        }

        const origin = req.headers.get('origin') || 'http://localhost:3000';

        const session = await stripe.checkout.sessions.create({
            payment_method_types: ['card'],
            line_items: [
                {
                    price: priceId,
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
        console.error('Stripe Checkout Error:', error);
        return new NextResponse(error.message || 'Internal Server Error', { status: 500 });
    }
}
