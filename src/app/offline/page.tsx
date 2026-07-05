'use client';

export default function OfflinePage() {
  return (
    <div
      style={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '1rem',
        background: 'linear-gradient(135deg, #fff7ed, #ffffff, #f0f9ff)',
        fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
      }}
    >
      <div
        style={{
          background: 'white',
          borderRadius: '2rem',
          padding: '3rem',
          textAlign: 'center',
          boxShadow: '0 20px 60px rgba(0,0,0,0.08)',
          maxWidth: '400px',
        }}
      >
        <div style={{ fontSize: '4rem', marginBottom: '1rem' }}>📡</div>
        <h1 style={{ fontSize: '1.5rem', color: '#1f2937', marginBottom: '0.5rem' }}>
          Vous êtes hors ligne
        </h1>
        <p style={{ color: '#6b7280', lineHeight: 1.6 }}>
          Vérifiez votre connexion internet et réessayez.
        </p>
        <button
          onClick={() => window.location.reload()}
          style={{
            marginTop: '1.5rem',
            padding: '0.75rem 2rem',
            background: '#f97316',
            color: 'white',
            border: 'none',
            borderRadius: '0.75rem',
            fontSize: '1rem',
            fontWeight: 600,
            cursor: 'pointer',
          }}
        >
          Réessayer
        </button>
      </div>
    </div>
  );
}
