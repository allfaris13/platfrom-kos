'use client';

import { Home, Users, CreditCard, TrendingUp } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/app/components/ui/card';
import { rooms, tenants, payments, Room, Tenant, Payment } from '@/app/data/mockData';
import { useApp } from '@/app/context';

export function AdminDashboard() {
  // Gunakan global state untuk real-time data
  const { getAllBookings, getTotalRevenue, getActiveBookings, getOccupiedRooms, getAllRooms } = useApp();
  
  const allBookings = getAllBookings();
  const globalRevenue = getTotalRevenue();
  const globalActiveBookings = getActiveBookings();
  const globalOccupiedRooms = getOccupiedRooms();
  const globalRooms = getAllRooms();
  const globalAvailableRooms = globalRooms.filter(r => r.status === 'Available').length;

  // Fallback ke mock data jika global state kosong (untuk backward compatibility)
  const displayBookings = allBookings.length > 0 ? allBookings : [];
  const displayRevenue = globalRevenue || 0;
  const displayActiveBookings = globalActiveBookings || tenants.filter(t => t.status === 'Active').length;
  const displayOccupiedRooms = globalOccupiedRooms || rooms.filter(r => r.status === 'Penuh').length;
  const displayAvailableRooms = globalAvailableRooms || rooms.filter(r => r.status === 'Tersedia').length;

  const availableRooms = displayAvailableRooms;
  const occupiedRooms = displayOccupiedRooms;
  const activeTenants = displayActiveBookings;
  const pendingPayments = payments.filter(p => p.status === 'Pending').length;
  const totalRevenue = displayRevenue;

  const stats = [
    {
      title: 'Total Rooms',
      value: globalRooms.length || rooms.length,
      subtitle: `${availableRooms} Available`,
      icon: Home,
      color: 'blue'
    },
    {
      title: 'Active Bookings',
      value: activeTenants,
      subtitle: `${displayBookings.length} Total`,
      icon: Users,
      color: 'green'
    },
    {
      title: 'Pending Payments',
      value: pendingPayments,
      subtitle: 'Need confirmation',
      icon: CreditCard,
      color: 'orange'
    },
    {
      title: 'Total Revenue',
      value: `$${totalRevenue.toLocaleString()}`,
      subtitle: 'All time',
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
        <p className="text-slate-600 mt-1">Welcome to Kos-kosan Management System</p>
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
            <CardTitle>Recent Tenants</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {tenants.slice(0, 4).map((tenant: Tenant) => (
                <div key={tenant.id} className="flex items-center justify-between py-2 border-b last:border-0">
                  <div>
                    <p className="font-medium">{tenant.name}</p>
                    <p className="text-sm text-slate-600">{tenant.roomName}</p>
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
            <CardTitle>Room Occupancy</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div>
                <div className="flex justify-between text-sm mb-2">
                  <span>Occupied</span>
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
                  <p className="text-sm text-slate-600 mt-1">Available</p>
                </div>
                <div className="text-center p-4 bg-red-50 rounded-lg">
                  <p className="text-2xl font-semibold text-red-600">{occupiedRooms}</p>
                  <p className="text-sm text-slate-600 mt-1">Occupied</p>
                </div>
                <div className="text-center p-4 bg-orange-50 rounded-lg">
                  <p className="text-2xl font-semibold text-orange-600">
                    {rooms.filter(r => r.status === 'Maintenance').length}
                  </p>
                  <p className="text-sm text-slate-600 mt-1">Maintenance</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
