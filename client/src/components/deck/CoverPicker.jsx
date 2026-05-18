// CoverPicker — choose one of 12 preset covers or upload a custom image.
import { useRef } from 'react'

const PRESETS = [
  { key: 'preset:math',    label: '➗', bg: '#fef3c7' },
  { key: 'preset:science', label: '🔬', bg: '#d1fae5' },
  { key: 'preset:history', label: '🏛️', bg: '#fce7f3' },
  { key: 'preset:code',    label: '💻', bg: '#e0e7ff' },
  { key: 'preset:lang',    label: '🌐', bg: '#cffafe' },
  { key: 'preset:music',   label: '🎵', bg: '#fdf4ff' },
  { key: 'preset:art',     label: '🎨', bg: '#fff7ed' },
  { key: 'preset:sport',   label: '⚽', bg: '#f0fdf4' },
  { key: 'preset:astro',   label: '🚀', bg: '#1e1b4b', dark: true },
  { key: 'preset:bio',     label: '🧬', bg: '#ecfdf5' },
  { key: 'preset:law',     label: '⚖️', bg: '#f5f3ff' },
  { key: 'preset:geo',     label: '🗺️', bg: '#fffbeb' },
]

export default function CoverPicker({ value, onChange }) {
  const fileRef = useRef(null)

  return (
    <div className="cover-picker">
      <p className="form-label">Cover Image</p>
      <div className="cover-presets">
        {PRESETS.map(p => (
          <button
            key={p.key}
            type="button"
            className={`cover-preset ${value === p.key ? 'selected' : ''}`}
            style={{ background: p.bg, color: p.dark ? '#fff' : 'inherit' }}
            onClick={() => onChange(p.key, null)}
            title={p.label}
          >
            <span className="cover-preset-icon">{p.label}</span>
          </button>
        ))}
      </div>
      <button
        type="button"
        className={`btn btn-secondary cover-upload-btn ${value && !value.startsWith('preset:') ? 'cover-upload-btn--active' : ''}`}
        onClick={() => fileRef.current?.click()}
      >
        📎 Upload Custom Cover Image…
      </button>
      <input
        ref={fileRef}
        type="file"
        accept="image/*"
        style={{ display: 'none' }}
        onChange={e => {
          const file = e.target.files?.[0]
          if (file) onChange(null, file)
        }}
      />
      {value && !value.startsWith('preset:') && (
        <p className="form-hint">Custom image selected. Will be saved after creating/updating the deck.</p>
      )}
    </div>
  )
}

// Helper: render the cover in DeckCard and DeckView
export function DeckCoverDisplay({ deck, className = '' }) {
  const preset = PRESETS.find(p => p.key === deck.cover_image_path)
  if (preset) {
    return (
      <div className={`deck-cover preset-cover ${className}`} style={{ background: preset.bg }}>
        <span className="deck-cover-icon">{preset.label}</span>
      </div>
    )
  }
  if (deck.cover_image_path) {
    const src = deck.cover_image_type === 'upload'
      ? `/api/${deck.cover_image_path}`
      : deck.cover_image_path
    return <img src={src} alt="" className={`deck-cover ${className}`} />
  }
  return (
    <div className={`deck-cover preset-cover ${className}`} style={{ background: '#e0e7ff' }}>
      <span className="deck-cover-icon">📖</span>
    </div>
  )
}
