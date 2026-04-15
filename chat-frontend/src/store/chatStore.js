import { create } from 'zustand'
import api from '../api/auth'

export const useChatStore = create((set) => ({
  rooms: [],
  activeRoom: null,
  messages: {},
  onlineUsers: [],
  allUsers: [],
  privateRooms: [],
  unreadDMs: {}, // ✅ tracks unread count per roomId

  setRooms: (rooms) => set({ rooms }),
  setActiveRoom: (room) => set({ activeRoom: room }),
  setOnlineUsers: (users) => set({ onlineUsers: users }),
  setAllUsers: (users) => set({ allUsers: users }),
  setPrivateRooms: (rooms) => set({ privateRooms: rooms }),

  // ✅ Called on socket new-message for rooms not currently active
  incrementUnread: (roomId) =>
    set((s) => ({
      unreadDMs: {
        ...s.unreadDMs,
        [roomId]: (s.unreadDMs[roomId] || 0) + 1,
      },
    })),

  // ✅ Called when user opens a room
  markAsRead: (roomId) =>
    set((s) => ({
      unreadDMs: { ...s.unreadDMs, [roomId]: 0 },
    })),

  // ✅ Called on login to load persisted unread counts from backend
  setUnreadCount: (roomId, count) =>
    set((s) => ({
      unreadDMs: { ...s.unreadDMs, [roomId]: count },
    })),

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

  openPrivateRoom: async (userId) => {
    try {
      const { data } = await api.post(`/rooms/private/${userId}`, {});
      const room = data.room;

      set((s) => ({
        privateRooms: s.privateRooms.some((r) => r._id === room._id)
          ? s.privateRooms
          : [...s.privateRooms, room],
        activeRoom: room,
      }));

      return room;
    } catch (error) {
      console.error('Failed to open private room:', error);
    }
  },
}))
