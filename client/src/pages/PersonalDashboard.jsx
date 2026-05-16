import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { getPersonalDashboard } from '../services/sessionService'
import { SkeletonCard } from '../components/Skeleton/Skeleton'

function BarChart({ data, labelKey, valueKey, color = 'var(--primary)' }) {
  if (!data || data.length === 0) return <p className="empty-state">No data yet</p>
  const max = Math.max(...data.map(d => Number(d[valueKey])), 1)
  return (
    <div className="bar-chart">
      {data.map((d, i) => (
        <div key={i} className="bar-col">
          <div className="bar-value">{Number(d[valueKey])}</div>
          <div
            className="bar"
            style={{ height: `${Math.max(4, (Number(d[valueKey]) / max) * 100)}%`, background: color }}
          />
          <div className="bar-label">{String(d[labelKey]).slice(5)}</div>
        </div>
      ))}
    </div>
  )
}

function StatCard({ label, value, sub, accent }) {
  return (
    <div className="stat-card" style={accent ? { borderTop: `3px solid ${accent}` } : {}}>
      <div className="stat-card-value">{value}</div>
      <div className="stat-card-label">{label}</div>
      {sub && <div className="stat-card-sub">{sub}</div>}
    </div>
  )
}

function stripHtml(html) {
  if (!html) return ''
  return html.replace(/<[^>]*>/g, '').slice(0, 80)
}

