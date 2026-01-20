import { useState } from 'react';
import { Card } from '@/app/components/ui/card';
import { Button } from '@/app/components/ui/button';
import { Badge } from '@/app/components/ui/badge';
import { ImageWithFallback } from '@/app/components/gambar/ImageWithFallback';
import { motion } from 'framer-motion';
import { 
  ArrowLeft, 
  MapPin, 
  Star, 
  Wifi, 
  Wind, 
  Tv, 
  Coffee,
  Bed,
  Bath,
  Ruler,
  ChevronLeft,
  ChevronRight,
  Check,
  Calendar,
  Utensils,
  Monitor,
  Briefcase,
  Heart,
  Share2,
  Shield,
  Clock
} from 'lucide-react';

interface RoomDetailProps {
  roomId: string;
  onBookNow: (roomId: string) => void;
  onBack: () => void;
}

// Data Kamar
const roomDetails: { [key: string]: any } = {
  '1': {
    name: 'Premium Suite 201',
    type: 'Luxury',
    price: 1200,
    location: 'South Jakarta',
    rating: 4.9,
    reviews: 98,
    description: 'Luxurious premium suite with full kitchen and spacious balcony. Ideal for those who appreciate the finer things.',
    bedrooms: 1,
    bathrooms: 1,
    size: '45m²',
    facilities: [
      { name: 'High-Speed WiFi', icon: Wifi },
      { name: 'Full Kitchen', icon: Utensils },
      { name: 'Air conditioning', icon: Wind },
      { name: 'Smart TV', icon: Monitor },
      { name: 'King Size Bed', icon: Bed },
      { name: 'Work Desk', icon: Briefcase },
    ],
    features: [
      'Air conditioning',
      'Private bathroom',
      'Hot water',
      'Work desk',
      'High-speed WiFi',
      'Smart TV with cable',
      'Fully equipped kitchen',
      'Balcony with city view',
      'Premium bedding',
      'Daily housekeeping',
    ],
    images: [
      'https://images.unsplash.com/photo-1668512624222-2e375314be39?q=80&w=1080',
      'https://images.unsplash.com/photo-1662454419736-de132ff75638?q=80&w=1080',
      'https://images.unsplash.com/photo-1507138451611-3001135909fa?q=80&w=1080',
    ],
  },
};

const facilityIcons: { [key: string]: any } = {
  'High-Speed WiFi': Wifi,
  'Air conditioning': Wind,
  'Smart TV': Monitor,
  'King Size Bed': Bed,
  'Work Desk': Briefcase,
  'Full Kitchen': Utensils,
};

