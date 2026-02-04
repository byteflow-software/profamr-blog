'use server'

import { revalidatePath } from 'next/cache'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

interface SocialLink {
  platform: string
  url: string
}

interface SettingsData {
  siteName: string
  siteTagline?: string
  logo?: string
  favicon?: string
  aboutText?: string
  socialLinks?: SocialLink[]
}

export async function updateSettings(data: SettingsData) {
  const session = await auth()
  if (!session?.user) {
    return { success: false, error: 'Não autorizado' }
  }

  // Only ADMIN can change settings
  if (session.user.role !== 'ADMIN') {
    return { success: false, error: 'Apenas administradores podem alterar configurações' }
  }

  try {
    await prisma.siteSettings.upsert({
      where: { id: 1 },
      update: {
        siteName: data.siteName,
        siteTagline: data.siteTagline || null,
        logo: data.logo || null,
        favicon: data.favicon || null,
        aboutText: data.aboutText || null,
        socialLinks: data.socialLinks ? JSON.parse(JSON.stringify(data.socialLinks)) : [],
      },
      create: {
        id: 1,
        siteName: data.siteName,
        siteTagline: data.siteTagline || null,
        logo: data.logo || null,
        favicon: data.favicon || null,
        aboutText: data.aboutText || null,
        socialLinks: data.socialLinks ? JSON.parse(JSON.stringify(data.socialLinks)) : [],
      },
    })

    // Revalidate all pages that might use site settings
    revalidatePath('/', 'layout')
    revalidatePath('/admin/configuracoes')

    return { success: true }
  } catch (error) {
    console.error('Error updating settings:', error)
    return { success: false, error: 'Erro ao salvar configurações' }
  }
}

export async function getSettings() {
  try {
    let settings = await prisma.siteSettings.findUnique({ where: { id: 1 } })

    if (!settings) {
      settings = await prisma.siteSettings.create({
        data: {
          id: 1,
          siteName: 'Prof. AMR',
          siteTagline: 'Direito e Tecnologia',
        },
      })
    }

    return settings
  } catch (error) {
    console.error('Error fetching settings:', error)
    return null
  }
}
