'use client'

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  return (
    <html lang="en">
      <body style={{ margin: 0, fontFamily: 'system-ui, sans-serif', background: '#FDF8F5' }}>
        <div style={{ maxWidth: 520, margin: '0 auto', padding: '48px 20px' }}>
          <div style={{ fontSize: 40, marginBottom: 12 }}>🌸</div>
          <h1 style={{ color: '#C4849B', fontSize: 20, margin: '0 0 12px' }}>
            CherylCare hit a snag
          </h1>
          <p style={{ color: '#333', fontSize: 14, lineHeight: 1.5, marginBottom: 16 }}>
            {error.message || 'An unexpected error occurred.'}
          </p>
          <button
            onClick={reset}
            style={{
              background: '#C4849B',
              color: 'white',
              border: 'none',
              padding: '12px 24px',
              borderRadius: 24,
              fontSize: 15,
              fontWeight: 600,
            }}
          >
            Try again
          </button>
        </div>
      </body>
    </html>
  )
}
