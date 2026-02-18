'use client';

import { Home, Users, CreditCard, TrendingUp, Loader2 } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/app/components/ui/card';
import { useEffect, useState } from 'react';
import { api, DashboardStats, Tenant, Room } from '@/app/services/api';

export function AdminDashboard() {
  const [statsData, setStatsData] = useState<DashboardStats | null>(null);
  const [tenants, setTenants] = useState<Tenant[]>([]);
  const [rooms, setRooms] = useState<Room[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [s, t, r] = await Promise.all([
          api.getDashboardStats(),
          api.getAllTenants(),
          api.getRooms()
        ]);
        setStatsData(s);
        setTenants(t.data);
        setRooms(r);
      } catch (e) {
        console.error(e);
      } finally {
        setIsLoading(false);
      }
    };
    void fetchData();
  }, []);

  if (isLoading || !statsData) {
    return (
      <div className="flex flex-col items-center justify-center p-20 gap-4">
        <Loader2 className="w-10 h-10 animate-spin text-amber-500" />
        <p className="text-slate-400">Memuat dashboard...</p>
      </div>
    );
  }

  const availableRooms = statsData.available_rooms;
  const occupiedRooms = statsData.occupied_rooms;
  const activeTenants = statsData.active_tenants;
  const pendingPayments = statsData.pending_payments;
  const totalRevenue = statsData.total_revenue;

  const stats = [
    {
      title: 'Total Kamar',
      value: rooms.length,
      subtitle: `${availableRooms} Tersedia`,
      icon: Home,
      color: 'blue'
    },
    {
      title: 'Penyewa Aktif',
      value: activeTenants,
      subtitle: `${tenants.length} Terdaftar`,
      icon: Users,
      color: 'green'
    },
    {
      title: 'Pembayaran Menunggu',
      value: pendingPayments,
      subtitle: 'Perlu konfirmasi',
      icon: CreditCard,
      color: 'orange'
    },
    {
      title: 'Total Pendapatan',
      value: `Rp ${totalRevenue.toLocaleString()}`,
      subtitle: 'Sepanjang masa',
      icon: TrendingUp,
      color: 'purple'
    }
  ];

  const colorClasses = {
    blue: 'bg-blue-100 text-blue-600',
    green: 'bg-green-100 text-green-600',
    orange: 'bg-orange-100 text-orange-600',
    purple: 'bg-purple-100 text-purple-600'
  };

  return (
    <div className="p-6 space-y-6">
      <div>
        <h2 className="text-3xl font-semibold">Dashboard</h2>
        <p className="text-slate-600 mt-1">Selamat Datang di Sistem Manajemen Kos-kosan</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat) => {
          const Icon = stat.icon;
          return (
            <Card key={stat.title}>
              <CardContent className="p-6">
                <div className="flex items-start justify-between">
                  <div>
                    <p className="text-sm text-slate-600">{stat.title}</p>
                    <p className="text-2xl font-semibold mt-2">{stat.value}</p>
                    <p className="text-sm text-slate-500 mt-1">{stat.subtitle}</p>
                  </div>
                  <div className={`p-3 rounded-lg ${colorClasses[stat.color as keyof typeof colorClasses]}`}>
                    <Icon className="size-6" />
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Recent Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Penyewa Terbaru</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {tenants.slice(0, 4).map((tenant: Tenant) => (
                <div key={tenant.id} className="flex items-center justify-between py-2 border-b last:border-0">
                  <div>
                    <p className="font-medium text-white">{tenant.nama_lengkap}</p>
                    <p className="text-sm text-slate-400">{tenant.user?.username || 'User'}</p>
                  </div>
                  <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                    tenant.status === 'Active' 
                      ? 'bg-green-100 text-green-700' 
                      : tenant.status === 'Expired'
                      ? 'bg-red-100 text-red-700'
                      : 'bg-yellow-100 text-yellow-700'
                  }`}>
                    {tenant.status}
                  </span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Okupansi Kamar</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div>
                <div className="flex justify-between text-sm mb-2">
                  <span>Terisi</span>
                  <span className="font-medium">{occupiedRooms}/{rooms.length}</span>
                </div>
                <div className="h-2 bg-slate-200 rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-blue-600"
                    style={{ width: `${(occupiedRooms / rooms.length) * 100}%` }}
                  />
                </div>
              </div>
              
              <div className="grid grid-cols-3 gap-4 mt-6">
                <div className="text-center p-4 bg-green-50 rounded-lg">
                  <p className="text-2xl font-semibold text-green-600">{availableRooms}</p>
                  <p className="text-sm text-slate-600 mt-1">Tersedia</p>
                </div>
                <div className="text-center p-4 bg-red-50 rounded-lg">
                  <p className="text-2xl font-semibold text-red-600">{occupiedRooms}</p>
                  <p className="text-sm text-slate-600 mt-1">Terisi</p>
                </div>
                <div className="text-center p-4 bg-orange-50 rounded-lg">
                  <p className="text-2xl font-semibold text-orange-600">
                    {rooms.filter(r => r.status === 'Perbaikan').length}
                  </p>
                  <p className="text-sm text-slate-600 mt-1">Perbaikan</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
