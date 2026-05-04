// DeckView.jsx

// This file displays all flashcards belonging to a single deck and provides full CRUD
// for those cards. Cards are managed through // the useCards hook which keeps local
// state in sync with the API. A shared modal dialog box handles both "create" and "edit"
// operations depending on whether an existing card is passed to it. Card content
// (question/answer) uses rich HTML produced by the TipTap editor. Support optional
// image uploads alongside text.

import { useState, useEffect } from 'react'
import { useParams, Link } from 'react-router-dom'
import { useCards } from '../hooks/useCards'
import { getDeck } from '../services/deckService'
import Editor from '../components/Editor/Editor'
import Modal from '../components/Modal/Modal'
import { SkeletonCard } from '../components/Skeleton/Skeleton'
import { showToast } from '../components/Toast/Toast'

export default function DeckView() {
  // deckId comes from the URL parameter (e.g. /decks/3)
  const { deckId } = useParams()

  // useCards manages the card array and supports the CRUD helpers that update both
  // the API and local state. deckId is tied to a Number because URL params
  // are always strings.
  const { cards, loading, addCard, editCard, removeCard } = useCards(Number(deckId))

  // Deck metadata is fetched independently — it's only needed for the heading
  // and isn't part of the card list returned by useCards.
  const [deck, setDeck] = useState(null)

  // Controls visibility of the create/edit modal.
  const [showModal, setShowModal] = useState(false)

  // When the user is editing, the modal is in "edit" mode for this specific card
  // object. When the "edit" state is set to null, the modal is in "create" mode.
  const [editingCard, setEditingCard] = useState(null)

  // Holds the card object that the user has clicked on the "delete" button.
  // A non-null value causes the confirmation modal to render.
  const [deletingCard, setDeletingCard] = useState(null)

  // Controlled form state shared between create and edit flows.
  // image is a File object (from the file input) or null if no image was chosen.
  const [form, setForm] = useState({ question: '', answer: '', image: null })

  // Fetch deck metadata once on mount (and whenever deckId changes).
  useEffect(() => {
    getDeck(deckId).then(setDeck).catch(() => showToast('Failed to load deck', 'error'))
  }, [deckId])

  useEffect(() => {
    if (deck) document.title = `${deck.name} - Cardie`
  }, [deck])

  // Opens the create/edit modal. When the user edits an existing card object, the
  // form is filled with that card's current content. Otherwise, when called with no
  // argument (no card object is involved here), it resets the form for
  // a new card.
  const openModal = (card = null) => {
    setEditingCard(card)
    setForm(card ? { question: card.question, answer: card.answer, image: null } : { question: '', answer: '', image: null })
    setShowModal(true)
  }

  const saveCard = async () => {
    // Use a form-data here so that the optional image file
    // can be included alongside the text fields in a single request.
    const fd = new FormData()
    fd.append('question', form.question)
    fd.append('answer', form.answer)
    // Only append the image field when the user has actually selected a file;
    // omitting it tells the backend to leave the existing image unchanged.
    if (form.image) fd.append('image', form.image)
    try {
      if (editingCard) {
        await editCard(editingCard.id, fd)
        showToast('Your card has been successfully updated.')
      } else {
        await addCard(fd)
        showToast('Your card has been successfully created')
      }
      setShowModal(false)
    } catch {
      showToast('Failed to save your card.', 'error')
    }
  }

  const confirmDelete = async () => {
    try {
      await removeCard(deletingCard.id)
      showToast('Your card has been successfully deleted.')
    } catch {
      showToast('Failed to delete your card.', 'error')
    }
    // Clear deletingCard regardless of success/failure to close the modal.
    setDeletingCard(null)
  }

  return (
    <div className="page">
      <div className="page-header">
        <div>
          <Link to="/decks" className="breadcrumb">← Decks</Link>
          {/* Show a loading placeholder in the heading until the deck fetch finishes. */}
          <h1>{deck?.name ?? 'Loading…'}</h1>
          {/* Only render the description paragraph if the deck has one. */}
          {deck?.description && <p className="deck-desc">{deck.description}</p>}
        </div>
        <div className="page-header-actions">
          <Link to={`/decks/${deckId}/dashboard`} className="btn btn-secondary">📈 Dashboard</Link>
          <Link to={`/decks/${deckId}/study`} className="btn btn-primary">▶ Study</Link>
          {/* Calling openModal() with no argument to open the modal in "create" mode. */}
          <button className="btn btn-secondary" onClick={() => openModal()}>+ Add Card</button>
        </div>
      </div>

      <div className="card-grid">
        {loading
          // While cards are loading, render 3 skeleton placeholders to prevent
          // layout messing-ups and give the user visual feedback.
          ? Array.from({ length: 3 }).map((_, i) => <SkeletonCard key={i} />)
          : cards.map(card => (
              <div key={card.id} className="flashcard-preview">
                {/* Only render the image element when this card has an uploaded image.
                    The filename is extracted from the stored path (e.g. "uploads/card_3.jpg")
                    so it can be served via the /api/uploads static route. */}
                {card.image_path && (
                  <img src={`/api/uploads/${card.image_path.split('/').pop()}`} alt="" className="card-thumb" />
                )}
                {/* Question and answer are stored as TipTap HTML strings, so
                    dangerouslySetInnerHTML is required to render formatting like
                    bold, italics, and code blocks. Content comes from the user's
                    own input, not external sources. */}
                <div className="flashcard-q" dangerouslySetInnerHTML={{ __html: card.question }} />
                <div className="flashcard-a" dangerouslySetInnerHTML={{ __html: card.answer }} />
                {/* Cumulative rating counts from all past study sessions. */}
                <div className="flashcard-stats">
                  <span title="Easy">Easy: {card.ease_count}</span>
                  <span title="Hard">Hard: {card.hard_count}</span>
                  <span title="Missed">Missed: {card.missed_count}</span>
                </div>
                <div className="flashcard-actions">
                  {/* Pass the full card object to openModal so the form is pre-filled. */}
                  <button className="btn-icon" onClick={() => openModal(card)}>✏️</button>
                  {/* Store the card in state rather than deleting immediately so the
                      confirmation modal can display its details before committing. */}
                  <button className="btn-icon btn-icon-danger" onClick={() => setDeletingCard(card)}>🗑️</button>
                </div>
              </div>
            ))}
        {!loading && cards.length === 0 && (
          <p className="empty-state">This deck has no cards yet. Add one to get started!</p>
        )}
      </div>

      {/* Create / edit modal — rendered only when showModal is set to true.
          The title and confirm button label adapt based on whether editingCard is set. */}
      {showModal && (
        <Modal
          title={editingCard ? 'Edit Card' : 'New Card'}
          onClose={() => setShowModal(false)}
          onConfirm={saveCard}
          confirmLabel={editingCard ? 'Save' : 'Create'}
        >
          <label className="form-label">Question *</label>
          {/* Functional state update (f => ...) prevents stale closure issues
              when the Editor's onChange is triggered admist a render cycle. */}
          <Editor content={form.question} onChange={q => setForm(f => ({ ...f, question: q }))} />
          <label className="form-label">Answer *</label>
          <Editor content={form.answer} onChange={a => setForm(f => ({ ...f, answer: a }))} />
          <label className="form-label">Image (optional)</label>
          {/* e.target.files[0] is the first selected File object; we store it
              directly and pass it to FormData when the form is submitted. */}
          <input type="file" accept="image/*" className="form-input" onChange={e => setForm(f => ({ ...f, image: e.target.files[0] }))} />
        </Modal>
      )}

      {/* Delete confirmation modal — rendered only when a card is staged for deletion. */}
      {deletingCard && (
        <Modal title="Delete Card" onClose={() => setDeletingCard(null)} onConfirm={confirmDelete} confirmLabel="Delete" danger>
          <p>Are you sure you want to permanently delete this card?</p>
        </Modal>
      )}
    </div>
  )
}
