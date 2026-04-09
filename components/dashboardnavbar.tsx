"use client";

import { useEffect, useRef, useState } from 'react';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { Search, ShoppingCart, ChevronDown, X, Minus, Plus } from 'lucide-react';
import { supabase } from '@/lib/db/supabase';
import { readCartRaw, syncCartRawToServer, writeCartRaw } from '@/lib/utils/cart-storage';

type LocationResult = {
  name: string;
  lat: number;
  lng: number;
};

const LOCATION_STORAGE_KEY = "sevam_selected_location";
const PROFILE_STORAGE_KEY = "sevam_profile";
const CHECKOUT_ADDRESS_STORAGE_KEY = 'sevam_checkout_address';
const DEFAULT_NAV_LOCATION_LINE = "Shivam Market, 2nd Floor, 1 Ner...";

type CartStorageItem = {
  id: string;
  name: string;
  categoryName?: string;
  duration?: string;
  image?: string;
  price: number;
  quantity: number;
};

type NavbarUser = {
  name: string;
  email: string;
  phone: string;
  avatarUrl?: string;
};

type CheckoutAddress = {
  id: string;
  label: string;
  line: string;
  eta: string;
};

function cleanPhone(phone?: string) {
  const value = (phone ?? "").trim();
  return value.startsWith("oauth_") ? "" : value;
}

