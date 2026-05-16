import { useState, useEffect } from 'react'
import { getAllUsers, editUser, setUserRole, toggleUserActive, deleteUser, getUserSessions } from '../services/userService'
import Modal from '../components/Modal/Modal'
import { showToast } from '../components/Toast/Toast'
import { useAuth } from '../context/AuthContext'

export default function AdminPage() {
  const { user: me } = useAuth()
  const [users, setUsers] = useState([])
  const [loading, setLoading] = useState(true)
  const [selectedUser, setSelectedUser] = useState(null)
  const [sessions, setSessions] = useState([])
  const [showSessions, setShowSessions] = useState(false)
  const [deletingUser, setDeletingUser] = useState(null)

  useEffect(() => { document.title = 'Admin — Cardie' }, [])

  useEffect(() => {
    getAllUsers()
      .then(setUsers)
      .catch(() => showToast('Failed to load users', 'error'))
      .finally(() => setLoading(false))
  }, [])

  const handleToggleActive = async (u) => {
    try {
      const updated = await toggleUserActive(u.id, !u.is_active)
      setUsers(prev => prev.map(x => x.id === u.id ? updated : x))
      showToast(updated.is_active ? 'User activated' : 'User deactivated')
    } catch {
      showToast('Failed to update user', 'error')
    }
  }

  const handlePromote = async (u) => {
    const newRole = u.role === 'admin' ? 'user' : 'admin'
    try {
      const updated = await setUserRole(u.id, newRole)
      setUsers(prev => prev.map(x => x.id === u.id ? updated : x))
      showToast(`Role updated to ${newRole}`)
    } catch {
      showToast('Failed to update role', 'error')
    }
  }

  const handleViewSessions = async (u) => {
    setSelectedUser(u)
    try {
      const data = await getUserSessions(u.id)
      setSessions(data)
    } catch {
      setSessions([])
    }
    setShowSessions(true)
  }

  const handleDelete = async () => {
    try {
      await deleteUser(deletingUser.id)
      setUsers(prev => prev.filter(x => x.id !== deletingUser.id))
      showToast('User deleted')
    } catch {
      showToast('Failed to delete user', 'error')
    }
    setDeletingUser(null)
  }

  const fmt = (ts) => ts ? new Date(ts).toLocaleDateString() : '—'

  return (
    <div className="page">
      <div className="page-header">
        <h1>Admin Dashboard</h1>
        <span className="page-subtitle">{users.length} registered users</span>
      </div>

      {/* ── Summary stats ─────────────────────────────────────── */}
      <div className="admin-stats">
        <div className="stat-pill">
          <span className="stat-num">{users.length}</span>
          <span className="stat-label">Total Users</span>
        </div>
        <div className="stat-pill">
          <span className="stat-num">{users.filter(u => u.is_active).length}</span>
          <span className="stat-label">Active</span>
        </div>
        <div className="stat-pill">
          <span className="stat-num">{users.filter(u => u.role === 'admin').length}</span>
          <span className="stat-label">Admins</span>
        </div>
      </div>

      {/* ── Users table ───────────────────────────────────────── */}
      <div className="dashboard-card" style={{ overflowX: 'auto' }}>
        <h2>All Users</h2>
        {loading ? (
          <p className="empty-state">Loading…</p>
        ) : (
          <table className="admin-table">
            <thead>
              <tr>
                <th>Username</th>
                <th>Email</th>
                <th>Role</th>
                <th>Status</th>
                <th>Last Login</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {users.map(u => (
                <tr key={u.id} className={!u.is_active ? 'row-inactive' : ''}>
                  <td>
                    <strong>{u.username}</strong>
                    {u.full_name && <span className="user-fullname"> — {u.full_name}</span>}
                    {u.id === me?.id && <span className="badge-you"> (you)</span>}
                  </td>
                  <td>{u.email}</td>
                  <td>
                    <span className={`role-badge role-${u.role}`}>{u.role}</span>
                  </td>
                  <td>
                    <span className={`status-dot ${u.is_active ? 'active' : 'inactive'}`}>
                      {u.is_active ? 'Active' : 'Inactive'}
                    </span>
                  </td>
                  <td>{fmt(u.last_login)}</td>
                  <td>
                    <div className="admin-actions">
                      <button className="btn btn-sm btn-secondary" onClick={() => handleViewSessions(u)}>
                        Sessions
                      </button>
                      {u.id !== me?.id && (
                        <>
                          <button className="btn btn-sm btn-secondary" onClick={() => handleToggleActive(u)}>
                            {u.is_active ? 'Deactivate' : 'Activate'}
                          </button>
                          <button className="btn btn-sm btn-secondary" onClick={() => handlePromote(u)}>
                            {u.role === 'admin' ? 'Demote' : 'Make Admin'}
                          </button>
                          <button className="btn btn-sm btn-danger" onClick={() => setDeletingUser(u)}>
                            Delete
                          </button>
                        </>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* ── Session history modal ─────────────────────────────── */}
      {showSessions && (
        <Modal
          title={`Sessions — ${selectedUser?.username}`}
          onClose={() => setShowSessions(false)}
          onConfirm={() => setShowSessions(false)}
          confirmLabel="Close"
        >
          {sessions.length === 0 ? (
            <p className="empty-state">No sessions yet</p>
          ) : (
            <table className="session-table">
              <thead>
                <tr><th>Deck</th><th>Cards</th><th>Accuracy</th><th>Date</th></tr>
              </thead>
              <tbody>
                {sessions.map(s => (
                  <tr key={s.id}>
                    <td>{s.deck_name}</td>
                    <td>{s.total_cards}</td>
                    <td>{s.accuracy_percent}%</td>
                    <td>{fmt(s.studied_at)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </Modal>
      )}

      {/* ── Delete confirmation ───────────────────────────────── */}
      {deletingUser && (
        <Modal
          title="Delete User"
          onClose={() => setDeletingUser(null)}
          onConfirm={handleDelete}
          confirmLabel="Delete"
          danger
        >
          <p>Permanently delete <strong>{deletingUser.username}</strong>? All their decks and study data will be deleted.</p>
        </Modal>
      )}
    </div>
  )
}
