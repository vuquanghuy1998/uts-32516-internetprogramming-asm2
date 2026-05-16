import { useState, useEffect } from 'react'
import { useDecks } from '../hooks/useDecks'
import { getCategories } from '../services/categoryService'
import { uploadDeckCover, setDeckPresetCover } from '../services/deckService'
import DeckCard from '../components/DeckCard/DeckCard'
import Modal from '../components/Modal/Modal'
import { SkeletonCard } from '../components/Skeleton/Skeleton'
import { showToast } from '../components/Toast/Toast'
import DeckStyleEditor from '../components/deck/DeckStyleEditor'
import CoverPicker from '../components/deck/CoverPicker'
import OnboardingTour from '../components/onboarding/OnboardingTour'
import { useAuth } from '../context/AuthContext'

const DEFAULT_STYLE = { bg_color: '#ffffff', text_color: '#1a1a2e', font_size: 'medium', font_family: 'sans', border_style: 'rounded' }
const DEFAULT_FORM = { name: '', description: '', category_id: '', style: { ...DEFAULT_STYLE } }

export default function Home() {
  useEffect(() => { document.title = 'My Decks — Cardie' }, [])

  const { user } = useAuth()
  const { decks, loading, addDeck, editDeck, removeDeck, cloneDeck } = useDecks()
  const [categories, setCategories] = useState([])
  const [filterCat, setFilterCat] = useState(null)
  const [showModal, setShowModal] = useState(false)
  const [editingDeck, setEditingDeck] = useState(null)
  const [deletingDeck, setDeletingDeck] = useState(null)
  const [form, setForm] = useState(DEFAULT_FORM)
  const [coverSelection, setCoverSelection] = useState({ presetKey: null, file: null })
  const [fieldError, setFieldError] = useState('')
  const [showTour, setShowTour] = useState(false)

  useEffect(() => {
    getCategories()
      .then(setCategories)
      .catch(() => showToast('Failed to load categories', 'error'))
  }, [])

  // Show onboarding tour for new users
  useEffect(() => {
    if (user && user.has_completed_onboarding === false) {
      setShowTour(true)
    }
  }, [user])

  const filteredDecks = filterCat ? decks.filter(d => d.category_id === filterCat) : decks

  const openModal = (deck = null) => {
    setEditingDeck(deck)
    setForm(deck
      ? {
          name: deck.name,
          description: deck.description || '',
          category_id: deck.category_id || '',
          style: {
            bg_color: deck.style_bg_color || '#ffffff',
            text_color: deck.style_text_color || '#1a1a2e',
            font_size: deck.style_font_size || 'medium',
            font_family: deck.style_font_family || 'sans',
            border_style: deck.style_border_style || 'rounded',
          },
        }
      : DEFAULT_FORM
    )
    setCoverSelection({ presetKey: null, file: null })
    setFieldError('')
    setShowModal(true)
  }

  const saveDeck = async () => {
    if (!form.name.trim()) { setFieldError('Deck name is required.'); return }
    setFieldError('')
    try {
      let saved
      if (editingDeck) {
        saved = await editDeck(editingDeck.id, { ...form, category_id: form.category_id || null })
        showToast('Deck updated')
      } else {
        saved = await addDeck({ ...form, category_id: form.category_id || null })
        showToast('Deck created')
      }
      // Upload cover if selected after saving (need deck ID)
      if (saved?.id && coverSelection.file) {
        await uploadDeckCover(saved.id, coverSelection.file)
      } else if (saved?.id && coverSelection.presetKey) {
        await setDeckPresetCover(saved.id, coverSelection.presetKey)
      }
      setShowModal(false)
    } catch {
      showToast('Failed to save deck', 'error')
    }
  }

  const confirmDelete = async () => {
    try {
      await removeDeck(deletingDeck.id)
      showToast('Deck deleted')
    } catch {
      showToast('Failed to delete deck', 'error')
    }
    setDeletingDeck(null)
  }

  const handleDuplicate = async (id) => {
    try {
      await cloneDeck(id)
      showToast('Deck duplicated')
    } catch {
      showToast('Failed to duplicate deck', 'error')
    }
  }

  return (
    <div className="page">
      {showTour && <OnboardingTour onDone={() => setShowTour(false)} />}

      <div className="page-header">
        <h1>My Decks</h1>
        <button className="btn btn-primary" onClick={() => openModal()}>+ New Deck</button>
      </div>

      {categories.length > 0 && (
        <div className="category-filter">
          <button className={`filter-btn ${filterCat === null ? 'active' : ''}`} onClick={() => setFilterCat(null)}>All</button>
          {categories.map(cat => (
            <button
              key={cat.id}
              className={`filter-btn ${filterCat === cat.id ? 'active' : ''}`}
              onClick={() => setFilterCat(cat.id)}
              style={filterCat === cat.id ? { borderColor: cat.color, color: cat.color } : {}}
            >
              {cat.name}
            </button>
          ))}
        </div>
      )}

      <div className="deck-grid">
        {loading
          ? Array.from({ length: 4 }).map((_, i) => <SkeletonCard key={i} />)
          : filteredDecks.map(deck => (
              <DeckCard key={deck.id} deck={deck} onEdit={openModal} onDelete={setDeletingDeck} onDuplicate={handleDuplicate} />
            ))}
        {!loading && filteredDecks.length === 0 && (
          <p className="empty-state">
            {filterCat
              ? 'No decks in this category.'
              : "You haven't created any decks yet. A deck is a collection of flashcards on a topic."}
          </p>
        )}
      </div>

      {showModal && (
        <Modal
          title={editingDeck ? 'Edit Deck' : 'New Deck'}
          onClose={() => setShowModal(false)}
          onConfirm={saveDeck}
          confirmLabel={editingDeck ? 'Save' : 'Create'}
        >
          <label className="form-label">Name *</label>
          <input
            className={`form-input ${fieldError ? 'input-error' : ''}`}
            value={form.name}
            placeholder="e.g. Python Basics"
            onChange={e => { setForm(f => ({ ...f, name: e.target.value })); setFieldError('') }}
          />
          {fieldError && <p className="field-error">{fieldError}</p>}

          <label className="form-label">Description</label>
          <textarea className="form-input" value={form.description} rows={2}
            placeholder="Optional description…"
            onChange={e => setForm(f => ({ ...f, description: e.target.value }))} />

          <label className="form-label">Category</label>
          <select className="form-input" value={form.category_id}
            onChange={e => setForm(f => ({ ...f, category_id: e.target.value }))}>
            <option value="">None</option>
            {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
          </select>

          <CoverPicker
            value={coverSelection.presetKey}
            onChange={(presetKey, file) => setCoverSelection({ presetKey, file })}
          />

          <DeckStyleEditor
            style={form.style}
            onChange={style => setForm(f => ({ ...f, style }))}
          />
        </Modal>
      )}

      {deletingDeck && (
        <Modal title="Delete Deck" onClose={() => setDeletingDeck(null)} onConfirm={confirmDelete} confirmLabel="Delete" danger>
          <p>Delete <strong>{deletingDeck.name}</strong>? All flashcards in this deck will be permanently deleted.</p>
        </Modal>
      )}
    </div>
  )
}
