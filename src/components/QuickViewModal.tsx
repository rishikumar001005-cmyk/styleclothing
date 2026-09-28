import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, Heart, ArrowLeftRight, ShoppingCart, Plus, Minus, Star, MessageSquare, Facebook, Instagram, Youtube } from 'lucide-react';
import { Product, Color, Review } from '../types';
import { clientAPI } from '../api';

interface QuickViewModalProps {
  productId: string;
  isOpen: boolean;
  onClose: () => void;
  onAddToCart: (product: Product, quantity: number, size: string, color: Color) => void;
  onToggleWishlist: (product: Product) => void;
  onToggleCompare: (product: Product) => void;
  isWishlisted: boolean;
  isCompared: boolean;
  onSelectProduct?: (id: string) => void;
  setActiveSection?: (section: 'all' | 'men' | 'women' | 'kids' | 'accessories' | 'about' | 'contact' | 'blog') => void;
  showPolicy?: (policy: string) => void;
}

const getProductImages = (product: Product | null): string[] => {
  if (!product) return [];
  const list = [...product.images];
  
  
  const fallbacks: Record<string, string[]> = {
    men: [
      'https://images.unsplash.com/photo-1617137968427-85924c800a22?q=80&w=600&auto=format&fit=crop', 
      'https://images.unsplash.com/photo-1594938298603-c8148c4dae35?q=80&w=600&auto=format&fit=crop', 
      'https://images.unsplash.com/photo-1507679799987-c73779587ccf?q=80&w=600&auto=format&fit=crop'  
    ],
    women: [
      'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?q=80&w=600&auto=format&fit=crop', 
      'https://images.unsplash.com/photo-1496747611176-843222e1e57c?q=80&w=600&auto=format&fit=crop', 
      'https://images.unsplash.com/photo-1485230895905-ec40ba36b9bc?q=80&w=600&auto=format&fit=crop'  
    ],
    accessories: [
      'https://images.unsplash.com/photo-1584917865442-de89df76afd3?q=80&w=600&auto=format&fit=crop', 
      'https://images.unsplash.com/photo-1523293182086-7651a899d37f?q=80&w=600&auto=format&fit=crop', 
      'https://images.unsplash.com/photo-1511405969146-856d51426863?q=80&w=600&auto=format&fit=crop'  
    ],
    kids: [
      'https://images.unsplash.com/photo-1519457431-44ccd64a579b?q=80&w=600&auto=format&fit=crop', 
      'https://images.unsplash.com/photo-1503919545889-aef636e10ad4?q=80&w=600&auto=format&fit=crop', 
      'https://images.unsplash.com/photo-1622290291468-a28f7a7dc6a8?q=80&w=600&auto=format&fit=crop'  
    ]
  };

  const sectionKey = product.section || 'women';
  const defaults = fallbacks[sectionKey] || fallbacks.women;

  let fallbackIdx = 0;
  while (list.length < 3) {
    const nextFallback = defaults[fallbackIdx % defaults.length];
    if (!list.includes(nextFallback)) {
      list.push(nextFallback);
    } else {
      list.push(defaults[(fallbackIdx + 1) % defaults.length]);
    }
    fallbackIdx++;
  }

  return list.slice(0, 3);
};

