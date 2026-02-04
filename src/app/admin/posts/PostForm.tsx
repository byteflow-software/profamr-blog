'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Save, Eye, ArrowLeft, Loader2 } from 'lucide-react'
import { slugify } from '@/lib/utils'
import { createPost, updatePost } from './actions'
import { RichTextEditor } from '@/components/editor'
import styles from './PostForm.module.css'

interface PostFormProps {
  post?: {
    id: number
    title: string
    slug: string
    content: string
    excerpt: string | null
    featuredImage: string | null
    status: 'DRAFT' | 'PUBLISHED' | 'ARCHIVED'
    categories: { categoryId: number }[]
    tags: { tagId: number }[]
  }
  categories: { id: number; name: string }[]
  tags: { id: number; name: string }[]
}

export function PostForm({ post, categories, tags }: PostFormProps) {
  const router = useRouter()
  const isEditing = !!post

  const [title, setTitle] = useState(post?.title || '')
  const [slug, setSlug] = useState(post?.slug || '')
  const [content, setContent] = useState(post?.content || '')
  const [excerpt, setExcerpt] = useState(post?.excerpt || '')
  const [featuredImage, setFeaturedImage] = useState(post?.featuredImage || '')
  const [status, setStatus] = useState<'DRAFT' | 'PUBLISHED' | 'ARCHIVED'>(
    post?.status || 'DRAFT'
  )
  const [selectedCategories, setSelectedCategories] = useState<number[]>(
    post?.categories.map((c) => c.categoryId) || []
  )
  const [selectedTags, setSelectedTags] = useState<number[]>(
    post?.tags.map((t) => t.tagId) || []
  )

  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState('')

  const handleTitleChange = (value: string) => {
    setTitle(value)
    if (!isEditing || slug === slugify(post.title)) {
      setSlug(slugify(value))
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setIsSubmitting(true)

    const data = {
      title,
      slug,
      content,
      excerpt: excerpt || undefined,
      featuredImage: featuredImage || undefined,
      status,
      categoryIds: selectedCategories,
      tagIds: selectedTags,
    }

    try {
      const result = isEditing
        ? await updatePost(post.id, data)
        : await createPost(data)

      if (result.success) {
        if (isEditing) {
          router.refresh()
        } else {
          router.push('/admin/posts')
        }
      } else {
        setError(result.error || 'Erro ao salvar')
      }
    } catch {
      setError('Erro ao salvar')
    } finally {
      setIsSubmitting(false)
    }
  }

  const toggleCategory = (id: number) => {
    setSelectedCategories((prev) =>
      prev.includes(id) ? prev.filter((c) => c !== id) : [...prev, id]
    )
  }

  const toggleTag = (id: number) => {
    setSelectedTags((prev) =>
      prev.includes(id) ? prev.filter((t) => t !== id) : [...prev, id]
    )
  }

  return (
    <form onSubmit={handleSubmit} className={styles.form}>
      <div className={styles.layout}>
        {/* Main Content */}
        <div className={styles.main}>
          <div className="admin-card">
            {error && <div className={styles.error}>{error}</div>}

            <div className="admin-form-group">
              <label className="admin-form-label">Título</label>
              <input
                type="text"
                value={title}
                onChange={(e) => handleTitleChange(e.target.value)}
                className="admin-form-input"
                placeholder="Título do post"
                required
              />
            </div>

            <div className="admin-form-group">
              <label className="admin-form-label">Slug</label>
              <input
                type="text"
                value={slug}
                onChange={(e) => setSlug(slugify(e.target.value))}
                className="admin-form-input"
                placeholder="url-do-post"
                required
              />
              <span className="admin-form-hint">
                URL: /blog/{slug || 'url-do-post'}
              </span>
            </div>

            <div className="admin-form-group">
              <label className="admin-form-label">Conteúdo</label>
              <RichTextEditor
                content={content}
                onChange={setContent}
                placeholder="Comece a escrever o conteúdo do post..."
              />
            </div>

            <div className="admin-form-group">
              <label className="admin-form-label">Resumo (Excerpt)</label>
              <textarea
                value={excerpt}
                onChange={(e) => setExcerpt(e.target.value)}
                className="admin-form-textarea"
                placeholder="Breve resumo do post (opcional)"
                rows={3}
              />
            </div>
          </div>
        </div>

        {/* Sidebar */}
        <div className={styles.sidebar}>
          {/* Publish Box */}
          <div className="admin-card">
            <h3 className={styles.sidebarTitle}>Publicar</h3>

            <div className="admin-form-group">
              <label className="admin-form-label">Status</label>
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value as 'DRAFT' | 'PUBLISHED' | 'ARCHIVED')}
                className="admin-form-select"
              >
                <option value="DRAFT">Rascunho</option>
                <option value="PUBLISHED">Publicado</option>
                <option value="ARCHIVED">Arquivado</option>
              </select>
            </div>

            <div className={styles.actions}>
              <button
                type="submit"
                className="admin-btn admin-btn-primary"
                disabled={isSubmitting}
              >
                {isSubmitting ? (
                  <>
                    <Loader2 size={16} className="animate-spin" />
                    Salvando...
                  </>
                ) : (
                  <>
                    <Save size={16} />
                    {isEditing ? 'Atualizar' : 'Salvar'}
                  </>
                )}
              </button>

              {isEditing && post.status === 'PUBLISHED' && (
                <Link
                  href={`/blog/${post.slug}`}
                  target="_blank"
                  className="admin-btn admin-btn-secondary"
                >
                  <Eye size={16} />
                  Ver
                </Link>
              )}
            </div>
          </div>

          {/* Featured Image */}
          <div className="admin-card">
            <h3 className={styles.sidebarTitle}>Imagem Destacada</h3>
            <div className="admin-form-group">
              <input
                type="url"
                value={featuredImage}
                onChange={(e) => setFeaturedImage(e.target.value)}
                className="admin-form-input"
                placeholder="URL da imagem"
              />
            </div>
            {featuredImage && (
              <img
                src={featuredImage}
                alt="Preview"
                className={styles.imagePreview}
              />
            )}
          </div>

          {/* Categories */}
          <div className="admin-card">
            <h3 className={styles.sidebarTitle}>Categorias</h3>
            <div className={styles.checkboxList}>
              {categories.map((cat) => (
                <label key={cat.id} className={styles.checkboxItem}>
                  <input
                    type="checkbox"
                    checked={selectedCategories.includes(cat.id)}
                    onChange={() => toggleCategory(cat.id)}
                  />
                  <span>{cat.name}</span>
                </label>
              ))}
              {categories.length === 0 && (
                <p className={styles.emptyText}>
                  Nenhuma categoria.{' '}
                  <Link href="/admin/categorias">Criar</Link>
                </p>
              )}
            </div>
          </div>

          {/* Tags */}
          <div className="admin-card">
            <h3 className={styles.sidebarTitle}>Tags</h3>
            <div className={styles.checkboxList}>
              {tags.map((tag) => (
                <label key={tag.id} className={styles.checkboxItem}>
                  <input
                    type="checkbox"
                    checked={selectedTags.includes(tag.id)}
                    onChange={() => toggleTag(tag.id)}
                  />
                  <span>{tag.name}</span>
                </label>
              ))}
              {tags.length === 0 && (
                <p className={styles.emptyText}>
                  Nenhuma tag.{' '}
                  <Link href="/admin/tags">Criar</Link>
                </p>
              )}
            </div>
          </div>
        </div>
      </div>

      <div className={styles.footer}>
        <Link href="/admin/posts" className="admin-btn admin-btn-secondary">
          <ArrowLeft size={16} />
          Voltar
        </Link>
      </div>
    </form>
  )
}
