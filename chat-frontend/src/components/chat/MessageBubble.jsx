import { format } from 'date-fns'
import { FileText, Download } from 'lucide-react'
import { useAuthStore } from '../../store/authStore'

export default function MessageBubble({ msg }) {
  const { user } = useAuthStore()
  const isOwn = msg.sender._id === user?._id

  const avatarColors = ['#eef2ff:#6366f1', '#fdf4ff:#a855f7', '#f0fdf4:#22c55e', '#fff7ed:#f97316']
  const senderName = msg.sender.name || msg.sender.username || 'User'
  const colorPair = avatarColors[senderName.charCodeAt(0) % avatarColors.length].split(':')

  const isImage = msg.type === 'image' || (msg.fileUrl && /\.(jpg|jpeg|png|gif|webp)$/i.test(msg.fileUrl))
  const isFile = msg.type === 'file' || msg.fileUrl

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

          {/* Image message */}
          {isImage && msg.fileUrl ? (
            <div className="mb-1">
              <img
                src={msg.fileUrl}
                alt="attachment"
                className="rounded-xl max-w-full max-h-48 object-cover cursor-pointer"
                onClick={() => window.open(msg.fileUrl, '_blank')}
              />
            </div>
          ) : isFile && msg.fileUrl ? (
            /* File message */
            <a
              href={msg.fileUrl}
              target="_blank"
              rel="noopener noreferrer"
              className={`flex items-center gap-2 mb-1 p-2 rounded-xl no-underline ${
                isOwn ? 'bg-indigo-500' : 'bg-slate-50 border border-slate-200'
              }`}>
              <div className={`w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 ${
                isOwn ? 'bg-indigo-400' : 'bg-indigo-100'
              }`}>
                <FileText size={14} color={isOwn ? 'white' : '#6366f1'}/>
              </div>
              <div className="flex-1 min-w-0">
                <p className={`text-xs font-medium truncate ${isOwn ? 'text-white' : 'text-slate-700'}`}>
                  {msg.fileName || 'File'}
                </p>
                <p className={`text-xs ${isOwn ? 'text-indigo-200' : 'text-slate-400'}`}>
                  {msg.fileSize ? `${(msg.fileSize / 1024).toFixed(1)} KB` : 'Download'}
                </p>
              </div>
              <Download size={12} color={isOwn ? 'white' : '#6366f1'}/>
            </a>
          ) : (
            /* Text message */
            msg.content
          )}

          <div className={`text-xs mt-1 ${isOwn ? 'text-indigo-200 text-right' : 'text-slate-400'}`}>
            {format(new Date(msg.createdAt), 'hh:mm a')}
            {isOwn && <span className="ml-1">✓✓</span>}
          </div>
        </div>
      </div>
    </div>
  )
}
