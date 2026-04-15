import { ArrowLeft, Banknote, Building2, ChevronRight, Plus, Wallet } from 'lucide-react';

type PaymentViewProps = {
  onBack: () => void;
  itemCount: number;
  total: number;
  addressLine: string;
  label: string;
  eta: string;
  useWallet: boolean;
  onToggleWallet: () => void;
  onPay: () => void;
  onPayOnline: () => void;
  isPayingOnline?: boolean;
  paymentError?: string | null;
};

export default function PaymentView({
  onBack,
  itemCount,
  total,
  addressLine,
  label,
  eta,
  useWallet,
  onToggleWallet,
  onPay,
  onPayOnline,
  isPayingOnline = false,
  paymentError = null,
}: PaymentViewProps) {
  return (
    <div className="flex h-full flex-col overflow-y-auto bg-[#f0f2f5] pb-24">
      <div className="sticky top-0 z-10 flex items-center gap-4 border-b border-gray-100 bg-white p-4">
        <button onClick={onBack} className="rounded-full p-1 transition-colors hover:bg-gray-100">
          <ArrowLeft size={20} />
        </button>
        <div>
          <div className="text-base font-bold text-gray-800">Payment Options</div>
          <div className="mt-0.5 text-xs text-gray-500">{itemCount} item. Total: ₹{Math.round(total)}</div>
        </div>
      </div>

      <div className="mb-2 flex gap-4 border-b border-gray-100 bg-white p-4">
        <div className="mt-1 flex shrink-0 flex-col items-center">
          <div className="h-2.5 w-2.5 rounded-full border-[2.5px] border-purple-600 bg-white" />
          <div className="my-0.5 h-8 w-[1.5px] bg-gray-300" />
          <div className="h-2.5 w-2.5 rounded-full bg-purple-600" />
        </div>
        <div className="flex-1 text-[11px] text-gray-500 md:text-xs">
          <div className="mb-3 leading-relaxed">
            <span className="font-bold text-gray-800">Sevam</span> | Professional service request
          </div>
          <div className="mb-2 leading-relaxed">
            <span className="font-bold text-gray-800">{label}</span> | {addressLine}
          </div>
          <div>
            Delivery In: <span className="font-bold text-gray-800">{eta}</span>
          </div>
        </div>
      </div>

      <div className="p-4">
        <div className="mb-3 flex items-center gap-2 text-sm font-bold text-gray-800">
          Sevam Wallet <span className="rounded bg-blue-600 px-1.5 py-0.5 text-[9px] font-bold tracking-wider text-white">NEW</span>
        </div>
        <div className="flex items-center justify-between rounded-2xl bg-white p-4 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-[#f15700] text-lg font-bold text-white">₹</div>
            <span className="text-sm font-bold text-gray-800">Sevam Wallet</span>
          </div>
          <div className="flex items-center gap-3">
            <span className="text-sm font-medium text-gray-800">₹200</span>
            <button
              className={`relative h-6 w-10 shrink-0 rounded-full transition-colors ${useWallet ? 'bg-green-500' : 'bg-gray-200'}`}
              onClick={onToggleWallet}
              aria-label="Toggle wallet"
            >
              <span className={`absolute top-0.5 h-5 w-5 rounded-full bg-white shadow-sm transition-transform ${useWallet ? 'translate-x-4' : 'translate-x-0.5'}`} />
            </button>
          </div>
        </div>
      </div>

      <div className="px-4 pb-4">
        <div className="mb-3 text-sm font-bold text-gray-800">Preferred Payment</div>
        <div className="cursor-pointer rounded-2xl bg-white p-4 shadow-sm transition-colors hover:bg-gray-50">
          <div className="flex items-center justify-between">
            <div className="flex items-start gap-3">
              <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border border-green-100 bg-green-50 text-green-600">
                <Banknote size={18} />
              </div>
              <div>
                <div className="text-sm font-bold text-gray-800">Cash/Pay on Delivery</div>
                <div className="mt-0.5 text-[11px] text-gray-500">Pay cash at the time of delivery.</div>
              </div>
            </div>
            <div className="h-5 w-5 shrink-0 rounded-full border-2 border-[#0c51ff] bg-[#0c51ff]/10" />
          </div>
          <button
            onClick={onPay}
            className="mt-4 h-11 w-full rounded-xl bg-[#0c51ff] text-sm font-bold text-white transition-colors hover:bg-blue-700"
          >
            Pay ₹{Math.round(total)} with Cash
          </button>
          <button
            onClick={onPayOnline}
            disabled={isPayingOnline || total <= 0}
            className="mt-2 h-11 w-full rounded-xl border border-[#0c51ff] bg-white text-sm font-bold text-[#0c51ff] transition-colors hover:bg-blue-50 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {isPayingOnline ? 'Opening Razorpay...' : `Pay ₹${Math.round(total)} Online`}
          </button>
          <p className="mt-2 text-[11px] text-gray-500">Secure online payment powered by Razorpay.</p>
          {paymentError && <p className="mt-1 text-[11px] text-red-600">{paymentError}</p>}
        </div>
      </div>

      <div className="px-4 pb-4">
        <div className="mb-3 text-sm font-bold text-gray-800">Credit & Debit Cards</div>
        <div className="flex cursor-pointer items-start gap-3 rounded-2xl bg-white p-4 shadow-sm transition-colors hover:bg-gray-50">
          <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border border-blue-100 bg-blue-50 text-blue-600">
            <Plus size={18} />
          </div>
          <div>
            <div className="text-sm font-bold text-blue-600">Add New Card</div>
            <div className="mt-0.5 text-[11px] text-gray-500">Save and Pay via Cards.</div>
          </div>
        </div>
      </div>

      <div className="px-4 pb-8">
        <div className="mb-3 text-sm font-bold text-gray-800">More Payment Options</div>
        <div className="overflow-hidden rounded-2xl bg-white shadow-sm">
          <div className="flex cursor-pointer items-center justify-between border-b border-gray-100 p-4 transition-colors hover:bg-gray-50">
            <div className="flex items-start gap-3">
              <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border border-gray-100 bg-gray-50 text-gray-500">
                <Wallet size={18} />
              </div>
              <div>
                <div className="text-sm font-bold text-gray-800">Wallets</div>
                <div className="mt-0.5 text-[11px] text-gray-500">PhonePe, Amazon Pay & more</div>
              </div>
            </div>
            <ChevronRight size={18} className="text-gray-400" />
          </div>

          <div className="flex cursor-pointer items-center justify-between p-4 transition-colors hover:bg-gray-50">
            <div className="flex items-start gap-3">
              <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border border-gray-100 bg-gray-50 text-gray-500">
                <Building2 size={18} />
              </div>
              <div>
                <div className="text-sm font-bold text-gray-800">Netbanking</div>
                <div className="mt-0.5 text-[11px] text-gray-500">Select from a list of banks</div>
              </div>
            </div>
            <ChevronRight size={18} className="text-gray-400" />
          </div>
        </div>
      </div>
    </div>
  );
}
