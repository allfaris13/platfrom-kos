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

import { LayoutDashboard } from "lucide-react";
import { Button } from "@/app/components/ui/button";

interface UserPlatformProps {
  onLogout?: () => void;
  onBackToAdmin?: () => void;
  isLoggedIn?: boolean;
  isAdmin?: boolean;
}

export function UserPlatform({ onLogout, onBackToAdmin, isLoggedIn: initialIsLoggedIn = false, isAdmin: initialIsAdmin = false }: UserPlatformProps) {
  // -- Basic Dashboard State --
  const [activeView, setActiveView] = useState('home');
  const [selectedRoomId, setSelectedRoomId] = useState<string | null>(null);
  const [bookingDraft, setBookingDraft] = useState<{ moveInDate?: string; duration?: string; guests?: string } | undefined>(undefined);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [isMounted, setIsMounted] = useState(false);
  const [isClient, setIsClient] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(initialIsLoggedIn);
  const [isAdmin, setIsAdmin] = useState(initialIsAdmin);

  let effectiveIsLoggedIn = isLoggedIn;
  let effectiveIsAdmin = isAdmin;

  // Sync props to state if they change externally (e.g. from page.tsx passing down new values)
  if (initialIsLoggedIn !== isLoggedIn) {
    setIsLoggedIn(initialIsLoggedIn);
    effectiveIsLoggedIn = initialIsLoggedIn;
  }
  if (initialIsAdmin !== isAdmin) {
    setIsAdmin(initialIsAdmin);
    effectiveIsAdmin = initialIsAdmin;
  }

  // -- Profile System Hook --
  const profileSystem = useProfile(isClient, effectiveIsLoggedIn, activeView);
  const { userName } = profileSystem;

  // -- Lifecycle --
  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setIsMounted(true);
    setIsClient(true);
    
    // We strictly trust the props passed down from page.tsx for auth.
    // We only use localStorage as a fallback string for the username display before profile loads.

    // Restore view state if available
    const storedActiveView = localStorage.getItem('user_platform_active_view');
    if (storedActiveView) {
        setActiveView(storedActiveView);
    } else {
        setActiveView('home'); // Explicitly set default
    }

    const storedRoomId = localStorage.getItem('user_platform_selected_room_id');
    if (storedRoomId) setSelectedRoomId(storedRoomId);

    const storedMobileMenu = localStorage.getItem('user_platform_mobile_menu_open');
    if (storedMobileMenu) setMobileMenuOpen(storedMobileMenu === 'true');
  }, []);

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

      {/* Admin Floating Button */}
      {effectiveIsAdmin && onBackToAdmin && (
        <motion.div
           initial={{ opacity: 0, scale: 0.8 }}
           animate={{ opacity: 1, scale: 1 }}
           className="fixed bottom-6 right-6 z-50"
        >
          <Button
            onClick={onBackToAdmin}
            className="bg-slate-900 dark:bg-slate-100 text-white dark:text-slate-900 hover:bg-slate-800 dark:hover:bg-slate-200 shadow-2xl rounded-full px-6 py-6 h-auto text-sm font-bold flex items-center gap-2 border-2 border-white dark:border-slate-800"
          >
            <LayoutDashboard className="w-5 h-5" />
            <span className="hidden md:inline">Dashboard Admin</span>
            <span className="md:hidden">Admin</span>
          </Button>
        </motion.div>
      )}

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
