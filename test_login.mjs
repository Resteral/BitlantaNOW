import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
    console.error('Missing Supabase credentials in environment variables.');
    process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function testLogin() {
    console.log('Attempting login...');
    const { data, error } = await supabase.auth.signInWithPassword({
        email: 'admin@bitlanta.com',
        password: 'password123',
    });

    if (error) {
        console.error('Login Failed:', error.message);
        console.error('Error Details:', JSON.stringify(error, null, 2));
    } else {
        console.log('Login Successful!');
        console.log('User ID:', data.user?.id);
        console.log('Session:', data.session ? 'Active' : 'Missing');
    }
}

testLogin();
