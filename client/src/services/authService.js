import api from './api'

export const adminExists = async () => {
  const { data } = await api.get('/auth/admin-exists')
  return data.exists
}

export const register = async (username, email, password, fullName = '') => {
  const { data } = await api.post('/auth/register', { username, email, password, full_name: fullName })
  return data // { token, user }
}

export const login = async (identifier, password) => {
  const { data } = await api.post('/auth/login', { identifier, password })
  return data // { token, user }
}
