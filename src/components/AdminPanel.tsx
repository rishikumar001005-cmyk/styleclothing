import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { Shield, LayoutDashboard, Shirt, ShoppingCart, Tag, MessageSquare, Image, Users, Plus, Edit2, Trash2, CheckCircle2, TrendingUp, AlertCircle, X, Check, History, Search, RotateCcw, UserCheck, Clock, Laptop, ShieldCheck } from 'lucide-react';
import { clientAPI } from '../api';
import { Product, Order, User, Coupon, Review, Banner, AnalyticsSummary, LoginHistoryEntry, ContactInquiry } from '../types';

const adminAvatarImg = 'src/assets/admin1.png';

export const SECTION_CATEGORIES: Record<'men' | 'women' | 'kids' | 'accessories', string[]> = {
  men: [
    'Topwear',
    'Bottomwear',
    'Footwear',
    'Winterwear',
    'Ethnic Wear',
    'Outerwear',
  ],
  women: [
    'Topwear',
    'Bottomwear',
    'Dresses',
    'Footwear',
    'Winterwear',
    'Ethnic Wear',
    'Outerwear',
  ],
  kids: [
    'Baby',
    'Boys',
    'Girls',
    'Dresses',
    'Topwear',
    'Sets',
    'Outerwear',
    'Footwear',
  ],
  accessories: [
    'Watches',
    'Jewelry',
    'Belts',
    'Sunglasses',
    'Hats',
    'Scarves',
    'Bags',
    'Wallets',
  ],
};

interface AdminPanelProps {
  onBackToStore: () => void;
  currentUser: any;
}

