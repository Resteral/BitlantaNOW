/**
 * Jupiter Aggregator Utility
 * Based on Jupiter v6 API
 */

const JUPITER_QUOTE_API = 'https://quote-api.jup.ag/v6/quote';
const JUPITER_SWAP_API = 'https://quote-api.jup.ag/v6/swap';

export interface QuoteRequest {
    inputMint: string;
    outputMint: string;
    amount: number;
    slippageBps?: number;
}

export async function getQuote(params: QuoteRequest) {
    const { inputMint, outputMint, amount, slippageBps = 50 } = params;
    const url = `${JUPITER_QUOTE_API}?inputMint=${inputMint}&outputMint=${outputMint}&amount=${amount}&slippageBps=${slippageBps}`;

    try {
        const response = await fetch(url);
        if (!response.ok) throw new Error('Failed to fetch quote from Jupiter');
        return await response.json();
    } catch (error) {
        console.error('Jupiter Quote Error:', error);
        throw error;
    }
}

export async function createSwapTransaction(quoteResponse: unknown, userPublicKey: string) {
    try {
        const response = await fetch(JUPITER_SWAP_API, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                quoteResponse,
                userPublicKey,
                wrapAndUnwrapSol: true,
            }),
        });

        if (!response.ok) throw new Error('Failed to create swap transaction');
        return await response.json();
    } catch (error) {
        console.error('Jupiter Swap Error:', error);
        throw error;
    }
}
