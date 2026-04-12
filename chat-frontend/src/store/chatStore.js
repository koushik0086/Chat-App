import { create } from 'zustand'
import api from '../api/auth'

export const useChatStore = create((set) => ({
  rooms: [],
  activeRoom: null,
  messages: {},
  onlineUsers: [],
  allUsers: [],
  privateRooms: [], // ✅ new — stores DM rooms

  setRooms: (rooms) => set({ rooms }),
  setActiveRoom: (room) => set({ activeRoom: room }),
  setOnlineUsers: (users) => set({ onlineUsers: users }),
  setAllUsers: (users) => set({ allUsers: users }),
  setPrivateRooms: (rooms) => set({ privateRooms: rooms }), // ✅ new

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

  // ✅ new — open or create a DM room with a user
  openPrivateRoom: async (userId) => {
    try {
      const { data } = await api.post(`/rooms/private/${userId}`, {});
      const room = data.room;

      // Add to privateRooms list if not already there
      set((s) => ({
        privateRooms: s.privateRooms.some((r) => r._id === room._id)
          ? s.privateRooms
          : [...s.privateRooms, room],
        activeRoom: room,
      }));

      return room;
    } catch (error) {
      console.error("Failed to open private room:", error);
    }
  },
}))