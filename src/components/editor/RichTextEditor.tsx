"use client";

import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Link from "@tiptap/extension-link";
import TiptapImage from "@tiptap/extension-image";
import Placeholder from "@tiptap/extension-placeholder";
import TextAlign from "@tiptap/extension-text-align";
import Underline from "@tiptap/extension-underline";
import { TextStyle } from "@tiptap/extension-text-style";
import Color from "@tiptap/extension-color";
import Highlight from "@tiptap/extension-highlight";
import CodeBlockLowlight from "@tiptap/extension-code-block-lowlight";
import { common, createLowlight } from "lowlight";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { marked } from "marked";
import TurndownService from "turndown";
import katex from "katex";
import {
  Bold,
  Italic,
  Underline as UnderlineIcon,
  Strikethrough,
  Code,
  Heading1,
  Heading2,
  Heading3,
  List,
  ListOrdered,
  Quote,
  Undo,
  Redo,
  Link as LinkIcon,
  Unlink,
  Image as ImageIcon,
  AlignLeft,
  AlignCenter,
  AlignRight,
  AlignJustify,
  Highlighter,
  Palette,
  FileCode,
  Minus,
  Pilcrow,
  Eye,
  Type,
  CodeXml,
  FileText,
  Sigma,
} from "lucide-react";
import styles from "./RichTextEditor.module.css";
import { MediaPickerModal } from "./MediaPickerModal";

const lowlight = createLowlight(common);

type EditorMode = "visual" | "markdown" | "html" | "latex";

// Custom Image extension with extra attributes
const CustomImage = TiptapImage.extend({
  addAttributes() {
    return {
      ...this.parent?.(),
      caption: { default: null },
      description: { default: null },
    };
  },
});

interface RichTextEditorProps {
  content: string;
  onChange: (content: string) => void;
  placeholder?: string;
}

