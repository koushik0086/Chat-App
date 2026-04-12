import { useEffect, useRef, useState } from 'react'
import { LogOut, Search, Shield, X, MessageCircle } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { useAuthStore } from '../store/authStore'
import { useChatStore } from '../store/chatStore'
import { useSocket } from '../hooks/useSocket'
import { getRooms, getMessages } from '../api/chat'
import api from '../api/auth'
import { getSocket } from '../hooks/useSocket'
import MessageBubble from '../components/chat/MessageBubble'
import MessageInput from '../components/chat/MessageInput'
import RoomList from '../components/chat/RoomList'
import OnlineUsers from '../components/chat/OnlineUsers'

export default function ChatPage() {
  const { user, logout } = useAuthStore()
  const { rooms, activeRoom, messages, privateRooms, setRooms, setActiveRoom, setMessages } = useChatStore()
  const { sendMessage, joinRoom } = useSocket()
  const bottomRef = useRef(null)
  const navigate = useNavigate()

  const [searchOpen, setSearchOpen] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const [uploading, setUploading] = useState(false)

  useEffect(() => {
    getRooms().then(r => setRooms(r.data.rooms))
    api.get('/auth/me').then(r => {
      useAuthStore.getState().setAuth(r.data.user, useAuthStore.getState().token)
    })
  }, [])

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages, activeRoom])

  const selectRoom = async (room) => {
    setActiveRoom(room)
    joinRoom(room._id)
    const res = await getMessages(room._id)
    setMessages(room._id, res.data.messages)
    setSearchOpen(false)
    setSearchQuery('')
  }

  const roomMessages = activeRoom ? (messages[activeRoom._id] || []) : []

  const filteredMessages = searchQuery.trim()
    ? roomMessages.filter(m =>
        m.content?.toLowerCase().includes(searchQuery.toLowerCase())
      )
    : roomMessages

  // ─── Send text via socket ──────────────────────────────────
  const handleSendMessage = (text) => {
    sendMessage(activeRoom._id, text)
  }

  // ─── Upload file → save to DB → emit via socket ───────────
  const handleSendFile = async (file) => {
    if (!activeRoom) return
    try {
      setUploading(true)
      const formData = new FormData()
      formData.append('file', file)

      const res = await api.post(
        `/messages/${activeRoom._id}/upload`,
        formData,
        { headers: { 'Content-Type': 'multipart/form-data' } }
      )

      const saved = res.data.message

      setMessages(activeRoom._id, [
        ...(messages[activeRoom._id] || []),
        saved,
      ])

      const socket = getSocket?.()
      if (socket) {
        socket.emit('broadcast-file', {
          roomId: activeRoom._id,
          messageId: saved._id,
        })
      }

    } catch (err) {
      console.error('File upload failed:', err)
      alert(err?.response?.data?.message || 'File upload failed. Please try again.')
    } finally {
      setUploading(false)
    }
  }

  // ─── Get DM room display name ──────────────────────────────
  const getDMName = (room) => {
    if (!room.participants) return 'Direct Message'
    const other = room.participants.find(p => p._id !== user?._id)
    return other?.name || 'Direct Message'
  }

  const displayName = user?.name || user?.username || 'User'

  const groupedMessages = () => {
    let lastDateLabel = null
    return filteredMessages.map(msg => {
      const msgDate = new Date(msg.createdAt)
      const today = new Date()
      const yesterday = new Date()
      yesterday.setDate(today.getDate() - 1)

      const isToday = msgDate.toDateString() === today.toDateString()
      const isYesterday = msgDate.toDateString() === yesterday.toDateString()

      const dateLabel = isToday
        ? 'Today'
        : isYesterday
        ? 'Yesterday'
        : msgDate.toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' })

      const showLabel = dateLabel !== lastDateLabel
      lastDateLabel = dateLabel

      return { msg, showLabel, dateLabel }
    })
  }

  return (
    <div className="flex h-screen overflow-hidden">
      {/* Sidebar */}
      <div className="w-64 flex-shrink-0 flex flex-col" style={{background:'#0f172a'}}>
        <div className="px-4 pt-5 pb-3 border-b border-white/10">
          <p className="text-white font-medium text-base">Chats</p>
          <p className="text-slate-500 text-xs mt-0.5">{rooms.length} active rooms</p>
        </div>
        <div className="mx-3 my-2.5 flex items-center gap-2 px-3 py-2 rounded-xl" style={{background:'rgba(255,255,255,0.06)'}}>
          <Search size={13} color="#475569"/>
          <input placeholder="Search rooms…" className="bg-transparent border-none outline-none text-slate-400 text-xs placeholder:text-slate-600 w-full"/>
        </div>

        {/* ─── Group Rooms ─────────────────────────────── */}
        <div className="flex-1 overflow-y-auto px-2 py-1">
          <p className="text-slate-600 text-xs px-2 py-1 uppercase tracking-wider">Rooms</p>
          <RoomList rooms={rooms} activeRoom={activeRoom} onSelect={selectRoom}/>

          {/* ─── Direct Messages ──────────────────────── */}
          {privateRooms.length > 0 && (
            <>
              <p className="text-slate-600 text-xs px-2 py-1 mt-3 uppercase tracking-wider">Direct Messages</p>
              {privateRooms.map(room => (
                <div key={room._id}
                  onClick={() => selectRoom(room)}
                  className={`flex items-center gap-2 px-2 py-2 rounded-lg cursor-pointer transition-colors ${
                    activeRoom?._id === room._id
                      ? 'bg-white/10 text-white'
                      : 'text-slate-400 hover:bg-white/5'
                  }`}>
                  <MessageCircle size={14}/>
                  <span className="text-xs truncate">{getDMName(room)}</span>
                </div>
              ))}
            </>
          )}
        </div>

        {/* Bottom user bar */}
        <div className="px-3 py-3 border-t border-white/10 flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-medium flex-shrink-0"
            style={{background:'#eef2ff', color:'#6366f1'}}>
            {displayName[0]?.toUpperCase()}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-slate-200 text-xs font-medium truncate">{displayName}</p>
            <p className="text-slate-600 text-xs">{user?.role}</p>
          </div>
          {user?.role === 'admin' && (
            <button onClick={() => navigate('/admin')} className="text-slate-600 hover:text-indigo-400 transition-colors" title="Admin Panel">
              <Shield size={15}/>
            </button>
          )}
          <button onClick={logout} className="text-slate-600 hover:text-slate-400 transition-colors">
            <LogOut size={15}/>
          </button>
        </div>
      </div>

      {/* Chat area */}
      <div className="flex-1 flex flex-col min-w-0" style={{background:'#f8fafc'}}>
        {activeRoom ? (
          <>
            {/* Header */}
            <div className="px-5 py-3.5 bg-white border-b border-gray-100 flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl flex items-center justify-center font-medium text-sm flex-shrink-0"
                style={{background:'#eef2ff', color:'#6366f1'}}>
                {activeRoom.isPrivate ? '👤' : '#'}
              </div>
              <div>
                <p className="font-medium text-slate-800 text-sm">
                  {activeRoom.isPrivate ? getDMName(activeRoom) : `# ${activeRoom.name}`}
                </p>
                <p className="text-slate-400 text-xs">
                  {activeRoom.isPrivate ? 'Direct Message' : `${activeRoom.members?.length || 0} members`}
                </p>
              </div>
              <div className="ml-auto flex gap-2 items-center">
                <button
                  onClick={() => { setSearchOpen(v => !v); setSearchQuery('') }}
                  className={`w-8 h-8 rounded-lg border flex items-center justify-center transition-all ${
                    searchOpen
                      ? 'bg-indigo-50 border-indigo-200 text-indigo-500'
                      : 'border-gray-200 text-slate-400 hover:bg-gray-50'
                  }`}>
                  <Search size={13}/>
                </button>
              </div>
            </div>

            {/* Search bar */}
            {searchOpen && (
              <div className="px-5 py-2 bg-white border-b border-gray-100 flex items-center gap-2">
                <Search size={13} color="#94a3b8"/>
                <input
                  autoFocus
                  value={searchQuery}
                  onChange={e => setSearchQuery(e.target.value)}
                  placeholder="Search messages in this room…"
                  className="flex-1 text-sm outline-none text-slate-700 placeholder:text-slate-400 bg-transparent"
                />
                {searchQuery && (
                  <span className="text-xs text-slate-400 flex-shrink-0">
                    {filteredMessages.length} result{filteredMessages.length !== 1 ? 's' : ''}
                  </span>
                )}
                <button onClick={() => { setSearchOpen(false); setSearchQuery('') }} className="text-slate-400 hover:text-slate-600">
                  <X size={14}/>
                </button>
              </div>
            )}

            {/* Upload indicator */}
            {uploading && (
              <div className="px-5 py-2 bg-indigo-50 border-b border-indigo-100 flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-indigo-400 animate-pulse"/>
                <p className="text-xs text-indigo-600 font-medium">Uploading file…</p>
              </div>
            )}

            {/* Messages */}
            <div className="flex-1 overflow-y-auto px-5 py-4 flex flex-col gap-1">
              {filteredMessages.length === 0 && searchQuery ? (
                <div className="flex-1 flex flex-col items-center justify-center text-center py-12">
                  <p className="text-slate-400 text-sm">No messages found for "<strong>{searchQuery}</strong>"</p>
                </div>
              ) : (
                groupedMessages().map(({ msg, showLabel, dateLabel }) => (
                  <div key={msg._id}>
                    {showLabel && (
                      <div className="flex justify-center my-2">
                        <span className="text-xs text-slate-400 bg-slate-200 px-3 py-1 rounded-full">
                          {dateLabel}
                        </span>
                      </div>
                    )}
                    <MessageBubble msg={msg}/>
                  </div>
                ))
              )}
              <div ref={bottomRef}/>
            </div>

            {/* Input */}
            <MessageInput
              onSend={handleSendMessage}
              onSendFile={handleSendFile}
              uploading={uploading}
            />
          </>
        ) : (
          <div className="flex-1 flex flex-col items-center justify-center text-center">
            <div className="w-16 h-16 rounded-2xl flex items-center justify-center text-2xl mb-4" style={{background:'#eef2ff'}}>💬</div>
            <p className="text-slate-700 font-medium">Select a room to start chatting</p>
            <p className="text-slate-400 text-sm mt-1">Choose from the sidebar on the left</p>
          </div>
        )}
      </div>

      <OnlineUsers/>
    </div>
  )
}