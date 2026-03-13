'use client'

import { useRouter, useSearchParams } from 'next/navigation'
import { useState, useEffect, useCallback, useRef } from 'react'
import { X, Search, ArrowUpDown } from 'lucide-react'
import styles from './BlogFilterBar.module.css'

interface BlogFilterBarProps {
  activeTag?: { name: string; slug: string } | null
  activeCategory?: { name: string; slug: string } | null
  searchQuery?: string
  sortOrder?: string
}

interface TagSuggestion {
  id: number
  name: string
  slug: string
}

export function BlogFilterBar({
  activeTag,
  activeCategory,
  searchQuery = '',
  sortOrder,
}: BlogFilterBarProps) {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [search, setSearch] = useState(searchQuery)
  const [tagInput, setTagInput] = useState('')
  const [suggestions, setSuggestions] = useState<TagSuggestion[]>([])
  const [showSuggestions, setShowSuggestions] = useState(false)
  const tagInputRef = useRef<HTMLInputElement>(null)
  const suggestionsRef = useRef<HTMLDivElement>(null)

  const hasActiveFilters = activeTag || activeCategory || searchQuery

  const buildUrl = useCallback(
    (overrides: Record<string, string | undefined>) => {
      const params = new URLSearchParams(searchParams.toString())
      for (const [key, value] of Object.entries(overrides)) {
        if (value) {
          params.set(key, value)
        } else {
          params.delete(key)
        }
      }
      params.delete('page')
      const qs = params.toString()
      return qs ? `/blog?${qs}` : '/blog'
    },
    [searchParams]
  )

  // Debounced search
  useEffect(() => {
    const timer = setTimeout(() => {
      if (search !== searchQuery) {
        router.push(buildUrl({ q: search || undefined }))
      }
    }, 300)
    return () => clearTimeout(timer)
  }, [search, searchQuery, router, buildUrl])

  // Tag autocomplete fetch
  useEffect(() => {
    if (!tagInput.trim()) {
      setSuggestions([])
      return
    }
    const timer = setTimeout(async () => {
      try {
        const res = await fetch(`/api/tags?q=${encodeURIComponent(tagInput)}`)
        if (res.ok) {
          const data = await res.json()
          setSuggestions(data)
          setShowSuggestions(true)
        }
      } catch {
        setSuggestions([])
      }
    }, 300)
    return () => clearTimeout(timer)
  }, [tagInput])

  // Close suggestions on outside click
  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (
        suggestionsRef.current &&
        !suggestionsRef.current.contains(e.target as Node) &&
        tagInputRef.current &&
        !tagInputRef.current.contains(e.target as Node)
      ) {
        setShowSuggestions(false)
      }
    }
    document.addEventListener('mousedown', handleClick)
    return () => document.removeEventListener('mousedown', handleClick)
  }, [])

  function removeFilter(key: string) {
    router.push(buildUrl({ [key]: undefined }))
  }

  function selectTag(tag: TagSuggestion) {
    setTagInput('')
    setShowSuggestions(false)
    router.push(buildUrl({ tag: tag.slug }))
  }

  function toggleSort() {
    router.push(buildUrl({ ordem: sortOrder === 'antiga' ? undefined : 'antiga' }))
  }

  function clearAll() {
    router.push('/blog')
  }

  return (
    <div className={styles.filterBar}>
      <div className={styles.controls}>
        {/* Search Input */}
        <div className={styles.searchWrapper}>
          <Search size={14} className={styles.searchIcon} />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Buscar artigos..."
            className={styles.searchInput}
          />
          {search && (
            <button
              onClick={() => setSearch('')}
              className={styles.clearInput}
              aria-label="Limpar busca"
            >
              <X size={12} />
            </button>
          )}
        </div>

        {/* Tag Autocomplete */}
        <div className={styles.tagAutocomplete}>
          <input
            ref={tagInputRef}
            type="text"
            value={tagInput}
            onChange={(e) => setTagInput(e.target.value)}
            onFocus={() => suggestions.length > 0 && setShowSuggestions(true)}
            placeholder="Filtrar por tag..."
            className={styles.tagInput}
          />
          {showSuggestions && suggestions.length > 0 && (
            <div ref={suggestionsRef} className={styles.suggestions}>
              {suggestions.map((tag) => (
                <button
                  key={tag.id}
                  onClick={() => selectTag(tag)}
                  className={styles.suggestionItem}
                >
                  {tag.name}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Sort Toggle */}
        <button onClick={toggleSort} className={`${styles.sortToggle} ${sortOrder === 'antiga' ? styles.sortActive : ''}`}>
          <ArrowUpDown size={14} />
          <span>{sortOrder === 'antiga' ? 'Mais antigos' : 'Mais recentes'}</span>
        </button>
      </div>

      {/* Active Filter Chips */}
      {hasActiveFilters && (
        <div className={styles.activeFilters}>
          {activeTag && (
            <span className={styles.chip}>
              <span className={styles.chipLabel}>Tag:</span> {activeTag.name}
              <button onClick={() => removeFilter('tag')} className={styles.chipRemove} aria-label={`Remover filtro tag ${activeTag.name}`}>
                <X size={12} />
              </button>
            </span>
          )}
          {activeCategory && (
            <span className={styles.chip}>
              <span className={styles.chipLabel}>Categoria:</span> {activeCategory.name}
              <button onClick={() => removeFilter('categoria')} className={styles.chipRemove} aria-label={`Remover filtro categoria ${activeCategory.name}`}>
                <X size={12} />
              </button>
            </span>
          )}
          {searchQuery && (
            <span className={styles.chip}>
              <span className={styles.chipLabel}>Busca:</span> &ldquo;{searchQuery}&rdquo;
              <button onClick={() => { setSearch(''); removeFilter('q') }} className={styles.chipRemove} aria-label="Remover filtro de busca">
                <X size={12} />
              </button>
            </span>
          )}
          {(activeTag && activeCategory) || (activeTag && searchQuery) || (activeCategory && searchQuery) ? (
            <button onClick={clearAll} className={styles.clearAll}>
              Limpar filtros
            </button>
          ) : null}
        </div>
      )}
    </div>
  )
}
