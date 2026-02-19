"use client";

import { useEffect, useRef } from "react";
import {
  motion,
  useInView,
  useMotionValue,
  useSpring,
  AnimatePresence,
  Variants,
} from "framer-motion";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  CardFooter,
} from "@/app/components/ui/card";
import { Button } from "@/app/components/ui/button";
import { Input } from "@/app/components/ui/input";
import { Badge } from "@/app/components/ui/badge";
import { ImageWithFallback } from "@/app/components/shared/ImageWithFallback";
import { SkeletonGrid } from "@/app/components/ui/loading-screen";
import {
  MapPin,
  Star,
  Home,
  Search,
  ArrowRight,
  X,
  RotateCcw
} from 'lucide-react';
import { getImageUrl } from '@/app/utils/api-url';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/app/components/ui/select";
import { useHome } from "../dashboard/hooks/useHome";
import { useTranslations } from 'next-intl';

// --- Komponen Counter untuk Trust Indicators ---
function Counter({
  value,
  suffix = "",
  decimals = 0,
}: {
  value: number;
  suffix?: string;
  decimals?: number;
}) {
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
        ref.current.textContent =
          latest.toFixed(decimals).toLocaleString() + suffix;
      }
    });
  }, [springValue, decimals, suffix]);

  return <span ref={ref}>0</span>;
}

// --- Animation Variants ---
const fadeInUp: Variants = {
  hidden: { opacity: 0, y: 30 },
  visible: { 
    opacity: 1, 
    y: 0, 
    transition: { 
      duration: 0.6, 
      ease: "easeOut"
    } 
  },
};

const staggerContainer: Variants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.15 } },
};

interface HomepageProps {
  onRoomClick: (roomId: string) => void;
  isLoggedIn?: boolean;
  onLoginPrompt?: () => void;
  userName?: string;
  onViewHistory?: () => void;
}

