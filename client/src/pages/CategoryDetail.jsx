// CategoryDetail.jsx
// Shows a single category's metadata and lists all decks that belong to it.
// Accessed by clicking a category card on the /categories page.

import { useState, useEffect } from 'react'
import { useParams, Link } from 'react-router-dom'
import { getCategories } from '../services/categoryService'
import { getDecks } from '../services/deckService'
import DeckCard from '../components/DeckCard/DeckCard'
import { SkeletonCard } from '../components/Skeleton/Skeleton'
import { showToast } from '../components/Toast/Toast'

export default function CategoryDetail() {
  const { categoryId } = useParams()
  const [category, setCategory] = useState(null)
  const [decks, setDecks] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    Promise.all([getCategories(), getDecks()])
      .then(([cats, allDecks]) => {
        const cat = cats.find(c => c.id === Number(categoryId))
        setCategory(cat ?? null)
        // Filter to only decks in this category.
        setDecks(allDecks.filter(d => d.category_id === Number(categoryId)))
      })
      .catch(() => showToast('Failed to load category', 'error'))
      .finally(() => setLoading(false))
  }, [categoryId])

  if (!loading && !category) {
    return (
      <div className="page">
        <p className="empty-state">Category not found.</p>
        <Link to="/categories" className="btn btn-secondary" style={{ marginTop: 16 }}>← Back to Categories</Link>
      </div>
    )
  }

  return (
    <div className="page">
      <div className="page-header">
        <div>
          <Link to="/categories" className="breadcrumb">← Categories</Link>
          {category && (
            <div className="cat-detail-heading">
              <span className="cat-detail-dot" style={{ background: category.color }} />
              <h1>{category.name}</h1>
            </div>
          )}
          {category?.description && (
            <p className="page-subtitle">{category.description}</p>
          )}
        </div>
      </div>

      <div className="deck-grid">
        {loading
          ? Array.from({ length: 3 }).map((_, i) => <SkeletonCard key={i} />)
          : decks.length === 0
            ? <p className="empty-state">No decks in this category yet.</p>
            : decks.map(deck => (
                <DeckCard
                  key={deck.id}
                  deck={deck}
                  onEdit={() => {}}
                  onDelete={() => {}}
                  onDuplicate={() => {}}
                />
              ))
        }
      </div>
    </div>
  )
}
