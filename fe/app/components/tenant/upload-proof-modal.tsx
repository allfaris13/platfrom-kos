import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/app/components/ui/dialog";
import { Button } from "@/app/components/ui/button";
import { Input } from "@/app/components/ui/input";
import { Label } from "@/app/components/ui/label";
import { Loader2 } from "lucide-react";
import { api } from "@/app/services/api";
import { toast } from "sonner";

interface UploadProofModalProps {
  isOpen: boolean;
  onClose: () => void;
  paymentId: number;
  onSuccess: () => void;
}

export function UploadProofModal({
  isOpen,
  onClose,
  paymentId,
  onSuccess,
}: UploadProofModalProps) {
  const [file, setFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
    }
  };

  const handleUpload = async () => {
    if (!file) {
      toast.error("Please select a file first");
      return;
    }

    setLoading(true);
    try {
      await api.uploadPaymentProof(paymentId, file);
      toast.success("Proof uploaded successfully!");
      onSuccess();
      onClose();
    } catch (error: unknown) {
      let errorMessage = "Failed to upload proof";
      if (error instanceof Error) {
        errorMessage = error.message;
      }
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Upload Payment Proof</DialogTitle>
          <DialogDescription>
            Upload your bank transfer receipt to confirm your booking.
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4 py-4">
          <div className="p-4 bg-blue-50 dark:bg-blue-950/30 rounded-lg border border-blue-200 dark:border-blue-900">
             <p className="text-sm text-blue-800 dark:text-blue-300 mb-2">
               Silakan transfer ke rekening berikut:
             </p>
             <p className="font-bold text-lg text-blue-900 dark:text-blue-200">
               BCA 1234567890
             </p>
             <p className="text-xs text-blue-700 dark:text-blue-400">
               a.n. Koskosan Official
             </p>
          </div>
          <div className="space-y-2">
            <Label htmlFor="proof">Receipt Image (JPG/PNG)</Label>
            <Input
              id="proof"
              type="file"
              accept="image/*"
              onChange={handleFileChange}
            />
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={onClose} disabled={loading}>
            Cancel
          </Button>
          <Button onClick={handleUpload} disabled={!file || loading}>
            {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            {loading ? "Uploading..." : "Upload Proof"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
