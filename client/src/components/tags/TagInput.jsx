// TagInput — lets the user attach existing tags or create new ones by typing
// and pressing Enter. The dropdown shows matching tags from the user's tag library.
import { useState, useEffect, useRef } from 'react'
import { getTags, createTag } from '../../services/tagService'
import TagChip from './TagChip'
import { showToast } from '../Toast/Toast'

export default function TagInput({ selectedTags = [], onChange }) {
  const [allTags, setAllTags] = useState([])
  const [query, setQuery] = useState('')
  const [open, setOpen] = useState(false)
  const inputRef = useRef(null)

  useEffect(() => {
    getTags().then(setAllTags).catch(() => {})
  }, [])

  const filtered = allTags.filter(t =>
    !selectedTags.some(s => s.id === t.id) &&
    t.name.toLowerCase().includes(query.toLowerCase())
  )

  const addTag = (tag) => {
    onChange([...selectedTags, tag])
    setQuery('')
    setOpen(false)
  }

  const handleKeyDown = async (e) => {
    if (e.key === 'Enter' && query.trim()) {
      e.preventDefault()
      const existing = allTags.find(t => t.name.toLowerCase() === query.trim().toLowerCase())
      if (existing) {
        if (!selectedTags.some(s => s.id === existing.id)) addTag(existing)
        return
      }
      try {
        const newTag = await createTag(query.trim())
        setAllTags(prev => [...prev, newTag])
        addTag(newTag)
      } catch {
        showToast('Failed to create tag', 'error')
      }
    }
    if (e.key === 'Backspace' && !query && selectedTags.length > 0) {
      onChange(selectedTags.slice(0, -1))
    }
    if (e.key === 'Escape') setOpen(false)
  }

  return (
    <div className="tag-input-wrapper">
      <div className="tag-input-box" onClick={() => inputRef.current?.focus()}>
        {selectedTags.map(t => (
          <TagChip key={t.id} tag={t} onRemove={() => onChange(selectedTags.filter(s => s.id !== t.id))} />
        ))}
        <input
          ref={inputRef}
          className="tag-input"
          placeholder={selectedTags.length ? '' : 'Add tags… (type + Enter to create)'}
          value={query}
          onChange={e => { setQuery(e.target.value); setOpen(true) }}
          onFocus={() => setOpen(true)}
          onBlur={() => setTimeout(() => setOpen(false), 150)}
          onKeyDown={handleKeyDown}
        />
      </div>
      {open && (filtered.length > 0 || query.trim()) && (
        <div className="tag-dropdown">
          {filtered.map(t => (
            <button key={t.id} className="tag-option" onMouseDown={() => addTag(t)}>
              <TagChip tag={t} />
            </button>
          ))}
          {query.trim() && !allTags.some(t => t.name.toLowerCase() === query.trim().toLowerCase()) && (
            <button className="tag-option tag-create-hint" onMouseDown={async () => {
              try {
                const newTag = await createTag(query.trim())
                setAllTags(prev => [...prev, newTag])
                addTag(newTag)
              } catch {
                showToast('Failed to create tag', 'error')
              }
            }}>
              Create tag "<strong>{query.trim()}</strong>"
            </button>
          )}
        </div>
      )}
      <p className="form-hint">Press Enter to create a new tag. Click a chip × to remove.</p>
    </div>
  )
}
