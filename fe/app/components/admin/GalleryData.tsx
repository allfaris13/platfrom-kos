"use client";

import { useState, useEffect } from 'react';
import { Search, Trash2, Plus, Download, Eye } from 'lucide-react';
import Image from 'next/image';
import { Input } from '@/app/components/ui/input';
import { Button } from '@/app/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/app/components/ui/dialog';
import { Label } from '@/app/components/ui/label';
import { api } from '@/app/services/api';
import { getImageUrl } from '@/app/utils/api-url';
import { useTranslations } from 'next-intl';
import { motion } from "framer-motion";

interface Gallery {
  id: number;
  title: string;
  category: string;
  image_url: string;
  created_at: string;
}



export function GalleryData() {
  const t = useTranslations('admin');
  const [galleries, setGalleries] = useState<Gallery[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  // Form State
  const [title, setTitle] = useState('');
  const [category, setCategory] = useState('');
  const [imageFile, setImageFile] = useState<File | null>(null);

  const fetchGalleries = async () => {
    try {
      const data = await api.getGalleries();
      setGalleries(data as Gallery[]);
    } catch (error) {
      console.error("Failed to fetch galleries:", error);
    }
  };

  useEffect(() => {
    // Fetch initial data on mount
    const loadData = async () => {
      await fetchGalleries();
    };
    void loadData();
  }, []);

  const handleCreate = async () => {
    if (!imageFile) return;
    const formData = new FormData();
    formData.append('title', title);
    formData.append('category', category);
    formData.append('image', imageFile);

    try {
      await api.createGallery(formData);
      void fetchGalleries();
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
    if (!confirm(t('deleteImageConfirm'))) return;
    try {
      await api.deleteGallery(id.toString());
      void fetchGalleries();
    } catch (error) {
      console.error("Failed to delete gallery:", error);
    }
  };

  const filteredImages = galleries.filter(img => {
    return img.title.toLowerCase().includes(searchQuery.toLowerCase());
  });

  return (
    <div className="p-4 md:p-8 space-y-6 md:space-y-8 bg-gray-50 dark:bg-slate-950 min-h-screen">
      <motion.div 
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="flex flex-col md:flex-row md:items-center justify-between gap-4"
      >
        <div>
          <h2 className="text-2xl md:text-3xl font-bold text-amber-600 dark:text-amber-500">{t('galleryTitle')}</h2>
          <p className="text-slate-500 dark:text-slate-400 text-xs md:text-sm">{t('gallerySubtitle')}</p>
        </div>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button className="w-full md:w-auto bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-white shadow-lg shadow-amber-500/20">
              <Plus className="size-4 mr-2" /> {t('addNewImage')}
            </Button>
          </DialogTrigger>
          <DialogContent className="w-[95vw] max-w-md bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white p-4 md:p-6">
            <DialogHeader>
              <DialogTitle className="text-xl font-bold text-amber-600 dark:text-amber-500">{t('addNewImage')}</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 md:space-y-5 mt-4">
              <div className="space-y-2">
                <Label className="text-slate-600 dark:text-slate-300">{t('imageTitle')}</Label>
                <Input value={title} onChange={e => setTitle(e.target.value)} placeholder="e.g., Deluxe Room Interior" className="bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white" />
              </div>
              <div className="space-y-2">
                <Label className="text-slate-600 dark:text-slate-300">{t('category')}</Label>
                <Input value={category} onChange={e => setCategory(e.target.value)} placeholder="e.g., Interior, Facilities" className="bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white" />
              </div>
              <div className="space-y-3">
                <Label className="text-slate-600 dark:text-slate-300">{t('imageFileLabel')}</Label>
                <div className="flex flex-col gap-4">
                  {(imageFile) && (
                    <div className="relative w-full h-48 rounded-xl overflow-hidden border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 group">
                      <Image
                        src={URL.createObjectURL(imageFile)}
                        alt="Preview"
                        fill
                        className="object-cover transition-transform group-hover:scale-105"
                      />
                      <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                        <p className="text-white font-medium text-sm">{t('currentPreview')}</p>
                      </div>
                      <button
                        onClick={() => setImageFile(null)}
                        className="absolute top-2 right-2 p-1.5 bg-red-500/80 text-white rounded-full hover:bg-red-600 transition-colors"
                      >
                        <Trash2 className="size-4" />
                      </button>
                    </div>
                  )}

                  <div className="relative">
                    <input
                      type="file"
                      id="gallery-upload"
                      className="hidden"
                      accept="image/*"
                      onChange={(e: React.ChangeEvent<HTMLInputElement>) => setImageFile(e.target.files?.[0] || null)}
                    />
                    <label
                      htmlFor="gallery-upload"
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
              <Button onClick={handleCreate} className="w-full bg-amber-500 hover:bg-amber-600 text-white py-6">{t('uploadAsset')}</Button>
            </div>
          </DialogContent>
        </Dialog>
      </motion.div>

      {/* Filters */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1, duration: 0.4 }}
        className="flex flex-col sm:flex-row items-center gap-4"
      >
        <div className="relative flex-1 w-full max-w-md">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 size-4 text-slate-400 dark:text-slate-500" />
          <Input
            placeholder={t('searchGallery')}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-12 bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-500 h-10 md:h-12 rounded-xl"
          />
        </div>
      </motion.div>

      {/* Gallery Grid */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2, duration: 0.4 }}
        className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3 md:gap-6 pb-20 md:pb-0"
      >
        {filteredImages.length === 0 ? (
          <div className="col-span-full py-20 text-center bg-slate-100 dark:bg-slate-900/40 rounded-3xl border border-dashed border-slate-300 dark:border-slate-800">
            <Search className="size-12 text-slate-400 dark:text-slate-700 mx-auto mb-4" />
            <p className="text-slate-500">{t('noImagesFound')}</p>
          </div>
        ) : filteredImages.map((image) => (
          <div key={image.id} className="bg-white dark:bg-slate-900/40 rounded-2xl border border-slate-200 dark:border-slate-800 overflow-hidden hover:border-amber-500/30 transition-all duration-300 group shadow-sm dark:shadow-none">
            <div className="aspect-[4/3] overflow-hidden relative">
              <Image
                src={getImageUrl(image.image_url)}
                alt={image.title}
                width={400}
                height={300}
                className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-transparent to-transparent opacity-60" />
              <button
                onClick={() => handleDelete(image.id)}
                className="absolute top-3 right-3 p-2.5 bg-red-500/90 text-white rounded-xl shadow-lg hover:bg-red-600 hover:scale-110 transition-all opacity-0 group-hover:opacity-100 backdrop-blur-sm"
              >
                <Trash2 className="size-4" />
              </button>
            </div>
            <div className="p-4">
              <h3 className="font-bold text-slate-900 dark:text-white text-sm md:text-base truncate">{image.title}</h3>
              <div className="flex items-center justify-between mt-3">
                <span className="px-2.5 py-1 bg-amber-500/10 text-amber-600 dark:text-amber-500 text-[10px] font-bold rounded-lg border border-amber-500/20 uppercase tracking-wider">
                  {image.category}
                </span>
                <span className="text-[10px] text-slate-400 dark:text-slate-500 font-medium">
                  {new Date(image.created_at).toLocaleDateString('id-ID', { day: 'numeric', month: 'short' })}
                </span>
              </div>
            </div>
          </div>
        ))}
      </motion.div>
    </div>
  );
}
