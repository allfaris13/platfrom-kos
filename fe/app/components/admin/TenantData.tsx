"use client";

import { useEffect, useState, useCallback } from 'react';
import { Search, Loader2, Trash2, UserX, AlertTriangle } from 'lucide-react';
import { api, Tenant } from '@/app/services/api';
import { Input } from '@/app/components/ui/input';
import { Button } from '@/app/components/ui/button';
import { useTranslations } from 'next-intl';
import { toast } from 'sonner';
import { motion } from "framer-motion";
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

export function TenantData() {
  const t = useTranslations('admin');
  const tCommon = useTranslations('common');
  const [users, setUsers] = useState<Tenant[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'all' | 'guest' | 'tenant'>('all'); // Filter user/tenant
  
  // Pagination State
  const [page, setPage] = useState(1);
  const [limit] = useState(10);
  const [totalPages, setTotalPages] = useState(1);

  // States for delete action
  const [isDeleting, setIsDeleting] = useState(false);

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

  const handleDelete = async (id: number) => {
    setIsDeleting(true);
    try {
      await api.deleteTenant(id);
      toast.success('Pengguna berhasil dihapus');
      void fetchUsers(); // Refresh data
    } catch (e) {
      console.error(e);
      toast.error('Gagal menghapus pengguna');
    } finally {
      setIsDeleting(false);
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
            users.map((user) => (
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

                  <div className="flex justify-center">
                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="text-slate-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-500/10 rounded-lg transition-colors"
                        >
                          <Trash2 className="size-4" />
                        </Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent className="bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800">
                        <AlertDialogHeader>
                          <AlertDialogTitle className="flex items-center gap-2 text-slate-900 dark:text-white">
                            <AlertTriangle className="size-5 text-red-500" />
                            {tCommon('delete')}
                          </AlertDialogTitle>
                          <AlertDialogDescription className="text-slate-600 dark:text-slate-400">
                            {t('deleteUserConfirm')}
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel className="bg-transparent border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white hover:bg-slate-100 dark:hover:bg-slate-800">
                            {tCommon('cancel')}
                          </AlertDialogCancel>
                          <AlertDialogAction
                            onClick={() => handleDelete(user.id)}
                            disabled={isDeleting}
                            className="bg-red-500 hover:bg-red-600 text-white border-none"
                          >
                            {isDeleting ? <Loader2 className="size-4 animate-spin" /> : tCommon('delete')}
                          </AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
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
                     <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button
                          variant="ghost" 
                          size="sm"
                          className="w-full text-red-500 hover:text-white hover:bg-red-500 border border-red-500/20"
                        >
                          <Trash2 className="size-4 mr-2" />
                          {tCommon('delete')}
                        </Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent className="bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800">
                        <AlertDialogHeader>
                           <AlertDialogTitle className="text-slate-900 dark:text-white">{tCommon('confirm')}</AlertDialogTitle>
                           <AlertDialogDescription className="text-slate-600 dark:text-slate-400">{t('deleteUserConfirm')}</AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                           <AlertDialogCancel className="dark:text-white">{tCommon('cancel')}</AlertDialogCancel>
                           <AlertDialogAction onClick={() => handleDelete(user.id)} className="bg-red-500 text-white">{tCommon('delete')}</AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
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
    </div>
  );
}
