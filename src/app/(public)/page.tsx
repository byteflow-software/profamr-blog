import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { prisma } from "@/lib/prisma";
import { PostCard } from "@/components/blog/PostCard";
import { PodcastSidebar } from "@/components/blog/PodcastSidebar";
import styles from "./page.module.css";

async function getFeaturedPost() {
  return prisma.post.findFirst({
    where: { status: "PUBLISHED" },
    orderBy: { publishedAt: "desc" },
    include: {
      author: { select: { displayName: true } },
      categories: {
        include: { category: { select: { name: true, slug: true } } },
      },
    },
  });
}

async function getRecentPosts() {
  return prisma.post.findMany({
    where: { status: "PUBLISHED" },
    orderBy: { publishedAt: "desc" },
    skip: 1, // skip featured post
    take: 6,
    include: {
      author: { select: { displayName: true } },
      categories: {
        include: { category: { select: { name: true, slug: true } } },
      },
    },
  });
}

async function getLatestWikiArticles() {
  return prisma.wikiArticle.findMany({
    where: { status: "PUBLISHED" },
    orderBy: { publishedAt: "desc" },
    take: 5,
    include: {
      category: { select: { name: true, slug: true, icon: true } },
    },
  });
}

export default async function HomePage() {
  const showPodcast = process.env.NEXT_PUBLIC_SHOW_PODCAST === "true";
  const [featuredPost, recentPosts, wikiArticles] = await Promise.all([
    getFeaturedPost(),
    getRecentPosts(),
    getLatestWikiArticles(),
  ]);

  return (
    <div className={styles.page}>
      <div className={`${styles.pageLayout} ${!showPodcast ? styles.pageLayoutFull : ''}`}>
        {/* Main Content */}
        <main className={styles.mainContent}>
          {/* Featured Post */}
          {featuredPost && (
            <section className={styles.section}>
              <PostCard post={featuredPost} variant="featured" />
            </section>
          )}

          {/* Recent Posts */}
          <section className={styles.section}>
            <div className={styles.sectionHeader}>
              <h2 className={styles.sectionTitle}>Recentes</h2>
              <Link href="/blog" className={styles.viewAll}>
                Ver todos <ArrowRight size={14} />
              </Link>
            </div>
            <div className={styles.postsGrid}>
              {recentPosts.map((post) => (
                <PostCard key={post.id} post={post} />
              ))}
            </div>
          </section>

          {/* Wiki */}
          <section className={styles.section}>
            <div className={styles.sectionHeader}>
              <h2 className={styles.sectionTitle}>Wiki Jurídica</h2>
              <Link href="/wiki" className={styles.viewAll}>
                Ver todos <ArrowRight size={14} />
              </Link>
            </div>
            <p className={styles.sectionDesc}>
              Enciclopédia de termos, conceitos e doutrinas jurídicas.
            </p>
            <div className={styles.wikiList}>
              {wikiArticles.map((article) => (
                <Link
                  key={article.id}
                  href={`/wiki/${article.slug}`}
                  className={styles.wikiItem}
                >
                  <span className={styles.wikiTitle}>{article.title}</span>
                  {article.category && (
                    <span className={styles.wikiCategory}>
                      {article.category.name}
                    </span>
                  )}
                </Link>
              ))}
            </div>
          </section>
        </main>

        {/* Sidebar - Desktop */}
        {showPodcast && (
          <aside className={styles.sidebar}>
            <PodcastSidebar />
          </aside>
        )}
      </div>

      {/* Podcast Banner - Mobile */}
      {showPodcast && (
        <div className={styles.mobilePodcastBanner}>
          <PodcastSidebar />
        </div>
      )}
    </div>
  );
}
