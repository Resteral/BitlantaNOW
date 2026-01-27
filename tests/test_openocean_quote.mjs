
import fetch from 'node-fetch';

const OPENOCEAN_API_BASE = 'https://open-api.openocean.finance/v3/solana';
const SOL_MINT = 'So11111111111111111111111111111111111111112';
const USDC_MINT = 'EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v';

async function testQuote(amount, label) {
    console.log(`\n--- Testing ${label} (Amount: ${amount}) ---`);
    const url = `${OPENOCEAN_API_BASE}/quote?inTokenAddress=${SOL_MINT}&outTokenAddress=${USDC_MINT}&amount=${amount}&gasPrice=0.000001&slippage=1`;
    console.log('URL:', url);

    try {
        const res = await fetch(url);
        const data = await res.json();

        if (data.code === 200) {
            console.log('SUCCESS!');
            console.log('Out Amount:', data.data.outAmount);
            console.log('Out Amount (Readable?):', data.data.outAmount / 1e6); // USDC has 6 decimals
        } else {
            console.log('FAILED:', data);
        }
    } catch (e) {
        console.error('Error:', e.message);
    }
}

async function run() {
    // Test 1: Human Readable (0.1 SOL)
    await testQuote(0.1, 'Human Readable (0.1)');

    // Test 2: Atomic Units (0.1 * 1e9 = 100,000,000)
    await testQuote(100000000, 'Atomic Units (100,000,000)');
}

run();
