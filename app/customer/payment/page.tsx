'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import CartView from './components/CartView';
import CouponsView from './components/CouponsView';
import PaymentView from './components/PaymentView';
import {
  CHECKOUT_ADDRESS_STORAGE_KEY,
  type CartItem,
  type CheckoutAddress,
  type CouponState,
} from './components/types';
import { readCartRaw, syncCartRawToServer, writeCartRaw } from '@/lib/utils/cart-storage';

type CheckoutView = 'cart' | 'payment' | 'coupons';

function parseCouponDiscount(code: string, subtotal: number) {
  const extractedNumber = Number(code.replace(/\D/g, ''));

  if (Number.isFinite(extractedNumber) && extractedNumber > 0) {
    return Math.min(extractedNumber, subtotal);
  }

  if (code.includes('SAVE')) {
    return Math.min(25, subtotal);
  }

  return 0;
}

export default function PaymentPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const showDebug = searchParams.get('cartDebug') === '1';
  const [currentView, setCurrentView] = useState<CheckoutView>('cart');
  const [items, setItems] = useState<CartItem[]>([]);
  const [address, setAddress] = useState<CheckoutAddress | null>(null);
  const [cartHydrated, setCartHydrated] = useState(false);
  const [useWallet, setUseWallet] = useState(false);
  const [noBag, setNoBag] = useState(false);
  const [appliedCoupon, setAppliedCoupon] = useState<CouponState | null>(null);
  const [showCouponPopup, setShowCouponPopup] = useState(false);
  const [backendSummary, setBackendSummary] = useState<{
    itemCount: number;
    subtotal: number;
    handlingFee: number;
    total: number;
  } | null>(null);
  const [backendSummaryError, setBackendSummaryError] = useState<string | null>(null);

  const refreshBackendSummary = useCallback(async () => {
    try {
      const response = await fetch('/api/customer/cart', {
        method: 'GET',
        cache: 'no-store',
      });

      if (!response.ok) {
        setBackendSummaryError(`GET /api/customer/cart failed with ${response.status}`);
        return;
      }

      const data = (await response.json()) as {
        summary?: {
          itemCount: number;
          subtotal: number;
          handlingFee: number;
          total: number;
        };
      };

      setBackendSummary(data.summary ?? null);
      setBackendSummaryError(null);
    } catch {
      setBackendSummaryError('Failed to fetch backend cart summary');
    }
  }, []);

  useEffect(() => {
    try {
      const rawCart = readCartRaw();
      if (rawCart) {
        const parsed = JSON.parse(rawCart) as CartItem[];
        if (Array.isArray(parsed)) {
          const safeCart = parsed
            .map((item) => ({
              ...item,
              price: Number(item?.price ?? 0),
              quantity: Number(item?.quantity ?? 0),
            }))
            .filter(
              (item) =>
                Boolean(item?.id) &&
                Boolean(item?.name) &&
                Number.isFinite(item?.price) &&
                Number.isFinite(item?.quantity) &&
                item.quantity > 0
            );
          setItems(safeCart);
        }
      }
    } catch {
      // Keep existing cart key untouched if parsing fails; user might recover on next valid write.
    } finally {
      setCartHydrated(true);
    }

    try {
      const rawAddress = localStorage.getItem(CHECKOUT_ADDRESS_STORAGE_KEY);
      if (rawAddress) {
        const parsedAddress = JSON.parse(rawAddress) as CheckoutAddress;
        if (parsedAddress?.id && parsedAddress?.line) {
          setAddress(parsedAddress);
        }
      }
    } catch {
      localStorage.removeItem(CHECKOUT_ADDRESS_STORAGE_KEY);
    }
  }, []);

  const subtotal = useMemo(
    () => items.reduce((sum, item) => sum + item.price * item.quantity, 0),
    [items]
  );

  const handlingFee = items.length > 0 ? 10.62 : 0;
  const walletCredit = useWallet ? Math.min(200, subtotal) : 0;

  const totalAfterDiscounts = useMemo(() => {
    const couponDiscount = appliedCoupon?.discount ?? 0;
    return Math.max(0, subtotal + handlingFee - couponDiscount - walletCredit);
  }, [subtotal, handlingFee, appliedCoupon, walletCredit]);

  useEffect(() => {
    if (!cartHydrated) return;
    const raw = JSON.stringify(items);
    writeCartRaw(raw);
    void syncCartRawToServer(raw).then(() => {
      if (showDebug) {
        void refreshBackendSummary();
      }
    });
    window.dispatchEvent(new Event('sevam-cart-updated'));
  }, [items, cartHydrated, showDebug, refreshBackendSummary]);

  useEffect(() => {
    if (!showDebug) return;
    void refreshBackendSummary();
  }, [showDebug, refreshBackendSummary]);

  const updateQuantity = (itemId: string, delta: number) => {
    setItems((prev) =>
      prev
        .map((item) =>
          item.id === itemId
            ? { ...item, quantity: item.quantity + delta }
            : item
        )
        .filter((item) => item.quantity > 0)
    );
  };

  const handleApplyCoupon = (code: string) => {
    const discount = parseCouponDiscount(code, subtotal);
    setAppliedCoupon({ code, discount });
    setShowCouponPopup(true);
    setCurrentView('cart');
  };

  return (
    <div className="min-h-screen bg-gray-200 font-sans text-[#282c3f]">
      <div className="relative mx-auto flex min-h-screen w-full max-w-4xl flex-col overflow-hidden bg-[#f0f2f5] shadow-2xl">
        {currentView === 'cart' && (
          <CartView
            items={items}
            onUpdateQuantity={updateQuantity}
            onClearCart={() => setItems([])}
            onProceed={() => setCurrentView('payment')}
            onViewCoupons={() => setCurrentView('coupons')}
            appliedCoupon={appliedCoupon}
            showCouponPopup={showCouponPopup}
            onCloseCouponPopup={() => setShowCouponPopup(false)}
            addressLine={address?.line ?? 'No saved address. Please select address from cart drawer in navbar.'}
            onApplyNoBag={setNoBag}
            noBag={noBag}
          />
        )}

        {currentView === 'payment' && (
          <PaymentView
            onBack={() => setCurrentView('cart')}
            itemCount={items.length}
            total={totalAfterDiscounts}
            addressLine={address?.line ?? 'No saved address. Please select an address.'}
            label={address?.label ?? 'Address'}
            eta={address?.eta ?? '8 mins'}
            useWallet={useWallet}
            onToggleWallet={() => setUseWallet((current) => !current)}
            onPay={() => router.push('/customer/bookings')}
          />
        )}

        {currentView === 'coupons' && (
          <CouponsView
            onBack={() => setCurrentView('cart')}
            subtotal={subtotal}
            onApply={handleApplyCoupon}
          />
        )}

        {showDebug && (
          <div className="border-t border-[#d7dce3] bg-white/95 px-4 py-3 text-xs text-[#2f3446]">
            <p className="font-semibold">Checkout Debug (cartDebug=1)</p>
            <p>
              Frontend: itemCount={items.reduce((sum, item) => sum + item.quantity, 0)} subtotal={subtotal.toFixed(2)}
            </p>
            <p>
              Backend: itemCount={backendSummary?.itemCount ?? 0} subtotal={(backendSummary?.subtotal ?? 0).toFixed(2)} total={(backendSummary?.total ?? 0).toFixed(2)}
            </p>
            {backendSummaryError && <p className="text-red-600">{backendSummaryError}</p>}
          </div>
        )}
      </div>
    </div>
  );
}
