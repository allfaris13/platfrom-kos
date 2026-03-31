"use client";

import { useEffect, useState, useCallback } from 'react';
import { Search, Loader2, Ban, UserX, AlertTriangle, Home, Eye, CalendarDays } from 'lucide-react';
import { api, Tenant } from '@/app/services/api';
import { Input } from '@/app/components/ui/input';
import { Button } from '@/app/components/ui/button';
import { useTranslations } from 'next-intl';
import { toast } from 'sonner';
import { motion } from "framer-motion";
import { ImageWithFallback } from '@/app/components/shared/ImageWithFallback';
import {  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/app/components/ui/alert-dialog";
import { Dialog, DialogContent, DialogTitle } from "@/app/components/ui/dialog";

export function TenantData() {
  const t = useTranslations('admin');
  const tCommon = useTranslations('common');
  const [users, setUsers] = useState<Tenant[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'all' | 'guest' | 'tenant' | 'non_active'>('all');
  
  // Pagination State
  const [page, setPage] = useState(1);
  const [limit] = useState(10);
  const [totalPages, setTotalPages] = useState(1);

  // States for deactivate action
  const [isDeactivating, setIsDeactivating] = useState(false);
  const [viewingTenant, setViewingTenant] = useState<Tenant | null>(null);
  const [tenantPaymentDetail, setTenantPaymentDetail] = useState<{ nama_lengkap: string; email: string; nomor_hp: string; nik: string; alamat_asal: string; jenis_kelamin: string; foto_profil: string; role: string; nomor_kamar: string; tipe_kamar: string; harga_per_bulan: number; check_in: string; check_out: string; durasi_sewa: number; payments: { id: number; jumlah_bayar: number; status_pembayaran: string; metode_pembayaran: string; tanggal_bayar: string; payment_month: string }[] } | null>(null);
  const [loadingTenantDetail, setLoadingTenantDetail] = useState(false);

  const fetchUsers = useCallback(async () => {
    setIsLoading(true);
    try {
      const roleFilter = activeTab === 'all' ? undefined : activeTab;
      
      const response = await api.getAllTenants({
        page,
        limit,
        search: searchQuery,
        role: roleFilter
      });

      if ('data' in response && 'meta' in response) {
         setUsers(response.data);
         setTotalPages(response.meta.total_pages);
      } else {
         // Fallback if API changes
         const data = response as unknown as Tenant[];
         setUsers(data);
      }

    } catch (e) {
      console.error(e);
      setUsers([]); 
      toast.error('Gagal mengambil data pengguna');
    } finally {
      setIsLoading(false);
    }
  }, [page, activeTab, searchQuery, limit]);

  useEffect(() => {
    const timer = setTimeout(() => {
       void fetchUsers();
    }, 500);
    return () => clearTimeout(timer);
  }, [fetchUsers]);

  // Fetch tenant detail when modal opens
  useEffect(() => {
    if (viewingTenant) {
      setLoadingTenantDetail(true);
      api.getPaymentsByTenant(viewingTenant.id).then(data => {
        setTenantPaymentDetail(data);
      }).catch(() => {}).finally(() => setLoadingTenantDetail(false));
    }
  }, [viewingTenant]);

  const handleDeactivate = async (id: number) => {
    setIsDeactivating(true);
    try {
      await api.deactivateTenant(id);
      toast.success('Status pengguna berhasil diubah menjadi Non Active');
      void fetchUsers(); // Refresh data
    } catch (e) {
      console.error(e);
      toast.error('Gagal mengubah status pengguna');
    } finally {
      setIsDeactivating(false);
    }
  };

  const getRoleBadge = (role?: string) => {
    if (role === 'tenant') {
      return (
        <span className="px-3 py-1 bg-green-500/10 text-green-600 dark:text-green-400 text-[10px] font-bold rounded-lg border border-green-500/20 uppercase">
          Tenant
        </span>
      );
    }
    if (role === 'non_active') {
      return (
        <span className="px-3 py-1 bg-red-500/10 text-red-600 dark:text-red-400 text-[10px] font-bold rounded-lg border border-red-500/20 uppercase">
          Non Active
        </span>
      );
    }
    return (
      <span className="px-3 py-1 bg-amber-500/10 text-amber-600 dark:text-amber-400 text-[10px] font-bold rounded-lg border border-amber-500/20 uppercase">
        Guest
      </span>
    );
  };

  const truncateText = (text: string, maxLength: number) => {
    if (!text) return '';
    if (text.length <= maxLength) return text;
    return text.substring(0, maxLength) + '...';
  };

  return (
    <div className="p-4 md:p-8 space-y-6 md:space-y-8 bg-gray-50 dark:bg-slate-950 min-h-screen">
      <motion.div 
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="flex flex-col md:flex-row md:items-center justify-between gap-4"
      >
        <div>
          <h2 className="text-2xl md:text-3xl font-bold text-amber-600 dark:text-amber-500">
            {t('tenantsTitle')}
          </h2>
          <p className="text-slate-500 dark:text-slate-400 text-xs md:text-sm">
            {t('tenantsSubtitle')}
          </p>
        </div>

        {/* Search Bar */}
        <div className="relative w-full md:w-96">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 size-4 text-slate-400 dark:text-slate-500" />
          <Input
            placeholder={t('searchTenants')}
            value={searchQuery}
            onChange={(e) => { setSearchQuery(e.target.value); setPage(1); }}
            className="pl-12 bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-500 h-11 md:h-12 rounded-xl"
          />
        </div>
      </motion.div>

      {/* Tabs */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1, duration: 0.4 }}
        className="flex gap-2 border-b border-slate-200 dark:border-slate-800 overflow-x-auto"
      >
        <button
          onClick={() => { setActiveTab('all'); setPage(1); }}
          className={`px-6 py-3 font-bold text-sm transition-all whitespace-nowrap ${
            activeTab === 'all'
              ? 'text-amber-600 dark:text-amber-500 border-b-2 border-amber-500'
              : 'text-slate-400 dark:text-slate-500 hover:text-slate-600 dark:hover:text-slate-300'
          }`}
        >
          {t('allUsers')}
        </button>
        <button
          onClick={() => { setActiveTab('guest'); setPage(1); }}
          className={`px-6 py-3 font-bold text-sm transition-all whitespace-nowrap ${
            activeTab === 'guest'
              ? 'text-amber-600 dark:text-amber-500 border-b-2 border-amber-500'
              : 'text-slate-400 dark:text-slate-500 hover:text-slate-600 dark:hover:text-slate-300'
          }`}
        >
          {t('guestUsers')}
        </button>
        <button
          onClick={() => { setActiveTab('tenant'); setPage(1); }}
          className={`px-6 py-3 font-bold text-sm transition-all whitespace-nowrap ${
            activeTab === 'tenant'
              ? 'text-amber-600 dark:text-amber-500 border-b-2 border-amber-500'
              : 'text-slate-400 dark:text-slate-500 hover:text-slate-600 dark:hover:text-slate-300'
          }`}
        >
          {t('activeTenantsTab')}
        </button>
        <button
          onClick={() => { setActiveTab('non_active'); setPage(1); }}
          className={`px-6 py-3 font-bold text-sm transition-all whitespace-nowrap ${
            activeTab === 'non_active'
              ? 'text-red-600 dark:text-red-500 border-b-2 border-red-500'
              : 'text-slate-400 dark:text-slate-500 hover:text-slate-600 dark:hover:text-slate-300'
          }`}
        >
          Non Active
        </button>
      </motion.div>

      {/* Content Container */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2, duration: 0.4 }}
        className="bg-white/50 dark:bg-slate-900/20 md:border md:border-slate-200 md:dark:border-slate-800 rounded-[1.5rem] md:rounded-[2rem] p-4 md:p-8 backdrop-blur-sm shadow-sm dark:shadow-none"
      >
        {/* Desktop Header */}
        <div className="hidden md:grid grid-cols-[60px_1.5fr_1fr_1.5fr_100px_80px] gap-4 px-6 mb-8 text-slate-500 text-xs font-bold uppercase tracking-widest">
          <div>{t('id')}</div>
          <div>{t('name')}</div>
          <div>NIK</div>
          <div>{t('contact')}</div>
          <div className="text-center">{t('role')}</div>
          <div className="text-center">{t('actions')}</div>
        </div>

        {/* Data Rows */}
        <div className="space-y-4">
          {isLoading ? (
            <div className="flex flex-col items-center justify-center py-20 gap-4">
              <Loader2 className="size-10 text-amber-500 animate-spin" />
              <p className="text-slate-500 italic">{tCommon('loading')}</p>
            </div>
          ) : users.length === 0 ? (
            <div className="text-center py-20 bg-slate-100 dark:bg-slate-800/20 rounded-2xl border border-dashed border-slate-300 dark:border-slate-800">
              <UserX className="size-12 text-slate-400 dark:text-slate-700 mx-auto mb-4" />
              <p className="text-slate-500 dark:text-slate-400 font-medium">{t('noTenantsFound')}</p>
            </div>
          ) : (
            users.filter(user => 
              !searchQuery || 
              user.nama_lengkap?.toLowerCase().includes(searchQuery.toLowerCase()) ||
              user.user?.username?.toLowerCase().includes(searchQuery.toLowerCase()) ||
              user.nik?.includes(searchQuery) ||
              user.email?.toLowerCase().includes(searchQuery.toLowerCase())
            ).map((user) => (
              <div key={user.id}>
                {/* Desktop Row */}
                <div className="hidden md:grid grid-cols-[60px_1.5fr_1fr_1.5fr_100px_80px] gap-4 px-6 py-4 items-center bg-slate-50 dark:bg-slate-800/20 hover:bg-slate-100 dark:hover:bg-slate-800/40 rounded-2xl transition-all border border-transparent hover:border-slate-200 dark:hover:border-slate-800 group">
                  <div className="text-slate-400 dark:text-slate-500 font-mono text-sm">#{user.id}</div>
                  
                  {/* Real Name Display */}
                  <div className="flex flex-col min-w-0">
                    <span 
                      className="text-slate-900 dark:text-white font-bold text-sm md:text-base truncate" 
                      title={user.nama_lengkap || user.user?.username || '-'}
                    >
                      {truncateText(user.nama_lengkap || user.user?.username || '-', 25)}
                    </span>
                    {user.user?.username && (
                      <span className="text-slate-400 text-xs truncate" title={user.user.username}>
                        @{truncateText(user.user.username, 20)}
                      </span>
                    )}
                  </div>
                  
                  <div className="text-slate-600 dark:text-slate-300 text-sm font-mono truncate" title={user.nik || '-'}>
                    {truncateText(user.nik || '-', 16)}
                  </div>
                  
                  <div className="flex flex-col min-w-0">
                    <span className="text-slate-600 dark:text-slate-300 text-sm truncate" title={user.email || 'N/A'}>
                      {truncateText(user.email || 'N/A', 25)}
                    </span>
                    <span className="text-slate-400 dark:text-slate-500 text-xs truncate">
                      {user.nomor_hp || '-'}
                    </span>
                  </div>
                  
                  <div className="flex justify-center">
                    {getRoleBadge(user.role)}
                  </div>

                  <div className="flex items-center justify-center gap-1 min-w-[72px]">
                    <Button variant="ghost" size="icon" onClick={() => setViewingTenant(user)} className="size-8 text-slate-400 hover:text-slate-900 dark:hover:text-white" title="Detail">
                      <Eye className="size-4" />
                    </Button>
                    {user.role !== 'non_active' ? (
                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="size-8 text-slate-400 hover:text-amber-600 hover:bg-amber-50 dark:hover:bg-amber-500/10 rounded-lg transition-colors"
                            title="Non-aktifkan"
                          >
                            <Ban className="size-4" />
                          </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent className="bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800">
                          <AlertDialogHeader>
                            <AlertDialogTitle className="flex items-center gap-2 text-slate-900 dark:text-white">
                              <AlertTriangle className="size-5 text-amber-500" />
                              Non-aktifkan Pengguna
                            </AlertDialogTitle>
                            <AlertDialogDescription className="text-slate-600 dark:text-slate-400">
                              Apakah Anda yakin ingin mengubah status pengguna ini menjadi Non Active? Pengguna tidak akan dihapus dari sistem.
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel className="bg-transparent border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white hover:bg-slate-100 dark:hover:bg-slate-800">
                              {tCommon('cancel')}
                            </AlertDialogCancel>
                            <AlertDialogAction
                              onClick={() => handleDeactivate(user.id)}
                              disabled={isDeactivating}
                              className="bg-amber-500 hover:bg-amber-600 text-white border-none"
                            >
                              {isDeactivating ? <Loader2 className="size-4 animate-spin" /> : 'Non-aktifkan'}
                            </AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                    ) : (
                      <div className="size-8 flex items-center justify-center text-slate-300 dark:text-slate-600 font-bold">—</div>
                    )}
                  </div>

                </div>

                {/* Mobile Card */}
                <div className="md:hidden p-5 bg-white dark:bg-slate-900/40 border border-slate-200 dark:border-slate-800 rounded-2xl space-y-4 shadow-sm dark:shadow-none">
                  <div className="flex justify-between items-start">
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="size-10 bg-gradient-to-br from-amber-500 to-amber-600 rounded-xl flex items-center justify-center font-bold text-white uppercase flex-shrink-0">
                        {user.nama_lengkap ? user.nama_lengkap.charAt(0) : (user.user?.username?.charAt(0) || 'U')}
                      </div>
                      <div className="overflow-hidden min-w-0">
                         <h3 className="text-slate-900 dark:text-white font-bold truncate">
                            {truncateText(user.nama_lengkap || user.user?.username || 'N/A', 20)}
                         </h3>
                         <p className="text-slate-400 dark:text-slate-500 font-mono text-[10px]">ID: #{user.id}</p>
                      </div>
                    </div>
                    {getRoleBadge(user.role)}
                  </div>

                  <div className="pt-2 border-t border-slate-200 dark:border-slate-800 grid grid-cols-2 gap-2">
                     <div className="min-w-0">
                        <p className="text-slate-500 text-[10px] uppercase font-bold tracking-widest">Email</p>
                        <p className="text-slate-600 dark:text-slate-300 text-xs truncate" title={user.email || '-'}>
                          {truncateText(user.email || '-', 25)}
                        </p>
                     </div>
                     <div>
                        <p className="text-slate-500 text-[10px] uppercase font-bold tracking-widest">Telepon</p>
                        <p className="text-slate-600 dark:text-slate-300 text-xs truncate">{user.nomor_hp || '-'}</p>
                     </div>
                  </div>

                  <div className="flex justify-end pt-2">
                    {user.role !== 'non_active' ? (
                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <Button
                            variant="ghost" 
                            size="sm"
                            className="w-full text-amber-600 hover:text-white hover:bg-amber-500 border border-amber-500/20"
                          >
                            <Ban className="size-4 mr-2" />
                            Non-aktifkan
                          </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent className="bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800">
                          <AlertDialogHeader>
                             <AlertDialogTitle className="text-slate-900 dark:text-white">Non-aktifkan Pengguna</AlertDialogTitle>
                             <AlertDialogDescription className="text-slate-600 dark:text-slate-400">Apakah Anda yakin ingin mengubah status pengguna ini menjadi Non Active?</AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                             <AlertDialogCancel className="dark:text-white">{tCommon('cancel')}</AlertDialogCancel>
                             <AlertDialogAction onClick={() => handleDeactivate(user.id)} className="bg-amber-500 hover:bg-amber-600 text-white">Non-aktifkan</AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                    ) : (
                      <span className="text-slate-400 dark:text-slate-600 text-xs italic w-full text-center py-2">Sudah Non Active</span>
                    )}
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Pagination Controls */}
        <div className="flex justify-between items-center mt-6 pt-6 border-t border-slate-200 dark:border-slate-800">
          <button
            onClick={() => setPage(p => Math.max(1, p - 1))}
            disabled={page === 1 || isLoading}
            className="px-4 py-2 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 disabled:opacity-50 disabled:cursor-not-allowed rounded-lg text-sm font-medium transition-colors"
          >
            Previous
          </button>
          <span className="text-slate-500 dark:text-slate-400 text-sm">
            Page {page} of {totalPages || 1}
          </span>
          <button
            onClick={() => setPage(p => Math.min(totalPages, p + 1))}
            disabled={page === totalPages || isLoading}
            className="px-4 py-2 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 disabled:opacity-50 disabled:cursor-not-allowed rounded-lg text-sm font-medium transition-colors"
          >
            Next
          </button>
        </div>
      </motion.div>

      {/* Tenant Detail Modal */}
      <Dialog open={!!viewingTenant} onOpenChange={() => { setViewingTenant(null); setTenantPaymentDetail(null); }}>
        <DialogContent className="w-[95vw] max-w-2xl bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white p-0 overflow-hidden rounded-2xl md:rounded-[2rem] max-h-[90vh] overflow-y-auto">
          <DialogTitle className="sr-only">Detail Penyewa {viewingTenant?.nama_lengkap}</DialogTitle>
          {viewingTenant && (
            <div className="space-y-0">
              {/* Header with Avatar */}
              <div className="relative bg-gradient-to-br from-amber-500 to-amber-600 p-6 md:p-8">
                <div className="flex items-center gap-4">
                  <div className="size-16 md:size-20 bg-white/20 backdrop-blur rounded-2xl flex items-center justify-center text-2xl md:text-3xl font-black text-white uppercase flex-shrink-0 overflow-hidden">
                    {tenantPaymentDetail?.foto_profil ? (
                      <ImageWithFallback src={tenantPaymentDetail.foto_profil} alt="Foto Profil" className="w-full h-full object-cover" />
                    ) : (
                      viewingTenant.nama_lengkap ? viewingTenant.nama_lengkap.charAt(0) : 'U'
                    )}
                  </div>
                  <div>
                    <h2 className="text-xl md:text-2xl font-black text-white">{viewingTenant.nama_lengkap || viewingTenant.user?.username || 'N/A'}</h2>
                    <p className="text-amber-100 text-xs md:text-sm mt-1">@{viewingTenant.user?.username || '-'} • ID #{viewingTenant.id}</p>
                  </div>
                </div>
              </div>

              <div className="p-4 md:p-8 space-y-6">
                {/* Profile Info Grid */}
                <div>
                  <p className="text-slate-500 dark:text-slate-400 text-[10px] font-bold uppercase tracking-widest mb-3">Data Pribadi</p>
                  <div className="grid grid-cols-2 gap-3">
                    <div className="p-3 bg-slate-50 dark:bg-slate-800/40 rounded-xl border border-slate-200 dark:border-slate-700/50">
                      <p className="text-slate-500 text-[10px] uppercase font-bold tracking-widest mb-1">NIK</p>
                      <p className="text-xs font-bold text-slate-900 dark:text-white">{tenantPaymentDetail?.nik || viewingTenant.nik || '-'}</p>
                    </div>
                    <div className="p-3 bg-slate-50 dark:bg-slate-800/40 rounded-xl border border-slate-200 dark:border-slate-700/50">
                      <p className="text-slate-500 text-[10px] uppercase font-bold tracking-widest mb-1">Email</p>
                      <p className="text-xs font-bold text-slate-900 dark:text-white truncate">{tenantPaymentDetail?.email || viewingTenant.email || '-'}</p>
                    </div>
                    <div className="p-3 bg-slate-50 dark:bg-slate-800/40 rounded-xl border border-slate-200 dark:border-slate-700/50">
                      <p className="text-slate-500 text-[10px] uppercase font-bold tracking-widest mb-1">Telepon</p>
                      <p className="text-xs font-bold text-slate-900 dark:text-white">{tenantPaymentDetail?.nomor_hp || viewingTenant.nomor_hp || '-'}</p>
                    </div>
                    <div className="p-3 bg-slate-50 dark:bg-slate-800/40 rounded-xl border border-slate-200 dark:border-slate-700/50">
                      <p className="text-slate-500 text-[10px] uppercase font-bold tracking-widest mb-1">Jenis Kelamin</p>
                      <p className="text-xs font-bold text-slate-900 dark:text-white">{tenantPaymentDetail?.jenis_kelamin || viewingTenant.jenis_kelamin || '-'}</p>
                    </div>
                    <div className="col-span-2 p-3 bg-slate-50 dark:bg-slate-800/40 rounded-xl border border-slate-200 dark:border-slate-700/50">
                      <p className="text-slate-500 text-[10px] uppercase font-bold tracking-widest mb-1">Alamat Asal</p>
                      <p className="text-xs font-bold text-slate-900 dark:text-white">{tenantPaymentDetail?.alamat_asal || viewingTenant.alamat_asal || '-'}</p>
                    </div>
                  </div>
                </div>

                {/* Room Info */}
                {loadingTenantDetail ? (
                  <div className="flex justify-center py-6"><Loader2 className="size-5 animate-spin text-amber-500" /></div>
                ) : tenantPaymentDetail?.nomor_kamar ? (
                  <div className="space-y-4">
                    <p className="text-slate-500 dark:text-slate-400 text-[10px] font-bold uppercase tracking-widest">Kamar & Riwayat Pembayaran</p>
                    <div className="flex items-center gap-3 p-3 bg-amber-50 dark:bg-amber-500/5 rounded-xl border border-amber-200 dark:border-amber-500/20">
                      <Home className="size-5 text-amber-500 flex-shrink-0" />
                      <div>
                        <p className="font-bold text-sm text-slate-900 dark:text-white">{tenantPaymentDetail.nomor_kamar}</p>
                        <p className="text-[10px] text-slate-500">{tenantPaymentDetail.tipe_kamar} • {new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(tenantPaymentDetail.harga_per_bulan)}/bulan</p>
                      </div>
                    </div>
                    {tenantPaymentDetail.check_in && (
                      <div className="grid grid-cols-3 gap-2 mt-3">
                        <div className="p-3 bg-slate-50 dark:bg-slate-800/40 rounded-xl border border-slate-200 dark:border-slate-700/50 text-center">
                          <p className="text-[9px] uppercase tracking-widest font-bold text-slate-400 mb-1">Check In</p>
                          <p className="text-xs font-bold text-slate-700 dark:text-slate-200">{tenantPaymentDetail.check_in}</p>
                        </div>
                        <div className="p-3 bg-slate-50 dark:bg-slate-800/40 rounded-xl border border-slate-200 dark:border-slate-700/50 text-center">
                          <p className="text-[9px] uppercase tracking-widest font-bold text-slate-400 mb-1">Check Out</p>
                          <p className="text-xs font-bold text-slate-700 dark:text-slate-200">{tenantPaymentDetail.check_out}</p>
                        </div>
                        <div className="p-3 bg-slate-50 dark:bg-slate-800/40 rounded-xl border border-slate-200 dark:border-slate-700/50 text-center">
                          <p className="text-[9px] uppercase tracking-widest font-bold text-slate-400 mb-1">Durasi</p>
                          <p className="text-xs font-bold text-slate-700 dark:text-slate-200">{tenantPaymentDetail.durasi_sewa} Bulan</p>
                        </div>
                      </div>
                    )}

                    {tenantPaymentDetail.payments.length > 0 ? (
                      <div className="space-y-2">
                        {tenantPaymentDetail.payments.map((pay) => (
                          <div key={pay.id} className="flex items-center justify-between p-3 bg-slate-50 dark:bg-slate-800/40 rounded-xl border border-slate-200 dark:border-slate-700/50">
                            <div className="flex items-center gap-3">
                              <CalendarDays className="size-4 text-slate-400" />
                              <div>
                                <p className="text-xs font-semibold text-slate-700 dark:text-slate-200">{pay.payment_month || pay.tanggal_bayar}</p>
                                <p className="text-[10px] text-slate-400">{pay.metode_pembayaran}</p>
                              </div>
                            </div>
                            <div className="text-right">
                              <p className="text-xs font-bold text-slate-900 dark:text-white">{new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(pay.jumlah_bayar)}</p>
                              <span className={`text-[9px] font-bold uppercase ${
                                pay.status_pembayaran === 'Confirmed' ? 'text-green-600' :
                                pay.status_pembayaran === 'Pending' ? 'text-yellow-600' :
                                'text-red-600'
                              }`}>
                                {pay.status_pembayaran === 'Confirmed' ? 'Lunas' : pay.status_pembayaran}
                              </span>
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className="text-slate-400 text-xs italic text-center py-3">Belum ada riwayat pembayaran</p>
                    )}
                  </div>
                ) : (
                  <div className="p-4 bg-slate-50 dark:bg-slate-800/40 rounded-xl border border-slate-200 dark:border-slate-700/50 text-center">
                    <p className="text-slate-400 text-xs italic">Belum ada pemesanan aktif</p>
                  </div>
                )}
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
