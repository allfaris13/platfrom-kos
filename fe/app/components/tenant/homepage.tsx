"use client";

import { useState, useEffect, useRef, useMemo } from 'react';
import useSWR from 'swr';
import { motion, useInView, useMotionValue, useSpring, AnimatePresence } from 'framer-motion';
import { 
  Card, 
  CardHeader, 
  CardTitle, 
  CardDescription, 
  CardContent, 
  CardFooter,
  CardAction 
} from '@/app/components/ui/card'; 
import { Button } from '@/app/components/ui/button';
import { Input } from '@/app/components/ui/input';
import { Badge } from '@/app/components/ui/badge';
import { ImageWithFallback } from '@/app/components/shared/ImageWithFallback';
import { 
  MapPin, 
  Wifi, 
  Wind, 
  Tv, 
  Coffee, 
  Star,
  Heart,
  CheckCircle2,
  Calendar,
  MessageCircle,
  LucideIcon
} from 'lucide-react';
import { api } from '@/app/services/api';
import { 
    Select, 
    SelectContent, 
    SelectItem, 
    SelectTrigger, 
    SelectValue 
} from '@/app/components/ui/select';

// --- Komponen Counter untuk Trust Indicators ---
function Counter({ value, suffix = "", decimals = 0 }: { value: number, suffix?: string, decimals?: number }) {
  const ref = useRef<HTMLSpanElement>(null);
  const motionValue = useMotionValue(0);
  const springValue = useSpring(motionValue, { damping: 30, stiffness: 100 });
  const isInView = useInView(ref, { once: true, margin: "-100px" });

  useEffect(() => {
    if (isInView) motionValue.set(value);
  }, [isInView, value, motionValue]);

  useEffect(() => {
    springValue.on("change", (latest) => {
      if (ref.current) {
        ref.current.textContent = latest.toFixed(decimals).toLocaleString() + suffix;
      }
    });
  }, [springValue, decimals, suffix]);

  return <span ref={ref}>0</span>;
}

// --- Animation Variants ---
const fadeInUp = {
  hidden: { opacity: 0, y: 40 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.8 } }
};

const staggerContainer = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.1 } }
};

// --- Interfaces & Data ---
interface Room {
  id: string; name: string; type: string; price: number; image: string;
  location: string; rating: number; reviews: number; facilities: string[];
  status?: string;
}

const featuredRooms: Room[] = [
  { id: '1', name: 'Deluxe Suite', type: 'Deluxe', price: 1200, image: 'https://images.unsplash.com/photo-1668512624222-2e375314be39?q=80&w=1080', location: 'Downtown District', rating: 4.8, reviews: 124, facilities: ['WiFi', 'AC', 'TV', 'Coffee Maker'] },
  { id: '2', name: 'Modern Studio', type: 'Standard', price: 800, image: 'https://images.unsplash.com/photo-1662454419736-de132ff75638?q=80&w=1080', location: 'University Area', rating: 4.6, reviews: 89, facilities: ['WiFi', 'AC', 'TV'] },
  { id: '3', name: 'Premium Apartment', type: 'Premium', price: 1500, image: 'https://images.unsplash.com/photo-1507138451611-3001135909fa?q=80&w=1080', location: 'Business District', rating: 4.9, reviews: 156, facilities: ['WiFi', 'AC', 'TV', 'Coffee Maker'] },
  { id: '4', name: 'Executive Suite', type: 'Executive', price: 2000, image: 'https://images.unsplash.com/photo-1661258279966-cfeb51c98327?q=80&w=1080', location: 'Luxury Quarter', rating: 5.0, reviews: 203, facilities: ['WiFi', 'AC', 'TV', 'Coffee Maker'] },
];

const facilityIcons: { [key: string]: LucideIcon } = { WiFi: Wifi, AC: Wind, TV: Tv, 'Coffee Maker': Coffee };

