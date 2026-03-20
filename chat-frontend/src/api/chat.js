import api from './auth'

export const getRooms      = ()                => api.get('/rooms')
export const createRoom    = (name)            => api.post('/rooms', { name })
export const getMessages   = (roomId)          => api.get(`/messages/${roomId}`)
export const sendMessage   = (roomId, content) => api.post(`/messages/${roomId}`, { content })
export const getAdminUsers = ()                => api.get('/admin/users')
export const getAdminStats = ()                => api.get('/admin/stats')
export const updateRole    = (userId, role)    => api.patch(`/admin/users/${userId}/role`, { role })
export const getAllUsers    = ()                => api.get('/users')
export const deleteUser    = (userId)          => api.delete(`/admin/users/${userId}`)