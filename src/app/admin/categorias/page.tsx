import { prisma } from '@/lib/prisma'
import { CategoryForm } from './CategoryForm'
import { CategoryTree } from './CategoryTree'
import styles from './page.module.css'

async function getCategories() {
  return prisma.category.findMany({
    orderBy: { name: 'asc' },
    include: {
      _count: { select: { posts: true } },
      parent: { select: { name: true } },
    },
  })
}

export default async function CategoriesPage() {
  const categories = await getCategories()

  return (
    <div className={styles.page}>
      <div className="admin-page-header">
        <div>
          <h1 className="admin-page-title">Categorias</h1>
          <p className="admin-page-subtitle">{categories.length} categorias</p>
        </div>
      </div>

      <div className={styles.layout}>
        {/* Form */}
        <div className="admin-card">
          <h2 className={styles.cardTitle}>Nova Categoria</h2>
          <CategoryForm categories={categories} />
        </div>

        {/* Tree */}
        <div className="admin-card">
          <h2 className={styles.cardTitle}>Hierarquia de Categorias</h2>
          <CategoryTree categories={categories} />
        </div>
      </div>
    </div>
  )
}
