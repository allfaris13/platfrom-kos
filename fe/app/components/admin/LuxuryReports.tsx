import { useEffect, useState } from 'react';
import { api } from '@/app/services/api';
import { TrendingUp, Download, Calendar, DollarSign, Loader2, BarChart3, Activity } from 'lucide-react';
import { BarChart, Bar, PieChart, Pie, Cell, ResponsiveContainer, XAxis, YAxis, CartesianGrid, Tooltip } from 'recharts';
import { Button } from '@/app/components/ui/button';

interface Room {
  id: number;
  tipe_kamar: string;
  status: string;
  harga_per_bulan: number;
}

interface Payment {
  id: number;
  jumlah_bayar: number;
  status_pembayaran: string;
  tanggal_bayar: string;
}

interface DashboardStats {
  monthly_trend: { month: string; revenue: number }[];
  demographics: { name: string; value: number; color: string }[];
  type_breakdown: { type: string; revenue: number; count: number; occupied: number }[];
  total_revenue: number;
  pending_payments: number;
  active_tenants: number;
}

export function LuxuryReports() {
  const [payments, setPayments] = useState<Payment[]>([]);
  const [rooms, setRooms] = useState<Room[]>([]);
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [pData, rData, sData] = await Promise.all([
          api.getPayments(),
          api.getRooms(),
          api.getDashboardStats()
        ]);
        setPayments(pData);
        setRooms(rData);
        setStats(sData);
      } catch (e) {
        console.error("Failed to fetch reports data:", e);
      } finally {
        setIsLoading(false);
      }
    };
    void fetchData();
  }, []);

  const confirmedPayments = payments.filter(p => p.status_pembayaran === 'Confirmed');
  const totalRevenue = confirmedPayments.reduce((sum, p) => sum + p.jumlah_bayar, 0);
  const pendingRevenue = payments
    .filter(p => p.status_pembayaran === 'Pending')
    .reduce((sum, p) => sum + p.jumlah_bayar, 0);

  // Revenue by Room Type Data
  const revenueByType = stats?.type_breakdown || [];

  const tenantDemographics = stats?.demographics || [
    { name: '18-25', value: 33, color: '#f59e0b' },
    { name: '26-35', value: 45, color: '#3b82f6' },
    { name: '36-45', value: 15, color: '#10b981' },
    { name: '45+', value: 7, color: '#8b5cf6' }
  ];

  // Monthly Data from Backend
  const monthlyRevenueData = stats?.monthly_trend?.length ? [...stats.monthly_trend].reverse() : [
    { month: 'Jan', revenue: 4200000 },
    { month: 'Feb', revenue: 5100000 },
    { month: 'Mar', revenue: 4800000 },
    { month: 'Apr', revenue: 5400000 },
    { month: 'May', revenue: 6200000 },
    { month: 'Jun', revenue: 5900000 }
  ];

  const yoyComparisonData = [
    { month: 'Jan', thisYear: 4200000, lastYear: 3800000 },
    { month: 'Feb', thisYear: 5100000, lastYear: 4500000 },
    { month: 'Mar', thisYear: 4800000, lastYear: 4200000 },
    { month: 'Apr', thisYear: 5400000, lastYear: 4900000 },
    { month: 'May', thisYear: 6200000, lastYear: 5500000 },
    { month: 'Jun', thisYear: 5900000, lastYear: 5200000 }
  ];

  const formatPrice = (price: number) => {
    if (price >= 1000000) {
      return `Rp ${(price / 1000000).toFixed(1).replace('.', ',')} jt`;
    }
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0
    }).format(price).replace('Rp', 'Rp ');
  };

  interface TooltipPayload {
    value: number;
    name: string;
    color: string;
  }

  const CustomTooltip = ({ active, payload, label }: { active?: boolean; payload?: TooltipPayload[]; label?: string }) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-slate-800 border border-slate-700 rounded-lg p-3 shadow-xl">
          <p className="text-slate-400 text-xs mb-1">{label}</p>
          {payload.map((entry, index: number) => {
            const val = entry.value;
            return (
              <p key={index} className="text-white font-semibold flex items-center gap-2">
                <span className="size-2 rounded-full" style={{ backgroundColor: entry.color }} />
                {entry.name || 'Value'}: {formatPrice(val)}
              </p>
            );
          })}
        </div>
      );
    }
    return null;
  };

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-slate-950 gap-4">
        <Loader2 className="w-12 h-12 text-amber-500 animate-spin" />
        <p className="text-slate-400 font-medium italic">Preparing financial reports...</p>
      </div>
    );
  }

  return (
    <div className="p-8 space-y-8 bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 min-h-screen">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-amber-400 via-amber-500 to-amber-600 bg-clip-text text-transparent mb-1">
            Laporan Keuangan
          </h1>
          <p className="text-slate-400 text-sm">Comprehensive financial analytics and reports</p>
        </div>
        <div className="flex items-center gap-3">
          <Button variant="outline" className="bg-slate-800/50 border-slate-700 text-white hover:bg-slate-800 h-10 px-4">
            <Calendar className="size-4 mr-2" />
            Last 6 Months
          </Button>
          <Button className="bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-white shadow-lg shadow-amber-500/20 h-10 px-4">
            <Download className="size-4 mr-2" />
            Export Report
          </Button>
        </div>
      </div>

      {/* Metric Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6">
        {/* Total Revenue */}
        <div className="group relative overflow-hidden bg-slate-900/40 border border-green-500/20 rounded-2xl p-6 hover:border-green-500/40 transition-all">
          <div className="absolute top-0 right-0 w-24 h-24 bg-gradient-to-br from-green-500/10 to-transparent rounded-full blur-2xl" />
          <div className="relative">
            <div className="p-3 bg-green-500/20 rounded-xl w-fit mb-4">
              <DollarSign className="size-6 text-green-400" />
            </div>
            <div className="flex justify-between items-start">
               <div>
                  <p className="text-slate-400 text-xs mb-1">Total Revenue</p>
                  <p className="text-2xl font-bold text-white mb-2">{formatPrice(totalRevenue)}</p>
                  <p className="text-[10px] text-green-400 font-medium">+12.5% from last month</p>
               </div>
               <span className="text-[10px] text-green-500 font-bold px-2 py-1 bg-green-500/10 rounded-lg mt-1 border border-green-500/20">
                 +12.5%
               </span>
            </div>
          </div>
        </div>

        {/* Pending Revenue */}
        <div className="group relative overflow-hidden bg-slate-900/40 border border-orange-500/20 rounded-2xl p-6 hover:border-orange-500/40 transition-all">
          <div className="absolute top-0 right-0 w-24 h-24 bg-gradient-to-br from-orange-500/10 to-transparent rounded-full blur-2xl" />
          <div className="relative">
            <div className="p-3 bg-orange-500/20 rounded-xl w-fit mb-4">
              <TrendingUp className="size-6 text-orange-400" />
            </div>
            <div>
              <p className="text-slate-400 text-xs mb-1">Pending Revenue</p>
              <p className="text-2xl font-bold text-white mb-2">{formatPrice(pendingRevenue)}</p>
              <p className="text-[10px] text-orange-400 font-medium">Awaiting confirmation</p>
            </div>
          </div>
        </div>

        {/* Avg Room Rate */}
        <div className="group relative overflow-hidden bg-slate-900/40 border border-blue-500/20 rounded-2xl p-6 hover:border-blue-500/40 transition-all">
          <div className="absolute top-0 right-0 w-24 h-24 bg-gradient-to-br from-blue-500/10 to-transparent rounded-full blur-2xl" />
          <div className="relative">
            <div className="p-3 bg-blue-500/20 rounded-xl w-fit mb-4">
              <BarChart3 className="size-6 text-blue-400" />
            </div>
            <div>
              <p className="text-slate-400 text-xs mb-1">Avg. Room Rate</p>
              <p className="text-2xl font-bold text-white mb-2">
                {formatPrice(rooms.length > 0 ? rooms.reduce((sum, r) => sum + (r.harga_per_bulan || 0), 0) / rooms.length : 0)}
              </p>
              <p className="text-[10px] text-blue-400 font-medium">Per month</p>
            </div>
          </div>
        </div>

        {/* Occupancy Rate */}
        <div className="group relative overflow-hidden bg-slate-900/40 border border-purple-500/20 rounded-2xl p-6 hover:border-purple-500/40 transition-all">
          <div className="absolute top-0 right-0 w-24 h-24 bg-gradient-to-br from-purple-500/10 to-transparent rounded-full blur-2xl" />
          <div className="relative">
            <div className="p-3 bg-purple-500/20 rounded-xl w-fit mb-4">
              <Activity className="size-6 text-purple-400" />
            </div>
            <div className="flex justify-between items-start">
               <div>
                  <p className="text-slate-400 text-xs mb-1">Occupancy Rate</p>
                  <p className="text-2xl font-bold text-white mb-2">
                    {rooms.length > 0 ? Math.round((rooms.filter(r => r.status === 'Penuh').length / rooms.length) * 100) : 0}%
                  </p>
                  <p className="text-[10px] text-purple-400 font-medium">{rooms.filter(r => r.status === 'Penuh').length}/{rooms.length} rooms</p>
               </div>
               <span className="text-[10px] text-purple-500 font-bold px-2 py-1 bg-purple-500/10 rounded-lg mt-1 border border-purple-500/20">
                 33%
               </span>
            </div>
          </div>
        </div>
      </div>

      {/* First Chart: Monthly Revenue Trend */}
      <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-6 backdrop-blur-sm">
        <div className="mb-6">
          <h3 className="text-xl font-semibold text-white mb-1">Monthly Revenue Trend</h3>
          <p className="text-sm text-slate-400">Last 6 months performance</p>
        </div>
        <div className="h-80">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={monthlyRevenueData}>
              <defs>
                <linearGradient id="revenueBarGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#f59e0b" stopOpacity={0.8}/>
                  <stop offset="95%" stopColor="#f59e0b" stopOpacity={0.4}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#334155" vertical={false} opacity={0.3} />
              <XAxis dataKey="month" stroke="#64748b" axisLine={false} tickLine={false} style={{ fontSize: '11px' }} />
              <YAxis 
                stroke="#64748b" 
                axisLine={false} 
                tickLine={false} 
                style={{ fontSize: '11px' }} 
                tickFormatter={(val) => formatPrice(val)}
              />
              <Tooltip cursor={{ fill: 'transparent' }} content={<CustomTooltip />} />
              <Bar dataKey="revenue" fill="url(#revenueBarGradient)" radius={[6, 6, 0, 0]} maxBarSize={60} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Second Section: Demographics */}
      <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-8 backdrop-blur-sm">
        <div className="mb-8">
          <h3 className="text-xl font-semibold text-white mb-1">Tenant Demographics</h3>
          <p className="text-sm text-slate-400">Age distribution</p>
        </div>
        <div className="flex flex-col lg:flex-row items-center gap-12">
          <div className="w-full lg:w-1/2 h-64 flex items-center justify-center">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie 
                   data={tenantDemographics} 
                   cx="50%" 
                   cy="50%" 
                   innerRadius={0} 
                   outerRadius={100} 
                   dataKey="value"
                   stroke="none"
                >
                  {tenantDemographics.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip contentStyle={{ backgroundColor: '#1e293b', border: 'none', borderRadius: '8px', color: '#fff' }} />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="w-full lg:w-1/2 space-y-4">
            {tenantDemographics.map((item) => (
              <div key={item.name} className="flex items-center justify-between p-4 bg-slate-800/40 rounded-xl border border-slate-700/50 shadow-sm">
                <div className="flex items-center gap-4">
                  <div className="size-4 rounded-full" style={{ backgroundColor: item.color }} />
                  <span className="text-sm font-medium text-slate-300">{item.name} years</span>
                </div>
                <span className="text-sm font-bold text-white">{item.value}%</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Third Section: YoY Monthly Revenue Trend */}
      <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-6 backdrop-blur-sm">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-8 gap-4">
          <div>
            <h3 className="text-xl font-semibold text-white mb-1">Monthly Revenue Trend</h3>
            <p className="text-sm text-slate-400">Last 6 months performance</p>
          </div>
          <div className="flex items-center gap-6">
            <div className="flex items-center gap-2">
              <div className="size-3 bg-amber-500 rounded-full" />
              <span className="text-xs text-slate-400 font-medium">This Year</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="size-3 bg-blue-500 rounded-full" />
              <span className="text-xs text-slate-400 font-medium">Last Year</span>
            </div>
          </div>
        </div>
        <div className="h-80">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={yoyComparisonData} barGap={8}>
              <CartesianGrid strokeDasharray="3 3" stroke="#334155" vertical={false} opacity={0.3} />
              <XAxis dataKey="month" stroke="#64748b" axisLine={false} tickLine={false} style={{ fontSize: '11px' }} />
              <YAxis 
                stroke="#64748b" 
                axisLine={false} 
                tickLine={false} 
                style={{ fontSize: '11px' }} 
                tickFormatter={(val) => formatPrice(val)}
              />
              <Tooltip cursor={{ fill: 'rgba(255,255,255,0.05)' }} content={<CustomTooltip />} />
              <Bar dataKey="thisYear" fill="#f59e0b" radius={[4, 4, 0, 0]} maxBarSize={24} />
              <Bar dataKey="lastYear" fill="#3b82f6" radius={[4, 4, 0, 0]} maxBarSize={24} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Bottom Layout: Revenue Breakdown & Payment Status */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Revenue Breakdown */}
        <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-6 backdrop-blur-sm">
          <h3 className="text-xl font-semibold text-white mb-6">Revenue Breakdown</h3>
          <div className="space-y-6">
            {revenueByType.map((item) => (
              <div key={item.type} className="p-5 bg-slate-800/40 border border-slate-700/50 rounded-xl hover:border-amber-500/30 transition-all">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <p className="font-bold text-white text-lg">{item.type} Rooms</p>
                    <p className="text-xs text-slate-400 font-medium mt-1">{item.occupied}/{item.count} occupied</p>
                  </div>
                  <p className="text-xl font-black text-amber-500">{formatPrice(item.revenue)}</p>
                </div>
                <div className="h-2.5 bg-slate-900/80 rounded-full overflow-hidden shadow-inner">
                  <div 
                    className="h-full bg-gradient-to-r from-amber-500 to-amber-600 rounded-full transition-all duration-1000 shadow-[0_0_10px_rgba(245,158,11,0.4)]" 
                    style={{ width: `${item.count > 0 ? (item.occupied / item.count) * 100 : 0}%` }} 
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Payment Status Summary */}
        <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-6 backdrop-blur-sm">
          <h3 className="text-xl font-semibold text-white mb-6">Payment Status</h3>
          <div className="space-y-5">
            <div className="flex items-center justify-between p-6 bg-green-500/5 border border-green-500/20 rounded-xl relative group">
              <div className="absolute inset-0 bg-green-500/5 blur-xl opacity-0 group-hover:opacity-100 transition-opacity" />
              <div className="relative">
                <p className="font-bold text-white text-lg">Confirmed Payments</p>
                <p className="text-xs text-slate-400 mt-1">{payments.filter(p => p.status_pembayaran === 'Confirmed').length} transactions</p>
              </div>
              <p className="text-2xl font-black text-green-400 relative">{formatPrice(totalRevenue)}</p>
            </div>
            
            <div className="flex items-center justify-between p-6 bg-orange-500/5 border border-orange-500/20 rounded-xl relative group">
              <div className="absolute inset-0 bg-orange-500/5 blur-xl opacity-0 group-hover:opacity-100 transition-opacity" />
              <div className="relative">
                <p className="font-bold text-white text-lg">Pending Payments</p>
                <p className="text-xs text-slate-400 mt-1">{payments.filter(p => p.status_pembayaran === 'Pending').length} transactions</p>
              </div>
              <p className="text-2xl font-black text-orange-400 relative">{formatPrice(pendingRevenue)}</p>
            </div>

            <div className="flex items-center justify-between p-6 bg-blue-500/5 border border-blue-500/20 rounded-xl relative group">
              <div className="absolute inset-0 bg-blue-500/5 blur-xl opacity-0 group-hover:opacity-100 transition-opacity" />
              <div className="relative">
                <p className="font-bold text-white text-lg">Total Potential</p>
                <p className="text-xs text-slate-400 mt-1">If fully occupied</p>
              </div>
              <p className="text-2xl font-black text-blue-400 relative">{formatPrice(rooms.reduce((sum, r) => sum + (r.harga_per_bulan || 0), 0))}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
