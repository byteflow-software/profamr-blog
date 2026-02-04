'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Save, Loader2, Plus, Trash2 } from 'lucide-react'
import { updateSettings } from './actions'

interface SocialLink {
  platform: string
  url: string
}

interface SettingsFormProps {
  settings: {
    siteName: string
    siteTagline: string | null
    logo: string | null
    favicon: string | null
    aboutText: string | null
    socialLinks: unknown
  }
}

const socialPlatforms = [
  { value: 'facebook', label: 'Facebook' },
  { value: 'instagram', label: 'Instagram' },
  { value: 'twitter', label: 'Twitter/X' },
  { value: 'linkedin', label: 'LinkedIn' },
  { value: 'youtube', label: 'YouTube' },
  { value: 'tiktok', label: 'TikTok' },
  { value: 'github', label: 'GitHub' },
  { value: 'whatsapp', label: 'WhatsApp' },
  { value: 'telegram', label: 'Telegram' },
]

export function SettingsForm({ settings }: SettingsFormProps) {
  const router = useRouter()

  const [siteName, setSiteName] = useState(settings.siteName)
  const [siteTagline, setSiteTagline] = useState(settings.siteTagline || '')
  const [logo, setLogo] = useState(settings.logo || '')
  const [favicon, setFavicon] = useState(settings.favicon || '')
  const [aboutText, setAboutText] = useState(settings.aboutText || '')
  const [socialLinks, setSocialLinks] = useState<SocialLink[]>(
    Array.isArray(settings.socialLinks) ? settings.socialLinks as SocialLink[] : []
  )

  const [isSubmitting, setIsSubmitting] = useState(false)
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null)

  const handleAddSocialLink = () => {
    setSocialLinks([...socialLinks, { platform: 'facebook', url: '' }])
  }

  const handleRemoveSocialLink = (index: number) => {
    setSocialLinks(socialLinks.filter((_, i) => i !== index))
  }

  const handleSocialLinkChange = (index: number, field: 'platform' | 'url', value: string) => {
    const updated = [...socialLinks]
    updated[index][field] = value
    setSocialLinks(updated)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setMessage(null)
    setIsSubmitting(true)

    try {
      const result = await updateSettings({
        siteName,
        siteTagline: siteTagline || undefined,
        logo: logo || undefined,
        favicon: favicon || undefined,
        aboutText: aboutText || undefined,
        socialLinks: socialLinks.filter((link) => link.url.trim() !== ''),
      })

      if (result.success) {
        setMessage({ type: 'success', text: 'Configurações salvas com sucesso!' })
        router.refresh()
      } else {
        setMessage({ type: 'error', text: result.error || 'Erro ao salvar' })
      }
    } catch {
      setMessage({ type: 'error', text: 'Erro ao salvar' })
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <form onSubmit={handleSubmit}>
      {message && (
        <div
          className="admin-card"
          style={{
            background: message.type === 'success' ? 'var(--color-success-bg)' : 'var(--color-error-bg)',
            borderColor: message.type === 'success' ? 'var(--color-success)' : 'var(--color-error)',
            marginBottom: 'var(--spacing-lg)',
          }}
        >
          <p style={{ margin: 0, color: message.type === 'success' ? 'var(--color-success)' : 'var(--color-error)' }}>
            {message.text}
          </p>
        </div>
      )}

      <div className="admin-card">
        <h2 style={{ fontSize: '1rem', marginBottom: 'var(--spacing-md)' }}>Informações Gerais</h2>

        <div className="admin-form-group">
          <label className="admin-form-label">Nome do Site *</label>
          <input
            type="text"
            value={siteName}
            onChange={(e) => setSiteName(e.target.value)}
            className="admin-form-input"
            required
          />
        </div>

        <div className="admin-form-group">
          <label className="admin-form-label">Slogan</label>
          <input
            type="text"
            value={siteTagline}
            onChange={(e) => setSiteTagline(e.target.value)}
            className="admin-form-input"
            placeholder="Uma breve descrição do site"
          />
        </div>

        <div className="admin-form-group">
          <label className="admin-form-label">Sobre (Rodapé)</label>
          <textarea
            value={aboutText}
            onChange={(e) => setAboutText(e.target.value)}
            className="admin-form-textarea"
            rows={4}
            placeholder="Texto que aparece no rodapé do site..."
          />
        </div>
      </div>

      <div className="admin-card" style={{ marginTop: 'var(--spacing-lg)' }}>
        <h2 style={{ fontSize: '1rem', marginBottom: 'var(--spacing-md)' }}>Imagens</h2>

        <div className="admin-form-group">
          <label className="admin-form-label">URL do Logo</label>
          <input
            type="url"
            value={logo}
            onChange={(e) => setLogo(e.target.value)}
            className="admin-form-input"
            placeholder="https://exemplo.com/logo.png"
          />
          {logo && (
            <div style={{ marginTop: 'var(--spacing-sm)' }}>
              <img
                src={logo}
                alt="Preview do logo"
                style={{ maxHeight: 60, maxWidth: 200, borderRadius: 'var(--radius-sm)' }}
              />
            </div>
          )}
        </div>

        <div className="admin-form-group">
          <label className="admin-form-label">URL do Favicon</label>
          <input
            type="url"
            value={favicon}
            onChange={(e) => setFavicon(e.target.value)}
            className="admin-form-input"
            placeholder="https://exemplo.com/favicon.ico"
          />
          {favicon && (
            <div style={{ marginTop: 'var(--spacing-sm)', display: 'flex', alignItems: 'center', gap: 'var(--spacing-sm)' }}>
              <img
                src={favicon}
                alt="Preview do favicon"
                style={{ width: 32, height: 32, borderRadius: 'var(--radius-sm)' }}
              />
              <span style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)' }}>32x32 px</span>
            </div>
          )}
        </div>
      </div>

      <div className="admin-card" style={{ marginTop: 'var(--spacing-lg)' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 'var(--spacing-md)' }}>
          <h2 style={{ fontSize: '1rem', margin: 0 }}>Redes Sociais</h2>
          <button
            type="button"
            onClick={handleAddSocialLink}
            className="admin-btn admin-btn-sm admin-btn-secondary"
          >
            <Plus size={14} />
            Adicionar
          </button>
        </div>

        {socialLinks.length === 0 ? (
          <p style={{ fontSize: '0.875rem', color: 'var(--color-text-muted)', textAlign: 'center', padding: 'var(--spacing-md)' }}>
            Nenhuma rede social configurada
          </p>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--spacing-sm)' }}>
            {socialLinks.map((link, index) => (
              <div key={index} style={{ display: 'flex', gap: 'var(--spacing-sm)', alignItems: 'center' }}>
                <select
                  value={link.platform}
                  onChange={(e) => handleSocialLinkChange(index, 'platform', e.target.value)}
                  className="admin-form-select"
                  style={{ width: 140 }}
                >
                  {socialPlatforms.map((p) => (
                    <option key={p.value} value={p.value}>
                      {p.label}
                    </option>
                  ))}
                </select>
                <input
                  type="url"
                  value={link.url}
                  onChange={(e) => handleSocialLinkChange(index, 'url', e.target.value)}
                  className="admin-form-input"
                  placeholder="https://"
                  style={{ flex: 1 }}
                />
                <button
                  type="button"
                  onClick={() => handleRemoveSocialLink(index)}
                  className="admin-btn admin-btn-sm admin-btn-danger"
                  title="Remover"
                >
                  <Trash2 size={14} />
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      <div style={{ marginTop: 'var(--spacing-lg)' }}>
        <button
          type="submit"
          className="admin-btn admin-btn-primary"
          disabled={isSubmitting}
          style={{ width: '100%' }}
        >
          {isSubmitting ? (
            <>
              <Loader2 size={16} className="animate-spin" />
              Salvando...
            </>
          ) : (
            <>
              <Save size={16} />
              Salvar Configurações
            </>
          )}
        </button>
      </div>
    </form>
  )
}
