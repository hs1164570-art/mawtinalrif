"use client";

import type { Editor } from "@tiptap/react";
import { useCallback, useState, useRef, useEffect } from "react";
import { HexColorPicker } from "react-colorful";
import {
  Bold,
  Italic,
  Underline as UnderlineIcon,
  Strikethrough,
  Heading2,
  Heading3,
  Pilcrow,
  List,
  ListOrdered,
  Quote,
  Code2,
  Link2,
  Link2Off,
  AlignRight,
  AlignCenter,
  AlignLeft,
  Undo2,
  Redo2,
  Palette, // إضافة أيقونة الألوان
} from "lucide-react";

function ToolbarButton({
  onClick,
  active,
  disabled,
  label,
  children,
}: {
  onClick: () => void;
  active?: boolean;
  disabled?: boolean;
  label: string;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      aria-label={label}
      title={label}
      className={`w-8 h-8 shrink-0 rounded-[6px] flex items-center justify-center transition-colors duration-150 disabled:opacity-30 disabled:cursor-not-allowed ${
        active ?
          "bg-[var(--gold-bg)] text-[var(--text-inv)]"
        : "text-[var(--text-2)] hover:bg-[var(--bg-deep)] hover:text-[var(--text-1)]"
      }`}
    >
      {children}
    </button>
  );
}

function Divider() {
  return <div className="w-px h-5 bg-[var(--border-md)] mx-1 shrink-0" />;
}

