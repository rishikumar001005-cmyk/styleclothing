import React, { useState } from 'react';
import { motion } from 'motion/react';
import { Heart, ArrowLeftRight, Eye, Sparkles, ShoppingBag } from 'lucide-react';
import { Product } from '../types';

interface ProductCardProps {
  key?: string | number;
  product: Product;
  isWishlisted: boolean;
  isCompared: boolean;
  onToggleWishlist: () => void;
  onToggleCompare: () => void;
  onQuickView: () => void;
  onSelectProduct: () => void;
  onAddToCart?: () => void;
}

export default function ProductCard({
  product,
  isWishlisted,
  isCompared,
  onToggleWishlist,
  onToggleCompare,
  onQuickView,
  onSelectProduct,
  onAddToCart,
}: ProductCardProps) {
  const [hovered, setHovered] = useState(false);
  const [activeImgIdx, setActiveImgIdx] = useState(0);

  const finalPrice = product.price * (1 - product.discount / 100);

  return (
    <motion.div
      layout
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => {
        setHovered(false);
        setActiveImgIdx(0);
      }}
      className="group flex flex-col h-full bg-white rounded-none border border-[#eeeeee] overflow-hidden relative transition-all duration-300 ease-out hover:-translate-y-1.5 hover:shadow-xl hover:shadow-black/10 hover:border-neutral-900 font-sans"
    >
      <div className="absolute top-3 left-3 z-10 flex flex-col space-y-1.5 pointer-events-none">
        {product.discount > 0 && (
          <span className="px-2.5 py-1 bg-[#111111] text-white font-sans text-[9px] font-bold tracking-[0.15em] uppercase rounded-none">
            -{product.discount}% OFF
          </span>
        )}
        {product.stock === 0 && (
          <span className="px-2.5 py-1 bg-[#111111] text-white font-sans text-[9px] font-bold tracking-[0.15em] uppercase rounded-none">
            Sold Out
          </span>
        )}
        {product.featured && (
          <span className="px-2.5 py-1 bg-white border border-[#eeeeee] text-neutral-800 font-sans text-[9px] font-bold tracking-[0.15em] uppercase rounded-none flex items-center space-x-1 shadow-none">
            <Sparkles className="w-2.5 h-2.5 text-neutral-400 stroke-[1.2]" />
            <span>Featured</span>
          </span>
        )}
      </div>

      <div className="relative w-full aspect-[3/4] bg-neutral-50 overflow-hidden cursor-pointer" onClick={onSelectProduct}>
        <img
          src={product.images[activeImgIdx] || product.images[0]}
          alt={product.name}
          referrerPolicy="no-referrer"
          className="w-full h-full object-cover object-center group-hover:scale-101 transition-transform duration-700 ease-out animate-fade-in"
        />

        {hovered && product.images.length > 1 && (
          <div className="absolute bottom-2.5 left-0 right-0 flex justify-center space-x-1.5 z-10">
            {product.images.map((_, idx) => (
              <button
                key={idx}
                onMouseEnter={() => setActiveImgIdx(idx)}
                className={`w-1.5 h-1.5 rounded-none transition-all ${
                  activeImgIdx === idx ? 'bg-neutral-950 scale-110' : 'bg-white/60 hover:bg-white'
                }`}
              />
            ))}
          </div>
        )}

        <button
          onClick={(e) => {
            e.stopPropagation();
            onToggleWishlist();
          }}
          className={`sm:hidden absolute top-2 right-2 p-1.5 z-10 bg-white/90 backdrop-blur-xs border border-neutral-200 transition-colors ${
            isWishlisted ? 'text-neutral-950 fill-current' : 'text-neutral-600'
          }`}
          aria-label="Toggle wishlist"
        >
          <Heart className={`w-3.5 h-3.5 ${isWishlisted ? 'fill-current text-neutral-950' : ''}`} />
        </button>

        <div className="absolute inset-0 bg-neutral-950/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center space-x-1.5 sm:space-x-2 p-2">
          {onAddToCart && product.stock > 0 && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                onAddToCart();
              }}
              className="p-2 sm:p-3 bg-neutral-950 hover:bg-neutral-800 text-white rounded-none border border-neutral-950 shadow-none transition-all duration-300 transform translate-y-3 group-hover:translate-y-0 focus:outline-none cursor-pointer"
              title="Add to Shopping Bag"
            >
              <ShoppingBag className="w-3.5 h-3.5 stroke-[1.5]" />
            </button>
          )}

          <button
            onClick={(e) => {
              e.stopPropagation();
              onQuickView();
            }}
            className="p-2 sm:p-3 bg-white hover:bg-[#111111] text-neutral-900 hover:text-white rounded-none border border-[#eeeeee] shadow-none transition-all duration-300 transform translate-y-3 group-hover:translate-y-0 focus:outline-none cursor-pointer"
            title="Quick View"
          >
            <Eye className="w-3.5 h-3.5 stroke-[1.5]" />
          </button>

          <button
            onClick={(e) => {
              e.stopPropagation();
              onToggleWishlist();
            }}
            className={`p-2 sm:p-3 rounded-none border border-[#eeeeee] shadow-none transition-all duration-300 transform translate-y-3 group-hover:translate-y-0 focus:outline-none cursor-pointer ${
              isWishlisted
                ? 'bg-neutral-950 text-white border-neutral-950'
                : 'bg-white hover:bg-neutral-950 text-neutral-900 hover:text-white'
            }`}
            title={isWishlisted ? "Remove from Wishlist" : "Add to Wishlist"}
          >
            <Heart className={`w-3.5 h-3.5 stroke-[1.5] ${isWishlisted ? 'fill-current' : ''}`} />
          </button>
        </div>
      </div>

      <div className="p-2.5 sm:p-4 flex flex-col flex-grow">
        <p className="text-[9px] font-bold text-neutral-400 tracking-[0.2em] uppercase mb-1.5">
          {product.brand}
        </p>

        <h3
          onClick={onSelectProduct}
          className="text-xs sm:text-sm font-medium text-neutral-900 hover:text-neutral-500 transition-colors line-clamp-1 mb-2 tracking-wide cursor-pointer uppercase font-sans"
        >
          {product.name}
        </h3>

        <div className="flex items-center space-x-1.5 mb-3">
          <div className="flex text-neutral-900 text-[10px] tracking-wider">
            {'★'.repeat(Math.round(product.rating))}
            <span className="text-neutral-200">
              {'★'.repeat(5 - Math.round(product.rating))}
            </span>
          </div>
          <span className="text-[9px] text-neutral-450 font-mono">
            ({product.reviewsCount})
          </span>
        </div>

        <div className="mt-auto flex items-center justify-between font-sans pt-2 border-t border-neutral-100">
          <div className="flex items-baseline space-x-2">
            <span className="text-xs font-bold text-neutral-950 font-mono">
              ₹{finalPrice.toFixed(2)}
            </span>
            {product.discount > 0 && (
              <span className="text-[10px] text-neutral-400 line-through font-mono">
                ₹{product.price.toFixed(2)}
              </span>
            )}
          </div>

          {onAddToCart && product.stock > 0 && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                onAddToCart();
              }}
              className="text-[10px] font-bold uppercase tracking-wider text-neutral-900 hover:text-neutral-500 transition-colors flex items-center space-x-1"
            >
              <span>+ Add</span>
            </button>
          )}
        </div>
      </div>
    </motion.div>
  );
}
