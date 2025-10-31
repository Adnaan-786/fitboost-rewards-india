import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";
import { ArrowLeft, MapPin, Star, DollarSign, Award, Calendar, MessageCircle, Clock } from "lucide-react";
import { toast } from "sonner";
import { format } from "date-fns";
import BookingDialog from "@/components/trainers/BookingDialog";

interface Trainer {
  id: string;
  business_name: string;
  bio: string | null;
  specialties: string[];
  certifications: string[];
  years_experience: number | null;
  profile_image_url: string | null;
  cover_image_url: string | null;
  hourly_rate: number | null;
  location_address: string | null;
  location_city: string | null;
  location_state: string | null;
  services_offered: string[];
  availability_days: string[];
  rating: number;
  total_reviews: number;
  verified: boolean;
}

interface Review {
  id: string;
  rating: number;
  review_text: string | null;
  created_at: string;
}

const TrainerProfile = () => {
  const navigate = useNavigate();
  const { trainerId } = useParams();
  const [trainer, setTrainer] = useState<Trainer | null>(null);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);
  const [isBookingOpen, setIsBookingOpen] = useState(false);

  useEffect(() => {
    if (trainerId) {
      fetchTrainerProfile();
      fetchReviews();
    }
  }, [trainerId]);

  const fetchTrainerProfile = async () => {
    try {
      const { data, error } = await supabase
        .from("trainer_profiles")
        .select("*")
        .eq("id", trainerId)
        .single();

      if (error) throw error;
      setTrainer(data);
    } catch (error) {
      console.error("Error fetching trainer:", error);
      toast.error("Failed to load trainer profile");
    } finally {
      setLoading(false);
    }
  };

  const fetchReviews = async () => {
    try {
      const { data, error } = await supabase
        .from("trainer_reviews")
        .select("id, rating, review_text, created_at")
        .eq("trainer_id", trainerId)
        .order("created_at", { ascending: false })
        .limit(10);

      if (error) throw error;
      setReviews(data || []);
    } catch (error) {
      console.error("Error fetching reviews:", error);
    }
  };

  const startConversation = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user || !trainer) return;

      // Check if conversation exists
      const { data: existing } = await supabase
        .from("trainer_conversations")
        .select("id")
        .eq("trainer_id", trainer.id)
        .eq("client_id", user.id)
        .single();

      if (existing) {
        navigate("/trainers?tab=messages");
        return;
      }

      // Create new conversation
      const { error } = await supabase
        .from("trainer_conversations")
        .insert({
          trainer_id: trainer.id,
          client_id: user.id,
        });

      if (error) throw error;

      toast.success("Conversation started!");
      navigate("/trainers?tab=messages");
    } catch (error) {
      console.error("Error starting conversation:", error);
      toast.error("Failed to start conversation");
    }
  };

  if (loading) {
    return <div className="min-h-screen flex items-center justify-center">Loading...</div>;
  }

  if (!trainer) {
    return <div className="min-h-screen flex items-center justify-center">Trainer not found</div>;
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Cover Image */}
      {trainer.cover_image_url && (
        <div
          className="h-64 bg-cover bg-center"
          style={{ backgroundImage: `url(${trainer.cover_image_url})` }}
        />
      )}

      <div className="max-w-7xl mx-auto p-6">
        <Button
          variant="ghost"
          size="icon"
          onClick={() => navigate("/trainers")}
          className="mb-4"
        >
          <ArrowLeft className="w-5 h-5" />
        </Button>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column - Profile Info */}
          <div className="lg:col-span-2 space-y-6">
            {/* Header */}
            <Card className="backdrop-blur-sm bg-card/80">
              <CardContent className="pt-6">
                <div className="flex items-start gap-6">
                  <Avatar className="w-24 h-24">
                    <AvatarImage src={trainer.profile_image_url || ""} />
                    <AvatarFallback className="text-2xl">{trainer.business_name[0]}</AvatarFallback>
                  </Avatar>
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h1 className="text-3xl font-bold">{trainer.business_name}</h1>
                      {trainer.verified && (
                        <Badge className="bg-blue-500">
                          <Award className="w-4 h-4 mr-1" />
                          Verified
                        </Badge>
                      )}
                    </div>
                    <div className="flex items-center gap-4 text-muted-foreground">
                      <div className="flex items-center gap-1">
                        <MapPin className="w-4 h-4" />
                        {trainer.location_city}, {trainer.location_state}
                      </div>
                      {trainer.years_experience && (
                        <div className="flex items-center gap-1">
                          <Clock className="w-4 h-4" />
                          {trainer.years_experience} years experience
                        </div>
                      )}
                    </div>
                    <div className="flex items-center gap-2 mt-3">
                      <Star className="w-5 h-5 fill-yellow-400 text-yellow-400" />
                      <span className="text-xl font-semibold">{trainer.rating.toFixed(1)}</span>
                      <span className="text-muted-foreground">({trainer.total_reviews} reviews)</span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* About */}
            {trainer.bio && (
              <Card className="backdrop-blur-sm bg-card/80">
                <CardHeader>
                  <CardTitle>About</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground">{trainer.bio}</p>
                </CardContent>
              </Card>
            )}

            {/* Specialties */}
            {trainer.specialties.length > 0 && (
              <Card className="backdrop-blur-sm bg-card/80">
                <CardHeader>
                  <CardTitle>Specialties</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex flex-wrap gap-2">
                    {trainer.specialties.map((specialty, idx) => (
                      <Badge key={idx} variant="outline" className="px-3 py-1">
                        {specialty}
                      </Badge>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Certifications */}
            {trainer.certifications.length > 0 && (
              <Card className="backdrop-blur-sm bg-card/80">
                <CardHeader>
                  <CardTitle>Certifications</CardTitle>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-2">
                    {trainer.certifications.map((cert, idx) => (
                      <li key={idx} className="flex items-center gap-2">
                        <Award className="w-4 h-4 text-primary" />
                        {cert}
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
            )}

            {/* Reviews */}
            <Card className="backdrop-blur-sm bg-card/80">
              <CardHeader>
                <CardTitle>Reviews ({trainer.total_reviews})</CardTitle>
              </CardHeader>
              <CardContent>
                {reviews.length === 0 ? (
                  <p className="text-muted-foreground text-center py-8">
                    No reviews yet
                  </p>
                ) : (
                  <div className="space-y-4">
                    {reviews.map((review) => (
                      <div key={review.id}>
                        <div className="flex items-center gap-2 mb-2">
                          <div className="flex items-center">
                            {Array.from({ length: 5 }).map((_, i) => (
                              <Star
                                key={i}
                                className={`w-4 h-4 ${
                                  i < review.rating
                                    ? "fill-yellow-400 text-yellow-400"
                                    : "text-gray-300"
                                }`}
                              />
                            ))}
                          </div>
                          <span className="text-sm text-muted-foreground">
                            {format(new Date(review.created_at), "MMM d, yyyy")}
                          </span>
                        </div>
                        {review.review_text && (
                          <p className="text-sm text-muted-foreground">{review.review_text}</p>
                        )}
                        <Separator className="mt-4" />
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Right Column - Booking */}
          <div className="space-y-4">
            <Card className="backdrop-blur-sm bg-card/80 sticky top-6">
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <span>Book a Session</span>
                  {trainer.hourly_rate && (
                    <div className="flex items-center gap-1 text-2xl font-bold">
                      <DollarSign className="w-6 h-6" />
                      {trainer.hourly_rate}
                      <span className="text-sm text-muted-foreground font-normal">/hr</span>
                    </div>
                  )}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {trainer.services_offered.length > 0 && (
                  <div>
                    <h4 className="font-semibold mb-2 text-sm">Services Offered:</h4>
                    <ul className="space-y-1 text-sm text-muted-foreground">
                      {trainer.services_offered.map((service, idx) => (
                        <li key={idx}>• {service}</li>
                      ))}
                    </ul>
                  </div>
                )}

                {trainer.availability_days.length > 0 && (
                  <div>
                    <h4 className="font-semibold mb-2 text-sm">Available:</h4>
                    <div className="flex flex-wrap gap-1">
                      {trainer.availability_days.map((day, idx) => (
                        <Badge key={idx} variant="outline" className="text-xs">
                          {day}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}

                <Button
                  className="w-full"
                  size="lg"
                  onClick={() => setIsBookingOpen(true)}
                >
                  <Calendar className="w-4 h-4 mr-2" />
                  Book Now
                </Button>

                <Button
                  variant="outline"
                  className="w-full"
                  onClick={startConversation}
                >
                  <MessageCircle className="w-4 h-4 mr-2" />
                  Send Message
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      <BookingDialog
        open={isBookingOpen}
        onOpenChange={setIsBookingOpen}
        trainer={trainer}
      />
    </div>
  );
};

export default TrainerProfile;
