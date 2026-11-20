// LocalStorage-backed store helpers

const KEYS = {
  RESERVATIONS: 'tt_reservations',
  ORDERS: 'tt_orders',
  TICKETS: 'tt_tickets',
}

const get = (key) => JSON.parse(localStorage.getItem(key) || '[]')
const set = (key, val) => localStorage.setItem(key, JSON.stringify(val))

// ── Reservations ──────────────────────────────────────────────
export function getReservations() { return get(KEYS.RESERVATIONS) }

export function getReservationById(id) {
  return getReservations().find(r => r.id === id) || null
}

export function saveReservation(reservation) {
  const all = getReservations()
  const idx = all.findIndex(r => r.id === reservation.id)
  if (idx >= 0) all[idx] = reservation
  else all.push(reservation)
  set(KEYS.RESERVATIONS, all)
}

export function isSlotTaken(tableId, date, slot) {
  return getReservations().some(
    r => r.tableId === tableId && r.date === date && r.slot === slot && r.status !== 'cancelled'
  )
}

export function checkInReservation(id) {
  const all = getReservations()
  const r = all.find(r => r.id === id)
  if (r) {
    r.checkedIn = true
    r.checkInTime = new Date().toISOString()
    set(KEYS.RESERVATIONS, all)
    // promote ticket to priority
    const tickets = getTickets()
    const t = tickets.find(t => t.reservationId === id)
    if (t) { t.priority = true; t.status = t.status === 'pending' ? 'pending' : t.status }
    set(KEYS.TICKETS, tickets)
  }
}

// ── Orders ────────────────────────────────────────────────────
export function getOrders() { return get(KEYS.ORDERS) }

export function getOrderByReservationId(reservationId) {
  return getOrders().find(o => o.reservationId === reservationId) || null
}

export function saveOrder(order) {
  const all = getOrders()
  const idx = all.findIndex(o => o.reservationId === order.reservationId)
  if (idx >= 0) all[idx] = order
  else all.push(order)
  set(KEYS.ORDERS, all)
}

// ── Kitchen Tickets ───────────────────────────────────────────
export function getTickets() { return get(KEYS.TICKETS) }

export function saveTicket(ticket) {
  const all = getTickets()
  const idx = all.findIndex(t => t.id === ticket.id)
  if (idx >= 0) all[idx] = ticket
  else all.push(ticket)
  set(KEYS.TICKETS, all)
}

export function updateTicketStatus(ticketId, status) {
  const all = getTickets()
  const t = all.find(t => t.id === ticketId)
  if (t) {
    t.status = status
    if (status === 'cooking') t.cookingStartedAt = new Date().toISOString()
    if (status === 'ready')   t.readyAt = new Date().toISOString()
  }
  set(KEYS.TICKETS, all)
}

// ── Seed demo data if empty ───────────────────────────────────
export function seedDemoDataIfEmpty() {
  if (getReservations().length > 0) return

  const today = new Date()
  const fmt = d => d.toISOString().split('T')[0]

  const demoReservations = [
    { id: 'res-demo1', tableId: 't4', tableNumber: 4, date: fmt(today), slot: '7:30 PM', partySize: 3, guestName: 'Priya Sharma',   status: 'confirmed', checkedIn: false },
    { id: 'res-demo2', tableId: 't5', tableNumber: 5, date: fmt(today), slot: '8:00 PM', partySize: 2, guestName: 'Arjun Mehta',    status: 'confirmed', checkedIn: false },
    { id: 'res-demo3', tableId: 't7', tableNumber: 7, date: fmt(today), slot: '8:30 PM', partySize: 5, guestName: 'Riya & Family',  status: 'confirmed', checkedIn: false },
  ]

  const demoOrders = [
    { reservationId: 'res-demo1', items: [{ menuItemId: 'm9', qty: 2, name: 'Chicken Biryani', price: 480, prepTime: 25 }, { menuItemId: 'm20', qty: 2, name: 'Gulab Jamun', price: 160, prepTime: 5 }], status: 'pending' },
    { reservationId: 'res-demo2', items: [{ menuItemId: 'm7', qty: 1, name: 'Butter Chicken', price: 420, prepTime: 20 }, { menuItemId: 'm17', qty: 2, name: 'Garlic Naan', price: 60, prepTime: 8 }], status: 'pending' },
    { reservationId: 'res-demo3', items: [{ menuItemId: 'm8', qty: 3, name: 'Paneer Butter Masala', price: 360, prepTime: 20 }, { menuItemId: 'm10', qty: 2, name: 'Veg Biryani', price: 380, prepTime: 22 }], status: 'pending' },
  ]

  demoReservations.forEach(r => saveReservation(r))

  demoOrders.forEach((order, i) => {
    saveOrder(order)
    const res = demoReservations[i]
    const [h, m] = parseSlot(res.slot)
    const arrivalTime = new Date(today)
    arrivalTime.setHours(h, m, 0, 0)
    const maxPrep = Math.max(...order.items.map(it => it.prepTime))
    const targetPrepStart = new Date(arrivalTime.getTime() - maxPrep * 60 * 1000)
    saveTicket({
      id: `ticket-${res.id}`,
      reservationId: res.id,
      tableNumber: res.tableNumber,
      guestName: res.guestName,
      partySize: res.partySize,
      arrivalTime: arrivalTime.toISOString(),
      targetPrepStart: targetPrepStart.toISOString(),
      items: order.items,
      status: 'pending',
      priority: false,
    })
  })
}

export function parseSlot(slot) {
  // "7:30 PM" → [19, 30]
  const [time, period] = slot.split(' ')
  let [h, m] = time.split(':').map(Number)
  if (period === 'PM' && h !== 12) h += 12
  if (period === 'AM' && h === 12) h = 0
  return [h, m]
}
