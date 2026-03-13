export default function BlogLoading() {
  return (
    <div style={{ maxWidth: 1200, margin: '0 auto', padding: '2rem 1.5rem' }}>
      {/* Header skeleton */}
      <div style={{ marginBottom: '2rem' }}>
        <div className="blog-skeleton blog-skeleton-title" style={{ width: '30%', height: 32 }} />
        <div className="blog-skeleton blog-skeleton-text" style={{ width: '50%', marginTop: 12 }} />
      </div>

      {/* Filter bar skeleton */}
      <div style={{ display: 'flex', gap: 12, marginBottom: '2rem', flexWrap: 'wrap' }}>
        <div className="blog-skeleton" style={{ width: 200, height: 40, borderRadius: 8 }} />
        <div className="blog-skeleton" style={{ width: 200, height: 40, borderRadius: 8 }} />
        <div className="blog-skeleton" style={{ width: 120, height: 40, borderRadius: 8 }} />
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '240px 1fr', gap: '2rem' }}>
        {/* Sidebar skeleton */}
        <div>
          <div className="blog-skeleton blog-skeleton-text" style={{ width: '70%', height: 18, marginBottom: 16 }} />
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="blog-skeleton blog-skeleton-text" style={{ width: `${60 + Math.random() * 30}%`, marginBottom: 10 }} />
          ))}
        </div>

        {/* Posts grid skeleton */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '1.5rem' }}>
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} style={{ border: '1px solid #e2e8f0', borderRadius: 8, padding: 20 }}>
              <div className="blog-skeleton blog-skeleton-text" style={{ width: '40%', height: 12, marginBottom: 12 }} />
              <div className="blog-skeleton blog-skeleton-title" style={{ width: '80%', marginBottom: 12 }} />
              <div className="blog-skeleton blog-skeleton-text" style={{ width: '100%', marginBottom: 6 }} />
              <div className="blog-skeleton blog-skeleton-text" style={{ width: '90%', marginBottom: 6 }} />
              <div className="blog-skeleton blog-skeleton-text" style={{ width: '60%', marginBottom: 16 }} />
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div className="blog-skeleton blog-skeleton-text" style={{ width: '30%', height: 12 }} />
                <div className="blog-skeleton blog-skeleton-text" style={{ width: '20%', height: 12 }} />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
