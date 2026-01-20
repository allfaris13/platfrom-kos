import { TrendingUp, Download, Calendar, DollarSign } from 'lucide-react';
import { BarChart, Bar, PieChart, Pie, Cell, ResponsiveContainer, XAxis, YAxis, CartesianGrid, Tooltip, Legend } from 'recharts';
import { Button } from '@/app/components/ui/button';
import { payments, rooms, tenants } from '@/app/data/mockData';

export function LuxuryReports() {
  const confirmedPayments = payments.filter(p => p.status === 'Confirmed');
  const totalRevenue = confirmedPayments.reduce((sum, p) => sum + p.amount, 0);
  const pendingRevenue = payments
    .filter(p => p.status === 'Pending')
    .reduce((sum, p) => sum + p.amount, 0);

  // Revenue by Room Type Data
  const revenueByType = Array.from(new Set(rooms.map(r => r.type))).map(type => {
    const typeRooms = rooms.filter(r => r.type === type);
    const occupiedTypeRooms = typeRooms.filter(r => r.status === 'Penuh');
    const typeRevenue = occupiedTypeRooms.reduce((sum, r) => sum + r.price, 0);
    
    return {
      type,
      revenue: typeRevenue,
      rooms: typeRooms.length,
      occupied: occupiedTypeRooms.length
    };
  });

  // Tenant Demographics (Age Groups - Mock Data)
  const tenantDemographics = [
    { name: '18-25', value: 35, color: '#f59e0b' },
    { name: '26-35', value: 45, color: '#3b82f6' },
    { name: '36-45', value: 15, color: '#10b981' },
    { name: '45+', value: 5, color: '#8b5cf6' }
  ];

  // Monthly Revenue Comparison
  const monthlyComparison = [
    { month: 'Jan', thisYear: 4200000, lastYear: 3800000 },
    { month: 'Feb', thisYear: 5100000, lastYear: 4500000 },
    { month: 'Mar', thisYear: 4800000, lastYear: 4200000 },
    { month: 'Apr', thisYear: 5400000, lastYear: 4900000 },
    { month: 'May', thisYear: 6200000, lastYear: 5500000 },
    { month: 'Jun', thisYear: 5900000, lastYear: 5200000 }
  ];

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0,
      notation: 'compact'
    }).format(price);
  };

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-slate-800 border border-slate-700 rounded-lg p-3 shadow-xl">
          <p className="text-slate-400 text-xs mb-1">{label}</p>
          {payload.map((entry: any, index: number) => (
            <p key={index} className="text-white font-semibold">
              {entry.name}: {formatPrice(entry.value)}
            </p>
          ))}
        </div>
      );
    }
    return null;
  };

  const handleExport = () => {
    alert('Export functionality would download a PDF/Excel report');
  };

  return (
    <div className="p-8 space-y-8 bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 min-h-screen">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-4xl font-bold bg-gradient-to-r from-amber-400 via-amber-500 to-amber-600 bg-clip-text text-transparent mb-2">
            Laporan Keuangan
          </h1>
          <p className="text-slate-400">Comprehensive financial analytics and reports</p>
        </div>
        <div className="flex items-center gap-3">
          <Button 
            variant="outline"
            className="bg-slate-800/50 border-slate-700 text-white hover:bg-slate-800"
          >
            <Calendar className="size-4 mr-2" />
            Last 6 Months
          </Button>
          <Button 
            onClick={handleExport}
            className="bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-white shadow-lg shadow-amber-500/20"
          >
            <Download className="size-4 mr-2" />
            Export Report
          </Button>
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="group relative overflow-hidden bg-gradient-to-br from-green-500/10 to-green-600/10 border border-green-500/20 rounded-2xl p-6 hover:shadow-2xl hover:shadow-green-500/10 transition-all">
          <div className="absolute top-0 right-0 w-24 h-24 bg-gradient-to-br from-green-500/20 to-transparent rounded-full blur-2xl" />
          <div className="relative">
            <div className="p-3 bg-green-500/20 rounded-xl w-fit mb-4">
              <DollarSign className="size-6 text-green-400" />
            </div>
            <p className="text-slate-400 text-sm mb-1">Total Revenue</p>
            <p className="text-3xl font-bold text-white mb-1">{formatPrice(totalRevenue)}</p>
            <p className="text-xs text-green-400">+12.5% from last month</p>
          </div>
        </div>

        <div className="group relative overflow-hidden bg-gradient-to-br from-orange-500/10 to-orange-600/10 border border-orange-500/20 rounded-2xl p-6 hover:shadow-2xl hover:shadow-orange-500/10 transition-all">
          <div className="absolute top-0 right-0 w-24 h-24 bg-gradient-to-br from-orange-500/20 to-transparent rounded-full blur-2xl" />
          <div className="relative">
            <div className="p-3 bg-orange-500/20 rounded-xl w-fit mb-4">
              <TrendingUp className="size-6 text-orange-400" />
            </div>
            <p className="text-slate-400 text-sm mb-1">Pending Revenue</p>
            <p className="text-3xl font-bold text-white mb-1">{formatPrice(pendingRevenue)}</p>
            <p className="text-xs text-orange-400">Awaiting confirmation</p>
          </div>
        </div>

        <div className="group relative overflow-hidden bg-gradient-to-br from-blue-500/10 to-blue-600/10 border border-blue-500/20 rounded-2xl p-6 hover:shadow-2xl hover:shadow-blue-500/10 transition-all">
          <div className="absolute top-0 right-0 w-24 h-24 bg-gradient-to-br from-blue-500/20 to-transparent rounded-full blur-2xl" />
          <div className="relative">
            <div className="p-3 bg-blue-500/20 rounded-xl w-fit mb-4">
              <TrendingUp className="size-6 text-blue-400" />
            </div>
            <p className="text-slate-400 text-sm mb-1">Avg. Room Rate</p>
            <p className="text-3xl font-bold text-white mb-1">
              {formatPrice(rooms.reduce((sum, r) => sum + r.price, 0) / rooms.length)}
            </p>
            <p className="text-xs text-blue-400">Per month</p>
          </div>
        </div>

        <div className="group relative overflow-hidden bg-gradient-to-br from-purple-500/10 to-purple-600/10 border border-purple-500/20 rounded-2xl p-6 hover:shadow-2xl hover:shadow-purple-500/10 transition-all">
          <div className="absolute top-0 right-0 w-24 h-24 bg-gradient-to-br from-purple-500/20 to-transparent rounded-full blur-2xl" />
          <div className="relative">
            <div className="p-3 bg-purple-500/20 rounded-xl w-fit mb-4">
              <TrendingUp className="size-6 text-purple-400" />
            </div>
            <p className="text-slate-400 text-sm mb-1">Occupancy Rate</p>
            <p className="text-3xl font-bold text-white mb-1">
              {Math.round((rooms.filter(r => r.status === 'Penuh').length / rooms.length) * 100)}%
            </p>
            <p className="text-xs text-purple-400">{rooms.filter(r => r.status === 'Penuh').length}/{rooms.length} rooms</p>
          </div>
        </div>
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
        {/* Revenue by Room Type - Bar Chart */}
        <div className="bg-gradient-to-br from-slate-900 to-slate-900/50 border border-slate-800 rounded-2xl p-6">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="text-xl font-semibold text-white mb-1">Revenue by Room Type</h3>
              <p className="text-sm text-slate-400">Monthly revenue breakdown</p>
            </div>
          </div>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={revenueByType}>
                <defs>
                  <linearGradient id="barGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#f59e0b" stopOpacity={0.8}/>
                    <stop offset="95%" stopColor="#f59e0b" stopOpacity={0.3}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#334155" opacity={0.2} />
                <XAxis 
                  dataKey="type" 
                  stroke="#64748b"
                  style={{ fontSize: '12px' }}
                />
                <YAxis 
                  stroke="#64748b"
                  style={{ fontSize: '12px' }}
                  tickFormatter={(value) => formatPrice(value)}
                />
                <Tooltip content={<CustomTooltip />} />
                <Bar 
                  dataKey="revenue" 
                  fill="url(#barGradient)" 
                  radius={[8, 8, 0, 0]}
                  maxBarSize={80}
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Tenant Demographics - Pie Chart */}
        <div className="bg-gradient-to-br from-slate-900 to-slate-900/50 border border-slate-800 rounded-2xl p-6">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="text-xl font-semibold text-white mb-1">Tenant Demographics</h3>
              <p className="text-sm text-slate-400">Age distribution</p>
            </div>
          </div>
          <div className="h-80 flex items-center">
            <div className="w-1/2">
              <ResponsiveContainer width="100%" height={280}>
                <PieChart>
                  <Pie
                    data={tenantDemographics}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    outerRadius={100}
                    dataKey="value"
                  >
                    {tenantDemographics.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: '#1e293b', 
                      border: '1px solid #334155',
                      borderRadius: '8px'
                    }}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>
            <div className="w-1/2 space-y-3">
              {tenantDemographics.map((item) => (
                <div key={item.name} className="flex items-center justify-between p-3 bg-slate-800/30 rounded-lg border border-slate-700/50">
                  <div className="flex items-center gap-3">
                    <div 
                      className="size-4 rounded-full"
                      style={{ backgroundColor: item.color }}
                    />
                    <span className="text-sm text-slate-300">{item.name} years</span>
                  </div>
                  <span className="text-sm font-semibold text-white">{item.value}%</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Monthly Comparison */}
      <div className="bg-gradient-to-br from-slate-900 to-slate-900/50 border border-slate-800 rounded-2xl p-6">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h3 className="text-xl font-semibold text-white mb-1">Year-over-Year Comparison</h3>
            <p className="text-sm text-slate-400">Revenue performance comparison</p>
          </div>
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <div className="size-3 bg-amber-500 rounded-full" />
              <span className="text-xs text-slate-400">This Year</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="size-3 bg-blue-500 rounded-full" />
              <span className="text-xs text-slate-400">Last Year</span>
            </div>
          </div>
        </div>
        <div className="h-80">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={monthlyComparison}>
              <CartesianGrid strokeDasharray="3 3" stroke="#334155" opacity={0.2} />
              <XAxis 
                dataKey="month" 
                stroke="#64748b"
                style={{ fontSize: '12px' }}
              />
              <YAxis 
                stroke="#64748b"
                style={{ fontSize: '12px' }}
                tickFormatter={(value) => formatPrice(value)}
              />
              <Tooltip content={<CustomTooltip />} />
              <Bar 
                dataKey="thisYear" 
                name="This Year"
                fill="#f59e0b" 
                radius={[8, 8, 0, 0]}
                maxBarSize={40}
              />
              <Bar 
                dataKey="lastYear" 
                name="Last Year"
                fill="#3b82f6" 
                radius={[8, 8, 0, 0]}
                maxBarSize={40}
              />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Detailed Breakdown */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Revenue Breakdown */}
        <div className="bg-gradient-to-br from-slate-900 to-slate-900/50 border border-slate-800 rounded-2xl p-6">
          <h3 className="text-xl font-semibold text-white mb-4">Revenue Breakdown</h3>
          <div className="space-y-4">
            {revenueByType.map((item) => (
              <div key={item.type} className="p-4 bg-slate-800/30 border border-slate-700/50 rounded-xl">
                <div className="flex items-center justify-between mb-3">
                  <div>
                    <p className="font-semibold text-white">{item.type} Rooms</p>
                    <p className="text-xs text-slate-400">{item.occupied}/{item.rooms} occupied</p>
                  </div>
                  <p className="text-lg font-bold text-amber-400">{formatPrice(item.revenue)}</p>
                </div>
                <div className="h-2 bg-slate-800 rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-gradient-to-r from-amber-500 to-amber-600 rounded-full transition-all duration-500"
                    style={{ width: `${(item.occupied / item.rooms) * 100}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Payment Status */}
        <div className="bg-gradient-to-br from-slate-900 to-slate-900/50 border border-slate-800 rounded-2xl p-6">
          <h3 className="text-xl font-semibold text-white mb-4">Payment Status</h3>
          <div className="space-y-4">
            <div className="flex items-center justify-between p-5 bg-gradient-to-r from-green-500/10 to-green-600/10 border border-green-500/20 rounded-xl">
              <div>
                <p className="font-semibold text-white mb-1">Confirmed Payments</p>
                <p className="text-sm text-slate-400">
                  {payments.filter(p => p.status === 'Confirmed').length} transactions
                </p>
              </div>
              <div className="text-right">
                <p className="text-2xl font-bold text-green-400">
                  {formatPrice(totalRevenue)}
                </p>
              </div>
            </div>
            
            <div className="flex items-center justify-between p-5 bg-gradient-to-r from-orange-500/10 to-orange-600/10 border border-orange-500/20 rounded-xl">
              <div>
                <p className="font-semibold text-white mb-1">Pending Payments</p>
                <p className="text-sm text-slate-400">
                  {payments.filter(p => p.status === 'Pending').length} transactions
                </p>
              </div>
              <div className="text-right">
                <p className="text-2xl font-bold text-orange-400">
                  {formatPrice(pendingRevenue)}
                </p>
              </div>
            </div>

            <div className="flex items-center justify-between p-5 bg-gradient-to-r from-blue-500/10 to-blue-600/10 border border-blue-500/20 rounded-xl">
              <div>
                <p className="font-semibold text-white mb-1">Total Potential</p>
                <p className="text-sm text-slate-400">If fully occupied</p>
              </div>
              <div className="text-right">
                <p className="text-2xl font-bold text-blue-400">
                  {formatPrice(rooms.reduce((sum, r) => sum + r.price, 0))}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
