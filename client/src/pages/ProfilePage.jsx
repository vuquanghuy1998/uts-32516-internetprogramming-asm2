import { useState, useEffect, useRef } from 'react'
import { useAuth } from '../context/AuthContext'
import { useTheme } from '../context/ThemeContext'
import { updateMe, changePassword, uploadAvatar } from '../services/userService'
import { showToast } from '../components/Toast/Toast'
import Modal from '../components/Modal/Modal'

export default function ProfilePage() {
  const { user, updateUser } = useAuth()
  const { darkMode, toggleDarkMode } = useTheme()

  const [form, setForm] = useState({
    full_name: user?.full_name || '',
    username: user?.username || '',
    email: user?.email || '',
    bio: user?.bio || '',
  })
  const [saving, setSaving] = useState(false)
  const [avatarUploading, setAvatarUploading] = useState(false)
  const avatarFileRef = useRef(null)

  const [showPwModal, setShowPwModal] = useState(false)
  const [pwForm, setPwForm] = useState({ current: '', next: '', confirm: '' })
  const [pwError, setPwError] = useState('')
  const [pwSaving, setPwSaving] = useState(false)

  useEffect(() => { document.title = 'My Profile — Cardie' }, [])

  const saveProfile = async () => {
    setSaving(true)
    try {
      const updated = await updateMe({
        full_name: form.full_name,
        username: form.username,
        email: form.email,
        bio: form.bio,
      })
      updateUser(updated)
      showToast('Profile saved')
    } catch (err) {
      const msg = err.response?.data?.detail || 'Failed to save profile'
      showToast(msg, 'error')
    } finally {
      setSaving(false)
    }
  }

  const handleAvatarChange = async (e) => {
    const file = e.target.files?.[0]
    if (!file) return
    setAvatarUploading(true)
    try {
      const { avatar_url } = await uploadAvatar(file)
      updateUser({ avatar_url })
      showToast('Avatar updated')
    } catch {
      showToast('Failed to upload avatar', 'error')
    } finally {
      setAvatarUploading(false)
      e.target.value = ''
    }
  }

  const handleThemeChange = async (pref) => {
    if (pref === 'dark' && !darkMode) toggleDarkMode()
    if (pref === 'light' && darkMode) toggleDarkMode()
    try {
      const updated = await updateMe({ theme_preference: pref })
      updateUser(updated)
    } catch { /* non-critical */ }
  }

  const handlePasswordSave = async () => {
    if (!pwForm.current || !pwForm.next) { setPwError('All fields required.'); return }
    if (pwForm.next.length < 6) { setPwError('New password must be at least 6 characters.'); return }
    if (pwForm.next !== pwForm.confirm) { setPwError('Passwords do not match.'); return }
    setPwSaving(true)
    setPwError('')
    try {
      await changePassword(pwForm.current, pwForm.next)
      showToast('Password changed')
      setShowPwModal(false)
      setPwForm({ current: '', next: '', confirm: '' })
    } catch (err) {
      setPwError(err.response?.data?.detail || 'Failed to change password')
    } finally {
      setPwSaving(false)
    }
  }

  return (
    <div className="page">
      <div className="page-header">
        <h1>My Profile</h1>
        <button className="btn btn-primary" onClick={saveProfile} disabled={saving}>
          {saving ? 'Saving…' : 'Save Changes'}
        </button>
      </div>

      <div className="profile-grid">
        {/* ── Basic info ─────────────────────────────────────────── */}
        <div className="dashboard-card">
          <h2>Account Details</h2>

          <div className="avatar-upload-row">
            {user?.avatar_url ? (
              <img
                src={user.avatar_url.startsWith('uploads/') ? `/api/${user.avatar_url}` : user.avatar_url}
                alt="avatar"
                className="avatar-preview"
              />
            ) : (
              <div className="avatar-placeholder">{user?.username?.[0]?.toUpperCase() ?? '?'}</div>
            )}
            <div>
              <button
                type="button"
                className="btn btn-secondary"
                onClick={() => avatarFileRef.current?.click()}
                disabled={avatarUploading}
              >
                {avatarUploading ? 'Uploading…' : '📷 Upload Profile Photo…'}
              </button>
              <p className="form-hint" style={{ marginTop: 6 }}>JPG, PNG or GIF · Max 5 MB</p>
            </div>
          </div>
          <input
            ref={avatarFileRef}
            type="file"
            accept="image/*"
            style={{ display: 'none' }}
            onChange={handleAvatarChange}
          />

          <label className="form-label">Full Name</label>
          <input className="form-input" value={form.full_name}
            placeholder="Your display name"
            onChange={e => setForm(f => ({ ...f, full_name: e.target.value }))} />

          <label className="form-label">Username</label>
          <input className="form-input" value={form.username}
            onChange={e => setForm(f => ({ ...f, username: e.target.value }))} />

          <label className="form-label">Email</label>
          <input className="form-input" type="email" value={form.email}
            onChange={e => setForm(f => ({ ...f, email: e.target.value }))} />

          <label className="form-label">Bio</label>
          <textarea className="form-input" rows={3} value={form.bio}
            placeholder="A short bio about yourself…"
            onChange={e => setForm(f => ({ ...f, bio: e.target.value }))} />
        </div>

        {/* ── Theme ──────────────────────────────────────────────── */}
        <div className="dashboard-card">
          <h2>Appearance</h2>
          <p className="page-subtitle">Choose your preferred colour scheme.</p>
          <div className="theme-options">
            {['light', 'dark', 'system'].map(t => (
              <button
                key={t}
                className={`theme-option-btn ${(t === 'dark' ? darkMode : t === 'light' ? !darkMode : false) ? 'active' : ''}`}
                onClick={() => handleThemeChange(t)}
              >
                {t === 'light' ? '☀️ Light' : t === 'dark' ? '🌙 Dark' : '💻 System'}
              </button>
            ))}
          </div>
        </div>

        {/* ── Security ───────────────────────────────────────────── */}
        <div className="dashboard-card">
          <h2>Security</h2>
          <p className="page-subtitle">Role: <strong>{user?.role}</strong></p>
          <button className="btn btn-secondary" onClick={() => setShowPwModal(true)}>Change Password</button>
        </div>
      </div>

      {showPwModal && (
        <Modal
          title="Change Password"
          onClose={() => { setShowPwModal(false); setPwError('') }}
          onConfirm={handlePasswordSave}
          confirmLabel={pwSaving ? 'Saving…' : 'Change Password'}
        >
          <label className="form-label">Current Password</label>
          <input type="password" className="form-input" value={pwForm.current}
            onChange={e => { setPwForm(f => ({ ...f, current: e.target.value })); setPwError('') }} />
          <label className="form-label">New Password</label>
          <input type="password" className="form-input" value={pwForm.next}
            onChange={e => { setPwForm(f => ({ ...f, next: e.target.value })); setPwError('') }} />
          <label className="form-label">Confirm New Password</label>
          <input type="password" className="form-input" value={pwForm.confirm}
            onChange={e => { setPwForm(f => ({ ...f, confirm: e.target.value })); setPwError('') }} />
          {pwError && <p className="field-error">{pwError}</p>}
        </Modal>
      )}
    </div>
  )
}
