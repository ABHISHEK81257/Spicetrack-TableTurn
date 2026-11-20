// 8 restaurant tables
export const tables = [
  { id: 't1', number: 1, capacity: 2, label: '2-Top' },
  { id: 't2', number: 2, capacity: 2, label: '2-Top' },
  { id: 't3', number: 3, capacity: 4, label: '4-Top' },
  { id: 't4', number: 4, capacity: 4, label: '4-Top' },
  { id: 't5', number: 5, capacity: 4, label: '4-Top' },
  { id: 't6', number: 6, capacity: 4, label: '4-Top' },
  { id: 't7', number: 7, capacity: 6, label: '6-Top' },
  { id: 't8', number: 8, capacity: 6, label: '6-Top' },
]

// Time slots (6 PM – 10:30 PM, 90-min windows every 30 min)
export const timeSlots = [
  '6:00 PM', '6:30 PM', '7:00 PM', '7:30 PM',
  '8:00 PM', '8:30 PM', '9:00 PM', '9:30 PM',
]

// 25 menu items
export const menuItems = [
  // Starters
  { id: 'm1',  name: 'Paneer Tikka',           category: 'Starters',  price: 280,  prepTime: 15, dietary: 'veg',    emoji: '🧀' },
  { id: 'm2',  name: 'Chicken Tikka',           category: 'Starters',  price: 320,  prepTime: 15, dietary: 'nonveg', emoji: '🍗' },
  { id: 'm3',  name: 'Veg Spring Rolls',        category: 'Starters',  price: 220,  prepTime: 12, dietary: 'veg',    emoji: '🥢' },
  { id: 'm4',  name: 'Seekh Kebab',             category: 'Starters',  price: 360,  prepTime: 18, dietary: 'nonveg', emoji: '🍢' },
  { id: 'm5',  name: 'Mushroom Galangal Soup',  category: 'Starters',  price: 180,  prepTime: 10, dietary: 'veg',    emoji: '🍲' },
  { id: 'm6',  name: 'Prawn Cocktail',          category: 'Starters',  price: 420,  prepTime: 12, dietary: 'nonveg', emoji: '🦐', spicy: true },

  // Mains
  { id: 'm7',  name: 'Butter Chicken',          category: 'Mains',     price: 420,  prepTime: 20, dietary: 'nonveg', emoji: '🍛' },
  { id: 'm8',  name: 'Paneer Butter Masala',    category: 'Mains',     price: 360,  prepTime: 20, dietary: 'veg',    emoji: '🧆' },
  { id: 'm9',  name: 'Chicken Biryani',         category: 'Mains',     price: 480,  prepTime: 25, dietary: 'nonveg', emoji: '🍚' },
  { id: 'm10', name: 'Veg Biryani',             category: 'Mains',     price: 380,  prepTime: 22, dietary: 'veg',    emoji: '🍛' },
  { id: 'm11', name: 'Dal Makhani',             category: 'Mains',     price: 280,  prepTime: 18, dietary: 'veg',    emoji: '🫘' },
  { id: 'm12', name: 'Lamb Rogan Josh',         category: 'Mains',     price: 540,  prepTime: 25, dietary: 'nonveg', emoji: '🥩', spicy: true },
  { id: 'm13', name: 'Palak Paneer',            category: 'Mains',     price: 340,  prepTime: 18, dietary: 'veg',    emoji: '🥬' },
  { id: 'm14', name: 'Fish Curry',              category: 'Mains',     price: 460,  prepTime: 20, dietary: 'nonveg', emoji: '🐟', spicy: true },
  { id: 'm15', name: 'Pasta Arrabiata',         category: 'Mains',     price: 320,  prepTime: 15, dietary: 'veg',    emoji: '🍝', spicy: true },
  { id: 'm16', name: 'Grilled Chicken Steak',   category: 'Mains',     price: 580,  prepTime: 22, dietary: 'nonveg', emoji: '🥩' },

  // Breads
  { id: 'm17', name: 'Garlic Naan',             category: 'Breads',    price: 60,   prepTime: 8,  dietary: 'veg',    emoji: '🫓' },
  { id: 'm18', name: 'Laccha Paratha',          category: 'Breads',    price: 70,   prepTime: 8,  dietary: 'veg',    emoji: '🥙' },
  { id: 'm19', name: 'Peshwari Naan',           category: 'Breads',    price: 80,   prepTime: 10, dietary: 'veg',    emoji: '🫓' },

  // Desserts
  { id: 'm20', name: 'Gulab Jamun',             category: 'Desserts',  price: 160,  prepTime: 5,  dietary: 'veg',    emoji: '🍮' },
  { id: 'm21', name: 'Mango Kulfi',             category: 'Desserts',  price: 180,  prepTime: 5,  dietary: 'veg',    emoji: '🍧' },
  { id: 'm22', name: 'Chocolate Lava Cake',     category: 'Desserts',  price: 240,  prepTime: 12, dietary: 'veg',    emoji: '🍫' },

  // Beverages
  { id: 'm23', name: 'Mango Lassi',             category: 'Beverages', price: 120,  prepTime: 3,  dietary: 'veg',    emoji: '🥭' },
  { id: 'm24', name: 'Masala Chai',             category: 'Beverages', price: 80,   prepTime: 5,  dietary: 'veg',    emoji: '☕' },
  { id: 'm25', name: 'Fresh Lime Soda',         category: 'Beverages', price: 90,   prepTime: 2,  dietary: 'veg',    emoji: '🍋' },
]

export const categories = ['Starters', 'Mains', 'Breads', 'Desserts', 'Beverages']

export const GST_RATE = 0.05
export const SERVICE_CHARGE_RATE = 0.10
