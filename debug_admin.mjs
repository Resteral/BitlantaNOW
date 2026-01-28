import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
    console.error('Missing Supabase credentials.');
    process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function debugAdmin() {
    const email = 'admin@bitlanta.com';
    const password = 'Password123!';

    console.log(`Checking status for ${email}...`);

    // 1. Try Login
    const { data: loginData, error: loginError } = await supabase.auth.signInWithPassword({
        email,
        password
    });

    if (loginData.session) {
        console.log("SUCCESS: User already exists and login works.");
        console.log("User ID:", loginData.user.id);
        return;
    }

    console.log("Login failed (Expected if user doesn't exist):", loginError?.message);

    // 2. Try Signup
    console.log("Attempting Signup...");
    const { data: signupData, error: signupError } = await supabase.auth.signUp({
        email,
        password
    });

    if (signupError) {
        console.error("Signup FAILED.");
        console.error("Status:", signupError.status);
        console.error("Name:", signupError.name);
        console.error("Message:", signupError.message);
        // Supabase error objects sometimes have more details in the prototype or stringified
        console.log("Full Error Object:", JSON.stringify(signupError, null, 2));
    } else {
        console.log("Signup SUCCESS.");
        console.log("User:", signupData.user);
        if (signupData.session) {
            console.log("Session created (Auto-login successful).");
        } else {
            console.log("No session. Check if Email Confirmation is enabled in Supabase.");
        }
    }
}

debugAdmin();
