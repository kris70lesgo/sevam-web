'use client';

import { X, Star, Clock, Minus, Plus } from 'lucide-react';
import type { SubService } from '../page';

interface ServicePopupProps {
  service: SubService;
  quantity: number;
  onClose: () => void;
  onAdd: () => void;
  onUpdateQty: (delta: number) => void;
}

export default function ServicePopup({
  service,
  quantity,
  onClose,
  onAdd,
  onUpdateQty,
}: ServicePopupProps) {
  const isInCart = quantity > 0;
  const originalPrice = Math.round(service.price * 1.3);

  return (
    <div
      className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-2xl w-full max-w-lg max-h-[90vh] overflow-hidden shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header Image */}
        <div className="relative h-56 bg-gray-100">
          <img
            src={service.image}
            alt={service.name}
            className="w-full h-full object-cover"
          />
          <button
            onClick={onClose}
            className="absolute top-3 right-3 w-9 h-9 bg-white/90 rounded-full flex items-center justify-center shadow-sm hover:bg-white transition-colors"
          >
            <X size={18} className="text-gray-700" />
          </button>
          <span className="absolute bottom-3 left-3 bg-black/70 text-white text-xs font-medium px-2.5 py-1 rounded">
            {service.categoryName}
          </span>
        </div>

        {/* Content */}
        <div className="p-5">
          {/* Title & Rating */}
          <div className="flex items-start justify-between gap-3 mb-3">
            <div className="flex-1">
              <h2 className="text-xl font-bold text-gray-900 mb-2">{service.name}</h2>
              <div className="flex items-center gap-1.5 text-sm text-gray-600">
                <Star size={14} className="text-yellow-500 fill-yellow-500" />
                <span className="font-semibold">{service.rating.toFixed(1)}</span>
                <span className="text-gray-400">({service.reviews} reviews)</span>
              </div>
            </div>
          </div>

          {/* Duration */}
          <div className="flex items-center gap-1.5 text-sm text-gray-500 mb-4">
            <Clock size={14} />
            <span>{service.duration}</span>
          </div>

          {/* Price Section */}
          <div className="flex items-baseline gap-2 mb-4">
            <span className="text-2xl font-bold text-gray-900">₹{service.price}</span>
            <span className="text-base text-gray-400 line-through">₹{originalPrice}</span>
            <span className="text-sm text-green-600 font-medium">
              {Math.round((1 - service.price / originalPrice) * 100)}% OFF
            </span>
          </div>

          {/* Description */}
          <p className="text-sm text-gray-600 leading-relaxed mb-5">
            {service.description}
          </p>

          {/* Process Steps */}
          {service.process && service.process.length > 0 && (
            <div className="mb-5">
              <h3 className="text-sm font-semibold text-gray-900 mb-2">Service includes:</h3>
              <ul className="space-y-1">
                {service.process.slice(0, 4).map((step: string, index: number) => (
                  <li key={index} className="flex items-start gap-2 text-sm text-gray-600">
                    <span className="text-green-500 mt-0.5">✓</span>
                    <span>{step}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* CTA Button */}
          <div className="pt-2 border-t border-gray-100">
            {isInCart ? (
// Stepper - Blue
            <div className="flex items-center justify-between h-12 bg-blue-50 border border-blue-200 rounded-xl px-2">
              <button
                onClick={() => onUpdateQty(-1)}
                className="flex items-center justify-center w-10 h-full text-blue-600 hover:bg-blue-100 rounded-lg transition-colors"
              >
                <Minus size={18} strokeWidth={2.5} />
              </button>
              <span className="flex items-center justify-center w-12 text-base font-bold text-gray-900">
                {quantity}
              </span>
              <button
                onClick={() => onUpdateQty(1)}
                className="flex items-center justify-center w-10 h-full text-blue-600 hover:bg-blue-100 rounded-lg transition-colors"
              >
                <Plus size={18} strokeWidth={2.5} />
              </button>
            </div>
          ) : (
            // Add Button - Blue
            <button
              onClick={onAdd}
              className="w-full h-12 bg-blue-500 hover:bg-blue-600 text-white font-semibold text-base rounded-xl transition-colors flex items-center justify-center gap-2"
              >
                Add to Cart
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
