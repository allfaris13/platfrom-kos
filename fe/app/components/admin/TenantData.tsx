import { useEffect, useState } from 'react';
import { Search, Loader2 } from 'lucide-react';
import { api } from '@/app/services/api';
import { Input } from '@/app/components/ui/input';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/app/components/ui/table';

interface Tenant {
  id: string;
  name: string;
  email: string;
  phone: string;
  roomName: string;
  checkIn: string;
  checkOut: string;
  status: 'Active' | 'Expired' | 'Pending';
}

interface BackendTenant {
  id: number;
  nama_lengkap: string;
  nomor_hp: string;
  created_at: string;
  user?: { email?: string; username?: string };
}

export function TenantData() {
  const [tenants, setTenants] = useState<Tenant[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchTenants = async () => {
      setIsLoading(true);
      try {
        const data = await api.getTenants();
        const mapped = data.map((t: BackendTenant) => ({
          id: String(t.id),
          name: t.nama_lengkap || 'Guest',
          email: t.user?.email || t.user?.username || 'N/A',
          phone: t.nomor_hp || 'N/A',
          roomName: 'Kamar', 
          checkIn: new Date(t.created_at).toLocaleDateString('id-ID'),
          checkOut: '-',
          status: 'Active' as const, 
        }));
        setTenants(mapped);
      } catch (e) {
        console.error(e);
      } finally {
        setIsLoading(false);
      }
    };
    fetchTenants();
  }, []);

  const filteredTenants = tenants.filter(tenant =>
    tenant.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    tenant.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
    tenant.roomName.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="p-6 space-y-6">
      <div>
        <h2 className="text-3xl font-semibold">Tenant Data</h2>
        <p className="text-slate-600 mt-1">Manage tenant information</p>
      </div>

      {/* Search Bar */}
      <div className="relative max-w-md">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-slate-400" />
        <Input
          placeholder="Search tenants..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="pl-10"
        />
      </div>

      {/* Table */}
      <div className="bg-white rounded-lg border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Tenant ID</TableHead>
              <TableHead>Name</TableHead>
              <TableHead>Email</TableHead>
              <TableHead>Phone</TableHead>
              <TableHead>Room</TableHead>
              <TableHead>Check In</TableHead>
              <TableHead>Check Out</TableHead>
              <TableHead>Status</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
               <TableRow>
                 <TableCell colSpan={8} className="text-center py-10">
                   <div className="flex flex-col items-center gap-2">
                     <Loader2 className="w-8 h-8 animate-spin text-slate-400" />
                     <p className="text-slate-500">Loading tenants...</p>
                   </div>
                 </TableCell>
               </TableRow>
            ) : filteredTenants.length === 0 ? (
              <TableRow>
                <TableCell colSpan={8} className="text-center py-10 text-slate-500">
                  No tenants found.
                </TableCell>
              </TableRow>
            ) : filteredTenants.map((tenant) => (
              <TableRow key={tenant.id}>
                <TableCell className="font-medium">{tenant.id}</TableCell>
                <TableCell>{tenant.name}</TableCell>
                <TableCell>{tenant.email}</TableCell>
                <TableCell>{tenant.phone}</TableCell>
                <TableCell>{tenant.roomName}</TableCell>
                <TableCell>{tenant.checkIn}</TableCell>
                <TableCell>{tenant.checkOut}</TableCell>
                <TableCell>
                  <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                    tenant.status === 'Active'
                      ? 'bg-green-100 text-green-700'
                      : tenant.status === 'Expired'
                      ? 'bg-red-100 text-red-700'
                      : 'bg-yellow-100 text-yellow-700'
                  }`}>
                    {tenant.status}
                  </span>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}

