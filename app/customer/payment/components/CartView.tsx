import { ChevronRight, Leaf, MoreVertical, Plus, Trash2, X, Zap } from 'lucide-react';
import { useEffect, useMemo, useRef, useState } from 'react';
import type { CartItem, CouponState } from './types';

type CartViewProps = {
  items: CartItem[];
  onUpdateQuantity: (itemId: string, delta: number) => void;
  onClearCart: () => void;
  onProceed: () => void;
  onViewCoupons: () => void;
  appliedCoupon: CouponState | null;
  showCouponPopup: boolean;
  onCloseCouponPopup: () => void;
  addressLine: string;
  onApplyNoBag: (enabled: boolean) => void;
  noBag: boolean;
};

export default function CartView({
  items,
  onUpdateQuantity,
  onClearCart,
  onProceed,
  onViewCoupons,
  appliedCoupon,
  showCouponPopup,
  onCloseCouponPopup,
  addressLine,
  onApplyNoBag,
  noBag,
}: CartViewProps) {
  const [showMenu, setShowMenu] = useState(false);
  const [showClearCartModal, setShowClearCartModal] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setShowMenu(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const totals = useMemo(() => {
    const itemTotal = items.reduce((sum, item) => sum + item.price * item.quantity, 0);
    const handling = items.length > 0 ? 10.62 : 0;
    const partner = 0;
    const couponDiscount = appliedCoupon?.discount ?? 0;
    const toPay = Math.max(0, itemTotal + handling + partner - couponDiscount);

    return {
      itemTotal,
      handling,
      partner,
      couponDiscount,
      toPay,
      originalTotal: itemTotal + 12.62 + 16,
    };
  }, [items, appliedCoupon]);

  const hasItems = items.length > 0;

  return (
    <div className="relative flex h-full flex-col overflow-y-auto bg-[#f4f6fb] pb-32">
      <div className="sticky top-0 z-10 flex items-center justify-between border-b border-gray-100 bg-white p-4">
        <div>
          <div className="flex items-center gap-1 text-sm font-bold">
            HOME
          </div>
          <div className="w-64 truncate text-xs text-gray-500 md:w-96">{addressLine}</div>
        </div>
        <div className="relative flex items-center gap-4" ref={menuRef}>
          <button
            className="rounded-full p-1 transition-colors hover:bg-gray-100"
            onClick={() => setShowMenu((current) => !current)}
          >
            <MoreVertical size={20} />
          </button>

          {showMenu && (
            <div className="absolute right-0 top-full z-50 mt-1 min-w-[140px] rounded-2xl border border-gray-100 bg-white px-4 py-2 shadow-[0_4px_20px_rgba(0,0,0,0.15)]">
              <button
                className="flex w-full items-center justify-between py-1 text-[15px] font-bold text-gray-700"
                onClick={() => {
                  setShowMenu(false);
                  setShowClearCartModal(true);
                }}
              >
                Clear Cart <Trash2 size={18} className="text-gray-500" />
              </button>
            </div>
          )}
        </div>
      </div>

      <div className="mx-4 mt-4 rounded-2xl bg-white p-4 shadow-sm">
        <div className="mb-3 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-[17px] font-bold text-gray-800">8 Mins</span>
            <div className="flex items-center gap-0.5 rounded border border-green-200 bg-green-50 px-1.5 py-0.5 text-[10px] font-bold text-green-600">
              <Zap size={10} className="fill-green-600" /> Superfast
            </div>
          </div>
          <span className="text-sm font-medium text-gray-500">{items.reduce((sum, item) => sum + item.quantity, 0)} item{items.reduce((sum, item) => sum + item.quantity, 0) > 1 ? 's' : ''}</span>
        </div>

        <div className="my-3 border-b border-dashed border-gray-200" />

        {items.length > 0 ? (
          <div className="mt-3 flex flex-col gap-3">
            {items.map((item) => (
              <div key={item.id} className="flex items-center">
                <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-lg border border-gray-100 bg-gray-50 p-1">
                  {item.image ? (
                    <img src={item.image} alt={item.name} className="h-full w-full rounded object-cover" referrerPolicy="no-referrer" />
                  ) : (
                    <div className="text-[10px] text-gray-500">Service</div>
                  )}
                </div>
                <div className="ml-3 flex-1">
                  <div className="text-[13px] font-medium text-gray-800">{item.name}</div>
                  <div className="mt-0.5 text-[11px] text-gray-500">{item.duration || 'Service slot'}</div>
                </div>
                <div className="flex items-center gap-3">
                  <div className="flex w-[72px] items-center justify-between rounded-lg border border-gray-200 bg-white px-2 py-1 shadow-sm">
                    <button onClick={() => onUpdateQuantity(item.id, -1)} className="flex h-5 w-5 items-center justify-center rounded text-lg font-bold leading-none text-[#0c51ff] hover:bg-blue-50">-</button>
                    <span className="text-sm font-bold text-[#0c51ff]">{item.quantity}</span>
                    <button onClick={() => onUpdateQuantity(item.id, 1)} className="flex h-5 w-5 items-center justify-center rounded text-lg font-bold leading-none text-[#0c51ff] hover:bg-blue-50">+</button>
                  </div>
                  <div className="w-12 text-right text-[13px] font-bold text-gray-800">₹{Math.round(item.price * item.quantity)}</div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="rounded-xl border border-dashed border-gray-200 p-4 text-center text-sm text-gray-500">No items in cart</div>
        )}

        <button className="mt-4 flex items-center gap-1.5 rounded-xl border border-gray-200 px-3 py-1.5 text-[13px] font-medium text-gray-700 transition-colors hover:bg-gray-50">
          <Plus size={16} className="text-gray-500" /> Add more items
        </button>
      </div>

      <div className="mx-4 mt-4 rounded-2xl bg-white p-4 shadow-sm">
        <div className="mb-3 text-[11px] font-bold tracking-wider text-gray-500">SAVINGS CORNER</div>
        <div className="flex items-start justify-between">
          <div className="flex gap-3">
            <div className="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded bg-blue-50">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-blue-600"><path d="M20.59 13.41l-7.17 7.17a2 2 0 0 1-2.83 0L2 12V2h10l8.59 8.59a2 2 0 0 1 0 2.82z" /><line x1="7" y1="7" x2="7.01" y2="7" /></svg>
            </div>
            <div>
              <div className="text-sm font-bold text-gray-800">
                {appliedCoupon ? `Code ${appliedCoupon.code} applied!` : 'Apply coupon on this order'}
              </div>
              <button onClick={onViewCoupons} className="mt-1 flex items-center text-xs text-gray-500 hover:text-gray-700">
                View coupon options <ChevronRight size={14} className="ml-0.5" />
              </button>
            </div>
          </div>
          <button onClick={onViewCoupons} className="text-sm font-bold text-blue-600 hover:text-blue-700">
            {appliedCoupon ? 'Change' : 'Apply'}
          </button>
        </div>
      </div>

      <div className="mx-4 mt-4 flex items-center justify-between rounded-2xl bg-white p-4 shadow-sm">
        <div>
          <div className="flex items-center gap-1.5 text-sm font-bold text-gray-800">
            I don't need a bag! <Leaf size={16} className="fill-green-100 text-green-600" />
          </div>
          <div className="mt-1 text-xs text-gray-500">Take the pledge for a greener future - opt for no bag delivery!</div>
        </div>
        <button
          className={`relative h-6 w-10 shrink-0 rounded-full transition-colors ${noBag ? 'bg-green-500' : 'bg-gray-200'}`}
          onClick={() => onApplyNoBag(!noBag)}
          aria-label="Toggle no bag"
        >
          <span className={`absolute top-0.5 h-5 w-5 rounded-full bg-white shadow-sm transition-transform ${noBag ? 'translate-x-4' : 'translate-x-0.5'}`} />
        </button>
      </div>

      <div className="mx-4 mt-4 rounded-2xl bg-white p-4 shadow-sm">
        <div className="mb-4 text-[11px] font-bold tracking-wider text-gray-500">BILL DETAILS</div>

        <div className="mb-3 flex justify-between text-xs">
          <div className="text-gray-600">Item Total</div>
          <div className="flex items-center gap-2">
            <span className="text-gray-400 line-through">₹{totals.originalTotal.toFixed(2)}</span>
            <span className="font-medium text-gray-800">₹{totals.itemTotal.toFixed(2)}</span>
          </div>
        </div>

        <div className="mb-3 flex justify-between text-xs">
          <div className="border-b border-dashed border-gray-300 pb-0.5 text-gray-600">Handling Fee</div>
          <div className="flex items-center gap-2">
            <span className="text-gray-400 line-through">₹12.62</span>
            <span className="font-medium text-gray-800">₹{totals.handling.toFixed(2)}</span>
          </div>
        </div>

        <div className="mb-4 flex justify-between text-xs">
          <div className="border-b border-dashed border-gray-300 pb-0.5 text-gray-600">Delivery Partner Fee</div>
          <div className="flex items-center gap-2">
            <span className="text-gray-400 line-through">₹16.00</span>
            <span className="font-bold text-green-600">FREE</span>
          </div>
        </div>

        {totals.couponDiscount > 0 && (
          <div className="mb-4 flex justify-between text-xs">
            <div className="text-gray-600">Coupon Discount</div>
            <div className="font-bold text-green-600">-₹{totals.couponDiscount.toFixed(2)}</div>
          </div>
        )}

        <div className="flex justify-between border-t border-gray-100 pt-4 text-sm font-bold text-gray-800">
          <div>To Pay</div>
          <div className="flex items-center gap-2">
            <span className="text-xs font-normal text-gray-400 line-through">₹{totals.originalTotal.toFixed(2)}</span>
            <span>₹{totals.toPay.toFixed(2)}</span>
          </div>
        </div>
      </div>

      <div className="mb-8 mx-4 mt-4 rounded-2xl bg-white p-4 text-center text-[11px] shadow-sm">
        <div className="mb-1.5 text-gray-600">
          <span className="font-bold text-red-500">NOTE:</span> Orders cannot be cancelled and are non-refundable once packed for delivery.
        </div>
        <button className="font-bold text-blue-600 hover:underline">Read cancellation policy</button>
      </div>

      <div className="fixed bottom-0 z-20 w-full max-w-4xl">
        <div className="overflow-hidden rounded-t-2xl bg-white shadow-[0_-8px_20px_-4px_rgba(0,0,0,0.1)]">
          <div className="flex items-center justify-between bg-[#f4f6fb] px-4 py-3">
            <div className="flex items-center gap-2">
              <span className="text-[14px] font-bold text-gray-700">To Pay: ₹{totals.toPay.toFixed(2)}</span>
              <span className="text-[12px] text-gray-400 line-through">₹{totals.originalTotal.toFixed(2)}</span>
            </div>
            <button className="text-[13px] font-bold text-[#0c51ff] hover:underline">View Detailed Bill</button>
          </div>
          <div className="p-4 pt-3">
            <button
              onClick={onProceed}
              disabled={!hasItems}
              className={`w-full rounded-xl py-3.5 text-[15px] font-bold text-white transition-colors ${hasItems ? 'bg-[#0c51ff] hover:bg-blue-700' : 'cursor-not-allowed bg-gray-300'}`}
            >
              {hasItems ? 'Proceed to Pay' : 'Add items to continue'}
            </button>
          </div>
        </div>
      </div>

      {showCouponPopup && appliedCoupon && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-4">
          <div className="relative flex w-full max-w-md flex-col items-center rounded-3xl bg-white p-6 text-center shadow-2xl">
            <button
              onClick={onCloseCouponPopup}
              className="absolute right-4 top-4 rounded-full border border-gray-200 p-1 text-gray-400 hover:text-gray-600"
            >
              <X size={16} />
            </button>

            <h2 className="mt-4 mb-4 text-xl font-bold text-gray-800">'{appliedCoupon.code}' applied</h2>

            <p className="mb-6 px-4 text-sm text-gray-500">
              Great choice. Your discount has been applied on the current order.
            </p>

            <button onClick={onCloseCouponPopup} className="text-sm font-bold tracking-wider text-blue-600 hover:text-blue-700">
              YAY!
            </button>
          </div>
        </div>
      )}

      {showClearCartModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4">
          <div className="w-full max-w-md rounded-3xl bg-white p-6 shadow-2xl">
            <h2 className="mb-2 text-xl font-bold text-gray-900">Clear your cart?</h2>
            <p className="mb-6 text-[15px] text-gray-600">Would you like to remove all items from your cart?</p>
            <div className="flex gap-3">
              <button
                onClick={() => setShowClearCartModal(false)}
                className="flex-1 rounded-xl border-2 border-[#0c51ff] py-3.5 text-[15px] font-bold text-[#0c51ff] transition-colors hover:bg-blue-50"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  onClearCart();
                  setShowClearCartModal(false);
                }}
                className="flex-1 rounded-xl bg-[#0c51ff] py-3.5 text-[15px] font-bold text-white transition-colors hover:bg-blue-700"
              >
                Clear cart
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