export function RichTextEditor({
  content,
  onChange,
  placeholder = "Comece a escrever...",
}: RichTextEditorProps) {
  const [mode, setMode] = useState<EditorMode>("visual");
  const [htmlContent, setHtmlContent] = useState(content);
  const [markdownContent, setMarkdownContent] = useState("");
  const [latexContent, setLatexContent] = useState("");
  const [showMediaPicker, setShowMediaPicker] = useState(false);
  const htmlContentRef = useRef(content);
  const turndownService = useMemo(() => new TurndownService({
    headingStyle: "atx",
    codeBlockStyle: "fenced",
  }), []);

  const editor = useEditor({
    immediatelyRender: false,
    extensions: [
      StarterKit.configure({
        codeBlock: false,
        heading: {
          levels: [1, 2, 3, 4],
        },
      }),
      Underline,
      TextStyle,
      Color,
      Highlight.configure({
        multicolor: true,
      }),
      Link.configure({
        openOnClick: false,
        HTMLAttributes: {
          class: "editor-link",
        },
      }),
      CustomImage.configure({
        HTMLAttributes: {
          class: "editor-image",
        },
      }),
      Placeholder.configure({
        placeholder,
      }),
      TextAlign.configure({
        types: ["heading", "paragraph"],
      }),
      CodeBlockLowlight.configure({
        lowlight,
      }),
    ],
    content,
    onUpdate: ({ editor }) => {
      const html = editor.getHTML();
      setHtmlContent(html);
      htmlContentRef.current = html;
      onChange(html);
    },
    editorProps: {
      attributes: {
        class: styles.editorContent,
      },
    },
  });

  useEffect(() => {
    if (editor && mode === "visual" && content !== editor.getHTML()) {
      editor.commands.setContent(content);
      setHtmlContent(content);
    }
  }, [content, editor, mode]);

  // Switch modes
  const switchMode = useCallback(
    (newMode: EditorMode) => {
      if (!editor) return;

      // Save current mode content
      if (mode === "visual") {
        const currentHtml = editor.getHTML();
        htmlContentRef.current = currentHtml;
        setHtmlContent(currentHtml);
      }

      // Prepare new mode content
      if (newMode === "markdown") {
        const html = mode === "visual" ? editor.getHTML() : htmlContentRef.current;
        try {
          setMarkdownContent(turndownService.turndown(html));
        } catch {
          setMarkdownContent(html);
        }
      } else if (newMode === "html") {
        if (mode === "visual") {
          const html = editor.getHTML();
          setHtmlContent(html);
          htmlContentRef.current = html;
        } else if (mode === "markdown") {
          const html = marked.parse(markdownContent, { async: false }) as string;
          setHtmlContent(html);
          htmlContentRef.current = html;
        }
      } else if (newMode === "visual") {
        // Apply content from previous mode to editor
        let html = htmlContentRef.current;
        if (mode === "markdown") {
          html = marked.parse(markdownContent, { async: false }) as string;
        } else if (mode === "html") {
          html = htmlContentRef.current;
        }
        editor.commands.setContent(html);
        onChange(html);
      }
      // LaTeX is independent - no conversion needed

      setMode(newMode);
    },
    [editor, mode, markdownContent, onChange, turndownService]
  );

  const handleHtmlChange = useCallback(
    (e: React.ChangeEvent<HTMLTextAreaElement>) => {
      const val = e.target.value;
      setHtmlContent(val);
      htmlContentRef.current = val;
      onChange(val);
    },
    [onChange]
  );

  const handleMarkdownChange = useCallback(
    (e: React.ChangeEvent<HTMLTextAreaElement>) => {
      const val = e.target.value;
      setMarkdownContent(val);
      const html = marked.parse(val, { async: false }) as string;
      htmlContentRef.current = html;
      onChange(html);
    },
    [onChange]
  );

  const handleLatexChange = useCallback(
    (e: React.ChangeEvent<HTMLTextAreaElement>) => {
      setLatexContent(e.target.value);
    },
    []
  );

  const renderLatexPreview = useMemo(() => {
    if (!latexContent) return "";
    try {
      return katex.renderToString(latexContent, {
        throwOnError: false,
        displayMode: true,
        output: "html",
      });
    } catch {
      return '<span style="color: red;">Erro no LaTeX</span>';
    }
  }, [latexContent]);

  const insertLatexIntoEditor = useCallback(() => {
    if (!editor || !latexContent) return;
    const html = renderLatexPreview;
    editor
      .chain()
      .focus()
      .insertContent(`<div class="latex-block">${html}</div>`)
      .run();
    onChange(editor.getHTML());
    setMode("visual");
  }, [editor, latexContent, renderLatexPreview, onChange]);

  const markdownPreviewHtml = useMemo(() => {
    return marked.parse(markdownContent, { async: false }) as string;
  }, [markdownContent]);

  const setLink = useCallback(() => {
    if (!editor) return;
    const previousUrl = editor.getAttributes("link").href;
    const url = window.prompt("URL do link:", previousUrl);
    if (url === null) return;
    if (url === "") {
      editor.chain().focus().extendMarkRange("link").unsetLink().run();
      return;
    }
    editor.chain().focus().extendMarkRange("link").setLink({ href: url }).run();
  }, [editor]);

  const addImage = useCallback(() => {
    setShowMediaPicker(true);
  }, []);

  const handleMediaSelect = useCallback(
    (mediaData: { url: string; alt?: string; title?: string }) => {
      if (!editor) return;
      editor
        .chain()
        .focus()
        .setImage({ src: mediaData.url, alt: mediaData.alt || "", title: mediaData.title || "" })
        .run();
      setShowMediaPicker(false);
    },
    [editor]
  );

  if (!editor) {
    return (
      <div className={styles.loading}>
        <div className={styles.loadingSpinner} />
        Carregando editor...
      </div>
    );
  }

  const isNonVisual = mode !== "visual";

  return (
    <div className={styles.editor}>
      {/* Mode Tabs */}
      <div className={styles.modeTabs}>
        <button
          type="button"
          className={`${styles.modeTab} ${mode === "visual" ? styles.modeTabActive : ""}`}
          onClick={() => switchMode("visual")}
        >
          <Type size={14} />
          Visual
        </button>
        <button
          type="button"
          className={`${styles.modeTab} ${mode === "markdown" ? styles.modeTabActive : ""}`}
          onClick={() => switchMode("markdown")}
        >
          <FileText size={14} />
          Markdown
        </button>
        <button
          type="button"
          className={`${styles.modeTab} ${mode === "html" ? styles.modeTabActive : ""}`}
          onClick={() => switchMode("html")}
        >
          <CodeXml size={14} />
          HTML
        </button>
        <button
          type="button"
          className={`${styles.modeTab} ${mode === "latex" ? styles.modeTabActive : ""}`}
          onClick={() => switchMode("latex")}
        >
          <Sigma size={14} />
          LaTeX
        </button>
      </div>

      {/* Toolbar - only in visual mode */}
      {mode === "visual" && (
        <div className={styles.toolbar}>
          {/* History */}
          <div className={styles.toolbarGroup}>
            <button
              type="button"
              onClick={() => editor.chain().focus().undo().run()}
              disabled={!editor.can().undo()}
              className={styles.toolbarButton}
              title="Desfazer (Ctrl+Z)"
            >
              <Undo size={18} />
            </button>
            <button
              type="button"
              onClick={() => editor.chain().focus().redo().run()}
              disabled={!editor.can().redo()}
              className={styles.toolbarButton}
              title="Refazer (Ctrl+Y)"
            >
              <Redo size={18} />
            </button>
          </div>

          <div className={styles.toolbarDivider} />

          {/* Text Style */}
          <div className={styles.toolbarGroup}>
            <button
              type="button"
              onClick={() => editor.chain().focus().toggleBold().run()}
              className={`${styles.toolbarButton} ${editor.isActive("bold") ? styles.active : ""}`}
              title="Negrito (Ctrl+B)"
            >
              <Bold size={18} />
            </button>
            <button
              type="button"
              onClick={() => editor.chain().focus().toggleItalic().run()}
              className={`${styles.toolbarButton} ${editor.isActive("italic") ? styles.active : ""}`}
              title="Itálico (Ctrl+I)"
            >
              <Italic size={18} />
            </button>
            <button
              type="button"
              onClick={() => editor.chain().focus().toggleUnderline().run()}
              className={`${styles.toolbarButton} ${editor.isActive("underline") ? styles.active : ""}`}
              title="Sublinhado (Ctrl+U)"
            >
              <UnderlineIcon size={18} />
            </button>
            <button
              type="button"
              onClick={() => editor.chain().focus().toggleStrike().run()}
              className={`${styles.toolbarButton} ${editor.isActive("strike") ? styles.active : ""}`}
              title="Riscado"
            >
              <Strikethrough size={18} />
            </button>
            <button
              type="button"
              onClick={() => editor.chain().focus().toggleCode().run()}
              className={`${styles.toolbarButton} ${editor.isActive("code") ? styles.active : ""}`}
              title="Código inline"
            >
              <Code size={18} />
            </button>
          </div>

          <div className={styles.toolbarDivider} />

          {/* Headings */}
          <div className={styles.toolbarGroup}>
            <button
              type="button"
              onClick={() => editor.chain().focus().setParagraph().run()}
              className={`${styles.toolbarButton} ${editor.isActive("paragraph") ? styles.active : ""}`}
              title="Parágrafo"
            >
              <Pilcrow size={18} />
            </button>
            <button
              type="button"
              onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()}
              className={`${styles.toolbarButton} ${editor.isActive("heading", { level: 1 }) ? styles.active : ""}`}
              title="Título 1"
            >
              <Heading1 size={18} />
            </button>
            <button
              type="button"
              onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
              className={`${styles.toolbarButton} ${editor.isActive("heading", { level: 2 }) ? styles.active : ""}`}
              title="Título 2"
            >
              <Heading2 size={18} />
            </button>
            <button
              type="button"
              onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()}
              className={`${styles.toolbarButton} ${editor.isActive("heading", { level: 3 }) ? styles.active : ""}`}
              title="Título 3"
            >
              <Heading3 size={18} />
            </button>
          </div>

          <div className={styles.toolbarDivider} />

          {/* Alignment */}
          <div className={styles.toolbarGroup}>
            <button
              type="button"
              onClick={() => editor.chain().focus().setTextAlign("left").run()}
              className={`${styles.toolbarButton} ${editor.isActive({ textAlign: "left" }) ? styles.active : ""}`}
              title="Alinhar à esquerda"
            >
              <AlignLeft size={18} />
            </button>
            <button
              type="button"
              onClick={() => editor.chain().focus().setTextAlign("center").run()}
              className={`${styles.toolbarButton} ${editor.isActive({ textAlign: "center" }) ? styles.active : ""}`}
              title="Centralizar"
            >
              <AlignCenter size={18} />
            </button>
            <button
              type="button"
              onClick={() => editor.chain().focus().setTextAlign("right").run()}
              className={`${styles.toolbarButton} ${editor.isActive({ textAlign: "right" }) ? styles.active : ""}`}
              title="Alinhar à direita"
            >
              <AlignRight size={18} />
            </button>
            <button
              type="button"
              onClick={() => editor.chain().focus().setTextAlign("justify").run()}
              className={`${styles.toolbarButton} ${editor.isActive({ textAlign: "justify" }) ? styles.active : ""}`}
              title="Justificar"
            >
              <AlignJustify size={18} />
            </button>
          </div>

          <div className={styles.toolbarDivider} />

          {/* Lists */}
          <div className={styles.toolbarGroup}>
            <button
              type="button"
              onClick={() => editor.chain().focus().toggleBulletList().run()}
              className={`${styles.toolbarButton} ${editor.isActive("bulletList") ? styles.active : ""}`}
              title="Lista com marcadores"
            >
              <List size={18} />
            </button>
            <button
              type="button"
              onClick={() => editor.chain().focus().toggleOrderedList().run()}
              className={`${styles.toolbarButton} ${editor.isActive("orderedList") ? styles.active : ""}`}
              title="Lista numerada"
            >
              <ListOrdered size={18} />
            </button>
            <button
              type="button"
              onClick={() => editor.chain().focus().toggleBlockquote().run()}
              className={`${styles.toolbarButton} ${editor.isActive("blockquote") ? styles.active : ""}`}
              title="Citação"
            >
              <Quote size={18} />
            </button>
            <button
              type="button"
              onClick={() => editor.chain().focus().toggleCodeBlock().run()}
              className={`${styles.toolbarButton} ${editor.isActive("codeBlock") ? styles.active : ""}`}
              title="Bloco de código"
            >
              <FileCode size={18} />
            </button>
            <button
              type="button"
              onClick={() => editor.chain().focus().setHorizontalRule().run()}
              className={styles.toolbarButton}
              title="Linha horizontal"
            >
              <Minus size={18} />
            </button>
          </div>

          <div className={styles.toolbarDivider} />

          {/* Links & Images */}
          <div className={styles.toolbarGroup}>
            <button
              type="button"
              onClick={setLink}
              className={`${styles.toolbarButton} ${editor.isActive("link") ? styles.active : ""}`}
              title="Inserir link"
            >
              <LinkIcon size={18} />
            </button>
            {editor.isActive("link") && (
              <button
                type="button"
                onClick={() => editor.chain().focus().unsetLink().run()}
                className={styles.toolbarButton}
                title="Remover link"
              >
                <Unlink size={18} />
              </button>
            )}
            <button
              type="button"
              onClick={addImage}
              className={styles.toolbarButton}
              title="Inserir imagem"
            >
              <ImageIcon size={18} />
            </button>
          </div>

          <div className={styles.toolbarDivider} />

          {/* Colors */}
          <div className={styles.toolbarGroup}>
            <div className={styles.colorPicker}>
              <button
                type="button"
                className={styles.toolbarButton}
                title="Cor do texto"
              >
                <Palette size={18} />
              </button>
              <input
                type="color"
                onChange={(e) =>
                  editor.chain().focus().setColor(e.target.value).run()
                }
                className={styles.colorInput}
                title="Cor do texto"
              />
            </div>
            <div className={styles.colorPicker}>
              <button
                type="button"
                className={`${styles.toolbarButton} ${editor.isActive("highlight") ? styles.active : ""}`}
                title="Destaque"
              >
                <Highlighter size={18} />
              </button>
              <input
                type="color"
                onChange={(e) =>
                  editor
                    .chain()
                    .focus()
                    .toggleHighlight({ color: e.target.value })
                    .run()
                }
                className={styles.colorInput}
                title="Cor do destaque"
              />
            </div>
          </div>
        </div>
      )}

      {/* Editor Content by Mode */}
      {mode === "visual" && (
        <EditorContent editor={editor} className={styles.editorWrapper} />
      )}

      {mode === "markdown" && (
        <div className={styles.splitView}>
          <textarea
            value={markdownContent}
            onChange={handleMarkdownChange}
            className={styles.splitEditor}
            spellCheck={false}
            placeholder="# Título&#10;&#10;Escreva em Markdown..."
          />
          <div className={styles.splitPreview}>
            <div className={styles.splitPreviewHeader}>
              <Eye size={14} />
              Preview
            </div>
            <div
              className={styles.splitPreviewContent}
              dangerouslySetInnerHTML={{ __html: markdownPreviewHtml }}
            />
          </div>
        </div>
      )}

      {mode === "html" && (
        <div className={styles.splitView}>
          <textarea
            value={htmlContent}
            onChange={handleHtmlChange}
            className={styles.splitEditor}
            spellCheck={false}
            placeholder="<p>Escreva HTML...</p>"
          />
          <div className={styles.splitPreview}>
            <div className={styles.splitPreviewHeader}>
              <Eye size={14} />
              Preview
            </div>
            <div
              className={styles.splitPreviewContent}
              dangerouslySetInnerHTML={{ __html: htmlContent }}
            />
          </div>
        </div>
      )}

      {mode === "latex" && (
        <div className={styles.splitView}>
          <div style={{ display: "flex", flexDirection: "column", minWidth: 0 }}>
            <textarea
              value={latexContent}
              onChange={handleLatexChange}
              className={styles.splitEditor}
              spellCheck={false}
              placeholder="\\frac{a}{b} + \\sqrt{c}"
            />
            <button
              type="button"
              className={`admin-btn admin-btn-primary admin-btn-sm ${styles.latexInsertBtn}`}
              onClick={insertLatexIntoEditor}
              disabled={!latexContent}
            >
              Inserir no editor
            </button>
          </div>
          <div className={styles.splitPreview}>
            <div className={styles.splitPreviewHeader}>
              <Eye size={14} />
              Preview
            </div>
            <div
              className={styles.splitPreviewContent}
              style={{ display: "flex", alignItems: "center", justifyContent: "center", minHeight: "200px" }}
              dangerouslySetInnerHTML={{ __html: renderLatexPreview || '<span style="color: var(--color-text-muted)">Escreva LaTeX para ver o preview</span>' }}
            />
          </div>
        </div>
      )}

      {/* Word Count */}
      <div className={styles.footer}>
        {mode === "visual" ? (
          <>
            <span>
              {editor.storage.characterCount?.characters?.() ||
                editor.getText().length}{" "}
              caracteres
            </span>
            <span>&bull;</span>
            <span>
              {editor.storage.characterCount?.words?.() ||
                editor.getText().split(/\s+/).filter(Boolean).length}{" "}
              palavras
            </span>
          </>
        ) : (
          <span>
            Modo {mode === "markdown" ? "Markdown" : mode === "html" ? "HTML" : "LaTeX"}
          </span>
        )}
      </div>

      {/* Media Picker Modal */}
      {showMediaPicker && (
        <MediaPickerModal
          onSelect={handleMediaSelect}
          onClose={() => setShowMediaPicker(false)}
        />
      )}
    </div>
  );
}
