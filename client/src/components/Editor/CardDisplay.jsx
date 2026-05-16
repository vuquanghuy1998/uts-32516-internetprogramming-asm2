// CardDisplay — renders TipTap HTML content in read-only mode.
// Uses TipTap's editable:false instead of dangerouslySetInnerHTML.
import { useEditor, EditorContent } from '@tiptap/react'
import StarterKit from '@tiptap/starter-kit'
import TextAlign from '@tiptap/extension-text-align'
import Image from '@tiptap/extension-image'

const EXTENSIONS = [
  StarterKit,
  TextAlign.configure({ types: ['heading', 'paragraph'] }),
  Image,
]

export default function CardDisplay({ html, className = '' }) {
  const editor = useEditor({
    extensions: EXTENSIONS,
    content: html || '',
    editable: false,
  })

  if (!editor) return null

  return <EditorContent editor={editor} className={`card-display ${className}`} />
}
