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

    const SOCKET_URL = import.meta.env.VITE_SOCKET_URL || 'http://localhost:5000'

    socketRef.current = io(SOCKET_URL, {
      auth: { token },
      transports: ['websocket', 'polling'],
    })

    const s = socketRef.current

    s.on('connect', () => {
      console.log('⚡ Socket connected:', s.id)
      // Get online users on connect
      s.emit('get-online-users')
    })

    // ─── Match backend event names ─────────────────────────
    s.on('new-message',      addMessage)
    s.on('online-users',     setOnlineUsers)
    s.on('user-online',      (user) => {
      useChatStore.getState().updateUserOnlineStatus(user.userId, true)
    })
    s.on('user-offline',     (user) => {
      useChatStore.getState().updateUserOnlineStatus(user.userId, false)
    })

    s.on('message-deleted',  ({ messageId, roomId }) => {
      useChatStore.getState().removeMessage(roomId, messageId)
    })

    s.on('disconnect', () => console.log('❌ Socket disconnected'))
    s.on('error',      (e)  => console.error('Socket error:', e))

    return () => s.disconnect()
  }, [token])

  const sendMessage = (roomId, content) =>
    socketRef.current?.emit('send-message', { roomId, content })

  const joinRoom = (roomId) =>
    socketRef.current?.emit('join-room', roomId)

  const leaveRoom = (roomId) =>
    socketRef.current?.emit('leave-room', roomId)

  const startTyping = (roomId) =>
    socketRef.current?.emit('typing-start', roomId)

  const stopTyping = (roomId) =>
    socketRef.current?.emit('typing-stop', roomId)

  return { sendMessage, joinRoom, leaveRoom, startTyping, stopTyping }
}