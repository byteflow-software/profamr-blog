import { notFound } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'
import { prisma } from '@/lib/prisma'
import { WikiCategoryForm } from '../WikiCategoryForm'

interface EditWikiCategoryPageProps {
  params: Promise<{ id: string }>
}

async function getCategory(id: number) {
  return prisma.wikiCategory.findUnique({ where: { id } })
}

async function getAllCategories() {
  return prisma.wikiCategory.findMany({
    orderBy: { name: 'asc' },
    select: { id: true, name: true, parentId: true },
  })
}

export default async function EditWikiCategoryPage({ params }: EditWikiCategoryPageProps) {
  const { id } = await params
  const categoryId = parseInt(id)

  if (isNaN(categoryId)) {
    notFound()
  }

  const [category, categories] = await Promise.all([
    getCategory(categoryId),
    getAllCategories(),
  ])

  if (!category) {
    notFound()
  }

  return (
    <div style={{ maxWidth: 500 }}>
      <div className="admin-page-header">
        <div>
          <h1 className="admin-page-title">Editar Categoria Wiki</h1>
          <p className="admin-page-subtitle">{category.name}</p>
        </div>
      </div>

      <div className="admin-card">
        <WikiCategoryForm category={category} categories={categories} />
      </div>

      <div style={{ marginTop: 'var(--spacing-lg)' }}>
        <Link href="/admin/wiki/categorias" className="admin-btn admin-btn-secondary">
          <ArrowLeft size={16} />
          Voltar
        </Link>
      </div>
    </div>
  )
}
