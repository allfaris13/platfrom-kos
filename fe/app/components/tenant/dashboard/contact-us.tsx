import React, { useState, useEffect } from 'react';

import { motion } from 'framer-motion';
import { Mail, Phone, MapPin, Send, MessageSquare, Clock, Facebook, Instagram, Twitter, CheckCircle2, Loader2, Navigation } from 'lucide-react';

import { Button } from '@/app/components/ui/button';
import { Input } from '@/app/components/ui/input';
import { toast } from 'sonner';
import { api } from '@/app/services/api';


export function ContactUs() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    message: '',
  });
  const [loading, setLoading] = useState(false);
  const [emailError, setEmailError] = useState('');

  const validateEmail = (email: string) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    if (name === 'email') {
      setEmailError('');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {

    e.preventDefault();

    if (!formData.name.trim()) {
      toast.error('Nama tidak boleh kosong');
      return;
    }

    if (!validateEmail(formData.email)) {
      setEmailError('Email tidak valid');
      return;
    }

    if (!formData.message.trim()) {
      toast.error('Pesan tidak boleh kosong');
      return;
    }

    setLoading(true);
    try {
      await api.sendContactForm(formData);
      setLoading(false);
      setFormData({ name: '', email: '', message: '' });
      toast.success('Pesan berhasil terkirim!', {
        description: 'Terima kasih telah menghubungi kami. Tim kami akan segera merespons pesan Anda.',
        duration: 4000,
        icon: <CheckCircle2 className="w-5 h-5 text-green-500" />,
      });
    } catch (err: unknown) {
      setLoading(false);
      let errorMessage = 'Gagal mengirim pesan. Silakan coba lagi.';
      if (err instanceof Error) {
        errorMessage = err.message;
      }
      toast.error(errorMessage);
    }
  };

  useEffect(() => {
    // Check if Leaflet is available (loaded via CDN)
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    if (typeof window !== 'undefined' && (window as any).L) {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const L = (window as any).L;
      
      const coords: [number, number] = [-7.9548233, 112.6049854];
      const map = L.map('map').setView(coords, 17);

      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
      }).addTo(map);

      const marker = L.marker(coords).addTo(map);
      marker.bindPopup(`
        <div style="font-family: Poppins, sans-serif; padding: 5px;">
          <h4 style="margin: 0 0 5px 0; font-weight: 700;">Kost Putra Rahmat ZAW</h4>
          <p style="margin: 0; font-size: 12px; color: #666;">Pondok Alam, Jl. Sigura - Gura No.21 Blok A2, Malang</p>
        </div>
      `).openPopup();

      // Clean up on unmount
      return () => {
        map.remove();
      };
    }
  }, []);


  return (
    <section className="bg-white dark:bg-slate-950 text-slate-900 dark:text-slate-100 transition-colors overflow-x-hidden py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          
          {/* Header Section */}
          <div className="text-center mb-16">
            <motion.h4 
              initial={{ opacity: 0, y: 10 }}
              whileInView={{ opacity: 1, y: 0 }}
              className="text-stone-500 dark:text-stone-400 font-bold tracking-widest uppercase text-sm mb-3"
            >
              Get In Touch
            </motion.h4>
            <motion.h2 
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="text-4xl md:text-5xl font-black text-slate-900 dark:text-white"
            >
              Hubungi Tim <span className="text-stone-600 dark:text-stone-400">Rahmat ZAW</span>
            </motion.h2>
            <p className="mt-4 text-slate-500 dark:text-slate-400 max-w-2xl mx-auto">
              Punya pertanyaan mengenai fasilitas atau ingin melakukan kunjungan langsung? Kami siap membantu kenyamanan hunian Anda.
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            
            {/* Contact Info Card (Dark Mode Theme) */}
            <motion.div 
              initial={{ opacity: 0, x: -30 }}
              whileInView={{ opacity: 1, x: 0 }}
              className="lg:col-span-1 bg-stone-900 dark:bg-stone-900 rounded-[2rem] p-8 text-white relative overflow-hidden shadow-2xl shadow-stone-300 dark:shadow-none"
            >
              {/* Background Decor */}
              <div className="absolute -top-24 -right-24 w-64 h-64 bg-stone-800 rounded-full opacity-50" />
              
              <div className="relative z-10 h-full flex flex-col justify-between">
                <div>
                  <h3 className="text-2xl font-bold mb-6">Informasi Kontak</h3>
                  <p className="text-stone-400 mb-10">Layanan pelanggan kami tersedia setiap hari untuk menjawab kebutuhan Anda.</p>
                  
                  <div className="space-y-8">
                    <div className="flex items-center gap-5 group">
                      <div className="w-12 h-12 bg-stone-800 rounded-xl flex items-center justify-center group-hover:bg-amber-500 transition-colors">
                        <Phone className="w-5 h-5 text-white" />
                      </div>
                      <div>
                        <p className="text-xs text-stone-400 uppercase font-bold">Telepon</p>
                        <p className="font-medium">+62 812-4911-926</p>
                      </div>
                    </div>

                    <div className="flex items-center gap-5 group">
                      <div className="w-12 h-12 bg-stone-800 rounded-xl flex items-center justify-center group-hover:bg-amber-500 transition-colors">
                        <Mail className="w-5 h-5 text-white" />
                      </div>
                      <div>
                        <p className="text-xs text-stone-400 uppercase font-bold">Email</p>
                        <p className="font-medium">support@rahmatzaw.com</p>
                      </div>
                    </div>

                    <div className="flex items-center gap-5 group">
                      <div className="w-12 h-12 bg-stone-800 rounded-xl flex items-center justify-center group-hover:bg-amber-500 transition-colors">
                        <MapPin className="w-5 h-5 text-white" />
                      </div>
                      <div>
                        <p className="text-xs text-stone-400 uppercase font-bold">Lokasi</p>
                        <p className="font-medium text-sm">Pondok Alam, Jl. Sigura - Gura No.21 Blok A2, Malang</p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Social Media */}
                <div className="mt-12 flex gap-4">
                  <a href="#" className="w-10 h-10 bg-stone-800 rounded-full flex items-center justify-center hover:bg-white hover:text-stone-900 transition-all"><Instagram size={18}/></a>
                  <a href="#" className="w-10 h-10 bg-stone-800 rounded-full flex items-center justify-center hover:bg-white hover:text-stone-900 transition-all"><Facebook size={18}/></a>
                  <a href="#" className="w-10 h-10 bg-stone-800 rounded-full flex items-center justify-center hover:bg-white hover:text-stone-900 transition-all"><Twitter size={18}/></a>
                </div>
              </div>
            </motion.div>

            {/* Form Section */}
            <motion.div 
              initial={{ opacity: 0, x: 30 }}
              whileInView={{ opacity: 1, x: 0 }}
              className="lg:col-span-2 bg-white dark:bg-slate-900 rounded-[2rem] p-10 shadow-xl shadow-slate-200 dark:shadow-none border border-slate-100 dark:border-slate-800"
            >
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="text-sm font-bold text-slate-700 dark:text-slate-300">Nama Lengkap</label>
                    <Input 
                      name="name"
                      value={formData.name}
                      onChange={handleChange}
                      placeholder="Contoh: Budi Setiawan" 
                      className="h-12 rounded-xl border-slate-200 dark:border-slate-700 dark:bg-slate-800 dark:text-white focus:ring-stone-500" 
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-bold text-slate-700 dark:text-slate-300">Alamat Email</label>
                    <div>
                      <Input 
                        type="email" 
                        name="email"
                        value={formData.email}
                        onChange={handleChange}
                        placeholder="budi@email.com" 
                        className={`h-12 rounded-xl border-slate-200 dark:border-slate-700 dark:bg-slate-800 dark:text-white focus:ring-stone-500 ${emailError ? 'border-red-500' : ''}`}
                      />
                      {emailError && <p className="text-red-500 text-xs mt-1">{emailError}</p>}
                    </div>
                  </div>
                </div>


                <div className="space-y-2">
                  <label className="text-sm font-bold text-slate-700 dark:text-slate-300">Pesan Anda</label>
                  <textarea 
                    name="message"
                    value={formData.message}
                    onChange={handleChange}
                    rows={4} 
                    className="w-full p-4 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-stone-500 transition-all"
                    placeholder="Tuliskan pesan atau pertanyaan Anda di sini..."
                  ></textarea>
                </div>

                <Button 
                  type="submit"
                  disabled={loading}
                  className="w-full md:w-auto px-10 h-12 bg-stone-900 dark:bg-amber-600 hover:bg-stone-800 dark:hover:bg-amber-700 disabled:bg-stone-600 text-white rounded-xl flex items-center gap-2 group transition-all"
                >
                  {loading ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      Mengirim...
                    </>
                  ) : (
                    <>
                      Kirim Pesan
                      <Send className="w-4 h-4 group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform" />
                    </>
                  )}
                </Button>
              </form>
            </motion.div>

          </div>

          {/* Bottom Support Badge */}
          <motion.div 
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            className="mt-12 flex flex-wrap justify-center gap-8 opacity-60 text-slate-900 dark:text-slate-300"
          >
            <div className="flex items-center gap-2">
              <Clock className="w-5 h-5" />
              <span className="text-sm font-medium">Response time: &lt; 24 Hours</span>
            </div>
            <div className="flex items-center gap-2">
              <MessageSquare className="w-5 h-5" />
              <span className="text-sm font-medium">24/7 Priority Support</span>
            </div>
          </motion.div>

          {/* Map Section */}
          <motion.div 
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="mt-20"
          >
            <div className="bg-white dark:bg-slate-900 rounded-[2.5rem] p-4 shadow-2xl shadow-slate-200 dark:shadow-none border border-slate-100 dark:border-slate-800 overflow-hidden">
              <div 
                id="map" 
                className="w-full h-[400px] rounded-[2rem] z-10"
              />
              <div className="p-6 flex flex-col md:flex-row items-center justify-between gap-6">
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 bg-blue-50 dark:bg-blue-950 rounded-2xl flex items-center justify-center shrink-0">
                    <MapPin className="w-6 h-6 text-blue-600 dark:text-blue-400" />
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-slate-900 dark:text-white">Lokasi Kost</h3>
                    <p className="text-slate-500 dark:text-slate-400 text-sm">Pondok Alam, Jl. Sigura - Gura No.21 Blok A2, Malang</p>
                  </div>
                </div>
                <Button 
                  asChild
                  className="bg-stone-900 hover:bg-stone-800 dark:bg-amber-600 dark:hover:bg-amber-700 text-white px-8 h-12 rounded-xl flex items-center gap-2 shadow-lg hover:shadow-xl transition-all w-full md:w-auto"
                >
                  <a 
                    href="https://maps.google.com/?cid=8216809800441744550&g_mp=CiVnb29nbGUubWFwcy5wbGFjZXMudjEuUGxhY2VzLkdldFBsYWNl" 
                    target="_blank" 
                    rel="noopener noreferrer"
                  >
                    <Navigation className="w-4 h-4" />
                    Petunjuk Arah (Google Maps)
                  </a>
                </Button>
              </div>
            </div>
          </motion.div>

        </div>
      </section>
  );
}