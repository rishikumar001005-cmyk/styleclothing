import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { ShoppingBag, Heart, Star, ChevronRight, SlidersHorizontal, ArrowLeftRight, Eye, Sparkles, RefreshCw, X, ShieldAlert, Sparkle, Truck, RotateCcw, ShieldCheck, Instagram, Plus, Facebook, Youtube, CheckCircle2, ChevronUp } from 'lucide-react';
import { Banner, Color, Coupon, Order, Product } from './types';
import { clientAPI } from './api';

import Navbar from './components/Navbar';
import HeroSlider from './components/HeroSlider';
import ProductCard from './components/ProductCard';
import QuickViewModal from './components/QuickViewModal';
import ProfilePanel from './components/ProfilePanel';
import CheckoutModal from './components/CheckoutModal';
import AdminPanel from './components/AdminPanel';
import AboutView from './components/AboutView';
import ContactView from './components/ContactView';
import BlogView from './components/BlogView';
import ShopView from './components/ShopView';

const categoryWomenImg = '/src/assets/images/category_women_1784714372779.jpg';
const categoryMenImg = '/src/assets/images/category_men_1784714391512.jpg';
const categoryKidsImg = '/src/assets/images/category_kids_1784714407689.jpg';
const categoryAccessoriesImg = '/src/assets/images/category_accessories_1784716861515.jpg';

