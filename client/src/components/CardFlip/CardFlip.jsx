export default function CardFlip({ card, isFlipped, onFlip }) {
  return (
    <div
      className={`card-flip-scene ${isFlipped ? 'flipped' : ''}`}
      onClick={onFlip}
      role="button"
      tabIndex={0}
      onKeyDown={e => e.key === ' ' && onFlip()}
    >
      <div className="card-flip-inner">
        <div className="card-face card-front">
          {card.image_path && (
            <img
              src={`/api/uploads/${card.image_path.split('/').pop()}`}
              alt="Card"
              className="card-image"
            />
          )}
          <div
            className="card-content"
            dangerouslySetInnerHTML={{ __html: card.question }}
          />
          <span className="card-hint">Click or press Space to reveal</span>
        </div>
        <div className="card-face card-back">
          <div
            className="card-content"
            dangerouslySetInnerHTML={{ __html: card.answer }}
          />
        </div>
      </div>
    </div>
  )
}
