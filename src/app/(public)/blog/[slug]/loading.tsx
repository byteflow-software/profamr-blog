export default function PostLoading() {
  return (
    <div style={{ maxWidth: 768, margin: '0 auto', padding: '2rem 1.5rem' }}>
      {/* Back link skeleton */}
      <div className="blog-skeleton blog-skeleton-text" style={{ width: 120, height: 14, marginBottom: 24 }} />

      {/* Category skeleton */}
      <div className="blog-skeleton" style={{ width: 100, height: 24, borderRadius: 12, marginBottom: 16 }} />

      {/* Title skeleton */}
      <div className="blog-skeleton blog-skeleton-title" style={{ width: '90%', height: 36, marginBottom: 8 }} />
      <div className="blog-skeleton blog-skeleton-title" style={{ width: '60%', height: 36, marginBottom: 24 }} />

      {/* Meta row skeleton */}
      <div style={{ display: 'flex', gap: 24, marginBottom: 32 }}>
        <div className="blog-skeleton blog-skeleton-text" style={{ width: 100, height: 14 }} />
        <div className="blog-skeleton blog-skeleton-text" style={{ width: 120, height: 14 }} />
        <div className="blog-skeleton blog-skeleton-text" style={{ width: 100, height: 14 }} />
      </div>

      {/* Featured image placeholder */}
      <div className="blog-skeleton" style={{ width: '100%', aspectRatio: '16/10', borderRadius: 8, marginBottom: 32 }} />

      {/* Content block skeletons */}
      {Array.from({ length: 6 }).map((_, i) => (
        <div key={i} className="blog-skeleton blog-skeleton-block" style={{ marginBottom: 16 }} />
      ))}
    </div>
  )
}
