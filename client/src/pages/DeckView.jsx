import { useState, useEffect } from 'react'
import { useParams, Link } from 'react-router-dom'
import { useCards } from '../hooks/useCards'
import { getDeck } from '../services/deckService'
import { assignTag, removeTagFromCard } from '../services/tagService'
import Editor from '../components/Editor/Editor'
import CardDisplay from '../components/Editor/CardDisplay'
import TagInput from '../components/tags/TagInput'
import TagChip from '../components/tags/TagChip'
import Modal from '../components/Modal/Modal'
import { SkeletonCard } from '../components/Skeleton/Skeleton'
import { showToast } from '../components/Toast/Toast'
import { DeckCoverDisplay } from '../components/deck/CoverPicker'

const STYLE_DEFAULTS = { bg: '#ffffff', text: '#1a1a2e' }

// Derive card-face CSS from deck style fields.
// Fall back to CSS variables for colours that match the light-mode defaults so
// dark mode is respected for decks that were never given a custom colour.
function cardStyle(deck) {
  if (!deck) return {}
  const fontMap = {
    sans: 'inherit',
    serif: 'Georgia, serif',
    mono: 'monospace',
    decorative: '"Syne", sans-serif',
  }
  const bg   = deck.style_bg_color
  const text = deck.style_text_color
  return {
    background: (bg   && bg   !== STYLE_DEFAULTS.bg)   ? bg   : 'var(--surface)',
    color:      (text && text !== STYLE_DEFAULTS.text)  ? text : 'var(--text)',
    fontSize:   deck.style_font_size === 'small' ? '0.85rem' : deck.style_font_size === 'large' ? '1.1rem' : '1rem',
    fontFamily: fontMap[deck.style_font_family] || 'inherit',
    borderRadius: deck.style_border_style === 'rounded' ? 10 : deck.style_border_style === 'none' ? 0 : 2,
  }
}

export default function DeckView() {
  const { deckId } = useParams()
  const { cards, loading, addCard, editCard, removeCard } = useCards(Number(deckId))
  const [deck, setDeck] = useState(null)
  const [showModal, setShowModal] = useState(false)
  const [editingCard, setEditingCard] = useState(null)
  const [deletingCard, setDeletingCard] = useState(null)
  const [form, setForm] = useState({ question: '', answer: '', image: null, tags: [] })

  useEffect(() => {
    getDeck(deckId).then(setDeck).catch(() => showToast('Failed to load deck', 'error'))
  }, [deckId])

  useEffect(() => {
    if (deck) document.title = `${deck.name} — Cardie`
  }, [deck])

  const openModal = (card = null) => {
    setEditingCard(card)
    setForm(card
      ? { question: card.question, answer: card.answer, image: null, tags: card.tags || [] }
      : { question: '', answer: '', image: null, tags: [] }
    )
    setShowModal(true)
  }

  const saveCard = async () => {
    const fd = new FormData()
    fd.append('question', form.question)
    fd.append('answer', form.answer)
    if (form.image) fd.append('image', form.image)
    try {
      let saved
      if (editingCard) {
        saved = await editCard(editingCard.id, fd)
        showToast('Card updated')
      } else {
        saved = await addCard(fd)
        showToast('Card created')
      }

      // Sync tags: add new, remove deleted
      const prevTags = editingCard?.tags || []
      const toAdd = form.tags.filter(t => !prevTags.some(p => p.id === t.id))
      const toRemove = prevTags.filter(p => !form.tags.some(t => t.id === p.id))
      await Promise.all([
        ...toAdd.map(t => assignTag(saved.id, t.id)),
        ...toRemove.map(t => removeTagFromCard(saved.id, t.id)),
      ])

      setShowModal(false)
    } catch {
      showToast('Failed to save card', 'error')
    }
  }

  const confirmDelete = async () => {
    try {
      await removeCard(deletingCard.id)
      showToast('Card deleted')
    } catch {
      showToast('Failed to delete card', 'error')
    }
    setDeletingCard(null)
  }

  const cStyle = cardStyle(deck)

  return (
    <div className="page">
      {deck && (
        <div className="deck-banner">
          <DeckCoverDisplay deck={deck} />
        </div>
      )}
      <div className="page-header">
        <div>
          <Link to="/decks" className="breadcrumb">← Decks</Link>
          <h1>{deck?.name ?? 'Loading…'}</h1>
          {deck?.description && <p className="deck-desc" dangerouslySetInnerHTML={{ __html: deck.description }} />}
        </div>
        <div className="page-header-actions">
          <Link to={`/decks/${deckId}/dashboard`} className="btn btn-secondary">📈 Dashboard</Link>
          <Link to={`/decks/${deckId}/study`} className="btn btn-primary">▶ Study</Link>
          <button className="btn btn-secondary" onClick={() => openModal()}>+ Add Card</button>
        </div>
      </div>

      <div className="card-grid">
        {loading
          ? Array.from({ length: 3 }).map((_, i) => <SkeletonCard key={i} />)
          : cards.map(card => (
              <div key={card.id} className="flashcard-preview" style={cStyle}>
                {card.image_path && (
                  <img src={`/api/uploads/${card.image_path.split('/').pop()}`} alt="" className="card-thumb" />
                )}
                <div className="flashcard-q">
                  <CardDisplay html={card.question} />
                </div>
                <div className="flashcard-a">
                  <CardDisplay html={card.answer} />
                </div>
                {card.tags?.length > 0 && (
                  <div className="card-tags">
                    {card.tags.map(t => <TagChip key={t.id} tag={t} />)}
                  </div>
                )}
                <div className="flashcard-stats">
                  <span>Easy: {card.ease_count}</span>
                  <span>Hard: {card.hard_count}</span>
                  <span>Missed: {card.missed_count}</span>
                </div>
                <div className="flashcard-actions">
                  <button className="btn-icon" onClick={() => openModal(card)}>✏️</button>
                  <button className="btn-icon btn-icon-danger" onClick={() => setDeletingCard(card)}>🗑️</button>
                </div>
              </div>
            ))}
        {!loading && cards.length === 0 && (
          <p className="empty-state">
            This deck is empty. Add your first flashcard to start studying.
            <br /><button className="btn btn-primary" style={{ marginTop: 12 }} onClick={() => openModal()}>+ Add Card</button>
          </p>
        )}
      </div>

      {showModal && (
        <Modal
          title={editingCard ? 'Edit Card' : 'New Card'}
          onClose={() => setShowModal(false)}
          onConfirm={saveCard}
          confirmLabel={editingCard ? 'Save' : 'Create'}
        >
          <label className="form-label">Question *</label>
          <p className="form-hint">Use formatting to make questions clear and memorable.</p>
          <Editor content={form.question} onChange={q => setForm(f => ({ ...f, question: q }))} />

          <label className="form-label">Answer *</label>
          <p className="form-hint">Be concise — aim for one key idea per card.</p>
          <Editor content={form.answer} onChange={a => setForm(f => ({ ...f, answer: a }))} />

          <label className="form-label">Image (optional)</label>
          <input type="file" accept="image/*" className="form-input"
            onChange={e => setForm(f => ({ ...f, image: e.target.files[0] }))} />

          <label className="form-label">Tags</label>
          <TagInput
            selectedTags={form.tags}
            onChange={tags => setForm(f => ({ ...f, tags }))}
          />
        </Modal>
      )}

      {deletingCard && (
        <Modal title="Delete Card" onClose={() => setDeletingCard(null)} onConfirm={confirmDelete} confirmLabel="Delete" danger>
          <p>Permanently delete this card?</p>
        </Modal>
      )}
    </div>
  )
}
