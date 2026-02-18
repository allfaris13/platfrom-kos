import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogClose } from '@/app/components/ui/dialog';
import { Button } from '@/app/components/ui/button';
import { Input } from '@/app/components/ui/input';
import { Label } from '@/app/components/ui/label';
import { motion } from 'framer-motion';
import { Send, CheckCircle, MessageCircle } from 'lucide-react';
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from '@/app/components/ui/select';

interface ContactFormData {
  name: string;
  email: string;
  phone: string;
  subject: string;
  message: string;
}

interface ContactUsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function ContactUsModal({ isOpen, onClose }: ContactUsModalProps) {
  const [formData, setFormData] = useState<ContactFormData>({
    name: '',
    email: '',
    phone: '',
    subject: '',
    message: '',
  });
  const [submitted, setSubmitted] = useState(false);
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

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateEmail(formData.email)) {
      setEmailError('Please enter a valid email address');
      return;
    }

    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      setSubmitted(true);
      setFormData({ name: '', email: '', phone: '', subject: '', message: '' });
      setTimeout(() => {
        setSubmitted(false);
        onClose();
      }, 2000);
    }, 1500);
  };

  const handleClose = () => {
    setFormData({ name: '', email: '', phone: '', subject: '', message: '' });
    setSubmitted(false);
    setEmailError('');
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[500px] bg-white border-0 shadow-2xl rounded-2xl p-0 overflow-hidden">
        <div className="p-8">
            <DialogHeader className="mb-6">
                <DialogTitle className="text-2xl font-bold text-slate-900">Hubungi Kami</DialogTitle>
                <DialogClose className="absolute right-4 top-4 text-slate-500 hover:text-slate-700" />
            </DialogHeader>

            <div className="">
            {submitted ? (
                <motion.div
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.5 }}
                className="p-6 bg-gradient-to-br from-emerald-50 to-emerald-100 rounded-xl border-2 border-emerald-200 text-center"
                >
                <motion.div
                    className="w-16 h-16 bg-emerald-500 rounded-full flex items-center justify-center mx-auto mb-4"
                    whileHover={{ scale: 1.1, rotate: 10 }}
                >
                    <CheckCircle className="w-8 h-8 text-white" />
                </motion.div>
                <h3 className="text-2xl font-bold text-emerald-900 mb-2">Pesan Terkirim!</h3>
                <p className="text-emerald-800">Terima kasih telah menghubungi kami. Kami akan merespons dalam 2-4 jam.</p>
                </motion.div>
            ) : (
                <form onSubmit={handleSubmit} className="space-y-5">
                {/* Name */}
                <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3 }}
                >
                    <Label htmlFor="name" className="font-semibold text-slate-700 mb-2 block text-sm">Nama Lengkap *</Label>
                    <Input
                    id="name"
                    name="name"
                    type="text"
                    placeholder="Budi Setiawan"
                    value={formData.name}
                    onChange={handleChange}
                    required
                    className="h-11 border-slate-200 focus:border-stone-400 focus:ring-0 bg-slate-50 rounded-xl transition-all"
                    />
                </motion.div>

                {/* Email & Phone */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.3, delay: 0.05 }}
                    >
                        <Label htmlFor="email" className="font-semibold text-slate-700 mb-2 block text-sm">Email *</Label>
                        <Input
                        id="email"
                        name="email"
                        type="email"
                        placeholder="budi@email.com"
                        value={formData.email}
                        onChange={handleChange}
                        required
                        className={`h-11 border-slate-200 focus:border-stone-400 focus:ring-0 bg-slate-50 rounded-xl transition-all ${emailError ? 'border-red-500' : ''}`}
                        />
                    </motion.div>
                    <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.3, delay: 0.1 }}
                    >
                        <Label htmlFor="phone" className="font-semibold text-slate-700 mb-2 block text-sm">WhatsApp</Label>
                        <Input
                        id="phone"
                        name="phone"
                        type="tel"
                        placeholder="+62 812..."
                        value={formData.phone}
                        onChange={handleChange}
                        className="h-11 border-slate-200 focus:border-stone-400 focus:ring-0 bg-slate-50 rounded-xl transition-all"
                        />
                    </motion.div>
                </div>

                {/* Subject */}
                <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3, delay: 0.15 }}
                >
                    <Label htmlFor="subject" className="font-semibold text-slate-700 mb-2 block text-sm">Tipe Pertanyaan *</Label>
                    <Select
                    value={formData.subject}
                    onValueChange={(val) => setFormData(prev => ({ ...prev, subject: val }))}
                    >
                    <SelectTrigger className="w-full h-11 bg-slate-50 border-slate-200 rounded-xl focus:border-stone-400">
                        <SelectValue placeholder="Pilih tipe pertanyaan..." />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="availability">Tanya Ketersediaan Kamar</SelectItem>
                        <SelectItem value="survey">Jadwal Survey Lokasi</SelectItem>
                        <SelectItem value="complaint">Komplain Fasilitas</SelectItem>
                        <SelectItem value="other">Lainnya</SelectItem>
                    </SelectContent>
                    </Select>
                </motion.div>

                {/* Message */}
                <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3, delay: 0.2 }}
                >
                    <Label htmlFor="message" className="font-semibold text-slate-700 mb-2 block text-sm">Pesan *</Label>
                    <textarea
                    id="message"
                    name="message"
                    placeholder="Tuliskan pesan atau pertanyaan Anda..."
                    value={formData.message}
                    onChange={handleChange}
                    required
                    rows={4}
                    className="w-full px-4 py-3 border border-slate-200 rounded-xl bg-slate-50 focus:border-stone-400 font-medium text-slate-700 resize-none transition-all outline-none text-sm placeholder:text-muted-foreground"
                    />
                </motion.div>

                {/* Submit Button */}
                <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3, delay: 0.25 }}
                    className="pt-2"
                >
                    <Button
                    type="submit"
                    disabled={loading}
                    className="w-full bg-slate-900 hover:bg-slate-800 text-white font-bold py-6 rounded-xl shadow-lg hover:shadow-xl transition-all flex items-center justify-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed border-0"
                    >
                    {loading ? (
                        <>
                        <motion.div
                            animate={{ rotate: 360 }}
                            transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                        >
                            <MessageCircle className="w-5 h-5" />
                        </motion.div>
                        Mengirim...
                        </>
                    ) : (
                        <>
                        <Send className="w-5 h-5" />
                        Kirim Pesan
                        </>
                    )}
                    </Button>
                </motion.div>
                </form>
            )}
            </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}