export default function App() {
  
  const [products, setProducts] = useState<Product[]>([]);
  const [banners, setBanners] = useState<Banner[]>([]);

  
  const [activeSection, setActiveSection] = useState<'all' | 'men' | 'women' | 'kids' | 'accessories' | 'about' | 'contact' | 'blog'>('all');
  const [activeCategory, setActiveCategory] = useState<string | null>(null);
  const [selectedBrand, setSelectedBrand] = useState<string | null>(null);
  const [selectedSize, setSelectedSize] = useState<string | null>(null);
  const [selectedColor, setSelectedColor] = useState<string | null>(null);
  const [priceMax, setPriceMax] = useState<number>(3000);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [sortOption, setSortOption] = useState<string>('featured');
  const [trendingTab, setTrendingTab] = useState<'trending' | 'recommended'>('trending');
  const [trendingSectionTab, setTrendingSectionTab] = useState<'men' | 'women' | 'kids'>('men');
  const [featuredCollectionTab, setFeaturedCollectionTab] = useState<'Summer' | 'Casual' | 'Formal' | 'Streetwear'>('Summer');

  
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isWishlistOpen, setIsWishlistOpen] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [profileInitialTab, setProfileInitialTab] = useState<'profile' | 'addresses' | 'orders' | 'notifications' | 'security'>('profile');
  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);
  const [quickViewProductId, setQuickViewProductId] = useState<string | null>(null);
  const [policyModal, setPolicyModal] = useState<{ title: string; content: string } | null>(null);
  const [addedToCartPopup, setAddedToCartPopup] = useState<{
    product: Product;
    quantity: number;
    size: string;
    color: Color;
  } | null>(null);

  
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [isAdminView, setIsAdminView] = useState(false);

  
  const [cart, setCart] = useState<any[]>([]);
  const [wishlist, setWishlist] = useState<Product[]>([]);
  const [compare, setCompare] = useState<Product[]>([]);
  const [recentlyViewed, setRecentlyViewed] = useState<Product[]>([]);

  
  const [loading, setLoading] = useState(true);

  
  useEffect(() => {
    setLoading(true);
    
    Promise.all([clientAPI.getProducts(), clientAPI.getBanners()])
      .then(([prods, sliderBanners]) => {
        console.log("API Response (Products):", prods);
        console.log("Is Array (Products):", Array.isArray(prods));
        setProducts(Array.isArray(prods) ? prods : []);
        setBanners(Array.isArray(sliderBanners) ? sliderBanners : []);
        setLoading(false);
      })
      .catch((err) => {
        console.error('Error seeding store assets:', err);
        setProducts([]);
        setLoading(false);
      });

    
    if (localStorage.getItem('styleclothing_token')) {
      clientAPI.getMe()
        .then((res) => {
          setCurrentUser(res);
        })
        .catch((err) => {
          console.error('Session expired', err);
          localStorage.removeItem('styleclothing_token');
        });
    }
  }, []);

  
  const getCartStorageKey = (user: any) => (user?.id ? `styleclothing_cart_${user.id}` : 'styleclothing_cart_guest');
  const getWishlistStorageKey = (user: any) => (user?.id ? `styleclothing_wishlist_${user.id}` : 'styleclothing_wishlist_guest');

  
  useEffect(() => {
    const cKey = getCartStorageKey(currentUser);
    const wKey = getWishlistStorageKey(currentUser);
    const cachedCart = localStorage.getItem(cKey);
    const cachedWishlist = localStorage.getItem(wKey);
    setCart(cachedCart ? JSON.parse(cachedCart) : []);
    setWishlist(cachedWishlist ? JSON.parse(cachedWishlist) : []);
    setCompare([]);
    setRecentlyViewed([]);
  }, [currentUser]);

  
  const [showBackToTop, setShowBackToTop] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 400) {
        setShowBackToTop(true);
      } else {
        setShowBackToTop(false);
      }
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  
  const updateCartState = (newCart: any[]) => {
    setCart(newCart);
    const cKey = getCartStorageKey(currentUser);
    localStorage.setItem(cKey, JSON.stringify(newCart));
  };

  
  const handleAddToCart = (product: Product, quantity: number, size: string, color: Color) => {
    const existingIdx = cart.findIndex(
      (item) => item.productId === product.id && item.selectedSize === size && item.selectedColor?.name === color.name
    );

    let newCart = [...cart];
    if (existingIdx > -1) {
      newCart[existingIdx].quantity += quantity;
    } else {
      newCart.push({
        productId: product.id,
        name: product.name,
        price: product.price,
        discount: product.discount,
        image: product.images[0],
        selectedSize: size,
        selectedColor: color,
        quantity,
        section: product.section,
      });
    }
    updateCartState(newCart);
    setAddedToCartPopup({ product, quantity, size, color });
  };

  const handleUpdateCartQty = (idx: number, qty: number) => {
    let newCart = [...cart];
    if (qty <= 0) {
      newCart.splice(idx, 1);
    } else {
      newCart[idx].quantity = qty;
    }
    updateCartState(newCart);
  };

  const handleRemoveFromCart = (idx: number) => {
    let newCart = [...cart];
    newCart.splice(idx, 1);
    updateCartState(newCart);
  };

  
  const handleToggleWishlist = (product: Product) => {
    const exists = wishlist.some((w) => w.id === product.id);
    let updated;
    if (exists) {
      updated = wishlist.filter((w) => w.id !== product.id);
    } else {
      updated = [...wishlist, product];
    }
    setWishlist(updated);
    const wKey = getWishlistStorageKey(currentUser);
    localStorage.setItem(wKey, JSON.stringify(updated));
  };

  
  const handleToggleCompare = (product: Product) => {
    const exists = compare.some((c) => c.id === product.id);
    if (exists) {
      setCompare(compare.filter((c) => c.id !== product.id));
    } else {
      if (compare.length >= 4) {
        alert('You can compare a maximum of 4 premium items at once.');
        return;
      }
      setCompare([...compare, product]);
    }
  };

  const showPolicy = (key: string) => {
    const policies: Record<string, { title: string; content: string }> = {
      privacy: {
        title: "Privacy Policy",
        content: "We value your privacy. All personalized fit data, tailoring orders, and payment records are secured using standard SSL encryption and industry-grade server safeguards. We do not sell or trade your data to third parties."
      },
      shipping: {
        title: "Shipping Policy",
        content: "We offer complimentary priority shipping across India on all orders exceeding ₹3500. For orders below ₹3500, a flat shipping fee of ₹150 is applied. Delivery takes 3-5 business days."
      },
      terms: {
        title: "Terms and Conditions",
        content: "By using our service, you agree to our terms. For bespoke garments, fit measurements provided are considered final once tailoring begins. Exchanges or amendments must be raised within 24 hours of order placement."
      },
      track: {
        title: "Track Order",
        content: "To track your order, please log into your account and view the 'My Orders' section in your Profile Panel. Active tracking links are generated automatically once shipped."
      },
      return: {
        title: "Return Policy",
        content: "If a garment does not fit as desired, we offer a complimentary 30-day return or alteration period. Simply initiate a request from your profile, or email our support desk at support@cloths.com."
      },
      store: {
        title: "Store Locator",
        content: "Our signature flagship atelier boutique is located at: 104, Colaba Causeway, Mumbai, India. Operating hours: Monday - Sunday, 10:00 AM to 8:30 PM. Walk-ins and private styling appointments are welcome."
      }
    };
    if (policies[key]) {
      setPolicyModal(policies[key]);
    }
  };

  
  const handleSelectProduct = (product: Product) => {
    
    if (!recentlyViewed.some((r) => r.id === product.id)) {
      setRecentlyViewed((prev) => [product, ...prev.slice(0, 3)]);
    }
    setQuickViewProductId(product.id);
  };

  
  const handleLoginSuccess = (user: any) => {
    setCurrentUser(user);
    setIsProfileOpen(false);
  };

  const handleLogout = () => {
    clientAPI.logout();
    setCurrentUser(null);
    setIsAdminView(false);
    setIsProfileOpen(false);
    setCart([]);
    setWishlist([]);
    setCompare([]);
    setRecentlyViewed([]);
  };

  const handleOrderSuccess = (order: Order) => {
    
    updateCartState([]);
  };

  
  const handleResetFilters = () => {
    setActiveCategory(null);
    setSelectedBrand(null);
    setSelectedSize(null);
    setSelectedColor(null);
    setPriceMax(3000);
    setSearchQuery('');
  };

  
  const triggerDemoAdmin = async () => {
    setLoading(true);
    try {
      
      const data = await clientAPI.login('admin@styleclothing.com', 'admin123');
      setCurrentUser(data.user);
      setIsAdminView(true);
      setIsProfileOpen(false);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  
  const filteredProducts = products.filter((p) => {
    
    if (activeSection !== 'all' && p.section !== activeSection) return false;
    
    if (activeCategory && p.category !== activeCategory) return false;
    
    if (selectedBrand && p.brand !== selectedBrand) return false;
    
    if (selectedSize && !p.sizes.includes(selectedSize)) return false;
    
    if (selectedColor && !p.colors.some((c) => c.name === selectedColor)) return false;
    
    const finalPrice = p.price * (1 - p.discount / 100);
    if (finalPrice > priceMax) return false;
    
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      const matchName = p.name.toLowerCase().includes(query);
      const matchBrand = p.brand.toLowerCase().includes(query);
      const matchCat = p.category.toLowerCase().includes(query);
      const matchDesc = p.description.toLowerCase().includes(query);
      if (!matchName && !matchBrand && !matchCat && !matchDesc) return false;
    }
    return true;
  });

  
  const sortedProducts = [...filteredProducts].sort((a, b) => {
    const aPrice = a.price * (1 - a.discount / 100);
    const bPrice = b.price * (1 - b.discount / 100);

    if (sortOption === 'price-low') return aPrice - bPrice;
    if (sortOption === 'price-high') return bPrice - aPrice;
    if (sortOption === 'rating') return b.rating - a.rating;
    if (sortOption === 'discount') return b.discount - a.discount;
    
    return b.rating - a.rating;
  });

  
  const uniqueBrands = Array.from(new Set(products.map((p) => p.brand)));
  const uniqueSizes = ['XS', 'S', 'M', 'L', 'XL', 'One Size'];
  const uniqueColors = Array.from(new Set(products.flatMap((p) => p.colors.map((c) => c.name))));

  
  if (isAdminView && currentUser?.role === 'admin') {
    return (
      <AdminPanel
        currentUser={currentUser}
        onBackToStore={() => setIsAdminView(false)}
      />
    );
  }

  
  const cartSubtotal = cart.reduce((sum, item) => sum + (item.price * (1 - item.discount / 100)) * item.quantity, 0);

  
  const newArrivalProducts = [...products]
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
    .slice(0, 4);

  const newArrivalIds = new Set(newArrivalProducts.map((p) => p.id));

  const bestSellerCandidates = [...products]
    .filter((p) => !newArrivalIds.has(p.id))
    .sort((a, b) => (b.reviewsCount || 0) - (a.reviewsCount || 0) || (b.rating || 0) - (a.rating || 0));

  const bestSellerProducts = bestSellerCandidates.length >= 4
    ? bestSellerCandidates.slice(0, 4)
    : [
        ...bestSellerCandidates,
        ...products
          .filter((p) => !bestSellerCandidates.some((b) => b.id === p.id))
          .sort((a, b) => (b.reviewsCount || 0) - (a.reviewsCount || 0))
          .slice(0, Math.max(0, 4 - bestSellerCandidates.length))
      ];

  return (
    <div className="min-h-screen bg-neutral-50/50 text-neutral-800 font-sans flex flex-col antialiased">
      <Navbar
        currentSection={activeSection}
        setSection={(sec) => {
          setActiveSection(sec as any);
          setActiveCategory(null);
        }}
        setCategory={(cat) => {
          setActiveCategory(cat);
          document.getElementById('boutique-catalog')?.scrollIntoView({ behavior: 'smooth' });
        }}
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
        cartCount={cart.reduce((sum, i) => sum + i.quantity, 0)}
        wishlistCount={wishlist.length}
        compareCount={0}
        currentUser={currentUser}
        onLogout={handleLogout}
        onOpenCart={() => setIsCartOpen(true)}
        onOpenWishlist={() => setIsWishlistOpen(true)}
        onOpenCompare={() => { }}
        onOpenProfile={(tab = 'profile') => {
          setProfileInitialTab(tab);
          setIsProfileOpen(true);
        }}
        navigateToAdmin={() => setIsAdminView(true)}
        navigateToHome={() => {
          setIsAdminView(false);
          setActiveSection('all');
          setActiveCategory(null);
        }}
      />

      {loading ? (
        <div className="flex-grow flex items-center justify-center min-h-[500px]">
          <div className="space-y-3.5 text-center">
            <div className="w-10 h-10 border-4 border-neutral-950 border-t-transparent rounded-full animate-spin mx-auto" />
            <p className="text-xs text-neutral-400 font-mono tracking-widest uppercase">
              Summoning the Style Clothing collections
            </p>
          </div>
        </div>
      ) : (
        <>
          {activeSection === 'about' ? (
            <AboutView />
          ) : activeSection === 'contact' ? (
            <ContactView />
          ) : activeSection === 'blog' ? (
            <BlogView />
          ) : ['men', 'women', 'kids', 'accessories'].includes(activeSection) ? (
            <ShopView
              section={activeSection as 'men' | 'women' | 'kids' | 'accessories'}
              products={products}
              wishlist={wishlist}
              compare={[]}
              searchQuery={searchQuery}
              onSearchChange={setSearchQuery}
              onToggleWishlist={handleToggleWishlist}
              onToggleCompare={() => { }}
              onQuickView={(pId) => setQuickViewProductId(pId)}
              onSelectProduct={handleSelectProduct}
              onAddToCart={handleAddToCart}
            />
          ) : (
            <>
              <HeroSlider
                banners={banners}
                onExplore={(link) => {
                  const lowerLink = link.toLowerCase();
                  if (lowerLink.includes('women')) {
                    setActiveSection('women');
                  } else if (lowerLink.includes('men')) {
                    setActiveSection('men');
                  } else if (lowerLink.includes('kids')) {
                    setActiveSection('kids');
                  } else if (lowerLink.includes('accessories')) {
                    setActiveSection('accessories');
                  }
                  window.scrollTo({ top: 0, behavior: 'smooth' });
                }}
              />

              <section className="max-w-[1600px] mx-auto px-4 sm:px-8 lg:px-12 py-16 border-t border-[#f5f5f5] font-sans">
                <div className="text-center space-y-2 mb-10">
                  <h2 className="text-2xl sm:text-3xl font-display uppercase tracking-[0.2em] text-neutral-900 font-medium">SHOP BY CATEGORY</h2>
                  <span className="text-[10px] font-bold tracking-[0.3em] text-neutral-400 uppercase">CURATING HIGH-END LUXURY FASHION DROPS</span>
                  <div className="w-8 h-[1px] bg-neutral-300 mx-auto mt-4" />
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-6">
                  {[
                    { key: 'men', label: 'Men Collection', img: categoryMenImg, desc: 'Tailored casuals & modular archetypes' },
                    { key: 'women', label: 'Women Collection', img: categoryWomenImg, desc: 'Summer linens & luxury drape fits' },
                    
                    { key: 'kids', label: 'Kids Boutique', img: categoryKidsImg, desc: 'Sustainably woven organic items' },
                    { key: 'accessories', label: 'Accessories', img: categoryAccessoriesImg, desc: 'Handcrafted bags, watches & leather' },
                  ].map((sec) => (
                    <div
                      key={sec.key}
                      onClick={() => {
                        setActiveSection(sec.key as any);
                        document.getElementById('boutique-catalog')?.scrollIntoView({ behavior: 'smooth' });
                      }}
                      className="group relative w-full aspect-[3/4] overflow-hidden rounded-none border border-[#eeeeee] cursor-pointer transition-all duration-350 hover:border-neutral-900"
                    >
                      <img
                        src={sec.img}
                        alt={sec.label}
                        referrerPolicy="no-referrer"
                        className="w-full h-full object-cover object-center group-hover:scale-102 transition-transform duration-700 ease-out"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-neutral-950/70 via-neutral-950/10 to-transparent" />
                      <div className="absolute bottom-6 left-6 right-6 text-white space-y-1">
                        <h3 className="text-sm font-display tracking-widest font-semibold uppercase">{sec.label}</h3>
                        <p className="text-[11px] text-neutral-300 font-light">{sec.desc}</p>
                        <span className="inline-flex items-center space-x-1.5 text-[10px] font-bold text-neutral-200 uppercase tracking-widest pt-2 group-hover:translate-x-1.5 group-hover:text-white transition-all duration-300">
                          <span>Browse Store</span>
                          <ChevronRight className="w-3 h-3" />
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </section>

              <section className="max-w-[1600px] mx-auto px-4 sm:px-8 lg:px-12 py-16 border-t border-[#f5f5f5] font-sans">
                <div className="text-center space-y-2 mb-10">
                  <h2 className="text-2xl sm:text-3xl font-display uppercase tracking-[0.2em] text-neutral-900 font-medium">Trending Collection</h2>
                  <span className="text-[10px] font-bold tracking-[0.3em] text-neutral-400 uppercase">TRENDING SELECTION</span>
                  <div className="w-8 h-[1px] bg-neutral-300 mx-auto mt-4" />
                </div>

                <div className="flex justify-center space-x-4 sm:space-x-6 mb-10">
                  {(['men', 'women', 'kids'] as const).map((tab) => (
                    <button
                      key={tab}
                      onClick={() => setTrendingSectionTab(tab)}
                      className={`px-6 py-2 text-xs font-bold uppercase tracking-[0.15em] transition-all border cursor-pointer ${trendingSectionTab === tab
                          ? 'border-neutral-900 bg-neutral-900 text-white'
                          : 'border-neutral-200 text-neutral-400 hover:text-neutral-900 hover:border-neutral-900'
                        }`}
                    >
                      {tab}
                    </button>
                  ))}
                </div>

                {products.filter((p) => p.section === trendingSectionTab).length === 0 ? (
                  <div className="text-center py-12 text-neutral-400 text-xs uppercase tracking-wider">
                    No trending designs in this category.
                  </div>
                ) : (
                  <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-6">
                    {products
                      .filter((p) => p.section === trendingSectionTab)
                      .sort((a, b) => b.reviewsCount - a.reviewsCount)
                      .slice(0, 4)
                      .map((p) => (
                        <ProductCard
                          key={`trending-${p.id}`}
                          product={p}
                          isWishlisted={wishlist.some((w) => w.id === p.id)}
                          isCompared={compare.some((c) => c.id === p.id)}
                          onToggleWishlist={() => handleToggleWishlist(p)}
                          onToggleCompare={() => handleToggleCompare(p)}
                          onQuickView={() => setQuickViewProductId(p.id)}
                          onSelectProduct={() => handleSelectProduct(p)}
                          onAddToCart={() => handleAddToCart(p, 1, p.sizes[0] || 'One Size', p.colors[0] || { name: 'Standard', hex: '#000000' })}
                        />
                      ))}
                  </div>
                )}
              </section>

              <section className="bg-[#fcfcfc] border-y border-[#f5f5f5] py-16 font-sans">
                <div className="max-w-[1600px] mx-auto px-4 sm:px-8 lg:px-12">
                  <div className="text-center space-y-2 mb-12">
                    <h2 className="text-2xl sm:text-3xl font-display uppercase tracking-[0.2em] text-neutral-900 font-medium">New Arrivals Products</h2>
                    <span className="text-[10px] font-bold tracking-[0.3em] text-neutral-400 uppercase">JUST IN</span>
                    <div className="w-8 h-[1px] bg-neutral-300 mx-auto mt-4" />
                  </div>

                  {newArrivalProducts.length === 0 ? (
                    <div className="text-center py-12 text-neutral-400 text-xs uppercase tracking-wider">
                      No products found.
                    </div>
                  ) : (
                    <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-6">
                      {newArrivalProducts.map((p) => (
                        <ProductCard
                          key={`new-${p.id}`}
                          product={p}
                          isWishlisted={wishlist.some((w) => w.id === p.id)}
                          isCompared={compare.some((c) => c.id === p.id)}
                          onToggleWishlist={() => handleToggleWishlist(p)}
                          onToggleCompare={() => handleToggleCompare(p)}
                          onQuickView={() => setQuickViewProductId(p.id)}
                          onSelectProduct={() => handleSelectProduct(p)}
                          onAddToCart={() => handleAddToCart(p, 1, p.sizes[0] || 'One Size', p.colors[0] || { name: 'Standard', hex: '#000000' })}
                        />
                      ))}
                    </div>
                  )}
                </div>
              </section>

              <section className="max-w-[1600px] mx-auto px-4 sm:px-8 lg:px-12 py-16 font-sans">
                <div className="text-center space-y-2 mb-10">
                  <h2 className="text-2xl sm:text-3xl font-display uppercase tracking-[0.2em] text-neutral-900 font-medium">Featured Collections</h2>
                  <span className="text-[10px] font-bold tracking-[0.3em] text-neutral-400 uppercase">EXCLUSIVE CURATIONS</span>
                  <div className="w-8 h-[1px] bg-neutral-300 mx-auto mt-4" />
                </div>

                <div className="flex flex-wrap justify-center gap-3 mb-10">
                  {(['Summer', 'Casual', 'Formal', 'Streetwear'] as const).map((col) => (
                    <button
                      key={col}
                      onClick={() => setFeaturedCollectionTab(col)}
                      className={`px-5 py-2 text-xs font-bold uppercase tracking-[0.15em] transition-all border cursor-pointer ${featuredCollectionTab === col
                          ? 'border-neutral-900 bg-neutral-900 text-white'
                          : 'border-neutral-200 text-neutral-400 hover:text-neutral-900 hover:border-neutral-900'
                        }`}
                    >
                      {col} Collection
                    </button>
                  ))}
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-6">
                  {(() => {
                    let filtered = products.filter((p) => {
                      const desc = p.description ? p.description.toLowerCase() : '';
                      const name = p.name ? p.name.toLowerCase() : '';
                      const cat = p.category ? p.category.toLowerCase() : '';
                      if (featuredCollectionTab === 'Summer') {
                        return desc.includes('summer') || desc.includes('linen') || desc.includes('flax') || cat.includes('dress') || cat.includes('summer');
                      } else if (featuredCollectionTab === 'Casual') {
                        return desc.includes('casual') || desc.includes('tee') || cat.includes('topwear') || cat.includes('bottomwear');
                      } else if (featuredCollectionTab === 'Formal') {
                        return desc.includes('blazer') || desc.includes('formal') || desc.includes('tailored') || desc.includes('suit') || desc.includes('sartorial') || name.includes('sartorial');
                      } else {
                        return desc.includes('street') || desc.includes('oversized') || desc.includes('hoodie') || desc.includes('jacket') || p.section === 'kids';
                      }
                    });

                    if (filtered.length === 0) {
                      filtered = products.slice(0, 4);
                    }

                    return filtered.slice(0, 4).map((p) => (
                      <ProductCard
                        key={`featured-${featuredCollectionTab}-${p.id}`}
                        product={p}
                        isWishlisted={wishlist.some((w) => w.id === p.id)}
                        isCompared={compare.some((c) => c.id === p.id)}
                        onToggleWishlist={() => handleToggleWishlist(p)}
                        onToggleCompare={() => handleToggleCompare(p)}
                        onQuickView={() => setQuickViewProductId(p.id)}
                        onSelectProduct={() => handleSelectProduct(p)}
                        onAddToCart={() => handleAddToCart(p, 1, p.sizes[0] || 'One Size', p.colors[0] || { name: 'Standard', hex: '#000000' })}
                      />
                    ));
                  })()}
                </div>
              </section>

              <section className="bg-[#fcfcfc] border-y border-[#f5f5f5] py-16 font-sans">
                <div className="max-w-[1600px] mx-auto px-4 sm:px-8 lg:px-12">
                  <div className="text-center space-y-2 mb-12">
                    <h2 className="text-2xl sm:text-3xl font-display uppercase tracking-[0.2em] text-neutral-900 font-medium">Best Sellers</h2>
                    <span className="text-[10px] font-bold tracking-[0.3em] text-neutral-400 uppercase">HIGHLY ACCLAIMED</span>
                    <div className="w-8 h-[1px] bg-neutral-300 mx-auto mt-4" />
                  </div>

                  {bestSellerProducts.length === 0 ? (
                    <div className="text-center py-12 text-neutral-400 text-xs uppercase tracking-wider">
                      No products found.
                    </div>
                  ) : (
                    <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-6">
                      {bestSellerProducts.map((p) => (
                        <ProductCard
                          key={`bestseller-${p.id}`}
                          product={p}
                          isWishlisted={wishlist.some((w) => w.id === p.id)}
                          isCompared={compare.some((c) => c.id === p.id)}
                          onToggleWishlist={() => handleToggleWishlist(p)}
                          onToggleCompare={() => handleToggleCompare(p)}
                          onQuickView={() => setQuickViewProductId(p.id)}
                          onSelectProduct={() => handleSelectProduct(p)}
                          onAddToCart={() => handleAddToCart(p, 1, p.sizes[0] || 'One Size', p.colors[0] || { name: 'Standard', hex: '#000000' })}
                        />
                      ))}
                    </div>
                  )}
                </div>
              </section>

              <section className="max-w-[1600px] mx-auto px-4 sm:px-8 lg:px-12 py-16 font-sans">
                <div className="text-center space-y-2 mb-12">
                  <h2 className="text-2xl sm:text-3xl font-display uppercase tracking-[0.2em] text-neutral-900 font-medium">Customer Reviews</h2>
                  <span className="text-[10px] font-bold tracking-[0.3em] text-neutral-400 uppercase">HEARD FROM OUR COMMUNITY</span>
                  <div className="w-8 h-[1px] bg-neutral-300 mx-auto mt-4" />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                  {[
                    {
                      id: 'rev-1',
                      name: 'Aishwarya Sen',
                      location: 'New Delhi, India',
                      rating: 5,
                      title: 'Impeccable Sartorial Detail',
                      text: 'The Italian linen blazer is a true work of art. The shoulder profile is completely natural and sits beautifully. Highly recommend their personalized fitting support.',
                      item: 'Sartorial Linen Blazer'
                    },
                    {
                      id: 'rev-2',
                      name: 'Vikram Mehta',
                      location: 'Mumbai, India',
                      rating: 5,
                      title: 'Pure Cashmere Perfection',
                      text: 'Absolutely flawless stitch density on the Monolith Cashmere Tee. It is incredibly soft and holds its structured oversized shape perfectly.',
                      item: 'Cashmere Tee'
                    },
                    {
                      id: 'rev-3',
                      name: 'Priyanka Rao',
                      location: 'Bengaluru, India',
                      rating: 5,
                      title: 'Outstanding Bespoke Drape',
                      text: 'StyleClothing is easily my favorite find of the year. The dress has an incredibly beautiful flow, and the fabric selection is wonderfully breathable.',
                      item: 'Aura Midi Dress'
                    }
                  ].map((rev) => (
                    <div key={rev.id} className="bg-white border border-[#eeeeee] p-8 flex flex-col justify-between transition-all duration-350 hover:border-neutral-900">
                      <div className="space-y-4">
                        <div className="flex space-x-1">
                          {[...Array(rev.rating)].map((_, i) => (
                            <Star key={i} className="w-3.5 h-3.5 fill-neutral-900 text-neutral-900" />
                          ))}
                        </div>

                        <div className="space-y-1">
                          <h4 className="text-xs font-bold uppercase tracking-wider text-neutral-900">{rev.title}</h4>
                          <p className="text-xs text-neutral-500 italic font-serif">"{rev.text}"</p>
                        </div>
                      </div>

                      <div className="mt-6 pt-4 border-t border-[#f5f5f5] flex justify-between items-center">
                        <div>
                          <p className="text-xs font-bold uppercase tracking-wider text-neutral-900">{rev.name}</p>
                          <p className="text-[10px] font-mono text-neutral-400">{rev.location}</p>
                        </div>
                        <span className="text-[9px] font-bold uppercase tracking-wider bg-neutral-100 px-2 py-1 text-neutral-600 truncate max-w-[150px]">
                          {rev.item}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </section>

            </>
          )}

          <section className="bg-white border-y border-[#eeeeee] py-8 font-sans w-full mt-12">
            <div className="max-w-[1600px] mx-auto px-4 sm:px-8 lg:px-12 grid grid-cols-1 md:grid-cols-3 gap-8 text-center">
              <div className="space-y-1.5 flex flex-col items-center">
                <Truck className="w-6 h-6 text-neutral-800 stroke-[1.2]" />
                <h4 className="text-xs font-bold uppercase tracking-[0.2em] text-[#111111]">Atelier Free Shipping</h4>
                <p className="text-[11px] text-neutral-400 uppercase tracking-wider">Complimentary priority delivery on invoice balances over ₹3500.</p>
              </div>
              <div className="space-y-1.5 flex flex-col items-center">
                <ShieldCheck className="w-6 h-6 text-neutral-800 stroke-[1.2]" />
                <h4 className="text-xs font-bold uppercase tracking-[0.2em] text-[#111111]">Secure Payments</h4>
                <p className="text-[11px] text-neutral-400 uppercase tracking-wider">Integrated directly via certified high-end Stripe & Razorpay gateways.</p>
              </div>
              <div className="space-y-1.5 flex flex-col items-center">
                <RotateCcw className="w-6 h-6 text-neutral-800 stroke-[1.2]" />
                <h4 className="text-xs font-bold uppercase tracking-[0.2em] text-[#111111]">Exclusive Exchanges</h4>
                <p className="text-[11px] text-neutral-400 uppercase tracking-wider">Return or exchange any tailored garment within 30 days hassle-free.</p>
              </div>
            </div>
          </section>

          <footer className="bg-black text-neutral-400 py-16 font-sans border-t border-neutral-900 select-none">
            <div className="max-w-[1600px] mx-auto px-4 sm:px-8 lg:px-12 grid grid-cols-1 md:grid-cols-4 gap-12">
              <div className="space-y-6 md:pr-6">
                <h4 className="text-white text-sm font-bold uppercase tracking-[0.1em]">
                  JOIN STYLE CLOTHING
                </h4>
                <p className="text-xs text-neutral-300 leading-relaxed font-normal tracking-wide">
                  Stay in the loop, with exclusive offers and product previews.
                </p>
                <form
                  onSubmit={(e) => {
                    e.preventDefault();
                    alert("Thank you for staying in the loop! Premium private updates will be sent to your email.");
                  }}
                  className="pt-4"
                >
                  <div className="flex items-end justify-between border-b border-neutral-700 pb-2.5">
                    <input
                      type="email"
                      required
                      placeholder="Your Email ID"
                      className="bg-transparent text-xs text-white placeholder-neutral-500 py-1 focus:outline-none w-full uppercase tracking-wider"
                    />
                    <button
                      type="submit"
                      className="text-[11px] text-white uppercase tracking-wider font-bold flex items-center space-x-1.5 pl-4 group transition-opacity hover:opacity-80 focus:outline-none"
                    >
                      <span>Subscribe</span>
                      <span className="text-sm leading-none transition-transform group-hover:translate-x-1">→</span>
                    </button>
                  </div>
                </form>
              </div>

              <div>
                <h4 className="text-white text-sm font-bold uppercase tracking-[0.1em] mb-6">
                  ABOUT
                </h4>
                <ul className="space-y-3 text-xs text-neutral-300 tracking-wide font-normal">
                  <li>
                    <button onClick={() => setActiveSection('about')} className="hover:text-white transition-colors cursor-pointer text-left focus:outline-none">
                      About Us
                    </button>
                  </li>
                  <li>
                    <button onClick={() => setActiveSection('contact')} className="hover:text-white transition-colors cursor-pointer text-left focus:outline-none">
                      Contact Us
                    </button>
                  </li>
                  <li>
                    <button onClick={() => setActiveSection('blog')} className="hover:text-white transition-colors cursor-pointer text-left focus:outline-none">
                      Blog
                    </button>
                  </li>
                  <li>
                    <button onClick={() => showPolicy('store')} className="hover:text-white transition-colors cursor-pointer text-left focus:outline-none">
                      Store Locator
                    </button>
                  </li>
                </ul>
              </div>

              <div>
                <h4 className="text-white text-sm font-bold uppercase tracking-[0.1em] mb-6">
                  POLICIES
                </h4>
                <ul className="space-y-3 text-xs text-neutral-300 tracking-wide font-normal">
                  <li>
                    <button onClick={() => showPolicy('privacy')} className="hover:text-white transition-colors cursor-pointer text-left focus:outline-none">
                      Privacy Policy
                    </button>
                  </li>
                  <li>
                    <button onClick={() => showPolicy('shipping')} className="hover:text-white transition-colors cursor-pointer text-left focus:outline-none">
                      Shipping Policy
                    </button>
                  </li>
                  <li>
                    <button onClick={() => showPolicy('terms')} className="hover:text-white transition-colors cursor-pointer text-left focus:outline-none">
                      Terms and Conditions
                    </button>
                  </li>
                  <li>
                    <button onClick={() => showPolicy('track')} className="hover:text-white transition-colors cursor-pointer text-left focus:outline-none">
                      Track Order
                    </button>
                  </li>
                  <li>
                    <button onClick={() => showPolicy('return')} className="hover:text-white transition-colors cursor-pointer text-left focus:outline-none">
                      Return Policy
                    </button>
                  </li>
                </ul>
              </div>

              <div>
                <h4 className="text-white text-sm font-bold uppercase tracking-[0.1em] mb-6">
                  Follow Us
                </h4>
                <div className="flex items-center space-x-3">
                  <a
                    href="https://facebook.com"
                    target="_blank"
                    rel="noreferrer"
                    className="w-8 h-8 rounded-full border border-neutral-700 flex items-center justify-center text-white hover:text-black hover:bg-white hover:border-white transition-all cursor-pointer"
                  >
                    <Facebook className="w-3.5 h-3.5" />
                  </a>
                  <a
                    href="https://x.com"
                    target="_blank"
                    rel="noreferrer"
                    className="w-8 h-8 rounded-full border border-neutral-700 flex items-center justify-center text-white hover:text-black hover:bg-white hover:border-white transition-all cursor-pointer font-bold text-xs font-sans"
                  >
                    X
                  </a>
                  <a
                    href="https://instagram.com"
                    target="_blank"
                    rel="noreferrer"
                    className="w-8 h-8 rounded-full border border-neutral-700 flex items-center justify-center text-white hover:text-black hover:bg-white hover:border-white transition-all cursor-pointer"
                  >
                    <Instagram className="w-3.5 h-3.5" />
                  </a>
                  <a
                    href="https://youtube.com"
                    target="_blank"
                    rel="noreferrer"
                    className="w-8 h-8 rounded-full border border-neutral-700 flex items-center justify-center text-white hover:text-black hover:bg-white hover:border-white transition-all cursor-pointer"
                  >
                    <Youtube className="w-3.5 h-3.5" />
                  </a>
                  <a
                    href="https://whatsapp.com"
                    target="_blank"
                    rel="noreferrer"
                    className="w-8 h-8 rounded-full border border-neutral-700 flex items-center justify-center text-white hover:text-black hover:bg-white hover:border-white transition-all cursor-pointer"
                  >
                    <svg className="w-3.5 h-3.5 fill-current" viewBox="0 0 24 24">
                      <path d="M12.012 2c-5.506 0-9.989 4.478-9.99 9.984a9.96 9.96 0 0 0 1.333 4.993L2 22l5.13-1.347a9.94 9.94 0 0 0 4.881 1.279h.005c5.505 0 9.988-4.478 9.989-9.985 0-2.669-1.037-5.176-2.922-7.062C17.199 3.037 14.686 2 12.012 2zm6.59 14.073c-.29.814-1.464 1.481-2.02 1.545-.556.064-1.127.322-3.61-.703-3.181-1.31-5.215-4.544-5.374-4.757-.159-.212-1.284-1.706-1.284-3.256 0-1.55.809-2.314 1.099-2.61.29-.297.635-.371.847-.371.212 0 .424.001.609.01.185.01.437-.037.683.556.25.603.86 2.093.935 2.241.074.148.122.318.022.519-.101.202-.15.328-.297.5-.148.17-.311.378-.444.507-.148.143-.303.3-.13.599.172.3.765 1.26 1.644 2.04.1.088.192.148.33.222.148.074.424.16.594-.022.17-.18.73-.85.926-1.143.196-.29.392-.244.662-.148.27.1.1.2.392 2.22c.29 1.46.25 1.59-.03 2.15z" />
                    </svg>
                  </a>
                </div>
              </div>
            </div>

            <div className="max-w-[1600px] mx-auto px-4 sm:px-8 lg:px-12 border-t border-neutral-900 pt-8 mt-10 text-center flex flex-col sm:flex-row items-center justify-between text-[11px] text-neutral-500">
              <p className="uppercase tracking-widest">&copy; 2026 STYLE CLOTHING. All Rights Reserved.</p>
              <div className="flex space-x-4 mt-4 sm:mt-0 font-semibold uppercase tracking-widest items-center">
                <button onClick={() => showPolicy('privacy')} className="hover:text-white transition-colors cursor-pointer">Privacy Policy</button>
                <span>|</span>
                <button onClick={() => showPolicy('terms')} className="hover:text-white transition-colors cursor-pointer">Terms of Use</button>
              </div>
            </div>
          </footer>
        </>
      )}

      <AnimatePresence>
        {isCartOpen && (
          <div className="fixed inset-0 z-50 overflow-hidden font-sans">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 0.5 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsCartOpen(false)}
              className="fixed inset-0 bg-neutral-950"
            />
            <div className="absolute inset-y-0 right-0 max-w-full flex pl-10">
              <motion.div
                initial={{ x: '100%' }}
                animate={{ x: 0 }}
                exit={{ x: '100%' }}
                transition={{ type: 'spring', damping: 25, stiffness: 200 }}
                className="w-screen max-w-md bg-white flex flex-col h-full border-l border-[#eeeeee]"
              >
                <div className="p-6 border-b border-[#eeeeee] flex items-center justify-between bg-neutral-50">
                  <div className="flex items-center space-x-2">
                    <ShoppingBag className="w-5 h-5 text-neutral-800" />
                    <h2 className="font-display text-sm tracking-[0.2em] font-bold uppercase text-neutral-950">
                      Shopping Bag
                    </h2>
                  </div>
                  <button onClick={() => setIsCartOpen(false)} className="p-1 text-neutral-450 hover:text-neutral-950">
                    <X className="w-5 h-5" />
                  </button>
                </div>

                <div className="flex-1 overflow-y-auto p-6 space-y-4">
                  {cart.length === 0 ? (
                    <div className="text-center py-20 space-y-4">
                      <ShoppingBag className="w-12 h-12 text-neutral-200 mx-auto stroke-[1]" />
                      <p className="text-xs text-neutral-400 font-medium">Your shopping bag is empty.</p>
                      <button onClick={() => setIsCartOpen(false)} className="px-5 py-2.5 bg-neutral-950 text-white font-sans text-xs font-bold uppercase tracking-widest rounded-none">
                        Shop Collection
                      </button>
                    </div>
                  ) : (
                    cart.map((item, idx) => {
                      const finalPrice = item.price * (1 - item.discount / 100);
                      return (
                        <div key={idx} className="flex items-center space-x-3.5 border-b border-neutral-100 pb-3.5 last:border-0">
                          <img src={item.image} alt={item.name} referrerPolicy="no-referrer" className="w-14 h-20 object-cover rounded-none border border-[#eeeeee]" />
                          <div className="flex-1 min-w-0">
                            <h4 className="text-xs font-medium text-neutral-850 line-clamp-1 uppercase tracking-wide">{item.name}</h4>
                            <p className="text-[10px] text-neutral-400 font-mono mt-0.5">Size: {item.selectedSize} | {item.selectedColor?.name}</p>

                            <div className="flex items-center space-x-2 mt-2">
                              <button onClick={() => handleUpdateCartQty(idx, item.quantity - 1)} className="p-1 bg-neutral-150 rounded-none text-neutral-600">&minus;</button>
                              <span className="text-xs font-mono font-bold w-5 text-center">{item.quantity}</span>
                              <button onClick={() => handleUpdateCartQty(idx, item.quantity + 1)} className="p-1 bg-neutral-150 rounded-none text-neutral-600">+</button>
                            </div>
                          </div>
                          <div className="text-right">
                            <span className="text-xs font-bold font-mono text-neutral-800">₹{(finalPrice * item.quantity).toFixed(2)}</span>
                            <button onClick={() => handleRemoveFromCart(idx)} className="block text-[10px] text-red-500 hover:underline mt-1">Remove</button>
                          </div>
                        </div>
                      );
                    })
                  )}
                </div>

                {cart.length > 0 && (
                  <div className="p-6 bg-neutral-50 border-t border-[#eeeeee] space-y-4">
                    <div className="flex justify-between text-sm font-semibold text-neutral-950 uppercase tracking-widest">
                      <span>Bag Subtotal</span>
                      <span className="font-mono text-[#111111]">₹{cartSubtotal.toFixed(2)}</span>
                    </div>
                    <button
                      onClick={() => {
                        setIsCartOpen(false);
                        setIsCheckoutOpen(true);
                      }}
                      className="w-full py-3.5 bg-neutral-950 text-white hover:bg-neutral-800 font-sans text-xs font-bold uppercase tracking-[0.2em] transition-all flex items-center justify-center space-x-2 rounded-none"
                    >
                      <span>Proceed to Secure Checkout</span>
                    </button>
                  </div>
                )}
              </motion.div>
            </div>
          </div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {isWishlistOpen && (
          <div className="fixed inset-0 z-50 overflow-hidden font-sans">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 0.5 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsWishlistOpen(false)}
              className="fixed inset-0 bg-neutral-950"
            />
            <div className="absolute inset-y-0 right-0 max-w-full flex pl-10">
              <motion.div
                initial={{ x: '100%' }}
                animate={{ x: 0 }}
                exit={{ x: '100%' }}
                transition={{ type: 'spring', damping: 25, stiffness: 200 }}
                className="w-screen max-w-md bg-white flex flex-col h-full border-l border-[#eeeeee]"
              >
                <div className="p-6 border-b border-[#eeeeee] flex items-center justify-between bg-neutral-50">
                  <div className="flex items-center space-x-2">
                    <Heart className="w-5 h-5 text-neutral-800 fill-neutral-800" />
                    <h2 className="font-display text-sm tracking-[0.2em] font-bold uppercase text-neutral-950">
                      Wishlist Collection
                    </h2>
                  </div>
                  <button onClick={() => setIsWishlistOpen(false)} className="p-1 text-neutral-450 hover:text-neutral-950">
                    <X className="w-5 h-5" />
                  </button>
                </div>

                <div className="flex-1 overflow-y-auto p-6 space-y-4">
                  {wishlist.length === 0 ? (
                    <div className="text-center py-20 space-y-4">
                      <Heart className="w-12 h-12 text-neutral-200 mx-auto stroke-[1]" />
                      <p className="text-xs text-neutral-400 font-medium">Your wishlist is empty.</p>
                      <button onClick={() => setIsWishlistOpen(false)} className="px-5 py-2.5 bg-neutral-950 text-white font-sans text-xs font-bold uppercase tracking-widest rounded-none">
                        Browse Designs
                      </button>
                    </div>
                  ) : (
                    wishlist.map((item) => {
                      const finalPrice = item.price * (1 - item.discount / 100);
                      return (
                        <div key={item.id} className="flex items-center space-x-3.5 border-b border-neutral-100 pb-3.5 last:border-0">
                          <img src={item.images[0]} alt={item.name} referrerPolicy="no-referrer" className="w-14 h-20 object-cover rounded-none border border-[#eeeeee]" />
                          <div className="flex-1 min-w-0">
                            <h4 className="text-xs font-medium text-neutral-850 line-clamp-1 uppercase tracking-wide">{item.name}</h4>
                            <p className="text-[10px] text-neutral-450 font-mono mt-0.5">{item.brand}</p>
                            <p className="text-xs font-bold font-mono text-neutral-800 mt-1">₹{finalPrice.toFixed(2)}</p>
                          </div>
                          <div className="flex flex-col space-y-2 text-right">
                            <button
                              onClick={() => {
                                handleAddToCart(item, 1, item.sizes[0] || 'M', item.colors[0]);
                                handleToggleWishlist(item);
                              }}
                              className="px-3 py-1.5 bg-neutral-950 text-white hover:bg-neutral-800 text-[9px] font-bold uppercase tracking-widest transition-all rounded-none"
                            >
                              Add to Bag
                            </button>
                            <button
                              onClick={() => handleToggleWishlist(item)}
                              className="text-[9px] text-red-500 hover:underline"
                            >
                              Remove
                            </button>
                          </div>
                        </div>
                      );
                    })
                  )}
                </div>
              </motion.div>
            </div>
          </div>
        )}
      </AnimatePresence>

      <ProfilePanel
        isOpen={isProfileOpen}
        onClose={() => setIsProfileOpen(false)}
        currentUser={currentUser}
        onLoginSuccess={handleLoginSuccess}
        onLogout={handleLogout}
        initialTab={profileInitialTab}
      />

      <QuickViewModal
        productId={quickViewProductId!}
        isOpen={!!quickViewProductId}
        onClose={() => setQuickViewProductId(null)}
        onAddToCart={handleAddToCart}
        onToggleWishlist={handleToggleWishlist}
        onToggleCompare={() => { }}
        isWishlisted={wishlist.some((w) => w.id === quickViewProductId)}
        isCompared={false}
        onSelectProduct={(id) => setQuickViewProductId(id)}
        setActiveSection={setActiveSection}
        showPolicy={showPolicy}
      />

      <CheckoutModal
        isOpen={isCheckoutOpen}
        onClose={() => setIsCheckoutOpen(false)}
        cartItems={cart}
        products={products}
        currentUser={currentUser}
        onOpenProfile={() => setIsProfileOpen(true)}
        onOrderSuccess={handleOrderSuccess}
      />

      <AnimatePresence>
        {policyModal && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 font-sans">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 0.6 }}
              exit={{ opacity: 0 }}
              onClick={() => setPolicyModal(null)}
              className="fixed inset-0 bg-neutral-950"
            />
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-white w-full max-w-md p-6 sm:p-8 relative z-10 border border-neutral-150 shadow-2xl"
            >
              <button
                onClick={() => setPolicyModal(null)}
                className="absolute top-4 right-4 p-1 text-neutral-450 hover:text-neutral-950 transition-colors"
                aria-label="Close modal"
              >
                <X className="w-5 h-5" />
              </button>

              <h3 className="text-sm font-bold uppercase tracking-[0.2em] text-[#111111] mb-4 pb-2 border-b border-neutral-150">
                {policyModal.title}
              </h3>

              <p className="text-xs text-neutral-600 leading-relaxed tracking-wide font-normal">
                {policyModal.content}
              </p>

              <div className="mt-8 flex justify-end">
                <button
                  onClick={() => setPolicyModal(null)}
                  className="px-6 py-2.5 bg-neutral-950 hover:bg-neutral-800 text-white text-[10px] font-bold uppercase tracking-widest transition-all rounded-none"
                >
                  Acknowledge
                </button>
              </div>
            </motion.div>
          </div>
        )}

        {addedToCartPopup && (
          <div className="fixed inset-0 z-[120] flex items-center justify-center p-4 font-sans">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 0.5 }}
              exit={{ opacity: 0 }}
              onClick={() => setAddedToCartPopup(null)}
              className="fixed inset-0 bg-neutral-950"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 15 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 15 }}
              transition={{ duration: 0.2 }}
              className="bg-white border border-neutral-900 shadow-2xl max-w-md w-full p-6 sm:p-7 relative z-10 rounded-none"
            >
              <button
                onClick={() => setAddedToCartPopup(null)}
                className="absolute top-4 right-4 p-1.5 text-neutral-400 hover:text-neutral-950 transition-colors"
                aria-label="Close"
              >
                <X className="w-5 h-5" />
              </button>

              <div className="flex items-center space-x-3 mb-5 border-b border-neutral-100 pb-4">
                <div className="w-9 h-9 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0 border border-emerald-200">
                  <CheckCircle2 className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-neutral-950 uppercase tracking-wider">
                    Added to Shopping Bag
                  </h3>
                  <p className="text-[11px] text-neutral-500 mt-0.5">
                    Your item has been registered in your bag
                  </p>
                </div>
              </div>

              <div className="flex items-start space-x-4 bg-neutral-50 p-3.5 border border-neutral-200/80 mb-6">
                <img
                  src={addedToCartPopup.product.images[0]}
                  alt={addedToCartPopup.product.name}
                  referrerPolicy="no-referrer"
                  className="w-16 h-20 object-cover border border-neutral-200 shrink-0"
                />
                <div className="flex-1 min-w-0">
                  <p className="text-[9px] font-bold text-neutral-400 uppercase tracking-widest">
                    {addedToCartPopup.product.brand}
                  </p>
                  <h4 className="text-xs font-semibold text-neutral-900 truncate uppercase mt-0.5">
                    {addedToCartPopup.product.name}
                  </h4>
                  <div className="flex items-center space-x-3 text-[11px] text-neutral-600 mt-2 font-mono">
                    <span>Size: <strong>{addedToCartPopup.size}</strong></span>
                    <span>Qty: <strong>{addedToCartPopup.quantity}</strong></span>
                  </div>
                  <p className="text-xs font-bold font-mono text-neutral-950 mt-1.5">
                    ₹{(addedToCartPopup.product.price * (1 - addedToCartPopup.product.discount / 100)).toFixed(2)}
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <button
                  onClick={() => {
                    setAddedToCartPopup(null);
                    setIsCartOpen(true);
                  }}
                  className="w-full py-3 bg-neutral-950 hover:bg-neutral-800 text-white font-sans text-xs font-bold uppercase tracking-widest transition-all rounded-none flex items-center justify-center space-x-2 cursor-pointer"
                >
                  <ShoppingBag className="w-4 h-4" />
                  <span>View Bag ({cart.reduce((sum, item) => sum + item.quantity, 0)})</span>
                </button>
                <button
                  onClick={() => setAddedToCartPopup(null)}
                  className="w-full py-3 bg-white hover:bg-neutral-100 text-neutral-900 border border-neutral-300 font-sans text-xs font-bold uppercase tracking-widest transition-all rounded-none cursor-pointer"
                >
                  Continue Shopping
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {showBackToTop && (
          <motion.button
            initial={{ opacity: 0, scale: 0.8, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.8, y: 20 }}
            transition={{ duration: 0.2 }}
            onClick={scrollToTop}
            aria-label="Back to top"
            className="fixed bottom-6 right-6 z-40 p-3.5 bg-neutral-950 hover:bg-neutral-800 text-white rounded-full shadow-xl border border-neutral-800 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-neutral-950 group cursor-pointer"
          >
            <ChevronUp className="w-5 h-5 group-hover:-translate-y-0.5 transition-transform duration-200" />
          </motion.button>
        )}
      </AnimatePresence>
    </div>
  );
}