async function syncProfileToBackend(profile: NavbarUser, accessToken?: string) {
  if (!accessToken) return profile;

  try {
    const response = await fetch("/api/auth/sync-profile", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${accessToken}`,
      },
      body: JSON.stringify(profile),
    });

    if (!response.ok) return profile;
    const data = (await response.json()) as { profile?: NavbarUser };
    return data.profile ?? profile;
  } catch {
    return profile;
  }
}

export default function Navbar() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [isLocationModalOpen, setIsLocationModalOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<LocationResult[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [isDetecting, setIsDetecting] = useState(false);
  const [locationError, setLocationError] = useState<string | null>(null);
  const [selectedLocation, setSelectedLocation] = useState<LocationResult | null>(null);
  const [menuOpen, setMenuOpen] = useState(false);
  const [authUser, setAuthUser] = useState<NavbarUser | null>(null);
  const [navSearch, setNavSearch] = useState('');
  const [cartSummary, setCartSummary] = useState({ itemCount: 0, total: 0 });
  const [cartItems, setCartItems] = useState<CartStorageItem[]>([]);
  const [isCartDrawerOpen, setIsCartDrawerOpen] = useState(false);
  const [isAddressSelectModalOpen, setIsAddressSelectModalOpen] = useState(false);
  const [checkoutAddresses, setCheckoutAddresses] = useState<CheckoutAddress[]>([]);
  const [selectedCheckoutAddressId, setSelectedCheckoutAddressId] = useState('');
  const [selectedCheckoutAddress, setSelectedCheckoutAddress] = useState<CheckoutAddress | null>(null);
  const [checkoutAddressLoading, setCheckoutAddressLoading] = useState(false);
  const [checkoutAddressError, setCheckoutAddressError] = useState<string | null>(null);
  const accountMenuRef = useRef<HTMLDivElement>(null);

  const calculateCartSummary = (items: CartStorageItem[]) => {
    const itemCount = items.reduce((sum, item) => sum + item.quantity, 0);
    const subtotal = items.reduce((sum, item) => sum + item.price * item.quantity, 0);
    const total = subtotal + (itemCount > 0 ? 50 : 0);
    return { itemCount, subtotal, total };
  };

  const persistCartItems = (items: CartStorageItem[]) => {
    const raw = JSON.stringify(items);
    writeCartRaw(raw);
    void syncCartRawToServer(raw);
    window.dispatchEvent(new Event('sevam-cart-updated'));
    setCartItems(items);
    const { itemCount, total } = calculateCartSummary(items);
    setCartSummary({ itemCount, total });
  };

  const persistCheckoutAddress = (address: CheckoutAddress) => {
    setSelectedCheckoutAddress(address);
    setSelectedCheckoutAddressId(address.id);
    localStorage.setItem(CHECKOUT_ADDRESS_STORAGE_KEY, JSON.stringify(address));
  };

  const refreshCartSummary = () => {
    try {
      const raw = readCartRaw();
      if (!raw) {
        setCartSummary({ itemCount: 0, total: 0 });
        return;
      }

      const parsed = JSON.parse(raw) as CartStorageItem[];
      if (!Array.isArray(parsed)) {
        setCartItems([]);
        setCartSummary({ itemCount: 0, total: 0 });
        return;
      }

      const safeItems = parsed.filter((item) =>
        Boolean(item?.id) &&
        Boolean(item?.name) &&
        Number.isFinite(item?.price) &&
        Number.isFinite(item?.quantity) &&
        item.quantity > 0
      );

      const { itemCount, total } = calculateCartSummary(safeItems);
      setCartItems(safeItems);
      setCartSummary({ itemCount, total });
    } catch {
      setCartItems([]);
      setCartSummary({ itemCount: 0, total: 0 });
    }
  };

  const handleUpdateCartQty = (itemId: string, delta: number) => {
    const next = cartItems
      .map((item) => (item.id === itemId ? { ...item, quantity: item.quantity + delta } : item))
      .filter((item) => item.quantity > 0);
    persistCartItems(next);
  };

  const handleCartButtonClick = () => {
    if (cartSummary.itemCount > 0) {
      setIsCartDrawerOpen(true);
      return;
    }
    router.push('/customer/services');
  };

  const loadCheckoutAddresses = async () => {
    setCheckoutAddressLoading(true);
    setCheckoutAddressError(null);

    const options: CheckoutAddress[] = [];

    if (selectedLocation) {
      options.push({
        id: 'nav-location',
        label: 'Current Location',
        line: selectedLocation.name,
        eta: 'Quick arrival',
      });
    } else if (locationLine.trim()) {
      options.push({
        id: 'nav-location-fallback',
        label: 'Current Location',
        line: locationLine,
        eta: 'From navbar',
      });
    }

    try {
      const { data } = await supabase.auth.getSession();
      const accessToken = data.session?.access_token;

      if (accessToken) {
        const response = await fetch('/api/customer/addresses', {
          method: 'GET',
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
          cache: 'no-store',
        });

        if (response.ok) {
          const payload = (await response.json()) as {
            addresses?: Array<{
              id: string;
              label: 'HOME' | 'OFFICE' | 'OTHER';
              line1: string;
              line2?: string | null;
              landmark?: string | null;
              city: string;
              pincode: string;
              isDefault: boolean;
            }>;
          };

          const mapped = (payload.addresses ?? []).map((addr) => {
            const line2 = addr.line2?.trim() ? `, ${addr.line2.trim()}` : '';
            const landmark = addr.landmark?.trim() ? `, ${addr.landmark.trim()}` : '';
            return {
              id: addr.id,
              label: addr.label === 'HOME' ? 'Home' : addr.label === 'OFFICE' ? 'Office' : 'Other',
              line: `${addr.line1}${line2}${landmark}, ${addr.city} - ${addr.pincode}`,
              eta: addr.isDefault ? 'Default address' : 'Saved address',
            };
          });
          options.push(...mapped);
        }
      }

      setCheckoutAddresses(options);
      if (selectedCheckoutAddressId && options.some((item) => item.id === selectedCheckoutAddressId)) {
        return;
      }
      if (options.length > 0) {
        setSelectedCheckoutAddressId(options[0].id);
      }
    } catch {
      if (options.length === 0) {
        setCheckoutAddressError('Unable to load saved addresses.');
      }
      setCheckoutAddresses(options);
    } finally {
      setCheckoutAddressLoading(false);
    }
  };

  const openAddressSelector = async () => {
    setIsAddressSelectModalOpen(true);
    await loadCheckoutAddresses();
  };

  const handleProceedToPayment = () => {
    const chosen = checkoutAddresses.find((item) => item.id === selectedCheckoutAddressId);
    if (!chosen) {
      setCheckoutAddressError('Select an address to continue.');
      return;
    }

    persistCheckoutAddress(chosen);
    setIsAddressSelectModalOpen(false);
    setIsCartDrawerOpen(false);
    router.push('/customer/payment');
  };

  useEffect(() => {
    try {
      const raw = localStorage.getItem(LOCATION_STORAGE_KEY);
      if (!raw) return;
      const parsed = JSON.parse(raw) as LocationResult;
      if (parsed?.name && Number.isFinite(parsed.lat) && Number.isFinite(parsed.lng)) {
        setSelectedLocation(parsed);
      }
    } catch {
      localStorage.removeItem(LOCATION_STORAGE_KEY);
    }
  }, []);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(CHECKOUT_ADDRESS_STORAGE_KEY);
      if (!raw) return;
      const parsed = JSON.parse(raw) as CheckoutAddress;
      if (!parsed?.id || !parsed?.line) return;
      setSelectedCheckoutAddress(parsed);
      setSelectedCheckoutAddressId(parsed.id);
    } catch {
      localStorage.removeItem(CHECKOUT_ADDRESS_STORAGE_KEY);
    }
  }, []);

  useEffect(() => {
    if (!menuOpen) return;

    const handleClickOutside = (event: MouseEvent) => {
      if (!accountMenuRef.current) return;
      if (!accountMenuRef.current.contains(event.target as Node)) {
        setMenuOpen(false);
      }
    };

    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setMenuOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('keydown', handleEscape);

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleEscape);
    };
  }, [menuOpen]);

  useEffect(() => {
    refreshCartSummary();

    const handleStorage = (event: StorageEvent) => {
      if (event.key && event.key !== CART_STORAGE_KEY) return;
      refreshCartSummary();
    };

    const handleCartUpdated = () => {
      refreshCartSummary();
    };

    window.addEventListener('storage', handleStorage);
    window.addEventListener('sevam-cart-updated', handleCartUpdated);

    return () => {
      window.removeEventListener('storage', handleStorage);
      window.removeEventListener('sevam-cart-updated', handleCartUpdated);
    };
  }, []);

  useEffect(() => {
    if (cartSummary.itemCount === 0) {
      setIsCartDrawerOpen(false);
    }
  }, [cartSummary.itemCount]);

  useEffect(() => {
    if (pathname !== '/customer/search') {
      setNavSearch('');
      return;
    }

    const query = searchParams.get('q') ?? '';
    setNavSearch(query);
  }, [pathname, searchParams]);

  useEffect(() => {
    let mounted = true;

    const syncSession = async () => {
      const { data } = await supabase.auth.getSession();
      const user = data.session?.user;

      if (!mounted) return;

      if (!user) {
        setAuthUser(null);
        return;
      }

      const fallbackProfile: NavbarUser = {
        name: (user.user_metadata?.full_name as string | undefined) ?? "Customer",
        email: user.email ?? "",
        phone: cleanPhone(user.phone ?? ""),
        avatarUrl:
          (user.user_metadata?.avatar_url as string | undefined) ||
          (user.user_metadata?.picture as string | undefined) ||
          "",
      };
      const syncedProfile = await syncProfileToBackend(fallbackProfile, data.session?.access_token);
      setAuthUser(syncedProfile);
      localStorage.setItem(PROFILE_STORAGE_KEY, JSON.stringify(syncedProfile));
    };

    syncSession();

    const { data: listener } = supabase.auth.onAuthStateChange((_event, session) => {
      const user = session?.user;
      if (!user) {
        setAuthUser(null);
        return;
      }

      const fallbackProfile: NavbarUser = {
        name: (user.user_metadata?.full_name as string | undefined) ?? "Customer",
        email: user.email ?? "",
        phone: cleanPhone(user.phone ?? ""),
        avatarUrl:
          (user.user_metadata?.avatar_url as string | undefined) ||
          (user.user_metadata?.picture as string | undefined) ||
          "",
      };
      void (async () => {
        const syncedProfile = await syncProfileToBackend(fallbackProfile, session?.access_token);
        setAuthUser(syncedProfile);
        localStorage.setItem(PROFILE_STORAGE_KEY, JSON.stringify(syncedProfile));
      })();
    });

    return () => {
      mounted = false;
      listener.subscription.unsubscribe();
    };
  }, []);

  useEffect(() => {
    if (!isLocationModalOpen) return;

    const query = searchQuery.trim();
    if (query.length < 3) {
      setSearchResults([]);
      setLocationError(null);
      return;
    }

    let isCancelled = false;
    const timeout = setTimeout(async () => {
      try {
        setIsSearching(true);
        setLocationError(null);

        const response = await fetch(`/api/location/search?q=${encodeURIComponent(query)}`);
        const data = (await response.json()) as LocationResult[] | { error?: string };

        if (isCancelled) return;

        if (!response.ok || !Array.isArray(data)) {
          setSearchResults([]);
          setLocationError("Could not fetch locations. Please try again.");
          return;
        }

        setSearchResults(data);
      } catch {
        if (!isCancelled) {
          setSearchResults([]);
          setLocationError("Could not fetch locations. Please try again.");
        }
      } finally {
        if (!isCancelled) setIsSearching(false);
      }
    }, 300);

    return () => {
      isCancelled = true;
      clearTimeout(timeout);
    };
  }, [isLocationModalOpen, searchQuery]);

  const persistSelectedLocation = (place: LocationResult) => {
    setSelectedLocation(place);
    localStorage.setItem(LOCATION_STORAGE_KEY, JSON.stringify(place));
  };

  const handleSelectLocation = (place: LocationResult) => {
    persistSelectedLocation(place);
    setSearchQuery("");
    setSearchResults([]);
    setLocationError(null);
    setIsLocationModalOpen(false);
  };

  const handleDetectLocation = async () => {
    if (!navigator.geolocation) {
      setLocationError("Geolocation is not supported on this device.");
      return;
    }

    setIsDetecting(true);
    setLocationError(null);

    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        try {
          const lat = pos.coords.latitude;
          const lng = pos.coords.longitude;

          const response = await fetch(`/api/location/reverse?lat=${lat}&lng=${lng}`);
          const data = (await response.json()) as LocationResult | { error?: string };

          if (!response.ok || !("name" in data)) {
            setLocationError("Could not detect location. Please try search.");
            return;
          }

          persistSelectedLocation(data as LocationResult);
          setSearchQuery("");
          setSearchResults([]);
          setIsLocationModalOpen(false);
        } catch {
          setLocationError("Could not detect location. Please try search.");
        } finally {
          setIsDetecting(false);
        }
      },
      () => {
        setIsDetecting(false);
        setLocationError("Location permission denied. Please search manually.");
      },
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 60000 }
    );
  };

  const locationLine = selectedLocation?.name ?? DEFAULT_NAV_LOCATION_LINE;

  const handleNavbarSearchChange = (value: string) => {
    setNavSearch(value);
    const query = value.trim();

    if (!query) {
      if (pathname === '/customer/search') {
        router.replace('/customer/search');
      }
      return;
    }

    const target = `/customer/search?q=${encodeURIComponent(query)}`;
    if (pathname === '/customer/search') {
      router.replace(target);
    } else {
      router.push(target);
    }
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    localStorage.removeItem(PROFILE_STORAGE_KEY);
    setAuthUser(null);
    setMenuOpen(false);
    router.push('/customer/login');
  };

  return (
    <>
      <nav
        className="sticky top-0 flex flex-wrap lg:flex-nowrap items-center gap-3 lg:gap-0 h-auto lg:h-[86px] px-3 py-3 lg:py-0 lg:px-12 bg-white border-b border-[#e5e7eb] w-full shadow-none z-40"
        style={{ borderBottomColor: '#e5e7eb' }}
      >
        {/* Left Section */}
        <div className="flex items-center h-full min-w-0 w-full lg:w-auto lg:flex-none">
          {/* Logo */}
          <div
            className="pr-3 lg:pr-8 border-r border-[#e5e7eb] h-full flex items-center shrink-0"
            style={{ borderRightColor: '#e5e7eb' }}
          >
            <Link href="/customer/dashboard" aria-label="Go to home">
              <Image
                src="/logo.png"
                alt="Sevam"
                width={130}
                height={42}
                className="w-[98px] lg:w-[130px] h-auto cursor-pointer"
                priority
              />
            </Link>
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
              <span className="truncate max-w-[170px] sm:max-w-[220px]">{locationLine}</span>
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
              value={navSearch}
              onChange={(e) => handleNavbarSearchChange(e.target.value)}
              className="bg-transparent outline-none w-full text-[14px] text-gray-800 placeholder-gray-500"
            />
          </div>
        </div>

        {/* Right Section */}
        <div className="hidden sm:flex items-center ml-auto space-x-4 lg:space-x-8 shrink-0 relative">
          {authUser ? (
            <div className="relative" ref={accountMenuRef}>
              <button
                onClick={() => setMenuOpen((current) => !current)}
                className="flex items-center gap-1 text-[16px] lg:text-[18px] text-gray-800 hover:text-gray-600 font-medium"
                aria-label="Open user menu"
              >
                Account
                <ChevronDown className="w-4 h-4" />
              </button>

              {menuOpen && (
                <div className="absolute right-0 top-[42px] w-[300px] bg-white rounded-2xl shadow-[0_10px_30px_rgba(15,23,42,0.12)] z-50 overflow-hidden">
                  <div className="px-4 py-3">
                    <div className="flex items-center gap-3">
                      <div className="relative h-11 w-11 rounded-full overflow-hidden border border-[#E5E7EB] bg-[#F3F4F6] shrink-0 flex items-center justify-center">
                        {authUser.avatarUrl ? (
                          <Image src={authUser.avatarUrl} alt={authUser.name || 'User'} fill className="object-cover" />
                        ) : (
                          <span className="text-[16px] font-bold text-[#374151]">
                            {(authUser.name?.charAt(0) || 'U').toUpperCase()}
                          </span>
                        )}
                        <span className="absolute right-0.5 bottom-0.5 h-2.5 w-2.5 rounded-full bg-[#22C55E] border border-white" />
                      </div>
                      <div className="min-w-0">
                        <p className="text-[30px] leading-none font-semibold text-gray-900 truncate">{authUser.name || 'Account'}</p>
                        <p className="text-[12px] text-gray-500 mt-0.5 truncate">{cleanPhone(authUser.phone) || authUser.email || 'No contact added'}</p>
                      </div>
                    </div>
                  </div>

                  <div className="py-2">
                    <Link
                      href="/customer/profile"
                      onClick={() => setMenuOpen(false)}
                      className="block mx-2 px-3 py-2 rounded-lg text-[15px] text-[#374151] hover:bg-[#EEF4FF] hover:text-[#1D4ED8]"
                    >
                      My Profile
                    </Link>
                    <Link
                      href="/customer/bookings"
                      onClick={() => setMenuOpen(false)}
                      className="block mx-2 px-3 py-2 rounded-lg text-[15px] text-[#374151] hover:bg-[#EEF4FF] hover:text-[#1D4ED8]"
                    >
                      My Orders
                    </Link>
                    <Link
                      href="/customer/profile"
                      onClick={() => setMenuOpen(false)}
                      className="block mx-2 px-3 py-2 rounded-lg text-[15px] text-[#374151] hover:bg-[#EEF4FF] hover:text-[#1D4ED8]"
                    >
                      Saved Addresses
                    </Link>
                    <div className="my-2" />
                    <button
                      onClick={handleLogout}
                      className="w-[calc(100%-16px)] mx-2 text-left px-3 py-2 rounded-lg text-[15px] text-[#374151] hover:bg-[#F9FAFB]"
                    >
                      Log Out
                    </button>
                  </div>
                </div>
              )}
            </div>
          ) : (
            <Link href="/customer/login" className="text-[16px] lg:text-[18px] text-gray-800 hover:text-gray-600 font-normal">
              Login
            </Link>
          )}
          <button
            onClick={handleCartButtonClick}
            className="flex items-center h-[56px] min-w-[122px] bg-[#007FFF] hover:bg-[#0066CC] transition-colors text-white pl-3 pr-2 rounded-lg font-bold"
          >
            <ShoppingCart className="w-5 h-5 mr-2" />
            {cartSummary.itemCount > 0 ? (
              <div className="leading-none text-left">
                <p className="text-[13px] font-bold">{cartSummary.itemCount} items</p>
                <p className="text-[18px] font-extrabold tracking-tight">₹{Math.round(cartSummary.total)}</p>
              </div>
            ) : (
              <span className="text-[14px] font-bold">My Cart</span>
            )}
          </button>
        </div>
      </nav>

      {isCartDrawerOpen && (
        <>
          <div className="fixed inset-0 bg-black/35 z-50" onClick={() => setIsCartDrawerOpen(false)} />
          <aside className="fixed top-0 right-0 h-full w-[420px] max-w-[95vw] bg-[#F8FAFC] z-[60] shadow-[-18px_0_40px_rgba(15,23,42,0.16)] flex flex-col">
            <div className="px-5 py-4 bg-white flex items-center justify-between shadow-[0_1px_0_rgba(226,232,240,0.8)]">
              <div>
                <p className="text-[18px] font-bold text-[#0F172A] leading-tight">Your Cart</p>
                <p className="text-[12px] text-[#64748B] mt-0.5">{cartSummary.itemCount} service item{cartSummary.itemCount > 1 ? 's' : ''}</p>
              </div>
              <button
                onClick={() => setIsCartDrawerOpen(false)}
                className="w-8 h-8 rounded-lg bg-[#F1F5F9] text-[#334155] hover:bg-[#E2E8F0] flex items-center justify-center"
                aria-label="Close cart"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="px-5 py-4 bg-[#FFF7ED] shadow-[0_1px_0_rgba(254,215,170,0.7)]">
              <p className="text-[13px] text-[#9A3412] font-semibold">Sevam Promise</p>
              <p className="text-[12px] text-[#C2410C] mt-1">Verified professionals, transparent pricing, and doorstep support.</p>
            </div>

            <div className="flex-1 overflow-y-auto p-4 space-y-3">
              {cartItems.map((item) => (
                <div key={item.id} className="rounded-xl bg-white p-3 shadow-[0_1px_8px_rgba(15,23,42,0.06)]">
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <p className="text-[14px] font-semibold text-[#0F172A] truncate">{item.name}</p>
                      <p className="text-[12px] text-[#64748B] mt-0.5">{item.categoryName ?? 'Service'}{item.duration ? ` • ${item.duration}` : ''}</p>
                    </div>
                    <p className="text-[14px] font-bold text-[#0F172A]">₹{Math.round(item.price * item.quantity)}</p>
                  </div>

                  <div className="flex items-center justify-between mt-3">
                    <p className="text-[12px] text-[#64748B]">₹{Math.round(item.price)} each</p>
                    <div className="inline-flex items-center rounded-lg bg-[#FFF7ED] shadow-[inset_0_0_0_1px_rgba(251,191,36,0.35)]">
                      <button
                        onClick={() => handleUpdateCartQty(item.id, -1)}
                        className="w-8 h-8 inline-flex items-center justify-center text-[#C2410C] hover:bg-[#FFEDD5]"
                        aria-label={`Decrease quantity for ${item.name}`}
                      >
                        <Minus className="w-4 h-4" />
                      </button>
                      <span className="w-8 text-center text-[13px] font-bold text-[#9A3412]">{item.quantity}</span>
                      <button
                        onClick={() => handleUpdateCartQty(item.id, 1)}
                        className="w-8 h-8 inline-flex items-center justify-center text-[#C2410C] hover:bg-[#FFEDD5]"
                        aria-label={`Increase quantity for ${item.name}`}
                      >
                        <Plus className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <div className="bg-white p-4 space-y-3 shadow-[0_-1px_0_rgba(226,232,240,0.8)]">
              <div className="rounded-xl p-3 bg-[#F8FAFC]">
                <div className="flex items-center justify-between text-[13px] text-[#475569]">
                  <span>Subtotal</span>
                  <span>₹{Math.round(calculateCartSummary(cartItems).subtotal)}</span>
                </div>
                <div className="flex items-center justify-between text-[13px] text-[#475569] mt-2">
                  <span>Platform fee</span>
                  <span>₹50</span>
                </div>
                <div className="flex items-center justify-between mt-3 pt-3 border-t border-[#E5EAF1]">
                  <span className="text-[14px] font-semibold text-[#0F172A]">Total</span>
                  <span className="text-[18px] font-bold text-[#0F172A]">₹{Math.round(cartSummary.total)}</span>
                </div>
              </div>

              <div className="rounded-xl bg-[#F8FAFC] p-3">
                <p className="text-[12px] text-[#64748B]">Delivery Address</p>
                <p className="text-[13px] font-semibold text-[#0F172A] mt-1 truncate">{selectedCheckoutAddress?.line ?? selectedLocation?.name ?? 'Choose where we should deliver'}</p>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <button
                  onClick={() => router.push('/customer/profile')}
                  className="h-11 rounded-xl bg-[#EEF2FF] hover:bg-[#E0E7FF] text-[#1D4ED8] font-semibold text-[13px] transition-colors"
                >
                  Add Address
                </button>
                <button
                  onClick={openAddressSelector}
                  className="h-11 rounded-xl bg-[#FC8019] hover:bg-[#EA580C] text-white font-bold text-[13px] transition-colors"
                >
                  Select Address
                </button>
              </div>
            </div>
          </aside>
        </>
      )}

      {isAddressSelectModalOpen && (
        <div className="fixed inset-0 bg-black/45 z-[70]" onClick={() => setIsAddressSelectModalOpen(false)}>
          <div className="absolute left-1/2 top-1/2 w-[min(560px,92vw)] -translate-x-1/2 -translate-y-1/2 rounded-2xl bg-white shadow-[0_24px_64px_rgba(15,23,42,0.25)]" onClick={(event) => event.stopPropagation()}>
            <div className="px-5 py-4 border-b border-[#E2E8F0] flex items-center justify-between">
              <div>
                <p className="text-[18px] font-bold text-[#0F172A]">Choose Delivery Address</p>
                <p className="text-[12px] text-[#64748B] mt-0.5">Select one address to continue payment</p>
              </div>
              <button
                onClick={() => setIsAddressSelectModalOpen(false)}
                className="w-8 h-8 rounded-lg bg-[#F1F5F9] text-[#334155] hover:bg-[#E2E8F0] flex items-center justify-center"
                aria-label="Close address selector"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-4 max-h-[52vh] overflow-y-auto space-y-2">
              {checkoutAddressLoading && <p className="text-[13px] text-[#64748B]">Loading addresses...</p>}
              {!checkoutAddressLoading && checkoutAddresses.length === 0 && (
                <p className="text-[13px] text-[#64748B]">No addresses found. Please add one from profile.</p>
              )}
              {!checkoutAddressLoading && checkoutAddresses.map((address) => {
                const isActive = selectedCheckoutAddressId === address.id;
                return (
                  <button
                    key={address.id}
                    onClick={() => setSelectedCheckoutAddressId(address.id)}
                    className={`w-full text-left rounded-xl p-3 border transition-colors ${isActive ? 'border-[#FDBA74] bg-[#FFF7ED]' : 'border-[#E2E8F0] bg-white hover:bg-[#F8FAFC]'}`}
                  >
                    <p className="text-[12px] font-semibold text-[#475569]">{address.label}</p>
                    <p className="text-[14px] font-semibold text-[#0F172A] mt-1">{address.line}</p>
                    <p className="text-[12px] text-[#64748B] mt-1">{address.eta}</p>
                  </button>
                );
              })}
              {checkoutAddressError && <p className="text-[12px] text-[#DC2626]">{checkoutAddressError}</p>}
            </div>

            <div className="px-4 py-3 border-t border-[#E2E8F0] grid grid-cols-2 gap-2">
              <button
                onClick={() => setIsAddressSelectModalOpen(false)}
                className="h-11 rounded-xl bg-[#F1F5F9] hover:bg-[#E2E8F0] text-[#334155] font-semibold text-[13px]"
              >
                Cancel
              </button>
              <button
                onClick={handleProceedToPayment}
                className="h-11 rounded-xl bg-[#FC8019] hover:bg-[#EA580C] text-white font-bold text-[13px]"
              >
                Continue to Payment
              </button>
            </div>
          </div>
        </div>
      )}

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
              <button
                onClick={handleDetectLocation}
                disabled={isDetecting}
                className="bg-[#007FFF] hover:bg-[#0066CC] disabled:bg-[#93C5FD] transition-colors text-white px-5 py-3.5 rounded-lg font-medium text-[14px] whitespace-nowrap"
              >
                {isDetecting ? "Detecting..." : "Detect my location"}
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
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full border border-gray-300 rounded-lg px-4 py-3.5 text-[14px] outline-none focus:border-gray-400 text-gray-700"
                />
              </div>
            </div>

            {locationError && (
              <p className="text-[13px] text-red-500 mt-3">{locationError}</p>
            )}

            {isSearching && (
              <p className="text-[13px] text-gray-500 mt-3">Searching locations...</p>
            )}

            {!isSearching && searchResults.length > 0 && (
              <div className="mt-3 border border-gray-200 rounded-lg overflow-hidden max-h-[240px] overflow-y-auto">
                {searchResults.map((place, index) => (
                  <button
                    key={`${place.name}-${place.lat}-${place.lng}`}
                    onClick={() => handleSelectLocation(place)}
                    className={`w-full text-left px-4 py-3 text-[13px] text-gray-700 hover:bg-gray-50 transition-colors ${index !== searchResults.length - 1 ? "border-b border-gray-100" : ""}`}
                  >
                    {place.name}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </>
  );
}