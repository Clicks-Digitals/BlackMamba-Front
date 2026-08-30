export type OrderStatus = "PENDING" | "CONFIRMED" | "SHIPPED" | "DELIVERED" | "CANCELLED";
export type PaymentStatus = "UNPAID" | "PAID" | "FAILED";

export type OrderBuildSnapshotPart = {
  slot: string;
  product_name: string;
  sku: string;
  unit_price: string;
};

export type OrderItem = {
  id: string;
  product_name: string;
  product_name_ar?: string;
  sku?: string;
  quantity: number;
  unit_price: string;
  total_price: string;
  // Set instead of product_details when this line item is a "Build Your PC" bundle —
  // an immutable snapshot of its parts at checkout time (see apps.orders.models.OrderItem).
  build?: string | null;
  build_snapshot?: OrderBuildSnapshotPart[] | null;
  product_details?: {
    id?: string;
    name?: string;
    name_ar?: string;
    thumbnail?: string;
    description?: string;
    description_ar?: string;
    base_price?: string;
    discount_price?: string;
    gallery?: Array<{ id: string; file: string; alt_text?: string }>;
  };
  variation_details?: {
    id: string;
    sku?: string;
    attribute_names?: string;
    image_url?: string;
    variation_price_display?: string;
  };
  combination_details?: {
    id: string;
    sku?: string;
    combination_price?: string;
    variations?: Array<{
      id: string;
      attribute: string;
      attribute_name: string;
      value: string;
      value_ar?: string;
    }>;
  };
};

export type Order = {
  id: string;
  order_number: string;
  status: OrderStatus;
  payment_method: string;
  payment_status: PaymentStatus;
  subtotal: string;
  shipping_cost: string;
  discount_amount: string;
  total_amount: string;
  currency_info: string | { code: string; symbol: string };
  shipping_address: {
    full_name: string;
    phone: string;
    address_line: string;
    city: string;
    state?: string;
  };
  shipping_option_details: {
    name: string;
    estimated_days_min: number;
    estimated_days_max: number;
  };
  coupon_code?: string;
  notes?: string;
  items: OrderItem[];
  created_at: string;
  updated_at: string;
};
