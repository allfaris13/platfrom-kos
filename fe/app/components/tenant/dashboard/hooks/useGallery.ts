import { useState, useMemo } from 'react';
import useSWR from 'swr';
import { api, Gallery as ApiGallery } from '@/app/services/api';
import { getImageUrl } from '@/app/utils/api-url';

const fallbackGallery = [
  {
    id: 1,
    title: "Executive Lounge",
    category: "Interior",
    image_url:
      "https://images.unsplash.com/photo-1512918728675-ed5a9ecdebfd?q=80&w=800",
  },
  {
    id: 2,
    title: "Infinity Pool",
    category: "Exterior",
    image_url:
      "https://images.unsplash.com/photo-1576013551627-0cc20b96c2a7?q=80&w=800",
  },
  {
    id: 3,
    title: "Modern Kitchen",
    category: "Interior",
    image_url:
      "https://images.unsplash.com/photo-1556912173-3bb406ef7e77?q=80&w=800",
  },
  {
    id: 4,
    title: "Premium Suite",
    category: "Room",
    image_url:
      "https://images.unsplash.com/photo-1631049307264-da0ec9d70304?q=80&w=800",
  },
  {
    id: 5,
    title: "Garden View",
    category: "Exterior",
    image_url:
      "https://images.unsplash.com/photo-1590073242678-70ee3fc28e84?q=80&w=800",
  },
  {
    id: 6,
    title: "Co-working Space",
    category: "Shared",
    image_url:
      "https://images.unsplash.com/photo-1527192491265-7e15c55b1ed2?q=80&w=800",
  },
];

export function useGallery() {
  const [isLoadedMore, setIsLoadedMore] = useState(false);

  const { data: galleryData, isLoading } = useSWR('api/galleries', api.getGalleries);

  const items = useMemo(() => {
    if (!galleryData || !Array.isArray(galleryData) || galleryData.length === 0) {
      return fallbackGallery;
    }
    return galleryData.map((item: ApiGallery) => ({
      id: item.id,
      title: item.title,
      category: item.category || "General",
      image_url: getImageUrl(item.image_url),
    }));
  }, [galleryData]);

  const displayItems = useMemo(() => {
    return isLoadedMore ? items : items.slice(0, 6);
  }, [items, isLoadedMore]);

  const handleLoadMore = () => {
    setIsLoadedMore(true);
  };

  return {
    items: displayItems,
    hasMore: items.length > 6 && !isLoadedMore,
    isLoading,
    handleLoadMore,
    isLoadedMore
  };
}
