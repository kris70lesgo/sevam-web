'use client';
 
import { useState } from 'react';
import {
  HardHat, Wrench, Sparkles, Settings, Zap, ChefHat,
  Scissors, Search, ShoppingCart, Trash2, Plus, Minus,
  X, Star, Clock, ChevronRight, LayoutGrid
} from 'lucide-react';
 
interface SubService {
  id: string;
  name: string;
  description: string;
  price: number;
  duration: string;
  rating: number;
  reviews: number;
  image: string;
  process?: string[];
}
 
interface Category {
  id: string;
  name: string;
  icon: React.ElementType;
  color: string;
  bg: string;
  subcategories: SubService[];
}
 
interface CartItem extends SubService {
  quantity: number;
  categoryName: string;
}
 
const categories: Category[] = [
  {
    id: 'labour', name: 'Labour', icon: HardHat, color: '#F97316', bg: '#FFF7ED',
    subcategories: [
      { id: 'l1', name: 'Masonry Helper', description: 'Mixing cement, carrying bricks, general masonry assistance', price: 399, duration: 'Per day', rating: 4.5, reviews: 210, image: 'https://images.unsplash.com/photo-1504307651254-35680f356dfd?w=600&q=80', process: ['Arrive on site', 'Assist with cement mixing', 'Carry materials as directed', 'Site cleanup'] },
      { id: 'l2', name: 'Loading / Unloading', description: 'Warehouse shifting, house moving, heavy item loading', price: 499, duration: '4 hrs', rating: 4.6, reviews: 340, image: 'https://images.unsplash.com/photo-1601584115197-04ecc0da31d7?w=600&q=80', process: ['Assess items', 'Careful packing', 'Loading/unloading', 'Placement at destination'] },
      { id: 'l3', name: 'Painting Helper', description: 'Scraping, sanding, masking surfaces before painting', price: 349, duration: 'Per day', rating: 4.4, reviews: 180, image: 'https://images.unsplash.com/photo-1562259949-e8e7689d7828?w=600&q=80', process: ['Surface preparation', 'Scraping old paint', 'Sanding & masking', 'Clean-up after work'] },
      { id: 'l4', name: 'Cleaning Helper', description: 'Post-construction cleanup, heavy lifting, debris removal', price: 449, duration: 'Per day', rating: 4.5, reviews: 290, image: 'https://images.unsplash.com/photo-1628177142898-93e36e4e3a50?w=600&q=80', process: ['Debris collection', 'Heavy item shifting', 'Mopping & dusting', 'Waste disposal'] },
      { id: 'l5', name: 'Gardening', description: 'Digging, planting, lawn mowing and garden maintenance', price: 299, duration: '3 hrs', rating: 4.7, reviews: 420, image: 'https://images.unsplash.com/photo-1416879595882-3373a0480b5b?w=600&q=80', process: ['Lawn assessment', 'Mowing & trimming', 'Planting/digging', 'Watering & cleanup'] },
      { id: 'l6', name: 'Packing / Moving', description: 'House shifting, box packing, safe item transport', price: 599, duration: 'Half day', rating: 4.6, reviews: 380, image: 'https://images.unsplash.com/photo-1530435460869-d13625c69bbf?w=600&q=80', process: ['Inventory listing', 'Safe packing', 'Loading vehicle', 'Unpacking at new location'] },
      { id: 'l7', name: 'Other Labour', description: 'Any other general labour work not listed above', price: 399, duration: 'Flexible', rating: 4.4, reviews: 150, image: 'https://images.unsplash.com/photo-1504328345606-18bbc8c9d7d1?w=600&q=80', process: ['Discuss requirements', 'Agree on scope', 'Complete the work', 'Review & payment'] },
    ],
  },
  {
    id: 'plumbing', name: 'Plumbing', icon: Wrench, color: '#3B82F6', bg: '#EFF6FF',
    subcategories: [
      { id: 'p1', name: 'Leak Repair', description: 'Taps, pipes, tanks — fast leak detection & fixing', price: 199, duration: '1 hr', rating: 4.7, reviews: 520, image: 'https://images.unsplash.com/photo-1558618047-3c8c76ca7d13?w=600&q=80', process: ['Locate the leak', 'Assess damage', 'Repair/replace parts', 'Test & verify fix'] },
      { id: 'p2', name: 'Toilet / Bathroom Fitting', description: 'Commode, shower, geyser installation and fitting', price: 699, duration: '2 hrs', rating: 4.8, reviews: 310, image: 'https://images.unsplash.com/photo-1552321554-5fefe8c9ef14?w=600&q=80', process: ['Site inspection', 'Disconnect old fixtures', 'Install new fittings', 'Test for leaks'] },
      { id: 'p3', name: 'Drain Cleaning', description: 'Clogged sinks, sewage lines, blocked drains', price: 249, duration: '1 hr', rating: 4.6, reviews: 440, image: 'https://images.unsplash.com/photo-1581244277943-fe4a9c777189?w=600&q=80', process: ['Identify blockage point', 'Use drain snake/hydro jet', 'Clear blockage', 'Test water flow'] },
      { id: 'p4', name: 'Motor / Pump Repair', description: 'Borewell, tank filling motors, pump servicing', price: 499, duration: '1.5 hrs', rating: 4.7, reviews: 280, image: 'https://images.unsplash.com/photo-1504328345606-18bbc8c9d7d1?w=600&q=80', process: ['Diagnose motor issue', 'Check wiring', 'Repair/replace parts', 'Test operation'] },
      { id: 'p5', name: 'Pipe Fitting', description: 'New connections, PVC/CPVC pipe work and installation', price: 349, duration: '2 hrs', rating: 4.6, reviews: 360, image: 'https://images.unsplash.com/photo-1585771724684-38269d6639fd?w=600&q=80', process: ['Plan pipe route', 'Cut & fit pipes', 'Joint sealing', 'Pressure test'] },
      { id: 'p6', name: 'Water Tank Cleaning', description: 'Overhead and underground tank disinfection & scrubbing', price: 599, duration: '2 hrs', rating: 4.8, reviews: 410, image: 'https://images.unsplash.com/photo-1504328345606-18bbc8c9d7d1?w=600&q=80', process: ['Drain existing water', 'Scrub interior walls', 'Disinfect with solution', 'Refill & verify clean'] },
      { id: 'p7', name: 'Kitchen Plumbing', description: 'Sink, dishwasher connection, RO installation', price: 399, duration: '1.5 hrs', rating: 4.7, reviews: 290, image: 'https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=600&q=80', process: ['Assess kitchen layout', 'Install inlet/outlet', 'Connect appliances', 'Check for leaks'] },
      { id: 'p8', name: 'Other Plumbing', description: 'Any other plumbing work not listed above', price: 299, duration: 'Flexible', rating: 4.5, reviews: 160, image: 'https://images.unsplash.com/photo-1558618047-3c8c76ca7d13?w=600&q=80', process: ['Discuss requirements', 'Assess on site', 'Complete work', 'Review & payment'] },
    ],
  },
  {
    id: 'cleaning', name: 'Cleaning', icon: Sparkles, color: '#06B6D4', bg: '#ECFEFF',
    subcategories: [
      { id: 'c1', name: 'Home Deep Cleaning', description: 'Full house cleaning, move-in/move-out deep clean', price: 299, duration: '3 hrs', rating: 4.9, reviews: 680, image: 'https://images.unsplash.com/photo-1628177142898-93e36e4e3a50?w=600&q=80', process: ['Room-by-room plan', 'Dust & vacuum', 'Mop all floors', 'Sanitize surfaces'] },
      { id: 'c2', name: 'Bathroom Cleaning', description: 'Tiles, grout scrubbing, acid wash, full sanitization', price: 149, duration: '1 hr', rating: 4.7, reviews: 340, image: 'https://images.unsplash.com/photo-1552321554-5fefe8c9ef14?w=600&q=80', process: ['Apply cleaning agents', 'Scrub tiles & grout', 'Clean fixtures', 'Disinfect & dry'] },
      { id: 'c3', name: 'Kitchen Cleaning', description: 'Chimney, exhaust, grease removal, cabinet cleaning', price: 199, duration: '2 hrs', rating: 4.8, reviews: 290, image: 'https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=600&q=80', process: ['Degrease chimney', 'Clean countertops', 'Scrub sink & taps', 'Wipe cabinets inside/out'] },
      { id: 'c4', name: 'Water Tank Cleaning', description: 'Full disinfection, scrubbing, sanitization of tanks', price: 599, duration: '2 hrs', rating: 4.8, reviews: 410, image: 'https://images.unsplash.com/photo-1504328345606-18bbc8c9d7d1?w=600&q=80', process: ['Drain tank', 'Scrub walls', 'Disinfect', 'Refill & check'] },
      { id: 'c5', name: 'Office / Commercial Cleaning', description: 'Shops, small offices, commercial spaces deep clean', price: 799, duration: '4 hrs', rating: 4.6, reviews: 210, image: 'https://images.unsplash.com/photo-1628177142898-93e36e4e3a50?w=600&q=80', process: ['Area assessment', 'Dust & vacuum all areas', 'Sanitize workstations', 'Clean washrooms'] },
      { id: 'c6', name: 'Post-Construction Cleaning', description: 'Debris removal, dust cleaning, final finishing', price: 999, duration: '5 hrs', rating: 4.7, reviews: 180, image: 'https://images.unsplash.com/photo-1628177142898-93e36e4e3a50?w=600&q=80', process: ['Remove construction debris', 'Dust all surfaces', 'Clean windows & floors', 'Final polish'] },
      { id: 'c7', name: 'Dishes Cleaning', description: 'Professional dishwashing service for home or events', price: 199, duration: '1.5 hrs', rating: 4.5, reviews: 220, image: 'https://images.unsplash.com/photo-1596797038530-2c107229654b?w=600&q=80', process: ['Sort dishes', 'Wash with detergent', 'Rinse & dry', 'Stack & arrange'] },
      { id: 'c8', name: 'Other Cleaning', description: 'Any other cleaning work not listed above', price: 249, duration: 'Flexible', rating: 4.5, reviews: 140, image: 'https://images.unsplash.com/photo-1628177142898-93e36e4e3a50?w=600&q=80', process: ['Discuss requirements', 'Plan cleaning', 'Execute work', 'Review & payment'] },
    ],
  },
  {
    id: 'repairing', name: 'Repairing', icon: Settings, color: '#8B5CF6', bg: '#F5F3FF',
    subcategories: [
      { id: 'r1', name: 'Furniture Repair', description: 'Wooden chair, table, wobbling furniture, hinge fixing', price: 299, duration: '1.5 hrs', rating: 4.6, reviews: 310, image: 'https://images.unsplash.com/photo-1555041469-a586c61ea9bc?w=600&q=80', process: ['Inspect damage', 'Tighten joints & screws', 'Replace hinges if needed', 'Polish & finish'] },
      { id: 'r2', name: 'Door / Window Repair', description: 'Hinges, handles, sliding channels, lock fitting', price: 249, duration: '1 hr', rating: 4.7, reviews: 280, image: 'https://images.unsplash.com/photo-1517581177682-a085bb7ffb15?w=600&q=80', process: ['Check door/window alignment', 'Tighten or replace hinges', 'Fix handles & locks', 'Test smooth operation'] },
      { id: 'r3', name: 'Locksmith', description: 'Lock change, key making, digital lock installation', price: 349, duration: '1 hr', rating: 4.8, reviews: 390, image: 'https://images.unsplash.com/photo-1558618047-3c8c76ca7d13?w=600&q=80', process: ['Assess lock type', 'Remove old lock', 'Install new lock', 'Test & hand over keys'] },
      { id: 'r4', name: 'Washing Machine Repair', description: 'Basic troubleshooting, installation, drum issues', price: 299, duration: '1.5 hrs', rating: 4.8, reviews: 510, image: 'https://images.unsplash.com/photo-1626806787461-102c1bfaaea1?w=600&q=80', process: ['Diagnose fault', 'Check motor & drum', 'Replace faulty parts', 'Test wash cycle'] },
      { id: 'r5', name: 'Fridge Repair', description: 'Gas refill, compressor issues, cooling problems', price: 399, duration: '2 hrs', rating: 4.7, reviews: 380, image: 'https://images.unsplash.com/photo-1584568694244-14fbdf83bd30?w=600&q=80', process: ['Check cooling level', 'Inspect compressor', 'Gas refill if needed', 'Test temperature'] },
      { id: 'r6', name: 'Microwave / Oven Repair', description: 'Heating issues, element replacement, door repair', price: 249, duration: '1 hr', rating: 4.6, reviews: 240, image: 'https://images.unsplash.com/photo-1574269909862-7e1d70bb8078?w=600&q=80', process: ['Test microwave/oven', 'Identify faulty component', 'Replace element/part', 'Test heating'] },
      { id: 'r7', name: 'AC Repair', description: 'Installation assist, cleaning, gas refill, servicing', price: 499, duration: '2 hrs', rating: 4.9, reviews: 620, image: 'https://images.unsplash.com/photo-1631744007979-3aa9e7b48c81?w=600&q=80', process: ['Check cooling & gas', 'Clean filters & coils', 'Refill gas if needed', 'Test cooling output'] },
      { id: 'r8', name: 'RO / Water Purifier', description: 'Filter change, membrane replacement, servicing', price: 349, duration: '1 hr', rating: 4.7, reviews: 290, image: 'https://images.unsplash.com/photo-1504328345606-18bbc8c9d7d1?w=600&q=80', process: ['Check TDS & flow', 'Replace filters', 'Change membrane', 'Test water quality'] },
      { id: 'r9', name: 'Other Repair', description: 'Any other repair work not listed above', price: 299, duration: 'Flexible', rating: 4.5, reviews: 170, image: 'https://images.unsplash.com/photo-1555041469-a586c61ea9bc?w=600&q=80', process: ['Discuss issue', 'Diagnose on site', 'Repair work', 'Test & handover'] },
    ],
  },
  {
    id: 'electrician', name: 'Electrician', icon: Zap, color: '#F59E0B', bg: '#FFFBEB',
    subcategories: [
      { id: 'e1', name: 'Wiring / Rewiring', description: 'New points, concealed wiring, rewiring old systems', price: 299, duration: '2 hrs', rating: 4.8, reviews: 320, image: 'https://images.unsplash.com/photo-1621905252507-b35492cc74b4?w=600&q=80', process: ['Plan wiring route', 'Lay conduit/cables', 'Connect to DB board', 'Test all points'] },
      { id: 'e2', name: 'Fan / Light Installation', description: 'Ceiling fan, LED panels, tube lights installation', price: 199, duration: '1 hr', rating: 4.7, reviews: 410, image: 'https://images.unsplash.com/photo-1565814329452-e1efa11c5b89?w=600&q=80', process: ['Mark installation point', 'Fix bracket/hook', 'Connect wiring', 'Test operation'] },
      { id: 'e3', name: 'Switch / Socket Repair', description: 'Board replacement, MCB fitting, socket repair', price: 149, duration: '30 mins', rating: 4.6, reviews: 480, image: 'https://images.unsplash.com/photo-1621905252507-b35492cc74b4?w=600&q=80', process: ['Isolate power', 'Remove old switch/socket', 'Install new unit', 'Test & restore power'] },
      { id: 'e4', name: 'Inverter / UPS Installation', description: 'Battery connection, wiring, UPS setup', price: 399, duration: '1.5 hrs', rating: 4.7, reviews: 260, image: 'https://images.unsplash.com/photo-1621905252507-b35492cc74b4?w=600&q=80', process: ['Select install location', 'Connect batteries', 'Wire to DB board', 'Test switchover'] },
      { id: 'e5', name: 'Geyser / Heater Repair', description: 'Element replacement, thermostat fixing, installation', price: 349, duration: '1 hr', rating: 4.8, reviews: 340, image: 'https://images.unsplash.com/photo-1631744007979-3aa9e7b48c81?w=600&q=80', process: ['Test heating element', 'Check thermostat', 'Replace faulty parts', 'Test hot water output'] },
      { id: 'e6', name: 'Home Automation', description: 'Smart switches, WiFi controls, basic automation setup', price: 699, duration: '2 hrs', rating: 4.6, reviews: 190, image: 'https://images.unsplash.com/photo-1565814329452-e1efa11c5b89?w=600&q=80', process: ['Plan automation layout', 'Install smart switches', 'Configure WiFi/app', 'Demo & handover'] },
      { id: 'e7', name: 'AC Electrical', description: 'Stabilizer install, outdoor unit wiring, power setup', price: 449, duration: '1.5 hrs', rating: 4.7, reviews: 280, image: 'https://images.unsplash.com/photo-1631744007979-3aa9e7b48c81?w=600&q=80', process: ['Check power requirements', 'Install stabilizer', 'Wire outdoor unit', 'Test AC startup'] },
      { id: 'e8', name: 'Other Electrical', description: 'Any other electrical work not listed above', price: 249, duration: 'Flexible', rating: 4.5, reviews: 150, image: 'https://images.unsplash.com/photo-1621905252507-b35492cc74b4?w=600&q=80', process: ['Discuss requirements', 'Safety assessment', 'Complete work', 'Test & handover'] },
    ],
  },
  {
    id: 'chef', name: 'Chef / Cooking', icon: ChefHat, color: '#EF4444', bg: '#FEF2F2',
    subcategories: [
      { id: 'ch1', name: 'Home Cook', description: 'Daily meals, North Indian, South Indian, multi-cuisine', price: 8000, duration: 'Monthly', rating: 4.9, reviews: 520, image: 'https://images.unsplash.com/photo-1466637574441-749b8f19452f?w=600&q=80', process: ['Menu planning', 'Grocery assistance', 'Cook daily meals', 'Kitchen cleanup'] },
      { id: 'ch2', name: 'Party / Event Catering', description: 'Small gatherings, 10-50 people, multi-dish setup', price: 2999, duration: 'Per event', rating: 4.8, reviews: 310, image: 'https://images.unsplash.com/photo-1555244162-803834f70033?w=600&q=80', process: ['Menu finalisation', 'Ingredient sourcing', 'Cooking & plating', 'Serving & cleanup'] },
      { id: 'ch3', name: 'Festival Special', description: 'Sweets, snacks for Diwali, Eid, festivals and occasions', price: 1499, duration: 'Per session', rating: 4.7, reviews: 280, image: 'https://images.unsplash.com/photo-1546833998-877b37c2e5c6?w=600&q=80', process: ['Finalise menu', 'Prepare ingredients', 'Cook festive items', 'Pack & serve'] },
      { id: 'ch4', name: 'Live Counter', description: 'Dosa, chaat, BBQ live counter setup for parties', price: 3999, duration: 'Per event', rating: 4.8, reviews: 190, image: 'https://images.unsplash.com/photo-1490645935967-10de6ba17061?w=600&q=80', process: ['Setup counter & equipment', 'Prepare ingredients', 'Live cooking for guests', 'Pack up & clean'] },
      { id: 'ch5', name: 'Other Chef Service', description: 'Any other cooking or chef service not listed above', price: 999, duration: 'Flexible', rating: 4.6, reviews: 120, image: 'https://images.unsplash.com/photo-1466637574441-749b8f19452f?w=600&q=80', process: ['Discuss requirements', 'Plan menu', 'Cook as agreed', 'Handover & cleanup'] },
    ],
  },
  {
    id: 'grooming', name: 'Grooming', icon: Scissors, color: '#EC4899', bg: '#FDF2F8',
    subcategories: [
      { id: 'g1', name: 'Haircut / Hair Styling', description: 'Men & women haircut, styling, at-home service', price: 299, duration: '45 mins', rating: 4.7, reviews: 560, image: 'https://images.unsplash.com/photo-1560066984-138dadb4c035?w=600&q=80', process: ['Consult on style', 'Wash & condition', 'Cut & style', 'Final look & dry'] },
      { id: 'g2', name: 'Facial / Cleanup', description: 'Home facial services, skin cleanup and glow treatment', price: 499, duration: '1 hr', rating: 4.8, reviews: 420, image: 'https://images.unsplash.com/photo-1600334129128-685c5582fd35?w=600&q=80', process: ['Skin assessment', 'Cleanse & steam', 'Apply facial pack', 'Moisturise & finish'] },
      { id: 'g3', name: 'Manicure / Pedicure', description: 'Professional nail care, cuticle work, polish', price: 399, duration: '1 hr', rating: 4.7, reviews: 380, image: 'https://images.unsplash.com/photo-1600334129128-685c5582fd35?w=600&q=80', process: ['Soak hands/feet', 'Shape & buff nails', 'Cuticle care', 'Apply polish'] },
      { id: 'g4', name: 'Massage Therapy', description: 'Relaxation massage, pain relief, non-spa home service', price: 799, duration: '1 hr', rating: 4.9, reviews: 490, image: 'https://images.unsplash.com/photo-1600334129128-685c5582fd35?w=600&q=80', process: ['Discuss pressure preference', 'Warm-up strokes', 'Deep tissue work', 'Cool down & relax'] },
      { id: 'g5', name: 'Mehendi Artist', description: 'Bridal mehendi, party designs, festival henna art', price: 599, duration: '1.5 hrs', rating: 4.8, reviews: 310, image: 'https://images.unsplash.com/photo-1560066984-138dadb4c035?w=600&q=80', process: ['Choose design', 'Apply mehendi cone', 'Fill detailed patterns', 'Dry time & sealing'] },
      { id: 'g6', name: 'Makeup Artist', description: 'Party makeup, bridal assist, occasion makeup', price: 999, duration: '1.5 hrs', rating: 4.8, reviews: 350, image: 'https://images.unsplash.com/photo-1560066984-138dadb4c035?w=600&q=80', process: ['Skin prep & primer', 'Foundation & contouring', 'Eye & lip makeup', 'Setting spray & finish'] },
      { id: 'g7', name: 'Waxing / Threading', description: 'Full body waxing, eyebrow threading, at-home service', price: 349, duration: '45 mins', rating: 4.6, reviews: 440, image: 'https://images.unsplash.com/photo-1560066984-138dadb4c035?w=600&q=80', process: ['Prep skin with powder', 'Apply wax/thread area', 'Remove & soothe skin', 'Apply calming lotion'] },
      { id: 'g8', name: 'Senior Care Grooming', description: 'Nail trimming, basic hygiene care for elderly', price: 399, duration: '1 hr', rating: 4.9, reviews: 180, image: 'https://images.unsplash.com/photo-1600334129128-685c5582fd35?w=600&q=80', process: ['Gentle assessment', 'Nail & hair trim', 'Hygiene care', 'Comfort check'] },
      { id: 'g9', name: 'Other Grooming', description: 'Any other beauty or grooming service not listed', price: 299, duration: 'Flexible', rating: 4.5, reviews: 130, image: 'https://images.unsplash.com/photo-1560066984-138dadb4c035?w=600&q=80', process: ['Discuss requirements', 'Prepare tools', 'Complete service', 'Review & payment'] },
    ],
  },
];
 
