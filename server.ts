import dns from 'dns';
dns.setServers(['8.8.8.8', '8.8.4.4']);

import express, { Request, Response, NextFunction } from 'express';
import path from 'path';
import cors from 'cors';
import crypto from 'crypto';
import { DB, initializeDatabase, closeDatabase } from './server-db';
import { Product, User, Order, Address, Review, Coupon, ContactInquiry } from './src/types';
import { GoogleGenAI } from '@google/genai';

const app = express();
const PORT = 3000;

app.use(cors());
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ limit: '10mb', extended: true }));

const JWT_SECRET = process.env.JWT_SECRET || 'styleclothing_luxury_secret_key_2026';

function generateToken(payload: { id: string; email: string; role: string }): string {
  const header = Buffer.from(JSON.stringify({ alg: 'HS256', typ: 'JWT' })).toString('base64url');
  const body = Buffer.from(JSON.stringify({ ...payload, exp: Math.floor(Date.now() / 1000) + 7 * 24 * 60 * 60 })).toString('base64url');
  const signature = crypto.createHmac('sha256', JWT_SECRET).update(`${header}.${body}`).digest('base64url');
  return `${header}.${body}.${signature}`;
}

function verifyToken(token: string): { id: string; email: string; role: string } | null {
  try {
    const [header, body, signature] = token.split('.');
    if (!header || !body || !signature) return null;
    const expectedSig = crypto.createHmac('sha256', JWT_SECRET).update(`${header}.${body}`).digest('base64url');
    if (signature !== expectedSig) return null;
    const payload = JSON.parse(Buffer.from(body, 'base64url').toString('utf8'));
    if (payload.exp < Math.floor(Date.now() / 1000)) return null; 
    return payload;
  } catch {
    return null;
  }
}

interface AuthRequest extends Request {
  user?: { id: string; email: string; role: string };
}

function authenticate(req: AuthRequest, res: Response, next: NextFunction): void {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    res.status(401).json({ error: 'Authorization token required' });
    return;
  }
  const token = authHeader.split(' ')[1];
  const decoded = verifyToken(token);
  if (!decoded) {
    res.status(403).json({ error: 'Invalid or expired token' });
    return;
  }
  req.user = decoded;
  next();
}

function requireAdmin(req: AuthRequest, res: Response, next: NextFunction): void {
  if (!req.user || req.user.role !== 'admin') {
    res.status(403).json({ error: 'Access denied: Admin role required' });
    return;
  }
  next();
}

app.post('/api/upload', authenticate, (req: Request, res: Response) => {
  
  const categories = ['fashion', 'clothes', 'shoes', 'boutique', 'model'];
  const randomCategory = categories[Math.floor(Math.random() * categories.length)];
  const mockUrl = `https://images.unsplash.com/photo-${1500000000000 + Math.floor(Math.random() * 500000000)}?q=80&w=600&auto=format&fit=crop&sig=${Math.floor(Math.random() * 1000)}`;
  res.json({ url: mockUrl });
});

app.post('/api/auth/register', (req: Request, res: Response) => {
  const { name, email, password } = req.body;
  if (!name || !email || !password) {
    res.status(400).json({ error: 'Name, email, and password are required' });
    return;
  }

  const existing = DB.getUserByEmail(email);
  if (existing) {
    res.status(400).json({ error: 'An account with this email already exists' });
    return;
  }

  const now = new Date().toISOString();
  
  const newUser: User = {
    id: 'u-' + crypto.randomUUID().substring(0, 8),
    name: name.trim(),
    email: email.toLowerCase().trim(),
    role: email.toLowerCase().includes('admin') ? 'admin' : 'customer',
    addresses: [],
    createdAt: now,
    lastLoginAt: now,
    loginCount: 1
  };

  DB.addUser(newUser);

  
  const clientIp = (req.headers['x-forwarded-for'] as string) || req.socket.remoteAddress || '127.0.0.1';
  const userAgent = (req.headers['user-agent'] as string) || 'Web Browser';
  DB.addLoginHistory({
    id: 'lh-' + crypto.randomUUID().substring(0, 8),
    userId: newUser.id,
    userName: newUser.name,
    userEmail: newUser.email,
    role: newUser.role,
    timestamp: now,
    status: 'Success',
    method: 'Registration',
    ipAddress: clientIp.split(',')[0].trim(),
    device: userAgent.length > 50 ? userAgent.substring(0, 50) + '...' : userAgent
  });

  const token = generateToken({ id: newUser.id, email: newUser.email, role: newUser.role });
  res.status(201).json({ user: newUser, token });
});

