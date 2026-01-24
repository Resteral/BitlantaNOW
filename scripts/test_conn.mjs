import fetch from 'node-fetch'; // Standard fetch might be available in Node 18+ global, but just in case. Actually, I'll rely on global fetch if recent node.

const JUPITER = 'https://quote-api.jup.ag/v6/quote?inputMint=So11111111111111111111111111111111111111112&outputMint=EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v&amount=100000000';
const MOBULA = 'https://api.mobula.io/api/1/market/data?asset=solana';

async function testVapor() {
    console.log('Testing connectivity...');

    try {
        console.log('Pinging Jupiter...');
        const jupStart = Date.now();
        const jupRes = await fetch(JUPITER);
        if (jupRes.ok) console.log(`Jupiter OK (${Date.now() - jupStart}ms)`);
        else console.log(`Jupiter FAILED: ${jupRes.status} ${jupRes.statusText}`);
    } catch (e) {
        console.log('Jupiter ERROR:', e.message);
    }

    try {
        console.log('Pinging Mobula...');
        const mobStart = Date.now();
        const mobRes = await fetch(MOBULA);
        if (mobRes.ok) console.log(`Mobula OK (${Date.now() - mobStart}ms)`);
        else console.log(`Mobula FAILED: ${mobRes.status} ${mobRes.statusText}`);
    } catch (e) {
        console.log('Mobula ERROR:', e.message);
    }
}

testVapor();
