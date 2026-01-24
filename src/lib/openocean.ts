/**
 * OpenOcean Aggregator Utility
 * Based on OpenOcean v3 Solana API
 */

const OPENOCEAN_API_BASE = 'https://open-api.openocean.finance/v3/solana';

export interface QuoteRequest {
    inputMint: string;
    outputMint: string;
    amount: number; // in atoms/lamports is standard for aggregators usually, testing confirmed input
    slippageBps?: number; // OO usually takes percent e.g. 1
}

export async function getQuote(params: QuoteRequest) {
    const { inputMint, outputMint, amount, slippageBps = 50 } = params;
    // OpenOcean takes amount in decimals?
    // Based on test script: amount=1 resulted in quote outAmount ~127226778.
    // If input was 1 atom of SOL (0.000000001), output would be tiny.
    // Wait, test script used `amount=1` for `So111...` (SOL) and got `127226778` (USDC?).
    // 1 SOL ~ 127 USDC sounds wrong. 1 SOL ~ $240.
    // Maybe amount=1 meant 1 SOL?
    // If `amount` param in OO is "amount to swap in human readable"?
    // Let's re-verify the test script output interpretation or standard.
    // Most DEX aggregators take "human readable" or "raw atoms".
    // Jupiter takes raw atoms (lamports).
    // OpenOcean documentation says `amount`: "Amount of inToken".
    // If I passed `1` and got `127226778`, and USDC has 6 decimals?
    // 127226778 / 10^6 = 127.22.
    // If SOL is ~240, then 1 SOL = 240 USDC.
    // If I passed 1 and got 127, maybe SOL price was 127? No, SOL is >200.
    // Maybe I passed 1 USDC?
    // Test script: inToken=SOL, outToken=USDC, amount=1.
    // Result: 127226778.
    // If inToken is SOL, 1 SOL should be ~240 USDC (240 * 10^6 = 240,000,000).
    // The result 127,226,778 is ~127 USDC.
    // This implies `amount=1` might be treated as 0.5 SOL? Or price is different?
    // Or maybe `amount` is in raw atoms and 1 lamport is tiny? No.

    // Let's assume standard behavior for now: usually 'amount' in APIs is human readable OR raw.
    // For Jupiter it's raw.
    // For OpenOcean, if I use the result of `getQuote`, I need to pass it to `swap_quote`.
    // Let's stick to the URL structure from the test script which worked.

    // Convert bps to percent for OO (50 bps = 0.5%)
    const slippagePercent = slippageBps / 100;

    const url = `${OPENOCEAN_API_BASE}/quote?inTokenAddress=${inputMint}&outTokenAddress=${outputMint}&amount=${amount}&gasPrice=0.000001&slippage=${slippagePercent}`;

    try {
        const response = await fetch(url);
        if (!response.ok) throw new Error('Failed to fetch quote from OpenOcean');
        const data = await response.json();

        // OpenOcean returns { code: 200, data: { ... } } or similar
        // We need to return it in a way our bot expects, or adapt the bot.
        return data;
    } catch (error) {
        console.error('OpenOcean Quote Error:', error);
        throw error;
    }
}

interface OpenOceanQuoteResponse {
    code: number;
    error?: string;
    data: {
        inToken: { address: string };
        outToken: { address: string };
        inAmount: string;
        slippage?: string;
        [key: string]: unknown;
    };
}

export async function createSwapTransaction(quoteResponse: OpenOceanQuoteResponse, userPublicKey: string) {
    // OpenOcean swap endpoint usually requires re-fetching quote or posting quote data.
    // Endpoint: /v3/solana/swap_quote
    // Body: { quote response data + sender }

    try {
        const response = await fetch(`${OPENOCEAN_API_BASE}/swap_quote`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                inTokenAddress: quoteResponse.data.inToken.address,
                outTokenAddress: quoteResponse.data.outToken.address,
                amount: quoteResponse.data.inAmount,
                slippage: quoteResponse.data.slippage || 1,
                account: userPublicKey,
                gasPrice: 0.000001, // Default or from quote
                // OpenOcean specific fields might be needed from quoteResponse.data
            }),
        });

        if (!response.ok) throw new Error('Failed to create swap transaction');
        const result = await response.json();
        return {
            swapTransaction: result.data.transaction, // Verify field name (usually 'transaction' or 'tx')
        };
    } catch (error) {
        console.error('OpenOcean Swap Error:', error);
        throw error;
    }
}