export default function QuickViewModal({
  productId,
  isOpen,
  onClose,
  onAddToCart,
  onToggleWishlist,
  onToggleCompare,
  isWishlisted,
  isCompared,
  onSelectProduct,
  setActiveSection,
  showPolicy,
}: QuickViewModalProps) {
  const [loading, setLoading] = useState(true);
  const [product, setProduct] = useState<Product | null>(null);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [related, setRelated] = useState<Product[]>([]);
  
  const [activeImage, setActiveImage] = useState('');
  const [selectedSize, setSelectedSize] = useState('');
  const [selectedColor, setSelectedColor] = useState<Color | null>(null);
  const [quantity, setQuantity] = useState(1);

  
  const [zoomStyle, setZoomStyle] = useState<React.CSSProperties>({ display: 'none' });
  const zoomContainerRef = useRef<HTMLDivElement>(null);

  
  const [newRating, setNewRating] = useState(5);
  const [newComment, setNewComment] = useState('');
  const [submittingReview, setSubmittingReview] = useState(false);
  const [reviewError, setReviewError] = useState('');
  const [activeAccordion, setActiveAccordion] = useState<string | null>(null);

  useEffect(() => {
    if (!isOpen || !productId) return;
    
    setLoading(true);
    clientAPI.getProduct(productId)
      .then((data) => {
        setProduct(data.product);
        setReviews(data.reviews);
        setRelated(data.related);
        const imagesList = getProductImages(data.product);
        setActiveImage(imagesList[0] || '');
        setSelectedSize(data.product.sizes[0] || '');
        setSelectedColor(data.product.colors[0] || null);
        setQuantity(1);
        setLoading(false);
      })
      .catch((err) => {
        console.error('Error fetching quickview details:', err);
        setLoading(false);
      });
  }, [isOpen, productId]);

  
  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!zoomContainerRef.current) return;
    const { left, top, width, height } = zoomContainerRef.current.getBoundingClientRect();
    const x = ((e.clientX - left) / width) * 100;
    const y = ((e.clientY - top) / height) * 100;
    setZoomStyle({
      display: 'block',
      backgroundImage: `url(${activeImage})`,
      backgroundPosition: `${x}% ${y}%`,
      backgroundSize: '200%',
    });
  };

  const handleMouseLeave = () => {
    setZoomStyle({ display: 'none' });
  };

  
  const handleReviewSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!product) return;
    if (!newComment.trim()) {
      setReviewError('Please share your thoughts in a comment.');
      return;
    }

    setSubmittingReview(true);
    setReviewError('');

    try {
      const added = await clientAPI.addReview(product.id, newRating, newComment);
      setReviews((prev) => [added, ...prev]);
      
      setProduct((prev) => {
        if (!prev) return null;
        const totalReviews = prev.reviewsCount + 1;
        const newAvg = ((prev.rating * prev.reviewsCount) + newRating) / totalReviews;
        return {
          ...prev,
          rating: Number(newAvg.toFixed(1)),
          reviewsCount: totalReviews
        };
      });
      setNewComment('');
      setNewRating(5);
    } catch (err: any) {
      setReviewError(err.message || 'You must be logged in to submit a product review.');
    } finally {
      setSubmittingReview(false);
    }
  };

  const handleRelatedClick = (relatedId: string) => {
    if (onSelectProduct) {
      onSelectProduct(relatedId);
    }
    
    const modalContainers = document.querySelectorAll('.overflow-y-auto');
    modalContainers.forEach(container => {
      container.scrollTo({ top: 0, behavior: 'smooth' });
    });
  };

  if (!isOpen) return null;

  const finalPrice = product ? product.price * (1 - product.discount / 100) : 0;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 overflow-y-auto font-sans bg-white">
        <div className="min-h-screen flex flex-col bg-white">
          
          <div className="h-16 px-4 sm:px-8 lg:px-12 border-b border-neutral-100 flex items-center justify-between sticky top-0 bg-white/95 backdrop-blur-md z-30">
            <div className="flex items-center space-x-3">
              <span className="text-[10px] font-bold tracking-[0.35em] text-neutral-400 uppercase">Style Clothing</span>
              <span className="w-1 h-1 bg-neutral-300 rounded-full" />
              <span className="text-[10px] font-bold tracking-[0.2em] text-neutral-900 uppercase font-mono">Product View</span>
            </div>
            
            <button
              onClick={onClose}
              className="px-5 py-2 bg-neutral-950 hover:bg-neutral-800 text-white text-[10px] font-bold uppercase tracking-[0.2em] transition-all cursor-pointer flex items-center space-x-2 rounded-none"
            >
              <X className="w-4 h-4 stroke-[2]" />
              <span>Back to Shop</span>
            </button>
          </div>

          <div className="flex-grow max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-10 lg:py-16">
            <motion.div
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -15 }}
              transition={{ duration: 0.4 }}
              className="w-full"
            >
              {loading ? (
                <div className="h-[500px] flex items-center justify-center">
                  <div className="space-y-4 text-center">
                    <div className="w-10 h-10 border-4 border-neutral-950 border-t-transparent rounded-full animate-spin mx-auto" />
                    <p className="text-xs text-neutral-400 font-mono tracking-widest uppercase">
                      Loading Atelier details
                    </p>
                  </div>
                </div>
              ) : product ? (
                <>
                  <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16">
                  
                  <div className="lg:col-span-7 flex flex-col space-y-6">
                    <div
                      ref={zoomContainerRef}
                      onMouseMove={handleMouseMove}
                      onMouseLeave={handleMouseLeave}
                      className="relative aspect-[3/4] bg-neutral-50 border border-neutral-100 overflow-hidden rounded-none cursor-zoom-in shadow-sm w-full"
                    >
                      <img
                        src={activeImage}
                        alt={product.name}
                        referrerPolicy="no-referrer"
                        className="w-full h-full object-cover object-center"
                      />
                      <div
                        className="absolute inset-0 pointer-events-none border border-neutral-250 shadow-inner"
                        style={zoomStyle}
                      />
                    </div>

                    {(() => {
                      const productImages = getProductImages(product);
                      const angleLabels = ["Main View", "Silhouette Drape", "Fabric Detail"];
                      return (
                        <div className="space-y-2">
                          <span className="text-[9px] font-bold tracking-widest text-neutral-400 uppercase">Interactive Angles & Textures</span>
                          <div className="flex space-x-3 overflow-x-auto pb-2 scrollbar-none">
                            {productImages.map((img, idx) => (
                              <button
                                key={idx}
                                onClick={() => setActiveImage(img)}
                                className={`group relative w-24 h-32 rounded-none border overflow-hidden shrink-0 transition-all focus:outline-none cursor-pointer ${
                                  activeImage === img ? 'border-neutral-950 scale-[1.02] ring-1 ring-neutral-950' : 'border-neutral-200 opacity-70 hover:opacity-100'
                                }`}
                              >
                                <img
                                  src={img}
                                  alt={`${product.name} angle ${idx + 1}`}
                                  referrerPolicy="no-referrer"
                                  className="w-full h-full object-cover transition-transform group-hover:scale-105 duration-300"
                                />
                              </button>
                            ))}
                          </div>
                        </div>
                      );
                    })()}
                  </div>

                  <div className="lg:col-span-5 flex flex-col space-y-8">
                    
                    <div>
                      <div className="text-[9px] font-bold text-neutral-400 uppercase tracking-[0.2em] mb-2.5">
                        <span className="capitalize">{product.section}</span> &rarr; {product.category}
                      </div>

                      <h1 className="text-2xl sm:text-3xl font-display font-medium uppercase tracking-wider text-neutral-900 mb-2 leading-tight">
                        {product.name}
                      </h1>
                      <p className="text-xs text-neutral-500 font-bold tracking-[0.25em] uppercase">
                        BY {product.brand.toUpperCase()}
                      </p>
                    </div>

                    <div className="flex items-center space-x-3 pb-5 border-b border-neutral-100">
                      <div className="flex text-neutral-900 text-sm">
                        {'★'.repeat(Math.round(product.rating))}
                        {'☆'.repeat(5 - Math.round(product.rating))}
                      </div>
                      <span className="text-xs text-neutral-500 font-mono tracking-wider">
                        {product.rating} / 5 ({product.reviewsCount} verified reviews)
                      </span>
                    </div>

                    <div className="flex items-baseline space-x-4">
                      <span className="text-2xl font-bold text-neutral-900 font-mono">
                        ₹{finalPrice.toFixed(2)}
                      </span>
                      {product.discount > 0 && (
                        <>
                          <span className="text-base text-neutral-400 line-through font-mono">
                            ₹{product.price.toFixed(2)}
                          </span>
                          <span className="text-xs text-neutral-900 font-bold bg-neutral-100 border border-neutral-300 px-2.5 py-1 rounded-none font-mono">
                            {product.discount}% OFF
                          </span>
                        </>
                      )}
                    </div>

                    <div className="space-y-2">
                      <h3 className="text-[10px] font-bold text-neutral-400 uppercase tracking-[0.2em]">DESIGN CONCEPT</h3>
                      <p className="text-xs text-neutral-600 leading-relaxed tracking-wide">
                        {product.description}
                      </p>
                    </div>

                    <div className="space-y-3">
                      <p className="text-[10px] font-bold text-neutral-400 uppercase tracking-[0.2em]">
                        COLORWAYS:{' '}
                        <span className="text-neutral-900 font-bold">
                          {selectedColor ? selectedColor.name : ''}
                        </span>
                      </p>
                      <div className="flex space-x-3">
                        {product.colors.map((c) => (
                          <button
                            key={c.name}
                            onClick={() => setSelectedColor(c)}
                            className={`w-7 h-7 rounded-full border flex items-center justify-center focus:outline-none transition-all cursor-pointer ${
                              selectedColor?.name === c.name ? 'scale-110 border-neutral-950 ring-2 ring-neutral-200' : 'border-neutral-200 hover:scale-105'
                            }`}
                            style={{ backgroundColor: c.hex }}
                            title={c.name}
                          />
                        ))}
                      </div>
                    </div>

                    <div className="space-y-3">
                      <p className="text-[10px] font-bold text-neutral-400 uppercase tracking-[0.2em]">
                        SELECT SIZE:{' '}
                        <span className="text-neutral-900 font-bold font-mono">{selectedSize}</span>
                      </p>
                      <div className="flex flex-wrap gap-2.5">
                        {product.sizes.map((s) => (
                          <button
                            key={s}
                            onClick={() => setSelectedSize(s)}
                            className={`min-w-12 h-10 border font-mono text-xs font-semibold rounded-none transition-all focus:outline-none cursor-pointer flex items-center justify-center px-3 ${
                              selectedSize === s
                                ? 'border-neutral-950 bg-neutral-950 text-white'
                                : 'border-neutral-200 text-neutral-600 hover:border-neutral-400 hover:text-neutral-950'
                            }`}
                          >
                            {s}
                          </button>
                        ))}
                      </div>
                    </div>

                    <div className="flex items-center justify-between pb-6 border-b border-neutral-100">
                      <div className="flex items-center space-x-1 border border-neutral-200 rounded-none bg-neutral-50">
                        <button
                          onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                          disabled={product.stock === 0}
                          className="p-2.5 text-neutral-500 hover:bg-neutral-150 disabled:opacity-40 cursor-pointer"
                        >
                          <Minus className="w-3.5 h-3.5" />
                        </button>
                        <span className="w-10 text-center font-mono text-xs font-semibold text-neutral-800">
                          {product.stock === 0 ? 0 : quantity}
                        </span>
                        <button
                          onClick={() => setQuantity((q) => Math.min(product.stock, q + 1))}
                          disabled={product.stock === 0 || quantity >= product.stock}
                          className="p-2.5 text-neutral-500 hover:bg-neutral-150 disabled:opacity-40 cursor-pointer"
                        >
                          <Plus className="w-3.5 h-3.5" />
                        </button>
                      </div>

                      <div className="text-right font-mono text-[11px]">
                        {product.stock > 0 ? (
                          <span className="text-emerald-600 font-semibold uppercase tracking-wider">{product.stock} pieces in archive</span>
                        ) : (
                          <span className="text-red-500 font-semibold uppercase tracking-wider">Sold Out</span>
                        )}
                      </div>
                    </div>

                    <div className="flex space-x-4">
                      <button
                        onClick={() => onAddToCart(product, quantity, selectedSize, selectedColor!)}
                        disabled={product.stock === 0}
                        className="flex-grow py-3.5 bg-neutral-950 hover:bg-neutral-800 disabled:bg-neutral-100 disabled:text-neutral-400 text-white font-sans text-xs font-bold uppercase tracking-[0.2em] transition-all flex items-center justify-center space-x-2.5 cursor-pointer shadow-none"
                      >
                        <ShoppingCart className="w-4 h-4" />
                        <span>Add to Cart</span>
                      </button>

                      <button
                        onClick={() => onToggleWishlist(product)}
                        className={`p-3.5 border rounded-none transition-all focus:outline-none cursor-pointer ${
                          isWishlisted
                            ? 'border-neutral-950 bg-neutral-50 text-neutral-950'
                            : 'border-neutral-200 text-neutral-500 hover:border-neutral-400 hover:text-neutral-950'
                        }`}
                        title="Wishlist"
                      >
                        <Heart className={`w-4 h-4 ${isWishlisted ? 'fill-current' : ''}`} />
                      </button>
                    </div>

                    <div className="pt-6 border-t border-neutral-150 space-y-3 font-sans">
                      <p className="text-[10px] font-bold text-neutral-400 uppercase tracking-[0.2em] mb-2">
                        Garment Integrity & Policies
                      </p>
                      
                      {[
                        {
                          id: 'shipping',
                          title: 'Shipping Policy',
                          content: 'We offer complimentary priority delivery across India on all orders exceeding ₹3500. Standard courier timelines take 3-5 business days.'
                        },
                        {
                          id: 'return',
                          title: 'Return & Alteration Policy',
                          content: 'If your custom tailored garment does not fit exactly to your desire, we offer complimentary alterations and free returns within 30 days.'
                        },
                        {
                          id: 'privacy',
                          title: 'Secure Payment & Privacy',
                          content: 'Every transaction is encrypted and managed through high-end gateways. We strictly prioritize client confidentiality and data security.'
                        }
                      ].map((item) => {
                        const isOpen = activeAccordion === item.id;
                        return (
                          <div key={item.id} className="border border-neutral-150">
                            <button
                              onClick={() => setActiveAccordion(isOpen ? null : item.id)}
                              className="w-full py-3 px-4 flex items-center justify-between text-left focus:outline-none cursor-pointer hover:bg-neutral-50 transition-colors"
                            >
                              <span className="text-xs font-bold text-neutral-800 uppercase tracking-wider">
                                {item.title}
                              </span>
                              <span className="text-xs text-neutral-400 font-bold">
                                {isOpen ? '−' : '+'}
                              </span>
                            </button>
                            {isOpen && (
                              <div className="px-4 pb-3.5 pt-1 text-xs text-neutral-500 leading-relaxed font-normal tracking-wide border-t border-neutral-100 bg-white">
                                {item.content}
                              </div>
                            )}
                          </div>
                        );
                      })}
                    </div>

                    <div className="pt-6 border-t border-neutral-100">
                      <div className="flex items-center space-x-3 mb-6">
                        <MessageSquare className="w-4 h-4 text-neutral-400" />
                        <h3 className="text-xs font-bold uppercase tracking-[0.18em] text-neutral-800">
                          Reviews & Opinions ({reviews.length})
                        </h3>
                      </div>

                      <form onSubmit={handleReviewSubmit} className="bg-neutral-50 p-5 rounded-none border border-neutral-150 mb-6">
                        <p className="text-[10px] font-bold text-neutral-500 uppercase tracking-widest mb-3">
                          Add an honest review:
                        </p>
                        
                        <div className="flex space-x-2 mb-4">
                          {[1, 2, 3, 4, 5].map((star) => (
                            <button
                              type="button"
                              key={star}
                              onClick={() => setNewRating(star)}
                              className="text-neutral-900 hover:scale-110 transition-transform focus:outline-none cursor-pointer"
                            >
                              <Star className={`w-4.5 h-4.5 ${newRating >= star ? 'fill-current' : ''}`} />
                            </button>
                          ))}
                        </div>

                        <textarea
                          value={newComment}
                          onChange={(e) => setNewComment(e.target.value)}
                          placeholder="Share your experience wearing this custom fabric fit..."
                          rows={3}
                          className="w-full bg-white border border-neutral-200 p-3 text-xs rounded-none focus:outline-none focus:border-neutral-400 mb-3 font-sans placeholder-neutral-400 text-neutral-750 leading-relaxed"
                        />

                        {reviewError && (
                          <p className="text-[11px] text-red-600 font-medium mb-3">{reviewError}</p>
                        )}

                        <button
                          type="submit"
                          disabled={submittingReview}
                          className="px-5 py-2.5 bg-neutral-900 text-white hover:bg-neutral-800 text-[10px] font-bold uppercase tracking-[0.18em] rounded-none transition-all focus:outline-none disabled:bg-neutral-300 cursor-pointer"
                        >
                          {submittingReview ? 'Submitting...' : 'Post Review'}
                        </button>
                      </form>

                      <div className="space-y-5 max-h-80 overflow-y-auto pr-1">
                        {reviews.length === 0 ? (
                          <p className="text-xs text-neutral-400 italic text-center py-6 font-serif">No atelier reviews yet. Be the first to share your voice.</p>
                        ) : (
                          reviews.map((r) => (
                            <div key={r.id} className="border-b border-neutral-100 pb-4 last:border-0 last:pb-0">
                              <div className="flex items-center justify-between mb-1.5">
                                <span className="text-xs font-bold text-neutral-800 uppercase tracking-wider">{r.userName}</span>
                                <span className="text-[10px] text-neutral-400 font-mono">
                                  {new Date(r.createdAt).toLocaleDateString()}
                                </span>
                              </div>
                              <div className="flex text-neutral-900 text-[10px] mb-2">
                                {'★'.repeat(r.rating)}
                                {'☆'.repeat(5 - r.rating)}
                              </div>
                              <p className="text-xs text-neutral-550 leading-relaxed tracking-wide font-sans">{r.comment}</p>
                            </div>
                          ))
                        )}
                      </div>
                    </div>

                  </div>
                </div>

                {related && related.length > 0 && (
                  <div className="mt-20 pt-16 border-t border-neutral-100">
                    <div className="text-center space-y-2 mb-12">
                      <span className="text-[10px] font-bold tracking-[0.3em] text-neutral-400 uppercase block">Curated Pairings</span>
                      <h2 className="text-xl font-display uppercase tracking-widest text-neutral-900 font-bold">Explore Related Pieces</h2>
                      <div className="w-10 h-[2px] bg-neutral-950 mx-auto mt-3" />
                    </div>

                    <div className="grid grid-cols-2 md:grid-cols-4 gap-6 sm:gap-8">
                      {related.slice(0, 4).map((p) => {
                        const relatedPrice = p.price * (1 - p.discount / 100);
                        return (
                          <div
                            key={p.id}
                            onClick={() => handleRelatedClick(p.id)}
                            className="group flex flex-col cursor-pointer space-y-3.5 text-left"
                          >
                            <div className="aspect-[3/4] w-full bg-neutral-50 overflow-hidden relative border border-neutral-100">
                              <img
                                src={p.images[0]}
                                alt={p.name}
                                referrerPolicy="no-referrer"
                                className="w-full h-full object-cover group-hover:scale-[1.03] transition-transform duration-500 ease-out"
                              />
                              {p.discount > 0 && (
                                <span className="absolute top-3 left-3 bg-neutral-950 text-white font-mono text-[9px] font-bold px-2 py-0.5 uppercase tracking-widest">
                                  -{p.discount}%
                                </span>
                              )}
                            </div>
                            <div className="space-y-1">
                              <span className="text-[9px] font-bold tracking-widest text-neutral-450 uppercase">{p.brand}</span>
                              <h4 className="text-xs font-semibold text-neutral-850 truncate uppercase tracking-wide group-hover:text-neutral-950 transition-colors">
                                {p.name}
                              </h4>
                              <div className="flex items-center space-x-2 font-mono text-xs font-bold text-neutral-900">
                                <span>₹{relatedPrice.toFixed(2)}</span>
                                {p.discount > 0 && (
                                  <span className="text-[10px] text-neutral-400 line-through">₹{p.price.toFixed(2)}</span>
                                )}
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}
                </>
              ) : (
                <div className="h-[500px] flex items-center justify-center text-neutral-500 text-xs font-mono uppercase tracking-widest">
                  Atelier record not found.
                </div>
              )}
            </motion.div>
          </div>

          <footer className="bg-black text-neutral-400 py-16 font-sans border-t border-neutral-900 select-none w-full">
            <div className="max-w-[1600px] mx-auto px-4 sm:px-8 lg:px-12 grid grid-cols-1 md:grid-cols-4 gap-12 text-left">
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
                    <button
                      onClick={() => {
                        if (setActiveSection) setActiveSection('about');
                        onClose();
                      }}
                      className="hover:text-white transition-colors cursor-pointer text-left focus:outline-none"
                    >
                      About Us
                    </button>
                  </li>
                  <li>
                    <button
                      onClick={() => {
                        if (setActiveSection) setActiveSection('contact');
                        onClose();
                      }}
                      className="hover:text-white transition-colors cursor-pointer text-left focus:outline-none"
                    >
                      Contact Us
                    </button>
                  </li>
                  <li>
                    <button
                      onClick={() => {
                        if (setActiveSection) setActiveSection('blog');
                        onClose();
                      }}
                      className="hover:text-white transition-colors cursor-pointer text-left focus:outline-none"
                    >
                      Blog
                    </button>
                  </li>
                  <li>
                    <button
                      onClick={() => {
                        if (showPolicy) showPolicy('store');
                        onClose();
                      }}
                      className="hover:text-white transition-colors cursor-pointer text-left focus:outline-none"
                    >
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
                    <button
                      onClick={() => {
                        if (showPolicy) showPolicy('privacy');
                        onClose();
                      }}
                      className="hover:text-white transition-colors cursor-pointer text-left focus:outline-none"
                    >
                      Privacy Policy
                    </button>
                  </li>
                  <li>
                    <button
                      onClick={() => {
                        if (showPolicy) showPolicy('shipping');
                        onClose();
                      }}
                      className="hover:text-white transition-colors cursor-pointer text-left focus:outline-none"
                    >
                      Shipping Policy
                    </button>
                  </li>
                  <li>
                    <button
                      onClick={() => {
                        if (showPolicy) showPolicy('terms');
                        onClose();
                      }}
                      className="hover:text-white transition-colors cursor-pointer text-left focus:outline-none"
                    >
                      Terms and Conditions
                    </button>
                  </li>
                  <li>
                    <button
                      onClick={() => {
                        if (showPolicy) showPolicy('track');
                        onClose();
                      }}
                      className="hover:text-white transition-colors cursor-pointer text-left focus:outline-none"
                    >
                      Track Order
                    </button>
                  </li>
                  <li>
                    <button
                      onClick={() => {
                        if (showPolicy) showPolicy('return');
                        onClose();
                      }}
                      className="hover:text-white transition-colors cursor-pointer text-left focus:outline-none"
                    >
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
                      <path d="M12.012 2c-5.506 0-9.989 4.478-9.99 9.984a9.96 9.96 0 0 0 1.333 4.993L2 22l5.13-1.347a9.94 9.94 0 0 0 4.881 1.279h.005c5.505 0 9.988-4.478 9.989-9.985 0-2.669-1.037-5.176-2.922-7.062C17.199 3.037 14.686 2 12.012 2zm6.59 14.073c-.29.814-1.464 1.481-2.02 1.545-.556.064-1.127.322-3.61-.703-3.181-1.31-5.215-4.544-5.374-4.757-.159-.212-1.284-1.706-1.284-3.256 0-1.55.809-2.314 1.099-2.61.29-.297.635-.371.847-.371.212 0 .424.001.609.01.185.01.437-.037.683.556.25.603.86 2.093.935 2.241.074.148.122.318.022.519-.101.202-.15.328-.297.5-.148.17-.311.378-.444.507-.148.143-.303.3-.13.599.172.3.765 1.26 1.644 2.04.1.088.192.148.33.222.148.074.424.16.594-.022.17-.18.73-.85.926-1.143.196-.29.392-.244.662-.148.27.1.1.2.392 2.22c.29 1.46.25 1.59-.03 2.15z"/>
                    </svg>
                  </a>
                </div>
              </div>
            </div>

            <div className="max-w-[1600px] mx-auto px-4 sm:px-8 lg:px-12 border-t border-neutral-900 pt-8 mt-10 text-center flex flex-col sm:flex-row items-center justify-between text-[11px] text-neutral-500">
              <p className="uppercase tracking-widest">&copy; 2026 STYLE CLOTHING. All Rights Reserved.</p>
              <div className="flex space-x-4 mt-4 sm:mt-0 font-semibold uppercase tracking-widest items-center">
                <button
                  onClick={() => {
                    if (showPolicy) showPolicy('privacy');
                    onClose();
                  }}
                  className="hover:text-white transition-colors cursor-pointer text-left focus:outline-none"
                >
                  Privacy Policy
                </button>
                <span>|</span>
                <button
                  onClick={() => {
                    if (showPolicy) showPolicy('terms');
                    onClose();
                  }}
                  className="hover:text-white transition-colors cursor-pointer text-left focus:outline-none"
                >
                  Terms of Use
                </button>
              </div>
            </div>
          </footer>

        </div>
      </div>
    </AnimatePresence>
  );
}
