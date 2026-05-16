// DeckStyleEditor — palette + dropdowns that write into the deck style object.
const BG_COLORS = [
  '#ffffff', '#f8f9fa', '#fff7ed', '#fefce8', '#f0fdf4',
  '#eff6ff', '#faf5ff', '#fff1f2', '#f0f9ff', '#1a1a2e',
]

const TEXT_COLORS = ['#1a1a2e', '#374151', '#4b5563', '#ffffff', '#f8f9fa']

export default function DeckStyleEditor({ style, onChange }) {
  const set = (key, val) => onChange({ ...style, [key]: val })

  return (
    <div className="style-editor">
      <p className="form-label">Card Style</p>

      <div className="style-row">
        <span className="style-label">Background</span>
        <div className="color-swatches">
          {BG_COLORS.map(c => (
            <button
              key={c}
              type="button"
              className={`swatch ${style.bg_color === c ? 'swatch-active' : ''}`}
              style={{ background: c, border: c === '#ffffff' ? '1.5px solid #e2e8f0' : 'none' }}
              onClick={() => set('bg_color', c)}
            />
          ))}
        </div>
      </div>

      <div className="style-row">
        <span className="style-label">Text</span>
        <div className="color-swatches">
          {TEXT_COLORS.map(c => (
            <button
              key={c}
              type="button"
              className={`swatch ${style.text_color === c ? 'swatch-active' : ''}`}
              style={{ background: c, border: '1.5px solid #e2e8f0' }}
              onClick={() => set('text_color', c)}
            />
          ))}
        </div>
      </div>

      <div className="style-row">
        <span className="style-label">Font Size</span>
        <div className="style-options">
          {['small', 'medium', 'large'].map(v => (
            <button
              key={v}
              type="button"
              className={`style-option-btn ${style.font_size === v ? 'active' : ''}`}
              onClick={() => set('font_size', v)}
            >
              {v.charAt(0).toUpperCase() + v.slice(1)}
            </button>
          ))}
        </div>
      </div>

      <div className="style-row">
        <span className="style-label">Font Family</span>
        <div className="style-options">
          {[
            { v: 'sans', label: 'Sans' },
            { v: 'serif', label: 'Serif' },
            { v: 'mono', label: 'Mono' },
            { v: 'decorative', label: 'Decorative' },
          ].map(({ v, label }) => (
            <button
              key={v}
              type="button"
              className={`style-option-btn ${style.font_family === v ? 'active' : ''}`}
              onClick={() => set('font_family', v)}
            >
              {label}
            </button>
          ))}
        </div>
      </div>

      <div className="style-row">
        <span className="style-label">Border</span>
        <div className="style-options">
          {['none', 'rounded', 'sharp'].map(v => (
            <button
              key={v}
              type="button"
              className={`style-option-btn ${style.border_style === v ? 'active' : ''}`}
              onClick={() => set('border_style', v)}
            >
              {v.charAt(0).toUpperCase() + v.slice(1)}
            </button>
          ))}
        </div>
      </div>

      {/* Live preview */}
      <div
        className="style-preview"
        style={{
          background: style.bg_color,
          color: style.text_color,
          borderRadius: style.border_style === 'rounded' ? 10 : style.border_style === 'none' ? 0 : 2,
          fontSize: style.font_size === 'small' ? '0.85rem' : style.font_size === 'large' ? '1.1rem' : '1rem',
          fontFamily: style.font_family === 'serif' ? 'Georgia, serif'
            : style.font_family === 'mono' ? 'monospace'
            : style.font_family === 'decorative' ? '"Syne", sans-serif'
            : 'inherit',
        }}
      >
        Preview — Question text
      </div>
    </div>
  )
}
