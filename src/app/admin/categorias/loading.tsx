export default function CategoriasLoading() {
  return (
    <>
      <div className="admin-loading-bar" />
      <div className="admin-page-header">
        <div>
          <div className="admin-skeleton admin-skeleton-title" style={{ width: 150 }} />
          <div className="admin-skeleton admin-skeleton-text" style={{ width: 220 }} />
        </div>
        <div className="admin-skeleton" style={{ height: 36, width: 140, borderRadius: 'var(--radius-md)' }} />
      </div>
      <div className="admin-card">
        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--spacing-sm)' }}>
          <div className="admin-skeleton" style={{ height: 40, width: '100%' }} />
          {[1, 2, 3, 4, 5].map((i) => (
            <div key={i} className="admin-skeleton" style={{ height: 52, width: '100%' }} />
          ))}
        </div>
      </div>
    </>
  )
}
