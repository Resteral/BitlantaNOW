'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import CreateSignalForm from '@/components/CreateSignalForm';

export default function DashboardPage() {
    const router = useRouter();
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const checkUser = async () => {
            const { data: { session } } = await supabase.auth.getSession();
            if (!session) {
                router.push('/login');
            } else {
                setLoading(false);
            }
        };

        checkUser();
    }, [router]);

    const handleLogout = async () => {
        await supabase.auth.signOut();
        router.push('/login');
    };

    if (loading) {
        return (
            <div style={{
                height: '100vh',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: 'var(--foreground)',
                fontFamily: 'monospace',
                fontSize: '1.5rem',
                textTransform: 'uppercase',
                letterSpacing: '2px'
            }}>
                Accessing BitLanta Network...
            </div>
        );
    }

    return (
        <div style={{
            minHeight: '100vh',
            padding: '2rem',
            color: 'var(--foreground)',
            maxWidth: '1200px',
            margin: '0 auto'
        }}>
            <header style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                marginBottom: '4rem',
                borderBottom: '2px solid var(--foreground)',
                paddingBottom: '1rem'
            }}>
                <h1 style={{
                    margin: 0,
                    textTransform: 'uppercase',
                    letterSpacing: '4px',
                    textShadow: '0 0 10px var(--foreground)'
                }}>
                    Admin // Terminal
                </h1>
                <button
                    onClick={handleLogout}
                    style={{
                        background: 'transparent',
                        border: '1px solid var(--foreground)',
                        color: 'var(--foreground)',
                        padding: '0.5rem 1rem',
                        cursor: 'pointer',
                        fontFamily: 'inherit',
                        textTransform: 'uppercase',
                        fontWeight: 'bold',
                        transition: 'all 0.3s ease'
                    }}
                >
                    Disconnect
                </button>
            </header>

            <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
                gap: '2rem'
            }}>
                {/* Panel 1: Signals */}
                <div style={{
                    border: '1px solid var(--foreground)',
                    padding: '2rem',
                    background: 'rgba(0, 0, 0, 0.3)',
                    boxShadow: '0 0 15px rgba(0, 255, 255, 0.1)'
                }}>
                    <h2 style={{
                        marginTop: 0,
                        borderBottom: '1px solid var(--foreground)',
                        paddingBottom: '0.5rem',
                        marginBottom: '1rem',
                        fontSize: '1.2rem',
                        textTransform: 'uppercase'
                    }}>
                        Signal Transmission
                    </h2>
                    <p style={{ opacity: 0.7, fontSize: '0.9rem', marginBottom: '1.5rem' }}>
                        Broadcast new trading signals to the network.
                    </p>
                    <CreateSignalForm />
                </div>

                {/* Panel 2: Bot Status */}
                <div style={{
                    border: '1px solid var(--foreground)',
                    padding: '2rem',
                    background: 'rgba(0, 0, 0, 0.3)',
                    boxShadow: '0 0 15px rgba(0, 255, 255, 0.1)'
                }}>
                    <h2 style={{
                        marginTop: 0,
                        borderBottom: '1px solid var(--foreground)',
                        paddingBottom: '0.5rem',
                        marginBottom: '1rem',
                        fontSize: '1.2rem',
                        textTransform: 'uppercase'
                    }}>
                        Bot Status
                    </h2>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '1rem' }}>
                        <div style={{
                            width: '10px',
                            height: '10px',
                            borderRadius: '50%',
                            background: '#00ff00',
                            boxShadow: '0 0 10px #00ff00'
                        }} />
                        <span>System Online</span>
                    </div>
                </div>

                {/* Panel 3: User Management */}
                <div style={{
                    border: '1px solid var(--foreground)',
                    padding: '2rem',
                    background: 'rgba(0, 0, 0, 0.3)',
                    boxShadow: '0 0 15px rgba(0, 255, 255, 0.1)'
                }}>
                    <h2 style={{
                        marginTop: 0,
                        borderBottom: '1px solid var(--foreground)',
                        paddingBottom: '0.5rem',
                        marginBottom: '1rem',
                        fontSize: '1.2rem',
                        textTransform: 'uppercase'
                    }}>
                        User Database
                    </h2>
                    <p style={{ opacity: 0.7, fontSize: '0.9rem' }}>
                        Manage access and permissions.
                    </p>
                </div>
            </div>
        </div >
    );
}
