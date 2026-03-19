import { useEffect, useState } from 'react'
import { getAdminUsers, updateRole } from '../api/chat'
import { Shield } from 'lucide-react'

const ROLES = ['user', 'moderator', 'admin']
const roleColor = { admin: 'bg-purple-100 text-purple-700', moderator: 'bg-blue-100 text-blue-700', user: 'bg-gray-100 text-gray-600' }

export default function AdminPage() {
  const [users, setUsers] = useState([])

  useEffect(() => {
    getAdminUsers().then(r => setUsers(r.data))
  }, [])

  const changeRole = async (userId, role) => {
    await updateRole(userId, role)
    setUsers(prev => prev.map(u => u._id === userId ? { ...u, role } : u))
  }

  return (
    <div className="p-8 max-w-2xl mx-auto">
      <h1 className="text-2xl font-semibold mb-6 flex items-center gap-2">
        <Shield size={22}/> Admin panel
      </h1>
      <div className="space-y-2">
        {users.map(u => (
          <div key={u._id} className="flex items-center justify-between bg-white border rounded-xl px-4 py-3">
            <div>
              <p className="font-medium text-sm">{u.username}</p>
              <p className="text-xs text-gray-400">{u.email}</p>
            </div>
            <div className="flex items-center gap-2">
              <span className={`text-xs px-2 py-0.5 rounded-full ${roleColor[u.role]}`}>{u.role}</span>
              <select value={u.role} onChange={e => changeRole(u._id, e.target.value)}
                className="text-xs border rounded-lg px-2 py-1 outline-none">
                {ROLES.map(r => <option key={r}>{r}</option>)}
              </select>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}