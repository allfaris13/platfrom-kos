import { motion, AnimatePresence } from 'framer-motion';
import { Mail, Phone, MapPin, CreditCard, LogOut, X, XCircle, Loader2 } from 'lucide-react';
import { Button } from '@/app/components/ui/button';
import { Input } from '@/app/components/ui/input';
import { Label } from '@/app/components/ui/label';
import { Card } from "@/app/components/ui/card";
import { Badge } from '@/app/components/ui/badge';
import { ImageWithFallback } from '@/app/components/shared/ImageWithFallback';
import { UserData } from '../types';
import { useTranslations } from 'next-intl';

interface ProfileViewProps {
  isLoadingProfile: boolean;
  isEditingProfile: boolean;
  setIsEditingProfile: (val: boolean) => void;
  userData: UserData;
  editData: UserData;
  setEditData: (data: UserData) => void;
  handleSaveProfile: () => void;
  handleCancelEdit: () => void;
  handleFileChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  previewUrl: string | null;
  isChangingPassword: boolean;
  setIsChangingPassword: (val: boolean) => void;
  handleChangePassword: (e: React.FormEvent) => void;
  passwordData: { oldPassword: string; newPassword: string; confirmPassword: string };
  setPasswordData: (data: { oldPassword: string; newPassword: string; confirmPassword: string }) => void;
  passwordError: string;
  setPasswordError: (err: string) => void;
  isPasswordLoading: boolean;
  onLogout?: () => void;
}

