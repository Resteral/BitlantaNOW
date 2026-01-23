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
      paddingBottom: '2rem'
    }}>
      <CryptoBanner />

      <main style={{
        flex: 1,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        textAlign: 'center',
        padding: '0 1rem',
        maxWidth: '1200px',
        width: '100%'
      }}>
        <h1 style={{
          fontSize: '3rem',
          color: 'var(--foreground)',
          textShadow: '0 0 10px var(--foreground)',
          marginBottom: '1rem',
          lineHeight: '1.2'
        }}>
          BITLANTA
          <br />
          <span style={{ fontSize: '1.5rem', color: 'var(--accent)' }}>THE LOST CITY</span>
        </h1>

        <div style={{ width: '100%', marginBottom: '3rem' }}>
          <h2 style={{
            fontSize: '1.5rem',
            textAlign: 'left',
            color: 'var(--gold)',
            marginBottom: '1rem',
            borderBottom: '1px solid var(--foreground)'
          }}>
            SYSTEM TRANSMISSIONS
          </h2>
          <SignalFeed />
        </div>

        <Link href="/login" style={{
          padding: '1rem 2rem',
          border: '2px solid var(--gold)',
          color: 'var(--gold)',
          textTransform: 'uppercase',
          letterSpacing: '2px',
          fontWeight: 'bold',
          transition: 'all 0.3s'
        }}>
          Agent Access
        </Link>
      </main>

      <footer style={{
        marginTop: 'auto',
        fontSize: '0.8rem',
        opacity: 0.7
      }}>
        &copy; 2026 BITLANTA. ALL RIGHTS RESERVED.
      </footer>
    </div>
  );
}
