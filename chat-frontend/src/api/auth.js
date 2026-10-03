import axios from 'axios'

const normalizeBaseUrl = (value) =>
  typeof value === 'string' ? value.trim().replace(/\/+$/, '') : ''

const configuredApiUrl = normalizeBaseUrl(
  import.meta.env.VITE_API_URL || import.meta.env.VITE_BACKEND_URL
)
const isLocalDev = ['localhost', '127.0.0.1'].includes(window.location.hostname)
const apiBaseUrl = configuredApiUrl
  ? configuredApiUrl.replace(/\/api$/, '')
  : isLocalDev
    ? 'http://localhost:5000'
    : window.location.origin

const api = axios.create({
  baseURL: `${apiBaseUrl}/api`,
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