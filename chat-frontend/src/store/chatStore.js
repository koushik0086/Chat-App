import { create } from 'zustand'

export const useChatStore = create((set) => ({
  rooms: [],
  activeRoom: null,
  messages: {},
  onlineUsers: [],
  allUsers: [], // ✅ new

  setRooms: (rooms) => set({ rooms }),
  setActiveRoom: (room) => set({ activeRoom: room }),
  setOnlineUsers: (users) => set({ onlineUsers: users }),
  setAllUsers: (users) => set({ allUsers: users }), // ✅ new

  // ✅ update online status in allUsers list
  updateUserOnlineStatus: (userId, isOnline, lastSeen) =>
    set((s) => ({
      allUsers: s.allUsers.map((u) =>
        u._id === userId
          ? { ...u, isOnline, lastSeen: lastSeen || u.lastSeen }
          : u
      ),
      onlineUsers: s.onlineUsers.map((u) =>
        u._id === userId ? { ...u, isOnline } : u
      ),
    })),

  setMessages: (roomId, msgs) =>
    set((s) => ({
      messages: { ...s.messages, [roomId]: msgs },
    })),

  addMessage: (msg) =>
    set((s) => ({
      messages: {
        ...s.messages,
        [msg.roomId]: [...(s.messages[msg.roomId] || []), msg],
      },
    })),

  removeMessage: (roomId, messageId) =>
    set((s) => ({
      messages: {
        ...s.messages,
        [roomId]: (s.messages[roomId] || []).filter(
          (m) => m._id !== messageId
        ),
      },
    })),
}))