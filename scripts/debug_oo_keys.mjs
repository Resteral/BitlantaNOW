const OPENOCEAN_QUOTE = 'https://open-api.openocean.finance/v3/solana/quote?inTokenAddress=So11111111111111111111111111111111111111112&outTokenAddress=EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v&amount=1&gasPrice=0.000001&slippage=1';

async function debugStructure() {
    try {
        const res = await fetch(OPENOCEAN_QUOTE);
        const json = await res.json();
        const data = json.data;

        console.log('Keys of data:', Object.keys(data));

        if (data.inToken) {
            console.log('inToken keys:', Object.keys(data.inToken));
            console.log('inToken:', data.inToken);
        } else {
            console.log('data.inToken is UNDEFINED');
        }

        if (data.outToken) {
            console.log('outToken:', data.outToken);
        }

        console.log('inAmount:', data.inAmount);
        console.log('outAmount:', data.outAmount);

    } catch (e) {
        console.log('ERROR:', e.message);
    }
}

debugStructure();
