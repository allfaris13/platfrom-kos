"use client";

import { useState, useEffect, useRef } from 'react';
import { motion, useInView, useMotionValue, useSpring } from 'framer-motion';
import { Card } from '@/app/components/ui/card';
import { Button } from '@/app/components/ui/button';
import { Input } from '@/app/components/ui/input';
import { Badge } from '@/app/components/ui/badge';
import { ImageWithFallback } from '@/app/components/figma/ImageWithFallback';
import { 
  Search, 
  MapPin, 
  Wifi, 
  Wind, 
  Tv, 
  Coffee, 
  Star,
  Heart
} from 'lucide-react';

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
  visible: { 
    opacity: 1, 
    y: 0, 
    transition: { duration: 0.8, ease: "easeOut" } 
  }
};

const staggerContainer = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.2 }
  }
};

// --- Interfaces & Data ---
interface Room {
  id: string; name: string; type: string; price: number; image: string;
  location: string; rating: number; reviews: number; facilities: string[];
}

const featuredRooms: Room[] = [
  { id: '1', name: 'Deluxe Suite', type: 'Deluxe', price: 1200, image: 'https://images.unsplash.com/photo-1668512624222-2e375314be39?q=80&w=1080', location: 'Downtown District', rating: 4.8, reviews: 124, facilities: ['WiFi', 'AC', 'TV', 'Coffee Maker'] },
  { id: '2', name: 'Modern Studio', type: 'Standard', price: 800, image: 'https://images.unsplash.com/photo-1662454419736-de132ff75638?q=80&w=1080', location: 'University Area', rating: 4.6, reviews: 89, facilities: ['WiFi', 'AC', 'TV'] },
  { id: '3', name: 'Premium Apartment', type: 'Premium', price: 1500, image: 'https://images.unsplash.com/photo-1507138451611-3001135909fa?q=80&w=1080', location: 'Business District', rating: 4.9, reviews: 156, facilities: ['WiFi', 'AC', 'TV', 'Coffee Maker'] },
  { id: '4', name: 'Executive Suite', type: 'Executive', price: 2000, image: 'https://images.unsplash.com/photo-1661258279966-cfeb51c98327?q=80&w=1080', location: 'Luxury Quarter', rating: 5.0, reviews: 203, facilities: ['WiFi', 'AC', 'TV', 'Coffee Maker'] },
];

const facilityIcons: { [key: string]: any } = { WiFi: Wifi, AC: Wind, TV: Tv, 'Coffee Maker': Coffee };

