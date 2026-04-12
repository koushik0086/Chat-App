import { useEffect } from 'react'
import { formatDistanceToNow } from 'date-fns'
import { getAllUsers } from '../../api/chat'
import { useChatStore } from '../../store/chatStore'
import { useAuthStore } from '../../store/authStore'

export default function OnlineUsers() {
  const { allUsers, setAllUsers, openPrivateRoom } = useChatStore()
  const { user: currentUser } = useAuthStore()

  // fetch all users on mount
  useEffect(() => {
    getAllUsers()
      .then(r => setAllUsers(r.data.users))
      .catch(err => console.error('Failed to fetch users:', err))
  }, [])

  const onlineCount = allUsers.filter(u => u.isOnline).length

  const handleUserClick = async (u) => {
    // Don't open DM with yourself
    if (u._id === currentUser?._id) return
    await openPrivateRoom(u._id)
  }

  return (
    <div className="w-52 flex-shrink-0 flex flex-col bg-white border-l border-gray-100">
      {/* Header */}
      <div className="px-4 pt-4 pb-2.5 border-b border-gray-100">
        <p className="text-sm font-medium text-slate-700">Members</p>
        <p className="text-xs mt-0.5" style={{color:'#22c55e'}}>
          {onlineCount} online · {allUsers.length} total
        </p>
      </div>

      {/* Users list */}
      <div className="flex-1 overflow-y-auto p-2">
        {allUsers.length === 0 ? (
          <p className="text-xs text-slate-400 text-center mt-4">Loading...</p>
        ) : (
          allUsers.map(u => {
            const displayName = u.name || u.username || 'User'
            const isMe = u._id === currentUser?._id
            const roleColor = {
              admin: { bg:'#eef2ff', text:'#6366f1' },
              user:  { bg:'#f1f5f9', text:'#64748b' },
            }
            const c = roleColor[u.role] || roleColor.user

            return (
              <div key={u._id}
                onClick={() => handleUserClick(u)}
                className={`flex items-center gap-2 px-2 py-2 rounded-lg transition-colors
                  ${isMe
                    ? 'opacity-60 cursor-default'
                    : 'hover:bg-gray-50 cursor-pointer'
                  }`}>
                {/* Avatar with online indicator */}
                <div className="relative flex-shrink-0">
                  <div className="w-7 h-7 rounded-full flex items-center justify-center text-xs font-medium"
                    style={{background: c.bg, color: c.text}}>
                    {displayName[0]?.toUpperCase()}
                  </div>
                  <div className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 rounded-full border-2 border-white"
                    style={{background: u.isOnline ? '#22c55e' : '#94a3b8'}}/>
                </div>

                {/* Name + status */}
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-medium text-slate-700 truncate">
                    {displayName} {isMe && '(you)'}
                  </p>
                  {u.isOnline ? (
                    <p className="text-xs" style={{color:'#22c55e'}}>Online</p>
                  ) : (
                    <p className="text-xs text-slate-400 truncate">
                      {u.lastSeen
                        ? `${formatDistanceToNow(new Date(u.lastSeen))} ago`
                        : 'Offline'}
                    </p>
                  )}
                </div>

                {/* DM icon on hover */}
                {!isMe && (
                  <div className="text-slate-300 text-xs">💬</div>
                )}
              </div>
            )
          })
        )}
      </div>
    </div>
  )
}