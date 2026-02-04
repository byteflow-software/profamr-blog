import Link from 'next/link'
import { Home, Search } from 'lucide-react'
import styles from './not-found.module.css'

export default function NotFound() {
  return (
    <div className={styles.page}>
      <div className={styles.content}>
        <h1 className={styles.title}>404</h1>
        <h2 className={styles.subtitle}>Página não encontrada</h2>
        <p className={styles.description}>
          A página que você está procurando não existe ou foi movida.
        </p>
        <div className={styles.actions}>
          <Link href="/" className={styles.button}>
            <Home className={styles.buttonIcon} />
            Voltar ao Início
          </Link>
          <Link href="/wiki" className={styles.buttonOutline}>
            <Search className={styles.buttonIcon} />
            Buscar na Wiki
          </Link>
        </div>
      </div>
    </div>
  )
}
