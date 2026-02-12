import { useEffect, useState } from 'react';
import { Search, Loader2 } from 'lucide-react';
import { api } from '@/app/services/api';
import { Input } from '@/app/components/ui/input';


interface Tenant {
  id: string;
  name: string;
  email: string;
  phone: string;
  nik?: string; // Manually re-adding if missed
  roomName: string;
  checkIn: string;
  checkOut: string;
  status: 'Active' | 'Expired' | 'Pending';
}

interface BackendTenant {
  id: number;
  nama_lengkap: string;
  nomor_hp: string;
  nik?: string;
  created_at?: string;
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
        const data = await api.getAllTenants();
        const mapped = data.map((t: BackendTenant) => ({
          id: String(t.id),
          name: t.nama_lengkap || t.user?.username || 'Tamu',
          email: t.user?.email || t.user?.username || 'N/A',
          phone: t.nomor_hp || 'N/A',
          nik: t.nik || '-',
          roomName: 'Kamar',
          checkIn: t.created_at ? new Date(t.created_at).toLocaleDateString('id-ID') : '-',
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
    void fetchTenants();
  }, []);

  const filteredTenants = tenants.filter(tenant =>
    tenant.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    tenant.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
    tenant.roomName.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="p-4 md:p-8 space-y-6 md:space-y-8 bg-slate-950 min-h-screen">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl md:text-3xl font-bold text-amber-500">Data Penyewa</h2>
          <p className="text-slate-400 text-xs md:text-sm">Kelola informasi dan riwayat penyewa</p>
        </div>

        {/* Search Bar */}
        <div className="relative w-full md:w-96">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 size-4 text-slate-500" />
          <Input
            placeholder="Cari penyewa..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-12 bg-slate-900 border-slate-800 text-white placeholder:text-slate-500 h-11 md:h-12 rounded-xl"
          />
        </div>
      </div>

      {/* Content Container */}
      <div className="bg-slate-900/20 md:border md:border-slate-800 rounded-[1.5rem] md:rounded-[2rem] p-4 md:p-8 backdrop-blur-sm">
        {/* Desktop Header */}
        <div className="hidden md:grid grid-cols-[80px_1.5fr_1fr_1.5fr_1fr_1fr_1fr_1fr] gap-4 px-6 mb-8 text-slate-500 text-xs font-bold uppercase tracking-widest">
          <div>ID</div>
          <div>Nama Penyewa</div>
          <div>NIK</div>
          <div>Kontak</div>
          <div>Kamar</div>
          <div>Masuk</div>
          <div>Keluar</div>
          <div className="text-center">Status</div>
        </div>

        {/* Data Rows */}
        <div className="space-y-4">
          {isLoading ? (
            <div className="flex flex-col items-center justify-center py-20 gap-4">
              <Loader2 className="size-10 text-amber-500 animate-spin" />
              <p className="text-slate-500 italic">Mengambil data penyewa...</p>
            </div>
          ) : filteredTenants.length === 0 ? (
            <div className="text-center py-20 bg-slate-800/20 rounded-2xl border border-dashed border-slate-800">
              <Search className="size-12 text-slate-700 mx-auto mb-4" />
              <p className="text-slate-400 font-medium">Tidak ada penyewa yang cocok dengan kriteria pencarian</p>
            </div>
          ) : (
            filteredTenants.map((tenant) => (
              <div key={tenant.id}>
                {/* Desktop Row */}
                <div className="hidden md:grid grid-cols-[80px_1.5fr_1fr_1.5fr_1fr_1fr_1fr_1fr] gap-4 px-6 py-4 items-center bg-slate-800/20 hover:bg-slate-800/40 rounded-2xl transition-all border border-transparent hover:border-slate-800 group">
                  <div className="text-slate-500 font-mono text-sm">#{tenant.id}</div>
                  <div className="text-white font-bold">{tenant.name}</div>
                  <div className="text-slate-300 text-sm font-mono">{tenant.nik}</div>
                  <div className="flex flex-col">
                    <span className="text-slate-300 text-sm truncate">{tenant.email}</span>
                    <span className="text-slate-500 text-xs">{tenant.phone}</span>
                  </div>
                  <div className="text-amber-500/80 font-medium">{tenant.roomName}</div>
                  <div className="text-slate-300 text-sm">{tenant.checkIn}</div>
                  <div className="text-slate-500 text-sm">{tenant.checkOut}</div>
                  <div className="flex justify-center">
                    <span className="px-3 py-1 bg-green-500/10 text-green-400 text-[10px] font-bold rounded-lg border border-green-500/20 uppercase">
                      {tenant.status}
                    </span>
                  </div>
                </div>

                {/* Mobile Card */}
                <div className="md:hidden p-5 bg-slate-900/40 border border-slate-800 rounded-2xl space-y-4">
                  <div className="flex justify-between items-start">
                    <div className="flex items-center gap-3">
                      <div className="size-10 bg-linear-to-br from-amber-500 to-amber-600 rounded-xl flex items-center justify-center font-bold text-white">
                        {tenant.name.charAt(0)}
                      </div>
                      <div>
                        <h3 className="text-white font-bold">{tenant.name}</h3>
                        <p className="text-slate-500 font-mono text-[10px]">ID: #{tenant.id}</p>
                        <p className="text-slate-500 font-mono text-[10px]">NIK: {tenant.nik}</p>
                      </div>
                    </div>
                    <span className="px-2 py-0.5 bg-green-500/10 text-green-400 text-[10px] font-bold rounded border border-green-500/20 uppercase">
                      {tenant.status}
                    </span>
                  </div>

                  <div className="grid grid-cols-2 gap-4 pt-4 border-t border-slate-800">
                    <div>
                      <p className="text-slate-500 text-[10px] uppercase font-bold tracking-widest mb-1">Kamar</p>
                      <p className="text-amber-500 text-sm font-bold">{tenant.roomName}</p>
                    </div>
                    <div>
                      <p className="text-slate-500 text-[10px] uppercase font-bold tracking-widest mb-1">Masuk</p>
                      <p className="text-white text-sm">{tenant.checkIn}</p>
                    </div>
                  </div>

                  <div className="pt-2">
                    <p className="text-slate-500 text-[10px] uppercase font-bold tracking-widest mb-1">Email / Telepon</p>
                    <p className="text-slate-300 text-xs truncate mb-1">{tenant.email}</p>
                    <p className="text-slate-500 text-xs">{tenant.phone}</p>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}


