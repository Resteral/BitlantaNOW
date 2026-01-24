const OPENOCEAN_QUOTE = 'https://open-api.openocean.finance/v3/solana/quote?inTokenAddress=So11111111111111111111111111111111111111112&outTokenAddress=EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v&amount=1&gasPrice=0.000001&slippage=1';

async function testOO() {
    console.log('Testing connectivity to OpenOcean...');
    try {
        const start = Date.now();
        const res = await fetch(OPENOCEAN_QUOTE);
        if (res.ok) {
            console.log(`OpenOcean OK (${Date.now() - start}ms)`);
            const json = await res.json();
            console.log('Quote received:', JSON.stringify(json).slice(0, 100) + '...');
        }
        else console.log(`OpenOcean FAILED: ${res.status} ${res.statusText}`);
    } catch (e) {
        console.log('OpenOcean ERROR:', e.message);
    }
}

testOO();
