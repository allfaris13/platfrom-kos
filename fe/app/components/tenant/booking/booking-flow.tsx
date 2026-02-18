import { useState, useEffect } from "react";
import { Card } from "@/app/components/ui/card";
import { Button } from "@/app/components/ui/button";
import { Input } from "@/app/components/ui/input";
import { Label } from "@/app/components/ui/label";
import { Progress } from "@/app/components/ui/progress";
import {
  ArrowLeft,
  Check,
  CreditCard,
  DollarSign,
  CheckCircle2,
  Loader2,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/app/components/ui/select";
import { api, Room } from "@/app/services/api";
import { toast } from "sonner";

declare global {
  interface Window {
    snap: {
      pay: (token: string) => void;
    };
  }
}

interface BookingFlowProps {
  roomId: string;
  onBack: () => void;
  initialData?: {
    moveInDate?: string;
    duration?: string;
    guests?: string;
  };
}

// Fallback data
const roomDetails: { [key: string]: Partial<Room> } = {
  "1": {
    nomor_kamar: "Premium Suite 201",
    harga_per_bulan: 1500000,
    tipe_kamar: "Luxury",
  },
  "2": {
    nomor_kamar: "Deluxe Room 102",
    harga_per_bulan: 1200000,
    tipe_kamar: "Deluxe",
  },
  "3": {
    nomor_kamar: "Standard Room 005",
    harga_per_bulan: 850000,
    tipe_kamar: "Standard",
  }
};

export function BookingFlow({ roomId, onBack, initialData }: BookingFlowProps) {
  const [step, setStep] = useState(1);
  const [bookingComplete, setBookingComplete] = useState(false);
  const [bookingId, setBookingId] = useState("");
  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    phone: "",
    moveInDate: initialData?.moveInDate || "",
    duration: initialData?.duration || "6", // Default fallback if not provided
    guests: initialData?.guests || "1",
    paymentType: "full", // 'full' atau 'dp' (down payment)
    paymentMethod: "transfer", // 'transfer' | 'cash'
  });
  const [proofFile, setProofFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);

  const steps = [
    { number: 1, title: "Personal Info", description: "Your details" },
    { number: 2, title: "Booking Details", description: "Move-in & duration" },
    { number: 3, title: "Payment", description: "Confirm & Pay" },
  ];

  const handleInputChange = (field: string, value: string) => {
    setFormData({ ...formData, [field]: value });
  };

  const [room, setRoom] = useState<Room | Partial<Room> | null>(null);

  useEffect(() => {
    const fetchRoom = async () => {
      try {
        setLoading(true);
        console.log(`Fetching room with ID: ${roomId}`);
        
        // Try to fetch from API first
        let apiData: Room | null = null;
        try {
            // Check if roomId looks like a real ID or mock
            if (!roomId.toString().startsWith("mock-")) {
                 apiData = await api.getRoomById(roomId);
            }
        } catch (e) {
            console.warn("API fetch failed, checking fallbacks...", e);
        }

        if (apiData) {
          console.log("Room fetched from API:", apiData);
          setRoom(apiData);
        } else {
            // Fallback to mock data ONLY if definitely mock or explicit fallback needed
            console.log("Using fallback/mock data");
            const cleanId = roomId.toString().replace("mock-", "");
            
            // Try to find exact match in mock data
            let mockData = roomDetails[cleanId];
            
            if (!mockData) {
                 mockData = {
                    nomor_kamar: `Room ${roomId}`,
                    harga_per_bulan: 0, 
                    tipe_kamar: "Unknown"
                 };
            }
            setRoom(mockData);
        }
      } catch (error) {
        console.error("Critical error in fetchRoom:", error);
        toast.error("Gagal memuat data kamar. Silakan coba lagi.");
      } finally {
        setLoading(false);
      }
    };

    if (roomId) {
      fetchRoom();
    }
  }, [roomId]);

  // Robust price calculation: check multiple fields and ensure number
  const pricePerMonth = room 
    ? (Number(room.harga_per_bulan) || 0) 
    : 0;

  useEffect(() => {
    if (room) {
        console.log("Current Room State:", room);
        console.log("Calculated Price:", pricePerMonth);
    }
  }, [room, pricePerMonth]);

  const nextStep = async () => {
    if (step < 3) {
      setStep(step + 1);
    } else {
       // Step 3 Validation: Must have proof file for Manual Transfer ONLY
       if (formData.paymentMethod === 'transfer' && !proofFile) {
           toast.error("Please upload payment proof before completing booking.");
           return;
       }

      setLoading(true);
      try {
        const fd = new FormData();
        fd.append('kamar_id', roomId);
        fd.append('tanggal_mulai', formData.moveInDate);
        fd.append('durasi_sewa', formData.duration);
        fd.append('payment_type', formData.paymentType);
        fd.append('payment_method', formData.paymentMethod);
        
        if (formData.paymentMethod === 'transfer' && proofFile) {
          fd.append('proof', proofFile);
        }

        // Atomic Booking Creation
        const booking = await api.createBookingWithProof(fd);

        // 4. Success
        setBookingId(`#BK${booking.id}`);
        setBookingComplete(true);
        setLoading(false);
        toast.success("Booking berhasil dibuat!", {
          description: formData.paymentMethod === 'transfer' 
            ? "Bukti pembayaran berhasil diupload. Menunggu konfirmasi admin."
            : "Silakan lakukan pembayaran tunai di lokasi.",
        });

      } catch (err: unknown) {
        setLoading(false);
        console.error(err);
        const message = err instanceof Error ? err.message : "Gagal membuat reservasi.";
        toast.error(message);
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
            <h1 className="text-3xl font-bold text-foreground mb-4">
              Booking Confirmed!
            </h1>
            <p className="text-lg text-muted-foreground mb-8">
              Terima kasih! Silakan selesaikan pembayaran Anda ke rekening berikut:
            </p>
            
            <div className="bg-primary/5 p-6 rounded-lg mb-8 border border-primary/20">
                <h3 className="font-bold text-xl mb-2">BCA 1234567890</h3>
                <p className="text-muted-foreground">a.n. Koskosan Official</p>
                <div className="mt-4 p-3 bg-background rounded border border-border text-sm">
                    Total: <span className="font-bold">Check details above</span>
                </div>
            </div>

            <p className="text-sm text-muted-foreground mb-6">
                Setelah transfer, silakan upload bukti pembayaran di halaman &quot;My Bookings&quot;.
            </p>

            <div className="space-y-3 p-6 bg-muted/50 rounded-lg mb-8 border border-border text-left">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Booking ID:</span>
                <span className="font-medium text-foreground">{bookingId}</span>
              </div>
               {/* ... other details ... */}
            </div>
            
            <div className="flex flex-col gap-3">
                <Button
                  onClick={() => window.location.href = "/tenant/bookings"}
                  className="w-full bg-primary hover:bg-primary/90 text-primary-foreground"
                >
                  Go to My Bookings
                </Button>
                <Button
                  variant="outline"
                  onClick={onBack}
                  className="w-full"
                >
                  Back to Homepage
                </Button>
            </div>
          </Card>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Back Button */}
        <Button
          variant="ghost"
          onClick={onBack}
          className="mb-6 hover:bg-muted"
        >
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
                <div
                  key={s.number}
                  className="relative z-10 flex flex-col items-center flex-1"
                >
                  <div
                    className={`w-12 h-12 rounded-full flex items-center justify-center font-bold transition-all border-4 border-background ${
                      isActive || isCompleted
                        ? "bg-primary text-primary-foreground"
                        : "bg-muted text-muted-foreground"
                    }`}
                  >
                    {isCompleted ? <Check className="w-6 h-6" /> : s.number}
                  </div>
                  <div className="mt-3 text-center">
                    <p
                      className={`text-sm font-semibold ${
                        isActive ? "text-primary" : "text-foreground"
                      }`}
                    >
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
                    <h2 className="text-2xl font-bold text-foreground mb-1">
                      Personal Information
                    </h2>
                    <p className="text-muted-foreground text-sm">
                      Tell us about yourself
                    </p>
                  </div>

                  <div className="space-y-4">
                    <div className="space-y-2">
                       <Label htmlFor="fullName">Full Name *</Label>
                      <Input
                        id="fullName"
                        placeholder="John Doe"
                        value={formData.fullName}
                        onChange={(e) =>
                          handleInputChange("fullName", e.target.value)
                        }
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
                          onChange={(e) =>
                            handleInputChange("email", e.target.value)
                          }
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="phone">Phone Number *</Label>
                        <Input
                          id="phone"
                          type="tel"
                          placeholder="+62 812 3456 7890"
                          value={formData.phone}
                          onChange={(e) =>
                            handleInputChange("phone", e.target.value)
                          }
                        />
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {step === 2 && (
                <div className="space-y-6">
                  <div>
                    <h2 className="text-2xl font-bold text-foreground mb-1">
                      Booking Details
                    </h2>
                    <p className="text-muted-foreground text-sm">
                      Choose your move-in date and duration
                    </p>
                  </div>

                  <div className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="moveInDate">
                        Preferred Move-in Date *
                      </Label>
                      <Input
                        id="moveInDate"
                        type="date"
                        value={formData.moveInDate}
                        onChange={(e) =>
                          handleInputChange("moveInDate", e.target.value)
                        }
                      />
                    </div>

                    {/* Guests Input */}
                     <div className="grid gap-2">
                  <Label htmlFor="guests">Number of Guests</Label>
                  <Select
                    value={formData.guests}
                    onValueChange={(value) => handleInputChange("guests", value)}
                  >
                    <SelectTrigger id="guests" className="bg-background border-input">
                      <SelectValue placeholder="Select guests" />
                    </SelectTrigger>
                    <SelectContent>
                      {Array.from({ length: room?.capacity || 1 }, (_, i) => i + 1).map((g) => (
                        <SelectItem key={g} value={String(g)}>
                          {g} Guest{g > 1 ? "s" : ""}
                        </SelectItem>
                      ))}
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
                          <span>Rp {pricePerMonth.toLocaleString("id-ID")}</span>
                        </div>
                        <div className="font-bold pt-2 border-t border-blue-200 dark:border-blue-800 flex justify-between text-base">
                          <span>Total due</span>
                          <span>Rp {(pricePerMonth * parseInt(formData.duration)).toLocaleString("id-ID")}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {step === 3 && (
                <div className="space-y-6">
                  <div>
                    <h2 className="text-2xl font-bold text-foreground mb-1">
                      Payment
                    </h2>
                    <p className="text-muted-foreground text-sm">
                      Select payment type and method to complete your booking
                    </p>
                  </div>

                  <div className="space-y-5">
                    {/* Payment Type Selection */}
                    <div>
                      <Label className="text-base font-semibold mb-3 block">
                        Payment Type
                      </Label>
                      <div className="grid grid-cols-2 gap-3">
                        {/* Full Payment Option */}
                        <motion.div
                          whileHover={{ scale: 1.02 }}
                          whileTap={{ scale: 0.98 }}
                          onClick={() =>
                            handleInputChange("paymentType", "full")
                          }
                          className={`p-4 border-2 rounded-xl cursor-pointer transition-all ${
                            formData.paymentType === "full"
                              ? "border-primary bg-primary/5"
                              : "border-border bg-muted/50 hover:border-primary/50"
                          }`}
                        >
                          <div className="flex items-start gap-3">
                            <div
                              className={`w-5 h-5 rounded-full border-2 mt-1 flex items-center justify-center ${
                                formData.paymentType === "full"
                                  ? "border-primary bg-primary"
                                  : "border-muted-foreground"
                              }`}
                            >
                              {formData.paymentType === "full" && (
                                <Check className="w-3 h-3 text-white" />
                              )}
                            </div>
                            <div>
                              <p className="font-semibold text-sm">
                                Full Payment
                              </p>
                              <p className="text-xs text-muted-foreground">
                                Bayar seluruh harga sekarang
                              </p>
                            </div>
                          </div>
                        </motion.div>

                        {/* DP Payment Option */}
                        <motion.div
                          whileHover={{ scale: 1.02 }}
                          whileTap={{ scale: 0.98 }}
                          onClick={() => handleInputChange("paymentType", "dp")}
                          className={`p-4 border-2 rounded-xl cursor-pointer transition-all ${
                            formData.paymentType === "dp"
                              ? "border-primary bg-primary/5"
                              : "border-border bg-muted/50 hover:border-primary/50"
                          }`}
                        >
                          <div className="flex items-start gap-3">
                            <div
                              className={`w-5 h-5 rounded-full border-2 mt-1 flex items-center justify-center ${
                                formData.paymentType === "dp"
                                  ? "border-primary bg-primary"
                                  : "border-muted-foreground"
                              }`}
                            >
                              {formData.paymentType === "dp" && (
                                <Check className="w-3 h-3 text-white" />
                              )}
                            </div>
                            <div>
                              <p className="font-semibold text-sm">
                                Down Payment (30%)
                              </p>
                              <p className="text-xs text-muted-foreground">
                                Cicil sisa 70% bulan depan
                              </p>
                            </div>
                          </div>
                        </motion.div>
                      </div>
                    </div>

                    {/* Manual Payment Info */}
                    <div className="p-4 bg-blue-50 dark:bg-blue-950/30 rounded-lg border border-blue-200 dark:border-blue-900">
                      <h4 className="font-semibold text-blue-900 dark:text-blue-200 mb-2 flex items-center gap-2">
                         <CreditCard className="w-4 h-4" /> Bank Transfer Manual
                      </h4>
                      
                      {/* Payment Method Selection */}
                      <div className="flex gap-4 mb-4">
                        <div 
                          className={`flex-1 p-4 border rounded-lg cursor-pointer transition-all ${
                            formData.paymentMethod === 'transfer' 
                              ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20' 
                              : 'border-gray-200 dark:border-gray-700 hover:border-blue-300'
                          }`}
                          onClick={() => handleInputChange('paymentMethod', 'transfer')}
                        >
                          <div className="flex items-center gap-2 mb-2">
                             <CreditCard className={`w-5 h-5 ${formData.paymentMethod === 'transfer' ? 'text-blue-500' : 'text-gray-500'}`} />
                             <span className="font-semibold">Transfer Bank</span>
                          </div>
                          <p className="text-xs text-muted-foreground">Transfer ke rekening BCA dan upload bukti.</p>
                        </div>

                        <div 
                          className={`flex-1 p-4 border rounded-lg cursor-pointer transition-all ${
                            formData.paymentMethod === 'cash' 
                              ? 'border-green-500 bg-green-50 dark:bg-green-900/20' 
                              : 'border-gray-200 dark:border-gray-700 hover:border-green-300'
                          }`}
                          onClick={() => handleInputChange('paymentMethod', 'cash')}
                        >
                          <div className="flex items-center gap-2 mb-2">
                             <DollarSign className={`w-5 h-5 ${formData.paymentMethod === 'cash' ? 'text-green-500' : 'text-gray-500'}`} />
                             <span className="font-semibold">Bayar Tunai</span>
                          </div>
                          <p className="text-xs text-muted-foreground">Bayar tunai saat check-in di lokasi kos.</p>
                        </div>
                      </div>

                      {formData.paymentMethod === 'transfer' ? (
                          <>
                            <p className="text-sm text-blue-800 dark:text-blue-300 mb-4">
                                Pembayaran dilakukan via transfer bank manual ke:
                                <br />
                                <strong>BCA 1234567890 a.n. Koskosan</strong>
                            </p>
                            
                            {/* File Upload Input */}
                            <div className="bg-white dark:bg-slate-900 p-4 rounded-lg border border-blue-100 dark:border-blue-800">
                                <Label className="mb-2 block text-sm font-semibold">Upload Bukti Transfer *</Label>
                                <Input 
                                    type="file" 
                                    accept="image/*"
                                    onChange={(e) => {
                                        if (e.target.files && e.target.files[0]) {
                                            setProofFile(e.target.files[0]);
                                        }
                                    }}
                                />
                                <p className="text-xs text-muted-foreground mt-2">
                                    Format: JPG, PNG, PDF. Max 5MB. Wajib diupload sebelum menyelesaikan pesanan.
                                </p>
                            </div>
                          </>
                      ) : (
                          <div className="bg-green-50 dark:bg-green-900/10 p-4 rounded-lg border border-green-100 dark:border-green-900">
                              <p className="text-sm text-green-800 dark:text-green-300">
                                  Silakan lakukan pembayaran tunai kepada pengelola kos saat Anda tiba di lokasi.
                                  <br/>
                                  Harap siapkan uang pas jika memungkinkan.
                              </p>
                          </div>
                      )}
                    </div>

                    {/* Order Summary */}
                    <div className="p-4 bg-muted/50 rounded-lg border border-border space-y-3">
                      <h4 className="font-semibold text-sm text-foreground uppercase tracking-wider">
                        Order Summary
                      </h4>
                      <div className="space-y-2 text-sm">
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">
                            Monthly Rent
                          </span>
                          <span className="font-medium">Rp {pricePerMonth.toLocaleString("id-ID")}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">
                            Duration
                          </span>
                          <span className="font-medium">
                            {formData.duration} months
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">
                            Total Rent
                          </span>
                          <span className="font-medium">
                            Rp {(pricePerMonth * parseInt(formData.duration)).toLocaleString("id-ID")}
                          </span>
                        </div>

                         {formData.paymentType === "dp" && (
                          <>
                            <div className="pt-2 border-t border-border">
                              <div className="flex justify-between">
                                <span className="text-muted-foreground">
                                  Down Payment (30%)
                                </span>
                                <span className="font-semibold text-orange-600">
                                  Rp {(pricePerMonth * parseInt(formData.duration) * 0.3).toLocaleString("id-ID")}
                                </span>
                              </div>
                              <p className="text-xs text-muted-foreground mt-1">
                                Bayar hari ini
                              </p>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-muted-foreground">
                                Remaining (70%)
                              </span>
                              <span className="font-semibold text-blue-600">
                                Rp {(pricePerMonth * parseInt(formData.duration) * 0.7).toLocaleString("id-ID")}
                              </span>
                            </div>
                            <p className="text-xs text-muted-foreground">
                              Cicilan 1 bulan setelah check-in
                            </p>
                          </>
                        )}

                        <div
                          className={`pt-2 border-t border-border flex justify-between ${
                            formData.paymentType === "dp"
                              ? "text-orange-600"
                              : "text-primary"
                          }`}
                        >
                          <span className="font-bold">Amount to Pay Now</span>
                          <span className="font-bold text-lg">
                             {formData.paymentType === "dp"
                              ? `Rp ${(pricePerMonth * parseInt(formData.duration) * 0.3).toLocaleString("id-ID")}`
                              : `Rp ${(pricePerMonth * parseInt(formData.duration)).toLocaleString("id-ID")}`
                             }
                          </span>
                        </div>
                      </div>
                    </div>

                    {formData.paymentType === "dp" && (
                      <div className="p-4 bg-blue-50 dark:bg-blue-950/30 rounded-lg border border-blue-200 dark:border-blue-900">
                        <p className="text-sm text-blue-900 dark:text-blue-200">
                          <strong>📅 Reminder:</strong> Sisa pembayaran (70%)
                          akan jatuh tempo 1 bulan setelah tanggal check-in.
                          Anda akan menerima notifikasi pembayaran.
                        </p>
                      </div>
                    )}
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
                  ) : step === 3 ? (
                    "Pay Now"
                  ) : (
                    "Next Step"
                  )}
                </Button>
              </div>
            </Card>
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
}
