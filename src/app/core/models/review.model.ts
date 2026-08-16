export interface Review {
  id: string;
  customer_name: string;
  customer_image?: string;
  rating: number; // 1-5
  message: string;
  product_name?: string;
  is_approved: boolean;
  created_at: string;
}
