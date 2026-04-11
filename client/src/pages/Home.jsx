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
  const { decks, loading, addDeck, editDeck, removeDeck, cloneDeck } = useDecks()
  const [categories, setCategories] = useState([])
  const [filterCat, setFilterCat] = useState(null)
  const [showDeckModal, setShowDeckModal] = useState(false)
  const [showCatModal, setShowCatModal] = useState(false)
  const [editingDeck, setEditingDeck] = useState(null)
  const [editingCat, setEditingCat] = useState(null)
  const [deletingDeck, setDeletingDeck] = useState(null)
  const [deletingCat, setDeletingCat] = useState(null)
  const [deckForm, setDeckForm] = useState({ name: '', description: '', category_id: '' })
  const [catForm, setCatForm] = useState({ name: '', color: '#6366f1', description: '' })

  useEffect(() => {
    getCategories().then(setCategories).catch(() => showToast('Failed to load categories', 'error'))
  }, [])

  const filteredDecks = filterCat ? decks.filter(d => d.category_id === filterCat) : decks

  const openDeckModal = (deck = null) => {
    setEditingDeck(deck)
    setDeckForm(deck ? { name: deck.name, description: deck.description || '', category_id: deck.category_id || '' } : { name: '', description: '', category_id: '' })
    setShowDeckModal(true)
  }

  const openCatModal = (cat = null) => {
    setEditingCat(cat)
    setCatForm(cat ? { name: cat.name, color: cat.color || '#6366f1', description: cat.description || '' } : { name: '', color: '#6366f1', description: '' })
    setShowCatModal(true)
  }

  const saveDeck = async () => {
    try {
      if (editingDeck) {
        await editDeck(editingDeck.id, deckForm)
        showToast('Deck updated')
      } else {
        await addDeck(deckForm)
        showToast('Deck created')
      }
      setShowDeckModal(false)
    } catch {
      showToast('Failed to save deck', 'error')
    }
  }

  const saveCat = async () => {
    try {
      if (editingCat) {
        const updated = await updateCategory(editingCat.id, catForm)
        setCategories(prev => prev.map(c => c.id === editingCat.id ? updated : c))
        showToast('Category updated')
      } else {
        const created = await createCategory(catForm)
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
    setDeletingDeck(null)
  }

  const confirmDeleteCat = async () => {
    try {
      await deleteCategory(deletingCat.id)
      setCategories(prev => prev.filter(c => c.id !== deletingCat.id))
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
          <button className="btn btn-secondary" onClick={() => openCatModal()}>+ Category</button>
          <button className="btn btn-primary" onClick={() => openDeckModal()}>+ New Deck</button>
        </div>
      </div>

      <div className="category-filter">
        <button className={`filter-btn ${filterCat === null ? 'active' : ''}`} onClick={() => setFilterCat(null)}>All</button>
        {categories.map(cat => (
          <div key={cat.id} className="filter-cat-group">
            <button className={`filter-btn ${filterCat === cat.id ? 'active' : ''}`} onClick={() => setFilterCat(cat.id)}>
              <CategoryBadge name={cat.name} color={cat.color} />
            </button>
            <button className="btn-icon" onClick={() => openCatModal(cat)} title="Edit category">✏️</button>
            <button className="btn-icon btn-icon-danger" onClick={() => setDeletingCat(cat)} title="Delete category">🗑️</button>
          </div>
        ))}
      </div>

      <div className="deck-grid">
        {loading
          ? Array.from({ length: 4 }).map((_, i) => <SkeletonCard key={i} />)
          : filteredDecks.map(deck => (
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

      {showDeckModal && (
        <Modal
          title={editingDeck ? 'Edit Deck' : 'New Deck'}
          onClose={() => setShowDeckModal(false)}
          onConfirm={saveDeck}
          confirmLabel={editingDeck ? 'Save' : 'Create'}
        >
          <label className="form-label">Name *</label>
          <input className="form-input" value={deckForm.name} onChange={e => setDeckForm(f => ({ ...f, name: e.target.value }))} />
          <label className="form-label">Description</label>
          <textarea className="form-input" value={deckForm.description} onChange={e => setDeckForm(f => ({ ...f, description: e.target.value }))} />
          <label className="form-label">Category</label>
          <select className="form-input" value={deckForm.category_id} onChange={e => setDeckForm(f => ({ ...f, category_id: e.target.value }))}>
            <option value="">None</option>
            {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
          </select>
        </Modal>
      )}

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
          <input type="color" className="form-color" value={catForm.color} onChange={e => setCatForm(f => ({ ...f, color: e.target.value }))} />
          <label className="form-label">Description</label>
          <textarea className="form-input" value={catForm.description} onChange={e => setCatForm(f => ({ ...f, description: e.target.value }))} />
        </Modal>
      )}

      {deletingDeck && (
        <Modal title="Delete Deck" onClose={() => setDeletingDeck(null)} onConfirm={confirmDeleteDeck} confirmLabel="Delete" danger>
          <p>Delete <strong>{deletingDeck.name}</strong>? All flashcards will be permanently deleted.</p>
        </Modal>
      )}

      {deletingCat && (
        <Modal title="Delete Category" onClose={() => setDeletingCat(null)} onConfirm={confirmDeleteCat} confirmLabel="Delete" danger>
          <p>Delete <strong>{deletingCat.name}</strong>? Decks in this category will become uncategorised.</p>
        </Modal>
      )}
    </div>
  )
}
