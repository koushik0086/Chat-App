import { useChatStore } from '../../store/chatStore'

export default function OnlineUsers() {
  const { onlineUsers } = useChatStore()

  const roleColor = {
    admin: { bg:'#eef2ff', text:'#6366f1' },
    moderator: { bg:'#fdf4ff', text:'#a855f7' },
    user: { bg:'#f1f5f9', text:'#64748b' },
  }

  return (
    <div className="w-48 flex-shrink-0 flex flex-col bg-white border-l border-gray-100">
      <div className="px-4 pt-4 pb-2.5 border-b border-gray-100">
        <p className="text-sm font-medium text-slate-700">Online now</p>
        <p className="text-xs mt-0.5" style={{color:'#22c55e'}}>{onlineUsers.length} online</p>
      </div>
      <div className="flex-1 overflow-y-auto p-2">
        {onlineUsers.length === 0 ? (
          <p className="text-xs text-slate-400 text-center mt-4">No one online yet</p>
        ) : (
          onlineUsers.map(u => {
            const c = roleColor[u.role] || roleColor.user
            return (
              <div key={u._id} className="flex items-center gap-2 px-2 py-2 rounded-lg hover:bg-gray-50">
                <div className="w-7 h-7 rounded-full flex items-center justify-center text-xs font-medium flex-shrink-0"
                  style={{background: c.bg, color: c.text}}>
                  {u.username?.[0]?.toUpperCase()}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-medium text-slate-700 truncate">{u.username}</p>
                  <p className="text-xs text-slate-400">{u.role}</p>
                </div>
                <div className="w-2 h-2 rounded-full flex-shrink-0" style={{background:'#22c55e'}}></div>
              </div>
            )
          })
        )}
      </div>
    </div>
  )
}