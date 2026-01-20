import { TrendingUp, DollarSign, Calendar } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/app/components/ui/card';
import { payments, rooms } from '@/app/data/mockData';

interface Payment {
  id: string;
  status: string;
  amount: number;
}

interface Room {
  id: string;
  type: string;
  status: string;
  price: number;
}

export function FinancialReports() {
  const confirmedPayments = (payments as Payment[]).filter(p => p.status === 'Confirmed');
  const totalRevenue = confirmedPayments.reduce((sum: number, p: Payment) => sum + p.amount, 0);
  const pendingRevenue = (payments as Payment[])
    .filter(p => p.status === 'Pending')
    .reduce((sum: number, p: Payment) => sum + p.amount, 0);
  
  const occupiedRooms = (rooms as Room[]).filter(r => r.status === 'Penuh');
  const potentialRevenue = (rooms as Room[]).reduce((sum: number, r: Room) => sum + r.price, 0);
  const occupancyRate = (occupiedRooms.length / rooms.length) * 100;

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

      {/* Stats Cards */}
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

      {/* Charts */}
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
                      style={{ width: `${(data.revenue / maxRevenue) * 100}%` }}
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
                    {(payments as Payment[]).filter(p => p.status === 'Confirmed').length} transactions
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
                    {(payments as Payment[]).filter(p => p.status === 'Pending').length} transactions
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
                    {(payments as Payment[]).filter(p => p.status === 'Rejected').length} transactions
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

      {/* Revenue by Room Type */}
      <Card>
        <CardHeader>
          <CardTitle>Revenue by Room Type</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {Array.from(new Set((rooms as Room[]).map(r => r.type))).map((type: unknown) => {
              const typeRooms = (rooms as Room[]).filter(r => r.type === type);
              const occupiedTypeRooms = typeRooms.filter(r => r.status === 'Penuh');
              const typeRevenue = occupiedTypeRooms.reduce((sum: number, r: Room) => sum + r.price, 0);
              
              return (
                <div key={type as string} className="p-4 border rounded-lg">
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <p className="font-medium">{type as string} Rooms</p>
                      <p className="text-sm text-slate-600">
                        {occupiedTypeRooms.length}/{typeRooms.length} occupied
                      </p>
                    </div>
                    <p className="font-semibold">{formatPrice(typeRevenue)}</p>
                  </div>
                  <div className="h-2 bg-slate-200 rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-blue-600"
                      style={{ width: `${(occupiedTypeRooms.length / typeRooms.length) * 100}%` }}
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
