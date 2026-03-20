import { useEffect, useRef } from 'react'
import { LogOut, Search, MoreHorizontal, Shield } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { useAuthStore } from '../store/authStore'
import { useChatStore } from '../store/chatStore'
import { useSocket } from '../hooks/useSocket'
import { getRooms, getMessages } from '../api/chat'
import MessageBubble from '../components/chat/MessageBubble'
import MessageInput from '../components/chat/MessageInput'
import RoomList from '../components/chat/RoomList'
import OnlineUsers from '../components/chat/OnlineUsers'

export default function ChatPage() {
  const { user, logout } = useAuthStore()
  const { rooms, activeRoom, messages, setRooms, setActiveRoom, setMessages } = useChatStore()
  const { sendMessage, joinRoom } = useSocket()
  const bottomRef = useRef(null)
  const navigate = useNavigate()

  useEffect(() => {
  getRooms().then(r => setRooms(r.data.rooms))
  
  // ✅ refresh user data from backend on every login
  import('../api/auth').then(({ default: api }) => {
    api.get('/auth/me').then(r => {
      useAuthStore.getState().setAuth(r.data.user, useAuthStore.getState().token)
    })
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
  }

  const roomMessages = activeRoom ? (messages[activeRoom._id] || []) : []

  // display name helper
  const displayName = user?.name || user?.username || 'User'

  return (
    <div className="flex h-screen overflow-hidden">
      {/* Sidebar */}
      <div className="w-64 flex-shrink-0 flex flex-col" style={{background:'#0f172a'}}>
        {/* Header */}
        <div className="px-4 pt-5 pb-3 border-b border-white/10">
          <p className="text-white font-medium text-base">Chats</p>
          <p className="text-slate-500 text-xs mt-0.5">{rooms.length} active rooms</p>
        </div>

        {/* Search */}
        <div className="mx-3 my-2.5 flex items-center gap-2 px-3 py-2 rounded-xl" style={{background:'rgba(255,255,255,0.06)'}}>
          <Search size={13} color="#475569"/>
          <input placeholder="Search rooms..." className="bg-transparent border-none outline-none text-slate-400 text-xs placeholder:text-slate-600 w-full"/>
        </div>

        {/* Rooms */}
        <div className="flex-1 overflow-y-auto px-2 py-1">
          <RoomList rooms={rooms} activeRoom={activeRoom} onSelect={selectRoom}/>
        </div>

        {/* Footer */}
        <div className="px-3 py-3 border-t border-white/10 flex items-center gap-2.5">
          {/* Avatar */}
          <div className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-medium flex-shrink-0"
            style={{background:'#eef2ff', color:'#6366f1'}}>
            {displayName[0]?.toUpperCase()}
          </div>

          {/* Name + role */}
          <div className="flex-1 min-w-0">
            <p className="text-slate-200 text-xs font-medium truncate">{displayName}</p>
            <p className="text-slate-600 text-xs">{user?.role}</p>
          </div>

          {/* Admin button — only visible for admin role */}
          {user?.role === 'admin' && (
            <button
              onClick={() => navigate('/admin')}
              className="text-slate-600 hover:text-indigo-400 transition-colors"
              title="Admin Panel">
              <Shield size={15}/>
            </button>
          )}

          {/* Logout */}
          <button onClick={logout} className="text-slate-600 hover:text-slate-400 transition-colors">
            <LogOut size={15}/>
          </button>
        </div>
      </div>

      {/* Chat area */}
      <div className="flex-1 flex flex-col min-w-0" style={{background:'#f8fafc'}}>
        {activeRoom ? (
          <>
            {/* Chat header */}
            <div className="px-5 py-3.5 bg-white border-b border-gray-100 flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl flex items-center justify-center font-medium text-sm flex-shrink-0"
                style={{background:'#eef2ff', color:'#6366f1'}}>#</div>
              <div>
                <p className="font-medium text-slate-800 text-sm"># {activeRoom.name}</p>
                <p className="text-slate-400 text-xs">{activeRoom.members?.length || 0} members</p>
              </div>
              <div className="ml-auto flex gap-2">
                <button className="w-8 h-8 rounded-lg border border-gray-200 flex items-center justify-center text-slate-400 hover:bg-gray-50">
                  <Search size={13}/>
                </button>
                <button className="w-8 h-8 rounded-lg border border-gray-200 flex items-center justify-center text-slate-400 hover:bg-gray-50">
                  <MoreHorizontal size={13}/>
                </button>
              </div>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto px-5 py-4 flex flex-col gap-1">
              <div className="flex justify-center mb-2">
                <span className="text-xs text-slate-400 bg-slate-200 px-3 py-1 rounded-full">Today</span>
              </div>
              {roomMessages.map(msg => (
                <MessageBubble key={msg._id} msg={msg}/>
              ))}
              <div ref={bottomRef}/>
            </div>

            {/* Input */}
            <MessageInput onSend={(text) => sendMessage(activeRoom._id, text)}/>
          </>
        ) : (
          <div className="flex-1 flex flex-col items-center justify-center text-center">
            <div className="w-16 h-16 rounded-2xl flex items-center justify-center text-2xl mb-4"
              style={{background:'#eef2ff'}}>💬</div>
            <p className="text-slate-700 font-medium">Select a room to start chatting</p>
            <p className="text-slate-400 text-sm mt-1">Choose from the sidebar on the left</p>
          </div>
        )}
      </div>

      {/* Online users */}
      <OnlineUsers/>
    </div>
  )
}