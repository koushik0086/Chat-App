import { useEffect, useRef } from 'react'
import { io } from 'socket.io-client'
import { useAuthStore } from '../store/authStore'
import { useChatStore } from '../store/chatStore'

// Module-level singleton socket — one connection for the entire app session
let globalSocket = null

export function getSocket() {
  return globalSocket
}

export function useSocket() {
  const { token } = useAuthStore()
  const socketRef = useRef(null)

  useEffect(() => {
    if (!token) return

    // ✅ If a socket already exists and is connected, reuse it
    if (globalSocket?.connected) {
      socketRef.current = globalSocket
      return
    }

    // ✅ Disconnect any stale socket before creating new one
    if (globalSocket) {
      globalSocket.disconnect()
      globalSocket = null
    }

    const SOCKET_URL = import.meta.env.VITE_SOCKET_URL || 'http://localhost:5000'

    const socket = io(SOCKET_URL, {
      auth: { token },
      transports: ['websocket', 'polling'],
      reconnection: true,
      reconnectionAttempts: 5,
      reconnectionDelay: 1000,
    })

    socketRef.current = socket
    globalSocket = socket

    socket.on('connect', () => {
      console.log('⚡ Socket connected:', socket.id)
    })

    socket.on('connect_error', (err) => {
      console.error('Socket connection error:', err.message)
    })

    // ✅ Use getState() to always get latest store state (avoids stale closures)
    socket.on('new-message', (msg) => {
      useChatStore.getState().addMessage(msg)
    })

    socket.on('online-users', (users) => {
      useChatStore.getState().setOnlineUsers(users)
    })

    socket.on('user-online', (userData) => {
      useChatStore.getState().updateUserOnlineStatus(userData.userId, true)
    })

    socket.on('user-offline', (userData) => {
      useChatStore.getState().updateUserOnlineStatus(
        userData.userId,
        false,
        userData.lastSeen
      )
    })

    // ✅ Real-time delete: remove message from store instantly for all users
    socket.on('message-deleted', ({ messageId, roomId }) => {
      useChatStore.getState().removeMessage(roomId, messageId)
    })

    socket.on('disconnect', (reason) => {
      console.log('❌ Socket disconnected:', reason)
      // Only clear globalSocket if this is our current socket
      if (globalSocket === socket) {
        globalSocket = null
      }
    })

    socket.on('error', (e) => console.error('Socket error:', e))

    return () => {
      // Only disconnect if token changes (logout), not on every re-render
      socket.disconnect()
      socketRef.current = null
      if (globalSocket === socket) {
        globalSocket = null
      }
    }
  }, [token])

  const sendMessage = (roomId, content) =>
    (socketRef.current || globalSocket)?.emit('send-message', { roomId, content })

  const joinRoom = (roomId) =>
    (socketRef.current || globalSocket)?.emit('join-room', roomId)

  const leaveRoom = (roomId) =>
    (socketRef.current || globalSocket)?.emit('leave-room', roomId)

  const startTyping = (roomId) =>
    (socketRef.current || globalSocket)?.emit('typing-start', roomId)

  const stopTyping = (roomId) =>
    (socketRef.current || globalSocket)?.emit('typing-stop', roomId)

  return { sendMessage, joinRoom, leaveRoom, startTyping, stopTyping }
}
