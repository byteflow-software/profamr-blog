'use server'

import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { slugify } from '@/lib/utils'

interface PostFormData {
  title: string
  slug?: string
  content: string
  excerpt?: string
  featuredImage?: string
  status: 'DRAFT' | 'PUBLISHED' | 'ARCHIVED'
  categoryIds: number[]
  tagIds: number[]
}

export async function createPost(data: PostFormData) {
  const session = await auth()
  if (!session?.user) {
    return { success: false, error: 'Não autorizado' }
  }

  try {
    const slug = data.slug || slugify(data.title)

    // Check if slug exists
    const existing = await prisma.post.findUnique({ where: { slug } })
    if (existing) {
      return { success: false, error: 'Já existe um post com este slug' }
    }

    const post = await prisma.post.create({
      data: {
        title: data.title,
        slug,
        content: data.content,
        excerpt: data.excerpt,
        featuredImage: data.featuredImage,
        status: data.status,
        publishedAt: data.status === 'PUBLISHED' ? new Date() : null,
        authorId: parseInt(session.user.id),
        categories: {
          create: data.categoryIds.map((categoryId) => ({
            categoryId,
          })),
        },
        tags: {
          create: data.tagIds.map((tagId) => ({
            tagId,
          })),
        },
      },
    })

    revalidatePath('/admin/posts')
    revalidatePath('/blog')
    revalidatePath('/')

    return { success: true, postId: post.id }
  } catch (error) {
    console.error('Error creating post:', error)
    return { success: false, error: 'Erro ao criar post' }
  }
}

export async function updatePost(postId: number, data: PostFormData) {
  const session = await auth()
  if (!session?.user) {
    return { success: false, error: 'Não autorizado' }
  }

  try {
    const post = await prisma.post.findUnique({ where: { id: postId } })
    if (!post) {
      return { success: false, error: 'Post não encontrado' }
    }

    // Check permissions (only author or admin/editor can edit)
    if (
      session.user.role === 'AUTHOR' &&
      post.authorId !== parseInt(session.user.id)
    ) {
      return { success: false, error: 'Sem permissão para editar este post' }
    }

    const slug = data.slug || slugify(data.title)

    // Check if slug exists (excluding current post)
    const existing = await prisma.post.findFirst({
      where: { slug, NOT: { id: postId } },
    })
    if (existing) {
      return { success: false, error: 'Já existe um post com este slug' }
    }

    // Determine publishedAt
    let publishedAt = post.publishedAt
    if (data.status === 'PUBLISHED' && !post.publishedAt) {
      publishedAt = new Date()
    } else if (data.status !== 'PUBLISHED') {
      publishedAt = null
    }

    // Delete existing relations
    await prisma.categoriesOnPosts.deleteMany({ where: { postId } })
    await prisma.tagsOnPosts.deleteMany({ where: { postId } })

    // Update post
    await prisma.post.update({
      where: { id: postId },
      data: {
        title: data.title,
        slug,
        content: data.content,
        excerpt: data.excerpt,
        featuredImage: data.featuredImage,
        status: data.status,
        publishedAt,
        categories: {
          create: data.categoryIds.map((categoryId) => ({
            categoryId,
          })),
        },
        tags: {
          create: data.tagIds.map((tagId) => ({
            tagId,
          })),
        },
      },
    })

    revalidatePath('/admin/posts')
    revalidatePath(`/admin/posts/${postId}`)
    revalidatePath('/blog')
    revalidatePath(`/blog/${slug}`)
    revalidatePath('/')

    return { success: true }
  } catch (error) {
    console.error('Error updating post:', error)
    return { success: false, error: 'Erro ao atualizar post' }
  }
}

export async function deletePost(postId: number) {
  const session = await auth()
  if (!session?.user) {
    return { success: false, error: 'Não autorizado' }
  }

  try {
    const post = await prisma.post.findUnique({ where: { id: postId } })
    if (!post) {
      return { success: false, error: 'Post não encontrado' }
    }

    // Check permissions (only author or admin/editor can delete)
    if (
      session.user.role === 'AUTHOR' &&
      post.authorId !== parseInt(session.user.id)
    ) {
      return { success: false, error: 'Sem permissão para excluir este post' }
    }

    await prisma.post.delete({ where: { id: postId } })

    revalidatePath('/admin/posts')
    revalidatePath('/blog')
    revalidatePath('/')

    return { success: true }
  } catch (error) {
    console.error('Error deleting post:', error)
    return { success: false, error: 'Erro ao excluir post' }
  }
}
