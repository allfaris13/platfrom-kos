import { TrendingUp, Users, Home, CreditCard, ArrowUpRight } from 'lucide-react';
import { LineChart, Line, PieChart, Pie, Cell, ResponsiveContainer, XAxis, YAxis, CartesianGrid, Tooltip } from 'recharts';
import { rooms, tenants, payments } from '@/app/data/mockData';

interface Room {
  status: string;
  price?: number;
}

interface Tenant {
  status: string;
}

interface Payment {
  status: string;
  amount: number;
}

interface TooltipPayload {
  payload: {
    month: string;
  };
  value: number;
}

interface CustomTooltipProps {
  active?: boolean;
  payload?: TooltipPayload[];
}

function CustomTooltip({ active, payload }: CustomTooltipProps) {
  if (active && payload && payload.length) {
    const formatPrice = (price: number) => {
      return new Intl.NumberFormat('id-ID', {
        style: 'currency',
        currency: 'IDR',
        minimumFractionDigits: 0,
        notation: 'compact'
      }).format(price);
    };
    return (
      <div className="bg-slate-800 border border-slate-700 rounded-lg p-3 shadow-xl">
        <p className="text-slate-400 text-xs mb-1">{payload[0].payload.month}</p>
        <p className="text-white font-semibold">{formatPrice(payload[0].value)}</p>
      </div>
    );
  }
  return null;
}

