const OPENOCEAN_QUOTE = 'https://open-api.openocean.finance/v3/solana/quote?inTokenAddress=So11111111111111111111111111111111111111112&outTokenAddress=EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v&amount=1&gasPrice=0.000001&slippage=1';

async function debugStructure() {
    console.log('Fetching OpenOcean Quote...');
    try {
        const res = await fetch(OPENOCEAN_QUOTE);
        const json = await res.json();
        console.log('FULL RESPONSE:');
        console.log(JSON.stringify(json, null, 2));
    } catch (e) {
        console.log('ERROR:', e.message);
    }
}

debugStructure();
