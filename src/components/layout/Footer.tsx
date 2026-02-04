import Link from 'next/link'
import Image from 'next/image'
import styles from './Footer.module.css'

export function Footer() {
  const currentYear = new Date().getFullYear()

  return (
    <footer className={styles.footer}>
      <div className={styles.container}>
        <div className={styles.top}>
          <div className={styles.brand}>
            <Link href="/" className={styles.logo}>
              <Image
                src="/images/prof_amr_logo.png"
                alt="Prof.AMR"
                width={120}
                height={40}
                className={styles.logoImage}
              />
            </Link>
            <p className={styles.description}>
              Conteúdo jurídico de qualidade para estudantes e profissionais do Direito.
            </p>
          </div>

          <nav className={styles.links}>
            <Link href="/">Início</Link>
            <Link href="/blog">Artigos</Link>
            <Link href="/wiki">Wiki</Link>
          </nav>
        </div>

        <div className={styles.bottom}>
          <span className={styles.copyright}>
            &copy; {currentYear} Prof. AMR
          </span>
          <div className={styles.legal}>
            <Link href="/privacidade">Privacidade</Link>
            <Link href="/termos">Termos</Link>
          </div>
        </div>
      </div>
    </footer>
  )
}
