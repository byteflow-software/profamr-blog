'use client'

import { useState } from 'react'
import dynamic from 'next/dynamic'
import { GitBranch } from 'lucide-react'
import type { WikiCategoryTree } from '@/lib/wiki'

const WikiGraphView = dynamic(() => import('./WikiGraphViewWrapper'), {
  ssr: false,
})

interface WikiGraphButtonProps {
  categories: WikiCategoryTree[]
}

export function WikiGraphButton({ categories }: WikiGraphButtonProps) {
  const [showGraph, setShowGraph] = useState(false)

  return (
    <>
      <button
        onClick={() => setShowGraph(true)}
        style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: '6px',
          padding: '6px 14px',
          fontSize: '0.8125rem',
          fontWeight: 500,
          color: '#1a5276',
          background: 'rgba(26, 82, 118, 0.08)',
          border: '1px solid rgba(26, 82, 118, 0.2)',
          borderRadius: '6px',
          cursor: 'pointer',
          whiteSpace: 'nowrap',
          transition: 'all 0.15s ease',
          flexShrink: 0,
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.background = 'rgba(26, 82, 118, 0.15)'
          e.currentTarget.style.borderColor = 'rgba(26, 82, 118, 0.35)'
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.background = 'rgba(26, 82, 118, 0.08)'
          e.currentTarget.style.borderColor = 'rgba(26, 82, 118, 0.2)'
        }}
      >
        <GitBranch size={14} />
        <span>Ver Hierarquia</span>
      </button>
      {showGraph && (
        <WikiGraphView
          categories={categories}
          onClose={() => setShowGraph(false)}
        />
      )}
    </>
  )
}
