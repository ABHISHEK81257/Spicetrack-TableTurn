import { useEffect, useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import { CheckCircle2, Clock, ChefHat, UtensilsCrossed, QrCode } from 'lucide-react'
import { getReservationById, getOrderByReservationId, getTickets } from '../store/store'
import { GST_RATE, SERVICE_CHARGE_RATE } from '../data/seed'
import Badge from '../components/Badge'

function StatusBadge({ status }) {
  const map = {
    pending: { color: 'yellow', label: '⏳ Pending' },
    cooking: { color: 'green',  label: '👨‍🍳 Cooking' },
    ready:   { color: 'blue',   label: '✅ Ready' },
  }
  const { color, label } = map[status] || map.pending
  return <Badge color={color}>{label}</Badge>
}

function QRPlaceholder({ value }) {
  // Simple ASCII-art style QR placeholder using SVG grid
  const size = 120
  const cells = 10
  const cell = size / cells
  const seed = value.split('').reduce((a, c) => a + c.charCodeAt(0), 0)
  const grid = Array.from({ length: cells * cells }, (_, i) => {
    // deterministic pattern based on seed + position
    return ((seed * (i + 1) * 31) % 100) > 45
  })
  return (
    <svg width={size} height={size} className="rounded border border-gray-200">
      {grid.map((on, i) => {
        const x = (i % cells) * cell
        const y = Math.floor(i / cells) * cell
        return on ? <rect key={i} x={x} y={y} width={cell} height={cell} fill="#1f2937" /> : null
      })}
    </svg>
  )
}

export default function ConfirmationPage() {
  const { reservationId } = useParams()
  const [reservation, setReservation] = useState(null)
  const [order, setOrder] = useState(null)
  const [ticketStatus, setTicketStatus] = useState('pending')

  const refresh = () => {
    setReservation(getReservationById(reservationId))
    setOrder(getOrderByReservationId(reservationId))
    const ticket = getTickets().find(t => t.reservationId === reservationId)
    if (ticket) setTicketStatus(ticket.status)
  }

  useEffect(() => {
    refresh()
    const interval = setInterval(refresh, 3000) // poll every 3s
    return () => clearInterval(interval)
  }, [reservationId])

  if (!reservation) return (
    <div className="max-w-lg mx-auto px-4 py-16 text-center">
      <p className="text-gray-500">Reservation not found. <Link to="/reserve" className="text-orange-500 underline">Make a new one</Link>.</p>
    </div>
  )

  const subtotal = order ? order.items.reduce((s, i) => s + i.price * i.qty, 0) : 0
  const gst = Math.round(subtotal * GST_RATE)
  const service = Math.round(subtotal * SERVICE_CHARGE_RATE)
  const total = subtotal + gst + service

  return (
    <div className="max-w-lg mx-auto px-4 py-10">
      {/* Success banner */}
      <div className="bg-green-50 border border-green-200 rounded-2xl p-5 flex items-center gap-4 mb-6">
        <CheckCircle2 size={32} className="text-green-500 flex-shrink-0" />
        <div>
          <div className="font-bold text-green-800">Reservation Confirmed!</div>
          <div className="text-sm text-green-700">Your table and pre-order are set.</div>
        </div>
      </div>

      {/* Booking pass */}
      <div className="bg-white border border-gray-200 rounded-2xl overflow-hidden mb-6">
        <div className="bg-orange-500 px-5 py-4 text-white">
          <div className="text-xs opacity-80 font-medium uppercase tracking-wide">Booking Pass</div>
          <div className="text-xl font-bold mt-1">{reservation.guestName}</div>
        </div>
        <div className="p-5 flex gap-6">
          <div className="flex-1 space-y-3 text-sm">
            <Row label="Table" value={`Table ${reservation.tableNumber}`} />
            <Row label="Date" value={reservation.date} />
            <Row label="Time" value={reservation.slot} />
            <Row label="Guests" value={reservation.partySize} />
            <Row label="Booking ID" value={<span className="font-mono text-xs">{reservationId}</span>} />
          </div>
          <div className="flex flex-col items-center gap-2">
            <QRPlaceholder value={reservationId} />
            <span className="text-xs text-gray-400 flex items-center gap-1"><QrCode size={11} /> Scan at entry</span>
          </div>
        </div>
      </div>

      {/* Live order tracker */}
      {order && (
        <div className="bg-white border border-gray-200 rounded-2xl p-5 mb-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-bold text-gray-900 flex items-center gap-2"><ChefHat size={18} className="text-orange-500" /> Pre-Order Status</h2>
            <StatusBadge status={ticketStatus} />
          </div>

          {/* Progress bar */}
          <div className="flex items-center gap-2 mb-5">
            {['pending', 'cooking', 'ready'].map((s, i) => (
              <div key={s} className="flex items-center gap-2 flex-1">
                <div className={`flex-1 h-1.5 rounded-full ${
                  ticketStatus === 'pending' && i === 0 ? 'bg-yellow-400' :
                  ticketStatus === 'cooking' && i <= 1 ? 'bg-green-400' :
                  ticketStatus === 'ready' ? 'bg-blue-400' : 'bg-gray-200'
                }`} />
              </div>
            ))}
          </div>

          <div className="space-y-2">
            {order.items.map((item, i) => (
              <div key={i} className="flex justify-between text-sm">
                <span className="text-gray-700">{item.name} × {item.qty}</span>
                <span className="text-gray-500 flex items-center gap-1"><Clock size={12} /> {item.prepTime} min</span>
              </div>
            ))}
          </div>

          {/* Bill summary */}
          <div className="mt-4 pt-4 border-t border-gray-100 space-y-1 text-sm">
            <div className="flex justify-between text-gray-500"><span>Subtotal</span><span>₹{subtotal}</span></div>
            <div className="flex justify-between text-gray-500"><span>GST (5%)</span><span>₹{gst}</span></div>
            <div className="flex justify-between text-gray-500"><span>Service (10%)</span><span>₹{service}</span></div>
            <div className="flex justify-between font-bold text-gray-900 pt-1 border-t border-gray-200"><span>Total</span><span>₹{total}</span></div>
          </div>
        </div>
      )}

      <div className="flex gap-3">
        <Link to="/reserve" className="flex-1 py-3 rounded-xl border border-gray-200 text-center text-sm font-medium text-gray-600 hover:bg-gray-50">
          New Reservation
        </Link>
        <Link to="/kds" className="flex-1 py-3 rounded-xl bg-gray-900 text-white text-center text-sm font-medium hover:bg-gray-800 flex items-center justify-center gap-1.5">
          <UtensilsCrossed size={15} /> Open KDS
        </Link>
      </div>
    </div>
  )
}

function Row({ label, value }) {
  return (
    <div className="flex justify-between">
      <span className="text-gray-500">{label}</span>
      <span className="font-medium text-gray-900">{value}</span>
    </div>
  )
}
