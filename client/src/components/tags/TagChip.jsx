export default function TagChip({ tag, onRemove }) {
  return (
    <span
      className="tag-chip"
      style={{ background: tag.color + '22', color: tag.color, borderColor: tag.color + '55' }}
    >
      {tag.name}
      {onRemove && (
        <button
          className="tag-chip-remove"
          onClick={() => onRemove(tag)}
          aria-label={`Remove tag ${tag.name}`}
        >
          ×
        </button>
      )}
    </span>
  )
}
