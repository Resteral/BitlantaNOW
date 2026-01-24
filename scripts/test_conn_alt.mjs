const JUPITER_PRICE = 'https://price.jup.ag/v4/price?ids=SOL';

async function testAlt() {
    console.log('Testing connectivity to price.jup.ag...');
    try {
        const start = Date.now();
        const res = await fetch(JUPITER_PRICE); // Native fetch
        if (res.ok) console.log(`Jupiter Price OK (${Date.now() - start}ms)`);
        else console.log(`Jupiter Price FAILED: ${res.status}`);
    } catch (e) {
        console.log('Jupiter Price ERROR:', e.message);
    }
}

testAlt();
