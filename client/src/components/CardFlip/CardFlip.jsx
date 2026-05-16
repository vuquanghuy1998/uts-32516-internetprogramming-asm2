import CardDisplay from '../Editor/CardDisplay'

export default function CardFlip({ card, isFlipped, onFlip, deckStyle }) {
  const faceStyle = deckStyle ? {
    background: deckStyle.style_bg_color,
    color: deckStyle.style_text_color,
    borderRadius: deckStyle.style_border_style === 'rounded' ? 10 : deckStyle.style_border_style === 'none' ? 0 : 2,
    fontSize: deckStyle.style_font_size === 'small' ? '0.85rem' : deckStyle.style_font_size === 'large' ? '1.1rem' : '1rem',
    fontFamily: deckStyle.style_font_family === 'serif' ? 'Georgia, serif'
      : deckStyle.style_font_family === 'mono' ? 'monospace'
      : deckStyle.style_font_family === 'decorative' ? '"Syne", sans-serif'
      : 'inherit',
  } : {}

  return (
    <div
      className={`card-flip-scene ${isFlipped ? 'flipped' : ''}`}
      onClick={onFlip}
      role="button"
      tabIndex={0}
      onKeyDown={e => e.key === ' ' && onFlip()}
    >
      <div className="card-flip-inner">
        <div className="card-face card-front" style={faceStyle}>
          {card.image_path && (
            <img src={`/api/uploads/${card.image_path.split('/').pop()}`} alt="Card" className="card-image" />
          )}
          <div className="card-content">
            <CardDisplay html={card.question} />
          </div>
          <span className="card-hint">Click or press Space to reveal</span>
        </div>
        <div className="card-face card-back" style={faceStyle}>
          <div className="card-content">
            <CardDisplay html={card.answer} />
          </div>
        </div>
      </div>
    </div>
  )
}
