import Link from "next/link";
import {
  Headphones,
  ExternalLink,
  Users,
  Mic,
  Play,
  Sparkles,
} from "lucide-react";
import styles from "./PodcastSidebar.module.css";

export function PodcastSidebar() {
  return (
    <aside className={styles.sidebar}>
      {/* Header */}
      <div className={styles.header}>
        <div className={styles.headerBadge}>
          <Mic size={12} />
          <span>PODCAST</span>
        </div>
      </div>

      {/* Logo & Title */}
      <div className={styles.logoSection}>
        <div className={styles.logoIcon}>
          <Headphones size={28} />
        </div>
        <h3 className={styles.title}>Criminal Player</h3>
        <p className={styles.tagline}>A voz do Direito Penal</p>
      </div>

      {/* Features */}
      <div className={styles.features}>
        <div className={styles.feature}>
          <Users size={14} />
          <span>+1.000 assinantes ativos</span>
        </div>
        <div className={styles.feature}>
          <Play size={14} />
          <span>+300 episódios disponíveis</span>
        </div>
        <div className={styles.feature}>
          <Sparkles size={14} />
          <span>+80 ferramentas de IA</span>
        </div>
      </div>

      {/* CTA */}
      <div className={styles.ctaSection}>
        <Link
          href="https://criminalplayer.com.br/podcasts/"
          target="_blank"
          rel="noopener noreferrer"
          className={styles.cta}
        >
          <Headphones size={16} />
          <span>Ouça Agora</span>
          <ExternalLink size={12} />
        </Link>
        <p className={styles.platforms}>Spotify • Apple Podcasts • YouTube</p>
      </div>
    </aside>
  );
}
