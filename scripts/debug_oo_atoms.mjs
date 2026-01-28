const OPENOCEAN_BASE = 'https://open-api.openocean.finance/v3/solana/quote';
const SOL = 'So11111111111111111111111111111111111111112';
const USDC = 'EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v';

async function testAtoms() {
    console.log('Testing Amount = 1e9 (1,000,000,000)...');
    try {
        const url = `${OPENOCEAN_BASE}?inTokenAddress=${SOL}&outTokenAddress=${USDC}&amount=1000000000&gasPrice=0.000001&slippage=1`;
        const res = await fetch(url);
        const json = await res.json();
        console.log(`In Amount: ${json.data?.inAmount}`);
        console.log(`Out Amount (Raw): ${json.data?.outAmount}`);
        if (json.data?.outAmount) {
            const human = json.data.outAmount / 1_000_000;
            console.log(`Out Amount (Human USDC): ${human}`);
        }
    } catch (e) { console.log('Error:', e.message); }
}

testAtoms();
