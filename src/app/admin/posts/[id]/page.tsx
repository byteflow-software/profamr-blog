import { notFound } from 'next/navigation'
import { prisma } from '@/lib/prisma'
import { PostForm } from '../PostForm'

interface EditPostPageProps {
  params: Promise<{ id: string }>
}

async function getPost(id: number) {
  return prisma.post.findUnique({
    where: { id },
    include: {
      categories: { select: { categoryId: true } },
      tags: { select: { tagId: true } },
    },
  })
}

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

export default async function EditPostPage({ params }: EditPostPageProps) {
  const { id } = await params
  const postId = parseInt(id)

  if (isNaN(postId)) {
    notFound()
  }

  const [post, categories, tags] = await Promise.all([
    getPost(postId),
    getCategories(),
    getTags(),
  ])

  if (!post) {
    notFound()
  }

  return (
    <div>
      <div className="admin-page-header">
        <div>
          <h1 className="admin-page-title">Editar Post</h1>
          <p className="admin-page-subtitle">{post.title}</p>
        </div>
      </div>

      <PostForm
        post={{
          id: post.id,
          title: post.title,
          slug: post.slug,
          content: post.content,
          excerpt: post.excerpt,
          featuredImage: post.featuredImage,
          status: post.status,
          categories: post.categories,
          tags: post.tags,
        }}
        categories={categories}
        tags={tags}
      />
    </div>
  )
}
