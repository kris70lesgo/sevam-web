'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import {
  HardHat, Wrench, Sparkles, Settings, Zap, ChefHat,
  Scissors, LayoutGrid, Minus, Plus,
} from 'lucide-react';
import Navbar from '@/components/dashboardnavbar';
import type { ServiceCatalogApiResponse } from '@/types/service-catalog';
import { clearCartRaw, readCartRaw, syncCartRawToServer, writeCartRaw } from '@/lib/utils/cart-storage';
import ServicePopup from './components/ServicePopup';

const CATALOG_CACHE_KEY = 'sevam_catalog_cache_v1';

export interface SubService {
  id: string;
  name: string;
  description: string;
  price: number;
  duration: string;
  rating: number;
  reviews: number;
  image: string;
  process?: string[];
  categoryName: string;
}

interface Category {
  id: string;
  slug: string;
  name: string;
  iconKey: string;
  color: string;
  bg: string;
  subcategories: SubService[];
}

interface CartItem extends SubService {
  quantity: number;
}

const ICON_MAP: Record<string, React.ElementType> = {
  HardHat, Wrench, Sparkles, Settings, Zap, ChefHat, Scissors,
};

const mapCatalogToCategories = (data: ServiceCatalogApiResponse): Category[] =>
  (data.categories ?? []).map((category) => ({
    id: category.id,
    slug: category.slug,
    name: category.name,
    iconKey: category.iconKey,
    color: category.color,
    bg: category.bg,
    subcategories: category.services.map((service) => ({
      id: service.id,
      name: service.name,
      description: service.description,
      price: service.price,
      duration: service.duration,
      rating: service.rating,
      reviews: service.reviews,
      image: service.image,
      process: service.process,
      categoryName: category.name,
    })),
  }));

