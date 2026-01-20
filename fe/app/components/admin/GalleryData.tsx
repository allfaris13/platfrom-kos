import { useState } from 'react';
import { Search } from 'lucide-react';
import Image from 'next/image';
import { galleryImages } from '@/app/data/mockData';
import { Input } from '@/app/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/app/components/ui/select';

export function GalleryData() {
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('All');

  const filteredImages = galleryImages.filter(img => {
    const matchesSearch = img.title.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = categoryFilter === 'All' || img.category === categoryFilter;
    return matchesSearch && matchesCategory;
  });

  const categories = ['All', ...Array.from(new Set(galleryImages.map(img => img.category)))];

  return (
    <div className="p-6 space-y-6">
      <div>
        <h2 className="text-3xl font-semibold">Gallery Data</h2>
        <p className="text-slate-600 mt-1">Manage property images and media</p>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-slate-400" />
          <Input
            placeholder="Search images..."
            value={searchQuery}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>
        <Select value={categoryFilter} onValueChange={setCategoryFilter}>
          <SelectTrigger className="w-full sm:w-48">
            <SelectValue placeholder="Category" />
          </SelectTrigger>
          <SelectContent>
            {categories.map(cat => (
              <SelectItem key={cat} value={cat}>{cat}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Gallery Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {filteredImages.map((image) => (
          <div key={image.id} className="bg-white rounded-lg border overflow-hidden hover:shadow-lg transition-shadow">
            <div className="aspect-video overflow-hidden">
              <Image
                src={image.imageUrl}
                alt={image.title}
                width={400}
                height={225}
                className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
              />
            </div>
            <div className="p-4">
              <h3 className="font-medium">{image.title}</h3>
              <div className="flex items-center justify-between mt-2">
                <span className="px-2 py-1 bg-blue-100 text-blue-700 rounded text-xs">
                  {image.category}
                </span>
                <span className="text-xs text-slate-500">{image.uploadDate}</span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
