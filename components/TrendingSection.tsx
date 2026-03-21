import { useState } from 'react';
import { Plus, ChevronRight } from 'lucide-react';

const categories = [
  { id: 'home', name: "Home", color: "bg-orange-100" },
  { id: 'milkshakes', name: "Milkshakes\nand More", color: "bg-pink-100" },
  { id: 'cold-coffee', name: "Cold\nCoffee", color: "bg-amber-100" },
  { id: 'beauty', name: "Beauty &\nCare", color: "bg-blue-100" },
  { id: 'kitchen', name: "Kitchen", color: "bg-gray-200" }
];

const productsData = {
  'home': [
    {
      id: 1,
      time: "17 MINS",
      title: "Raymond Home Supersoft Microfibr...",
      subtitle: "1 pack",
      discount: "80% OFF",
      price: "₹299",
      originalPrice: "₹1499",
      color: "bg-blue-50"
    },
    {
      id: 2,
      time: "17 MINS",
      title: "DesiDiya Universe Crystal Ball Night...",
      subtitle: "1 Piece",
      discount: "87% OFF",
      price: "₹129",
      originalPrice: "₹999",
      color: "bg-amber-50"
    },
    {
      id: 3,
      time: "17 MINS",
      title: "Raymond HomeSupersoft...",
      subtitle: "1 pack",
      discount: "80% OFF",
      price: "₹299",
      originalPrice: "₹1499",
      color: "bg-blue-100"
    },
    {
      id: 4,
      time: "17 MINS",
      title: "Furnofy Cotton King Fitted Bedsheet wi...",
      subtitle: "1 pack",
      discount: "18% OFF",
      price: "₹1627",
      originalPrice: "₹1999",
      color: "bg-indigo-50"
    },
    {
      id: 5,
      time: "17 MINS",
      title: "DesiDiya Pixel LED String Lights (22m,...",
      subtitle: "1 Piece",
      discount: "93% OFF",
      price: "₹129",
      originalPrice: "₹1999",
      color: "bg-yellow-50"
    },
    {
      id: 6,
      time: "17 MINS",
      title: "DesiDiya 3D Moon Night Lamp (7 Colo...",
      subtitle: "1 Piece",
      discount: "64% OFF",
      price: "₹459",
      originalPrice: "₹1299",
      color: "bg-orange-50"
    }
  ],
  'beauty': [
    {
      id: 11,
      time: "17 MINS",
      title: "CeraVe Blemish Control Gel 2%...",
      subtitle: "40 ml",
      discount: "5% OFF",
      price: "₹807",
      originalPrice: "₹850",
      color: "bg-teal-50"
    },
    {
      id: 12,
      time: "17 MINS",
      title: "Chemist at Play Exfoliating Body...",
      subtitle: "50 ml",
      discount: "16% OFF",
      price: "₹167",
      originalPrice: "₹199",
      color: "bg-orange-50"
    },
    {
      id: 13,
      time: "17 MINS",
      title: "Parachute 100 % Pure Coconut Oil,...",
      subtitle: "600 ml",
      discount: "12% OFF",
      price: "₹387",
      originalPrice: "₹440",
      color: "bg-blue-50"
    },
    {
      id: 14,
      time: "17 MINS",
      title: "Beardo Legend Perfume For Men...",
      subtitle: "20 ml",
      discount: "51% OFF",
      price: "₹169",
      originalPrice: "₹349",
      color: "bg-gray-100"
    },
    {
      id: 15,
      time: "17 MINS",
      title: "Tresemme Hydra Matrix Leave In...",
      subtitle: "50 ml",
      discount: "15% OFF",
      price: "₹195",
      originalPrice: "₹230",
      color: "bg-blue-100"
    },
    {
      id: 16,
      time: "17 MINS",
      title: "CeraVe Resurfacing Retinol Serum with...",
      subtitle: "30 ml",
      discount: "5% OFF",
      price: "₹1425",
      originalPrice: "₹1500",
      color: "bg-teal-50"
    }
  ]
};

