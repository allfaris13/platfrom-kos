import { useState, useEffect } from 'react';
import { Search, Trash2, Plus, Upload } from 'lucide-react';
import Image from 'next/image';
import { Input } from '@/app/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/app/components/ui/select';
import { Button } from '@/app/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/app/components/ui/dialog';
import { Label } from '@/app/components/ui/label';
import { api } from '@/app/services/api';

interface Gallery {
  id: number;
  title: string;
  category: string;
  image_url: string;
  created_at: string;
}

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080/api';

export function GalleryData() {
  const [galleries, setGalleries] = useState<Gallery[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('All');
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  
  // Form State
  const [title, setTitle] = useState('');
  const [category, setCategory] = useState('');
  const [imageFile, setImageFile] = useState<File | null>(null);

  const fetchGalleries = async () => {
    try {
      const data = await api.getGalleries();
      setGalleries(data);
    } catch (error) {
      console.error("Failed to fetch galleries:", error);
    }
  };

  useEffect(() => {
    fetchGalleries();
  }, []);

  const handleCreate = async () => {
    if (!imageFile) return;
    const formData = new FormData();
    formData.append('title', title);
    formData.append('category', category);
    formData.append('image', imageFile);

    try {
      await api.createGallery(formData);
      fetchGalleries();
      setIsDialogOpen(false);
      // Reset form
      setTitle('');
      setCategory('');
      setImageFile(null);
    } catch (error) {
      console.error("Failed to create gallery:", error);
    }
  };

  const handleDelete = async (id: number) => {
    if(!confirm("Are you sure?")) return;
    try {
      await api.deleteGallery(id);
      fetchGalleries();
    } catch (error) {
      console.error("Failed to delete gallery:", error);
    }
  };

  const filteredImages = galleries.filter(img => {
    const matchesSearch = img.title.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = categoryFilter === 'All' || img.category === categoryFilter;
    return matchesSearch && matchesCategory;
  });

  const categories = ['All', ...Array.from(new Set(galleries.map(img => img.category)))];

  return (
    <div className="p-6 space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-3xl font-semibold text-white">Gallery Data</h2>
          <p className="text-slate-400 mt-1">Manage property images and media</p>
        </div>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
             <Button className="bg-amber-500 hover:bg-amber-600 text-white"><Plus className="size-4 mr-2"/> Add Image</Button>
          </DialogTrigger>
          <DialogContent className="bg-slate-900 border-slate-800 text-white">
            <DialogHeader>
              <DialogTitle>Add New Image</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label>Title</Label>
                <Input value={title} onChange={e => setTitle(e.target.value)} className="bg-slate-800 border-slate-700"/>
              </div>
              <div>
                <Label>Category</Label>
                <Input value={category} onChange={e => setCategory(e.target.value)} className="bg-slate-800 border-slate-700"/>
              </div>
              <div>
                <Label>Image</Label>
                <div className="border-2 border-dashed border-slate-700 rounded-lg p-4 cursor-pointer hover:border-amber-500">
                    <input type="file" onChange={e => setImageFile(e.target.files?.[0] || null)} className="w-full bg-transparent"/>
                </div>
              </div>
              <Button onClick={handleCreate} className="w-full bg-amber-500">Upload</Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4">
        {/* ... Search and Filter Inputs ... */}
        <div className="relative flex-1 max-w-md">
           <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-slate-400" />
           <Input
             placeholder="Search images..."
             value={searchQuery}
             onChange={(e) => setSearchQuery(e.target.value)}
             className="pl-10 bg-slate-800 border-slate-700 text-white"
           />
        </div>
      </div>

      {/* Gallery Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {filteredImages.map((image) => (
          <div key={image.id} className="bg-slate-800 rounded-lg border border-slate-700 overflow-hidden hover:shadow-lg transition-shadow relative group">
            <div className="aspect-video overflow-hidden relative">
              <Image
                src={image.image_url.startsWith('http') ? image.image_url : `http://localhost:8080${image.image_url}`}
                alt={image.title}
                width={400}
                height={225}
                className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
              />
              <button 
                onClick={() => handleDelete(image.id)}
                className="absolute top-2 right-2 p-2 bg-red-600 rounded-full opacity-0 group-hover:opacity-100 transition-opacity text-white"
              >
                <Trash2 className="size-4" />
              </button>
            </div>
            <div className="p-4">
              <h3 className="font-medium text-white">{image.title}</h3>
              <div className="flex items-center justify-between mt-2">
                <span className="px-2 py-1 bg-blue-500/20 text-blue-400 rounded text-xs border border-blue-500/30">
                  {image.category}
                </span>
                <span className="text-xs text-slate-400">{new Date(image.created_at).toLocaleDateString()}</span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
