export interface SubService {
  id: string;
  name: string;
  description: string;
  price: number;
  duration: string;
  rating: number;
  reviews: number;
  image: string;
  process?: string[];
  categoryName: string;
}