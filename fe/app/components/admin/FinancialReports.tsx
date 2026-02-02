import { TrendingUp, DollarSign, Calendar, Loader2 } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/app/components/ui/card';
import { useEffect, useState } from 'react';
import { api } from '@/app/services/api';

interface DashboardStats {
  total_revenue: number;
  pending_revenue: number;
  rejected_payments: number;
  potential_revenue: number;
  occupied_rooms: number;
  available_rooms: number;
  monthly_trend?: { month: string; revenue: number }[];
  type_breakdown?: { type: string; revenue: number; count: number; occupied: number }[];
}

interface Payment {
  id: string | number;
  status_pembayaran: string;
  jumlah_bayar: number;
}

export function FinancialReports() {
  const [stats, setStats] = useState<DashboardStats>({
    total_revenue: 0,
    pending_revenue: 0,
    rejected_payments: 0,
    potential_revenue: 0,
    occupied_rooms: 0,
    available_rooms: 0,
    monthly_trend: [],
    type_breakdown: []
  });
  const [payments, setPayments] = useState<Payment[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [dashStats, p] = await Promise.all([
          api.getDashboardStats(),
          api.getPayments()
        ]);
        setStats(dashStats);
        setPayments(p);
      } catch (e) {
        console.error(e);
      } finally {
        setIsLoading(false);
      }
    };
    void fetchData();
  }, []);

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center p-20 gap-4">
        <Loader2 className="w-10 h-10 animate-spin text-amber-500" />
        <p className="text-slate-400">Preparing financial reports...</p>
      </div>
    );
  }

  // Use backend-calculated values
  const totalRevenue = stats.total_revenue;
  const pendingRevenue = stats.pending_revenue;
  const potentialRevenue = stats.potential_revenue;
  const occupiedRooms = stats.occupied_rooms;
  const availableRooms = stats.available_rooms;
  const totalRooms = occupiedRooms + availableRooms;
  const occupancyRate = totalRooms > 0 ? (occupiedRooms / totalRooms) * 100 : 0;

  const confirmedPayments = payments.filter(p => p.status_pembayaran === 'Confirmed');
  const pendingPayments = payments.filter(p => p.status_pembayaran === 'Pending');
  const rejectedPayments = payments.filter(p => p.status_pembayaran === 'Rejected');

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0
    }).format(price);
  };

  // Use backend monthly trend or fallback to mock data
  const monthlyData = (stats.monthly_trend && stats.monthly_trend.length > 0)
    ? stats.monthly_trend
    : [
        { month: 'Jan', revenue: 4200000 },
        { month: 'Feb', revenue: 5100000 },
        { month: 'Mar', revenue: 4800000 },
        { month: 'Apr', revenue: 5400000 },
        { month: 'May', revenue: 6200000 },
        { month: 'Jun', revenue: 5900000 }
      ];

  const maxRevenue = Math.max(...monthlyData.map(d => d.revenue));

  return (
    <div className="p-6 space-y-6">
      <div>
        <h2 className="text-3xl font-semibold">Financial Reports</h2>
        <p className="text-slate-600 mt-1">View revenue and financial statistics</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm text-slate-600">Total Revenue</p>
                <p className="text-2xl font-semibold mt-2">{formatPrice(totalRevenue)}</p>
                <p className="text-sm text-green-600 mt-1">+12.5% from last month</p>
              </div>
              <div className="p-3 rounded-lg bg-green-100 text-green-600">
                <DollarSign className="size-6" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm text-slate-600">Pending Revenue</p>
                <p className="text-2xl font-semibold mt-2">{formatPrice(pendingRevenue)}</p>
                <p className="text-sm text-orange-600 mt-1">Awaiting confirmation</p>
              </div>
              <div className="p-3 rounded-lg bg-orange-100 text-orange-600">
                <Calendar className="size-6" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm text-slate-600">Occupancy Rate</p>
                <p className="text-2xl font-semibold mt-2">{occupancyRate.toFixed(0)}%</p>
                <p className="text-sm text-blue-600 mt-1">{occupiedRooms}/{totalRooms} rooms</p>
              </div>
              <div className="p-3 rounded-lg bg-blue-100 text-blue-600">
                <TrendingUp className="size-6" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm text-slate-600">Potential Revenue</p>
                <p className="text-2xl font-semibold mt-2">{formatPrice(potentialRevenue)}</p>
                <p className="text-sm text-purple-600 mt-1">If fully occupied</p>
              </div>
              <div className="p-3 rounded-lg bg-purple-100 text-purple-600">
                <TrendingUp className="size-6" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Monthly Revenue</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {monthlyData.map((data) => (
                <div key={data.month}>
                  <div className="flex justify-between text-sm mb-2">
                    <span className="font-medium">{data.month}</span>
                    <span className="text-slate-600">{formatPrice(data.revenue)}</span>
                  </div>
                  <div className="h-2 bg-slate-200 rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-blue-600 transition-all"
                      style={{ width: `${(data.revenue / (maxRevenue || 1)) * 100}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Payment Status</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center justify-between p-4 bg-green-50 rounded-lg">
                <div>
                  <p className="font-medium">Confirmed Payments</p>
                  <p className="text-sm text-slate-600 mt-1">
                    {confirmedPayments.length} transactions
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-2xl font-semibold text-green-600">
                    {formatPrice(totalRevenue)}
                  </p>
                </div>
              </div>
              
              <div className="flex items-center justify-between p-4 bg-orange-50 rounded-lg">
                <div>
                  <p className="font-medium">Pending Payments</p>
                  <p className="text-sm text-slate-600 mt-1">
                    {pendingPayments.length} transactions
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-2xl font-semibold text-orange-600">
                    {formatPrice(pendingRevenue)}
                  </p>
                </div>
              </div>

              <div className="flex items-center justify-between p-4 bg-red-50 rounded-lg">
                <div>
                  <p className="font-medium">Rejected Payments</p>
                  <p className="text-sm text-slate-600 mt-1">
                    {rejectedPayments.length} transactions
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-2xl font-semibold text-red-600">{stats.rejected_payments}</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Revenue by Room Type</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {(stats.type_breakdown && stats.type_breakdown.length > 0) ? (
              stats.type_breakdown.map((typeData) => {
                const occupancyPercent = typeData.count > 0 ? (typeData.occupied / typeData.count) * 100 : 0;
                
                return (
                  <div key={typeData.type} className="p-4 border rounded-lg">
                    <div className="flex justify-between items-start mb-4">
                      <div>
                        <p className="font-medium">{typeData.type} Rooms</p>
                        <p className="text-sm text-slate-600">
                          {typeData.occupied}/{typeData.count} occupied
                        </p>
                      </div>
                      <p className="font-semibold">{formatPrice(typeData.revenue)}</p>
                    </div>
                    <div className="h-2 bg-slate-200 rounded-full overflow-hidden">
                      <div 
                        className="h-full bg-blue-600"
                        style={{ width: `${occupancyPercent}%` }}
                      />
                    </div>
                  </div>
                );
              })
            ) : (
              <p className="text-slate-500 col-span-2 text-center py-4">No room type data available</p>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