const reviewsData = [
  { name: 'Sarah Chen', role: 'Marketing Executive', location: 'Downtown District', rating: 5, review: 'LuxeStay exceeded all my expectations. The attention to detail in the Deluxe Suite is incredible - from the premium bedding to the fully equipped kitchen. The location is perfect for my work commute, and the 24/7 support team is always responsive.', image: 'https://images.unsplash.com/photo-1494790108755-2616b612b786?q=80&w=400', stayDuration: '8 months' },
  { name: 'Ahmad Rahman', role: 'University Student', location: 'University Area', rating: 5, review: 'As a student, finding a place that feels like home while being affordable was crucial. LuxeStay\'s Modern Studio has everything I need - high-speed WiFi, study desk, and a comfortable bed. The community events they organize are a great bonus!', image: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?q=80&w=400', stayDuration: '1 year' },
  { name: 'Maria Santos', role: 'Business Analyst', location: 'Business District', rating: 5, review: 'The Premium Apartment I\'m staying in is absolutely stunning. The city view from my balcony is breathtaking, and all the amenities work perfectly. LuxeStay\'s commitment to quality is evident in every detail.', image: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?q=80&w=400', stayDuration: '6 months' },
  { name: 'David Kim', role: 'Software Engineer', location: 'Luxury Quarter', rating: 5, review: 'The Executive Suite is worth every penny. The workspace is perfect for my remote work setup, and the building amenities are top-notch. LuxeStay has set a new standard for premium accommodation.', image: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?q=80&w=400', stayDuration: '10 months' },
  { name: 'Nina Putri', role: 'Designer', location: 'Downtown District', rating: 5, review: 'I love how LuxeStay combines luxury with functionality. My Deluxe Suite has become my creative sanctuary. The natural light and modern design inspire my work every day.', image: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?q=80&w=400', stayDuration: '4 months' },
  { name: 'Rizky Pratama', role: 'Entrepreneur', location: 'Business District', rating: 5, review: 'LuxeStay understands the needs of modern professionals. The Premium Apartment offers the perfect blend of comfort and convenience. Their flexible booking system made moving in seamless.', image: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?q=80&w=400', stayDuration: '7 months' }
];

interface HomepageProps {
  onRoomClick: (roomId: string) => void;
  wishlist?: string[];
  onToggleWishlist?: (roomId: string) => void;
}

export function Homepage({ onRoomClick, wishlist = [], onToggleWishlist }: HomepageProps) {
  const [searchLocation, setSearchLocation] = useState('');
  const [selectedPrice, setSelectedPrice] = useState('all');
  const [selectedType, setSelectedType] = useState('all');
  const [isSearching, setIsSearching] = useState(false);

  const filteredRooms = featuredRooms.filter((room) => {
    const matchesLocation = room.location.toLowerCase().includes(searchLocation.toLowerCase()) || searchLocation === '';
    const matchesType = selectedType === 'all' || room.type.toLowerCase() === selectedType.toLowerCase();
    let matchesPrice = true;
    if (selectedPrice === '0-1000') matchesPrice = room.price <= 1000;
    else if (selectedPrice === '1000-2000') matchesPrice = room.price >= 1000 && room.price <= 2000;
    else if (selectedPrice === '2000+') matchesPrice = room.price >= 2000;
    return matchesLocation && matchesType && matchesPrice;
  });

  // Bagi ulasan menjadi dua baris
  const firstRowReviews = reviewsData.slice(0, 3);
  const secondRowReviews = reviewsData.slice(3, 6);

  return (
    <div className="bg-white dark:bg-slate-950 text-slate-900 dark:text-slate-50 transition-colors overflow-x-hidden">
      
      {/* Hero Section */}
      <section className="relative bg-gradient-to-br from-slate-900 via-stone-800 to-slate-900 dark:from-slate-950 dark:via-slate-900 dark:to-slate-950 text-white py-24 overflow-hidden">
        <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1721009714214-e688d8c07506?q=80&w=1080')] bg-cover bg-center opacity-15" />
        <div className="absolute inset-0 bg-gradient-to-t from-slate-900 via-transparent to-transparent dark:from-slate-950" />

        <div className="relative max-w-7xl mx-auto px-4">
          <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 1 }} className="text-center mb-16">
            <h1 className="text-6xl md:text-7xl font-bold mb-6 bg-gradient-to-r from-white via-stone-100 to-stone-200 bg-clip-text text-transparent">Find Your Perfect Space</h1>
            <p className="text-xl md:text-2xl text-stone-300 max-w-2xl mx-auto">Premium boarding houses and apartments tailored to your lifestyle</p>
          </motion.div>

          <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5, duration: 1 }} className="max-w-5xl mx-auto">
            <Card className="bg-white/10 backdrop-blur-2xl border border-white/20 p-8 shadow-2xl">
              <div className="grid grid-cols-1 md:grid-cols-4 gap-5">
                <div className="md:col-span-2">
                  <label className="text-sm font-semibold text-stone-200 mb-3 block uppercase tracking-wide">Location</label>
                  <div className="relative group">
                    <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-stone-400 group-focus-within:text-stone-200" />
                    <Input placeholder="Where do you want to stay?" value={searchLocation} onChange={(e) => setSearchLocation(e.target.value)} className="pl-12 bg-white/90 border-white/30 text-slate-900 dark:bg-slate-700/90 dark:text-slate-100" />
                  </div>
                </div>
                <div>
                  <label className="text-sm font-semibold text-stone-200 mb-3 block uppercase tracking-wide">Price</label>
                  <select value={selectedPrice} onChange={(e) => setSelectedPrice(e.target.value)} className="w-full px-4 py-2.5 bg-white/90 border border-white/30 rounded-lg text-slate-900 dark:bg-slate-700/90 dark:text-slate-100"><option value="all">All Prices</option><option value="0-1000">$0 - $1000</option><option value="1000-2000">$1000 - $2000</option><option value="2000+">$2000+</option></select>
                </div>
                <div>
                  <label className="text-sm font-semibold text-stone-200 mb-3 block uppercase tracking-wide">Type</label>
                  <select value={selectedType} onChange={(e) => setSelectedType(e.target.value)} className="w-full px-4 py-2.5 bg-white/90 border border-white/30 rounded-lg text-slate-900 dark:bg-slate-700/90 dark:text-slate-100"><option value="all">All Types</option><option value="standard">Standard</option><option value="deluxe">Deluxe</option><option value="premium">Premium</option><option value="executive">Executive</option></select>
                </div>
              </div>
              <Button onClick={() => setIsSearching(true)} className="w-full md:w-auto mt-6 bg-gradient-to-r from-stone-700 to-stone-800 hover:from-stone-600 hover:to-stone-700 text-white font-semibold px-8 shadow-lg"><Search className="w-5 h-5 mr-2" /> Search Rooms</Button>
            </Card>
          </motion.div>
        </div>
      </section>

      {/* Featured Rooms with Scroll Animation */}
      <section className="max-w-7xl mx-auto px-4 py-20 bg-slate-50 dark:bg-slate-900/50">
        <motion.div initial="hidden" whileInView="visible" viewport={{ once: true, margin: "-100px" }} variants={fadeInUp} className="text-center mb-16">
          <h2 className="text-5xl font-bold text-slate-900 dark:text-slate-100 mb-4">{isSearching ? 'Search Results' : 'Featured Rooms'}</h2>
          <p className="text-lg text-slate-600 dark:text-slate-400">Handpicked premium accommodations</p>
        </motion.div>

        <motion.div variants={staggerContainer} initial="hidden" whileInView="visible" viewport={{ once: true }} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {filteredRooms.map((room) => (
            <motion.div key={room.id} variants={fadeInUp}>
              <Card className="bg-white dark:bg-slate-800 shadow-lg hover:shadow-2xl transition-all duration-300 overflow-hidden group border-0 h-full flex flex-col">
                <div className="relative h-72 overflow-hidden bg-slate-200">
                  <ImageWithFallback src={room.image} alt={room.name} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" />
                  <div className="absolute top-4 right-4 flex gap-3">
                    <Badge className="bg-gradient-to-r from-stone-700 to-stone-900 text-white border-0">{room.type}</Badge>
                    <button onClick={(e) => { e.stopPropagation(); onToggleWishlist?.(room.id); }} className={`w-10 h-10 rounded-full flex items-center justify-center shadow-lg transition-all ${wishlist.includes(room.id) ? 'bg-red-500 text-white' : 'bg-white dark:bg-slate-700 text-slate-400'}`}><Heart className={`w-5 h-5 ${wishlist.includes(room.id) ? 'fill-white' : ''}`} /></button>
                  </div>
                </div>
                <div className="p-6 flex-1 flex flex-col">
                  <h3 className="text-xl font-bold mb-4">{room.name}</h3>
                  <div className="flex gap-2 mb-6 flex-wrap">
                    {room.facilities.map((f) => {
                      const Icon = facilityIcons[f];
                      return <div key={f} className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-100 dark:bg-slate-700 rounded-full text-xs font-medium">{Icon && <Icon className="w-3.5 h-3.5" />}<span>{f}</span></div>
                    })}
                  </div>
                  <div className="border-t pt-5 mt-auto flex items-center justify-between">
                    <div><span className="text-3xl font-bold">${room.price}</span><span className="text-sm ml-1">/mo</span></div>
                    <Button onClick={() => onRoomClick(room.id)} className="bg-stone-800 hover:bg-stone-700 text-white font-semibold shadow-md">View Details</Button>
                  </div>
                </div>
              </Card>
            </motion.div>
          ))}
        </motion.div>
      </section>

      {/* Why Choose Us with Scroll Animation */}
      <section className="bg-white dark:bg-slate-950 py-20">
        <div className="max-w-7xl mx-auto px-4">
          <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} variants={staggerContainer} className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[{ title: 'Verified Listings', icon: '✓', color: 'from-emerald-100 to-teal-100 border-emerald-300 dark:from-emerald-900/50 dark:to-teal-900/50 dark:border-emerald-700' }, { title: 'Flexible Booking', icon: '📅', color: 'from-blue-100 to-indigo-100 border-blue-300 dark:from-blue-900/50 dark:to-indigo-900/50 dark:border-blue-700' }, { title: '24/7 Support', icon: '💬', color: 'from-purple-100 to-pink-100 border-purple-300 dark:from-purple-900/50 dark:to-pink-900/50 dark:border-purple-700' }].map((feature, i) => (
              <motion.div key={i} variants={fadeInUp}>
                <Card className={`bg-gradient-to-br ${feature.color} border p-8 text-center hover:shadow-xl transition-all`}>
                  <div className="text-6xl mb-4">{feature.icon}</div>
                  <h3 className="text-2xl font-bold mb-3">{feature.title}</h3>
                  <p className="text-slate-700 dark:text-slate-300 leading-relaxed">Experience premium features and exceptional service in every aspect.</p>
                </Card>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* Our Story with Side-Slide Animation */}
      <section className="bg-white dark:bg-slate-950 py-20 overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
            <motion.div initial={{ opacity: 0, x: -100 }} whileInView={{ opacity: 1, x: 0 }} transition={{ duration: 1 }} viewport={{ once: true }}>
              <h2 className="text-5xl font-bold text-slate-900 dark:text-slate-100 mb-8">Our Story</h2>
              <div className="space-y-6 text-lg text-slate-700 dark:text-slate-300 leading-relaxed">
                <p>Founded in 2018, LuxeStay began as a vision to revolutionize the boarding house experience in Indonesia. Our founders experienced the challenges of finding quality accommodation during their university years.</p>
                <p>Today, LuxeStay represents more than just accommodation - it's a movement towards redefining what premium living means in the modern world.</p>
              </div>
            </motion.div>
            <motion.div initial={{ opacity: 0, x: 100 }} whileInView={{ opacity: 1, x: 0 }} transition={{ duration: 1 }} viewport={{ once: true }} className="relative">
              <div className="aspect-square rounded-2xl overflow-hidden shadow-2xl">
                <img src="https://images.unsplash.com/photo-1560518883-ce09059eeffa?q=80&w=1000" alt="LuxeStay Story" className="w-full h-full object-cover" />
              </div>
              <div className="absolute -bottom-6 -left-6 bg-gradient-to-r from-stone-700 to-stone-900 text-white p-6 rounded-xl shadow-xl">
                <p className="text-2xl font-bold">2018</p>
                <p className="text-sm opacity-90">Founded with a vision</p>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* --- REVIEWS SECTION: TWO ROW AUTO-SCROLL (Opposite Directions) --- */}
      <section className="bg-slate-50 dark:bg-slate-900/50 py-20 overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 mb-16 text-center">
          <h2 className="text-5xl font-bold text-slate-900 dark:text-slate-100 mb-4">What Our Residents Say</h2>
          <p className="text-lg text-slate-600 dark:text-slate-400">Real experiences from our community</p>
        </div>

        {/* Row 1: Ke Kanan (X: negative to positive) */}
        <div className="relative flex mb-8">
          <motion.div 
            className="flex gap-8 px-4"
            animate={{ x: ["-50%", "0%"] }}
            transition={{ duration: 25, ease: "linear", repeat: Infinity }}
          >
            {[...firstRowReviews, ...firstRowReviews].map((review, i) => (
              <Card key={i} className="min-w-[400px] bg-white dark:bg-slate-800 border-0 shadow-lg p-6">
                <div className="flex gap-1 mb-4">{[...Array(5)].map((_, i) => <Star key={i} className="w-4 h-4 fill-amber-400 text-amber-400" />)}</div>
                <blockquote className="italic mb-6">"{review.review}"</blockquote>
                <div className="flex items-center gap-4 border-t pt-4">
                  <img src={review.image} className="w-10 h-10 rounded-full object-cover" alt="" />
                  <div><p className="font-bold text-sm">{review.name}</p><p className="text-xs text-slate-500">{review.role} • {review.stayDuration}</p></div>
                </div>
              </Card>
            ))}
          </motion.div>
        </div>

        {/* Row 2: Ke Kiri (X: 0 to negative) */}
        <div className="relative flex">
          <motion.div 
            className="flex gap-8 px-4"
            animate={{ x: ["0%", "-50%"] }}
            transition={{ duration: 25, ease: "linear", repeat: Infinity }}
          >
            {[...secondRowReviews, ...secondRowReviews].map((review, i) => (
              <Card key={i} className="min-w-[400px] bg-white dark:bg-slate-800 border-0 shadow-lg p-6">
                <div className="flex gap-1 mb-4">{[...Array(5)].map((_, i) => <Star key={i} className="w-4 h-4 fill-amber-400 text-amber-400" />)}</div>
                <blockquote className="italic mb-6">"{review.review}"</blockquote>
                <div className="flex items-center gap-4 border-t pt-4">
                  <img src={review.image} className="w-10 h-10 rounded-full object-cover" alt="" />
                  <div><p className="font-bold text-sm">{review.name}</p><p className="text-xs text-slate-500">{review.role} • {review.stayDuration}</p></div>
                </div>
              </Card>
            ))}
          </motion.div>
        </div>
      </section>

      {/* --- TRUST INDICATORS: COUNTER 0 TO TARGET --- */}
      <section className="bg-white dark:bg-slate-950 py-20 border-t border-slate-100 dark:border-slate-800">
        <div className="max-w-7xl mx-auto px-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-12 text-center">
            
            <div className="flex flex-col items-center">
              <p className="text-5xl font-bold text-slate-900 dark:text-white mb-2">
                <Counter value={4.9} decimals={1} />
              </p>
              <p className="text-sm text-slate-500 font-medium">AVERAGE RATING</p>
              <div className="flex gap-1 mt-2">{[...Array(5)].map((_, i) => <Star key={i} className="w-4 h-4 fill-amber-400 text-amber-400" />)}</div>
            </div>

            <div className="flex flex-col items-center">
              <p className="text-5xl font-bold text-slate-900 dark:text-white mb-2">
                <Counter value={2500} suffix="+" />
              </p>
              <p className="text-sm text-slate-500 font-medium uppercase">Happy Residents</p>
            </div>

            <div className="flex flex-col items-center">
              <p className="text-5xl font-bold text-slate-900 dark:text-white mb-2">
                <Counter value={98} suffix="%" />
              </p>
              <p className="text-sm text-slate-500 font-medium uppercase">Satisfaction Rate</p>
            </div>

            <div className="flex flex-col items-center">
              <p className="text-5xl font-bold text-slate-900 dark:text-white mb-2">24/7</p>
              <p className="text-sm text-slate-500 font-medium uppercase">Support Available</p>
            </div>

          </div>
        </div>
      </section>

    </div>
  );
}