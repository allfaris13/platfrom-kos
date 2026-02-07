import { useState, useEffect, useMemo } from 'react';
import useSWR, { mutate } from 'swr';
import { Homepage } from './homepage';
import { RoomDetail } from './RoomDetail';
import { BookingFlow } from './booking-flow';
import { BookingHistory } from './booking-history';
import { ContactUs } from './contact-us';
import { Gallery } from './Gallery';
import { SmartCalendar } from './SmartCalendar';
import { motion } from 'framer-motion';
import { Home, History, User, Menu, LogOut, Mail, Phone, MapPin, CreditCard, X, XCircle, MessageCircle, Heart, Star, Image, Calendar as CalendarIcon } from 'lucide-react';
import { Button } from '@/app/components/ui/button';
import { Input } from '@/app/components/ui/input';
import { Label } from '@/app/components/ui/label';
import { Card } from '@/app/components/ui/card';
import { Badge } from '@/app/components/ui/badge';
import { ThemeToggleButton } from '@/app/components/ui/ThemeToggleButton';
import { ImageWithFallback } from '@/app/components/shared/ImageWithFallback';
import { api } from '@/app/services/api';
import { LogIn } from 'lucide-react';

interface UserPlatformProps {
  onLogout?: () => void;
}

export function UserPlatform({ onLogout }: UserPlatformProps) {
  // Initialize with server-safe defaults
  const [activeView, setActiveView] = useState('home');
  const [selectedRoomId, setSelectedRoomId] = useState<string | null>(null);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [isEditingProfile, setIsEditingProfile] = useState(false);
  const [wishlist, setWishlist] = useState<string[]>([]);
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

  useEffect(() => {
    const init = () => {
      setIsClient(true);
      const storedActiveView = localStorage.getItem('user_platform_active_view');
      if (storedActiveView) setActiveView(storedActiveView);

      const storedRoomId = localStorage.getItem('user_platform_selected_room_id');
      if (storedRoomId) setSelectedRoomId(storedRoomId);

      const storedMobileMenu = localStorage.getItem('user_platform_mobile_menu_open');
      if (storedMobileMenu) setMobileMenuOpen(storedMobileMenu === 'true');

      const storedEditing = localStorage.getItem('user_platform_is_editing_profile');
      if (storedEditing) setIsEditingProfile(storedEditing === 'true');

      const storedWishlist = localStorage.getItem('user_platform_wishlist');
      if (storedWishlist) {
          try {
              const parsed = JSON.parse(storedWishlist);
              if (Array.isArray(parsed)) {
                setWishlist(parsed);
              }
          } catch (e) {
              console.warn("Corrupted wishlist found, clearing...", e);
              localStorage.removeItem('user_platform_wishlist');
          }
      }

      const token = localStorage.getItem('token');
      setIsLoggedIn(!!token);
    };
    
    const timer = setTimeout(init, 0);
    return () => clearTimeout(timer);
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
    localStorage.setItem('user_platform_wishlist', JSON.stringify(wishlist));
  }, [wishlist, isClient]);

  // --- SWR Data Fetching ---
  const { data: profileData, isLoading: isLoadingProfile } = useSWR(
    isClient && isLoggedIn && activeView === 'profile' ? 'api/profile' : null,
    api.getProfile
  );

  const { data: bookingsData } = useSWR(
    isClient && isLoggedIn && activeView === 'profile' ? 'api/my-bookings' : null,
    api.getMyBookings
  );

  const userData = useMemo(() => {
    if (!profileData) {
      return {
        name: 'Guest', email: 'N/A', phone: 'N/A', address: 'N/A', nik: '', jenisKelamin: '',
        joinDate: 'N/A', status: 'Inactive', totalBookings: 0, totalSpent: 0,
        profileImage: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?q=80&w=400',
      };
    }

    const bCount = bookingsData?.length || 0;
    const bSpent = bookingsData?.reduce((sum: number, b: { total_bayar?: number }) => sum + (b.total_bayar || 0), 0) || 0;

    return {
      name: profileData.penyewa?.nama_lengkap || profileData.user?.username || 'Guest',
      email: profileData.user?.email || 'N/A', 
      phone: profileData.penyewa?.nomor_hp || 'N/A',
      address: profileData.penyewa?.alamat_asal || 'N/A',
      nik: profileData.penyewa?.nik || '',
      jenisKelamin: profileData.penyewa?.jenis_kelamin || '',
      joinDate: profileData.user?.created_at ? new Date(profileData.user.created_at).toLocaleDateString('en-US', { month: 'long', year: 'numeric' }) : 'N/A',
      status: 'Active',
      totalBookings: bCount,
      totalSpent: bSpent,
      profileImage: profileData.penyewa?.foto_profil 
          ? (profileData.penyewa.foto_profil.startsWith('http') ? profileData.penyewa.foto_profil : `http://localhost:8080${profileData.penyewa.foto_profil}`)
          : 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?q=80&w=400',
    };
  }, [profileData, bookingsData]);

  const [editData, setEditData] = useState(userData);

  // Sync editData when userData changes, but only if not currently editing
  useEffect(() => {
    if (!isEditingProfile) {
      setEditData(userData);
    }
  }, [userData, isEditingProfile]);

  const toggleWishlist = (roomId: string) => {
    setWishlist(prev => 
      prev.includes(roomId)
        ? prev.filter(id => id !== roomId)
        : [...prev, roomId]
    );
  };
  const navigateToRoomDetail = (roomId: string) => {
    setSelectedRoomId(roomId);
    setActiveView('room-detail');
  };

  const navigateToBooking = (roomId: string) => {
    setSelectedRoomId(roomId);
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

      await api.updateProfile(formData);
      mutate('api/profile');
      
      setIsEditingProfile(false);
      setSelectedFile(null);
      setPreviewUrl(null);
      alert("Profile updated successfully!");
    } catch (e) {
      console.error("Failed to update profile", e);
      alert("Failed to update profile. Please try again.");
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
      setPasswordError('New passwords do not match');
      return;
    }

    if (passwordData.newPassword.length < 6) {
      setPasswordError('Password must be at least 6 characters');
      return;
    }

    setIsPasswordLoading(true);
    try {
      await api.changePassword({
        old_password: passwordData.oldPassword,
        new_password: passwordData.newPassword,
      });
      alert('Password updated successfully!');
      setIsChangingPassword(false);
      setPasswordData({ oldPassword: '', newPassword: '', confirmPassword: '' });
    } catch (err: unknown) {
      if (err instanceof Error) {
        setPasswordError(err.message);
      } else {
        setPasswordError('Failed to change password');
      }
    } finally {
      setIsPasswordLoading(false);
    }
  };

  const menuItems = [
    { id: 'home', label: 'Home', icon: Home },
    { id: 'gallery', label: 'Galery Koskosan', icon: Image },
    { id: 'calendar', label: 'Smart Calendar', icon: CalendarIcon, hidden: !isLoggedIn },
    { id: 'history', label: 'My Bookings', icon: History, hidden: !isLoggedIn },
    { id: 'profile', label: 'Profile', icon: User, hidden: !isLoggedIn },
  ];

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
                    className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium text-sm transition-all duration-200 ${
                      activeView === item.id
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
                  onClick={onLogout}
                  className="flex items-center gap-2 px-4 py-2 rounded-lg font-medium text-sm bg-stone-900 text-white hover:bg-stone-800 transition-all duration-200 ml-2 shadow-lg"
                >
                  <LogIn className="w-4 h-4" />
                  <span>Login</span>
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
                <span>Contact Us</span>
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

          {/* Mobile Navigation */}
          {mobileMenuOpen && (
            <div className="md:hidden py-4 border-t border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900">
              <nav className="space-y-2">
                {menuItems.filter(item => !item.hidden).map((item) => {
                  const Icon = item.icon;
                  return (
                    <button
                      key={item.id}
                      onClick={() => {
                        setActiveView(item.id);
                        setMobileMenuOpen(false);
                      }}
                      className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg font-medium transition-all ${
                        activeView === item.id
                          ? 'bg-gradient-to-r from-stone-700 to-stone-900 text-white'
                          : 'text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
                      }`}
                    >
                      <Icon className="w-4 h-4" />
                      <span className="text-sm">{item.label}</span>
                    </button>
                  );
                })}
                
                {!isLoggedIn && (
                  <button
                    onClick={onLogout}
                    className="w-full flex items-center gap-3 px-4 py-3 rounded-lg font-medium text-sm bg-stone-900 text-white hover:bg-stone-800 transition-all shadow-lg"
                  >
                    <LogIn className="w-4 h-4" />
                    <span>Login</span>
                  </button>
                )}
                
                {/* Contact Button - Mobile */}
                <button
                  onClick={() => {
                    setActiveView('contact');
                    setMobileMenuOpen(false);
                  }}
                  className="w-full flex items-center gap-3 px-4 py-3 rounded-lg font-medium text-sm bg-blue-50 dark:bg-blue-950 text-blue-700 dark:text-blue-300 hover:bg-blue-100 dark:hover:bg-blue-900 transition-all"
                >
                  <MessageCircle className="w-4 h-4" />
                  <span>Contact Us</span>
                </button>
              </nav>
            </div>
          )}
        </div>
      </header>

      <main>
        {activeView === 'home' && (
          <Homepage 
            onRoomClick={navigateToRoomDetail} 
            wishlist={wishlist} 
            onToggleWishlist={toggleWishlist}
            isLoggedIn={isLoggedIn}
            onLoginPrompt={onLogout}
          />
        )}
        {activeView === 'gallery' && <Gallery />}
        {activeView === 'calendar' && isLoggedIn && <SmartCalendar />}
        {activeView === 'contact' && <ContactUs />}
        
        {/* Protected Views with Guest Teasers */}
        {activeView === 'wishlist' && (
          !isLoggedIn ? (
            <div className="max-w-4xl mx-auto px-4 py-20 text-center">
              <div className="bg-white dark:bg-slate-900 p-12 rounded-3xl shadow-2xl border border-slate-100 dark:border-slate-800">
                <Heart className="w-20 h-20 text-amber-500 mx-auto mb-6 opacity-20" />
                <h2 className="text-4xl font-bold text-slate-900 dark:text-white mb-4">Simpan Kamar Favoritmu</h2>
                <p className="text-slate-600 dark:text-slate-400 mb-8 text-lg max-w-md mx-auto">Login untuk mulai menyimpan kamar-kamar premium yang kamu sukai ke dalam wishlist personalmu.</p>
                <Button onClick={onLogout} className="bg-stone-900 hover:bg-stone-800 text-white px-10 py-6 text-lg rounded-xl font-bold shadow-xl shadow-stone-900/20">Login Sekarang</Button>
              </div>
            </div>
          ) : (
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
              {/* Wishlist Header */}
              <div className="mb-12">
                <h1 className="text-4xl font-bold text-slate-900 mb-4">My Wishlist</h1>
                <p className="text-slate-600 text-lg">Room yang Anda sukai ({wishlist.length} items)</p>
              </div>

              {wishlist.length === 0 ? (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="text-center py-16"
                >
                  <Heart className="w-16 h-16 text-slate-300 mx-auto mb-4" />
                  <h2 className="text-2xl font-bold text-slate-700 mb-2">No Wishlist Items Yet</h2>
                  <p className="text-slate-500 mb-6">Tambahkan room favorit Anda ke wishlist</p>
                  <Button
                    onClick={() => setActiveView('home')}
                    className="bg-stone-700 hover:bg-stone-800 text-white px-6 py-2 rounded-lg"
                  >
                    Explore Rooms
                  </Button>
                </motion.div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {[
                    { id: '1', name: 'Luxury Penthouse', price: 2500, image: 'https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxsdXh1cnklMjBwZW50aG91c2V8ZW58MHx8fHwxNzY4NTI4NDI3fDA&ixlib=rb-4.0.3&q=80&w=500', rating: 4.9 },
                    { id: '2', name: 'Modern Studio', price: 800, image: 'https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxtb2Rlcm4lMjBzdHVkaW98ZW58MHx8fHwxNzY4NTI4NDI3fDA&ixlib=rb-4.0.3&q=80&w=500', rating: 4.7 },
                    { id: '3', name: 'Cozy Apartment', price: 1200, image: 'https://images.unsplash.com/photo-1494145904049-0dca59b4bbad?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxjb3p5JTIwYXBhcnRtZW50fGVufDB8fHx8MTc2ODUyODQyN3ww&ixlib=rb-4.0.3&q=80&w=500', rating: 4.8 },
                  ].filter(room => wishlist.includes(room.id)).map((room) => (
                    <motion.div
                      key={room.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="bg-white rounded-xl shadow-lg hover:shadow-xl transition-all overflow-hidden"
                    >
                      <div className="relative h-48 overflow-hidden">
                        <ImageWithFallback src={room.image} alt={room.name} className="w-full h-full object-cover" />
                        <button
                          onClick={() => toggleWishlist(room.id)}
                          className="absolute top-4 right-4 bg-white rounded-full p-2 hover:bg-red-50 transition-all shadow-lg"
                        >
                          <Heart className="w-5 h-5 text-red-500 fill-red-500" />
                        </button>
                      </div>
                      <div className="p-6">
                        <h3 className="text-lg font-bold text-slate-900 mb-2">{room.name}</h3>
                        <div className="flex items-center gap-2 mb-4">
                          <Star className="w-4 h-4 fill-amber-400 text-amber-400" />
                          <span className="text-sm font-semibold text-slate-700">{room.rating}</span>
                        </div>
                        <p className="text-2xl font-bold text-stone-700 mb-4">${room.price}/mo</p>
                        <Button
                          onClick={() => navigateToRoomDetail(room.id)}
                          className="w-full bg-stone-700 hover:bg-stone-800 text-white py-2 rounded-lg"
                        >
                          View Details
                        </Button>
                      </div>
                    </motion.div>
                  ))}
                </div>
              )}
            </div>
          )
        )}

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
                <h2 className="text-4xl font-bold text-slate-900 dark:text-white mb-4">Ready to Move In?</h2>
                <p className="text-slate-600 dark:text-slate-400 mb-8 text-lg max-w-md mx-auto">Silakan login terlebih dahulu untuk melakukan pemesanan kamar premium ini secara aman.</p>
                <Button onClick={onLogout} className="bg-stone-900 hover:bg-stone-800 text-white px-10 py-6 text-lg rounded-xl font-bold shadow-xl shadow-stone-900/20">Login to Book</Button>
              </div>
            </div>
          ) : (
            <BookingFlow roomId={selectedRoomId} onBack={() => setActiveView('room-detail')} />
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

        {activeView === 'profile' && isLoggedIn && isLoadingProfile && (
          <div className="flex items-center justify-center min-h-[400px]">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-stone-900"></div>
          </div>
        )}
        {activeView === 'profile' && !isLoadingProfile && (
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
            {/* Profile Header */}
            <Card className="mb-10 p-8 bg-gradient-to-r from-stone-900 via-stone-800 to-slate-900 text-white border-0 shadow-2xl">
              <div className="flex flex-col md:flex-row items-start md:items-center gap-8">
                {/* Avatar */}
                <div className="relative">
                  <ImageWithFallback
                    src={userData.profileImage}
                    alt={userData.name}
                    className="w-32 h-32 rounded-full object-cover border-4 border-white shadow-xl"
                  />
                  <div className="absolute bottom-0 right-0 bg-emerald-400 w-8 h-8 rounded-full border-4 border-white shadow-lg flex items-center justify-center">
                    <span className="text-sm">✓</span>
                  </div>
                </div>

                {/* User Info */}
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-3">
                    <h1 className="text-4xl font-bold text-white">{userData.name}</h1>
                    <Badge className="bg-emerald-400 text-emerald-900 font-bold px-4 py-1">{userData.status}</Badge>
                  </div>
                  <p className="text-stone-200 mb-6 text-lg">{userData.email}</p>
                  
                  <div className="grid grid-cols-3 gap-6">
                    <div className="bg-white/10 backdrop-blur-sm p-4 rounded-lg border border-white/20">
                      <p className="text-stone-200 text-sm font-semibold mb-2">Number Room</p>
                      <p className="text-3xl font-bold text-white">{userData.totalBookings}</p>
                    </div>
                    <div className="bg-white/10 backdrop-blur-sm p-4 rounded-lg border border-white/20">
                      <p className="text-stone-200 text-sm font-semibold mb-2">Total</p>
                      <p className="text-3xl font-bold text-white">Rp {userData.totalSpent.toLocaleString()}</p>
                    </div>
                    <div className="bg-white/10 backdrop-blur-sm p-4 rounded-lg border border-white/20">
                      <p className="text-stone-200 text-sm font-semibold mb-2">Member Since</p>
                      <p className="text-xl font-bold text-white">{userData.joinDate}</p>
                    </div>
                  </div>
                </div>

                {/* Edit Button */}
                {!isEditingProfile && (
                  <Button 
                    onClick={() => setIsEditingProfile(true)}
                    className="bg-white text-stone-900 hover:bg-stone-100 font-bold px-6 py-2 shadow-lg"
                  >
                    Edit Profile
                  </Button>
                )}
              </div>
            </Card>

            {/* Edit Profile Modal */}
            {isEditingProfile && (
              <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
                <Card className="w-full max-w-2xl max-h-[90vh] overflow-y-auto bg-white shadow-2xl border-0">
                  <div className="p-8">
                    <div className="flex items-center justify-between mb-8">
                      <div>
                        <h2 className="text-3xl font-bold text-slate-900">Edit Profile</h2>
                        <p className="text-slate-600 mt-1">Update your personal information</p>
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
                            <span className="text-white text-xs font-bold">Change</span>
                            <input 
                              type="file" 
                              className="hidden" 
                              accept="image/*"
                              onChange={handleFileChange}
                            />
                          </label>
                        </div>
                        <p className="text-xs text-slate-500 mt-2">Click image to change photo</p>
                      </div>

                      <div>
                        <Label className="text-slate-900 font-semibold mb-3 block">Full Name</Label>
                        <Input
                          value={editData.name}
                          onChange={(e) => setEditData({ ...editData, name: e.target.value })}
                          className="border-slate-300 bg-slate-50 focus:bg-white focus:border-stone-900 text-lg py-2"
                          placeholder="Enter your full name"
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
                          <Label className="text-slate-900 font-semibold mb-3 block">Gender</Label>
                          <select
                            value={editData.jenisKelamin}
                            onChange={(e) => setEditData({ ...editData, jenisKelamin: e.target.value })}
                            className="w-full border border-slate-300 rounded-md bg-slate-50 focus:bg-white focus:border-stone-900 text-lg py-2 px-3"
                          >
                            <option value="">Select Gender</option>
                            <option value="Laki-laki">Laki-laki</option>
                            <option value="Perempuan">Perempuan</option>
                          </select>
                        </div>
                      </div>

                      <div>
                        <Label className="text-slate-900 font-semibold mb-3 block">Phone Number</Label>
                        <Input
                          value={editData.phone}
                          onChange={(e) => setEditData({ ...editData, phone: e.target.value })}
                          className="border-slate-300 bg-slate-50 focus:bg-white focus:border-stone-900 text-lg py-2"
                          placeholder="+1 (555) 123-4567"
                        />
                      </div>

                      <div>
                        <Label className="text-slate-900 font-semibold mb-3 block">Address</Label>
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
                          Save Changes
                        </Button>
                        <Button 
                          onClick={handleCancelEdit}
                          variant="outline"
                          className="flex-1 border-2 border-slate-300 hover:bg-slate-50 font-bold py-3"
                        >
                          Cancel
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
                        <h2 className="text-2xl font-bold text-slate-900">Change Password</h2>
                        <p className="text-slate-500 text-sm mt-1">Ensure your account stays secure</p>
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
                        <Label className="text-sm font-semibold text-slate-700">Current Password</Label>
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
                        <Label className="text-sm font-semibold text-slate-700">New Password</Label>
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
                        <Label className="text-sm font-semibold text-slate-700">Confirm New Password</Label>
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
                          {isPasswordLoading ? 'Updating...' : 'Update Password'}
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
                          Cancel
                        </Button>
                      </div>
                    </form>
                  </div>
                </Card>
              </div>
            )}

            {/* Profile Details */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {/* Personal Information */}
              <Card className="p-8 bg-white/80 backdrop-blur-sm border-slate-200/60 hover:shadow-lg transition-all">
                <div className="flex items-center gap-3 mb-7">
                  <div className="w-10 h-10 bg-gradient-to-br from-stone-700 to-stone-900 rounded-lg flex items-center justify-center">
                    <Mail className="w-5 h-5 text-white" />
                  </div>
                  <h2 className="text-2xl font-bold text-slate-900">Personal Information</h2>
                </div>
                
                <div className="space-y-6">
                  <div className="pb-4 border-b border-slate-200">
                    <label className="text-sm text-slate-600 font-semibold uppercase tracking-wide">Full Name</label>
                    <p className="text-slate-900 mt-2 text-lg font-semibold">{userData.name}</p>
                  </div>
                  
                  <div className="pb-4 border-b border-slate-200">
                    <label className="text-sm text-slate-600 font-semibold uppercase tracking-wide mb-2 flex items-center gap-2">
                      <Mail className="w-4 h-4 text-stone-700" />
                      Email Address
                    </label>
                    <p className="text-slate-900 mt-2 text-lg font-semibold">{userData.email}</p>
                  </div>

                  <div className="pb-4 border-b border-slate-200">
                    <label className="text-sm text-slate-600 font-semibold uppercase tracking-wide mb-2 flex items-center gap-2">
                      <Phone className="w-4 h-4 text-stone-700" />
                      Phone Number
                    </label>
                    <p className="text-slate-900 mt-2 text-lg font-semibold">{userData.phone}</p>
                  </div>

                  <div>
                    <label className="text-sm text-slate-600 font-semibold uppercase tracking-wide mb-2 flex items-center gap-2">
                      <MapPin className="w-4 h-4 text-stone-700" />
                      Address
                    </label>
                    <p className="text-slate-900 mt-2 text-lg font-semibold">{userData.address}</p>
                  </div>
                </div>
              </Card>

              {/* Account & Preferences */}
              <Card className="p-8 bg-white/80 backdrop-blur-sm border-slate-200/60 hover:shadow-lg transition-all">
                <div className="flex items-center gap-3 mb-7">
                  <div className="w-10 h-10 bg-gradient-to-br from-blue-600 to-blue-700 rounded-lg flex items-center justify-center">
                    <CreditCard className="w-5 h-5 text-white" />
                  </div>
                  <h2 className="text-2xl font-bold text-slate-900">Account & Settings</h2>
                </div>
                
                <div className="space-y-6">
                  <div className="pb-4 border-b border-slate-200">
                    <label className="text-sm text-slate-600 font-semibold uppercase tracking-wide">Member Since</label>
                    <p className="text-slate-900 mt-2 text-lg font-semibold">{userData.joinDate}</p>
                  </div>

                  <div className="pb-4 border-b border-slate-200">
                    <label className="text-sm text-slate-600 font-semibold uppercase tracking-wide">Account Status</label>
                    <div className="mt-2 flex items-center gap-3">
                      <div className="w-3 h-3 bg-emerald-400 rounded-full shadow-md" />
                      <p className="text-slate-900 text-lg font-semibold">{userData.status}</p>
                    </div>
                  </div>

                  <div className="pb-4 border-b border-slate-200">
                    <label className="text-sm text-slate-600 font-semibold uppercase tracking-wide">Verification</label>
                    <Badge className="mt-2 bg-emerald-100 text-emerald-800 font-bold px-3 py-1">✓ Email Verified</Badge>
                  </div>

                  <div className="pt-2">
                    <Button 
                      onClick={() => setIsChangingPassword(true)}
                      variant="outline" 
                      className="w-full font-semibold border-2 border-slate-300 hover:bg-slate-50 py-2"
                    >
                      Change Password
                    </Button>
                  </div>
                </div>
              </Card>
            </div>

            {/* Danger Zone */}
            <Card className="mt-10 p-8 border-red-200 bg-gradient-to-br from-red-50 to-rose-50 hover:shadow-lg transition-all">
              <div className="flex items-center gap-3 mb-4">
                <XCircle className="w-6 h-6 text-red-600" />
                <h2 className="text-2xl font-bold text-red-900">Danger Zone</h2>
              </div>
              <p className="text-sm text-red-700 mb-8 leading-relaxed">
                These actions are irreversible. Please carefully review before proceeding.
              </p>
              <div className="space-y-4">
                <div className="flex gap-4 flex-col sm:flex-row">
                  <Button 
                    variant="outline" 
                    className="flex-1 border-2 border-red-300 text-red-700 hover:bg-red-100 font-semibold py-2"
                  >
                    Deactivate
                  </Button>
                  <Button 
                    variant="outline" 
                    className="flex-1 border-2 border-red-300 text-red-700 hover:bg-red-100 font-semibold py-2"
                  >
                    Delete Account
                  </Button>
                </div>
                
                {/* Logout Button */}
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
                  className="w-full bg-orange-600 hover:bg-orange-700 text-white font-bold py-3 shadow-lg hover:shadow-xl transition-all"
                >
                  <LogOut className="w-5 h-5 mr-2" />
                  Logout
                </Button>
              </div>
            </Card>
          </div>
        )}
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

            {/* Quick Links */}
            <div>
              <h4 className="font-semibold mb-4 text-white uppercase tracking-wide text-sm">Quick Links</h4>
              <ul className="space-y-3 text-sm">
                <li><button onClick={() => setActiveView('home')} className="text-slate-400 hover:text-white transition-colors">Home</button></li>
                <li><button onClick={() => setActiveView('gallery')} className="text-slate-400 hover:text-white transition-colors">Gallery</button></li>
                <li><button onClick={() => setActiveView('contact')} className="text-slate-400 hover:text-white transition-colors">Contact</button></li>
                <li><a href="#" className="text-slate-400 hover:text-white transition-colors">FAQ</a></li>
              </ul>
            </div>

            {/* Legal */}
            <div>
              <h4 className="font-semibold mb-4 text-white uppercase tracking-wide text-sm">Legal</h4>
              <ul className="space-y-3 text-sm">
                <li><a href="#" className="text-slate-400 hover:text-white transition-colors">Privacy Policy</a></li>
                <li><a href="#" className="text-slate-400 hover:text-white transition-colors">Terms of Service</a></li>
              </ul>
            </div>

            {/* Contact Info */}
            <div>
              <h4 className="font-semibold mb-4 text-white uppercase tracking-wide text-sm">Contact</h4>
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