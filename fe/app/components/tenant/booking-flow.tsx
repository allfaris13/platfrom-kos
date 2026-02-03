import { useState } from 'react';
import { Card } from '@/app/components/ui/card';
import { Button } from '@/app/components/ui/button';
import { Input } from '@/app/components/ui/input';
import { Label } from '@/app/components/ui/label';
import { Progress } from '@/app/components/ui/progress';
import { 
  ArrowLeft, 
  Check, 
  CreditCard, 
  Upload,
  CheckCircle2
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from '@/app/components/ui/select';
import { api } from '@/app/services/api';
import { toast } from 'sonner';

declare global {
  interface Window {
    snap: any;
  }
}

interface BookingFlowProps {
  roomId: string;
  onBack: () => void;
}

export function BookingFlow({ onBack }: BookingFlowProps) {
  const [step, setStep] = useState(1);
  const [bookingComplete, setBookingComplete] = useState(false);
  const [bookingId, setBookingId] = useState('');
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    phone: '',
    moveInDate: '',
    duration: '6',
    paymentMethod: 'midtrans',
  });
  const [loading, setLoading] = useState(false);

  const steps = [
    { number: 1, title: 'Personal Info', description: 'Your details' },
    { number: 2, title: 'Booking Details', description: 'Move-in & duration' },
    { number: 3, title: 'Payment', description: 'Complete payment' },
  ];

  const handleInputChange = (field: string, value: string) => {
    setFormData({ ...formData, [field]: value });
  };

  const nextStep = async () => {
    if (step < 3) {
      setStep(step + 1);
    } else {
      setLoading(true);
      try {
        // 1. Create Booking Record
        const booking = await api.createBooking({
            kamar_id: parseInt(roomId),
            tanggal_mulai: formData.moveInDate,
            durasi_sewa: parseInt(formData.duration)
        });

        // 2. Create Snap Token
        const snapData = await api.createSnapToken(booking.id);
        
        // 3. Trigger Midtrans Snap Popup
        window.snap.pay(snapData.token, {
          onSuccess: function(result: any) {
            console.log('Payment Success:', result);
            setBookingId(`#BK${booking.id}`);
            setBookingComplete(true);
            setLoading(false);
          },
          onPending: function(result: any) {
            console.log('Payment Pending:', result);
            toast.info('Pembayaran sedang diproses. Silakan selesaikan pembayaran Anda.');
            setBookingId(`#BK${booking.id}`);
            setBookingComplete(true);
            setLoading(false);
          },
          onError: function(result: any) {
            console.error('Payment Error:', result);
            toast.error('Gagal memproses pembayaran. Silakan coba lagi.');
            setLoading(false);
          },
          onClose: function() {
            setLoading(false);
          }
        });

      } catch (err: any) {
        setLoading(false);
        toast.error(err.message || 'Gagal membuat reservasi.');
      }
    }
  };

  const prevStep = () => {
    if (step > 1) {
      setStep(step - 1);
    }
  };

  const progress = (step / 3) * 100;

  if (bookingComplete) {
    return (
      <div className="min-h-screen bg-background py-12 flex items-center justify-center">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5 }}
          className="max-w-2xl w-full mx-4"
        >
          <Card className="p-12 text-center bg-card border-border shadow-lg">
            <div className="w-20 h-20 bg-emerald-100 dark:bg-emerald-900 rounded-full flex items-center justify-center mx-auto mb-6">
              <CheckCircle2 className="w-12 h-12 text-emerald-600 dark:text-emerald-400" />
            </div>
            <h1 className="text-3xl font-bold text-foreground mb-4">Booking Confirmed!</h1>
            <p className="text-lg text-muted-foreground mb-8">
              Your booking request has been submitted successfully. We&apos;ll review your payment and send a confirmation email within 24 hours.
            </p>
            <div className="space-y-3 p-6 bg-muted/50 rounded-lg mb-8 border border-border">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Booking ID:</span>
                <span className="font-medium text-foreground">{bookingId}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Name:</span>
                <span className="font-medium text-foreground">{formData.fullName}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Email:</span>
                <span className="font-medium text-foreground">{formData.email}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Move-in Date:</span>
                <span className="font-medium text-foreground">{formData.moveInDate}</span>
              </div>
            </div>
            <Button onClick={onBack} className="w-full bg-primary hover:bg-primary/90 text-primary-foreground">
              Back to Homepage
            </Button>
          </Card>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Back Button */}
        <Button variant="ghost" onClick={onBack} className="mb-6 hover:bg-muted">
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back
        </Button>

        {/* Progress Stepper Section */}
        <Card className="p-8 mb-8 bg-card border-border shadow-sm">
          <div className="relative flex justify-between items-start max-w-2xl mx-auto">
            {/* Background Line Connector */}
            <div className="absolute top-6 left-0 w-full h-0.5 bg-muted z-0" />
            
            {/* Steps Map */}
            {steps.map((s) => {
              const isCompleted = step > s.number;
              const isActive = step === s.number;

              return (
                <div key={s.number} className="relative z-10 flex flex-col items-center flex-1">
                  <div
                    className={`w-12 h-12 rounded-full flex items-center justify-center font-bold transition-all border-4 border-background ${
                      isActive || isCompleted
                        ? 'bg-primary text-primary-foreground'
                        : 'bg-muted text-muted-foreground'
                    }`}
                  >
                    {isCompleted ? <Check className="w-6 h-6" /> : s.number}
                  </div>
                  <div className="mt-3 text-center">
                    <p className={`text-sm font-semibold ${isActive ? 'text-primary' : 'text-foreground'}`}>
                      {s.title}
                    </p>
                    <p className="text-xs text-muted-foreground max-w-[100px] mx-auto hidden sm:block">
                      {s.description}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
          <div className="mt-8">
            <Progress value={progress} className="h-1.5" />
          </div>
        </Card>

        {/* Step Content */}
        <AnimatePresence mode="wait">
          <motion.div
            key={step}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.3 }}
          >
            <Card className="p-8 bg-card border-border shadow-md">
              {step === 1 && (
                <div className="space-y-6">
                  <div>
                    <h2 className="text-2xl font-bold text-foreground mb-1">Personal Information</h2>
                    <p className="text-muted-foreground text-sm">Tell us about yourself</p>
                  </div>

                  <div className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="fullName">Full Name *</Label>
                      <Input
                        id="fullName"
                        placeholder="John Doe"
                        value={formData.fullName}
                        onChange={(e) => handleInputChange('fullName', e.target.value)}
                      />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="email">Email Address *</Label>
                        <Input
                          id="email"
                          type="email"
                          placeholder="john@example.com"
                          value={formData.email}
                          onChange={(e) => handleInputChange('email', e.target.value)}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="phone">Phone Number *</Label>
                        <Input
                          id="phone"
                          type="tel"
                          placeholder="+1 (555) 123-4567"
                          value={formData.phone}
                          onChange={(e) => handleInputChange('phone', e.target.value)}
                        />
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {step === 2 && (
                <div className="space-y-6">
                  <div>
                    <h2 className="text-2xl font-bold text-foreground mb-1">Booking Details</h2>
                    <p className="text-muted-foreground text-sm">Choose your move-in date and duration</p>
                  </div>

                  <div className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="moveInDate">Preferred Move-in Date *</Label>
                      <Input
                        id="moveInDate"
                        type="date"
                        value={formData.moveInDate}
                        onChange={(e) => handleInputChange('moveInDate', e.target.value)}
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="duration">Rental Duration *</Label>
                      <Select 
                        value={formData.duration}
                        onValueChange={(val) => handleInputChange('duration', val)}
                      >
                        <SelectTrigger className="w-full">
                            <SelectValue placeholder="Select duration" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="3">3 months</SelectItem>
                          <SelectItem value="6">6 months</SelectItem>
                          <SelectItem value="12">12 months</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="p-4 bg-blue-50 dark:bg-blue-950/30 rounded-lg border border-blue-100 dark:border-blue-900">
                      <h4 className="font-semibold text-blue-900 dark:text-blue-200 mb-2 flex items-center gap-2 text-sm">
                        <CheckCircle2 className="w-4 h-4" /> Booking Summary
                      </h4>
                      <div className="space-y-1.5 text-sm text-blue-800 dark:text-blue-300">
                        <div className="flex justify-between">
                          <span>Duration</span>
                          <span>{formData.duration} months</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Monthly rent</span>
                          <span>$1,200</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Security deposit</span>
                          <span>$1,200</span>
                        </div>
                        <div className="font-bold pt-2 border-t border-blue-200 dark:border-blue-800 flex justify-between text-base">
                          <span>Total due</span>
                          <span>$2,400</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {step === 3 && (
                <div className="space-y-6">
                  <div>
                    <h2 className="text-2xl font-bold text-foreground mb-1">Payment</h2>
                    <p className="text-muted-foreground text-sm">Select payment method and complete your booking</p>
                  </div>

                  <div className="space-y-5">
                    <div className="p-6 bg-primary/5 border-2 border-primary rounded-xl flex items-center gap-4">
                      <div className="p-3 bg-primary text-white rounded-full">
                        <CreditCard className="w-6 h-6" />
                      </div>
                      <div>
                        <p className="font-bold text-lg">Secure Online Payment</p>
                        <p className="text-sm text-muted-foreground">Transfer Bank, GoPay, ShopeePay, Kartu Kredit, dll.</p>
                      </div>
                      <div className="ml-auto">
                        <CheckCircle2 className="w-6 h-6 text-primary" />
                      </div>
                    </div>

                    <div className="p-4 bg-muted/50 rounded-lg border border-border space-y-2">
                        <h4 className="font-semibold text-sm text-foreground uppercase tracking-wider">Order Summary</h4>
                        <div className="grid grid-cols-2 gap-y-1 text-sm">
                          <span className="text-muted-foreground">Monthly Rent</span>
                          <span className="font-medium text-right">$1,200</span>
                          <span className="text-muted-foreground">Duration</span>
                          <span className="font-medium text-right">{formData.duration} months</span>
                          <div className="pt-2 mt-2 border-t border-border col-span-2 flex justify-between">
                            <span className="font-bold text-base">Total Payment</span>
                            <span className="font-bold text-base text-primary">${(1200 * parseInt(formData.duration)).toLocaleString()}</span>
                          </div>
                        </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Navigation Buttons */}
              <div className="flex gap-4 mt-10 pt-6 border-t border-border">
                <Button
                  variant="outline"
                  onClick={prevStep}
                  disabled={step === 1}
                  className="flex-1 py-6 rounded-xl"
                >
                  Previous
                </Button>
                <Button
                  onClick={nextStep}
                  disabled={loading}
                  className="flex-1 bg-primary hover:bg-primary/90 text-primary-foreground py-6 rounded-xl shadow-md"
                >
                  {loading ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : step === 3 ? 'Pay Now' : 'Next Step'}
                </Button>
              </div>
            </Card>
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
}