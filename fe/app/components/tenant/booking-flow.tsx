import { useState } from "react";
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
  Upload,
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
import { api } from "@/app/services/api";
import { toast } from "sonner";

declare global {
  interface Window {
    snap: any;
  }
}

interface BookingFlowProps {
  roomId: string;
  onBack: () => void;
}

export function BookingFlow({ roomId, onBack }: BookingFlowProps) {
  const [step, setStep] = useState(1);
  const [bookingComplete, setBookingComplete] = useState(false);
  const [bookingId, setBookingId] = useState("");
  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    phone: "",
    moveInDate: "",
    duration: "6",
    paymentMethod: "midtrans", // 'midtrans' atau 'cash'
    paymentType: "full", // 'full' atau 'dp' (down payment)
  });
  const [loading, setLoading] = useState(false);

  const steps = [
    { number: 1, title: "Personal Info", description: "Your details" },
    { number: 2, title: "Booking Details", description: "Move-in & duration" },
    { number: 3, title: "Payment", description: "Complete payment" },
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
          durasi_sewa: parseInt(formData.duration),
        });

        // 2. Create Snap Token dengan payment type dan method
        const snapData = await api.createSnapToken({
          pemesanan_id: booking.id,
          payment_type: formData.paymentType, // 'full' atau 'dp'
          payment_method: formData.paymentMethod, // 'midtrans' atau 'cash'
        });

        // 3. Handle berbagai metode pembayaran
        if (formData.paymentMethod === "cash") {
          // Untuk cash payment, langsung tampilkan notifikasi
          toast.success("Pembayaran Cash berhasil dibuat!", {
            description:
              "Silakan hubungi admin untuk mengkonfirmasi pembayaran. Instruksi pembayaran sudah dikirim ke email Anda.",
            duration: 5000,
          });
          setBookingId(`#BK${booking.id}`);
          setBookingComplete(true);
          setLoading(false);
        } else {
          // Untuk Midtrans payment
          window.snap.pay(snapData.token, {
            onSuccess: function (result: any) {
              console.log("Payment Success:", result);
              setBookingId(`#BK${booking.id}`);
              setBookingComplete(true);
              setLoading(false);
            },
            onPending: function (result: any) {
              console.log("Payment Pending:", result);
              toast.info(
                "Pembayaran sedang diproses. Silakan selesaikan pembayaran Anda."
              );
              setBookingId(`#BK${booking.id}`);
              setBookingComplete(true);
              setLoading(false);
            },
            onError: function (result: any) {
              console.error("Payment Error:", result);
              toast.error("Gagal memproses pembayaran. Silakan coba lagi.");
              setLoading(false);
            },
            onClose: function () {
              setLoading(false);
            },
          });
        }
      } catch (err: any) {
        setLoading(false);
        toast.error(err.message || "Gagal membuat reservasi.");
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
              Your booking request has been submitted successfully. We&apos;ll
              review your payment and send a confirmation email within 24 hours.
            </p>
            <div className="space-y-3 p-6 bg-muted/50 rounded-lg mb-8 border border-border">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Booking ID:</span>
                <span className="font-medium text-foreground">{bookingId}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Name:</span>
                <span className="font-medium text-foreground">
                  {formData.fullName}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Email:</span>
                <span className="font-medium text-foreground">
                  {formData.email}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Move-in Date:</span>
                <span className="font-medium text-foreground">
                  {formData.moveInDate}
                </span>
              </div>
            </div>
            <Button
              onClick={onBack}
              className="w-full bg-primary hover:bg-primary/90 text-primary-foreground"
            >
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
                          placeholder="+1 (555) 123-4567"
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

                    <div className="space-y-2">
                      <Label htmlFor="duration">Rental Duration *</Label>
                      <Select
                        value={formData.duration}
                        onValueChange={(val) =>
                          handleInputChange("duration", val)
                        }
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

                    {/* Payment Method Selection */}
                    <div>
                      <Label className="text-base font-semibold mb-3 block">
                        Payment Method
                      </Label>
                      <div className="grid gap-3">
                        {/* Midtrans Option */}
                        <motion.div
                          whileHover={{ scale: 1.01 }}
                          whileTap={{ scale: 0.98 }}
                          onClick={() =>
                            handleInputChange("paymentMethod", "midtrans")
                          }
                          className={`p-4 border-2 rounded-xl cursor-pointer transition-all ${
                            formData.paymentMethod === "midtrans"
                              ? "border-primary bg-primary/5"
                              : "border-border bg-muted/50 hover:border-primary/50"
                          }`}
                        >
                          <div className="flex items-start gap-3">
                            <div
                              className={`w-5 h-5 rounded-full border-2 mt-1 flex items-center justify-center ${
                                formData.paymentMethod === "midtrans"
                                  ? "border-primary bg-primary"
                                  : "border-muted-foreground"
                              }`}
                            >
                              {formData.paymentMethod === "midtrans" && (
                                <Check className="w-3 h-3 text-white" />
                              )}
                            </div>
                            <div className="flex-1">
                              <p className="font-semibold text-sm">
                                Online Payment
                              </p>
                              <p className="text-xs text-muted-foreground">
                                Transfer Bank, GoPay, ShopeePay, Dana, Kartu
                                Kredit, dll
                              </p>
                            </div>
                            <div className="p-2 bg-blue-100 dark:bg-blue-950 rounded">
                              <CreditCard className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                            </div>
                          </div>
                        </motion.div>

                        {/* Cash Option */}
                        <motion.div
                          whileHover={{ scale: 1.01 }}
                          whileTap={{ scale: 0.98 }}
                          onClick={() =>
                            handleInputChange("paymentMethod", "cash")
                          }
                          className={`p-4 border-2 rounded-xl cursor-pointer transition-all ${
                            formData.paymentMethod === "cash"
                              ? "border-primary bg-primary/5"
                              : "border-border bg-muted/50 hover:border-primary/50"
                          }`}
                        >
                          <div className="flex items-start gap-3">
                            <div
                              className={`w-5 h-5 rounded-full border-2 mt-1 flex items-center justify-center ${
                                formData.paymentMethod === "cash"
                                  ? "border-primary bg-primary"
                                  : "border-muted-foreground"
                              }`}
                            >
                              {formData.paymentMethod === "cash" && (
                                <Check className="w-3 h-3 text-white" />
                              )}
                            </div>
                            <div className="flex-1">
                              <p className="font-semibold text-sm">
                                Cash Payment
                              </p>
                              <p className="text-xs text-muted-foreground">
                                Pembayaran tunai langsung ke admin (hubungi
                                untuk detail)
                              </p>
                            </div>
                            <div className="p-2 bg-green-100 dark:bg-green-950 rounded">
                              <DollarSign className="w-5 h-5 text-green-600 dark:text-green-400" />
                            </div>
                          </div>
                        </motion.div>
                      </div>
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
                          <span className="font-medium">$1,200</span>
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
                            Total Amount
                          </span>
                          <span className="font-medium">
                            $
                            {(
                              1200 * parseInt(formData.duration)
                            ).toLocaleString()}
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
                                  $
                                  {(
                                    1200 *
                                    parseInt(formData.duration) *
                                    0.3
                                  ).toLocaleString()}
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
                                $
                                {(
                                  1200 *
                                  parseInt(formData.duration) *
                                  0.7
                                ).toLocaleString()}
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
                              ? `$${(
                                  1200 *
                                  parseInt(formData.duration) *
                                  0.3
                                ).toLocaleString()}`
                              : `$${(
                                  1200 * parseInt(formData.duration)
                                ).toLocaleString()}`}
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Info Box */}
                    {formData.paymentMethod === "cash" && (
                      <div className="p-4 bg-amber-50 dark:bg-amber-950/30 rounded-lg border border-amber-200 dark:border-amber-900">
                        <p className="text-sm text-amber-900 dark:text-amber-200">
                          <strong>⚠️ Catatan:</strong> Setelah submit, Anda akan
                          menerima instruksi pembayaran dan kontak admin via
                          email untuk mengkonfirmasi pembayaran cash Anda.
                        </p>
                      </div>
                    )}

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
