import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Users, CalendarDays, Clock, CheckCircle2 } from 'lucide-react'
import { tables, timeSlots } from '../data/seed'
import { isSlotTaken, saveReservation, parseSlot } from '../store/store'

function generateId() { return 'res-' + Math.random().toString(36).slice(2, 10) }

export default function ReservationPage() {
  const navigate = useNavigate()
  const [partySize, setPartySize] = useState(2)
  const [date, setDate] = useState(() => new Date().toISOString().split('T')[0])
  const [slot, setSlot] = useState('')
  const [guestName, setGuestName] = useState('')
  const [error, setError] = useState('')

  const minDate = new Date().toISOString().split('T')[0]

  // find available table for partySize
  function findAvailableTable(partySize, date, slot) {
    const eligible = tables.filter(t => t.capacity >= partySize).sort((a, b) => a.capacity - b.capacity)
    return eligible.find(t => !isSlotTaken(t.id, date, slot)) || null
  }

  const slotAvailable = (s) => {
    const eligible = tables.filter(t => t.capacity >= partySize)
    return eligible.some(t => !isSlotTaken(t.id, date, s))
  }

  function handleSubmit(e) {
    e.preventDefault()
    setError('')
    if (!guestName.trim()) { setError('Please enter your name.'); return }
    if (!slot) { setError('Please select a time slot.'); return }

    const table = findAvailableTable(partySize, date, slot)
    if (!table) { setError('No tables available for that slot. Please try another time.'); return }

    const id = generateId()
    const [h, m] = parseSlot(slot)
    const arrivalDate = new Date(date + 'T00:00:00')
    arrivalDate.setHours(h, m, 0, 0)

    saveReservation({
      id, tableId: table.id, tableNumber: table.number,
      date, slot, partySize, guestName: guestName.trim(),
      status: 'confirmed', checkedIn: false,
      arrivalTime: arrivalDate.toISOString(),
    })
    navigate(`/menu/${id}`)
  }

  return (
    <div className="max-w-2xl mx-auto px-4 py-10">
      <h1 className="text-2xl font-bold text-gray-900 mb-1">Reserve a Table</h1>
      <p className="text-gray-500 mb-8">Pick your party size, date, and preferred time slot.</p>

      <form onSubmit={handleSubmit} className="space-y-7">
        {/* Guest name */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Your Name</label>
          <input
            type="text" value={guestName} onChange={e => setGuestName(e.target.value)}
            placeholder="e.g. Priya Sharma"
            className="w-full border border-gray-300 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-orange-400"
          />
        </div>

        {/* Party size */}
        <div>
          <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-3">
            <Users size={15} /> Party Size
          </label>
          <div className="flex flex-wrap gap-2">
            {[1,2,3,4,5,6,7,8].map(n => (
              <button key={n} type="button"
                onClick={() => { setPartySize(n); setSlot('') }}
                className={`w-11 h-11 rounded-xl text-sm font-semibold border transition-colors
                  ${partySize === n ? 'bg-orange-500 text-white border-orange-500' : 'bg-white text-gray-700 border-gray-300 hover:border-orange-400'}`}
              >{n}</button>
            ))}
          </div>
        </div>

        {/* Date */}
        <div>
          <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-2">
            <CalendarDays size={15} /> Date
          </label>
          <input
            type="date" value={date} min={minDate}
            onChange={e => { setDate(e.target.value); setSlot('') }}
            className="border border-gray-300 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-orange-400"
          />
        </div>

        {/* Time slots */}
        <div>
          <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-3">
            <Clock size={15} /> Available Time Slots
          </label>
          <div className="grid grid-cols-4 gap-2">
            {timeSlots.map(s => {
              const avail = slotAvailable(s)
              return (
                <button key={s} type="button"
                  disabled={!avail}
                  onClick={() => setSlot(s)}
                  className={`py-2.5 rounded-xl text-xs font-semibold border transition-colors
                    ${!avail ? 'bg-gray-100 text-gray-400 border-gray-200 cursor-not-allowed' :
                      slot === s ? 'bg-orange-500 text-white border-orange-500' :
                      'bg-white text-gray-700 border-gray-300 hover:border-orange-400'}`}
                >
                  {s}
                  {!avail && <span className="block text-[10px] text-gray-400">Full</span>}
                </button>
              )
            })}
          </div>
        </div>

        {error && <p className="text-red-500 text-sm">{error}</p>}

        <button type="submit"
          className="w-full bg-orange-500 text-white py-3 rounded-xl font-semibold hover:bg-orange-600 transition-colors flex items-center justify-center gap-2"
        >
          <CheckCircle2 size={18} /> Confirm & Choose Menu
        </button>
      </form>
    </div>
  )
}
