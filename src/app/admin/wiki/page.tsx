import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { Plus, Pencil, ExternalLink, ChevronUp, ChevronDown, ChevronsUpDown, ChevronLeft, ChevronRight } from "lucide-react";
import { formatDate } from "@/lib/utils";
import { DeleteWikiButton } from "./DeleteWikiButton";
import { CategoryFilter } from "./CategoryFilter";
import styles from "./page.module.css";

interface WikiPageProps {
  searchParams: Promise<{
    status?: string;
    page?: string;
    categoria?: string;
    sort?: string;
    order?: string;
  }>;
}

type SortField = "title" | "category" | "author" | "status" | "views" | "date";
type SortOrder = "asc" | "desc";

function getOrderBy(sort: SortField, order: SortOrder) {
  switch (sort) {
    case "title": return { title: order };
    case "category": return { category: { name: order } };
    case "author": return { author: { displayName: order } };
    case "status": return { status: order };
    case "views": return { viewCount: order };
    case "date": return { updatedAt: order };
    default: return { updatedAt: "desc" as const };
  }
}

async function getArticles(
  status?: string,
  page: number = 1,
  categorySlug?: string,
  sort: SortField = "date",
  order: SortOrder = "desc",
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
      orderBy: getOrderBy(sort, order) as any,
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

function getPaginationPages(current: number, total: number): (number | "ellipsis")[] {
  if (total <= 7) return Array.from({ length: total }, (_, i) => i + 1);

  const pages: (number | "ellipsis")[] = [];
  pages.push(1);

  if (current <= 3) {
    for (let i = 2; i <= Math.min(5, total - 1); i++) pages.push(i);
    if (total > 6) pages.push("ellipsis");
  } else if (current >= total - 2) {
    pages.push("ellipsis");
    for (let i = Math.max(total - 4, 2); i < total; i++) pages.push(i);
  } else {
    pages.push("ellipsis");
    for (let i = current - 1; i <= current + 1; i++) pages.push(i);
    pages.push("ellipsis");
  }

  pages.push(total);
  return pages;
}

function SortHeader({ label, field, currentSort, currentOrder, baseHref }: {
  label: string;
  field: SortField;
  currentSort: SortField;
  currentOrder: SortOrder;
  baseHref: string;
}) {
  const isActive = currentSort === field;
  const nextOrder = isActive && currentOrder === "asc" ? "desc" : isActive && currentOrder === "desc" ? "asc" : "asc";
  const href = `${baseHref}&sort=${field}&order=${nextOrder}`;

  return (
    <th>
      <Link href={href} className={styles.sortHeader}>
        {label}
        <span className={styles.sortIcon}>
          {isActive ? (
            currentOrder === "asc" ? <ChevronUp size={14} /> : <ChevronDown size={14} />
          ) : (
            <ChevronsUpDown size={14} />
          )}
        </span>
      </Link>
    </th>
  );
}

export default async function WikiPage({ searchParams }: WikiPageProps) {
  const params = await searchParams;
  const status = params.status || "all";
  const page = parseInt(params.page || "1");
  const categorySlug = params.categoria;
  const sort = (params.sort as SortField) || "date";
  const order = (params.order as SortOrder) || "desc";

  const [{ articles, total, pages }, categories] = await Promise.all([
    getArticles(status, page, categorySlug, sort, order),
    getCategories(),
  ]);

  const baseHref = `/admin/wiki?status=${status}${categorySlug ? `&categoria=${categorySlug}` : ""}`;
  const paginationPages = getPaginationPages(page, pages);

  function pageHref(p: number) {
    return `${baseHref}&page=${p}&sort=${sort}&order=${order}`;
  }

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
          <div className="admin-table-container">
            <table className="admin-table">
              <thead>
                <tr>
                  <SortHeader label="Título" field="title" currentSort={sort} currentOrder={order} baseHref={baseHref} />
                  <SortHeader label="Categoria" field="category" currentSort={sort} currentOrder={order} baseHref={baseHref} />
                  <SortHeader label="Autor" field="author" currentSort={sort} currentOrder={order} baseHref={baseHref} />
                  <SortHeader label="Status" field="status" currentSort={sort} currentOrder={order} baseHref={baseHref} />
                  <SortHeader label="Views" field="views" currentSort={sort} currentOrder={order} baseHref={baseHref} />
                  <SortHeader label="Data" field="date" currentSort={sort} currentOrder={order} baseHref={baseHref} />
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
          </div>
        )}

        {/* Pagination */}
        {pages > 1 && (
          <div className={styles.pagination}>
            <Link
              href={pageHref(Math.max(1, page - 1))}
              className={`${styles.pageLink} ${styles.pageNav} ${page <= 1 ? styles.pageDisabled : ""}`}
              aria-disabled={page <= 1}
              tabIndex={page <= 1 ? -1 : undefined}
            >
              <ChevronLeft size={14} />
            </Link>

            {paginationPages.map((p, i) =>
              p === "ellipsis" ? (
                <span key={`ellipsis-${i}`} className={styles.pageEllipsis}>...</span>
              ) : (
                <Link
                  key={p}
                  href={pageHref(p)}
                  className={`${styles.pageLink} ${p === page ? styles.pageLinkActive : ""}`}
                >
                  {p}
                </Link>
              )
            )}

            <Link
              href={pageHref(Math.min(pages, page + 1))}
              className={`${styles.pageLink} ${styles.pageNav} ${page >= pages ? styles.pageDisabled : ""}`}
              aria-disabled={page >= pages}
              tabIndex={page >= pages ? -1 : undefined}
            >
              <ChevronRight size={14} />
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}
