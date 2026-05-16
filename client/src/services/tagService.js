import api from './api'

export const getTags = async () => {
  const { data } = await api.get('/tags')
  return data
}

export const createTag = async (name, color = '#6366f1') => {
  const { data } = await api.post('/tags', { name, color })
  return data
}

export const updateTag = async (id, fields) => {
  const { data } = await api.patch(`/tags/${id}`, fields)
  return data
}

export const deleteTag = async (id) => {
  await api.delete(`/tags/${id}`)
}

export const getCardTags = async (cardId) => {
  const { data } = await api.get(`/cards/${cardId}/tags`)
  return data
}

export const assignTag = async (cardId, tagId) => {
  await api.post(`/cards/${cardId}/tags`, { tag_id: tagId })
}

export const removeTagFromCard = async (cardId, tagId) => {
  await api.delete(`/cards/${cardId}/tags/${tagId}`)
}
