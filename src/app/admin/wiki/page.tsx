import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { Plus, Pencil, Trash2, ExternalLink } from "lucide-react";
import { formatDate } from "@/lib/utils";
import { DeleteWikiButton } from "./DeleteWikiButton";
import { CategoryFilter } from "./CategoryFilter";
import styles from "./page.module.css";

interface WikiPageProps {
  searchParams: Promise<{
    status?: string;
    page?: string;
    categoria?: string;
  }>;
}

async function getArticles(
  status?: string,
  page: number = 1,
  categorySlug?: string,
) {
  const take = 20;
  const skip = (page - 1) * take;

  const where = {
    ...(status && status !== "all"
      ? { status: status as "PUBLISHED" | "DRAFT" }
      : {}),
    ...(categorySlug ? { category: { slug: categorySlug } } : {}),
  };

  const [articles, total] = await Promise.all([
    prisma.wikiArticle.findMany({
      where,
      orderBy: { updatedAt: "desc" },
      skip,
      take,
      include: {
        author: { select: { displayName: true } },
        category: { select: { name: true, slug: true } },
      },
    }),
    prisma.wikiArticle.count({ where }),
  ]);

  return { articles, total, pages: Math.ceil(total / take) };
}

async function getCategories() {
  return prisma.wikiCategory.findMany({ orderBy: { name: "asc" } });
}

export default async function WikiPage({ searchParams }: WikiPageProps) {
  const params = await searchParams;
  const status = params.status || "all";
  const page = parseInt(params.page || "1");
  const categorySlug = params.categoria;

  const [{ articles, total, pages }, categories] = await Promise.all([
    getArticles(status, page, categorySlug),
    getCategories(),
  ]);

  return (
    <div className={styles.page}>
      <div className="admin-page-header">
        <div>
          <h1 className="admin-page-title">Wiki</h1>
          <p className="admin-page-subtitle">{total} artigos</p>
        </div>
        <div style={{ display: "flex", gap: "var(--spacing-sm)" }}>
          <Link
            href="/admin/wiki/categorias"
            className="admin-btn admin-btn-secondary"
          >
            Categorias
          </Link>
          <Link href="/admin/wiki/novo" className="admin-btn admin-btn-primary">
            <Plus size={16} />
            Novo Artigo
          </Link>
        </div>
      </div>

      {/* Filters */}
      <div className={styles.filters}>
        <div className={styles.tabs}>
          <Link
            href="/admin/wiki"
            className={`${styles.tab} ${status === "all" ? styles.tabActive : ""}`}
          >
            Todos
          </Link>
          <Link
            href="/admin/wiki?status=PUBLISHED"
            className={`${styles.tab} ${status === "PUBLISHED" ? styles.tabActive : ""}`}
          >
            Publicados
          </Link>
          <Link
            href="/admin/wiki?status=DRAFT"
            className={`${styles.tab} ${status === "DRAFT" ? styles.tabActive : ""}`}
          >
            Rascunhos
          </Link>
        </div>

        <CategoryFilter
          categories={categories}
          currentCategory={categorySlug}
        />
      </div>

      {/* Table */}
      <div className="admin-card">
        {articles.length === 0 ? (
          <div className="admin-empty">
            <p className="admin-empty-text">Nenhum artigo encontrado.</p>
            <Link
              href="/admin/wiki/novo"
              className="admin-btn admin-btn-primary"
            >
              <Plus size={16} />
              Criar primeiro artigo
            </Link>
          </div>
        ) : (
          <table className="admin-table">
            <thead>
              <tr>
                <th>Título</th>
                <th>Categoria</th>
                <th>Autor</th>
                <th>Status</th>
                <th>Views</th>
                <th>Data</th>
                <th>Ações</th>
              </tr>
            </thead>
            <tbody>
              {articles.map((article) => (
                <tr key={article.id}>
                  <td>
                    <Link
                      href={`/admin/wiki/${article.id}`}
                      className={styles.articleTitle}
                    >
                      {article.title}
                    </Link>
                  </td>
                  <td className={styles.cellMuted}>
                    {article.category?.name || "-"}
                  </td>
                  <td className={styles.cellMuted}>
                    {article.author.displayName}
                  </td>
                  <td>
                    <span
                      className={`admin-badge ${
                        article.status === "PUBLISHED"
                          ? "admin-badge-success"
                          : "admin-badge-warning"
                      }`}
                    >
                      {article.status === "PUBLISHED"
                        ? "Publicado"
                        : "Rascunho"}
                    </span>
                  </td>
                  <td className={styles.cellMuted}>
                    {article.viewCount.toLocaleString("pt-BR")}
                  </td>
                  <td className={styles.cellMuted}>
                    {formatDate(article.publishedAt || article.createdAt)}
                  </td>
                  <td>
                    <div className="admin-table-actions">
                      {article.status === "PUBLISHED" && (
                        <Link
                          href={`/wiki/${article.slug}`}
                          target="_blank"
                          className="admin-btn admin-btn-sm admin-btn-secondary"
                        >
                          <ExternalLink size={14} />
                        </Link>
                      )}
                      <Link
                        href={`/admin/wiki/${article.id}`}
                        className="admin-btn admin-btn-sm admin-btn-secondary"
                      >
                        <Pencil size={14} />
                      </Link>
                      <DeleteWikiButton
                        articleId={article.id}
                        articleTitle={article.title}
                      />
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}

        {/* Pagination */}
        {pages > 1 && (
          <div className={styles.pagination}>
            {Array.from({ length: pages }, (_, i) => i + 1).map((p) => (
              <Link
                key={p}
                href={`/admin/wiki?status=${status}&page=${p}${
                  categorySlug ? `&categoria=${categorySlug}` : ""
                }`}
                className={`${styles.pageLink} ${p === page ? styles.pageLinkActive : ""}`}
              >
                {p}
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
