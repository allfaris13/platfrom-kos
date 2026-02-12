"use client";

import { useState, useMemo } from 'react';
import useSWR from 'swr';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowRight } from 'lucide-react';
import { ImageWithFallback } from '@/app/components/shared/ImageWithFallback';
import { SkeletonGrid } from '@/app/components/ui/loading-screen';
import { api } from '@/app/services/api';

// --- Data Kos-Kosan Fallback ---
const fallbackKosData = [
  { id: 1, title: "The Heritage Pavilion", category: "Classic Executive", year: "2022", imageUrl: "https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?q=80&w=800" },
  { id: 2, title: "Urban Minimalist Suite", category: "Modern Studio", year: "2023", imageUrl: "https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?q=80&w=800" },
  { id: 3, title: "Skyline View Apartment", category: "Premium Loft", year: "2024", imageUrl: "https://images.unsplash.com/photo-1493809842364-78817add7ffb?q=80&w=800" },
  { id: 4, title: "The Zen Garden Room", category: "Executive Garden", year: "2023", imageUrl: "https://images.unsplash.com/photo-1512918728675-ed5a9ecdebfd?q=80&w=800" },
  { id: 5, title: "Industrial Loft A1", category: "Compact Studio", year: "2024", imageUrl: "https://images.unsplash.com/photo-1484154218962-a197022b5858?q=80&w=800" },
  { id: 6, title: "Nordic Comfort Suite", category: "Deluxe Twin", year: "2023", imageUrl: "https://images.unsplash.com/photo-1554995207-c18c203602cb?q=80&w=800" },
];

const moreKosItems = [
  { id: 7, title: "Metropolitan Suite", category: "Signature Suite", year: "2024", imageUrl: "https://images.unsplash.com/photo-1721009714214-e688d8c07506?q=80&w=1080" },
  { id: 8, title: "The Terracotta Room", category: "Standard Plus", year: "2023", imageUrl: "https://images.unsplash.com/photo-1560448204-61dc36dc98c8?q=80&w=800" },
  { id: 9, title: "Bohemian Sanctuary", category: "Thematic Room", year: "2024", imageUrl: "https://images.unsplash.com/photo-1598928506311-c55ded91a20c?q=80&w=800" },
  { id: 10, title: "Glass House Penthouse", category: "Ultra Premium", year: "2025", imageUrl: "https://images.unsplash.com/photo-1512917774080-9991f1c4c750?q=80&w=800" },
];

interface GalleryItem {
  id: number | string;
  title: string;
  category: string;
  year: string;
  imageUrl: string;
}