const reviewsData = [
  { name: 'Sarah Chen', role: 'Marketing Executive', review: 'LuxeStay exceeded all my expectations. The attention to detail is incredible.', image: 'https://images.unsplash.com/photo-1494790108755-2616b612b786?q=80&w=400', stayDuration: '8 months' },
  { name: 'Ahmad Rahman', role: 'University Student', review: 'Finding a place that feels like home while being affordable was crucial.', image: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?q=80&w=400', stayDuration: '1 year' },
  { name: 'Maria Santos', role: 'Business Analyst', review: 'The Premium Apartment I\'m staying in is absolutely stunning. City view is amazing.', image: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?q=80&w=400', stayDuration: '6 months' },
  { name: 'David Kim', role: 'Software Engineer', review: 'The Executive Suite is worth every penny. Workspace is perfect for remote work.', image: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?q=80&w=400', stayDuration: '10 months' },
  { name: 'Nina Putri', role: 'Designer', review: 'I love how LuxeStay combines luxury with functionality. Inspires my work.', image: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?q=80&w=400', stayDuration: '4 months' },
  { name: 'Rizky Pratama', role: 'Entrepreneur', review: 'Flexible booking system made moving in seamless. Highly recommended.', image: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?q=80&w=400', stayDuration: '7 months' }
];

interface HomepageProps {
  onRoomClick: (roomId: string) => void;
  wishlist?: string[];
  onToggleWishlist?: (roomId: string) => void;
  isLoggedIn?: boolean;
  onLoginPrompt?: () => void;
}

export function Homepage({ onRoomClick, wishlist = [], onToggleWishlist, isLoggedIn, onLoginPrompt }: HomepageProps) {
  // --- Logic State ---
  const [searchLocation, setSearchLocation] = useState('');
  const [selectedPrice, setSelectedPrice] = useState('all');
  const [selectedType, setSelectedType] = useState('all');

  // Cache Rooms
  const { data: roomsData, isLoading: isLoadingRooms } = useSWR('api/rooms', api.getRooms);
  
  // Cache Reviews
  const { data: reviewsDataApi } = useSWR('api/reviews', api.getAllReviews);

  const realRooms = useMemo(() => {
    if (!roomsData) return [];
    return (roomsData as Array<{ id: number; nomor_kamar: string; tipe_kamar: string; harga_per_bulan: number; image_url: string; fasilitas: string; status: string }>).map((r) => ({
      id: String(r.id),
      name: r.nomor_kamar,
      type: r.tipe_kamar,
      price: r.harga_per_bulan,
      image: r.image_url ? (r.image_url.startsWith('http') ? r.image_url : `http://localhost:8080${r.image_url}`) : 'https://via.placeholder.com/600',
      location: 'Kota Malang, Jawa Timur', 
      rating: 4.8, 
      reviews: 12,
      facilities: r.fasilitas ? r.fasilitas.split(',').map((f: string) => f.trim()) : [],
      status: r.status
    }));
  }, [roomsData]);

  const reviews = useMemo(() => {
    if (!reviewsDataApi || reviewsDataApi.length === 0) return reviewsData;
    const mapped = (reviewsDataApi as Array<{ user?: { username: string }; comment: string; rating: number }>).map((r) => ({
      name: r.user?.username || 'Anonymous',
      role: 'Resident',
      review: r.comment,
      image: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?q=80&w=400',
      stayDuration: 'Verified',
      rating: r.rating
    }));
    return mapped.length >= 4 ? mapped : [...mapped, ...reviewsData];
  }, [reviewsDataApi]);

  
  // --- REAL-TIME FILTER LOGIC ---
  const displayRooms = useMemo(() => {
    const source = realRooms.length > 0 ? realRooms : featuredRooms;
    return source.filter((room: Room) => {
      if (realRooms.length > 0 && room.status !== 'Tersedia') return false;

      const matchesLocation = searchLocation === '' || room.location.toLowerCase().includes(searchLocation.toLowerCase());
      
      const matchesType = selectedType === 'all' || room.type.toLowerCase() === selectedType.toLowerCase();
      
      let matchesPrice = true;
      const priceVal = realRooms.length > 0 ? room.price : room.price * 1000;
      if (selectedPrice === '0-1000') matchesPrice = priceVal <= 1000000;
      else if (selectedPrice === '1000-2000') matchesPrice = priceVal > 1000000 && priceVal <= 2000000;
      else if (selectedPrice === '2000+') matchesPrice = priceVal > 2000000;

      return matchesLocation && matchesType && matchesPrice;
    });
  }, [realRooms, searchLocation, selectedType, selectedPrice]);

  const midPoint = Math.ceil(reviews.length / 2);
  const firstRowReviews = reviews.slice(0, midPoint);
  const secondRowReviews = reviews.slice(midPoint);

  const formatCurrency = (val: number) => {
      if (val < 10000) return `$${val}`; // Mock data fallback
      return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(val);
  };

  return (
    <div className="bg-white dark:bg-slate-950 text-slate-900 dark:text-slate-50 transition-colors overflow-x-hidden">
      
      {/* 1. Hero Section */}
      <section className="relative bg-gradient-to-br from-slate-900 via-stone-800 to-slate-900 dark:from-slate-950 dark:via-slate-900 dark:to-slate-950 text-white py-24 overflow-hidden">
        <ImageWithFallback 
          src="https://images.unsplash.com/photo-1721009714214-e688d8c07506?q=80&w=1080"
          alt="Hero Background"
          className="absolute inset-0 w-full h-full object-cover opacity-15"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-slate-900 via-transparent to-transparent dark:from-slate-950" />

        <div className="relative max-w-7xl mx-auto px-4">
          <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 1 }} className="text-center mb-16">
            <h1 className="text-6xl md:text-7xl font-bold mb-6 bg-gradient-to-r from-white via-stone-100 to-stone-200 bg-clip-text text-transparent">Find Your Perfect Space</h1>
            <p className="text-xl md:text-2xl text-stone-300 max-w-2xl mx-auto">Premium male-only boarding houses in Malang tailored to your comfort</p>
            
            {!isLoggedIn && (
               <motion.div 
               initial={{ opacity: 0, scale: 0.9 }} 
               animate={{ opacity: 1, scale: 1 }} 
               transition={{ delay: 0.8 }}
               className="mt-10 flex flex-wrap justify-center gap-4"
             >
               <Button onClick={onLoginPrompt} className="bg-amber-500 hover:bg-amber-600 text-slate-900 font-bold px-8 py-6 rounded-xl text-lg shadow-2xl shadow-amber-500/20">Mulai Sewa Sekarang</Button>
               <div className="flex items-center gap-2 text-stone-400 bg-black/20 backdrop-blur-md px-4 py-2 rounded-full border border-white/10">
                 <CheckCircle2 className="w-4 h-4 text-amber-500" />
                 <span className="text-sm">Bergabung dengan penghuni Rahmat ZAW</span>
               </div>
             </motion.div>
            )}
          </motion.div>

          <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5, duration: 1 }} className="max-w-5xl mx-auto">
            <Card className="bg-white/10 backdrop-blur-2xl border border-white/20 p-8 shadow-2xl">
              <div className="grid grid-cols-1 md:grid-cols-4 gap-5">
                <div className="md:col-span-2">
                  <label className="text-sm font-semibold text-stone-200 mb-3 block uppercase tracking-wide">Location</label>
                  <div className="relative group">
                    <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-stone-400 group-focus-within:text-stone-200" />
                    <Input 
                      placeholder="Where do you want to stay?" 
                      value={searchLocation} 
                      onChange={(e) => setSearchLocation(e.target.value)} 
                      className="pl-12 bg-white/90 border-white/30 text-slate-900 dark:bg-slate-700/90 dark:text-slate-100 focus:ring-2 focus:ring-stone-400" 
                    />
                  </div>
                </div>
                <div>
                  <label className="text-sm font-semibold text-stone-200 mb-3 block uppercase tracking-wide">Price</label>
                  <Select value={selectedPrice} onValueChange={setSelectedPrice}>
                    <SelectTrigger className="w-full bg-white/90 border-white/30 text-slate-900 dark:bg-slate-700/90 dark:text-slate-100">
                      <SelectValue placeholder="All Prices" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Prices</SelectItem>
                      <SelectItem value="0-1000">Rp 0 - Rp 1jt</SelectItem>
                      <SelectItem value="1000-2000">Rp 1jt - Rp 2jt</SelectItem>
                      <SelectItem value="2000+">Rp 2jt+</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <label className="text-sm font-semibold text-stone-200 mb-3 block uppercase tracking-wide">Type</label>
                  <Select value={selectedType} onValueChange={setSelectedType}>
                    <SelectTrigger className="w-full bg-white/90 border-white/30 text-slate-900 dark:bg-slate-700/90 dark:text-slate-100">
                      <SelectValue placeholder="All Types" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Types</SelectItem>
                      <SelectItem value="standard">Standard</SelectItem>
                      <SelectItem value="deluxe">Deluxe</SelectItem>
                      <SelectItem value="premium">Premium</SelectItem>
                      <SelectItem value="executive">Executive</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </Card>
          </motion.div>
        </div>
      </section>



      {/* 2. Featured/Search Results Section */}
      <section className="max-w-7xl mx-auto px-4 py-20 bg-slate-50 dark:bg-slate-900/50">
        <motion.div initial="hidden" whileInView="visible" viewport={{ once: true, margin: "-100px" }} variants={fadeInUp} className="text-center mb-16">
          <h2 className="text-5xl font-bold text-slate-900 dark:text-slate-100 mb-4">
            {searchLocation || selectedPrice !== 'all' || selectedType !== 'all' ? 'Search Results' : 'Featured Rooms'}
          </h2>
          <p className="text-lg text-slate-600 dark:text-slate-400">
            {isLoadingRooms ? 'Loading premium rooms...' : displayRooms.length > 0 ? 'Handpicked premium accommodations' : 'No rooms match your specific criteria.'}
          </p>
        </motion.div>

        <motion.div layout variants={staggerContainer} initial="hidden" whileInView="visible" viewport={{ once: true }} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          <AnimatePresence mode="popLayout">
            {displayRooms.map((room) => (
              <motion.div 
                key={room.id} 
                layout 
                initial={{ opacity: 0, scale: 0.9 }} 
                animate={{ opacity: 1, scale: 1 }} 
                exit={{ opacity: 0, scale: 0.9 }}
                transition={{ duration: 0.3 }}
              >
                <Card className="bg-white dark:bg-slate-800 shadow-lg hover:shadow-2xl transition-all duration-300 overflow-hidden group border-0 h-full flex flex-col">
                  <div className="relative h-72 overflow-hidden bg-slate-200">
                    <ImageWithFallback src={room.image} alt={room.name} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" />
                    <div className="absolute top-4 left-4">
                      <Badge className="bg-gradient-to-r from-stone-700 to-stone-900 text-white border-0">{room.type}</Badge>
                    </div>
                  </div>

                  <CardHeader className="relative">
                    <CardTitle className="text-xl font-bold">{room.name}</CardTitle>
                    <CardDescription className="flex items-center gap-1">
                      <MapPin size={14} /> {room.location}
                    </CardDescription>
                    <CardAction>
                      <button 
                        onClick={(e) => { 
                          e.stopPropagation(); 
                          if (!isLoggedIn) onLoginPrompt?.();
                          else onToggleWishlist?.(room.id); 
                        }} 
                        className={`w-10 h-10 rounded-full flex items-center justify-center shadow-lg transition-all ${wishlist.includes(room.id) ? 'bg-red-500 text-white' : 'bg-white dark:bg-slate-700 text-slate-400 hover:text-red-500'}`}
                      >
                        <Heart className={`w-5 h-5 ${wishlist.includes(room.id) ? 'fill-white' : ''}`} />
                      </button>
                    </CardAction>
                  </CardHeader>

                  <CardContent className="flex-1">
                    <div className="flex flex-wrap gap-2">
                      {room.facilities.map((f: string) => {
                        const Icon = facilityIcons[f];
                        return (
                          <div key={f} className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-100 dark:bg-slate-700 rounded-full text-xs font-medium">
                            {Icon && <Icon className="w-3.5 h-3.5" />}
                            <span>{f}</span>
                          </div>
                        )
                      })}
                    </div>
                  </CardContent>

                  <CardFooter className="border-t pt-5 flex flex-wrap items-center justify-between gap-3">
                    <div className="flex items-baseline">
                      <span className="text-xl md:text-2xl font-bold">{formatCurrency(room.price)}</span>
                      <span className="text-xs text-muted-foreground ml-1">/mo</span>
                    </div>
                    <Button onClick={() => onRoomClick(room.id)} className="bg-stone-800 hover:bg-stone-700 text-white font-semibold shadow-sm px-4">
                      View Details
                    </Button>
                  </CardFooter>
                </Card>
              </motion.div>
            ))}
          </AnimatePresence>
        </motion.div>
      </section>

      {/* 3. Why Choose Us Section */}
      <section className="bg-white dark:bg-slate-950 py-24">
        <div className="max-w-7xl mx-auto px-4">
          <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} variants={staggerContainer} className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              { title: 'Verified Listings', icon: <CheckCircle2 className="w-12 h-12" />, color: 'from-emerald-50 to-teal-50 border-emerald-100 dark:from-emerald-900/20 dark:to-teal-900/20' },
              { title: 'Flexible Booking', icon: <Calendar className="w-12 h-12" />, color: 'from-blue-50 to-indigo-50 border-blue-100 dark:from-blue-900/20 dark:to-indigo-900/20' },
              { title: '24/7 Support', icon: <MessageCircle className="w-12 h-12" />, color: 'from-purple-50 to-pink-50 border-purple-100 dark:from-purple-900/20 dark:to-pink-900/20' }
            ].map((feature, i) => (
              <motion.div key={i} variants={fadeInUp}>
                <Card className={`bg-gradient-to-br ${feature.color} border p-10 text-center hover:shadow-xl transition-all h-full`}>
                  <div className="text-stone-700 dark:text-stone-300 flex justify-center mb-6">{feature.icon}</div>
                  <h3 className="text-2xl font-bold mb-4">{feature.title}</h3>
                  <p className="text-slate-600 dark:text-slate-400 leading-relaxed">Experience premium features and exceptional service in every aspect of your stay.</p>
                </Card>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* 4. Our Story Section */}
      <section className="bg-slate-50 dark:bg-slate-900/30 py-24 overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-20 items-center">
            <motion.div initial={{ opacity: 0, x: -50 }} whileInView={{ opacity: 1, x: 0 }} transition={{ duration: 1 }} viewport={{ once: true }}>
              <h2 className="text-5xl font-bold text-slate-900 dark:text-slate-100 mb-8">Redefining Boarding Experience</h2>
              <div className="space-y-6 text-lg text-slate-600 dark:text-slate-400 leading-relaxed">
                <p>Didirikan pada tahun 2018, Kost Putra Rahmat ZAW hadir dengan visi untuk merevolusi pengalaman tinggal di kost-kostan di kawasan Sigura-gura, Malang. Fokus kami adalah menyediakan hunian yang nyaman, aman, dan mendukung produktivitas mahasiswa.</p>
                <p>Kini, Rahmat ZAW mewakili standar baru hunian premium bagi putra yang menginginkan kenyamanan maksimal dalam lingkungan yang kondusif.</p>
              </div>
            </motion.div>
            <motion.div initial={{ opacity: 0, x: 50 }} whileInView={{ opacity: 1, x: 0 }} transition={{ duration: 1 }} viewport={{ once: true }} className="relative">
              <div className="aspect-[4/3] rounded-3xl overflow-hidden shadow-2xl">
                <ImageWithFallback src="https://images.unsplash.com/photo-1560518883-ce09059eeffa?q=80&w=1000" alt="LuxeStay Story" className="w-full h-full object-cover" />
              </div>
              <div className="absolute -bottom-8 -left-8 bg-stone-900 text-white p-8 rounded-2xl shadow-2xl">
                <p className="text-4xl font-bold mb-1">2018</p>
                <p className="text-sm uppercase tracking-widest opacity-70">Established</p>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* 5. Reviews Section (Infinite Scroll) */}
      <section className="bg-white dark:bg-slate-950 py-24 overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 mb-16 text-center">
          <h2 className="text-5xl font-bold text-slate-900 dark:text-slate-100 mb-4">What Our Residents Say</h2>
          <p className="text-lg text-slate-600 dark:text-slate-400">Real experiences from our growing community</p>
        </div>

        <div className="space-y-10">
          <div className="relative flex">
            <motion.div 
              className="flex gap-8 px-4"
              animate={{ x: ["-50%", "0%"] }}
              transition={{ duration: 30, ease: "linear", repeat: Infinity }}
            >
              {[...firstRowReviews, ...firstRowReviews].map((review, i) => (
                <Card key={i} className="min-w-[400px] bg-slate-50 dark:bg-slate-900 border-0 shadow-md p-8">
                  <div className="flex gap-1 mb-4">{[...Array(5)].map((_, i) => <Star key={i} className="w-4 h-4 fill-amber-400 text-amber-400" />)}</div>
                  <blockquote className="italic mb-8 text-slate-700 dark:text-slate-300 text-lg">&quot;{review.review}&quot;</blockquote>
                  <div className="flex items-center gap-4 border-t border-slate-200 dark:border-slate-800 pt-6">
                    <ImageWithFallback src={review.image} className="w-12 h-12 rounded-full object-cover" alt="" />
                    <div><p className="font-bold">{review.name}</p><p className="text-sm text-slate-500">{review.role} • {review.stayDuration}</p></div>
                  </div>
                </Card>
              ))}
            </motion.div>
          </div>

          <div className="relative flex">
            <motion.div 
              className="flex gap-8 px-4"
              animate={{ x: ["0%", "-50%"] }}
              transition={{ duration: 35, ease: "linear", repeat: Infinity }}
            >
              {[...secondRowReviews, ...secondRowReviews].map((review, i) => (
                <Card key={i} className="min-w-[400px] bg-slate-50 dark:bg-slate-900 border-0 shadow-md p-8">
                  <div className="flex gap-1 mb-4">{[...Array(5)].map((_, i) => <Star key={i} className="w-4 h-4 fill-amber-400 text-amber-400" />)}</div>
                  <blockquote className="italic mb-8 text-slate-700 dark:text-slate-300 text-lg">&quot;{review.review}&quot;</blockquote>
                  <div className="flex items-center gap-4 border-t border-slate-200 dark:border-slate-800 pt-6">
                    <ImageWithFallback src={review.image} className="w-12 h-12 rounded-full object-cover" alt="" />
                    <div><p className="font-bold">{review.name}</p><p className="text-sm text-slate-500">{review.role} • {review.stayDuration}</p></div>
                  </div>
                </Card>
              ))}
            </motion.div>
          </div>
        </div>
      </section>

      {/* 6. Trust Indicators Section */}
      <section className="bg-slate-50 dark:bg-slate-900/30 py-24 overflow-hidden">
        <div className="max-w-7xl mx-auto px-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-16 text-center">
            <div>
              <p className="text-6xl font-bold mb-3"><Counter value={4.9} decimals={1} /></p>
              <p className="text-stone-400 text-sm tracking-widest uppercase font-semibold">Average Rating</p>
              <div className="flex gap-1 mt-4 justify-center">{[...Array(5)].map((_, i) => <Star key={i} className="w-4 h-4 fill-amber-400 text-amber-400 border-0" />)}</div>
            </div>
            <div>
              <p className="text-6xl font-bold mb-3"><Counter value={2500} suffix="+" /></p>
              <p className="text-stone-400 text-sm tracking-widest uppercase font-semibold">Happy Residents</p>
            </div>
            <div>
              <p className="text-6xl font-bold mb-3"><Counter value={98} suffix="%" /></p>
              <p className="text-stone-400 text-sm tracking-widest uppercase font-semibold">Satisfaction Rate</p>
            </div>
            <div>
              <p className="text-6xl font-bold mb-3">24/7</p>
              <p className="text-stone-400 text-sm tracking-widest uppercase font-semibold">Global Support</p>
            </div>
          </div>
        </div>
      </section>

    </div>
  );
}