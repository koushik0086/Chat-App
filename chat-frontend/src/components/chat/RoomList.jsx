import { useState } from 'react'
import { Plus, X } from 'lucide-react'
import { useAuthStore } from '../../store/authStore'
import { createRoom, getRooms } from '../../api/chat'
import { useChatStore } from '../../store/chatStore'
import toast from 'react-hot-toast'

export default function RoomList({ rooms, activeRoom, onSelect }) {
  const { user } = useAuthStore()
  const { setRooms } = useChatStore()
  const [showForm, setShowForm] = useState(false)
  const [roomName, setRoomName] = useState('')
  const [loading, setLoading] = useState(false)

  const colors = [
    { bg:'#eef2ff', text:'#6366f1' },
    { bg:'#fdf4ff', text:'#a855f7' },
    { bg:'#f0fdf4', text:'#22c55e' },
    { bg:'#fff7ed', text:'#f97316' },
    { bg:'#fef2f2', text:'#ef4444' },
  ]

  const handleCreateRoom = async () => {
    if (!roomName.trim()) {
      toast.error('Room name is required')
      return
    }
    try {
      setLoading(true)
      await createRoom(roomName.trim())
      toast.success(`Room "${roomName}" created!`)
      setRoomName('')
      setShowForm(false)
      // refresh rooms list
      const res = await getRooms()
      setRooms(res.data.rooms)
    } catch (e) {
      toast.error(e.response?.data?.message || 'Failed to create room')
    } finally {
      setLoading(false)
    }
  }

  return (
    <>
      {/* ✅ Create Room button — admin only */}
      {user?.role === 'admin' && (
        <div className="mb-2">
          {!showForm ? (
            <button
              onClick={() => setShowForm(true)}
              className="w-full flex items-center gap-2 px-2.5 py-2 rounded-xl text-slate-400 hover:text-slate-200 hover:bg-white/10 transition-all text-xs">
              <Plus size={13}/>
              New room
            </button>
          ) : (
            <div className="px-1 py-1">
              <div className="flex items-center gap-1.5 mb-1.5">
                <input
                  autoFocus
                  value={roomName}
                  onChange={e => setRoomName(e.target.value)}
                  onKeyDown={e => {
                    if (e.key === 'Enter') handleCreateRoom()
                    if (e.key === 'Escape') {
                      setShowForm(false)
                      setRoomName('')
                    }
                  }}
                  placeholder="Room name..."
                  className="flex-1 px-2.5 py-1.5 rounded-lg text-xs outline-none text-slate-200 placeholder:text-slate-600"
                  style={{background:'rgba(255,255,255,0.08)', border:'1px solid rgba(255,255,255,0.1)'}}
                />
                <button
                  onClick={() => { setShowForm(false); setRoomName('') }}
                  className="text-slate-500 hover:text-slate-300">
                  <X size={13}/>
                </button>
              </div>
              <button
                onClick={handleCreateRoom}
                disabled={loading}
                className="w-full py-1.5 rounded-lg text-xs font-medium text-white disabled:opacity-50"
                style={{background:'#6366f1'}}>
                {loading ? 'Creating...' : 'Create room'}
              </button>
            </div>
          )}
        </div>
      )}

      {/* Rooms list */}
      {rooms.map((room, i) => {
        const color = colors[i % colors.length]
        const isActive = activeRoom?._id === room._id
        return (
          <button key={room._id} onClick={() => onSelect(room)}
            className="w-full flex items-center gap-2.5 px-2.5 py-2 rounded-xl mb-0.5 text-left transition-all"
            style={{background: isActive ? 'rgba(99,102,241,0.2)' : 'transparent'}}>
            <div className="w-9 h-9 rounded-xl flex items-center justify-center text-sm font-medium flex-shrink-0"
              style={{background: color.bg, color: color.text}}>#</div>
            <div className="flex-1 min-w-0">
              <p className="text-slate-200 text-xs font-medium truncate">{room.name}</p>
              <p className="text-slate-600 text-xs truncate mt-0.5">tap to open</p>
            </div>
          </button>
        )
      })}

      {/* Empty state */}
      {rooms.length === 0 && (
        <p className="text-xs text-slate-600 text-center mt-4 px-2">
          {user?.role === 'admin' ? 'Create your first room!' : 'No rooms yet'}
        </p>
      )}
    </>
  )
}