export function RoomDetail({ roomId, onBookNow, onBack }: RoomDetailProps) {
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const room = roomDetails[roomId] || roomDetails['1'];

  const nextImage = () => {
    setCurrentImageIndex((prev) => (prev + 1) % room.images.length);
  };

  const prevImage = () => {
    setCurrentImageIndex((prev) => (prev - 1 + room.images.length) % room.images.length);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-stone-50 dark:from-slate-900 dark:via-slate-950 dark:to-slate-900 py-8 text-slate-900 dark:text-slate-100 transition-colors duration-300">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

        {/* Top Header - Back Button & Title */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5 }}
          className="flex items-center justify-between mb-8"
        >
          <div className="flex items-center gap-4">
            <motion.div whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.95 }}>
              <Button variant="ghost" onClick={onBack} className="rounded-full h-10 w-10 p-0 hover:bg-slate-100 dark:hover:bg-slate-800">
                <ArrowLeft className="w-5 h-5" />
              </Button>
            </motion.div>
            <div>
              <h1 className="text-3xl font-bold text-slate-900 dark:text-slate-100">{room.name}</h1>
              <div className="flex items-center gap-1 text-slate-600 dark:text-slate-400 text-sm mt-1">
                <MapPin className="w-4 h-4" />
                <span className="font-medium">{room.location}</span>
              </div>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <motion.button whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.95 }} className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-full transition-colors">
              <Heart className="w-6 h-6 text-slate-600 dark:text-slate-400" />
            </motion.button>
            <motion.button whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.95 }} className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-full transition-colors">
              <Share2 className="w-6 h-6 text-slate-600 dark:text-slate-400" />
            </motion.button>
          </div>
        </motion.div>

        {/* Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* Left Column: Image Gallery & Details */}
          <motion.div 
            className="lg:col-span-2 space-y-6"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
          >
            
            {/* Main Image Gallery */}
            <div className="space-y-4">
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.5 }}
              >
                <Card className="overflow-hidden border-0 shadow-xl">
                  <div className="relative h-[500px] bg-gradient-to-br from-slate-200 to-slate-300 dark:from-slate-800 dark:to-slate-700 group">
                    <motion.div
                      key={currentImageIndex}
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ duration: 0.5 }}
                      className="absolute inset-0"
                    >
                      <ImageWithFallback
                        src={room.images[currentImageIndex]}
                        alt={room.name}
                        className="w-full h-full object-cover"
                      />
                    </motion.div>
                    
                    {/* Navigation Arrows */}
                    {room.images.length > 1 && (
                      <>
                        <motion.button
                          onClick={prevImage}
                          whileHover={{ scale: 1.1, backgroundColor: '#ffffff' }}
                          whileTap={{ scale: 0.95 }}
                          className="absolute left-4 top-1/2 -translate-y-1/2 w-12 h-12 bg-white/80 dark:bg-slate-900/80 backdrop-blur-sm rounded-full shadow-lg flex items-center justify-center hover:bg-white dark:hover:bg-slate-800 transition-all"
                        >
                          <ChevronLeft className="w-6 h-6 text-slate-900 dark:text-slate-100" />
                        </motion.button>
                        <motion.button
                          onClick={nextImage}
                          whileHover={{ scale: 1.1, backgroundColor: '#ffffff' }}
                          whileTap={{ scale: 0.95 }}
                          className="absolute right-4 top-1/2 -translate-y-1/2 w-12 h-12 bg-white/80 dark:bg-slate-900/80 backdrop-blur-sm rounded-full shadow-lg flex items-center justify-center hover:bg-white dark:hover:bg-slate-800 transition-all"
                        >
                          <ChevronRight className="w-6 h-6 text-slate-900 dark:text-slate-100" />
                        </motion.button>
                      </>
                    )}
                    
                    {/* Image Counter */}
                    <div className="absolute bottom-4 right-4 bg-black/50 backdrop-blur-sm text-white px-4 py-2 rounded-full text-sm font-medium">
                      {currentImageIndex + 1} / {room.images.length}
                    </div>
                  </div>
                </Card>
              </motion.div>

              {/* Thumbnail Gallery */}
              <div className="grid grid-cols-3 gap-3">
                {room.images.map((img: string, idx: number) => (
                  <motion.div 
                    key={idx}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => setCurrentImageIndex(idx)}
                    className={`h-24 rounded-lg overflow-hidden cursor-pointer transition-all border-2 ${
                      idx === currentImageIndex ? 'border-stone-900 dark:border-stone-400 shadow-lg' : 'border-slate-200 dark:border-slate-700 hover:border-slate-300 dark:hover:border-slate-600'
                    }`}
                  >
                    <img src={img} alt="thumbnail" className="w-full h-full object-cover hover:scale-110 transition-transform duration-300" />
                  </motion.div>
                ))}
              </div>
            </div>

            {/* Room Info Card */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              viewport={{ once: true }}
            >
              <Card className="p-6 border-0 shadow-lg bg-white dark:bg-slate-800">
                <div className="mb-4">
                  <Badge className="bg-gradient-to-r from-stone-700 to-stone-900 text-white border-0 font-semibold px-4 py-1.5">
                    {room.type}
                  </Badge>
                </div>

                <div className="mb-6 pb-6 border-b border-slate-200 dark:border-slate-700">
                  <div className="flex items-center gap-4 mb-4">
                    <div className="flex items-center gap-2 bg-amber-50 dark:bg-amber-900/20 px-4 py-2 rounded-lg">
                      <Star className="w-5 h-5 fill-amber-400 text-amber-400" />
                      <span className="font-bold text-amber-900 dark:text-amber-400">{room.rating}</span>
                      <span className="text-amber-700 dark:text-amber-500">({room.reviews} reviews)</span>
                    </div>
                  </div>

                  <div className="grid grid-cols-3 gap-4">
                    <div className="flex items-center gap-3 p-3 bg-slate-50 dark:bg-slate-700 rounded-lg">
                      <Bed className="w-5 h-5 text-stone-900 dark:text-stone-100" />
                      <div>
                        <p className="text-xs text-slate-600 dark:text-slate-400 font-medium">Bedrooms</p>
                        <p className="font-bold text-slate-900 dark:text-slate-100">{room.bedrooms}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3 p-3 bg-slate-50 dark:bg-slate-700 rounded-lg">
                      <Bath className="w-5 h-5 text-stone-900 dark:text-stone-100" />
                      <div>
                        <p className="text-xs text-slate-600 dark:text-slate-400 font-medium">Bathrooms</p>
                        <p className="font-bold text-slate-900 dark:text-slate-100">{room.bathrooms}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3 p-3 bg-slate-50 dark:bg-slate-700 rounded-lg">
                      <Ruler className="w-5 h-5 text-stone-900 dark:text-stone-100" />
                      <div>
                        <p className="text-xs text-slate-600 dark:text-slate-400 font-medium">Size</p>
                        <p className="font-bold text-slate-900 dark:text-slate-100">{room.size}</p>
                      </div>
                    </div>
                  </div>
                </div>

                <h3 className="font-bold text-lg mb-4 text-slate-900 dark:text-slate-100">Amenities & Facilities</h3>
                <div className="grid grid-cols-2 gap-3">
                  {room.facilities.map((facility: any, idx: number) => {
                    const Icon = facilityIcons[facility.name] || facility.icon;
                    return (
                      <motion.div
                        key={idx}
                        whileHover={{ x: 5 }}
                        className="flex items-center gap-3 p-3 bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-700 dark:to-slate-600 rounded-lg hover:shadow-md transition-all"
                      >
                        {Icon && <Icon className="w-5 h-5 text-stone-900 dark:text-stone-100 flex-shrink-0" />}
                        <span className="text-sm font-medium text-slate-700 dark:text-slate-300">{facility.name}</span>
                      </motion.div>
                    );
                  })}
                </div>
              </Card>
            </motion.div>

            {/* Description */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.1 }}
              viewport={{ once: true }}
            >
              <Card className="p-6 border-0 shadow-lg bg-white dark:bg-slate-800">
                <h2 className="text-2xl font-bold text-slate-900 dark:text-slate-100 mb-4">About This Room</h2>
                <p className="text-slate-700 dark:text-slate-300 leading-relaxed text-lg">{room.description}</p>
              </Card>
            </motion.div>

            {/* Features */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
              viewport={{ once: true }}
            >
              <Card className="p-6 border-0 shadow-lg bg-white dark:bg-slate-800">
                <h2 className="text-2xl font-bold text-slate-900 dark:text-slate-100 mb-6">Features & Amenities</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {room.features.map((feature: string, idx: number) => (
                    <motion.div
                      key={idx}
                      whileHover={{ x: 5 }}
                      className="flex items-start gap-3 p-3 hover:bg-slate-50 dark:hover:bg-slate-700 rounded-lg transition-colors"
                    >
                      <Check className="w-5 h-5 text-emerald-600 flex-shrink-0 mt-0.5" />
                      <span className="text-slate-700 dark:text-slate-300 font-medium">{feature}</span>
                    </motion.div>
                  ))}
                </div>
              </Card>
            </motion.div>
          </motion.div>

          {/* Right Column: Booking Sidebar */}
          <motion.div 
            className="lg:col-span-1"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
          >
            <Card className="p-8 sticky top-8 shadow-2xl border-0 bg-white dark:bg-slate-800">
              {/* Price Section */}
              <motion.div className="mb-8">
                <div className="text-5xl font-bold text-stone-900 dark:text-white mb-2">
                  ${room.price}
                  <span className="text-xl text-slate-600 dark:text-slate-400 ml-2 font-normal">/month</span>
                </div>
                <p className="text-sm text-slate-600 dark:text-slate-400 mt-2">Includes basic utilities and maintenance</p>
              </motion.div>

              {/* Availability Calendar */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
                viewport={{ once: true }}
                className="mb-8"
              >
                <div className="flex items-center gap-2 mb-4">
                  <Clock className="w-5 h-5 text-stone-900 dark:text-white" />
                  <h3 className="font-bold text-slate-900 dark:text-white">Availability</h3>
                </div>
                
                {/* Bagian Kalender yang diperbaiki dark mode-nya */}
                <div className="bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-700 dark:to-slate-800 border border-slate-200 dark:border-slate-600 rounded-xl p-4 transition-colors">
                  <div className="flex justify-between items-center mb-4">
                    <button className="p-1.5 hover:bg-slate-200 dark:hover:bg-slate-600 rounded-lg transition-colors text-slate-900 dark:text-slate-100">
                      <ChevronLeft className="w-4 h-4" />
                    </button>
                    <span className="font-bold text-sm text-slate-900 dark:text-slate-100">January 2026</span>
                    <button className="p-1.5 hover:bg-slate-200 dark:hover:bg-slate-600 rounded-lg transition-colors text-slate-900 dark:text-slate-100">
                      <ChevronRight className="w-4 h-4" />
                    </button>
                  </div>
                  
                  <div className="grid grid-cols-7 gap-1 text-center text-xs mb-2 text-slate-600 dark:text-slate-400 font-semibold">
                    <span>Su</span>
                    <span>Mo</span>
                    <span>Tu</span>
                    <span>We</span>
                    <span>Th</span>
                    <span>Fr</span>
                    <span>Sa</span>
                  </div>
                  
                  <div className="grid grid-cols-7 gap-1">
                    {[...Array(31)].map((_, i) => (
                      <motion.div 
                        key={i}
                        whileHover={{ scale: 1.1 }}
                        className={`py-2 text-xs rounded cursor-pointer transition-all font-medium ${
                          i === 15 
                            ? 'bg-gradient-to-br from-stone-700 to-stone-900 dark:from-stone-500 dark:to-stone-700 text-white shadow-md' 
                            : 'hover:bg-white dark:hover:bg-slate-600 text-slate-900 dark:text-slate-200'
                        }`}
                      >
                        {i + 1}
                      </motion.div>
                    ))}
                  </div>
                </div>
              </motion.div>

              {/* CTA Button */}
              <motion.div
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                <Button 
                  onClick={() => onBookNow(roomId)}
                  className="w-full bg-gradient-to-r from-stone-700 to-stone-900 hover:from-stone-600 hover:to-stone-800 text-white h-13 text-lg font-bold rounded-xl mb-6 shadow-lg hover:shadow-xl transition-all"
                >
                  Book Now
                </Button>
              </motion.div>

              {/* Cost Breakdown */}
              <div className="space-y-4 border-t border-slate-200 dark:border-slate-700 pt-6 mb-6">
                <div className="flex items-center justify-between">
                  <span className="text-slate-700 dark:text-slate-300 font-medium">Monthly rent</span>
                  <span className="font-bold text-slate-900 dark:text-white">${room.price}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-slate-700 dark:text-slate-300 font-medium">Security deposit</span>
                  <span className="font-bold text-slate-900 dark:text-white">${room.price}</span>
                </div>
                <div className="flex items-center justify-between pt-3 border-t border-slate-200 dark:border-slate-700 text-lg">
                  <span className="font-bold text-slate-900 dark:text-white">Total due</span>
                  <span className="font-bold text-stone-900 dark:text-stone-300">${room.price * 2}</span>
                </div>
              </div>

              {/* Security Badge */}
              <div className="p-4 bg-gradient-to-r from-emerald-50 to-teal-50 dark:from-emerald-900/20 dark:to-teal-900/20 rounded-lg border border-emerald-200 dark:border-emerald-800">
                <div className="flex items-start gap-3">
                  <Shield className="w-5 h-5 text-emerald-600 dark:text-emerald-400 flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="text-xs font-bold text-emerald-900 dark:text-emerald-100 mb-1">Secure Booking</p>
                    <p className="text-xs text-emerald-800 dark:text-emerald-300 leading-relaxed">
                      Free cancellation within 24 hours • Verified property • Protected payment
                    </p>
                  </div>
                </div>
              </div>
            </Card>
          </motion.div>
        </div>
      </div>
    </div>
  );
}