export function Homepage({
  onRoomClick,
  isLoggedIn,
  userName,
  onViewHistory,
}: HomepageProps) {
  const {
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
  } = useHome();
  const t = useTranslations('home');
  const tc = useTranslations('common');

  const formatCurrency = (val: number) => {
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      minimumFractionDigits: 0,
    }).format(val);
  };

  return (
    <div className="bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-50 transition-colors overflow-x-hidden font-sans">

      {/* 1. Hero Section */}
      <section className="relative px-4 pt-12 pb-10 lg:pt-32 lg:pb-32 overflow-hidden bg-white dark:bg-slate-950 transition-colors duration-500 ease-in-out">
        <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-12 items-center gap-8 lg:gap-16">
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8 }}
            className="md:col-span-7 text-left order-2 md:order-1"
          >
            {isLoggedIn ? (
              // Logged In View
              <>
                <Badge variant="outline" className="mb-4 lg:mb-6 px-3 lg:px-4 py-1 lg:py-1.5 text-emerald-600 border-emerald-200 bg-emerald-50 rounded-full font-bold uppercase tracking-wider text-[9px] lg:text-xs">
                  {t('welcomeBadge')}
                </Badge>
                <h1 className="text-3xl md:text-5xl lg:text-7xl font-extrabold leading-[1.15] mb-4 lg:mb-6 text-slate-900 dark:text-white">
                  {t.rich('hiUser', { 
                    name: userName || 'User',
                    nameWrapper: (chunks) => (
                      <span className="inline-block truncate max-w-[250px] md:max-w-[450px] align-bottom" title={userName || 'User'}>
                        {chunks}
                      </span>
                    )
                  })} <br />
                  <span className="text-slate-900 dark:text-white text-2xl md:text-4xl lg:text-5xl font-bold">{t('readyToRelax')}</span>
                </h1>
                <p className="text-sm md:text-lg lg:text-xl text-slate-600 dark:text-slate-400 mb-6 lg:mb-10 max-w-xl leading-relaxed">
                  {t('loggedInSubtitle')}
                </p>
                <div className="flex flex-row gap-3 lg:gap-4">
                  <Button 
                    onClick={onViewHistory} 
                    className="flex-1 md:flex-none bg-stone-900 hover:bg-stone-800 text-white px-6 lg:px-8 py-5 lg:py-6 rounded-xl lg:rounded-2xl text-base lg:text-lg font-bold shadow-xl"
                  >
                    {t('checkBills')}
                  </Button>
                  <Button 
                    variant="ghost" 
                    onClick={() => {
                        const el = document.getElementById('featured-rooms');
                        if (el) el.scrollIntoView({ behavior: 'smooth' });
                    }}
                    className="flex-1 md:flex-none px-6 lg:px-8 py-5 lg:py-6 rounded-xl lg:rounded-2xl text-base lg:text-lg font-bold border-2 border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white hover:bg-slate-100 dark:hover:bg-slate-800"
                  >
                    {t('viewRooms')}
                  </Button>
                </div>
              </>
            ) : (
              // Guest View
              <>
                <Badge variant="outline" className="mb-4 lg:mb-6 px-3 lg:px-4 py-1 lg:py-1.5 text-amber-600 border-amber-200 bg-amber-50 rounded-full font-bold uppercase tracking-wider text-[9px] lg:text-xs">
                  {t('guestBadge')}
                </Badge>
                <h1 className="text-3xl md:text-5xl lg:text-7xl font-extrabold leading-[1.15] mb-4 lg:mb-6 text-slate-900 dark:text-white">
                  {t('findDreamHome')} <br className="hidden md:block" />
                  <span className="text-amber-500">{t('findDreamHomeHighlight')}</span>
                </h1>
                <p className="text-sm md:text-lg lg:text-xl text-slate-600 dark:text-slate-400 mb-6 lg:mb-10 max-w-xl leading-relaxed">
                  {t('guestSubtitle')}
                </p>
                <div className="flex flex-row gap-3 lg:gap-4">
                  <Button onClick={() => window.scrollTo({ top: 800, behavior: 'smooth' })} className="flex-1 md:flex-none bg-slate-900 hover:bg-slate-800 text-white px-6 lg:px-8 py-5 lg:py-6 rounded-xl lg:rounded-2xl text-base lg:text-lg font-bold shadow-xl">{tc('explore')}</Button>
                  <Button variant="ghost" className="flex-1 md:flex-none px-6 lg:px-8 py-5 lg:py-6 rounded-xl lg:rounded-2xl text-base lg:text-lg font-bold border-2 border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white hover:bg-slate-100 dark:hover:bg-slate-800">{tc('learn')}</Button>
                </div>
              </>
            )}
            
          </motion.div>

          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.8 }}
            className="md:col-span-5 relative order-1 md:order-2"
          >
            <div className="relative z-10 rounded-[1.5rem] lg:rounded-[3rem] overflow-hidden shadow-2xl border-[4px] lg:border-[12px] border-white dark:border-slate-800">
              <ImageWithFallback
                src="https://images.unsplash.com/photo-1522771739844-6a9f6d5f14af?q=80&w=1080"
                alt="Main Interior"
                className="w-full aspect-[4/3] md:aspect-square lg:aspect-[4/3] object-cover"
              />
            </div>
          </motion.div>
        </div>
      </section>

      {/* 2. Search & Filter Section */}
      <section className="relative z-20 -mt-8 md:-mt-10 px-4">
        <div className="max-w-5xl mx-auto">
          <Card className="bg-white/90 dark:bg-slate-900/90 backdrop-blur-xl border-white/20 shadow-2xl rounded-[1.5rem] lg:rounded-[2.5rem] p-4 lg:p-6 transition-all duration-500 ease-in-out">
            <div className="flex flex-col md:grid md:grid-cols-4 gap-4 items-center">
              <div className="w-full md:col-span-2 relative">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <Input
                  placeholder={t('searchPlaceholder')}
                  value={searchLocation}
                  onChange={(e) => setSearchLocation(e.target.value)}
                  className="pl-10 h-12 lg:h-14 bg-slate-50/50 border-none rounded-xl lg:rounded-2xl text-sm lg:text-base pr-10"
                />
                {searchLocation && (
                  <button
                    onClick={() => setSearchLocation('')}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors"
                  >
                    <X className="w-4 h-4" />
                  </button>
                )}
              </div>
              <div className="w-full md:col-span-1">
                <Select value={selectedPrice} onValueChange={setSelectedPrice}>
                  <SelectTrigger className="h-12 lg:h-14 bg-slate-50/50 border-none rounded-xl lg:rounded-2xl text-sm lg:text-base focus:ring-amber-500">
                    <SelectValue placeholder={t('priceLabel')} />
                  </SelectTrigger>
                  <SelectContent className="rounded-xl border-slate-100 shadow-xl">
                    <SelectItem value="all">{t('allPrices')}</SelectItem>
                    <SelectItem value="1jt">
                      {t('priceWithBathroom')}
                    </SelectItem>
                    <SelectItem value="800rb">
                      {t('priceWithoutBathroom')}
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="w-full md:col-span-1 flex gap-2">
                <Button
                  onClick={() => {
                    const el = document.getElementById('featured-rooms');
                    if (el) el.scrollIntoView({ behavior: 'smooth' });
                  }}
                  className="flex-1 h-12 lg:h-14 bg-slate-900 hover:bg-slate-800 text-white rounded-xl lg:rounded-2xl font-bold text-sm lg:text-base transition-all hover:scale-[1.02] active:scale-95 shadow-lg shadow-slate-900/10"
                >
                  {tc('search')}
                </Button>
                {(searchLocation || selectedPrice !== 'all' || selectedType !== 'all') && (
                  <Button
                    variant="outline"
                    onClick={resetFilters}
                    className="h-12 lg:h-14 border-2 border-slate-100 rounded-xl lg:rounded-2xl px-4 group hover:bg-slate-50"
                    title="Reset Filter"
                  >
                    <RotateCcw className="w-4 h-4 text-slate-500 group-hover:rotate-180 transition-transform duration-500" />
                  </Button>
                )}
              </div>
            </div>
          </Card>
        </div>
      </section>

      {/* 3. Featured Rooms Section (Force 2 Columns on Mobile) */}
      <section
        id="featured-rooms"
        className="px-4 py-20 lg:py-32 bg-slate-50 dark:bg-slate-950 transition-colors duration-500 ease-in-out"
      >
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-6 mb-10 lg:mb-16">
            <div className="text-left">
              <h2 className="text-xl lg:text-4xl font-bold text-slate-900 dark:text-white mb-1">
                {t('roomSelection')}
              </h2>
              <p className="text-[10px] lg:text-base text-slate-500">
                {t('completeFacilities')}
              </p>
            </div>
            <div className="flex bg-white dark:bg-slate-900 p-0.5 lg:p-1 rounded-lg lg:rounded-2xl shadow-sm border border-slate-100 scale-90 lg:scale-100 origin-right overflow-x-auto no-scrollbar max-w-[60vw]">
              {[t('all'), "Standard", "Premium"].map((tab) => (
                <button
                  key={tab}
                  onClick={() => setSelectedType(tab === t('all') ? "all" : tab)}
                  className={`px-3 lg:px-6 py-1.5 lg:py-2.5 rounded-md lg:rounded-xl text-[10px] lg:text-sm font-semibold transition-all whitespace-nowrap ${
                    selectedType === tab ||
                    (tab === t('all') && selectedType === "all")
                      ? "bg-slate-900 text-white shadow-md"
                      : "text-slate-500 hover:bg-slate-50"
                  }`}
                >
                  {tab}
                </button>
              ))}
            </div>
          </div>

          <motion.div
            variants={staggerContainer}
            initial="hidden"
            animate="visible"
            className="grid grid-cols-2 lg:grid-cols-3 gap-3 lg:gap-8 min-h-[400px]"
          >
            <AnimatePresence mode="popLayout">
              {isLoadingRooms ? (
                <div className="col-span-full">
                  <SkeletonGrid count={6} />
                </div>
              ) : displayRooms.length > 0 ? (
                displayRooms.map((room) => (
                  <motion.div
                    key={room.id}
                    layout // Keep layout for smooth reordering
                    variants={fadeInUp}
                    initial="hidden"
                    animate="visible"
                    whileHover={{ y: -5 }}
                    className="group cursor-pointer h-full"
                    onClick={() => onRoomClick(room.id)}
                  >
                    <Card className="overflow-hidden border-0 bg-white dark:bg-slate-900 shadow-lg lg:shadow-xl lg:shadow-slate-200/50 dark:shadow-none rounded-[1.2rem] lg:rounded-[2.5rem] h-full flex flex-col transition-all duration-300 hover:shadow-2xl">
                      <div className="relative aspect-[4/3] overflow-hidden rounded-t-[1.2rem] lg:rounded-t-[2.5rem] transform-gpu">
                        <ImageWithFallback
                          src={room.image}
                          alt={room.name}
                          className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                        />
                        <div className="absolute top-2 left-2 lg:top-4 lg:left-4">
                          <Badge className="bg-white/90 backdrop-blur-md text-slate-900 border-0 px-2 lg:px-4 py-0.5 lg:py-1.5 rounded-full font-bold shadow-sm text-[8px] lg:text-xs">
                            {room.type}
                          </Badge>
                        </div>
                      </div>
                      <CardHeader className="p-3 lg:p-6 pb-2">
                        <div className="flex justify-between items-start mb-1">
                          <CardTitle className="text-sm lg:text-2xl font-bold truncate pr-2">
                            {room.name}
                          </CardTitle>
                          <div className="flex items-center gap-0.5 text-amber-500 font-bold text-[10px] lg:text-base shrink-0">
                            <Star className="w-2.5 h-2.5 lg:w-4 lg:h-4 fill-current" />
                            <span>{room.rating}</span>
                          </div>
                        </div>
                        <CardDescription className="flex items-center gap-1 text-slate-500 text-[8px] lg:text-sm">
                          <MapPin className="w-2 h-2 lg:w-4 lg:h-4" />{" "}
                          {room.location}
                        </CardDescription>
                      </CardHeader>
                      <CardContent className="px-3 lg:px-6 py-0 flex-1">
                        <div className="flex flex-wrap gap-1 lg:gap-2 mb-3">
                          {room.facilities.slice(0, 3).map((f: string, i: number) => (
                            <span
                              key={i}
                              className="text-[7px] lg:text-[10px] bg-slate-50 dark:bg-slate-800 px-1.5 lg:px-2 py-0.5 rounded text-slate-400 border border-slate-100 dark:border-slate-700"
                            >
                              {f}
                            </span>
                          ))}
                        </div>
                      </CardContent>
                      <CardFooter className="p-3 lg:p-6 border-t mt-auto flex items-center justify-between gap-2">
                        <div>
                          <p className="text-[10px] lg:text-2xl font-extrabold text-slate-900 dark:text-white leading-none">
                            {formatCurrency(room.price).replace(",00", "")}
                          </p>
                          <span className="text-[8px] lg:text-sm font-normal text-slate-400">
                            {tc('perMonth')}
                          </span>
                        </div>
                        <Button
                          size="sm"
                          variant="default"
                          className="h-7 lg:h-12 px-3 lg:px-6 bg-slate-900 hover:bg-amber-500 text-white rounded-lg lg:rounded-xl text-[8px] lg:text-sm font-bold transition-all flex items-center gap-1 group/btn"
                          onClick={(e) => {
                            e.stopPropagation();
                            onRoomClick(room.id);
                          }}
                        >
                          {t('selectRoom')} <ArrowRight className="w-2 h-2 lg:w-4 lg:h-4 group-hover/btn:translate-x-1 transition-transform" />
                        </Button>
                      </CardFooter>
                    </Card>
                  </motion.div>
                ))
              ) : (
                <motion.div
                  className="col-span-full py-20 text-center flex flex-col items-center justify-center bg-slate-50 dark:bg-slate-900/50 rounded-[2rem] border-2 border-dashed border-slate-200 dark:border-slate-800"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                >
                  <Home className="w-16 h-16 text-slate-300 mb-4" />
                  <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-2">
                    {t('noRoomsFound')}
                  </h3>
                  <p className="text-slate-500 max-w-xs mx-auto text-center">
                    {t('tryOtherCriteria')}
                  </p>
                  <Button
                    variant="outline"
                    className="mt-6 rounded-full border-slate-300"
                    onClick={resetFilters}
                  >
                    {tc('resetFilter')}
                  </Button>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        </div>
      </section>

      {/* 4. User Guide Section */}
      <section className="px-4 py-20 lg:py-32 bg-white dark:bg-slate-900 overflow-hidden">
        <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-12 items-center gap-10 lg:gap-20">
          <div className="col-span-1 md:col-span-7 lg:col-span-6 w-full">
            <Badge className="bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400 mb-6 px-4 py-1.5 rounded-full font-bold text-[10px] lg:text-xs">{t('simpleSteps')}</Badge>
            <h2 className="text-3xl md:text-5xl lg:text-7xl font-extrabold leading-tight mb-8 lg:mb-12 text-slate-900 dark:text-white">
              {t('userGuide')} <br />
              <span className="text-amber-500">{t('userGuideHighlight')}</span>
            </h2>
            <div className="grid grid-cols-1 gap-4 lg:gap-8">
              {[
                {
                  step: "01",
                  title: t('step01'),
                  desc: t('step01Desc'),
                  color: "bg-blue-500",
                },
                {
                  step: "02",
                  title: t('step02'),
                  desc: t('step02Desc'),
                  color: "bg-purple-500",
                },
                {
                  step: "03",
                  title: t('step03'),
                  desc: t('step03Desc'),
                  color: "bg-amber-500",
                },
                {
                  step: "04",
                  title: t('step04'),
                  desc: t('step04Desc'),
                  color: "bg-emerald-500",
                },
              ].map((item, idx) => (
                <motion.div
                  key={idx}
                  initial={{ opacity: 0, x: -20 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: idx * 0.1 }}
                  className="flex gap-4 lg:gap-8 p-4 lg:p-8 rounded-[1.5rem] lg:rounded-[2.5rem] bg-white dark:bg-slate-800/20 border border-slate-50 dark:border-slate-800 hover:border-amber-200 transition-all group"
                >
                  <div className={`w-10 h-10 lg:w-16 lg:h-16 shrink-0 rounded-xl lg:rounded-3xl ${item.color} text-white flex items-center justify-center font-black text-sm lg:text-2xl shadow-xl`}>
                    {item.step}
                  </div>
                  <div className="flex flex-col justify-center">
                    <h3 className="text-base lg:text-3xl font-bold text-slate-900 dark:text-white group-hover:text-amber-500 transition-colors leading-tight mb-1">{item.title}</h3>
                    <p className="text-slate-500 dark:text-slate-400 leading-relaxed text-xs lg:text-lg">{item.desc}</p>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
          <div className="col-span-1 md:col-span-5 lg:col-span-6 relative flex items-center justify-center">
            <div className="relative z-10 bg-slate-50 dark:bg-slate-800/50 rounded-[2rem] lg:rounded-[5rem] p-3 lg:p-12 aspect-square w-full max-w-lg">
              <ImageWithFallback src="https://images.unsplash.com/photo-1560518883-ce09059eeffa?q=80&w=1000" alt="Guide illustration" className="w-full h-full object-cover rounded-[1.5rem] lg:rounded-[4rem] shadow-2xl" />
            </div>
            {/* Decorative blob */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[140%] h-[140%] bg-amber-500/5 rounded-full blur-[60px] lg:blur-[120px] -z-10" />
          </div>
        </div>
      </section>

      {/* 5. Sejarah Section (Force Layout Split) */}
      <section className="px-4 py-16 lg:py-24 bg-slate-50 dark:bg-slate-950 overflow-hidden">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-10 lg:mb-16">
            <Badge className="bg-slate-900 text-white mb-2 lg:mb-4 px-4 lg:px-6 py-1 lg:py-2 rounded-full text-[10px]">
              {t('ourLegacy')}
            </Badge>
            <h2 className="text-2xl lg:text-5xl font-bold mb-2 lg:mb-4 text-slate-900 dark:text-white">
              {t('historyTitle')}
            </h2>
            <div className="w-16 lg:w-24 h-1 lg:h-1.5 bg-amber-500 mx-auto rounded-full" />
          </div>

          <div className="grid grid-cols-12 gap-6 lg:gap-16 items-center">
            <motion.div className="col-span-12 lg:col-span-6 relative order-2 lg:order-1">
              <div className="aspect-square bg-white dark:bg-slate-900 rounded-[2rem] lg:rounded-[3rem] p-4 lg:p-8 shadow-2xl relative z-10">
                <ImageWithFallback
                  src="https://images.unsplash.com/photo-1560518883-ce09059eeffa?q=80&w=1000"
                  className="w-full h-full object-cover rounded-[1.5rem] lg:rounded-[2rem]"
                  alt="History Image"
                />
              </div>
              <div className="absolute -bottom-4 -right-4 lg:-bottom-6 lg:-right-6 bg-amber-500 text-white p-4 lg:p-8 rounded-[1.5rem] lg:rounded-[2rem] shadow-xl z-20">
                <p className="text-xl lg:text-5xl font-black italic leading-none">
                  EST. 2018
                </p>
                <p className="uppercase tracking-widest font-bold text-[8px] lg:text-sm text-white/80">
                  Malang
                </p>
              </div>
            </motion.div>

            <div className="col-span-12 lg:col-span-6 space-y-4 lg:space-y-8 order-1 lg:order-2">
              <div className="space-y-3 lg:space-y-6 text-sm lg:text-xl text-slate-600 dark:text-slate-400 leading-relaxed italic border-l-4 border-amber-500 pl-4 lg:pl-8">
                <p>
                  {t('historyText1')}
                </p>
                <p className="hidden md:block">
                  {t('historyText2')}
                </p>
              </div>
              <div className="flex gap-3 lg:gap-4">
                <div className="p-4 lg:p-6 bg-white dark:bg-slate-900 rounded-[1.2rem] lg:rounded-[2rem] shadow-sm border border-slate-100 flex-1">
                  <p className="text-xl lg:text-4xl font-extrabold text-slate-900 dark:text-white">
                    6++
                  </p>
                  <p className="text-[8px] lg:text-sm text-slate-500 font-bold uppercase tracking-wider">
                    {t('yearsExcellence')}
                  </p>
                </div>
                <div className="p-4 lg:p-6 bg-white dark:bg-slate-900 rounded-[1.2rem] lg:rounded-[2rem] shadow-sm border border-slate-100 flex-1">
                  <p className="text-xl lg:text-4xl font-extrabold text-slate-900 dark:text-white">
                    200++
                  </p>
                  <p className="text-[8px] lg:text-sm text-slate-500 font-bold uppercase tracking-wider">
                    {t('alumni')}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 6. Trust Indicators Section (Optimized for Mobile Row) */}
      <section className="px-4 py-12 lg:py-24 bg-white dark:bg-slate-900">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 lg:gap-12 text-center">
            <div className="px-2">
              <h2 className="text-2xl lg:text-6xl font-black text-slate-900 dark:text-white mb-2 lg:mb-4">
                <Counter value={4.9} decimals={1} />
              </h2>
              <p className="text-slate-400 font-bold tracking-widest uppercase text-[8px] lg:text-sm">
                {t('rating')}
              </p>
              <div className="flex gap-0.5 mt-2 justify-center text-amber-500">
                {[...Array(5)].map((_, i) => (
                  <Star
                    key={i}
                    className="w-3 h-3 lg:w-5 lg:h-5 fill-current"
                  />
                ))}
              </div>
            </div>
            <div className="px-2 border-l border-slate-100 dark:border-slate-800">
              <h2 className="text-2xl lg:text-6xl font-black text-slate-900 dark:text-white mb-2 lg:mb-4">
                <Counter value={98} suffix="%" />
              </h2>
              <p className="text-slate-400 font-bold tracking-widest uppercase text-[8px] lg:text-sm">
                {t('satisfaction')}
              </p>
            </div>
            <div className="px-2 border-l border-slate-100 dark:border-slate-800 lg:border-l-0">
              <h2 className="text-2xl lg:text-6xl font-black text-slate-900 dark:text-white mb-2 lg:mb-4">
                <Counter value={2500} suffix="+" />
              </h2>
              <p className="text-slate-400 font-bold tracking-widest uppercase text-[8px] lg:text-sm">
                {t('residents')}
              </p>
            </div>
            <div className="px-2 border-l border-slate-100 dark:border-slate-800">
              <h2 className="text-2xl lg:text-6xl font-black text-slate-900 dark:text-white mb-2 lg:mb-4">
                24/7
              </h2>
              <p className="text-slate-400 font-bold tracking-widest uppercase text-[8px] lg:text-sm">
                {t('support')}
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* 7. Ulasan Section (Infinite Auto-Scroller - Smaller Cards on Mobile) */}
      <section className="py-16 lg:py-24 bg-slate-50 dark:bg-slate-950 overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 mb-10 lg:mb-16 text-center">
          <Badge className="bg-amber-500 text-white mb-2 lg:mb-4 px-4 py-1 rounded-full text-[10px]">
            {t('community')}
          </Badge>
          <h2 className="text-2xl lg:text-5xl font-bold mb-2 lg:mb-4 text-slate-900 dark:text-white">
            {t('residentReviews')}
          </h2>
          <p className="text-slate-500 text-xs lg:text-lg">
            {t('reviewsSubtitle')}
          </p>
        </div>

        <div className="relative flex flex-col gap-6 lg:gap-10">
          <div className="relative flex">
            <motion.div
              className="flex gap-4 lg:gap-8 px-4"
              animate={{ x: ["0%", "-50%"] }}
              transition={{ duration: 40, ease: "linear", repeat: Infinity }}
            >
              {[...reviews, ...reviews].map((r, idx) => (
                <div key={idx} className="min-w-[280px] lg:min-w-[400px] group">
                  <Card className="p-6 lg:p-10 bg-white dark:bg-slate-900 border-0 shadow-lg lg:shadow-xl rounded-[1.5rem] lg:rounded-[2.5rem] h-full flex flex-col">
                    <div className="flex gap-0.5 lg:gap-1 text-amber-500 mb-4 lg:mb-8">
                      {[...Array(5)].map((_, i) => (
                        <Star
                          key={i}
                          className="w-3 h-3 lg:w-5 lg:h-5 fill-current"
                        />
                      ))}
                    </div>
                    <p className="text-slate-700 dark:text-slate-300 text-sm lg:text-xl italic leading-relaxed mb-6 lg:mb-10">
                      &quot;{r.review}&quot;
                    </p>
                    <div className="mt-auto flex items-center gap-3 lg:gap-5 border-t dark:border-slate-800 pt-4 lg:pt-8">
                      <div className="w-10 h-10 lg:w-14 lg:h-14 rounded-full overflow-hidden border border-slate-100">
                        <ImageWithFallback
                          src={getImageUrl(r.image)}
                          alt={r.name}
                          className="w-full h-full object-cover"
                        />
                      </div>
                      <div>
                        <p className="text-sm lg:text-lg font-bold text-slate-900 dark:text-white">{r.name}</p>
                        <p className="text-[10px] lg:text-sm text-slate-500">{r.role} • {r.stayDuration}</p>
                      </div>
                    </div>
                  </Card>
                </div>
              ))}
            </motion.div>
          </div>
        </div>
      </section>

      {/* Footer Decoration */}
      <div className="mt-20 py-10 border-t border-slate-200 dark:border-slate-800 flex justify-between items-center text-slate-400 text-[10px] uppercase tracking-widest px-8">
        <p>{t('footerCopyright')}</p>
        <div className="flex gap-6">
          <span className="cursor-pointer hover:text-black dark:hover:text-white transition-colors">Instagram</span>
          <span className="cursor-pointer hover:text-black dark:hover:text-white transition-colors">WhatsApp</span>
        </div>
      </div>
    </div>
  );
}