export default function PersonalDashboard() {
  useEffect(() => { document.title = 'Dashboard — Cardie' }, [])

  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [chartRange, setChartRange] = useState(7)

  useEffect(() => {
    getPersonalDashboard()
      .then(setData)
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [])

  if (loading) {
    return (
      <div className="page">
        <div className="page-header"><h1>Dashboard</h1></div>
        <div className="stat-cards-grid">
          {Array.from({ length: 6 }).map((_, i) => <SkeletonCard key={i} />)}
        </div>
      </div>
    )
  }

  if (!data) {
    return (
      <div className="page">
        <div className="page-header"><h1>Dashboard</h1></div>
        <p className="empty-state">Could not load dashboard data.</p>
      </div>
    )
  }

  const chartData = chartRange === 7
    ? (data.daily_cards || []).slice(-7)
    : (data.daily_cards || [])

  const accuracyPct = data.overall_accuracy ?? 0

  return (
    <div className="page">
      <div className="page-header">
        <h1>Dashboard</h1>
        <p className="page-subtitle">Your learning progress at a glance</p>
      </div>

      {/* ── Top stats ──────────────────────────────────────────── */}
      <div className="stat-cards-grid">
        <StatCard
          label="Study Streak"
          value={`${data.streak} day${data.streak !== 1 ? 's' : ''}`}
          sub={data.streak > 0 ? '🔥 Keep it up!' : 'Start studying to build a streak'}
          accent="var(--accent)"
        />
        <StatCard label="Cards Today" value={data.cards_today ?? 0} sub="cards studied" accent="var(--primary)" />
        <StatCard label="Cards This Week" value={data.cards_this_week ?? 0} sub="in the last 7 days" />
        <StatCard label="Cards This Month" value={data.cards_this_month ?? 0} sub="in the last 30 days" />
        <StatCard label="Overall Accuracy" value={`${accuracyPct}%`} sub={`${data.total_easy} easy / ${data.total_studied} total`} accent="var(--success)" />
        <StatCard label="Total Sessions" value={data.total_sessions ?? 0} sub="study sessions completed" />
        <StatCard label="Total Decks" value={data.total_decks ?? 0} sub={<Link to="/decks">View my decks →</Link>} />
        <StatCard label="Total Cards" value={data.total_cards ?? 0} sub="flashcards in your library" />
      </div>

      {/* ── Activity chart ─────────────────────────────────────── */}
      <div className="dashboard-card">
        <div className="dashboard-card-header">
          <h2>Cards Studied Over Time</h2>
          <div className="chart-range-toggle">
            <button
              className={`btn btn-sm ${chartRange === 7 ? 'btn-primary' : 'btn-secondary'}`}
              onClick={() => setChartRange(7)}
            >Last 7 days</button>
            <button
              className={`btn btn-sm ${chartRange === 30 ? 'btn-primary' : 'btn-secondary'}`}
              onClick={() => setChartRange(30)}
            >Last 30 days</button>
          </div>
        </div>
        {chartData.length === 0
          ? <p className="empty-state">No study activity yet. Open a deck and hit Study to begin.</p>
          : <BarChart data={chartData} labelKey="day" valueKey="cards" />
        }
      </div>

      {/* ── Accuracy trend ─────────────────────────────────────── */}
      {data.accuracy_trend && data.accuracy_trend.length > 1 && (
        <div className="dashboard-card">
          <h2>Accuracy Trend <span className="stat-card-sub">(last {data.accuracy_trend.length} sessions)</span></h2>
          <BarChart
            data={data.accuracy_trend}
            labelKey="day"
            valueKey="accuracy_percent"
            color="var(--success)"
          />
        </div>
      )}

      {/* ── Deck highlights ────────────────────────────────────── */}
      <div className="dashboard-two-col">
        <div className="dashboard-card">
          <h2>Most Studied Deck</h2>
          {data.most_studied_deck
            ? (
              <div className="deck-highlight">
                <Link to={`/decks/${data.most_studied_deck.id}`} className="deck-highlight-name">
                  {data.most_studied_deck.name}
                </Link>
                <span className="deck-highlight-meta">{data.most_studied_deck.session_count} sessions</span>
              </div>
            )
            : <p className="empty-state">No sessions yet</p>
          }
        </div>
        <div className="dashboard-card">
          <h2>Least Studied Deck</h2>
          {data.least_studied_deck
            ? (
              <div className="deck-highlight">
                <Link to={`/decks/${data.least_studied_deck.id}`} className="deck-highlight-name">
                  {data.least_studied_deck.name}
                </Link>
                <span className="deck-highlight-meta">{data.least_studied_deck.session_count} sessions — needs attention</span>
              </div>
            )
            : <p className="empty-state">No sessions yet</p>
          }
        </div>
      </div>

      {/* ── Hardest / Easiest cards ────────────────────────────── */}
      <div className="dashboard-two-col">
        <div className="dashboard-card">
          <h2>Hardest Cards <span className="stat-card-sub">(most misses)</span></h2>
          {data.hardest_cards && data.hardest_cards.length > 0
            ? (
              <ul className="card-stat-list">
                {data.hardest_cards.map(c => (
                  <li key={c.id} className="card-stat-item">
                    <span className="card-stat-q">{stripHtml(c.question) || '(no text)'}</span>
                    <span className="card-stat-badge badge-missed">❌ {c.missed_count}</span>
                    <span className="card-stat-deck">{c.deck_name}</span>
                  </li>
                ))}
              </ul>
            )
            : <p className="empty-state">No missed cards yet — great job!</p>
          }
        </div>
        <div className="dashboard-card">
          <h2>Easiest Cards <span className="stat-card-sub">(most correct)</span></h2>
          {data.easiest_cards && data.easiest_cards.length > 0
            ? (
              <ul className="card-stat-list">
                {data.easiest_cards.map(c => (
                  <li key={c.id} className="card-stat-item">
                    <span className="card-stat-q">{stripHtml(c.question) || '(no text)'}</span>
                    <span className="card-stat-badge badge-easy">✅ {c.ease_count}</span>
                    <span className="card-stat-deck">{c.deck_name}</span>
                  </li>
                ))}
              </ul>
            )
            : <p className="empty-state">Rate some cards as easy to see them here</p>
          }
        </div>
      </div>

      {data.total_sessions === 0 && (
        <div className="dashboard-card empty-dashboard-cta">
          <p>You haven't studied yet. Open a deck and hit <strong>Study</strong> to begin tracking your progress.</p>
          <Link to="/decks" className="btn btn-primary">Go to My Decks</Link>
        </div>
      )}
    </div>
  )
}
