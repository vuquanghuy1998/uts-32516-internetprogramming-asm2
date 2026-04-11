// Home.jsx

// This file renders the main landing page of the app. Displays all decks in a grid and
// lets the user filter them by category. Manages full CRUD for both decks and categories
// through a shared modal pattern: a single modal component is reused for both
// "create" and "edit" flows by toggling its title, confirm label, and pre-filled
// form values based on whether an existing item was passed to the open handler.
// Deck state is managed by the useDecks hook; category state is managed locally
// here because categories are only needed on this page.

import { useState } from 'react'
import { useDecks } from '../hooks/useDecks'
import { getCategories, createCategory, updateCategory, deleteCategory } from '../services/categoryService'
import { useEffect } from 'react'
import DeckCard from '../components/DeckCard/DeckCard'
import CategoryBadge from '../components/CategoryBadge/CategoryBadge'
import Modal from '../components/Modal/Modal'
import { SkeletonCard } from '../components/Skeleton/Skeleton'
import { showToast } from '../components/Toast/Toast'

export default function Home() {
  // useDecks fetches all decks on mount and features CRUD helpers that keep
  // both the API and local state in sync.
  const { decks, loading, addDeck, editDeck, removeDeck, cloneDeck } = useDecks()

  const [categories, setCategories] = useState([])

  // Filtering the categories. null means "show all decks"; a category id means
  // "show only that category".
  const [filterCat, setFilterCat] = useState(null)

  // Separate modal visibility variables for decks and categories so both modals
  // can have independent open/close lifecycles.
  const [showDeckModal, setShowDeckModal] = useState(false)
  const [showCatModal, setShowCatModal] = useState(false)

  // When non-null, the respective modal is in "edit" mode for this object.
  // When null, the modal is in "create" mode.
  const [editingDeck, setEditingDeck] = useState(null)
  const [editingCat, setEditingCat] = useState(null)

  // Staging the state for "deletion confirmation" modals — holds the item the user
  // has clicked "delete" on without immediately deleting it.
  const [deletingDeck, setDeletingDeck] = useState(null)
  const [deletingCat, setDeletingCat] = useState(null)

  // Controlled form state for the deck and category modals respectively.
  const [deckForm, setDeckForm] = useState({ name: '', description: '', category_id: '' })
  const [catForm, setCatForm] = useState({ name: '', color: '#6366f1', description: '' })

  // Load categories once on mount. Categories are not managed by a hook
  // because they are only used on this page.
  useEffect(() => {
    getCategories().then(setCategories).catch(() => showToast('Failed to load categories', 'error'))
  }, [])

  // When a filter is active, show only decks whose category_id matches.
  // When filterCat is null the full list is shown unchanged.
  const filteredDecks = filterCat ? decks.filter(d => d.category_id === filterCat) : decks

  // Opens the deck modal. Pre-populates the form when editing an existing deck;
  // resets to blank when creating a new one.
  const openDeckModal = (deck = null) => {
    setEditingDeck(deck)
    setDeckForm(deck ? { name: deck.name, description: deck.description || '', category_id: deck.category_id || '' } : { name: '', description: '', category_id: '' })
    setShowDeckModal(true)
  }

  // Same setup for the category modal. Falls back to the default color
  // if the existing category has no color stored.
  const openCatModal = (cat = null) => {
    setEditingCat(cat)
    setCatForm(cat ? { name: cat.name, color: cat.color || '#6366f1', description: cat.description || '' } : { name: '', color: '#6366f1', description: '' })
    setShowCatModal(true)
  }

  const saveDeck = async () => {
    try {
      if (editingDeck) {
        await editDeck(editingDeck.id, deckForm)
        showToast('The deck has been updated.')
      } else {
        await addDeck(deckForm)
        showToast('The deck has been created.')
      }
      setShowDeckModal(false)
    } catch {
      showToast('Failed to save deck.', 'error')
    }
  }

  const saveCat = async () => {
    try {
      if (editingCat) {
        const updated = await updateCategory(editingCat.id, catForm)
        // Replace only the updated category in the array rather than re-fetching
        // the entire list from the API..
        setCategories(prev => prev.map(c => c.id === editingCat.id ? updated : c))
        showToast('Category updated')
      } else {
        const created = await createCategory(catForm)
        // Append the newly created category returned by the API so that the ID assigned
        // to this category by the server used in subsequent renders.
        setCategories(prev => [...prev, created])
        showToast('Category created')
      }
      setShowCatModal(false)
    } catch {
      showToast('Failed to save category', 'error')
    }
  }

  const confirmDeleteDeck = async () => {
    try {
      await removeDeck(deletingDeck.id)
      showToast('Deck deleted')
    } catch {
      showToast('Failed to delete deck', 'error')
    }
    // Clear staging state to close the confirmation modal regardless of outcome.
    setDeletingDeck(null)
  }

  const confirmDeleteCat = async () => {
    try {
      await deleteCategory(deletingCat.id)
      // Remove the deleted category from local state without a refetch.
      setCategories(prev => prev.filter(c => c.id !== deletingCat.id))
      // If the user was filtering by the now-deleted category, reset the filter
      // so they don't end up staring at an empty deck grid with no way out.
      if (filterCat === deletingCat.id) setFilterCat(null)
      showToast('Category deleted')
    } catch {
      showToast('Failed to delete category', 'error')
    }
    setDeletingCat(null)
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
        <div className="page-header-actions">
          {/* Calling openCatModal() with no argument opens the modal in create mode. */}
          <button className="btn btn-secondary" onClick={() => openCatModal()}>+ Category</button>
          <button className="btn btn-primary" onClick={() => openDeckModal()}>+ New Deck</button>
        </div>
      </div>

      {/* Category filter bar — "All" resets the filter; each category button
          activates that filter. Edit/delete buttons sit alongside each badge. */}
      <div className="category-filter">
        <button className={`filter-btn ${filterCat === null ? 'active' : ''}`} onClick={() => setFilterCat(null)}>All</button>
        {categories.map(cat => (
          <div key={cat.id} className="filter-cat-group">
            {/* Clicking the badge itself applies the filter. */}
            <button className={`filter-btn ${filterCat === cat.id ? 'active' : ''}`} onClick={() => setFilterCat(cat.id)}>
              <CategoryBadge name={cat.name} color={cat.color} />
            </button>
            <button className="btn-icon" onClick={() => openCatModal(cat)} title="Edit category">✏️</button>
            {/* Store the category object in state rather than deleting immediately
                so the confirmation modal can display first. */}
            <button className="btn-icon btn-icon-danger" onClick={() => setDeletingCat(cat)} title="Delete category">🗑️</button>
          </div>
        ))}
      </div>

      <div className="deck-grid">
        {loading
          // Render 4 skeleton placeholders while the deck list is loading to
          // prevent layout shift and signal activity to the user.
          ? Array.from({ length: 4 }).map((_, i) => <SkeletonCard key={i} />)
          : filteredDecks.map(deck => (
              // Pass handler references so DeckCard can trigger the shared modals
              // without managing its own modal state.
              <DeckCard
                key={deck.id}
                deck={deck}
                onEdit={openDeckModal}
                onDelete={setDeletingDeck}
                onDuplicate={handleDuplicate}
              />
            ))}
        {!loading && filteredDecks.length === 0 && (
          <p className="empty-state">No decks yet. Create one to get started!</p>
        )}
      </div>

      {/* ── Deck create / edit modal ────────────────────────────────────────── */}
      {showDeckModal && (
        <Modal
          title={editingDeck ? 'Edit Deck' : 'New Deck'}
          onClose={() => setShowDeckModal(false)}
          onConfirm={saveDeck}
          confirmLabel={editingDeck ? 'Save' : 'Create'}
        >
          <label className="form-label">Name *</label>
          {/* Functional update (f => ...) prevents stale closure issues when
              the onChange is triggered while another state update is in flight. */}
          <input className="form-input" value={deckForm.name} onChange={e => setDeckForm(f => ({ ...f, name: e.target.value }))} />
          <label className="form-label">Description</label>
          <textarea className="form-input" value={deckForm.description} onChange={e => setDeckForm(f => ({ ...f, description: e.target.value }))} />
          <label className="form-label">Category</label>
          {/* "None" option maps to an empty string which the backend treats as
              a null category_id (so that the deck becomes uncategorised). */}
          <select className="form-input" value={deckForm.category_id} onChange={e => setDeckForm(f => ({ ...f, category_id: e.target.value }))}>
            <option value="">None</option>
            {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
          </select>
        </Modal>
      )}

      {/* ── Category create / edit modal ────────────────────────────────────── */}
      {showCatModal && (
        <Modal
          title={editingCat ? 'Edit Category' : 'New Category'}
          onClose={() => setShowCatModal(false)}
          onConfirm={saveCat}
          confirmLabel={editingCat ? 'Save' : 'Create'}
        >
          <label className="form-label">Name *</label>
          <input className="form-input" value={catForm.name} onChange={e => setCatForm(f => ({ ...f, name: e.target.value }))} />
          <label className="form-label">Color</label>
          {/* Native color picker — value must be a 6-digit hex string. */}
          <input type="color" className="form-color" value={catForm.color} onChange={e => setCatForm(f => ({ ...f, color: e.target.value }))} />
          <label className="form-label">Description</label>
          <textarea className="form-input" value={catForm.description} onChange={e => setCatForm(f => ({ ...f, description: e.target.value }))} />
        </Modal>
      )}

      {/* ── Deck deletion confirmation modal ────────────────────────────────── */}
      {deletingDeck && (
        <Modal title="Delete Deck" onClose={() => setDeletingDeck(null)} onConfirm={confirmDeleteDeck} confirmLabel="Delete" danger>
          <p>Delete <strong>{deletingDeck.name}</strong>All flashcards will be permanently deleted. Are you sure you wish to proceed?</p>
        </Modal>
      )}

      {/* ── Category deletion confirmation modal ────────────────────────────── */}
      {deletingCat && (
        <Modal title="Delete Category" onClose={() => setDeletingCat(null)} onConfirm={confirmDeleteCat} confirmLabel="Delete" danger>
          <p>Delete <strong>{deletingCat.name}</strong>Decks in this category will become uncategorised.</p>
        </Modal>
      )}
    </div>
  )
}