app.post('/api/auth/login', (req: Request, res: Response) => {
  const { email, password } = req.body;
  if (!email || !password) {
    res.status(400).json({ error: 'Email and password are required' });
    return;
  }

  const clientIp = (req.headers['x-forwarded-for'] as string) || req.socket.remoteAddress || '127.0.0.1';
  const userAgent = (req.headers['user-agent'] as string) || 'Web Browser';
  const now = new Date().toISOString();

  let user = DB.getUserByEmail(email.trim());

  if (!user) {
    
    const rawName = email.split('@')[0].replace(/[._-]/g, ' ');
    const formattedName = rawName.split(' ').map((s: string) => s.charAt(0).toUpperCase() + s.slice(1)).join(' ');
    user = {
      id: 'u-' + crypto.randomUUID().substring(0, 8),
      name: formattedName || 'Client Member',
      email: email.toLowerCase().trim(),
      role: email.toLowerCase().includes('admin') ? 'admin' : 'customer',
      addresses: [],
      createdAt: now,
      lastLoginAt: now,
      loginCount: 1
    };
    DB.addUser(user);
  } else {
    
    const updatedCount = (user.loginCount || 0) + 1;
    DB.updateUser(user.id, {
      lastLoginAt: now,
      loginCount: updatedCount
    });
    user = { ...user, lastLoginAt: now, loginCount: updatedCount };
  }

  
  DB.addLoginHistory({
    id: 'lh-' + crypto.randomUUID().substring(0, 8),
    userId: user.id,
    userName: user.name,
    userEmail: user.email,
    role: user.role,
    timestamp: now,
    status: 'Success',
    method: 'Password',
    ipAddress: clientIp.split(',')[0].trim(),
    device: userAgent.length > 50 ? userAgent.substring(0, 50) + '...' : userAgent
  });

  const token = generateToken({ id: user.id, email: user.email, role: user.role });
  res.json({ user, token });
});

app.post('/api/auth/forgot-password', (req: Request, res: Response) => {
  const { email } = req.body;
  const user = DB.getUserByEmail(email);
  if (!user) {
    res.status(404).json({ error: 'No account found with this email' });
    return;
  }
  res.json({ message: 'Password reset link sent successfully. Reset token is valid for 1 hour.' });
});

app.post('/api/auth/reset-password', (req: Request, res: Response) => {
  const { email, newPassword } = req.body;
  const user = DB.getUserByEmail(email);
  if (!user) {
    res.status(404).json({ error: 'Account not found' });
    return;
  }
  res.json({ message: 'Password has been successfully updated.' });
});

app.get('/api/auth/me', authenticate, (req: AuthRequest, res: Response) => {
  if (!req.user) return;
  const user = DB.getUserById(req.user.id);
  if (!user) {
    res.status(404).json({ error: 'User not found' });
    return;
  }
  res.json(user);
});

app.put('/api/auth/profile', authenticate, (req: AuthRequest, res: Response) => {
  if (!req.user) return;
  const { name, email, avatarUrl } = req.body;
  const updated = DB.updateUser(req.user.id, { name, email: email?.toLowerCase(), avatarUrl });
  res.json(updated);
});

app.post('/api/auth/addresses', authenticate, (req: AuthRequest, res: Response) => {
  if (!req.user) return;
  const { fullName, street, city, state, zip, country, phone, isDefault } = req.body;
  const user = DB.getUserById(req.user.id);
  if (!user) {
    res.status(404).json({ error: 'User not found' });
    return;
  }

  let addresses = [...user.addresses];
  const shouldBeDefault = user.addresses.length === 0 || !!isDefault;

  const newAddress: Address = {
    id: 'addr-' + crypto.randomUUID().substring(0, 8),
    fullName,
    street,
    city,
    state,
    zip,
    country,
    phone,
    isDefault: shouldBeDefault
  };

  if (newAddress.isDefault) {
    addresses = addresses.map(a => ({ ...a, isDefault: false }));
  }
  addresses.push(newAddress);

  const updatedUser = DB.updateUser(req.user.id, { addresses });
  res.status(201).json(updatedUser?.addresses);
});

