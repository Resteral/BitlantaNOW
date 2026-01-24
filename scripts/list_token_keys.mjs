const OPENOCEAN_QUOTE = 'https://open-api.openocean.finance/v3/solana/quote?inTokenAddress=So11111111111111111111111111111111111111112&outTokenAddress=EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v&amount=1&gasPrice=0.000001&slippage=1';

async function listTokenKeys() {
    try {
        const res = await fetch(OPENOCEAN_QUOTE);
        const json = await res.json();
        if (json.data.inToken) console.log('IN_TOKEN_KEYS: ' + Object.keys(json.data.inToken).join(', '));
        if (json.data.outToken) console.log('OUT_TOKEN_KEYS: ' + Object.keys(json.data.outToken).join(', '));
    } catch (e) {
        console.log('ERROR:', e.message);
    }
}

listTokenKeys();
