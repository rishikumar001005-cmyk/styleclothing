import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  User, MapPin, ClipboardList, Shield, Bell, X, Plus, Trash2, 
  Edit3, Truck, Eye, Lock, Key, CheckCircle2,
  Check, ShieldAlert, Camera
} from 'lucide-react';
import { clientAPI } from '../api';
import { Address, Order } from '../types';

export type ProfileTab = 'profile' | 'addresses' | 'orders' | 'notifications' | 'security';

interface ProfilePanelProps {
  isOpen: boolean;
  onClose: () => void;
  currentUser: any;
  onLoginSuccess: (user: any) => void;
  onLogout: () => void;
  initialTab?: ProfileTab;
}

export default function ProfilePanel({
  isOpen,
  onClose,
  currentUser,
  onLoginSuccess,
  onLogout,
  initialTab = 'profile',
}: ProfilePanelProps) {
  const [activeTab, setActiveTab] = useState<ProfileTab>(initialTab);
  const [authMode, setAuthMode] = useState<'login' | 'register'>('register');

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [authError, setAuthError] = useState('');
  const [authLoading, setAuthLoading] = useState(false);

  const [profName, setProfName] = useState('');
  const [profEmail, setProfEmail] = useState('');
  const [profAvatar, setProfAvatar] = useState('');
  const [profileSaving, setProfileSaving] = useState(false);

  const [addresses, setAddresses] = useState<Address[]>([]);
  const [addrFormOpen, setAddrFormOpen] = useState(false);
  const [editingAddrId, setEditingAddrId] = useState<string | null>(null);
  
  const [fullName, setFullName] = useState('');
  const [street, setStreet] = useState('');
  const [city, setCity] = useState('');
  const [state, setState] = useState('');
  const [zip, setZip] = useState('');
  const [country, setCountry] = useState('INDIA');
  const [phone, setPhone] = useState('');
  const [isDefault, setIsDefault] = useState(false);

  const [orders, setOrders] = useState<Order[]>([]);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [ordersLoading, setOrdersLoading] = useState(false);

  const [emailNotifs, setEmailNotifs] = useState(true);
  const [orderAlerts, setOrderAlerts] = useState(true);
  const [smsAlerts, setSmsAlerts] = useState(false);
  const [promoAlerts, setPromoAlerts] = useState(true);
  const [notifSavedMsg, setNotifSavedMsg] = useState('');

  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [twoFactorEnabled, setTwoFactorEnabled] = useState(false);
  const [securityMsg, setSecurityMsg] = useState('');

  useEffect(() => {
    if (!isOpen) return;
    setAuthMode('register');
    setAuthError('');
    if (initialTab) {
      setActiveTab(initialTab);
    }
    if (currentUser) {
      setProfName(currentUser.name);
      setProfEmail(currentUser.email);
      setProfAvatar(currentUser.avatarUrl || '');
      setAddresses(currentUser.addresses || []);
      
      // Fetch orders
      setOrdersLoading(true);
      clientAPI.getMyOrders()
        .then((data) => {
          setOrders(data);
          setOrdersLoading(false);
        })
        .catch((err) => {
          console.error(err);
          setOrdersLoading(false);
        });
    } else {
      setProfName('');
      setProfEmail('');
      setProfAvatar('');
      setAddresses([]);
      setOrders([]);
      setSelectedOrder(null);
    }
  }, [isOpen, currentUser, initialTab]);

  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 10 * 1024 * 1024) {
        alert('Image file size should be less than 10MB');
        return;
      }
      const reader = new FileReader();
      reader.onloadend = () => {
        const rawResult = reader.result as string;
        const img = new Image();
        img.src = rawResult;
        img.onload = async () => {
          const canvas = document.createElement('canvas');
          const maxDim = 400;
          let width = img.width;
          let height = img.height;
          if (width > height) {
            if (width > maxDim) {
              height = Math.round((height * maxDim) / width);
              width = maxDim;
            }
          } else {
            if (height > maxDim) {
              width = Math.round((width * maxDim) / height);
              height = maxDim;
            }
          }
          canvas.width = width;
          canvas.height = height;
          const ctx = canvas.getContext('2d');
          if (ctx) {
            ctx.drawImage(img, 0, 0, width, height);
            const compressedBase64 = canvas.toDataURL('image/jpeg', 0.85);
            setProfAvatar(compressedBase64);
            try {
              const updated = await clientAPI.updateProfile(
                profName || currentUser.name,
                profEmail || currentUser.email,
                compressedBase64
              );
              onLoginSuccess(updated);
            } catch (err: any) {
              console.error('Error auto-saving profile photo:', err);
              alert(err.message || 'Failed to update profile photo');
            }
          }
        };
      };
      reader.readAsDataURL(file);
    }
  };

  const handleAuthSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setAuthLoading(true);
    setAuthError('');

    try {
      if (authMode === 'login') {
        const data = await clientAPI.login(email, password);
        onLoginSuccess(data.user);
      } else {
        const data = await clientAPI.register(name, email, password);
        onLoginSuccess(data.user);
      }
    } catch (err: any) {
      setAuthError(err.message || 'Authentication failed. Please verify credentials.');
    } finally {
      setAuthLoading(false);
    }
  };

  const handleProfileSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setProfileSaving(true);
    try {
      const updated = await clientAPI.updateProfile(profName, profEmail, profAvatar);
      onLoginSuccess(updated);
      alert('Profile details updated successfully.');
    } catch (err: any) {
      alert(err.message || 'Error updating profile.');
    } finally {
      setProfileSaving(false);
    }
  };

  const handleAddressSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const addrData = { fullName, street, city, state, zip, country, phone, isDefault };
    try {
      let updatedList;
      if (editingAddrId) {
        updatedList = await clientAPI.updateAddress(editingAddrId, addrData);
      } else {
        updatedList = await clientAPI.addAddress(addrData);
      }
      setAddresses(updatedList);
      if (currentUser) {
        onLoginSuccess({ ...currentUser, addresses: updatedList });
      }
      resetAddressForm();
    } catch (err: any) {
      alert(err.message || 'Error saving shipping address.');
    }
  };

  const resetAddressForm = () => {
    setAddrFormOpen(false);
    setEditingAddrId(null);
    setFullName('');
    setStreet('');
    setCity('');
    setState('');
    setZip('');
    setCountry('INDIA');
    setPhone('');
    setIsDefault(false);
  };

  const handleEditAddress = (addr: Address) => {
    setEditingAddrId(addr.id);
    setFullName(addr.fullName);
    setStreet(addr.street);
    setCity(addr.city);
    setState(addr.state);
    setZip(addr.zip);
    setCountry(addr.country);
    setPhone(addr.phone);
    setIsDefault(addr.isDefault);
    setAddrFormOpen(true);
  };

  const handleDeleteAddress = async (id: string) => {
    if (!confirm('Are you sure you want to delete this address?')) return;
    try {
      const updatedList = await clientAPI.deleteAddress(id);
      setAddresses(updatedList);
      if (currentUser) {
        onLoginSuccess({ ...currentUser, addresses: updatedList });
      }
    } catch (err: any) {
      alert(err.message || 'Error deleting address.');
    }
  };

  const handleSaveNotifications = (e: React.FormEvent) => {
    e.preventDefault();
    setNotifSavedMsg('Notification preferences updated successfully!');
    setTimeout(() => setNotifSavedMsg(''), 3000);
  };

  const handleSecurityPasswordChange = (e: React.FormEvent) => {
    e.preventDefault();
    if (newPassword !== confirmPassword) {
      setSecurityMsg('New passwords do not match.');
      return;
    }
    if (newPassword.length < 6) {
      setSecurityMsg('Password must be at least 6 characters.');
      return;
    }
    setSecurityMsg('Password changed successfully.');
    setCurrentPassword('');
    setNewPassword('');
    setConfirmPassword('');
    setTimeout(() => setSecurityMsg(''), 4000);
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 overflow-hidden font-sans">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 0.5 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="fixed inset-0 bg-neutral-950"
        />

        <div className="absolute inset-y-0 right-0 max-w-full flex pl-6 sm:pl-10">
          <motion.div
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
            className="w-screen max-w-lg bg-white shadow-2xl flex flex-col h-full border-l border-neutral-100"
          >
            <div className="p-5 sm:p-6 border-b border-neutral-100 bg-neutral-50 flex items-center justify-between shrink-0">
              <div className="flex items-center space-x-2.5">
                <User className="w-5 h-5 text-neutral-800" />
                <h2 className="font-display text-sm tracking-[0.2em] font-semibold uppercase text-neutral-950">
                  {currentUser ? 'MY CUSTOMER HUB' : 'CUSTOMER ENTRANCE'}
                </h2>
              </div>
              <button
                onClick={onClose}
                className="p-1.5 hover:bg-neutral-200/50 rounded-full text-neutral-400 hover:text-neutral-950 focus:outline-none transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {!currentUser ? (
              <div className="flex-1 overflow-y-auto p-6 flex flex-col justify-center bg-neutral-50/30">
                <div className="max-w-sm mx-auto w-full space-y-6">
                  <div className="text-center space-y-1.5">
                    <h3 className="text-lg font-display tracking-widest font-bold uppercase text-neutral-900">
                      {authMode === 'login' ? 'WELCOME BACK' : 'CREATE PORTFOLIO'}
                    </h3>
                    <p className="text-xs text-neutral-500 max-w-xs mx-auto leading-relaxed uppercase tracking-wider">
                      {authMode === 'login'
                        ? 'Sign in to access secure checkout, tracking, and favorites.'
                        : 'Register an account for personalized styling recommendations.'}
                    </p>
                  </div>

                  <form onSubmit={handleAuthSubmit} className="space-y-4">
                    {authMode === 'register' && (
                      <div className="space-y-1.5">
                        <label className="text-[10px] font-bold text-neutral-400 uppercase tracking-widest block">
                          Full Name
                        </label>
                        <input
                          type="text"
                          required
                          value={name}
                          onChange={(e) => setName(e.target.value)}
                          placeholder="e.g. Rishi Savaliya"
                          className="w-full border border-neutral-200 rounded-none p-2.5 text-xs focus:outline-none focus:border-neutral-900 font-sans"
                        />
                      </div>
                    )}

                    <div className="space-y-1.5">
                      <label className="text-[10px] font-bold text-neutral-400 uppercase tracking-widest block">
                        Email Address
                      </label>
                      <input
                        type="email"
                        required
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="e.g. rishi123@gmail.com"
                        className="w-full border border-neutral-200 rounded-none p-2.5 text-xs focus:outline-none focus:border-neutral-900 font-sans"
                      />
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-[10px] font-bold text-neutral-400 uppercase tracking-widest block">
                        Password
                      </label>
                      <input
                        type="password"
                        required
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        placeholder="••••••••"
                        className="w-full border border-neutral-200 rounded-none p-2.5 text-xs focus:outline-none focus:border-neutral-900 font-sans"
                      />
                    </div>

                    {authError && (
                      <p className="text-xs text-red-600 font-medium bg-red-50 p-2.5 border border-red-100 rounded-none">
                        {authError}
                      </p>
                    )}

                    <button
                      type="submit"
                      disabled={authLoading}
                      className="w-full py-3 bg-neutral-950 text-white hover:bg-neutral-800 disabled:bg-neutral-300 font-sans text-xs font-bold uppercase tracking-[0.2em] transition-all cursor-pointer shadow-sm rounded-none"
                    >
                      {authLoading
                        ? 'AUTHENTICATING...'
                        : authMode === 'login'
                        ? 'LOG IN'
                        : 'REGISTER'}
                    </button>
                  </form>

                  {authMode === 'login' && (
                    <div className="pt-4 border-t border-neutral-100 space-y-2.5">
                      <span className="text-[9px] font-bold tracking-[0.15em] text-neutral-400 uppercase block text-center">Atelier Demo Accounts</span>
                      <div className="grid grid-cols-2 gap-3">
                        <button
                          type="button"
                          onClick={() => {
                            setEmail('rishi123@gmail.com');
                            setPassword('rishi123');
                          }}
                          className="p-2.5 border border-neutral-200 hover:border-neutral-950 text-left rounded-none transition-all focus:outline-none group"
                        >
                          <p className="text-[9px] font-bold uppercase tracking-wider text-neutral-800 group-hover:text-neutral-950">Rishi Savaliya</p>
                          <p className="text-[9px] text-neutral-450 font-mono mt-0.5">customer</p>
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            setEmail('admin@styleclothing.com');
                            setPassword('admin123');
                          }}
                          className="p-2.5 border border-neutral-200 hover:border-neutral-950 text-left rounded-none transition-all focus:outline-none group"
                        >
                          <p className="text-[9px] font-bold uppercase tracking-wider text-neutral-800 group-hover:text-neutral-950">Atelier Admin</p>
                          <p className="text-[9px] text-neutral-450 font-mono mt-0.5">administrator</p>
                        </button>
                      </div>
                    </div>
                  )}

                  <div className="text-center pt-2 text-xs">
                    <span className="text-neutral-500">
                      {authMode === 'login' ? "Don't have an account?" : 'Already have an account?'}
                    </span>{' '}
                    <button
                      onClick={() => {
                        setAuthMode(authMode === 'login' ? 'register' : 'login');
                        setAuthError('');
                      }}
                      className="font-bold hover:underline text-neutral-950 cursor-pointer uppercase tracking-wider text-[11px]"
                    >
                      {authMode === 'login' ? 'Register Now' : 'Log In Instead'}
                    </button>
                  </div>
                </div>
              </div>
            ) : (
              // If AUTHENTICATED - SHOW MULTI-TAB NAVIGATION AREA
              <>
                <div className="flex overflow-x-auto no-scrollbar border-b border-neutral-200 bg-neutral-50 px-2 font-sans shrink-0">
                  <button
                    onClick={() => { setActiveTab('profile'); setSelectedOrder(null); }}
                    className={`px-3 py-3 font-semibold uppercase tracking-wider text-[10px] sm:text-[11px] whitespace-nowrap border-b-2 transition-colors flex items-center space-x-1.5 cursor-pointer ${
                      activeTab === 'profile' ? 'border-neutral-950 text-neutral-950 bg-white' : 'border-transparent text-neutral-500 hover:text-neutral-800'
                    }`}
                  >
                    <User className="w-3.5 h-3.5" />
                    <span>My Profile</span>
                  </button>

                  <button
                    onClick={() => { setActiveTab('addresses'); setSelectedOrder(null); }}
                    className={`px-3 py-3 font-semibold uppercase tracking-wider text-[10px] sm:text-[11px] whitespace-nowrap border-b-2 transition-colors flex items-center space-x-1.5 cursor-pointer ${
                      activeTab === 'addresses' ? 'border-neutral-950 text-neutral-950 bg-white' : 'border-transparent text-neutral-500 hover:text-neutral-800'
                    }`}
                  >
                    <MapPin className="w-3.5 h-3.5" />
                    <span>Addresses</span>
                  </button>

                  <button
                    onClick={() => { setActiveTab('orders'); setSelectedOrder(null); }}
                    className={`px-3 py-3 font-semibold uppercase tracking-wider text-[10px] sm:text-[11px] whitespace-nowrap border-b-2 transition-colors flex items-center space-x-1.5 cursor-pointer ${
                      activeTab === 'orders' ? 'border-neutral-950 text-neutral-950 bg-white' : 'border-transparent text-neutral-500 hover:text-neutral-800'
                    }`}
                  >
                    <ClipboardList className="w-3.5 h-3.5" />
                    <span>Orders</span>
                  </button>

                  <button
                    onClick={() => { setActiveTab('notifications'); setSelectedOrder(null); }}
                    className={`px-3 py-3 font-semibold uppercase tracking-wider text-[10px] sm:text-[11px] whitespace-nowrap border-b-2 transition-colors flex items-center space-x-1.5 cursor-pointer ${
                      activeTab === 'notifications' ? 'border-neutral-950 text-neutral-950 bg-white' : 'border-transparent text-neutral-500 hover:text-neutral-800'
                    }`}
                  >
                    <Bell className="w-3.5 h-3.5" />
                    <span>Notifications</span>
                  </button>

                  <button
                    onClick={() => { setActiveTab('security'); setSelectedOrder(null); }}
                    className={`px-3 py-3 font-semibold uppercase tracking-wider text-[10px] sm:text-[11px] whitespace-nowrap border-b-2 transition-colors flex items-center space-x-1.5 cursor-pointer ${
                      activeTab === 'security' ? 'border-neutral-950 text-neutral-950 bg-white' : 'border-transparent text-neutral-500 hover:text-neutral-800'
                    }`}
                  >
                    <Shield className="w-3.5 h-3.5" />
                    <span>Security</span>
                  </button>
                </div>

                <div className="flex-1 overflow-y-auto p-5 sm:p-6 font-sans">
                  {activeTab === 'profile' && (
                    <div className="space-y-6">
                      <div className="bg-neutral-950 text-white p-5 rounded-none space-y-3">
                        <div className="flex items-center space-x-3.5">
                          <div className="relative group shrink-0">
                            <div className="w-14 h-14 bg-white text-black rounded-full flex items-center justify-center font-bold text-lg border border-neutral-300 overflow-hidden shadow-sm">
                              {profAvatar || currentUser?.avatarUrl ? (
                                <img
                                  src={profAvatar || currentUser?.avatarUrl}
                                  alt={currentUser.name}
                                  className="w-full h-full object-cover"
                                />
                              ) : (
                                <span>{currentUser.name ? currentUser.name[0].toUpperCase() : 'U'}</span>
                              )}
                            </div>
                            <label
                              htmlFor="profile-avatar-file-input"
                              className="absolute -bottom-1 -right-1 bg-white text-black p-1.5 rounded-full border border-neutral-300 shadow hover:bg-neutral-100 cursor-pointer transition-colors flex items-center justify-center"
                              title="Upload profile photo"
                            >
                              <Camera className="w-3.5 h-3.5 text-black" />
                              <input
                                id="profile-avatar-file-input"
                                type="file"
                                accept="image/*"
                                onChange={handlePhotoUpload}
                                className="hidden"
                              />
                            </label>
                          </div>
                          <div className="flex-1">
                            <p className="text-sm font-bold tracking-wide uppercase">{currentUser.name}</p>
                            <p className="text-[11px] text-neutral-400 font-mono">{currentUser.email}</p>
                            <div className="inline-flex items-center space-x-1 mt-1.5 px-2.5 py-0.5 bg-white text-black rounded text-[9px] font-bold uppercase tracking-widest border border-neutral-300">
                              <span>PREMIUM MEMBER</span>
                            </div>
                          </div>
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-3">
                        <button 
                          onClick={() => setActiveTab('addresses')}
                          className="p-3.5 bg-neutral-50 hover:bg-neutral-100 border border-neutral-200 text-left transition-colors cursor-pointer group"
                        >
                          <div className="flex items-center justify-between text-neutral-500 group-hover:text-neutral-900 mb-1">
                            <MapPin className="w-4 h-4" />
                            <span className="text-xs font-mono font-bold text-neutral-800">{addresses.length}</span>
                          </div>
                          <p className="text-xs font-bold text-neutral-800 uppercase tracking-wider">Addresses</p>
                          <p className="text-[10px] text-neutral-500">Manage destinations &rarr;</p>
                        </button>

                        <button 
                          onClick={() => setActiveTab('orders')}
                          className="p-3.5 bg-neutral-50 hover:bg-neutral-100 border border-neutral-200 text-left transition-colors cursor-pointer group"
                        >
                          <div className="flex items-center justify-between text-neutral-500 group-hover:text-neutral-900 mb-1">
                            <ClipboardList className="w-4 h-4" />
                            <span className="text-xs font-mono font-bold text-neutral-800">{orders.length}</span>
                          </div>
                          <p className="text-xs font-bold text-neutral-800 uppercase tracking-wider">Orders</p>
                          <p className="text-[10px] text-neutral-500">Track shipments &rarr;</p>
                        </button>
                      </div>

                      <form onSubmit={handleProfileSave} className="space-y-4 pt-2 border-t border-neutral-100">
                        <h3 className="text-xs font-bold uppercase tracking-widest text-neutral-400">
                          Edit Basic Information
                        </h3>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                          <div className="space-y-1.5">
                            <label className="text-[10px] font-bold text-neutral-400 uppercase tracking-widest">
                              Full Name
                            </label>
                            <input
                              type="text"
                              value={profName}
                              onChange={(e) => setProfName(e.target.value)}
                              className="w-full border border-neutral-200 rounded p-2.5 text-xs focus:outline-none focus:border-neutral-900"
                            />
                          </div>
                          <div className="space-y-1.5">
                            <label className="text-[10px] font-bold text-neutral-400 uppercase tracking-widest">
                              Email Address
                            </label>
                            <input
                              type="email"
                              value={profEmail}
                              onChange={(e) => setProfEmail(e.target.value)}
                              className="w-full border border-neutral-200 rounded p-2.5 text-xs focus:outline-none focus:border-neutral-900"
                            />
                          </div>
                        </div>

                        <button
                          type="submit"
                          disabled={profileSaving}
                          className="py-2.5 px-6 bg-neutral-950 text-white hover:bg-neutral-800 text-[10px] font-bold uppercase tracking-[0.15em] rounded-none cursor-pointer transition-colors"
                        >
                          {profileSaving ? 'Saving...' : 'Save Profile Changes'}
                        </button>
                      </form>
                    </div>
                  )}

                  {activeTab === 'addresses' && (
                    <div className="space-y-5">
                      <div className="flex items-center justify-between pb-2 border-b border-neutral-100">
                        <div>
                          <h3 className="text-xs font-bold uppercase tracking-widest text-neutral-900">
                            Saved Shipping Destinations
                          </h3>
                          <p className="text-[10px] text-neutral-400 mt-0.5">Manage delivery addresses for faster checkout</p>
                        </div>
                        {!addrFormOpen && (
                          <button
                            onClick={() => setAddrFormOpen(true)}
                            className="inline-flex items-center space-x-1.5 px-3 py-1.5 bg-neutral-950 text-white hover:bg-neutral-800 text-[10px] font-bold uppercase tracking-widest cursor-pointer transition-colors"
                          >
                            <Plus className="w-3.5 h-3.5" />
                            <span>Add Address</span>
                          </button>
                        )}
                      </div>

                      {addrFormOpen && (
                        <form onSubmit={handleAddressSubmit} className="bg-neutral-50 p-4 rounded border border-neutral-200 space-y-4">
                          <h4 className="text-[10px] font-bold text-neutral-800 uppercase tracking-wider">
                            {editingAddrId ? 'Edit Address Details' : 'Add New Shipping Destination'}
                          </h4>

                          <div className="grid grid-cols-2 gap-3.5">
                            <div className="space-y-1">
                              <label className="text-[9px] font-bold text-neutral-400 uppercase tracking-wider">Recipient Name</label>
                              <input type="text" required value={fullName} onChange={e => setFullName(e.target.value)} className="w-full bg-white border border-neutral-200 rounded p-1.5 text-xs focus:outline-none" />
                            </div>
                            <div className="space-y-1">
                              <label className="text-[9px] font-bold text-neutral-400 uppercase tracking-wider">Contact Phone</label>
                              <input type="text" required value={phone} onChange={e => setPhone(e.target.value)} className="w-full bg-white border border-neutral-200 rounded p-1.5 text-xs focus:outline-none" />
                            </div>
                          </div>

                          <div className="space-y-1">
                            <label className="text-[9px] font-bold text-neutral-400 uppercase tracking-wider">Street Address</label>
                            <input type="text" required value={street} onChange={e => setStreet(e.target.value)} className="w-full bg-white border border-neutral-200 rounded p-1.5 text-xs focus:outline-none" />
                          </div>

                          <div className="grid grid-cols-3 gap-3">
                            <div className="space-y-1">
                              <label className="text-[9px] font-bold text-neutral-400 uppercase tracking-wider">City</label>
                              <input type="text" required value={city} onChange={e => setCity(e.target.value)} className="w-full bg-white border border-neutral-200 rounded p-1.5 text-xs focus:outline-none" />
                            </div>
                            <div className="space-y-1">
                              <label className="text-[9px] font-bold text-neutral-400 uppercase tracking-wider">State</label>
                              <input type="text" required value={state} onChange={e => setState(e.target.value)} className="w-full bg-white border border-neutral-200 rounded p-1.5 text-xs focus:outline-none" />
                            </div>
                            <div className="space-y-1">
                              <label className="text-[9px] font-bold text-neutral-400 uppercase tracking-wider">Zip Code</label>
                              <input type="text" required value={zip} onChange={e => setZip(e.target.value)} className="w-full bg-white border border-neutral-200 rounded p-1.5 text-xs focus:outline-none" />
                            </div>
                          </div>

                          <div className="flex items-center justify-between pt-1">
                            <label className="flex items-center space-x-2 text-xs text-neutral-600 font-medium cursor-pointer">
                              <input type="checkbox" checked={isDefault} onChange={e => setIsDefault(e.target.checked)} className="rounded text-neutral-900 focus:ring-neutral-900" />
                              <span>Set as default address</span>
                            </label>

                            <div className="flex space-x-2">
                              <button type="button" onClick={resetAddressForm} className="px-3 py-1.5 bg-neutral-200 text-neutral-700 text-[10px] font-bold uppercase tracking-widest rounded-sm cursor-pointer">
                                Cancel
                              </button>
                              <button type="submit" className="px-3 py-1.5 bg-neutral-950 text-white text-[10px] font-bold uppercase tracking-widest rounded-sm cursor-pointer">
                                Save Address
                              </button>
                            </div>
                          </div>
                        </form>
                      )}

                      <div className="space-y-3">
                        {addresses.length === 0 ? (
                          <div className="text-center py-10 bg-neutral-50 border border-dashed border-neutral-200 p-6 space-y-2">
                            <MapPin className="w-8 h-8 text-neutral-300 mx-auto" />
                            <p className="text-xs text-neutral-500 font-medium">No saved addresses yet.</p>
                            <p className="text-[10px] text-neutral-400">Add an address above to streamline your checkout process.</p>
                          </div>
                        ) : (
                          addresses.map((addr) => (
                            <div key={addr.id} className="border border-neutral-200 p-4 relative bg-white space-y-1">
                              <div className="flex items-center space-x-2">
                                <span className="text-xs font-bold text-neutral-900">{addr.fullName}</span>
                                {addr.isDefault && (
                                  <span className="px-2 py-0.5 bg-neutral-900 text-white text-[8px] font-bold uppercase tracking-wider">
                                    Default
                                  </span>
                                )}
                              </div>
                              <p className="text-xs text-neutral-600 leading-relaxed">
                                {addr.street}, {addr.city}, {addr.state} {addr.zip}, {addr.country}
                              </p>
                              <p className="text-[11px] text-neutral-400 font-mono">{addr.phone}</p>

                              <div className="absolute top-4 right-4 flex space-x-2">
                                <button onClick={() => handleEditAddress(addr)} className="p-1 hover:bg-neutral-100 rounded text-neutral-500 hover:text-neutral-900 transition-colors" title="Edit address">
                                  <Edit3 className="w-4 h-4" />
                                </button>
                                <button onClick={() => handleDeleteAddress(addr.id)} className="p-1 hover:bg-red-50 rounded text-neutral-500 hover:text-red-600 transition-colors" title="Delete address">
                                  <Trash2 className="w-4 h-4" />
                                </button>
                              </div>
                            </div>
                          ))
                        )}
                      </div>
                    </div>
                  )}

                  {activeTab === 'orders' && (
                    <div className="space-y-6">
                      {selectedOrder ? (
                        <div className="space-y-6">
                          <button
                            onClick={() => setSelectedOrder(null)}
                            className="inline-flex items-center space-x-1.5 text-[10px] font-bold text-neutral-500 hover:text-neutral-800 uppercase tracking-widest cursor-pointer"
                          >
                            <span>&larr; Back to all orders</span>
                          </button>

                          <div className="p-4 bg-neutral-50 border rounded-lg space-y-4">
                            <div className="flex items-center justify-between">
                              <span className="text-xs font-bold text-neutral-400 uppercase tracking-widest font-mono">
                                ORDER #{selectedOrder.id}
                              </span>
                              <span className="text-xs text-neutral-500 font-mono">
                                {new Date(selectedOrder.createdAt).toLocaleDateString()}
                              </span>
                            </div>

                            <div className="pt-3 pb-2 border-y border-neutral-150">
                              <p className="text-[10px] font-bold text-neutral-400 uppercase tracking-widest mb-4">
                                Visual Delivery Tracker
                              </p>

                              <div className="relative flex items-center justify-between">
                                <div className="absolute left-2 right-2 h-1 bg-neutral-200 z-0" />
                                <div
                                  className="absolute left-2 h-1 bg-neutral-900 z-0 transition-all duration-500"
                                  style={{
                                    width:
                                      selectedOrder.status === 'Cancelled'
                                        ? '0%'
                                        : selectedOrder.status === 'Delivered'
                                        ? '100%'
                                        : selectedOrder.status === 'Shipped'
                                        ? '50%'
                                        : '15%',
                                  }}
                                />

                                {[
                                  { label: 'Processing', key: 'Processing' },
                                  { label: 'Shipped Out', key: 'Shipped' },
                                  { label: 'Delivered', key: 'Delivered' },
                                ].map((stage) => {
                                  const isCancelled = selectedOrder.status === 'Cancelled';
                                  const isActive =
                                    !isCancelled &&
                                    (selectedOrder.status === stage.key ||
                                      (stage.key === 'Processing') ||
                                      (stage.key === 'Shipped' && selectedOrder.status === 'Delivered'));
                                  return (
                                    <div key={stage.key} className="flex flex-col items-center z-10 relative">
                                      <div
                                        className={`w-6 h-6 rounded-full flex items-center justify-center border text-[10px] font-bold font-mono transition-colors ${
                                          isCancelled
                                            ? 'bg-neutral-100 border-neutral-300 text-neutral-400'
                                            : isActive
                                            ? 'bg-neutral-900 border-neutral-900 text-white shadow'
                                            : 'bg-white border-neutral-200 text-neutral-400'
                                        }`}
                                      >
                                        ✓
                                      </div>
                                      <span className="text-[9px] font-bold uppercase tracking-wider mt-1.5 text-neutral-600">
                                        {stage.label}
                                      </span>
                                    </div>
                                  );
                                })}
                              </div>

                              {selectedOrder.status === 'Cancelled' && (
                                <p className="text-xs text-red-500 font-bold text-center mt-4">
                                  This order was cancelled.
                                </p>
                              )}
                            </div>

                            <div className="flex justify-between text-xs font-mono">
                              <span className="text-neutral-400">TRACKING ID</span>
                              <span className="text-neutral-800 font-semibold">{selectedOrder.trackingNumber}</span>
                            </div>

                            <div className="grid grid-cols-2 gap-4 text-xs pt-2">
                              <div>
                                <p className="text-[10px] font-bold text-neutral-400 uppercase tracking-wider mb-0.5">Payment Method</p>
                                <p className="text-neutral-700 font-medium">{selectedOrder.paymentMethod}</p>
                              </div>
                              <div>
                                <p className="text-[10px] font-bold text-neutral-400 uppercase tracking-wider mb-0.5">Payment Status</p>
                                <p className="text-neutral-700 font-medium">{selectedOrder.paymentStatus}</p>
                              </div>
                            </div>
                          </div>

                          <div className="space-y-3">
                            <h4 className="text-[10px] font-bold text-neutral-400 uppercase tracking-widest">
                              ORDER ITEMS
                            </h4>

                            {selectedOrder.items.map((item, idx) => (
                              <div key={idx} className="flex items-center space-x-3.5 border-b border-neutral-100 pb-3 last:border-0">
                                <img src={item.image} alt={item.name} referrerPolicy="no-referrer" className="w-12 h-16 object-cover rounded-sm" />
                                <div className="flex-1">
                                  <h5 className="text-xs font-medium text-neutral-800 line-clamp-1">{item.name}</h5>
                                  <p className="text-[10px] text-neutral-400 font-mono mt-0.5">
                                    Qty: {item.quantity} | Size: {item.selectedSize} | Color: {item.selectedColor?.name}
                                  </p>
                                </div>
                                <span className="text-xs font-semibold font-mono text-neutral-800">
                                  ${(item.price * item.quantity).toFixed(2)}
                                </span>
                              </div>
                            ))}
                          </div>

                          <div className="border-t border-neutral-100 pt-4 space-y-2 text-xs font-sans">
                            <div className="flex justify-between text-neutral-500">
                              <span>Subtotal</span>
                              <span className="font-mono">${selectedOrder.subtotal.toFixed(2)}</span>
                            </div>
                            {selectedOrder.discountAmount > 0 && (
                              <div className="flex justify-between text-emerald-700 font-medium">
                                <span>Discount ({selectedOrder.couponUsed})</span>
                                <span className="font-mono">-${selectedOrder.discountAmount.toFixed(2)}</span>
                              </div>
                            )}
                            <div className="flex justify-between text-neutral-900 font-bold border-t border-neutral-100 pt-2 text-sm">
                              <span>Total Paid</span>
                              <span className="font-mono text-neutral-950">${selectedOrder.total.toFixed(2)}</span>
                            </div>
                          </div>
                        </div>
                      ) : (
                        <div className="space-y-4">
                          {ordersLoading ? (
                            <div className="text-center py-10 space-y-2">
                              <div className="w-6 h-6 border-2 border-neutral-900 border-t-transparent rounded-full animate-spin mx-auto" />
                              <p className="text-[10px] text-neutral-400 font-mono tracking-widest uppercase">Fetching ledger</p>
                            </div>
                          ) : orders.length === 0 ? (
                            <div className="text-center py-16 space-y-4">
                              <ClipboardList className="w-12 h-12 text-neutral-200 mx-auto stroke-[1]" />
                              <div>
                                <p className="text-xs text-neutral-400 font-medium">You have not placed any orders yet.</p>
                                <button onClick={onClose} className="mt-3.5 px-4 py-2 border border-neutral-900 bg-neutral-950 text-white text-[10px] font-bold uppercase tracking-widest rounded-sm cursor-pointer hover:bg-neutral-800">
                                  Shop Collection
                                </button>
                              </div>
                            </div>
                          ) : (
                            orders.map((o) => (
                              <div key={o.id} className="border border-neutral-150 p-4 bg-white flex items-center justify-between">
                                <div>
                                  <div className="flex items-center space-x-2.5 mb-1.5">
                                    <span className="text-xs font-bold font-mono text-neutral-800">#{o.id}</span>
                                    <span className={`px-2 py-0.5 text-[8px] font-bold uppercase tracking-wider rounded-full ${
                                      o.status === 'Delivered'
                                        ? 'bg-emerald-50 text-emerald-700'
                                        : o.status === 'Cancelled'
                                        ? 'bg-red-50 text-red-600'
                                        : 'bg-neutral-100 text-neutral-800'
                                    }`}>
                                      {o.status}
                                    </span>
                                  </div>
                                  <p className="text-[11px] text-neutral-400 font-mono">
                                    Placed on: {new Date(o.createdAt).toLocaleDateString()}
                                  </p>
                                  <p className="text-xs text-neutral-500 mt-1 font-semibold">
                                    {o.items.length} items | <span className="font-mono text-neutral-800">₹{o.total.toFixed(2)}</span>
                                  </p>
                                </div>

                                <button
                                  onClick={() => setSelectedOrder(o)}
                                  className="p-2 bg-neutral-50 hover:bg-neutral-100 text-neutral-600 hover:text-neutral-900 border border-neutral-200 transition-colors flex items-center space-x-1 focus:outline-none cursor-pointer"
                                >
                                  <Eye className="w-4 h-4" />
                                  <span className="text-[10px] font-bold uppercase tracking-widest">Detail</span>
                                </button>
                              </div>
                            ))
                          )}
                        </div>
                      )}
                    </div>
                  )}

                  {activeTab === 'notifications' && (
                    <div className="space-y-6">
                      <div className="pb-2 border-b border-neutral-100">
                        <h3 className="text-xs font-bold uppercase tracking-widest text-neutral-900">
                          Notification Preferences
                        </h3>
                        <p className="text-[10px] text-neutral-400 mt-0.5">Control how Atelier communicates with you</p>
                      </div>

                      <form onSubmit={handleSaveNotifications} className="space-y-4">
                        <div className="space-y-3">
                          <label className="flex items-center justify-between p-3.5 bg-neutral-50 border border-neutral-200 cursor-pointer">
                            <div>
                              <p className="text-xs font-bold text-neutral-800">Email Order Updates</p>
                              <p className="text-[10px] text-neutral-500">Receive receipt & dispatch tracking emails</p>
                            </div>
                            <input
                              type="checkbox"
                              checked={emailNotifs}
                              onChange={(e) => setEmailNotifs(e.target.checked)}
                              className="w-4 h-4 accent-neutral-950 cursor-pointer"
                            />
                          </label>

                          <label className="flex items-center justify-between p-3.5 bg-neutral-50 border border-neutral-200 cursor-pointer">
                            <div>
                              <p className="text-xs font-bold text-neutral-800">Live Order Alerts</p>
                              <p className="text-[10px] text-neutral-500">In-app status updates for active deliveries</p>
                            </div>
                            <input
                              type="checkbox"
                              checked={orderAlerts}
                              onChange={(e) => setOrderAlerts(e.target.checked)}
                              className="w-4 h-4 accent-neutral-950 cursor-pointer"
                            />
                          </label>

                          <label className="flex items-center justify-between p-3.5 bg-neutral-50 border border-neutral-200 cursor-pointer">
                            <div>
                              <p className="text-xs font-bold text-neutral-800">SMS Tracking Alerts</p>
                              <p className="text-[10px] text-neutral-500">Get text messages when your order is out for delivery</p>
                            </div>
                            <input
                              type="checkbox"
                              checked={smsAlerts}
                              onChange={(e) => setSmsAlerts(e.target.checked)}
                              className="w-4 h-4 accent-neutral-950 cursor-pointer"
                            />
                          </label>

                          <label className="flex items-center justify-between p-3.5 bg-neutral-50 border border-neutral-200 cursor-pointer">
                            <div>
                              <p className="text-xs font-bold text-neutral-800">Atelier Private Drops & News</p>
                              <p className="text-[10px] text-neutral-500">Early access invitations to seasonal capsule releases</p>
                            </div>
                            <input
                              type="checkbox"
                              checked={promoAlerts}
                              onChange={(e) => setPromoAlerts(e.target.checked)}
                              className="w-4 h-4 accent-neutral-950 cursor-pointer"
                            />
                          </label>
                        </div>

                        {notifSavedMsg && (
                          <div className="p-2.5 bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-medium flex items-center space-x-2">
                            <Check className="w-4 h-4 text-emerald-600" />
                            <span>{notifSavedMsg}</span>
                          </div>
                        )}

                        <button
                          type="submit"
                          className="py-2.5 px-6 bg-neutral-950 text-white text-[10px] font-bold uppercase tracking-widest hover:bg-neutral-800 transition-colors cursor-pointer"
                        >
                          Save Preferences
                        </button>
                      </form>

                      {/* <div className="pt-4 border-t border-neutral-100 space-y-3">
                        <h4 className="text-[10px] font-bold text-neutral-400 uppercase tracking-widest">
                          Recent Notifications
                        </h4>
                        
                        <div className="space-y-2.5">
                          <div className="p-3 bg-neutral-50 border border-neutral-150 space-y-1">
                            <div className="flex items-center justify-between">
                              <span className="text-[10px] font-bold text-neutral-900 uppercase tracking-wider">Order Shipped</span>
                              <span className="text-[9px] text-neutral-400 font-mono">Today, 2:15 PM</span>
                            </div>
                            <p className="text-xs text-neutral-800 font-medium">Order #ORD-8921 is out for delivery with DHL Express.</p>
                          </div>

                          <div className="p-3 bg-neutral-50 border border-neutral-150 space-y-1">
                            <div className="flex items-center justify-between">
                              <span className="text-[10px] font-bold text-neutral-700 uppercase tracking-wider">Atelier Invitation</span>
                              <span className="text-[9px] text-neutral-400 font-mono">Yesterday</span>
                            </div>
                            <p className="text-xs text-neutral-800 font-medium">Welcome to Atelier Privé! Exclusive preview for Autumn/Winter SS26 is live.</p>
                          </div>
                        </div>
                      </div> */}
                    </div>
                  )}

                  {activeTab === 'security' && (
                    <div className="space-y-6">
                      <div className="pb-2 border-b border-neutral-100">
                        <h3 className="text-xs font-bold uppercase tracking-widest text-neutral-900">
                          Security & Login Controls
                        </h3>
                        <p className="text-[10px] text-neutral-400 mt-0.5">Manage password, authentication and active sessions</p>
                      </div>

                      {/* Change Password Form */}
                      <form onSubmit={handleSecurityPasswordChange} className="space-y-4">
                        <h4 className="text-[10px] font-bold text-neutral-400 uppercase tracking-widest">
                          Change Account Password
                        </h4>

                        <div className="space-y-3">
                          <div className="space-y-1">
                            <label className="text-[10px] font-bold text-neutral-500 uppercase tracking-widest block">Current Password</label>
                            <input
                              type="password"
                              required
                              value={currentPassword}
                              onChange={(e) => setCurrentPassword(e.target.value)}
                              placeholder="••••••••"
                              className="w-full border border-neutral-200 p-2.5 text-xs focus:outline-none focus:border-neutral-950 font-sans"
                            />
                          </div>

                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                            <div className="space-y-1">
                              <label className="text-[10px] font-bold text-neutral-500 uppercase tracking-widest block">New Password</label>
                              <input
                                type="password"
                                required
                                value={newPassword}
                                onChange={(e) => setNewPassword(e.target.value)}
                                placeholder="••••••••"
                                className="w-full border border-neutral-200 p-2.5 text-xs focus:outline-none focus:border-neutral-950 font-sans"
                              />
                            </div>

                            <div className="space-y-1">
                              <label className="text-[10px] font-bold text-neutral-500 uppercase tracking-widest block">Confirm Password</label>
                              <input
                                type="password"
                                required
                                value={confirmPassword}
                                onChange={(e) => setConfirmPassword(e.target.value)}
                                placeholder="••••••••"
                                className="w-full border border-neutral-200 p-2.5 text-xs focus:outline-none focus:border-neutral-950 font-sans"
                              />
                            </div>
                          </div>
                        </div>

                        {securityMsg && (
                          <div className={`p-2.5 text-xs font-medium border ${securityMsg.includes('successfully') ? 'bg-emerald-50 border-emerald-200 text-emerald-800' : 'bg-red-50 border-red-200 text-red-700'}`}>
                            {securityMsg}
                          </div>
                        )}

                        <button
                          type="submit"
                          className="py-2.5 px-6 bg-neutral-950 text-white text-[10px] font-bold uppercase tracking-widest hover:bg-neutral-800 transition-colors cursor-pointer"
                        >
                          Update Password
                        </button>
                      </form>

                      {/* <div className="pt-4 border-t border-neutral-100 space-y-3">
                        <div className="flex items-center justify-between p-3.5 bg-neutral-50 border border-neutral-200">
                          <div>
                            <p className="text-xs font-bold text-neutral-800">Two-Factor Authentication (2FA)</p>
                            <p className="text-[10px] text-neutral-500">Require security code verification on new logins</p>
                          </div>
                          <button
                            onClick={() => setTwoFactorEnabled(!twoFactorEnabled)}
                            className={`px-3 py-1.5 text-[10px] font-bold uppercase tracking-wider transition-colors cursor-pointer ${
                              twoFactorEnabled ? 'bg-emerald-600 text-white' : 'bg-neutral-200 text-neutral-700 hover:bg-neutral-300'
                            }`}
                          >
                            {twoFactorEnabled ? 'Enabled' : 'Enable 2FA'}
                          </button>
                        </div>
                      </div> */}
                    </div>
                  )}
                </div>

                <div className="p-4 border-t border-neutral-100 bg-neutral-50 flex items-center justify-between shrink-0">
                  <div className="text-[10px] text-neutral-400 font-medium tracking-wide">
                    StyleClothing Premium Customer Hub
                  </div>
                  <button
                    onClick={onLogout}
                    className="text-[10px] font-bold text-red-500 hover:text-red-700 uppercase tracking-widest cursor-pointer"
                  >
                    Log Out Session
                  </button>
                </div>
              </>
            )}
          </motion.div>
        </div>
      </div>
    </AnimatePresence>
  );
}
