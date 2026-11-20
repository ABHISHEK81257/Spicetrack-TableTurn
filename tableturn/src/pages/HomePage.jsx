import { Link } from 'react-router-dom'
import { UtensilsCrossed, ChefHat, BarChart3, ArrowRight } from 'lucide-react'
import { useEffect } from 'react'
import { seedDemoDataIfEmpty } from '../store/store'

export default function HomePage() {
  useEffect(() => { seedDemoDataIfEmpty() }, [])

  const card = (Icon, title, desc, to, cta) => (
    <div className="bg-white rounded-2xl border border-gray-200 p-6 flex flex-col gap-3 hover:shadow-md transition-shadow">
      <div className="w-12 h-12 bg-orange-50 rounded-xl flex items-center justify-center">
        <Icon size={24} className="text-orange-500" />
      </div>
      <div>
        <h3 className="font-semibold text-gray-900">{title}</h3>
        <p className="text-sm text-gray-500 mt-1">{desc}</p>
      </div>
      <Link to={to} className="mt-auto inline-flex items-center gap-1 text-sm font-medium text-orange-600 hover:underline">
        {cta} <ArrowRight size={14} />
      </Link>
    </div>
  )

  return (
    <div className="max-w-4xl mx-auto px-4 py-16">
      {/* Hero */}
      <div className="text-center mb-14">
        <div className="inline-flex items-center gap-2 bg-orange-50 text-orange-700 text-sm font-medium px-4 py-1.5 rounded-full mb-6">
          <UtensilsCrossed size={14} />
          SpiceTrack TableTurn
        </div>
        <h1 className="text-4xl font-bold text-gray-900 mb-4">
          Reserve a Table.<br />Pre-order Your Meal.
        </h1>
        <p className="text-gray-500 text-lg max-w-xl mx-auto">
          Skip the wait — book your slot, pick your dishes in advance, and walk into a table with your food ready.
        </p>
        <Link
          to="/reserve"
          className="mt-8 inline-flex items-center gap-2 bg-orange-500 text-white px-7 py-3 rounded-xl font-semibold hover:bg-orange-600 transition-colors"
        >
          Reserve a Table <ArrowRight size={18} />
        </Link>
      </div>

      {/* Feature cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        {card(UtensilsCrossed, 'Table Reservation', 'Pick a date, time slot, and party size. Tables allocated instantly.', '/reserve', 'Book Now')}
        {card(ChefHat, 'Kitchen Display', 'Live kitchen ticket board with prep timers and status toggles.', '/kds', 'Open KDS')}
        {card(BarChart3, 'Analytics', 'Table occupancy rates and turnaround time insights.', '/analytics', 'View Stats')}
      </div>
    </div>
  )
}
