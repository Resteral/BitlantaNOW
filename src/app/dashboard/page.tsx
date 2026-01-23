'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import CreateSignalForm from '@/components/CreateSignalForm';
import TradingBot from '@/components/TradingBot';
import UserManagement from '@/components/UserManagement';
import SignalManagement from '@/components/SignalManagement';

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
                background: '#050214',
                color: 'var(--neon-green)',
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
            color: '#fff',
            maxWidth: '1400px', // Wider for more panels
            margin: '0 auto',
            background: 'radial-gradient(circle at 50% 10%, rgba(188, 19, 254, 0.1) 0%, transparent 50%)'
        }}>
            <header style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                marginBottom: '3rem',
                borderBottom: '1px solid rgba(57, 255, 20, 0.3)',
                paddingBottom: '1rem'
            }}>
                <div>
                    <h1 style={{
                        margin: 0,
                        textTransform: 'uppercase',
                        letterSpacing: '4px',
                        fontSize: '1.5rem',
                        color: 'var(--neon-green)'
                    }}>
                        Central Intelligence // Terminal
                    </h1>
                    <div style={{ fontSize: '0.7rem', opacity: 0.5, marginTop: '0.2rem' }}>
                        SECURE CONNECTION ESTABLISHED
                    </div>
                </div>
                <button
                    onClick={handleLogout}
                    style={{
                        background: 'rgba(255, 77, 77, 0.1)',
                        border: '1px solid #ff4d4d',
                        color: '#ff4d4d',
                        padding: '0.5rem 1.5rem',
                        cursor: 'pointer',
                        fontFamily: 'inherit',
                        textTransform: 'uppercase',
                        fontSize: '0.8rem',
                        fontWeight: 'bold',
                        borderRadius: '4px',
                        transition: 'all 0.3s ease'
                    }}
                >
                    Disconnect
                </button>
            </header>

            <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(350px, 1fr))',
                gap: '2rem'
            }}>
                {/* Panel 1: Signals Form */}
                <div style={panelStyle}>
                    <h2 style={panelTitleStyle}>Broadcast Signal</h2>
                    <p style={panelDescStyle}>Initialize new trading parameters.</p>
                    <CreateSignalForm />
                </div>

                {/* Panel 2: Signal History */}
                <div style={panelStyle}>
                    <h2 style={panelTitleStyle}>Transmission History</h2>
                    <p style={panelDescStyle}>Manage active and historical signals.</p>
                    <SignalManagement />
                </div>

                {/* Panel 3: User Management */}
                <div style={panelStyle}>
                    <h2 style={panelTitleStyle}>Node Registry</h2>
                    <p style={panelDescStyle}>Manage agent access tiers and permissions.</p>
                    <UserManagement />
                </div>

                {/* Panel 4: Bot Status */}
                <div style={{ ...panelStyle, borderColor: 'var(--neon-purple)' }}>
                    <TradingBot />
                </div>
            </div>
        </div >
    );
}

const panelStyle = {
    border: '1px solid rgba(57, 255, 20, 0.2)',
    padding: '1.5rem',
    background: 'rgba(5, 2, 20, 0.4)',
    backdropFilter: 'blur(10px)',
    borderRadius: '12px',
    boxShadow: '0 4px 20px rgba(0, 0, 0, 0.5)',
    display: 'flex',
    flexDirection: 'column' as 'column'
};

const panelTitleStyle = {
    marginTop: 0,
    marginBottom: '0.5rem',
    fontSize: '1.1rem',
    textTransform: 'uppercase' as 'uppercase',
    letterSpacing: '2px',
    color: '#fff'
};

const panelDescStyle = {
    opacity: 0.5,
    fontSize: '0.8rem',
    marginBottom: '1.5rem'
};