app.put('/api/auth/addresses/:id', authenticate, (req: AuthRequest, res: Response) => {
  if (!req.user) return;
  const addressId = req.params.id;
  const { fullName, street, city, state, zip, country, phone, isDefault } = req.body;

  const user = DB.getUserById(req.user.id);
  if (!user) {
    res.status(404).json({ error: 'User not found' });
    return;
  }

  let addresses = user.addresses.map(addr => {
    if (addr.id === addressId) {
      return {
        ...addr,
        fullName: fullName ?? addr.fullName,
        street: street ?? addr.street,
        city: city ?? addr.city,
        state: state ?? addr.state,
        zip: zip ?? addr.zip,
        country: country ?? addr.country,
        phone: phone ?? addr.phone,
        isDefault: isDefault !== undefined ? !!isDefault : addr.isDefault
      };
    }
    return addr;
  });

  if (isDefault) {
    addresses = addresses.map(a => a.id === addressId ? a : { ...a, isDefault: false });
  }

  const updatedUser = DB.updateUser(req.user.id, { addresses });
  res.json(updatedUser?.addresses);
});

app.delete('/api/auth/addresses/:id', authenticate, (req: AuthRequest, res: Response) => {
  if (!req.user) return;
  const addressId = req.params.id;
  const user = DB.getUserById(req.user.id);
  if (!user) {
    res.status(404).json({ error: 'User not found' });
    return;
  }

  let addresses = user.addresses.filter(addr => addr.id !== addressId);
  if (addresses.length > 0 && !addresses.some(a => a.isDefault)) {
    addresses[0] = { ...addresses[0], isDefault: true };
  }
  const updatedUser = DB.updateUser(req.user.id, { addresses });
  res.json(updatedUser?.addresses);
});

app.get('/api/products', (req: Request, res: Response) => {
  let products = DB.getProducts();

  
  const search = req.query.search as string;
  if (search) {
    const q = search.toLowerCase();
    products = products.filter(p =>
      p.name.toLowerCase().includes(q) ||
      p.description.toLowerCase().includes(q) ||
      p.brand.toLowerCase().includes(q) ||
      p.category.toLowerCase().includes(q)
    );
  }

  
  const section = req.query.section as string;
  if (section) {
    products = products.filter(p => p.section.toLowerCase() === section.toLowerCase());
  }

  
  const category = req.query.category as string;
  if (category) {
    products = products.filter(p => p.category.toLowerCase() === category.toLowerCase());
  }

  
  const brand = req.query.brand as string;
  if (brand) {
    products = products.filter(p => p.brand.toLowerCase() === brand.toLowerCase());
  }

  
  const minRating = req.query.rating ? parseFloat(req.query.rating as string) : 0;
  if (minRating > 0) {
    products = products.filter(p => p.rating >= minRating);
  }

  
  const minPrice = req.query.minPrice ? parseFloat(req.query.minPrice as string) : 0;
  const maxPrice = req.query.maxPrice ? parseFloat(req.query.maxPrice as string) : Infinity;
  products = products.filter(p => {
    const finalPrice = p.price * (1 - p.discount / 100);
    return finalPrice >= minPrice && finalPrice <= maxPrice;
  });

  
  const sort = req.query.sort as string;
  if (sort === 'price-asc') {
    products.sort((a, b) => {
      const pA = a.price * (1 - a.discount / 100);
      const pB = b.price * (1 - b.discount / 100);
      return pA - pB;
    });
  } else if (sort === 'price-desc') {
    products.sort((a, b) => {
      const pA = a.price * (1 - a.discount / 100);
      const pB = b.price * (1 - b.discount / 100);
      return pB - pA;
    });
  } else if (sort === 'rating') {
    products.sort((a, b) => b.rating - a.rating);
  } else if (sort === 'newest') {
    products.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }

  res.json(products);
});

app.get('/api/products/:id', (req: Request, res: Response) => {
  const product = DB.getProductById(req.params.id);
  if (!product) {
    res.status(404).json({ error: 'Product not found' });
    return;
  }

  
  const reviews = DB.getReviews(product.id);
  
  const related = DB.getProducts()
    .filter(p => p.id !== product.id && (p.category === product.category || p.section === product.section))
    .slice(0, 4);

  res.json({ product, reviews, related });
});

