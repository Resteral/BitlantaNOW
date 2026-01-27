import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://whooltojhclasofjbkdt.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Indob29sdG9qaGNsYXNvZmpia2R0Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjkwOTQyNzksImV4cCI6MjA4NDY3MDI3OX0.vjdRYuGkUs-r97iVUQljQPB6KTHiYxRYrTtoyVulKeU';

const supabase = createClient(supabaseUrl, supabaseKey);

async function createSean() {
    console.log('Creating user Sean...');
    const { data, error } = await supabase.auth.signUp({
        email: 'sean@bitlanta.com',
        password: 'password123',
    });

    if (error) {
        console.error('Error creating user:', error.message);
    } else {
        console.log('User created successfully:', data.user?.email);
        console.log('ID:', data.user?.id);
    }
}

createSean();