export default function AdminPanel({ onBackToStore, currentUser }: AdminPanelProps) {

  const [activeTab, setActiveTab] = useState<'analytics' | 'products' | 'orders' | 'customers' | 'coupons' | 'reviews' | 'inquiries'>('analytics');
  const [analytics, setAnalytics] = useState<AnalyticsSummary | null>(null);

  const [products, setProducts] = useState<Product[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [customers, setCustomers] = useState<User[]>([]);
  const [loginHistory, setLoginHistory] = useState<LoginHistoryEntry[]>([]);
  const [coupons, setCoupons] = useState<Coupon[]>([]);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [inquiries, setInquiries] = useState<ContactInquiry[]>([]);

  const [customerSubTab, setCustomerSubTab] = useState<'clients' | 'history'>('clients');
  const [clientSearchQuery, setClientSearchQuery] = useState('');
  const [clientRoleFilter, setClientRoleFilter] = useState<'all' | 'customer' | 'admin'>('all');
  const [deletingClientId, setDeletingClientId] = useState<string | null>(null);

  const [inquirySearchQuery, setInquirySearchQuery] = useState('');
  const [inquiryStatusFilter, setInquiryStatusFilter] = useState<string>('all');
  const [inquiryDepartmentFilter, setInquiryDepartmentFilter] = useState<string>('all');
  const [deletingInquiryId, setDeletingInquiryId] = useState<string | null>(null);

  const [loading, setLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);

  const [prodFormOpen, setProdFormOpen] = useState(false);
  const [editingProdId, setEditingProdId] = useState<string | null>(null);
  const [prodName, setProdName] = useState('');
  const [prodDesc, setProdDesc] = useState('');
  const [prodPrice, setProdPrice] = useState('100');
  const [prodDiscount, setProdDiscount] = useState('0');
  const [prodSection, setProdSection] = useState<'men' | 'women' | 'kids' | 'accessories'>('men');
  const [prodCategory, setProdCategory] = useState('Topwear');
  const [prodBrand, setProdBrand] = useState('STYLE CLOTH');
  const [prodStock, setProdStock] = useState('10');
  const [prodFeatured, setProdFeatured] = useState(false);
  const [prodImage, setProdImage] = useState('');
  const [prodImage2, setProdImage2] = useState('');
  const [prodImage3, setProdImage3] = useState('');
  
  const [prodSeoTitle, setProdSeoTitle] = useState('');
  const [prodSeoDesc, setProdSeoDesc] = useState('');
  const [prodSeoKeywords, setProdSeoKeywords] = useState('');

  const [prodSizes, setProdSizes] = useState<string[]>(['M']);
  const [prodColorName, setProdColorName] = useState('Black');
  const [prodColorHex, setProdColorHex] = useState('#000000');

  const [coupFormOpen, setCoupFormOpen] = useState(false);
  const [coupCode, setCoupCode] = useState('');
  const [coupType, setCoupType] = useState<'percentage' | 'fixed'>('percentage');
  const [coupValue, setCoupValue] = useState('10');
  const [coupMinAmount, setCoupMinAmount] = useState('100');

  useEffect(() => {
    fetchAdminData();
  }, [activeTab]);

  const fetchAdminData = async () => {
    setLoading(true);
    try {
      if (activeTab === 'analytics') {
        const stats = await clientAPI.adminGetAnalytics();
        setAnalytics(stats);
      } else if (activeTab === 'products') {
        const prods = await clientAPI.getProducts();
        setProducts(Array.isArray(prods) ? prods : []);
      } else if (activeTab === 'orders') {
        const ords = await clientAPI.adminGetOrders();
        setOrders(ords);
      } else if (activeTab === 'customers') {
        try {
          const [usersList, historyList] = await Promise.all([
            clientAPI.adminGetUsers(),
            clientAPI.adminGetLoginHistory()
          ]);
          setCustomers(Array.isArray(usersList) ? usersList : []);
          setLoginHistory(Array.isArray(historyList) ? historyList : []);
        } catch (fetchErr) {
          console.error('Error fetching admin customers & login history:', fetchErr);
          // Fallback
          const usersRes = await fetch('/api/admin/users', { headers: { 'Authorization': `Bearer ${localStorage.getItem('styleclothing_token')}` } });
          if (usersRes.ok) {
            const uData = await usersRes.json();
            setCustomers(Array.isArray(uData) ? uData : []);
          }
        }
      } else if (activeTab === 'inquiries') {
        const inqs = await clientAPI.adminGetContacts();
        setInquiries(Array.isArray(inqs) ? inqs : []);
      } else if (activeTab === 'coupons') {
        const coups = await clientAPI.getCoupons();
        setCoupons(coups);
      } else if (activeTab === 'reviews') {
        const revsRes = await fetch('/api/products');
        const prods = await revsRes.json();
        const allReviews: Review[] = [];
        const rRes = await fetch('/api/products/p-m1');
        const d1 = await rRes.json();
        if (d1?.reviews) allReviews.push(...d1.reviews);
        setReviews(allReviews);
      }
    } catch (err) {
      console.error('Error loading admin tab data:', err);
    } finally {
      setLoading(false);
      setIsRefreshing(false);
    }
  };

  const handleRefreshCustomers = () => {
    setIsRefreshing(true);
    fetchAdminData();
  };

  const handleDeleteClient = async (id: string, name: string) => {
    if (id === 'admin-1') {
      alert('Primary administrator account cannot be deleted.');
      return;
    }
    try {
      setDeletingClientId(null);
      // Optimistic update
      setCustomers(prev => prev.filter(u => u.id !== id));
      await clientAPI.adminDeleteUser(id);
      fetchAdminData();
    } catch (err: any) {
      console.error('Error deleting client record:', err);
      alert(err.message || 'Error deleting client record.');
      fetchAdminData();
    }
  };

  const handleClearLoginHistory = async () => {
    if (!confirm('Are you sure you want to clear the entire login history audit log?')) return;
    try {
      await clientAPI.adminClearLoginHistory();
      setLoginHistory([]);
      alert('Login history audit log has been cleared.');
    } catch (err: any) {
      alert(err.message || 'Error clearing login history.');
    }
  };

  const handleProductSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const imgsList = [prodImage || 'https://images.unsplash.com/photo-1490481651871-ab68de25d43d?q=80&w=600&auto=format&fit=crop'];
    if (prodImage2) imgsList.push(prodImage2);
    if (prodImage3) imgsList.push(prodImage3);

    const productPayload = {
      name: prodName,
      description: prodDesc,
      price: parseFloat(prodPrice),
      discount: parseFloat(prodDiscount),
      images: imgsList,
      section: prodSection,
      category: prodCategory,
      brand: prodBrand,
      sizes: prodSizes,
      colors: [{ name: prodColorName, hex: prodColorHex }],
      stock: parseInt(prodStock),
      featured: prodFeatured,
      seoTitle: prodSeoTitle || prodName,
      seoDesc: prodSeoDesc || prodDesc,
      seoKeywords: prodSeoKeywords || `${prodName}, luxury ${prodCategory}`
    };

    try {
      if (editingProdId) {
        await clientAPI.adminUpdateProduct(editingProdId, productPayload);
        alert('Product updated successfully!');
      } else {
        await clientAPI.adminAddProduct(productPayload);
        alert('Product created successfully!');
      }
      resetProductForm();
      fetchAdminData();
    } catch (err: any) {
      alert(err.message || 'Error processing product transaction.');
    }
  };

  const handleEditProduct = (p: Product) => {
    setEditingProdId(p.id);
    setProdName(p.name);
    setProdDesc(p.description);
    setProdPrice(String(p.price));
    setProdDiscount(String(p.discount));
    setProdSection(p.section);
    setProdCategory(p.category);
    setProdBrand(p.brand);
    setProdStock(String(p.stock));
    setProdFeatured(p.featured);
    setProdImage(p.images[0] || '');
    setProdImage2(p.images[1] || '');
    setProdImage3(p.images[2] || '');
    setProdSizes(p.sizes);
    setProdColorName(p.colors[0]?.name || 'Black');
    setProdColorHex(p.colors[0]?.hex || '#000000');
    setProdSeoTitle(p.seoTitle || '');
    setProdSeoDesc(p.seoDesc || '');
    setProdSeoKeywords(p.seoKeywords || '');
    setProdFormOpen(true);
  };

  const handleDeleteProduct = async (id: string) => {
    if (!confirm('Are you sure you want to delete this product?')) return;
    try {
      await clientAPI.adminDeleteProduct(id);
      fetchAdminData();
    } catch (err: any) {
      alert(err.message || 'Error deleting product.');
    }
  };

  const resetProductForm = () => {
    setProdFormOpen(false);
    setEditingProdId(null);
    setProdName('');
    setProdDesc('');
    setProdPrice('100');
    setProdDiscount('0');
    setProdSection('men');
    setProdCategory('Topwear');
    setProdBrand('STYLE CLOTH');
    setProdStock('10');
    setProdFeatured(false);
    setProdImage('');
    setProdImage2('');
    setProdImage3('');
    setProdSizes(['M']);
    setProdColorName('Black');
    setProdColorHex('#000000');
    setProdSeoTitle('');
    setProdSeoDesc('');
    setProdSeoKeywords('');
  };

  const toggleSize = (size: string) => {
    setProdSizes((prev) =>
      prev.includes(size) ? prev.filter((s) => s !== size) : [...prev, size]
    );
  };

  const handleCouponSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const coupPayload = {
      code: coupCode.toUpperCase(),
      discountType: coupType,
      value: parseFloat(coupValue),
      minOrderAmount: parseFloat(coupMinAmount),
      isActive: true
    };

    try {
      await clientAPI.addCoupon(coupPayload);
      setCoupFormOpen(false);
      setCoupCode('');
      fetchAdminData();
      alert('Coupon created successfully!');
    } catch (err: any) {
      alert(err.message || 'Error saving coupon code.');
    }
  };

  const handleDeleteCoupon = async (code: string) => {
    if (!confirm(`Are you sure you want to delete coupon ${code}?`)) return;
    try {
      await clientAPI.deleteCoupon(code);
      fetchAdminData();
    } catch (err: any) {
      alert(err.message || 'Error deleting coupon.');
    }
  };

  const handleUpdateOrderStatus = async (orderId: string, status: any) => {
    try {
      await clientAPI.adminUpdateOrder(orderId, { status });
      fetchAdminData();
      alert(`Order ${orderId} updated to ${status}.`);
    } catch (err: any) {
      alert(err.message);
    }
  };

  const handleUpdateOrderPaymentStatus = async (orderId: string, paymentStatus: any) => {
    try {
      await clientAPI.adminUpdateOrder(orderId, { paymentStatus });
      fetchAdminData();
      alert(`Order ${orderId} payment updated to ${paymentStatus}.`);
    } catch (err: any) {
      alert(err.message);
    }
  };

  const handleUpdateInquiryStatus = async (id: string, status: any) => {
    try {
      setInquiries(prev => prev.map(inq => inq.id === id ? { ...inq, status } : inq));
      await clientAPI.adminUpdateContact(id, { status });
    } catch (err: any) {
      alert(err.message || 'Error updating inquiry status');
      fetchAdminData();
    }
  };

  const handleDeleteInquiry = async (id: string) => {
    try {
      setDeletingInquiryId(null);
      setInquiries(prev => prev.filter(inq => inq.id !== id));
      await clientAPI.adminDeleteContact(id);
    } catch (err: any) {
      alert(err.message || 'Error deleting inquiry');
      fetchAdminData();
    }
  };

  return (
    <div className="min-h-screen bg-[#fafafa] text-neutral-900 flex flex-col font-sans">
      <header className="border-b border-neutral-200 py-5 px-6 flex items-center justify-between bg-white">
        <div className="flex items-center space-x-3 text-neutral-900">
          <div className="relative shrink-0">
            <img
              src={currentUser?.avatarUrl || adminAvatarImg}
              alt={currentUser?.name || 'Administrator'}
              className="w-10 h-10 rounded-full object-cover border border-neutral-300 shadow-sm"
              referrerPolicy="no-referrer"
            />
            <span
              className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-emerald-500 border-2 border-white rounded-full"
              title="Active Administrator"
            />
          </div>
          <div>
            <h1 className="font-display text-base tracking-[0.25em] font-bold text-neutral-900 leading-tight">
              STYLECLOTHING ADMIN
            </h1>
            <p className="text-[10px] tracking-wider font-mono text-neutral-500">ADMIN CONTROL PANEL</p>
          </div>
        </div>

        <button
          onClick={onBackToStore}
          className="px-4 py-2 border border-neutral-200 hover:border-neutral-400 text-neutral-700 hover:text-neutral-950 text-[10px] font-bold uppercase tracking-widest transition-all cursor-pointer bg-white focus:outline-none"
        >
          Exit Panel
        </button>
      </header>

      <div className="flex-1 flex flex-col md:flex-row">
        {/* Navigation Sidebar */}
        <aside className="w-full md:w-64 border-r border-neutral-200 bg-white p-6 flex flex-col justify-between">
          <div className="space-y-6">
            <p className="text-[9px] font-bold tracking-[0.25em] text-neutral-450 uppercase">
              Operational Ledger
            </p>

            <nav className="space-y-1">
              {[
                { key: 'analytics', label: 'Dashboard & Metrics', icon: LayoutDashboard },
                { key: 'products', label: 'Product Inventory', icon: Shirt },
                { key: 'orders', label: 'Customer Orders', icon: ShoppingCart },
                { key: 'customers', label: 'Registered Users', icon: Users },
                { key: 'inquiries', label: 'Contact Inquiries', icon: MessageSquare },
              ].map((tab) => {
                const Icon = tab.icon;
                return (
                  <button
                    key={tab.key}
                    onClick={() => setActiveTab(tab.key as any)}
                    className={`w-full text-left px-4 py-3 text-xs font-semibold rounded transition-all flex items-center space-x-3 cursor-pointer focus:outline-none ${
                      activeTab === tab.key
                        ? 'bg-neutral-900 text-white shadow-none'
                        : 'text-neutral-500 hover:bg-neutral-100 hover:text-neutral-900'
                    }`}
                  >
                    <Icon className="w-4 h-4" />
                    <span>{tab.label}</span>
                    {tab.key === 'inquiries' && inquiries.filter(i => i.status === 'New').length > 0 && (
                      <span className="ml-auto bg-red-500 text-white text-[9px] font-bold px-1.5 py-0.5 rounded-full">
                        {inquiries.filter(i => i.status === 'New').length}
                      </span>
                    )}
                  </button>
                );
              })}
            </nav>
          </div>


          <div className="pt-6 border-t border-neutral-200">
            <div className="flex items-center space-x-2.5">
              <div className="w-2.5 h-2.5 bg-emerald-500 rounded-full animate-ping" />
              <p className="text-[10px] text-neutral-500 font-mono tracking-wide">
                Signed in as Admin
              </p>
            </div>
          </div>
        </aside>

        <main className="flex-1 p-6 md:p-8 overflow-y-auto">
          {loading ? (
            <div className="h-96 flex items-center justify-center">
              <div className="space-y-2 text-center">
                <div className="w-8 h-8 border-2 border-neutral-900 border-t-transparent rounded-full animate-spin mx-auto" />
                <p className="text-[10px] text-neutral-500 font-mono uppercase tracking-widest">
                  Loading ledger tables
                </p>
              </div>
            </div>
          ) : (
            <div className="max-w-6xl mx-auto space-y-8">
              {activeTab === 'analytics' && analytics && (
                <div className="space-y-8">
                  <div className="space-y-1">
                    <h2 className="text-xl font-display uppercase tracking-wider font-semibold text-neutral-900">
                      Operational Ledger Metrics
                    </h2>
                    <p className="text-xs text-neutral-500">
                      Overview of total luxury invoice balances, inventory records, and sales.
                    </p>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                    <div className="p-5 bg-white border border-neutral-200 rounded-lg flex items-center space-x-4 shadow-sm">
                      <div className="p-3 bg-neutral-100 text-neutral-900 rounded-full">
                        <TrendingUp className="w-5 h-5" />
                      </div>
                      <div>
                        <p className="text-[9px] font-bold text-neutral-400 uppercase tracking-widest">Total Gross Revenue</p>
                        <p className="text-xl font-bold font-mono text-neutral-900 mt-0.5">₹{analytics.totalSales.toFixed(2)}</p>
                      </div>
                    </div>

                    <div className="p-5 bg-white border border-neutral-200 rounded-lg flex items-center space-x-4 shadow-sm">
                      <div className="p-3 bg-neutral-100 text-neutral-600 rounded-full">
                        <ShoppingCart className="w-5 h-5" />
                      </div>
                      <div>
                        <p className="text-[9px] font-bold text-neutral-400 uppercase tracking-widest">Completed Orders</p>
                        <p className="text-xl font-bold font-mono text-neutral-900 mt-0.5">{analytics.totalOrders}</p>
                      </div>
                    </div>

                    <div className="p-5 bg-white border border-neutral-200 rounded-lg flex items-center space-x-4 shadow-sm">
                      <div className="p-3 bg-neutral-100 text-neutral-600 rounded-full">
                        <Shirt className="w-5 h-5" />
                      </div>
                      <div>
                        <p className="text-[9px] font-bold text-neutral-400 uppercase tracking-widest">Active Stock Catalog</p>
                        <p className="text-xl font-bold font-mono text-neutral-900 mt-0.5">{analytics.totalProducts} items</p>
                      </div>
                    </div>

                    <div className="p-5 bg-white border border-neutral-200 rounded-lg flex items-center space-x-4 shadow-sm">
                      <div className="p-3 bg-neutral-100 text-neutral-600 rounded-full">
                        <Users className="w-5 h-5" />
                      </div>
                      <div>
                        <p className="text-[9px] font-bold text-neutral-400 uppercase tracking-widest">Registered Clients</p>
                        <p className="text-xl font-bold font-mono text-neutral-900 mt-0.5">{analytics.totalCustomers}</p>
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    <div className="lg:col-span-2 p-6 bg-white border border-neutral-200 rounded-lg space-y-4 shadow-sm">
                      <h3 className="text-xs font-bold uppercase tracking-widest text-neutral-450">
                        Sales Distribution by Section
                      </h3>

                      <div className="h-64 flex items-end justify-between space-x-6 pt-10 px-4">
                        {Object.entries(analytics.salesBySection).map(([sec, amount]) => {
                          const val = amount as number;
                          const maxAmount = Math.max(...Object.values(analytics.salesBySection).map(v => v as number), 1);
                          const percentage = (val / maxAmount) * 80; // scale nicely up to 80% of box height
                          return (
                            <div key={sec} className="flex-1 flex flex-col items-center space-y-3">
                              <span className="text-[10px] font-mono font-bold text-neutral-900">
                                ₹{val.toFixed(0)}
                              </span>
                              <div
                                className="w-full bg-neutral-900 rounded-t-sm transition-all duration-500"
                                style={{ height: `${Math.max(percentage, 5)}px` }}
                              />
                              <span className="text-[10px] font-bold uppercase tracking-wider text-neutral-400">
                                {sec}
                              </span>
                            </div>
                          );
                        })}
                      </div>
                    </div>

                    <div className="p-6 bg-white border border-neutral-200 rounded-lg flex flex-col justify-between shadow-sm">
                      <div>
                        <h3 className="text-xs font-bold uppercase tracking-widest text-neutral-450 mb-4">
                          Homepage Banner Control
                        </h3>
                        <p className="text-xs text-neutral-500 leading-relaxed">
                          Homepage campaigns are rotating successfully. Banners map to target seasonal capsules to maximize high-end sales.
                        </p>
                      </div>
                      <div className="pt-4 border-t border-neutral-200 mt-6 space-y-2">
                        <div className="flex justify-between text-xs">
                          <span className="text-neutral-500">SUMMER ANTHOLOGY</span>
                          <span className="text-emerald-600 font-semibold">Active</span>
                        </div>
                        <div className="flex justify-between text-xs">
                          <span className="text-neutral-500">MODERN ARCHETYPE</span>
                          <span className="text-emerald-600 font-semibold">Active</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {activeTab === 'products' && (
                <div className="space-y-6">
                  <div className="flex items-center justify-between">
                    <div className="space-y-1">
                      <h2 className="text-xl font-display uppercase tracking-wider font-semibold text-neutral-900">
                        Product Catalog Inventory
                      </h2>
                      <p className="text-xs text-neutral-500">
                        Perform CRUD, update pricing structures, discounts, SEO metadata, and quantities.
                      </p>
                    </div>

                    {!prodFormOpen && (
                      <button
                        onClick={() => setProdFormOpen(true)}
                        className="inline-flex items-center space-x-1.5 px-4 py-2 bg-neutral-900 hover:bg-neutral-800 text-white text-[10px] font-bold uppercase tracking-widest rounded transition-all cursor-pointer"
                      >
                        <Plus className="w-4 h-4" />
                        <span>Add Product</span>
                      </button>
                    )}
                  </div>

                  {prodFormOpen && (
                    <form onSubmit={handleProductSubmit} className="p-6 bg-white border border-neutral-200 rounded-lg space-y-6 shadow-md">
                      <div className="flex items-center justify-between border-b border-neutral-200 pb-3">
                        <h3 className="text-xs font-bold uppercase tracking-widest text-neutral-900">
                          {editingProdId ? 'Modify Product Record' : 'Create New Inventory Record'}
                        </h3>
                        <button type="button" onClick={resetProductForm} className="text-neutral-400 hover:text-neutral-800">
                          <X className="w-5 h-5" />
                        </button>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                        <div className="space-y-1.5">
                          <label className="text-[9px] font-bold text-neutral-500 uppercase tracking-widest">Product Name</label>
                          <input type="text" required value={prodName} onChange={e => setProdName(e.target.value)} className="w-full bg-neutral-50 border border-neutral-200 rounded p-2 text-xs text-neutral-900 focus:outline-none focus:border-neutral-400" />
                        </div>
                        <div className="space-y-1.5">
                          <label className="text-[9px] font-bold text-neutral-500 uppercase tracking-widest">Brand Label</label>
                          <input type="text" value={prodBrand} onChange={e => setProdBrand(e.target.value)} className="w-full bg-neutral-50 border border-neutral-200 rounded p-2 text-xs text-neutral-900 focus:outline-none focus:border-neutral-400" />
                        </div>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
                        <div className="space-y-1.5">
                          <label className="text-[9px] font-bold text-neutral-500 uppercase tracking-widest">Image 1</label>
                          <input type="text" value={prodImage} onChange={e => setProdImage(e.target.value)} placeholder="Main angle image URL" className="w-full bg-neutral-50 border border-neutral-200 rounded p-2 text-xs text-neutral-900 focus:outline-none focus:border-neutral-400" />
                        </div>
                        <div className="space-y-1.5">
                          <label className="text-[9px] font-bold text-neutral-500 uppercase tracking-widest">Image 2</label>
                          <input type="text" value={prodImage2} onChange={e => setProdImage2(e.target.value)} placeholder="Second angle image URL" className="w-full bg-neutral-50 border border-neutral-200 rounded p-2 text-xs text-neutral-900 focus:outline-none focus:border-neutral-400" />
                        </div>
                        <div className="space-y-1.5">
                          <label className="text-[9px] font-bold text-neutral-500 uppercase tracking-widest">Image 3</label>
                          <input type="text" value={prodImage3} onChange={e => setProdImage3(e.target.value)} placeholder="Third angle image URL" className="w-full bg-neutral-50 border border-neutral-200 rounded p-2 text-xs text-neutral-900 focus:outline-none focus:border-neutral-400" />
                        </div>
                      </div>

                      <div className="grid grid-cols-2 sm:grid-cols-4 gap-6">
                        <div className="space-y-1.5">
                          <label className="text-[9px] font-bold text-neutral-500 uppercase tracking-widest font-mono">Retail Price (₹)</label>
                          <input type="number" required value={prodPrice} onChange={e => setProdPrice(e.target.value)} className="w-full bg-neutral-50 border border-neutral-200 rounded p-2 text-xs text-neutral-900 focus:outline-none focus:border-neutral-400" />
                        </div>
                        <div className="space-y-1.5">
                          <label className="text-[9px] font-bold text-neutral-500 uppercase tracking-widest font-mono">Discount (% Off)</label>
                          <input type="number" value={prodDiscount} onChange={e => setProdDiscount(e.target.value)} className="w-full bg-neutral-50 border border-neutral-200 rounded p-2 text-xs text-neutral-900 focus:outline-none focus:border-neutral-400" />
                        </div>
                        <div className="space-y-1.5">
                          <label className="text-[9px] font-bold text-neutral-500 uppercase tracking-widest">Section</label>
                          <select
                            value={prodSection}
                            onChange={e => {
                              const newSection = e.target.value as 'men' | 'women' | 'kids' | 'accessories';
                              setProdSection(newSection);
                              const availableCats = SECTION_CATEGORIES[newSection] || [];
                              if (!availableCats.includes(prodCategory)) {
                                setProdCategory(availableCats[0] || 'Topwear');
                              }
                            }}
                            className="w-full bg-neutral-50 border border-neutral-200 rounded p-2 text-xs text-neutral-900 focus:outline-none focus:border-neutral-400 cursor-pointer"
                          >
                            <option value="men">Men</option>
                            <option value="women">Women</option>
                            <option value="kids">Kids</option>
                            <option value="accessories">Accessories</option>
                          </select>
                        </div>
                        <div className="space-y-1.5">
                          <label className="text-[9px] font-bold text-neutral-500 uppercase tracking-widest">Category</label>
                          <select
                            required
                            value={prodCategory}
                            onChange={e => setProdCategory(e.target.value)}
                            className="w-full bg-neutral-50 border border-neutral-200 rounded p-2 text-xs text-neutral-900 focus:outline-none focus:border-neutral-400 cursor-pointer"
                          >
                            {(SECTION_CATEGORIES[prodSection] || []).map((cat) => (
                              <option key={cat} value={cat}>
                                {cat}
                              </option>
                            ))}
                          </select>
                        </div>
                      </div>


                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
                        <div className="space-y-2">
                          <label className="text-[9px] font-bold text-neutral-500 uppercase tracking-widest">Available Sizes</label>
                          <div className="flex flex-wrap gap-3">
                            {['XS', 'S', 'M', 'L', 'XL', '40mm', '30','32','34','36','40','One Size'].map((sz) => (
                              <label key={sz} className="flex items-center space-x-1.5 text-xs text-neutral-700 font-medium cursor-pointer">
                                <input type="checkbox" checked={prodSizes.includes(sz)} onChange={() => toggleSize(sz)} className="rounded text-neutral-900 focus:ring-neutral-900 bg-white border-neutral-200" />
                                <span>{sz}</span>
                              </label>
                            ))}
                          </div>
                        </div>

                        <div className="space-y-1.5">
                          <label className="text-[9px] font-bold text-neutral-500 uppercase tracking-widest">Color Display Name</label>
                          <input type="text" value={prodColorName} onChange={e => setProdColorName(e.target.value)} className="w-full bg-neutral-50 border border-neutral-200 rounded p-2 text-xs text-neutral-900 focus:outline-none focus:border-neutral-400" />
                        </div>

                        <div className="space-y-1.5">
                          <label className="text-[9px] font-bold text-neutral-500 uppercase tracking-widest">Color Hex Color</label>
                          <input type="text" value={prodColorHex} onChange={e => setProdColorHex(e.target.value)} className="w-full bg-neutral-50 border border-neutral-200 rounded p-2 text-xs text-neutral-900 focus:outline-none focus:border-neutral-400 font-mono" />
                        </div>
                      </div>

                      <div className="space-y-1.5">
                        <label className="text-[9px] font-bold text-neutral-500 uppercase tracking-widest">Product Description</label>
                        <textarea rows={3} required value={prodDesc} onChange={e => setProdDesc(e.target.value)} className="w-full bg-neutral-50 border border-neutral-200 rounded p-2.5 text-xs text-neutral-900 focus:outline-none focus:border-neutral-400" />
                      </div>

                      {/* <div className="p-4 bg-white border border-neutral-200 rounded space-y-4">
                        <p className="text-[10px] font-bold text-neutral-500 uppercase tracking-widest">SEO Optimization Metadata</p>
                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                          <div className="space-y-1">
                            <label className="text-[9px] font-bold text-neutral-400 uppercase">SEO Title</label>
                            <input type="text" value={prodSeoTitle} onChange={e => setProdSeoTitle(e.target.value)} className="w-full bg-neutral-50 border border-neutral-200 p-1.5 text-xs text-neutral-900 focus:outline-none focus:border-neutral-400" />
                          </div>
                          <div className="space-y-1">
                            <label className="text-[9px] font-bold text-neutral-400 uppercase">SEO Meta Keywords</label>
                            <input type="text" value={prodSeoKeywords} onChange={e => setProdSeoKeywords(e.target.value)} className="w-full bg-neutral-50 border border-neutral-200 p-1.5 text-xs text-neutral-900 focus:outline-none focus:border-neutral-400" />
                          </div>
                          <div className="space-y-1">
                            <label className="text-[9px] font-bold text-neutral-400 uppercase">SEO Description</label>
                            <input type="text" value={prodSeoDesc} onChange={e => setProdSeoDesc(e.target.value)} className="w-full bg-neutral-50 border border-neutral-200 p-1.5 text-xs text-neutral-900 focus:outline-none focus:border-neutral-400" />
                          </div>
                        </div>
                      </div> */}

                      <div className="grid grid-cols-2 gap-6 pt-3">
                        <div className="space-y-1.5">
                          <label className="text-[9px] font-bold text-neutral-500 uppercase tracking-widest font-mono">Inventory Stock Count</label>
                          <input type="number" required value={prodStock} onChange={e => setProdStock(e.target.value)} className="w-full bg-neutral-50 border border-neutral-200 rounded p-2 text-xs text-neutral-900 focus:outline-none focus:border-neutral-400" />
                        </div>

                        {/* Featured */}
                        {/* <div className="flex items-center space-x-3 h-full pt-4">
                          <label className="flex items-center space-x-2 text-xs font-semibold text-neutral-700 cursor-pointer">
                            <input type="checkbox" checked={prodFeatured} onChange={e => setProdFeatured(e.target.checked)} className="rounded text-neutral-900 bg-white border-neutral-200" />
                            <span>Feature this on boutique shopfront</span>
                          </label>
                        </div> */}
                      </div>

                      <div className="flex justify-end space-x-4 border-t border-neutral-200 pt-4">
                        <button type="button" onClick={resetProductForm} className="px-5 py-2.5 bg-neutral-100 text-neutral-750 hover:bg-neutral-200 text-[10px] font-bold uppercase tracking-widest rounded cursor-pointer">
                          Cancel
                        </button>
                        <button type="submit" className="px-5 py-2.5 bg-neutral-900 hover:bg-neutral-800 text-white text-[10px] font-bold uppercase tracking-widest rounded cursor-pointer">
                          {editingProdId ? 'Save Changes' : 'Publish Product'}
                        </button>
                      </div>
                    </form>
                  )}

                  <div className="bg-white border border-neutral-200 rounded-lg overflow-hidden shadow-sm">
                    <table className="w-full text-left text-xs font-sans">
                      <thead className="bg-neutral-50 uppercase font-mono text-neutral-500 text-[10px] tracking-widest border-b border-neutral-200">
                        <tr>
                          <th className="p-4">Item</th>
                          <th className="p-4">Detail</th>
                          <th className="p-4">Retail Price</th>
                          <th className="p-4">In Stock</th>
                          <th className="p-4 text-right">Actions</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-neutral-200">
                        {products.map((p) => (
                          <tr key={p.id} className="hover:bg-neutral-50 transition-colors">
                            <td className="p-4 flex items-center space-x-3.5">
                              <img src={p.images[0]} alt={p.name} referrerPolicy="no-referrer" className="w-9 h-12 object-cover rounded border border-neutral-200" />
                              <div>
                                <p className="font-bold text-neutral-900 text-xs">{p.name}</p>
                                <p className="text-[10px] text-neutral-500 tracking-wider uppercase font-semibold">{p.brand}</p>
                              </div>
                            </td>
                            <td className="p-4">
                              <p className="text-neutral-700 capitalize">{p.section} &rarr; {p.category}</p>
                              <p className="text-[10px] text-neutral-400 font-mono">ID: {p.id}</p>
                            </td>
                            <td className="p-4 font-mono font-bold text-neutral-800">
                              ₹{p.price.toFixed(2)}{' '}
                              {p.discount > 0 && <span className="text-neutral-900">(-{p.discount}%)</span>}
                            </td>
                            <td className="p-4 font-mono">
                              {p.stock > 0 ? (
                                <span className="text-emerald-600 font-semibold">{p.stock} units</span>
                              ) : (
                                <span className="text-red-500 font-bold uppercase">Sold Out</span>
                              )}
                            </td>
                            <td className="p-4 text-right space-x-1">
                              <button onClick={() => handleEditProduct(p)} className="p-2 hover:bg-neutral-100 text-neutral-500 hover:text-neutral-900 rounded transition-colors" title="Edit product">
                                <Edit2 className="w-4 h-4" />
                              </button>
                              <button onClick={() => handleDeleteProduct(p.id)} className="p-2 hover:bg-red-50 text-neutral-500 hover:text-red-600 rounded transition-colors" title="Delete product">
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              {activeTab === 'orders' && (
                <div className="space-y-6">
                  <div className="space-y-1">
                    <h2 className="text-xl font-display uppercase tracking-wider font-semibold text-neutral-900">
                      Customer Transactions & Logistics
                    </h2>
                    <p className="text-xs text-neutral-500">
                      View billing records, dispatch items, write tracking details, and update payment state.
                    </p>
                  </div>

                  <div className="bg-white border border-neutral-200 rounded-lg overflow-hidden shadow-sm">
                    <table className="w-full text-left text-xs font-sans">
                      <thead className="bg-neutral-50 uppercase font-mono text-neutral-500 text-[10px] tracking-widest border-b border-neutral-200">
                        <tr>
                          <th className="p-4">Order ID</th>
                          <th className="p-4">Customer</th>
                          <th className="p-4">Total Amount</th>
                          <th className="p-4">Logistics Status</th>
                          <th className="p-4">Payment Status</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-neutral-200">
                        {orders.map((o) => (
                          <tr key={o.id} className="hover:bg-neutral-50 transition-colors">
                            <td className="p-4">
                              <p className="font-bold text-neutral-950 font-mono">#{o.id}</p>
                              <p className="text-[10px] text-neutral-400 font-mono">Track: {o.trackingNumber}</p>
                            </td>
                            <td className="p-4">
                              <p className="font-semibold text-neutral-800">{o.customerName}</p>
                              <p className="text-[10px] text-neutral-400 font-mono">{o.customerEmail}</p>
                            </td>
                            <td className="p-4 font-mono text-neutral-900 font-bold">
                              ₹{o.total.toFixed(2)}
                            </td>
                            <td className="p-4">
                              <select
                                value={o.status}
                                onChange={(e) => handleUpdateOrderStatus(o.id, e.target.value as any)}
                                className={`bg-white border border-neutral-200 rounded text-xs p-1 text-neutral-800 focus:outline-none cursor-pointer ${
                                  o.status === 'Delivered'
                                    ? 'text-emerald-600 font-semibold'
                                    : o.status === 'Cancelled'
                                    ? 'text-red-600 font-semibold'
                                    : 'text-neutral-900 font-semibold'
                                }`}
                              >
                                <option value="Processing">Processing</option>
                                <option value="Shipped">Shipped</option>
                                <option value="Delivered">Delivered</option>
                                <option value="Cancelled">Cancelled</option>
                              </select>
                            </td>
                            <td className="p-4">
                              <select
                                value={o.paymentStatus}
                                onChange={(e) => handleUpdateOrderPaymentStatus(o.id, e.target.value as any)}
                                className={`bg-white border border-neutral-200 rounded text-xs p-1 text-neutral-800 focus:outline-none cursor-pointer ${
                                  o.paymentStatus === 'Paid' ? 'text-emerald-600 font-semibold' : 'text-neutral-900 font-semibold'
                                }`}
                              >
                                <option value="Pending">Pending</option>
                                <option value="Paid">Paid</option>
                                <option value="Failed">Failed</option>
                              </select>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              {activeTab === 'customers' && (
                <div className="space-y-6">
                  {/* Top Bar with Title and Actions */}
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                    <div className="space-y-1">
                      <div className="flex items-center space-x-2">
                        <Users className="w-5 h-5 text-neutral-900" />
                        <h2 className="text-xl font-display uppercase tracking-wider font-semibold text-neutral-900">
                          Registered Client Registry & Login Activity
                        </h2>
                      </div>
                      <p className="text-xs text-neutral-500">
                        View all authenticated user profiles, registration details, and comprehensive login audit history.
                      </p>
                    </div>

                    <div className="flex items-center space-x-2">
                      <button
                        onClick={handleRefreshCustomers}
                        disabled={isRefreshing}
                        className="inline-flex items-center space-x-1.5 px-3 py-1.5 border border-neutral-200 hover:border-neutral-900 text-neutral-700 hover:text-neutral-950 text-xs font-semibold rounded transition-all bg-white cursor-pointer disabled:opacity-50"
                      >
                        <RotateCcw className={`w-3.5 h-3.5 ${isRefreshing ? 'animate-spin' : ''}`} />
                        <span>{isRefreshing ? 'Refreshing...' : 'Refresh Records'}</span>
                      </button>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                    <div className="bg-white border border-neutral-200 p-4 rounded-lg shadow-sm">
                      <p className="text-[10px] font-mono uppercase tracking-widest text-neutral-400">Total Clients</p>
                      <p className="text-xl font-bold font-display text-neutral-900 mt-1">{customers.length}</p>
                      <p className="text-[11px] text-neutral-500 mt-0.5">
                        {customers.filter(c => c.role === 'customer').length} Customers · {customers.filter(c => c.role === 'admin').length} Admins
                      </p>
                    </div>

                    {/* <div className="bg-white border border-neutral-200 p-4 rounded-lg shadow-sm">
                      <p className="text-[10px] font-mono uppercase tracking-widest text-neutral-400">Total Login Events</p>
                      <p className="text-xl font-bold font-display text-neutral-900 mt-1">{loginHistory.length}</p>
                      <p className="text-[11px] text-emerald-600 font-medium mt-0.5">
                        Active Audit Logging
                      </p>
                    </div> */}

                    {/* <div className="bg-white border border-neutral-200 p-4 rounded-lg shadow-sm">
                      <p className="text-[10px] font-mono uppercase tracking-widest text-neutral-400">Most Active Member</p>
                      {(() => {
                        const topUser = [...customers].sort((a, b) => (b.loginCount || 0) - (a.loginCount || 0))[0];
                        return (
                          <>
                            <p className="text-sm font-bold text-neutral-900 mt-1 truncate">
                              {topUser ? topUser.name : 'None'}
                            </p>
                            <p className="text-[11px] text-neutral-500 mt-0.5">
                              {topUser ? `${topUser.loginCount || 1} logins recorded` : '-'}
                            </p>
                          </>
                        );
                      })()}
                    </div> */}

                    {/* <div className="bg-white border border-neutral-200 p-4 rounded-lg shadow-sm">
                      <p className="text-[10px] font-mono uppercase tracking-widest text-neutral-400">Latest Login</p>
                      {loginHistory.length > 0 ? (
                        <>
                          <p className="text-sm font-bold text-neutral-900 mt-1 truncate">
                            {loginHistory[0].userName}
                          </p>
                          <p className="text-[11px] text-neutral-500 mt-0.5">
                            {new Date(loginHistory[0].timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                          </p>
                        </>
                      ) : (
                        <p className="text-sm text-neutral-400 mt-1">No activity</p>
                      )}
                    </div> */}
                  </div>

                  <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3 bg-white p-3 border border-neutral-200 rounded-lg">
                    <div className="flex items-center space-x-1 bg-neutral-100 p-1 rounded-md">
                      <button
                        onClick={() => setCustomerSubTab('clients')}
                        className={`flex items-center space-x-2 px-3 py-1.5 rounded text-xs font-semibold transition-all cursor-pointer ${
                          customerSubTab === 'clients'
                            ? 'bg-white text-neutral-900 shadow-xs font-bold'
                            : 'text-neutral-600 hover:text-neutral-900'
                        }`}
                      >
                        <UserCheck className="w-3.5 h-3.5" />
                        <span>Registered Clients ({customers.length})</span>
                      </button>

                      {/* <button
                        onClick={() => setCustomerSubTab('history')}
                        className={`flex items-center space-x-2 px-3 py-1.5 rounded text-xs font-semibold transition-all cursor-pointer ${
                          customerSubTab === 'history'
                            ? 'bg-white text-neutral-900 shadow-xs font-bold'
                            : 'text-neutral-600 hover:text-neutral-900'
                        }`}
                      >
                        <History className="w-3.5 h-3.5" />
                        <span>Login History & Audit Log ({loginHistory.length})</span>
                      </button> */}
                    </div>

                    <div className="flex items-center space-x-2">
                      {/* <div className="relative">
                        <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400" />
                        <input
                          type="text"
                          value={clientSearchQuery}
                          onChange={(e) => setClientSearchQuery(e.target.value)}
                          placeholder={customerSubTab === 'clients' ? "Search client name, email, ID..." : "Search user name, email, IP..."}
                          className="pl-8 pr-3 py-1.5 text-xs bg-neutral-50 border border-neutral-200 rounded focus:bg-white focus:outline-none focus:border-neutral-900 w-48 sm:w-64 transition-all"
                        />
                        {clientSearchQuery && (
                          <button
                            onClick={() => setClientSearchQuery('')}
                            className="absolute right-2 top-1/2 -translate-y-1/2 text-neutral-400 hover:text-neutral-700"
                          >
                            <X className="w-3 h-3" />
                          </button>
                        )}
                      </div> */}

                      <select
                        value={clientRoleFilter}
                        onChange={(e) => setClientRoleFilter(e.target.value as any)}
                        className="text-xs bg-neutral-50 border border-neutral-200 rounded px-2.5 py-1.5 focus:bg-white focus:outline-none cursor-pointer"
                      >
                        <option value="all">All Roles</option>
                        <option value="customer">Customers Only</option>
                        <option value="admin">Admins Only</option>
                      </select>
                    </div>
                  </div>

                  {customerSubTab === 'clients' && (
                    <div className="bg-white border border-neutral-200 rounded-lg overflow-hidden shadow-sm">
                      {(() => {
                        const filtered = customers.filter(c => {
                          const q = clientSearchQuery.toLowerCase();
                          const matchesQuery = !q || c.name?.toLowerCase().includes(q) || c.email?.toLowerCase().includes(q) || c.id?.toLowerCase().includes(q);
                          const matchesRole = clientRoleFilter === 'all' || c.role === clientRoleFilter;
                          return matchesQuery && matchesRole;
                        });

                        if (filtered.length === 0) {
                          return (
                            <div className="py-12 text-center text-neutral-500">
                              <Users className="w-8 h-8 mx-auto text-neutral-300 mb-2" />
                              <p className="text-sm font-medium">No registered clients match your query.</p>
                              <p className="text-xs text-neutral-400 mt-1">Try clearing filters or register a new user account.</p>
                            </div>
                          );
                        }

                        return (
                          <div className="overflow-x-auto">
                            <table className="w-full text-left text-xs font-sans">
                              <thead className="bg-neutral-50 uppercase font-mono text-neutral-500 text-[10px] tracking-widest border-b border-neutral-200">
                                <tr>
                                  <th className="p-4">User Name & Avatar</th>
                                  <th className="p-4">Email Address</th>
                                  <th className="p-4">Account ID</th>
                                  <th className="p-4">Role</th>
                                  <th className="p-4">Registered On</th>
                                  {/* <th className="p-4">Last Login</th> */}
                                  {/* <th className="p-4">Logins</th> */}
                                  <th className="p-4 text-right">Actions</th>
                                </tr>
                              </thead>
                              <tbody className="divide-y divide-neutral-200">
                                {filtered.map((c) => {
                                  const initials = c.name
                                    ? c.name.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase()
                                    : 'CL';
                                  const isMasterAdmin = c.id === 'admin-1';

                                  return (
                                    <tr key={c.id} className="hover:bg-neutral-50/80 transition-colors">
                                      <td className="p-4">
                                        <div className="flex items-center space-x-3">
                                          <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-[11px] ${
                                            c.role === 'admin' ? 'bg-neutral-900 text-white' : 'bg-neutral-200 text-neutral-800'
                                          }`}>
                                            {initials}
                                          </div>
                                          <div>
                                            <span className="font-bold text-neutral-900 block text-xs">{c.name}</span>
                                            {c.addresses && c.addresses.length > 0 && (
                                              <span className="text-[10px] text-neutral-400 block">
                                                {c.addresses[0].city}, {c.addresses[0].country}
                                              </span>
                                            )}
                                          </div>
                                        </div>
                                      </td>
                                      <td className="p-4 font-mono text-neutral-700">{c.email}</td>
                                      <td className="p-4">
                                        <span className="px-2 py-0.5 bg-neutral-100 border border-neutral-200 rounded font-mono text-[10px] text-neutral-600">
                                          {c.id}
                                        </span>
                                      </td>
                                      <td className="p-4">
                                        <span className={`inline-block uppercase tracking-wider text-[9px] font-bold px-2 py-0.5 rounded ${
                                          c.role === 'admin'
                                            ? 'bg-neutral-900 text-white'
                                            : 'bg-neutral-100 text-neutral-700 border border-neutral-200'
                                        }`}>
                                          {c.role}
                                        </span>
                                      </td>
                                      <td className="p-4 text-neutral-500 font-mono text-[11px]">
                                        {c.createdAt ? new Date(c.createdAt).toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' }) : '-'}
                                      </td>
                                      {/* <td className="p-4 text-neutral-600 font-mono text-[11px]">
                                        {c.lastLoginAt ? (
                                          <div>
                                            <span>{new Date(c.lastLoginAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}</span>
                                            <span className="text-[10px] text-neutral-400 ml-1">
                                              {new Date(c.lastLoginAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                            </span>
                                          </div>
                                        ) : (
                                          <span className="text-neutral-400">First Session</span>
                                        )}
                                      </td> */}
                                      {/* <td className="p-4 font-mono font-semibold text-neutral-800">
                                        {c.loginCount || 1}
                                      </td> */}
                                      <td className="p-4 text-right">
                                        {!isMasterAdmin ? (
                                          deletingClientId === c.id ? (
                                            <div className="flex items-center justify-end space-x-1">
                                              <button
                                                onClick={() => handleDeleteClient(c.id, c.name)}
                                                className="px-2 py-1 bg-red-600 hover:bg-red-700 text-white text-[10px] font-bold rounded cursor-pointer transition-colors shadow-xs"
                                                title="Confirm Permanent Deletion"
                                              >
                                                Delete
                                              </button>
                                              <button
                                                onClick={() => setDeletingClientId(null)}
                                                className="px-2 py-1 bg-neutral-200 hover:bg-neutral-300 text-neutral-700 text-[10px] font-semibold rounded cursor-pointer transition-colors"
                                                title="Cancel"
                                              >
                                                Cancel
                                              </button>
                                            </div>
                                          ) : (
                                            <button
                                              onClick={() => setDeletingClientId(c.id)}
                                              className="p-1.5 text-neutral-400 hover:text-red-600 transition-colors rounded hover:bg-red-50 cursor-pointer"
                                              title="Delete User Record"
                                            >
                                              <Trash2 className="w-3.5 h-3.5" />
                                            </button>
                                          )
                                        ) : (
                                          <span className="text-[10px] text-neutral-400 font-mono">Protected</span>
                                        )}
                                      </td>
                                    </tr>
                                  );
                                })}
                              </tbody>
                            </table>
                          </div>
                        );
                      })()}
                    </div>
                  )}

                  {customerSubTab === 'history' && (
                    <div className="bg-white border border-neutral-200 rounded-lg overflow-hidden shadow-sm">
                      <div className="p-4 bg-neutral-50/70 border-b border-neutral-200 flex items-center justify-between">
                        <div className="flex items-center space-x-2">
                          <Clock className="w-4 h-4 text-neutral-700" />
                          <span className="text-xs font-bold uppercase tracking-wider text-neutral-800">
                            Authentication History Ledger (Showing Every Login With User Name)
                          </span>
                        </div>
                        <span className="text-[11px] font-mono text-neutral-500">
                          {loginHistory.length} total events logged
                        </span>
                      </div>

                      {(() => {
                        const filtered = loginHistory.filter(h => {
                          const q = clientSearchQuery.toLowerCase();
                          const matchesQuery = !q || 
                            h.userName?.toLowerCase().includes(q) || 
                            h.userEmail?.toLowerCase().includes(q) || 
                            h.userId?.toLowerCase().includes(q) ||
                            h.ipAddress?.toLowerCase().includes(q) ||
                            h.method?.toLowerCase().includes(q);
                          const matchesRole = clientRoleFilter === 'all' || h.role === clientRoleFilter;
                          return matchesQuery && matchesRole;
                        });

                        if (filtered.length === 0) {
                          return (
                            <div className="py-12 text-center text-neutral-500">
                              <History className="w-8 h-8 mx-auto text-neutral-300 mb-2" />
                              <p className="text-sm font-medium">No login history events found.</p>
                              <p className="text-xs text-neutral-400 mt-1">Every user login or registration will be tracked here in real-time.</p>
                            </div>
                          );
                        }

                        return (
                          <div className="overflow-x-auto">
                            <table className="w-full text-left text-xs font-sans">
                              <thead className="bg-neutral-50 uppercase font-mono text-neutral-500 text-[10px] tracking-widest border-b border-neutral-200">
                                <tr>
                                  <th className="p-4">User Name</th>
                                  <th className="p-4">User Email</th>
                                  <th className="p-4">Account ID</th>
                                  <th className="p-4">Role</th>
                                  <th className="p-4">Login Time & Date</th>
                                  <th className="p-4">Auth Method</th>
                                  <th className="p-4 text-right">Status</th>
                                </tr>
                              </thead>
                              <tbody className="divide-y divide-neutral-200">
                                {filtered.map((log) => {
                                  const initials = log.userName
                                    ? log.userName.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase()
                                    : 'US';
                                  const logDate = new Date(log.timestamp);

                                  return (
                                    <tr key={log.id} className="hover:bg-neutral-50/80 transition-colors">
                                      <td className="p-4">
                                        <div className="flex items-center space-x-2.5">
                                          <div className={`w-7 h-7 rounded-full flex items-center justify-center font-bold text-[10px] ${
                                            log.role === 'admin' ? 'bg-neutral-900 text-white' : 'bg-neutral-200 text-neutral-800'
                                          }`}>
                                            {initials}
                                          </div>
                                          <span className="font-bold text-neutral-900 text-xs">{log.userName}</span>
                                        </div>
                                      </td>
                                      <td className="p-4 font-mono text-neutral-700">{log.userEmail}</td>
                                      <td className="p-4">
                                        <span className="px-2 py-0.5 bg-neutral-100 border border-neutral-200 rounded font-mono text-[10px] text-neutral-600">
                                          {log.userId}
                                        </span>
                                      </td>
                                      <td className="p-4">
                                        <span className={`inline-block uppercase tracking-wider text-[9px] font-bold px-2 py-0.5 rounded ${
                                          log.role === 'admin'
                                            ? 'bg-neutral-900 text-white'
                                            : 'bg-neutral-100 text-neutral-700 border border-neutral-200'
                                        }`}>
                                          {log.role}
                                        </span>
                                      </td>
                                      <td className="p-4 font-mono text-[11px] text-neutral-700">
                                        <div>
                                          <span className="font-semibold text-neutral-900">
                                            {logDate.toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' })}
                                          </span>
                                          <span className="text-neutral-500 ml-1.5">
                                            {logDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
                                          </span>
                                        </div>
                                      </td>
                                      <td className="p-4 font-mono text-[11px] text-neutral-700">
                                        <span className="px-2 py-0.5 bg-neutral-100 rounded text-neutral-800 font-medium">
                                          {log.method || 'Password'}
                                        </span>
                                      </td>
                                      <td className="p-4 text-right">
                                        <span className="inline-flex items-center space-x-1 px-2 py-0.5 bg-emerald-50 border border-emerald-200 text-emerald-700 rounded text-[10px] font-bold">
                                          <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                                          <span>Success</span>
                                        </span>
                                      </td>
                                    </tr>
                                  );
                                })}
                              </tbody>
                            </table>
                          </div>
                        );
                      })()}
                    </div>
                  )}
                </div>
              )}

              {activeTab === 'inquiries' && (
                <div className="space-y-6">
                  {/* Top Bar */}
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                    <div className="space-y-1">
                      <div className="flex items-center space-x-2">
                        <MessageSquare className="w-5 h-5 text-neutral-900" />
                        <h2 className="text-xl font-display uppercase tracking-wider font-semibold text-neutral-900">
                          Bespoke Inquiries & Contact Messages
                        </h2>
                      </div>
                      <p className="text-xs text-neutral-500">
                        View and manage client contact form submissions stored securely in MongoDB.
                      </p>
                    </div>

                    <div className="flex items-center space-x-2">
                      <button
                        onClick={() => {
                          setIsRefreshing(true);
                          fetchAdminData();
                        }}
                        disabled={isRefreshing}
                        className="inline-flex items-center space-x-1.5 px-3 py-1.5 border border-neutral-200 hover:border-neutral-900 text-neutral-700 hover:text-neutral-950 text-xs font-semibold rounded transition-all bg-white cursor-pointer disabled:opacity-50"
                      >
                        <RotateCcw className={`w-3.5 h-3.5 ${isRefreshing ? 'animate-spin' : ''}`} />
                        <span>{isRefreshing ? 'Refreshing...' : 'Refresh Inquiries'}</span>
                      </button>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                    <div className="bg-white border border-neutral-200 p-4 rounded-lg shadow-sm">
                      <p className="text-[10px] font-mono uppercase tracking-widest text-neutral-400">Total Inquiries</p>
                      <p className="text-xl font-bold font-display text-neutral-900 mt-1">{inquiries.length}</p>
                      <p className="text-[11px] text-neutral-500 mt-0.5">Logged in MongoDB</p>
                    </div>

                    <div className="bg-white border border-neutral-200 p-4 rounded-lg shadow-sm">
                      <p className="text-[10px] font-mono uppercase tracking-widest text-neutral-400">New / Unread</p>
                      <p className="text-xl font-bold font-display text-red-600 mt-1">
                        {inquiries.filter(i => i.status === 'New').length}
                      </p>
                      <p className="text-[11px] text-red-600/80 font-medium mt-0.5">Awaiting response</p>
                    </div>

                    <div className="bg-white border border-neutral-200 p-4 rounded-lg shadow-sm">
                      <p className="text-[10px] font-mono uppercase tracking-widest text-neutral-400">Replied / Handled</p>
                      <p className="text-xl font-bold font-display text-emerald-600 mt-1">
                        {inquiries.filter(i => i.status === 'Replied').length}
                      </p>
                      <p className="text-[11px] text-emerald-600 font-medium mt-0.5">Completed consultations</p>
                    </div>

                    {/* <div className="bg-white border border-neutral-200 p-4 rounded-lg shadow-sm">
                      <p className="text-[10px] font-mono uppercase tracking-widest text-neutral-400">Latest Inquiry</p>
                      {inquiries.length > 0 ? (
                        <>
                          <p className="text-sm font-bold text-neutral-900 mt-1 truncate">{inquiries[0].name}</p>
                          <p className="text-[11px] text-neutral-500 mt-0.5">
                            {new Date(inquiries[0].createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} · {inquiries[0].type}
                          </p>
                        </>
                      ) : (
                        <p className="text-sm text-neutral-400 mt-1">No inquiries yet</p>
                      )}
                    </div> */}
                  </div>

                  {/* Search & Filter Controls */}
                  {/* <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 bg-white p-3 border border-neutral-200 rounded-lg">
                    <div className="relative flex-1 max-w-md">
                      <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400" />
                      <input
                        type="text"
                        value={inquirySearchQuery}
                        onChange={(e) => setInquirySearchQuery(e.target.value)}
                        placeholder="Search by client name, email, message text..."
                        className="w-full pl-8 pr-3 py-1.5 text-xs bg-neutral-50 border border-neutral-200 rounded focus:bg-white focus:outline-none focus:border-neutral-900 transition-all"
                      />
                      {inquirySearchQuery && (
                        <button
                          onClick={() => setInquirySearchQuery('')}
                          className="absolute right-2 top-1/2 -translate-y-1/2 text-neutral-400 hover:text-neutral-700"
                        >
                          <X className="w-3 h-3" />
                        </button>
                      )}
                    </div>

                    <div className="flex items-center space-x-2">
                      <select
                        value={inquiryStatusFilter}
                        onChange={(e) => setInquiryStatusFilter(e.target.value)}
                        className="text-xs bg-neutral-50 border border-neutral-200 rounded px-2.5 py-1.5 focus:bg-white focus:outline-none cursor-pointer"
                      >
                        <option value="all">All Statuses</option>
                        <option value="New">New</option>
                        <option value="Read">Read</option>
                        <option value="Replied">Replied</option>
                        <option value="Archived">Archived</option>
                      </select>

                      <select
                        value={inquiryDepartmentFilter}
                        onChange={(e) => setInquiryDepartmentFilter(e.target.value)}
                        className="text-xs bg-neutral-50 border border-neutral-200 rounded px-2.5 py-1.5 focus:bg-white focus:outline-none cursor-pointer"
                      >
                        <option value="all">All Departments</option>
                        <option value="Bespoke Fitting">Bespoke Fitting</option>
                        <option value="Order Curation Support">Order Curation Support</option>
                        <option value="Brand Collaboration">Brand Collaboration</option>
                        <option value="Fabric & Sourcing">Fabric & Sourcing</option>
                      </select>
                    </div>
                  </div> */}

                  <div className="bg-white border border-neutral-200 rounded-lg overflow-hidden shadow-sm">
                    {(() => {
                      const filtered = inquiries.filter(inq => {
                        const q = inquirySearchQuery.toLowerCase();
                        const matchesQuery = !q ||
                          inq.name?.toLowerCase().includes(q) ||
                          inq.email?.toLowerCase().includes(q) ||
                          inq.message?.toLowerCase().includes(q) ||
                          inq.type?.toLowerCase().includes(q) ||
                          inq.id?.toLowerCase().includes(q);
                        const matchesStatus = inquiryStatusFilter === 'all' || inq.status === inquiryStatusFilter;
                        const matchesDept = inquiryDepartmentFilter === 'all' || inq.type === inquiryDepartmentFilter;
                        return matchesQuery && matchesStatus && matchesDept;
                      });

                      if (filtered.length === 0) {
                        return (
                          <div className="py-16 text-center text-neutral-500">
                            <MessageSquare className="w-10 h-10 mx-auto text-neutral-300 mb-2" />
                            <p className="text-sm font-medium">No contact inquiries found.</p>
                            <p className="text-xs text-neutral-400 mt-1">
                              When users submit the Contact form on the storefront, their messages will appear here in real-time.
                            </p>
                          </div>
                        );
                      }

                      return (
                        <div className="overflow-x-auto">
                          <table className="w-full text-left text-xs font-sans">
                            <thead className="bg-neutral-50 uppercase font-mono text-neutral-500 text-[10px] tracking-widest border-b border-neutral-200">
                              <tr>
                                <th className="p-4">Client Name</th>
                                <th className="p-4">Email</th>
                                <th className="p-4">Department</th>
                                <th className="p-4">Inquiry Message</th>
                                <th className="p-4">Received On</th>
                                <th className="p-4">Status</th>
                                <th className="p-4 text-right">Actions</th>
                              </tr>
                            </thead>
                            <tbody className="divide-y divide-neutral-200">
                              {filtered.map((inq) => {
                                const initials = inq.name
                                  ? inq.name.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase()
                                  : 'CL';
                                const inqDate = new Date(inq.createdAt);

                                return (
                                  <tr key={inq.id} className="hover:bg-neutral-50/80 transition-colors">
                                    <td className="p-4">
                                      <div className="flex items-center space-x-2.5">
                                        <div className="w-7 h-7 rounded-full bg-neutral-900 text-white flex items-center justify-center font-bold text-[10px] shrink-0">
                                          {initials}
                                        </div>
                                        <div>
                                          <span className="font-bold text-neutral-900 block text-xs">{inq.name}</span>
                                          <span className="text-[10px] text-neutral-400 font-mono">ID: {inq.id}</span>
                                        </div>
                                      </div>
                                    </td>
                                    <td className="p-4 font-mono">
                                      <a
                                        href={`mailto:${inq.email}?subject=Re: StyleClothing Inquiry - ${inq.type}`}
                                        className="text-neutral-700 hover:text-neutral-950 "
                                        title="Click to compose email"
                                      >
                                        {inq.email}
                                      </a>
                                    </td>
                                    <td className="p-4">
                                      <span className="inline-block px-2 py-0.5 bg-neutral-100 border border-neutral-200 rounded text-[10px] font-semibold text-neutral-800">
                                        {inq.type}
                                      </span>
                                    </td>
                                    <td className="p-4 max-w-xs">
                                      <p className="text-neutral-700 text-xs leading-relaxed line-clamp-5">
                                        {inq.message}
                                      </p>
                                    </td>
                                    <td className="p-4 font-mono text-[11px] text-neutral-700 whitespace-nowrap">
                                      <div>
                                        <span className="font-semibold text-neutral-900">
                                          {inqDate.toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' })}
                                        </span>
                                        {/* <span className="text-neutral-500 ml-1.5">
                                          {inqDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                        </span> */}
                                      </div>
                                    </td>
                                    <td className="p-4">
                                      <select
                                        value={inq.status}
                                        onChange={(e) => handleUpdateInquiryStatus(inq.id, e.target.value as any)}
                                        className={`bg-white border border-neutral-200 rounded text-xs p-1 focus:outline-none cursor-pointer ${
                                          inq.status === 'New'
                                            ? 'text-red-600 font-bold'
                                            : inq.status === 'Replied'
                                            ? 'text-emerald-600 font-bold'
                                            : inq.status === 'Read'
                                            ? 'text-blue-600 font-semibold'
                                            : 'text-neutral-500'
                                        }`}
                                      >
                                        <option value="New">New</option>
                                        <option value="Read">Read</option>
                                        <option value="Replied">Replied</option>
                                        <option value="Archived">Archived</option>
                                      </select>
                                    </td>
                                    <td className="p-4 text-right">
                                      {deletingInquiryId === inq.id ? (
                                        <div className="flex items-center justify-end space-x-1">
                                          <button
                                            onClick={() => handleDeleteInquiry(inq.id)}
                                            className="px-2 py-1 bg-red-600 hover:bg-red-700 text-white text-[10px] font-bold rounded cursor-pointer transition-colors"
                                          >
                                            Delete
                                          </button>
                                          <button
                                            onClick={() => setDeletingInquiryId(null)}
                                            className="px-2 py-1 bg-neutral-200 hover:bg-neutral-300 text-neutral-700 text-[10px] font-semibold rounded cursor-pointer"
                                          >
                                            Cancel
                                          </button>
                                        </div>
                                      ) : (
                                        <button
                                          onClick={() => setDeletingInquiryId(inq.id)}
                                          className="p-1.5 text-neutral-400 hover:text-red-600 transition-colors rounded hover:bg-red-50 cursor-pointer"
                                          title="Delete Inquiry"
                                        >
                                          <Trash2 className="w-3.5 h-3.5" />
                                        </button>
                                      )}
                                    </td>
                                  </tr>
                                );
                              })}
                            </tbody>
                          </table>
                        </div>
                      );
                    })()}
                  </div>
                </div>
              )}
            </div>
          )}
        </main>
      </div>
    </div>
  );
}