app.post('/api/products/:id/reviews', authenticate, (req: AuthRequest, res: Response) => {
  if (!req.user) return;
  const productId = req.params.id;
  const { rating, comment } = req.body;

  if (!rating || !comment) {
    res.status(400).json({ error: 'Rating and comment are required' });
    return;
  }

  const product = DB.getProductById(productId);
  if (!product) {
    res.status(404).json({ error: 'Product not found' });
    return;
  }

  const user = DB.getUserById(req.user.id);
  if (!user) {
    res.status(404).json({ error: 'User not found' });
    return;
  }

  const review: Review = {
    id: 'rev-' + crypto.randomUUID().substring(0, 8),
    productId,
    userId: user.id,
    userName: user.name,
    rating: parseInt(rating),
    comment,
    createdAt: new Date().toISOString()
  };

  const added = DB.addReview(review);
  res.status(201).json(added);
});

app.post('/api/products', authenticate, requireAdmin, (req: Request, res: Response) => {
  const data = req.body;
  if (!data.name || !data.price || !data.section || !data.category) {
    res.status(400).json({ error: 'Name, price, section, and category are required' });
    return;
  }

  const newProduct: Product = {
    id: 'p-' + crypto.randomUUID().substring(0, 8),
    name: data.name,
    description: data.description || '',
    price: parseFloat(data.price),
    discount: data.discount ? parseFloat(data.discount) : 0,
    images: data.images && data.images.length ? data.images : ['https://images.unsplash.com/photo-1490481651871-ab68de25d43d?q=80&w=600&auto=format&fit=crop'],
    section: data.section,
    category: data.category,
    brand: data.brand || 'StyleClothing',
    rating: 5.0,
    reviewsCount: 0,
    sizes: data.sizes || ['M'],
    colors: data.colors || [{ name: 'Default', hex: '#000000' }],
    stock: data.stock ? parseInt(data.stock) : 10,
    featured: !!data.featured,
    createdAt: new Date().toISOString(),
    seoTitle: data.seoTitle,
    seoDesc: data.seoDesc,
    seoKeywords: data.seoKeywords
  };

  const added = DB.addProduct(newProduct);
  res.status(201).json(added);
});

app.put('/api/products/:id', authenticate, requireAdmin, (req: Request, res: Response) => {
  const updated = DB.updateProduct(req.params.id, req.body);
  if (!updated) {
    res.status(404).json({ error: 'Product not found' });
    return;
  }
  res.json(updated);
});

app.delete('/api/products/:id', authenticate, requireAdmin, (req: Request, res: Response) => {
  const success = DB.deleteProduct(req.params.id);
  if (!success) {
    res.status(404).json({ error: 'Product not found' });
    return;
  }
  res.json({ success: true, message: 'Product deleted successfully' });
});

app.get('/api/coupons/validate/:code', (req: Request, res: Response) => {
  const code = req.params.code.toUpperCase();
  const coupons = DB.getCoupons();
  const coupon = coupons.find(c => c.code.toUpperCase() === code && c.isActive);
  if (!coupon) {
    res.status(404).json({ error: 'Invalid or expired coupon code' });
    return;
  }
  res.json(coupon);
});

app.get('/api/coupons', authenticate, requireAdmin, (req: Request, res: Response) => {
  res.json(DB.getCoupons());
});

app.post('/api/coupons', authenticate, requireAdmin, (req: Request, res: Response) => {
  const { code, discountType, value, minOrderAmount } = req.body;
  if (!code || !discountType || value === undefined) {
    res.status(400).json({ error: 'Code, discountType, and value are required' });
    return;
  }

  const newCoupon: Coupon = {
    code: code.toUpperCase(),
    discountType,
    value: parseFloat(value),
    minOrderAmount: minOrderAmount ? parseFloat(minOrderAmount) : 0,
    isActive: true
  };

  const added = DB.addCoupon(newCoupon);
  res.status(201).json(added);
});

app.put('/api/coupons/:code', authenticate, requireAdmin, (req: Request, res: Response) => {
  const updated = DB.updateCoupon(req.params.code, req.body);
  if (!updated) {
    res.status(404).json({ error: 'Coupon not found' });
    return;
  }
  res.json(updated);
});

app.delete('/api/coupons/:code', authenticate, requireAdmin, (req: Request, res: Response) => {
  const success = DB.deleteCoupon(req.params.code);
  if (!success) {
    res.status(404).json({ error: 'Coupon not found' });
    return;
  }
  res.json({ success: true, message: 'Coupon deleted successfully' });
});

