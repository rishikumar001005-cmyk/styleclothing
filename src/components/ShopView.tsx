import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { SlidersHorizontal, ArrowLeftRight, Heart, Eye, Sparkles, ChevronRight, Check } from 'lucide-react';
import { Color, Product } from '../types';
import ProductCard from './ProductCard';

interface ShopViewProps {
  section: 'men' | 'women' | 'kids' | 'accessories';
  products: Product[];
  wishlist: Product[];
  compare: Product[];
  searchQuery?: string;
  onSearchChange?: (query: string) => void;
  onToggleWishlist: (product: Product) => void;
  onToggleCompare: (product: Product) => void;
  onQuickView: (productId: string) => void;
  onSelectProduct: (product: Product) => void;
  onAddToCart?: (product: Product, quantity: number, size: string, color: Color) => void;
}

export const SECTION_CATEGORY_ORDER: Record<'men' | 'women' | 'kids' | 'accessories', string[]> = {
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

export default function ShopView({
  section,
  products,
  wishlist,
  compare,
  searchQuery: propSearchQuery,
  onSearchChange,
  onToggleWishlist,
  onToggleCompare,
  onQuickView,
  onSelectProduct,
  onAddToCart,
}: ShopViewProps) {
  
  const [activeCategory, setActiveCategory] = useState<string | null>(null);
  const [selectedBrand, setSelectedBrand] = useState<string | null>(null);
  const [selectedSize, setSelectedSize] = useState<string | null>(null);
  const [selectedColor, setSelectedColor] = useState<string | null>(null);
  const [priceMax, setPriceMax] = useState<number>(3000);
  const [localSearchQuery, setLocalSearchQuery] = useState<string>('');
  const [sortOption, setSortOption] = useState<string>('featured');
  const [mobileFiltersOpen, setMobileFiltersOpen] = useState<boolean>(false);

  const activeSearchQuery = propSearchQuery !== undefined ? propSearchQuery : localSearchQuery;

  const handleSearchChange = (query: string) => {
    if (onSearchChange) {
      onSearchChange(query);
    }
    setLocalSearchQuery(query);
  };

  
  const sectionProducts = useMemo(() => {
    return products.filter((p) => p.section === section);
  }, [products, section]);

  
  const categories = useMemo(() => {
    return SECTION_CATEGORY_ORDER[section] || [];
  }, [section]);

  const uniqueBrands = useMemo(() => {
    return Array.from(new Set(sectionProducts.map((p) => p.brand)));
  }, [sectionProducts]);

  const uniqueSizes = useMemo(() => {
    return Array.from(new Set(sectionProducts.flatMap((p) => p.sizes)));
  }, [sectionProducts]);

  const uniqueColors = useMemo(() => {
    return Array.from(new Set(sectionProducts.flatMap((p) => p.colors.map((c) => c.name))));
  }, [sectionProducts]);

  
  const handleResetFilters = () => {
    setActiveCategory(null);
    setSelectedBrand(null);
    setSelectedSize(null);
    setSelectedColor(null);
    setPriceMax(3000);
    handleSearchChange('');
  };

  
  const filteredProducts = useMemo(() => {
    return sectionProducts.filter((product) => {
      
      if (activeCategory) {
        const activeLower = activeCategory.toLowerCase().trim();
        const catLower = (product.category || '').toLowerCase().trim();
        
        
        if ((activeLower === 'jewelry' || activeLower === 'jewellery') && (catLower === 'jewelry' || catLower === 'jewellery')) {
          
        } else if (catLower !== activeLower) {
          return false;
        }
      }

      
      if (selectedBrand && product.brand !== selectedBrand) return false;

      
      if (selectedSize && !product.sizes.includes(selectedSize)) return false;

      
      if (selectedColor && !product.colors.some((c) => c.name === selectedColor)) return false;

      
      const finalPrice = product.price * (1 - product.discount / 100);
      if (finalPrice > priceMax) return false;

      
      if (activeSearchQuery) {
        const query = activeSearchQuery.toLowerCase();
        const matchesName = product.name.toLowerCase().includes(query);
        const matchesDesc = product.description.toLowerCase().includes(query);
        const matchesBrand = product.brand.toLowerCase().includes(query);
        const matchesCat = product.category.toLowerCase().includes(query);
        if (!matchesName && !matchesDesc && !matchesBrand && !matchesCat) return false;
      }

      return true;
    });
  }, [sectionProducts, activeCategory, selectedBrand, selectedSize, selectedColor, priceMax, activeSearchQuery]);

  const sortedProducts = useMemo(() => {
    const list = [...filteredProducts];
    if (sortOption === 'price-low') {
      return list.sort((a, b) => {
        const pA = a.price * (1 - a.discount / 100);
        const pB = b.price * (1 - b.discount / 100);
        return pA - pB;
      });
    }
    if (sortOption === 'price-high') {
      return list.sort((a, b) => {
        const pA = a.price * (1 - a.discount / 100);
        const pB = b.price * (1 - b.discount / 100);
        return pB - pA;
      });
    }
    if (sortOption === 'rating') {
      return list.sort((a, b) => b.rating - a.rating);
    }
    if (sortOption === 'discount') {
      return list.sort((a, b) => b.discount - a.discount);
    }
    
    return list.sort((a, b) => (b.featured ? 1 : 0) - (a.featured ? 1 : 0));
  }, [filteredProducts, sortOption]);

  const sectionTitles = {
    men: {
      title: "men's style",
      subtitle: "architectural lines, organic cotton weaves, and lightweight structured tailoring.",
    },
    women: {
      title: "women's style",
      subtitle: "fluid mulberry silks, sand-washed drapes, and timeless bias-cut slips.",
    },
    kids: {
      title: "kids's style",
      subtitle: "traceable organic pima cotton ensembles for natural play and breathable comfort.",
    },
    accessories: {
      title: "accessories style",
      subtitle: "hand-finished full-grain leather bags, minimalist watches, and boutique jewelry.",
    },
  };

  const activeTitle = sectionTitles[section] || { title: "atelier collection", subtitle: "" };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.5 }}
      className="bg-white min-h-screen py-12 font-sans border-t border-[#eeeeee]"
    >
      <div className="max-w-[1600px] mx-auto px-4 sm:px-8 lg:px-12">
        <div className="text-center space-y-4 mb-16">
          <span className="text-[10px] font-bold tracking-[0.3em] text-neutral-400 uppercase">EXPLORE SHOP</span>
          <h1 className="text-3xl sm:text-5xl font-display font-light lowercase italic tracking-[0.05em] text-[#111111]">
            {activeTitle.title}
          </h1>
          <p className="text-xs text-neutral-400 uppercase tracking-widest max-w-xl mx-auto leading-relaxed text-center">
            {activeTitle.subtitle}
          </p>
          <div className="w-12 h-[1px] bg-neutral-300 mx-auto mt-6" />
        </div>

        <div className="flex flex-col md:flex-row md:items-center justify-between border-b border-neutral-200 pb-6 mb-8 gap-4">
          <div className="space-y-1">
            <h2 className="text-xs font-bold uppercase tracking-widest text-neutral-900">
              Curated Designs
            </h2>
            <p className="text-[11px] font-mono uppercase tracking-widest text-neutral-400">
              Showing {sortedProducts.length} of {sectionProducts.length} items
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-4">
            <input
              type="text"
              value={activeSearchQuery}
              onChange={(e) => handleSearchChange(e.target.value)}
              placeholder={`SEARCH ${section.toUpperCase()} SHOP...`}
              className="px-4 py-2 bg-neutral-50 border border-neutral-200 text-xs rounded-none uppercase tracking-widest placeholder-neutral-300 focus:border-neutral-900 focus:bg-white focus:outline-none transition-colors w-full sm:w-60"
            />

            <div className="flex items-center space-x-2 text-xs">
              <span className="text-neutral-400 font-bold uppercase tracking-wider">Sort:</span>
              <select
                value={sortOption}
                onChange={(e) => setSortOption(e.target.value)}
                className="bg-white border border-neutral-200 rounded-none p-2 text-neutral-700 text-xs font-bold uppercase tracking-wider focus:outline-none"
              >
                <option value="featured">Most Featured</option>
                <option value="price-low">Price: Low to High</option>
                <option value="price-high">Price: High to Low</option>
                <option value="rating">Client Reviews</option>
                <option value="discount">Active Discounts</option>
              </select>
            </div>
          </div>
        </div>

        <div className="lg:hidden mb-4">
          <button
            onClick={() => setMobileFiltersOpen(!mobileFiltersOpen)}
            className="w-full py-3 bg-neutral-50 border border-neutral-200 text-xs font-bold uppercase tracking-widest flex items-center justify-center space-x-2 hover:bg-neutral-100 transition-colors cursor-pointer"
          >
            <SlidersHorizontal className="w-3.5 h-3.5 text-neutral-500" />
            <span>{mobileFiltersOpen ? 'Hide Filter Panel' : 'Show Filter Panel'}</span>
          </button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          <div className={`lg:col-span-1 ${mobileFiltersOpen ? 'block' : 'hidden lg:block'} space-y-8 bg-[#fbfbfb] p-6 rounded-none border border-[#eeeeee] h-fit`}>
            <div className="flex items-center justify-between border-b border-[#eeeeee] pb-4">
              <span className="text-xs font-bold uppercase tracking-widest text-[#111111] flex items-center space-x-2">
                <SlidersHorizontal className="w-4 h-4 text-neutral-500" />
                <span>Shop Filters</span>
              </span>
              {(activeCategory || selectedBrand || selectedSize || selectedColor || priceMax < 3000 || activeSearchQuery) && (
                <button
                  onClick={handleResetFilters}
                  className="text-[10px] text-[#111111] hover:underline font-bold uppercase tracking-wider focus:outline-none cursor-pointer"
                >
                  Clear All
                </button>
              )}
            </div>

            {categories.length > 0 && (
              <div className="space-y-2.5">
                <h4 className="text-[10px] font-bold text-neutral-400 uppercase tracking-widest">Categories</h4>
                <div className="space-y-1.5 text-xs font-medium">
                  {categories.map((cat) => (
                    <button
                      key={cat}
                      onClick={() => setActiveCategory(activeCategory === cat ? null : cat)}
                      className={`w-full text-left py-2 px-2.5 rounded-none transition-colors text-xs flex justify-between items-center ${
                        activeCategory === cat
                          ? 'bg-[#111111] text-white font-bold'
                          : 'text-neutral-600 hover:bg-neutral-100 hover:text-neutral-900'
                      }`}
                    >
                      <span className="uppercase tracking-wider">{cat}</span>
                      {activeCategory === cat && <Check className="w-3.5 h-3.5 stroke-[2]" />}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {uniqueBrands.length > 0 && (
              <div className="space-y-2.5">
                <h4 className="text-[10px] font-bold text-neutral-400 uppercase tracking-widest">Premium Brands</h4>
                <div className="space-y-1.5 text-xs">
                  {uniqueBrands.map((brand) => (
                    <label key={brand} className="flex items-center space-x-2.5 text-neutral-600 hover:text-neutral-900 cursor-pointer py-0.5">
                      <input
                        type="checkbox"
                        checked={selectedBrand === brand}
                        onChange={() => setSelectedBrand(selectedBrand === brand ? null : brand)}
                        className="rounded-none border-neutral-300 text-neutral-950 focus:ring-neutral-950 accent-black w-3.5 h-3.5"
                      />
                      <span className="uppercase tracking-wider text-[11px]">{brand}</span>
                    </label>
                  ))}
                </div>
              </div>
            )}

            {uniqueSizes.length > 0 && (
              <div className="space-y-2.5">
                <h4 className="text-[10px] font-bold text-neutral-400 uppercase tracking-widest">Available Sizes</h4>
                <div className="flex flex-wrap gap-1.5">
                  {uniqueSizes.map((sz) => (
                    <button
                      key={sz}
                      onClick={() => setSelectedSize(selectedSize === sz ? null : sz)}
                      className={`w-9 h-9 rounded-none border text-[10px] font-bold font-mono transition-all focus:outline-none cursor-pointer ${
                        selectedSize === sz
                          ? 'border-neutral-950 bg-neutral-950 text-white'
                          : 'border-neutral-200 text-neutral-600 hover:border-neutral-400 hover:text-neutral-950 bg-white'
                      }`}
                    >
                      {sz}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {uniqueColors.length > 0 && (
              <div className="space-y-2.5">
                <h4 className="text-[10px] font-bold text-neutral-400 uppercase tracking-widest">Color Tones</h4>
                <div className="flex flex-wrap gap-2">
                  {uniqueColors.map((color) => {
                    const sampleColor = sectionProducts.flatMap((p) => p.colors).find((c) => c.name === color);
                    return (
                      <button
                        key={color}
                        onClick={() => setSelectedColor(selectedColor === color ? null : color)}
                        className={`w-6 h-6 rounded-none border transition-transform focus:outline-none cursor-pointer relative ${
                          selectedColor === color ? 'scale-110 border-neutral-950 ring-1 ring-neutral-300' : 'border-neutral-200'
                        }`}
                        style={{ backgroundColor: sampleColor?.hex }}
                        title={color}
                      >
                        {selectedColor === color && (
                          <div className="absolute inset-0 flex items-center justify-center">
                            <div className="w-1.5 h-1.5 bg-white mix-blend-difference rounded-full" />
                          </div>
                        )}
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            <div className="space-y-2.5">
              <div className="flex justify-between items-center text-[10px] font-bold text-neutral-400 uppercase tracking-widest">
                <span>Max Price</span>
                <span className="font-mono text-neutral-900 font-bold">₹{priceMax}</span>
              </div>
              <input
                type="range"
                min="50"
                max="3000"
                step="50"
                value={priceMax}
                onChange={(e) => setPriceMax(parseInt(e.target.value))}
                className="w-full accent-black h-1 bg-neutral-200 cursor-pointer"
              />
            </div>
          </div>

          <div className="lg:col-span-3">
            <AnimatePresence mode="wait">
              {sortedProducts.length === 0 ? (
                <motion.div
                  key="no-items"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="text-center py-24 bg-neutral-50 rounded-none border border-[#eeeeee] space-y-4"
                >
                  <SlidersHorizontal className="w-12 h-12 text-neutral-300 mx-auto stroke-[1.2]" />
                  <div className="space-y-1">
                    <p className="text-xs font-bold uppercase tracking-widest text-neutral-900">No matching designs found</p>
                    <p className="text-xs text-neutral-400 max-w-xs mx-auto leading-relaxed uppercase tracking-wider">
                      Try adjusting active sizes, brands, or color tones.
                    </p>
                  </div>
                  <button
                    onClick={handleResetFilters}
                    className="px-6 py-3 bg-[#111111] text-white font-sans text-xs font-bold uppercase tracking-widest rounded-none transition-all hover:bg-neutral-800 cursor-pointer"
                  >
                    Reset All Filters
                  </button>
                </motion.div>
              ) : (
                <motion.div
                  key="grid-list"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-6"
                >
                  {sortedProducts.map((p) => (
                    <ProductCard
                      key={p.id}
                      product={p}
                      isWishlisted={wishlist.some((w) => w.id === p.id)}
                      isCompared={compare.some((c) => c.id === p.id)}
                      onToggleWishlist={() => onToggleWishlist(p)}
                      onToggleCompare={() => onToggleCompare(p)}
                      onQuickView={() => onQuickView(p.id)}
                      onSelectProduct={() => onSelectProduct(p)}
                      onAddToCart={onAddToCart ? () => onAddToCart(p, 1, p.sizes[0] || 'One Size', p.colors[0] || { name: 'Standard', hex: '#000000' }) : undefined}
                    />
                  ))}
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