export function FixedToolbar({ editor }: { editor: Editor | null }) {
  const [showColorPicker, setShowColorPicker] = useState(false);
  const colorPickerRef = useRef<HTMLDivElement>(null);

  const setLink = useCallback(() => {
    if (!editor) return;
    const previousUrl = editor.getAttributes("link").href as string | undefined;
    const url = window.prompt("أدخل رابط الوصلة:", previousUrl ?? "https://");
    if (url === null) return;
    if (url === "") {
      editor.chain().focus().extendMarkRange("link").unsetLink().run();
      return;
    }
    editor.chain().focus().extendMarkRange("link").setLink({ href: url }).run();
  }, [editor]);

  // إغلاق نافذة الألوان عند النقر خارجها
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        colorPickerRef.current &&
        !colorPickerRef.current.contains(event.target as Node)
      ) {
        setShowColorPicker(false);
      }
    };
    if (showColorPicker) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [showColorPicker]);

  if (!editor) return null;

  const currentColor = editor.getAttributes("textStyle").color || "#000000";

  return (
    <div
      dir="rtl"
      // تم تغيير overflow-x-auto إلى overflow-visible لتجنب قص نافذة الألوان المنبثقة
      className="sticky top-0 z-10 flex items-center gap-0.5 px-2 sm:px-3 py-2 bg-[var(--surface)] border-b-[1.5px] border-[var(--border-md)] flex-wrap"
    >
      <ToolbarButton
        label="تراجع"
        onClick={() => editor.chain().focus().undo().run()}
        disabled={!editor.can().undo()}
      >
        <Undo2 size={16} />
      </ToolbarButton>
      <ToolbarButton
        label="إعادة"
        onClick={() => editor.chain().focus().redo().run()}
        disabled={!editor.can().redo()}
      >
        <Redo2 size={16} />
      </ToolbarButton>

      <Divider />

      <ToolbarButton
        label="عنوان H2"
        active={editor.isActive("heading", { level: 2 })}
        onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
      >
        <Heading2 size={16} />
      </ToolbarButton>
      <ToolbarButton
        label="عنوان H3"
        active={editor.isActive("heading", { level: 3 })}
        onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()}
      >
        <Heading3 size={16} />
      </ToolbarButton>
      <ToolbarButton
        label="فقرة عادية"
        active={editor.isActive("paragraph")}
        onClick={() => editor.chain().focus().setParagraph().run()}
      >
        <Pilcrow size={16} />
      </ToolbarButton>

      <Divider />

      <ToolbarButton
        label="غامق"
        active={editor.isActive("bold")}
        onClick={() => editor.chain().focus().toggleBold().run()}
      >
        <Bold size={16} />
      </ToolbarButton>
      <ToolbarButton
        label="مائل"
        active={editor.isActive("italic")}
        onClick={() => editor.chain().focus().toggleItalic().run()}
      >
        <Italic size={16} />
      </ToolbarButton>
      <ToolbarButton
        label="تحته خط"
        active={editor.isActive("underline")}
        onClick={() => editor.chain().focus().toggleUnderline().run()}
      >
        <UnderlineIcon size={16} />
      </ToolbarButton>
      <ToolbarButton
        label="يتوسطه خط"
        active={editor.isActive("strike")}
        onClick={() => editor.chain().focus().toggleStrike().run()}
      >
        <Strikethrough size={16} />
      </ToolbarButton>

      {/* ----------- منتقي الألوان ----------- */}
      <div className="relative" ref={colorPickerRef}>
        <ToolbarButton
          label="لون النص"
          active={showColorPicker || editor.isActive("textStyle")}
          onClick={() => setShowColorPicker(!showColorPicker)}
        >
          <Palette
            size={16}
            color={currentColor !== "#000000" ? currentColor : "currentColor"}
          />
        </ToolbarButton>

        {showColorPicker && (
          <div className="absolute top-full right-0 mt-2 z-50 p-3 bg-[var(--surface)] border border-[var(--border-md)] rounded-lg shadow-lg">
            <HexColorPicker
              color={currentColor}
              onChange={(color) => editor.chain().focus().setColor(color).run()}
            />
            <div className="mt-3 flex justify-between items-center">
              <span
                className="text-sm font-mono bg-[var(--bg-deep)] px-2 py-1 rounded"
                dir="ltr"
              >
                {currentColor}
              </span>
              <button
                type="button"
                className="text-xs text-red-500 hover:text-red-600 transition-colors"
                onClick={() => {
                  editor.chain().focus().unsetColor().run();
                  setShowColorPicker(false);
                }}
              >
                إزالة اللون
              </button>
            </div>
          </div>
        )}
      </div>
      {/* -------------------------------------- */}

      <Divider />

      <ToolbarButton
        label="قائمة نقطية"
        active={editor.isActive("bulletList")}
        onClick={() => editor.chain().focus().toggleBulletList().run()}
      >
        <List size={16} />
      </ToolbarButton>
      <ToolbarButton
        label="قائمة مرقمة"
        active={editor.isActive("orderedList")}
        onClick={() => editor.chain().focus().toggleOrderedList().run()}
      >
        <ListOrdered size={16} />
      </ToolbarButton>
      <ToolbarButton
        label="اقتباس"
        active={editor.isActive("blockquote")}
        onClick={() => editor.chain().focus().toggleBlockquote().run()}
      >
        <Quote size={16} />
      </ToolbarButton>
      <ToolbarButton
        label="كود"
        active={editor.isActive("codeBlock")}
        onClick={() => editor.chain().focus().toggleCodeBlock().run()}
      >
        <Code2 size={16} />
      </ToolbarButton>

      <Divider />

      <ToolbarButton
        label="رابط"
        active={editor.isActive("link")}
        onClick={setLink}
      >
        <Link2 size={16} />
      </ToolbarButton>
      {editor.isActive("link") && (
        <ToolbarButton
          label="إزالة الرابط"
          onClick={() => editor.chain().focus().unsetLink().run()}
        >
          <Link2Off size={16} />
        </ToolbarButton>
      )}

      <Divider />

      <ToolbarButton
        label="محاذاة لليمين"
        active={editor.isActive({ textAlign: "right" })}
        onClick={() => editor.chain().focus().setTextAlign("right").run()}
      >
        <AlignRight size={16} />
      </ToolbarButton>
      <ToolbarButton
        label="محاذاة للوسط"
        active={editor.isActive({ textAlign: "center" })}
        onClick={() => editor.chain().focus().setTextAlign("center").run()}
      >
        <AlignCenter size={16} />
      </ToolbarButton>
      <ToolbarButton
        label="محاذاة لليسار"
        active={editor.isActive({ textAlign: "left" })}
        onClick={() => editor.chain().focus().setTextAlign("left").run()}
      >
        <AlignLeft size={16} />
      </ToolbarButton>
    </div>
  );
}
