import api from './api'

export const getDecks = () => api.get('/decks').then(r => r.data)
export const getDeck = (id) => api.get(`/decks/${id}`).then(r => r.data)
export const createDeck = (data) => api.post('/decks', data).then(r => r.data)
export const updateDeck = (id, data) => api.put(`/decks/${id}`, data).then(r => r.data)
export const deleteDeck = (id) => api.delete(`/decks/${id}`).then(r => r.data)
export const duplicateDeck = (id) => api.post(`/decks/${id}/duplicate`).then(r => r.data)

export const uploadDeckCover = (id, file) => {
  const fd = new FormData()
  fd.append('image', file)
  return api.post(`/decks/${id}/cover`, fd, {
    headers: { 'Content-Type': 'multipart/form-data' },
  }).then(r => r.data)
}

export const setDeckPresetCover = (id, presetKey) => {
  const fd = new FormData()
  fd.append('preset_key', presetKey)
  return api.post(`/decks/${id}/cover`, fd, {
    headers: { 'Content-Type': 'multipart/form-data' },
  }).then(r => r.data)
}
