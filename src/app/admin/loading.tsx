export default function AdminLoading() {
  return (
    <>
      <div className="admin-loading-bar" />
      <div style={{ maxWidth: 1200 }}>
        {/* Header skeleton */}
        <div className="admin-page-header">
          <div>
            <div className="admin-skeleton admin-skeleton-title" style={{ width: 180 }} />
            <div className="admin-skeleton admin-skeleton-text" style={{ width: 220 }} />
          </div>
        </div>

        {/* Stats skeleton */}
        <div className="admin-stats-grid">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="admin-stat-card">
              <div className="admin-skeleton admin-skeleton-text" style={{ width: '50%' }} />
              <div className="admin-skeleton" style={{ height: 32, width: '40%', marginBottom: 8 }} />
              <div className="admin-skeleton admin-skeleton-text" style={{ width: '70%' }} />
            </div>
          ))}
        </div>

        {/* Content skeleton */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 'var(--spacing-xl)' }}>
          {[1, 2].map((i) => (
            <div key={i} className="admin-card">
              <div className="admin-skeleton admin-skeleton-title" />
              <div className="admin-skeleton admin-skeleton-block" />
              <div className="admin-skeleton admin-skeleton-block" />
              <div className="admin-skeleton admin-skeleton-block" />
            </div>
          ))}
        </div>
      </div>
    </>
  )
}
