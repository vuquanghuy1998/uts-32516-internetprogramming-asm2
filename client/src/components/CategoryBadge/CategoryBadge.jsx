// CategoryBadge.jsx
// Small rectangular tag showing a category name with a left-border accent in
// the category's colour. Used on deck cards.

export default function CategoryBadge({ name, color = '#6366f1' }) {
  return (
    <span
      className="category-badge"
      style={{ borderLeftColor: color, color }}
    >
      {name}
    </span>
  )
}
