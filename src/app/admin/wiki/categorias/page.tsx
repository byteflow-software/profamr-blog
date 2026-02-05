import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'
import { prisma } from '@/lib/prisma'
import { WikiCategoryForm } from './WikiCategoryForm'
import { WikiCategoryTree } from './WikiCategoryTree'
import styles from './page.module.css'

async function getCategories() {
  return prisma.wikiCategory.findMany({
    orderBy: { order: 'asc' },
    include: {
      _count: { select: { articles: true } },
      parent: { select: { name: true } },
    },
  })
}

export default async function WikiCategoriesPage() {
  const categories = await getCategories()

  return (
    <div className={styles.page}>
      <div className="admin-page-header">
        <div>
          <h1 className="admin-page-title">Categorias da Wiki</h1>
          <p className="admin-page-subtitle">{categories.length} categorias</p>
        </div>
        <Link href="/admin/wiki" className="admin-btn admin-btn-secondary">
          <ArrowLeft size={16} />
          Voltar para Wiki
        </Link>
      </div>

      <div className={styles.layout}>
        {/* Form */}
        <div className="admin-card">
          <h2 className={styles.cardTitle}>Nova Categoria</h2>
          <WikiCategoryForm categories={categories} />
        </div>

        {/* Tree */}
        <div className="admin-card">
          <h2 className={styles.cardTitle}>Hierarquia de Categorias</h2>
          <WikiCategoryTree categories={categories} />
        </div>
      </div>
    </div>
  )
}
