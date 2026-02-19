"use client";

import React, { useState, useEffect } from "react";
import { getImageUrl } from '@/app/utils/api-url';
import { Search, Plus, Edit, Trash2, Eye, Download, ChevronUp, ChevronDown } from 'lucide-react';
import { ImageWithFallback } from '@/app/components/shared/ImageWithFallback';
import { Button } from '@/app/components/ui/button';
import { Input } from '@/app/components/ui/input';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/app/components/ui/dialog';
import { Label } from '@/app/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/app/components/ui/select';
import { api } from '@/app/services/api';
import { toast } from 'sonner';
import { useTranslations } from 'next-intl';
import { motion } from "framer-motion";

interface Room {
  id: string;
  name: string;
  type: string;
  price: number;
  status: string;
  capacity: number;
  floor: number;
  size: string;
  bedrooms: number;
  bathrooms: number;
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
  size: string;
  bedrooms: number;
  bathrooms: number;
  description: string;
  image_url: string;
  fasilitas: string;
}

export function LuxuryRoomManagement() {
  const t = useTranslations('admin');
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
    type: 'Standard',
    price: 0,
    status: 'Tersedia',
    capacity: 1,
    facilities: [],
    floor: 1,
    size: '',
    bedrooms: 1,
    bathrooms: 1,
    description: ''
  });

  const fetchRooms = async () => {
    setIsLoading(true);
    try {
      const data = (await api.getRooms()) as BackendRoom[];
      const mapped: Room[] = data.map((r: BackendRoom) => ({
        id: String(r.id),
        name: r.nomor_kamar,
        type: r.tipe_kamar,
        price: r.harga_per_bulan,
        status: r.status as "Tersedia" | "Penuh" | "Maintenance",
        capacity: r.capacity || 1,
        floor: r.floor || 1,
        size: r.size || '3x4m',
        bedrooms: r.bedrooms || 1,
        bathrooms: r.bathrooms || 1,
        description: r.description || '',
        image: getImageUrl(r.image_url) || 'https://via.placeholder.com/300',
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
    data.append('tipe_kamar', formData.type || 'Standard');
    data.append('harga_per_bulan', String(formData.price));
    data.append('status', formData.status || 'Tersedia');
    data.append('capacity', String(formData.capacity));
    data.append('floor', String(formData.floor));
    data.append('size', formData.size || '');
    data.append('bedrooms', String(formData.bedrooms));
    data.append('bathrooms', String(formData.bathrooms));
    data.append('description', formData.description || '');
    // Handle facilities array to string
    data.append('fasilitas', Array.isArray(formData.facilities) ? formData.facilities.join(', ') : formData.facilities || '');

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
      console.error(e);
      toast.error(editingRoom ? t('failedToUpdate') : t('failedToCreate'));
    }
  };

  const handleDelete = async (id: string) => {
    if (window.confirm(t('deleteRoomConfirmation'))) {
      try {
        await api.deleteRoom(id);
        await fetchRooms();
      } catch (e) {
        console.error(e);
        toast.error(t('failedToDelete'));
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
      type: 'Standard',
      price: 0,
      status: 'Tersedia',
      capacity: 1,
      facilities: [],
      floor: 1,
      size: '',
      bedrooms: 1,
      bathrooms: 1,
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
    'Tersedia': 'bg-green-500/10 text-green-600 dark:text-green-400 border-green-500/20',
    'Penuh': 'bg-red-500/10 text-red-600 dark:text-red-500 border-red-500/20',
    'Maintenance': 'bg-orange-500/10 text-orange-600 dark:text-orange-400 border-orange-500/20'
  };

  return (
    <div className="p-4 md:p-8 space-y-6 md:space-y-8 bg-gray-50 dark:bg-slate-950 min-h-screen">
      {/* Header Section */}
      <motion.div 
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="flex flex-col md:flex-row md:items-center justify-between gap-4"
      >
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-amber-600 dark:text-amber-500 mb-1">
            {t('roomsTitle')}
          </h1>
          <p className="text-slate-500 dark:text-slate-400 text-xs md:text-sm">{t('roomsSubtitle')}</p>
        </div>

        <div className="flex items-center gap-3">
          <Button variant="outline" className="hidden sm:flex bg-white dark:bg-transparent border-slate-200 dark:border-slate-700 text-slate-700 dark:text-white hover:bg-slate-100 dark:hover:bg-slate-800 px-6">
            <Download className="size-4 mr-2" />
            {t('export')}
          </Button>
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button
                onClick={() => { setEditingRoom(null); setFormData({ name: '', type: 'Standard', price: 0, status: 'Tersedia', capacity: 1, facilities: [], floor: 1, size: '', bedrooms: 1, bathrooms: 1, description: '' }); }}
                className="flex-1 sm:flex-none bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-white shadow-lg shadow-amber-500/20 px-4 md:px-6 py-2 h-auto"
              >
                <Plus className="size-4 mr-2" />
                {t('addNewRoom')}
              </Button>
            </DialogTrigger>
            <DialogContent className="w-[95vw] max-w-2xl max-h-[90vh] overflow-y-auto bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white p-4 md:p-6">
              <DialogHeader>
                <DialogTitle className="text-xl md:text-2xl font-bold text-amber-600 dark:text-amber-500">
                  {editingRoom ? t('editRoom') : t('addNewRoom')}
                </DialogTitle>
              </DialogHeader>
              <div className="space-y-4 md:space-y-6 mt-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="name" className="text-slate-600 dark:text-slate-300">{t('roomName')}</Label>
                    <Input
                      id="name"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      placeholder="e.g., Room A1"
                      className="bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:ring-amber-500"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="type" className="text-slate-600 dark:text-slate-300">{t('type')}</Label>
                    <Select value={formData.type} onValueChange={(value) => setFormData({ ...formData, type: value })}>
                      <SelectTrigger className="bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent className="bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white">
                        <SelectItem value="Standard">{t('type_standard')}</SelectItem>
                        <SelectItem value="Premium">{t('type_premium')}</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="price" className="text-slate-600 dark:text-slate-300">{t('price')}</Label>
                    <Input
                      id="price"
                      type="number"
                      value={formData.price}
                      onChange={(e) => setFormData({ ...formData, price: Number(e.target.value) })}
                      placeholder="1500000"
                      className="bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:ring-amber-500"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="status" className="text-slate-600 dark:text-slate-300">{t('status')}</Label>
                    <Select value={formData.status} onValueChange={(value) => setFormData({ ...formData, status: value as 'Tersedia' | 'Penuh' | 'Maintenance' })}>
                      <SelectTrigger className="bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent className="bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white">
                        <SelectItem value="Tersedia">{t('status_tersedia')}</SelectItem>
                        <SelectItem value="Penuh">{t('status_penuh')}</SelectItem>
                        <SelectItem value="Maintenance">{t('status_maintenance')}</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="capacity" className="text-slate-600 dark:text-slate-300">{t('capacity')}</Label>
                    <Input
                      id="capacity"
                      type="number"
                      value={formData.capacity}
                      onChange={(e) => setFormData({ ...formData, capacity: Number(e.target.value) })}
                      min="1"
                      className="bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:ring-amber-500"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="floor" className="text-slate-600 dark:text-slate-300">{t('floor')}</Label>
                    <Input
                      id="floor"
                      type="number"
                      value={formData.floor}
                      onChange={(e) => setFormData({ ...formData, floor: Number(e.target.value) })}
                      min="1"
                      className="bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:ring-amber-500"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="size" className="text-slate-600 dark:text-slate-300">{t('size')}</Label>
                    <Input
                      id="size"
                      value={formData.size}
                      onChange={(e) => setFormData({ ...formData, size: e.target.value })}
                      placeholder="e.g. 4x5m"
                      className="bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:ring-amber-500"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="bedrooms" className="text-slate-600 dark:text-slate-300">{t('bedrooms')}</Label>
                    <Input
                      id="bedrooms"
                      type="number"
                      value={formData.bedrooms}
                      onChange={(e) => setFormData({ ...formData, bedrooms: Number(e.target.value) })}
                      min="1"
                      className="bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:ring-amber-500"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="bathrooms" className="text-slate-600 dark:text-slate-300">{t('bathrooms')}</Label>
                    <Input
                      id="bathrooms"
                      type="number"
                      value={formData.bathrooms}
                      onChange={(e) => setFormData({ ...formData, bathrooms: Number(e.target.value) })}
                      min="1"
                      className="bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:ring-amber-500"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="facilities" className="text-slate-600 dark:text-slate-300">{t('facilities')}</Label>
                  <Input
                    id="facilities"
                    value={Array.isArray(formData.facilities) ? formData.facilities.join(', ') : formData.facilities}
                    onChange={(e) => setFormData({ ...formData, facilities: e.target.value.split(',').map(s => s.trim()) })}
                    placeholder="TV, AC, WiFi, Bathroom"
                    className="bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:ring-amber-500"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="description" className="text-slate-600 dark:text-slate-300">{t('description')}</Label>
                  <textarea
                    id="description"
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    className="w-full h-24 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white rounded-lg p-3 focus:ring-amber-500 focus:outline-none text-sm"
                    placeholder="Describe the room..."
                  />
                </div>

                <div className="space-y-3">
                  <Label className="text-slate-600 dark:text-slate-300">{t('roomImage')}</Label>
                  <div className="flex flex-col gap-4">
                    {/* Image Preview Area */}
                    {(imageFile || formData.image) && (
                      <div className="relative w-full h-48 md:h-56 rounded-xl overflow-hidden border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 group">
                        <ImageWithFallback
                          src={imageFile ? URL.createObjectURL(imageFile) : formData.image}
                          alt="Room Preview"
                          className="w-full h-full object-cover transition-transform group-hover:scale-105"
                        />
                        <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                          <p className="text-white font-medium text-sm">{t('currentPreview')}</p>
                        </div>
                        {imageFile && (
                          <button
                            onClick={() => setImageFile(null)}
                            className="absolute top-2 right-2 p-1.5 bg-red-500/80 text-white rounded-full hover:bg-red-600 transition-colors"
                          >
                            <Trash2 className="size-4" />
                          </button>
                        )}
                      </div>
                    )}

                    {/* Styled Upload Button */}
                    <div className="relative">
                      <input
                        type="file"
                        id="image-upload"
                        className="hidden"
                        accept="image/*"
                        onChange={(e: React.ChangeEvent<HTMLInputElement>) => setImageFile(e.target.files?.[0] || null)}
                      />
                      <label
                        htmlFor="image-upload"
                        className={`
                          flex flex-col items-center justify-center w-full p-8 border-2 border-dashed rounded-xl cursor-pointer transition-all
                          ${imageFile 
                            ? 'border-emerald-500/30 bg-emerald-500/5 hover:bg-emerald-500/10' 
                            : 'border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/50 hover:bg-slate-100 dark:hover:bg-slate-800 hover:border-amber-500/50'
                          }
                        `}
                      >
                        <div className={`
                          p-4 rounded-full mb-3 transition-colors
                          ${imageFile ? 'bg-emerald-500/20 text-emerald-400' : 'bg-slate-200 dark:bg-slate-800 text-amber-500 group-hover:scale-110'}
                        `}>
                          {imageFile ? <Eye className="size-6" /> : <Download className="size-6 rotate-180" />} 
                        </div>
                        <p className="text-sm font-bold text-slate-600 dark:text-slate-300 mb-1">
                          {imageFile ? t('changeImage') : t('clickToUpload')}
                        </p>
                        <p className="text-xs text-slate-400 dark:text-slate-500 text-center max-w-xs">
                          {imageFile 
                            ? t('selectedFile', { filename: imageFile.name })
                            : t('imageFormatHelp')
                          }
                        </p>
                      </label>
                    </div>
                  </div>
                </div>

                <div className="flex justify-end gap-3 pt-4">
                  <Button variant="outline" onClick={resetForm} className="bg-transparent border-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800">
                    {t('cancel')}
                  </Button>
                  <Button
                    onClick={handleSubmit}
                    className="bg-amber-500 hover:bg-amber-600 text-white"
                  >
                    {editingRoom ? t('update') : t('create')}
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </motion.div>

      {/* Filter Bar */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1, duration: 0.4 }}
        className="flex flex-col lg:flex-row lg:items-center gap-4"
      >
        <div className="relative flex-1">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 size-4 text-slate-400 dark:text-slate-400" />
          <Input
            placeholder={t('searchRooms')}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-12 bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-500 h-11 md:h-12 rounded-xl"
          />
        </div>
        <div className="grid grid-cols-2 gap-3 md:flex md:gap-4">
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white h-11 md:h-12 rounded-xl">
              <SelectValue placeholder={t('filterStatus')} />
            </SelectTrigger>
            <SelectContent className="bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white">
              <SelectItem value="All">{t('allStatus')}</SelectItem>
              <SelectItem value="Tersedia">{t('status_tersedia')}</SelectItem>
              <SelectItem value="Penuh">{t('status_penuh')}</SelectItem>
              <SelectItem value="Maintenance">{t('status_maintenance')}</SelectItem>
            </SelectContent>
          </Select>
          <Select value={typeFilter} onValueChange={setTypeFilter}>
            <SelectTrigger className="bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white h-11 md:h-12 rounded-xl">
              <SelectValue placeholder={t('filterType')} />
            </SelectTrigger>
            <SelectContent className="bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white">
              <SelectItem value="All">{t('allTypes')}</SelectItem>
              <SelectItem value="Single">Single</SelectItem>
              <SelectItem value="Double">Double</SelectItem>
              <SelectItem value="Suite">Suite</SelectItem>
              <SelectItem value="Deluxe">Deluxe</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </motion.div>

      {/* Table Container */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2, duration: 0.4 }}
        className="bg-white/50 dark:bg-slate-900/20 md:border md:border-slate-200 md:dark:border-slate-800 rounded-[1.5rem] md:rounded-[2rem] p-4 md:p-8 backdrop-blur-sm shadow-xl dark:shadow-xl"
      >
        {/* Table Header Row - Desktop Only */}
        <div className="hidden md:grid grid-cols-[100px_1fr_1fr_1.2fr_0.6fr_1.2fr_100px] gap-4 px-6 mb-8 text-slate-500 dark:text-slate-400 text-xs font-bold uppercase tracking-widest">
          <div>{t('thumbnail')}</div>
          <div className="flex items-center cursor-pointer hover:text-slate-900 dark:hover:text-white" onClick={() => toggleSort('name')}>
            {t('room')} <ChevronUp className="size-3 ml-1" />
          </div>
          <div>{t('type')}</div>
          <div className="flex items-center cursor-pointer hover:text-slate-900 dark:hover:text-white" onClick={() => toggleSort('price')}>
            {t('price')} <ChevronDown className="size-3 ml-1" />
          </div>
          <div className="text-center">{t('floor')}</div>
          <div>{t('status')}</div>
          <div className="text-center">{t('actions')}</div>
        </div>

        {/* Data Rows */}
        <div className="space-y-4">
          {isLoading ? (
            <div className="flex flex-col items-center justify-center py-20 gap-4">
              <div className="size-10 border-4 border-amber-500/20 border-t-amber-500 rounded-full animate-spin" />
              <p className="text-slate-500 italic">{t('syncing')}</p>
            </div>
          ) : filteredRooms.length === 0 ? (
            <div className="text-center py-20 bg-slate-100 dark:bg-slate-900/40 rounded-2xl border border-dashed border-slate-300 dark:border-slate-800">
              <Search className="size-12 text-slate-400 dark:text-slate-700 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-slate-400 dark:text-slate-400">{t('noRoomsFound')}</h3>
              <p className="text-slate-500 dark:text-slate-600 mt-2 text-sm italic">{t('tryAdjustingFilters')}</p>
            </div>
          ) : (
            filteredRooms.map((room) => (
              <div key={room.id}>
                {/* Desktop Row */}
                <div className="hidden md:grid grid-cols-[100px_1fr_1fr_1.2fr_0.6fr_1.2fr_100px] gap-4 px-6 py-4 items-center bg-slate-50 dark:bg-slate-800/20 hover:bg-slate-100 dark:hover:bg-slate-800/40 rounded-2xl transition-all border border-transparent hover:border-slate-200 dark:hover:border-slate-800 group">
                  <div className="relative size-16 rounded-xl overflow-hidden border border-slate-200 dark:border-slate-700">
                    <ImageWithFallback
                      src={room.image}
                      alt={room.name}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div>
                    <h3 className="text-slate-900 dark:text-white font-bold">{room.name}</h3>
                    <p className="text-slate-400 dark:text-slate-500 text-[10px] font-mono">ID: R{String(room.id).padStart(3, '0')}</p>
                  </div>
                  <div>
                    <span className="px-3 py-1 bg-blue-500/10 text-blue-600 dark:text-blue-400 text-[10px] font-bold rounded-lg border border-blue-500/20 uppercase">
                      {room.type}
                    </span>
                  </div>
                  <div>
                    <p className="text-slate-900 dark:text-white font-bold">{formatPrice(room.price)}</p>
                    <p className="text-slate-400 dark:text-slate-500 text-[10px]">{t('perMonth')}</p>
                  </div>
                  <div className="text-center text-slate-900 dark:text-white font-medium">{room.floor}</div>
                  <div>
                    <span className={`px-4 py-1.5 rounded-lg text-[10px] font-bold uppercase tracking-wider border ${statusColors[room.status] || ''}`}>
                      {t(('status_' + room.status.toLowerCase()) as "status_tersedia")}
                    </span>
                  </div>
                  <div className="flex items-center justify-center gap-1">
                    <Button variant="ghost" size="icon" onClick={() => setViewingRoom(room)} className="size-8 text-slate-400 hover:text-slate-900 dark:hover:text-white"><Eye className="size-4" /></Button>
                    <Button variant="ghost" size="icon" onClick={() => handleEdit(room)} className="size-8 text-slate-400 hover:text-amber-500"><Edit className="size-4" /></Button>
                    <Button variant="ghost" size="icon" onClick={() => handleDelete(room.id)} className="size-8 text-slate-400 hover:text-red-500"><Trash2 className="size-4" /></Button>
                  </div>
                </div>

                {/* Mobile Card */}
                <div className="md:hidden flex flex-col p-4 bg-white dark:bg-slate-900/40 border border-slate-200 dark:border-slate-800 rounded-2xl gap-4 shadow-sm dark:shadow-none">
                  <div className="flex gap-4">
                    <div className="relative size-20 rounded-xl overflow-hidden border border-slate-200 dark:border-slate-700 flex-shrink-0">
                      <ImageWithFallback
                        src={room.image}
                        alt={room.name}
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex justify-between items-start mb-1">
                        <h3 className="text-slate-900 dark:text-white font-bold truncate">{room.name}</h3>
                        <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${statusColors[room.status] || ''}`}>
                          {t(('status_' + room.status.toLowerCase()) as "status_tersedia")}
                        </span>
                      </div>
                      <p className="text-amber-600 dark:text-amber-500 font-bold text-sm mb-1">{formatPrice(room.price)}</p>
                      <div className="flex gap-2 items-center">
                        <span className="px-2 py-0.5 bg-blue-500/10 text-blue-600 dark:text-blue-400 text-[10px] font-bold rounded border border-blue-500/20 uppercase">
                          {room.type}
                        </span>
                        <span className="text-[10px] text-slate-500 font-medium">{t('floor')} {room.floor}</span>
                      </div>
                    </div>
                  </div>
                  <div className="flex gap-2 pt-2 border-t border-slate-200 dark:border-slate-800">
                    <Button variant="ghost" className="flex-1 text-slate-500 dark:text-slate-400 h-9" onClick={() => setViewingRoom(room)}>
                      <Eye className="size-4 mr-2" /> {t('detail')}
                    </Button>
                    <Button variant="ghost" className="flex-1 text-slate-500 dark:text-slate-400 h-9" onClick={() => handleEdit(room)}>
                      <Edit className="size-4 mr-2" /> {t('edit')}
                    </Button>
                    <Button variant="ghost" className="size-9 p-0 text-slate-500 hover:text-red-500" onClick={() => handleDelete(room.id)}>
                      <Trash2 className="size-4" />
                    </Button>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </motion.div>

      {/* View Dialog - Responsive */}
      <Dialog open={!!viewingRoom} onOpenChange={() => setViewingRoom(null)}>
        <DialogContent className="w-[95vw] max-w-2xl bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white p-0 overflow-hidden rounded-2xl md:rounded-[2rem]">
          {viewingRoom && (
            <div className="space-y-0">
              <div className="aspect-video relative">
                <ImageWithFallback
                  src={viewingRoom.image}
                  alt={viewingRoom.name}
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent" />
                <div className="absolute bottom-4 md:bottom-6 left-4 md:left-8">
                  <h2 className="text-2xl md:text-3xl font-black text-white">{viewingRoom.name}</h2>
                  <p className="text-amber-400 text-xs md:text-sm font-bold uppercase tracking-tight mt-1">{viewingRoom.type} • {t('floor')} {viewingRoom.floor}</p>
                </div>
              </div>

              <div className="p-4 md:p-8 space-y-6 md:space-y-8">
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 md:gap-4">
                  <div className="p-3 md:p-4 bg-slate-50 dark:bg-slate-800/40 rounded-xl border border-slate-200 dark:border-slate-700/50">
                    <p className="text-slate-500 text-[10px] uppercase font-bold tracking-widest mb-1">{t('status')}</p>
                    <p className={`font-black text-xs md:text-sm uppercase ${viewingRoom.status === 'Tersedia' ? 'text-green-600 dark:text-green-400' : 'text-red-500 dark:text-red-400'}`}>
                      {t(('status_' + viewingRoom.status.toLowerCase()) as "status_tersedia")}
                    </p>
                  </div>
                  <div className="p-3 md:p-4 bg-slate-50 dark:bg-slate-800/40 rounded-xl border border-slate-200 dark:border-slate-700/50">
                    <p className="text-slate-500 text-[10px] uppercase font-bold tracking-widest mb-1">{t('price')}</p>
                    <p className="font-black text-xs md:text-sm text-amber-600 dark:text-amber-500">{formatPrice(viewingRoom.price)}</p>
                  </div>
                  <div className="p-3 md:p-4 bg-slate-50 dark:bg-slate-800/40 rounded-xl border border-slate-200 dark:border-slate-700/50">
                    <p className="text-slate-500 text-[10px] uppercase font-bold tracking-widest mb-1">{t('floor')}</p>
                    <p className="font-black text-xs md:text-sm text-slate-900 dark:text-white">{viewingRoom.floor}</p>
                  </div>
                  <div className="p-3 md:p-4 bg-slate-50 dark:bg-slate-800/40 rounded-xl border border-slate-200 dark:border-slate-700/50">
                    <p className="text-slate-500 text-[10px] uppercase font-bold tracking-widest mb-1">{t('capacity')}</p>
                    <p className="font-black text-xs md:text-sm text-slate-900 dark:text-white">{viewingRoom.capacity}</p>
                  </div>
                </div>

                <div>
                  <p className="text-slate-500 dark:text-slate-400 text-[10px] font-bold uppercase tracking-widest mb-3 md:mb-4">{t('facilities')}</p>
                  <div className="flex flex-wrap gap-1.5 md:gap-2">
                    {viewingRoom.facilities.length > 0 ? viewingRoom.facilities.map((f, i) => (
                      <span key={i} className="px-3 py-1.5 bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 rounded-lg text-[10px] font-medium">{f}</span>
                    )) : <span className="text-slate-500 text-[10px] italic">{t('noFacilities')}</span>}
                  </div>
                </div>

                <div>
                  <p className="text-slate-500 dark:text-slate-400 text-[10px] font-bold uppercase tracking-widest mb-1 md:mb-2">{t('description')}</p>
                  <p className="text-slate-600 dark:text-slate-300 text-xs md:text-sm leading-relaxed italic">
                    &quot;{viewingRoom.description || t('noDescription')}&quot;
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
