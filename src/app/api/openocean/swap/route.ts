import { NextRequest, NextResponse } from 'next/server';

const OPENOCEAN_API_BASE = 'https://open-api.openocean.finance/v3/solana';

export async function POST(request: NextRequest) {
    try {
        const body = await request.json();
        const res = await fetch(`${OPENOCEAN_API_BASE}/swap_quote`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(body),
        });
        const data = await res.json();
        return NextResponse.json(data, { status: res.status });
    } catch (error: unknown) {
        const message = error instanceof Error ? error.message : 'Unknown error';
        return NextResponse.json({ error: message }, { status: 500 });
    }
}
