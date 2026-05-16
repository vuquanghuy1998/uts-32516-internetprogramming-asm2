import { Link } from 'react-router-dom'
import CategoryBadge from '../CategoryBadge/CategoryBadge'
import { DeckCoverDisplay } from '../deck/CoverPicker'

export default function DeckCard({ deck, onEdit, onDelete, onDuplicate }) {
  const mastery = deck.total_ratings > 0
    ? Math.round((deck.ease_count / deck.total_ratings) * 100)
    : 0

  return (
    <div className="deck-card">
      <DeckCoverDisplay deck={deck} className="deck-card-cover" />
      <div className="deck-card-header">
        {deck.category_name && (
          <CategoryBadge name={deck.category_name} color={deck.category_color} />
        )}
        {(onEdit || onDelete || onDuplicate) && (
          <div className="deck-card-actions">
            {onEdit && <button className="btn-icon" onClick={() => onEdit(deck)} title="Edit">✏️</button>}
            {onDuplicate && <button className="btn-icon" onClick={() => onDuplicate(deck.id)} title="Duplicate">📋</button>}
            {onDelete && <button className="btn-icon btn-icon-danger" onClick={() => onDelete(deck)} title="Delete">🗑️</button>}
          </div>
        )}
      </div>
      <Link to={`/decks/${deck.id}`} className="deck-card-title">{deck.name}</Link>
      {deck.description && <p className="deck-card-desc" dangerouslySetInnerHTML={{ __html: deck.description }} />}
      <div className="deck-card-meta">
        <span>{deck.card_count ?? 0} cards</span>
        <span>{mastery}% mastery</span>
        {deck.last_studied && (
          <span>Studied {new Date(deck.last_studied).toLocaleDateString()}</span>
        )}
      </div>
      <Link to={`/decks/${deck.id}/study`} className="btn btn-primary deck-study-btn">Study</Link>
    </div>
  )
}