export function ProfileView({
  isLoadingProfile,
  isEditingProfile,
  setIsEditingProfile,
  userData,
  editData,
  setEditData,
  handleSaveProfile,
  handleCancelEdit,
  handleFileChange,
  previewUrl,
  isChangingPassword,
  setIsChangingPassword,
  handleChangePassword,
  passwordData,
  setPasswordData,
  passwordError,
  setPasswordError,
  isPasswordLoading,
  onLogout
}: ProfileViewProps) {
  const t = useTranslations('profile');

  return (
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
            <p className="text-sm font-medium">{t('loadingProfile')}</p>
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
              <div className="flex flex-col md:flex-row items-center gap-6 mb-8">
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

                <div className="flex-1 text-center md:text-left">
                  <div className="flex flex-col md:flex-row items-center gap-3 mb-2">
                    <h1 className="text-2xl md:text-3xl font-bold text-white tracking-tight">{userData.name}</h1>
                    <Badge className="bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 px-3 py-0.5 text-xs font-semibold tracking-wide uppercase">{userData.status}</Badge>
                  </div>
                  <p className="text-stone-300 text-sm md:text-base font-medium opacity-90">{userData.email}</p>
                </div>

                {!isEditingProfile && (
                  <div className="mt-4 md:mt-0 md:ml-auto">
                    <Button
                      onClick={() => setIsEditingProfile(true)}
                      size="sm"
                      className="bg-white/10 hover:bg-white/20 text-white border border-white/20 font-semibold px-6 shadow-lg backdrop-blur-sm transition-all"
                    >
                      {t('editProfile')}
                    </Button>
                  </div>
                )}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 border-t border-white/10 pt-6">
                <div className="bg-white/5 p-4 rounded-xl border border-white/5 backdrop-blur-sm flex flex-col items-center md:items-start transition-colors hover:bg-white/10">
                  <p className="text-stone-400 text-xs font-bold uppercase tracking-widest mb-1">{t('roomNumber')}</p>
                  <p className="text-2xl font-bold text-white tracking-tight leading-none">{userData.roomNumber}</p>
                </div>
                <div className="bg-white/5 p-4 rounded-xl border border-white/5 backdrop-blur-sm flex flex-col items-center md:items-start transition-colors hover:bg-white/10">
                  <p className="text-stone-400 text-xs font-bold uppercase tracking-widest mb-1">{t('totalSpent')}</p>
                  <p className="text-2xl font-bold text-white tracking-tight leading-none">Rp {userData.totalSpent.toLocaleString()}</p>
                </div>
                <div className="bg-white/5 p-4 rounded-xl border border-white/5 backdrop-blur-sm flex flex-col items-center md:items-start transition-colors hover:bg-white/10">
                  <p className="text-stone-400 text-xs font-bold uppercase tracking-widest mb-1">{t('memberSince')}</p>
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
                      <h2 className="text-3xl font-bold text-slate-900">{t('editProfile')}</h2>
                      <p className="text-slate-600 mt-1">{t('updateInfo')}</p>
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
                          <span className="text-white text-xs font-bold">{t('changePhoto')}</span>
                          <input
                            type="file"
                            className="hidden"
                            accept="image/*"
                            onChange={handleFileChange}
                          />
                        </label>
                      </div>
                      <p className="text-xs text-slate-500 mt-2">{t('clickToChange')}</p>
                    </div>

                    <div>
                      <Label className="text-slate-900 font-semibold mb-3 block">{t('fullName')}</Label>
                      <Input
                        value={editData.name}
                        onChange={(e) => setEditData({ ...editData, name: e.target.value })}
                        className="border-slate-300 bg-slate-50 focus:bg-white focus:border-stone-900 text-lg py-2"
                        placeholder={t('enterFullName')}
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label className="text-slate-900 font-semibold mb-3 block">{t('nik')}</Label>
                        <Input
                          value={editData.nik}
                          onChange={(e) => setEditData({ ...editData, nik: e.target.value })}
                          className="border-slate-300 bg-slate-50 focus:bg-white focus:border-stone-900 text-lg py-2"
                          placeholder={t('nik')}
                        />
                      </div>
                      <div>
                        <Label className="text-slate-900 font-semibold mb-3 block">{t('gender')}</Label>
                        <select
                          value={editData.jenisKelamin}
                          onChange={(e) => setEditData({ ...editData, jenisKelamin: e.target.value })}
                          className="w-full border border-slate-300 rounded-md bg-slate-50 focus:bg-white focus:border-stone-900 text-lg py-2 px-3"
                        >
                          <option value="">{t('selectGender')}</option>
                          <option value="Laki-laki">{t('male')}</option>
                          <option value="Perempuan">{t('female')}</option>
                        </select>
                      </div>
                    </div>

                    <div>
                      <Label className="text-slate-900 font-semibold mb-3 block">{t('phoneNumber')}</Label>
                      <Input
                        value={editData.phone}
                        onChange={(e) => setEditData({ ...editData, phone: e.target.value })}
                        className="border-slate-300 bg-slate-50 focus:bg-white focus:border-stone-900 text-lg py-2"
                        placeholder="+1 (555) 123-4567"
                      />
                    </div>

                    <div>
                      <Label className="text-slate-900 font-semibold mb-3 block">{t('address')}</Label>
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
                        {t('saveChanges')}
                      </Button>
                      <Button
                        onClick={handleCancelEdit}
                        variant="outline"
                        className="flex-1 border-2 border-slate-300 hover:bg-slate-50 font-bold py-3"
                      >
                        {t('cancel')}
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
                      <h2 className="text-2xl font-bold text-slate-900">{t('changePassword')}</h2>
                      <p className="text-slate-500 text-sm mt-1">{t('keepAccountSecure')}</p>
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
                      <Label className="text-sm font-semibold text-slate-700">{t('currentPassword')}</Label>
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
                      <Label className="text-sm font-semibold text-slate-700">{t('newPassword')}</Label>
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
                      <Label className="text-sm font-semibold text-slate-700">{t('confirmNewPassword')}</Label>
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
                        {isPasswordLoading ? t('updating') : t('updatePassword')}
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
                        {t('cancel')}
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
                  <h2 className="text-2xl font-bold text-slate-900">{t('personalInfo')}</h2>
                </div>

                <div className="space-y-6">
                  <div className="pb-4 border-b border-slate-200">
                    <label className="text-sm text-slate-600 font-semibold uppercase tracking-wide">{t('fullName')}</label>
                    <p className="text-slate-900 mt-2 text-lg font-semibold">{userData.name}</p>
                  </div>

                  <div className="pb-4 border-b border-slate-200">
                    <label className="text-sm text-slate-600 font-semibold uppercase tracking-wide mb-2 flex items-center gap-2">
                      <Mail className="w-4 h-4 text-stone-700" />
                      {t('emailAddress')}
                    </label>
                    <p className="text-slate-900 mt-2 text-lg font-semibold">{userData.email}</p>
                  </div>

                  <div className="pb-4 border-b border-slate-200">
                    <label className="text-sm text-slate-600 font-semibold uppercase tracking-wide mb-2 flex items-center gap-2">
                      <Phone className="w-4 h-4 text-stone-700" />
                      {t('phoneNumber')}
                    </label>
                    <p className="text-slate-900 mt-2 text-lg font-semibold">{userData.phone}</p>
                  </div>

                  <div>
                    <label className="text-sm text-slate-600 font-semibold uppercase tracking-wide mb-2 flex items-center gap-2">
                      <MapPin className="w-4 h-4 text-stone-700" />
                      {t('address')}
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
                  <h2 className="text-2xl font-bold text-slate-900">{t('accountSettings')}</h2>
                </div>

                <div className="space-y-6">
                  <div className="pb-4 border-b border-slate-200">
                    <label className="text-sm text-slate-600 font-semibold uppercase tracking-wide">{t('memberSince')}</label>
                    <p className="text-slate-900 mt-2 text-lg font-semibold">{userData.joinDate}</p>
                  </div>

                  <div className="pb-4 border-b border-slate-200">
                    <label className="text-sm text-slate-600 font-semibold uppercase tracking-wide">{t('accountStatus')}</label>
                    <div className="mt-2 flex items-center gap-3">
                      <div className="w-3 h-3 bg-emerald-400 rounded-full shadow-md" />
                      <p className="text-slate-900 text-lg font-semibold">{userData.status}</p>
                    </div>
                  </div>

                  <div className="pb-4 border-b border-slate-200">
                    <label className="text-sm text-slate-600 font-semibold uppercase tracking-wide">{t('verification')}</label>
                    <Badge className="mt-2 bg-emerald-100 text-emerald-800 font-bold px-3 py-1">✓ {t('emailVerified')}</Badge>
                  </div>

                  {!userData?.isGoogleUser && (
                    <div className="pt-2">
                      <Button
                        onClick={() => setIsChangingPassword(true)}
                        variant="outline"
                        className="w-full font-semibold border-2 border-slate-300 hover:bg-slate-50 py-2"
                      >
                        {t('changePassword')}
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
                <h2 className="text-2xl font-bold text-red-900">{t('dangerZone')}</h2>
              </div>
              <p className="text-sm text-red-700 mb-8 leading-relaxed">
                {t('dangerWarning')}
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
                    {t('logout')}
                  </Button>

                  <Button
                    variant="outline"
                    className="flex-1 border-2 border-red-300 text-red-700 hover:bg-red-100 font-semibold py-3"
                  >
                    {t('deleteAccount')}
                  </Button>
                </div>
              </div>
            </Card>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