export default function ServicesPage() {
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [cart, setCart] = useState<CartItem[]>([]);
  const [search, setSearch] = useState('');
  const [popup, setPopup] = useState<{ service: SubService; categoryName: string } | null>(null);
 
  const sidebarItems = [
    { id: 'all', name: 'All', icon: LayoutGrid, color: '#64748B', bg: '#F8FAFC' },
    ...categories.map(c => ({ id: c.id, name: c.name, icon: c.icon, color: c.color, bg: c.bg })),
  ];
 
  const allServices = categories.flatMap(c => c.subcategories.map(s => ({ ...s, categoryName: c.name })));
  const currentCategory = categories.find(c => c.id === selectedCategory);
  const baseServices = selectedCategory === 'all'
    ? allServices
    : (currentCategory?.subcategories.map(s => ({ ...s, categoryName: currentCategory.name })) ?? []);
  const currentServices = baseServices.filter(s =>
    s.name.toLowerCase().includes(search.toLowerCase()) ||
    s.description.toLowerCase().includes(search.toLowerCase())
  );
 
  const addToCart = (service: SubService, categoryName: string) => {
    setCart(prev => {
      const existing = prev.find(i => i.id === service.id);
      if (existing) return prev.map(i => i.id === service.id ? { ...i, quantity: i.quantity + 1 } : i);
      return [...prev, { ...service, categoryName, quantity: 1 }];
    });
  };
 
  const removeFromCart = (id: string) => setCart(prev => prev.filter(i => i.id !== id));
  const updateQty = (id: string, delta: number) =>
    setCart(prev => prev.map(i => i.id === id ? { ...i, quantity: i.quantity + delta } : i).filter(i => i.quantity > 0));
 
  const isInCart = (id: string) => cart.some(i => i.id === id);
  const cartQty = (id: string) => cart.find(i => i.id === id)?.quantity ?? 0;
  const subtotal = cart.reduce((s, i) => s + i.price * i.quantity, 0);
  const total = subtotal + (cart.length > 0 ? 50 : 0);
 
  return (
    <div style={{ minHeight: '100vh', display: 'flex', background: '#F5F7FA', position: 'relative' }}>
 
      {/* POPUP MODAL */}
      {popup && (
        <div
          style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 24 }}
          onClick={() => setPopup(null)}
        >
          <div
            style={{ background: '#fff', borderRadius: 20, width: '100%', maxWidth: 640, maxHeight: '88vh', overflow: 'auto', boxShadow: '0 24px 64px rgba(0,0,0,0.2)' }}
            onClick={e => e.stopPropagation()}
          >
            {/* Image */}
            <div style={{ position: 'relative', height: 220, overflow: 'hidden', borderRadius: '20px 20px 0 0' }}>
              <img src={popup.service.image} alt={popup.service.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
              <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to top, rgba(0,0,0,0.4) 0%, transparent 60%)' }} />
              <button onClick={() => setPopup(null)}
                style={{ position: 'absolute', top: 14, right: 14, width: 34, height: 34, borderRadius: '50%', background: 'rgba(0,0,0,0.4)', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', backdropFilter: 'blur(4px)' }}>
                <X style={{ width: 16, height: 16, color: '#fff' }} />
              </button>
              <span style={{ position: 'absolute', bottom: 14, left: 16, background: 'rgba(0,0,0,0.55)', color: '#fff', fontSize: 11, fontWeight: 600, padding: '4px 10px', borderRadius: 8 }}>
                {popup.categoryName}
              </span>
            </div>
 
            <div style={{ padding: '22px 26px' }}>
              {/* Title + rating */}
              <h2 style={{ fontSize: 22, fontWeight: 800, color: '#0F172A', marginBottom: 6 }}>{popup.service.name}</h2>
              <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 14 }}>
                <Star style={{ width: 14, height: 14, color: '#F59E0B', fill: '#F59E0B' }} />
                <span style={{ fontSize: 14, fontWeight: 700, color: '#374151' }}>{popup.service.rating}</span>
                <span style={{ fontSize: 13, color: '#94A3B8' }}>({popup.service.reviews} reviews)</span>
                <span style={{ color: '#E2E8F0', margin: '0 4px' }}>•</span>
                <Clock style={{ width: 13, height: 13, color: '#94A3B8' }} />
                <span style={{ fontSize: 13, color: '#94A3B8' }}>{popup.service.duration}</span>
              </div>
 
              <p style={{ fontSize: 14, color: '#64748B', lineHeight: 1.7, marginBottom: 20 }}>{popup.service.description}</p>
 
              {/* Process */}
              {popup.service.process && (
                <div style={{ marginBottom: 24 }}>
                  <h3 style={{ fontSize: 15, fontWeight: 700, color: '#0F172A', marginBottom: 14 }}>Our Process</h3>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 0 }}>
                    {popup.service.process.map((step, i) => (
                      <div key={i} style={{ display: 'flex', gap: 14 }}>
                        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                          <div style={{ width: 28, height: 28, borderRadius: '50%', background: '#F97316', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 12, fontWeight: 800, color: '#fff', flexShrink: 0 }}>
                            {i + 1}
                          </div>
                          {i < (popup.service.process?.length ?? 0) - 1 && (
                            <div style={{ width: 2, height: 28, background: '#FED7AA', margin: '2px 0' }} />
                          )}
                        </div>
                        <div style={{ paddingTop: 5, paddingBottom: i < (popup.service.process?.length ?? 0) - 1 ? 0 : 0 }}>
                          <p style={{ fontSize: 13, color: '#374151', fontWeight: 500, marginBottom: i < (popup.service.process?.length ?? 0) - 1 ? 16 : 0 }}>{step}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
 
              {/* Price + Add to Cart */}
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderTop: '1px solid #F1F5F9', paddingTop: 18 }}>
                <div>
                  <p style={{ fontSize: 11, color: '#94A3B8', marginBottom: 2 }}>Starting from</p>
                  <p style={{ fontSize: 26, fontWeight: 800, color: '#F97316' }}>₹{popup.service.price}</p>
                </div>
                {isInCart(popup.service.id) ? (
                  <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
                    <button onClick={() => updateQty(popup.service.id, -1)}
                      style={{ width: 36, height: 36, borderRadius: '50%', border: '2px solid #F97316', background: '#fff', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      <Minus style={{ width: 16, height: 16, color: '#F97316' }} />
                    </button>
                    <span style={{ fontSize: 18, fontWeight: 800, color: '#1A3C6E', minWidth: 20, textAlign: 'center' as const }}>{cartQty(popup.service.id)}</span>
                    <button onClick={() => updateQty(popup.service.id, 1)}
                      style={{ width: 36, height: 36, borderRadius: '50%', border: '2px solid #F97316', background: '#fff', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      <Plus style={{ width: 16, height: 16, color: '#F97316' }} />
                    </button>
                    <button onClick={() => setPopup(null)}
                      style={{ padding: '10px 24px', borderRadius: 12, background: '#1A3C6E', color: '#fff', border: 'none', fontSize: 14, fontWeight: 700, cursor: 'pointer' }}>
                      View Cart →
                    </button>
                  </div>
                ) : (
                  <button
                    onClick={() => { addToCart(popup.service, popup.categoryName); }}
                    style={{ padding: '12px 32px', borderRadius: 12, background: '#F97316', color: '#fff', border: 'none', fontSize: 15, fontWeight: 800, cursor: 'pointer', boxShadow: '0 4px 14px rgba(249,115,22,0.3)' }}
                    onMouseEnter={e => (e.currentTarget.style.background = '#EA580C')}
                    onMouseLeave={e => (e.currentTarget.style.background = '#F97316')}
                  >
                    Add to Cart
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
 
      {/* LEFT SIDEBAR */}
      <aside style={{ width: 196, background: '#ffffff', borderRight: '1px solid #F1F5F9', position: 'sticky', top: 0, height: '100vh', overflow: 'auto', flexShrink: 0 }}>
        <div style={{ padding: '16px 10px', overflow: 'hidden' }}>
          <p style={{ fontSize: 10, fontWeight: 700, color: '#94A3B8', letterSpacing: '0.12em', textTransform: 'uppercase' as const, marginBottom: 10, paddingLeft: 8 }}>
            Categories
          </p>
          <nav style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
            {sidebarItems.map(item => {
              const Icon = item.icon;
              const active = selectedCategory === item.id;
              return (
                <button key={item.id} onClick={() => setSelectedCategory(item.id)}
                  style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '9px 10px', borderRadius: 10, border: 'none', cursor: 'pointer', background: active ? '#FFF7ED' : 'transparent', transition: 'all 0.15s', width: '100%', textAlign: 'left' as const }}
                  onMouseEnter={e => { if (!active) (e.currentTarget as HTMLElement).style.background = '#F8FAFC'; }}
                  onMouseLeave={e => { if (!active) (e.currentTarget as HTMLElement).style.background = 'transparent'; }}
                >
                  <div style={{ width: 30, height: 30, borderRadius: 8, background: active ? item.color : '#EEF2FF', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                    <Icon style={{ width: 14, height: 14, color: active ? '#fff' : '#1A3C6E' }} />
                  </div>
                  <span style={{ fontSize: 13, fontWeight: active ? 700 : 400, color: active ? '#F97316' : '#475569' }}>
                    {item.name}
                  </span>
                </button>
              );
            })}
          </nav>
        </div>
      </aside>
 
      {/* MAIN CONTENT */}
      <main style={{ flex: 1, overflow: 'auto', padding: '28px 60px' }}>
        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 24 }}>
          <div>
            <h1 style={{ fontSize: 24, fontWeight: 800, color: '#1A3C6E', marginBottom: 3 }}>
              {selectedCategory === 'all' ? 'All Services' : (currentCategory?.name + ' Services')}
            </h1>
            <p style={{ fontSize: 13, color: '#94A3B8' }}>{currentServices.length} services available</p>
          </div>
          <div style={{ position: 'relative', width: 280 }}>
            <Search style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', width: 14, height: 14, color: '#CBD5E1' }} />
            <input type="text" placeholder="Search services..." value={search} onChange={e => setSearch(e.target.value)}
              style={{ width: '100%', paddingLeft: 36, paddingRight: 14, paddingTop: 10, paddingBottom: 10, borderRadius: 10, border: '1.5px solid #E2E8F0', background: '#fff', fontSize: 13, outline: 'none', boxSizing: 'border-box' as const }}
              onFocus={e => (e.target.style.borderColor = '#F97316')}
              onBlur={e => (e.target.style.borderColor = '#E2E8F0')}
            />
          </div>
        </div>
 
        {/* Grid */}
        {currentServices.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '80px 0' }}>
            <p style={{ fontSize: 16, fontWeight: 700, color: '#1A3C6E', marginBottom: 4 }}>No services found</p>
            <p style={{ fontSize: 13, color: '#94A3B8' }}>Try a different search or category</p>
          </div>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 220px))', gap: 22, justifyContent: 'start' }}>
            {currentServices.map(service => (
              <div key={service.id}
                style={{ background: '#fff', borderRadius: 16, border: '1px solid #F1F5F9', overflow: 'hidden', boxShadow: '0 1px 4px rgba(0,0,0,0.05)', cursor: 'pointer', transition: 'all 0.2s', display: 'flex', flexDirection: 'column', width: 220 }}
                onClick={() => setPopup({ service, categoryName: service.categoryName })}
                onMouseEnter={e => { (e.currentTarget as HTMLElement).style.boxShadow = '0 8px 28px rgba(0,0,0,0.1)'; (e.currentTarget as HTMLElement).style.transform = 'translateY(-3px)'; }}
                onMouseLeave={e => { (e.currentTarget as HTMLElement).style.boxShadow = '0 1px 4px rgba(0,0,0,0.05)'; (e.currentTarget as HTMLElement).style.transform = 'translateY(0)'; }}
              >
                {/* Image */}
                <div style={{ position: 'relative', height: 148, overflow: 'hidden', background: '#F1F5F9' }}>
                  <img src={service.image} alt={service.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                  <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to top, rgba(0,0,0,0.2) 0%, transparent 55%)' }} />
                  {service.duration && (
                    <span style={{ position: 'absolute', bottom: 8, left: 10, background: 'rgba(0,0,0,0.55)', color: '#fff', fontSize: 10, padding: '3px 8px', borderRadius: 6, display: 'flex', alignItems: 'center', gap: 3 }}>
                      <Clock style={{ width: 10, height: 10 }} />{service.duration}
                    </span>
                  )}
                  {/* Add button */}
                  <button
                    onClick={e => { e.stopPropagation(); addToCart(service, service.categoryName); }}
                    style={{ position: 'absolute', top: 8, right: 8, width: 28, height: 28, borderRadius: '50%', background: isInCart(service.id) ? '#1A3C6E' : '#fff', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 2px 8px rgba(0,0,0,0.15)', transition: 'background 0.15s' }}
                    onMouseEnter={e => { e.stopPropagation(); if (!isInCart(service.id)) (e.currentTarget as HTMLElement).style.background = '#F97316'; }}
                    onMouseLeave={e => { e.stopPropagation(); if (!isInCart(service.id)) (e.currentTarget as HTMLElement).style.background = '#fff'; }}
                  >
                    <Plus style={{ width: 14, height: 14, color: isInCart(service.id) ? '#fff' : '#F97316' }} />
                  </button>
                </div>
 
                {/* Info */}
                <div style={{ padding: '13px 14px', flex: 1, display: 'flex', flexDirection: 'column' }}>
                  <p style={{ fontSize: 14, fontWeight: 700, color: '#1A3C6E', marginBottom: 3, lineHeight: 1.3 }}>{service.name}</p>
                  <p style={{ fontSize: 11, color: '#94A3B8', lineHeight: 1.5, marginBottom: 8, flex: 1 }}>{service.description}</p>
                  {service.rating && (
                    <div style={{ display: 'flex', alignItems: 'center', gap: 3, marginBottom: 8 }}>
                      <Star style={{ width: 11, height: 11, color: '#F59E0B', fill: '#F59E0B' }} />
                      <span style={{ fontSize: 11, fontWeight: 700, color: '#374151' }}>{service.rating}</span>
                      <span style={{ fontSize: 11, color: '#CBD5E1' }}>({service.reviews})</span>
                    </div>
                  )}
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <span style={{ fontSize: 17, fontWeight: 800, color: '#F97316' }}>₹{service.price}</span>
                    {isInCart(service.id) && (
                      <span style={{ fontSize: 10, fontWeight: 700, color: '#059669', background: '#ECFDF5', padding: '2px 8px', borderRadius: 20 }}>Added ✓</span>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>
 
      {/* CART PANEL */}
      {cart.length > 0 && (
        <aside style={{ width: 272, background: '#fff', borderLeft: '1px solid #F1F5F9', position: 'sticky', top: 0, height: '100vh', overflow: 'auto', flexShrink: 0 }}>
          <div style={{ padding: '18px 16px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 16, paddingBottom: 14, borderBottom: '1px solid #F1F5F9' }}>
              <div style={{ width: 32, height: 32, borderRadius: 9, background: '#FFF7ED', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <ShoppingCart style={{ width: 15, height: 15, color: '#F97316' }} />
              </div>
              <span style={{ fontSize: 15, fontWeight: 800, color: '#1A3C6E' }}>Your Cart</span>
              <span style={{ marginLeft: 'auto', background: '#F97316', color: '#fff', fontSize: 11, fontWeight: 700, padding: '2px 8px', borderRadius: 20 }}>{cart.length}</span>
            </div>
 
            <div style={{ display: 'flex', flexDirection: 'column', gap: 9, marginBottom: 14 }}>
              {cart.map(item => (
                <div key={item.id} style={{ background: '#FFF7ED', border: '1px solid #FED7AA', borderRadius: 11, padding: '9px 11px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 7 }}>
                    <p style={{ fontSize: 12, fontWeight: 700, color: '#1A3C6E', flex: 1, paddingRight: 6, lineHeight: 1.3 }}>{item.name}</p>
                    <button onClick={() => removeFromCart(item.id)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#CBD5E1', padding: 0 }}
                      onMouseEnter={e => (e.currentTarget.style.color = '#EF4444')}
                      onMouseLeave={e => (e.currentTarget.style.color = '#CBD5E1')}
                    >
                      <Trash2 style={{ width: 12, height: 12 }} />
                    </button>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 7 }}>
                      <button onClick={() => updateQty(item.id, -1)} style={{ width: 22, height: 22, borderRadius: '50%', border: '1.5px solid #FDBA74', background: '#fff', cursor: 'pointer', fontSize: 13, fontWeight: 700, color: '#F97316', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>−</button>
                      <span style={{ fontSize: 13, fontWeight: 800, color: '#1A3C6E', minWidth: 14, textAlign: 'center' as const }}>{item.quantity}</span>
                      <button onClick={() => updateQty(item.id, 1)} style={{ width: 22, height: 22, borderRadius: '50%', border: '1.5px solid #FDBA74', background: '#fff', cursor: 'pointer', fontSize: 13, fontWeight: 700, color: '#F97316', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>+</button>
                    </div>
                    <span style={{ fontSize: 13, fontWeight: 800, color: '#F97316' }}>₹{item.price * item.quantity}</span>
                  </div>
                </div>
              ))}
            </div>
 
            <div style={{ background: '#F8FAFC', borderRadius: 11, padding: '11px 13px', marginBottom: 12 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 5 }}>
                <span style={{ fontSize: 12, color: '#94A3B8' }}>Subtotal</span>
                <span style={{ fontSize: 12, fontWeight: 600, color: '#475569' }}>₹{subtotal}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 9 }}>
                <span style={{ fontSize: 12, color: '#94A3B8' }}>Service Fee</span>
                <span style={{ fontSize: 12, fontWeight: 600, color: '#475569' }}>₹50</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', paddingTop: 9, borderTop: '1px solid #E2E8F0' }}>
                <span style={{ fontSize: 14, fontWeight: 800, color: '#1A3C6E' }}>Total</span>
                <span style={{ fontSize: 14, fontWeight: 800, color: '#1A3C6E' }}>₹{total}</span>
              </div>
            </div>
 
            <button style={{ width: '100%', background: '#F97316', color: '#fff', border: 'none', borderRadius: 11, padding: '12px 0', fontSize: 14, fontWeight: 800, cursor: 'pointer', boxShadow: '0 4px 14px rgba(249,115,22,0.3)' }}
              onMouseEnter={e => (e.currentTarget.style.background = '#EA580C')}
              onMouseLeave={e => (e.currentTarget.style.background = '#F97316')}
            >
              Proceed to Book →
            </button>
          </div>
        </aside>
      )}
    </div>
  );
}
 