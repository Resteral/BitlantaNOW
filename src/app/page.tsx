'use client';

import Link from 'next/link';
import MarketTicker from '@/components/MarketTicker';
import SignalFeed from '@/components/SignalFeed';

export default function Home() {
  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      paddingBottom: '4rem',
      position: 'relative',
      overflow: 'hidden'
    }}>
      <MarketTicker />

      {/* VAPORWAVE ELEMENTS */}
      <div className="perspective-grid">
        <div className="grid-content"></div>
      </div>
      <div className="vapor-sun"></div>

      {/* ATMOSPHERIC BLOOM */}
      <div style={{
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        zIndex: 0,
        pointerEvents: 'none',
        background: 'radial-gradient(circle at 50% 35%, rgba(255, 113, 206, 0.15) 0%, transparent 60%)'
      }} />

      {/* SCANLINES */}
      <div style={{
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        zIndex: 10,
        pointerEvents: 'none',
        background: 'linear-gradient(rgba(18, 16, 16, 0) 50%, rgba(0, 0, 0, 0.1) 50%)',
        backgroundSize: '100% 4px',
        opacity: 0.5
      }} />

      <main style={{
        flex: 1,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        padding: '6rem 2rem',
        maxWidth: '1200px',
        width: '100%',
        zIndex: 1
      }}>

        {/* HERO SECTION */}
        <div style={{ textAlign: 'center', marginBottom: '8rem', position: 'relative' }}>
          <div style={{ position: 'relative', display: 'inline-block' }}>
            <h1 className="glitch-title" style={{
              fontSize: 'min(6rem, 15vw)',
              fontWeight: 900,
              letterSpacing: '-0.02em',
              display: 'inline-flex',
              alignItems: 'center',
              marginBottom: '1rem',
              color: '#fff',
              textShadow: '3px 3px var(--vw-magenta), -3px -3px var(--vw-cyan)'
            }}>
              {/* "BIT" Box - Softened */}
              <span style={{
                background: 'linear-gradient(45deg, var(--vw-magenta), var(--vw-cyan))',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                padding: '0 0.2rem',
                marginRight: '0.1rem',
                filter: 'drop-shadow(0 0 10px var(--vw-magenta))'
              }}>BIT</span>
              <span style={{ position: 'relative' }}>
                LANTA
                <span style={{
                  position: 'absolute',
                  bottom: '-10px',
                  left: 0,
                  width: '100%',
                  height: '2px',
                  background: 'linear-gradient(90deg, transparent, var(--vw-cyan), transparent)',
                  filter: 'blur(2px)'
                }}></span>
              </span>
            </h1>
          </div>

          <h2 style={{
            fontSize: '1.2rem',
            color: 'var(--vw-cyan)',
            fontWeight: 400,
            textTransform: 'uppercase',
            letterSpacing: '0.5em',
            marginBottom: '3rem',
            textShadow: '0 0 10px var(--vw-cyan)',
            fontStyle: 'italic'
          }}>
            Est. 1984 // Digital Paradise
          </h2>

          <p style={{
            maxWidth: '700px',
            margin: '0 auto',
            color: 'rgba(255, 255, 255, 0.8)',
            lineHeight: '2',
            fontSize: '1.2rem',
            letterSpacing: '0.1em',
            fontWeight: 300,
            fontStyle: 'italic',
            textShadow: '0 0 20px rgba(255, 255, 255, 0.2)'
          }}>
            Experience the nostalgic glow of the lost city.
            Where data streams meet dreamscapes, and the
            future is always yesterday.
          </p>
        </div>

        {/* FEED SECTION */}
        <div style={{
          width: '100%',
          marginBottom: '6rem',
          background: 'rgba(26, 11, 46, 0.3)',
          padding: '3rem',
          borderRadius: '40px',
          border: '1px solid rgba(255, 113, 206, 0.2)',
          backdropFilter: 'blur(20px)',
          boxShadow: '0 20px 50px rgba(0,0,0,0.3), inset 0 0 30px rgba(255,113,206,0.1)'
        }}>
          <div style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginBottom: '3rem',
            borderBottom: '1px solid rgba(255, 113, 206, 0.1)',
            paddingBottom: '1.5rem'
          }}>
            <h2 style={{
              fontSize: '1.5rem',
              color: '#fff',
              margin: 0,
              letterSpacing: '4px',
              textTransform: 'uppercase',
              fontWeight: 300
            }}>
              Direct Transmissions
            </h2>
            <div style={{
              color: 'var(--vw-magenta)',
              fontSize: '0.75rem',
              letterSpacing: '0.3em',
              display: 'flex',
              alignItems: 'center',
              gap: '0.75rem',
              fontWeight: 700
            }}>
              <span className="dot-pulse" />
              CONNECTED
            </div>
          </div>
          <SignalFeed />
        </div>

        <Link href="/login" className="vapor-btn" style={{
          padding: '1.5rem 5rem',
          background: 'linear-gradient(45deg, var(--vw-magenta), var(--vw-cyan))',
          color: '#fff',
          textTransform: 'uppercase',
          letterSpacing: '6px',
          fontWeight: 900,
          borderRadius: '100px',
          transition: 'all 0.5s cubic-bezier(0.23, 1, 0.32, 1)',
          boxShadow: '0 10px 40px rgba(255, 113, 206, 0.4)',
          zIndex: 10,
          position: 'relative',
          overflow: 'hidden'
        }}>
          <span style={{ position: 'relative', zIndex: 1 }}>Initialize Access</span>
        </Link>
      </main>

      <style jsx>{`
        .glitch-title {
          animation: glitch 5s infinite;
        }

        @keyframes glitch {
          0% { text-shadow: 3px 3px var(--vw-magenta), -3px -3px var(--vw-cyan); }
          5% { text-shadow: -3px 3px var(--vw-magenta), 3px -3px var(--vw-cyan); }
          10% { text-shadow: 3px -3px var(--vw-magenta), -3px 3px var(--vw-cyan); }
          15% { text-shadow: 2px 2px var(--vw-magenta), -2px -2px var(--vw-cyan); }
          100% { text-shadow: 3px 3px var(--vw-magenta), -3px -3px var(--vw-cyan); }
        }

        .dot-pulse {
          width: 10px;
          height: 10px;
          background: var(--vw-magenta);
          border-radius: 50%;
          box-shadow: 0 0 15px var(--vw-magenta);
          animation: pulse 2s infinite;
        }

        @keyframes pulse {
          0% { transform: scale(1); opacity: 1; }
          50% { transform: scale(1.5); opacity: 0.5; }
          100% { transform: scale(1); opacity: 1; }
        }

        .vapor-btn:hover {
          transform: translateY(-8px) scale(1.05);
          box-shadow: 0 20px 60px rgba(255, 113, 206, 0.6);
          letter-spacing: 8px;
        }

        .vapor-btn::before {
          content: '';
          position: absolute;
          top: 0;
          left: -100%;
          width: 100%;
          height: 100%;
          background: linear-gradient(90deg, transparent, rgba(255,255,255,0.4), transparent);
          transition: 0.5s;
        }

        .vapor-btn:hover::before {
          left: 100%;
        }
      `}</style>

      <footer style={{
        marginTop: 'auto',
        fontSize: '0.7rem',
        opacity: 0.4,
        textAlign: 'center',
        padding: '3rem',
        color: '#fff',
        letterSpacing: '3px',
        textTransform: 'uppercase'
      }}>
        &copy; 1984 - 2026 BITLANTA SYSTEM. ALL RIGHTS RESERVED.
      </footer>
    </div>
  );
}
