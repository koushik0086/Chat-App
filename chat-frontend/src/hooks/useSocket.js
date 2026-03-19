import { useEffect, useRef } from 'react'
import { io } from 'socket.io-client'
import { useAuthStore } from '../store/authStore'
import { useChatStore } from '../store/chatStore'

export function useSocket() {
  const { token } = useAuthStore()
  const { addMessage, setOnlineUsers } = useChatStore()
  const socketRef = useRef(null)

  useEffect(() => {
    if (!token) return
    socketRef.current = io('http://localhost:5000', { auth: { token } })
    const s = socketRef.current
    s.on('message:receive', addMessage)
    s.on('users:online',    setOnlineUsers)
    return () => s.disconnect()
  }, [token])

  const sendMessage = (roomId, content) =>
    socketRef.current?.emit('message:send', { roomId, content })

  const joinRoom = (roomId) =>
    socketRef.current?.emit('room:join', roomId)

  return { sendMessage, joinRoom }
}