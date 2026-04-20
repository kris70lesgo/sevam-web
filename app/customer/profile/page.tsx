'use client';

import {
  User, MapPin, CreditCard, Shield, LogOut, Edit,
  Share2, HelpCircle, Home, Briefcase, MapPinned,
  Plus, Trash2, Eye, EyeOff, Lock, Smartphone,
  Check, X, Heart, Package, Settings
} from 'lucide-react';
import { useEffect, useState } from 'react';
import Navbar from '@/components/dashboardnavbar';
import { supabase } from '@/lib/db/supabase';

const PROFILE_STORAGE_KEY = 'sevam_profile';
const LOCATION_STORAGE_KEY = 'sevam_selected_location';

type AddressLabel = 'HOME' | 'OFFICE' | 'OTHER';

type AddressCard = {
  id: string;
  type: string;
  label: AddressLabel;
  address: string;
  city: string;
  isDefault: boolean;
};

type AddressesApiResponse = {
  addresses: Array<{
    id: string;
    label: AddressLabel;
    line1: string;
    line2: string | null;
    landmark: string | null;
    city: string;
    state: string;
    pincode: string;
    isDefault: boolean;
  }>;
};

type AddressApiItem = AddressesApiResponse['addresses'][number];

type OrdersApiResponse = {
  orders: Array<{
    id: string;
    type: string;
    description: string;
    createdAt: string;
    completedAt: string | null;
    providerName: string;
    totalPaid: string;
  }>;
};

type PastOrderCard = {
  id: string;
  service: string;
  provider: string;
  item: string;
  deliveredAt: string;
  bookedAt: string;
  totalPaid: string;
};

type LocationResult = {
  name: string;
  lat: number;
  lng: number;
};

function cleanPhone(phone?: string) {
  const value = (phone ?? '').trim();
  return value.startsWith('oauth_') ? '' : value;
}

function formatOrderDate(value: string) {
  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) return value;
  return parsed.toLocaleString('en-US', {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    hour12: true,
  });
}

function mapJobTypeToLabel(type: string) {
  const labels: Record<string, string> = {
    PLUMBING: 'Plumbing Service',
    ELECTRICAL: 'Electrical Service',
    PAINTING: 'Painting Service',
    CARPENTRY: 'Carpentry Service',
    CLEANING: 'Home Cleaning',
    AC_REPAIR: 'AC Repair',
    APPLIANCE_REPAIR: 'Appliance Repair',
    OTHER: 'Home Service',
  };

  return labels[type] ?? 'Home Service';
}

