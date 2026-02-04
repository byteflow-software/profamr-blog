import { prisma } from '@/lib/prisma'
import { SettingsForm } from './SettingsForm'

async function getSettings() {
  let settings = await prisma.siteSettings.findUnique({ where: { id: 1 } })

  // Create default settings if not exists
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
}

export default async function SettingsPage() {
  const settings = await getSettings()

  return (
    <div style={{ maxWidth: 700 }}>
      <div className="admin-page-header">
        <div>
          <h1 className="admin-page-title">Configurações do Site</h1>
          <p className="admin-page-subtitle">Personalize as informações do seu site</p>
        </div>
      </div>

      <SettingsForm settings={settings} />
    </div>
  )
}
