import { Product, User, Order, Address, Review, Coupon, Banner, AnalyticsSummary, LoginHistoryEntry, ContactInquiry } from './types';

const API_BASE = '/api';

function getHeaders() {
  const token = localStorage.getItem('styleclothing_token');
  return {
    'Content-Type': 'application/json',
    ...(token ? { 'Authorization': `Bearer ${token}` } : {})
  };
}

async function handleResponse(res: Response) {
  let data;
  const contentType = res.headers.get('content-type');
  if (contentType && contentType.includes('application/json')) {
    data = await res.json();
  } else {
    const text = await res.text();
    if (!res.ok) {
      throw new Error(`Server error (${res.status}): ${text.substring(0, 100)}`);
    }
    try {
      data = JSON.parse(text);
    } catch {
      throw new Error(`Invalid API response format: expected JSON, received (${contentType || 'non-json'}). Content snippet: ${text.substring(0, 100)}`);
    }
  }
  if (!res.ok) {
    throw new Error(data?.error || data?.message || 'Something went wrong');
  }
  return data;
}

export const clientAPI = {
  
  async register(name: string, email: string, password: string): Promise<{ user: User; token: string }> {
    const res = await fetch(`${API_BASE}/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name, email, password })
    });
    const data = await handleResponse(res);
    localStorage.setItem('styleclothing_token', data.token);
    return data;
  },

  async login(email: string, password: string): Promise<{ user: User; token: string }> {
    const res = await fetch(`${API_BASE}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password })
    });
    const data = await handleResponse(res);
    localStorage.setItem('styleclothing_token', data.token);
    return data;
  },

  logout() {
    localStorage.removeItem('styleclothing_token');
  },

  async getMe(): Promise<any> {
    const res = await fetch(`${API_BASE}/auth/me`, {
      headers: getHeaders()
    });
    return handleResponse(res);
  },

  async updateProfile(name: string, email: string, avatarUrl?: string): Promise<User> {
    const res = await fetch(`${API_BASE}/auth/profile`, {
      method: 'PUT',
      headers: getHeaders(),
      body: JSON.stringify({ name, email, avatarUrl })
    });
    return handleResponse(res);
  },

  
  async getAddresses(): Promise<Address[]> {
    const res = await fetch(`${API_BASE}/auth/addresses`, {
      headers: getHeaders()
    });
    return handleResponse(res);
  },

  async addAddress(addr: Omit<Address, 'id'>): Promise<Address[]> {
    const res = await fetch(`${API_BASE}/auth/addresses`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify(addr)
    });
    return handleResponse(res);
  },

  async updateAddress(id: string, addr: Partial<Address>): Promise<Address[]> {
    const res = await fetch(`${API_BASE}/auth/addresses/${id}`, {
      method: 'PUT',
      headers: getHeaders(),
      body: JSON.stringify(addr)
    });
    return handleResponse(res);
  },

  async deleteAddress(id: string): Promise<Address[]> {
    const res = await fetch(`${API_BASE}/auth/addresses/${id}`, {
      method: 'DELETE',
      headers: getHeaders()
    });
    return handleResponse(res);
  },

  
  async getProducts(params?: {
    search?: string;
    section?: string;
    category?: string;
    brand?: string;
    rating?: number;
    minPrice?: number;
    maxPrice?: number;
    sort?: string;
  }): Promise<Product[]> {
    const url = new URL(`${window.location.origin}${API_BASE}/products`);
    if (params) {
      Object.entries(params).forEach(([key, val]) => {
        if (val !== undefined && val !== '') {
          url.searchParams.append(key, String(val));
        }
      });
    }
    const res = await fetch(url.toString());
    const data = await handleResponse(res);

    console.log("[Runtime Debug] GET /api/products response:", data);
    console.log("[Runtime Debug] Is Array:", Array.isArray(data));

    if (Array.isArray(data)) {
      return data;
    } else if (data && Array.isArray(data.products)) {
      return data.products;
    } else if (data && Array.isArray(data.data)) {
      return data.data;
    } else {
      console.error('[Runtime Error] getProducts received non-array data from API:', data);
      throw new Error('API response for products is not an array');
    }
  },

  async getProduct(id: string): Promise<{ product: Product; reviews: Review[]; related: Product[] }> {
    const res = await fetch(`${API_BASE}/products/${id}`);
    return handleResponse(res);
  },

  async addReview(productId: string, rating: number, comment: string): Promise<Review> {
    const res = await fetch(`${API_BASE}/products/${productId}/reviews`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify({ rating, comment })
    });
    return handleResponse(res);
  },

  
  async adminAddProduct(prod: Omit<Product, 'id' | 'rating' | 'reviewsCount' | 'createdAt'>): Promise<Product> {
    const res = await fetch(`${API_BASE}/products`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify(prod)
    });
    return handleResponse(res);
  },

  async adminUpdateProduct(id: string, prod: Partial<Product>): Promise<Product> {
    const res = await fetch(`${API_BASE}/products/${id}`, {
      method: 'PUT',
      headers: getHeaders(),
      body: JSON.stringify(prod)
    });
    return handleResponse(res);
  },

  async adminDeleteProduct(id: string): Promise<{ success: boolean; message: string }> {
    const res = await fetch(`${API_BASE}/products/${id}`, {
      method: 'DELETE',
      headers: getHeaders()
    });
    return handleResponse(res);
  },

  
  async validateCoupon(code: string): Promise<Coupon> {
    const res = await fetch(`${API_BASE}/coupons/validate/${code}`);
    return handleResponse(res);
  },

  async getCoupons(): Promise<Coupon[]> {
    const res = await fetch(`${API_BASE}/coupons`, {
      headers: getHeaders()
    });
    return handleResponse(res);
  },

  async addCoupon(coupon: Coupon): Promise<Coupon> {
    const res = await fetch(`${API_BASE}/coupons`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify(coupon)
    });
    return handleResponse(res);
  },

  async deleteCoupon(code: string): Promise<{ success: boolean }> {
    const res = await fetch(`${API_BASE}/coupons/${code}`, {
      method: 'DELETE',
      headers: getHeaders()
    });
    return handleResponse(res);
  },

  
  async createOrder(orderData: any): Promise<Order> {
    const res = await fetch(`${API_BASE}/orders`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify(orderData)
    });
    return handleResponse(res);
  },

  async getMyOrders(): Promise<Order[]> {
    const res = await fetch(`${API_BASE}/orders/my-orders`, {
      headers: getHeaders()
    });
    return handleResponse(res);
  },

  async getOrder(id: string): Promise<Order> {
    const res = await fetch(`${API_BASE}/orders/${id}`, {
      headers: getHeaders()
    });
    return handleResponse(res);
  },

  async adminGetOrders(): Promise<Order[]> {
    const res = await fetch(`${API_BASE}/orders`, {
      headers: getHeaders()
    });
    return handleResponse(res);
  },

  async adminUpdateOrder(id: string, updatedFields: Partial<Order>): Promise<Order> {
    const res = await fetch(`${API_BASE}/orders/${id}`, {
      method: 'PUT',
      headers: getHeaders(),
      body: JSON.stringify(updatedFields)
    });
    return handleResponse(res);
  },

  
  async getStylingAdvice(itemNames: string[], preferences: string): Promise<string> {
    const res = await fetch(`${API_BASE}/ai/styling-advice`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ itemNames, preferences })
    });
    const data = await handleResponse(res);
    return data.advice;
  },

  
  async adminGetAnalytics(): Promise<AnalyticsSummary> {
    const res = await fetch(`${API_BASE}/admin/analytics`, {
      headers: getHeaders()
    });
    return handleResponse(res);
  },

  
  async adminGetUsers(): Promise<User[]> {
    const res = await fetch(`${API_BASE}/admin/users`, {
      headers: getHeaders()
    });
    const data = await handleResponse(res);
    return Array.isArray(data) ? data : [];
  },

  async adminDeleteUser(id: string): Promise<{ success: boolean; message: string }> {
    const res = await fetch(`${API_BASE}/admin/users/${id}`, {
      method: 'DELETE',
      headers: getHeaders()
    });
    return handleResponse(res);
  },

  async adminGetLoginHistory(): Promise<LoginHistoryEntry[]> {
    const res = await fetch(`${API_BASE}/admin/login-history`, {
      headers: getHeaders()
    });
    const data = await handleResponse(res);
    return Array.isArray(data) ? data : [];
  },

  async adminClearLoginHistory(): Promise<{ success: boolean; message: string }> {
    const res = await fetch(`${API_BASE}/admin/login-history`, {
      method: 'DELETE',
      headers: getHeaders()
    });
    return handleResponse(res);
  },

  
  async getBanners(): Promise<Banner[]> {
    const res = await fetch(`${API_BASE}/banners`);
    const data = await handleResponse(res);
    if (Array.isArray(data)) {
      return data;
    } else if (data && Array.isArray(data.banners)) {
      return data.banners;
    } else if (data && Array.isArray(data.data)) {
      return data.data;
    }
    return [];
  },

  
  async submitContact(data: { name: string; email: string; type?: string; message: string }): Promise<{ success: boolean; message: string; contact: ContactInquiry }> {
    const res = await fetch(`${API_BASE}/contacts`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });
    return handleResponse(res);
  },

  async adminGetContacts(): Promise<ContactInquiry[]> {
    const res = await fetch(`${API_BASE}/admin/contacts`, {
      headers: getHeaders()
    });
    const data = await handleResponse(res);
    return Array.isArray(data) ? data : [];
  },

  async adminUpdateContact(id: string, updated: Partial<ContactInquiry>): Promise<ContactInquiry> {
    const res = await fetch(`${API_BASE}/admin/contacts/${id}`, {
      method: 'PUT',
      headers: getHeaders(),
      body: JSON.stringify(updated)
    });
    return handleResponse(res);
  },

  async adminDeleteContact(id: string): Promise<{ success: boolean; message: string }> {
    const res = await fetch(`${API_BASE}/admin/contacts/${id}`, {
      method: 'DELETE',
      headers: getHeaders()
    });
    return handleResponse(res);
  }
};
