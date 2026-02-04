"use client";

import { useEditor, EditorContent, BubbleMenu } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Link from "@tiptap/extension-link";
import Image from "@tiptap/extension-image";
import Placeholder from "@tiptap/extension-placeholder";
import TextAlign from "@tiptap/extension-text-align";
import Underline from "@tiptap/extension-underline";
import TextStyle from "@tiptap/extension-text-style";
import Color from "@tiptap/extension-color";
import Highlight from "@tiptap/extension-highlight";
import CodeBlockLowlight from "@tiptap/extension-code-block-lowlight";
import { common, createLowlight } from "lowlight";
import { useCallback, useEffect } from "react";
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
} from "lucide-react";
import styles from "./RichTextEditor.module.css";

const lowlight = createLowlight(common);

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
  const editor = useEditor({
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
      Image.configure({
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
      onChange(editor.getHTML());
    },
    editorProps: {
      attributes: {
        class: styles.editorContent,
      },
    },
  });

  useEffect(() => {
    if (editor && content !== editor.getHTML()) {
      editor.commands.setContent(content);
    }
  }, [content, editor]);

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
    if (!editor) return;

    const url = window.prompt("URL da imagem:");

    if (url) {
      editor.chain().focus().setImage({ src: url }).run();
    }
  }, [editor]);

  if (!editor) {
    return (
      <div className={styles.loading}>
        <div className={styles.loadingSpinner} />
        Carregando editor...
      </div>
    );
  }

  return (
    <div className={styles.editor}>
      {/* Toolbar */}
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
            onClick={() =>
              editor.chain().focus().toggleHeading({ level: 1 }).run()
            }
            className={`${styles.toolbarButton} ${editor.isActive("heading", { level: 1 }) ? styles.active : ""}`}
            title="Título 1"
          >
            <Heading1 size={18} />
          </button>
          <button
            type="button"
            onClick={() =>
              editor.chain().focus().toggleHeading({ level: 2 }).run()
            }
            className={`${styles.toolbarButton} ${editor.isActive("heading", { level: 2 }) ? styles.active : ""}`}
            title="Título 2"
          >
            <Heading2 size={18} />
          </button>
          <button
            type="button"
            onClick={() =>
              editor.chain().focus().toggleHeading({ level: 3 }).run()
            }
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

      {/* Bubble Menu */}
      <BubbleMenu
        editor={editor}
        tippyOptions={{ duration: 100 }}
        className={styles.bubbleMenu}
      >
        <button
          type="button"
          onClick={() => editor.chain().focus().toggleBold().run()}
          className={`${styles.bubbleButton} ${editor.isActive("bold") ? styles.active : ""}`}
        >
          <Bold size={14} />
        </button>
        <button
          type="button"
          onClick={() => editor.chain().focus().toggleItalic().run()}
          className={`${styles.bubbleButton} ${editor.isActive("italic") ? styles.active : ""}`}
        >
          <Italic size={14} />
        </button>
        <button
          type="button"
          onClick={() => editor.chain().focus().toggleUnderline().run()}
          className={`${styles.bubbleButton} ${editor.isActive("underline") ? styles.active : ""}`}
        >
          <UnderlineIcon size={14} />
        </button>
        <button
          type="button"
          onClick={setLink}
          className={`${styles.bubbleButton} ${editor.isActive("link") ? styles.active : ""}`}
        >
          <LinkIcon size={14} />
        </button>
      </BubbleMenu>

      {/* Editor Content */}
      <EditorContent editor={editor} className={styles.editorWrapper} />

      {/* Word Count */}
      <div className={styles.footer}>
        <span>
          {editor.storage.characterCount?.characters?.() ||
            editor.getText().length}{" "}
          caracteres
        </span>
        <span>•</span>
        <span>
          {editor.storage.characterCount?.words?.() ||
            editor.getText().split(/\s+/).filter(Boolean).length}{" "}
          palavras
        </span>
      </div>
    </div>
  );
}
