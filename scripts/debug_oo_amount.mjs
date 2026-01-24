const OPENOCEAN_BASE = 'https://open-api.openocean.finance/v3/solana/quote';
const SOL = 'So11111111111111111111111111111111111111112';
const USDC = 'EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v';

async function testAmount() {
    console.log('Testing Amount Units...');

    // Test 1: Amount = 1 (Human Readable 1 SOL?)
    try {
        const url1 = `${OPENOCEAN_BASE}?inTokenAddress=${SOL}&outTokenAddress=${USDC}&amount=1&gasPrice=0.000001&slippage=1`;
        const res1 = await fetch(url1);
        const json1 = await res1.json();
        console.log('\n--- Amount = 1 ---');
        console.log(`In: ${json1.data?.inAmount}`);
        console.log(`Out: ${json1.data?.outAmount} (Raw USDC atoms)`);
        // USDC has 6 decimals.
        if (json1.data?.outAmount) {
            console.log(`Out (Human): ${json1.data.outAmount / 1_000_000} USDC`);
        }
    } catch (e) { console.log('Err 1:', e.message); }

    // Test 2: Amount = 1_000_000_000 (1 SOL in Lamports)
    try {
        const url2 = `${OPENOCEAN_BASE}?inTokenAddress=${SOL}&outTokenAddress=${USDC}&amount=1000000000&gasPrice=0.000001&slippage=1`;
        const res2 = await fetch(url2);
        const json2 = await res2.json();
        console.log('\n--- Amount = 1,000,000,000 (1e9) ---');
        console.log(`In: ${json2.data?.inAmount}`);
        console.log(`Out: ${json2.data?.outAmount} (Raw USDC atoms)`);
        if (json2.data?.outAmount) {
            console.log(`Out (Human): ${json2.data.outAmount / 1_000_000} USDC`);
        }
    } catch (e) { console.log('Err 2:', e.message); }
}

testAmount();
