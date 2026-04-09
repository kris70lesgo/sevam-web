export const CART_STORAGE_KEY = 'sevam_service_cart';
export const CHECKOUT_ADDRESS_STORAGE_KEY = 'sevam_checkout_address';

export type CartItem = {
  id: string;
  name: string;
  categoryName?: string;
  description?: string;
  duration?: string;
  image?: string;
  price: number;
  quantity: number;
};

export type CheckoutAddress = {
  id: string;
  label: string;
  line: string;
  eta: string;
};

export type CouponState = {
  code: string;
  discount: number;
};
