// Home.jsx
// My Decks page — shows all decks in a filterable grid and manages deck CRUD.
// Category management has moved to the dedicated /categories page; this page
// only reads categories to populate the filter bar and the deck-form dropdown.

import { useState, useEffect } from 'react'
import { useDecks } from '../hooks/useDecks'
import { getCategories } from '../services/categoryService'
import DeckCard from '../components/DeckCard/DeckCard'
import Modal from '../components/Modal/Modal'
import { SkeletonCard } from '../components/Skeleton/Skeleton'
import { showToast } from '../components/Toast/Toast'

const DEFAULT_DECK_FORM = { name: '', description: '', category_id: '' }

export default function Home() {
  const { decks, loading, addDeck, editDeck, removeDeck, cloneDeck } = useDecks()
  const [categories, setCategories] = useState([])
  const [filterCat, setFilterCat] = useState(null)
  const [showModal, setShowModal] = useState(false)
  const [editingDeck, setEditingDeck] = useState(null)
  const [deletingDeck, setDeletingDeck] = useState(null)
  const [form, setForm] = useState(DEFAULT_DECK_FORM)
  const [fieldError, setFieldError] = useState('')

  useEffect(() => {
    getCategories()
      .then(setCategories)
      .catch(() => showToast('Failed to load categories', 'error'))
  }, [])

  // When a filter is active, show only decks in that category.
  const filteredDecks = filterCat
    ? decks.filter(d => d.category_id === filterCat)
    : decks

  const openModal = (deck = null) => {
    setEditingDeck(deck)
    setForm(deck
      ? { name: deck.name, description: deck.description || '', category_id: deck.category_id || '' }
      : DEFAULT_DECK_FORM
    )
    setFieldError('')
    setShowModal(true)
  }

  const saveDeck = async () => {
    // Validate the required name field before submitting.
    if (!form.name.trim()) {
      setFieldError('Deck name is required.')
      return
    }
    setFieldError('')
    try {
      if (editingDeck) {
        await editDeck(editingDeck.id, form)
        showToast('Deck updated')
      } else {
        await addDeck(form)
        showToast('Deck created')
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
      <div className="page-header">
        <h1>My Decks</h1>
        <button className="btn btn-primary" onClick={() => openModal()}>+ New Deck</button>
      </div>

      {/* Category filter bar — read-only here; manage categories at /categories */}
      {categories.length > 0 && (
        <div className="category-filter">
          <button
            className={`filter-btn ${filterCat === null ? 'active' : ''}`}
            onClick={() => setFilterCat(null)}
          >
            All
          </button>
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
              <DeckCard
                key={deck.id}
                deck={deck}
                onEdit={openModal}
                onDelete={setDeletingDeck}
                onDuplicate={handleDuplicate}
              />
            ))}
        {!loading && filteredDecks.length === 0 && (
          <p className="empty-state">
            {filterCat ? 'No decks in this category.' : 'No decks yet. Create one to get started!'}
          </p>
        )}
      </div>

      {/* Deck create / edit modal */}
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
          <textarea
            className="form-input"
            value={form.description}
            placeholder="Optional description…"
            rows={3}
            onChange={e => setForm(f => ({ ...f, description: e.target.value }))}
          />

          <label className="form-label">Category</label>
          <select
            className="form-input"
            value={form.category_id}
            onChange={e => setForm(f => ({ ...f, category_id: e.target.value }))}
          >
            <option value="">None</option>
            {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
          </select>
        </Modal>
      )}

      {/* Deck deletion confirmation */}
      {deletingDeck && (
        <Modal
          title="Delete Deck"
          onClose={() => setDeletingDeck(null)}
          onConfirm={confirmDelete}
          confirmLabel="Delete"
          danger
        >
          <p>Delete <strong>{deletingDeck.name}</strong>? All flashcards in this deck will be permanently deleted.</p>
        </Modal>
      )}
    </div>
  )
}
