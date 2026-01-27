import { TrendingUp, DollarSign, Calendar, Loader2 } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/app/components/ui/card';
import { useEffect, useState } from 'react';
import { api } from '@/app/services/api';

interface Payment {
  id: string | number;
  status_pembayaran: string;
  jumlah_bayar: number;
}

interface Room {
  id: string | number;
  tipe_kamar: string;
  status: string;
  harga_per_bulan: number;
}

export function FinancialReports() {
  const [payments, setPayments] = useState<Payment[]>([]);
  const [rooms, setRooms] = useState<Room[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [p, r] = await Promise.all([
          api.getPayments(),
          api.getRooms()
        ]);
        setPayments(p);
        setRooms(r);
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

  const confirmedPayments = payments.filter(p => p.status_pembayaran === 'Confirmed');
  const totalRevenue = confirmedPayments.reduce((sum, p) => sum + p.jumlah_bayar, 0);
  const pendingRevenue = payments
    .filter(p => p.status_pembayaran === 'Pending')
    .reduce((sum, p) => sum + p.jumlah_bayar, 0);
  
  const occupiedRooms = rooms.filter(r => r.status === 'Penuh');
  const potentialRevenue = rooms.reduce((sum, r) => sum + (r.harga_per_bulan || 0), 0);
  const occupancyRate = rooms.length > 0 ? (occupiedRooms.length / rooms.length) * 100 : 0;

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0
    }).format(price);
  };

  const monthlyData = [
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
                <p className="text-sm text-blue-600 mt-1">{occupiedRooms.length}/{rooms.length} rooms</p>
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
                    {payments.filter(p => p.status_pembayaran === 'Confirmed').length} transactions
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
                    {payments.filter(p => p.status_pembayaran === 'Pending').length} transactions
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
                    {payments.filter(p => p.status_pembayaran === 'Rejected').length} transactions
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-2xl font-semibold text-red-600">0</p>
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
            {Array.from(new Set(rooms.map(r => r.tipe_kamar))).map((type) => {
              const typeRooms = rooms.filter(r => r.tipe_kamar === type);
              const occupiedTypeRooms = typeRooms.filter(r => r.status === 'Penuh');
              const typeRevenue = occupiedTypeRooms.reduce((sum, r) => sum + r.harga_per_bulan, 0);
              const occupancyPercent = typeRooms.length > 0 ? (occupiedTypeRooms.length / typeRooms.length) * 100 : 0;
              
              return (
                <div key={type} className="p-4 border rounded-lg">
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <p className="font-medium">{type} Rooms</p>
                      <p className="text-sm text-slate-600">
                        {occupiedTypeRooms.length}/{typeRooms.length} occupied
                      </p>
                    </div>
                    <p className="font-semibold">{formatPrice(typeRevenue)}</p>
                  </div>
                  <div className="h-2 bg-slate-200 rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-blue-600"
                      style={{ width: `${occupancyPercent}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
