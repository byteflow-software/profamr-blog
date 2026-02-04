import { prisma } from '@/lib/prisma'
import { PostForm } from '../PostForm'

async function getCategories() {
  return prisma.category.findMany({
    orderBy: { name: 'asc' },
    select: { id: true, name: true },
  })
}

async function getTags() {
  return prisma.tag.findMany({
    orderBy: { name: 'asc' },
    select: { id: true, name: true },
  })
}

export default async function NewPostPage() {
  const [categories, tags] = await Promise.all([
    getCategories(),
    getTags(),
  ])

  return (
    <div>
      <div className="admin-page-header">
        <div>
          <h1 className="admin-page-title">Novo Post</h1>
          <p className="admin-page-subtitle">Criar um novo artigo para o blog</p>
        </div>
      </div>

      <PostForm categories={categories} tags={tags} />
    </div>
  )
}
