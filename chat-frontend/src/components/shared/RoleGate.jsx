import { useAuthStore } from '../../store/authStore'

export default function RoleGate({ roles, children }) {
  const { user } = useAuthStore()
  if (!user || !roles.includes(user.role)) return null
  return children
}