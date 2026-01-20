import { useState } from 'react';
import { Search, Plus, Edit, Trash2, Eye, Filter, Download, Upload } from 'lucide-react';
import { rooms as initialRooms, Room } from '@/app/data/mockData';
import { Button } from '@/app/components/ui/button';
import { Input } from '@/app/components/ui/input';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/app/components/ui/dialog';
import { Label } from '@/app/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/app/components/ui/select';

export function LuxuryRoomManagement() {
  const [rooms, setRooms] = useState<Room[]>(initialRooms);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');
  const [typeFilter, setTypeFilter] = useState('All');
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingRoom, setEditingRoom] = useState<Room | null>(null);
  const [viewingRoom, setViewingRoom] = useState<Room | null>(null);
  const [sortField, setSortField] = useState<'name' | 'price' | 'floor'>('name');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');

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

  const filteredRooms = rooms
    .filter(room => {
      const matchesSearch = room.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                           room.type.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesStatus = statusFilter === 'All' || room.status === statusFilter;
      const matchesType = typeFilter === 'All' || room.type === typeFilter;
      return matchesSearch && matchesStatus && matchesType;
    })
    .sort((a, b) => {
      const aVal = a[sortField];
      const bVal = b[sortField];
      const modifier = sortOrder === 'asc' ? 1 : -1;
      return aVal > bVal ? modifier : -modifier;
    });

  const handleSubmit = () => {
    if (editingRoom) {
      setRooms(rooms.map(r => r.id === editingRoom.id ? { ...formData, id: r.id, image: r.image } as Room : r));
    } else {
      const newRoom: Room = {
        ...formData,
        id: `R${String(rooms.length + 1).padStart(3, '0')}`,
        image: rooms[0].image,
        facilities: formData.facilities || [],
      } as Room;
      setRooms([...rooms, newRoom]);
    }
    resetForm();
  };

  const handleDelete = (id: string) => {
    if (confirm('Are you sure you want to delete this room?')) {
      setRooms(rooms.filter(r => r.id !== id));
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

  return (
    <div className="p-8 space-y-6 bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 min-h-screen">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-4xl font-bold bg-gradient-to-r from-amber-400 via-amber-500 to-amber-600 bg-clip-text text-transparent mb-2">
            Data Kamar
          </h1>
          <p className="text-slate-400">Manage all rooms and their details</p>
        </div>
        
        <div className="flex items-center gap-3">
          <Button 
            variant="outline" 
            className="bg-slate-800/50 border-slate-700 text-white hover:bg-slate-800"
          >
            <Download className="size-4 mr-2" />
            Export
          </Button>
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button 
                onClick={() => { 
                  setEditingRoom(null); 
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
                }}
                className="bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-white shadow-lg shadow-amber-500/20"
              >
                <Plus className="size-4 mr-2" />
                Add New Room
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto bg-slate-900 border-slate-800 text-white">
              <DialogHeader>
                <DialogTitle className="text-2xl bg-gradient-to-r from-amber-400 to-amber-600 bg-clip-text text-transparent">
                  {editingRoom ? 'Edit Room' : 'Add New Room'}
                </DialogTitle>
              </DialogHeader>
              <div className="space-y-4 mt-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="name" className="text-slate-300">Room Name</Label>
                    <Input
                      id="name"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      placeholder="e.g., Kamar A1"
                      className="bg-slate-800 border-slate-700 text-white"
                    />
                  </div>
                  <div>
                    <Label htmlFor="type" className="text-slate-300">Type</Label>
                    <Select value={formData.type} onValueChange={(value: string) => setFormData({ ...formData, type: value })}>
                      <SelectTrigger className="bg-slate-800 border-slate-700 text-white">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent className="bg-slate-800 border-slate-700 text-white">
                        <SelectItem value="Single">Single</SelectItem>
                        <SelectItem value="Double">Double</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="price" className="text-slate-300">Price (IDR)</Label>
                    <Input
                      id="price"
                      type="number"
                      value={formData.price}
                      onChange={(e) => setFormData({ ...formData, price: Number(e.target.value) })}
                      placeholder="1500000"
                      className="bg-slate-800 border-slate-700 text-white"
                    />
                  </div>
                  <div>
                    <Label htmlFor="status" className="text-slate-300">Status</Label>
                    <Select value={formData.status} onValueChange={(value: any) => setFormData({ ...formData, status: value })}>
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
                  <div>
                    <Label htmlFor="capacity" className="text-slate-300">Capacity</Label>
                    <Input
                      id="capacity"
                      type="number"
                      value={formData.capacity}
                      onChange={(e) => setFormData({ ...formData, capacity: Number(e.target.value) })}
                      min="1"
                      className="bg-slate-800 border-slate-700 text-white"
                    />
                  </div>
                  <div>
                    <Label htmlFor="floor" className="text-slate-300">Floor</Label>
                    <Input
                      id="floor"
                      type="number"
                      value={formData.floor}
                      onChange={(e) => setFormData({ ...formData, floor: Number(e.target.value) })}
                      min="1"
                      className="bg-slate-800 border-slate-700 text-white"
                    />
                  </div>
                </div>

                <div>
                  <Label htmlFor="description" className="text-slate-300">Description</Label>
                  <Input
                    id="description"
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    placeholder="Room description"
                    className="bg-slate-800 border-slate-700 text-white"
                  />
                </div>

                <div>
                  <Label className="text-slate-300 mb-2 block">Upload Image</Label>
                  <div className="border-2 border-dashed border-slate-700 rounded-xl p-8 text-center hover:border-amber-500/50 transition-colors cursor-pointer">
                    <Upload className="size-8 text-slate-500 mx-auto mb-2" />
                    <p className="text-sm text-slate-400">Click to upload room image</p>
                    <p className="text-xs text-slate-500 mt-1">PNG, JPG up to 10MB</p>
                  </div>
                </div>

                <div className="flex justify-end gap-2 mt-6">
                  <Button 
                    variant="outline" 
                    onClick={resetForm}
                    className="bg-slate-800 border-slate-700 text-white hover:bg-slate-700"
                  >
                    Cancel
                  </Button>
                  <Button 
                    onClick={handleSubmit}
                    className="bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700"
                  >
                    {editingRoom ? 'Update' : 'Create'}
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-col md:flex-row gap-4">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-5 text-slate-500" />
          <Input
            placeholder="Search rooms..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-11 bg-slate-800/50 border-slate-700 text-white placeholder:text-slate-500"
          />
        </div>
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-full md:w-48 bg-slate-800/50 border-slate-700 text-white">
            <Filter className="size-4 mr-2" />
            <SelectValue placeholder="Status" />
          </SelectTrigger>
          <SelectContent className="bg-slate-800 border-slate-700 text-white">
            <SelectItem value="All">All Status</SelectItem>
            <SelectItem value="Tersedia">Tersedia</SelectItem>
            <SelectItem value="Penuh">Penuh</SelectItem>
            <SelectItem value="Maintenance">Maintenance</SelectItem>
          </SelectContent>
        </Select>
        <Select value={typeFilter} onValueChange={setTypeFilter}>
          <SelectTrigger className="w-full md:w-48 bg-slate-800/50 border-slate-700 text-white">
            <SelectValue placeholder="Type" />
          </SelectTrigger>
          <SelectContent className="bg-slate-800 border-slate-700 text-white">
            <SelectItem value="All">All Types</SelectItem>
            <SelectItem value="Single">Single</SelectItem>
            <SelectItem value="Double">Double</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Modern Table */}
      <div className="bg-gradient-to-br from-slate-900 to-slate-900/50 border border-slate-800 rounded-2xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-slate-800">
                <th className="text-left p-4 text-sm font-semibold text-slate-400">Thumbnail</th>
                <th 
                  className="text-left p-4 text-sm font-semibold text-slate-400 cursor-pointer hover:text-amber-400 transition-colors"
                  onClick={() => toggleSort('name')}
                >
                  Room {sortField === 'name' && (sortOrder === 'asc' ? '↑' : '↓')}
                </th>
                <th className="text-left p-4 text-sm font-semibold text-slate-400">Type</th>
                <th 
                  className="text-left p-4 text-sm font-semibold text-slate-400 cursor-pointer hover:text-amber-400 transition-colors"
                  onClick={() => toggleSort('price')}
                >
                  Price {sortField === 'price' && (sortOrder === 'asc' ? '↑' : '↓')}
                </th>
                <th 
                  className="text-left p-4 text-sm font-semibold text-slate-400 cursor-pointer hover:text-amber-400 transition-colors"
                  onClick={() => toggleSort('floor')}
                >
                  Floor {sortField === 'floor' && (sortOrder === 'asc' ? '↑' : '↓')}
                </th>
                <th className="text-left p-4 text-sm font-semibold text-slate-400">Status</th>
                <th className="text-right p-4 text-sm font-semibold text-slate-400">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredRooms.map((room, index) => (
                <tr 
                  key={room.id} 
                  className="border-b border-slate-800/50 hover:bg-slate-800/30 transition-all duration-200 group"
                  style={{ animationDelay: `${index * 50}ms` }}
                >
                  <td className="p-4">
                    <div className="size-16 rounded-xl overflow-hidden ring-2 ring-slate-700 group-hover:ring-amber-500/50 transition-all">
                      <img 
                        src={room.image} 
                        alt={room.name}
                        className="w-full h-full object-cover"
                      />
                    </div>
                  </td>
                  <td className="p-4">
                    <p className="font-semibold text-white">{room.name}</p>
                    <p className="text-sm text-slate-400">ID: {room.id}</p>
                  </td>
                  <td className="p-4">
                    <span className="px-3 py-1 bg-blue-500/20 text-blue-400 border border-blue-500/30 rounded-lg text-sm">
                      {room.type}
                    </span>
                  </td>
                  <td className="p-4">
                    <p className="font-semibold text-white">{formatPrice(room.price)}</p>
                    <p className="text-xs text-slate-500">per month</p>
                  </td>
                  <td className="p-4">
                    <span className="text-white font-medium">{room.floor}</span>
                  </td>
                  <td className="p-4">
                    <span className={`px-3 py-1.5 rounded-lg text-xs font-medium border ${
                      room.status === 'Tersedia'
                        ? 'bg-green-500/20 text-green-400 border-green-500/30'
                        : room.status === 'Penuh'
                        ? 'bg-red-500/20 text-red-400 border-red-500/30'
                        : 'bg-orange-500/20 text-orange-400 border-orange-500/30'
                    }`}>
                      {room.status}
                    </span>
                  </td>
                  <td className="p-4">
                    <div className="flex justify-end gap-2">
                      <button
                        onClick={() => setViewingRoom(room)}
                        className="p-2 hover:bg-slate-700 rounded-lg transition-colors text-slate-400 hover:text-blue-400"
                      >
                        <Eye className="size-4" />
                      </button>
                      <button
                        onClick={() => handleEdit(room)}
                        className="p-2 hover:bg-slate-700 rounded-lg transition-colors text-slate-400 hover:text-amber-400"
                      >
                        <Edit className="size-4" />
                      </button>
                      <button
                        onClick={() => handleDelete(room.id)}
                        className="p-2 hover:bg-slate-700 rounded-lg transition-colors text-slate-400 hover:text-red-400"
                      >
                        <Trash2 className="size-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* View Dialog */}
      <Dialog open={!!viewingRoom} onOpenChange={() => setViewingRoom(null)}>
        <DialogContent className="max-w-3xl bg-slate-900 border-slate-800 text-white">
          <DialogHeader>
            <DialogTitle className="text-2xl bg-gradient-to-r from-amber-400 to-amber-600 bg-clip-text text-transparent">
              Room Details
            </DialogTitle>
          </DialogHeader>
          {viewingRoom && (
            <div className="space-y-4">
              <div className="aspect-video rounded-xl overflow-hidden">
                <img
                  src={viewingRoom.image}
                  alt={viewingRoom.name}
                  className="w-full h-full object-cover"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="p-4 bg-slate-800/50 rounded-xl border border-slate-700">
                  <p className="text-xs text-slate-400 mb-1">Room Name</p>
                  <p className="font-semibold text-white">{viewingRoom.name}</p>
                </div>
                <div className="p-4 bg-slate-800/50 rounded-xl border border-slate-700">
                  <p className="text-xs text-slate-400 mb-1">Type</p>
                  <p className="font-semibold text-white">{viewingRoom.type}</p>
                </div>
                <div className="p-4 bg-slate-800/50 rounded-xl border border-slate-700">
                  <p className="text-xs text-slate-400 mb-1">Price</p>
                  <p className="font-semibold text-amber-400">{formatPrice(viewingRoom.price)}</p>
                </div>
                <div className="p-4 bg-slate-800/50 rounded-xl border border-slate-700">
                  <p className="text-xs text-slate-400 mb-1">Status</p>
                  <span className={`px-3 py-1 rounded-lg text-xs font-medium border ${
                    viewingRoom.status === 'Tersedia'
                      ? 'bg-green-500/20 text-green-400 border-green-500/30'
                      : viewingRoom.status === 'Penuh'
                      ? 'bg-red-500/20 text-red-400 border-red-500/30'
                      : 'bg-orange-500/20 text-orange-400 border-orange-500/30'
                  }`}>
                    {viewingRoom.status}
                  </span>
                </div>
              </div>
              <div>
                <p className="text-sm text-slate-400 mb-2">Facilities</p>
                <div className="flex flex-wrap gap-2">
                  {viewingRoom.facilities.map((facility, idx) => (
                    <span key={idx} className="px-3 py-1.5 bg-slate-800 border border-slate-700 rounded-lg text-sm text-slate-300">
                      {facility}
                    </span>
                  ))}
                </div>
              </div>
              <div className="p-4 bg-slate-800/50 rounded-xl border border-slate-700">
                <p className="text-xs text-slate-400 mb-2">Description</p>
                <p className="text-white">{viewingRoom.description}</p>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
