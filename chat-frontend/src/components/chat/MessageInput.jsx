import { useState, useRef } from 'react'
import { Send, Paperclip, X, FileText, Image as ImageIcon } from 'lucide-react'

export default function MessageInput({ onSend, onSendFile }) {
  const [text, setText] = useState('')
  const [file, setFile] = useState(null)
  const [preview, setPreview] = useState(null)
  const fileRef = useRef(null)

  const handleFile = (e) => {
    const f = e.target.files[0]
    if (!f) return
    setFile(f)
    if (f.type.startsWith('image/')) {
      setPreview(URL.createObjectURL(f))
    } else {
      setPreview(null)
    }
  }

  const clearFile = () => {
    setFile(null)
    setPreview(null)
    if (fileRef.current) fileRef.current.value = ''
  }

  const handle = () => {
    if (file) {
      onSendFile && onSendFile(file)
      clearFile()
      return
    }
    if (!text.trim()) return
    onSend(text.trim())
    setText('')
  }

  const isImage = file?.type.startsWith('image/')

  return (
    <div className="px-4 py-3 bg-white border-t border-gray-100">
      {/* File preview */}
      {file && (
        <div className="mb-2 flex items-center gap-2 px-3 py-2 rounded-xl bg-indigo-50 border border-indigo-100">
          {isImage ? (
            <img src={preview} alt="preview" className="w-10 h-10 rounded-lg object-cover flex-shrink-0"/>
          ) : (
            <div className="w-10 h-10 rounded-lg bg-indigo-100 flex items-center justify-center flex-shrink-0">
              <FileText size={16} color="#6366f1"/>
            </div>
          )}
          <div className="flex-1 min-w-0">
            <p className="text-xs font-medium text-slate-700 truncate">{file.name}</p>
            <p className="text-xs text-slate-400">{(file.size / 1024).toFixed(1)} KB</p>
          </div>
          <button onClick={clearFile} className="text-slate-400 hover:text-slate-600 flex-shrink-0">
            <X size={14}/>
          </button>
        </div>
      )}

      <div className="flex items-center gap-2.5">
        {/* Hidden file input */}
        <input
          ref={fileRef}
          type="file"
          className="hidden"
          onChange={handleFile}
          accept="*/*"
        />

        {/* Paperclip button */}
        <button
          onClick={() => fileRef.current?.click()}
          className="w-8 h-8 rounded-lg border border-gray-200 flex items-center justify-center text-slate-400 hover:bg-indigo-50 hover:text-indigo-400 hover:border-indigo-200 transition-all flex-shrink-0">
          <Paperclip size={14}/>
        </button>

        {/* Text input */}
        <input
          value={text}
          onChange={e => setText(e.target.value)}
          onKeyDown={e => e.key === 'Enter' && handle()}
          placeholder={file ? 'Press send to upload file…' : 'Type a message…'}
          disabled={!!file}
          className="flex-1 text-sm px-4 py-2 rounded-full outline-none border border-gray-200 bg-gray-50 focus:border-indigo-400 focus:bg-white transition-all disabled:opacity-50"
          style={{color:'#1e293b'}}
        />

        {/* Send button */}
        <button
          onClick={handle}
          disabled={!text.trim() && !file}
          className="w-9 h-9 rounded-full flex items-center justify-center flex-shrink-0 hover:opacity-90 transition-opacity disabled:opacity-40"
          style={{background:'#6366f1'}}>
          <Send size={14} color="white"/>
        </button>
      </div>
    </div>
  )
}
