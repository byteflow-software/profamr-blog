import Link from 'next/link'
import { prisma } from '@/lib/prisma'
import { Plus, Pencil, Trash2 } from 'lucide-react'
import { DeleteCategoryButton } from './DeleteCategoryButton'
import { CategoryForm } from './CategoryForm'
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

        {/* List */}
        <div className="admin-card">
          <h2 className={styles.cardTitle}>Todas as Categorias</h2>

          {categories.length === 0 ? (
            <p className={styles.empty}>Nenhuma categoria cadastrada.</p>
          ) : (
            <table className="admin-table">
              <thead>
                <tr>
                  <th>Nome</th>
                  <th>Slug</th>
                  <th>Pai</th>
                  <th>Posts</th>
                  <th>Ações</th>
                </tr>
              </thead>
              <tbody>
                {categories.map((cat) => (
                  <tr key={cat.id}>
                    <td className={styles.name}>{cat.name}</td>
                    <td className={styles.slug}>{cat.slug}</td>
                    <td className={styles.parent}>{cat.parent?.name || '-'}</td>
                    <td className={styles.count}>{cat._count.posts}</td>
                    <td>
                      <div className="admin-table-actions">
                        <Link
                          href={`/admin/categorias/${cat.id}`}
                          className="admin-btn admin-btn-sm admin-btn-secondary"
                        >
                          <Pencil size={14} />
                        </Link>
                        <DeleteCategoryButton
                          categoryId={cat.id}
                          categoryName={cat.name}
                          postCount={cat._count.posts}
                        />
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  )
}
