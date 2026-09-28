import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Search, Heart, ShoppingBag, User, ArrowLeftRight, X, Sparkles, LogOut, Shield, Menu, MapPin, ClipboardList, Bell } from 'lucide-react';
import { Color, Product } from '../types';
import { Logo } from './Logo';

interface NavbarProps {
  currentSection: string;
  setSection: (section: string) => void;
  setCategory: (category: string) => void;
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  cartCount: number;
  wishlistCount: number;
  compareCount: number;
  currentUser: any;
  onLogout: () => void;
  onOpenCart: () => void;
  onOpenWishlist: () => void;
  onOpenCompare: () => void;
  onOpenProfile: (tab?: 'profile' | 'addresses' | 'orders' | 'notifications' | 'security') => void;
  navigateToAdmin: () => void;
  navigateToHome: () => void;
}

export default function Navbar({
  currentSection,
  setSection,
  setCategory,
  searchQuery,
  setSearchQuery,
  cartCount,
  wishlistCount,
  compareCount,
  currentUser,
  onLogout,
  onOpenCart,
  onOpenWishlist,
  onOpenCompare,
  onOpenProfile,
  navigateToAdmin,
  navigateToHome,
}: NavbarProps) {
  const [activeMegaMenu, setActiveMegaMenu] = useState<string | null>(null);
  const [searchOpen, setSearchOpen] = useState(false);
  const [profileDropdownOpen, setProfileDropdownOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [expandedSec, setExpandedSec] = useState<string | null>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (searchOpen && searchInputRef.current) {
      searchInputRef.current.focus();
    }
  }, [searchOpen]);

  const sectionsData: Record<string, { categories: string[]; featText: string; featImage: string }> = {
    men: {
      categories: ['Topwear', 'Bottomwear', 'Footwear', 'Winterwear', 'Ethnic Wear', 'Outerwear'],
      featText: 'Linen Tailoring: Summer Resort Comfort',
      featImage: 'https://i.pinimg.com/1200x/3a/6d/29/3a6d29c757b755e22f18c55c53b323d0.jpg',
    },
    women: {
      categories: ['Topwear', 'Bottomwear', 'Dresses', 'Footwear', 'Winterwear', 'Ethnic Wear', 'Outerwear'],
      featText: 'Silk Satins: The Backless Slip Dress',
      featImage: 'https://i.pinimg.com/736x/3c/b5/9c/3cb59c6b7f6ec54723d80b789d5a194f.jpg',
    },
    kids: {
      categories: ['Baby', 'Boys', 'Girls', 'Dresses', 'Topwear', 'Sets', 'Outerwear', 'Footwear'],
      featText: 'Organic Pima Cottons: Play Soft',
      featImage: 'https://i.pinimg.com/736x/3e/9c/25/3e9c25bb964e0e379a4015be29045348.jpg',
    },
    accessories: {
      categories: ['Watches', 'Jewelry', 'Belts', 'Sunglasses', 'Hats', 'Scarves', 'Bags', 'Wallets'],
      featText: 'Atelier Details: Hand-finished Leather',
      featImage: '/images/accessories_final.png',
    },
  };

  const handleCategoryClick = (section: string, cat: string) => {
    setSection(section);
    setCategory(cat);
    setSearchQuery('');
    setActiveMegaMenu(null);
  };

  const handleSectionClick = (section: string) => {
    setSection(section);
    setCategory('');
    setSearchQuery('');
    setActiveMegaMenu(null);
  };

  return (
    <div className="sticky top-0 z-50 w-full flex flex-col bg-white">
      <header className="w-full bg-white/95 backdrop-blur-md border-b border-[#eeeeee] transition-all duration-300">
        <div className="max-w-[1600px] mx-auto px-4 sm:px-8 lg:px-12 h-20 flex items-center justify-between relative">
          <div className="flex-1 flex items-center justify-start space-x-2 sm:space-x-4">
            <button
              onClick={() => setIsMobileMenuOpen(true)}
              className="p-1.5 sm:p-2 -ml-1 text-neutral-600 hover:text-neutral-950 focus:outline-none md:hidden"
              aria-label="Open mobile menu"
            >
              <Menu className="w-5 h-5 sm:w-6 sm:h-6 stroke-[1.5]" />
            </button>

            <button
              onClick={navigateToHome}
              className="hidden md:block focus:outline-none hover:opacity-85 transition-opacity"
              aria-label="Home"
            >
              <Logo className="h-14 md:h-[74px] w-auto" showText={true} />
            </button>
          </div>

          <button
            onClick={navigateToHome}
            className="md:hidden absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 focus:outline-none hover:opacity-85 transition-opacity"
            aria-label="Home"
          >
            <Logo className="h-12 sm:h-14 w-auto" showText={true} />
          </button>

          <nav className="hidden md:flex items-center space-x-10 h-full">
            {Object.keys(sectionsData).map((sec) => (
              <div
                key={sec}
                className="h-full flex items-center"
                onMouseEnter={() => setActiveMegaMenu(sec)}
                onMouseLeave={() => setActiveMegaMenu(null)}
              >
                <button
                  onClick={() => handleSectionClick(sec)}
                  className={`font-sans text-[11px] tracking-[0.2em] uppercase font-semibold h-full flex items-center relative transition-colors focus:outline-none cursor-pointer ${
                    currentSection === sec ? 'text-[#111111]' : 'text-neutral-500 hover:text-[#111111]'
                  }`}
                >
                  {sec}
                  {currentSection === sec && (
                    <motion.div
                      layoutId="activeNavLine"
                      className="absolute bottom-0 left-0 right-0 h-[1.5px] bg-[#111111]"
                      transition={{ type: 'spring', stiffness: 380, damping: 30 }}
                    />
                  )}
                </button>
              </div>
            ))}

            {['about', 'contact', 'blog'].map((page) => (
              <div key={page} className="h-full flex items-center">
                <button
                  onClick={() => {
                    setSection(page);
                    setCategory('');
                  }}
                  className={`font-sans text-[11px] tracking-[0.2em] uppercase font-semibold h-full flex items-center relative transition-colors focus:outline-none cursor-pointer ${
                    currentSection === page ? 'text-[#111111]' : 'text-neutral-500 hover:text-[#111111]'
                  }`}
                >
                  {page === 'about' ? 'About Us' : page === 'contact' ? 'Contact Us' : 'Blog'}
                  {currentSection === page && (
                    <motion.div
                      layoutId="activeNavLine"
                      className="absolute bottom-0 left-0 right-0 h-[1.5px] bg-[#111111]"
                      transition={{ type: 'spring', stiffness: 380, damping: 30 }}
                    />
                  )}
                </button>
              </div>
            ))}
          </nav>

        <div className="flex-1 flex items-center justify-end space-x-1 sm:space-x-3">
          <button
            onClick={onOpenWishlist}
            className="inline-flex p-1.5 sm:p-2 text-neutral-600 hover:text-neutral-950 focus:outline-none relative transition-colors"
            title="Wishlist"
          >
            <Heart className="w-4 h-4 sm:w-5 sm:h-5 stroke-[1.5]" />
            {wishlistCount > 0 && (
              <span className="absolute top-0.5 right-0.5 sm:top-1.5 sm:right-1.5 w-3.5 h-3.5 sm:w-4 sm:h-4 bg-black text-white font-mono text-[7px] sm:text-[8px] font-bold flex items-center justify-center rounded-full">
                {wishlistCount}
              </span>
            )}
          </button>

          <button
            onClick={onOpenCart}
            className="inline-flex p-1.5 sm:p-2 text-neutral-600 hover:text-neutral-950 focus:outline-none relative transition-colors"
            title="Shopping Cart"
          >
            <ShoppingBag className="w-4 h-4 sm:w-5 sm:h-5 stroke-[1.5]" />
            {cartCount > 0 && (
              <span className="absolute top-0.5 right-0.5 sm:top-1.5 sm:right-1.5 w-3.5 h-3.5 sm:w-4 sm:h-4 bg-black text-white font-mono text-[7px] sm:text-[8px] font-bold flex items-center justify-center rounded-full">
                {cartCount}
              </span>
            )}
          </button>

          <div className="relative hidden md:block">
            <button
              onClick={() => {
                if (currentUser) {
                  setProfileDropdownOpen(!profileDropdownOpen);
                } else {
                  onOpenProfile();
                }
              }}
              className="p-1.5 text-neutral-600 hover:text-neutral-950 focus:outline-none relative transition-colors flex items-center justify-center"
              title={currentUser ? `Account: ${currentUser.name}` : "Log In"}
            >
              {currentUser?.avatarUrl ? (
                <img src={currentUser.avatarUrl} alt={currentUser.name} className="w-6 h-6 rounded-full object-cover border border-neutral-300" />
              ) : (
                <User className="w-5 h-5 stroke-[1.5] rounded-full" />
              )}
              {currentUser && (
                <span className="absolute bottom-1 right-1 w-2 h-2 bg-emerald-500 rounded-full border border-white" />
              )}
            </button>

            <AnimatePresence>
              {profileDropdownOpen && currentUser && (
                <>
                  <div
                    className="fixed inset-0 z-40"
                    onClick={() => setProfileDropdownOpen(false)}
                  />
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 10 }}
                    transition={{ duration: 0.2 }}
                    className="absolute right-0 mt-2 w-64 bg-white rounded-none shadow-md border border-[#eeeeee] py-3 z-50 font-sans"
                  >
                    <div className="px-4 py-2 border-b border-neutral-50 mb-2 flex items-center space-x-3">
                      {currentUser.avatarUrl ? (
                        <img src={currentUser.avatarUrl} alt={currentUser.name} className="w-9 h-9 rounded-full object-cover border border-neutral-200 shrink-0" />
                      ) : (
                        <div className="w-9 h-9 rounded-full bg-white text-black font-bold text-xs flex items-center justify-center border border-neutral-300 shrink-0">
                          {currentUser.name ? currentUser.name[0].toUpperCase() : 'U'}
                        </div>
                      )}
                      <div className="overflow-hidden">
                        <p className="text-[10px] text-neutral-400 font-bold uppercase tracking-wider">Signed in as</p>
                        <p className="text-xs font-semibold text-neutral-800 truncate">{currentUser.name}</p>
                        <p className="text-[10px] text-neutral-500 truncate font-mono">{currentUser.email}</p>
                      </div>
                    </div>

                    <button
                      onClick={() => {
                        setProfileDropdownOpen(false);
                        onOpenProfile('profile');
                      }}
                      className="w-full text-left px-4 py-2 text-xs text-neutral-700 hover:bg-neutral-50 hover:text-neutral-950 flex items-center space-x-2.5 transition-colors"
                    >
                      <User className="w-4 h-4 stroke-[1.5] text-neutral-500" />
                      <span>My Profile</span>
                    </button>

                    <button
                      onClick={() => {
                        setProfileDropdownOpen(false);
                        onOpenProfile('addresses');
                      }}
                      className="w-full text-left px-4 py-2 text-xs text-neutral-700 hover:bg-neutral-50 hover:text-neutral-950 flex items-center space-x-2.5 transition-colors"
                    >
                      <MapPin className="w-4 h-4 stroke-[1.5] text-neutral-500" />
                      <span>Addresses</span>
                    </button>

                    <button
                      onClick={() => {
                        setProfileDropdownOpen(false);
                        onOpenProfile('orders');
                      }}
                      className="w-full text-left px-4 py-2 text-xs text-neutral-700 hover:bg-neutral-50 hover:text-neutral-950 flex items-center space-x-2.5 transition-colors"
                    >
                      <ClipboardList className="w-4 h-4 stroke-[1.5] text-neutral-500" />
                      <span>Order History</span>
                    </button>

                    <button
                      onClick={() => {
                        setProfileDropdownOpen(false);
                        onOpenProfile('notifications');
                      }}
                      className="w-full text-left px-4 py-2 text-xs text-neutral-700 hover:bg-neutral-50 hover:text-neutral-950 flex items-center space-x-2.5 transition-colors"
                    >
                      <Bell className="w-4 h-4 stroke-[1.5] text-neutral-500" />
                      <span>Notifications</span>
                    </button>

                    <button
                      onClick={() => {
                        setProfileDropdownOpen(false);
                        onOpenProfile('security');
                      }}
                      className="w-full text-left px-4 py-2 text-xs text-neutral-700 hover:bg-neutral-50 hover:text-neutral-950 flex items-center space-x-2.5 transition-colors"
                    >
                      <Shield className="w-4 h-4 stroke-[1.5] text-neutral-500" />
                      <span>Security</span>
                    </button>

                    {currentUser.role === 'admin' && (
                      <button
                        onClick={() => {
                          setProfileDropdownOpen(false);
                          navigateToAdmin();
                        }}
                        className="w-full text-left px-4 py-2.5 text-xs text-neutral-800 hover:bg-neutral-50 hover:text-[#111111] flex items-center space-x-2.5 transition-colors font-semibold border-t border-neutral-100"
                      >
                        <Shield className="w-4 h-4 stroke-[1.5] text-neutral-800" />
                        <span>Admin Control Panel</span>
                      </button>
                    )}

                    <button
                      onClick={() => {
                        setProfileDropdownOpen(false);
                        onLogout();
                      }}
                      className="w-full text-left px-4 py-2.5 text-xs text-red-600 hover:bg-red-50 hover:text-red-700 flex items-center space-x-2.5 transition-colors border-t border-neutral-50 mt-1"
                    >
                      <LogOut className="w-4 h-4 stroke-[1.5]" />
                      <span>Log Out</span>
                    </button>
                  </motion.div>
                </>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>

      <AnimatePresence>
        {searchOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="w-full bg-neutral-950 text-white border-t border-neutral-800 font-sans overflow-hidden"
          >
            <div className="max-w-4xl mx-auto px-4 py-6 flex items-center space-x-4">
              <Search className="w-5 h-5 text-neutral-400 shrink-0" />
              <input
                ref={searchInputRef}
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search collection (e.g. Linen Blazer, Cashmere, Silk)..."
                className="w-full bg-transparent text-white placeholder-neutral-500 font-sans text-sm focus:outline-none"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  className="p-1 hover:bg-neutral-800 rounded-full text-neutral-400 hover:text-white"
                >
                  <X className="w-4 h-4" />
                </button>
              )}
              <button
                onClick={() => {
                  setSearchOpen(false);
                  setSearchQuery('');
                }}
                className="text-xs text-neutral-400 hover:text-white uppercase tracking-[0.1em]"
              >
                Close
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {activeMegaMenu && (
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 15 }}
            transition={{ duration: 0.2 }}
            onMouseEnter={() => setActiveMegaMenu(activeMegaMenu)}
            onMouseLeave={() => setActiveMegaMenu(null)}
            className="absolute top-20 left-0 right-0 bg-white shadow-xl border-b border-[#eeeeee] z-50 py-10 font-sans"
          >
            <div className="max-w-[1600px] mx-auto px-4 sm:px-8 lg:px-12 grid grid-cols-4 gap-8">
              <div className="col-span-2">
                <p className="text-xs font-semibold uppercase tracking-[0.2em] text-neutral-400 mb-6">
                  {activeMegaMenu} Collections
                </p>
                <div className="grid grid-cols-2 gap-y-4 gap-x-8">
                  {sectionsData[activeMegaMenu].categories.map((cat) => (
                    <button
                      key={cat}
                      onClick={() => handleCategoryClick(activeMegaMenu, cat)}
                      className="text-left text-xs uppercase tracking-wider text-neutral-600 hover:text-[#111111] transition-colors font-semibold cursor-pointer"
                    >
                      {cat}
                    </button>
                  ))}
                </div>
              </div>

              <div className="bg-[#f9f9f9] p-6 flex flex-col justify-between border border-[#eeeeee] rounded-none">
                <div>
                  <div className="flex items-center space-x-1.5 text-neutral-800 mb-2">
                    <Sparkles className="w-3.5 h-3.5 text-neutral-500" />
                    <span className="text-[9px] uppercase font-bold tracking-[0.15em]">Style Clothing Editorial</span>
                  </div>
                  <h4 className="text-xs font-semibold text-neutral-900 uppercase tracking-wider mb-2">
                    {sectionsData[activeMegaMenu].featText}
                  </h4>
                  <p className="text-[11px] text-neutral-500 leading-relaxed">
                    Designed around core tailoring principles and durable natural fabrics. Our bespoke matching ideas elevate any seasonal wardrobe.
                  </p>
                </div>
                <button
                  onClick={() => {
                    handleSectionClick(activeMegaMenu);
                  }}
                  className="mt-4 inline-flex items-center space-x-2 text-[10px] uppercase tracking-wider font-bold text-[#111111] hover:underline cursor-pointer"
                >
                  <span>Explore Collection</span>
                  <span>&rarr;</span>
                </button>
              </div>

              <div className="relative group overflow-hidden rounded-none aspect-[4/3] bg-neutral-100">
                <img
                  src={sectionsData[activeMegaMenu].featImage}
                  alt="Mega menu feature"
                  referrerPolicy="no-referrer"
                  className="w-full h-full object-cover group-hover:scale-102 transition-transform duration-700 ease-out"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-neutral-950/80 via-neutral-950/10 to-transparent flex items-end p-6">
                  <div>
                    <span className="text-[9px] uppercase font-bold tracking-[0.2em] text-neutral-300">
                      Spotlight
                    </span>
                    <h5 className="text-xs font-display font-medium text-white uppercase tracking-[0.2em] mt-1">
                      NEW IN ATELIER
                    </h5>
                    <button
                      onClick={() => handleSectionClick(activeMegaMenu)}
                      className="text-[9px] text-white hover:text-neutral-300 transition-colors uppercase tracking-[0.15em] font-semibold mt-2.5 flex items-center space-x-1"
                    >
                      <span>Explore Section</span>
                      <span>&rarr;</span>
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>

    <AnimatePresence>
      {isMobileMenuOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 0.5 }}
            exit={{ opacity: 0 }}
            onClick={() => setIsMobileMenuOpen(false)}
            className="fixed inset-0 bg-black z-50 md:hidden"
          />

          <motion.div
            initial={{ x: '-100%' }}
            animate={{ x: 0 }}
            exit={{ x: '-100%' }}
            transition={{ type: 'tween', duration: 0.3 }}
            className="fixed inset-y-0 left-0 w-4/5 max-w-sm bg-white shadow-2xl z-50 flex flex-col md:hidden font-sans h-screen overflow-hidden"
          >
            <div className="p-5 border-b border-neutral-100 flex items-center justify-between">
              <div className="flex items-center">
                <Logo className="h-15 w-auto" showText={true} />
              </div>
              <button
                onClick={() => setIsMobileMenuOpen(false)}
                className="p-2 text-neutral-500 hover:text-neutral-900 focus:outline-none"
                aria-label="Close mobile menu"
              >
                <X className="w-5 h-5 stroke-[1.5]" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-5 space-y-6">
              <div className="space-y-3.5 pb-2 border-b border-neutral-100">
                <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-neutral-400">
                  My Selection
                </p>
                
                <button
                  onClick={() => {
                    setIsMobileMenuOpen(false);
                    onOpenWishlist();
                  }}
                  className="w-full flex items-center justify-between text-xs uppercase tracking-widest font-semibold py-1.5 text-neutral-600 hover:text-neutral-950 focus:outline-none"
                >
                  <span className="flex items-center space-x-2.5">
                    <Heart className="w-4 h-4 stroke-[1.5]" />
                    <span>My Wishlist</span>
                  </span>
                  {wishlistCount > 0 && (
                    <span className="w-5 h-5 bg-black text-white font-mono text-[9px] font-bold flex items-center justify-center rounded-full">
                      {wishlistCount}
                    </span>
                  )}
                </button>

                <button
                  onClick={() => {
                    setIsMobileMenuOpen(false);
                    onOpenCart();
                  }}
                  className="w-full flex items-center justify-between text-xs uppercase tracking-widest font-semibold py-1.5 text-neutral-600 hover:text-neutral-950 focus:outline-none"
                >
                  <span className="flex items-center space-x-2.5">
                    <ShoppingBag className="w-4 h-4 stroke-[1.5]" />
                    <span>My Cart</span>
                  </span>
                  {cartCount > 0 && (
                    <span className="w-5 h-5 bg-black text-white font-mono text-[9px] font-bold flex items-center justify-center rounded-full">
                      {cartCount}
                    </span>
                  )}
                </button>

                <button
                  onClick={() => {
                    setIsMobileMenuOpen(false);
                    onOpenProfile();
                  }}
                  className="w-full flex items-center justify-between text-xs uppercase tracking-widest font-semibold py-1.5 text-neutral-600 hover:text-neutral-950 focus:outline-none border-t border-neutral-100/50 pt-3 mt-1"
                >
                  <span className="flex items-center space-x-2.5">
                    <User className="w-4 h-4 stroke-[1.5]" />
                    <span>{currentUser ? 'My Customer Hub' : 'Customer Entrance'}</span>
                  </span>
                  {currentUser && (
                    <span className="w-2 h-2 bg-emerald-500 rounded-full" />
                  )}
                </button>
              </div>

              <div className="space-y-4">
                <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-neutral-400 border-b border-neutral-50 pb-2">
                  Shop Collections
                </p>
                
                {Object.keys(sectionsData).map((sec) => {
                  const isExpanded = expandedSec === sec;
                  return (
                    <div key={sec} className="border-b border-neutral-50 pb-2.5 last:border-0">
                      <button
                        onClick={() => setExpandedSec(isExpanded ? null : sec)}
                        className="w-full flex items-center justify-between py-1.5 text-xs font-bold uppercase tracking-widest text-neutral-800 hover:text-neutral-950"
                      >
                        <span className="capitalize">{sec}</span>
                        <span className="text-neutral-500 font-mono text-sm">
                          {isExpanded ? '−' : '+'}
                        </span>
                      </button>

                      {isExpanded && (
                        <motion.div
                          initial={{ opacity: 0, height: 0 }}
                          animate={{ opacity: 1, height: 'auto' }}
                          exit={{ opacity: 0, height: 0 }}
                          className="mt-2 pl-3 space-y-2 flex flex-col items-start border-l border-neutral-100"
                        >
                          <button
                            onClick={() => {
                              handleSectionClick(sec);
                              setIsMobileMenuOpen(false);
                            }}
                            className="text-left text-[11px] font-bold text-neutral-950 uppercase tracking-wider py-1 hover:underline"
                          >
                            Explore All {sec}
                          </button>

                          {sectionsData[sec].categories.map((cat) => (
                              <button
                                key={cat}
                                onClick={() => {
                                  handleCategoryClick(sec, cat);
                                  setIsMobileMenuOpen(false);
                                }}
                                className="text-left text-[11px] text-neutral-500 uppercase tracking-wider py-1 hover:text-neutral-950"
                              >
                                {cat}
                              </button>
                          ))}
                        </motion.div>
                      )}
                    </div>
                  );
                })}
              </div>

              <div className="space-y-3.5 pt-2">
                <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-neutral-400 border-b border-neutral-50 pb-2">
                  Atelier Info
                </p>
                {['about', 'contact', 'blog'].map((page) => (
                  <button
                    key={page}
                    onClick={() => {
                      setSection(page);
                      setCategory('');
                      setIsMobileMenuOpen(false);
                    }}
                    className={`w-full text-left text-xs uppercase tracking-widest font-semibold py-1.5 transition-colors focus:outline-none ${
                      currentSection === page ? 'text-neutral-950 font-bold' : 'text-neutral-600 hover:text-neutral-950'
                    }`}
                  >
                    {page === 'about' ? 'About Us' : page === 'contact' ? 'Contact Us' : 'Blog'}
                  </button>
                ))}
              </div>
            </div>

            <div className="p-5 border-t border-neutral-100 bg-neutral-50">
              {currentUser ? (
                <div className="space-y-3">
                  <div className="flex items-center space-x-3">
                    <div className="w-8 h-8 bg-neutral-200 rounded-full flex items-center justify-center font-bold text-neutral-700 text-sm">
                      {currentUser.name ? currentUser.name[0].toUpperCase() : 'U'}
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="text-xs font-bold text-neutral-800 truncate">{currentUser.name}</p>
                      <p className="text-[10px] text-neutral-500 truncate">{currentUser.email}</p>
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-2 pt-1">
                    <button
                      onClick={() => {
                        setIsMobileMenuOpen(false);
                        onOpenProfile();
                      }}
                      className="w-full py-2 bg-white border border-neutral-200 hover:border-neutral-300 text-[10px] font-bold uppercase tracking-wider text-neutral-700 text-center"
                    >
                      Profile
                    </button>
                    <button
                      onClick={() => {
                        setIsMobileMenuOpen(false);
                        onLogout();
                      }}
                      className="w-full py-2 bg-red-50 hover:bg-red-100 text-[10px] font-bold uppercase tracking-wider text-red-600 text-center"
                    >
                      Logout
                    </button>
                  </div>
                </div>
              ) : (
                <button
                  onClick={() => {
                    setIsMobileMenuOpen(false);
                    onOpenProfile();
                  }}
                  className="w-full bg-neutral-950 text-white py-2.5 text-center text-xs tracking-wider font-semibold uppercase hover:bg-neutral-800 transition-colors"
                >
                  Customer Entrance
                </button>
              )}
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
    </div>
  );
}
