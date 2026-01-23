import Link from 'next/link';
import CryptoBanner from '@/components/CryptoBanner';
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
      overflow: 'hidden' // For background overflow
    }}>
      <MarketTicker />

      {/* ATMOSPHERIC BACKGROUND */}
      <div style={{
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        zIndex: 0,
        pointerEvents: 'none',
        background: 'radial-gradient(circle at 50% 30%, rgba(57, 255, 20, 0.05) 0%, transparent 70%), radial-gradient(circle at 80% 80%, rgba(188, 19, 254, 0.05) 0%, transparent 50%)'
      }} />

      {/* SCANLINES OVERLAY */}
      <div style={{
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        zIndex: 10,
        pointerEvents: 'none',
        background: 'linear-gradient(rgba(18, 16, 16, 0) 50%, rgba(0, 0, 0, 0.25) 50%), linear-gradient(90deg, rgba(255, 0, 0, 0.06), rgba(0, 255, 0, 0.02), rgba(0, 0, 255, 0.06))',
        backgroundSize: '100% 2px, 3px 100%',
        opacity: 0.3
      }} />

      <main style={{
        flex: 1,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        padding: '4rem 2rem',
        maxWidth: '1200px',
        width: '100%',
        zIndex: 1
      }}>

        {/* HERO SECTION */}
        <div style={{ textAlign: 'center', marginBottom: '6rem', position: 'relative' }}>
          <div style={{ position: 'relative', display: 'inline-block' }}>
            {/* Retro City Silhouette */}
            <div style={{
              position: 'absolute',
              bottom: '95%',
              left: '26%',
              transform: 'translateX(-50%)',
              display: 'flex',
              alignItems: 'flex-end',
              gap: '2px',
              zIndex: 0,
              opacity: 0.9,
              pointerEvents: 'none',
              filter: 'drop-shadow(0 0 15px var(--neon-purple))'
            }}>
              {/* Cityscape Nodes */}
              <div style={{ width: '8px', height: '30px', background: 'var(--neon-green)', animation: 'flicker 3s infinite' }}></div>
              <div style={{ width: '15px', height: '55px', background: 'var(--neon-purple)', animation: 'flicker 4s infinite' }}></div>
              <div style={{ width: '10px', height: '40px', background: 'var(--neon-green)', animation: 'flicker 5s infinite' }}></div>
              <div style={{ width: '6px', height: '25px', background: 'var(--neon-purple)', animation: 'flicker 2.5s infinite' }}></div>
              <div style={{
                width: '20px',
                height: '25px',
                background: 'var(--neon-green)',
                borderRadius: '50% 50% 0 0',
                animation: 'flicker 6s infinite'
              }}></div>
            </div>

            <h1 style={{
              fontSize: 'min(5rem, 12vw)',
              fontWeight: 900,
              letterSpacing: '-0.05em',
              display: 'inline-flex',
              alignItems: 'center',
              marginBottom: '1rem',
              filter: 'drop-shadow(0 0 30px rgba(57, 255, 20, 0.4))'
            }}>
              {/* "BIT" Box */}
              <span className="bit-box" style={{
                background: 'var(--neon-green)',
                color: '#050214',
                padding: '0 0.5rem',
                marginRight: '0.2rem',
                borderRadius: '8px',
                border: '2px solid rgba(255,255,255,0.4)',
                boxShadow: '0 0 20px var(--neon-green)',
                animation: 'pulse-glow 2s infinite ease-in-out'
              }}>BIT</span>
              <span style={{ color: '#fff' }}>LANTA</span>
            </h1>
          </div>

          <h2 style={{
            fontSize: '1.5rem',
            color: 'var(--neon-purple)',
            fontWeight: 500,
            textTransform: 'uppercase',
            letterSpacing: '0.3em',
            marginBottom: '2rem',
            textShadow: '0 0 15px rgba(188, 19, 254, 0.8)'
          }}>
            The Lost City of Crypto Phenomena
          </h2>

          <p style={{
            maxWidth: '650px',
            margin: '0 auto',
            color: 'rgba(224, 255, 205, 0.7)',
            lineHeight: '1.8',
            fontSize: '1.1rem',
            letterSpacing: '0.05em'
          }}>
            Beneath the digital waves of the old world lies Bitlanta.
            A haven for elite agents, rogue algorithms, and the most
            advanced crypto intelligence ever discovered.
          </p>
        </div>

        {/* FEED SECTION */}
        <div style={{
          width: '100%',
          marginBottom: '5rem',
          background: 'rgba(255,255,255,0.02)',
          padding: '2rem',
          borderRadius: '24px',
          border: '1px solid rgba(57, 255, 20, 0.1)',
          boxShadow: 'inset 0 0 50px rgba(0,0,0,0.5)'
        }}>
          <div style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'flex-end',
            marginBottom: '2rem',
            borderBottom: '1px solid rgba(57, 255, 20, 0.3)',
            paddingBottom: '1rem'
          }}>
            <h2 style={{
              fontSize: '1.8rem',
              color: '#fff',
              margin: 0,
              letterSpacing: '2px'
            }}>
              System Transmissions
            </h2>
            <span style={{
              color: 'var(--neon-green)',
              fontSize: '0.8rem',
              letterSpacing: '0.2em',
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem'
            }}>
              <span style={{
                width: '8px',
                height: '8px',
                background: 'var(--neon-green)',
                borderRadius: '50%',
                boxShadow: '0 0 10px var(--neon-green)',
                animation: 'flicker 1s infinite'
              }} />
              LIVE FEED
            </span>
          </div>
          <SignalFeed />
        </div>

        <Link href="/login" className="agent-btn" style={{
          padding: '1.5rem 4rem',
          background: 'transparent',
          border: '2px solid var(--neon-green)',
          color: 'var(--neon-green)',
          textTransform: 'uppercase',
          letterSpacing: '5px',
          fontWeight: 900,
          borderRadius: '4px', // Harder retro edges
          transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
          boxShadow: '0 0 20px rgba(57, 255, 20, 0.2)',
          zIndex: 10
        }}>
          Initiate Agent Access
        </Link>
      </main>

      <style jsx>{`
        @keyframes flicker {
          0%, 100% { opacity: 1; }
          41% { opacity: 1; }
          42% { opacity: 0.3; }
          43% { opacity: 1; }
          52% { opacity: 1; }
          53% { opacity: 0.1; }
          54% { opacity: 1; }
        }
        @keyframes pulse-glow {
          0%, 100% { box-shadow: 0 0 20px var(--neon-green); transform: scale(1); }
          50% { box-shadow: 0 0 40px var(--neon-green); transform: scale(1.02); }
        }
        .agent-btn:hover {
          background: var(--neon-green);
          color: #050214;
          box-shadow: 0 0 50px var(--neon-green);
          transform: translateY(-5px);
        }
      `}</style>

      <footer style={{
        marginTop: 'auto',
        fontSize: '0.8rem',
        opacity: 0.5,
        textAlign: 'center',
        padding: '2rem',
        color: 'var(--pale-green)'
      }}>
        &copy; 2026 BITLANTA. ALL RIGHTS RESERVED.
      </footer>
    </div>
  );
}
