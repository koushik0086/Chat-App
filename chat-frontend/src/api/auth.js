import axios from 'axios'

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL
    ? `${import.meta.env.VITE_API_URL}/api`
    : 'http://localhost:5000/api'
})

api.interceptors.request.use(cfg => {
  const stored = JSON.parse(localStorage.getItem('chat-auth') || '{}')
  const token = stored?.state?.token
  if (token) cfg.headers.Authorization = `Bearer ${token}`
  return cfg
})

export const loginUser    = (data) => api.post('/auth/login', data)
export const registerUser = (data) => api.post('/auth/register', data)
export default api