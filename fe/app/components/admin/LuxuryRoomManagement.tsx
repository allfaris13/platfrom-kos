import { useState, useEffect } from 'react';
import { Search, Plus, Edit, Trash2, Eye, Download, ChevronUp, ChevronDown } from 'lucide-react';
import { Room } from '@/app/data/mockData';
import { ImageWithFallback } from '@/app/components/shared/ImageWithFallback';
import { Button } from '@/app/components/ui/button';
import { Input } from '@/app/components/ui/input';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/app/components/ui/dialog';
import { Label } from '@/app/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/app/components/ui/select';
import { api } from '@/app/services/api';
import { toast } from 'sonner';

interface BackendRoom {
  id: number;
  nomor_kamar: string;
  tipe_kamar: string;
  harga_per_bulan: number;
  status: string;
  capacity: number;
  floor: number;
  description: string;
  image_url: string;
  fasilitas: string;
}

export function LuxuryRoomManagement() {
  const [rooms, setRooms] = useState<Room[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');
  const [typeFilter, setTypeFilter] = useState('All');
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingRoom, setEditingRoom] = useState<Room | null>(null);
  const [viewingRoom, setViewingRoom] = useState<Room | null>(null);
  const [sortField, setSortField] = useState<'name' | 'price' | 'floor'>('name');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const [formData, setFormData] = useState<Partial<Room>>({
    name: '',
    type: 'Single',
    price: 0,
    status: 'Tersedia',
    capacity: 1,
    facilities: [],
    floor: 1,
    description: ''
  });

  const fetchRooms = async () => {
    setIsLoading(true);
    try {
      const data = await api.getRooms();
      const mapped: Room[] = data.map((r: BackendRoom) => ({
        id: String(r.id),
        name: r.nomor_kamar,
        type: r.tipe_kamar,
        price: r.harga_per_bulan,
        status: r.status,
        capacity: r.capacity || 1,
        floor: r.floor || 1,
        description: r.description || '',
        image: r.image_url ? (r.image_url.startsWith('http') ? r.image_url : `http://localhost:8080${r.image_url}`) : 'https://via.placeholder.com/300',
        facilities: r.fasilitas ? r.fasilitas.split(',').map(f => f.trim()) : []
      }));
      setRooms(mapped);
    } catch (e) {
      console.error(e);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchRooms();
  }, []);

  const filteredRooms = rooms
    .filter(room => {
      const matchesSearch = room.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                           room.id.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesStatus = statusFilter === 'All' || room.status === statusFilter;
      const matchesType = typeFilter === 'All' || room.type === typeFilter;
      return matchesSearch && matchesStatus && matchesType;
    })
    .sort((a, b) => {
      const aVal = a[sortField];
      const bVal = b[sortField];
      
      if (typeof aVal === 'string' && typeof bVal === 'string') {
         return sortOrder === 'asc' ? aVal.localeCompare(bVal) : bVal.localeCompare(aVal);
      }
      const modifier = sortOrder === 'asc' ? 1 : -1;
      return (aVal as number) > (bVal as number) ? modifier : -modifier;
    });

  const handleSubmit = async () => {
      const data = new FormData();
      data.append('nomor_kamar', formData.name || '');
      data.append('tipe_kamar', formData.type || 'Single');
      data.append('harga_per_bulan', String(formData.price));
      data.append('status', formData.status || 'Tersedia');
      data.append('capacity', String(formData.capacity));
      data.append('floor', String(formData.floor));
      data.append('description', formData.description || '');
      data.append('fasilitas', (formData.facilities || []).join(', ')); 
      if (imageFile) {
        data.append('image', imageFile);
      }

      try {
        if (editingRoom) {
            await api.updateRoom(editingRoom.id, data);
        } else {
            await api.createRoom(data);
        }
        await fetchRooms();
        setIsDialogOpen(false);
        resetForm();
        toast.success(editingRoom ? "Room updated successfully!" : "Room created successfully!");
      } catch (e) {
        console.error(e);
        toast.error(editingRoom ? "Failed to update room" : "Failed to create room");
      }
  };

  const handleDelete = async (id: string) => {
    if (window.confirm('Are you sure you want to delete this room?')) {
      try {
          await api.deleteRoom(id);
          await fetchRooms();
          toast.success("Room deleted successfully!");
      } catch (e) {
          console.error(e);
          toast.error("Failed to delete room");
      }
    }
  };

  const handleEdit = (room: Room) => {
    setEditingRoom(room);
    setFormData(room);
    setIsDialogOpen(true);
  };

  const resetForm = () => {
    setFormData({
      name: '',
      type: 'Single',
      price: 0,
      status: 'Tersedia',
      capacity: 1,
      facilities: [],
      floor: 1,
      description: ''
    });
    setEditingRoom(null);
    setIsDialogOpen(false);
    setImageFile(null);
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0
    }).format(price);
  };

  const toggleSort = (field: 'name' | 'price' | 'floor') => {
    if (sortField === field) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortOrder('asc');
    }
  };

  const statusColors: Record<string, string> = {
    'Tersedia': 'bg-green-500/10 text-green-400 border-green-500/20',
    'Penuh': 'bg-red-500/10 text-red-500 border-red-500/20',
    'Maintenance': 'bg-orange-500/10 text-orange-400 border-orange-500/20'
  };

  return (
    <div className="p-8 space-y-8 bg-slate-950 min-h-screen">
      {/* Header Section */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-amber-500 mb-1">
            Data Kamar
          </h1>
          <p className="text-slate-400 text-sm">Manage all rooms and their details</p>
        </div>
        
        <div className="flex items-center gap-3">
          <Button variant="outline" className="bg-transparent border-slate-700 text-white hover:bg-slate-800 px-6">
            <Download className="size-4 mr-2" />
            Export
          </Button>
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button 
                onClick={() => { setEditingRoom(null); setFormData({ name: '', type: 'Single', price: 0, status: 'Tersedia', capacity: 1, facilities: [], floor: 1, description: '' }); }}
                className="bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-white shadow-lg shadow-amber-500/20 px-6"
              >
                <Plus className="size-4 mr-2" />
                Add New Room
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto bg-slate-900 border-slate-800 text-white">
              <DialogHeader>
                <DialogTitle className="text-2xl font-bold text-amber-500">
                  {editingRoom ? 'Edit Room' : 'Add New Room'}
                </DialogTitle>
              </DialogHeader>
              <div className="space-y-6 mt-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="name" className="text-slate-300">Room Name</Label>
                    <Input
                      id="name"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      placeholder="e.g., Room A1"
                      className="bg-slate-800 border-slate-700 text-white focus:ring-amber-500"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="type" className="text-slate-300">Type</Label>
                    <Select value={formData.type} onValueChange={(value) => setFormData({ ...formData, type: value })}>
                      <SelectTrigger className="bg-slate-800 border-slate-700 text-white">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent className="bg-slate-800 border-slate-700 text-white">
                        <SelectItem value="Single">Single</SelectItem>
                        <SelectItem value="Double">Double</SelectItem>
                        <SelectItem value="Suite">Suite</SelectItem>
                        <SelectItem value="Deluxe">Deluxe</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="price" className="text-slate-300">Price (IDR)</Label>
                    <Input
                      id="price"
                      type="number"
                      value={formData.price}
                      onChange={(e) => setFormData({ ...formData, price: Number(e.target.value) })}
                      placeholder="1500000"
                      className="bg-slate-800 border-slate-700 text-white focus:ring-amber-500"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="status" className="text-slate-300">Status</Label>
                    <Select value={formData.status} onValueChange={(value) => setFormData({ ...formData, status: value as 'Tersedia' | 'Penuh' | 'Maintenance' })}>
                      <SelectTrigger className="bg-slate-800 border-slate-700 text-white">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent className="bg-slate-800 border-slate-700 text-white">
                        <SelectItem value="Tersedia">Tersedia</SelectItem>
                        <SelectItem value="Penuh">Penuh</SelectItem>
                        <SelectItem value="Maintenance">Maintenance</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="capacity" className="text-slate-300">Capacity</Label>
                    <Input
                      id="capacity"
                      type="number"
                      value={formData.capacity}
                      onChange={(e) => setFormData({ ...formData, capacity: Number(e.target.value) })}
                      min="1"
                      className="bg-slate-800 border-slate-700 text-white focus:ring-amber-500"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="floor" className="text-slate-300">Floor</Label>
                    <Input
                      id="floor"
                      type="number"
                      value={formData.floor}
                      onChange={(e) => setFormData({ ...formData, floor: Number(e.target.value) })}
                      min="1"
                      className="bg-slate-800 border-slate-700 text-white focus:ring-amber-500"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="description" className="text-slate-300">Description</Label>
                  <textarea
                    id="description"
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    className="w-full h-24 bg-slate-800 border border-slate-700 text-white rounded-lg p-3 focus:ring-amber-500 focus:outline-none"
                    placeholder="Describe the room..."
                  />
                </div>

                <div className="space-y-2">
                  <Label className="text-slate-300">Room Image</Label>
                  <div className="flex items-center gap-4">
                    {formData.image && !imageFile && (
                      <div className="size-16 rounded-lg overflow-hidden border border-slate-700">
                        <ImageWithFallback src={formData.image} alt="Current" className="w-full h-full object-cover" />
                      </div>
                    )}
                    <Input 
                      type="file" 
                      onChange={(e: React.ChangeEvent<HTMLInputElement>) => setImageFile(e.target.files?.[0] || null)}
                      className="bg-slate-800 border-slate-700 text-white" 
                    />
                  </div>
                </div>

                <div className="flex justify-end gap-3 pt-4">
                  <Button variant="outline" onClick={resetForm} className="bg-transparent border-slate-700 text-slate-300 hover:bg-slate-800">
                    Cancel
                  </Button>
                  <Button 
                    onClick={handleSubmit}
                    className="bg-amber-500 hover:bg-amber-600 text-white"
                  >
                    {editingRoom ? 'Update Room' : 'Create Room'}
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Filter Bar */}
      <div className="flex flex-col lg:flex-row lg:items-center gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 size-4 text-slate-400" />
          <Input
            placeholder="Search Rooms..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-12 bg-white border-none text-slate-900 placeholder:text-slate-500 h-12 rounded-xl"
          />
        </div>
        <div className="flex gap-4">
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-[180px] bg-slate-900/50 border-slate-700 text-white h-12 rounded-xl">
              <SelectValue placeholder="All Status" />
            </SelectTrigger>
            <SelectContent className="bg-slate-900 border-slate-700 text-white">
              <SelectItem value="All">All Status</SelectItem>
              <SelectItem value="Tersedia">Tersedia</SelectItem>
              <SelectItem value="Penuh">Penuh</SelectItem>
              <SelectItem value="Maintenance">Maintenance</SelectItem>
            </SelectContent>
          </Select>
          <Select value={typeFilter} onValueChange={setTypeFilter}>
            <SelectTrigger className="w-[180px] bg-slate-900/50 border-slate-700 text-white h-12 rounded-xl">
              <SelectValue placeholder="All Types" />
            </SelectTrigger>
            <SelectContent className="bg-slate-900 border-slate-700 text-white">
              <SelectItem value="All">All Types</SelectItem>
              <SelectItem value="Single">Single</SelectItem>
              <SelectItem value="Double">Double</SelectItem>
              <SelectItem value="Suite">Suite</SelectItem>
              <SelectItem value="Deluxe">Deluxe</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Table Container */}
      <div className="bg-slate-900/20 border border-slate-800 rounded-[2rem] p-8 backdrop-blur-sm shadow-xl">
        {/* Table Header Row */}
        <div className="grid grid-cols-[120px_1.5fr_1fr_1.5fr_0.8fr_1.2fr_120px] gap-6 px-6 mb-8 text-slate-400 text-sm font-medium">
          <div>Thumbnail</div>
          <div className="flex items-center cursor-pointer hover:text-white" onClick={() => toggleSort('name')}>
            Room <ChevronUp className="size-4 ml-1" />
          </div>
          <div>Type</div>
          <div className="flex items-center cursor-pointer hover:text-white" onClick={() => toggleSort('price')}>
            Price <ChevronDown className="size-4 ml-1" />
          </div>
          <div>Floor</div>
          <div>Status</div>
          <div className="text-center">Actions</div>
        </div>

        {/* Data Rows */}
        <div className="space-y-4">
          {isLoading ? (
            <div className="flex flex-col items-center justify-center py-20 gap-4">
               <div className="size-10 border-4 border-amber-500/20 border-t-amber-500 rounded-full animate-spin" />
               <p className="text-slate-500 italic">Syncing with database...</p>
            </div>
          ) : filteredRooms.length === 0 ? (
            <div className="text-center py-20 bg-slate-900/40 rounded-2xl border border-dashed border-slate-800">
               <Search className="size-12 text-slate-700 mx-auto mb-4" />
               <h3 className="text-xl font-semibold text-slate-400">No matching rooms found</h3>
               <p className="text-slate-600 mt-2 text-sm italic">Try adjusting your filters or adding a new room</p>
            </div>
          ) : filteredRooms.map((room) => (
            <div key={room.id} className="grid grid-cols-[120px_1.5fr_1fr_1.5fr_0.8fr_1.2fr_120px] gap-6 px-6 py-5 items-center hover:bg-slate-800/20 rounded-2xl transition-all border border-transparent hover:border-slate-800 group">
              {/* Thumbnail */}
              <div className="relative size-20 rounded-2xl overflow-hidden border-2 border-amber-500/40 group-hover:border-amber-500 transition-colors shadow-lg shadow-amber-500/10">
                <ImageWithFallback
                  src={room.image}
                  alt={room.name}
                  className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                />
              </div>

              {/* Room Name & ID */}
              <div>
                <h3 className="text-white font-bold text-lg mb-0.5">{room.name}</h3>
                <p className="text-slate-500 text-xs font-mono">ID: R{String(room.id).padStart(3, '0')}</p>
              </div>

              {/* Type Badge */}
              <div>
                <span className="px-5 py-1.5 bg-blue-500/10 text-blue-400 text-xs font-bold rounded-lg border border-blue-500/20 uppercase tracking-wider">
                  {room.type}
                </span>
              </div>

              {/* Price */}
              <div>
                <p className="text-white font-bold text-lg mb-0.5">{formatPrice(room.price)}</p>
                <p className="text-slate-500 text-xs italic">per month</p>
              </div>

              {/* Floor */}
              <div className="text-white font-bold text-lg">
                {room.floor}
              </div>

              {/* Status */}
              <div>
                <span className={`px-5 py-2.5 rounded-xl text-xs font-black uppercase tracking-widest border shadow-inner ${statusColors[room.status] || 'bg-slate-500/10 text-slate-400 border-slate-700'}`}>
                  {room.status}
                </span>
              </div>

              {/* Actions */}
              <div className="flex items-center justify-center gap-2">
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => setViewingRoom(room)}
                  className="text-slate-400 hover:text-white hover:bg-slate-800 rounded-xl"
                >
                  <Eye className="size-5" />
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => handleEdit(room)}
                  className="text-slate-400 hover:text-amber-500 hover:bg-amber-500/10 rounded-xl"
                >
                  <Edit className="size-5" />
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => handleDelete(room.id)}
                  className="text-slate-500 hover:text-red-500 hover:bg-red-500/10 rounded-xl"
                >
                  <Trash2 className="size-5" />
                </Button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* View Dialog */}
      <Dialog open={!!viewingRoom} onOpenChange={() => setViewingRoom(null)}>
        <DialogContent className="max-w-2xl bg-slate-900 border-slate-800 text-white p-0 overflow-hidden rounded-[2rem]">
          {viewingRoom && (
            <div className="space-y-0">
               <div className="aspect-video relative">
                 <ImageWithFallback
                   src={viewingRoom.image}
                   alt={viewingRoom.name}
                   className="w-full h-full object-cover"
                 />
                 <div className="absolute inset-0 bg-gradient-to-t from-slate-900 via-transparent to-transparent" />
                 <div className="absolute bottom-6 left-8">
                    <h2 className="text-3xl font-black text-white">{viewingRoom.name}</h2>
                    <p className="text-amber-500 font-bold uppercase tracking-tighter mt-1">{viewingRoom.type} • ID: R{String(viewingRoom.id).padStart(3, '0')}</p>
                 </div>
               </div>
               
               <div className="p-8 space-y-8">
                  <div className="grid grid-cols-4 gap-6">
                    <div className="p-4 bg-slate-800/40 rounded-2xl border border-slate-700/50">
                       <p className="text-slate-500 text-[10px] uppercase font-bold tracking-widest mb-1">Status</p>
                       <p className={`font-black text-sm uppercase ${viewingRoom.status === 'Tersedia' ? 'text-green-400' : 'text-red-400'}`}>{viewingRoom.status}</p>
                    </div>
                    <div className="p-4 bg-slate-800/40 rounded-2xl border border-slate-700/50">
                       <p className="text-slate-500 text-[10px] uppercase font-bold tracking-widest mb-1">Price</p>
                       <p className="font-black text-sm text-amber-500">{formatPrice(viewingRoom.price)}</p>
                    </div>
                    <div className="p-4 bg-slate-800/40 rounded-2xl border border-slate-700/50">
                       <p className="text-slate-500 text-[10px] uppercase font-bold tracking-widest mb-1">Floor</p>
                       <p className="font-black text-sm text-white">{viewingRoom.floor}</p>
                    </div>
                    <div className="p-4 bg-slate-800/40 rounded-2xl border border-slate-700/50">
                       <p className="text-slate-500 text-[10px] uppercase font-bold tracking-widest mb-1">Capacity</p>
                       <p className="font-black text-sm text-white">{viewingRoom.capacity} Person</p>
                    </div>
                  </div>

                  <div>
                     <p className="text-slate-400 text-xs font-bold uppercase tracking-widest mb-4">Room Facilities</p>
                     <div className="flex flex-wrap gap-2">
                       {viewingRoom.facilities.map((f, i) => (
                         <span key={i} className="px-4 py-2 bg-slate-800 border border-slate-700 text-slate-300 rounded-xl text-xs font-medium">{f}</span>
                       ))}
                     </div>
                  </div>

                  <div>
                     <p className="text-slate-400 text-xs font-bold uppercase tracking-widest mb-2">Description</p>
                     <p className="text-slate-300 leading-relaxed italic">
                       &quot;{viewingRoom.description || 'No detailed description provided for this room.'}&quot;
                     </p>
                  </div>
               </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
