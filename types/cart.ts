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