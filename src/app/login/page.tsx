'use client';
import { useState } from 'react';
import { supabase } from '@/lib/supabase';
import { useRouter } from 'next/navigation';

export default function LoginPage() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState<string | null>(null);
    const router = useRouter();

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        setError(null);

        const { error } = await supabase.auth.signInWithPassword({
            email,
            password,
        });

        if (error) {
            setError(error.message);
        } else {
            router.push('/dashboard');
        }
    };

    return (
        <div style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            height: '100vh',
            color: 'var(--foreground)',
            textTransform: 'uppercase'
        }}>
            <h1 style={{ marginBottom: '2rem', textShadow: '0 0 10px var(--foreground)' }}>
                Restricted Access
            </h1>

            <form onSubmit={handleLogin} style={{ display: 'flex', flexDirection: 'column', gap: '1rem', width: '300px' }}>
                <input
                    type="email"
                    placeholder="Agent ID (Email)"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    style={{
                        padding: '10px',
                        background: 'transparent',
                        border: '2px solid var(--foreground)',
                        color: 'var(--foreground)',
                        fontFamily: 'inherit'
                    }}
                />
                <input
                    type="password"
                    placeholder="Passcode"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    style={{
                        padding: '10px',
                        background: 'transparent',
                        border: '2px solid var(--foreground)',
                        color: 'var(--foreground)',
                        fontFamily: 'inherit'
                    }}
                />
                <button
                    type="submit"
                    style={{
                        padding: '10px',
                        background: 'var(--foreground)',
                        color: 'var(--background)',
                        border: 'none',
                        cursor: 'pointer',
                        fontFamily: 'inherit',
                        fontWeight: 'bold'
                    }}
                >
                    Enter City
                </button>
            </form>

            {error && (
                <p style={{ marginTop: '1rem', color: 'red', textShadow: '0 0 5px red' }}>
                    {error}
                </p>
            )}
        </div>
    );
}
