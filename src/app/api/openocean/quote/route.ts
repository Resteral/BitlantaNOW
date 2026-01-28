import { NextRequest, NextResponse } from 'next/server';

const OPENOCEAN_API_BASE = 'https://open-api.openocean.finance/v3/solana';

export async function GET(request: NextRequest) {
    const searchParams = request.nextUrl.searchParams;
    const query = searchParams.toString();
    const url = `${OPENOCEAN_API_BASE}/quote?${query}`;

    try {
        const res = await fetch(url);
        const data = await res.json();
        return NextResponse.json(data, { status: res.status });
    } catch (error: unknown) {
        const message = error instanceof Error ? error.message : 'Unknown error';
        return NextResponse.json({ error: message }, { status: 500 });
    }
}
