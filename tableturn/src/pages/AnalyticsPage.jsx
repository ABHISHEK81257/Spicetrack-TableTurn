import { useEffect, useState } from 'react'
import { BarChart3, Clock, Users, CalendarCheck, TrendingUp } from 'lucide-react'
import { getReservations, getTickets } from '../store/store'
import { timeSlots, tables } from '../data/seed'

function StatCard({ icon: Icon, label, value, sub, color }) {
  const colors = {
    orange: 'bg-orange-50 text-orange-500',
    blue:   'bg-blue-50 text-blue-500',
    green:  'bg-green-50 text-green-500',
    purple: 'bg-purple-50 text-purple-500',
  }
  return (
    <div className="bg-white border border-gray-200 rounded-2xl p-5">
      <div className={`w-10 h-10 rounded-xl flex items-center justify-center mb-3 ${colors[color]}`}>
        <Icon size={20} />
      </div>
      <div className="text-2xl font-bold text-gray-900">{value}</div>
      <div className="text-sm font-medium text-gray-700 mt-0.5">{label}</div>
      {sub && <div className="text-xs text-gray-400 mt-1">{sub}</div>}
    </div>
  )
}

export default function AnalyticsPage() {
  const [reservations, setReservations] = useState([])
  const [tickets, setTickets] = useState([])

  useEffect(() => {
    setReservations(getReservations())
    setTickets(getTickets())
  }, [])

  const today = new Date().toISOString().split('T')[0]
  const todayRes = reservations.filter(r => r.date === today)
  const checkedIn = todayRes.filter(r => r.checkedIn).length
  const readyTickets = tickets.filter(t => t.status === 'ready')

  // Avg dining duration (simulated: ready time - check-in time, or fixed 75min)
  const avgDuration = readyTickets.length > 0
    ? Math.round(readyTickets.reduce((s, t) => {
        const res = reservations.find(r => r.id === t.reservationId)
        if (res?.checkInTime && t.readyAt) {
          return s + (new Date(t.readyAt) - new Date(res.checkInTime)) / 60000
        }
        return s + 75
      }, 0) / readyTickets.length)
    : 75

  // Table occupancy: how many slots each table is booked today
  const occupancyByTable = tables.map(t => ({
    ...t,
    booked: reservations.filter(r => r.tableId === t.id && r.date === today).length,
    total: timeSlots.length,
  }))

  // Slot popularity
  const slotCounts = timeSlots.map(slot => ({
    slot,
    count: reservations.filter(r => r.slot === slot).length,
  }))
  const maxSlotCount = Math.max(...slotCounts.map(s => s.count), 1)

  return (
    <div className="max-w-5xl mx-auto px-4 py-10">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">Analytics Dashboard</h1>
        <p className="text-gray-500 mt-1">Table occupancy and turnaround insights for today.</p>
      </div>

      {/* Stat cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-10">
        <StatCard icon={CalendarCheck} label="Today's Reservations" value={todayRes.length} sub="Total bookings" color="orange" />
        <StatCard icon={Users} label="Guests Checked In" value={checkedIn} sub={`of ${todayRes.length} expected`} color="green" />
        <StatCard icon={Clock} label="Avg. Dining Duration" value={`${avgDuration}m`} sub="Per cover" color="blue" />
        <StatCard icon={TrendingUp} label="Tickets Completed" value={readyTickets.length} sub="Marked ready" color="purple" />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Table Occupancy */}
        <div className="bg-white border border-gray-200 rounded-2xl p-6">
          <h2 className="font-bold text-gray-900 mb-4 flex items-center gap-2">
            <BarChart3 size={18} className="text-orange-500" /> Table Occupancy Today
          </h2>
          <div className="space-y-3">
            {occupancyByTable.map(t => {
              const pct = t.total > 0 ? Math.round((t.booked / t.total) * 100) : 0
              return (
                <div key={t.id}>
                  <div className="flex justify-between text-sm mb-1">
                    <span className="text-gray-700 font-medium">Table {t.number} <span className="text-gray-400 text-xs">({t.label})</span></span>
                    <span className="text-gray-500">{t.booked}/{t.total} slots · {pct}%</span>
                  </div>
                  <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                    <div
                      className={`h-full rounded-full transition-all ${pct > 70 ? 'bg-red-400' : pct > 40 ? 'bg-orange-400' : 'bg-green-400'}`}
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                </div>
              )
            })}
          </div>
        </div>

        {/* Slot popularity */}
        <div className="bg-white border border-gray-200 rounded-2xl p-6">
          <h2 className="font-bold text-gray-900 mb-4 flex items-center gap-2">
            <Clock size={18} className="text-orange-500" /> Peak Hour Analysis
          </h2>
          <div className="space-y-2.5">
            {slotCounts.map(s => {
              const pct = Math.round((s.count / maxSlotCount) * 100)
              return (
                <div key={s.slot} className="flex items-center gap-3">
                  <span className="text-xs text-gray-500 w-16 text-right flex-shrink-0">{s.slot}</span>
                  <div className="flex-1 h-6 bg-gray-100 rounded-lg overflow-hidden">
                    <div
                      className="h-full bg-orange-400 rounded-lg flex items-center px-2 transition-all"
                      style={{ width: `${Math.max(pct, s.count > 0 ? 10 : 0)}%` }}
                    >
                      {s.count > 0 && <span className="text-white text-xs font-bold">{s.count}</span>}
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
          {slotCounts.every(s => s.count === 0) && (
            <p className="text-sm text-gray-400 text-center mt-4">No reservations yet. Data populates as bookings come in.</p>
          )}
        </div>
      </div>

      {/* Recent reservations table */}
      {reservations.length > 0 && (
        <div className="mt-6 bg-white border border-gray-200 rounded-2xl overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-100">
            <h2 className="font-bold text-gray-900">All Reservations</h2>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-gray-50">
                <tr>
                  {['Guest', 'Table', 'Date', 'Slot', 'Guests', 'Status'].map(h => (
                    <th key={h} className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {reservations.slice().reverse().map(r => (
                  <tr key={r.id} className="hover:bg-gray-50">
                    <td className="px-4 py-3 font-medium text-gray-900">{r.guestName}</td>
                    <td className="px-4 py-3 text-gray-600">Table {r.tableNumber}</td>
                    <td className="px-4 py-3 text-gray-600">{r.date}</td>
                    <td className="px-4 py-3 text-gray-600">{r.slot}</td>
                    <td className="px-4 py-3 text-gray-600">{r.partySize}</td>
                    <td className="px-4 py-3">
                      <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold
                        ${r.checkedIn ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'}`}>
                        {r.checkedIn ? '✅ Checked In' : '⏳ Awaiting'}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  )
}
