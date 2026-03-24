import { useEffect, useRef } from 'react'
import { io } from 'socket.io-client'
import { useAuthStore } from '../store/authStore'
import { useChatStore } from '../store/chatStore'

// Module-level variable to store socket instance for external access
let globalSocket = null

// Function to get the current socket instance (for use outside React components)
export function getSocket() {
  return globalSocket
}

export function useSocket() {
  const { token } = useAuthStore()
  const socketRef = useRef(null)

  useEffect(() => {
    if (!token) return

    // ✅ prevent duplicate connections
    if (socketRef.current?.connected) return

    const SOCKET_URL = import.meta.env.VITE_SOCKET_URL || 'http://localhost:5000'

    socketRef.current = io(SOCKET_URL, {
      auth: { token },
      transports: ['websocket', 'polling'],
    })

    const s = socketRef.current
    
    // Store reference globally
    globalSocket = s

    s.on('connect', () => {
      console.log('⚡ Socket connected:', s.id)
    })

    // ✅ use getState() to always get latest store functions
    s.on('new-message', (msg) => {
      useChatStore.getState().addMessage(msg)
    })

    s.on('online-users', (users) => {
      useChatStore.getState().setOnlineUsers(users)
    })

    s.on('user-online', (userData) => {
      useChatStore.getState().updateUserOnlineStatus(userData.userId, true)
    })

    s.on('user-offline', (userData) => {
      useChatStore.getState().updateUserOnlineStatus(
        userData.userId,
        false,
        userData.lastSeen
      )
    })

    s.on('message-deleted', ({ messageId, roomId }) => {
      useChatStore.getState().removeMessage(roomId, messageId)
    })

    s.on('disconnect', () => {
      console.log('❌ Socket disconnected')
      globalSocket = null
    })
    
    s.on('error', (e) => console.error('Socket error:', e))

    return () => {
      s.disconnect()
      socketRef.current = null
      globalSocket = null
    }
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