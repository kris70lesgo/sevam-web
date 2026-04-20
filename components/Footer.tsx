"use client";

import { useEffect, useMemo, useState } from 'react';
import Image from 'next/image';
import { Twitter, Facebook, Instagram, Linkedin } from 'lucide-react';
import type { ServiceCatalogApiResponse } from '@/types/service-catalog';

const FALLBACK_CATEGORIES = [
  'Labour',
  'Plumbing',
  'Cleaning',
  'Repairing',
  'Electrician',
  'Chef / Cooking',
  'Grooming',
];

export default function Footer() {
  const [catalogCategories, setCatalogCategories] = useState<string[]>([]);

  useEffect(() => {
    let isMounted = true;

    const loadCategories = async () => {
      try {
        const response = await fetch('/api/services/catalog', { cache: 'force-cache' });
        if (!response.ok) {
          throw new Error('Catalog request failed');
        }

        const data = (await response.json()) as ServiceCatalogApiResponse;
        if (!isMounted) return;

        const names = (data.categories ?? []).map((category) => category.name).filter(Boolean);
        if (names.length > 0) {
          setCatalogCategories(names);
        }
      } catch (err) {
        console.warn('[Footer] Failed to load catalog categories, using fallback list:', err);
        // Keep fallback categories in case catalog is temporarily unavailable.
      }
    };

    void loadCategories();

    return () => {
      isMounted = false;
    };
  }, []);

  const categoryColumns = useMemo(() => {
    const source = catalogCategories.length > 0 ? catalogCategories : FALLBACK_CATEGORIES;
    const midpoint = Math.ceil(source.length / 2);
    return [source.slice(0, midpoint), source.slice(midpoint)];
  }, [catalogCategories]);

  // App store URLs - update these with your actual app URLs
  const iOSUrl = 'https://apps.apple.com/app/sevam';
  const androidUrl = 'https://play.google.com/store/apps/details?id=com.sevam';

  return (
    <footer className="bg-[#f5f5f5] pt-16 pb-8 px-4 lg:px-12 mt-12">
      <div className="max-w-[1280px] mx-auto">
        {/* Logo */}
        <div className="mb-12 flex items-center">
          <Image
            src="/logo2.png"
            alt="Sevam"
            width={160}
            height={52}
            className="w-[120px] md:w-[160px] h-auto"
          />
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
            </div>

            <div className="grid grid-cols-2 gap-x-10">
              <ul className="space-y-3">
                {categoryColumns[0].map((category) => (
                  <li key={category}>
                    <span className="text-[15px] text-gray-600">{category}</span>
                  </li>
                ))}
              </ul>

              <ul className="space-y-3">
                {categoryColumns[1].map((category) => (
                  <li key={category}>
                    <span className="text-[15px] text-gray-600">{category}</span>
                  </li>
                ))}
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

            {/* App Store Buttons */}
            <div className="flex flex-col gap-3">
              {/* App Store Button */}
              <a
                href={iOSUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center bg-black text-white rounded-lg px-3 py-2 hover:bg-gray-900 transition-colors"
                style={{ width: '140px', height: '42px' }}
              >
                <svg className="w-6 h-6 mr-2" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.81-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M13 3.5c.73-.83 1.21-1.97 1.08-3.11-1.05.05-2.31.71-3.06 1.63-.67.81-1.26 2.11-1.1 3.24 1.16.09 2.36-.73 3.08-1.76z"/>
                </svg>
                <div className="flex flex-col">
                  <span className="text-[9px] leading-none">Download on the</span>
                  <span className="text-[15px] font-semibold leading-none">App Store</span>
                </div>
              </a>
              {/* Google Play Button */}
              <a
                href={androidUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center bg-black text-white rounded-lg px-3 py-2 hover:bg-gray-900 transition-colors"
                style={{ width: '140px', height: '42px' }}
              >
                <svg className="w-6 h-6 mr-2" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M3,20.5V3.5C3,2.91 3.34,2.39 3.84,2.15L13.69 12 3.84 21.85C3.34 21.6 3 21.09 3 20.5M16.81 15.12L6.05 21.34L14.54 12.85L16.81 15.12M20.16 10.81C20.5 11.08 20.75 11.5 20.75 12C20.75 12.5 20.5 12.92 20.16 13.19L17.89 14.5L15.39 12L17.89 9.5L20.16 10.81M6.05 2.66L16.81 8.88L14.54 11.15L6.05 2.66Z"/>
                </svg>
                <div className="flex flex-col">
                  <span className="text-[9px] leading-none">GET IT ON</span>
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
