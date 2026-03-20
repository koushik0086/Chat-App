import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { getAdminUsers, updateRole, deleteUser, getRooms, getMessages } from '../api/chat'
import api from '../api/auth'
import { Shield, ArrowLeft, Trash2, Users, Hash, MessageSquare } from 'lucide-react'
import toast from 'react-hot-toast'

const ROLES = ['user', 'admin']
const roleColor = {
  admin: 'bg-purple-100 text-purple-700',
  user: 'bg-gray-100 text-gray-600'
}

export default function AdminPage() {
  const [tab, setTab] = useState('users')
  const [users, setUsers] = useState([])
  const [rooms, setRooms] = useState([])
  const [messages, setMessages] = useState([])
  const [selectedRoom, setSelectedRoom] = useState(null)
  const [loading, setLoading] = useState(true)
  const navigate = useNavigate()

  // ─── Load users ───────────────────────────────────────────
  useEffect(() => {
    if (tab === 'users') {
      setLoading(true)
      getAdminUsers()
        .then(r => setUsers(r.data.users))
        .finally(() => setLoading(false))
    }
  }, [tab])

  // ─── Load rooms ───────────────────────────────────────────
  useEffect(() => {
    if (tab === 'rooms') {
      setLoading(true)
      getRooms()
        .then(r => setRooms(r.data.rooms))
        .finally(() => setLoading(false))
    }
  }, [tab])

  // ─── Load messages for selected room ──────────────────────
  useEffect(() => {
    if (tab === 'messages' && selectedRoom) {
      setLoading(true)
      getMessages(selectedRoom._id)
        .then(r => setMessages(r.data.messages))
        .finally(() => setLoading(false))
    }
  }, [tab, selectedRoom])

  // ─── User actions ─────────────────────────────────────────
  const changeRole = async (userId, role) => {
    try {
      await updateRole(userId, role)
      setUsers(prev => prev.map(u => u._id === userId ? { ...u, role } : u))
      toast.success('Role updated!')
    } catch (e) {
      toast.error(e.response?.data?.message || 'Failed to update role')
    }
  }

  const handleDeleteUser = async (userId) => {
    if (!window.confirm('Delete this user?')) return
    try {
      await deleteUser(userId)
      setUsers(prev => prev.filter(u => u._id !== userId))
      toast.success('User deleted!')
    } catch (e) {
      toast.error(e.response?.data?.message || 'Failed to delete user')
    }
  }

  // ─── Room actions ─────────────────────────────────────────
  const handleDeleteRoom = async (roomId) => {
    if (!window.confirm('Delete this room and all its messages?')) return
    try {
      await api.delete(`/rooms/${roomId}`)
      setRooms(prev => prev.filter(r => r._id !== roomId))
      toast.success('Room deleted!')
    } catch (e) {
      toast.error(e.response?.data?.message || 'Failed to delete room')
    }
  }

  // ─── Message actions ──────────────────────────────────────
  const handleDeleteMessage = async (messageId) => {
    if (!window.confirm('Delete this message?')) return
    try {
      await api.delete(`/messages/${messageId}`)
      setMessages(prev => prev.filter(m => m._id !== messageId))
      toast.success('Message deleted!')
    } catch (e) {
      toast.error(e.response?.data?.message || 'Failed to delete message')
    }
  }

  // ─── Tab button helper ────────────────────────────────────
  const TabBtn = ({ id, icon: Icon, label }) => (
    <button
      onClick={() => setTab(id)}
      className={`flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm font-medium transition-all ${
        tab === id
          ? 'text-white'
          : 'text-slate-500 hover:text-slate-700 hover:bg-gray-100'
      }`}
      style={tab === id ? {background:'#6366f1'} : {}}>
      <Icon size={14}/> {label}
    </button>
  )

  return (
    <div className="min-h-screen p-8" style={{background:'#f1f5f9'}}>
      <div className="max-w-3xl mx-auto">

        {/* Header */}
        <div className="flex items-center gap-3 mb-6">
          <button onClick={() => navigate('/chat')}
            className="w-8 h-8 rounded-lg border border-gray-200 bg-white flex items-center justify-center text-slate-400 hover:bg-gray-50">
            <ArrowLeft size={15}/>
          </button>
          <h1 className="text-xl font-semibold flex items-center gap-2 text-slate-800">
            <Shield size={20} color="#6366f1"/> Admin panel
          </h1>
        </div>

        {/* Tabs */}
        <div className="flex items-center gap-2 mb-5 bg-white p-1.5 rounded-xl border border-gray-100 w-fit">
          <TabBtn id="users"    icon={Users}        label={`Users (${users.length})`}/>
          <TabBtn id="rooms"    icon={Hash}         label={`Rooms (${rooms.length})`}/>
          <TabBtn id="messages" icon={MessageSquare} label="Messages"/>
        </div>

        {loading ? (
          <p className="text-center text-slate-400 text-sm mt-10">Loading...</p>
        ) : (
          <>
            {/* ─── Users Tab ──────────────────────────────── */}
            {tab === 'users' && (
              <div className="space-y-2">
                {users.map(u => {
                  const displayName = u.name || u.username || 'Unknown'
                  return (
                    <div key={u._id}
                      className="flex items-center justify-between bg-white border border-gray-100 rounded-xl px-4 py-3">
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
                        <button onClick={() => handleDeleteUser(u._id)}
                          className="w-7 h-7 rounded-lg flex items-center justify-center text-red-400 hover:bg-red-50">
                          <Trash2 size={13}/>
                        </button>
                      </div>
                    </div>
                  )
                })}
              </div>
            )}

            {/* ─── Rooms Tab ──────────────────────────────── */}
            {tab === 'rooms' && (
              <div className="space-y-2">
                {rooms.length === 0 && (
                  <p className="text-center text-slate-400 text-sm mt-6">No rooms found</p>
                )}
                {rooms.map((room, i) => (
                  <div key={room._id}
                    className="flex items-center justify-between bg-white border border-gray-100 rounded-xl px-4 py-3">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-xl flex items-center justify-center text-sm font-medium"
                        style={{background:'#eef2ff', color:'#6366f1'}}>#</div>
                      <div>
                        <p className="font-medium text-sm text-slate-700">{room.name}</p>
                        <p className="text-xs text-gray-400">
                          {room.members?.length || 0} members · created by {room.createdBy?.name || 'Unknown'}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => {
                          setSelectedRoom(room)
                          setTab('messages')
                        }}
                        className="text-xs px-3 py-1.5 rounded-lg border border-gray-200 text-slate-500 hover:bg-gray-50">
                        View messages
                      </button>
                      <button onClick={() => handleDeleteRoom(room._id)}
                        className="w-7 h-7 rounded-lg flex items-center justify-center text-red-400 hover:bg-red-50">
                        <Trash2 size={13}/>
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* ─── Messages Tab ───────────────────────────── */}
            {tab === 'messages' && (
              <div>
                {/* Room selector */}
                <div className="flex items-center gap-2 mb-4 flex-wrap">
                  {rooms.length === 0 ? (
                    <button onClick={() => {
                      setLoading(true)
                      getRooms().then(r => {
                        setRooms(r.data.rooms)
                        setLoading(false)
                      })
                    }} className="text-xs text-indigo-500">Load rooms</button>
                  ) : (
                    rooms.map(room => (
                      <button key={room._id}
                        onClick={() => setSelectedRoom(room)}
                        className={`text-xs px-3 py-1.5 rounded-lg border transition-all ${
                          selectedRoom?._id === room._id
                            ? 'text-white border-indigo-500'
                            : 'border-gray-200 text-slate-500 bg-white hover:bg-gray-50'
                        }`}
                        style={selectedRoom?._id === room._id ? {background:'#6366f1'} : {}}>
                        # {room.name}
                      </button>
                    ))
                  )}
                </div>

                {!selectedRoom ? (
                  <p className="text-center text-slate-400 text-sm mt-6">Select a room to view messages</p>
                ) : messages.length === 0 ? (
                  <p className="text-center text-slate-400 text-sm mt-6">No messages in this room</p>
                ) : (
                  <div className="space-y-2">
                    {messages.map(msg => {
                      const senderName = msg.sender?.name || msg.sender?.username || 'Unknown'
                      return (
                        <div key={msg._id}
                          className="flex items-start justify-between bg-white border border-gray-100 rounded-xl px-4 py-3">
                          <div className="flex items-start gap-3">
                            <div className="w-7 h-7 rounded-full flex items-center justify-center text-xs font-medium flex-shrink-0"
                              style={{background:'#eef2ff', color:'#6366f1'}}>
                              {senderName[0]?.toUpperCase()}
                            </div>
                            <div>
                              <div className="flex items-center gap-2 mb-0.5">
                                <p className="text-xs font-medium text-slate-700">{senderName}</p>
                                <p className="text-xs text-slate-400">
                                  {new Date(msg.createdAt).toLocaleTimeString([], {hour:'2-digit', minute:'2-digit'})}
                                </p>
                              </div>
                              <p className="text-sm text-slate-600">{msg.content}</p>
                            </div>
                          </div>
                          <button onClick={() => handleDeleteMessage(msg._id)}
                            className="w-7 h-7 rounded-lg flex items-center justify-center text-red-400 hover:bg-red-50 flex-shrink-0 ml-2">
                            <Trash2 size={13}/>
                          </button>
                        </div>
                      )
                    })}
                  </div>
                )}
              </div>
            )}
          </>
        )}
      </div>
    </div>
  )
}