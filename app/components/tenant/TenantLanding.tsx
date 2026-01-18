import { useState } from 'react';
import { Card } from '@/app/components/ui/card';
import { Button } from '@/app/components/ui/button';
import { Input } from '@/app/components/ui/input';
import { Badge } from '@/app/components/ui/badge';
import { ImageWithFallback } from '@/app/components/figma/ImageWithFallback';
import { motion } from 'framer-motion';
import Slider from 'react-slick';
import { 
  Search, 
  MapPin, 
  Wifi, 
  Wind, 
  Tv, 
  Coffee, 
  Star,
  ChevronLeft,
  ChevronRight
} from 'lucide-react';


interface Room {
  id: string;
  name: string;
  type: string;
  price: number;
  image: string;
  location: string;
  rating: number;
  reviews: number;
  facilities: string[];
}

const featuredRooms: Room[] = [
  {
    id: '1',
    name: 'Deluxe Suite',
    type: 'Deluxe',
    price: 1200,
    image: 'https://images.unsplash.com/photo-1668512624222-2e375314be39?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxsdXh1cnklMjBib2FyZGluZyUyMGhvdXNlJTIwYmVkcm9vbXxlbnwxfHx8fDE3Njg1NzcyMzF8MA&ixlib=rb-4.1.0&q=80&w=1080',
    location: 'Downtown District',
    rating: 4.8,
    reviews: 124,
    facilities: ['WiFi', 'AC', 'TV', 'Coffee Maker']
  },
  {
    id: '2',
    name: 'Modern Studio',
    type: 'Standard',
    price: 800,
    image: 'https://images.unsplash.com/photo-1662454419736-de132ff75638?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxtb2Rlcm4lMjBhcGFydG1lbnQlMjBiZWRyb29tJTIwaW50ZXJpb3J8ZW58MXx8fHwxNzY4NTc3MjMxfDA&ixlib=rb-4.1.0&q=80&w=1080',
    location: 'University Area',
    rating: 4.6,
    reviews: 89,
    facilities: ['WiFi', 'AC', 'TV']
  },
  {
    id: '3',
    name: 'Premium Apartment',
    type: 'Premium',
    price: 1500,
    image: 'https://images.unsplash.com/photo-1507138451611-3001135909fa?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxjb3p5JTIwc3R1ZGlvJTIwYXBhcnRtZW50fGVufDF8fHx8MTc2ODUwNTcxM3ww&ixlib=rb-4.1.0&q=80&w=1080',
    location: 'Business District',
    rating: 4.9,
    reviews: 156,
    facilities: ['WiFi', 'AC', 'TV', 'Coffee Maker']
  },
  {
    id: '4',
    name: 'Executive Suite',
    type: 'Executive',
    price: 2000,
    image: 'https://images.unsplash.com/photo-1661258279966-cfeb51c98327?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxwcmVtaXVtJTIwaG90ZWwlMjByb29tfGVufDF8fHx8MTc2ODUzMDkzMXww&ixlib=rb-4.1.0&q=80&w=1080',
    location: 'Luxury Quarter',
    rating: 5.0,
    reviews: 203,
    facilities: ['WiFi', 'AC', 'TV', 'Coffee Maker']
  },
];

const facilityIcons: { [key: string]: any } = {
  WiFi: Wifi,
  AC: Wind,
  TV: Tv,
  'Coffee Maker': Coffee,
};

// Custom arrow components
function NextArrow(props: any) {
  const { onClick } = props;
  return (
    <button
      onClick={onClick}
      className="absolute right-4 top-1/2 -translate-y-1/2 z-10 w-12 h-12 bg-white rounded-full shadow-lg flex items-center justify-center hover:bg-slate-50 transition-all"
    >
      <ChevronRight className="w-6 h-6 text-slate-900" />
    </button>
  );
}

function PrevArrow(props: any) {
  const { onClick } = props;
  return (
    <button
      onClick={onClick}
      className="absolute left-4 top-1/2 -translate-y-1/2 z-10 w-12 h-12 bg-white rounded-full shadow-lg flex items-center justify-center hover:bg-slate-50 transition-all"
    >
      <ChevronLeft className="w-6 h-6 text-slate-900" />
    </button>
  );
}

interface HomepageProps {
  onRoomClick: (roomId: string) => void;
}