export default function TrendingSection() {
  const [activeTab, setActiveTab] = useState('home');

  const currentProducts = productsData[activeTab as keyof typeof productsData] || productsData['home'];
  const activeCategoryName = categories.find(c => c.id === activeTab)?.name.replace('\n', ' ') || 'Home';

  return (
    <div className="w-full bg-white py-8 mt-4">
      <div className="max-w-[1280px] mx-auto px-4 lg:px-12">
        <h2 className="text-[18px] md:text-[20px] font-medium text-gray-800 mb-6">Trending Now on Instamart</h2>
        
        {/* Category Tabs */}
        <div className="flex overflow-x-auto hide-scrollbar gap-6 mb-1 border-b border-gray-100 pb-0">
          {categories.map((cat) => (
            <div 
              key={cat.id}
              className={`flex flex-col items-center cursor-pointer min-w-[72px] relative pb-3 ${activeTab === cat.id ? 'text-[#0052FF]' : 'text-gray-600'}`}
              onClick={() => setActiveTab(cat.id)}
            >
              <div className={`w-[72px] h-[72px] rounded-full ${cat.color} mb-2 flex items-center justify-center`}>
                {/* Placeholder for category icon */}
                <div className="w-10 h-10 bg-black/5 rounded-full"></div>
              </div>
              <span className={`text-[13px] text-center leading-tight whitespace-pre-wrap ${activeTab === cat.id ? 'font-bold' : 'font-medium'}`}>
                {cat.name}
              </span>
              {activeTab === cat.id && (
                <div className="absolute bottom-0 left-0 right-0 h-[3px] bg-[#0052FF] rounded-t-md"></div>
              )}
            </div>
          ))}
        </div>

        {/* Product Carousel */}
        <div className="flex overflow-x-auto hide-scrollbar gap-3 py-6 -mx-4 px-4 lg:mx-0 lg:px-0">
          {currentProducts.map((product) => (
            <div key={product.id} className="w-[140px] md:w-[160px] lg:w-[180px] flex-shrink-0 flex flex-col">
              {/* Image Container */}
              <div className="relative w-full aspect-square rounded-2xl border border-gray-200 mb-3 overflow-hidden flex items-center justify-center bg-white">
                <div className={`w-3/4 h-3/4 rounded-xl ${product.color}`}></div>
                
                {/* Add Button */}
                <button className="absolute top-2 right-2 w-7 h-7 bg-white rounded-lg border border-[#0052FF] flex items-center justify-center shadow-sm text-[#0052FF] hover:bg-blue-50 transition-colors">
                  <Plus size={18} strokeWidth={2.5} />
                </button>
              </div>

              {/* Product Info */}
              <div className="flex flex-col flex-grow">
                <span className="text-[10px] font-bold text-gray-500 mb-1">{product.time}</span>
                <h3 className="text-[13px] font-medium text-gray-800 leading-snug line-clamp-2 mb-1 h-[34px]">
                  {product.title}
                </h3>
                <span className="text-[12px] text-gray-500 mb-2">{product.subtitle}</span>
                
                <div className="mt-auto">
                  {/* Discount & Dashed line */}
                  <div className="flex items-center gap-2 mt-1 mb-2">
                    <span className="text-[11px] font-bold text-[#05a14f] whitespace-nowrap">{product.discount}</span>
                    <div className="flex-grow border-t border-dashed border-gray-300"></div>
                  </div>
                  
                  {/* Price */}
                  <div className="flex items-center gap-1.5 mt-1">
                    <span className="text-[14px] font-bold text-gray-900">{product.price}</span>
                    <span className="text-[12px] text-gray-400 line-through">{product.originalPrice}</span>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* See All Link */}
        <div className="mt-4">
          <a href="#" className="inline-flex items-center text-[18px] font-bold text-[#0052FF] hover:text-blue-700 transition-colors">
            See All {activeCategoryName}
            <div className="ml-2 w-5 h-5 rounded-full bg-[#0052FF] text-white flex items-center justify-center">
              <ChevronRight size={14} strokeWidth={3} />
            </div>
          </a>
        </div>
      </div>
    </div>
  );
}