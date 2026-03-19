export default function RoomList({ rooms, activeRoom, onSelect }) {
  const colors = [
    { bg:'#eef2ff', text:'#6366f1' },
    { bg:'#fdf4ff', text:'#a855f7' },
    { bg:'#f0fdf4', text:'#22c55e' },
    { bg:'#fff7ed', text:'#f97316' },
    { bg:'#fef2f2', text:'#ef4444' },
  ]

  return (
    <>
      {rooms.map((room, i) => {
        const color = colors[i % colors.length]
        const isActive = activeRoom?._id === room._id
        return (
          <button key={room._id} onClick={() => onSelect(room)}
            className="w-full flex items-center gap-2.5 px-2.5 py-2 rounded-xl mb-0.5 text-left transition-all"
            style={{background: isActive ? 'rgba(99,102,241,0.2)' : 'transparent'}}>
            <div className="w-9 h-9 rounded-xl flex items-center justify-center text-sm font-medium flex-shrink-0"
              style={{background: color.bg, color: color.text}}>#</div>
            <div className="flex-1 min-w-0">
              <p className="text-slate-200 text-xs font-medium truncate">{room.name}</p>
              <p className="text-slate-600 text-xs truncate mt-0.5">tap to open</p>
            </div>
          </button>
        )
      })}
    </>
  )
}