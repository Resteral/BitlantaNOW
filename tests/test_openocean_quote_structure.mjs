
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

        console.log('Response Code:', data.code);
        if (data.code === 200) {
            console.log('SUCCESS!');
            console.log('Data Keys:', Object.keys(data.data));
            console.log('inToken present:', !!data.data.inToken);
            console.log('outToken present:', !!data.data.outToken);
            console.log('Full Data Sample:', JSON.stringify(data.data, null, 2).substring(0, 500)); // Log first 500 chars
        } else {
            console.log('FAILED:', JSON.stringify(data, null, 2));
        }
    } catch (e) {
        console.error('Error:', e.message);
    }
}

async function run() {
    // Test 1: Human Readable (0.1 SOL)
    await testQuote(0.1, 'Human Readable (0.1)');
}

run();
