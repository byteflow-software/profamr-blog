import { notFound, redirect } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'
import { prisma } from '@/lib/prisma'
import { CategoryForm } from '../CategoryForm'

interface EditCategoryPageProps {
  params: Promise<{ id: string }>
}

async function getCategory(id: number) {
  return prisma.category.findUnique({ where: { id } })
}

async function getCategories() {
  return prisma.category.findMany({
    orderBy: { name: 'asc' },
    select: { id: true, name: true },
  })
}

export default async function EditCategoryPage({ params }: EditCategoryPageProps) {
  const { id } = await params
  const categoryId = parseInt(id)

  if (isNaN(categoryId)) {
    notFound()
  }

  const [category, categories] = await Promise.all([
    getCategory(categoryId),
    getCategories(),
  ])

  if (!category) {
    notFound()
  }

  return (
    <div style={{ maxWidth: 500 }}>
      <div className="admin-page-header">
        <div>
          <h1 className="admin-page-title">Editar Categoria</h1>
          <p className="admin-page-subtitle">{category.name}</p>
        </div>
      </div>

      <div className="admin-card">
        <CategoryForm category={category} categories={categories} />
      </div>

      <div style={{ marginTop: 'var(--spacing-lg)' }}>
        <Link href="/admin/categorias" className="admin-btn admin-btn-secondary">
          <ArrowLeft size={16} />
          Voltar
        </Link>
      </div>
    </div>
  )
}
