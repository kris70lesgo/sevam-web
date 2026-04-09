import { ArrowLeft } from 'lucide-react';
import { useState } from 'react';

type CouponsViewProps = {
  onBack: () => void;
  subtotal: number;
  onApply: (code: string) => void;
};

export default function CouponsView({ onBack, subtotal, onApply }: CouponsViewProps) {
  const [code, setCode] = useState('');
  const [error, setError] = useState('');

  const handleApply = () => {
    const normalized = code.trim().toUpperCase();
    if (!normalized) {
      setError('Enter a coupon code.');
      return;
    }

    if (subtotal < 199) {
      setError('Coupon can be applied on orders above ₹199.');
      return;
    }

    setError('');
    onApply(normalized);
  };

  return (
    <div className="flex h-full flex-col overflow-y-auto bg-[#f0f2f5]">
      <div className="sticky top-0 z-10 flex items-center gap-4 border-b border-gray-100 bg-white p-4">
        <button onClick={onBack} className="rounded-full p-1 transition-colors hover:bg-gray-100">
          <ArrowLeft size={20} />
        </button>
        <div className="text-base font-bold text-gray-800">Apply Coupon</div>
      </div>

      <div className="p-4">
        <div className="mb-4 rounded-xl border border-gray-200 bg-white p-3">
          <input
            type="text"
            value={code}
            onChange={(event) => setCode(event.target.value)}
            placeholder="Enter Coupon Code"
            className="w-full text-sm uppercase outline-none placeholder:text-gray-400"
          />
        </div>

        {error && <p className="mb-3 text-xs text-red-500">{error}</p>}

        <button
          onClick={handleApply}
          className="h-11 w-full rounded-xl bg-[#0c51ff] text-sm font-bold text-white transition-colors hover:bg-blue-700"
        >
          Apply Coupon
        </button>

        <div className="mt-5 rounded-2xl bg-white p-4 shadow-sm">
          <p className="text-xs font-bold tracking-wider text-gray-500">COUPON POLICY</p>
          <p className="mt-2 text-xs leading-relaxed text-gray-600">
            Use a valid code on orders above ₹199. Your applied coupon will reflect on the bill summary in cart.
          </p>
        </div>
      </div>
    </div>
  );
}
