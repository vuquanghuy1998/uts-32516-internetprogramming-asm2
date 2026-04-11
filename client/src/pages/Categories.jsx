// Categories.jsx
// Dedicated page for managing all categories. Displays every category as a
// card showing its colour, description, and deck count. Supports create, edit,
// and delete operations through a shared modal (same create/edit toggle pattern
// used on the Decks page). Inline field-level validation prevents submission
// with an empty name.

import { useState, useEffect } from 'react'
import { getCategories, createCategory, updateCategory, deleteCategory } from '../services/categoryService'
import { getDecks } from '../services/deckService'
import Modal from '../components/Modal/Modal'
import { showToast } from '../components/Toast/Toast'

const DEFAULT_FORM = { name: '', color: '#6366f1', description: '' }

export default function Categories() {
  const [categories, setCategories] = useState([])
  const [deckCounts, setDeckCounts] = useState({}) // categoryId → count
  const [loading, setLoading] = useState(true)
  const [showModal, setShowModal] = useState(false)
  const [editingCat, setEditingCat] = useState(null)
  const [deletingCat, setDeletingCat] = useState(null)
  const [form, setForm] = useState(DEFAULT_FORM)
  const [fieldError, setFieldError] = useState('')

  useEffect(() => {
    // Load categories and decks in parallel to compute per-category deck counts.
    Promise.all([getCategories(), getDecks()])
      .then(([cats, decks]) => {
        setCategories(cats)
        // Build a map of categoryId → number of decks in that category.
        const counts = {}
        decks.forEach(d => {
          if (d.category_id) counts[d.category_id] = (counts[d.category_id] ?? 0) + 1
        })
        setDeckCounts(counts)
      })
      .catch(() => showToast('Failed to load categories', 'error'))
      .finally(() => setLoading(false))
  }, [])

  const openModal = (cat = null) => {
    setEditingCat(cat)
    setForm(cat
      ? { name: cat.name, color: cat.color || '#6366f1', description: cat.description || '' }
      : DEFAULT_FORM
    )
    setFieldError('')
    setShowModal(true)
  }

  const save = async () => {
    // Validate required field before hitting the API.
    if (!form.name.trim()) {
      setFieldError('Category name is required.')
      return
    }
    setFieldError('')
    try {
      if (editingCat) {
        const updated = await updateCategory(editingCat.id, form)
        setCategories(prev => prev.map(c => c.id === editingCat.id ? updated : c))
        showToast('Category updated')
      } else {
        const created = await createCategory(form)
        setCategories(prev => [...prev, created])
        showToast('Category created')
      }
      setShowModal(false)
    } catch {
      showToast('Failed to save category', 'error')
    }
  }

  const confirmDelete = async () => {
    try {
      await deleteCategory(deletingCat.id)
      setCategories(prev => prev.filter(c => c.id !== deletingCat.id))
      showToast('Category deleted')
    } catch {
      showToast('Failed to delete category', 'error')
    }
    setDeletingCat(null)
  }

  return (
    <div className="page">
      <div className="page-header">
        <div>
          <h1>Categories</h1>
          <p className="page-subtitle">Organise your decks into subjects</p>
        </div>
        <button className="btn btn-primary" onClick={() => openModal()}>+ New Category</button>
      </div>

      {loading ? (
        <p className="empty-state">Loading…</p>
      ) : categories.length === 0 ? (
        <p className="empty-state">No categories yet. Create one to organise your decks.</p>
      ) : (
        <div className="cat-grid">
          {categories.map(cat => (
            <div key={cat.id} className="cat-card" style={{ borderTopColor: cat.color }}>
              <div className="cat-card-header">
                <span className="cat-color-dot" style={{ background: cat.color }} />
                <span className="cat-card-name">{cat.name}</span>
                <div className="cat-card-actions">
                  <button className="btn-icon" onClick={() => openModal(cat)} title="Edit">✏️</button>
                  <button className="btn-icon btn-icon-danger" onClick={() => setDeletingCat(cat)} title="Delete">🗑️</button>
                </div>
              </div>
              {cat.description && <p className="cat-card-desc">{cat.description}</p>}
              <p className="cat-card-count">{deckCounts[cat.id] ?? 0} deck{deckCounts[cat.id] !== 1 ? 's' : ''}</p>
            </div>
          ))}
        </div>
      )}

      {/* Create / edit modal */}
      {showModal && (
        <Modal
          title={editingCat ? 'Edit Category' : 'New Category'}
          onClose={() => setShowModal(false)}
          onConfirm={save}
          confirmLabel={editingCat ? 'Save' : 'Create'}
        >
          <label className="form-label">Name *</label>
          <input
            className={`form-input ${fieldError ? 'input-error' : ''}`}
            value={form.name}
            onChange={e => { setForm(f => ({ ...f, name: e.target.value })); setFieldError('') }}
            placeholder="e.g. Computer Science"
          />
          {fieldError && <p className="field-error">{fieldError}</p>}

          <label className="form-label">Colour</label>
          <div className="color-row">
            <input
              type="color"
              className="form-color"
              value={form.color}
              onChange={e => setForm(f => ({ ...f, color: e.target.value }))}
            />
            <span className="color-preview" style={{ background: form.color }}>{form.color}</span>
          </div>

          <label className="form-label">Description</label>
          <textarea
            className="form-input"
            value={form.description}
            onChange={e => setForm(f => ({ ...f, description: e.target.value }))}
            placeholder="Optional description…"
            rows={3}
          />
        </Modal>
      )}

      {/* Delete confirmation */}
      {deletingCat && (
        <Modal
          title="Delete Category"
          onClose={() => setDeletingCat(null)}
          onConfirm={confirmDelete}
          confirmLabel="Delete"
          danger
        >
          <p>Delete <strong>{deletingCat.name}</strong>? Decks in this category will become uncategorised.</p>
        </Modal>
      )}
    </div>
  )
}
