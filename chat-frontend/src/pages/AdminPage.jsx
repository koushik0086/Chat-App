import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { getAdminUsers, updateRole, deleteUser } from '../api/chat'
import { Shield, ArrowLeft, Trash2 } from 'lucide-react'

const ROLES = ['user', 'admin']
const roleColor = {
  admin: 'bg-purple-100 text-purple-700',
  user: 'bg-gray-100 text-gray-600'
}

export default function AdminPage() {
  const [users, setUsers] = useState([])
  const [loading, setLoading] = useState(true)
  const navigate = useNavigate()

  useEffect(() => {
    // ✅ fix: use r.data.users instead of r.data
    getAdminUsers()
      .then(r => setUsers(r.data.users))
      .finally(() => setLoading(false))
  }, [])

  const changeRole = async (userId, role) => {
    await updateRole(userId, role)
    setUsers(prev => prev.map(u => u._id === userId ? { ...u, role } : u))
  }

  const handleDelete = async (userId) => {
    if (!window.confirm('Are you sure you want to delete this user?')) return
    await deleteUser(userId)
    setUsers(prev => prev.filter(u => u._id !== userId))
  }

  return (
    <div className="min-h-screen p-8" style={{background:'#f1f5f9'}}>
      <div className="max-w-2xl mx-auto">
        {/* Header */}
        <div className="flex items-center gap-3 mb-6">
          <button onClick={() => navigate('/chat')}
            className="w-8 h-8 rounded-lg border border-gray-200 bg-white flex items-center justify-center text-slate-400 hover:bg-gray-50">
            <ArrowLeft size={15}/>
          </button>
          <h1 className="text-xl font-semibold flex items-center gap-2 text-slate-800">
            <Shield size={20} color="#6366f1"/> Admin panel
          </h1>
          <span className="ml-auto text-xs text-slate-400">{users.length} users</span>
        </div>

        {/* Users list */}
        {loading ? (
          <p className="text-center text-slate-400 text-sm mt-10">Loading users...</p>
        ) : (
          <div className="space-y-2">
            {users.map(u => {
              // ✅ fix: use name instead of username
              const displayName = u.name || u.username || 'Unknown'
              return (
                <div key={u._id} className="flex items-center justify-between bg-white border border-gray-100 rounded-xl px-4 py-3">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-medium"
                      style={{background:'#eef2ff', color:'#6366f1'}}>
                      {displayName[0]?.toUpperCase()}
                    </div>
                    <div>
                      <p className="font-medium text-sm text-slate-700">{displayName}</p>
                      <p className="text-xs text-gray-400">{u.email}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className={`text-xs px-2 py-0.5 rounded-full ${roleColor[u.role] || roleColor.user}`}>
                      {u.role}
                    </span>
                    <select value={u.role} onChange={e => changeRole(u._id, e.target.value)}
                      className="text-xs border border-gray-200 rounded-lg px-2 py-1 outline-none bg-white">
                      {ROLES.map(r => <option key={r}>{r}</option>)}
                    </select>
                    <button onClick={() => handleDelete(u._id)}
                      className="w-7 h-7 rounded-lg flex items-center justify-center text-red-400 hover:bg-red-50">
                      <Trash2 size={13}/>
                    </button>
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}