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
            color: '#fff',
            position: 'relative',
            overflow: 'hidden'
        }}>
            <div className="perspective-grid">
                <div className="grid-content"></div>
            </div>

            <h1 style={{
                marginBottom: '4rem',
                fontSize: '3rem',
                fontWeight: 900,
                letterSpacing: '10px',
                textTransform: 'uppercase',
                textShadow: '3px 3px var(--vw-magenta), -3px -3px var(--vw-cyan)',
                textAlign: 'center',
                fontStyle: 'italic'
            }}>
                GATEWAY
            </h1>

            <form onSubmit={handleLogin} style={{
                display: 'flex',
                flexDirection: 'column',
                gap: '1.5rem',
                width: 'min(400px, 90vw)',
                background: 'rgba(255, 255, 255, 0.03)',
                padding: '3rem',
                borderRadius: '30px',
                backdropFilter: 'blur(20px)',
                border: '1px solid rgba(255, 255, 255, 0.1)',
                boxShadow: '0 20px 50px rgba(0,0,0,0.5)'
            }}>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                    <label style={{ fontSize: '0.7rem', color: 'var(--vw-cyan)', letterSpacing: '2px', fontWeight: 700 }}>AGENT_ID</label>
                    <input
                        type="email"
                        placeholder="EMAIL@ETHER.COM"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        style={{
                            padding: '15px',
                            background: 'rgba(0,0,0,0.2)',
                            border: '1px solid rgba(255, 255, 255, 0.1)',
                            borderRadius: '12px',
                            color: '#fff',
                            fontFamily: 'inherit',
                            fontSize: '0.9rem',
                            outline: 'none',
                            transition: 'all 0.3s ease'
                        }}
                    />
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                    <label style={{ fontSize: '0.7rem', color: 'var(--vw-magenta)', letterSpacing: '2px', fontWeight: 700 }}>PASSCODE</label>
                    <input
                        type="password"
                        placeholder="********"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        style={{
                            padding: '15px',
                            background: 'rgba(0,0,0,0.2)',
                            border: '1px solid rgba(255, 255, 255, 0.1)',
                            borderRadius: '12px',
                            color: '#fff',
                            fontFamily: 'inherit',
                            fontSize: '0.9rem',
                            outline: 'none',
                            transition: 'all 0.3s ease'
                        }}
                    />
                </div>

                <button
                    type="submit"
                    className="vapor-btn-small"
                    style={{
                        padding: '15px',
                        background: 'linear-gradient(45deg, var(--vw-magenta), var(--vw-cyan))',
                        color: '#fff',
                        border: 'none',
                        borderRadius: '12px',
                        cursor: 'pointer',
                        fontFamily: 'inherit',
                        fontWeight: '900',
                        letterSpacing: '4px',
                        textTransform: 'uppercase',
                        marginTop: '1rem',
                        transition: 'all 0.4s ease',
                        boxShadow: '0 10px 20px rgba(255, 113, 206, 0.3)'
                    }}
                >
                    INITIATE
                </button>
            </form>

            <style jsx>{`
                .vapor-btn-small:hover {
                    transform: translateY(-3px);
                    box-shadow: 0 15px 30px rgba(255, 113, 206, 0.5);
                    letter-spacing: 6px;
                }
                input:focus {
                    border-color: var(--vw-cyan);
                    box-shadow: 0 0 15px rgba(1, 205, 254, 0.2);
                }
            `}</style>

            {error && (
                <p style={{
                    marginTop: '2rem',
                    color: 'var(--vw-magenta)',
                    textShadow: '0 0 10px var(--vw-magenta)',
                    fontSize: '0.8rem',
                    letterSpacing: '1px',
                    fontWeight: 300,
                    fontStyle: 'italic'
                }}>
                    SIGNAL ERROR: {error.toUpperCase()}
                </p>
            )}
        </div>
    );
}
