import { Link } from 'react-router-dom'
import CategoryBadge from '../CategoryBadge/CategoryBadge'
import { DeckCoverDisplay } from '../deck/CoverPicker'

export default function DeckCard({ deck, onEdit, onDelete, onDuplicate }) {
  const mastery = deck.total_ratings > 0
    ? Math.round((deck.ease_count / deck.total_ratings) * 100)
    : 0

  const masteryColor = mastery >= 90 ? 'var(--success)'
    : mastery >= 70 ? 'var(--primary)'
    : mastery >= 40 ? 'var(--accent)'
    : deck.total_ratings > 0 ? 'var(--danger)'
    : 'var(--border)'

  const lastStudied = deck.last_studied
    ? new Date(deck.last_studied).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })
    : null

  return (
    <div className="deck-card">
      {/* Cover — sits flush at the top, no padding */}
      <div className="deck-card-cover">
        <DeckCoverDisplay deck={deck} />
      </div>

      {/* Body — padded content area */}
      <div className="deck-card-body">
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

        {deck.description
          ? <div className="deck-card-desc" dangerouslySetInnerHTML={{ __html: deck.description }} />
          : <p className="deck-card-desc deck-card-desc--empty">No description yet.</p>
        }
      </div>

      {/* Metadata footer — separated by a border */}
      <div className="deck-card-meta">
        <span className="deck-meta-chip">
          <svg className="deck-meta-icon" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5">
            <rect x="2" y="3" width="12" height="10" rx="1.5" />
            <line x1="5" y1="7" x2="11" y2="7" />
            <line x1="5" y1="10" x2="9" y2="10" />
          </svg>
          {deck.card_count ?? 0} cards
        </span>

        <span className="deck-meta-chip">
          <span className="deck-meta-dot" style={{ background: masteryColor }} />
          {mastery}% mastery
        </span>

        {lastStudied ? (
          <span className="deck-meta-chip">
            <svg className="deck-meta-icon" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5">
              <rect x="2" y="3" width="12" height="11" rx="1.5" />
              <line x1="5" y1="1" x2="5" y2="5" />
              <line x1="11" y1="1" x2="11" y2="5" />
              <line x1="2" y1="7" x2="14" y2="7" />
            </svg>
            {lastStudied}
          </span>
        ) : (
          <span className="deck-meta-chip deck-meta-chip--muted">Not studied yet</span>
        )}
      </div>

      <Link to={`/decks/${deck.id}/study`} className="btn btn-primary deck-study-btn">Study →</Link>
    </div>
  )
}