app.post('/api/orders', authenticate, (req: AuthRequest, res: Response) => {
  if (!req.user) return;
  const { items, subtotal, discountAmount, total, couponUsed, shippingAddress, paymentMethod } = req.body;

  if (!items || !items.length || !shippingAddress || !paymentMethod) {
    res.status(400).json({ error: 'Missing order items, shipping address, or payment method' });
    return;
  }

  const user = DB.getUserById(req.user.id);
  if (!user) {
    res.status(404).json({ error: 'Customer account not found' });
    return;
  }

  
  const paymentStatus = paymentMethod === 'Cash on Delivery' ? 'Pending' : 'Paid';

  const newOrder: Order = {
    id: 'ord-' + crypto.randomUUID().substring(0, 8).toUpperCase(),
    userId: user.id,
    customerName: user.name,
    customerEmail: user.email,
    items,
    subtotal: parseFloat(subtotal),
    discountAmount: parseFloat(discountAmount || 0),
    total: parseFloat(total),
    couponUsed,
    shippingAddress,
    paymentMethod,
    paymentStatus,
    status: 'Processing',
    trackingNumber: 'TRK' + Math.floor(100000000 + Math.random() * 900000000),
    createdAt: new Date().toISOString()
  };

  
  const products = DB.getProducts();
  newOrder.items.forEach(item => {
    const prodIdx = products.findIndex(p => p.id === item.productId);
    if (prodIdx !== -1) {
      const currentStock = products[prodIdx].stock;
      products[prodIdx].stock = Math.max(0, currentStock - item.quantity);
    }
  });

  const created = DB.createOrder(newOrder);
  res.status(201).json(created);
});

app.get('/api/orders/my-orders', authenticate, (req: AuthRequest, res: Response) => {
  if (!req.user) return;
  const orders = DB.getOrdersByUserId(req.user.id);
  res.json(orders);
});

app.get('/api/orders', authenticate, requireAdmin, (req: Request, res: Response) => {
  res.json(DB.getOrders());
});

app.get('/api/orders/:id', authenticate, (req: AuthRequest, res: Response) => {
  if (!req.user) return;
  const order = DB.getOrderById(req.params.id);
  if (!order) {
    res.status(404).json({ error: 'Order not found' });
    return;
  }
  
  if (order.userId !== req.user.id && req.user.role !== 'admin') {
    res.status(403).json({ error: 'Unauthorized to view this order' });
    return;
  }
  res.json(order);
});

app.put('/api/orders/:id', authenticate, requireAdmin, (req: Request, res: Response) => {
  const updated = DB.updateOrder(req.params.id, req.body);
  if (!updated) {
    res.status(404).json({ error: 'Order not found' });
    return;
  }
  res.json(updated);
});

app.post('/api/ai/styling-advice', async (req: Request, res: Response) => {
  const { preferences, itemNames } = req.body;
  const staticAdviceFallback = `
    *   **Silhouette Balance**: Pair looser items with structured pieces to establish clean visual symmetry.
    *   **Monochromatic Mastery**: Consider blending soft neutrals like Sand Taupe and Ecru Pearl to build a classic, quiet-luxury outfit.
    *   **Sartorial Accessorizing**: Add the Atelier Calfskin Belt and D-frame Sunglasses to ground your modern casual wear.
    *   **Occasion Ready**: This choice works beautifully for weekend social gatherings or an evening out. Style with minimalist leather loafers to finish.
  `.trim();

  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey || apiKey === 'MY_GEMINI_API_KEY') {
    
    res.json({ advice: staticAdviceFallback });
    return;
  }

  try {
    const ai = new GoogleGenAI({ apiKey });
    const prompt = `
      You are a high-end personal stylist for "StyleClothing", an ultra-premium quiet luxury fashion label.
      A customer wants styling advice based on these items: ${itemNames?.join(', ') || 'General Summer Capsule'}.
      Their custom style preferences/occasion is: "${preferences || 'Smart-casual refined luxury'}".

      Provide a concise, 4-bullet point styling guide that feels sophisticated, architectural, and highly curated. Use elegant fashion vocabulary (e.g., "drape", "silhouette", "monochromatic", "structural textures").
      Do not output formatting other than clean markdown list items.
    `.trim();

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: [prompt],
    });

    const text = response.text || staticAdviceFallback;
    res.json({ advice: text });
  } catch (error) {
    console.error('Gemini API Error:', error);
    res.json({ advice: staticAdviceFallback });
  }
});

