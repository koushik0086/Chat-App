import { format } from 'date-fns'
import { useAuthStore } from '../../store/authStore'

export default function MessageBubble({ msg }) {
  const { user } = useAuthStore()
  const isOwn = msg.sender._id === user?._id

  const avatarColors = ['#eef2ff:#6366f1', '#fdf4ff:#a855f7', '#f0fdf4:#22c55e', '#fff7ed:#f97316']
  const senderName = msg.sender.name || msg.sender.username || 'User'
  const colorPair = avatarColors[senderName.charCodeAt(0) % avatarColors.length].split(':')

  return (
    <div className={`flex items-end gap-2 mb-1 ${isOwn ? 'flex-row-reverse' : ''}`}>
      {!isOwn && (
        <div className="w-7 h-7 rounded-full flex items-center justify-center text-xs font-medium flex-shrink-0 mb-0.5"
          style={{background: colorPair[0], color: colorPair[1]}}>
          {senderName[0]?.toUpperCase()}
        </div>
      )}
      <div className={`max-w-xs ${isOwn ? 'items-end' : 'items-start'} flex flex-col`}>
        {!isOwn && (
          <span className="text-xs font-medium mb-1 px-1" style={{color:'#6366f1'}}>
            {senderName}
          </span>
        )}
        <div className={`px-3.5 py-2.5 text-sm leading-relaxed ${
          isOwn
            ? 'text-white rounded-2xl rounded-br-sm'
            : 'bg-white text-slate-700 rounded-2xl rounded-bl-sm border border-gray-100'
          }`}
          style={isOwn ? {background:'#6366f1'} : {}}>
          {msg.content}
          <div className={`text-xs mt-1 ${isOwn ? 'text-indigo-200 text-right' : 'text-slate-400'}`}>
            {format(new Date(msg.createdAt), 'hh:mm a')}
            {isOwn && <span className="ml-1">✓✓</span>}
          </div>
        </div>
      </div>
    </div>
  )
}