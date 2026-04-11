import { useState, useEffect } from 'react'
import { useParams, Link } from 'react-router-dom'
import { useCards } from '../hooks/useCards'
import { getDeck } from '../services/deckService'
import Editor from '../components/Editor/Editor'
import Modal from '../components/Modal/Modal'
import { SkeletonCard } from '../components/Skeleton/Skeleton'
import { showToast } from '../components/Toast/Toast'

export default function DeckView() {
  const { deckId } = useParams()
  const { cards, loading, addCard, editCard, removeCard } = useCards(Number(deckId))
  const [deck, setDeck] = useState(null)
  const [showModal, setShowModal] = useState(false)
  const [editingCard, setEditingCard] = useState(null)
  const [deletingCard, setDeletingCard] = useState(null)
  const [form, setForm] = useState({ question: '', answer: '', image: null })

  useEffect(() => {
    getDeck(deckId).then(setDeck).catch(() => showToast('Failed to load deck', 'error'))
  }, [deckId])

  const openModal = (card = null) => {
    setEditingCard(card)
    setForm(card ? { question: card.question, answer: card.answer, image: null } : { question: '', answer: '', image: null })
    setShowModal(true)
  }

  const saveCard = async () => {
    const fd = new FormData()
    fd.append('question', form.question)
    fd.append('answer', form.answer)
    if (form.image) fd.append('image', form.image)
    try {
      if (editingCard) {
        await editCard(editingCard.id, fd)
        showToast('Card updated')
      } else {
        await addCard(fd)
        showToast('Card created')
      }
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

  return (
    <div className="page">
      <div className="page-header">
        <div>
          <Link to="/" className="breadcrumb">← Decks</Link>
          <h1>{deck?.name ?? 'Loading…'}</h1>
          {deck?.description && <p className="deck-desc">{deck.description}</p>}
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
              <div key={card.id} className="flashcard-preview">
                {card.image_path && (
                  <img src={`/api/uploads/${card.image_path.split('/').pop()}`} alt="" className="card-thumb" />
                )}
                <div className="flashcard-q" dangerouslySetInnerHTML={{ __html: card.question }} />
                <div className="flashcard-a" dangerouslySetInnerHTML={{ __html: card.answer }} />
                <div className="flashcard-stats">
                  <span title="Easy">✅ {card.ease_count}</span>
                  <span title="Hard">😰 {card.hard_count}</span>
                  <span title="Missed">❌ {card.missed_count}</span>
                </div>
                <div className="flashcard-actions">
                  <button className="btn-icon" onClick={() => openModal(card)}>✏️</button>
                  <button className="btn-icon btn-icon-danger" onClick={() => setDeletingCard(card)}>🗑️</button>
                </div>
              </div>
            ))}
        {!loading && cards.length === 0 && (
          <p className="empty-state">No cards yet. Add one to get started!</p>
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
          <Editor content={form.question} onChange={q => setForm(f => ({ ...f, question: q }))} />
          <label className="form-label">Answer *</label>
          <Editor content={form.answer} onChange={a => setForm(f => ({ ...f, answer: a }))} />
          <label className="form-label">Image (optional)</label>
          <input type="file" accept="image/*" className="form-input" onChange={e => setForm(f => ({ ...f, image: e.target.files[0] }))} />
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
