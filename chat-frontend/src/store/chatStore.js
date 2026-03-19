import { create } from 'zustand'

export const useChatStore = create((set) => ({
  rooms: [],
  activeRoom: null,
  messages: {},          // { [roomId]: [msg, msg, ...] }
  onlineUsers: [],

  setRooms:       (rooms)         => set({ rooms }),
  setActiveRoom:  (room)          => set({ activeRoom: room }),
  setOnlineUsers: (users)         => set({ onlineUsers: users }),
  setMessages:    (roomId, msgs)  => set(s => ({ messages: { ...s.messages, [roomId]: msgs } })),
  addMessage:     (msg)           => set(s => ({
    messages: {
      ...s.messages,
      [msg.roomId]: [...(s.messages[msg.roomId] || []), msg]
    }
  })),
}))