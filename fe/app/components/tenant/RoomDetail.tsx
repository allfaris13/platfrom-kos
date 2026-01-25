import { useState, useEffect } from 'react';
import { Card } from '@/app/components/ui/card';
import { Button } from '@/app/components/ui/button';
import { Badge } from '@/app/components/ui/badge';
import { ImageWithFallback } from '@/app/components/shared/ImageWithFallback';
import { motion } from 'framer-motion';
import { Textarea } from '@/app/components/ui/textarea';
import { 
  ArrowLeft, 
  MapPin, 
  Star, 
  Wifi, 
  Wind, 
  Bed,
  ChevronLeft,
  ChevronRight,
  Check,
  Calendar as CalendarIcon,
  Utensils,
  Monitor,
  Briefcase,
  Heart,
  Share2
} from 'lucide-react';
import { api } from '@/app/services/api';
import { Calendar } from '@/app/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/app/components/ui/popover';
import { format } from 'date-fns';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/app/components/ui/select';
import { Separator } from '@/app/components/ui/separator';
import { Label } from '@/app/components/ui/label';

interface RoomDetailProps {
  roomId: string;
  onBookNow: (roomId: string) => void;
  onBack: () => void;
}

interface RoomData {
  name: string;
  type: string;
  price: number;
  location: string;
  description: string;
  bedrooms: number;
  bathrooms: number;
  size: string;
  facilities: { name: string; icon: React.ComponentType<{ className?: string }> }[];
  features: string[];
  images: string[];
}

