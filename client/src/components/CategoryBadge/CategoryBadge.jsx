export default function CategoryBadge({ name, color = '#6366f1' }) {
  return (
    <span
      className="category-badge"
      style={{ backgroundColor: color + '22', color, borderColor: color }}
    >
      {name}
    </span>
  )
}
