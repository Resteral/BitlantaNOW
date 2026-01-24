const OPENOCEAN_QUOTE_FAIL = 'https://open-api.openocean.finance/v3/solana/quote?inTokenAddress=INVALID_ADDRESS_123&outTokenAddress=EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v&amount=1&gasPrice=0.000001&slippage=1';

async function testFail() {
    console.log('Testing Failure Case...');
    try {
        const res = await fetch(OPENOCEAN_QUOTE_FAIL);
        const json = await res.json();
        console.log('Status:', res.status);
        console.log('Code:', json.code);
        console.log('Data:', JSON.stringify(json.data));
    } catch (e) {
        console.log('ERROR:', e.message);
    }
}

testFail();
