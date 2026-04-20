'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
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

declare global {
  interface Window {
    Razorpay: new (options: Record<string, unknown>) => { open: () => void };
  }
}

function loadRazorpayScript(): Promise<boolean> {
  return new Promise((resolve) => {
    if (typeof window !== 'undefined' && window.Razorpay) {
      resolve(true);
      return;
    }

    const script = document.createElement('script');
    script.src = 'https://checkout.razorpay.com/v1/checkout.js';
    script.onload = () => resolve(true);
    script.onerror = () => resolve(false);
    document.body.appendChild(script);
  });
}

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
  const [currentView, setCurrentView] = useState<CheckoutView>('cart');
  const [items, setItems] = useState<CartItem[]>([]);
  const [address, setAddress] = useState<CheckoutAddress | null>(null);
  const [cartHydrated, setCartHydrated] = useState(false);
  const [useWallet, setUseWallet] = useState(false);
  const [noBag, setNoBag] = useState(false);
  const [appliedCoupon, setAppliedCoupon] = useState<CouponState | null>(null);
  const [showCouponPopup, setShowCouponPopup] = useState(false);
  const [isPayingOnline, setIsPayingOnline] = useState(false);
  const [paymentError, setPaymentError] = useState<string | null>(null);

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
    } catch (err) {
      console.warn('[Payment] Failed to parse cart from local storage:', err);
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
    } catch (err) {
      console.warn('[Payment] Failed to parse saved checkout address, clearing local entry:', err);
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
    void syncCartRawToServer(raw);
    window.dispatchEvent(new Event('sevam-cart-updated'));
  }, [items, cartHydrated]);

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

  const handlePayOnline = useCallback(async () => {
    if (items.length === 0) {
      setPaymentError('Your cart is empty. Add services before paying online.');
      return;
    }

    setPaymentError(null);
    setIsPayingOnline(true);

    try {
      const sdkLoaded = await loadRazorpayScript();
      if (!sdkLoaded || typeof window.Razorpay === 'undefined') {
        setPaymentError('Unable to load Razorpay checkout. Please try again.');
        setIsPayingOnline(false);
        return;
      }

      const orderResponse = await fetch('/api/razorpay/checkout/order', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          amount: totalAfterDiscounts,
          currency: 'INR',
          itemCount: items.reduce((sum, item) => sum + item.quantity, 0),
          label: address?.label,
          addressLine: address?.line,
        }),
        cache: 'no-store',
      });

      let orderPayload: {
        error?: string;
        keyId?: string;
        order?: {
          id: string;
          amount: number;
          currency: string;
        };
      } = {};

      try {
        orderPayload = (await orderResponse.json()) as typeof orderPayload;
      } catch (err) {
        console.error('[Payment] Failed to parse order response JSON:', err);
      }

      if (!orderResponse.ok || !orderPayload.order?.id || !orderPayload.keyId) {
        setPaymentError(orderPayload.error ?? 'Unable to create payment order.');
        setIsPayingOnline(false);
        return;
      }

      const razorpay = new window.Razorpay({
        key: orderPayload.keyId,
        amount: orderPayload.order.amount,
        currency: orderPayload.order.currency,
        name: 'Sevam',
        description: 'Service checkout payment',
        order_id: orderPayload.order.id,
        prefill: {
          name: address?.label ?? 'Customer',
        },
        notes: {
          address: address?.line ?? '',
          flow: 'customer_checkout',
        },
        theme: {
          color: '#0c51ff',
        },
        handler: async (response: {
          razorpay_order_id: string;
          razorpay_payment_id: string;
          razorpay_signature: string;
        }) => {
          try {
            const verifyResponse = await fetch('/api/razorpay/checkout/verify', {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
              },
              body: JSON.stringify(response),
              cache: 'no-store',
            });

            let verifyPayload: {
              error?: string;
            } = {};

            try {
              verifyPayload = (await verifyResponse.json()) as typeof verifyPayload;
            } catch (err) {
              console.error('[Payment] Failed to parse verify response JSON:', err);
            }

            if (!verifyResponse.ok) {
              setPaymentError(verifyPayload.error ?? 'Payment verification failed. Please try again.');
              return;
            }

            setItems([]);
            setPaymentError(null);
            router.push('/customer/bookings');
          } finally {
            setIsPayingOnline(false);
          }
        },
        modal: {
          ondismiss: () => {
            setIsPayingOnline(false);
          },
        },
      });

      razorpay.open();
    } catch {
      setPaymentError('Unable to start online payment. Please try again.');
      setIsPayingOnline(false);
    }
  }, [address?.label, address?.line, items, router, totalAfterDiscounts]);

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
            onPayOnline={handlePayOnline}
            isPayingOnline={isPayingOnline}
            paymentError={paymentError}
          />
        )}

        {currentView === 'coupons' && (
          <CouponsView
            onBack={() => setCurrentView('cart')}
            subtotal={subtotal}
            onApply={handleApplyCoupon}
          />
        )}

      </div>
    </div>
  );
}
