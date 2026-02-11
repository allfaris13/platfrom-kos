"use client";

import { useState, useEffect } from 'react';
import { TrendingUp, Download, Calendar, DollarSign, Loader2, BarChart3, Activity } from 'lucide-react';
import { BarChart, Bar, PieChart, Pie, Cell, ResponsiveContainer, XAxis, YAxis, CartesianGrid, Tooltip, Legend } from 'recharts';
import { api } from '@/app/services/api';
import { Button } from '@/app/components/ui/button';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

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
  created_at: string;
  pemesanan?: {
    penyewa?: {
      nama_lengkap: string;
    };
    kamar?: {
      tipe_kamar: string;
      nomor_kamar: string;
    };
  };
}

interface DashboardStats {
  monthly_trend: { month: string; revenue: number }[];
  demographics: { name: string; value: number; color: string }[];
  type_breakdown: { type: string; revenue: number; count: number; occupied: number }[];
  total_revenue: number;
  pending_revenue: number;
  pending_payments: number;
  active_tenants: number;
  occupied_rooms: number;
  available_rooms: number;
  potential_revenue: number;
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
          api.getAllPayments(),
          api.getRooms(),
          api.getDashboardStats()
        ]);
        setPayments(pData as Payment[]);
        setRooms(rData as any); // Room interface might need adjustment or just use any if simple
        setStats(sData as DashboardStats);
      } catch (e) {
        console.error("Failed to fetch reports data:", e);
      } finally {
        setIsLoading(false);
      }
    };
    void fetchData();
  }, []);

  // Use backend-calculated values
  const totalRevenue = stats?.total_revenue || 0;
  const pendingRevenue = stats?.pending_revenue || 0;
  const potentialRevenue = stats?.potential_revenue || 0;

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

  const monthlyComparison = [
    { month: 'Jan', thisYear: 4200000, lastYear: 3800000 },
    { month: 'Feb', thisYear: 5100000, lastYear: 4500000 },
    { month: 'Mar', thisYear: 4800000, lastYear: 4200000 },
    { month: 'Apr', thisYear: 5400000, lastYear: 4900000 },
    { month: 'May', thisYear: 6200000, lastYear: 5500000 },
    { month: 'Jun', thisYear: 5900000, lastYear: 5200000 }
  ];

  const handleExport = () => {
    const doc = new jsPDF();

    const tableColumn = ["Date", "Tenant Name", "Room Type", "Room No", "Amount", "Status"];
    const tableRows: any[] = [];

    payments.forEach(p => {
      const rowData = [
        new Date(p.created_at).toLocaleDateString("id-ID"),
        p.pemesanan?.penyewa?.nama_lengkap || "Unknown",
        p.pemesanan?.kamar?.tipe_kamar || "Unknown",
        p.pemesanan?.kamar?.nomor_kamar || "Unknown",
        formatPrice(p.jumlah_bayar),
        p.status_pembayaran
      ];
      tableRows.push(rowData);
    });

    const dateStr = new Date().toISOString().split('T')[0];
    
    // Add title
    doc.setFontSize(18);
    doc.text("Financial Report", 14, 22);
    doc.setFontSize(11);
    doc.text(`Date: ${dateStr}`, 14, 30);
    doc.setTextColor(100);

    // Add table using autoTable
    autoTable(doc, {
      head: [tableColumn],
      body: tableRows,
      startY: 40,
      theme: 'grid',
      headStyles: { fillColor: [245, 158, 11] }, // Amber 500
      styles: { fontSize: 8 },
    });

    doc.save(`financial_report_${dateStr}.pdf`);
  };

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
    <div className="p-4 md:p-8 space-y-6 md:space-y-8 bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 min-h-screen">
      {/* Header - Responsif stack di mobile */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-amber-400 via-amber-500 to-amber-600 bg-clip-text text-transparent mb-2">
            Laporan Keuangan
          </h1>
          <p className="text-slate-400 text-sm md:text-base">Comprehensive financial analytics and reports</p>
        </div>
        <div className="flex items-center gap-2 md:gap-3">
          <Button
            variant="outline"
            className="flex-1 sm:flex-none bg-slate-800/50 border-slate-700 text-white hover:bg-slate-800 text-xs md:text-sm"
          >
            <Calendar className="size-4 mr-2" />
            Last 6 Months
          </Button>
          <Button
            onClick={handleExport}
            className="flex-1 sm:flex-none bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-white shadow-lg shadow-amber-500/20 text-xs md:text-sm"
          >
            <Download className="size-4 mr-2" />
            Export Report
          </Button>
        </div>
      </div>

      {/* Key Metrics - Grid responsif (2 kolom mobile, 4 kolom desktop) */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 md:gap-6">
        <div className="group relative overflow-hidden bg-gradient-to-br from-green-500/10 to-green-600/10 border border-green-500/20 rounded-2xl p-4 md:p-6 hover:shadow-2xl hover:shadow-green-500/10 transition-all">
          <div className="absolute top-0 right-0 w-24 h-24 bg-gradient-to-br from-green-500/20 to-transparent rounded-full blur-2xl" />
          <div className="relative">
            <div className="p-2 md:p-3 bg-green-500/20 rounded-xl w-fit mb-2 md:mb-4">
              <DollarSign className="size-4 md:size-6 text-green-400" />
            </div>
            <p className="text-slate-400 text-[10px] md:text-sm mb-1">Total Revenue</p>
            <p className="text-xl md:text-3xl font-bold text-white mb-0.5 md:mb-1">{formatPrice(totalRevenue)}</p>
            <p className="text-[10px] text-green-400">+12.5% from last mth</p>
          </div>
        </div>

        <div className="group relative overflow-hidden bg-gradient-to-br from-orange-500/10 to-orange-600/10 border border-orange-500/20 rounded-2xl p-4 md:p-6 hover:shadow-2xl hover:shadow-orange-500/10 transition-all">
          <div className="absolute top-0 right-0 w-24 h-24 bg-gradient-to-br from-orange-500/20 to-transparent rounded-full blur-2xl" />
          <div className="relative">
            <div className="p-2 md:p-3 bg-orange-500/20 rounded-xl w-fit mb-2 md:mb-4">
              <TrendingUp className="size-4 md:size-6 text-orange-400" />
            </div>
            <p className="text-slate-400 text-[10px] md:text-sm mb-1">Pending rev.</p>
            <p className="text-xl md:text-3xl font-bold text-white mb-0.5 md:mb-1">{formatPrice(pendingRevenue)}</p>
            <p className="text-[10px] text-orange-400">Wait confirm</p>
          </div>
        </div>

        <div className="group relative overflow-hidden bg-gradient-to-br from-blue-500/10 to-blue-600/10 border border-blue-500/20 rounded-2xl p-4 md:p-6 hover:shadow-2xl hover:shadow-blue-500/10 transition-all">
          <div className="absolute top-0 right-0 w-24 h-24 bg-gradient-to-br from-blue-500/20 to-transparent rounded-full blur-2xl" />
          <div className="relative">
            <div className="p-2 md:p-3 bg-blue-500/20 rounded-xl w-fit mb-2 md:mb-4">
              <BarChart3 className="size-4 md:size-6 text-blue-400" />
            </div>
            <p className="text-slate-400 text-[10px] md:text-sm mb-1">Avg. Rate</p>
            <p className="text-xl md:text-3xl font-bold text-white mb-0.5 md:mb-1">
              {formatPrice(rooms.length > 0 ? rooms.reduce((sum, r) => sum + (r.harga_per_bulan || 0), 0) / rooms.length : 0)}
            </p>
            <p className="text-[10px] text-blue-400">Per month</p>
          </div>
        </div>

        <div className="group relative overflow-hidden bg-gradient-to-br from-purple-500/10 to-purple-600/10 border border-purple-500/20 rounded-2xl p-4 md:p-6 hover:shadow-2xl hover:shadow-purple-500/10 transition-all">
          <div className="absolute top-0 right-0 w-24 h-24 bg-gradient-to-br from-purple-500/20 to-transparent rounded-full blur-2xl" />
          <div className="relative">
            <div className="p-2 md:p-3 bg-purple-500/20 rounded-xl w-fit mb-2 md:mb-4">
              <Activity className="size-4 md:size-6 text-purple-400" />
            </div>
            <p className="text-slate-400 text-[10px] md:text-sm mb-1">Occupancy</p>
            <p className="text-xl md:text-3xl font-bold text-white mb-0.5 md:mb-1">
              {rooms.length > 0 ? Math.round((rooms.filter(r => r.status === 'Penuh').length / rooms.length) * 100) : 0}%
            </p>
            <p className="text-[10px] text-purple-400">{rooms.filter(r => r.status === 'Penuh').length}/{rooms.length} rooms</p>
          </div>
        </div>
      </div>

      {/* Charts Section - Stack di mobile, grid di desktop */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
        {/* Revenue by Room Type */}
        <div className="bg-gradient-to-br from-slate-900 to-slate-900/50 border border-slate-800 rounded-2xl p-4 md:p-6">
          <div className="mb-6">
            <h3 className="text-xl font-semibold text-white mb-1">Revenue by Room Type</h3>
            <p className="text-sm text-slate-400">Monthly revenue breakdown</p>
          </div>
          <div className="h-64 md:h-80">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={revenueByType}>
                <defs>
                  <linearGradient id="barGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#f59e0b" stopOpacity={0.8} />
                    <stop offset="95%" stopColor="#f59e0b" stopOpacity={0.3} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#334155" opacity={0.2} vertical={false} />
                <XAxis dataKey="type" stroke="#64748b" style={{ fontSize: '10px' }} tickLine={false} axisLine={false} />
                <YAxis stroke="#64748b" style={{ fontSize: '10px' }} tickLine={false} axisLine={false} tickFormatter={(value) => formatPrice(value)} />
                <Tooltip content={<CustomTooltip />} />
                <Bar dataKey="revenue" fill="url(#barGradient)" radius={[6, 6, 0, 0]} maxBarSize={60} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Tenant Demographics - Pie Chart Responsif */}
        <div className="bg-gradient-to-br from-slate-900 to-slate-900/50 border border-slate-800 rounded-2xl p-4 md:p-6">
          <div className="mb-6">
            <h3 className="text-xl font-semibold text-white mb-1">Tenant Demographics</h3>
            <p className="text-sm text-slate-400">Age distribution</p>
          </div>
          <div className="flex flex-col sm:flex-row items-center gap-6">
            <div className="w-full sm:w-1/2 h-64">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={tenantDemographics}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={80}
                    dataKey="value"
                    paddingAngle={5}
                  >
                    {tenantDemographics.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} stroke="none" />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{ backgroundColor: '#1e293b', border: '1px solid #334155', borderRadius: '8px' }}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>
            <div className="w-full sm:w-1/2 space-y-2 md:space-y-3">
              {tenantDemographics.map((item) => (
                <div key={item.name} className="flex items-center justify-between p-3 bg-slate-800/30 rounded-lg border border-slate-700/50">
                  <div className="flex items-center gap-3">
                    <div className="size-3 rounded-full" style={{ backgroundColor: item.color }} />
                    <span className="text-xs md:text-sm text-slate-300">{item.name} years</span>
                  </div>
                  <span className="text-sm font-semibold text-white">{item.value}%</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Year-over-Year Comparison */}
      <div className="bg-gradient-to-br from-slate-900 to-slate-900/50 border border-slate-800 rounded-2xl p-4 md:p-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
          <div>
            <h3 className="text-xl font-semibold text-white mb-1">Monthly Revenue Trend</h3>
            <p className="text-sm text-slate-400">Last 6 months performance</p>
          </div>
          <div className="flex items-center gap-6">
            <div className="flex items-center gap-2">
              <div className="size-3 bg-amber-500 rounded-full" />
              <span className="text-[10px] md:text-xs text-slate-400">This Year</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="size-3 bg-blue-500 rounded-full" />
              <span className="text-[10px] md:text-xs text-slate-400">Last Year</span>
            </div>
          </div>
        </div>
        <div className="h-64 md:h-80">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={monthlyComparison}>
              <CartesianGrid strokeDasharray="3 3" stroke="#334155" opacity={0.1} vertical={false} />
              <XAxis dataKey="month" stroke="#64748b" style={{ fontSize: '10px' }} axisLine={false} tickLine={false} />
              <YAxis stroke="#64748b" style={{ fontSize: '10px' }} axisLine={false} tickLine={false} tickFormatter={(value) => formatPrice(value)} />
              <Tooltip content={<CustomTooltip />} />
              <Bar dataKey="thisYear" name="This Year" fill="#f59e0b" radius={[4, 4, 0, 0]} maxBarSize={30} />
              <Bar dataKey="lastYear" name="Last Year" fill="#3b82f6" radius={[4, 4, 0, 0]} maxBarSize={30} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Detailed Breakdown Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 pb-8">
        <div className="bg-gradient-to-br from-slate-900 to-slate-900/50 border border-slate-800 rounded-2xl p-4 md:p-6">
          <h3 className="text-xl font-semibold text-white mb-4">Revenue Breakdown</h3>
          <div className="space-y-4">
            {revenueByType.map((item) => (
              <div key={item.type} className="p-5 bg-slate-800/40 border border-slate-700/50 rounded-xl hover:border-amber-500/30 transition-all">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <p className="font-semibold text-white text-sm md:text-base">{item.type} Rooms</p>
                    <p className="text-[10px] md:text-xs text-slate-400">{item.occupied}/{item.count || 0} occupied</p>
                  </div>
                  <p className="text-base md:text-lg font-bold text-amber-400">{formatPrice(item.revenue)}</p>
                </div>
                <div className="h-1.5 bg-slate-800 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-amber-500 to-amber-600 rounded-full transition-all duration-1000 shadow-[0_0_10px_rgba(245,158,11,0.4)]"
                    style={{ width: `${item.count > 0 ? (item.occupied / item.count) * 100 : 0}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-gradient-to-br from-slate-900 to-slate-900/50 border border-slate-800 rounded-2xl p-4 md:p-6">
          <h3 className="text-xl font-semibold text-white mb-4">Payment Status</h3>
          <div className="space-y-3">
            <div className="flex items-center justify-between p-4 bg-gradient-to-r from-green-500/10 to-green-600/10 border border-green-500/20 rounded-xl">
              <div>
                <p className="font-semibold text-white text-sm">Confirmed</p>
                <p className="text-[10px] text-slate-400">{payments.filter(p => p.status_pembayaran === 'Confirmed').length} transactions</p>
              </div>
              <p className="text-lg md:text-xl font-bold text-green-400">{formatPrice(totalRevenue)}</p>
            </div>
            <div className="flex items-center justify-between p-4 bg-gradient-to-r from-orange-500/10 to-orange-600/10 border border-orange-500/20 rounded-xl">
              <div>
                <p className="font-semibold text-white text-sm">Pending</p>
                <p className="text-[10px] text-slate-400">{payments.filter(p => p.status_pembayaran === 'Pending').length} transactions</p>
              </div>
              <p className="text-lg md:text-xl font-bold text-orange-400">{formatPrice(pendingRevenue)}</p>
            </div>
            <div className="flex items-center justify-between p-4 bg-gradient-to-r from-blue-500/10 to-blue-600/10 border border-blue-500/20 rounded-xl">
              <div>
                <p className="font-semibold text-white text-sm">Total Potential</p>
                <p className="text-[10px] text-slate-400">If fully occupied</p>
              </div>
              <p className="text-lg md:text-xl font-bold text-blue-400">
                {formatPrice(rooms.reduce((sum, r) => sum + (r.harga_per_bulan || 0), 0))}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
