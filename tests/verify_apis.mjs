
import fetch from 'node-fetch';

const OPENOCEAN_API = 'https://open-api.openocean.finance/v3/solana';
const MOBULA_API = 'https://api.mobula.io/api/1';

async function testOpenOcean() {
    console.log('Testing OpenOcean API...');
    try {
        // Test Quote: SOL to USDC
        // SOL: So11111111111111111111111111111111111111112
        // USDC: EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v
        const url = `${OPENOCEAN_API}/quote?inTokenAddress=So11111111111111111111111111111111111111112&outTokenAddress=EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v&amount=1&gasPrice=0.000001&slippage=1`;

        const res = await fetch(url);
        const data = await res.json();

        if (data.code === 200) {
            console.log('OpenOcean Quote Success:', data.data.outAmount);
            return true;
        } else {
            console.error('OpenOcean Quote Failed:', data);
            return false;
        }
    } catch (e) {
        console.error('OpenOcean Error:', e.message);
        return false;
    }
}

async function testMobula() {
    console.log('Testing Mobula API...');
    try {
        const res = await fetch(`${MOBULA_API}/market/data?asset=solana`);
        const json = await res.json();

        if (json.data && json.data.price) {
            console.log('Mobula Price Success:', json.data.price);
            return true;
        } else {
            console.error('Mobula Price Failed:', json);
            return false;
        }
    } catch (e) {
        console.error('Mobula Error:', e.message);
        return false;
    }
}

(async () => {
    const oo = await testOpenOcean();
    const mob = await testMobula();

    if (oo && mob) {
        console.log('ALL DATASOURCES OPERATIONAL');
    } else {
        console.log('SOME DATASOURCES FAILED');
        process.exit(1);
    }
})();
