import { useState, useEffect } from 'react';
import { api } from '@/app/services/api';
import { toast } from 'sonner';
import { getImageUrl } from "@/app/utils/api-url";
import { ProfileData, BookingItem, UserData } from '../types';

export function useProfile(isClient: boolean, isLoggedIn: boolean, activeView: string) {
  const [isLoadingProfile, setIsLoadingProfile] = useState(false);
  const [isEditingProfile, setIsEditingProfile] = useState(false);
  const [userName, setUserName] = useState('');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);

  // Profile & Password States
  const [isChangingPassword, setIsChangingPassword] = useState(false);
  const [passwordData, setPasswordData] = useState({
    oldPassword: '',
    newPassword: '',
    confirmPassword: '',
  });
  const [passwordError, setPasswordError] = useState('');
  const [isPasswordLoading, setIsPasswordLoading] = useState(false);

  const [userData, setUserData] = useState<UserData>({
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
    roomNumber: '-',
    isGoogleUser: false,
    profileImage: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w0NzIyNDZ8MHwxfHNlYXJjaHwxfHx1c2VyJTIwYXZhdGFyfGVufDB8fHx8fDE3MDAwMDAwMDB|&ixlib=rb-4.0.3&q=80&w=400',
  });

  const [editData, setEditData] = useState<UserData>(userData);

  // Load state from storage
  useEffect(() => {
    if (isClient) {
      const storedEditing = localStorage.getItem('user_platform_is_editing_profile');
      if (storedEditing) setIsEditingProfile(storedEditing === 'true');

      const userStr = localStorage.getItem('user') || sessionStorage.getItem('user');
      if (userStr) {
        try {
          const userObj = JSON.parse(userStr);
          const initialName = userObj.username || userObj.name || 'User';
          setUserName(initialName);
          setUserData(prev => ({ ...prev, name: initialName }));
        } catch (e) {
          console.error("Error parsing user from storage in hook", e);
        }
      }
    }
  }, [isClient]);

  // Sync editing state to storage
  useEffect(() => {
    if (isClient) {
      localStorage.setItem('user_platform_is_editing_profile', isEditingProfile.toString());
    }
  }, [isEditingProfile, isClient]);

  // Fetch profile when needed
  useEffect(() => {
    if (isClient && isLoggedIn && activeView === 'profile') {
      fetchProfile();
    }
  }, [isClient, isLoggedIn, activeView]);

  useEffect(() => {
    if (!isEditingProfile) {
      setEditData(userData);
    }
  }, [userData, isEditingProfile]);

  const fetchProfile = async () => {
    setIsLoadingProfile(true);
    try {
      const data = (await api.getProfile()) as unknown as ProfileData;
      let bookingsCount = 0;
      let totalSpent = 0;
      let currentRoomNumber = '-';

      try {
        const bookingsData = (await api.getMyBookings()) as unknown as BookingItem[];
        bookingsCount = bookingsData.length;
        totalSpent = bookingsData.reduce((sum: number, b: BookingItem) => sum + (b.total_bayar || 0), 0);

        const activeBooking = bookingsData.find((b: BookingItem) => b.status_pemesanan === 'Active') 
                           || bookingsData.find((b: BookingItem) => b.status_pemesanan === 'Confirmed')
                           || bookingsData.find((b: BookingItem) => b.status_pemesanan === 'Pending');

        if (activeBooking && activeBooking.kamar) {
            currentRoomNumber = activeBooking.kamar.nomor_kamar;
        }
      } catch (err) {
        console.error("Failed to fetch bookings details for profile", err);
      }

      const finalUserData = {
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
        roomNumber: currentRoomNumber,
        isGoogleUser: data.is_google_user,
        profileImage: data.penyewa?.foto_profil
          ? getImageUrl(data.penyewa.foto_profil)
          : 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w0NzIyNDZ8MHwxfHNlYXJjaHwxfHx1c2VyJTIwYXZhdGFyfGVufDB8fHx8fDE3MDAwMDAwMDB|&ixlib=rb-4.0.3&q=80&w=400',
      };

      setUserData(finalUserData);
      setUserName(finalUserData.name);
    } catch (e) {
      console.error("Failed to fetch profile", e);
    } finally {
      setIsLoadingProfile(false);
    }
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

      const res = (await api.updateProfile(formData)) as unknown as ProfileData;

      const updatedProfileImage = res.penyewa?.foto_profil
          ? getImageUrl(res.penyewa.foto_profil)
          : editData.profileImage;

      setUserData({
        ...editData,
        profileImage: updatedProfileImage
      });
      setIsEditingProfile(false);
      setSelectedFile(null);
      setPreviewUrl(null);
      toast.success("Profil berhasil diperbarui!");
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
      const msg = (err instanceof Error ? err.message : null) || 'Gagal mengganti password';
      setPasswordError(msg);
      toast.error(msg);
    } finally {
      setIsPasswordLoading(false);
    }
  };

  return {
    userData,
    editData,
    setEditData,
    isLoadingProfile,
    isEditingProfile,
    setIsEditingProfile,
    userName,
    setUserName,
    selectedFile,
    previewUrl,
    isChangingPassword,
    setIsChangingPassword,
    passwordData,
    setPasswordData,
    passwordError,
    setPasswordError,
    isPasswordLoading,
    fetchProfile,
    handleSaveProfile,
    handleCancelEdit,
    handleFileChange,
    handleChangePassword
  };
}
