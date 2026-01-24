const OPENOCEAN_QUOTE = 'https://open-api.openocean.finance/v3/solana/quote?inTokenAddress=So11111111111111111111111111111111111111112&outTokenAddress=EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v&amount=1&gasPrice=0.000001&slippage=1';

async function listKeys() {
    try {
        const res = await fetch(OPENOCEAN_QUOTE);
        const json = await res.json();
        const keys = Object.keys(json.data);
        console.log('DATA_KEYS: ' + keys.join(', '));
        if (json.data.inToken) console.log('IN_TOKEN: ' + JSON.stringify(json.data.inToken));
        else console.log('IN_TOKEN: UNDEFINED');
    } catch (e) {
        console.log('ERROR:', e.message);
    }
}

listKeys();
