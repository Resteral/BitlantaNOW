import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
    console.error('Missing Supabase credentials in environment variables.');
    process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function createAdmin() {
    console.log('Creating admin user...');
    const { data, error } = await supabase.auth.signUp({
        email: 'admin@bitlanta.com',
        password: 'Password123!',
    });

    if (error) {
        console.error('Error creating user:', error.message);
        console.dir(error, { depth: null });
    } else {
        console.log('User created successfully:', data.user?.email);
    }
}

createAdmin();
