export default function ConfiguracoesLoading() {
  return (
    <>
      <div className="admin-loading-bar" />
      <div className="admin-page-header">
        <div>
          <div className="admin-skeleton admin-skeleton-title" style={{ width: 160 }} />
          <div className="admin-skeleton admin-skeleton-text" style={{ width: 240 }} />
        </div>
      </div>
      <div className="admin-card">
        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--spacing-lg)' }}>
          {[1, 2, 3, 4].map((i) => (
            <div key={i}>
              <div className="admin-skeleton admin-skeleton-text" style={{ width: 100 }} />
              <div className="admin-skeleton" style={{ height: 40, width: '100%' }} />
            </div>
          ))}
          <div className="admin-skeleton" style={{ height: 40, width: 100 }} />
        </div>
      </div>
    </>
  )
}