export function Gallery() {
  const { data: galleryData, isLoading } = useSWR('api/galleries', api.getGalleries);
  const [isLoadedMore, setIsLoadedMore] = useState(false);

  /* eslint-disable @typescript-eslint/no-explicit-any */
  const displayItems = useMemo<GalleryItem[]>(() => {
    if (!galleryData || !Array.isArray(galleryData) || galleryData.length === 0) return fallbackKosData;

    const mapped = galleryData.map((item: any) => ({
      id: item.id,
      title: item.title || "Elite Room",
      category: item.category || "Premium",
      year: item.created_at ? new Date(item.created_at).getFullYear().toString() : "2024",
      imageUrl: item.image_url 
        ? (item.image_url.startsWith('http') ? item.image_url : `http://localhost:8081${item.image_url}`) 
        : "https://via.placeholder.com/800"
    }));

    return isLoadedMore ? [...mapped, ...moreKosItems] : mapped;
  }, [galleryData, isLoadedMore]);

  const handleLoadMore = () => {
    setIsLoadedMore(true);
  };

  return (
    <section className="bg-white dark:bg-slate-950 text-slate-900 dark:text-slate-50 transition-colors duration-500 overflow-x-hidden py-20">
      <div className="max-w-[1400px] mx-auto px-6">

        {/* --- HEADER SECTION --- */}
        <header className="mb-24">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex flex-col md:flex-row md:items-end justify-between gap-8"
          >
            <div className="space-y-4">
              <h2 className="text-6xl md:text-7xl font-light tracking-tight leading-none text-slate-900 dark:text-white">
                Elite <br /> <span className="italic">Residences</span>
              </h2>
            </div>
            <p className="max-w-xs text-stone-500 dark:text-slate-400 font-sans text-sm leading-relaxed tracking-wide uppercase">
              Koleksi pilihan hunian eksklusif dengan kenyamanan hotel berbintang untuk gaya hidup modern.
            </p>
          </motion.div>
        </header>

        {/* --- KATEGORI KOS GRID --- */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-16 mb-40">
          {[
            { title: "Standard Deluxe", features: ["Fast WiFi", "Private Bath", "AC Room"] },
            { title: "Executive Studio", features: ["Smart TV", "Mini Kitchen", "Cleaning Service"] },
            { title: "Premium Loft", features: ["City View", "Private Balcony", "Gym Access"] }
          ].map((cat, i) => (
            <motion.div
              key={cat.title}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1 }}
              viewport={{ once: true }}
              className="group cursor-pointer"
            >
              <div className="flex justify-between items-center border-b border-stone-300 dark:border-slate-800 pb-4 mb-8">
                <h3 className="text-2xl font-medium tracking-tight text-slate-900 dark:text-slate-100">{cat.title}</h3>
                <ArrowRight className="w-5 h-5 transition-transform group-hover:translate-x-2 text-slate-400" />
              </div>
              <div className="space-y-4 font-sans text-sm text-stone-600 dark:text-slate-400">
                {cat.features.map((feat) => (
                  <p key={feat} className="hover:text-black dark:hover:text-white transition-colors">→ {feat}</p>
                ))}
              </div>
            </motion.div>
          ))}
        </div>

        {/* --- COLLECTION GRID (ASIMETRIS) --- */}
        <div className="border-t border-stone-200 dark:border-slate-900 pt-16">
          <div className="flex justify-between items-end mb-20">
            <h2 className="text-5xl font-light italic tracking-tighter text-slate-900 dark:text-slate-100">Our Rooms</h2>
            <button className="font-sans text-xs uppercase tracking-[0.2em] border-b border-black dark:border-white pb-1 hover:opacity-50 transition-opacity text-slate-900 dark:text-slate-100">
              Lihat Semua Unit
            </button>
          </div>

          {isLoading ? (
            <SkeletonGrid count={8} />
          ) : (
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-x-4 gap-y-12 md:gap-x-12 md:gap-y-24">
            <AnimatePresence mode="popLayout">
              {displayItems.map((item: GalleryItem, index: number) => (
                <motion.div
                  layout
                  key={item.id}
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.5, delay: (index % 4) * 0.1 }}
                  className={`flex flex-col ${index % 4 === 1 ? "lg:mt-32" :
                    index % 4 === 3 ? "lg:mt-16" : ""
                    }`}
                >
                  <div className="relative aspect-[3/4] overflow-hidden bg-stone-200 dark:bg-slate-900 mb-6 group">
                    <ImageWithFallback
                      src={item.imageUrl}
                      alt={item.title}
                      className="w-full h-full object-cover transition-transform duration-1000 group-hover:scale-110"
                    />
                    <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 dark:group-hover:bg-white/5 transition-colors" />
                  </div>

                  <div className="space-y-1">
                    <span className="font-sans text-[10px] uppercase tracking-[0.2em] text-stone-400 dark:text-slate-500">
                      {item.category}
                    </span>
                    <h4 className="text-xl font-medium leading-snug text-slate-900 dark:text-slate-200">{item.title}</h4>
                    <p className="font-sans text-xs italic text-stone-500 dark:text-slate-500">
                      Available from {item.year}
                    </p>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
          )}
        </div>

        {/* --- LOAD MORE SECTION --- */}
        {!isLoadedMore && (
          <div className="mt-32 flex flex-col items-center gap-6">
            <div className="w-px h-20 bg-stone-300 dark:bg-slate-800 animate-bounce" />
            <button
              onClick={handleLoadMore}
              className="bg-[#1a1a1a] dark:bg-white text-white dark:text-black px-14 py-5 rounded-full font-sans text-[11px] uppercase tracking-[0.4em] hover:bg-stone-800 dark:hover:bg-slate-200 transition-all active:scale-95 shadow-xl"
            >
              Cari Unit Lainnya
            </button>
          </div>
        )}

        {/* --- FOOTER DECORATION --- */}
        <div className="mt-40 pt-16 border-t border-stone-200 dark:border-slate-900 flex justify-between items-center text-stone-400 dark:text-slate-600 font-sans text-[10px] uppercase tracking-[0.3em]">
          <p>© 2026 LuxeStay Premium Residence</p>
          <div className="flex gap-8">
            <span className="cursor-pointer hover:text-black dark:hover:text-white transition-colors">Instagram</span>
            <span className="cursor-pointer hover:text-black dark:hover:text-white transition-colors">WhatsApp</span>
          </div>
        </div>
      </div>
    </section>
  );
}