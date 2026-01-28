// using built-in fetch

async function testCheckout() {
    try {
        console.log("Testing Checkout API...");
        const response = await fetch('http://localhost:3000/api/checkout', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                // Mocking origin header
                'Origin': 'http://localhost:3000'
            },
            body: JSON.stringify({
                tier: 'basic',
                amount: 49.99,
                name: 'BASIC GATE',
                currency: 'USD'
            })
        });

        const text = await response.text();
        console.log(`Response Status: ${response.status}`);
        console.log(`Response Body: ${text}`);

        if (response.ok) {
            console.log("\n✅ Success! The API accepted the dynamic price parameters.");
            try {
                const json = JSON.parse(text);
                if (json.url) {
                    console.log(`Stripe Session URL: ${json.url}`);
                }
            } catch (e) {
                // ignore json parse error on non-json success (unlikely)
            }
        } else {
            console.log("\n❌ Failed. The API returned an error.");
        }

    } catch (error) {
        console.error("Test script error:", error.message);
    }
}

testCheckout();
