import { Twitter, Facebook, Instagram, Linkedin, Apple, Play } from 'lucide-react';

export default function Footer() {
  return (
    <footer className="bg-[#f5f5f5] pt-16 pb-8 px-4 lg:px-12 mt-12">
      <div className="max-w-[1280px] mx-auto">
        {/* Logo */}
        <div className="mb-12 flex items-center">
          <div className="bg-black text-white font-bold text-xl p-2 rounded-md mr-3 leading-none">
            UC
          </div>
          <div className="text-2xl font-bold leading-tight">
            Urban<br />Company
          </div>
        </div>

        {/* Links Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10 mb-12">
          {/* Company */}
          <div>
            <h3 className="text-[20px] font-bold text-black mb-6">Company</h3>
            <ul className="space-y-4">
              <li><a href="#" className="text-[15px] text-gray-600 hover:text-black transition-colors">About us</a></li>
              <li><a href="#" className="text-[15px] text-gray-600 hover:text-black transition-colors">Investor Relations</a></li>
              <li><a href="#" className="text-[15px] text-gray-600 hover:text-black transition-colors">Terms & conditions</a></li>
              <li><a href="#" className="text-[15px] text-gray-600 hover:text-black transition-colors">Privacy policy</a></li>
              <li><a href="#" className="text-[15px] text-gray-600 hover:text-black transition-colors">Anti-discrimination policy</a></li>
              <li><a href="#" className="text-[15px] text-gray-600 hover:text-black transition-colors">Careers</a></li>
            </ul>
          </div>

          {/* Categories */}
          <div>
            <div className="mb-6 flex items-center gap-4">
              <h3 className="text-[20px] font-bold text-black">Categories</h3>
              <a href="#" className="text-[20px] text-green-700 hover:text-green-800 transition-colors">see all</a>
            </div>

            <div className="grid grid-cols-2 gap-x-10">
              <ul className="space-y-3">
                <li><a href="#" className="text-[15px] text-gray-600 hover:text-black transition-colors">Vegetables & Fruits</a></li>
                <li><a href="#" className="text-[15px] text-gray-600 hover:text-black transition-colors">Cold Drinks & Juices</a></li>
                <li><a href="#" className="text-[15px] text-gray-600 hover:text-black transition-colors">Bakery & Biscuits</a></li>
                <li><a href="#" className="text-[15px] text-gray-600 hover:text-black transition-colors">Dry Fruits, Masala & Oil</a></li>
                <li><a href="#" className="text-[15px] text-gray-600 hover:text-black transition-colors">Paan Corner</a></li>
                <li><a href="#" className="text-[15px] text-gray-600 hover:text-black transition-colors">Pharma & Wellness</a></li>
                <li><a href="#" className="text-[15px] text-gray-600 hover:text-black transition-colors">Personal Care</a></li>
                <li><a href="#" className="text-[15px] text-gray-600 hover:text-black transition-colors">Magazines</a></li>
                <li><a href="#" className="text-[15px] text-gray-600 hover:text-black transition-colors">Electronics & Electricals</a></li>
                <li><a href="#" className="text-[15px] text-gray-600 hover:text-black transition-colors">Toys & Games</a></li>
                <li><a href="#" className="text-[15px] text-gray-600 hover:text-black transition-colors">Rakhi Gifts</a></li>
              </ul>

              <ul className="space-y-3">
                <li><a href="#" className="text-[15px] text-gray-600 hover:text-black transition-colors">Dairy & Breakfast</a></li>
                <li><a href="#" className="text-[15px] text-gray-600 hover:text-black transition-colors">Instant & Frozen Food</a></li>
                <li><a href="#" className="text-[15px] text-gray-600 hover:text-black transition-colors">Sweet Tooth</a></li>
                <li><a href="#" className="text-[15px] text-gray-600 hover:text-black transition-colors">Sauces & Spreads</a></li>
                <li><a href="#" className="text-[15px] text-gray-600 hover:text-black transition-colors">Organic & Premium</a></li>
                <li><a href="#" className="text-[15px] text-gray-600 hover:text-black transition-colors">Cleaning Essentials</a></li>
                <li><a href="#" className="text-[15px] text-gray-600 hover:text-black transition-colors">Pet Care</a></li>
                <li><a href="#" className="text-[15px] text-gray-600 hover:text-black transition-colors">Kitchen & Dining</a></li>
                <li><a href="#" className="text-[15px] text-gray-600 hover:text-black transition-colors">Stationery Needs</a></li>
                <li><a href="#" className="text-[15px] text-gray-600 hover:text-black transition-colors">Print Store</a></li>
              </ul>
            </div>
          </div>

          {/* Social links */}
          <div>
            <h3 className="text-[20px] font-bold text-black mb-6">Social links</h3>
            
            {/* Social Icons */}
            <div className="flex flex-wrap gap-4 mb-8">
              <a href="#" className="w-10 h-10 rounded-full border border-gray-300 flex items-center justify-center text-black hover:bg-gray-100 transition-colors bg-white">
                <Twitter size={18} fill="currentColor" />
              </a>
              <a href="#" className="w-10 h-10 rounded-full border border-gray-300 flex items-center justify-center text-black hover:bg-gray-100 transition-colors bg-white">
                <Facebook size={18} fill="currentColor" />
              </a>
              <a href="#" className="w-10 h-10 rounded-full border border-gray-300 flex items-center justify-center text-black hover:bg-gray-100 transition-colors bg-white">
                <Instagram size={18} />
              </a>
              <a href="#" className="w-10 h-10 rounded-full border border-gray-300 flex items-center justify-center text-black hover:bg-gray-100 transition-colors bg-white">
                <Linkedin size={18} fill="currentColor" />
              </a>
            </div>

            {/* App Badges */}
            <div className="space-y-4">
              <a href="#" className="inline-flex items-center bg-black text-white rounded-lg px-4 py-2 hover:bg-gray-900 transition-colors w-[140px]">
                <Apple size={24} className="mr-2" fill="currentColor" />
                <div className="flex flex-col">
                  <span className="text-[10px] leading-none mb-1">Download on the</span>
                  <span className="text-[15px] font-semibold leading-none">App Store</span>
                </div>
              </a>
              <br />
              <a href="#" className="inline-flex items-center bg-black text-white rounded-lg px-4 py-2 hover:bg-gray-900 transition-colors w-[140px]">
                <Play size={20} className="mr-2 text-green-400" fill="currentColor" />
                <div className="flex flex-col">
                  <span className="text-[10px] leading-none mb-1">GET IT ON</span>
                  <span className="text-[15px] font-semibold leading-none">Google Play</span>
                </div>
              </a>
            </div>
          </div>
        </div>

        {/* Divider */}
        <div className="h-px bg-gray-200 w-full mb-8"></div>

        {/* Bottom Text */}
        <div className="text-[13px] text-gray-500 space-y-2">
          <p>* As on December 31, 2024</p>
          <p>© Copyright 2026 Urban Company Limited (formerly known as UrbanClap Technologies India Limited and UrbanClap Technologies India India Limited) All rights reserved. | CIN: L74140DL2014PLC274413</p>
        </div>
      </div>
    </footer>
  );
}