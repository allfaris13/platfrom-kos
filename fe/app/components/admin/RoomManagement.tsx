"use client";

import { useState, useEffect } from 'react';
import { toast } from 'sonner';
import Image from 'next/image';
import { Search, Plus, Edit, Trash2, Eye, Loader2 } from 'lucide-react';
import { api } from '@/app/services/api';
import { Button } from '@/app/components/ui/button';
import { Input } from '@/app/components/ui/input';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/app/components/ui/dialog';
import { Label } from '@/app/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/app/components/ui/select';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/app/components/ui/table';

interface Room {
  id: string;
  name: string;
  type: string;
  price: number;
  status: string;
  capacity: number;
  floor: number;
  description: string;
  image: string;
  facilities: string[];
}

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

export function RoomManagement() {
  const [rooms, setRooms] = useState<Room[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingRoom, setEditingRoom] = useState<Room | null>(null);
  const [viewingRoom, setViewingRoom] = useState<Room | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [imageFile, setImageFile] = useState<File | null>(null);

  const fetchRooms = async () => {
    setIsLoading(true);
    try {
      const data = (await api.getRooms()) as BackendRoom[];
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
        facilities: r.fasilitas ? r.fasilitas.split(',').map((f: string) => f.trim()) : []
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

  const filteredRooms = rooms.filter(room =>
    room.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    room.type.toLowerCase().includes(searchQuery.toLowerCase())
  );

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
    } catch (e) {
        toast.error("Failed to save room");
    }
  };

  const handleDelete = async (id: string) => {
    if (window.confirm('Are you sure?')) {
      try {
          await api.deleteRoom(id);
          await fetchRooms();
          toast.success("Room deleted");
      } catch (e) {
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
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0
    }).format(price);
  };

  return (
    <div className="p-6 space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-3xl font-semibold">Room Management</h2>
          <p className="text-slate-600 mt-1">Manage all rooms and their details</p>
        </div>

        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button onClick={() => { setEditingRoom(null); setFormData({ name: '', type: 'Single', price: 0, status: 'Tersedia', capacity: 1, facilities: [], floor: 1, description: '' }); }}>
              <Plus className="size-4 mr-2" />
              Add Room
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>{editingRoom ? 'Edit Room' : 'Add New Room'}</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 mt-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="name">Room Name</Label>
                  <Input
                    id="name"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder="e.g., Kamar A1"
                  />
                </div>
                <div>
                  <Label htmlFor="type">Type</Label>
                  <Select value={formData.type} onValueChange={(value) => setFormData({ ...formData, type: value })}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Single">Single</SelectItem>
                      <SelectItem value="Double">Double</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="price">Price (IDR)</Label>
                  <Input
                    id="price"
                    type="number"
                    value={formData.price}
                    onChange={(e) => setFormData({ ...formData, price: Number(e.target.value) })}
                    placeholder="1500000"
                  />
                </div>
                <div>
                  <Label htmlFor="status">Status</Label>
                  <Select value={formData.status} onValueChange={(value: string) => setFormData({ ...formData, status: value })}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Tersedia">Tersedia</SelectItem>
                      <SelectItem value="Penuh">Penuh</SelectItem>
                      <SelectItem value="Maintenance">Maintenance</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="capacity">Capacity</Label>
                  <Input
                    id="capacity"
                    type="number"
                    value={formData.capacity}
                    onChange={(e) => setFormData({ ...formData, capacity: Number(e.target.value) })}
                    min="1"
                  />
                </div>
                <div>
                  <Label htmlFor="floor">Floor</Label>
                  <Input
                    id="floor"
                    type="number"
                    value={formData.floor}
                    onChange={(e) => setFormData({ ...formData, floor: Number(e.target.value) })}
                    min="1"
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="description">Description</Label>
                <Input
                  id="description"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Room description"
                />
              </div>

              <div>
                <Label>Room Image</Label>
                <Input type="file" onChange={e => setImageFile(e.target.files?.[0] || null)} className="mt-1" />
              </div>

              <div className="flex justify-end gap-2 mt-6">
                <Button variant="outline" onClick={resetForm}>Cancel</Button>
                <Button onClick={handleSubmit}>
                  {editingRoom ? 'Update' : 'Create'}
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Search Bar */}
      <div className="flex items-center gap-2 max-w-md">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-slate-400" />
          <Input
            placeholder="Search rooms..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-lg border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Room ID</TableHead>
              <TableHead>Name</TableHead>
              <TableHead>Type</TableHead>
              <TableHead>Price</TableHead>
              <TableHead>Floor</TableHead>
              <TableHead>Capacity</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              <TableRow>
                <TableCell colSpan={8} className="text-center py-10">
                  <div className="flex flex-col items-center gap-2">
                    <Loader2 className="w-8 h-8 animate-spin text-slate-400" />
                    <p className="text-slate-500">Loading rooms...</p>
                  </div>
                </TableCell>
              </TableRow>
            ) : filteredRooms.length === 0 ? (
              <TableRow>
                <TableCell colSpan={8} className="text-center py-10 text-slate-500">
                  No rooms found.
                </TableCell>
              </TableRow>
            ) : filteredRooms.map((room) => (
              <TableRow key={room.id}>
                <TableCell className="font-medium">{room.id}</TableCell>
                <TableCell>{room.name}</TableCell>
                <TableCell>{room.type}</TableCell>
                <TableCell>{formatPrice(room.price)}</TableCell>
                <TableCell>{room.floor}</TableCell>
                <TableCell>{room.capacity}</TableCell>
                <TableCell>
                  <span className={`px-3 py-1 rounded-full text-xs font-medium ${room.status === 'Tersedia'
                      ? 'bg-green-100 text-green-700'
                      : room.status === 'Penuh'
                        ? 'bg-red-100 text-red-700'
                        : 'bg-orange-100 text-orange-700'
                    }`}>
                    {room.status}
                  </span>
                </TableCell>
                <TableCell className="text-right">
                  <div className="flex justify-end gap-2">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setViewingRoom(room)}
                    >
                      <Eye className="size-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleEdit(room)}
                    >
                      <Edit className="size-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleDelete(room.id)}
                    >
                      <Trash2 className="size-4 text-red-600" />
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      {/* View Dialog */}
      <Dialog open={!!viewingRoom} onOpenChange={() => setViewingRoom(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Room Details</DialogTitle>
          </DialogHeader>
          {viewingRoom && (
            <div className="space-y-4">
              <div className="relative w-full h-48">
                <Image
                  src={viewingRoom.image}
                  alt={viewingRoom.name}
                  fill
                  className="object-cover rounded-lg"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-slate-600">Room Name</p>
                  <p className="font-medium">{viewingRoom.name}</p>
                </div>
                <div>
                  <p className="text-sm text-slate-600">Type</p>
                  <p className="font-medium">{viewingRoom.type}</p>
                </div>
                <div>
                  <p className="text-sm text-slate-600">Price</p>
                  <p className="font-medium">{formatPrice(viewingRoom.price)}</p>
                </div>
                <div>
                  <p className="text-sm text-slate-600">Status</p>
                  <span className={`px-3 py-1 rounded-full text-xs font-medium ${viewingRoom.status === 'Tersedia'
                      ? 'bg-green-100 text-green-700'
                      : viewingRoom.status === 'Penuh'
                        ? 'bg-red-100 text-red-700'
                        : 'bg-orange-100 text-orange-700'
                    }`}>
                    {viewingRoom.status}
                  </span>
                </div>
              </div>
              <div>
                <p className="text-sm text-slate-600">Facilities</p>
                <div className="flex flex-wrap gap-2 mt-2">
                  {viewingRoom.facilities.map((facility: string, idx: number) => (
                    <span key={idx} className="px-3 py-1 bg-slate-100 rounded-full text-sm">
                      {facility}
                    </span>
                  ))}
                </div>
              </div>
              <div>
                <p className="text-sm text-slate-600">Description</p>
                <p className="mt-1">{viewingRoom.description}</p>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
