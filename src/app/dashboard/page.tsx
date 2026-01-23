'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import CreateSignalForm from '@/components/CreateSignalForm';
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
                color: 'var(--vw-cyan)',
                fontStyle: 'italic',
                fontSize: '1.2rem',
                textTransform: 'uppercase',
                letterSpacing: '5px',
                animation: 'vapor-pulse 2s infinite ease-in-out'
            }}>
                Accessing BitLanta Network...
                <style jsx>{`
                    @keyframes vapor-pulse {
                        0%, 100% { opacity: 0.3; }
                        50% { opacity: 1; text-shadow: 0 0 20px var(--vw-cyan); }
                    }
                `}</style>
            </div>
        );
    }

    return (
        <div style={{
            minHeight: '100vh',
            padding: '3rem 2rem',
            color: '#fff',
            maxWidth: '1600px',
            margin: '0 auto',
            position: 'relative'
        }}>
            {/* Background elements */}
            <div className="perspective-grid" style={{ opacity: 0.1 }}>
                <div className="grid-content"></div>
            </div>

            <header style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                marginBottom: '4rem',
                borderBottom: '1px solid rgba(255, 113, 206, 0.1)',
                paddingBottom: '1.5rem',
                position: 'relative',
                zIndex: 10
            }}>
                <div>
                    <h1 style={{
                        margin: 0,
                        textTransform: 'uppercase',
                        letterSpacing: '8px',
                        fontSize: '1.2rem',
                        color: 'var(--vw-cyan)',
                        fontWeight: 900,
                        fontStyle: 'italic'
                    }}>
                        Central Terminal // Control
                    </h1>
                    <div style={{ fontSize: '0.65rem', color: 'var(--vw-magenta)', letterSpacing: '3px', marginTop: '0.4rem', fontWeight: 700 }}>
                        <span className="dot-pulse" style={{ display: 'inline-block', marginRight: '0.5rem' }} />
                        ENCRYPTED UPLINK ESTABLISHED
                    </div>
                </div>
                <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
                    <Link
                        href="/bot"
                        style={{
                            background: 'rgba(1, 205, 254, 0.05)',
                            border: '1px solid rgba(1, 205, 254, 0.3)',
                            color: 'var(--vw-cyan)',
                            padding: '0.6rem 2rem',
                            cursor: 'pointer',
                            fontFamily: 'inherit',
                            textTransform: 'uppercase',
                            fontSize: '0.7rem',
                            fontWeight: 900,
                            borderRadius: '100px',
                            letterSpacing: '2px',
                            transition: 'all 0.3s ease',
                            textDecoration: 'none'
                        }}
                    >
                        Bot Terminal
                    </Link>
                    <button
                        onClick={handleLogout}
                        className="vapor-logout-btn"
                        style={{
                            background: 'rgba(255, 113, 206, 0.05)',
                            border: '1px solid rgba(255, 113, 206, 0.3)',
                            color: 'var(--vw-magenta)',
                            padding: '0.6rem 2rem',
                            cursor: 'pointer',
                            fontFamily: 'inherit',
                            textTransform: 'uppercase',
                            fontSize: '0.7rem',
                            fontWeight: 900,
                            borderRadius: '100px',
                            letterSpacing: '2px',
                            transition: 'all 0.3s ease'
                        }}
                    >
                        Shutdown
                    </button>
                </div>
            </header>

            <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))',
                gap: '2.5rem',
                position: 'relative',
                zIndex: 10
            }}>
                {/* Panel 1: Signals Form */}
                <div style={panelStyle}>
                    <h2 style={panelTitleStyle}>Initialize Broadcast</h2>
                    <p style={panelDescStyle}>Set new data streams for the network.</p>
                    <CreateSignalForm />
                </div>

                {/* Panel 2: Signal History */}
                <div style={panelStyle}>
                    <h2 style={panelTitleStyle}>Ether History</h2>
                    <p style={panelDescStyle}>Archived transmissions and active flows.</p>
                    <SignalManagement />
                </div>

                {/* Panel 3: User Management */}
                <div style={panelStyle}>
                    <h2 style={panelTitleStyle}>Registry Nodes</h2>
                    <p style={panelDescStyle}>Agent authorization levels and protocols.</p>
                    <UserManagement />
                </div>

                {/* Panel 4: Bot Access */}
                <div style={{ ...panelStyle, background: 'rgba(1, 205, 254, 0.05)', borderColor: 'rgba(1, 205, 254, 0.2)' }}>
                    <h2 style={panelTitleStyle}>Terminal Uplink</h2>
                    <p style={panelDescStyle}>Direct access to the secure trading execution environment.</p>
                    <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', flex: 1 }}>
                        <Link
                            href="/bot"
                            style={{
                                display: 'flex',
                                alignItems: 'center',
                                gap: '0.8rem',
                                background: 'var(--vw-cyan)',
                                color: '#000',
                                padding: '1rem 2.5rem',
                                borderRadius: '100px',
                                textDecoration: 'none',
                                fontWeight: 900,
                                letterSpacing: '2px',
                                textTransform: 'uppercase',
                                fontSize: '0.8rem',
                                boxShadow: '0 0 30px rgba(1, 205, 254, 0.4)',
                                transition: 'all 0.3s ease'
                            }}
                            className="bot-access-btn"
                        >
                            Open Bot Terminal
                        </Link>
                    </div>
                </div>
            </div>

            <style jsx>{`
                .vapor-logout-btn:hover {
                    background: rgba(255, 113, 206, 0.15);
                    border-color: var(--vw-magenta);
                    box-shadow: 0 0 20px rgba(255, 113, 206, 0.3);
                }
                .dot-pulse {
                    width: 6px;
                    height: 6px;
                    background: var(--vw-magenta);
                    border-radius: 50%;
                    animation: pulse 2s infinite;
                }
                @keyframes pulse {
                    0% { transform: scale(1); opacity: 1; }
                    50% { transform: scale(1.5); opacity: 0.5; }
                    100% { transform: scale(1); opacity: 1; }
                }
            `}</style>
        </div >
    );
}

const panelStyle = {
    padding: '2.5rem',
    background: 'rgba(26, 11, 46, 0.3)',
    backdropFilter: 'blur(20px)',
    borderRadius: '40px',
    border: '1px solid rgba(255, 255, 255, 0.05)',
    boxShadow: '0 20px 50px rgba(0, 0, 0, 0.3)',
    display: 'flex',
    flexDirection: 'column' as 'column',
    transition: 'transform 0.3s ease'
};

const panelTitleStyle = {
    marginTop: 0,
    marginBottom: '0.8rem',
    fontSize: '1.4rem',
    fontWeight: 300,
    letterSpacing: '4px',
    textTransform: 'uppercase' as 'uppercase',
    color: '#fff',
    fontStyle: 'italic'
};

const panelDescStyle = {
    opacity: 0.4,
    fontSize: '0.75rem',
    marginBottom: '2.5rem',
    letterSpacing: '1px'
};