export function Homepage({ onRoomClick }: HomepageProps) {
  const [searchLocation, setSearchLocation] = useState('');
  const [priceRange, setPriceRange] = useState([0, 3000]);

  const sliderSettings = {
    dots: true,
    infinite: true,
    speed: 500,
    slidesToShow: 3,
    slidesToScroll: 1,
    autoplay: true,
    autoplaySpeed: 4000,
    nextArrow: <NextArrow />,
    prevArrow: <PrevArrow />,
    responsive: [
      {
        breakpoint: 1024,
        settings: {
          slidesToShow: 2,
        }
      },
      {
        breakpoint: 640,
        settings: {
          slidesToShow: 1,
        }
      }
    ]
  };

  return (
    <div className="bg-gradient-to-br from-slate-50 via-white to-stone-50">
      {/* Hero Section */}
      <section className="relative bg-gradient-to-br from-slate-900 via-stone-800 to-slate-900 text-white py-28 overflow-hidden">
        <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1721009714214-e688d8c07506?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxlbGVnYW50JTIwcm9vbSUyMGludGVyaW9yfGVufDF8fHx8MTc2ODU3NzIzM3ww&ixlib=rb-4.1.0&q=80&w=1080')] bg-cover bg-center opacity-15" />
        <div className="absolute inset-0 bg-gradient-to-t from-slate-900 via-transparent to-transparent" />
        
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, ease: "easeOut" }}
            className="text-center mb-16"
          >
            <h1 className="text-6xl md:text-7xl font-bold mb-6 bg-gradient-to-r from-white via-stone-100 to-stone-200 bg-clip-text text-transparent">
              Find Your Perfect Space
            </h1>
            <p className="text-xl md:text-2xl text-stone-300 max-w-2xl mx-auto leading-relaxed">
              Premium boarding houses and apartments tailored to your lifestyle
            </p>
          </motion.div>

          {/* Enhanced Search Bar */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.2, ease: "easeOut" }}
            className="max-w-5xl mx-auto"
          >
            <Card className="bg-white/10 backdrop-blur-2xl border border-white/20 p-8 shadow-2xl hover:shadow-3xl transition-all duration-300">
              <div className="grid grid-cols-1 md:grid-cols-4 gap-5">
                <div className="md:col-span-2">
                  <label className="text-sm font-semibold text-stone-200 mb-3 block uppercase tracking-wide">Location</label>
                  <div className="relative group">
                    <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-stone-400 group-focus-within:text-stone-200 transition-colors" />
                    <Input
                      placeholder="Where do you want to stay?"
                      value={searchLocation}
                      onChange={(e) => setSearchLocation(e.target.value)}
                      className="pl-12 bg-white/90 backdrop-blur-sm border-white/30 focus:border-white/50 text-slate-900 placeholder:text-slate-500 transition-all font-medium"
                    />
                  </div>
                </div>
                <div>
                  <label className="text-sm font-semibold text-stone-200 mb-3 block uppercase tracking-wide">Price</label>
                  <select className="w-full px-4 py-2.5 bg-white/90 backdrop-blur-sm border border-white/30 hover:border-white/50 focus:border-white/50 rounded-lg text-slate-900 font-medium transition-all cursor-pointer">
                    <option>$0 - $1000</option>
                    <option>$1000 - $2000</option>
                    <option>$2000+</option>
                  </select>
                </div>
                <div>
                  <label className="text-sm font-semibold text-stone-200 mb-3 block uppercase tracking-wide">Type</label>
                  <select className="w-full px-4 py-2.5 bg-white/90 backdrop-blur-sm border border-white/30 hover:border-white/50 focus:border-white/50 rounded-lg text-slate-900 font-medium transition-all cursor-pointer">
                    <option>All Types</option>
                    <option>Standard</option>
                    <option>Deluxe</option>
                    <option>Premium</option>
                    <option>Executive</option>
                  </select>
                </div>
              </div>
              <motion.div
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                <Button className="w-full md:w-auto mt-6 bg-gradient-to-r from-stone-700 to-stone-800 hover:from-stone-600 hover:to-stone-700 text-white font-semibold shadow-lg hover:shadow-xl transition-all px-8 py-2.5">
                  <Search className="w-5 h-5 mr-2" />
                  Search Rooms
                </Button>
              </motion.div>
            </Card>
          </motion.div>
        </div>
      </section>

      {/* Featured Rooms Carousel */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7 }}
          viewport={{ once: true }}
        >
          <div className="text-center mb-16">
            <motion.h2 
              className="text-5xl font-bold text-slate-900 mb-4"
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              transition={{ duration: 0.6 }}
            >
              Featured Rooms
            </motion.h2>
            <p className="text-lg text-slate-600 max-w-2xl mx-auto">Handpicked premium accommodations tailored to your comfort and lifestyle</p>
          </div>

          <div className="relative">
            <Slider {...sliderSettings}>
              {featuredRooms.map((room, index) => (
                <motion.div 
                  key={room.id} 
                  className="px-3"
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: index * 0.1 }}
                  viewport={{ once: true }}
                >
                  <Card className="bg-white shadow-lg hover:shadow-2xl transition-all duration-300 overflow-hidden group cursor-pointer border-0 h-full flex flex-col">
                    <div className="relative h-72 overflow-hidden bg-gradient-to-br from-slate-200 to-slate-300">
                      <ImageWithFallback
                        src={room.image}
                        alt={room.name}
                        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                      />
                      <div className="absolute top-4 right-4">
                        <Badge className="bg-gradient-to-r from-stone-700 to-stone-900 text-white border-0 shadow-lg font-semibold">
                          {room.type}
                        </Badge>
                      </div>
                      <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/70 via-black/30 to-transparent p-5">
                        <div className="flex items-center gap-2 text-white">
                          <MapPin className="w-4 h-4 flex-shrink-0" />
                          <span className="text-sm font-medium">{room.location}</span>
                        </div>
                      </div>
                    </div>

                    <div className="p-6 flex-1 flex flex-col">
                      <div className="flex items-start justify-between mb-4">
                        <h3 className="text-xl font-bold text-slate-900 flex-1 pr-2">{room.name}</h3>
                        <div className="flex items-center gap-1.5 bg-amber-50 px-2.5 py-1.5 rounded-lg whitespace-nowrap">
                          <Star className="w-4 h-4 fill-amber-400 text-amber-400" />
                          <span className="text-sm font-semibold text-amber-900">{room.rating}</span>
                          <span className="text-xs text-amber-700">({room.reviews})</span>
                        </div>
                      </div>

                      <div className="flex gap-2 mb-6 flex-wrap">
                        {room.facilities.map((facility) => {
                          const Icon = facilityIcons[facility];
                          return (
                            <div
                              key={facility}
                              className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-100 hover:bg-slate-200 rounded-full text-xs text-slate-700 font-medium transition-colors"
                            >
                              {Icon && <Icon className="w-3.5 h-3.5 text-slate-600" />}
                              <span>{facility}</span>
                            </div>
                          );
                        })}
                      </div>

                      <div className="border-t border-slate-200 pt-5 mt-auto">
                        <div className="flex items-center justify-between gap-4">
                          <div>
                            <span className="text-3xl font-bold text-stone-900">
                              ${room.price}
                            </span>
                            <span className="text-slate-500 text-sm ml-1">/month</span>
                          </div>
                          <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                            <Button
                              onClick={() => onRoomClick(room.id)}
                              className="flex-1 bg-gradient-to-r from-stone-700 to-stone-900 hover:from-stone-600 hover:to-stone-800 text-white font-semibold shadow-md hover:shadow-lg transition-all"
                            >
                              View Details
                            </Button>
                          </motion.div>
                        </div>
                      </div>
                    </div>
                  </Card>
                </motion.div>
              ))}
            </Slider>
          </div>
        </motion.div>
      </section>

      {/* Why Choose Us */}
      <section className="bg-gradient-to-br from-slate-50 via-white to-stone-50 py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7 }}
            viewport={{ once: true }}
          >
            <div className="text-center mb-16">
              <motion.h2 
                className="text-5xl font-bold text-slate-900 mb-4"
                initial={{ opacity: 0 }}
                whileInView={{ opacity: 1 }}
                transition={{ duration: 0.6 }}
              >
                Why Choose LuxeStay?
              </motion.h2>
              <p className="text-lg text-slate-600 max-w-2xl mx-auto">Experience premium features and exceptional service in every aspect</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {[
                {
                  title: 'Verified Listings',
                  description: 'All properties are thoroughly verified and regularly inspected for quality assurance',
                  icon: '✓',
                  color: 'from-emerald-100 to-teal-100 border-emerald-300'
                },
                {
                  title: 'Flexible Booking',
                  description: 'Monthly rentals with flexible terms and transparent conditions tailored to you',
                  icon: '📅',
                  color: 'from-blue-100 to-indigo-100 border-blue-300'
                },
                {
                  title: '24/7 Support',
                  description: 'Round-the-clock customer support for all your inquiries and concerns',
                  icon: '💬',
                  color: 'from-purple-100 to-pink-100 border-purple-300'
                },
              ].map((feature, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: index * 0.1 }}
                  viewport={{ once: true }}
                  whileHover={{ y: -5 }}
                >
                  <Card className={`bg-gradient-to-br ${feature.color} border p-8 text-center hover:shadow-xl transition-all duration-300 h-full`}>
                    <motion.div 
                      className="text-6xl mb-4 inline-block"
                      whileHover={{ scale: 1.2, rotate: 5 }}
                    >
                      {feature.icon}
                    </motion.div>
                    <h3 className="text-2xl font-bold text-slate-900 mb-3">{feature.title}</h3>
                    <p className="text-slate-700 leading-relaxed">{feature.description}</p>
                  </Card>
                </motion.div>
              ))}
            </div>
          </motion.div>
        </div>
      </section>
    </div>
  );
}