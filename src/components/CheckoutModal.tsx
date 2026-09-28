import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, MapPin, CreditCard, ChevronRight, CheckCircle2, Ticket, Sparkles, ShoppingBag } from 'lucide-react';
import { clientAPI } from '../api';
import { Address, Color, Coupon, Product } from '../types';

interface CheckoutModalProps {
  isOpen: boolean;
  onClose: () => void;
  cartItems: any[];
  products?: Product[];
  onOrderSuccess: (order: any) => void;
  currentUser: any;
  onOpenProfile: () => void;
}

export default function CheckoutModal({
  isOpen,
  onClose,
  cartItems,
  products = [],
  onOrderSuccess,
  currentUser,
  onOpenProfile,
}: CheckoutModalProps) {
  const [step, setStep] = useState<1 | 2 | 3 | 4>(1);
  const [addresses, setAddresses] = useState<Address[]>([]);
  const [selectedAddress, setSelectedAddress] = useState<Address | null>(null);

  
  const [paymentMethod, setPaymentMethod] = useState<'Stripe' | 'Razorpay' | 'Cash on Delivery'>('Stripe');
  
  
  const [cardNumber, setCardNumber] = useState('');
  const [cardName, setCardName] = useState('');
  const [cardExpiry, setCardExpiry] = useState('');
  const [cardCVV, setCardCVV] = useState('');

  
  const [upiId, setUpiId] = useState('');

  
  const [promoCode, setPromoCode] = useState('');
  const [appliedCoupon, setAppliedCoupon] = useState<Coupon | null>(null);
  const [couponError, setCouponError] = useState('');
  const [couponSuccess, setCouponSuccess] = useState('');

  
  const [processingOrder, setProcessingOrder] = useState(false);
  const [orderResult, setOrderResult] = useState<any>(null);

  
  const getItemSection = (item: any): string => {
    if (item.section) return item.section;
    if (products && products.length > 0) {
      const prod = products.find((p) => p.id === item.productId);
      if (prod?.section) return prod.section;
    }
    if (item.productId?.startsWith('p-m')) return 'men';
    if (item.productId?.startsWith('p-w')) return 'women';
    if (item.productId?.startsWith('p-k')) return 'kids';
    if (item.productId?.startsWith('p-a')) return 'accessories';
    return 'all';
  };

  
  const getCouponTargetSection = (coupon: Coupon): 'men' | 'women' | 'kids' | 'accessories' | 'all' => {
    const codeUpper = coupon.code.toUpperCase();
    if (codeUpper === 'STYLEM10') return 'men';
    if (codeUpper === 'STYLEW10' || codeUpper === 'STYLEF10') return 'women';
    if (codeUpper === 'STYLEK' || codeUpper === 'STYLEK10') return 'kids';
    return coupon.targetSection || 'all';
  };

  
  const subtotal = cartItems.reduce((sum, item) => sum + (item.price * (1 - item.discount / 100)) * item.quantity, 0);
  let discountAmount = 0;
  if (appliedCoupon) {
    const targetSec = getCouponTargetSection(appliedCoupon);

    
    const qualifyingItems = cartItems.filter((item) => {
      const sec = getItemSection(item);
      if (sec === 'accessories') return false; 
      if (targetSec && targetSec !== 'all') {
        return sec === targetSec;
      }
      return true;
    });

    const qualifyingSubtotal = qualifyingItems.reduce(
      (sum, item) => sum + (item.price * (1 - item.discount / 100)) * item.quantity,
      0
    );

    if (appliedCoupon.discountType === 'percentage') {
      discountAmount = qualifyingSubtotal * (appliedCoupon.value / 100);
    } else {
      discountAmount = Math.min(qualifyingSubtotal, appliedCoupon.value);
    }
  }
  const total = Math.max(0, subtotal - discountAmount);

  useEffect(() => {
    if (!isOpen) return;
    setStep(1);
    setAppliedCoupon(null);
    setPromoCode('');
    setCouponError('');
    setCouponSuccess('');
    
    if (currentUser) {
      setAddresses(currentUser.addresses || []);
      const defaultAddr = currentUser.addresses?.find((a: any) => a.isDefault);
      setSelectedAddress(defaultAddr || currentUser.addresses?.[0] || null);

      clientAPI.getMe()
        .then((freshUser) => {
          if (freshUser?.addresses) {
            setAddresses(freshUser.addresses);
            const freshDefault = freshUser.addresses.find((a: any) => a.isDefault);
            setSelectedAddress(freshDefault || freshUser.addresses[0] || null);
          }
        })
        .catch(() => {});
    } else {
      setAddresses([]);
      setSelectedAddress(null);
    }
  }, [isOpen, currentUser]);

  const handleApplyCoupon = async () => {
    setCouponError('');
    setCouponSuccess('');
    if (!promoCode.trim()) return;

    try {
      const coupon = await clientAPI.validateCoupon(promoCode);
      const targetSec = getCouponTargetSection(coupon);

      
      const allAccessories = cartItems.length > 0 && cartItems.every((item) => getItemSection(item) === 'accessories');
      if (allAccessories) {
        setCouponError('Coupons cannot be applied to Accessories products.');
        return;
      }

      
      if (targetSec && targetSec !== 'all') {
        const hasMatchingProduct = cartItems.some((item) => getItemSection(item) === targetSec);
        if (!hasMatchingProduct) {
          const sectionLabels: Record<string, string> = {
            men: "Men's",
            women: "Women's",
            kids: "Kids'",
            accessories: "Accessories",
          };
          const label = sectionLabels[targetSec] || targetSec;
          setCouponError(`Coupon ${coupon.code} is valid only for ${label} products. No matching items in your cart.`);
          return;
        }
      }

      if (subtotal < coupon.minOrderAmount) {
        setCouponError(`Minimum purchase of ₹${coupon.minOrderAmount} required for this code.`);
        return;
      }

      setAppliedCoupon(coupon);
      setCouponSuccess(`Coupon ${coupon.code} applied successfully!`);
    } catch (err: any) {
      setCouponError(err.message || 'Invalid promo code');
    }
  };

  const handleNextStep = () => {
    if (step === 1 && !selectedAddress) {
      alert('Please select or configure a shipping address.');
      return;
    }
    setStep((s) => (s + 1) as any);
  };

  const handlePrevStep = () => {
    setStep((s) => (s - 1) as any);
  };

  const handlePlaceOrder = async () => {
    if (!selectedAddress) return;
    setProcessingOrder(true);

    const orderPayload = {
      items: cartItems.map((item) => ({
        productId: item.productId,
        name: item.name,
        price: item.price * (1 - item.discount / 100),
        quantity: item.quantity,
        image: item.image,
        selectedSize: item.selectedSize,
        selectedColor: item.selectedColor,
      })),
      subtotal,
      discountAmount,
      total,
      couponUsed: appliedCoupon?.code,
      shippingAddress: selectedAddress,
      paymentMethod,
    };

    try {
      const order = await clientAPI.createOrder(orderPayload);
      setOrderResult(order);
      setStep(4);
    } catch (err: any) {
      alert(err.message || 'Error creating order.');
    } finally {
      setProcessingOrder(false);
    }
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-[100] bg-[#f8f7f5] overflow-y-auto w-full min-h-screen flex flex-col font-sans">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 20 }}
          transition={{ duration: 0.3 }}
          className="w-full min-h-screen flex flex-col bg-[#f8f7f5]"
        >
          <header className="bg-[#111111] text-white border-b border-neutral-800 py-4 px-4 sm:px-8 lg:px-12 flex items-center justify-between sticky top-0 z-20 shadow-md">
            <div className="flex items-center space-x-3">
              <ShoppingBag className="w-5 h-5 text-neutral-100 stroke-[1.5]" />
              <span className="font-display text-sm tracking-[0.25em] font-semibold uppercase text-white">
                StyleClothing <span className="text-neutral-400 font-normal">PAYMENT</span>
              </span>
            </div>

            {step < 4 && (
              <div className="hidden md:flex items-center space-x-4 font-mono text-[11px] font-bold text-neutral-400 tracking-wider">
                <span className={`flex items-center space-x-1.5 ${step === 1 ? 'text-white' : step > 1 ? 'text-neutral-200' : ''}`}>
                  <span className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] ${step === 1 ? 'bg-white text-black' : step > 1 ? 'bg-neutral-700 text-white' : 'bg-neutral-800 text-neutral-500'}`}>1</span>
                  <span>DELIVERY ADDRESS</span>
                </span>
                <ChevronRight className="w-3.5 h-3.5 text-neutral-600" />
                <span className={`flex items-center space-x-1.5 ${step === 2 ? 'text-white' : step > 2 ? 'text-neutral-200' : ''}`}>
                  <span className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] ${step === 2 ? 'bg-white text-black' : step > 2 ? 'bg-neutral-700 text-white' : 'bg-neutral-800 text-neutral-500'}`}>2</span>
                  <span>PAYMENT STRATEGY</span>
                </span>
                <ChevronRight className="w-3.5 h-3.5 text-neutral-600" />
                <span className={`flex items-center space-x-1.5 ${step === 3 ? 'text-white' : ''}`}>
                  <span className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] ${step === 3 ? 'bg-white text-black' : 'bg-neutral-800 text-neutral-500'}`}>3</span>
                  <span>REVIEW & PAY</span>
                </span>
              </div>
            )}

            {step === 4 && (
              <span className="text-[11px] font-bold text-emerald-400 font-mono tracking-widest flex items-center space-x-1.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                <span>ORDER CONFIRMED</span>
              </span>
            )}

            <button
              onClick={onClose}
              className="flex items-center space-x-2 text-xs uppercase tracking-widest text-neutral-400 hover:text-white transition-colors cursor-pointer bg-neutral-900 hover:bg-neutral-800 px-3 py-1.5 border border-neutral-700 rounded-none"
            >
              <span>Return to Store</span>
              <X className="w-4 h-4" />
            </button>
          </header>

          <main className="flex-1 w-full max-w-7xl mx-auto px-4 sm:px-8 lg:px-12 py-8 sm:py-12">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 w-full items-start">
              <div className={step === 4 ? "lg:col-span-12 max-w-xl mx-auto w-full space-y-6" : "lg:col-span-7 space-y-6"}>
                <div className={`bg-white border border-neutral-200/80 shadow-sm p-6 sm:p-10 min-h-[460px] flex flex-col ${step === 4 ? 'justify-center items-center text-center' : 'justify-between'}`}>
                  <div>
                    {step === 1 && (
                      <div className="space-y-6">
                        <div className="border-b border-neutral-150 pb-4 flex justify-between items-end">
                          <div>
                            <h2 className="text-sm font-bold text-neutral-900 uppercase tracking-[0.15em] flex items-center space-x-2">
                              <MapPin className="w-4 h-4 text-neutral-900" />
                              <span>Select Delivery Destination</span>
                            </h2>
                            <p className="text-xs text-neutral-400 mt-1">
                              Choose a registered address or add a new destination to dispatch your garment parcel.
                            </p>
                          </div>
                          {currentUser && (
                            <button
                              onClick={() => {
                                onClose();
                                onOpenProfile();
                              }}
                              className="text-[10px] font-bold text-neutral-600 hover:text-neutral-950 uppercase tracking-wider underline cursor-pointer"
                            >
                              Manage Saved Addresses
                            </button>
                          )}
                        </div>

                        {!currentUser ? (
                          <div className="p-6 border border-neutral-200 bg-neutral-50 text-center space-y-4">
                            <p className="text-xs text-neutral-600 leading-relaxed">
                              You must be logged in to access saved shipping addresses and proceed with your order.
                            </p>
                            <button
                              onClick={() => {
                                onClose();
                                onOpenProfile();
                              }}
                              className="px-6 py-3 bg-neutral-950 hover:bg-neutral-800 text-white font-sans text-xs font-bold uppercase tracking-[0.2em] transition-all cursor-pointer"
                            >
                              Sign In to Customer Hub
                            </button>
                          </div>
                        ) : addresses.length === 0 ? (
                          <div className="p-8 border border-dashed border-neutral-300 rounded-none bg-neutral-50 text-center space-y-4">
                            <MapPin className="w-8 h-8 text-neutral-400 mx-auto" />
                            <p className="text-xs text-neutral-500 font-medium">
                              No saved shipping addresses found in your profile.
                            </p>
                            <button
                              onClick={() => {
                                onClose();
                                onOpenProfile();
                              }}
                              className="px-6 py-2.5 bg-neutral-950 text-white font-sans text-xs font-bold uppercase tracking-[0.2em] transition-all cursor-pointer"
                            >
                              Add Address in Profile &rarr;
                            </button>
                          </div>
                        ) : (
                          <div className="space-y-3">
                            {addresses.map((addr) => (
                              <label
                                key={addr.id}
                                className={`block p-5 border cursor-pointer transition-all relative ${
                                  selectedAddress?.id === addr.id
                                    ? 'border-neutral-950 bg-neutral-50/70 ring-1 ring-neutral-950 shadow-sm'
                                    : 'border-neutral-200 hover:border-neutral-400 bg-white'
                                }`}
                              >
                                <div className="flex items-start space-x-3.5">
                                  <input
                                    type="radio"
                                    name="checkout_address"
                                    checked={selectedAddress?.id === addr.id}
                                    onChange={() => setSelectedAddress(addr)}
                                    className="mt-1 text-neutral-950 focus:ring-neutral-950 accent-neutral-950"
                                  />
                                  <div className="flex-1">
                                    <div className="flex items-center space-x-2">
                                      <span className="text-xs font-bold text-neutral-900">{addr.fullName}</span>
                                      {addr.isDefault && (
                                        <span className="px-2 py-0.5 bg-neutral-900 text-white text-[8px] font-bold uppercase tracking-wider">
                                          DEFAULT
                                        </span>
                                      )}
                                    </div>
                                    <p className="text-xs text-neutral-600 leading-relaxed mt-1">
                                      {addr.street}, {addr.city}, {addr.state} {addr.zip}, {addr.country}
                                    </p>
                                    <p className="text-[11px] text-neutral-400 font-mono mt-1">Phone: {addr.phone}</p>
                                  </div>
                                </div>
                              </label>
                            ))}
                          </div>
                        )}
                      </div>
                    )}

                    {step === 2 && (
                      <div className="space-y-6">
                        <div className="border-b border-neutral-150 pb-4">
                          <h2 className="text-sm font-bold text-neutral-900 uppercase tracking-[0.15em] flex items-center space-x-2">
                            <CreditCard className="w-4 h-4 text-neutral-900" />
                            <span>Select Payment Method</span>
                          </h2>
                          <p className="text-xs text-neutral-400 mt-1">
                            Choose your preferred secure payment gateway or cash-on-delivery handling.
                          </p>
                        </div>

                        <div className="space-y-3">
                          <label
                            className={`flex items-center justify-between p-5 border cursor-pointer transition-all ${
                              paymentMethod === 'Stripe'
                                ? 'border-neutral-950 bg-neutral-50/70 ring-1 ring-neutral-950 shadow-sm'
                                : 'border-neutral-200 hover:border-neutral-400 bg-white'
                            }`}
                          >
                            <div className="flex items-start space-x-3.5">
                              <input
                                type="radio"
                                name="payment_method"
                                checked={paymentMethod === 'Stripe'}
                                onChange={() => setPaymentMethod('Stripe')}
                                className="mt-1 text-neutral-950 focus:ring-neutral-950 accent-neutral-950"
                              />
                              <div>
                                <p className="text-xs font-bold text-neutral-900">Credit / Debit Card (Stripe)</p>
                                <p className="text-[11px] text-neutral-500 leading-normal mt-0.5">
                                  Encrypted 256-bit payment processing for Visa, Mastercard, American Express.
                                </p>
                              </div>
                            </div>
                            <div className="flex items-center space-x-1.5 text-neutral-400">
                              <CreditCard className="w-5 h-5 text-neutral-700 stroke-[1.5]" />
                            </div>
                          </label>

                          <label
                            className={`flex items-center justify-between p-5 border cursor-pointer transition-all ${
                              paymentMethod === 'Razorpay'
                                ? 'border-neutral-950 bg-neutral-50/70 ring-1 ring-neutral-950 shadow-sm'
                                : 'border-neutral-200 hover:border-neutral-400 bg-white'
                            }`}
                          >
                            <div className="flex items-start space-x-3.5">
                              <input
                                type="radio"
                                name="payment_method"
                                checked={paymentMethod === 'Razorpay'}
                                onChange={() => setPaymentMethod('Razorpay')}
                                className="mt-1 text-neutral-950 focus:ring-neutral-950 accent-neutral-950"
                              />
                              <div>
                                <p className="text-xs font-bold text-neutral-900">Razorpay Unified Terminal (UPI / QR / Net Banking)</p>
                                <p className="text-[11px] text-neutral-500 leading-normal mt-0.5">
                                  Instant UPI checkout with Google Pay, PhonePe, Paytm, or Indian banks.
                                </p>
                              </div>
                            </div>
                            <span className="text-[10px] font-bold text-neutral-700 tracking-wider font-mono bg-neutral-100 px-2 py-1">
                              UPI / QR
                            </span>
                          </label>

                          <label
                            className={`flex items-center justify-between p-5 border cursor-pointer transition-all ${
                              paymentMethod === 'Cash on Delivery'
                                ? 'border-neutral-950 bg-neutral-50/70 ring-1 ring-neutral-950 shadow-sm'
                                : 'border-neutral-200 hover:border-neutral-400 bg-white'
                            }`}
                          >
                            <div className="flex items-start space-x-3.5">
                              <input
                                type="radio"
                                name="payment_method"
                                checked={paymentMethod === 'Cash on Delivery'}
                                onChange={() => setPaymentMethod('Cash on Delivery')}
                                className="mt-1 text-neutral-950 focus:ring-neutral-950 accent-neutral-950"
                              />
                              <div>
                                <p className="text-xs font-bold text-neutral-900">Cash on Delivery (COD)</p>
                                <p className="text-[11px] text-neutral-500 leading-normal mt-0.5">
                                  Pay with cash or UPI directly to the courier agent upon parcel arrival.
                                </p>
                              </div>
                            </div>
                            <span className="text-[10px] font-bold text-neutral-800 tracking-wider font-mono bg-neutral-100 border border-neutral-300 px-2 py-1">
                              COD AVAILABLE
                            </span>
                          </label>
                        </div>
                      </div>
                    )}

                    {step === 3 && (
                      <div className="space-y-6">
                        <div className="border-b border-neutral-150 pb-4">
                          <h2 className="text-sm font-bold text-neutral-900 uppercase tracking-[0.15em] flex items-center space-x-2">
                            <CreditCard className="w-4 h-4 text-neutral-900" />
                            <span>Confirm & Authorize Payment</span>
                          </h2>
                          <p className="text-xs text-neutral-400 mt-1">
                            Complete your transaction information securely via {paymentMethod}.
                          </p>
                        </div>

                        {paymentMethod === 'Stripe' && (
                          <div className="space-y-5">
                            <div className="bg-neutral-950 text-white p-6 flex flex-col justify-between h-44 shadow-lg font-mono relative overflow-hidden border border-neutral-800">
                              <div className="absolute top-0 right-0 w-32 h-32 bg-white/5 rounded-full blur-2xl pointer-events-none" />
                              <div className="flex justify-between items-start z-10">
                                <div>
                                  <span className="text-[9px] font-bold tracking-[0.25em] text-neutral-400 uppercase">STYLECLOTHING</span>
                                  <p className="text-[10px] text-neutral-300 font-sans">BLACK CARD VIP</p>
                                </div>
                                <CreditCard className="w-6 h-6 text-neutral-200 stroke-[1.5]" />
                              </div>
                              <div className="text-lg tracking-[0.25em] font-semibold text-neutral-100 z-10 my-2">
                                {cardNumber || '•••• •••• •••• ••••'}
                              </div>
                              <div className="flex justify-between text-[10px] font-bold z-10 uppercase text-neutral-300">
                                <div>
                                  <p className="text-neutral-500 text-[8px] mb-0.5">Cardholder</p>
                                  <p>{cardName || 'RISHI SAVALIYA'}</p>
                                </div>
                                <div>
                                  <p className="text-neutral-500 text-[8px] mb-0.5">Expiry</p>
                                  <p>{cardExpiry || 'MM/YY'}</p>
                                </div>
                              </div>
                            </div>

                            <div className="space-y-4 text-xs">
                              <div className="space-y-1">
                                <label className="text-[10px] font-bold text-neutral-700 uppercase tracking-wider">Card Number</label>
                                <input
                                  type="text"
                                  maxLength={19}
                                  placeholder="4111 1111 1111 1111"
                                  value={cardNumber}
                                  onChange={(e) => setCardNumber(e.target.value.replace(/\s?/g, '').replace(/(\d{4})/g, '$1 ').trim())}
                                  className="w-full border border-neutral-300 p-2.5 focus:border-neutral-950 focus:outline-none font-mono text-neutral-900"
                                />
                              </div>

                              <div className="grid grid-cols-3 gap-3">
                                <div className="col-span-2 space-y-1">
                                  <label className="text-[10px] font-bold text-neutral-700 uppercase tracking-wider">Cardholder Name</label>
                                  <input type="text" placeholder="Rishi Savaliya" value={cardName} onChange={(e) => setCardName(e.target.value)} className="w-full border border-neutral-300 p-2.5 focus:border-neutral-950 focus:outline-none text-neutral-900" />
                                </div>
                                <div className="space-y-1">
                                  <label className="text-[10px] font-bold text-neutral-700 uppercase tracking-wider">CVV</label>
                                  <input type="password" maxLength={3} placeholder="•••" value={cardCVV} onChange={(e) => setCardCVV(e.target.value)} className="w-full border border-neutral-300 p-2.5 focus:border-neutral-950 focus:outline-none text-center font-mono text-neutral-900" />
                                </div>
                              </div>

                              <div className="space-y-1">
                                <label className="text-[10px] font-bold text-neutral-700 uppercase tracking-wider">Expiry Date (MM/YY)</label>
                                <input type="text" maxLength={5} placeholder="12/28" value={cardExpiry} onChange={(e) => setCardExpiry(e.target.value)} className="w-full border border-neutral-300 p-2.5 focus:border-neutral-950 focus:outline-none font-mono text-neutral-900" />
                              </div>
                            </div>
                          </div>
                        )}

                        {paymentMethod === 'Razorpay' && (
                          <div className="space-y-4">
                            <div className="border border-neutral-200 bg-neutral-50 p-6 text-center space-y-3">
                              <div className="w-12 h-12 bg-neutral-100 border border-neutral-300 text-neutral-900 flex items-center justify-center mx-auto font-mono font-bold text-xs">
                                UPI
                              </div>
                              <div>
                                <p className="text-xs font-bold text-neutral-900">Scan Razorpay QR code or enter your VPA / UPI ID</p>
                                <p className="text-[11px] text-neutral-500 mt-0.5">
                                  Instantly routed via Razorpay encrypted payment gateway.
                                </p>
                              </div>
                            </div>

                            <div className="space-y-1 text-xs">
                              <label className="text-[10px] font-bold text-neutral-700 uppercase tracking-wider">UPI / VPA Address</label>
                              <input
                                type="text"
                                placeholder="name@upi or user@ybl"
                                value={upiId}
                                onChange={(e) => setUpiId(e.target.value)}
                                className="w-full border border-neutral-300 p-2.5 focus:border-neutral-950 focus:outline-none font-mono text-neutral-900"
                              />
                            </div>
                          </div>
                        )}

                        {paymentMethod === 'Cash on Delivery' && (
                          <div className="border border-neutral-300 bg-neutral-100/50 p-8 text-center space-y-3">
                            <CheckCircle2 className="w-10 h-10 text-neutral-900 mx-auto stroke-[1.5]" />
                            <div>
                              <p className="text-xs font-bold text-neutral-900">Cash on Delivery selected</p>
                              <p className="text-[11px] text-neutral-600 max-w-sm mx-auto leading-relaxed mt-1">
                                Your order will be prepared and shipped immediately. Please keep <strong className="text-neutral-950">₹{total.toFixed(2)}</strong> ready in cash or UPI upon courier arrival.
                              </p>
                            </div>
                          </div>
                        )}
                      </div>
                    )}

                    {step === 4 && orderResult && (
                      <div className="space-y-6 text-center py-6">
                        <div className="w-14 h-14 bg-emerald-100 text-emerald-700 rounded-full flex items-center justify-center mx-auto shadow-sm">
                          <CheckCircle2 className="w-8 h-8 stroke-[2]" />
                        </div>

                        <div className="space-y-1">
                          <h2 className="text-lg font-display font-bold uppercase tracking-[0.2em] text-neutral-900">
                            TRANSACTION COMPLETED
                          </h2>
                          <p className="text-xs text-neutral-500 max-w-md mx-auto leading-relaxed">
                            Thank you for shopping with StyleClothing. Your bespoke order has been registered in our central ledger.
                          </p>
                        </div>

                        <div className="bg-neutral-50 border border-neutral-200 p-6 text-left text-xs font-mono space-y-3 max-w-md mx-auto">
                          <div className="flex justify-between border-b border-neutral-200 pb-2">
                            <span className="text-neutral-500">ORDER NO.</span>
                            <span className="text-neutral-900 font-bold">#{orderResult.id}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-neutral-500">TRACKING NUMBER</span>
                            <span className="text-neutral-900 font-bold">{orderResult.trackingNumber}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-neutral-500">DELIVERY STATUS</span>
                            <span className="text-neutral-900 font-semibold">{orderResult.status}</span>
                          </div>
                          <div className="flex justify-between border-t border-neutral-200 pt-2 font-semibold">
                            <span className="text-neutral-500">TOTAL PAID</span>
                            <span className="text-neutral-900 font-bold text-sm">₹{orderResult.total.toFixed(2)}</span>
                          </div>
                        </div>

                        <button
                          onClick={() => {
                            onOrderSuccess(orderResult);
                            onClose();
                          }}
                          className="px-8 py-3.5 bg-neutral-950 hover:bg-neutral-800 text-white font-sans text-xs font-bold uppercase tracking-[0.2em] transition-all cursor-pointer shadow-sm"
                        >
                          Continue Shopping
                        </button>
                      </div>
                    )}
                  </div>

                  {step < 4 && (
                    <div className="flex justify-between items-center pt-8 border-t border-neutral-200 mt-8">
                      {step > 1 ? (
                        <button
                          onClick={handlePrevStep}
                          className="text-xs text-neutral-600 hover:text-neutral-950 font-bold uppercase tracking-widest focus:outline-none cursor-pointer py-2 px-4 border border-neutral-300 hover:border-neutral-950 transition-colors"
                        >
                          &larr; Back
                        </button>
                      ) : (
                        <div />
                      )}

                      {step < 3 ? (
                        <button
                          onClick={handleNextStep}
                          className="px-8 py-3 bg-neutral-950 hover:bg-neutral-800 text-white text-xs font-bold uppercase tracking-[0.2em] transition-all focus:outline-none cursor-pointer flex items-center space-x-2 shadow-sm"
                        >
                          <span>Proceed to {step === 1 ? 'Payment Method' : 'Review'}</span>
                          <ChevronRight className="w-4 h-4" />
                        </button>
                      ) : (
                        <button
                          onClick={handlePlaceOrder}
                          disabled={processingOrder}
                          className="px-10 py-3.5 bg-neutral-950 hover:bg-neutral-800 text-white text-xs font-bold uppercase tracking-[0.2em] transition-all focus:outline-none cursor-pointer shadow-md disabled:opacity-50"
                        >
                          {processingOrder ? 'Processing Order...' : `Authorize & Place Order (₹${total.toFixed(2)})`}
                        </button>
                      )}
                    </div>
                  )}
                </div>
              </div>

              {step < 4 && (
                <div className="lg:col-span-5 space-y-6">
                  <div className="bg-white border border-neutral-200/80 shadow-sm p-6 sm:p-8 space-y-6 sticky top-24">
                    <div className="flex items-center justify-between border-b border-neutral-150 pb-4">
                      <h3 className="text-xs font-bold text-neutral-900 uppercase tracking-[0.15em]">
                        Order Summary ({cartItems.reduce((acc, i) => acc + i.quantity, 0)} Items)
                      </h3>
                      <span className="text-[10px] font-mono font-semibold text-neutral-400">STYLECLOTHING</span>
                    </div>

                    <div className="space-y-4 max-h-[320px] overflow-y-auto pr-1 divide-y divide-neutral-100">
                      {cartItems.map((item, idx) => {
                        const discPrice = item.price * (1 - item.discount / 100);
                        return (
                          <div key={idx} className="pt-3 first:pt-0 flex items-center space-x-4 text-xs font-sans">
                            <img
                              src={item.image}
                              alt={item.name}
                              referrerPolicy="no-referrer"
                              className="w-14 h-18 object-cover border border-neutral-200 bg-neutral-100"
                            />
                            <div className="flex-1 min-w-0 space-y-1">
                              <p className="font-semibold text-neutral-900 truncate">{item.name}</p>
                              <div className="flex items-center space-x-2 text-[10px] text-neutral-500 font-mono">
                                <span>Size: {item.selectedSize || 'Standard'}</span>
                                {item.selectedColor && (
                                  <>
                                    <span>•</span>
                                    <span>Color: {item.selectedColor.name}</span>
                                  </>
                                )}
                              </div>
                              <p className="text-[11px] text-neutral-500">Qty: {item.quantity}</p>
                            </div>
                            <div className="text-right font-mono">
                              <p className="font-bold text-neutral-900">₹{(discPrice * item.quantity).toFixed(2)}</p>
                              {item.discount > 0 && (
                                <p className="text-[9px] text-neutral-400 line-through">₹{(item.price * item.quantity).toFixed(2)}</p>
                              )}
                            </div>
                          </div>
                        );
                      })}
                    </div>

                    <div className="pt-4 border-t border-neutral-150 space-y-3">
                      <label className="text-[10px] font-bold text-neutral-700 uppercase tracking-wider block">
                        Have an Atelier Promo Code?
                      </label>
                      <div className="flex space-x-2">
                        <input
                          type="text"
                          value={promoCode}
                          onChange={(e) => setPromoCode(e.target.value.toUpperCase())}
                          placeholder="e.g. FESTIVE20"
                          className="bg-neutral-50 border border-neutral-300 px-3 py-2 text-xs focus:outline-none focus:border-neutral-900 w-full font-mono text-neutral-900 placeholder-neutral-400"
                        />
                        <button
                          onClick={handleApplyCoupon}
                          className="px-4 bg-neutral-950 text-white hover:bg-neutral-800 text-[10px] font-bold uppercase tracking-widest transition-all cursor-pointer shrink-0"
                        >
                          Apply
                        </button>
                      </div>

                      {couponError && (
                        <p className="text-[11px] text-red-600 font-medium">{couponError}</p>
                      )}
                      {couponSuccess && (
                        <p className="text-[11px] text-emerald-700 font-semibold flex items-center space-x-1">
                          <Sparkles className="w-3.5 h-3.5 text-emerald-600" />
                          <span>{couponSuccess}</span>
                        </p>
                      )}
                    </div>

                    <div className="border-t border-neutral-200 pt-4 space-y-3 text-xs">
                      <div className="flex justify-between text-neutral-600">
                        <span>Items Subtotal</span>
                        <span className="font-mono">₹{subtotal.toFixed(2)}</span>
                      </div>

                      {discountAmount > 0 && (
                        <div className="flex justify-between text-emerald-700 font-medium">
                          <span>Promo Coupon Discount</span>
                          <span className="font-mono">-₹{discountAmount.toFixed(2)}</span>
                        </div>
                      )}

                      <div className="flex justify-between text-neutral-600">
                        <span>Estimated Shipping</span>
                        <span className="font-mono text-emerald-700 font-semibold">FREE (Priority)</span>
                      </div>

                      <div className="flex justify-between text-neutral-950 font-bold text-base border-t border-neutral-200 pt-3">
                        <span>Total Payable Invoice</span>
                        <span className="font-mono text-neutral-950">₹{total.toFixed(2)}</span>
                      </div>
                    </div>

                  </div>
                </div>
              )}
            </div>
          </main>

          <footer className="border-t border-neutral-200 bg-white py-6 px-4 sm:px-8 lg:px-12 mt-auto text-xs text-neutral-500 font-mono">
            <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4 text-center sm:text-left">
              <p>&copy; {new Date().getFullYear()} StyleClothing. All rights reserved.</p>
              <p className="text-[11px] text-neutral-400">
                Complimentary Priority Delivery across India on orders over ₹3500 | 256-Bit SSL Secure Gateway
              </p>
            </div>
          </footer>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
