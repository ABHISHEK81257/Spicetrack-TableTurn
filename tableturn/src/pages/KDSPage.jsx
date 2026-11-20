import { useEffect, useState } from 'react'
import { Clock, ChefHat, CheckCircle2, AlertTriangle, UserCheck } from 'lucide-react'
import { getTickets, updateTicketStatus, checkInReservation, getReservationById } from '../store/store'

function useNow() {
  const [now, setNow] = useState(new Date())
  useEffect(() => { const id = setInterval(() => setNow(new Date()), 1000); return () => clearInterval(id) }, [])
  return now
}

function Countdown({ target, now }) {
  const diff = new Date(target) - now
  const totalSecs = Math.floor(diff / 1000)
  if (totalSecs < 0) return <span className="text-red-400 font-mono text-sm font-bold">OVERDUE</span>
  const mins = Math.floor(totalSecs / 60)
  const secs = totalSecs % 60
  const urgent = mins < 10
  return (
    <span className={`font-mono text-sm font-bold ${urgent ? 'text-red-400' : 'text-green-400'}`}>
      {String(mins).padStart(2, '0')}:{String(secs).padStart(2, '0')}
    </span>
  )
}

function StatusBadge({ status, priority }) {
  const styles = {
    pending: 'bg-yellow-500/20 text-yellow-300 border border-yellow-500/40',
    cooking: 'bg-green-500/20 text-green-300 border border-green-500/40',
    ready:   'bg-blue-500/20  text-blue-300  border border-blue-500/40',
  }
  return (
    <span className={`text-xs font-bold px-2.5 py-1 rounded-full ${styles[status] || styles.pending}`}>
      {status === 'pending' ? '⏳ PENDING' : status === 'cooking' ? '🔥 COOKING' : '✅ READY'}
      {priority && ' 🚨'}
    </span>
  )
}

