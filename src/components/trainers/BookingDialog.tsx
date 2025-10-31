import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "sonner";

interface BookingDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  trainer: {
    id: string;
    business_name: string;
    hourly_rate: number | null;
    services_offered: string[];
  };
}

const BookingDialog = ({ open, onOpenChange, trainer }: BookingDialogProps) => {
  const [sessionType, setSessionType] = useState("");
  const [sessionDate, setSessionDate] = useState("");
  const [sessionTime, setSessionTime] = useState("");
  const [duration, setDuration] = useState("60");
  const [notes, setNotes] = useState("");
  const [loading, setLoading] = useState(false);

  const calculatePrice = () => {
    if (!trainer.hourly_rate) return 0;
    return (trainer.hourly_rate * parseInt(duration)) / 60;
  };

  const handleBooking = async () => {
    if (!sessionType || !sessionDate || !sessionTime) {
      toast.error("Please fill in all required fields");
      return;
    }

    setLoading(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        toast.error("Please log in to book a session");
        return;
      }

      const { error } = await supabase.from("trainer_bookings").insert({
        trainer_id: trainer.id,
        client_id: user.id,
        session_type: sessionType,
        session_date: sessionDate,
        session_time: sessionTime,
        duration_minutes: parseInt(duration),
        total_price: calculatePrice(),
        notes: notes || null,
      });

      if (error) throw error;

      toast.success("Booking request sent successfully!");
      onOpenChange(false);
      resetForm();
    } catch (error) {
      console.error("Error creating booking:", error);
      toast.error("Failed to create booking");
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setSessionType("");
    setSessionDate("");
    setSessionTime("");
    setDuration("60");
    setNotes("");
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Book a Session with {trainer.business_name}</DialogTitle>
          <DialogDescription>
            Choose your session type and preferred time
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div>
            <Label>Session Type *</Label>
            <Select value={sessionType} onValueChange={setSessionType}>
              <SelectTrigger>
                <SelectValue placeholder="Select session type" />
              </SelectTrigger>
              <SelectContent>
                {trainer.services_offered.map((service) => (
                  <SelectItem key={service} value={service}>
                    {service}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label>Date *</Label>
            <Input
              type="date"
              value={sessionDate}
              onChange={(e) => setSessionDate(e.target.value)}
              min={new Date().toISOString().split('T')[0]}
            />
          </div>

          <div>
            <Label>Time *</Label>
            <Input
              type="time"
              value={sessionTime}
              onChange={(e) => setSessionTime(e.target.value)}
            />
          </div>

          <div>
            <Label>Duration</Label>
            <Select value={duration} onValueChange={setDuration}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="30">30 minutes</SelectItem>
                <SelectItem value="60">1 hour</SelectItem>
                <SelectItem value="90">1.5 hours</SelectItem>
                <SelectItem value="120">2 hours</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label>Notes (Optional)</Label>
            <Textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Any special requests or information..."
              rows={3}
            />
          </div>

          {trainer.hourly_rate && (
            <div className="p-4 rounded-lg bg-muted">
              <div className="flex items-center justify-between text-lg font-semibold">
                <span>Total Price:</span>
                <span>${calculatePrice().toFixed(2)}</span>
              </div>
              <p className="text-xs text-muted-foreground mt-1">
                Payment will be processed upon trainer confirmation
              </p>
            </div>
          )}

          <Button
            className="w-full"
            onClick={handleBooking}
            disabled={loading}
          >
            {loading ? "Booking..." : "Confirm Booking"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default BookingDialog;