export function LuxuryDashboard() {
  const availableRooms = (rooms as Room[]).filter(r => r.status === 'Tersedia').length;
  const occupiedRooms = (rooms as Room[]).filter(r => r.status === 'Penuh').length;
  const activeTenants = (tenants as Tenant[]).filter(t => t.status === 'Active').length;
  const pendingPayments = (payments as Payment[]).filter(p => p.status === 'Pending').length;
  const totalRevenue = (payments as Payment[])
    .filter(p => p.status === 'Confirmed')
    .reduce((sum: number, p: Payment) => sum + p.amount, 0);

  // Revenue trend data (6 months)
  const revenueData = [
    { month: 'Jul', revenue: 4200000, target: 4000000 },
    { month: 'Aug', revenue: 5100000, target: 4500000 },
    { month: 'Sep', revenue: 4800000, target: 5000000 },
    { month: 'Oct', revenue: 5400000, target: 5200000 },
    { month: 'Nov', revenue: 6200000, target: 5800000 },
    { month: 'Dec', revenue: 5900000, target: 6000000 }
  ];

  // Occupancy data for donut chart
  const occupancyData = [
    { name: 'Tersedia', value: availableRooms, color: '#10b981' },
    { name: 'Terisi', value: occupiedRooms, color: '#f59e0b' }
  ];

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0,
      notation: 'compact'
    }).format(price);
  };

  return (
    <div className="p-8 space-y-8 bg-linear-to-br from-slate-950 via-slate-900 to-slate-950 min-h-screen">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-4xl font-bold bg-gradient-to-r from-amber-400 via-amber-500 to-amber-600 bg-clip-text text-transparent mb-2">
            Dashboard Overview
          </h1>
          <p className="text-slate-400">Welcome back, Administrator</p>
        </div>
        <div className="flex items-center gap-3">
          <div className="px-4 py-2 bg-slate-800/50 border border-slate-700 rounded-lg">
            <p className="text-xs text-slate-500">Last updated</p>
            <p className="text-sm text-white font-medium">Just now</p>
          </div>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6">
        {/* Total Revenue */}
        <div className="group relative overflow-hidden bg-gradient-to-br from-amber-500/10 to-amber-600/10 border border-amber-500/20 rounded-2xl p-6 hover:shadow-2xl hover:shadow-amber-500/10 transition-all duration-300">
          <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-amber-500/20 to-transparent rounded-full blur-3xl" />
          <div className="relative">
            <div className="flex items-start justify-between mb-4">
              <div className="p-3 bg-amber-500/20 rounded-xl">
                <TrendingUp className="size-6 text-amber-400" />
              </div>
              <div className="flex items-center gap-1 text-green-400 text-sm">
                <ArrowUpRight className="size-4" />
                <span className="font-medium">+12.5%</span>
              </div>
            </div>
            <p className="text-slate-400 text-sm mb-1">Total Revenue</p>
            <p className="text-3xl font-bold text-white mb-1">{formatPrice(totalRevenue)}</p>
            <p className="text-xs text-slate-500">This month</p>
          </div>
        </div>

        {/* Active Tenants */}
        <div className="group relative overflow-hidden bg-gradient-to-br from-blue-500/10 to-blue-600/10 border border-blue-500/20 rounded-2xl p-6 hover:shadow-2xl hover:shadow-blue-500/10 transition-all duration-300">
          <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-blue-500/20 to-transparent rounded-full blur-3xl" />
          <div className="relative">
            <div className="flex items-start justify-between mb-4">
              <div className="p-3 bg-blue-500/20 rounded-xl">
                <Users className="size-6 text-blue-400" />
              </div>
              <div className="flex items-center gap-1 text-green-400 text-sm">
                <ArrowUpRight className="size-4" />
                <span className="font-medium">+3</span>
              </div>
            </div>
            <p className="text-slate-400 text-sm mb-1">Active Tenants</p>
            <p className="text-3xl font-bold text-white mb-1">{activeTenants}</p>
            <p className="text-xs text-slate-500">{tenants.length} total registrations</p>
          </div>
        </div>

        {/* Available Rooms */}
        <div className="group relative overflow-hidden bg-gradient-to-br from-green-500/10 to-green-600/10 border border-green-500/20 rounded-2xl p-6 hover:shadow-2xl hover:shadow-green-500/10 transition-all duration-300">
          <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-green-500/20 to-transparent rounded-full blur-3xl" />
          <div className="relative">
            <div className="flex items-start justify-between mb-4">
              <div className="p-3 bg-green-500/20 rounded-xl">
                <Home className="size-6 text-green-400" />
              </div>
              <div className="px-2 py-1 bg-green-500/20 rounded-lg">
                <span className="text-xs text-green-400 font-medium">Available</span>
              </div>
            </div>
            <p className="text-slate-400 text-sm mb-1">Available Rooms</p>
            <p className="text-3xl font-bold text-white mb-1">{availableRooms}</p>
            <p className="text-xs text-slate-500">Out of {rooms.length} total rooms</p>
          </div>
        </div>

        {/* Pending Payments */}
        <div className="group relative overflow-hidden bg-gradient-to-br from-orange-500/10 to-orange-600/10 border border-orange-500/20 rounded-2xl p-6 hover:shadow-2xl hover:shadow-orange-500/10 transition-all duration-300">
          <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-orange-500/20 to-transparent rounded-full blur-3xl" />
          <div className="relative">
            <div className="flex items-start justify-between mb-4">
              <div className="p-3 bg-orange-500/20 rounded-xl">
                <CreditCard className="size-6 text-orange-400" />
              </div>
              <div className="px-2 py-1 bg-orange-500/20 rounded-lg">
                <span className="text-xs text-orange-400 font-medium">Action Required</span>
              </div>
            </div>
            <p className="text-slate-400 text-sm mb-1">Pending Payments</p>
            <p className="text-3xl font-bold text-white mb-1">{pendingPayments}</p>
            <p className="text-xs text-slate-500">Need confirmation</p>
          </div>
        </div>
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        {/* Revenue Trend Chart */}
        <div className="xl:col-span-2 bg-gradient-to-br from-slate-900 to-slate-900/50 border border-slate-800 rounded-2xl p-6">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="text-xl font-semibold text-white mb-1">Monthly Revenue Trend</h3>
              <p className="text-sm text-slate-400">Last 6 months performance</p>
            </div>
            <div className="flex items-center gap-2">
              <div className="flex items-center gap-2">
                <div className="size-3 bg-amber-500 rounded-full" />
                <span className="text-xs text-slate-400">Revenue</span>
              </div>
              <div className="flex items-center gap-2 ml-4">
                <div className="size-3 bg-blue-500 rounded-full" />
                <span className="text-xs text-slate-400">Target</span>
              </div>
            </div>
          </div>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={revenueData}>
                <defs>
                  <linearGradient id="revenueGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#f59e0b" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#f59e0b" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#334155" opacity={0.2} />
                <XAxis 
                  dataKey="month" 
                  stroke="#64748b"
                  style={{ fontSize: '12px' }}
                />
                <YAxis 
                  stroke="#64748b"
                  style={{ fontSize: '12px' }}
                  tickFormatter={(value: any) => formatPrice(value)}
                />
                <Tooltip content={<CustomTooltip />} />
                <Line 
                  type="monotone" 
                  dataKey="revenue" 
                  stroke="#f59e0b" 
                  strokeWidth={3}
                  dot={{ fill: '#f59e0b', r: 6 }}
                  activeDot={{ r: 8 }}
                  fill="url(#revenueGradient)"
                />
                <Line 
                  type="monotone" 
                  dataKey="target" 
                  stroke="#3b82f6" 
                  strokeWidth={2}
                  strokeDasharray="5 5"
                  dot={{ fill: '#3b82f6', r: 4 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Occupancy Donut Chart */}
        <div className="bg-gradient-to-br from-slate-900 to-slate-900/50 border border-slate-800 rounded-2xl p-6">
          <div className="mb-6">
            <h3 className="text-xl font-semibold text-white mb-1">Occupancy Rate</h3>
            <p className="text-sm text-slate-400">Current room status</p>
          </div>
          <div className="h-64 flex items-center justify-center">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={occupancyData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={90}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {occupancyData.map((entry, index) => (
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
          <div className="grid grid-cols-2 gap-4 mt-6">
            <div className="text-center p-4 bg-green-500/10 border border-green-500/20 rounded-xl">
              <p className="text-2xl font-bold text-green-400">{availableRooms}</p>
              <p className="text-xs text-slate-400 mt-1">Tersedia</p>
            </div>
            <div className="text-center p-4 bg-orange-500/10 border border-orange-500/20 rounded-xl">
              <p className="text-2xl font-bold text-orange-400">{occupiedRooms}</p>
              <p className="text-xs text-slate-400 mt-1">Terisi</p>
            </div>
          </div>
        </div>
      </div>

      {/* Recent Activity & Quick Stats */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
        {/* Recent Registrations */}
        <div className="bg-gradient-to-br from-slate-900 to-slate-900/50 border border-slate-800 rounded-2xl p-6">
          <h3 className="text-xl font-semibold text-white mb-4">New Registrations</h3>
          <div className="space-y-3">
            {tenants.slice(0, 4).map((tenant) => (
              <div key={tenant.id} className="flex items-center gap-4 p-4 bg-slate-800/30 border border-slate-700/50 rounded-xl hover:bg-slate-800/50 transition-all duration-200">
                <div className="size-12 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl flex items-center justify-center flex-shrink-0">
                  <span className="text-lg font-semibold text-white">
                    {tenant.name.charAt(0)}
                  </span>
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-white truncate">{tenant.name}</p>
                  <p className="text-sm text-slate-400 truncate">{tenant.roomName}</p>
                </div>
                <span className={`px-3 py-1 rounded-full text-xs font-medium whitespace-nowrap ${
                  tenant.status === 'Active' 
                    ? 'bg-green-500/20 text-green-400 border border-green-500/30' 
                    : tenant.status === 'Expired'
                    ? 'bg-red-500/20 text-red-400 border border-red-500/30'
                    : 'bg-yellow-500/20 text-yellow-400 border border-yellow-500/30'
                }`}>
                  {tenant.status}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Progress Metrics */}
        <div className="bg-gradient-to-br from-slate-900 to-slate-900/50 border border-slate-800 rounded-2xl p-6">
          <h3 className="text-xl font-semibold text-white mb-4">Performance Metrics</h3>
          <div className="space-y-5">
            <div>
              <div className="flex justify-between items-center mb-2">
                <span className="text-sm text-slate-400">Occupancy Rate</span>
                <span className="text-sm font-semibold text-white">
                  {Math.round((occupiedRooms / rooms.length) * 100)}%
                </span>
              </div>
              <div className="h-2.5 bg-slate-800 rounded-full overflow-hidden">
                <div 
                  className="h-full bg-gradient-to-r from-amber-500 to-amber-600 rounded-full transition-all duration-500"
                  style={{ width: `${(occupiedRooms / rooms.length) * 100}%` }}
                />
              </div>
            </div>
            
            <div>
              <div className="flex justify-between items-center mb-2">
                <span className="text-sm text-slate-400">Payment Completion</span>
                <span className="text-sm font-semibold text-white">
                  {Math.round((payments.filter(p => p.status === 'Confirmed').length / payments.length) * 100)}%
                </span>
              </div>
              <div className="h-2.5 bg-slate-800 rounded-full overflow-hidden">
                <div 
                  className="h-full bg-gradient-to-r from-green-500 to-green-600 rounded-full transition-all duration-500"
                  style={{ width: `${(payments.filter(p => p.status === 'Confirmed').length / payments.length) * 100}%` }}
                />
              </div>
            </div>

            <div>
              <div className="flex justify-between items-center mb-2">
                <span className="text-sm text-slate-400">Tenant Satisfaction</span>
                <span className="text-sm font-semibold text-white">95%</span>
              </div>
              <div className="h-2.5 bg-slate-800 rounded-full overflow-hidden">
                <div 
                  className="h-full bg-gradient-to-r from-blue-500 to-blue-600 rounded-full transition-all duration-500"
                  style={{ width: '95%' }}
                />
              </div>
            </div>

            <div>
              <div className="flex justify-between items-center mb-2">
                <span className="text-sm text-slate-400">Monthly Target</span>
                <span className="text-sm font-semibold text-white">88%</span>
              </div>
              <div className="h-2.5 bg-slate-800 rounded-full overflow-hidden">
                <div 
                  className="h-full bg-gradient-to-r from-purple-500 to-purple-600 rounded-full transition-all duration-500"
                  style={{ width: '88%' }}
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