export default function KDSPage() {
  const now = useNow()
  const [tickets, setTickets] = useState([])

  const refresh = () => {
    const all = getTickets()
    // Sort: priority first, then by targetPrepStart
    all.sort((a, b) => {
      if (a.priority && !b.priority) return -1
      if (!a.priority && b.priority) return 1
      return new Date(a.targetPrepStart) - new Date(b.targetPrepStart)
    })
    setTickets(all)
  }

  useEffect(() => { refresh(); const id = setInterval(refresh, 2000); return () => clearInterval(id) }, [])

  const changeStatus = (ticketId, status) => {
    updateTicketStatus(ticketId, status)
    refresh()
  }

  const handleCheckIn = (ticket) => {
    checkInReservation(ticket.reservationId)
    refresh()
  }

  const active = tickets.filter(t => t.status !== 'ready')
  const done = tickets.filter(t => t.status === 'ready')

  const isFireTime = (t) => new Date(t.targetPrepStart) <= now && t.status === 'pending'

  return (
    <div className="min-h-screen bg-gray-950 text-white">
      {/* KDS Header */}
      <div className="bg-gray-900 border-b border-gray-800 px-6 py-4 flex items-center justify-between sticky top-0 z-10">
        <div className="flex items-center gap-3">
          <ChefHat size={24} className="text-orange-400" />
          <span className="text-xl font-bold">Kitchen Display Screen</span>
        </div>
        <div className="flex items-center gap-6 text-sm text-gray-400">
          <span className="font-mono text-white text-lg">
            {now.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
          </span>
          <div className="flex gap-3">
            <Dot color="bg-yellow-400" label="Pending" />
            <Dot color="bg-green-400" label="Cooking" />
            <Dot color="bg-blue-400" label="Ready" />
          </div>
        </div>
      </div>

      <div className="p-6">
        {tickets.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-24 text-gray-600">
            <ChefHat size={48} className="mb-4 opacity-30" />
            <p className="text-lg">No active kitchen tickets.</p>
            <p className="text-sm mt-1">Tickets will appear as reservations are made.</p>
          </div>
        ) : (
          <>
            {/* Active tickets */}
            {active.length > 0 && (
              <div>
                <h2 className="text-xs font-bold text-gray-500 uppercase tracking-widest mb-4">Active Tickets ({active.length})</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4 mb-8">
                  {active.map(t => (
                    <TicketCard
                      key={t.id} ticket={t} now={now}
                      onStatusChange={changeStatus}
                      onCheckIn={handleCheckIn}
                      isFireTime={isFireTime(t)}
                    />
                  ))}
                </div>
              </div>
            )}

            {/* Done tickets */}
            {done.length > 0 && (
              <div>
                <h2 className="text-xs font-bold text-gray-500 uppercase tracking-widest mb-4">Completed ({done.length})</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4 opacity-50">
                  {done.map(t => (
                    <TicketCard key={t.id} ticket={t} now={now} onStatusChange={changeStatus} onCheckIn={handleCheckIn} />
                  ))}
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  )
}

function TicketCard({ ticket, now, onStatusChange, onCheckIn, isFireTime }) {
  const reservation = getReservationById(ticket.reservationId)
  const arrivalDiff = Math.floor((new Date(ticket.arrivalTime) - now) / 60000)
  const arrivalStr = new Date(ticket.arrivalTime).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })

  const borderColor =
    ticket.priority ? 'border-red-500' :
    ticket.status === 'cooking' ? 'border-green-600' :
    ticket.status === 'ready' ? 'border-blue-600' :
    isFireTime ? 'border-yellow-500' : 'border-gray-700'

  return (
    <div className={`bg-gray-900 border-2 ${borderColor} rounded-2xl p-5 flex flex-col gap-4 transition-all`}>
      {/* Top row */}
      <div className="flex items-start justify-between">
        <div>
          <div className="text-2xl font-black text-white">Table {ticket.tableNumber}</div>
          <div className="text-sm text-gray-400 mt-0.5">{ticket.guestName} · {ticket.partySize} guests</div>
        </div>
        <StatusBadge status={ticket.status} priority={ticket.priority} />
      </div>

      {/* Arrival info */}
      <div className="bg-gray-800 rounded-xl px-4 py-3 flex items-center justify-between">
        <div>
          <div className="text-xs text-gray-500 uppercase tracking-wide">Guest Arrives</div>
          <div className="text-white font-semibold">{arrivalStr}</div>
        </div>
        <div className="text-right">
          <div className="text-xs text-gray-500 uppercase tracking-wide">
            {ticket.status === 'pending' ? 'Fire In' : 'Arrival In'}
          </div>
          {ticket.status === 'pending'
            ? <Countdown target={ticket.targetPrepStart} now={now} />
            : <span className="font-mono text-sm text-gray-300">
                {arrivalDiff > 0 ? `${arrivalDiff}m` : 'ARRIVED'}
              </span>
          }
        </div>
      </div>

      {/* Fire alert */}
      {isFireTime && (
        <div className="bg-yellow-500/10 border border-yellow-500/40 rounded-lg px-3 py-2 flex items-center gap-2 text-yellow-300 text-sm font-semibold animate-pulse">
          <AlertTriangle size={16} /> Fire Dish Now — Guest Arrives in {arrivalDiff}m
        </div>
      )}

      {/* Items list */}
      <div className="space-y-1 flex-1">
        {ticket.items.map((item, i) => (
          <div key={i} className="flex justify-between text-sm text-gray-300">
            <span>{item.name} × {item.qty}</span>
            <span className="text-gray-500">{item.prepTime} min</span>
          </div>
        ))}
      </div>

      {/* Action buttons */}
      <div className="flex gap-2 flex-wrap">
        {!reservation?.checkedIn && (
          <button onClick={() => onCheckIn(ticket)}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-orange-500/20 border border-orange-500/40 text-orange-300 text-xs font-bold rounded-lg hover:bg-orange-500/30 transition-colors">
            <UserCheck size={13} /> Guest Check-In
          </button>
        )}
        {reservation?.checkedIn && ticket.status === 'pending' && (
          <span className="text-xs text-green-400 flex items-center gap-1 font-semibold"><UserCheck size={12} /> Checked In</span>
        )}
        {ticket.status === 'pending' && (
          <button onClick={() => onStatusChange(ticket.id, 'cooking')}
            className="flex-1 py-2 bg-green-500/20 border border-green-500/40 text-green-300 text-sm font-bold rounded-lg hover:bg-green-500/30 transition-colors">
            🔥 Start Cooking
          </button>
        )}
        {ticket.status === 'cooking' && (
          <button onClick={() => onStatusChange(ticket.id, 'ready')}
            className="flex-1 py-2 bg-blue-500/20 border border-blue-500/40 text-blue-300 text-sm font-bold rounded-lg hover:bg-blue-500/30 transition-colors">
            ✅ Mark Ready
          </button>
        )}
      </div>
    </div>
  )
}

function Dot({ color, label }) {
  return (
    <span className="flex items-center gap-1.5 text-xs text-gray-400">
      <span className={`w-2 h-2 rounded-full ${color}`} /> {label}
    </span>
  )
}
