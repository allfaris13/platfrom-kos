import { useState, useEffect, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import useSWR, { mutate } from 'swr';
import { Homepage } from './homepage';
import { RoomDetail } from './RoomDetail';
import { BookingFlow } from './booking-flow';
import { BookingHistory } from './booking-history';
import { BookingStatsDetail } from './booking-stats-detail';
import { ContactUs } from './contact-us';
import { Gallery } from './Gallery';

import { motion, AnimatePresence } from 'framer-motion';
import { Home, History, User, Menu, LogOut, Mail, Phone, MapPin, CreditCard, X, XCircle, MessageCircle, Star, ImageIcon, Calendar as CalendarIcon, Loader2 } from 'lucide-react';
import { Button } from '@/app/components/ui/button';
import { Input } from '@/app/components/ui/input';
import { Label } from '@/app/components/ui/label';
import { Card } from '@/app/components/ui/card';
import { Badge } from '@/app/components/ui/badge';
import { ThemeToggleButton } from '@/app/components/ui/ThemeToggleButton';
import { ImageWithFallback } from '@/app/components/shared/ImageWithFallback';
import { api, PaymentReminder } from '@/app/services/api';
import { LogIn } from 'lucide-react';
import { toast } from 'sonner';
import { IMAGES } from '@/app/services/image';

interface UserPlatformProps {
  onLogout?: () => void;
}

export function UserPlatform({ onLogout }: UserPlatformProps) {
  const router = useRouter();
  // Initialize with server-safe defaults
  const [activeView, setActiveView] = useState('home');
  const [selectedRoomId, setSelectedRoomId] = useState<string | null>(null);
  const [bookingDraft, setBookingDraft] = useState<{ moveInDate?: string; duration?: string; guests?: string } | undefined>(undefined);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);
  const [isEditingProfile, setIsEditingProfile] = useState(false);
  const [isClient, setIsClient] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);

  // Change Password state
  const [isChangingPassword, setIsChangingPassword] = useState(false);
  const [passwordData, setPasswordData] = useState({
    oldPassword: '',
    newPassword: '',
    confirmPassword: '',
  });
  const [passwordError, setPasswordError] = useState('');
  const [isPasswordLoading, setIsPasswordLoading] = useState(false);
  const [isLoadingProfile, setIsLoadingProfile] = useState(false);
  const [userName, setUserName] = useState('');

  useEffect(() => {
    const init = () => {
      setIsClient(true);

      // Check both storages for token
      const token = localStorage.getItem('token') || sessionStorage.getItem('token');
      const hasToken = !!token;
      setIsLoggedIn(hasToken);

      if (hasToken) {
        try {
          // Check both storages for user data
          const userStr = localStorage.getItem('user') || sessionStorage.getItem('user');
          if (userStr) {
            const userObj = JSON.parse(userStr);
            setUserName(userObj.username || userObj.name || 'User');
          }
        } catch (e) {
          console.error("Error parsing user from storage", e);
        }
      }

      const storedActiveView = localStorage.getItem('user_platform_active_view');
      if (storedActiveView) setActiveView(storedActiveView);

      const storedRoomId = localStorage.getItem('user_platform_selected_room_id');
      if (storedRoomId) setSelectedRoomId(storedRoomId);

      const storedMobileMenu = localStorage.getItem('user_platform_mobile_menu_open');
      if (storedMobileMenu) setMobileMenuOpen(storedMobileMenu === 'true');

      const storedEditing = localStorage.getItem('user_platform_is_editing_profile');
      if (storedEditing) setIsEditingProfile(storedEditing === 'true');
    };

    setTimeout(init, 0);
  }, []);

  // Save state to localStorage whenever it changes, only on client
  useEffect(() => {
    if (!isClient) return;
    localStorage.setItem('user_platform_active_view', activeView);
  }, [activeView, isClient]);

  useEffect(() => {
    if (!isClient) return;
    if (selectedRoomId) {
      localStorage.setItem('user_platform_selected_room_id', selectedRoomId);
    } else {
      localStorage.removeItem('user_platform_selected_room_id');
    }
  }, [selectedRoomId, isClient]);

  useEffect(() => {
    if (!isClient) return;
    localStorage.setItem('user_platform_mobile_menu_open', mobileMenuOpen.toString());
  }, [mobileMenuOpen, isClient]);

  useEffect(() => {
    if (!isClient) return;
    localStorage.setItem('user_platform_is_editing_profile', isEditingProfile.toString());
  }, [isEditingProfile, isClient]);

  useEffect(() => {
    if (!isClient) return;
    localStorage.setItem('user_platform_is_editing_profile', isEditingProfile.toString());
  }, [isEditingProfile, isClient]);

  // Fetch real profile data
  useEffect(() => {
    if (isClient && isLoggedIn && activeView === 'profile') {
      fetchProfile();
    }
  }, [isClient, isLoggedIn, activeView]);



  const fetchProfile = async () => {
    setIsLoadingProfile(true);
    try {
      const data = (await api.getProfile()) as any;
      let bookingsCount = 0;
      let totalSpent = 0;

      try {
        const bookingsData = (await api.getMyBookings()) as Array<{ total_bayar: number }>;
        bookingsCount = bookingsData.length;
        totalSpent = bookingsData.reduce((sum: number, b: { total_bayar: number }) => sum + b.total_bayar, 0);
      } catch (err) {
        console.error("Failed to fetch bookings count for profile", err);
      }

      setUserData({
        name: data.penyewa?.nama_lengkap || data.user?.username || 'Tamu',
        email: data.user?.email || data.user?.username || 'N/A',
        phone: data.penyewa?.nomor_hp || 'N/A',
        address: data.penyewa?.alamat_asal || 'N/A',
        nik: data.penyewa?.nik || '',
        jenisKelamin: data.penyewa?.jenis_kelamin || '',
        joinDate: data.user?.created_at ? new Date(data.user.created_at).toLocaleDateString('id-ID', { month: 'long', year: 'numeric' }) : 'N/A',
        status: 'Active',
        totalBookings: bookingsCount,
        totalSpent: totalSpent,
        isGoogleUser: data.is_google_user,
        profileImage: data.penyewa?.foto_profil
          ? (data.penyewa.foto_profil.startsWith('http') ? data.penyewa.foto_profil : `http://localhost:8080${data.penyewa.foto_profil}`)
          : IMAGES.AVATARS.USER_DEFAULT,
      });
      setEditData({
        name: data.penyewa?.nama_lengkap || data.user?.username || '',
        email: data.user?.email || data.user?.username || '',
        phone: data.penyewa?.nomor_hp || '',
        address: data.penyewa?.alamat_asal || '',
        nik: data.penyewa?.nik || '',
        jenisKelamin: data.penyewa?.jenis_kelamin || '',
        joinDate: '',
        status: '',
        totalBookings: bookingsCount,
        totalSpent: totalSpent,
        isGoogleUser: data.is_google_user,
        profileImage: '',
      });
      // Update simple userName state too
      setUserName(data.penyewa?.nama_lengkap || data.user?.username || 'User');
    } catch (e) {
      console.error("Failed to fetch profile", e);
    } finally {
      setIsLoadingProfile(false);
    }
  };

  // Editable user data
  const [userData, setUserData] = useState({
    name: 'Memuat...',
    email: '',
    phone: '',
    address: '',
    nik: '',
    jenisKelamin: '',
    joinDate: '',
    status: '',
    totalBookings: 0,
    totalSpent: 0,
    isGoogleUser: false,
    profileImage: IMAGES.AVATARS.USER_DEFAULT,
  });

  const [editData, setEditData] = useState(userData);

  // Sync editData when userData changes, but only if not currently editing
  useEffect(() => {
    if (!isEditingProfile) {
      setEditData(userData);
    }
  }, [userData, isEditingProfile]);

  const navigateToRoomDetail = (roomId: string) => {
    setSelectedRoomId(roomId);
    setActiveView('room-detail');
  };

  const navigateToBooking = (roomId: string, initialData?: { moveInDate?: string; duration?: string; guests?: string }) => {
    setSelectedRoomId(roomId);
    setBookingDraft(initialData);
    setActiveView('booking');
  };

  const handleSaveProfile = async () => {
    try {
      const formData = new FormData();
      formData.append('nama_lengkap', editData.name);
      formData.append('nomor_hp', editData.phone);
      formData.append('alamat_asal', editData.address);
      formData.append('nik', editData.nik);
      formData.append('jenis_kelamin', editData.jenisKelamin);

      if (selectedFile) {
        formData.append('foto_profil', selectedFile);
      }

      const res = (await api.updateProfile(formData)) as any;

      setUserData({
        ...editData,
        profileImage: res.penyewa?.foto_profil
          ? (res.penyewa.foto_profil.startsWith('http') ? res.penyewa.foto_profil : `http://localhost:8080${res.penyewa.foto_profil}`)
          : editData.profileImage
      });
      setIsEditingProfile(false);
      setSelectedFile(null);
      setPreviewUrl(null);
      toast.success("Profil berhasil diperbarui!");
      // Update simple userName
      setUserName(editData.name);
    } catch (e) {
      console.error("Failed to update profile", e);
      toast.error("Gagal memperbarui profil. Silakan coba lagi.");
    }
  };

  const handleCancelEdit = () => {
    setEditData(userData);
    setSelectedFile(null);
    setPreviewUrl(null);
    setIsEditingProfile(false);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setSelectedFile(file);
      const url = URL.createObjectURL(file);
      setPreviewUrl(url);
    }
  };

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setPasswordError('');

    if (passwordData.newPassword !== passwordData.confirmPassword) {
      setPasswordError('Password baru tidak cocok');
      return;
    }

    if (passwordData.newPassword.length < 6) {
      setPasswordError('Password minimal 6 karakter');
      return;
    }

    setIsPasswordLoading(true);
    try {
      await api.changePassword({
        old_password: passwordData.oldPassword,
        new_password: passwordData.newPassword,
      });
      toast.success('Password berhasil diperbarui!');
      setIsChangingPassword(false);
      setPasswordData({ oldPassword: '', newPassword: '', confirmPassword: '' });
    } catch (err: unknown) {
      if (err instanceof Error) {
        setPasswordError(err.message);
        toast.error(err.message);
      } else {
        setPasswordError('Gagal mengganti password');
        toast.error('Gagal mengganti password');
      }
    } finally {
      setIsPasswordLoading(false);
    }
  };

  const menuItems = [
    { id: 'home', label: 'Beranda', icon: Home },
    { id: 'gallery', label: 'Galeri Kos', icon: ImageIcon },

    { id: 'history', label: 'Pesanan & Tagihan', icon: History, hidden: !isLoggedIn },
    { id: 'profile', label: 'Profil', icon: User, hidden: !isLoggedIn },
  ];

  if (!isMounted) return null;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-slate-100 to-stone-50 dark:from-slate-950 dark:via-slate-900 dark:to-slate-950 font-['Poppins']">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-white/90 dark:bg-slate-950/90 backdrop-blur-2xl border-b border-slate-200/60 dark:border-slate-800/60 shadow-md hover:shadow-lg transition-shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {/* Logo */}
            <div className="flex items-center gap-3 cursor-pointer hover:opacity-80 transition-opacity" onClick={() => setActiveView('home')}>
              <div className="w-11 h-11 bg-gradient-to-br from-stone-700 via-stone-800 to-stone-900 rounded-xl flex items-center justify-center shadow-lg">
                <Home className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-slate-900 dark:text-white uppercase tracking-tighter">Rahmat ZAW</h1>
                <p className="text-[10px] text-slate-500 dark:text-slate-400 uppercase font-black">Malang Prime Stay</p>
              </div>
            </div>

            {/* Desktop Navigation */}
            <nav className="hidden md:flex items-center gap-2">
              {menuItems.filter(item => !item.hidden).map((item) => {
                const Icon = item.icon;
                return (
                  <button
                    key={item.id}
                    onClick={() => setActiveView(item.id)}
                    className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium text-sm transition-all duration-200 ${activeView === item.id
                      ? 'bg-gradient-to-r from-stone-700 to-stone-900 text-white shadow-lg'
                      : 'text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-slate-900 dark:hover:text-white'
                      }`}
                  >
                    <Icon className="w-4 h-4" />
                    <span>{item.label}</span>
                  </button>
                );
              })}

              {!isLoggedIn && (
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => router.push('/login')}
                  className="flex items-center gap-2 px-4 py-2 rounded-lg font-medium text-sm bg-stone-900 text-white hover:bg-stone-800 transition-all duration-200 ml-2 shadow-lg"
                >
                  <LogIn className="w-4 h-4" />
                  <span>Masuk</span>
                </motion.button>
              )}

              {/* Contact Button */}
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setActiveView('contact')}
                className="flex items-center gap-2 px-4 py-2 rounded-lg font-medium text-sm bg-blue-50 dark:bg-blue-950 text-blue-700 dark:text-blue-300 hover:bg-blue-100 dark:hover:bg-blue-900 transition-all duration-200 ml-2"
              >
                <MessageCircle className="w-4 h-4" />
                <span>Hubungi Kami</span>
              </motion.button>

              {/* Theme Toggle Button */}
              <ThemeToggleButton />
            </nav>

            {/* Mobile Menu Button */}
            <div className="md:hidden flex items-center gap-2">
              <ThemeToggleButton />
              <Button
                variant="outline"
                size="sm"
                className="border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800"
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              >
                <Menu className="w-5 h-5" />
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Mobile Sidebar - Premium Dark Drawer */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setMobileMenuOpen(false)}
              className="md:hidden fixed inset-0 bg-black/70 backdrop-blur-sm z-[60]"
            />

            {/* Sidebar Drawer */}
            <motion.aside
              initial={{ x: '-100%' }}
              animate={{ x: 0 }}
              exit={{ x: '-100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              className="md:hidden fixed top-0 bottom-0 left-0 w-[280px] z-[70] shadow-2xl flex flex-col"
              style={{ background: 'linear-gradient(180deg, #1a1a2e 0%, #16213e 50%, #0f1626 100%)' }}
            >
              {/* Sidebar Header - Logo & Close */}
              <div className="px-6 pt-6 pb-4 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-gradient-to-br from-orange-500 to-amber-500 rounded-xl flex items-center justify-center shadow-lg shadow-orange-500/30">
                    <Home className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <h1 className="text-sm font-bold text-white tracking-tight leading-none">Rahmat ZAW</h1>
                    <p className="text-[9px] text-slate-400 uppercase font-semibold mt-0.5">Prime Stay</p>
                  </div>
                </div>
                <button
                  onClick={() => setMobileMenuOpen(false)}
                  className="w-8 h-8 bg-white/10 hover:bg-white/20 rounded-full flex items-center justify-center text-slate-400 hover:text-white transition-colors"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* User Profile Section */}
              {isLoggedIn && (
                <div className="mx-5 mb-5 p-4 rounded-2xl bg-white/5 border border-white/10">
                  <div className="flex items-center gap-3">
                    <ImageWithFallback
                      src={userData.profileImage}
                      alt={userName || 'User'}
                      className="w-12 h-12 rounded-full object-cover border-2 border-amber-400/40 shadow-lg"
                    />
                    <div className="flex-1 min-w-0">
                      <p className="text-white font-semibold text-sm truncate">{userName || 'User'}</p>
                      <p className="text-amber-400 text-[10px] font-bold uppercase tracking-wider">Gold Member</p>
                    </div>
                  </div>
                </div>
              )}

              {/* Navigation Menu */}
              <nav className="flex-1 overflow-y-auto px-4 space-y-1">
                {menuItems.filter(item => !item.hidden).map((item) => {
                  const Icon = item.icon;
                  const isActive = activeView === item.id;
                  return (
                    <button
                      key={item.id}
                      onClick={() => {
                        setActiveView(item.id);
                        setMobileMenuOpen(false);
                      }}
                      className={`w-full flex items-center gap-3.5 px-4 py-3 rounded-xl font-medium transition-all duration-200 group ${isActive
                        ? 'bg-gradient-to-r from-amber-500/20 to-orange-500/10 text-amber-400 border border-amber-500/20'
                        : 'text-slate-400 hover:bg-white/5 hover:text-white'
                        }`}
                    >
                      <Icon className={`w-5 h-5 transition-colors ${isActive ? 'text-amber-400' : 'text-slate-500 group-hover:text-slate-300'}`} />
                      <span className="text-sm">{item.label}</span>
                      {isActive && <div className="ml-auto w-1.5 h-1.5 bg-amber-400 rounded-full shadow-sm shadow-amber-400/50" />}
                    </button>
                  );
                })}

                {/* Contact Us */}
                <button
                  onClick={() => {
                    setActiveView('contact');
                    setMobileMenuOpen(false);
                  }}
                  className={`w-full flex items-center gap-3.5 px-4 py-3 rounded-xl font-medium transition-all duration-200 group ${activeView === 'contact'
                    ? 'bg-gradient-to-r from-amber-500/20 to-orange-500/10 text-amber-400 border border-amber-500/20'
                    : 'text-slate-400 hover:bg-white/5 hover:text-white'
                    }`}
                >
                  <MessageCircle className={`w-5 h-5 transition-colors ${activeView === 'contact' ? 'text-amber-400' : 'text-slate-500 group-hover:text-slate-300'}`} />
                  <span className="text-sm">Hubungi Kami</span>
                  {activeView === 'contact' && <div className="ml-auto w-1.5 h-1.5 bg-amber-400 rounded-full shadow-sm shadow-amber-400/50" />}
                </button>

                {!isLoggedIn && (
                  <button
                    onClick={() => {
                      onLogout?.();
                      setMobileMenuOpen(false);
                    }}
                    className="w-full flex items-center gap-3.5 px-4 py-3 rounded-xl font-medium text-slate-400 hover:bg-white/5 hover:text-white transition-all duration-200 group"
                  >
                    <LogIn className="w-5 h-5 text-slate-500 group-hover:text-slate-300" />
                    <span className="text-sm">Masuk</span>
                  </button>
                )}
              </nav>

              {/* Sign Out Button */}
              {isLoggedIn && (
                <div className="px-4 py-3 border-t border-white/5">
                  <button
                    onClick={() => {
                      api.logout();
                      setMobileMenuOpen(false);
                      onLogout?.();
                    }}
                    className="w-full flex items-center gap-3.5 px-4 py-3 rounded-xl font-medium text-slate-400 hover:bg-red-500/10 hover:text-red-400 transition-all duration-200 group"
                  >
                    <LogOut className="w-5 h-5 text-slate-500 group-hover:text-red-400 transition-colors" />
                    <span className="text-sm">Sign Out</span>
                  </button>
                </div>
              )}

              {/* Sidebar Footer */}
              <div className="px-6 py-4 border-t border-white/5 flex items-center justify-between">
                <p className="text-[10px] text-slate-600 uppercase tracking-widest font-bold">
                  Premium V1.0.2
                </p>
                <div className="flex items-center gap-2">
                  <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 shadow-sm shadow-emerald-500/50" />
                  <div className="w-1.5 h-1.5 rounded-full bg-amber-500 shadow-sm shadow-amber-500/50" />
                </div>
              </div>
            </motion.aside>
          </>
        )}
      </AnimatePresence>

      <main className="relative">
        <AnimatePresence mode="wait">
          <motion.div
            key={activeView + (selectedRoomId || '')}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.4, ease: "easeOut" }}
          >
            {activeView === 'home' && (
              <Homepage
                onRoomClick={navigateToRoomDetail}
                isLoggedIn={isLoggedIn}
                onLoginPrompt={onLogout}
                userName={userName}
                onViewHistory={() => setActiveView('history')}
              />
            )}
            {activeView === 'gallery' && <Gallery />}

            {activeView === 'contact' && <ContactUs />}

            {/* Protected Views with Guest Teasers */}
            {/* Wishlist section removed */}

            {activeView === 'room-detail' && selectedRoomId && (
              <RoomDetail
                roomId={selectedRoomId}
                onBookNow={navigateToBooking}
                onBack={() => setActiveView('home')}
                isLoggedIn={isLoggedIn}
                onLoginPrompt={onLogout}
              />
            )}

            {activeView === 'booking' && selectedRoomId && (
              !isLoggedIn ? (
                <div className="max-w-4xl mx-auto px-4 py-20 text-center">
                  <div className="bg-white dark:bg-slate-900 p-12 rounded-3xl shadow-2xl border border-slate-100 dark:border-slate-800">
                    <CreditCard className="w-20 h-20 text-blue-500 mx-auto mb-6 opacity-20" />
                    <h2 className="text-4xl font-bold text-slate-900 dark:text-white mb-4">Siap untuk Pindah?</h2>
                    <p className="text-slate-600 dark:text-slate-400 mb-8 text-lg max-w-md mx-auto">Silakan login terlebih dahulu untuk melakukan pemesanan kamar premium ini secara aman.</p>
                    <Button onClick={onLogout} className="bg-stone-900 hover:bg-stone-800 text-white px-10 py-6 text-lg rounded-xl font-bold shadow-xl shadow-stone-900/20">Masuk untuk Memesan</Button>
                  </div>
                </div>
              ) : (
                <BookingFlow roomId={selectedRoomId} initialData={bookingDraft} onBack={() => setActiveView('room-detail')} />
              )
            )}

            {activeView === 'history' && (
              !isLoggedIn ? (
                <div className="max-w-4xl mx-auto px-4 py-20 text-center">
                  <div className="bg-white dark:bg-slate-900 p-12 rounded-3xl shadow-2xl border border-slate-100 dark:border-slate-800">
                    <History className="w-20 h-20 text-indigo-500 mx-auto mb-6 opacity-20" />
                    <h2 className="text-4xl font-bold text-slate-900 dark:text-white mb-4">Riwayat Pemesanan</h2>
                    <p className="text-slate-600 dark:text-slate-400 mb-8 text-lg max-w-md mx-auto">Pantau status transaksi dan riwayat sewa kamar kamu dengan login ke akun personal.</p>
                    <Button onClick={onLogout} className="bg-stone-900 hover:bg-stone-800 text-white px-10 py-6 text-lg rounded-xl font-bold shadow-xl shadow-stone-900/20">Login Sekarang</Button>
                  </div>
                </div>
              ) : (
                <BookingHistory onViewRoom={navigateToRoomDetail} />
              )
            )}

            {activeView === 'profile' && isLoggedIn && (
              <AnimatePresence mode="wait">
                {isLoadingProfile ? (
                  <motion.div
                    key="profile-loading"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.3 }}
                    className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12"
                  >
                    <div className="animate-pulse space-y-8">
                      <div className="h-64 bg-slate-200 dark:bg-slate-800 rounded-3xl" />
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        <div className="h-96 bg-slate-200 dark:bg-slate-800 rounded-2xl" />
                        <div className="h-96 bg-slate-200 dark:bg-slate-800 rounded-2xl" />
                      </div>
                    </div>
                    <div className="flex flex-col items-center justify-center mt-12 gap-3 text-slate-400">
                      <Loader2 className="w-8 h-8 animate-spin" />
                      <p className="text-sm font-medium">Memuat data profil...</p>
                    </div>
                  </motion.div>
                ) : (
                  <motion.div
                    key="profile-content"
                    initial="hidden"
                    animate="visible"
                    exit="hidden"
                    variants={{
                      hidden: { opacity: 0 },
                      visible: {
                        opacity: 1,
                        transition: { staggerChildren: 0.1 }
                      }
                    }}
                    className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12"
                  >
                    {/* Profile Header */}
                    <motion.div variants={{ hidden: { y: 20, opacity: 0 }, visible: { y: 0, opacity: 1 } }}>
                      <Card className="mb-10 p-8 bg-gradient-to-r from-stone-900 via-stone-800 to-slate-900 text-white border-0 shadow-2xl">
                        {/* Top Row: Avatar, Info, Action */}
                        <div className="flex flex-col md:flex-row items-center gap-6 mb-8">
                          {/* Avatar */}
                          <div className="relative flex-shrink-0">
                            <ImageWithFallback
                              src={userData.profileImage}
                              alt={userData.name}
                              className="w-24 h-24 md:w-28 md:h-28 rounded-full object-cover border-4 border-white/20 shadow-xl"
                            />
                            <div className="absolute bottom-1 right-1 bg-emerald-500 w-7 h-7 rounded-full border-2 border-stone-800 shadow-lg flex items-center justify-center">
                              <span className="text-white text-xs font-bold">✓</span>
                            </div>
                          </div>

                          {/* User Info */}
                          <div className="flex-1 text-center md:text-left">
                            <div className="flex flex-col md:flex-row items-center gap-3 mb-2">
                              <h1 className="text-2xl md:text-3xl font-bold text-white tracking-tight">{userData.name}</h1>
                              <Badge className="bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 px-3 py-0.5 text-xs font-semibold tracking-wide uppercase">{userData.status}</Badge>
                            </div>
                            <p className="text-stone-300 text-sm md:text-base font-medium opacity-90">{userData.email}</p>
                          </div>

                          {/* Edit Button - Pushed to right on desktop */}
                          {!isEditingProfile && (
                            <div className="mt-4 md:mt-0 md:ml-auto">
                              <Button
                                onClick={() => setIsEditingProfile(true)}
                                size="sm"
                                className="bg-white/10 hover:bg-white/20 text-white border border-white/20 font-semibold px-6 shadow-lg backdrop-blur-sm transition-all"
                              >
                                Edit Profil
                              </Button>
                            </div>
                          )}
                        </div>

                        {/* Bottom Row: Stats Grid - Separated for cleaner layout */}
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 border-t border-white/10 pt-6">
                          <div className="bg-white/5 p-4 rounded-xl border border-white/5 backdrop-blur-sm flex flex-col items-center md:items-start transition-colors hover:bg-white/10">
                            <p className="text-stone-400 text-xs font-bold uppercase tracking-widest mb-1">Nomor Kamar</p>
                            <p className="text-2xl font-bold text-white tracking-tight leading-none">{userData.totalBookings > 0 ? '#' + userData.totalBookings : '-'}</p>
                          </div>
                          <div className="bg-white/5 p-4 rounded-xl border border-white/5 backdrop-blur-sm flex flex-col items-center md:items-start transition-colors hover:bg-white/10">
                            <p className="text-stone-400 text-xs font-bold uppercase tracking-widest mb-1">Total Pengeluaran</p>
                            <p className="text-2xl font-bold text-white tracking-tight leading-none">Rp {userData.totalSpent.toLocaleString()}</p>
                          </div>
                          <div className="bg-white/5 p-4 rounded-xl border border-white/5 backdrop-blur-sm flex flex-col items-center md:items-start transition-colors hover:bg-white/10">
                            <p className="text-stone-400 text-xs font-bold uppercase tracking-widest mb-1">Anggota Sejak</p>
                            <p className="text-xl font-bold text-white tracking-tight leading-none">{userData.joinDate}</p>
                          </div>
                        </div>
                      </Card>
                    </motion.div>

                    {/* Edit Profile Modal */}
                    {isEditingProfile && (
                      <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
                        <Card className="w-full max-w-2xl max-h-[90vh] overflow-y-auto bg-white shadow-2xl border-0">
                          <div className="p-8">
                            <div className="flex items-center justify-between mb-8">
                              <div>
                                <h2 className="text-3xl font-bold text-slate-900">Edit Profil</h2>
                                <p className="text-slate-600 mt-1">Perbarui informasi pribadi Anda</p>
                              </div>
                              <button
                                onClick={handleCancelEdit}
                                className="p-2 hover:bg-slate-100 rounded-lg transition duration-200"
                              >
                                <X className="w-6 h-6 text-slate-600 hover:text-slate-900" />
                              </button>
                            </div>

                            <div className="space-y-6">
                              <div className="flex flex-col items-center mb-6">
                                <div className="relative group">
                                  <ImageWithFallback
                                    src={previewUrl || editData.profileImage}
                                    alt="Preview"
                                    className="w-24 h-24 rounded-full object-cover border-4 border-slate-100 shadow-md group-hover:opacity-75 transition-opacity"
                                  />
                                  <label className="absolute inset-0 flex items-center justify-center bg-black/40 rounded-full opacity-0 group-hover:opacity-100 cursor-pointer transition-opacity">
                                    <span className="text-white text-xs font-bold">Ubah</span>
                                    <input
                                      type="file"
                                      className="hidden"
                                      accept="image/*"
                                      onChange={handleFileChange}
                                    />
                                  </label>
                                </div>
                                <p className="text-xs text-slate-500 mt-2">Klik gambar untuk mengganti foto</p>
                              </div>

                              <div>
                                <Label className="text-slate-900 font-semibold mb-3 block">Nama Lengkap</Label>
                                <Input
                                  value={editData.name}
                                  onChange={(e) => setEditData({ ...editData, name: e.target.value })}
                                  className="border-slate-300 bg-slate-50 focus:bg-white focus:border-stone-900 text-lg py-2"
                                  placeholder="Masukkan nama lengkap"
                                />
                              </div>

                              <div className="grid grid-cols-2 gap-4">
                                <div>
                                  <Label className="text-slate-900 font-semibold mb-3 block">NIK</Label>
                                  <Input
                                    value={editData.nik}
                                    onChange={(e) => setEditData({ ...editData, nik: e.target.value })}
                                    className="border-slate-300 bg-slate-50 focus:bg-white focus:border-stone-900 text-lg py-2"
                                    placeholder="NIK"
                                  />
                                </div>
                                <div>
                                  <Label className="text-slate-900 font-semibold mb-3 block">Jenis Kelamin</Label>
                                  <select
                                    value={editData.jenisKelamin}
                                    onChange={(e) => setEditData({ ...editData, jenisKelamin: e.target.value })}
                                    className="w-full border border-slate-300 rounded-md bg-slate-50 focus:bg-white focus:border-stone-900 text-lg py-2 px-3"
                                  >
                                    <option value="">Pilih Jenis Kelamin</option>
                                    <option value="Laki-laki">Laki-laki</option>
                                    <option value="Perempuan">Perempuan</option>
                                  </select>
                                </div>
                              </div>

                              <div>
                                <Label className="text-slate-900 font-semibold mb-3 block">Nomor Telepon</Label>
                                <Input
                                  value={editData.phone}
                                  onChange={(e) => setEditData({ ...editData, phone: e.target.value })}
                                  className="border-slate-300 bg-slate-50 focus:bg-white focus:border-stone-900 text-lg py-2"
                                  placeholder="+1 (555) 123-4567"
                                />
                              </div>

                              <div>
                                <Label className="text-slate-900 font-semibold mb-3 block">Alamat</Label>
                                <Input
                                  value={editData.address}
                                  onChange={(e) => setEditData({ ...editData, address: e.target.value })}
                                  className="border-slate-300 bg-slate-50 focus:bg-white focus:border-stone-900 text-lg py-2"
                                  placeholder="123 Main Street, City, State"
                                />
                              </div>

                              <div className="flex gap-4 pt-6 border-t border-slate-200">
                                <Button
                                  onClick={handleSaveProfile}
                                  className="flex-1 bg-stone-900 hover:bg-stone-800 text-white font-bold py-3 shadow-lg hover:shadow-xl transition-all"
                                >
                                  Simpan Perubahan
                                </Button>
                                <Button
                                  onClick={handleCancelEdit}
                                  variant="outline"
                                  className="flex-1 border-2 border-slate-300 hover:bg-slate-50 font-bold py-3"
                                >
                                  Batal
                                </Button>
                              </div>
                            </div>
                          </div>
                        </Card>
                      </div>
                    )}

                    {/* Change Password Modal */}
                    {isChangingPassword && (
                      <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[60] flex items-center justify-center p-4">
                        <Card className="w-full max-w-md bg-white shadow-2xl border-0 overflow-hidden rounded-2xl">
                          <div className="p-8">
                            <div className="flex items-center justify-between mb-6">
                              <div>
                                <h2 className="text-2xl font-bold text-slate-900">Ganti Password</h2>
                                <p className="text-slate-500 text-sm mt-1">Pastikan akun Anda tetap aman</p>
                              </div>
                              <button
                                onClick={() => {
                                  setIsChangingPassword(false);
                                  setPasswordError('');
                                  setPasswordData({ oldPassword: '', newPassword: '', confirmPassword: '' });
                                }}
                                className="p-2 hover:bg-slate-100 rounded-lg transition"
                              >
                                <X className="w-5 h-5 text-slate-400" />
                              </button>
                            </div>

                            <form onSubmit={handleChangePassword} className="space-y-4">
                              {passwordError && (
                                <div className="bg-red-50 text-red-600 p-3 rounded-lg text-xs font-medium border border-red-100 flex items-center gap-2">
                                  <XCircle className="w-4 h-4" />
                                  {passwordError}
                                </div>
                              )}

                              <div className="space-y-2">
                                <Label className="text-sm font-semibold text-slate-700">Password Saat Ini</Label>
                                <Input
                                  type="password"
                                  required
                                  value={passwordData.oldPassword}
                                  onChange={(e) => setPasswordData({ ...passwordData, oldPassword: e.target.value })}
                                  className="border-slate-200 bg-slate-50 focus:bg-white focus:ring-stone-900"
                                  placeholder="••••••••"
                                />
                              </div>

                              <div className="space-y-2">
                                <Label className="text-sm font-semibold text-slate-700">Password Baru</Label>
                                <Input
                                  type="password"
                                  required
                                  value={passwordData.newPassword}
                                  onChange={(e) => setPasswordData({ ...passwordData, newPassword: e.target.value })}
                                  className="border-slate-200 bg-slate-50 focus:bg-white focus:ring-stone-900"
                                  placeholder="••••••••"
                                />
                              </div>

                              <div className="space-y-2">
                                <Label className="text-sm font-semibold text-slate-700">Konfirmasi Password Baru</Label>
                                <Input
                                  type="password"
                                  required
                                  value={passwordData.confirmPassword}
                                  onChange={(e) => setPasswordData({ ...passwordData, confirmPassword: e.target.value })}
                                  className="border-slate-200 bg-slate-50 focus:bg-white focus:ring-stone-900"
                                  placeholder="••••••••"
                                />
                              </div>

                              <div className="flex gap-3 pt-4">
                                <Button
                                  type="submit"
                                  disabled={isPasswordLoading}
                                  className="flex-1 bg-stone-900 hover:bg-stone-800 text-white font-bold py-2 rounded-xl shadow-lg"
                                >
                                  {isPasswordLoading ? 'Memperbarui...' : 'Perbarui Password'}
                                </Button>
                                <Button
                                  type="button"
                                  variant="outline"
                                  onClick={() => {
                                    setIsChangingPassword(false);
                                    setPasswordError('');
                                  }}
                                  className="flex-1 border-slate-200"
                                >
                                  Batal
                                </Button>
                              </div>
                            </form>
                          </div>
                        </Card>
                      </div>
                    )}

                    {/* Profile Details */}
                    <motion.div
                      variants={{
                        hidden: { opacity: 0 },
                        visible: { opacity: 1, transition: { staggerChildren: 0.1, delayChildren: 0.2 } }
                      }}
                      className="grid grid-cols-1 md:grid-cols-2 gap-8"
                    >
                      {/* Personal Information */}
                      <motion.div variants={{ hidden: { y: 20, opacity: 0 }, visible: { y: 0, opacity: 1 } }} className="h-full">
                        <Card className="h-full p-8 bg-white/80 backdrop-blur-sm border-slate-200/60 hover:shadow-lg transition-all text-slate-900 font-semibold">
                          <div className="flex items-center gap-3 mb-7">
                            <div className="w-10 h-10 bg-gradient-to-br from-stone-700 to-stone-900 rounded-lg flex items-center justify-center">
                              <Mail className="w-5 h-5 text-white" />
                            </div>
                            <h2 className="text-2xl font-bold text-slate-900">Informasi Pribadi</h2>
                          </div>

                          <div className="space-y-6">
                            <div className="pb-4 border-b border-slate-200">
                              <label className="text-sm text-slate-600 font-semibold uppercase tracking-wide">Nama Lengkap</label>
                              <p className="text-slate-900 mt-2 text-lg font-semibold">{userData.name}</p>
                            </div>

                            <div className="pb-4 border-b border-slate-200">
                              <label className="text-sm text-slate-600 font-semibold uppercase tracking-wide mb-2 flex items-center gap-2">
                                <Mail className="w-4 h-4 text-stone-700" />
                                Alamat Email
                              </label>
                              <p className="text-slate-900 mt-2 text-lg font-semibold">{userData.email}</p>
                            </div>

                            <div className="pb-4 border-b border-slate-200">
                              <label className="text-sm text-slate-600 font-semibold uppercase tracking-wide mb-2 flex items-center gap-2">
                                <Phone className="w-4 h-4 text-stone-700" />
                                Nomor Telepon
                              </label>
                              <p className="text-slate-900 mt-2 text-lg font-semibold">{userData.phone}</p>
                            </div>

                            <div>
                              <label className="text-sm text-slate-600 font-semibold uppercase tracking-wide mb-2 flex items-center gap-2">
                                <MapPin className="w-4 h-4 text-stone-700" />
                                Alamat
                              </label>
                              <p className="text-slate-900 mt-2 text-lg font-semibold">{userData.address}</p>
                            </div>
                          </div>
                        </Card>
                      </motion.div>

                      {/* Account & Preferences */}
                      <motion.div variants={{ hidden: { y: 20, opacity: 0 }, visible: { y: 0, opacity: 1 } }} className="h-full">
                        <Card className="h-full p-8 bg-white/80 backdrop-blur-sm border-slate-200/60 hover:shadow-lg transition-all text-slate-900 font-semibold">
                          <div className="flex items-center gap-3 mb-7">
                            <div className="w-10 h-10 bg-gradient-to-br from-blue-600 to-blue-700 rounded-lg flex items-center justify-center">
                              <CreditCard className="w-5 h-5 text-white" />
                            </div>
                            <h2 className="text-2xl font-bold text-slate-900">Akun & Pengaturan</h2>
                          </div>

                          <div className="space-y-6">
                            <div className="pb-4 border-b border-slate-200">
                              <label className="text-sm text-slate-600 font-semibold uppercase tracking-wide">Anggota Sejak</label>
                              <p className="text-slate-900 mt-2 text-lg font-semibold">{userData.joinDate}</p>
                            </div>

                            <div className="pb-4 border-b border-slate-200">
                              <label className="text-sm text-slate-600 font-semibold uppercase tracking-wide">Status Akun</label>
                              <div className="mt-2 flex items-center gap-3">
                                <div className="w-3 h-3 bg-emerald-400 rounded-full shadow-md" />
                                <p className="text-slate-900 text-lg font-semibold">{userData.status}</p>
                              </div>
                            </div>

                            <div className="pb-4 border-b border-slate-200">
                              <label className="text-sm text-slate-600 font-semibold uppercase tracking-wide">Verifikasi</label>
                              <Badge className="mt-2 bg-emerald-100 text-emerald-800 font-bold px-3 py-1">✓ Email Terverifikasi</Badge>
                            </div>

                            {!userData?.isGoogleUser && (
                              <div className="pt-2">
                                <Button
                                  onClick={() => setIsChangingPassword(true)}
                                  variant="outline"
                                  className="w-full font-semibold border-2 border-slate-300 hover:bg-slate-50 py-2"
                                >
                                  Ganti Password
                                </Button>
                              </div>
                            )}
                          </div>
                        </Card>
                      </motion.div>
                    </motion.div>

                    {/* Danger Zone */}
                    <motion.div variants={{ hidden: { y: 20, opacity: 0 }, visible: { y: 0, opacity: 1 } }}>
                      <Card className="mt-10 p-8 border-red-200 bg-gradient-to-br from-red-50 to-rose-50 hover:shadow-lg transition-all">
                        <div className="flex items-center gap-3 mb-4">
                          <XCircle className="w-6 h-6 text-red-600" />
                          <h2 className="text-2xl font-bold text-red-900">Area Berbahaya</h2>
                        </div>
                        <p className="text-sm text-red-700 mb-8 leading-relaxed">
                          Tindakan ini tidak dapat dibatalkan. Mohon tinjau kembali sebelum melanjutkan.
                        </p>
                        <div className="space-y-4">
                          <div className="flex gap-4 flex-col sm:flex-row">
                            <Button
                              onClick={() => {
                                // Clear UserPlatform specific state
                                localStorage.removeItem('user_platform_active_view');
                                localStorage.removeItem('user_platform_selected_room_id');
                                localStorage.removeItem('user_platform_mobile_menu_open');
                                localStorage.removeItem('user_platform_is_editing_profile');
                                localStorage.removeItem('user_platform_wishlist');
                                // Call parent logout
                                onLogout?.();
                              }}
                              className="flex-1 bg-stone-900 hover:bg-stone-800 text-white font-bold py-3 shadow-lg hover:shadow-xl transition-all"
                            >
                              <LogOut className="w-5 h-5 mr-2" />
                              Keluar
                            </Button>

                            <Button
                              variant="outline"
                              className="flex-1 border-2 border-red-300 text-red-700 hover:bg-red-100 font-semibold py-3"
                            >
                              Hapus Akun
                            </Button>
                          </div>
                        </div>
                      </Card>
                    </motion.div>
                  </motion.div>
                )}
              </AnimatePresence>
            )}
          </motion.div>
        </AnimatePresence>
      </main>

      {/* Footer */}
      <footer className="bg-gradient-to-b from-slate-900 via-slate-900 to-slate-950 text-white py-16 mt-24 border-t border-slate-800/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-10 mb-12">
            {/* Brand */}
            <div className="md:col-span-1">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 bg-gradient-to-br from-stone-400 to-stone-600 rounded-lg flex items-center justify-center">
                  <Home className="w-5 h-5 text-white" />
                </div>
                <h3 className="font-bold text-lg text-white">Rahmat ZAW</h3>
              </div>
              <p className="text-slate-400 text-sm leading-relaxed">Hunian kost putra premium di kawasan Sigura-gura, Malang. Nyaman, aman, dan strategis.</p>
            </div>

            {/* Mobile Grid for Links */}
            <div className="grid grid-cols-2 gap-8 md:contents">
              {/* Quick Links */}
              <div>
                <h4 className="font-semibold mb-4 text-white uppercase tracking-wide text-sm">Tautan Cepat</h4>
                <ul className="space-y-3 text-sm">
                  <li><button onClick={() => setActiveView('home')} className="text-slate-400 hover:text-white transition-colors">Beranda</button></li>
                  <li><button onClick={() => setActiveView('gallery')} className="text-slate-400 hover:text-white transition-colors">Galeri</button></li>
                  <li><button onClick={() => setActiveView('contact')} className="text-slate-400 hover:text-white transition-colors">Kontak</button></li>
                  <li><a href="#" className="text-slate-400 hover:text-white transition-colors">FAQ</a></li>
                </ul>
              </div>

              {/* Legal */}
              <div>
                <h4 className="font-semibold mb-4 text-white uppercase tracking-wide text-sm">Legal</h4>
                <ul className="space-y-3 text-sm">
                  <li><a href="#" className="text-slate-400 hover:text-white transition-colors">Kebijakan Privasi</a></li>
                  <li><a href="#" className="text-slate-400 hover:text-white transition-colors">Syarat & Ketentuan</a></li>
                </ul>
              </div>
            </div>

            {/* Contact Info */}
            <div>
              <h4 className="font-semibold mb-4 text-white uppercase tracking-wide text-sm">Kontak</h4>
              <ul className="space-y-3 text-sm text-slate-400">
                <li className="flex items-start gap-2">
                  <Mail className="w-4 h-4 text-stone-400 mt-0.5 flex-shrink-0" />
                  <span>support@rahmatzaw.com</span>
                </li>
                <li className="flex items-start gap-2">
                  <Phone className="w-4 h-4 text-stone-400 mt-0.5 flex-shrink-0" />
                  <span>+62 812-4911-926</span>
                </li>
                <li className="flex items-start gap-2">
                  <MapPin className="w-4 h-4 text-stone-400 mt-0.5 flex-shrink-0" />
                  <span>Pondok Alam, Jl. Sigura - Gura No.21 Blok A2, Malang</span>
                </li>
              </ul>
            </div>
          </div>

          {/* Divider */}
          <div className="border-t border-slate-800/50 my-8" />

          {/* Footer Bottom */}
          <div className="flex flex-col md:flex-row items-center justify-between">
            <p className="text-slate-400 text-sm text-center md:text-left mb-4 md:mb-0">
              &copy; 2026 Kost Putra Rahmat ZAW. All rights reserved.
            </p>
            <div className="flex items-center gap-6">
              <a href="#" className="text-slate-400 hover:text-white transition-colors">
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                  <path fillRule="evenodd" d="M22 12c0-5.523-4.477-10-10-10S2 6.477 2 12c0 4.991 3.657 9.128 8.438 9.878v-6.987h-2.54V12h2.54V9.797c0-2.506 1.492-3.89 3.777-3.89 1.094 0 2.238.195 2.238.195v2.46h-1.26c-1.243 0-1.63.771-1.63 1.562V12h2.773l-.443 2.89h-2.33v6.988C18.343 21.128 22 16.991 22 12z" clipRule="evenodd" />
                </svg>
              </a>
              {/* Tambahkan ikon sosial lainnya di sini jika diperlukan */}
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