export default function ProfilePage() {
  const [activeTab, setActiveTab] = useState('personal-info');
  const [showPassword, setShowPassword] = useState(false);
  const [twoFactor, setTwoFactor] = useState(true);
  const [isEditDrawerOpen, setIsEditDrawerOpen] = useState(false);
  const [profileOverride, setProfileOverride] = useState<{ name?: string; email?: string; phone?: string } | null>(null);
  const [newPhone, setNewPhone] = useState('');
  const [phoneOtp, setPhoneOtp] = useState('');
  const [phoneOtpSent, setPhoneOtpSent] = useState(false);
  const [newEmail, setNewEmail] = useState('');
  const [editName, setEditName] = useState('');
  const [editEmail, setEditEmail] = useState('');
  const [editPhone, setEditPhone] = useState('');
  const [contactMsg, setContactMsg] = useState('');
  const [contactErr, setContactErr] = useState('');
  const [contactLoading, setContactLoading] = useState(false);
  const [addresses, setAddresses] = useState<AddressCard[]>([]);
  const [addressesLoading, setAddressesLoading] = useState(false);
  const [addressesMsg, setAddressesMsg] = useState('');
  const [addressesErr, setAddressesErr] = useState('');
  const [isAddAddressModalOpen, setIsAddAddressModalOpen] = useState(false);
  const [isEditAddressModalOpen, setIsEditAddressModalOpen] = useState(false);
  const [editingAddress, setEditingAddress] = useState<AddressCard | null>(null);
  const [editLabel, setEditLabel] = useState<AddressLabel>('HOME');
  const [editLine1, setEditLine1] = useState('');
  const [editLine2, setEditLine2] = useState('');
  const [editCity, setEditCity] = useState('');
  const [editState, setEditState] = useState('');
  const [editPincode, setEditPincode] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<LocationResult[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [isDetecting, setIsDetecting] = useState(false);
  const [locationError, setLocationError] = useState<string | null>(null);
  const [selectedLocation, setSelectedLocation] = useState<LocationResult | null>(null);
  const [pastOrders, setPastOrders] = useState<PastOrderCard[]>([]);
  const [ordersLoading, setOrdersLoading] = useState(false);

  const user = {
    name: profileOverride?.name || 'Customer',
    email: profileOverride?.email || '',
    phone: profileOverride?.phone || '',
    dob: '14 August 1995',
    gender: 'Male',
    verified: true,
    memberSince: 'Jan 2024',
    initials: (profileOverride?.name?.charAt(0) || 'C').toUpperCase(),
  };

  const mapAddressToCard = (addr: AddressApiItem): AddressCard => {
    const line2 = addr.line2?.trim() ? `, ${addr.line2.trim()}` : '';
    const landmark = addr.landmark?.trim() ? `, ${addr.landmark.trim()}` : '';

    return {
      id: addr.id,
      type: addr.label === 'HOME' ? 'Home' : addr.label === 'OFFICE' ? 'Office' : 'Other',
      label: addr.label,
      address: `${addr.line1}${line2}${landmark}`,
      city: `${addr.city} - ${addr.pincode}`,
      isDefault: addr.isDefault,
    };
  };

  const getAccessToken = async () => {
    const { data } = await supabase.auth.getSession();
    return data.session?.access_token ?? '';
  };

  const refreshAddresses = async (token: string) => {
    const response = await fetch('/api/customer/addresses', {
      method: 'GET',
      headers: {
        Authorization: `Bearer ${token}`,
      },
      cache: 'no-store',
    });

    if (!response.ok) {
      throw new Error('Failed to load addresses');
    }

    const payload = (await response.json()) as AddressesApiResponse;
    const mapped = (payload.addresses ?? []).map(mapAddressToCard);
    setAddresses(mapped);
  };

  const persistSelectedLocation = (place: LocationResult) => {
    setSelectedLocation(place);
    localStorage.setItem(LOCATION_STORAGE_KEY, JSON.stringify(place));
  };

  const parseLocationToAddressPayload = (place: LocationResult) => {
    const parts = place.name
      .split(',')
      .map((part) => part.trim())
      .filter(Boolean);
    const pincodeMatch = place.name.match(/\b\d{6}\b/);

    const line1 = parts[0] ?? place.name;
    const city = (parts.length >= 3 ? parts[parts.length - 3] : parts[1] ?? 'Unknown City').replace(/\b\d{6}\b/g, '').trim() || 'Unknown City';
    const state = (parts.length >= 2 ? parts[parts.length - 2] : 'Unknown State').replace(/\b\d{6}\b/g, '').trim() || 'Unknown State';
    const pincode = pincodeMatch?.[0] ?? '000000';

    return {
      line1,
      city,
      state,
      pincode,
      lat: place.lat,
      lng: place.lng,
    };
  };

  useEffect(() => {
    try {
      const raw = localStorage.getItem(PROFILE_STORAGE_KEY);
      if (!raw) return;

      const parsed = JSON.parse(raw) as { name?: string; email?: string; phone?: string };
      if (parsed && (parsed.name || parsed.email || parsed.phone)) {
        setProfileOverride({
          name: parsed.name,
          email: parsed.email,
          phone: cleanPhone(parsed.phone),
        });
      }
    } catch (err) {
      console.error('[Profile] Failed to parse cached profile, clearing local entry:', err);
      localStorage.removeItem(PROFILE_STORAGE_KEY);
    }
  }, []);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(LOCATION_STORAGE_KEY);
      if (!raw) return;

      const parsed = JSON.parse(raw) as LocationResult;
      if (parsed?.name && Number.isFinite(parsed.lat) && Number.isFinite(parsed.lng)) {
        setSelectedLocation(parsed);
      }
    } catch (err) {
      console.error('[Profile] Failed to parse cached location, clearing local entry:', err);
      localStorage.removeItem(LOCATION_STORAGE_KEY);
    }
  }, []);

  useEffect(() => {
    let isMounted = true;

    const loadProfileAndAddresses = async () => {
      try {
        setAddressesLoading(true);
        setOrdersLoading(true);
        const { data } = await supabase.auth.getSession();
        const accessToken = data.session?.access_token;

        if (!accessToken) {
          if (isMounted) {
            setAddressesLoading(false);
            setOrdersLoading(false);
          }
          return;
        }

        const [profileResponse, addressesResponse, ordersResponse] = await Promise.all([
          fetch('/api/customer/profile', {
            method: 'GET',
            headers: {
              Authorization: `Bearer ${accessToken}`,
            },
            cache: 'no-store',
          }),
          fetch('/api/customer/addresses', {
            method: 'GET',
            headers: {
              Authorization: `Bearer ${accessToken}`,
            },
            cache: 'no-store',
          }),
          fetch('/api/customer/orders', {
            method: 'GET',
            headers: {
              Authorization: `Bearer ${accessToken}`,
            },
            cache: 'no-store',
          }),
        ]);

        if (isMounted && profileResponse.ok) {
          const profileData = (await profileResponse.json()) as {
            user?: { name?: string; phone?: string };
            profile?: { email?: string };
          };

          if (profileData.user || profileData.profile) {
            persistProfile({
              name: profileData.user?.name,
              email: profileData.profile?.email,
              phone: cleanPhone(profileData.user?.phone),
            });
          }
        }

        if (isMounted && addressesResponse.ok) {
          const addressesData = (await addressesResponse.json()) as AddressesApiResponse;
          const mappedAddresses: AddressCard[] = (addressesData.addresses ?? []).map(mapAddressToCard);
          setAddresses(mappedAddresses);
        }

        if (isMounted) {
          if (ordersResponse.ok) {
            const ordersData = (await ordersResponse.json()) as OrdersApiResponse;
            const mappedOrders: PastOrderCard[] = (ordersData.orders ?? []).map((order) => ({
              id: order.id,
              service: mapJobTypeToLabel(order.type),
              provider: order.providerName,
              item: order.description,
              deliveredAt: order.completedAt
                ? `Delivered on ${formatOrderDate(order.completedAt)}`
                : 'Completed',
              bookedAt: formatOrderDate(order.createdAt),
              totalPaid: order.totalPaid,
            }));
            setPastOrders(mappedOrders);
          } else {
            setPastOrders([]);
          }
        }
      } catch {
        // Keep fallback data to avoid blocking profile screen on transient failures.
        if (isMounted) {
          setPastOrders([]);
        }
      } finally {
        if (isMounted) {
          setAddressesLoading(false);
          setOrdersLoading(false);
        }
      }
    };

    void loadProfileAndAddresses();

    return () => {
      isMounted = false;
    };
  }, []);

  useEffect(() => {
    if (!isAddAddressModalOpen) return;

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
          setLocationError('Could not fetch locations. Please try again.');
          return;
        }

        setSearchResults(data);
      } catch {
        if (!isCancelled) {
          setSearchResults([]);
          setLocationError('Could not fetch locations. Please try again.');
        }
      } finally {
        if (!isCancelled) setIsSearching(false);
      }
    }, 300);

    return () => {
      isCancelled = true;
      clearTimeout(timeout);
    };
  }, [isAddAddressModalOpen, searchQuery]);

  const normalizePhone = (value: string) => {
    const trimmed = value.replace(/\s+/g, '').trim();
    if (!trimmed) return '';
    if (trimmed.startsWith('+')) return trimmed;
    return `+91${trimmed.replace(/^0+/, '')}`;
  };

  const handleSetDefaultAddress = async (addressId: string) => {
    try {
      setAddressesErr('');
      setAddressesMsg('');

      const accessToken = await getAccessToken();
      if (!accessToken) {
        setAddressesErr('Please login again to update addresses.');
        return;
      }

      const response = await fetch(`/api/customer/addresses/${addressId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${accessToken}`,
        },
        body: JSON.stringify({ isDefault: true }),
      });

      if (!response.ok) {
        setAddressesErr('Unable to set default address.');
        return;
      }

      await refreshAddresses(accessToken);
      setAddressesMsg('Default address updated.');
    } catch {
      setAddressesErr('Unable to set default address.');
    }
  };

  const handleDeleteAddress = async (addressId: string) => {
    try {
      setAddressesErr('');
      setAddressesMsg('');

      const accessToken = await getAccessToken();
      if (!accessToken) {
        setAddressesErr('Please login again to update addresses.');
        return;
      }

      const response = await fetch(`/api/customer/addresses/${addressId}`, {
        method: 'DELETE',
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      });

      if (!response.ok) {
        setAddressesErr('Unable to delete address.');
        return;
      }

      await refreshAddresses(accessToken);
      setAddressesMsg('Address deleted.');
    } catch {
      setAddressesErr('Unable to delete address.');
    }
  };

  const handleQuickAddAddress = () => {
    setAddressesErr('');
    setAddressesMsg('');
    setLocationError(null);
    setSearchQuery('');
    setSearchResults([]);
    setIsAddAddressModalOpen(true);
  };

  const handleSelectLocation = (place: LocationResult) => {
    persistSelectedLocation(place);
    setLocationError(null);
    setSearchQuery(place.name);
    setSearchResults([]);
  };

  const handleDetectLocation = async () => {
    if (!navigator.geolocation) {
      setLocationError('Geolocation is not supported on this device.');
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
            setLocationError('Could not detect location. Please try search.');
            return;
          }

          persistSelectedLocation(data as LocationResult);
          setSearchQuery('');
          setSearchResults([]);
        } catch {
          setLocationError('Could not detect location. Please try search.');
        } finally {
          setIsDetecting(false);
        }
      },
      () => {
        setIsDetecting(false);
        setLocationError('Location permission denied. Please search manually.');
      },
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 60000 }
    );
  };

  const handleEditAddress = (addr: AddressCard) => {
    setEditingAddress(addr);
    setEditLabel(addr.label);
    const parts = addr.address.split(',');
    setEditLine1(parts[0]?.trim() || '');
    setEditLine2(parts.slice(1).join(',').trim() || '');
    const cityParts = addr.city.split('-');
    setEditCity(cityParts[0]?.trim() || '');
    setEditPincode(cityParts[1]?.trim() || '');
    setEditState(''); // State not shown in card, will need to be fetched
    setIsEditAddressModalOpen(true);
  };

  const handleUpdateAddress = async () => {
    try {
      setAddressesErr('');
      setAddressesMsg('');

      if (!editingAddress) return;

      const accessToken = await getAccessToken();
      if (!accessToken) {
        setAddressesErr('Please login again to update addresses.');
        return;
      }

      const response = await fetch('/api/customer/addresses', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${accessToken}`,
        },
        body: JSON.stringify({
          id: editingAddress.id,
          label: editLabel,
          line1: editLine1,
          line2: editLine2 || undefined,
          city: editCity,
          state: editState,
          pincode: editPincode,
        }),
      });

      if (!response.ok) {
        setAddressesErr('Unable to update address.');
        return;
      }

      await refreshAddresses(accessToken);
      setAddressesMsg('Address updated successfully.');
      setIsEditAddressModalOpen(false);
      setEditingAddress(null);
    } catch {
      setAddressesErr('Unable to update address.');
    }
  };

  const handleSaveLocationAsAddress = async () => {
    try {
      setAddressesErr('');
      setAddressesMsg('');

      if (!selectedLocation) {
        setAddressesErr('Please select a location first.');
        return;
      }

      const accessToken = await getAccessToken();
      if (!accessToken) {
        setAddressesErr('Please login again to add addresses.');
        return;
      }

      const parsed = parseLocationToAddressPayload(selectedLocation);
      const response = await fetch('/api/customer/addresses', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${accessToken}`,
        },
        body: JSON.stringify({
          label: 'OTHER',
          line1: parsed.line1,
          city: parsed.city,
          state: parsed.state,
          pincode: parsed.pincode,
          lat: parsed.lat,
          lng: parsed.lng,
          isDefault: addresses.length === 0,
        }),
      });

      if (!response.ok) {
        setAddressesErr('Unable to save selected location as address.');
        return;
      }

      await refreshAddresses(accessToken);
      setAddressesMsg('Address added from selected location.');
      setIsAddAddressModalOpen(false);
      setSearchQuery('');
      setSearchResults([]);
    } catch {
      setAddressesErr('Unable to save selected location as address.');
    }
  };

  const persistProfile = (next: { name?: string; email?: string; phone?: string }) => {
    const merged = {
      name: next.name ?? user.name,
      email: next.email ?? user.email,
      phone: next.phone ?? user.phone,
    };
    setProfileOverride(merged);
    localStorage.setItem(PROFILE_STORAGE_KEY, JSON.stringify(merged));
  };

  const handleSendPhoneOtp = async () => {
    try {
      setContactErr('');
      setContactMsg('');
      setContactLoading(true);
      const normalized = normalizePhone(newPhone);
      if (!normalized) {
        setContactErr('Please enter a valid phone number.');
        return;
      }

      const { error } = await supabase.auth.updateUser({ phone: normalized });
      if (error) {
        setContactErr(error.message || 'Failed to send OTP.');
        return;
      }

      setNewPhone(normalized);
      setPhoneOtpSent(true);
      setContactMsg('OTP sent to your phone. Enter OTP to verify.');
    } catch {
      setContactErr('Failed to send OTP.');
    } finally {
      setContactLoading(false);
    }
  };

  const handleVerifyPhoneOtp = async () => {
    try {
      setContactErr('');
      setContactMsg('');
      setContactLoading(true);

      if (!phoneOtp.trim()) {
        setContactErr('Please enter OTP.');
        return;
      }

      const { error } = await supabase.auth.verifyOtp({
        phone: newPhone,
        token: phoneOtp.trim(),
        type: 'phone_change',
      });

      if (error) {
        setContactErr(error.message || 'Phone verification failed.');
        return;
      }

      persistProfile({ phone: newPhone });
      setPhoneOtpSent(false);
      setPhoneOtp('');
      setContactMsg('Phone number verified successfully.');
    } catch {
      setContactErr('Phone verification failed.');
    } finally {
      setContactLoading(false);
    }
  };

  const handleSendEmailVerification = async () => {
    try {
      setContactErr('');
      setContactMsg('');
      setContactLoading(true);

      if (!newEmail.trim()) {
        setContactErr('Please enter email address.');
        return;
      }

      const { error } = await supabase.auth.updateUser({ email: newEmail.trim() });
      if (error) {
        setContactErr(error.message || 'Failed to send verification email.');
        return;
      }

      setContactMsg('Verification email sent. Please check your inbox to confirm.');
      persistProfile({ email: newEmail.trim() });
    } catch {
      setContactErr('Failed to send verification email.');
    } finally {
      setContactLoading(false);
    }
  };

  const openEditDrawer = () => {
    setEditName(user.name);
    setEditEmail(user.email);
    setEditPhone(user.phone);
    setNewEmail(user.email);
    setNewPhone(user.phone);
    setPhoneOtp('');
    setPhoneOtpSent(false);
    setContactMsg('');
    setContactErr('');
    setIsEditDrawerOpen(true);
  };

  const handleSaveBasicProfile = () => {
    const trimmedName = editName.trim();
    if (!trimmedName) {
      setContactErr('Name cannot be empty.');
      setContactMsg('');
      return;
    }
    persistProfile({ name: trimmedName });
    setContactErr('');
    setContactMsg('Profile details updated.');
    setIsEditDrawerOpen(false);
  };

  const menuItems = [
    { id: 'personal-info', label: 'Orders', icon: Package },
    { id: 'payment-methods', label: 'Payments', icon: CreditCard },
    { id: 'saved-addresses', label: 'Addresses', icon: MapPin },
    { id: 'security', label: 'Settings', icon: Settings },
  ];

  const S = {
    sectionHeader: { padding: '22px 24px', borderBottom: '1px solid #E5E7EB', display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', background: '#FFFFFF' } as React.CSSProperties,
    sectionIcon: { width: 36, height: 36, borderRadius: 8, background: '#FFF1E8', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 } as React.CSSProperties,
    label: { fontSize: 11, fontWeight: 700, color: '#94A3B8', textTransform: 'uppercase' as const, letterSpacing: '0.08em', marginBottom: 6, display: 'block' },
    value: { fontSize: 15, fontWeight: 500, color: '#0F172A' },
    btnPrimary: { display: 'flex', alignItems: 'center', gap: 6, padding: '9px 16px', background: '#FC8019', color: '#fff', border: 'none', borderRadius: 2, fontSize: 13, fontWeight: 700, cursor: 'pointer' } as React.CSSProperties,
    btnOutline: { display: 'flex', alignItems: 'center', gap: 6, padding: '9px 16px', background: '#fff', color: '#FC8019', border: '1px solid #FC8019', borderRadius: 2, fontSize: 13, fontWeight: 700, cursor: 'pointer' } as React.CSSProperties,
    input: { width: '100%', padding: '11px 12px', border: '1px solid #D1D5DB', borderRadius: 2, fontSize: 14, color: '#0F172A', outline: 'none', boxSizing: 'border-box' as const },
  };

  return (
    <div style={{ minHeight: '100vh', background: '#3D7996' }}>
      <Navbar />
      <div style={{ maxWidth: 1160, margin: '0 auto', padding: '28px 20px 56px' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 30 }}>
          <div>
            <p style={{ fontSize: 26, fontWeight: 700, color: '#FFFFFF', lineHeight: 1.1, marginBottom: 4 }}>{user.name}</p>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12, color: 'rgba(255,255,255,0.86)', fontSize: 14 }}>
              <span>{user.phone || '+91 xxxxxxxxxx'}</span>
              <span style={{ opacity: 0.5 }}>·</span>
              <span style={{ fontSize: 14 }}>{user.email || 'no-email@sevam.com'}</span>
            </div>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
            <button style={{ display: 'flex', alignItems: 'center', gap: 6, background: 'none', border: 'none', cursor: 'pointer', fontSize: 18, fontWeight: 600, color: 'rgba(255,255,255,0.85)' }}>
              <LogOut style={{ width: 18, height: 18 }} /> Sign Out
            </button>
            <button
              onClick={openEditDrawer}
              style={{ padding: '11px 20px', border: '1px solid rgba(255,255,255,0.75)', background: 'transparent', color: '#fff', fontSize: 16, fontWeight: 700, cursor: 'pointer' }}
            >
              EDIT PROFILE
            </button>
          </div>
        </div>

        <div style={{ background: '#F4F5F7', padding: 40 }}>
          <div style={{ display: 'flex', gap: 0, alignItems: 'stretch' }}>
            <div style={{ width: 240, background: '#E7EBF0', padding: '18px 0', flexShrink: 0 }}>
              <div style={{ display: 'flex', flexDirection: 'column' }}>
                {menuItems.map((item) => {
                  const Icon = item.icon;
                  const active = activeTab === item.id;

                  return (
                    <button
                      key={item.id}
                      onClick={() => setActiveTab(item.id)}
                      style={{ display: 'flex', alignItems: 'center', gap: 12, width: '100%', border: 'none', borderLeft: active ? '3px solid #FC8019' : '3px solid transparent', background: active ? '#FFFFFF' : 'transparent', color: '#2F3542', fontSize: 15, fontWeight: active ? 700 : 500, cursor: 'pointer', padding: '14px 20px' }}
                    >
                      <Icon style={{ width: 18, height: 18, color: active ? '#111827' : '#4B5563' }} />
                      <span>{item.label}</span>
                    </button>
                  );
                })}
                <div style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '14px 20px', color: '#4B5563' }}>
                  <HelpCircle style={{ width: 18, height: 18 }} />
                  <span style={{ fontSize: 15, fontWeight: 500 }}>Swiggy One</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '14px 20px', color: '#4B5563' }}>
                  <Heart style={{ width: 18, height: 18 }} />
                  <span style={{ fontSize: 15, fontWeight: 500 }}>Favourites</span>
                </div>
              </div>
            </div>

            <div style={{ flex: 1, background: '#fff', border: '1px solid #D8DDE3', minHeight: 620 }}>

            {/* ── ORDERS ── */}
            {activeTab === 'personal-info' && (
              <>
                <div style={S.sectionHeader}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
                    <div style={S.sectionIcon}><Package style={{ width: 20, height: 20, color: '#F97316' }} /></div>
                    <div>
                      <p style={{ fontSize: 24, fontWeight: 700, color: '#1F2937', marginBottom: 2 }}>Past Orders</p>
                      <p style={{ fontSize: 13, color: '#6B7280' }}>Review previous bookings and repeat services quickly</p>
                    </div>
                  </div>
                  <button style={S.btnOutline}>VIEW ALL</button>
                </div>

                <div style={{ padding: '22px 24px 26px', display: 'flex', flexDirection: 'column', gap: 16 }}>
                  {ordersLoading && (
                    <p style={{ fontSize: 13, color: '#6B7280' }}>Loading past orders...</p>
                  )}

                  {!ordersLoading && pastOrders.length === 0 && (
                    <div style={{ border: '1px dashed #D1D5DB', padding: '24px 20px', background: '#fff' }}>
                      <p style={{ fontSize: 18, fontWeight: 700, color: '#1F2937', marginBottom: 6 }}>No past orders</p>
                      <p style={{ fontSize: 13, color: '#6B7280' }}>Once you complete a booking, it will appear here.</p>
                    </div>
                  )}

                  {!ordersLoading && pastOrders.map((order) => (
                    <div key={order.id} style={{ border: '1px solid #E5E7EB', background: '#fff' }}>
                      <div style={{ padding: '16px 18px', display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 14, borderBottom: '1px solid #ECEFF3' }}>
                        <div>
                          <p style={{ fontSize: 18, fontWeight: 700, color: '#1F2937', marginBottom: 3 }}>{order.service}</p>
                          <p style={{ fontSize: 12, color: '#6B7280', marginBottom: 5 }}>{order.provider}</p>
                          <p style={{ fontSize: 11, color: '#9CA3AF' }}>ORDER #{order.id} | {order.bookedAt}</p>
                        </div>
                        <div style={{ textAlign: 'right' }}>
                          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: 8, marginBottom: 5 }}>
                            <span style={{ fontSize: 12, color: '#4B5563' }}>{order.deliveredAt}</span>
                            <Check style={{ width: 16, height: 16, color: '#16A34A' }} />
                          </div>
                          <button style={{ ...S.btnOutline, padding: '7px 12px', fontSize: 12 }}>VIEW DETAILS</button>
                        </div>
                      </div>

                      <div style={{ padding: '14px 18px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12 }}>
                        <p style={{ fontSize: 14, color: '#1F2937' }}>{order.item}</p>
                        <p style={{ fontSize: 15, fontWeight: 700, color: '#1F2937' }}>Total Paid: {order.totalPaid}</p>
                      </div>

                      <div style={{ padding: '0 18px 16px', display: 'flex', gap: 10 }}>
                        <button style={{ ...S.btnPrimary, minWidth: 106, justifyContent: 'center' }}>REORDER</button>
                        <button style={{ ...S.btnOutline, minWidth: 94, justifyContent: 'center' }}>HELP</button>
                      </div>
                    </div>
                  ))}
                </div>

              </>
            )}

            {/* ── SAVED ADDRESSES ── */}
            {activeTab === 'saved-addresses' && (
              <>
                <div style={{ padding: '32px 32px 0 32px', background: '#fff', borderBottom: '1px solid #E5E7EB', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <h2 style={{ fontSize: 26, fontWeight: 700, color: '#111827', margin: 0 }}>Manage Addresses</h2>
                  <button style={{ ...S.btnPrimary, fontSize: 15, padding: '10px 22px', borderRadius: 6 }} onClick={handleQuickAddAddress}><Plus style={{ width: 16, height: 16 }} /> Add Address</button>
                </div>
                <div style={{ padding: '36px 32px', background: '#fff', display: 'flex', gap: 28, flexWrap: 'wrap' }}>
                  {addressesLoading && (
                    <p style={{ fontSize: 15, color: '#94A3B8' }}>Loading saved addresses...</p>
                  )}
                  {addressesMsg && <p style={{ fontSize: 15, color: '#16A34A' }}>{addressesMsg}</p>}
                  {addressesErr && <p style={{ fontSize: 15, color: '#EF4444' }}>{addressesErr}</p>}
                  {!addressesLoading && addresses.length === 0 && (
                    <div style={{ width: '100%', border: '1px dashed #E5E7EB', borderRadius: 10, padding: '24px 18px', background: '#fff' }}>
                      <p style={{ fontSize: 18, fontWeight: 700, color: '#111827', margin: 0 }}>No address</p>
                    </div>
                  )}
                  {addresses.map(addr => {
                    const Icon = addr.label === 'HOME' ? Home : addr.label === 'OFFICE' ? Briefcase : MapPinned;
                    return (
                      <div key={addr.id} style={{ minWidth: 220, maxWidth: 260, flex: 1, border: '1.5px solid #E5E7EB', borderRadius: 8, background: '#fff', boxShadow: '0 1px 4px rgba(16,30,54,0.03)', padding: '16px 12px', display: 'flex', flexDirection: 'column', gap: 7, position: 'relative' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
                          <Icon style={{ width: 16, height: 16, color: '#222', opacity: 0.7 }} />
                          <span style={{ fontSize: 13, fontWeight: 700, color: '#222', marginRight: 6 }}>{addr.type}</span>
                          {addr.isDefault && <span style={{ background: '#F8FAFC', color: '#F97316', border: '1px solid #FED7AA', fontSize: 10, fontWeight: 700, padding: '1.5px 8px', borderRadius: 16, marginLeft: 4 }}>Default</span>}
                        </div>
                        <div style={{ fontSize: 12, color: '#222', marginBottom: 1 }}>{addr.address}</div>
                        <div style={{ fontSize: 11, color: '#6B7280', marginBottom: 6 }}>{addr.city}</div>
<div style={{ display: 'flex', gap: 10, alignItems: 'center', marginTop: 'auto' }}>
                  {!addr.isDefault && (
                    <button style={{ color: '#16A34A', fontWeight: 700, fontSize: 12, background: 'none', border: 'none', cursor: 'pointer', padding: 0 }} onClick={() => handleSetDefaultAddress(addr.id)}>
                    SET AS DEFAULT
                    </button>
                  )}
                  {addr.isDefault && (
                    <span style={{ color: '#9CA3AF', fontWeight: 600, fontSize: 11 }}>DEFAULT</span>
                  )}
                  <button style={{ color: '#FC8019', fontWeight: 700, fontSize: 12, background: 'none', border: 'none', cursor: 'pointer', padding: 0 }} onClick={() => handleEditAddress(addr)}>
                  EDIT
                  </button>
                  <button style={{ color: '#EF4444', fontWeight: 700, fontSize: 12, background: 'none', border: 'none', cursor: 'pointer', padding: 0 }} onClick={() => handleDeleteAddress(addr.id)}>
                  DELETE
                  </button>
                </div>
                      </div>
                    );
                  })}
                </div>
              </>
            )}

            {/* ── PAYMENT METHODS ── */}
            {activeTab === 'payment-methods' && (
              <>
                <div style={S.sectionHeader}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
                    <div style={S.sectionIcon}><CreditCard style={{ width: 20, height: 20, color: '#F97316' }} /></div>
                    <div>
                      <p style={{ fontSize: 22, fontWeight: 700, color: '#111827', marginBottom: 2 }}>Payments</p>
                      <p style={{ fontSize: 12, color: '#6B7280' }}>Manage cards, wallets and Sevam balance</p>
                    </div>
                  </div>
                </div>

                <div style={{ padding: '16px 24px 8px', borderBottom: '1px solid #E5E7EB' }}>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, marginBottom: 10 }}>
                    <div style={{ display: 'flex', flexDirection: 'column' }}>
                      <div style={{ background: 'linear-gradient(135deg, #43B069 0%, #2A9D8F 100%)', borderRadius: 8, padding: '12px 12px', color: '#fff', minHeight: 98 }}>
                        <p style={{ fontSize: 11, fontWeight: 500, opacity: 0.95, marginBottom: 4 }}>Available Balance</p>
                        <p style={{ fontSize: 28, fontWeight: 800, marginBottom: 6 }}>₹0</p>
                        <p style={{ fontSize: 10, lineHeight: 1.35, opacity: 0.9 }}>Sevam money can be used for all your orders across categories.</p>
                      </div>
                      <button style={{ width: '52%', border: 'none', background: '#2FAE67', color: '#fff', fontSize: 15, fontWeight: 700, padding: '9px 0', borderRadius: 8, cursor: 'pointer', marginTop: 10 }}>Add Balance</button>
                    </div>

                    <div style={{ background: '#fff', border: '1px solid #E5E7EB', borderRadius: 8, padding: '10px 10px' }}>
                      <p style={{ fontSize: 13, fontWeight: 700, color: '#111827', marginBottom: 4 }}>Share love through e-gift vouchers!</p>
                      <p style={{ fontSize: 11, color: '#6B7280', lineHeight: 1.35, marginBottom: 8 }}>Celebrate special occasions with your loved ones with e-gift vouchers.</p>
                      <button style={{ border: 'none', background: 'none', color: '#FC8019', fontSize: 11, fontWeight: 700, cursor: 'pointer', padding: 0 }}>Buy a gift voucher</button>
                    </div>
                  </div>

                  <p style={{ fontSize: 11, color: '#6B7280', textAlign: 'left', marginBottom: 8 }}>
                    Have a gift voucher? <button style={{ border: 'none', background: 'none', color: '#2FAE67', fontWeight: 700, cursor: 'pointer', fontSize: 11 }}>Redeem Now</button>
                  </p>
                </div>

                <div style={{ padding: '0 24px 22px' }}>
                  <div style={{ border: '1px solid #E5E7EB' }}>
                    <div style={{ background: '#F3F4F6', borderBottom: '1px solid #E5E7EB', padding: '10px 14px', fontSize: 13, fontWeight: 700, color: '#4B5563' }}>SAVED CARDS</div>
                    <div style={{ padding: '14px 14px', borderBottom: '1px solid #E5E7EB' }}>
                      <button style={{ display: 'flex', alignItems: 'center', gap: 12, border: 'none', background: 'none', cursor: 'pointer', padding: 0 }}>
                        <span style={{ width: 34, height: 24, border: '1.5px solid #FC8019', color: '#FC8019', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', fontSize: 18, fontWeight: 700 }}>+</span>
                        <span style={{ color: '#FC8019', fontSize: 15, fontWeight: 700 }}>ADD NEW CARD</span>
                      </button>
                      <div style={{ marginTop: 12, color: '#9CA3AF', fontSize: 12, fontWeight: 700, display: 'flex', gap: 10, flexWrap: 'wrap' }}>
                        <span>VISA</span>
                        <span>Mastercard</span>
                        <span>AMEX</span>
                        <span>RuPay</span>
                        <span>Zeta</span>
                        <span>Sodexo</span>
                      </div>
                    </div>

                    <div style={{ background: '#F3F4F6', borderBottom: '1px solid #E5E7EB', padding: '10px 14px', fontSize: 13, fontWeight: 700, color: '#4B5563' }}>WALLET</div>

                    {[
                      { name: 'Mobikwik', iconBg: '#00B7A8', iconLabel: 'M' },
                      { name: 'PhonePe', iconBg: '#6D28D9', iconLabel: 'P' },
                      { name: 'Amazon Pay', iconBg: '#1F2937', iconLabel: 'pay' },
                    ].map((wallet) => (
                      <div key={wallet.name} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '12px 14px', borderBottom: '1px solid #E5E7EB' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                          <span style={{ width: 30, height: 30, borderRadius: '50%', background: wallet.iconBg, color: '#fff', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', fontSize: 11, fontWeight: 700 }}>{wallet.iconLabel}</span>
                          <p style={{ fontSize: 14, fontWeight: 600, color: '#111827' }}>{wallet.name}</p>
                        </div>
                        <button style={{ border: 'none', background: 'none', color: '#FC8019', fontSize: 12, fontWeight: 700, cursor: 'pointer' }}>LINK ACCOUNT</button>
                      </div>
                    ))}
                  </div>
                </div>
              </>
            )}

            {/* ── SECURITY ── */}
            {activeTab === 'security' && (
              <>
                <div style={{ ...S.sectionHeader, justifyContent: 'flex-start', gap: 14 }}>
                  <div style={S.sectionIcon}><Shield style={{ width: 20, height: 20, color: '#F97316' }} /></div>
                  <div>
                    <p style={{ fontSize: 17, fontWeight: 700, color: '#0F172A', marginBottom: 2 }}>Security</p>
                    <p style={{ fontSize: 13, color: '#94A3B8' }}>Manage your password and account access</p>
                  </div>
                </div>

                {/* Change password */}
                <div style={{ padding: '24px 24px', borderBottom: '1px solid #F1F5F9' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 22 }}>
                    <div style={{ width: 36, height: 36, borderRadius: 10, background: '#FFF7ED', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      <Lock style={{ width: 16, height: 16, color: '#F97316' }} />
                    </div>
                    <p style={{ fontSize: 15, fontWeight: 700, color: '#0F172A' }}>Change Password</p>
                  </div>

                  <div style={{ maxWidth: 520, display: 'flex', flexDirection: 'column', gap: 16 }}>
                    <div>
                      <span style={S.label}>Current Password</span>
                      <input type="password" defaultValue="••••••••" style={S.input}
                        onFocus={e => (e.target.style.borderColor = '#F97316')}
                        onBlur={e => (e.target.style.borderColor = '#E2E8F0')}
                      />
                    </div>
                    <div>
                      <span style={S.label}>New Password</span>
                      <div style={{ position: 'relative' }}>
                        <input type={showPassword ? 'text' : 'password'} defaultValue="••••••••"
                          style={{ ...S.input, paddingRight: 44 }}
                          onFocus={e => (e.target.style.borderColor = '#F97316')}
                          onBlur={e => (e.target.style.borderColor = '#E2E8F0')}
                        />
                        <button onClick={() => setShowPassword(!showPassword)}
                          style={{ position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: '#94A3B8' }}>
                          {showPassword ? <EyeOff style={{ width: 18, height: 18 }} /> : <Eye style={{ width: 18, height: 18 }} />}
                        </button>
                      </div>
                    </div>
                    <div>
                      <span style={S.label}>Confirm New Password</span>
                      <input type="password" defaultValue="••••••••" style={S.input}
                        onFocus={e => (e.target.style.borderColor = '#F97316')}
                        onBlur={e => (e.target.style.borderColor = '#E2E8F0')}
                      />
                    </div>
                    <button style={{ ...S.btnPrimary, width: 'fit-content', padding: '12px 24px', fontSize: 14 }}
                      onMouseEnter={e => (e.currentTarget.style.background = '#EA580C')}
                      onMouseLeave={e => (e.currentTarget.style.background = '#F97316')}
                    >Update Password</button>
                  </div>
                </div>

                {/* 2FA */}
                <div style={{ padding: '22px 24px', borderBottom: '1px solid #F1F5F9', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <div>
                    <p style={{ fontSize: 15, fontWeight: 700, color: '#0F172A', marginBottom: 4 }}>Two-Factor Authentication</p>
                    <p style={{ fontSize: 13, color: '#94A3B8' }}>Add an extra layer of security to your account via OTP on login</p>
                  </div>
                  <button onClick={() => setTwoFactor(!twoFactor)}
                    style={{ width: 48, height: 26, borderRadius: 13, background: twoFactor ? '#F97316' : '#E2E8F0', border: 'none', cursor: 'pointer', position: 'relative', transition: 'background 0.2s', flexShrink: 0 }}>
                    <span style={{ position: 'absolute', top: 3, left: twoFactor ? 25 : 3, width: 20, height: 20, borderRadius: '50%', background: '#fff', transition: 'left 0.2s', boxShadow: '0 1px 4px rgba(0,0,0,0.15)' }} />
                  </button>
                </div>

                {/* Active sessions */}
                <div style={{ padding: '22px 24px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 16 }}>
                    <div style={{ width: 36, height: 36, borderRadius: 10, background: '#FFF7ED', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      <Smartphone style={{ width: 16, height: 16, color: '#F97316' }} />
                    </div>
                    <p style={{ fontSize: 15, fontWeight: 700, color: '#0F172A' }}>Active Sessions</p>
                  </div>
                  <div style={{ border: '1.5px solid #F1F5F9', borderRadius: 14, padding: '16px 20px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
                      <div style={{ width: 40, height: 40, borderRadius: 10, background: '#DCFCE7', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        <Smartphone style={{ width: 18, height: 18, color: '#16A34A' }} />
                      </div>
                      <div>
                        <p style={{ fontSize: 14, fontWeight: 700, color: '#0F172A', marginBottom: 2 }}>Chrome on MacOS</p>
                        <p style={{ fontSize: 12, color: '#94A3B8' }}>Bengaluru, IN · Active now</p>
                      </div>
                    </div>
                    <span style={{ background: '#DCFCE7', color: '#16A34A', fontSize: 12, fontWeight: 700, padding: '4px 12px', borderRadius: 20 }}>This device</span>
                  </div>
                </div>
              </>
            )}

            </div>
          </div>
        </div>
      </div>

      {isAddAddressModalOpen && (
        <>
          <div
            onClick={() => setIsAddAddressModalOpen(false)}
            style={{ position: 'fixed', inset: 0, background: 'rgba(15, 23, 42, 0.42)', zIndex: 70 }}
          />
          <div
            style={{ position: 'fixed', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', width: 'min(620px, calc(100vw - 32px))', background: '#fff', borderRadius: 14, boxShadow: '0 20px 48px rgba(15,23,42,0.22)', zIndex: 75, overflow: 'hidden' }}
          >
            <div style={{ padding: '16px 18px', borderBottom: '1px solid #E5E7EB', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <div>
                <p style={{ fontSize: 18, fontWeight: 700, color: '#111827', margin: 0 }}>Add Address</p>
                <p style={{ fontSize: 12, color: '#6B7280', margin: '4px 0 0 0' }}>Search on map or use your current location</p>
              </div>
              <button
                onClick={() => setIsAddAddressModalOpen(false)}
                style={{ width: 30, height: 30, borderRadius: 8, border: '1px solid #E2E8F0', background: '#fff', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                aria-label="Close add address modal"
              >
                <X style={{ width: 14, height: 14, color: '#334155' }} />
              </button>
            </div>

            <div style={{ padding: '16px 18px 18px' }}>
              <div style={{ display: 'flex', gap: 10, marginBottom: 12, flexWrap: 'wrap' }}>
                <button
                  onClick={handleDetectLocation}
                  disabled={isDetecting}
                  style={{ ...S.btnOutline, borderRadius: 8, opacity: isDetecting ? 0.6 : 1 }}
                >
                  <MapPin style={{ width: 14, height: 14 }} />
                  {isDetecting ? 'Detecting...' : 'Use Current Location'}
                </button>
              </div>

              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search area, locality, landmark"
                style={{ ...S.input, marginBottom: 10, borderRadius: 8 }}
              />

              {isSearching && <p style={{ fontSize: 12, color: '#6B7280', marginBottom: 8 }}>Searching locations...</p>}
              {locationError && <p style={{ fontSize: 12, color: '#EF4444', marginBottom: 8 }}>{locationError}</p>}

              {searchResults.length > 0 && (
                <div style={{ border: '1px solid #E5E7EB', borderRadius: 8, marginBottom: 12, maxHeight: 230, overflowY: 'auto' }}>
                  {searchResults.map((place, index) => (
                    <button
                      key={`${place.lat}-${place.lng}-${place.name}`}
                      onClick={() => handleSelectLocation(place)}
                      style={{ width: '100%', border: 'none', borderBottom: index === searchResults.length - 1 ? 'none' : '1px solid #F1F5F9', background: '#fff', textAlign: 'left', padding: '10px 12px', cursor: 'pointer', fontSize: 13, color: '#1F2937' }}
                    >
                      {place.name}
                    </button>
                  ))}
                </div>
              )}

              {selectedLocation && (
                <div style={{ border: '1px solid #FED7AA', background: '#FFF7ED', borderRadius: 8, padding: '10px 12px', marginBottom: 12 }}>
                  <p style={{ fontSize: 12, fontWeight: 700, color: '#C2410C', margin: '0 0 4px 0' }}>Selected location</p>
                  <p style={{ fontSize: 12, color: '#7C2D12', margin: 0 }}>{selectedLocation.name}</p>
                </div>
              )}

              <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end' }}>
                <button
                  onClick={() => setIsAddAddressModalOpen(false)}
                  style={{ padding: '10px 14px', borderRadius: 8, border: '1px solid #CBD5E1', background: '#fff', color: '#334155', fontSize: 13, fontWeight: 700, cursor: 'pointer' }}
                >
                  Cancel
                </button>
                <button
                  onClick={handleSaveLocationAsAddress}
                  disabled={!selectedLocation}
                  style={{ ...S.btnPrimary, borderRadius: 8, opacity: selectedLocation ? 1 : 0.6 }}
                >
                  Save Address
                </button>
              </div>
            </div>
</div>
      </>
    )}

    {isEditAddressModalOpen && (
      <>
        <div
          onClick={() => setIsEditAddressModalOpen(false)}
          style={{ position: 'fixed', inset: 0, background: 'rgba(15, 23, 42, 0.42)', zIndex: 70 }}
        />
        <div
          style={{ position: 'fixed', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', width: 'min(520px, calc(100vw - 32px))', background: '#fff', borderRadius: 14, boxShadow: '0 20px 48px rgba(15,23,42,0.22)', zIndex: 75, overflow: 'hidden' }}
        >
          <div style={{ padding: '16px 18px', borderBottom: '1px solid #E5E7EB', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div>
              <p style={{ fontSize: 18, fontWeight: 700, color: '#111827', margin: 0 }}>Edit Address</p>
              <p style={{ fontSize: 12, color: '#6B7280', margin: '4px 0 0 0' }}>Update your address details</p>
            </div>
            <button
              onClick={() => setIsEditAddressModalOpen(false)}
              style={{ width: 30, height: 30, borderRadius: 8, border: '1px solid #E2E8F0', background: '#fff', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
              aria-label="Close edit address modal"
            >
              <X style={{ width: 14, height: 14, color: '#334155' }} />
            </button>
          </div>

          <div style={{ padding: '16px 18px 18px' }}>
            <div style={{ marginBottom: 12 }}>
              <label style={{ ...S.label, marginBottom: 8 }}>Address Label</label>
              <div style={{ display: 'flex', gap: 10 }}>
                {(['HOME', 'OFFICE', 'OTHER'] as AddressLabel[]).map((label) => (
                  <button
                    key={label}
                    onClick={() => setEditLabel(label)}
                    style={{ flex: 1, padding: '10px', borderRadius: 8, border: editLabel === label ? '2px solid #FC8019' : '1px solid #E5E7EB', background: editLabel === label ? '#FFF7ED' : '#fff', color: editLabel === label ? '#FC8019' : '#334155', fontSize: 13, fontWeight: 700, cursor: 'pointer' }}
                  >
                    {label === 'HOME' ? 'Home' : label === 'OFFICE' ? 'Office' : 'Other'}
                  </button>
                ))}
              </div>
            </div>

            <div style={{ marginBottom: 10 }}>
              <label style={{ ...S.label, marginBottom: 8 }}>Address Line 1</label>
              <input
                type="text"
                value={editLine1}
                onChange={(e) => setEditLine1(e.target.value)}
                placeholder="House/Flat No., Building, Street"
                style={{ ...S.input, borderRadius: 8 }}
              />
            </div>

            <div style={{ marginBottom: 10 }}>
              <label style={{ ...S.label, marginBottom: 8 }}>Address Line 2 (Optional)</label>
              <input
                type="text"
                value={editLine2}
                onChange={(e) => setEditLine2(e.target.value)}
                placeholder="Area, Locality, Landmark"
                style={{ ...S.input, borderRadius: 8 }}
              />
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, marginBottom: 10 }}>
              <div>
                <label style={{ ...S.label, marginBottom: 8 }}>City</label>
                <input
                  type="text"
                  value={editCity}
                  onChange={(e) => setEditCity(e.target.value)}
                  placeholder="City"
                  style={{ ...S.input, borderRadius: 8 }}
                />
              </div>
              <div>
                <label style={{ ...S.label, marginBottom: 8 }}>State</label>
                <input
                  type="text"
                  value={editState}
                  onChange={(e) => setEditState(e.target.value)}
                  placeholder="State"
                  style={{ ...S.input, borderRadius: 8 }}
                />
              </div>
            </div>

            <div style={{ marginBottom: 16 }}>
              <label style={{ ...S.label, marginBottom: 8 }}>Pincode</label>
              <input
                type="text"
                value={editPincode}
                onChange={(e) => setEditPincode(e.target.value)}
                placeholder="6-digit pincode"
                maxLength={6}
                style={{ ...S.input, borderRadius: 8 }}
              />
            </div>

            {addressesErr && <p style={{ fontSize: 12, color: '#EF4444', marginBottom: 8 }}>{addressesErr}</p>}

            <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end' }}>
              <button
                onClick={() => setIsEditAddressModalOpen(false)}
                style={{ padding: '10px 14px', borderRadius: 8, border: '1px solid #CBD5E1', background: '#fff', color: '#334155', fontSize: 13, fontWeight: 700, cursor: 'pointer' }}
              >
                Cancel
              </button>
              <button
                onClick={handleUpdateAddress}
                disabled={!editLine1 || !editCity || !editState || !editPincode}
                style={{ ...S.btnPrimary, borderRadius: 8, opacity: editLine1 && editCity && editState && editPincode ? 1 : 0.6 }}
              >
                Update Address
              </button>
            </div>
          </div>
        </div>
      </>
    )}

    {isEditDrawerOpen && (
        <>
          <div
            onClick={() => setIsEditDrawerOpen(false)}
            style={{ position: 'fixed', inset: 0, background: 'rgba(15, 23, 42, 0.42)', zIndex: 80 }}
          />
          <aside
            style={{ position: 'fixed', top: 0, right: 0, height: '100vh', width: 'min(430px, 100vw)', background: '#ffffff', boxShadow: '-8px 0 32px rgba(15, 23, 42, 0.18)', zIndex: 90, display: 'flex', flexDirection: 'column' }}
          >
            <div style={{ padding: '20px 22px', borderBottom: '1px solid #E2E8F0', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <div>
                <p style={{ fontSize: 20, fontWeight: 800, color: '#0F172A', marginBottom: 4 }}>Edit Profile</p>
                <p style={{ fontSize: 13, color: '#64748B' }}>Update your basic profile details</p>
              </div>
              <button
                onClick={() => setIsEditDrawerOpen(false)}
                style={{ width: 34, height: 34, borderRadius: 10, border: '1px solid #E2E8F0', background: '#fff', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                aria-label="Close edit profile panel"
              >
                <X style={{ width: 16, height: 16, color: '#334155' }} />
              </button>
            </div>

            <div style={{ padding: '20px 22px', overflowY: 'auto', flex: 1 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 18 }}>
                <div style={{ width: 52, height: 52, borderRadius: '50%', background: '#E2E8F0', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <span style={{ fontSize: 22, fontWeight: 800, color: '#1E3A8A' }}>{user.initials}</span>
                </div>
                <div>
                  <p style={{ fontSize: 14, fontWeight: 700, color: '#0F172A' }}>{user.name}</p>
                  <p style={{ fontSize: 12, color: '#64748B' }}>Member since {user.memberSince}</p>
                </div>
              </div>

              <div style={{ marginBottom: 16 }}>
                <label style={{ ...S.label, marginBottom: 8 }}>Full Name</label>
                <input
                  value={editName}
                  onChange={(e) => setEditName(e.target.value)}
                  placeholder="Enter your full name"
                  style={S.input}
                />
              </div>

              <div style={{ marginBottom: 16 }}>
                <label style={{ ...S.label, marginBottom: 8 }}>Email Address</label>
                <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                  <input
                    value={editEmail}
                    onChange={(e) => {
                      setEditEmail(e.target.value);
                      setNewEmail(e.target.value);
                    }}
                    placeholder="Enter email"
                    style={{ ...S.input, flex: 1 }}
                  />
                  <button
                    onClick={handleSendEmailVerification}
                    disabled={contactLoading || !editEmail.trim()}
                    style={{ ...S.btnOutline, opacity: contactLoading || !editEmail.trim() ? 0.6 : 1 }}
                  >
                    Verify
                  </button>
                </div>
              </div>

              <div style={{ marginBottom: 20 }}>
                <label style={{ ...S.label, marginBottom: 8 }}>Phone Number</label>
                <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                  <input
                    value={editPhone}
                    onChange={(e) => {
                      setEditPhone(e.target.value);
                      setNewPhone(e.target.value);
                      setPhoneOtpSent(false);
                      setPhoneOtp('');
                    }}
                    placeholder="Enter phone number"
                    style={{ ...S.input, flex: 1 }}
                  />
                  {!phoneOtpSent ? (
                    <button
                      onClick={handleSendPhoneOtp}
                      disabled={contactLoading || !editPhone.trim()}
                      style={{ ...S.btnOutline, opacity: contactLoading || !editPhone.trim() ? 0.6 : 1 }}
                    >
                      Verify
                    </button>
                  ) : (
                    <button
                      onClick={handleVerifyPhoneOtp}
                      disabled={contactLoading || !phoneOtp.trim()}
                      style={{ ...S.btnOutline, opacity: contactLoading || !phoneOtp.trim() ? 0.6 : 1 }}
                    >
                      Submit OTP
                    </button>
                  )}
                </div>

                {phoneOtpSent && (
                  <input
                    value={phoneOtp}
                    onChange={(e) => setPhoneOtp(e.target.value)}
                    placeholder="Enter OTP"
                    style={{ ...S.input, marginTop: 10 }}
                  />
                )}
              </div>

              {(contactMsg || contactErr) && (
                <div style={{ marginBottom: 14 }}>
                  {contactMsg && <p style={{ fontSize: 13, color: '#16A34A' }}>{contactMsg}</p>}
                  {contactErr && <p style={{ fontSize: 13, color: '#EF4444' }}>{contactErr}</p>}
                </div>
              )}
            </div>

            <div style={{ padding: '16px 22px', borderTop: '1px solid #E2E8F0', display: 'flex', gap: 10, justifyContent: 'flex-end' }}>
              <button
                onClick={() => setIsEditDrawerOpen(false)}
                style={{ padding: '10px 16px', borderRadius: 10, border: '1px solid #CBD5E1', background: '#fff', color: '#334155', fontSize: 13, fontWeight: 700, cursor: 'pointer' }}
              >
                Cancel
              </button>
              <button
                onClick={handleSaveBasicProfile}
                style={{ padding: '10px 16px', borderRadius: 10, border: 'none', background: '#F97316', color: '#fff', fontSize: 13, fontWeight: 700, cursor: 'pointer' }}
              >
                Save Changes
              </button>
            </div>
          </aside>
        </>
      )}
    </div>
  );
}