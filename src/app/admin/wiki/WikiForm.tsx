"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Save, Eye, ArrowLeft, Loader2 } from "lucide-react";
import { slugify } from "@/lib/utils";
import { createWikiArticle, updateWikiArticle } from "./actions";
import { RichTextEditor } from "@/components/editor";
import styles from "./WikiForm.module.css";

interface WikiFormProps {
  article?: {
    id: number;
    title: string;
    slug: string;
    content: string;
    summary: string | null;
    status: "DRAFT" | "PUBLISHED";
    categoryId: number | null;
    parentId: number | null;
    order: number;
  };
  categories: { id: number; name: string }[];
  articles: { id: number; title: string }[];
}

export function WikiForm({ article, categories, articles }: WikiFormProps) {
  const router = useRouter();
  const isEditing = !!article;

  const [title, setTitle] = useState(article?.title || "");
  const [slug, setSlug] = useState(article?.slug || "");
  const [content, setContent] = useState(article?.content || "");
  const [summary, setSummary] = useState(article?.summary || "");
  const [status, setStatus] = useState<"DRAFT" | "PUBLISHED">(
    article?.status || "DRAFT",
  );
  const [categoryId, setCategoryId] = useState<number | null>(
    article?.categoryId || null,
  );
  const [parentId, setParentId] = useState<number | null>(
    article?.parentId || null,
  );
  const [order, setOrder] = useState(article?.order || 0);

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");

  const handleTitleChange = (value: string) => {
    setTitle(value);
    if (!isEditing || slug === slugify(article.title)) {
      setSlug(slugify(value));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setIsSubmitting(true);

    const data = {
      title,
      slug,
      content,
      summary: summary || undefined,
      status,
      categoryId,
      parentId,
      order,
    };

    try {
      const result = isEditing
        ? await updateWikiArticle(article.id, data)
        : await createWikiArticle(data);

      if (result.success) {
        if (isEditing) {
          router.refresh();
        } else {
          router.push("/admin/wiki");
        }
      } else {
        setError(result.error || "Erro ao salvar");
      }
    } catch {
      setError("Erro ao salvar");
    } finally {
      setIsSubmitting(false);
    }
  };

  // Filter out current article from parent options
  const parentOptions = articles.filter((a) => a.id !== article?.id);

  return (
    <form onSubmit={handleSubmit} className={styles.form}>
      <div className={styles.layout}>
        {/* Main Content */}
        <div className={styles.main}>
          <div className="admin-card">
            {error && <div className={styles.error}>{error}</div>}

            <div className="admin-form-group">
              <label className="admin-form-label">Título</label>
              <input
                type="text"
                value={title}
                onChange={(e) => handleTitleChange(e.target.value)}
                className="admin-form-input"
                required
              />
            </div>

            <div className="admin-form-group">
              <label className="admin-form-label">Slug</label>
              <input
                type="text"
                value={slug}
                onChange={(e) => setSlug(slugify(e.target.value))}
                className="admin-form-input"
                required
              />
              <span className="admin-form-hint">
                URL: /wiki/{slug || "url-do-artigo"}
              </span>
            </div>

            <div className="admin-form-group">
              <label className="admin-form-label">Resumo</label>
              <textarea
                value={summary}
                onChange={(e) => setSummary(e.target.value)}
                className="admin-form-textarea"
                rows={3}
                placeholder="Breve resumo do artigo"
              />
            </div>

            <div className="admin-form-group">
              <label className="admin-form-label">Conteúdo</label>
              <RichTextEditor
                content={content}
                onChange={setContent}
                placeholder="Comece a escrever o conteúdo do artigo..."
              />
            </div>
          </div>
        </div>

        {/* Sidebar */}
        <div className={styles.sidebar}>
          {/* Publish */}
          <div className="admin-card">
            <h3 className={styles.sidebarTitle}>Publicar</h3>

            <div className="admin-form-group">
              <label className="admin-form-label">Status</label>
              <select
                value={status}
                onChange={(e) =>
                  setStatus(e.target.value as "DRAFT" | "PUBLISHED")
                }
                className="admin-form-select"
              >
                <option value="DRAFT">Rascunho</option>
                <option value="PUBLISHED">Publicado</option>
              </select>
            </div>

            <div className={styles.actions}>
              <button
                type="submit"
                className="admin-btn admin-btn-primary"
                disabled={isSubmitting}
              >
                {isSubmitting ? (
                  <>
                    <Loader2 size={16} className="animate-spin" />
                    Salvando...
                  </>
                ) : (
                  <>
                    <Save size={16} />
                    {isEditing ? "Atualizar" : "Salvar"}
                  </>
                )}
              </button>
            </div>
          </div>

          {/* Category */}
          <div className="admin-card">
            <h3 className={styles.sidebarTitle}>Categoria</h3>
            <select
              value={categoryId || ""}
              onChange={(e) =>
                setCategoryId(e.target.value ? parseInt(e.target.value) : null)
              }
              className="admin-form-select"
            >
              <option value="">Sem categoria</option>
              {categories.map((cat) => (
                <option key={cat.id} value={cat.id}>
                  {cat.name}
                </option>
              ))}
            </select>
          </div>

          {/* Hierarchy */}
          <div className="admin-card">
            <h3 className={styles.sidebarTitle}>Hierarquia</h3>

            <div className="admin-form-group">
              <label className="admin-form-label">Artigo Pai</label>
              <select
                value={parentId || ""}
                onChange={(e) =>
                  setParentId(e.target.value ? parseInt(e.target.value) : null)
                }
                className="admin-form-select"
              >
                <option value="">Nenhum (raiz)</option>
                {parentOptions.map((a) => (
                  <option key={a.id} value={a.id}>
                    {a.title}
                  </option>
                ))}
              </select>
            </div>

            <div className="admin-form-group">
              <label className="admin-form-label">Ordem</label>
              <input
                type="number"
                value={order}
                onChange={(e) => setOrder(parseInt(e.target.value) || 0)}
                className="admin-form-input"
                min={0}
              />
            </div>
          </div>
        </div>
      </div>

      <div className={styles.footer}>
        <Link href="/admin/wiki" className="admin-btn admin-btn-secondary">
          <ArrowLeft size={16} />
          Voltar
        </Link>
      </div>
    </form>
  );
}
