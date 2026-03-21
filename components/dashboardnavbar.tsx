"use client";

import { useState } from 'react';
import Link from 'next/link';
import { Search, ShoppingCart, ChevronDown, X } from 'lucide-react';

export default function Navbar() {
  const [isLocationModalOpen, setIsLocationModalOpen] = useState(false);

  return (
    <>
      <nav
        className="flex flex-wrap lg:flex-nowrap items-center gap-3 lg:gap-0 h-auto lg:h-[86px] px-3 py-3 lg:py-0 lg:px-12 bg-white border-b border-[#e5e7eb] w-full shadow-none relative z-40"
        style={{ borderBottomColor: '#e5e7eb' }}
      >
        {/* Left Section */}
        <div className="flex items-center h-full min-w-0 w-full lg:w-auto lg:flex-none">
          {/* Logo */}
          <div
            className="pr-3 lg:pr-8 border-r border-[#e5e7eb] h-full flex items-center shrink-0"
            style={{ borderRightColor: '#e5e7eb' }}
          >
            <div className="text-[26px] lg:text-[36px] font-black tracking-tighter" style={{ fontFamily: 'Arial, sans-serif' }}>
              <span className="text-[#E65100]">Se</span>
              <span className="text-[#007FFF]">VAM</span>
            </div>
          </div>
          
          {/* Location */}
          <div 
            className="pl-3 lg:pl-8 flex flex-col cursor-pointer group min-w-0"
            onClick={() => setIsLocationModalOpen(true)}
          >
            <div className="text-[15px] lg:text-[18px] font-extrabold text-black leading-tight group-hover:text-gray-700 transition-colors">
              Delivery in 24 minutes
            </div>
            <div className="flex items-center text-[12px] lg:text-[13px] text-gray-600 mt-0.5 group-hover:text-gray-500 transition-colors min-w-0">
              <span className="truncate max-w-[170px] sm:max-w-[220px]">Shivam Market, 2nd Floor, 1 Ner...</span>
              <ChevronDown className="w-4 h-4 ml-1 text-black group-hover:text-gray-700" />
            </div>
          </div>
        </div>

        {/* Middle Section - Search */}
        <div className="w-full lg:w-auto lg:flex-grow lg:max-w-[760px] lg:ml-12 lg:mr-8 min-w-0 order-3 lg:order-none">
          <div
            className="flex items-center bg-[#f8f8f8] rounded-xl px-4 py-3.5 border border-[#e5e7eb]"
            style={{ borderColor: '#e5e7eb' }}
          >
            <Search className="w-5 h-5 text-gray-500 mr-3" />
            <input 
              type="text" 
              placeholder='Search "paneer"' 
              className="bg-transparent outline-none w-full text-[14px] text-gray-800 placeholder-gray-500"
            />
          </div>
        </div>

        {/* Right Section */}
        <div className="hidden sm:flex items-center ml-auto space-x-4 lg:space-x-8 shrink-0">
          <Link href="/customer/login" className="text-[16px] lg:text-[18px] text-gray-800 hover:text-gray-600 font-normal">
            Login
          </Link>
          <button className="flex items-center bg-[#007FFF] hover:bg-[#0066CC] transition-colors text-white px-4 py-3.5 rounded-lg font-bold text-[14px]">
            <ShoppingCart className="w-5 h-5 mr-2" />
            My Cart
          </button>
        </div>
      </nav>

      {/* Location Modal */}
      {isLocationModalOpen && (
        <div className="fixed inset-0 bg-black/60 z-50" onClick={() => setIsLocationModalOpen(false)}>
          <div 
            className="absolute top-[86px] left-[5%] lg:left-[210px] bg-white rounded-xl w-[90%] max-w-[700px] p-4 lg:p-6 shadow-xl"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-[20px] font-medium text-gray-800">Change Location</h2>
              <button 
                onClick={() => setIsLocationModalOpen(false)} 
                className="text-gray-500 hover:text-gray-800 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            
            {/* Body */}
            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-3 mb-2">
              <button className="bg-[#007FFF] hover:bg-[#0066CC] transition-colors text-white px-5 py-3.5 rounded-lg font-medium text-[14px] whitespace-nowrap">
                Detect my location
              </button>
              
              <div className="hidden lg:flex items-center px-3">
                <div className="h-[1px] w-5 bg-gray-300"></div>
                <span className="text-[12px] text-gray-400 border border-gray-300 rounded-full w-9 h-9 flex items-center justify-center bg-white">OR</span>
                <div className="h-[1px] w-5 bg-gray-300"></div>
              </div>
              
              <div className="flex-grow">
                <input 
                  type="text" 
                  placeholder="search delivery location" 
                  className="w-full border border-gray-300 rounded-lg px-4 py-3.5 text-[14px] outline-none focus:border-gray-400 text-gray-700"
                />
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}