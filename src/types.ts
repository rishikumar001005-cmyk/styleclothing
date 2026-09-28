export interface Color {
  name: string;
  hex: string;
}

export interface Review {
  id: string;
  productId: string;
  userId: string;
  userName: string;
  rating: number;
  comment: string;
  createdAt: string;
}

export interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  discount: number; 
  images: string[];
  section: 'men' | 'women' | 'kids' | 'accessories';
  category: string; 
  brand: string;
  rating: number;
  reviewsCount: number;
  sizes: string[]; 
  colors: Color[];
  stock: number;
  featured: boolean;
  createdAt: string;
  seoTitle?: string;
  seoDesc?: string;
  seoKeywords?: string;
}

export interface Address {
  id: string;
  fullName: string;
  street: string;
  city: string;
  state: string;
  zip: string;
  country: string;
  phone: string;
  isDefault: boolean;
}

export interface User {
  id: string;
  name: string;
  email: string;
  avatarUrl?: string;
  role: 'customer' | 'admin';
  addresses: Address[];
  createdAt: string;
  lastLoginAt?: string;
  loginCount?: number;
  totalOrders?: number;
  totalSpent?: number;
}

export interface LoginHistoryEntry {
  id: string;
  userId: string;
  userName: string;
  userEmail: string;
  role: 'customer' | 'admin';
  timestamp: string;
  status: 'Success' | 'Failed';
  method: 'Password' | 'OAuth' | 'Registration' | 'Quick Login';
  ipAddress?: string;
  device?: string;
}

export interface OrderItem {
  productId: string;
  name: string;
  price: number;
  quantity: number;
  image: string;
  selectedSize?: string;
  selectedColor?: Color;
}

export interface Order {
  id: string;
  userId: string;
  customerName: string;
  customerEmail: string;
  items: OrderItem[];
  total: number;
  subtotal: number;
  discountAmount: number;
  couponUsed?: string;
  shippingAddress: Address;
  paymentMethod: 'Stripe' | 'Razorpay' | 'Cash on Delivery';
  paymentStatus: 'Pending' | 'Paid' | 'Failed';
  status: 'Processing' | 'Shipped' | 'Delivered' | 'Cancelled';
  trackingNumber: string;
  createdAt: string;
}

export interface Coupon {
  code: string;
  discountType: 'percentage' | 'fixed';
  value: number;
  minOrderAmount: number;
  isActive: boolean;
  targetSection?: 'men' | 'women' | 'kids' | 'accessories' | 'all';
}

export interface Banner {
  id: string;
  title: string;
  subtitle: string;
  image: string;
  link: string;
  isActive: boolean;
}

export interface AnalyticsSummary {
  totalSales: number;
  totalOrders: number;
  totalProducts: number;
  totalCustomers: number;
  salesBySection: Record<string, number>;
  recentOrders: Order[];
}

export interface ContactInquiry {
  id: string;
  name: string;
  email: string;
  type: string;
  message: string;
  status: 'New' | 'Read' | 'Replied' | 'Archived';
  createdAt: string;
}
