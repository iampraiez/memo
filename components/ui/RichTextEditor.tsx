"use client";

import { useEditor, EditorContent, Editor } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Link from "@tiptap/extension-link";
import Underline from "@tiptap/extension-underline";
import Placeholder from "@tiptap/extension-placeholder";
import TextAlign from "@tiptap/extension-text-align";
import {
  TextItalic,
  TextB,
  TextUnderline,
  ListBullets,
  ListNumbers,
  TextAlignCenter,
  TextAlignLeft,
  Link as LinkIcon,
} from "@phosphor-icons/react";

interface RichTextEditorProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  className?: string;
}

const MenuBar = ({ editor }: { editor: Editor | null }) => {
  if (!editor) return null;

  const setLink = () => {
    const previousUrl = editor.getAttributes("link").href;
    const url = window.prompt("URL", previousUrl);

    if (url === null) return;
    if (url === "") {
      editor.chain().focus().extendMarkRange("link").unsetLink().run();
      return;
    }
    editor.chain().focus().extendMarkRange("link").setLink({ href: url }).run();
  };

  const buttons = [
    {
      icon: <TextB size={18} weight={editor.isActive("bold") ? "bold" : "regular"} />,
      onClick: () => editor.chain().focus().toggleBold().run(),
      active: editor.isActive("bold"),
      title: "Bold",
    },
    {
      icon: <TextItalic size={18} weight={editor.isActive("italic") ? "bold" : "regular"} />,
      onClick: () => editor.chain().focus().toggleItalic().run(),
      active: editor.isActive("italic"),
      title: "Italic",
    },
    {
      icon: <TextUnderline size={18} weight={editor.isActive("underline") ? "bold" : "regular"} />,
      onClick: () => editor.chain().focus().toggleUnderline().run(),
      active: editor.isActive("underline"),
      title: "Underline",
    },
    { type: "divider" },
    {
      icon: <ListBullets size={18} weight={editor.isActive("bulletList") ? "bold" : "regular"} />,
      onClick: () => editor.chain().focus().toggleBulletList().run(),
      active: editor.isActive("bulletList"),
      title: "Bullet List",
    },
    {
      icon: <ListNumbers size={18} weight={editor.isActive("orderedList") ? "bold" : "regular"} />,
      onClick: () => editor.chain().focus().toggleOrderedList().run(),
      active: editor.isActive("orderedList"),
      title: "Numbered List",
    },
    { type: "divider" },
    {
      icon: (
        <TextAlignLeft
          size={18}
          weight={editor.isActive({ textAlign: "left" }) ? "bold" : "regular"}
        />
      ),
      onClick: () => editor.chain().focus().setTextAlign("left").run(),
      active: editor.isActive({ textAlign: "left" }),
      title: "Align Left",
    },
    {
      icon: (
        <TextAlignCenter
          size={18}
          weight={editor.isActive({ textAlign: "center" }) ? "bold" : "regular"}
        />
      ),
      onClick: () => editor.chain().focus().setTextAlign("center").run(),
      active: editor.isActive({ textAlign: "center" }),
      title: "Align Center",
    },
    {
      icon: <LinkIcon size={18} weight={editor.isActive("link") ? "bold" : "regular"} />,
      onClick: setLink,
      active: editor.isActive("link"),
      title: "Link",
    },
  ];

  return (
    <div className="flex flex-wrap items-center gap-1 border-b border-neutral-100 bg-neutral-50/50 p-2">
      {buttons.map((btn, i) =>
        btn.type === "divider" ? (
          <div key={i} className="mx-1 h-6 w-px bg-neutral-200" />
        ) : (
          <button
            key={i}
            onClick={(e) => {
              e.preventDefault();
              btn.onClick?.();
            }}
            title={btn.title}
            className={`flex h-8 w-8 items-center justify-center rounded-lg transition-all ${
              btn.active
                ? "bg-primary-100 text-primary-700 shadow-sm"
                : "text-neutral-500 hover:bg-neutral-100 hover:text-neutral-900"
            }`}
          >
            {btn.icon}
          </button>
        ),
      )}
    </div>
  );
};

export default function RichTextEditor({
  value,
  onChange,
  placeholder,
  className,
}: RichTextEditorProps) {
  const editor = useEditor({
    immediatelyRender: false,
    extensions: [
      StarterKit,
      Underline,
      TextAlign.configure({
        types: ["heading", "paragraph"],
      }),
      Link.configure({
        openOnClick: false,
      }),
      Placeholder.configure({
        placeholder: placeholder || "Start writing your story...",
      }),
    ],
    content: value,
    onUpdate: ({ editor }) => {
      onChange(editor.getHTML());
    },
    editorProps: {
      attributes: {
        class:
          "prose prose-neutral focus:outline-none max-w-none min-h-[200px] p-4 font-serif text-lg leading-relaxed",
      },
    },
  });

  return (
    <div
      className={`focus-within:border-primary-300 focus-within:ring-primary-100 overflow-hidden rounded-xl border border-neutral-200 bg-white transition-all focus-within:ring-2 ${className}`}
    >
      <MenuBar editor={editor} />
      <EditorContent editor={editor} />
    </div>
  );
}
