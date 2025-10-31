import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Calendar, Clock, DollarSign, X } from "lucide-react";
import { toast } from "sonner";
import { format } from "date-fns";

interface Booking {
  id: string;
  session_type: string;
  session_date: string;
  session_time: string;
  duration_minutes: number;
  total_price: number;
  status: string;
  payment_status: string;
  notes: string | null;
  created_at: string;
  trainer_profiles: {
    business_name: string;
    profile_image_url: string | null;
  } | null;
}

const MyBookings = () => {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchBookings();
  }, []);

  const fetchBookings = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data, error } = await supabase
        .from("trainer_bookings")
        .select(`
          *,
          trainer_profiles(business_name, profile_image_url)
        `)
        .eq("client_id", user.id)
        .order("session_date", { ascending: false });

      if (error) throw error;
      setBookings(data || []);
    } catch (error) {
      console.error("Error fetching bookings:", error);
      toast.error("Failed to load bookings");
    } finally {
      setLoading(false);
    }
  };

  const cancelBooking = async (bookingId: string) => {
    try {
      const { error } = await supabase
        .from("trainer_bookings")
        .update({ status: "cancelled" })
        .eq("id", bookingId);

      if (error) throw error;

      toast.success("Booking cancelled");
      fetchBookings();
    } catch (error) {
      console.error("Error cancelling booking:", error);
      toast.error("Failed to cancel booking");
    }
  };

  const getStatusColor = (status: string) => {
    const colors: Record<string, string> = {
      pending: "bg-yellow-500/20 text-yellow-500",
      confirmed: "bg-green-500/20 text-green-500",
      completed: "bg-blue-500/20 text-blue-500",
      cancelled: "bg-red-500/20 text-red-500",
    };
    return colors[status] || "bg-gray-500/20 text-gray-500";
  };

  if (loading) {
    return <div className="text-center py-12">Loading bookings...</div>;
  }

  return (
    <div className="space-y-4">
      <Card className="backdrop-blur-sm bg-card/80">
        <CardHeader>
          <CardTitle>My Bookings</CardTitle>
        </CardHeader>
        <CardContent>
          {bookings.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">
              <Calendar className="w-12 h-12 mx-auto mb-4 opacity-50" />
              <p>No bookings yet</p>
              <p className="text-sm mt-2">Book a session with a trainer to get started!</p>
            </div>
          ) : (
            <div className="space-y-4">
              {bookings.map((booking) => (
                <Card key={booking.id} className="bg-muted/50">
                  <CardContent className="pt-6">
                    <div className="flex items-start gap-4">
                      <Avatar className="w-12 h-12">
                        <AvatarImage src={booking.trainer_profiles?.profile_image_url || ""} />
                        <AvatarFallback>
                          {booking.trainer_profiles?.business_name?.[0] || "T"}
                        </AvatarFallback>
                      </Avatar>

                      <div className="flex-1">
                        <div className="flex items-start justify-between mb-2">
                          <div>
                            <h4 className="font-semibold">
                              {booking.trainer_profiles?.business_name}
                            </h4>
                            <p className="text-sm text-muted-foreground">
                              {booking.session_type}
                            </p>
                          </div>
                          <Badge className={getStatusColor(booking.status)}>
                            {booking.status}
                          </Badge>
                        </div>

                        <div className="grid grid-cols-2 gap-4 mt-3">
                          <div className="flex items-center gap-2 text-sm">
                            <Calendar className="w-4 h-4 text-muted-foreground" />
                            {format(new Date(booking.session_date), "MMM d, yyyy")}
                          </div>
                          <div className="flex items-center gap-2 text-sm">
                            <Clock className="w-4 h-4 text-muted-foreground" />
                            {booking.session_time} ({booking.duration_minutes} min)
                          </div>
                          <div className="flex items-center gap-2 text-sm">
                            <DollarSign className="w-4 h-4 text-muted-foreground" />
                            ${booking.total_price.toFixed(2)}
                          </div>
                          <div className="text-sm">
                            <Badge variant="outline">{booking.payment_status}</Badge>
                          </div>
                        </div>

                        {booking.notes && (
                          <div className="mt-3 p-2 rounded bg-background text-sm">
                            <p className="text-muted-foreground">{booking.notes}</p>
                          </div>
                        )}

                        {booking.status === "pending" && (
                          <Button
                            variant="outline"
                            size="sm"
                            className="mt-3"
                            onClick={() => cancelBooking(booking.id)}
                          >
                            <X className="w-4 h-4 mr-2" />
                            Cancel Booking
                          </Button>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default MyBookings;
