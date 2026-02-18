import { useState, useMemo } from 'react';
import useSWR from 'swr';
import { api, Room as ApiRoom, Review as ApiReview } from '@/app/services/api';
import { getImageUrl } from '@/app/utils/api-url';

const defaultReviews = [
  {
    name: "Sarah Chen",
    role: "Marketing Executive",
    review:
      "LuxeStay exceeded all my expectations. The attention to detail is incredible.",
    image:
      "https://images.unsplash.com/photo-1494790108755-2616b612b786?q=80&w=400",
    stayDuration: "8 months",
    rating: 5,
  },
  {
    name: "Ahmad Rahman",
    role: "University Student",
    review:
      "Finding a place that feels like home while being affordable was crucial.",
    image:
      "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?q=80&w=400",
    stayDuration: "1 year",
    rating: 4.5,
  },
  {
    name: "Maria Santos",
    role: "Business Analyst",
    review:
      "The Premium Apartment I'm staying in is absolutely stunning. City view is amazing.",
    image:
      "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?q=80&w=400",
    stayDuration: "6 months",
    rating: 5,
  },
  {
    name: "David Kim",
    role: "Software Engineer",
    review:
      "The Executive Suite is worth every penny. Workspace is perfect for remote work.",
    image:
      "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?q=80&w=400",
    stayDuration: "10 months",
    rating: 4.8,
  },
];

export interface UIRoom {
  id: string;
  name: string;
  type: string;
  price: number;
  image: string;
  location: string;
  rating: number;
  reviews: number;
  facilities: string[];
  status?: string;
}

export function useHome() {
  const [searchLocation, setSearchLocation] = useState("");
  const [selectedPrice, setSelectedPrice] = useState("all");
  const [selectedType, setSelectedType] = useState("all");

  const { data: roomsData, isLoading: isLoadingRooms } = useSWR(
    "api/rooms",
    api.getRooms,
  );

  const { data: reviewsDataApi } = useSWR("api/reviews", api.getAllReviews);

  const realRooms = useMemo(() => {
    if (!roomsData || !Array.isArray(roomsData)) return [];
    return roomsData.map((r: ApiRoom) => {
      const numericPrice = Number(r.harga_per_bulan) || 0;

      let facilities: string[] = [];
      if (Array.isArray(r.fasilitas)) {
        facilities = r.fasilitas;
      } else if (typeof r.fasilitas === 'string') {
        facilities = r.fasilitas.split(',').map((f: string) => f.trim());
      } else {
        facilities = ["WiFi", "AC"];
      }

      const mapped: UIRoom = {
        id: String(r.id),
        name: r.nomor_kamar || 'Kamar Tanpa Nama',
        type: r.tipe_kamar || 'Standard',
        price: numericPrice,
        image: getImageUrl(r.image_url) || "https://images.unsplash.com/photo-1522771739844-6a9f6d5f14af?q=80&w=1080",
        location: "Kota Malang, Jawa Timur",
        rating: r.rating || 4.8,
        reviews: r.reviews || 12,
        facilities: facilities,
        status: r.status || "Tersedia",
      };
      return mapped;
    });
  }, [roomsData]);

  const displayRooms = useMemo(() => {
    return realRooms.filter((room: UIRoom) => {
      // 1. Search Filter
      const searchLower = (searchLocation || '').trim().toLowerCase();
      if (searchLower && !room.name.toLowerCase().includes(searchLower)) return false;

      // 2. Type Filter
      if (selectedType !== 'all') {
        const filterType = selectedType.toLowerCase();
        const roomType = (room.type || '').toLowerCase();
        if (!roomType.includes(filterType)) return false;
      }

      // 3. Price Filter
      const p = room.price;
      if (selectedPrice === '1jt' && p !== 1000000) return false;
      if (selectedPrice === '800rb' && p !== 800000) return false;

      // 4. Status Filter
      const status = (room.status || '').toLowerCase();
      if (status === 'tidak tersedia' || status === 'penuh') return false;

      return true;
    });
  }, [realRooms, searchLocation, selectedType, selectedPrice]);

  const reviews = useMemo(() => {
    if (
      !reviewsDataApi ||
      !Array.isArray(reviewsDataApi) ||
      reviewsDataApi.length === 0
    )
      return defaultReviews;
    const mapped = reviewsDataApi.map((r: ApiReview) => ({
      name: r.user?.username || "Anonymous",
      role: "Resident",
      review: r.comment,
      image: getImageUrl(r.Penyewa?.foto_profil) || "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?q=80&w=400",
      stayDuration: "Verified",
      rating: r.rating,
    }));
    return mapped.length >= 4 ? mapped : [...mapped, ...defaultReviews];
  }, [reviewsDataApi]);

  const resetFilters = () => {
    setSearchLocation("");
    setSelectedPrice("all");
    setSelectedType("all");
  };

  return {
    searchLocation,
    setSearchLocation,
    selectedPrice,
    setSelectedPrice,
    selectedType,
    setSelectedType,
    isLoadingRooms,
    displayRooms,
    resetFilters,
    reviews
  };
}