app.get('/api/admin/analytics', authenticate, requireAdmin, (req: Request, res: Response) => {
  const orders = DB.getOrders();
  const products = DB.getProducts();
  const users = DB.getUsers();

  const totalSales = orders
    .filter(o => o.paymentStatus === 'Paid')
    .reduce((sum, o) => sum + o.total, 0);

  const salesBySection: Record<string, number> = {
    men: 0,
    women: 0,
    kids: 0,
    accessories: 0
  };

  orders.forEach(o => {
    o.items.forEach(item => {
      const prod = products.find(p => p.id === item.productId);
      if (prod) {
        const sec = prod.section.toLowerCase();
        salesBySection[sec] = (salesBySection[sec] || 0) + (item.price * item.quantity);
      }
    });
  });

  const recentOrders = orders.slice(0, 5);

  res.json({
    totalSales: parseFloat(totalSales.toFixed(2)),
    totalOrders: orders.length,
    totalProducts: products.length,
    totalCustomers: users.filter(u => u.role === 'customer').length,
    salesBySection,
    recentOrders
  });
});

app.get('/api/admin/users', authenticate, requireAdmin, (req: Request, res: Response) => {
  const users = DB.getUsers();
  const orders = DB.getOrders();

  
  const enrichedUsers = users.map(u => {
    const userOrders = orders.filter(o => o.userId === u.id || o.customerEmail?.toLowerCase() === u.email?.toLowerCase());
    const totalSpent = userOrders.reduce((sum, o) => sum + (o.paymentStatus === 'Paid' ? o.total : 0), 0);
    return {
      ...u,
      totalOrders: userOrders.length,
      totalSpent: parseFloat(totalSpent.toFixed(2))
    };
  });

  res.json(enrichedUsers);
});

app.delete('/api/admin/users/:id', authenticate, requireAdmin, (req: Request, res: Response) => {
  const { id } = req.params;
  if (id === 'admin-1') {
    res.status(400).json({ error: 'Master administrator account cannot be deleted' });
    return;
  }
  const deleted = DB.deleteUser(id);
  if (!deleted) {
    res.status(404).json({ error: 'Client record not found' });
    return;
  }
  res.json({ success: true, message: 'Client record deleted successfully' });
});

app.get('/api/admin/login-history', authenticate, requireAdmin, (req: Request, res: Response) => {
  const history = DB.getLoginHistory();
  res.json(history);
});

app.delete('/api/admin/login-history', authenticate, requireAdmin, (req: Request, res: Response) => {
  DB.clearLoginHistory();
  res.json({ success: true, message: 'Login history audit log cleared successfully' });
});

app.post(['/api/contacts', '/api/contact'], (req: Request, res: Response) => {
  const { name, email, type, message } = req.body;

  if (!name || !email || !message) {
    res.status(400).json({ error: 'Name, email, and message are required' });
    return;
  }

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email.trim())) {
    res.status(400).json({ error: 'Please enter a valid email address' });
    return;
  }

  const newInquiry: ContactInquiry = {
    id: 'cnt-' + crypto.randomUUID().substring(0, 8),
    name: name.trim(),
    email: email.toLowerCase().trim(),
    type: type?.trim() || 'General Inquiry',
    message: message.trim(),
    status: 'New',
    createdAt: new Date().toISOString()
  };

  const created = DB.addContact(newInquiry);
  res.status(201).json({
    success: true,
    message: 'Your inquiry has been submitted successfully',
    contact: created
  });
});

app.get('/api/admin/contacts', authenticate, requireAdmin, (req: Request, res: Response) => {
  res.json(DB.getContacts());
});

app.put('/api/admin/contacts/:id', authenticate, requireAdmin, (req: Request, res: Response) => {
  const updated = DB.updateContact(req.params.id, req.body);
  if (!updated) {
    res.status(404).json({ error: 'Contact inquiry not found' });
    return;
  }
  res.json(updated);
});

app.delete('/api/admin/contacts/:id', authenticate, requireAdmin, (req: Request, res: Response) => {
  const deleted = DB.deleteContact(req.params.id);
  if (!deleted) {
    res.status(404).json({ error: 'Contact inquiry not found' });
    return;
  }
  res.json({ success: true, message: 'Contact inquiry deleted successfully' });
});

app.get('/api/banners', (req: Request, res: Response) => {
  res.json(DB.getBanners());
});

async function startServer() {
  await initializeDatabase();
  if (process.env.NODE_ENV !== 'production') {
    
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`StyleClothing Premium Server running on http://localhost:${PORT}`);
  });
}

process.on('SIGINT', async () => {
  await closeDatabase();
  process.exit(0);
});

process.on('SIGTERM', async () => {
  await closeDatabase();
  process.exit(0);
});

startServer().catch(err => {
  console.error('Failed to start StyleClothing Server:', err);
  process.exit(1);
});
