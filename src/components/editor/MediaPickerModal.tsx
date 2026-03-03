"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import {
  X,
  Search,
  Upload,
  ImageIcon,
  Film,
  Loader2,
  Check,
} from "lucide-react";
import styles from "./MediaPickerModal.module.css";

interface MediaItem {
  id: number;
  filename: string;
  url: string;
  mimeType: string;
  size: number;
  width: number | null;
  height: number | null;
  type: "IMAGE" | "VIDEO";
  title: string | null;
  altText: string | null;
  caption: string | null;
  description: string | null;
}

interface MediaPickerModalProps {
  onSelect: (data: { url: string; alt?: string; title?: string }) => void;
  onClose: () => void;
}

export function MediaPickerModal({ onSelect, onClose }: MediaPickerModalProps) {
  const [tab, setTab] = useState<"library" | "upload">("library");
  const [media, setMedia] = useState<MediaItem[]>([]);
  const [search, setSearch] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [selected, setSelected] = useState<MediaItem | null>(null);

  // Upload state
  const [file, setFile] = useState<File | null>(null);
  const [filePreview, setFilePreview] = useState<string | null>(null);
  const [filename, setFilename] = useState("");
  const [title, setTitle] = useState("");
  const [altText, setAltText] = useState("");
  const [caption, setCaption] = useState("");
  const [description, setDescription] = useState("");
  const [isUploading, setIsUploading] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  // Fetch library
  const fetchMedia = useCallback(async () => {
    setIsLoading(true);
    try {
      const params = new URLSearchParams({
        type: "IMAGE",
        limit: "50",
      });
      if (search) params.set("search", search);

      const res = await fetch(`/api/media?${params}`);
      if (res.ok) {
        const data = await res.json();
        setMedia(data.items);
      }
    } catch (err) {
      console.error("Erro ao buscar mídia:", err);
    }
    setIsLoading(false);
  }, [search]);

  useEffect(() => {
    if (tab === "library") {
      const timer = setTimeout(fetchMedia, 300);
      return () => clearTimeout(timer);
    }
  }, [tab, fetchMedia]);

  // File change handler
  const handleFileChange = useCallback(
    (files: FileList | null) => {
      if (!files || files.length === 0) return;
      const f = files[0];
      setFile(f);
      setFilename(f.name);

      if (f.type.startsWith("image/")) {
        const url = URL.createObjectURL(f);
        setFilePreview(url);
      }
    },
    []
  );

  // Upload and insert
  const handleUpload = async () => {
    if (!file) return;

    setIsUploading(true);
    try {
      const formData = new FormData();
      formData.append("file", file);
      formData.append("filename", filename);
      if (title) formData.append("title", title);
      if (altText) formData.append("altText", altText);
      if (caption) formData.append("caption", caption);
      if (description) formData.append("description", description);

      const res = await fetch("/api/media/upload", {
        method: "POST",
        body: formData,
      });

      if (res.ok) {
        const uploaded = await res.json();
        onSelect({
          url: uploaded.url,
          alt: uploaded.altText || altText,
          title: uploaded.title || title,
        });
      }
    } catch (err) {
      console.error("Erro no upload:", err);
    }
    setIsUploading(false);
  };

  // Insert from library
  const handleInsertFromLibrary = () => {
    if (!selected) return;
    onSelect({
      url: selected.url,
      alt: selected.altText || undefined,
      title: selected.title || undefined,
    });
  };

  return (
    <div className={styles.overlay} onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div className={styles.modal}>
        <div className={styles.header}>
          <h2 className={styles.title}>Inserir Imagem</h2>
          <button className={styles.closeBtn} onClick={onClose}>
            <X size={20} />
          </button>
        </div>

        <div className={styles.tabs}>
          <button
            className={`${styles.tab} ${tab === "library" ? styles.tabActive : ""}`}
            onClick={() => setTab("library")}
          >
            <ImageIcon size={16} />
            Biblioteca
          </button>
          <button
            className={`${styles.tab} ${tab === "upload" ? styles.tabActive : ""}`}
            onClick={() => setTab("upload")}
          >
            <Upload size={16} />
            Upload
          </button>
        </div>

        <div className={styles.body}>
          {tab === "library" ? (
            <>
              <div className={styles.searchBar}>
                <Search size={16} />
                <input
                  type="text"
                  placeholder="Buscar imagens..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className={styles.searchInput}
                />
              </div>

              {isLoading ? (
                <div className={styles.loadingState}>
                  <Loader2 size={24} style={{ animation: "spin 1s linear infinite" }} />
                </div>
              ) : media.length === 0 ? (
                <div className={styles.emptyState}>
                  <ImageIcon size={32} style={{ opacity: 0.3 }} />
                  <p>Nenhuma imagem encontrada</p>
                </div>
              ) : (
                <div className={styles.grid}>
                  {media.map((item) => (
                    <div
                      key={item.id}
                      className={`${styles.gridItem} ${selected?.id === item.id ? styles.gridItemSelected : ""}`}
                      onClick={() => setSelected(item)}
                    >
                      <img src={item.url} alt={item.filename} />
                      {selected?.id === item.id && (
                        <div className={styles.gridItemCheck}>
                          <Check size={16} />
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}

              {selected && (
                <div className={styles.selectedInfo}>
                  <span className={styles.selectedName}>{selected.filename}</span>
                  {selected.width && selected.height && (
                    <span className={styles.selectedMeta}>
                      {selected.width}×{selected.height}
                    </span>
                  )}
                </div>
              )}
            </>
          ) : (
            <div className={styles.uploadArea}>
              {!file ? (
                <div
                  className={styles.dropZone}
                  onClick={() => inputRef.current?.click()}
                  onDrop={(e) => {
                    e.preventDefault();
                    handleFileChange(e.dataTransfer.files);
                  }}
                  onDragOver={(e) => e.preventDefault()}
                >
                  <Upload size={32} style={{ color: "var(--color-text-muted)" }} />
                  <p>Arraste uma imagem ou clique para selecionar</p>
                  <input
                    ref={inputRef}
                    type="file"
                    accept="image/*"
                    onChange={(e) => handleFileChange(e.target.files)}
                    style={{ display: "none" }}
                  />
                </div>
              ) : (
                <div className={styles.uploadForm}>
                  {filePreview && (
                    <div className={styles.uploadPreview}>
                      <img src={filePreview} alt="Preview" />
                    </div>
                  )}
                  <div className={styles.uploadFields}>
                    <div className={styles.field}>
                      <label>Nome do arquivo</label>
                      <input
                        type="text"
                        value={filename}
                        onChange={(e) => setFilename(e.target.value)}
                        className="admin-form-input"
                      />
                    </div>
                    <div className={styles.field}>
                      <label>Título</label>
                      <input
                        type="text"
                        value={title}
                        onChange={(e) => setTitle(e.target.value)}
                        placeholder="Título da imagem"
                        className="admin-form-input"
                      />
                    </div>
                    <div className={styles.field}>
                      <label>Texto alternativo</label>
                      <input
                        type="text"
                        value={altText}
                        onChange={(e) => setAltText(e.target.value)}
                        placeholder="Descrição para acessibilidade"
                        className="admin-form-input"
                      />
                    </div>
                    <div className={styles.field}>
                      <label>Legenda</label>
                      <input
                        type="text"
                        value={caption}
                        onChange={(e) => setCaption(e.target.value)}
                        placeholder="Legenda abaixo da imagem"
                        className="admin-form-input"
                      />
                    </div>
                    <button
                      className={styles.changeFileBtn}
                      onClick={() => {
                        setFile(null);
                        setFilePreview(null);
                        setFilename("");
                      }}
                    >
                      Trocar arquivo
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        <div className={styles.footer}>
          <button className="admin-btn admin-btn-secondary" onClick={onClose}>
            Cancelar
          </button>
          {tab === "library" ? (
            <button
              className="admin-btn admin-btn-primary"
              disabled={!selected}
              onClick={handleInsertFromLibrary}
            >
              Inserir
            </button>
          ) : (
            <button
              className="admin-btn admin-btn-primary"
              disabled={!file || isUploading}
              onClick={handleUpload}
            >
              {isUploading ? (
                <>
                  <Loader2 size={16} style={{ animation: "spin 1s linear infinite" }} />
                  Enviando...
                </>
              ) : (
                "Enviar e Inserir"
              )}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
