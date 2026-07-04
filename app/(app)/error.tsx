'use client'

export default function AppError({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  return (
    <div style={{ padding: '20px', fontFamily: 'monospace' }}>
      <h2 style={{ color: '#C4849B', fontSize: '18px', marginBottom: '12px' }}>Something went wrong</h2>
      <p style={{ color: '#c00', fontSize: '13px', wordBreak: 'break-all', marginBottom: '8px' }}>
        <strong>{error.message || 'Unknown error'}</strong>
      </p>
      <pre style={{ fontSize: '10px', color: '#666', overflow: 'auto', maxHeight: '200px', background: '#f5f5f5', padding: '8px', borderRadius: '4px' }}>
        {error.stack}
      </pre>
      <button
        onClick={reset}
        style={{ marginTop: '16px', background: '#C4849B', color: 'white', border: 'none', padding: '10px 20px', borderRadius: '20px', fontSize: '14px' }}
      >
        Try again
      </button>
    </div>
  )
}
