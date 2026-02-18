import { useState, useEffect } from 'react';

import { RoomDetail } from '../room-detail/RoomDetail';
import { ContactUs } from './contact-us';

import { motion, AnimatePresence } from 'framer-motion';
import { Home, History, User, ImageIcon } from 'lucide-react';

// Modular Components & Hooks
import { Header } from './Header';
import { MobileSidebar } from './MobileSidebar';
import { HomeView } from './views/HomeView';
import { GalleryView } from './views/GalleryView';
import { HistoryView } from './views/HistoryView';
import { BookingView } from './views/BookingView';
import { ProfileView } from './views/ProfileView';
import { Footer } from './Footer';
import { useProfile } from './hooks/useProfile';
import { MenuItem } from './types';
import { useTranslations } from 'next-intl';

interface UserPlatformProps {
  onLogout?: () => void;
}

export function UserPlatform({ onLogout }: UserPlatformProps) {
  // -- Basic Dashboard State --
  const [activeView, setActiveView] = useState('home');
  const [selectedRoomId, setSelectedRoomId] = useState<string | null>(null);
  const [bookingDraft, setBookingDraft] = useState<{ moveInDate?: string; duration?: string; guests?: string } | undefined>(undefined);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [isMounted, setIsMounted] = useState(false);
  const [isClient, setIsClient] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  // -- Profile System Hook --
  const profileSystem = useProfile(isClient, isLoggedIn, activeView);
  const { userName } = profileSystem;

  // -- Lifecycle --
  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setIsMounted(() => true);
    setIsClient(() => true);
  }, []);

  useEffect(() => {
    if (!isClient) return;
    
    const initStorage = () => {
      const token = localStorage.getItem('token') || sessionStorage.getItem('token');
      const userStr = localStorage.getItem('user') || sessionStorage.getItem('user');
      setIsLoggedIn(!!token || !!userStr);

      const storedActiveView = localStorage.getItem('user_platform_active_view');
      if (storedActiveView) setActiveView(storedActiveView || 'home');

      const storedRoomId = localStorage.getItem('user_platform_selected_room_id');
      if (storedRoomId) setSelectedRoomId(storedRoomId);

      const storedMobileMenu = localStorage.getItem('user_platform_mobile_menu_open');
      if (storedMobileMenu) setMobileMenuOpen(storedMobileMenu === 'true');
    };

    initStorage();
  }, [isClient]);

  // Sync basic dashboard state to storage
  useEffect(() => {
    if (isClient) {
      localStorage.setItem('user_platform_active_view', activeView);
      localStorage.setItem('user_platform_mobile_menu_open', mobileMenuOpen.toString());
      if (selectedRoomId) {
        localStorage.setItem('user_platform_selected_room_id', selectedRoomId);
      } else {
        localStorage.removeItem('user_platform_selected_room_id');
      }
    }
  }, [activeView, mobileMenuOpen, selectedRoomId, isClient]);

  // -- Handlers --
  const navigateToRoomDetail = (roomId: string) => {
    setSelectedRoomId(roomId);
    setActiveView('room-detail');
  };

  const navigateToBooking = (roomId: string, initialData?: { moveInDate?: string; duration?: string; guests?: string }) => {
    setSelectedRoomId(roomId);
    setBookingDraft(initialData);
    setActiveView('booking');
  };

  // Nav Config
  const t = useTranslations('nav');

  const menuItems: MenuItem[] = [
    { id: 'home', label: t('home'), icon: Home },
    { id: 'gallery', label: t('gallery'), icon: ImageIcon },
    { id: 'history', label: t('ordersAndBills'), icon: History, hidden: !isLoggedIn },
    { id: 'profile', label: t('profile'), icon: User, hidden: !isLoggedIn },
  ];

  if (!isMounted) return null;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-slate-100 to-stone-50 dark:from-slate-950 dark:via-slate-900 dark:to-slate-950 font-['Poppins']">
      <Header
        activeView={activeView}
        setActiveView={setActiveView}
        isLoggedIn={isLoggedIn}
        onLogout={onLogout}
        menuItems={menuItems}
        mobileMenuOpen={mobileMenuOpen}
        setMobileMenuOpen={setMobileMenuOpen}
      />

      <MobileSidebar
        mobileMenuOpen={mobileMenuOpen}
        setMobileMenuOpen={setMobileMenuOpen}
        activeView={activeView}
        setActiveView={setActiveView}
        menuItems={menuItems}
        isLoggedIn={isLoggedIn}
        onLogout={onLogout}
      />

      <main className="relative min-h-[60vh]">
        <AnimatePresence>
          <motion.div
            key={activeView}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
          >
            {activeView === 'home' && (
              <HomeView
                userName={userName}
                isLoggedIn={isLoggedIn}
                onLogout={onLogout}
                setActiveView={setActiveView}
                navigateToRoomDetail={navigateToRoomDetail}
              />
            )}
            
            {activeView === 'gallery' && <GalleryView />}
            
            {activeView === 'contact' && <ContactUs />}

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
              <BookingView
                isLoggedIn={isLoggedIn}
                onLogout={onLogout}
                selectedRoomId={selectedRoomId}
                bookingDraft={bookingDraft}
                setActiveView={setActiveView}
              />
            )}

            {activeView === 'history' && (
              <HistoryView isLoggedIn={isLoggedIn} onLogout={onLogout} />
            )}

            {activeView === 'profile' && isLoggedIn && (
              <ProfileView
                isLoadingProfile={profileSystem.isLoadingProfile}
                isEditingProfile={profileSystem.isEditingProfile}
                setIsEditingProfile={profileSystem.setIsEditingProfile}
                userData={profileSystem.userData}
                editData={profileSystem.editData}
                setEditData={profileSystem.setEditData}
                handleSaveProfile={profileSystem.handleSaveProfile}
                handleCancelEdit={profileSystem.handleCancelEdit}
                handleFileChange={profileSystem.handleFileChange}
                previewUrl={profileSystem.previewUrl}
                isChangingPassword={profileSystem.isChangingPassword}
                setIsChangingPassword={profileSystem.setIsChangingPassword}
                handleChangePassword={profileSystem.handleChangePassword}
                passwordData={profileSystem.passwordData}
                setPasswordData={profileSystem.setPasswordData}
                passwordError={profileSystem.passwordError}
                setPasswordError={profileSystem.setPasswordError}
                isPasswordLoading={profileSystem.isPasswordLoading}
                onLogout={onLogout}
              />
            )}
          </motion.div>
        </AnimatePresence>
      </main>
      

      <Footer setActiveView={setActiveView} />
    </div>
  );
}
