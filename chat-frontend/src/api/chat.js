import api from './auth'

export const getRooms      = () => api.get('/rooms')
export const createRoom    = (name) => api.post('/rooms', { name })
export const getMessages   = (roomId) => api.get(`/rooms/${roomId}/messages`)
export const getAdminUsers = () => api.get('/admin/users')
export const updateRole    = (userId, role) => api.patch(`/admin/users/${userId}/role`, { role })