'use client'

import { useState, useEffect } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import Image from 'next/image'
import { signIn, useSession } from 'next-auth/react'
import { Eye, EyeOff, Lock, Mail, Shield, AlertCircle, Loader2 } from 'lucide-react'
import styles from './page.module.css'

export default function LoginPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const callbackUrl = searchParams.get('callbackUrl') || '/admin'
  const { status } = useSession()

  useEffect(() => {
    if (status === 'authenticated') {
      router.replace(callbackUrl)
    }
  }, [status, router, callbackUrl])

  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [totp, setTotp] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [show2FA, setShow2FA] = useState(false)
  const [error, setError] = useState('')
  const [isLoading, setIsLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setIsLoading(true)

    try {
      const result = await signIn('credentials', {
        email,
        password,
        totp: show2FA ? totp : undefined,
        redirect: false,
      })

      if (result?.error) {
        if (result.error === '2FA_REQUIRED') {
          setShow2FA(true)
          setError('')
        } else {
          setError(result.error)
        }
      } else if (result?.ok) {
        router.push(callbackUrl)
        router.refresh()
      }
    } catch {
      setError('Erro ao fazer login. Tente novamente.')
    } finally {
      setIsLoading(false)
    }
  }

  if (status === 'authenticated') {
    return null
  }

  return (
    <div className={styles.page}>
      <div className={styles.container}>
        <div className={styles.card}>
          <div className={styles.header}>
            <Image
              src="/images/prof_amr_logo.png"
              alt="Prof. AMR"
              width={120}
              height={50}
              className={styles.logo}
              priority
            />
            <h1 className={styles.title}>Área Administrativa</h1>
            <p className={styles.subtitle}>Faça login para continuar</p>
          </div>

          <form onSubmit={handleSubmit} className={styles.form}>
            {error && (
              <div className={styles.error}>
                <AlertCircle size={16} />
                <span>{error}</span>
              </div>
            )}

            <div className={styles.field}>
              <label htmlFor="email" className={styles.label}>
                <Mail size={16} />
                Email
              </label>
              <input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className={styles.input}
                placeholder="seu@email.com"
                required
                disabled={isLoading}
                autoComplete="email"
              />
            </div>

            <div className={styles.field}>
              <label htmlFor="password" className={styles.label}>
                <Lock size={16} />
                Senha
              </label>
              <div className={styles.passwordWrapper}>
                <input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className={styles.input}
                  placeholder="Sua senha"
                  required
                  disabled={isLoading}
                  autoComplete="current-password"
                />
                <button
                  type="button"
                  className={styles.passwordToggle}
                  onClick={() => setShowPassword(!showPassword)}
                  tabIndex={-1}
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>

            {show2FA && (
              <div className={styles.field}>
                <label htmlFor="totp" className={styles.label}>
                  <Shield size={16} />
                  Código 2FA
                </label>
                <input
                  id="totp"
                  type="text"
                  value={totp}
                  onChange={(e) => setTotp(e.target.value.replace(/\D/g, '').slice(0, 6))}
                  className={styles.input}
                  placeholder="000000"
                  maxLength={6}
                  required
                  disabled={isLoading}
                  autoComplete="one-time-code"
                  autoFocus
                />
                <p className={styles.hint}>Digite o código do seu app autenticador</p>
              </div>
            )}

            <button type="submit" className={styles.button} disabled={isLoading}>
              {isLoading ? (
                <>
                  <Loader2 size={18} className={styles.spinner} />
                  Entrando...
                </>
              ) : (
                'Entrar'
              )}
            </button>
          </form>

          <div className={styles.footer}>
            <p>Acesso restrito a usuários autorizados.</p>
          </div>
        </div>
      </div>
    </div>
  )
}
