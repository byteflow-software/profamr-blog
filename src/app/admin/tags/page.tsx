import { prisma } from '@/lib/prisma'
import { Pencil, Trash2 } from 'lucide-react'
import { TagForm } from './TagForm'
import { DeleteTagButton } from './DeleteTagButton'
import styles from './page.module.css'

async function getTags() {
  return prisma.tag.findMany({
    orderBy: { name: 'asc' },
    include: {
      _count: { select: { posts: true } },
    },
  })
}

export default async function TagsPage() {
  const tags = await getTags()

  return (
    <div className={styles.page}>
      <div className="admin-page-header">
        <div>
          <h1 className="admin-page-title">Tags</h1>
          <p className="admin-page-subtitle">{tags.length} tags</p>
        </div>
      </div>

      <div className={styles.layout}>
        {/* Form */}
        <div className="admin-card">
          <h2 className={styles.cardTitle}>Nova Tag</h2>
          <TagForm />
        </div>

        {/* List */}
        <div className="admin-card">
          <h2 className={styles.cardTitle}>Todas as Tags</h2>

          {tags.length === 0 ? (
            <p className={styles.empty}>Nenhuma tag cadastrada.</p>
          ) : (
            <div className={styles.tagsList}>
              {tags.map((tag) => (
                <div key={tag.id} className={styles.tagItem}>
                  <div className={styles.tagInfo}>
                    <span className={styles.tagName}>{tag.name}</span>
                    <span className={styles.tagSlug}>{tag.slug}</span>
                    <span className={styles.tagCount}>{tag._count.posts} posts</span>
                  </div>
                  <div className="admin-table-actions">
                    <DeleteTagButton
                      tagId={tag.id}
                      tagName={tag.name}
                      postCount={tag._count.posts}
                    />
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
