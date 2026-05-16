import axios from 'axios'

const api = axios.create({
  baseURL: '/api',
  headers: { 'Content-Type': 'application/json' },
})

// Attach JWT from localStorage on every request
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('cardie_token')
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

// On 401, clear stale token so the app redirects to login
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('cardie_token')
      localStorage.removeItem('cardie_user')
      // Signal to AuthContext that the session has expired
      window.dispatchEvent(new Event('cardie:session-expired'))
    }
    return Promise.reject(error)
  },
)

export default api