// Blinkit-style Compact Service Card Component
function ServiceCard({
  service,
  quantity,
  onAdd,
  onUpdateQty,
  onOpenPopup,
}: {
  service: SubService;
  quantity: number;
  onAdd: () => void;
  onUpdateQty: (delta: number) => void;
  onOpenPopup: () => void;
}) {
  const isInCart = quantity > 0;

  return (
    <div
      className="group relative flex flex-col bg-white rounded-lg overflow-hidden cursor-pointer"
      onClick={onOpenPopup}
    >
      {/* Image Container - Square aspect ratio like Blinkit */}
      <div className="relative aspect-square bg-gray-50 overflow-hidden">
        <img
          src={service.image}
          alt={service.name}
          loading="lazy"
          decoding="async"
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-200"
        />

      </div>

      {/* Content - Compact spacing */}
      <div className="flex flex-col flex-1 p-2 pt-1.5">
        {/* Title - Max 2 lines with ellipsis */}
        <h3 className="text-[13px] font-medium text-gray-900 leading-tight line-clamp-2 mb-2 min-h-[34px]">
          {service.name}
        </h3>

        {/* Price and CTA in same row */}
        <div className="flex items-center justify-between" onClick={(e) => e.stopPropagation()}>
          {/* Price */}
          <div className="flex flex-col">
            <span className="text-[15px] font-bold text-gray-900">₹{service.price}</span>
            <span className="text-[11px] text-gray-400 line-through">₹{Math.round(service.price * 1.3)}</span>
          </div>

          {/* ADD button or Stepper */}
          {isInCart ? (
            // Blinkit-style stepper - Blue colors
            <div className="flex items-center justify-between h-7 w-20 bg-blue-50 border border-blue-500 rounded-md overflow-hidden">
              <button
                onClick={() => onUpdateQty(-1)}
                className="flex items-center justify-center w-6 h-full text-blue-600 hover:bg-blue-100 transition-colors"
              >
                <Minus size={12} strokeWidth={2.5} />
              </button>
              <span className="flex items-center justify-center w-8 text-[12px] font-semibold text-gray-900">
                {quantity}
              </span>
              <button
                onClick={() => onUpdateQty(1)}
                className="flex items-center justify-center w-6 h-full text-blue-600 hover:bg-blue-100 transition-colors"
              >
                <Plus size={12} strokeWidth={2.5} />
              </button>
            </div>
          ) : (
            // Compact ADD button - Blue colors
            <button
              onClick={onAdd}
              className="h-7 px-3 flex items-center justify-center bg-blue-50 border border-blue-500 rounded-md text-[12px] font-semibold text-blue-700 hover:bg-blue-100 active:bg-blue-200 transition-all"
            >
              ADD
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

export default function ServicesPage() {
  const searchParams = useSearchParams();
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [categories, setCategories] = useState<Category[]>([]);
  const [catalogLoading, setCatalogLoading] = useState(true);
  const [catalogError, setCatalogError] = useState<string | null>(null);

  const [cart, setCart] = useState<CartItem[]>([]);
  const [cartHydrated, setCartHydrated] = useState(false);
  const [popupService, setPopupService] = useState<SubService | null>(null);
  const queryHandledRef = useRef(false);

  // Cart hydration
  useEffect(() => {
    try {
      const raw = readCartRaw();
      if (!raw) return;
      const parsed = JSON.parse(raw) as CartItem[];
      if (!Array.isArray(parsed)) return;
      const safeCart = parsed
        .map((item) => ({
          ...item,
          price: Number(item?.price ?? 0),
          quantity: Number(item?.quantity ?? 0),
        }))
        .filter((item) => Boolean(item?.id) && Boolean(item?.name) && Number.isFinite(item?.price) && Number.isFinite(item?.quantity));
      setCart(safeCart);
    } catch {
      clearCartRaw();
    } finally {
      setCartHydrated(true);
    }
  }, []);

  // Sync cart to storage
  useEffect(() => {
    if (!cartHydrated) return;
    const raw = JSON.stringify(cart);
    writeCartRaw(raw);
    void syncCartRawToServer(raw);
    window.dispatchEvent(new Event('sevam-cart-updated'));
  }, [cart, cartHydrated]);

  // Load catalog with progressive loading strategy
  useEffect(() => {
    let isMounted = true;

    // Try localStorage cache first (instant display)
    try {
      const raw = localStorage.getItem(CATALOG_CACHE_KEY);
      if (raw) {
        const data = JSON.parse(raw) as ServiceCatalogApiResponse;
        const cachedCategories = mapCatalogToCategories(data);
        if (cachedCategories.length > 0) {
          setCategories(cachedCategories);
          setCatalogLoading(false);
        }
      }
    } catch {
      localStorage.removeItem(CATALOG_CACHE_KEY);
    }

    const loadCatalog = async () => {
      try {
        // Use no-store to bypass browser cache and get fresh data
        const response = await fetch('/api/services/catalog', {
          cache: 'no-store',
        });

        if (!response.ok) {
          throw new Error('Catalog request failed');
        }

        const data = (await response.json()) as ServiceCatalogApiResponse;
        if (!isMounted) return;

        // Only update if data changed (prevents unnecessary re-renders)
        const newCategories = mapCatalogToCategories(data);
        setCategories((prev) => {
          // Simple check: if same length, probably same data
          if (prev.length === newCategories.length && prev.length > 0) {
            return prev; // Keep existing to prevent flash
          }
          return newCategories;
        });

        // Update localStorage in background
        localStorage.setItem(CATALOG_CACHE_KEY, JSON.stringify(data));
        setCatalogError(null);
      } catch {
        if (isMounted) {
          // Don't clear categories on error if we have cached data
          setCategories((prev) => {
            if (prev.length === 0) {
              setCatalogError('Unable to load services right now');
            }
            return prev;
          });
        }
      } finally {
        if (isMounted) {
          setCatalogLoading(false);
        }
      }
    };

    loadCatalog();

    return () => { isMounted = false; };
  }, []);

// Handle query params
  useEffect(() => {
    if (queryHandledRef.current || categories.length === 0) return;
    const requestedServiceId = searchParams.get('serviceId');
    const requestedCategory = searchParams.get('category');

    if (!requestedServiceId && !requestedCategory) {
      queryHandledRef.current = true;
      return;
    }

    if (requestedCategory) {
      const exists = categories.some((cat) => cat.slug === requestedCategory);
      if (exists) setSelectedCategory(requestedCategory);
    }

    if (requestedServiceId) {
      for (const category of categories) {
        const matched = category.subcategories.find((s) => s.id === requestedServiceId);
        if (matched) {
          setSelectedCategory(category.slug);
          setPopupService(matched);
          break;
        }
      }
    }
    queryHandledRef.current = true;
  }, [categories, searchParams]);

  const sidebarItems = useMemo(() => [
    { id: 'all', name: 'All', iconKey: 'LayoutGrid', color: '#64748B', bg: '#F8FAFC' },
    ...categories.map((cat) => ({
      id: cat.slug,
      name: cat.name,
      iconKey: cat.iconKey,
      color: cat.color,
      bg: cat.bg,
    })),
  ], [categories]);

  const allServices = useMemo(() => categories.flatMap((cat) => cat.subcategories), [categories]);
  const currentCategory = useMemo(() => categories.find((cat) => cat.slug === selectedCategory), [categories, selectedCategory]);
  const currentServices = selectedCategory === 'all' ? allServices : (currentCategory?.subcategories ?? []);

  const cartQty = (id: string) => cart.find((item) => item.id === id)?.quantity ?? 0;

  const addToCart = (service: SubService) => {
    setCart((prev) => {
      const existing = prev.find((item) => item.id === service.id);
      if (existing) {
        return prev.map((item) =>
          item.id === service.id ? { ...item, quantity: item.quantity + 1 } : item
        );
      }
      return [...prev, { ...service, quantity: 1 }];
    });
  };

  const updateQty = (id: string, delta: number) => {
    setCart((prev) =>
      prev
        .map((item) => (item.id === id ? { ...item, quantity: item.quantity + delta } : item))
        .filter((item) => item.quantity > 0)
    );
  };

return (
    <div className="h-screen bg-gray-50 overflow-hidden scrollbar-hide">
      <Navbar />

      {/* Popup Modal */}
      {popupService && (
        <ServicePopup
          service={popupService}
          quantity={cartQty(popupService.id)}
          onClose={() => setPopupService(null)}
          onAdd={() => addToCart(popupService)}
          onUpdateQty={(delta) => updateQty(popupService.id, delta)}
        />
      )}

      <div className="max-w-[1200px] mx-auto h-[calc(100vh-64px)] flex flex-col overflow-hidden">
        {/* Header - Fixed */}
        <div className="bg-white flex-shrink-0">
          <h1 className="text-lg font-bold text-gray-900 py-3 px-4">
            {selectedCategory === 'all' ? 'All Services' : currentCategory?.name}
          </h1>
        </div>

        <div className="flex flex-1 overflow-hidden">
          {/* Sidebar - Categories - Fixed, no scroll */}
          <aside className="w-20 lg:w-24 bg-white flex-shrink-0 overflow-hidden">
            <nav className="flex flex-col py-2">
              {sidebarItems.map((item) => {
                const Icon = item.iconKey === 'LayoutGrid' ? LayoutGrid : ICON_MAP[item.iconKey] ?? LayoutGrid;
                const active = selectedCategory === item.id;
                return (
                  <button
                    key={item.id}
                    onClick={() => setSelectedCategory(item.id)}
                    className={`flex flex-col items-center gap-1 py-3 px-1 transition-colors ${
                      active ? 'bg-orange-50' : 'hover:bg-gray-50'
                    }`}
                  >
                    <div
                      className={`w-10 h-10 rounded-xl flex items-center justify-center transition-all ${
                        active ? 'bg-orange-500 shadow-sm' : 'bg-gray-100'
                      }`}
                    >
                      <Icon size={18} className={active ? 'text-white' : 'text-gray-600'} />
                    </div>
                    <span className={`text-[10px] font-medium text-center leading-tight px-1 ${active ? 'text-gray-900' : 'text-gray-600'}`}>
                      {item.name}
                    </span>
                  </button>
                );
              })}
            </nav>
          </aside>

          {/* Main Content - Scrollable grid only */}
          <main className="flex-1 px-3 py-2 overflow-y-auto scrollbar-hide">

            {/* Loading / Error States */}
            {catalogLoading ? (
              <div className="text-center py-20 text-gray-500 text-sm">Loading services...</div>
            ) : catalogError ? (
              <div className="text-center py-20">
                <p className="text-base font-semibold text-gray-900 mb-1">{catalogError}</p>
                <p className="text-sm text-gray-500">Please refresh and try again</p>
              </div>
            ) : currentServices.length === 0 ? (
              <div className="text-center py-20">
                <p className="text-base font-semibold text-gray-900 mb-1">No services found</p>
                <p className="text-sm text-gray-500">Try a different search or category</p>
              </div>
            ) : (
              // Blinkit-style dense grid - 4-6 items per row
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-x-2 gap-y-1">
                {currentServices.map((service) => (
                  <ServiceCard
                    key={service.id}
                    service={service}
                    quantity={cartQty(service.id)}
                    onAdd={() => addToCart(service)}
                    onUpdateQty={(delta) => updateQty(service.id, delta)}
                    onOpenPopup={() => setPopupService(service)}
                  />
                ))}
              </div>
            )}
          </main>
        </div>
      </div>
  </div>
  );
}
