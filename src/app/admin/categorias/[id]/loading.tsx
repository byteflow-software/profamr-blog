export default function CategoryEditLoading() {
  return (
    <>
      <div className="admin-loading-bar" />
      <div className="admin-page-header">
        <div className="admin-skeleton admin-skeleton-title" style={{ width: 200 }} />
      </div>
      <div className="admin-card">
        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--spacing-lg)' }}>
          <div>
            <div className="admin-skeleton admin-skeleton-text" style={{ width: 60 }} />
            <div className="admin-skeleton" style={{ height: 40, width: '100%' }} />
          </div>
          <div>
            <div className="admin-skeleton admin-skeleton-text" style={{ width: 40 }} />
            <div className="admin-skeleton" style={{ height: 40, width: '100%' }} />
          </div>
          <div>
            <div className="admin-skeleton admin-skeleton-text" style={{ width: 80 }} />
            <div className="admin-skeleton" style={{ height: 80, width: '100%' }} />
          </div>
          <div className="admin-skeleton" style={{ height: 40, width: 100 }} />
        </div>
      </div>
    </>
  )
}
