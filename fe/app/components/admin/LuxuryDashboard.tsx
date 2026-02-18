import {
  TrendingUp,
  Users,
  Home,
  CreditCard,
  ArrowUpRight,
  LogOut,
} from "lucide-react";
import {
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
} from "recharts";
import { motion } from "framer-motion";
import { useEffect, useState } from "react";
import { api, DashboardStats as DashboardStatResponse, Tenant, Payment } from "@/app/services/api";

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
      return new Intl.NumberFormat("id-ID", {
        style: "currency",
        currency: "IDR",
        minimumFractionDigits: 0,
        notation: "compact",
      }).format(price);
    };
    return (
      <div className="bg-slate-800 border border-slate-700 rounded-lg p-3 shadow-xl">
        <p className="text-slate-400 text-xs mb-1">
          {payload[0].payload.month}
        </p>
        <p className="text-white font-semibold">
          {formatPrice(payload[0].value)}
        </p>
      </div>
    );
  }
  return null;
}

export function LuxuryDashboard() {
  const [stats, setStats] = useState<DashboardStatResponse>({
    total_revenue: 0,
    active_tenants: 0,
    available_rooms: 0,
    occupied_rooms: 0,
    pending_payments: 0,
    pending_revenue: 0,
    rejected_payments: 0,
    potential_revenue: 0,
    monthly_trend: [],
    type_breakdown: [],
    demographics: [],
    recent_checkouts: [],
  });
  const [tenants, setTenants] = useState<Tenant[]>([]);
  const [payments, setPayments] = useState<Payment[]>([]);
  const [roomsCount, setRoomsCount] = useState(0);

  useEffect(() => {
    const fetchAllData = async () => {
      try {
        const [statsData, tenantsData, paymentsData, roomsData] =
          await Promise.all([
            api.getDashboardStats(),
            api.getAllTenants(),
            api.getAllPayments(),
            api.getRooms(),
          ]);
        if (Array.isArray(tenantsData)) {
            setTenants(tenantsData);
        } else if (tenantsData && tenantsData.data) {
            setTenants(tenantsData.data);
        }
        setRoomsCount(roomsData.length);
      } catch (error) {
        console.error("Failed to fetch dashboard data:", error);
      }
    };
    fetchAllData();
    const interval = setInterval(fetchAllData, 30000); // refresh setiap 30 detik
    return () => clearInterval(interval);
  }, []);

  // Use real data
  const availableRooms = stats.available_rooms;
  const occupiedRooms = stats.occupied_rooms;
  const activeTenants = stats.active_tenants;
  const pendingPayments = stats.pending_payments;
  const totalRevenue = stats.total_revenue;

  // Historical revenue data from backend
  const revenueData =
    stats.monthly_trend && stats.monthly_trend.length > 0
      ? [...stats.monthly_trend]
          .reverse()
          .map((d) => ({ ...d, target: d.revenue * 0.9 })) // Mock target for visual
      : [
          { month: "Jul", revenue: 4200000, target: 4000000 },
          { month: "Aug", revenue: 5100000, target: 4500000 },
          { month: "Sep", revenue: 4800000, target: 5000000 },
          { month: "Oct", revenue: 5400000, target: 5200000 },
          { month: "Nov", revenue: 6200000, target: 5800000 },
          { month: "Dec", revenue: 5900000, target: 6000000 },
        ];

  // Occupancy data for donut chart
  const occupancyData = [
    { name: "Tersedia", value: Number(availableRooms), color: "#10b981" },
    { name: "Terisi", value: Number(occupiedRooms), color: "#f59e0b" },
  ];

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      minimumFractionDigits: 0,
      notation: "compact",
    }).format(price);
  };

  return (
    <div className="p-4 md:p-8 space-y-6 md:space-y-8 bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 min-h-screen">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl md:text-4xl font-bold bg-gradient-to-r from-amber-400 via-amber-500 to-amber-600 bg-clip-text text-transparent mb-1 md:mb-2">
            Ringkasan Dashboard
          </h1>
          <p className="text-slate-400 text-sm md:text-base">
            Selamat datang kembali, Administrator
          </p>
        </div>
        <div className="flex items-center gap-3">
          <div className="px-3 py-1.5 md:px-4 md:py-2 bg-slate-800/50 border border-slate-700 rounded-lg">
            <p className="text-[10px] md:text-xs text-slate-500 uppercase tracking-wider">
              Terakhir diperbarui
            </p>
            <p className="text-xs md:text-sm text-white font-medium">
              Baru saja
            </p>
          </div>
        </div>
      </div>

      {/* Stats Cards */}
      <motion.div 
        initial="hidden"
        animate="visible"
        variants={{
          hidden: { opacity: 0 },
          visible: {
            opacity: 1,
            transition: { staggerChildren: 0.1 }
          }
        }}
        className="grid grid-cols-2 xl:grid-cols-4 gap-3 md:gap-6"
      >
        {/* Total Revenue */}
        <motion.div 
          variants={{
            hidden: { opacity: 0, y: 20 },
            visible: { opacity: 1, y: 0 }
          }}
          className="group relative overflow-hidden glass-dark rounded-2xl p-4 md:p-6 hover:shadow-2xl hover:shadow-amber-500/10 transition-all duration-300"
        >
          <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-amber-500/10 to-transparent rounded-full blur-3xl" />
          <div className="relative">
            <div className="flex items-start justify-between mb-2 md:mb-4">
              <div className="p-2 md:p-3 bg-amber-500/20 rounded-xl">
                <TrendingUp className="size-4 md:size-6 text-amber-400" />
              </div>
              <div className="flex items-center gap-0.5 md:gap-1 text-green-400 text-[10px] md:text-sm">
                <ArrowUpRight className="size-3 md:size-4" />
                <span className="font-medium">+12.5%</span>
              </div>
            </div>
            <p className="text-slate-400 text-[10px] md:text-sm mb-1">
              Total Pendapatan
            </p>
            <p className="text-xl md:text-3xl font-bold text-white mb-0.5 md:mb-1">
              {formatPrice(totalRevenue)}
            </p>
            <p className="text-[10px] text-slate-500">Bulan ini</p>
          </div>
        </motion.div>

        {/* Active Tenants */}
        <motion.div 
          variants={{
            hidden: { opacity: 0, y: 20 },
            visible: { opacity: 1, y: 0 }
          }}
          className="group relative overflow-hidden glass-dark rounded-2xl p-4 md:p-6 hover:shadow-2xl hover:shadow-blue-500/10 transition-all duration-300"
        >
          <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-blue-500/10 to-transparent rounded-full blur-3xl" />
          <div className="relative">
            <div className="flex items-start justify-between mb-2 md:mb-4">
              <div className="p-2 md:p-3 bg-blue-500/20 rounded-xl">
                <Users className="size-4 md:size-6 text-blue-400" />
              </div>
              <div className="flex items-center gap-0.5 md:gap-1 text-green-400 text-[10px] md:text-sm">
                <ArrowUpRight className="size-3 md:size-4" />
                <span className="font-medium">+3</span>
              </div>
            </div>
            <p className="text-slate-400 text-[10px] md:text-sm mb-1">
              Penyewa Aktif
            </p>
            <p className="text-xl md:text-3xl font-bold text-white mb-0.5 md:mb-1">
              {activeTenants}
            </p>
            <p className="text-[10px] text-slate-500">
              {tenants.length} total pendaftaran
            </p>
          </div>
        </motion.div>

        {/* Available Rooms */}
        <motion.div 
          variants={{
            hidden: { opacity: 0, y: 20 },
            visible: { opacity: 1, y: 0 }
          }}
          className="group relative overflow-hidden glass-dark rounded-2xl p-4 md:p-6 hover:shadow-2xl hover:shadow-green-500/10 transition-all duration-300"
        >
          <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-green-500/10 to-transparent rounded-full blur-3xl" />
          <div className="relative">
            <div className="flex items-start justify-between mb-2 md:mb-4">
              <div className="p-2 md:p-3 bg-green-500/20 rounded-xl">
                <Home className="size-4 md:size-6 text-green-400" />
              </div>
              <div className="px-1.5 md:px-2 py-0.5 md:py-1 bg-green-500/20 rounded-lg">
                <span className="text-[10px] text-green-400 font-medium">
                  Tersedia
                </span>
              </div>
            </div>
            <p className="text-slate-400 text-[10px] md:text-sm mb-1">
              Kamar Tersedia
            </p>
            <p className="text-xl md:text-3xl font-bold text-white mb-0.5 md:mb-1">
              {availableRooms}
            </p>
            <p className="text-[10px] text-slate-500">
              Dari {roomsCount} kamar
            </p>
          </div>
        </motion.div>

        {/* Pending Payments */}
        <motion.div 
          variants={{
            hidden: { opacity: 0, y: 20 },
            visible: { opacity: 1, y: 0 }
          }}
          className="group relative overflow-hidden glass-dark rounded-2xl p-4 md:p-6 hover:shadow-2xl hover:shadow-red-500/10 transition-all duration-300"
        >
          <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-red-500/10 to-transparent rounded-full blur-3xl" />
          <div className="relative">
            <div className="flex items-start justify-between mb-2 md:mb-4">
              <div className="p-2 md:p-3 bg-red-500/20 rounded-xl">
                <CreditCard className="size-4 md:size-6 text-red-400" />
              </div>
              <div className="px-1.5 md:px-2 py-0.5 md:py-1 bg-red-500/20 rounded-lg">
                <span className="text-[10px] text-red-400 font-medium">
                  Perlu Tindakan
                </span>
              </div>
            </div>
            <p className="text-slate-400 text-[10px] md:text-sm mb-1">
              Pembayaran Menunggu
            </p>
            <p className="text-xl md:text-3xl font-bold text-white mb-0.5 md:mb-1">
              {pendingPayments}
            </p>
            <p className="text-[10px] text-slate-500">Perlu konfirmasi</p>
          </div>
        </motion.div>
      </motion.div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        {/* Revenue Trend Chart */}
        <div className="xl:col-span-2 bg-gradient-to-br from-slate-900 to-slate-900/50 border border-slate-800 rounded-2xl p-6">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="text-xl font-semibold text-white mb-1">
                Tren Pendapatan Bulanan
              </h3>
              <p className="text-sm text-slate-400">
                Kinerja 6 bulan terakhir
              </p>
            </div>
            <div className="flex items-center gap-2">
              <div className="flex items-center gap-2">
                <div className="size-3 bg-amber-500 rounded-full" />
                <span className="text-xs text-slate-400">Pendapatan</span>
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
                  <linearGradient
                    id="revenueGradient"
                    x1="0"
                    y1="0"
                    x2="0"
                    y2="1"
                  >
                    <stop offset="5%" stopColor="#f59e0b" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#f59e0b" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid
                  strokeDasharray="3 3"
                  stroke="#334155"
                  opacity={0.2}
                />
                <XAxis
                  dataKey="month"
                  stroke="#64748b"
                  style={{ fontSize: "12px" }}
                />
                <YAxis
                  stroke="#64748b"
                  style={{ fontSize: "12px" }}
                  tickFormatter={(value: number) => formatPrice(value)}
                />
                <Tooltip content={<CustomTooltip />} />
                <Line
                  type="monotone"
                  dataKey="revenue"
                  stroke="#f59e0b"
                  strokeWidth={3}
                  dot={{ fill: "#f59e0b", r: 6 }}
                  activeDot={{ r: 8 }}
                  fill="url(#revenueGradient)"
                />
                <Line
                  type="monotone"
                  dataKey="target"
                  stroke="#3b82f6"
                  strokeWidth={2}
                  strokeDasharray="5 5"
                  dot={{ fill: "#3b82f6", r: 4 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Occupancy Donut Chart */}
        <div className="bg-gradient-to-br from-slate-900 to-slate-900/50 border border-slate-800 rounded-2xl p-6">
          <div className="mb-6">
            <h3 className="text-xl font-semibold text-white mb-1">
              Tingkat Okupansi
            </h3>
            <p className="text-sm text-slate-400">Status kamar saat ini</p>
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
                    backgroundColor: "#1e293b",
                    border: "1px solid #334155",
                    borderRadius: "8px",
                  }}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="grid grid-cols-2 gap-4 mt-6">
            <div className="text-center p-4 bg-green-500/10 border border-green-500/20 rounded-xl">
              <p className="text-2xl font-bold text-green-400">
                {availableRooms}
              </p>
              <p className="text-xs text-slate-400 mt-1">Tersedia</p>
            </div>
            <div className="text-center p-4 bg-orange-500/10 border border-orange-500/20 rounded-xl">
              <p className="text-2xl font-bold text-orange-400">
                {occupiedRooms}
              </p>
              <p className="text-xs text-slate-400 mt-1">Terisi</p>
            </div>
          </div>
        </div>
      </div>

      {/* Recent Activity & Quick Stats */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        {/* Recent Registrations */}
        <div className="bg-gradient-to-br from-slate-900 to-slate-900/50 border border-slate-800 rounded-2xl p-6">
          <h3 className="text-xl font-semibold text-white mb-4">
            Pendaftaran Baru
          </h3>
          <div className="space-y-3">
            {tenants.length > 0 ? (
              tenants.slice(0, 4).map((tenant) => (
                <div
                  key={tenant.id}
                  className="flex items-center gap-4 p-4 bg-slate-800/30 border border-slate-700/50 rounded-xl hover:bg-slate-800/50 transition-all duration-200"
                >
                  <div className="size-12 bg-gradient-to-br from-blue-500 to-blue-600 rounded-full flex items-center justify-center flex-shrink-0 shadow-lg shadow-blue-500/20">
                    <span className="text-lg font-bold text-white">
                      {(tenant.nama_lengkap || "G").charAt(0).toUpperCase()}
                    </span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-white truncate">
                      {tenant.nama_lengkap || tenant.user?.username || "Guest"}
                    </p>
                    <p className="text-sm text-slate-400 truncate">
                      {tenant.kamar?.nomor_kamar
                        ? `Kamar ${tenant.kamar.nomor_kamar}`
                        : tenant.user?.username
                          ? `@${tenant.user.username}`
                          : "User Baru"}
                    </p>
                  </div>
                  <span
                    className={`px-3 py-1 rounded-full text-xs font-medium whitespace-nowrap border ${
                      tenant.status === "Active" || !tenant.status
                        ? "bg-green-500/20 text-green-400 border-green-500/30"
                        : "bg-red-500/20 text-red-400 border-red-500/30"
                    }`}
                  >
                    {tenant.status || "Active"}
                  </span>
                </div>
              ))
            ) : (
              <p className="text-slate-500 text-center py-4">
                Tidak ada pendaftaran ditemukan
              </p>
            )}
          </div>
        </div>

        {/* Recent Checkouts */}
        <div className="bg-gradient-to-br from-slate-900 to-slate-900/50 border border-slate-800 rounded-2xl p-6">
          <h3 className="text-xl font-semibold text-white mb-4">
            Riwayat Check-out
          </h3>
          <div className="space-y-3">
            {stats.recent_checkouts && stats.recent_checkouts.length > 0 ? (
              stats.recent_checkouts.map((checkout, index) => (
                <div
                  key={index}
                  className="flex items-center gap-4 p-4 bg-slate-800/30 border border-slate-700/50 rounded-xl hover:bg-slate-800/50 transition-all duration-200"
                >
                  <div className="size-12 bg-gradient-to-br from-red-500 to-red-600 rounded-full flex items-center justify-center flex-shrink-0 shadow-lg shadow-red-500/20">
                    <LogOut className="text-white size-5" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-white truncate">
                      {checkout.room_name} 
                    </p>
                    <p className="text-sm text-slate-400 truncate">
                      {checkout.tenant_name}
                    </p>
                  </div>
                  <div className="text-right">
                     <p className="text-xs text-slate-400">
                        {new Date(checkout.checkout_date).toLocaleDateString()}
                     </p>
                     <span className="text-[10px] text-red-400 bg-red-500/10 px-2 py-0.5 rounded-full border border-red-500/20">
                        {checkout.reason}
                     </span>
                  </div>
                </div>
              ))
            ) : (
              <p className="text-slate-500 text-center py-4">
                Belum ada data check-out terbaru
              </p>
            )}
          </div>
        </div>

        {/* Progress Metrics */}
        <div className="bg-gradient-to-br from-slate-900 to-slate-900/50 border border-slate-800 rounded-2xl p-6">
          <h3 className="text-xl font-semibold text-white mb-4">
            Metrik Kinerja
          </h3>
          <div className="space-y-5">
            <div>
              <div className="flex justify-between items-center mb-2">
                <span className="text-sm text-slate-400">Tingkat Okupansi</span>
                <span className="text-sm font-semibold text-white">
                  {Math.round((occupiedRooms / (roomsCount || 1)) * 100)}%
                </span>
              </div>
              <div className="h-2.5 bg-slate-800 rounded-full overflow-hidden shadow-inner">
                <div
                  className="h-full bg-gradient-to-r from-amber-400 to-amber-600 rounded-full transition-all duration-500 shadow-[0_0_12px_rgba(245,158,11,0.4)]"
                  style={{
                    width: `${roomsCount > 0 ? (occupiedRooms / roomsCount) * 100 : 0}%`,
                  }}
                />
              </div>
            </div>

            <div>
              <div className="flex justify-between items-center mb-2">
                <span className="text-sm text-slate-400">
                  Penyelesaian Pembayaran
                </span>
                <span className="text-sm font-semibold text-white">
                  {payments.length > 0
                    ? Math.round(
                        (payments.filter(
                          (p: Payment) => p.status_pembayaran === "Confirmed",
                        ).length /
                          payments.length) *
                          100,
                      )
                    : 0}
                  %
                </span>
              </div>
              <div className="h-2.5 bg-slate-800 rounded-full overflow-hidden shadow-inner">
                <div
                  className="h-full bg-gradient-to-r from-green-400 to-green-600 rounded-full transition-all duration-500 shadow-[0_0_12px_rgba(16,185,129,0.4)]"
                  style={{
                    width: `${payments.length > 0 ? (payments.filter((p: Payment) => p.status_pembayaran === "Confirmed").length / payments.length) * 100 : 0}%`,
                  }}
                />
              </div>
            </div>

            <div>
              <div className="flex justify-between items-center mb-2">
                <span className="text-sm text-slate-400">
                  Kepuasan Penyewa
                </span>
                <span className="text-sm font-semibold text-white">95%</span>
              </div>
              <div className="h-2.5 bg-slate-800 rounded-full overflow-hidden shadow-inner">
                <div
                  className="h-full bg-gradient-to-r from-blue-400 to-blue-600 rounded-full transition-all duration-500 shadow-[0_0_12px_rgba(37,99,235,0.4)]"
                  style={{ width: "95%" }}
                />
              </div>
            </div>

            <div>
              <div className="flex justify-between items-center mb-2">
                <span className="text-sm text-slate-400">Target Bulanan</span>
                <span className="text-sm font-semibold text-white">88%</span>
              </div>
              <div className="h-2.5 bg-slate-800 rounded-full overflow-hidden shadow-inner">
                <div
                  className="h-full bg-gradient-to-r from-purple-400 to-purple-600 rounded-full transition-all duration-500 shadow-[0_0_12px_rgba(147,51,234,0.4)]"
                  style={{ width: "88%" }}
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
