import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { ShoppingCart, Minus, Plus, Leaf, Drumstick, Flame, ArrowRight, X } from 'lucide-react'
import { menuItems, categories, GST_RATE, SERVICE_CHARGE_RATE } from '../data/seed'
import { getReservationById, saveOrder, saveTicket, parseSlot } from '../store/store'
import Badge from '../components/Badge'

export default function MenuPage() {
  const { reservationId } = useParams()
  const navigate = useNavigate()
  const [reservation, setReservation] = useState(null)
  const [activeCategory, setActiveCategory] = useState('Starters')
  const [cart, setCart] = useState({}) // { menuItemId: qty }
  const [cartOpen, setCartOpen] = useState(false)

  useEffect(() => {
    const r = getReservationById(reservationId)
    if (!r) navigate('/reserve')
    else setReservation(r)
  }, [reservationId])

  const addToCart = (id) => setCart(c => ({ ...c, [id]: (c[id] || 0) + 1 }))
  const removeFromCart = (id) => setCart(c => {
    const next = { ...c }
    if (next[id] > 1) next[id]--
    else delete next[id]
    return next
  })

  const cartItems = menuItems.filter(m => cart[m.id])
  const subtotal = cartItems.reduce((s, m) => s + m.price * cart[m.id], 0)
  const gst = Math.round(subtotal * GST_RATE)
  const service = Math.round(subtotal * SERVICE_CHARGE_RATE)
  const total = subtotal + gst + service
  const cartCount = Object.values(cart).reduce((a, b) => a + b, 0)

  function handlePlaceOrder() {
    if (!cartItems.length) return
    const orderItems = cartItems.map(m => ({
      menuItemId: m.id, name: m.name, qty: cart[m.id], price: m.price, prepTime: m.prepTime
    }))
    saveOrder({ reservationId, items: orderItems, status: 'pending' })

    // create kitchen ticket
    const [h, min] = parseSlot(reservation.slot)
    const arrivalTime = new Date(reservation.date + 'T00:00:00')
    arrivalTime.setHours(h, min, 0, 0)
    const maxPrep = Math.max(...orderItems.map(it => it.prepTime))
    const targetPrepStart = new Date(arrivalTime.getTime() - maxPrep * 60 * 1000)

    saveTicket({
      id: `ticket-${reservationId}`,
      reservationId,
      tableNumber: reservation.tableNumber,
      guestName: reservation.guestName,
      partySize: reservation.partySize,
      arrivalTime: arrivalTime.toISOString(),
      targetPrepStart: targetPrepStart.toISOString(),
      items: orderItems,
      status: 'pending',
      priority: false,
    })
    navigate(`/confirmation/${reservationId}`)
  }

  const filtered = menuItems.filter(m => m.category === activeCategory)

  const dietaryIcon = (m) => (
    <span className="flex items-center gap-1 text-xs">
      {m.dietary === 'veg'
        ? <span className="text-green-600 flex items-center gap-0.5"><Leaf size={11} /> Veg</span>
        : <span className="text-red-500 flex items-center gap-0.5"><Drumstick size={11} /> Non-Veg</span>}
      {m.spicy && <span className="text-orange-500 flex items-center gap-0.5"><Flame size={11} /> Spicy</span>}
    </span>
  )

  if (!reservation) return null

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Select Your Menu</h1>
          <p className="text-sm text-gray-500 mt-0.5">
            Table {reservation.tableNumber} · {reservation.slot} · {reservation.partySize} guests
          </p>
        </div>
        <button
          onClick={() => setCartOpen(true)}
          className="relative flex items-center gap-2 bg-orange-500 text-white px-4 py-2.5 rounded-xl font-semibold hover:bg-orange-600 transition-colors"
        >
          <ShoppingCart size={18} />
          Cart
          {cartCount > 0 && (
            <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs font-bold w-5 h-5 rounded-full flex items-center justify-center">
              {cartCount}
            </span>
          )}
        </button>
      </div>

      {/* Category tabs */}
      <div className="flex gap-2 mb-6 overflow-x-auto pb-1">
        {categories.map(cat => (
          <button key={cat} onClick={() => setActiveCategory(cat)}
            className={`px-4 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition-colors
              ${activeCategory === cat ? 'bg-orange-500 text-white' : 'bg-white text-gray-600 border border-gray-200 hover:border-orange-300'}`}
          >{cat}</button>
        ))}
      </div>

      {/* Dish grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {filtered.map(m => (
          <div key={m.id} className="bg-white rounded-2xl border border-gray-200 p-4 flex flex-col gap-3 hover:shadow-sm transition-shadow">
            <div className="flex items-start justify-between">
              <div className="text-4xl">{m.emoji}</div>
              <div className="text-right">
                <div className="font-bold text-gray-900">₹{m.price}</div>
                <div className="text-xs text-gray-400">{m.prepTime} min prep</div>
              </div>
            </div>
            <div>
              <div className="font-semibold text-gray-900">{m.name}</div>
              {dietaryIcon(m)}
            </div>
            {/* Add/remove controls */}
            {cart[m.id] ? (
              <div className="flex items-center justify-between mt-auto">
                <button onClick={() => removeFromCart(m.id)}
                  className="w-8 h-8 rounded-lg bg-orange-50 text-orange-600 flex items-center justify-center hover:bg-orange-100">
                  <Minus size={14} />
                </button>
                <span className="font-semibold text-gray-900">{cart[m.id]}</span>
                <button onClick={() => addToCart(m.id)}
                  className="w-8 h-8 rounded-lg bg-orange-50 text-orange-600 flex items-center justify-center hover:bg-orange-100">
                  <Plus size={14} />
                </button>
              </div>
            ) : (
              <button onClick={() => addToCart(m.id)} className="mt-auto w-full py-2 rounded-lg border border-orange-300 text-orange-600 text-sm font-medium hover:bg-orange-50 transition-colors">
                Add to Order
              </button>
            )}
          </div>
        ))}
      </div>

      {/* Cart sidebar / drawer */}
      {cartOpen && (
        <div className="fixed inset-0 z-50 flex justify-end">
          <div className="absolute inset-0 bg-black/40" onClick={() => setCartOpen(false)} />
          <div className="relative bg-white w-full max-w-sm h-full flex flex-col shadow-2xl">
            <div className="flex items-center justify-between px-5 py-4 border-b border-gray-200">
              <h2 className="font-bold text-gray-900 text-lg">Your Order</h2>
              <button onClick={() => setCartOpen(false)} className="text-gray-400 hover:text-gray-700"><X size={20} /></button>
            </div>

            {cartItems.length === 0 ? (
              <div className="flex-1 flex items-center justify-center text-gray-400 text-sm">No items added yet.</div>
            ) : (
              <>
                <div className="flex-1 overflow-y-auto px-5 py-4 space-y-3">
                  {cartItems.map(m => (
                    <div key={m.id} className="flex items-center justify-between gap-2">
                      <div>
                        <div className="text-sm font-medium text-gray-900">{m.emoji} {m.name}</div>
                        <div className="text-xs text-gray-500">₹{m.price} × {cart[m.id]}</div>
                      </div>
                      <div className="flex items-center gap-2">
                        <button onClick={() => removeFromCart(m.id)} className="w-7 h-7 rounded-lg bg-gray-100 flex items-center justify-center hover:bg-gray-200"><Minus size={12} /></button>
                        <span className="text-sm font-semibold w-4 text-center">{cart[m.id]}</span>
                        <button onClick={() => addToCart(m.id)} className="w-7 h-7 rounded-lg bg-gray-100 flex items-center justify-center hover:bg-gray-200"><Plus size={12} /></button>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Bill preview */}
                <div className="border-t border-gray-200 px-5 py-4 space-y-2 text-sm">
                  <div className="flex justify-between text-gray-600"><span>Subtotal</span><span>₹{subtotal}</span></div>
                  <div className="flex justify-between text-gray-600"><span>GST (5%)</span><span>₹{gst}</span></div>
                  <div className="flex justify-between text-gray-600"><span>Service Charge (10%)</span><span>₹{service}</span></div>
                  <div className="flex justify-between font-bold text-gray-900 text-base pt-1 border-t border-gray-200">
                    <span>Total</span><span>₹{total}</span>
                  </div>
                </div>
                <div className="px-5 pb-5">
                  <button onClick={handlePlaceOrder}
                    className="w-full bg-orange-500 text-white py-3 rounded-xl font-semibold hover:bg-orange-600 transition-colors flex items-center justify-center gap-2">
                    Place Pre-Order <ArrowRight size={16} />
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
