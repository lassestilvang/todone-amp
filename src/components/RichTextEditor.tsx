import { useEditor, EditorContent } from '@tiptap/react'
import StarterKit from '@tiptap/starter-kit'
import { cn } from '@/utils/cn'
import { Bold, Italic, UnderlineIcon, Link2, List, ListOrdered, Redo2, Undo2 } from 'lucide-react'

interface RichTextEditorProps {
  value?: string
  onChange: (content: string) => void
  placeholder?: string
  className?: string
}

export function RichTextEditor({
  value = '',
  onChange,
  className,
}: RichTextEditorProps) {
  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        link: {
          openOnClick: false,
        },
        bulletList: {
          HTMLAttributes: {
            class: 'list-disc list-inside ml-4',
          },
        },
        orderedList: {
          HTMLAttributes: {
            class: 'list-decimal list-inside ml-4',
          },
        },
        codeBlock: {
          HTMLAttributes: {
            class: 'bg-surface-tertiary rounded p-4 overflow-x-auto',
          },
        },
      }),
    ],
    content: value,
    onUpdate: ({ editor }) => {
      onChange(editor.getHTML())
    },
    editorProps: {
      attributes: {
        class: cn(
          'prose prose-sm max-w-none focus:outline-none',
          'px-3 py-2 min-h-[120px] text-base text-content-primary'
        ),
      },
      handleDOMEvents: {
        paste: (view, event) => {
          const text = event.clipboardData?.getData('text/plain')
          if (text && event.clipboardData?.types.length === 1) {
            event.preventDefault()
            const { tr } = view.state
            tr.insertText(text, view.state.selection.$anchor.pos)
            view.dispatch(tr)
            return true
          }
          return false
        },
      },
    },
  })

  if (!editor) {
    return null
  }

  const Toolbar = () => (
    <div className="flex gap-0.5 p-2 border-b border-border bg-surface-secondary rounded-t-md flex-wrap">
      <button
        onClick={() => editor.chain().focus().toggleBold().run()}
        disabled={!editor.can().chain().focus().toggleBold().run()}
        className={cn(
          'p-2 hover:bg-interactive-secondary rounded transition-colors',
          editor.isActive('bold') ? 'bg-surface-tertiary' : ''
        )}
        title="Bold (Ctrl+B)"
        type="button"
      >
        <Bold size={16} />
      </button>

      <button
        onClick={() => editor.chain().focus().toggleItalic().run()}
        disabled={!editor.can().chain().focus().toggleItalic().run()}
        className={cn(
          'p-2 hover:bg-interactive-secondary rounded transition-colors',
          editor.isActive('italic') ? 'bg-surface-tertiary' : ''
        )}
        title="Italic (Ctrl+I)"
        type="button"
      >
        <Italic size={16} />
      </button>

      <button
        onClick={() => editor.chain().focus().toggleUnderline().run()}
        disabled={!editor.can().chain().focus().toggleUnderline().run()}
        className={cn(
          'p-2 hover:bg-interactive-secondary rounded transition-colors',
          editor.isActive('underline') ? 'bg-surface-tertiary' : ''
        )}
        title="Underline (Ctrl+U)"
        type="button"
      >
        <UnderlineIcon size={16} />
      </button>

      <div className="w-px bg-border mx-1" />

      <button
        onClick={() => editor.chain().focus().toggleBulletList().run()}
        className={cn(
          'p-2 hover:bg-interactive-secondary rounded transition-colors',
          editor.isActive('bulletList') ? 'bg-surface-tertiary' : ''
        )}
        title="Bullet List"
        type="button"
      >
        <List size={16} />
      </button>

      <button
        onClick={() => editor.chain().focus().toggleOrderedList().run()}
        className={cn(
          'p-2 hover:bg-interactive-secondary rounded transition-colors',
          editor.isActive('orderedList') ? 'bg-surface-tertiary' : ''
        )}
        title="Numbered List"
        type="button"
      >
        <ListOrdered size={16} />
      </button>

      <div className="w-px bg-border mx-1" />

      <button
        onClick={() => {
          const url = window.prompt('URL:')
          if (url) {
            editor.chain().focus().setLink({ href: url }).run()
          }
        }}
        className={cn(
          'p-2 hover:bg-interactive-secondary rounded transition-colors',
          editor.isActive('link') ? 'bg-surface-tertiary' : ''
        )}
        title="Insert Link"
        type="button"
      >
        <Link2 size={16} />
      </button>

      <div className="w-px bg-border mx-1" />

      <button
        onClick={() => editor.chain().focus().undo().run()}
        disabled={!editor.can().chain().focus().undo().run()}
        className="p-2 hover:bg-interactive-secondary rounded transition-colors disabled:opacity-50"
        title="Undo"
        type="button"
      >
        <Undo2 size={16} />
      </button>

      <button
        onClick={() => editor.chain().focus().redo().run()}
        disabled={!editor.can().chain().focus().redo().run()}
        className="p-2 hover:bg-interactive-secondary rounded transition-colors disabled:opacity-50"
        title="Redo"
        type="button"
      >
        <Redo2 size={16} />
      </button>
    </div>
  )

  return (
    <div className={cn('border border-border rounded-md overflow-hidden', className)}>
      <Toolbar />
      <EditorContent
        editor={editor}
        className="bg-surface-primary"
      />
    </div>
  )
}
