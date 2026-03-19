import { useState } from 'react'
import { Send, Paperclip } from 'lucide-react'

export default function MessageInput({ onSend }) {
  const [text, setText] = useState('')

  const handle = () => {
    if (!text.trim()) return
    onSend(text.trim())
    setText('')
  }

  return (
    <div className="px-4 py-3 bg-white border-t border-gray-100 flex items-center gap-2.5">
      <button className="w-8 h-8 rounded-lg border border-gray-200 flex items-center justify-center text-slate-400 hover:bg-gray-50 flex-shrink-0">
        <Paperclip size={14}/>
      </button>
      <input value={text} onChange={e => setText(e.target.value)}
        onKeyDown={e => e.key === 'Enter' && handle()}
        placeholder="Type a message…"
        className="flex-1 text-sm px-4 py-2 rounded-full outline-none border border-gray-200 bg-gray-50 focus:border-indigo-400 focus:bg-white transition-all"
        style={{color:'#1e293b'}}/>
      <button onClick={handle}
        className="w-9 h-9 rounded-full flex items-center justify-center flex-shrink-0 hover:opacity-90 transition-opacity"
        style={{background:'#6366f1'}}>
        <Send size={14} color="white"/>
      </button>
    </div>
  )
}