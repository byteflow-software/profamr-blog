import Link from 'next/link'
import { ArrowLeft, Pencil, Trash2 } from 'lucide-react'
import { prisma } from '@/lib/prisma'
import { WikiCategoryForm } from './WikiCategoryForm'
import { DeleteWikiCategoryButton } from './DeleteWikiCategoryButton'
import styles from './page.module.css'

async function getCategories() {
  return prisma.wikiCategory.findMany({
    orderBy: { order: 'asc' },
    include: {
      _count: { select: { articles: true } },
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
          <WikiCategoryForm />
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
                  <th>Artigos</th>
                  <th>Ordem</th>
                  <th>Ações</th>
                </tr>
              </thead>
              <tbody>
                {categories.map((cat) => (
                  <tr key={cat.id}>
                    <td className={styles.name}>
                      {cat.icon && <span>{cat.icon} </span>}
                      {cat.name}
                    </td>
                    <td className={styles.slug}>{cat.slug}</td>
                    <td className={styles.count}>{cat._count.articles}</td>
                    <td className={styles.order}>{cat.order}</td>
                    <td>
                      <div className="admin-table-actions">
                        <Link
                          href={`/admin/wiki/categorias/${cat.id}`}
                          className="admin-btn admin-btn-sm admin-btn-secondary"
                        >
                          <Pencil size={14} />
                        </Link>
                        <DeleteWikiCategoryButton
                          categoryId={cat.id}
                          categoryName={cat.name}
                          articleCount={cat._count.articles}
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
