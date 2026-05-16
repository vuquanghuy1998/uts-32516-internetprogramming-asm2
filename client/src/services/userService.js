import api from './api'

export const getMe = async () => {
  const { data } = await api.get('/users/me')
  return data
}

export const updateMe = async (fields) => {
  const { data } = await api.patch('/users/me', fields)
  return data
}

export const changePassword = async (currentPassword, newPassword) => {
  const { data } = await api.post('/users/me/password', {
    current_password: currentPassword,
    new_password: newPassword,
  })
  return data
}

export const uploadAvatar = async (file) => {
  const fd = new FormData()
  fd.append('image', file)
  const { data } = await api.post('/users/me/avatar', fd, {
    headers: { 'Content-Type': 'multipart/form-data' },
  })
  return data
}

export const getMySessions = async () => {
  const { data } = await api.get('/users/me/sessions')
  return data
}

// Admin
export const getAdminStats = async () => {
  const { data } = await api.get('/users/admin-stats')
  return data
}

export const getAllUsers = async () => {
  const { data } = await api.get('/users')
  return data
}

export const getUserById = async (id) => {
  const { data } = await api.get(`/users/${id}`)
  return data
}

export const editUser = async (id, fields) => {
  const { data } = await api.patch(`/users/${id}`, fields)
  return data
}

export const setUserRole = async (id, role) => {
  const { data } = await api.patch(`/users/${id}/role`, { role })
  return data
}

export const toggleUserActive = async (id, isActive) => {
  const { data } = await api.patch(`/users/${id}/active`, { is_active: isActive })
  return data
}

export const deleteUser = async (id) => {
  await api.delete(`/users/${id}`)
}

export const getUserSessions = async (id) => {
  const { data } = await api.get(`/users/${id}/sessions`)
  return data
}
