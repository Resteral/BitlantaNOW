import Link from 'next/link';
import CryptoBanner from '@/components/CryptoBanner';
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
      <CryptoBanner />

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
        <div style={{ textAlign: 'center', marginBottom: '6rem' }}>
          <h1 style={{
            fontSize: '5rem',
            fontWeight: 900,
            letterSpacing: '-0.05em',
            display: 'inline-flex',
            alignItems: 'center',
            marginBottom: '1rem',
            filter: 'drop-shadow(0 0 20px rgba(57, 255, 20, 0.3))'
          }}>
            {/* "BIT" Box */}
            <span style={{
              background: 'var(--neon-green)',
              color: '#050214',
              padding: '0 0.5rem',
              marginRight: '0.2rem',
              borderRadius: '8px',
              border: '2px solid rgba(255,255,255,0.2)'
            }}>BIT</span>
            <span style={{ color: '#fff' }}>LANTA</span>
          </h1>

          <h2 style={{
            fontSize: '1.5rem',
            color: 'var(--neon-purple)',
            fontWeight: 500,
            textTransform: 'uppercase',
            letterSpacing: '0.2em',
            marginBottom: '2rem',
            textShadow: '0 0 10px rgba(188, 19, 254, 0.5)'
          }}>
            The Lost City of Crypto Phenomena
          </h2>

          <p style={{
            maxWidth: '600px',
            margin: '0 auto',
            color: 'rgba(224, 255, 205, 0.6)',
            lineHeight: '1.6',
            fontSize: '1.1rem'
          }}>
            Ancient gates guard the entrance to Bitlanta, where crypto legends are born
            and digital treasures await. Only those who possess the sacred knowledge
            may enter.
          </p>
        </div>

        {/* FEED SECTION */}
        <div style={{ width: '100%', marginBottom: '5rem' }}>
          <div style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'flex-end',
            marginBottom: '2rem',
            borderBottom: '1px solid rgba(57, 255, 20, 0.3)',
            paddingBottom: '1rem'
          }}>
            <h2 style={{
              fontSize: '2rem',
              color: '#fff',
              margin: 0
            }}>
              System Transmissions
            </h2>
            <span style={{ color: 'var(--neon-green)', fontSize: '0.9rem', letterSpacing: '0.1em' }}>
              ● LIVE FEED
            </span>
          </div>
          <SignalFeed />
        </div>

        <Link href="/login" style={{
          padding: '1.25rem 3rem',
          background: 'transparent',
          border: '2px solid var(--neon-green)',
          color: 'var(--neon-green)',
          textTransform: 'uppercase',
          letterSpacing: '3px',
          fontWeight: 800,
          borderRadius: '50px',
          transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
          position: 'relative',
          overflow: 'hidden',
          zIndex: 10
        }}>
          Agent Access
        </Link>
      </main>

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