// Data Kamar (Mock data fallback for room details structure)
const roomDetails: { [key: string]: RoomData } = {
  '1': {
    name: 'Premium Suite 201',
    type: 'Luxury',
    price: 1200,
    location: 'South Jakarta',
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

const facilityIcons: { [key: string]: React.ComponentType<{ className?: string }> } = {
  'High-Speed WiFi': Wifi,
  'Air conditioning': Wind,
  'Smart TV': Monitor,
  'King Size Bed': Bed,
  'Work Desk': Briefcase,
  'Full Kitchen': Utensils,
};

interface Review {
  id: number;
  user_id: number;
  rating: number;
  comment: string;
  created_at: string;
  user: {
    username: string;
  }
}

export function RoomDetail({ roomId, onBookNow, onBack }: RoomDetailProps) {
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [newReview, setNewReview] = useState({ rating: 5, comment: '' });
  const [isSubmittingReview, setIsSubmittingReview] = useState(false);
  
  // Booking State
  const [date, setDate] = useState<Date | undefined>(new Date());
  const [guests, setGuests] = useState("1");
  const [duration, setDuration] = useState("1"); // Months

  // In a real app we'd fetch room details by ID from API
  // For now we mock room info but fetch reviews
  const room = roomDetails[roomId] || roomDetails['1'];

  useEffect(() => {
    const fetchReviews = async () => {
        try {
            // Note: Backend endpoint expects numeric ID. Our demo uses string '1'.
            // In integration we should ensure IDs match. Assuming roomId is numeric string.
            const kID = parseInt(roomId) || 1; 
            const data = await api.getReviews(String(kID));
            setReviews(data);
        } catch (e) {
            console.error("Failed to fetch reviews", e);
        }
    };
    fetchReviews();
  }, [roomId]);

  const handleSubmitReview = async () => {
      setIsSubmittingReview(true);
      try {
          const kID = parseInt(roomId) || 1;
          await api.createReview({
              kamar_id: kID,
              rating: newReview.rating,
              comment: newReview.comment,
              user_id: 1 // Mock user ID for now
          });
          // Refresh reviews
          const data = await api.getReviews(String(kID));
          setReviews(data);
          setNewReview({ rating: 5, comment: '' });
      } catch (e) {
          console.error("Failed to submit review", e);
          alert("Failed to submit review. Please try again.");
      } finally {
          setIsSubmittingReview(false);
      }
  };

  const nextImage = () => {
    setCurrentImageIndex((prev) => (prev + 1) % room.images.length);
  };

  const prevImage = () => {
    setCurrentImageIndex((prev) => (prev - 1 + room.images.length) % room.images.length);
  };

  const averageRating = reviews.length > 0 
    ? (reviews.reduce((acc, r) => acc + r.rating, 0) / reviews.length).toFixed(1) 
    : "No ratings";

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-stone-50 dark:from-slate-900 dark:via-slate-950 dark:to-slate-900 py-8 text-slate-900 dark:text-slate-100 transition-colors duration-300">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

        {/* Top Header - Back Button & Title */}
        <motion.div
// ... existing header code ...
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
                    <ImageWithFallback src={img} alt="thumbnail" className="w-full h-full object-cover hover:scale-110 transition-transform duration-300" />
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
                      <span className="font-bold text-amber-900 dark:text-amber-400">{averageRating}</span>
                      <span className="text-amber-700 dark:text-amber-500">({reviews.length} reviews)</span>
                    </div>
                  </div>

                  <div className="grid grid-cols-3 gap-4">
                    {/* ... stats ... */}
                    <div className="flex items-center gap-3 p-3 bg-slate-50 dark:bg-slate-700 rounded-lg">
                      <Bed className="w-5 h-5 text-stone-900 dark:text-stone-100" />
                      <div>
                        <p className="text-xs text-slate-600 dark:text-slate-400 font-medium">Bedrooms</p>
                        <p className="font-bold text-slate-900 dark:text-slate-100">{room.bedrooms}</p>
                      </div>
                    </div>
                    {/* ... other stats ... */}
                  </div>
                </div>

                <h3 className="font-bold text-lg mb-4 text-slate-900 dark:text-slate-100">Amenities & Facilities</h3>
                <div className="grid grid-cols-2 gap-3">
                  {room.facilities.map((facility: { name: string; icon: React.ComponentType<{ className?: string }> }, idx: number) => {
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

            {/* Reviews Section - NEW */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.15 }}
              viewport={{ once: true }}
            >
              <Card className="p-6 border-0 shadow-lg bg-white dark:bg-slate-800">
                <div className="flex justify-between items-center mb-6">
                    <h2 className="text-2xl font-bold text-slate-900 dark:text-slate-100">Guest Reviews</h2>
                    <div className="flex items-center gap-1">
                        <Star className="w-5 h-5 fill-amber-400 text-amber-400" />
                        <span className="font-bold text-lg">{averageRating}</span>
                    </div>
                </div>

                {/* Review Form */}
                <div className="bg-slate-50 dark:bg-slate-700/50 p-4 rounded-xl mb-8">
                    <h3 className="font-semibold mb-3">Write a Review</h3>
                    <div className="space-y-3">
                        <div className="flex gap-2">
                            {[1, 2, 3, 4, 5].map((star) => (
                                <button
                                    key={star}
                                    onClick={() => setNewReview({ ...newReview, rating: star })}
                                    className="focus:outline-none"
                                >
                                    <Star 
                                        className={`w-6 h-6 ${star <= newReview.rating ? 'fill-amber-400 text-amber-400' : 'text-slate-300'}`} 
                                    />
                                </button>
                            ))}
                        </div>
                        <Textarea 
                            placeholder="Share your experience..." 
                            value={newReview.comment}
                            onChange={(e) => setNewReview({ ...newReview, comment: e.target.value })}
                            className="bg-white dark:bg-slate-800"
                        />
                        <Button 
                            onClick={handleSubmitReview} 
                            disabled={isSubmittingReview || !newReview.comment}
                            className="bg-stone-800 hover:bg-stone-900 text-white"
                        >
                            {isSubmittingReview ? 'Submitting...' : 'Post Review'}
                        </Button>
                    </div>
                </div>

                {/* Reviews List */}
                <div className="space-y-6">
                    {reviews.length === 0 ? (
                        <p className="text-slate-500 text-center py-4">No reviews yet. Be the first to review!</p>
                    ) : (
                        reviews.map((review: Review) => (
                            <div key={review.id} className="border-b border-slate-100 dark:border-slate-700 last:border-0 pb-6 last:pb-0">
                                <div className="flex justify-between items-start mb-2">
                                    <div className="flex items-center gap-3">
                                        <div className="size-10 bg-gradient-to-br from-blue-500 to-blue-600 rounded-full flex items-center justify-center text-white font-bold">
                                            {review.user?.username?.charAt(0).toUpperCase() || 'U'}
                                        </div>
                                        <div>
                                            <p className="font-semibold text-slate-900 dark:text-slate-100">{review.user?.username || 'Anonymous'}</p>
                                            <p className="text-xs text-slate-500">{new Date(review.created_at).toLocaleDateString()}</p>
                                        </div>
                                    </div>
                                    <div className="flex gap-0.5">
                                        {[...Array(5)].map((_, i) => (
                                            <Star 
                                                key={i} 
                                                className={`w-4 h-4 ${i < review.rating ? 'fill-amber-400 text-amber-400' : 'text-slate-200 dark:text-slate-600'}`} 
                                            />
                                        ))}
                                    </div>
                                </div>
                                <p className="text-slate-600 dark:text-slate-300 leading-relaxed mt-2">{review.comment}</p>
                            </div>
                        ))
                    )}
                </div>
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
            <Card className="p-6 shadow-xl border-0 bg-white dark:bg-slate-800 sticky top-24">
              <div className="flex justify-between items-end mb-6">
                <div>
                  <span className="text-3xl font-bold text-slate-900 dark:text-slate-100">${room.price}</span>
                  <span className="text-slate-500 dark:text-slate-400"> / month</span>
                </div>
                <div className="flex items-center text-sm text-slate-600 dark:text-slate-400">
                  <Star className="w-4 h-4 fill-amber-400 text-amber-400 mr-1" />
                  <span className="font-bold text-slate-900 dark:text-slate-100">{averageRating}</span>
                </div>
              </div>

              <div className="space-y-4 mb-6">
                <div className="grid gap-2">
                  <Label>Check-in Date</Label>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button variant="outline" className="w-full justify-start text-left font-normal border-slate-200 dark:border-slate-700">
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        {date ? format(date, "PPP") : <span>Pick a date</span>}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0">
                      <Calendar mode="single" selected={date} onSelect={(selectedDate) => setDate(selectedDate)} initialFocus />
                    </PopoverContent>
                  </Popover>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="grid gap-2">
                    <Label>Duration</Label>
                    <Select value={duration} onValueChange={setDuration}>
                      <SelectTrigger className="border-slate-200 dark:border-slate-700">
                        <SelectValue placeholder="Months" />
                      </SelectTrigger>
                      <SelectContent>
                        {[1,3,6,12].map(m => (
                          <SelectItem key={m} value={String(m)}>{m} Month{m>1?'s':''}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="grid gap-2">
                    <Label>Guests</Label>
                    <Select value={guests} onValueChange={setGuests}>
                      <SelectTrigger className="border-slate-200 dark:border-slate-700">
                        <SelectValue placeholder="Guests" />
                      </SelectTrigger>
                      <SelectContent>
                        {[1,2,3].map(g => (
                          <SelectItem key={g} value={String(g)}>{g} Guest{g>1?'s':''}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </div>

              <Button 
                onClick={() => onBookNow(roomId)}
                className="w-full h-12 text-lg bg-stone-800 hover:bg-stone-900 text-white mb-6 shadow-lg shadow-stone-800/20"
              >
                Book Now
              </Button>

              <div className="space-y-3 text-sm text-slate-600 dark:text-slate-400 bg-slate-50 dark:bg-slate-700/30 p-4 rounded-lg">
                <div className="flex justify-between">
                  <span>${room.price} x {duration} months</span>
                  <span>${room.price * parseInt(duration)}</span>
                </div>
                <div className="flex justify-between">
                  <span>Service fee</span>
                  <span>$50</span>
                </div>
                <Separator className="bg-slate-200 dark:bg-slate-700" />
                <div className="flex justify-between font-bold text-slate-900 dark:text-slate-100 text-base">
                  <span>Total</span>
                  <span>${room.price * parseInt(duration) + 50}</span>
                </div>
              </div>
            </Card>
          </motion.div>
        </div>
      </div>
    </div>
  );
}